// ================================================================
// update_pruefen.js - "Warum bekomme ich keine Updates?"
//
// Dieses Skript gehoert in den Trainer-Ordner des GASTES - also zu dem,
// der den Trainer vom Gastgeber uebernommen hat und sich fragt, warum er
// aeltere Fragen sieht als die anderen.
//
// ES WIRD NICHTS VERAENDERT. Das Skript liest, fragt einmal beim
// Gastgeber nach und schreibt einen Bericht.
//
// WARUM ES DAS BRAUCHT:
// Der Trainer merkt sich beim Herunterladen die Adresse des Gastgebers in
// herkunft.json und fragt dort bei jedem Start nach Neuerungen. Ist der
// Gastgeber nicht erreichbar, passiert absichtlich nichts - der Start soll
// nicht daran haengen. Der Nebeneffekt: es passiert dann auch nichts
// Sichtbares, und man haelt seinen Stand fuer aktuell.
//
// Aufruf:  Doppelklick auf  Update-Pruefen.bat
// ================================================================
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const https = require('https');

const WURZEL = __dirname;

// Dieselbe Rechnung wie im Server: SHA-256 ueber den Inhalt, die ersten
// 16 Zeichen. Der Zeitstempel taugt nicht - er aendert sich beim Kopieren,
// der Inhalt nicht.
function fingerabdruck(datei) {
  try {
    const d = fs.readFileSync(path.join(WURZEL, datei));
    return { groesse: d.length, hash: crypto.createHash('sha256').update(d).digest('hex').slice(0, 16) };
  } catch (e) { return null; }
}

function holen(url, ms) {
  return new Promise((ja, nein) => {
    const mod = url.startsWith('https:') ? https : http;
    const req = mod.get(url, { timeout: ms || 15000, headers: { 'User-Agent': 'AfuTrainer-Update-Pruefung' } }, r => {
      if (r.statusCode !== 200) { r.resume(); return nein(new Error('Antwort HTTP ' + r.statusCode)); }
      let t = '';
      r.setEncoding('utf8');
      r.on('data', d => { t += d; if (t.length > 4 * 1024 * 1024) { req.destroy(); nein(new Error('Antwort zu gross')); } });
      r.on('end', () => ja(t));
    });
    req.on('timeout', () => { req.destroy(); nein(new Error('Zeitueberschreitung - keine Antwort')); });
    req.on('error', e => nein(e));
  });
}

function raten(fehler) {
  const m = String(fehler.message || fehler);
  if (/ENOTFOUND|EAI_AGAIN/i.test(m))
    return 'Diese Adresse gibt es nicht mehr. Bei einem Tunnel ist das der Normalfall:\n'
         + '      die Adresse wird bei jedem Start des Tunnels neu ausgewuerfelt.';
  if (/ECONNREFUSED/i.test(m))
    return 'Die Adresse gibt es, aber dort nimmt niemand ab. Laeuft der Trainer\n'
         + '      des Gastgebers gerade?';
  if (/Zeitueberschreitung/i.test(m))
    return 'Keine Antwort. Entweder laeuft der Trainer des Gastgebers nicht,\n'
         + '      oder etwas dazwischen blockiert (Firewall, Netz).';
  if (/HTTP 5\d\d/.test(m)) return 'Der Gastgeber antwortet mit einem Fehler.';
  if (/HTTP 4\d\d/.test(m))
    return 'Der Gastgeber antwortet, kennt den Abgleich aber nicht. Sein Trainer\n'
         + '      ist vermutlich aelter als diese Funktion.';
  return m;
}

