# Änderungsprotokoll — Amateurfunk-Trainer

Entwickler und Urheber: Dietmar Reh. Lizenz: [PolyForm Noncommercial 1.0.0](LICENSE).

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), SemVer.
Die oberste Versionsnummer ist die des nächsten Baus: `version.js` liest sie von hier,
`Build-DIREKT.bat` übernimmt sie in EXE-Name, Dateieigenschaften und `package.json`.

---

## [1.118.0] - 2026-09-03

### Entfernt
- **Der Dark Mode ist abgeschaltet.** Grund sind nicht die Farben, sondern die
  Bilder: Die Schaltbilder im Fragenkatalog der Bundesnetzagentur bringen ihren
  weißen Grund mit. Auf dunklem Grund stehen sie als leuchtende Kacheln in der
  Frage — bei fast jeder Technikfrage. Dagegen hilft kein anderes Blau
- Der Umschalter wandert jetzt durch **Light → Green → Blue → Orange → Grey**.
  Wer „Dunkel" gespeichert hatte, landet still auf Hell; der gespeicherte Wert
  wird dabei mit umgeschrieben, damit er nicht im Browser liegen bleibt
- Die Regeln des Dark Mode **bleiben im Stilblock stehen**, wirkungslos, weil
  die Klasse nirgends mehr gesetzt wird. Nichts davon ist verloren: Wer ihn
  zurückholen will, schreibt `dark` wieder in die Liste `STILE`, alles Weitere
  greift dann von allein

---

## [1.117.0] - 2026-09-03

### Geändert
- **Dark Mode auf DARC-Blau umgestellt.** Der bisherige „Geräteschwarz"-Modus
  war nach Dietmars Icom RS-BA1 gebaut: fast schwarze Flächen, leuchtendes
  Türkis. Schön, aber am falschen Ort — der Trainer geht Richtung DARC. Neue
  Quelle sind die Farben der **50-Ohm-App des DARC**, aus einem Bildschirmfoto
  gemessen statt geschätzt: `#00adef` das Blau im Logo, `#2fbcf4` Kopfband und
  Fortschritt, `#98def8` der blasse Rahmen
- Übernommen ist nicht das Helle — eine Nachtansicht in Hellblau wäre keine —
  sondern die **Farbfamilie**: derselbe Blauton einmal weit heruntergezogen als
  Grund (`#071520` … `#10293b`) und einmal ganz oben als Signal (`#00adef`).
  Aus dem Geräteschwarz wird ein tiefes Marineblau, aus dem Türkis das
  DARC-Blau. Die Bauweise bleibt: durchgehend dunkle Flächen, dünne Kanten
  statt Schatten, ein Signalton und nur dort, wo etwas an ist
- Die vorgelesene Antwort leuchtet jetzt im DARC-Blau statt im Türkis — der
  Gedanke ist derselbe geblieben
- Die CSS-Variablen heißen ehrlich nach dem, was sie sind: aus `--geraet-*`
  wird `--nacht-*`, aus `--tuerkis` wird `--darc-blau`
- Hell bleibt unverändert. Auch Green, Blue, Orange und Grey sind unberührt

### Behoben
- **Die Auswertungsspalte war im Dark Mode kaum zu lesen.** „Richtig",
  „Falsch", „Offen" und „Quote" trugen noch die Signalfarben von damals, als
  die Spalte ein weißer Kasten war: dunkles Grün, dunkles Rot, dunkles Ocker,
  graue Beschriftung. Gemessen 2,3:1 für die Beschriftung und 2,6:1 für die
  Zahlen — lesbar beginnt bei 4,5:1. Jetzt stehen dort die hellen
  Gegenstücke; die Bedeutung bleibt, nur die Helligkeit dreht sich um
- Alle Schriftfarben der Nachtansicht sind gegen ihre Flächen gerechnet:
  helle Schrift über 12:1, leise Schrift über 5,9:1, das Signalblau über 5,8:1

---

## [1.116.0] - 2026-09-03

### Geändert
- **Die Kopfzeile ist auf vier Knöpfe geschrumpft.** Sie war durch „Beenden" auf
  acht angewachsen und in eine zweite Zeile gerutscht. Oben bleiben Zahnrad,
  Info, Beenden und der Farbumschalter — das, was man während einer Runde in
  Reichweite haben will. Die Reihe ist jetzt 298 statt 640 Pixel breit und
  bricht erst unterhalb von 1000 Pixeln um
- **„Cache leeren", „Fehler melden" und „Alles zurücksetzen" stehen jetzt im
  Zahnrad-Fenster** unter der neuen Überschrift *Wartung*. Selten gebraucht,
  zwei davon heikel, keiner gehört zum Lernen. Die Funktionen sind
  unverändert — auch die Rückfrage vor dem Zurücksetzen. Das Vorlesen kennt
  sie an ihrem neuen Platz genauso
- **„Raum" erscheint nur noch, wenn ein Raum läuft.** Der Knopf zeigt die
  Statistik der Teilnehmer und hatte ohne Raum nichts anzuzeigen; der große
  Knopf „Gruppenraum" in der zweiten Leiste öffnet denselben Dialog. Läuft ein
  Raum, steht er wieder oben — auch mitten in einer Runde, wo die zweite
  Leiste ausgeblendet ist

---

## [1.115.0] - 2026-09-03

### Behoben
- **Beamer-Modus ließ die Hauptansicht leer zurück.** Wer ihn einschaltete,
  während keine Runde lief, sah ein weißes Blatt — die Hauptansicht besteht
  fast nur aus den Teilen, die der Modus ausblendet: Knopfleiste, Verlauf,
  Prüfungsübersicht, Lernfortschritt. Erst F5 half. Der Modus greift jetzt
  **nur, solange eine Frage auf dem Schirm steht**. Vorher bleibt alles, wie es
  ist, und ein Balken am unteren Rand sagt: „Beamer-Modus ist an — er schaltet
  um, sobald du eine Runde startest." Beim Verlassen wird die Ansicht wieder
  aufgebaut, ohne Neuladen
