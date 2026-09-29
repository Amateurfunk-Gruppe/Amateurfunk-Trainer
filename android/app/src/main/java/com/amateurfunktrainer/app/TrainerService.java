package com.amateurfunktrainer.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Collections;

/**
 * Der Dienst, der den Trainer-Server am Leben haelt (29.09.2026).
 *
 * Android schaltet Apps im Hintergrund ab. Fuer "Handy als Server" darf
 * das nicht passieren - also laeuft der Server als Vordergrund-Dienst mit
 * einer festen Anzeige: "Amateurfunk-Trainer laeuft - im WLAN unter ...".
 * Dort steht auch der Knopf "Beenden".
 */
public class TrainerService extends Service {
    static final String KANAL = "trainer";
    static final String BEENDEN = "com.amateurfunktrainer.app.BEENDEN";
    private PowerManager.WakeLock wach;
    private WifiManager.WifiLock wlan;

    @Override public IBinder onBind(Intent intent) { return null; }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && BEENDEN.equals(intent.getAction())) {
            stopForeground(true);
            stopSelf();
            // Node laesst sich nicht sauber anhalten - der Prozess geht.
            android.os.Process.killProcess(android.os.Process.myPid());
            return START_NOT_STICKY;
        }
        Notification n = anzeige();
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(1, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        } else {
            startForeground(1, n);
        }
        festhalten();
        NodeStarter.starten(this);
        return START_STICKY;
    }

    @Override public void onDestroy() {
        try { if (wach != null && wach.isHeld()) wach.release(); } catch (Exception e) { }
        try { if (wlan != null && wlan.isHeld()) wlan.release(); } catch (Exception e) { }
        super.onDestroy();
    }

    /** CPU und WLAN wach halten, solange der Server laeuft. */
    private void festhalten() {
        try {
            if (wach == null) {
                PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                wach = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "trainer:server");
                wach.setReferenceCounted(false);
                wach.acquire();
            }
            if (wlan == null) {
                WifiManager wm = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
                wlan = wm.createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "trainer:wlan");
                wlan.setReferenceCounted(false);
                wlan.acquire();
            }
        } catch (Exception e) { }
    }

    private Notification anzeige() {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm.getNotificationChannel(KANAL) == null) {
            NotificationChannel k = new NotificationChannel(KANAL, "Trainer-Server", NotificationManager.IMPORTANCE_LOW);
            k.setDescription("Zeigt, dass der Trainer laeuft und unter welcher Adresse ihn andere im WLAN erreichen.");
            nm.createNotificationChannel(k);
        }
        PendingIntent oeffnen = PendingIntent.getActivity(this, 0,
            new Intent(this, MainActivity.class), PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        PendingIntent beenden = PendingIntent.getService(this, 1,
            new Intent(this, TrainerService.class).setAction(BEENDEN), PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        String ip = wlanAdresse();
        String text = ip != null ? "Im WLAN erreichbar unter http://" + ip + ":3000" : "Läuft auf diesem Handy";
        return new Notification.Builder(this, KANAL)
            .setSmallIcon(R.drawable.ic_benachrichtigung)
            .setContentTitle("Amateurfunk-Trainer läuft")
            .setContentText(text)
            .setStyle(new Notification.BigTextStyle().bigText(text))
            .setContentIntent(oeffnen)
            .setOngoing(true)
            .addAction(new Notification.Action.Builder(null, "Beenden", beenden).build())
            .build();
    }

    static String wlanAdresse() {
        try {
            for (NetworkInterface ni : Collections.list(NetworkInterface.getNetworkInterfaces())) {
                if (!ni.isUp() || ni.isLoopback()) continue;
                for (InetAddress a : Collections.list(ni.getInetAddresses())) {
                    if (a instanceof Inet4Address && a.isSiteLocalAddress()) return a.getHostAddress();
                }
            }
        } catch (Exception e) { }
        return null;
    }
}
