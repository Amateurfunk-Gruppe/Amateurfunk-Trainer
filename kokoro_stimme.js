// ================================================================
//  kokoro_stimme.js - eine zweite Sprachausgabe neben Piper
// ----------------------------------------------------------------
//  Dietmar am 16.09.2026: "Ich wuerde mir gerne dieses Kokoro in dem
//  Trainer anhoeren. Kannst du mir das einbauen?"
//
//  WAS KOKORO IST. Ein Sprachmodell mit 82 Millionen Parametern
//  (Apache 2.0), das die Satzmelodie deutlich natuerlicher trifft als
//  Piper. Deutsch kann es nur durch Nachtraining aus der Gemeinschaft:
//  das Projekt kokoro-deutsch (kikiri-tts) hat es mit rund 51 Stunden
//  deutscher Sprache nachtrainiert und daraus Einzelstimmen gemacht.
//  Von "Martin" gibt es einen ONNX-Export (Godelaune, Mai 2026), und
//  genau der wird hier geholt.
//
//  WIE ES LAEUFT. Nicht in Python, sondern ueber sherpa-onnx - ein
//  fertiges Programm (k2-fsa, Apache 2.0), das Kokoro-Modelle auf dem
//  Prozessor rechnet und dazu denselben Lautbildner benutzt wie Piper
//  (espeak-ng). Der Trainer startet es je Satz wie piper.exe, mit
//  demselben Zwischenspeicher und derselben Warteschlange. Alles, was
//  tts-expand.js fuer Piper aufbereitet, gilt fuer Kokoro genauso -
//  Wurzel, Bruchstrich, Einheiten. Die Sprachprobe (sprachprobe.js)
//  auch.
//
//  WAS GEHOLT WIRD - nur auf Klick, nichts von selbst, rund 360 MB:
//    1. das Laufwerk sherpa-onnx von GitHub (20 MB, Windows: eine .exe
//       und zwei .dll; Linux und Mac ebenso fertig gebaut)
//    2. die Lautdaten espeak-ng-data von GitHub (7 MB)
//    3. das deutsche Modell von Hugging Face (326 MB) und die
//       Stimmdatei (0,5 MB)
//  Derselbe Schutz wie bei piper_stimmen.js und programme_holen.js:
//  nur die zwei bekannten Rechnernamen, jede Umleitung neu geprueft,
//  Groessenobergrenze, Pruefsumme aus dem Verzeichnis (Hugging Face
//  nennt SHA-256 und Groesse jeder Datei, bevor sie geladen wird),
//  Zwischenname und erst dann Umbenennen.
//
//  DIE UMWANDLUNG. sherpa-onnx will das Modell mit ein paar Angaben im
//  Kopf (Abtastrate, Sprecherzahl, Form der Stimmdaten) und die Stimme
//  als nackte float32-Tabelle. Der Export aus Hugging Face ist fuer
//  ein Python-Paket gemacht: Modell ohne diese Angaben, Stimme als
//  .npz (ein ZIP mit .npy darin). Beides wird hier in Node umgesetzt -
//  die Angaben werden an die ONNX-Datei ANGEHAENGT (Protobuf erlaubt
//  das: ein wiederholtes Feld darf am Ende stehen), die .npz wird
//  gelesen und als voices.bin geschrieben. Das ist gegen das amtliche
//  Kokoro-Modell von sherpa-onnx nachgemessen (16.09.2026): Modell ohne
//  Kopf + diese Anhaengung = spricht.
//
//  Ordner:  kokoro/
//             laufwerk/bin/sherpa-onnx-offline-tts(.exe) + Bibliotheken
//             espeak-ng-data/
//             tokens.txt
//             martin/model.onnx, martin/voices.bin, martin/stand.json
// ================================================================
'use strict';

const fs      = require('fs');
const path    = require('path');
const https   = require('https');
const crypto  = require('crypto');
const zlib    = require('zlib');
const { tarBz2Eintraege } = require('./bz2tar');

const SHERPA_VERSION = '1.13.8';
const SHERPA_BASIS   = 'https://github.com/k2-fsa/sherpa-onnx/releases/download/';
const ESPEAK_URL     = SHERPA_BASIS + 'tts-models/espeak-ng-data.tar.bz2';
const HF_BASIS       = 'https://huggingface.co/';

