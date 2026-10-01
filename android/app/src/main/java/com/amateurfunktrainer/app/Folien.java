package com.amateurfunktrainer.app;

import android.content.Context;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

// ================================================================
//  FOLIEN FUER DIE APP                                   (01.10.2026)
//  Dietmar, mit Bild der GitHub-Seite im Handy-Browser: "Wenn ich in
//  der App auf Folien klicke, oeffnet sich der Link zu GitHub." - und:
//  "Ich stelle mir das so vor, dass sich bei Folien ein Button oeffnet
//  mit dem Hinweis, dass man sich hier 150 MB an Daten runterzieht und
//  danach die PDF dann in der App liegen."
//
//  Die Foliensaetze des DARC (Lizenz CC BY 4.0) liegen als PDF bei den
//  Veroeffentlichungen auf GitHub. Auf Wunsch der Seite laedt dieser
//  Teil eine davon in den App-Ordner "folien" (nie in den Trainer-
//  Ordner, den das Update anfasst). Angezeigt wird sie wie das
//  Formelblatt: PdfBild malt die Seiten.
//
//  Erlaubt sind nur Dateinamen der Form slide-XX.pdf, und geladen wird
//  nur von der festen Adresse des DARC-Projekts. Ein Ladevorgang zur
//  Zeit; abbrechbar. Die Datei bekommt erst ihren Namen, wenn sie
//  vollstaendig und als PDF erkennbar ist (vorher ".part").
// ================================================================
final class Folien {
    interface Stand {
        /** status: laeuft, fertig, fehler, abgebrochen */
        void melden(String name, long bytes, long gesamt, String status, String text);
    }

    private static final String BASIS = "https://github.com/DARC-e-V/50ohm-pdf-slides/releases/latest/download/";
    private static volatile String laeuftName = "";
    private static volatile boolean abbruch = false;

    private Folien() { }

    static File ordner(Context c) {
        return new File(c.getFilesDir(), "folien");
    }

    static boolean erlaubt(String name) {
        return name != null && name.matches("slide-[A-Za-z]{1,3}\\.pdf");
    }

    /** Die fertige Datei, oder null. */
    static File datei(Context c, String name) {
        if (!erlaubt(name)) return null;
        File f = new File(ordner(c), name);
        return (f.isFile() && f.canRead()) ? f : null;
    }

    static long groesse(Context c, String name) {
        File f = datei(c, name);
        return f == null ? 0 : f.length();
    }

    static String laeuft() {
        return laeuftName;
    }

    static boolean entfernen(Context c, String name) {
        if (!erlaubt(name) || name.equals(laeuftName)) return false;
        File f = new File(ordner(c), name);
        File t = new File(ordner(c), name + ".part");
        boolean ok = !f.exists() || f.delete();
        if (t.exists()) t.delete();
        return ok;
    }

    static void abbrechen() {
        abbruch = true;
    }

    /** Startet den Ladevorgang im Hintergrund. false: es laeuft schon einer oder der Name ist nicht erlaubt. */
    static synchronized boolean laden(final Context c, final String name, final Stand s) {
        if (!erlaubt(name) || !laeuftName.isEmpty()) return false;
        laeuftName = name;
        abbruch = false;
        final Context app = c.getApplicationContext();
        new Thread(new Runnable() {
            @Override public void run() {
                try {
                    holen(app, name, s);
                } finally {
                    laeuftName = "";
                }
            }
        }, "folien-laden").start();
        return true;
    }

    private static void holen(Context c, String name, Stand s) {
        File dir = ordner(c);
        File teil = new File(dir, name + ".part");
        File ziel = new File(dir, name);
        HttpURLConnection h = null;
        try {
            if (!dir.exists() && !dir.mkdirs()) throw new Exception("Der Ordner für die Folien lässt sich nicht anlegen.");
            if (teil.exists()) teil.delete();
            s.melden(name, 0, 0, "laeuft", "");
            h = (HttpURLConnection) new URL(BASIS + name).openConnection();
            h.setInstanceFollowRedirects(true);
            h.setConnectTimeout(20000);
            h.setReadTimeout(30000);
            h.setRequestProperty("User-Agent", "Amateurfunk-Trainer-App");
            int code = h.getResponseCode();
            if (code != 200) throw new Exception(code == 404 ? "Diese Datei gibt es beim DARC nicht mehr." : "Der Server antwortet mit Fehler " + code + ".");
            long gesamt = h.getContentLengthLong();
            if (gesamt > 0 && dir.getUsableSpace() < gesamt + 64L * 1024 * 1024)
                throw new Exception("Zu wenig freier Speicher auf dem Handy (gebraucht: " + (gesamt / 1048576 + 64) + " MB).");
            long stand = 0, letzte = 0;
            try (InputStream in = h.getInputStream(); FileOutputStream aus = new FileOutputStream(teil)) {
                byte[] puffer = new byte[64 * 1024];
                int n;
                while ((n = in.read(puffer)) > 0) {
                    if (abbruch) {
                        aus.close();
                        teil.delete();
                        s.melden(name, stand, gesamt, "abgebrochen", "");
                        return;
                    }
                    aus.write(puffer, 0, n);
                    stand += n;
                    long jetzt = System.currentTimeMillis();
                    if (jetzt - letzte > 400) {
                        letzte = jetzt;
                        s.melden(name, stand, gesamt, "laeuft", "");
                    }
                }
            }
            if (gesamt > 0 && stand != gesamt) throw new Exception("Der Download ist abgebrochen. Bitte noch einmal versuchen.");
            byte[] kopf = new byte[4];
            try (InputStream in = new FileInputStream(teil)) {
                if (in.read(kopf) != 4 || kopf[0] != '%' || kopf[1] != 'P' || kopf[2] != 'D' || kopf[3] != 'F')
                    throw new Exception("Die geladene Datei ist keine PDF.");
            }
            if (ziel.exists()) ziel.delete();
            if (!teil.renameTo(ziel)) throw new Exception("Die Datei lässt sich nicht ablegen.");
            s.melden(name, stand, stand, "fertig", "");
        } catch (Exception e) {
            teil.delete();
            String t = e.getMessage();
            if (e instanceof java.net.UnknownHostException || e instanceof java.net.SocketTimeoutException || e instanceof java.net.ConnectException)
                t = "Keine Verbindung zum Internet. Bitte prüfen und noch einmal versuchen.";
            s.melden(name, 0, 0, "fehler", t == null ? "Das Laden hat nicht geklappt." : t);
        } catch (Throwable e) {
            teil.delete();
            s.melden(name, 0, 0, "fehler", "Das Laden hat nicht geklappt.");
        } finally {
            if (h != null) h.disconnect();
        }
    }
}
