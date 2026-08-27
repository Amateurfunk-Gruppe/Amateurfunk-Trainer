// ================================================================
// usb_erstellen.js - eine saubere Kopie des Trainers zum Weitergeben
// ================================================================
// WOZU:
// Im Ortsverband oder an der VHS sollen Sticks verteilt werden. Zuhause
// steckt man ihn ein, klickt START.bat, fertig - nichts zu installieren.
//
// WARUM NICHT EINFACH DEN ORDNER KOPIEREN:
// Weil im Trainer-Ordner Dinge liegen, die auf keinen fremden Rechner
// gehoeren. Beim ZIP-Download ueber den Gruppenraum gibt es dafuer eine
// Positivliste; beim Kopieren im Explorer greift sie nicht. Das hier
// benutzt dieselbe Liste.
//
// WAS AUSDRUECKLICH NICHT MITGEHT:
//   data/               der eigene Lernstand, Zaehler, Verlauf
//   backup/             gesicherte Staende
//   video_embed.json    die echten Namen der Testgruppe
//   github_stand.json   der Merkposten des Updaters
//   herkunft.json       die Tunnel-Adresse des Gastgebers
//   .git/               die ganze Vorgeschichte samt Mailadresse
//   die Werkzeuge       Hochladen, Ausmisten, Aufraeumen, ...
//
// WAS ZUSAETZLICH MITGEHT (und im ZIP fehlt):
//   node/               damit auf dem Zielrechner nichts installiert
//                       werden muss
//   node_modules/       damit auch kein "npm install" noetig ist - und
//                       damit gar keine Internetverbindung
//
// Beides ist ueberpruefbar unbedenklich: Die drei Abhaengigkeiten
// (express, socket.io, cors) sind reines Javascript, kein einziger
// nativer Baustein. Der Ordner laeuft mit jedem Node ab Fassung 18 auf
// jedem Rechner - unabhaengig vom Laufwerksbuchstaben, weil alle
// Startdateien mit %~dp0 arbeiten.
// ================================================================
'use strict';
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const WURZEL = __dirname;

// Eine Leitung fuer alle Fragen. Zwei nacheinander erzeugte readline-
// Schnittstellen haben mir in aufraeumen.js schon einmal eine zweite
// Frage beschert, die nie eine Antwort bekam.
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let zu = false;
rl.on('close', () => { zu = true; });

// Beim Testen aufgefallen: Endet die Eingabe (Fenster zu, Strg+C, oder
// eine Antwort weniger als Fragen), ruft rl.question seine Funktion NIE
// mehr auf. Das Versprechen bleibt offen, node beendet sich still mit
// Code 0 - und es sieht aus, als waere alles gut gegangen, obwohl keine
// einzige Datei kopiert wurde. Genau das ist mir hier passiert.
// Deshalb horcht jede Frage zusaetzlich auf das Ende der Eingabe und
// antwortet dann mit einer leeren Zeichenkette, was ueberall "nein"
// bedeutet.
function fragen(t) {
  return new Promise(fertig => {
    if (zu) return fertig('');
    let erledigt = false;
    const beiEnde = () => { if (!erledigt) { erledigt = true; fertig(''); } };
    rl.once('close', beiEnde);
    rl.question(t, a => {
      if (erledigt) return;
      erledigt = true;
      rl.removeListener('close', beiEnde);
      fertig(String(a || '').trim());
    });
  });
}
const ja = a => /^[jy]/i.test(a);

// ---- Was mitgeht ------------------------------------------------
// Dieselbe Liste wie PAKET_DATEIEN in Server.js. Sie steht hier ein
// zweites Mal - deshalb prueft pruefeListe() weiter unten nach, ob die
// beiden noch uebereinstimmen. Eine Liste, die an zwei Stellen steht und
// auseinanderlaeuft, ist genau der Fehler, der mir bei der .gitignore
// schon einmal passiert ist.
const DATEIEN = [
  'Index.html', 'duo.js', 'Server.js', 'package.json',
  'fragen.json', 'svg-list.json', 'video_lessons.json', 'video_map_embed.js',
  'Fragen-E.json', 'Fragen-A.json', 'Fragen-N-Auf-E.json', 'Fragen-E-Auf-A.json', 'Fragen-N-Auf-A.json',
  'klick-sound.js', 'tts-expand.js', 'hoerbuch.js', 'lame.js',
  'START.bat', 'piper.bat', 'README.txt',
  'Node-Holen.bat', 'node_holen.ps1',
  'USB-Stick-Erstellen.bat', 'usb_erstellen.js',
];
const PDF_MUSTER = [/^hilfsmittel.*\.pdf$/i, /^formelsammlung.*\.pdf$/i, /^pruefungsfragen.*\.pdf$/i];
const ORDNER_IMMER = ['svgs', 'sounds', 'node_modules', 'node'];
const ORDNER_FRAGEN = [
  { name: 'piper',    text: 'Piper-Stimmen (natuerliche Sprachausgabe)' },
  { name: 'Hoerbuch', text: 'fertige Hoerbuch-Dateien' },
];

