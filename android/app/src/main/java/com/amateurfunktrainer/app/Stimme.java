package com.amateurfunktrainer.app;

import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;

import java.io.File;
import java.util.Locale;

/**
 * Die Stimme des Handys - EINE Verbindung je App-Prozess (30.09.2026).
 *
 * Dietmar: "Wenn ich mein Handy neu starte, ist die Stimme da, perfekt.
 * Oeffne ich ein zweites Mal die App, ist die Stimme nicht da und das
 * Fenster kommt." (Sprachmodul: Acapela TTS, Deutsch)
 *
 * Vorher baute jedes Oeffnen der Oberflaeche (MainActivity) eine neue
 * Verbindung zum Sprachmodul auf und trennte sie beim Schliessen wieder
 * (shutdown). Der Prozess lebt aber weiter - der Server-Dienst haelt ihn
 * wach -, und manche Module nehmen eine zweite Verbindung aus demselben
 * Prozess nicht mehr an. Nach einem Neustart des Handys ging es genau
 * einmal.
 *
 * Jetzt:
 *  - Die Verbindung haengt am Prozess (Application-Kontext), nicht an der
 *    Oberflaeche. Schliessen und wieder Oeffnen benutzt dieselbe.
 *  - Ist sie nicht bereit (Modul gewechselt, Stimme fehlte beim Start),
 *    wird sie neu aufgebaut - hoechstens alle fuenf Sekunden, im
 *    Hauptthread. Die Seite wartet darauf (bis zu 12 s) statt gleich den
 *    Hinweis zu zeigen.
 *  - Wechselt jemand in den Android-Einstellungen das bevorzugte Modul,
 *    wird beim naechsten Oeffnen neu verbunden.
 *  - zustand() sagt der Seite, woran es liegt (fuer den Hinweis).
 *
 * GEDULD BEIM AUFBAU (01.10.2026). Dietmar, mit Bild aus der frisch
 * installierten App: "Aergerlich" - der Hinweis kam sofort, mit "Start 0,
 * Sprache 0, Fehler 0, Modul unbekannt": das Modul hatte sich noch gar
 * nicht gemeldet. Die alte Fassung riss eine Verbindung, die noch im
 * Aufbau war, nach fuenf Sekunden ab und baute sie neu - und genau das
 * mag Acapela nicht (siehe oben). Jetzt bekommt ein Aufbau 20 Sekunden.
 * Erst wenn er haengt oder scheitert, wird neu verbunden; beim dritten
 * Mal mit dem Modul von Google als Ausweg, falls es installiert ist.
 * "Start" im Hinweis heisst jetzt: null = noch keine Antwort.
 *
 * SCHNELLER AUSWEG (05.10.2026). Dietmar, frisch installierte App 1.298.0,
 * wieder "Aergerlich": "Modul unbekannt, Start keine Antwort, verbunden
 * seit 20 s, Versuche 1" - Acapela meldete sich ueberhaupt nicht. Bis
 * Google einsprang, vergingen zwei Anlaeufe zu je 20 s. Jetzt: 10 s
 * Geduld, und schon der zweite Anlauf nimmt Google, falls installiert.
 * Das bevorzugte Modul steht ab sofort gleich im Hinweis, auch wenn es
 * sich nie meldet.
 */
final class Stimme {

    /** Wer die Ergebnisse bekommt: die gerade offene Oberflaeche. */
    interface Melder { void melden(String id, boolean ok); }

    private static final String GOOGLE = "com.google.android.tts";
    private static final long GEDULD = 10000;      // ms, so lange darf ein Aufbau dauern (05.10.2026: vorher 20 s)
    private static final long PAUSE = 5000;        // ms, Mindestabstand zweier Versuche