- **Der Ausstieg war praktisch unsichtbar.** „Beamer-Modus verlassen (Esc)"
  stand mit 25 % Deckkraft in der Ecke und ging auf hellem Grund unter. Jetzt
  ein deutlicher dunkler Knopf. Außerdem stand er nach dem ersten Gebrauch als
  weißer Kasten in der **normalen** Ansicht herum — ihm fehlte die Grundregel,
  die ihn außerhalb des Beamer-Modus wegnimmt
- **Esc gehört zuerst dem offenen Fenster.** Wer den Modus im Zahnrad-Fenster
  einschaltete, schloss mit Esc bisher beides auf einmal. Jetzt schließt das
  erste Esc das Fenster, das zweite verlässt den Beamer-Modus
- **Die Knopfreihe der Kopfzeile rutschte nach links,** sobald sie durch den
  neuen Knopf „Beenden" in eine zweite Zeile umbrach. Grund war das
  `space-between` der Kopfzeile, das den umgebrochenen Block an den linken Rand
  setzt. Sie bleibt jetzt in jeder Zeile rechtsbündig

---

## [1.114.0] - 2026-09-03

### Hinzugefügt
- **Beamer-Modus** für den Kursraum. Nur Frage und Antworten, dreimal so groß,
  alles andere weg — Leisten, Verlauf, Auswertung, Fußzeile. Weiterblättern mit
  Leertaste, Pfeiltasten oder Presenter (Bild-auf/Bild-ab), **Strg+B** schaltet
  um, **Esc** beendet ihn. Unten links steht, bei welcher Frage von wie vielen
  man ist. Schaltbar im Zahnrad-Fenster
- Die Schriftgröße rechnet in `vw`: auf jeder Leinwand gleich groß im
  Verhältnis zum Bild, egal ob 1280 oder 4K angeschlossen ist
- Der Modus wird **nicht** gespeichert. Wer morgen allein am Schreibtisch
  öffnet, will nicht in Kinoschrift begrüßt werden
- **Knopf „Beenden"** in der Kopfzeile. Beendet den Server sauber, statt nur
  das Fenster zuzumachen: der Port wird frei, beim nächsten Start gibt es keine
  Rückfrage. Mit Rückfrage vorher — sie nennt auch, ob gerade eine Runde läuft
  oder der Gruppenraum offen ist. Die neue Route `/api/beenden` ist `localOnly`:
  ein Gast im Gruppenraum kann den Trainer des Gastgebers nicht ausschalten
- **Der Trainer merkt jetzt, wenn der Server weg ist.** Bisher lief die Wache
  jede Minute gegen `/api/version` und tat bei ausbleibender Antwort nichts —
  die Seite sah normal aus, während nichts mehr gespeichert wurde. Nach zwei
  Fehlversuchen erscheint ein Balken

### Behoben
- Im Dark Mode war in den Fenstern fast schwarze Schrift auf fast schwarzem
  Grund. Ursache: Die Fenster setzten sich ihre alten **hellen** Variablen
  (`--ink: #16232f`), weil sie einmal helle Kästen waren. Jetzt werden die
  Variablen umgestellt — eine Regel statt fünfzig

---

## [1.113.0] - 2026-09-03

### Geändert
- **Dark Mode im Gerätestil.** Dietmar mit einem Screenshot seines Icom RS-BA1:
  „Die Farbe und der Style ist wahnsinnig schön. Dagegen wirkt unser Dark Mode
  ziemlich mickrig." Er hatte recht — der bisherige Dark Mode machte nur den
  Rand dunkel und ließ die Inhalte weiß. Das war ein heller Trainer in einem
  dunklen Rahmen
- Jetzt durchgehend dunkle Flächen, dünne Kanten statt Schatten, ein Glanzlicht
  an der Oberkante wie bei einem gefrästen Frontpanel
- **Türkis `#17c3d6` als einziges Signal** — und nur dort, wo etwas an ist:
  Start, „Weiter", die richtige Antwort, die Antwortbuchstaben
- Zähler in Monoschrift auf dunklen Feldern, wie eine Anzeige am Gerät
- **Die vorgelesene Antwort leuchtet türkis** statt gelb. Im hellen Stil bleibt
  es beim Leuchtstift-Gelb — die Signalfarben für richtig, falsch und
  angekreuzt sind in allen Modi unverändert
- Der Fragenblock hat ein eigenes Farbsystem (`--darc-*`); im Dark Mode werden
  jetzt dessen Variablen umgestellt statt zwanzig Einzelregeln geschrieben

- **Die Fenster ziehen mit.** Dietmar: „Manche Fenster die sich öffnen sind
  weiß und andere grau." Stimmt — die zwölf Fenster sind über Jahre gewachsen
  und tragen ihre Farben als `style`-Attribut im HTML; inline schlägt jede
  Klasse, deshalb blieben sie hell. Welche Farbwerte darin vorkommen, habe ich
  nicht geraten, sondern alle Fenster im Browser geöffnet und ausmessen lassen
- Hauptknöpfe in den Fenstern leuchten türkis, Warnkästen behalten ihren Ton
  nur gedunkelt, Ankreuzfelder bekommen die Gerätefarbe

### Behoben
- Die Antwortbuchstaben A bis D standen im Dark Mode schwarz auf schwarz
- Der Fragenblock behielt sein helles Grau `#dddddd`
- Die Überschriften der aufklappbaren Gruppen im Gruppenraum waren dunkelblau
  auf Schwarz und damit unsichtbar

---

## [1.112.0] - 2026-09-03

### Geändert
- **Ruhige Knopfleiste.** Farbe war bisher ein Kennzeichen: jeder Knopf hatte
  eine eigene, damit man ihn unterscheiden kann. Wenn alles hervorgehoben ist,
  ist nichts hervorgehoben — das Auge fand „Start" nicht schneller als
  „Drucken". Jetzt gilt eine Rangfolge:
  gefüllt = die Handlung (nur **Start**), weiß = Werkzeug, blauer Rand = eigener
  Modus (Prüfungssimulator, Gruppenraum), roter Rand = tut weh (Reset)
- Die Farbe ist nicht verschwunden, sie sitzt jetzt in der **Zahl** — dort steht
  die Information. Rot für Fehler, Violett für Lernbedarf
- **Start** in Tiefblau `#123a6b`. Die Farbe steht als `--start-farbe` einmal
  oben in der Datei; ein Wechsel ist eine Zeile
