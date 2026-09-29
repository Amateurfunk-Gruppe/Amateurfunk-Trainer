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
import android.webkit.PermissionRequest;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

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

    @Override protected void onCreate(Bundle zustand) {
        super.onCreate(zustand);
        getWindow().setStatusBarColor(Color.parseColor("#0F2745"));

        Intent dienst = new Intent(this, TrainerService.class);
        if (Build.VERSION.SDK_INT >= 26) startForegroundService(dienst); else startService(dienst);
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[] { Manifest.permission.POST_NOTIFICATIONS }, 1);
        }

        web = new WebView(this);
        setContentView(web);
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
        s.setUserAgentString(s.getUserAgentString() + " AmateurfunkTrainerApp");

        web.setWebViewClient(new WebViewClient() {
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
            if (url == null || url.startsWith("blob:") || url.startsWith("data:")) {
                Toast.makeText(this, "Dieser Download geht in der App noch nicht – bitte im Browser des Handys öffnen.", Toast.LENGTH_LONG).show();
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

        web.loadDataWithBaseURL(null,
            "<html><body style='margin:0;height:100vh;display:flex;align-items:center;justify-content:center;"
          + "background:#0F2745;color:#fff;font-family:sans-serif;text-align:center'>"
          + "<div><div style='font-size:22px;font-weight:700'>Amateurfunk-Trainer</div>"
          + "<div style='margin-top:12px;opacity:.8'>wird gestartet …</div></div></body></html>",
            "text/html", "utf-8", null);
        aufServerWarten(0);
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
                else if (versuch < 400) aufServerWarten(versuch + 1);
                else web.loadDataWithBaseURL(null, "<p style='font-family:sans-serif;padding:20px'>Der Trainer startet nicht. Bitte die App ganz schließen (Benachrichtigung „Beenden“) und neu öffnen.</p>", "text/html", "utf-8", null);
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

    @Override public void onBackPressed() {
        if (web != null && geladen && web.canGoBack()) { web.goBack(); return; }
        // Nicht beenden - der Server soll weiterlaufen. Zurueck zum Startbildschirm.
        moveTaskToBack(true);
    }
}