    private static TextToSpeech tts;
    private static Context app;                    // Application-Kontext, seit dem ersten Anmelden
    private static int generation = 0;
    private static boolean bereit = false;
    private static String modul = null;
    private static String gewuenscht = null;       // null = Standardmodul, sonst ein Paketname (Google als Ausweg)
    private static long letzterVersuch = 0;
    private static long verbindetSeit = 0;         // 0 = kein Aufbau im Gang
    private static int versuche = 0;               // Aufbauten ohne Erfolg hintereinander
    private static Integer letzterStatus = null;   // null = das Modul hat sich noch nicht gemeldet
    private static boolean nachholen = false;      // Rueckruf kam schon beim Bauen
    private static int letzteSprache = 0;
    private static int letzterFehler = 0;
    private static Melder melder;
    private static final Handler HAUPT = new Handler(Looper.getMainLooper());

    private Stimme() { }

    /** Aus onCreate der Oberflaeche. Verbindet nur, wenn noetig. */
    static synchronized void anmelden(Context ctx, Melder m) {
        melder = m;
        app = ctx.getApplicationContext();
        if (tts == null) { neu(); return; }
        if (!bereit) { nachsehen(); return; }
        // Bereit - aber hat jemand inzwischen das Modul gewechselt?
        String jetzt = null;
        try { jetzt = tts.getDefaultEngine(); } catch (Exception e) { jetzt = null; }
        if (gewuenscht == null && jetzt != null && modul != null && !jetzt.equals(modul)) neu();
    }

    /** Aus onDestroy der Oberflaeche. Die Verbindung bleibt bestehen. */
    static synchronized void abmelden(Melder m) {
        if (melder == m) melder = null;
    }

    /** Fuer die Seite - sie fragt alle paar hundert Millisekunden, solange sie wartet. */
    static synchronized boolean istBereit() {
        if (!bereit && app != null) nachsehen();
        return bereit;
    }

    /**
     * Nimmt den Text als WAV-Datei auf. true = Auftrag angenommen, das
     * Ergebnis kommt spaeter ueber den Melder. false = gleich gescheitert
     * (dann wartet die Seite auf istBereit und versucht es noch einmal).
     */
    static boolean aufnehmen(Context ctx, String id, String text, File datei) {
        TextToSpeech t;
        synchronized (Stimme.class) {
            if (app == null) app = ctx.getApplicationContext();
            if (!bereit || tts == null) { nachsehen(); return false; }
            t = tts;
        }
        int r;
        try { r = t.synthesizeToFile(text, new Bundle(), datei, id); }
        catch (Exception e) { r = TextToSpeech.ERROR; }
        if (r != TextToSpeech.SUCCESS) {
            synchronized (Stimme.class) { letzterFehler = r; bereit = false; }
            return false;
        }
        return true;
    }

    /** Fuer den Hinweis in der Seite: {"bereit":..,"status":..,"sprache":..,"fehler":..,"modul":..,"verbindet":..,"seit":..,"versuche":..} */
    static synchronized String zustand() {
        String m = modul == null ? "null" : "\"" + modul.replace("\\", "").replace("\"", "") + "\"";
        long seit = verbindetSeit == 0 ? 0 : System.currentTimeMillis() - verbindetSeit;
        return "{\"bereit\":" + bereit + ",\"status\":" + (letzterStatus == null ? "null" : letzterStatus)
            + ",\"sprache\":" + letzteSprache + ",\"fehler\":" + letzterFehler + ",\"modul\":" + m
            + ",\"verbindet\":" + (verbindetSeit != 0) + ",\"seit\":" + seit + ",\"versuche\":" + versuche
            + ",\"ausweg\":" + (gewuenscht != null) + "}";
    }

    // ---- Nur mit gehaltener Sperre aufrufen ----

    /** Nicht bereit: Laeuft ein Aufbau, warten. Haengt er oder ist er gescheitert, neu - nicht oefter als alle 5 s. */
    private static void nachsehen() {
        long jetzt = System.currentTimeMillis();
        if (verbindetSeit != 0 && jetzt - verbindetSeit < GEDULD) return;      // noch im Aufbau
        if (jetzt - letzterVersuch < PAUSE) return;
        if (Looper.myLooper() == Looper.getMainLooper()) neu();
        else HAUPT.post(() -> { synchronized (Stimme.class) {
            if (!bereit && (verbindetSeit == 0 || System.currentTimeMillis() - verbindetSeit >= GEDULD)) neu();
        } });
    }

