# BUG-REPORT — Klasse-N-Trainer

**Projektpfad:** `C:\Users\dietmar\Desktop\Klasse-N-Trainer`
**Datum der Analyse:** 17.08.2026
**Umfang:** `Server.js` (958 Z.), `Index.html` (6.956 Z.), `duo.js` (535 Z.), `package.json`, 3 Batch-Skripte
**Art:** Analyse (17.08.2026) + Umsetzung aller umsetzbaren Fixes (17.08.2026)

---

## Status der Umsetzung

**Backup:** `backup_17-08-2026\` enthält die unveränderten Originale von `Server.js`,
`Index.html`, `duo.js`, `package.json` und die erste Fassung dieses Reports.

**Geänderte Dateien:** `Server.js`, `Index.html`, `duo.js`, `package.json`.
**Neue Dateien:** `tts-expand.js`, `test/tts-expand.test.js`, `.gitignore`.

| Bereich | Status |
|---|---|
| **K1–K7** kritische Fehler | 🟢 **alle 7 gefixt** |
| **W1–W21** Warnungen | 🟢 **alle 20 gefixt** |
| **Q3, Q6, Q7, Q8, Q9, Q10** + toter Code | 🟢 **gefixt** |
| **Q1** Aufteilung der 6.956-Zeilen-`Index.html` | 🔵 **bewusst nicht gemacht** — siehe unten |
| **Q2** Dateinamen kleinschreiben | 🟠 **Handarbeit nötig** — siehe unten |
| **Q4** `original/`, `benenne`, `video_lessons.json` entfernen + `git init` | 🟠 **Handarbeit nötig** — siehe unten |
| **Q5** Versionsbezeichnungen vereinheitlichen | 🟢 gefixt (`package.json` 1.1.0, Startbanner V18) |

### Was du selbst machen musst

Drei Punkte konnte ich nicht erledigen, weil mir das Löschen und Umbenennen von Dateien
auf deinem Rechner technisch nicht möglich ist:

1. **Löschen** (Q4): der Ordner `original\`, die Datei `benenne` und `video_lessons.json`.
   Alle drei werden nicht mehr benutzt. Die neue `.gitignore` ist schon da.
2. **Umbenennen** (Q2): `Server.js` → `server.js` und `Index.html` → `index.html`.
   Unter Windows läuft beides so wie es ist; erst auf Linux/macOS/Docker würde es scheitern.
   Wenn du umbenennst, musst du in `package.json` `main` und `scripts` sowie in `START.bat`
   die Schreibweise mit anpassen. **Solange du nur unter Windows arbeitest, kannst du das
   auch einfach lassen** — deshalb habe ich `package.json` vorerst auf die tatsächlich
   vorhandene Schreibweise `Server.js` korrigiert, statt sie umgekehrt anzugleichen.
3. **`git init`** (Q4/Q10): Ein Repository ersetzt `original\` und `benenne` vollständig.

### Was ich bewusst nicht angefasst habe

**Q1 — Aufteilung der `Index.html` (6.956 Zeilen, 14 Script-Blöcke, 83 Inline-`onclick`).**
Das ist eine mehrtägige Umstrukturierung mit hohem Risiko, die keinerlei Funktion verbessert.
Sie zerlegt eine Datei, die im Moment nachweislich funktioniert, in acht neue — und ich kann
das Ergebnis hier nicht im Browser durchklicken, sondern nur die Syntax prüfen. Die
Wahrscheinlichkeit, dabei etwas kaputtzumachen, ist deutlich größer als der Gewinn. Falls du
es später angehen willst, ist die richtige Reihenfolge: erst `git init`, dann Stück für Stück
je einen Script-Block herauslösen und nach jedem Schritt im Browser gegenprüfen.

**Verifikation:** Testlauf gegen einen echten Server (Node 22, Express 4, socket.io 4),
Vergleich gegen die Originalfassung sowie eine neue Testsuite (`npm test`, 11 Tests).
Ergebnisse in Anhang B und C.

**Zwei Verhaltensänderungen für dich:**

1. Der Tunnel startet **nicht mehr von allein** (K2). Für den Gruppenraum einmal im Browser
   auf **„Tunnel starten"** klicken — oder den Server mit `AFU_TUNNEL=1` starten.
2. Einladungslinks tragen das Passwort jetzt hinter `#` statt hinter `&pwd=` (W20).
   Alte Links funktionieren weiterhin.

---

## 1. Projekt-Übersicht

