// ================================================================
//  release_hochladen.js - das fertige Setup als GitHub-Release
// ================================================================
//  Aufruf:  Doppelklick auf  Release-Hochladen.bat
//
//  WARUM NICHT MIT Hochladen.bat ZUSAMMEN:
//  Hochladen.bat schiebt den Quellcode ins Repository. Dort gilt eine
//  Grenze von 100 MiB je Datei - das Setup ist groesser. Es gehoert an
//  ein Release, und dort sind 2 GiB erlaubt. Zwei verschiedene Orte,
//  zwei verschiedene Werkzeuge.
//
//  DIETMAR AM 01.09.2026:
//    "Ich moechte die aktuelle Version hochladen. New release,
//     Release title und Beschreibung. Waere schoen wenn das die Bat
//     automatisch ausfuellen und komplett uebernehmen koennte."
//
//  Beides wird jetzt hier ausgerechnet, es ist nichts mehr zu tippen:
//
//    Titel        = "Amateurfunk-Trainer <Version>"
//    Tag          = "v<Version>"      (beides aus dem Dateinamen)
//    Beschreibung = kurze Installationsanleitung
//                   + ALLE Versionsabschnitte aus CHANGELOG.md, die
//                     seit dem letzten veroeffentlichten Release
//                     dazugekommen sind - nicht nur der letzte.
//
//  Warum "seit dem letzten Release" und nicht "der letzte Abschnitt":
//  Es wird nicht nach jedem Bau veroeffentlicht. Am 01.09.2026 lagen
//  1.98.0 und 1.99.0 im Ordner release\, veroeffentlicht war keins von
//  beiden. Wer da nur den letzten Abschnitt nimmt, verschweigt eine
//  ganze Fassung. Die Zuordnung ist eindeutig, seit jede Ueberschrift
//  im Protokoll ihre Versionsnummer traegt:  ## [1.103.0] - 2026-09-02.
//
//  ZUGANGSDATEN FASST DIESES SKRIPT NICHT AN. Angemeldet wird ueber
//  "gh auth login" - das ist GitHubs eigenes Verfahren. Hier wird nur
//  nachgesehen, OB eine Anmeldung besteht.
// ================================================================
'use strict';
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync, spawnSync } = require('child_process');

const WURZEL   = __dirname;
const ORDNER   = path.join(WURZEL, 'release');
const KONTO    = 'Amateurfunk-Gruppe';
const REPO     = 'Amateurfunk-Trainer';
const SEITE    = 'https://github.com/' + KONTO + '/' + REPO;

let leitung = null;
function fragen(text) {
  if (!leitung) leitung = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(a => leitung.question(text, w => a(String(w || '').trim())));
}
const ja = w => /^(j|ja|y|yes)$/i.test(w);
const mb = b => (b / 1024 / 1024).toFixed(0);

// ---- Welches Setup? --------------------------------------------
function neuestesSetup() {
  if (!fs.existsSync(ORDNER)) return null;
  const treffer = fs.readdirSync(ORDNER)
    .filter(n => /^Amateurfunk-Trainer-.*\.exe$/i.test(n))
    .map(n => ({ name: n, pfad: path.join(ORDNER, n), stat: fs.statSync(path.join(ORDNER, n)) }))
    .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);
  return treffer[0] || null;
}