    private static boolean googleDa() {
        try { app.getPackageManager().getPackageInfo(GOOGLE, 0); return true; }
        catch (PackageManager.NameNotFoundException e) { return false; }
        catch (Exception e) { return false; }
    }

    private static void neu() {
        if (app == null) return;
        letzterVersuch = System.currentTimeMillis();
        bereit = false;
        letzterStatus = null;
        // Zwei Anlaeufe mit dem bevorzugten Modul; dann Google als Ausweg
        // (Dietmars Hinweis an sich selbst: "sonst als Modul Google waehlen").
        // Seit 05.10.2026 schon nach dem ersten Anlauf ohne Erfolg.
        if (versuche >= 1 && gewuenscht == null && googleDa()) gewuenscht = GOOGLE;   // 05.10.2026: schon beim zweiten Anlauf
        versuche++;
        try { if (tts != null) tts.shutdown(); } catch (Exception e) { }
        tts = null;
        final int meine = ++generation;
        verbindetSeit = System.currentTimeMillis();
        nachholen = false;
        TextToSpeech.OnInitListener rueckruf = status -> {
            synchronized (Stimme.class) {
                if (meine != generation) return;          // inzwischen ueberholt
                verbindetSeit = 0;
                letzterStatus = status;
                if (status != TextToSpeech.SUCCESS) { bereit = false; return; }
                // Meldet sich das Modul noch waehrend des Bauens (manche tun
                // das), ist tts noch nicht gesetzt - dann gleich danach.
                if (tts == null) { nachholen = true; return; }
                einrichten();
            }
        };
        final TextToSpeech neues = gewuenscht == null ? new TextToSpeech(app, rueckruf) : new TextToSpeech(app, rueckruf, gewuenscht);
        // Ist beim Bauen schon ein Fehler gemeldet worden (kein Modul da),
        // steht letzterStatus jetzt auf ERROR; sonst kommt der Rueckruf
        // spaeter im Hauptthread.
        if (meine == generation) {
            tts = neues;
            // Fuer den Hinweis: welches Modul gefragt wurde, auch wenn es nie antwortet.
            if (modul == null) { try { modul = gewuenscht != null ? gewuenscht : neues.getDefaultEngine(); } catch (Exception e) { } }
            if (nachholen) { nachholen = false; einrichten(); }
        }
    }

    /** Das Modul hat sich gemeldet: Sprache einstellen, Rueckmeldungen anschliessen. Nur mit Sperre. */
    private static void einrichten() {
        if (tts == null) return;
        int r;
        try {
            r = tts.setLanguage(Locale.GERMANY);
            if (r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED) r = tts.setLanguage(Locale.GERMAN);
        } catch (Exception e) { r = TextToSpeech.LANG_NOT_SUPPORTED; }
        letzteSprache = r;
        bereit = r != TextToSpeech.LANG_MISSING_DATA && r != TextToSpeech.LANG_NOT_SUPPORTED;
        try { modul = tts.getDefaultEngine(); } catch (Exception e) { modul = null; }
        if (gewuenscht != null) modul = gewuenscht;
        if (bereit) versuche = 0;
        try {
            tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override public void onStart(String id) { }
                @Override public void onDone(String id) { fertig(id, true); }
                @Override public void onError(String id) { fertig(id, false); }
                @Override public void onError(String id, int code) {
                    synchronized (Stimme.class) { letzterFehler = code; }
                    fertig(id, false);
                }
            });
        } catch (Exception e) { }
    }

    private static void fertig(String id, boolean ok) {
        Melder m;
        synchronized (Stimme.class) { m = melder; }
        if (m != null) m.melden(id, ok);
    }
}
