# Änderungsprotokoll — Amateurfunk-Trainer

Entwickler und Urheber: Dietmar Reh. Lizenz: [PolyForm Noncommercial 1.0.0](LICENSE).

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), SemVer.
Die oberste Versionsnummer ist die des nächsten Baus: `version.js` liest sie von hier,
`Build-DIREKT.bat` übernimmt sie in EXE-Name, Dateieigenschaften und `package.json`.

---

## [1.188.0] - 2026-09-06

### Behoben
- **„Not found" statt Suchseite — die Adresse war zu neu.** Dietmar: „Es öffnet
  sich die Webseite Not found."

  Der Trainer öffnete `https://ans.bundesnetzagentur.de/…`. Die Bundesnetzagentur
  verlinkt ihre eigene Rufzeichensuche auf der Amateurfunk-Seite aber mit
  **`http://`** — unter der verschlüsselten Adresse antwortet dort offenbar ein
  anderer Server, und der kennt die Seite nicht. Link und Rückfall nehmen jetzt
  dieselbe Adresse wie die Behörde selbst.

  Beim Abfragen probiert der Server weiterhin zuerst https und fällt erst dann
  auf http zurück; welche Adresse geantwortet hat, schickt er mit, und genau die
  öffnet der Trainer im Notfall.

### Geändert
- **Die Diagnose sagt jetzt, woran es lag.** Schlägt die Abfrage fehl, nennt
  `grund` beide Versuche mit ihrem Ergebnis, zum Beispiel
  `Suchseite nicht erreichbar [https → 404 (kein Formular) | http → 200 (Formular)]`.
  Zu sehen unter `http://localhost:3000/api/rufzeichen?ruf=DL1ABC`.

## [1.187.0] - 2026-09-06

### Behoben
- **Die Rufzeichenabfrage kam nicht durch — drei Ursachen abgestellt.** Dietmar:
  „Es öffnet sich direkt der Link." Das ist der Rückfall; er greift immer dann,
  wenn die Abfrage keine eindeutige Antwort liefert.

  **Die Kennung.** Der erste Versuch meldete sich als „Amateurfunk-Trainer".
  Viele Behördenseiten hängen hinter einem Schutzdienst, der ungewohnte
  Kennungen aussortiert, bevor die Seite überhaupt gefragt wird. Jetzt meldet
  sich der Server wie ein gewöhnlicher Browser.

  **Das Sitzungs-Cookie.** `getSetCookie()` gibt es erst ab Node 20 — ältere
  Fassungen liefern alle Cookies in einer Zeile, die von Hand zerlegt werden
  muss. Ohne Cookie weist ASP.NET die Eingabe zurück, und zwar ohne zu sagen,
  warum. Beide Wege werden jetzt bedient.

  **Formularziel und Suchknopf.** Wohin ein Formular schickt, steht im Formular
  selbst — es muss nicht dieselbe Seite sein. Und statt eines Knopfes kann dort
  ein Link stehen, der `__doPostBack` aufruft; dann trägt man den Namen in
  `__EVENTTARGET` ein. Beides liest der Server jetzt aus der Seite, statt es
  vorauszusetzen.

  Geprüft gegen eine zweite, absichtlich anders gebaute Nachbildung: Link statt
  Knopf, abweichendes Formularziel, zwei Cookies in einer Zeile — Treffer,
  Nicht-Treffer und Platzhaltersuche werden richtig gedeutet.

  **Falls es immer noch nicht geht:** `http://localhost:3000/api/rufzeichen?ruf=DL1ABC`
  im Browser öffnen. Die Antwort nennt unter `grund` genau, woran es hakt.

## [1.186.0] - 2026-09-06

### Hinzugefügt
- **Der Trainer fragt jetzt selbst nach: „vergeben" oder „noch frei".** Dietmar:
  „Kann man das nicht indirekt abfragen?" — und auf die Rückfrage: „Nur vergeben
  und noch frei."

  Neue Schnittstelle `/api/rufzeichen`. Der Server macht das, was ein Mensch auf
  der Seite auch täte: Seite holen, die versteckten Felder (`__VIEWSTATE`,
  `__EVENTVALIDATION` …) und das Sitzungs-Cookie mitnehmen, das Rufzeichen ins
  Suchfeld schreiben, abschicken, im Ergebnis nachsehen. Antwort im Trainer:
  **„DL1ABC ist vergeben"** in Rot oder **„DL1ABC ist noch frei"** in Grün, mit
  dem ehrlichen Zusatz, dass eine Sperrfrist trotzdem laufen kann.

  **Was dabei nicht passiert:** keine Namen, keine Adressen — die stehen im
  Verzeichnis, gehen den Trainer aber nichts an. Kein Sammeln, kein Vorratsabruf:
  eine Anfrage je Klick, die Antwort liegt höchstens zehn Minuten im Speicher,
  damit ein zweiter Klick die Behörde nicht noch einmal behelligt. Und nur vom
  Trainer-Rechner aus (`localOnly`) — sonst könnte jeder mit dem Einladungslink
  über diesen Server Anfragen schicken.

  **Der Code rät nichts.** Feldnamen und Aufbau gehören der Seite, nicht uns.
  Deshalb liest er die Namen des Suchfelds und des Knopfes aus der Seite selbst
  und wertet nur aus, was in Ergebnis-*Tabellen* steht — das Suchfeld enthält das
  eingetippte Rufzeichen ja auch dann, wenn nichts gefunden wurde. Ist die
  Antwort nicht eindeutig, sagt er „unklar", und der Trainer fällt auf den alten
  Weg zurück: Seite öffnen, Rufzeichen in der Zwischenablage. **Eine falsche
  Auskunft wäre schlimmer als keine.**

  Geprüft gegen ein nachgebautes ASP.NET-Formular: versteckte Felder erkannt,
  Feld- und Knopfnamen gefunden, Treffer, Nicht-Treffer und Platzhaltersuche
  (`DB2*K`) richtig gedeutet; in der Anzeige beide Fälle sowie der Rückfall bei
  fehlender Antwort. **Gegen die echte Seite habe ich nicht testen können** — aus
  meiner Arbeitsumgebung ist sie nicht erreichbar. Der erste Versuch am
  Trainer-PC zeigt, ob die Feldnamen passen.

## [1.185.0] - 2026-09-06

