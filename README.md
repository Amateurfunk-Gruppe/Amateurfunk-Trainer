<p align="center">
  <img src="bilder/github-vorschau.png" alt="Amateurfunk-Trainer — der komplette Fragenkatalog der Bundesnetzagentur mit Prüfungssimulator, Hörbuch und Gruppenraum" width="900">
</p>

# Amateurfunk-Trainer

Ein Lernprogramm für die deutsche Amateurfunkprüfung — **Klasse N, E und A**.
Läuft auf dem eigenen Rechner, ohne Konto, ohne Internetzwang, ohne Werbung.

Der Lernfortschritt bleibt dort, wo er entsteht: auf dem eigenen Rechner.

Entwickelt von **Dietmar Reh**. Kostenfrei für Lernende, Ortsverbände und
Volkshochschulen — [Einzelheiten unten](#urheberrecht-nutzung-und-kontakt).

![Die Hauptansicht des Trainers](bilder/01-hauptansicht.png)

## Was es kann

**Sechs Prüfungswege**, umschaltbar über „Ziel wählen":

| Auswahl | Inhalt | Fragen |
|---|---|---|
| Klasse N · Basis | Vorschriften, Betrieb, Technik N | 571 |
| Aufstockung N → E | nur Technik E | 463 |
| Aufstockung E → A | nur Technik A | 716 |
| Aufstockung N → A | Technik E + A | 1179 |
| Direkteinstieg Klasse E | alles von N + Technik E | 1034 |
| Direkteinstieg Klasse A | alles von N + Technik E + A | 1750 |

Vorschriften und Betrieb sind für alle Klassen gleich — die Klassen unterscheiden
sich nur im Prüfungsteil Technik. Beim Aufstieg wird deshalb nur dieser Teil
nachgeschrieben.

Das Fenster trennt die beiden Fälle, die in der Praxis dauernd verwechselt
werden: **Direkteinstieg** (noch keine Bescheinigung — je höher die Klasse,
desto mehr Technik kommt dazu) und **Aufstieg** (Bescheinigung vorhanden — nur
die fehlende Technik, kein Vorschriften und kein Betrieb mehr). Jede Zeile sagt
vorher, welche Prüfungsbögen dazugehören.

![Das Fenster „Prüfungsziel wählen" — Direkteinstieg und Aufstieg getrennt](bilder/02-pruefungsziel.png)

**Weiter:**

- **Lernmodus** mit Lernfortschritt, Fehlerliste, Merkliste und Auffrischung
- **Prüfungssimulator** — 25 Fragen, 45 Minuten, 19 zum Bestehen, wie in der echten Prüfung
- **Gruppenraum** — gemeinsam lernen, jeder in seinem Tempo, am Ende die Auswertung aller
- **Sprachausgabe** über [Piper](https://github.com/rhasspy/piper), lokal und offline.
  Abkürzungen werden vor dem Sprechen ausgeschrieben: „145 MHz" wird zu „145 Megahertz"
- **Hörbuch** — Frage, drei Sekunden Stille zum Selbstantworten, richtige Antwort.
  Als MP3 für den USB-Stick im Auto
- **Videolehrgang** — die 14 Lektionen von Michael (DL2YMR) mit den passenden Fragen
- **Prüfungstermin** eintragen, der Trainer rechnet das Tagespensum aus
- **Bedienung per Tastatur** für Menschen, die keine Maus benutzen können

### Beim Lernen

Falsch angekreuzt: die eigene Antwort rot, die richtige daneben. Links die
Auswertung und der Fortschritt durch die Runde, unten die passende Stelle im
Videolehrgang mit Zeitmarke.

![Eine beantwortete Frage im Lernmodus](bilder/03-frage.png)

### Gruppenraum — für Ortsverbände und Volkshochschulen

Der Trainer ist die passende Ergänzung für alle, die Amateurfunk **unterrichten**:
im Ortsverband, an der Volkshochschule, im Verein.

Der Ausbilder startet den Gruppenraum auf seinem eigenen Rechner und teilt einen
Link. Mehr braucht es nicht:

- **Bei den Teilnehmern wird nichts installiert.** Kein Konto, keine Anmeldung,
  keine App. Der Link geht in jedem Browser auf — Windows, Mac, Linux, Tablet,
  Handy. Nur der Ausbilder braucht den Trainer auf seinem Rechner.
- **Alle bekommen dieselben Fragen**, jeder in seinem Tempo.
- Der Ausbilder sieht in der **Teilnehmer-Übersicht**, wie weit jeder ist und wo
  es hakt — ohne dass bei irgendjemandem ein Fenster aufspringt.
- Ein **Gruppenchat** für Zwischenfragen gehört dazu.
- Am Ende steht die **Auswertung für alle** — und wer will, nimmt sich den
  kompletten Trainer über „Trainer herunterladen" mit nach Hause.

![Der Gruppenraum mit mehreren Teilnehmern](bilder/05-gruppenraum.png)

Die Übersicht, die nur der Ausbilder sieht:

![Die Teilnehmer-Übersicht des Ausbilders](bilder/06-uebersicht.png)

### Statistik und Lernfortschritt

Getrennt nach Prüfungsteil: was gelernt ist, wie die Trefferquote über alle je
gegebenen Antworten aussieht, und welche Fragen immer wieder danebengehen. Die
Auffrischung meldet sich nach 3, 7, 21 und 60 Tagen von selbst.

![Die Statistik mit Lernfortschritt und Stolpersteinen](bilder/07-statistik.png)

### Prüfungssimulator

Echte Prüfungsbedingungen: 25 Fragen und 45 Minuten je Teil, 19 Richtige zum
Bestehen — die Grauzone von 17 bis 18 ist eigens ausgewiesen, weil dort die
mündliche Nachprüfung greift. Der Technikteil der Klasse A hat 60 Minuten.

**Welche Teile anstehen, entscheidet das gewählte Prüfungsziel** — genauso wie
bei der Bundesnetzagentur. Wer schon eine Bescheinigung hat, schreibt die alten
Bögen nicht noch einmal:

| Prüfungsziel | Teile im Simulator |
|---|---|
| Klasse N | Vorschriften · Betrieb · Technik N |
| Klasse E | Vorschriften · Betrieb · Technik N · Technik E |
| Klasse A | Vorschriften · Betrieb · Technik N · Technik E · Technik A |
| Aufstockung N → E | nur Technik E |
| Aufstockung N → A | Technik E · Technik A |
| Aufstockung E → A | nur Technik A |

![Der Prüfungssimulator für Klasse A mit allen fünf Teilen](bilder/09-simulator-klassen.png)

Die Prüfungsübersicht auf der Hauptseite zeigt dieselben Teile — beide lesen
aus demselben Fragenkatalog, sie können sich also nicht widersprechen.

![Der Prüfungssimulator vor dem Start](bilder/04-simulator.png)

### Aktuell bleiben — ohne etwas kaputtzumachen

Der Trainer sagt beim Start selbst Bescheid, wenn hier auf GitHub etwas Neues
liegt. Geholt wird nichts von allein: Ein Balken meldet es, das Fenster unter
**Info → GitHub-Update** zeigt, worum es geht, und erst ein Klick auf
„Ausgewählte holen" ändert etwas im Ordner.

![Das Fenster „Update von GitHub"](bilder/08-updater.png)

Drei Dinge sind daran wichtig:

- **Eigene Änderungen werden nie überschrieben.** Der Trainer merkt sich, wie
  jede Datei aussah, als sie zuletzt mit GitHub gleich war. Eine Datei, die
  seither hier geändert wurde, steht im grünen Kasten — sie lässt sich gar
  nicht erst anhaken. Ein Fingerabdruck sagt nämlich nur, *dass* zwei Dateien
  verschieden sind, nicht welche die neuere ist.
- **Programmdateien brauchen eine eigene Bestätigung.** `Server.js`,
  `hoerbuch.js` und `lame.js` laufen mit vollen Rechten auf dem Rechner und
  sind deshalb nie vorangehakt.
- **Die alte Fassung wandert vorher nach `backup/`**, und jede geholte Datei
  wird vor dem Schreiben nachgerechnet. Ein abgebrochener Download kommt so
  nie im Ordner an.

## Loslegen

Ein Doppelklick. **Installiert wird nichts.**

1. Oben auf **Code → Download ZIP**, das ZIP entpacken
2. Im entpackten Ordner: Doppelklick auf **`START.bat`**

Mehr ist es nicht. Was fehlt, holt START.bat selbst nach: Node.js landet ohne
Installation im Unterordner `node/`, die Programmbausteine kommen per
`npm install` dazu. Der erste Start dauert deshalb ein paar Minuten und
braucht einmal Internet. Danach öffnet sich der Trainer im Browser — und ab
dann läuft er auch ohne Netz.

Wer lieber mit git arbeitet, klont statt zu entpacken:

    git clone https://github.com/Amateurfunk-Gruppe/Amateurfunk-Trainer.git

Danach ebenfalls **START.bat**. Ein eigenes `npm install` ist nicht nötig,
schadet aber auch nicht.

**Sprachausgabe.** Vorgelesen wird von Haus aus mit der Windows-Stimme. Für
die natürliche Stimme „Thorsten“ einmal **`piper.bat`** ausführen — rund
80 MB. Wer einen Stick baut, braucht das nicht: `USB-Stick-Erstellen.bat`
bringt die Sprachausgabe fertig eingerichtet mit.

**Zum Weitergeben** gibt es den Weg
[über den USB-Stick](#auf-einem-usb-stick-weitergeben--ohne-installation) —
ein Stick, der an jedem Windows-Rechner läuft, ohne dort etwas zu
installieren.

Entwickelt und getestet unter Windows. `Server.js` selbst ist gewöhnliches
Node.js und sollte auch unter macOS und Linux starten — nachgeprüft ist das
nicht, und START.bat, `piper.bat` und das mitgelieferte Node.js sind
Windows-Dateien.

## Fest auf dem eigenen Rechner — mit Symbol auf dem Desktop

Der entpackte Ordner darf liegen, wo er will; der Trainer läuft von jedem
Pfad. Nur ist der Downloads-Ordner ein schlechter Platz — dort ist er beim
nächsten Aufräumen weg. Und `START.bat` zeigt Windows als graues Zahnrad,
das man zwischen allen anderen Dateien erst suchen muss.

Zwei Handgriffe schaffen beides ab:

1. Den ganzen Ordner an einen festen Platz verschieben
2. Dort Doppelklick auf **`Verknuepfung-Erstellen.bat`**

Danach liegt auf dem Desktop eine Verknüpfung mit dem Funkgerät-Symbol, die
den Trainer startet.

![Verknuepfung-Erstellen.bat legt ein Startsymbol auf den Desktop](bilder/11-verknuepfung.png)

**Der Lernstand zieht mit.** Er liegt im Unterordner `data\` und wandert
beim Verschieben einfach mit. Wer ganz sichergehen will, klickt vorher im
Trainer auf „Sichern“ — dann liegt der Stand zusätzlich als eigene
`...-Lernstand_<Datum>.json` im Ordner.

**Wohin verschieben?** Am unkompliziertesten ist ein Ordner im eigenen
Benutzerkonto, etwa `C:\Users\<Name>\Amateurfunk-Trainer`.
`C:\Program Files\Amateurfunk-Trainer` geht ebenfalls — Windows fragt dann
beim Verschieben einmal nach Administratorrechten. Je nachdem, wie die
Rechte auf dem Rechner gesetzt sind, kann der Trainer dort allerdings seinen
Lernstand nicht schreiben. Das fällt sofort auf: Der Fortschritt ist nach
dem Schließen wieder weg. In dem Fall besser ins Benutzerkonto.

**Später umgezogen?** `Verknuepfung-Erstellen.bat` darf jederzeit erneut
laufen und richtet die Verknüpfung auf den neuen Ort. Zeigt der Desktop noch
das alte Symbol: einmal F5 drücken — Windows merkt sich Symbole und frischt
sie nicht von allein auf.

## Auf einem USB-Stick weitergeben — ohne Installation

Für Ortsverbände und Volkshochschulen: Sticks bespielen, austeilen, fertig.
Die Teilnehmer stecken ihn zu Hause ein, klicken **START.bat** und lernen los.
**Auf ihrem Rechner wird nichts installiert** — kein Node.js, kein Konto,
keine Administratorrechte, keine Änderung an Windows. Nach dem Abziehen
bleibt nichts zurück.

So wird ein Stick daraus:

1. Dieses Repository herunterladen (**Code → Download ZIP**) und entpacken
2. Stick einstecken
3. Im entpackten Ordner: Doppelklick auf **`USB-Stick-Erstellen.bat`**

Gefragt wird genau eines: **auf welchen Stick.** Und auch das nur, wenn mehr
als einer steckt — bei einem genügt die Eingabetaste.

Beim ersten Mal holt das Werkzeug selbst nach, was zu groß fürs Repository
ist: Node.js, die Programmbausteine und die Sprachausgabe samt
Funktionstest. Dafür wird einmal eine Internetverbindung gebraucht, danach
nie wieder.

![Der Ablauf von USB-Stick-Erstellen.bat](bilder/10-usb-stick.png)

**Was auf den Stick kommt — und was nicht.** Kopiert wird nach einer
Positivliste, nicht der ganze Ordner. Der eigene Lernstand (`data/`), die
Entwickler-Werkzeuge und die Git-Vorgeschichte bleiben zurück. Wer Sticks
austeilt, verteilt damit nicht versehentlich seinen eigenen Lernfortschritt.

**Der Lernstand wandert mit.** Er wird auf dem Stick gespeichert, nicht auf
dem fremden Rechner. Wer den Stick an mehreren Rechnern benutzt, findet
seinen Fortschritt überall wieder.

**Größe:** rund 200 MB mit einer Stimme. Wer mehrere Piper-Stimmen im Ordner
hat, bekommt sie alle mit — wer Platz sparen will, löscht die überzähligen
`.onnx`-Dateien im Ordner `piper/`, dann nimmt das Werkzeug automatisch
weniger mit.

**Eine Grenze, die ehrlich dazugehört:** Die natürliche Sprachausgabe
braucht auf dem Zielrechner das Microsoft-Laufzeitpaket (Visual C++
Redistributable). Das lässt sich nicht auf einen Stick kopieren, es muss
installiert sein. Fehlt es, liest der Trainer mit der Windows-Stimme vor —
er läuft also, klingt nur weniger natürlich. `piper/piper_reparatur.bat` auf
dem Stick holt das Paket bei Bedarf nach.

**Auch ohne Stick:** `Node-Holen.bat` legt Node.js allein in den Ordner
`node/`, wenn der Trainer auf dem eigenen Rechner ohne Installation laufen
soll.

## Herkunft der Fragen

Prüfungsfragen zum Erwerb von Amateurfunkprüfungsbescheinigungen,
Bundesnetzagentur, 3. Auflage, März 2024
([www.bundesnetzagentur.de/amateurfunk](https://www.bundesnetzagentur.de/amateurfunk)),
Datenlizenz Deutschland – Namensnennung – Version 2.0
([www.govdata.de/dl-de/by-2-0](https://www.govdata.de/dl-de/by-2-0)).

Die Daten wurden verändert: Formeln sind von LaTeX nach Unicode umgesetzt, die
Antworten sind gemischt (im Katalog steht die Lösung immer an erster Stelle),
und sechs Fragen mit beim Auslesen zerfallenen Brüchen wurden aus dem
maschinenlesbaren Katalog neu aufgebaut.

Die maschinenlesbare Fassung und die Zeichnungen stammen aus
[fritzsche/afu_test](https://github.com/fritzsche/afu_test).

## Dank

**Michael, DL2YMR** für seinen Videolehrgang zur Klasse N, auf den der Trainer
Lektion für Lektion verweist.

## Mitgelieferte Fremdbestandteile

- `lame.js` — [lamejs](https://github.com/gilmoreorless/lamejs), eine
  JavaScript-Portierung von LAME, unter LGPL 2.1. Wird für die MP3-Ausgabe des
  Hörbuchs gebraucht und liegt bei, damit der Trainer ohne Internet und ohne
  zusätzliche Installation läuft.

## Fehler gefunden?

Im Trainer gibt es oben den Knopf **Fehler melden** — er öffnet eine vorbereitete
Mail, in der Fassung, Prüfungsziel und die gerade angezeigte Frage schon
eingetragen sind. Oder hier ein Issue aufmachen.

## Urheberrecht, Nutzung und Kontakt

Der Amateurfunk-Trainer ist von **Dietmar Reh** entwickelt worden. Programmcode,
Texte, Aufbau und Gestaltung stehen unter seinem Urheberrecht.

**Der Trainer ist und bleibt kostenfrei.** Er darf benutzt, kopiert, verändert
und weitergegeben werden — solange damit kein Geld verdient wird. Ausdrücklich
erlaubt und erwünscht ist die Nutzung durch einzelne Lernende, Ortsverbände,
Vereine, Volkshochschulen, Schulen und Ausbilder. Auch dann, wenn für den Kurs
ein Teilnehmerbeitrag erhoben wird — der Trainer selbst darf nur nicht zur Ware
werden.

**Nicht erlaubt** ist, ihn oder Teile davon zu verkaufen, in ein
kostenpflichtiges Angebot einzubauen oder anderweitig gewerblich zu verwerten.

Maßgeblich ist die [PolyForm Noncommercial License 1.0.0](LICENSE) — eine
Lizenz, die eigens für diesen Fall geschrieben wurde: Weitergabe ja, Verkauf
nein. Bildungseinrichtungen sind darin ausdrücklich eingeschlossen.

**Anfragen sind willkommen.** Wer den Trainer im Ortsverband oder an der VHS
einsetzen möchte, ihn für seinen Kurs anpassen will oder eine Zusammenarbeit
vorschlägt: einfach fragen — über den Knopf **Fehler melden** im Trainer oder
hier ein Issue. Das gilt auch für alles, was über die Lizenz hinausgeht.

Für mitgelieferte Fremdbestandteile gilt weiter die Lizenz ihrer Urheber:
`lame.js` unter LGPL 2.1, der Fragenkatalog unter der Datenlizenz Deutschland,
die Zeichnungen sind gemeinfrei. Einzelheiten in [LICENSE](LICENSE).
