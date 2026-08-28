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
const { spawnSync } = require('child_process');

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
  // README.txt ist am 27.08.2026 herausgeflogen: Sie erklaerte eine
  // Handinstallation von Piper, die piper.bat laengst allein macht,
  // und nannte Dateien bei alten Namen. Im Paket liegt die richtige
  // ANLEITUNG.txt, auf dem Stick die ANLEITUNG-USB.txt.
  'START.bat', 'piper.bat',
  'Node-Holen.bat', 'node_holen.ps1',
  // Symbol und Verknuepfung: Wer den Trainer auf einem Stick bekommt,
  // soll ihn mit einem Doppelklick vom Desktop starten koennen - und
  // zwar mit dem Funkgeraet statt des grauen Zahnrads, das Windows
  // fuer .bat-Dateien zeigt.
  'icon.ico', 'icon.png', 'Verknuepfung-Erstellen.bat', 'verknuepfung.ps1',
  'USB-Stick-Erstellen.bat', 'usb_erstellen.js',
];
const PDF_MUSTER = [/^hilfsmittel.*\.pdf$/i, /^formelsammlung.*\.pdf$/i, /^pruefungsfragen.*\.pdf$/i];
const ORDNER_IMMER = ['svgs', 'sounds', 'node_modules', 'node'];
// Piper wird gesondert behandelt (siehe piperFragen weiter unten) -
// die Sprachausgabe gehoert auf den Stick, aber 470 MB Stimmen wollen
// eine eigene Frage.
const ORDNER_FRAGEN = [
  { name: 'Hoerbuch', text: 'fertige Hoerbuch-Dateien' },
];

// Alles ausser den Stimmdateien: piper.exe, die DLLs, espeak-ng-data.
// Ohne die nuetzt die schoenste Stimme nichts.
// _stimmentest ist Dietmars Probeausgabe und gehoert niemandem sonst.
const PIPER_UEBERSPRINGEN = new Set(['_stimmentest']);

// Niemals - auch nicht, wenn sie zufaellig in einer Liste auftauchen.
const NIEMALS = new Set([
  'data', 'backup', '.git', 'tts_cache', 'node_alt',
  'video_embed.json', 'github_stand.json', 'herkunft.json',
]);

function mb(n) { return (n / 1024 / 1024).toFixed(1) + ' MB'; }
function gb(n) { return (n / 1024 / 1024 / 1024).toFixed(1) + ' GB'; }

// ---- Wo steckt der Stick? --------------------------------------
//
// "Laufwerk D:" sagt einem nichts - ist das der Stick oder die zweite
// Festplatte? Windows weiss es genau: Win32_LogicalDisk kennt einen
// DriveType, und 2 bedeutet Wechseldatentraeger. Dazu gibt es den
// Namen, den der Stick beim Formatieren bekommen hat, und die Groesse.
// Damit laesst sich die Frage stellen, die man wirklich meint.
//
// Abgefragt wird ueber PowerShell, weil Node von sich aus nichts ueber
// Laufwerkstypen weiss und ich dem Projekt dafuer keine fremde
// Bibliothek aufhalsen will - es hat bewusst nur drei Abhaengigkeiten.
function laufwerkeSuchen() {
  if (process.platform !== 'win32') return [];
  try {
    const r = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command',
      'Get-CimInstance Win32_LogicalDisk | Select-Object DeviceID,DriveType,VolumeName,Size,FreeSpace | ConvertTo-Json -Compress'],
      { encoding: 'utf8', timeout: 20000 });
    if (!r.stdout) return [];
    let d = JSON.parse(r.stdout);
    if (!Array.isArray(d)) d = [d];
    return d
      .filter(x => x && x.DeviceID && Number(x.Size) > 0)
      .map(x => ({
        pfad:      x.DeviceID + '\\',
        buchstabe: String(x.DeviceID)[0].toUpperCase(),
        name:      x.VolumeName || '',
        wechsel:   Number(x.DriveType) === 2,
        gesamt:    Number(x.Size) || 0,
        frei:      Number(x.FreeSpace) || 0,
      }))
      // C: ist nie ein Stick und waere hier nur eine Fehlerquelle.
      .filter(x => x.buchstabe !== 'C');
  } catch (e) {
    return [];
  }
}

