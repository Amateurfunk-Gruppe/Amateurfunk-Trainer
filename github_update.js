// ================================================================
// github_update.js - Neuerungen von GitHub holen.
//
// WOZU DAS NEBEN DEM VORHANDENEN ABGLEICH:
// Der Abgleich mit dem Gastgeber fragt einen laufenden Trainer unter einer
// Tunnel-Adresse. Die aendert sich bei jedem Neustart des Tunnels - eine
// gemerkte Adresse ist frueher oder spaeter tot, und dann passiert
// stillschweigend nichts mehr. Genau das ist Dietmars Mitlernendem
// passiert. GitHub hat eine Adresse, die sich nie aendert.
//
// ----------------------------------------------------------------
// DER WICHTIGSTE TEIL: NICHTS ZURUECKDREHEN
// ----------------------------------------------------------------
// Dietmar bekommt neue Dateien direkt in seinen Ordner geschrieben - oft
// Stunden bevor sie bei GitHub liegen. Ein Updater, der nur "der Inhalt
// ist anders, also hole ich" denkt, wuerde ihm genau diese frische Arbeit
// durch die aeltere Fassung von GitHub ersetzen. Ein Hash sagt naemlich,
// DASS zwei Dateien verschieden sind - nicht, welche die neuere ist.
//
// Deshalb merkt sich github_stand.json, welchen Fingerabdruck jede Datei
// hatte, als sie zuletzt mit GitHub gleich war. Daraus wird ein Vergleich
// mit drei statt zwei Werten:
//
//   fern == hier                    -> gleich, nichts zu tun
//   fern != hier, hier == gemerkt   -> DORT hat sich etwas getan  -> Update
//   fern != hier, hier != gemerkt   -> HIER hat sich etwas getan  -> Finger weg
//
// Der dritte Fall ist Dietmars Fall. Solche Dateien werden angezeigt, aber
// nicht angeboten und niemals angefasst.
//
// Der Merkposten entsteht an zwei Stellen: nach einem erfolgreichen
// Hochladen (Hochladen.bat) und nach einem erfolgreichen Update. Beides
// sind Momente, in denen hier und dort nachweislich dasselbe steht.
//
// ----------------------------------------------------------------
// WEITERE GRENZEN, BEWUSST GESETZT
// ----------------------------------------------------------------
//   - Geholt wird nur auf ausdruecklichen Klick. Der Start meldet
//     hoechstens, DASS es etwas gibt.
//   - Programmdateien (Server.js, hoerbuch.js, lame.js) laufen mit vollen
//     Rechten. Sie brauchen eine zweite, eigene Bestaetigung.
//   - Jede geholte Datei wird nachgerechnet, bevor sie geschrieben wird.
//     Stimmt der Fingerabdruck nicht mit dem, was GitHub angekuendigt
//     hat, wird sie verworfen. Ein abgebrochener Download kommt so nie
//     im Ordner an.
//   - Geholt wird von einem festen Commit, nicht von "main". Sonst koennte
//     zwischen Pruefen und Holen ein neuer Commit dazwischenkommen und man
//     bekaeme eine Mischung aus zwei Staenden.
// ================================================================
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const KONTO = 'Amateurfunk-Gruppe';
const REPO  = 'Amateurfunk-Trainer';
const ZWEIG = 'main';
const STAND_DATEI = 'github_stand.json';

// Die beiden Adressen stehen hier als Variable, damit sich beim Testen ein
// nachgebautes GitHub davorschalten laesst. Im Betrieb bleiben sie, wie sie
// sind - AFU_GITHUB_API zu setzen ist nichts, was man versehentlich tut.
const API = process.env.AFU_GITHUB_API || 'https://api.github.com';
const RAW = process.env.AFU_GITHUB_RAW || 'https://raw.githubusercontent.com';

// Git rechnet den Fingerabdruck einer Datei nicht ueber den blossen Inhalt,
// sondern ueber "blob <Laenge>\0<Inhalt>". Wer das weglaesst, bekommt eine
// Zahl, die zu nichts passt, was GitHub liefert.
function blobSha(daten) {
  const kopf = Buffer.from('blob ' + daten.length + '\0', 'utf8');
  return crypto.createHash('sha1').update(Buffer.concat([kopf, daten])).digest('hex');
}

