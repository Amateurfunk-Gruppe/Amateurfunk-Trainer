// ================================================================
// aufraeumen.js - raeumt den Trainer-Ordner auf.
//
// ES WIRD NICHTS GELOESCHT. Alles Ueberfluessige wandert in einen Ordner
// "_Aufgeraeumt_<Datum>". Erst wenn du dort nachgesehen hast und der
// Trainer weiter laeuft, kannst du ihn selbst in den Papierkorb ziehen.
// Ein Skript, das von sich aus loescht, ist ein Skript, dem man beim
// naechsten Mal nicht mehr traut.
//
// Vorher wird der Plan angezeigt und nachgefragt. Abbrechen mit n.
//
// Aufruf:  Doppelklick auf  Aufraeumen.bat
// ================================================================
'use strict';
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const WURZEL = __dirname;

// ----------------------------------------------------------------
// Was auf keinen Fall angefasst wird. Diese Liste steht VOR allem
// anderen und gewinnt immer - auch wenn unten ein Name doppelt
// auftaucht. Der Lernstand liegt in data/, die selbst erzeugten
// MP3s in Hoerbuch/; beides ist durch nichts wiederherstellbar.
// ----------------------------------------------------------------
const NIEMALS = new Set([
  'data', 'Hoerbuch', 'piper', 'node_modules', 'svgs', 'sounds', '.git', 'tts_cache',
  'Index.html', 'Server.js', 'duo.js', 'hoerbuch.js', 'lame.js', 'klick-sound.js',
  'tts-expand.js', 'video_map_embed.js', 'video_lessons.json',
  'fragen.json', 'Fragen-E.json', 'Fragen-A.json', 'Fragen-N-Auf-E.json',
  'Fragen-E-Auf-A.json', 'Fragen-N-Auf-A.json', 'svg-list.json',
  'package.json', 'package-lock.json', 'cloudflared.exe',
  'START.bat', 'START_MIT_TUNNEL.bat', 'start-tunnel.bat', 'piper.bat', 'commit.bat',
  'README.txt', 'CHANGELOG.md', 'BUG_REPORT.md', '.gitignore',
  'test', 'aufraeumen.js', 'Aufraeumen.bat', 'backup'
]);

// ----------------------------------------------------------------
// Weg damit - mit Begruendung, damit spaeter niemand raetselt.
// ----------------------------------------------------------------
const WEG = [
  ['Erweiterrrung',              'Auftrag erledigt: Fragen gebaut, 646 Bilder kopiert (19,8 MB, 1510 Dateien)'],
  ['Erweiterung',                'dasselbe, falls der Ordner ohne Tippfehler existiert'],
  ['Node.js',                    'Installer fuer Node.js - Node ist installiert, der Installer wird nie wieder gebraucht (31 MB)'],
  ['erweiterung_einrichten.js',  'einmaliges Einrichtskript, hat seinen Dienst getan'],
  ['Erweiterung_einrichten.bat', 'dito'],
  ['START_ALLES.bat',            'macht dasselbe wie START_MIT_TUNNEL.bat, nur ohne die Pruefungen davor'],
  ['Raum erstellen',             'Notizzettel ohne Dateiendung ("Danach kannst du im Browser Gruppenraum klicken")'],
  ['tunnel.log',                 'Laufzeitprotokoll, entsteht bei jedem Tunnelstart neu'],
  ['tunnel_out.log',             'dito'],
  ['tunnel_url.txt',             'die Tunnel-Adresse von zuletzt - aendert sich ohnehin bei jedem Start'],
  ['stimme_high_laden.bat',      'einmaliges Stimmen-Nachladeskript, piper.bat kann das inzwischen'],
  ['commit_message.txt',         'Restzettel vom letzten Commit'],
];

// ----------------------------------------------------------------
// Nicht weg, aber am falschen Platz: wandert nach backup/.
// ----------------------------------------------------------------
const NACH_BACKUP = [
  ['Pruefungsfragen.pdf', 'die Quelle des Fragenkatalogs - zum Nachschlagen wertvoll, im Betrieb nicht noetig'],
];
const LERNSTAND_MUSTER = /^Klasse-N-Lernstand_.*\.json$/i;