- Ecken von 30 px auf 8 px — weniger Bonbon, mehr Werkzeug
- Betroffen sind nur die beiden Leisten. Knöpfe in Fenstern und in der
  Frageansicht bleiben unverändert
- Im dunklen Stil bleibt die Filterleiste ein heller Kasten, wie bisher; dort
  gilt weiter die helle Fassung. Umgestellt wurde nur die Kopfleiste

---

## [1.111.0] - 2026-09-02

### Hinzugefügt
- **Zahnrad links neben „Info"** — ein eigenes Fenster für zwei Einstellungen,
  beide pro Benutzer gespeichert
- **Knöpfe vorlesen**: Fährt die Maus über einen Knopf, wird sein Hinweistext
  gesprochen. Der Tabulator löst dasselbe aus, damit es auch ohne Maus geht
- Dazu die Wahl **kurz oder ausführlich**: kurz nennt nur den Namen
  („Lernbedarf"), ausführlich die ganze Erklärung („Lernbedarf, oft falsch,
  braucht 3x richtig")
- **Schrift beim Vorlesen vergrößern**: Die Antwort, die gerade gelesen wird,
  tritt hervor und wird deutlich größer
- Zu den wichtigsten Knöpfen gibt es für „ausführlich" eigene Erklärungen in
  ganzen Sätzen — nicht nur die Sprechblase, sondern so, wie man es jemandem
  erklärt, der daneben sitzt
- **„Ziel wählen" spricht mit**: beim Öffnen „Wähle eine Klasse aus", auf jeder
  der fünf Karten deren Name — mehr nicht. Prüfungsteile, Fragenzahl und die
  CB-Rechnung stehen ohnehin sichtbar auf der Karte
- Stumm bleiben das Kreuz zum Schließen und die Knöpfe zurück zur Hauptansicht.
  Beides erklärt sich von selbst und würde beim Weiterklicken dazwischenreden.
  Einzelne Elemente lassen sich mit `data-nicht-vorlesen` stumm stellen
- „Prüfung starten" nennt jetzt die **Taste F9**, die beim Üben die richtige
  Antwort zeigt. Dass sie anderswo gesperrt ist, sagen die Knöpfe, die es
  betrifft: „Prüfungssimulator" und „Gruppenraum"
- Die **Benutzer-Auswahl im Verlauf** erklärt sich: drei getrennte Lernstände
  an einem Rechner, gedacht für den Ortsverband, wo sich mehrere einen Computer
  teilen. Beschriftung und Auswahlfeld lösen dieselbe Ansage aus
- Der **Pfeil neben dem Suchfeld** erklärt beim Überfahren, was die Suche kann:
  Fragennummer zum Hinspringen, Stichwort im Fragetext, mehrere Wörter grenzen
  ein, Groß- und Kleinschreibung und Umlaute egal
- „Probe hören" im Einstellungsfenster spielt einen Beispielsatz

### Entfernt
- Das **Hinweis-Kästchen beim Überfahren** ist weg — das Vorlesen erklärt die
  Knöpfe besser, und im Video wäre die Blase nur im Bild gewesen. Die
  `data-tooltip`-Texte bleiben: sie sind jetzt die Quelle für die gesprochene
  Erklärung

### Geändert (Blättern)
- Die Erklärung sagt jetzt, wozu der Knopf da ist, nicht nur was er tut:
  Fragen finden, die man schon kennt, unter „Gelernt" abhaken und so den
  Stapel kleiner machen. Bei gesetztem Lesezeichen nennt sie die Stelle

### Geändert (Gruppenraum)
- Sprechblase und Erklärung sagen jetzt ausdrücklich, dass Teilnehmer über den
  Link **im Browser** hereinkommen — ohne Installation, ohne Download, ohne
  Anmeldung, auf jedem Gerät

### Geändert
- Beim Vorlesen der Knopftexte werden Symbole entfernt, „·" und „|" werden zu
  einer kurzen Pause, „N→E" zu „N nach E", „3x" zu „3 Mal", „&" zu „und" —
  sonst klingt es abgehackt oder schlicht falsch
- Die vorgelesene Frage hat immer Vorrang: solange sie läuft, schweigen die
  Knopftexte

### Geändert (Fehler-Knopf)
- Der Knopf **„Fehler"** steht jetzt immer in der Leiste und ist nur blass,
  solange nichts offen ist — genau wie „Lernbedarf" es schon immer gemacht hat.
  Vorher verschwand er ganz: die Leiste sprang bei jedem ersten Fehler um, und
  erklären oder vorlesen ließ er sich gar nicht. Seine Erklärung nennt jetzt
  auch die Anzahl
- Ein Klick ohne offene Fehler meldet sich nicht mehr mit einem blockierenden
  Fenster, sondern mit dem beiläufigen Hinweis des Trainers

### Geändert (F9)
- Die Lösungstaste F9 ist jetzt auch **im Gruppenraum abgeschaltet**, nicht nur
  im Prüfungssimulator. Sie wurde dort bisher als Fehler gewertet — die Lösung
  stand danach aber trotzdem da, und am Ergebnis hängt ein gemeinsamer
  Punktestand. Beim Üben allein bleibt F9 unverändert eine Lernhilfe

### Behoben
- **Verschluckte Silben beim Vorlesen**: Zwei Ursachen. Erstens schnitt eine
  Grenze von 220 Zeichen die ausführlichen Erklärungen mitten im Wort ab —
  sie reicht jetzt für jede von ihnen und endet notfalls an einem Punkt.
  Zweitens schreibt sich der Blättern-Knopf im Betrieb selbst um; dabei fiel
  unter dem stehenden Mauszeiger ein Aus/Ein-Ereignis an und die Stimme fing
  von vorne an. Verglichen wird jetzt der Satz statt des Elements: was läuft,
  läuft weiter
- **Klicken las den Text noch einmal vor.** Auffällig beim Knopf „Light Mode",
  der beim Klicken seine eigene Beschriftung umschreibt. Zwei Gründe: der Klick
  setzt den Fokus, und die Fokus-Ansage kannte den Unterschied zur Tastatur
  nicht; außerdem griff der Satzvergleich nicht mehr, sobald der Knopf einen
  neuen Text trug. Jetzt spricht nur noch der Tabulator beim Fokus
  (`:focus-visible`), und solange der Zeiger auf demselben Knopf steht, wird
  nichts neu gestartet. Durchschalten während des Sprechens geht damit
- Blieb die Sprachausgabe einmal aus (Stimme fehlt, Server antwortet nicht,
  leere Datei), galt der Satz weiter als „läuft gerade" — dieser eine Knopf
  blieb dann für den Rest der Sitzung stumm. Jetzt wird die Merkung auf jedem
  Weg zurückgesetzt, auf dem es nicht bis zum Abspielen kommt
- Die Stimmen überschnitten sich beim Wischen über die Knopfleiste: der alte
  Knopf verstummte erst, wenn der neue an der Reihe war. Jetzt ist er in dem
  Moment still, in dem der Zeiger den nächsten Knopf erreicht. Nimmst du die
  Maus nur zur Seite, läuft der Satz zu Ende
- Karten mit fehlender Fragendatei waren `disabled` und bekamen deshalb keine
  Maus-Ereignisse — ausgerechnet dort, wo die Erklärung am nötigsten ist. Jetzt
  `aria-disabled`: nicht anwählbar wie vorher, aber sie sagen „Datei fehlt"
- Die vergrößerte Antwort schob sich rechts über den Rand der Fragenkarte
  hinaus. Ursache war `transform: scale()` — ein skaliertes Feld behält seine
  gemessene Breite. Jetzt wächst nur die Schrift, das Feld bleibt in seiner
  Spalte

---

## [1.110.0] - 2026-09-02

### Geändert
- Knopf „Durchsehen" heißt jetzt **Blättern** — und **Weiterblättern**, sobald ein
  Lesezeichen liegt. Der Tooltip nennt dann die Stelle: „Weiter bei Frage 13 von 571"
- Das Fenster bei „Weiterblättern" heißt jetzt **Neu beginnen** und
  **Weiterblättern**; die Fragennummer steht nur noch im Satz darüber, nicht
  zweimal
- Ältere Verlaufseinträge behalten das Wort „Durchsicht" — umschreiben hieße
  gespeicherte Lernstände anfassen, und dafür ist der Anlass zu klein

### Entfernt
- Knopf und Logik „Verwechslungsgefahr" — im Gebrauch ohne Nutzen. Damit passt auch
  die Knopfleiste wieder: „Gruppenraum" war zuvor halb abgeschnitten

### Behoben
- Der Verlauf war beim Start und beim Zurückkehren zum Hauptmenü oft zu lang; erst
  F5 richtete ihn. Die Messung war richtig, ihr Zeitpunkt nicht: Die linke Spalte
  wächst nach dem Zeichnen noch mehrmals (Prüfungsübersicht, Tagespensum,
  Hörbuch-Vorschau, CB-Kasten). Jetzt gestaffelt — sofort, nach 250 ms und nach 900 ms
- Beim Umschalten zwischen Runde und Hauptansicht war die linke Spalte im Moment der
  Messung ausgeblendet; zurück blieb der Wert von vorhin. Wird jetzt erkannt und
  übersprungen statt einen falschen Wert zu behalten

## [1.109.0] - 2026-09-02

### Behoben
- **Das Update konnte nie funktionieren.** `{app}` fehlte in den `[Dirs]` des
  Installers — `data\` und `backup\` waren beschreibbar, der Programmordner nicht.
  Der Trainer legte seine Sicherung an und scheiterte dann am Ersetzen von
  `Index.html`. Daher „Es wurde nichts verändert"
- Die Startprüfung zählte `unbekannt` nicht mit — genau der Zustand jeder frischen
  Installation, weil `github_stand.json` nicht mitgeliefert wird. Ausgerechnet dort
  meldete der Start nichts
- Das Update-Fenster warf den Grund weg und riet „Später noch einmal versuchen".
  Der Grund steht jetzt da, mit dem echten Ordnerpfad statt einer Vermutung

### Hinzugefügt
- Automatisches Übernehmen von Fragen, Bildern und Seite — mit Meldung unten rechts
  und Neuladen, wenn die Seite dabei war. Abschaltbar mit `AFU_AUTO_UPDATE=0`
- Balken oben, wenn Programmdateien anstehen: die werden nie von allein getauscht
- Schreibprobe vor dem ersten Zugriff statt Scheitern bei jeder einzelnen Datei
- Version am Info-Knopf, aus `package.json` und damit aus dem CHANGELOG

### Geändert
- Alles oder nichts je Stand: Sind Programmdateien dabei, wird auch der Rest nicht
  automatisch geholt — sonst läuft eine neue `Index.html` auf einem alten `Server.js`

## [1.108.0] - 2026-09-02

### Geändert
- Der Abgleich mit GitHub geht jetzt den dortigen Dateibaum durch statt einer festen
  Liste von 16 Namen — eine neu hinzugefügte Datei fällt damit überhaupt erst auf
- Unterordner werden mit abgeglichen (`svgs\`, `formelsammlung\`, `fontawesome\`);
  fehlende Ordner werden beim Übernehmen angelegt
- Einteilung daten/browser/programm jetzt nach Endung statt nach Namensliste; im
  Zweifel gilt eine `.js` als Programmdatei und verlangt die ausdrückliche Bestätigung

### Hinzugefügt
- `LIZENZ-Optionen.md` — was die PolyForm Noncommercial erlaubt, was PolyForm Strict
  ändern würde, und was GitHubs Nutzungsbedingungen unabhängig davon offenlassen

### Sicherheit
- Erlaubt sind nur ungefährliche Endungen (Umkehr der Beweislast): `.bat`, `.vbs`,
  `.ps1`, `.exe`, `.cmd`, `.py`, `.sh` und `.iss` kommen nie über den Abgleich
- `data\`, `backup\`, `Hoerbuch\`, `release\`, `tts_cache\` und `bilder\` sind tabu
- Pfade mit `..`, führendem `/` oder Laufwerksbuchstaben werden abgewiesen — der
  Dateibaum kommt aus einer fremden Quelle und bestimmt sonst, wohin geschrieben wird
- Die Prüfung läuft zweimal: beim Auflisten und noch einmal kurz vor dem Schreiben

## [1.107.0] - 2026-09-02

### Geändert
- Die Bauanleitung bleibt aus dem öffentlichen Repository: `installer.iss`,
  `Build-DIREKT.bat`, `version.js`, `icon.ico`, `wizard.bmp`, `small.bmp`
- `icon.png` bleibt drin — es ist das Symbol der Seite, nicht Teil der Bauanleitung
- README: Hinweis, dass offizielle Setups ausschließlich unter Releases liegen

### Hinzugefügt
- `Hochladen.bat` trägt Dateien, die in der `.gitignore` stehen aber noch im
  Repository liegen, auf Nachfrage aus (`git rm --cached`) — im eigenen Ordner
  bleiben sie liegen

### Behoben
- Eine `.gitignore` wirkt nur auf neue Dateien; `git add -A` nahm bereits
  nachverfolgte weiter mit. Ein neuer Eintrag hätte die Datei bei GitHub
  stehen lassen, ohne dass es auffällt

## [1.106.0] - 2026-09-02

### Hinzugefügt
- Knopf „Verwechslungsgefahr": Fragen, die sich zum Verwechseln ähneln, kommen
  direkt hintereinander statt über Wochen verteilt — Klasse N: 81 Fragen in 25 Gruppen
- Die Gruppen werden beim Laden aus dem Katalog gerechnet, nicht gepflegt; jedes
  Prüfungsziel bekommt seine eigenen (N → E: 72 Fragen in 27 Gruppen)
- README: Abschnitt „Einstieg CB → N" mit den 138 angerechneten Fragen und dem
  Verweis auf CB-Einstieg.md

### Geändert
- README: Zielauswahl auf die fünf aktuellen Ziele umgestellt, neuer Screenshot
  `02-pruefungsziel.png`, Simulator-Tabelle ohne Klasse A und N → A
- README: „Durchsehen" in der Funktionsliste ergänzt

### Behoben
- Bild `09-simulator-klassen.png` zeigte den Simulator mit fünf Teilen für Klasse A —
  das Ziel gibt es nicht mehr, der Verweis ist aus der README genommen

## [1.105.0] - 2026-09-02

### Hinzugefügt
- Knopf „Durchsehen": geht alle Fragen in Katalogreihenfolge durch — auch die schon
  gelernten — und merkt sich per Lesezeichen, wo man aufgehört hat
- Lesezeichen hängt an Benutzer und Prüfungsziel und speichert die Frage-Kennung,
  nicht die Position; Zahl am Knopf zeigt, wie viele noch kommen
- Beim zweiten Start Fenster mit zwei Wegen: „Weiter bei 213" oder „Von vorn"

### Geändert
- Vorlesen: Strich zwischen zwei Zahlen wird „bis", wenn eine Einheit folgt
  („3-30 MHz" → „3 bis 30 Megahertz"). 104 Stellen im Katalog betroffen
- Die Regel greift nur mit Einheit, damit „CEPT-Empfehlung T/R 61-01" unangetastet bleibt

### Behoben
- Der Rückkehr-Dialog für angefangene Runden legte sich über das Durchsicht-Fenster
  und fing dessen Klicks ab; die Durchsicht ist von diesem Mechanismus ausgenommen,
  sie hat ihr eigenes Lesezeichen

## [1.104.0] - 2026-09-02

### Hinzugefügt
- Prüfungsziel „Einstieg CB → N" mit Badge CB-BONUS — derselbe Katalog wie Klasse N,
  aber 138 Fragen als CB-Wissen angerechnet (571 → 433)
- Haken „CB-Erfahrung anrechnen" im Lernfortschritt, je Benutzer gespeichert und
  über `/api/userdata` auch in `data\userdata\`
- Eigenes Fenster „Als CB bekannt" mit allen 138 Fragen. Kästchen links holt die
  Frage zurück in den Lernstapel, Klick auf den Text öffnet sie — wie in der
  Trefferliste der Suche. Scrollposition bleibt beim Abhaken stehen, Escape schließt
- `CB-Einstieg.md` — jede der 138 Fragen mit Begründung, plus die Liste dessen,
  was bewusst drinbleibt

### Geändert
- Zielauswahl auf fünf Karten gekürzt: N Basis, E direkt, N → E, E → A, CB → N
- Direkteinstieg Klasse A und Aufstockung N → A entfernt; Weg zu A führt über E → A
- `isMastered()` ist die einzige Stelle, an der CB-Wissen einhakt — Lernstapel,
  Zähler, Lektionsübersicht und der Simulator-Haken ziehen von selbst nach
- Prüfungssimulator zieht unverändert aus allen 571 Fragen — die BNetzA tut es auch
- Zeilen im Fenster „Prüfungsziel wählen" färben beim Überfahren orange (#f9a05a) —
  dasselbe Orange wie die angekreuzte Antwort im Simulator

### Behoben
- Die CB-Liste stand im Lernfortschritt-Kasten und hat die Hauptansicht um mehrere
  hundert Pixel verlängert — der Kasten ist jetzt 79 Pixel hoch
- Zähler lasen `masteryData` direkt statt über `isMastered()` und hätten die
  angerechneten Fragen unterschlagen
- Ein gespeichertes Ziel, das es nicht mehr gibt (`a`, `na`), fällt sauber auf
  Klasse N zurück

## [1.103.0] - 2026-09-02

### Geändert
- Drucken folgt dem unter „Ziel wählen" eingestellten Prüfungsziel: 1 bis 5 Bögen statt fest 3
- Druck und Prüfungssimulator ziehen aus derselben Quelle (`realisticTeile` / `realisticPool`)
- Deckblatt nennt die Zielklasse statt des Aufstiegswegs; Technik A mit 60 statt 45 Minuten
- Fünf Papierfarben; für Technik E und A als „nur zum Auseinanderhalten" gekennzeichnet
- Info-Text nennt die Klassen N, E und A sowie das aktuell eingestellte Ziel

### Behoben
- Technikbogen enthielt alle Technikfragen aller Klassen (bei Klasse A 1374 in einem Bogen)
- Bögen Technik E und Technik A wurden nie gedruckt; Aufstockungen bekamen Vorschriften und Betrieb
- Kennung hinter der Fragennummer zeigte für jede Technikfrage „N" statt TN/TE/TA

## [1.102.0] - 2026-09-02

### Geändert
- „Alles zurücksetzen" löscht jetzt auch den Prüfungsverlauf des aktuellen Benutzers
- Fenstertext listet Verlauf unter „wird gelöscht" statt unter „bleibt erhalten"

### Behoben
- Verlauf überlebte den Reset in `examHistory`, in `examHistory_<Benutzer>`,
  `amateurfunk_history_<Benutzer>` und in `data\userdata\` — alle vier werden geleert

## [1.101.0] - 2026-09-01

### Hinzugefügt
- Neuinstallation startet leer: Server meldet über `/api/neuanfang` einen frischen Ordner,
  die Seite leert daraufhin localStorage und sessionStorage
- Deinstallation fragt, ob `data\` mitentfernt werden soll (Vorgabe: Nein)

### Geändert
- Release-Beschreibung nüchtern: Installation in vier Zeilen plus Liste der Änderungen
  (vorher 7451 Zeichen Fließtext, jetzt rund 900)
- `Release-Hochladen.bat` nimmt alle Änderungen seit dem letzten veröffentlichten Release,
  frischt ein vorhandenes Release per `gh release edit` auf

### Behoben
- Argumente an `gh` waren bei `shell:true` nicht in Anführungszeichen — Titel und Pfade
  mit Leerzeichen wären zerfallen
- Gast im Gruppenraum bekommt auf `/api/neuanfang` keine Antwort (hätte sonst seinen
  Browser geleert)

## [1.99.0] - 2026-09-01

### Hinzugefügt
- `Start.js` als Ziel der Verknüpfungen

### Geändert
- Verknüpfungen zeigen auf `node\node.exe` statt `wscript.exe`, Flag `runminimized`
- Setup-Schlussseite erklärt das Anheften an die Taskleiste von Hand

### Behoben
- Verknüpfungen ließen sich nicht an die Taskleiste anheften; bei `wscript.exe` als Ziel
  fehlt der Menüpunkt ganz
- Nicht funktionierender Haken „An Taskleiste anheften" aus dem Installer entfernt

## [1.98.0] - 2026-09-01

### Hinzugefügt
- Lebenszeichen der Seite alle 10 s (`/api/lebenszeichen`), Abmeldung per `sendBeacon`

### Geändert
- Server beendet sich 45 s nachdem das letzte Fenster zu ist — nur bei `AFU_BROWSER=1`,
  mit 2 min Schonzeit und nie während einer Hörbuch-Berechnung
- Portprüfung wartet bis zu 10 s statt starrer 2 s

### Behoben
- Server lief nach dem Schließen des Browsers weiter; nach mehreren Starts war Port 3000 belegt
- Meldung „Port 3000 ist immer noch belegt" empfahl STOP.bat, obwohl das dasselbe tut;
  `taskkill`-Exitcode wird jetzt ausgewertet (Rechteproblem statt Geduldproblem)

## [1.97.0] - 2026-09-01

### Hinzugefügt
- `version.js` — Versionsnummer aus dem CHANGELOG statt von Hand
- Ordner `release\` für fertige Setups, `Release-Hochladen.bat` zum Veröffentlichen

### Geändert
- Versionsnummer erscheint in EXE-Name, Dateieigenschaften, „Apps & Features" und package.json

### Behoben
- `Build-DIREKT.bat` brach mit „Die Syntax für den Dateinamen … ist falsch" ab
  (`for /f "usebackq"` mit führendem Anführungszeichen) — jetzt über temporäre Datei

## [1.94.0] - 2026-09-01

### Hinzugefügt
- Font Awesome 6.5.2 liegt lokal im Ordner `fontawesome\` (vorher CDN, also Internetzwang)
- Acht neue Screenshots im Grey Mode für die README

### Geändert
- 104 espeak-Stimmvarianten aus dem Setup entfernt
- Schlussmeldung nach dem Hochladen zeigt nicht mehr auf entfernte Werkzeuge

### Behoben
- `Hochladen.bat` scheiterte mit „Der Befehl node … konnte nicht gefunden werden"
  (`process.execPath` statt bloßem `node`)
- Löschungen werden beim Hochladen vollständig und zuerst gelistet statt „… und N weitere"
- `Hochladen.bat` und `GitHub-Verbinden.bat` verwiesen im Fehlerfall aufeinander

## [1.88.0] - 2026-09-01

### Geändert
- Setup fragt wieder nach dem Zielordner
- USB-Stick-Erstellung und Piper-Stimmen-Download ersatzlos entfernt, samt aller Hinweise darauf
- Setup entschlackt: arabische Vokalisierung und 111 fremdsprachige Wörterbücher (16,4 MB) raus

### Behoben
- 30 beim Ordnerwechsel liegengebliebene Dateien zurückgeholt, jede über die Dateigröße abgeglichen
- Beinahe wären neun MIT-Lizenzdateien aus `node_modules` mit ausgeschlossen worden

## [1.85.0] - 2026-09-01

### Geändert
- Form „Rund" komplett entfernt, nur noch „Eckig"
- Antwortfelder in Schrift, Farbe und Geometrie nach DARC-Vorbild, mit Haken und Kreuz
- Prüfungssimulator: keine Grün/Rot-Färbung, keine Ansage „Richtig"/„Falsch"
- Angekreuzte Antwort im Simulator orange, vorgelesene Antwort gelb

### Behoben
- Nach einem Durchgang im Simulator blieben Benutzerauswahl und Verlauf verschwunden
  (drei Ausstiegswege, zwei davon unvollständig)
- Gelbe Vorlese-Markierung war vorhanden, aber durch CSS-Spezifität unsichtbar
- Icon fehlte auf der kompilierten EXE

## [1.81.0] - 2026-09-01

### Hinzugefügt
- Grey Mode; Farbe und Form als zwei getrennte Achsen umschaltbar

### Geändert
- Setup mit Zielordner-Abfrage, Symbol und Herausgeber-Angabe

### Behoben
- `data\*` (Lernstand) und `video_embed.json` (echte Vornamen) wurden mit ausgeliefert
- `github_update.js` fehlte im Setup, obwohl `Server.js` es beim Start lädt
- Doppelklick auf START.bat tat nichts, wenn ein verwaister Server auf Port 3000 saß;
  beide Startdateien prüfen den Port jetzt vorher

## [1.77.0] - 2026-08-29

### Hinzugefügt
- Formelsammlung direkt an der Frage: die passende PDF-Seite wird angezeigt und die Stelle markiert

## [1.76.0] - 2026-08-28

### Hinzugefügt
- `Update-Test.bat` — Probelauf für die Update-Meldung, ohne zu holen oder zu schreiben
- Video „Installation auf USB-Stick" in der README

### Geändert
- Updater fragt nicht mehr, was angehakt werden soll; Programmdateien ohne Rückfrage
- README nennt den festen Platz auf dem Rechner und dass der Lernstand mitzieht
- Desktop-Verknüpfung startet minimiert

### Behoben
- Beim Start gingen zwei Fenster auf, eines zu viel
- Meldung „[SEC] Externer Zugriff blockiert" samt voller IP las sich wie ein Angriff —
  entfernt, IP-Adressen werden gekürzt, „Entfernen" bekommt die Option „sperren"

## [1.70.0] - 2026-08-28

### Hinzugefügt
- `GitHub-Verbinden.bat` — holt den Stand von GitHub in einen Ordner ohne `.git`
- `Zurueckholen.bat` — versehentlich gelöschte Dateien wiederholen

### Geändert
- Abschnitt „Loslegen" der README beschreibt nicht mehr den Weg über git clone und npm install
- Der Umweg über ein Stimmen-Release ist aufgegeben; Piper wird an der Quelle geholt

### Behoben
- `Hochladen.bat` stand nach dem Deinstallieren von Node.js still
- 19 Dateien standen versehentlich zum Löschen bereit; Ursache war eine überbügelte `.gitignore`

## [1.65.0] - 2026-08-27

### Hinzugefügt
- Betrieb ohne Installation: `Node-Holen.bat` holt Node portabel, Prüfsumme gegen SHASUMS256.txt
- `USB-Stick-Erstellen.bat` — kompletter Trainer auf einen Stick

### Geändert
- Repository ausgemistet: von 800 Dateien und 22,6 MB auf das Nötige
- `sounds/fanfare.wav` (2,3 MB für zwölf Sekunden) und `bilder/youtube-vorlage.html` entfernt

## [1.63.0] - 2026-08-26

### Hinzugefügt
- Prüfungssimulator kennt alle sechs Prüfungsziele; Prüfungsumfang steht als Regel an einer Stelle
- Vorschaubild und Anleitung für das Repository

### Geändert
- Trainer fragt beim Start von selbst nach Neuerungen — nur lokal, nur ohne laufende Runde,
  nur einmal je Stand, abschaltbar
- Direkteinstieg und Aufstockung werden konsequent auseinandergehalten
- Prüfungsübersicht auf der Hauptseite baut ihre Zeilen aus derselben Regel wie der Simulator

## [1.58.0] - 2026-08-26

### Hinzugefügt
- Screenshots von Hauptansicht, Zielwahl, Gruppenraum und Updater in der README

### Geändert
- Lizenz von MIT auf PolyForm Noncommercial 1.0.0 (bereits Herausgegebenes bleibt MIT)
- `Piper-Stimmen.zip` (419 MiB), alte Git-Historie und ausgediente Helfer entfernt

### Behoben
- Fehler in `github_ausmisten.js` selbst gefunden und behoben
- `BUG_REPORT.md` aus dem Repository entfernt

## [1.53.0] - 2026-08-26

### Hinzugefügt
- `DNS-Auffrischen.bat` — hilft beim negativen DNS-Cache nach einem Tunnelstart
- Prüfung der heruntergeladenen Datei: HTML statt JSON und zu kleine Dateien werden erkannt

### Geändert
- START.bat sieht erst nach, fragt dann und startet zuletzt; fremde Prozesse auf Port 3000
  werden nie beendet
- Aus „Gastgeber" wird „Entwickler" (nicht überall — eine Stelle blieb bewusst stehen)

### Behoben
- „Das Fenster geht auf und sofort wieder zu" — Ursache nachgestellt und beseitigt
- Meldung nannte nur den umständlichen Weg über den Tunnel des Entwicklers
- Portprüfung war auf deutschen Rechnern wirkungslos; im Zweifel wird jetzt gestartet

## [1.45.0] - 2026-08-26

### Hinzugefügt
- Angefangene Runde überlebt eine Pause und wird wiederhergestellt
  (nicht im Simulator, nicht im Gruppenraum)
- `Update-Pruefen.bat` — sagt, warum ein Gast kein Update bekommt
- `GitHub-Ausmisten.bat` — Entwicklerwerkzeuge aus dem Repository nehmen

### Geändert
- Update von GitHub überschreibt lokal neuere Dateien nicht mehr (dritter Zustand „neuer hier")
- Geprüft wird über Kennungen, nicht durch Herunterladen von 10 MB

### Behoben
- Im Fenster „Prüfungsziel wählen" reagierte keine Zeile auf die Maus (Inline-Stile)
- „Verlauf einblenden" war kürzer als die Frage daneben
- Echte Vornamen aus `Index.html`, CHANGELOG und Raum-Dialog entfernt
- Eigene `.gitignore` beim Update überbügelt

## [1.37.0] - 2026-08-25

### Hinzugefügt
- Formelsammlung und Fragenkatalog als PDF im Paket, auch über den Browser abrufbar
- Bedienung per Tastatur: Tasten 1–4 antworten, Enter weiter, Rücktaste zurück;
  Rückmeldungen werden für Vorleseprogramme angesagt
- `Hochladen.bat` und `Stimmen_packen.bat` statt einer Anleitung

### Geändert
- Download heißt `Amateurfunk-Trainer.zip` statt `Klasse-N-Trainer.zip`
- Download-Knopf aus dem Gruppenraum-Fenster entfernt

### Behoben
- Bildsuche kennt jetzt drei Varianten (`_q.svg`, `.svg`, `_q.png`) statt verschachtelter `onerror`
- Zwei Fehler in `github_pruefen.js`

## [1.32.0] - 2026-08-25

### Hinzugefügt
- Klassen E und A: alle fünf Prüfungswege, je eine eigene Fragendatei
- Knopf „Fehler melden" mit vorbereiteter Mail zur angezeigten Frage

### Geändert
- Microsoft-Stimmen entfernt, nur noch Piper; stiller Rückfall auf Microsoft beseitigt
- LaTeX in 219 Fragen nach Unicode umgesetzt statt KaTeX nachzurüsten
- Verlauf begrenzt, damit die Seite nicht mit jeder Runde länger wird

### Behoben
- Sechs Formel-Fragen in `fragen.json` repariert (NB302, NB303, NG104, NB501, NB502, NB503)
- 55 Zeilen toter Code entfernt

## [1.26.0] - 2026-08-23

### Hinzugefügt
- Hörbuch fürs Autoradio: Frage, drei Sekunden Stille, Antwort — als MP3 je Lektion oder je Frage
- Erzeugt der Server, happenweise kodiert, 44100 Hz

## [1.25.0] - 2026-08-22

### Hinzugefügt
- Fanfare und Konfetti beim Bestehen im Gruppenraum

### Geändert
- Laufende Nummer aus dem Verlauf entfernt (Datum, Teil, R, F, %, Ergebnis bleiben)
- Löschmodus im Verlauf: zwei Knöpfe statt drei

### Behoben
- Geister-Eintrag nach einer Gruppenraum-Runde; jede Runde merkt sich ihren Verlaufseintrag
- Automatisch gewertete Fragen zählten in der Teilrunde nicht mit
- Konfetti lag vor dem Fenster, Fanfare fehlte ohne Internet, Endlosschleife bei fehlender Bibliothek

## [1.20.0] - 2026-08-22

### Hinzugefügt
- Dateistand im Info-Fenster („Dieser Trainer läuft mit dem Stand …")
- Abgleich mit dem Entwickler, getrennt nach Daten und Programmdateien
- Standwache: veraltete Seiten melden sich mit einem Banner
- Automatischer Abgleich beim Start, Sicherung nach `backup\`, abschaltbar mit `AFU_AUTO_ABGLEICH=0`

### Geändert
- `Server.js` wird beim Abgleich nie automatisch ersetzt

### Behoben
- Im Gruppenraum stand nur „27/50 richtig" — jetzt richtig, falsch und beantwortet

## [1.15.0] - 2026-08-21

### Hinzugefügt
- Prüfungstermin mit Tagespensum, je Benutzer gespeichert, plus Link zur BNetzA-Terminliste
- Lernen nach den 14 Lektionen des Videolehrgangs, mit Lektionsübersicht und Inhaltsverzeichnis
- Info-Knopf mit Kurzanleitung
- Einzelne Verlaufseinträge löschbar

### Geändert
- Hauptansicht aufgeräumt, Videolehrgang bekommt ein eigenes Feld mit eigener Zählung
- Lektionsanzeige nennt offene und Gesamtzahl („25 von 52")

### Behoben
- Zwei Kontrastfehler am Info-Knopf und in der Lektionszeile

## [1.8.0] - 2026-08-20

### Hinzugefügt
- Haken „Gelerntes erneut prüfen" — nur die abgehakten Fragen, immer als Übung
- Haken „Bereits gelernte Fragen" in Gruppenraum und Prüfungssimulator

### Behoben
- Gruppenraum-Runden landeten nicht im Verlauf
- „Gelernte ausblenden" wirkte nur in zwei von fünf Fällen und wurde nie wieder eingelesen
- Abgebrochene Runden landeten nicht im Verlauf
- Antworten aus früheren Runden wurden mitgezählt

## [1.5.0] - 2026-08-19

### Hinzugefügt
- Stichwortsuche im Fragenkatalog

### Geändert
- Videos laufen über YouTube; Benutzername gehört zum Benutzer-Slot

### Behoben
- YouTube-Fenster blieb leer („Fehler 153"), Ursache war ein Sicherheitsheader

## [1.4.0] - 2026-08-18

### Geändert
- „Pastell Mode" heißt „Green Mode"; der Umschalt-Knopf zeigt den aktiven Modus
- Host kann Fragenzahl und Bereich nachträglich ändern, solange niemand geantwortet hat
- Textsmileys im Chat werden als Emoji dargestellt

### Behoben
- Chat im Dark Mode war fast unlesbar (Kontrast 1,1:1), jetzt über 4,5:1
- Kontrastfehler der Punkte-Leiste in allen drei Themes
- Gruppenraum-Runden landeten nur unter engen Bedingungen im persönlichen Verlauf
- Auswertungs-Popup erschien auch, wenn ein anderer Teilnehmer fertig war

## [1.3.0] - 2026-08-17

### Behoben
- K1: Der komplette Projektordner war über den Server abrufbar, inklusive Quellcode
- K2: Der Cloudflare-Tunnel startete ohne Zustimmung
- K3: `/api/userdata` war ungeschützt lesbar, überschreibbar und löschbar
- K4: `/api/start-tunnel` erlaubte Fremden, Prozesse auf dem PC zu starten und zu beenden
- K5: `/api/tts` ließ sich für unbegrenzte Subprozesse missbrauchen (DoS)
- K6: Im Gruppenraum ließen sich Punkte und Identität fälschen
- K7: Ein fehlgeschlagener Piper-Start brachte den Server zum Absturz
- Verzerrte Zufallsauswahl, Raumcodes von 4 auf 6 Zeichen, Passwort im Klartext in der URL,
  Speicherwachstum und Dateikorruption beim gleichzeitigen Schreiben, TTS-Cache-Race
- Einladungslink hing bei „Tunnel startet noch…"; verwaiste `cloudflared.exe` werden aufgeräumt

---

## Bekannte Einschränkungen

- Die Zuordnung Frage → Lektion ist eine thematische Sammelzuordnung: 279 von 571 Fragen
  hängen an der ersten Zeitmarke ihrer Lektion. Zum Lernen brauchbar, als Aussage
  „das erklärt Michael hier" nur bedingt.
- F9/F10 (Lösungen ein-/ausblenden) kollidieren mit den Aufnahme-Hotkeys von Camtasia Studio.
  `Strg+Umschalt+L` funktioniert als Alternative.
- Piper `de_DE-thorsten-medium.onnx` (63 MB) und `node_modules` (26 MB) bleiben im Setup.