function holen(url, opt) {
  opt = opt || {};
  return new Promise((ja, nein) => {
    const mod = url.startsWith('https:') ? https : require('http');
    const anfrage = mod.get(url, {
      timeout: opt.zeit || 15000,
      headers: Object.assign({
        // GitHub weist Anfragen ohne User-Agent rundheraus ab.
        'User-Agent': 'Amateurfunk-Trainer-Updater',
        'Accept': opt.roh ? '*/*' : 'application/vnd.github+json',
      }, opt.kopf || {}),
    }, a => {
      if (a.statusCode === 403 || a.statusCode === 429) {
        a.resume();
        return nein(new Error('GitHub bremst gerade (zu viele Anfragen). Spaeter nochmal.'));
      }
      if (a.statusCode === 404) { a.resume(); return nein(new Error('Nicht gefunden: ' + url)); }
      if (a.statusCode !== 200) { a.resume(); return nein(new Error('Antwort HTTP ' + a.statusCode)); }
      const teile = [];
      let menge = 0;
      a.on('data', d => {
        menge += d.length;
        if (menge > 25 * 1024 * 1024) { anfrage.destroy(); return nein(new Error('Antwort zu gross')); }
        teile.push(d);
      });
      a.on('end', () => { const b = Buffer.concat(teile); ja(opt.roh ? b : JSON.parse(b.toString('utf8'))); });
    });
    anfrage.on('timeout', () => { anfrage.destroy(); nein(new Error('Zeitueberschreitung - keine Antwort von GitHub')); });
    anfrage.on('error', e => nein(new Error(
      /ENOTFOUND|EAI_AGAIN/i.test(e.message) ? 'Keine Verbindung zu GitHub (kein Netz?)' : e.message)));
  });
}