// Niemals - auch nicht, wenn sie zufaellig in einer Liste auftauchen.
const NIEMALS = new Set([
  'data', 'backup', '.git', 'tts_cache', 'node_alt',
  'video_embed.json', 'github_stand.json', 'herkunft.json',
]);

function mb(n) { return (n / 1024 / 1024).toFixed(1) + ' MB'; }

function groesse(p) {
  let s = 0;
  const lauf = (d) => {
    let e = [];
    try { e = fs.readdirSync(d, { withFileTypes: true }); } catch (x) { return; }
    for (const x of e) {
      const v = path.join(d, x.name);
      if (x.isDirectory()) lauf(v);
      else { try { s += fs.statSync(v).size; } catch (y) {} }
    }
  };
  try { fs.statSync(p).isDirectory() ? lauf(p) : (s = fs.statSync(p).size); } catch (e) {}
  return s;
}

// Einen Ordner anlegen - aber nur, wenn es ihn nicht schon gibt.
//
// Aus einem echten Lauf vom 27.08.2026: Als Ziel wurde "D:\" angegeben,
// also die Wurzel des Sticks. mkdirSync bricht dort mit EPERM ab, obwohl
// recursive:true gesetzt ist - Windows meldet fuer ein Laufwerks-
// Stammverzeichnis nicht "gibt es schon", sondern "nicht erlaubt". Das
// Skript stuerzte mit einem Stapelauszug ab, den niemand lesen will.
function ordnerSicherstellen(p) {
  try { if (fs.existsSync(p) && fs.statSync(p).isDirectory()) return; } catch (e) {}
  fs.mkdirSync(p, { recursive: true });
}

let kopiert = 0, uebersprungen = 0;
const fehlerListe = [];
function kopiereDatei(von, nach) {
  try {
    ordnerSicherstellen(path.dirname(nach));
    fs.copyFileSync(von, nach);
    kopiert++;
  } catch (e) {
    // Eine einzelne Datei, die klemmt (offen, schreibgeschuetzt, Stick
    // voll), darf nicht den ganzen Lauf abbrechen. Gesammelt und am Ende
    // gemeldet - dann sieht man auf einen Blick, was fehlt.
    fehlerListe.push(path.basename(nach) + ': ' + e.code);
  }
}
function kopiereOrdner(von, nach) {
  let e = [];
  try { e = fs.readdirSync(von, { withFileTypes: true }); } catch (x) { return; }
  for (const x of e) {
    if (NIEMALS.has(x.name) || /^node_alt_/.test(x.name)) { uebersprungen++; continue; }
    const a = path.join(von, x.name), b = path.join(nach, x.name);
    if (x.isDirectory()) { ordnerSicherstellen(b); kopiereOrdner(a, b); }
    else if (x.isFile()) kopiereDatei(a, b);
  }
}

// ---- Fehlendes selbst nachholen --------------------------------
//
// Dietmars Ziel, im Klartext: "wenn ich von GitHub den Trainer downlade,
// hier die Bat ausfuehren kann der auf meinem USB Stick den Trainer
// vollstaendig kopiert."
//
// Ein Werkzeug, das dann sagt "fuehr erst zwei andere Dateien aus",
// verfehlt genau das. Es kann beides selbst - also tut es das auch,
// nach Rueckfrage.
const { spawnSync } = require('child_process');

function nodeHolen() {
  const skript = path.join(WURZEL, 'node_holen.ps1');
  if (!fs.existsSync(skript)) {
    console.log('  node_holen.ps1 fehlt in diesem Ordner - kann Node nicht holen.');
    return false;
  }
  console.log('');
  console.log('  Hole Node.js ... (rund 30 MB, ein bis zwei Minuten)');
  console.log('  ------------------------------------------------------------');
  const r = spawnSync('powershell',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', skript],
    { cwd: WURZEL, stdio: 'inherit' });
  console.log('  ------------------------------------------------------------');
  return r.status === 0 && fs.existsSync(path.join(WURZEL, 'node', 'node.exe'));
}

