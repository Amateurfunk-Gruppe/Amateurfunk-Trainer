// ============================================================================
//  verknuepfung_auffrischen.js
//  Das neue Zeichen auf die Verknuepfung auf dem Schreibtisch bringen
// ----------------------------------------------------------------------------
//  Dietmar am 09.09.2026: "Das neue Icon auf dem Desktop muss sich bei
//  Windows Linux und Mac automatisch erneuern."
//
//  WARUM DAS UEBERHAUPT NOETIG IST
//  Alle drei Systeme merken sich Zeichen in einem Zwischenspeicher, und zwar
//  nach dem PFAD der Bilddatei, nicht nach ihrem Inhalt. Der Pfad bleibt bei
//  einem Update derselbe (icon.ico liegt immer im Trainer-Ordner) - also
//  sieht das System keinen Grund, noch einmal hinzusehen. Man tauscht die
//  Datei, und auf dem Schreibtisch klebt weiter das alte Bild, oft ueber
//  Wochen.
//
//  Jedes System braucht seinen eigenen Anstoss:
//
//    Windows  Die Verknuepfung (.lnk) wird einmal geoeffnet und unveraendert
//             wieder gespeichert. Dadurch bekommt sie einen neuen Zeitstempel,
//             und der Explorer liest das Zeichen neu ein. Dazu
//             "ie4uinit.exe -show", der amtliche Weg, den Zwischenspeicher
//             der Shell zu leeren.
//
//    Linux    Die .desktop-Datei wird angefasst (touch) und, wo vorhanden,
//             update-desktop-database und gtk-update-icon-cache angestossen.
//
//    macOS    Das neue icon.icns kommt in die .app, dann wird das Buendel
//             angefasst. Der Finder liest das Zeichen daraufhin neu.
//
//  WAS DIESES SKRIPT NICHT TUT
//  Es legt keine Verknuepfung an, aendert kein Ziel und loescht nichts. Es
//  fasst nur an, was schon da ist. Findet es nichts, geht es still wieder
//  hinaus - auf einem Rechner ohne Schreibtisch-Verknuepfung ist nichts zu
//  tun, und das ist kein Fehler.
//
//  Aufruf:  node verknuepfung_auffrischen.js
//  Sonst wird es vom Server nach einem Update aufgerufen (siehe
//  github_update.js), wenn eine der Zeichen-Dateien dabei war.
// ============================================================================
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const WURZEL = __dirname;

// Still: Fehler landen im Log, nie auf dem Bildschirm. Ein Zeichen, das
// nicht auffrischt, darf keinen Start und kein Update aufhalten.
function sag(text) { console.log('[ZEICHEN] ' + text); }
function still(fn) { try { return fn(); } catch (e) { return null; } }

// Ein Programm aufrufen und Fehler schlucken. Kein shell:true - die Pfade
// kommen zwar aus dem eigenen Ordner, aber eine Zeile ohne Shell kann gar
// nicht erst falsch verstanden werden.
function ruf(programm, args, optionen) {
    try {
        execFileSync(programm, args, Object.assign({ stdio: 'ignore', timeout: 20000 }, optionen || {}));
        return true;
    } catch (e) { return false; }
}

