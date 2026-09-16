// ================================================================
//  bz2tar.js - .tar.bz2 lesen, ohne fremde Hilfe
// ----------------------------------------------------------------
//  Wozu: Das Laufwerk fuer die Kokoro-Stimmen (sherpa-onnx) und die
//  Lautdaten (espeak-ng-data) liegen bei GitHub ausschliesslich als
//  .tar.bz2. Node kann gzip und deflate, aber kein bzip2. Das tar von
//  Windows 10 kann es je nach Ausgabe auch nicht ("Unrecognized archive
//  format"), und ein npm-Paket dafuer hiesse: npm install beim
//  Empfaenger. Deshalb steht der Entpacker hier selbst - rund 200
//  Zeilen, nach der Beschreibung des Formats geschrieben und gegen
//  bzcat Byte fuer Byte nachgemessen (16.09.2026, beide Archive).
//
//  Was er kann: bzip2-Stroeme (auch mehrere hintereinander) entpacken
//  und aus dem tar darin einzelne Dateien herausholen. Was er nicht
//  kann: packen. Das braucht hier niemand.
//
//    const { tarBz2Eintraege } = require('./bz2tar');
//    for (const e of tarBz2Eintraege(buffer)) { e.name, e.groesse, e.daten() }
// ================================================================
'use strict';

