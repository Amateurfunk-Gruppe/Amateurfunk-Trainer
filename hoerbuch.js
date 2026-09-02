// ================================================================
// hoerbuch.js - Fragen und Antworten als MP3 fuers Autoradio.
//
// Der Trainer kann Fragen schon vorlesen (/api/tts). Das hier ist etwas
// anderes: ein Stapelauftrag, der aus vielen Fragen fertige MP3-Dateien
// baut, die man auf einen USB-Stick kopiert und im Auto hoert.
//
// Aufbau je Frage:   [Frage]  -  3 s Stille  -  [richtige Antwort]
//
// Die Stille ist der Kern der Sache: In der Zeit antwortet man selbst.
// Und es wird ausschliesslich die RICHTIGE Antwort gesprochen - wer die
// drei falschen mithoert, praegt sie sich mit ein. Beim Lesen sieht man,
// welche angekreuzt gehoert; beim Hoeren am Steuer sieht man nichts.
//
// WARUM DER SERVER DAS MACHT und nicht der Browser:
// Piper (die Sprachausgabe) ist ein Programm auf dem Rechner. Fuer 571
// Fragen laeuft es ueber 1000 Mal. Das dauert je nach Rechner eine halbe
// bis eine ganze Stunde - der Auftrag muss also weiterlaufen, auch wenn
// der Browser zugeklappt wird. Der Fortschritt wird abgefragt, nicht
// gestreamt (POLLING), damit ein Neuladen der Seite nichts abbricht.
//
// WARUM MP3 UND NICHT WAV: Autoradios lesen MP3 vom USB-Stick, WAV oft
// nicht - und 2,5 Stunden WAV waeren rund 380 MB statt 70.
// ================================================================
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { Mp3Encoder } = require('./lame');

// ---- Klangformat der Ausgabe -----------------------------------
// 44100 Hz, obwohl Piper nur 22050 Hz liefert und das Hochrechnen keine
// einzige Frequenz hinzufuegt. Grund: aeltere Autoradios spielen nur
// MPEG-1 Layer III ab (32/44,1/48 kHz). Eine 22050-Hz-Datei ist MPEG-2
// Layer III und bleibt bei solchen Geraeten stumm - ohne Fehlermeldung,
// man sucht sich tot. Die paar MB Aufschlag sind das wert.
const MP3_RATE   = 44100;
const MP3_KBPS   = 64;      // Mono-Sprache; darueber hoert man nichts mehr
const PAUSE_MAX  = 15;      // Sekunden Denkpause, Obergrenze
const LUECKE_NACH_ANTWORT = 1.2;  // Sekunden bis zur naechsten Frage

// Bewusst kuerzer als die Denkpause: die lange Stille heisst "jetzt du",
// die kurze heisst "neue Frage". Andersherum wartet man auf das falsche.

let auftrag = null;   // genau einer zur Zeit, siehe hoerbuchStarten()

