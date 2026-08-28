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

// ===== TUNNEL AUTO-START (V13) =====
let tunnelProcess = null;
let tunnelUrlCache = null;
let tunnelStarting = false;

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
  if(process.platform !== 'win32') return Promise.resolve();
  return new Promise(resolve=>{
    execFile('taskkill', ['/IM','cloudflared.exe','/F'], {timeout:5000}, (err, stdout, stderr)=>{
      const text = String(stdout||'') + String(stderr||'');
      if(!err && /erfolgreich|SUCCESS/i.test(text)){
        console.log('[TUNNEL] Uebrig gebliebene cloudflared.exe-Prozesse beendet.');
      } else if(err && !/nicht gefunden|not found|nicht ausgef|could not be found/i.test(text)){
        console.debug('[TUNNEL] taskkill:', text.trim().slice(0,120));
      }
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
    process.on(sig, ()=>{ console.log(`\n[TUNNEL] ${sig} empfangen - raeume auf...`); tunnelBeenden(); process.exit(0); });
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
    ['difficult',   'objekt']
  ];
  for(const [feld, art] of felder){
    if(!istObjekt(roh[feld])) continue;                 // falscher Typ -> Standard behalten
    for(const u of USER_IDS){
      const wert = roh[feld][u];
      if(art === 'array' && Array.isArray(wert))      sauber[feld][u] = wert;
      else if(art === 'objekt' && istObjekt(wert))    sauber[feld][u] = wert;
    }
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

function findPiper(){ const c=[path.join(PIPER_DIR,'piper.exe')]; for(const x of c) if(fs.existsSync(x)) return {type:'binary',path:x}; return {type:'python',path:'python'}; }
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

// FIX Q9: ausdrueckliches Body-Limit statt sich auf den Standard zu verlassen
app.use(express.json({limit:'256kb'}));

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
const PROXY_HEADERS = ['cf-ray','cf-connecting-ip','x-forwarded-for','x-forwarded-host','x-real-ip','forwarded'];
function isLocalRequest(req){
  const ip = String(req.ip||'').replace(/^::ffff:/,'');
  if(ip !== '127.0.0.1' && ip !== '::1') return false;
  return !PROXY_HEADERS.some(h => req.headers[h]);
}
function localOnly(req,res,next){
  if(isLocalRequest(req)) return next();
  console.warn('[SEC] Externer Zugriff blockiert:', req.method, req.originalUrl, 'von', req.headers['cf-connecting-ip']||req.ip);
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
const FELD_TYP = { examHistory:'array', errors:'array', mastery:'objekt', difficult:'objekt' };
const TYP_ALIAS = {
  history:'examHistory', examHistory:'examHistory',
  mastery:'mastery',     lernfortschritt:'mastery',
  difficult:'difficult', lernbedarf:'difficult',
  errors:'errors'
};
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

app.get('/fragen.json',(req,res)=>{
  try{
    ladeFragen();
    if(!fragenRohCache) return res.status(404).json({error:'nicht gefunden'});
    res.setHeader('Content-Type','application/json');
    res.send(fragenRohCache);
  }catch(e){ console.error('[FRAGEN] Ausliefern fehlgeschlagen:', e.message); res.status(500).json({error:'Fehler'}); }
});
app.get('/api/tts-voices',(req,res)=>{ const v=listVoices(); res.json({voices:v, default:v[0]?.file||'de_DE-thorsten-medium.onnx'}); });

// ================================================================
// HOERBUCH: Fragen + richtige Antwort als MP3 fuers Autoradio.
// Der Stapelauftrag steht in hoerbuch.js - hier wird nur eingehaengt.
// Er bekommt genau das, was er braucht (Piper, Stimmenliste, Katalog),
// und nichts weiter; er kennt weder Gruppenraeume noch Lernstaende.
// ================================================================
try{
  require('./hoerbuch').einrichten({
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

app.get('/api/version',(req,res)=>{
  try{
    const stand = dateiStandErmitteln();
    res.json({ kennung: stand.kennung, dateien: stand.dateien, serverStart: SERVER_START });
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
  'Index.html', 'duo.js', 'Server.js', 'package.json',
  'fragen.json', 'svg-list.json', 'video_lessons.json', 'video_map_embed.js',
  'Fragen-E.json', 'Fragen-A.json', 'Fragen-N-Auf-E.json', 'Fragen-E-Auf-A.json', 'Fragen-N-Auf-A.json',
  'klick-sound.js', 'tts-expand.js', 'hoerbuch.js', 'lame.js',
  // README.txt ist am 27.08.2026 herausgeflogen: Sie erklaerte eine
  // Handinstallation von Piper, die piper.bat laengst allein macht,
  // und nannte Dateien bei alten Namen. Im Paket liegt die richtige
  // ANLEITUNG.txt, auf dem Stick die ANLEITUNG-USB.txt.
  'START.bat', 'piper.bat',
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
const PAKET_ORDNER = ['svgs', 'sounds'];

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
      '  Gastgeber kommen hier NICHT von allein an. Fuer ein Update das Paket',
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
                           'Fragen-E-Auf-A.json', 'Fragen-N-Auf-A.json'];
const ABGLEICH_BROWSER  = ['Index.html', 'duo.js', 'klick-sound.js', 'tts-expand.js'];
const ABGLEICH_PROGRAMM = ['Server.js', 'hoerbuch.js', 'lame.js'];
const ABGLEICH_ALLE     = [...ABGLEICH_DATEN, ...ABGLEICH_BROWSER, ...ABGLEICH_PROGRAMM];

function abgleichKategorie(name){
  if(ABGLEICH_DATEN.includes(name))   return 'daten';
  if(ABGLEICH_BROWSER.includes(name)) return 'browser';
  return 'programm';
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
    res.status(502).json({error:'Der Gastgeber ist nicht erreichbar: ' + e.message});
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
  console.log(`[ABGLEICH] Sehe beim Gastgeber nach: ${quelle}`);
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
      console.log(`   ABGLEICH: ${geschrieben.length} Datei(en) vom Gastgeber uebernommen`);
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
    console.log(`[ABGLEICH] Gastgeber nicht erreichbar (${e.message}) - es bleibt beim eigenen Stand.`);
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
  console.log('[ABGLEICH] Adresse des Gastgebers gemerkt:', quelle);
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

app.get('/api/tunnel-status',(req,res)=>{
  res.json({running: !!(tunnelProcess && !tunnelProcess.killed), url: tunnelUrlCache || null, pid: tunnelProcess ? tunnelProcess.pid : null});
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
app.post('/api/tts',(req,res)=>{
  let text=String(req.body.text||'').trim(); if(!text) return res.status(400).json({error:'Kein Text'});
  // FIX K5: Laengenbegrenzung
  if(text.length > TTS_MAX_TEXT_LEN){
    return res.status(413).json({error:`Text zu lang (${text.length} Zeichen, max. ${TTS_MAX_TEXT_LEN}).`});
  }
  const original=text; text=expandTTS(text);
  const voices=listVoices(); if(!voices.length) return res.status(500).json({error:'Keine Stimmen in piper/'});
  const voice=voices.find(v=>v.file===req.body.voice)||voices[0];
  const hash=crypto.createHash('md5').update(voice.file+'::'+text).digest('hex');
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
  // FIX K5: Begrenzung der gleichzeitig laufenden piper.exe-Prozesse
  if(ttsActive >= TTS_MAX_PARALLEL){
    console.warn(`[TTS] Abgelehnt - bereits ${ttsActive} Prozesse aktiv`);
    return res.status(429).json({error:'Sprachausgabe gerade ausgelastet. Bitte einen Moment warten.'});
  }
  const piper=findPiper();
  console.log(`[TTS] ${piper.type} Model:${voice.file} Text:${original.slice(0,60)} -> ${text.slice(0,80)}`);
  let proc,done=false,err='';
  // Slot belegen und garantiert genau einmal wieder freigeben
  ttsActive++;
  let slotReleased = false;
  const releaseTtsSlot = ()=>{ if(slotReleased) return; slotReleased = true; ttsActive = Math.max(0, ttsActive-1); };
  const opts={cwd:PIPER_DIR, env:{...process.env, PYTHONIOENCODING:'utf-8', PYTHONUTF8:'1'}};
  // FIX K7: spawn selbst kann synchron werfen - dann wuerde der Slot fuer immer belegt bleiben
  try{
    if(piper.type==='binary') proc=spawn(piper.path,['--model',voice.fullPath,'--output_file',outTmp],opts);
    else proc=spawn('python',['-m','piper','--model',voice.fullPath,'--output_file',outTmp],opts);
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
      const crashHint = getWinCrashHint(code);
      console.error(`[TTS] Fehler Exitcode=${code} stderr="${err.slice(0,300)}" piper.path=${piper.path} voice=${voice.fullPath}`);
      let msg;
      if(crashHint){
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
  '/klick-sound.js',
  '/favicon.ico',
  // Merkzettel fuer den Probelauf des Updaters, angelegt von
  // Update-Test.bat. Die Seite sieht regelmaessig nach, ob es ihn gibt;
  // ohne diesen Eintrag stuende bei jedem Blick eine Sicherheitswarnung im
  // Serverfenster, sobald die Datei einmal da ist. Sie enthaelt nur einen
  // Zeitstempel - nichts, was jemanden angehen koennte - und steht in der
  // .gitignore. Im Normalfall gibt es sie gar nicht, dann ist das hier
  // schlicht ein Eintrag ins Leere.
  '/update_test.json'
]);
const PUBLIC_DIRS = ['/svgs/', '/sounds/'];

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
        // FIX W7: 6 Zeichen statt 4 und Kollisionspruefung. Vorher konnte ein
        // zufaellig doppelter Code einen laufenden Raum samt aller Antworten
        // kommentarlos ueberschreiben - die Teilnehmer darin sassen dann in
        // einem fremden Raum.
        const code=freienRaumcodeFinden();
        const pwd = (data.password||'').toString().trim();
        console.log(`[DUO SERVER V17] createRoom ${code} count=${data.count} part=${data.part} parts=${JSON.stringify(data.parts)} pwd=${pwd?'yes':'no'}`);
        duoRooms[code]={code, users:{}, questions:[], questionsFull:[], allAnswers:{}, chat:[], hostId:socket.id, password: pwd||null, createdAt:Date.now(), finalResultsSent:false, config:{count:data.count, part:data.part, parts:data.parts}};
        // FIX: Client sendet 'name', nicht 'userName' -> beide Schlüssel akzeptieren
        const userName = data.name || data.userName || 'Benutzer 1';
        duoRooms[code].users[socket.id]={name:userName, role:'Host'};
        socket.join(code); socket.data.roomCode=code;

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
      socket.join(data.code); socket.data.roomCode=data.code;
      // Fragen stehen schon seit Raum-Erstellung fest - jeder Beitretende bekommt dieselbe Basis
      if(!room.questionsFull || room.questionsFull.length===0) generateRoomQuestions(room);
      socket.emit('roomJoined',{code:data.code, userId:socket.id, hostId: room.hostId, users:room.users, totalQuestions: room.questions.length});
      // Chatverlauf gleich mitschicken, damit spaeter Beitretende den Faden kennen
      socket.emit('duoChatVerlauf', { code: data.code, nachrichten: Array.isArray(room.chat) ? room.chat : [] });
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
        if(finished){
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
          finished, examStatus
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
        meta:{code:data.code, parts:room.config?room.config.parts:undefined, count:room.config?room.config.count:undefined, part:room.config?room.config.part:undefined, actualCount:room.questions.length},
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
      room.allAnswers[uid][data.questionId]={optionIndex:data.optionIndex, isCorrect:verified, userId:uid, answeredAt:Date.now()};

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
              text: '🏁 ist mit allen Fragen fertig: ' + meineStats.correct + '/' + meineStats.total + ' richtig (' + statusText + ').',
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
            const hostName = (room.users && room.hostId && room.users[room.hostId] && room.users[room.hostId].name) || 'Host';
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
        room.chat.push(nachricht);
        while(room.chat.length > CHAT_VERLAUF_MAX) room.chat.shift();

        io.to(data.code).emit('duoChatNachricht', nachricht);
        console.log(`[CHAT] ${room.code} ${nachricht.name}: ${text.slice(0,60)}`);
      }catch(e){ console.error('[CHAT] Fehler', e); }
    });

    // Verlauf auf Anfrage - wird vom Client nach Beitritt/Neuladen geholt
    socket.on('duoChatVerlaufAnfordern', data=>{
      try{
        if(!data || typeof data !== 'object') return;
        const room = duoRooms[data.code];
        if(!room || !room.users[socket.id]) return;
        socket.emit('duoChatVerlauf', { code: room.code, nachrichten: Array.isArray(room.chat) ? room.chat : [] });
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
        room.config = { count: data.count, part: data.part, parts: data.parts };
        room.finalResultsSent = false;
        generateRoomQuestions(room);
        console.log(`[DUO] Konfiguration von Raum ${room.code} geaendert: count=${data.count} parts=${JSON.stringify(data.parts)} -> ${room.questions.length} Fragen`);
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
        const userSocket = io.sockets.sockets.get(data.userIdToKick);
        if (userSocket) {
          userSocket.emit('you-were-kicked', {
            message: `Du wurdest vom Host (${room.users[socket.id]?.name || 'Host'}) aus dem Raum entfernt.`,
            roomCode: data.code
          });
          userSocket.leave(data.code);
          // Setze roomCode im Socket-Daten
          if (userSocket.data) userSocket.data.roomCode = null;
        }
        const kickedName = room.users[data.userIdToKick]?.name || room.users[data.userIdToKick]?.userName || 'Benutzer';
        delete room.users[data.userIdToKick];
        if (room.allAnswers && room.allAnswers[data.userIdToKick]) delete room.allAnswers[data.userIdToKick];
        console.log(`[DUO] ${kickedName} (${data.userIdToKick}) wurde von ${room.users[socket.id]?.name || 'Host'} aus Raum ${data.code} gekickt`);
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

    socket.on('leaveRoom',data=>{
     try{
      const code=(data && typeof data==='object' ? data.code : null)||socket.data.roomCode;
      if(code&&duoRooms[code]){
        delete duoRooms[code].users[socket.id];
        // FIX W11: Antworten mitloeschen. kickUser machte das korrekt,
        // leaveRoom und disconnect liessen sie liegen.
        if(duoRooms[code].allAnswers) delete duoRooms[code].allAnswers[socket.id];
        socket.leave(code);
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

server.listen(PORT,'0.0.0.0',async ()=>{
  // Zuerst der Browser, dann das Uebrige: Der Trainer soll aufgehen,
  // waehrend im Fenster noch die Tunnel-Zeilen durchlaufen.
  if(process.env.AFU_BROWSER === '1') browserOeffnen(`http://localhost:${PORT}`);

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
  console.log('============================================================');
  console.log('  SERVER V18 - Sicherheits-Fixes K1-K7 (17.08.2026)');
  console.log(`  http://localhost:${PORT}`);
  const lan = lokaleAdressen();
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