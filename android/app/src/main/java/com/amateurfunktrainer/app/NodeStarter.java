package com.amateurfunktrainer.app;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.util.Log;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Packt den Trainer aus und startet Server.js mit dem eingebauten Node.js
 * (29.09.2026).
 *
 * Node laesst sich je Prozess nur EINMAL starten - deshalb der Merker
 * "gestartet". Die App-Oberflaeche kann kommen und gehen, der Server
 * laeuft im Dienst (TrainerService) weiter.
 *
 * Beim Auspacken bleibt alles stehen, was dem Benutzer gehoert: data/
 * (Lernstaende), Hoerbuch/, lerncoach/, kurse/. Ersetzt werden nur die
 * Dateien, die in der APK mitkommen - und das nur, wenn die APK neu ist.
 */
public final class NodeStarter {
    private static final String TAG = "TRAINER";
    private static boolean gestartet = false;

    static {
        System.loadLibrary("node");
        System.loadLibrary("trainer-native");
    }

    private static native int startNode(String[] argumente);

    public static synchronized boolean laeuft() {
        return gestartet;
    }

    public static synchronized void starten(final Context ctx) {
        if (gestartet) return;
        gestartet = true;
        final Context app = ctx.getApplicationContext();
        Runnable r = new Runnable() {
            @Override public void run() {
                try {
                    File ordner = bereitstellen(app);
                    File start = startDateiSchreiben(app, ordner);
                    Log.i(TAG, "Starte Node mit " + start.getAbsolutePath());
                    int code = startNode(new String[] { "node", start.getAbsolutePath() });
                    Log.i(TAG, "Node beendet mit Code " + code);
                } catch (Throwable t) {
                    Log.e(TAG, "Start fehlgeschlagen", t);
                }
            }
        };
        // Node braucht mehr Stapelspeicher als ein normaler Java-Faden.
        new Thread(null, r, "node", 16L * 1024 * 1024).start();
    }

    public static File trainerOrdner(Context ctx) {
        return new File(ctx.getFilesDir(), "trainer");
    }

    static File bereitstellen(Context ctx) throws Exception {
        File ziel = trainerOrdner(ctx);
        if (!ziel.exists() && !ziel.mkdirs()) throw new Exception("Ordner nicht anlegbar: " + ziel);
        PackageInfo pi = ctx.getPackageManager().getPackageInfo(ctx.getPackageName(), 0);
        String stand = pi.versionCode + "/" + pi.lastUpdateTime;
        File merker = new File(ziel, ".apk-stand");
        String alt = "";
        if (merker.exists()) alt = new String(lesen(merker), StandardCharsets.UTF_8).trim();
        if (stand.equals(alt) && new File(ziel, "Server.js").exists()) return ziel;

        Log.i(TAG, "Packe den Trainer aus (" + stand + ")");
        try (InputStream roh = ctx.getAssets().open("trainer.zip");
             ZipInputStream zip = new ZipInputStream(new BufferedInputStream(roh))) {
            byte[] puffer = new byte[64 * 1024];
            ZipEntry e;
            String wurzel = ziel.getCanonicalPath() + File.separator;
            while ((e = zip.getNextEntry()) != null) {
                File f = new File(ziel, e.getName());
                // Nichts ausserhalb des Ordners schreiben.
                if (!f.getCanonicalPath().startsWith(wurzel)) continue;
                if (e.isDirectory()) { f.mkdirs(); continue; }
                File eltern = f.getParentFile();
                if (eltern != null) eltern.mkdirs();
                try (OutputStream out = new FileOutputStream(f)) {
                    int n;
                    while ((n = zip.read(puffer)) > 0) out.write(puffer, 0, n);
                }
            }
        }
        try (OutputStream out = new FileOutputStream(merker)) {
            out.write(stand.getBytes(StandardCharsets.UTF_8));
        }
        // Der Merkposten des Datei-Updaters (29.09.2026) gehoert zum alten
        // Stand: Die neue App hat die Dateien eben ersetzt. Bliebe er
        // liegen, hielte der Updater die neuen Dateien fuer "hier von Hand
        // geaendert" und wuerde sie nie mehr auffrischen. Er wird nur zur
        // Seite gelegt, nicht geloescht.
        File gh = new File(ziel, "github_stand.json");
        if (gh.exists()) {
            // rename ersetzt unter Android (Linux) eine aeltere Ablage gleich mit.
            gh.renameTo(new File(ziel, "github_stand.vor-app-update.json"));
        }
        return ziel;
    }

    /** Kleine Startdatei: Umgebung setzen, dann Server.js wie am PC. */
    static File startDateiSchreiben(Context ctx, File ordner) throws Exception {
        File heim = new File(ctx.getFilesDir(), "heim");
        File appdata = new File(ctx.getFilesDir(), "appdata");
        heim.mkdirs();
        appdata.mkdirs();
        String js = "// Von der Android-App geschrieben - nicht von Hand aendern.\n"
            + "process.env.PORT = process.env.PORT || '3000';\n"
            + "process.env.HOME = " + jsText(heim.getAbsolutePath()) + ";\n"
            + "process.env.APPDATA = " + jsText(appdata.getAbsolutePath()) + ";\n"
            + "process.env.TMPDIR = " + jsText(ctx.getCacheDir().getAbsolutePath()) + ";\n"
            + "process.env.TRAINER_ANDROID = '1';\n"
            + "process.env.TRAINER_TTS_DIR = " + jsText(sprachOrdner(ctx).getAbsolutePath()) + ";\n"
            // cloudflared (Go) soll Namen ueber Android aufloesen, nicht ueber
            // eine resolv.conf, die es am Handy nicht gibt.
            + (tunnelProgramm(ctx) != null ? "process.env.TRAINER_CLOUDFLARED = " + jsText(tunnelProgramm(ctx).getAbsolutePath()) + ";\n"
                + "process.env.GODEBUG = 'netdns=cgo';\n" : "")
            + "process.chdir(__dirname);\n"
            + "require('./Server.js');\n";
        File f = new File(ordner, "android-start.js");
        try (OutputStream out = new FileOutputStream(f)) {
            out.write(js.getBytes(StandardCharsets.UTF_8));
        }
        return f;
    }

    /** cloudflared fuer den Internet-Link - liegt als libcloudflared.so bei den
     *  Programmteilen der App, nur dort darf Android es ausfuehren. */
    public static File tunnelProgramm(Context ctx) {
        File f = new File(ctx.getApplicationInfo().nativeLibraryDir, "libcloudflared.so");
        return (f.exists() && f.canExecute()) ? f : null;
    }

    /** Hier legt die Sprachausgabe des Handys ihre Aufnahmen ab (MainActivity). */
    public static File sprachOrdner(Context ctx) {
        File f = new File(ctx.getCacheDir(), "sprache");
        f.mkdirs();
        return f;
    }

    private static String jsText(String s) {
        return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'";
    }

    private static byte[] lesen(File f) throws Exception {
        try (InputStream in = new java.io.FileInputStream(f)) {
            java.io.ByteArrayOutputStream b = new java.io.ByteArrayOutputStream();
            byte[] p = new byte[4096];
            int n;
            while ((n = in.read(p)) > 0) b.write(p, 0, n);
            return b.toByteArray();
        }
    }
}