function bausteineHolen() {
  // Erst das mitgelieferte npm, dann das des Systems. In einem frisch
  // von GitHub geladenen Ordner gibt es nur das zweite.
  const eigenes = path.join(WURZEL, 'node', 'npm.cmd');
  const npm = fs.existsSync(eigenes) ? eigenes : 'npm';
  console.log('');
  console.log('  Hole die Bausteine mit "npm install" ...');
  console.log('  ------------------------------------------------------------');
  const r = spawnSync(npm, ['install'], { cwd: WURZEL, stdio: 'inherit', shell: true });
  console.log('  ------------------------------------------------------------');
  return r.status === 0 && fs.existsSync(path.join(WURZEL, 'node_modules', 'express'));
}

// ---- Selbstpruefung: stimmt die Liste noch mit Server.js? -------
function pruefeListe() {
  try {
    const s = fs.readFileSync(path.join(WURZEL, 'Server.js'), 'utf8');
    const m = s.match(/const PAKET_DATEIEN = \[([\s\S]*?)\];/);
    if (!m) return;
    const dort = (m[1].match(/'([^']+)'/g) || []).map(x => x.slice(1, -1));
    const fehlen = dort.filter(d => !DATEIEN.includes(d));
    const zuviel = DATEIEN.filter(d => !dort.includes(d));
    if (fehlen.length || zuviel.length) {
      console.log('');
      console.log('  [HINWEIS] Diese Liste weicht von PAKET_DATEIEN in Server.js ab:');
      if (fehlen.length) console.log('    nur in Server.js: ' + fehlen.join(', '));
      if (zuviel.length) console.log('    nur hier:         ' + zuviel.join(', '));
      console.log('    Kopiert wird trotzdem - aber eine der beiden gehoert nachgezogen.');
    }
  } catch (e) {}
}

