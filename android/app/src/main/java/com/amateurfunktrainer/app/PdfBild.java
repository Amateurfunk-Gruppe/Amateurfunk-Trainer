package com.amateurfunktrainer.app;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.pdf.PdfRenderer;
import android.os.ParcelFileDescriptor;
import android.util.Base64;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.util.LinkedList;

// ================================================================
//  EINE PDF-SEITE ALS BILD                                (01.10.2026)
//  Dietmar, mit Bild aus der App: "Das Formelblatt kann ich nicht
//  downloaden. Das ist nicht da." Das Browserfenster der App kann kein
//  PDF anzeigen - es reichte die Datei an den Download weiter, und dort
//  verlief sie im Sand. Android bringt aber einen eigenen PDF-Zeichner
//  mit (PdfRenderer). Der malt hier die gewuenschte Seite der
//  Formelsammlung als Bild, und die Seite zeigt es im Fenster
//  "Formelblatt" wie am PC - mit Blaettern und Vergroessern.
//  Erlaubt sind nur PDF-Dateien aus dem Trainer-Ordner selbst.
// ================================================================
final class PdfBild {
    private static final int BREITE_HOECHSTENS = 2400;
    private static final Object SPERRE = new Object();

    // ------------------------------------------------------------
    //  Durchgehendes Blaettern der Folien (01.10.2026)
    //  Dietmar, mit Bildschirmvideo einer anderen PDF-Anzeige: "Ich moechte
    //  das genauso fluessig in der App haben ... ich moechte das nach unten
    //  scrollen." Dafuer braucht die Seite viele Seiten schnell hintereinander:
    //   - Die geoeffnete PDF bleibt offen (eine je Prozess), statt fuer jede
    //     Seite neu aufgemacht zu werden (bei 150 MB spuerbar).
    //   - Gezeichnet wird im Hintergrund (ein Faden), die Seite bekommt jedes
    //     Bild per Rueckruf - das Fenster ruckelt nicht. Als JPEG, das ist
    //     schnell und klein genug.
    //   - Scrollt man weiter, bevor eine Seite dran war, wird sie uebersprungen:
    //     die Seite nennt das gewuenschte Fenster (von bis), alles ausserhalb
    //     meldet sich leer zurueck und wird nicht gezeichnet.
    // ------------------------------------------------------------
    interface Rueckruf {
        /** verhaeltnis = Hoehe/Breite der Seite; bild leer, wenn uebersprungen oder fehlgeschlagen */
        void fertig(int id, double verhaeltnis, String bild);
    }

    private static final class Auftrag {
        final String name; final int seite, breite, id; final Rueckruf rr; final Context c;
        Auftrag(Context c, String name, int seite, int breite, int id, Rueckruf rr) { this.c = c; this.name = name; this.seite = seite; this.breite = breite; this.id = id; this.rr = rr; }
    }
    private static final LinkedList<Auftrag> WARTE = new LinkedList<>();
    private static Thread zeichner;
    private static volatile int fensterVon = 0, fensterBis = Integer.MAX_VALUE;

    private static String offenName = "";
    private static long offenStand = -1;
    private static ParcelFileDescriptor offenFd;
    private static PdfRenderer offenR;

    /** Die geoeffnete PDF (im Besitz von SPERRE): wird wiederverwendet, solange es dieselbe Datei ist. */
    private static PdfRenderer renderer(File f) throws Exception {
        String k = f.getAbsolutePath();
        long st = f.lastModified() * 31 + f.length();
        if (offenR != null && k.equals(offenName) && st == offenStand) return offenR;
        zuMachen();
        offenFd = ParcelFileDescriptor.open(f, ParcelFileDescriptor.MODE_READ_ONLY);
        try {
            offenR = new PdfRenderer(offenFd);
        } catch (Exception e) {
            try { offenFd.close(); } catch (Exception e2) { }
            offenFd = null;
            throw e;
        }
        offenName = k; offenStand = st;
        return offenR;
    }

    private static void zuMachen() {
        try { if (offenR != null) offenR.close(); } catch (Exception e) { }
        try { if (offenFd != null) offenFd.close(); } catch (Exception e) { }
        offenR = null; offenFd = null; offenName = ""; offenStand = -1;
    }

    /** Beim Entfernen einer Datei: die offene PDF loslassen. */
    static void schliessen() {
        synchronized (SPERRE) { zuMachen(); }
    }

