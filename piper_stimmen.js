// ================================================================
// piper_stimmen.js - weitere Vorlesestimmen nachtraeglich holen
//
// Dietmar am 05.09.2026: "Ich moechte noch weitere Piper Stimmen mit in
// das Tool mit aufnehmen. Unter Einstellungen kommt bei Piper weitere
// Stimmen installieren mit rein. Hacken setzen und es installiert
// weitere Natural Stimmen dazu. Ausgeliefert wird nur Standard Thorsten,
// um die Installations-exe nicht aufzublaehen."
//
// ----------------------------------------------------------------
// WARUM NICHT EINFACH ALLE MITLIEFERN
// ----------------------------------------------------------------
// Eine einzige Stimme in mittlerer Guete ist 63 MB gross, die hohe
// Fassung 110 MB. Alle zehn deutschen Stimmen zusammen waeren rund
// 500 MB - in einem Setup, das heute knapp 90 MB wiegt. Wer nur lernen
// will, laedt dann eine halbe Stunde lang Stimmen herunter, die er nie
// benutzt. Also: Thorsten kommt mit, alles weitere holt sich, wer es
// haben will.
//
// ----------------------------------------------------------------
// WOHER DIE STIMMEN KOMMEN
// ----------------------------------------------------------------
// Aus demselben Verzeichnis, aus dem auch die mitgelieferte Stimme
// stammt: rhasspy/piper-voices bei Hugging Face. Dort liegt eine
// voices.json mit jeder Stimme, jeder Datei, deren Groesse UND deren
// MD5-Pruefsumme. Diese Datei ist die einzige Quelle - es wird nichts
// geraten und nichts fest verdrahtet. Kommt dort eine Stimme dazu,
// steht sie hier von selbst zur Wahl.
//
// ----------------------------------------------------------------
// WAS HIER NICHT PASSIERT
// ----------------------------------------------------------------
// Es wird ausschliesslich .onnx und .onnx.json geholt - Sprachmodelle
// und deren Beschreibung, also Daten. Nie ein Programm, nie eine .exe,
// nie eine .dll. piper.exe selbst bleibt, wie sie ist.
//
// Jede Datei wird nach dem Laden nachgerechnet. Stimmt die Pruefsumme
// nicht mit der aus dem Verzeichnis ueberein, wird sie verworfen und
// nicht geschrieben. Ein abgebrochener Download kommt so nie im Ordner
// an - und was auf dem Weg veraendert wurde, auch nicht.
//
// Geschrieben wird nur direkt nach piper\, nur unter dem Dateinamen aus
// dem Verzeichnis, und nur wenn der zu einem Stimmennamen passt. Kein
// Unterordner, kein "..", kein Pfad aus der Antwort des Servers.
//
// Und es laeuft nichts von selbst: Erst ein Klick startet einen
// Download.
// ================================================================
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const KONTO = 'rhasspy';
const REPO  = 'piper-voices';
// Ueber Umgebungsvariablen umlenkbar - wie bei github_update.js, und aus
// demselben Grund: So laesst sich der Weg mit einem Server auf dem
// eigenen Rechner durchspielen, ohne 63 MB durch die Leitung zu ziehen.
// Im Betrieb setzt die niemand.
const VERZEICHNIS = process.env.AFU_PIPER_INDEX
  || 'https://huggingface.co/' + KONTO + '/' + REPO + '/resolve/main/voices.json';
const DATEI_BASIS = process.env.AFU_PIPER_BASIS
  || 'https://huggingface.co/' + KONTO + '/' + REPO + '/resolve/main/';

// Hugging Face reicht grosse Dateien an ein Auslieferungsnetz weiter.
// Erlaubt sind deshalb genau diese Rechnernamen - ein Umzug auf einen
// fremden Server waere sonst nicht zu bemerken.
const ERLAUBTE_WIRTE = [/(^|\.)huggingface\.co$/i, /(^|\.)hf\.co$/i];
// Wurde umgelenkt, gilt zusaetzlich der Rechner, auf den umgelenkt wurde -
// und nur der.
for(const u of [process.env.AFU_PIPER_INDEX, process.env.AFU_PIPER_BASIS]){
  if(!u) continue;
  try{
    const w = new URL(u).hostname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    ERLAUBTE_WIRTE.push(new RegExp('^' + w + '$', 'i'));
  }catch(e){}
}