// ---------------------------------------------------------------
//  bzip2
// ---------------------------------------------------------------
function bz2Entpacken(buf) {
  let pos = 0;          // Bitposition
  const bit = (n) => {
    let v = 0;
    for (let i = 0; i < n; i++) {
      const b = (buf[pos >>> 3] >>> (7 - (pos & 7))) & 1;
      v = (v * 2) + b;
      pos++;
    }
    return v;
  };
  const teile = [];
  let gesamt = 0;

  while ((pos >>> 3) + 4 <= buf.length) {
    // Kopf eines Stroms: "BZh" + Blockgroesse '1'..'9'
    if (buf[pos >>> 3] !== 0x42 || buf[(pos >>> 3) + 1] !== 0x5a || buf[(pos >>> 3) + 2] !== 0x68) break;
    const stufe = buf[(pos >>> 3) + 3] - 0x30;
    if (stufe < 1 || stufe > 9) throw new Error('bzip2: ungueltige Blockgroesse');
    pos += 32;
    const blockMax = stufe * 100000;
    const tt = new Uint32Array(blockMax);

    for (;;) {
      const magic1 = bit(24), magic2 = bit(24);
      if (magic1 === 0x177245 && magic2 === 0x385090) {   // Ende des Stroms
        bit(32);                                         // Gesamt-CRC
        pos = (pos + 7) & ~7;                            // auf Byte auffuellen
        break;
      }
      if (magic1 !== 0x314159 || magic2 !== 0x265359) throw new Error('bzip2: Blockkopf nicht erkannt');
      bit(32);                                           // Block-CRC (nicht geprueft)
      if (bit(1)) throw new Error('bzip2: randomisierte Bloecke werden nicht unterstuetzt');
      const origPtr = bit(24);

      // Welche Bytewerte kommen vor?
      const karte16 = bit(16);
      const symbole = [];
      for (let i = 0; i < 16; i++) {
        if (karte16 & (0x8000 >>> i)) {
          const k = bit(16);
          for (let j = 0; j < 16; j++) if (k & (0x8000 >>> j)) symbole.push(i * 16 + j);
        }
      }
      const alpha = symbole.length + 2;                  // + RUNA/RUNB, EOB
      const nGruppen = bit(3);
      if (nGruppen < 2 || nGruppen > 6) throw new Error('bzip2: Gruppenzahl');
      const nSel = bit(15);
      if (nSel < 1) throw new Error('bzip2: Selektoren');
      // Selektoren, MTF-kodiert
      const mtfG = [];
      for (let i = 0; i < nGruppen; i++) mtfG[i] = i;
      const sel = new Uint8Array(nSel);
      for (let i = 0; i < nSel; i++) {
        let j = 0;
        while (bit(1)) { j++; if (j >= nGruppen) throw new Error('bzip2: Selektor'); }
        const v = mtfG[j];
        for (let k = j; k > 0; k--) mtfG[k] = mtfG[k - 1];
        mtfG[0] = v;
        sel[i] = v;
      }
      // Codelaengen je Gruppe -> Huffman-Tabellen (kanonisch)
      const tabellen = [];
      for (let g = 0; g < nGruppen; g++) {
        const len = new Uint8Array(alpha);
        let l = bit(5);
        for (let i = 0; i < alpha; i++) {
          for (;;) {
            if (l < 1 || l > 20) throw new Error('bzip2: Codelaenge');
            if (!bit(1)) break;
            l += bit(1) ? -1 : 1;
          }
          len[i] = l;
        }
        // limit/base/perm wie im Original
        let minLen = 32, maxLen = 0;
        for (let i = 0; i < alpha; i++) { if (len[i] > maxLen) maxLen = len[i]; if (len[i] < minLen) minLen = len[i]; }
        const perm = new Int32Array(alpha);
        let pp = 0;
        for (let i = minLen; i <= maxLen; i++) for (let j = 0; j < alpha; j++) if (len[j] === i) perm[pp++] = j;
        const limit = new Int32Array(maxLen + 2), base = new Int32Array(maxLen + 2);
        const zaehl = new Int32Array(maxLen + 2);
        for (let i = 0; i < alpha; i++) zaehl[len[i]]++;
        let code = 0, idx = 0;
        for (let i = minLen; i <= maxLen; i++) {
          base[i] = idx - code;
          code += zaehl[i];
          idx += zaehl[i];
          limit[i] = code - 1;
          code <<= 1;
        }
        tabellen.push({ minLen, maxLen, perm, limit, base });
      }

      // Die Symbole lesen: Laufzaehler fuer Nullen (RUNA/RUNB), MTF, EOB
      const mtf = new Uint8Array(256);
      for (let i = 0; i < symbole.length; i++) mtf[i] = symbole[i];
      const haeufig = new Int32Array(256);
      let n = 0, lauf = 0, laufWert = 1, gruppeNr = -1, gruppeRest = 0, tab = null;
      const EOB = alpha - 1;
      for (;;) {
        if (gruppeRest === 0) {
          gruppeNr++;
          if (gruppeNr >= nSel) throw new Error('bzip2: zu wenige Selektoren');
          tab = tabellen[sel[gruppeNr]];
          gruppeRest = 50;
        }
        gruppeRest--;
        // Ein Huffman-Symbol
        let l = tab.minLen, v = bit(l);
        for (;;) {
          if (l > tab.maxLen) throw new Error('bzip2: Huffman-Code');
          if (v <= tab.limit[l]) break;
          v = v * 2 + bit(1);
          l++;
        }
        const sym = tab.perm[v + tab.base[l]];

        if (sym === 0 || sym === 1) {              // RUNA / RUNB
          lauf += laufWert << sym;
          laufWert <<= 1;
          continue;
        }
        if (lauf > 0) {
          if (n + lauf > blockMax) throw new Error('bzip2: Block zu gross');
          const b = mtf[0];
          haeufig[b] += lauf;
          while (lauf-- > 0) tt[n++] = b;
          lauf = 0; laufWert = 1;
        }
        if (sym === EOB) break;
        // MTF: Position sym-1
        const p = sym - 1;
        const b = mtf[p];
        for (let k = p; k > 0; k--) mtf[k] = mtf[k - 1];
        mtf[0] = b;
        haeufig[b]++;
        if (n >= blockMax) throw new Error('bzip2: Block zu gross');
        tt[n++] = b;
      }
      if (origPtr >= n) throw new Error('bzip2: origPtr');

      // Inverse Burrows-Wheeler-Transformation
      const summe = new Int32Array(256);
      let s = 0;
      for (let i = 0; i < 256; i++) { summe[i] = s; s += haeufig[i]; }
      for (let i = 0; i < n; i++) {
        const b = tt[i] & 0xff;
        tt[summe[b]] |= (i << 8);
        summe[b]++;
      }
      // Auslesen samt Lauflaengen (4 gleiche Bytes + Zaehler)
      const aus = Buffer.allocUnsafe(n * 2 + 1024);
      let ap = 0;
      let p = tt[origPtr] >>> 8;
      let letztes = -1, gleich = 0;
      for (let i = 0; i < n; i++) {
        const e = tt[p];
        const b = e & 0xff;
        p = e >>> 8;
        if (gleich === 4) {                        // Zaehler-Byte
          if (ap + b > aus.length) throw new Error('bzip2: Ausgabe zu gross');
          for (let k = 0; k < b; k++) aus[ap++] = letztes;
          gleich = 0; letztes = -1;
          continue;
        }
        if (ap + 1 > aus.length) throw new Error('bzip2: Ausgabe zu gross');
        aus[ap++] = b;
        if (b === letztes) gleich++; else { letztes = b; gleich = 1; }
      }
      const stueck = aus.subarray(0, ap);
      teile.push(Buffer.from(stueck));
      gesamt += ap;
    }
  }
  if (!teile.length) throw new Error('bzip2: kein Strom gefunden');
  return Buffer.concat(teile, gesamt);
}

