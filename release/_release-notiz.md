## Installation

1. **Amateurfunk-Trainer-1.111.0.exe** herunterladen und starten.
2. Der Assistent fragt, wohin installiert wird.
3. Windows meldet "Unbekannter Herausgeber": *Weitere Informationen* → *Trotzdem ausführen*.

Enthalten sind Node.js, die Sprachausgabe mit deutscher Stimme, der amtliche Fragenkatalog und die Formelsammlung. Beim Einrichten wird keine Internetverbindung gebraucht.

Beim Update bleibt der Lernstand erhalten – der Ordner `data\` wird nicht angefasst. Beim Deinstallieren wird gefragt, ob er mit weg soll.

## Änderungen

### 1.111.0 – 2026-09-02

**Hinzugefügt**
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
- **„Ziel wählen" spricht mit**: beim Öffnen die Überschrift, auf jeder der
  fünf Karten deren Name — mehr nicht. Prüfungsteile, Fragenzahl und die
  CB-Rechnung stehen ohnehin sichtbar auf der Karte
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

**Entfernt**
- Das **Hinweis-Kästchen beim Überfahren** ist weg — das Vorlesen erklärt die
  Knöpfe besser, und im Video wäre die Blase nur im Bild gewesen. Die
  `data-tooltip`-Texte bleiben: sie sind jetzt die Quelle für die gesprochene
  Erklärung

**Geändert (Blättern)**
- Die Erklärung sagt jetzt, wozu der Knopf da ist, nicht nur was er tut:
  Fragen finden, die man schon kennt, unter „Gelernt" abhaken und so den
  Stapel kleiner machen. Bei gesetztem Lesezeichen nennt sie die Stelle

**Geändert (Gruppenraum)**
- Sprechblase und Erklärung sagen jetzt ausdrücklich, dass Teilnehmer über den
  Link **im Browser** hereinkommen — ohne Installation, ohne Download, ohne
  Anmeldung, auf jedem Gerät

**Geändert**
- Beim Vorlesen der Knopftexte werden Symbole entfernt, „·" und „|" werden zu
  einer kurzen Pause, „N→E" zu „N nach E", „3x" zu „3 Mal", „&" zu „und" —
  sonst klingt es abgehackt oder schlicht falsch
- Die vorgelesene Frage hat immer Vorrang: solange sie läuft, schweigen die
  Knopftexte

**Geändert (Fehler-Knopf)**
- Der Knopf **„Fehler"** steht jetzt immer in der Leiste und ist nur blass,
  solange nichts offen ist — genau wie „Lernbedarf" es schon immer gemacht hat.
  Vorher verschwand er ganz: die Leiste sprang bei jedem ersten Fehler um, und
  erklären oder vorlesen ließ er sich gar nicht. Seine Erklärung nennt jetzt
  auch die Anzahl
- Ein Klick ohne offene Fehler meldet sich nicht mehr mit einem blockierenden
  Fenster, sondern mit dem beiläufigen Hinweis des Trainers

**Geändert (F9)**
- Die Lösungstaste F9 ist jetzt auch **im Gruppenraum abgeschaltet**, nicht nur
  im Prüfungssimulator. Sie wurde dort bisher als Fehler gewertet — die Lösung
  stand danach aber trotzdem da, und am Ergebnis hängt ein gemeinsamer
  Punktestand. Beim Üben allein bleibt F9 unverändert eine Lernhilfe

**Behoben**
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

Ausführlich in [CHANGELOG.md](https://github.com/Amateurfunk-Gruppe/Amateurfunk-Trainer/blob/main/CHANGELOG.md).