// Die Stimmen. Jede ist ein eigenes Modell (das Nachtraining ist je
// Sprecher), deshalb je Stimme ein Ordner mit 326 MB.
const STIMMEN = [
  {
    id: 'martin', name: 'Martin', geschlecht: 'm',
    label: 'Martin (Kokoro) · 24 kHz',
    repo: 'Godelaune/Kokoro-82M-ONNX-German-Martin',
    modell: 'kokoro-martin.onnx', stimmdatei: 'voices-martin.npz', schluessel: 'martin',
    lizenz: 'Apache-2.0',
    herkunft: 'kikiri-tts/kikiri-german-martin, nachtrainiert aus Kokoro-82M (kokoro-deutsch)'
  }
];

const ERLAUBTE_WIRTE = [
  /(^|\.)github\.com$/i, /(^|\.)githubusercontent\.com$/i,
  /(^|\.)huggingface\.co$/i, /(^|\.)hf\.co$/i
];
const MAX_MODELL   = 400 * 1024 * 1024;   // das Modell wiegt 326 MB
const MAX_ARCHIV   =  60 * 1024 * 1024;   // Laufwerk 20 MB, Lautdaten 7 MB
const MAX_KLEIN    =   8 * 1024 * 1024;

// Die Zeichentabelle von Kokoro (114 Eintraege) - identisch mit der des
// Python-Pakets kokoro-onnx, aus dem der Export stammt, und mit der von
// sherpa-onnx. Verglichen am 16.09.2026: 0 Unterschiede.
const TOKENS = ['; 1',': 2',', 3','. 4','! 5','? 6','— 9','… 10','" 11','( 12',') 13','“ 14','” 15','  16','̃ 17','ʣ 18','ʥ 19','ʦ 20','ʨ 21','ᵝ 22','ꭧ 23','A 24','I 25','O 31','Q 33','S 35','T 36','W 39','Y 41','ᵊ 42','a 43','b 44','c 45','d 46','e 47','f 48','h 50','i 51','j 52','k 53','l 54','m 55','n 56','o 57','p 58','q 59','r 60','s 61','t 62','u 63','v 64','w 65','x 66','y 67','z 68','ɑ 69','ɐ 70','ɒ 71','æ 72','β 75','ɔ 76','ɕ 77','ç 78','ɖ 80','ð 81','ʤ 82','ə 83','ɚ 85','ɛ 86','ɜ 87','ɟ 90','ɡ 92','ɥ 99','ɨ 101','ɪ 102','ʝ 103','ɯ 110','ɰ 111','ŋ 112','ɳ 113','ɲ 114','ɴ 115','ø 116','ɸ 118','θ 119','œ 120','ɹ 123','ɾ 125','ɻ 126','ʁ 128','ɽ 129','ʂ 130','ʃ 131','ʈ 132','ʧ 133','ʊ 135','ʋ 136','ʌ 138','ɣ 139','ɤ 140','χ 142','ʎ 143','ʒ 147','ʔ 148','ˈ 156','ˌ 157','ː 158','ʰ 162','ʲ 164','↓ 169','→ 171','↗ 172','↘ 173','ᵻ 177'];

function wirtErlaubt(u){
  try{ return ERLAUBTE_WIRTE.some(m => m.test(new URL(u).hostname)); }
  catch(e){ return false; }
}

// ---------------------------------------------------------------
//  Welches Laufwerk fuer dieses System?  (Namen am 16.09.2026 bei
//  GitHub nachgesehen, Fassung 1.13.8)
// ---------------------------------------------------------------
function laufwerkArchiv(){
  const p = process.platform, a = process.arch;
  const v = 'sherpa-onnx-v' + SHERPA_VERSION;
  if(p === 'win32'  && a === 'x64')   return v + '-win-x64-shared-MD-Release.tar.bz2';
  if(p === 'linux'  && a === 'x64')   return v + '-linux-x64-shared.tar.bz2';
  if(p === 'darwin')                  return v + '-osx-universal2-shared.tar.bz2';
  return null;
}
function laufwerkName(){ return process.platform === 'win32' ? 'sherpa-onnx-offline-tts.exe' : 'sherpa-onnx-offline-tts'; }

// ---------------------------------------------------------------
//  HOLEN - jede Umleitung wird neu geprueft
// ---------------------------------------------------------------
function anfrage(url, tiefe){
  tiefe = tiefe || 0;
  return new Promise((ja, nein) => {
    if(tiefe > 6) return nein(new Error('Zu viele Umleitungen'));
    if(!wirtErlaubt(url)) return nein(new Error('Unerwartete Adresse: ' + url));
    const r = https.get(url, { timeout: 60000,
      headers: { 'User-Agent': 'Amateurfunk-Trainer-Kokoro', 'Accept': '*/*' } }, a => {
      if([301,302,303,307,308].includes(a.statusCode) && a.headers.location){
        a.resume();
        let ziel;
        try{ ziel = new URL(a.headers.location, url).toString(); }catch(e){ return nein(new Error('Ungueltige Umleitung')); }
        return anfrage(ziel, tiefe + 1).then(ja, nein);
      }
      if(a.statusCode !== 200){ a.resume(); return nein(new Error('Antwort HTTP ' + a.statusCode + ' fuer ' + url.split('?')[0])); }
      ja(a);
    });
    r.on('timeout', () => { r.destroy(); nein(new Error('Zeitueberschreitung - keine Antwort')); });
    r.on('error', e => nein(new Error(/ENOTFOUND|EAI_AGAIN/i.test(e.message) ? 'Keine Verbindung (kein Netz?)' : e.message)));
  });
}

