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

let kopiert = 0, uebersprungen = 0;
function kopiereDatei(von, nach) {
  fs.mkdirSync(path.dirname(nach), { recursive: true });
  fs.copyFileSync(von, nach);
  kopiert++;
}
function kopiereOrdner(von, nach) {
  let e = [];
  try { e = fs.readdirSync(von, { withFileTypes: true }); } catch (x) { return; }
  for (const x of e) {
    if (NIEMALS.has(x.name) || /^node_alt_/.test(x.name)) { uebersprungen++; continue; }
    const a = path.join(von, x.name), b = path.join(nach, x.name);
    if (x.isDirectory()) { fs.mkdirSync(b, { recursive: true }); kopiereOrdner(a, b); }
    else if (x.isFile()) kopiereDatei(a, b);
  }
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

  const hatNode = fs.existsSync(path.join(WURZEL, 'node', 'node.exe'));
  if (!hatNode) {
    console.log('  [WICHTIG] Der Ordner node\\ fehlt.');
    console.log('  Ohne ihn muss auf dem Zielrechner doch Node.js installiert');
    console.log('  werden - genau das wolltest du ja vermeiden.');
    console.log('  Erst  Node-Holen.bat  ausfuehren, dann wieder hierher.');
    console.log('');
    const w = await fragen('  Trotzdem weitermachen?  [j/n]  ');
    if (!ja(w)) { console.log('\n  Abgebrochen.\n'); rl.close(); return; }
    console.log('');
  }

  // ---- Wohin? ---------------------------------------------------
  console.log('  Wohin soll die Kopie? Beispiel:  E:\\Amateurfunk-Trainer');
  const zielEingabe = await fragen('  Ziel:  ');
  if (!zielEingabe) { console.log('\n  Kein Ziel angegeben. Abgebrochen.\n'); rl.close(); return; }
  const ZIEL = path.resolve(zielEingabe);

  if (ZIEL === WURZEL || ZIEL.startsWith(WURZEL + path.sep)) {
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
  fs.mkdirSync(ZIEL, { recursive: true });

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
    fs.mkdirSync(path.join(ZIEL, o), { recursive: true });
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

  const g = groesse(ZIEL);
  console.log('');
  console.log('  ------------------------------------------------------------');
  console.log('  FERTIG. ' + kopiert + ' Dateien, ' + mb(g) + ' in ' + ZIEL);
  if (uebersprungen) console.log('  ' + uebersprungen + ' Eintraege bewusst ausgelassen (Lernstand, Werkzeuge, .git).');
  console.log('  ------------------------------------------------------------');
  console.log('');
  if (!hatNode) {
    console.log('  ACHTUNG: Ohne node\\ muss auf dem Zielrechner Node.js');
    console.log('  installiert oder dort Node-Holen.bat ausgefuehrt werden.');
  } else {
    console.log('  Auf dem Zielrechner genuegt: Stick einstecken, START.bat.');
  }
  console.log('');
  console.log('  Probe aufs Exempel: Zieh den Stick an einem anderen Rechner');
  console.log('  einmal durch, bevor du zwanzig davon verteilst.');
  console.log('');
  rl.close();
})();
