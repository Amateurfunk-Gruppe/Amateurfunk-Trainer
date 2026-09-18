# Installation

Der Amateurfunk-Trainer läuft auf **Windows, Linux und macOS**. Es gibt
zwei Wege, keinen dritten: unter Windows ein Archiv zum Auspacken, unter
Linux und am Mac einen Befehl im Terminal.

![Installation — zwei Wege](bilder/13-installation.png)

---

## Windows

**Keine Konsole nötig, kein Installationsprogramm.**

1. Auf der Projektseite rechts unter [Releases](../../releases) liegt
   `Amateurfunk-Trainer-<Version>-windows.zip` — die **große Datei, rund
   340 MB**. Herunterladen.

   > **Nicht** die beiden Einträge *Source code (zip)* und *Source code
   > (tar.gz)* weiter unten auf derselben Seite, und auch nicht den grünen
   > Knopf *Code → Download ZIP* auf der Projektseite. Das ist der
   > Quelltext — ohne Node, ohne die Module des Servers, ohne Stimmen. Wer
   > ihn auspackt, bekommt beim Start die Frage nach Node.js, und danach
   > passiert beim Doppelklick nichts mehr. Seit 1.298.0 sagt `START.bat`
   > das im Klartext; vorher blieb es stumm.

2. Meldet der Browser, die Datei werde *„nicht häufig heruntergeladen"*:
   auf *Behalten* gehen. Das ist keine Virenmeldung — Windows kennt die
   Datei nur noch nicht.
3. Rechtsklick auf das ZIP → *Eigenschaften* → unten bei *Sicherheit* den
   Haken bei **Zulassen** → *OK*. Das erspart die nächste Warnung: Windows
   merkt sich bei heruntergeladenen Dateien, dass sie aus dem Netz stammen,
   und vererbt das beim Auspacken an jede Datei darin.
4. Auspacken — auf den Schreibtisch, nach *Dokumente* oder auf einen
   USB-Stick. **Nicht** nach `C:\Program Files`: dort darf der Trainer
   seinen Lernstand nicht speichern.
5. Im ausgepackten Ordner `START.bat` doppelklicken. Der Trainer öffnet
   sich im Browser unter `localhost:3000`.