async function holenKlein(url, max){
  const a = await anfrage(url);
  const teile = []; let n = 0;
  await new Promise((ja, nein) => {
    a.on('data', d => { n += d.length; if(n > (max || MAX_KLEIN)){ a.destroy(); return nein(new Error('Antwort zu gross')); } teile.push(d); });
    a.on('end', ja); a.on('error', nein);
  });
  return Buffer.concat(teile);
}

// In eine Datei - unter Zwischennamen, mit Groessengrenze, auf Wunsch
// mit SHA-256-Pruefung. takt(geladen) meldet den Fortschritt.
async function holenDatei(url, ziel, opt){
  opt = opt || {};
  const a = await anfrage(url);
  const laenge = parseInt(a.headers['content-length'] || '0', 10) || 0;
  if(laenge > opt.max){ a.destroy(); throw new Error('Datei groesser als erlaubt (' + laenge + ' Bytes)'); }
  if(opt.groesse && laenge && laenge !== opt.groesse){ a.destroy(); throw new Error('Groesse stimmt nicht mit dem Verzeichnis ueberein'); }
  const roh = ziel + '.teil';
  const hash = opt.sha256 ? crypto.createHash('sha256') : null;
  let n = 0;
  await new Promise((ja, nein) => {
    const s = fs.createWriteStream(roh);
    a.on('data', d => {
      n += d.length;
      if(n > opt.max){ a.destroy(); s.destroy(); try{ fs.unlinkSync(roh); }catch(e){} return nein(new Error('Datei groesser als erlaubt')); }
      if(hash) hash.update(d);
      if(opt.takt) opt.takt(n, laenge);
    });
    a.on('error', nein); s.on('error', nein); s.on('finish', ja);
    a.pipe(s);
  });
  if(opt.groesse && n !== opt.groesse){ try{ fs.unlinkSync(roh); }catch(e){} throw new Error('Datei unvollstaendig (' + n + ' von ' + opt.groesse + ' Bytes)'); }
  if(hash){
    const h = hash.digest('hex');
    if(h !== opt.sha256){ try{ fs.unlinkSync(roh); }catch(e){} throw new Error('Pruefsumme stimmt nicht - Datei verworfen'); }
  }
  try{ if(fs.existsSync(ziel)) fs.unlinkSync(ziel); }catch(e){}
  fs.renameSync(roh, ziel);
  return n;
}

// Hugging Face nennt fuer jede grosse Datei Pruefsumme und Groesse in
// einer kleinen Zeigerdatei (git-lfs). Die wird zuerst geholt.
async function hfZeiger(repo, datei){
  const txt = (await holenKlein(HF_BASIS + repo + '/raw/main/' + datei, 1024 * 1024)).toString('utf8');
  const oid = txt.match(/oid sha256:([0-9a-f]{64})/);
  const size = txt.match(/\nsize (\d+)/);
  if(oid && size) return { sha256: oid[1], groesse: parseInt(size[1], 10) };
  return null;                                          // keine LFS-Datei: dann ohne Pruefsumme
}