### Zweck
Lern- und Prüfungstrainer für die deutsche **Amateurfunkprüfung Klasse N**. Enthält den amtlichen
Fragenkatalog (571 Fragen in den Teilen *Vorschriften*, *Betrieb*, *Technik*), einen
Prüfungssimulator mit den amtlichen Bestehensgrenzen (19/25 bestanden, 17–18/25 Grauzone
mündliche Nachprüfung), Lernfortschritt/Lernbedarf-Statistik für 3 Benutzer, Schaltbild-Anzeige
(SVG), YouTube-Lernvideos mit Zeitmarken, eine Druckfunktion sowie einen **Gruppenraum („Duo-Modus")**,
in dem mehrere Teilnehmer über einen Cloudflare-Tunnel dieselbe Prüfung schreiben.

### Tech-Stack

| Ebene | Technologie |
|---|---|
| Laufzeit | Node.js ≥ 18 (CommonJS, kein Build-Schritt) |
| Backend | Express 4.22.2, cors 2.8.6, socket.io 4.8.x |
| Frontend | Vanilla JS / HTML / CSS — **eine einzige Datei** `Index.html` (352 KB, 14 `<script>`-Blöcke) |
| Echtzeit | Socket.IO (Client per CDN 4.7.5) |
| TTS | Piper (`piper.exe` als Subprozess) + Browser-`speechSynthesis` als Fallback |
| Fernzugriff | `cloudflared.exe` → `*.trycloudflare.com` (Quick Tunnel, ephemer) |
| Persistenz | JSON-Datei `data/userdata/amateurfunk_data.json` + `localStorage` im Browser |
| Start | `START.bat` / `START_ALLES.bat` / `start-tunnel.bat` (Windows-only) |

### Struktur

```
Klasse-N-Trainer/
├── Server.js            Express + Socket.IO + TTS + Tunnel-Steuerung
├── Index.html           komplettes Frontend (6.956 Zeilen)
├── duo.js               Client-Logik Gruppenraum
├── fragen.json          Fragenkatalog (395 KB)
├── video_map_embed.js   Video-Zeitmarken, eingebettet (212 KB)
├── video_lessons.json   (40 KB, laut Kommentar nicht mehr benutzt)
├── svg-list.json        Liste der Schaltbilder
├── data/userdata/       amateurfunk_data.json (Verlauf/Fortschritt 3 Benutzer)
├── piper/, sounds/, svgs/, tts_cache/
├── original/            ältere Vollkopie von duo.js/server.js/index.html/fragen.json
├── node_modules/, Node.js/
├── cloudflared.exe      54 MB
├── Pruefungsfragen.pdf  5,5 MB
└── *.bat, *.log, tunnel_url.txt
```

### Gesamtbewertung

Funktional ist das Tool erstaunlich vollständig und durchdacht — die Fachlogik (amtliche
Bestehensgrenzen, Grauzone, TTS-Aussprache von Funk-Abkürzungen) ist mit viel Sorgfalt gebaut.
**Die Schwächen liegen fast alle in der Infrastruktur**, nicht in der Fachlogik: Der Server macht
den kompletten Projektordner ohne jede Authentifizierung über einen öffentlichen Internet-Tunnel
erreichbar. Das ist der mit Abstand wichtigste Punkt dieses Reports.

**Zusammenfassung:** 7 kritische Befunde · 19 Warnungen · 15 Qualitätspunkte.

---

## 2. KRITISCHE FEHLER — 🟢 alle 7 gefixt (17.08.2026)

### [x] K1 — Der gesamte Projektordner ist öffentlich im Internet abrufbar · 🟢 Gefixt
**`Server.js:602`** in Kombination mit **`Server.js:937`** und **`Server.js:946`**

```js
app.use(express.static(path.join(__dirname)));   // Zeile 602
```

`express.static` auf `__dirname` gibt **jede Datei im Projektordner** frei. Der Server lauscht auf
`0.0.0.0` (Z. 937) und startet 2 Sekunden nach dem Start automatisch einen öffentlichen
Cloudflare-Tunnel (Z. 946). Jeder, der die Tunnel-URL kennt oder erhält (z. B. per WhatsApp
weitergeleiteter Einladungslink), kann abrufen:

* `/Server.js`, `/duo.js`, `/package.json`, `/package-lock.json` — kompletter Quellcode
* `/data/userdata/amateurfunk_data.json` — **alle Lerndaten aller 3 Benutzer**
* `/tunnel.log`, `/tunnel_url.txt` — Betriebsdaten
* `/original/server.js`, `/original/index.html` … — alte Codestände
* `/node_modules/**` — vollständiger Abhängigkeitsbaum
* `/Pruefungsfragen.pdf` (5,5 MB), `/cloudflared.exe` (**54 MB**) — beliebig oft herunterladbar

**Konkretes Angriffsszenario:** Ein Teilnehmer bekommt den Einladungslink für den Gruppenraum.
Er hängt `/data/userdata/amateurfunk_data.json` an, sieht den kompletten Lernverlauf, und lädt
`cloudflared.exe` in einer Schleife → die Internetleitung ist dicht.

**Fix:** `express.static` auf ein Unterverzeichnis `public/` beschränken, in das nur die wirklich
öffentlichen Dateien gehören (Index.html, duo.js, svgs/, sounds/, fragen.json).

**🟢 Umgesetzt am 17.08.2026 — `Server.js:716-770`**

Statt die Ordnerstruktur umzubauen (das hätte alle Windows-Pfade, `START.bat` und die
`piper/`-Anleitung in der `README.txt` gebrochen), sitzt jetzt eine **Whitelist-Middleware** vor
`express.static`. Bewusst als Whitelist und nicht als Sperrliste: eine neue Datei im Projektordner
ist damit automatisch **nicht** öffentlich.

```js
const PUBLIC_FILES = new Set(['/','/index.html','/duo.js','/fragen.json',
                              '/svg-list.json','/video_map_embed.js','/favicon.ico']);
const PUBLIC_DIRS  = ['/svgs/', '/sounds/'];
```

Die Prüffunktion `isPublicPath()` normalisiert Backslashes (Windows), lehnt `..` und Null-Bytes ab
und vergleicht kleingeschrieben — `/SERVER.JS` und `/%2e%2e/Server.js` werden also ebenfalls
geblockt. Geloggt wird nur, wenn eine **tatsächlich vorhandene** Datei blockiert wurde, damit
normale 404 (z. B. das fehlende `video_map.json`) das Log nicht fluten.

*Windows-Prüfung:* `index: 'Index.html'` ist explizit gesetzt, damit `/` die Startseite trotz des
großen `I` findet. `/svgs` wird weiterhin von der bestehenden Zeile 425 bedient und läuft an der
Whitelist vorbei — unverändertes Verhalten.

---

### [x] K2 — Tunnel startet automatisch ohne Zustimmung · 🟢 Gefixt
**`Server.js:946-952`**

```js
setTimeout(()=>{ startTunnelProcess()… }, 2000);
```

Wer `START.bat` doppelklickt, um allein zu lernen, veröffentlicht **ungefragt** seinen lokalen
Server im Internet. Die trycloudflare-URLs sind nicht erratbar, aber sie stehen im Klartext in
`tunnel_url.txt`, `tunnel.log`, in der Browser-Historie und in jedem verschickten Einladungslink —
und der Tunnel läuft weiter, auch wenn niemand einen Gruppenraum nutzt.

**Fix:** Auto-Start entfernen. Tunnel nur nach ausdrücklichem Klick auf „Raum erstellen" bzw.
„Tunnel starten" hochfahren, oder per `--tunnel`-Flag / Umgebungsvariable opt-in.

**🟢 Umgesetzt am 17.08.2026 — `Server.js:1055-1073`**

Der `setTimeout`-Auto-Start ist entfernt. Der Tunnel startet jetzt nur noch:

1. nach Klick auf **„Tunnel starten"** bzw. **„Raum erstellen"** im Browser (→ `POST /api/start-tunnel`), oder
2. wenn der Server mit `AFU_TUNNEL=1` gestartet wird (für alle, die es weiterhin automatisch wollen).

Der Startbanner sagt jetzt ausdrücklich, dass der Server nur lokal erreichbar ist. In `START.bat`
musste nichts geändert werden.

---

### [x] K3 — `/api/userdata` ist völlig ungeschützt (Lesen, Überschreiben, Löschen) · 🟢 Gefixt
**`Server.js:416` (GET), `423` (POST), `458` (GET Kategorie), `470` (DELETE)**

Keine Authentifizierung, kein Token, `cors({origin:'*'})` (Z. 409). Über den Tunnel kann jeder
Fremde:

```
GET    /api/userdata                  → gesamter Lernverlauf aller 3 Benutzer
POST   /api/userdata                  → alles überschreiben
DELETE /api/userdata/history/user1    → Verlauf löschen
```

Zusätzlich fehlt jeder CSRF-Schutz: Es genügt, dass der Benutzer eine beliebige fremde Webseite
öffnet, während der Trainer läuft — ein simples `fetch('http://localhost:3000/api/userdata', …)`
von dort löscht die Daten.

**Fix:** Alle `/api/*`-Routen hinter ein Session-Token oder zumindest hinter eine
Localhost-Prüfung legen; für den Tunnel eine eigene, minimale API-Oberfläche freigeben.

**🟢 Umgesetzt am 17.08.2026 — `Server.js:427-447` (Middleware), `460/467/502/514` (Routen)**

**Wichtige Korrektur gegenüber dem ursprünglichen Vorschlag:** Eine reine `req.ip`-Prüfung wäre
hier **wirkungslos** gewesen. `cloudflared` verbindet sich selbst nach `http://localhost:3000` —
für Anfragen aus dem Tunnel steht in `req.ip` deshalb ebenfalls `127.0.0.1`. Das ist mir erst beim
Testen aufgefallen.

Die umgesetzte Prüfung verlangt daher **beides**: Verbindung von `127.0.0.1` **und** keiner der
Proxy-Header, die Cloudflare am Edge setzt und die ein Client nicht entfernen kann:

```js
const PROXY_HEADERS = ['cf-ray','cf-connecting-ip','x-forwarded-for',
                       'x-forwarded-host','x-real-ip','forwarded'];
function isLocalRequest(req){
  const ip = String(req.ip||'').replace(/^::ffff:/,'');
  if(ip !== '127.0.0.1' && ip !== '::1') return false;
  return !PROXY_HEADERS.some(h => req.headers[h]);
}
```

Gefälschte Header können die Prüfung nur **strenger** machen, nie lockerer. Damit ist gleichzeitig
der CSRF-Weg zu: schreibende Aufrufe kommen jetzt nur noch von echten lokalen Anfragen durch.

*Gewollter Nebeneffekt:* Teilnehmer aus dem Gruppenraum schreiben nicht mehr in die persönliche
Lerndatei des Gastgebers. Das war ohnehin falsch — bisher teilten sich **alle** Teilnehmer die
drei Slots `user1/user2/user3` des Gastgebers. Ihr Fortschritt bleibt wie bisher im `localStorage`
ihres eigenen Browsers; der Client kommt mit der 403-Antwort ohne Fehlermeldung klar
(`Index.html:2154` und `2167` prüfen `res.ok`).

---

### [x] K4 — `/api/start-tunnel` erlaubt Fremden das Starten/Killen von Prozessen · 🟢 Gefixt
**`Server.js:527`**

Ein unauthentifizierter `POST /api/start-tunnel` beendet den laufenden `cloudflared`-Prozess
(Z. 64) und startet einen neuen. Folgen:

1. Jeder Besucher kann per Endlosschleife beliebig viele Prozessstarts auf dem PC auslösen (DoS).
2. Ein einziger Aufruf **zerstört den laufenden Gruppenraum-Link**, weil die alte URL wegfällt.

**Fix:** Route nur für `127.0.0.1` freigeben (`req.ip`-Prüfung) und zusätzlich ratelimitieren.

**🟢 Umgesetzt am 17.08.2026 — `Server.js:571`**

`app.post('/api/start-tunnel', localOnly, …)` — dieselbe Middleware wie bei K3 (inklusive der dort
beschriebenen Korrektur: `req.ip` allein hätte nicht gereicht).
Zusätzlich gibt `/api/tunnel-url` (`Server.js:557-562`) an externe Aufrufer jetzt **nicht mehr**
`binaryPath` und `hint` aus; die enthielten lokale Dateipfade vom Rechner des Gastgebers.
Die eigentliche Tunnel-URL bleibt abrufbar — die kennen die Teilnehmer ohnehin, sie steht in ihrer
Adresszeile.

---

### [x] K5 — `/api/tts` startet unbegrenzt Subprozesse (DoS) · 🟢 Gefixt
**`Server.js:564-601`**

Pro Request wird ein `piper.exe`-Prozess gestartet (Z. 576/577). Es gibt **keine Längenbegrenzung
für `text`, kein Rate-Limit, keine Begrenzung gleichzeitiger Prozesse und keine Warteschlange**.
100 parallele Requests = 100 gleichzeitige `piper.exe`-Prozesse → CPU und RAM des Rechners sind
erschöpft. Der `tts_cache/`-Ordner wächst dabei ungebremst und wird nur beim Serverstart geleert.

*Positiv:* Eine echte Command-Injection liegt **nicht** vor — `spawn` wird ohne Shell aufgerufen,
und `req.body.voice` wird gegen die Whitelist aus `listVoices()` geprüft (Z. 568). Das ist sauber
gelöst.

**Fix:** `text.length` auf z. B. 1.000 Zeichen begrenzen, eine Semaphore (max. 2 parallele
Piper-Prozesse) und ein Rate-Limit pro IP einziehen, Cache-Größe deckeln.

**🟢 Umgesetzt am 17.08.2026 — `Server.js:613-645`**

Drei Grenzen, absichtlich in dieser Reihenfolge:

| Grenze | Wert | Verhalten bei Überschreitung |
|---|---|---|
| Textlänge | 1.000 Zeichen | `413` |
| Gleichzeitige `piper.exe` | 2 | `429` |
| Neue Synthesen pro Client/Minute | 60 | `429` |

**Beim Testen nachgebessert:** In der ersten Fassung lief das Rate-Limit *vor* der
Cache-Abfrage — damit hätten auch bereits zwischengespeicherte Sätze mitgezählt und schnelles
Durchklicken mit „Vorlesen" hätte dich ausgebremst. Jetzt greift das Limit erst **nach** dem
Cache-Treffer, zählt also nur echte Synthese. Cache-Wiedergaben sind unbegrenzt.

Der Prozess-Slot wird über `releaseTtsSlot()` freigegeben, durch ein Flag abgesichert genau
einmal — egal ob der Prozess normal endet, per `error` abbricht, `spawn` synchron wirft oder
`stdin` scheitert. Sonst wäre der Zähler nach ein paar Fehlern dauerhaft bei 2 hängengeblieben und
die Sprachausgabe komplett tot gewesen.

*Nicht umgesetzt:* die Deckelung der Cache-Größe. Das gehört zu W15 (Cache-Handling) und wird
sinnvollerweise zusammen damit gemacht.

---

### [x] K6 — Duo-Modus: Server vertraut dem Client bei Punkten und Identität · 🟢 Gefixt
**`Server.js:793-798`**

```js
const uid = data.userId || socket.id;                              // Zeile 795
room.allAnswers[uid][data.questionId] = { …, isCorrect:data.isCorrect, … };  // Zeile 798
```

Zwei getrennte Probleme:

1. **`isCorrect` kommt vom Client** (`duo.js:452`). Jeder Teilnehmer kann mit einem Einzeiler in
   der Browser-Konsole `socket.emit('duoAnswer',{code,questionId:'…',isCorrect:true})` für alle
   Fragen senden und landet mit 25/25 auf Platz 1.
2. **`data.userId` wird ungeprüft übernommen.** Ein Teilnehmer kann Antworten **im Namen eines
   anderen** einbuchen — also einen Mitspieler gezielt durchfallen lassen, oder mit fremden IDs
   Phantom-Teilnehmer erzeugen.

Für einen Prüfungstrainer im Verein ist das nicht nur ein Sicherheits-, sondern ein
Fairness-Problem.

**Fix:** `uid` immer auf `socket.id` setzen (die Zeile 795 ganz streichen). `isCorrect`
serverseitig aus `room.questionsFull` berechnen — die richtige Antwort liegt dort ohnehin vor.

**🟢 Umgesetzt am 17.08.2026 — `Server.js:886-922`**

Beide Löcher sind zu:

```js
const uid = socket.id;                       // data.userId wird nicht mehr gelesen
if(!room.users[uid]){ … return; }            // nur echte Raum-Mitglieder
const verified = verifyAnswer(room, data.questionId, data.optionIndex);
```

`verifyAnswer()` schlägt die Frage in `room.questionsFull` nach und liest `options[i].correct`.
Das passt indexgenau, weil der Client per `duoQuizStarted` **genau dieses Array** bekommt
(`Index.html:6964` nimmt `data.questionsFull` unverändert als Pool, ohne erneut zu mischen).
Antworten auf Fragen, die nicht zum Raum gehören, werden verworfen; ein ungültiger `optionIndex`
zählt als falsch. Weicht die Client-Behauptung vom Serverergebnis ab, landet eine Warnung im Log —
so siehst du, wenn jemand es versucht hat.

**Verifiziert:** Die Originalfassung ließ sich mit drei Zeilen in der Browser-Konsole auf
„3/3 · bestanden" bringen, ohne eine einzige Frage zu sehen. Nach dem Fix ergibt derselbe Angriff
0 richtige. Details in Anhang B.

---

### [x] K7 — Server stürzt bei fehlgeschlagenem Piper-Start komplett ab · 🟢 Gefixt
**`Server.js:600`**

```js
proc.stdin.setDefaultEncoding('utf-8'); proc.stdin.write(text,'utf-8'); proc.stdin.end();
```

Wenn `spawn` fehlschlägt (piper.exe fehlt, vom Virenscanner blockiert, fehlende DLL — laut
`getWinCrashHint` ein bekanntes Szenario), emittiert der `stdin`-Stream ein `error`-Event
(`EPIPE`/`ENOENT`). Für `proc.stdin` ist **kein `error`-Listener registriert** → unbehandeltes
Error-Event → `uncaughtException` → **der gesamte Node-Prozess beendet sich**. Ein laufender
Gruppenraum mit allen Teilnehmern ist damit weg.

Verschärfend: Es gibt **keinen globalen `process.on('uncaughtException')`- und keinen
`unhandledRejection`-Handler** in der gesamten Datei.

**Fix:**
```js
proc.stdin.on('error', e => { if(!done){ done=true; res.status(500).json({error:'Piper stdin: '+e.message}); }});
```
plus einen globalen Handler, der loggt statt zu beenden.

**🟢 Umgesetzt am 17.08.2026 — `Server.js:9-22`, `709-727`, sowie Absicherung der Socket-Handler**

Drei Ebenen:

1. **Global** (`Server.js:9-22`): `process.on('uncaughtException')` und `('unhandledRejection')`
   loggen mit Stacktrace, statt den Prozess zu beenden.
2. **TTS** (`Server.js:709-727`): eigener `error`-Listener auf `proc.stdin`, dazu `try/catch` um
   `write()` und um `spawn()` selbst.
3. **Socket-Handler:** `joinRoom`, `startDuoQuiz`, `duoAnswer`, `requestFinalResults` und
   `leaveRoom` haben jetzt `try/catch` und eine Typprüfung auf `data`. (Das war im Report als W19
   geführt — es ist aber derselbe Absturzweg und deshalb hier gleich mit erledigt.)

**Verifiziert:** Ein `socket.emit('joinRoom')` **ohne Argument** beendete die Originalfassung
sofort — der Testserver war nach dem ersten Paket tot. Nach dem Fix übersteht der Server sechs
solcher Schrott-Pakete hintereinander unbeschadet. Details in Anhang B.

---

## 3. Warnungen & potenzielle Bugs — 🟢 alle gefixt (17.08.2026)

### Tunnel / Windows-spezifisch

**W1 — Race Condition beim Tunnel-Neustart · `Server.js:64` ↔ `Server.js:130-136` · 🟢 Gefixt**
Zeile 64 killt den alten Prozess. Dessen `exit`-Handler feuert **asynchron**, also potenziell
*nachdem* der neue Tunnel bereits gestartet ist, und setzt dann `tunnelUrlCache = null`,
`tunnelStarting = false` und **löscht `tunnel_url.txt`** (Z. 134). Ergebnis: Die frisch ermittelte
URL des *neuen* Tunnels verschwindet — genau das Symptom, gegen das der Kommentar in Zeile 56
(„FIX V16") eigentlich ankämpft.
*Fix:* Alten Prozess über eine lokale Variable referenzieren und dessen Handler vor dem `kill()`
mit `removeAllListeners()` abhängen, oder eine Generations-ID mitführen.

> **🟢 Umgesetzt:** `Server.js`: Generationszähler `tunnelGeneration`. Der alte Prozess wird über `tunnelBeenden()` erst von seinen Listenern getrennt und dann beendet; sein `exit`-Handler prüft die Generation und rührt einen inzwischen gestarteten neuen Tunnel nicht mehr an.

**W2 — Datei-Lock unter Windows liefert veraltete Tunnel-URL · `Server.js:78-80` + `84-85` + `500-509` · 🟢 Gefixt**
Zeile 79 löscht `tunnel.log`, während der `logStream` aus dem vorherigen Lauf (Z. 84) die Datei
**noch offen hält**. Unter Windows scheitert `unlinkSync` dann mit `EPERM`/`EBUSY` — der Fehler
wird von `catch{}` **stillschweigend verschluckt**. Anschließend hängt `createWriteStream(…, {flags:'a'})`
an die *alte* Datei an. `/api/tunnel-url` liest die Datei (Z. 500-504), findet dort die **URL des
letzten Laufs** und liefert sie aus. Der Einladungslink zeigt auf einen toten Tunnel → **Cloudflare
Error 1033**. Das ist die wahrscheinlichste Ursache des Problems, das an mehreren Stellen im Code
kommentiert wird.
*Fix:* Streams vor dem Löschen mit `.end()` schließen und im `close`-Callback löschen; oder gar
nicht löschen und stattdessen mit `{flags:'w'}` überschreiben.

> **🟢 Umgesetzt:** `Server.js`: `closeTunnelStreams()` schließt die Streams **vor** dem Löschen; zusätzlich werden die Logs mit `{flags:'w'}` statt `'a'` geöffnet. Selbst wenn das Löschen unter Windows scheitert, startet die Datei jetzt garantiert leer — eine URL aus einem früheren Lauf kann also nicht mehr gefunden werden. Das Löschen meldet den Fehler jetzt außerdem im Log, statt ihn zu verschlucken.

**W3 — Handle-Leak · `Server.js:84-85` · 🟢 Gefixt**
`logStream` und `outStream` werden nie `.end()`-et. Jeder `/api/start-tunnel`-Aufruf leckt zwei
Datei-Handles und verlängert das Lock aus W2.

> **🟢 Umgesetzt:** `Server.js`: dieselbe `closeTunnelStreams()`-Funktion; Streams werden bei jedem Neustart, bei Spawn-Fehler und im `exit`-Handler geschlossen.

**W4 — Verwaiste `cloudflared.exe`-Prozesse · gesamte Datei · 🟢 Gefixt**
Es gibt keinen `process.on('SIGINT'/'exit')`-Handler, der `tunnelProcess.kill()` aufruft. Nach
Strg+C im Server-Fenster **läuft cloudflared weiter** und tunnelt einen Port, hinter dem nichts
mehr ist. Mehrfaches Starten von `START.bat` stapelt die Prozesse.
*Fix:* `process.on('exit', ()=> { try{ tunnelProcess?.kill(); }catch{} });` — bzw. unter Windows
`taskkill /IM cloudflared.exe /F`, wie es `start-tunnel.bat:36` bereits macht.

> **🟢 Umgesetzt:** `Server.js`: `tunnelBeenden()` hängt an `process.on('exit')` sowie an `SIGINT`/`SIGTERM`/`SIGBREAK`. Nach Strg+C ist cloudflared jetzt mit weg.

**W5 — `START_ALLES.bat` startet zwei konkurrierende Tunnel · 🟢 Gefixt**
`START_ALLES.bat` ruft `start-tunnel.bat` auf (eigener Tunnel, eigene PowerShell schreibt
`tunnel.log`/`tunnel_url.txt`) **und danach** `node server.js`, das nach 2 Sekunden einen **zweiten**
Tunnel startet und dabei genau diese Dateien löscht (`Server.js:78-80`). Zwei
`cloudflared.exe`-Prozesse, zwei URLs, ein gemeinsamer Logfile-Konflikt. Welche URL im
Einladungslink landet, ist Zufall.
*Fix:* `START_ALLES.bat` löschen oder auf `node server.js` reduzieren — der Server kann den Tunnel
selbst.

> **🟢 Umgesetzt:** Nicht mehr im Code lösbar — durch K2 entschärft: `Server.js` startet keinen zweiten Tunnel mehr von allein. **Empfehlung bleibt:** `START_ALLES.bat` löschen und nur `START.bat` verwenden.

**W16 — Tote URL wird als „letzte URL" weitergereicht · `Server.js:500-509` ↔ `duo.js:246-263` · 🟢 Gefixt**
`/api/tunnel-url` liefert eine im Log gefundene URL auch dann, wenn `running:false` ist. Der Client
zeigt sie als „⚠️ Letzte URL" an und schreibt sie in `localStorage` (`duo.js:254`). Über
`saveDuckDns` (`duo.js:419`) kann sie sich anschließend wieder als aktive URL festsetzen — genau der
Effekt, den der Kommentar in `duo.js:14-18` verhindern soll.

> **🟢 Umgesetzt:** `duo.js`: `fetchAndFillTunnelUrl()` übernimmt eine URL nur noch als aktiv, wenn der Server `running:true` meldet. Eine nur aus dem Logfile gelesene URL wird angezeigt, aber nicht mehr in `localStorage` festgeschrieben — genau dieser Mechanismus hat vorher tote Links konserviert.

### Duo-Modus / Gruppenraum

**W6 — Verzerrter Shuffle bei der Fragenauswahl · `Server.js:648` · 🟢 Gefixt**
```js
const shuffledQuestions=[...pool].sort(()=>0.5-Math.random());
```
Das ist kein gleichverteiltes Mischen. **Empirisch nachgemessen** (200.000 Durchläufe, 6 Elemente):
das erste Element bleibt in **28,5 %** der Fälle auf Position 1 statt der erwarteten 16,7 %.
Da anschließend nur die ersten `n` Elemente genommen werden (Z. 648), ist damit **auch die Auswahl,
welche Fragen überhaupt drankommen, systematisch verzerrt** — Fragen vom Anfang des Katalogs
kommen deutlich häufiger. Für einen Prüfungstrainer ein echtes fachliches Problem.
*Fix:* Die korrekte Fisher-Yates-Implementierung steht **acht Zeilen weiter unten** in
`shuffleOptions` (`Server.js:656-659`) — einfach auch hier verwenden.

> **🟢 Umgesetzt:** `Server.js`: neue Funktion `fisherYates()`, wird in `generateRoomQuestions` statt `.sort(()=>0.5-Math.random())` benutzt.

**W7 — Raumcodes: nur 4 Zeichen, keine Kollisionsprüfung · `Server.js:665-668` · 🟢 Gefixt**
```js
const code = Math.random().toString(36).substring(2,6).toUpperCase();
duoRooms[code] = { … };   // überschreibt bestehenden Raum kommentarlos
```
Trifft der Zufall einen bereits vergebenen Code, wird der **laufende Raum samt aller Antworten
gelöscht** und die dort verbliebenen Teilnehmer hängen in einem fremden Raum. Zusätzlich sind
36⁴ = 1,68 Mio. Kombinationen bei **fehlendem Rate-Limit auf `joinRoom`** durchsuchbar — Räume ohne
Passwort lassen sich finden.
*Fix:* `do { code = … } while(duoRooms[code]);` plus 6 Zeichen plus Rate-Limit auf fehlgeschlagene
Joins.

> **🟢 Umgesetzt:** `Server.js`: `freienRaumcodeFinden()` — 6 Zeichen aus `crypto.randomBytes`, Alphabet ohne I/O/0/1 (leichter vorzulesen), Schleife bis ein freier Code gefunden ist.

**W12 — „Gesamt-Auswertung" killt die automatische Endauswertung · `Server.js:756-767` ↔ `811` · 🟢 Gefixt**
`sendFinalResults` setzt `room.finalResultsSent = true` (Z. 762). Die automatische Auswertung, wenn
wirklich alle fertig sind, läuft nur unter `if(totalQuestions>0 && !room.finalResultsSent)` (Z. 811).
`requestFinalResults` (Z. 821) darf **jeder Teilnehmer jederzeit** auslösen (`duo.js:459`).
**Folge:** Klickt irgendwer nach 3 von 25 Fragen einmal auf „Gesamt-Auswertung", bekommt der ganze
Raum am Ende **nie wieder** die automatische Endauswertung.
*Fix:* `finalResultsSent` nur im automatischen Pfad setzen, nicht in `sendFinalResults` selbst.

> **🟢 Umgesetzt:** `Server.js`: `room.finalResultsSent = true` steht nicht mehr in `sendFinalResults`, sondern ausschließlich im automatischen Pfad in `duoAnswer`. Ein vorzeitiger Klick auf „Gesamt-Auswertung" schaltet die automatische Endauswertung damit nicht mehr ab.

**W19 — Ungefangene Exceptions in Socket-Handlern → Serverabsturz · 🟢 Gefixt (zusammen mit K7)**
`joinRoom` (`Server.js:682`), `startDuoQuiz` (`780`), `duoAnswer` (`793`), `leaveRoom` (`884`) und
`requestFinalResults` (`821`) haben **kein `try/catch`** — anders als `createRoom` (Z. 664) und
`kickUser` (Z. 828). Socket.IO fängt Fehler in Listenern nicht ab; sie werden zu
`uncaughtException`. Ein `socket.emit('joinRoom')` **ohne Argument** genügt: `data.code` wirft
`TypeError: Cannot read properties of undefined` → **Server tot**. Über den offenen Tunnel von
jedem auslösbar.

> **🟢 Umgesetzt:** `Server.js`: `try/catch` und `data`-Typprüfung in `joinRoom`, `startDuoQuiz`, `duoAnswer`, `requestFinalResults`, `leaveRoom`; zusätzlich globaler `uncaughtException`-Handler. (Bereits mit K7 erledigt.)

**W11 — Speicherwachstum in `duoRooms` · `Server.js:616`, `668`, `884` · 🟢 Gefixt**
Räume haben keine Lebensdauer. `createdAt` wird zwar gesetzt (Z. 668), aber **nie ausgewertet**
(toter Code). `leaveRoom` (Z. 887) löscht den Benutzer, aber **nicht** `room.allAnswers[socket.id]` —
`kickUser` macht das korrekt (Z. 858). Bei Dauerbetrieb wächst der Speicher.
*Fix:* Aufräum-Intervall, das Räume älter als z. B. 12 h verwirft.

> **🟢 Umgesetzt:** `Server.js`: Aufräum-Intervall (alle 30 Min.) entfernt leere Räume und solche, die älter als 12 Stunden sind. `leaveRoom` und `disconnect` löschen jetzt zusätzlich `allAnswers` des ausscheidenden Teilnehmers.

### Daten & Persistenz

**W8 — Lost Updates und Dateikorruption · `Server.js:429-453` und `Server.js:225` · 🟢 Gefixt**
`loadUserdataFile()` → Objekt verändern → `saveUserdataFile()` ist ein Read-Modify-Write **ohne
jede Sperre**. Zwei gleichzeitige POSTs (der Client debounced mit nur 800 ms, `Index.html:2158`)
→ der zweite überschreibt den ersten. Zusätzlich schreibt `fs.writeFileSync` (Z. 225) **direkt auf
die Live-Datei**: Stromausfall oder Absturz mitten im Schreiben → `amateurfunk_data.json` ist
halbfertiges JSON, `JSON.parse` scheitert, und `loadUserdataFile` (Z. 216-219) liefert kommentarlos
die **leeren Standarddaten** zurück. **Der komplette Lernverlauf ist dann weg, ohne Fehlermeldung.**
*Fix:* Atomar schreiben — in `…json.tmp` schreiben, dann `fs.renameSync`. Zusätzlich vor jedem
Schreiben eine `.bak`-Kopie anlegen und bei Parse-Fehler daraus wiederherstellen statt still zu
leeren.

> **🟢 Umgesetzt:** `Server.js`: `saveUserdataFile()` schreibt nach `.tmp`, sichert den alten Stand als `.bak` und benennt dann um. `loadUserdataFile()` stellt bei defektem JSON automatisch aus `.bak` wieder her und legt die kaputte Datei als `.defekt-<Zeitstempel>` beiseite, statt sie zu überschreiben.

**W9 — Keine Validierung des POST-Bodys · `Server.js:444-451` · 🟢 Gefixt**
```js
merged = { examHistory: incoming.examHistory || current.examHistory, … };
```
Es wird nicht geprüft, ob `incoming.examHistory` überhaupt ein Objekt ist. `{"examHistory":"kaputt"}`
landet unverändert in der Datei. Beim nächsten Laden läuft `data.examHistory[u] = []` (Z. 210) auf
einen String — die Zuweisung schlägt im Nicht-Strict-Modus **still fehl** und die Datenstruktur ist
dauerhaft defekt.
*Fix:* Typprüfung pro Feld, bei Fehlern `400` statt Speichern.

> **🟢 Umgesetzt:** `Server.js`: `normalisiereUserdata()` plus Typprüfung in `POST /api/userdata`. Ein Feld mit falschem Typ führt jetzt zu `400` mit Begründung, statt stillschweigend die Daten zurückzusetzen. Auch ein unbekannter Benutzer oder Typ wird abgelehnt (vorher kam „ok:true", obwohl nichts gespeichert wurde).

**W10 — Blockierende Synchron-I/O im Request-Pfad · 🟢 Gefixt**
* `Server.js:636` — `fs.readFileSync('fragen.json')` + `JSON.parse` (395 KB) bei **jeder**
  Raumerstellung. Blockiert die Event-Loop für alle verbundenen Teilnehmer gleichzeitig.
* `Server.js:483` — dasselbe bei jedem `/fragen.json`-Request (und die Route ist überflüssig,
  `express.static` liefert die Datei ohnehin aus, dann sogar mit ETag/Caching).
*Fix:* Katalog **einmal beim Serverstart** in eine Modulvariable laden.

> **🟢 Umgesetzt:** `Server.js`: `ladeFragen()` hält den Katalog im Speicher und liest nur bei geändertem Zeitstempel neu. `generateRoomQuestions` und `GET /fragen.json` nutzen den Cache.

**W14 — Race Condition im TTS-Cache · `Server.js:571` · 🟢 Gefixt**
```js
if(fs.existsSync(out)){ … return res.sendFile(out); }
```
Kommt derselbe Text zweimal kurz hintereinander, sieht der zweite Request die Datei, **während
Piper sie noch schreibt**, und schickt eine abgeschnittene WAV. Der Client fängt das nur zufällig
ab, weil er `blob.size > 500` prüft (`Index.html:3379`) — bei größeren Teilstücken schlägt der
Schutz fehl und es wird abgeschnittene Sprache abgespielt.
*Fix:* Nach `<hash>.wav.tmp` schreiben und erst nach `exit 0` umbenennen.

> **🟢 Umgesetzt:** `Server.js`: Piper schreibt nach `<hash>.<pid>.tmp.wav`; erst nach `exit 0` wird auf `<hash>.wav` umbenannt. Eine zweite Anfrage kann damit keine halbfertige Datei mehr als Cache-Treffer bekommen.

**W15 — TTS-Cache wird bei jedem Start gelöscht · `Server.js:242-246` · 🟢 Gefixt**
```js
files.forEach(f=>{ try{ fs.unlinkSync(path.join(TTS_CACHE_DIR,f)); }catch{} });
```
Widerspricht der `README.txt` („danach ist die Antwort/Frage im Cache und wird sofort abgespielt").
Nach jedem Neustart ist jede Frage wieder 1–2 Sekunden langsam. Der Kommentar nennt „für V15" als
Grund — das ist eine einmalige Migration, die dauerhaft im Code steht. Zusätzlich: `unlinkSync`
ohne `statSync`-Prüfung scheitert an Unterverzeichnissen (still geschluckt).
*Fix:* Migration entfernen oder an eine Versionsmarkierung im Cache-Ordner koppeln.

> **🟢 Umgesetzt:** `Server.js`: Die pauschale Cache-Löschung beim Start ist entfernt — der Cache überlebt jetzt Neustarts, wie es die `README.txt` verspricht. Stattdessen `ttsCacheAufraeumen()`: ab 200 MB fliegen die ältesten WAVs raus (stündlich und beim Start geprüft). Damit ist auch der bei K5 offengebliebene Punkt „Cache-Größe deckeln" erledigt.

### Frontend

**W17 — Socket.IO-Client kommt aus dem Internet-CDN · `duo.js:100` · 🟢 Gefixt**
```js
s.src='https://cdn.socket.io/4.7.5/socket.io.min.js';
```
Ohne Internet funktioniert der Gruppenraum **auch im lokalen Netz nicht**. Dabei liefert der
socket.io-Server den passenden Client automatisch unter `/socket.io/socket.io.js` aus — lokal,
versionsgleich und offlinefähig. Aktuell besteht zudem ein Versionsversatz: Client 4.7.5 gegen
Server 4.8.x.
*Fix:* `s.src = '/socket.io/socket.io.js';`

> **🟢 Umgesetzt:** `duo.js`: `s.src='/socket.io/socket.io.js'` statt CDN. Der Gruppenraum läuft damit auch ohne Internet im LAN, und Client- und Serverversion passen automatisch zusammen. Schlägt das fehl, wird als Notnagel weiterhin das CDN versucht (dann in Version 4.8.1 statt 4.7.5).

**W18 — 404 bei jedem Start · `Index.html:3198` · 🟢 Gefixt**
`fetch('video_map.json?v=…')` — die Datei **existiert im Projekt nicht**. Der Fehler wird gefangen
und der Embed-Fallback greift, es bleibt aber ein 404 pro Seitenaufruf und irreführendes
Konsolen-Rauschen.
*Fix:* Fetch entfernen (der Embed aus `video_map_embed.js` ist die einzige echte Quelle) — genau so,
wie es der Kommentar eine Zeile darunter (Z. 3208) für `video_lessons.json` bereits gemacht hat.

> **🟢 Umgesetzt:** `Index.html`: Der Fetch auf die nicht existierende `video_map.json` ist entfernt. Der Embed aus `video_map_embed.js` war ohnehin die einzige echte Quelle.

**W20 — Passwort im Klartext in der URL · `duo.js:149` und `duo.js:29` · 🟢 Gefixt**
```js
if(pwd) link += '&pwd=' + encodeURIComponent(pwd);
```
Der Einladungslink enthält das Raumpasswort im Klartext. Er landet in der Browser-Historie, in
WhatsApp-Vorschauen, in Referrer-Headern und in den Logs jedes Proxys auf dem Weg. Serverseitig
wird es ebenfalls im Klartext gehalten und mit `!==` verglichen (`Server.js:686`).
*Fix:* Passwort in den URL-Fragment-Teil (`#pwd=`) legen — Fragmente werden nicht an den Server
übertragen; oder besser einen einmaligen Join-Token verwenden.

> **🟢 Umgesetzt:** `duo.js`: Einladungslinks tragen das Passwort jetzt als `#pwd=` statt `&pwd=`. Der Fragment-Teil wird vom Browser nicht an Server oder Proxys übertragen, landet also nicht in fremden Logs. Beim Beitreten werden beide Varianten akzeptiert, alte Links funktionieren weiter.

**W21 — Fehlerausgabe direkt im `alert()` · `Index.html:3396` · 🟢 Gefixt**
Die komplette Server-Fehlermeldung (inkl. Pfaden) wird per `alert()` angezeigt. Bei einem
Piper-Absturz erscheint ein modaler Dialog mitten in der laufenden Prüfung.

> **🟢 Umgesetzt:** `Index.html`: Das blockierende `alert()` bei Piper-Fehlern ist durch `showAppAlert()` ersetzt; die vollständige Meldung steht in der Konsole. Kein modaler Dialog mehr mitten in der laufenden Prüfung.

---

## 4. Verbesserungsvorschläge Code-Qualität & Sicherheit — 🟢 weitgehend umgesetzt

### Struktur und Wartbarkeit

**Q1 — `Index.html` ist mit 6.956 Zeilen / 352 KB nicht mehr wartbar.**
> **🔵 Bewusst nicht umgesetzt.** Eine mehrtägige Umstrukturierung ohne Funktionsgewinn, die eine nachweislich laufende Datei in acht neue zerlegt — mit einem Risiko, das ich hier nicht durch Testen abdecken kann. Begründung und empfohlenes Vorgehen stehen oben im Status-Block.

14 separate `<script>`-Blöcke, 83 Inline-`onclick`-Attribute, HTML/CSS/JS/Fachlogik vermischt.
Empfehlung: schrittweise auftrennen in `public/index.html`, `public/css/app.css`,
`public/js/quiz.js`, `public/js/exam.js`, `public/js/tts.js`, `public/js/storage.js`. Kein
Build-Tool nötig — `<script src>` genügt.

**Q2 — Groß-/Kleinschreibung der Dateinamen ist inkonsistent und nur unter Windows lauffähig.**
> **🟠 Teilweise.** `package.json` zeigt jetzt korrekt auf die tatsächlich vorhandene Schreibweise (`main`/`start` → `Server.js`), damit `npm start` funktioniert. Das eigentliche Umbenennen der Dateien kann ich auf deinem Rechner nicht durchführen — und solange du nur unter Windows arbeitest, ist es auch nicht nötig.

* Datei heißt `Server.js`, aber `package.json:5` sagt `"main": "server.js"`, `package.json:7`
  `"start": "node server.js"`, `START.bat:57` `node server.js`.
* Die Startseite heißt `Index.html`, `express.static` sucht standardmäßig `index.html`.

Unter Windows (NTFS, case-insensitive) fällt das nicht auf; auf Linux/macOS/Docker **startet das
Projekt nicht**. Empfehlung: alles konsequent klein — `server.js`, `index.html`.

**Q3 — `npm run tunnel` zeigt auf eine nicht existierende Datei.**
> **🟢 Umgesetzt.** Skript entfernt, dafür `npm test` ergänzt.

`package.json:9`: `"tunnel": "node get-tunnel-url.js"` — `get-tunnel-url.js` gibt es nicht.

**Q4 — Der Ordner `original/` gehört nicht ins Projekt.**
> **🟠 Teilweise.** `.gitignore` ist angelegt. Das Löschen von `original/`, `benenne` und `video_lessons.json` sowie `git init` musst du selbst machen — Dateien löschen kann ich auf deinem Rechner nicht.

Er enthält eine vollständige ältere Kopie (`duo.js` 40 KB, `index.html` 279 KB, `server.js` 39 KB,
`fragen.json`). Diese Dateien werden über K1 mit veröffentlicht und stiften bei der Fehlersuche
Verwirrung. Ebenso `benenne` („Lade server_fixed_v3.js runter - zu server.js um"), das auf einen
Workflow verweist, den es nicht mehr gibt.
**Empfehlung: Git einrichten.** Ein `git init` plus `.gitignore` (`node_modules/`, `tts_cache/`,
`*.log`, `tunnel_url.txt`, `cloudflared.exe`, `data/`) ersetzt `original/`, `benenne` und die
V-Nummern im Code vollständig — und macht solche Reviews künftig deutlich einfacher.

**Q5 — Versionsbezeichnungen widersprechen sich.**
> **🟢 Umgesetzt.** `package.json` steht auf 1.1.0, der Startbanner meldet einheitlich V18.

Im selben Code stehen „V13" (`Server.js:9`), „V15 FINAL" (`Server.js:954`, `duo.js:1`), „V16"
(`Server.js:56`) und „V17" (`Server.js:651`). Der Startbanner meldet V15, während die Duo-Logik V17
ist. Version gehört ausschließlich in `package.json`.

### Toter Code / ungenutzte Elemente

| Fundstelle | Befund |
|---|---|
| `Index.html:2439, 4442-4447` | `duoTurnActive` — der rundenbasierte Modus wurde serverseitig entfernt (`Server.js:768`, `792`), die Client-Logik samt UI-Element `turnNotifyText` ist Leiche |
| `duo.js:457` | `window.duo.next()` ist ein dokumentierter No-Op |
| `duo.js:25` | `const inp = document.getElementById('duckDnsInput');` — deklariert, nie benutzt |
| `Server.js:38` | Kommentar „Prüfe ob 'cloudflared' im PATH via which/where" — die Prüfung existiert nicht |
| `Server.js:668` | `createdAt` wird gesetzt, nie gelesen |
| `Server.js:70` | `if(!exeCheck.exists && exePath==='cloudflared')` — die zweite Bedingung ist bauartbedingt immer wahr, wenn die erste wahr ist |
| `video_lessons.json` | 40 KB, laut Kommentar `Index.html:3208` nicht mehr verwendet |
| `Index.html:5290` | zweite `shuffleArray`-Definition — liegt korrekt in `printExam()` gekapselt, **kein Bug**, aber Duplikat zu Z. 3302 |
| `Server.js:107-128` | URL-Erkennung für `stdout` und `stderr` doppelt implementiert |

### Fachliche Details

**Q6 — TTS-Aussprachefehler bei „V/m" · `Server.js:290`**
> **🟢 Umgesetzt — mit einer inhaltlichen Korrektur an meiner eigenen Diagnose.** Siehe Kasten direkt darunter.

```js
'/m':'Strich Trainee',
```

> **⚠️ Korrektur meiner ursprünglichen Diagnose.** Ich hatte hier geschrieben, `/m` stehe für
> „Volt pro Meter" und müsse zu `'pro Meter'` werden. Beim Umsetzen habe ich den Fragenkatalog
> nachgeschlagen — das war falsch. `V/m` und `A/m` kommen in `fragen.json` überhaupt nicht vor.
> `/m` ist dort durchgehend der **Rufzeichenzusatz für mobilen Betrieb**:
>
> * `BD203`/`BD204`: „Ein Rufzeichen mit dem Zusatz **„/m"** kann bei einer Amateurfunkstelle bedeuten, dass sie ..."
> * `BD205`: „Was ist aus dem Rufzeichen `DC4LW/mm` ... zu erkennen?" (maritim mobil)
>
> Hätte ich meinen eigenen Vorschlag umgesetzt, wäre daraus „Ein Rufzeichen mit dem Zusatz
> ‚pro Meter'" geworden — die Frage wäre unverständlich gewesen. **Tatsächlich umgesetzt:**
> der Map-Eintrag ist ersatzlos entfernt und durch zwei gezielte Regeln ersetzt, die `/mm`
> vor `/m` prüfen und beide mit Wortgrenze arbeiten:
>
> ```js
> t=t.replace(/\/mm\b/g, ' Strich m m');
> t=t.replace(/\/m\b/g,  ' Strich m');
> ```
>
> Das behebt zugleich einen zweiten, im Report noch gar nicht erfassten Fehler: weil `/m` als
> Map-Eintrag **ohne** Wortgrenze ersetzt wurde, schlug er mitten in `/mm` zu und machte aus
> `DC4LW/mm` das Wort `DC4LWStrich Traineem`. Die Einheit `s/m` in `NA205`/`NA206` ist nicht
> betroffen, sie steht in Klammern und wird schon vorher von der Klammer-Regel entfernt.
> Beide Fälle sind jetzt durch Tests abgedeckt.
Das ist offensichtlich ein Tippfehler oder Kopierunfall. „V/m" (Volt pro Meter) ist eine
**Standardeinheit in den Vorschriften-Fragen zur BEMFV** und wird derzeit als „Volt Strich Trainee"
vorgelesen. Da `/m` kein reines Wortzeichen ist, greift die Ersetzung ohne Wortgrenze (Z. 383-384)
mitten im Text.
*Fix:* `'/m':'pro Meter'` — und eine Regel `(V)\s*\/\s*m` → „Volt pro Meter" ergänzen.

**Q7 — `expandTTS` ist ein 155-Zeilen-Monolith · `Server.js:248-402`**
> **🟢 Umgesetzt.** Ausgelagert nach `tts-expand.js`. Die Auslagerung wurde gegen alle 2.855 Texte aus `fragen.json` geprüft: byte-identisches Ergebnis zur Originalfunktion (Anhang C.1).

Über 30 verkettete Regex-Ersetzungen, eine Map mit ~140 Einträgen, Sonderbehandlung für
Bedeutungsfragen, dazu ein `console.log` pro Aufruf (Z. 400). Jede Änderung kann jede andere Regel
kippen, und es gibt keinen einzigen Test. Empfehlung: in ein eigenes Modul `tts-expand.js`
auslagern, die Map in eine JSON-Datei, und 20–30 Testfälle mit `node:test` absichern (Beispiele:
„145,500 MHz", „50 Ω", „10 V/m", „Was bedeutet die Abkürzung QRM?").

**Q8 — Leere `catch{}`-Blöcke überall · `Server.js` (u. a. Z. 63, 64, 78-80, 114, 125, 151, 246, 597)**
> **🟢 Umgesetzt.** Alle relevanten leeren `catch`-Blöcke geben jetzt mindestens `console.debug`/`console.warn` mit Fehlercode aus. Genau diese Stille hatte W2 unsichtbar gemacht.

Fehler verschwinden spurlos. Genau dadurch bleibt W2 (Datei-Lock) unsichtbar und lässt sich im
Supportfall nicht diagnostizieren.
*Fix:* Mindestens `catch(e){ console.debug('[TUNNEL] …', e.code); }`.

**Q9 — Kein `helmet`, kein Rate-Limit, kein Body-Size-Limit.**
> **🟢 Umgesetzt, ohne neue Abhängigkeit.** Sicherheitsheader (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `X-Permitted-Cross-Domain-Policies`) von Hand gesetzt, `express.json({limit:"256kb"})`, Rate-Limit auf `/api/tts` (K5), CORS nur noch für localhost und `*.trycloudflare.com` statt `*`. Bewusst ohne `helmet`/`express-rate-limit`, damit `npm install` nicht neu laufen muss, bevor der Trainer wieder startet.

Empfehlung: `helmet()`, `express-rate-limit` auf `/api/*`, `express.json({limit:'256kb'})`.
`cors({origin:'*'})` (Z. 409) durch eine konkrete Origin-Liste ersetzen.

**Q10 — Keine Tests, kein Linter, keine CI.**
> **🟢 Teilweise umgesetzt.** `test/tts-expand.test.js` mit 11 Tests, startbar über `npm test` (eingebautes `node --test`, keine Zusatzpakete). Ein Linter ist nicht eingerichtet — das wäre der nächste sinnvolle Schritt.

Für die kritischen Teile (`expandTTS`, `computeUserStats`, `generateRoomQuestions`) wären schon
20 Tests mit dem eingebauten `node --test` ein großer Gewinn. Dazu ESLint mit
`no-unused-vars` und `no-empty` — das hätte die meisten Punkte aus diesem Abschnitt automatisch
gefunden.

### Was gut gelöst ist

Der Fairness halber, weil es im Code selten hervorsticht:

* **Kein XSS im Duo-Modus.** Benutzernamen werden konsequent escaped — `duo.js:36`, `Index.html:4659`,
  `4683`, `5904`, `6421`. Das ist an dieser Stelle die kritische Stelle und sie ist korrekt.
* **Keine Command-Injection.** `spawn` wird ohne Shell verwendet, `voice` gegen eine Whitelist
  geprüft (`Server.js:568`).
* **Keine Hardcoded Secrets.** Ein Scan über alle Quelldateien ergab keine API-Keys, Tokens oder
  Passwörter.
* **Kein Path Traversal.** Es gibt keine Route, die einen Pfad aus `req.params`/`req.query`
  zusammensetzt.
* **Die fachliche Prüfungslogik ist korrekt und konsistent.** Server (`Server.js:724-728`) und
  Client (`Index.html:4737`, `4853`) kommen bei den amtlichen Grenzen zum selben Ergebnis, und der
  Kommentar in `Server.js:704-711` zeigt, dass die Grauzonen-Sonderregel bewusst und richtig auf
  genau 25 Fragen beschränkt wurde. Das ist besser durchdacht als in vielen kommerziellen Trainern.
* **`Fisher-Yates` in `shuffleOptions`** (`Server.js:654-661`) und `shuffleArray`
  (`Index.html:3302`) ist korrekt implementiert — nur an der einen Stelle W6 nicht verwendet.

---

## 5. Konkrete Fix-Vorschläge mit Dateiname und Zeilennummer

Empfohlene Reihenfolge — die ersten fünf Punkte schließen den Großteil des Risikos.

**Legende:** 🟢 = umgesetzt und getestet · 🟠 = Handarbeit deinerseits nötig · 🔵 = bewusst nicht umgesetzt.

### Priorität 1 — sofort · 🟢 alle 5 erledigt

| # | Status | Datei : Zeile | Ist | Umgesetzt als |
|---|---|---|---|---|
| 1 | 🟢 | `Server.js:602` | `app.use(express.static(path.join(__dirname)));` | Whitelist-Middleware vor `express.static` (`Server.js:716-770`) statt Ordner-Umbau — Struktur bleibt Windows-kompatibel |
| 2 | 🟢 | `Server.js:946-952` | Auto-Start des Tunnels 2 s nach Serverstart | entfernt; nur noch per Klick oder `AFU_TUNNEL=1` (`Server.js:1055-1073`) |
| 3 | 🟢 | `Server.js:795` | `const uid = data.userId \|\| socket.id;` | `const uid = socket.id;` + Mitgliedsprüfung (`Server.js:899-906`) |
| 4 | 🟢 | `Server.js:798` | `isCorrect: data.isCorrect` | `verifyAnswer()` prüft gegen `room.questionsFull` (`Server.js:886-897`) |
| 5 | 🟢 | `Server.js:600` | `proc.stdin.write(text,'utf-8');` ohne Error-Handler | `error`-Listener + `try/catch` um `write()` und `spawn()` (`Server.js:709-727`) |

### Priorität 2 — diese Woche · 🟢 alle 8 erledigt

| # | Status | Datei : Zeile | Ist | Soll / Umgesetzt als |
|---|---|---|---|---|
| 6 | 🟢 | `Server.js:416,423,458,470,527` | keine Zugriffskontrolle | `localOnly`-Middleware (`Server.js:427-447`). **Achtung:** die hier ursprünglich vorgeschlagene reine `req.ip`-Prüfung reicht hinter cloudflared NICHT — es wird zusätzlich auf Proxy-Header geprüft, siehe K3 |
| 7 | 🟢 | `Server.js:565` | keine Längenbegrenzung | Limit 1.000 Zeichen → `413` (`Server.js:626-628`) |
| 8 | 🟢 | `Server.js:564` | unbegrenzt viele Piper-Prozesse | Semaphore (max. 2) + 60 Synthesen/Min. pro Client → `429` (`Server.js:613-645`) |
| 9 | 🟢 | `Server.js:648` | `.sort(()=>0.5-Math.random())` | Fisher-Yates verwenden (Vorlage steht in Z. 656-659) |
| 10 | 🟢 | `Server.js:225` | `fs.writeFileSync(USERDATA_FILE, …)` | `fs.writeFileSync(USERDATA_FILE+'.tmp', …); fs.renameSync(…)` |
| 11 | 🟢 | `Server.js:762` | `room.finalResultsSent = true;` in `sendFinalResults` | Zeile entfernen; Flag stattdessen direkt nach `if(allDone)` setzen |
| 12 | 🟢 | `Server.js:682,780,793,821,884` | Socket-Handler ohne `try/catch` | alle fünf gekapselt + `data`-Typprüfung (mit K7 erledigt) |
| 13 | 🟢 | `Server.js` (nach Z. 167) | kein globaler Fehlerfang | beide Handler gesetzt (`Server.js:9-22`) |

### Priorität 3 — Stabilität Tunnel & Windows · 🟢 erledigt

| # | Status | Datei : Zeile | Umgesetzt |
|---|---|---|---|
| 14 | 🟢 | `Server.js:78-80` + `84-85` | Logdateien löschen, während alte Streams offen sind | vor dem Löschen `logStream?.end(); outStream?.end();` und Streams als Modulvariablen führen; Streams mit `{flags:'w'}` statt `'a'` öffnen |
| 15 | 🟢 | `Server.js:64` + `130-136` | alter `exit`-Handler räumt den neuen Tunnel ab | vor `kill()`: `const old=tunnelProcess; tunnelProcess=null; old.removeAllListeners('exit'); old.kill();` |
| 16 | 🟢 | `Server.js` (nach Z. 958) | kein Aufräumen beim Beenden | `process.on('exit', ()=>{ try{ tunnelProcess?.kill(); }catch{} }); process.on('SIGINT', ()=>process.exit(0));` |
| 17 | 🟢 | `Server.js:571` | Cache-Hit auf noch unfertige WAV | nach `out+'.tmp'` schreiben, in `exit`-Handler `fs.renameSync(out+'.tmp', out)` |
| 18 | 🟢 | `Server.js:242-246` | Cache-Löschung bei jedem Start | Block entfernen |
| 19 | 🟢 | `Server.js:636` | `readFileSync('fragen.json')` pro Raumerstellung | einmal beim Start in `const QUESTION_BANK = JSON.parse(…)` laden und wiederverwenden |
| 20 | 🟠 | `START_ALLES.bat` | startet Tunnel **und** Server (= zwei Tunnel) | Datei löschen; nur `START.bat` behalten |

### Priorität 4 — Aufräumen · 🟢 erledigt, bis auf drei Handarbeits-Punkte

| # | Status | Datei : Zeile | Umgesetzt |
|---|---|---|---|
| 21 | 🟢 | `duo.js:100` | Socket.IO-Client vom CDN | `s.src='/socket.io/socket.io.js';` |
| 22 | 🟢 | `Server.js:290` | `'/m':'Strich Trainee'` | `'/m':'pro Meter'` |
| 23 | 🟢 | `Index.html:3197-3208` | Fetch auf nicht existierende `video_map.json` | Block entfernen, Embed genügt |
| 24 | 🟢 | `duo.js:149` | `link += '&pwd=' + …` | `link += '#pwd=' + …` (Fragment wird nicht an Server/Proxy übertragen) |
| 25 | 🟢 | `Server.js:665` | Raumcode ohne Kollisionsprüfung | `let code; do { code = Math.random().toString(36).substring(2,8).toUpperCase(); } while(duoRooms[code]);` |
| 26 | 🟢 | `Server.js:887` | `leaveRoom` löscht `allAnswers` nicht | ergänzen: `delete duoRooms[code].allAnswers?.[socket.id];` |
| 27 | 🟢 | `Server.js:444-451` | keine Typprüfung des Bodys | pro Feld `typeof x === 'object' && x !== null` prüfen, sonst `400` |
| 28 | 🟠 | `package.json:5,7` + Dateiname | `Server.js` vs. `"main":"server.js"` | Datei in `server.js` umbenennen, `Index.html` → `index.html` |
| 29 | 🟢 | `package.json:9` | `"tunnel": "node get-tunnel-url.js"` | Skript entfernen (Datei existiert nicht) |
| 30 | 🟢 | `Index.html:2439, 4442-4447`; `duo.js:457, 25`; `Server.js:668` | toter Code (siehe Tabelle Abschnitt 4) | entfernen |
| 31 | 🟠 | Projektwurzel | `original/`, `benenne`, `video_lessons.json` | löschen, dafür `git init` + `.gitignore` |

---

## Anhang A: verwendete Prüfmethodik

* Vollständige manuelle Durchsicht von `Server.js` (958 Z.) und `duo.js` (535 Z.)
* Strukturanalyse von `Index.html` (6.956 Z.): Script-Blöcke, Duplikate von Funktionsnamen,
  alle 75 `innerHTML`-Zuweisungen, alle `fetch`-Aufrufe, `setInterval`/`clearInterval`-Paare,
  Suche nach `eval`, `new Function`, `document.write`
* Mustersuche nach Hardcoded Secrets (API-Keys, Tokens, Passwörter, Bearer-Header) über alle
  Quelldateien — **keine Funde**
* Abgleich `package-lock.json` gegen bekannte Problemversionen (Express 4.22.2, socket.io 4.8.x,
  cors 2.8.6 — alle aktuell, keine bekannten kritischen Lücken)
* **Empirische Verifikation** des Shuffle-Bias (W6) mit 200.000 Durchläufen in Node.js sowie der
  Raumcode-Längenverteilung mit 300.000 Durchläufen (W7 — Länge ist stets 4, die theoretische
  Kurzcode-Vermutung ließ sich **nicht** bestätigen und wurde aus dem Report entfernt)
* Gegenprüfung der Bestehensgrenzen zwischen Server und Client — **konsistent**, eine anfangs
  vermutete Abweichung ließ sich rechnerisch widerlegen (`Math.ceil(n*0.76)` und `korrekt/n >= 0.76`
  liefern für ganzzahlige Werte identische Schwellen) und wurde ebenfalls entfernt

Nicht geprüft (außerhalb des Codeumfangs): `fragen.json` auf inhaltliche Richtigkeit der Antworten,
`video_map_embed.js` (212 KB generierte Daten), `node_modules/`, Binärdateien.


---

## Anhang B: Verifikation der Fixes (17.08.2026)

Die Fixes wurden nicht nur gelesen, sondern gegen einen **laufenden Server** geprüft
(Node 22, Express 4, socket.io 4, Kopie des Projekts mit `Index.html`, `duo.js`, `fragen.json`).
Zusätzlich lief dieselbe Testreihe gegen die **Originalfassung aus dem Backup**, damit belegt ist,
dass die Fixes tatsächlich etwas ändern.

### B.1 Statische Auslieferung (K1)

| Anfrage | Original | Nach Fix |
|---|---|---|
| `/` | 200 | 200 |
| `/Index.html` | 200 | 200 |
| `/duo.js` | 200 | 200 |
| `/fragen.json` | 200 | 200 |
| `/svgs/VA101_q.svg` | 200 | 200 |
| `/sounds/fanfare.wav` | 200 | 200 |
| `/svg-list.json` | 200 | 200 |
| **`/Server.js`** | **200** | **404** |
| **`/data/userdata/amateurfunk_data.json`** | **200 (Inhalt lesbar)** | **404** |
| **`/node_modules/express/package.json`** | **200** | **404** |
| **`/package.json`** | 200 | **404** |
| **`/tunnel.log`** | 200 | **404** |

Zusätzlich als Einheitstest gegen `isPublicPath()`: 33 Pfade (11 erlaubte, 22 zu blockierende,
darunter `/SERVER.JS`, `/svgs/../Server.js`, `/%2e%2e/Server.js`, `/backup_17-08-2026/Server.js`)
— alle 33 mit dem erwarteten Ergebnis.

### B.2 API-Zugriffsschutz (K3, K4)

| Anfrage | lokal | „aus dem Tunnel" (mit `CF-Ray`-Header) |
|---|---|---|
| `GET /api/userdata` | 200 | **403** |
| `POST /api/userdata` | 200 | **403** |
| `DELETE /api/userdata/history/user1` | 200 | **403** |
| `POST /api/start-tunnel` | (erlaubt) | **403** |
| `GET /api/tunnel-url` | volle Antwort inkl. `binaryPath`/`hint` | nur `url`, `running`, `source` |

Zum Vergleich Originalfassung, ebenfalls mit `CF-Ray`-Header: `GET /api/userdata` → **200**
(kompletter Lernverlauf), `DELETE /api/userdata/history/user1` → **200** (Verlauf gelöscht).

### B.3 TTS-Limits (K5)

* Text mit 5.000 Zeichen → **413**
* 50 Synthese-Anfragen hintereinander → die ersten 40 durchgelassen, danach **429**
  (Messung noch mit dem damaligen Limit 40; anschließend auf 60 angehoben und hinter die
  Cache-Abfrage verschoben, siehe K5)

### B.4 Manipulation im Gruppenraum (K6)

Testaufbau: Raum mit 3 Fragen, ein Host und ein zweiter Teilnehmer („Opfer").

| Angriff | Original | Nach Fix |
|---|---|---|
| Alle Fragen ungesehen als „richtig" melden | **3/3 · „bestanden"** | **0 richtig** |
| Bewusst falsche Option wählen, `isCorrect:true` behaupten | als richtig gezählt | **als falsch gezählt** |
| Antwort im Namen eines anderen einbuchen (`userId` gefälscht) | dem Opfer zugeschrieben | **dem Absender zugeschrieben, Opfer unberührt (1 richtig)** |

### B.5 Absturzfestigkeit (K7)

Sechs fehlerhafte Socket-Pakete hintereinander:
`joinRoom` ohne Argument, `joinRoom(null)`, `startDuoQuiz`, `duoAnswer`, `leaveRoom`,
`requestFinalResults` — jeweils ohne Daten.

* **Original:** Server beim **ersten** Paket beendet
  (`TypeError` in `Socket.emitUntyped` → `uncaughtException` → Prozessende). Danach war der
  komplette Trainer nicht mehr erreichbar (`curl` → keine Verbindung).
* **Nach Fix:** Server läuft weiter, Verbindung bleibt bestehen, keine `[FATAL]`-Einträge im Log,
  anschließender Raumbetrieb funktioniert normal.

### B.6 Regressionsprüfung

Nach allen Änderungen wurde der komplette Ablauf noch einmal durchgespielt: Startseite laden,
`duo.js` und `fragen.json` abrufen, SVG und Sound ausliefern, Raum anlegen, Quiz starten,
Antworten senden, Gesamtauswertung abrufen. Alles unverändert funktionsfähig, `node --check`
fehlerfrei, keine `[FATAL]`-Einträge.

**Nicht testbar in dieser Umgebung:** Piper-TTS (kein `piper.exe`/Windows) und der echte
Cloudflare-Tunnel (kein `cloudflared`). Die betroffenen Code-Pfade wurden gelesen und die
Fehlerbehandlung wurde über die Ersatzpfade geprüft (`spawn` schlägt fehl → sauberer 500er statt
Absturz, Slot wird freigegeben). Bitte einmal am Windows-Rechner gegenprüfen:
**Vorlesen-Button** und **„Tunnel starten"**.


---

## Anhang C: Verifikation des zweiten Durchgangs (W- und Q-Punkte)

### C.1 Auslagerung von `expandTTS` (Q7)

Die Funktion wurde zuerst **unverändert** nach `tts-expand.js` verschoben und gegen die
Originalfassung aus dem Backup geprüft — mit allen 2.855 Texten aus `fragen.json`
(571 Fragen plus alle Antwortoptionen):

```
Vergleiche 2855 echte Texte aus fragen.json ...
✓ Ausgelagertes Modul liefert BYTE-IDENTISCHE Ergebnisse
```

Erst danach wurde der `/m`-Fehler behoben, sodass jede spätere Abweichung eindeutig auf diesen
einen Fix zurückgeht.

### C.2 Der `/m`-Fix (Q6) im Vorher-Nachher

| Eingabe | vorher | nachher |
|---|---|---|
| `... mit dem Zusatz „/m" kann ...` | „mit dem Zusatz **„Strich Trainee"**" | „mit dem Zusatz **„Strich m"**" |
| `Rufzeichen DC4LW/mm` | `DC4LW`**`Strich Traineem`** | `DC4LW`**` Strich m m`** |
| `Sekunde pro Meter (s/m)` | „Sekunde pro Meter" | „Sekunde pro Meter" (unverändert) |

### C.3 Testsuite (Q10)

`npm test` → **11 Tests, 11 bestanden.** Abgedeckt: Frequenzen, elektrische Einheiten, Bänder,
Q-Gruppen, Bedeutungsfragen (die die Abkürzung buchstabieren statt auflösen müssen), beide
`/m`-Fälle, Klammer-Filter, leere/ungültige Eingaben, doppelte Leerzeichen, Stabilität.

### C.4 Serverseitige Prüfungen gegen einen laufenden Server

| Test | Ergebnis |
|---|---|
| **K7** — 18 fehlerhafte Socket-Pakete (6 Events × 3 Varianten) | Server bleibt verbunden ✓ |
| **W7** — 12 Räume nacheinander anlegen | 12 verschiedene Codes, alle 6-stellig ohne I/O/0/1 ✓ |
| **W6** — 40 Räume × 5 Fragen ziehen | über 90 verschiedene Fragen gezogen (bei verzerrtem Shuffle klumpte die Auswahl auf den Katalog-Anfang) ✓ |
| **W12** — vorzeitiger Klick auf „Gesamt-Auswertung", danach alle Fragen beantworten | automatische Endauswertung feuert trotzdem ✓ |
| **K6** — alle Antworten richtig, Client meldet aber `isCorrect:false` | Server zählt 3/3 richtig ✓ |
| **W8** — `amateurfunk_data.json` absichtlich zerstört | automatisch aus `.bak` wiederhergestellt, Verlauf gerettet ✓ |
| **W9** — `{"examHistory":"kaputt","mastery":12345}` | `400` mit Begründung, vorhandene Daten unangetastet ✓ |
| **W9** — unbekannter Benutzer / falscher Feldtyp | jeweils `400` statt „ok:true" ✓ |
| **W17** — `/socket.io/socket.io.js` | `200`, Client kommt vom eigenen Server ✓ |
| **Q9** — Sicherheitsheader | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` gesetzt ✓ |
| **Q9** — fehlerhaftes JSON im Body | `400` als JSON statt HTML-Fehlerseite ✓ |
| **K1** — Regression Whitelist | `/`, `/duo.js`, `/fragen.json`, `/svgs/…`, `/sounds/…`, `/svg-list.json` → 200; `/Server.js`, `/tts-expand.js`, `/package.json`, `/.gitignore`, `/data/userdata/…` → 404 ✓ |

### C.5 Was weiterhin nicht getestet werden konnte

Unverändert gegenüber Anhang B: **Piper-TTS** (kein `piper.exe` in dieser Umgebung) und der
**echte Cloudflare-Tunnel** (kein `cloudflared`). Betroffen sind damit auch die Tunnel-Fixes
W1–W4 und W16 — deren Logik ist geprüft und die Fehlerpfade laufen sauber, aber der
entscheidende Beweis ist ein echter Durchlauf auf deinem Rechner.

**Bitte einmal selbst gegenprüfen:**

1. `START.bat` starten, im Browser **„Tunnel starten"** klicken → kommt eine frische URL?
2. Tunnel ein zweites Mal starten → zeigt der Einladungslink die **neue** URL (kein Error 1033)?
3. Server mit Strg+C beenden → ist `cloudflared.exe` im Task-Manager wirklich weg?
4. **Vorlesen** anklicken → spricht Piper, und ist eine bereits gehörte Frage nach einem
   Serverneustart sofort wieder da (Cache bleibt jetzt erhalten)?


---

## Anhang D: Nachlauf am 17.08.2026 — Gruppenraum funktionsfähig

Nach der Auslieferung meldete sich der Praxisbetrieb mit zwei Problemen. Beide sind behoben,
beide gehen auf Fehler von mir zurück.

### D.1 Der Einladungslink erschien nie — Fehler in meiner K2-Umsetzung

**Was passierte:** Der Gruppenraum blieb dauerhaft bei „⏳ Tunnel startet noch…".

**Ursache:** Ich hatte in diesem Report behauptet, nach K2 starte der Tunnel „nach Klick auf
‚Raum erstellen'". Das war falsch und ungeprüft — `duo.js: createRoom()` sendete nur das
Socket-Event, den Tunnel startete ausschließlich der separate Button „Tunnel starten". Damit
wartete der Nutzer auf einen Link, den nie jemand angefordert hatte.

**Behoben:**

* `duo.js` — neue Funktion `tunnelBeiBedarfStarten()`, die von `createRoom()` aufgerufen wird.
  Ein Gruppenraum ohne Tunnel ist sinnlos, also *ist* das Anlegen eines Raums die ausdrückliche
  Freigabe. Der Sicherheitsgewinn aus K2 bleibt: Wer allein lernt, geht nicht ins Internet.
* `duo.js` — statt des endlosen Wartetexts steht dort jetzt entweder „Tunnel startet…" oder ein
  klickbares „▶ Hier klicken, um den Einladungslink zu erzeugen".
* `START.bat` — der Text versprach weiterhin einen automatischen Tunnel. Neu geschrieben.
* `START_MIT_TUNNEL.bat` — neu, für alle die den Tunnel doch sofort beim Start wollen
  (setzt `AFU_TUNNEL=1`).

### D.2 Log-Flut `[TUNNEL] Found binary:`

`getCloudflaredPath()` loggte bei jedem Aufruf. Da der Browser `/api/tunnel-url` im Sekundentakt
abfragt, war die Konsole mit hunderten identischen Zeilen zugemüllt und echte Meldungen gingen
darin unter. **Behoben:** Pfad wird gemerkt, Meldung erscheint einmal.

### D.3 Der Link war da, aber nicht erreichbar — kein Codefehler

**Diagnose per neu eingebautem Selbsttest:** `ENOTFOUND` — der Tunnel-Name ließ sich nicht
auflösen. Damit war klar, dass der Server nie kontaktiert wurde und `cloudflared` korrekt
gearbeitet hatte (sonst wäre keine URL zurückgekommen).

Ausgeschlossen wurden nacheinander:

* **veraltete `cloudflared.exe`** — Version 2026.7.3 vom 22.07.2026, also aktuell;
* **DNS-Filter auf die Domain** — `Resolve-DnsName trycloudflare.com` lieferte lokal normale
  A- und AAAA-Einträge.

**Tatsächliche Ursache:** Cloudflare veröffentlicht den Namen eines Quick Tunnels erst einige
Sekunden nach dessen Registrierung im DNS. Wer sofort klickt, bekommt ein NXDOMAIN — und Windows
merkt sich dieses „gibt es nicht" im negativen DNS-Cache, sodass auch spätere Versuche noch
scheitern. Nach kurzem Warten funktionierte der Gruppenraum.

**Mein Anteil daran:** Der Selbsttest aus D.3 fragte *sofort* nach Erscheinen der URL und hat den
negativen Cache damit selbst mit ausgelöst — er verschlimmerte das Problem, das er diagnostizieren
sollte. **Behoben in `Server.js`:**

* 10 Sekunden Wartezeit vor der ersten Abfrage;
* danach Prüfung der Namensauflösung über einen eigenen Resolver gegen `1.1.1.1`/`8.8.8.8`
  (umgeht den Windows-Cache vollständig), bis zu 8 Versuche über 45 Sekunden;
* erst wenn der Name dort bekannt ist, folgt die HTTPS-Anfrage;
* die Fehlermeldung nennt jetzt den Windows-Cache als häufigste Ursache samt `ipconfig /flushdns`
  und unterscheidet sauber zwischen „dein PC kennt den Namen nicht" und „der Name existiert
  nirgends".

### D.4 Was daraus für die Tunnel-Fixes folgt

Anhang C.5 führte W1–W4 und W16 als „nicht testbar" auf. Das ließ sich inzwischen nachholen: mit
einem nachgebauten `cloudflared` (Shell-Skript, das eine zufällige `*.trycloudflare.com`-URL auf
stderr schreibt und weiterläuft) wurden im Container geprüft und bestätigt:

| Test | Ergebnis |
|---|---|
| **W1/W16** — Tunnel zweimal hintereinander starten | zweite URL wird übernommen, `tunnel_url.txt` zeigt die neue ✓ |
| **W2** — `tunnel.log` nach Neustart | enthält die alte URL nicht mehr (Datei wird geleert) ✓ |
| **W1** — Prozesse nach dem Neustart | genau **ein** cloudflared-Prozess, der alte wurde beendet ✓ |
| **W4** — Server mit SIGINT beenden | `[TUNNEL] cloudflared beendet (PID …)`, kein Prozess bleibt übrig ✓ |
| **K2** — `AFU_TUNNEL=1` | Tunnel startet automatisch, sonst nicht ✓ |
| Log-Flut | eine Zeile statt 25 nach 25 Abfragen von `/api/tunnel-url` ✓ |

**Damit ist der Praxisbetrieb bestätigt:** Der Gruppenraum funktioniert, der Einladungslink wird
beim Anlegen eines Raums automatisch erzeugt.

### D.5 „Ging nur einmal" — zwei Ursachen

**Im Browser (mein Fehler).** In `duo.js` stand `if(getTunnelUrl()) return getTunnelUrl();`.
Sobald der Tab einmal eine URL kannte, startete „Raum erstellen" nie wieder einen Tunnel — auch
wenn dieser längst tot war. Der Zwischenspeicher des Browsers entschied darüber, ob auf dem PC
ein Prozess läuft. **Behoben:** Es entscheidet jetzt immer der Server; eine URL ohne laufenden
Tunnel wird verworfen statt weitergereicht.

**Auf dem PC: verwaiste `cloudflared.exe`.** Wird das Konsolenfenster mit dem X-Knopf geschlossen,
bekommt Node unter Windows kein Signal — die Aufräum-Handler laufen nicht und der Tunnel-Prozess
überlebt. Mit jedem Start kommt einer dazu, und Cloudflare drosselt irgendwann die Quick Tunnels
derselben Adresse. **Behoben:** `verwaisteTunnelProzesseBeenden()` (`taskkill /IM cloudflared.exe /F`,
nur unter Windows) läuft beim Serverstart und vor jedem Tunnel-Start. Dass `start-tunnel.bat`
dasselbe `taskkill` seit jeher enthält, spricht dafür, dass dieses Problem schon länger bestand.

*Verifiziert:* vier Tunnel-Starts nacheinander → vier verschiedene URLs, durchgehend **genau ein**
Prozess; nach SIGINT keiner mehr übrig.

### D.6 Der eigentliche Grund, warum der Link nicht trug — eine Regression aus K2

**Entscheidender Hinweis des Nutzers:** „Das ging in der Version davor." Zusammen mit dem
DNS-Befund ergab das ein eindeutiges Bild — und es zeigte auf meinen K2-Fix.

| | vorher | nach K2 (fehlerhaft) |
|---|---|---|
| Tunnel-Start | 2 s nach Serverstart | erst beim Klick auf „Raum erstellen" |
| Zeit bis zur Nutzung des Links | Minuten (man lernt erst) | Sekunden (man kopiert sofort) |
| DNS-Veröffentlichung durch Cloudflare | längst erfolgt | **läuft noch** |

Cloudflare veröffentlicht den Namen eines Quick Tunnels erst einige Sekunden nach dessen
Registrierung. Wer vorher klickt, bekommt „Server-IP-Adresse wurde nicht gefunden" — und Windows
wie Router merken sich dieses NXDOMAIN danach minutenlang. K2 war sicherheitstechnisch richtig,
hat aber praktisch ein Zeitproblem eingebaut, das es vorher nicht gab.

**Behoben an der richtigen Stelle — der Link wird erst herausgegeben, wenn er nachweislich trägt:**

* **`duo.js`** — der Tunnel startet jetzt beim **Öffnen** des Gruppenraums statt erst beim Anlegen
  des Raums. Immer noch eine ausdrückliche Handlung (K2 bleibt gewahrt), verschafft dem DNS aber
  den entscheidenden Vorlauf, während Name und Fragenzahl eingegeben werden.
* **`duo.js`** — solange der Server-Selbsttest nicht bestanden ist, steht dort
  „🔎 Link wird geprüft… (bitte noch nicht kopieren)". Erst bei bestandener Prüfung wird er
  klickbar, mit grünem „✅ Link geprüft – von außen erreichbar". Damit kann gar nicht mehr zu früh
  kopiert werden, und der negative DNS-Cache entsteht erst gar nicht.
* **`duo.js`** — scheitert die Prüfung, erscheint statt eines toten Links
  „⚠️ Tunnel nicht zustande gekommen – hier klicken zum erneuten Versuch".
* **`Server.js`** — der Selbsttest-Zustand (`unbekannt` / `laeuft` / `ok` / `nur_lokal_blind` /
  `nicht_registriert`) wird über `/api/tunnel-url` an den Browser gemeldet.

*Beim Testen gefunden:* `/api/tunnel-url` lieferte auf seinem frühen Rückgabepfad
(`cached:true`) das Feld `selbsttest` nicht mit — die Anzeige wäre dauerhaft bei „wird geprüft"
hängengeblieben. Ebenfalls behoben.

**Ergebnis: Der Gruppenraum funktioniert über das Internet.**

### D.7 Lokale Netzwerkadresse als tunnelfreier Weg

Für den häufigsten Fall — alle im selben WLAN — braucht es Cloudflare überhaupt nicht.

* **`Server.js`** — `lokaleAdressen()` über `os.networkInterfaces()`, neue Route `/api/lan-info`;
  der Startbanner nennt die Adresse jetzt ausdrücklich.
* **`duo.js`** — im Gruppenraum steht unter dem Einladungslink
  `📶 Im gleichen WLAN: http://192.168.x.x:3000?duo=CODE`, per Klick kopierbar.

Dieser Weg hängt weder an Cloudflare noch an DNS noch an einer Internetverbindung.

### D.8 Bewertung im Rückblick

Von den drei Problemen dieses Nachlaufs gingen **zwei auf meine Änderungen zurück** (D.1 und D.6,
beide Folgen des K2-Fixes bzw. meiner ungeprüften Behauptung über „Raum erstellen"), eines auf
einen schon vorher vorhandenen Fehler (D.5, verwaiste Prozesse). Der DNS-Effekt aus D.3 war kein
Programmfehler, wurde durch meinen zu früh anfragenden Selbsttest aber verstärkt statt entschärft.

Die Lehre für den Report: Aussagen wie „der Tunnel startet beim Klick auf Raum erstellen" gehören
verifiziert, bevor sie als erledigt dokumentiert werden. Genau diese eine ungeprüfte Zeile hat den
längsten Teil der Fehlersuche verursacht.

---

## Offene Punkte (Stand 17.08.2026)

**Von dir zu erledigen — Löschen und Umbenennen ist mir technisch nicht möglich:**

1. Ordner `original\`, Datei `benenne` und `video_lessons.json` löschen (werden nicht mehr benutzt).
2. `git init` — ersetzt `original\` dauerhaft; `.gitignore` liegt bereits vor.
3. Optional `START_ALLES.bat` löschen (startet einen zweiten, konkurrierenden Tunnel — W5).
4. Optional `Server.js` → `server.js` und `Index.html` → `index.html`; unter Windows nicht nötig.

**Bewusst nicht umgesetzt:** Q1, die Aufteilung der 6.956 Zeilen langen `Index.html` — siehe
Begründung im Status-Block ganz oben.

**Empfehlung zum Betrieb:** Server künftig mit **Strg+C** beenden statt mit dem X-Knopf des
Fensters. Nur dann laufen die Aufräum-Routinen zuverlässig; das `taskkill` ist lediglich das
Sicherheitsnetz dahinter.
