// ================================================================
//  release_hochladen.js - die fertigen Pakete als GitHub-Release
// ================================================================
//  Aufruf:  Doppelklick auf  Release-Hochladen.bat
//
//  WARUM NICHT MIT Hochladen.bat ZUSAMMEN:
//  Hochladen.bat schiebt den Quellcode ins Repository. Dort gilt eine
//  Grenze von 100 MiB je Datei - das Setup ist groesser. Es gehoert an
//  ein Release, und dort sind 2 GiB erlaubt. Zwei verschiedene Orte,
//  zwei verschiedene Werkzeuge.
//
//  Und deshalb bringt Hochladen.bat die Pakete NICHT mit hoch. Sie
//  stehen in der .gitignore, mit Absicht: .deb, .rpm und das Mac-ZIP
//  sind Ergebnisse, nicht Quelltext. Wer sie veroeffentlichen will,
//  ist hier richtig - und nur hier.
//
//  SEIT DEM 12.09.2026 SIND ES VIER DATEIEN, NICHT EINE. Bis dahin kannte
//  dieses Skript nur die EXE. Dazugekommen sind:
//
//     amateurfunk-trainer_<Fassung>_all.deb        Debian, Ubuntu, Mint
//     amateurfunk-trainer-<Fassung>-1.noarch.rpm   Fedora, openSUSE
//     Amateurfunk-Trainer-<Fassung>-mac.zip        macOS
//
//  Alle vier gehoeren an dasselbe Release: eine Fassung, eine Seite,
//  vier Dateien zum Herunterladen. Gebaut werden die drei neuen mit
//  pakete_bauen.sh, die EXE wie immer mit Build-DIREKT.bat.
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

// ---- Wieviel Text nimmt GitHub? -------------------------------
//
// 125.000 Zeichen im Beschreibungsfeld. Und zwar hart: Mehr wird nicht
// gekuerzt, sondern abgewiesen - das Release entsteht dann gar nicht.
//
// AM 12.09.2026 GEMESSEN, weil es gerade knapp geworden waere. Zuletzt
// veroeffentlicht ist v1.111.0, im Ordner liegt 1.275.0. Dazwischen
// stehen 186 Abschnitte im Protokoll, zusammen 355.550 Zeichen - das
// Dreifache des Erlaubten. Ohne diese Grenze waere der erste Versuch
// nach einer langen Pause fehlgeschlagen, und zwar erst nach dem
// Hochladen aller Dateien.
//
// Dietmars Regel vom 01.09.2026 bleibt trotzdem gewahrt: Es wird nichts
// STILL weggelassen. Was nicht mehr hineinpasst, wird unten genannt -
// wieviele Fassungen und welcher Bereich.
const PLATZ = 110000;    // der Rest bleibt fuer die Installationsanleitung
const HOECHSTENS = 12;   // mehr Fassungen liest auf einer Seite niemand
const mb = b => { const m = b / 1024 / 1024; return m < 100 ? m.toFixed(1) : m.toFixed(0); };

// ---- Was liegt in release\ zum Veroeffentlichen? ---------------
//
// Vier Sorten, jede mit ihrem eigenen Namensmuster. Die Muster sind eng
// gefasst, damit nichts mitgeht, was nur so aehnlich heisst: Ein
// "Amateurfunk-Trainer-1.275.0-mac.zip" ist kein Setup, und ein
// "Amateurfunk-Trainer-alt.exe" ist keine Fassung.
const SORTEN = [
  { regel: /^Amateurfunk-Trainer-\d+\.\d+\.\d+\.exe$/i,             hinweis: 'Windows 10 und 11' },
  { regel: /^amateurfunk-trainer_\d+\.\d+\.\d+_all\.deb$/i,          hinweis: 'Debian, Ubuntu, Mint, Raspberry Pi OS' },
  { regel: /^amateurfunk-trainer-\d+\.\d+\.\d+-\d+\.noarch\.rpm$/i, hinweis: 'Fedora, openSUSE, RHEL' },
  { regel: /^Amateurfunk-Trainer-\d+\.\d+\.\d+-mac\.zip$/i,          hinweis: 'macOS 11 und neuer' },
];