// ---------------------------------------------------------------
//  .npz lesen -> voices.bin
//  Eine .npz ist ein ZIP mit einer .npy je Feld. Gelesen wird ueber das
//  Inhaltsverzeichnis am Ende (dort stehen die Groessen sicher), dann
//  der .npy-Kopf: {'descr': '<f4', 'fortran_order': False, 'shape': (510, 1, 256)}.
// ---------------------------------------------------------------
function zipEintraege(buf){
  let e = buf.length - 22;
  while(e >= 0 && buf.readUInt32LE(e) !== 0x06054b50) e--;
  if(e < 0) throw new Error('npz: kein ZIP-Verzeichnis');
  const anzahl = buf.readUInt16LE(e + 10);
  let p = buf.readUInt32LE(e + 16);
  const aus = [];
  for(let i = 0; i < anzahl; i++){
    if(buf.readUInt32LE(p) !== 0x02014b50) throw new Error('npz: Verzeichniseintrag');
    const methode = buf.readUInt16LE(p + 10);
    let komp = buf.readUInt32LE(p + 20), roh = buf.readUInt32LE(p + 24);
    const nl = buf.readUInt16LE(p + 28), xl = buf.readUInt16LE(p + 30), kl = buf.readUInt16LE(p + 32);
    let ab = buf.readUInt32LE(p + 42);
    const name = buf.subarray(p + 46, p + 46 + nl).toString('utf8');
    // ZIP64-Zusatz, falls eine Groesse auf 0xFFFFFFFF steht
    if(komp === 0xffffffff || roh === 0xffffffff || ab === 0xffffffff){
      let x = p + 46 + nl; const ende = x + xl;
      while(x + 4 <= ende){
        const id = buf.readUInt16LE(x), len = buf.readUInt16LE(x + 2); let y = x + 4;
        if(id === 0x0001){
          if(roh === 0xffffffff){ roh = Number(buf.readBigUInt64LE(y)); y += 8; }
          if(komp === 0xffffffff){ komp = Number(buf.readBigUInt64LE(y)); y += 8; }
          if(ab === 0xffffffff){ ab = Number(buf.readBigUInt64LE(y)); y += 8; }
        }
        x += 4 + len;
      }
    }
    // Lokaler Kopf: eigene Namens-/Zusatzlaengen
    if(buf.readUInt32LE(ab) !== 0x04034b50) throw new Error('npz: lokaler Kopf');
    const lnl = buf.readUInt16LE(ab + 26), lxl = buf.readUInt16LE(ab + 28);
    const datenAb = ab + 30 + lnl + lxl;
    aus.push({ name, methode, komp, roh, datenAb });
    p += 46 + nl + xl + kl;
  }
  return aus;
}

function npyLesen(buf){
  if(buf.subarray(0, 6).toString('latin1') !== '\x93NUMPY') throw new Error('npy: Kennung fehlt');
  const major = buf[6];
  const kopfLen = major === 1 ? buf.readUInt16LE(8) : buf.readUInt32LE(8);
  const kopfAb = major === 1 ? 10 : 12;
  const kopf = buf.subarray(kopfAb, kopfAb + kopfLen).toString('latin1');
  const descr = (kopf.match(/'descr'\s*:\s*'([^']+)'/) || [])[1];
  const fortran = /'fortran_order'\s*:\s*True/.test(kopf);
  const shape = ((kopf.match(/'shape'\s*:\s*\(([^)]*)\)/) || [])[1] || '').split(',').map(s => s.trim()).filter(Boolean).map(Number);
  if(fortran) throw new Error('npy: Fortran-Reihenfolge wird nicht unterstuetzt');
  const daten = buf.subarray(kopfAb + kopfLen);
  const n = shape.reduce((a, b) => a * b, 1);
  let f32;
  if(descr === '<f4'){ f32 = new Float32Array(n); for(let i = 0; i < n; i++) f32[i] = daten.readFloatLE(i * 4); }
  else if(descr === '<f8'){ f32 = new Float32Array(n); for(let i = 0; i < n; i++) f32[i] = daten.readDoubleLE(i * 8); }
  else if(descr === '<f2'){
    f32 = new Float32Array(n);
    for(let i = 0; i < n; i++){                         // half -> float
      const h = daten.readUInt16LE(i * 2), s = (h & 0x8000) ? -1 : 1, e = (h >> 10) & 0x1f, m = h & 0x3ff;
      f32[i] = e === 0 ? s * Math.pow(2, -14) * (m / 1024) : e === 31 ? (m ? NaN : s * Infinity) : s * Math.pow(2, e - 15) * (1 + m / 1024);
    }
  } else throw new Error('npy: Datentyp ' + descr + ' wird nicht unterstuetzt');
  return { shape, f32 };
}

function npzZuVoicesBin(npzPfad, schluessel, zielPfad){
  const buf = fs.readFileSync(npzPfad);
  const eintraege = zipEintraege(buf);
  const gesucht = schluessel + '.npy';
  let e = eintraege.find(x => x.name === gesucht);
  if(!e && eintraege.length === 1) e = eintraege[0];
  if(!e) throw new Error('npz: Feld "' + schluessel + '" fehlt (vorhanden: ' + eintraege.map(x => x.name).join(', ') + ')');
  let daten = buf.subarray(e.datenAb, e.datenAb + e.komp);
  if(e.methode === 8) daten = zlib.inflateRawSync(daten);
  else if(e.methode !== 0) throw new Error('npz: Packmethode ' + e.methode);
  const { shape, f32 } = npyLesen(daten);
  const form = shape.filter(d => d !== 1);
  if(form.length !== 2 || form[0] !== 510 || form[1] !== 256)
    throw new Error('npz: unerwartete Form ' + JSON.stringify(shape) + ' (erwartet 510 x 1 x 256)');
  const aus = Buffer.allocUnsafe(f32.length * 4);
  for(let i = 0; i < f32.length; i++) aus.writeFloatLE(f32[i], i * 4);
  fs.writeFileSync(zielPfad, aus);
  return { shape, bytes: aus.length };
}