// ---- Die Stimmen im Ordner piper\ -------------------------------
// Der Trainer nimmt die beste gefundene Stimme als Vorgabe und laesst
// die anderen zur Auswahl. Fuer den Stick heisst das: alle mitnehmen ist
// richtig, aber 470 MB. Wer zwanzig Sticks bespielt, will vielleicht nur
// die beste - deshalb wird dieselbe Rangfolge benutzt wie im Trainer.
const STIMM_STUFEN = { high: 4, medium: 3, low: 2, x_low: 1 };

function stimmenFinden() {
  const dir = path.join(WURZEL, 'piper');
  let raus = [];
  try {
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.onnx')) continue;
      if (!fs.existsSync(path.join(dir, f + '.json'))) continue;
      let rate = 0;
      try {
        const j = JSON.parse(fs.readFileSync(path.join(dir, f + '.json'), 'utf8'));
        rate = (j.audio && j.audio.sample_rate) || 0;
      } catch (e) {}
      const m = f.match(/-(x_low|low|medium|high)\.onnx$/i);
      const stufe = m ? m[1].toLowerCase() : '';
      let bytes = 0;
      try { bytes = fs.statSync(path.join(dir, f)).size + fs.statSync(path.join(dir, f + '.json')).size; } catch (e) {}
      raus.push({ datei: f, rang: STIMM_STUFEN[stufe] || 0, rate, bytes, stufe });
    }
  } catch (e) {}
  // Beste zuerst - genau wie listVoices() im Trainer sortiert.
  raus.sort((a, b) => (b.rang - a.rang) || (b.rate - a.rate) || a.datei.localeCompare(b.datei));
  return raus;
}

function zeileFuer(l) {
  const name = l.name ? '"' + l.name + '"' : '(ohne Namen)';
  return (l.pfad + '  ' + name).padEnd(30)
       + gb(l.frei) + ' frei von ' + gb(l.gesamt);
}

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