function fassungAus(name) {
  const t = String(name).match(/(\d+\.\d+\.\d+)/);
  return t ? t[1] : null;
}

// Alles, was in Frage kommt - neueste Datei zuerst.
function kandidaten() {
  if (!fs.existsSync(ORDNER)) return [];
  const liste = [];
  for (const n of fs.readdirSync(ORDNER)) {
    const sorte = SORTEN.find(x => x.regel.test(n));
    if (!sorte) continue;
    const pfad = path.join(ORDNER, n);
    let stat;
    try { stat = fs.statSync(pfad); } catch (e) { continue; }
    if (!stat.isFile()) continue;
    liste.push({ name: n, pfad, stat, hinweis: sorte.hinweis, version: fassungAus(n) });
  }
  return liste.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);
}

// ---- Was haengt schon an dem Release? --------------------------
//
// WARUM DAS NOETIG IST. Angenommen, v1.275.0 steht mit der EXE schon
// oben, und jetzt sollen die drei Linux- und Mac-Pakete dazu. Ohne
// diese Abfrage wuerde die Beschreibung neu geschrieben - und weil
// keine EXE in release\ liegt, faellt der Windows-Abschnitt heraus.
// Die EXE haengt dann unter einer Anleitung, die sie nicht erwaehnt.
// Deshalb wird die Beschreibung aus BEIDEM gebaut: was neu hochgeht
// und was schon oben ist.
function vorhandeneAnhaenge(tag) {
  try {
    const roh = execSync(
      'gh release view ' + tag + ' --repo ' + KONTO + '/' + REPO + ' --json assets',
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const d = JSON.parse(roh);
    return (d.assets || []).map(a => String(a.name || '')).filter(Boolean);
  } catch (e) { return []; }
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
//
// SEIT DEM 12.09.2026 EIN ABSCHNITT JE SYSTEM - aber nur fuer die
// Systeme, fuer die auch etwas zum Herunterladen daliegt. Eine
// Mac-Anleitung ohne Mac-Paket waere ein Versprechen, das die Seite
// nicht haelt. "namen" sind die Dateinamen am Release: die, die gerade
// hochgehen, und die, die schon oben sind.
//
// UND SEIT DEM 12.09.2026 ABENDS DEUTLICH KUERZER. Dietmar, zum zweiten
// Mal: "zu viel bla bla drin." Zum ersten Mal am 01.09.2026: "Ich
// moechte es nuechterner. Kurze Hinweise wie man es installiert und was
// sich in dem Release veraendert hat."
//
// Ich hatte es am Vormittag wieder aufgeblaeht: drei Schritte je System,
// dazu warum der Punkt-Schraegstrich wichtig ist, was alles im Paket
// steckt, und dass eine Apple-Signatur 99 Dollar im Jahr kostet. Alles
// richtig, alles nachlesbar - aber eine Release-Seite ist keine
// Anleitung. Wer installieren will, braucht den Befehl, nicht die
// Begruendung. Von 3.400 auf 900 Zeichen.
//
// Die Regel fuer das naechste Mal: Ein Satz oder ein Befehl je System.
// Was danach kaeme, gehoert in INSTALLATION.md.
function beschreibung(namen, version, neue) {
  const finde = r => namen.find(n => r.test(n)) || null;
  const exe = finde(/\.exe$/i);
  const deb = finde(/\.deb$/i);
  const rpm = finde(/\.rpm$/i);
  const zip = finde(/-mac\.zip$/i);

  let s = '## Installation\n\n';

  if (exe) {
    s += '**Windows** \u2014 `' + exe + '` starten. Bei "Unbekannter Herausgeber": '
      + '*Weitere Informationen* \u2192 *Trotzdem ausf\u00fchren*.\n\n';
  }

  if (deb || rpm) {
    s += '**Linux** \u2014 Node.js 18 oder neuer holt die Paketverwaltung selbst dazu:\n\n```\n';
    if (deb) s += 'sudo apt install ./' + deb + '\n';
    if (rpm) s += 'sudo dnf install ./' + rpm + '\n'
               +  'sudo zypper install ./' + rpm + '\n';
    s += '```\n\n';
  }

  if (zip) {
    s += '**macOS** \u2014 ZIP entpacken, App nach *Programme*. Beim ersten Start '
      + 'Rechtsklick \u2192 *\u00d6ffnen* (nicht bei Apple signiert). Braucht Node.js 18 oder neuer.\n\n';
  }

  s += 'Der Lernstand bleibt beim Update erhalten';
  if (deb || rpm || zip) {
    s += ':\n\n```\n'
      + 'Windows : data\\ im Installationsordner\n'
      + 'Linux   : ~/.local/share/amateurfunk-trainer\n'
      + 'macOS   : ~/Library/Application Support/Amateurfunk-Trainer\n'
      + '```\n\n';
  } else {
    s += ' \u2013 der Ordner `data\\` wird nicht angefasst.\n\n';
  }

  if (neue.length) {
    s += '## \u00c4nderungen\n\n';

    // Neueste zuerst hineinnehmen, solange Platz ist. "neue" kommt
    // schon in dieser Reihenfolge aus abschnitte().
    let genommen = 0;
    for (const a of neue) {
      const stueck = '### ' + a.version + ' \u2013 ' + a.datum + '\n\n'
         // "### Geaendert" -> "**Geändert**". \w trifft keine Umlaute,
         // deshalb die ganze Zeile fassen statt das Wort.
         + a.text.replace(/^###[ \t]*(.+?)[ \t]*$/gm, '**$1**') + '\n\n';
      if (genommen >= HOECHSTENS) break;
      if (genommen > 0 && s.length + stueck.length > PLATZ) break;
      s += stueck;
      genommen++;
    }

    // Der erste Abschnitt kommt immer mit, auch wenn er allein schon zu
    // lang ist - eine Seite ohne jede Aenderungsliste waere schlechter.
    // Dann muss er aber gekuerzt werden, sonst weist GitHub ab.
    if (s.length > PLATZ) {
      s = s.slice(0, PLATZ) + '\n\n\u2026 hier abgeschnitten, das Protokoll ist l\u00e4nger als eine Release-Seite fassen kann.\n\n';
    }

    const rest = neue.slice(genommen);
    if (rest.length) {
      const von = rest[rest.length - 1].version;
      const bis = rest[0].version;
      s += '_Davor liegen ' + rest.length + ' weitere Fassungen'
        + (von === bis ? ' (' + von + ')' : ' (' + von + ' bis ' + bis + ')')
        + '. Sie stehen vollst\u00e4ndig im Protokoll._\n\n';
    }
    s += 'Ausf\u00fchrlich in [CHANGELOG.md](' + SEITE + '/blob/main/CHANGELOG.md).\n';
  }
  return s;
}

(async () => {
  console.log('');
  console.log('  ============================================================');
  console.log('   Die Pakete als GitHub-Release veroeffentlichen');
  console.log('  ============================================================');
  console.log('');

  const alleDateien = kandidaten();
  if (!alleDateien.length) {
    console.log('  In release\\ liegt nichts zum Veroeffentlichen.');
    console.log('');
    console.log('  Das Setup fuer Windows baut Build-DIREKT.bat.');
    console.log('  Die Pakete fuer Linux und Mac baut pakete_bauen.sh.');
    console.log('');
    leitung && leitung.close();
    return;
  }

  // Es gilt die HOECHSTE Nummer im Ordner.
  //
  // AM 12.09.2026 KORRIGIERT. Zuerst stand hier "die EXE gibt die
  // Fassung vor, wenn eine daliegt". Das ist in Dietmars Ordner sofort
  // schiefgegangen: Dort lag noch  Amateurfunk-Trainer-1.111.0.exe  vom
  // August. Nach jener Regel waere 1.111.0 die Fassung gewesen - und die
  // drei fertigen Pakete von 1.275.0 haette das Skript als "andere
  // Fassung" beiseitegelegt. Veroeffentlicht worden waere eine alte EXE
  // unter einem alten Tag.
  //
  // Nach der Nummer zu gehen ist dagegen unempfindlich gegen Altlasten:
  // Versionsnummern steigen, ein liegengebliebener Bau hat immer die
  // kleinere. Bei gleicher Nummer entscheidet das Datum.
  const nummer = v => String(v || '0.0.0').split('.').map(Number);
  const hoeher = (a, b) => {
    const x = nummer(a.version), y = nummer(b.version);
    for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0);
    return a.stat.mtimeMs > b.stat.mtimeMs;
  };
  const leitdatei = alleDateien.reduce((a, b) => (hoeher(b, a) ? b : a));
  const version = leitdatei.version;
  if (!version) {
    console.log('  Aus dem Dateinamen laesst sich keine Version lesen:');
    console.log('    ' + leitdatei.name);
    console.log('');
    leitung && leitung.close();
    return;
  }

  // Nur, was dieselbe Nummer traegt. Ein .deb von 1.270.0 unter der
  // Ueberschrift "Amateurfunk-Trainer 1.275.0" waere schlimmer als
  // gar keines: Es sieht richtig aus und ist es nicht.
  const dateien = alleDateien.filter(d => d.version === version);
  const daneben = alleDateien.filter(d => d.version !== version);
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

  // ---- Gibt es das Release schon, und was haengt dran? ---------
  //
  // Muss VOR die Anzeige, denn davon haengt ab, welche Abschnitte in die
  // Beschreibung passen - und die Anzeige soll genau das melden, was
  // nachher wirklich hochgeht.
  let vorhanden = false;
  if (angemeldet) {
    try { execSync('gh release view ' + tag + ' --repo ' + KONTO + '/' + REPO, { stdio: 'ignore' }); vorhanden = true; }
    catch (e) { vorhanden = false; }
  }
  const schonDa = vorhanden ? vorhandeneAnhaenge(tag) : [];
  const namen = dateien.map(d => d.name);
  for (const n of schonDa) if (!namen.includes(n)) namen.push(n);

  const text = beschreibung(namen, version, neue);
  // Wieviele Abschnitte haben es hineingeschafft? Am Text abgelesen,
  // nicht nachgerechnet - dann kann die Anzeige nicht danebenliegen.
  const drin = (text.match(/^### \d+\.\d+\.\d+ /gm) || []).length;

  console.log('  Dateien     :');
  for (const d of dateien) {
    console.log('    ' + d.name);
    console.log('       ' + mb(d.stat.size) + ' MiB - ' + d.hinweis);
  }
  console.log('  Tag         : ' + tag);
  console.log('  Titel       : ' + titel);
  if (bisher !== null) console.log('  Zuletzt dort: v1.' + bisher + '.0');
  console.log('');
  if (daneben.length) {
    console.log('  DIESE BLEIBEN LIEGEN - andere Fassung als ' + version + ':');
    for (const d of daneben) console.log('    ' + d.name + '   (' + (d.version || 'ohne Nummer') + ')');
    console.log('  Wenn eine davon mit soll, erst neu bauen.');
    console.log('');
  }

  // Was fehlt, wird benannt. Sonst faellt erst auf der fertigen Seite
  // auf, dass fuer ein System nichts zum Herunterladen dasteht.
  const fehlt = [];
  if (!dateien.some(d => /\.exe$/i.test(d.name)))      fehlt.push('Windows (Build-DIREKT.bat)');
  if (!dateien.some(d => /\.deb$|\.rpm$/i.test(d.name))) fehlt.push('Linux (pakete_bauen.sh)');
  if (!dateien.some(d => /-mac\.zip$/i.test(d.name)))   fehlt.push('macOS (pakete_bauen.sh)');
  if (fehlt.length) {
    console.log('  Fuer diese Systeme liegt nichts von ' + version + ' da:');
    for (const f of fehlt) console.log('    - ' + f);
    console.log('  Das Release entsteht trotzdem - nur ohne diese Dateien.');
    console.log('  Spaeter nachschieben geht: einfach noch einmal starten.');
    console.log('');
  }
  if (neue.length) {
    console.log('  Beschreibung - diese Fassungen stehen darin:');
    for (const a of neue.slice(0, drin)) console.log('    - ' + a.version + '  (' + a.datum + ')');
    const rest = neue.slice(drin);
    if (rest.length) {
      console.log('');
      console.log('    Dazu ein Hinweis auf ' + rest.length + ' aeltere Fassungen');
      console.log('    (' + rest[rest.length - 1].version + ' bis ' + rest[0].version + ') mit Verweis aufs Protokoll.');
      console.log('    Alle auf einmal gehen nicht: GitHub nimmt 125.000 Zeichen');
      console.log('    im Beschreibungsfeld, diese ' + neue.length + ' Abschnitte sind mehr.');
    }
    console.log('');
    console.log('  Laenge      : ' + text.length.toLocaleString('de-DE') + ' Zeichen (GitHub erlaubt 125.000)');
    console.log('');
  }

  if (!hatGh || !angemeldet) {
    // ---- Weg von Hand ------------------------------------------
    //
    // Auch hier ist nichts zu tippen: Tag und Titel stehen schon in
    // der Adresse der Seite, die Beschreibung liegt in der
    // Zwischenablage. Auf der Seite genuegt Strg+V.
    const notizDatei = path.join(ORDNER, '_release-notiz.md');
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
    if (dateien.length === 1) {
      console.log('    1. ' + dateien[0].name + ' aus dem Explorer in die Seite ziehen.');
    } else {
      console.log('    1. Diese ' + dateien.length + ' Dateien aus release\\ in die Seite ziehen:');
      for (const d of dateien) console.log('         ' + d.name);
      // Im Ordner liegt immer auch _release-notiz.md, und oft ein
      // Paket von vorher. "Strg+A" waere dann eine Falle.
      if (!daneben.length) {
        console.log('       (Mehrfachauswahl mit Strg und Klick - aber nicht');
        console.log('        _release-notiz.md, die gehoert nicht dazu.)');
      }
    }
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

  // "vorhanden", "schonDa", "namen" und "text" stehen schon oben - sie
  // mussten vor die Anzeige.
  const notizDatei = path.join(ORDNER, '_release-notiz.md');
  fs.writeFileSync(notizDatei, text, 'utf8');

  if (vorhanden) {
    console.log('  Das Release ' + tag + ' gibt es schon. Titel und');
    console.log('  Beschreibung werden aufgefrischt, die ' + dateien.length
                 + (dateien.length === 1 ? ' Datei' : ' Dateien'));
    console.log('  ersetzt oder neu angehaengt.');
    const dazu = schonDa.filter(n => !dateien.some(d => d.name === n));
    if (dazu.length) {
      console.log('  Schon dort und bleibt unberuehrt: ' + dazu.join(', '));
    }
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

  // gh nimmt beliebig viele Dateien in einem Aufruf. --clobber ersetzt
  // eine gleichnamige, laesst die anderen stehen.
  const pfade = dateien.map(d => zitat(d.pfad));
  const argumente = vorhanden
    ? ['release', 'upload', tag].concat(pfade,
       ['--clobber', '--repo', KONTO + '/' + REPO])
    : ['release', 'create', tag].concat(pfade,
       ['--repo', KONTO + '/' + REPO,
        '--title', zitat(titel),
        '--notes-file', zitat(notizDatei),
        '--latest']);

  // Durchgereicht, damit gh seinen Fortschritt zeigen kann - die EXE
  // allein sind 105 MiB, mit den drei Paketen kommen 29 MiB dazu, und
  // ein Fenster ohne Lebenszeichen sieht aus wie ein Haenger.
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