(async () => {
  console.log('');
  console.log('  ============================================================');
  console.log('   Trainer zum Weitergeben kopieren (USB-Stick)');
  console.log('  ============================================================');
  console.log('');
  console.log('  Es entsteht eine saubere Kopie: ohne deinen Lernstand, ohne');
  console.log('  deine Werkzeuge, ohne die Vorgeschichte. Der Empfaenger');
  console.log('  steckt den Stick ein und klickt START.bat - mehr nicht.');
  console.log('');

  pruefeListe();

  const hatNode  = fs.existsSync(path.join(WURZEL, 'node', 'node.exe'));
  const hatBaust = fs.existsSync(path.join(WURZEL, 'node_modules', 'express'));

  // Beide Ordner sind der ganze Sinn der Sache. Fehlt einer, entsteht ein
  // Stick, der beim Empfaenger nicht startet - und die Fehlermeldung, die
  // er dann sieht, ist ein Stapelauszug aus node:fs. Genau das ist am
  // 27.08.2026 passiert: Das Werkzeug lief in einem frisch
  // heruntergeladenen Ordner, der weder node\ noch node_modules\ hatte,
  // meldete brav "FERTIG" - und der Stick war unbrauchbar.
  let nodeDa = hatNode, baustDa = hatBaust;
  if (!nodeDa || !baustDa) {
    console.log('  In diesem Ordner fehlt noch:');
    if (!nodeDa)  console.log('     node\\           - Node.js selbst, damit beim Empfaenger');
    if (!nodeDa)  console.log('                       nichts installiert werden muss');
    if (!baustDa) console.log('     node_modules\\   - die Bausteine des Trainers');
    console.log('');
    console.log('  Das ist normal bei einem frisch von GitHub geladenen Ordner.');
    console.log('  Beides kann ich jetzt holen - dafuer wird einmal eine');
    console.log('  Internetverbindung gebraucht, danach nie wieder.');
    console.log('');
    const w = await fragen('  Jetzt holen und dann den Stick bespielen?  [j/n]  ');
    if (ja(w)) {
      if (!nodeDa)  nodeDa  = nodeHolen();
      if (!baustDa) baustDa = bausteineHolen();
      console.log('');
      if (nodeDa && baustDa) {
        console.log('  Beides da. Weiter geht es mit dem Stick.');
      } else {
        console.log('  Es hat nicht alles geklappt:');
        if (!nodeDa)  console.log('     node\\ fehlt weiterhin');
        if (!baustDa) console.log('     node_modules\\ fehlt weiterhin');
        const w2 = await fragen('  Trotzdem kopieren?  [j/n]  ');
        if (!ja(w2)) { console.log('\n  Abgebrochen.\n'); rl.close(); return; }
      }
    } else {
      console.log('');
      console.log('  Gut. Der Stick wird dann unvollstaendig - der Empfaenger');
      console.log('  muesste Node.js selbst besorgen.');
      const w2 = await fragen('  Trotzdem kopieren?  [j/n]  ');
      if (!ja(w2)) { console.log('\n  Abgebrochen.\n'); rl.close(); return; }
    }
    console.log('');
  }

  // ---- Wohin? ---------------------------------------------------
  //
  // Einen Pfad abzutippen ist bei zwanzig Sticks hintereinander eine
  // Zumutung - und ein Tippfehler legt die Kopie irgendwohin. Deshalb
  // erst zeigen, welche Laufwerke es gibt.
  const laufwerke = [];
  if (process.platform === 'win32') {
    for (const b of 'DEFGHIJKLMNOPQRSTUVWXYZ') {          // C: bewusst nicht
      const w = b + ':\\';
      try {
        if (!fs.existsSync(w)) continue;
        let frei = '';
        try {
          const st = fs.statfsSync(w);
          frei = ' - ' + ((st.bavail * st.bsize) / 1024 / 1024 / 1024).toFixed(1) + ' GB frei';
        } catch (e) {}
        laufwerke.push({ buchstabe: b, pfad: w, frei });
      } catch (e) {}
    }
  }

  console.log('');
  if (laufwerke.length) {
    console.log('  Gefundene Laufwerke:');
    laufwerke.forEach((l, i) => console.log('    ' + (i + 1) + ')  ' + l.buchstabe + ':\\' + l.frei));
    console.log('');
    console.log('  Nummer eingeben - oder einen vollstaendigen Pfad,');
    console.log('  zum Beispiel  E:\\Amateurfunk-Trainer');
  } else {
    console.log('  Wohin soll die Kopie? Beispiel:  E:\\Amateurfunk-Trainer');
  }
  const zielEingabe = await fragen('  Ziel:  ');
  if (!zielEingabe) { console.log('\n  Kein Ziel angegeben. Abgebrochen.\n'); rl.close(); return; }

  let zielRoh = zielEingabe;
  const nummer = /^\d+$/.test(zielEingabe) ? parseInt(zielEingabe, 10) : 0;
  // Eine Zahl ohne passendes Laufwerk landete sonst als Ordnername "9"
  // im Trainer-Ordner. Die Sperre weiter unten faenge das zwar ab, aber
  // mit einer Meldung, die niemand versteht.
  if (nummer && (nummer < 1 || nummer > laufwerke.length)) {
    console.log('');
    console.log('  !! Es gibt keine Nummer ' + nummer + ' in der Liste oben.');
    console.log('     Bitte eine der angebotenen Nummern - oder einen Pfad.');
    console.log('');
    rl.close(); return;
  }
  if (nummer >= 1 && nummer <= laufwerke.length) {
    zielRoh = path.join(laufwerke[nummer - 1].pfad, 'Amateurfunk-Trainer');
    console.log('  Gewaehlt: ' + zielRoh);
  } else if (/^[a-zA-Z]:?\\?$/.test(zielEingabe)) {
    // Nur ein Buchstabe getippt - dann den Unterordner selbst anhaengen,
    // sonst laege der Trainer lose in der Wurzel des Sticks.
    zielRoh = path.join(zielEingabe[0].toUpperCase() + ':\\', 'Amateurfunk-Trainer');
    console.log('  Gewaehlt: ' + zielRoh);
  }
  const ZIEL = path.resolve(zielRoh);

  // Gross- und Kleinschreibung: Windows unterscheidet sie in Pfaden nicht.
  // Ohne diesen Abgleich rutschte "c:\users\..." an der Sperre vorbei.
  const gleichOrt = (a, b) => (process.platform === 'win32')
    ? a.toLowerCase() === b.toLowerCase() : a === b;
  const liegtIn = (kind, eltern) => (process.platform === 'win32')
    ? kind.toLowerCase().startsWith((eltern + path.sep).toLowerCase())
    : kind.startsWith(eltern + path.sep);

  if (gleichOrt(ZIEL, WURZEL) || liegtIn(ZIEL, WURZEL)) {
    console.log('\n  !! Das Ziel liegt im Trainer-Ordner selbst. Das gaebe eine');
    console.log('     Kopie in der Kopie. Bitte einen Ort ausserhalb waehlen.\n');
    rl.close(); return;
  }
  if (fs.existsSync(ZIEL) && fs.readdirSync(ZIEL).length) {
    console.log('');
    console.log('  Der Ordner ' + ZIEL + ' ist nicht leer.');
    console.log('  Vorhandene Dateien gleichen Namens werden ueberschrieben.');
    const w = await fragen('  Weiter?  [j/n]  ');
    if (!ja(w)) { console.log('\n  Abgebrochen.\n'); rl.close(); return; }
  }

  // ---- Das Grosse einzeln fragen --------------------------------
  const mitOrdner = [];
  for (const o of ORDNER_FRAGEN) {
    const p = path.join(WURZEL, o.name);
    if (!fs.existsSync(p)) continue;
    const g = groesse(p);
    console.log('');
    console.log('  ' + o.text + ' (' + o.name + '\\, ' + mb(g) + ')');
    const w = await fragen('  Mitnehmen?  [j/n]  ');
    if (ja(w)) mitOrdner.push(o.name);
  }

  // ---- Kopieren -------------------------------------------------
  console.log('');
  console.log('  Kopiere nach ' + ZIEL + ' ...');
  ordnerSicherstellen(ZIEL);

  for (const d of DATEIEN) {
    const von = path.join(WURZEL, d);
    if (fs.existsSync(von) && fs.statSync(von).isFile()) kopiereDatei(von, path.join(ZIEL, d));
    else console.log('    (fehlt, uebersprungen: ' + d + ')');
  }
  // PDFs nach Muster - der Name wechselt bei der Behoerde staendig
  for (const f of fs.readdirSync(WURZEL)) {
    if (PDF_MUSTER.some(m => m.test(f))) kopiereDatei(path.join(WURZEL, f), path.join(ZIEL, f));
  }
  for (const o of [...ORDNER_IMMER, ...mitOrdner]) {
    const von = path.join(WURZEL, o);
    if (!fs.existsSync(von)) continue;
    process.stdout.write('    ' + o + '\\ ...');
    const vorher = kopiert;
    ordnerSicherstellen(path.join(ZIEL, o));
    kopiereOrdner(von, path.join(ZIEL, o));
    console.log(' ' + (kopiert - vorher) + ' Dateien');
  }

  // ---- Eine Zeile, die sagt, woher die Kopie stammt -------------
  try {
    fs.writeFileSync(path.join(ZIEL, 'ANLEITUNG-USB.txt'), [
      '================================================================',
      '  Amateurfunk-Trainer - Stick zum Lernen',
      '================================================================',
      '',
      'SO GEHT ES LOS:',
      '',
      '  1. Stick einstecken',
      '  2. Doppelklick auf   START.bat',
      '',
      'Das war alles. Es muss nichts installiert werden - Node.js liegt',
      'im Ordner node\\ mit auf dem Stick.',
      '',
      'Beim ersten Start dauert es einen Moment, dann oeffnet sich der',
      'Trainer von selbst im Browser. Zum Beenden das schwarze Fenster',
      'schliessen.',
      '',
      '----------------------------------------------------------------',
      'DEIN LERNSTAND',
      '----------------------------------------------------------------',
      'Er wird im Ordner data\\ auf dem Stick gespeichert. Der Stick ist',
      'damit dein Lernstand - er wandert mit, egal an welchem Rechner du',
      'sitzt. Auf dem Rechner selbst bleibt nichts zurueck.',
      '',
      'Wer lieber auf der Festplatte lernt: den ganzen Ordner vom Stick',
      'auf den Rechner kopieren und von dort starten. Geht genauso.',
      '',
      '----------------------------------------------------------------',
      'WENN ETWAS NICHT GEHT',
      '----------------------------------------------------------------',
      'Fenster geht kurz auf und sofort wieder zu:',
      '  Der Ordner node\\ fehlt oder ist unvollstaendig. Doppelklick auf',
      '  Node-Holen.bat holt ihn (dafuer wird einmal Internet gebraucht).',
      '',
      'Windows fragt nach der Firewall:',
      '  "Abbrechen" genuegt. Der Trainer laeuft nur auf diesem Rechner.',
      '  Freigeben musst du nur, wenn du selbst einen Gruppenraum',
      '  anbieten willst.',
      '',
      'Erstellt am ' + new Date().toLocaleString('de-DE'),
      ''
    ].join('\r\n'), 'utf8');
    kopiert++;
  } catch (e) {}

  // ---- Probe: startet der Stick ueberhaupt? ----------------------
  // Nicht "FERTIG" melden, ohne nachgesehen zu haben. Ein Stick, der
  // beim Empfaenger nicht anspringt, ist schlimmer als gar keiner.
  const mussDaSein = [
    ['Index.html', 'die Oberflaeche'],
    ['Server.js', 'das Programm'],
    ['START.bat', 'die Startdatei'],
    ['fragen.json', 'die Fragen'],
    [path.join('node_modules', 'express'), 'die Bausteine (node_modules)'],
    [path.join('node', 'node.exe'), 'Node.js selbst (node\\)'],
  ];
  const fehltAmZiel = mussDaSein.filter(([f]) => !fs.existsSync(path.join(ZIEL, f)));

  const g = groesse(ZIEL);
  console.log('');
  console.log('  ------------------------------------------------------------');
  console.log('  ' + (fehltAmZiel.length ? 'KOPIERT, ABER UNVOLLSTAENDIG.' : 'FERTIG.')
              + ' ' + kopiert + ' Dateien, ' + mb(g) + ' in ' + ZIEL);
  if (uebersprungen) console.log('  ' + uebersprungen + ' Eintraege bewusst ausgelassen (Lernstand, Werkzeuge, .git).');
  if (fehlerListe.length) {
    console.log('');
    console.log('  !! ' + fehlerListe.length + ' Datei(en) liessen sich NICHT kopieren:');
    fehlerListe.slice(0, 12).forEach(f => console.log('     ' + f));
    if (fehlerListe.length > 12) console.log('     ... und ' + (fehlerListe.length - 12) + ' weitere');
    console.log('     Haeufigste Ursachen: Stick voll, schreibgeschuetzt, oder');
    console.log('     der Trainer laeuft gerade aus diesem Ordner.');
  }
  console.log('  ------------------------------------------------------------');
  console.log('');
  if (fehltAmZiel.length) {
    console.log('  !! Auf dem Ziel fehlt:');
    fehltAmZiel.forEach(([f, was]) => console.log('       ' + f + '   - ' + was));
    console.log('');
    console.log('  So startet der Stick beim Empfaenger NICHT.');
    if (fehltAmZiel.some(([f]) => f.indexOf('node' + path.sep + 'node.exe') === 0))
      console.log('  -> Node-Holen.bat im Quellordner ausfuehren, dann noch einmal hierher.');
    if (fehltAmZiel.some(([f]) => f.indexOf('node_modules') === 0))
      console.log('  -> Im Quellordner einmal START.bat laufen lassen; die holt node_modules.');
  } else {
    console.log('  Geprueft: Oberflaeche, Programm, Fragen, Bausteine und Node');
    console.log('  sind auf dem Ziel angekommen.');
    console.log('');
    console.log('  Auf dem Zielrechner genuegt: Stick einstecken, START.bat.');
  }
  console.log('');
  console.log('  Probe aufs Exempel: Zieh den Stick an einem anderen Rechner');
  console.log('  einmal durch, bevor du zwanzig davon verteilst.');
  console.log('');
  rl.close();
})().catch(e => {
  // Kein Stapelauszug im Fenster. Wer Sticks fuer den Ortsverband
  // vorbereitet, soll eine Zeile lesen muessen, keine Fehlersuche in
  // node:fs betreiben.
  console.log('');
  console.log('  ------------------------------------------------------------');
  console.log('  !! Der Vorgang ist abgebrochen.');
  console.log('     ' + (e && e.message ? e.message : String(e)));
  if (e && e.code === 'EPERM')  console.log('     (keine Berechtigung - ist der Stick schreibgeschuetzt?)');
  if (e && e.code === 'ENOSPC') console.log('     (kein Platz mehr auf dem Ziel)');
  if (e && e.code === 'ENOENT') console.log('     (Pfad nicht gefunden - steckt der Stick noch?)');
  console.log('  ------------------------------------------------------------');
  console.log('');
  try { rl.close(); } catch (x) {}
  process.exitCode = 1;
});