    /** Das Fenster der gerade gebrauchten Seiten (ab 1, von bis). */
    static void fenster(int von, int bis) {
        fensterVon = von; fensterBis = bis;
    }

    /** Eine Seite im Hintergrund zeichnen lassen; das Ergebnis kommt ueber den Rueckruf. */
    static void anfordern(Context c, String name, int seite, int breite, int id, Rueckruf rr) {
        synchronized (WARTE) {
            WARTE.addLast(new Auftrag(c.getApplicationContext(), name, seite, breite, id, rr));
            if (zeichner == null || !zeichner.isAlive()) {
                zeichner = new Thread(new Runnable() {
                    @Override public void run() { arbeiten(); }
                }, "pdf-zeichner");
                zeichner.setDaemon(true);
                zeichner.start();
            }
            WARTE.notifyAll();
        }
    }

    private static void arbeiten() {
        while (true) {
            Auftrag a;
            synchronized (WARTE) {
                if (WARTE.isEmpty()) {
                    try { WARTE.wait(20000); } catch (InterruptedException e) { return; }
                    if (WARTE.isEmpty()) { zeichner = null; return; }
                }
                // Gewuenschtes Fenster zuerst, in der Reihenfolge der Anfrage; Ausserhalb wird uebersprungen.
                a = WARTE.removeFirst();
            }
            if (a.seite < fensterVon || a.seite > fensterBis) { a.rr.fertig(a.id, 0, ""); continue; }
            double[] v = new double[1];
            String d = bild(a.c, a.name, a.seite, a.breite, true, v);
            a.rr.fertig(a.id, v[0], d);
        }
    }

    private static String bild(Context c, String name, int seite, int breite, boolean jpeg, double[] verhaeltnis) {
        File f = datei(c, name);
        if (f == null) return "";
        if (breite < 200) breite = 200;
        if (breite > BREITE_HOECHSTENS) breite = BREITE_HOECHSTENS;
        synchronized (SPERRE) {
            try {
                PdfRenderer r = renderer(f);
                if (seite < 1 || seite > r.getPageCount()) return "";
                try (PdfRenderer.Page p = r.openPage(seite - 1)) {
                    float vh = (float) p.getHeight() / Math.max(1, p.getWidth());
                    if (verhaeltnis != null) verhaeltnis[0] = vh;
                    int hoehe = Math.max(1, Math.round(breite * vh));
                    Bitmap b = Bitmap.createBitmap(breite, hoehe, Bitmap.Config.ARGB_8888);
                    new Canvas(b).drawColor(Color.WHITE);          // PDF-Seiten sind durchsichtig
                    p.render(b, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY);
                    ByteArrayOutputStream aus = new ByteArrayOutputStream();
                    if (jpeg) b.compress(Bitmap.CompressFormat.JPEG, 88, aus);
                    else b.compress(Bitmap.CompressFormat.PNG, 100, aus);
                    b.recycle();
                    return (jpeg ? "data:image/jpeg;base64," : "data:image/png;base64,") + Base64.encodeToString(aus.toByteArray(), Base64.NO_WRAP);
                }
            } catch (Exception e) {
                zuMachen();                                         // beim naechsten Mal frisch oeffnen
                return "";
            } catch (OutOfMemoryError e) {
                return "";
            }
        }
    }

    private PdfBild() { }

    static File datei(Context c, String name) {
        // Folien des DARC (01.10.2026): "folien/slide-N.pdf" liegt im App-Ordner "folien", siehe Folien.java
        if (name != null && name.startsWith("folien/")) return Folien.datei(c, name.substring(7));
        if (name == null || !name.matches("[A-Za-z0-9_.-]+\\.pdf")) return null;
        File f = new File(NodeStarter.trainerOrdner(c), name);
        return (f.isFile() && f.canRead()) ? f : null;
    }

    /** Wie viele Seiten hat die Datei? 0, wenn es sie nicht gibt. */
    static int seiten(Context c, String name) {
        File f = datei(c, name);
        if (f == null) return 0;
        synchronized (SPERRE) {
            try {
                return renderer(f).getPageCount();
            } catch (Exception e) {
                zuMachen();
                return 0;
            }
        }
    }

    /** Seite (ab 1) mit der gewuenschten Breite in Bildpunkten, als data:-Adresse (PNG). Leer, wenn es nicht klappt. */
    static String seite(Context c, String name, int seite, int breite) {
        return bild(c, name, seite, breite, false, null);
    }
}
