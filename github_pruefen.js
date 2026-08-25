// ================================================================
// github_pruefen.js - Was wuerde beim Hochladen oeffentlich werden?
//
// ES WIRD NICHTS HOCHGELADEN UND NICHTS VERAENDERT. Das Skript liest nur
// und schreibt einen Bericht.
//
// WARUM DAS VOR DEM ERSTEN PUSH GEHOERT:
// Eine .gitignore wirkt nur nach vorn. Was einmal committet wurde, steckt
// in der Historie - auch wenn die Datei laengst geloescht ist. Beim Push
// geht die ganze Historie mit. Danach hilft kein Loeschen mehr: Wer den
// Stand gezogen hat, hat ihn.
//
// Zwei Sorten Fund sind kritisch:
//   1. data/  - dein Lernstand und der deiner Mitlernenden. Persoenliche
//      Daten gehoeren nicht in ein oeffentliches Repository.
//   2. Grosse Binaerdateien - cloudflared.exe (54 MB), der Node-Installer
//      (31 MB), die Piper-Stimmen (~420 MB). GitHub warnt ab 50 MB je
//      Datei und lehnt ab 100 MB ganz ab.
// ================================================================
'use strict';
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const WURZEL = __dirname;

function git(befehl) {
  return execSync('git ' + befehl, { cwd: WURZEL, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}
const mb = b => (b / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';

// Was in einem oeffentlichen Repository nichts zu suchen hat.
const HEIKEL = [
  { muster: /^data\//i,                  grund: 'LERNSTAND - persoenliche Daten von dir und deinen Mitlernenden' },
  { muster: /amateurfunk_data\.json/i,   grund: 'LERNSTAND - persoenliche Daten' },
  { muster: /Klasse-N-Lernstand.*\.json/i, grund: 'gesicherter Lernstand' },
  { muster: /^tunnel.*\.(log|txt)$/i,    grund: 'Tunnel-Adresse und Protokoll' },
  { muster: /\.env$/i,                   grund: 'Zugangsdaten' },
  { muster: /paket_zaehler\.json/i,      grund: 'Zaehler - harmlos, aber unnoetig' },
];
const GROSS = [
  { muster: /cloudflared(\.exe)?$/i, grund: '54 MB Programmdatei' },
  { muster: /\.msi$/i,               grund: 'Installer' },
  { muster: /^piper\//i,             grund: 'Sprachmodelle, mehrere hundert MB' },
  { muster: /^node_modules\//i,      grund: 'kommt beim Empfaenger per npm install' },
  { muster: /^tts_cache\//i,         grund: 'Zwischenspeicher, jederzeit neu erzeugbar' },
  { muster: /^Hoerbuch\//i,          grund: 'deine MP3s, jederzeit neu erzeugbar' },
  { muster: /^_Aufgeraeumt/i,        grund: 'Aufraeum-Ordner' },
];

function pruefe(name, liste) {
  const treffer = [];
  for (const d of liste) {
    for (const h of HEIKEL) if (h.muster.test(d)) { treffer.push(['!!', d, h.grund]); break; }
    for (const g of GROSS)  if (g.muster.test(d)) { treffer.push(['**', d, g.grund]); break; }
  }
  return treffer;
}

function main() {
  console.log('');
  try { git('rev-parse --is-inside-work-tree'); }
  catch (e) { console.log('Hier ist kein Git-Repository. Dann gibt es auch keine Historie - alles gut.'); return; }

  // ---- 1. Was ist JETZT nachverfolgt? ----
  const jetzt = git('ls-files').split('\n').filter(Boolean);
  console.log('1) Aktuell nachverfolgt: ' + jetzt.length + ' Dateien');
  const jetztHeikel = pruefe('jetzt', jetzt);
  if (jetztHeikel.length) {
    jetztHeikel.forEach(t => console.log('   ' + t[0] + ' ' + t[1] + '   <- ' + t[2]));
  } else {
    console.log('   nichts Heikles dabei.');
  }

  // ---- 2. Was steckt in der HISTORIE? ----
  // Der eigentliche Punkt: geloescht ist nicht weg.
  let historie = [];
  try {
    historie = [...new Set(git('log --all --pretty=format: --name-only --diff-filter=A')
      .split('\n').map(s => s.trim()).filter(Boolean))];
  } catch (e) { console.log('   (Historie nicht lesbar: ' + e.message + ')'); }
  console.log('');
  console.log('2) Jemals committet: ' + historie.length + ' verschiedene Dateien');
  const histHeikel = pruefe('hist', historie).filter(t => !jetzt.includes(t[1]));
  if (histHeikel.length) {
    console.log('   Diese Dateien sind heute nicht mehr da, stecken aber in der Historie:');
    histHeikel.slice(0, 40).forEach(t => console.log('   ' + t[0] + ' ' + t[1] + '   <- ' + t[2]));
    if (histHeikel.length > 40) console.log('   ... und ' + (histHeikel.length - 40) + ' weitere');
  } else {
    console.log('   nichts Heikles in der Historie.');
  }

  // ---- 3. Die groessten Brocken ----
  console.log('');
  console.log('3) Die groessten Objekte in der Historie:');
  try {
    const roh = execSync('git rev-list --objects --all | git cat-file --batch-check="%(objecttype) %(objectname) %(objectsize) %(rest)"',
      { cwd: WURZEL, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    const blobs = roh.split('\n')
      .filter(z => z.startsWith('blob '))
      .map(z => { const t = z.split(' '); return { groesse: parseInt(t[2], 10) || 0, name: t.slice(3).join(' ') }; })
      .filter(x => x.name)
      .sort((a, b) => b.groesse - a.groesse)
      .slice(0, 10);
    let summe = 0;
    blobs.forEach(x => { console.log('   ' + mb(x.groesse).padStart(9) + '  ' + x.name); });
    const alle = roh.split('\n').filter(z => z.startsWith('blob '))
      .reduce((s, z) => s + (parseInt(z.split(' ')[2], 10) || 0), 0);
    console.log('   ------');
    console.log('   ' + mb(alle).padStart(9) + '  alle Fassungen aller Dateien zusammen');
    if (blobs[0] && blobs[0].groesse > 100 * 1024 * 1024) {
      console.log('   !! Ueber 100 MB - GitHub lehnt den Push ab.');
    } else if (blobs[0] && blobs[0].groesse > 50 * 1024 * 1024) {
      console.log('   ** Ueber 50 MB - GitHub nimmt es an, warnt aber.');
    }
  } catch (e) { console.log('   (nicht ermittelbar: ' + (e.message || '').split('\n')[0] + ')'); }

  // ---- 4. Fazit ----
  console.log('');
  console.log('==========================================================');
  const schlimm = jetztHeikel.filter(t => t[0] === '!!').length + histHeikel.filter(t => t[0] === '!!').length;
  const gross  = jetztHeikel.filter(t => t[0] === '**').length + histHeikel.filter(t => t[0] === '**').length;
  if (!schlimm && !gross) {
    console.log('SAUBER. Nichts Persoenliches, nichts Uebergrosses.');
    console.log('Das Repository kann oeffentlich hochgeladen werden.');
  } else {
    if (schlimm) console.log('!! ' + schlimm + ' Eintrag/Eintraege mit PERSOENLICHEN DATEN.');
    if (gross)   console.log('** ' + gross + ' Eintrag/Eintraege mit grossen Dateien.');
    console.log('');
    console.log('Beides laesst sich NICHT durch Loeschen beheben - es steckt in der');
    console.log('Historie. Der saubere Weg ist ein frisches Repository ohne die alte');
    console.log('Historie. Schick mir diese Ausgabe, dann sage ich dir, was zu tun ist.');
  }
  console.log('==========================================================');
  console.log('');
}

main();
