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

    private PdfBild() { }

    private static File datei(Context c, String name) {
        if (name == null || !name.matches("[A-Za-z0-9_.-]+\\.pdf")) return null;
        File f = new File(NodeStarter.trainerOrdner(c), name);
        return (f.isFile() && f.canRead()) ? f : null;
    }

    /** Wie viele Seiten hat die Datei? 0, wenn es sie nicht gibt. */
    static int seiten(Context c, String name) {
        File f = datei(c, name);
        if (f == null) return 0;
        synchronized (SPERRE) {
            try (ParcelFileDescriptor fd = ParcelFileDescriptor.open(f, ParcelFileDescriptor.MODE_READ_ONLY);
                 PdfRenderer r = new PdfRenderer(fd)) {
                return r.getPageCount();
            } catch (Exception e) {
                return 0;
            }
        }
    }

    /** Seite (ab 1) mit der gewuenschten Breite in Bildpunkten, als data:-Adresse (PNG). Leer, wenn es nicht klappt. */
    static String seite(Context c, String name, int seite, int breite) {
        File f = datei(c, name);
        if (f == null) return "";
        if (breite < 200) breite = 200;
        if (breite > BREITE_HOECHSTENS) breite = BREITE_HOECHSTENS;
        synchronized (SPERRE) {
            try (ParcelFileDescriptor fd = ParcelFileDescriptor.open(f, ParcelFileDescriptor.MODE_READ_ONLY);
                 PdfRenderer r = new PdfRenderer(fd)) {
                if (seite < 1 || seite > r.getPageCount()) return "";
                try (PdfRenderer.Page p = r.openPage(seite - 1)) {
                    int hoehe = Math.max(1, Math.round(breite * (float) p.getHeight() / Math.max(1, p.getWidth())));
                    Bitmap b = Bitmap.createBitmap(breite, hoehe, Bitmap.Config.ARGB_8888);
                    new Canvas(b).drawColor(Color.WHITE);          // PDF-Seiten sind durchsichtig
                    p.render(b, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY);
                    ByteArrayOutputStream aus = new ByteArrayOutputStream();
                    b.compress(Bitmap.CompressFormat.PNG, 100, aus);
                    b.recycle();
                    return "data:image/png;base64," + Base64.encodeToString(aus.toByteArray(), Base64.NO_WRAP);
                }
            } catch (Exception e) {
                return "";
            } catch (OutOfMemoryError e) {
                return "";
            }
        }
    }
}