// ---------------------------------------------------------------
//  ONNX: Angaben im Kopf anhaengen
//  ModelProto, Feld 14 = metadata_props (StringStringEntryProto:
//  key = Feld 1, value = Feld 2). Ein wiederholtes Feld darf in
//  Protobuf an jeder Stelle stehen - also auch hinten angehaengt.
// ---------------------------------------------------------------
function varint(n){
  const b = [];
  while(n >= 0x80){ b.push((n & 0x7f) | 0x80); n = Math.floor(n / 128); }
  b.push(n);
  return Buffer.from(b);
}
function pbString(feld, s){
  const d = Buffer.from(String(s), 'utf8');
  return Buffer.concat([Buffer.from([(feld << 3) | 2]), varint(d.length), d]);
}
function metadatenBytes(paare){
  const teile = [];
  for(const [k, v] of Object.entries(paare)){
    const eintrag = Buffer.concat([pbString(1, k), pbString(2, v)]);
    teile.push(Buffer.from([(14 << 3) | 2]), varint(eintrag.length), eintrag);
  }
  return Buffer.concat(teile);
}
function onnxMetadatenAnhaengen(pfad, paare){
  const fd = fs.openSync(pfad, 'r+');
  try{
    const kopf = Buffer.alloc(2);
    fs.readSync(fd, kopf, 0, 2, 0);
    // Feld 1 (ir_version, varint) steht bei jedem Export vorn.
    if(kopf[0] !== 0x08) throw new Error('Das ist keine ONNX-Datei (Kopf ' + kopf[0].toString(16) + ')');
    const groesse = fs.fstatSync(fd).size;
    fs.writeSync(fd, metadatenBytes(paare), 0, undefined, groesse);
  }finally{ fs.closeSync(fd); }
}

// ---------------------------------------------------------------
//  Entpacken - nur die Dateien, die gebraucht werden. Nichts aus dem
//  Archiv bestimmt, wohin geschrieben wird: Der Zielname ist immer
//  Ordner + Basisname.
// ---------------------------------------------------------------
function laufwerkEntpacken(archiv, LAUFWERK){
  const eintraege = tarBz2Eintraege(fs.readFileSync(archiv));
  fs.mkdirSync(path.join(LAUFWERK, 'bin'), { recursive: true });
  fs.mkdirSync(path.join(LAUFWERK, 'lib'), { recursive: true });
  let n = 0;
  for(const e of eintraege){
    const rel = e.name.split('/').slice(1).join('/');     // oberster Ordner weg
    const base = path.basename(rel);
    if(!base || base.includes('..')) continue;
    const nimm =
      (rel.startsWith('bin/') && (base === 'sherpa-onnx-offline-tts' || base === 'sherpa-onnx-offline-tts.exe' || /^onnxruntime.*\.dll$/.test(base) || /^libonnxruntime.*\.(so|dylib)/.test(base))) ||
      (rel.startsWith('lib/') && /\.(so|dylib)(\.\d+)*$/.test(base));
    if(!nimm) continue;
    const ziel = path.join(LAUFWERK, rel.startsWith('bin/') ? 'bin' : 'lib', base);
    fs.writeFileSync(ziel, e.daten());
    if(process.platform !== 'win32'){ try{ fs.chmodSync(ziel, 0o755); }catch(x){} }
    n++;
  }
  return n;
}

function lautdatenEntpacken(archiv, ESPEAK){
  const eintraege = tarBz2Eintraege(fs.readFileSync(archiv));
  let n = 0;
  for(const e of eintraege){
    if(!e.name.startsWith('espeak-ng-data/')) continue;
    const rel = e.name.slice('espeak-ng-data/'.length);
    if(!rel || rel.split('/').some(t => t === '..' || t === '')) continue;
    const ziel = path.join(ESPEAK, rel);
    fs.mkdirSync(path.dirname(ziel), { recursive: true });
    fs.writeFileSync(ziel, e.daten());
    n++;
  }
  return n;
}