// ================================================================
// WAV lesen. Piper schreibt eine schlichte RIFF/WAVE-Datei, aber die
// Abtastrate haengt an der gewaehlten Stimme (16000 bei "low", 22050 bei
// "medium"). Sie zu raten ginge eine Weile gut und klaenge dann eines
// Tages nach Micky Maus - also wird der Kopf gelesen.
// ================================================================
function wavLesen(buf){
  if(buf.length < 44 || buf.toString('ascii',0,4) !== 'RIFF' || buf.toString('ascii',8,12) !== 'WAVE'){
    throw new Error('Keine WAV-Datei');
  }
  let pos = 12, rate = 0, kanaele = 1, bits = 16, daten = null;
  while(pos + 8 <= buf.length){
    const kennung = buf.toString('ascii', pos, pos+4);
    const laenge  = buf.readUInt32LE(pos+4);
    const inhalt  = pos + 8;
    if(kennung === 'fmt '){
      kanaele = buf.readUInt16LE(inhalt+2);
      rate    = buf.readUInt32LE(inhalt+4);
      bits    = buf.readUInt16LE(inhalt+14);
    } else if(kennung === 'data'){
      // Manche Schreiber tragen die Laenge falsch ein; bis zum Dateiende
      // zu lesen ist hier sicherer als der Angabe zu glauben.
      const ende = Math.min(buf.length, inhalt + (laenge || (buf.length - inhalt)));
      daten = buf.subarray(inhalt, ende);
      break;
    }
    pos = inhalt + laenge + (laenge % 2);   // Bloecke sind gerade ausgerichtet
  }
  if(!daten || !rate) throw new Error('WAV ohne Daten- oder Formatblock');
  if(bits !== 16) throw new Error('Nur 16-Bit-WAV wird unterstuetzt, hier: '+bits);
  const anzahl = Math.floor(daten.length / 2 / kanaele);
  const proben = new Int16Array(anzahl);
  for(let i=0;i<anzahl;i++){
    if(kanaele === 1){ proben[i] = daten.readInt16LE(i*2); }
    else {
      let summe = 0;
      for(let k=0;k<kanaele;k++) summe += daten.readInt16LE((i*kanaele+k)*2);
      proben[i] = Math.round(summe / kanaele);
    }
  }
  return { proben, rate };
}

// Lineare Interpolation. Fuer 22050 -> 44100 ist das exakt der Mittelwert
// zweier Nachbarn und damit voellig unauffaellig; nur bei krummen
// Verhaeltnissen waere ein richtiger Filter besser.
function umrechnen(proben, vonRate, nachRate){
  if(vonRate === nachRate) return proben;
  const faktor = nachRate / vonRate;
  const neu = new Int16Array(Math.floor(proben.length * faktor));
  for(let i=0;i<neu.length;i++){
    const q = i / faktor;
    const a = Math.floor(q);
    const b = Math.min(a+1, proben.length-1);
    const t = q - a;
    neu[i] = Math.round(proben[a]*(1-t) + proben[b]*t);
  }
  return neu;
}

function stille(sekunden){ return new Int16Array(Math.round(MP3_RATE * sekunden)); }

// ================================================================
// ID3v2.3 von Hand. Nur die vier Felder, die ein Autoradio anzeigt.
//
// Wichtig fuers Display: TIT2 (Titel) ist das Einzige, was waehrend des
// Abspielens umlaeuft. Bei "eine Datei je Frage" steht deshalb der
// Fragetext im Titel - dann wandert er beim Weiterschalten von selbst
// ueber die Anzeige.
// ================================================================
function id3(felder){
  const rahmen = [];
  for(const [kennung, wert] of Object.entries(felder)){
    if(!wert) continue;
    // Kodierung 1 = UTF-16 mit Byte-Reihenfolge-Marke. UTF-8 kennt ID3v2.3
    // offiziell nicht, und aeltere Radios zeigen dann Kraut und Rueben
    // statt Umlauten - und Umlaute hat hier fast jeder zweite Satz.
    const text = Buffer.concat([Buffer.from([0x01, 0xFF, 0xFE]), Buffer.from(String(wert), 'utf16le'), Buffer.from([0,0])]);
    const kopf = Buffer.alloc(10);
    kopf.write(kennung, 0, 'ascii');
    kopf.writeUInt32BE(text.length, 4);
    rahmen.push(kopf, text);
  }
  const inhalt = Buffer.concat(rahmen);
  // Nach dem Inhalt etwas Luft lassen. Wer spaeter ein Feld ergaenzt,
  // muss dann nicht die ganze Datei neu schreiben.
  const polster = Buffer.alloc(256);
  const gesamt = inhalt.length + polster.length;
  const kopf = Buffer.alloc(10);
  kopf.write('ID3', 0, 'ascii');
  kopf[3] = 3; kopf[4] = 0; kopf[5] = 0;
  // Groesse steht als "synchsafe integer": sieben Nutzbits je Byte, damit
  // im Kopf nie zufaellig ein Muster steht, das wie ein MP3-Rahmenanfang
  // aussieht. Schreibt man es normal, springen manche Geraete mitten
  // in den Tag und rauschen.
  kopf[6] = (gesamt >>> 21) & 0x7F;
  kopf[7] = (gesamt >>> 14) & 0x7F;
  kopf[8] = (gesamt >>>  7) & 0x7F;
  kopf[9] =  gesamt         & 0x7F;
  return Buffer.concat([kopf, inhalt, polster]);
}