Fertig. Node.js liegt im Unterordner `node\`, die Sprachausgabe samt der
Stimme „Thorsten" und die amtlichen PDF sind ebenfalls dabei.
**An Windows selbst wird nichts installiert und nichts geändert**, keine
Administratorrechte, keine Spuren in der Registrierung. Zum Entfernen
genügt es, den Ordner zu löschen. Eine Internetverbindung braucht das
Einrichten nicht.

**Beenden:** `STOP.bat` doppelklicken, oder im Trainer oben rechts auf
*Beenden*. Ein geschlossenes Browserfenster allein beendet ihn nicht.

> **Warum kein Setup mehr?** Auf Windows-11-Rechnern mit *Smart App
> Control* wurde das Installationsprogramm abgewiesen, bevor es anfing
> („Fehler 4551"). Jedes Setup packt sich beim Start in den Temp-Ordner
> aus, und genau das lässt die Richtlinie bei einem Programm ohne gekaufte
> Unterschrift nicht zu. Ein Archiv wird nur ausgepackt.

> **Offizielle Fassungen gibt es ausschließlich hier unter Releases.** Für
> Archive aus anderen Quellen kann ich nicht sagen, was darin steckt.

---

## Linux und macOS

**Terminal öffnen** — unter Linux `Strg` + `Alt` + `T`, am Mac
`Cmd` + `Leertaste` und `Terminal` tippen. Dann diese eine Zeile einfügen
und Eingabe drücken:

```bash
curl -fsSL https://raw.githubusercontent.com/Amateurfunk-Gruppe/Amateurfunk-Trainer/HEAD/installieren.sh | bash
```

Das Skript macht der Reihe nach:

1. **Node.js und git prüfen** — und, wenn sie fehlen oder Node älter als 18
   ist, mit dem Paketverwalter des Systems nachinstallieren (apt, dnf,
   pacman, zypper, apk oder Homebrew). Geht das nicht, sagt es, was von Hand
   zu tun ist, und bricht sauber ab.
2. **Den Trainer von GitHub holen** — nach `~/Amateurfunk-Trainer`.
3. **Die Abhängigkeiten einrichten** — `npm install`; es sind drei Pakete
   (express, cors, socket.io).
4. **Die beiden Hilfsprogramme holen** — **Piper** für die Sprachausgabe und
   **cloudflared** für den Gruppenraum übers Internet. Passend zu System und
   Prozessor: Linux x86-64, ARM64 und ARMv7 ebenso wie macOS mit Intel oder
   Apple Silicon.
5. **Eine Verknüpfung auf den Schreibtisch legen** — unter Linux eine
   `.desktop`-Datei (die zusätzlich im Anwendungsmenü auftaucht), am Mac ein
   `Amateurfunk-Trainer.app`.

**Danach:** Doppelklick auf die Verknüpfung. Fragt der Linux-Schreibtisch
beim ersten Mal nach, *Starten erlauben* wählen — das ist bei selbst
angelegten Verknüpfungen normal.

### Lieber erst hineinsehen

`| bash` führt aus, was gerade heruntergeladen wurde. Das ist der
verbreitete Weg (Homebrew macht es genauso), aber wer es lieber prüft, macht
es in zwei Schritten:

```bash
curl -fsSL https://raw.githubusercontent.com/Amateurfunk-Gruppe/Amateurfunk-Trainer/HEAD/installieren.sh -o installieren.sh
less installieren.sh        # ansehen, mit q wieder raus
bash installieren.sh
```

Das Skript ist rund 250 Zeilen und durchgehend deutsch kommentiert.

### Wenn etwas anders liegen soll

```bash
# anderer Zielordner
AFU_ZIEL=/opt/afu-trainer bash installieren.sh

