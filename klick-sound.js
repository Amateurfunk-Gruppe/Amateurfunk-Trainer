// ================================================================
// klick-sound.js  -  kurzer Klickton bei Bedienelementen
//
// Spielt sounds/mouse-click.wav genau einmal pro Klick ab.
//
// ANPASSEN:
//   ELEMENTE  -> welche Elemente einen Ton ausloesen
//   LAUTSTAERKE -> 0.0 (still) bis 1.0 (volle Lautstaerke)
//
// Im Browser lässt sich der Ton jederzeit umschalten:
//   klickSound.aus()   /   klickSound.an()   /   klickSound.test()
// Die Einstellung bleibt gespeichert.
// ================================================================
(function () {
    'use strict';

    var DATEI = 'sounds/mouse-click.wav';
    var LAUTSTAERKE = 0.5;

    // Welche Elemente klingen sollen. Wer die Antwort-Optionen NICHT
    // vertonen möchte, entfernt einfach '.option' aus dieser Liste.
    var ELEMENTE = [
        'button',
        '.btn',
        '.nav-btn',
        '[role="button"]',
        'input[type="button"]',
        'input[type="submit"]',
        '.option'
    ].join(',');

    // Mehrere Audio-Objekte im Wechsel: so schneidet ein schneller zweiter
    // Klick den ersten Ton nicht ab, wie es bei einem einzelnen Objekt wäre.
    var POOL_GROESSE = 4;
    var pool = [];
    var poolIndex = 0;
    var verfuegbar = true;
    var aus = false;

    try {
        aus = localStorage.getItem('klickSoundAus') === '1';
    } catch (e) { /* privater Modus o.ä. */ }

    function poolAufbauen() {
        if (pool.length) return;
        for (var i = 0; i < POOL_GROESSE; i++) {
            var a = new Audio(DATEI);
            a.preload = 'auto';
            a.volume = LAUTSTAERKE;
            // Fehlt die Datei, nicht bei jedem Klick erneut versuchen
            a.addEventListener('error', function () {
                if (verfuegbar) {
                    console.warn('[KLICK] ' + DATEI + ' nicht gefunden - Klickton bleibt aus.');
                    verfuegbar = false;
                }
            });
            pool.push(a);
        }
    }

    function abspielen() {
        if (aus || !verfuegbar) return;
        poolAufbauen();
        var a = pool[poolIndex];
        poolIndex = (poolIndex + 1) % pool.length;
        try {
            a.currentTime = 0;
            var p = a.play();
            // play() liefert ein Promise; ohne catch gäbe es unschöne
            // "Uncaught (in promise)"-Meldungen in der Konsole.
            if (p && typeof p.catch === 'function') p.catch(function () {});
        } catch (e) { /* egal - ein Klickton ist nichts Kritisches */ }
    }

    function istBedienelement(ziel) {
        if (!ziel || !ziel.closest) return null;
        var el = ziel.closest(ELEMENTE);
        if (!el) return null;
        if (el.disabled) return null;
        if (el.getAttribute && el.getAttribute('aria-disabled') === 'true') return null;
        // Ausdrücklich abgewählte Elemente respektieren
        if (el.closest('[data-kein-klickton]')) return null;
        return el;
    }

    // Capture-Phase: manche Handler im Trainer rufen stopPropagation() auf.
    // In der Bubble-Phase käme der Klick hier dann nie an.
    document.addEventListener('click', function (e) {
        if (e.button !== undefined && e.button !== 0) return;   // nur linke Maustaste
        if (!istBedienelement(e.target)) return;
        abspielen();
    }, true);

    // Tastaturbedienung: Leertaste/Enter auf einem fokussierten Knopf
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        var aktiv = document.activeElement;
        if (!aktiv) return;
        // In Textfeldern soll nichts klicken
        var tag = (aktiv.tagName || '').toLowerCase();
        if (tag === 'input' && aktiv.type !== 'button' && aktiv.type !== 'submit') return;
        if (tag === 'textarea' || aktiv.isContentEditable) return;
        if (!istBedienelement(aktiv)) return;
        abspielen();
    }, true);

    window.klickSound = {
        an: function () {
            aus = false;
            try { localStorage.setItem('klickSoundAus', '0'); } catch (e) {}
            console.log('[KLICK] Klickton eingeschaltet');
        },
        aus: function () {
            aus = true;
            try { localStorage.setItem('klickSoundAus', '1'); } catch (e) {}
            console.log('[KLICK] Klickton ausgeschaltet');
        },
        umschalten: function () { aus ? window.klickSound.an() : window.klickSound.aus(); },
        istAn: function () { return !aus; },
        lautstaerke: function (wert) {
            LAUTSTAERKE = Math.max(0, Math.min(1, Number(wert) || 0));
            pool.forEach(function (a) { a.volume = LAUTSTAERKE; });
            console.log('[KLICK] Lautstärke:', LAUTSTAERKE);
        },
        test: function () { abspielen(); }
    };

    // Datei schon einmal laden, damit der erste Klick nicht verzögert klingt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', poolAufbauen);
    } else {
        poolAufbauen();
    }
})();
