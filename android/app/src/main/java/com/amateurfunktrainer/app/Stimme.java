package com.amateurfunktrainer.app;

import android.content.Context;
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
 *    Hauptthread. Die Seite versucht es danach einmal von selbst neu.
 *  - Wechselt jemand in den Android-Einstellungen das bevorzugte Modul,
 *    wird beim naechsten Oeffnen neu verbunden.
 *  - zustand() sagt der Seite, woran es liegt (fuer den Hinweis).
 */
final class Stimme {

    /** Wer die Ergebnisse bekommt: die gerade offene Oberflaeche. */
    interface Melder { void melden(String id, boolean ok); }

    private static TextToSpeech tts;
    private static int generation = 0;
    private static boolean bereit = false;
    private static String modul = null;
    private static long letzterVersuch = 0;
    private static int letzterStatus = 0;
    private static int letzteSprache = 0;
    private static int letzterFehler = 0;
    private static Melder melder;
    private static final Handler HAUPT = new Handler(Looper.getMainLooper());

    private Stimme() { }

    /** Aus onCreate der Oberflaeche. Verbindet nur, wenn noetig. */
    static synchronized void anmelden(Context ctx, Melder m) {
        melder = m;
        final Context app = ctx.getApplicationContext();
        if (tts == null || !bereit) { neu(app); return; }
        String jetzt = null;
        try { jetzt = tts.getDefaultEngine(); } catch (Exception e) { jetzt = null; }
        if (jetzt != null && modul != null && !jetzt.equals(modul)) neu(app);
    }

    /** Aus onDestroy der Oberflaeche. Die Verbindung bleibt bestehen. */
    static synchronized void abmelden(Melder m) {
        if (melder == m) melder = null;
    }

    static synchronized boolean istBereit() { return bereit; }

    /**
     * Nimmt den Text als WAV-Datei auf. true = Auftrag angenommen, das
     * Ergebnis kommt spaeter ueber den Melder. false = gleich gescheitert.
     */
    static boolean aufnehmen(Context ctx, String id, String text, File datei) {
        TextToSpeech t;
        synchronized (Stimme.class) {
            if (!bereit || tts == null) {
                if (System.currentTimeMillis() - letzterVersuch > 5000) {
                    final Context app = ctx.getApplicationContext();
                    letzterVersuch = System.currentTimeMillis();
                    HAUPT.post(() -> { synchronized (Stimme.class) { neu(app); } });
                }
                return false;
            }
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

    /** Fuer den Hinweis in der Seite: {"bereit":..,"status":..,"sprache":..,"fehler":..,"modul":".."} */
    static synchronized String zustand() {
        String m = modul == null ? "null" : "\"" + modul.replace("\\", "").replace("\"", "") + "\"";
        return "{\"bereit\":" + bereit + ",\"status\":" + letzterStatus + ",\"sprache\":" + letzteSprache
            + ",\"fehler\":" + letzterFehler + ",\"modul\":" + m + "}";
    }

    // Nur mit gehaltener Sperre aufrufen.
    private static void neu(final Context app) {
        letzterVersuch = System.currentTimeMillis();
        bereit = false;
        try { if (tts != null) tts.shutdown(); } catch (Exception e) { }
        tts = null;
        final int meine = ++generation;
        final TextToSpeech neues = new TextToSpeech(app, status -> {
            synchronized (Stimme.class) {
                if (meine != generation) return;          // inzwischen ueberholt
                letzterStatus = status;
                if (status != TextToSpeech.SUCCESS || tts == null) { bereit = false; return; }
                int r = tts.setLanguage(Locale.GERMANY);
                if (r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED) r = tts.setLanguage(Locale.GERMAN);
                letzteSprache = r;
                bereit = r != TextToSpeech.LANG_MISSING_DATA && r != TextToSpeech.LANG_NOT_SUPPORTED;
                try { modul = tts.getDefaultEngine(); } catch (Exception e) { modul = null; }
                tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override public void onStart(String id) { }
                    @Override public void onDone(String id) { fertig(id, true); }
                    @Override public void onError(String id) { fertig(id, false); }
                    @Override public void onError(String id, int code) {
                        synchronized (Stimme.class) { letzterFehler = code; }
                        fertig(id, false);
                    }
                });
            }
        });
        // Ist beim Bauen schon ein Fehler gemeldet worden (kein Modul da),
        // bleibt bereit=false; sonst kommt der Rueckruf spaeter im Hauptthread.
        if (meine == generation) tts = neues;
    }

    private static void fertig(String id, boolean ok) {
        Melder m;
        synchronized (Stimme.class) { m = melder; }
        if (m != null) m.melden(id, ok);
    }
}
