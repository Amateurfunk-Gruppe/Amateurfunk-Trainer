package com.amateurfunktrainer.app;

import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.content.SharedPreferences;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Set;

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
 *
 * STIMMENWAHL (23.10.2026). Dietmar, nach dem Umstieg von Acapela auf
 * Google: "irgendwie klingt das immer noch wie ein Mann" und "ich kann
 * die Sprache nur auf Deutsch umstellen kein Mann keine Frau". Bisher
 * sagte die App dem Modul nur "Deutsch" und nahm, was es als Standard
 * lieferte. Jetzt zaehlt sie alle deutschen Stimmen des Moduls auf
 * (stimmen()), die Seite zeigt sie unter Einstellungen -> Vorlesen zum
 * Anhoeren (probe()), und die gewaehlte (waehlen()) bleibt gespeichert
 * und wird bei jedem Aufbau wieder gesetzt. Leer = Standard des Moduls.
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
    private static final String ABLAGE = "stimme";          // SharedPreferences
    private static final String ABLAGE_NAME = "name";
    private static String gewaehlteStimme = null;           // null = noch nicht gelesen, "" = Standard des Moduls
    private static final String ABLAGE_MODUL = "modul";      // gewaehltes Sprachmodul (Paketname), "" = Standard des Handys
    private static boolean modulGeladen = false;

    private Stimme() { }

    /** Aus onCreate der Oberflaeche. Verbindet nur, wenn noetig. */
    static synchronized void anmelden(Context ctx, Melder m) {
        melder = m;
        app = ctx.getApplicationContext();
        modulLaden();
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
        // 25.10.2026: Antwortet ein ausdruecklich gewaehltes Modul (zum Beispiel Acapela mit abgeschaltetem
        // Server) nicht, spricht die App weiter mit Google. Gemerkt bleibt die Wahl des Benutzers.
        else if (versuche >= 1 && gewuenscht != null && !gewuenscht.equals(GOOGLE) && googleDa()) gewuenscht = GOOGLE;
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

    /**
     * Deutsch einstellen - aber mit der Stimme, die im Sprachmodul selbst gewaehlt ist (Stand 393, 31.10.2026).
     * Dietmar: "Seltsam, es verwendet Acapela, aber nicht die Stimme, die ich ausgewaehlt habe." Vorher stellte die App
     * hart auf Locale.GERMANY; Module wie Acapela nehmen dann ihre erste deutsche Stimme statt der eingestellten.
     * Jetzt der Reihe nach: (1) die Sprache aus den Einstellungen mit Variante (Acapela: JULIA); (2) die Standardstimme
     * des Moduls; (3) die Standardsprache; (4) erst dann de-DE bzw. de.
     * Nur mit Sperre.
     */
    private static int deutschWieImModul() {
        if (tts == null) return TextToSpeech.LANG_NOT_SUPPORTED;
        try {
            // (1) Die Sprache aus den Einstellungen des Moduls - mit Land und Variante. Acapela fuehrt die Stimme als
            //     Variante: bei Dietmar "Deutsch (Deutschland, JULIA)". Fehlt die Variante, aus der Android-Einstellung.
            Locale std = null;
            try { std = tts.getDefaultLanguage(); } catch (Exception e) { std = null; }
            if (std == null || std.getVariant() == null || std.getVariant().isEmpty()) {
                Locale aus = ausAndroidEinstellung();
                if (aus != null) std = aus;
            }
            boolean deutsch = std != null && "de".equalsIgnoreCase(std.getLanguage());
            if (deutsch && std.getVariant() != null && !std.getVariant().isEmpty()) {
                int r = tts.setLanguage(std);
                if (r != TextToSpeech.LANG_MISSING_DATA && r != TextToSpeech.LANG_NOT_SUPPORTED) return r;
            }
            // (2) Die Standardstimme des Moduls (Module mit Stimmen-Schnittstelle, z. B. Google, Samsung)
            Voice dv = null;
            try { dv = tts.getDefaultVoice(); } catch (Exception e) { dv = null; }
            if (dv != null && dv.getLocale() != null && "de".equalsIgnoreCase(dv.getLocale().getLanguage())
                    && tts.setVoice(dv) == TextToSpeech.SUCCESS) return TextToSpeech.LANG_COUNTRY_AVAILABLE;
            // (3) Die Standardsprache ohne Variante
            if (deutsch) {
                int r = tts.setLanguage(std);
                if (r != TextToSpeech.LANG_MISSING_DATA && r != TextToSpeech.LANG_NOT_SUPPORTED) return r;
            }
            // (4) wie bisher
            int r = tts.setLanguage(Locale.GERMANY);
            if (r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED) r = tts.setLanguage(Locale.GERMAN);
            return r;
        } catch (Exception e) { return TextToSpeech.LANG_NOT_SUPPORTED; }
    }

    /**
     * Die Sprache, die in den Android-Einstellungen (Sprachausgabe -> Sprache) fuer das laufende Modul steht.
     * Android legt sie als "paket:deu-DEU-JULIA,anderes:..." ab (Settings.Secure "tts_default_locale").
     * Gibt de-DE-JULIA zurueck, sonst null.
     */
    private static Locale ausAndroidEinstellung() {
        try {
            String alle = android.provider.Settings.Secure.getString(app.getContentResolver(), "tts_default_locale");
            if (alle == null || alle.isEmpty()) return null;
            String paket = modul;
            try { if (paket == null || paket.isEmpty()) paket = gewuenscht != null ? gewuenscht : tts.getDefaultEngine(); } catch (Exception e) { }
            String wert = null;
            for (String teil : alle.split(",")) {
                int dp = teil.indexOf(':');
                if (dp < 0) { if (wert == null) wert = teil; continue; }        // alte Form ohne Paket
                if (paket != null && teil.substring(0, dp).equals(paket)) { wert = teil.substring(dp + 1); break; }
            }
            if (wert == null) return null;
            String[] s = wert.split("[-_]");
            if (s.length == 0 || !(s[0].equalsIgnoreCase("de") || s[0].equalsIgnoreCase("deu") || s[0].equalsIgnoreCase("ger"))) return null;
            String land = s.length > 1 ? s[1] : "";
            if (land.equalsIgnoreCase("DEU")) land = "DE"; else if (land.equalsIgnoreCase("AUT")) land = "AT"; else if (land.equalsIgnoreCase("CHE")) land = "CH";
            String variante = s.length > 2 ? s[2] : "";
            return new Locale("de", land.toUpperCase(Locale.ROOT), variante);
        } catch (Exception e) { return null; }
    }

    /** Das Modul hat sich gemeldet: Sprache einstellen, Rueckmeldungen anschliessen. Nur mit Sperre. */
    private static void einrichten() {
        if (tts == null) return;
        int r = deutschWieImModul();
        letzteSprache = r;
        bereit = r != TextToSpeech.LANG_MISSING_DATA && r != TextToSpeech.LANG_NOT_SUPPORTED;
        if (bereit) stimmeAnwenden();
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

    // ---- Modulwahl (25.10.2026): Google, Samsung, Acapela ... ----

    /** Einmal pro Start: das gemerkte Sprachmodul wieder wählen, wenn es noch installiert ist. */
    private static void modulLaden() {
        if (modulGeladen || app == null) return;
        modulGeladen = true;
        String m;
        try { m = app.getSharedPreferences(ABLAGE, Context.MODE_PRIVATE).getString(ABLAGE_MODUL, ""); }
        catch (Exception e) { m = ""; }
        if (m == null || m.isEmpty()) return;
        try { app.getPackageManager().getPackageInfo(m, 0); gewuenscht = m; }
        catch (Exception e) { /* nicht mehr installiert: Standard */ }
    }

    /**
     * Alle Sprachmodule des Handys als JSON-Liste:
     * [{"name":"com.google.android.tts","label":"Sprachausgabe von Google","gewaehlt":true}, ...]
     * "gewaehlt" = das Modul, das gerade spricht. Leer, solange noch kein Modul verbunden war.
     */
    static synchronized String module() {
        if (tts == null) return "[]";
        List<TextToSpeech.EngineInfo> eng;
        try { eng = tts.getEngines(); } catch (Exception e) { return "[]"; }
        if (eng == null) return "[]";
        String aktiv = modul == null ? "" : modul;
        // Standard des Handys (25.10.2026, Dietmar: "Ich kann das leider nicht mehr zurueckstellen"):
        // eine eigene Zeile, damit man nach einem Ausflug zu einem anderen Modul genau dorthin zurueck kann,
        // wo man vorher war - ohne dass die App ein Modul vorgibt.
        String standardName = "";
        try { standardName = tts.getDefaultEngine(); } catch (Exception e) { }
        String standardLabel = "";
        for (TextToSpeech.EngineInfo e : eng) if (e.name.equals(standardName)) standardLabel = e.label;
        StringBuilder sb = new StringBuilder("[");
        sb.append("{\"name\":\"\",\"label\":")
          .append(json("Standard des Handys" + (standardLabel.isEmpty() ? "" : " (" + standardLabel + ")")))
          .append(",\"gewaehlt\":").append(gewuenscht == null).append('}');
        for (TextToSpeech.EngineInfo e : eng) {
            sb.append(',');
            sb.append("{\"name\":").append(json(e.name))
              .append(",\"label\":").append(json(e.label))
              .append(",\"gewaehlt\":").append(gewuenscht != null && e.name.equals(aktiv))
              .append('}');
        }
        return sb.append(']').toString();
    }

    /** Sprachmodul wählen und merken. "" = Standard des Handys. Baut die Verbindung neu auf. */
    static synchronized boolean modulWaehlen(String paket) {
        if (app == null) return false;
        String p = paket == null ? "" : paket.trim();
        try { app.getSharedPreferences(ABLAGE, Context.MODE_PRIVATE).edit().putString(ABLAGE_MODUL, p).putString(ABLAGE_NAME, "").apply(); }
        catch (Exception e) { }
        gewaehlteStimme = "";                       // die Stimmen sind je Modul andere
        gewuenscht = p.isEmpty() ? null : p;
        modulGeladen = true;
        versuche = 0;
        modul = null;
        neu();
        return true;
    }

    // ---- Stimmenwahl (23.10.2026) ----

    private static String gemerkt() {
        if (gewaehlteStimme == null) {
            try { gewaehlteStimme = app.getSharedPreferences(ABLAGE, Context.MODE_PRIVATE).getString(ABLAGE_NAME, ""); }
            catch (Exception e) { gewaehlteStimme = ""; }
            if (gewaehlteStimme == null) gewaehlteStimme = "";
        }
        return gewaehlteStimme;
    }

    /** Die gemerkte Stimme setzen - nur mit Sperre, nur wenn das Modul bereit ist. */
    private static boolean stimmeAnwenden() {
        if (tts == null || app == null) return false;
        String name = gemerkt();
        if (name.isEmpty()) return true;                       // Standard des Moduls
        try {
            Set<Voice> alle = tts.getVoices();
            if (alle == null) return false;
            for (Voice v : alle) {
                if (name.equals(v.getName())) return tts.setVoice(v) == TextToSpeech.SUCCESS;
            }
        } catch (Exception e) { }
        return false;                                          // nicht (mehr) da: Standard bleibt
    }

    private static String json(String s) {
        if (s == null) return "\"\"";
        StringBuilder b = new StringBuilder("\"");
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '"' || c == '\\') b.append('\\').append(c);
            else if (c < 32) b.append(' ');
            else b.append(c);
        }
        return b.append('"').toString();
    }

    /**
     * Alle deutschen Stimmen des Moduls als JSON-Liste:
     * [{"name":..,"sprache":"de-DE","guete":..,"netz":false,"gewaehlt":false}, ...]
     * Leer, solange das Modul nicht bereit ist.
     */
    static synchronized String stimmen() {
        if (tts == null || !bereit) return "[]";
        Set<Voice> alle;
        try { alle = tts.getVoices(); } catch (Exception e) { return "[]"; }
        if (alle == null) return "[]";
        List<Voice> de = new ArrayList<>();
        for (Voice v : alle) {
            try {
                Locale l = v.getLocale();
                if (l == null || !"de".equalsIgnoreCase(l.getLanguage())) continue;
                de.add(v);
            } catch (Exception e) { }
        }
        // Erst die ohne Netz, dann nach Guete absteigend, dann nach Name.
        Collections.sort(de, (a, b) -> {
            if (a.isNetworkConnectionRequired() != b.isNetworkConnectionRequired()) return a.isNetworkConnectionRequired() ? 1 : -1;
            if (a.getQuality() != b.getQuality()) return b.getQuality() - a.getQuality();
            return a.getName().compareTo(b.getName());
        });
        String name = gemerkt();
        StringBuilder sb = new StringBuilder("[");
        boolean erste = true;
        for (Voice v : de) {
            if (!erste) sb.append(',');
            erste = false;
            sb.append("{\"name\":").append(json(v.getName()))
              .append(",\"sprache\":").append(json(v.getLocale().toLanguageTag()))
              .append(",\"guete\":").append(v.getQuality())
              .append(",\"netz\":").append(v.isNetworkConnectionRequired())
              .append(",\"gewaehlt\":").append(name.equals(v.getName()))
              .append('}');
        }
        return sb.append(']').toString();
    }

    /** Stimme merken und sofort setzen. "" oder null = Standard des Moduls. */
    static synchronized boolean waehlen(String name) {
        if (app == null) return false;
        gewaehlteStimme = name == null ? "" : name;
        try { app.getSharedPreferences(ABLAGE, Context.MODE_PRIVATE).edit().putString(ABLAGE_NAME, gewaehlteStimme).apply(); }
        catch (Exception e) { }
        if (tts == null || !bereit) return false;
        if (gewaehlteStimme.isEmpty()) {
            deutschWieImModul();
            return true;
        }
        return stimmeAnwenden();
    }

    /** Spricht den Satz direkt ueber den Lautsprecher - zum Anhoeren in den Einstellungen. */
    static boolean probe(String text) {
        TextToSpeech t;
        synchronized (Stimme.class) {
            if (!bereit || tts == null || text == null || text.isEmpty()) return false;
            t = tts;
        }
        try { return t.speak(text.length() > 400 ? text.substring(0, 400) : text, TextToSpeech.QUEUE_FLUSH, null, "probe") == TextToSpeech.SUCCESS; }
        catch (Exception e) { return false; }
    }

    private static void fertig(String id, boolean ok) {
        Melder m;
        synchronized (Stimme.class) { m = melder; }
        if (m != null) m.melden(id, ok);
    }
}