// ---------------------------------------------------------------------------
//  WINDOWS
// ---------------------------------------------------------------------------
function windows() {
    let angefasst = 0;

    // Wo koennen Verknuepfungen liegen? Der Schreibtisch des Benutzers, der
    // gemeinsame Schreibtisch (dorthin legt das Setup sie) und das Startmenue.
    const orte = [
        path.join(os.homedir(), 'Desktop'),
        path.join(os.homedir(), 'OneDrive', 'Desktop'),          // sehr verbreitet
        path.join(process.env.PUBLIC || 'C:\\Users\\Public', 'Desktop'),
        path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
        path.join(process.env.ProgramData || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs')
    ].filter(Boolean);

    const treffer = [];
    for (const ort of orte) {
        if (!still(() => fs.existsSync(ort))) continue;
        // Auch eine Ebene tiefer nachsehen: Das Setup legt eine eigene Gruppe
        // im Startmenue an.
        const kandidaten = [ort];
        for (const e of still(() => fs.readdirSync(ort, { withFileTypes: true })) || []) {
            if (e.isDirectory() && /amateurfunk/i.test(e.name)) kandidaten.push(path.join(ort, e.name));
        }
        for (const k of kandidaten) {
            for (const e of still(() => fs.readdirSync(k)) || []) {
                if (/\.lnk$/i.test(e) && /amateurfunk/i.test(e)) treffer.push(path.join(k, e));
            }
        }
    }

    if (treffer.length) {
        // Die Verknuepfung oeffnen und unveraendert speichern. Das Zeichen
        // wird dabei ausdruecklich noch einmal gesetzt - auch dann, wenn es
        // schon vorher richtig eingetragen war: Erst das Speichern gibt der
        // Datei den neuen Zeitstempel, an dem der Explorer merkt, dass er
        // nachsehen muss.
        const ps = [
            '$ErrorActionPreference = "SilentlyContinue"',
            '$w = New-Object -ComObject WScript.Shell',
            '$icon = "' + path.join(WURZEL, 'icon.ico').replace(/"/g, '""') + '"',
            'foreach ($p in @(' + treffer.map(t => '"' + t.replace(/"/g, '""') + '"').join(',') + ')) {',
            '  $s = $w.CreateShortcut($p)',
            '  if ($s.IconLocation -and ($s.IconLocation -like "*icon.ico*")) { $s.IconLocation = "$icon,0" }',
            '  $s.Save()',
            '}'
        ].join('; ');
        if (ruf('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps])) {
            angefasst = treffer.length;
        }
    }

    // Der Zwischenspeicher der Shell. "-show" ist der Weg, den Microsoft
    // selbst benutzt; auf aelteren Fassungen hiess er "-ClearIconCache".
    // Beides versuchen, beides darf fehlschlagen.
    ruf('ie4uinit.exe', ['-show']);
    ruf('ie4uinit.exe', ['-ClearIconCache']);

    sag(angefasst ? (angefasst + ' Verknuepfung(en) aufgefrischt')
                  : 'keine Verknuepfung gefunden - nichts zu tun');
    return angefasst;
}

// ---------------------------------------------------------------------------
//  LINUX
// ---------------------------------------------------------------------------
function linux() {
    let angefasst = 0;
    const schreibtische = [
        path.join(os.homedir(), 'Desktop'),
        path.join(os.homedir(), 'Schreibtisch')      // aeltere deutsche Systeme
    ];
    // xdg-user-dir kennt den richtigen Namen, wenn es da ist.
    try {
        const d = execFileSync('xdg-user-dir', ['DESKTOP'], { encoding: 'utf8', timeout: 5000 }).trim();
        if (d) schreibtische.unshift(d);
    } catch (e) {}

    const dateien = [];
    for (const ort of schreibtische) {
        const p = path.join(ort, 'amateurfunk-trainer.desktop');
        if (still(() => fs.existsSync(p))) dateien.push(p);
    }
    const imMenue = path.join(os.homedir(), '.local', 'share', 'applications',
                              'amateurfunk-trainer.desktop');
    if (still(() => fs.existsSync(imMenue))) dateien.push(imMenue);

    for (const d of dateien) {
        // Neu schreiben statt nur anfassen: Manche Arbeitsumgebungen sehen
        // sich nur den Inhalt an, andere nur den Zeitstempel. So bekommen
        // beide, was sie brauchen. Der Inhalt bleibt derselbe.
        const inhalt = still(() => fs.readFileSync(d, 'utf8'));
        if (inhalt === null) continue;
        if (still(() => { fs.writeFileSync(d, inhalt); return true; })) {
            still(() => fs.chmodSync(d, 0o755));
            angefasst++;
        }
    }

    // Und den Systemen sagen, dass sie nachsehen sollen.
    ruf('update-desktop-database', [path.join(os.homedir(), '.local', 'share', 'applications')]);
    ruf('gtk-update-icon-cache', ['-f', '-t', path.join(os.homedir(), '.local', 'share', 'icons')]);
    for (const d of dateien) ruf('gio', ['set', d, 'metadata::trusted', 'true']);

    sag(angefasst ? (angefasst + ' Verknuepfung(en) aufgefrischt')
                  : 'keine .desktop-Datei gefunden - nichts zu tun');
    return angefasst;
}

// ---------------------------------------------------------------------------
//  macOS
// ---------------------------------------------------------------------------
function mac() {
    let angefasst = 0;
    const quelle = path.join(WURZEL, 'icon.icns');
    const gibtsIcns = still(() => fs.existsSync(quelle));

    const orte = [path.join(os.homedir(), 'Desktop'), '/Applications'];
    for (const ort of orte) {
        for (const e of still(() => fs.readdirSync(ort)) || []) {
            if (!/\.app$/.test(e)) continue;
            if (!/amateurfunk/i.test(e)) continue;
            const app = path.join(ort, e);
            const res = path.join(app, 'Contents', 'Resources');
            const plist = path.join(app, 'Contents', 'Info.plist');

            if (gibtsIcns) {
                still(() => fs.mkdirSync(res, { recursive: true }));
                still(() => fs.copyFileSync(quelle, path.join(res, 'icon.icns')));
            }
            // Steht das Zeichen schon in der Info.plist? Aeltere Buendel
            // wurden ohne angelegt - dann zeigt der Finder das leere
            // Standardblatt, egal wie oft man auffrischt.
            const p = still(() => fs.readFileSync(plist, 'utf8'));
            if (p !== null && p.indexOf('CFBundleIconFile') === -1) {
                const neu = p.replace('<key>CFBundleName</key>',
                    '<key>CFBundleIconFile</key><string>icon</string>\n  <key>CFBundleName</key>');
                still(() => fs.writeFileSync(plist, neu));
            }
            // Anfassen - erst innen, dann das Buendel selbst. Der Finder
            // sieht auf den Zeitstempel des Ordners.
            const jetzt = new Date();
            still(() => fs.utimesSync(plist, jetzt, jetzt));
            still(() => fs.utimesSync(app, jetzt, jetzt));
            ruf('touch', [app]);
            angefasst++;
        }
    }
    sag(angefasst ? (angefasst + ' .app aufgefrischt (der Finder braucht manchmal einen Moment)')
                  : 'keine .app gefunden - nichts zu tun');
    return angefasst;
}

// ---------------------------------------------------------------------------
function auffrischen() {
    try {
        if (process.platform === 'win32')  return windows();
        if (process.platform === 'darwin') return mac();
        return linux();
    } catch (e) {
        console.warn('[ZEICHEN] nicht aufgefrischt:', e.message);
        return 0;
    }
}

module.exports = { auffrischen };

if (require.main === module) auffrischen();
