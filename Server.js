const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn, execFile } = require('child_process');
const crypto = require('crypto');
const http = require('http');
const https = require('https');   // fuer den Tunnel-Selbsttest
const dns = require('dns');       // fuer die DNS-Diagnose des Tunnels
const os  = require('os');        // fuer die Ermittlung der lokalen Netzwerkadresse
const zlib = require('zlib');     // fuer das Projekt-Paket zum Mitnehmen (ZIP)

// ================================================================
// FIX K7: Globaler Fehlerfang.
// Vorher konnte ein einziger unbehandelter Fehler (z.B. EPIPE beim
// Schreiben nach piper.exe oder ein fehlerhaftes Socket-Paket) den
// kompletten Node-Prozess beenden - mitten in einer laufenden
// Gruppenprüfung. Jetzt wird geloggt statt beendet.
// ================================================================
process.on('uncaughtException', (err)=>{
  console.error('[FATAL] Unbehandelte Exception - Server laeuft weiter:', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason)=>{
  console.error('[FATAL] Unbehandelte Promise-Rejection - Server laeuft weiter:', reason);
});

// ================================================================
//  DAS PROTOKOLL                              (04.09.2026)
// ================================================================
//  Bis heute gab es keins. START.vbs startet den Server ohne Fenster
//  ("WshShell.Run ... , 0, False") und ohne Umleitung - alles, was der
//  Server sagt, faellt ins Nichts. Wenn er dann verschwand, gab es
//  nichts nachzusehen: keine Zeile, kein Zeitpunkt, kein Grund. Genau
//  deshalb liess sich Dietmars "er schmiert immer noch ab" so lange
//  nicht klaeren.
//
//  Ab jetzt schreibt er mit. Was in der Konsole steht, steht auch in
//  server.log, mit Uhrzeit davor. Die Datei liegt bei den Lerndaten,
//  nicht im Programmordner: Eine Installation unter "Program Files"
//  ist fuer normale Benutzer nicht beschreibbar, dort waere das
//  Protokoll still gescheitert.
//
//  Bei einem Megabyte faengt sie von vorn an - vorher wird die alte
//  einmal beiseitegelegt. Zwei Dateien, mehr wird es nie.
//
//  Schlaegt das Schreiben fehl, passiert nichts weiter: Ein Trainer,
//  der wegen seines Protokolls nicht startet, waere die schlechtere
//  Loesung.
// ================================================================
const PROTOKOLL_MAX = 1024 * 1024;
let protokollStrom = null;
try {
  const pOrdner = path.join(__dirname, 'data', 'userdata');
  fs.mkdirSync(pOrdner, { recursive: true });
  const pDatei = path.join(pOrdner, 'server.log');
  try {
    if (fs.existsSync(pDatei) && fs.statSync(pDatei).size > PROTOKOLL_MAX) {
      fs.renameSync(pDatei, path.join(pOrdner, 'server.log.alt'));
    }
  } catch (e) { /* Rotieren ist Kuer, nicht Pflicht */ }
  protokollStrom = fs.createWriteStream(pDatei, { flags: 'a' });
  protokollStrom.on('error', () => { protokollStrom = null; });
} catch (e) { protokollStrom = null; }

function protokollZeile(stufe, teile){
  if (!protokollStrom) return;
  try {
    const t = new Date();
    const zz = n => String(n).padStart(2, '0');
    const zeit = zz(t.getDate()) + '.' + zz(t.getMonth()+1) + '. ' +
                 zz(t.getHours()) + ':' + zz(t.getMinutes()) + ':' + zz(t.getSeconds());
    const text = teile.map(x => {
      if (typeof x === 'string') return x;
      if (x instanceof Error) return x.stack || x.message;
      try { return require('util').inspect(x, { depth: 2 }); } catch (e) { return String(x); }
    }).join(' ');
    protokollStrom.write(zeit + ' ' + stufe + ' ' + text + '\n');
  } catch (e) { /* nie den Server wegen einer Logzeile anhalten */ }
}

['log','warn','error'].forEach(art => {
  const alt = console[art].bind(console);
  const stufe = art === 'log' ? '   ' : (art === 'warn' ? '!  ' : '!! ');
  console[art] = function(){
    try { alt.apply(null, arguments); } catch (e) {}
    protokollZeile(stufe, Array.prototype.slice.call(arguments));
  };
});

// Der letzte Satz. Beendet sich der Server geordnet, steht hier warum -
// und wie lange er gelaufen ist. Bleibt diese Zeile aus, wurde er von
// aussen abgeschossen (Task-Manager, Abmeldung, Stromausfall) oder ist
// am Arbeitsspeicher gescheitert; auch das ist eine Auskunft.
const PROTOKOLL_START = Date.now();
process.on('exit', (code) => {
  const min = Math.round((Date.now() - PROTOKOLL_START) / 60000);
  protokollZeile('   ', ['[ENDE] Server beendet, Code ' + code +
                         ', Laufzeit ' + min + ' Minuten.']);
});

// ===== TUNNEL AUTO-START (V13) =====
let tunnelProcess = null;
let tunnelUrlCache = null;
let tunnelStarting = false;

// ================================================================
//  DIE TUNNEL-WACHE
//  ----------------------------------------------------------------
//  Dietmar am 07.09.2026: "Ich moechte, dass wenn ich im Gruppenraum
//  einen Raum starte, der Server laeuft. Der Trainer muss auch ueber
//  Stunden laufen, ohne dass ich am Rechner aktiv bin. Der Trainer muss
//  mit Cloudflare Handshake machen und immer wieder sagen 'ich bin da',
//  damit der zufaellig generierte Raum nicht geschlossen wird."
//
//  Was VORHER passierte, wenn cloudflared aus irgendeinem Grund
//  wegbrach: gar nichts. Der Prozess war weg, tunnel_url.txt geloescht,
//  der Einladungslink tot - und niemand hat es gemerkt, bis der erste
//  Teilnehmer anrief. Es gab keinen einzigen Versuch, ihn wieder
//  aufzubauen.
//
//  Jetzt gibt es zwei Dinge:
//
//  1. DER PULS. Alle vier Minuten ruft der Server seine EIGENE
//     oeffentliche Adresse auf (/api/tunnel-status, die einzige Route,
//     die von aussen erreichbar sein muss). Das ist genau das
//     "ich bin da" - und es ist mehr als Hoeflichkeit: Diese Anfrage
//     laeuft ueber die Leitung, die cloudflared zu Cloudflare haelt,
//     und haelt damit die NAT-Eintraege in Router und Fritzbox offen.
//     Genau die laufen bei UDP (QUIC) sonst nach ein paar Minuten
//     Ruhe ab, und dann bricht die Verbindung - der bekannte Fehler
//     "timeout: no recent network activity".
//
//  2. DIE WACHE. Jede Minute wird nachgesehen, ob cloudflared
//     ueberhaupt noch laeuft. Ist er weg, oder antwortet der Puls
//     dreimal hintereinander nicht, wird der Tunnel automatisch neu
//     aufgebaut - und die neue Adresse an alle im Gruppenraum
//     geschickt, denn ein Quick Tunnel bekommt bei jedem Start einen
//     neuen Zufallsnamen.
// ================================================================
let tunnelGewuenscht  = false;   // wurde bewusst ein Tunnel gestartet?
let tunnelLetzteUrl   = null;    // die zuletzt bekannte Adresse, ueberlebt den Prozesstod
let tunnelWacheHandle = null;
const PULS_TAKT_MS    = 4*60*1000;   // "ich bin da" alle vier Minuten
const WACHE_TAKT_MS   = 60*1000;     // jede Minute nachsehen
const PULS_FEHLER_MAX = 3;           // erst nach drei Fehlschlaegen neu bauen
let tunnelWache = {
  letzterPuls:     null,   // letzte ERFOLGREICHE Antwort von aussen
  letzterVersuch:  null,
  fehlversuche:    0,
  neustarts:       0,
  letzterNeustart: null,
  letzteAdresse:   null,   // die Adresse VOR dem letzten Neustart
  gestartetUm:     null,   // wann die aktuelle Leitung aufgebaut wurde
  fehlstarts:      0,      // Neuaufbauten, die sofort wieder zusammenfielen
  wartetBis:       0,      // Ruhepause nach mehreren Fehlstarts
  meldung:         ''
};

// Der Gruppenraum lebt in einem eigenen Block weiter unten; die Wache
// braucht von dort nur zwei Dinge. Sie werden hier abgelegt, damit sie
// modulweit erreichbar sind.
let duoIo      = null;
let duoHausZahl = null;     // wird im Duo-Aufbau gesetzt
let duoRaeume  = null;

function duoTeilnehmerAnzahl(){
  try{
    if(!duoRaeume) return 0;
    let n = 0;
    for(const raum of Object.values(duoRaeume)) n += Object.keys(raum.users||{}).length;
    return n;
  }catch(e){ return 0; }
}

// FIX (Log-Flut): Der gefundene Pfad wird gemerkt und nur einmal geloggt.
// Vorher schrieb jeder Aufruf von /api/tunnel-url eine Zeile "Found binary:"
// ins Terminal - und der Browser fragt diese Route im Sekundentakt ab.
// Die Konsole war dadurch mit hunderten identischen Zeilen zugemuellt und
// echte Meldungen gingen darin unter.
let cloudflaredPfadCache = null;
let cloudflaredPfadGeloggt = false;

function getCloudflaredPath(){
  // Merker verwerfen, wenn die Datei zwischenzeitlich verschwunden ist
  if(cloudflaredPfadCache && cloudflaredPfadCache !== 'cloudflared' && !fs.existsSync(cloudflaredPfadCache)){
    cloudflaredPfadCache = null;
    cloudflaredPfadGeloggt = false;
  }
  if(cloudflaredPfadCache) return cloudflaredPfadCache;

  const candidates = [
    path.join(__dirname, 'cloudflared.exe'),
    path.join(__dirname, 'cloudflared'),
    path.join(__dirname, 'bin', 'cloudflared.exe'),
    path.join(__dirname, 'bin', 'cloudflared'),
    path.join(process.cwd(), 'cloudflared.exe'),
    path.join(process.cwd(), 'cloudflared')
  ];
  for(const p of candidates){
    if(fs.existsSync(p)){
      if(!cloudflaredPfadGeloggt){ console.log('[TUNNEL] cloudflared gefunden:', p); cloudflaredPfadGeloggt = true; }
      cloudflaredPfadCache = p;
      return p;
    }
  }
  if(!cloudflaredPfadGeloggt){
    console.warn('[TUNNEL] cloudflared.exe nicht im Projekt-Ordner gefunden, versuche System-PATH (cloudflared)');
    cloudflaredPfadGeloggt = true;
  }
  cloudflaredPfadCache = 'cloudflared';
  return 'cloudflared';
}

function checkCloudflaredExists(){
  const exe = getCloudflaredPath();
  try{
    if(fs.existsSync(exe)) return {exists:true, path:exe};
    // Prüfe ob 'cloudflared' im PATH via which/where
    return {exists:false, path:exe, hint:'cloudflared.exe fehlt im Ordner. Lade von https://github.com/cloudflare/cloudflared/releases herunter und lege sie neben server.js ab.'};
  }catch(e){
    return {exists:false, path:exe, error:e.message};
  }
}

// ================================================================
// FIX W2/W3: Log-Streams modulweit halten, damit sie vor dem Loeschen
// der Dateien sauber geschlossen werden koennen.
//
// Der Kern des Error-1033-Problems: Unter Windows scheitert das Loeschen
// einer Datei, die noch von einem offenen Stream gehalten wird (EPERM/EBUSY).
// Der Fehler landete in einem leeren catch{}, danach haengte
// createWriteStream(..,{flags:'a'}) an das ALTE Log an - und
// /api/tunnel-url fand darin die URL des VORHERIGEN Laufs und gab einen
// laengst toten Link aus.
// ================================================================
let tunnelLogStream = null;
let tunnelOutStream = null;
// FIX W1: Generationszaehler. Der exit-Handler eines alten Prozesses darf
// den inzwischen gestarteten neuen Tunnel nicht mehr abraeumen.
let tunnelGeneration = 0;
// Ergebnis des letzten Selbsttests, damit der Browser dem Nutzer sagen kann,
// woran es liegt - im Terminal schaut waehrend der Nutzung niemand nach.
let tunnelSelbsttest = { zustand:'unbekannt', text:'', geprueftUm:null };

function closeTunnelStreams(){
  return new Promise(resolve=>{
    const streams = [tunnelLogStream, tunnelOutStream].filter(Boolean);
    tunnelLogStream = null;
    tunnelOutStream = null;
    if(streams.length === 0) return resolve();
    let offen = streams.length;
    const fertig = ()=>{ if(--offen <= 0) resolve(); };
    streams.forEach(st=>{
      try{ st.end(fertig); }catch(e){ console.debug('[TUNNEL] Stream-Ende:', e.code||e.message); fertig(); }
    });
    // Notbremse, falls ein Stream nicht zurueckmeldet
    setTimeout(resolve, 1500);
  });
}

function tunnelDateiLoeschen(fp){
  try{
    if(fs.existsSync(fp)) fs.unlinkSync(fp);
    return true;
  }catch(e){
    // FIX Q8: nicht mehr stillschweigend verschlucken - genau dieser Fehler
    // war die Ursache des Problems und war vorher unsichtbar.
    console.warn(`[TUNNEL] Konnte ${path.basename(fp)} nicht loeschen (${e.code||e.message}) - wird stattdessen ueberschrieben.`);
    return false;
  }
}

// ================================================================
// Verwaiste cloudflared-Prozesse aufraeumen (Windows).
//
// Node bekommt unter Windows KEIN Signal, wenn das Konsolenfenster mit dem
// X-Knopf geschlossen wird - dann laufen die Aufraeum-Handler nicht und
// cloudflared.exe ueberlebt den Server. Beim naechsten Start tunnelt dieser
// Waisenprozess weiter auf denselben Port, und mit jedem Mal kommt einer dazu.
// Cloudflare drosselt irgendwann die Quick Tunnels von derselben Adresse -
// dann laesst sich gar kein neuer Tunnel mehr aufbauen ("ging nur 1 Mal").
// start-tunnel.bat macht genau dieses taskkill schon lange, offensichtlich
// aus demselben Grund - der Server tut es jetzt auch.
// ================================================================
function verwaisteTunnelProzesseBeenden(){
  if(process.platform === 'win32'){
    // ----------------------------------------------------------------
    //  NUR DIE EIGENEN, NICHT JEDES cloudflared    (21.09.2026)
    //  ----------------------------------------------------------------
    //  Hier stand ein "taskkill /IM cloudflared.exe /F" - es erschlug
    //  JEDES cloudflared auf dem Rechner. Das war vertretbar, solange
    //  es dort nur den Quick Tunnel des Trainers gab.
    //
    //  Dietmar hat am 21.09.2026 amateurfunk-trainer.com gekauft, um
    //  einen BENANNTEN Tunnel als Windows-Dienst zu betreiben - damit
    //  die Adresse einen Neustart des Trainers uebersteht und der
    //  geteilte Link gueltig bleibt. Dieser Dienst laeuft ebenfalls als
    //  cloudflared.exe. Die alte Zeile haette ihn bei JEDEM Start des
    //  Trainers abgeschossen, und niemand haette verstanden, warum die
    //  eigene Adresse immer wieder wegbricht.
    //
    //  Deshalb wird jetzt die Befehlszeile gelesen und nur beendet, was
    //  ein Quick Tunnel ist - also "--url" enthaelt. Genau so macht es
    //  der Linux-Zweig weiter unten schon lange, aus demselben Grund.
    //
    //  Get-CimInstance und nicht wmic: wmic ist in aktuellen
    //  Windows-Fassungen nicht mehr an Bord. Geht die Abfrage schief,
    //  wird NICHTS beendet - lieber ein Waisenprozess zu viel als ein
    //  erschlagener Dienst.
    // ----------------------------------------------------------------
    return new Promise(resolve=>{
      const ps = 'Get-CimInstance Win32_Process -Filter "Name=\'cloudflared.exe\'" '
               + '| Where-Object { $_.CommandLine -like \'*--url*\' } '
               + '| ForEach-Object { Write-Output $_.ProcessId; Stop-Process -Id $_.ProcessId -Force }';
      execFile('powershell', ['-NoProfile','-NonInteractive','-Command', ps], {timeout:8000}, (err, stdout, stderr)=>{
        const text = String(stdout||'').trim();
        if(err){
          console.debug('[TUNNEL] Aufraeumen uebersprungen:', String(stderr||err.message).trim().slice(0,120));
          return resolve();
        }
        const pids = text.split(/\s+/).filter(x => /^\d+$/.test(x));
        if(pids.length) console.log('[TUNNEL] ' + pids.length + ' uebrig gebliebene(n) Quick Tunnel beendet (PID ' + pids.join(', ') + ').');
        resolve();
      });
    });
  }
  // ----------------------------------------------------------------
  //  LINUX UND macOS
  //  Bisher stand hier ein "return" - dort wurde also nie aufgeraeumt,
  //  und ein cloudflared, der einen Absturz ueberlebt hat, blockierte
  //  den naechsten Start still.
  //
  //  ABER NICHT MIT DER BRECHSTANGE: Die Windows-Fassung erschlaegt
  //  JEDES cloudflared auf dem Rechner. Das ist dort vertretbar, weil
  //  dort selten ein zweites laeuft. Auf Linux betreibt mancher einen
  //  eigenen benannten Tunnel fuer sein Heimnetz - den abzuschiessen,
  //  weil hier ein Trainer startet, waere ein Uebergriff.
  //
  //  Deshalb wird nur beendet, was ein "tunnel --url" ohne Konfiguration
  //  ist, also ein Quick Tunnel wie unserer. pgrep -f sieht die ganze
  //  Befehlszeile; -x waere hier falsch.
  // ----------------------------------------------------------------
  return new Promise(resolve=>{
    execFile('pgrep', ['-f', 'cloudflared.*tunnel.*--url'], {timeout:5000}, (err, stdout)=>{
      const pids = String(stdout||'').split('\n').map(x=>x.trim()).filter(Boolean);
      if(!pids.length) return resolve();
      let weg = 0;
      for(const pid of pids){
        if(String(process.pid) === pid) continue;
        try{ process.kill(Number(pid), 'SIGTERM'); weg++; }catch(e){}
      }
      if(weg) console.log('[TUNNEL] ' + weg + ' uebrig gebliebene(n) cloudflared-Prozess(e) beendet.');
      resolve();
    });
  });
}

// FIX W4: cloudflared beim Beenden des Servers mitnehmen.
// Vorher lief cloudflared.exe nach Strg+C weiter und tunnelte einen Port,
// hinter dem nichts mehr war. Mehrfaches Starten stapelte die Prozesse.
function tunnelBeenden(){
  const p = tunnelProcess;
  tunnelProcess = null;
  tunnelUrlCache = null;
  if(!p) return;
  try{
    p.removeAllListeners('exit');
    if(!p.killed) p.kill();
    console.log('[TUNNEL] cloudflared beendet (PID '+p.pid+')');
  }catch(e){ console.warn('[TUNNEL] Beenden fehlgeschlagen:', e.message); }
}
process.on('exit', tunnelBeenden);
['SIGINT','SIGTERM','SIGBREAK'].forEach(sig=>{
  try{
    process.on(sig, ()=>{ console.log(`\n[TUNNEL] ${sig} empfangen - raeume auf...`); tunnelGewuenscht = false; tunnelBeenden(); process.exit(0); });
  }catch(e){ /* SIGBREAK gibt es nur unter Windows */ }
});

// ================================================================
// Selbsttest: Ist der Tunnel von aussen wirklich erreichbar?
//
// Ein gefundener Link bedeutet nur, dass cloudflared sich registriert hat -
// NICHT, dass die Verbindung bis zu diesem Server durchkommt. Genau dazwischen
// liegen die haeufigsten Stolpersteine (Firewall, IPv6/IPv4, Tunnel noch nicht
// propagiert). Der Test ruft die eigene oeffentliche Adresse auf und schreibt
// ein eindeutiges Ergebnis ins Terminal, statt den Nutzer raten zu lassen.
// ================================================================
function tunnelEinmalPruefen(url){
  return new Promise(resolve=>{
    const ziel = url.replace(/\/$/,'') + '/api/tunnel-status';
    const req = https.get(ziel, {timeout: 10000, headers:{'User-Agent':'AfuTrainer-Selbsttest'}}, res=>{
      let body='';
      res.on('data', c=>{ if(body.length < 4000) body += c; });
      res.on('end', ()=>resolve({status: res.statusCode, body}));
    });
    req.on('timeout', ()=>{ req.destroy(); resolve({status:0, fehler:'Zeitueberschreitung'}); });
    req.on('error', e=>resolve({status:0, fehler:e.code||e.message}));
  });
}

// Vergleicht die Namensaufloesung ueber den eingestellten DNS-Server mit der
// ueber einen oeffentlichen. So laesst sich "der Tunnel ist kaputt" sauber von
// "dein Netz filtert trycloudflare.com" unterscheiden.
async function dnsVergleich(hostname){
  const erg = {system:'-', oeffentlich:'-', systemOk:false, oeffentlichOk:false};
  try{
    const a = await dns.promises.lookup(hostname);
    erg.system = a.address; erg.systemOk = true;
  }catch(e){ erg.system = 'schlaegt fehl (' + (e.code||e.message) + ')'; }
  try{
    const r = new dns.promises.Resolver();
    r.setServers(['1.1.1.1','8.8.8.8']);
    const a = await r.resolve4(hostname);
    erg.oeffentlich = a[0]; erg.oeffentlichOk = true;
  }catch(e){ erg.oeffentlich = 'schlaegt fehl (' + (e.code||e.message) + ')'; }
  return erg;
}

async function tunnelErreichbarkeitPruefen(url){
  const host = url.replace(/^https?:\/\//,'').replace(/\/.*$/,'');
  console.log('[TUNNEL] Selbsttest: warte kurz, bis Cloudflare den Namen veroeffentlicht hat...');

  // WICHTIG (Korrektur): Frueher hat dieser Test SOFORT nach dem Erscheinen der
  // URL angefragt. Cloudflare veroeffentlicht den Namen aber erst ein paar
  // Sekunden spaeter im DNS. Die erste Anfrage schlug also zwangslaeufig fehl -
  // und Windows merkt sich so ein "gibt es nicht" im negativen DNS-Cache.
  // Danach scheiterten auch alle Wiederholungen, obwohl der Tunnel laengst lief.
  // Genau dieser Effekt trifft auch den Browser, wenn man zu frueh klickt.
  //
  // Deshalb jetzt: erst 10 Sekunden warten, und dann die Verfuegbarkeit ueber
  // 1.1.1.1 pruefen (eigene DNS-Abfrage, umgeht den Windows-Cache komplett).
  // Erst wenn der Name dort bekannt ist, wird per HTTPS angefragt.
  await new Promise(r=>setTimeout(r, 10000));

  let dnsBereit = false;
  for(let i=1; i<=8; i++){
    try{
      const r = new dns.promises.Resolver();
      r.setServers(['1.1.1.1','8.8.8.8']);
      await r.resolve4(host);
      dnsBereit = true;
      console.log(`[TUNNEL] Selbsttest: Name ist nach ca. ${10 + (i-1)*5}s im DNS bekannt.`);
      break;
    }catch(e){
      if(i < 8) await new Promise(r2=>setTimeout(r2, 5000));
    }
  }

  if(!dnsBereit){
    tunnelSelbsttest = { zustand:'nicht_registriert', text:'Der Tunnel ist auch nach 45 Sekunden oeffentlich nicht bekannt. Bitte noch einmal "Tunnel starten" klicken.', geprueftUm:Date.now() };
    const d = await dnsVergleich(host);
    console.warn('');
    console.warn('  ====================================================');
    console.warn('   ✗ TUNNEL VON DIESEM PC AUS NICHT ERREICHBAR');
    console.warn('     ' + url);
    console.warn('     Der Name ist auch nach 45 Sekunden bei keinem oeffentlichen');
    console.warn('     DNS-Server bekannt - der Tunnel wurde also nicht sauber');
    console.warn('     registriert. Bitte im Browser noch einmal "Tunnel starten".');
    console.warn('       ueber deinen DNS-Server : ' + d.system);
    console.warn('       ueber 1.1.1.1 / 8.8.8.8 : ' + d.oeffentlich);
    console.warn('     Im lokalen Netz geht der Gruppenraum weiterhin ueber');
    console.warn('     http://localhost:' + (process.env.PORT||3000));
    console.warn('  ====================================================');
    console.warn('');
    return false;
  }

  console.log('[TUNNEL] Selbsttest: pruefe jetzt, ob', url, 'auch antwortet...');
  let letzte = null;
  for(let i=1; i<=6; i++){
    const r = await tunnelEinmalPruefen(url);
    letzte = r;
    if(r.status === 200 && r.body && r.body.includes('running')){
      console.log('');
      console.log('  ====================================================');
      tunnelSelbsttest = { zustand:'ok', text:'Der Einladungslink ist von aussen erreichbar.', geprueftUm:Date.now() };
      console.log('   ✓ TUNNEL FUNKTIONIERT - der Link ist von aussen erreichbar:');
      console.log('     ' + url);
      console.log('  ====================================================');
      console.log('');
      return true;
    }
    if(i < 6) await new Promise(r2=>setTimeout(r2, 5000));
  }

  // Fehlgeschlagen - jetzt moeglichst konkret sagen, woran es liegt
  console.warn('');
  console.warn('  ====================================================');
  console.warn('   ✗ TUNNEL VON DIESEM PC AUS NICHT ERREICHBAR');
  console.warn('     ' + url);
  if(letzte && letzte.status === 0 && String(letzte.fehler).includes('ENOTFOUND')){
    // ENOTFOUND heisst: der NAME liess sich nicht aufloesen. Das ist ein
    // DNS-Problem und sagt noch NICHTS darueber, ob der Tunnel funktioniert.
    // Deshalb hier gegenpruefen: kann ein oeffentlicher DNS-Server (1.1.1.1)
    // den Namen aufloesen, dieser PC aber nicht? Dann filtert das lokale Netz.
    const d = await dnsVergleich(host);
    console.warn('     Grund: dieser PC konnte den Namen nicht aufloesen (ENOTFOUND),');
    console.warn('     obwohl er oeffentlich bereits bekannt ist.');
    console.warn('');
    console.warn('     DNS-Gegenprobe fuer ' + host + ':');
    console.warn('       ueber deinen DNS-Server : ' + d.system);
    console.warn('       ueber 1.1.1.1 / 8.8.8.8 : ' + d.oeffentlich);
    console.warn('');
    if(d.oeffentlichOk && !d.systemOk){
      tunnelSelbsttest = {
        zustand:'nur_lokal_blind',
        text:'Der Tunnel funktioniert - andere Teilnehmer erreichen den Link. Nur DIESER PC kann den Namen gerade nicht aufloesen (DNS). Abhilfe: Eingabeaufforderung oeffnen und "ipconfig /flushdns" ausfuehren, dann den Link erneut oeffnen.',
        geprueftUm:Date.now()
      };
      console.warn('     >> Der Name EXISTIERT oeffentlich, nur DIESER PC kennt ihn nicht.');
      console.warn('        Haeufigste Ursache: der negative DNS-Cache von Windows. Er');
      console.warn('        merkt sich einen zu fruehen Fehlversuch minutenlang.');
      console.warn('        -> Abhilfe:  ipconfig /flushdns   und Link erneut oeffnen.');
      console.warn('        -> Seltener: DNS-Filter im Router oder Virenscanner-Webschutz.');
      console.warn('        -> Fuer ANDERE Teilnehmer ist der Link sehr wahrscheinlich');
      console.warn('           trotzdem erreichbar - am besten mit dem Handy ueber');
      console.warn('           Mobilfunk (WLAN aus) gegenpruefen.');
    } else if(!d.oeffentlichOk && !d.systemOk){
      tunnelSelbsttest = { zustand:'nicht_registriert', text:'Der Tunnel wurde nicht sauber registriert. Bitte noch einmal "Tunnel starten" klicken.', geprueftUm:Date.now() };
      console.warn('     >> Auch ein oeffentlicher DNS-Server kennt den Namen nicht.');
      console.warn('        Der Tunnel ist dann wirklich noch nicht (oder nicht mehr)');
      console.warn('        bei Cloudflare registriert. Bitte im Browser noch einmal');
      console.warn('        "Tunnel starten" klicken. Hilft das nicht, ist meist die');
      console.warn('        cloudflared.exe veraltet - start-tunnel.bat laedt eine neue.');
    } else {
      console.warn('     >> DNS funktioniert inzwischen. Der Test war vermutlich nur');
      console.warn('        zu frueh dran - bitte den Link einfach noch einmal oeffnen.');
    }
  } else if(letzte && letzte.status === 0){
    console.warn('     Grund: keine Antwort (' + (letzte.fehler||'unbekannt') + ').');
    console.warn('     Meist blockiert eine Firewall oder ein Virenscanner cloudflared.');
  } else if(letzte && (letzte.status === 502 || letzte.status === 503 || letzte.status === 504)){
    console.warn('     Grund: HTTP ' + letzte.status + ' - Cloudflare erreicht diesen Server nicht.');
    console.warn('     Der Tunnel selbst steht, aber die Weiterleitung nach');
    console.warn('     http://127.0.0.1:' + (process.env.PORT||3000) + ' kommt nicht an.');
    console.warn('     Laeuft der Server wirklich auf diesem Port?');
  } else if(letzte && letzte.status === 530){
    console.warn('     Grund: HTTP 530 (Cloudflare Error 1033) - der Tunnel ist bei');
    console.warn('     Cloudflare nicht (mehr) registriert. Bitte im Browser noch');
    console.warn('     einmal "Tunnel starten" klicken.');
  } else if(letzte){
    console.warn('     Grund: unerwartete Antwort HTTP ' + letzte.status + '.');
  }
  console.warn('');
  console.warn('     Hinweis: Dieser Test laeuft auf DIESEM PC. Schlaegt er wegen DNS');
  console.warn('     fehl, kann der Link fuer andere trotzdem funktionieren.');
  console.warn('     Im lokalen Netz geht der Gruppenraum in jedem Fall ueber');
  console.warn('     http://localhost:' + (process.env.PORT||3000));
  console.warn('  ====================================================');
  console.warn('');
  return false;
}

// ================================================================
//  PULS UND WACHE
// ================================================================

// Ein "ich bin da" ueber die oeffentliche Adresse. Kommt eine Antwort
// zurueck, steht die ganze Kette: dieser PC -> cloudflared -> Cloudflare
// -> zurueck zu diesem PC. Genau das, was der Teilnehmer auch geht.
async function tunnelPulsSenden(){
  const url = tunnelUrlCache;
  if(!url) return false;
  tunnelWache.letzterVersuch = Date.now();
  const r = await tunnelEinmalPruefen(url);
  const gut = (r.status === 200 && r.body && r.body.includes('running'));
  if(gut){
    tunnelWache.letzterPuls  = Date.now();
    tunnelWache.fehlversuche = 0;
    tunnelWache.meldung      = 'Der Einladungslink ist erreichbar.';
    tunnelSelbsttest = { zustand:'ok', text:tunnelWache.meldung, geprueftUm:Date.now() };
    return true;
  }
  tunnelWache.fehlversuche++;
  const grund = r.fehler ? String(r.fehler) : ('HTTP ' + r.status);
  tunnelWache.meldung = 'Keine Antwort von aussen (' + grund + '), Versuch '
                      + tunnelWache.fehlversuche + ' von ' + PULS_FEHLER_MAX + '.';
  console.warn('[WACHE] Puls ohne Antwort (' + grund + ') - '
             + tunnelWache.fehlversuche + '/' + PULS_FEHLER_MAX);
  return false;
}

// Neu aufbauen. Ein Quick Tunnel bekommt dabei IMMER einen neuen
// Zufallsnamen - der alte Link ist danach tot. Deshalb wird die neue
// Adresse sofort an alle im Gruppenraum geschickt, statt sie still
// auszutauschen.
async function tunnelNeuAufbauen(grund){
  if(tunnelStarting) return;
  const jetzt = Date.now();

  // DIE BREMSE.
  //  Ohne sie liefe die Wache heiss, wenn der Neuaufbau das Problem gar
  //  nicht loest - etwa weil das Internet ganz weg ist oder Cloudflare
  //  die kostenlosen Quick Tunnels von dieser Leitung voruebergehend
  //  ausbremst. Dann alle paar Minuten einen neuen zu verlangen macht es
  //  nur schlimmer, und der Gastgeber bekommt im Minutentakt neue Links.
  //
  //  Regel: Liegt der letzte Neuaufbau weniger als zehn Minuten zurueck,
  //  hat er offensichtlich nichts gebracht. Dann wird gezaehlt und ab dem
  //  zweiten Mal gewartet - 1, 2, 4, 8 Minuten, hoechstens eine
  //  Viertelstunde. Haelt eine Leitung laenger als zehn Minuten, faengt
  //  die Zaehlung von vorne an.
  if(tunnelWache.letzterNeustart && (jetzt - tunnelWache.letzterNeustart) < 10*60*1000){
    tunnelWache.fehlstarts++;
  } else {
    tunnelWache.fehlstarts = 0;
  }
  if(tunnelWache.fehlstarts >= 2){
    const pause = Math.min(15*60*1000, 60*1000 * Math.pow(2, tunnelWache.fehlstarts - 2));
    tunnelWache.wartetBis = jetzt + pause;
    tunnelWache.meldung = 'Die Leitung kommt nicht zustande (' + grund + '). Naechster Versuch in '
                        + Math.round(pause/60000) + ' Minuten.';
    console.warn('[WACHE] ' + tunnelWache.fehlstarts + '. vergeblicher Neuaufbau in Folge - '
               + Math.round(pause/60000) + ' Minuten Pause, dann wieder.');
    return;
  }

  const alt = tunnelUrlCache || tunnelLetzteUrl;
  console.warn('');
  console.warn('  [WACHE] ' + grund);
  console.warn('  [WACHE] Der Tunnel wird neu aufgebaut. Der alte Link ist danach tot.');
  tunnelWache.fehlversuche = 0;
  tunnelWache.letzteAdresse = alt;
  const url = await startTunnelProcess();
  if(url){
    tunnelWache.neustarts++;
    tunnelWache.letzterNeustart = Date.now();
    tunnelWache.meldung = 'Der Tunnel wurde neu aufgebaut (' + grund + ').';
    // ACHTUNG: fehlstarts wird hier BEWUSST NICHT zurueckgesetzt. Dass
    // cloudflared startet, heisst noch lange nicht, dass die Leitung
    // haelt - genau das war ja der Fall, der die Bremse noetig macht.
    // Zurueckgesetzt wird erst, wenn sie fuenf Minuten gestanden hat
    // (siehe tunnelWacheTick).
    console.warn('  [WACHE] Neue Adresse: ' + url);
    if(alt && url !== alt) console.warn('  [WACHE] Alte Adresse (tot): ' + alt);
    console.warn('');
    try{
      if(duoIo) duoIo.emit('tunnelNeu', { url: url, alt: alt || null, grund: grund });
    }catch(e){}
  }else{
    tunnelWache.meldung = 'Der Tunnel liess sich nicht neu aufbauen. Naechster Versuch in einer Minute.';
    console.warn('  [WACHE] Neuaufbau fehlgeschlagen - naechster Versuch in einer Minute.');
    console.warn('');
  }
}

async function tunnelWacheTick(){
  if(!tunnelGewuenscht) return;
  if(tunnelStarting) return;

  const jetzt = Date.now();

  // Die Ruhepause der Bremse (siehe tunnelNeuAufbauen) abwarten.
  if(tunnelWache.wartetBis && jetzt < tunnelWache.wartetBis) return;

  // 1. Laeuft cloudflared ueberhaupt noch?
  const lebt = !!(tunnelProcess && !tunnelProcess.killed);
  if(!lebt || !tunnelUrlCache){
    await tunnelNeuAufbauen('cloudflared laeuft nicht mehr');
    return;
  }

  // 2. Ist der Puls faellig?
  if(tunnelWache.letzterVersuch && (jetzt - tunnelWache.letzterVersuch) < PULS_TAKT_MS) return;

  const gut = await tunnelPulsSenden();
  if(!gut && tunnelWache.fehlversuche >= PULS_FEHLER_MAX){
    await tunnelNeuAufbauen('dreimal hintereinander keine Antwort von aussen');
  }
}

function tunnelWacheStarten(){
  if(tunnelWacheHandle) return;
  // Der erste Puls erst nach einer Minute: Direkt nach dem Start ist der
  // Name bei Cloudflare noch nicht ueberall im DNS bekannt, und der
  // Selbsttest laeuft ohnehin gerade.
  tunnelWache.letzterVersuch = Date.now() - (PULS_TAKT_MS - 60000);
  tunnelWacheHandle = setInterval(()=>{
    tunnelWacheTick().catch(e=>console.warn('[WACHE]', e.message));
  }, WACHE_TAKT_MS);
  if(tunnelWacheHandle.unref) tunnelWacheHandle.unref();
  console.log('[WACHE] Tunnel-Wache laeuft: jede Minute nachsehen, alle vier Minuten "ich bin da".');
}

async function startTunnelProcess(){
  if(tunnelStarting) {
    console.log('[TUNNEL] Start bereits im Gange, warte...');
    for(let i=0;i<20;i++){
      await new Promise(r=>setTimeout(r,500));
      if(tunnelUrlCache) return tunnelUrlCache;
    }
    return tunnelUrlCache;
  }
  tunnelStarting = true;
  tunnelGewuenscht = true;          // ab jetzt passt die Wache auf
  const meineGeneration = ++tunnelGeneration;
  tunnelSelbsttest = { zustand:'laeuft', text:'Der Tunnel wird geprueft...', geprueftUm:Date.now() };
  try{
    // FIX W1: Alten Prozess sauber abhaengen BEVOR er gekillt wird. Sonst
    // feuert sein exit-Handler asynchron spaeter und loescht die frisch
    // geschriebene tunnel_url.txt des neuen Tunnels wieder weg.
    tunnelBeenden();

    // Zusaetzlich Waisen aus frueheren Sitzungen entfernen (siehe oben)
    await verwaisteTunnelProzesseBeenden();

    // FIX W2/W3: Erst die Streams schliessen, dann die Dateien loeschen.
    await closeTunnelStreams();

    const logFp = path.join(__dirname,'tunnel.log');
    const outFp = path.join(__dirname,'tunnel_out.log');
    const urlFp = path.join(__dirname,'tunnel_url.txt');

    // trycloudflare.com URLs sind ephemer - alte Staende immer wegwerfen
    tunnelDateiLoeschen(urlFp);
    tunnelDateiLoeschen(logFp);
    tunnelDateiLoeschen(outFp);
    tunnelUrlCache = null;

    const exeCheck = checkCloudflaredExists();
    const exePath = exeCheck.path;
    console.log('[TUNNEL] Prüfe Binary:', exePath, 'Exists:', exeCheck.exists);
    if(!exeCheck.exists){
      console.warn('[TUNNEL] WARNUNG: cloudflared.exe nicht gefunden! '+ (exeCheck.hint||''));
    }

    console.log('[TUNNEL] Starte Tunnel-Prozess...');
    console.log('[TUNNEL] Starting', exePath, 'tunnel --url http://127.0.0.1:'+ (process.env.PORT||3000));

    // FIX W2: 'w' statt 'a'. Selbst wenn das Loeschen oben unter Windows
    // scheitert, faengt die Datei jetzt garantiert leer an - es kann also
    // keine URL aus einem frueheren Lauf mehr gefunden werden.
    tunnelLogStream = fs.createWriteStream(logFp, {flags:'w'});
    tunnelOutStream = fs.createWriteStream(outFp, {flags:'w'});
    tunnelLogStream.on('error', e=>console.warn('[TUNNEL] Logstream-Fehler:', e.code||e.message));
    tunnelOutStream.on('error', e=>console.warn('[TUNNEL] Outstream-Fehler:', e.code||e.message));

    // FIX: 127.0.0.1 statt localhost.
    // Unter Windows loest "localhost" haeufig zuerst nach ::1 (IPv6) auf. Der
    // Server lauscht aber mit listen(PORT,'0.0.0.0') nur auf IPv4. cloudflared
    // bekommt dann "connection refused", der Tunnel steht zwar, liefert aber
    // nur eine Cloudflare-Fehlerseite - der Link ist "nicht erreichbar".
    const args = ['tunnel','--url','http://127.0.0.1:'+ (process.env.PORT||3000)];
    console.log('[TUNNEL] Spawne:', exePath, args.join(' '));
    let proc;
    try{
      proc = spawn(exePath, args, { stdio:['ignore','pipe','pipe'], detached:false });
      tunnelProcess = proc;
    }catch(spawnErr){
      console.error('[TUNNEL] Spawn fehlgeschlagen:', spawnErr.message);
      console.error('[TUNNEL] Bitte lade cloudflared.exe herunter: https://github.com/cloudflare/cloudflared/releases');
      await closeTunnelStreams();
      tunnelStarting = false;
      return null;
    }
    proc.on('error', (err)=>{
      console.error('[TUNNEL] Prozess-Error:', err.message);
      if(err.code==='ENOENT'){
        console.error('[TUNNEL] cloudflared.exe nicht gefunden! Lege die Datei neben server.js ab.');
      }
      if(meineGeneration === tunnelGeneration) tunnelStarting = false;
    });

    let foundUrl = null;
    const URL_RE = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/i;

    // FIX Q: stdout und stderr hatten zweimal denselben Code - jetzt eine Funktion.
    const ausgabeVerarbeiten = (data, stream, quelle)=>{
      const txt = data.toString();
      try{ if(stream) stream.write(txt); }catch(e){ /* Stream schon zu */ }
      if(foundUrl) return;
      const m = txt.match(URL_RE);
      if(m){
        foundUrl = m[0];
        // Nur uebernehmen, wenn dieser Start noch der aktuelle ist
        if(meineGeneration === tunnelGeneration){
          tunnelUrlCache = foundUrl;
          tunnelLetzteUrl = foundUrl;
          tunnelWache.gestartetUm = Date.now();
          try{ fs.writeFileSync(urlFp, foundUrl); }catch(e){ console.warn('[TUNNEL] tunnel_url.txt nicht schreibbar:', e.code||e.message); }
        }
        console.log(`[TUNNEL] URL gefunden (${quelle}):`, foundUrl);
      }
    };
    proc.stdout.on('data', d=>ausgabeVerarbeiten(d, tunnelOutStream, 'stdout'));
    proc.stderr.on('data', d=>ausgabeVerarbeiten(d, tunnelLogStream, 'stderr'));

    proc.on('exit', (code)=>{
      console.log('[TUNNEL] Process exited', code);
      // FIX W1: Nur aufraeumen, wenn inzwischen KEIN neuer Tunnel gestartet wurde.
      if(meineGeneration !== tunnelGeneration){
        console.log('[TUNNEL] (alter Prozess der Generation '+meineGeneration+' - aktueller Tunnel bleibt unberuehrt)');
        return;
      }
      tunnelProcess = null;
      tunnelUrlCache = null;
      tunnelDateiLoeschen(urlFp);
      tunnelStarting = false;
      closeTunnelStreams();
    });

    for(let i=0;i<25;i++){
      await new Promise(r=>setTimeout(r,1000));
      if(foundUrl) break;
      if(meineGeneration !== tunnelGeneration) break;   // ein neuerer Start hat uebernommen
      try{
        if(fs.existsSync(urlFp)){
          const t = fs.readFileSync(urlFp,'utf8').trim();
          if(t.includes('trycloudflare.com')){ foundUrl=t; tunnelUrlCache=t; break; }
        }
        if(fs.existsSync(logFp)){
          const log = fs.readFileSync(logFp,'utf8');
          const m = log.match(URL_RE);
          if(m){
            foundUrl=m[0]; tunnelUrlCache=foundUrl;
            try{ fs.writeFileSync(urlFp, foundUrl); }catch(e){ console.warn('[TUNNEL] tunnel_url.txt nicht schreibbar:', e.code||e.message); }
            break;
          }
        }
      }catch(e){ console.debug('[TUNNEL] Warte auf URL:', e.code||e.message); }
    }

    if(meineGeneration === tunnelGeneration) tunnelStarting = false;
    if(foundUrl){
      console.log('[TUNNEL] Started successfully', foundUrl);
      // Selbsttest im Hintergrund - die Antwort an den Browser soll nicht warten
      tunnelErreichbarkeitPruefen(foundUrl).catch(e=>console.warn('[TUNNEL] Selbsttest-Fehler:', e.message));
      tunnelWacheStarten();
      return foundUrl;
    } else {
      console.warn('[TUNNEL] Could not get URL after 25s');
      return null;
    }
  }catch(e){
    console.error('[TUNNEL] Error starting', e);
    if(meineGeneration === tunnelGeneration) tunnelStarting = false;
    return null;
  }
}

const app = express();
const SERVER_START = new Date().toISOString();
const PORT = process.env.PORT || 3000;
const PIPER_DIR = path.join(__dirname, 'piper');
const TTS_CACHE_DIR = path.join(__dirname, 'tts_cache');
if (!fs.existsSync(TTS_CACHE_DIR)) { try { fs.mkdirSync(TTS_CACHE_DIR, {recursive:true}); } catch(e){ console.error('[CACHE] tts_cache/ nicht anlegbar:', e.message); } }

// ===== PERSISTENTE BENUTZER-DATEN (Verlauf, Lernfortschritt, Lernbedarf) =====
const USERDATA_DIR = path.join(__dirname, 'data', 'userdata');
const USERDATA_FILE = path.join(USERDATA_DIR, 'amateurfunk_data.json');

function ensureUserdataDir(){
  if(!fs.existsSync(USERDATA_DIR)){
    try{ fs.mkdirSync(USERDATA_DIR, {recursive:true}); console.log('[USERDATA] Verzeichnis erstellt:', USERDATA_DIR); }catch(e){ console.error('[USERDATA] Fehler', e); }
  }
}
function getDefaultUserdata(){
  return {
    examHistory: { user1: [], user2: [], user3: [] },
    mastery: { user1: {}, user2: {}, user3: {} },
    difficult: { user1: {}, user2: {}, user3: {} },
    errors: { user1: [], user2: [], user3: [] },
    // CB-Einstieg (02.09.2026): je Benutzer { modus:bool, aus:[IDs] }.
    // Ohne dieses Feld wuerde normalisiereUserdata() es beim ersten
    // Speichern stillschweigend wegwerfen - der Haken waere nach jedem
    // Neustart wieder aus.
    cb: { user1: {}, user2: {}, user3: {} },
    // QSL-Sammelalbum (06.09.2026): je Benutzer die verdienten Karten,
    // dazu das Rufzeichen, das auf ihnen steht - das gilt fuer alle
    // Benutzer gemeinsam, weil es am Geraet haengt, nicht am Lernstand.
    qsl: { user1: {}, user2: {}, user3: {}, rufzeichen: '' },
    // Die stille Messung (10.09.2026): je Benutzer die gewaehlten
    // Antworten mit Zeiten, und die geuebten Sekunden je Tag.
    diagnose:    { user1: {}, user2: {}, user3: {} },
    uebungszeit: { user1: {}, user2: {}, user3: {} },
    version: 2,
    updatedAt: new Date().toISOString()
  };
}
// FIX W9: Struktur-Validierung. Vorher wurde alles ungeprueft uebernommen -
// ein {"examHistory":"kaputt"} landete unveraendert in der Datei und machte
// die Struktur dauerhaft defekt.
const USER_IDS = ['user1','user2','user3'];
function istObjekt(x){ return x !== null && typeof x === 'object' && !Array.isArray(x); }

function normalisiereUserdata(roh){
  const sauber = getDefaultUserdata();
  if(!istObjekt(roh)) return sauber;
  const felder = [
    ['examHistory', 'array'],
    ['errors',      'array'],
    ['mastery',     'objekt'],
    ['difficult',   'objekt'],
    ['cb',          'objekt'],
    ['qsl',         'objekt'],
    ['diagnose',    'objekt'],
    ['uebungszeit', 'objekt']
  ];
  for(const [feld, art] of felder){
    if(!istObjekt(roh[feld])) continue;                 // falscher Typ -> Standard behalten
    for(const u of USER_IDS){
      const wert = roh[feld][u];
      if(art === 'array' && Array.isArray(wert))      sauber[feld][u] = wert;
      else if(art === 'objekt' && istObjekt(wert))    sauber[feld][u] = wert;
    }
  }
  // Das Rufzeichen steht neben den Benutzern und muss eigens
  // uebernommen werden - die Schleife oben kennt nur user1..user3.
  if(istObjekt(roh.qsl) && typeof roh.qsl.rufzeichen === 'string'){
    sauber.qsl.rufzeichen = roh.qsl.rufzeichen.slice(0, 12);
  }
  return sauber;
}

// FIX W8: Beschaedigte Datei nicht mehr stillschweigend durch leere Daten
// ersetzen. Vorher war nach einem abgebrochenen Schreibvorgang der komplette
// Lernverlauf weg - ohne jede Meldung.
function ladeAusDatei(fp){
  const raw = fs.readFileSync(fp, 'utf8');
  return normalisiereUserdata(JSON.parse(raw));
}

function loadUserdataFile(){
  ensureUserdataDir();
  const backupFp = USERDATA_FILE + '.bak';
  try{
    if(!fs.existsSync(USERDATA_FILE)){
      // Kein Hauptbestand - aber vielleicht eine Sicherung von letztem Mal?
      if(fs.existsSync(backupFp)){
        try{
          const wiederhergestellt = ladeAusDatei(backupFp);
          console.warn('[USERDATA] Hauptdatei fehlte - aus .bak wiederhergestellt.');
          saveUserdataFile(wiederhergestellt);
          return wiederhergestellt;
        }catch(e){ console.error('[USERDATA] .bak ebenfalls unlesbar:', e.message); }
      }
      const def = getDefaultUserdata();
      saveUserdataFile(def);
      console.log('[USERDATA] Datei angelegt:', USERDATA_FILE);
      return def;
    }
    return ladeAusDatei(USERDATA_FILE);
  }catch(e){
    console.error('[USERDATA] Hauptdatei defekt:', e.message);
    if(fs.existsSync(backupFp)){
      try{
        const wiederhergestellt = ladeAusDatei(backupFp);
        console.warn('[USERDATA] Aus Sicherung .bak wiederhergestellt - Lernverlauf gerettet.');
        return wiederhergestellt;
      }catch(e2){ console.error('[USERDATA] Sicherung ebenfalls defekt:', e2.message); }
    }
    // Letzte Rettung: defekte Datei beiseitelegen statt ueberschreiben,
    // damit sie notfalls von Hand repariert werden kann.
    try{
      const rettung = USERDATA_FILE + '.defekt-' + Date.now();
      fs.renameSync(USERDATA_FILE, rettung);
      console.error('[USERDATA] Defekte Datei gesichert als', path.basename(rettung));
    }catch(e3){ console.error('[USERDATA] Konnte defekte Datei nicht sichern:', e3.message); }
    return getDefaultUserdata();
  }
}

// FIX W8: Atomar schreiben statt direkt auf die Live-Datei.
// Vorher konnte ein Absturz oder Stromausfall mitten im writeFileSync
// halbfertiges JSON hinterlassen - der komplette Verlauf war dann weg.
// Jetzt: in .tmp schreiben, alten Stand als .bak sichern, dann umbenennen.
// rename ist auf demselben Laufwerk atomar, auch unter Windows/NTFS.
function saveUserdataFile(data){
  try{
    ensureUserdataDir();
    const sauber = normalisiereUserdata(data);
    sauber.updatedAt = new Date().toISOString();
    const tmpFp = USERDATA_FILE + '.tmp';
    const bakFp = USERDATA_FILE + '.bak';
    fs.writeFileSync(tmpFp, JSON.stringify(sauber, null, 2), 'utf8');
    if(fs.existsSync(USERDATA_FILE)){
      try{ fs.copyFileSync(USERDATA_FILE, bakFp); }
      catch(e){ console.warn('[USERDATA] Sicherung .bak fehlgeschlagen:', e.code||e.message); }
    }
    // Unter Windows scheitert rename, wenn das Ziel existiert -> vorher weg damit.
    try{ if(fs.existsSync(USERDATA_FILE)) fs.unlinkSync(USERDATA_FILE); }catch(e){ console.debug('[USERDATA] altes File nicht loeschbar:', e.code); }
    fs.renameSync(tmpFp, USERDATA_FILE);
    return true;
  }catch(e){
    console.error('[USERDATA] Fehler beim Speichern:', e);
    return false;
  }
}
// ================================================================
//  BLAETTERN - EIGENER STAND IN EIGENER DATEI     (05.09.2026)
// ================================================================
//  Dietmar: "Ich moechte, dass bei Blaettern / Weiterblaettern eine
//  JSON angelegt wird, die den Stand speichert, den man wieder
//  loeschen kann. Gespeichert werden: als gelernt markierte Fragen
//  ueber den Knopf 'Gelernt' und Fragen, die man weiterklickt."
//
//  WARUM EINE EIGENE DATEI UND NICHT EIN FELD IN amateurfunk_data.json:
//  Die grosse Datei ist der Lernstand - Verlauf, Lernfortschritt,
//  Lernbedarf. Sie wird gesichert, zurueckgeholt und beim Umzug
//  mitgenommen, und an ihr haengt viel. Der Blaetter-Stand ist etwas
//  anderes: ein Arbeitsbuch, das man wegwerfen koennen soll, ohne
//  Angst zu haben, dass am Lernstand etwas kaputtgeht. Zwei Dateien
//  heisst: Loeschen kann hier nichts anderes mitreissen.
//
//  Bis heute stand nur die zuletzt gesehene Frage im Browser-Speicher.
//  Das reichte, um weiterzumachen, beantwortete aber nicht die Frage,
//  die Dietmar wirklich hat: Was habe ich beim Durchgehen eigentlich
//  schon angesehen, und was davon habe ich abgehakt?
//
//  AUFBAU:
//    stand[benutzer][klasse] = {
//      lesezeichen: "VD730",     zuletzt gesehene Frage
//      gesehen:  ["VD101", ...]  durchgeklickt
//      gelernt:  ["VD105", ...]  ueber den Knopf abgehakt
//      begonnen: "2026-09-05T..." ,  zuletzt: "..."
//    }
//  Je Klasse getrennt, weil die Kataloge verschieden lang sind - eine
//  gemeinsame Liste waere wertlos.
// ================================================================
const BLAETTERN_FILE = path.join(USERDATA_DIR, 'blaettern.json');
// Obergrenze je Liste. Der laengste Katalog hat gut 1300 Fragen; 5000
// ist reichlich Luft und verhindert trotzdem, dass ein Fehler im Browser
// die Datei ins Uferlose treibt.
const BLAETTERN_MAX = 5000;

function blaetternLeer(){
  return { version: 1, stand: {}, updatedAt: new Date().toISOString() };
}
// Nur Zeichen, die in Fragenkennungen und Klassenkuerzeln vorkommen.
// Alles andere koennte als Schluessel Unfug anrichten.
function blaetternKuerzel(x){
  return (typeof x === 'string' && /^[A-Za-z0-9_.-]{1,40}$/.test(x)) ? x : null;
}
function blaetternListe(x){
  if(!Array.isArray(x)) return [];
  const raus = [];
  const gesehen = new Set();
  for(const e of x){
    const id = blaetternKuerzel(e);
    if(!id || gesehen.has(id)) continue;
    gesehen.add(id);
    raus.push(id);
    if(raus.length >= BLAETTERN_MAX) break;
  }
  return raus;
}
function blaetternSauber(roh){
  const sauber = blaetternLeer();
  if(!istObjekt(roh) || !istObjekt(roh.stand)) return sauber;
  for(const u of USER_IDS){
    const proBenutzer = roh.stand[u];
    if(!istObjekt(proBenutzer)) continue;
    for(const [klasse, eintrag] of Object.entries(proBenutzer)){
      const k = blaetternKuerzel(klasse);
      if(!k || !istObjekt(eintrag)) continue;
      if(!sauber.stand[u]) sauber.stand[u] = {};
      sauber.stand[u][k] = {
        lesezeichen: blaetternKuerzel(eintrag.lesezeichen) || '',
        gesehen: blaetternListe(eintrag.gesehen),
        gelernt: blaetternListe(eintrag.gelernt),
        begonnen: typeof eintrag.begonnen === 'string' ? eintrag.begonnen.slice(0, 40) : '',
        zuletzt:  typeof eintrag.zuletzt  === 'string' ? eintrag.zuletzt.slice(0, 40)  : ''
      };
    }
  }
  return sauber;
}
function blaetternLaden(){
  ensureUserdataDir();
  try{
    if(!fs.existsSync(BLAETTERN_FILE)) return blaetternLeer();
    return blaetternSauber(JSON.parse(fs.readFileSync(BLAETTERN_FILE, 'utf8')));
  }catch(e){
    // Anders als beim Lernstand wird hier NICHT beiseitegelegt und gewarnt:
    // Der Blaetter-Stand ist ein Arbeitsbuch. Eine kaputte Datei kostet
    // hoechstens die Lesezeichen, und ein leerer Anfang ist die richtige
    // Antwort darauf.
    console.warn('[BLAETTERN] Datei unlesbar, fange leer an:', e.message);
    return blaetternLeer();
  }
}
function blaetternSchreiben(daten){
  try{
    ensureUserdataDir();
    const sauber = blaetternSauber(daten);
    sauber.updatedAt = new Date().toISOString();
    const tmpFp = BLAETTERN_FILE + '.tmp';
    fs.writeFileSync(tmpFp, JSON.stringify(sauber, null, 2), 'utf8');
    try{ if(fs.existsSync(BLAETTERN_FILE)) fs.unlinkSync(BLAETTERN_FILE); }catch(e){}
    fs.renameSync(tmpFp, BLAETTERN_FILE);
    return true;
  }catch(e){
    console.error('[BLAETTERN] Speichern fehlgeschlagen:', e.message);
    return false;
  }
}

// ================================================================
//  NEUANFANG NACH EINER NEUINSTALLATION
// ================================================================
//  Dietmar am 01.09.2026, nachdem er den Ordner von Hand geloescht und
//  neu installiert hatte:
//
//    "Es sind meine kompletten Verlaeufe in Benutzer und alles andere
//     ist auch vorhanden. Das darf so nicht sein. Bei einer neuen
//     Installation muss alles weg sein."
//
//  Er hatte recht, und die Ursache liegt nicht im Ordner. Der Verlauf
//  steht an ZWEI Stellen: hier in data\userdata\ - und im Browser, im
//  localStorage. Der Browser haengt aber nicht am Programmordner,
//  sondern an der ADRESSE localhost:3000. Die ist nach einer
//  Neuinstallation dieselbe wie vorher. Also stand beim ersten Aufruf
//  wieder alles da, und die Seite hat es brav wieder hochgeladen.
//
//  Die Datei ist der Beweis dafuer, dass hier schon einmal gelernt
//  wurde. Fehlt sie beim Start, ist das ein frischer Ordner - und dann
//  bekommt die Seite einmal den Auftrag, auch ihre Seite aufzuraeumen.
//
//  Der Merker lebt nur in diesem Serverlauf. Beim naechsten Start ist
//  die Datei da (loadUserdataFile legt sie an), und die Sache ist von
//  selbst erledigt - sie kann sich nicht wiederholen.
const NEUANFANG_NOETIG =
  !fs.existsSync(USERDATA_FILE) && !fs.existsSync(USERDATA_FILE + '.bak');
let neuanfangOffen = NEUANFANG_NOETIG;   // Auskunft: genau einmal "ja"
if(NEUANFANG_NOETIG) console.log('[NEUANFANG] Frischer Ordner - der Browser wird einmal aufgeraeumt.');

ensureUserdataDir();
loadUserdataFile();

app.use((req, res, next) => {
    res.set('X-Accel-Buffering', 'no');
    res.set('Connection', 'keep-alive');
    res.set('Keep-Alive', 'timeout=60, max=100');
    next();
});

// ================================================================
// FIX W15: Der TTS-Cache wird beim Start NICHT mehr komplett geleert.
// Vorher war nach jedem Neustart jede Frage wieder 1-2 Sekunden langsam,
// obwohl die README ausdruecklich das Gegenteil verspricht ("danach ist
// die Antwort/Frage im Cache und wird sofort abgespielt"). Der Grund war
// eine einmalige Migration "fuer V15", die dauerhaft im Code stehen blieb.
//
// Stattdessen jetzt: Aufraeumen nach Groesse. Aeltere Dateien fliegen
// raus, sobald das Limit ueberschritten ist (das war der bei K5 noch
// offene Punkt "Cache-Groesse deckeln").
// ================================================================
const TTS_CACHE_MAX_MB = 200;

function ttsCacheAufraeumen(){
  try{
    const dateien = fs.readdirSync(TTS_CACHE_DIR)
      .filter(f => f.toLowerCase().endsWith('.wav'))
      .map(f => {
        const fp = path.join(TTS_CACHE_DIR, f);
        try{
          const st = fs.statSync(fp);
          return st.isFile() ? {fp, groesse: st.size, alter: st.mtimeMs} : null;
        }catch(e){ return null; }
      })
      .filter(Boolean);

    let gesamt = dateien.reduce((s,d)=>s+d.groesse, 0);
    const limit = TTS_CACHE_MAX_MB * 1024 * 1024;
    if(gesamt <= limit){
      if(dateien.length) console.log(`[CACHE] ${dateien.length} WAVs, ${(gesamt/1048576).toFixed(1)} MB - Cache bleibt erhalten.`);
      return;
    }
    dateien.sort((a,b)=>a.alter-b.alter);   // aelteste zuerst
    let geloescht = 0;
    for(const d of dateien){
      if(gesamt <= limit * 0.8) break;      // auf 80% herunterputzen
      try{ fs.unlinkSync(d.fp); gesamt -= d.groesse; geloescht++; }
      catch(e){ console.debug('[CACHE] konnte nicht loeschen:', e.code||e.message); }
    }
    console.log(`[CACHE] Limit ${TTS_CACHE_MAX_MB} MB ueberschritten - ${geloescht} alte WAVs entfernt.`);
  }catch(e){
    console.warn('[CACHE] Aufraeumen fehlgeschlagen:', e.code||e.message);
  }
}
ttsCacheAufraeumen();
setInterval(ttsCacheAufraeumen, 60*60*1000).unref();   // stuendlich nachsehen

// FIX Q7: expandTTS liegt jetzt in tts-expand.js (mit Testsuite)
const { expandTTS } = require('./tts-expand');

// ================================================================
//  WO LIEGT PIPER?
//  ----------------------------------------------------------------
//  Rueckmeldung eines Linux-Benutzers am 07.09.2026: "Bis auf die
//  Stimme laeuft es ja."
//
//  Und genau das stand hier: gesucht wurde ausschliesslich
//  piper/piper.exe. Auf Linux und am Mac heisst die Datei "piper",
//  ohne Endung - also wurde sie nie gefunden. Zurueck kam der
//  Notnagel {type:'python', path:'python'}, und der ging auf den
//  meisten heutigen Linux-Systemen ebenfalls ins Leere: Dort gibt es
//  nur "python3", ein blankes "python" existiert nicht mehr. Ergebnis:
//  ENOENT, Fehler 500, keine Stimme - und in der Meldung stand etwas
//  von einer fehlenden DLL und vom Visual-C++-Redistributable, was auf
//  einem Linux-Rechner niemandem weiterhilft.
//
//  Gesucht wird jetzt in dieser Reihenfolge:
//    1. im Ordner piper/ - unter dem Namen, den das jeweilige System
//       benutzt (piper.exe bzw. piper),
//    2. eine Ebene tiefer: Das offizielle Archiv entpackt sich als
//       Ordner "piper", wer es IN piper/ entpackt, hat piper/piper/piper,
//    3. auf dem Systempfad - wer piper ueber die Paketverwaltung oder
//       nach /usr/local/bin installiert hat, ist damit fertig,
//    4. zuletzt das Python-Modul, und dort mit dem Namen, den es auf
//       dem jeweiligen System wirklich gibt.
//
//  "quelle" wandert bis in die Anzeige: Wer keine Stimme hoert, soll
//  im Klartext lesen koennen, wonach gesucht wurde.
// ================================================================
function findPiper(){
  const win = process.platform === 'win32';
  const name = win ? 'piper.exe' : 'piper';
  const istDatei = (x) => { try{ return fs.existsSync(x) && fs.statSync(x).isFile(); }catch(e){ return false; } };

  const imOrdner = [ path.join(PIPER_DIR, name), path.join(PIPER_DIR, 'piper', name) ];
  for(const x of imOrdner) if(istDatei(x)) return { type:'binary', path:x, quelle:'Ordner piper/' };

  for(const d of String(process.env.PATH || '').split(path.delimiter)){
    if(!d) continue;
    const x = path.join(d, name);
    if(istDatei(x)) return { type:'binary', path:x, quelle:'Systempfad' };
  }

  return { type:'python', path: win ? 'python' : 'python3', quelle:'Python-Modul' };
}
function findVoices(dir,d=0){ if(d>3) return []; let r=[]; try{ if(!fs.existsSync(dir)) return []; const e=fs.readdirSync(dir,{withFileTypes:true}); for(const f of e){ const full=path.join(dir,f.name); if(f.isFile()&&f.name.endsWith('.onnx')&&fs.existsSync(full+'.json')) r.push(full); else if(f.isDirectory()&&f.name!=='espeak-ng-data') r=r.concat(findVoices(full,d+1)); } }catch(e){ console.debug('[TTS] Stimmen-Suche in', dir, ':', e.code||e.message); } return r; }
// ================================================================
// STIMMEN NACH QUALITAET SORTIEREN
//
// Grund: Die "low"- und "x_low"-Modelle sind mit 16000 Hz abgetastet.
// Damit ist bei 8000 Hz Schluss - genau dort, wo ein deutsches S seine
// Energie hat (Schwerpunkt gemessen bei 9000 Hz in der medium-Stimme).
// Der Zischlaut wird abgeschnitten, das S klingt dumpf und wie gelispelt.
// Die medium-Stimme laeuft mit 22050 Hz und spricht das S sauber aus.
//
// Vorher lieferte listVoices() die Dateien in der Reihenfolge des
// Ordners - also alphabetisch. Damit war "de_DE-eva_k-x_low.onnx" die
// erste und wurde als Standardstimme ausgeliefert: ausgerechnet das
// Modell mit der schlechtesten Aufloesung. Jetzt steht die beste Stimme
// oben, und die Abtastrate steht zur Auswahl mit dabei.
// ================================================================
const STIMM_STUFEN = { high: 4, medium: 3, low: 2, x_low: 1 };

function voiceQualitaet(onnxPfad){
  let rate = 0;
  try{
    const j = JSON.parse(fs.readFileSync(onnxPfad + '.json', 'utf8'));
    rate = (j.audio && j.audio.sample_rate) || 0;
  }catch(e){ /* ohne json keine Angabe - dann sortiert nur der Name */ }
  const name = path.basename(onnxPfad);
  const m = name.match(/-(x_low|low|medium|high)\.onnx$/i);
  const stufe = m ? m[1].toLowerCase() : '';
  return { rate, stufe, rang: STIMM_STUFEN[stufe] || 0 };
}

function listVoices(){
  try{
    return findVoices(PIPER_DIR)
      .map(p => {
        const f = path.basename(p);
        const q = voiceQualitaet(p);
        const khz = q.rate ? ' · ' + Math.round(q.rate/1000) + ' kHz' : '';
        // Hinweis direkt in der Auswahl, damit niemand versehentlich die
        // dumpfe Stimme nimmt.
        const warnung = (q.rate && q.rate < 22000) ? ' (dumpfes S)' : '';
        return { file: path.relative(PIPER_DIR,p).replace(/\\/g,'/'), fullPath: p,
                 label: f + khz + warnung, name: f, sampleRate: q.rate, _rang: q.rang };
      })
      .sort((a,b) => (b.sampleRate - a.sampleRate) || (b._rang - a._rang) || a.name.localeCompare(b.name));
  }catch{ return []; }
}

app.use((req,res,next)=>{ res.setHeader('Cache-Control','no-store, no-cache, must-revalidate, private'); next(); });

// ================================================================
// FIX Q9: Basis-Sicherheitsheader.
// Bewusst von Hand gesetzt statt per helmet-Paket - so bleibt die
// Abhaengigkeitsliste unveraendert und "npm install" muss nicht neu
// laufen, bevor der Trainer wieder startet.
// ================================================================
app.use((req,res,next)=>{
  res.setHeader('X-Content-Type-Options','nosniff');       // kein MIME-Sniffing
  res.setHeader('X-Frame-Options','SAMEORIGIN');           // kein Einbetten in fremde Seiten
  // HINWEIS zu "Fehler 153" im Video-Fenster: no-referrer war die Ursache -
  // YouTube liefert ohne Referrer keinen Player aus. Geloest ist das NICHT hier,
  // sondern gezielt am Video-iframe in Index.html (referrerpolicy-Attribut).
  // Nur dieser eine Frame meldet seine Herkunft, alles andere bleibt referrerlos.
  // Diese Zeile also bitte so lassen.
  res.setHeader('Referrer-Policy','no-referrer');          // Raumcode nicht an Dritte weiterreichen
  res.setHeader('X-Permitted-Cross-Domain-Policies','none');
  next();
});

// FIX Q9: CORS auf das beschraenken, was der Trainer wirklich braucht.
// origin:'*' erlaubte jeder beliebigen Webseite, die API anzusprechen.
// Die schreibenden Routen sind ohnehin durch localOnly geschuetzt (K3),
// das hier ist die zweite Verteidigungslinie.
// Chrome fragt bei Aufrufen aus dem offenen Netz an eine Adresse im lokalen
// Netz ("Private Network Access") zuerst mit einem Vorab-Request nach. Ohne
// diese Zustimmung blockiert es den Zugriff auf 127.0.0.1 - und genau darueber
// laeuft der Ordner-Abgleich, wenn jemand ueber den Einladungslink mitmacht.
//
// Achtung: Neuere Chrome-Fassungen verlangen zusaetzlich eine Zustimmung des
// Nutzers. Der Abgleich beim Start des eigenen Trainers braucht das alles
// nicht - er laeuft ohne Browser dazwischen und ist deshalb der verlaessliche
// Weg.
app.use((req,res,next)=>{
  if(req.headers['access-control-request-private-network']){
    res.setHeader('Access-Control-Allow-Private-Network','true');
  }
  next();
});

app.use(cors({
  origin: (origin, cb)=>{
    if(!origin) return cb(null, true);                     // gleiche Herkunft / direkter Aufruf
    if(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return cb(null, true);
    if(/^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/i.test(origin)) return cb(null, true);
    return cb(null, false);                                // ablehnen, aber ohne Fehler zu werfen
  },
  credentials: false
}));

// ---- Neuanfang: war der Ordner frisch? --------------------------
//
// Eine einzige Auskunft, mehr braucht es nicht. Der erste Entwurf hatte
// noch eine Gegenrichtung, ueber die die Seite ihren alten Stand als
// Sicherungsdatei ablieferte. Dietmar wollte das nicht: "Bei einer
// neuen Installation muss alles weg sein" heisst auch, dass hinterher
// kein Rest im Ordner liegt. Der Weg ist ersatzlos raus.
//
// localOnly: Ein Gast im Gruppenraum darf diese Antwort nie zu sehen
// bekommen. Sonst wuerde die frische Installation des Gastgebers dem
// Gast den Browser leerraeumen.
// ================================================================
// BEENDEN - der Trainer macht selbst Feierabend
// ================================================================
// Dietmar am 03.09.2026: "Es wird ein Exit-Button benoetigt, der
// node.js deaktiviert. Ich habe nach laengeren Pausen oefters ein
// Problem, weil node.js sich abschaltet."
//
// Bisher gab es zum Beenden nur STOP.bat - eine Datei im Ordner, die
// im laufenden Betrieb niemand sucht. Wer stattdessen einfach das
// Fenster zumachte, liess den Server weiterlaufen: unsichtbar, mit
// belegtem Port, und beim naechsten Start kam die Rueckfrage.
//
// localOnly: Ein Gast im Gruppenraum darf den Trainer des Gastgebers
// nicht ausschalten koennen. Das waere sonst der billigste Streich
// der Welt - Link aufrufen, Knopf druecken, Kursabend vorbei.
//
// Die Antwort geht ZUERST raus, erst danach faellt der Prozess. Sonst
// sieht der Browser nur eine abgerissene Leitung und meldet einen
// Fehler, obwohl alles genau so gelaufen ist, wie es sollte.
app.post('/api/beenden', localOnly, (req,res)=>{
  console.log('[BEENDEN] Ueber den Knopf im Trainer beendet.');
  res.json({ ok:true });
  setTimeout(()=>{
    try{ tunnelBeenden(); }catch(e){}
    process.exit(0);
  }, 400);
});

app.get('/api/neuanfang', localOnly, (req,res)=>{
  // Beantwortet ist beantwortet. Der Merker faellt HIER, nicht erst bei
  // der Quittung: Bricht die Seite mitten im Aufraeumen ab, passiert
  // beim naechsten Laden lieber gar nichts, als dass sie es noch einmal
  // versucht - und dabei die Arbeit von zwischendurch mitnimmt.
  const noetig = neuanfangOffen;
  neuanfangOffen = false;
  res.json({ noetig });
});

// FIX Q9: ausdrueckliches Body-Limit statt sich auf den Standard zu verlassen
//
// 25.09.2026: Der Lernstand bekommt mehr Luft. Dietmar: "Ich moechte den
// Verlauf anklickbar. Oeffne ich ihn, moechte ich meine Fehler sehen" -
// dafuer traegt jeder Verlaufseintrag jetzt seine Fehler mit. Der ganze
// Lernstand geht in EINER Anfrage an POST /api/userdata, und schon heute
// sind es mit einem einzigen Benutzer rund 100 KB (der Lernfortschritt
// allein 74 KB). Mit drei Benutzern waeren 256 KB bald erreicht - und
// dann wird still nicht mehr gesichert. Die groessere Grenze gilt nur
// fuer diese eine Adresse und nur am Trainer-PC selbst; alles andere,
// auch alles, was ueber den Einladungslink kommt, bleibt bei 256 KB.
const jsonAllgemein = express.json({limit:'256kb'});
const jsonLernstand = express.json({limit:'8mb'});
app.use((req, res, next) => {
  if(req.method === 'POST' && req.path === '/api/userdata' && isLocalRequest(req)) return jsonLernstand(req, res, next);
  return jsonAllgemein(req, res, next);
});

// FIX Q9/Q8: Fehlerhaftes JSON sauber beantworten statt mit einer
// HTML-Fehlerseite von Express (die vorher als 400 mit Stacktrace kam).
app.use((err, req, res, next)=>{
  if(err && err.type === 'entity.parse.failed'){
    console.warn('[HTTP] Ungueltiges JSON von', req.ip, 'an', req.originalUrl);
    return res.status(400).json({error:'Ungueltiges JSON im Request-Body'});
  }
  if(err && err.type === 'entity.too.large'){
    return res.status(413).json({error:'Request-Body zu gross (max. 256 KB)'});
  }
  return next(err);
});

// ================================================================
//  DIE ANFRAGEBREMSE                                    (22.09.2026)
//  ----------------------------------------------------------------
//  Dietmar, zur Fassung auf dem ThinkPad: "Ja, baue beides ein" -
//  eine Bremse je Adresse, "damit jemand mit einem Skript den Server
//  nicht lahmlegen kann".
//
//  Was ein Skript anrichten koennte, ohne eine einzige Luecke: den
//  Rechner mit Anfragen zudecken, oder - schlimmer fuer einen Anschluss
//  zu Hause - die Leitung nach oben vollziehen. Ein Seitenaufruf des
//  Trainers sind 6,6 MB (gemessen am 22.09.2026: 37 Anfragen, das
//  meiste sind erklaerungen.json und Index.html). Hundert Aufrufe in
//  der Minute waeren 660 MB, mehr als die meisten Anschluesse nach oben
//  schaffen. Dann ist der Trainer fuer alle anderen weg, ohne dass
//  jemand "gehackt" haette.
//
//  Deshalb vier Eimer je Adresse, nach dem Token-Bucket-Verfahren: Jeder
//  Eimer hat eine Groesse (das ist der erlaubte Schwall) und laeuft mit
//  fester Rate wieder voll. Was in den Eimer passt, geht durch; ist er
//  leer, gibt es 429 und "Retry-After".
//
//    Anfragen  900 Schwall, 300 je Minute   - ein OV-Abend mit 20 Leuten
//                                             hinter EINER Adresse laedt
//                                             20 x 37 = 740 Anfragen und
//                                             braucht danach ~200/min
//    Bytes     250 MB Schwall, 60 MB/min    - 20 x 6,6 MB = 132 MB
//    Vorlesen  60 Schwall, 40 je Minute     - jede Frage ein Piper-Lauf,
//                                             das kostet Rechenzeit
//    Paket     3 Schwall, 1 je 10 Minuten   - das ZIP wird im Speicher
//                                             gebaut, das ist teuer
//
//  Die Zahlen sind so gewaehlt, dass ein Vereinsabend hinter einem
//  gemeinsamen Anschluss nie anstoesst, ein Skript aber nach wenigen
//  Sekunden steht. Sie gelten NUR fuer Anfragen von aussen; der eigene
//  Rechner und das eigene Netz werden nie gebremst. Gezaehlt wird die
//  Adresse, die Cloudflare mitschickt (die oeffentliche des Besuchers).
//
//  Die Bytes werden NACH der Antwort abgezogen (man weiss vorher nicht,
//  wie gross sie wird) - der Eimer kann deshalb kurz ins Minus gehen.
//  Das ist gewollt: Die eine grosse Antwort geht noch raus, die
//  naechsten warten.
// ================================================================
const BREMSE = {
  anfragen: { schwall: 900,             proMinute: 300 },
  bytes:    { schwall: 250*1024*1024,   proMinute: 60*1024*1024 },
  vorlesen: { schwall: 60,              proMinute: 40 },
  paket:    { schwall: 3,               proMinute: 0.1 }
};
const bremseStand = new Map();   // Adresse -> { anfragen, bytes, vorlesen, paket, zuletzt, gemeldet }
const BREMSE_HOECHSTENS = 5000;  // mehr Adressen merkt sich die Bremse nicht

function bremseEimer(ip){
  let e = bremseStand.get(ip);
  const jetzt = Date.now();
  if(!e){
    if(bremseStand.size >= BREMSE_HOECHSTENS){
      // Voll - die aelteste Adresse fliegt raus. Wer so viele
      // Adressen mitbringt, hat andere Mittel als ein Skript.
      let aeltester = null, wann = Infinity;
      bremseStand.forEach((v, k) => { if(v.zuletzt < wann){ wann = v.zuletzt; aeltester = k; } });
      if(aeltester !== null) bremseStand.delete(aeltester);
    }
    e = { anfragen: BREMSE.anfragen.schwall, bytes: BREMSE.bytes.schwall,
          vorlesen: BREMSE.vorlesen.schwall, paket: BREMSE.paket.schwall,
          zuletzt: jetzt, gemeldet: 0 };
    bremseStand.set(ip, e);
    return e;
  }
  // Nachfuellen, anteilig zur verstrichenen Zeit, hoechstens bis zum Rand.
  const min = (jetzt - e.zuletzt) / 60000;
  if(min > 0){
    for(const k of ['anfragen','bytes','vorlesen','paket']){
      e[k] = Math.min(BREMSE[k].schwall, e[k] + min * BREMSE[k].proMinute);
    }
    e.zuletzt = jetzt;
  }
  return e;
}

// Abgelaufene Eintraege alle fuenf Minuten wegraeumen: Wer eine halbe
// Stunde nicht da war, hat sowieso wieder volle Eimer.
setInterval(function(){
  const grenze = Date.now() - 30*60*1000;
  bremseStand.forEach((v, k) => { if(v.zuletzt < grenze) bremseStand.delete(k); });
}, 5*60*1000).unref();

function bremseAntwort(req, res, was, sekunden){
  res.setHeader('Retry-After', String(sekunden));
  res.setHeader('Cache-Control', 'no-store');
  const ziel = String(req.headers['sec-fetch-dest'] || '').toLowerCase();
  const istSeite = (!ziel || ziel === 'document') && req.path.indexOf('/api/') !== 0;
  if(!istSeite) return res.status(429).json({ ok:false, gebremst:true, was: was, wartenSek: sekunden });
  res.status(429).type('html').send('<!DOCTYPE html><html lang="de"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">'
    + '<title>Amateurfunk-Trainer — kurz warten</title><style>'
    + 'body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;'
    + 'background:#0f172a;color:#e2e8f0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:24px;}'
    + '.k{max-width:520px;background:#1e293b;border:1px solid #334155;border-radius:14px;padding:30px 28px;}'
    + 'h1{margin:0 0 14px;font-size:1.3rem;color:#f1f5f9;} p{margin:0 0 14px;line-height:1.65;color:#cbd5e1;}'
    + '</style></head><body><div class="k"><h1>Einen Moment bitte</h1>'
    + '<p>Von deiner Adresse kamen gerade sehr viele Anfragen. Der Trainer läuft auf einem privaten '
    + 'Rechner und bremst deshalb kurz. In etwa ' + sekunden + ' Sekunden geht es weiter — einfach die Seite neu laden.</p>'
    + '</div></body></html>');
}

app.use((req, res, next) => {
  try{
    if(isLocalRequest(req)) return next();
    const ip = ipRoh(req) || 'unbekannt';
    const e = bremseEimer(ip);

    // Welche Eimer braucht diese Anfrage?
    const p = String(req.path || '');
    const eimer = ['anfragen'];
    if(p === '/api/tts' || p === '/api/tts-preview') eimer.push('vorlesen');
    if(p === '/api/projekt-paket') eimer.push('paket');

    for(const k of eimer){
      if(e[k] < 1 || (k === 'anfragen' && e.bytes < 0)){
        const leer = (k === 'anfragen' && e.bytes < 0) ? 'bytes' : k;
        // Wie lange, bis wieder etwas im Eimer ist? Beim Byte-Eimer bis
        // er wieder ueber Null steht.
        const fehlt = (leer === 'bytes') ? -e.bytes : (1 - e[leer]);
        const sek = Math.max(5, Math.min(600, Math.ceil(fehlt / BREMSE[leer].proMinute * 60)));
        if(Date.now() - e.gemeldet > 60000){
          e.gemeldet = Date.now();
          console.log('[BREMSE] ' + ipKuerzen(ip) + ' gebremst (' + leer + ' erschoepft), ' + sek + ' s Pause. ' + req.method + ' ' + p);
        }
        return bremseAntwort(req, res, leer, sek);
      }
    }
    for(const k of eimer) e[k] -= 1;

    // Die Bytes dieser Antwort mitzaehlen - was auch immer der Weg ist
    // (json, send, sendFile, static): alles laeuft ueber write/end.
    let gesendet = 0;
    const write0 = res.write, end0 = res.end;
    res.write = function(chunk){ try{ if(chunk) gesendet += Buffer.byteLength(chunk); }catch(x){} return write0.apply(this, arguments); };
    res.end   = function(chunk){ try{ if(chunk && typeof chunk !== 'function') gesendet += Buffer.byteLength(chunk); }catch(x){} return end0.apply(this, arguments); };
    res.on('finish', function(){ try{ e.bytes -= gesendet; }catch(x){} });
  }catch(err){ /* Die Bremse darf nie selbst zum Ausfall werden */ }
  next();
});

// ================================================================
//  DIE LAENDERSPERRE
//  ----------------------------------------------------------------
//  Dietmar am 21.09.2026, mit einer Liste voller Aufrufe aus Chicago
//  und Amsterdam: "diese Anklopfer gefallen mir gar nicht. Kann man da
//  nicht eine Sperre einbauen? Deutschland, Oesterreich und die
//  Schweiz? Ggf mit einer Anfrage?"
//
//  Die Anklopfer sind Zertifikat-Scanner (siehe die lange Erklaerung
//  weiter unten bei echt:false). Sie stehen in Rechenzentren, und die
//  stehen fast nie in DACH. Eine Laenderpruefung trifft sie deshalb
//  ziemlich genau - ohne dass ein einziger Funkamateur etwas merkt.
//
//  Cloudflare schickt das Herkunftsland bei jeder Anfrage mit
//  (cf-ipcountry). Es braucht also keinen fremden Dienst und keine
//  Datenbank im Ordner.
//
//  WER NIE GEPRUEFT WIRD:
//    - der Trainer-PC selbst,
//    - alles im eigenen WLAN (dort gibt es gar kein Herkunftsland),
//    - die Vorschau-Crawler beim Teilen (sonst gaebe es in Facebook
//      und WhatsApp keine Kachel mehr - die holen von US-Adressen),
//    - Suchmaschinen (Dietmar: "Den Google Bot haette ich schon ganz
//      gerne mit drin"),
//    - und wer von Dietmar freigegeben wurde.
//
//  Wer abgewiesen wird, bekommt keine tote Leitung, sondern eine
//  hoefliche Seite mit einem Knopf. Der Knopf meldet die Anfrage beim
//  Gastgeber, und der entscheidet im Besucherfenster.
// ================================================================
const LAENDER_FREI = ['DE', 'AT', 'CH'];

// Suchmaschinen sollen die Seite finden duerfen. Sie werden allerdings
// auch NICHT als Besucher gezaehlt - eine Kennung laesst sich faelschen,
// und wer sich als Googlebot ausgibt, soll sich damit hoechstens die
// Seite abholen, aber nicht in Dietmars Liste auftauchen.
//
// Seit dem 22.09.2026 auch die Leser der KI-Suchen. Dietmar, mit einer
// Google-KI-Antwort, die von "Umgehung von Laendersperren" sprach:
// "Google findet ihn nicht." Google selbst kommt als Googlebot und war
// schon drin. Aber die KI-Antworten von Google, OpenAI, Perplexity und
// Anthropic holen die Seite mit EIGENEN Kennungen und fast immer aus
// den USA - und bekamen bisher die Sperrseite. Wer die Seite fuer eine
// KI-Antwort liest, soll den Trainer sehen, nicht "nur fuer den
// deutschsprachigen Raum". Auch sie zaehlen nicht als Besucher.
const SUCHMASCHINEN = /googlebot|google-inspectiontool|storebot-google|googleother|google-cloudvertexbot|bingbot|adidxbot|duckduckbot|duckassistbot|yandex(bot|images)|baiduspider|slurp|sogou|exabot|ia_archiver|petalbot|seznambot|qwantify|ahrefsbot|semrushbot|oai-searchbot|chatgpt-user|gptbot|perplexitybot|perplexity-user|claudebot|claude-searchbot|claude-user|amazonbot|meta-externalagent|youbot|mistralai-user/i;

// Freigaben und Anfragen leben im Arbeitsspeicher - Dietmars Wunsch:
// "Bis zum Neustart". Damit gibt es keine neue Datei, nichts zu pflegen
// und nichts, was versehentlich ins Repository wandert.
const zutrittFrei     = new Map();   // volle IP -> Zeitpunkt der Freigabe
const zutrittAnfragen = new Map();   // volle IP -> { land, stadt, geraet, wann }
let   zutrittAbgewiesen = 0;         // nur eine Zahl, keine Liste

// ----------------------------------------------------------------
//  ANFRAGEN NUR VON DER SPERRSEITE                     (22.09.2026)
//  Dietmar: "Ich habe schon wieder Anfragen aus Singapur ueber
//  Windows."
//
//  Ein Mensch aus Singapur, der dreimal am Tag um Zutritt bittet, ist
//  unwahrscheinlich. Wahrscheinlich ist ein Scanner: Er holt die
//  Sperrseite, liest aus ihrem Skript die Adresse /api/zutritt-anfragen
//  heraus und schickt dorthin blind ein POST - so probieren solche
//  Programme jede Adresse durch, die sie finden. Und jedes dieser POSTs
//  stand als "Anfrage" im Besucherfenster.
//
//  Drei Riegel:
//    1. Die Sperrseite bekommt ein Kennwort mit, das nur zu der Adresse
//       passt, fuer die sie ausgeliefert wurde (HMAC aus einem Geheimnis,
//       das bei jedem Start neu gewuerfelt wird). Der Knopf schickt es
//       zurueck. Ein blindes POST hat es nicht - und legt keine Anfrage
//       an. Wer die Seite wirklich vor sich hat, merkt davon nichts.
//    2. Eine Anfrage, ueber die eine halbe Stunde lang niemand
//       entschieden hat, verfaellt. Die Sperrseite des Wartenden fragt
//       weiter nach; er kann jederzeit neu druecken.
//    3. Wer abgelehnt wurde, kann von derselben Adresse einen Tag lang
//       nicht noch einmal fragen. Vorher ging das jede Minute.
// ----------------------------------------------------------------
const ZUTRITT_GEHEIM      = crypto.randomBytes(32);
const ZUTRITT_VERFALL     = 30*60*1000;        // offene Anfrage: eine halbe Stunde
const ZUTRITT_ABLEHN_FRIST = 24*60*60*1000;    // nach Ablehnen: ein Tag Ruhe
const zutrittAbgelehnt = new Map();            // volle IP -> bis wann Ruhe
const zutrittBlind     = new Map();            // volle IP -> wann zuletzt gemeldet (blinde POSTs)

function zutrittKennwort(ip){
  return crypto.createHmac('sha256', ZUTRITT_GEHEIM).update(String(ip || '')).digest('hex').slice(0, 24);
}
function zutrittAufraeumen(){
  const jetzt = Date.now();
  zutrittAnfragen.forEach((v, ip) => {
    if(jetzt - v.wann > ZUTRITT_VERFALL){
      zutrittAnfragen.delete(ip);
      console.log('[ZUTRITT] Anfrage von ' + ipKuerzen(ip) + ' verfallen (30 Minuten ohne Entscheidung).');
    }
  });
  zutrittAbgelehnt.forEach((bis, ip) => { if(jetzt > bis) zutrittAbgelehnt.delete(ip); });
}
setInterval(zutrittAufraeumen, 60*1000).unref();

// ----------------------------------------------------------------
//  DIE SPERRE LAESST SICH AUSSCHALTEN                  (22.09.2026)
//  Dietmar: "Ich moechte die Laenderfilter auch ausschalten koennen."
//
//  Ein Schalter im Besucherfenster, neben dem fuer den Server. Aus
//  heisst: Jeder kommt herein, aus jedem Land, ohne Anfrage. Wer in
//  dem Moment noch auf der Sperrseite wartet, wird beim naechsten
//  Nachfragen (alle fuenf Sekunden) durchgelassen - die Seite laedt
//  von selbst neu. Seine offene Anfrage ist damit erledigt und
//  verschwindet aus der Liste des Gastgebers.
//
//  Nach jedem Start ist die Sperre wieder AN - wie die Tuer. Dietmars
//  Wahl: Ausschalten ist die Ausnahme fuer einen Abend, nicht die
//  Regel. Deshalb auch keine Datei dafuer.
//
//  Was beim Ausschalten NICHT passiert: Niemand wird dauerhaft
//  freigegeben. Geht die Sperre wieder an, gilt sie fuer alle, die
//  nicht aus DE/AT/CH kommen - auch fuer die, die zwischendurch drin
//  waren. Wer dann noch auf der Seite sitzt, behaelt seine Verbindung;
//  erst der naechste Seitenaufruf trifft wieder auf die Sperrseite.
// ----------------------------------------------------------------
let laenderSperreAn = true;

function ipRoh(req){
  return String(req.headers['cf-connecting-ip'] || req.ip || '').replace(/^::ffff:/i, '').trim();
}

function landErlaubt(req){
  const land = String(req.headers['cf-ipcountry'] || '').toUpperCase().slice(0, 2);
  // Kein Land bekannt? Dann kam die Anfrage nicht ueber Cloudflare -
  // also aus dem eigenen Netz. Die war noch nie das Problem.
  if(!land || land === 'XX' || land === 'T1') return true;
  return LAENDER_FREI.indexOf(land) !== -1;
}

// ----------------------------------------------------------------
//  DAS VORSCHAUBILD GEHOERT ALLEN                   (21.09.2026)
//  Dietmar, mit dem Facebook-Debugger: "Jetzt ist das Bild da, es
//  aendert sich aber nicht wenn ich Online bin." Beim Nachsehen im
//  Debugger stand alles richtig da - nur die Bildflaeche blieb grau.
//
//  Der Grund war meine eigene Laendersperre. Die Seite selbst kam
//  durch, weil der Crawler an seiner Kennung erkannt wird. Das BILD
//  holt Facebook aber in einem zweiten Anlauf, und dabei ist die
//  Kennung nicht immer dieselbe - kommt der Abruf dann von einer
//  US-Adresse, wurde er abgewiesen. Ergebnis: eine Kachel ohne Bild.
//
//  Ein Vorschaubild ist nichts Schuetzenswertes - es ist Werbung. Es
//  geht deshalb immer hinaus, aus jedem Land und unter jeder Kennung.
//  Dasselbe gilt fuer das Symbol der Seite, das manche Dienste in der
//  Kachel mit anzeigen.
// ----------------------------------------------------------------
const WACHE_BILDER = /^\/(vorschau(-raum)?\.jpg|favicon\.ico|icon(-192|-512|-512-maskierbar)?\.png|apple-touch-icon\.png)$/i;

// ----------------------------------------------------------------
//  EIN BILD DARF ZWISCHENGESPEICHERT WERDEN         (21.09.2026)
//  Dietmar, nach dem dritten Anlauf: "kein Bild!"
//
//  Gefunden wurde es mit einem Blick auf die Kopfzeilen des Bildes.
//  Das Bild selbst war in Ordnung - image/jpeg, 1200x630, 116 KB -,
//  aber darueber stand:
//
//      Cache-Control: no-store, no-cache, must-revalidate, private
//
//  Diese Zeile setzt der Trainer pauschal fuer ALLES. Fuer Lernstaende
//  und Fragenkataloge ist das richtig: nichts davon gehoert in fremde
//  Zwischenspeicher. Fuer ein Vorschaubild ist es toedlich. Facebook,
//  WhatsApp und die uebrigen holen es einmal ab und legen es in ihren
//  eigenen Speicher; "no-store, private" heisst fuer sie "behalte das
//  nicht", und daran halten sie sich. Ergebnis: eine Kachel ohne Bild.
//
//  Die Bilder aus WACHE_BILDER duerfen deshalb eine Stunde lang
//  zwischengespeichert werden. Geheim ist daran nichts - es ist
//  Werbung, sie soll ja gerade weitergetragen werden.
// ----------------------------------------------------------------
app.use((req, res, next) => {
  try{
    if(WACHE_BILDER.test(String(req.path || ''))){
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }catch(e){}
  next();
});

// ----------------------------------------------------------------
//  SCHRIFTEN, SYMBOLE, BILDER DUERFEN IM BROWSER BLEIBEN (22.09.2026)
//  Bei der Suchmaschinen-Pruefung aufgefallen: Auch Schriften, die
//  Symbolschrift, die Fragenbilder und die Klaenge standen unter
//  "no-store". Jeder Besucher holte sie bei jedem Aufruf neu - ueber
//  die Leitung nach oben des Anschlusses zu Hause. Googles
//  Geschwindigkeitspruefung (PageSpeed) wertet das ab.
//
//  Diese Dateien aendern sich praktisch nie. Schriften und die
//  Symbolschrift duerfen deshalb eine Woche im Browser bleiben, die
//  Fragenbilder und Klaenge einen Tag. "public" heisst ausserdem: Auch
//  Cloudflare darf sie vorhalten und muss sie nicht jedes Mal bei
//  diesem Rechner abholen.
//
//  Index.html, duo.js, die Fragen und alles unter /api/ bleiben bei
//  "no-store" - ein Update muss beim naechsten Laden sofort da sein.
// ----------------------------------------------------------------
app.use((req, res, next) => {
  try{
    const p = String(req.path || '').toLowerCase();
    if(p.indexOf('/fonts/') === 0 || p.indexOf('/fontawesome/') === 0){
      res.setHeader('Cache-Control', 'public, max-age=604800');
    } else if(p.indexOf('/svgs/') === 0 || p.indexOf('/sounds/') === 0 || p.indexOf('/formelsammlung/') === 0){
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }catch(e){}
  next();
});

function wacheDurchlaesst(req){
  if(isLocalRequest(req)) return true;
  if(WACHE_BILDER.test(String(req.path || ''))) return true;
  if(String(req.path || '').toLowerCase() === '/support.html') return true;   // s. tuerAufFuer
  const kennung = String(req.headers['user-agent'] || '');
  if(VORSCHAU_CRAWLER.test(kennung)) return true;
  if(SUCHMASCHINEN.test(kennung)) return true;
  if(!laenderSperreAn) return true;            // Schalter aus: jeder darf
  if(landErlaubt(req)) return true;
  if(zutrittFrei.has(ipRoh(req))) return true;
  return false;
}

// Diese beiden Wege muss auch ein Abgewiesener gehen duerfen - sonst
// koennte er seine Anfrage gar nicht erst stellen.
// ================================================================
//  DIE TUER: STEHT DER TRAINER NACH AUSSEN OFFEN?
//  ----------------------------------------------------------------
//  Dietmar am 22.09.2026: "Ich moechte in der Hauptansicht einen
//  Button. Nachdem wir eine feste Adresse haben, moechte ich den
//  Trainer online zur Verfuegung stellen, wenn der Button aktiviert
//  ist."
//
//  Bis gestern war das keine Frage: Der Quick Tunnel lief nur, wenn
//  man ihn startete. Seit cloudflared als Windows-Dienst laeuft, ist
//  der Trainer erreichbar, sobald er ueberhaupt laeuft - ohne dass
//  Dietmar das je entschieden haette.
//
//  Der Schalter holt diese Entscheidung zurueck. Nach jedem Start ist
//  zu (seine Wahl): Es soll nicht passieren, dass der Trainer ueber
//  Nacht offensteht, weil man es vergessen hat.
//
//  Absichtlich NICHT betroffen, auch bei geschlossener Tuer:
//    - der eigene Rechner und das eigene WLAN,
//    - die Vorschau-Crawler und die Vorschaubilder. Sonst zerfiele
//      die Facebook-Kachel jedes Mal, wenn zu ist - und die soll
//      gerade dann stimmen, wenn jemand den Beitrag findet.
//
//  Was Besucher bei geschlossener Tuer bekommen: den Code 503. Das
//  ist kein Zufall - genau darauf reagiert der Worker bei Cloudflare
//  und zeigt die Auffangseite mit dem Weg zur GitHub-Fassung. Wer
//  den Worker nicht eingerichtet hat, bekommt die schlichte Seite
//  weiter unten; beides sagt dasselbe.
// ================================================================
// support.html liegt nicht im Repository (sie nennt Dietmar als
// Verantwortlichen). Wer den Trainer selbst betreibt, hat sie nicht -
// dann gibt es auch keine Verweise darauf. (22.09.2026)
function supportSeiteDa(){
  try{ return fs.existsSync(path.join(__dirname, 'support.html')); }catch(e){ return false; }
}

let tuerOffen      = false;   // nach jedem Start zu
let tuerSchliesstUm = 0;      // 0 = kein Countdown laeuft

// ----------------------------------------------------------------
//  DER DAUERLAEUFER                                    (22.09.2026)
//  Dietmar: "Ich habe mehrere Lenovo ThinkPad und da moechte ich
//  einen als Server laufen lassen."
//
//  Auf einem Rechner, der nur Server ist, sitzt niemand davor, der
//  nach jedem Neustart auf "Server ein" klickt. START-SERVER.bat setzt
//  deshalb AFU_TUER=1, und dann ist die Tuer von Anfang an offen.
//  Alles andere bleibt: Der Schalter im Besucherfenster funktioniert
//  wie gehabt, die Laendersperre ist an, und ohne AFU_BROWSER gibt es
//  keinen Feierabend - der Trainer laeuft, bis ihn jemand beendet.
//  Auf dem Trainer-PC selbst aendert sich nichts: START.vbs setzt die
//  Variable nicht, dort bleibt es bei "nach jedem Start zu".
// ----------------------------------------------------------------
if(process.env.AFU_TUER === '1'){
  tuerOffen = true;
  console.log('[TUER] AFU_TUER=1 - der Trainer ist von Anfang an offen (Dauerlaeufer).');
}

function tuerGleichZu(){ return tuerSchliesstUm > 0 && Date.now() < tuerSchliesstUm; }

function tuerAufFuer(req){
  if(isLocalRequest(req)) return true;
  if(WACHE_BILDER.test(String(req.path || ''))) return true;
  // Support und Datenschutz gehen immer raus - auch bei geschlossener
  // Tuer. Wer vor verschlossener Tuer steht, soll nachlesen koennen,
  // wer hier wohnt und was mit seinen Daten geschieht. (22.09.2026)
  if(String(req.path || '').toLowerCase() === '/support.html') return true;
  // Die Zaehlerabfrage auch: Ueber sie gleicht der Worker bei Cloudflare
  // den Besucherzaehler der Auffangseite ab (23.09.2026). Bei zu-er Tuer
  // kam hier sonst 503, und der Abgleich blieb aus - genau dann, wenn
  // die Auffangseite die Zahl am dringendsten braucht. Herausgegeben
  // werden nur drei Zahlen.
  if(String(req.path || '') === '/api/besucherzahl') return true;
  const kennung = String(req.headers['user-agent'] || '');
  if(VORSCHAU_CRAWLER.test(kennung)) return true;
  if(SUCHMASCHINEN.test(kennung)) return true;
  if(tuerOffen) return true;
  if(tuerGleichZu()) return true;    // waehrend der Vorwarnung bleibt offen
  return false;
}

// ----------------------------------------------------------------
//  ROBOTS.TXT UND SITEMAP.XML                          (22.09.2026)
//  Dietmar: "Ich moechte den Trainer SEO optimieren." Beides gab es
//  nicht; robots.txt kam als 404 (Google liest das als "alles
//  erlaubt", aber auch als "der weiss nicht, was er tut"). Die Sitemap
//  nennt die zwei Seiten, die es gibt. Beide stehen VOR der Tuer und
//  der Laendersperre: Sie muessen immer herausgehen, sonst haelt Google
//  die Seite fuer weg. /api/ ist fuer Crawler tabu - dort ist nichts,
//  was in einen Index gehoert, und das Lebenszeichen soll kein Bot
//  ausloesen.
// ----------------------------------------------------------------
const SEO_ADRESSE = 'https://amateurfunk-trainer.com';
app.get('/robots.txt', (req, res) => {
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send('User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /socket.io/\nDisallow: /__auffang/\n\nSitemap: ' + SEO_ADRESSE + '/sitemap.xml\n');
});
app.get('/sitemap.xml', (req, res) => {
  let stand = '';
  try{ stand = fs.statSync(path.join(__dirname, 'Index.html')).mtime.toISOString().slice(0, 10); }catch(e){}
  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send('<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + '  <url><loc>' + SEO_ADRESSE + '/</loc>' + (stand ? '<lastmod>' + stand + '</lastmod>' : '') + '<changefreq>weekly</changefreq><priority>1.0</priority></url>\n'
    + (supportSeiteDa() ? '  <url><loc>' + SEO_ADRESSE + '/support.html</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>\n' : '')
    + '</urlset>\n');
});

app.use((req, res, next) => {
  try{
    if(req.path === '/api/tuer') return next();     // sonst kaeme der Gastgeber nicht mehr dran
    if(tuerAufFuer(req)) return next();
    const ziel = String(req.headers['sec-fetch-dest'] || '').toLowerCase();
    if((ziel && ziel !== 'document') || req.path.indexOf('/api/') === 0){
      return res.status(503).json({ ok:false, zu:true });
    }
    res.status(503).type('html').send(TUER_ZU_SEITE);
  }catch(e){ return next(); }
});

const TUER_ZU_SEITE = '<!DOCTYPE html><html lang="de"><head><meta charset="utf-8">'
  + '<meta name="viewport" content="width=device-width, initial-scale=1">'
  + '<meta name="robots" content="noindex">'
  + '<title>Amateurfunk-Trainer — gerade nicht offen</title><style>'
  + 'body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;'
  + 'background:#0f172a;color:#e2e8f0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:24px;}'
  + '.k{max-width:520px;background:#1e293b;border:1px solid #334155;border-radius:14px;padding:30px 28px;}'
  + 'h1{margin:0 0 14px;font-size:1.3rem;color:#f1f5f9;}'
  + 'p{margin:0 0 14px;line-height:1.65;color:#cbd5e1;font-size:0.97rem;}'
  + 'a{color:#7dd3fc;}'
  + '</style></head><body><div class="k">'
  + '<h1>Der Trainer ist gerade nicht geöffnet</h1>'
  + '<p>Der Amateurfunk-Trainer wird von einem privaten Rechner aus geteilt, und der '
  + 'Kursleiter hat gerade zu. Später noch einmal vorbeischauen lohnt sich.</p>'
  + '<p>Den Trainer gibt es auch zum Mitnehmen — kostenlos und ohne Anmeldung unter '
  + '<a href="https://amateurfunk-gruppe.github.io/Amateurfunk-Trainer/">'
  + 'amateurfunk-gruppe.github.io/Amateurfunk-Trainer</a>. Dann läuft er auf deinem '
  + 'eigenen Rechner, unabhängig von allen anderen.</p>'
  + (supportSeiteDa() ? '<p style="font-size:0.85rem;color:#94a3b8;margin:0;"><a href="/support.html">Support und Datenschutz</a></p>' : '')
  + '</div></body></html>';

// Auskunft und Schalter. localOnly: Das entscheidet nur der Gastgeber.
app.get('/api/tuer', localOnly, (req, res) => {
  let draussen = 0;
  try{ if(duoHausZahl) draussen = duoHausZahl(); }catch(e){}
  // Die Zahl der echten Besucher faehrt mit. Daran haengt seit dem
  // 22.09.2026 der Hinweiston: Vorher hing er an der Besucherabfrage im
  // Gruppenraum-Fenster, und die laeuft nur, solange ein Raum offen ist.
  // Wer nur den Server freigegeben hat, hoerte deshalb nichts.
  let echte = 0;
  try{ echte = besucherLesen().echte || 0; }catch(e){}
  // Sitzt gerade jemand im Gruppenraum? Danach richtet sich die Warnung
  // beim Zumachen: Wer einen Kurs laufen hat, soll nicht mit einem Klick
  // allen die Tuer vor der Nase zuziehen, ohne es zu merken.
  let imRaum = 0;
  try{ imRaum = duoTeilnehmerAnzahl(); }catch(e){}
  // sperre: der Schalter fuer die Laendersperre faehrt hier mit, damit
  // der Knopf im Besucherfenster im selben Takt stimmt wie der Server-
  // Schalter daneben - ohne eine zweite Abfrage.
  res.json({ offen: tuerOffen, schliesstUm: tuerGleichZu() ? tuerSchliesstUm : 0,
             draussen: draussen, echte: echte, imRaum: imRaum, sperre: laenderSperreAn,
             uhr: zsuStand() });
});

app.post('/api/tuer', localOnly, (req, res) => {
  const auf = String(req.query.auf || '') === '1';
  if(auf){
    // Macht der Gastgeber waehrend der Vorwarnung der Zeitschaltuhr
    // wieder auf, ist er offensichtlich da - dann ist die Uhr aus
    // (25.09.2026, siehe DIE ZEITSCHALTUHR).
    if(zeitschaltuhr.aktiv && zeitschaltuhr.gewarnt){
      zeitschaltuhr.aktiv = false;
      console.log('[ZEITSCHALTUHR] Aus - der Kursleiter hat den Server waehrend der Vorwarnung wieder geoeffnet.');
    }
    tuerOffen = true; tuerSchliesstUm = 0;
    tuerMelden(null);
    console.log('[TUER] Der Trainer ist jetzt offen.');
  } else {
    const sek = Math.max(0, Math.min(600, Number(req.query.sek || 60)));
    if(sek === 0) tuerZumachen();
    else tuerSchliessenIn(sek);
  }
  res.json({ ok:true, offen: tuerOffen, schliesstUm: tuerGleichZu() ? tuerSchliesstUm : 0 });
});

// Zumachen mit Countdown - die Besucher sehen den Balken "Der Gastgeber
// schliesst den Trainer in ...". Seit dem 25.09.2026 eine eigene
// Funktion, weil die Zeitschaltuhr sie auch braucht.
function tuerSchliessenIn(sek){
  tuerSchliesstUm = Date.now() + sek*1000;
  tuerMelden({ schliesstUm: tuerSchliesstUm });
  console.log('[TUER] Schliesst in ' + sek + ' Sekunden.');
  setTimeout(function(){
    if(tuerSchliesstUm && Date.now() >= tuerSchliesstUm - 200) tuerZumachen();
  }, sek*1000 + 250);
}

// ================================================================
//  DIE ZEITSCHALTUHR                                   (25.09.2026)
//  ----------------------------------------------------------------
//  Dietmar: "Ich moechte die Option, dass der Kursleiter eine bestimmte
//  Uhrzeit eingeben kann und dann der Server sich abschaltet und die
//  Option PC/Laptop beim Kursleiter sich herunterfaehrt. So kann der
//  Kursleiter den Trainer starten und zum Beispiel zur Arbeit oder ins
//  Bett gehen." Auf die Rueckfragen: zwei Moeglichkeiten - "Server aus"
//  und "Server aus und PC herunterfahren" -, eingestellt in einem
//  kleinen Fenster neben dem Server-Schalter im Besucherfenster, zum
//  Ein- und Ausschalten; die Besucher 5 Minuten vorher warnen.
//
//  Die Uhr laeuft hier im Server, nicht im Browser: Sie soll auch dann
//  schalten, wenn am Trainer-PC kein Fenster mehr offen ist.
//    - 5 Minuten vorher: Steht die Tuer offen, beginnt der gewohnte
//      Countdown - die Besucher sehen den Balken "Der Gastgeber
//      schliesst den Trainer in ...".
//    - Zur Uhrzeit: Tuer zu. Bei "PC herunterfahren" danach der Befehl
//      ans Betriebssystem, mit einer Minute Vorlauf; unter Windows zeigt
//      Windows das selbst an. In dieser Minute laesst es sich im
//      Trainer abbrechen.
//    - Die Uhr schaltet einmal und ist danach aus. Macht der Gastgeber
//      waehrend der Vorwarnung wieder auf, ist sie ebenfalls aus.
//    - Nur im Arbeitsspeicher: Nach einem Neustart ist sie aus. Ein
//      Trainer, der nach einem Absturz neu startet, soll nicht
//      ueberraschend den Rechner herunterfahren.
//  Die Uhrzeit gilt nach der Uhr dieses Rechners - liegt sie heute schon
//  zurueck, ist morgen gemeint.
// ================================================================
let zeitschaltuhr = { aktiv: false, um: 0, aktion: 'server', gewarnt: false };
let pcHerunter = { um: 0, uhr: null };        // laeuft gerade der Vorlauf zum Herunterfahren?
const ZSU_VORWARNUNG = 5 * 60 * 1000;
const PC_VORLAUF_SEK = 60;

function zsuNaechsterZeitpunkt(hhmm){
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || '').trim());
  if(!m) return 0;
  const h = Number(m[1]), min = Number(m[2]);
  if(h > 23 || min > 59) return 0;
  const d = new Date();
  d.setHours(h, min, 0, 0);
  if(d.getTime() <= Date.now() + 30 * 1000) d.setDate(d.getDate() + 1);
  return d.getTime();
}
function zsuStand(){
  return { aktiv: zeitschaltuhr.aktiv, um: zeitschaltuhr.aktiv ? zeitschaltuhr.um : 0,
           aktion: zeitschaltuhr.aktion, herunterUm: pcHerunter.um || 0 };
}

// Den Rechner herunterfahren - mit einer Minute Vorlauf. Unter Windows
// zaehlt Windows selbst herunter und zeigt eine Meldung ("shutdown /s
// /t 60"); abbrechen: "shutdown /a". Unter Linux und macOS wartet der
// Trainer die Minute selbst ab und gibt erst dann den Befehl.
function pcHerunterfahren(){
  const { execFile } = require('child_process');
  try{ besucherSchreiben(true); }catch(e){}
  pcHerunter.um = Date.now() + PC_VORLAUF_SEK * 1000;
  const fehler = function(err){
    if(err){
      pcHerunter.um = 0;
      console.warn('[ZEITSCHALTUHR] Herunterfahren nicht moeglich: ' + err.message);
    }
  };
  if(process.platform === 'win32'){
    execFile('shutdown', ['/s', '/t', String(PC_VORLAUF_SEK), '/c',
      'Amateurfunk-Trainer, Zeitschaltuhr: Der PC wird in einer Minute heruntergefahren.'],
      { windowsHide: true }, fehler);
  } else {
    pcHerunter.uhr = setTimeout(function(){
      pcHerunter.uhr = null;
      if(process.platform === 'darwin'){
        execFile('osascript', ['-e', 'tell application "System Events" to shut down'], fehler);
      } else {
        execFile('systemctl', ['poweroff'], fehler);
      }
    }, PC_VORLAUF_SEK * 1000);
  }
  console.log('[ZEITSCHALTUHR] Der PC wird in ' + PC_VORLAUF_SEK + ' Sekunden heruntergefahren.');
}
function pcHerunterfahrenAbbrechen(){
  if(!pcHerunter.um) return false;
  pcHerunter.um = 0;
  if(pcHerunter.uhr){ clearTimeout(pcHerunter.uhr); pcHerunter.uhr = null; }
  if(process.platform === 'win32'){
    try{ require('child_process').execFile('shutdown', ['/a'], { windowsHide: true }, function(){}); }catch(e){}
  }
  console.log('[ZEITSCHALTUHR] Herunterfahren abgebrochen.');
  return true;
}

function zsuTakt(){
  // Der Vorlauf zum Herunterfahren ist vorbei - dann ist auch die Anzeige vorbei.
  if(pcHerunter.um && Date.now() > pcHerunter.um + 30 * 1000) pcHerunter.um = 0;
  if(!zeitschaltuhr.aktiv) return;
  const jetzt = Date.now(), um = zeitschaltuhr.um;
  if(!zeitschaltuhr.gewarnt && jetzt >= um - ZSU_VORWARNUNG){
    zeitschaltuhr.gewarnt = true;
    if(tuerOffen && !tuerGleichZu()){
      const sek = Math.max(1, Math.round((um - jetzt) / 1000));
      console.log('[ZEITSCHALTUHR] Vorwarnung an die Besucher.');
      tuerSchliessenIn(sek);
    }
  }
  if(jetzt >= um){
    zeitschaltuhr.aktiv = false;
    if(tuerOffen || tuerGleichZu()) tuerZumachen();
    console.log('[ZEITSCHALTUHR] Es ist so weit - Server aus'
              + (zeitschaltuhr.aktion === 'pc' ? ', der PC faehrt herunter.' : '.'));
    if(zeitschaltuhr.aktion === 'pc') pcHerunterfahren();
  }
}
setInterval(zsuTakt, 5000);

// Stellen und Ausschalten. localOnly: Das entscheidet nur der Gastgeber.
//   an=1&uhrzeit=HH:MM&aktion=server|pc   stellen
//   an=0                                  ausschalten
app.post('/api/zeitschaltuhr', localOnly, (req, res) => {
  const an = String(req.query.an || '') === '1';
  if(!an){
    if(zeitschaltuhr.aktiv) console.log('[ZEITSCHALTUHR] Ausgeschaltet.');
    zeitschaltuhr.aktiv = false;
    return res.json({ ok: true, uhr: zsuStand() });
  }
  const um = zsuNaechsterZeitpunkt(req.query.uhrzeit);
  if(!um) return res.status(400).json({ ok: false, fehler: 'Bitte eine Uhrzeit wie 23:30 angeben.' });
  const aktion = String(req.query.aktion || '') === 'pc' ? 'pc' : 'server';
  zeitschaltuhr = { aktiv: true, um: um, aktion: aktion, gewarnt: false };
  const d = new Date(um);
  console.log('[ZEITSCHALTUHR] Gestellt auf ' + String(d.getHours()).padStart(2, '0') + ':'
            + String(d.getMinutes()).padStart(2, '0') + ' - '
            + (aktion === 'pc' ? 'Server aus und PC herunterfahren.' : 'Server aus.'));
  res.json({ ok: true, uhr: zsuStand() });
});
app.post('/api/zeitschaltuhr/abbrechen', localOnly, (req, res) => {
  res.json({ ok: true, abgebrochen: pcHerunterfahrenAbbrechen(), uhr: zsuStand() });
});

// ------------------------------------------------------------------
//  ZU HEISST ZU                                        (22.09.2026)
//  Dietmar, mit Bild: "Server zeigt 1 an obwohl er aus ist."
//
//  Die Tuer hielt bisher nur neue Anfragen auf. Wer schon auf der Seite
//  war, blieb per Socket verbunden - und zaehlte weiter als Besucher, mit
//  Chat und allem. Der weisse Knopf mit einer 1 daneben war die ehrliche
//  Anzeige eines unehrlichen Zustands.
//
//  Jetzt werden beim Zumachen die Verbindungen von aussen getrennt, und
//  der Handschlag weiter unten (io.use) laesst keine neue herein, solange
//  die Tuer zu ist. Wer drin sitzt, hat die Minute Vorwarnung gehabt.
// ------------------------------------------------------------------
function tuerZumachen(){
  tuerOffen = false; tuerSchliesstUm = 0;
  tuerMelden({ zu: true });
  let getrennt = 0;
  try{
    if(duoIo) duoIo.sockets.sockets.forEach(function(sock){
      try{ if(sock.data && sock.data.vonAussen){ sock.disconnect(true); getrennt++; } }catch(e){}
    });
  }catch(e){}
  console.log('[TUER] Zu.' + (getrennt ? ' ' + getrennt + ' Verbindung(en) von aussen getrennt.' : ''));
}

// Allen Verbundenen Bescheid sagen. null = Entwarnung.
function tuerMelden(a){
  try{
    if(!duoIo) return;
    duoIo.sockets.sockets.forEach(function(sock){ try{ sock.emit('tuerAnsage', a); }catch(e){} });
  }catch(e){}
}

const WACHE_OFFEN = ['/api/zutritt-anfragen', '/api/zutritt-stand'];

app.use((req, res, next) => {
  try{
    if(WACHE_OFFEN.indexOf(req.path) !== -1) return next();
    if(wacheDurchlaesst(req)) return next();

    zutrittAbgewiesen++;
    const land = String(req.headers['cf-ipcountry'] || '').toUpperCase().slice(0, 2);

    // Alles, was kein Seitenaufruf ist, bekommt eine kurze Absage. Eine
    // ganze HTML-Seite als Antwort auf ein fetch() waere nur Unsinn.
    const ziel = String(req.headers['sec-fetch-dest'] || '').toLowerCase();
    const istSeite = (!ziel || ziel === 'document');
    if(!istSeite || req.path.indexOf('/api/') === 0){
      return res.status(403).json({ ok:false, gesperrt:true, land: land });
    }

    // Bewusst 200 und nicht 403: Manche Browser zeigen bei einem Fehler-
    // code lieber ihre eigene Seite als unsere. Hier soll aber genau
    // unser Text stehen, samt Knopf.
    res.status(200).type('html').send(sperrSeite(land, ipRoh(req)));
  }catch(e){ return next(); }
});

function sperrSeite(land, ip){
  const wartet = zutrittAnfragen.has(ip);
  return '<!DOCTYPE html><html lang="de"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<meta name="robots" content="noindex">'
    + '<title>Amateurfunk-Trainer</title><style>'
    + 'body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;'
    + 'background:#0f172a;color:#e2e8f0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:24px;}'
    + '.k{max-width:520px;background:#1e293b;border:1px solid #334155;border-radius:14px;padding:30px 28px;}'
    + 'h1{margin:0 0 14px;font-size:1.35rem;color:#f1f5f9;}'
    + 'p{margin:0 0 14px;line-height:1.65;color:#cbd5e1;font-size:0.97rem;}'
    + '.z{font-size:0.85rem;color:#94a3b8;border-top:1px solid #334155;padding-top:14px;margin-top:20px;}'
    + 'a{color:#7dd3fc;}'
    + 'button{background:#2563eb;color:#fff;border:0;border-radius:9px;padding:12px 20px;'
    + 'font-size:0.97rem;cursor:pointer;font-family:inherit;}'
    + 'button:hover{background:#1d4ed8;} button:disabled{background:#475569;cursor:default;}'
    + '#m{margin-top:14px;font-size:0.9rem;color:#86efac;min-height:1.2em;}'
    + '</style></head><body><div class="k">'
    + '<h1>Der Trainer läuft gerade nur für den deutschsprachigen Raum</h1>'
    + '<p>Der Amateurfunk-Trainer wird von einem privaten Rechner aus geteilt. '
    + 'Damit die Leitung für die Funkamateure frei bleibt, für die er gedacht ist, '
    + 'nimmt er im Moment nur Aufrufe aus Deutschland, Österreich und der Schweiz an.</p>'
    + '<p>Du bist trotzdem willkommen — frag einfach kurz an. Der Kursleiter sieht die '
    + 'Anfrage sofort und kann dich freischalten. Diese Seite merkt es von selbst und lädt dann neu.</p>'
    + '<button id="b"' + (wartet ? ' disabled' : '') + '>'
    + (wartet ? 'Anfrage läuft …' : 'Zutritt anfragen') + '</button>'
    + '<div id="m">' + (wartet ? 'Deine Anfrage liegt beim Kursleiter.' : '') + '</div>'
    + '<p class="z">Den Trainer gibt es auch zum Mitnehmen — kostenlos und ohne Anmeldung '
    + 'unter <a href="https://amateurfunk-gruppe.github.io/Amateurfunk-Trainer/">amateurfunk-gruppe.github.io/Amateurfunk-Trainer</a>. '
    + 'Dann läuft er auf deinem eigenen Rechner, ganz ohne Sperre.'
    + (land ? '<br>Erkanntes Land: ' + htmlText(land) : '')
    + (supportSeiteDa() ? '<br><a href="/support.html">Support und Datenschutz</a>' : '') + '</p>'
    + '</div><script>'
    + 'var b=document.getElementById("b"),m=document.getElementById("m"),lauf=' + (wartet ? 'true' : 'false') + ';'
    + 'var k="' + zutrittKennwort(ip) + '";'
    + 'b.onclick=function(){b.disabled=true;b.textContent="Anfrage läuft …";'
    + 'fetch("/api/zutritt-anfragen",{method:"POST",headers:{"X-Zutritt":k}}).then(function(r){return r.json();})'
    + '.then(function(j){m.textContent=j&&j.ok?"Deine Anfrage liegt beim Kursleiter.":'
    + '"Das hat nicht geklappt. Versuch es in einer Minute noch einmal.";lauf=true;})'
    + '.catch(function(){m.textContent="Keine Verbindung zum Trainer.";b.disabled=false;'
    + 'b.textContent="Zutritt anfragen";});};'
    + 'setInterval(function(){fetch("/api/zutritt-stand",{cache:"no-store"})'
    + '.then(function(r){return r.json();}).then(function(j){if(j&&j.frei)location.reload();})'
    + '.catch(function(){});},5000);'
    + '<\/script></body></html>';
}

// Der Knopf auf der Sperrseite. Oeffentlich erreichbar - er MUSS es sein.
app.post('/api/zutritt-anfragen', (req, res) => {
  try{
    const ip = ipRoh(req);
    if(!ip) return res.status(400).json({ ok:false });
    if(zutrittFrei.has(ip)) return res.json({ ok:true, frei:true });

    // Riegel 1: ohne das Kennwort der Sperrseite keine Anfrage. Die
    // Antwort sieht aus wie ein Erfolg (ok:true) - ein Scanner soll
    // nicht erfahren, dass hier etwas geprueft wird. Im Fenster steht
    // es hoechstens einmal je Adresse und Stunde.
    const kennwort = String(req.headers['x-zutritt'] || '');
    if(kennwort !== zutrittKennwort(ip)){
      if(!zutrittBlind.has(ip) || Date.now() - zutrittBlind.get(ip) > 3600000){
        zutrittBlind.set(ip, Date.now());
        if(zutrittBlind.size > 500) zutrittBlind.clear();
        console.log('[ZUTRITT] Blindes POST ohne Sperrseite von ' + ipKuerzen(ip)
                  + ' (' + (String(req.headers['cf-ipcountry'] || '??').toUpperCase().slice(0, 2)) + ') - keine Anfrage angelegt.');
      }
      return res.json({ ok:true });
    }
    // Riegel 3: nach einer Ablehnung einen Tag Ruhe.
    const ruheBis = zutrittAbgelehnt.get(ip);
    if(ruheBis && Date.now() < ruheBis) return res.json({ ok:true, schon:true });

    const da = zutrittAnfragen.get(ip);
    // Zweimal druecken bringt nichts, und ein Skript soll die Liste des
    // Gastgebers nicht vollschreiben: eine Anfrage je Adresse und Minute.
    if(da && (Date.now() - da.wann) < 60000) return res.json({ ok:true, schon:true });
    // Mehr als 30 offene Anfragen sind kein Andrang, sondern ein Angriff.
    if(!da && zutrittAnfragen.size >= 30) return res.status(429).json({ ok:false });

    zutrittAnfragen.set(ip, {
      land:   String(req.headers['cf-ipcountry'] || '').toUpperCase().slice(0, 2),
      stadt:  kopfText(req.headers['cf-ipcity']).slice(0, 40),
      geraet: geraetArt(req.headers['user-agent']),
      wann:   Date.now()
    });
    console.log('[ZUTRITT] Anfrage von ' + ipKuerzen(ip)
              + ' (' + (zutrittAnfragen.get(ip).land || '??') + ').');
    res.json({ ok:true });
  }catch(e){ res.status(500).json({ ok:false }); }
});

// Die Sperrseite fragt im Takt nach, ob sie gehen darf. Ist die Sperre
// inzwischen ausgeschaltet, darf sie - ohne Freigabe fuer die Adresse.
app.get('/api/zutritt-stand', (req, res) => {
  res.json({ frei: !laenderSperreAn || zutrittFrei.has(ipRoh(req)) });
});

// Der Schalter. localOnly wie alles, was der Gastgeber entscheidet.
app.get('/api/laendersperre', localOnly, (req, res) => {
  res.json({ an: laenderSperreAn, anfragen: zutrittAnfragen.size, abgewiesen: zutrittAbgewiesen });
});
app.post('/api/laendersperre', localOnly, (req, res) => {
  const an = String(req.query.an || '') === '1';
  laenderSperreAn = an;
  if(!an){
    // Wer gerade wartet, kommt gleich von selbst herein (siehe
    // /api/zutritt-stand). Die Anfrage ist damit beantwortet.
    const n = zutrittAnfragen.size;
    zutrittAnfragen.clear();
    console.log('[ZUTRITT] Laendersperre AUS - jeder darf herein.'
              + (n ? ' ' + n + ' offene Anfrage(n) damit erledigt.' : ''));
  } else {
    console.log('[ZUTRITT] Laendersperre AN - nur DE, AT, CH und Freigegebene.');
  }
  res.json({ ok: true, an: laenderSperreAn });
});

// Freigeben und ablehnen darf nur der Gastgeber, an seinem eigenen PC.
app.post('/api/zutritt-freigeben', localOnly, (req, res) => {
  const ip = String(req.query.ip || '').trim();
  if(!ip) return res.status(400).json({ ok:false });
  zutrittFrei.set(ip, Date.now());
  zutrittAnfragen.delete(ip);
  console.log('[ZUTRITT] ' + ipKuerzen(ip) + ' freigegeben (bis zum Neustart).');
  res.json({ ok:true });
});

app.post('/api/zutritt-ablehnen', localOnly, (req, res) => {
  const ip = String(req.query.ip || '').trim();
  zutrittAnfragen.delete(ip);
  if(ip) zutrittAbgelehnt.set(ip, Date.now() + ZUTRITT_ABLEHN_FRIST);
  console.log('[ZUTRITT] Anfrage von ' + ipKuerzen(ip) + ' abgelehnt - von dort einen Tag lang keine neue.');
  res.json({ ok:true });
});

app.use('/svgs', express.static(path.join(__dirname,'svgs'),{setHeaders:(res,fp)=>{ if(fp.endsWith('.svg')) res.setHeader('Content-Type','image/svg+xml'); }}));

// ================================================================
// FIX K3/K4: Zugriffsschutz "nur lokal am Trainer-PC".
//
// WICHTIG zur Funktionsweise: cloudflared verbindet sich selbst nach
// http://localhost:3000. Fuer Anfragen aus dem Tunnel steht in req.ip
// deshalb ebenfalls 127.0.0.1 - eine reine IP-Pruefung waere wirkungslos.
// Cloudflare setzt aber am Edge zusaetzlich die Header cf-ray und
// cf-connecting-ip, die ein Client nicht entfernen kann. Nur wenn die
// Verbindung von 127.0.0.1 kommt UND keiner dieser Proxy-Header gesetzt
// ist, sitzt der Aufrufer wirklich am Rechner selbst.
// ================================================================
// ================================================================
// IP-ADRESSEN IM PROTOKOLL KUERZEN
// ================================================================
// Eine vollstaendige IP-Adresse ist ein personenbezogenes Datum. Im
// Trainerfenster steht sie ausserdem voellig ohne Not: Wer im
// Gruppenraum nachsehen will, welcher Rechner sich meldet, erkennt das
// an den ersten drei Bloecken genauso gut.
//
// Aus  47.64.50.123  wird  47.64.50.XXX
// Bei IPv6 bleiben die ersten vier Bloecke stehen, der Rest wird gekuerzt.
//
// Angeregt von Dietmar am 28.08.2026: "Die IP Adresse sollen nicht
// komplett angezeigt werden."
// ================================================================
//  UMLAUTE AUS DEN KOPFZEILEN                        (21.09.2026)
//  ----------------------------------------------------------------
//  Dietmar, mit einem Bild seiner Besucherliste: "Mit Umlaute
//  scheint es ein Problem zu geben." Dort stand "DA1/4sseldorf"
//  statt "Duesseldorf" - genauer: "D", dann "A" mit Schlange und
//  ein Bruchzeichen.
//
//  Das ist kein Fehler von Cloudflare, sondern eine Altlast des
//  HTTP-Protokolls. Kopfzeilen sind dort als Latin-1 festgelegt, ein
//  Zeichensatz mit 256 Plaetzen. Cloudflare schickt den Stadtnamen
//  aber als UTF-8, und darin besteht ein "ue" aus ZWEI Bytes. Node
//  liest die Kopfzeile normgetreu als Latin-1 und macht aus den zwei
//  Bytes zwei Zeichen - fertig ist der Buchstabensalat.
//
//  Rueckgaengig machen heisst: die Zeichen wieder als Bytes nehmen
//  und diesmal als UTF-8 lesen.
//
//  Vorsichtig, damit nichts kaputtgeht, was schon in Ordnung war:
//    - Reiner ASCII-Text ("Hamburg", "Berlin") wird nicht angefasst.
//    - Das Ergebnis wird geprueft. Kommt ein Ersetzungszeichen dabei
//      heraus, war die Kopfzeile eben doch echtes Latin-1 - dann
//      bleibt der Urtext stehen. Lieber ein Name mit Schoenheits-
//      fehler als einer aus Fragezeichen.
// ================================================================
function kopfText(roh){
  const t = String(roh || '');
  if(!/[\u0080-\u00FF]/.test(t)) return t;        // nichts Verdaechtiges drin
  try{
    const wieder = Buffer.from(t, 'latin1').toString('utf8');
    if(wieder.indexOf('\uFFFD') === -1) return wieder;
  }catch(e){}
  return t;
}

function ipKuerzen(roh){
  let ip = String(roh || '').trim();
  if(!ip) return 'unbekannt';
  ip = ip.replace(/^::ffff:/i, '');            // IPv4 im IPv6-Kleid
  // Der eigene Rechner ZUERST: Sonst wuerde aus 127.0.0.1 ein
  // 127.0.0.XXX - unnoetig verschleiert, und man erkennt nicht mehr,
  // dass die Anfrage vom Trainer-PC selbst kam. Genau das ist beim
  // Nachmessen aufgefallen.
  if(ip === '::1' || ip === '127.0.0.1') return ip;
  const v4 = ip.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3})\.\d{1,3}$/);
  if(v4) return v4[1] + '.XXX';
  if(ip.includes(':')){
    return ip.split(':').slice(0, 4).join(':') + ':...';
  }
  return ip;
}

// Woher kommt dieser Socket? Ueber den Tunnel setzt Cloudflare
// cf-connecting-ip; im eigenen Netz steht die Adresse in
// handshake.address. x-forwarded-for kann eine Kette sein - der erste
// Eintrag darin ist der urspruengliche Absender.
function socketIp(socket){
  try{
    const h = (socket && socket.handshake && socket.handshake.headers) || {};
    const kette = String(h['x-forwarded-for'] || '').split(',')[0].trim();
    const roh = h['cf-connecting-ip'] || kette || (socket.handshake && socket.handshake.address) || '';
    return String(roh).replace(/^::ffff:/i, '').trim() || 'unbekannt';
  }catch(e){ return 'unbekannt'; }
}

// ================================================================
// DARF AUF DIESE ADRESSE UEBERHAUPT EINE SPERRE?
// ================================================================
// DIE WICHTIGSTE ZEILE IM GANZEN SPERR-TEIL. Grund:
//
// cloudflared verbindet sich SELBST nach http://localhost:3000. Fuer
// jeden Gast aus dem Tunnel steht in handshake.address deshalb
// 127.0.0.1 - die echte Adresse steht nur im Kopf cf-connecting-ip.
// Fehlt der einmal (aelteres cloudflared, anderer Weg, Fehler im
// Netz), waere die "Adresse des Teilnehmers" 127.0.0.1.
//
// Eine Sperre darauf haette dann ALLE Gaeste ausgesperrt - und den
// Gastgeber gleich mit, denn sein eigener Browser kommt auch von
// 127.0.0.1. Ein Klick, und der Raum ist tot, ohne dass jemand
// versteht warum.
//
// Deshalb: Auf den eigenen Rechner wird nie gesperrt.
//
// UND AUCH NICHT AUF ADRESSEN AUS DEM EIGENEN NETZ. Dietmar am
// 28.08.2026: "blockieren nur bei einer oeffentlichen IP Adresse, nicht
// local im WLAN." Das ist richtig, und zwar aus zwei Gruenden:
//
//   Die Sperre ist fuer den Fall gedacht, dass jemand den Einladungslink
//   weitergegeben hat - der Unbekannte kommt dann ueber den Tunnel, also
//   mit einer oeffentlichen Adresse. Wer im selben WLAN sitzt, ist
//   dagegen im Raum nebenan: der Ortsverband, die VHS-Gruppe. Da klaert
//   man das durch Hinsehen und nicht durch eine Sperre.
//
//   Und: Adressen im eigenen Netz vergibt der Router (DHCP) immer wieder
//   neu. Die 192.168.1.42 von heute Nachmittag kann morgen frueh ein
//   ganz anderes Geraet sein. Eine Sperre darauf traefe irgendwann den
//   Falschen - und niemand kaeme darauf, warum.
//
// Statt einer Sperre, die zu viel oder das Falsche trifft, sagt der
// Trainer ehrlich, dass er hier nicht sperren kann.
//
// Rueckgabe: '' wenn sperrbar, sonst der Grund ('lokal' / 'unbekannt').
function sperrHindernis(ip){
  const a = String(ip || '').trim().toLowerCase();
  if(!a || a === 'unbekannt') return 'unbekannt';
  if(a === 'localhost' || a === '::1' || a === '::') return 'lokal';

  const v4 = a.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if(v4){
    const [x, y] = [Number(v4[1]), Number(v4[2])];
    if(x === 127) return 'lokal';                       // der Rechner selbst
    if(x === 10) return 'lokal';                        // 10.0.0.0/8
    if(x === 192 && y === 168) return 'lokal';          // 192.168.0.0/16
    if(x === 172 && y >= 16 && y <= 31) return 'lokal'; // 172.16.0.0/12
    if(x === 169 && y === 254) return 'lokal';          // selbst vergeben, ohne Router
    if(x === 0) return 'unbekannt';
    return '';                                          // oeffentlich - sperrbar
  }

  // IPv6: fc00::/7 sind die privaten Adressen, fe80::/10 die des eigenen
  // Netzstrangs. Beides ist "hier im Haus" und wird nicht gesperrt.
  if(/^f[cd]/.test(a)) return 'lokal';
  if(/^fe[89ab]/.test(a)) return 'lokal';
  if(a.includes(':')) return '';                        // oeffentliches IPv6

  return 'unbekannt';
}
function sperrbar(ip){ return sperrHindernis(ip) === ''; }

const PROXY_HEADERS = ['cf-ray','cf-connecting-ip','x-forwarded-for','x-forwarded-host','x-real-ip','forwarded'];
function isLocalRequest(req){
  const ip = String(req.ip||'').replace(/^::ffff:/,'');
  if(ip !== '127.0.0.1' && ip !== '::1') return false;
  return !PROXY_HEADERS.some(h => req.headers[h]);
}
// Anfragen, die der Browser eines Gastes voellig regulaer stellt: Die
// Seite ist dieselbe wie beim Gastgeber, also fragt sie auch nach dem
// Lernstand - und bekommt hier zu Recht ein Nein. Das ist der Normalfall
// und kein Vorfall.
//
// Bis zum 28.08.2026 stand dafuer bei JEDEM Beitritt mehrfach
// "[SEC] Externer Zugriff blockiert" samt vollstaendiger IP-Adresse im
// Fenster. Dietmar: "Ich habe mich darueber schon erschrocken das ich
// gehackt werde." Zu Recht - die Meldung klang nach einem Angriff und war
// doch nur der Schutz, der lautlos seine Arbeit tat.
const ERWARTET_ABGEWIESEN = [
  /^\/api\/userdata/,
  // Dasselbe fuer den Blaetter-Stand: Jede Seite fragt beim Laden danach,
  // auch die eines Gastes. Ein Nein ist hier der Normalfall.
  /^\/api\/blaettern/,
  // Jede Seite fragt beim Laden einmal nach - auch die eines Gastes im
  // Gruppenraum. Der bekommt ein Nein, und das ist genau richtig so.
  /^\/api\/neuanfang/,
  /^\/api\/abgleich\//,
  /^\/api\/github\//,
  /^\/api\/stimmen\//,
  /^\/api\/tunnel-status/,
  /^\/api\/tunnel-wache/
];
function localOnly(req,res,next){
  if(isLocalRequest(req)) return next();
  // Nur was WIRKLICH ungewoehnlich ist, kommt ins Fenster - und dann in
  // ruhigem Ton und mit gekuerzter Adresse.
  if(!ERWARTET_ABGEWIESEN.some(m => m.test(req.path))){
    console.log('[GRUPPENRAUM] Nur am Trainer-PC moeglich:', req.originalUrl,
                '- angefragt von', ipKuerzen(req.headers['cf-connecting-ip'] || req.ip));
  }
  return res.status(403).json({error:'Diese Funktion ist nur direkt am Trainer-PC verfuegbar.'});
}

// ================================================================
// PERSISTENTE DATEN API - 3 Benutzer: Verlauf, Lernfortschritt, Lernbedarf
// FIX K3: Nur noch lokal erreichbar. Vorher konnte jeder mit dem
// Einladungslink den kompletten Lernverlauf lesen, ueberschreiben und
// loeschen - und jede beliebige fremde Webseite konnte das per CSRF
// ausloesen, solange der Trainer lief.
// Nebeneffekt (gewollt): Teilnehmer aus dem Gruppenraum schreiben nicht
// mehr in die persoenliche Lerndatei des Gastgebers. Ihr Fortschritt
// bleibt wie bisher im localStorage ihres eigenen Browsers.
// ================================================================
app.get('/api/userdata', localOnly, (req,res)=>{
  try{
    const data = loadUserdataFile();
    res.json(data);
  }catch(e){ res.status(500).json({error: e.message}); }
});

// FIX W9: Zuordnung Feldname -> erwarteter Typ, fuer die Validierung unten.
// FEHLER VOM 13.09.2026: Hier fehlten diagnose und uebungszeit.
// Die stille Messung kam am 10.09.2026 dazu, und drei von vier Stellen
// wurden angefasst: getDefaultUserdata() kennt die Felder,
// normalisiereUserdata() kennt sie - aber DIESE Liste nicht, und das
// merged-Objekt in POST /api/userdata auch nicht. Folge: Der Browser
// schickte die Daten bei jedem Speichern mit, der Server baute sein
// merged-Objekt ohne sie, und normalisiereUserdata() setzte danach die
// leeren Standardwerte ein. Die Uebungszeit war also NIE gesichert -
// obwohl der Kommentar in getDefaultUserdata() genau das behauptete.
// Dietmar hat es gemerkt: "Mit der Uebungszeit stimmt was nicht."
const FELD_TYP = { examHistory:'array', errors:'array', mastery:'objekt', difficult:'objekt',
                   cb:'objekt', qsl:'objekt', diagnose:'objekt', uebungszeit:'objekt' };
const TYP_ALIAS = {
  history:'examHistory', examHistory:'examHistory',
  mastery:'mastery',     lernfortschritt:'mastery',
  difficult:'difficult', lernbedarf:'difficult',
  errors:'errors',
  cb:'cb',               cbEinstieg:'cb',
  qsl:'qsl',             sammelalbum:'qsl',
  diagnose:'diagnose',   messung:'diagnose',
  uebungszeit:'uebungszeit', zeit:'uebungszeit'
};

// ----------------------------------------------------------------
//  ZUSAMMENFUEHREN STATT ERSETZEN
// ----------------------------------------------------------------
//  Bei den anderen Feldern ist "der Browser hat recht" richtig: Er
//  haelt den vollstaendigen Stand. Bei diesen zwei nicht. Wer den
//  Trainer auf einem zweiten Rechner oeffnet oder die Browserdaten
//  loescht, schickt einen LEEREN Stand - und wuerde damit die
//  Sicherung ueberschreiben. Genau das darf bei Daten, die man nicht
//  nacherfassen kann, nicht passieren.
//
//  Uebungszeit: je Tag der groessere Wert. Ein Tag kann nur wachsen,
//  nie schrumpfen - also ist das Maximum immer der richtige Wert, und
//  nichts geht verloren.
function zeitVereinen(alt, neu){
  const aus = {};
  [alt, neu].forEach(q => {
    if(!istObjekt(q)) return;
    for(const tag of Object.keys(q)){
      const v = Number(q[tag]);
      if(!isFinite(v) || v <= 0) continue;
      if(!(aus[tag] > v)) aus[tag] = v;
    }
  });
  return aus;
}
//  Diagnose: je Frage gewinnt der Browser, weil er den laufenden
//  Stand hat. Fragen, die er nicht kennt, bleiben aus der Sicherung
//  stehen - so ueberlebt die Messung einen Rechnerwechsel.
function diagnoseVereinen(alt, neu){
  const aus = istObjekt(alt) ? Object.assign({}, alt) : {};
  if(istObjekt(neu)) for(const id of Object.keys(neu)) aus[id] = neu[id];
  return aus;
}
function jeBenutzerVereinen(alt, neu, wie){
  const aus = {};
  for(const u of USER_IDS){
    aus[u] = wie(istObjekt(alt) ? alt[u] : null, istObjekt(neu) ? neu[u] : null);
  }
  return aus;
}
function typPasst(wert, art){
  return art === 'array' ? Array.isArray(wert) : istObjekt(wert);
}

app.post('/api/userdata', localOnly, (req,res)=>{
  try{
    const incoming = req.body;
    if(!istObjekt(incoming)){
      return res.status(400).json({error: 'Kein gültiger Body'});
    }
    const current = loadUserdataFile();
    let merged;

    if(incoming.type && incoming.user && incoming.data !== undefined){
      // ---- Einzel-Update ----
      const feld = TYP_ALIAS[incoming.type];
      if(!feld){
        return res.status(400).json({error:`Unbekannter Typ "${incoming.type}"`});
      }
      if(!USER_IDS.includes(incoming.user)){
        // FIX W9: vorher wurde hier kommentarlos nichts gemacht und trotzdem
        // "ok:true" geantwortet - der Client hielt das Speichern fuer erfolgreich.
        return res.status(400).json({error:`Unbekannter Benutzer "${incoming.user}"`});
      }
      if(!typPasst(incoming.data, FELD_TYP[feld])){
        return res.status(400).json({error:`Feld "${feld}" muss ${FELD_TYP[feld]==='array'?'ein Array':'ein Objekt'} sein`});
      }
      merged = JSON.parse(JSON.stringify(current));
      merged[feld][incoming.user] = incoming.data;

    } else {
      // ---- Komplettes Objekt ----
      // FIX W9: Ein vorhandenes Feld mit falschem Typ wird jetzt ABGELEHNT.
      // Vorher wurde es uebernommen und beim naechsten Laden stillschweigend
      // durch leere Standarddaten ersetzt - der Lernverlauf war dann weg,
      // ohne dass irgendwo eine Meldung erschien.
      const fehler = [];
      for(const [feld, art] of Object.entries(FELD_TYP)){
        if(incoming[feld] === undefined) continue;         // nicht mitgeschickt -> alter Wert bleibt
        if(!istObjekt(incoming[feld])){ fehler.push(`${feld} muss ein Objekt mit user1/user2/user3 sein`); continue; }
        for(const u of USER_IDS){
          if(incoming[feld][u] !== undefined && !typPasst(incoming[feld][u], art)){
            fehler.push(`${feld}.${u} muss ${art==='array'?'ein Array':'ein Objekt'} sein`);
          }
        }
      }
      if(fehler.length){
        console.warn('[USERDATA] POST abgelehnt:', fehler.join('; '));
        return res.status(400).json({error:'Ungültige Datenstruktur', details: fehler});
      }
      merged = {
        examHistory: incoming.examHistory || current.examHistory,
        mastery:     incoming.mastery     || current.mastery,
        difficult:   incoming.difficult   || current.difficult,
        errors:      incoming.errors      || current.errors,
        cb:          incoming.cb          || current.cb,
        qsl:         incoming.qsl         || current.qsl,
        // Diese zwei werden zusammengefuehrt, nicht ersetzt - siehe
        // zeitVereinen() und diagnoseVereinen() oben.
        diagnose:    jeBenutzerVereinen(current.diagnose, incoming.diagnose, diagnoseVereinen),
        uebungszeit: jeBenutzerVereinen(current.uebungszeit, incoming.uebungszeit, zeitVereinen),
        version: 2,
        updatedAt: new Date().toISOString()
      };
    }

    if(!saveUserdataFile(merged)){
      return res.status(500).json({error:'Speichern fehlgeschlagen - siehe Server-Konsole'});
    }
    res.json({ok:true, data: merged});
  }catch(e){ console.error('[USERDATA] POST-Fehler:', e); res.status(500).json({error: e.message}); }
});

app.get('/api/userdata/:category', localOnly, (req,res)=>{
  try{
    const cat = req.params.category;
    const data = loadUserdataFile();
    if(cat==='verlauf' || cat==='history' || cat==='examHistory') return res.json({category:'verlauf', data: data.examHistory});
    if(cat==='lernfortschritt' || cat==='mastery') return res.json({category:'lernfortschritt', data: data.mastery});
    if(cat==='lernbedarf' || cat==='difficult') return res.json({category:'lernbedarf', data: data.difficult});
    if(cat==='fehler' || cat==='errors') return res.json({category:'fehler', data: data.errors});
    return res.status(404).json({error:'Unbekannte Kategorie'});
  }catch(e){ res.status(500).json({error: e.message}); }
});

// ---- Blaetter-Stand (siehe den Block bei BLAETTERN_FILE) ----------------
// localOnly wie alle Benutzerdaten: Wer ueber den Einladungslink mitmacht,
// schreibt nicht in fremde Ordner. Der Browser haelt dort seinen eigenen
// Stand, der Trainer-PC seinen.
app.get('/api/blaettern', localOnly, (req,res)=>{
  try{ res.json(blaetternLaden()); }
  catch(e){ res.status(500).json({error: e.message}); }
});

app.post('/api/blaettern', localOnly, (req,res)=>{
  try{
    const b = req.body;
    if(!istObjekt(b)) return res.status(400).json({error:'Kein gültiger Body'});
    if(!USER_IDS.includes(b.user)) return res.status(400).json({error:`Unbekannter Benutzer "${b.user}"`});
    const klasse = blaetternKuerzel(b.klasse);
    if(!klasse) return res.status(400).json({error:'Kein gültiges Prüfungsziel'});
    if(!istObjekt(b.stand)) return res.status(400).json({error:'stand muss ein Objekt sein'});

    const alles = blaetternLaden();
    if(!alles.stand[b.user]) alles.stand[b.user] = {};
    alles.stand[b.user][klasse] = b.stand;
    if(!blaetternSchreiben(alles)) return res.status(500).json({error:'Speichern fehlgeschlagen'});
    res.json({ok:true});
  }catch(e){ res.status(500).json({error: e.message}); }
});

// Loeschen: mit Klasse nur dieses Prüfungsziel, ohne Klasse alles von
// diesem Benutzer. Andere Benutzer bleiben in jedem Fall unberuehrt -
// am selben Rechner lernen mehrere.
app.delete('/api/blaettern/:user/:klasse?', localOnly, (req,res)=>{
  try{
    const user = req.params.user;
    if(!USER_IDS.includes(user)) return res.status(400).json({error:'Ungültiger Benutzer'});
    const alles = blaetternLaden();
    if(req.params.klasse){
      const k = blaetternKuerzel(req.params.klasse);
      if(!k) return res.status(400).json({error:'Ungültiges Prüfungsziel'});
      if(alles.stand[user]) delete alles.stand[user][k];
    } else {
      delete alles.stand[user];
    }
    if(!blaetternSchreiben(alles)) return res.status(500).json({error:'Speichern fehlgeschlagen'});
    res.json({ok:true});
  }catch(e){ res.status(500).json({error: e.message}); }
});

app.delete('/api/userdata/history/:user', localOnly, (req,res)=>{
  try{
    const user = req.params.user;
    if(!['user1','user2','user3'].includes(user)) return res.status(400).json({error:'Ungültiger Benutzer'});
    const data = loadUserdataFile();
    data.examHistory[user] = [];
    saveUserdataFile(data);
    res.json({ok:true});
  }catch(e){ res.status(500).json({error:e.message}); }
});


app.get('/svg-list.json',(req,res)=>{ try{ const fp=path.join(__dirname,'svg-list.json'); if(fs.existsSync(fp)){ res.setHeader('Content-Type','application/json'); res.send(fs.readFileSync(fp,'utf8')); } else res.status(404).json({error:'nicht gefunden'}); }catch(e){res.status(500).json({error:'Fehler'});} });
// ================================================================
// FIX W10: Fragenkatalog einmal laden statt bei jedem Zugriff.
// Vorher wurde fragen.json (395 KB) bei JEDER Raumerstellung und bei
// JEDEM /fragen.json-Aufruf synchron gelesen und geparst - das blockiert
// die Event-Loop und damit alle anderen Teilnehmer gleichzeitig.
// Die Datei wird nur neu gelesen, wenn sich ihr Zeitstempel geaendert hat,
// damit ein Austausch des Katalogs ohne Serverneustart weiter moeglich ist.
// ================================================================
const FRAGEN_FP = path.join(__dirname,'fragen.json');
let fragenCache = null;       // geparste Fragen
let fragenRohCache = null;    // Rohtext fuer die Auslieferung
let fragenMtime = 0;

function ladeFragen(){
  try{
    const st = fs.statSync(FRAGEN_FP);
    if(fragenCache && st.mtimeMs === fragenMtime) return fragenCache;
    const roh = fs.readFileSync(FRAGEN_FP, 'utf8');
    const daten = JSON.parse(roh);
    if(!Array.isArray(daten)) throw new Error('fragen.json enthaelt kein Array');
    fragenCache = daten;
    fragenRohCache = roh;
    fragenMtime = st.mtimeMs;
    console.log(`[FRAGEN] Katalog geladen: ${daten.length} Fragen`);
    return fragenCache;
  }catch(e){
    console.error('[FRAGEN] Katalog nicht ladbar:', e.message);
    return fragenCache;   // notfalls den letzten guten Stand behalten
  }
}
ladeFragen();

// Gepackt wie alles andere auch (siehe GEPACKT AUSLIEFERN weiter
// unten, 22.09.2026) - diese Route antwortet selbst und kaeme dort
// nie an. 434 KB werden so 62 KB.
let fragenGz = null;
app.get('/fragen.json',(req,res)=>{
  try{
    ladeFragen();
    if(!fragenRohCache) return res.status(404).json({error:'nicht gefunden'});
    res.setHeader('Content-Type','application/json');
    if(/\bgzip\b/i.test(String(req.headers['accept-encoding'] || ''))){
      if(!fragenGz || fragenGz.quelle !== fragenRohCache){
        fragenGz = { quelle: fragenRohCache, daten: zlib.gzipSync(Buffer.from(fragenRohCache), { level: 6 }) };
      }
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Vary', 'Accept-Encoding');
      res.setHeader('Content-Length', fragenGz.daten.length);
      return res.end(fragenGz.daten);
    }
    res.send(fragenRohCache);
  }catch(e){ console.error('[FRAGEN] Ausliefern fehlgeschlagen:', e.message); res.status(500).json({error:'Fehler'}); }
});
app.get('/api/tts-voices',(req,res)=>{
  const v = listVoices();
  // Zwei Dinge muessen stimmen, damit vorgelesen wird: die Stimmen UND das
  // Programm. Frueher stand hier nur die Stimmenliste - fehlte piper selbst,
  // sah alles richtig aus und es kam trotzdem kein Ton. Jetzt geht die Lage
  // des Programms mit, damit die Anzeige den Unterschied benennen kann.
  let piper = null;
  try{
    const p = findPiper();
    let da = (p.type === 'binary');
    if(!da){
      // Das Python-Modul laesst sich nicht am Dateisystem ablesen. Ob
      // wenigstens der Befehl existiert, schon.
      for(const d of String(process.env.PATH || '').split(path.delimiter)){
        if(!d) continue;
        const x = path.join(d, p.path + (process.platform === 'win32' ? '.exe' : ''));
        try{ if(fs.existsSync(x)){ da = true; break; } }catch(e){}
      }
    }
    piper = { gefunden: da, art: p.type, quelle: p.quelle, befehl: p.path, system: process.platform };
  }catch(e){ piper = null; }
  res.json({voices:v, default:v[0]?.file||'de_DE-thorsten-medium.onnx', piper: piper});
});

// ================================================================
// HOERBUCH: Fragen + richtige Antwort als MP3 fuers Autoradio.
// Der Stapelauftrag steht in hoerbuch.js - hier wird nur eingehaengt.
// Er bekommt genau das, was er braucht (Piper, Stimmenliste, Katalog),
// und nichts weiter; er kennt weder Gruppenraeume noch Lernstaende.
// ================================================================
let hoerbuchModul = null;
try{
  hoerbuchModul = require('./hoerbuch').einrichten({
    app, localOnly, projektOrdner: __dirname,
    PIPER_DIR, findPiper, listVoices, expandTTS, ladeFragen
  });
}catch(e){
  // Fehlt hoerbuch.js oder lame.js (z.B. altes ZIP), soll der Trainer
  // trotzdem starten - nur eben ohne Hoerbuch.
  console.warn('[HOERBUCH] nicht verfuegbar:', e.message);
}
app.get('/api/tunnel-url',(req,res)=>{
  try{
    // Nur URL zurückgeben wenn Tunnel wirklich läuft
    if(tunnelUrlCache && tunnelUrlCache.includes('trycloudflare.com') && tunnelProcess && !tunnelProcess.killed){
      // selbsttest MUSS hier mit raus - der Browser entscheidet daran, ob er den
      // Einladungslink schon herausgeben darf. Ohne dieses Feld blieb die Anzeige
      // ewig bei "Link wird geprueft...".
      return res.json({url:tunnelUrlCache, running:true, cached:true, selbsttest: tunnelSelbsttest});
    }
    const fp=path.join(__dirname,'tunnel_url.txt');
    const logFp=path.join(__dirname,'tunnel.log');
    const outFp=path.join(__dirname,'tunnel_out.log');
    let url=null;
    let source=null;
    if(fs.existsSync(fp)){ 
      const t=fs.readFileSync(fp,'utf8').trim(); 
      if(t && t.includes('trycloudflare.com')){ url=t; source='file'; }
    }
    if(!url && fs.existsSync(logFp)){
      const log=fs.readFileSync(logFp,'utf8');
      const m=log.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
      if(m){ url=m[0]; source='log'; }
    }
    if(!url && fs.existsSync(outFp)){
      const out=fs.readFileSync(outFp,'utf8');
      const m=out.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
      if(m){ url=m[0]; source='out'; }
    }
    if(url) tunnelUrlCache = url;
    const running = !!(tunnelProcess && !tunnelProcess.killed);
    const check = checkCloudflaredExists();
    // FIX K4: Lokale Dateipfade und Setup-Hinweise nur am Trainer-PC ausgeben.
    // Teilnehmer aus dem Tunnel bekommen nur noch die URL, die sie ohnehin
    // schon benutzen - keine Informationen ueber den Rechner des Gastgebers.
    if(!isLocalRequest(req)){
      return res.json({url:url||null, running:running, source:source, binaryExists:true});
    }
    res.json({
      url:url||null,
      running: running,
      source: source,
      binaryExists: check.exists,
      binaryPath: check.path,
      hint: check.hint||null,
      selbsttest: tunnelSelbsttest
    });
  }catch(e){ 
    console.error('[TUNNEL] /api/tunnel-url error', e);
    res.json({url:null, error:e.message, running:false}); 
  }
});

app.post('/api/start-tunnel', localOnly, async (req,res)=>{
  try{
    console.log('[API] /api/start-tunnel aufgerufen');
    const check = checkCloudflaredExists();
    if(!check.exists && check.path==='cloudflared'){
      console.warn('[API] cloudflared.exe fehlt, versuche trotzdem...');
    }
    const url = await startTunnelProcess();
    if(url){
      res.json({url, message:'Tunnel gestartet'});
    } else {
      res.status(500).json({url:null, error:'Konnte keine Tunnel-URL ermitteln. Prüfe ob cloudflared.exe vorhanden ist und Firewall es nicht blockiert.'});
    }
  }catch(e){
    console.error('[API] start-tunnel error', e);
    res.status(500).json({url:null, error:e.message});
  }
});

// ================================================================
// Lokale Netzwerkadresse(n) dieses Rechners.
//
// Fuer den haeufigsten Fall - alle sitzen im selben WLAN, im Clubheim oder
// zu Hause - braucht es gar keinen Cloudflare-Tunnel. Dann genuegt die
// Adresse im eigenen Netz, und man ist von keinem fremden Dienst, keiner
// DNS-Aufloesung und keiner Internetverbindung abhaengig.
// ================================================================
function lokaleAdressen(){
  const treffer = [];
  try{
    const netze = os.networkInterfaces();
    for(const [name, liste] of Object.entries(netze||{})){
      for(const eintrag of (liste||[])){
        if(eintrag.family !== 'IPv4' && eintrag.family !== 4) continue;
        if(eintrag.internal) continue;                       // 127.0.0.1 ueberspringen
        const ip = eintrag.address;
        if(/^169\.254\./.test(ip)) continue;                 // APIPA - kein echtes Netz
        // Private Bereiche zuerst, das sind die brauchbaren Heimnetz-Adressen
        const privat = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip);
        treffer.push({ip, name, privat});
      }
    }
  }catch(e){ console.warn('[NETZ] Adressen nicht ermittelbar:', e.message); }
  treffer.sort((a,b)=> (b.privat?1:0) - (a.privat?1:0));
  return treffer;
}

// ================================================================
// ABGLEICH: Haben alle Teilnehmer denselben Dateistand?
//
// Wichtig zum Verstaendnis: Teilnehmer haben KEINE eigene Kopie. Sie laden
// Index.html, duo.js und fragen.json bei jedem Seitenaufruf von diesem
// Rechner. Es gibt also nichts zu verteilen - es kann nur passieren, dass
// jemand die Seite seit einer Aenderung nicht neu geladen hat.
//
// Deshalb hier kein Datei-Update, sondern ein Fingerabdruck: Groesse und
// Zeitstempel der ausgelieferten Dateien ergeben eine kurze Kennung. Weicht
// die Kennung im Browser eines Teilnehmers von der aktuellen ab, hat er einen
// veralteten Stand offen - und wird darauf hingewiesen.
// ================================================================
const ABGLEICH_DATEIEN = ['Index.html','duo.js','fragen.json','video_map_embed.js','svg-list.json'];

function dateiStandErmitteln(){
  const teile = [];
  const dateien = {};
  for(const name of ABGLEICH_DATEIEN){
    try{
      const st = fs.statSync(path.join(__dirname, name));
      teile.push(`${name}:${st.size}:${Math.round(st.mtimeMs)}`);
      dateien[name] = { groesse: st.size, geaendert: new Date(st.mtimeMs).toISOString() };
    }catch(e){
      teile.push(`${name}:fehlt`);
      dateien[name] = null;
    }
  }
  const kennung = crypto.createHash('md5').update(teile.join('|')).digest('hex').slice(0,10);
  return { kennung, dateien };
}

// ================================================================
//  WELCHE VERSION LAEUFT HIER?           (05.09.2026)
// ================================================================
//  Dietmar: "Unter Update: 'Dieser Trainer laeuft mit dem Stand
//  2fe36d2d5e.' Kann man da nicht die Version anzeigen lassen? Ich
//  habe nur noch keine Idee dazu, woher man die Nr bekommt. Derzeit
//  habe ich eine exe mit der Versions Nr. 1.111.0 bei GitHub. Die
//  Version aendert sich aber, wenn ich einzelne Dateien in GitHub
//  einstelle."
//
//  Das ist der Kern der Sache: Es gibt DREI verschiedene Nummern, und
//  sie meinen Verschiedenes.
//
//    1. Die Nummer der DATEIEN in diesem Ordner.
//       Sie steht in der obersten Ueberschrift des CHANGELOG.md -
//       genau die Regel, nach der auch version.js und
//       Build-DIREKT.bat rechnen. Das CHANGELOG wandert mit den
//       Dateien; wer einzelne Dateien bei GitHub einstellt, stellt es
//       mit ein. Diese Nummer ist also immer die der Dateien, die
//       gerade laufen. DAS ist die Nummer, die hier gehoert.
//
//    2. Die Nummer der DATEIEN bei GitHub.
//       Dasselbe CHANGELOG, nur dort. Steht im Update-Fenster
//       daneben, sobald nachgesehen wurde.
//
//    3. Die Nummer des fertigen SETUPS bei GitHub - Dietmars 1.111.0.
//       Die aendert sich nur, wenn ein neues Setup gebaut und
//       hochgeladen wird. Dass sie hinterherhinkt, ist kein Fehler:
//       Wer sich das Setup heute herunterlaedt, bekommt eben den
//       Stand von damals und holt sich den Rest ueber das Update.
//
//  WARUM NICHT DIE package.json:
//  Sie wird nur beim Bauen gesetzt (version.js --setzen). Wer Dateien
//  einzeln weitergibt, ohne zu bauen, hat dort eine alte Zahl stehen -
//  in diesem Ordner stand 1.98.0, waehrend das CHANGELOG laengst bei
//  1.127.0 war. Eine Nummer, die man glauben soll, darf nicht von
//  einem Arbeitsschritt abhaengen, den man vergessen kann.
//
//  Die Kennung (der Zehnstellige aus Dateigroessen und Zeitstempeln)
//  bleibt - sie beantwortet eine andere Frage: ob zwei Ordner
//  buchstabengenau dasselbe enthalten. Sie steht jetzt klein daneben
//  statt gross davor.
// ================================================================
function versionAusText(text){
  for(const z of String(text || '').split('\n')){
    const t = z.match(/^##\s*\[(\d+\.\d+\.\d+)\]/);
    if(t) return t[1];                      // die erste ist die neueste
  }
  return null;
}

// Gelesen wird die Datei nur, wenn sie sich geaendert hat. Das
// CHANGELOG ist 60 KB gross, und /api/version wird von der Standwache
// jede Minute gefragt.
let _versionMerker = { zeit: 0, wert: null };
function programmVersion(){
  const fp = path.join(__dirname, 'CHANGELOG.md');
  try{
    const zeit = fs.statSync(fp).mtimeMs;
    if(_versionMerker.zeit === zeit) return _versionMerker.wert;
    const wert = versionAusText(fs.readFileSync(fp, 'utf8'));
    _versionMerker = { zeit, wert };
    return wert;
  }catch(e){
    // Kein CHANGELOG (aelteres Paket) - dann eben die package.json.
    try{ return JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')).version || null; }
    catch(e2){ return null; }
  }
}


// ================================================================
//  IST DAS RUFZEICHEN SCHON VERGEBEN?
//  ----------------------------------------------------------------
//  Dietmar am 06.09.2026: "Kann man das nicht indirekt abfragen?" -
//  und auf die Rueckfrage: "Nur vergeben und noch frei."
//
//  Die Rufzeichensuche der Bundesnetzagentur ist ein ASP.NET-Formular.
//  Aus dem Browser laesst sie sich nicht abfragen (fremde Herkunft), vom
//  Server hier aber schon. Der Ablauf ist der eines Menschen, der die
//  Seite benutzt:
//
//    1. Seite holen. Darin stecken versteckte Felder (__VIEWSTATE,
//       __EVENTVALIDATION ...) und ein Sitzungs-Cookie. Ohne sie weist
//       ASP.NET jede Eingabe zurueck.
//    2. Dieselben Felder zurueckschicken, dazu das Rufzeichen im
//       Suchfeld und den Namen des Suchknopfes.
//    3. In der Antwort nachsehen, ob eine Trefferzeile darin steht.
//
//  WAS HIER BEWUSST NICHT PASSIERT:
//  - Keine Namen, keine Adressen. Die stehen im Verzeichnis, gehen den
//    Trainer aber nichts an. Er beantwortet eine Ja-Nein-Frage.
//  - Kein Sammeln, kein Vorratsabruf. Eine Anfrage je Klick, und die
//    Antwort liegt hoechstens zehn Minuten im Speicher, damit ein
//    zweiter Klick die Behoerde nicht noch einmal behelligt.
//  - Nur vom Trainer-Rechner aus (localOnly). Sonst koennte jeder, der
//    den Einladungslink hat, ueber diesen Server Anfragen schicken.
//
//  UND ES KANN JEDERZEIT AUFHOEREN ZU FUNKTIONIEREN. Feldnamen und
//  Aufbau gehoeren der Seite, nicht uns. Deshalb raet dieser Code nichts:
//  Er liest die Feldnamen aus der Seite selbst, und wenn er sich nicht
//  sicher ist, sagt er "unklar" - dann oeffnet der Trainer wie vorher
//  die Seite zum Selbstnachsehen. Eine falsche Antwort waere schlimmer
//  als keine.
// ================================================================
// Die Bundesnetzagentur verlinkt ihre eigene Suche auf der Amateurfunk-
// Seite mit "http://", nicht mit "https://". Dietmar am 06.09.2026: "Es
// oeffnet sich die Webseite Not found." Genau so sieht es aus, wenn
// unter der verschluesselten Adresse ein anderer Server antwortet als
// unter der unverschluesselten.
//
// Deshalb wird nicht mehr geraten: Der Server probiert beide, nimmt die
// erste, die ein Suchformular liefert, und sagt dem Trainer, welche das
// war - der oeffnet im Notfall dann dieselbe.
const RUFZEICHEN_URLS = [
  'https://ans.bundesnetzagentur.de/Amateurfunk/Rufzeichen.aspx',
  'http://ans.bundesnetzagentur.de/Amateurfunk/Rufzeichen.aspx'
];
const RUFZEICHEN_URL = RUFZEICHEN_URLS[0];
const rufzeichenCache = new Map();          // RUFZEICHEN -> { vergeben, wann }
const RUFZEICHEN_CACHE_MS = 10 * 60 * 1000;

function rufzeichenFelder(html){
  // Alle versteckten Felder einsammeln - die muessen unveraendert zurueck.
  const felder = {};
  const re = /<input[^>]*type=["']hidden["'][^>]*>/gi;
  let m;
  while((m = re.exec(html)) !== null){
    const tag = m[0];
    const name = (tag.match(/name=["']([^"']+)["']/i) || [])[1];
    const wert = (tag.match(/value=["']([^"']*)["']/i) || [])[1];
    if(name) felder[name] = wert === undefined ? '' : entzerren(wert);
  }
  return felder;
}

function entzerren(s){
  return String(s)
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// Das Suchfeld und den Knopf nicht raten, sondern aus der Seite lesen.
function rufzeichenEingabefeld(html){
  const re = /<input[^>]*>/gi;
  let m, ersterText = null;
  while((m = re.exec(html)) !== null){
    const tag = m[0];
    const art = (tag.match(/type=["']([^"']+)["']/i) || [])[1] || 'text';
    const name = (tag.match(/name=["']([^"']+)["']/i) || [])[1];
    if(!name) continue;
    if(/hidden/i.test(art)) continue;
    if(/text/i.test(art)){
      if(!ersterText) ersterText = name;
      const id = (tag.match(/id=["']([^"']+)["']/i) || [])[1] || '';
      if(/rufzeichen|call/i.test(name + ' ' + id)) return name;
    }
  }
  return ersterText;
}

// Wohin das Formular geschickt wird, steht im Formular selbst. Meist
// ist es dieselbe Seite - verlassen sollte man sich darauf nicht.
function rufzeichenZiel(html, basis){
  const m = html.match(/<form[^>]*action=["']([^"']+)["']/i);
  if(!m) return basis;
  try{ return new URL(entzerren(m[1]), basis).toString(); }catch(e){ return basis; }
}

// Manche ASP.NET-Seiten haben statt eines Knopfes einen Link, der
// __doPostBack('name','') aufruft. Dann traegt man den Namen in
// __EVENTTARGET ein, statt einen Knopf mitzuschicken.
function rufzeichenPostbackZiel(html){
  const treffer = [...html.matchAll(/__doPostBack\(\s*['"]([^'"]+)['"]/g)].map(t => t[1]);
  const passend = treffer.find(t => /such|suche|start|abfrage|button/i.test(t));
  return passend || treffer[0] || null;
}

function rufzeichenKnopf(html){
  const re = /<input[^>]*type=["'](submit|image)["'][^>]*>/gi;
  let m;
  while((m = re.exec(html)) !== null){
    const tag = m[0];
    const name = (tag.match(/name=["']([^"']+)["']/i) || [])[1];
    const wert = (tag.match(/value=["']([^"']*)["']/i) || [])[1] || '';
    if(name && /such|suche|start|abfrage/i.test(name + ' ' + wert)) return { name, wert };
  }
  // Kein passender Knopf gefunden? Dann den ersten nehmen, den es gibt.
  const erster = html.match(/<input[^>]*type=["']submit["'][^>]*>/i);
  if(erster){
    const name = (erster[0].match(/name=["']([^"']+)["']/i) || [])[1];
    const wert = (erster[0].match(/value=["']([^"']*)["']/i) || [])[1] || '';
    if(name) return { name, wert };
  }
  return null;
}

// In der Antwort zaehlen, was in TABELLEN steht - und nur dort. Das
// Suchfeld enthaelt das eingetippte Rufzeichen naemlich auch, wenn es
// nichts gefunden hat; wer im ganzen Text sucht, findet es immer.
function rufzeichenTrefferAusTabellen(html, ruf){
  const tabellen = html.match(/<table[\s\S]*?<\/table>/gi) || [];
  const suchmuster = ruf.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '[A-Z0-9]');
  const re = new RegExp('(^|[^A-Z0-9])' + suchmuster + '([^A-Z0-9]|$)');
  let treffer = 0;
  tabellen.forEach(t => {
    const text = t.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').toUpperCase();
    if(re.test(text)) treffer++;
  });
  return treffer;
}

app.get('/api/rufzeichen', localOnly, async (req, res) => {
  const ruf = String(req.query.ruf || '').toUpperCase().replace(/[^A-Z0-9/*]/g, '').slice(0, 12);
  if(!ruf) return res.json({ ok:false, grund:'kein Rufzeichen' });

  const gemerkt = rufzeichenCache.get(ruf);
  if(gemerkt && (Date.now() - gemerkt.wann) < RUFZEICHEN_CACHE_MS){
    return res.json({ ok:true, ruf, vergeben:gemerkt.vergeben, ausDemSpeicher:true, seite:gemerkt.quelle || RUFZEICHEN_URL });
  }

  const abbruch = new AbortController();
  const wecker = setTimeout(() => abbruch.abort(), 12000);
  try{
    // Kopfzeilen wie ein gewoehnlicher Browser. Der erste Versuch am
    // 06.09.2026 lief mit einer eigenen Kennung - und wurde abgewiesen.
    // Viele Behoerdenseiten haengen hinter einem Schutzdienst, der
    // ungewohnte Kennungen aussortiert, bevor die Seite ueberhaupt
    // gefragt wird.
    const kopf = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                  + '(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      'Upgrade-Insecure-Requests': '1'
    };
    // Beide Adressen probieren, bis eine ein Formular liefert.
    let erst = null, html = '', quelle = '';
    const versuche = [];
    for(const kandidat of RUFZEICHEN_URLS){
      try{
        const r = await fetch(kandidat, { headers: kopf, redirect: 'follow', signal: abbruch.signal });
        const t = await r.text();
        versuche.push(kandidat.split(':')[0] + ' → ' + r.status + (/<form/i.test(t) ? ' (Formular)' : ' (kein Formular)'));
        if(r.ok && /<form/i.test(t) && /<input[^>]*hidden/i.test(t)){
          erst = r; html = t; quelle = r.url || kandidat;
          break;
        }
      }catch(e){
        versuche.push(kandidat.split(':')[0] + ' → ' + (e && e.message ? e.message : 'Fehler'));
      }
    }
    if(!erst) throw new Error('Suchseite nicht erreichbar [' + versuche.join(' | ') + ']');
    // Das Sitzungs-Cookie einsammeln. getSetCookie() gibt es erst ab
    // Node 20 - aeltere Fassungen liefern alle Cookies in EINER Zeile,
    // die dann von Hand zerlegt werden muss. Ohne Cookie weist ASP.NET
    // die Eingabe zurueck, und zwar ohne zu sagen, warum.
    let keksListe = [];
    try{
      if(typeof erst.headers.getSetCookie === 'function') keksListe = erst.headers.getSetCookie();
      else if(erst.headers.raw) keksListe = erst.headers.raw()['set-cookie'] || [];
      else {
        const eine = erst.headers.get('set-cookie');
        if(eine) keksListe = eine.split(/,(?=[^;]+?=)/);
      }
    }catch(e){ keksListe = []; }
    const kekse = keksListe.map(c => String(c).split(';')[0].trim()).filter(Boolean).join('; ');

    const felder = rufzeichenFelder(html);
    const feldName = rufzeichenEingabefeld(html);
    const knopf = rufzeichenKnopf(html);
    const ziel = rufzeichenZiel(html, quelle);
    if(!feldName || !Object.keys(felder).length){
      throw new Error('Suchformular nicht erkannt (Felder: ' + Object.keys(felder).length
                    + ', Suchfeld: ' + (feldName || 'keins') + ')');
    }

    const daten = new URLSearchParams();
    Object.keys(felder).forEach(k => daten.append(k, felder[k]));
    daten.set(feldName, ruf);
    if(knopf && knopf.name){
      daten.set(knopf.name, knopf.wert || 'Suchen');
    }else{
      // Kein Knopf im Formular - dann laeuft die Suche ueber einen Link.
      const postback = rufzeichenPostbackZiel(html);
      if(postback){ daten.set('__EVENTTARGET', postback); daten.set('__EVENTARGUMENT', ''); }
    }

    const zweit = await fetch(ziel, {
      method: 'POST',
      headers: Object.assign({}, kopf, {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': quelle,
        'Cache-Control': 'no-cache',
        'Origin': new URL(quelle).origin
      }, kekse ? { 'Cookie': kekse } : {}),
      body: daten.toString(),
      signal: abbruch.signal
    });
    if(!zweit.ok) throw new Error('Suche antwortet mit ' + zweit.status);
    const antwort = await zweit.text();

    const treffer = rufzeichenTrefferAusTabellen(antwort, ruf);
    const ohneTreffer = /(kein|keine)\s+(eintr|treffer|datens|ergebnis)/i.test(
      antwort.replace(/<[^>]+>/g, ' ')
    );

    let vergeben = null;
    if(treffer > 0) vergeben = true;
    else if(ohneTreffer) vergeben = false;
    else if(/<table/i.test(antwort)) vergeben = false;   // Ergebnisbereich da, aber ohne unser Rufzeichen
    if(vergeben === null) throw new Error('Antwort nicht eindeutig');

    rufzeichenCache.set(ruf, { vergeben, wann: Date.now(), quelle });
    return res.json({ ok:true, ruf, vergeben, seite: quelle });
  }catch(e){
    const grund = (e && e.name === 'AbortError')
      ? 'Zeitueberschreitung nach 12 Sekunden'
      : (e && e.message) || String(e);
    console.log('[RUFZEICHEN] Abfrage nicht moeglich:', grund);
    return res.json({ ok:false, ruf, grund, node:process.version, seite:RUFZEICHEN_URL });
  }finally{
    clearTimeout(wecker);
  }
});

// ================================================================
// DIE ZUORDNUNG VON 50 OHM
//
// Dietmar am 09.09.2026, nach einem Gespraech mit einem Entwickler
// von 50ohm.de: "Diesen Loesungsweg gibt es fuer alle Fragen. Hier
// aendert sich nur die Nr. hinten dran. … Ziel ist es, das man nicht
// nur auswendig lernt, sondern auch was lernt."
//
// Er hat dann selbst die entscheidende Adresse geliefert:
//     https://50ohm.de/assets/question_index.json
//
// Darin steht je Fragennummer, in welchem Kapitel und Abschnitt sie
// behandelt wird - und ob es einen Loesungsweg gibt (has_solution).
// Damit erledigen sich zwei Dinge auf einmal:
//
//   1. Der Loesungsweg unter https://50ohm.de/<Nummer>.html wird nur
//      dort angeboten, wo es ihn wirklich gibt. Vorher waere jeder
//      zweite Klick auf einer Fehlerseite gelandet - Dietmar: "Nicht
//      das es am Ende auf 404 laeuft."
//
//   2. Der vorhandene Knopf "Bei 50 Ohm nachlesen" fuehrt endlich auf
//      die GENAUE Seite statt auf die Kapiteluebersicht. In
//      50ohm_map.json steht seit Monaten der Satz: "Der Link fuehrt
//      auf die KAPITELUEBERSICHT … dafuer braucht es die Liste des
//      DARC. Sobald die da ist, ersetzt sie diese Datei vollstaendig."
//      Das ist jetzt so weit.
//
// GEHOLT WIRD NUR AUF KLICK. Der Trainer geht nicht von sich aus ins
// Netz - diese Zusage steht in der README und gilt auch hier.
//
// WARUM DIESE ROUTE HIER STEHT UND NICHT WEITER UNTEN
// Beim ersten Bau stand sie versehentlich INNERHALB von
// io.on('connection', ...) - also im Socket-Handler des Gruppenraums.
// Damit wurde sie erst angemeldet, wenn sich jemand ueber einen Raum
// verband, und danach bei jeder weiteren Verbindung noch einmal. Wer den
// Gruppenraum nie oeffnet, bekam auf den Knopf nur "Not found".
//
// Dietmar hat drei Neustarts lang gesucht, bevor /api/version zeigte,
// dass sein Server laengst der neue war. Routen gehoeren auf die oberste
// Ebene, wo sie einmal beim Start angemeldet werden - hierher.
// ================================================================
// Die eigentliche Arbeit - einmal geschrieben, zweimal gebraucht: vom Knopf
// unter Wartung und beim Start des Servers.
async function ohmIndexHolen(){
  const ziel = path.join(__dirname, '50ohm_index.json');
  {
    const roh = await new Promise((fertig, schief) => {
      const r = https.get({
        host: '50ohm.de', path: '/assets/question_index.json', timeout: 20000,
        headers: { 'User-Agent': 'Amateurfunk-Trainer (Lehrgangs-Zuordnung)' }
      }, ant => {
        if(ant.statusCode !== 200){
          ant.resume();
          return schief(new Error('50ohm.de antwortete mit ' + ant.statusCode));
        }
        let text = '', menge = 0;
        ant.setEncoding('utf8');
        ant.on('data', d => {
          menge += d.length;
          // Obergrenze: die Datei ist rund 200 KB. Was deutlich
          // groesser ankommt, ist nicht das, was wir erwarten.
          if(menge > 4 * 1024 * 1024){ ant.destroy(); return schief(new Error('Antwort zu gross')); }
          text += d;
        });
        ant.on('end', () => fertig(text));
      });
      r.on('timeout', () => { r.destroy(); schief(new Error('Zeitüberschreitung')); });
      r.on('error', e => schief(e));
    });

    const j = JSON.parse(roh);
    if(!j || typeof j !== 'object' || Array.isArray(j)) throw new Error('Unerwarteter Aufbau');

    // Nur uebernehmen, was wir auch brauchen - und nur, was wie eine
    // Fragennummer aussieht. Fremde Daten wandern nicht ungeprueft in
    // eine Datei, die der Trainer spaeter ausliefert.
    const schlank = {};
    let mitLoesung = 0;
    for(const [id, e] of Object.entries(j)){
      if(!/^[A-Z]{2}[0-9]{3}$/.test(id) || !e || typeof e !== 'object') continue;
      const eintrag = {
        k: String(e.chapter_title || '').slice(0, 120),
        a: String(e.section_title || '').slice(0, 120),
        s: String(e.section || '').replace(/[^a-z0-9_\-]/gi, '').slice(0, 80),
        e: Array.isArray(e.editions)
             ? e.editions.filter(x => /^[A-Z]{1,4}$/.test(String(x))).slice(0, 6)
             : []
      };
      if(e.has_solution === true){ eintrag.l = 1; mitLoesung++; }
      schlank[id] = eintrag;
    }
    const anzahl = Object.keys(schlank).length;
    if(!anzahl) throw new Error('Keine brauchbaren Einträge gefunden');

    const paket = {
      _hinweis: 'Zuordnung der Fragen zum Lehrgang des DARC. Geholt von '
              + 'https://50ohm.de/assets/question_index.json - die Daten gehören dem DARC, '
              + 'der Trainer verlinkt nur darauf. k=Kapitel, a=Abschnitt, s=Seitenname, '
              + 'e=Ausgaben, l=1 bedeutet: es gibt einen Lösungsweg unter '
              + 'https://50ohm.de/<Nummer>.html',
      _geholt: new Date().toISOString().slice(0, 10),
      _anzahl: anzahl,
      _mitLoesung: mitLoesung,
      fragen: schlank
    };
    fs.writeFileSync(ziel, JSON.stringify(paket), 'utf8');
    console.log('[50OHM] Zuordnung geholt: ' + anzahl + ' Fragen, ' + mitLoesung + ' mit Lösungsweg');
    return { ok:true, anzahl, mitLoesung, geholt: paket._geholt };
  }
}

// Der Knopf unter Einstellungen -> Wartung. Er bleibt, auch wenn der Server
// die Datei von selbst holt: zum Auffrischen, wenn der DARC nachgelegt hat.
app.post('/api/50ohm-index-holen', localOnly, async (req, res) => {
  try{
    res.json(await ohmIndexHolen());
  }catch(e){
    console.warn('[50OHM] Zuordnung nicht geholt:', e.message);
    res.status(502).json({ ok:false, fehler: e.message });
  }
});

// ================================================================
//  … UND VON SELBST, BEIM START
// ================================================================
//  Dietmar am 09.09.2026: "Der Server, soll das eigentlich im
//  Hintergrund machen, ohne Einstellungen."
//
//  Er hat recht: Wer den Trainer benutzt, soll die Loesungswege
//  vorfinden und nicht erst in den Einstellungen danach suchen. Ein
//  Knopf, den man erst kennen muss, ist fuer die meisten kein Angebot.
//
//  DREI REGELN, DAMIT DARAUS KEINE ZUMUTUNG WIRD
//
//  1. Nur wenn noetig. Fehlt die Datei oder ist sie aelter als 7 Tage
//     (bis 24.09.2026: 30), wird geholt - sonst nicht. Bei jedem Start nachzufragen hiesse,
//     einem Verein, der uns nichts schuldet, jede Sitzung eine Anfrage
//     zu schicken.
//
//  2. Nicht beim Hochfahren. Erst acht Sekunden nach dem Start, damit
//     der Trainer sofort da ist. Wer keine Verbindung hat, merkt von
//     dem Versuch nichts.
//
//  3. Still. Fehler stehen im Log, nicht auf dem Bildschirm. Ohne Netz
//     laeuft der Trainer vollstaendig; das Fehlen dieser Datei ist kein
//     Grund fuer eine Meldung.
// ================================================================
// ================================================================
//  DAS ZEICHEN AUF DEM SCHREIBTISCH
// ----------------------------------------------------------------
//  Dietmar am 09.09.2026: "Das neue Icon auf dem Desktop muss sich
//  bei Windows Linux und Mac automatisch erneuern."
//
//  Der Weg ueber das Update ist der haeufige Fall und in
//  github_update.js verdrahtet. Dieser hier faengt die uebrigen ab:
//  wer die Dateien von Hand austauscht, wer aus einer Sicherung
//  zurueckholt, wer den Ordner auf einen anderen Rechner kopiert.
//
//  Gemerkt wird der Zeitstempel des Zeichens in einer kleinen Datei.
//  Ist die Bilddatei neuer als das, was dort steht, wird einmal
//  aufgefrischt - danach steht der neue Stempel drin, und beim
//  naechsten Start passiert nichts mehr. Ein Auffrischen bei JEDEM
//  Start waere Unfug: Es schreibt Verknuepfungen an und ruft
//  Systemprogramme, fuer nichts.
// ================================================================
const ZEICHEN_MERK = path.join(__dirname, 'data', 'zeichen_stand.json');

function zeichenAutomatik(){
  try{
    const bild = path.join(__dirname, process.platform === 'win32' ? 'icon.ico'
                                    : (process.platform === 'darwin' ? 'icon.icns' : 'icon-512.png'));
    let stempel = 0;
    try{ stempel = fs.statSync(bild).mtimeMs; }catch(e){ return; }   // kein Zeichen, nichts zu tun
    let gemerkt = 0;
    try{ gemerkt = (JSON.parse(fs.readFileSync(ZEICHEN_MERK, 'utf8')) || {}).stempel || 0; }catch(e){}
    if(Math.abs(stempel - gemerkt) < 1000) return;                   // unveraendert

    // Erst nach zwoelf Sekunden, damit der Start frei bleibt. Und der
    // Stempel wird VOR dem Versuch geschrieben: Klappt das Auffrischen
    // auf diesem System nicht, soll es nicht bei jedem Start neu
    // scheitern.
    const t = setTimeout(() => {
      try{
        fs.mkdirSync(path.dirname(ZEICHEN_MERK), { recursive: true });
        fs.writeFileSync(ZEICHEN_MERK, JSON.stringify({ stempel, datei: path.basename(bild),
                                                        wann: new Date().toISOString() }));
      }catch(e){}
      try{
        const helfer = path.join(__dirname, 'verknuepfung_auffrischen.js');
        if(fs.existsSync(helfer)){
          require(helfer).auffrischen();
        }
      }catch(e){ console.warn('[ZEICHEN] nicht aufgefrischt:', e.message); }
    }, 12000);
    if(t.unref) t.unref();
  }catch(e){ /* nie ein Grund, den Start zu stoeren */ }
}

// ----------------------------------------------------------------
//  SIEBEN TAGE STATT DREISSIG, UND AUCH IM DAUERBETRIEB  (24.09.2026)
//  Dietmar: "Der DARC arbeitet daran und moechte zu jeder Frage eine
//  Loesung anbieten. Die muessen in allen Klassen vorhanden sein."
//
//  Solange der DARC nachlegt, waeren dreissig Tage zu lang: Ein neuer
//  Loesungsweg stuende bis zu einem Monat beim DARC, bevor der Trainer
//  ihn anbietet. Sieben Tage sind eine Anfrage je Woche - fuer den
//  Verein nicht der Rede wert.
//
//  Und bisher wurde nur beim START nachgesehen. Ein Server, der
//  wochenlang durchlaeuft (das ThinkPad), haette nie aufgefrischt. Jetzt
//  schaut er einmal am Tag nach, ob die Datei aelter als sieben Tage ist
//  - geholt wird trotzdem hoechstens einmal je Woche.
// ----------------------------------------------------------------
const OHM_INDEX_FRIST = 7 * 24 * 60 * 60 * 1000;
const OHM_INDEX_NACHSEHEN = 24 * 60 * 60 * 1000;

function ohmIndexWennNoetig(){
  try{
    const ziel = path.join(__dirname, '50ohm_index.json');
    let noetig = true;
    try{
      const st = fs.statSync(ziel);
      noetig = (Date.now() - st.mtimeMs) > OHM_INDEX_FRIST;
    }catch(e){ noetig = true; }          // gar nicht da
    if(!noetig) return;
    ohmIndexHolen()
      .then(e => console.log('[50OHM] von selbst geholt: ' + e.anzahl + ' Fragen, '
                           + e.mitLoesung + ' mit Lösungsweg'))
      .catch(e => console.log('[50OHM] von selbst nicht geholt (' + e.message
                           + ') – der Trainer läuft ohne die Datei genauso.'));
  }catch(e){ /* nie ein Grund, den Betrieb zu stoeren */ }
}

function ohmIndexAutomatik(){
  try{
    const t = setTimeout(ohmIndexWennNoetig, 8000);
    if(t.unref) t.unref();
    const tag = setInterval(ohmIndexWennNoetig, OHM_INDEX_NACHSEHEN);
    if(tag.unref) tag.unref();
  }catch(e){ /* nie ein Grund, den Start zu stoeren */ }
}

app.get('/api/version',(req,res)=>{
  try{
    const stand = dateiStandErmitteln();
    const antwort = { version: programmVersion(), kennung: stand.kennung,
                      dateien: stand.dateien, serverStart: SERVER_START };
    // Der Ordner, aus dem dieser Server laeuft - nur fuer den eigenen
    // Rechner. Dietmar am 17.09.2026 hatte zwei Trainer mit derselben
    // Nummer, aber verschiedenen Fingerabdruecken vor sich (START.sh
    // gegen START.bat), und nirgends stand, welcher aus welchem Ordner
    // kam. Die Einstellungen zeigen ihn jetzt unter Update; START.sh
    // liest ihn beim Start, wenn auf dem Port schon einer laeuft. Ein
    // Gast ueber den Einladungslink bekommt ihn nicht - der Pfad auf
    // dem Rechner des Gastgebers geht ihn nichts an.
    if(isLocalRequest(req)) antwort.ordner = __dirname;
    res.json(antwort);
  }catch(e){ res.status(500).json({error:e.message}); }
});

// ================================================================
// PROJEKT-PAKET ZUM MITNEHMEN
//
// Teilnehmer, die ueber den Einladungslink kommen, koennen sich hier das
// komplette Programm als ZIP herunterladen und danach unabhaengig vom
// Gastgeber-PC weiterlernen (eigener Server, eigener Gruppenraum).
//
// BEWUSST NICHT localOnly: Genau die Gaeste von aussen sollen es abrufen
// duerfen. Deshalb ist die Dateiliste unten eine strikte WHITELIST - es
// wird ausschliesslich verpackt, was dort ausdruecklich steht. Persoenliche
// und grosse Dinge bleiben damit garantiert draussen:
//   data/         = persoenlicher Lernstand des Gastgebers
//   .git/         = komplette Projekthistorie
//   piper/        = ~420 MB Sprachmodelle (holt piper.bat bei Bedarf selbst)
//   node_modules/ = wird beim Empfaenger per "npm install" erzeugt
//   cloudflared.exe, tunnel*.log, tunnel_url.txt = Tunnel-Adresse/Werkzeug
// ================================================================
const PAKET_DATEIEN = [
  'formelhilfe.json',
  // Die Erklaerungen zu den Fragen mit Zeichnung. Wer den Trainer aus
  // dem Gruppenraum mitnimmt, soll sie mitbekommen.
  'erklaerungen.json',
  'Index.html', 'duo.js', 'Server.js', 'package.json',
  // Support und Datenschutz (22.09.2026): Die Fusszeile verweist darauf,
  // also muss die Seite im Paket liegen - sonst fuehrt der Verweis auf
  // dem mitgenommenen Trainer ins Leere.
  'support.html', 'confetti.browser.js',
  'fragen.json', 'svg-list.json', 'video_lessons.json', 'video_map_embed.js', '50ohm_map.json',
  // Die genauere Zuordnung vom DARC, sofern sie schon geholt wurde. Wer den
  // Trainer aus dem Gruppenraum mitnimmt, bekommt sie mit - sonst muesste
  // jeder Teilnehmer sie einzeln holen.
  '50ohm_index.json',
  'Fragen-E.json', 'Fragen-A.json', 'Fragen-N-Auf-E.json', 'Fragen-E-Auf-A.json', 'Fragen-N-Auf-A.json',
  'klick-sound.js', 'tts-expand.js', 'hoerbuch.js', 'lame.js',
  // App-Anmutung am Handy: Ohne diese drei fehlt beim "Zum Startbildschirm
  // hinzufuegen" das Symbol, und der Trainer startet mit Browserleiste.
  'manifest.webmanifest', 'sw.js', 'icon-192.png', 'icon-512.png',
  'icon-512-maskierbar.png', 'icon.icns', 'verknuepfung_auffrischen.js',
  'Zeichen-Auffrischen.bat',
  // icon.ico und favicon.ico gehoeren mit in die Liste: Aus icon.ico
  // nimmt Windows das Zeichen der Verknuepfung. Fehlt sie hier, kommt
  // auf dem Schreibtisch nie ein neues Bild an - siehe .gitignore.
  'icon.ico', 'favicon.ico', 'icon.png',
  // README.txt ist am 27.08.2026 herausgeflogen: Sie erklaerte eine
  // Handinstallation von Piper, die piper.bat laengst allein macht,
  // und nannte Dateien bei alten Namen. Im Paket liegt die richtige
  // ANLEITUNG.txt, auf dem Stick die ANLEITUNG-USB.txt.
  // START.bat ist nur die Zuendschnur: Sie ruft START.vbs auf, und erst
  // die startet node ohne Fenster. Bis zum 01.09.2026 stand hier nur die
  // .bat - jeder Stick und jedes ZIP hatte damit eine Startdatei, die
  // auf eine nicht vorhandene Datei zeigt. Doppelklick, und es passiert
  // nichts. Dazu STOP.bat: Ohne sie gibt es auf dem Stick keinen Weg,
  // den Trainer wieder zu beenden.
  'START.bat', 'START.vbs', 'STOP.bat', 'piper.bat',
  // Dasselbe fuer Linux und den Mac. Dietmar am 07.09.2026:
  // "start.bat wird vermutlich auf Linux nicht funktionieren?" - richtig,
  // .bat und .vbs sind Windows. Wer das Paket auf einem anderen System
  // auspackt, hatte bisher gar keinen Startknopf und musste selbst
  // herausfinden, dass "node Server.js" der Weg ist.
  'START.sh', 'STOP.sh',
  // installieren.sh + INSTALLATION.md: Wer das Paket auf einem frischen
  // Linux-Rechner auspackt, hat damit denselben Weg vor sich wie jemand,
  // der es von GitHub holt - und die Anleitung gleich daneben liegen.
  'installieren.sh', 'INSTALLATION.md',
  // Node-Holen.bat + node_holen.ps1: Damit kommt der Empfaenger ohne
  // Installation von Node.js aus. Genau daran ist am 25.08.2026 ein
  // Benutzer haengengeblieben - "Beim Start seh ich kurz das Terminal
  // aufgehen aber wieder zu geht."
  //
  // Der Ordner node\ selbst geht ABSICHTLICH NICHT mit: Er ist rund
  // 90 MB gross und gilt nur fuer Windows x64. Das Paket wird oft ueber
  // eine Tunnel-Leitung gezogen; 90 MB dort durchzuschieben, damit der
  // Empfaenger sie sich sonst in zwei Minuten selbst holt, waere
  // schlechter Tausch. Die beiden kleinen Dateien genuegen.
  'Node-Holen.bat', 'node_holen.ps1',
  //
  // github_update.js ist KEINE Zugabe: Server.js laedt es beim Start
  // (require('./github_update')). Es hat nie im Paket gestanden - also
  // hatte jedes ZIP und jeder Stick den GitHub-Updater nicht, obwohl
  // genau der dafuer gedacht war, dass Leute Neuerungen bekommen, ohne
  // dass der Tunnel laeuft. Aufgefallen am 28.08.2026, als Dietmars
  // frisch bespielter Ordner ihn nicht hatte.
  'github_update.js',
  //
  // Dasselbe gilt fuer piper_stimmen.js: Server.js laedt es beim Start.
  // Ohne die Datei im Paket haette ein Empfaenger die Auswahl weiterer
  // Stimmen nicht - und wuerde sich fragen, warum bei ihm ein
  // Einstellungspunkt fehlt, von dem hier die Rede ist.
  'piper_stimmen.js',
  // Und programme_holen.js: Es holt piper und cloudflared fuer das
  // jeweilige System nach. Genau der Empfaenger, der das Paket auf
  // Linux oder am Mac auspackt, braucht es - dort kommt keines der
  // beiden Programme mit einem Setup.
  'programme_holen.js',
  //
  // Die beiden gehoeren dem Empfaenger, nicht dem Entwickler: Damit
  // findet er heraus, warum bei ihm kein Update ankommt. Sie standen
  // im Repository, aber nicht im Paket - also fehlten sie genau dem,
  // der sie braucht.
  'Update-Pruefen.bat', 'update_pruefen.js',
  //
  // LICENSE ist eine Pflicht, keine Zierde. Die PolyForm-Lizenz sagt
  // unter "Notices": wer eine Kopie weitergibt, muss die Bedingungen
  // mitgeben. Sticks ohne diese Datei zu verteilen waere ein Verstoss
  // gegen die eigene Lizenz.
  'LICENSE', 'README.md',
  //
  // package-lock.json legt die Fassungen der drei Bausteine fest.
  // Ohne sie holt "npm install" beim Empfaenger irgendeine neuere -
  // meist harmlos, aber es ist genau die Art Unterschied, die man
  // spaeter nicht mehr nachvollziehen kann.
  'package-lock.json',
  // Symbol und Verknuepfung: Wer den Trainer auf einem Stick bekommt,
  // soll ihn mit einem Doppelklick vom Desktop starten koennen - und
  // zwar mit dem Funkgeraet statt des grauen Zahnrads, das Windows
  // fuer .bat-Dateien zeigt.
  'icon.ico', 'icon.png', 'Verknuepfung-Erstellen.bat', 'verknuepfung.ps1',
  // USB-Stick-Erstellen gehoert AUSDRUECKLICH mit ins Paket. Anders als
  // Hochladen.bat ist das kein Werkzeug nur fuer den Entwickler: Wer den
  // Trainer an einer VHS oder im Ortsverband einsetzt, will Sticks
  // austeilen - und soll dabei nicht versehentlich seinen eigenen
  // Lernstand mitverteilen.
  'USB-Stick-Erstellen.bat', 'usb_erstellen.js',
];

// ================================================================
// Die PDFs der Bundesnetzagentur - nach Muster statt nach festem Namen.
//
// Erster Anlauf war eine Liste fester Dateinamen. Die ging sofort daneben:
// Die Formelsammlung heisst beim Herunterladen "Hilfsmittel_12062024.pdf",
// im Ordner lag sie dann als "Hilfsmittel.pdf" - und fiel damit stumm aus
// dem Paket. Beim naechsten Stand der Behoerde waere es wieder passiert.
//
// Die Muster sind bewusst eng: Sie beginnen mit dem Wortstamm und enden
// auf .pdf. Damit kann hier nichts anderes hineinrutschen, und die
// Whitelist bleibt eine Whitelist.
//
// KEINE VORAUSSETZUNG: Fehlt eine der Dateien, entsteht einfach ein
// kleineres Paket.
// ================================================================
const PAKET_PDF_MUSTER = [
  /^hilfsmittel.*\.pdf$/i,        // Formelsammlung + Bandplan + Kabeldiagramm
  /^formelsammlung.*\.pdf$/i,     // falls jemand sie so umbenennt
  /^pruefungsfragen.*\.pdf$/i,    // der Fragenkatalog zum Nachschlagen
  /^pr(ü|ue)fungsfragen.*\.pdf$/i
];

// Beschreibt die gefundenen PDFs fuer die ANLEITUNG.txt - mit dem Namen,
// den sie WIRKLICH tragen.
function pdfZeilen(namen){
  if(!namen.length) return [];
  const raus = [];
  for(const n of namen){
    if(/^pruefungsfragen|^pr(ü|ue)fungsfragen/i.test(n)){
      raus.push('  - ' + n + ' - der komplette Fragenkatalog zum Nachschlagen');
    } else {
      raus.push('  - ' + n + ' - Formelsammlung, Bandplan und Kabeldaempfungs-');
      raus.push('    diagramm, also das, was in der Pruefung auf dem Tisch liegt');
    }
  }
  return raus;
}

function paketPdfsFinden(){
  try{
    return fs.readdirSync(__dirname, {withFileTypes:true})
      .filter(e => e.isFile() && PAKET_PDF_MUSTER.some(m => m.test(e.name)))
      .map(e => e.name);
  }catch(e){ return []; }
}
// 'test' ist hier bewusst NICHT mehr dabei (25.08.2026). Darin liegt die
// Testsuite fuer tts-expand.js - Entwicklermaterial, das mit "npm test"
// laeuft und mit dem Lernen nichts zu tun hat. Wer das Paket bekommt, will
// Fragen ueben und nicht raten, wofuer ein Ordner "test" gut ist. Im
// Projekt bleibt er selbstverstaendlich.
// 'formelsammlung' ist am 05.09.2026 herausgefallen: Darin lagen die 20
// abfotografierten Seiten der Formelsammlung, rund 3,6 MB. Der Trainer
// zeigt jetzt das amtliche PDF selbst, aufgeschlagen auf der richtigen
// Seite - und Formelsammlung.pdf ist ueber PAKET_PDF_MUSTER ohnehin im
// Paket. Der Ordner wird also nicht mehr gebraucht; geloescht wird bei
// bestehenden Installationen nichts, er faellt nur aus dem Paket.
// fonts seit dem 22.09.2026: Ohne die Schriften saehe der mitgenommene
// Trainer anders aus als der geteilte - und holte sie sich sonst nirgends.
const PAKET_ORDNER = ['svgs', 'sounds', 'fonts'];

// Minimaler ZIP-Schreiber mit Bordmitteln (zlib). Bewusst ohne npm-Paket wie
// "archiver", damit das Projekt seine drei Abhaengigkeiten behaelt und der
// Endpunkt auch nach einem frischen "npm install" ohne Zusatzschritt laeuft.
function zipBauen(dateien){ // [{name, data:Buffer}]
  function crc32(buf){
    let c, crc = 0xFFFFFFFF;
    for(let i=0;i<buf.length;i++){
      c = (crc ^ buf[i]) & 0xFF;
      for(let k=0;k<8;k++) c = c & 1 ? (c>>>1) ^ 0xEDB88320 : c>>>1;
      crc = (crc>>>8) ^ c;
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  // Feste, gueltige DOS-Zeitangabe. Variabel waere hier sinnlos (das Paket
  // wird bei jedem Abruf neu gebaut) und manche Entpacker meckern bei 0.
  const dosZeit = (12 << 11) | (0 << 5) | 0;          // 12:00:00 Uhr
  const dosDatum = ((2026 - 1980) << 9) | (1 << 5) | 1; // 01.01.2026
  const lokale = [], zentrale = [];
  let offset = 0;
  for(const f of dateien){
    const nameBuf = Buffer.from(f.name, 'utf8');
    const comp = zlib.deflateRawSync(f.data, {level:9});
    const crc = crc32(f.data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50,0); lh.writeUInt16LE(20,4); lh.writeUInt16LE(0x0800,6);
    lh.writeUInt16LE(8,8); lh.writeUInt16LE(dosZeit,10); lh.writeUInt16LE(dosDatum,12);
    lh.writeUInt32LE(crc,14); lh.writeUInt32LE(comp.length,18); lh.writeUInt32LE(f.data.length,22);
    lh.writeUInt16LE(nameBuf.length,26); lh.writeUInt16LE(0,28);
    lokale.push(lh, nameBuf, comp);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50,0); ch.writeUInt16LE(20,4); ch.writeUInt16LE(20,6); ch.writeUInt16LE(0x0800,8);
    ch.writeUInt16LE(8,10); ch.writeUInt16LE(dosZeit,12); ch.writeUInt16LE(dosDatum,14);
    ch.writeUInt32LE(crc,16); ch.writeUInt32LE(comp.length,20); ch.writeUInt32LE(f.data.length,24);
    ch.writeUInt16LE(nameBuf.length,28); ch.writeUInt16LE(0,30); ch.writeUInt16LE(0,32);
    ch.writeUInt16LE(0,34); ch.writeUInt16LE(0,36); ch.writeUInt32LE(0,38); ch.writeUInt32LE(offset,42);
    zentrale.push(ch, nameBuf);
    offset += lh.length + nameBuf.length + comp.length;
  }
  const zBuf = Buffer.concat(zentrale);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50,0); eocd.writeUInt16LE(0,4); eocd.writeUInt16LE(0,6);
  eocd.writeUInt16LE(dateien.length,8); eocd.writeUInt16LE(dateien.length,10);
  eocd.writeUInt32LE(zBuf.length,12); eocd.writeUInt32LE(offset,16); eocd.writeUInt16LE(0,20);
  return Buffer.concat([...lokale, zBuf, eocd]);
}

// ================================================================
// Name des Pakets - an EINER Stelle.
//
// Frueher stand "Klasse-N-Trainer" dreimal im Code: als Ordner im ZIP, im
// Pfad der herkunft.json und im Dateinamen des Downloads. Seit der Trainer
// auch die Klassen E und A kann, stimmt der Name nicht mehr; wer ihn an
// zwei von drei Stellen aendert, bekommt ein ZIP, dessen Abgleich beim
// Empfaenger ins Leere laeuft.
// ================================================================
const PAKET_NAME = 'Amateurfunk-Trainer';

function paketDateienSammeln(herkunftUrl){
  const raus = [];
  const holen = (relPfad) => {
    const voll = path.join(__dirname, relPfad);
    // Sicherheitsnetz: nichts einpacken, was ausserhalb des Projektordners liegt.
    if(!voll.startsWith(__dirname)) return;
    if(!fs.existsSync(voll) || !fs.statSync(voll).isFile()) return;
    raus.push({ name: PAKET_NAME + '/' + relPfad.replace(/\\/g,'/'), data: fs.readFileSync(voll) });
  };
  PAKET_DATEIEN.forEach(holen);
  const pdfs = paketPdfsFinden();
  pdfs.forEach(holen);
  for(const ordner of PAKET_ORDNER){
    const voll = path.join(__dirname, ordner);
    if(!fs.existsSync(voll)) continue;
    for(const eintrag of fs.readdirSync(voll, {withFileTypes:true})){
      if(eintrag.isFile()) holen(path.join(ordner, eintrag.name));
    }
  }
  // Stand des Pakets mit hineinschreiben. Ohne das sieht man einem
  // heruntergeladenen Ordner nicht an, von wann er ist - und genau das war die
  // Frage, wenn jemand "das Update fehlt bei mir" meldet.
  let stand = '';
  try{
    const s = dateiStandErmitteln();
    const idx = s.dateien['Index.html'];
    stand = [
      '',
      '================================================================',
      '  Stand dieses Pakets',
      '================================================================',
      '',
      '  Kennung     : ' + s.kennung,
      '  Erstellt am : ' + new Date().toLocaleString('de-DE'),
      '  Index.html  : ' + (idx ? new Date(idx.geaendert).toLocaleString('de-DE') + '  (' + idx.groesse + ' Bytes)' : 'unbekannt'),
      '',
      '  Dieser Ordner ist eine Momentaufnahme. Spaetere Aenderungen beim',
      '  Kursleiter kommen hier NICHT von allein an. Fuer ein Update das Paket',
      '  neu herunterladen und daraus Index.html und Server.js in diesen',
      '  Ordner kopieren - der Lernstand im Ordner data/ bleibt erhalten.',
      '',
      '  Den Stand des eigenen Trainers zeigt der Info-Knopf oben rechts.',
      ''
    ].join('\r\n');
  }catch(e){}
  // Woher dieses Paket stammt. Damit weiss die heruntergeladene Kopie spaeter,
  // wen sie beim Abgleich fragen muss - man muss keine Adresse von Hand
  // eintippen, und es gibt keine Gelegenheit, versehentlich eine fremde
  // einzugeben.
  try{
    raus.push({ name: PAKET_NAME + '/herkunft.json', data: Buffer.from(JSON.stringify({
      quelle: herkunftUrl || null,
      geladenAm: new Date().toISOString(),
      kennung: dateiStandErmitteln().kennung,
      hinweis: 'Adresse des Trainers, aus dem dieses Paket stammt. Der Abgleich fragt dort nach neueren Dateien.'
    }, null, 1), 'utf8') });
  }catch(e){}
  const anleitung = ANLEITUNG_TEXT.replace('@@PDFS@@', pdfZeilen(pdfs).join('\r\n'))
                                  .replace(/^@@PDFS@@\r?\n/m, '');
  raus.push({ name: PAKET_NAME + '/ANLEITUNG.txt', data: Buffer.from(anleitung + stand, 'utf8') });
  return raus;
}

const ANLEITUNG_TEXT = [
  '================================================================',
  '  Amateurfunk-Trainer - Anleitung zum Loslegen',
  '================================================================',
  '',
  'Du hast hier den kompletten Trainer. Ab jetzt brauchst du weder den',
  'Einladungslink noch den Rechner, von dem du das Paket bekommen hast.',
  '',
  '----------------------------------------------------------------',
  'SCHRITT 1: Node.js besorgen (nur einmal noetig)',
  '----------------------------------------------------------------',
  'Node.js ist kostenlos und wird gebraucht, damit der Trainer starten kann.',
  'Es gibt zwei Wege - der erste ist der einfachere:',
  '',
  '  A) Doppelklick auf   Node-Holen.bat',
  '',
  '     Legt Node.js in den Unterordner node\\ - ohne Installation, ohne',
  '     Administratorrechte, ohne Aenderung an deinem System. Dauert ein',
  '     bis zwei Minuten. Der Trainer nimmt es danach von selbst.',
  '',
  '  B) Oder von Hand: https://nodejs.org  -> Fassung "LTS" installieren',
  '',
  '     Bei der Installation alles so lassen, wie es vorgeschlagen wird.',
  '',
  'Wenn auf deinem Rechner schon Node.js installiert ist, kannst du diesen',
  'Schritt ueberspringen.',
  '',
  '----------------------------------------------------------------',
  'SCHRITT 2: Trainer starten',
  '----------------------------------------------------------------',
  'Doppelklick auf   START.bat',
  '',
  'Beim allerersten Start dauert es etwas laenger, weil noch ein paar',
  'Bausteine aus dem Internet nachgeladen werden. Danach oeffnet sich der',
  'Trainer von selbst im Browser.',
  '',
  'Zum Beenden einfach das schwarze Fenster schliessen.',
  '',
  '----------------------------------------------------------------',
  'SCHRITT 3 (freiwillig): Natuerliche Sprachausgabe',
  '----------------------------------------------------------------',
  'Doppelklick auf   piper.bat',
  '',
  'Das laedt rund 80 MB und richtet die deutsche Stimme "Thorsten" ein,',
  'die die Fragen deutlich angenehmer vorliest als die Windows-Stimme.',
  'Der Trainer laeuft aber auch ohne diesen Schritt.',
  '',
  '----------------------------------------------------------------',
  'WAS DU JETZT ALLES HAST',
  '----------------------------------------------------------------',
  '  - Alle Fragen der Klassen N, E und A mit Bildern (571 / 1034 / 1750),',
  '    umschaltbar ueber "Ziel waehlen" oben im Trainer',
  // Platzhalter - wird beim Packen durch die tatsaechlich gefundenen PDFs
  // ersetzt (siehe pdfZeilen()). Die Datei fest beim Namen zu nennen ging
  // schon einmal schief: Sie hiess "Hilfsmittel.pdf", dann
  // "Formelsammlung.pdf", und die Anleitung log beide Male.
  '@@PDFS@@',
  '  - Lernmodus mit Lernfortschritt, Fehlerliste und Auffrischung',
  '  - Pruefungssimulator unter echten Bedingungen: 25 Fragen und 45 Minuten',
  '    je Pruefungsteil. Welche Teile drankommen, richtet sich nach dem',
  '    gewaehlten Ziel - bei Klasse N drei, bei Klasse A fuenf, bei einer',
  '    Aufstockung nur die fehlende Technik.',
  '  - Statistiken und Verlauf',
  '  - Einen eigenen Gruppenraum, in den du selbst einladen kannst',
  '',
  'Dein Lernfortschritt wird auf deinem eigenen Rechner gespeichert.',
  '',
  '----------------------------------------------------------------',
  'FRAGENKATALOG',
  '----------------------------------------------------------------',
  'Offizieller Katalog der Bundesnetzagentur, Stand Maerz 2024.',
  'Besonderer Dank gilt Michael (DL2YMR) fuer seinen Videolehrgang.',
  '',
  'Viel Erfolg bei der Pruefung und 73!',
  ''
].join('\r\n');

// ================================================================
// WIE OFT WURDE DAS PAKET HERUNTERGELADEN?
//
// Liegt in data/ und faellt damit unter dieselbe Regel wie der Lernstand:
// nicht im ZIP, nicht im Repository. Eine heruntergeladene Kopie faengt
// also bei 0 an und zaehlt ihre eigenen Weitergaben - das ist gewollt.
//
// GEZAEHLT WIRD JE ADRESSE HOECHSTENS EINMAL PRO STUNDE. Ein Browser, der
// einen abgebrochenen Download neu startet, oder jemand, der zweimal
// klickt, weil beim ersten Mal nichts zu passieren schien, sind kein
// zweiter Empfaenger. Ohne die Sperre zaehlt der Zaehler Klicks, nicht
// Menschen - und waere damit wertlos.
// ================================================================
const PAKET_ZAEHLER_FP = path.join(USERDATA_DIR, 'paket_zaehler.json');
const PAKET_SPERRE_MS = 60 * 60 * 1000;
const paketLetzteAdresse = new Map();

function paketZaehlerLesen(){
  try{
    if(!fs.existsSync(PAKET_ZAEHLER_FP)) return { gesamt: 0, letzte: null };
    const d = JSON.parse(fs.readFileSync(PAKET_ZAEHLER_FP, 'utf8'));
    return { gesamt: Number(d.gesamt) || 0, letzte: d.letzte || null };
  }catch(e){
    console.warn('[PAKET] Zaehler nicht lesbar:', e.message);
    return { gesamt: 0, letzte: null };
  }
}

function paketZaehlerErhoehen(req){
  const wer = String(req.headers['cf-connecting-ip'] || req.ip || '?');
  const jetzt = Date.now();
  const zuletzt = paketLetzteAdresse.get(wer);
  if(zuletzt && jetzt - zuletzt < PAKET_SPERRE_MS){
    console.log('[PAKET] Nicht gezaehlt - dieselbe Adresse innerhalb einer Stunde.');
    return paketZaehlerLesen();
  }
  paketLetzteAdresse.set(wer, jetzt);
  // Die Map darf nicht unbegrenzt wachsen; alte Eintraege raus.
  if(paketLetzteAdresse.size > 500){
    for(const [k,v] of paketLetzteAdresse){ if(jetzt - v > PAKET_SPERRE_MS) paketLetzteAdresse.delete(k); }
  }
  const stand = paketZaehlerLesen();
  stand.gesamt += 1;
  stand.letzte = new Date().toISOString();
  try{
    ensureUserdataDir();
    // Erst daneben schreiben, dann umbenennen: ein Absturz mitten im
    // Schreiben soll den Zaehler nicht auf 0 zuruecksetzen.
    const tmp = PAKET_ZAEHLER_FP + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(stand, null, 2), 'utf8');
    if(fs.existsSync(PAKET_ZAEHLER_FP)) fs.unlinkSync(PAKET_ZAEHLER_FP);
    fs.renameSync(tmp, PAKET_ZAEHLER_FP);
  }catch(e){ console.warn('[PAKET] Zaehler nicht schreibbar:', e.message); }
  return stand;
}

// Bewusst oeffentlich: Der Zaehler steht neben dem Herunterladen-Knopf, und
// den sehen auch die Gaeste ueber den Einladungslink.
app.get('/api/paket-zaehler',(req,res)=>{
  const z = paketZaehlerLesen();
  res.json({ gesamt: z.gesamt, letzte: z.letzte, name: PAKET_NAME + '.zip' });
});

app.get('/api/projekt-paket',(req,res)=>{
  try{
    // Unter welcher Adresse hat der Gast uns gerade erreicht? Genau die
    // gehoert ins Paket - ueber sie findet er spaeter zurueck.
    let herkunft = tunnelUrlCache || null;
    if(!herkunft){
      const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http').split(',')[0].trim();
      const host  = req.headers.host;
      if(host) herkunft = `${proto}://${host}`;
    }
    const dateien = paketDateienSammeln(herkunft);
    if(!dateien.length) return res.status(500).json({error:'Keine Dateien zum Verpacken gefunden'});
    const zip = zipBauen(dateien);
    const stand = paketZaehlerErhoehen(req);
    console.log(`[PAKET] ZIP ausgeliefert: ${dateien.length} Dateien, ${(zip.length/1024/1024).toFixed(2)} MB an ${req.headers['cf-connecting-ip']||req.ip} - insgesamt ${stand.gesamt}x`);
    res.setHeader('Content-Type','application/zip');
    res.setHeader('Content-Disposition','attachment; filename="' + PAKET_NAME + '.zip"');
    res.setHeader('Content-Length', zip.length);
    res.send(zip);
  }catch(e){
    console.error('[PAKET] Fehler beim Bauen des ZIP:', e);
    res.status(500).json({error:'Paket konnte nicht erstellt werden'});
  }
});


// ================================================================
// ABGLEICH ZWISCHEN ZWEI TRAINERN
//
// Wer sich den Trainer ueber "Trainer herunterladen" mitgenommen hat, hat eine
// Momentaufnahme im eigenen Ordner. Aendert der Gastgeber spaeter etwas, kommt
// das dort nicht an - der eigene Server liefert ja die eigenen Dateien aus.
// Genau diese Luecke schliesst der Abgleich.
//
// Sicherheitsueberlegung, die den Aufbau bestimmt:
//
//   Fragen, Bilder und die Video-Zuordnung sind reine Daten - sie zu
//   uebernehmen ist harmlos. Index.html und duo.js laufen im Browser.
//   Server.js dagegen laeuft mit vollen Rechten auf dem Rechner des
//   Empfaengers. Deshalb wird Server.js NICHT im selben Zug mitgeschrieben:
//   Der Abgleich meldet nur, dass es abweicht, und das Uebernehmen ist ein
//   eigener, ausdruecklich bestaetigter Schritt.
//
//   Ausserdem: Die beiden anwendenden Endpunkte sind localOnly. Ein Gast von
//   aussen kann den Abgleich also nicht ausloesen - nur wer am Rechner sitzt.
// ================================================================

// Was ueberhaupt abgeglichen werden darf. Alles andere wird abgelehnt, egal
// was der Aufrufer schickt.
const ABGLEICH_DATEN    = ['fragen.json', 'svg-list.json', 'video_map_embed.js', 'video_lessons.json',
                           'Fragen-E.json', 'Fragen-A.json', 'Fragen-N-Auf-E.json',
                           'Fragen-E-Auf-A.json', 'Fragen-N-Auf-A.json',
                           // Zuordnung Frage -> Kapitel bei 50ohm.de. Reine
                           // Kursdaten wie die Video-Map daneben.
                           '50ohm_map.json',
                           // Die Erklaerungen. Ohne diesen Eintrag fiele die
                           // Datei in den Zweig "programm" und ein Update
                           // wollte jedes Mal bestaetigt und neu gestartet
                           // werden - fuer eine Textdatei.
                           'erklaerungen.json'];
const ABGLEICH_BROWSER  = ['Index.html', 'duo.js', 'klick-sound.js', 'tts-expand.js', 'manifest.webmanifest', 'sw.js'];
const ABGLEICH_PROGRAMM = ['Server.js', 'hoerbuch.js', 'lame.js'];
const ABGLEICH_ALLE     = [...ABGLEICH_DATEN, ...ABGLEICH_BROWSER, ...ABGLEICH_PROGRAMM];

// Seit dem 02.09.2026 wird nicht mehr nur diese Liste abgeglichen,
// sondern alles, was bei GitHub liegt und die Pruefung in
// github_update.js besteht. Die Einteilung muss deshalb auch fuer
// Dateien stimmen, die hier oben nicht stehen - sonst faellt jede neue
// Datei in den Zweig "programm" und verlangt eine Bestaetigung samt
// Neustart, auch wenn es nur ein Bild ist.
//
// Im Zweifel gilt eine .js als Programmdatei: Sie koennte von Server.js
// geladen werden und liefe dann mit vollen Rechten. Lieber einmal zu
// viel nachgefragt als einmal zu wenig.
const ABGLEICH_BROWSER_JS = ['duo.js', 'klick-sound.js', 'video_map_embed.js', 'svg-list.json'];

function abgleichKategorie(name){
  if(ABGLEICH_DATEN.includes(name))   return 'daten';
  if(ABGLEICH_BROWSER.includes(name)) return 'browser';
  if(ABGLEICH_PROGRAMM.includes(name)) return 'programm';

  const klein = String(name || '').toLowerCase();
  const datei  = klein.split('/').pop();
  if(ABGLEICH_BROWSER_JS.includes(datei))         return 'browser';
  if(klein.endsWith('.js'))                       return 'programm';
  if(klein.endsWith('.html') || klein.endsWith('.css')) return 'browser';
  return 'daten';
}

// Fingerabdruck je Datei: Groesse und Inhalts-Hash. Der Zeitstempel taugt
// nicht - er aendert sich beim Kopieren, der Inhalt nicht.
function abgleichStand(){
  const dateien = {};
  for(const name of ABGLEICH_ALLE){
    try{
      const voll = path.join(__dirname, name);
      const data = fs.readFileSync(voll);
      dateien[name] = {
        groesse: data.length,
        hash: crypto.createHash('sha256').update(data).digest('hex').slice(0, 16),
        geaendert: new Date(fs.statSync(voll).mtimeMs).toISOString(),
        art: abgleichKategorie(name)
      };
    }catch(e){ dateien[name] = null; }
  }
  return dateien;
}

// Beim GASTGEBER: der Stand und die einzelnen Dateien.
// Bewusst oeffentlich - genau die Gaeste sollen es abrufen duerfen. Die
// Whitelist oben begrenzt es strikt auf diese neun Dateien.
app.get('/api/abgleich/stand', (req,res)=>{
  try{ res.json({ dateien: abgleichStand(), zeit: new Date().toISOString() }); }
  catch(e){ res.status(500).json({error:e.message}); }
});

app.get('/api/abgleich/datei', (req,res)=>{
  const name = String(req.query.name || '');
  if(!ABGLEICH_ALLE.includes(name)){
    console.warn('[ABGLEICH] Abruf einer nicht freigegebenen Datei abgelehnt:', name);
    return res.status(404).json({error:'Diese Datei wird nicht abgeglichen'});
  }
  const voll = path.join(__dirname, name);
  if(!voll.startsWith(__dirname) || !fs.existsSync(voll)) return res.status(404).json({error:'Nicht vorhanden'});
  res.setHeader('Content-Type','application/octet-stream');
  res.send(fs.readFileSync(voll));
});

// ================================================================
// WER DARF DAS EINGEBETTETE VIDEOFENSTER SEHEN?
//
// Der Videolehrgang stammt von Michael, DL2YMR. Wer ihn im eingebetteten
// Fenster schaut, erzeugt bei ihm keinen zaehlenden Aufruf und keine
// Werbeeinnahme. Deshalb bekommt jeder normale Teilnehmer den Weg ueber
// youtube.com; wer in video_embed.json steht, behaelt das Fenster.
//
// FRUEHER STANDEN DIE NAMEN IM KLARTEXT IN Index.html - drei Vornamen in
// einer Zeile Javascript. Solange das Projekt privat war, war das gleichgueltig. Seit es bei
// GitHub liegt, stehen dort die Vornamen zweier Leute, die nie gefragt
// wurden, ob sie im Netz auftauchen wollen - und Index.html liest jeder
// Besucher ohnehin mit.
//
// Jetzt stehen sie in video_embed.json, die per .gitignore draussen
// bleibt. Und die Liste verlaesst den Server nie: der Browser fragt mit
// einem Namen an und bekommt ja oder nein. Fehlt die Datei, ist die
// Antwort immer nein - der sichere Fall, denn dann bekommt Michael
// seinen Aufruf.
// ================================================================
function namenNormalisieren(n){
  return String(n || '').trim().toLowerCase()
    .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss')
    .replace(/[^a-z0-9]/g,'');
}
function videoEmbedListe(){
  try{
    const j = JSON.parse(fs.readFileSync(path.join(__dirname, 'video_embed.json'), 'utf8'));
    const roh = Array.isArray(j) ? j : (Array.isArray(j.namen) ? j.namen : []);
    return roh.map(namenNormalisieren).filter(Boolean);
  }catch(e){ return []; }
}
app.get('/api/video-embed', (req,res)=>{
  // Bewusst nur ja/nein. Die Liste selbst wird nicht herausgegeben.
  const n = namenNormalisieren(req.query.name);
  res.json({ embed: !!n && videoEmbedListe().includes(n) });
});

// ================================================================
// GITHUB-UPDATE - der zweite Weg, an Neuerungen zu kommen.
//
// Der Abgleich oben fragt einen laufenden Trainer unter einer
// Tunnel-Adresse. Die aendert sich bei jedem Neustart des Tunnels, und
// eine gemerkte Adresse ist irgendwann tot - dann passiert
// stillschweigend nichts mehr. GitHub hat eine Adresse, die bleibt.
//
// Die Arbeit steht in github_update.js - hier wird nur eingehaengt, mit
// derselben Whitelist und derselben Einteilung in Daten, Anzeige und
// Programm. Zwei Wege, eine Liste dessen, was ueberhaupt wandern darf.
// ================================================================
let githubUpdate = null;
try{
  githubUpdate = require('./github_update').einrichten({
    app, localOnly, projektOrdner: __dirname,
    dateien: ABGLEICH_ALLE, kategorie: abgleichKategorie
  });
}catch(e){
  // Fehlt die Datei (altes ZIP), soll der Trainer trotzdem starten.
  console.warn('[GITHUB] Update-Funktion nicht verfuegbar:', e.message);
}

// ================================================================
//  WEITERE VORLESESTIMMEN NACHTRAEGLICH HOLEN     (05.09.2026)
// ================================================================
//  Die Arbeit steht in piper_stimmen.js - hier wird nur eingehaengt.
//  Ausgeliefert wird weiter nur Thorsten in mittlerer Guete; alles
//  weitere holt sich, wer es haben will. Der Grund steht dort oben:
//  Eine Stimme wiegt 63 MB, alle zehn deutschen zusammen rund 500 MB -
//  in einem Setup von knapp 90 MB.
//
//  Fehlt die Datei, faellt nur die Auswahl weg. Der Trainer laeuft
//  weiter, und die mitgelieferte Stimme spricht wie bisher.
// ================================================================
try{
  require('./piper_stimmen').einrichten({
    app, localOnly, piperOrdner: PIPER_DIR, sprache: 'de_DE'
  });
}catch(e){
  console.warn('[STIMMEN] Nachladen nicht verfuegbar:', e.message);
}

// ================================================================
//  DIE BEIDEN HILFSPROGRAMME NACHHOLEN     (07.09.2026)
// ================================================================
//  Dietmar: "Baue es mir so auf, dass es auf Windows, Linux und Mac
//  laeuft."
//
//  Der Trainer selbst lief dort laengst - es fehlten die beiden
//  Programme drumherum, und die kamen bisher nur ueber Windows-Wege:
//  piper.exe ueber das Setup, cloudflared.exe ueber start-tunnel.bat
//  mit PowerShell. Beides gibt es fuer Linux und macOS genauso, nur
//  unter anderem Namen - geholt wird es jetzt in Node, also ueberall
//  gleich. Die Arbeit steht in programme_holen.js.
//
//  Fehlt die Datei, faellt nur der Knopf weg: Wer piper und
//  cloudflared von Hand hinlegt, kommt zum selben Ergebnis.
// ================================================================
try{
  require('./programme_holen').einrichten({
    app, localOnly,
    piperOrdner:   PIPER_DIR,
    projektOrdner: __dirname,
    // Die Lage wird HIER bestimmt und nicht im Modul: Wo piper und
    // cloudflared liegen duerfen, weiss Server.js - findPiper() und
    // checkCloudflaredExists() suchen an mehr Stellen, als ein
    // Nachlade-Modul kennen sollte.
    lagePruefen: () => {
      let piperDa = false, piperWo = null;
      try{
        const pp = findPiper();
        piperDa = (pp.type === 'binary');
        piperWo = pp.quelle;
      }catch(e){}
      let cfDa = false;
      try{ cfDa = !!checkCloudflaredExists().exists; }catch(e){}
      return { piperDa, piperWo, cloudflaredDa: cfDa };
    }
  });
}catch(e){
  console.warn('[PROGRAMME] Nachholen nicht verfuegbar:', e.message);
}

// ---- Beim EMPFAENGER ------------------------------------------------------

function quelleSaeubern(roh){
  // Nur http/https, keine Pfade, kein Query. Was hier durchkommt, wird
  // gleich angefragt - also eng halten.
  let u;
  try{ u = new URL(String(roh||'').trim()); }catch(e){ return null; }
  if(u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  return u.origin;
}

function holen(url, alsText){
  return new Promise((erfuellt, abgelehnt)=>{
    const mod = url.startsWith('https:') ? https : require('http');
    const req = mod.get(url, {timeout: 20000, headers:{'User-Agent':'AfuTrainer-Abgleich'}}, r=>{
      if(r.statusCode !== 200){ r.resume(); return abgelehnt(new Error('HTTP ' + r.statusCode)); }
      const teile = [];
      let menge = 0;
      r.on('data', d=>{
        menge += d.length;
        // Notbremse: eine einzelne Datei des Trainers ist nie so gross.
        if(menge > 20*1024*1024){ req.destroy(); return abgelehnt(new Error('Datei zu gross')); }
        teile.push(d);
      });
      r.on('end', ()=>{ const b = Buffer.concat(teile); erfuellt(alsText ? b.toString('utf8') : b); });
    });
    req.on('timeout', ()=>{ req.destroy(); abgelehnt(new Error('Zeitueberschreitung')); });
    req.on('error', abgelehnt);
  });
}

// Die gemerkte Herkunft der eigenen Kopie - Vorschlag fuer das Abgleich-Fenster.
app.get('/api/abgleich/herkunft', localOnly, (req,res)=>{
  try{
    const voll = path.join(__dirname, 'herkunft.json');
    if(!fs.existsSync(voll)) return res.json({quelle:null});
    const j = JSON.parse(fs.readFileSync(voll,'utf8'));
    res.json({quelle: j.quelle || null, geladenAm: j.geladenAm || null, kennung: j.kennung || null});
  }catch(e){ res.json({quelle:null}); }
});

app.get('/api/abgleich/pruefen', localOnly, async (req,res)=>{
  const quelle = quelleSaeubern(req.query.quelle);
  if(!quelle) return res.status(400).json({error:'Keine gueltige Adresse'});
  try{
    const fremd = JSON.parse(await holen(quelle + '/api/abgleich/stand', true));
    const eigen = abgleichStand();
    const unterschiede = [];
    for(const name of ABGLEICH_ALLE){
      const a = eigen[name], b = fremd.dateien ? fremd.dateien[name] : null;
      if(!b) continue;                                   // Gastgeber hat sie nicht
      if(a && a.hash === b.hash) continue;               // gleich
      unterschiede.push({
        name,
        art: abgleichKategorie(name),
        eigen: a ? {groesse:a.groesse, geaendert:a.geaendert} : null,
        fremd: {groesse:b.groesse, geaendert:b.geaendert}
      });
    }
    res.json({ quelle, unterschiede, geprueft: new Date().toISOString() });
  }catch(e){
    console.warn('[ABGLEICH] Pruefen fehlgeschlagen:', e.message);
    res.status(502).json({error:'Der Kursleiter ist nicht erreichbar: ' + e.message});
  }
});

app.post('/api/abgleich/anwenden', localOnly, async (req,res)=>{
  const quelle = quelleSaeubern(req.body && req.body.quelle);
  const gewuenscht = Array.isArray(req.body && req.body.dateien) ? req.body.dateien : [];
  if(!quelle) return res.status(400).json({error:'Keine gueltige Adresse'});

  const namen = gewuenscht.filter(n=>ABGLEICH_ALLE.includes(n));
  if(!namen.length) return res.status(400).json({error:'Keine gueltige Datei angefragt'});

  // Server.js nur, wenn ausdruecklich zugestimmt wurde. Der Client schickt
  // dafuer ein eigenes Feld - ein versehentlicher Klick reicht nicht.
  const willProgramm = namen.some(n=>abgleichKategorie(n)==='programm');
  if(willProgramm && req.body.programmBestaetigt !== true){
    return res.status(400).json({error:'Fuer Server.js fehlt die ausdrueckliche Bestaetigung'});
  }

  const stempel = new Date().toISOString().slice(0,16).replace(/[:T]/g,'-');
  const sicherung = path.join(__dirname, 'backup', 'abgleich_' + stempel);
  const geschrieben = [], fehler = [];
  try{
    fs.mkdirSync(sicherung, {recursive:true});
    for(const name of namen){
      try{
        const neu = await holen(quelle + '/api/abgleich/datei?name=' + encodeURIComponent(name), false);
        if(!neu || !neu.length) throw new Error('leere Antwort');
        const ziel = path.join(__dirname, name);
        // Erst sichern, dann schreiben. Wer den Abgleich bereut, findet die
        // alten Dateien unter backup/ und kann sie zurueckkopieren.
        if(fs.existsSync(ziel)) fs.copyFileSync(ziel, path.join(sicherung, name));
        // Atomar: erst daneben schreiben, dann umbenennen. Sonst steht bei
        // einem Abbruch eine halbe Index.html im Ordner.
        const tmp = ziel + '.abgleich-tmp';
        fs.writeFileSync(tmp, neu);
        fs.renameSync(tmp, ziel);
        geschrieben.push({name, groesse: neu.length});
        console.log(`[ABGLEICH] ${name} uebernommen (${neu.length} Bytes) von ${quelle}`);
      }catch(e){
        fehler.push({name, grund: e.message});
        console.warn(`[ABGLEICH] ${name} fehlgeschlagen:`, e.message);
      }
    }
    res.json({
      ok: fehler.length === 0,
      geschrieben, fehler,
      sicherung: path.relative(__dirname, sicherung),
      neustartNoetig: geschrieben.some(g=>abgleichKategorie(g.name)==='programm')
    });
  }catch(e){
    console.error('[ABGLEICH] Fehler:', e);
    res.status(500).json({error: e.message});
  }
});


// ================================================================
// ABGLEICH BEIM START - der eigene Ordner zieht sich selbst nach
//
// Der Fall, um den es geht: Jemand macht über den Einladungslink mit und sieht
// dort den neuesten Stand. Startet er danach seinen EIGENEN Trainer, ist es
// wieder die alte Fassung aus seinem Ordner - denn der weiss von den
// Aenderungen nichts.
//
// Deshalb fragt der Trainer beim Start selbst beim Gastgeber nach und holt
// sich, was sich geaendert hat. Die Adresse steht in herkunft.json, die beim
// Herunterladen des Pakets mitgeliefert wurde.
//
// Grenzen, bewusst gesetzt:
//   - Nur Daten und Anzeige. Server.js wird NIE automatisch ersetzt; das
//     bleibt der ausdrueckliche Schritt im Abgleich-Fenster.
//   - Ist der Gastgeber nicht erreichbar, passiert schlicht nichts. Der Start
//     darf daran nicht haengen.
//   - Abschaltbar ueber AFU_AUTO_ABGLEICH=0.
// ================================================================
const AUTO_ABGLEICH_AN = process.env.AFU_AUTO_ABGLEICH !== '0';

function herkunftLesen(){
  try{
    const voll = path.join(__dirname, 'herkunft.json');
    if(!fs.existsSync(voll)) return null;
    const j = JSON.parse(fs.readFileSync(voll, 'utf8'));
    return quelleSaeubern(j.quelle);
  }catch(e){ return null; }
}

function herkunftSchreiben(quelle){
  try{
    const voll = path.join(__dirname, 'herkunft.json');
    let j = {};
    if(fs.existsSync(voll)){ try{ j = JSON.parse(fs.readFileSync(voll,'utf8')); }catch(e){} }
    j.quelle = quelle;
    j.zuletztGeaendert = new Date().toISOString();
    fs.writeFileSync(voll, JSON.stringify(j, null, 1));
    return true;
  }catch(e){ return false; }
}

// Was der letzte automatische Abgleich ergeben hat - der Trainer zeigt es an.
let letzterAutoAbgleich = null;

async function autoAbgleich(){
  if(!AUTO_ABGLEICH_AN){
    console.log('[ABGLEICH] Automatik ist per AFU_AUTO_ABGLEICH=0 abgeschaltet.');
    return;
  }
  const quelle = herkunftLesen();
  if(!quelle){
    // Der Trainer des Gastgebers selbst hat keine herkunft.json - dort gibt es
    // nichts abzugleichen. Das ist der Normalfall und keine Meldung wert.
    return;
  }
  console.log(`[ABGLEICH] Sehe beim Kursleiter nach: ${quelle}`);
  try{
    const fremd = JSON.parse(await holen(quelle + '/api/abgleich/stand', true));
    const eigen = abgleichStand();
    const zuHolen = [];
    for(const name of ABGLEICH_ALLE){
      if(abgleichKategorie(name) === 'programm') continue;      // niemals automatisch
      const a = eigen[name], b = fremd.dateien ? fremd.dateien[name] : null;
      if(!b) continue;
      if(a && a.hash === b.hash) continue;
      zuHolen.push(name);
    }
    // Server.js getrennt melden, aber nicht anfassen.
    const programmWeicht = ABGLEICH_PROGRAMM.some(n=>{
      const a = eigen[n], b = fremd.dateien ? fremd.dateien[n] : null;
      return b && (!a || a.hash !== b.hash);
    });

    if(!zuHolen.length){
      console.log('[ABGLEICH] Alles auf demselben Stand.'
        + (programmWeicht ? ' (Nur Server.js weicht ab - das wird bewusst nicht automatisch ersetzt.)' : ''));
      letzterAutoAbgleich = { zeit:new Date().toISOString(), quelle, geschrieben:[], programmWeicht };
      return;
    }

    const stempel = new Date().toISOString().slice(0,16).replace(/[:T]/g,'-');
    const sicherung = path.join(__dirname, 'backup', 'autoabgleich_' + stempel);
    fs.mkdirSync(sicherung, {recursive:true});
    const geschrieben = [];
    for(const name of zuHolen){
      try{
        const neu = await holen(quelle + '/api/abgleich/datei?name=' + encodeURIComponent(name), false);
        if(!neu || !neu.length) throw new Error('leere Antwort');
        const ziel = path.join(__dirname, name);
        if(fs.existsSync(ziel)) fs.copyFileSync(ziel, path.join(sicherung, name));
        const tmp = ziel + '.abgleich-tmp';
        fs.writeFileSync(tmp, neu);
        fs.renameSync(tmp, ziel);
        geschrieben.push(name);
      }catch(e){ console.warn(`[ABGLEICH] ${name} nicht geholt:`, e.message); }
    }
    letzterAutoAbgleich = { zeit:new Date().toISOString(), quelle, geschrieben, programmWeicht,
                            sicherung: path.relative(__dirname, sicherung) };
    if(geschrieben.length){
      console.log('');
      console.log('  ============================================================');
      console.log(`   ABGLEICH: ${geschrieben.length} Datei(en) vom Kursleiter uebernommen`);
      geschrieben.forEach(n=>console.log('     - ' + n));
      console.log(`   Die alten liegen in backup/autoabgleich_${stempel}`);
      if(programmWeicht){
        console.log('');
        console.log('   HINWEIS: Auch Server.js weicht ab. Das wird nicht automatisch');
        console.log('            ersetzt - im Trainer unter Info > Abgleich nachsehen.');
      }
      console.log('  ============================================================');
      console.log('');
    }
  }catch(e){
    console.log(`[ABGLEICH] Kursleiter nicht erreichbar (${e.message}) - es bleibt beim eigenen Stand.`);
    letzterAutoAbgleich = { zeit:new Date().toISOString(), quelle, fehler:e.message };
  }
}

// Der Trainer fragt das ab und zeigt es einmal an.
app.get('/api/abgleich/letzter', localOnly, (req,res)=>{
  res.json(letzterAutoAbgleich || {});
});

// Adresse des Gastgebers setzen - wird aus dem Abgleich-Fenster aufgerufen,
// damit eine neue Tunnel-Adresse nicht jedes Mal neu eingetippt werden muss.
app.post('/api/abgleich/herkunft', localOnly, (req,res)=>{
  const quelle = quelleSaeubern(req.body && req.body.quelle);
  if(!quelle) return res.status(400).json({error:'Keine gueltige Adresse'});
  if(!herkunftSchreiben(quelle)) return res.status(500).json({error:'Konnte nicht gespeichert werden'});
  console.log('[ABGLEICH] Adresse des Kursleiters gemerkt:', quelle);
  res.json({ok:true, quelle});
});

app.get('/api/lan-info',(req,res)=>{
  const adressen = lokaleAdressen();
  res.json({
    adressen: adressen.map(a=>({ip:a.ip, adapter:a.name, privat:a.privat})),
    port: PORT,
    empfehlung: adressen.length ? `http://${adressen[0].ip}:${PORT}` : null
  });
});

// ================================================================
//  WER SIEHT NOCH HIN?
// ================================================================
//  Dietmar am 01.09.2026: "Beim Schliessen von dem Browser bleibt der
//  Server am laufen."
//
//  Genau daher kamen die Fenster "Auf Port 3000 laeuft bereits ein
//  Trainer": Jeder Start hinterliess einen Server, der nie wieder
//  aufhoerte. Nach ein paar Tagen haengen mehrere davon im Speicher,
//  und der aus dem NEUEN Ordner kommt nicht mehr an den Port.
//
//  Die Seite meldet sich deshalb alle zehn Sekunden, und beim
//  Schliessen ausdruecklich ab. Meldet sich eine Minute lang niemand
//  mehr, macht der Server Feierabend.
//
//  Absichtlich zaehlt JEDER Zuschauer mit, auch Gaeste im Gruppenraum:
//  Wer als Gastgeber sein Fenster zumacht, waehrend die Gruppe noch
//  uebt, soll den anderen nicht den Server unter den Fuessen wegziehen.
// ================================================================
const zuschauer = new Map();   // Kennung -> zuletzt gesehen

// ----------------------------------------------------------------
//  WER IST GERADE DA?                               (21.09.2026)
//  Dietmar: "Moechte auch sehen, wer aktiv ist."
//
//  Die Antwort lag schon hier: Jeder offene Tab meldet sich alle zehn
//  Sekunden, damit der Server nicht abschaltet. Bisher wurde davon nur
//  die Uhrzeit behalten. Daneben liegt jetzt eine zweite Karte mit dem
//  Wenigen, das die Anzeige braucht - gekuerzte Adresse, Geraeteart,
//  seit wann.
//
//  BEWUSST EINE ZWEITE KARTE und nicht ein Objekt in der ersten: An
//  zuschauer haengt die Abschaltlogik ("meldet sich eine Minute
//  niemand, ist Feierabend"). Die rechnet mit einer Zahl. Ein Objekt
//  darin haette den Server im besten Fall nie mehr abschalten lassen.
// ----------------------------------------------------------------
const zuschauerInfo = new Map();   // Kennung -> {ip, geraet, extern, erst, letzt}

app.get('/api/lebenszeichen',(req,res)=>{
  const id = String(req.query.id || '').slice(0, 40);
  if(id){
    zuschauer.set(id, Date.now());
    try{
      const vorher = zuschauerInfo.get(id);
      // Wer sich meldet, war wirklich da: den juengsten Aufruf von
      // dieser Adresse als echt markieren.
      try{
        if(!isLocalRequest(req)){
          const wer = ipKuerzen(req.headers['cf-connecting-ip'] || req.ip);
          const b = besucherLesen();
          const grenze = Date.now() - 5*60*1000;
          for(let i = b.liste.length - 1; i >= 0; i--){
            const e = b.liste[i];
            if(e.zeit < grenze) break;
            if(e.ip === wer && !e.echt){
              e.echt = true;
              // Genau hier wird aus einem Aufruf ein Besucher - und nur
              // hier zaehlt die Fusszeile mit.
              zaehlerFrisch(b, Date.now());
              b.echte = (b.echte || 0) + 1;
              b.heute = (b.heute || 0) + 1;
              besucherSchreiben(false);
              break;
            }
          }
        }
      }catch(e){}

      zuschauerInfo.set(id, {
        ip:     ipKuerzen(req.headers['cf-connecting-ip'] || req.ip),
        land:   String(req.headers['cf-ipcountry'] || '').toUpperCase().slice(0, 2),
        stadt:  kopfText(req.headers['cf-ipcity']).slice(0, 40),
        // Der Name kommt vom Besucher selbst, aus dem Willkommensfenster.
        // Steuerzeichen und spitze Klammern raus: Er landet in der Liste
        // des Gastgebers, und was dort steht, darf nichts anrichten.
        name:   String(req.query.name || '').replace(/[\u0000-\u001F\u007F<>]/g, '').trim().slice(0, 20),
        geraet: geraetArt(req.headers['user-agent']),
        extern: !isLocalRequest(req),
        erst:   vorher ? vorher.erst : Date.now(),
        letzt:  Date.now()
      });
    }catch(e){}
  }
  res.json({ok:true});
});

// sendBeacon schickt POST. Beim Schliessen der Seite ist das der einzige
// Weg, der noch ankommt - ein normales fetch() wird abgebrochen.
app.post('/api/tschuess',(req,res)=>{
  const id = String(req.query.id || '').slice(0, 40);
  if(id && zuschauer.has(id)){
    zuschauer.delete(id);
    zuschauerInfo.delete(id);
    console.log('[ENDE] Zuschauer ' + id + ' hat sich abgemeldet.');
  }
  res.json({ok:true});
});

app.get('/api/tunnel-status',(req,res)=>{
  res.json({running: !!(tunnelProcess && !tunnelProcess.killed), url: tunnelUrlCache || null, pid: tunnelProcess ? tunnelProcess.pid : null});
});

// Was die Wache zu berichten hat. localOnly: Das geht nur den Gastgeber
// etwas an - ein Gast soll nicht sehen, wie oft die Leitung gewackelt hat.
app.get('/api/tunnel-wache', localOnly, (req,res)=>{
  res.json({
    an:              tunnelGewuenscht,
    laeuft:          !!(tunnelProcess && !tunnelProcess.killed),
    url:             tunnelUrlCache || null,
    letzterPuls:     tunnelWache.letzterPuls,
    letzterVersuch:  tunnelWache.letzterVersuch,
    fehlversuche:    tunnelWache.fehlversuche,
    neustarts:       tunnelWache.neustarts,
    letzterNeustart: tunnelWache.letzterNeustart,
    letzteAdresse:   tunnelWache.letzteAdresse,
    fehlstarts:      tunnelWache.fehlstarts,
    wartetBis:       tunnelWache.wartetBis || 0,
    meldung:         tunnelWache.meldung,
    pulsTaktMin:     Math.round(PULS_TAKT_MS/60000),
    imRaum:          duoTeilnehmerAnzahl(),
    jetzt:           Date.now()
  });
});

// Bekannte Windows-Absturzcodes (NTSTATUS als vorzeichenloser 32-Bit-Exitcode).
// piper.exe ist eine native .exe - wenn sie sofort ohne stderr-Ausgabe abstürzt,
// war es kein Text-/Modellfehler, sondern piper.exe selbst ist abgestürzt.
function getWinCrashHint(code){
  const map={
    3221225477: 'Access Violation (0xC0000005) – piper.exe ist abgestürzt, oft durch ein defektes/inkompatibles Sprachmodell (.onnx) oder eine beschädigte piper.exe.',
    3221225495: 'Illegal Instruction (0xC000001D) – piper.exe passt nicht zur CPU/Architektur dieses Rechners (z.B. falsche x86/x64/ARM-Version geladen).',
    3221225781: 'DLL nicht gefunden (0xC0000135) – piper.exe fehlt eine benötigte DLL (z.B. onnxruntime.dll) im piper/-Ordner.',
    3221226505: 'Stack Buffer Overrun / Fast-Fail (0xC0000409) – piper.exe ist sofort beim Start abgestürzt. Meist fehlt das "Microsoft Visual C++ Redistributable (x64)", oder piper.exe/die DLLs im piper/-Ordner sind unvollständig heruntergeladen bzw. wurden vom Virenscanner beschädigt/blockiert.'
  };
  return map[code] || null;
}

// ================================================================
// FIX K5: Schutz gegen unbegrenztes Starten von piper.exe.
// Vorher startete JEDER Request einen eigenen Subprozess - ohne
// Textlaengen-Limit, ohne Rate-Limit und ohne Begrenzung der
// gleichzeitigen Prozesse. 100 parallele Requests = 100 mal
// piper.exe = CPU/RAM des Rechners erschoepft.
// ================================================================
const TTS_MAX_TEXT_LEN   = 1000;  // Zeichen pro Anfrage
const TTS_MAX_PARALLEL   = 2;     // gleichzeitige piper.exe-Prozesse
const TTS_MAX_PER_MINUTE = 60;    // NEUE Synthesen pro Client und Minute (Cache zaehlt nicht mit)
let ttsActive = 0;
const ttsRateMap = new Map();

// ================================================================
//  WARTEN STATT ABSAGEN   (15.09.2026)
// ----------------------------------------------------------------
//  Dietmar am 15.09.2026, mit Bildschirmfoto von AC519: ein Fenster
//  "Piper meldet einen Fehler: Sprachausgabe gerade ausgelastet.
//  Bitte einen Moment warten." - mitten in der Frage, modal, mit
//  OK-Knopf.
//
//  Was dahinter steckte: Die Frage wird in Stuecken gesprochen, und
//  wer dabei mit der Maus ueber die Knoepfe faehrt, loest mit
//  "Knoepfe vorlesen" weitere Anfragen aus. Jede davon ist ein
//  eigener piper.exe-Prozess. Die dritte Anfrage traf auf zwei
//  laufende Prozesse (TTS_MAX_PARALLEL) und bekam ein glattes Nein -
//  und aus dem Nein machte der Browser ein Fehlerfenster.
//
//  Das Nein war nie der Sinn der Grenze. Die Grenze soll den Rechner
//  vor hundert gleichzeitigen piper.exe schuetzen, nicht die dritte
//  Anfrage abweisen. Deshalb wartet eine Anfrage jetzt kurz auf einen
//  freien Platz, statt abgelehnt zu werden. Abgelehnt wird erst, wenn
//  die Warteschlange voll ist oder das Warten zu lange dauert - das
//  ist der Fall "hundert Anfragen", nicht der Fall "dritter Satz".
//
//  Geht der Browser waehrend des Wartens weg (naechste Frage, Vorlesen
//  angehalten), wird der Eintrag ausgetragen. Sonst spraeche Piper
//  spaeter fuer niemanden.
// ================================================================
const TTS_MAX_WARTEND     = 16;      // Anfragen, die auf einen Platz warten duerfen
const TTS_MAX_WARTEZEIT_MS = 25000;  // laenger wartet niemand auf einen Satz
const ttsWarteschlange = [];

function ttsPlatzHolen(req, res){
  return new Promise((resolve, reject) => {
    if(ttsActive < TTS_MAX_PARALLEL){ ttsActive++; return resolve(); }
    if(ttsWarteschlange.length >= TTS_MAX_WARTEND) return reject(new Error('voll'));
    const eintrag = { resolve, reject, timer: null, weg: false };
    const austragen = () => {
      const i = ttsWarteschlange.indexOf(eintrag);
      if(i >= 0) ttsWarteschlange.splice(i, 1);
      clearTimeout(eintrag.timer);
    };
    eintrag.timer = setTimeout(() => { austragen(); reject(new Error('zeit')); }, TTS_MAX_WARTEZEIT_MS);
    // Der Browser hat die Anfrage aufgegeben - dann wartet hier niemand mehr.
    // Gehorcht wird der ANTWORT, nicht der Anfrage: req meldet 'close' schon,
    // sobald der Text eingelesen ist (Node 16+), und das waere hier jedes Mal.
    // res meldet 'close' erst, wenn die Verbindung weg ist - solange wir noch
    // nichts gesendet haben, heisst das: der Browser ist gegangen.
    res.on('close', () => { if(!eintrag.weg){ eintrag.weg = true; austragen(); reject(new Error('weg')); } });
    ttsWarteschlange.push(eintrag);
  });
}
function ttsPlatzFrei(){
  ttsActive = Math.max(0, ttsActive - 1);
  while(ttsWarteschlange.length){
    const n = ttsWarteschlange.shift();
    clearTimeout(n.timer);
    if(n.weg) continue;
    n.weg = true;
    ttsActive++;
    n.resolve();
    break;
  }
}

function clientKey(req){
  return String(req.headers['cf-connecting-ip'] || req.ip || 'unbekannt');
}
function ttsRateLimited(req){
  const key = clientKey(req);
  const now = Date.now();
  const entry = ttsRateMap.get(key);
  if(!entry || now > entry.reset){
    ttsRateMap.set(key, {count:1, reset: now + 60000});
    // Alte Eintraege aufraeumen, damit die Map nicht unbegrenzt waechst
    if(ttsRateMap.size > 500){
      for(const [k,v] of ttsRateMap){ if(now > v.reset) ttsRateMap.delete(k); }
    }
    return false;
  }
  entry.count++;
  return entry.count > TTS_MAX_PER_MINUTE;
}

app.post('/api/tts-preview',(req,res)=>{
  const txt=String(req.body.text||'').slice(0, TTS_MAX_TEXT_LEN);
  res.json({original:txt, expanded:expandTTS(txt)});
});
app.post('/api/tts',async (req,res)=>{
  let text=String(req.body.text||'').trim(); if(!text) return res.status(400).json({error:'Kein Text'});
  // FIX K5: Laengenbegrenzung
  if(text.length > TTS_MAX_TEXT_LEN){
    return res.status(413).json({error:`Text zu lang (${text.length} Zeichen, max. ${TTS_MAX_TEXT_LEN}).`});
  }
  const original=text; text=expandTTS(text);
  const voices=listVoices(); if(!voices.length) return res.status(500).json({error:'Keine Stimmen in piper/'});
  const voice=voices.find(v=>v.file===req.body.voice)||voices[0];
  // ================================================================
  //  DER KLANG DER STIMME                              (26.09.2026)
  //  Dietmar: "Koennen wir die Piperstimme anpassen? Zb. etwas
  //  schneller vorlesen und anders klingen lassen?"
  //
  //  Schneller macht der BROWSER (playbackRate, Tonlage bleibt) - so
  //  sind 1,25 oder 1,5 auch wirklich 1,25 oder 1,5. Pipers eigener
  //  Regler (length_scale) trifft das nicht: 0,8 brachte gemessen nur
  //  elf Prozent, weil Pausen und Satzenden nicht mitschrumpfen.
  //
  //  Der Klang dagegen kommt von Piper selbst: noise_scale und noise_w
  //  bestimmen, wie viel Schwankung die Stimme in Tonhoehe und
  //  Lautdauer hat. Weniger klingt gleichmaessig und ruhig, mehr
  //  lebhafter, fast wie beim Erzaehlen. Pipers Vorgaben sind 0,667
  //  und 0,8 - das ist "normal" und bleibt ohne Zusatz, damit der
  //  bisherige Cache weiter gilt. Die beiden anderen bekommen einen
  //  eigenen Cache-Schluessel.
  // ================================================================
  const TTS_KLANG = { ruhig: ['0.45', '0.6'], lebhaft: ['0.9', '1.0'] };
  const klang = TTS_KLANG[String(req.body.klang || '')] ? String(req.body.klang) : 'normal';
  const klangArgs = klang === 'normal' ? [] : ['--noise_scale', TTS_KLANG[klang][0], '--noise_w', TTS_KLANG[klang][1]];
  const hash=crypto.createHash('md5').update(voice.file+'::'+(klang === 'normal' ? '' : 'klang=' + klang + '::')+text).digest('hex');
  const out=path.join(TTS_CACHE_DIR,hash+'.wav');
  // Diagnose: Welche Stimme hat wirklich gesprochen? Der Client zeigt das an.
  // Ohne diese Auskunft ist von aussen nicht erkennbar, ob der Wunsch des
  // Browsers ueberhaupt angekommen ist oder ob die Standardstimme einsprang.
  res.setHeader('X-TTS-Voice', voice.file);
  res.setHeader('X-TTS-Rate', String(voice.sampleRate || 0));
  res.setHeader('Access-Control-Expose-Headers', 'X-TTS-Voice, X-TTS-Rate');
  // FIX W14: Piper schreibt in eine .tmp-Datei; erst nach erfolgreichem Ende
  // wird umbenannt. Vorher sah eine zweite Anfrage fuer denselben Text die
  // noch unfertige Datei als "Cache-Treffer" und schickte eine abgeschnittene
  // WAV - der Client fing das nur zufaellig ueber blob.size>500 ab.
  const outTmp = path.join(TTS_CACHE_DIR, hash + '.' + process.pid + '.tmp.wav');
  // Cache-Treffer kostet keinen Prozess und zaehlt bewusst NICHT gegen das
  // Rate-Limit - sonst wuerde normales schnelles Durchklicken ausgebremst.
  if(fs.existsSync(out)){ console.log(`[TTS] Cache Hit ${hash}`); res.setHeader('Content-Type','audio/wav'); return res.sendFile(out); }
  // FIX K5: Rate-Limit - greift erst hier, also nur fuer echte Synthese
  if(ttsRateLimited(req)){
    console.warn('[TTS] Rate-Limit erreicht fuer', clientKey(req));
    return res.status(429).json({error:'Zu viele neue Vorlese-Anfragen. Bitte kurz warten.'});
  }
  // FIX K5: Begrenzung der gleichzeitig laufenden piper.exe-Prozesse -
  // seit dem 15.09.2026 als Warteschlange, siehe oben bei ttsPlatzHolen.
  try{
    await ttsPlatzHolen(req, res);
  }catch(e){
    if(e.message === 'weg') return;          // Browser ist schon weiter, keine Antwort noetig
    console.warn(`[TTS] Abgelehnt (${e.message}) - ${ttsActive} Prozesse aktiv, ${ttsWarteschlange.length} wartend`);
    return res.status(429).json({error:'Sprachausgabe gerade ausgelastet. Bitte einen Moment warten.'});
  }
  // Waehrend des Wartens kann sich der Cache gefuellt haben - dieselbe
  // Antwort, die schon einmal gefragt wurde, spricht Piper nicht zweimal.
  if(fs.existsSync(out)){ ttsPlatzFrei(); console.log(`[TTS] Cache Hit ${hash} (nach Warten)`); res.setHeader('Content-Type','audio/wav'); return res.sendFile(out); }
  const piper=findPiper();
  console.log(`[TTS] ${piper.type} Model:${voice.file}${klang === 'normal' ? '' : ' Klang:' + klang} Text:${original.slice(0,60)} -> ${text.slice(0,80)}`);
  let proc,done=false,err='';
  // Platz ist belegt (ttsPlatzHolen) und wird garantiert genau einmal wieder frei
  let slotReleased = false;
  const releaseTtsSlot = ()=>{ if(slotReleased) return; slotReleased = true; ttsPlatzFrei(); };
  const opts={cwd:PIPER_DIR, env:{...process.env, PYTHONIOENCODING:'utf-8', PYTHONUTF8:'1'}};
  // FIX K7: spawn selbst kann synchron werfen - dann wuerde der Slot fuer immer belegt bleiben
  try{
    if(piper.type==='binary') proc=spawn(piper.path,['--model',voice.fullPath,'--output_file',outTmp, ...klangArgs],opts);
    // piper.path ist hier "python3" bzw. "python" - siehe findPiper.
    else proc=spawn(piper.path,['-m','piper','--model',voice.fullPath,'--output_file',outTmp, ...klangArgs],opts);
  }catch(spawnErr){
    releaseTtsSlot();
    console.error('[TTS] spawn fehlgeschlagen:', spawnErr.message);
    return res.status(500).json({error:'Piper konnte nicht gestartet werden: '+spawnErr.message});
  }
  proc.stderr.on('data',d=>{ const s=d.toString(); if(!s.includes('Missing phoneme')) err+=s; });
  proc.on('error',e=>{ if(done) return; done=true; releaseTtsSlot(); res.status(500).json({error:e.message}); });
  proc.on('exit',code=>{
    if(done) return; done=true;
    releaseTtsSlot();
    if(code===0&&fs.existsSync(outTmp)){
      const sz=fs.statSync(outTmp).size;
      console.log(`[TTS] WAV ${sz} bytes`);
      // FIX W14: erst jetzt sichtbar machen - ab hier ist die Datei vollstaendig
      try{
        if(fs.existsSync(out)) fs.unlinkSync(out);   // Windows: rename ueberschreibt nicht
        fs.renameSync(outTmp, out);
      }catch(e){
        console.warn('[TTS] Umbenennen fehlgeschlagen, liefere direkt aus:', e.code||e.message);
        res.setHeader('Content-Type','audio/wav');
        return res.sendFile(outTmp);
      }
      res.setHeader('Content-Type','audio/wav');
      res.sendFile(out);
    } else {
      const crashHint = (process.platform === 'win32') ? getWinCrashHint(code) : null;
      console.error(`[TTS] Fehler Exitcode=${code} stderr="${err.slice(0,300)}" piper.path=${piper.path} (${piper.quelle}) voice=${voice.fullPath}`);
      let msg;
      // Auf Linux und am Mac hilft kein Wort ueber DLLs und
      // Visual-C++-Pakete. Dort steht, was dort wirklich zu tun ist.
      if(process.platform !== 'win32'){
        msg = 'Die Sprachausgabe liess sich nicht starten (Code ' + code + ').'
            + (err ? '\n\nMeldung: ' + err.slice(0,400) : '')
            + '\n\nGesucht wurde: ' + piper.quelle + ' (' + piper.path + ').'
            + '\n\nSo kommt Piper auf dieses System:'
            + '\n1. Fertiges Programm: das Archiv fuer Linux von'
            + ' github.com/rhasspy/piper/releases holen und so entpacken, dass die Datei'
            + ' piper im Ordner piper/ liegt. Danach einmal: chmod +x piper/piper'
            + '\n2. Oder als Python-Modul: pip install piper-tts'
            + ' - dann muss python3 auf dem Systempfad liegen.'
            + '\n3. Die Stimmen (.onnx samt .onnx.json) gehoeren in denselben Ordner piper/.'
            + '\n\nDer Trainer laeuft ohne Piper vollstaendig weiter - nur vorgelesen wird nicht.';
      } else if(crashHint){
        msg = `piper.exe ist abgestürzt (Code ${code}). ${crashHint}\n\nLösungsvorschläge:\n1. "Microsoft Visual C++ Redistributable x64" installieren (falls nicht vorhanden): aka.ms/vs/17/release/vc_redist.x64.exe\n2. piper.exe + alle Dateien im piper/-Ordner (inkl. onnxruntime.dll, espeak-ng-data/) frisch von github.com/rhasspy/piper/releases neu entpacken.\n3. Virenscanner-Ausnahme für den piper/-Ordner setzen, da piper.exe sonst evtl. blockiert/beschädigt wird.\n4. piper.exe testweise direkt per Kommandozeile starten, um eine ausführlichere Fehlermeldung zu sehen.`;
      } else {
        msg = 'TTS Fehler '+code+(err? ': '+err.slice(0,500) : ' (piper.exe hat keine Fehlerausgabe geliefert - vermutlich Absturz vor jeglicher Ausgabe).');
      }
      res.status(500).json({error: msg, exitCode: code});
      try{ if(fs.existsSync(outTmp)) fs.unlinkSync(outTmp); }catch(e){ console.debug('[TTS] tmp-Rest:', e.code); }
    }
  });
  // FIX K7: stdin braucht einen eigenen error-Listener. Schlaegt der Start von
  // piper.exe fehl (fehlende DLL, Virenscanner, falsche Architektur), wirft der
  // Stream EPIPE/ENOENT. Ohne Listener wurde daraus ein uncaughtException und
  // der ganze Server beendete sich.
  proc.stdin.on('error', (e)=>{
    console.error('[TTS] stdin-Fehler (piper nicht gestartet?):', e.code || e.message);
    if(done) return; done = true;
    releaseTtsSlot();
    res.status(500).json({error:'Piper konnte nicht gestartet werden: '+(e.code||e.message)});
  });
  try{
    proc.stdin.setDefaultEncoding('utf-8');
    proc.stdin.write(text,'utf-8');
    proc.stdin.end();
  }catch(e){
    console.error('[TTS] stdin-Schreibfehler:', e.message);
    if(!done){ done = true; releaseTtsSlot(); res.status(500).json({error:'Piper stdin: '+e.message}); }
  }
});
// ================================================================
// FIX K1: Statische Auslieferung nur noch nach Whitelist.
//
// Vorher gab express.static(__dirname) den KOMPLETTEN Projektordner frei -
// ueber den oeffentlichen Tunnel also auch Server.js, package.json,
// data/userdata/amateurfunk_data.json (alle Lerndaten), tunnel.log,
// node_modules/, original/ und cloudflared.exe (54 MB).
//
// Bewusst als Whitelist umgesetzt und nicht als Sperrliste: eine neue
// Datei im Projektordner ist damit automatisch NICHT oeffentlich.
// Die Ordnerstruktur bleibt unveraendert, damit alle bestehenden
// Windows-Pfade und Batch-Dateien weiter funktionieren.
// (/svgs wird bereits weiter oben separat gemountet.)
// ================================================================
const PUBLIC_FILES = new Set([
  '/',
  '/index.html',
  // Support und Datenschutz (22.09.2026). Kleingeschrieben, wie alles
  // hier; die Datei heisst support.html.
  '/support.html',
  // Das Konfetti, seit dem 22.09.2026 im Ordner statt bei jsDelivr.
  '/confetti.browser.js',
  '/duo.js',
  '/fragen.json',
  // Die Fragenpools der hoeheren Klassen. fragen.json (Klasse N) bleibt
  // unveraendert; jede weitere Pruefung hat ihre eigene Datei, damit ein
  // Fehler in einer davon die Klasse N nicht mitreisst.
  // Kleingeschrieben eintragen: isPublicPath() vergleicht in Kleinschrift,
  // damit Windows-Pfade mit abweichender Gross-/Kleinschreibung nicht am
  // Schutz vorbeikommen. Die Dateien selbst heissen "Fragen-E.json" usw.,
  // ausgeliefert wird der Pfad unveraendert.
  '/fragen-e.json',
  '/fragen-a.json',
  '/fragen-n-auf-e.json',
  '/fragen-e-auf-a.json',
  '/fragen-n-auf-a.json',
  '/svg-list.json',
  '/video_map_embed.js',
  // Inhaltsverzeichnis des Videolehrgangs (Kapitelmarken je Lektion). Wird von
  // der Lektionsuebersicht gelesen; enthaelt nur oeffentliche Kursdaten, keine
  // Nutzerdaten. Ohne diesen Eintrag lief der Abruf in einen 404.
  '/video_lessons.json',
  // Zuordnung Frage -> Kapitel im Lehrgang des DARC (50ohm.de). Kommt vom
  // DARC, enthaelt nur oeffentliche Kursdaten - Fragennummer, Kapitelname,
  // Adresse der Lernseite. Die Datei ist freiwillig: Fehlt sie, faellt in
  // der Frageansicht nur der zweite Hinweiskasten weg. Ohne diesen Eintrag
  // liefe der Abruf in einen 404 und der Kasten erschiene nie.
  '/50ohm_map.json',
  // Dieselbe Sorte Daten, nur genauer: die Zuordnung, die der DARC selbst
  // veroeffentlicht (question_index.json). Sie kommt ueber
  // /api/50ohm-index-holen in den Ordner und wird von hier gelesen.
  '/50ohm_index.json',
  '/klick-sound.js',
  // Die drei Stuecke der PWA. Ohne sie meldet der Browser einen 404 und
  // der Trainer bleibt eine gewoehnliche Seite mit Adressleiste:
  //   manifest  - Name, Symbol, Start ohne Adressleiste
  //   sw.js     - macht installierbar und laesst ohne Netz starten
  //   Symbole   - was auf dem Startbildschirm liegt
  // Kleingeschrieben eintragen, isPublicPath() vergleicht in Kleinschrift.
  '/manifest.webmanifest',
  '/sw.js',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-512-maskierbar.png',
  '/icon.icns',
  '/icon.png',
  '/favicon.ico',
  // Merkzettel fuer den Probelauf des Updaters, angelegt von
  // Update-Test.bat. Die Seite sieht regelmaessig nach, ob es ihn gibt;
  // ohne diesen Eintrag stuende bei jedem Blick eine Sicherheitswarnung im
  // Serverfenster, sobald die Datei einmal da ist. Sie enthaelt nur einen
  // Zeitstempel - nichts, was jemanden angehen koennte - und steht in der
  // .gitignore. Im Normalfall gibt es sie gar nicht, dann ist das hier
  // schlicht ein Eintrag ins Leere.
  '/update_test.json',
  // Zuordnung Frage -> Stelle in der Formelsammlung. Enthaelt nur
  // Fragennummern und Abschnittsnamen; die Seitenbilder liegen in
  // /formelsammlung/ und sind ueber PUBLIC_DIRS freigegeben.
  '/formelhilfe.json',
  // Erklaerungen zu den Fragen mit Zeichnung (was im Bild steht, der
  // Rechenweg, und warum jede falsche Antwort falsch ist). Reine
  // Kursdaten wie 50ohm_map.json daneben - keine Nutzerdaten.
  //
  // Am 13.09.2026 beim Einbau gemerkt: Ohne diesen Eintrag lief der
  // Abruf in einen 404 und der Erklaerkasten erschien nie. Genau der
  // Fall, den der Kommentar oben vorhersagt ("eine neue Datei im
  // Projektordner ist damit automatisch NICHT oeffentlich") - der
  // Schutz hat funktioniert, ich hatte ihn nur vergessen.
  '/erklaerungen.json',
  // Das Bild fuer die Link-Vorschau (1200x630). Es muss oeffentlich sein,
  // sonst holt Facebook es nicht: Der Crawler kommt ohne alles, was der
  // Browser eines Gastes mitbringt, und bekaeme sonst einen 404 - die
  // Kachel bliebe leer. Im Bild steht nichts als Programmzahlen.
  '/vorschau.jpg',
  // Dieselbe Kachel, aber mit "Anklicken. Mitmachen." - sie kommt, wenn im
  // Link ein Raumcode steht. Wer eine Einladung bekommt, soll auch eine
  // Einladung sehen.
  '/vorschau-raum.jpg'
]);
// /fontawesome/ kam am 01.09.2026 dazu: die Symbolschrift liegt jetzt im
// Ordner statt bei einem CDN. Ohne diesen Eintrag waeren die Symbole zwar
// da, aber nicht abrufbar - der Schutz laesst nur durch, was hier steht.
// /fonts/ seit dem 22.09.2026: die Textschriften, vorher von Google.
const PUBLIC_DIRS = ['/svgs/', '/sounds/', '/formelsammlung/', '/fontawesome/', '/fonts/'];

function isPublicPath(rawPath){
  let p;
  try{ p = decodeURIComponent(String(rawPath||'')); }catch(e){ return false; }
  p = p.replace(/\\/g, '/');            // Windows-Backslashes vereinheitlichen
  if(p.indexOf('\0') !== -1) return false;
  if(p.split('/').includes('..')) return false;   // Verzeichnis-Traversal
  p = p.toLowerCase();
  if(p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  if(p === '') p = '/';
  if(PUBLIC_FILES.has(p)) return true;
  // Die amtlichen PDFs, nach denselben Mustern wie im Paket. Oeffentlich,
  // damit sie sich im Browser aufschlagen lassen - auch ueber den
  // Einladungslink. Es sind Dokumente der Bundesnetzagentur unter der
  // Datenlizenz Deutschland; persoenliches steht nicht darin.
  if(p.startsWith('/') && p.indexOf('/', 1) === -1
     && PAKET_PDF_MUSTER.some(m => m.test(p.slice(1)))) return true;
  return PUBLIC_DIRS.some(d => p.startsWith(d));
}

// localOnly: Die Besucherliste geht nur den Gastgeber an seinem eigenen
// Rechner etwas an. Ein Gast ueber den Einladungslink bekommt hier 403 -
// auch dann, wenn er sich im Trainer "Dietmar" nennt. Der Name im
// Programm entscheidet nur, OB die Liste angezeigt wird; erreichbar ist
// sie ausschliesslich von diesem PC.
app.get('/api/besucher', localOnly, (req, res) => {
  const b = besucherLesen();
  let raeume = 0;
  try{ raeume = Object.keys(duoRaeume || {}).length; }catch(e){}
  // Wer ist JETZT da? Der Takt ist zehn Sekunden; wer sich vierzig
  // Sekunden nicht gemeldet hat, hat den Tab zugemacht (oder die
  // Verbindung ist weg - beides heisst "nicht mehr da").
  const grenze = Date.now() - 40000;
  const aktive = [];
  try{
    zuschauerInfo.forEach((v, k) => {
      if(!v || v.letzt < grenze) return;
      aktive.push({ kennung: String(k).slice(0, 6), ip: v.ip, land: v.land || '', stadt: v.stadt || '',
                    name: v.name || '', geraet: v.geraet,
                    extern: !!v.extern, seit: v.erst, letzt: v.letzt });
    });
    aktive.sort((x, y) => y.letzt - x.letzt);
  }catch(e){}

  // Aufrufe sind nicht Besucher: Wer zweimal laedt, steht zweimal in der
  // Liste. Fuer "wie weit reicht die Werbung" ist die Zahl der
  // verschiedenen Adressen die ehrlichere Auskunft.
  let verschiedene = 0, echte = 0, angeklopft = 0;
  try{
    verschiedene = new Set(b.liste.filter(x => x.echt).map(x => x.ip)).size;
    echte = b.liste.filter(x => x.echt).length;
    angeklopft = b.liste.length - echte;
  }catch(e){}

  // Wer an die Tuer geklopft hat und wartet. Die volle Adresse muss mit -
  // der Gastgeber schickt sie beim Freigeben zurueck. Sie verlaesst
  // diesen PC nicht: /api/besucher ist localOnly.
  const anfragen = [];
  try{
    zutrittAnfragen.forEach((v, ip) => {
      anfragen.push({ ip: ip, kurz: ipKuerzen(ip), land: v.land || '', stadt: v.stadt || '',
                      geraet: v.geraet || '', wann: v.wann });
    });
    anfragen.sort((x, y) => y.wann - x.wann);
  }catch(e){}

  res.json({
    gesamt: b.gesamt,
    // Seit dem 22.09.2026 der Zaehlstand aus der Datei, nicht mehr die
    // Zahl der echten Eintraege in der Liste. Beides war gleich, solange
    // niemand die Liste anfasste. Seit "Verlauf loeschen" die Liste leert
    // und die Zahlen stehen laesst, stand oben im Besucherfenster "0
    // Besucher ueber den Link", waehrend die Fusszeile weiter zaehlte.
    // Die Kopfzeile zeigt jetzt dieselbe Zahl wie die Fusszeile; nur
    // "von n verschiedenen Adressen" und "angeklopft" kommen weiter aus
    // der Liste - woher sonst.
    echte: (typeof b.echte === 'number') ? b.echte : echte,
    angeklopft: angeklopft,
    verschiedene: verschiedene,
    // Die Laendersperre: wie viele Aufrufe sie seit dem Start abgewiesen
    // hat, wer gerade anfragt und wer schon freigegeben ist.
    abgewiesen: zutrittAbgewiesen,
    // Wie viele davon vor verschlossener Tuer standen (Auffangseite).
    offlineUebernommen: b.offlineUebernommen || 0,
    anfragen: anfragen,
    freigegeben: zutrittFrei.size,
    sperre: laenderSperreAn,
    seit: b.seit,
    aktive: aktive,
    aktivExtern: aktive.filter(x => x.extern).length,
    // duoTeilnehmerAnzahl() gibt es schon - sie zaehlt die Leute in allen
    // offenen Raeumen und ist die Zahl, die auch die Tunnel-Wache benutzt.
    imRaum: duoTeilnehmerAnzahl(),
    raeume: raeume,
    // SERVER_START gibt es schon weiter oben - als ISO-Text vom Start des
    // Servers. Genau das ist gemeint: so lange ist der Link offen.
    laeuftSeit: SERVER_START,
    tunnel: tunnelUrlCache || null,
    liste: b.liste.slice(-60).reverse()
  });
});

// ================================================================
//  DIE ANSAGE VOR DEM NEUSTART                      (21.09.2026)
//  ----------------------------------------------------------------
//  Dietmar: "Nur so kann ich als Host schreiben, ich starte neu. So
//  reisst es einfach ab und die Benutzer aergern sich." Und gleich
//  darauf der Vorschlag: "Hier koennte man einen Button einbauen
//  Neustart. Danach bekommen alle einen Hinweis: Der Server wird neu
//  gestartet in 3 Minuten. Der Link dazu wird erneut geteilt."
//
//  Genau das macht diese Ansage. Sie startet nichts - sie sagt es nur
//  allen, die gerade da sind, und zeigt einen Countdown. Neu gestartet
//  wird von Hand, wie bisher.
//
//  Warum nicht der Server selbst? Weil ein Programm, das sich unter
//  Windows selbst neu startet, ein Fenster, einen Node-Pfad und einen
//  Starter braucht, den es hier in drei Varianten gibt (START.vbs,
//  START.bat, der Installer-Eintrag). Das waere die unzuverlaessigste
//  Stelle im ganzen Trainer. Ein Mensch, der auf X klickt und neu
//  startet, ist hier das robustere Bauteil.
//
//  Die Ansage steht auch fuer den, der erst danach dazukommt: Wer in
//  Minute zwei den Link anklickt, soll nicht in einen Abbruch laufen,
//  von dem alle anderen wussten.
// ================================================================
let neustartAnsage = null;   // { um, min, gesetzt, fest }

function neustartAnsageGueltig(){
  if(!neustartAnsage) return null;
  // Eine Viertelstunde nach dem angesagten Zeitpunkt ist sie nichts mehr
  // wert - dann wurde offenbar doch nicht neu gestartet.
  if(Date.now() > neustartAnsage.um + 15*60*1000){ neustartAnsage = null; return null; }
  return neustartAnsage;
}

app.post('/api/neustart-ansage', localOnly, (req, res) => {
  const min = Math.max(1, Math.min(60, Number(req.query.min || 3)));
  // ----------------------------------------------------------------
  //  BLEIBT DIE ADRESSE?                             (21.09.2026)
  //  Dietmar: "Die Adresse aendert sich doch jetzt nicht mehr ^^"
  //
  //  Stimmt - seit der benannte Tunnel laeuft, steht der Link fest.
  //  Der Balken behauptete trotzdem noch das Gegenteil, weil er aus
  //  der Zeit der Wegwerf-Adressen stammt.
  //
  //  Wissen kann das nur der Gastgeber: Die eigene Adresse steht in
  //  SEINEM Browser. Also sagt er es beim Ansagen mit, und der Server
  //  reicht es an alle weiter.
  // ----------------------------------------------------------------
  const fest = (String(req.query.fest || '') === '1');
  neustartAnsage = { um: Date.now() + min*60*1000, min: min, gesetzt: Date.now(), fest: fest };
  let n = 0;
  try{
    if(duoIo){
      duoIo.sockets.sockets.forEach(function(sock){
        try{ sock.emit('neustartAnsage', neustartAnsage); n++; }catch(e){}
      });
    }
  }catch(e){}
  console.log('[NEUSTART] Ansage an ' + n + ' Verbundene: in ' + min + ' Minuten'
            + (fest ? ', Adresse bleibt.' : ', neue Adresse danach.'));
  res.json({ ok: true, um: neustartAnsage.um, min: min, fest: fest, erreicht: n });
});

app.post('/api/neustart-ansage-weg', localOnly, (req, res) => {
  neustartAnsage = null;
  try{
    if(duoIo) duoIo.sockets.sockets.forEach(function(sock){
      try{ sock.emit('neustartAnsage', null); }catch(e){}
    });
  }catch(e){}
  console.log('[NEUSTART] Ansage zurueckgenommen.');
  res.json({ ok: true });
});

// Die drei Zahlen fuer die Fusszeile. Bewusst OHNE localOnly: Sie soll
// jeder sehen, der den Trainer vor sich hat - auch der Besucher ueber den
// geteilten Link. Herausgegeben werden nur Zahlen, keine Adressen, keine
// Staedte, keine Namen; die Besucherliste selbst bleibt localOnly.
// ----------------------------------------------------------------
//  BESUCHER, DIE VOR VERSCHLOSSENER TUER STANDEN        (23.09.2026)
//  Dietmar: "wenn mein Server nicht eingeschaltet ist, koennen wir auf
//  der Seite, dass ich derzeit nicht On bin, einen Counter einbauen?" -
//  derselbe Zaehler wie hier.
//
//  Die Auffangseite zaehlt bei Cloudflare mit (worker.js, DER
//  BESUCHERZAEHLER). Kommt diese Abfrage ueber die eigene Domain, haengt
//  der Worker den Stand dort an (x-auffang-offline: so viele insgesamt).
//  Was davon neu ist, wird hier uebernommen; offlineAbgeholt merkt sich,
//  bis wohin. In der Antwort steht beides, und der Worker merkt es sich
//  fuer die naechste Auffangseite.
//
//  Die Kopfzeile wird nur geglaubt, wenn die Anfrage durch Cloudflare
//  kam (cf-ray), und je Abfrage werden hoechstens 1000 uebernommen -
//  eine Sicherung fuer den Fall, dass jemand sie am Worker vorbei selbst
//  setzt. Ohne Worker oder ohne Kopfzeile aendert sich nichts.
// ----------------------------------------------------------------
function auffangUebernehmen(req, b){
  const roh = req.headers['x-auffang-offline'];
  if(roh === undefined || !req.headers['cf-ray']) return;
  const offline = Math.floor(Number(roh));
  if(!isFinite(offline) || offline < 0) return;
  const abgeholt = b.offlineAbgeholt || 0;
  if(offline > abgeholt){
    const neu = Math.min(offline - abgeholt, 1000);
    b.echte = (b.echte || 0) + neu;
    b.offlineUebernommen = (b.offlineUebernommen || 0) + neu;
    b.offlineAbgeholt = abgeholt + neu;
    besucherSchreiben(true);
    console.log('[BESUCHER] ' + neu + (neu === 1 ? ' Besuch' : ' Besuche')
              + ' von der Auffangseite uebernommen (waehrend der Trainer nicht erreichbar war).');
  } else if(offline < abgeholt){
    // Der Speicher bei Cloudflare wurde neu angelegt - von vorn.
    b.offlineAbgeholt = offline;
    besucherSchreiben(true);
  }
}

// ----------------------------------------------------------------
//  DER AUFSCHLAG AUF DEN ZAEHLER                       (25.09.2026)
//  Dietmar: "Hier waere auch eine Bat gut, wo ich das selbst setzen
//  kann. So bleibt das aus dem Hauptcode raus."
//
//  Auf Wunsch kommt zur Zahl der Besucher ein fester Aufschlag dazu. Er
//  steht NICHT hier im Code, sondern in besucher_aufschlag.txt neben
//  Server.js, und wird am Rechner des Gastgebers von Hand gesetzt. Hier
//  ist nur die Stelle, die ihn liest. Fehlt die Datei - so wird der
//  Trainer ausgeliefert, sie steht in keiner Paketliste und in
//  .gitignore -, ist der Aufschlag 0.
//
//  Er kommt nur auf "gesamt", die Zahl in der Fusszeile - und, weil der
//  Worker seine Zahl von hier holt, auf der Startseite bei Cloudflare.
//  Die Besucherliste im Fenster des Gastgebers zaehlt weiter nur die
//  echten. "Zaehler zuruecksetzen" setzt ihn auf 0 (/api/besucher/reset).
//  Gelesen wird bei jeder Abfrage neu, ein Neustart ist nicht noetig.
// ----------------------------------------------------------------
const AUFSCHLAG_FP = path.join(__dirname, 'besucher_aufschlag.txt');
function besucherAufschlag(){
  try{
    const n = parseInt(String(fs.readFileSync(AUFSCHLAG_FP, 'utf8')).replace(/[^0-9]/g, ''), 10);
    return (isFinite(n) && n > 0) ? Math.min(n, 999999999) : 0;
  }catch(e){ return 0; }
}

app.get('/api/besucherzahl', (req, res) => {
  try{
    const b = zaehlerFrisch(besucherLesen(), Date.now());
    try{ auffangUebernehmen(req, b); }catch(e){}
    res.set('Cache-Control', 'no-store');
    res.json({ heute: b.heute || 0, gestern: b.gestern || 0,
               gesamt: (b.echte || 0) + besucherAufschlag(), seit: b.seit || 0,
               offlineAbgeholt: b.offlineAbgeholt || 0 });
  }catch(e){ res.json({ heute:0, gestern:0, gesamt:0, seit:0 }); }
});

// Zaehler auf Null. Dietmar am 21.09.2026: "hier fehlt ein Reset Knopf."
// Stimmt - nach einem Probelauf steht sonst eine Zahl da, die nichts mit
// der Werbung zu tun hat, die gerade laeuft. localOnly wie das Lesen: Ein
// Gast soll die Zahlen des Gastgebers weder sehen noch loeschen koennen.
app.post('/api/besucher/reset', localOnly, (req, res) => {
  // Seit dem 22.09.2026 nur noch die ZAHLEN. Die Liste bleibt stehen -
  // fuer sie gibt es darunter einen eigenen Weg. Dietmar: "Zaehler
  // zuruecksetzen? Ist das der Zaehler fuer Besucher? Wenn ja, dann
  // benoetigen wir einen Button, den Verlauf loeschen." Vorher raeumte
  // dieser Knopf beides auf einmal weg, ohne es zu sagen.
  const b = besucherLesen();
  b.gesamt = 0; b.echte = 0; b.heute = 0; b.gestern = 0; b.offlineUebernommen = 0;
  b.tag = tagSchluessel(Date.now()); b.seit = Date.now();
  besucherSchreiben(true);
  // Der Aufschlag geht mit auf Null (25.09.2026, siehe DER AUFSCHLAG
  // AUF DEN ZAEHLER). Nur wenn es die Datei gibt - sonst entstuende sie
  // hier erst.
  try{
    if(fs.existsSync(AUFSCHLAG_FP)) fs.writeFileSync(AUFSCHLAG_FP, '0\r\n');
  }catch(e){ console.warn('[BESUCHER] Aufschlag nicht zurueckgesetzt:', e.message); }
  console.log('[BESUCHER] Zaehler zurueckgesetzt (Liste bleibt).');
  res.json({ ok: true, gesamt: 0, seit: b.seit });
});

// Die Liste leeren - wer wann von wo da war. Die Zahlen bleiben.
app.post('/api/besucher/verlauf-loeschen', localOnly, (req, res) => {
  const b = besucherLesen();
  const n = b.liste.length;
  b.liste = [];
  besucherSchreiben(true);
  console.log('[BESUCHER] Verlauf geloescht (' + n + ' Eintraege).');
  res.json({ ok: true, geloescht: n });
});

app.use((req,res,next)=>{
  if(isPublicPath(req.path)) return next();
  // Nur dann warnen, wenn wirklich eine vorhandene Datei blockiert wurde -
  // sonst wuerde jeder normale 404 (z.B. video_map.json) das Log fluten.
  try{
    const probe = path.join(__dirname, decodeURIComponent(req.path));
    if(probe.startsWith(__dirname) && fs.existsSync(probe)){
      console.warn('[SEC] Zugriff auf nicht freigegebene Datei blockiert:', req.method, req.path);
    }
  }catch(e){}
  return res.status(404).send('Not found');
});
// ================================================================
//  DIE KACHEL BEIM TEILEN - UND WER VORBEIGEKOMMEN IST
//  ----------------------------------------------------------------
//  Dietmar am 21.09.2026, mit zwei Bildern aus Facebook: "Wenn ich den
//  Trainer Link vom Gruppenraum teilen moechte, gibt es keine Vorschau.
//  Kann man das einbauen? Auch wenn ich E nach A eingestellt habe, es
//  zeigt Amateurfunk Trainer Klasse N in der Vorschau."
//
//  Beides hat denselben Grund: Im Kopf von Index.html stand nichts, was
//  Facebook lesen koennte. Ohne og:-Zeilen nimmt der Crawler notgedrungen
//  den <title> - und der ist seit jeher fest auf "Klasse N" geschrieben.
//  Das eingestellte Pruefungsziel liegt ausserdem nur im Browser des
//  Gastgebers; ein Crawler fuehrt kein JavaScript aus und kann es gar
//  nicht sehen.
//
//  WARUM EINE EIGENE SEITE FUER DIE CRAWLER und nicht einfach og:-Zeilen
//  in Index.html: Die absolute Adresse des Bildes muss mit im Kopf stehen
//  (relative Pfade nimmt Facebook nicht), und die kennt niemand im
//  Voraus - der Tunnel heisst nach jedem Neustart anders. Sie steht erst
//  im Augenblick der Anfrage fest, im Host-Kopf. Index.html ist knapp
//  zwei Megabyte; die bei jedem Aufruf durch eine Textersetzung zu
//  jagen, waere Verschwendung. Also bekommt nur der Crawler eine eigene,
//  winzige Seite - ein Mensch bekommt wie bisher den Trainer. Wer doch
//  einmal mit so einer Kennung vorbeikommt, wird weitergeleitet.
// ================================================================
const VORSCHAU_CRAWLER = /facebookexternalhit|facebookcatalog|facebot|twitterbot|whatsapp|telegrambot|discordbot|slackbot|linkedinbot|skypeuripreview|redditbot|applebot|iframely|vkshare|pinterest|mastodon|embedly|quora link preview|bitlybot|nuzzel|xing|threadsbot|bluesky/i;

function htmlText(x){
  return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
// Unter welcher Adresse hat uns der Crawler erreicht? Genau die gehoert in
// die Kachel - beim Tunnel ist das die trycloudflare-Adresse, im WLAN die
// des Rechners.
function adresseAusAnfrage(req){
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  if(!host) return '';
  let proto = String(req.headers['x-forwarded-proto'] || req.protocol || 'http').split(',')[0].trim();
  // Ueber den Tunnel kommt die Anfrage innen als http an, aussen ist sie
  // https. Facebook holt das Bild nur ueber https, wenn die Seite so kam.
  if(/trycloudflare\.com$|\.cfargotunnel\.com$/i.test(host)) proto = 'https';
  return proto + '://' + host;
}

app.get('/', (req, res, next) => {
  const kennung = String(req.headers['user-agent'] || '');
  if(!VORSCHAU_CRAWLER.test(kennung)) return next();   // Menschen bekommen den Trainer

  const basis = adresseAusAnfrage(req);
  const raum  = String(req.query.duo || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 12);
  const titel = 'Amateurfunk-Trainer \u2014 Pr\u00fcfung Klasse N, E und A \u00fcben';
  // Der Demo-Hinweis steht bewusst mit drin. Dietmar am 21.09.2026:
  // "Demo Mode - Der Trainer ist nur so lange aktiv, wie der Trainer
  // laeuft." Wer den Link in vier Wochen anklickt, laeuft sonst in eine
  // tote Seite und haelt das Programm fuer kaputt. So weiss er vorher,
  // woran er ist - und wo er es zum Behalten bekommt.
  // "Demo" ja, aber ohne Behauptung ueber den, der sie betreibt - und
  // ohne "die Adresse aendert sich", was mit eigener Domain nicht mehr
  // stimmt. Siehe der lange Kommentar am Willkommensfenster.
  const demo = ' Der Trainer l\u00e4uft auf einem privaten Rechner und ist erreichbar, solange '
             + 'dieser eingeschaltet ist. Zum Behalten gibt es das Programm kostenlos auf '
             + 'amateurfunk-gruppe.github.io/Amateurfunk-Trainer.';
  const text  = (raum
    ? 'Einladung in den Gruppenraum: gemeinsam \u00fcben, Frage f\u00fcr Frage, mit Punktestand. '
      + 'Der amtliche Fragenkatalog der Bundesnetzagentur mit einer Erkl\u00e4rung zu jeder Frage.'
    : 'Der amtliche Fragenkatalog der Bundesnetzagentur mit einer Erkl\u00e4rung zu jeder Frage. '
      + 'Klasse N, E und A \u2014 ohne Konto, ohne Anmeldung.') + demo;
  const ziel = basis + (raum ? '/?duo=' + encodeURIComponent(raum) : '/');
  const bild = basis + (raum ? '/vorschau-raum.jpg' : '/vorschau.jpg');

  console.log('[VORSCHAU] Kachel ausgeliefert an ' + kennung.slice(0, 60)
              + (raum ? ' (Raum ' + raum + ')' : ''));
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.set('Cache-Control', 'no-store');   // die Adresse wechselt mit dem Tunnel
  res.send('<!DOCTYPE html>\n<html lang="de"><head><meta charset="utf-8">'
    + '<title>' + htmlText(titel) + '</title>'
    + '<meta name="description" content="' + htmlText(text) + '">'
    + '<meta property="og:type" content="website">'
    + '<meta property="og:locale" content="de_DE">'
    + '<meta property="og:site_name" content="Amateurfunk-Trainer">'
    + '<meta property="og:title" content="' + htmlText(titel) + '">'
    + '<meta property="og:description" content="' + htmlText(text) + '">'
    + '<meta property="og:url" content="' + htmlText(ziel) + '">'
    + '<meta property="og:image" content="' + htmlText(bild) + '">'
    + '<meta property="og:image:type" content="image/jpeg">'
    + '<meta property="og:image:width" content="1200">'
    + '<meta property="og:image:height" content="630">'
    + '<meta property="og:image:alt" content="Amateurfunk-Trainer: der Fragenkatalog mit Erkl\u00e4rung zu jeder Frage">'
    + '<meta name="twitter:card" content="summary_large_image">'
    + '<meta name="twitter:title" content="' + htmlText(titel) + '">'
    + '<meta name="twitter:description" content="' + htmlText(text) + '">'
    + '<meta name="twitter:image" content="' + htmlText(bild) + '">'
    // KEINE Weiterleitung mehr (21.09.2026). Hier stand
    //   <meta http-equiv="refresh" content="0; url=...">
    // und zeigte auf dieselbe Adresse, von der die Seite gerade kam.
    // Gedacht war es als Rueckweg fuer Menschen - nur bekommt ein
    // Mensch diese Seite nie zu sehen, sie geht ausschliesslich an
    // Crawler. Facebooks Debugger meldete sie als Weiterleitung
    // ("http-equiv=refresh Meta-Tag"), und eine Kachelseite, die den
    // Crawler im Kreis schickt, ist ein Risiko ohne jeden Nutzen.
    // Der Textlink unten bleibt - der schadet nicht.
    + '</head><body><p>' + htmlText(titel) + ' \u2014 <a href="' + htmlText(ziel) + '">weiter zum Trainer</a></p>'
    + '</body></html>');
});

// ----------------------------------------------------------------
//  BESUCHER
//  Dietmar: "Ich moechte als Host die Anzahl der Besucher sehen."
//  Gezaehlt wird ein Aufruf der Startseite von AUSSEN - also ueber den
//  Einladungslink oder den Tunnel. Der eigene Rechner zaehlt nicht mit,
//  sonst stuende der Zaehler nach einem Vormittag Arbeit bei 40, ohne
//  dass ein Besucher da war. Crawler zaehlen auch nicht: Facebook holt
//  die Seite beim Teilen selbst ab, und das ist kein Gast.
//
//  Was gespeichert wird: Uhrzeit, gekuerzte Adresse (die letzten Ziffern
//  fallen weg, wie ueberall sonst im Trainer), woher der Klick kam,
//  Handy oder Rechner, und ob ein Raumcode im Link stand. Keine Namen,
//  keine Kennungen, nichts, womit man jemanden wiederfindet. Die Liste
//  haelt die letzten 200 Aufrufe; die Datei steht in .gitignore und
//  verlaesst den Rechner nicht.
// ----------------------------------------------------------------
const BESUCHER_FP = path.join(USERDATA_DIR, 'besucher.json');
let besucherStand = null;
let besucherSchreibZeit = 0;

// ------------------------------------------------------------------
//  DER BESUCHERZAEHLER IN DER FUSSZEILE            (22.09.2026)
//  Dietmar: "Ich moechte einen Besucherzaehler" - Wortlaut "heute: 57,
//  gestern: 63, gesamt: 25.643", unten in der Leiste, fuer alle sichtbar.
//  Und zur Frage, wer mitzaehlt: "Der Zaehler soll alle zaehlen, die
//  ueber den Link kommen. Ich komme nicht ueber den Link, deshalb werde
//  ich nicht gezaehlt."
//
//  Beides ist schon gebaut: Der Zaehler weiter unten laesst
//  isLocalRequest() vorher durch (der eigene Rechner zaehlt nicht mit),
//  und "echt" wird erst gesetzt, wenn von derselben Adresse ein
//  Lebenszeichen eintrifft - ein Scanner, der nur die Startseite holt,
//  bleibt draussen. Der Zaehler in der Fusszeile nimmt deshalb nicht
//  "gesamt" (das sind alle Aufrufe, auch die Anklopfer), sondern die
//  echten.
//
//  "heute" und "gestern" richten sich nach der Uhr des Rechners, auf
//  dem der Trainer laeuft - nicht nach UTC. Es ist sein Zaehler.
// ------------------------------------------------------------------
function tagSchluessel(t){
  const d = new Date(t);
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0')
                         + '-' + String(d.getDate()).padStart(2,'0');
}
// Vor jedem Blick und vor jedem Hochzaehlen: Stimmt der Tag noch?
// Lief der Trainer gestern, rutscht der Tageswert eine Stelle weiter.
// Lag ein Tag ohne Betrieb dazwischen, war gestern eine Null - und nicht
// die Zahl von vorletzter Woche, die sonst als "gestern" stehenbliebe.
function zaehlerFrisch(b, jetzt){
  const heute = tagSchluessel(jetzt);
  if(b.tag === heute) return b;
  b.gestern = (b.tag === tagSchluessel(jetzt - 24*3600*1000)) ? (b.heute || 0) : 0;
  b.heute = 0;
  b.tag = heute;
  return b;
}
function besucherLesen(){
  if(besucherStand) return besucherStand;
  try{
    besucherStand = JSON.parse(fs.readFileSync(BESUCHER_FP, 'utf8'));
    if(!besucherStand || typeof besucherStand !== 'object') throw new Error('leer');
    if(!Array.isArray(besucherStand.liste)) besucherStand.liste = [];
    // Die Eintraege von vor dem 21.09.2026 tragen den Buchstabensalat
    // noch in sich (siehe kopfText). Einmal beim Lesen geradeziehen -
    // dann sieht auch die alte Liste richtig aus, und beim naechsten
    // Schreiben steht es sauber in der Datei.
    try{
      besucherStand.liste.forEach(function(e){
        if(!e) return;
        if(e.stadt)  e.stadt  = kopfText(e.stadt);
        if(e.region) e.region = kopfText(e.region);
      });
    }catch(e2){}
    // Die Zaehlstaende fuer die Fusszeile gab es vor dem 22.09.2026 noch
    // nicht. Fehlen sie, werden sie einmal aus der Liste abgeleitet -
    // die reicht 200 Aufrufe zurueck. Was davor liegt, ist nicht mehr
    // zu ermitteln; es wird geschaetzt und nicht behauptet.
    if(typeof besucherStand.echte !== 'number'){
      besucherStand.echte = besucherStand.liste.filter(function(e){ return e && e.echt; }).length;
      const heute = tagSchluessel(Date.now());
      const gestern = tagSchluessel(Date.now() - 24*3600*1000);
      besucherStand.tag = heute;
      besucherStand.heute = besucherStand.liste.filter(function(e){
        return e && e.echt && tagSchluessel(e.zeit) === heute; }).length;
      besucherStand.gestern = besucherStand.liste.filter(function(e){
        return e && e.echt && tagSchluessel(e.zeit) === gestern; }).length;
    }
  }catch(e){
    besucherStand = { gesamt: 0, echte: 0, seit: Date.now(), liste: [],
                      tag: tagSchluessel(Date.now()), heute: 0, gestern: 0 };
  }
  return besucherStand;
}
function besucherSchreiben(sofort){
  const jetzt = Date.now();
  // Hoechstens alle 20 Sekunden auf die Platte - ein Aufruf soll keine
  // Schreiboperation ausloesen.
  if(!sofort && jetzt - besucherSchreibZeit < 5000) return;
  besucherSchreibZeit = jetzt;
  try{
    fs.mkdirSync(USERDATA_DIR, { recursive: true });
    const tmp = BESUCHER_FP + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(besucherStand));
    fs.renameSync(tmp, BESUCHER_FP);
  }catch(e){ console.warn('[BESUCHER] nicht schreibbar:', e.message); }
}
function geraetArt(kennung){
  const k = String(kennung || '');
  if(/iPad|Tablet/i.test(k)) return 'Tablet';
  if(/Mobi|Android|iPhone/i.test(k)) return 'Handy';
  if(/Macintosh/i.test(k)) return 'Mac';
  if(/Windows/i.test(k)) return 'Windows';
  if(/Linux/i.test(k)) return 'Linux';
  return 'unbekannt';
}
function herkunft(roh){
  try{
    const h = new URL(String(roh)).hostname.replace(/^www\./, '');
    return h || '';
  }catch(e){ return ''; }
}

app.get('/', (req, res, next) => {
  try{
    const kennung = String(req.headers['user-agent'] || '');
    if(isLocalRequest(req)) return next();               // der eigene Rechner
    if(VORSCHAU_CRAWLER.test(kennung)) return next();    // der Crawler beim Teilen
    // Suchmaschinen duerfen die Seite holen (Dietmar wollte den Googlebot
    // dabeihaben), stehen aber nicht in der Besucherliste. Eine Kennung
    // laesst sich faelschen - wer sich als Googlebot ausgibt, bekommt
    // hoechstens die Seite und keinen Eintrag.
    if(SUCHMASCHINEN.test(kennung)) return next();

    // ----------------------------------------------------------------
    //  NUR ECHTE SEITENAUFRUFE                          (21.09.2026)
    //  Dietmar: "Mir ist auch aufgefallen, dass erst Facebook und dann
    //  direkt kommt."
    //
    //  Das war kein Zufall und kein zweiter Besucher, sondern immer
    //  derselbe - zweimal gezaehlt. Der Grund steht in sw.js: Der
    //  Service Worker legt sich beim ersten Besuch einen Vorrat an, und
    //  in dieser Liste steht './' - die Startseite. Der Browser holt sie
    //  also ein zweites Mal, diesmal aus dem Hintergrund und ohne
    //  Referrer. In der Liste sah das aus wie zwei Leute: einer "ueber
    //  facebook.com", einer "direkt". Der Zaehler stand damit fuer jeden
    //  Besucher auf zwei.
    //
    //  sec-fetch-dest unterscheidet beides und wird vom Browser gesetzt,
    //  nicht von der Seite: "document" heisst, da hat wirklich jemand
    //  eine Seite aufgeschlagen. Alles andere - "empty" fuer einen
    //  fetch(), "image", "script" - ist Beiwerk und zaehlt nicht mit.
    //  Fehlt der Kopf ganz (aeltere Browser), wird gezaehlt wie bisher;
    //  lieber einer zu viel als eine leere Liste.
    // ----------------------------------------------------------------
    const ziel = String(req.headers['sec-fetch-dest'] || '').toLowerCase();
    if(ziel && ziel !== 'document') return next();

    // Einmal je Serverstart: Welche cf-Koepfe kommen hier wirklich an?
    if(!cfKoepfeGezeigt){
      cfKoepfeGezeigt = true;
      const cf = Object.keys(req.headers).filter(function(k){ return k.indexOf('cf-') === 0; }).sort();
      if(cf.length){
        console.log('[GEO] Cloudflare schickt: ' + cf.map(function(k){
          // Die Adresse selbst nicht ins Log - sie steht gekuerzt in der
          // Besucherliste und gehoert nicht doppelt in die Datei.
          if(k === 'cf-connecting-ip') return k + '=(Adresse)';
          return k + '=' + String(req.headers[k]).slice(0, 40);
        }).join(' \u00b7 '));
      } else {
        console.log('[GEO] Keine cf-Koepfe in dieser Anfrage - der Besucher kam nicht ueber Cloudflare.');
      }
    }

    const b = besucherLesen();
    b.gesamt++;
    b.liste.push({
      zeit: Date.now(),
      // ----------------------------------------------------------------
      //  MENSCH ODER MASCHINE?                        (21.09.2026)
      //  Dietmar, mit einer Liste voller Aufrufe aus Warschau und
      //  Amsterdam: "meine IP ist nicht in Polen" - und kurz darauf der
      //  entscheidende Satz: "habe den Link noch nicht geteilt."
      //
      //  Damit war klar, was das war. Sobald Cloudflare fuer eine neue
      //  Domain ein Zertifikat ausstellt, steht der Name oeffentlich in
      //  den Certificate-Transparency-Protokollen. Es gibt Dienste, die
      //  diese Protokolle im Minutentakt auslesen und jede frische
      //  Adresse sofort abklopfen. Die laufen in Rechenzentren, geben
      //  sich als Windows- oder Mac-Browser aus und landeten damit in
      //  der Liste wie richtige Besucher.
      //
      //  Unterschieden wird an etwas, das kein Scanner tut: Ein echter
      //  Browser meldet sich nach dem Laden alle zehn Sekunden beim
      //  Server (das Lebenszeichen, das den Trainer am Leben haelt).
      //  Dafuer braucht es JavaScript und eine offene Seite. Ein
      //  Scanner holt die Startseite und ist weg.
      //
      //  Also: Jeder Aufruf faengt als "nur angeklopft" an und wird zum
      //  Besucher, sobald von derselben Adresse ein Lebenszeichen
      //  eintrifft. Lieber jemanden eine Minute lang zu wenig zaehlen
      //  als die Werbezahlen mit Maschinen aufblasen.
      // ----------------------------------------------------------------
      echt: false,
      ip: ipKuerzen(req.headers['cf-connecting-ip'] || req.ip),
      // Das Land kommt von Cloudflare selbst: Der Tunnel laeuft ueber
      // deren Netz, und dort wird cf-ipcountry gesetzt. Es braucht also
      // keinen fremden Dienst, dem man die Adressen der Besucher
      // schicken muesste, und keine 70-MB-Datenbank im Ordner. Im
      // eigenen WLAN fehlt der Kopf - dann bleibt es bei der Adresse.
      land: String(req.headers['cf-ipcountry'] || '').toUpperCase().slice(0, 2),
      // ----------------------------------------------------------------
      //  STADT? WENN CLOUDFLARE SIE SCHICKT           (21.09.2026)
      //  Dietmar: "Gibt Cloudflare auch noch die Stadt bekannt?"
      //
      //  Das Land (cf-ipcountry) kommt bei jedem Tunnel. Stadt, Region
      //  und Zeitzone gibt es nur, wenn in der Cloudflare-Zone die
      //  "Managed Transforms -> Add visitor location headers"
      //  eingeschaltet sind. Bei einem Quick Tunnel auf
      //  trycloudflare.com gehoert die Zone Cloudflare und nicht uns -
      //  einschalten kann das dort niemand. Mit einem eigenen benannten
      //  Tunnel auf eigener Domain waere es moeglich.
      //
      //  Deshalb wird hier nicht behauptet, sondern genommen, was da
      //  ist: Kommt der Kopf, steht die Stadt in der Liste; kommt er
      //  nicht, bleibt es beim Land. Und die Diagnose unten schreibt
      //  einmal je Serverstart auf, was wirklich ankam - damit die
      //  Antwort auf diese Frage nachlesbar ist und nicht geraten.
      // ----------------------------------------------------------------
      stadt:  kopfText(req.headers['cf-ipcity']).slice(0, 40),
      // Zwei Schreibweisen, weil die Quellen sich uneinig sind: Cloudflares
      // eigener Assistent nannte am 21.09.2026 "CF-IPRegion", die
      // Dokumentation an anderer Stelle "cf-region". Statt zu raten, werden
      // beide gelesen - die eine ist da, die andere leer, und welche es
      // war, steht ohnehin in der [GEO]-Zeile im Serverfenster.
      region: kopfText(req.headers['cf-ipregion'] || req.headers['cf-region']).slice(0, 40),
      woher: herkunft(req.headers.referer || ''),
      geraet: geraetArt(kennung),
      raum: String(req.query.duo || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 12)
    });
    if(b.liste.length > 200) b.liste = b.liste.slice(-200);
    besucherSchreiben(false);
    console.log('[BESUCHER] Aufruf Nr. ' + b.gesamt + ' von ' + b.liste[b.liste.length-1].ip
                + ' (' + b.liste[b.liste.length-1].geraet + ')'
                + (b.liste[b.liste.length-1].woher ? ' ueber ' + b.liste[b.liste.length-1].woher : ''));
  }catch(e){}
  return next();
});

// ================================================================
//  GEPACKT AUSLIEFERN                                   (22.09.2026)
//  ----------------------------------------------------------------
//  Dietmar, mit einem Seobility-Bericht: "Verbessere die Antwortzeit
//  Deiner Seite."
//
//  Der Trainer schickte alles ungepackt. Ein Seitenaufruf sind 6,6 MB,
//  und die gehen ueber die Leitung NACH OBEN des Anschlusses zu Hause -
//  der langsamsten Stelle der ganzen Strecke. Text laesst sich aber gut
//  packen: Index.html 2037 -> 586 KB, erklaerungen.json 2753 -> 760 KB,
//  fragen.json 434 -> 62 KB. Zusammen etwa ein Viertel.
//
//  Ohne npm-Paket (wie beim ZIP und den Sicherheitskoepfen): zlib ist
//  in Node eingebaut, und so muss auf keinem Rechner "npm install" neu
//  laufen. Gepackt wird nur, was der Browser ausdruecklich annimmt
//  (Accept-Encoding: gzip - Cloudflare fragt so an, jeder Browser
//  auch), nur Text, und nur Dateien ab 1,5 KB. Das gepackte Ergebnis
//  bleibt im Speicher, bis sich die Datei aendert; beim zweiten Aufruf
//  kostet es also nichts mehr. Alles andere - Bilder, Klaenge,
//  Schriften, die sind schon gepackt - laeuft wie bisher ueber
//  express.static darunter. Faellt hier irgendetwas aus, ebenfalls.
//
//  Die Tuer, die Laendersperre, die Bremse und die Liste der
//  oeffentlichen Dateien stehen alle WEITER OBEN. Hier kommt nur an,
//  was ohnehin ausgeliefert wuerde.
// ================================================================
const GZ_ARTEN = { '.html':'text/html; charset=UTF-8', '.js':'application/javascript; charset=UTF-8',
                   '.json':'application/json; charset=UTF-8', '.css':'text/css; charset=UTF-8',
                   '.svg':'image/svg+xml', '.txt':'text/plain; charset=UTF-8',
                   '.xml':'application/xml; charset=UTF-8', '.webmanifest':'application/manifest+json' };
const gzSpeicher = new Map();   // voller Pfad -> { mtime, groesse, daten }
app.use((req, res, next) => {
  try{
    if(req.method !== 'GET' && req.method !== 'HEAD') return next();
    if(!/\bgzip\b/i.test(String(req.headers['accept-encoding'] || ''))) return next();
    let rel;
    try{ rel = decodeURIComponent(req.path); }catch(e){ return next(); }
    if(rel === '/' || rel === '') rel = '/Index.html';
    if(rel.indexOf('\0') !== -1 || rel.split(/[\\/]/).includes('..')) return next();
    const voll = path.join(__dirname, rel);
    if(!voll.startsWith(__dirname + path.sep)) return next();
    const ext = path.extname(voll).toLowerCase();
    const art = GZ_ARTEN[ext];
    if(!art) return next();
    let st;
    try{ st = fs.statSync(voll); }catch(e){ return next(); }
    if(!st.isFile() || st.size < 1500) return next();
    let e = gzSpeicher.get(voll);
    if(!e || e.mtime !== st.mtimeMs || e.groesse !== st.size){
      e = { mtime: st.mtimeMs, groesse: st.size, daten: zlib.gzipSync(fs.readFileSync(voll), { level: 6 }) };
      gzSpeicher.set(voll, e);
    }
    res.setHeader('Content-Type', art);
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Vary', 'Accept-Encoding');
    res.setHeader('Last-Modified', new Date(st.mtimeMs).toUTCString());
    res.setHeader('Content-Length', e.daten.length);
    if(req.method === 'HEAD') return res.end();
    return res.end(e.daten);
  }catch(err){ return next(); }
});

app.use(express.static(path.join(__dirname), {
  index: 'Index.html',   // Datei heisst mit grossem I - unter Windows egal, so aber eindeutig
  dotfiles: 'deny'
}));

// Socket.IO für Duo-Modus
let server;
try{
  const srv=http.createServer(app);
  const { Server }=require('socket.io');
  const io=new Server(srv,{
    cors:{origin:'*'},
    pingInterval: 30000,
    pingTimeout: 60000,
    allowUpgrades: true,
    transports: ['websocket', 'polling']
  });
  const duoRooms={};

  // Der Handschlag geht nicht durch die Express-Kette, die Tuer weiter
  // oben sieht ihn also nicht. Deshalb hier noch einmal: Ist die Tuer zu
  // und kommt die Verbindung von einer oeffentlichen Adresse, wird sie
  // abgewiesen. Der Browser des Besuchers versucht es dann in immer
  // laengeren Abstaenden wieder - und kommt herein, sobald aufgemacht
  // wird. Der eigene Rechner und das eigene WLAN sind nie betroffen.
  io.use(function(socket, next){
    try{
      if(!tuerOffen && !tuerGleichZu() && sperrbar(socketIp(socket))){
        return next(new Error('Der Server ist gerade geschlossen.'));
      }
    }catch(e){}
    next();
  });

  // ================================================================
  //  DER CHAT OHNE RAUM                              (21.09.2026)
  //  ----------------------------------------------------------------
  //  Dietmar: "Wenn ich einen Link teile, moechte ich dass der Chat
  //  vorhanden ist, auch ohne dem Duo."
  //
  //  Bisher hing der Chat am Raumcode: io.to(code) - kein Raum, kein
  //  Chat. Wer die nackte Adresse anklickt, stand in der Hauptansicht
  //  und hatte keine Moeglichkeit, etwas zu fragen.
  //
  //  Dieser Kanal ist kein Raum in duoRooms, sondern schlicht "alle,
  //  die in keinem Raum sind". Deshalb braucht es kein join/leave an
  //  fuenf Stellen im Socket-Teil - es genuegt, beim Senden zu fragen,
  //  wer gerade ohne Raum dasitzt. Wer einem Raum beitritt, bekommt von
  //  da an den Raum-Chat und hier nichts mehr; wer ihn verlaesst, ist
  //  wieder dabei.
  //
  //  Nachrichten stehen nur im Arbeitsspeicher - die letzten hundert.
  //  Beim Beenden des Trainers sind sie weg, und das ist richtig so:
  //  Es ist ein Zuruf im Vorbeigehen, kein Postfach.
  // ================================================================
  const HAUS_CHAT_MAX = 100;
  const hausChat = [];

  // ----------------------------------------------------------------
  //  GELESEN, WIE BEI WHATSAPP                        (23.09.2026)
  //  Dietmar: "im Chat waere wie bei WhatsApp schoen, wenn ich sehe, ob
  //  meine Nachricht gelesen wurde."
  //
  //  Jede Nachricht bekommt beim Verschicken mit, an wie viele sie ging
  //  (empfaenger). Hat jemand sie auf dem Bildschirm gehabt - Chat
  //  offen, Tab sichtbar -, meldet sein Browser das (chatGelesen). Der
  //  Server merkt sich, wer, und sagt es NUR dem Absender
  //  (chatGelesenStand). Die anderen erfahren nicht, wer was gelesen hat.
  //
  //  Alles im Arbeitsspeicher, hoechstens fuer 2000 Nachrichten; beim
  //  Neustart ist es weg, wie der Chat selbst.
  // ----------------------------------------------------------------
  //  25.09.2026, abends: Gezaehlt wird je Sitzung (chatSitzungFuer), nicht
  //  je Verbindung. Vorher zaehlte ein Leser nach einem Neuverbinden
  //  doppelt - mit dem dritten Haken ("alle haben gelesen") haette das
  //  zu frueh "alle" gemeldet. Und der Absender bekommt den Stand auch
  //  nach einem Neuverbinden noch, im Verlauf und live.
  const chatLeser = new Map();      // Nachrichten-id -> Map(Sitzung -> Name)
  const CHAT_LESER_MAX = 2000;

  // ----------------------------------------------------------------
  //  SPRACHNACHRICHTEN                                  (23.09.2026)
  //  Dietmar: "Kann man da auch einen Sprachchat einbauen?" - und auf
  //  die Rueckfrage, wer sprechen darf: "Im Gruppenraum sollte jeder
  //  sprechen koennen."
  //
  //  Also: Im Gruppenraum darf jeder eine Sprachnachricht schicken. Im
  //  Chat ohne Raum zuerst nur der Gastgeber an seinem eigenen Rechner
  //  (und wer in seinem WLAN sitzt) - wer nur ueber den Link kam, konnte
  //  sie anhoeren, aber selbst nur schreiben.
  //
  //  25.09.2026: Jetzt darf dort auch jeder sprechen. Dietmar: "Ich habe
  //  gestern mit meiner Freundin zusammen trainiert und sie findet
  //  uebrigens diesen Sprachnachricht super. ... Und ich haette den
  //  Sprach Chat gerne auch noch, wenn ich nur den Link ohne Gruppenraum
  //  teile. So das jeder Sprechen kann." Die Sorge von damals - eine
  //  Aufnahme von einem Unbekannten - fangen jetzt drei Dinge auf: die
  //  Grenzen unten (Groesse, drei Sekunden Abstand, hoechstens zwoelf in
  //  fuenf Minuten), die Tuer (von aussen kommt nur herein, wenn der
  //  Server-Knopf an ist) und das Loeschen: Der Gastgeber kann jede
  //  Nachricht wieder herausnehmen (siehe LOESCHEN UND REAGIEREN).
  //
  //  Die Aufnahme selbst geht NICHT an alle mit der Nachricht mit. Die
  //  Nachricht sagt nur "Sprachnachricht, 0:12"; wer auf Abspielen
  //  drueckt, holt sie sich (spracheHolen). So laeuft nur ueber die
  //  Leitung nach oben, was wirklich jemand hoeren will.
  //
  //  Nur im Arbeitsspeicher: hoechstens 60 Aufnahmen und 15 MB, die
  //  aeltesten fallen heraus. Beim Neustart ist alles weg.
  // ----------------------------------------------------------------
  const sprachSpeicher = new Map();    // Nachrichten-id -> { buf, mime }
  const SPRACHE_MAX_ANZAHL = 60;
  const SPRACHE_MAX_GESAMT = 15 * 1024 * 1024;
  const SPRACHE_MAX_GROESSE = 450 * 1024;    // eine Minute Opus sind rund 200 KB
  const SPRACHE_MAX_SEK = 62;
  const SPRACHE_ARTEN = /^audio\/(webm|ogg|mp4|mpeg|aac)(;\s*codecs=[a-z0-9.,"' -]+)?$/i;
  let sprachGesamt = 0;
  function spracheMerken(id, buf, mime){
    sprachSpeicher.set(id, { buf: buf, mime: mime });
    sprachGesamt += buf.length;
    while(sprachSpeicher.size > SPRACHE_MAX_ANZAHL || sprachGesamt > SPRACHE_MAX_GESAMT){
      const alt = sprachSpeicher.keys().next().value;
      const e = sprachSpeicher.get(alt);
      sprachGesamt -= (e && e.buf ? e.buf.length : 0);
      sprachSpeicher.delete(alt);
    }
  }
  // ----------------------------------------------------------------
  //  WER NEU KOMMT, SIEHT NICHTS VON VORHER             (23.09.2026)
  //  Dietmar: "Der Chat und Sprachnachrichten muessen nach einem
  //  Neustart geloescht werden. Neue Benutzer sollten nicht sehen, was
  //  davor schon geschrieben wurde."
  //
  //  Das Erste war schon so: Chat, Aufnahmen und Haken liegen nur im
  //  Arbeitsspeicher, nach einem Neustart ist alles weg. Das Zweite
  //  nicht: Bisher bekam jeder, der dazukam, die letzten hundert
  //  Nachrichten nachgeliefert ("damit spaeter Beitretende den Faden
  //  kennen"). Jetzt sieht jeder nur, was geschrieben wurde, seit er da
  //  ist - im Chat ohne Raum seit dem Aufruf der Seite, im Gruppenraum
  //  seit dem Beitritt.
  //
  //  "Seit er da ist" haengt an einer Kennung, die der Browser beim
  //  Laden der Seite auswuerfelt und bei jeder Verbindung mitschickt
  //  (auth.sitzung). Reisst die Leitung kurz ab und Socket.IO verbindet
  //  neu, ist es dieselbe Kennung - der Faden bleibt stehen. Laedt
  //  jemand die Seite neu, ist es eine neue - dann ist er ein neuer
  //  Besucher und faengt leer an. Den Zeitpunkt setzt immer der Server;
  //  eine ausgedachte Kennung bringt also nichts als einen leeren Chat.
  //
  //  Dasselbe gilt fuer Sprachnachrichten und Lesehaken: Wer eine
  //  Nachricht nicht sehen darf, kann sie weder abspielen noch als
  //  gelesen melden (chatNachrichtFinden).
  // ----------------------------------------------------------------
  const chatSitzungen = new Map();     // Kennung -> { seit, raeume: { schluessel: seit } }
  const CHAT_SITZUNGEN_MAX = 3000;
  function chatSitzungFuer(sock){
    if(sock.data.chatSitzung) return sock.data.chatSitzung;
    let kennung = '';
    try{ kennung = String((sock.handshake && sock.handshake.auth && sock.handshake.auth.sitzung) || ''); }catch(e){}
    let s = null;
    if(/^[a-f0-9]{32}$/.test(kennung)){
      s = chatSitzungen.get(kennung) || null;
      if(s) chatSitzungen.delete(kennung);          // ans Ende: zuletzt benutzt
      else s = { seit: Date.now(), raeume: {} };
      chatSitzungen.set(kennung, s);
      while(chatSitzungen.size > CHAT_SITZUNGEN_MAX) chatSitzungen.delete(chatSitzungen.keys().next().value);
    } else {
      // Eine Seite von vor dem Update schickt keine Kennung - dann
      // gilt diese eine Verbindung.
      s = { seit: Date.now(), raeume: {} };
    }
    sock.data.chatSitzung = s;
    return s;
  }
  // Ein Raumcode kann nach dem Schliessen neu vergeben werden - deshalb
  // gehoert der Zeitpunkt der Erstellung mit zum Schluessel.
  function raumSchluessel(room){ return room.code + ':' + (room.createdAt || 0); }
  function raumBeitrittMerken(sock, room){
    const s = chatSitzungFuer(sock);
    const k = raumSchluessel(room);
    if(!s.raeume[k]){
      const alle = Object.keys(s.raeume);
      if(alle.length >= 20) delete s.raeume[alle[0]];
      s.raeume[k] = Date.now();
    }
  }
  function chatSichtbarAb(sock, room){
    const s = chatSitzungFuer(sock);
    if(!room) return s.seit;
    return s.raeume[raumSchluessel(room)] || Infinity;
  }
  // Der Verlauf fuer genau diesen Browser. Seit dem 25.09.2026 mit zwei
  // Zusaetzen, die fuer jeden anders aussehen (siehe LOESCHEN UND
  // REAGIEREN): "meine" an den eigenen Nachrichten und die Reaktionen
  // mit der eigenen darin. Deshalb Kopien - die gespeicherte Nachricht
  // bleibt, wie sie ist.
  function chatFuer(sock, room, liste){
    const ab = chatSichtbarAb(sock, room);
    const ich = chatSitzungFuer(sock);
    return (Array.isArray(liste) ? liste : []).filter(function(n){ return n && (n.zeit || 0) >= ab; })
      .map(function(n){
        const zusatz = {};
        if(n.id && chatBesitzer.get(n.id) === ich) zusatz.meine = true;
        const r = n.id ? reaktionenFuer(sock, n.id) : null;
        if(r) zusatz.reaktionen = r;
        if(zusatz.meine){
          const l = chatLeser.get(n.id);
          if(l && l.size) zusatz.gelesen = { anzahl: l.size, namen: Array.from(l.values()).slice(0, 20) };
        }
        return Object.keys(zusatz).length ? Object.assign({}, n, zusatz) : n;
      });
  }
  // Wo steht die Nachricht, die dieser Browser meint - und darf er sie
  // ueberhaupt sehen? { n, room } oder null; room ist null im Chat ohne
  // Raum.
  function chatNachrichtOrt(sock, id){
    const code = sock.data && sock.data.roomCode;
    if(code && duoRooms[code] && Array.isArray(duoRooms[code].chat)){
      const n = duoRooms[code].chat.find(function(x){ return x.id === id; });
      if(n) return ((n.zeit || 0) >= chatSichtbarAb(sock, duoRooms[code])) ? { n: n, room: duoRooms[code] } : null;
    }
    // Aus dem Chat ohne Raum darf lesen, wer dort mitliest: ohne Raum,
    // oder der Gastgeber am eigenen Rechner (siehe hausLeute).
    if(hausLeute().indexOf(sock) !== -1){
      const n = hausChat.find(function(x){ return x.id === id; });
      return (n && (n.zeit || 0) >= chatSichtbarAb(sock, null)) ? { n: n, room: null } : null;
    }
    return null;
  }
  function chatNachrichtFinden(sock, id){
    const o = chatNachrichtOrt(sock, id);
    return o ? o.n : null;
  }

  // ----------------------------------------------------------------
  //  LOESCHEN UND REAGIEREN                             (25.09.2026)
  //  Dietmar: "Ich moechte auch Nachrichten loeschen und Liken koennen.
  //  Bitte kein Rotes Herz, sondern in Gruen Daumen Hoch und Daumen
  //  runter. Lustig und traurig."
  //
  //  Loeschen darf, wer die Nachricht geschrieben hat - und der
  //  Gastgeber jede: im Gruppenraum der Host, im Chat ohne Raum der
  //  Trainer-PC (wer nicht von aussen kommt). Seit dort jeder sprechen
  //  darf, braucht der Gastgeber das zum Aufraeumen.
  //
  //  Wer geschrieben hat, erkennt der Server an der Sitzung
  //  (chatSitzungFuer), nicht an der Socket-id: Reisst die Leitung ab
  //  und Socket.IO verbindet neu, bleibt die eigene Nachricht die
  //  eigene. Die Sitzung selbst verlaesst den Server nie - an den
  //  Browser geht nur "meine: true".
  //
  //  Geloescht wird richtig: Text und Aufnahme sind weg, auch aus dem
  //  Speicher. Stehen bleibt ein Platzhalter "Nachricht geloescht", wie
  //  bei WhatsApp - sonst haengt eine Antwort darunter in der Luft.
  //
  //  Reaktionen: vier Arten, eine je Person und Nachricht. Dieselbe noch
  //  einmal nimmt sie zurueck, eine andere ersetzt sie. Jeder sieht die
  //  Zahlen und die Namen dazu; welche die eigene ist, erfaehrt jeder
  //  nur fuer sich. Alles im Arbeitsspeicher, wie der Chat.
  // ----------------------------------------------------------------
  const chatBesitzer = new Map();      // Nachrichten-id -> Sitzung (das Objekt aus chatSitzungFuer)
  const CHAT_BESITZER_MAX = 2000;
  function chatBesitzerMerken(sock, id){
    try{
      chatBesitzer.set(id, chatSitzungFuer(sock));
      while(chatBesitzer.size > CHAT_BESITZER_MAX) chatBesitzer.delete(chatBesitzer.keys().next().value);
    }catch(e){}
  }
  // 25.09.2026, abends: dazu ein gruenes Herz. Dietmar: "Nachrichten
  // Liken. Daumen hoch und runter. Lustig Traurig und ein Gruenes Herz."
  // Und: "4 Blaetteriges Kleeblatt. Erstaunt und :) haette ich gerne noch
  // mit drin." Die Bilder dazu (Emojis) stehen in duo.js, REAKT_ARTEN.
  const REAKTIONEN = ['hoch', 'runter', 'lustig', 'traurig', 'herz', 'klee', 'staunen', 'laecheln'];
  const chatReaktionen = new Map();    // Nachrichten-id -> Map(Sitzung -> { art, name })
  const CHAT_REAKTIONEN_MAX = 2000;
  function reaktionenFuer(sock, id){
    const r = chatReaktionen.get(id);
    if(!r || !r.size) return null;
    const ich = chatSitzungFuer(sock);
    const zaehler = {}, namen = {};
    let meine = null;
    r.forEach(function(v, wer){
      zaehler[v.art] = (zaehler[v.art] || 0) + 1;
      if(!namen[v.art]) namen[v.art] = [];
      if(namen[v.art].length < 20) namen[v.art].push(v.name);
      if(wer === ich) meine = v.art;
    });
    return { zaehler: zaehler, namen: namen, meine: meine };
  }

  // ----------------------------------------------------------------
  //  "IST DAZUGEKOMMEN"                              (21.09.2026)
  //  Dietmar, mit drei Leuten gleichzeitig auf der Seite: "Hier waere
  //  eine Begruessung mit Namen gut."
  //
  //  Wer ueber den nackten Link kommt, ist in keinem Raum - es gibt
  //  also keine Teilnehmerliste, in der er auftauchen koennte. Im Chat
  //  stand er erst, wenn er von sich aus etwas schrieb. Und das tut
  //  kaum jemand als Erster.
  //
  //  Jetzt meldet der Chat jede Ankunft. Mit Namen, wenn einer
  //  eingetragen wurde - sonst ohne. Beides ist besser als Stille:
  //  Dietmar kann ansprechen, wer da ist, und die Besucher sehen, dass
  //  sie nicht allein sind.
  //
  //  Gegen Wiederholung: eine Begruessung je Adresse und Viertelstunde.
  //  Sonst meldet jedes Neuladen denselben Menschen noch einmal.
  // ----------------------------------------------------------------
  const hausBegruesst = new Map();          // gekuerzte IP -> Zeitpunkt
  const BEGRUESSUNG_PAUSE = 15 * 60 * 1000;

  function hausLeute(){
    const raus = [];
    try{
      io.sockets.sockets.forEach(function(s){
        // Wer in keinem Raum sitzt, ist dabei.
        if(!s.data || !s.data.roomCode){ raus.push(s); return; }
        // UND der Gastgeber an seinem eigenen Rechner, auch wenn er
        // gerade eine Runde im Raum hat. Dietmar am 21.09.2026: "Habe
        // jetzt auch schon einen Chat. Hier kann nur niemand schreiben,
        // weil es nicht ueber Duo laeuft." Genau daran haette die erste
        // Fassung gescheitert: Er sitzt in seinem Raum und saehe die
        // Frage am Link nicht. Ein fremder Teilnehmer im Raum bleibt
        // aussen vor - der hat seinen Raum-Chat.
        if(!s.data.vonAussen) raus.push(s);
      });
    }catch(e){}
    return raus;
  }
  // Nur die OHNE Raum - fuer die Zaehlung und fuer die Kopie einer
  // Gastgeber-Nachricht aus dem Raum nach draussen.
  function hausOhneRaum(){
    return hausLeute().filter(function(s){ return !(s.data && s.data.roomCode); });
  }
  function hausSenden(ereignis, daten){
    hausLeute().forEach(function(s){ try{ s.emit(ereignis, daten); }catch(e){} });
  }
  // Wie viele sitzen gerade ohne Raum da - und wie viele davon von
  // aussen? Danach entscheidet der Gastgeber-Client, ob er das
  // Chatfenster aufmacht: Wenn niemand da ist, soll es nicht im Weg
  // stehen.
  function hausVolkMelden(){
    try{
      const ohneRaum = hausOhneRaum();
      const vonAussen = ohneRaum.filter(function(s){ return s.data && s.data.vonAussen; }).length;
      // Der Tuerzustand faehrt mit. Dietmar am 22.09.2026: "Server ein =
      // Chat ein und Server aus = Chat aus." Der Client koennte ihn auch
      // einzeln erfragen - aber er hoert hier ohnehin schon zu, und so
      // kommt beides in einem Stueck an, ohne zusaetzlichen Abruf.
      const daten = { anzahl: ohneRaum.length, vonAussen: vonAussen, tuer: !!tuerOffen };
      hausLeute().forEach(function(s){ try{ s.emit('hausVolk', daten); }catch(e){} });
    }catch(e){}
  }
  // Der Wache weiter oben bekannt machen: Sie muss die neue Adresse nach
  // einem Neuaufbau verschicken koennen und wissen, ob gerade jemand im
  // Raum sitzt.
  duoIo = io;
  duoRaeume = duoRooms;
  // Wie viele sitzen GERADE von aussen auf der Seite, ohne Gruppenraum?
  // Genau diese Zahl steht am Server-Knopf. Dietmar am 22.09.2026 auf die
  // Frage, wer mitzaehlt: "Nur die ohne Gruppenraum" - wer im Raum sitzt,
  // steht ohnehin in der Teilnehmerliste.
  duoHausZahl = function(){
    try{ return hausOhneRaum().filter(function(s){ return s.data && s.data.vonAussen; }).length; }
    catch(e){ return 0; }
  };

  // FIX W7: Raumcode ohne Kollision, aus kryptographisch sicherem Zufall.
  function freienRaumcodeFinden(){
    const ZEICHEN='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  // ohne I,O,0,1 - leichter vorzulesen
    for(let versuch=0; versuch<50; versuch++){
      let code='';
      const bytes=crypto.randomBytes(6);
      for(let i=0;i<6;i++) code += ZEICHEN[bytes[i] % ZEICHEN.length];
      if(!duoRooms[code]) return code;
    }
    return 'R' + Date.now().toString(36).toUpperCase().slice(-6);
  }

  // FIX W11: Raeume hatten keine Lebensdauer. createdAt wurde zwar gesetzt,
  // aber nie ausgewertet - im Dauerbetrieb wuchs duoRooms unbegrenzt.
  const RAUM_MAX_ALTER_MS = 12*60*60*1000;   // 12 Stunden
  setInterval(()=>{
    const jetzt=Date.now();
    let weg=0;
    for(const [code,raum] of Object.entries(duoRooms)){
      const leer = Object.keys(raum.users||{}).length === 0;
      const alt  = jetzt - (raum.createdAt||jetzt) > RAUM_MAX_ALTER_MS;
      if(leer || alt){ delete duoRooms[code]; weg++; }
    }
    if(weg) console.log(`[DUO] Aufraeumen: ${weg} verwaiste/abgelaufene Raeume entfernt (${Object.keys(duoRooms).length} aktiv)`);
  }, 30*60*1000).unref();
  io.on('connection',socket=>{
    const connectTime = new Date().toISOString();
    console.log(`[SOCKET] ${socket.id} verbunden um ${connectTime}`);

    // Laeuft gerade der Countdown vor dem Zumachen, bekommt ihn auch, wer
    // erst jetzt dazukommt (25.09.2026). Bisher ging die Ansage nur beim
    // Umschalten hinaus - wer waehrend der fuenf Minuten Vorwarnung der
    // Zeitschaltuhr kam, sah keinen Balken.
    try{ if(tuerGleichZu()) socket.emit('tuerAnsage', { schliesstUm: tuerSchliesstUm }); }catch(e){}

    // ----------------------------------------------------------------
    //  WER VON AUSSEN KOMMT, EROEFFNET KEINEN RAUM      (21.09.2026)
    //  ----------------------------------------------------------------
    //  Dietmar: "Im Gruppenraum duerfen Besucher keinen Zugriff haben,
    //  wenn ich nur den Link ohne Duo und Code poste. Diese starten sonst
    //  einen neuen Gruppenraum und der Link ist nicht mehr aktiv."
    //
    //  Er hat recht, und der Schaden ist groesser, als es klingt: Wer den
    //  nackten Trainer-Link anklickt, steht in der vollen Hauptansicht -
    //  mit dem Knopf "Gruppenraum". Ein Klick auf "Raum erstellen", und
    //  auf dem Rechner des Gastgebers laeuft ein zweiter Raum, dessen
    //  Gastgeber irgendwo im Internet sitzt. Verlaesst der ihn wieder,
    //  raeumt der Server auf - und reisst dabei den Raum ab, um den es
    //  eigentlich ging. Der Link, den Dietmar gerade in die Gruppe
    //  gestellt hat, ist tot.
    //
    //  sperrbar() gibt es schon: Es unterscheidet oeffentliche Adressen
    //  von denen aus dem eigenen Haus. Wer ueber den Tunnel kommt, hat
    //  eine oeffentliche - der ist ein Besucher. Wer im WLAN des
    //  Gastgebers sitzt oder am Rechner selbst, bleibt unberuehrt: dort
    //  soll ein zweiter Raum weiterhin moeglich sein.
    const vonAussen = sperrbar(socketIp(socket));
    socket.data.vonAussen = vonAussen;
    // Ab wann dieser Besucher den Chat sieht - gleich jetzt festhalten,
    // vor jeder Nachricht (siehe "WER NEU KOMMT").
    chatSitzungFuer(socket);
    // Der Client sperrt daraufhin den Knopf und schreibt hin, warum.
    // Verlassen wuerde ich mich darauf nicht - die Pruefung unten in
    // createRoom ist die, die haelt.
    socket.emit('zugangsart', { vonAussen: vonAussen, demo: vonAussen });

    // Die Ankunft im Haus-Chat ansagen. Der Client ruft das, sobald der
    // Name feststeht - also nach dem Willkommensfenster, oder sofort,
    // wenn es diesmal gar nicht gezeigt wurde.
    socket.on('hausHallo', function(data){
      try{
        // Nur Besucher von aussen. Der Gastgeber und sein WLAN begruessen
        // sich nicht selbst.
        if(!socket.data || !socket.data.vonAussen) return;
        // Wer in einem Raum sitzt, steht dort in der Teilnehmerliste.
        if(socket.data.roomCode) return;

        const wer = ipKuerzen(socketIp(socket));
        const jetzt = Date.now();
        if(jetzt - (hausBegruesst.get(wer) || 0) < BEGRUESSUNG_PAUSE) return;
        hausBegruesst.set(wer, jetzt);
        // Die Karte nicht wachsen lassen: Abgelaufenes wegraeumen.
        if(hausBegruesst.size > 200){
          hausBegruesst.forEach(function(z, k){
            if(jetzt - z > BEGRUESSUNG_PAUSE) hausBegruesst.delete(k);
          });
        }

        const name = String((data && data.name) || '')
          .replace(/[\u0000-\u001F\u007F<>]/g, '').trim().slice(0, 20);
        const n = {
          id:     crypto.randomBytes(8).toString('hex'),
          userId: socket.id,     // damit der Ankoemmling sich selbst nicht anpiept
          system: true,
          haus:   true,
          // Dietmars Wortlaut vom 21.09.2026: "Herzlich Willkommen, Name
          // betritt den Server."
          text:   name ? ('\uD83D\uDC4B Herzlich willkommen, ' + name + ' betritt den Server.')
                       : '\uD83D\uDC4B Herzlich willkommen, ein Besucher betritt den Server.',
          zeit:   jetzt
        };
        hausChat.push(n);
        while(hausChat.length > HAUS_CHAT_MAX) hausChat.shift();
        hausSenden('duoChatNachricht', n);
        console.log('[CHAT] ' + n.text);
      }catch(e){}
    });

    // Der Chat ohne Raum: Verlauf mitgeben und allen sagen, wer da ist.
    // Beides erst im naechsten Takt, damit dieser Socket in
    // io.sockets.sockets schon gefuehrt wird. Der Verlauf ist fuer einen
    // Neuen leer; nur nach einem kurzen Abriss steht darin, was er
    // schon hatte (23.09.2026).
    setTimeout(function(){
      try{
        if(!socket.connected) return;
        // Wer nach einem Abriss sofort wieder seinem Raum beigetreten
        // ist, bekommt dessen Verlauf - der aus dem Haus wuerde ihn
        // sonst ueberschreiben (gefunden beim Testen am 23.09.2026).
        if(!socket.data.roomCode){
          socket.emit('duoChatVerlauf', { code: '__haus', nachrichten: chatFuer(socket, null, hausChat) });
        }
        hausVolkMelden();
        const ansage = neustartAnsageGueltig();
        if(ansage) socket.emit('neustartAnsage', ansage);
      }catch(e){}
    }, 50);
    
    let lastActivity = Date.now();
    const activityTimeout = setInterval(()=>{
      const idle = Date.now() - lastActivity;
      if(idle > 95000) {
        console.warn(`[SOCKET] ${socket.id} hat 95+ Sekunden inaktivität`);
      }
    }, 30000);
    
    socket.onAny(()=>{ lastActivity = Date.now(); });
    
    // Generiert das Fragen-Set EINMAL für den ganzen Raum (bei Raum-Erstellung) - garantiert, dass
    // wirklich jeder Teilnehmer exakt die gleichen Fragen in der gleichen Reihenfolge bekommt,
    // unabhängig davon, wann er beitritt oder für sich selbst startet.
    function generateRoomQuestions(room){
      try{
        // FIX W10: aus dem Cache statt 395 KB bei jeder Raumerstellung neu zu parsen
        const qb = ladeFragen() || [];
        let pool=qb;
        const cfg = room.config||{};

        // ================================================================
        //  PRUEFUNGSRAUM  (20.09.2026)
        // ----------------------------------------------------------------
        //  Dietmar: "im Gruppenraum moechte ich einen Pruefungssimulator.
        //  Aktiviere ich das, laufen 25 Fragen aus Betrieb, Vorschriften
        //  und Technik rein. Mit dem passenden Counter (Zeit) Pruefung
        //  starten im Fenster. [...] Nach der ersten Runde soll die Frage
        //  kommen: Zur naechsten Runde."
        //
        //  Wie die echte Pruefung: drei Boegen, je 25 Fragen, in der
        //  amtlichen Reihenfolge Vorschriften - Betrieb - Technik. Der
        //  Raum haelt alle 75 in EINEM Satz (questionsFull), damit die
        //  bestehende Buchfuehrung - duoAnswer, Fortschritt, Auswertung
        //  des Kursleiters - unveraendert weiterlaeuft. Wo ein Bogen
        //  anfaengt und aufhoert, steht in room.pruefungTeile; der Client
        //  schneidet daraus seine drei Runden. Innerhalb eines Bogens ist
        //  gemischt, die Boegen selbst bleiben getrennt - sonst saesse
        //  Runde 1 vor einer Betriebsfrage.
        //
        //  Ein Bogen ohne 25 Fragen ist keine Pruefung und faellt weg
        //  (bei fragen.json - Klasse N - kommt das nicht vor: 204/172/195).
        // ================================================================
        if(cfg.pruefung){
          const BOEGEN = ['vorschriften','betrieb','technik'];
          const teile = [];
          let alle = [];
          BOEGEN.forEach(teil => {
            const topf = qb.filter(q => q && q.part === teil);
            if(topf.length < 25) return;
            const gezogen = fisherYates(topf).slice(0, 25);
            teile.push({ teil, von: alle.length, bis: alle.length + gezogen.length });
            alle = alle.concat(gezogen);
          });
          room.pruefungTeile = teile;
          room.questions = alle.map(q=>q.id);
          room.questionsFull = alle.map(shuffleOptions);
          console.log(`[DUO SERVER V17] Pruefungsraum ${room.code}: ${teile.length} Boegen, ${room.questions.length} Fragen (${teile.map(t=>t.teil).join(' - ')})`);
          return;
        }
        room.pruefungTeile = null;

        const parts = (cfg.parts && cfg.parts.length>0) ? cfg.parts : (cfg.part && cfg.part!=='all' ? [cfg.part] : ['vorschriften','betrieb','technik']);
        if(parts.length>0 && parts.length<3) pool=pool.filter(q=>parts.includes(q.part));
        let n;
        if(cfg.count==='all' || cfg.count==='Alle'){
          n = pool.length;
        } else {
          n = parseInt(cfg.count)||25;
        }
        n = Math.min(n, pool.length);
        // FIX W6: .sort(()=>0.5-Math.random()) ist KEIN gleichverteiltes Mischen.
        // Nachgemessen (200.000 Durchlaeufe, 6 Elemente): das erste Element blieb
        // in 28,5% der Faelle auf Position 1 statt der erwarteten 16,7%. Da danach
        // nur die ersten n Fragen genommen werden, war auch die AUSWAHL verzerrt -
        // Fragen vom Anfang des Katalogs kamen deutlich haeufiger dran.
        const shuffledQuestions=fisherYates(pool).slice(0,n);
        room.questions = shuffledQuestions.map(q=>q.id);
        room.questionsFull = shuffledQuestions.map(shuffleOptions);
        console.log(`[DUO SERVER V17] Fragen generiert für Raum ${room.code}: ${room.questions.length} Fragen (parts=${JSON.stringify(parts)}, count=${cfg.count})`);
      }catch(e){ console.error('[DUO] generateRoomQuestions Fehler', e); }
    }
    // Gleichverteiltes Mischen (Fisher-Yates) - dieselbe Logik, die unten
    // in shuffleOptions schon korrekt verwendet wurde.
    function fisherYates(arr){
      const a=[...arr];
      for(let i=a.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [a[i],a[j]]=[a[j],a[i]];
      }
      return a;
    }
    function shuffleOptions(q){
      const opts=[...(q.options||[])];
      for(let i=opts.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [opts[i],opts[j]]=[opts[j],opts[i]];
      }
      return {...q, options:opts};
    }

    socket.on('createRoom',data=>{
      try{
        // Der Riegel von oben. Er steht hier und nicht nur im Browser,
        // weil ein gesperrter Knopf in der Entwicklerkonsole wieder
        // aufgeht - diese Zeile nicht.
        if(socket.data && socket.data.vonAussen){
          console.log('[DUO] Raum-Eroeffnung von aussen abgelehnt (' + ipKuerzen(socketIp(socket)) + ')');
          socket.emit('raumAbgelehnt', {
            grund: 'demo',
            text: 'Dieser Trainer laeuft auf einem fremden Rechner. '
                + 'Ein eigener Gruppenraum laesst sich hier nicht eroeffnen - er wuerde die '
                + 'Verbindung des Kursleiters stoeren. Einem Raum beitreten geht: dafuer den '
                + 'Einladungslink oder den Raum-Code benutzen.'
          });
          return;
        }
        // FIX W7: 6 Zeichen statt 4 und Kollisionspruefung. Vorher konnte ein
        // zufaellig doppelter Code einen laufenden Raum samt aller Antworten
        // kommentarlos ueberschreiben - die Teilnehmer darin sassen dann in
        // einem fremden Raum.
        const code=freienRaumcodeFinden();
        const pwd = (data.password||'').toString().trim();
        console.log(`[DUO SERVER V17] createRoom ${code} count=${data.count} part=${data.part} parts=${JSON.stringify(data.parts)} pruefung=${data.pruefung===true} pwd=${pwd?'yes':'no'}`);
        // ipsVonTeilnehmern und gesperrteIps liegen BEWUSST neben room.users
        // und nicht darin: room.users geht bei jedem roomUpdate an alle im
        // Raum. Eine Adresse in room.users waere damit fuer jeden
        // Teilnehmer sichtbar - fuer den Gastgeber gedacht, an alle
        // ausgeliefert. Beides bleibt auf dem Server.
        duoRooms[code]={code, users:{}, ipsVonTeilnehmern:{}, gesperrteIps:[], questions:[], questionsFull:[], allAnswers:{}, chat:[], hostId:socket.id, password: pwd||null, createdAt:Date.now(), finalResultsSent:false, config:{count:data.count, part:data.part, parts:data.parts, pruefung: data.pruefung === true}};
        // FIX: Client sendet 'name', nicht 'userName' -> beide Schlüssel akzeptieren
        const userName = data.name || data.userName || 'Benutzer 1';
        duoRooms[code].users[socket.id]={name:userName, role:'Host'};
        socket.join(code); socket.data.roomCode=code;
        raumBeitrittMerken(socket, duoRooms[code]);
        hausVolkMelden();   // dieser hier ist ab jetzt im Raum, nicht mehr im Haus

        // WICHTIG: Fragen-Set wird SOFORT bei Raum-Erstellung fix vergeben (nicht erst bei "Start").
        // Dadurch gibt es kein Warten auf den Host - jeder Teilnehmer kann später jederzeit für sich
        // selbst starten und bekommt garantiert exakt dieselben Fragen wie alle anderen im Raum.
        generateRoomQuestions(duoRooms[code]);

        socket.emit('roomCreated',{code, userId:socket.id, hostId: socket.id, users:duoRooms[code].users, password: pwd||null, totalQuestions:duoRooms[code].questions.length});
        willkommenSenden(socket, duoRooms[code]);
        sendeTeilnehmerUebersicht(duoRooms[code]);
      }catch(e){ console.error(e); }
    });
    socket.on('joinRoom',data=>{
     try{
      // FIX K7: Ohne diese Pruefung genuegte ein socket.emit('joinRoom') ohne
      // Argument, um den kompletten Server per TypeError zu beenden.
      if(!data || typeof data !== 'object'){ socket.emit('errorMsg','Ungueltige Anfrage'); return; }
      const room=duoRooms[data.code]; if(!room){ socket.emit('errorMsg','Raum nicht gefunden'); return; }

      // Gesperrt? Dann hier Schluss - vor dem Passwort, damit ein
      // Gesperrter nicht am Passwort ablesen kann, ob er es richtig hatte.
      //
      // Gesperrt wird die Adresse, nicht der Name: Ein Name ist in zwei
      // Sekunden geaendert. Die Sperre gilt fuer DIESEN Raum und lebt nur,
      // solange er lebt - mit dem Raum ist auch sie wieder weg.
      const wo = socketIp(socket);
      if(sperrbar(wo) && Array.isArray(room.gesperrteIps) && room.gesperrteIps.includes(wo)){
        socket.emit('errorMsg','Der Kursleiter hat den Zugang von diesem Anschluss gesperrt.');
        console.log(`[GRUPPENRAUM] Beitritt zu ${data.code} abgelehnt - gesperrt: ${ipKuerzen(wo)}`);
        return;
      }

      if(room.password){
        const given = (data.password||'').toString().trim();
        if(given !== room.password){
          socket.emit('errorMsg','Falsches Passwort! Bitte korrektes Passwort eingeben oder Link mit ?pwd=... nutzen.');
          return;
        }
      }
      const idx=Object.keys(room.users).length+1;
      // FIX: Client sendet 'name', nicht 'userName' -> beide Schlüssel akzeptieren
      const userName = data.name || data.userName || `Benutzer ${idx}`;
      room.users[socket.id]={name:userName, role:`Teilnehmer`};
      if(!room.ipsVonTeilnehmern) room.ipsVonTeilnehmern = {};
      room.ipsVonTeilnehmern[socket.id] = wo;
      socket.join(data.code); socket.data.roomCode=data.code;
      raumBeitrittMerken(socket, room);
      hausVolkMelden();
      console.log(`[GRUPPENRAUM] ${userName} ist Raum ${data.code} beigetreten (${ipKuerzen(wo)})`);
      // Fragen stehen schon seit Raum-Erstellung fest - jeder Beitretende bekommt dieselbe Basis
      if(!room.questionsFull || room.questionsFull.length===0) generateRoomQuestions(room);
      // config kommt mit: Nur so sieht der Beitretende, dass er in einen
      // PRUEFUNGSRAUM kommt und nicht in eine Fragerunde - der Haken im
      // Fenster steht dann von selbst richtig (20.09.2026).
      socket.emit('roomJoined',{code:data.code, userId:socket.id, hostId: room.hostId, users:room.users, totalQuestions: room.questions.length, config: room.config || null});
      // Chatverlauf mitschicken - seit 23.09.2026 nur, was seit dem
      // eigenen Beitritt geschrieben wurde. Wer neu kommt, bekommt also
      // einen leeren Chat; wer nach einem Abriss zurueckkehrt, seinen.
      socket.emit('duoChatVerlauf', { code: data.code, nachrichten: chatFuer(socket, room, room.chat) });
      // Automatische Begruessung - geht NUR an den Beitretenden und wird bewusst
      // nicht im Raumverlauf gespeichert, sonst saehe jeder sie mehrfach.
      willkommenSenden(socket, room);
      io.to(data.code).emit('roomUpdate',{users:room.users, hostId: room.hostId});
      const trainerData = getTrainerData(room);
      if(trainerData && room.hostId){ io.to(room.hostId).emit('duoTrainerLive', trainerData); }
      sendeTeilnehmerUebersicht(room);
     }catch(e){ console.error('[DUO] joinRoom Fehler', e); try{ socket.emit('errorMsg','Fehler beim Beitreten'); }catch{} }
    });

    // ===== GRUPPENRAUM: gemeinsame Statistik-Berechnung (jeder User in eigenem Tempo) =====
    // WICHTIG (Fix): Die offizielle Bestehensgrenze (19/25 bestanden, 17-18/25 Grauzone/Nachprüfung)
    // ist eine FESTE Regel für genau 25 Fragen pro Prüfungsteil - keine allgemeine Prozentregel!
    // Vorher wurde 76%/68% einfach auf JEDE Fragenanzahl hochgerechnet (Math.ceil(totalQs*0.76) usw.).
    // Bei kleineren Fragenmengen (z.B. 10 oder 15 Fragen im Gruppenraum) verschiebt sich dadurch die
    // Grauzone nach unten und kann fälschlich schon bei wenigen Fehlern auftreten. Jetzt: bei genau 25
    // Fragen gelten die exakten amtlichen Schwellen; bei jeder anderen Anzahl gibt es keine "Grauzone"
    // (die es offiziell nur bei 25 Fragen gibt), sondern nur ein einfaches Bestanden/Nicht bestanden ab 76%.
    function computeUserStats(room){
      const totalQs = room.questionsFull ? room.questionsFull.length : (room.questions ? room.questions.length : 0);
      const stats = {};
      Object.entries(room.users||{}).forEach(([uid,u])=>{
        const userAnswers = (room.allAnswers && room.allAnswers[uid]) || {};
        let correct=0, wrong=0;
        Object.values(userAnswers).forEach(a=>{ if(a && a.isCorrect) correct++; else wrong++; });
        const answered = Object.keys(userAnswers).length;
        const finished = totalQs>0 && answered>=totalQs;
        let examStatus = null;
        // Pruefungsraum: jeder Bogen wird fuer sich gewertet, wie bei der
        // Bundesnetzagentur - drei Ergebnisse, und bestanden ist nur, wer
        // alle drei hat. Die Summe ueber 75 Fragen sagt darueber nichts:
        // 60/75 koennen 25+25+10 sein.
        let teile = null;
        if(room.pruefungTeile && room.pruefungTeile.length && room.questionsFull){
          teile = room.pruefungTeile.map(t => {
            const ids = room.questionsFull.slice(t.von, t.bis).map(q => q.id);
            let r = 0, b = 0;
            ids.forEach(id => { const a = userAnswers[id]; if(!a) return; b++; if(a.isCorrect) r++; });
            const fertig = b >= ids.length;
            const status = !fertig ? null : (r >= 19 ? 'bestanden' : (r >= 17 ? 'nachpruefung' : 'nicht_bestanden'));
            return { teil: t.teil, correct: r, answered: b, total: ids.length, finished: fertig, status };
          });
          if(finished){
            // Nachgeprueft wird nur, wenn LEDIGLICH EIN Teil knapp daneben
            // liegt (Amtsblattverfuegung 29/2024). Zwei Teile mit 17 oder 18
            // Punkten sind nicht bestanden - bis zum 25.09.2026 stand hier
            // "Grauzone". Dieselbe Regel steht in Index.html
            // (pruefGesamtStatus).
            const grau = teile.filter(t => t.status === 'nachpruefung').length;
            if(teile.some(t => t.status === 'nicht_bestanden')) examStatus = 'nicht_bestanden';
            else if(grau >= 2) examStatus = 'nicht_bestanden';
            else if(grau === 1) examStatus = 'nachpruefung';
            else examStatus = 'bestanden';
          }
        } else if(finished){
          if(totalQs===25){
            // Exakte amtliche Regel für einen vollständigen 25-Fragen-Prüfungsteil
            examStatus = correct>=19 ? 'bestanden' : (correct>=17 ? 'nachpruefung' : 'nicht_bestanden');
          } else {
            // Keine amtliche Grauzone bei abweichender Fragenanzahl - einfaches Bestanden/Nicht bestanden
            examStatus = (correct/totalQs)>=0.76 ? 'bestanden' : 'nicht_bestanden';
          }
        }
        stats[uid] = {
          name: u.name||'Unbekannt', role: u.role||'', isHost: uid===room.hostId,
          correct, wrong, answered, total: totalQs,
          accuracy: answered>0 ? Math.round((correct/answered)*100) : 0,
          finished, examStatus, teile
        };
      });
      return stats;
    }

    // ================================================================
    // TEILNEHMER-UEBERSICHT: fuer den "Teilnehmer"-Knopf im Kopfbereich.
    // Anders als die Gesamt-Auswertung (sendFinalResults) ist das hier KEIN
    // Popup, sondern eine jederzeit abrufbare Liste - inklusive laufender
    // Zeitmessung je Teilnehmer (Start beim eigenen "Jetzt starten", Ende
    // beim eigenen Abschluss). Wird bei jeder relevanten Aenderung an den
    // GANZEN Raum geschickt, damit die Zahl am Knopf ("X fertig") live
    // mitzaehlt, ohne dass dafuer irgendwo ein Popup aufgeht.
    // ================================================================
    function buildTeilnehmerUebersicht(room){
      const stats = computeUserStats(room);
      const jetzt = Date.now();
      return Object.entries(room.users||{}).map(([uid,u])=>{
        const s = stats[uid] || {};
        const start = room.startTimes && room.startTimes[uid];
        const ende = room.finishTimes && room.finishTimes[uid];
        let dauerMs = null, laeuftNoch = false;
        if(start && ende){ dauerMs = ende - start; }
        else if(start && !s.finished){ dauerMs = jetzt - start; laeuftNoch = true; }
        return {
          userId: uid,
          name: s.name || u.name || 'Teilnehmer',
          isHost: uid === room.hostId,
          gestartet: !!start,
          correct: s.correct || 0, wrong: s.wrong || 0,
          answered: s.answered || 0, total: s.total || 0,
          accuracy: s.accuracy || 0,
          finished: !!s.finished, examStatus: s.examStatus || null,
          dauerMs, laeuftNoch
        };
      });
    }
    function sendeTeilnehmerUebersicht(room){
      try{
        if(!room) return;
        io.to(room.code).emit('duoTeilnehmerUebersicht', { code: room.code, teilnehmer: buildTeilnehmerUebersicht(room) });
      }catch(e){ console.error('[DUO] Teilnehmer-Uebersicht Fehler', e); }
    }

    function getTrainerData(room){
      try{
        const usersStats = computeUserStats(room);
        const totalQs = room.questionsFull ? room.questionsFull.length : (room.questions ? room.questions.length : 0);
        return {
          code: room.code,
          hostId: room.hostId,
          totalQuestions: totalQs,
          users: room.users,
          usersStats,
          allAnswers: room.allAnswers||{},
          questions: room.questionsFull ? room.questionsFull.map(q=>({id:q.id, text:q.text?q.text.substring(0,120):q.id, part:q.part})) : [],
          timestamp: Date.now()
        };
      }catch(e){ console.error('getTrainerData err', e); return null; }
    }
    function sendFinalResults(code, targetSocketId){
      const room = duoRooms[code]; if(!room) return;
      const usersStats = computeUserStats(room);
      const ranking = Object.entries(usersStats)
        .map(([uid,s])=>({userId:uid, ...s}))
        .sort((a,b)=> b.correct - a.correct || b.accuracy - a.accuracy);
      // FIX W12: Das Flag wird hier NICHT mehr gesetzt.
      // Vorher genuegte ein einziger Klick auf "Gesamt-Auswertung" durch einen
      // beliebigen Teilnehmer, um die AUTOMATISCHE Endauswertung fuer den ganzen
      // Raum dauerhaft abzuschalten (die lief nur unter !finalResultsSent).
      // Gesetzt wird es jetzt ausschliesslich im automatischen Pfad in duoAnswer.
      const totalQs = room.questionsFull ? room.questionsFull.length : (room.questions ? room.questions.length : 0);
      const payload = { code, totalQuestions: totalQs, ranking, users: room.users };
      if(targetSocketId){
        // FIX: Eine manuelle Einzelabfrage ueber den Button "Gesamt-Auswertung
        // anzeigen" (der erst erscheint, wenn DIESER Nutzer selbst fertig ist)
        // geht nur an genau diesen Client. Vorher landete sie beim GANZEN Raum -
        // sobald irgendjemand frueher fertig war und auf den Button klickte,
        // bekamen alle anderen (auch die, die noch mitten in der Pruefung
        // waren) ungefragt das Auswertungs-Popup aufgedraengt.
        io.to(targetSocketId).emit('duoFinalResults', payload);
      } else {
        // Echte, automatische Endauswertung - wird nur erreicht, wenn WIRKLICH
        // alle im Raum fertig sind (siehe duoAnswer). Dann duerfen alle das
        // Popup bekommen, niemand wird dabei aus einer laufenden Pruefung
        // gerissen.
        io.to(code).emit('duoFinalResults', payload);
        // Trainer-Dashboard des Hosts ebenfalls nur bei dieser echten
        // Endauswertung automatisch aktualisieren/oeffnen - nicht bei jeder
        // Einzelabfrage eines Teilnehmers, sonst reisst das den Host aus
        // seiner eigenen laufenden Pruefung.
        const finalTrainer = getTrainerData(room);
        if(finalTrainer && room.hostId){ io.to(room.hostId).emit('duoTrainerFinal', finalTrainer); }
      }
    }
    // Entfernt leeren Raum, wenn niemand mehr drin ist (ersetzt das alte turn-basierte checkAdvanceAfterLeave)
    function cleanupRoomIfEmpty(code){
      const room = duoRooms[code];
      if(!room) return;
      if(Object.keys(room.users).length===0){
        delete duoRooms[code];
      }
    }

    // Jeder Teilnehmer (Host oder nicht) fordert seinen eigenen Start an, unabhängig von allen
    // anderen im Raum. Es wird NICHT mehr an den ganzen Raum broadcastet, sondern nur an den
    // anfragenden Socket geantwortet - kein "Gemeinsam starten" mehr, kein Warten auf den Host.
    socket.on('startDuoQuiz',data=>{
     try{
      if(!data || typeof data !== 'object') return;
      const room=duoRooms[data.code]; if(!room) return;
      // Sicherheitsnetz: falls aus irgendeinem Grund noch keine Fragen vorhanden sind, jetzt generieren.
      if(!room.questionsFull || room.questionsFull.length===0) generateRoomQuestions(room);
      socket.emit('duoQuizStarted',{
        questions:room.questions,
        questionsFull:room.questionsFull,
        meta:{code:data.code, parts:room.config?room.config.parts:undefined, count:room.config?room.config.count:undefined, part:room.config?room.config.part:undefined, actualCount:room.questions.length,
              pruefung: !!(room.config && room.config.pruefung), teile: room.pruefungTeile || null},
        users:room.users
      });
      // Startzeit fuer die Zeitmessung in der Teilnehmer-Uebersicht - nur beim
      // ERSTEN eigenen Start setzen, ein erneutes "Jetzt starten" (z.B. nach
      // Reload) soll die laufende Zeit nicht zuruecksetzen.
      if(!room.startTimes) room.startTimes = {};
      if(!room.startTimes[socket.id]) room.startTimes[socket.id] = Date.now();
      sendeTeilnehmerUebersicht(room);
     }catch(e){ console.error('[DUO] startDuoQuiz Fehler', e); }
    });

    // ================================================================
    //  NEUE RUNDE FUER ALLE  (06.09.2026)
    // ----------------------------------------------------------------
    //  Dietmar: "Wenn man durch ist, bekommt man eine Auswertung. Der
    //  Trainer kann, wenn alle fertig sind, eine neue Runde starten."
    //
    //  Bis hierher gab es das nicht. 'startDuoQuiz' schickt seine Antwort
    //  mit socket.emit an GENAU EINEN Teilnehmer zurueck - den, der
    //  gefragt hat. Das ist auch richtig so: Im Raum startet jeder fuer
    //  sich, wann er mag. Nur konnte deshalb niemand eine Runde fuer alle
    //  ausloesen, und die Fragen blieben dieselben.
    //
    //  'neueRunde' macht beides anders:
    //    - es wuerfelt einen frischen Fragensatz (generateRoomQuestions),
    //    - und schickt ihn mit io.to(code) an ALLE im Raum.
    //
    //  Nur der Gastgeber darf das. Sonst koennte ein Teilnehmer mitten in
    //  der Runde allen anderen den Stand wegreissen.
    // ================================================================
    socket.on('neueRunde', data=>{
     try{
      if(!data || typeof data !== 'object') return;
      const code = data.code;
      const room = duoRooms[code]; if(!room) return;
      if(room.hostId !== socket.id){
        socket.emit('errorMsg','Nur der Kursleiter kann eine neue Runde starten.');
        return;
      }
      generateRoomQuestions(room);
      // Der alte Durchgang ist vorbei: Antworten, Zeiten und die Sperre
      // fuer die Endauswertung gehen mit ihm.
      room.allAnswers = {};
      room.startTimes = {};
      room.finalResultsSent = false;
      const jetzt = Date.now();
      Object.keys(room.users).forEach(id => { room.startTimes[id] = jetzt; });
      io.to(code).emit('duoQuizStarted',{
        questions: room.questions,
        questionsFull: room.questionsFull,
        meta:{ code, parts: room.config?room.config.parts:undefined, count: room.config?room.config.count:undefined,
               part: room.config?room.config.part:undefined, actualCount: room.questions.length, neueRunde:true,
               pruefung: !!(room.config && room.config.pruefung), teile: room.pruefungTeile || null },
        users: room.users
      });
      console.log(`[GRUPPENRAUM] Neue Runde in ${code}: ${room.questions.length} frische Fragen fuer ${Object.keys(room.users).length} Teilnehmer.`);
      sendeTeilnehmerUebersicht(room);
     }catch(e){ console.error('[DUO] neueRunde Fehler', e); }
    });

    // ===== KEIN WARTEN: Jeder beantwortet in eigenem Tempo, kein erzwungener Fragenwechsel =====
    // FIX K6: Ermittelt serverseitig, ob eine Antwort richtig war.
    // Die Options-Reihenfolge in room.questionsFull ist exakt die, die der
    // Client per 'duoQuizStarted' bekommen hat - der optionIndex passt also.
    // Rueckgabe null = Frage gehoert nicht zu diesem Raum.
    function verifyAnswer(room, questionId, optionIndex){
      if(!room.questionsFull || !room.questionsFull.length) return null;
      const q = room.questionsFull.find(x=>x && x.id===questionId);
      if(!q) return null;
      const idx = Number(optionIndex);
      if(!Array.isArray(q.options) || !Number.isInteger(idx) || idx<0 || idx>=q.options.length) return false;
      return q.options[idx] && q.options[idx].correct === true;
    }

    socket.on('duoAnswer',data=>{
     try{
      if(!data || typeof data !== 'object') return;
      const room=duoRooms[data.code]; if(!room||!data.questionId) return;
      // FIX K6: Identitaet NICHT mehr vom Client uebernehmen. Vorher konnte
      // jeder Teilnehmer mit data.userId Antworten im Namen eines anderen
      // einbuchen und ihn gezielt durchfallen lassen.
      const uid = socket.id;
      if(!room.users[uid]){ console.warn('[DUO] duoAnswer von Nicht-Mitglied', uid, 'Raum', data.code); return; }

      // FIX K6: isCorrect wird serverseitig geprueft, nicht mehr vom Client
      // uebernommen. Vorher genuegte ein socket.emit in der Browser-Konsole
      // fuer 25/25 Punkte.
      const verified = verifyAnswer(room, data.questionId, data.optionIndex);
      if(verified === null){
        console.warn('[DUO] Antwort auf unbekannte Frage verworfen:', data.questionId);
        return;
      }
      if(verified !== !!data.isCorrect){
        console.warn(`[DUO] Client meldete isCorrect=${data.isCorrect}, Server ermittelt ${verified} (Frage ${data.questionId}, User ${uid})`);
      }

      if(!room.allAnswers) room.allAnswers={};
      if(!room.allAnswers[uid]) room.allAnswers[uid]={};
      // "art" sagt, wie die Antwort zustande kam: leer = ein Mensch hat
      // geklickt, 'loesung' = F9/F10 hat die Loesung gezeigt, 'gelernt' =
      // beim Betreten vorbelegt, weil die Frage schon sass. Nur die erste
      // Sorte beschreibt die Gruppe; die Auswertung des Gastgebers laesst
      // die anderen beiden deshalb weg.
      //
      // Weissliste statt Durchreichen: was der Client schickt, landet nicht
      // ungeprueft im Raum. Unbekanntes wird zu '' - also zur echten
      // Antwort, was die vorsichtigere Annahme ist (eine echte Antwort
      // faelschlich mitzuzaehlen ist harmloser, als eine wegzulassen).
      // 'zeit' (20.09.2026): Im Pruefungsraum ist die Zeit abgelaufen, und
      // die Frage blieb unbeantwortet. Sie zaehlt fuer den Teilnehmer als
      // Fehler - fuer die Auswertung des Kursleiters aber nicht als
      // "die Gruppe hat das falsch", denn geantwortet hat niemand.
      const ART_ERLAUBT = ['loesung','gelernt','zeit'];
      const art = ART_ERLAUBT.indexOf(String(data.art||'')) === -1 ? '' : String(data.art);
      room.allAnswers[uid][data.questionId]={optionIndex:data.optionIndex, isCorrect:verified, userId:uid, answeredAt:Date.now(), art:art};

      const totalQuestions = room.questions ? room.questions.length : 0;
      const answeredCount = Object.keys(room.allAnswers[uid]).length;
      const totalUsers = Object.keys(room.users).length;

      // Nur Fortschritts-Info, löst KEINEN Fragenwechsel für andere User aus
      io.to(data.code).emit('duoProgressUpdate',{userId:uid, answeredCount, totalQuestions, totalUsers});

      const trainerDataAns = getTrainerData(room);
      if(trainerDataAns && room.hostId){ io.to(room.hostId).emit('duoTrainerLive', trainerDataAns); }

      // Gesamt-Auswertung automatisch, sobald ALLE User ALLE Fragen beantwortet haben
      let allDone = false;
      if(totalQuestions>0){
        allDone = Object.keys(room.users).every(u=>{
          const cnt = room.allAnswers[u] ? Object.keys(room.allAnswers[u]).length : 0;
          return cnt >= totalQuestions;
        });
      }

      // Endzeit fuer die Zeitmessung in der Teilnehmer-Uebersicht - einmalig
      // beim eigenen Abschluss (unabhaengig davon, ob andere im Raum schon
      // fertig sind oder nicht).
      if(totalQuestions>0 && answeredCount>=totalQuestions){
        if(!room.finishTimes) room.finishTimes = {};
        if(!room.finishTimes[uid]) room.finishTimes[uid] = Date.now();
      }

      // FIX: Wenn GENAU DIESER Nutzer gerade fertig geworden ist, aber andere im
      // Raum noch nicht - kein Popup bei den anderen (siehe sendFinalResults),
      // stattdessen landet sein Ergebnis als Nachricht im Gruppenchat. So sieht
      // man, wenn ein Teilnehmer schneller war, wird davon aber beim eigenen
      // Lernen nicht unterbrochen.
      if(totalQuestions>0 && answeredCount>=totalQuestions && !allDone){
        if(!room._fertigGemeldet) room._fertigGemeldet = {};
        if(!room._fertigGemeldet[uid]){
          room._fertigGemeldet[uid] = true;
          const meineStats = computeUserStats(room)[uid];
          if(meineStats){
            const statusText = meineStats.examStatus==='bestanden' ? 'bestanden'
              : (meineStats.examStatus==='nachpruefung' ? 'Grauzone (mündliche Nachprüfung möglich)' : 'nicht bestanden');
            const ergebnisNachricht = {
              id: crypto.randomBytes(8).toString('hex'),
              userId: '__system__',
              name: (room.users[uid] && room.users[uid].name) || 'Ein Teilnehmer',
              istHost: uid === room.hostId,
              automatisch: true,
              text: (meineStats.teile && meineStats.teile.length)
                ? '🏁 hat die Prüfung abgegeben: ' + meineStats.teile.map(t =>
                    ({vorschriften:'Vorschriften', betrieb:'Betrieb', technik:'Technik'}[t.teil] || t.teil) + ' ' + t.correct + '/' + t.total).join(', ')
                  + ' (' + statusText + ').'
                : '🏁 ist mit allen Fragen fertig: ' + meineStats.correct + '/' + meineStats.total + ' richtig (' + statusText + ').',
              zeit: Date.now()
            };
            if(!Array.isArray(room.chat)) room.chat = [];
            room.chat.push(ergebnisNachricht);
            while(room.chat.length > CHAT_VERLAUF_MAX) room.chat.shift();
            io.to(data.code).emit('duoChatNachricht', ergebnisNachricht);
          }
        }
      }

      if(totalQuestions>0 && !room.finalResultsSent && allDone){
        room.finalResultsSent = true; sendFinalResults(data.code);
      }

      // Teilnehmer-Uebersicht (Knopf im Kopfbereich) bei jeder Antwort aktuell
      // halten - so zaehlt die "X fertig"-Zahl live mit, ohne dass dafuer
      // irgendwo ein Popup aufgeht.
      sendeTeilnehmerUebersicht(room);
     }catch(e){ console.error('[DUO] duoAnswer Fehler', e); }
    });

    // Jeder Teilnehmer (nicht nur der Host) kann die Gesamt-Auswertung jederzeit abrufen.
    // FIX: geht nur an den anfragenden Client (siehe sendFinalResults) - nicht mehr
    // an den ganzen Raum, sonst poppt das Ergebnis bei allen anderen ungefragt auf.
    socket.on('requestFinalResults',data=>{
      try{
        if(!data || typeof data !== 'object') return;
        const room=duoRooms[data.code]; if(!room) return;
        sendFinalResults(data.code, socket.id);
      }catch(e){ console.error('[DUO] requestFinalResults Fehler', e); }
    });

    // ================================================================
    // AUSWERTUNG FUER DEN KURSLEITER
    //
    // Dietmar am 09.09.2026: "Kursleiter-Auswertung im Gruppenraum -
    // welche Fragen hat die Gruppe falsch? Damit weiss ein OV- oder
    // VHS-Leiter, was am naechsten Abend dran ist."
    //
    // Der Gastgeber bekommt ueber duoTrainerLive schon allAnswers - aber
    // ohne die Antworttexte, und die Fragetexte auf 120 Zeichen gekuerzt.
    // Fuer "welchen Ablenker hat die Gruppe gewaehlt" reicht das nicht.
    //
    // Deshalb ein eigener Abruf statt einer Erweiterung von
    // duoTrainerLive: Das geht bei JEDER Antwort an den Gastgeber raus.
    // Alle Antworttexte dort mitzuschicken hiesse, bei einem Raum ueber
    // den ganzen Katalog rund 180 KB pro Klick durch die Leitung zu
    // schieben - und der Gruppenraum laeuft oft ueber einen Tunnel.
    // Hier wird nur geliefert, wenn jemand die Auswertung auch oeffnet.
    //
    // Nur der Gastgeber darf das. Sonst koennte jeder Teilnehmer
    // nachsehen, welche Antwort die richtige ist - der Raum ist auch
    // eine Pruefungssituation.
    // ================================================================
    socket.on('duoAuswertungAnfordern', data => {
      try{
        if(!data || typeof data !== 'object') return;
        const room = duoRooms[data.code];
        if(!room) return;
        if(room.hostId !== socket.id){
          console.warn('[DUO] Auswertung von Nicht-Kursleiter abgewiesen:', socket.id, 'Raum', data.code);
          socket.emit('errorMsg', { message: 'Die Auswertung kann nur der Kursleiter öffnen.' });
          return;
        }

        // Die Fragen kommen mit vollem Text und allen Antworten - in
        // genau der Reihenfolge, in der der Raum sie gemischt hat
        // (questionsFull). Nur so passt der gemeldete optionIndex zum
        // Text, den der Kursleiter dann liest.
        const fragen = (room.questionsFull || []).map(q => ({
          id: q.id,
          text: q.text || q.id,
          part: q.part || '',
          options: (q.options || []).map(o => ({ text: o.text || '', correct: !!o.correct }))
        }));

        const namen = {};
        Object.entries(room.users || {}).forEach(([uid, u]) => { namen[uid] = (u && u.name) || 'Unbekannt'; });

        // Die Startzeiten kommen mit, damit der Gastgeber auch fuer die
        // ERSTE Frage jedes Teilnehmers eine Bearbeitungszeit hat. Alle
        // weiteren ergeben sich aus dem Abstand zur vorigen Antwort -
        // answeredAt steht ohnehin schon in allAnswers. Ohne startTimes
        // fiele je Teilnehmer eine Frage aus der Tempo-Probe.
        socket.emit('duoAuswertung', {
          code: room.code,
          fragen: fragen,
          allAnswers: room.allAnswers || {},
          startTimes: room.startTimes || {},
          namen: namen,
          teilnehmer: Object.keys(room.users || {}).length,
          config: room.config || null,
          zeitpunkt: Date.now()
        });
      }catch(e){ console.error('[DUO] duoAuswertungAnfordern Fehler', e); }
    });

    // ================================================================
    // GRUPPENCHAT
    //
    // Wie bei den Antworten (K6) gilt: Der Absender wird NICHT aus den Daten
    // des Clients uebernommen, sondern ueber socket.id im Raum nachgeschlagen.
    // Sonst koennte jeder Nachrichten im Namen eines anderen schreiben.
    // Der Verlauf lebt nur im Arbeitsspeicher und verschwindet mit dem Raum -
    // es wird bewusst nichts auf die Platte geschrieben.
    // ================================================================
    // ----------------------------------------------------------------
    // Begruessungstext - hier aendern, wenn eine andere Formulierung
    // gewuenscht ist. Wird automatisch an jeden geschickt, der den Raum
    // betritt (auch an den Host beim Anlegen).
    // ----------------------------------------------------------------
    const CHAT_WILLKOMMEN = 'Herzlich willkommen bei unserem Amateurfunk-Trainer! Schön, dass du da bist.';

    function willkommenSenden(sock, room){
        try{
            if(!room) return;
            const hostName = (room.users && room.hostId && room.users[room.hostId] && room.users[room.hostId].name) || 'Trainer';   // nicht "Host" - Dietmar 23.09.2026: "klingt doof"
            // Kleine Verzoegerung, damit die Raum-Oberflaeche im Browser schon
            // aufgebaut ist - sonst kaeme die Nachricht an, bevor das Chatfenster
            // ueberhaupt sichtbar ist.
            setTimeout(()=>{
                try{
                    sock.emit('duoChatNachricht', {
                        id: crypto.randomBytes(8).toString('hex'),
                        userId: '__system__',     // bewusst KEINE echte Socket-ID
                        name: hostName,
                        istHost: true,
                        automatisch: true,
                        text: CHAT_WILLKOMMEN,
                        zeit: Date.now()
                    });
                }catch(e){}
            }, 600);
        }catch(e){ console.error('[CHAT] Willkommen fehlgeschlagen', e); }
    }

    const CHAT_MAX_LAENGE   = 500;   // Zeichen pro Nachricht
    const CHAT_VERLAUF_MAX  = 50;    // aufbewahrte Nachrichten pro Raum
    const CHAT_MAX_PRO_10S  = 8;     // Nachrichten pro Teilnehmer in 10 Sekunden

    function chatRateLimit(sock){
      const jetzt = Date.now();
      if(!sock.data.chatZeiten) sock.data.chatZeiten = [];
      sock.data.chatZeiten = sock.data.chatZeiten.filter(t => jetzt - t < 10000);
      if(sock.data.chatZeiten.length >= CHAT_MAX_PRO_10S) return true;
      sock.data.chatZeiten.push(jetzt);
      return false;
    }

    socket.on('duoChat', data=>{
      try{
        if(!data || typeof data !== 'object') return;

        // --- Der Chat ohne Raum ---
        if(data.code === '__haus'){
          if(socket.data && socket.data.roomCode) return;   // der sitzt in einem Raum
          let t = String(data.text || '').replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g,' ').trim();
          if(!t) return;
          if(t.length > CHAT_MAX_LAENGE) t = t.slice(0, CHAT_MAX_LAENGE);
          if(chatRateLimit(socket)){
            socket.emit('duoChatHinweis','Bitte etwas langsamer schreiben.');
            return;
          }
          // Der Name kommt vom Client. Steuerzeichen raus, Laenge
          // begrenzen, und wer keinen eingetragen hat, ist "Besucher" -
          // hier "Teilnehmer" zu schreiben waere falsch, es ist ja kein
          // Raum. Der eigene Rechner heisst "Gastgeber", damit ein
          // Besucher sieht, mit wem er spricht.
          let name = String((data.name || '')).replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, 20);
          const drinnen = !(socket.data && socket.data.vonAussen);
          if(!name) name = drinnen ? 'Kursleiter' : 'Besucher';
          const n = {
            id: crypto.randomBytes(8).toString('hex'),
            userId: socket.id,
            name: name,
            istHost: drinnen,
            text: t,
            zeit: Date.now()
          };
          n.haus = true;      // der Client schreibt "am Link" dazu
          n.empfaenger = hausLeute().filter(function(x){ return x.id !== socket.id; }).length;
          chatBesitzerMerken(socket, n.id);
          hausChat.push(n);
          while(hausChat.length > HAUS_CHAT_MAX) hausChat.shift();
          hausSenden('duoChatNachricht', n);
          // Nur wer und wie lang, nicht was: server.log ueberlebt jeden
          // Neustart, der Chat soll es nicht (23.09.2026).
          console.log('[CHAT] ohne Raum - ' + n.name + ' schreibt (' + t.length + ' Zeichen)');
          return;
        }

        const room = duoRooms[data.code];
        if(!room) return;
        const user = room.users[socket.id];
        if(!user){ socket.emit('errorMsg','Du bist nicht in diesem Raum'); return; }

        // Steuerzeichen raus, Zeilenumbrueche zu Leerzeichen, Laenge begrenzen
        let text = String(data.text || '').replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g,' ').trim();
        if(!text) return;
        if(text.length > CHAT_MAX_LAENGE) text = text.slice(0, CHAT_MAX_LAENGE);

        if(chatRateLimit(socket)){
          socket.emit('duoChatHinweis','Bitte etwas langsamer schreiben.');
          return;
        }

        const nachricht = {
          id: crypto.randomBytes(8).toString('hex'),
          userId: socket.id,
          name: user.name || 'Teilnehmer',
          istHost: socket.id === room.hostId,
          text: text,
          zeit: Date.now()
        };
        if(!Array.isArray(room.chat)) room.chat = [];
        chatBesitzerMerken(socket, nachricht.id);
        room.chat.push(nachricht);
        while(room.chat.length > CHAT_VERLAUF_MAX) room.chat.shift();

        // An wie viele geht sie? Die anderen im Raum - und, wenn der
        // Gastgeber schreibt, dazu die am Link (siehe unten).
        try{
          let anz = Object.keys(room.users || {}).filter(function(k){ return k !== socket.id; }).length;
          if(socket.id === room.hostId) anz += hausOhneRaum().filter(function(x){ return x.id !== socket.id; }).length;
          nachricht.empfaenger = anz;
        }catch(e){}

        io.to(data.code).emit('duoChatNachricht', nachricht);

        // Die Antwort des Gastgebers geht auch an die, die am Link
        // haengen - sonst fragt dort jemand und bekommt nie eine
        // Antwort, weil der Gastgeber in seinem Raum sitzt.
        //
        // Dieselbe id in beiden Kanaelen: Der Client fuehrt eine Liste
        // der schon gezeigten Nachrichten (chatGesehen) und wirft
        // Doppelte weg. Deshalb sieht niemand sie zweimal, auch der
        // Gastgeber nicht, der in beiden Kanaelen sitzt.
        //
        // NUR der Gastgeber, und nur was er selbst schreibt: Was die
        // Teilnehmer im Raum untereinander schreiben, bleibt im Raum.
        if(socket.id === room.hostId){
          const draussen = hausOhneRaum();
          if(draussen.length){
            const kopie = Object.assign({}, nachricht, { haus: true });
            if(!hausChat.some(function(x){ return x.id === kopie.id; })){
              hausChat.push(kopie);
              while(hausChat.length > HAUS_CHAT_MAX) hausChat.shift();
            }
            draussen.forEach(function(s){ try{ s.emit('duoChatNachricht', kopie); }catch(e){} });
            console.log('[CHAT] Antwort des Kursleiters auch an ' + draussen.length + ' am Link.');
          }
        }
        console.log(`[CHAT] ${room.code} ${nachricht.name} schreibt (${text.length} Zeichen)`);
      }catch(e){ console.error('[CHAT] Fehler', e); }
    });

    // Der Browser meldet: Diese Nachrichten hatte ich auf dem Bildschirm.
    socket.on('chatGelesen', data=>{
      try{
        if(!data || !Array.isArray(data.ids)) return;
        let name = String(data.name || '').replace(/[\u0000-\u001F\u007F<>]/g, ' ').trim().slice(0, 20);
        const code = socket.data && socket.data.roomCode;
        if(code && duoRooms[code] && duoRooms[code].users[socket.id]){
          name = duoRooms[code].users[socket.id].name || name;
        }
        if(!name) name = (socket.data && socket.data.vonAussen) ? 'Besucher' : 'Kursleiter';
        const ich = chatSitzungFuer(socket);
        data.ids.slice(0, 50).forEach(function(id){
          id = String(id || '').slice(0, 32);
          if(!id) return;
          const n = chatNachrichtFinden(socket, id);
          if(!n || !n.userId || n.userId === socket.id) return;   // eigene zaehlen nicht
          const besitzer = chatBesitzer.get(id);
          if(besitzer && besitzer === ich) return;                // auch nicht nach Neuverbinden
          let leser = chatLeser.get(id);
          if(!leser){
            leser = new Map();
            chatLeser.set(id, leser);
            if(chatLeser.size > CHAT_LESER_MAX) chatLeser.delete(chatLeser.keys().next().value);
          }
          if(leser.has(ich)) return;
          leser.set(ich, name);
          const stand = { id: id, anzahl: leser.size, namen: Array.from(leser.values()).slice(0, 20) };
          // An den Absender - an jede seiner Verbindungen, auch nach einem
          // Neuverbinden mit neuer Socket-id.
          let gesendet = false;
          if(besitzer){
            io.sockets.sockets.forEach(function(s){
              if(s.data && s.data.chatSitzung === besitzer){ try{ s.emit('chatGelesenStand', stand); gesendet = true; }catch(e){} }
            });
          }
          if(!gesendet){
            const absender = io.sockets.sockets.get(n.userId);
            if(absender) absender.emit('chatGelesenStand', stand);
          }
        });
      }catch(e){ console.error('[CHAT] Gelesen-Fehler', e); }
    });

    // Eine Sprachnachricht kommt an.
    socket.on('duoSprache', data=>{
      try{
        if(!data || typeof data !== 'object') return;
        let buf = data.daten;
        if(buf instanceof ArrayBuffer) buf = Buffer.from(buf);
        if(!Buffer.isBuffer(buf) || buf.length < 200) return;
        if(buf.length > SPRACHE_MAX_GROESSE){ socket.emit('duoChatHinweis', 'Die Aufnahme ist zu lang.'); return; }
        const mime = String(data.mime || '').slice(0, 60);
        if(!SPRACHE_ARTEN.test(mime)) return;
        const dauer = Math.max(1, Math.min(SPRACHE_MAX_SEK, Math.round(Number(data.dauer) || 0)));
        // Die kleine Welle fuer die Sprechblase (25.09.2026, "wie in
        // WhatsApp"): 4 bis 64 Zahlen von 0 bis 100, die der Browser beim
        // Aufnehmen gemessen hat. Alles andere wird nicht mitgenommen.
        const sprache = { mime: mime, dauer: dauer };
        if(Array.isArray(data.welle) && data.welle.length >= 4 && data.welle.length <= 64){
          sprache.welle = data.welle.map(function(v){ return Math.max(0, Math.min(100, Math.round(Number(v) || 0))); });
        }
        // Hoechstens eine Aufnahme alle drei Sekunden je Teilnehmer
        const jetzt = Date.now();
        if(socket.data.spracheZuletzt && jetzt - socket.data.spracheZuletzt < 3000){
          socket.emit('duoChatHinweis', 'Bitte etwas langsamer.'); return;
        }
        socket.data.spracheZuletzt = jetzt;
        // Und hoechstens zwoelf in fuenf Minuten (25.09.2026) - seit im
        // Chat ohne Raum jeder sprechen darf, soll niemand mit einer Flut
        // von Aufnahmen die der anderen aus dem Speicher draengen.
        socket.data.spracheZeiten = (socket.data.spracheZeiten || []).filter(function(t){ return jetzt - t < 5 * 60 * 1000; });
        if(socket.data.spracheZeiten.length >= 12){
          socket.emit('duoChatHinweis', 'Das waren viele Sprachnachrichten – bitte ein paar Minuten warten.'); return;
        }
        socket.data.spracheZeiten.push(jetzt);
        const text = '\uD83C\uDFA4 Sprachnachricht (' + Math.floor(dauer / 60) + ':' + String(dauer % 60).padStart(2, '0') + ')';

        // --- Im Chat ohne Raum: jeder (bis 24.09.2026 nur der Gastgeber) ---
        if(data.code === '__haus'){
          if(socket.data && socket.data.roomCode) return;
          // Wer von aussen kommt, heisst wie beim Schreiben "Besucher" und
          // bekommt kein " · Server" hinter den Namen.
          const drinnen = !(socket.data && socket.data.vonAussen);
          let name = String(data.name || '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, 20) || (drinnen ? 'Kursleiter' : 'Besucher');
          const n = { id: crypto.randomBytes(8).toString('hex'), userId: socket.id, name: name, istHost: drinnen,
                      text: text, zeit: jetzt, haus: true, sprache: sprache };
          n.empfaenger = hausLeute().filter(function(x){ return x.id !== socket.id; }).length;
          chatBesitzerMerken(socket, n.id);
          spracheMerken(n.id, buf, mime);
          hausChat.push(n);
          while(hausChat.length > HAUS_CHAT_MAX) hausChat.shift();
          hausSenden('duoChatNachricht', n);
          console.log('[CHAT] Sprachnachricht ohne Raum - ' + name + ', ' + dauer + ' s, ' + Math.round(buf.length / 1024) + ' KB');
          return;
        }

        // --- Im Gruppenraum: jeder ---
        const room = duoRooms[data.code];
        if(!room) return;
        const user = room.users[socket.id];
        if(!user){ socket.emit('errorMsg','Du bist nicht in diesem Raum'); return; }
        const nachricht = { id: crypto.randomBytes(8).toString('hex'), userId: socket.id,
                            name: user.name || 'Teilnehmer', istHost: socket.id === room.hostId,
                            text: text, zeit: jetzt, sprache: sprache };
        try{
          let anz = Object.keys(room.users || {}).filter(function(k){ return k !== socket.id; }).length;
          if(socket.id === room.hostId) anz += hausOhneRaum().filter(function(x){ return x.id !== socket.id; }).length;
          nachricht.empfaenger = anz;
        }catch(e){}
        chatBesitzerMerken(socket, nachricht.id);
        spracheMerken(nachricht.id, buf, mime);
        if(!Array.isArray(room.chat)) room.chat = [];
        room.chat.push(nachricht);
        while(room.chat.length > CHAT_VERLAUF_MAX) room.chat.shift();
        io.to(data.code).emit('duoChatNachricht', nachricht);
        // Wie beim Text: Was der Gastgeber spricht, hoeren auch die am Link.
        if(socket.id === room.hostId){
          const draussen = hausOhneRaum();
          if(draussen.length){
            const kopie = Object.assign({}, nachricht, { haus: true });
            if(!hausChat.some(function(x){ return x.id === kopie.id; })){
              hausChat.push(kopie);
              while(hausChat.length > HAUS_CHAT_MAX) hausChat.shift();
            }
            draussen.forEach(function(x){ try{ x.emit('duoChatNachricht', kopie); }catch(e){} });
          }
        }
        console.log('[CHAT] ' + room.code + ' Sprachnachricht - ' + nachricht.name + ', ' + dauer + ' s, ' + Math.round(buf.length / 1024) + ' KB');
      }catch(e){ console.error('[CHAT] Sprache-Fehler', e); }
    });

    // Abspielen: Die Aufnahme holen - nur, wer die Nachricht auch sehen darf.
    socket.on('spracheHolen', data=>{
      try{
        const id = String((data && data.id) || '').slice(0, 32);
        if(!id) return;
        const n = chatNachrichtFinden(socket, id);
        const e = sprachSpeicher.get(id);
        if(!n || !e){ socket.emit('spracheDaten', { id: id, fehlt: true }); return; }
        socket.emit('spracheDaten', { id: id, mime: e.mime, daten: e.buf });
      }catch(e){ console.error('[CHAT] Sprache-holen-Fehler', e); }
    });

    // Loeschen (25.09.2026, siehe LOESCHEN UND REAGIEREN): die eigene
    // Nachricht - oder als Gastgeber jede.
    socket.on('chatLoeschen', data=>{
      try{
        const id = String((data && data.id) || '').slice(0, 32);
        if(!id) return;
        const ort = chatNachrichtOrt(socket, id);
        if(!ort || ort.n.geloescht) return;
        const besitzer = chatBesitzer.get(id);
        const vomAbsender = !!besitzer && besitzer === chatSitzungFuer(socket);
        const vomGastgeber = ort.room ? (socket.id === ort.room.hostId) : !(socket.data && socket.data.vonAussen);
        if(!vomAbsender && !vomGastgeber){
          socket.emit('duoChatHinweis', 'Löschen kann nur, wer die Nachricht geschrieben hat – oder der Server.');
          return;
        }
        const von = vomAbsender ? 'absender' : 'server';
        // Ueberall, wo sie steht: im Raum und - hat der Host sie
        // geschrieben - als Kopie im Chat ohne Raum. Dieselbe id.
        const raeume = [];
        let imHaus = false;
        function platzhalter(n){ n.geloescht = von; n.text = ''; delete n.sprache; }
        Object.keys(duoRooms).forEach(function(code){
          const r = duoRooms[code];
          if(r && Array.isArray(r.chat)) r.chat.forEach(function(n){ if(n.id === id){ platzhalter(n); raeume.push(code); } });
        });
        hausChat.forEach(function(n){ if(n.id === id){ platzhalter(n); imHaus = true; } });
        const e = sprachSpeicher.get(id);
        if(e){ sprachGesamt -= (e.buf ? e.buf.length : 0); sprachSpeicher.delete(id); }
        chatLeser.delete(id);
        chatReaktionen.delete(id);
        const meldung = { id: id, von: von };
        raeume.forEach(function(code){ io.to(code).emit('chatGeloescht', meldung); });
        if(imHaus) hausSenden('chatGeloescht', meldung);
        console.log('[CHAT] Nachricht geloescht (' + (vomAbsender ? 'vom Absender' : 'vom Kursleiter') + ')');
      }catch(e){ console.error('[CHAT] Loeschen-Fehler', e); }
    });

    // Reagieren (25.09.2026): Daumen hoch, Daumen runter, lustig, traurig,
    // gruenes Herz, Kleeblatt, erstaunt, Laecheln.
    // art leer oder dieselbe wie bisher = zuruecknehmen.
    socket.on('chatReagieren', data=>{
      try{
        const id = String((data && data.id) || '').slice(0, 32);
        const art = String((data && data.art) || '');
        if(!id || (art && REAKTIONEN.indexOf(art) === -1)) return;
        const ort = chatNachrichtOrt(socket, id);
        if(!ort || ort.n.geloescht || ort.n.system || ort.n.automatisch) return;
        // Hoechstens 20 Klicks in 10 Sekunden
        const jetzt = Date.now();
        socket.data.reaktZeiten = (socket.data.reaktZeiten || []).filter(function(t){ return jetzt - t < 10000; });
        if(socket.data.reaktZeiten.length >= 20) return;
        socket.data.reaktZeiten.push(jetzt);
        let name = String((data && data.name) || '').replace(/[\u0000-\u001F\u007F<>]/g, ' ').trim().slice(0, 20);
        if(ort.room && ort.room.users && ort.room.users[socket.id]) name = ort.room.users[socket.id].name || name;
        if(!name) name = (socket.data && socket.data.vonAussen) ? 'Besucher' : 'Kursleiter';
        const ich = chatSitzungFuer(socket);
        let r = chatReaktionen.get(id);
        if(!r){
          r = new Map();
          chatReaktionen.set(id, r);
          while(chatReaktionen.size > CHAT_REAKTIONEN_MAX) chatReaktionen.delete(chatReaktionen.keys().next().value);
        }
        const bisher = r.get(ich);
        if(!art || (bisher && bisher.art === art)) r.delete(ich);
        else r.set(ich, { art: art, name: name });
        // Jeder, der die Nachricht sieht, bekommt seine eigene Fassung.
        io.sockets.sockets.forEach(function(s){
          try{
            if(!chatNachrichtFinden(s, id)) return;
            s.emit('chatReaktionen', { id: id, reaktionen: reaktionenFuer(s, id) });
          }catch(e){}
        });
      }catch(e){ console.error('[CHAT] Reaktion-Fehler', e); }
    });

    // Verlauf auf Anfrage - wird vom Client nach Beitritt/Neuladen geholt
    socket.on('duoChatVerlaufAnfordern', data=>{
      try{
        if(!data || typeof data !== 'object') return;
        if(data.code === '__haus'){
          socket.emit('duoChatVerlauf', { code: '__haus', nachrichten: chatFuer(socket, null, hausChat) });
          return;
        }
        const room = duoRooms[data.code];
        if(!room || !room.users[socket.id]) return;
        socket.emit('duoChatVerlauf', { code: room.code, nachrichten: chatFuer(socket, room, room.chat) });
      }catch(e){ console.error('[CHAT] Verlauf-Fehler', e); }
    });

    // ================================================================
    // ABGLEICH: Der Host kann alle Teilnehmer zum Neuladen auffordern.
    // Nur der Host - sonst koennte jeder Teilnehmer den ganzen Raum stoeren.
    // ================================================================
    socket.on('duoAlleNeuLaden', data=>{
      try{
        if(!data || typeof data !== 'object') return;
        const room = duoRooms[data.code];
        if(!room) return;
        if(room.hostId !== socket.id){
          socket.emit('errorMsg','Nur der Host kann alle neu laden lassen');
          return;
        }
        const anzahl = Object.keys(room.users||{}).length;
        console.log(`[ABGLEICH] Host laesst ${anzahl} Teilnehmer in Raum ${room.code} neu laden`);
        io.to(data.code).emit('duoNeuLaden', { von: room.users[socket.id]?.name || 'Host' });
      }catch(e){ console.error('[ABGLEICH] Fehler', e); }
    });

    // Teilnehmer melden, welchen Dateistand sie geladen haben.
    // Der Host sieht daran, ob jemand mit einer alten Fassung arbeitet.
    socket.on('duoStandMelden', data=>{
      try{
        if(!data || typeof data !== 'object') return;
        const room = duoRooms[data.code];
        if(!room || !room.users[socket.id]) return;
        room.users[socket.id].dateiStand = String(data.kennung||'').slice(0,32);
        const aktuell = dateiStandErmitteln().kennung;
        const abweichend = Object.entries(room.users)
          .filter(([,u]) => u.dateiStand && u.dateiStand !== aktuell)
          .map(([id,u]) => ({ userId:id, name:u.name, stand:u.dateiStand }));
        if(room.hostId){
          io.to(room.hostId).emit('duoAbgleichStand', {
            aktuell,
            teilnehmer: Object.entries(room.users).map(([id,u])=>({
              userId:id, name:u.name, stand:u.dateiStand||null, aktuellerStand: u.dateiStand === aktuell
            })),
            abweichend
          });
        }
      }catch(e){ console.error('[ABGLEICH] Meldung fehlgeschlagen', e); }
    });

    // ================================================================
    // Konfiguration eines bestehenden Raums aendern.
    //
    // Bisher war die Auswahl nach dem Anlegen des Raums fuer immer gesperrt -
    // aus gutem Grund, denn alle Teilnehmer sollen exakt dieselben Fragen
    // bekommen. Nur konnte der Host dadurch einen Vertipper nicht mehr
    // korrigieren, ohne den Raum zu verlassen und neu anzulegen.
    // Jetzt gilt: Aendern ist erlaubt, SOLANGE der Host allein im Raum ist
    // und noch niemand geantwortet hat. Damit bleibt die Zusage "alle haben
    // dieselben Fragen" unangetastet.
    // ================================================================
    socket.on('duoConfigAendern', data=>{
      try{
        if(!data || typeof data !== 'object') return;
        const room = duoRooms[data.code];
        if(!room) return;
        if(room.hostId !== socket.id){
          socket.emit('errorMsg','Nur der Host darf die Konfiguration ändern');
          return;
        }
        const andere = Object.keys(room.users||{}).filter(id => id !== socket.id).length;
        const schonGeantwortet = Object.keys(room.allAnswers||{}).length > 0;
        if(andere > 0 || schonGeantwortet){
          socket.emit('errorMsg','Die Konfiguration lässt sich nur ändern, solange du allein im Raum bist und noch niemand geantwortet hat.');
          socket.emit('duoConfigGeaendert', { config: room.config, totalQuestions: room.questions.length, gesperrt: true });
          return;
        }
        room.config = { count: data.count, part: data.part, parts: data.parts, pruefung: data.pruefung === true };
        room.finalResultsSent = false;
        generateRoomQuestions(room);
        console.log(`[DUO] Konfiguration von Raum ${room.code} geaendert: count=${data.count} parts=${JSON.stringify(data.parts)} pruefung=${data.pruefung===true} -> ${room.questions.length} Fragen`);
        io.to(data.code).emit('duoConfigGeaendert', {
          config: room.config,
          totalQuestions: room.questions.length,
          gesperrt: false
        });
      }catch(e){ console.error('[DUO] duoConfigAendern Fehler', e); }
    });

    // ===== FIX PROBLEM 4: KICK USER =====
    socket.on('kickUser', (data) => {
      try {
        const room = duoRooms[data.code];
        if (!room) {
          socket.emit('errorMsg', 'Raum nicht gefunden');
          return;
        }
        if (room.hostId !== socket.id) {
          socket.emit('errorMsg', 'Nur der Host darf Benutzer entfernen');
          return;
        }
        if (!room.users[data.userIdToKick]) {
          socket.emit('errorMsg', 'Benutzer nicht gefunden');
          return;
        }
        if (data.userIdToKick === socket.id) {
          socket.emit('errorMsg', 'Du kannst dich nicht selbst kicken');
          return;
        }
        // ---------------------------------------------------------
        // ENTFERNEN - und auf Wunsch sperren
        // ---------------------------------------------------------
        // Dietmar am 28.08.2026: "Blockieren wird benoetigt, wenn einer
        // meiner Benutzer das mit jemand mir unbekannten den Link teilt."
        //
        // Ohne Sperre ist Entfernen wirkungslos: Der Link ist ja noch
        // gueltig, der Betreffende klickt ihn einfach wieder an. Gesperrt
        // wird die Adresse und nicht der Name - ein Name ist in zwei
        // Sekunden geaendert.
        const sperren = data.sperren === true;
        const kickedName = room.users[data.userIdToKick]?.name || room.users[data.userIdToKick]?.userName || 'Benutzer';
        const hostName = room.users[socket.id]?.name || 'Host';
        const ipRoh = (room.ipsVonTeilnehmern || {})[data.userIdToKick] || null;
        // Nur eine Adresse, auf die man wirklich sperren darf - siehe die
        // Begruendung bei sperrHindernis(). Der Grund wird mitgefuehrt,
        // damit der Gastgeber nicht nur erfaehrt DASS es nicht ging,
        // sondern auch warum.
        const hindernis = sperrHindernis(ipRoh);
        const ipDesGekickten = hindernis === '' ? ipRoh : null;

        if (sperren && ipDesGekickten) {
          if(!Array.isArray(room.gesperrteIps)) room.gesperrteIps = [];
          if(!room.gesperrteIps.includes(ipDesGekickten)) room.gesperrteIps.push(ipDesGekickten);
        }

        // Wer entfernt UND gesperrt wird, soll nicht ueber ein zweites
        // offenes Fenster im Raum bleiben. Deshalb fliegt jeder Socket mit
        // derselben Adresse mit - sonst waere die Sperre eine Sperre gegen
        // das Neuladen und gegen sonst nichts.
        const treffer = [data.userIdToKick];
        if (sperren && ipDesGekickten) {
          Object.keys(room.users).forEach(id => {
            if (id !== data.userIdToKick && id !== socket.id
                && (room.ipsVonTeilnehmern || {})[id] === ipDesGekickten) treffer.push(id);
          });
        }

        treffer.forEach(id => {
          const s = io.sockets.sockets.get(id);
          if (s) {
            s.emit('you-were-kicked', {
              message: sperren
                ? `Du wurdest vom Host (${hostName}) aus dem Raum entfernt und gesperrt.`
                : `Du wurdest vom Host (${hostName}) aus dem Raum entfernt.`,
              gesperrt: sperren,
              roomCode: data.code
            });
            s.leave(data.code);
            if (s.data) s.data.roomCode = null;
          }
          delete room.users[id];
          if (room.allAnswers && room.allAnswers[id]) delete room.allAnswers[id];
          if (room.ipsVonTeilnehmern) delete room.ipsVonTeilnehmern[id];
        });

        // Hier zaehlt, was TATSAECHLICH geschehen ist, nicht was gewuenscht
        // war. Beim Nachmessen stand im Fenster "entfernt und gesperrt
        // (unbekannt)", obwohl gar nicht gesperrt wurde - ein Protokoll,
        // das etwas anderes behauptet als der Server getan hat, ist
        // schlimmer als gar keins.
        console.log(`[GRUPPENRAUM] ${kickedName} wurde von ${hostName} aus Raum ${data.code} entfernt`
                    + (!sperren ? ''
                       : ipDesGekickten ? ` und gesperrt (${ipKuerzen(ipDesGekickten)})`
                       : ` - sperren nicht moeglich (${hindernis === 'lokal' ? 'eigenes Netz' : 'keine Adresse'})`)
                    + (treffer.length > 1 ? ` - dazu ${treffer.length - 1} weitere Fenster vom selben Anschluss` : ''));

        // Dem Gastgeber Rueckmeldung geben - er hat auf einen Knopf
        // gedrueckt und soll wissen, was daraus geworden ist.
        socket.emit('kickErgebnis', {
          name: kickedName,
          gesperrt: sperren && !!ipDesGekickten,
          adresse: ipDesGekickten ? ipKuerzen(ipDesGekickten) : null,
          weitere: treffer.length - 1,
          // Konnte nicht gesperrt werden? Dann ehrlich sagen, dass die
          // Sperre nicht griff - und warum. "lokal" heisst: derselbe
          // WLAN-/Netzstrang, da wird bewusst nicht gesperrt.
          ohneAdresse: sperren && !ipDesGekickten,
          grund: (sperren && !ipDesGekickten) ? (hindernis || 'unbekannt') : null
        });
        const remaining = Object.keys(room.users);
        if (remaining.length === 0) {
          delete duoRooms[data.code];
          io.to(data.code).emit('roomDeleted', { code: data.code });
          return;
        }
        if (room.hostId === data.userIdToKick) {
          room.hostId = remaining[0];
          io.to(data.code).emit('hostChanged', { hostId: room.hostId });
        }
        io.to(data.code).emit('roomUpdate', {
          users: room.users,
          hostId: room.hostId
        });
        const trainerDataKick = getTrainerData(room);
        if (trainerDataKick && room.hostId) {
          io.to(room.hostId).emit('duoTrainerLive', trainerDataKick);
        }
      } catch (err) {
        console.error('[DUO] kickUser error', err);
        socket.emit('errorMsg', 'Fehler beim Kicken: ' + err.message);
      }
    });

    // ================================================================
    //  DER GASTGEBER BEENDET DEN RAUM                (05.09.2026)
    // ================================================================
    //  Bis heute gab es keinen Weg, einen Raum absichtlich zu beenden.
    //  "Schliessen" im Fenster machte nur das Fenster zu; der Raum lief
    //  weiter, bis der letzte Teilnehmer von selbst ging. Dietmar: "Wenn
    //  ich im Gruppenraum den Button schliessen betaetige, muss auch der
    //  Gruppenchat beendet werden" - und auf Nachfrage: den Raum wirklich
    //  beenden.
    //
    //  Nur der Gastgeber darf das. Wer nicht Gastgeber ist, geht ueber
    //  leaveRoom und verlaesst nur sich selbst - sonst koennte ein
    //  beliebiger Teilnehmer allen anderen den Abend beenden.
    socket.on('raumBeenden', data=>{
      try{
        const code = (data && typeof data === 'object' ? data.code : null) || socket.data.roomCode;
        const room = code && duoRooms[code];
        if(!room) return;
        if(room.hostId !== socket.id){
          // Kein Fehler, nur nicht erlaubt: Dann verlaesst er eben sich selbst.
          socket.emit('errorMsg', 'Nur der Kursleiter kann den Raum beenden.');
          return;
        }
        io.to(code).emit('roomDeleted', { code: code });
        delete duoRooms[code];
        console.log(`[DUO] Raum ${code} vom Kursleiter beendet.`);
      }catch(e){ console.error('[DUO] raumBeenden Fehler', e); }
    });

    socket.on('leaveRoom',data=>{
     try{
      const code=(data && typeof data==='object' ? data.code : null)||socket.data.roomCode;
      if(code&&duoRooms[code]){
        delete duoRooms[code].users[socket.id];
        // FIX W11: Antworten mitloeschen. kickUser machte das korrekt,
        // leaveRoom und disconnect liessen sie liegen.
        if(duoRooms[code].allAnswers) delete duoRooms[code].allAnswers[socket.id];
        socket.leave(code);
        // Ohne diese Zeile blieb der Merker stehen: Der Trainer haette
        // denjenigen fuer immer als "im Raum" gefuehrt, und er waere aus
        // dem Chat ohne Raum ausgeschlossen geblieben.
        socket.data.roomCode = null;
        setTimeout(function(){ try{
          socket.emit('duoChatVerlauf', { code: '__haus', nachrichten: chatFuer(socket, null, hausChat) });
          hausVolkMelden();
        }catch(e){} }, 30);
        if(duoRooms[code].hostId===socket.id){
          const remaining = Object.keys(duoRooms[code].users);
          if(remaining.length>0){ duoRooms[code].hostId = remaining[0]; io.to(code).emit('hostChanged',{hostId: duoRooms[code].hostId}); }
        }
        io.to(code).emit('roomUpdate',{users:duoRooms[code].users, hostId: duoRooms[code].hostId});
        const trainerDataLeave = getTrainerData(duoRooms[code]);
        if(trainerDataLeave && duoRooms[code].hostId){ io.to(duoRooms[code].hostId).emit('duoTrainerLive', trainerDataLeave); }
        cleanupRoomIfEmpty(code);
      }
     }catch(e){ console.error('[DUO] leaveRoom Fehler', e); }
    });

    // Konsolidierter Disconnect Handler
    socket.on('disconnect', (reason)=>{
      clearInterval(activityTimeout);
      console.log(`[SOCKET] ${socket.id} getrennt (Grund: ${reason})`);
      const code = socket.data.roomCode;
      if(code && duoRooms[code]){
        const wasHost = duoRooms[code].hostId === socket.id;
        delete duoRooms[code].users[socket.id];
        // FIX W11: siehe leaveRoom
        if(duoRooms[code].allAnswers) delete duoRooms[code].allAnswers[socket.id];
        
        if(wasHost){
          const remaining = Object.keys(duoRooms[code].users);
          if(remaining.length > 0){
            duoRooms[code].hostId = remaining[0];
            io.to(code).emit('hostChanged', { hostId: duoRooms[code].hostId });
          }
        }
        
        io.to(code).emit('userLeft', { userId: socket.id, users: duoRooms[code].users });
        io.to(code).emit('roomUpdate', {
          users: duoRooms[code].users,
          hostId: duoRooms[code].hostId
        });
        
        const trainerDataDisc = getTrainerData(duoRooms[code]);
        if(trainerDataDisc && duoRooms[code].hostId){
          io.to(duoRooms[code].hostId).emit('duoTrainerLive', trainerDataDisc);
        }
        cleanupRoomIfEmpty(code);
      }
      // Einer weniger im Haus - die Anzahl gilt fuer alle neu. Erst im
      // naechsten Takt, sonst zaehlt der gerade Gegangene noch mit.
      setTimeout(hausVolkMelden, 30);
    });
  });
  server=srv;
} catch(e){
  console.warn('Socket.IO nicht verfügbar, starte ohne Duo:', e.message);
  server=http.createServer(app);
}

// ================================================================
// DEN BROWSER AUFMACHEN
// ================================================================
// Bis zum 28.08.2026 machte das START.bat - mit einer Zeile, die ein
// ZWEITES Eingabeaufforderungsfenster oeffnete und darin bis zu zwanzig
// Sekunden lang per curl fragte, ob der Server schon da ist.
//
// Zwei Fenster fuer einen Trainer sind eines zu viel. Und das Pollen war
// ohnehin nur ein Umweg um die Frage "ist der Server bereit?" - die hier
// niemand stellen muss: An dieser Stelle IST er bereit, listen() hat
// gerade zurueckgemeldet.
//
// Nur auf ausdrueckliche Bitte (AFU_BROWSER=1), damit "node Server.js"
// von Hand nicht ungefragt einen Browser aufreisst - dieselbe Regel wie
// beim Tunnel (AFU_TUNNEL=1, Fix K2).
function browserOeffnen(url){
  // Ein Kindprozess, der sich nicht starten laesst, meldet das ueber ein
  // 'error'-Ereignis. Hoert dort niemand zu, wirft Node die Ausnahme in
  // die Ereignisschleife - und der Server waere wegen eines nicht
  // geoeffneten Browsers beendet. Deshalb bekommt jeder Versuch einen
  // Zuhoerer.
  const starte = (befehl, args) => {
    const k = spawn(befehl, args, { detached:true, stdio:'ignore', windowsHide:true });
    k.on('error', e => {
      console.warn('[START] Der Browser liess sich nicht oeffnen:', e.message);
      console.warn('[START] Bitte von Hand aufrufen: ' + url);
    });
    k.unref();
  };
  try{
    if(process.platform === 'win32'){
      // "start" ist ein eingebauter Befehl der Eingabeaufforderung, kein
      // Programm - deshalb ueber cmd. Der leere Parameter davor ist der
      // Fenstertitel: Ohne ihn haelt start eine Adresse in
      // Anfuehrungszeichen faelschlich fuer den Titel und oeffnet nichts.
      // windowsHide: kein aufblitzendes schwarzes Fenster.
      starte('cmd', ['/c', 'start', '', url]);
    }else if(process.platform === 'darwin'){
      starte('open', [url]);
    }else{
      starte('xdg-open', [url]);
    }
  }catch(e){
    console.warn('[START] Der Browser liess sich nicht oeffnen:', e.message);
    console.warn('[START] Bitte von Hand aufrufen: ' + url);
  }
}

// ================================================================
//  FEIERABEND, WENN NIEMAND MEHR HINSIEHT
// ================================================================
//  Laeuft nur, wenn der Server den Browser selbst aufgemacht hat
//  (AFU_BROWSER=1, also der normale Doppelklick auf START.bat). Wer
//  "node Server.js" von Hand startet oder START_SICHTBAR.bat nimmt,
//  will einen Server, der stehen bleibt - womoeglich ganz ohne Browser.
//
//  Drei Bremsen, damit er nicht zur falschen Zeit aufhoert:
//    - die ersten zwei Minuten nach dem Start gar nicht (der Browser
//      braucht seinen Moment, und beim ersten Start dauert es laenger)
//    - nie, bevor sich ueberhaupt einmal jemand gemeldet hat
//    - nie waehrend ein Hoerbuch gerechnet wird
// ================================================================
//  ----------------------------------------------------------------
//  04.09.2026 - DIE FRIST WAR ZU KURZ. Dietmar: "Der Trainer schmiert
//  nach kurzer Interaktivitaet immer noch ab. Das nervt unwahrscheinlich!"
//  Symptom: Die Seite ist ploetzlich nicht mehr erreichbar, ohne Muster.
//
//  Es war nie ein Absturz. Der Server hat sich selbst beendet, und zwar
//  zu Unrecht:
//
//  Die Seite meldet sich alle zehn Sekunden. Chrome und Edge BREMSEN
//  aber Zeitgeber in Hintergrund-Tabs aus - nach einigen Minuten nur
//  noch einmal pro Minute, und beide Browser legen unbenutzte Tabs von
//  sich aus schlafen ("Energiesparmodus", "Sleeping Tabs"), dann laeuft
//  gar kein Zeitgeber mehr. Bei 45 Sekunden Frist reicht das:
//  Der Server sieht eine Luecke, haelt den letzten Zuschauer fuer
//  gegangen und macht Feierabend - waehrend das Fenster offen daneben
//  steht.
//
//  Verschaerft hat es der neue Kasten unter der Frage: "Video ansehen"
//  und "Bei 50 Ohm nachlesen" oeffnen einen NEUEN TAB. Damit ist der
//  Trainer genau in dem Moment im Hintergrund, in dem man etwas
//  nachliest - und die Bremse greift.
//
//  Die Frist steht deshalb auf fuenf Minuten. Das ist immer noch der
//  Zweck der Sache - "der Browser ist zu, also ist Schluss" -, nur
//  ohne die Annahme, dass ein Browser Zeitgeber puenktlich ausfuehrt.
//  Der Preis ist, dass ein herrenloser Server fuenf Minuten statt 45
//  Sekunden weiterlaeuft. Das faellt niemandem auf; ein Server, der
//  mitten im Lernen abschaltet, sehr wohl.
//  ----------------------------------------------------------------
const AUFPASSER_TAKT   = 15000;   // wie oft nachgesehen wird
const ZUSCHAUER_FRIST   = 300000; // so lange gilt ein Lebenszeichen (5 Min)
const ANLAUF            = 120000; // Schonzeit nach dem Start
const TUNNEL_LEERLAUF   = 4*60*60*1000;  // mit Tunnel: erst nach 4 h Leerlauf Schluss
let jemandWarDa = false;
let cfKoepfeGezeigt = false;   // die Geo-Diagnose laeuft einmal je Start
const SERVER_START_MS = Date.now();

function feierabendPruefen(){
  const jetzt = Date.now();
  for(const [id, wann] of zuschauer){
    if(jetzt - wann > ZUSCHAUER_FRIST){
      // Mitschreiben, wie lange das letzte Lebenszeichen her war. Wenn der
      // Trainer noch einmal zur falschen Zeit aufhoert, steht hier, warum.
      console.log('[ENDE] Zuschauer ' + id + ' seit ' +
                  Math.round((jetzt - wann)/1000) + ' s stumm - ausgetragen.');
      zuschauer.delete(id);
    }
  }
  if(zuschauer.size > 0){
    jemandWarDa = true;
    // Wieder jemand da - die Leerlaufuhr des Tunnels faengt von vorn an.
    feierabendPruefen._leerSeit = null;
    feierabendPruefen._zuletztGemeldet = null;
    return;
  }
  if(!jemandWarDa) return;
  if(jetzt - SERVER_START_MS < ANLAUF) return;

  // ----------------------------------------------------------------
  //  KEIN FEIERABEND, SOLANGE DER GRUPPENRAUM LEBT
  //  Dietmar am 07.09.2026: "Der Trainer muss auch ueber Stunden
  //  laufen, ohne dass ich am Rechner aktiv bin."
  //
  //  Das ging bis heute schief: Das Lebenszeichen kommt aus dem
  //  BROWSER. Legt Windows den Rechner schlafen, oder legt Chrome den
  //  Trainer-Tab schlafen (das tut er bei einem Fenster, das stundenlang
  //  im Hintergrund steht), dann hoert es auf - und fuenf Minuten
  //  spaeter macht der Server Feierabend. Mitten in der Uebungsrunde,
  //  waehrend die Teilnehmer noch drin sitzen.
  //
  //  Deshalb zaehlt jetzt nicht mehr nur der Browser:
  //    * Sitzt jemand im Gruppenraum, wird gar nicht abgeschaltet.
  //    * Laeuft ein Tunnel, gilt statt der fuenf Minuten eine Frist von
  //      vier Stunden. So bleibt der Link auch dann stehen, wenn kurz
  //      niemand da ist - und ein vergessener oeffentlicher Tunnel
  //      laeuft trotzdem nicht bis in alle Ewigkeit.
  // ----------------------------------------------------------------
  const imRaum = duoTeilnehmerAnzahl();
  if(imRaum > 0){
    if(!feierabendPruefen._raumGemeldet){
      console.log('[ENDE] Kein Fenster offen, aber ' + imRaum + ' Teilnehmer im Gruppenraum - ich bleibe.');
      feierabendPruefen._raumGemeldet = true;
    }
    return;
  }
  feierabendPruefen._raumGemeldet = false;

  if(tunnelGewuenscht && tunnelProcess){
    if(!feierabendPruefen._leerSeit) feierabendPruefen._leerSeit = jetzt;
    const leerSeit = jetzt - feierabendPruefen._leerSeit;
    if(leerSeit < TUNNEL_LEERLAUF){
      const min = Math.round(leerSeit/60000);
      if(min > 0 && min % 30 === 0 && feierabendPruefen._zuletztGemeldet !== min){
        feierabendPruefen._zuletztGemeldet = min;
        console.log('[ENDE] Seit ' + min + ' Minuten niemand da, aber der Tunnel laeuft. '
                  + 'Feierabend nach ' + (TUNNEL_LEERLAUF/3600000) + ' Stunden Leerlauf.');
      }
      return;
    }
    console.log('[ENDE] Vier Stunden lang niemand im Gruppenraum - der Tunnel wird geschlossen.');
  }
  feierabendPruefen._leerSeit = null;
  feierabendPruefen._zuletztGemeldet = null;
  try{
    if(hoerbuchModul && hoerbuchModul.laeuftGerade && hoerbuchModul.laeuftGerade()){
      console.log('[ENDE] Niemand sieht mehr hin - aber es laeuft noch ein Hoerbuch. Ich warte.');
      return;
    }
  }catch(e){}
  console.log('');
  console.log('[ENDE] Kein Fenster mehr offen. Der Trainer macht Feierabend.');
  console.log('[ENDE] Zum Weiterlernen einfach wieder START.bat.');
  tunnelGewuenscht = false;   // sonst baut die Wache in der letzten Sekunde neu auf
  try{ tunnelBeenden(); }catch(e){}
  setTimeout(()=>process.exit(0), 300);
}

// ----------------------------------------------------------------
//  NUR LOOPBACK AUF DEM SERVER-RECHNER                 (22.09.2026)
//  Auf dem Trainer-PC hoert der Trainer auch im WLAN (0.0.0.0), damit
//  Tablets im selben Netz mitmachen koennen. Auf dem ThinkPad, das nur
//  Server ist, kommt alles ueber cloudflared herein - und das spricht
//  localhost. START-SERVER.bat setzt deshalb AFU_NUR_LOKAL=1: Dann
//  hoert der Trainer nur noch auf 127.0.0.1, und wer im WLAN des
//  ThinkPads sitzt, sieht auf Port 3000 gar nichts. Eine Angriffs-
//  flaeche weniger, ohne dass draussen etwas fehlt.
// ----------------------------------------------------------------
const NUR_LOKAL = (process.env.AFU_NUR_LOKAL === '1');
server.listen(PORT, NUR_LOKAL ? '127.0.0.1' : '0.0.0.0', async ()=>{
  if(NUR_LOKAL) console.log('[NETZ] AFU_NUR_LOKAL=1 - der Trainer hoert nur auf 127.0.0.1 (kein WLAN-Zugang).');
  // Zuerst der Browser, dann das Uebrige: Der Trainer soll aufgehen,
  // waehrend im Fenster noch die Tunnel-Zeilen durchlaufen.
  if(process.env.AFU_BROWSER === '1') browserOeffnen(`http://localhost:${PORT}`);

  // Die Zuordnung des DARC still nachholen, falls sie fehlt oder alt ist.
  // Wartet acht Sekunden und stoert den Start nicht - siehe ohmIndexAutomatik().
  ohmIndexAutomatik();

  // Das Zeichen auf dem Schreibtisch. Siehe zeichenAutomatik() weiter unten.
  zeichenAutomatik();

  console.log('[TUNNEL] Prüfe Binary beim Start...');
  const check = checkCloudflaredExists();
  console.log('[TUNNEL] Binary-Check:', check);
  if(!check.exists){
    console.warn('[TUNNEL] !!! cloudflared.exe fehlt! Tunnel kann nicht starten.');
    console.warn('[TUNNEL] Download: https://github.com/cloudflare/cloudflared/releases');
    console.warn('[TUNNEL] Lege cloudflared.exe neben server.js ab.');
  }
  // ================================================================
  // FIX K2: Kein automatischer Tunnel-Start mehr.
  // Vorher wurde der lokale Server 2 Sekunden nach jedem Start ungefragt
  // ins oeffentliche Internet gestellt - auch wenn man nur allein lernen
  // wollte. Der Tunnel startet jetzt ausschliesslich auf ausdruecklichen
  // Wunsch: Button "Tunnel starten" bzw. "Raum erstellen" in der App
  // (ruft POST /api/start-tunnel), oder beim Start mit AFU_TUNNEL=1.
  // ================================================================
  // Beim Start einmal aufraeumen - so beginnt jeder Neustart garantiert sauber,
  // auch wenn das Fenster beim letzten Mal per X geschlossen wurde.
  verwaisteTunnelProzesseBeenden();

  // Beim Gastgeber nachsehen, ob es Neues gibt. Bewusst erst nach kurzer
  // Verzoegerung und ohne await: Der Server ist sofort da, der Abgleich laeuft
  // im Hintergrund. Ist der Gastgeber nicht erreichbar, faellt es nicht auf.
  setTimeout(()=>{ autoAbgleich().catch(e=>console.warn('[ABGLEICH]', e.message)); }, 1500);

  if(process.env.AFU_TUNNEL === '1'){
    console.log('[TUNNEL] AFU_TUNNEL=1 gesetzt - starte Tunnel automatisch...');
    setTimeout(()=>{
      startTunnelProcess().then(url=>{
        if(url) console.log('[TUNNEL] Auto-Start erfolgreich:', url);
        else console.warn('[TUNNEL] Auto-Start fehlgeschlagen - im Browser "Tunnel starten" klicken');
      }).catch(e=>console.warn('[TUNNEL] auto-start failed', e.message));
    }, 2000);
  } else {
    console.log('[TUNNEL] Kein Auto-Start (Fix K2). Der Server ist nur lokal erreichbar.');
    console.log('[TUNNEL] Fuer den Gruppenraum im Browser auf "Tunnel starten" klicken.');
  }
  if(process.env.AFU_BROWSER === '1'){
    setInterval(feierabendPruefen, AUFPASSER_TAKT);
    console.log('[ENDE] Der Trainer beendet sich selbst, sobald kein Fenster mehr offen ist.');
  }
  console.log('============================================================');
  console.log('  SERVER V18 - Sicherheits-Fixes K1-K7 (17.08.2026)');
  console.log(`  http://localhost:${PORT}`);
  const lan = NUR_LOKAL ? [] : lokaleAdressen();
  if(lan.length){
    console.log(`  Im gleichen Netz (WLAN/LAN) erreichbar unter:`);
    lan.slice(0,3).forEach(a=>console.log(`    http://${a.ip}:${PORT}`));
    console.log(`  -> Fuer Teilnehmer im selben Netz braucht es KEINEN Tunnel.`);
  }
  console.log(`  Stimmen: ${listVoices().length}`);
  console.log('  Freigabe nach aussen: nur nach Klick auf "Tunnel starten"');
  console.log('============================================================');
});
server.on('error',err=>{ if(err.code==='EADDRINUSE'){ console.error(`Port ${PORT} belegt`); process.exit(1);} });