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
//    Windows  Bei jeder Verknuepfung, die in einen Trainer-Ordner zeigt, wird
//             das Zeichen ausdruecklich auf dessen icon.ico GESETZT und die
//             Verknuepfung gespeichert. Nur anfassen reicht nicht: Zeigt sie
//             auf eine alte Bilddatei, bleibt sie so alt, wie sie war. Dazu
//             "ie4uinit.exe -show" (der amtliche Weg, den Zwischenspeicher
//             der Shell zu leeren) und SHChangeNotify, damit der Explorer
//             den Schreibtisch sofort neu zeichnet.
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
    // Wo koennen Verknuepfungen liegen? Beide Schreibtische (der eigene und
    // der gemeinsame, dorthin legt das Setup sie), der Schreibtisch in
    // OneDrive - sehr verbreitet und leicht uebersehen - und das Startmenue.
    const orte = [
        path.join(os.homedir(), 'Desktop'),
        path.join(os.homedir(), 'OneDrive', 'Desktop'),
        path.join(os.homedir(), 'OneDrive - Personal', 'Desktop'),
        path.join(process.env.PUBLIC || 'C:\\Users\\Public', 'Desktop'),
        path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
        path.join(process.env.ProgramData || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs')
    ].filter(Boolean);

    // ------------------------------------------------------------------
    //  DAS ZEICHEN WIRD NEU GESETZT, NICHT NUR ANGEFASST.
    // ------------------------------------------------------------------
    //  Der erste Anlauf hat die Verknuepfung nur unveraendert gespeichert,
    //  damit sie einen neuen Zeitstempel bekommt. Das reicht, solange sie
    //  ohnehin auf das richtige Bild zeigt. Dietmar am 09.09.2026: "Das
    //  alte Icon ist noch immer zu sehen, unter Windows" - und auf seinem
    //  Bild war ein Zeichen zu sehen, das der Trainer seit Wochen nicht
    //  mehr benutzt. Eine Verknuepfung, die auf eine ALTE Bilddatei zeigt,
    //  bleibt beim blossen Anfassen so alt, wie sie war.
    //
    //  Deshalb: Bei jeder Verknuepfung, die in einen Trainer-Ordner zeigt
    //  (dort liegen Index.html und icon.ico), wird das Zeichen auf genau
    //  dieses icon.ico gesetzt - und zwar auf das im Ordner der
    //  Verknuepfung selbst, nicht auf unseres. Wer zwei Installationen hat,
    //  soll nicht die eine auf die andere zeigen sehen.
    //
    //  Das PowerShell-Stueck sagt hinterher, was es gefunden und was es
    //  geaendert hat. Ohne diesen Bericht raet man wieder.
    const ps = [
        '$ErrorActionPreference = "SilentlyContinue"',
        '$w = New-Object -ComObject WScript.Shell',
        '$hier = "' + WURZEL.replace(/"/g, '""') + '"',
        '$orte = @(' + orte.map(o => '"' + o.replace(/"/g, '""') + '"').join(',') + ')',
        '$gefunden = 0; $geaendert = 0',
        'foreach ($ort in $orte) {',
        '  if (-not (Test-Path -LiteralPath $ort)) { continue }',
        '  foreach ($f in Get-ChildItem -LiteralPath $ort -Filter *.lnk -Recurse -Depth 2) {',
        '    $s = $w.CreateShortcut($f.FullName)',
        '    $ordner = $s.WorkingDirectory',
        '    if (-not $ordner -and $s.TargetPath) { $ordner = Split-Path -Parent $s.TargetPath }',
        '    $passt = $false',
        '    if ($ordner -and (Test-Path -LiteralPath (Join-Path $ordner "Index.html"))) { $passt = $true }',
        '    if ($s.TargetPath -and $s.TargetPath.StartsWith($hier, "OrdinalIgnoreCase")) { $passt = $true; if (-not $ordner) { $ordner = $hier } }',
        '    if (-not $passt) { continue }',
        '    $gefunden++',
        '    $ico = Join-Path $ordner "icon.ico"',
        '    if (-not (Test-Path -LiteralPath $ico)) { $ico = Join-Path $hier "icon.ico" }',
        '    if (-not (Test-Path -LiteralPath $ico)) { Write-Output ("OHNE-BILD " + $f.FullName); continue }',
        '    $vorher = $s.IconLocation',
        '    $s.IconLocation = "$ico,0"',
        '    $s.Save()',
        '    $geaendert++',
        '    Write-Output ("GESETZT " + $f.FullName + " | vorher: " + $vorher + " | jetzt: $ico,0")',
        '  }',
        '}',
        'Write-Output ("SUMME gefunden=$gefunden geaendert=$geaendert")'
    ].join('; ');

    let bericht = '';
    try {
        bericht = execFileSync('powershell.exe',
            ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', ps],
            { encoding: 'utf8', timeout: 40000 }) || '';
    } catch (e) {
        sag('PowerShell nicht erreichbar: ' + e.message);
    }
    for (const zeile of bericht.split(/\r?\n/)) if (zeile.trim()) sag(zeile.trim());

    // Der Zwischenspeicher der Shell. "-show" ist der Weg, den Microsoft
    // selbst benutzt; auf aelteren Fassungen hiess er "-ClearIconCache".
    // Beides versuchen, beides darf fehlschlagen.
    ruf('ie4uinit.exe', ['-show']);
    ruf('ie4uinit.exe', ['-ClearIconCache']);

    // Und dem Explorer sagen, dass sich etwas geaendert hat. Ohne diesen
    // Anstoss zeichnet er den Schreibtisch erst beim naechsten Anmelden neu.
    ruf('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
        '$sig = \'[DllImport("shell32.dll")] public static extern void SHChangeNotify(int e, uint f, IntPtr a, IntPtr b);\'; '
      + 'Add-Type -MemberDefinition $sig -Namespace W -Name Shell; '
      + '[W.Shell]::SHChangeNotify(0x8000000, 0x1000, [IntPtr]::Zero, [IntPtr]::Zero)']);

    const m = /gefunden=(\d+) geaendert=(\d+)/.exec(bericht);
    return m ? parseInt(m[2], 10) : 0;
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
