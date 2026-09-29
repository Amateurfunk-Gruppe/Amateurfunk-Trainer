package com.amateurfunktrainer.app;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

/**
 * Startet die App neu (29.09.2026).
 *
 * Dietmar: "in der Ersten Version, konnte ich über GitHub Update machen" -
 * der Datei-Updater ist in der App wieder an. Kommen dabei Programmdateien
 * (Server.js ...), muss Node neu starten - und Node laesst sich je Prozess
 * nur einmal starten. Also: ganzer Prozess neu.
 *
 * Dieses kleine Fenster laeuft in einem EIGENEN Prozess (":neustart", siehe
 * AndroidManifest.xml). Es beendet den alten App-Prozess, oeffnet die App
 * frisch und geht dann selbst. Ein Wecker (AlarmManager) taete es nicht:
 * Seit Android 10 darf eine App aus dem Hintergrund kein Fenster mehr
 * oeffnen, und nach dem Beenden waere sie genau dort.
 */
public class NeustartActivity extends Activity {
    static final String ALTE_PID = "alte_pid";

    static void neuStarten(Activity von) {
        Intent i = new Intent(von, NeustartActivity.class)
            .putExtra(ALTE_PID, android.os.Process.myPid())
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        von.startActivity(i);
        von.overridePendingTransition(0, 0);
    }

    @Override protected void onCreate(Bundle zustand) {
        super.onCreate(zustand);
        int alt = getIntent().getIntExtra(ALTE_PID, -1);
        // Dienst und Node gehen mit dem alten Prozess.
        try { stopService(new Intent(this, TrainerService.class)); } catch (Exception e) { }
        if (alt > 0) android.os.Process.killProcess(alt);
        // Kurz warten, bis der Port 3000 frei ist, dann die App frisch oeffnen.
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            Intent start = new Intent(this, MainActivity.class)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(start);
            overridePendingTransition(0, 0);
            finish();
            android.os.Process.killProcess(android.os.Process.myPid());
        }, 700);
    }
}
