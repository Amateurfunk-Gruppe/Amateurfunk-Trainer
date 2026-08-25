// ================================================================
// stimmen_packen.js - macht aus dem Ordner "piper" eine einzelne
// Datei: Piper-Stimmen.zip
//
// WOZU:
// Die Stimmen gehoeren NICHT ins Repository. de_DE-thorsten-high.onnx
// allein ist 108,6 MiB gross - GitHub lehnt jede Datei ueber 100 MiB
// beim Hochladen ab, und zwar erst nach dem Upload. Als Anhang eines
// Releases sind dagegen 2 GiB je Datei erlaubt.
//
// Ein Release-Anhang laesst sich nur einzeln hochladen. Ein Dutzend
// Dateien einzeln ins Formular zu ziehen ist Fleissarbeit; ein ZIP ist
// ein Griff. Genau dafuer ist dieses Skript da.
//
// WICHTIG - das ZIP loest die 100-MiB-Grenze NICHT:
// Es hilft ausschliesslich als Release-Anhang. Ins Repository darf es
// genauso wenig wie die einzelnen Stimmen, denn die Grenze gilt fuer
// jede Datei, ganz gleich was drinsteckt.
//
// Aufruf:  Doppelklick auf  Stimmen_packen.bat
// ================================================================
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const WURZEL = __dirname;
const QUELLE = path.join(WURZEL, 'piper');
const ZIEL = path.join(WURZEL, 'Piper-Stimmen.zip');

const mb = b => (b / 1024 / 1024).toFixed(1).replace('.', ',') + ' MiB';

function crc32(buf) {
  let c, crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = (crc ^ buf[i]) & 0xFF;
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xEDB88320 : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Was nicht mitfahren muss. Der Ordner _stimmentest und die .log-Dateien
// sind Rueckstaende deiner eigenen Stimmentests - fuer dich aufschlussreich,
// fuer jemanden, der nur die Stimmen nachladen will, nur Rauschen. Die
// beiden .bat bleiben drin: piper_reparatur.bat hilft, wenn beim Empfaenger
// etwas klemmt.
const AUSLASSEN = [
  /^_stimmentest\//i,
  /\.log$/i,
];

// Alles einsammeln, Unterordner mitgenommen (espeak-ng-data hat welche).
function sammeln(ordner, praefix) {
  const raus = [];
  for (const e of fs.readdirSync(ordner, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const voll = path.join(ordner, e.name);
    const rel = praefix ? praefix + '/' + e.name : e.name;
    if (AUSLASSEN.some(m => m.test(rel))) continue;
    if (e.isDirectory()) raus.push(...sammeln(voll, rel));
    else if (e.isFile()) raus.push({ voll, rel, groesse: fs.statSync(voll).size });
  }
  return raus;
}

function main() {
  if (!fs.existsSync(QUELLE)) {
    console.log('Der Ordner "piper" fehlt. Nichts zu packen.');
    console.log('Gesucht wurde: ' + QUELLE);
    process.exitCode = 1;
    return;
  }

  const dateien = sammeln(QUELLE, '');
  if (!dateien.length) { console.log('Der Ordner "piper" ist leer.'); process.exitCode = 1; return; }

  const roh = dateien.reduce((s, d) => s + d.groesse, 0);
  console.log('');
  console.log('  ' + dateien.length + ' Dateien, ' + mb(roh) + ' unverpackt.');
  console.log('');

  // Erst unter Zwischennamen schreiben. Bricht der Lauf ab, liegt kein
  // halbes ZIP im Ordner, das beim Hochladen fuer fertig gehalten wird.
  const tmp = ZIEL + '.teil';
  if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  const aus = fs.openSync(tmp, 'w');

  const dosZeit = (12 << 11);                           // 12:00:00 Uhr
  const dosDatum = ((2026 - 1980) << 9) | (1 << 5) | 1; // 01.01.2026
  const zentrale = [];
  let offset = 0;

  try {
    for (let i = 0; i < dateien.length; i++) {
      const d = dateien[i];
      const data = fs.readFileSync(d.voll);
      // Stufe 1 statt 9. Ein .onnx besteht aus Kommazahlen, die sich kaum
      // zusammendruecken lassen - Stufe 9 rechnet dafuer minutenlang und
      // spart wenige Prozent. Die DLLs und JSON-Dateien profitieren auch
      // auf Stufe 1.
      const comp = zlib.deflateRawSync(data, { level: 1 });
      const crc = crc32(data);
      const nameBuf = Buffer.from('piper/' + d.rel, 'utf8');

      const lh = Buffer.alloc(30);
      lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6);
      lh.writeUInt16LE(8, 8); lh.writeUInt16LE(dosZeit, 10); lh.writeUInt16LE(dosDatum, 12);
      lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(data.length, 22);
      lh.writeUInt16LE(nameBuf.length, 26); lh.writeUInt16LE(0, 28);
      fs.writeSync(aus, lh); fs.writeSync(aus, nameBuf); fs.writeSync(aus, comp);

      const ch = Buffer.alloc(46);
      ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6);
      ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(8, 10);
      ch.writeUInt16LE(dosZeit, 12); ch.writeUInt16LE(dosDatum, 14);
      ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(comp.length, 20); ch.writeUInt32LE(data.length, 24);
      ch.writeUInt16LE(nameBuf.length, 28); ch.writeUInt16LE(0, 30); ch.writeUInt16LE(0, 32);
      ch.writeUInt16LE(0, 34); ch.writeUInt16LE(0, 36); ch.writeUInt32LE(0, 38);
      ch.writeUInt32LE(offset, 42);
      zentrale.push(ch, nameBuf);
      offset += lh.length + nameBuf.length + comp.length;

      if (d.groesse > 2 * 1024 * 1024) {
        console.log('  ' + mb(d.groesse).padStart(9) + '  ' + d.rel);
      }
    }

    const zBuf = Buffer.concat(zentrale);
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(0, 4); eocd.writeUInt16LE(0, 6);
    eocd.writeUInt16LE(dateien.length, 8); eocd.writeUInt16LE(dateien.length, 10);
    eocd.writeUInt32LE(zBuf.length, 12); eocd.writeUInt32LE(offset, 16); eocd.writeUInt16LE(0, 20);
    fs.writeSync(aus, zBuf); fs.writeSync(aus, eocd);
    fs.closeSync(aus);
  } catch (e) {
    try { fs.closeSync(aus); } catch (x) {}
    try { fs.unlinkSync(tmp); } catch (x) {}
    console.log('');
    console.log('Fehlgeschlagen: ' + e.message);
    process.exitCode = 1;
    return;
  }

  if (fs.existsSync(ZIEL)) fs.unlinkSync(ZIEL);
  fs.renameSync(tmp, ZIEL);
  const fertig = fs.statSync(ZIEL).size;

  console.log('');
  console.log('  Piper-Stimmen.zip: ' + mb(fertig)
    + '  (aus ' + mb(roh) + ', also ' + Math.round(100 - fertig / roh * 100) + ' % gespart)');
  console.log('');
  if (fertig > 2 * 1024 * 1024 * 1024) {
    console.log('  !! Ueber 2 GiB - auch als Release-Anhang zu gross.');
  } else {
    console.log('  Diese eine Datei in das Release-Formular ziehen.');
    console.log('  Grenze fuer Anhaenge: 2 GiB je Datei - reichlich Luft.');
  }
  console.log('');
  console.log('  NICHT ins Repository legen. Dort gilt 100 MiB je Datei,');
  console.log('  ein ZIP aendert daran nichts.');
  console.log('');
}

main();