function einrichten(umgebung) {
  const { app, localOnly, projektOrdner, dateien, kategorie } = umgebung;
  const WURZEL = projektOrdner;

  const standPfad = () => path.join(WURZEL, STAND_DATEI);

  function standLesen() {
    try { return JSON.parse(fs.readFileSync(standPfad(), 'utf8')); }
    catch (e) { return { dateien: {}, commit: null, zeit: null }; }
  }

  function standSchreiben(commit, karte) {
    try {
      fs.writeFileSync(standPfad(), JSON.stringify({
        hinweis: 'Merkposten: so sahen die Dateien aus, als sie zuletzt mit GitHub gleich waren. '
               + 'Er verhindert, dass eine hier neuere Datei von einer aelteren bei GitHub ueberschrieben wird. '
               + 'Nicht von Hand aendern - loeschen ist harmlos, dann ist der Schutz nur weniger genau.',
        konto: KONTO, repo: REPO, zweig: ZWEIG,
        commit: commit || null,
        zeit: new Date().toISOString(),
        dateien: karte || {},
      }, null, 1), 'utf8');
      return true;
    } catch (e) { return false; }
  }

  // ================================================================
  //  WELCHE DATEIEN UEBERHAUPT ABGEGLICHEN WERDEN
  // ================================================================
  //  Dietmar am 02.09.2026: "Wenn ich Dateien auf GitHub aendere oder
  //  hinzufuege, muss das einen Abgleich 'Update' geben."
  //
  //  Bis dahin stand im Server eine feste Liste von 16 Dateinamen. Was
  //  dort nicht stand, wurde nie abgeglichen - eine neu hinzugefuegte
  //  Datei bei GitHub war fuer den Trainer unsichtbar. Jetzt wird der
  //  Baum bei GitHub durchgegangen und HIER entschieden, was mitkommen
  //  darf.
  //
  //  UMGEKEHRTE BEWEISLAST: Erlaubt ist nur, was auf der Liste der
  //  ungefaehrlichen Endungen steht. Alles andere bleibt draussen -
  //  auch das, was heute noch niemand kennt. Eine Verbotsliste waere
  //  hier falsch herum: Wer eine Endung vergisst, hat ein Loch.
  //
  //  Ausfuehrbares kommt NIE ueber diesen Weg. .bat, .vbs, .ps1, .exe,
  //  .cmd, .py, .sh und die Bauanleitung .iss fehlen mit Absicht. Der
  //  Trainer soll sich Fragen und Seiten nachziehen koennen, keine
  //  Programme, die Windows dann ausfuehrt.
  const ABGLEICH_ENDUNGEN = [
    '.json', '.js', '.html', '.css', '.md', '.txt',
    '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico',
    '.pdf', '.woff2', '.woff', '.mp3', '.wav'
  ];
  // Ordner, die nie von aussen beschrieben werden. data\ und backup\ sind
  // die Lernstaende, Hoerbuch\ die gerechneten MP3s, release\ die fertigen
  // Setups - alles Eigentum des Rechners, auf dem der Trainer laeuft.
  const ABGLEICH_TABU = ['data/', 'backup/', 'hoerbuch/', 'node_modules/',
                         'release/', 'tts_cache/', '.git', 'bilder/'];

  function abgleichbar(pfad) {
    const p = String(pfad || '').replace(/\\/g, '/');
    if (!p || p.length > 200) return false;
    // Kein Ausbrechen aus dem Ordner. Der Pfad kommt aus einer fremden
    // Quelle - "../../Windows/System32/..." darf gar nicht erst
    // weitergereicht werden.
    if (p.startsWith('/') || /^[A-Za-z]:/.test(p) || p.split('/').includes('..')) return false;
    const klein = p.toLowerCase();
    if (ABGLEICH_TABU.some(t => klein.startsWith(t))) return false;
    const punkt = klein.lastIndexOf('.');
    if (punkt < 0) return false;
    return ABGLEICH_ENDUNGEN.includes(klein.slice(punkt));
  }

  function hierFingerabdruck(name) {
    try { return blobSha(fs.readFileSync(path.join(WURZEL, name))); }
    catch (e) { return null; }
  }

  // ---- Was gibt es bei GitHub? -------------------------------------
  //
  // Zwei kleine Anfragen statt einer grossen: erst der Zeiger auf den
  // letzten Commit, dann das Verzeichnis dieses Commits - und zwar OHNE
  // recursive. Alle Dateien, um die es geht, liegen im Hauptordner; mit
  // recursive kaemen 746 Zeichnungen mit, die niemand braucht.
  async function fernStand() {
    const ref = await holen(`${API}/repos/${KONTO}/${REPO}/git/ref/heads/${ZWEIG}`);
    const commit = ref && ref.object && ref.object.sha;
    if (!commit) throw new Error('GitHub nennt keinen Stand fuer ' + ZWEIG);
    const baum = await holen(`${API}/repos/${KONTO}/${REPO}/git/trees/${commit}?recursive=1`);
    const karte = {};
    for (const e of (baum.tree || [])) {
      if (e.type === 'blob' && abgleichbar(e.path)) karte[e.path] = { sha: e.sha, groesse: e.size };
    }
    return { commit, karte };
  }

  // ---- Der Drei-Wege-Vergleich -------------------------------------
  async function pruefen() {
    const { commit, karte } = await fernStand();
    const merk = standLesen();
    const eintraege = [];
    // Durchgegangen wird jetzt, was BEI GITHUB liegt - nicht mehr eine
    // Liste im Programm. Nur so faellt eine dort NEU hinzugekommene
    // Datei ueberhaupt auf.
    for (const name of Object.keys(karte)) {
      const fern = karte[name];
      if (!fern) continue;                       // liegt nicht bei GitHub
      const hier = hierFingerabdruck(name);
      if (hier === fern.sha) continue;           // gleich
      const gemerkt = merk.dateien ? merk.dateien[name] : null;

      let lage;
      if (hier === null)          lage = 'fehlt';        // hier gar nicht vorhanden
      else if (!gemerkt)          lage = 'unbekannt';    // nie abgeglichen
      else if (hier === gemerkt)  lage = 'neuer_dort';   // dort hat sich etwas getan
      else                        lage = 'neuer_hier';   // HIER wurde geaendert - Finger weg

      eintraege.push({
        name, lage,
        art: kategorie(name),
        fernGroesse: fern.groesse,
        hierGroesse: (() => { try { return fs.statSync(path.join(WURZEL, name)).size; } catch (e) { return null; } })(),
      });
    }
    return {
      commit,
      quelle: `https://github.com/${KONTO}/${REPO}`,
      merkposten: !!(merk.dateien && Object.keys(merk.dateien).length),
      zuletzt: merk.zeit || null,
      eintraege,
      geprueft: new Date().toISOString(),
    };
  }

  // ---- Holen und schreiben -----------------------------------------
  async function anwenden(commit, namen, programmBestaetigt) {
    if (!commit || !/^[0-9a-f]{7,40}$/i.test(commit)) throw new Error('Kein gueltiger Stand angegeben');
    // Frueher: nur was in der festen Liste stand. Jetzt: was die
    // Endungs- und Ordnerpruefung durchlaesst. Die Liste "dateien" aus
    // dem Server gilt weiterhin zusaetzlich - was dort steht, ist auf
    // jeden Fall erlaubt, auch wenn sie einmal eine Endung enthaelt,
    // die hier nicht auf der Liste steht.
    const erlaubt = namen.filter(n => abgleichbar(n) || dateien.includes(n));
    if (!erlaubt.length) throw new Error('Keine gueltige Datei angefragt');
    if (erlaubt.some(n => kategorie(n) === 'programm') && programmBestaetigt !== true)
      throw new Error('Fuer Programmdateien fehlt die ausdrueckliche Bestaetigung');

    // Noch einmal nachsehen, was bei GitHub steht. Zwischen dem Pruefen
    // und dem Klick koennen Minuten liegen.
    const baum = await holen(`${API}/repos/${KONTO}/${REPO}/git/trees/${commit}?recursive=1`);
    const soll = {};
    for (const e of (baum.tree || [])) if (e.type === 'blob') soll[e.path] = e.sha;

    const merk = standLesen();
    const stempel = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
    const sicherung = path.join(WURZEL, 'backup', 'github_' + stempel);
    fs.mkdirSync(sicherung, { recursive: true });

    const geschrieben = [], fehler = [], uebersprungen = [];
    for (const name of erlaubt) {
      try {
        const erwartet = soll[name];
        if (!erwartet) throw new Error('liegt bei GitHub nicht mehr vor');

        // Letzte Sicherung gegen das Zurueckdrehen: hat sich die Datei hier
        // seit dem Pruefen geaendert - etwa weil in der Zwischenzeit eine
        // neue Fassung angekommen ist - wird sie in Ruhe gelassen.
        const hier = hierFingerabdruck(name);
        const gemerkt = merk.dateien ? merk.dateien[name] : null;
        if (hier !== null && gemerkt && hier !== gemerkt) {
          uebersprungen.push({ name, grund: 'hier inzwischen geaendert - nicht ueberschrieben' });
          continue;
        }
        if (hier === erwartet) { uebersprungen.push({ name, grund: 'ist schon derselbe Stand' }); continue; }

        // Vom festen Commit holen, nicht von "main".
        const neu = await holen(
          `${RAW}/${KONTO}/${REPO}/${commit}/${encodeURIComponent(name)}`,
          { roh: true, zeit: 60000 });

        // Nachrechnen. Ein abgebrochener Download hat eine andere Laenge
        // und damit einen anderen Fingerabdruck - er faellt hier durch,
        // bevor er im Ordner landet.
        const bekommen = blobSha(neu);
        if (bekommen !== erwartet)
          throw new Error('Inhalt passt nicht zu dem, was GitHub angekuendigt hat (unvollstaendig?)');

        // Zweiter Riegel, kurz vor dem Schreiben: Was hier ankommt, ist
        // zwischen Pruefung und Klick durch mehrere Haende gegangen.
        if (!abgleichbar(name)) throw new Error('Diese Datei wird nicht abgeglichen');
        const ziel = path.join(WURZEL, name);
        // Seit dem 02.09.2026 koennen auch Dateien aus Unterordnern
        // kommen (svgs\, formelsammlung\, fontawesome\). Ohne diese
        // zwei Zeilen scheitert das Schreiben an einem Ordner, den es
        // hier noch nicht gibt.
        fs.mkdirSync(path.dirname(ziel), { recursive: true });
        if (fs.existsSync(ziel)) {
          const sicherZiel = path.join(sicherung, name);
          fs.mkdirSync(path.dirname(sicherZiel), { recursive: true });
          fs.copyFileSync(ziel, sicherZiel);
        }
        const tmp = ziel + '.github-tmp';
        fs.writeFileSync(tmp, neu);
        fs.renameSync(tmp, ziel);

        if (!merk.dateien) merk.dateien = {};
        merk.dateien[name] = erwartet;
        geschrieben.push({ name, groesse: neu.length });
        console.log(`[GITHUB] ${name} uebernommen (${neu.length} Bytes)`);
      } catch (e) {
        fehler.push({ name, grund: e.message });
        console.warn(`[GITHUB] ${name} nicht uebernommen:`, e.message);
      }
    }

    // Den Commit nur festhalten, wenn wirklich alles Angefragte geklappt
    // hat. Sonst stuende im Merkposten ein Stand, den der Ordner gar nicht
    // hat, und die naechste Pruefung faende faelschlich nichts mehr.
    const vollstaendig = !fehler.length && !uebersprungen.some(u => /geaendert/.test(u.grund));
    standSchreiben(vollstaendig ? commit : merk.commit, merk.dateien);

    return {
      ok: !fehler.length,
      geschrieben, fehler, uebersprungen,
      sicherung: path.relative(WURZEL, sicherung),
      neustartNoetig: geschrieben.some(g => kategorie(g.name) === 'programm'),
    };
  }

  // ---- Was der Start herausgefunden hat ----------------------------
  let letzteLage = null;

  async function beimStartNachsehen() {
    try {
      const j = await pruefen();
      const echte = j.eintraege.filter(e => e.lage === 'neuer_dort' || e.lage === 'fehlt');
      letzteLage = { zeit: j.geprueft, commit: j.commit, anzahl: echte.length,
                     eigene: j.eintraege.filter(e => e.lage === 'neuer_hier').length };
      if (echte.length) {
        console.log('');
        console.log('  ============================================================');
        console.log(`   GITHUB: ${echte.length} Datei(en) sind dort neuer.`);
        echte.slice(0, 8).forEach(e => console.log('     - ' + e.name));
        console.log('   Geholt wird nichts von allein. Im Trainer unter Info >');
        console.log('   "GitHub-Update" nachsehen und bestaetigen.');
        console.log('  ============================================================');
        console.log('');
      }
      if (letzteLage.eigene) {
        console.log(`[GITHUB] ${letzteLage.eigene} Datei(en) sind HIER neuer als bei GitHub`
          + ' - die bleiben unangetastet. (Hochladen.bat schiebt sie hoch.)');
      }
    } catch (e) {
      // Kein Netz, GitHub bremst, Repository umbenannt: der Start darf
      // daran nicht haengen und soll auch nicht mit Rot um sich werfen.
      letzteLage = { zeit: new Date().toISOString(), fehler: e.message };
      console.log('[GITHUB] Nachsehen nicht moeglich: ' + e.message);
    }
  }

  // ---- Endpunkte ---------------------------------------------------
  // Alle localOnly: das hier schreibt Dateien in DIESEN Ordner. Ein Gast
  // aus dem Gruppenraum hat damit nichts zu schaffen.
  app.get('/api/github/stand', localOnly, (req, res) => {
    res.json({ letzteLage, quelle: `https://github.com/${KONTO}/${REPO}`, zweig: ZWEIG });
  });

  app.get('/api/github/pruefen', localOnly, async (req, res) => {
    try { res.json(await pruefen()); }
    catch (e) { res.status(502).json({ error: e.message }); }
  });

  app.post('/api/github/anwenden', localOnly, async (req, res) => {
    try {
      const b = req.body || {};
      res.json(await anwenden(String(b.commit || ''),
                              Array.isArray(b.dateien) ? b.dateien : [],
                              b.programmBestaetigt === true));
    } catch (e) { res.status(400).json({ error: e.message }); }
  });

  // Merkposten von aussen setzen - das benutzt Hochladen.bat nach einem
  // erfolgreichen Push.
  app.post('/api/github/merken', localOnly, async (req, res) => {
    try {
      const { commit, karte } = await fernStand();
      const k = {};
      for (const n of Object.keys(karte)) k[n] = karte[n].sha;
      standSchreiben(commit, k);
      res.json({ ok: true, commit, dateien: Object.keys(k).length });
    } catch (e) { res.status(502).json({ error: e.message }); }
  });

  setTimeout(() => { beimStartNachsehen(); }, 4000);
  return { pruefen, anwenden, standLesen, standSchreiben, fernStand, blobSha };
}

module.exports = { einrichten, blobSha, KONTO, REPO, ZWEIG, STAND_DATEI };