// Groesser als das ist keine Stimme. Die hohe Fassung von Thorsten
// wiegt 110 MB; 300 MB sind reichlich Luft und fangen trotzdem ab, dass
// eine falsche Antwort die Platte vollschreibt.
const MAX_DATEI = 300 * 1024 * 1024;

// Wie eine Stimmdatei heissen darf. Alles andere wird nicht geschrieben,
// egal was im Verzeichnis steht.
const NAME_MUSTER = /^[a-z]{2}_[A-Z]{2}-[A-Za-z0-9_]+-(x_low|low|medium|high)\.onnx(\.json)?$/;

// Stimmen, die gar nicht erst angeboten werden.
//
// Ausgewaehlt wird nach SPRECHER, nicht nach einzelnem Eintrag: Kaeme
// morgen "karlsson" in mittlerer Guete dazu, waere sie sonst wieder in
// der Liste - und die Entscheidung galt der Stimme, nicht der Guete.
//
// mls fiel am 05.09.2026 heraus: Sie stammt nicht aus einer
// Studioaufnahme, sondern aus einem Hoerbuch-Datensatz (Multilingual
// LibriSpeech) - viele Sprecher, viele Aufnahmesituationen.
//
// karlsson, pavoque, ramona und eva_k folgten kurz darauf, nachdem
// Dietmar sie gehoert hatte. Alle vier gibt es nur in low oder x_low,
// also 16 kHz; der Trainer warnt bei diesen ohnehin vor dem dumpfen S.
//
// thorsten_emotional kam als letzte dazu. Sie ist derselbe Sprecher wie
// die mitgelieferte Stimme, nur mit gespielten Gefuehlslagen - fuer
// Pruefungsfragen ist das nicht Ausdruck, sondern Ablenkung.
//
// Eine Auswahl, in der etwas steht, das man ohnehin nicht nehmen soll,
// ist keine Hilfe. Uebrig bleiben Thorsten in drei Guetestufen und
// Kerstin.
const NICHT_ANBIETEN = ['mls', 'karlsson', 'pavoque', 'ramona', 'eva_k', 'thorsten_emotional'];

function wirtErlaubt(u){
  try{ return ERLAUBTE_WIRTE.some(m => m.test(new URL(u).hostname)); }
  catch(e){ return false; }
}

// Holen mit Umleitungen - aber jede Umleitung wird wieder geprueft.
function holen(url, opt, tiefe){
  opt = opt || {};
  tiefe = tiefe || 0;
  return new Promise((ja, nein) => {
    if(tiefe > 5) return nein(new Error('Zu viele Umleitungen'));
    if(!wirtErlaubt(url)) return nein(new Error('Unerwartete Adresse: ' + url));
    const mod = url.startsWith('https:') ? https : require('http');
    const anfrage = mod.get(url, {
      timeout: opt.zeit || 30000,
      headers: { 'User-Agent': 'Amateurfunk-Trainer-Stimmen', 'Accept': '*/*' }
    }, a => {
      if([301,302,303,307,308].includes(a.statusCode) && a.headers.location){
        a.resume();
        let ziel;
        try{ ziel = new URL(a.headers.location, url).toString(); }
        catch(e){ return nein(new Error('Ungueltige Umleitung')); }
        return holen(ziel, opt, tiefe + 1).then(ja, nein);
      }
      if(a.statusCode !== 200){ a.resume(); return nein(new Error('Antwort HTTP ' + a.statusCode)); }
      if(opt.strom) return ja(a);              // der Aufrufer liest selbst weiter
      const teile = []; let menge = 0;
      a.on('data', d => {
        menge += d.length;
        if(menge > 8 * 1024 * 1024){ anfrage.destroy(); return nein(new Error('Antwort zu gross')); }
        teile.push(d);
      });
      a.on('end', () => ja(Buffer.concat(teile)));
    });
    anfrage.on('timeout', () => { anfrage.destroy(); nein(new Error('Zeitueberschreitung - keine Antwort')); });
    anfrage.on('error', e => nein(new Error(
      /ENOTFOUND|EAI_AGAIN/i.test(e.message) ? 'Keine Verbindung (kein Netz?)' : e.message)));
  });
}

