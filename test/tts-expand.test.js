// ================================================================
// Tests fuer tts-expand.js  ->  starten mit:  npm test
//
// FIX Q10: Vorher gab es keinen einzigen Test. expandTTS ist aber die
// Funktion mit dem groessten Regressionsrisiko im Projekt - ueber 30
// verkettete Regex-Ersetzungen, bei denen jede Aenderung eine andere
// Regel kippen kann. Genau so ist der '/m'-Fehler entstanden.
// ================================================================
'use strict';
const test = require('node:test');
const assert = require('node:assert');

// expandTTS loggt pro Aufruf eine Zeile - im Test stoert das nur.
const echtesLog = console.log;
const { expandTTS } = require('../tts-expand.js');
const leise = (t) => { console.log = () => {}; try { return expandTTS(t); } finally { console.log = echtesLog; } };

test('Frequenzen werden ausgeschrieben', () => {
  assert.match(leise('Die Frequenz 145 MHz'), /145 Megahertz/);
  assert.match(leise('Bei 7,1 MHz senden'), /7,1 Megahertz/);
  assert.match(leise('Ein Signal mit 50 kHz'), /50 Kilohertz/);
  assert.match(leise('Der Bereich um 2400 MHz'), /2400 Megahertz/);
});

test('Elektrische Einheiten werden ausgeschrieben', () => {
  assert.match(leise('Eine Spannung von 12 V'), /12 Volt/);
  assert.match(leise('Ein Strom von 2 A'), /2 Ampere/);
  assert.match(leise('Eine Leistung von 750 W'), /750 Watt/);
  assert.match(leise('Ein Widerstand von 50 Ω'), /50 Ohm/);
  assert.match(leise('Ein Widerstand von 4,7 kΩ'), /4,7 Kilo Ohm/);
  assert.match(leise('Eine Daempfung von 3 dB'), /3 Dezibel/);
});

test('Baender werden korrekt gelesen', () => {
  assert.match(leise('Das 2 m Band'), /2 Meter Band/);
  assert.match(leise('Das 70 cm Band'), /70 Zentimeter Band/);
  assert.match(leise('Im 80-m-Band'), /80 Meter Band/);
});

test('Funk-Abkuerzungen werden aufgeloest', () => {
  assert.match(leise('Ein QSO fuehren'), /Funkverbindung/);
  assert.match(leise('Das QTH angeben'), /Standort/);
  assert.match(leise('Sendeart SSB nutzen'), /Einseitenband/);
  assert.match(leise('Nach BEMFV ist zu pruefen'), /Begrenzung von elektromagnetischen Feldern/);
});

test('Bedeutungsfragen buchstabieren die Abkuerzung, statt sie aufzuloesen', () => {
  // Sonst waere die Frage sinnlos: "Was bedeutet die Abkuerzung Funkverbindung?"
  const r = leise('Was bedeutet die Abkürzung "QRM"?');
  assert.match(r, /Q R M/);
  assert.doesNotMatch(r, /Störungen/);
});

test('Rufzeichenzusatz /m wird als "Strich m" gelesen, nicht als Einheit (Q6)', () => {
  const r = leise('Ein Rufzeichen mit dem Zusatz „/m“ kann bedeuten, dass sie mobil ist.');
  assert.match(r, /Strich m/);
  assert.doesNotMatch(r, /Trainee/,  'alter Fehler: "/m" wurde zu "Strich Trainee"');
  assert.doesNotMatch(r, /pro Meter/, 'Einheit waere hier inhaltlich falsch');
});

test('Rufzeichenzusatz /mm bleibt vollstaendig erhalten (Q6)', () => {
  const r = leise('Was ist aus dem Rufzeichen DC4LW/mm zu erkennen?');
  assert.match(r, /DC4LW Strich m m/);
  assert.doesNotMatch(r, /Traineem/, 'alter Fehler: /m schlug mitten in /mm zu');
});

test('Reine Abkuerzungen in Klammern werden entfernt', () => {
  const r = leise('In den Radio Regulations (RR) der ITU');
  assert.doesNotMatch(r, /\(RR\)/);
});

test('Leerer und ungueltiger Eingabewert stuerzt nicht ab', () => {
  assert.strictEqual(leise(''), '');
  assert.strictEqual(leise(null), null);
  assert.strictEqual(leise(undefined), undefined);
  assert.doesNotThrow(() => leise('()[]{}*+?^$|\\'));
});

test('Keine doppelten Leerzeichen im Ergebnis', () => {
  const r = leise('Die Frequenz  145   MHz   (VHF)  im  2 m  Band');
  assert.doesNotMatch(r, /  /);
});

test('Ergebnis ist bei gleicher Eingabe stabil (idempotenter Aufruf)', () => {
  const eingabe = 'Eine Leistung von 750 W bei 145 MHz im 2 m Band';
  assert.strictEqual(leise(eingabe), leise(eingabe));
});
