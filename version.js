// ================================================================
//  version.js - die Versionsnummer kommt aus dem CHANGELOG
// ================================================================
//  Dietmar am 01.09.2026: "Beim Erstellen einer exe sind wir derzeit
//  bei 1.0.1. Schau mal im CHANGELOG.md, das ist bei weitem weiter.
//  Ich moechte eine hoehere Zahl, an dem CHANGELOG.md angepasst, die
//  fortlaufend ist."
//
//  DIE REGEL:  1.<Anzahl der Eintraege im CHANGELOG>.0
//
//  Heute sind das 94 Eintraege, also 1.94.0. Jeder neue Abschnitt im
//  Aenderungsprotokoll hebt die Nummer um eins.
//
//  WARUM SO:
//  Eine Versionsnummer, die von Hand gepflegt wird, laeuft irgendwann
//  aus dem Tritt - man baut, vergisst das Hochzaehlen, und zwei
//  verschiedene Programme heissen gleich. Hier kann das nicht
//  passieren: Wer etwas aendert, schreibt es ins Protokoll, und damit
//  steigt die Nummer von selbst. Wer nichts ins Protokoll schreibt,
//  hat auch nichts geaendert, das eine neue Nummer verdient.
//
//  Sie kann nur steigen, nie fallen, und sie ist an jeder Stelle
//  dieselbe: im Dateinamen der EXE, in den Dateieigenschaften, in
//  "Apps & Features" und in der package.json.
//
//  Aufruf:
//    node version.js          gibt die Nummer aus (fuer Build-DIREKT.bat)
//    node version.js --setzen schreibt sie zusaetzlich in package.json
// ================================================================
'use strict';
const fs = require('fs');
const path = require('path');

const WURZEL = __dirname;

function anzahlEintraege() {
  const datei = path.join(WURZEL, 'CHANGELOG.md');
  if (!fs.existsSync(datei)) return null;
  const text = fs.readFileSync(datei, 'utf8');
  // Nur Ueberschriften der zweiten Ebene am Zeilenanfang. Eingerueckte
  // Zeilen zaehlen nicht mit - in den Codebloecken des Protokolls
  // stehen Terminalausgaben, und darin darf alles vorkommen.
  return text.split('\n').filter(z => /^## /.test(z)).length;
}

function version() {
  const n = anzahlEintraege();
  if (n === null || n < 1) return null;
  return '1.' + n + '.0';
}

const v = version();
if (!v) {
  // Kein Protokoll, keine Nummer. Lieber abbrechen als raten: Eine
  // erfundene Version waere schlimmer als gar keine.
  process.stderr.write('CHANGELOG.md nicht gefunden oder ohne Eintraege.\n');
  process.exit(1);
}

if (process.argv.includes('--setzen')) {
  const pj = path.join(WURZEL, 'package.json');
  try {
    const j = JSON.parse(fs.readFileSync(pj, 'utf8'));
    if (j.version !== v) {
      j.version = v;
      fs.writeFileSync(pj, JSON.stringify(j, null, 2) + '\n', 'utf8');
      process.stderr.write('package.json auf ' + v + ' gesetzt.\n');
    }
  } catch (e) {
    process.stderr.write('package.json nicht angepasst: ' + e.message + '\n');
  }
}

process.stdout.write(v);
