package com.amateurfunktrainer.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

// ================================================================
//  FUNKI IM STARTBILD                                   (01.10.2026)
//  Dietmar, mit einem Bild vom Start der App: "Die Antenne raus und
//  ein animierter Funki rein" - und: "Schoen waere es auch, wenn er
//  animiert waere und winkt."
//
//  Funki ist dieselbe Zeichnung wie in der App (res/raw/
//  funki_start.html: SVG mit CSS-Bewegung - er ploppt herein, wippt,
//  blinzelt, die Antenne wackelt, und er winkt). Gezeigt in einem
//  kleinen, durchsichtigen Browserfenster ueber dem dunklen Startbild;
//  Name, Kreisel und "wird gestartet ..." bleiben, wie sie sind.
//
//  Im Stil Sachlich bleibt das Zeichen: Dort verspricht die App "ganz
//  ohne Funki". Den Stil meldet die Seite ueber AndroidApp.stilMerken,
//  die App merkt ihn sich fuer den naechsten Start. Neu installiert
//  (noch kein Stil gewaehlt) kommt Funki. Klappt etwas nicht, steht
//  ebenfalls das Zeichen da.
// ================================================================
final class StartFunki {
    private static final String ABLAGE = "startbild";
    private static final String STIL = "stil";

    private StartFunki() { }

    /** Von der Seite: "sachlich" oder "verspielt" (fuer den naechsten Start). */
    static void stilMerken(Context c, String stil) {
        if (stil == null) return;
        String s = "sachlich".equals(stil) ? "sachlich" : "verspielt";
        SharedPreferences ablage = c.getSharedPreferences(ABLAGE, Context.MODE_PRIVATE);
        if (!s.equals(ablage.getString(STIL, ""))) ablage.edit().putString(STIL, s).apply();
    }

    static boolean sachlich(Context c) {
        return "sachlich".equals(c.getSharedPreferences(ABLAGE, Context.MODE_PRIVATE).getString(STIL, ""));
    }

    /** Funki als kleines Browserfenster - oder null: dann zeigt das Startbild das Zeichen. */
    static View bild(Context c) {
        if (sachlich(c)) return null;
        try {
            String html = lesen(c.getResources().openRawResource(R.raw.funki_start));
            WebView w = new WebView(c);
            w.setBackgroundColor(Color.TRANSPARENT);
            w.setVerticalScrollBarEnabled(false);
            w.setHorizontalScrollBarEnabled(false);
            w.setFocusable(false);
            w.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
            return w;
        } catch (Exception e) {
            return null;
        }
    }

    /** Wenn das Startbild ausgeblendet ist: Funkis Browserfenster abbauen. */
    static void freigeben(View v) {
        if (!(v instanceof WebView)) return;
        try {
            if (v.getParent() instanceof ViewGroup) ((ViewGroup) v.getParent()).removeView(v);
            ((WebView) v).destroy();
        } catch (Exception e) { }
    }

    private static String lesen(InputStream ein) throws IOException {
        try (InputStream e = ein; ByteArrayOutputStream aus = new ByteArrayOutputStream()) {
            byte[] puffer = new byte[4096];
            int n;
            while ((n = e.read(puffer)) > 0) aus.write(puffer, 0, n);
            return aus.toString("UTF-8");
        }
    }
}
