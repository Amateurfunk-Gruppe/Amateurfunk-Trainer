// ================================================================
//  sprachprobe.js - Hoert der Lernende, was im Katalog steht?
// ----------------------------------------------------------------
//  Jeder Text des Fragenkatalogs und der Erklaerungen laeuft durch
//  tts-expand.js - genau so, wie der Server ihn fuer Piper aufbereitet.
//  Danach wird nachgesehen, ob etwas uebrig ist, das Piper nicht
//  spricht oder falsch spricht: Wurzel, Malpunkt, Bruchstrich in einer
//  Formel, Hoch- und Tiefzahlen, Unterstrich, griechische Buchstaben,
//  HTML-Marken, Einheiten ohne Wort, Zahlengruppen mit schmalem
//  Leerzeichen.
//
//  ANLASS (16.09.2026): Bei der Nachpruefung des ganzen Katalogs stellte
//  sich heraus, dass Piper "U = √(P/R)" als "U gleich" sprach und
//  "R = U/I" genau wie "R = I/U". Die Ohmschen Gesetze der Klasse N und
//  die Leistungsformeln der Klasse E waren mit dem Ohr nicht zu
//  unterscheiden - seit Monaten, und niemand hatte es gehoert, weil
//  niemand alle 37 000 Texte anhoeren kann. Lesen kann man sie aber.
//  Deshalb laeuft diese Probe bei jedem Bau (Build-DIREKT.bat) und
//  jederzeit von Hand:
//
//      node sprachprobe.js            Bericht auf dem Bildschirm
//      node sprachprobe.js --bau      knapp, fuer Build-DIREKT.bat
//      node sprachprobe.js --alle     jede Fundstelle, nicht nur Beispiele
//
//  Der volle Bericht mit allen Fundstellen steht danach in
//  _Sprachprobe.txt (UTF-8, mit Unterstrich - bleibt lokal, siehe
//  .gitignore). Auf dem Bildschirm stehen nur Zaehler und Kennungen,
//  weil das Windows-Fenster die Sonderzeichen nicht darstellt.
//
//  Ergebnis:  0 = nichts gefunden,  1 = Fundstellen,  2 = Dateien fehlen.
//
//  Die Probe kann nicht hoeren. Sie findet, was NACH der Aufbereitung
//  noch als Zeichen dasteht, das Piper nachweislich verschluckt. Ob
//  Piper ein Wort schoen betont, sagt sie nicht - dafuer gibt es die
//  Ohren.
// ================================================================
'use strict';

const fs   = require('fs');
const path = require('path');

const ORDNER = __dirname;
const BAU    = process.argv.includes('--bau');
const ALLE   = process.argv.includes('--alle');
const BERICHT_DATEI = path.join(ORDNER, '_Sprachprobe.txt');

// ---- tts-expand.js laden, ohne dass es das Fenster vollschreibt ----
// expandTTS protokolliert jeden Aufruf ("[PRE V15] ..."). Bei 37 000
// Texten waere das der Bericht, den niemand liest. Waehrend der Probe
// ist console.log deshalb stumm.
let expandTTS;
try {
  expandTTS = require('./tts-expand').expandTTS;
} catch (e) {
  console.log('  [SPRACHPROBE] tts-expand.js laesst sich nicht laden: ' + e.message);
  process.exit(2);
}
if (typeof expandTTS !== 'function') {
  console.log('  [SPRACHPROBE] tts-expand.js hat kein expandTTS - das ist die falsche Datei.');
  process.exit(2);
}

// ---- Die Texte einsammeln ----
const FRAGENDATEIEN = [
  'fragen.json', 'Fragen-E.json', 'Fragen-A.json',
  'Fragen-N-Auf-E.json', 'Fragen-E-Auf-A.json', 'Fragen-N-Auf-A.json',
];

