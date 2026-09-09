// ================================================================
//  sw.js - der Service Worker des Amateurfunk-Trainers
// ----------------------------------------------------------------
//  Dietmar am 06.09.2026: "Progressive Web App (PWA). Eine PWA ist im
//  Grunde eine normale Website, die jedoch so optimiert ist, dass sie
//  sich nach dem Oeffnen ueber einen Link genau wie eine native
//  Smartphone-App anfuehlt und verhaelt. Bekommen wir das hin?"
//
//  Ja. Drei Stuecke gehoeren dazu, und dies ist das dritte:
//    1. manifest.webmanifest  - Name, Symbol, Start ohne Adressleiste
//    2. Die App-Anmutung im Stylesheet (kein Antipp-Blitz, kein
//       Gummiband, Platz fuer die Kamera-Aussparung)
//    3. Dieser Service Worker - er macht die Seite installierbar und
//       laesst sie auch ohne Netz starten.
//
//  WICHTIGSTE ENTSCHEIDUNG: ZUERST DAS NETZ, DER SPEICHER NUR ALS
//  RUECKFALL.
//  Der uebliche Weg waere umgekehrt - erst aus dem Speicher liefern,
//  das ist schneller. Fuer diesen Trainer waere das aber falsch: Er
//  bekommt fast taeglich eine neue Index.html, und ein Speicher, der
//  gewinnt, wuerde genau die alte Fassung festhalten. Man saehe seine
//  Aenderung nicht und suchte den Fehler an der falschen Stelle.
//  Also: Ist Netz da, kommt die frische Datei; ist keines da, die
//  zuletzt gesehene.
//
//  NICHT ANGEFASST werden alle beweglichen Sachen: /api/, socket.io,
//  die Sprachausgabe. Sie gehoeren nie in einen Speicher.
//
//  ZUM WISSEN: Ein Service Worker laeuft nur in einer sicheren
//  Umgebung - also ueber https oder auf localhost. Ueber die nackte
//  LAN-Adresse (http://192.168.x.x) wird er nicht registriert. Am
//  Handy heisst das: ueber den Tunnel-Link ja, im heimischen WLAN per
//  IP-Adresse nein. Der Trainer laeuft dort trotzdem, nur eben ohne
//  Symbol auf dem Startbildschirm.
// ================================================================
'use strict';

// v2 seit 09.09.2026: Mit dem neuen Zeichen aendern sich icon-192.png,
// icon-512.png und favicon.ico. Der Name des Speichers ist die einzige
// Stelle, an der man einem Browser sagen kann, dass er alles Alte
// wegwerfen soll - beim Aktivieren loescht die Funktion unten jeden
// Speicher, der nicht so heisst.
const SPEICHER = 'afu-trainer-v2';

// Was beim ersten Besuch schon einmal mitgenommen wird, damit ein
// spaeterer Start ohne Netz nicht auf eine leere Seite laeuft.
const GRUNDSTOCK = [
    './',
    './Index.html',
    './duo.js',
    './klick-sound.js',
    './manifest.webmanifest',
    './icon-192.png',
    './icon-512.png',
    './icon-512-maskierbar.png'
];

self.addEventListener('install', ereignis => {
    // skipWaiting: Eine neue Fassung uebernimmt sofort und wartet nicht,
    // bis alle Fenster geschlossen sind. Bei einem Trainer, der taeglich
    // aktualisiert wird, ist das Warten die schlechtere Wahl.
    self.skipWaiting();
    ereignis.waitUntil(
        caches.open(SPEICHER)
            .then(speicher => speicher.addAll(GRUNDSTOCK).catch(() => {}))
    );
});

self.addEventListener('activate', ereignis => {
    ereignis.waitUntil((async () => {
        // Alte Speicherstaende wegraeumen.
        const namen = await caches.keys();
        await Promise.all(namen.filter(n => n !== SPEICHER).map(n => caches.delete(n)));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', ereignis => {
    const anfrage = ereignis.request;

    // Nur einfache Abrufe. Alles, was etwas veraendert, geht direkt
    // ans Netz und wird nie gespeichert.
    if (anfrage.method !== 'GET') return;

    let adresse;
    try { adresse = new URL(anfrage.url); } catch (e) { return; }

    // Fremde Server gehen uns nichts an.
    if (adresse.origin !== self.location.origin) return;

    // Bewegliche Sachen: Schnittstellen, Gruppenraum, Sprachausgabe.
    if (adresse.pathname.startsWith('/api/')
     || adresse.pathname.startsWith('/socket.io/')
     || adresse.pathname.startsWith('/tts')
     || adresse.pathname.startsWith('/hoerbuch')) return;

    ereignis.respondWith((async () => {
        try {
            const frisch = await fetch(anfrage);
            // Nur richtige Antworten speichern. Ein 404 oder ein halber
            // Teilinhalt (206) hat im Speicher nichts verloren.
            if (frisch && frisch.status === 200 && frisch.type === 'basic') {
                const kopie = frisch.clone();
                caches.open(SPEICHER).then(sp => sp.put(anfrage, kopie)).catch(() => {});
            }
            return frisch;
        } catch (e) {
            // Kein Netz: das zuletzt Gesehene.
            const gespeichert = await caches.match(anfrage);
            if (gespeichert) return gespeichert;
            // Eine Seite, die noch nie da war - dann wenigstens die
            // Startseite, statt der Fehlerseite des Browsers.
            if (anfrage.mode === 'navigate') {
                const start = await caches.match('./Index.html');
                if (start) return start;
            }
            throw e;
        }
    })());
});