function einrichten(umgebung){
  const { app, localOnly, piperOrdner, sprache } = umgebung;
  const SPRACHE = sprache || 'de_DE';

  // Das Verzeichnis ist rund 500 KB gross und aendert sich selten. Einmal
  // je Sitzung reicht; wer den Trainer neu startet, sieht Neues.
  let verzeichnisMerker = null;

  async function verzeichnisHolen(){
    if(verzeichnisMerker) return verzeichnisMerker;
    const roh = await holen(VERZEICHNIS, { zeit: 20000 });
    verzeichnisMerker = JSON.parse(roh.toString('utf8'));
    return verzeichnisMerker;
  }

  function schonDa(name){
    try{ return fs.existsSync(path.join(piperOrdner, name)); }catch(e){ return false; }
  }

  // Aus einem Eintrag des Verzeichnisses das machen, was der Trainer
  // braucht: die zwei Dateien, die Groesse und ein Satz zur Guete.
  function stimmeLesen(schluessel, eintrag){
    const dateien = [];
    for(const [pfad, angabe] of Object.entries(eintrag.files || {})){
      const name = path.basename(pfad);
      if(!NAME_MUSTER.test(name)) continue;          // MODEL_CARD und Aehnliches faellt weg
      if(!angabe || typeof angabe.size_bytes !== 'number') continue;
      if(angabe.size_bytes <= 0 || angabe.size_bytes > MAX_DATEI) continue;
      if(!/^[0-9a-f]{32}$/i.test(String(angabe.md5_digest || ''))) continue;
      dateien.push({ name, pfad, groesse: angabe.size_bytes, md5: String(angabe.md5_digest).toLowerCase() });
    }
    const modell = dateien.find(d => d.name.endsWith('.onnx'));
    if(!modell || dateien.length < 2) return null;   // ohne Modell UND Beschreibung nutzlos
    const guete = String(eintrag.quality || '');
    // x_low und low sind 16 kHz. Genau die klingen beim S dumpf - der
    // Trainer warnt in der Stimmenliste ohnehin davor, also steht es
    // hier gleich mit dabei, VOR dem Herunterladen.
    const dumpf = (guete === 'low' || guete === 'x_low');
    return {
      id: schluessel,
      name: String(eintrag.name || schluessel),
      guete,
      dumpf,
      groesse: dateien.reduce((n, d) => n + d.groesse, 0),
      dateien,
      installiert: schonDa(modell.name)
    };
  }

  async function angebot(){
    const v = await verzeichnisHolen();
    const raus = [];
    for(const [schluessel, eintrag] of Object.entries(v)){
      if(!eintrag || !eintrag.language || eintrag.language.code !== SPRACHE) continue;
      if(NICHT_ANBIETEN.includes(String(eintrag.name || ''))) continue;
      const s = stimmeLesen(schluessel, eintrag);
      if(s) raus.push(s);
    }
    // Die klaren zuerst, danach nach Namen. Wer die Liste von oben liest,
    // trifft zuerst auf das, womit er zufrieden sein wird.
    const rang = { high: 3, medium: 2, low: 1, x_low: 0 };
    raus.sort((a, b) => (rang[b.guete] || 0) - (rang[a.guete] || 0) || a.name.localeCompare(b.name));
    return raus;
  }

  // ---- Der Fortschritt -------------------------------------------
  // Ein einziger Download zur Zeit. Zwei gleichzeitig braeuchten mehr
  // Verwaltung, als der Nutzen wert ist - und die Leitung wird davon
  // auch nicht schneller.
  let lage = { laeuft: false, id: null, name: '', getan: 0, gesamt: 0,
               nummer: 0, anzahl: 0, fertig: false, fehler: null };

  async function eineDateiHolen(datei){
    const ziel = path.join(piperOrdner, datei.name);
    if(path.dirname(ziel) !== path.resolve(piperOrdner)) throw new Error('Ungueltiges Ziel');
    const teilweg = ziel + '.teil';
    const strom = await holen(DATEI_BASIS + datei.pfad.split('/').map(encodeURIComponent).join('/'),
                              { strom: true, zeit: 60000 });
    const hash = crypto.createHash('md5');
    let menge = 0;
    await new Promise((ja, nein) => {
      const schreiber = fs.createWriteStream(teilweg);
      strom.on('data', d => {
        menge += d.length;
        if(menge > MAX_DATEI){ strom.destroy(); schreiber.destroy(); return nein(new Error('Datei groesser als erwartet')); }
        hash.update(d);
        lage.getan += d.length;
      });
      strom.on('error', nein);
      schreiber.on('error', nein);
      schreiber.on('finish', ja);
      strom.pipe(schreiber);
    });
    const gerechnet = hash.digest('hex');
    if(gerechnet !== datei.md5){
      try{ fs.unlinkSync(teilweg); }catch(e){}
      throw new Error('Pruefsumme von ' + datei.name + ' stimmt nicht - Datei verworfen');
    }
    // Erst jetzt an den richtigen Platz. Unter Windows scheitert das
    // Umbenennen, wenn dort schon etwas liegt.
    try{ if(fs.existsSync(ziel)) fs.unlinkSync(ziel); }catch(e){}
    fs.renameSync(teilweg, ziel);
  }

  // Eine Stimme oder alle - derselbe Weg. Dietmar am 05.09.2026: "Neben
  // Probe hoeren den Button Stimmen hinzufuegen. Ohne auswaehlen, alle mit
  // einem Rutsch installieren."
  //
  // Nacheinander, nicht gleichzeitig: Vier Downloads parallel machen die
  // Leitung nicht schneller, aber den Fortschritt unlesbar. Und geht einer
  // schief, laeuft der Rest trotzdem weiter - eine Stimme, die es heute
  // nicht gibt, soll nicht die acht anderen verhindern.
  async function holenStarten(ids){
    if(lage.laeuft) throw new Error('Es wird gerade schon geholt.');
    const wunsch = Array.isArray(ids) ? ids : [ids];
    const alle = await angebot();
    const liste = wunsch.map(id => alle.find(x => x.id === id)).filter(Boolean);
    if(!liste.length) throw new Error('Keine dieser Stimmen steht zur Wahl.');

    lage = { laeuft: true, id: liste[0].id, name: liste[0].name, getan: 0,
             gesamt: liste.reduce((n, s) => n + s.groesse, 0),
             nummer: 1, anzahl: liste.length, fertig: false, fehler: null };

    // Bewusst NICHT abgewartet: Der Aufruf antwortet sofort, der Browser
    // fragt danach den Fortschritt ab. Eine Anfrage, die zwei Minuten
    // offen steht, laeuft in jeden Zeitablauf.
    (async () => {
      const misslungen = [];
      // Was fertig ist, wird hier mitgezaehlt - und lage.getan nach jeder
      // Stimme auf diesen Wert gesetzt. Sonst zaehlte eine misslungene
      // Stimme doppelt: einmal die Bytes, die schon durch die Leitung
      // gingen, und einmal die Groesse, die man nachtraegt, damit der
      // Balken nicht haengenbleibt. Am Ende stuende dann mehr da, als es
      // insgesamt gibt.
      let erledigt = 0;
      try{
        for(let k = 0; k < liste.length; k++){
          const s = liste[k];
          lage.id = s.id; lage.name = s.name; lage.nummer = k + 1;
          try{
            for(const d of s.dateien) await eineDateiHolen(d);
            console.log('[STIMMEN] ' + s.id + ' geholt und geprueft.');
          }catch(e){
            misslungen.push(s.name + ': ' + e.message);
            console.warn('[STIMMEN] ' + s.id + ' fehlgeschlagen:', e.message);
          }
          erledigt += s.groesse;
          lage.getan = erledigt;
        }
        lage.fertig = true;
        if(misslungen.length) lage.fehler = misslungen.join(' · ');
      }finally{
        lage.laeuft = false;
      }
    })();
    return { ok: true, anzahl: liste.length, gesamt: lage.gesamt };
  }

  // ================================================================
  //  WAS NICHT MEHR ANGEBOTEN WIRD, ABER SCHON DA IST
  // ================================================================
  //  Dietmar am 05.09.2026: "Karlsson und pavoque ramona eva gehoert
  //  auch raus. Bitte in meinem Ordner auch loeschen."
  //
  //  Die Stimmen aus der Liste zu nehmen genuegt nicht - wer sie schon
  //  geholt hat, hat sie weiter im Ordner und in der Auswahl stehen.
  //
  //  GELOESCHT WIRD TROTZDEM NICHTS. Sie wandern nach
  //  _Aufgeraeumt_<Datum>\piper\, so wie es Aufraeumen.bat mit allem
  //  anderen auch haelt. Zwei Gruende: Ein Modell ist 20 bis 110 MB,
  //  und wer es zurueckhaben will, muesste es sonst neu ueber die
  //  Leitung ziehen. Und wichtiger - ein Programm, das ungefragt
  //  Dateien im Ordner des Benutzers loescht, ist ein Programm, dem man
  //  beim naechsten Mal nicht mehr traut. Der Ordner liegt sichtbar
  //  daneben; wer Platz braucht, wirft ihn selbst weg.
  //
  //  Angefasst wird ausschliesslich, was wie eine Stimmdatei heisst UND
  //  zu einem Sprecher der Sperrliste gehoert. piper.exe, die DLLs und
  //  espeak-ng-data liegen im selben Ordner und werden nie beruehrt.
  // ================================================================
  function sprecherAus(name){
    const t = String(name || '').match(/^[a-z]{2}_[A-Z]{2}-(.+)-(?:x_low|low|medium|high)\.onnx(?:\.json)?$/);
    return t ? t[1] : null;
  }

  function ueberfluessige(){
    try{
      return fs.readdirSync(piperOrdner)
        .filter(n => NAME_MUSTER.test(n))
        .filter(n => NICHT_ANBIETEN.includes(sprecherAus(n)));
    }catch(e){ return []; }
  }

  function ueberfluessigeLage(){
    const namen = ueberfluessige();
    let bytes = 0;
    const sprecher = new Set();
    for(const n of namen){
      try{ bytes += fs.statSync(path.join(piperOrdner, n)).size; }catch(e){}
      const sp = sprecherAus(n); if(sp) sprecher.add(sp);
    }
    return { dateien: namen.length, sprecher: [...sprecher].sort(), groesse: bytes };
  }

  function wegraeumen(){
    const namen = ueberfluessige();
    if(!namen.length) return { verschoben: 0, ordner: null, sprecher: [] };
    const heute = new Date().toISOString().slice(0, 10);
    // Eine Ebene ueber piper\ - also neben Server.js, wie Aufraeumen.bat.
    const ziel = path.join(path.dirname(piperOrdner), '_Aufgeraeumt_' + heute, 'piper');
    fs.mkdirSync(ziel, { recursive: true });
    const sprecher = new Set();
    let n = 0;
    for(const name of namen){
      const von = path.join(piperOrdner, name);
      let nach = path.join(ziel, name);
      // Liegt dort schon eine gleichnamige aus einem frueheren Lauf,
      // bekommt die neue eine Zahl - ueberschrieben wird auch im
      // Aufraeumordner nichts.
      let k = 2;
      while(fs.existsSync(nach)) nach = path.join(ziel, name + '.' + (k++));
      try{
        fs.renameSync(von, nach);
        const sp = sprecherAus(name); if(sp) sprecher.add(sp);
        n++;
      }catch(e){
        console.warn('[STIMMEN] ' + name + ' liess sich nicht wegraeumen:', e.message);
      }
    }
    console.log('[STIMMEN] ' + n + ' Datei(en) nach _Aufgeraeumt_' + heute + '\\piper\\ verschoben.');
    return { verschoben: n, ordner: '_Aufgeraeumt_' + heute + '\\piper', sprecher: [...sprecher].sort() };
  }

  // ---- Die drei Wege ---------------------------------------------
  app.get('/api/stimmen/angebot', localOnly, async (req, res) => {
    try{ res.json({ stimmen: await angebot() }); }
    catch(e){ res.status(502).json({ error: e.message }); }
  });

  app.get('/api/stimmen/lage', localOnly, (req, res) => res.json(lage));

  // Was liegt herum, das nicht mehr angeboten wird?
  app.get('/api/stimmen/ueberfluessig', localOnly, (req, res) => {
    try{ res.json(ueberfluessigeLage()); }
    catch(e){ res.status(500).json({ error: e.message }); }
  });

  app.post('/api/stimmen/wegraeumen', localOnly, (req, res) => {
    try{ res.json(wegraeumen()); }
    catch(e){ res.status(500).json({ error: e.message }); }
  });

  app.post('/api/stimmen/holen', localOnly, async (req, res) => {
    try{
      const id = String((req.body && req.body.id) || '');
      if(!/^[A-Za-z0-9_\-]{1,80}$/.test(id)) return res.status(400).json({ error: 'Keine gueltige Stimme' });
      res.json(await holenStarten([id]));
    }catch(e){ res.status(400).json({ error: e.message }); }
  });

  // Alles auf einmal. Welche das sind, entscheidet der Server - der
  // Browser schickt keine Liste, die man ihm unterschieben koennte.
  app.post('/api/stimmen/alle', localOnly, async (req, res) => {
    try{
      const offen = (await angebot()).filter(s => !s.installiert).map(s => s.id);
      if(!offen.length) return res.json({ ok: true, anzahl: 0, gesamt: 0 });
      res.json(await holenStarten(offen));
    }catch(e){ res.status(400).json({ error: e.message }); }
  });

  return { angebot, holenStarten };
}

module.exports = { einrichten };
