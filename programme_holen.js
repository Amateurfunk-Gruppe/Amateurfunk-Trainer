// ================================================================
//  PROGRAMME NACHHOLEN - piper und cloudflared, auf jedem System
// ----------------------------------------------------------------
//  Dietmar am 07.09.2026: "Baue es mir so auf, dass es auf Windows,
//  Linux und Mac laeuft."
//
//  Was bisher fehlte, war nicht der Trainer - der ist Node und laeuft
//  ueberall. Es fehlten die beiden HILFSPROGRAMME, und die kamen bisher
//  ausschliesslich ueber Windows-Wege:
//
//    piper        - die Sprachausgabe. Kam mit dem Setup (piper.exe).
//    cloudflared  - der Tunnel fuer den Gruppenraum. Holt sich
//                   start-tunnel.bat per PowerShell.
//
//  Beides sind .bat- beziehungsweise .exe-Wege. Auf Linux und am Mac
//  stand der Benutzer davor und musste selbst herausfinden, welche
//  Datei wohin gehoert.
//
//  Dieses Modul holt beide nach - in Node, also auf allen drei
//  Systemen gleich, und ueber dieselben Knoepfe wie "Stimmen
//  hinzufuegen". Die Stimmen selbst konnten das laengst
//  (piper_stimmen.js); nur die Programme nicht.
//
//  DIE VORSICHTSMASSNAHMEN SIND DIESELBEN WIE BEI DEN STIMMEN, und aus
//  denselben Gruenden:
//    - Nur zwei Rechnernamen sind erlaubt, github.com und der
//      Auslieferungsdienst, an den GitHub weiterreicht. Jede Umleitung
//      wird erneut geprueft, nicht nur die erste.
//    - Eine Obergrenze fuer die Dateigroesse, damit eine falsche
//      Antwort nicht die Platte vollschreibt.
//    - Geschrieben wird erst unter einem Zwischennamen und dann
//      umbenannt. Ein Abbruch mitten im Laden hinterlaesst damit keine
//      halbe Datei, die beim naechsten Start als "ist ja da" gilt.
//    - Entpackt wird mit dem tar des Systems. Linux und macOS bringen
//      es mit, Windows seit Version 10 ebenfalls - und es kann dort
//      auch ZIP. Eine eigene Entpackroutine waere mehr Code und mehr
//      Angriffsflaeche als ein Aufruf.
// ================================================================
'use strict';

const fs      = require('fs');
const path    = require('path');
const os      = require('os');
const https   = require('https');
const { spawn } = require('child_process');

// GitHub liefert Release-Dateien nicht selbst aus, sondern leitet auf
// objects.githubusercontent.com weiter. Beide Namen muessen erlaubt sein,
// sonst bricht der Weg genau an der Umleitung ab.
const ERLAUBTE_WIRTE = [
  /(^|\.)github\.com$/i,
  /(^|\.)githubusercontent\.com$/i
];

const MAX_DATEI = 200 * 1024 * 1024;   // cloudflared wiegt rund 55 MB

function wirtErlaubt(u){
  try{ return ERLAUBTE_WIRTE.some(m => m.test(new URL(u).hostname)); }
  catch(e){ return false; }
}

// ----------------------------------------------------------------
//  WELCHE DATEI FUER DIESES SYSTEM?
//  Die Namen stammen aus den Release-Seiten der beiden Projekte und
//  sind am 07.09.2026 dort nachgesehen worden - nicht geraten.
// ----------------------------------------------------------------
function systemKennung(){
  const p = process.platform;              // win32 | linux | darwin
  const a = process.arch;                  // x64 | arm64 | arm | ...
  return { platform: p, arch: a };
}

function piperDatei(){
  const { platform, arch } = systemKennung();
  if(platform === 'win32')  return arch === 'x64' ? 'piper_windows_amd64.zip' : null;
  if(platform === 'darwin') return arch === 'arm64' ? 'piper_macos_aarch64.tar.gz' : 'piper_macos_x64.tar.gz';
  if(platform === 'linux'){
    if(arch === 'x64')   return 'piper_linux_x86_64.tar.gz';
    if(arch === 'arm64') return 'piper_linux_aarch64.tar.gz';
    if(arch === 'arm')   return 'piper_linux_armv7l.tar.gz';
  }
  return null;
}