// Das Entpacken rechnet ein paar Sekunden am Stueck (bzip2 in
// JavaScript). Im Hauptfaden stuende der Trainer so lange still - auch
// fuer jeden, der gerade eine Frage vorgelesen bekommt. Deshalb laeuft
// es in einem eigenen Faden.
function imNebenfaden(funktion, archiv, ziel){
  return new Promise((ja, nein) => {
    const { Worker } = require('worker_threads');
    const w = new Worker(
      "const k = require(process.env.AFU_KOKORO_MODUL); const { parentPort, workerData } = require('worker_threads');" +
      "try{ parentPort.postMessage({ ok: true, n: k[workerData.funktion](workerData.archiv, workerData.ziel) }); }" +
      "catch(e){ parentPort.postMessage({ ok: false, fehler: e.message }); }",
      { eval: true, workerData: { funktion, archiv, ziel }, env: { ...process.env, AFU_KOKORO_MODUL: __filename } });
    w.on('message', m => m.ok ? ja(m.n) : nein(new Error(m.fehler)));
    w.on('error', nein);
    w.on('exit', code => { if(code !== 0) nein(new Error('Entpacken abgebrochen (Code ' + code + ')')); });
  });
}

// ---------------------------------------------------------------
//  Der Ordner
// ---------------------------------------------------------------
function einrichten(umgebung){
  const { app, localOnly, ordner } = umgebung;
  const KOKORO = ordner;
  const LAUFWERK = path.join(KOKORO, 'laufwerk');
  const ESPEAK   = path.join(KOKORO, 'espeak-ng-data');
  const TOKENS_DATEI = path.join(KOKORO, 'tokens.txt');

  const istDatei = (x) => { try{ return fs.existsSync(x) && fs.statSync(x).isFile(); }catch(e){ return false; } };
  const istOrdner = (x) => { try{ return fs.existsSync(x) && fs.statSync(x).isDirectory(); }catch(e){ return false; } };

  function laufwerkPfad(){ return path.join(LAUFWERK, 'bin', laufwerkName()); }
  function laufwerkDa(){ return istDatei(laufwerkPfad()); }
  function lautdatenDa(){ return istDatei(path.join(ESPEAK, 'phontab')) && istDatei(path.join(ESPEAK, 'de_dict')); }
  function stimmeDa(s){ return istDatei(path.join(KOKORO, s.id, 'model.onnx')) && istDatei(path.join(KOKORO, s.id, 'voices.bin')); }

  // Was listVoices() in Server.js anhaengt.
  function stimmen(){
    if(!laufwerkDa() || !lautdatenDa() || !istDatei(TOKENS_DATEI)) return [];
    return STIMMEN.filter(stimmeDa).map(s => ({
      file: 'kokoro/' + s.id, fullPath: path.join(KOKORO, s.id, 'model.onnx'),
      label: s.label, name: s.name + ' (Kokoro)', sampleRate: 24000, engine: 'kokoro', _rang: 5
    }));
  }

  // Der Aufruf, den Server.js startet - wie piper.exe, nur mit dem Text
  // als Argument statt ueber stdin.
  function befehl(voice, text, ausgabe){
    const id = String(voice.file || '').replace(/^kokoro\//, '');
    const s = STIMMEN.find(x => x.id === id);
    if(!s) throw new Error('Unbekannte Kokoro-Stimme: ' + id);
    // Der Text geht als Argument mit. Unter Windows kommt ein Argument beim
    // Programm im Zeichensatz des Systems an (meist Windows-1252), nicht als
    // UTF-8; espeak-ng liest so etwas als Latin-1, und Umlaute stimmen dann.
    // Was ausserhalb von Latin-1 liegt, wird vorher ersetzt - Gaensefuesschen,
    // Gedankenstrich, Auslassungspunkte - damit nichts als Fremdzeichen
    // ankommt. Piper bekommt seinen Text ueber stdin und braucht das nicht.
    text = String(text)
      .replace(/[\u201e\u201c\u201d\u00ab\u00bb]/g, '"')
      .replace(/[\u201a\u2018\u2019]/g, "'")
      .replace(/[\u2013\u2014]/g, ', ')
      .replace(/\u2026/g, '...')
      .replace(/[^\u0000-\u00ff]/g, ' ')
      .replace(/\s{2,}/g, ' ').trim();
    if(!text) text = '.';
    return {
      exe: laufwerkPfad(),
      args: [
        '--kokoro-model='    + path.join(KOKORO, s.id, 'model.onnx'),
        '--kokoro-voices='   + path.join(KOKORO, s.id, 'voices.bin'),
        '--kokoro-tokens='   + TOKENS_DATEI,
        '--kokoro-data-dir=' + ESPEAK,
        '--kokoro-lang=de',
        '--sid=0',
        '--num-threads=2',
        '--tts-max-num-sentences=1',
        '--output-filename=' + ausgabe,
        text
      ],
      cwd: path.join(LAUFWERK, 'bin')
    };
  }

  // ---- Lage ----
  function lage(){
    return {
      system: process.platform + '/' + process.arch,
      archiv: laufwerkArchiv(),
      laufwerk: laufwerkDa(), lautdaten: lautdatenDa(), tokens: istDatei(TOKENS_DATEI),
      stimmen: STIMMEN.map(s => ({ id: s.id, name: s.name, geschlecht: s.geschlecht, label: s.label,
                                   lizenz: s.lizenz, herkunft: s.herkunft, repo: s.repo,
                                   installiert: stimmeDa(s), groesseMB: 360 })),
      fortschritt
    };
  }

  // ---- Holen ----
  let fortschritt = { laeuft: false, schritt: '', geladen: 0, gesamt: 0, fertig: false, fehler: null };

  async function laufwerkHolen(){
    const archiv = laufwerkArchiv();
    if(!archiv) throw new Error('Fuer dieses System (' + process.platform + '/' + process.arch + ') gibt es kein fertiges sherpa-onnx.');
    fortschritt.schritt = 'Laufwerk sherpa-onnx ' + SHERPA_VERSION; fortschritt.geladen = 0; fortschritt.gesamt = 0;
    const tmp = path.join(KOKORO, archiv);
    await holenDatei(SHERPA_BASIS + 'v' + SHERPA_VERSION + '/' + archiv, tmp,
      { max: MAX_ARCHIV, takt: (g, ges) => { fortschritt.geladen = g; fortschritt.gesamt = ges; } });
    fortschritt.schritt = 'Laufwerk entpacken'; fortschritt.geladen = 0; fortschritt.gesamt = 0;
    const n = await imNebenfaden('laufwerkEntpacken', tmp, LAUFWERK);
    try{ fs.unlinkSync(tmp); }catch(e){}
    if(!laufwerkDa()) throw new Error('Das Laufwerk wurde geladen, aber ' + laufwerkName() + ' ist nicht im Archiv.');
    console.log('[KOKORO] Laufwerk: ' + n + ' Datei(en) nach ' + LAUFWERK);
  }

  async function lautdatenHolen(){
    fortschritt.schritt = 'Lautdaten espeak-ng-data'; fortschritt.geladen = 0; fortschritt.gesamt = 0;
    const tmp = path.join(KOKORO, 'espeak-ng-data.tar.bz2');
    await holenDatei(ESPEAK_URL, tmp, { max: MAX_ARCHIV, takt: (g, ges) => { fortschritt.geladen = g; fortschritt.gesamt = ges; } });
    fortschritt.schritt = 'Lautdaten entpacken'; fortschritt.geladen = 0; fortschritt.gesamt = 0;
    const n = await imNebenfaden('lautdatenEntpacken', tmp, ESPEAK);
    try{ fs.unlinkSync(tmp); }catch(e){}
    if(!lautdatenDa()) throw new Error('Die Lautdaten wurden geladen, aber phontab/de_dict fehlen.');
    console.log('[KOKORO] Lautdaten: ' + n + ' Datei(en).');
  }

  function tokensSchreiben(){
    fs.writeFileSync(TOKENS_DATEI, TOKENS.join('\n') + '\n', 'utf8');
  }

  async function stimmeHolen(s){
    const ord = path.join(KOKORO, s.id);
    fs.mkdirSync(ord, { recursive: true });
    // 1. Verzeichnisangaben (Pruefsumme, Groesse)
    fortschritt.schritt = 'Verzeichnis lesen';
    const zModell = await hfZeiger(s.repo, s.modell);
    const zStimme = await hfZeiger(s.repo, s.stimmdatei);
    // 2. Modell
    fortschritt.schritt = 'Modell ' + s.name + ' (326 MB)'; fortschritt.geladen = 0; fortschritt.gesamt = 0;
    const roh = path.join(ord, 'model.roh');
    await holenDatei(HF_BASIS + s.repo + '/resolve/main/' + s.modell, roh,
      { max: MAX_MODELL, sha256: zModell && zModell.sha256, groesse: zModell && zModell.groesse,
        takt: (g, ges) => { fortschritt.geladen = g; fortschritt.gesamt = ges; } });
    // 3. Stimmdatei
    fortschritt.schritt = 'Stimmdatei'; fortschritt.geladen = 0; fortschritt.gesamt = 0;
    const npz = path.join(ord, 'voices.npz');
    await holenDatei(HF_BASIS + s.repo + '/resolve/main/' + s.stimmdatei, npz,
      { max: MAX_KLEIN, sha256: zStimme && zStimme.sha256, groesse: zStimme && zStimme.groesse });
    // 4. Umwandeln
    fortschritt.schritt = 'Umwandeln'; fortschritt.geladen = 0; fortschritt.gesamt = 0;
    const v = npzZuVoicesBin(npz, s.schluessel, path.join(ord, 'voices.bin'));
    onnxMetadatenAnhaengen(roh, {
      model_type: 'kokoro', version: '2', language: 'German', voice: 'de',
      has_espeak: '1', sample_rate: '24000', n_speakers: '1', style_dim: '510,1,256',
      speaker_names: s.id, id2speaker: '0->' + s.id, speaker2id: s.id + '->0',
      see_also: HF_BASIS + s.repo, comment: 'Kopf angehaengt vom Amateurfunk-Trainer (kokoro_stimme.js) fuer sherpa-onnx'
    });
    const modell = path.join(ord, 'model.onnx');
    try{ if(fs.existsSync(modell)) fs.unlinkSync(modell); }catch(e){}
    fs.renameSync(roh, modell);
    try{ fs.unlinkSync(npz); }catch(e){}
    fs.writeFileSync(path.join(ord, 'stand.json'), JSON.stringify({
      stimme: s.id, quelle: HF_BASIS + s.repo, lizenz: s.lizenz, herkunft: s.herkunft,
      geholt: new Date().toISOString(), modellSha256: zModell && zModell.sha256, stimmForm: v.shape,
      laufwerk: 'sherpa-onnx ' + SHERPA_VERSION
    }, null, 2));
    console.log('[KOKORO] Stimme ' + s.id + ' geholt und umgewandelt.');
  }

  // Probelauf: Ein Satz durch das Laufwerk, damit ein Fehler HIER steht
  // und nicht erst beim Vorlesen.
  function probelauf(s){
    return new Promise((ja, nein) => {
      const { spawn } = require('child_process');
      const aus = path.join(KOKORO, s.id, 'probe.wav');
      const b = befehl({ file: 'kokoro/' + s.id }, 'Willkommen beim Amateurfunk-Trainer.', aus);
      let err = '';
      let k;
      try{ k = spawn(b.exe, b.args, { cwd: b.cwd, stdio: ['ignore', 'ignore', 'pipe'] }); }
      catch(e){ return nein(e); }
      k.stderr.on('data', d => { err += d.toString(); });
      k.on('error', nein);
      k.on('exit', code => {
        let ok = false;
        try{ ok = code === 0 && fs.statSync(aus).size > 10000; }catch(e){}
        try{ fs.unlinkSync(aus); }catch(e){}
        if(ok) return ja(true);
        nein(new Error('Probelauf fehlgeschlagen (Code ' + code + '): ' + err.trim().slice(-300)));
      });
    });
  }

  async function holenStarten(id){
    if(fortschritt.laeuft) throw new Error('Es wird gerade schon geholt.');
    const s = STIMMEN.find(x => x.id === id);
    if(!s) throw new Error('Diese Stimme gibt es nicht.');
    fortschritt = { laeuft: true, schritt: 'Start', geladen: 0, gesamt: 0, fertig: false, fehler: null };
    fs.mkdirSync(KOKORO, { recursive: true });
    (async () => {
      try{
        if(!laufwerkDa()) await laufwerkHolen();
        if(!lautdatenDa()) await lautdatenHolen();
        if(!istDatei(TOKENS_DATEI)) tokensSchreiben();
        if(!stimmeDa(s)) await stimmeHolen(s);
        fortschritt.schritt = 'Probelauf'; fortschritt.geladen = 0; fortschritt.gesamt = 0;
        await probelauf(s);
        fortschritt.fertig = true;
        fortschritt.schritt = 'fertig';
      }catch(e){
        fortschritt.fehler = e.message;
        console.warn('[KOKORO] ' + e.message);
      }finally{
        fortschritt.laeuft = false;
      }
    })();
    return { ok: true };
  }

  // ---- Wege ----
  app.get('/api/kokoro/lage', localOnly, (req, res) => res.json(lage()));
  app.post('/api/kokoro/holen', localOnly, async (req, res) => {
    try{
      const id = String((req.body && req.body.id) || 'martin');
      if(!/^[a-z0-9_\-]{1,40}$/.test(id)) return res.status(400).json({ error: 'Keine gueltige Stimme' });
      res.json(await holenStarten(id));
    }catch(e){ res.status(400).json({ error: e.message }); }
  });

  return { stimmen, befehl, lage, STIMMEN };
}

module.exports = { einrichten, npzZuVoicesBin, onnxMetadatenAnhaengen, laufwerkEntpacken, lautdatenEntpacken, laufwerkArchiv, TOKENS };
