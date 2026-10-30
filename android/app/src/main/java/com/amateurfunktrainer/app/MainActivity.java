package com.amateurfunktrainer.app;

import android.Manifest;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.content.ContentValues;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.content.res.ColorStateList;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.window.OnBackInvokedDispatcher;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Die Oberflaeche der App (29.09.2026): ein Browserfenster, das die
 * gewohnte Index.html vom Server auf diesem Handy zeigt
 * (http://127.0.0.1:3000). Links nach draussen - 50ohm.de, YouTube,
 * GitHub - gehen in den normalen Browser des Handys.
 */
public class MainActivity extends Activity {
    static final String ADRESSE = "http://127.0.0.1:3000/";
    private WebView web;
    private ValueCallback<Uri[]> dateiRueckruf;
    private PermissionRequest wartendeFreigabe;
    private final Handler haupt = new Handler(Looper.getMainLooper());
    private boolean geladen = false;
    // Die Stimme haengt seit dem 30.09.2026 am Prozess, nicht an der
    // Oberflaeche - siehe Stimme.java.
    private final Stimme.Melder stimmMelder = this::melden;
    private View vorhang;
    private boolean seiteHell = false;   // meldet die Seite ueber leiste(); fuer die eigenen Dialoge (29.10.2026)
    private String seiteFarbe = "#0f2b40";
    private TextView vorhangText;
    private View startFunki;          // Funki im Startbild (01.10.2026), siehe StartFunki.java
    private View wurzelAnsicht;       // der Rahmen um die Seite (Hintergrund = Farbe der Navigationsleiste ab Android 15)
    private boolean leisteVersteckt = false;   // Einstellung "Leiste unten ausblenden" (25.10.2026)

    private void leisteAnwenden() {
        try {
            Window w = getWindow();
            if (Build.VERSION.SDK_INT >= 30) {
                android.view.WindowInsetsController c = w.getInsetsController();
                if (c == null) return;
                c.setSystemBarsBehavior(android.view.WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                if (leisteVersteckt) c.hide(WindowInsets.Type.navigationBars());
                else c.show(WindowInsets.Type.navigationBars());
            } else {
                View dv = w.getDecorView();
                int v = dv.getSystemUiVisibility();
                int flags = View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
                dv.setSystemUiVisibility(leisteVersteckt ? (v | flags) : (v & ~flags));
            }
        } catch (Throwable e) { }
    }

    @Override public void onWindowFocusChanged(boolean fokus) {
        super.onWindowFocusChanged(fokus);
        if (fokus && leisteVersteckt) leisteAnwenden();   // Android holt die Leiste nach manchen Wechseln zurueck
    }

    @Override protected void onCreate(Bundle zustand) {
        super.onCreate(zustand);
        getWindow().setStatusBarColor(Color.parseColor("#0F2745"));
        // Navigationsleiste unten (25.10.2026, Dietmar: "die bleibt weiss im dunklen
        // Modus sieht ziemlich bloed aus"): im gleichen Dunkelblau wie der Kopf,
        // mit hellen Symbolen. Ohne das malt Android sie hell.
        try{
            Window fenster = getWindow();
            fenster.setNavigationBarColor(Color.parseColor("#0F2745"));
            if (Build.VERSION.SDK_INT >= 29) {
                fenster.setNavigationBarContrastEnforced(false);
                fenster.setNavigationBarDividerColor(Color.parseColor("#0F2745"));
            }
            if (Build.VERSION.SDK_INT >= 30) {
                fenster.getInsetsController().setSystemBarsAppearance(0,
                    android.view.WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS);
            } else if (Build.VERSION.SDK_INT >= 26) {
                View dv = fenster.getDecorView();
                dv.setSystemUiVisibility(dv.getSystemUiVisibility() & ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
            }
        }catch(Throwable e){}

        Intent dienst = new Intent(this, TrainerService.class);
        if (Build.VERSION.SDK_INT >= 26) startForegroundService(dienst); else startService(dienst);
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[] { Manifest.permission.POST_NOTIFICATIONS }, 1);
        }

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#0F2745"));
        FrameLayout wurzel = new FrameLayout(this);
        wurzelAnsicht = wurzel;
        wurzel.addView(web, new FrameLayout.LayoutParams(-1, -1));
        vorhang = startbild();
        wurzel.addView(vorhang, new FrameLayout.LayoutParams(-1, -1));
        setContentView(wurzel);
        // Android 15+ (targetSdk 36, 05.10.2026): Die App zeichnet jetzt bis
        // unter Statusleiste und Navigationsleiste. Damit nichts darunter
        // verschwindet, rueckt der Rahmen um genau diese Leisten (und die
        // Tastatur) ein - der Rand dahinter bleibt im Dunkelblau des Kopfes.
        if (Build.VERSION.SDK_INT >= 35) {
            wurzel.setBackgroundColor(Color.parseColor("#0F2745"));
            wurzel.setOnApplyWindowInsetsListener((v, ins) -> {
                android.graphics.Insets r = ins.getInsets(WindowInsets.Type.systemBars()
                    | WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
                v.setPadding(r.left, r.top, r.right, r.bottom);
                return WindowInsets.CONSUMED;
            });
        }
        // Zurueck-Geste ab Android 13 (Pflicht ab targetSdk 36 - dort ruft
        // Android onBackPressed nicht mehr auf). Gleicher Weg wie die Taste.
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::zurueck);
        }
        Stimme.anmelden(this, stimmMelder);
        web.addJavascriptInterface(new Sprache(), "AndroidSprache");
        web.addJavascriptInterface(new Datei(), "AndroidDatei");
        web.addJavascriptInterface(new AppSteuerung(), "AndroidApp");
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setSupportMultipleWindows(false);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setAllowFileAccess(false);
        s.setUserAgentString(s.getUserAgentString() + " AmateurfunkTrainerApp" + (NodeStarter.tunnelProgramm(this) != null ? " Tunnel" : "")
            + (BuildConfig.PLAY ? " PlayStore" : ""));

        web.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView v, String url) {
                if (url != null && url.startsWith("http://127.0.0.1")) vorhangWeg();
            }
            @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                String h = u.getHost();
                if ("127.0.0.1".equals(h) || "localhost".equals(h)) return false;
                if (u.getScheme() != null && u.getScheme().startsWith("http") || "mailto".equals(u.getScheme()) || "whatsapp".equals(u.getScheme())) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (ActivityNotFoundException e) { }
                    return true;
                }
                return true;
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            // Mikrofon fuer Sprachnachrichten
            @Override public void onPermissionRequest(final PermissionRequest anfrage) {
                haupt.post(new Runnable() { @Override public void run() {
                    if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                        anfrage.grant(anfrage.getResources());
                    } else {
                        wartendeFreigabe = anfrage;
                        requestPermissions(new String[] { Manifest.permission.RECORD_AUDIO }, 2);
                    }
                }});
            }
            // EIGENE DIALOGE STATT DER WEISSEN ANDROID-FENSTER (29.10.2026). Dietmar: "solche weissen,
            // schrecklichen Fenster, die mit dieser wunderschoenen App ueberhaupt nichts mehr zu tun haben."
            // alert(), confirm() und prompt() der Seite kommen hier an und werden als Blatt im Stil des
            // Trainers gezeigt - hell oder dunkel, je nachdem, was die Seite zuletzt gemeldet hat.
            @Override public boolean onJsAlert(WebView v, String url, String text, android.webkit.JsResult r) {
                dialog(text, null, false, (ok, eingabe) -> r.confirm()); return true;
            }
            @Override public boolean onJsConfirm(WebView v, String url, String text, android.webkit.JsResult r) {
                dialog(text, null, true, (ok, eingabe) -> { if (ok) r.confirm(); else r.cancel(); }); return true;
            }
            @Override public boolean onJsPrompt(WebView v, String url, String text, String vorgabe, android.webkit.JsPromptResult r) {
                dialog(text, vorgabe == null ? "" : vorgabe, true, (ok, eingabe) -> { if (ok) r.confirm(eingabe); else r.cancel(); }); return true;
            }
            // Bilder fuer den Chat, Lernstand einlesen
            @Override public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> rueckruf, FileChooserParams p) {
                if (dateiRueckruf != null) dateiRueckruf.onReceiveValue(null);
                dateiRueckruf = rueckruf;
                try {
                    startActivityForResult(p.createIntent(), 3);
                } catch (Exception e) {
                    dateiRueckruf = null;
                    return false;
                }
                return true;
            }
        });

        // Herunterladen (MP3, PDF, ...) ueber den Download-Manager des Handys.
        web.setDownloadListener((url, agent, inhalt, mime, laenge) -> {
            if (url == null) return;
            // Ein PDF vom eigenen Server (01.10.2026) - Dietmar: "Das
            // Formelblatt kann ich nicht downloaden. Das ist nicht da." Das
            // Browserfenster zeigt keine PDFs; statt eines stillen Downloads
            // geht die Datei an den Browser des Handys, der sie anzeigt oder
            // mit einem Klick oeffnet. Das Formelblatt selbst malt die App
            // inzwischen als Bild (PdfBild), hier geht es um alle anderen.
            if (url.startsWith("http://127.0.0.1") && url.replaceAll("[#?].*$", "").toLowerCase().endsWith(".pdf")) {
                try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url.replaceAll("#.*$", "")))); return; }
                catch (ActivityNotFoundException e) { }
            }
            if (url.startsWith("blob:") || url.startsWith("data:")) {
                // Vom Trainer selbst erzeugt (Lernstand sichern, Auswertung als
                // CSV ...): im Browserfenster auslesen und ueber AndroidDatei
                // in "Downloads" ablegen.
                String name = URLUtil.guessFileName(url, inhalt, mime);
                if (name == null || name.startsWith("downloadfile")) name = "Amateurfunk-Trainer" + endungFuer(mime);
                String js = "(function(){fetch(" + jsText(url) + ").then(function(r){return r.blob();}).then(function(b){"
                    + "var f=new FileReader();f.onload=function(){AndroidDatei.speichern(" + jsText(name) + ",f.result);};f.readAsDataURL(b);});})()";
                web.evaluateJavascript(js, null);
                return;
            }
            try {
                String name = URLUtil.guessFileName(url, inhalt, mime);
                DownloadManager.Request r = new DownloadManager.Request(Uri.parse(url));
                r.setMimeType(mime);
                r.setTitle(name);
                r.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                r.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, name);
                ((DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE)).enqueue(r);
                Toast.makeText(this, "Wird heruntergeladen: " + name, Toast.LENGTH_SHORT).show();
            } catch (Exception e) {
                Toast.makeText(this, "Download nicht möglich.", Toast.LENGTH_LONG).show();
            }
        });

        aufServerWarten(0);
    }

    // ================================================================
    //  STARTBILD                                         (29.09.2026)
    //  Dietmar, mit Bild vom Start: "Beim Start ist Amateurfunk-Trainer
    //  viel zu klein." Vorher war das eine kleine Seite im Browserfenster,
    //  und das zeigte sie trotz Angabe winzig. Jetzt ist es ein Bild der
    //  App selbst (Zeichen, Name, Kreisel) - Groessen in sp, also so gross
    //  wie andere Schrift auf dem Handy. Es verschwindet, sobald der
    //  Trainer geladen ist.
    // ================================================================
    private View startbild() {
        // STARTBILD: MAJA IM RAKETENANZUG IM WELTRAUM (29.10.2026, Master 2). Dietmar: "Ich moechte
        // aber im Hintergrund den Weltraum so wie bei der Rakete" - "die lange Version einbauen".
        // Das ganze Bild (Verlauf, funkelnde Sterne, Maja, Schriftzug, LOADING-Anzeige) liegt in
        // res/raw/funki_start.html und fuellt das Browserfenster bildschirmfuellend. Dauert der
        // Start laenger als die Animation, bleibt das letzte Bild stehen, der Balken kriecht weiter.
        // Im Stil Sachlich (StartFunki.bild liefert dort nichts) bleibt das schlichte Bild mit Zeichen.
        FrameLayout rahmen = new FrameLayout(this);
        rahmen.setBackgroundColor(Color.parseColor("#0e1646"));
        rahmen.setClickable(true);
        View probe = StartFunki.bild(this);
        boolean verspielt = probe != null;
        if (probe != null) StartFunki.freigeben(probe);
        if (verspielt) {
            try {
                WebView w = new WebView(this);
                w.setBackgroundColor(Color.TRANSPARENT);
                w.getSettings().setJavaScriptEnabled(true);
                w.getSettings().setAllowFileAccess(true);
                w.setVerticalScrollBarEnabled(false); w.setHorizontalScrollBarEnabled(false);
                w.setOverScrollMode(View.OVER_SCROLL_NEVER);
                w.loadUrl("file:///android_res/raw/funki_start.html");
                startFunki = w;
                rahmen.addView(w, new FrameLayout.LayoutParams(-1, -1));
            } catch (Throwable e) { startFunki = null; verspielt = false; }
        }
        if (!verspielt) {
            LinearLayout f = new LinearLayout(this);
            f.setOrientation(LinearLayout.VERTICAL); f.setGravity(Gravity.CENTER);
            ImageView zeichen = new ImageView(this);
            zeichen.setImageResource(R.mipmap.ic_launcher);
            f.addView(zeichen, new LinearLayout.LayoutParams(dp(112), dp(112)));
            TextView name = new TextView(this);
            name.setText("Amateurfunk-Trainer"); name.setTextColor(Color.WHITE);
            name.setTextSize(TypedValue.COMPLEX_UNIT_SP, 30); name.setTypeface(Typeface.DEFAULT_BOLD); name.setGravity(Gravity.CENTER);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-2, -2); lp.topMargin = dp(24);
            f.addView(name, lp);
            rahmen.addView(f, new FrameLayout.LayoutParams(-1, -1));
        }
        // Hinweise bei Startproblemen (unten), sonst leer
        vorhangText = new TextView(this);
        vorhangText.setText("");
        vorhangText.setTextColor(Color.parseColor("#D0DAE6"));
        vorhangText.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15);
        vorhangText.setGravity(Gravity.CENTER);
        vorhangText.setPadding(dp(24), 0, dp(24), dp(40));
        FrameLayout.LayoutParams tp = new FrameLayout.LayoutParams(-1, -2, Gravity.BOTTOM);
        rahmen.addView(vorhangText, tp);
        vorhangSeit = SystemClock.uptimeMillis();
        return rahmen;
    }

    interface DialogAntwort { void fertig(boolean ok, String eingabe); }
    /** Ein Blatt im Stil des Trainers: abgerundet, hell oder dunkel wie die Seite, Knoepfe in Tuerkis. */
    private void dialog(String text, String vorgabe, boolean abbrechen, DialogAntwort antwort) {
        final boolean hell = seiteHell;
        final int grund = hell ? Color.WHITE : Color.parseColor("#0f2b40");
        final int schrift = hell ? Color.parseColor("#14213d") : Color.parseColor("#eaeff4");
        final int rand = hell ? Color.parseColor("#d5dcec") : Color.parseColor("#2b5471");
        final int akzent = hell ? Color.parseColor("#0f2745") : Color.parseColor("#5fd3c4");
        final int akzentSchrift = hell ? Color.WHITE : Color.parseColor("#04283a");
        final android.app.Dialog d = new android.app.Dialog(this);
        d.requestWindowFeature(Window.FEATURE_NO_TITLE);
        LinearLayout blatt = new LinearLayout(this);
        blatt.setOrientation(LinearLayout.VERTICAL);
        GradientDrawable form = new GradientDrawable();
        form.setColor(grund); form.setCornerRadius(dp(22)); form.setStroke(dp(1), rand);
        blatt.setBackground(form);
        blatt.setPadding(dp(22), dp(20), dp(22), dp(14));
        TextView t = new TextView(this);
        t.setText(text == null ? "" : text); t.setTextColor(schrift); t.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16); t.setLineSpacing(0, 1.25f);
        blatt.addView(t, new LinearLayout.LayoutParams(-1, -2));
        final android.widget.EditText feld;
        if (vorgabe != null) {
            feld = new android.widget.EditText(this);
            feld.setText(vorgabe); feld.setTextColor(schrift); feld.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
            feld.setHintTextColor(rand); feld.setBackgroundTintList(ColorStateList.valueOf(akzent));
            LinearLayout.LayoutParams fp = new LinearLayout.LayoutParams(-1, -2); fp.topMargin = dp(10);
            blatt.addView(feld, fp);
        } else feld = null;
        LinearLayout zeile = new LinearLayout(this);
        zeile.setOrientation(LinearLayout.HORIZONTAL); zeile.setGravity(Gravity.END);
        LinearLayout.LayoutParams zp = new LinearLayout.LayoutParams(-1, -2); zp.topMargin = dp(18);
        if (abbrechen) {
            TextView nein = knopf("Abbrechen", Color.TRANSPARENT, hell ? Color.parseColor("#4b5b73") : Color.parseColor("#b3cbdb"), rand);
            nein.setOnClickListener(x -> { d.dismiss(); antwort.fertig(false, null); });
            LinearLayout.LayoutParams np = new LinearLayout.LayoutParams(-2, -2); np.rightMargin = dp(8);
            zeile.addView(nein, np);
        }
        TextView ja = knopf("OK", akzent, akzentSchrift, akzent);
        ja.setOnClickListener(x -> { d.dismiss(); antwort.fertig(true, feld == null ? null : feld.getText().toString()); });
        zeile.addView(ja, new LinearLayout.LayoutParams(-2, -2));
        blatt.addView(zeile, zp);
        d.setContentView(blatt);
        d.setCancelable(abbrechen);
        d.setOnCancelListener(x -> antwort.fertig(false, null));
        Window w = d.getWindow();
        if (w != null) {
            w.setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(Color.TRANSPARENT));
            w.setLayout(Math.min(dp(420), getResources().getDisplayMetrics().widthPixels - dp(32)), -2);
            w.setDimAmount(0.55f);
        }
        try { d.show(); } catch (Exception e) { antwort.fertig(false, null); }
    }
    private TextView knopf(String text, int grund, int schrift, int rand) {
        TextView k = new TextView(this);
        k.setText(text); k.setTextColor(schrift); k.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15); k.setTypeface(Typeface.DEFAULT_BOLD);
        k.setPadding(dp(18), dp(10), dp(18), dp(10)); k.setGravity(Gravity.CENTER); k.setClickable(true); k.setFocusable(true);
        GradientDrawable f = new GradientDrawable(); f.setColor(grund); f.setCornerRadius(dp(14)); f.setStroke(dp(1), rand);
        k.setBackground(f);
        return k;
    }

    private int dp(int wert) {
        return Math.round(wert * getResources().getDisplayMetrics().density);
    }

    private long vorhangSeit = 0;
    private boolean vorhangGeht = false;
    private void vorhangWeg() {
        if (vorhang == null || vorhang.getVisibility() != View.VISIBLE || vorhangGeht) return;
        // Die Animation (3,3 s) darf zu Ende laufen, auch wenn die App frueher fertig ist (29.10.2026)
        long rest = 3300 - (SystemClock.uptimeMillis() - vorhangSeit);
        if (rest > 0) { haupt.postDelayed(this::vorhangWeg, rest); return; }
        vorhangGeht = true;
        if (startFunki instanceof WebView) { try { ((WebView) startFunki).evaluateJavascript("window.voll&&voll()", null); } catch (Throwable e) { } }
        vorhang.animate().alpha(0f).setDuration(250).setStartDelay(250).withEndAction(() -> {
            vorhang.setVisibility(View.GONE);
            if (startFunki instanceof WebView) { try { ((WebView) startFunki).destroy(); } catch (Throwable e) { } }
            startFunki = null;
        }).start();
    }

    // ================================================================
    //  ZWISCHENSPEICHER BEI NEUER APP-VERSION LEEREN      (29.10.2026)
    //  Dietmar: "Kann man das so einbauen, dass, wenn es ein Update gibt,
    //  automatisch der Cache geloescht wird?" Die App merkt sich den
    //  versionCode, mit dem sie zuletzt lief. Ist er neu, leert sie einmal
    //  den Speicher des Browserfensters (Seiten, Skripte, Bilder), bevor
    //  der Trainer geladen wird. localStorage (Lernstand, Einstellungen)
    //  bleibt unberuehrt. Die Seite selbst macht dasselbe fuer ihren
    //  Service Worker (Index.html, Stand 378).
    // ================================================================
    private void neueVersionAufraeumen() {
        try {
            android.content.pm.PackageInfo pi = getPackageManager().getPackageInfo(getPackageName(), 0);
            long code = Build.VERSION.SDK_INT >= 28 ? pi.getLongVersionCode() : (long) pi.versionCode;
            android.content.SharedPreferences sp = getSharedPreferences("trainer", MODE_PRIVATE);
            long alt = sp.getLong("version_gesehen", -1L);
            if (alt == code) return;
            if (alt != -1L && web != null) {
                try { web.clearCache(true); } catch (Throwable e) { }
            }
            sp.edit().putLong("version_gesehen", code).apply();
        } catch (Throwable e) { }
    }

    // ================================================================
    //  SPRACHAUSGABE DES HANDYS                          (29.09.2026)
    //  Dietmar: "So richtig angepasst fuer Android ist es nicht." Unter
    //  anderem: "Fuer das Vorlesen fehlt noch die Sprachausgabe" - Piper
    //  gibt es auf dem Handy nicht. Dafuer hat jedes Android eine eigene
    //  Stimme. Sie nimmt den Text (vom Server schon ausgeschrieben, siehe
    //  Index.html "ANDROID-APP") und schreibt eine WAV-Datei; der Browser
    //  holt sie ueber /api/android-tts ab und spielt sie wie bisher.
    //  Seit dem 30.09.2026 liegt die Verbindung zum Sprachmodul in
    //  Stimme.java (eine je Prozess) - Dietmar: "Oeffne ich ein zweites
    //  Mal die App, ist die Stimme nicht da."
    // ================================================================
    private void melden(final String id, final boolean ok) {
        haupt.post(() -> { if (web != null) web.evaluateJavascript("window.__androidTtsFertig&&window.__androidTtsFertig(" + jsText(id) + "," + ok + ")", null); });
    }

    /** Fuer die Seite: nach einem Update mit Programmdateien neu starten
     *  (29.09.2026, Knopf "Jetzt neu starten" im Update-Fenster). */
    class AppSteuerung {
        /** Bildschirm anlassen (25.10.2026). Dietmar: "In der Android Version
         *  blinkt das Display bei meiner Frau ihrem Samsung Handy. Bei mir
         *  uebrigens auch." - der Bildschirm dunkelte beim Lernen ab, sobald
         *  man eine Weile nichts antippt (zum Beispiel beim Zuhoeren). Die
         *  Seite schaltet das hier an oder aus (Einstellungen -> Allgemein). */
        @JavascriptInterface public void bildschirmAn(final boolean an) {
            haupt.post(() -> {
                try {
                    if (an) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                    else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                } catch (Exception e) { }
            });
        }
        /** Farbe der Navigationsleiste unten (25.10.2026, Dietmar: "Die Leiste soll sich nach der Farbe
         *  dann anpassen"). Die Seite liest ihren Hintergrund ab und meldet ihn; hell = dunkle Symbole. */
        @JavascriptInterface public void leiste(final String hex, final boolean hell) {
            haupt.post(() -> {
                try {
                    int farbe = Color.parseColor(hex);
                    seiteHell = hell; seiteFarbe = hex;
                    Window w = getWindow();
                    w.setNavigationBarColor(farbe);
                    if (wurzelAnsicht != null) wurzelAnsicht.setBackgroundColor(farbe);
                    if (Build.VERSION.SDK_INT >= 30) {
                        int an = hell ? android.view.WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS : 0;
                        w.getInsetsController().setSystemBarsAppearance(an,
                            android.view.WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS);
                    } else if (Build.VERSION.SDK_INT >= 26) {
                        View dv = w.getDecorView();
                        int v = dv.getSystemUiVisibility();
                        dv.setSystemUiVisibility(hell ? (v | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR) : (v & ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR));
                    }
                } catch (Throwable e) { }
            });
        }
        /** Navigationsleiste ausblenden (25.10.2026, Dietmar: "In den Einstellungen sollte man diese
         *  Leiste auch ausblenden koennen"). Ein Wisch vom unteren Rand holt sie kurz zurueck. */
        @JavascriptInterface public void leisteAus(final boolean aus) {
            haupt.post(() -> { leisteVersteckt = aus; leisteAnwenden(); });
        }
        /** Energiesparmodus des Handys (29.10.2026, Reiter Energie). Die Seite fragt beim Start und beim
         *  Zurueckkommen nach; sie schaltet dann von selbst in den ruhigen Modus. */
        @JavascriptInterface public boolean sparmodus() {
            try {
                android.os.PowerManager pm = (android.os.PowerManager) getSystemService(POWER_SERVICE);
                return pm != null && pm.isPowerSaveMode();
            } catch (Throwable e) { return false; }
        }
        /** Oeffnet die Akku-Einstellung des Handys, wo man den Sparmodus ausschalten kann. Abschalten
         *  darf die App ihn nicht selbst. */
        @JavascriptInterface public void akkuEinstellungen() {
            haupt.post(() -> {
                try { startActivity(new Intent(android.provider.Settings.ACTION_BATTERY_SAVER_SETTINGS)); }
                catch (Throwable e) { try { startActivity(new Intent(android.provider.Settings.ACTION_SETTINGS)); } catch (Throwable e2) { } }
            });
        }
        @JavascriptInterface public void neuStarten() {
            haupt.post(() -> NeustartActivity.neuStarten(MainActivity.this));
        }
        /** Der Stil der Seite, fuer das Startbild beim naechsten Start (StartFunki). */
        @JavascriptInterface public void stilMerken(String stil) {
            StartFunki.stilMerken(MainActivity.this, stil);
        }
        /** Formelblatt in der App (01.10.2026): eine PDF-Seite als Bild, siehe PdfBild. */
        @JavascriptInterface public String pdfSeite(String datei, int seite, int breite) {
            return PdfBild.seite(MainActivity.this, datei, seite, breite);
        }
        @JavascriptInterface public int pdfSeiten(String datei) {
            return PdfBild.seiten(MainActivity.this, datei);
        }
        /** Durchgehendes Blaettern (01.10.2026): Seiten im Hintergrund zeichnen, Bild kommt per __pdfBild(id, verhaeltnis, bild). */
        @JavascriptInterface public void pdfFenster(int von, int bis) { PdfBild.fenster(von, bis); }
        @JavascriptInterface public void pdfSeiteHolen(String datei, int seite, int breite, int id) {
            PdfBild.anfordern(MainActivity.this, datei, seite, breite, id, new PdfBild.Rueckruf() {
                @Override public void fertig(final int i, final double v, final String bild) {
                    haupt.post(new Runnable() {
                        @Override public void run() {
                            if (web != null) web.evaluateJavascript("window.__pdfBild&&window.__pdfBild(" + i + "," + v + "," + jsText(bild) + ")", null);
                        }
                    });
                }
            });
        }
        /** Folien des DARC laden und zeigen (01.10.2026), siehe Folien.java */
        @JavascriptInterface public long folienGroesse(String name) { return Folien.groesse(MainActivity.this, name); }
        @JavascriptInterface public String folienLaeuft() { return Folien.laeuft(); }
        @JavascriptInterface public void folienAbbrechen() { Folien.abbrechen(); }
        @JavascriptInterface public boolean folienEntfernen(String name) { return Folien.entfernen(MainActivity.this, name); }
        @JavascriptInterface public void folienLaden(String name) {
            Folien.laden(MainActivity.this, name, new Folien.Stand() {
                @Override public void melden(final String n, final long bytes, final long gesamt, final String status, final String text) {
                    haupt.post(new Runnable() {
                        @Override public void run() {
                            if (web != null) web.evaluateJavascript("window.__folienStand&&window.__folienStand(" + jsText(n) + "," + bytes + "," + gesamt + "," + jsText(status) + "," + jsText(text) + ")", null);
                        }
                    });
                }
            });
        }
    }

    class Sprache {
        @JavascriptInterface public boolean bereit() { return Stimme.istBereit(); }
        @JavascriptInterface public void synthese(String id, String text) {
            if (id == null || text == null || !id.matches("t[a-z0-9]{6,30}")) { melden(id, false); return; }
            File f = new File(NodeStarter.sprachOrdner(MainActivity.this), id + ".wav");
            String t = text.length() > 3900 ? text.substring(0, 3900) : text;
            if (!Stimme.aufnehmen(MainActivity.this, id, t, f)) melden(id, false);
        }
        /** Woran es liegt, wenn nichts kommt - fuer den Hinweis in der Seite. */
        @JavascriptInterface public String zustand() { return Stimme.zustand(); }
        // Stimmenwahl (23.10.2026) - siehe Stimme.java.
        @JavascriptInterface public String stimmen() { return Stimme.stimmen(); }
        @JavascriptInterface public boolean waehlen(String name) { return Stimme.waehlen(name); }
        @JavascriptInterface public boolean probe(String text) { return Stimme.probe(text); }
        // Modulwahl (25.10.2026): Google, Samsung, Acapela ...
        @JavascriptInterface public String module() { return Stimme.module(); }
        @JavascriptInterface public boolean modulWaehlen(String paket) { return Stimme.modulWaehlen(paket); }
    }

    class Datei {
        @JavascriptInterface public void speichern(String name, String datenUrl) {
            try {
                int komma = datenUrl.indexOf(',');
                byte[] daten = Base64.decode(datenUrl.substring(komma + 1), Base64.DEFAULT);
                String sauber = name.replaceAll("[\\\\/:*?\"<>|]", "_");
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues v = new ContentValues();
                    v.put(MediaStore.Downloads.DISPLAY_NAME, sauber);
                    Uri u = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                    try (OutputStream out = getContentResolver().openOutputStream(u)) { out.write(daten); }
                } else {
                    File ziel = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), sauber);
                    try (OutputStream out = new FileOutputStream(ziel)) { out.write(daten); }
                }
                haupt.post(() -> Toast.makeText(MainActivity.this, "Gespeichert unter Downloads: " + sauber, Toast.LENGTH_LONG).show());
            } catch (Exception e) {
                haupt.post(() -> Toast.makeText(MainActivity.this, "Speichern nicht möglich.", Toast.LENGTH_LONG).show());
            }
        }

        // ============================================================
        //  TAEGLICHE SICHERUNG IN EINE DATEI              (Stand 390)
        //  Dietmar, 30.10.2026: "wenn die App den Lernstand jeden Tag
        //  einmal speichert, dann muss er eine alte Datei ueberschreiben
        //  und nicht jedes Mal eine neue Datei anlegen" - "3 Monate
        //  taeglich ... ueber 90 Eintraege". Und: "Vielleicht kann man
        //  den Lernstand auch intern in der App ablegen."
        //  Darum zwei Orte, beide werden UEBERSCHRIEBEN:
        //   1. intern: files/lernstand/sicherung.json - ueberlebt Updates
        //      und "Cache leeren"; ueber die Android-Sicherung (Google)
        //      kommt sie nach einer Neuinstallation zurueck.
        //   2. Downloads/Amateurfunk-Trainer/Lernstand-Sicherung.json -
        //      ueberlebt auch das Deinstallieren. Die Adresse der Datei
        //      merkt sich die App; nach einer Neuinstallation darf Android
        //      die alte nicht mehr ueberschreiben, dann entsteht einmalig
        //      eine neue, die ab da ueberschrieben wird.
        //  Ohne Meldung - das geschieht still im Hintergrund.
        // ============================================================
        @JavascriptInterface public boolean internSchreiben(String text) {
            try {
                File ordner = new File(getFilesDir(), "lernstand");
                if (!ordner.exists()) ordner.mkdirs();
                File neu = new File(ordner, "sicherung.neu"), ziel = new File(ordner, "sicherung.json");
                try (OutputStream out = new FileOutputStream(neu)) { out.write(text.getBytes("UTF-8")); }
                return neu.renameTo(ziel) || (ziel.delete() && neu.renameTo(ziel));   // erst ganz schreiben, dann tauschen
            } catch (Exception e) { return false; }
        }
        @JavascriptInterface public String internLesen() {
            try {
                File ziel = new File(new File(getFilesDir(), "lernstand"), "sicherung.json");
                if (!ziel.exists()) return "";
                byte[] b = new byte[(int) ziel.length()];
                try (java.io.FileInputStream in = new java.io.FileInputStream(ziel)) { int n = 0; while (n < b.length) { int r = in.read(b, n, b.length - n); if (r < 0) break; n += r; } }
                return new String(b, "UTF-8");
            } catch (Exception e) { return ""; }
        }
        @JavascriptInterface public String dateiSchreiben(String text) {
            final String name = "Lernstand-Sicherung.json";
            try {
                byte[] daten = text.getBytes("UTF-8");
                android.content.SharedPreferences sp = getSharedPreferences("trainer", MODE_PRIVATE);
                if (Build.VERSION.SDK_INT >= 29) {
                    String alt = sp.getString("sicherung_uri", "");
                    if (!alt.isEmpty()) {
                        try (OutputStream out = getContentResolver().openOutputStream(Uri.parse(alt), "wt")) {
                            if (out != null) { out.write(daten); return "ok"; }
                        } catch (Exception e) { /* geloescht oder nicht mehr unsere - neu anlegen */ }
                    }
                    ContentValues v = new ContentValues();
                    v.put(MediaStore.Downloads.DISPLAY_NAME, name);
                    v.put(MediaStore.Downloads.MIME_TYPE, "application/json");
                    v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Amateurfunk-Trainer");
                    Uri u = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                    if (u == null) return "fehler";
                    try (OutputStream out = getContentResolver().openOutputStream(u)) { out.write(daten); }
                    sp.edit().putString("sicherung_uri", u.toString()).apply();
                    return "neu";
                } else {
                    File ordner = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "Amateurfunk-Trainer");
                    if (!ordner.exists()) ordner.mkdirs();
                    try (OutputStream out = new FileOutputStream(new File(ordner, name))) { out.write(daten); }
                    return "ok";
                }
            } catch (Exception e) { return "fehler"; }
        }
    }

    private static String endungFuer(String mime) {
        if (mime == null) return "";
        if (mime.contains("json")) return ".json";
        if (mime.contains("csv")) return ".csv";
        if (mime.contains("pdf")) return ".pdf";
        if (mime.contains("html")) return ".html";
        if (mime.contains("mpeg")) return ".mp3";
        if (mime.contains("text")) return ".txt";
        return "";
    }

    private static String jsText(String s) {
        if (s == null) return "''";
        return "'" + s.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n").replace("\r", "") + "'";
    }

    @Override protected void onDestroy() {
        // Die Verbindung zum Sprachmodul bleibt bestehen (Stimme.java) -
        // nur die Rueckmeldungen gehen nicht mehr an diese Oberflaeche.
        Stimme.abmelden(stimmMelder);
        super.onDestroy();
    }

    /** Fragt alle 300 ms, ob der Server schon antwortet - beim ersten Start
     *  packt die App erst den Trainer aus, das dauert ein paar Sekunden. */
    private void aufServerWarten(final int versuch) {
        new Thread(() -> {
            boolean da = false;
            try {
                HttpURLConnection c = (HttpURLConnection) new URL(ADRESSE + "api/version").openConnection();
                c.setConnectTimeout(500);
                c.setReadTimeout(1500);
                da = c.getResponseCode() == 200;
                c.disconnect();
            } catch (Exception e) { }
            final boolean ok = da;
            haupt.postDelayed(() -> {
                if (ok) { geladen = true; neueVersionAufraeumen(); web.loadUrl(ADRESSE); }
                else if (versuch < 400) {
                    // Beim allerersten Start packt die App erst aus.
                    if (versuch == 20 && vorhangText != null) vorhangText.setText("Beim ersten Start dauert es etwas länger …");
                    aufServerWarten(versuch + 1);
                }
                else if (vorhangText != null) vorhangText.setText("Der Trainer startet nicht.\nBitte die App ganz schließen (Benachrichtigung „Beenden“) und neu öffnen.");
            }, ok ? 0 : 300);
        }).start();
    }

    @Override protected void onActivityResult(int code, int ergebnis, Intent daten) {
        if (code == 3 && dateiRueckruf != null) {
            dateiRueckruf.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(ergebnis, daten));
            dateiRueckruf = null;
            return;
        }
        super.onActivityResult(code, ergebnis, daten);
    }

    @Override public void onRequestPermissionsResult(int code, String[] rechte, int[] antworten) {
        if (code == 2 && wartendeFreigabe != null) {
            if (antworten.length > 0 && antworten[0] == PackageManager.PERMISSION_GRANTED) wartendeFreigabe.grant(wartendeFreigabe.getResources());
            else wartendeFreigabe.deny();
            wartendeFreigabe = null;
        }
        super.onRequestPermissionsResult(code, rechte, antworten);
    }

    /** Zurueck-Taste (30.09.2026): Erst fragt die App die Seite, ob sie etwas
     *  zu schliessen hat - das Blatt "Mehr", die Suche, ein Fenster, den Chat
     *  (window.appZurueck im Skript "appRahmen"). Nur wenn nicht, geht die App
     *  wie bisher in den Hintergrund. Beendet wird nie - der Server soll
     *  weiterlaufen. */
    @Override public void onBackPressed() { zurueck(); }

    private void zurueck() {
        if (web != null && geladen) {
            web.evaluateJavascript(
                "(function(){try{return !!(window.appZurueck && window.appZurueck());}catch(e){return false;}})()",
                antwort -> {
                    if ("true".equals(antwort)) return;
                    if (web.canGoBack()) { web.goBack(); return; }
                    moveTaskToBack(true);
                });
            return;
        }
        moveTaskToBack(true);
    }
}