function cloudflaredDatei(){
  const { platform, arch } = systemKennung();
  if(platform === 'win32')  return arch === 'x64' ? 'cloudflared-windows-amd64.exe' : null;
  if(platform === 'darwin') return arch === 'arm64' ? 'cloudflared-darwin-arm64.tgz' : 'cloudflared-darwin-amd64.tgz';
  if(platform === 'linux'){
    if(arch === 'x64')   return 'cloudflared-linux-amd64';
    if(arch === 'arm64') return 'cloudflared-linux-arm64';
    if(arch === 'arm')   return 'cloudflared-linux-arm';
  }
  return null;
}

const PIPER_BASIS       = 'https://github.com/rhasspy/piper/releases/latest/download/';
const CLOUDFLARED_BASIS = 'https://github.com/cloudflare/cloudflared/releases/latest/download/';

// ----------------------------------------------------------------
//  HOLEN - mit Pruefung jeder Umleitung
// ----------------------------------------------------------------
function ladeNach(url, zielDatei, aufTakt, tiefe){
  tiefe = tiefe || 0;
  return new Promise((ja, nein) => {
    if(tiefe > 5)          return nein(new Error('Zu viele Umleitungen'));
    if(!wirtErlaubt(url))  return nein(new Error('Unerwartete Adresse: ' + url));

    const anfrage = https.get(url, {
      timeout: 60000,
      headers: { 'User-Agent': 'Amateurfunk-Trainer', 'Accept': '*/*' }
    }, a => {
      if([301,302,303,307,308].includes(a.statusCode) && a.headers.location){
        a.resume();
        let ziel;
        try{ ziel = new URL(a.headers.location, url).toString(); }
        catch(e){ return nein(new Error('Ungueltige Umleitung')); }
        return ladeNach(ziel, zielDatei, aufTakt, tiefe + 1).then(ja, nein);
      }
      if(a.statusCode !== 200){ a.resume(); return nein(new Error('Antwort HTTP ' + a.statusCode)); }

      const gesamt = parseInt(a.headers['content-length'] || '0', 10) || 0;
      if(gesamt > MAX_DATEI){ a.resume(); anfrage.destroy(); return nein(new Error('Datei zu gross')); }

      // Erst unter Zwischennamen - siehe Kopf.
      const roh = zielDatei + '.teil';
      const strom = fs.createWriteStream(roh);
      let menge = 0;
      a.on('data', d => {
        menge += d.length;
        if(menge > MAX_DATEI){
          anfrage.destroy(); strom.destroy();
          try{ fs.unlinkSync(roh); }catch(e){}
          return nein(new Error('Datei zu gross'));
        }
        if(aufTakt) aufTakt(menge, gesamt);
      });
      a.pipe(strom);
      strom.on('error', e => { try{ fs.unlinkSync(roh); }catch(x){} nein(e); });
      strom.on('finish', () => {
        try{
          if(fs.existsSync(zielDatei)) fs.unlinkSync(zielDatei);
          fs.renameSync(roh, zielDatei);
          ja({ bytes: menge });
        }catch(e){ nein(e); }
      });
    });
    anfrage.on('timeout', () => { anfrage.destroy(); nein(new Error('Zeitueberschreitung - keine Antwort')); });
    anfrage.on('error', e => nein(new Error(
      /ENOTFOUND|EAI_AGAIN/i.test(e.message) ? 'Keine Verbindung (kein Netz?)' : e.message)));
  });
}

// ----------------------------------------------------------------
//  ENTPACKEN mit dem tar des Systems
// ----------------------------------------------------------------
function entpacken(archiv, zielOrdner){
  return new Promise((ja, nein) => {
    fs.mkdirSync(zielOrdner, { recursive: true });
    // -x auspacken, -f Datei, -C wohin. Das Format erkennt tar selbst,
    // deshalb kein -z: bsdtar unter Windows und macOS kaeme damit
    // durcheinander, GNU tar braucht es seit Jahren nicht mehr.
    const k = spawn('tar', ['-xf', archiv, '-C', zielOrdner], { stdio: ['ignore','ignore','pipe'] });
    let fehler = '';
    k.stderr.on('data', d => { fehler += d.toString(); });
    k.on('error', e => nein(new Error(
      e.code === 'ENOENT'
        ? 'Das Programm "tar" wurde nicht gefunden. Bitte das Archiv von Hand entpacken.'
        : e.message)));
    k.on('exit', code => code === 0 ? ja(true)
                                    : nein(new Error('Entpacken fehlgeschlagen: ' + (fehler.trim().slice(0,200) || ('Code ' + code)))));
  });
}