// ---------------------------------------------------------------
//  tar (ustar / GNU): nur lesen
// ---------------------------------------------------------------
function tarEintraege(buf) {
  const aus = [];
  let p = 0;
  let langerName = null;
  while (p + 512 <= buf.length) {
    const kopf = buf.subarray(p, p + 512);
    if (kopf.every(b => b === 0)) break;                 // Ende
    const feld = (a, l) => kopf.subarray(a, a + l).toString('utf8').replace(/\0.*$/s, '');
    let name = feld(0, 100);
    const groesse = parseInt(feld(124, 12).trim() || '0', 8) || 0;
    const typ = String.fromCharCode(kopf[156] || 0x30);
    const praefix = feld(345, 155);
    if (praefix && kopf.subarray(257, 262).toString() === 'ustar') name = praefix + '/' + name;
    const datenAb = p + 512;
    const bloecke = Math.ceil(groesse / 512);
    if (typ === 'L') {                                   // GNU: langer Name folgt
      langerName = buf.subarray(datenAb, datenAb + groesse).toString('utf8').replace(/\0.*$/s, '');
    } else {
      if (langerName) { name = langerName; langerName = null; }
      if (typ === '0' || typ === '\0' || typ === '7') {
        const a = datenAb, e = datenAb + groesse;
        aus.push({ name, groesse, daten: () => buf.subarray(a, e) });
      }
    }
    p = datenAb + bloecke * 512;
  }
  return aus;
}

function tarBz2Eintraege(bz2Buffer) {
  return tarEintraege(bz2Entpacken(bz2Buffer));
}

module.exports = { bz2Entpacken, tarEintraege, tarBz2Eintraege };

// Von der Konsole: node bz2tar.js archiv.tar.bz2  -> Liste
if (require.main === module) {
  const fs = require('fs');
  const f = process.argv[2];
  if (!f) { console.log('node bz2tar.js <archiv.tar.bz2> [ausgabe.tar]'); process.exit(2); }
  const t0 = Date.now();
  const tar = bz2Entpacken(fs.readFileSync(f));
  if (process.argv[3]) fs.writeFileSync(process.argv[3], tar);
  for (const e of tarEintraege(tar)) console.log(String(e.groesse).padStart(10), e.name);
  console.log('entpackt: ' + tar.length + ' Bytes in ' + (Date.now() - t0) + ' ms');
}
