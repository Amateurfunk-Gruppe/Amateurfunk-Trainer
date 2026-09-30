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
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
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
    private TextView vorhangText;

    @Override protected void onCreate(Bundle zustand) {
        super.onCreate(zustand);
        getWindow().setStatusBarColor(Color.parseColor("#0F2745"));

        Intent dienst = new Intent(this, TrainerService.class);
        if (Build.VERSION.SDK_INT >= 26) startForegroundService(dienst); else startService(dienst);
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[] { Manifest.permission.POST_NOTIFICATIONS }, 1);
        }

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#0F2745"));
        FrameLayout wurzel = new FrameLayout(this);
        wurzel.addView(web, new FrameLayout.LayoutParams(-1, -1));
        vorhang = startbild();
        wurzel.addView(vorhang, new FrameLayout.LayoutParams(-1, -1));
        setContentView(wurzel);
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
        s.setUserAgentString(s.getUserAgentString() + " AmateurfunkTrainerApp" + (NodeStarter.tunnelProgramm(this) != null ? " Tunnel" : ""));

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
        LinearLayout f = new LinearLayout(this);
        f.setOrientation(LinearLayout.VERTICAL);
        f.setGravity(Gravity.CENTER);
        f.setBackgroundColor(Color.parseColor("#0F2745"));
        int pad = dp(32);
        f.setPadding(pad, pad, pad, pad);
        f.setClickable(true);

        ImageView zeichen = new ImageView(this);
        zeichen.setImageResource(R.mipmap.ic_launcher);
        f.addView(zeichen, new LinearLayout.LayoutParams(dp(112), dp(112)));

        TextView name = new TextView(this);
        name.setText("Amateurfunk-Trainer");
        name.setTextColor(Color.WHITE);
        name.setTextSize(TypedValue.COMPLEX_UNIT_SP, 30);
        name.setTypeface(Typeface.DEFAULT_BOLD);
        name.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-2, -2);
        lp.topMargin = dp(24);
        f.addView(name, lp);

        ProgressBar kreisel = new ProgressBar(this);
        kreisel.setIndeterminate(true);
        kreisel.setIndeterminateTintList(ColorStateList.valueOf(Color.parseColor("#5FD3C4")));
        LinearLayout.LayoutParams kp = new LinearLayout.LayoutParams(dp(44), dp(44));
        kp.topMargin = dp(32);
        f.addView(kreisel, kp);

        vorhangText = new TextView(this);
        vorhangText.setText("wird gestartet …");
        vorhangText.setTextColor(Color.parseColor("#D0DAE6"));
        vorhangText.setTextSize(TypedValue.COMPLEX_UNIT_SP, 18);
        vorhangText.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams tp = new LinearLayout.LayoutParams(-2, -2);
        tp.topMargin = dp(16);
        f.addView(vorhangText, tp);
        return f;
    }

    private int dp(int wert) {
        return Math.round(wert * getResources().getDisplayMetrics().density);
    }

    private void vorhangWeg() {
        if (vorhang == null || vorhang.getVisibility() != View.VISIBLE) return;
        vorhang.animate().alpha(0f).setDuration(250).withEndAction(() -> vorhang.setVisibility(View.GONE)).start();
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
        @JavascriptInterface public void neuStarten() {
            haupt.post(() -> NeustartActivity.neuStarten(MainActivity.this));
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
                if (ok) { geladen = true; web.loadUrl(ADRESSE); }
                else if (versuch < 400) {
                    // Beim allerersten Start packt die App erst aus.
                    if (versuch == 20 && vorhangText != null) vorhangText.setText("wird gestartet …\nBeim ersten Start dauert es etwas länger.");
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
    @Override public void onBackPressed() {
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