// Nach dem Entpacken liegt die Datei je nach Archiv mal direkt im Ordner
// und mal eine Ebene tiefer. Gesucht wird deshalb beides - genauso wie
// findPiper() in Server.js sucht.
function sucheDatei(ordner, name, tiefe){
  tiefe = tiefe || 0;
  try{
    const direkt = path.join(ordner, name);
    if(fs.existsSync(direkt) && fs.statSync(direkt).isFile()) return direkt;
    if(tiefe >= 2) return null;
    for(const e of fs.readdirSync(ordner, { withFileTypes: true })){
      if(!e.isDirectory()) continue;
      const t = sucheDatei(path.join(ordner, e.name), name, tiefe + 1);
      if(t) return t;
    }
  }catch(e){}
  return null;
}

function ausfuehrbarMachen(datei){
  if(process.platform === 'win32') return;
  try{ fs.chmodSync(datei, 0o755); }
  catch(e){ console.warn('[PROGRAMME] chmod fehlgeschlagen:', e.message); }
}

// ================================================================
//  PIPER
// ================================================================
async function piperHolen(piperOrdner, aufTakt){
  const datei = piperDatei();
  if(!datei){
    const { platform, arch } = systemKennung();
    throw new Error('Fuer dieses System (' + platform + '/' + arch + ') gibt es kein fertiges Piper. '
                  + 'Alternative: pip install piper-tts');
  }
  fs.mkdirSync(piperOrdner, { recursive: true });
  const archiv = path.join(piperOrdner, datei);

  console.log('[PROGRAMME] Hole Piper:', datei);
  await ladeNach(PIPER_BASIS + datei, archiv, aufTakt);

  console.log('[PROGRAMME] Entpacke Piper ...');
  await entpacken(archiv, piperOrdner);
  try{ fs.unlinkSync(archiv); }catch(e){}

  const name = process.platform === 'win32' ? 'piper.exe' : 'piper';
  const gefunden = sucheDatei(piperOrdner, name, 0);
  if(!gefunden) throw new Error('Piper wurde geladen und entpackt, aber die Datei "' + name + '" ist nicht aufzufinden.');
  ausfuehrbarMachen(gefunden);
  console.log('[PROGRAMME] Piper liegt jetzt:', gefunden);
  return { datei: gefunden, archiv: datei };
}

// ================================================================
//  CLOUDFLARED
//  Unter Linux ist es eine nackte Datei ohne Archiv - dann faellt das
//  Entpacken weg und sie wird direkt an ihren Platz geschrieben.
// ================================================================
async function cloudflaredHolen(ordner, aufTakt){
  const datei = cloudflaredDatei();
  if(!datei){
    const { platform, arch } = systemKennung();
    throw new Error('Fuer dieses System (' + platform + '/' + arch + ') gibt es kein fertiges cloudflared.');
  }
  fs.mkdirSync(ordner, { recursive: true });
  const zielName = process.platform === 'win32' ? 'cloudflared.exe' : 'cloudflared';
  const istArchiv = /\.tgz$|\.tar\.gz$/.test(datei);

  if(!istArchiv){
    const ziel = path.join(ordner, zielName);
    console.log('[PROGRAMME] Hole cloudflared:', datei);
    await ladeNach(CLOUDFLARED_BASIS + datei, ziel, aufTakt);
    ausfuehrbarMachen(ziel);
    console.log('[PROGRAMME] cloudflared liegt jetzt:', ziel);
    return { datei: ziel };
  }

  // macOS: ein .tgz mit der Datei darin.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'afu-cf-'));
  const archiv = path.join(tmp, datei);
  console.log('[PROGRAMME] Hole cloudflared:', datei);
  await ladeNach(CLOUDFLARED_BASIS + datei, archiv, aufTakt);
  await entpacken(archiv, tmp);
  const gefunden = sucheDatei(tmp, 'cloudflared', 0);
  if(!gefunden){
    try{ fs.rmSync(tmp, { recursive: true, force: true }); }catch(e){}
    throw new Error('cloudflared wurde geladen, aber im Archiv nicht gefunden.');
  }
  const ziel = path.join(ordner, zielName);
  try{ if(fs.existsSync(ziel)) fs.unlinkSync(ziel); }catch(e){}
  fs.copyFileSync(gefunden, ziel);
  try{ fs.rmSync(tmp, { recursive: true, force: true }); }catch(e){}
  ausfuehrbarMachen(ziel);
  console.log('[PROGRAMME] cloudflared liegt jetzt:', ziel);
  return { datei: ziel };
}