### Hinzugefügt
- **„Rufzeichen prüfen" — eine Zeile unter dem Prüfungstermin.** Dietmar: „Die
  Bundesnetzagentur hat die Möglichkeit, nach Rufzeichen in Deutschland zu
  suchen. Hier wäre ein Feld bei Prüfungstermin, wo man schauen kann, ob das
  Rufzeichen schon vergeben ist."

  Man trägt das Wunschrufzeichen ein und klickt „Nachsehen": Der Trainer legt es
  in die Zwischenablage und öffnet die
  [Rufzeichensuche der Bundesnetzagentur](https://ans.bundesnetzagentur.de/Amateurfunk/Rufzeichen.aspx).
  Dort genügt Strg+V. Der Stern als Platzhalter für ein einzelnes Zeichen
  (`DB2*K`) ist erlaubt, weil die Suche ihn kennt; alles andere wird aus der
  Eingabe entfernt.

  **Warum kein Direktlink:** Die Seite der Bundesnetzagentur ist ein
  ASP.NET-Formular. Solche Seiten schicken ihre Eingaben per POST zusammen mit
  einem Sitzungsschlüssel — eine Adresse mit angehängtem Rufzeichen gibt es dort
  nicht. Man könnte eine raten; sie liefe beim nächsten Umbau der Seite still ins
  Leere, und man sähe nur eine leere Suchmaske ohne zu wissen, warum. Zwei Tasten
  sind ehrlicher als ein Link, der irgendwann lügt.

  Steht auf den Diplomen schon ein Rufzeichen, ist das Feld beim Start damit
  vorbelegt. Schlägt die Zwischenablage fehl — der Browser gibt sie nur in
  sicherem Zusammenhang frei —, gibt es einen zweiten Weg über ein unsichtbares
  Textfeld, und wenn auch der nicht greift, sagt der Hinweis eben „dort
  eintragen".

## [1.184.0] - 2026-09-06

### Behoben
- **Aus dem Diplome-Fenster kamen alle Fragen der Lektion statt nur der
  fehlenden.** Dietmar: „Bei Diplome steht noch 1 Frage. Ich habe die eine Frage
  beantwortet und kein Diplom erhalten. Beim nächsten Klick war da eine neue
  Frage." — und mit Bild nachgereicht: „Da war 1 weiße und 51 hellgrüne", später
  „Hier fehlen 2 Fragen" bei einer Runde mit dreizehn.

  Der Klick startete die Runde über `lektionRundeStarten()`, und die richtet sich
  nach den beiden Schaltern der Hauptansicht: „Gelernte ausblenden" und
  „Gelerntes erneut prüfen". Stand der erste aus, gab `ohneGelernte()` den
  **ganzen** Stapel zurück — aus „noch 1 Frage" wurden 52. Und weil bei jedem
  Start neu gemischt wird, stand beim nächsten Klick eine andere Frage da.

  Aus dem Album ist die Absicht eindeutig: Ich will das, was mir zur Karte noch
  fehlt. Deshalb gelten beide Schalter dort für die Dauer des Starts so, wie es
  diese Absicht verlangt — danach stehen sie wieder, wie der Benutzer sie gesetzt
  hat.

- **Ein Klick auf ein Fach, dessen Lektion inzwischen voll ist, gibt die Karte
  statt einer Runde.** Das Album zeichnet sich nicht von selbst neu, während man
  daneben lernt. Wer die letzte offene Frage beantwortete und danach dasselbe
  Fach noch einmal anklickte, klickte auf einen Stand von vorhin — und weil dort
  nichts mehr offen war, fiel die Runde auf „alles gelernt, dann eben alles
  wiederholen" zurück. Jetzt wird vorher nachgesehen; ist die Lektion voll,
  kommt die Karte, bei Bedarf mit Konfetti.

### Werkzeug
- **Entwürfe und Notizen gehen nicht mehr mit auf GitHub.** Dietmar, mit einem
  Bild der Rückfrage von `GitHub-Verbinden.bat`: „Ändere das bitte, damit ich
  keinen Blödsinn auf GitHub poste." Angeboten wurden dort die Musterseiten
  `_auswertung-vorschlag.html`, `_blaettern-vorschlag.html` und
  `_drei-ideen-vorschlag.html`. Der Unterstrich am Anfang ist für solche Dateien
  seit Wochen das Zeichen — ab jetzt reicht er auch aus: `.gitignore` nimmt
  `_*.html`, `_*.md`, `_*.json` und `_*.txt` heraus. Sie bleiben im Ordner und
  lassen sich weiter öffnen, tauchen aber in der Rückfrage nicht mehr auf. Soll
  doch einmal etwas mit Unterstrich hinein, geht das mit einem Ausrufezeichen
  davor (`!_wichtig.md`).

### Geändert
- **Die Fächer sagen jetzt, wie viel wirklich noch fehlt.** Eine Frage gilt erst
  als gelernt, wenn sie **dreimal hintereinander** richtig beantwortet wurde —
  davon stand im Fach nichts. Auf der Zielgeraden (drei Fragen oder weniger)
  steht deshalb jetzt „noch 1 Frage · noch 2× richtig". Der Hinweistext beim
  Überfahren nennt die Regel ebenfalls.

## [1.183.0] - 2026-09-06

### Geändert
- **Zurück zur Hauptansicht beendet jetzt auch den Gruppenraum.** Dietmar:
  „Gruppenraum — Raum erstellen — Starten. Wenn ich zurück zum Hauptmenü gehe,
  muss der Gruppenraum und der Chat beendet werden."

  Bisher galt das nur für „Schließen" im Gruppenraum-Fenster. Wer stattdessen die
  Runde abbrach, stand wieder in der Hauptansicht — der Raum lief aber weiter,
  der Chat blieb am Bildschirm, und die Teilnehmer warteten auf einen Gastgeber,
  der längst woanders war.

  Die Rückfrage sagt vorher, was passiert: beim Gastgeber „Der Gruppenraum wird
  beendet und der Chat geschlossen — die Teilnehmer werden abgemeldet", beim Gast
  „Du verlässt den Gruppenraum". Der Lernstand bleibt in beiden Fällen unberührt,
  er hängt am Benutzer und nicht am Raum.

  Nachgestellt mit zwei Browsern: Gastgeber erstellt den Raum, Gast tritt bei,
  Runde läuft, Gastgeber bricht ab — Raum zu, Chat weg, Fenster geschlossen, und
  auch beim Gast ist der Raum beendet.

## [1.182.0] - 2026-09-06

### Behoben
- **Es sind wieder alle vierzehn Lektionen da — bei jedem Prüfungsziel.** Dietmar,
  im Bild die Aufstockung E → A: „Es müssten 14 sein! Es fehlen auch die, wo ich
  noch nicht fertig habe. Anklickbar direkt zu den Fragen. Das Ziel ist, die
  Benutzer dazu zu bringen, alle Diplome zu erhalten."

  Die Fragen einer Lektion kamen aus `lektionFragen()`, und das durchsucht den
  **gerade geladenen** Fragenkatalog. Bei einer Aufstockung liegen dort die
  Fragen der Klasse A — keine einzige Lektion fand ihre Fragen, und übrig blieben
  nur die schon verdienten Karten. Deshalb lief es vormittags richtig und
  nachmittags nicht: Dazwischen lag der Wechsel des Prüfungsziels.

  Gezählt wird jetzt aus der Video-Map. Sie enthält genau die 571 Fragen der
  Klasse N in ihren 14 Lektionen — immer, unabhängig vom geladenen Katalog. Der
  Lernstand steht ohnehin je Fragennummer, also für alle Kataloge in einem Topf.

- **Ein Klick auf ein leeres Fach führt jetzt auch dann zu den Fragen, wenn ein
  anderes Ziel eingestellt ist.** Der Trainer fragt einmal nach und schaltet auf
  Klasse N um, bevor er die fehlenden Fragen der Lektion lädt. Der Kopftext im
  Fenster sagt vorher, dass das passieren wird.

  Nachgestellt: 14 Fächer bei Klasse N und bei fremdem Katalog, Rückfrage beim
  Klick, und nach dem Umschalten eine Runde mit genau den offenen Fragen.

## [1.181.0] - 2026-09-06

### Behoben
- **Der Verlauf war wieder zu lang — und diesmal war die Ursache eine andere.**
  Dietmar mit einem Bild der Aufstockung E → A: „Der Verlauf von dem Benutzer ist
  wieder zu lang."

  Zwei Fehler auf einmal:

  **Erstens: Die Messung bestätigte sich selbst.** Beide Spalten stehen
  nebeneinander in einem Flex-Kasten, und darin wird die kürzere auf die Höhe der
  längeren gezogen. War der Verlauf einmal zu lang, maß `verlaufHoeheAngleichen()`
  an der linken Spalte nicht mehr deren Inhalt, sondern genau die zu große Höhe,
  die sie selbst gesetzt hatte. Der falsche Wert bestätigte sich bei jeder
  weiteren Messung — kein späterer Aufruf konnte das je geradebiegen. Jetzt wird
  die Höhenbegrenzung für den Moment der Messung auf null gesetzt: Dann streckt
  der Verlauf nichts mehr, die linke Spalte fällt auf ihre eigene Höhe zurück,
  und die wird gelesen. Gezeichnet wird dazwischen nichts.

  **Zweitens: Die drei gestaffelten Messungen decken den Fall nicht ab.** Sie
  fangen ab, was nach dem Zeichnen noch *dazukommt*. Beim Wechsel des
  Prüfungsziels passiert das Gegenteil — die linke Spalte wird *kürzer*: Die
  Prüfungsübersicht der Klasse N hat drei Zeilen, die der Aufstockung E → A nur
  eine. Statt an jede einzelne Stelle einen Aufruf zu hängen (Zielwechsel,
  Prüfungstermin, CB-Kasten, Hörbuch-Vorschau, Diplome-Knopf …) schaut jetzt ein
  Beobachter der linken Spalte beim Wachsen und Schrumpfen zu. Eine Stelle, alle
  Fälle — auch die, die erst noch dazukommen.

  Nachgestellt: künstlich auf 900 Punkte gesetzt, eine Korrektur später steht
  wieder der richtige Wert. Beim Wechsel von Klasse N auf E → A liegen beide
  Unterkanten auf derselben Linie.

## [1.180.0] - 2026-09-06

### Behoben
- **„0 von 0 Lektionen bestätigt" — die Diplome waren nicht weg, sie standen nur
  nicht da.** Dietmar: „Meine Diplome sind weg."

  Das Album zeigte ausschließlich Lektionen, die im **gerade eingestellten
  Prüfungsziel** vorkommen. Die Lektionseinteilung stammt aus dem Videolehrgang,
  und den gibt es nur für den Katalog der Klasse N — wer auf Klasse E oder eine
  Aufstockung umschaltet, hat keine einzige Lektion, und damit war die Liste
  leer, obwohl die Karten unverändert im Lernstand lagen. Dasselbe passierte,
  wenn das Fenster geöffnet wurde, bevor der Katalog geladen war.

  Jetzt kommen zuerst die verdienten Karten aus dem gespeicherten Stand — immer,
  egal was eingestellt ist —, und danach die noch offenen Lektionen des
  aktuellen Ziels. Gibt es für dieses Ziel keine Lektionen, sagt der Kopftext
  das, statt „0 von 0" zu melden.

## [1.179.0] - 2026-09-06

### Geändert
- **Die Trennlinie im Beamer-Modus ist jetzt grau statt fast schwarz.** Dietmar:
  „Grau ist gut. Jetzt ist eine schwarze Linie dabei, die weg muss." Die Farbe
  der Nebentexte war auf der Leinwand ein schwarzer Balken; die Rahmenfarbe aus
  dem ersten Versuch war das andere Extrem und verschwand im hellen Grau der
  Karte. Der neue Wert liegt dazwischen: sichtbar als Trennung, ohne sich
  vorzudrängen.

## [1.178.0] - 2026-09-06

### Geändert
- **Aus „Dein Sammelalbum" wird „Deine Diplome 🏆".** Dietmar hat sie von Anfang
  an Diplome genannt — dann sollen sie auch so heißen. Der Knopf im
  Lernfortschritt heißt jetzt „Diplome" und trägt einen Pokal statt der
  Bilderrahmen; Fenstertitel, Hinweis und Vorlesetext sind mitgezogen.

## [1.177.0] - 2026-09-06

### Behoben
- **Im Beamer-Modus fehlte die Trennlinie zwischen Frage und Antworten.**
  Dietmar hat sie im Bild rot eingezeichnet: „Im Beamer-Modus fehlt oben eine
  graue Linie." In der gewöhnlichen Ansicht trennt der Rahmen der Fragenkarte
  beides — im Beamer-Modus sind Rahmen und Schatten abgeschaltet, damit die
  Schrift die Leinwand füllt, und damit war auch die Grenze weg.

  Die Linie sitzt jetzt am Antwortenblock, nicht an der Frage: So läuft sie über
  die volle Breite und nicht nur unter dem grauen Kasten. Sie ist in der
  Schriftfarbe der Nebentexte gehalten, nicht in der Rahmenfarbe — die Antworten
  stehen auf demselben hellen Grau wie die Fragenkarte, dort verschwindet eine
  helle Linie. Nachgesehen in beiden Ansichten, hell und dunkel.

## [1.176.0] - 2026-09-06

### Behoben
- **„Gelernte ausblenden" wurde nicht vorgelesen.** Dietmar: „In der Hauptansicht
  fehlt bei ‚Gelernte ausblenden' der Text zum Vorlesen." Der Grund lag eine
  Ebene tiefer als gedacht: Der Vorleser greift nur bei Elementen mit
  `data-tooltip`, und dieses Feld hatte keinen — der Nachbar „Gelerntes erneut
  prüfen" schon, deshalb fiel es auf. Jetzt hat es beides, den kurzen Hinweis
  für die Maus und den ausführlichen Satz für die Sprachausgabe.
- **„LAN" klang wie „elan".** Dietmar: „Im gemeinsamen Modus bei der Kachel
  Offline über LAN sagt es elan oder WLAN." Die Stimme las die drei Buchstaben
  als Wort. Jetzt wird buchstabiert: L-A-N. „WLAN" bleibt unangetastet — das
  spricht jeder als ein Wort, und die Stimme trifft es auch. Die Regel steht wie
  bei DARC und DL2YMR an beiden Stellen: in `Index.html` für die Notstimme des
  Browsers und in `tts-expand.js` für Piper.

## [1.175.0] - 2026-09-06

### Behoben
- **„noch 0 Fragen" und trotzdem kein Diplom.** Dietmar: „Es soll den Lernstand
  übernehmen. Wo 0 Fragen vorhanden sind, sollte auch das Diplom vorhanden
  sein." Eine Karte fiel bisher nur beim Beantworten einer Frage — wer den
  Trainer aktualisierte und danach nur das Album öffnete, sah fertige Lektionen
  als leeres Fach. Jetzt übernimmt das Album beim Öffnen den Lernstand, und beim
  Start des Trainers geschieht dasselbe einmal still. Ohne Konfetti: Was schon
  vorher fertig war, wurde nicht gerade eben verdient.

### Hinzugefügt
- **Leere Fächer sind anklickbar und laden die fehlenden Fragen.** Dietmar: „Die
  Diplome sollten anklickbar sein und die fehlenden Fragen laden." Ein Klick auf
  ein noch nicht verdientes Fach schließt das Album und startet eine Runde mit
  genau den Fragen dieser Lektion, die noch offen sind — das Gelernte bleibt
  weg. Beim Überfahren hebt sich die Karte und sagt, um wie viele Fragen es
  geht.

## [1.174.0] - 2026-09-06

### Hinzugefügt
- **QSL-Karten fürs Sammelalbum.** Dietmar: „Für jede abgeschlossene Lektion
  bekommst du eine virtuelle QSL-Karte. Sammelalbum im Profil."

  Eine Karte fällt, sobald **jede Frage einer Lektion** abgehakt ist — gezählt
  wird nur, was im aktuellen Prüfungsziel überhaupt vorkommt. Dann geht ein
  Fenster mit der Karte auf, mit dem Konfetti, das der Trainer schon hatte.

  **Kein DARC-Design.** Die Vorstandschaft hat entschieden, den Trainer nicht zu
  übernehmen; das Logo bleibt draußen. Die Karten sind eigene Entwürfe — was
  ohnehin schöner ist, weil es dann Dietmars Karten sind.

  **Sechs gezeichnete Motive** im Wechsel: Leuchtturm, Burg, Windrad,
  Gittermast mit Yagi, Küste mit Segelboot, Bake auf dem Berg. Alle als SVG in
  `Index.html`, keine einzige zusätzliche Bilddatei — was nicht daneben liegt,
  kann beim Weitergeben auch nicht verlorengehen.

  Die Karte behält die Form einer echten QSL: Rufzeichen groß oben,
  Bestätigungszeile unten mit Lektionsname, Fragenzahl, Datum, Trefferquote und
  Klasse. Nur bestätigt sie kein QSO, sondern eine Lektion. Das Rufzeichen ist
  im Album änderbar; bis dahin steht ein Platzhalter da — die meisten hier haben
  ja noch keins.

  **Das Album** sitzt neben „Alle Lektionen" im Lernfortschritt. Verdiente
  Karten zuerst, danach die offenen — und die offenen nach dem, was am wenigsten
  fehlt, damit oben steht, was als Nächstes zu holen ist. Nicht verdiente Fächer
  zeigen das Motiv als Schattenriss mit „noch 4 Fragen" und einem Balken: Man
  ahnt, was einen erwartet, liest aber nicht schon die Bestätigung.

  **Jede Karte lässt sich als PNG speichern** (1000 × 600, also auch gedruckt
  scharf) — zum Ausdrucken oder in die Gruppe stellen.

  **Beim ersten Mal wird still nachgetragen.** Wer den Trainer seit Wochen
  benutzt, wird nicht mit vierzehn Karten auf einmal beworfen; die schon
  fertigen Lektionen liegen einfach im Album.

### Geändert
- **Die Sicherung nimmt das Sammelalbum mit.** `getAllLocalUserData()` und
  `data\userdata\amateurfunk_data.json` führen jetzt ein Feld `qsl` — je
  Benutzer die verdienten Karten, dazu das Rufzeichen. Ohne das wäre die
  Sammlung beim Wechsel auf einen anderen Rechner weg, und sie ist gerade das,
  was man nicht noch einmal erarbeiten möchte. Zurückgeholte Karten werden nicht
  als „gerade eben verdient" gefeiert.

## [1.173.0] - 2026-09-06

### Hinzugefügt
- **Taschenrechner.** Dietmar: „1. Taschenrechner" — und nach dem Entwurf: „Baue
  das so ein." Gebaut ist genau der, den die Prüfungsordnung erlaubt. In der
  Amtsblatt-Verfügung 29/2024 steht als Hilfsmittel „ein einfacher
  wissenschaftlicher oder nicht programmierbarer Taschenrechner (ohne
  Textspeicher)": keine Variablen, kein Formelspeicher, keine
  Wiederholrechnungen. Nicht weil es schwer wäre — sondern weil man sonst etwas
  übt, das einem im Prüfungsraum weggenommen wird.

  **Die Vorsätze sind der eigentliche Grund** für einen eigenen Rechner. In den
  Aufgaben steht „4,7 kΩ" und „22 pF", nicht „4700" und „0,000000000022". Hier
  sind p n µ m k M G eigene Tasten, sie hängen sich direkt an die Zahl, und die
  Antwort kommt in derselben Sprache zurück.

  **Zwei Schreibweisen gleichzeitig:** groß die, die man an dieser Stelle lesen
  will, klein darunter die andere. Zwischen 0,1 und 10000 ist das die gewöhnliche
  Zahl („1024", „0,5"), darüber und darunter der Vorsatz („2,2 µ", „3,5 M").

  **Kein `eval()`.** Der Ausdruck wird selbst zerlegt und nach dem
  Shunting-Yard-Verfahren gerechnet — in einer Datei, die weitergegeben wird,
  wäre `eval()` eine offene Tür, und bequemer wäre es hier nicht einmal.

  Der Knopf sitzt in der Fragen-Kopfzeile neben dem Formelblatt und ist auch im
  Prüfungssimulator erreichbar, denn erlaubt ist der Rechner dort ja auch. Das
  Fenster schwebt rechts unten statt über der Seite — man muss die Frage lesen
  können, während man rechnet —, lässt sich am Kopf verschieben und merkt sich
  seinen Platz. Die Tastatur bedient es mit: Ziffern, Komma, Klammern,
  Rechenzeichen, Enter, Rücktaste, Esc, und die Vorsatzbuchstaben.

  Durchgerechnet mit dreizehn Proben, darunter `1/(2*π*7,159M*22p)` = 1010,52
  und `sin(30)` = 0,5, dazu zwei fehlerhafte Eingaben, die sauber „Fehler"
  ergeben statt etwas Falsches.

## [1.172.0] - 2026-09-06

### Hinzugefügt
- **„Rest abarbeiten" — ein drittes Feld über die ganze Breite.** Dietmar: „Ich
  habe 485 Fragen und würde gerne die 86, die noch fehlen, abarbeiten. Darunter
  ein drittes Feld, was über die ganze Breite von dem Feld geht, wo steht: 86
  Fragen sind noch zu lernen." Genau das steht jetzt unter den beiden Kacheln,
  im selben Zuschnitt, aber über die volle Breite und in einem warmen Ton — es
  ist weder der ganze Katalog noch das Abgehakte, sondern die Arbeit, die noch
  vor einem liegt. Ein Klick geht nur durch die Fragen, die noch nicht abgehakt
  sind, in der Reihenfolge des Katalogs; das Lesezeichen des normalen Blätterns
  bleibt liegen.

### Behoben
- **Die Zeile „Bei der ersten offenen Frage" aus 1.171.0 zeigte sich bei
  Dietmar nie.** Sie erschien nur, wenn die erste offene Frage nicht ohnehin die
  nächste war — und da sein Lesezeichen am Kataloganfang liegt, war genau das
  immer der Fall. Das neue Feld hat diese Bedingung nicht: Es steht da, solange
  überhaupt etwas offen ist, und verschwindet erst, wenn alles abgehakt ist.

## [1.171.0] - 2026-09-06

### Geändert
- **Das Blätter-Fenster ist neu aufgebaut — zwei Kacheln statt vier Knöpfe.**
  Dietmar: „Blättern gefällt mir so nicht. Mache mir Vorschläge." Nach drei
  Entwürfen: „B — Zwei Kacheln, aber nicht mit Text, sondern Buttons darunter."

  Vorher standen vier Wege gleichzeitig da, und der breite grüne Kasten „Nur die
  gelernten ansehen" sah aus wie der Hauptknopf, war es aber nicht. Dazu ein
  Zahlenkasten „Dein Stand" mit zwei Zahlen ohne Bezug — 8 wovon, 458 von wie
  vielen?

  Jetzt steht die eigentliche Frage da: ganzer Katalog oder nur das Abgehakte?
  Beides als gleich große Kachel, jede mit ihrer Zahl und ihrem Balken, und ein
  Klick auf die Kachel startet. Die Balken laufen beim Öffnen auf. „Neu
  beginnen" und „Stand löschen" stehen als Knöpfe in der Fußzeile.

  Die linke Kachel sagt drei verschiedene Dinge: „571 Fragen" beim ersten Mal,
  „8 von 571" mit Lesezeichen, „Am Ende" nach der letzten Frage. Ohne abgehakte
  Fragen fällt die rechte Kachel weg und die linke füllt die Breite.

### Hinzugefügt
- **„Bei der ersten offenen Frage" — der dritte Weg aus Vorschlag C, unter den
  Kacheln.** Dietmar: „C — Wo soll ich anfangen? Das darunter in B mit
  integrieren." Wer 458 von 571 Fragen abgehakt hat, klickt sich beim Blättern
  sonst durch hunderte Fragen, die er längst kann. Diese Zeile setzt direkt an
  der ersten Frage an, die noch nicht abgehakt ist; das Lesezeichen wandert von
  dort aus weiter wie sonst. Sie steht nur da, wenn sie auch etwas spart.

### Behoben
- **Ein Satz stand doppelt.** Beim ersten Öffnen — also ohne Lesezeichen —
  stand „Blättern geht alle Fragen der Reihe nach durch." als Ansage und direkt
  darunter noch einmal als Erklärung. Jetzt steht er einmal.

## [1.170.0] - 2026-09-06

### Geändert
- **Die Balken der Prüfungsreife reichen weiter nach links.** Dietmar: „Sieht
  gut aus. Nach links kann man den noch etwas verlängern?" Die Namensspalte geht
  von 132 auf 108 Punkte, der Balken wächst damit bei 1500 Punkten Fensterbreite
  von 206 auf 230. Weiter geht es nicht: „Vorschriften" misst in dieser Schrift
  rund 90 Punkte, und sobald der Name umbricht, wird die Zeile höher und die
  drei Balken stehen nicht mehr in gleichem Abstand. Nachgemessen bei 1920,
  1500, 1280 und 1100 Punkten: alle drei Zeilen gleich hoch, kein Umbruch.

## [1.169.0] - 2026-09-06

### Geändert
- **Die Balken der Prüfungsreife sind rund ein Drittel länger.** Dietmar: „Bei
  Vorschriften habe ich den grünen Balken etwas verlängert. Hier ist mehr Platz
  vorhanden. Bitte nutze ihn." Die Namensspalte ist von 150 auf 132 Punkte
  zusammengerückt („Vorschriften" ist das längste Wort) und die Zahlenspalte von
  118 auf 86 — die Zahlen stehen in der Schreibmaschinenschrift, ihre Breite ist
  bekannt. Der gewonnene Platz geht an den Balken: bei 1500 Punkten
  Fensterbreite von 156 auf 206 Punkte.

  Die Werte bleiben fest und werden nicht automatisch berechnet: Jede Zeile ist
  ein eigenes Raster, und bei „auto" wäre die Spalte in der Zeile mit „zu wenig"
  breiter als in der mit „sitzt" — die Balken stünden dann treppenförmig.

### Hinzugefügt
- **Die Balken laufen beim Öffnen auf.** Dietmar: „Beim Aufrufen der Statistik
  soll der Balken so aussehen, als wird er frisch eingelesen." Sie starten bei
  null und wachsen in 0,9 Sekunden auf ihren Wert, um 0,14 Sekunden versetzt
  von oben nach unten — so liest es sich als Einlesen und nicht als Ruck.

## [1.168.0] - 2026-09-06

### Geändert
- **Auswertung & Sicherung: rechts steht jetzt ein eigener Kasten in hellem
  Grau.** Dietmar: „Hebe die rechte Seite mit einem hellen Hellgrau etwas ab,
  damit es auch farblich wie zwei Teile aussieht." — und: „Zwischen links und
  rechts zu den Buttons ist eine Höhendifferenz." Beides erledigt derselbe
  Handgriff: Der rechte Kasten hat denselben Zuschnitt wie die Prüfungsreife
  links — gleicher Radius, gleiche Linie, gleicher Innenabstand, nur in Grau
  statt im hellen Blau. Weil beide Spalten gleich hoch sind, liegen ihre
  Unterkanten damit genau aufeinander. Vorher verglich das Auge die Kastenkante
  links mit dem Knopf „Als Datei sichern" rechts — zwei verschiedene Dinge, und
  darum sah es schief aus.

## [1.167.0] - 2026-09-06

### Geändert
- **Auswertung & Sicherung: der Kasten „Prüfungsreife" reicht bis nach unten.**
  Dietmar: „Hier ist auch etwas nicht synchron. Die Auswertung links ist kürzer
  als die Sicherung. Verlängere die Prüfungsreife etwas in die Tiefe, damit es
  rechts synchron ist." Die rechte Spalte — Trefferquote, Stolpersteine,
  Auffrischung, Lernstand sichern — ist fast immer länger; der Rahmen links
  hörte mitten im Fenster auf, während rechts noch Text kam. Jetzt sind beide
  Spalten gleich hoch und der Rahmen füllt seine Spalte aus. Einspaltig (Handy,
  schmales Fenster) behält er seine natürliche Höhe — dort steht ohnehin alles
  untereinander. Nachgemessen bei 1920, 1280, 900 und 412 Punkten.

## [1.166.0] - 2026-09-06

### Geändert
- **Die drei Sinnbilder bleiben oben stehen.** Dietmar: „Die drei Bilder
  switchen mit runter. Die sollen bei bereits gelerntes unterhalb bleiben." —
  „auf der Höhe von Dein Name." In 1.165.0 waren sie mit an den Fuß der Spalte
  gerutscht, um dort mit der Knopfreihe einen Block zu bilden. Jetzt stehen sie
  wieder fest im Textfluss, direkt unter „Bereits gelernte Fragen" und damit auf
  einer Höhe mit dem Kasten „Dein Name" links. An den Fuß geht nur noch die
  Knopfreihe; der freie Platz sammelt sich darüber. Die Unterkanten beider
  Spalten liegen weiterhin auf einer Linie.

## [1.165.0] - 2026-09-06

### Behoben
- **„Neue Runde": die Schrift lief über den Rand.** Im HTML haben alle drei
  Knöpfe die Grundbreite `1 1 140px`, `neueRundeKnopfNachziehen()` setzte beim
  Einblenden aber `1 1 0`. Bei ungleicher Grundbreite bekommt der Knopf mit der
  kleineren am wenigsten Platz — „Neue Runde" wurde schmaler als seine eigene
  Beschriftung. Jetzt setzt die Funktion dieselbe Grundbreite wie die anderen.
- **Die Knöpfe können nicht mehr schmaler werden als ihre Beschriftung.** Das
  `min-width:0` ist raus; damit greift wieder die eingebaute Untergrenze
  (Mindestbreite = Textbreite). Zusätzlich rücken die Seitenabstände in diesen
  beiden Reihen von 1,1 rem auf 0,6 rem zusammen — drei Knöpfe in einer halben
  Fensterbreite brauchen jeden Punkt. Reicht es trotzdem nicht, rutscht der
  letzte Knopf in eine zweite Zeile, statt hinauszulaufen. Nachgemessen bei
  1920, 1600, 1440, 1366, 1280, 1150, 1100, 1024, 900, 768 und 412 Punkten
  Fensterbreite, jeweils mit erstelltem Raum: nirgends ein Überlauf.
- **Die rechte Spalte hängt nicht mehr durch.** Dietmar: „Wenn ich das Feld
  Dein Name öffne, Gruppenraum Konfiguration — ist es auf der rechten Seite
  nicht mehr synchron." Beim Aufklappen wächst die linke Spalte, die rechte
  nicht; die Knopfreihe blieb am Fuß stehen und ließ mitten in der rechten
  Spalte ein Loch. Jetzt bilden die drei Sinnbilder und die Knopfreihe
  zusammen den Fuß der rechten Spalte — der freie Platz sammelt sich an einer
  Stelle oberhalb, statt sich dazwischenzuschieben. Die Unterkanten beider
  Spalten liegen weiterhin auf einer Linie.
- **Läuft ein Raum, fällt die leere Zeile links weg.** „Raum erstellen" und
  „Raum beitreten" werden dann ausgeblendet; ihr Kasten blieb mit seinem
  Innenabstand stehen und machte die linke Spalte länger als nötig.

## [1.164.0] - 2026-09-06

### Geändert
- **Die Knopfreihen stehen jetzt in ihren Spalten, auf einer Höhe.** Dietmar mit
  einem Bild dazu: „Baue die Buttons so ein wie auf dem Bild. Schließen nach
  rechts und Starten nach links. Baue es so ein, dass alle Buttons zu sehen sind
  und nicht überlaufen."

  „Raum erstellen | Raum beitreten" schließt die linke Spalte ab und liegt bündig
  an ihrer linken Kante; „Jetzt starten | Neue Runde | Schließen" schließt die
  rechte Spalte ab und liegt bündig an der rechten. Weil beide Spalten
  verschieden lang sind, werden sie gleich hoch gezogen und die letzte Reihe
  jeweils an den Fuß geschoben — so liegen beide Reihen auf einer Linie.

  Die feste Höchstbreite von 560 Punkten ist weg, die Spalte gibt die Breite
  jetzt vor. Damit nichts seitlich hinausläuft, dürfen die Knöpfe umbrechen:
  Sind sie zu dritt und ist die Spalte zu schmal — am Handy —, rutscht
  „Schließen" in eine zweite Zeile, statt aus dem Fenster zu ragen.

  Nachgemessen bei 1600×1000, 1280×800 und 412×915, jeweils mit und ohne „Neue
  Runde": beide Reihen auf derselben Höhe, bündig an ihren Außenkanten, kein
  seitlicher Überlauf.

## [1.163.0] - 2026-09-06

### Geändert
- **Die drei Knöpfe im Gruppenraum sind bündig.** Dietmar: „Jetzt starten, Neue
  Runde und Schließen muss bündig sein." Vorher nahm sich „Jetzt starten" den
  ganzen übrigen Platz, die anderen beiden standen in ihrer natürlichen Breite
  daneben. Jetzt teilen sich alle drei die Zeile zu gleichen Teilen und sind
  gleich hoch. Fehlt „Neue Runde" — den sieht nur der Gastgeber —, teilen die
  übrigen zwei die Breite unter sich auf, statt eine Lücke stehen zu lassen.

### Hinzugefügt
- **Drei Sinnbilder in der rechten Spalte des Gruppenraums.** Dietmar hat sie
  gezeichnet und weiß geliefert; hier stehen sie im Dunkelblau der Kopfzeile und
  füllen die Fläche, die durch die neue Zweispaltigkeit frei geworden war.

  | Bild | Beschriftung | beim Überfahren |
  |---|---|---|
  | Mensch am Rechner mit Funkwellen | Online übers Internet | „Der Einladungslink führt über den Tunnel zu diesem Rechner. Teilnehmer kommen von überall herein — aus dem Nachbarort genauso wie aus dem Mobilfunk." |
  | Funkwellen | Offline über LAN | „Im selben WLAN geht es auch ganz ohne Internet: Die Adresse mit 192.168 genügt. Für den Kursabend im Vereinsheim heißt das — kein Netz nötig, und keine Frage verlässt euer Netzwerk." |
  | Handy mit Funkwellen | Computer, Handy und Tablet | „Jedes Gerät mit einem Browser macht mit: Windows, Mac, Linux, Android, iPhone. Kein Konto, keine Anmeldung, keine App aus dem Store — der Link genügt." |

  Die Bilder wurden auf ihren Inhalt zugeschnitten, quadratisch ausgerichtet, auf
  192 Punkte gebracht und eingefärbt — die Deckkraft blieb dabei erhalten, nur
  die Farbe wurde gesetzt. Sie stecken als **Data-URI in Index.html**, nicht als
  eigene Dateien: So können sie beim Weitergeben nicht verlorengehen und
  brauchen keinen Eintrag im Installationsprogramm. Index.html wächst dadurch um
  rund 36 KB.

  Die Beschriftung ist auch die Sprechblase — wer das Vorlesen eingeschaltet
  hat, bekommt sie mit.

### Geprüft
Bei 1600 × 1000: drei gleich breite Karten zu je 159 Punkten in der rechten
Spalte, die Knöpfe je 290 Punkte breit und 42 hoch. Keine Skriptfehler.

---

## [1.162.0] - 2026-09-06

### Geändert
- **Die beiden großen Fenster sind jetzt breit und zweispaltig.** Dietmar:
  „Auswertung & Sicherung und Gemeinsamer Modus etwas breiter gestalten.
  Rechteckig horizontal. Wir haben so viel Platz und ziehen uns da so ein
  knappes längliches Fenster rein? Das kann man schöner aufbauen."

  Beide waren auf **480** beziehungsweise **560 Punkte** Breite gedeckelt und
  stapelten alles untereinander — auf einem Bildschirm mit 1900 Punkten eine
  Röhre, durch die man scrollt. Jetzt **1020** und **1040 Punkte**, und der
  Inhalt steht nebeneinander:

  | Fenster | links | rechts |
  |---|---|---|
  | **Gemeinsamer Modus** | Adresse, Einladungslink, Name, Passwort, Konfiguration, Raum anlegen | Raum-Code, Teilnehmer, Status, gelernte Fragen |
  | **Auswertung & Sicherung** | Prüfungsreife | Trefferquoten, Stolpersteine, Auffrischung, Lernstand sichern |

  Die Knopfreihe unten im Gruppenraum bleibt bewusst schmal: Ein 900 Punkte
  breiter Startknopf sieht nicht nach Sorgfalt aus, sondern nach einem
  Versehen.

  **Am Handy und Tablet fällt alles wieder untereinander** — dort ist eine
  Spalte richtig. Dasselbe gilt für ein schmal gezogenes Fenster am Rechner
  (unter 760 Punkten).

### Geprüft
412 × 915 und 820 × 1180: je eine Spalte, nichts läuft seitlich über.
1280 × 800 und 1600 × 1000: zwei Spalten zu je rund 480 Punkten, Fenster 867
bis 1092 Punkte breit. Keine Skriptfehler.

---

## [1.161.0] - 2026-09-06

### Behoben
- **Die eigene Adresse nimmt jetzt auch http.** Die Prüfung von gestern war zu
  streng: Sie ließ nur `https` zu, mit dem Hinweis, dass die App auf dem
  Startbildschirm sonst nicht läuft. Das stimmt — aber sie machte damit genau
  den Test unmöglich, um den es gerade geht: **Kommt von außen überhaupt etwas
  an meinem Anschluss an?** Dafür braucht es `http://adresse:3000`, und der
  Trainer selbst läuft darüber tadellos.

  Statt einer Ablehnung steht jetzt eine Warnung da: „Gesetzt — aber ohne
  https. Der Trainer läuft darüber, die App auf dem Startbildschirm und das
  Mikrofon jedoch nicht." Fehlt der Vorsatz ganz, wird weiterhin `https://`
  ergänzt; wer bewusst `http://` schreibt, bekommt es auch.

### Geprüft
`http://amateurfunk-trainer.duckdns.org:3000` wird angenommen, der
Einladungslink lautet danach
`http://amateurfunk-trainer.duckdns.org:3000/?duo=EYEXWT` und die Warnung steht
darunter. Eingabe ohne Vorsatz wird weiterhin zu `https://…`, dort mit grüner
Bestätigung. Keine Skriptfehler.

---

## [1.160.0] - 2026-09-06

### Hinzugefügt
- **Eigene feste Adresse im Gruppenraum.** Dietmar: „Ich habe einen DNS bei
  DuckDNS erstellt. Ich kann das im Gruppenraum nicht bei dem Link eingeben."

  Stimmt — das Feld „Server-URL" war auf `readonly` gestellt. Es zeigte nur,
  was cloudflared beim Start ausgewürfelt hatte. Für den Regelfall war das
  richtig: Eine von Hand eingetippte Adresse, die auf nichts zeigt, erzeugt
  Einladungslinks, die bei niemandem aufgehen.

  Jetzt steht ein Knopf **Eigene Adresse** daneben: einmal drücken, Feld ist
  offen, Adresse eintragen, noch einmal drücken, gespeichert. Sie hat ab dann
  **Vorrang** vor der automatischen Erkennung — kein Tunnelstart und kein
  Wächter überschreibt sie mehr. Leer speichern nimmt sie wieder zurück.

  Drei Kleinigkeiten, die dabei nötig waren:
  - **`https://` wird ergänzt**, wenn es fehlt, und ein Schrägstrich am Ende
    entfernt — sonst entstünde `…org//?duo=ABC`. Vor dem Fragezeichen kommt
    einer hinzu, damit Messenger den Link als Link erkennen.
  - **Nur https wird angenommen.** Über http lässt kein Browser einen Service
    Worker zu — die App auf dem Startbildschirm liefe also nicht, und das
    Mikrofon bekäme auch keine Freigabe.
  - **Die Tunnelprüfung wird übersprungen.** Der Server kann eine fremde
    Adresse nicht prüfen, er kennt nur seinen eigenen Tunnel. Ohne diese
    Ausnahme hinge der Link für immer auf „wird geprüft", und der Gastgeber
    bekäme nie einen zum Verschicken.

- Die Anleitung unter **Info ▸ Prüfung & Kurs** beschreibt das Feld.

### Geprüft
Eingabe `amateurfunk-trainer.duckdns.org/` wird zu
`https://amateurfunk-trainer.duckdns.org`, der Einladungslink lautet danach
`https://amateurfunk-trainer.duckdns.org/?duo=SW2ZKB`. Nach dem Leeren gilt
wieder der automatisch erkannte Tunnel. Keine Skriptfehler.

---

## [1.159.0] - 2026-09-06

### Geändert
- **Die Prüfungsreife ist von der Hauptansicht in die Statistik gewandert.**
  Dietmar: „Zu groß für die Hauptansicht. Besser wäre, wenn wir Prüfungsreife
  unter Statistik verschieben." Er hat recht — der Kasten ist eine Auswertung,
  und Auswertungen holt man sich, wenn man sie sehen will, statt sie dauernd vor
  sich zu haben. Die Hauptansicht ist damit wieder so kurz wie vorher.

  Er steht jetzt **ganz oben** im Fenster „Auswertung & Sicherung" — vor der
  Tabelle mit den Trefferquoten. Das ist auch inhaltlich die richtige
  Reihenfolge: erst die Antwort auf „Reicht es?", dann die Einzelheiten.

  Die Knöpfe **Video** und **Üben** schließen das Statistik-Fenster, bevor sie
  loslegen. Sonst landete man hinter einem offenen Fenster.

- Die Anleitung unter **Info ▸ Lernen** nennt den neuen Ort.

---

## [1.158.0] - 2026-09-06

### Hinzugefügt
- **Prüfungsreife statt Prozentzahl.** Der neue Kasten steht in der Hauptansicht
  zwischen der Prüfungsübersicht (was verlangt wird) und dem Lernfortschritt
  (was schon sitzt) — genau dazwischen liegt die Frage, die er beantwortet:
  **Reicht es?**

  Bisher stand dort „Technik 61 %". Das ist eine Zahl über die *Vergangenheit*:
  über alle Antworten, die je gegeben wurden, auch die vom ersten Lernabend.
  Jetzt steht dort ein erwarteter Punktestand — **„16 von 25"**, daneben die
  Bestehensgrenze als senkrechter Strich im Balken, und darüber ein Satz in
  Klartext: *„Heute würdest du an Technik N scheitern. Dir fehlen dort im
  Schnitt 3,5 Punkte zur Bestehensgrenze."*

  Ist ein **Prüfungstermin** eingetragen, kommt das Tagespensum dazu. Es zählt
  bewusst genauso wie die Anzeige am Terminfeld darunter — zwei Zahlen
  nebeneinander, die verschieden zählen, wiegen schwerer als eine, die fehlt.

  Darunter **„Wo es klemmt"**: die drei Lektionen des Videolehrgangs, in denen
  die meisten offenen Fehler stecken, jede mit einem Knopf ins Video und einem
  in die Übung. Die Zuordnung Frage → Lektion lag ohnehin schon vor; sie trifft
  die Themen besser als der grobe Prüfungsteil.

### Wie die Zahl zustande kommt
Nicht als Trefferquote über alles Bisherige, sondern als **Vorhersage für einen
echten Bogen**. Für jede Frage des Prüfungsteils wird geschätzt, wie
wahrscheinlich sie richtig beantwortet würde; der Mittelwert mal 25 ist der
erwartete Punktestand — denn genau 25 Fragen werden aus diesem Topf gezogen.

| Zustand der Frage | Schätzung |
|---|---|
| gilt als gelernt | 0,95 |
| im Lernbedarf | 0,35 + 0,15 je richtiger Antwort in Folge, höchstens 0,80 |
| schon beantwortet | aus richtig/falsch, geglättet mit dem Schnitt des Teils; zuletzt richtig hebt auf mindestens 0,75 |
| noch nie gesehen | der Schnitt des Teils |

Die Glättung ist der wichtige Teil: Eine Frage, die einmal richtig war, ist nicht
zu hundert Prozent sicher. Ohne sie wäre die Vorhersage nach dem ersten Abend
viel zu optimistisch.

**Was bewusst nicht dasteht:** keine Prozentzahl mit Nachkommastelle. „73,4 %
Bestehenswahrscheinlichkeit" wäre eine Genauigkeit, die es nicht gibt. Deshalb
steht dort eine Punktzahl und ein Wort — sitzt, knapp, zu wenig. Und der Kasten
erscheint erst, wenn in einem Prüfungsteil **25 Fragen** beantwortet sind; eine
Vorhersage aus drei Antworten wäre geraten, und geraten hilft niemandem. Teile,
die noch zu wenig haben, sagen das in ihrer Zeile.

Die Ansage richtet sich immer nach dem **schwächsten** Teil: In der Prüfung muss
jeder Teil einzeln bestanden werden, ein guter gleicht keinen schlechten aus.

- Die Anleitung unter **Info ▸ Lernen** beschreibt den Kasten.

### Geprüft
Mit erfundenem Lernstand (Vorschriften stark, Betrieb mittel, Technik schwach):
24 / 20 / 16 von 25, Ansage und Farben stimmen, das Tagespensum nennt dieselbe
Zahl wie das Terminfeld darunter (501 offen, 11 am Tag). Der Knopf **Üben**
startet eine Runde mit genau den 18 Fragen der Lektion. Während einer Runde ist
der Kasten ausgeblendet, am Handy steht er untereinander und nichts läuft
seitlich über. Ohne Daten erscheint er gar nicht. Keine Skriptfehler.

---

## [1.157.0] - 2026-09-06

### Hinzugefügt
- **Die Anleitung hat einen eigenen Reiter „Handy & Tablet".** Bisher stand von
  der ganzen mobilen Seite kein Wort darin — weder das Mitmachen über den Link,
  noch die neue Runde, noch der Weg auf den Startbildschirm. Zwei Blöcke sind es
  geworden: **Der Trainer am Handy** (Mitmachen, kein Hauptmenü, neue Runde,
  Bedienung) und **Als App auf den Startbildschirm** (wie es geht, warum es
  https braucht, warum die Adressleiste nur so verschwindet, was ohne Netz
  passiert).

- **Die README beschreibt die mobile Ansicht**, mit Dietmars Bildschirmfoto der
  beiden Ansichten nebeneinander (`bilder/10-mobile.png`): links das Fenster zum
  Mitmachen, rechts eine Frage im Gruppenraum. Der Abschnitt steht direkt unter
  dem Gruppenraum — dort, wo Ausbilder ohnehin nachlesen.

---

## [1.156.0] - 2026-09-06

### Geändert
- **Auch „Zurück" ist im Gruppenraum am Handy weg.** Dietmar: „Der Button
  Zurück kann auch raus." Im Raum geht es der Reihe nach vorwärts; wer
  zurückblättert, sucht meist nur seine schon gegebene Antwort. Beim Gast am
  Handy bleiben damit genau drei Knöpfe: **Weiter**, **Hauptmenü** und der
  **Farbstil**. Für den Gastgeber und am Rechner ändert sich nichts.

---

## [1.155.0] - 2026-09-06

### Hinzugefügt
- **Der Trainer ist jetzt eine Progressive Web App.** Dietmar: „Der Trainer muss
  sich in der mobilen Version wie eine App anfühlen." Und: „Der Link, ich nenne
  das mal Adresszeile, sollte ausgeblendet werden."

  Drei Stücke gehören dazu, alle drei sind jetzt da:

  | Datei | wofür |
  |---|---|
  | `manifest.webmanifest` | Name, Symbol, Start **ohne Adressleiste** (`display: standalone`) |
  | `sw.js` | macht die Seite installierbar und lässt sie ohne Netz starten |
  | `icon-192.png`, `icon-512.png` | was auf dem Startbildschirm liegt |

  **Zur Adressleiste, ehrlich gesagt:** Keine Seite kann sie von sich aus
  ausblenden — sie gehört dem Browser, und sie zu verstecken wäre die älteste
  Betrugsmasche des Netzes. Es gibt genau einen erlaubten Weg, und der ist
  jetzt vorbereitet: Wird der Trainer **auf den Startbildschirm gelegt**,
  startet er als eigene App, mit eigenem Symbol und ohne Adressleiste.

  Damit das niemand suchen muss, erscheint am Handy nach ein paar Sekunden eine
  kleine Leiste unten. Sie zeigt drei verschiedene Texte: in Chrome einen Knopf
  **Einrichten** (das System fragt den Rest), auf dem iPhone den Weg über das
  Teilen-Zeichen, und im eingebauten Browser von Messenger, Facebook oder
  Instagram den Hinweis, den Link erst im richtigen Browser zu öffnen — dort
  geht es prinzipbedingt nicht. Einmal weggetippt, kommt sie nicht wieder.

  Der Service Worker holt **zuerst aus dem Netz** und erst dann aus dem
  Speicher. Umgekehrt wäre es schneller, aber falsch: Der Trainer bekommt fast
  täglich eine neue Index.html, und ein Speicher, der gewinnt, würde die alte
  Fassung festhalten. `/api/`, Gruppenraum und Sprachausgabe werden gar nicht
  angefasst.

  **Eine Einschränkung, die man kennen muss:** Ein Service Worker läuft nur über
  **https** oder auf localhost. Über die nackte LAN-Adresse
  (`http://192.168.…`) meldet ihn kein Browser an. Am Handy heißt das: über den
  **Tunnel-Link** ja, im heimischen WLAN per IP-Adresse nein. Der Trainer läuft
  dort trotzdem — nur eben ohne Symbol auf dem Startbildschirm.

- **App-Anmutung im Detail.** Kein graublauer Blitz beim Antippen, keine
  versehentliche Textmarkierung samt Lupe (Eingabefelder und Fragetext bleiben
  ausgenommen), kein Gummiband am Rand und kein Neuladen durch Ziehen von oben,
  und Platz für Kamera-Aussparung und Wischbalken.

- **Neue Runde für alle.** Dietmar: „Wenn man durch ist, bekommt man eine
  Auswertung. Der Trainer kann, wenn alle fertig sind, eine neue Runde
  starten." Das ging bisher nicht: `startDuoQuiz` antwortet mit `socket.emit`
  an **genau einen** Teilnehmer — richtig so, denn im Raum startet jeder für
  sich. Nur konnte deshalb niemand eine Runde für alle auslösen, und die Fragen
  blieben dieselben.

  Neu ist `neueRunde`: Es würfelt einen **frischen** Fragensatz und schickt ihn
  mit `io.to(code)` an alle im Raum. Antworten, Zeiten und die Sperre für die
  Endauswertung werden zurückgesetzt. Nur der Gastgeber darf das — sonst könnte
  ein Teilnehmer mitten in der Runde allen anderen den Stand wegreißen. Der
  Knopf **Neue Runde** steht im Gruppenraum-Fenster und fragt vorher nach, mit
  der Zahl der Betroffenen.

### Geändert
- **Kein Hauptmenü mehr für Gäste am Handy.** Dietmar: „In der mobilen Version
  wird das Hauptmenü nicht benötigt. Nur der Gruppenraum mit den gemeinsamen
  Fragen." Filterleiste, Startknopf, Prüfungsübersicht, Lernfortschritt,
  Prüfungstermin, Videolehrgang und Verlauf gehören zum eigenen Lernen am
  eigenen Rechner — im Raum entscheidet der Gastgeber, was gefragt wird.

- **„Mitmachen" macht jetzt mit.** Dietmar: „Ich lande im Hauptmenü, nicht im
  Gruppenraum." Vorher wurde nur das Fenster geschlossen, und der Gast stand vor
  der Hauptansicht. Jetzt wird die Runde gleich mitgestartet: Name eintragen,
  tippen, erste Frage. Bis der Server antwortet, steht ein grüner Kasten „Du
  bist im Gruppenraum" da, damit der Knopfdruck nicht ins Leere zu gehen
  scheint.

- **Der Gruppenchat ist am Handy ausgeblendet.** Dietmar: „Der Gruppenchat kann
  raus." Er nahm dort die halbe Anzeige ein und legte sich über die Frage. Am
  Rechner bleibt er.

### Behoben
- **Die Seite ließ sich am Handy seitlich verschieben.** Ursache war eine
  einzige Reihe: der Balken des Lernfortschritts zusammen mit zwei Kästchen,
  dem Zurücksetzen-Pfeil und den Knöpfen „Sichern" und „Einlesen" — alles
  nebeneinander, ohne Umbruch, 549 Punkte breit bei 412 Punkten Bildschirm.
  Dazu ein Sicherheitsnetz: Am Handy ist seitliches Scrollen der Seite ganz
  unterbunden. Was innen scrollen soll — die Filterleiste — hat seinen eigenen
  Rahmen und bleibt unberührt.

### Geprüft
Zwei Browser gleichzeitig: Gastgeber am Rechner, Gast am Handy über den
Einladungslink. Beim Gast steht nur der Namenskasten, kein Hauptmenü, kein Chat,
nichts läuft seitlich über (`scrollWidth` = `clientWidth` = 412). Nach
„Mitmachen" beginnt sofort die erste Frage. Nach dem Durchgang steht die
Auswertung; der Gastgeber drückt **Neue Runde**, und beide bekommen dieselbe
frische Frage, Zähler wieder bei null. Manifest, Service Worker und beide
Symbole werden ausgeliefert (HTTP 200), der Service Worker meldet sich an,
`display` ist `standalone`. Die Hinweisleiste erscheint am Handy, im
Messenger-Browser mit dem passenden anderen Text, am Rechner gar nicht. Die
Rechner-Ansicht ist unverändert. Keine Skriptfehler.

---

## [1.154.0] - 2026-09-06

### Geändert
- **Im Gruppenraum bleibt am Handy und Tablet nur noch, was ein Teilnehmer
  braucht.** Dietmar: „In der Handy- und Tablet-Edition benötige ich nur die
  Buttons für den Mode und Hauptmenü im Gruppenraum. Erst wenn ich den
  Gruppenraum verlasse, benötige ich die Buttons." Auf Nachfrage kamen
  **Zurück** und **Weiter** dazu — ohne sie käme man in der Runde nicht weiter.

  Es bleiben: **Zurück, Weiter, Hauptmenü, Farbstil**, alles zum Raum (Raum,
  Teilnehmer, Chat) und die Knöpfe an der Frage selbst (gelernt, Merkliste,
  Vorlesen, Stimme, Formelblatt).

  Es geht: die Auswertungsspalte samt Umschaltknopf, **Abbrechen**,
  **Google KI**, **Prüfungsziel**, **Suchfeld**, **Info**, **Einstellungen**
  und **Beenden**. Mehrere davon waren nicht nur überflüssig, sondern
  schädlich: Das Prüfungsziel legt der Gastgeber fest, die Suche würde aus der
  gemeinsamen Runde herausspringen, und Nachschlagen zählt im Raum als Fehler.

  **Für den Gastgeber ändert sich nichts** — er muss den Raum steuern können.
  Erkannt wird das über `window.duo.isActive()` und `isHost()`; die Seite trägt
  dann die Klasse `gast-im-raum`. Verlässt man den Raum, fällt sie weg und
  alles steht wieder da, ohne Neuladen.

- **Das große Fenster des Gruppenraums ist für Gäste am Handy auf einen
  Namenskasten geschrumpft.** Dietmar: „Das große Fenster nervt. Hier sollte
  nur ein Fenster für den Namen und Starten vorhanden sein. Ohne Namen kann man
  nicht starten."

  Wer über den Einladungslink hereinkam, sah auf dem Handy zuerst die
  Server-Adresse, den Einladungslink zum Weiterreichen, die Raumkonfiguration
  und „Raum erstellen" — lauter Dinge, die dem Gastgeber gehören. Was er
  wirklich tun musste, stand ganz unten. Ohne das erschien er bei allen anderen
  als **„Benutzer 1"**.

  Jetzt steht dort ein Feld, ein Knopf **Mitmachen** und der Weg hinaus. Der
  Knopf ist gesperrt, solange das Feld leer ist. Ein schon gespeicherter Name
  wird vorgetragen — „Benutzer 1" allerdings nicht, das ist der Platzhalter des
  Servers und kein Name.

  Der Name wird über einen **erneuten Beitritt** in den Raum getragen. Das ist
  kein Umweg, sondern der einzige Weg: Der Name geht nur beim Beitritt mit. Ein
  zweiter Eintrag entsteht dabei nicht, denn der Server legt seine Teilnehmer
  unter der Verbindungskennung ab (`room.users[socket.id]`).

### Behoben
- **Das Fenster des Gruppenraums stand am Handy halb außerhalb des
  Bildschirms.** Sein Kasten ist auf 480 Punkte ausgelegt, und „100 %" bezog
  sich auf einen Bezugsrahmen, den der überbreite Inhalt selbst aufgeblasen
  hatte — gemessen 599 Punkte bei 412 Punkten Bildschirmbreite. Mit `vw` hängt
  die Breite jetzt fest am sichtbaren Bereich.

### Geprüft
Mit zwei Browsern gleichzeitig: Gastgeber am Rechner (1500 × 900) legt einen
Raum an, Gast am Handy (412 × 915) kommt über den Einladungslink herein. Beim
Gast steht nur der Namenskasten, der Knopf ist gesperrt; nach Eingabe von
„Klaus" wird er frei, das Fenster schließt sich, und beim Gastgeber steht in
der Teilnehmerliste **Klaus** statt „Benutzer 1". Die Knopfleiste zeigt beim
Gast genau Zurück, Weiter, Hauptmenü und Farbstil; beim Gastgeber ist alles
unverändert. Nach dem Verlassen des Raums sind beim Gast wieder alle Knöpfe da.
Keine Skriptfehler.

---

## [1.153.0] - 2026-09-06

### Behoben
- **Das große blaue Feld über der Frage am Handy.** Dietmar hat es auf einem
  Bildschirmfoto geschickt: ein 554 Punkte hoher dunkelblauer Block, in dessen
  Mitte klein „Verlauf ausblenden" stand — die Frage begann erst darunter, bei
  Bildpunkt 715, also außerhalb des Sichtfelds.

  Das Feld war der **Umschaltknopf für den Verlauf**. Am Rechner steht er als
  schmaler Reiter *neben* der Frage, und ein Skript bringt ihn auf genau deren
  Höhe, damit die Kante unten stimmt. Am Handy stehen dieselben Elemente
  *übereinander* — und aus dem Reiter wurde ein Feld von der Höhe der ganzen
  Frage. Eine style-Angabe aus dem Skript schlägt jede Regel aus dem
  Stylesheet, deshalb half der vorhandene Media-Query nichts.

  Jetzt hört das Skript auf schmalen Bildschirmen auf zu rechnen und räumt
  gesetzte Höhen wieder weg. Der Knopf ist 46 Punkte hoch.

- **Alles war am Handy auf 80 Prozent verkleinert.** Die automatische
  Anzeigegröße rechnet Fensterbreite geteilt durch 1520. Auf einem Handy mit
  412 Punkten ergibt das 0,27 — gekappt auf die Untergrenze 0,8. Ausgerechnet
  dort, wo am wenigsten Platz ist, wurde also alles kleiner gemacht. Bis 1024
  Punkte Breite bleibt es jetzt bei 100 Prozent; ein schmaler Bildschirm
  braucht ein anderes Layout, keine Lupe rückwärts.

- **Zugeklappt hieß am Handy nicht weg.** Die eingeklappte Auswertungsspalte
  schrumpft am Rechner auf null Breite. Gestapelt blieb sie null Punkte breit,
  aber tausend Punkte hoch — ein leeres Feld unter der Frage.

- **Pinch-Zoom war gesperrt.** In der Viewport-Angabe stand `maximum-scale=1.0`;
  damit lässt sich die Seite auf keinem Handy vergrößern. Für ein Programm, das
  Wert auf Barrierefreiheit legt, war das die falsche Zeile. Sie ist raus.

### Geändert
- **Der Trainer erkennt jetzt, wie breit er steht**, und setzt zwei Klassen an
  die Seite: `schmal` bis 1024 Punkte (Tablet hochkant und Handy) und `handy`
  bis 640 Punkte. Stylesheet **und** Skript richten sich nach derselben Marke.
  Gemessen wird die Breite, nicht das Gerät — ein schmales Fenster am Rechner
  ist dasselbe Problem, und eine Erkennung über die Browserkennung liegt
  regelmäßig daneben. Umgestellt wird auch beim Drehen des Geräts.

- **Am Handy steht die Frage oben.** Nebeneinander sind Auswertung und Frage
  gleich gut sichtbar; untereinander gilt das nicht mehr — was oben steht,
  sieht man, der Rest ist Scrollarbeit. Die Auswertung rutscht deshalb unter
  die Frage und startet zugeklappt. Die Frage beginnt jetzt bei Bildpunkt 199
  statt 715.

- **Fingermaße statt Mausmaße:** Antwortkacheln und Navigationsknöpfe sind
  mindestens 44 bis 48 Punkte hoch. Die Knopfreihe neben dem Fragetext rutscht
  unter ihn, statt ihm die halbe Breite zu nehmen. Die untere Knopfreihe steht
  in zwei Spalten, und in anderer Reihenfolge als am Rechner: **Zurück** und
  **Weiter** oben, wo der Daumen ohnehin ist, **Abbrechen** und **Hauptmenü**
  unten, wo man sie nicht versehentlich trifft.

- **Kein hängender Schwebezustand mehr.** Wo es keinen Zeiger gibt
  (`hover: none`), bleibt eine angetippte Antwort nicht mehr eingefärbt stehen,
  als wäre sie noch ausgewählt.

- **„Beenden" ist am Handy ausgeblendet.** Der Knopf fährt den Trainer auf dem
  Rechner herunter und ist absichtlich nur von dort erreichbar (`localOnly`).
  Auf einem Handy, das über den Gruppenraum-Link hereinkommt, hätte er nur eine
  Fehlermeldung erzeugt.

- Unten bleibt Platz für die Gruppenchat-Leiste, die dort festsitzt.

### Geprüft
Mit dem Testbrowser bei 1920 × 1080, 820 × 1180 (Tablet), 915 × 412 (Handy
quer), 412 × 915 und 360 × 640: keine Seite scrollt seitlich, keine
Skriptfehler. Die Rechner-Ansicht ist unverändert — der Reiter steht dort
weiterhin als 43 × 495 Punkte großer Streifen neben der Frage. Auch das Ziehen
des Fensters von breit auf schmal und zurück wurde geprüft: Die gesetzten Höhen
werden weggeräumt und beim Zurückziehen wieder gesetzt.

---

## [1.152.0] - 2026-09-05

### Geändert
- **Der Videolehrgang läuft jetzt in einem eigenen Fenster statt im Trainer.**
  Dietmar: „Video im Fenster abspielen möchte ich ändern. Videolehrgang von
  DL2YMR in einem neuen Fenster öffnen."

  Bisher gab es zwei Wege: Wer auf der Liste im `video_embed.json` stand, bekam
  einen eingebetteten Player *innerhalb* des Trainers, alle anderen einen neuen
  Tab auf YouTube. Jetzt gilt der zweite Weg für alle. Das Video lässt sich
  neben den Trainer legen, es hat die volle Bedienung von YouTube
  (Geschwindigkeit, Untertitel, Kapitel, Vollbild) — und der Aufruf zählt
  regulär für Michael, DL2YMR, samt Werbung.

  Der Schalter bleibt stehen: `VIDEO_IM_FENSTER` in Index.html auf `true`, und
  der eingebettete Player ist zurück. Geöffnet wird bewusst über den simulierten
  Klick auf einen Link (`openExternalTab`) und **nicht** über `window.open` mit
  Feature-Angaben — sobald dort ein dritter Parameter steht, macht Chrome ein
  echtes Popup daraus, und das fängt der Popup-Blocker ab.

- **Sprechblase und Vorlesetext der Videokachel** sagen jetzt, was passiert:
  „Videolehrgang von DL2YMR in einem neuen Fenster öffnen."

### Behoben
- **„DL2YMR" wird buchstabiert statt gelesen.** Dietmar: „DL2YMR müssen als
  Buchstaben vorgelesen werden." Als Wort gelesen klang das Rufzeichen wie ein
  Nieser. Die Regel arbeitet wie die für DARC: Bindestriche trennen die
  Buchstaben, ohne ein Wort dazuzusetzen — `D-L-2-Y-M-R`. Sie steht an beiden
  Stellen, in `tts-expand.js` (Piper über den Server) und in Index.html
  (Notstimme des Browsers), und greift auch in Klein- und Mischschreibung.

- Die Anleitung unter **Info** beschreibt das neue Verhalten.

---

## [1.151.0] - 2026-09-05

### Hinzugefügt
- **Der Knopf neben der Frage führt jetzt wahlweise in die KI.** Dietmar: „Bei
  dem Google Button, kann man das auch in die KI leiten?"

  Ja — und weil die Meinungen auseinandergehen, was beim Lernen mehr hilft, ist
  das Ziel unter **Einstellungen ▸ Allgemein ▸ Nachschlagen** wählbar:

  | Ziel | was passiert |
  |---|---|
  | **Google KI** (Voreinstellung) | KI-Modus der Google-Suche (`udm=50`) |
  | Google | die gewohnte Websuche mit Trefferliste |
  | ChatGPT | chatgpt.com mit fertig eingetragener Frage |
  | Perplexity | perplexity.ai, antwortet mit Quellenangaben |

  Der Knopf trägt Namen und Zeichen des gewählten Ziels — vor dem Klick ist
  also zu sehen, wo man landet.

- **Zwei verschiedene Texte gehen hinaus.** An die Suche wie bisher Stichworte.
  An eine KI dagegen eine ausformulierte Bitte: „Erkläre mir bitte diese Frage
  aus der deutschen Amateurfunkprüfung … Sag mir, welche Antwort richtig ist,
  und begründe kurz und verständlich, warum." Eine Aneinanderreihung von
  Stichworten beantwortet eine KI sonst mit Vermutungen. Bei **Bildfragen**
  steht ausdrücklich dabei, dass die Antworten als Bilder vorliegen und nicht
  mitgeschickt werden konnten — sonst rät die KI über Antworten, die sie nie
  gesehen hat.

### Anmerkung
- **Gemini steht nicht zur Wahl.** Diese Seite nimmt keine fertige Frage aus
  der Adresse entgegen; man käme dort auf einer leeren Seite an und müsste die
  Frage abtippen. Der KI-Modus der Google-Suche kann es und läuft auf demselben
  Google-Sprachmodell.

- Im **Gruppenraum** und im **Prüfungssimulator** zählt Nachschlagen weiterhin
  als Fehler — egal welches Ziel eingestellt ist. Der Knopf warnt dort wie
  bisher mit rotem Rand und Hinweistext.

- Die Anleitung unter **Info** beschreibt den Knopf neu.

---

## [1.150.0] - 2026-09-05

### Hinzugefügt
- **Hinweis am Link 50ohm.de in der Fußzeile.** Wer mit der Maus darüberfährt,
  liest jetzt: „Auf der Seite von 50 Ohm findest du Kurse, Trainings-App,
  Ausbildungspaten und das Buch Klasse N zur Ausbildung." Bisher stand dort nur
  der nackte Link — was einen dort erwartet, war nicht zu sehen. Der Text ist
  zugleich Sprechblase (`data-tooltip`) und wird beim Überfahren vorgelesen.

---

## [1.149.0] - 2026-09-05

### Geändert
- **Bilder wachsen jetzt an ihrer Stelle statt in der Fenstermitte.** Dietmar:
  „Das Vergrößern mittig finde ich nicht besonders schön. Hier wäre mir ein
  Vergrößern an der Stelle wo das Bild sitzt angenehmer. Bei den Fragen mit
  4 Bildern: Hier wäre links oben das Vergrößern auch an Ort und Stelle lieber.
  Das gleiche bei rechts oben und links unten und rechts unten."

  Bisher wurde das überfahrene Bild in einer Ebene über der Seite **mittig**
  gezeigt. Der Blick musste jedes Mal von der Kachel zur Fenstermitte springen
  und wieder zurück — bei vier Bildern nebeneinander vier Mal, immer an
  dieselbe Stelle, egal welches Bild gemeint war.

  Jetzt bleibt das Bild dort, wo der Zeiger steht. Bei den vier Antwortbildern
  hängt es an der Ecke, die dem Fensterrand am nächsten liegt, und wächst von
  dort nach innen: **links oben** nach rechts unten, **rechts oben** nach links
  unten, **links unten** nach rechts oben, **rechts unten** nach links oben. So
  läuft die Vergrößerung immer ins Fenster hinein und nie darüber hinaus; zur
  Sicherheit wird sie am Schluss noch in den sichtbaren Bereich geschoben.

  Das **einzelne Fragebild** hat keinen Nachbarn, dem es ausweichen müsste. Es
  wächst deshalb um seine eigene Mitte herum — das wirkt ruhiger als ein Bild,
  das zur Seite wegkippt.

- **Im Vollbild wird größer vergrößert, im Fenster weniger.** Dietmar: „Im
  Vollbild kann das Vergrößern etwas größer sein. Im normalen Modus etwas
  weniger." Es gibt jetzt zwei Sätze von Grenzen statt einem: im Fenster
  38 Prozent der Fensterfläche und höchstens 520 × 300 (Fragebild) bzw.
  400 × 250 Bildpunkte (Antwortbild), im Vollbild 52 Prozent und höchstens
  780 × 440 bzw. 620 × 380. Im normalen Fenster stehen daneben noch Verlauf
  und Seitenleiste — dort war die alte Größe zu üppig.

- **Die Anzeigegröße rechnet jetzt sauber mit.** Die Vergrößerung wird in
  Bildschirmpunkten berechnet und erst beim Setzen in Seitenpunkte
  zurückgerechnet. Ohne diese Trennung saß das große Bild bei einer
  Anzeigegröße von 125 Prozent daneben und wählte die falsche Ecke.

- Die Anleitung unter **Info** beschreibt das neue Verhalten.

---

## [1.148.0] - 2026-09-05

### Behoben
- **Im Chat ließ sich erst schreiben, nachdem jemand geschrieben hatte.** Dietmar:
  „Ich kann erst im Chat schreiben, wenn mir davor jemand geschrieben hat."

  Genau so war es gebaut: Das Chatfenster kam **zugeklappt** auf die Welt — nur
  die Kopfleiste war zu sehen, das Eingabefeld steckte darunter. Aufgeklappt hat
  es sich erst, wenn eine **fremde** Nachricht eintraf. Wer als Erster schreiben
  wollte, fand kein Feld und hätte die Kopfleiste anklicken müssen — die aber wie
  eine Überschrift aussieht, nicht wie ein Knopf
- Jetzt klappt der Chat beim Betreten des Raums einmal von selbst auf, beim
  Gastgeber wie beim Gast. Wer ihn zumacht, dem bleibt er zu; ein neu
  eintreffender Raum-Zustand reißt ihn nicht wieder auf
- Beim automatischen Aufklappen springt der Schreibcursor **nicht** ins Chatfeld
  — in dem Moment ist man beim Einladungslink, nicht beim Schreiben

### Geändert
- **„Schließen" beendet den Gruppenraum wirklich.** Dietmar: „Wenn ich im
  Gruppenraum den Button schließen betätige, muss auch der Gruppenchat beendet
  werden" — und auf Nachfrage: den Raum wirklich beenden.

  Bis dahin gab es **überhaupt keinen Weg**, einen Raum absichtlich zu verlassen.
  Der Knopf machte nur das Fenster zu: Der Raum lief weiter, das Chatfenster
  blieb am Bildschirm stehen und der Knopf „Raum" in der Kopfzeile ebenso
- **Nur der Gastgeber beendet den Raum für alle.** Wer zu Gast ist, meldet sich
  mit demselben Knopf nur selbst ab und lässt den Raum stehen — sonst könnte ein
  beliebiger Teilnehmer allen anderen den Kursabend beenden
- Die Gäste bekommen dabei eine Zeile: „Der Gastgeber hat den Gruppenraum
  beendet." Wer selbst geschlossen hat, sieht nichts — er weiß es

### Geprüft
Mit zwei Browsern, Gastgeber und Gast:

- Direkt nach dem Erstellen ist das Chatfeld da — beim Gastgeber und, nach dem
  Beitreten, auch beim Gast
- „Schließen" beim Gastgeber: Chat weg, Fenster zu, Raum aus — **und beim Gast
  ebenso**, mit der Meldung auf dem Bildschirm
- Keine Fehler in beiden Browsern

---

## [1.147.0] - 2026-09-05

### Behoben
- **Der Verlauf rechts war zu kurz.** Dietmar: „Die Ansicht bei Benutzer ist zu
  kurz. Im Vollbild passt die Länge. Vermutlich hat sich beim Hinzufügen vom
  Vollbild was verändert." — Die Spur war richtig, die Ursache lag aber nicht am
  Vollbild, sondern an der **Anzeigegröße**, die kurz davor dazukam. Seitdem sind
  zwei Zahlen verschieden, die vorher gleich waren:

  | | bei 125 % |
  |---|---|
  | `getBoundingClientRect().height` | 552 — was man **sieht** |
  | `offsetHeight` | 441 — womit die Seite **rechnet** |

  Geschrieben wird in `style.maxHeight`, und das zählt in der zweiten Einheit.
  Die erste dort hineinzuschreiben setzt eine Höhe, die noch einmal mit 1,25
  multipliziert wird. Jetzt wird `offsetHeight` gemessen — beides dieselbe Einheit
- Aus demselben Grund fragt die Umschaltung auf schmale Bildschirme jetzt
  `clientWidth` statt `innerWidth`: `innerWidth` nennt den echten Schirm (1920),
  `clientWidth` den Raum, in dem die Seite rechnet (bei 125 % also 1536) — und
  mit dem arbeitet auch der Media-Query. Sonst trifft das Programm irgendwann
  eine andere Entscheidung als das Stylesheet
- **Ein Knopf wurde beim zweiten Überfahren nicht mehr vorgelesen.** Dietmar:
  „Erst wenn ich einen anderen Button auswähle und zurück zu dem wechsle, wo er
  nicht vorgelesen hat, liest es den Button vor." Genau so war es gebaut: Ein
  Merker hielt den zuletzt gesprochenen Satz fest, wurde beim Verlassen des
  Knopfes aber nie geleert. Beim nächsten Überfahren sagte der Vergleich „läuft
  schon" — und es kam nichts. Der Vergleich ist entfallen; den Fall, für den er
  gedacht war, fängt die Zeile darüber schon ab

### Geändert
- **Alle Knöpfe heben sich beim Überfahren, nach einer Sekunde.** Dietmar:
  „Teilweise ist beim Mouse Overlay ein Heben von dem Button aufgefallen und bei
  anderen ist das nicht. […] Durch dem Heben wird das Vorlesen der Buttons
  aktiviert." Bisher hob sich nur `.btn` — und sofort. Die Knöpfe im Verlauf, im
  Lernfortschritt und in den Fenstern lagen still
- **Die Sekunde ist die Verabredung mit der Sprachausgabe:** Der Knopf hebt sich
  in dem Moment, in dem der Satz beginnt. Die Vorlese-Verzögerung ist deshalb von
  450 ms auf 1000 ms gegangen; beide Zahlen verweisen im Quelltext aufeinander
- Der Weg zurück hat **keine** Verzögerung — wer den Zeiger wegnimmt, will den
  Knopf sofort wieder flach sehen
- Ausgenommen bleiben die Punkte im Verlauf (die haben ihr eigenes Vergrößern),
  die Antwortfelder (dort wäre ein Heben ein falsches Signal) und alles
  Abgeschaltete

### Geprüft
- Spaltenhöhen bei 1920×1080 (125 %) und 1366×768 (90 %) mit 60 zusätzlichen
  Verlaufszeilen: **Unterschied 0 Punkte** in beiden Fällen
- Heben nachgemessen: nach 0,4 s noch flach, nach 1,4 s um 2 Punkte gehoben —
  auch am Zahnrad, das sich vorher gar nicht bewegt hat
- Denselben Knopf zweimal überfahren: **zweimal gesprochen**
- Antwortfelder heben sich nicht, die Verlaufspunkte vergrößern sich weiter wie
  bisher

---

## [1.146.0] - 2026-09-05

### Behoben
- **„DARC" wird buchstabiert, nicht gelesen.** Dietmar: „DARC liest es als Dark.
  Es muss DARC aussprechen. D A R C mit einer sehr kleinen Pause dazwischen bei
  allen Sprachen." An die Sprachausgabe geht jetzt **`D-A-R-C`**
- Die Bindestriche trennen, ohne dass ein Wort dazukommt. Ein Komma machte eine
  deutlich längere Pause, ein Schrägstrich würde als „Strich" mitgesprochen — es
  ist dieselbe Technik, mit der hier schon „Antennen-anlage" getrennt wird, damit
  Piper nicht „Andenanlage" daraus macht
- **An zwei Stellen eingetragen**, weil es zwei Wege zur Sprachausgabe gibt:
  `tts-expand.js` auf der Serverseite gilt für alles, was Piper spricht — also
  für jede Stimme; die Tabelle in `Index.html` deckt zusätzlich die Notstimme des
  Browsers ab, die nie am Server vorbeikommt. Doppelt angewandt schadet nichts:
  Nach dem ersten Mal steht dort `D-A-R-C`, und darauf passt die Regel nicht mehr
- Die Regel steht ganz oben im Ausdruck, gleich nach Lambda — später greifen
  Regeln, die auf Großbuchstabenfolgen schauen, und die sollen dieses Wort nicht
  mehr vorfinden

### Geprüft
- Mitgeschnitten, was wirklich an die Sprachausgabe geht: „… der Lehrgang des
  **D-A-R-C**. Dort steht das Kapitel …"
- Sechs Schreibweisen durchgespielt, darunter „DARC-Ortsverband" und „der DARC
  e.V." — überall richtig getrennt, und kein anderes Wort wird berührt

---

## [1.145.0] - 2026-09-05

### Hinzugefügt
- **Eine Aussprache-Tabelle für die Sprachausgabe.** Dietmar: „Jetzt sagt
  Kerstin Mekliste." — das *r* im „rk" fehlte. Zusammengesetzte Wörter getrennt
  zu schreiben hilft dort: „Merkliste" geht als **„Merk Liste"** an die Stimme,
  beide Teile werden ausgesprochen statt verschliffen
- **Die Regel für Einträge in dieser Tabelle:** nur echte Wörter, nur Trennungen
  von Zusammensetzungen, **keine erfundenen Schreibweisen**. Der Versuch,
  „Blättern" als „Blettern" zu schreiben, ist genau daran gescheitert — ein Wort,
  das in keinem Wörterbuch steht, muss die Stimme raten
- **Ein Wort am Satzanfang, gefolgt von einem Punkt, bekommt jetzt ein Komma.**
  Das betraf die ausführlichen Erklärungen, die alle mit dem Knopfnamen und
  einem Punkt beginnen: „Merkliste. Hier stehen …" war dieselbe Form, an der die
  Stimme schon bei „Blättern." gescheitert ist. Jetzt: „Merkliste, hier stehen …"

### Geändert
- **Das Suchfeld sagt „Suchen nach Fragen oder Schlagwörtern."** Dietmar: „Beim
  Suchfeld kommt: ‚Suche Start'. Hier wäre ein ‚Suchen nach Fragen oder
  Schlagwörter' besser."

### Technisch
- Die Aussprache läuft als **letzter Schritt**, unmittelbar vor der
  Sprachausgabe. Beim ersten Versuch stand sie am Anfang — dann sah der Rest des
  Programms „Merk Liste", zwei Wörter, und die Regel, die einem Einzelwort einen
  Nachsatz gibt, sprang nicht mehr an
- Innerhalb der Aussprache kommt **erst der Punkt, dann die Tabelle**. Andersherum
  wäre aus „Merkliste. Hier stehen …" schon „Merk Liste. Hier …" geworden — zwei
  Wörter, und die Kommaregel hätte nicht mehr gegriffen. Der Punkt bliebe stehen,
  und genau der ist das Problem
- Beide Reihenfolgen sind der Grund, warum es zwei Anläufe brauchte; sie stehen
  als Merksatz im Quelltext

---

## [1.144.0] - 2026-09-05

### Behoben
- **Kein Knopf schickt der Sprachausgabe mehr ein nacktes Einzelwort.** Dietmar
  zu „Merkliste": „bei Merkliste kommt ein Verplisse." Damit ist die Regel von
  1.142.0 widerlegt — es lag nicht am Punkt. Auch ein Wort **ohne** Punkt gerät
  daneben; bei „Starten" und „Lernbedarf" hatte es nur zufällig geklappt

  Der Grund ist derselbe wie bei „Blättern": Eine Äußerung aus einem einzigen
  Wort ist für diese Modelle die unsicherste Form überhaupt — Anfang, Betonung
  und Ende müssen aus dem Nichts entstehen. Sobald ein zweiter Halbsatz folgt,
  hat das Modell einen Zusammenhang
- **Der Nachsatz wird nicht erfunden, er stand schon da:** Es ist der Teil der
  Sprechblase hinter dem Trennstrich, den die Kurzfassung bisher weggeworfen hat.

  | Knopf | gesprochen |
  |---|---|
  | Merkliste | „Merkliste, gemerkte Fragen ansehen und der Reihe nach lernen." |
  | Lernbedarf | „Lernbedarf, oft falsch." |
  | Starten | „Starten, 561 von 571 Fragen noch nicht gelernt." |
  | Prüfungssimulator | „Prüfungssimulator, echte Prüfungsbedingungen." |

- **Geschnitten wird an einem Satzzeichen, nie zwischen zwei Wörtern, die
  zusammengehören.** Der erste Versuch schnitt nach sechs Wörtern ab und ergab
  „und der Reihe." und „je 25 Fragen und." — Sätze, die mitten im Satzteil
  aufhören. Genau das war hier schon einmal ein Fehler („Bei Weiterblättern
  verschluckt es Silben")
- Zwei Knöpfe, deren Sprechblase als Aufzählung weitergeht, haben einen eigenen
  Text bekommen, weil der erste Halbsatz allein ein schiefes Bild ergäbe:
  **Einstellungen** („Einstellungen für Anzeige, Vorlesen und Update.") und das
  **Suchfeld** („Suchfeld für Fragennummer oder Stichwort.")

### Geprüft
- Alle 24 sichtbaren Knopftexte im Kurzmodus durchgezählt: **kein einzelnes Wort
  mehr**, und keiner endet auf einem Füllwort wie „und", „der" oder „je"

---

## [1.143.0] - 2026-09-05

### Geändert
- **Der Satz im Band oben und „später" sind jetzt weiß** — so wie bei 50 Ohm
  selbst. Dietmar: „Am Trainer hat sich etwas geändert, seit diese Seite geladen
  wurde und später bitte in der Farbe weiss."
- Ich hatte sie in 1.141.0 dunkel gesetzt, weil Weiß auf diesem Blau nur 2,6:1
  trägt und damit unter den 4,5:1 liegt, die als lesbar gelten. Das bleibt so —
  aber es ist Dietmars Programm, und es sieht damit aus wie das Vorbild
- Was bleibt, um die Zeile trotzdem lesbar zu halten: fette Schrift, eine Zeile
  allein, und der Knopf **„Jetzt neu laden"** weiterhin weiß mit dunkler Schrift.
  Der trägt 15:1 — und er ist das, worauf es ankommt, wenn jemand das Band nur
  streift

---

## [1.142.0] - 2026-09-05

### Geändert
- **Der Vollbild-Knopf sagt jetzt „Vollbild zum Vergrößern."** Dietmar:
  „Vollbild spricht Kerstin sehr schnell aus." — und gleich mit dem Wortlaut
  hinterher

### Behoben
- **Ein einzelnes Wort bekommt keinen Punkt mehr mitgeschickt.** Aus zwei
  Rückmeldungen ergibt sich ein klares Muster:

  | ging daneben | kam sauber heraus |
  |---|---|
  | „Blättern**.**" · „Vollbild**.**" | „Starten" · „Merkliste" · „Lernbedarf" · „Prüfungssimulator" |
  | ein Wort **mit** Punkt | ein Wort **ohne** Punkt |

  Der Punkt macht aus dem Wort eine abgeschlossene Äußerung, und eine Äußerung
  aus einem einzigen Wort ist für diese Modelle die unsicherste Form überhaupt:
  Sie müssen Anfang, Betonung und Ende aus dem Nichts erzeugen. Ohne Punkt läuft
  es als Fragment durch und klingt ruhig
- Die Regel gilt jetzt für alle Knöpfe, nicht nur für die beiden gemeldeten —
  mit gefangen wird dadurch „Suchfeld.", das denselben Fehler gehabt hätte.
  Sätze mit mehreren Wörtern behalten ihren Punkt; dort hilft er der Betonung

### Geprüft
- Alle 24 sichtbaren Knopftexte im Kurzmodus durchgezählt: Kein einziger ist
  noch ein einzelnes Wort mit Punkt

---

## [1.141.0] - 2026-09-05

### Geändert
- **„Blättern" ohne das „Zum".** Dietmar: „Jetzt klingt es gut. Zum gehört raus.
  Nur ‚Blättern, alle Fragen'." — Damit ist auch klar, woran es wirklich lag:
  **nicht an der Stellung, sondern am Punkt.** „Blättern." war für das Modell
  eine vollständige, sehr kurze Äußerung, und die geriet ihm daneben. Ein Komma
  hält den Satz zusammen; das Wort bekommt seinen Klang aus dem, was folgt:

  | | jetzt |
  |---|---|
  | kurz | „Blättern, alle Fragen der Reihe nach." |
  | kurz, mit Lesezeichen | „Weiterblättern, weiter bei Frage 41 von 571." |
  | ausführlich | „Blättern, diese Funktion hilft dir …" |

- **Das Band oben trägt jetzt die 50-Ohm-Farbe** statt des Brauns. Dietmar: „Bei
  Update möchte ich oben kein Braun, sondern die 50 Ohm Farbe." Der Wert
  `#00adef` ist aus dem Knopf „Jetzt starten" auf 50ohm.de gemessen — derselbe,
  der im Nachtstil des Trainers schon steht
- **Die Schrift darauf ist dunkel, nicht weiß.** 50 Ohm setzt auf dieses Blau
  weiße Schrift; die trägt aber nur 2,6:1 und liegt damit weit unter den 4,5:1,
  die als lesbar gelten. Dunkles Marineblau darauf kommt auf **5,9:1**, der
  Knopf „Jetzt neu laden" auf 15:1. Die Farbe ist ihre, die Lesbarkeit bleibt
  unsere — auf einem Band, das jemanden zum Neuladen bewegen soll, wäre schlecht
  lesbare Schrift ein Widerspruch in sich
- Zur Sicherheit festgehalten: Das ist die **Farbe**, nicht das Logo. Das blaue
  50-Ohm-Zeichen ist markenrechtlich geschützt und bleibt draußen, bis die
  Vorstandschaft es freigibt

---

## [1.140.0] - 2026-09-05

### Geändert
- **„Blättern" steht der Sprachausgabe nicht mehr am Satzanfang.** Dietmars
  dritte Rückmeldung war die entscheidende: „Es ist viel mehr so ein Bitttööö
  alle Fragen der Reihe nach." — Der **Rest des Satzes kommt sauber heraus**,
  kaputt ist nur das erste Wort.

  Das ist ein bekanntes Verhalten dieser Sprachmodelle: Der Anfang einer
  Äußerung ist die unsicherste Stelle, weil das Modell noch keinen Klang hat, an
  dem es sich orientiert. Ein harter Anlaut — hier das „Bl" — trifft genau
  dorthin, und bei 16 kHz fällt das Ergebnis auseinander. Kerstin ist die
  einzige verbliebene Stimme mit dieser Rate
- Das Wort bekommt deshalb einen **Anlauf**: der Satz beginnt mit einem leichten
  „Zum", das Stichwort steht an zweiter Stelle.

  | | vorher | jetzt |
  |---|---|---|
  | kurz | „Blättern. Alle Fragen der Reihe nach." | „**Zum** Blättern durch alle Fragen der Reihe nach." |
  | kurz, mit Lesezeichen | „Weiterblättern. Weiter bei Frage 41 von 571." | „**Zum** Weiterblättern bei Frage 41 von 571." |
  | ausführlich | „Blättern. Diese Funktion hilft dir …" | „**Zum** Blättern. Diese Funktion hilft dir …" |

  Für die Augen ändert sich nichts — auf dem Knopf steht weiter „Blättern", und
  der Hinweistext ist unverändert

### Anmerkung zu den drei Anläufen
Der Weg dorthin gehört ins Protokoll, weil zwei der drei Versuche danebenlagen:
„Blettern" zu schreiben war ein Fehlgriff (ein erfundenes Wort steht in keinem
Wörterbuch), und ein Satz drumherum allein reichte nicht, solange das Wort vorne
stand. Erst Dietmars Beobachtung, dass der Rest des Satzes stimmt, hat die
Ursache eingekreist. Nachgehört werden kann hier nicht — die Sprechprobe in den
Einstellungen enthält das Wort deshalb seit 1.139 mitten im Satz und ist der
schnellste Weg, eine Stimme darauf zu prüfen.

---

## [1.139.0] - 2026-09-05

### Entfernt
- **Der untere Kasten „Weitere Stimmen" ist weg.** Dietmar: „Das untere Feld
  ‚weitere Stimmen' kann raus. Wir haben oben ausgewählt was an Stimmen
  hinzugefügt wird." Richtig — seit es „Stimmen hinzufügen" neben „Probe hören"
  gibt, war der Haken darunter ein zweiter Weg zum selben Ziel. Der Code für die
  Einzelauswahl ist mit herausgenommen, nicht nur der Kasten: toter Code, den
  niemand mehr aufruft, ist die nächste Falle

### Geändert
- **„Blättern" wird wieder als „Blättern" gesprochen.** Der Versuch mit
  „Blettern" war ein Fehlgriff — Dietmars Protokoll zeigt ihn schwarz auf weiß:
  `[TTS] Model:de_DE-kerstin-low.onnx Text:Blettern.`, und geklungen hat es
  danach „ungefähr so: Bisssöööö". Ein erfundenes Wort steht in keinem
  Aussprachewörterbuch; die Stimme muss raten, und das war die schlechtere Wette
- **Stattdessen bekommt das Wort einen Satz um sich herum:** „Blättern. Alle
  Fragen der Reihe nach." Sprachmodelle rechnen den Klang aus dem Zusammenhang.
  Dasselbe Protokoll zeigt auch, dass es nicht an einzelnen Wörtern generell
  liegt — „Starten" kommt sauber heraus —, sondern an diesem einen mit dieser
  einen Stimme. Ein kurzer Satz kostet nichts und gibt dem Modell den Halt, den
  es braucht
- **Die Sprechprobe enthält das Wort jetzt:** „So klingt die Stimme, die dich
  durch das Menü führt — zum Beispiel beim Blättern durch den Fragenkatalog."
  Damit lässt sich mit einem Klick prüfen, ob es bei einer Stimme klappt, statt
  erst den Knopf zu suchen

### Behoben
- **„Fehler beim Laden der Stimmen"** war kein Fehler, sondern ein Ende. In
  Dietmars `server.log` steht eine Minute vor seiner Meldung: *„[ENDE] Kein
  Fenster mehr offen. Der Trainer macht Feierabend."* Die Seite blieb offen, der
  Server war weg — und die Auskunft „Server nicht erreichbar oder Fehler beim
  Abrufen der Stimmen" klang nach Defekt. Jetzt steht dort, was wirklich los
  ist: *„Der Trainer antwortet nicht mehr. Meist heißt das: Er hat sich beendet,
  weil kein Fenster mehr offen war. Zum Weiterlernen START noch einmal ausführen
  und diese Seite neu laden."*

---

## [1.138.0] - 2026-09-05

### Geändert
- **Die kurze Meldung unten rechts hat jetzt die Farbe ihrer Nachricht.**
  Dietmar: „Als gelernt abgehakt Popup unten rechts möchte ich das gleiche Grün
  wie bei der Frage richtig beantwortet, und bei entfernt gelernt in dem Rot wie
  bei einer falschen Antwort."

  Sie hatte bis jetzt nur eine Farbe: das Rot der Fehlerwertung. Das passte für
  „Nachgeschlagen — hier als Fehler gewertet", aber nicht für „Als gelernt
  abgehakt" — da stand eine gute Nachricht in Warnrot
- Genommen werden **dieselben zwei Farben wie an den Antworten**
  (`--darc-richtig` und `--darc-falsch`), beide mit schwarzer Schrift, wie dort
  auch. Wer eine Frage abhakt und aus dem Augenwinkel etwas aufblitzen sieht,
  weiß damit ohne Lesen, was passiert ist
- Mit umgestellt: „Wieder als CB-Wissen angerechnet" (grün) und „Zurück in den
  Lernstapel" (rot) — dieselben zwei Vorgänge, nur bei CB-angerechneten Fragen
- **Die dritte Farbe bleibt**, wofür sie gedacht war: die Fehlerwertung beim
  Nachschlagen und beim Anzeigen der Lösung. Das ist kein Ergebnis an einer
  Antwort, sondern eine Warnung — und soll auch nicht aussehen wie eine

### Geprüft
- Die Farben Pixel für Pixel gegen die Antworten verglichen: Meldung und
  richtige Antwort sind beide `rgb(59, 181, 131)`, Meldung und falsche Antwort
  beide `rgb(254, 117, 108)`, jeweils mit schwarzer Schrift
- Schwarz auf beiden Farben trägt gut 8:1 — dieselbe Rechnung wie bei den
  Antworten

---

## [1.137.0] - 2026-09-05

### Hinzugefügt
- **Anzeigegröße** in den Einstellungen unter *Allgemein*. Dietmar: „Bei
  Vergrößern wird die Fläche größer auf dem Bildschirm. Hier möchte ich eine
  dynamische Vergrößerung von dem Trainer. Bei mir wäre zB 125 % gut. Auf meinem
  Laptop 15 und 17 Zoll vermutlich wieder schlecht. Hier muss es sich
  verkleinern."

  Er hat den wunden Punkt getroffen: Das Vollbild schafft Platz, macht aber
  nichts größer — die Schrift bleibt, wie sie war, und der Gewinn ist mehr Weiß
  am Rand
- **„Automatisch" rechnet aus dem Fenster.** Der Trainer ist für rund
  1520 × 870 Punkte entworfen; darüber darf alles im selben Verhältnis wachsen,
  darunter muss es schrumpfen. Genommen wird die kleinere der beiden Richtungen
  — ein breiter, flacher Schirm hat trotzdem nur die Höhe, die er hat.
  Nachgemessen:

  | Bildschirm | Ergebnis |
  |---|---|
  | 1280 × 800 | 85 % |
  | 1366 × 768 (15-Zoll-Laptop) | 90 % |
  | 1920 × 1080 (Dietmars Schirm) | **125 %** |
  | 2560 × 1440 | 150 % (Grenze) |

  Gerundet wird auf 5 %, damit ein Fenster, das man um zehn Punkte zieht, nicht
  dauernd die Schrift verändert
- Fest wählbar sind 90, 100, 110, 125 und 150 %
- **Im Beamer-Modus bleibt es bei 100 %.** Der rechnet seine Größen ohnehin aus
  der Bildschirmgröße; beides zusammen hieße zweimal vergrößern, und die Frage
  stünde unten aus dem Bild heraus

### Technisch
- Skaliert wird mit `zoom` auf dem Wurzelelement, nicht mit `transform: scale`.
  `transform` verschiebt nur das Bild — der Platz darunter bleibt, wie er war,
  und alles läuft aus dem Fenster. `zoom` rechnet die Größen wirklich um, der
  Umbruch stimmt danach
- **Der Haken an `zoom`:** `vh` und `vw` beziehen sich weiter auf den echten
  Bildschirm und werden anschließend mitskaliert. `max-height:90vh` wäre bei
  125 % also 112 % der Bildhöhe — jedes Fenster stünde über. Alle 27 Stellen mit
  `vh` oder `vw` stehen deshalb jetzt als `calc(90vh / var(--afu-zoom))`; die
  Variable hebt die Skalierung dort wieder auf. Wer eine neue Stelle mit `vh`
  oder `vw` baut, muss das mitnehmen — es steht als Merksatz im Quelltext
- Gesetzt wird die Größe **vor dem ersten Zeichnen**, im selben frühen Block wie
  der Farbstil. Sonst blitzt die Seite einmal in der falschen Größe auf und
  springt dann
- `window.innerWidth`/`innerHeight` bleiben von `zoom` unberührt und nennen den
  echten Ausschnitt — die Rechnung kann sich also nicht selbst aufschaukeln

### Geändert
- **„Blättern" wird der Sprachausgabe jetzt als „Blettern" übergeben.** Dietmar:
  „Blättern klingt schrecklich bei Kerstin." Die Stimmen sprechen nicht aus einer
  Lautschrift, sondern aus dem geschriebenen Wort; wo eine danebengreift, hilft
  eine andere Schreibung desselben Klangs. Im Deutschen sind beide lautgleich
  ([blɛtɐn]), aber mit dem *e* kommen die Modelle besser zurecht als mit dem *ä*.
  Betrifft nur das Gesprochene — auf dem Knopf steht weiterhin „Blättern", und
  „Weiterblättern" und „Blätter-Stand" gehen denselben Weg

### Geprüft
- Vier Bildschirmgrößen durchgemessen: Die Werte stimmen, nichts läuft seitlich
  über, und die Fenster (Einstellungen, Anleitung, **Formelblatt**) passen
  überall auf den Schirm — das Formelblatt rechnet seine Breite selbst aus der
  Höhe und war die heikelste Stelle
- Beamer-Modus an und wieder aus: Die Skalierung fällt auf 100 % und kommt
  danach zurück
- Die vollständige Liste aller Funktionen und Konstanten gegen die vorherige
  Fassung verglichen — es fehlt nichts

---

## [1.136.0] - 2026-09-05

### Entfernt
- **karlsson, pavoque, ramona, eva_k und thorsten_emotional** werden nicht mehr
  angeboten. Dietmar, nachdem er sie gehört hatte: „Karlsson und pavoque ramona
  eva gehört auch raus" — und kurz darauf: „Thorsten emotional auch entfernen."
  Die ersten vier gibt es nur in `low` oder `x_low`, also 16 kHz; der Trainer
  warnt bei diesen ohnehin vor dem dumpfen S. `thorsten_emotional` ist derselbe
  Sprecher wie die mitgelieferte Stimme, nur mit gespielten Gefühlslagen — für
  Prüfungsfragen ist das nicht Ausdruck, sondern Ablenkung. Übrig bleiben
  **Thorsten in drei Gütestufen und Kerstin**
- Ausgewählt wird nach **Sprecher**, nicht nach einzelnem Eintrag: Käme morgen
  „karlsson" in mittlerer Güte dazu, wäre sie sonst wieder in der Liste — und
  die Entscheidung galt der Stimme, nicht der Güte

### Hinzugefügt
- **Wegräumen für Stimmen, die schon im Ordner liegen.** Aus der Liste nehmen
  genügt nicht: Wer sie geholt hat, hat sie weiter im Ordner und in der Auswahl.
  Der Reiter *Vorlesen* zeigt jetzt einen Hinweis, sobald so etwas herumliegt —
  mit den Namen, dem belegten Platz und einem Knopf
- **Gelöscht wird trotzdem nichts.** Die Dateien wandern nach
  `_Aufgeraeumt_<Datum>\piper\`, so wie es `Aufraeumen.bat` mit allem anderen
  auch hält. Zwei Gründe: Ein Modell ist 20 bis 110 MB, und wer es zurückhaben
  will, müsste es sonst neu über die Leitung ziehen. Und wichtiger — ein
  Programm, das ungefragt Dateien im Ordner des Benutzers löscht, ist eines, dem
  man beim nächsten Mal nicht mehr traut. Der Ordner liegt sichtbar daneben; wer
  Platz braucht, wirft ihn selbst weg. Das steht auch am Knopf, damit niemand
  einen Klick tut, den er für endgültig hält
- Liegt im Aufräumordner schon eine gleichnamige Datei aus einem früheren Lauf,
  bekommt die neue eine Zahl angehängt — überschrieben wird auch dort nichts

### Geprüft
Mit genau dem Bestand aus Dietmars Ordner nachgestellt (acht Stimmen plus
`piper.exe`, DLLs und `espeak-ng-data`):

- Erkannt werden die sechs richtigen; **Thorsten und Kerstin bleiben**
- `thorsten_emotional` wird gefasst, `thorsten-medium` und `thorsten-high`
  nicht — die Namen werden genau verglichen, nicht als Wortanfang
- **`piper.exe`, `onnxruntime.dll` und `espeak-ng-data\` werden nie angefasst**
- Nach dem Wegräumen stehen in der Stimmenauswahl noch drei Stimmen, ohne
  Neustart

---

## [1.135.0] - 2026-09-05

### Behoben
- **„Unexpected token 'N', ‚Not found' is not valid JSON"** beim Klick auf
  *Stimmen hinzufügen*. Das war keine kaputte Datei, sondern die richtige
  Antwort auf eine Frage, die der laufende Server noch nicht kannte: Die neue
  `Index.html` lag schon im Ordner, im Speicher lief aber noch die Fassung von
  vorhin — und die hatte `/api/stimmen/alle` nicht. Express antwortet darauf mit
  dem schlichten Wort `Not found`, und `res.json()` zerbricht daran mit einer
  Meldung, die niemandem sagt, was zu tun ist
- Jetzt wird die Antwort erst als **Text** gelesen und dann gedeutet. Ein 404
  heißt an dieser Stelle immer dasselbe, und genau das steht nun da: *„Diese
  Funktion ist neuer als der laufende Trainer. Bitte den Trainer einmal beenden
  und neu starten."*
- Die Vorsicht gilt an **allen drei Stellen** — Verzeichnis holen, eine Stimme
  holen, alle holen. Dieselbe Falle war seit dem 28.08.2026 bei `githubPruefen`
  schon entschärft; sie gehört an jede Stelle, die eine neue Serverfunktion
  anspricht

### Geprüft
- Den Fall nachgestellt: neue Anzeige, alter Server ohne das Stimmen-Modul. Beide
  Wege — der große Knopf und die Liste — melden jetzt den Klartext statt der
  Javascript-Meldung, und keine Ausnahme landet mehr in der Konsole

---

## [1.134.0] - 2026-09-05

### Hinzugefügt
- **„Stimmen hinzufügen"** steht jetzt neben „Probe hören". Ein Klick holt alle
  weiteren deutschen Stimmen nacheinander — ohne dass etwas auszuwählen wäre.
  Dietmar: „Ohne auswählen, alle mit einem Rutsch installieren." Und kurz
  darauf: „Bei Stimmen hinzufügen benötigt es nur einen kleinen kurzen Text und
  kein weiteres Fenster." Beides so umgesetzt: ein Klick, ein Satz mit Anzahl
  und Größe, dann der Balken. Keine Rückfrage
- Geholt wird **nacheinander, nicht gleichzeitig**: Vier Downloads parallel
  machen die Leitung nicht schneller, aber den Fortschritt unlesbar. Geht einer
  schief, laufen die übrigen weiter — eine Stimme, die es gerade nicht gibt,
  soll nicht die anderen verhindern. Was nicht geklappt hat, steht am Ende dabei
- Bei mehreren steht am Balken, die wievielte gerade läuft. Ein Balken, der
  zwischendurch stehenbleibt, sähe sonst nach einem Hänger aus
- Der Haken darunter heißt jetzt **„Einzeln auswählen"** — er ist der Weg für
  den Fall, dass nicht alle gebraucht werden

### Entfernt
- **`de_DE-mls-medium` wird nicht mehr angeboten** (auf Dietmars Wunsch). Sie
  stammt nicht aus einer Studioaufnahme, sondern aus einem Hörbuch-Datensatz
  (Multilingual LibriSpeech) — viele Sprecher, viele Aufnahmesituationen. Für
  einen Fragenkatalog, den man stundenlang hört, ist das die falsche Stimme, und
  eine Auswahl, in der etwas steht, das man ohnehin nicht nehmen soll, ist keine
  Hilfe

### Geändert
- Die Probe sagt jetzt **„So klingt die Stimme, die dich durch das Menü
  führt."** Dietmar über die alte Fassung: „So klingt die Stimme, die dir die
  Knöpfe vorliest — klingt schrecklich!" Er hat recht: „die dir die Knöpfe
  vorliest" beschreibt die Technik, nicht den Zweck

### Behoben
- Der Fortschritt konnte über 100 % hinauslaufen, wenn eine Stimme misslang: Sie
  zählte doppelt — einmal die Bytes, die schon durch die Leitung gingen, und
  einmal ihre Größe, die nachgetragen wird, damit der Balken nicht hängenbleibt.
  Jetzt wird nach jeder Stimme auf die Summe der erledigten gesetzt

### Geprüft
Am Verzeichnis auf dem eigenen Rechner:

- Drei Stimmen mit einem Klick geholt, geprüft und geschrieben; sie stehen
  sofort in der Auswahl, ohne Neustart
- `mls-medium` liegt im Verzeichnis und taucht in der Liste **nicht** auf
- Eine absichtlich beschädigte Stimme wird verworfen, die beiden anderen kommen
  trotzdem an, und der Fehler steht am Ende dabei
- Der Balken endet bei genau 100 %, auch wenn eine misslungen ist
- **Kein Fenster** geht auf; **keine doppelt vergebene Kennung** im Dokument

---

## [1.133.0] - 2026-09-05

### Geändert
- **Der Vollbild-Knopf steht jetzt direkt neben dem Zahnrad.** Dietmar:
  „Bildschirm vergrößern soll direkt neben Einstellungen verschoben werden."
- **Die Anleitung ist neu gebaut.** Dietmar: „Unter Button Info möchte ich mehr
  Struktur und eine bessere und nüchterne Anleitung. Bitte ergänze die neuen
  Funktionen. Ich finde den jetzigen Aufbau schrecklich."

  Er hatte recht, und zwar zweifach. Der Aufbau: dreizehn Kästen mit
  Emoji-Überschriften, alle untereinander, in einem Fenster, das man vier
  Bildschirmhöhen weit rollen musste — wer etwas Bestimmtes suchte, hat
  gescrollt und gelesen, gescrollt und gelesen. Und der Ton: „Los geht's",
  „fürs Auto", Ausrufezeichen, wo eine Anleitung nüchtern sein soll.

  Jetzt sind es **acht Abschnitte, links anwählbar**, in derselben Form wie die
  Einstellungen — wer das eine kennt, findet sich im anderen zurecht. Jeder
  Abschnitt passt auf einen Bildschirm. Keine Emoji in den Überschriften. Zwei
  Spalten je Zeile: links, wie die Sache heißt; rechts, was sie tut. Wer sucht,
  überfliegt die linke Spalte
- Die Abschnitte: **Überblick · Lernen · An der Frage · Prüfung & Kurs · Video &
  Hörbuch · Einstellungen · Tastatur · Daten & Stand**

### Hinzugefügt
- Beschrieben sind jetzt auch die Sachen, die seit August dazugekommen sind:
  **Blättern** samt Blätter-Buch und „Nur die gelernten ansehen", das
  **Formelblatt** als PDF an der richtigen Stelle, **Dazu lernen** mit
  Videolehrgang und 50ohm.de, der **Vollbild-Knopf**, die **Einstellungen** mit
  ihren fünf Reitern, das **Nachholen weiterer Stimmen**, die grünen Punkte im
  Verlauf und wo der Lernstand liegt
- Unter *Daten & Stand* steht die **Versionsnummer** statt des Fingerabdrucks —
  dieselbe Änderung wie im Reiter *Update*. Der Fingerabdruck bleibt klein
  dahinter

### Behoben
- Beim Umbau des Anleitungsfensters hatte ich einen Bereich mitgelöscht, der
  nichts mit ihm zu tun hatte: `dateiStandAnzeigen`, `fehlerMelden`,
  `fehlerStand`, `verlaufHoeheAngleichen`, `paketZaehlerAnzeigen` und
  `paketGeladen` lagen zwischen den beiden Funktionen, die ersetzt werden
  sollten. Aufgefallen ist es daran, dass die Zeile „Welcher Stand läuft hier"
  auf „wird ermittelt …" stehen blieb. Alle sechs sind wieder da; geprüft wurde
  danach nicht nur die Anleitung, sondern die **vollständige Liste aller
  Funktionen und Konstanten** gegen die ausgelieferte Fassung — es fehlt nichts
  außer dem alten Hilfskästchen, das die neue Form ersetzt

---

## [1.132.0] - 2026-09-05

### Hinzugefügt
- **Weitere Vorlesestimmen lassen sich nachholen** — in den Einstellungen unter
  *Vorlesen*. Dietmar: „Ich möchte noch weitere Piper Stimmen mit in das Tool
  mit aufnehmen. […] Haken setzen und es installiert weitere Natural Stimmen
  dazu. Ausgeliefert wird nur Standard Thorsten, um die Installations-exe nicht
  aufzublähen."
- **Ausgeliefert wird weiter nur Thorsten.** Eine Stimme in mittlerer Güte wiegt
  63 MB, die hohe 110 MB; alle zehn deutschen zusammen rund 500 MB — in einem
  Setup von knapp 90 MB. Wer nur lernen will, soll nicht erst eine halbe Stunde
  Stimmen laden, die er nie benutzt
- **Der Haken zeigt die Liste, geholt wird einzeln.** Das weicht bewusst von
  „Haken setzen und es installiert" ab: Ein Haken, der ungefragt eine halbe
  Stunde Leitung belegt, wäre eine unangenehme Überraschung — und die meisten
  wollen eine zweite Stimme, nicht neun
- **Die Güte steht vor dem Laden dabei.** `x_low` und `low` sind 16 kHz und
  klingen beim S dumpf. Die Stimmenauswahl warnt heute schon davor — aber erst
  *nach* dem Herunterladen, und das ist zu spät
- Während des Ladens läuft ein Balken; danach steht die neue Stimme sofort in
  der Auswahl, ohne Neustart

### Technisch
- Neue Datei `piper_stimmen.js`, eingehängt wie `github_update.js`. Fehlt sie,
  entfällt nur die Auswahl — der Trainer läuft weiter
- **Eine einzige Quelle:** die `voices.json` des Piper-Projekts bei Hugging
  Face, dieselbe Herkunft wie die mitgelieferte Stimme. Dort steht zu jeder
  Datei Größe *und* MD5-Prüfsumme. Nichts ist fest verdrahtet; kommt dort eine
  Stimme dazu, steht sie von selbst zur Wahl
- **Geholt werden nur `.onnx` und `.onnx.json`** — Sprachmodelle und deren
  Beschreibung, also Daten. Nie ein Programm, nie eine `.exe`, nie eine `.dll`
- **Jede Datei wird nachgerechnet.** Stimmt die Prüfsumme nicht, wird sie
  verworfen und nicht geschrieben; ein abgebrochener Download kommt so nie im
  Ordner an. Geschrieben wird erst nach `piper\`, wenn alles stimmt — vorher
  liegt die Datei unter `.teil`
- Geschrieben wird ausschließlich direkt nach `piper\`, nur unter einem Namen,
  der zum Muster einer Stimmdatei passt. Kein Unterordner, kein `..`, kein Pfad
  aus der Antwort des Servers. Als Gegenstelle sind nur `huggingface.co` und
  `hf.co` zugelassen, auch nach einer Umleitung ans Auslieferungsnetz
- Der Fortschritt wird abgefragt, nicht gemeldet: Eine Anfrage, die zwei Minuten
  offen steht, läuft in jeden Zeitablauf — beim Browser, beim Server und beim
  Virenscanner dazwischen

### Geprüft
An einem Verzeichnis auf dem eigenen Rechner durchgespielt, statt 63 MB durch
die Leitung zu ziehen:

- Eine englische Stimme im Verzeichnis taucht in der deutschen Liste **nicht**
  auf
- Ein Eintrag mit dem Pfad `../../../piper.exe` wird verworfen, nicht geholt
- `MODEL_CARD` und Ähnliches fällt weg — nur Modell und Beschreibung kommen mit
- Eine **absichtlich veränderte** Datei wird an der Prüfsumme erkannt; im Ordner
  landet nichts, auch keine `.teil`-Datei
- Der saubere Fall: geladen, geprüft, geschrieben — die Stimme steht sofort in
  der Auswahl

---

## [1.131.0] - 2026-09-05

### Hinzugefügt
- **Ein Knopf für das Vollbild** in der Kopfzeile, mit dem Zeichen der vier
  Pfeile nach außen. Dietmar: „Benötige einen Button oben in der Leiste mit
  Browser Fenster ‚Maximieren' bzw. das Zeichen mit den 4 Pfeilen. Beim Button
  vorlesen mit aufnehmen. Danach verschwindet der obere Teil vom Browser."
- Es ist dasselbe wie **F11** — aber F11 muss man wissen, und im Kursraum sitzt
  niemand mit der Tastatur vor dem Beamer. Was dabei wegfällt, ist kein Zierrat:
  Adressleiste, Lesezeichen und Reiter sind auf einem Laptopschirm rund 120
  Punkte, also zwei bis drei Antwortzeilen mehr für die Frage
- **Der Knopf ist beim Vorlesen dabei**, kurz wie ausführlich — mit dem Hinweis
  auf F11 und darauf, dass Escape wieder herausführt
- **Das Zeichen sagt, was als Nächstes passiert**, nicht wo man ist: vier Pfeile
  nach außen heißt „groß machen", die vier nach innen „wieder klein"

### Technisch
- Nachgezogen wird über das Ereignis `fullscreenchange`, nicht nach dem eigenen
  Klick. Das Vollbild lässt sich auch mit F11 und mit Escape umschalten, ohne
  dass der Knopf je angefasst wird — wer nur auf den eigenen Klick hört, hat
  früher oder später ein Zeichen, das das Gegenteil dessen zeigt, was gerade ist
- Alle vier Schreibweisen der Browser sind berücksichtigt (`webkit`, `moz`,
  `ms`). Verbietet ein Browser das Umschalten — das kommt in Kioskmodi vor —,
  sagt der Trainer das und verweist auf F11, statt stumm nichts zu tun

### Geprüft
- Ein und aus über den Knopf, dazu ein Weg an ihm vorbei (Vollbild von außen
  beendet): Das Zeichen, der Tooltip, die Vorlesetexte und `aria-label` ziehen
  jedes Mal mit

---

## [1.130.0] - 2026-09-05

### Geändert
- **Die gelernten Fragen sind jetzt im Verlauf grün** — in der Punktetafel unter
  „Fortschritt". Dietmar, nachdem ich es zuerst am Nummernfeld der Frage gemacht
  hatte: „Mit grün markiert, war eigentlich etwas anderes gemeint. Die gelernten
  sollen im Verlauf grün markiert sein." Er hat die bessere Stelle gemeint: Am
  Nummernfeld sieht man den Zustand **einer** Frage — der, die man ohnehin
  gerade liest. In der Tafel sieht man alle auf einmal, und damit die Frage, die
  einen beim Blättern wirklich umtreibt: Wie weit bin ich, und was liegt noch
  vor mir?
- **Drei Grüntöne, die man auseinanderhalten muss.** Der neue Punkt ist
  *hellgrün mit grünem Rand*, nicht gefüllt — gefülltes Dunkelgrün heißt
  weiterhin „in dieser Runde richtig beantwortet". Zwei gleich aussehende Grüns
  nebeneinander hätten die Auskunft wieder weggenommen, die sie geben sollen
  (Ziffern #0f5132 auf #d7f0e0 tragen 7,6:1)
- **Das Ergebnis der laufenden Runde geht vor.** Wer eine gelernte Frage falsch
  beantwortet, sieht Rot — alles andere wäre gelogen
- Beim Abhaken oder Zurücknehmen färbt sich der Punkt sofort mit
- Nicht im Prüfungssimulator: Dort liegt nichts auf dem Tisch, was in der echten
  Prüfung nicht auch daläge

### Entfernt
- **Das grüne Nummernfeld an der Frage aus 1.129.0 ist wieder raus.** Es war
  meine Auslegung von „grün markiert", nicht Dietmars Bitte — und es sagte
  ohnehin nichts, was der Knopf „Gelernt" daneben nicht schon zeigt. Der
  knappere Abstand zwischen Nummer und Fragentext bleibt

### Technisch
- Die Punktetafel wird an zwei Stellen gebaut (`renderQuestion` und
  `updateSidebarOnly`); beide fragen jetzt dieselbe Funktion `gelerntPunkt()`
- Die neue Regel trägt `!important`, weil die Farbstile spezifischer sind:
  `body.grey .dot-sidebar` ist (0,2,1), `.dot-sidebar.gelernt-dot` nur (0,2,0).
  Ohne das hätte der Punkt in Grau, Grün, Blau und Orange seine Farbe verloren —
  derselbe Weg wie bei `.beantwortet-dot`, aus demselben Grund

### Geprüft
- Neun vorab abgehakte Fragen in einer Runde von 28: alle hellgrün. Eine richtig
  beantwortet → dunkelgrün gefüllt. Eine nicht gelernte falsch beantwortet →
  rot. Haken zurückgenommen → Punkt sofort wieder blass

---

## [1.129.0] - 2026-09-05

### Geändert
- **Die Lücke zwischen Fragennummer und Fragentext ist knapper.** Dietmar:
  „Neben der Nummer aus dem Fragenkatalog ist etwas viel Platz zu dem Text.
  Hätte das gerne etwas leicht aufgeschlossener." Der Grund war, dass zweimal
  Abstand entstand: 7 Punkte Rand am Feld **und** ein echtes Leerzeichen der
  Fragenschrift dahinter, zusammen gut 13 Punkte. Das Leerzeichen ist raus, der
  Rand steht auf 6 — nachgemessen sind es jetzt genau 6 Punkte
- **Gilt eine Frage als gelernt, wird das Nummernfeld grün.** Dietmar:
  „Blätter-Stand / Gelernte ansehen: Hier möchte ich die gelernten Fragen grün
  markiert." Es ist dasselbe Grün wie am Knopf „Gelernt" daneben, damit man die
  beiden zusammen liest und nicht als zwei verschiedene Dinge (weiße Schrift
  darauf trägt 6,3:1)
- Die Markierung steht **überall**, nicht nur in der Runde „Gelernte ansehen" —
  dort ist ohnehin alles grün. Nützlich ist sie beim Blättern: Man sieht auf
  einen Blick, was schon abgehakt ist, ohne den Knopf anzusehen. Eine
  Markierung, die mal da ist und mal nicht, müsste man sich außerdem erklären
- **Ausgenommen ist der Prüfungssimulator.** Dort liegt nichts auf dem Tisch,
  was in der echten Prüfung nicht auch daläge
- Beim Abhaken färbt sich das Feld sofort mit. Ohne das bliebe es bis zur
  nächsten Frage stehen, wie es war — und der Klick sähe aus, als hätte er nur
  den Knopf betroffen

### Geprüft
- Abstand nachgemessen: vorher gut 13 Punkte, jetzt 6
- Abhaken, zurücknehmen und die Runde „Gelernte ansehen" durchgespielt; das Feld
  folgt jedes Mal sofort

---

## [1.128.0] - 2026-09-05

### Geändert
- **Unter Update steht jetzt die Versionsnummer statt eines Fingerabdrucks.**
  Dietmar: „Dieser Trainer läuft mit dem Stand 2fe36d2d5e. Kann man da nicht die
  Version anzeigen lassen? Ich habe nur noch keine Idee dazu, woher man die Nr
  bekommt." — Sie kommt aus der **obersten Überschrift des `CHANGELOG.md`**,
  derselben Zeile, aus der auch `version.js` und `Build-DIREKT.bat` rechnen. Das
  CHANGELOG wandert mit den Dateien; wer einzelne Dateien bei GitHub einstellt,
  stellt es mit ein. Die Nummer stimmt also auch dann, wenn kein Setup gebaut
  wurde
- **Nicht aus der `package.json`.** Die wird nur beim Bauen gesetzt
  (`version.js --setzen`). In Dietmars Ordner stand dort `1.98.0`, während das
  CHANGELOG längst bei `1.127.0` war. Eine Nummer, die man glauben soll, darf
  nicht von einem Arbeitsschritt abhängen, den man vergessen kann
- Der Fingerabdruck bleibt, klein und darunter. Er beantwortet eine andere
  Frage: ob zwei Ordner buchstabengenau dasselbe enthalten — bei einer
  Fehlersuche zu zweit genau die richtige Frage

### Hinzugefügt
- **Drei Zahlen statt einer**, weil es drei gibt und sie Verschiedenes meinen —
  das war der Punkt, an dem Dietmar hängen blieb („Derzeit habe ich eine exe mit
  der Versions Nr. 1.111.0 bei GitHub. Die Version ändert sich aber, wenn ich
  einzelne Dateien in GitHub einstelle."):

  | Zeile | Was sie sagt |
  |---|---|
  | **Hier** | die Dateien in diesem Ordner |
  | **Bei GitHub** | die Dateien dort — dasselbe CHANGELOG, nur im Repository |
  | **Setup dort** | das fertige Installationsprogramm, aus dem Release-Tag |

  Dass die dritte hinterherhinkt, ist kein Fehler: Ein Setup wird seltener
  gebaut als eine Datei geändert. Man sieht jetzt nur, wie weit
- **„Bei GitHub nachsehen" ohne das große Fenster.** Wer nur wissen will, ob es
  etwas Neues gibt, bekommt zwei Zahlen und einen Satz — und erst wenn wirklich
  etwas zu holen ist, den Knopf dorthin. Dateien, die **hier** neuer sind,
  werden getrennt genannt: Sie bleiben unangetastet und warten aufs Hochladen
- Im Update-Fenster steht die Gegenüberstellung `1.127.0 → 1.129.0` über den
  Knöpfen, direkt neben der Entscheidung

### Technisch
- `GET /api/version` liefert `version` jetzt aus dem CHANGELOG (mit Rückfall auf
  die `package.json`, falls kein CHANGELOG dabei ist), gelesen nur bei
  geändertem Zeitstempel — die Standwache fragt jede Minute
- `GET /api/github/pruefen` liefert zusätzlich `versionHier`, `versionDort` und
  `versionSetup`. Das ferne CHANGELOG (60 KB) wird **nur** geholt, wenn sein
  Fingerabdruck von dem hiesigen abweicht; ist er gleich, ist auch die Nummer
  gleich. Schlägt eines davon fehl, fehlt nur die Zeile — der Dateivergleich
  hängt nicht daran
- Ein führendes `v` am Release-Tag wird abgeschnitten, damit sowohl `1.111.0`
  als auch `v1.111.0` erkannt werden

---

## [1.127.0] - 2026-09-05

### Geändert
- **Das Formelblatt-Fenster hat jetzt die Form des Blattes.** Dietmar schickte
  ein Bild, auf dem links und rechts ein breiter grauer Streifen rot
  angestrichen war: „Das rot markierte an der Seite nimmt viel Platz weg.
  Besser wäre, wenn es sich automatisch am Monitor anpasst und seitlich
  schmäler und dafür etwas länglicher wird." Der Grund für das Grau: Die
  Formelsammlung ist A4 hochkant (Verhältnis 0,707), und ein hochkantes Blatt
  in einem breiten Fenster lässt links und rechts Platz übrig. Jetzt richtet
  sich die Höhe nach dem Bildschirm und die Breite rechnet sich daraus. Auf
  einem 1080er Schirm standen vorher je 270 Punkte grau daneben, jetzt sind es
  gut 100 — und statt 17 Zeilen der Tabelle sind 36 zu sehen
- **Der Miniaturstreifen an der Seite ist weg** (`navpanes=0`). Dietmar: „Eine
  seitliche Übersicht über alle Blätter wird nicht benötigt." Er hat recht —
  man kommt mit einem Klick auf das richtige Blatt, man sucht es sich nicht aus
- **Die Werkzeugleiste bleibt vollständig**, samt Stift, Textmarker und
  Radierer: „Das mit dem Zeichnen und Markieren von einem Text auf dem PDF
  finde ich richtig gut." Deshalb wird das Fenster nie schmäler als 800 Punkte
  — darunter klappen Edge und Chrome die Zeichenwerkzeuge in ein Untermenü

### Hinzugefügt
- **Beim Blättern führt der Trainer jetzt Buch.** Dietmar: „Ich möchte, dass
  bei Blättern / Weiterblättern eine JSON angelegt wird, die den Stand
  speichert, den man wieder löschen kann. Gespeichert werden: als gelernt
  markierte Fragen über den Knopf ‚Gelernt' und Fragen, die man weiterklickt."
  Bisher merkte sich das Blättern genau eine Frage — die letzte. Jetzt steht in
  `data\userdata\blaettern.json` je Benutzer und Prüfungsziel, welche Fragen
  durchgesehen und welche abgehakt wurden
- **Eine eigene Datei, nicht ein Feld im Lernstand.** Der Lernstand wird
  gesichert, zurückgeholt und beim Umzug mitgenommen; an ihm hängt viel. Der
  Blätter-Stand ist ein Arbeitsbuch, das man wegwerfen können soll, ohne um den
  Verlauf zu bangen. Zwei Dateien heißt: Löschen kann hier nichts anderes
  mitreißen — und die Rückfrage vor dem Löschen sagt genau das
- **„Nur die gelernten ansehen"** im Blätter-Fenster und in den Einstellungen.
  Dietmar am 05.09.2026: „Ich bin alle 571 Fragen durch und habe neu angefangen.
  Hier möchte ich mir alle grün gelernten Fragen sehen." Diese Runde verschiebt
  das Lesezeichen des normalen Blätterns **nicht**. Gefragt wird der Lernstand
  selbst und nicht das neue Buch — wer den Katalog schon durch hat, sähe sonst
  eine leere Liste

### Geändert
- **Die Einstellungen sind ein Fenster mit Reitern geworden.** Dietmar:
  „Ähnlich wie in einem Programm, zB WSJT-X (FT8). […] Das Fenster darf gerne in
  die Breite gehen. Derzeit ist es doch mehr ein längliches Fenster. […] Hier
  werden vermutlich noch weitere Einstellungen dazu kommen." Der letzte Satz hat
  die Form bestimmt: Eine lange Liste wächst nach unten, bis niemand mehr etwas
  findet; Reiter wachsen in die Breite. Fünf Reiter — **Allgemein, Vorlesen,
  Lernen, Update, Wartung** — links stehend, nach Dietmars Wahl aus zwei
  Entwürfen
- **Vorlesen ist mit hereingezogen.** Es lag hinter dem Zahnrad an der Frage in
  einem eigenen Fenster. Das Zahnrad gibt es weiter, es öffnet jetzt diesen
  Reiter — der kurze Weg bleibt. Die Bedienelemente wurden **verschoben, nicht
  nachgebaut**: Zwei Kästchen mit derselben Kennung wären ein Fehler, den man
  erst merkt, wenn ein Haken nicht mehr hält
- **Der Farbstil steht jetzt in den Einstellungen** — fünf Farbfelder statt
  eines Knopfes, der durchschaltet
- Jede Einstellung wirkt sofort. Der Knopf „Speichern" aus dem alten
  Vorlese-Fenster ist damit überflüssig

### Entfernt
- **„Beim Entwickler nach Neuerungen sehen"** ist aus dem Info-Fenster
  verschwunden. Dietmar: „Die Option Abgleich mit dem Entwickler wird nicht mehr
  benötigt, wir arbeiten jetzt über GitHub." Zwei Wege zum selben Ziel waren
  einer zu viel

### Geprüft
- Formelblatt an drei Bildschirmgrößen nachgemessen (1920×1080, 1600×900,
  1366×768); die Werkzeugleiste behält den Stift bei 800 Punkten Breite
- Blätter-Buch durchgespielt: durchklicken, abhaken, Datei auf der Platte
  nachgesehen, Fenster wieder geöffnet, Stand gelöscht. Ein Eintrag mit einem
  Pfad statt einer Fragennummer wird vom Server verworfen
- Einstellungen: alle fünf Reiter, Esc schließt, Zahnrad an der Frage landet auf
  Vorlesen, Farbstil schaltet um. **Keine doppelt vergebene Kennung** im ganzen
  Dokument — das war beim Verschieben der Vorlese-Elemente die Stelle, an der es
  leicht schiefgeht

---

## [1.126.0] - 2026-09-05

### Geändert
- **Das Formelblatt ist jetzt das echte PDF, aufgeschlagen auf der richtigen
  Seite.** Bisher lagen 20 abfotografierte Seiten im Ordner `formelsammlung\`,
  und der Trainer zeigte davon einen Ausschnitt mit Markierung. Dietmar:
  „Wir hatten in der letzten Version das PDF als Bilder erstellt. Das kann
  raus! Besser und realistischer ist, das Formelblatt genau an der Stelle /
  Seite anzuzeigen. Ziel ist es für die Benutzer, nicht nur die Antwort zu
  sehen, sondern auch den Umgang damit zu lernen." — Genau so ist es jetzt:
  ein Klick auf **Formelblatt** schlägt `Formelsammlung.pdf` auf dem Blatt
  auf, auf dem die Antwort steht. Gesucht wird auf dem Blatt selbst, denn in
  der Prüfung liegt das Heft auf dem Tisch und niemand zeigt mit dem Finger
  auf die richtige Zeile
- Über dem Blatt steht, **welches** es ist: „Blatt 2 · Seite 4 im PDF". Die
  beiden Zahlen gehen auseinander, weil Deckblatt und Hinweisseite im Heft
  keine Nummer tragen — wer selbst blättert, braucht beide
- **Größer** legt dasselbe Blatt in ein eigenes Browserfenster, mit allem,
  was der Browser für PDFs anbietet: Suche, Zoom, Drucken
- Eigene Blätter-Knöpfe und die Abdunklung gibt es nicht mehr. Der Betrachter
  des Browsers kann das alles schon, und eine Markierung wollte Dietmar
  ausdrücklich nicht

### Entfernt
- Der Ordner `formelsammlung\` mit den 20 Seitenbildern (rund 3,6 MB) fällt
  aus dem Installer und aus dem Aktualisierungspaket. `Formelsammlung.pdf`
  selbst war ohnehin schon dabei. Bei bestehenden Installationen wird nichts
  gelöscht — der Ordner liegt dort nur nutzlos herum und kann von Hand weg

### Geprüft
- Neun Fragen durchgespielt: VD730, VD709, VD731, VD732, VD736 → Blatt 2;
  BC219 → Blatt 10 (IARU 70 cm); NB605 → Blatt 12 (Leistung); bei VA202 und
  BE103 bleibt der Knopf richtigerweise aus
- Der Wechsel zwischen zwei Blättern war die Stelle, an der es leicht schief
  geht: Blatt 2 und Blatt 10 unterscheiden sich in der Adresse nur hinter dem
  Doppelkreuz, und das allein ist für den Browser keine neue Seite — der
  Betrachter wäre stehen geblieben, wo er stand. Der Rahmen wird deshalb bei
  jedem Blattwechsel neu aufgebaut
- `Formelsammlung.pdf` wird vom Server ausgeliefert (HTTP 200, 919 KB), auch
  über den Einladungslink

---

## [1.125.0] - 2026-09-05

### Behoben
- **Der Formelblatt-Knopf blieb aus, obwohl die Zuordnung da war** — Dietmar
  am Beispiel VD730. Ursache war nicht die Zuordnung, sondern der Abruf:
  `formelhilfe.json` wurde mit `cache: 'force-cache'` geholt. Das heißt „nimm
  die gespeicherte Fassung, egal wie alt sie ist, und frag den Server gar
  nicht erst". Nach einer neuen Datei sah der Browser also weiter die alte —
  und in der alten stand VD730 nicht. Die Datei wird jetzt mit Zeitstempel
  und ohne Zwischenspeicher geholt; sie ist klein und wird einmal je Sitzung
  gelesen
- Geprüft an sechs Fragen: VD730, VD709 → Blatt 2, BC219 → IARU 70 cm,
  NB605 → Leistung; bei VA202 und BE103 erscheint der Knopf richtigerweise
  nicht

---

## [1.124.0] - 2026-09-05

### Behoben
- **Bei vielen Fragen fehlte das Formelblatt.** Dietmar nannte VD730, VD731,
  VD732, VD736 und VD709 — alle fünf fragen nach Werten, die in der amtlichen
  Formelsammlung auf Blatt 2 stehen. Von 571 Fragen der Klasse N hatten nur
  **60** eine Zuordnung; jetzt sind es **114**
- **Der Seitenaufbau in `formelhilfe.json` war falsch beschriftet.** Die
  Einträge für PDF-Seite 5 bis 10 hießen „Frequenzbereiche" und „Zusätzliche
  Nutzungsbestimmungen", zeigen aber den **Rufzeichenplan**. Wer dort
  nachschlug, fand etwas anderes. Am PDF nachgesehen und richtiggestellt:
  S.3 = Anlage 1, S.4 = Frequenzbereiche und maximale Leistung,
  S.5 = Bandbreiten, S.6–10 = Rufzeichenplan, S.11 = IARU 2 m,
  S.12 = IARU 70 cm, S.13–24 = Formelsammlung Technik
- Die beiden Bandpläne hießen „Kurzwelle" und „UKW" — es sind 2 m und 70 cm

### Geändert
- **Das Formelblatt zeigt nur noch die Seite, ohne Markierung.** Dietmar:
  „Eine Markierung wird nicht benötigt." Das Abdunkeln drumherum und der
  Rahmen sind weg, die Seite beginnt oben, der Schalter „Nur die Stelle"
  entfällt. In der Prüfung liegt die Formelsammlung als Blatt auf dem Tisch,
  ohne dass jemand die Zeile anstreicht. Die Koordinaten bleiben in der Datei
  stehen, falls die Markierung je zurückkommen soll

### Zur Zuordnung
- Die Regeln sind **eng** gefasst. Der erste Entwurf traf auf jedes Wort
  „Frequenzbereich", „Rufzeichen", „IARU" und hätte 242 Fragen zugeordnet —
  darunter reine Rechtsfragen wie „Wie ist die Amateurfunkstelle definiert?",
  bei denen die Antwort in keiner Tabelle steht. Ein Knopf, der die falsche
  Seite aufschlägt, ist schlimmer als gar keiner: Man sucht dann in der
  Prüfung an der falschen Stelle weiter. Zugeordnet wird nur, wenn die
  Antwort wirklich auf dem Blatt steht — erkennbar an Zahlenwerten, Bändern
  oder einer ausdrücklichen Frage nach dem Plan
- Dass es „nur" 114 von 571 sind, liegt an der Klasse N selbst: Sie rechnet
  wenig, und die meisten Technikfragen sind Verständnisfragen

---

## [1.123.0] - 2026-09-05

### Behoben
- **„Blättern" hat den Filter „Lernen aktiv für" ignoriert.** Dietmar: „Nehme
  ich bei Lernen aktiv für Technik raus, müsste sich doch Blättern
  reduzieren?" — Ja, müsste es. Die Zahl am Knopf stimmte zwar (Frage 344 von
  571 macht 228 Rest), beantwortete aber eine andere Frage als der Zähler
  daneben: „Start" filtert über `getFilteredQuestions()` nach den aktiven
  Teilen, das Blättern lief stur durch den ganzen Katalog
- Beides rechnet jetzt gleich. An Dietmars Stand nachgerechnet: 228 Rest mit
  allen drei Teilen, **33** ohne Technik. Die schon gelernten Fragen bleiben
  ausdrücklich drin — das ist der Zweck der Sache und steht auch so im Fenster
- **Sonderfall mitbehandelt:** Fällt das Lesezeichen durch den Filter, weil
  die gemerkte Frage zu einem abgewählten Teil gehört — BE404 ist eine
  Betriebsfrage —, springt der Trainer nicht an den Anfang zurück, sondern zur
  nächsten Frage danach, die noch im Pool ist. 343 durchgesehene Fragen noch
  einmal von vorn wären die schlechteste aller Antworten
- Die Zahl am Knopf zieht beim Umschalten der Teile sofort nach

---

## [1.122.0] - 2026-09-04

### Geändert
- **Die Fragennummer steht jetzt in einem eigenen weißen Feld.** Dietmar:
  „Dieses Feld möchte ich ähnlich wie am Anfang in einem weißen Feld umrahmt,
  damit sich das von der Frage etwas abhebt." Dieselben Werte wie die
  Antwortfelder darunter — weißer Grund auf dem grauen Block, dünner Rand,
  Monoschrift. Die Nummer ist eine Fundstelle im Katalog, kein Teil der
  Frage; bisher steckte der einzige Hinweis darauf im Doppelpunkt dahinter
- **Die Herkunft steht unter der Kachel, zu der sie gehört.** Vorher standen
  beide Quellen in einer Zeile unter beiden Kacheln, und man musste raten,
  was wozu gehört. Jetzt dasselbe Raster wie die Kacheln darüber, jede
  Angabe mittig unter ihrer eigenen — nachgemessen, die Mittelpunkte liegen
  auf denselben Pixeln

### Behoben
- **Nach dem Klick war die Antwort erst gelb, dann grün oder rot.** Dietmar:
  „Hier wünsche ich mir, dass es gleich rot oder grün ausgibt." Ursache: Der
  Trainer liest nach dem Klick „Richtig" bzw. „Falsch" vor und markiert dabei
  die betroffene Antwort gelb — und diese Markierung gewann ausdrücklich
  gegen Grün und Rot. Zwei Sekunden lang stand Gelb, wo die Antwort längst
  feststand
- Das Gelb greift jetzt nur noch dort, wo **noch keine Wertung** steht. Beim
  Vorlesen der Frage und der offenen Antworten bleibt alles wie gehabt;
  sobald geklickt ist, gilt Grün und Rot

---

## [1.121.0] - 2026-09-04

### Behoben
- **Der Trainer war plötzlich nicht mehr erreichbar — und es war nie ein
  Absturz.** Der Server hat sich selbst beendet, zu Unrecht. Dietmar: „Der
  Trainer schmiert nach kurzer Interaktivität immer noch ab. Das nervt
  unwahrscheinlich!"

  Die Seite meldet sich alle zehn Sekunden beim Server; bleibt sie länger als
  45 Sekunden stumm, machte er Feierabend. Chrome und Edge **bremsen
  Zeitgeber in Hintergrund-Tabs aber aus** — nach einigen Minuten nur noch
  einmal pro Minute — und legen unbenutzte Tabs von sich aus schlafen
  („Energiesparmodus", „Sleeping Tabs"), dann läuft gar kein Zeitgeber mehr.
  45 Sekunden waren dagegen chancenlos: Der Server sah eine Lücke, hielt den
  letzten Zuschauer für gegangen und schaltete ab, während das Fenster offen
  daneben stand
- Verschärft hat es der neue Kasten unter der Frage: **„Video ansehen" und
  „Bei 50 Ohm nachlesen" öffnen einen neuen Tab** — damit ist der Trainer
  genau in dem Moment im Hintergrund, in dem man etwas nachliest
- Die Frist steht jetzt auf **fünf Minuten** statt 45 Sekunden. Der Zweck
  bleibt derselbe — Browser zu, Server aus —, nur ohne die Annahme, dass ein
  Browser Zeitgeber pünktlich ausführt. Der Preis: Ein herrenloser Server
  läuft fünf Minuten statt 45 Sekunden weiter
- **Die Seite meldet sich jetzt auch, sobald sie wieder sichtbar wird** —
  über `visibilitychange`, `focus` und `pageshow`, statt nur im Takt
- **Zweiter Fehler an derselben Stelle:** `pagehide` kommt auch dann, wenn
  der Browser die Seite nur zur Seite legt und gleich wiederholt (bfcache,
  Energiesparmodus). Die Seite hat sich dabei jedes Mal **abgemeldet** — der
  Server hielt sie für geschlossen und schaltete ab, obwohl sie wiederkam.
  Jetzt gilt der Abschied nur, wenn die Seite wirklich geht (`event.persisted`)

### Hinzugefügt
- **Ein Protokoll.** Bis heute gab es keins: `START.vbs` startet den Server
  ohne Fenster und ohne Umleitung — alles, was er sagte, fiel ins Nichts.
  Verschwand er, gab es nichts nachzusehen. Genau deshalb ließ sich das so
  lange nicht klären. Ab jetzt steht alles zusätzlich in
  **`data\userdata\server.log`**, mit Uhrzeit; bei einem Megabyte fängt die
  Datei von vorn an, die alte bleibt als `server.log.alt` liegen
- Beim Ausscheiden eines Zuschauers steht jetzt dabei, **wie lange** er stumm
  war — und beim Beenden, mit welchem Code und nach welcher Laufzeit. Bleibt
  diese letzte Zeile aus, wurde der Server von außen abgeschossen; auch das
  ist eine Auskunft
- Das Protokoll liegt bei den Lerndaten, nicht im Programmordner: Eine
  Installation unter „Program Files" ist für normale Benutzer nicht
  beschreibbar, dort wäre es still gescheitert

---

## [1.120.0] - 2026-09-04

### Hinzugefügt
- **Die 50-Ohm-Zuordnung liegt jetzt für alle 571 Fragen der Klasse N vor.**
  Jede Frage führt auf das Kapitel im Lehrgang des DARC, in dem ihr Stoff
  erklärt wird — keine Lücke, kein Rest
- Hergeleitet ist sie aus dem **Videolehrgang**: Michaels 14 Lektionen folgen
  den 14 Kapiteln von 50 Ohm, Lektion für Kapitel. Das ist nicht geraten,
  sondern nachgesehen — die Unterkapitel decken sich wörtlich. Lektion 11
  „Pileups, Split, Contest, Fuchsjagd, SSTV, Notfunk" gegen Kapitel 11
  „Betriebsabwicklung" mit Pile-up, Split-Verkehr, Contest, Fuchsjagd, SSTV,
  Notfunk. Bei Lektion 3 und 13 dasselbe Bild
- Alle 14 Kapiteladressen sind einzeln aufgerufen und ihre Überschriften
  verglichen worden — kein Link führt ins Leere
- `50ohm_map.json` wandert jetzt mit: in den Installer, in das
  Aktualisierungspaket und in den Abgleich, wie die Video-Map daneben
- **Die Fußzeile nennt jetzt die Herkunft der Erklärungen** — in derselben
  Zeile, nicht darunter:

  > Offizieller Katalog der Bundesnetzagentur Stand: März 2024 ·
  > Direkteinstieg Klasse N · **Ω** In Zusammenarbeit mit **50ohm.de** — dem
  > Amateurfunk-Lehrgang des DARC

  Dafür sind „Basis (Vorschriften, Betrieb, Technik N)" und „571 Fragen im
  Pool" herausgeflogen. Beides stand ohnehin doppelt: die Prüfungsübersicht
  führt die Teile auf, und die Zahl steht am Knopf „Start". Farbe trägt nur
  das Omega, wie in den Kacheln unter der Frage
- Unterhalb von 900 Pixeln darf der Satz umbrechen — lieber zwei Zeilen als
  ein Fenster, das sich seitlich wegschiebt. Geprüft bei 1440, 1280, 1024 und
  820 Pixeln: kein seitlicher Überlauf
- Beide Namen in der Zeile sind anklickbar: **50ohm.de** führt auf den
  Lehrgang, **DARC** auf den Verein. Beide öffnen im Browser
- Zwei vorsichtigere Fassungen des Satzes stehen als Kommentar daneben, falls
  der DARC eine davon lieber sieht

- **Das Omega trägt keine Farbe mehr.** Es stand in `#00adef`, dem Blau des
  DARC — und geschützt ist die Marke als Ganzes, das Blau gehört dazu. Jetzt
  hat es die Farbe der Zeile, in der es steht: in der Fußzeile die
  Schriftfarbe, in den Kacheln die des Titels daneben. Damit ist es ein
  Buchstabe im Satz und nichts weiter

### Nicht gemacht
- **Das Zeichen „50 Ω" des DARC kommt im Trainer nicht vor.** Matthias am
  04.09.2026: „Das Logo ist markenrechtlich geschützt. Ich würde erstmal
  vorschlagen, dass du das draußen lässt." Darüber entscheidet der Vorstand.
  Sobald er zustimmt, wird das Zeichen unten in der Fußzeile und oben in der
  Kopfzeile eingebaut — bis dahin steht dort das schwarze Omega

### Bekannte Einschränkung
- Die Verlinkung geht auf die **Kapitelübersicht**, nicht auf die genaue
  Unterseite. Für die feinere Zuordnung braucht es die Liste vom DARC; sobald
  sie da ist, ersetzt sie die Datei vollständig. Der Kasten sagt das auch:
  unter dem Kapitelnamen steht „Kapitelübersicht"

---

## [1.119.0] - 2026-09-04

### Hinzugefügt
- **„Dazu lernen" unter der Frage — jetzt zwei Wege.** Neben dem Videolehrgang
  steht künftig der Lehrgang des DARC: dieselbe Frage, einmal erklärt im Video
  und einmal zum Nachlesen auf **50ohm.de**. Anlass ist Dietmars Vorgabe: „Ziel
  ist es, nicht nur auswendig zu lernen, sondern auch richtig zu lernen"
- Die Zuordnung kommt aus der neuen Datei **`50ohm_map.json`** — eine Zeile je
  Frage mit Kapitel, Seitenname und Adresse. Sie ist **freiwillig**: Fehlt sie,
  bleibt einfach der zweite Hinweis weg, sonst ändert sich nichts. Der Trainer
  läuft ohne sie genauso
- Der Weg zu 50 Ohm geht in den **Browser**, nicht in ein Fenster des Trainers:
  Die Seite gehört dem DARC und soll auch als seine erscheinen, mit ihrer
  Adresse in der Zeile
- **Ohne Verbindung** führt der Knopf nicht ins Leere, sondern sagt, wohin er
  führen *würde* — Kapitel und Seitenname stehen ja in der Zuordnung. Der
  Trainer lernt bewusst offline
- Beide Knöpfe erklären sich beim Vorlesen, kurz wie ausführlich

### Geändert
- **Die Gestaltung des Hinweises folgt jetzt der Knopfleiste.** Bisher war es ein
  Kasten mit farbiger Symbolkachel und einem schwarzen Pillen-Knopf — also die
  Bauweise, die im September aus der Leiste geflogen ist („wirkt wie ein
  Kinderspielzeug"). Jetzt zwei gleich breite Felder, weiß, Rand `#d7e0ec`,
  8 Pixel Ecke; das Feld selbst ist der Knopf. Farbe tragen nur die beiden
  Zeichen der Quelle
- Gibt es nur eine Quelle, nimmt sie die volle Breite; unter 700 Pixeln stehen
  beide untereinander
- Das **Ω** steht für 50 Ohm — der Buchstabe, nicht das Logo des DARC. Das
  gehört ihnen und wird nicht nachgebaut
- **Am Fragenblock ändert sich nichts.** Dietmar: „An den Farben und dem Style
  möchte ich nichts verändern. Das ist von 50Ohm." Rahmen `#dddddd`, richtig
  `#3bb583`, falsch `#fe756c` bleiben, wie sie sind
- Im Prüfungssimulator und im Beamer-Modus bleiben beide Hinweise ausgeblendet,
  wie bisher der Videokasten

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