async function main() {
  console.log('');
  console.log('  ============================================================');
  console.log('   Warum kommt kein Update an?');
  console.log('  ============================================================');
  console.log('');

  // ---- 1. Kann dieser Trainer ueberhaupt abgleichen? ----
  let serverText = '';
  try { serverText = fs.readFileSync(path.join(WURZEL, 'Server.js'), 'utf8'); }
  catch (e) {
    console.log('  [1] Server.js nicht gefunden.');
    console.log('      Liegt dieses Skript wirklich im Trainer-Ordner?');
    return;
  }
  const kannAbgleich = serverText.includes('/api/abgleich/stand');
  console.log('  [1] Abgleich in diesem Trainer: ' + (kannAbgleich ? 'vorhanden' : 'FEHLT'));
  if (!kannAbgleich) {
    console.log('');
    console.log('      Dieser Trainer ist aelter als die Abgleich-Funktion. Er kann');
    console.log('      gar nicht nachfragen - deshalb kommt nichts an.');
    console.log('      Loesung: den Trainer beim Gastgeber neu herunterladen.');
    console.log('      Der Lernstand im Ordner data/ bleibt dabei erhalten.');
    console.log('');
    return;
  }

  // ---- 2. Welche Adresse ist hinterlegt? ----
  let quelle = null, geladenAm = null;
  try {
    const j = JSON.parse(fs.readFileSync(path.join(WURZEL, 'herkunft.json'), 'utf8'));
    quelle = j.quelle || null;
    geladenAm = j.geladenAm || j.zuletztGeaendert || null;
  } catch (e) { /* gibt es nicht */ }

  if (!quelle) {
    console.log('  [2] Hinterlegte Adresse: KEINE');
    console.log('');
    console.log('      Ohne Adresse weiss dieser Trainer nicht, wen er fragen soll.');
    console.log('      Das passiert, wenn der Ordner von Hand weitergegeben wurde');
    console.log('      (USB-Stick, ZIP per Mail) statt ueber den Herunterladen-Knopf.');
    console.log('');
    console.log('      Loesung: Trainer starten, oben rechts auf "Info", dort auf');
    console.log('      "Abgleich", die aktuelle Adresse des Gastgebers eintragen');
    console.log('      und auf "Nachsehen" klicken. Sie wird dann gemerkt.');
    console.log('');
    return;
  }
  console.log('  [2] Hinterlegte Adresse: ' + quelle);
  if (geladenAm) console.log('      eingetragen am     : ' + geladenAm.replace('T', ' ').slice(0, 16));
  if (/trycloudflare\.com/i.test(quelle)) {
    console.log('      Hinweis: eine Tunnel-Adresse. Die wird bei JEDEM Start des');
    console.log('      Tunnels neu ausgewuerfelt - eine alte ist immer tot.');
  }

  // ---- 3. Antwortet der Gastgeber? ----
  console.log('');
  console.log('  [3] Frage dort nach ...');
  let fremd;
  try {
    fremd = JSON.parse(await holen(quelle + '/api/abgleich/stand', 15000));
  } catch (e) {
    console.log('      NICHT ERREICHBAR.');
    console.log('');
    console.log('   -> ' + raten(e));
    console.log('');
    console.log('      Loesung: beim Gastgeber nach seiner AKTUELLEN Adresse fragen.');
    console.log('      Sie steht bei ihm im Gruppenraum unter "Einladungs-Link".');
    console.log('      Dann im Trainer: Info > Abgleich > Adresse eintragen >');
    console.log('      "Nachsehen". Sie wird gemerkt, der naechste Start holt allein.');
    console.log('');
    return;
  }
  console.log('      Er antwortet.');

  // ---- 4. Was unterscheidet sich? ----
  const seine = fremd.dateien || {};
  const anders = [], fehlt = [], programm = [];
  for (const name of Object.keys(seine)) {
    const b = seine[name];
    if (!b) continue;
    const a = fingerabdruck(name);
    if (a && a.hash === b.hash) continue;
    if (b.art === 'programm') { programm.push(name); continue; }
    (a ? anders : fehlt).push(name);
  }

  console.log('');
  console.log('  [4] Vergleich:');
  if (!anders.length && !fehlt.length && !programm.length) {
    console.log('      Alles auf demselben Stand. Es gibt schlicht nichts zu holen.');
    console.log('');
    console.log('      Wenn die Fragen trotzdem anders aussehen als beim Gastgeber:');
    console.log('      im Browser einmal Strg+F5 druecken. Dann laedt er die Seite');
    console.log('      neu, statt sie aus seinem Zwischenspeicher zu nehmen.');
    console.log('');
    return;
  }
  fehlt.forEach(n => console.log('      fehlt hier ganz : ' + n));
  anders.forEach(n => console.log('      aelter hier     : ' + n));
  programm.forEach(n => console.log('      weicht ab       : ' + n + '   (Programmdatei)'));
  console.log('');
  console.log('   -> Es gibt etwas zu holen. Der Gastgeber ist erreichbar, die');
  console.log('      Adresse stimmt. Der naechste Start des Trainers holt die');
  console.log('      Datendateien von allein.');
  console.log('');
  console.log('      Also: Trainer schliessen, START.bat neu starten und die');
  console.log('      Zeilen im schwarzen Fenster lesen - dort steht, was');
  console.log('      uebernommen wurde.');
  if (programm.length) {
    console.log('');
    console.log('      Die Programmdateien werden bewusst NICHT von allein ersetzt.');
    console.log('      Sie laufen mit vollen Rechten auf diesem Rechner. Wer sie');
    console.log('      uebernehmen will: Info > Abgleich, dort einzeln bestaetigen.');
  }
  console.log('');
}

main().catch(e => { console.log(''); console.log('  Unerwarteter Fehler: ' + e.message); console.log(''); });