function piperHolen() {
  const bat = path.join(WURZEL, 'piper.bat');
  if (!fs.existsSync(bat)) {
    console.log('  piper.bat fehlt in diesem Ordner - kann die Sprachausgabe nicht holen.');
    return false;
  }
  console.log('');
  console.log('  Hole die Sprachausgabe ... (rund 80 MB)');
  console.log('  ------------------------------------------------------------');
  // Ohne Tastendruecke.
  //
  // piper.bat ist zum Anklicken gebaut und bleibt an drei Stellen mit
  // "pause" stehen. Dietmar: "Es muss alles fertig abschliessen. Moechte
  // keine piper.bat Datei auch noch starten." Also bekommt sie ihre
  // Tastendruecke von hier - unter Windows liest "pause" aus der
  // Standardeingabe, wenn dort etwas anliegt, und laeuft dann weiter.
  // Die Ausgabe bleibt sichtbar, nur die Eingabe ist vorbelegt.
  const r = spawnSync('"' + bat + '"', {
    cwd: WURZEL, shell: true,
    input: '\r\n\r\n\r\n\r\n\r\n',
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  console.log('  ------------------------------------------------------------');

  const exe = path.join(WURZEL, 'piper', 'piper.exe');
  if (!fs.existsSync(exe)) {
    console.log('  Die Sprachausgabe ist nicht angekommen.');
    return false;
  }

  // Der Funktionstest, den piper.bat als Schritt 5 macht - hier noch
  // einmal, weil ich das Ergebnis auswerten will und nicht nur anzeigen.
  // Er faengt den haeufigsten Fall ab: piper.exe ist da, stuerzt aber
  // beim Start ab, weil das Microsoft-Laufzeitpaket fehlt.
  const t = spawnSync('"' + exe + '" --help', {
    cwd: path.join(WURZEL, 'piper'), shell: true, timeout: 30000,
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  if (t.status === 0) {
    console.log('  Funktionstest: piper.exe startet einwandfrei.');
    return true;
  }
  console.log('  Funktionstest: piper.exe laesst sich hier NICHT starten.');
  console.log('  Haeufigste Ursache: das Microsoft-Laufzeitpaket fehlt oder');
  console.log('  ein Virenscanner haelt piper.exe fest. Die Dateien kommen');
  console.log('  trotzdem mit auf den Stick - auf dem Zielrechner hilft dann');
  console.log('  piper\\piper_reparatur.bat.');
  return true;     // Dateien sind da, also mitnehmen
}

function bausteineHolen() {
  // Erst das mitgelieferte npm, dann das des Systems. In einem frisch
  // von GitHub geladenen Ordner gibt es nur das zweite.
  const eigenes = path.join(WURZEL, 'node', 'npm.cmd');
  const npm = fs.existsSync(eigenes) ? eigenes : 'npm';
  console.log('');
  console.log('  Hole die Bausteine mit "npm install" ...');
  console.log('  ------------------------------------------------------------');
  // Ein einziger Befehlstext statt Befehl + Argumentliste.
  //
  // npm ist unter Windows eine .cmd-Datei; die laesst sich seit der
  // Sicherheitskorrektur in Node 18.20 nur noch ueber die Shell starten.
  // Uebergibt man dabei aber eine Argumentliste, warnt Node ab Fassung 22
  // mit DEP0190 - und diese Warnung erschien bei Dietmar mitten in der
  // Frage nach dem Ziellaufwerk, wo sie aussah wie ein Fehler.
  // Anfuehrungszeichen um den Pfad, weil er Leerzeichen enthalten kann.
  const befehl = (npm === 'npm' ? 'npm' : '"' + npm + '"') + ' install';
  const r = spawnSync(befehl, { cwd: WURZEL, stdio: 'inherit', shell: true });
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
  const hatPiper = fs.existsSync(path.join(WURZEL, 'piper', 'piper.exe'));

  // Beide Ordner sind der ganze Sinn der Sache. Fehlt einer, entsteht ein
  // Stick, der beim Empfaenger nicht startet - und die Fehlermeldung, die
  // er dann sieht, ist ein Stapelauszug aus node:fs. Genau das ist am
  // 27.08.2026 passiert: Das Werkzeug lief in einem frisch
  // heruntergeladenen Ordner, der weder node\ noch node_modules\ hatte,
  // meldete brav "FERTIG" - und der Stick war unbrauchbar.
  let nodeDa = hatNode, baustDa = hatBaust, piperDa = hatPiper;
  if (!nodeDa || !baustDa || !piperDa) {
    console.log('  In diesem Ordner fehlt noch:');
    if (!nodeDa)  console.log('     node\\           Node.js selbst - damit beim Empfaenger');
    if (!nodeDa)  console.log('                     nichts installiert werden muss');
    if (!baustDa) console.log('     node_modules\\   die Bausteine des Trainers');
    if (!piperDa) console.log('     piper\\          die natuerliche Sprachausgabe (rund 80 MB)');
    console.log('');
    console.log('  Das ist normal bei einem frisch von GitHub geladenen Ordner -');
    console.log('  diese drei sind zu gross fuers Repository und werden bei');
    console.log('  Bedarf geholt. Einmal Internet noetig, danach nie wieder.');
    console.log('');
    console.log('  Ich hole das jetzt. Danach wird nur noch gefragt,');
    console.log('  auf welchen Stick es soll.');
    if (!nodeDa)  nodeDa  = nodeHolen();
    if (!baustDa) baustDa = bausteineHolen();
    if (!piperDa) piperDa = piperHolen();
    console.log('');
    if (nodeDa && baustDa) {
      console.log('  Der Trainer ist vollstaendig.'
        + (piperDa ? ' Sprachausgabe ist auch dabei.' : ''));
      if (!piperDa) {
        console.log('  Nur die Sprachausgabe fehlt - der Trainer laeuft auch ohne,');
        console.log('  dann liest die Windows-Stimme vor.');
      }
    } else {
      // Hier wird doch gefragt, und das ist Absicht: Ohne node\ oder
      // node_modules\ startet der Stick beim Empfaenger nicht. Einen
      // unbrauchbaren Stick stillschweigend zu bespielen waere schlimmer
      // als eine Frage.
      console.log('  Es hat nicht alles geklappt:');
      if (!nodeDa)  console.log('     node\\ fehlt weiterhin');
      if (!baustDa) console.log('     node_modules\\ fehlt weiterhin');
      console.log('  So wuerde der Stick beim Empfaenger nicht starten.');
      const w2 = await fragen('  Trotzdem kopieren?  [j/n]  ');
      if (!ja(w2)) { console.log('\n  Abgebrochen.\n'); rl.close(); return; }
    }
    console.log('');
  }

  // ---- Wohin? ---------------------------------------------------
  //
  // Nicht "welche Laufwerke gibt es", sondern "wo ist der Stick".
  // Eine Liste, in der D: einfach als Nummer 1 steht, sagt einem nichts -
  // man muss raten, ob das der Stick ist oder die zweite Festplatte.
  // Windows weiss das genau: Wechseldatentraeger sind DriveType 2.
  // Danach wird gefragt, mit Namen und Groesse dazu.
  let laufwerke = laufwerkeSuchen();
  let ZIEL = null;

  while (ZIEL === null) {
    const sticks = laufwerke.filter(l => l.wechsel);
    const feste  = laufwerke.filter(l => !l.wechsel);
    const liste  = [...sticks, ...feste];          // Sticks zuerst

    console.log('');
    if (sticks.length) {
      console.log('  Gefundene USB-Sticks:');
      sticks.forEach((l, i) => console.log('    ' + (i + 1) + ')  ' + zeileFuer(l)));
    } else if (laufwerke.length) {
      console.log('  Kein USB-Stick gefunden. Steckt er schon?');
    } else {
      console.log('  Es liessen sich keine Laufwerke ermitteln.');
    }
    if (feste.length) {
      console.log('');
      console.log('  ' + (sticks.length ? 'Andere Laufwerke:' : 'Gefundene Laufwerke (keines davon ein Stick):'));
      feste.forEach((l, i) => console.log('    ' + (sticks.length + i + 1) + ')  ' + zeileFuer(l)));
    }

    console.log('');
    if (sticks.length === 1) {
      console.log('  Eingabetaste  = ' + sticks[0].pfad + 'Amateurfunk-Trainer');
    }
    console.log('  Nummer        = dieses Laufwerk');
    console.log('  n             = noch einmal nach Sticks suchen');
    console.log('  oder einen vollstaendigen Pfad, z.B.  E:\\Kurs-Herbst');

    const eingabe = await fragen('  Ziel:  ');

    // Nichts eingegeben: der einzige Stick, sonst nachfragen.
    if (!eingabe) {
      if (sticks.length === 1) {
        ZIEL = path.resolve(path.join(sticks[0].pfad, 'Amateurfunk-Trainer'));
        console.log('  Gewaehlt: ' + ZIEL);
        break;
      }
      console.log('\n  Kein Ziel angegeben. Abgebrochen.\n');
      rl.close(); return;
    }

    // Noch einmal suchen - der haeufigste Fall ist: Stick vergessen.
    if (/^(n|neu|suchen)$/i.test(eingabe)) {
      console.log('  Suche noch einmal ...');
      laufwerke = laufwerkeSuchen();
      continue;
    }

    const nummer = /^\d+$/.test(eingabe) ? parseInt(eingabe, 10) : 0;
    if (nummer) {
      if (nummer < 1 || nummer > liste.length) {
        console.log('');
        console.log('  !! Es gibt keine Nummer ' + nummer + ' in der Liste oben.');
        continue;
      }
      const gewaehlt = liste[nummer - 1];
      if (!gewaehlt.wechsel) {
        console.log('');
        console.log('  Achtung: ' + gewaehlt.pfad + ' ist kein Wechseldatentraeger,');
        console.log('  sondern eine Festplatte oder ein Netzlaufwerk.');
        const w = await fragen('  Trotzdem dorthin kopieren?  [j/n]  ');
        if (!ja(w)) continue;
      }
      ZIEL = path.resolve(path.join(gewaehlt.pfad, 'Amateurfunk-Trainer'));
      console.log('  Gewaehlt: ' + ZIEL);
      break;
    }

    // Nur ein Buchstabe - dann den Unterordner selbst anhaengen, sonst
    // laege der Trainer lose in der Wurzel des Sticks.
    if (/^[a-zA-Z]:?\\?$/.test(eingabe)) {
      ZIEL = path.resolve(path.join(eingabe[0].toUpperCase() + ':\\', 'Amateurfunk-Trainer'));
      console.log('  Gewaehlt: ' + ZIEL);
      break;
    }

    ZIEL = path.resolve(eingabe);
  }



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
  // Ein nicht leeres Ziel ist der Normalfall, nicht die Ausnahme: Wer
  // denselben Stick ein zweites Mal bespielt, will genau das. Frueher
  // stand hier eine Rueckfrage - sie hat nie etwas verhindert, sondern
  // nur einen Tastendruck gekostet. Gesagt wird es trotzdem.
  try {
    if (fs.existsSync(ZIEL) && fs.readdirSync(ZIEL).length) {
      console.log('  (Der Ordner ist nicht leer - gleichnamige Dateien werden ersetzt.)');
    }
  } catch (e) {}

  // ---- Die Sprachausgabe ----------------------------------------
  //
  // Dietmar: "Piper muss bei USB Stick erstellen auch mit rein". Also
  // ist Mitnehmen die Vorgabe - Eingabetaste genuegt. Die Frage bleibt
  // trotzdem stehen, weil es um rund 470 MB geht und weil sieben Stimmen
  // im Ordner liegen, von denen die meisten niemand anruehrt.
  // ---- Die Sprachausgabe ----------------------------------------
  //
  // Dietmar: "Piper muss bei USB Stick erstellen auch mit rein" und "Es
  // soll nur Fragen wohin USB Stick erkennen und danach durchlaufen".
  // Also kommt alles mit, ohne Frage. Die Auswahl "nur die beste Stimme"
  // gab es hier einmal - sie sparte bei sieben Stimmen rund 340 MB, aber
  // sie kostete eine Entscheidung, und Entscheidungen waren genau das,
  // was weg sollte. Wer Platz sparen will, loescht Stimmen im Ordner
  // piper\ - dann nimmt das Werkzeug automatisch weniger mit.
  const stimmenNehmen = null;        // null = alle
  if (piperDa) {
    const anzahl = stimmenFinden().length;
    console.log('  Sprachausgabe: ' + anzahl + ' Stimme(n), '
                + mb(groesse(path.join(WURZEL, 'piper'))) + ' - kommt mit.');
  }

  // ---- Was sonst noch da ist, kommt mit -------------------------
  const mitOrdner = [];
  for (const o of ORDNER_FRAGEN) {
    const p = path.join(WURZEL, o.name);
    if (!fs.existsSync(p)) continue;
    mitOrdner.push(o.name);
    console.log('  ' + o.text + ': ' + mb(groesse(p)) + ' - kommt mit.');
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
  // Die Sprachausgabe: Unterbau immer, Stimmen nach Wahl.
  if (piperDa && stimmenNehmen !== null && !stimmenNehmen.length) {
    // "ohne Sprachausgabe" - dann bleibt piper\ ganz weg.
  } else if (piperDa) {
    process.stdout.write('    piper\\ ...');
    const vorher = kopiert;
    const von = path.join(WURZEL, 'piper'), nach = path.join(ZIEL, 'piper');
    ordnerSicherstellen(nach);
    const alleStimmen = stimmenFinden().map(v => v.datei);
    for (const e of fs.readdirSync(von, { withFileTypes: true })) {
      if (PIPER_UEBERSPRINGEN.has(e.name)) { uebersprungen++; continue; }
      // Eine Stimmdatei, die nicht gewaehlt wurde? Dann auch ihre .json
      // weglassen - eine .onnx ohne .json findet der Trainer gar nicht.
      const basis = e.name.replace(/\.json$/, '');
      if (alleStimmen.includes(basis) && stimmenNehmen && !stimmenNehmen.includes(basis)) {
        uebersprungen++; continue;
      }
      if (e.isDirectory()) { ordnerSicherstellen(path.join(nach, e.name));
                             kopiereOrdner(path.join(von, e.name), path.join(nach, e.name)); }
      else if (e.isFile()) kopiereDatei(path.join(von, e.name), path.join(nach, e.name));
    }
    console.log(' ' + (kopiert - vorher) + ' Dateien');
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
      'LIEBER EIN SYMBOL AUF DEM DESKTOP?',
      '  Doppelklick auf   Verknuepfung-Erstellen.bat',
      '  Danach liegt "Amateurfunk-Trainer" mit einem Funkgeraet-Symbol',
      '  auf deinem Desktop und startet von dort.',
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
      'Die Stimme klingt nach Windows statt natuerlich:',
      '  Dann ist piper.exe auf DIESEM Rechner nicht gestartet. Meist fehlt',
      '  ein Microsoft-Laufzeitpaket, das der Stick nicht mitbringen darf.',
      '  Doppelklick auf   piper\\piper_reparatur.bat   holt es nach.',
      '  Der Trainer laeuft auch ohne - er liest dann mit der',
      '  Windows-Stimme vor.',
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