// ================================================================
//  EINHAENGEN
// ================================================================
function einrichten({ app, localOnly, piperOrdner, projektOrdner, lagePruefen }){
  // Damit nicht zwei Anfragen gleichzeitig dieselbe Datei schreiben.
  let laeuft = null;

  const stand = { was: null, geladen: 0, gesamt: 0, fertig: false, fehler: null };

  async function starten(was){
    if(laeuft) throw new Error('Es wird gerade schon etwas geholt.');
    stand.was = was; stand.geladen = 0; stand.gesamt = 0; stand.fertig = false; stand.fehler = null;
    const takt = (g, ges) => { stand.geladen = g; stand.gesamt = ges; };
    laeuft = (was === 'piper')
      ? piperHolen(piperOrdner, takt)
      : cloudflaredHolen(projektOrdner, takt);
    try{
      const erg = await laeuft;
      stand.fertig = true;
      return erg;
    }catch(e){
      stand.fehler = e.message;
      throw e;
    }finally{
      laeuft = null;
    }
  }

  app.get('/api/programme/lage', localOnly, (req, res) => {
    const { platform, arch } = systemKennung();
    let lage = {};
    try{ lage = (typeof lagePruefen === 'function') ? (lagePruefen() || {}) : {}; }catch(e){}
    res.json(Object.assign({
      system: platform, arch: arch,
      piperDatei: piperDatei(),
      cloudflaredDatei: cloudflaredDatei(),
      holtGerade: stand.was && !stand.fertig && !stand.fehler ? stand.was : null,
      geladen: stand.geladen, gesamt: stand.gesamt, fehler: stand.fehler
    }, lage));
  });

  app.post('/api/programme/piper', localOnly, async (req, res) => {
    try{ res.json(Object.assign({ ok: true }, await starten('piper'))); }
    catch(e){ res.status(500).json({ error: e.message }); }
  });

  app.post('/api/programme/cloudflared', localOnly, async (req, res) => {
    try{ res.json(Object.assign({ ok: true }, await starten('cloudflared'))); }
    catch(e){ res.status(500).json({ error: e.message }); }
  });

  return { piperHolen, cloudflaredHolen, piperDatei, cloudflaredDatei };
}

module.exports = { einrichten, piperDatei, cloudflaredDatei, systemKennung };

// ================================================================
//  AUFRUF VON DER KONSOLE
//  Damit "installieren.sh" dieselbe Mechanik nutzen kann wie der
//  Knopf im Trainer - eine Stelle, an der geladen wird, nicht zwei.
//
//    node programme_holen.js alles
//    node programme_holen.js piper
//    node programme_holen.js cloudflared
// ================================================================
if(require.main === module){
  (async () => {
    const was = (process.argv[2] || 'alles').toLowerCase();
    const hier = __dirname;
    const piperOrdner = path.join(hier, 'piper');

    let letzte = -1;
    const takt = (geladen, gesamt) => {
      if(!gesamt) return;
      const p = Math.floor(geladen / gesamt * 100);
      if(p === letzte || p % 5 !== 0) return;
      letzte = p;
      process.stdout.write('\r   ' + String(p).padStart(3) + ' %   '
        + (geladen/1048576).toFixed(1) + ' von ' + (gesamt/1048576).toFixed(1) + ' MB   ');
    };
    const fertig = () => { letzte = -1; process.stdout.write('\r' + ' '.repeat(46) + '\r'); };

    const aufgaben = [];
    if(was === 'alles' || was === 'piper')       aufgaben.push(['Piper (Sprachausgabe)', () => piperHolen(piperOrdner, takt)]);
    if(was === 'alles' || was === 'cloudflared') aufgaben.push(['cloudflared (Gruppenraum)', () => cloudflaredHolen(hier, takt)]);

    if(!aufgaben.length){
      console.error('Unbekannt: ' + was + '   (moeglich: alles, piper, cloudflared)');
      process.exit(2);
    }

    let schiefgegangen = 0;
    for(const [name, tun] of aufgaben){
      console.log('-> ' + name);
      try{
        await tun();
        fertig();
        console.log('   fertig.');
      }catch(e){
        fertig();
        console.log('   nicht geholt: ' + e.message);
        console.log('   Das laesst sich spaeter im Trainer nachholen:');
        console.log('   Einstellungen -> Wartung -> Hilfsprogramme.');
        schiefgegangen++;
      }
    }
    // Ein fehlgeschlagenes Hilfsprogramm ist kein Grund, die ganze
    // Installation als gescheitert zu melden - der Trainer laeuft ohne.
    process.exit(schiefgegangen === aufgaben.length ? 1 : 0);
  })();
}