function lies(name) {
  const p = path.join(ORDNER, name);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const texte = [];   // { datei, id, feld, text }
const fehlt = [];

for (const name of FRAGENDATEIEN) {
  const j = lies(name);
  if (!j) { fehlt.push(name); continue; }
  const liste = Array.isArray(j) ? j : (j.fragen || j.questions || []);
  for (const q of liste) {
    if (!q || !q.id) continue;
    texte.push({ datei: name, id: q.id, feld: 'Frage', text: String(q.text || '') });
    (q.options || []).forEach((o, i) => {
      const t = (o && typeof o === 'object') ? o.text : o;
      if (t) texte.push({ datei: name, id: q.id, feld: 'Antwort ' + 'ABCD'[i], text: String(t) });
    });
  }
}

// Erklaerungen: jede Zeichenkette, egal wie tief sie steckt (Prinzip,
// Kniff, Rechenweg, "warum falsch", Begriffsblaetter mit ihren Listen).
function sammle(wert, datei, id, pfad) {
  if (typeof wert === 'string') {
    if (wert.trim()) texte.push({ datei, id, feld: pfad, text: wert });
  } else if (Array.isArray(wert)) {
    wert.forEach((w, i) => sammle(w, datei, id, pfad + '[' + i + ']'));
  } else if (wert && typeof wert === 'object') {
    for (const k of Object.keys(wert)) sammle(wert[k], datei, id, pfad ? pfad + '.' + k : k);
  }
}
const erkl = lies('erklaerungen.json');
if (!erkl) fehlt.push('erklaerungen.json');
else {
  for (const [id, x] of Object.entries(erkl.fragen || {}))  sammle(x, 'erklaerungen.json', id, '');
  for (const [id, x] of Object.entries(erkl.gruppen || {})) sammle(x, 'erklaerungen.json', 'Blatt ' + id, '');
}

if (fehlt.length) {
  console.log('  [SPRACHPROBE] Diese Dateien fehlen: ' + fehlt.join(', '));
  process.exit(2);
}

// ---- Wonach gesucht wird ----
// Jede Regel: ein Muster auf dem AUFBEREITETEN Text und ein Satz, der
// sagt, was Piper daraus macht. Die Saetze sind nachgemessen (espeak-ng,
// deutsch - der Lautbildner, den Piper benutzt), nicht vermutet.
const REGELN = [
  { name: 'HTML-Marke oder -Zeichen',
    re: /<\/?[a-zA-Z][^<>]{0,40}>|&[a-z]+;|&#\d+;/,
    was: 'Piper liest "u nicht u" bei <u>nicht</u> und "und bdquo" bei &bdquo;' },
  { name: 'Unterstrich, Dach, geschweifte Klammer',
    re: /[_^{}]/,
    was: 'Index oder Exponent in Textschreibweise - Piper laesst das Zeichen weg' },
  { name: 'Wurzel',
    re: /√/,
    was: 'stumm - "U = √(P/R)" war "U gleich"' },
  { name: 'Malpunkt',
    re: /[⋅·∙×]/,
    was: 'stumm - "P = U ⋅ I" wird "P gleich U I"' },
  { name: 'Hoch- oder Tiefzahl',
    re: /[⁰¹²³⁴-⁹⁻₀-₉]/,
    was: '"10⁻⁶" wird "zehn", "2²" wird "zwei zwei"' },
  { name: 'Griechischer Buchstabe',
    re: /[Ͱ-Ͽ]/,
    was: 'Piper schaltet auf Griechisch um ("η" wird "ita") oder schweigt' },
  { name: 'Mikro ohne Einheit',
    re: /µ/,
    was: '"µ" wird englisch "micro"' },
  { name: 'Parallel-, Viel-kleiner-, Viel-groesser-Zeichen',
    re: /[∥≪≫]/,
    was: 'stumm' },
  { name: 'Vergleichszeichen < oder >',
    re: /(^|[\s(])[<>]=?\s*[\d(A-Za-z]/,
    was: 'stumm - "d > Lambda" wird "d Lambda"' },
  { name: 'U oder I mit Dach',
    re: /[ÛÎ]/,
    was: '"Û" wird "U Zirkumflex" - Funker sagen "U Dach"' },
  { name: 'Schmales Leerzeichen in einer Zahl',
    re: /\d[   ]\d/,
    was: '"14 081,20" wird "vierzehn null einundachtzig komma zwanzig"' },
  { name: 'Bruchstrich in einer Formel',
    re: /(^|[^A-Za-z0-9ÄÖÜäöüß\-])[A-Za-z]\s*\/\s*[A-Za-z(√](?![A-Za-z0-9ÄÖÜäöüß\-])|\)\s*\/|\/\s*\(/,
    was: 'stumm - "R = U/I" klingt wie "R = I/U"' },
  { name: 'Einheit hinter einer Zahl nicht ausgeschrieben',
    re: /(?<![A-Za-z])\d+(?:[.,]\d+)?\s?(GHz|MHz|kHz|Hz|kV|mV|µV|kA|mA|µA|MW|kW|mW|µW|kΩ|MΩ|Ω|µH|mH|nH|µF|nF|pF|dBm|dBi|dBd|dB|µs|ms|Ah|mAh|Wh|kWh|Mbit|kbit|W|V|A)(?![A-Za-zÄÖÜäöüß])/,
    was: 'Piper buchstabiert "kHz" oder "W" statt Kilohertz und Watt' },
];

// ---- Probe laufen lassen ----
const logAlt = console.log;
console.log = () => {};
const funde = REGELN.map(() => []);
let geprueft = 0;
try {
  for (const t of texte) {
    geprueft++;
    let aus;
    try { aus = expandTTS(t.text); } catch (e) { aus = '[FEHLER in expandTTS: ' + e.message + ']'; }
    REGELN.forEach((r, i) => {
      const m = aus.match(r.re);
      if (!m) return;
      const p = m.index;
      const stelle = aus.slice(Math.max(0, p - 30), Math.min(aus.length, p + m[0].length + 30)).replace(/\s+/g, ' ');
      funde[i].push({ ...t, stelle });
    });
  }
} finally {
  console.log = logAlt;
}

// ---- Bericht ----
const summe = funde.reduce((n, f) => n + f.length, 0);
const zeilen = [];
zeilen.push('Sprachprobe Amateurfunk-Trainer - ' + new Date().toISOString().slice(0, 16).replace('T', ' '));
zeilen.push('Geprueft: ' + geprueft + ' Texte (' + FRAGENDATEIEN.length + ' Fragendateien und erklaerungen.json)');
zeilen.push('Fundstellen: ' + summe);
zeilen.push('');
REGELN.forEach((r, i) => {
  if (!funde[i].length) return;
  zeilen.push('== ' + r.name + ' - ' + funde[i].length + ' Stellen');
  zeilen.push('   Was Piper daraus macht: ' + r.was);
  for (const f of funde[i]) {
    zeilen.push('   ' + f.datei + ' | ' + f.id + ' | ' + f.feld + ' | ...' + f.stelle + '...');
  }
  zeilen.push('');
});
if (!summe) zeilen.push('Nichts gefunden. Was im Katalog steht, kommt bei Piper an.');
zeilen.push('');
zeilen.push('Die Probe kann nicht hoeren: Sie findet Zeichen, die Piper nachweislich verschluckt,');
zeilen.push('nicht schiefe Betonungen. Behoben wird eine Fundstelle in tts-expand.js - oder,');
zeilen.push('wenn der Text selbst schief ist, im Katalog.');

// Immer in die Datei - mit Byte-Order-Mark, damit der Windows-Editor die
// Sonderzeichen richtig zeigt.
try {
  fs.writeFileSync(BERICHT_DATEI, '﻿' + zeilen.join('\r\n') + '\r\n', 'utf8');
} catch (e) { /* nur ein Bericht - der Bau haengt nicht daran */ }

// Auf dem Bildschirm nur, was das Windows-Fenster darstellen kann.
function bildschirm() {
  console.log('');
  console.log('  Sprachprobe: ' + geprueft + ' Texte durch tts-expand.js geschickt.');
  if (!summe) {
    console.log('  Nichts gefunden - was im Katalog steht, kommt bei Piper an.');
    console.log('');
    return;
  }
  console.log('  ' + summe + ' Stellen, die Piper nicht oder falsch spricht:');
  console.log('');
  REGELN.forEach((r, i) => {
    if (!funde[i].length) return;
    const ids = [];
    for (const f of funde[i]) if (!ids.includes(f.id)) ids.push(f.id);
    const zeig = (ALLE || !BAU) ? ids : ids.slice(0, 8);
    console.log('    ' + String(funde[i].length).padStart(5) + '  ' + r.name);
    console.log('           ' + zeig.join(', ') + (zeig.length < ids.length ? ' ... (' + ids.length + ' Fragen)' : ''));
  });
  console.log('');
  console.log('  Jede Fundstelle mit Textausschnitt steht in _Sprachprobe.txt.');
  console.log('');
}
bildschirm();

process.exit(summe ? 1 : 0);