// ================================================================
// Kodierer, der haeppchenweise gefuettert wird.
//
// WARUM NICHT ERST ALLES SAMMELN: Eine Lektion mit 25 Fragen sind rund
// 8 Minuten Ton = 42 MB im Arbeitsspeicher - noch harmlos. Wer aber
// "Alle Fragen" in EINE Datei legt, kaeme auf 571 Fragen, zweieinhalb
// Stunden, 800 MB. Node haette das mit einem Speicherfehler quittiert,
// nach einer halben Stunde Rechenzeit. Als MP3 sind dieselben zweieinhalb
// Stunden 70 MB - also wird sofort kodiert und nur das Ergebnis behalten.
// ================================================================
class Mp3Strom {
  constructor(){
    this.enc = new Mp3Encoder(1, MP3_RATE, MP3_KBPS);
    this.stuecke = [];
    this.proben = 0;
    this._rest = null;      // angefangener 1152er-Block
  }
  schreibe(pcm){
    const BLOCK = 1152;     // ein MP3-Rahmen; alles andere kostet nur Rechenzeit
    this.proben += pcm.length;
    let quelle = pcm;
    if(this._rest){
      const zus = new Int16Array(this._rest.length + pcm.length);
      zus.set(this._rest, 0); zus.set(pcm, this._rest.length);
      quelle = zus; this._rest = null;
    }
    let i = 0;
    for(; i + BLOCK <= quelle.length; i += BLOCK){
      const b = this.enc.encodeBuffer(quelle.subarray(i, i+BLOCK));
      if(b.length) this.stuecke.push(Buffer.from(b));
    }
    if(i < quelle.length) this._rest = quelle.slice(i);
  }
  fertig(){
    if(this._rest && this._rest.length){
      const b = this.enc.encodeBuffer(this._rest);
      if(b.length) this.stuecke.push(Buffer.from(b));
      this._rest = null;
    }
    const rest = this.enc.flush();
    if(rest.length) this.stuecke.push(Buffer.from(rest));
    const daten = Buffer.concat(this.stuecke);
    this.stuecke = [];
    return daten;
  }
  get sekunden(){ return this.proben / MP3_RATE; }
}

function mp3Kodieren(proben){
  const s = new Mp3Strom();
  s.schreibe(proben);
  return s.fertig();
}