function groesse(p) {
  try {
    const st = fs.statSync(p);
    if (st.isFile()) return st.size;
    let s = 0;
    for (const e of fs.readdirSync(p, { withFileTypes: true })) s += groesse(path.join(p, e.name));
    return s;
  } catch (e) { return 0; }
}
const mb = b => (b / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';

function verschieben(von, nach) {
  fs.mkdirSync(path.dirname(nach), { recursive: true });
  try {
    fs.renameSync(von, nach);
  } catch (e) {
    // Ueber Laufwerksgrenzen hinweg kann Windows nicht umbenennen.
    fs.cpSync(von, nach, { recursive: true });
    fs.rmSync(von, { recursive: true, force: true });
  }
}

function main() {
  const heute = new Date().toISOString().slice(0, 10);
  const ZIEL = path.join(WURZEL, '_Aufgeraeumt_' + heute);
  const BACKUP = path.join(WURZEL, 'backup');

  // ---- Plan bauen ----
  const plan = [];
  for (const [name, grund] of WEG) {
    if (NIEMALS.has(name)) continue;              // Sicherheitsnetz
    const p = path.join(WURZEL, name);
    if (!fs.existsSync(p)) continue;
    plan.push({ art: 'weg', name, grund, bytes: groesse(p) });
  }
  for (const [name, grund] of NACH_BACKUP) {
    const p = path.join(WURZEL, name);
    if (fs.existsSync(p)) plan.push({ art: 'backup', name, grund, bytes: groesse(p) });
  }
  for (const n of fs.readdirSync(WURZEL)) {
    if (LERNSTAND_MUSTER.test(n)) {
      plan.push({ art: 'lernstand', name: n, grund: 'gesicherter Lernstand - kommt nach backup/Lernstand, NICHT weg',
                  bytes: groesse(path.join(WURZEL, n)) });
    }
  }

  // ---- Dubletten in backup/ finden ("... - Kopie.html") ----
  const dubletten = [];
  if (fs.existsSync(BACKUP)) {
    for (const n of fs.readdirSync(BACKUP)) {
      const m = n.match(/^(.*) - Kopie(\.[^.]+)$/);
      if (!m) continue;
      const original = m[1] + m[2];
      const a = path.join(BACKUP, n), b = path.join(BACKUP, original);
      if (!fs.existsSync(b)) continue;
      // Nur wenn sie wirklich gleich sind - gleicher Name heisst nicht
      // gleicher Inhalt, und eine "Kopie" kann die neuere Fassung sein.
      try {
        if (Buffer.compare(fs.readFileSync(a), fs.readFileSync(b)) === 0) {
          dubletten.push({ art: 'weg', name: path.join('backup', n),
                           grund: 'Byte fuer Byte gleich mit ' + original, bytes: groesse(a) });
        }
      } catch (e) { /* nicht lesbar - dann bleibt sie liegen */ }
    }
  }
  plan.push(...dubletten);

  if (!plan.length) {
    console.log('Nichts zu tun - der Ordner ist schon aufgeraeumt.');
    return;
  }

  // ---- Plan zeigen ----
  console.log('');
  console.log('DAS WANDERT IN  _Aufgeraeumt_' + heute + '  (nichts wird geloescht):');
  console.log('');
  let summe = 0;
  for (const p of plan.filter(x => x.art === 'weg')) {
    console.log('  ' + p.name.padEnd(30) + mb(p.bytes).padStart(9) + '   ' + p.grund);
    summe += p.bytes;
  }
  const nachBackup = plan.filter(x => x.art !== 'weg');
  if (nachBackup.length) {
    console.log('');
    console.log('DAS WANDERT NACH  backup\\  (aufgehoben, nur nicht mehr im Weg):');
    console.log('');
    for (const p of nachBackup) {
      console.log('  ' + p.name.padEnd(30) + mb(p.bytes).padStart(9) + '   ' + p.grund);
      summe += p.bytes;
    }
  }
  console.log('');
  console.log('  Zusammen: ' + mb(summe) + ' in ' + plan.length + ' Eintraegen.');
  console.log('');
  console.log('UNANGETASTET bleiben: data\\ (dein Lernstand), Hoerbuch\\ (deine MP3s),');
  console.log('piper\\, svgs\\, sounds\\, node_modules\\, .git\\, alle Fragen-Dateien,');
  console.log('START.bat, START_MIT_TUNNEL.bat, start-tunnel.bat, piper.bat, commit.bat.');
  console.log('');

  const frage = readline.createInterface({ input: process.stdin, output: process.stdout });
  frage.question('Verschieben?  [j/n]  ', (antwort) => {
    frage.close();
    if (!/^j/i.test(antwort.trim())) { console.log('\nAbgebrochen - es wurde nichts angefasst.'); return; }

    // Vor dem Verschieben der Erweiterung das Wertvollste daraus retten:
    // fragenkatalog3b.json ist die Quelle, aus der die Fragen der Klassen
    // E und A gebaut sind. Wenn die Bundesnetzagentur den Katalog neu
    // herausgibt, ist diese Datei der Vergleichspunkt.
    for (const ordner of ['Erweiterrrung', 'Erweiterung']) {
      const quelle = path.join(WURZEL, ordner, 'afu_test-main', 'Fragen', 'fragenkatalog3b.json');
      if (!fs.existsSync(quelle)) continue;
      const ziel = path.join(BACKUP, 'fragenkatalog3b.json');
      try {
        fs.mkdirSync(BACKUP, { recursive: true });
        if (!fs.existsSync(ziel)) fs.copyFileSync(quelle, ziel);
        console.log('  Gerettet nach backup\\: fragenkatalog3b.json (offizieller Katalog der BNetzA)');
      } catch (e) { console.log('  ! fragenkatalog3b.json nicht kopierbar: ' + e.message); }
    }

    let ok = 0;
    for (const p of plan) {
      const von = path.join(WURZEL, p.name);
      try {
        if (p.art === 'weg') {
          verschieben(von, path.join(ZIEL, p.name));
        } else if (p.art === 'lernstand') {
          verschieben(von, path.join(BACKUP, 'Lernstand', p.name));
        } else {
          verschieben(von, path.join(BACKUP, p.name));
        }
        ok++;
      } catch (e) {
        console.log('  ! ' + p.name + ' konnte nicht verschoben werden: ' + e.message);
      }
    }
    console.log('');
    console.log(ok + ' von ' + plan.length + ' Eintraegen verschoben, ' + mb(summe) + ' aus dem Weg.');
    console.log('');
    console.log('Der Ordner _Aufgeraeumt_' + heute + ' kann in den Papierkorb, sobald der');
    console.log('Trainer bei dir wieder laeuft. Vorher einmal START.bat probieren.');
    console.log('');
    console.log('Danach koennen auch  Aufraeumen.bat  und  aufraeumen.js  weg -');
    console.log('sie haben nur diese eine Aufgabe.');
  });
}

main();