# ohne Piper und cloudflared - später im Trainer nachholbar
AFU_OHNE_HILFSPROGRAMME=1 bash installieren.sh
```

### Auffrischen

**Derselbe Befehl.** Ein zweiter Aufruf holt nur die Neuerungen
(`git pull`), richtet neue Abhängigkeiten ein und lässt alles andere in
Ruhe. **Der Lernstand in `data/` wird dabei nie angefasst** — weder beim
Auffrischen noch beim Einrichten.

### Ohne git

Wer kein git benutzen möchte: auf der Projektseite **Code → Download ZIP**,
entpacken, und im entpackten Ordner:

```bash
npm install
chmod +x START.sh STOP.sh
./START.sh
```

Teilnehmer eines Gruppenraums finden dieselben Dateien hinter dem Knopf
**Trainer herunterladen**.

---

## Nach dem Start

Der Trainer läuft im Browser unter **http://localhost:3000**; `START.sh`
öffnet ihn selbst.

**Beenden:** `./STOP.sh`, oder `Strg` + `C` im selben Fenster. Unter Windows
`STOP.bat` oder `Strg` + `C`. `STOP.sh` beendet dabei **nur, was aus diesem
Ordner heraus läuft** — anders als die Windows-Fassung, die pauschal jedes
`node` beendet; auf einem Linux-Rechner läuft nebenher oft anderes mit.

**Der Lernstand liegt in `data/`.** Für den Umzug auf einen anderen Rechner:
im Trainer auf *Sichern* klicken, die entstandene
`...-Lernstand_<Datum>.json` mitnehmen und drüben mit *Einlesen* einlesen.

**Die Hilfsprogramme nachträglich holen** — falls Schritt 4 übersprungen
wurde oder fehlschlug: **Einstellungen → Wartung → Hilfsprogramme → Holen**.
Von der Konsole geht es auch:

```bash
node programme_holen.js alles          # oder: piper / cloudflared
```

Beide sind **freiwillig** — ohne sie fällt jeweils genau eine Funktion weg,
der Trainer läuft im Übrigen vollständig:

| | wofür | ohne es |
|---|---|---|
| **Piper** | die Sprachausgabe | es wird nicht vorgelesen |
| **cloudflared** | der Tunnel für den Gruppenraum | der Raum bleibt im eigenen Netz |

Nach Piper fehlt noch eine **Stimme**: der Knopf *Stimmen hinzufügen* unter
*Einstellungen → Nachteilsausgleich* holt sie.

---

## Wenn etwas klemmt

**Windows: Beim ersten Start kommt die Frage nach Node.js** — obwohl laut
Anleitung alles dabei sein soll. Dann ist es nicht das Windows-Archiv,
sondern der Quelltext (*Source code (zip)* oder *Code → Download ZIP*),
oder das Archiv wurde nur zum Teil ausgepackt. Erkennbar daran, dass im
Ordner `node\`, `node_modules\` und `piper\` fehlen und er nur wenige
Dutzend MB groß ist statt rund 450. Abhilfe: unter Releases die Datei
`Amateurfunk-Trainer-<Version>-windows.zip` laden und die auspacken.

**Windows: Nach dem Doppelklick auf `START.bat` passiert nichts** — kein
Browser, keine Meldung. Seit 1.298.0 sieht `START.bat` selbst nach und
sagt, wenn der Server gleich wieder ausgegangen ist. Kommt trotzdem
nichts: `Fehler-Zeigen.bat` im Trainer-Ordner doppelklicken. Sie startet
den Server in einem Fenster, das offen bleibt — dort steht der Grund. Das
Fenster abfotografieren und als [Issue](../../issues) schicken, dann ist
die Ursache schnell geklärt.

**`curl: command not found`** — selten, aber möglich. Dann
`sudo apt install curl` (bzw. `dnf`, `pacman`, `zypper`), oder das Skript
über *Code → Download ZIP* holen.

**Das Skript bricht bei Node.js ab** — die Fassung der Distribution ist zu
alt. Der offizielle Weg für Debian und Ubuntu:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

Danach das Installationsskript noch einmal aufrufen.

**„In … liegt schon etwas, das kein Trainer aus git ist"** — im Zielordner
liegt bereits etwas anderes. Umbenennen, oder mit `AFU_ZIEL=<Pfad>` einen
anderen Ort wählen.

**`EADDRINUSE` oder „Port 3000 belegt"** — es läuft schon ein Trainer.
Entweder ist er im Browser bereits offen, oder ein alter Lauf hängt noch:
`./STOP.sh`.

**`./START.sh: Permission denied`** — `chmod +x START.sh STOP.sh`.

**`npm install` bricht ab** — meist kein Netz oder ein Firmen-Proxy
dazwischen.

**Es wird nicht vorgelesen** — Piper fehlt, siehe oben.

**Die Verknüpfung tut nichts (Linux)** — einmal mit der rechten Maustaste
darauf, *Starten erlauben*. Manche Schreibtische verlangen das bei selbst
angelegten `.desktop`-Dateien.

---

## Was geprüft ist und was nicht

Das Installationsskript ist **unter Linux durchgetestet** — Ersteinrichtung,
zweiter Aufruf zum Auffrischen, belegter Zielordner, fehlendes Node.js,
Verknüpfung und Anwendungsmenü. **Windows** läuft im täglichen Gebrauch.

**macOS ist seit dem 17.09.2026 auf echter Hardware gelaufen** — ein
Mac-Nutzer hat das Mac-ZIP unter macOS 15.7.9 mit Safari 26.6
ausprobiert. Der Trainer lief; eine Sache kam dabei heraus und ist
behoben: Das Zeichen der App hüpfte rund anderthalb Minuten im Dock, weil
der `.app` im Paket der Eintrag `LSUIElement` fehlte. Die App hat keine
eigene Oberfläche (die steht im Browser), also darf sie auch kein
Dock-Zeichen haben. Weitere Rückmeldungen von Mac-Rechnern sind
willkommen.