// ---- Dateinamen, die Windows und Autoradios beide vertragen ----
// Autoradios sortieren fast immer nach Dateiname, nicht nach Titelfeld.
// Ohne fuehrende Null kaeme Lektion 10 vor Lektion 2.
// Umlaute werden ersetzt, nicht weggeworfen: manche Autoradios zeigen im
// Dateinamen nur ASCII, und "Lektion 3 Loeten" liest sich, "Lektion 3 L?ten"
// nicht.
// Was Windows in Dateinamen verbietet, dazu Steuerzeichen. Der Bindestrich
// bleibt ausdruecklich erlaubt - "01 Lektion 1 - Grundlagen.mp3" liest sich
// besser als "01 Lektion 1 Grundlagen.mp3".
const VERBOTEN = /[<>:"/\\|?*\u0000-\u001F]/g;
function sauberName(s){
  return String(s)
    .replace(/[äÄöÖüÜß]/g, m => ({'ä':'ae','Ä':'Ae','ö':'oe','Ö':'Oe','ü':'ue','Ü':'Ue','ß':'ss'}[m]))
    // Typografische Zeichen auf ihre Schreibmaschinen-Entsprechung bringen.
    // Die Lektionstitel tragen einen Gedankenstrich ("Lektion 01 –
    // Betriebstechnik"), und ein Autoradio mit reiner ASCII-Anzeige macht
    // daraus ein Kaestchen mitten im Namen.
    .replace(/[–—]/g, '-')
    .replace(/[„“”‚‘’]/g, '')
    // Alles Uebrige jenseits von ASCII faellt weg. Im Dateinamen ist das zu
    // verschmerzen - der vollstaendige Text steht im Titelfeld, und dort
    // bleibt jedes Zeichen erhalten.
    .replace(/[^ -~]/g, '')
    .replace(VERBOTEN, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)
    .replace(/[. ]+$/, '');     // Windows mag keinen Punkt am Ende
}
function nummer(n, breite){ return String(n).padStart(breite, '0'); }

// ================================================================
// Ein Satz durch Piper. Bewusst EIN Prozess nach dem anderen: Der
// Auftrag laeuft im Hintergrund, waehrend jemand weiterlernt. Nimmt er
// sich alle Kerne, ruckelt das Vorlesen im Trainer.
// ================================================================
function sprechen(text, ctx){
  return new Promise((fertig, schiefgegangen) => {
    const piper = ctx.findPiper();
    const tmp = path.join(os.tmpdir(), 'hoerbuch_' + process.pid + '_' + (sprechen._n = (sprechen._n||0)+1) + '.wav');
    const opts = { cwd: ctx.PIPER_DIR, env: {...process.env, PYTHONIOENCODING:'utf-8', PYTHONUTF8:'1'} };
    let proc, fehlertext = '';
    try{
      proc = piper.type === 'binary'
        ? spawn(piper.path, ['--model', ctx.stimme.fullPath, '--output_file', tmp], opts)
        : spawn('python', ['-m','piper','--model', ctx.stimme.fullPath, '--output_file', tmp], opts);
    }catch(e){ return schiefgegangen(new Error('Piper nicht startbar: '+e.message)); }

    auftrag && (auftrag._proc = proc);
    proc.stderr.on('data', d => { const s = d.toString(); if(!s.includes('Missing phoneme')) fehlertext += s; });
    proc.stdin.on('error', e => schiefgegangen(new Error('Piper stdin: '+(e.code||e.message))));
    proc.on('error', e => schiefgegangen(e));
    proc.on('exit', code => {
      auftrag && (auftrag._proc = null);
      if(code === 0 && fs.existsSync(tmp)){
        try{
          const wav = wavLesen(fs.readFileSync(tmp));
          fs.unlinkSync(tmp);
          fertig(umrechnen(wav.proben, wav.rate, MP3_RATE));
        }catch(e){ schiefgegangen(e); }
      } else {
        try{ if(fs.existsSync(tmp)) fs.unlinkSync(tmp); }catch(e){ /* Rest im Temp-Ordner, unkritisch */ }
        schiefgegangen(new Error('Piper Exitcode '+code+(fehlertext ? ': '+fehlertext.slice(0,200) : '')));
      }
    });
    try{
      proc.stdin.setDefaultEncoding('utf-8');
      proc.stdin.write(ctx.expandTTS(text), 'utf-8');
      proc.stdin.end();
    }catch(e){ schiefgegangen(e); }
  });
}

// Abbrechen heisst: den laufenden Piper abschiessen. Der meldet dann
// "Exitcode null" - kein Fehler, sondern genau das Gewuenschte. Ohne
// diese Unterscheidung endete jeder Abbruch als roter Fehler im Trainer,
// und das bereits Gesprochene wurde weggeworfen.
async function sprich(text, ctx, a){
  try{
    return await sprechen(text, ctx);
  }catch(e){
    if(a.abbruch) return new Int16Array(0);
    throw e;
  }
}

// ---- Der eigentliche Durchlauf ---------------------------------
async function lauf(ctx){
  const a = auftrag;
  for(let gi=0; gi<a.gruppen.length; gi++){
    if(a.abbruch) break;
    const g = a.gruppen[gi];
    // Die Nummer im Dateinamen kommt vom Browser, wenn er eine mitschickt
    // (die Lektionsnummer). Sonst zaehlt der Auftrag durch. Wichtig, weil
    // man eine einzelne Lektion nachtraeglich erzeugen kann: Ohne die
    // echte Nummer hiesse jede Nachzuegler-Datei "01" und stuende am
    // Radio vor allen anderen.
    const ordnerName = nummer(g.nr || (gi+1), 2) + ' ' + sauberName(g.name);

    if(a.jeFrage){
      // Eine Datei je Frage: der Fragetext landet im Titelfeld und damit
      // im Display des Radios.
      const ziel = path.join(a.ordner, ordnerName);
      fs.mkdirSync(ziel, {recursive:true});
      for(let i=0;i<g.fragen.length;i++){
        if(a.abbruch) break;
        const f = g.fragen[i];
        const datei = path.join(ziel, nummer(i+1,3) + ' ' + sauberName(f.id + ' ' + f.text) + '.mp3');
        if(!a.neu && fs.existsSync(datei)){ a.fertig++; continue; }
        a.aktuell = g.name + ' - Frage ' + (i+1) + ' von ' + g.fragen.length;
        // Erst beide Saetze sprechen, dann schreiben. Sonst laege nach
        // einem Abbruch eine Datei da, die die Frage stellt und die
        // Antwort schuldig bleibt.
        const frageTon = await sprich(f.text, ctx, a);
        const antwortTon = await sprich(f.antwort, ctx, a);
        if(a.abbruch) break;
        const strom = new Mp3Strom();
        strom.schreibe(frageTon);
        strom.schreibe(stille(a.pause));
        strom.schreibe(antwortTon);
        strom.schreibe(stille(0.4));
        const sek = strom.sekunden;
        const tag = id3({ TIT2: f.text, TPE1: 'Klasse-N-Trainer', TALB: g.name, TRCK: String(i+1), TCON: 'Speech' });
        schreiben(datei, Buffer.concat([tag, strom.fertig()]), a);
        a.fertig++;
        a.sekunden += sek;
      }
    } else {
      // Eine Datei je Lektion: am Radio schaltet die Titeltaste zur
      // naechsten Lektion weiter.
      const datei = path.join(a.ordner, ordnerName + '.mp3');
      if(!a.neu && fs.existsSync(datei)){ a.fertig += g.fragen.length; continue; }
      const strom = new Mp3Strom();
      for(let i=0;i<g.fragen.length;i++){
        if(a.abbruch) break;
        const f = g.fragen[i];
        a.aktuell = g.name + ' - Frage ' + (i+1) + ' von ' + g.fragen.length;
        const frageTon = await sprich(f.text, ctx, a);
        const antwortTon = await sprich(f.antwort, ctx, a);
        if(a.abbruch) break;
        strom.schreibe(frageTon);
        strom.schreibe(stille(a.pause));
        strom.schreibe(antwortTon);
        strom.schreibe(stille(LUECKE_NACH_ANTWORT));
        a.fertig++;
      }
      // Auch nach einem Abbruch fertig schreiben: eine halbe Lektion auf
      // dem Stick ist mehr wert als eine halbe Stunde Rechnen fuer nichts.
      // Nur wenn gar nichts gesprochen wurde, entsteht keine leere Datei.
      const sek = strom.sekunden;
      if(sek > 0){
        const tag = id3({ TIT2: g.name, TPE1: 'Klasse-N-Trainer', TALB: a.albumName, TRCK: String(gi+1), TCON: 'Speech' });
        schreiben(datei, Buffer.concat([tag, strom.fertig()]), a);
        a.sekunden += sek;
      }
      if(a.abbruch) break;
    }
  }
}

function schreiben(datei, buf, a){
  // Erst unter Zwischennamen, dann umbenennen. Bricht der Rechner mitten
  // im Schreiben ab, liegt keine halbe MP3 im Ordner, die beim naechsten
  // Lauf als "schon fertig" uebersprungen wuerde.
  const tmp = datei + '.teil';
  fs.writeFileSync(tmp, buf);
  try{ if(fs.existsSync(datei)) fs.unlinkSync(datei); }catch(e){ /* Windows */ }
  fs.renameSync(tmp, datei);
  a.dateien.push({ name: path.relative(a.ordner, datei).replace(/\\/g,'/'), bytes: buf.length });
}

// ================================================================
// Einhaengen in den Server
// ================================================================
function einrichten({ app, localOnly, projektOrdner, PIPER_DIR, findPiper, listVoices, expandTTS, ladeFragen }){
  const HOERBUCH_DIR = path.join(projektOrdner, 'Hoerbuch');

  function antwortText(frage){
    const richtig = (frage.options||[]).find(o => o && o.correct);
    if(!richtig) return null;
    return String(richtig.text||'').trim() || null;
  }

  app.get('/api/hoerbuch/stand', localOnly, (req,res) => {
    if(!auftrag) return res.json({ laeuft:false, ordner: HOERBUCH_DIR });
    res.json({
      laeuft: auftrag.laeuft,
      abbruch: auftrag.abbruch,
      gesamt: auftrag.gesamt,
      fertig: auftrag.fertig,
      aktuell: auftrag.aktuell,
      dateien: auftrag.dateien,
      minuten: Math.round(auftrag.sekunden/60),
      fehler: auftrag.fehler,
      ordner: auftrag.ordner,
      seit: auftrag.start
    });
  });

  // Den Ordner im Explorer zeigen. localOnly ist hier keine Formsache:
  // Ohne das koennte ein Gast von aussen Fenster auf dem fremden Rechner
  // aufgehen lassen.
  app.post('/api/hoerbuch/ordner', localOnly, (req,res) => {
    const ziel = (auftrag && auftrag.ordner) || HOERBUCH_DIR;
    try{
      fs.mkdirSync(ziel, {recursive:true});
      if(process.platform === 'win32')      spawn('explorer', [ziel], {detached:true, stdio:'ignore'}).unref();
      else if(process.platform === 'darwin') spawn('open', [ziel], {detached:true, stdio:'ignore'}).unref();
      else                                   spawn('xdg-open', [ziel], {detached:true, stdio:'ignore'}).unref();
      res.json({ok:true, ordner: ziel});
    }catch(e){
      // Kein Grund fuer eine Fehlermeldung im Trainer - der Pfad steht
      // ohnehin daneben und laesst sich von Hand oeffnen.
      res.json({ok:false, ordner: ziel, hinweis: e.message});
    }
  });

  app.post('/api/hoerbuch/abbrechen', localOnly, (req,res) => {
    if(!auftrag || !auftrag.laeuft) return res.json({ok:true, hinweis:'Es lief nichts.'});
    auftrag.abbruch = true;
    // Den laufenden Piper mitnehmen, sonst wartet der Abbruch bis zum
    // Ende des gerade gesprochenen Satzes.
    try{ if(auftrag._proc) auftrag._proc.kill(); }catch(e){ console.debug('[HOERBUCH] kill:', e.code||e.message); }
    res.json({ok:true});
  });

  app.post('/api/hoerbuch/start', localOnly, (req,res) => {
    if(auftrag && auftrag.laeuft) return res.status(409).json({error:'Es läuft bereits ein Hörbuch-Auftrag.'});

    const gruppenEin = Array.isArray(req.body.gruppen) ? req.body.gruppen : [];
    if(!gruppenEin.length) return res.status(400).json({error:'Keine Fragen ausgewählt.'});

    const pause = Math.min(PAUSE_MAX, Math.max(0, Number(req.body.pause) || 0));
    const jeFrage = !!req.body.jeFrage;
    const neu = !!req.body.neu;

    const alle = ladeFragen() || [];
    const nachId = new Map(alle.map(f => [f.id, f]));

    // Fragen ohne Textantwort (die mit Schaltbild-Antworten) fliegen hier
    // raus. Sie vorzulesen ergaebe "Welches Symbol zeigt ..." - Stille -
    // "Bild 2", und das lernt niemand am Steuer.
    let ohneAntwort = 0, unbekannt = 0;
    const gruppen = [];
    for(const g of gruppenEin){
      const fragen = [];
      for(const id of (g.ids||[])){
        const f = nachId.get(id);
        if(!f){ unbekannt++; continue; }
        const text = String(f.text||'').trim();
        const antwort = antwortText(f);
        if(!text || !antwort){ ohneAntwort++; continue; }
        fragen.push({ id: f.id, text, antwort });
      }
      const nr = Math.min(99, Math.max(0, parseInt(g.nr, 10) || 0));
      if(fragen.length) gruppen.push({ name: String(g.name||'Ohne Titel'), nr, fragen });
    }
    if(!gruppen.length) return res.status(400).json({error:'Keine vorlesbaren Fragen dabei (alle ohne Text-Antwort).'});

    const stimmen = listVoices();
    if(!stimmen.length) return res.status(500).json({error:'Keine Sprachausgabe installiert (Ordner piper/ ist leer).'});
    const stimme = stimmen.find(v => v.file === req.body.stimme) || stimmen[0];

    const gesamt = gruppen.reduce((s,g) => s + g.fragen.length, 0);
    const albumName = String(req.body.album || 'Klasse N').slice(0,60);
    const ordner = path.join(HOERBUCH_DIR, sauberName(albumName));
    try{ fs.mkdirSync(ordner, {recursive:true}); }
    catch(e){ return res.status(500).json({error:'Ordner nicht anlegbar: '+e.message}); }

    auftrag = {
      laeuft: true, abbruch: false, gruppen, pause, jeFrage, neu,
      gesamt, fertig: 0, aktuell: 'Vorbereitung', dateien: [], sekunden: 0,
      fehler: null, ordner, albumName, start: new Date().toISOString(), _proc: null
    };
    console.log(`[HOERBUCH] Start: ${gesamt} Fragen, ${gruppen.length} Gruppen, Pause ${pause}s, Stimme ${stimme.file}`);

    // Antwort sofort - der Auftrag laeuft danach weiter. Der Browser
    // fragt den Fortschritt ab.
    res.json({ ok:true, gesamt, gruppen: gruppen.length, ordner, uebersprungen: {ohneAntwort, unbekannt}, stimme: stimme.file });

    lauf({ PIPER_DIR, findPiper, expandTTS, stimme })
      .then(() => {
        auftrag.laeuft = false;
        auftrag.aktuell = auftrag.abbruch ? 'Abgebrochen' : 'Fertig';
        console.log(`[HOERBUCH] ${auftrag.abbruch?'Abgebrochen':'Fertig'}: ${auftrag.dateien.length} Dateien, ${Math.round(auftrag.sekunden/60)} Minuten`);
      })
      .catch(e => {
        auftrag.laeuft = false;
        auftrag.fehler = e.message;
        auftrag.aktuell = 'Fehler';
        console.error('[HOERBUCH] Abgebrochen mit Fehler:', e.message);
      });
  });

  console.log('[HOERBUCH] bereit, Ausgabeordner:', HOERBUCH_DIR);
  // laeuftGerade() sagt dem Server, ob ein MP3-Auftrag im Gange ist.
  // Er beendet sich seit dem 01.09.2026 selbst, wenn niemand mehr
  // hinsieht - mitten in einem Hoerbuch waere das aergerlich: eine
  // halbe Stunde Rechenzeit fuer nichts.
  return { HOERBUCH_DIR, laeuftGerade: () => !!(auftrag && auftrag.laeuft) };
}

module.exports = { einrichten, _intern: { wavLesen, umrechnen, id3, sauberName, mp3Kodieren, Mp3Strom, stille, MP3_RATE } };