// ---- Das Aenderungsprotokoll in Abschnitte zerlegen -------------
//
// Seit dem 02.09.2026 traegt jede Ueberschrift ihre Versionsnummer:
//
//     ## [1.103.0] - 2026-09-02
//
// Rueckgabe: [{ version, stufe, datum, text }], neueste zuerst.
// "stufe" ist die mittlere Zahl - an ihr haengt die Reihenfolge, denn
// die erste ist immer 1 und die letzte immer 0.
function abschnitte() {
  const datei = path.join(WURZEL, 'CHANGELOG.md');
  if (!fs.existsSync(datei)) return [];
  const zeilen = fs.readFileSync(datei, 'utf8').split(/\r?\n/);
  const treffer = [];
  for (let i = 0; i < zeilen.length; i++) {
    const t = zeilen[i].match(/^##\s*\[(\d+)\.(\d+)\.(\d+)\]\s*-\s*(\S+)/);
    if (t) treffer.push({ zeile: i, version: t[1] + '.' + t[2] + '.' + t[3], stufe: Number(t[2]), datum: t[4] });
  }
  return treffer.map((a, i) => {
    // Bis zur naechsten Versionsueberschrift - oder bis zur naechsten
    // Ueberschrift ueberhaupt, damit der Anhang "Bekannte
    // Einschraenkungen" am Ende nicht in die letzte Version rutscht.
    let bis = zeilen.length;
    for (let j = a.zeile + 1; j < zeilen.length; j++) {
      if (/^##\s/.test(zeilen[j])) { bis = j; break; }
    }
    return Object.assign({}, a, { text: zeilen.slice(a.zeile + 1, bis).join('\n').trim() });
  });
}

// Mit shell:true haengt Node die Argumente ungeschuetzt aneinander.
// Der Titel enthaelt ein Leerzeichen ("Amateurfunk-Trainer 1.99.0"), der
// Pfad zum Setup kann eines enthalten (C:\Program Files\...) - ohne
// Anfuehrungszeichen zerfaellt beides in mehrere Argumente, und gh
// beschwert sich ueber etwas ganz anderes, als der Fehler ist.
function zitat(s) { return '"' + String(s).replace(/"/g, '\\"') + '"'; }

function gibtEs(befehl) {
  try { execSync(befehl, { stdio: 'ignore' }); return true; } catch (e) { return false; }
}

// ---- Welche Fassung steht schon auf GitHub? --------------------
//
// Aus den vorhandenen Releases die hoechste Nummer 1.N.0 heraussuchen.
// Ohne gh (oder ohne Netz) kommt null zurueck - dann wird nur der
// Abschnitt dieser Fassung genommen, was immer noch besser ist als
// gar keine Beschreibung.
function letzteVeroeffentlichte() {
  try {
    const roh = execSync(
      'gh release list --limit 100 --repo ' + KONTO + '/' + REPO + ' --json tagName',
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const liste = JSON.parse(roh);
    let hoechste = 0;
    for (const e of liste) {
      const t = String(e.tagName || '').match(/(\d+)\.(\d+)\.(\d+)/);
      if (t && Number(t[2]) > hoechste) hoechste = Number(t[2]);
    }
    return hoechste || null;
  } catch (e) { return null; }
}

// ---- Die Beschreibung zusammensetzen ---------------------------
//
// NUECHTERN. Dietmar am 01.09.2026: "Zuviel bla bla in
// _release-notiz.md. Ich moechte es nuechterner. Kurze Hinweise wie man
// es installiert und was sich in dem Release veraendert hat."
//
// Seit dem Umbau des Protokolls am 02.09.2026 ist genau das schon der
// Inhalt der Abschnitte: Versionsnummer, Datum, drei bis acht Punkte
// unter Hinzugefuegt / Geaendert / Behoben. Sie werden hier
// uebernommen, wie sie sind - nur eine Ebene tiefer gehaengt, damit sie
// unter "Aenderungen" stehen und nicht daneben.
function beschreibung(setup, version, neue) {
  let s =
    '## Installation\n\n' +
    '1. **' + setup.name + '** herunterladen und starten.\n' +
    '2. Der Assistent fragt, wohin installiert wird.\n' +
    '3. Windows meldet "Unbekannter Herausgeber": *Weitere Informationen* ' +
    '\u2192 *Trotzdem ausf\u00fchren*.\n\n' +
    'Enthalten sind Node.js, die Sprachausgabe mit deutscher Stimme, der ' +
    'amtliche Fragenkatalog und die Formelsammlung. Beim Einrichten wird ' +
    'keine Internetverbindung gebraucht.\n\n' +
    'Beim Update bleibt der Lernstand erhalten \u2013 der Ordner `data\\` ' +
    'wird nicht angefasst. Beim Deinstallieren wird gefragt, ob er ' +
    'mit weg soll.\n\n';

  if (neue.length) {
    s += '## \u00c4nderungen\n\n';
    for (const a of neue) {
      s += '### ' + a.version + ' \u2013 ' + a.datum + '\n\n'
         // "### Geaendert" -> "**Geändert**". \w trifft keine Umlaute,
         // deshalb die ganze Zeile fassen statt das Wort.
         + a.text.replace(/^###[ \t]*(.+?)[ \t]*$/gm, '**$1**') + '\n\n';
    }
    s += 'Ausf\u00fchrlich in [CHANGELOG.md](' + SEITE + '/blob/main/CHANGELOG.md).\n';
  }
  return s;
}

(async () => {
  console.log('');
  console.log('  ============================================================');
  console.log('   Setup als GitHub-Release veroeffentlichen');
  console.log('  ============================================================');
  console.log('');

  const setup = neuestesSetup();
  if (!setup) {
    console.log('  In release\\ liegt kein Setup.');
    console.log('  Erst Build-DIREKT.bat ausfuehren.');
    console.log('');
    leitung && leitung.close();
    return;
  }
  const version = (setup.name.match(/(\d+\.\d+\.\d+)/) || [, null])[1];
  if (!version) {
    console.log('  Aus dem Dateinamen laesst sich keine Version lesen:');
    console.log('    ' + setup.name);
    console.log('');
    leitung && leitung.close();
    return;
  }
  const tag   = 'v' + version;
  const titel = 'Amateurfunk-Trainer ' + version;
  const stufe = Number((version.match(/^\d+\.(\d+)\./) || [, 0])[1]);

  // ---- Ist gh da und angemeldet? -------------------------------
  const hatGh = gibtEs('gh --version');
  const angemeldet = hatGh && gibtEs('gh auth status');

  // ---- Was ist neu? --------------------------------------------
  const alle = abschnitte();
  const bisher = angemeldet ? letzteVeroeffentlichte() : null;
  let neue;
  if (bisher !== null && bisher < stufe) {
    neue = alle.filter(a => a.stufe > bisher && a.stufe <= stufe);
  } else {
    // Noch nie veroeffentlicht, kein gh, oder die Nummer steht nicht im
    // Protokoll: dann der Abschnitt dieser Fassung allein.
    neue = alle.filter(a => a.stufe === stufe);
    if (!neue.length && alle.length) neue = [alle[0]];
  }

  console.log('  Datei       : ' + setup.name + '  (' + mb(setup.stat.size) + ' MiB)');
  console.log('  Tag         : ' + tag);
  console.log('  Titel       : ' + titel);
  if (bisher !== null) console.log('  Zuletzt dort: v1.' + bisher + '.0');
  console.log('');
  if (neue.length) {
    console.log('  Beschreibung (wird vollstaendig uebernommen):');
    for (const a of neue) console.log('    - ' + a.version + '  (' + a.datum + ')');
    console.log('');
  }

  if (!hatGh || !angemeldet) {
    // ---- Weg von Hand ------------------------------------------
    //
    // Auch hier ist nichts zu tippen: Tag und Titel stehen schon in
    // der Adresse der Seite, die Beschreibung liegt in der
    // Zwischenablage. Auf der Seite genuegt Strg+V.
    const notizDatei = path.join(ORDNER, '_release-notiz.md');
    const text = beschreibung(setup, version, neue);
    fs.writeFileSync(notizDatei, text, 'utf8');
    let inZwischenablage = false;
    try {
      // clip.exe liest UTF-16LE mit Byte-Order-Mark zuverlaessig,
      // UTF-8 nicht - Umlaute kaemen sonst als Kraut heraus.
      const r = spawnSync('clip', [], { input: Buffer.from('﻿' + text, 'utf16le'), shell: true });
      inZwischenablage = (r.status === 0);
    } catch (e) {}

    console.log('  ' + (hatGh
      ? 'Die GitHub-Befehlszeile ist da, aber nicht angemeldet.'
      : 'Die GitHub-Befehlszeile (gh) ist auf diesem Rechner nicht da.'));
    console.log('  Deshalb der Weg von Hand - er dauert eine Minute.');
    console.log('');
    console.log('  Ich mache gleich beides auf: die Release-Seite mit');
    console.log('  bereits gesetztem Tag und Titel, und den Ordner release\\.');
    console.log('');
    console.log('    1. Die EXE aus dem Explorer in die Seite ziehen.');
    if (inZwischenablage) {
      console.log('    2. In das grosse Textfeld Strg+V - die fertige');
      console.log('       Beschreibung liegt in der Zwischenablage.');
    } else {
      console.log('    2. In das grosse Textfeld den Text aus dieser Datei:');
      console.log('       ' + notizDatei);
    }
    console.log('    3. Auf "Publish release".');
    console.log('');
    console.log('  Damit es beim naechsten Mal ganz von allein geht:');
    if (!hatGh) {
      console.log('     1. winget install GitHub.cli      (oder cli.github.com)');
      console.log('     2. Fenster schliessen und neu oeffnen');
      console.log('     3. gh auth login');
    } else {
      console.log('     gh auth login');
    }
    console.log('  Zugangsdaten laufen dabei ueber GitHub selbst -');
    console.log('  dieses Skript sieht sie nie.');
    console.log('');
    const w = await fragen('  Jetzt Browser und Ordner oeffnen?  [j/n]  ');
    if (ja(w)) {
      const url = SEITE + '/releases/new?tag=' + encodeURIComponent(tag)
                + '&title=' + encodeURIComponent(titel);
      // Das kaufmaennische Und muss fuer cmd geschuetzt werden, sonst
      // schneidet die Eingabeaufforderung die Adresse dort ab.
      try { spawnSync('cmd', ['/c', 'start', '', url.replace(/&/g, '^&')], { stdio: 'ignore' }); } catch (e) {}
      try { spawnSync('cmd', ['/c', 'start', '', ORDNER], { stdio: 'ignore' }); } catch (e) {}
      console.log('  Aufgemacht.');
    }
    console.log('');
    leitung && leitung.close();
    return;
  }

  // ---- Gibt es das Release schon? ------------------------------
  let vorhanden = false;
  try { execSync('gh release view ' + tag + ' --repo ' + KONTO + '/' + REPO, { stdio: 'ignore' }); vorhanden = true; }
  catch (e) { vorhanden = false; }

  const notizDatei = path.join(ORDNER, '_release-notiz.md');
  fs.writeFileSync(notizDatei, beschreibung(setup, version, neue), 'utf8');

  if (vorhanden) {
    console.log('  Das Release ' + tag + ' gibt es schon. Titel und');
    console.log('  Beschreibung werden aufgefrischt, die Datei ersetzt.');
  } else {
    console.log('  Das Release ' + tag + ' wird neu angelegt.');
  }
  console.log('');
  console.log('  Titel und Beschreibung sind fertig ausgefuellt - es ist');
  console.log('  nichts mehr einzutippen: kurze Installationsanleitung, dann');
  console.log('  die Aenderungen als Liste. Nachlesen und aendern hier:');
  console.log('    ' + notizDatei);
  console.log('  (Aendern nur VOR dem j - danach ist es raus.)');
  console.log('');
  const w = await fragen('  Jetzt veroeffentlichen?  [j/n]  ');
  if (!ja(w)) { console.log('\n  Abgebrochen. Nichts veroeffentlicht.\n'); leitung.close(); return; }
  console.log('');

  // Bei einem neuen Release macht "gh release create" alles in einem
  // Zug. Bei einem vorhandenen sind es zwei Schritte: erst Titel und
  // Text auffrischen (edit), dann die Datei ersetzen (upload
  // --clobber). "create" wuerde an einem vorhandenen Tag scheitern -
  // und ohne "edit" bliebe die alte Beschreibung stehen, waehrend die
  // neue EXE darunterhaengt. Das waere die schlimmste Mischung.
  let fertig = true;
  if (vorhanden) {
    const e = spawnSync('gh', ['release', 'edit', tag,
      '--repo', KONTO + '/' + REPO,
      '--title', zitat(titel),
      '--notes-file', zitat(notizDatei),
      '--latest'], { cwd: WURZEL, stdio: 'inherit', shell: true });
    if (e.status !== 0) fertig = false;
  }

  const argumente = vorhanden
    ? ['release', 'upload', tag, zitat(setup.pfad), '--clobber', '--repo', KONTO + '/' + REPO]
    : ['release', 'create', tag, zitat(setup.pfad),
       '--repo', KONTO + '/' + REPO,
       '--title', zitat(titel),
       '--notes-file', zitat(notizDatei),
       '--latest'];

  // Durchgereicht, damit gh seinen Fortschritt zeigen kann - 105 MiB
  // dauern, und ein Fenster ohne Lebenszeichen sieht aus wie ein Haenger.
  const r = spawnSync('gh', argumente, { cwd: WURZEL, stdio: 'inherit', shell: true });
  if (r.status !== 0) fertig = false;

  console.log('');
  if (fertig) {
    console.log('  Fertig. Zu sehen unter:');
    console.log('  ' + SEITE + '/releases/tag/' + tag);
  } else {
    console.log('  Fehlgeschlagen (Code ' + r.status + ').');
    console.log('  Haeufigste Gruende: nicht angemeldet (gh auth login),');
    console.log('  keine Schreibrechte am Repository, oder die Leitung ist');
    console.log('  mittendrin abgerissen. Es ist nichts kaputtgegangen -');
    console.log('  der Versuch laesst sich einfach wiederholen.');
  }
  console.log('');
  leitung.close();
})();
