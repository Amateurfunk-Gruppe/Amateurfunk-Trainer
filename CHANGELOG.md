# Änderungsprotokoll — Amateurfunk-Trainer

**Entwickler und Urheber: Dietmar Reh.**
Alles, was in diesem Protokoll beschrieben wird, ist auf seine Veranlassung,
nach seinen Vorgaben und mit seinen Entscheidungen entstanden. Der Trainer
steht unter der [PolyForm Noncommercial License 1.0.0](LICENSE): kostenfrei
für Lernende, Ortsverbände und Volkshochschulen, kommerzielle Verwertung
ausgeschlossen.

Dieser erste Überblick fasst zusammen, was am Projekt bereits gearbeitet wurde, bevor die
Git-Historie eingerichtet wurde. Ab dem Initial-Commit läuft die Versionsgeschichte über die
normalen Commits weiter (siehe `git log --oneline`).

## Sicherheitskorrekturen (17.08.2026) — K1–K7, alle behoben

- **K1** — Der komplette Projektordner war öffentlich über den Server abrufbar (inkl. Quellcode).
- **K2** — Der Cloudflare-Tunnel startete automatisch, ohne dass jemand zugestimmt hatte.
- **K3** — `/api/userdata` (Lernstand) war ungeschützt lesbar, überschreibbar und löschbar.
- **K4** — `/api/start-tunnel` erlaubte Fremden, Prozesse auf dem PC zu starten/beenden.
- **K5** — `/api/tts` (Sprachausgabe) ließ sich für unbegrenzte Subprozesse missbrauchen (DoS).
- **K6** — Im Gruppenraum vertraute der Server dem Client bei Punkten und Identität blind —
  Ergebnisse und fremde Antworten ließen sich fälschen.
- **K7** — Ein fehlgeschlagener Start der Sprachausgabe (Piper) brachte den ganzen Server zum
  Absturz.

## Stabilität & Warnungen (17.08.2026) — Auswahl der wichtigsten Punkte

- Verzerrte Zufallsauswahl bei den Prüfungsfragen korrigiert.
- Raumcodes im Gruppenraum von 4 auf 6 Zeichen erweitert plus Kollisionsprüfung (kein doppelt
  vergebener Code mehr).
- Ein einzelner Klick auf „Gesamt-Auswertung" konnte vorher die automatische Endauswertung für
  den ganzen Raum dauerhaft abschalten — behoben.
- Speicherwachstum und Lost-Updates/Dateikorruption bei gleichzeitigem Schreiben der Lerndaten
  behoben.
- TTS-Cache: Race Condition behoben, wird nicht mehr bei jedem Serverstart gelöscht.
- Passwort stand im Klartext in der URL — jetzt sicher übergeben.
- Ungefangene Exceptions in den Socket-Handlern konnten den Server abschießen — jetzt abgefangen.

## Gruppenraum-Einladungslink / Tunnel (Nachlauf 17.08.2026)

- Der Einladungslink blieb dauerhaft bei „Tunnel startet noch…" hängen — der Tunnel startete
  tatsächlich nie automatisch. Behoben: Der Tunnel startet jetzt beim Öffnen des Gruppenraums.
- Cloudflare veröffentlicht den Namen eines neuen Tunnels erst einige Sekunden verzögert im DNS —
  wer sofort kopierte, bekam einen toten Link, der dann minutenlang tot blieb (negativer
  DNS-Cache). Behoben durch einen Selbsttest, der den Link erst freigibt, wenn er nachweislich
  erreichbar ist („🔎 wird geprüft…" → „✅ geprüft").
- Verwaiste `cloudflared.exe`-Prozesse (z. B. nach Schließen per X-Knopf) werden jetzt beim
  Serverstart automatisch aufgeräumt.
- Neu: lokale WLAN-Adresse als tunnelfreier Weg, wenn alle im selben Netz sind.

## Diese Woche (17.–18.08.2026)

- **Themes**: „Pastell Mode" in „Green Mode" umbenannt; der Umschalt-Knopf zeigt jetzt korrekt
  den *aktuell aktiven* Modus an (vorher stand dort teils der nächste statt des aktuellen).
- **Gruppenraum-Konfiguration**: Host konnte Fragenzahl/Bereich nach Raumerstellung nicht mehr
  ändern, ohne Erklärung warum. Jetzt änderbar, solange der Host allein im Raum ist und noch
  niemand geantwortet hat — inklusive Hinweistext, warum eine Änderung gerade (nicht) möglich ist.
- **Chat im Dark Mode**: Text war fast unlesbar (Kontrast ca. 1,1:1). Auf Theme-Variablen
  umgestellt, jetzt durchgehend über dem WCAG-Mindestwert von 4,5:1.
- **Smileys im Chat**: Textzeichen wie `:)`, `:O`, `:(`, `:*`, `^^` werden jetzt als Emoji
  dargestellt.
- **Fortschrittsanzeige (Punkte-Leiste)**: Kontrastfehler in allen drei Themes gefunden und
  behoben (u. a. weiß auf hellgrün nur 1,24:1 im Green Mode).
- **Gruppenraum-Verlauf**: Runden im Gruppenraum wurden nur unter sehr engen Bedingungen (Host,
  alle fertig) im persönlichen Verlauf gespeichert. Jetzt bekommt jeder Teilnehmer seinen eigenen
  Verlaufseintrag, sobald er selbst fertig ist.
- **Auswertungs-Popup im Gruppenraum**: Poppte bisher auch dann auf, wenn nur ein anderer
  Teilnehmer schneller fertig war oder auf „Gesamt-Auswertung" klickte — mitten in der eigenen
  Prüfung. Jetzt erscheint das Popup ausschließlich beim eigenen Abschluss; ist ein anderer
  Teilnehmer schneller fertig, landet dessen Ergebnis stattdessen als Nachricht im Gruppenchat.
- **Neuer „Teilnehmer"-Knopf**: Neben dem „Raum"-Knopf im Kopfbereich, mit einer Zahl, die
  mitzählt, wie viele Teilnehmer schon fertig sind. Öffnet eine Liste mit Ergebnis, Status und
  benötigter Zeit je Teilnehmer (bei laufenden Teilnehmern live mitlaufend) — ohne dabei
  irgendjemanden zu unterbrechen.

## Videolehrgang, Benutzernamen, Stichwortsuche (19.08.2026)

- **YouTube-Fenster „Fehler 153"**: Der Player blieb leer. Ursache war der Sicherheitsheader
  `Referrer-Policy: no-referrer` in `Server.js` — YouTube liefert ohne Referrer keinen Player aus.
  Behoben gezielt am Video-iframe (`referrerpolicy`-Attribut), der Header selbst bleibt streng.
  Zweiter Auslöser war `enablejsapi=1` ohne passenden `origin`-Parameter.
- **Videos laufen jetzt regulär über YouTube**: Klick auf „Auf YouTube ansehen" öffnet den
  Lehrgang von Michael, DL2YMR, mit Zeitmarke in einem neuen Tab — mit Werbung und als zählender
  Aufruf. Der Umweg über `yout-ube.com` ist entfallen.
- **Benutzernamen**: Der Name aus dem Raum-Dialog gehört jetzt zum Benutzer-Slot und ersetzt
  „Benutzer 1/2/3" in Verlauf, Löschen-Dialog und Reset-Fenster. Der Gruppenraum bekommt
  automatisch den Namen des aktiven Slots. Die Lerndaten liegen unverändert unter `user1/2/3`.
- **Stichwortsuche**: Die Suche oben findet weiterhin Fragennummern und springt direkt hin. Passt
  keine Nummer, wird der Fragetext nach dem Stichwort durchsucht (bewusst nicht die Antworten) und
  eine Trefferliste angezeigt. Mehrere Wörter müssen alle vorkommen, Umlaute und Groß-/
  Kleinschreibung sind egal.
- **Merkliste (Herz)**: Treffer und die gerade angezeigte Frage lassen sich mit einem Herz merken.
  Der Herz-Knopf neben der Suche öffnet die Merkliste, von dort startet eine Lernrunde mit genau
  diesen Fragen. Falsche Antworten zählen dabei ganz normal in Fehlerliste und Lernbedarf.
  Gespeichert wird pro Benutzer unter `amateurfunk_favorites_userX`, geschützt beim Cache-Leeren.

## Gruppenraum-Verlauf und gelernte Fragen (20.08.2026)

- **Gruppenraum landete nicht im Verlauf** — Ursache gefunden und behoben. Das Abschlussfenster
  des Gruppenraums rechnete mit `window.currentQuestions` und `window.progress`. Beide sind mit
  `let` angelegt und hängen deshalb gar nicht am `window`-Objekt; die Abfrage war immer leer.
  Folge: Das Fenster zeigte „0/0 richtig" und der Verlaufseintrag unterblieb komplett, weil er an
  die Bedingung `total > 0` geknüpft war. Auch der Trainer-Modus zeichnete aus demselben Grund
  nach dem Umschalten nicht neu.
- Der Verlaufseintrag für den Gruppenraum kommt jetzt aus **einer** Funktion
  (`duoVerlaufSchreiben`) statt aus zwei unabhängigen Stellen. Sie wird an drei Punkten
  aufgerufen: sobald die letzte eigene Frage beantwortet ist, beim Wartebildschirm und beim
  Abschlussfenster. Eine Kennung aus Raum, Fragenzahl und Ergebnis verhindert Doppeleinträge.
  Wer die Runde beendet und direkt zum Hauptmenü geht, hat den Eintrag trotzdem.
- `addHistoryEntry` schreibt jetzt direkt in `history[currentUser]` statt in das Ergebnis von
  `getCurrentHistory()`. Fehlte der Benutzer im Verlaufsobjekt, lieferte das ein freies Array —
  der Eintrag landete darin und war nach dem Speichern verschwunden.
- **Bereits gelernte Fragen** (neuer Haken in Gruppenraum und Prüfungssimulator): Gezogen wird
  weiterhin ganz normal aus dem vollen Topf — 25 Fragen wie in der echten Prüfung. Fragen, die
  als gelernt abgehakt sind, werden dabei automatisch als richtig gewertet und beim Blättern
  übersprungen; gefragt wird nur der Rest. Eine kurze Einblendung sagt beim Start, wie viele das
  waren. Im Gruppenraum gehen diese Antworten auch an den Server, damit der Raum den eigenen
  Fortschritt richtig sieht. Haken aus = alles wie bisher. Die Einstellung gilt für beide Räume
  gemeinsam (`amateurfunk_gelernteAutoRichtig`) und übernimmt einmalig den alten
  Simulator-Haken.

## Lernmodus: Verlauf und gelernte Fragen (20.08.2026, zweiter Durchgang)

- **„Gelernte ausblenden" wirkte nur in zwei von fünf Fällen.** Die Fragenauswahl hat den Haken
  bei „Alle Teile / 25 Fragen", bei „25 Fragen aus einem Teil" und bei der Gesamtprüfung mit 75
  Fragen schlicht ignoriert — ausgerechnet die üblichste Einstellung war betroffen. Die Filterung
  läuft jetzt für alle Varianten über eine Stelle (`ohneGelernte`). Bei den Prüfungsvarianten
  wird notfalls mit gelernten Fragen aufgefüllt, damit die Fragenzahl stimmt; sind alle Fragen
  gelernt, kommen wieder alle dran.
- **Abgebrochene Runden landen jetzt im Verlauf.** Bisher schrieb nur der Abschlussbildschirm
  einen Eintrag — wer eine Runde nicht bis zur allerletzten Frage durchspielte, fand hinterher
  nichts. Beim Verlassen einer Runde wird ausgewertet, was tatsächlich beantwortet wurde, und als
  „(Teilrunde)" eingetragen. Prüfungssimulator und Gruppenraum bleiben außen vor: Der eine
  schreibt selbst, beim anderen wäre eine abgebrochene Prüfung kein sinnvolles Ergebnis.
- **Antworten aus früheren Runden wurden mitgezählt.** `progress` blieb über Runden hinweg
  stehen. Tauchte eine Frage in einer neuen Runde wieder auf, galt sie sofort als beantwortet —
  die Fortschrittspunkte waren gefüllt, die Runde konnte vorzeitig als fertig gelten und das
  Endergebnis stimmte nicht. Jede Runde startet jetzt bei null (`neueRundeVorbereiten`).

## „Gelerntes erneut prüfen" (20.08.2026)

- Neuer Haken im Hauptmenü, direkt neben „Gelernte ausblenden": Er dreht den Stapel um und legt
  ausschließlich die Fragen vor, die schon als gelernt abgehakt sind — zum Nachprüfen, ob das
  auch wirklich sitzt. Eine falsche Antwort nimmt die Frage sofort wieder aus den gelernten
  heraus (das machte die Bewertung schon vorher so, hier ist es der eigentliche Zweck).
- Die beiden Haken schließen einander aus: Wer „Gelerntes erneut prüfen" setzt, sieht
  „Gelernte ausblenden" ausgegraut, und umgekehrt.
- Die Runde läuft immer als Übung, nie als Prüfung mit 19/25 — je nach Lernstand kommen auch mal
  nur acht Fragen zusammen. Der Verlauf trägt sie als „(Gelerntes geprüft)" ein.
- Anzeige folgt mit: Das Abzeichen zeigt „Nachprüfen: N", der Start-Knopf dieselbe Zahl, das
  Buch-Symbol weiterhin die noch offenen Fragen. Ist in einem Bereich noch nichts gelernt, kommt
  ein Hinweis statt einer leeren Runde.
- Nebenbei: „Gelernte ausblenden" wurde zwar gespeichert, aber nie wieder eingelesen — nach jedem
  Neuladen stand der Haken wieder auf dem Ausgangswert. Beide Einstellungen bleiben jetzt
  erhalten.

## Prüfungstermin und Tagespensum (21.08.2026)

- **Prüfungstermin in der Hauptansicht.** Wer das Datum einträgt, sieht darunter, was
  daraus folgt: „So., 20.09.2026 · noch 30 Tage · 285 offen · 10 Fragen pro Tag". Gerechnet
  wird mit den noch offenen Fragen des aktiven Filters, nicht mit dem ganzen Katalog — schaltet
  man Vorschriften und Betrieb ab, ändert sich das Pensum sofort mit. Ab 20 Fragen am Tag wird
  die Zeile gelb, ab 40 rot.
- Der Termin gehört zum Benutzer-Slot (`amateurfunk_pruefungstermin_userX`), damit drei Leute
  an einem Laptop nicht denselben sehen. Beim Cache-Leeren bleibt er erhalten, ebenso die
  beiden neuen Haken für die gelernten Fragen.
- Daneben ein Link auf die Terminliste der Bundesnetzagentur. Der Link ist geprüft, aber die
  Behörde hat den Amateurfunk-Bereich schon einmal verschoben — falls er ins Leere läuft, führt
  die Suche nach „Bundesnetzagentur Amateurfunk Prüfungstermine" zum aktuellen Stand.
- Die Farben der Pensum-Zeile stehen bewusst fest statt auf `var(--good)`/`var(--warn)`: Die
  Themevariablen sind für farbige Flächen gedacht und erreichen auf dem hellen Kasten nur rund
  3:1. Die drei festen Werte liegen in allen fünf Stilen über 4,5:1 (schlechtester Fall 4,87).

## Lernen nach Lektionen des Videolehrgangs (21.08.2026)

- **Die 14 Lektionen von Michael, DL2YMR, stehen jetzt im Fragenbereich zur Auswahl** — als
  eigene Gruppe unter „Alle Teile / Vorschriften / Betrieb / Technik". Wer „Lektion 09 ·
  Transceiver Aufbau und Funktion (31)" wählt, bekommt genau die 31 Fragen, die Michael in
  dieser Lektion behandelt. Daneben ein roter Knopf, der die Lektion auf YouTube öffnet.
  Ansehen, dann die Fragen dazu — das war bisher nicht möglich.
- Die Zuordnung musste nicht erfunden werden: Sie steckt seit jeher in `video_map_embed.js`,
  jede Frage trägt dort ihre Lektion. Bisher wurde die Angabe nur einzeln unter der Frage
  angezeigt. Alle 571 Fragen sind zugeordnet, keine fällt heraus.
- Eine Lektion ist immer eine Übungsrunde, nie eine Prüfungswertung: Sie mischt alle drei
  Prüfungsteile und umfasst je nach Lektion 5 bis 99 Fragen — „19 von 25 zum Bestehen" ergäbe
  dort keinen Sinn. Fehler zählen ganz normal in Fehlerliste und Lernbedarf.
- Alles andere gilt unverändert weiter, weil die Auswahl über dasselbe Feld läuft wie die
  Prüfungsteile: Fragenanzahl, „Gelernte ausblenden", „Gelerntes erneut prüfen", der
  Start-Zähler und das Tagespensum bis zum Prüfungstermin rechnen mit der Lektion.
- Im Verlauf steht die Runde als „Lektion 09".
- Das Auswahlfeld ist auf 260 Pixel gedeckelt: Die vollen Lektionstitel sind bis zu 80 Zeichen
  lang und hätten das Feld auf über 600 Pixel aufgebläht. Gekürzt im Feld, vollständig im
  Tooltip.

## Lektionsübersicht mit den Fragen dazu (21.08.2026)

- **Der Link „Videolehrgang zur Klasse N" in der Fußzeile öffnet jetzt eine Übersicht im
  Trainer** statt nur die YouTube-Playlist. Für jede der 14 Lektionen steht dort: Thema,
  Lernfortschritt als Balken („12/31 gelernt"), ein Knopf zum Video und — der eigentliche
  Punkt — ein Knopf **„31 offene Fragen lernen"**, der genau diese Fragen sofort als Runde
  lädt. Der Umweg über das Auswahlfeld entfällt.
- Der Knopf setzt die Fragenanzahl auf „Alle": Wenn dort „31 offene Fragen" steht, sollen auch
  alle 31 kommen und nicht die im Anzahl-Feld eingestellten 25.
- **Jede Lektion lässt sich aufklappen und zeigt ihr Inhaltsverzeichnis** — 8 bis 38
  Kapitelmarken mit Zeitangabe und Beschreibung, jede anklickbar und direkt an die Stelle im
  Video springend. Daneben stehen die Fragennummern, die zu diesem Kapitel gehören: Jede Frage
  wird dem Kapitel zugeschlagen, das vor ihrer Zeitmarke beginnt.
- Die feine Gliederung stammt aus `video_lessons.json`. Diese Datei lag zwar im Projekt, war
  aber in `Server.js` nicht freigegeben — der Abruf lief in einen 404, weshalb er irgendwann
  entfernt wurde. Sie steht jetzt in `PUBLIC_FILES` (nur Kursdaten, keine Nutzerdaten).
  **Dafür muss der Server einmal neu gestartet werden.** Fehlt die Datei, greift die gröbere
  Herleitung aus der Video-Map (2 bis 11 Marken je Lektion) — es fällt nichts aus.
- Geladen wird das Inhaltsverzeichnis erst beim Öffnen der Übersicht. Das Fenster steht sofort,
  die Kapitelmarken kommen einen Wimpernschlag später dazu.

## Aufgeräumte Hauptansicht und Kurzanleitung (21.08.2026)

- **Der Platzhalter „Filter wählen und ‚Start' tippen" ist entfallen.** Er nahm im Hauptmenü
  Platz weg und sagte nichts, was nicht schon an den Knöpfen darüber steht. Entfernt an allen
  fünf Stellen, an denen er erzeugt wurde, samt der Zeile, die seinen Text pflegte.
- **Der Videolehrgang hat ein eigenes Feld unter „Lernen aktiv für".** In der oberen Leiste
  stehen wieder nur die vier bekannten Einträge: Alle Teile, Vorschriften, Betrieb, Technik.
  Mit den 14 Lektionen darin wurde die Leiste zu eng — jetzt ist unten Platz, und der Bereich
  der Hauptansicht ist gleichmäßig ausgenutzt.
- Das neue Feld führt seine eigene Zählung („12 von 31 gelernt") und hat drei Knöpfe: die
  Fragen der Lektion lernen, das Video ansehen, und die Übersicht aller Lektionen. Eine
  Lektionsrunde läuft über einen eigenen Weg (`lektionRundeStarten`) statt über den
  Prüfungsteil-Filter — dadurch bleibt die obere Leiste unberührt und der Verlaufseintrag
  heißt trotzdem „Lektion 09".
- **Neuer Info-Knopf oben rechts** mit einer Kurzanleitung in elf Abschnitten: Lernrunde,
  wann eine Frage als gelernt gilt, Prüfungstermin, Videolehrgang, die Knöpfe an der Frage,
  Tastaturbefehle, Suche, Prüfungssimulator, Gruppenraum, die drei Benutzer und der
  Unterschied zwischen den drei Reset-Knöpfen.
- **Die Videolehrgang-Zeile im Stil von „Sichern" und „Einlesen".** Vorher war dort jedes
  Element unterschiedlich hoch — Auswahlfeld 25, Hauptknopf 21, die beiden hellen Knöpfe 23
  Pixel. Jetzt stehen alle vier auf derselben Linie wie die schmalen Knöpfe darüber (20,9 Pixel).
  Dafür zwei neue Klassen: `.btn-lernstand-hell` (heller Zwilling zu `.btn-lernstand`, mit einem
  Pixel weniger Innenabstand, weil der Rahmen außen dazukommt) und `.select-schmal` (feste Höhe
  in rem, weil Auswahlfelder von sich aus höher bauen als Knöpfe).
- Zwei Kontrastfehler dabei behoben: Der Info-Knopf hatte weiße Schrift auf #0e9aa7 (3,39:1) und
  ist jetzt dunkler (5,90:1). Der Knopf „Fragen lernen" stand im Dark Mode dunkelblau auf
  dunkelblau (1,17:1), weil der Lernfortschritt-Kasten dort aufgehellt ist — jetzt weiße Schrift.

## Verlauf: einzelne Einträge löschen, Spalten auf einer Linie (21.08.2026)

- **Der Kasten „Lernfortschritt" endet jetzt exakt dort, wo der Verlauf daneben endet.** Der
  Unterschied waren 13 Pixel und kam von einem Abstand nach unten, den dieser Kasten noch aus
  der Zeit mit dem Platzhalter darunter hatte. In der Hauptansicht ist er das letzte sichtbare
  Element; während einer Runde ist er ausgeblendet, dort fehlt also nichts.
- **„Löschen" im Verlauf räumt nicht mehr sofort alles ab.** Der Knopf schaltet zuerst in eine
  Auswahl: Jede Zeile bekommt ein Kästchen, im Kopf der Tabelle sitzt eins zum An- und
  Abwählen aller, und daneben stehen drei Knöpfe — „2 löschen" (zählt mit, was angekreuzt ist,
  und ist ohne Auswahl ausgegraut), „Alle löschen" mit der bisherigen Sicherheitsabfrage, und
  „Abbrechen".
- Nach dem Löschen oder Abbrechen sieht das Feld wieder aus wie vorher. Ein Benutzerwechsel
  beendet eine offene Auswahl ebenfalls — sie gehörte zum vorherigen Benutzer.
- Beim Löschen zählt die Stelle im gespeicherten Verlauf, nicht die Zeilennummer: Die Tabelle
  läuft rückwärts, neueste Runde oben. Geprüft, dass genau die angekreuzten Runden
  verschwinden und die übrigen unverändert stehen bleiben.

## Lektionsanzeige: beide Zahlen statt einer (21.08.2026)

- Im Auswahlfeld stand nur die Gesamtzahl der Fragen einer Lektion — „Lektion 01 …
  (52)" —, während der Knopf direkt daneben „25 offene Fragen lernen" sagte. Zwei richtige
  Zahlen mit verschiedener Bedeutung, unmittelbar nebeneinander: Das liest sich wie ein
  Widerspruch. Jetzt nennt das Feld beide: **„(25 von 52)"**, der Tooltip schreibt es aus.
- Die Beschriftung wird nach jeder Antwort mitgezogen, damit die offene Zahl stimmt.
- Nachgeprüft: Auswahlfeld und Übersicht lesen dieselbe Quelle und zeigen für alle 14
  Lektionen dieselben Werte. Auch die geladene Runde hat genau so viele Fragen, wie der Knopf
  ankündigt (Lektion 01: 52 von 52 bei leerem Lernstand).

## Bekannt: die Lektionszuordnung ist grob

Die Zuordnung Frage → Lektion stammt aus `video_map_embed.js` und ist gröber, als die Zahlen
vermuten lassen. Die 52 Fragen der Lektion 01 hängen an nur 4 verschiedenen Zeitmarken, die 99
Fragen der Lektion 02 an 5 — davon 84 auf Sekunde 0. Über den ganzen Katalog hängen 279 von 571
Fragen (49 %) an der jeweils ersten Zeitmarke ihrer Lektion. Das ist eine thematische
Sammelzuordnung, keine Aussage darüber, welche Fragen im Video tatsächlich behandelt werden.
Zum Lernen taugt es, für „das erklärt Michael hier" nur bedingt.

## Woher weiß ich, welchen Stand ich habe? (22.08.2026)

Anlass: Eine Mitlernende hatte das Update über den Einladungslink, in ihrem heruntergeladenen
Ordner fehlte es. Der Update-Weg selbst ist in Ordnung — das ZIP wird bei jedem Abruf frisch
aus dem Projektordner gebaut, ohne Zwischenspeicher. Wer es lädt, bekommt den Stand von genau
diesem Moment. Nur: Der heruntergeladene Ordner ist danach eine Momentaufnahme und erfährt von
späteren Änderungen nichts, denn er hat seinen eigenen Server. Über den Link dagegen kommen die
Dateien bei jedem Aufruf frisch vom Gastgeber.

Sichtbar war das bisher nirgends. Deshalb:

- **Der Info-Knopf zeigt jetzt den Dateistand**: „Dieser Trainer läuft mit dem Stand f1a618fe7a
  – Index.html vom 22.08.2026, 06:46." Zwei Leute können damit in fünf Sekunden vergleichen, ob
  sie dieselbe Fassung haben. Die Angabe kommt aus `/api/version`, das es für den
  Gruppenraum-Abgleich ohnehin schon gab. Ohne laufenden Server steht dort ein passender
  Hinweis statt einer Fehlermeldung.
- **Das Paket schreibt seinen Stand in die ANLEITUNG.txt** — Kennung, Erstellungsdatum und das
  Änderungsdatum der enthaltenen Index.html. Dazu die Erklärung, dass für ein Update das Paket
  neu geladen und daraus Index.html und Server.js kopiert werden — der Lernstand im Ordner
  `data/` bleibt dabei erhalten.
- Für die Änderung an der ANLEITUNG muss der Server einmal neu gestartet werden.

## Abgleich mit dem Gastgeber (22.08.2026)

Wer sich den Trainer über „Trainer herunterladen" mitgenommen hat, musste bisher bei jeder
Änderung das ganze Paket neu laden und Dateien von Hand kopieren. Das geht jetzt auf Knopfdruck.

- **Info-Fenster → „Beim Gastgeber nach Neuerungen sehen".** Der Trainer fragt beim Gastgeber
  nach, vergleicht neun Dateien über einen Inhalts-Hash (nicht über den Zeitstempel — der ändert
  sich beim Kopieren, der Inhalt nicht) und listet auf, was abweicht.
- **Die Adresse muss niemand eintippen.** Das heruntergeladene Paket enthält eine
  `herkunft.json` mit der Adresse, unter der es geholt wurde. Ändert sich die Tunnel-Adresse des
  Gastgebers, lässt sie sich im Feld überschreiben und wird gemerkt.
- **Getrennt nach Gefährlichkeit** — das bestimmt den ganzen Aufbau:
  - *Daten* (fragen.json, svg-list.json, video_map_embed.js, video_lessons.json) und
    *Anzeige* (Index.html, duo.js, klick-sound.js, tts-expand.js) kommen auf einen Klick.
  - *Server.js* nicht. Es läuft mit vollen Rechten auf dem Rechner des Empfängers. Der Abgleich
    meldet die Abweichung, erklärt in einem roten Kasten, was das bedeutet, und verlangt einen
    eigenen Knopf. Der Server lehnt einen Anwenden-Aufruf ohne dieses Bekenntnis mit einem
    Fehler ab — ein versehentlicher Klick reicht also nicht.
- **Vorher wird gesichert.** Die alten Dateien landen unter `backup/abgleich_<Datum>/`.
  Geschrieben wird atomar (erst daneben, dann umbenennen), damit bei einem Abbruch keine halbe
  Index.html im Ordner steht.
- **Absicherung:** Die beiden anwendenden Endpunkte sind `localOnly` — von außen nicht
  auslösbar. Ausgeliefert werden ausschließlich die neun Dateien der Whitelist; Pfadangaben wie
  `../Server.js` und alles Übrige werden mit 404 abgewiesen (geprüft). Die Adresse wird auf
  http/https und den reinen Ursprung reduziert, jede Datei ist auf 20 MB begrenzt.
- Getestet mit zwei laufenden Trainern: Unterschiede korrekt erkannt, Server.js ohne
  Bestätigung abgelehnt, nach dem Abgleich alle drei Dateien identisch zum Gastgeber, Sicherung
  vollständig.

## Gruppenraum: richtig und falsch statt nur richtig (22.08.2026)

- In der Teilnehmerliste und in der Endauswertung stand nur „27/50 richtig". Das ließ offen, ob
  die fehlenden 23 danebengingen oder noch gar nicht dran waren — bei einer laufenden Runde ein
  wesentlicher Unterschied. Jetzt steht dort **„27 richtig / 7 falsch (34 von 50)"**.
- Die Zahlen schickt der Server längst mit (`wrong`, `answered`); sie wurden nur nicht angezeigt.
  Fehlt das Feld — etwa weil am anderen Ende eine ältere Fassung läuft —, wird es aus beantwortet
  minus richtig hergeleitet.

## Standwache: veraltete Seiten melden sich (22.08.2026)

Anlass: Eine Mitlernende hatte den Trainer über den Einladungslink offen und sah tagelang eine
Fassung vom 18.08.

Nachgemessen am laufenden Trainer über den Tunnel: Der Server liefert die aktuelle Datei aus
(Index.html, 542.703 Bytes vom 22.08. 07:00), und die ausgelieferte Seite enthält alle neuen
Merkmale — Info-Knopf, Prüfungstermin, Videolehrgang, beide Haken. Auch die Kopfzeilen sind
streng (`no-store, no-cache, must-revalidate`), ein Browser-Cache scheidet also aus. Am
Ausliefern lag es nicht.

Was bleibt: eine Seite, die seit Tagen offen steht und nie neu geladen wurde. Von innen ist das
nicht zu erkennen — sie sieht ja aus wie beim Laden. Deshalb:

- **Der Trainer prüft jede Minute beim Server nach** und meldet sich mit einem Banner, wenn
  eines von zwei Dingen zutrifft: Der Server hat eine andere Startzeit (er wurde neu gestartet,
  diese Seite stammt also aus der Sitzung davor) oder eine andere Datei-Kennung (am Trainer
  wurde etwas geändert). Beides zusammen deckt jeden Fall ab, in dem die offene Seite nicht
  mehr dem entspricht, was der Server hat.
- Der Gruppenraum hatte so etwas schon, aber nur für den zweiten Fall und nur, solange duo.js
  geladen ist. Die Standwache läuft immer, auch beim Alleinlernen.
- „Später" blendet das Banner aus, ohne die Prüfung abzuschalten.

Zur Tunnel-Adresse, weil es hier hineinspielt: Sie ändert sich bei **jedem** Neustart des
Trainers. Ein Link von gestern führt danach ins Leere — nach einem Neustart muss der neue Link
verteilt werden.

## Der eigene Ordner zieht sich selbst nach (22.08.2026)

Der Fall, um den es ging: Über den Einladungslink sieht man den neuesten Stand. Startet man
danach den **eigenen** Trainer, ist wieder die alte Fassung da — der eigene Ordner weiß von den
Änderungen nichts.

- **Der Trainer fragt jetzt beim Start selbst beim Gastgeber nach** und holt, was sich geändert
  hat. Die Adresse steht in der `herkunft.json`, die beim Herunterladen des Pakets mitkommt;
  eingetippt werden muss nichts. Der Abgleich läuft 1,5 Sekunden nach dem Start im Hintergrund —
  der Server ist sofort da, und ist der Gastgeber nicht erreichbar, passiert schlicht nichts.
- **Server.js wird dabei nie automatisch ersetzt.** Es läuft mit vollen Rechten auf dem eigenen
  Rechner. Weicht es ab, sagt der Trainer das in der Konsole und im Banner — übernommen wird es
  nur über den ausdrücklichen Schritt im Abgleich-Fenster.
- **Man sieht, dass etwas passiert ist.** Beim nächsten Laden steht oben in Grün: „Beim Start
  wurden 3 Datei(en) vom Gastgeber übernommen: fragen.json, Index.html, duo.js". Ohne diese
  Meldung wäre der Ordner plötzlich aktuell, und niemand wüsste, warum. Die Meldung erscheint
  einmal je Abgleich.
- Vorher wird wie beim Abgleich von Hand nach `backup/autoabgleich_<Datum>/` gesichert.
- Abschaltbar mit `AFU_AUTO_ABGLEICH=0`.
- Die im Abgleich-Fenster eingetragene Adresse wird jetzt auch im Ordner gemerkt — nach einem
  Tunnel-Wechsel muss sie also nur einmal nachgetragen werden.

Getestet mit zwei laufenden Trainern: Der Gast startete mit gekürzter Index.html, halbierter
fragen.json und veränderter Server.js. Nach dem Start waren Index.html, fragen.json und duo.js
identisch zum Gastgeber, Server.js unangetastet und gemeldet, die alten Fassungen in der
Sicherung. Der Gastgeber selbst gleicht nichts ab — er hat keine `herkunft.json`.

## Warum der Ordner nicht vom Einladungslink aus beschrieben werden kann (22.08.2026)

Der naheliegende Weg wäre: Wer über den Einladungslink mitmacht, dessen eigener Ordner wird von
dieser Seite aus gleich mitaktualisiert. Technisch ginge das — die Seite müsste den Trainer auf
`http://127.0.0.1:3000` ansprechen, der auf demselben Rechner läuft.

Gebaut und gemessen: **Chrome lässt das nicht zu.** Zugriffe von einer Seite aus dem offenen
Netz auf Adressen im lokalen Netz („Local Network Access") sind gesperrt. Der Server beantwortet
die Vorab-Anfrage inzwischen korrekt mit `Access-Control-Allow-Private-Network: true` — im Test
nachgewiesen, 204 mit Header —, trotzdem lehnt Chrome ab:

> Access to fetch at 'http://127.0.0.1:3000/…' from origin 'https://….trycloudflare.com' has
> been blocked by CORS policy: Permission was denied for this request to access the `unknown`
> address space.

Neuere Chrome-Fassungen verlangen dafür eine ausdrückliche Zustimmung des Nutzers. Der Versuch
bleibt als Bonus im Code (ein einziger Port, damit die Konsole nicht vollläuft): Klappt es —
etwa in Firefox oder mit erteilter Berechtigung —, erscheint ein Banner „Ordner aktualisieren".
Klappt es nicht, passiert schlicht nichts.

**Der verlässliche Weg bleibt der Abgleich beim Start des eigenen Trainers.** Der läuft ohne
Browser dazwischen und kennt diese Sperren nicht. Damit ist das Herunterladen des Pakets künftig
nicht mehr nötig — der Ordner zieht sich bei jedem Start selbst nach.

## Fanfare und Konfetti im Gruppenraum (22.08.2026)

- **Wer im Gruppenraum besteht, bekommt jetzt Fanfare und Konfetti** — in der Gesamt-Auswertung
  und im Abschlussfenster. Ausgelöst wird es nur für die eigene Leistung, nicht wenn jemand
  anderes besteht.
- **Das Konfetti fällt hinter dem Fenster.** Der Canvas liegt sonst auf z-index 99999 und damit
  über allem; für die Auswertung wird er auf 99985 gesetzt, das Fenster sitzt auf 99990. Nach
  zehn Sekunden und beim Schließen geht es zurück auf den Normalwert.
- Das Fenster wird beim Aktualisieren neu gezeichnet — gejubelt wird trotzdem nur einmal, eine
  Kennung aus Ergebnis und Fragenzahl verhindert die Wiederholung.

Zwei Fehler kamen beim Testen ans Licht, beide behoben:

- **Ohne Internet gab es keine Fanfare.** Sie wurde in `triggerConfetti` erst nach der Prüfung
  auf die Konfetti-Bibliothek abgespielt — und die wird von einem fremden Server nachgeladen.
  Kein Netz, kein Konfetti, also auch kein Ton. Fanfare und Konfetti laufen jetzt getrennt.
- **Endlosschleife bei fehlender Bibliothek.** War `confetti` nicht geladen, sah `triggerConfetti`
  alle 200 Millisekunden nach — ohne Ende, im Test 6 Aufrufe in einer Sekunde und weiter. Nach
  drei Sekunden ist jetzt Schluss.

## Geister-Eintrag nach der Gruppenraum-Runde (22.08.2026)

Gemeldet: Im Gruppenraum 25 Fragen, 5 falsch, am Ende Fanfare und „Bestanden" — im Verlauf
aber 62 % und ein rotes Kreuz.

Ein Blick in die gespeicherten Daten zeigte, dass beide Anzeigen recht hatten. Es waren zwei
verschiedene Einträge:

```
15  22.8.2026, 07:59:36 | Gruppenraum NA5GR6      | 20/25 | pass
16  22.8.2026, 07:59:55 | Alle Teile (Teilrunde)  |  8/13 | fail
```

Der Gruppenraum-Eintrag stimmte. Neunzehn Sekunden später kam ein zweiter dazu — 8 von 13,
gerundet 62 % —, und der stand im Verlauf obendrauf. Dasselbe Muster fand sich bei den Einträgen
9/10 und 11/12.

Ursache war die „Teilrunde", die seit gestern beim Verlassen einer laufenden Runde geschrieben
wird. Ihre Sperre prüfte, ob gerade ein Gruppenraum aktiv ist — beim Zurückgehen ins Hauptmenü
ist der Raum aber schon verlassen, die Sperre griff also nicht mehr.

- Jede Runde merkt sich jetzt, ob für sie bereits ein Verlaufseintrag geschrieben wurde
  (`rundeGewertet`). Ist das der Fall, unterbleibt die Teilrunde — unabhängig davon, ob es eine
  Gruppenraum-Runde, eine Lektion, der Simulator oder eine Übungsrunde war. Zurückgesetzt wird
  das Merkmal an allen sieben Stellen, an denen eine neue Runde beginnt.
- Nachgestellt und geprüft: 25 Fragen, davon 5 falsch, Raum verlassen, zurück ins Hauptmenü —
  danach steht genau ein Eintrag im Verlauf, „Gruppenraum NA5GR6, 20/25, pass". Eine echte
  Teilrunde (4 von 25 beantwortet, dann abgebrochen) wird weiterhin geschrieben.

Woher die 8 von 13 kamen, klaerte sich beim Nachrechnen: In der Runde waren 25 Fragen, davon 12
bereits gelernt und durch den Haken automatisch als richtig gewertet. Gefragt wurden also 13, und
davon gingen 5 daneben - bleiben 8. Zusammen mit den 12 automatisch gewerteten sind das 20 von
25, und genau das stand im Gruppenraum-Eintrag. Beide Zahlen waren richtig, sie zaehlten nur
Verschiedenes.

- **Die Teilrunde zaehlt die automatisch gewerteten Fragen jetzt mit.** Sie sind Teil des
  Ergebnisses; sie wegzulassen ergab "8 von 13, 62 %, nicht bestanden" fuer dieselbe Runde, die in
  Wahrheit 20 von 25 hatte. Ob ueberhaupt ein Eintrag entsteht, haengt weiterhin daran, dass
  mindestens eine Frage **selbst** beantwortet wurde - wer eine Runde startet und sofort
  abbricht, soll nicht mit "12 von 12, 100 %" im Verlauf stehen.
- Nachgestellt mit genau dieser Lage: 25 Fragen, 12 davon gelernt, 13 gefragt, 5 falsch. Ergebnis
  im Verlauf: ein einziger Eintrag, "Gruppenraum NA5GR6, 20/25, 80 %, bestanden".

Die bereits vorhandenen Geister-Einträge lassen sich mit „Löschen" im Verlauf einzeln entfernen.

## Verlauf ohne laufende Nummer (22.08.2026)

Die Spalte `#` vorne im Verlauf zaehlte die Eintraege durch (12, 11, 10 ...). Sie kostete
Breite, und weil die Verlaufsspalte schmal ist, musste die Tabelle dafuer waagerecht scrollen -
besonders bei langen Teilnamen wie "Gruppenraum NA5GR6".

- **Die Spalte ist raus.** Es bleiben Datum, Teil, R, F, % und Ergebnis. Der Zaehler war ohnehin
  nur eine Wiederholung der Reihenfolge, die man an den Datumsangaben ablesen kann.
- **Die Nummer selbst wird intern weiter berechnet.** Die Tabelle laeuft rueckwaerts (neueste
  oben), die gespeicherte Liste vorwaerts - aus der Nummer ergibt sich die Stelle im Array, und
  daran haengt das Loeschen einzelner Eintraege. Wer die Zeile `const num = ...` mit entfernt,
  loescht kuenftig die falschen Eintraege.
- Nachgemessen mit 12 bzw. 14 Eintraegen: `scrollWidth` und `clientWidth` sind gleich, es wird
  also nicht mehr seitlich gescrollt - auch nicht im Loesch-Auswahlmodus mit der zusaetzlichen
  Ankreuzspalte. Der Loeschtest traf weiterhin genau den ausgewaehlten Eintrag, und danach sah
  die Spalte wieder aus wie vorher.

## Zwei Knoepfe statt drei im Loeschmodus (22.08.2026)

Im Auswahlmodus des Verlaufs standen drei Knoepfe untereinander: "Einzelne loeschen",
"Alle loeschen", "Abbrechen". Die Spalte ist zu schmal fuer drei nebeneinander.

- **"Alle loeschen" ist entfernt.** Das Kaestchen in der Kopfzeile neben "Datum" waehlt bereits
  alle Eintraege aus - dann steht auf dem Knopf "16 loeschen", und ein Klick raeumt denselben
  Verlauf ab. Zwei Wege fuer dieselbe Sache brauchten den Platz nicht.
- **"Abbrechen" steht jetzt neben "Einzelne loeschen".** Bei 320 px Spaltenbreite belegen die
  beiden 112 + 81 px - sie passen in eine Reihe, nachgemessen bei 1150, 1280, 1400 und 1920 px
  Fensterbreite.
- Die Funktion `clearHistory()` samt Sicherheitsabfrage bleibt im Programm; nur der Knopf ist weg.
  Sie haengt an keinem anderen Aufruf mehr, laesst sich aber jederzeit wieder einhaengen.
- Geprueft: alles auswaehlen -> "9 loeschen" -> Verlauf leer, Leerzeile mit richtigem `colspan`,
  Auswahlmodus beendet sich von selbst. "Abbrechen" laesst den Verlauf unangetastet.

## Hoerbuch fuers Autoradio (23.08.2026)

Neues Feld in der Hauptansicht, direkt unter dem Videolehrgang: Fragen und die
richtige Antwort werden zu MP3-Dateien gesprochen, die man auf einen USB-Stick kopiert.

Aufbau je Frage: **Frage - drei Sekunden Stille - richtige Antwort.** Die Stille ist der
Kern der Sache, in der Zeit antwortet man selbst. Und es wird ausschliesslich die richtige
Antwort gesprochen: Wer die drei falschen mithoert, praegt sie sich mit ein. Beim Lesen
sieht man, welche angekreuzt gehoert - am Steuer sieht man nichts.

**Bedienung.** Auswahl (alle Lektionen, nur die gewaehlte, nur noch nicht Gelerntes,
Fehlerliste, Lernbedarf, Merkliste, nach Pruefungsteil), Aufteilung, Denkpause in Sekunden,
dann "MP3 erstellen". Daneben steht vorab, was dabei herauskommt: "562 Fragen · 14 Dateien ·
rund 2 Std. 31 Min. Spielzeit". Waehrend des Laufs zeigt dasselbe Feld den Fortschritt.

**Eine Datei je Lektion oder je Frage.** Je Lektion springt am Radio die Titeltaste zur
naechsten Lektion. Je Frage steht der Fragetext im ID3-Titel - und den zeigt ein Autoradio
im Display an, waehrend die Frage laeuft. Das ist der einzige Weg, den Text unterwegs zu
sehen: Synchronisierte Liedtexte (SYLT) oder Kapitelmarken kann kaum ein Autoradio.

**Warum der Server das macht.** Piper laeuft fuer 571 Fragen ueber 1000 Mal - je nach
Rechner eine halbe bis eine ganze Stunde. Der Auftrag laeuft deshalb im Hintergrund weiter,
auch wenn der Browser zugeklappt wird; der Trainer fragt den Fortschritt alle zwei Sekunden
ab. Ein Neuladen der Seite findet den laufenden Auftrag wieder.

**Technische Entscheidungen, die nicht selbsterklaerend sind:**

- **44100 Hz, obwohl Piper nur 22050 Hz liefert.** Das Hochrechnen fuegt keine einzige
  Frequenz hinzu. Aber aeltere Autoradios spielen nur MPEG-1 Layer III (32/44,1/48 kHz);
  eine 22050-Hz-Datei ist MPEG-2 Layer III und bleibt bei solchen Geraeten stumm - ohne
  Fehlermeldung. Die paar MB Aufschlag sind das wert. 64 kBit/s mono: 2,5 Stunden = 70 MB.
- **Kodiert wird haeppchenweise, nicht am Stueck.** Zweieinhalb Stunden Ton am Stueck im
  Speicher waeren 800 MB gewesen - ein Speicherfehler nach einer halben Stunde Rechenzeit.
- **ID3-Text in UTF-16.** ID3v2.3 kennt UTF-8 offiziell nicht; aeltere Radios zeigen dann
  statt Umlauten Kraut und Rueben, und Umlaute hat hier fast jeder zweite Satz.
- **Der MP3-Kodierer liegt als `lame.js` bei** (lamejs, LGPL) statt per npm oder ffmpeg.
  Der Trainer laeuft bei Leuten, die ihn als ZIP bekommen und START.bat anklicken - jede
  zusaetzliche Installation ist ein Schritt, der schiefgehen kann, und ffmpeg waere 80 MB.
- **Dateinamen mit fuehrender Null und Lektionsnummer aus dem Titel.** Autoradios sortieren
  nach Dateiname. Ohne Null kaeme Lektion 10 vor Lektion 2; ohne die echte Nummer hiesse
  jede einzeln nacherzeugte Lektion "01" und stuende vor allen anderen.
- **Umlaute und Gedankenstriche werden im Dateinamen ersetzt** (ae, oe, ue, "-"), weil
  Radios mit reiner ASCII-Anzeige sonst Kaestchen zeigen. Im Titelfeld bleibt jedes Zeichen.
- **Bildfragen bleiben drausssen, abschaltbar.** Zwei Sorten: Bei 9 Fragen ist die richtige
  Antwort ein Schaltsymbol - die koennen gar nicht gesprochen werden und fallen immer weg.
  Zu weiteren 52 gehoert eine Zeichnung ("Welches Diagramm zeigt den Verlauf?"); gehoert
  sind sie wertlos. Der Haken "ohne Bildfragen" ist voreingestellt an, dann bleiben 510 der
  571 Fragen uebrig. Ohne Haken sind alle dabei.
  Im Katalog steht nicht, ob zu einer Frage ein Bild gehoert - der Trainer erkennt es am
  Dateinamen im svgs-Ordner (NB201.svg bzw. NB202_q.svg), also an derselben Liste, aus der
  auch die Anzeige der Frage ihr Bild holt. Damit stimmt die Auswahl automatisch, sobald
  eine Zeichnung dazukommt.
- **Vorhandene Dateien werden uebersprungen.** Wer nach einem Abbruch neu startet, macht da
  weiter, wo es aufhoerte. Geschrieben wird ueber eine `.teil`-Datei, damit ein Absturz
  keine halbe MP3 hinterlaesst, die beim naechsten Lauf als fertig gilt.
- **Abbrechen schiesst den laufenden Piper ab.** Der meldet dann "Exitcode null" - das ist
  kein Fehler, sondern das Gewuenschte. Ohne diese Unterscheidung endete jeder Abbruch rot,
  und das bereits Gesprochene wurde weggeworfen. Jetzt wird die angefangene Lektion fertig
  geschrieben: eine halbe Lektion auf dem Stick ist mehr wert als eine halbe Stunde
  Rechnen fuer nichts.

**Nur am Trainer-PC.** Alle Endpunkte sind `localOnly`. Wer ueber den Einladungslink dabei
ist, sieht das Feld gar nicht erst - er koennte auf dem fremden Rechner ohnehin nichts
ablegen, und ein Knopf, der immer "verboten" sagt, ist schlimmer als keiner.

**Ein Fehler, der beim Bauen auffiel:** Das Feld wurde zuerst mit `element.style.display`
eingeblendet. Die Dunkelmodus-Regeln greifen die Felder der Hauptansicht aber ueber ihr
style-Attribut ab (`div[style*="background:#f4f7fd"]`). Ein einziges Setzen von
`style.display` schreibt das Attribut neu - der Browser macht daraus
`background: rgb(244, 247, 253)`, der Treffer geht verloren, und das Feld blieb im
Dunkelmodus als einziges hellblau stehen. Jetzt schaltet eine CSS-Klasse. Nachgemessen in
allen fuenf Ansichten (hell, dunkel, gruen, blau, orange): Feldfarbe identisch zum
Videolehrgang darueber, Beschriftung ab 12,3:1, Hinweistext ab 4,8:1.

Getestet mit einer Piper-Attrappe und einem zweiten, unabhaengigen Leser (ffprobe): Format,
Abtastrate, Kanalzahl, Spielzeit und alle ID3-Felder je Datei nachgemessen, dazu Abbruch,
Wiederaufnahme, Doppelstart und der Zugriff von aussen.

## Klassen E und A: der Trainer kann jetzt alle fuenf Pruefungswege (25.08.2026)

Bisher nur Klasse N. Jetzt waehlbar ueber den Knopf "Ziel wählen" oben neben dem Abzeichen:

| Auswahl | Inhalt | Fragen |
|---|---|---|
| Klasse N · Basis | Vorschriften 204 + Betrieb 172 + Technik N 195 | 571 |
| Aufstockung N → E | nur Technik E | 463 |
| Aufstockung E → A | nur Technik A | 716 |
| Aufstockung N → A | Technik E + Technik A | 1179 |
| Direkteinstieg Klasse E | alles von N + Technik E | 1034 |
| Direkteinstieg Klasse A | alles von N + Technik E + Technik A | 1750 |

Vorschriften und Betrieb sind fuer alle Klassen dieselben - die Klassen unterscheiden sich
ausschliesslich im Pruefungsteil "Technische Kenntnisse". Deshalb schreibt beim Aufstieg nur
dieser eine Teil nach. Die Bundesnetzagentur schreibt "Prüfungsteil(en)": von N direkt auf A
sind es zwei, daher der vierte Fall, den sonst niemand anbietet.

**Woher die Fragen kommen.** Im Erweiterungsordner lagen vier von Meta AI aus dem PDF
gezogene Dateien. Die waren nicht verwendbar, und zwar aus drei Gruenden:

1. `Fragen-A.json` und `Fragen-E-Auf-A.json` sind bytegleich, ebenso `Fragen-E.json` und
   `Fragen-N-Auf-E.json` - vier Namen, zwei Dateien.
2. Die richtige Antwort stand in **100 %** der Faelle an erster Stelle. Im Trainer heisst das:
   immer die obere Antwort anklicken = bestanden. (fragen.json liegt bei 25 %.)
3. Kein einziger Bildverweis, obwohl zu 379 Fragen eine Zeichnung gehoert.

Im selben Ordner liegt aber `afu_test-main/Fragen/fragenkatalog3b.json` - der **offizielle
maschinenlesbare Katalog der Bundesnetzagentur**, 3. Auflage Maerz 2024, mit allen 1750 Fragen,
Bildverweisen und Kapitelstruktur. Daraus sind die neuen Dateien gebaut.

**Entscheidungen, die nicht selbsterklaerend sind:**

- **Die Klasse-1-Fragen werden nicht neu erzeugt, sondern woertlich aus fragen.json
  uebernommen.** Damit sieht eine Frage in jeder Auswahl exakt gleich aus - gleicher Text,
  gleiche Antwortreihenfolge, gleiche Bildnamen - und ein Fehler in der Umsetzung kann die
  Klasse N nicht beschaedigen. Nachgeprueft: byteweise identisch.
- **Eigene Datei je Pruefungsweg statt einer grossen mit Filter.** Ein Fehler in der A-Datei
  reisst die Klasse N dann nicht mit. Die Fragenzahl liest der Trainer aus `.length`, nirgends
  steht eine Zahl fest im Code.
- **Antwortreihenfolge aus der Fragennummer abgeleitet gemischt.** Im Katalog ist die Loesung
  immer Antwort A. Nicht zufaellig gemischt, sondern reproduzierbar: zwei Laeufe des Skripts
  ergeben dieselbe Datei, ein spaeterer Abgleich bleibt moeglich. Ergebnis 27/22/26/25 %.
- **LaTeX nach Unicode statt KaTeX nachruesten.** 219 Fragen enthalten Formeln ($5 \cdot
  10^{-1}$). KaTeX einzubauen hiesse, den Renderpfad jeder Frage anzufassen. fragen.json loest
  dasselbe seit je mit echten Zeichen ("420 ⋅ 10⁻⁶ A"), also hier genauso: Hochstellung,
  Tiefstellung, Brueche als a/b, Wurzeln als √(…), griechische Buchstaben. Wichtig, weil 10⁻⁶
  und 10⁶ zwei Antworten derselben Frage sind - ohne Hochstellung waere sie unloesbar.
- **Die Pruefungsuebersicht richtet sich nach dem Pool, nicht nach dem Klassennamen.** Bei den
  Aufstockungen stehen dort nur noch "Technik", weil im Pool nichts anderes liegt. Damit stimmt
  die Tabelle auch dann, wenn eine Datei anders zusammengestellt ist als erwartet.
- **Der Umschalt-Block steht ganz oben im `<body>`,** nicht unten bei den anderen Skripten.
  `loadQuestions()` fragt beim Start, welche Datei zu holen ist; waere die Funktion dann noch
  nicht da, laedt der Trainer stumm wieder Klasse N und die Auswahl waere nach jedem Neuladen
  vergessen.
- **Im Gruppenraum ist das Umschalten gesperrt.** Alle Teilnehmer lernen aus demselben Pool;
  ein Wechsel mittendrin haette den anderen andere Fragen untergeschoben.
- **Kein Bild mehr anfordern, wo keines ist.** Bisher wurde fuer JEDE Frage ein Bild geholt und
  bei Misserfolg versteckt - zwei vergebliche Anfragen je Frage. Bei 571 fiel das kaum auf, bei
  1750 schon, ueber den Einladungslink erst recht. Jetzt entscheidet svg-list.json vorher.
- **In der Freigabeliste des Servers stehen die Dateinamen klein.** `isPublicPath()` vergleicht
  in Kleinschrift, damit Windows-Pfade mit abweichender Schreibung nicht am Schutz vorbeikommen.
  Mit "/Fragen-E.json" in der Liste lieferte der Server 404 - der erste Anlauf hier.

**Bilder.** `Erweiterung_einrichten.bat` (einmal doppelklicken) holt die rund 600 fehlenden
Zeichnungen aus dem Erweiterungsordner nach `svgs/` und schreibt `svg-list.json` neu. Vorhandene
Dateien werden nie ueberschrieben - die 100 Bilder der Klasse N sind seit Monaten in Gebrauch.
Geschrieben wird ueber eine `.teil`-Datei, damit ein Abbruch keine halbe SVG hinterlaesst.

**Geprueft** gegen zwei unabhaengige Quellen: den Katalog selbst und die Referenzsaetze
`50Ohm_*.json` aus dem afu_test-Projekt, die dieselben Kombinationen abbilden. Alle fuenf
Dateien stimmen in Anzahl UND Fragennummern exakt ueberein. Dazu im Browser: alle sechs
Umschaltungen, Abzeichen, Fusszeile, Pruefungsuebersicht, Bilder bei Frage und Antwort,
Wiederfinden der Auswahl nach dem Neuladen, und Klasse N unveraendert (571 Fragen, 14 Lektionen,
Hoerbuch, Runde spielbar, gleiche localStorage-Schluessel).

## Sechs kaputte Formel-Fragen in fragen.json repariert (25.08.2026)

Beim Umsetzen der Formeln fielen sechs Fragen im Bestand auf:

- **NB302, NB303, NG104** - statt f und λ standen dort die mathematischen Kursivzeichen
  𝑓 (U+1D453) und 𝜆 (U+1D706). In vielen Schriften ein leerer Kasten. Schoenheitsfehler.
- **NB501, NB502, NB503** - hier war beim Auslesen aus dem PDF der Bruch zerfallen: aus
  "R = U/I" wurde "𝑅= 𝑈", der Nenner fehlte schlicht. Eine Antwort ("𝑅=𝑈 ⋅𝐼 𝐼") ergab gar
  keinen Sinn mehr, zwei waren nicht mehr unterscheidbar. Das ist kein Schoenheitsfehler:
  Wer NB502 uebte, konnte die richtige Antwort nicht erkennen.

Die sechs sind aus dem offiziellen Katalog neu aufgebaut. Vor dem Ersetzen wird geprueft, dass
die bisher als richtig markierte Antwort auch im Katalog die richtige ist - sonst bricht das
Skript ab, statt stillschweigend etwas anderes hinzuschreiben. Alle uebrigen 565 Fragen sind
Byte fuer Byte unveraendert, die Reihenfolge auch. Die alte Datei liegt als
`backup/fragen_vor_Formelreparatur_2026-08-25.json`.

## Verlauf begrenzt, Fussnote entschlackt, Fehler-melden-Knopf (25.08.2026)

- **Der Verlauf macht die Seite nicht mehr laenger.** Er wuchs mit jeder gelernten Runde und
  ragte bei 18 Eintraegen weit ueber die Uebersicht daneben hinaus. Reines CSS reicht dafuer
  nicht: In einer Flex-Zeile bestimmt der hoehere der beiden Kaesten die Zeilenhoehe, und
  "max-height: 100vh" ist die Bildschirmhoehe, nicht die der Nachbarspalte. Die Hoehe wird
  jetzt gemessen und gesetzt, ein ResizeObserver haelt sie nach (Pruefungstermin eintragen,
  Hoerbuch-Feld erscheint, Fenster wird schmaler). Gescrollt wird nur noch INNEN in der
  Tabelle - Kopfzeile, Benutzerwahl und Loeschknopf bleiben stehen. Nachgemessen mit 18 und
  mit 1 Eintrag: beide Spalten 521 px, gleiche Unterkante auf 2 px genau.
- **Die Danksagung an Michael (DL2YMR) ist aus der Fussnote raus.** Sie stand dreifach da -
  im Videolehrgang-Feld, in der Kurzanleitung und unten. Dort, wo die Lektionen sind, gehoert
  sie hin; unten blieb die Herkunft des Fragenkatalogs.
- **Neuer Knopf "Fehler melden"** neben Info. Oeffnet eine vorbereitete Mail an
  reh.dietmar@me.com. "Fehler melden" statt "Bug melden" oder "Entwickler kontaktieren":
  Es soll jeder anklicken, der etwas Merkwuerdiges sieht - auch wer mit dem Wort Bug nichts
  anfangen kann und wer sich nicht traut, "den Entwickler" zu behelligen.
  In der Mail stehen schon Stand (Kennung + Datum der Index.html), gewaehltes Pruefungsziel,
  **die gerade angezeigte Frage** und der Browser. Erfahrungsgemaess kostet "bei mir geht was
  nicht" sonst drei Rueckfragen, und die meisten Meldungen betreffen genau eine Frage.
  Verschickt wird nichts von allein - der Knopf oeffnet nur einen Entwurf. Kontrast 5,93:1 in
  allen fuenf Ansichten.

## Microsoft-Stimmen entfernt (25.08.2026)

Die Stimmen des Browsers (Microsoft/Edge) standen bisher als zweite Gruppe in der
Vorlese-Auswahl. Sie klangen beim S sauberer als Piper - lasen aber die Abkuerzungen des
Fragenkatalogs so vor, wie sie dastehen: "M-H-z" statt "Megahertz", "d-B" statt "Dezibel".

Der Grund liegt im Weg, den der Text nimmt. Piper laeuft auf dem Server, und dort geht der
Satz vorher durch `expandTTS` (tts-expand.js), das die Einheiten ausschreibt. Im Serverlog
sieht man es: "oberhalb 30 MHz?" -> "oberhalb 30 Megahertz?". Die Stimme des Browsers spricht
dagegen direkt im Browser - da kommt kein Server vorbei, der etwas ausschreiben koennte.
Beim Lernen ist eine leicht dumpfe Stimme, die alles richtig sagt, mehr wert als eine klare,
die Einheiten buchstabiert.

- **Aus der Auswahl raus.** Es bleiben die Piper-Stimmen aus dem Ordner `piper/`. Der Hinweis
  darunter sagt jetzt, dass Abkuerzungen vor dem Sprechen ausgeschrieben werden.
- **Alte Einstellungen werden zurueckgesetzt.** Wer frueher "Microsoft Katja" gewaehlt hatte,
  haette sie sonst weiter gehoert: Der Wert stand im localStorage und wurde beim Vorlesen
  benutzt, obwohl er in der Liste nicht mehr auftaucht. Er wird jetzt beim Oeffnen der
  Einstellungen UND beim Vorlesen erkannt und durch die Standard-Piper-Stimme ersetzt.
- **Der stille Rueckfall auf Microsoft ist weg.** Antwortete Piper nicht, sprang bisher
  kommentarlos die Browser-Stimme ein - die Sprachausgabe klang also je nach Tagesform mal
  richtig, mal falsch, ohne dass jemand wusste, warum. Statt heimlich schlechter zu werden,
  sagt der Trainer jetzt einmal je Sitzung, dass eine Stimme im Ordner `piper/` fehlt und
  piper.bat sie holt.
- **55 Zeilen toter Code entfernt** (browserStimmenListe, findeBrowserStimme,
  sprichMitBrowserStimme) samt dem Nachziehen der Browser-Stimmenliste, das nur noetig war,
  weil Edge und Chrome ihre Stimmen verzoegert melden.

**Was bleibt:** die Ansage am Ende einer Simulator-Pruefung ("Sie haben die Prüfung
Vorschriften bestanden. 20 von 25 richtig.") faellt weiterhin auf die Browser-Stimme zurueck,
wenn keine Piper-Stimme eingestellt ist. Dort stehen keine Abkuerzungen, und ohne den
Rueckfall bliebe der Moment stumm.

Nachgestellt mit "browser:Microsoft Katja" im Speicher: Auswahl zeigt nur noch die
Piper-Stimme, der Wert wird auf de_DE-thorsten-medium.onnx umgestellt, Vorlesen laeuft ueber
den Server, und im Log steht die ausgeschriebene Fassung.

## Paket heisst jetzt Amateurfunk-Trainer, mit Zaehler (25.08.2026)

- **Der Ordner `test` ist nicht mehr im ZIP.** Darin liegt die Testsuite fuer tts-expand.js -
  Entwicklermaterial, das mit `npm test` laeuft und mit dem Lernen nichts zu tun hat. Wer das
  Paket bekommt, will Fragen ueben und nicht raten, wofuer ein Ordner "test" gut ist. Im
  Projekt bleibt er; dort ist er die Absicherung gegen Rueckschritte in der Abkuerzungs-
  Ausschreibung, an der ueber 30 verkettete Ersetzungen haengen.

- **Der Download heisst nicht mehr `Klasse-N-Trainer.zip`,** sondern `Amateurfunk-Trainer.zip`
  - der Trainer kann seit heute auch E und A. Umbenannt sind Dateiname, Ordner im ZIP, Pfad
  der `herkunft.json` und die Ueberschrift der ANLEITUNG.txt.
  Der Name steht dafuer jetzt an EINER Stelle (`PAKET_NAME`). Vorher stand er dreimal im Code,
  und wer ihn an zwei von drei Stellen aendert, bekommt ein ZIP, dessen Abgleich beim
  Empfaenger ins Leere laeuft - der Pfad in der herkunft.json muss zum Ordnernamen passen.
- **Die ANLEITUNG.txt sagt jetzt die Wahrheit:** statt "Alle 571 Fragen der Klasse N" steht dort
  "Alle Fragen der Klassen N, E und A (571 / 1034 / 1750), umschaltbar ueber Ziel waehlen".
- **Das Weitergeben steht jetzt auch in der Hauptansicht,** unter dem Hoerbuch. Bisher steckte
  es nur im Gruppenraum - hinter zwei Klicks und nur sichtbar, wenn man ohnehin gerade
  zusammen lernt. Wer jemandem im Verein den Trainer mitgeben will, findet ihn dort nicht.
- **Zaehler, wie oft das Paket geholt wurde.** Steht neben dem Knopf, an beiden Stellen.

**Wie gezaehlt wird, und warum so:**

- **Auf dem Server, beim tatsaechlichen Ausliefern** - nicht beim Klick im Browser. Ein Klick
  ist kein Download: Der Browser kann abbrechen, das Speichern-Fenster laesst sich wegklicken.
- **Dieselbe Adresse zaehlt hoechstens einmal pro Stunde.** Ein neu gestarteter Download oder
  ein zweiter Klick, weil beim ersten Mal nichts zu passieren schien, ist kein zweiter
  Empfaenger. Ohne die Sperre zaehlt der Zaehler Klicks statt Menschen und waere wertlos.
  Nachgestellt: erster Abruf 1, zweiter vom selben Rechner bleibt 1, ein Gast von aussen 2.
- **Die Zahl liegt in `data/paket_zaehler.json`** und faellt damit unter dieselbe Regel wie der
  Lernstand: nicht im ZIP, nicht im Repository. Eine weitergegebene Kopie faengt bei 0 an und
  zaehlt ihre eigenen Weitergaben.
- **Bei 0 steht gar nichts da.** "0x heruntergeladen" sieht aus wie ein Defekt, nicht wie ein
  neuer Zaehler.
- Geschrieben wird ueber eine `.tmp`-Datei: ein Absturz mitten im Schreiben soll den Zaehler
  nicht auf 0 zuruecksetzen.

## Bilder: dritter Versuch als PNG (25.08.2026)

Beim Nachsehen in der Quelle des Bildersatzes (github.com/fritzsche/afu_test) stand im
README der Grund fuer elf PNG-Dateien, die neben den SVGs liegen: **Firefox stellt genau
diese elf SVGs nicht dar** (BE207, BE208, BE209, NE209, NF101 bis NF106, NG302). Deshalb
liefert der offizielle Satz sie zusaetzlich als PNG.

Der Trainer probierte bisher nur zwei Adressen: `<ID>_q.svg` und `<ID>.svg`. In Firefox
blieben diese elf Fragen damit ohne Zeichnung - und weil es nur Firefox betrifft, faellt es
beim Testen im eigenen Browser nie auf.

- **Dritter Versuch `<ID>_q.png`** ergaenzt. Reihenfolge jetzt: `_q.svg`, `.svg`, `_q.png`.
- Die Kette steckt nicht mehr in drei verschachtelten Bedingungen im `onerror`-Attribut,
  sondern in `naechsteBildquelle()`. Beim vierten Versuch haette dort niemand mehr
  durchgeblickt.
- Nachgestellt mit deaktivierter SVG: der Trainer faellt ueber zwei fehlgeschlagene Versuche
  auf das PNG und stellt es dar.

## Formelsammlung und Fragenkatalog gehoeren ins Paket (25.08.2026)

Die Formelsammlung, die es in der Pruefung auf den Tisch gibt, steckt bei der Bundesnetzagentur
in einem Dokument mit einem Namen, unter dem sie niemand sucht: **Hilfsmittel_12062024.pdf**,
abgelegt unter "Antraege und Formulare", herausgegeben von der Aussenstelle Dortmund. 22 Seiten,
Stand 12.06.2024. Drin ist mehr als nur Formeln: die tabellarische Bandplan-Uebersicht aus
Anlage 1 der Amateurfunkverordnung, die Formelsammlung selbst und das Kabeldaempfungsdiagramm.
Auf Seite 1 stehen ausserdem Berichtigungen zum Fragenkatalog der 3. Auflage (Gewinn der
Parabolantenne, Stehwellenverhaeltnis, Zink statt Zinn).

- **Erkannt wird nach Muster, nicht nach festem Dateinamen.** Der erste Anlauf war eine Liste
  fester Namen (`Formelsammlung.pdf`, `Hilfsmittel_12062024.pdf`) - und ging sofort daneben:
  Im Ordner lag die Datei als schlichtes `Hilfsmittel.pdf` und fiel damit **stumm** aus dem
  Paket. Beim naechsten Stand der Behoerde waere dasselbe wieder passiert. Jetzt greifen
  `^hilfsmittel*.pdf`, `^formelsammlung*.pdf` und `^pruefungsfragen*.pdf`. Die Muster sind
  bewusst eng - Wortstamm am Anfang, `.pdf` am Ende -, damit die Whitelist eine Whitelist
  bleibt. Nachgeprueft: `Server.js`, `package.json`, `data/userdata/amateurfunk_data.json`,
  `svgs/../Server.js` und `Hilfsmittel.pdf.bak` kommen weiterhin nicht durch (alle 404).
- **Fehlt eine der Dateien, passiert nichts.** `holen()` ueberspringt still, was nicht da ist.
  Wer die PDFs im Ordner hat, gibt sie mit weiter; wer nicht, bekommt ein kleineres Paket.
- **Auch im Browser aufrufbar** (`/Hilfsmittel.pdf`, `/Pruefungsfragen.pdf`), also auch ueber
  den Einladungslink. Es sind amtliche Dokumente unter der Datenlizenz Deutschland, sie
  enthalten nichts Persoenliches.
- **Die ANLEITUNG.txt nennt die PDFs mit dem Namen, den sie wirklich tragen.** Erst standen
  die Namen fest im Text - und die Anleitung log zweimal hintereinander: einmal, als die Datei
  "Hilfsmittel.pdf" hiess, und wieder, als sie in "Formelsammlung.pdf" umbenannt wurde. Jetzt
  steht dort ein Platzhalter, der beim Packen aus den gefundenen Dateien gefuellt wird. Liegt
  keine PDF im Ordner, faellt die Zeile ersatzlos weg statt eine Luecke zu hinterlassen.

**Das Paket waechst dadurch spuerbar:** Pruefungsfragen.pdf allein sind 5,2 MB. Ueber den
Cloudflare-Tunnel dauert das Herunterladen entsprechend laenger.

## Download raus aus dem Gruppenraum-Fenster (25.08.2026)

Der Knopf "Trainer herunterladen" samt zwei Absaetzen Erklaerung stand im Gruppenraum-Fenster.
Seit die Zeile "Weitergeben" in der Hauptansicht steht, war das derselbe Weg zweimal - und das
Fenster war schon vorher voll.

Die Frage dahinter war, ob ein Gast ueber den Einladungslink die Hauptansicht ueberhaupt zu
sehen bekommt. Nachgestellt mit einem Aufruf von aussen (Proxy-Header wie bei Cloudflare) und
`?duo=TEST99`: Der Link oeffnet die **Hauptansicht** und legt das Gruppenraum-Fenster nur davor
(duo.js oeffnet es 800 ms nach dem Laden). Schliesst der Gast es, steht die Zeile "Weitergeben"
mitsamt Zaehler vor ihm - geprueft, sie ist fuer ihn sichtbar. Das Hoerbuch-Feld daneben bleibt
korrekt verborgen, das ist nur am Trainer-PC selbst zu haben.

- Knopf, Erklaerung und das zweite Zaehlerfeld `paketInfoDuo` entfernt.
  `paketZaehlerAnzeigen()` kommt damit zurecht - es filtert die Felder, die es findet.
- Das Fenster wird dadurch rund 100 px kuerzer.

## Bedienung per Tastatur, Stufe 1 der Barrierefreiheit (25.08.2026)

Vorher gemessen statt geraten. Der Befund:

| | |
|---|---|
| `lang="de"`, eine `<h1>`, alle Bilder mit `alt` | war schon da |
| Kontraste ueber 4,5:1 | war schon da |
| Vorlesen mit ausgeschriebenen Abkuerzungen | war schon da - koennen andere Lernprogramme nicht |
| **Antworten per Tastatur** | **40 Tabulatorschritte, nie erreicht** |
| **Antwortkacheln** | `<div>` ohne `role`, ohne `tabindex` |
| **Ansage richtig/falsch** | kein einziges `aria-live` |
| Zifferntasten 1-4 | taten nichts |
| Bereichsmarken | keine |
| Knoepfe nur mit Symbol | 9 ohne Namen |

Der vierte Punkt war der entscheidende: Wer die Maus nicht bedienen kann oder den Zeiger nicht
findet, kam durch die Pruefung nicht durch. Das ist kein fehlender Komfort, sondern eine
geschlossene Tuer.

**Am Schalter** (Vorlese-Einstellungen, Zahnrad neben dem Lautsprecher), voreingestellt **aus**:

- Tasten **1 bis 4** beantworten, **Enter** blaettert weiter, **Ruecktaste** zurueck.
- Jede Rueckmeldung wird fuer Vorleseprogramme angesagt: "Richtig." bzw. "Falsch. Richtig
  waere: …" - die richtige Antwort gleich mit, sonst muesste man sich durch vier Kacheln
  tasten, um sie zu finden.
- Die Tasten greifen nur waehrend einer laufenden Runde, nicht in Eingabefeldern und nicht,
  solange ein Fenster offen steht. Sonst liesse sich die Suche nicht mehr tippen.

**Immer an**, weil optisch nichts davon zu sehen ist:

- `role="button"`, `tabindex` und `aria-label` an den Antwortkacheln ("Antwort 2: Farad").
  Einen Schalter dafuer anzubieten waere so sinnvoll wie ein Schalter fuer `lang="de"`.
- Die neun namenlosen Knoepfe bekommen ihren Namen aus dem vorhandenen `title` bzw.
  `data-tooltip` - zur Laufzeit, statt neun Stellen im HTML anzufassen. Neue Knoepfe sind damit
  automatisch versorgt. Fuehrende Symbole werden abgeschnitten, sonst liest das Programm das
  Papierkorb-Zeichen als Wort vor.
- `role="main"` auf der Hauptspalte, damit man sie anspringen kann, statt sich durch die
  Kopfleiste zu haken. Kein `<main>`-Element - das haette an den CSS-Regeln gezerrt.
- Ein Fokusrahmen ueber `:focus-visible` - er erscheint nur bei Tastaturbedienung, beim
  Mausklick bleibt alles wie bisher. Im Dunkelmodus gelb statt blau, sonst geht er unter.

**Noch offen:** 379 Fragen haben eine Zeichnung und bleiben ohne Bildbeschreibung
unzugaenglich; fuer Klasse N sind es 61. Die deutsche Blindenausbildung
(afu-blindenausbildung.a36.de) geht denselben Weg wie das Hoerbuch hier: Bildfragen weglassen.

## Bekannte offene Punkte

- F9/F10 (Lösungen ein-/ausblenden) kollidieren mit den Standard-Aufnahme-Hotkeys von Camtasia
  Studio; `Strg+Umschalt+L` funktioniert bereits als Alternative. Umstellung noch nicht
  vorgenommen.
- Der graue „Reset"-Knopf in der Filterleiste ist möglicherweise redundant zum „Reset"-Knopf oben
  neben „Cache" — Klärung mit dem Projektinhaber steht noch aus.

## 25.08.2026 - Hochladen zu GitHub: zwei Knoepfe statt einer Anleitung

**Warum.** Dietmar fragte, ob ich das Hochladen fuer ihn uebernehmen koenne,
und bot seine Zugangsdaten an. Das ist nicht noetig und nicht richtig: git
bringt seine eigene Anmeldung mit (unter Windows den Anmeldeinformations-
manager), und die Zugangsdaten gehoeren zwischen ihn, Windows und GitHub -
nicht in ein Skript und nicht in ein Gespraech. Was sich abnehmen laesst,
ist alles andere.

**Stimmen_packen.bat / stimmen_packen.js.** Baut aus dem Ordner `piper` eine
einzelne `Piper-Stimmen.zip`. Die Stimmen koennen nicht ins Repository:
`de_DE-thorsten-high.onnx` misst 113.895.201 Bytes = 108,6 MiB, GitHubs
harte Grenze liegt bei 100 MiB je Datei. Als Release-Anhang sind 2 GiB je
Datei erlaubt, und ein Anhang laesst sich nur einzeln hochladen - deshalb
ein ZIP statt eines Dutzends Dateien. Komprimiert wird auf Stufe 1: ein
.onnx besteht aus Kommazahlen und laesst sich kaum zusammendruecken, Stufe 9
haette minutenlang gerechnet fuer wenige Prozent. Geschrieben wird
dateiweise auf die Platte statt alles im Speicher zu sammeln - bei 450 MB
ist das der Unterschied zwischen "laeuft" und "laeuft dem Rechner voll".
Das Skript sagt ausdruecklich dazu, dass das ZIP die 100-MiB-Grenze NICHT
umgeht; die Vermutung liegt nahe und waere teuer.

**Hochladen.bat / hochladen.js.** Traegt die Adresse ein, benennt den Zweig
in `main`, fragt einmal nach und laedt hoch. Der eigentliche Wert liegt im
Sicherheitsnetz davor: das Skript laesst `github_pruefen.js` laufen und
bricht ab, wenn dort kein "SAUBER" steht. Ein Push laesst sich nicht
zurueckholen - wer den Stand gezogen hat, hat ihn. Deshalb wird hier nicht
gewarnt, sondern abgebrochen. Zusaetzlich prueft es jede nachverfolgte
Datei auf die 100-MiB-Grenze, damit der Fehlschlag nicht erst nach dem
Upload kommt.

**Zwei Fehler in `github_pruefen.js`, gefunden beim Testen des Netzes.**

Der erste war ein Widerspruch im eigenen Bericht. Bei einer Datei ueber der
Grenze stand erst `!! Ueber 100 MB - GitHub lehnt den Push ab.` und drei
Zeilen darunter `SAUBER. Nichts Uebergrosses.` Zwei Saetze, die einander
aufheben - und der freundlichere stand zuletzt, also der, den man glaubt.
Die Groessenpruefung fliesst jetzt ins Fazit ein.

Der zweite war das Etikett. Gerechnet wurde immer mit 1024, beschriftet war
es "MB". An genau dieser Zahl haengt aber die Entscheidung, ob GitHub eine
Datei annimmt: 113.895.201 Bytes sind 108,6 MiB, aber 113,9 MB. Wer die
zweite Zahl liest und die Grenze fuer 100 MB haelt, rechnet richtig und
liegt trotzdem falsch. Jetzt steht MiB da, wo mit 1024 gerechnet wird.

Ausserdem meldete die Pruefung eine Datei zweimal, wenn beide Listen auf
sie passten - die Zaehlung am Ende war dann zu hoch. Und `.git_alt_*` steht
jetzt in der heiklen Liste: waere die zur Seite gelegte alte Historie
versehentlich mitcommittet worden, enthielte das neue Repository genau die
Daten, wegen derer neu angefangen wurde.

**Was beim Testen auffiel und richtig ist, auch wenn es aergert.** Nimmt man
eine zu grosse Datei aus der Ablage und committet das, meldet die Pruefung
sie weiterhin. Das ist kein Fehler: der Blob steckt in der Historie, und
GitHub weist den Push genauso zurueck. Loeschen hilft hier nicht - nur eine
frische Historie.

## 26.08.2026 - Zwei Dinge, die Dietmar aufgefallen sind

**1. Im Fenster "Pruefungsziel waehlen" reagierte keine Zeile auf die Maus.**

Im Pruefungssimulator hebt sich die Zeile unter dem Zeiger hervor - dunkler
Rahmen, heller Hintergrund, ein Pixel angehoben. Im Ziel-Fenster passierte
nichts, und man traf beim Klicken auf gut Glueck.

Der Grund war nicht Nachlaessigkeit, sondern eine Sackgasse: die Zeilen
bekamen Rahmen und Hintergrund als `style=""` direkt am Element. Ein
Inline-Stil schlaegt jede Regel aus dem Stylesheet, ein `:hover` waere also
wirkungslos geblieben - egal wie man es schreibt. Deshalb sind genau diese
zwei Angaben in die Klasse `.klasse-opt` gewandert; Aussehen im
Ruhezustand unveraendert, Layout weiterhin inline. Die gewaehlte Zeile
(`.aktiv`) bleibt am dickeren Rahmen erkennbar, und die gesperrte Zeile
("Datei fehlt") reagiert bewusst nicht - sie soll nicht so tun, als liesse
sie sich anklicken.

Das Fenster bleibt im Dunkelmodus hell (eigene Regel weiter oben), deshalb
braucht der Hover keine zweite Fassung. Nachgemessen: im Dunkelmodus
dieselben Farbwerte.

**2. "Verlauf einblenden" war kuerzer als die Frage daneben.**

Die Hoehenangleichung gab es schon (`finalFixDynamicHeight`), sie stieg aber
in der zweiten Zeile aus:

    if(wrapper && wrapper.classList.contains('collapsed')) return;

Also genau dann, wenn der Verlauf zugeklappt ist - und das ist der Zustand,
in dem der Knopf als schmaler Balken allein dasteht und jede Abweichung
sofort auffaellt. Er behielt seine Mindesthoehe von 260 Pixeln oder, noch
haesslicher, die Hoehe einer laengst vergangenen Frage.

Gemessen ueber 14 Fragen bei zugeklapptem Verlauf: **bis zu 88 Pixel
Unterschied**. Nach der Aenderung 0 - bei jeder einzelnen.

Jetzt werden Spalte und Knopf immer angeglichen. Verlaufsfeld und Rahmen
nur, solange sie sichtbar sind; zugeklappt werden ihre gesetzten Hoehen
wieder entfernt, sonst schleppt das eingeklappte Feld beim naechsten
Aufklappen eine alte Hoehe mit sich herum.

Geprueft wurde mit echtem Browser: zugeklappt, aufgeklappt, nach dem
Wechsel des Pruefungsziels und nach dem Blaettern zu laengeren und
kuerzeren Fragen. Der aufgeklappte Zustand ist unveraendert - Balken,
Verlaufsfeld und Fragenkarte enden auf derselben Linie.

## 26.08.2026 - "Ein Gast bekommt kein Update" - Ursache und Werkzeug

Ein Mitlernender hat den Trainer im eigenen Ordner, ist ueber den
Gruppenraum auf Dietmars Rechner unterwegs - und bekommt keine
Aktualisierungen. Ich habe den vorhandenen Abgleich gelesen statt zu raten.

**Die Mechanik ist in Ordnung, die Adresse ist es nicht.** Beim Herunterladen
schreibt der Server die Adresse, unter der der Gast ihn gerade erreicht hat,
in `herkunft.json` des Pakets. Bei jedem Start fragt der Trainer des Gastes
dort nach. Wenn der Gastgeber ueber einen Tunnel freigibt, ist diese Adresse
aber eine `…trycloudflare.com`-Adresse - und die wird bei **jedem** Start des
Tunnels neu ausgewuerfelt. Die gemerkte Adresse ist also spaetestens nach
Dietmars naechstem Neustart tot.

Was dann passiert, ist bewusst so gebaut und macht die Sache trotzdem
unsichtbar: "Ist der Gastgeber nicht erreichbar, passiert schlicht nichts.
Der Start darf daran nicht haengen." Richtig - nur merkt der Gast nichts
davon und haelt seinen Stand fuer aktuell.

**Der zweite Weg ist in Chrome meist gesperrt.** Es gibt bereits ein Banner:
Wer als Gast die Seite des Gastgebers oeffnet, waehrend sein EIGENER Trainer
laeuft, bekommt "Ordner aktualisieren" angeboten. Dafuer muss die Seite von
`https://….trycloudflare.com` aus `http://127.0.0.1:3000` abfragen. Das ist
Private Network Access, und Chrome verlangt dafuer eine ausdrueckliche
Freigabe; im Code steht seit laengerem der Hinweis, dass es "inzwischen
meistens" gesperrt ist. Auf diesen Weg ist also kein Verlass.

Uebrig bleibt der Weg, der immer funktioniert, weil kein Browser
dazwischensteht: der Trainer des Gastes fragt selbst beim Gastgeber nach
(Info > Abgleich, aktuelle Adresse eintragen). Server zu Server, keine
Mixed-Content- und keine PNA-Frage.

**Neu: `Update-Pruefen.bat` / `update_pruefen.js`** fuer den Ordner des
Gastes. Liest nichts um und aendert nichts, sondern beantwortet in vier
Schritten, woran es liegt:

  1. Kann dieser Trainer ueberhaupt abgleichen, oder ist er aelter als die
     Funktion? (Erkannt daran, ob `Server.js` den Endpunkt kennt.)
  2. Welche Adresse ist hinterlegt - und ist es eine Tunnel-Adresse?
  3. Antwortet dort jemand? Der Fehler wird uebersetzt: `ENOTFOUND` heisst
     "Adresse gibt es nicht mehr", `ECONNREFUSED` heisst "gibt es, aber
     niemand nimmt ab", Zeitueberschreitung heisst "laeuft nicht oder etwas
     blockiert".
  4. Was unterscheidet sich konkret - fehlt ganz, ist aelter, oder ist eine
     Programmdatei (die absichtlich nicht automatisch ersetzt wird).

Jeder Fall endet mit dem naechsten Schritt, nicht mit einer Fehlermeldung.
Getestet wurden alle sechs Zustaende: ohne `Server.js`, ohne `herkunft.json`,
tote Tunnel-Adresse, erreichbare Adresse ohne Server, erreichbar mit
Unterschieden, erreichbar und alles gleich.

**Die eigentliche Loesung bleibt der GitHub-Updater.** Eine Adresse bei
`raw.githubusercontent.com` aendert sich nie. Solange die Quelle ein Tunnel
ist, ist jede gemerkte Adresse ein Verfallsdatum.

## 26.08.2026 - Entwicklerwerkzeuge gehoeren nicht ins Repository

Dietmar ist aufgefallen, dass `Hochladen.bat` mit bei GitHub liegt, und hat
gefragt, was dort sonst noch nichts zu suchen hat. Berechtigt.

Wer das Repository herunterlaedt, will Amateurfunk lernen. Er findet dort
aber elf Dateien, die nur auf Dietmars Rechner einen Sinn ergeben. Der Platz
ist es nicht - zusammen 114 KB neben 10 MB Trainer. Es geht um zwei andere
Dinge:

**Eine davon ist gefaehrlich.** Klickt jemand, der das Repository geklont
hat, auf `GitHub-Neustart.bat`, benennt das Skript seine `.git` in
`.git_alt_<Datum>` um und legt ein frisches Repository an. Seine Verbindung
zum Original ist damit weg. Zurueckzudrehen ist es (Ordner zurueckbenennen),
aber niemand rechnet damit, und im Fenster steht viel von "alter Historie",
was nach Schaden klingt.

**Der Rest ist Ballast mit falscher Fibel.** `Hochladen.bat` laedt zu
Dietmars Repository hoch - bei jedem anderen ein Anmeldefenster fuer ein
fremdes Konto. `Stimmen_packen.bat` baut ohne Vorwarnung ein 419-MiB-ZIP.
`Aufraeumen.bat` sucht nach Ordnern, die es nur bei Dietmar gibt.

**Neu: `GitHub-Ausmisten.bat` / `github_ausmisten.js`.** Nimmt die elf
Werkzeuge mit `git rm --cached` aus der Versionsverwaltung - die Dateien
bleiben im Ordner liegen und funktionieren weiter. Danach ergaenzt es die
`.gitignore`, denn ohne diesen zweiten Schritt holt der naechste
`git add -A` alles sofort zurueck und das Ausmisten waere ein Schlag ins
Wasser gewesen.

Das Skript nimmt sich selbst mit auf die Liste. Es soll bei GitHub gar nicht
erst auftauchen.

`Update-Pruefen.bat` und `update_pruefen.js` bleiben ausdruecklich drin: die
gehoeren dem Gast, nicht dem Entwickler.

Der Preis, der im Skript auch so dasteht: Diese Werkzeuge sind dann nicht
mehr in der Sicherung bei GitHub. Geht die Platte kaputt, sind sie weg - der
Trainer selbst nicht.

Getestet an einem echten Klon des Repositorys: 11 Dateien entfernt, alle
noch auf der Platte, `git add -A` holt keine zurueck, `Update-Pruefen.bat`
weiter verfolgt, danach 781 statt 792 Dateien und die Pruefung meldet
weiterhin SAUBER.

## 26.08.2026 - "Nachfragen nicht moeglich" - die Sackgasse beseitigt

Der Screenshot von Dietmars Mitlernendem hat die Sache endlich geklaert. Er
hatte alles richtig gemacht - nur am falschen Rechner. Er hatte den Trainer
des Gastgebers im Browser offen (die `…trycloudflare.com`-Adresse), dort
Info > Abgleich geklickt, die Adresse eingetragen und bekam:

    Nachfragen nicht moeglich.
    Diese Funktion ist nur direkt am Trainer-PC verfuegbar.

Die Meldung ist technisch korrekt: `/api/abgleich/pruefen` ist `localOnly`,
und das aus gutem Grund - der Abgleich schreibt Dateien in einen Ordner.
Duerfte ein Gast das ausloesen, koennte er in fremde Ordner schreiben.

Als Wegweiser taugte die Meldung trotzdem nichts. Sie sagt, was nicht geht,
aber nicht, wo es stattdessen geht. Und sie kommt erst NACH dem Ausfuellen -
man hat also erst gearbeitet und dann verloren. In genau dieser Schleife hat
er sich mehrfach verfangen, und ich habe ihm zweimal per Text erklaert, wo
er klicken soll, statt es das Programm sagen zu lassen. Das war mein Fehler,
nicht seiner.

**Jetzt kommt der Hinweis, bevor das Formular erscheint.** `laeuftLokal()`
gab es schon; die Abfrage steht nun ganz am Anfang von `abgleichStartbild()`.
Ist man nicht am eigenen Rechner, gibt es kein Eingabefeld, sondern:

  - die Feststellung, wessen Trainer man da sieht, und warum es hier nicht
    geht ("er kann es nicht, und er darf es auch nicht")
  - vier nummerierte Schritte bis zum richtigen Fenster, mit
    `http://localhost:3000` ausgeschrieben
  - die Adresse des Gastgebers - fertig zum Kopieren, mit Kopier-Knopf.
    Sie steht ohnehin in der Adresszeile, aber wer bis hierher gekommen ist,
    soll nicht auch noch abtippen muessen.
  - der Hinweis, dass eine Tunnel-Adresse nach jedem Neustart eine andere
    ist

Der Kopier-Knopf faellt weich: gibt es `navigator.clipboard` nicht oder ist
er gesperrt (das passiert ohne HTTPS), wird der Text wenigstens markiert und
der Knopf sagt "Markiert - Strg+C".

Geprueft mit echtem Browser von zwei Seiten: ueber `127.0.0.1` erscheint
weiter das gewohnte Formular, ueber eine andere Adresse der neue Hinweis.
Hell und dunkel, keine Fehler in der Konsole, Kopier-Knopf meldet "Kopiert".

## 26.08.2026 - Namen aus dem oeffentlichen Repository genommen

Dietmar wollte eine Zeile aus dem CHANGELOG haben, in der drei Vornamen
standen. Beim Nachsehen fand sich dieselbe Liste an drei weiteren Stellen -
und die schlimmste war nicht das CHANGELOG, sondern eine Zeile Javascript in
`Index.html`, die die Namen als Liste enthielt.

Solange das Projekt privat war, war das gleichgueltig. Seit heute frueh
liegt Index.html oeffentlich bei GitHub - und jeder Besucher des Trainers
liest sie ohnehin mit, denn Index.html geht komplett an den Browser. Dazu
kamen der Platzhalter im Raum-Dialog, der drei Vornamen als Beispiel nannte,
und zwei Kommentare.

**Jetzt steht die Liste in `video_embed.json`**, die per `.gitignore`
draussen bleibt. Und sie verlaesst den Server nicht: der Browser fragt mit
EINEM Namen an (`/api/video-embed?name=...`) und bekommt ja oder nein
zurueck. Wer die Antwort abfaengt, erfaehrt nichts ueber die anderen.

Die Antwort wird im Browser gemerkt, weil sie beim Zeichnen jeder Frage
gebraucht wird und dort nicht gewartet werden kann. Fehlt die Datei, ist
der Server aelter oder die Leitung tot, lautet die Antwort NEIN - der
sichere Fall, denn dann bekommt Michael (DL2YMR) seinen zaehlenden
Videoaufruf. Geprueft: ohne Namen "Auf YouTube ansehen", mit einem Namen
aus der Liste das eingebettete Fenster, mit einem fremden Namen wieder
YouTube.

Der Platzhalter heisst jetzt "z.B. dein Vorname oder Rufzeichen", die
Kommentare sprechen von "drei Leuten an einem Rechner".

**Nachtrag.** Dieser Eintrag hat die Namen zunaechst selbst weiter
transportiert - als Zitat der geloeschten Codezeile und des alten
Platzhalters. Ein CHANGELOG, das die Namen aufbewahrt, macht die
Aufraeumarbeit zunichte: Es liegt genauso oeffentlich bei GitHub wie
Index.html. Dietmar hat es gesehen, die Zitate sind raus. Wer eine solche
Aenderung macht, muss auch seine eigene Beschreibung davon durchsehen.


## 26.08.2026 - Update von GitHub, ohne die eigene Arbeit zu verlieren

Dietmars Wunsch, in seinen Worten: ein Hinweis auf der Hauptseite und ein
Knopf unter Info, den man bestaetigen muss. Und - der eigentlich schwierige
Teil - *"wenn du mir auf meinem Rechner ein neues Update gibst, dass das
nicht mit GitHub wieder ueberschrieben wird."*

**Warum das nicht selbstverstaendlich ist.** Der vorhandene Abgleich fragt
"ist der Inhalt verschieden?" und bietet alles an, was abweicht. Fuer
Dietmar waere das falsch herum: er bekommt neue Dateien direkt in den
Ordner, oft Stunden bevor sie bei GitHub liegen. Sein Trainer wuerde ihm
die frische Arbeit durch die aeltere Fassung von GitHub ersetzen. Ein
Fingerabdruck sagt naemlich, DASS zwei Dateien verschieden sind - nicht,
welche die neuere ist.

**Die Loesung ist ein dritter Wert.** `github_stand.json` haelt fest,
welchen Fingerabdruck jede Datei hatte, als sie zuletzt mit GitHub gleich
war. Daraus werden drei Lagen statt zwei:

    fern == hier                    -> gleich, nichts zu tun
    fern != hier, hier == gemerkt   -> DORT hat sich etwas getan  -> anbieten
    fern != hier, hier != gemerkt   -> HIER hat sich etwas getan  -> sperren

Der dritte Fall ist Dietmars Fall. Solche Dateien erscheinen im Fenster,
aber **ohne Kaestchen zum Ankreuzen** - nicht ausgegraut mit Erklaerung im
Kleingedruckten, sondern gar nicht erst da. Und selbst wenn eine Anfrage
sie doch enthaelt, prueft der Server vor dem Schreiben ein zweites Mal und
laesst sie liegen.

**Woher der Merkposten kommt.** Aus `Hochladen.bat`, direkt nach einem
erfolgreichen Push - dem einen Moment, in dem hier und dort nachweislich
dasselbe steht. Das passt zu Dietmars Ablauf ("ich starte bei jedem Update
auch die Hochladen.bat"). Die Zahlen liefert `git ls-files -s`: git kennt
zu jeder Datei den Blob-Hash, und das ist dieselbe Zahl, die auch die
GitHub-API nennt. Nichts nachrechnen, nichts nachfragen, keine Gelegenheit,
sich zu vertun. Nur der Hauptordner - die 746 Zeichnungen wuerden die Datei
nur aufblaehen.

**Wie geprueft wird, ohne 10 MB zu ziehen.** Zwei kleine Anfragen: der
Zeiger auf den letzten Commit, dann das Verzeichnis dieses Commits - ohne
`recursive`, denn alle Dateien, um die es geht, liegen im Hauptordner.
GitHub nennt dabei zu jeder Datei den Blob-Hash. Verglichen wird also mit
zwei JSON-Antworten; heruntergeladen wird erst, was wirklich geholt werden
soll.

**Weitere Grenzen, bewusst gesetzt:**

  - Geholt wird nur auf Klick. Der Start meldet hoechstens, DASS es etwas
    gibt - eine schmale Leiste oben, kein Fenster. Es ist eine Nachricht,
    kein Auftrag; wer gerade lernt, soll nicht aus der Frage gerissen
    werden. Ein "spaeter" merkt sich den Commit und schweigt bis zum
    naechsten.
  - Programmdateien (`Server.js`, `hoerbuch.js`, `lame.js`) sind nicht
    vorangekreuzt und brauchen eine zweite, ausdrueckliche Zusage. Sie
    laufen mit vollen Rechten auf dem Rechner.
  - Jede geholte Datei wird nachgerechnet, bevor sie geschrieben wird.
    Stimmt der Fingerabdruck nicht mit dem, was GitHub angekuendigt hat,
    wird sie verworfen. Ein abgebrochener Download kommt so nie im Ordner
    an.
  - Geholt wird von einem festen Commit, nicht von "main". Sonst koennte
    zwischen Pruefen und Holen ein neuer Commit dazwischenkommen und man
    bekaeme eine Mischung aus zwei Staenden.
  - Alle Endpunkte sind `localOnly`. Ein Gast aus dem Gruppenraum hat mit
    fremden Ordnern nichts zu schaffen.
  - Der Commit wird im Merkposten nur festgehalten, wenn wirklich alles
    Angefragte geklappt hat. Sonst stuende dort ein Stand, den der Ordner
    gar nicht hat, und die naechste Pruefung faende faelschlich nichts mehr.

**Getestet gegen ein nachgebautes GitHub** im Container - ein kleiner
Server, der dieselben zwei API-Antworten und die Rohdateien liefert. Damit
liessen sich Faelle durchspielen, die man mit dem echten GitHub nicht
herstellen kann:

  - Update vorhanden -> wird angeboten, geholt, alte Fassung in backup/
  - alles gleich -> "Es gibt nichts zu holen"
  - **lokal geaenderte Datei, ausdruecklich mit angefragt -> nicht
    angefasst.** Die frische Index.html stand danach unveraendert im
    Ordner, obwohl sie in der Anfrage stand.
  - Programmdatei ohne Bestaetigung -> abgelehnt
  - abgebrochener Download (halbe Datei) -> verworfen, alte Datei heil,
    keine `.github-tmp` im Ordner
  - GitHub antwortet mit 403 -> Start laeuft weiter, verstaendliche Meldung

Der letzte Fall war kein Test, sondern echt: die GitHub-API antwortet aus
meiner Sandbox heraus mit 403. **Gegen das echte api.github.com konnte ich
also nicht pruefen** - nur gegen den Nachbau. Auf einem gewoehnlichen
Anschluss sollte das gehen (60 Anfragen je Stunde reichen weit), aber
gesehen habe ich es nicht. Wenn im Fenster "GitHub bremst gerade" steht,
obwohl lange nichts abgefragt wurde, gehoert das hierher gemeldet.

Der Abgleich mit dem Gastgeber bleibt unveraendert daneben bestehen. Zwei
Wege, eine Whitelist: `ABGLEICH_ALLE` bestimmt fuer beide, was ueberhaupt
wandern darf.

## 26.08.2026 - Mein Fehler: die .gitignore ueberbuegelt

Dietmar startete Hochladen.bat und bekam achtzehn offene Aenderungen
vorgesetzt - darunter alle dreizehn Entwicklerwerkzeuge, die eine Stunde
vorher mit GitHub-Ausmisten.bat sauber aus dem Repository genommen worden
waren.

**Was passiert war.** `github_ausmisten.js` nimmt die Werkzeuge mit
`git rm --cached` aus der Verwaltung und traegt sie in die `.gitignore` ein -
der zweite Schritt ist der entscheidende, denn ohne ihn holt der naechste
`git add -A` alles zurueck. Genau das hat der Ordner auch getan.

Kurz darauf habe ich ihm eine neue `.gitignore` in den Ordner geschrieben -
aus meiner eigenen Fassung, die den Block nicht kannte. Damit war der zweite
Schritt geloescht, und die dreizehn standen wieder zum Hochladen bereit. Der
`git rm --cached` hatte gehalten (sie waren nicht mehr nachverfolgt), aber
als neue, unbekannte Dateien wollten sie trotzdem mit.

Das ist kein Bedienfehler von Dietmar, sondern ein Bauteil, das ich selbst
mitgebracht habe: Ich schreibe Dateien in seinen Ordner, ohne zu wissen, was
dort inzwischen hineingeschrieben wurde.

**Zwei Reparaturen, nicht eine.**

Die naheliegende: Der Block steht jetzt auch in meiner Fassung der
`.gitignore`, mit derselben Marke, an der `github_ausmisten.js` ihn
wiedererkennt - es haengt ihn also nicht ein zweites Mal an.

Die wichtigere: `Hochladen.bat` prueft jetzt VOR allem anderen, ob eines der
dreizehn Werkzeuge mitfahren wuerde, und bricht ab, wenn ja. Diese Abfrage
glaubt der `.gitignore` nicht, sondern sieht nach, was git tatsaechlich
mitnehmen wuerde (`ls-files` plus `status --porcelain`). Sie faengt den
Fehler also auch dann, wenn ich das naechste Mal wieder etwas ueberschreibe.

Nicht auf der Liste, mit Absicht: `github_update.js` gehoert zum Trainer und
wird von `Server.js` gebraucht. `Update-Pruefen.bat` und `update_pruefen.js`
gehoeren dem Gast.

Geprueft: mit unvollstaendiger `.gitignore` bricht das Hochladen ab und nennt
die Dateien; mit der richtigen laeuft es durch. In einem nachgebauten Ordner
mit allen zwanzig Dateien landen genau sechs im Commit - Index.html,
Server.js, github_update.js, die beiden Gast-Werkzeuge und die .gitignore
selbst.

## 26.08.2026 - Eine angefangene Runde ueberlebt das Mittagessen

Ein Testnutzer, woertlich: *"Ich bin bei Frage 21, gehe zu Mittag, starte
danach neu - und fange wieder bei 1 an. Aergerlich."*

Er hat recht, und das Merkwuerdige daran: Gespeichert wurde bisher alles,
was DAUERHAFT gilt - Lernfortschritt, Fehlerliste, Merkliste, Verlauf. Nur
die laufende Runde selbst lag im Arbeitsspeicher und war mit dem Schliessen
weg: welche Fragen in welcher Reihenfolge, wo man steht, was angekreuzt ist.

**Was gespeichert wird - und warum so wenig.** Nicht die Fragen. Die stehen
ohnehin im Katalog; sie ein zweites Mal abzulegen waere bei 571 Fragen ein
halbes Megabyte, das bei jedem Klick neu geschrieben wird. Je Frage nur:

    id  - welche Frage
    o   - in welcher Reihenfolge ihre Antworten standen (Platznummern im
          Katalog)
    a   - was angekreuzt war

Die Reihenfolge mitzuschreiben ist kein Luxus. Ohne sie saehe die Frage nach
dem Fortsetzen anders aus als vorher - und wer sich "die dritte war richtig"
gemerkt hat, laege ploetzlich falsch. Gemessen: **1076 Byte** fuer eine
Runde mit 25 Fragen.

Getrennt nach Benutzer-Slot UND Pruefungsziel. Wer auf Klasse E umstellt,
soll nicht in eine Runde aus Klasse N zurueckfallen - die Fragen gibt es im
neuen Katalog womoeglich gar nicht.

**Zwei Korrekturen von Dietmar, beide berechtigt.**

Der erste Entwurf setzte einen Kasten auf die Hauptansicht. Sein Urteil:
*"Das ueberlaedt die Hauptansicht."* Stimmt - die traegt schon
Pruefungsuebersicht, Lernfortschritt, Termin, Lektionen, Hoerbuch und
Weitergeben. Ein siebter Kasten faellt dort nicht auf, er erschlaegt. Also
ein Fenster - das ist auch das passendere Mittel: die Frage stellt sich
genau einmal und hat genau zwei Antworten.

Der zweite Entwurf zeigte das Fenster beim Laden der Seite. Auch das war
falsch: *"Es kommt gleich bei einem Neustart. Ich wuensche mir das Fenster,
wenn ich auf Start (Lernmodus) klicke."* Beim Laden hat man womoeglich ganz
anderes vor - Statistik ansehen, ein Hoerbuch bauen, in den Gruppenraum. Ein
Fenster, das ungefragt vor allem anderen steht, ist dann im Weg. Erst der
Klick auf "Start" sagt: ich will jetzt lernen. Genau dort gehoert die Frage
hin.

Daraus wurde eine kleine Umbauarbeit: `startQuiz` fragt erst und macht dann
weiter. `rundeAngebotZeigen` liefert zurueck, ob es gefragt hat; wenn ja,
haelt `startQuiz` an, und es geht in einem der beiden Knoepfe weiter. "Neu
beginnen" verwirft nicht nur den Merkposten, sondern startet auch die
frische Runde, die mit dem Klick gemeint war. Ein Klick daneben startet
nichts - und der naechste Klick auf "Start" fragt wieder.

Dann: *"Das darf nur bei Start so sein. Nicht im Pruefungssimulator und auch
nicht im Gruppenraum."* Zwei verschiedene Gruende, beide richtig:

  - Der **Pruefungssimulator** laeuft gegen die Uhr. Eine Runde, die nach
    dem Mittagessen mit stehengebliebenem Timer weiterlaeuft, waere keine
    Pruefungssimulation mehr, sondern eine Uebung mit Pausenknopf.
  - Im **Gruppenraum** bestimmt der Gastgeber, welche Frage dran ist. Einen
    Teilnehmer beim naechsten Start an "seiner" Frage 21 wieder einzusetzen
    waere sinnlos - die Runde von damals gibt es nicht mehr, und die anderen
    sind laengst woanders.

**Nebenbefund in `klasseWaehlen`.** Im Fenster "Pruefungsziel waehlen" steht
seit jeher "Eine laufende Runde wird beendet." Beendet wurde sie nie:
`isQuizActive` blieb stehen, waehrend darunter ein anderer Fragenkatalog
geladen wurde. Aufgefallen ist es erst durch diese Arbeit. Jetzt wird die
Runde tatsaechlich beendet - und vorher unter dem Schluessel der ALTEN
Klasse gesichert, damit sie beim Zurueckwechseln wieder da ist.

**Nachgezogen: der Abbruch-Dialog log.** Dort stand "Aktuelle unbeantwortete
Fragen gehen verloren". Das war richtig, solange die Runde nur im
Arbeitsspeicher lag. Jetzt steht dort, was zutrifft.

**Geprueft mit echtem Browser, der ganze Ablauf einmal durchgespielt:**
Runde beginnen, blaettern, Seite schliessen, neu oeffnen - beim Laden
passiert nichts, erst der Klick auf "Start" fragt. "Weiter" fuehrt zurueck
auf dieselbe Frage, mit derselben Antwortreihenfolge und denselben Zaehlern.
Dazu: "Neu beginnen" raeumt den Merkposten weg UND startet die frische
Runde bei Frage 1; ein Klick daneben startet nichts und der naechste Klick
auf "Start" fragt wieder; ein erster Start ohne Merkposten laeuft ohne
Fenster durch; eine durchgespielte Runde wird nicht als fortsetzbar
angeboten; im Simulator und im Gruppenraum wird weder gemerkt noch gefragt;
kein Kasten mehr auf der Hauptansicht; hell und dunkel lesbar; keine Fehler
in der Browserkonsole.

## 26.08.2026 - Ein Knopf, den der eigene Server nicht bedienen kann

Dietmar: *"Bei mir geht es, bei einem Benutzer nicht."* Beim Mitlernenden
stand nach Info > GitHub-Update:

    Unexpected token 'N', "Not found" is not valid JSON

**Die Ursache ist eine Folge meiner eigenen Sicherheitsregel.** Der Abgleich
mit dem Gastgeber holt Anzeigedateien - darunter `Index.html` - automatisch.
Programmdateien wie `Server.js` NIE: die laufen mit vollen Rechten, und ein
misslungener Download macht den Trainer beim naechsten Start unbrauchbar.
Diese Regel ist richtig und bleibt.

Sie hat aber eine Folge, die ich nicht bedacht hatte: Der Mitlernende bekam
die neue Oberflaeche mit dem Knopf - und dazu den alten Server, der den
zugehoerigen Aufruf nicht kennt. `/api/github/pruefen` lief ins Leere, der
Server antwortete mit dem schlichten Wort `Not found`, und der Browser
versuchte, das als JSON zu lesen. Heraus kam eine Meldung, die niemandem
sagt, was los ist.

Das passiert bei **jeder** kuenftigen serverseitigen Funktion wieder, sobald
Oberflaeche und Programm auseinanderlaufen. Also nicht diesen einen Fall
flicken, sondern das Muster:

**Die Meldung sagt jetzt, was Sache ist.** Die Seite liest die Antwort erst
als Text und versucht dann erst, JSON daraus zu machen. Bei `Not found`
steht dort: dass das Programm aelter ist als die Anzeige, warum das so
gewollt ist, und wie man an die neue Fassung kommt (Info > Beim Gastgeber
nach Neuerungen sehen, Programmdateien ausdruecklich bestaetigen, danach
START.bat).

**Geprueft mit zwei Servern nebeneinander**: der aktuelle auf Port 3000, ein
Stand von vor der GitHub-Funktion auf Port 3001 - beide mit derselben neuen
`Index.html`, also genau die Lage des Mitlernenden. Beim alten Server zeigt
der Aufruf die erklaerende Meldung, beim neuen ist alles wie vorher. Keine
Fehler in der Browserkonsole.

---

**Nachtrag am selben Abend: ein zweiter Anlauf, der zurueckgenommen wurde.**

Der erste Versuch ging weiter: Wenn der eigene Server die Funktion nicht
kennt, sollte der Knopf gar nicht erst erscheinen. Beim Start fragte die
Seite dafuer einmal `/api/github/stand` und blendete den Knopf aus, wenn die
Antwort nicht 200 war.

Das klang sauber und hat bei Dietmar prompt den Knopf verschwinden lassen -
obwohl bei ihm alles funktioniert. Was genau die Vorab-Anfrage bei ihm hat
scheitern lassen, habe ich nicht herausgefunden; auf meinem Prueflauf kam
sauber 200 zurueck.

Und das ist der Punkt. Der Fehler war nicht die eine Zeile, sondern die
Bauart: Ich habe die Sichtbarkeit einer Funktion von einer Vorab-Anfrage
abhaengig gemacht, die aus Gruenden fehlschlagen kann, die ich nicht alle
kenne - Zeitpunkt, Zwischenspeicher, ob man gerade ueber den Einladungslink
schaut. Schlaegt sie fehl, verschwindet die Funktion spurlos, und niemand
kann sehen, warum. Ein Knopf, der etwas Verstaendliches sagt, ist besser als
einer, der nicht da ist.

Die Vorab-Anfrage ist wieder raus. Der Knopf steht immer; wer ihn ohne
passenden Server drueckt, bekommt die erklaerende Meldung von oben. Dazu
bekommen die beiden Knoepfe im Info-Fenster einen Abstand - vorher klebten
sie aneinander.

## 26.08.2026 - Aus "Gastgeber" wird "Entwickler" (aber nicht ueberall)

Dietmar: *"Beim Gastgeber moechte ich durch Entwickler ersetzen."*

Dahinter steckt mehr als eine Wortwahl: **"Gastgeber" hiess im Trainer
zweierlei**, und das war verwirrend.

Im **Gruppenraum** ist der Gastgeber, wer den Raum aufmacht - er bestimmt die
Fragen und sieht in der Trainer-Ansicht, wie es bei den anderen laeuft. Dort
ist das Wort genau richtig.

Im **Abgleich** war damit gemeint, von wem die eigene Kopie stammt - also
Dietmar. Fuer die Lernenden ist das aber kein Gastgeber, sondern schlicht
der Entwickler des Trainers. "Beim Entwickler nach Neuerungen sehen" sagt in
vier Worten, was Sache ist; "beim Gastgeber" liess offen, wer gemeint ist,
und legte die Verwechslung mit dem Gruppenraum sogar nahe.

Geaendert wurden **25 Zeilen** - Knoepfe, Fenstertitel, Hinweistexte und
Kommentare rund um Abgleich und Update. **Eine Zeile blieb bewusst stehen:**
"Der Gastgeber sieht in der Trainer-Ansicht, wie es bei den anderen laeuft"
im Info-Abschnitt zum Gruppenraum. Dort ist es der Gastgeber und niemand
sonst.

Grammatisch war es ein glatter Tausch: beide Woerter sind maennlich und
beugen sich gleich ("des Gastgebers" -> "des Entwicklers", "vom Gastgeber"
-> "vom Entwickler").

**Nebenbei erledigt:** Die beiden Knoepfe im Info-Fenster klebten
aneinander. Sie haben jetzt Abstand - auch auf einem schmalen Fenster, wo
sie umbrechen koennten.

## 26.08.2026 - Die Meldung nannte nur den umstaendlichen Weg

Dietmar schickte zwei Bilder: bei ihm "Alles auf demselben Stand", beim
Mitlernenden die Meldung "Dein Trainer-Programm ist aelter als diese
Funktion". Das ist kein Fehler mehr, sondern genau die Diagnose, die dort
stehen soll - aber der Weg heraus taugte nichts.

Die Meldung sagte: Info > Beim Entwickler nach Neuerungen sehen, dort die
Programmdateien anhaken. Das setzt voraus, dass Dietmars Trainer gerade
laeuft, dass sein Tunnel offen ist und dass der Mitlernende dessen
**aktuelle** Adresse hat - die sich bei jedem Tunnelstart aendert. An genau
dieser Kette ist derselbe Nutzer heute frueh schon einmal gescheitert. Ihn
noch einmal dorthin zu schicken waere zynisch gewesen.

Es gibt einen viel kuerzeren Weg, der von niemandem abhaengt: die zwei
Dateien direkt bei GitHub holen. Die Adresse dort aendert sich nie. Die
Meldung nennt jetzt zuerst diesen Weg, mit zwei anklickbaren Links
(`Server.js`, `github_update.js`), der Anweisung "Rechtsklick > Speichern
unter" und dem Hinweis, dass der Lernstand in `data/` unangetastet bleibt.

Der Abgleich beim Entwickler steht darunter als zweiter Weg - er ist der
richtige, wenn Dietmar etwas geaendert hat, das noch gar nicht bei GitHub
liegt. Dass dafuer sein Trainer laufen muss und die Tunnel-Adresse wandert,
steht jetzt dabei.

Die Rohadresse des Repositorys steht als `GITHUB_ROH` an einer Stelle -
sonst waere sie beim naechsten Umbenennen an mehreren Orten nachzuziehen.

Geprueft am nachgebauten alten Server: beide Links zeigen auf
raw.githubusercontent.com, das Fenster bleibt auch auf einem schmalen
Bildschirm lesbar.

## 26.08.2026 - Der Nachmittag, der in START.bat begraben lag

Dietmar: *"Update lief durch, und wenn ich jetzt neu starte und auf Info und
GitHub gehe, kommt das"* - und im Bild stand bei IHM die Meldung, die nur
bei einem veralteten Programm erscheinen soll.

**Erst die Fakten, dann die Vermutung.** Ich habe seine beiden Dateien vom
Rechner geholt und verglichen: `Server.js` und `github_update.js` sind Byte
fuer Byte dieselben wie meine, und das Modul laedt in Node ohne Murren. Die
Routen `/api/github/*` MUESSEN also da sein, sobald diese Datei laeuft.

Der Browser bekam trotzdem 404. Daraus folgt zwingend: **es laeuft nicht
diese Datei.** Und der Grund stand nicht in der Server.js, sondern in
`START.bat`:

    start "" cmd /c "for /l %%i in (1,1,20) do (curl -s -o nul
      http://localhost:3000 && start http://localhost:3000 && exit /b) ..."
    node Server.js

Lief noch ein `node.exe` auf Port 3000, brach das neue mit `EADDRINUSE` ab.
Die Zeile darueber wartete aber nur darauf, **dass** Port 3000 antwortet -
nicht darauf, **wer** antwortet. Der alte Server antwortete bereitwillig,
der Browser ging auf, und man sah einen laufenden Trainer. Das neue Fenster
stand derweil daneben mit einer Fehlermeldung, die niemand liest, weil im
Browser ja alles da ist.

Die Ironie: Diese Browser-Zeile war selbst einmal ein Fix ("damit kein
'Seite nicht erreichbar'-Tab entsteht, falls der Port belegt ist"). Sie hat
den Fehlerfall behandelt, indem sie ihn unsichtbar machte.

**Jetzt: erst nachsehen, dann fragen, dann starten.** Beide Startdateien
(`START.bat` und `START_MIT_TUNNEL.bat`) suchen vorher per `netstat`, ob
auf Port 3000 schon jemand lauscht, und holen sich zu der PID per `tasklist`
den Programmnamen:

  - Ist es **node.exe**, wird gefragt, ob der alte beendet werden soll -
    und erst nach `taskkill` plus zwei Sekunden Wartezeit (Windows gibt den
    Port nicht im selben Augenblick frei) neu gestartet.
  - Ist es **etwas anderes**, wird nichts angefasst und nichts gestartet.
    Ein fremdes Programm abzuschiessen, weil es zufaellig auf 3000 sitzt,
    waere schlimmer als das Problem.
  - Am Ende steht ein `pause` mit dem Hinweis, eine Fehlermeldung
    abzufotografieren - damit ein gescheiterter Start nicht mehr
    kommentarlos verschwindet.

Bei `START_MIT_TUNNEL.bat` ist es sogar heikler als beim einfachen Start:
Dort haette der Tunnel den ALTEN Stand ins Internet gestellt.

**Handwerkliches am Rande:** Geschrieben mit Sprungmarken statt
verschachtelter Klammern. In einem `if (...)`-Block ersetzt die
Windows-Eingabeaufforderung `%VAR%` schon beim Einlesen des ganzen Blocks -
was man dort setzt, kann man dort nicht wieder lesen. Der erste Entwurf hatte
genau diesen Fehler; mit `goto` gibt es das Problem nicht. Zeilenenden auf
CRLF, weil Sprungmarken damit zuverlaessiger sind.

Geprueft habe ich, was sich ohne Windows pruefen laesst: die
`netstat`-Zeilen gegen echte Beispielausgabe (Port 3000 wird getroffen,
Port 30000 nicht, IPv4 und IPv6 liefern dieselbe PID), die Vollstaendigkeit
aller Sprungmarken und die Klammerbilanz. Den Rest sagt der erste Lauf: Wenn
dort *"Auf Port 3000 laeuft schon etwas - node.exe - PID ..."* steht, ist die
Vermutung bestaetigt.

## 26.08.2026 - Ein Hinweis, der wie ein Auftrag klang

Dietmar fragte: *"Kann ich Piper in den Hauptordner bei GitHub ziehen?"*

Die Frage kam nicht von ungefaehr. `Hochladen.bat` sagte nach jedem
erfolgreichen Push:

    Piper-Stimmen.zip liegt bereit (418,9 MiB).
    Auf der Seite "Releases" -> "Create a new release",
    Tag vergeben und die Datei ins Feld ziehen.

Das liest sich wie eine Anweisung - obwohl das Release `v1.0` mit genau
dieser Datei laengst steht. Wer eine Anweisung bekommt, die er nicht
ausfuehren kann oder will, sucht nach einem anderen Weg. In diesem Fall:
"dann ziehe ich sie eben in den Hauptordner".

Das ginge dreifach nicht: `de_DE-thorsten-high.onnx` misst 108,6 MiB gegen
GitHubs harte Grenze von 100 MiB je Datei; das Formular auf der Webseite
nimmt ohnehin nur 25 MB; und jeder Klon zoege 470 MB mit sich herum.

Der Hinweis sagt das jetzt selbst - und macht klar, dass nichts zu tun ist,
wenn schon ein Release steht:

    Piper-Stimmen.zip liegt bereit (418,9 MiB) - falls du sie
    neu gebaut hast: bei "Releases" ein neues Release anlegen und
    die Datei anhaengen. Steht dort schon eines, ist nichts zu tun.
    Ins Repository selbst gehoert sie nicht - dort gilt 100 MiB je
    Datei, und thorsten-high allein misst 108,6 MiB.

Dasselbe Muster wie heute frueh bei "Stimmen_packen.bat ausfuehren": Ein
Hinweis, der bei jedem Lauf dasselbe fordert, wird entweder befolgt (und
richtet Unfug an) oder ueberlesen (und taugt dann auch nichts). Er muss
sagen, WANN er gilt.

## 26.08.2026 - "Das Fenster geht auf und sofort wieder zu"

Der Mitlernende hat getan, was das Fenster ihm sagte: die beiden Links
angeklickt, gespeichert - und danach startete sein Trainer gar nicht mehr.

**Erst nachstellen, dann raten.** Ich habe die Lage exakt nachgebaut: einen
Serverstand von vor der GitHub-Funktion genommen und genau die zwei Dateien
hineinkopiert, die er geladen hat. Das laeuft sauber durch, Katalog geladen,
HTTP 200. Am Code liegt es also nicht.

Dann die andere Richtung - was passiert, wenn statt der Datei die WEBSEITE
gespeichert wurde:

    SyntaxError: Unexpected token '<'

Node bricht sofort ab, das Fenster ist schneller zu, als man lesen kann.
Das passt genau auf seine Beschreibung. Und es ist kein Bedienfehler: Wer
einen Link zu einer Textdatei anklickt, sieht Text im Browser; ein Strg+S
darauf speichert je nach Browser die Seite drumherum statt der Datei.

**Zwei neue Dateien - eine sieht nach, die andere macht es richtig.**

`Fehler-Zeigen.bat` ist fuer genau diesen Fall gebaut: Sie zeigt die
Node-Version, die Groessen der beteiligten Dateien (Server.js sollte rund
139.000 Bytes haben, github_update.js rund 15.500), die **ersten drei Zeilen
der Server.js** - dort sieht man sofort, ob dort `<!DOCTYPE html>` steht -
und startet dann den Server. Und sie bleibt stehen, egal was passiert. Sie
aendert nichts.

`Programm-Aktualisieren.bat` beseitigt die Fehlerquelle ganz: Sie holt die
beiden Dateien mit `curl` (gehoert seit Windows 10 zum System) direkt von
raw.githubusercontent.com. Kein Speichern-Dialog, keine Gelegenheit, das
Falsche zu erwischen. Geprueft wird VOR dem Ersetzen:

  - faengt die geladene Datei mit `<` an, ist es eine Webseite - abbrechen
  - ist sie verdaechtig klein, war die Uebertragung unvollstaendig -
    abbrechen
  - erst danach: alte Fassung nach `backup\` sichern und ersetzen

In jedem Fehlerfall steht ausdruecklich da: "Es wurde NICHTS ersetzt." Ein
Update-Werkzeug, das im Zweifel die Finger davon laesst, ist mehr wert als
eines, das es versucht.

Fehlt `curl` (Windows aelter als 10), nennt sie den Browser-Weg samt der
Falle: als Dateityp "Alle Dateien" waehlen und den Namen ohne `.txt`
eintragen.

Geprueft: Sprungmarken vollstaendig, Klammerbilanz stimmt, die
`findstr /b /c:"<"`-Erkennung trennt HTML von Javascript, CRLF-Zeilenenden.
Der Rest zeigt sich beim ersten Lauf - und das ist ja gerade der Zweck der
beiden Dateien.

## 26.08.2026 - Der Link ging nicht - und der Trainer wusste warum

Dietmar: *"Jetzt geht der Link nicht mehr :("* - dazu das Protokoll. Darin
stand die Antwort bereits, vom Trainer selbst geschrieben:

    ueber deinen DNS-Server : schlaegt fehl (ENOTFOUND)
    ueber 1.1.1.1 / 8.8.8.8 : 104.16.230.132
    >> Der Name EXISTIERT oeffentlich, nur DIESER PC kennt ihn nicht.

Der Selbsttest hat also genau das getan, wofuer er gebaut wurde: nicht "geht
nicht" gemeldet, sondern getrennt, WO es klemmt. Der Tunnel lief, Cloudflare
hatte den Namen veroeffentlicht, ein oeffentlicher DNS-Server loeste ihn
auf - nur Dietmars eigener Rechner blieb bei seiner alten Auskunft.

Ursache ist der **negative DNS-Cache** von Windows. Der Trainer startet den
Tunnel und fragt gleich darauf nach dem Namen; in dem Augenblick kennt ihn
noch niemand. Windows merkt sich diesen Fehlversuch und antwortet danach
minutenlang weiter mit "gibt es nicht" - auch wenn die Welt draussen es
laengst besser weiss. Fuer die anderen Teilnehmer war der Link in dieser
Zeit hoechstwahrscheinlich schon erreichbar.

**Neu: `DNS-Auffrischen.bat`.** Der Trainer nannte die Abhilfe
(`ipconfig /flushdns`) schon im Protokoll - aber zwischen "im schwarzen
Fenster steht ein Befehl" und "ich tippe ihn richtig ein" liegt eine Huerde,
die man niemandem zumuten muss. Die Datei nimmt die Adresse aus
`tunnel_url.txt`, wirft die alten Auskuenfte weg und fragt danach zweimal
nach: einmal ueber den eigenen DNS-Server, einmal ueber 1.1.1.1. Aus dem
Vergleich der beiden Antworten laesst sich ablesen, woran man ist:

  - **beide antworten** -> geloest, Link neu laden
  - **nur 1.1.1.1 antwortet** -> Windows braucht noch einen Moment,
    gleich nochmal
  - **keiner antwortet** -> es blockiert etwas dazwischen, DNS-Filter im
    Router oder Webschutz des Virenscanners

`ipconfig /flushdns` verlangt erhoehte Rechte. Statt daran wortlos zu
scheitern, sagt die Datei, was zu tun ist: rechte Maustaste, "Als
Administrator ausfuehren".

Und in jedem Fall steht am Ende der Satz, auf den es ankommt: **fuer die
anderen ist der Link sehr wahrscheinlich schon erreichbar** - am besten mit
dem Handy ueber Mobilfunk gegenpruefen, WLAN aus. Sonst sucht man einen
Fehler, den nur der eigene Rechner hat.

## 26.08.2026 - Zweiter Anlauf bei der Port-Pruefung (und ein Eingestaendnis)

Der Mitlernende meldete: Nach dem Einspielen der zwei Dateien startete sein
Trainer nicht mehr; er kopierte die `START.bat` aus dem ZIP von gestern
zurueck, und danach lief es wieder.

**Ich weiss nicht sicher, warum.** Die neue `START.bat` liegt inzwischen im
Repository, er koennte sie also von dort haben; nachweisen kann ich es
nicht, und beim Nachstellen (alter Serverstand plus die zwei neuen Dateien)
startete bei mir alles sauber. Was ich nicht rekonstruieren kann, behaupte
ich auch nicht.

**Beim Nachsehen fand ich aber zwei echte Fehler in meiner eigenen Datei -
beide durch Lesen, nicht durch Testen.**

**Erstens war die Pruefung auf deutschen Rechnern wirkungslos.** Sie suchte
in der Ausgabe von `netstat -ano` nach `LISTENING`. Auf einem deutschen
Windows steht dort `ABHOEREN`. Der Filter griff also nie, `ALT_PID` blieb
leer, und der Ablauf sprang stillschweigend zum normalen Start durch. Auf
genau den Rechnern, fuer die die Pruefung gebaut war, tat sie nichts - und
niemand haette es gemerkt, weil ein wirkungsloser Test genauso aussieht wie
ein bestandener.

Jetzt fragt PowerShell: `Get-NetTCPConnection -LocalPort 3000 -State Listen`
liefert die PID, `Get-Process` den Namen. Das antwortet in jeder Sprache
gleich. Die Pipe im PowerShell-Befehl habe ich durch `@(...)[0]` ersetzt -
innerhalb der Anfuehrungszeichen darf sie nicht escaped werden, ausserhalb
muss sie es; solche Stolperstellen laesst man besser gar nicht erst
entstehen.

**Zweitens - und das ist der schwerere Fehler - konnte meine Pruefung den
Start VERHINDERN.** Kam ein Programmname heraus, der nicht `node.exe` hiess,
brach das Skript ab:

    echo   Das ist KEIN node.exe - hier wird nichts beendet.
    pause
    exit /b 1

Gut gemeint: kein fremdes Programm abschiessen. Aber die Schlussfolgerung
war falsch. Aus "ich erkenne das Programm nicht" folgt nicht "also starte
ich nicht". Eine Startdatei, die aus einem Verdacht heraus den Start
verweigert, ist schlimmer als das Problem, das sie loesen soll.

Jetzt gilt durchgehend: **im Zweifel starten.** Kein PowerShell, keine PID,
ein fremder Programmname, ein unerwarteter Wert - jeder dieser Faelle
springt zum Start durch. Bei einem fremden Programm gibt es einen Hinweis
und trotzdem einen Startversuch; kommt der Server dann wegen `EADDRINUSE`
nicht hoch, steht das im Fenster, und das Fenster bleibt stehen. Lieber eine
Fehlermeldung, die man lesen kann, als ein Skript, das die Entscheidung an
sich reisst.

Geprueft, was sich ohne Windows pruefen laesst: alle Sprungmarken haben ein
Ziel und jedes Ziel einen Sprung, die Klammerbilanz stimmt, `LISTENING` steht
nur noch in Kommentaren, und in den PowerShell-Zeilen liegt kein
ungeschuetztes `|` oder `>` ausserhalb der Anfuehrungszeichen.

## 26.08.2026 - Noch einmal ausgemistet, und der Fehler im Aufraeumen selbst

Dietmar, zwei Punkte: der Satz ueber die "kleine private Runde" solle auch
aus dem CHANGELOG raus, und im Repository muesse aufgeraeumt werden.

**Der erste Punkt war schlimmer, als er dachte.** In dem Eintrag, der die
Vornamen aus dem oeffentlichen Repository nehmen sollte, standen sie danach
immer noch - als Zitat der geloeschten Codezeile und als Zitat des alten
Platzhalters. Ich hatte die Namen aus `Index.html` entfernt und gleichzeitig
in meiner Beschreibung der Aenderung konserviert. Das CHANGELOG liegt genauso
oeffentlich bei GitHub wie Index.html; die Aufraeumarbeit war damit zur
Haelfte umsonst.

Wer eine solche Aenderung macht, muss auch seine eigene Beschreibung davon
durchsehen. Die Zitate sind raus.

Dazu die Formulierung selbst: "Nur eine kleine private Runde bekommt
weiterhin das eingebettete Fenster" nennt zwar keine Namen, sagt aber, dass
es eine bevorzugte Gruppe gibt. Auch das gehoert nicht in ein oeffentliches
Repository. Der Satz ist raus - im CHANGELOG und in den Kommentaren von
`Index.html` und `Server.js`, wo er sinngemaess ebenfalls stand. Die
Kommentare verweisen jetzt sachlich auf `video_embed.json`.

**Zum zweiten Punkt: `BUG_REPORT.md` fliegt raus.** 71 KB Innenrevision vom
17.08. Sie beschreibt einen Codestand, den es so nicht mehr gibt (damals
6.956 Zeilen Index.html), enthaelt Merkposten wie "Was du selbst machen
musst" und einmal den Pfad seines Windows-Benutzerkontos. Wer den Trainer
herunterlaedt, um zu lernen, faengt damit nichts an. Auf Dietmars Platte
bleibt sie liegen.

**Dabei fand sich ein Fehler in `github_ausmisten.js` selbst.** Der erste
Entwurf legte den Block in der `.gitignore` nur an, wenn die Marke noch
fehlte:

    if (!text.includes(MARKE)) { ... }

Kommt spaeter ein Name dazu - wie jetzt `BUG_REPORT.md` -, wuerde er nie
eingetragen, weil die Marke ja schon dasteht. Der naechste `git add -A`
haette ihn zurueckgeholt, und das Ausmisten waere genau so umsonst gewesen
wie heute Mittag, als ich die `.gitignore` ueberbuegelt habe. Zweimal
derselbe Fehlertyp an einem Tag: etwas herausnehmen und vergessen, es auch
draussen zu halten.

Jetzt vergleicht das Skript zeilenweise, welche Namen fehlen, und haengt
genau die an - egal ob die Marke schon dasteht.

Geprueft an einem echten Klon: beim zweiten Lauf wird nur `BUG_REPORT.md`
entfernt (die Werkzeuge sind ja schon draussen), die Datei bleibt auf der
Platte, `.gitignore` bekommt genau einen Eintrag dazu, und `git add -A` holt
nichts zurueck. Gegenprobe mit einem Ordner aus allen 25 beteiligten
Dateien: es landen genau zehn im Commit - Trainer, Gast-Werkzeuge,
CHANGELOG und die `.gitignore` selbst.

## 26.08.2026 - Aufraeumen, zweite Fassung

Dietmar: *"In meinem Ordner moechte ich auch ausmisten."*

Die vorhandene `aufraeumen.js` war auf den Stand von vorgestern gemuenzt -
Erweiterungsordner, Node-Installer, Einrichtskripte. Das ist alles laengst
weg; die Liste lief ins Leere. Heute steht anderes herum:

  - **`Piper-Stimmen.zip`, 419 MiB.** Zweck erfuellt - die Datei haengt am
    Release v1.0 bei GitHub. Mit `Stimmen_packen.bat` jederzeit neu gebaut.
    Der groesste Brocken im Ordner.
  - **`.git_alt_2026-08-25`** - die Historie VOR dem Neuanfang. Das neue
    Repository laeuft seit einem Tag, alles Neue liegt bei GitHub.
  - **`GitHub-Neustart.bat` und `github_neustart.js`** - der einmalige
    Neuanfang ist erledigt. Die beiden sind jetzt nicht nur nutzlos,
    sondern gefaehrlich: Ein Fehlklick benennt `.git` um und kappt die
    Verbindung zum Repository.
  - **`commit.bat`** - alter Git-Helfer, seit `Hochladen.bat` ohne Aufgabe.
  - Die drei Tunnel-Protokolle, die bei jedem Start neu entstehen.

**Zweimal gefragt statt einmal.** Der Zwischenspeicher `tts_cache` (rund
195 MB, 837 fertig gesprochene WAVs) steht in einer eigenen Frage. Er ist
kein Muell: Weg damit spart Platz, kostet aber beim naechsten Vorlesen jeder
Frage ein bis zwei Sekunden, bis sie wieder erzeugt ist. Diese Abwaegung
gehoert nicht in eine Liste, die man mit einem einzigen "j" abnickt.

**`backup/` bleibt unangetastet** - dort liegen alte Codestaende, aber eben
auch ein gesicherter Lernstand. Vier Megabyte sind der falsche Ort zum
Sparen.

**Zwei Fehler beim Testen gefunden, beide in meinem eigenen Skript.**

Der erste: Fuer jede Rueckfrage machte ich eine neue Eingabeleitung auf. Im
Terminal faellt das nicht auf - sobald die Antworten aber aus einer Datei
kommen (so pruefe ich hier), verschluckt die erste beim Schliessen den Rest,
und die zweite Frage bekommt nie eine Antwort. Jetzt gibt es eine Leitung,
die bis zum Schluss offen bleibt.

Der zweite war schlimmer: Faellt die Eingabe ganz weg - Fenster geschlossen,
Strg+C -, wartete die Frage ewig. Das Skript endete mitten im Ablauf, ohne
Schlusswort und ohne zu sagen, was es verschoben hatte. Jetzt gilt: keine
Antwort heisst nein, und das Schlusswort kommt in jedem Fall.

Geprueft an einem Nachbau seines Ordners mit allen 50 Eintraegen: Es
wandern genau die acht vorgesehenen in `_Aufgeraeumt_<Datum>`, `data/`,
`backup/`, `Hoerbuch/` und saemtliche Trainer- und Werkzeugdateien bleiben
liegen. Die Cache-Frage in beiden Richtungen einzeln nachgestellt.

Und wie beim ersten Mal: **geloescht wird nichts.** Alles wandert in einen
Ordner mit Datum im Namen. Wer nachgesehen hat und weiter lernen kann, wirft
ihn selbst weg.

## 26.08.2026 - Bilder in der Repository-Beschreibung

Dietmar: *"Kann ich in GitHub Bilder von meinem Trainer hochladen, die in der
Beschreibung zu sehen sind?"*

Ja - und zwar als Dateien im Repository, nicht ueber den Umweg, sie in einen
Kommentar zu ziehen und die Adresse zu kopieren. Ein Ordner `bilder/`, im
README mit `![Beschreibung](bilder/datei.png)` verlinkt: Die Bilder liegen
damit in jedem Klon, ueberleben jeden Umzug und haengen an keinem fremden
Server.

**Die Bilder habe ich aufgenommen, nicht er - und zwar mit Absicht.** Ein
Bildschirmfoto von seinem Rechner haette gezeigt, was gerade auf seinem
Rechner steht: Benutzernamen im Verlauf, womoeglich die Tunnel-Adresse. Wir
haben heute anderthalb Stunden damit zugebracht, drei Vornamen aus dem
oeffentlichen Repository zu bekommen; sie ueber ein Bildschirmfoto wieder
hineinzutragen waere ein schlechter Witz. Die Aufnahmen kommen deshalb aus
meinem Pruefstand - dieselbe `Index.html`, aber ohne einen einzigen echten
Namen. Im Verlauf steht "Benutzer 1", die Raumkennungen sind aus meinen
Tests.

Vier Bilder, jedes mit einem Grund:

  - **Hauptansicht** ganz oben, direkt unter dem ersten Absatz. Wer auf eine
    Repository-Seite kommt, entscheidet in Sekunden, ob ihn das Ding
    interessiert. Ein Bild beantwortet "wie sieht das aus?" schneller als
    jeder Absatz.
  - **Pruefungsziel waehlen** direkt hinter der Tabelle, die die sechs Wege
    aufzaehlt - Text und Bild sagen dasselbe, und das Bild sagt es sofort.
  - **Eine beantwortete Frage** - die eigene Antwort rot, die richtige
    daneben, links die Auswertung, unten die Stelle im Videolehrgang.
  - **Pruefungssimulator** vor dem Start, mit der Grauzone 17-18.

Aufgenommen mit doppelter Aufloesung und dann auf 1400 Pixel Breite
gerechnet, damit sie auf hochaufloesenden Bildschirmen scharf bleiben. Statt
Millionen Farben eine Palette aus 190: Bei einer Oberflaeche mit wenigen
Flaechenfarben sieht man keinen Unterschied, die Dateien sind aber statt 500
bis 700 KB nur noch **85 bis 136 KB** gross. Zusammen 448 KB fuer vier
Bilder - das darf ein Repository tragen, das ohnehin 746 Zeichnungen
mitbringt.

Nachgesehen: Alle vier Pfade im README zeigen auf vorhandene Dateien, die
`.gitignore` nimmt `bilder/` nicht versehentlich aus, und `aufraeumen.js`
hat den Ordner jetzt in seiner Sperrliste - sonst haette es die Bilder beim
naechsten Aufraeumen weggeraeumt.

## 26.08.2026 - Bilder vom Gruppenraum, und ein Lizenzwechsel

Zwei Wuensche in einem Zug: Bilder vom Gruppenraum mit mehreren Teilnehmern
fuer die Repository-Seite, ein Text dazu, dass der Trainer die passende
Ergaenzung fuer Ortsverbaende und Volkshochschulen ist - und der Wunsch,
dass Dietmars Arbeit rechtlich nicht mehr voellig frei herumliegt.

**Die Bilder.** Fuer den Gruppenraum reicht kein Bildschirmfoto: Es braucht
tatsaechlich mehrere Leute im Raum. Also habe ich fuenf Browser gleichzeitig
laufen lassen - einen als Gastgeber, vier als Teilnehmer mit den frei
erfundenen Namen Anna, Bernd, Clara und Jonas. Bewusst Vornamen und keine
Rufzeichen: Ein Rufzeichen gehoert immer jemandem.

Dabei gab es einen Umweg, der eine Eigenart des Trainers zeigt: Der
Einladungslink tritt dem Raum beim Laden von SELBST bei. Wer den Namen erst
danach setzt, steht in der Liste als "Benutzer 1". Erst Name, dann Link -
dann stimmt es.

**Ein Beobachtung, die Dietmar pruefen sollte.** In meinem Aufbau bekamen die
vier Teilnehmer die Fragen nicht: Der Gastgeber startete, seine eigene Runde
lief, bei den Gaesten kam sofort `duoFinalResults` an, ohne dass sie je eine
Frage gesehen haetten. Das kann an meinem Aufbau liegen - fuenf kopflose
Browser auf einer Maschine sind kein Wohnzimmer voller Leute. Es kann aber
auch ein echter Fehler sein. **Ich habe es nicht geklaert und behaupte
nichts.** Beim naechsten Abend mit der Gruppe ist es in einer Minute
geprueft.

**Der Lizenzwechsel.** Bis heute stand das Projekt unter MIT. Diese Lizenz
erlaubt ausdruecklich, den Trainer zu nehmen, zu veraendern und zu
**verkaufen** - Namensnennung genuegt. Das ist das Gegenteil dessen, was
Dietmar wollte. Auf die Frage hin hat er entschieden: kommerzielle Nutzung
ausgeschlossen.

Umgesetzt mit der **PolyForm Noncommercial License 1.0.0** statt der
naheliegenden Creative-Commons-Variante. CC BY-NC-SA ist fuer Texte und
Bilder gemacht; Creative Commons selbst raet von ihr fuer Software ab, weil
sie Quelltext, Bibliotheken und Verlinkung nicht kennt. PolyForm
Noncommercial ist eigens fuer diesen Fall geschrieben - und sie schliesst
Bildungseinrichtungen ausdruecklich ein: "Use by any charitable
organization, educational institution ... is use for a permitted purpose
regardless of the source of funding." Genau der Fall Ortsverband und VHS,
und zwar auch dann, wenn fuer den Kurs ein Beitrag erhoben wird.

**Drei Dinge, die ich nicht schoenreden kann und deshalb hineingeschrieben
habe:**

  1. **Was unter MIT herausgegangen ist, bleibt MIT.** Eine erteilte Lizenz
     laesst sich nicht zurueckziehen. Die Umstellung gilt ab jetzt.
  2. **Ideen sind nicht geschuetzt.** Das Urheberrecht schuetzt die konkrete
     Ausfuehrung - Code, Texte, Aufbau -, nicht den Einfall dahinter. Ein
     Satz wie "meine Ideen sind geschuetzt" waere schlicht falsch, und
     Falsches in eine Lizenzdatei zu schreiben schadet mehr, als es nuetzt.
  3. **Fremde Bestandteile bleiben, wie sie sind.** `lame.js` steht unter
     LGPL 2.1, der Fragenkatalog unter der Datenlizenz Deutschland - die
     erlaubt sogar ausdruecklich kommerzielle Nutzung der Daten -, die
     Zeichnungen aus fritzsche/afu_test sind gemeinfrei (nachgesehen: dort
     liegt die Unlicense). Diese drei kann Dietmar nicht umlizenzieren, und
     die LICENSE sagt das jetzt.

Die Lizenzdatei beginnt mit einer deutschen Zusammenfassung in klarer
Sprache - ausdruecklich als unverbindlich gekennzeichnet, verbindlich ist
der englische Text. Wer wissen will, ob er den Trainer im Ortsverband
einsetzen darf, soll das in dreissig Sekunden lesen koennen und nicht in
einem englischen Paragraphenwerk suchen muessen.

Ergaenzt wurden ausserdem `package.json` (Autor, Lizenzfeld) und der Kopf
dieses Protokolls.

**Kein Rechtsrat.** Ich bin kein Anwalt. Das ist eine gaengige, sauber
formulierte Lizenz fuer genau diesen Zweck - fuer eine belastbare Auskunft
gehoert ein Anwalt gefragt.

## 26.08.2026 - Ein Bild vom Updater

Dietmar wollte das Update-Fenster auch auf der Repository-Seite sehen. Ein
Bildschirmfoto davon ist nicht ohne weiteres zu bekommen: Das Fenster zeigt
nur dann etwas, wenn bei GitHub tatsaechlich Neues liegt - und aus meinem
Pruefstand antwortet api.github.com mit 403.

Also der Aufbau von Hand: ein nachgebautes GitHub auf einem eigenen Port,
davor der Trainer mit AFU_GITHUB_API und AFU_GITHUB_RAW auf diesen Port
gerichtet. Dann drei Lagen gleichzeitig hergestellt, damit im Bild wirklich
alles vorkommt, was der Updater kann:

  * video_map_embed.js im Nachbau geaendert  -> "bei GitHub neuer", vorangehakt
  * hoerbuch.js im Nachbau geaendert         -> "bei GitHub neuer", aber als
                                                Programmdatei NICHT vorangehakt
  * Index.html hier geaendert                -> gruener Kasten, nicht anhakbar

Genau die dritte Zeile ist Dietmars Auflage in Bildform: Was er hier frisch
bekommen hat, dreht der Updater nicht auf einen aelteren GitHub-Stand zurueck.

Das Bildfenster wurde absichtlich knapp gewaehlt (1300x700), damit der
Hinweisbalken von der Hauptseite oben mit ins Bild passt - Hinweis und
Fenster sind zwei getrennte Wuensche gewesen, im Bild stehen sie jetzt
zusammen.

Neu: `bilder/08-updater.png`. Im README dazu der Abschnitt "Aktuell bleiben -
ohne etwas kaputtzumachen" mit den drei Punkten, die den Updater
ausmachen: keine eigenen Aenderungen ueberschreiben, Programmdateien
gesondert bestaetigen, alte Fassung vorher nach backup/.

**Weiterhin ungeprueft:** Der Updater ist nur gegen den Nachbau getestet.
Gegen das echte api.github.com hat ihn noch niemand laufen sehen - das
passiert das erste Mal auf Dietmars Rechner.

## 26.08.2026 - Der Trainer fragt jetzt von selbst

Dietmar: "Nachdem wir den Updater schon haben, koennen wir im Hintergrund
nach dem Start automatisch bei GitHub pruefen ob es ein Update gibt. Wenn ja,
das es ein Fenster oeffnet und fragt ob das Update installiert werden soll.
Das mit dem Info und selbst schauen, ist irgendwie gut und irgendwie auch
nicht."

Das "irgendwie auch nicht" trifft es genau: Ein Update, das man erst unter
Info suchen muss, findet nur, wer ohnehin schon weiss, dass es eins gibt.

Nachgesehen hat der Trainer schon vorher - vier Sekunden nach dem Start
fragt der Server bei GitHub nach. Neu ist, WIE er es sagt. Bisher kam eine
schmale Leiste oben mit "Ansehen". Jetzt geht das Fenster von selbst auf und
fragt.

**Was ich NICHT gemacht habe, und warum.** Es waere ein Einzeiler gewesen,
das Fenster einfach immer aufzuschlagen. Das waere falsch gewesen. Es gilt
dieselbe Grenze, die Dietmar beim Fenster "Wo du aufgehoert hast" selbst
gezogen hat ("Das darf nur bei Start so sein. Nicht im Pruefungssimulator und
auch nicht im Gruppenraum."). Ein Update-Fenster mitten in der Pruefung, waehrend
die Uhr laeuft - oder im Gruppenraum, waehrend zwoelf Leute auf die naechste
Frage warten - waere eine Unterbrechung, die niemand bestellt hat.

Das Fenster geht deshalb nur auf, wenn alle vier Punkte stimmen:

  * Der Trainer laeuft oertlich (localhost) - ein Gast im Gruppenraum
    bekommt nichts davon zu sehen, es ist ja nicht sein Ordner.
  * Es laeuft gerade keine Frage (isQuizActive).
  * Kein Pruefungssimulator, kein Gruppenraum (nurNormalesLernen()).
  * Es steht kein anderes Fenster offen.

Passt der Moment nicht, kommt die schmale Leiste von frueher. Sie ist nicht
verschwunden, sie ist der Rueckfallweg geworden.

**Nur einmal je Stand.** Wer "Spaeter" klickt, hat geklickt: Der Commit wird
gemerkt, dieser Stand schlaegt nicht wieder auf. Erst wenn bei GitHub etwas
Neues liegt, aendert sich der Commit - dann fragt es wieder. Ohne diese
Bremse waere aus einer Hilfe binnen einer Woche eine Plage geworden.

**Und ein Schalter.** Unten im Fenster steht klein "Nicht mehr von selbst
fragen". Wer ihn drueckt, bekommt kuenftig nur noch die Leiste - und im
Fenster steht dann die Zeile, mit der er es wieder einschaltet. Dietmars
Satz war ambivalent; ein Schalter ist die ehrliche Antwort darauf.

**Was sich NICHT geaendert hat** - und das ist der Punkt, an dem ein
automatisches Fenster gefaehrlich werden koennte:

  * Geholt wird immer noch nichts von allein. Oben im Fenster steht in
    duerren Worten "Geaendert wurde noch nichts". Erst "Ausgewaehlte holen"
    schreibt.
  * Programmdateien sind weiter nicht vorangehakt und brauchen die zweite
    ausdrueckliche Zusage.
  * Der Ueberschreib-Schutz steht unveraendert: Was hier neuer ist, hat kein
    Kaestchen.

**Geprueft** gegen das nachgebaute GitHub, vier Faelle:

  1. Hauptansicht, nichts laeuft   -> Fenster geht auf.        richtig
  2. Derselbe Stand nach "Spaeter" -> nichts, weder noch.      richtig
  3. Lernmodus laeuft              -> Leiste statt Fenster.    richtig
  4. Nachschau abgeschaltet        -> Leiste statt Fenster.    richtig

Und einmal wirklich geholt: video_map_embed.js kam an, die alte Fassung
liegt in backup/github_2026-08-26-16-20, hoerbuch.js blieb als Programmdatei
liegen - und Index.html, die hier neuer war, hat denselben Fingerabdruck wie
vorher. Genau das war die Auflage.

**Weiterhin ungeprueft** bleibt der Weg zum echten api.github.com; aus
meinem Pruefstand kommt dort 403.

## 26.08.2026 - Der Prüfungssimulator kennt jetzt alle sechs Prüfungsziele

Dietmar: "Prüfungssimulator hat nur Klasse N? Hier könnte man das doch
erweitern." Und kurz darauf, genau richtig: "Wenn ich die N habe dann brauche
ich nur Technik. Bei Ziel wählen, sollte Maßgebend sein."

**Was vorher war.** Der Simulator hat das gewählte Prüfungsziel schlicht
ignoriert. Er bot immer dieselben drei Karten an - Betrieb, Vorschriften,
Technik - und zog aus dem, was gerade geladen war. Bei Klasse A hiess das:
alle 1374 Technikfragen aus N, E und A in EINEN Topf, daraus 25 Stueck. So
prueft die Bundesnetzagentur nicht. Und bei den Aufstockungen waeren Betrieb
und Vorschriften mit leerem Topf angeboten worden - ein Klick, und es kam
"Nicht genug Fragen in betrieb".

**Nachgesehen statt geraten.** Bevor ich etwas gebaut habe, habe ich
nachgeschlagen, wie die Pruefung seit der Pruefungsordnung von 2024
tatsaechlich aussieht (Vfg 29/2024; bestaetigt bei 50ohm.de, DARC und
afu-base.de). Es gibt FUENF Fragebogen, nicht drei:

    Vorschriften · Betriebliche Kenntnisse · Technik N · Technik E · Technik A

Jeder Bogen 25 Fragen, 45 Minuten - **ausser Technik A, der hat 60 Minuten**.
Das war mir nicht bekannt und stand bis heute falsch im Trainer. Bestanden ab
19, muendliche Nachpruefung ab 17. Und wer schon eine Bescheinigung hat,
schreibt die alten Bogen nicht noch einmal.

Daraus ergeben sich die sechs Faelle:

    Klasse N      V + B + Technik N                      3 Teile   135 Min
    Klasse E      V + B + Technik N + E                  4 Teile   180 Min
    Klasse A      V + B + Technik N + E + A              5 Teile   240 Min
    N → E         nur Technik E                          1 Teil     45 Min
    N → A         Technik E + Technik A                  2 Teile   105 Min
    E → A         nur Technik A                          1 Teil     60 Min

**Der Entwurfspunkt: diese Tabelle steht NICHT im Code.** Es waere der
naheliegende Weg gewesen, sie als Liste je Klassen-Kennung hinzuschreiben.
Dann muesste sie aber bei jeder neuen Katalogdatei nachgezogen werden, und
beim ersten Vergessen stimmte die Pruefung nicht mehr. Stattdessen wird
gerechnet: Die Katalogdateien tragen an jeder Frage `part`
(vorschriften/betrieb/technik) und `class` (1 = N, 2 = E, 3 = A). Ein Teil
wird angeboten, wenn dafuer mindestens 25 Fragen im geladenen Katalog liegen.
Die sechs Faelle oben fallen dann von selbst heraus - und eine siebte
Katalogdatei wuerde ohne eine Zeile Code richtig behandelt. Genau dieselbe
Ueberlegung stand schon bei der Pruefungsuebersicht im Code, ich habe sie nur
weitergezogen.

**Rueckfall fuer alte Kataloge.** Eine aeltere fragen.json ohne
Klassenfeld haette sonst plotzlich GAR keinen Technikteil mehr gehabt - der
Simulator waere stillschweigend kaputt gewesen, und zwar bei genau den
Leuten, die noch nicht aktualisiert haben. Fehlt das Feld ueberall, zaehlt
alles Technische als Technik N; das ist exakt das Verhalten von frueher.

**Was noch nachgezogen wurde:**

  * Die Pruefungsuebersicht auf der Hauptseite baut ihre Zeilen jetzt aus
    derselben Liste. Sonst haette dort "Technik · 45 min" gestanden, waehrend
    der Simulator daneben drei Technikbogen fuehrt, einen mit 60 Minuten.
    Zwei Stellen, die dasselbe behaupten und sich widersprechen, sind
    schlimmer als eine, die schweigt.
  * "Teil 1/3" heisst jetzt "Teil 1/5", wo es fuenf sind - und bei einem
    einzelnen Teil steht gar keine Zaehlung mehr.
  * Das Abzeichen in der Fragenzeile sagte "SIMULATOR 3/75", obwohl ein Teil
    25 Fragen hat. Das war schon vorher falsch, es faellt nur jetzt auf.
  * Daneben stand fest "Klasse N", egal welches Ziel gewaehlt war. Zeigt
    jetzt das wirkliche Ziel.

**Geprueft** wurde nicht nur die Anzeige, sondern ob wirklich die richtigen
Fragen kommen: Fuer Klasse A, N → A und E → A habe ich jede Pruefung
komplett durchgespielt und die Fragen-Kennungen nachgesehen. Im Teil
Technik E kamen ausschliesslich E-Fragen, in Technik A ausschliesslich
A-Fragen, in Vorschriften ausschliesslich V-Fragen - kein einziger
Ausreisser. Zeiten stimmten (60 Minuten nur bei Technik A), das
Gesamtergebnis rechnete 100/125 bei Klasse A und 20/25 beim einzelnen Teil.

**Nebenbefund, der eine offene Frage schliesst:** Beim Testen hat der Server
zum ersten Mal das ECHTE api.github.com erreicht (Commit f3855c07) und
Dietmars Repository korrekt gelesen. Der Updater ist damit nicht mehr nur
gegen den Nachbau geprueft.

## 26.08.2026 - Vorschaubild und die drei Einstellungen, die keine Dateien sind

Dietmar: "Für GitHub benötige ich noch Bilder und eine Beschreibung."

**Erst nachgesehen, was ueberhaupt fehlt.** Der Trainer kann inzwischen
selbst mit api.github.com sprechen - also habe ich das Repository gefragt,
statt zu raten. Ergebnis: Die Bilder und die Beschreibungsseite sind
laengst oben. Dietmars Push von 17:02 hat README.md und alle neun Bilder in
bilder/ mitgenommen. Haette ich losgelegt, haette ich ihm gebaut, was er
schon hat.

Was wirklich fehlte, waren drei Dinge, die **keine Dateien sind**:

    description   null   - der Einzeiler oben rechts unter "About"
    topics        []     - die Schlagworte, ueber die man gefunden wird
    social preview -     - das Bild beim Teilen eines Links

Die liegen nicht im Repository, sondern in GitHubs eigener Verwaltung. Sie
zu setzen braucht eine Anmeldung mit Dietmars Konto - und Zugangsdaten
nehme ich nicht entgegen. Also: das Bild bauen, die Texte fertig
hinschreiben, den Klickweg dazu.

**Das Vorschaubild** (`bilder/github-vorschau.png`, 1280x640 - das von
GitHub gewuenschte Format). Ohne eigenes Bild zeigt WhatsApp beim Teilen
eines Repository-Links nur einen grauen Kasten mit dem Dateibaum. Gebaut
in den Farben des Trainers, mit vier Zahlen, die stimmen und nachgerechnet
sind:

    1750  Pruefungsfragen  (204 V + 172 B + 195 Technik N
                            + 463 Technik E + 716 Technik A - der
                            vollstaendige Katalog ohne Doppelte)
    6     Pruefungsziele
    5     Pruefungsteile im Simulator
    0 €   und ohne Konto

Zahlen auf so einer Karte werden nie nachgeprueft und stehen jahrelang. Um
so wichtiger, dass sie beim ersten Mal richtig sind.

**Die Anleitung** liegt als `GITHUB-Einstellungen.md` im Ordner - mit dem
Beschreibungstext und dreizehn Schlagworten zum Einfuegen. Die Schlagworte
in Kleinbuchstaben ohne Umlaute (`pruefungsvorbereitung`), weil GitHub
nichts anderes annimmt. Die Datei steht in `.gitignore`: Sie erklaert, wo
man klickt, nicht was der Trainer kann - im Repository waere sie fehl am
Platz.

**Nebenbei aufgefallen:** `README.txt` liegt noch neben `README.md` bei
GitHub. Sie schadet nicht, aber wer beide sieht, fragt sich, welche gilt.
Nur gemeldet, nicht angefasst - Loeschen ist Dietmars Entscheidung.
Der Ordner `test/` dagegen darf bleiben: `tts-expand.test.js` ist echter
Pruefcode.

## 26.08.2026 - Der Banner ganz oben, und ein Bild, das nicht mehr stimmte

Dietmar: "Das Bild wurde in GitHub nicht geladen." Und auf Nachfrage: "In
GitHub fehlt es ganz oben!"

**Erst nachgesehen, statt zu reparieren.** Die naheliegende Vermutung waere
gewesen, dass mit der Bilddatei etwas nicht stimmt. Also nachgemessen:
1280x640, 8 Bit RGB, nicht interlaced, 278 KB, kein Farbprofil - genau das,
was GitHub verlangt. Und ueber raw.githubusercontent.com abgerufen: alle
zehn Bilder des README liefern HTTP 200. An den Dateien lag es nicht.

Gemeint war etwas anderes: Die Seite fing mit der Ueberschrift an. Ganz oben
stand kein Bild. Das Vorschaubild lag zwar im Ordner, aber nur fuer den
Fall, dass jemand den Link teilt - auf der Seite selbst kam es nicht vor.
Ein Missverstaendnis auf meiner Seite: Ich hatte "Bilder fuer GitHub" als
"Vorschaubild beim Teilen" gelesen, gemeint war der Kopf der Seite.

Also steht die Karte jetzt als Banner ganz oben im README, mittig, 900
Punkte breit. Sie tut damit beides: Kopf der Seite und Vorschaubild beim
Teilen.

**Dabei aufgefallen, und das war der eigentliche Fund:** Das erste
Bildschirmfoto (`01-hauptansicht.png`) zeigte noch die alte
Pruefungsuebersicht - drei Zeilen "Technik / Vorschriften / Betrieb", alle
45 Minuten. Seit heute Mittag stimmt das nicht mehr; die Uebersicht nennt
die Teile beim Namen ("Technik N") und kennt die 60 Minuten fuer Technik A.
Das allererste Bild, das ein Besucher sieht, haette also dem widersprochen,
was der Trainer tut. Neu aufgenommen.

Merkposten fuer kuenftige Aenderungen an der Oberflaeche: Bildschirmfotos
altern still. Sie sagen nie, dass sie veraltet sind.

## 26.08.2026 - Direkteinstieg und Aufstieg endlich auseinandergehalten

Dietmar hatte zuerst geschrieben: "Wenn ich Direkteinstieg möchte egal von N
nach E oder von E nach A, dann sollte das klarer sein." - und im selben Satz
"N nach E" einen Direkteinstieg genannt. Genau das war der Befund: Das
Fenster liess nicht erkennen, welcher der beiden Faelle gerade gewaehlt wird.

**Zuerst ein Widerspruch, der geklaert werden musste.** Dietmar schrieb, bei
Direkteinstieg auf E kaemen "Betrieb, Vorschriften und Technik" - also drei
Boegen. Der Trainer zeigte vier (V, B, Technik N, Technik E). Statt einfach
umzubauen habe ich nachgeschlagen. Vier Quellen sagen woertlich dasselbe:

    "Für eine Amateurfunkprüfungsbescheinigung der Klasse E müssen die
     Prüfungsteile V, B, N und E bestanden sein."      (afu-base.de)

Die Bundesnetzagentur teilt die Technik in drei eigene Boegen. Ein
Direkteinsteiger auf E schreibt also beide unteren Technikboegen. Auf
Nachfrage hat Dietmar das bestaetigt und die Regel selbst noch einmal
aufgeschrieben - sie deckt sich mit dem, was seit heute Mittag im Trainer
steht. Zwei seiner drei gemeldeten Punkte waren damit schon behoben, der
dritte war die Anzeige.

**Merkposten fuer mich:** Wenn der Nutzer und vier Quellen sich
widersprechen, ist Nachschlagen billiger als Umbauen. Haette ich seinem
ersten Satz gehorcht, waere aus einem richtigen Simulator ein falscher
geworden - und niemand haette es gemerkt, bis jemand in der echten Pruefung
vor einem Technik-N-Bogen sitzt, den er nie geuebt hat.

**Was neu ist: die Regel steht jetzt an einer Stelle.** Bisher ergab sich
der Umfang aus dem, was in der Katalogdatei lag - richtig, aber nirgends
ausgesprochen. Jetzt gibt es `getPruefungsUmfang(vorhandeneLizenz, ziel)`:

    keine Lizenz, Ziel N   V + B + TN                 75 Fragen
    keine Lizenz, Ziel E   V + B + TN + TE           100 Fragen
    keine Lizenz, Ziel A   V + B + TN + TE + TA      125 Fragen
    N vorhanden, Ziel E    TE                         25 Fragen
    N vorhanden, Ziel A    TE + TA                    50 Fragen
    E vorhanden, Ziel A    TA                         25 Fragen

Die sechs Kennungen des Trainers ('n','e','a','ne','na','ea') sind nichts
anderes als diese Paare; eine kleine Tabelle uebersetzt zwischen beiden. Ein
vollstaendiger Umbau der Zustandsverwaltung waere moeglich gewesen, haette
aber die gespeicherten Lernstaende und den Merkposten der Runde beruehrt -
fuer null Verhaltensaenderung. Die Kennungen bleiben, die Regel wird
ausgesprochen.

**Und eine Selbstpruefung dazu.** Bei jedem Wechsel des Ziels vergleicht der
Trainer, was die Regel sagt, mit dem, was tatsaechlich im Katalog liegt.
Fallen sie auseinander, steht das in der Konsole. Kein Alarmfenster - der
Katalog ist die Wirklichkeit, die Regel nur die Erwartung. Aber eine
vertauschte Katalogdatei wuerde sonst nie auffallen. Ueber alle sechs Ziele
geprueft: keine Abweichung.

**Das Fenster** ist in zwei Gruppen geteilt:

    Ich fange neu an — Direkteinstieg
      Noch keine Amateurfunkprüfung bestanden. Je höher die Klasse,
      desto mehr Technik kommt dazu.
        Klasse N · Basis          Prüfung: Vorschriften Betrieb Technik N  = 75
        Direkteinstieg Klasse E   ... Technik N Technik E                  = 100
        Direkteinstieg Klasse A   ... Technik N Technik E Technik A        = 125

    Ich habe schon eine Bescheinigung — Aufstieg
      Was du bereits bestanden hast, wird nicht noch einmal geprüft.
        Aufstockung N → E         Prüfung: Technik E                       = 25
        Aufstockung N → A         Prüfung: Technik E Technik A             = 50
        Aufstockung E → A         Prüfung: Technik A                       = 25

Jede Zeile sagt jetzt VOR dem Klick, was dabei geprueft wird. Die Zahl
rechts heisst nicht mehr nur "463 Fragen", sondern "463 zum Lernen" - sie ist
der Lernpool, nicht die Pruefung, und diese beiden wurden bisher
verwechselt.

Bild `02-pruefungsziel.png` neu aufgenommen.

## 27.08.2026 - Ohne Installation, und auf den USB-Stick

Dietmar: "wenn ich mir node.js als Stand Alone downloade und in den Trainer
veschiebe. Geht das?" - und kurz darauf das eigentliche Ziel: "Nichts
installieren zu muessen und das man den Trainer zB auf einem USB Stick
weiter geben kann. In einem Ortsverband oder einer VHS kann der Trainer USB
Sticks zum lernen austeilen."

**Erst ein Missverstaendnis geraderuecken.** Dietmar wollte Node in den
Ordner `node_modules` legen. Die beiden werden staendig verwechselt, weil
sie aehnlich heissen:

    node_modules   die Bausteine des Trainers - express, socket.io, cors
    node.exe       Node.js selbst, das Programm, das Server.js ausfuehrt

Das eine ins andere zu entpacken haette nicht funktioniert und im
schlimmsten Fall die vorhandenen Bausteine ueberschrieben.

**Node-Holen.bat + node_holen.ps1.** Holt die aktuelle LTS-Fassung von
nodejs.org nach `node\` - kein Installer, keine Administratorrechte, keine
Aenderung an der Registry.

Ausnahmsweise PowerShell statt Javascript, und zwar zwangslaeufig: Wer
dieses Werkzeug braucht, hat noch kein Node, mit dem sich eine .js-Datei
ausfuehren liesse. PowerShell ist seit Windows 7 ueberall dabei.

Die Architektur wird abgefragt (x64 / arm64 / x86) - ein ARM-Notebook bekaeme
sonst eine x64-Datei, die nicht startet, mit einer nichtssagenden
Fehlermeldung. Und **die Pruefsumme wird gegen SHASUMS256.txt nachgerechnet**.
Das ist kein Schmuck: Hier wird eine ausfuehrbare Datei auf einen fremden
Rechner gelegt. Stimmt der Fingerabdruck nicht, wird geloescht und nichts
entpackt.

**START.bat und START_MIT_TUNNEL.bat** nehmen jetzt `node\node.exe`, wenn es
da ist - mit Vorrang vor einem installierten Node. Wer sich die Muehe
gemacht hat, Node in den Trainer zu legen, will genau diese Fassung. Fehlt
beides, steht in der Meldung nicht mehr nur "installiere Node.js", sondern
der Weg ueber Node-Holen.bat.

**Und dann kam der eigentliche Zweck.** Sticks im Ortsverband austeilen. Dazu
zwei Befunde:

*Der Trainer ist tatsaechlich transportfaehig.* Alle 974 Dateien in
node_modules durchsucht: **kein einziger nativer Baustein** (.node, .dll).
express, socket.io und cors sind reines Javascript. Der Ordner laeuft mit
jedem Node ab 18, auf jedem Rechner, von jedem Laufwerksbuchstaben - alle
Startdateien arbeiten mit %~dp0.

*Aber den Ordner einfach kopieren waere ein Fehler gewesen.* Im
Trainer-Ordner liegen `data\` (Lernstand, Zaehler, Verlauf),
`video_embed.json` (die drei echten Namen der Testgruppe), `.git\` (die
ganze Vorgeschichte samt Mailadresse) und die Werkzeuge. Beim ZIP-Download
gibt es dafuer eine Positivliste; im Explorer greift sie nicht.

**USB-Stick-Erstellen.bat + usb_erstellen.js** benutzt deshalb dieselbe
Positivliste - plus `node\` und `node_modules\`, damit auf dem Zielrechner
weder eine Installation noch eine Internetverbindung noetig ist. Piper und
Hoerbuch werden einzeln gefragt (zusammen rund 460 MB). Auf dem Stick landet
eine ANLEITUNG-USB.txt: einstecken, START.bat, fertig. Der Lernstand
speichert sich auf dem Stick - er wandert mit, auf dem fremden Rechner
bleibt nichts zurueck.

**Was der Test gefunden hat.** Ein nachgebauter Ordner mit absichtlich
hineingelegtem Privatkram, dann durchgezaehlt: alle dreizehn verbotenen
Eintraege blieben draussen, alle zwoelf noetigen waren da. Dabei kamen zwei
echte Fehler heraus:

  1. **Dieselbe readline-Falle wie in aufraeumen.js.** Endet die Eingabe,
     ruft rl.question seine Funktion nie mehr auf, das Versprechen bleibt
     offen, node beendet sich still mit Code 0 - es sah aus, als waere alles
     gut gegangen, obwohl keine einzige Datei kopiert wurde. Jede Frage
     horcht jetzt zusaetzlich auf das Ende der Eingabe.
  2. **Die Sperre gegen die Kopie in sich selbst verglich
     gross-/kleinschreibungsempfindlich.** Windows tut das bei Pfaden nicht;
     "c:\users\..." waere durchgerutscht.

**Und die Selbstpruefung hat sich sofort bewaehrt.** Die Dateiliste steht an
zwei Stellen (Server.js und usb_erstellen.js) - genau die Konstellation, die
mir bei der .gitignore schon einmal um die Ohren geflogen ist. Deshalb
vergleicht das Werkzeug beim Start beide Listen. Und meldete prompt, dass
ich USB-Stick-Erstellen.bat in Server.js eingetragen hatte, aber nicht in
der eigenen Liste. Genau dafuer war sie da.

**Nachtrag zur Bedienung:** Der Pfad muss nicht getippt werden - das Werkzeug
zeigt die vorhandenen Laufwerke mit freiem Platz zur Auswahl. Bei zwanzig
Sticks hintereinander macht das einen Unterschied. Elf Faelle der
Zieleingabe durchgerechnet (Nummer, blosser Buchstabe, "E:", "E:\", voller
Pfad, ungueltige Nummer) - alle richtig.

**Ungeprueft:** node_holen.ps1 selbst. In meiner Umgebung gibt es kein
PowerShell, der echte Download ist nie gelaufen. Der erste Lauf passiert auf
Dietmars Rechner.

**Nicht geloest: Android.** node.exe ist ein Windows-Programm, ein Stick
hilft einem Tablet nicht. Nachgemessen ist aber, dass eine einzige,
in sich geschlossene HTML-Datei fuer Klasse N nur rund 1,2 MB gross waere -
die 699 SVG-Zeichnungen sind zusammen nur 130 KB. Machbar, aber noch nicht
untersucht, was in so einer Fassung vom Trainer uebrig bliebe.

### Nachtrag am selben Tag: der erste echte Lauf

Dietmar hat das Werkzeug sofort ausprobiert und dabei drei Dinge zutage
gefoerdert, die mein eigener Test nicht gefunden hatte:

**1. Absturz bei "D:\".** Als Ziel gab er die Wurzel des Sticks an. Dort
bricht `mkdirSync` mit EPERM ab, obwohl `recursive:true` gesetzt ist -
Windows meldet fuer ein Laufwerks-Stammverzeichnis nicht "gibt es schon",
sondern "nicht erlaubt". Das Skript stuerzte mit einem Stapelauszug aus
node:fs ab. Wer Sticks fuer den Ortsverband vorbereitet, soll keine
Fehlersuche in der Node-Bibliothek betreiben muessen.

Jetzt geht jedes Anlegen eines Ordners durch `ordnerSicherstellen()`, das
erst nachsieht, ob es ihn schon gibt. Ausserdem faengt der ganze Ablauf
Fehler ab und schreibt eine Zeile statt eines Stapelauszugs - mit
Klartext zu den haeufigen Ursachen (schreibgeschuetzt, kein Platz, Stick
abgezogen).

**2. Einzelne Dateien duerfen den Lauf nicht mehr sprengen.** Klemmt eine
Datei (offen, schreibgeschuetzt), wird sie gesammelt und am Ende gemeldet.
Vorher waere der ganze Stick auf halbem Weg liegengeblieben.

**3. Mein Testverfahren taugte nichts.** Ich hatte die Antworten per Rohr
hineingeschuettet. Dabei kommt das Ende der Eingabe frueher als die zweite
Frage, und meine eigene Absicherung von heute frueh beantwortete sie
prompt mit "nein" - der Test meldete "abgebrochen", wo ein Mensch laengst
weitergeklickt haette. Es gibt jetzt einen Pruefstand, der auf die
Eingabeaufforderung wartet und antwortet wie ein Mensch, mit offener
Eingabe. Zehn Pruefungen ueber zwei Ablaeufe, alle bestanden.

**Und die Selbstpruefung hat wieder angeschlagen.** Dietmars Ausgabe zeigte
"[HINWEIS] Diese Liste weicht von PAKET_DATEIEN in Server.js ab: nur in
Server.js: USB-Stick-Erstellen.bat, usb_erstellen.js" - genau der Fehler,
den ich beim Eintragen gemacht hatte. Zweimal an einem Tag hat diese
Pruefung etwas gefunden, das ich uebersehen hatte.

**Bedienung erleichtert:** Der Pfad muss nicht mehr getippt werden. Das
Werkzeug zeigt die vorhandenen Laufwerke mit freiem Platz zur Auswahl, und
wer nur "D" oder "D:\" eingibt, bekommt automatisch den Unterordner
`Amateurfunk-Trainer` - sonst laege der Trainer lose in der Wurzel des
Sticks. Elf Faelle der Zieleingabe durchgerechnet, alle richtig.

### Zweiter echter Lauf: der Stick startete nicht

Dietmars naechste Ausgabe, diesmal vom Stick selbst:

    [INFO] node_modules nicht gefunden - fuehre "npm install" aus...
    Error: Cannot find module 'D:\Amateurfunk-Trainer\node_modules\npm\bin\npm-prefix.js'
    ... zwei Stapelauszuege aus node:internal/modules/cjs/loader ...
    [FEHLER] npm install fehlgeschlagen.

**Die Ursache lag nicht auf dem Stick, sondern beim Bespielen.** Ein Blick
auf D:\Amateurfunk-Trainer zeigte als Ordner nur `sounds` und `svgs` -
weder `node\` noch `node_modules\`. Der Stick war aus einem frisch von
GitHub geladenen Ordner bespielt worden, der beides nicht hat. Mein
Werkzeug hatte das zwar angemerkt, aber danach seelenruhig "FERTIG"
gemeldet.

**Drei Dinge waren falsch, und alle drei am selben Punkt: Es wurde etwas
gemeldet, was nicht stimmte.**

**1. Das USB-Werkzeug prueft jetzt vorher UND nachher.** Vorher: Fehlt
`node\` oder `node_modules\`, steht beides einzeln da, dazu der Pfad des
Ordners, in dem man gerade steht ("Ist das der richtige Ordner? Ein frisch
von GitHub geladener hat beides noch nicht"). Nachher wird nachgesehen, ob
Oberflaeche, Programm, Fragen, Bausteine und Node wirklich am Ziel
angekommen sind. Fehlt etwas, heisst die Schlusszeile nicht mehr "FERTIG",
sondern "KOPIERT, ABER UNVOLLSTAENDIG" - mit der Angabe, was fehlt und was
dagegen hilft.

Ein Werkzeug, das "fertig" sagt und einen Stick hinterlaesst, der beim
Empfaenger nicht anspringt, ist schlimmer als eines, das gar nichts tut.

**2. START.bat ruft npm nicht mehr blind auf.** Vorher: `node_modules`
fehlt, also `npm install` - egal ob npm ueberhaupt vorhanden ist. Auf dem
Stick war es das nicht, und der Empfaenger bekam zwei Stapelauszuege aus
der Node-Bibliothek zu sehen, in denen der eigentliche Fehler nicht einmal
vorkam. Jetzt wird erst geprueft, ob npm da ist, und wenn nicht, steht da
in Klartext, dass der Ordner unvollstaendig ist - mit zwei Wegen, je
nachdem ob man ihn selbst angelegt oder bekommen hat.

Geprueft wird ausserdem auf `node_modules\express` statt nur auf den
Ordner `node_modules`. Ein leerer oder halb kopierter Ordner haette die
alte Pruefung bestanden.

**3. Zum Missverstaendnis von heute frueh:** node_modules und node.exe
werden verwechselt, das zieht sich durch. Deshalb steht die Unterscheidung
jetzt als Kommentar in START.bat, wo sie geprueft wird.

Zwei Ablaeufe neu durchgetestet (unvollstaendiger Quellordner mit "nein"
und mit "trotzdem weiter"), dazu die zehn Pruefungen von vorhin noch
einmal - alle bestanden.

### Dritter Lauf: das Werkzeug holt sich jetzt selbst, was fehlt

Dietmar hat das Ziel endlich in einem Satz gesagt, und der raeumt mit
meinem bisherigen Entwurf auf:

    "Ziel ist es, wen ich von GitHub den Trainer downlade, hier die Bat
     ausfuehren kann der auf meinem USB Stick den Trainer vollstaendig
     kopiert."

Mein Werkzeug meldete stattdessen brav, was fehlt, und schickte ihn weg:
"Node-Holen.bat im Quellordner ausfuehren, dann noch einmal hierher." Das
ist zwar richtig, aber es ist keine Antwort auf die Aufgabe. Ein
Werkzeug, das weiss, was fehlt, und weiss, wie man es holt, soll es holen.

**Jetzt fragt es einmal und erledigt beides:**

    In diesem Ordner fehlt noch:
       node\           - Node.js selbst, damit beim Empfaenger
                         nichts installiert werden muss
       node_modules\   - die Bausteine des Trainers

    Das ist normal bei einem frisch von GitHub geladenen Ordner.
    Beides kann ich jetzt holen - dafuer wird einmal eine
    Internetverbindung gebraucht, danach nie wieder.

    Jetzt holen und dann den Stick bespielen?  [j/n]

Bei "j" laeuft node_holen.ps1 und danach "npm install", beides mit
sichtbarer Ausgabe. Klappt nur eines, sagt es, welches - und fragt, ob
trotzdem kopiert werden soll.

**Auch USB-Stick-Erstellen.bat kann sich jetzt selbst helfen.** Sie
braucht ein Node, um usb_erstellen.js ueberhaupt auszufuehren. Findet sie
keines - weder im Ordner noch auf dem Rechner -, ruft sie node_holen.ps1
auf, statt mit einer Fehlermeldung stehenzubleiben. Damit ist der ganze
Weg wirklich ein Doppelklick, auch auf einem Rechner ohne Node.

**Geprueft** an einem nachgebauten frischen GitHub-Ordner: Das Nachholen
von node_modules lief durch (983 Dateien), das Holen von Node schlug hier
erwartungsgemaess fehl (in dieser Umgebung gibt es kein PowerShell) - und
genau das stand dann auch da, samt der Nachfrage, ob trotzdem kopiert
werden soll. Der Stick wurde bespielt und korrekt als unvollstaendig
gemeldet, weil node\ fehlte.

Was dabei auffiel und kein Fehler ist: `spawnSync` mit `stdio:'inherit'`
reicht die Eingabe an das Unterprogramm durch. Das ist hier
unproblematisch, weil node_holen.ps1 in genau diesem Fall nichts fragt -
gefragt wird dort nur, wenn schon ein node\ existiert, und dann ruft das
USB-Werkzeug es gar nicht erst auf.

### Vierter Lauf: es klappt - und eine Warnung an der unguenstigsten Stelle

Dietmars Ausgabe zeigt den ganzen Weg, und er stimmt: LTS v24.20.0
(Krypton) gefunden, 35,8 MB geladen, **Pruefsumme stimmt**, entpackt nach
node\, danach 90 Pakete per npm install, "Beides da", Laufwerksliste.

Damit ist auch node_holen.ps1 zum ersten Mal wirklich gelaufen - bis
gestern war es das einzige Stueck, das ich nur lesen, aber nicht
ausfuehren konnte. Es funktioniert, samt Pruefsummenvergleich.

**Ein Schoenheitsfehler mit unangenehmer Wirkung:** Genau in dem Moment,
als die Frage nach dem Ziellaufwerk erschien, schob Node diese Zeile
dazwischen:

    (node:9816) [DEP0190] DeprecationWarning: Passing args to a child
    process with shell option true can lead to security vulnerabilities

Sachlich harmlos - die Pakete waren sauber installiert -, aber an dieser
Stelle sieht es aus, als sei etwas schiefgegangen. Und wer gerade zwanzig
Sticks bespielen will, soll nicht raten muessen, ob er weitermachen darf.

Ursache: npm ist unter Windows eine .cmd-Datei und laesst sich seit der
Sicherheitskorrektur in Node 18.20 nur noch ueber die Shell starten.
Uebergibt man dabei zusaetzlich eine Argumentliste, mahnt Node ab Fassung
22. Jetzt geht ein einziger Befehlstext hinaus statt Befehl plus Liste,
der Pfad in Anfuehrungszeichen fuer den Fall von Leerzeichen.
Nachgemessen: null Treffer fuer DEP0190, npm laeuft unveraendert.

### "Das mit dem 1 finde ich seltsam"

Dietmar: "Ich wuensche mir das es nach einem USB Stick sucht und alle
auflistet."

Er hat recht, und der Einwand trifft mehr als die Bedienung. Meine Liste
zeigte, WELCHE LAUFWERKE ES GIBT - und liess offen, was man eigentlich
wissen will: **wo steckt der Stick**. Ob "D:" der Stick ist oder die
zweite Festplatte, musste man selbst wissen. Bei zwanzig Sticks
hintereinander ist das eine Einladung zum Danebenkopieren.

Windows weiss es genau: `Win32_LogicalDisk` kennt einen `DriveType`, und
2 bedeutet Wechseldatentraeger. Dazu gibt es den Namen, den der Stick beim
Formatieren bekommen hat, und die Groesse. Abgefragt ueber PowerShell -
Node weiss von sich aus nichts ueber Laufwerkstypen, und eine fremde
Bibliothek dafuer waere die vierte Abhaengigkeit in einem Projekt, das
bewusst nur drei hat.

Jetzt steht da:

    Gefundene USB-Sticks:
      1)  D:\  "AFU-KURS"          58.5 GB frei von 64.0 GB

    Andere Laufwerke:
      2)  E:\  "Daten"            900.0 GB frei von 2000.0 GB

    Eingabetaste  = D:\Amateurfunk-Trainer
    Nummer        = dieses Laufwerk
    n             = noch einmal nach Sticks suchen

**Ist genau ein Stick da, genuegt die Eingabetaste** - dann muss man gar
nichts mehr tippen. Steckt keiner, steht das da ("Kein USB-Stick gefunden.
Steckt er schon?") samt der Moeglichkeit, nach dem Einstecken noch einmal
zu suchen, statt abbrechen und neu starten zu muessen. Und wer eine
Festplatte waehlt, wird gefragt, ob das wirklich gewollt ist.

**Geprueft ohne Windows**, indem die Funktion aus der Datei
herausgeschnitten und mit nachgebauten WMI-Antworten gefuettert wurde -
vier Faelle, alle bestanden:

  * Stick, zweite Festplatte und C: nebeneinander -> nur der Stick wird
    als Stick gefuehrt, C: faellt raus
  * nur ein einziges Laufwerk -> PowerShell liefert dann KEIN Array,
    sondern ein einzelnes Objekt. Ohne diesen Fall waere die Liste bei
    genau einem Stick leer geblieben - also ausgerechnet in Dietmars
    Alltagsfall.
  * leeres Kartenlesegeraet (Size = null) -> wird uebergangen, statt als
    "0.0 GB frei" in der Liste zu stehen
  * PowerShell antwortet gar nicht -> keine Liste, aber auch kein
    Absturz; der Pfad laesst sich weiterhin eintippen

### "Quasi fuer dumme"

Dietmar hat den Anspruch in einem Satz formuliert: "Mit den Dateien aus dem
Zip Ordner von GitHub entpackt auf meinem Desktop, einen komplett
lauffaehigen Amateurfunk Trainer haben ueber USB Stick erstellen.bat."

Dabei fiel eine Luecke auf, die ich uebersehen hatte: **Im GitHub-Zip ist
kein piper\.** Die Sprachausgabe ist rund 470 MB und liegt bewusst nicht
im Repository - piper.bat holt sie bei Bedarf. Der Stick waere also
komplett gewesen bis auf die natuerliche Stimme, und niemand haette
gewusst, warum der Trainer plotzlich nach Windows klingt.

Jetzt holt das Werkzeug alle drei fehlenden Stuecke: node\,
node_modules\ und piper\. Aus einem frisch entpackten Zip heraus ist der
ganze Weg:

    Doppelklick  ->  Eingabetaste  ->  Eingabetaste  ->  fertig

Die erste Eingabetaste holt die drei Teile, die zweite waehlt den einzigen
gefundenen USB-Stick. Sonst nichts.

**Was ich dabei weggelassen habe, ist genauso wichtig wie das, was ich
hinzugefuegt habe.** Nach einem frischen piper.bat liegt genau EINE Stimme
im Ordner. Die Frage "alle Stimmen / nur die beste / keine" waere dort
sinnlos - eine Huerde ohne Entscheidung dahinter. Sie erscheint jetzt erst
ab zwei Stimmen. Wer wie Dietmar sieben im Ordner hat, bekommt sie weiter,
mit Groessen und der besten markiert:

    Sprachausgabe (Ordner piper\) - 470.2 MB, 7 Stimme(n)
       * de_DE-thorsten-high         113.9 MB   <- beste
         de_DE-thorsten-medium        63.2 MB
         ...
    Eingabetaste  = alle mitnehmen  (470.2 MB)
    b             = nur die beste  (133.8 MB)
    n             = ohne Sprachausgabe

Bei zwanzig Sticks sind das 9 GB gegen 2,7 GB Schreibarbeit - deshalb
bleibt die Wahl, aber Mitnehmen ist die Vorgabe. Genau das hatte Dietmar
verlangt: "Piper muss bei USB Stick erstellen auch mit rein."

Zwei Kleinigkeiten dabei mitgenommen: Der Unterbau (piper.exe, die DLLs,
espeak-ng-data, libtashkeel) geht immer mit, sonst nuetzt die schoenste
Stimme nichts - und zu einer weggelassenen Stimme wird auch ihre .json
weggelassen, weil der Trainer eine .onnx ohne .json gar nicht erst findet.
Dietmars Probeordner `_stimmentest` bleibt draussen.

**Geprueft** an einem nachgebauten frischen Zip-Ordner (31 Eintraege, kein
node\, kein node_modules\, kein piper\) und danach an demselben Ordner
im vollstaendigen Zustand: Dann kommt vor der Laufwerksauswahl keine
einzige Frage mehr. Dazu drei Stimmen-Faelle (alle / nur die beste / keine)
und die elf Pruefungen von vorhin - alle bestanden.

### Kein zweiter Doppelklick mehr

Dietmar: "Es muss alles fertig abschliessen. Moechte keine piper.bat Datei
auch noch starten. Mit USB Stick erstellen, muss alles erledigt sein, auch
Piper. Wenn noetig, baue die piper Test damit ein."

Ich hatte piper.bat zwar aufgerufen, aber mit dem Hinweis "will
zwischendurch zweimal eine Taste sehen". Das ist ein halber Schritt: Wer
"fuer dumme" sagt, meint auch, dass niemand zwischendurch raten soll, ob
das Fenster haengt oder auf ihn wartet.

**Jetzt bekommt piper.bat ihre Tastendruecke von hier.** Unter Windows
liest `pause` aus der Standardeingabe, wenn dort etwas anliegt - also
gehen fuenf Zeilenumbrueche hinein, und die drei Haltepunkte laufen
durch. Die Ausgabe bleibt sichtbar, nur die Eingabe ist vorbelegt.

**Der Funktionstest ist eingebaut** - und zwar zweimal, mit Absicht.
piper.bat macht ihn als Schritt 5 und zeigt das Ergebnis an; ich mache ihn
danach noch einmal selbst (`piper.exe --help`), weil ich das Ergebnis
*auswerten* will und nicht nur anzeigen. Damit steht in der Ausgabe
entweder "startet einwandfrei" oder der Grund.

**Und dabei ein Befund, den ich nicht verschweigen darf.** Der Stick kann
NICHT alles mitbringen, was die Sprachausgabe braucht. piper.exe setzt
das Microsoft-Laufzeitpaket voraus (Visual C++ Redistributable). Auf
Dietmars Rechner ist es da - auf dem Rechner eines Teilnehmers
moeglicherweise nicht, und dann stuerzt piper.exe dort ab, obwohl auf dem
Stick alles liegt. Ein Laufzeitpaket laesst sich nicht auf einen Stick
kopieren, es muss installiert werden.

Der Trainer laeuft trotzdem - er liest dann mit der Windows-Stimme vor.
Und `piper\piper_reparatur.bat` liegt ohnehin mit im Ordner piper\ und
holt das Paket nach. Beides steht jetzt in der ANLEITUNG-USB.txt auf dem
Stick, unter "Die Stimme klingt nach Windows statt natuerlich".

**Geprueft** mit einem nachgebauten piper.bat, das sich wie das echte
verhaelt (drei Haltepunkte): Alle drei liefen ohne Zutun durch. Dazu der
Fehlerfall - ein piper.exe, das mit einem Fehlercode abbricht: Dann steht
der Grund da, und die Dateien kommen trotzdem mit auf den Stick, damit die
Reparatur dort moeglich bleibt.

### Eine Frage. Sonst nichts.

Dietmar: "Es soll nur Fragen wohin USB Stick erkennen und danach
durchlaufen."

Sein Lauf davor hatte funktioniert - Piper geladen, Funktionstest
bestanden, Stick "Amateurfunk Trainer" erkannt -, aber auf dem Weg dorthin
standen vier Fragen. Jede einzeln begruendbar, zusammen genau das
Gegenteil von "fuer dumme".

Weggefallen sind drei:

  * **"alles holen? [j/n]"** - Wer das Werkzeug startet, will einen
    fertigen Stick. Es holt jetzt, was fehlt, und sagt nur an, dass es das
    tut.
  * **"Der Ordner ist nicht leer, weiter? [j/n]"** - Denselben Stick ein
    zweites Mal zu bespielen ist der Normalfall, nicht die Ausnahme. Die
    Rueckfrage hat nie etwas verhindert, nur einen Tastendruck gekostet.
    Gesagt wird es weiterhin, gefragt nicht mehr.
  * **"alle Stimmen / nur die beste / keine"** - Die Auswahl sparte bei
    sieben Stimmen rund 340 MB, aber sie kostete eine Entscheidung. Jetzt
    kommt alles mit, was im Ordner piper\ liegt. Wer Platz sparen will,
    loescht dort Stimmen - dann nimmt das Werkzeug von selbst weniger mit.
    Das ist derselbe Effekt ohne Frage.

Auch das Hoerbuch wird nicht mehr gefragt, sondern mitgenommen, wenn es da
ist.

**Zwei Fragen sind absichtlich geblieben**, und beide nur im Ausnahmefall:

  * Liessen sich node\ oder node_modules\ nicht holen, wird gefragt, ob
    trotzdem kopiert werden soll. Einen Stick stillschweigend zu bespielen,
    der beim Empfaenger nicht startet, waere schlimmer als eine Frage.
  * Wird statt eines Sticks eine Festplatte gewaehlt, wird nachgefragt.
    600 MB versehentlich auf ein Datenlaufwerk zu schuetten ist teurer als
    ein Tastendruck.

Im Normalfall bleibt: **Doppelklick, Eingabetaste, fertig.**

**Dazu laeuft piper.bat jetzt ohne Tastendruecke** (fuenf Zeilenumbrueche
in die Standardeingabe - "pause" liest von dort und laeuft weiter), und ihr
Funktionstest wird hier noch einmal selbst ausgefuehrt, damit das Ergebnis
auswertbar ist statt nur sichtbar.

README und Bild `10-usb-stick.png` zeigen den neuen Ablauf.

### "das macht doch jetzt die USB Stick erstellen Bat"

Dietmar hat recht - und der Einwand deckt eine Schwaeche auf, die ich
selbst eingebaut hatte.

USB-Stick-Erstellen.bat holt Node, node_modules und Piper von selbst.
START.bat dagegen schickte weg: "Doppelklick auf Node-Holen.bat, danach
diese START.bat erneut." Also zwei Werkzeuge, die dasselbe koennen, und
nur eines tut es.

Das ist an der falschen Stelle unangenehm. Wer einen Stick bekommt und
START.bat anklickt, will lernen - und sieht eine Fehlermeldung, wo ein
Trainer sein sollte. Auch wenn dort steht, was zu tun ist: Es ist eine
Huerde, die keine sein muss.

**START.bat holt Node jetzt selbst**, genau wie das USB-Werkzeug. Und das
geht, obwohl kein Node da ist - node_holen.ps1 ist PowerShell, das ist
seit Windows 7 auf jedem Rechner. Klappt es nicht (kein Internet), steht
da, dass man es spaeter noch einmal versuchen kann, samt dem Hinweis fuer
den Fall, dass jemand einen unvollstaendigen Stick bekommen hat.
START_MIT_TUNNEL.bat genauso.

**Wofuer Node-Holen.bat dann noch gut ist:** um Node in einen Ordner zu
legen, ohne dabei einen Stick zu bespielen und ohne den Trainer zu
starten. Genau Dietmars derzeitiger Fall - er will sein installiertes
Node.js loswerden und braucht vorher das mitgelieferte in seinem
Arbeitsordner. Fuer alle anderen ist die Datei ab jetzt entbehrlich.

## 27.08.2026 - Im Repository aufgeraeumt

Dietmar: "lass uns in GitHub mal richtig aufraeumen."

**Erst nachgesehen, was wirklich drinliegt.** Die GitHub-API bremste
gerade, also habe ich den Git-Index in Dietmars Ordner ausgelesen und
selbst ausgewertet - das ist ohnehin die verlaesslichere Quelle, weil dort
steht, was git tatsaechlich verfolgt. (Beim ersten Anlauf ist mein Leser
abgestuerzt: Die Auffuellung auf Achtergrenzen zaehlt ab Eintragsanfang,
nicht ab Dateianfang.)

Stand: **800 Dateien, 22,6 MB.** Die Entwicklerwerkzeuge waren schon
draussen - das fruehere Ausmisten hatte gehalten. Uebrig blieben drei
Funde, und der wichtigste war keine Frage der Groesse.

**1. README.txt war schlicht falsch.** Sie erklaerte, wie man Piper VON
HAND installiert: Zip von GitHub laden, DLLs kopieren, .onnx-Dateien
ablegen. Das macht piper.bat seit Monaten allein. Sie nannte ausserdem
"server.js" (heisst Server.js) und riet, dort den Stimmnamen zu aendern -
der Trainer sucht die Stimmen laengst selbst.

Das Aergerliche war nicht der Fehler, sondern wo er lag: **in jedem ZIP und
auf jedem USB-Stick**, direkt neben der richtigen ANLEITUNG.txt. Wer sie
zuerst aufschlug, bekam eine Bastelanleitung fuer etwas, das von selbst
geht. Eine Anleitung, die etwas Falsches sagt, ist schlimmer als gar keine.
Raus aus dem Repository, raus aus PAKET_DATEIEN, raus aus der Stick-Liste.

**2. bilder/youtube-vorlage.html** hatte mit dem Trainer nichts zu tun -
die Bauvorlage fuer Dietmars YouTube-Bild, mir beim Ablegen in seinen
Ordner durchgerutscht.

**3. sounds/fanfare.wav: 2,3 MB fuer zwoelf Sekunden.** Unkomprimiert, 48
kHz Stereo - ein Zehntel des ganzen Repositorys, und sie wanderte auf jeden
Stick und in jedes ZIP mit. Als MP3 sind es **278 KB**.

Nicht auf Verdacht umgewandelt, sondern nachgemessen: beide Fassungen auf
dieselbe Form gebracht, den Versatz gesucht, den der MP3-Kodierer einfuegt,
und den Stoerabstand gerechnet. **22,8 dB** - fuer eine Fanfare hoert das
niemand. Drei Guetestufen verglichen (278 / 226 / 167 KB) und die
vorsichtigste genommen; die 50 KB Unterschied sind es nicht wert.

Im Trainer steht jetzt `sounds/fanfare.mp3` - **mit der WAV als
Rueckfall**. Wer ein aelteres Paket hat, in dem nur die WAV liegt, hoert
weiter etwas. Eine stumme Fanfare waere ein Fehler, den niemand meldet und
niemand findet.

**Nach dem Ausmisten:** rund 20,3 MB statt 22,6 - und vor allem eine
Anleitung weniger, die luegt.

Die drei stehen jetzt in der RAUS-Liste von github_ausmisten.js. Sie
bleiben auf Dietmars Platte liegen, nur das Repository fuehrt sie nicht
mehr. Die Ueberschrift der Ausgabe ist mitgewandert - "Entwicklerwerkzeuge"
stimmte fuer eine falsche Anleitung und eine Tondatei nicht mehr.

### Ein Symbol auf dem Desktop

Dietmar hat eine icon.png in den Ordner gelegt - ein Funkgeraet mit
Mikrofon - und wollte eine Desktop-Verknuepfung zu START.bat, die dieses
Bild traegt.

**Zwei Dinge, an denen es sonst gescheitert waere:**

**Windows nimmt fuer Verknuepfungen keine .png.** Sie wird stumm
ignoriert; man sieht weiter das graue Zahnrad und sucht den Fehler an der
falschen Stelle. Also erst eine `icon.ico` gebaut - mit acht Groessen von
16 bis 256 Pixeln, damit sie in der Detailansicht genauso sauber aussieht
wie bei grossen Symbolen. Die Vorlage hat 96 Pixel; deshalb wird zuerst
auf 256 hochgerechnet und von dort heruntergestuft, sonst wuerden die
kleinen Groessen fransig. Die 32er-Fassung nachgesehen: Mikrofon und
Geraet sind noch klar zu erkennen.

**Und ein Fehler in meinem eigenen Entwurf, den ich vor dem Ausliefern
gefunden habe:** Ich hatte den Fragezeichen-Operator benutzt
(`$a ? 'x' : 'y'`). Den gibt es erst ab PowerShell 7 - Windows startet mit
`powershell` aber die Fassung 5.1, und die waere mit einem Syntaxfehler
stehengeblieben, bevor ueberhaupt etwas passiert. Ersetzt durch ein
schlichtes if/else. Genau dieselbe Falle wie damals das englische
"LISTENING" in einer deutschen netstat-Ausgabe: Es laeuft auf meinem
Pruefstand und nirgends sonst.

Neu sind `Verknuepfung-Erstellen.bat` und `verknuepfung.ps1`. Die
Verknuepfung wird ueber WScript.Shell angelegt - dieselbe Schnittstelle,
die auch der Explorer benutzt; eine .lnk von Hand zu schreiben waere
unnoetig heikel. Gesetzt werden Ziel, Arbeitsordner (sonst sucht START.bat
im falschen Verzeichnis) und das Symbol. Das Werkzeug laesst sich jederzeit
erneut ausfuehren - nach einem Umzug des Ordners zeigt die Verknuepfung
danach wieder richtig.

**Es geht mit auf den Stick.** icon.ico, icon.png und die beiden Dateien
stehen jetzt in der Paketliste, und in der ANLEITUNG-USB.txt steht der
Hinweis darauf. Wer den Trainer im Ortsverband auf einem Stick bekommt,
kann ihn damit auf seinem Desktop ablegen - mit dem Funkgeraet statt eines
Zahnrads. Fuer eine Lernsoftware, die man ueber Wochen taeglich oeffnet,
ist das mehr als Kosmetik.

## 28.08.2026 - Nach dem Deinstallieren stand Hochladen.bat still

Dietmars Ausgabe:

    Der Befehl ""node"" ist entweder falsch geschrieben oder
    konnte nicht gefunden werden.

Nachgesehen: Node.js ist deinstalliert, und `node\` gibt es in
Klasse-N-Trainer nicht. Die Meldung stimmte also - nur half sie niemandem.

**Der Fehler war meine halbe Loesung von gestern.** Ich hatte den
Werkzeugen beigebracht, `node\node.exe` zu BEVORZUGEN, wenn es da ist.
Ist es nicht da, brachen sie ab. START.bat und USB-Stick-Erstellen.bat
holen Node dagegen selbst. Dieselbe Inkonsequenz wie schon einmal, nur
eine Ebene tiefer - und diesmal an der teuersten Stelle: beim Hochladen.

Alle sieben Werkzeuge holen Node jetzt selbst, wenn keines da ist:

    Hochladen.bat        GitHub-Ausmisten.bat    GitHub-Pruefen.bat
    Aufraeumen.bat       Stimmen_packen.bat      Update-Pruefen.bat
    Fehler-Zeigen.bat

Zum Holen wird kein Node gebraucht - node_holen.ps1 ist PowerShell.
Klappt auch das nicht (kein Internet), steht das da, samt dem Weg von
Hand. Ein Abbruch mit Erklaerung, nicht mit einer Zeile aus cmd.

**Merkposten fuer mich:** "Bevorzugen, wenn vorhanden" und "holen, wenn
noetig" sind zwei verschiedene Dinge. Ich hatte das erste eingebaut und
das zweite gemeint - und es faellt erst auf, wenn der Fall wirklich
eintritt. Bei Dietmar ist er heute eingetreten.

Die Dateien liegen auch im Ordner Mitnehmen\, damit sie den geplanten
Umzug ueberstehen.

## 28.08.2026 - Ein ZIP ist kein Repository

Nach dem Umzug nach `C:\Program Files\Amateurfunk-Trainer` meldete
Hochladen.bat:

    Hier ist kein Repository. Erst GitHub-Neustart.bat ausfuehren.

Zwei Dinge stimmten daran nicht.

**Erstens: Die Meldung nannte ein Werkzeug, das es nicht mehr gibt.**
GitHub-Neustart.bat war einmalig fuer den Neuaufbau der Historie da und
liegt laengst nicht mehr im Ordner. Wer die Zeile liest, sucht also nach
einer Datei, die er nie finden wird. Beide Stellen in hochladen.js zeigen
jetzt auf das richtige Werkzeug.

**Zweitens: Ein Neustart waere hier genau das Falsche gewesen.** Der neue
Ordner ist aus dem GitHub-ZIP entstanden, und ein ZIP enthaelt nur die
Dateien - nicht den Ordner `.git` mit der Vorgeschichte. Die Vorgeschichte
ist ja nicht weg, sie liegt bei GitHub. Sie muss nur wieder angebunden
werden. GitHub-Neustart.bat haette stattdessen bei null angefangen und
alles bisherige verworfen.

Neu ist deshalb **GitHub-Verbinden.bat** (mit github_verbinden.js). Es
tut vier Dinge und zeigt sie vorher an:

    1. Repository anlegen        git init
    2. Adresse eintragen         git remote add origin ...
    3. Stand von GitHub holen    git fetch
    4. Zeiger daraufsetzen       git reset --mixed origin/main

Schritt 4 ist der heikle - und deshalb ausdruecklich `--mixed`, die
Vorgabe: Sie setzt Zeiger und Merkliste, laesst die Arbeitsdateien aber
unberuehrt. `--hard` haette an derselben Stelle jede Datei ueberschrieben,
die hier neuer ist als bei GitHub - also genau die Arbeit der letzten
Tage. Es wird nichts geloescht, nichts hochgeladen, und ein vorhandenes
`.git` wird gar nicht erst angefasst.

Danach zeigt es, was hier vom Stand bei GitHub abweicht, und verweist auf
GitHub-Pruefen.bat und Hochladen.bat.

**Das Werkzeug selbst gehoert nicht ins Repository.** Es steht in der
.gitignore, in der RAUS-Liste von GitHub-Ausmisten.bat und in der
Schutzliste von hochladen.js - an allen drei Stellen, damit ein Versehen
an einer Stelle von den anderen beiden aufgefangen wird.

## 28.08.2026 - 19 Dateien standen zum Loeschen bereit

Direkt nach dem Verbinden stand in der Liste:

    25 Datei(en) weichen vom Stand bei GitHub ab:
       M .gitignore
       M CHANGELOG.md
       D DNS-Auffrischen.bat
       D Programm-Aktualisieren.bat
       D README.txt
       D START_MIT_TUNNEL.bat
       M Server.js
       D bilder/01-hauptansicht.png
       ...

Und darunter von mir: "Das ist zu erwarten - hier liegt Neueres als dort."

**Das war die Halbwahrheit des Tages.** Die `M`-Zeilen waren zu erwarten.
Die `D`-Zeilen nicht - `D` heisst geloescht, und beim Hochladen wird eine
Loeschung mitgeschickt wie jede andere Aenderung. 19 Dateien standen so zum
Verschwinden bereit, darunter der ganze Ordner `bilder\`, auf den die
README verweist. Die Startseite des Repositorys haette danach leere
Bildrahmen gezeigt.

**Warum sie fehlten:** Der Ordner ist mit USB-Stick-Erstellen.bat aus dem
ZIP entstanden, und das Werkzeug kopiert nach einer Positivliste. Ein
Lern-Stick braucht keine Bildschirmfotos, keine Tunnel-Werkzeuge und keine
Testdatei - das ist richtig so. Nur weiss git davon nichts: Was im
Repository steht und hier nicht liegt, ist fuer git geloescht. Zwei Ordner,
die absichtlich verschieden sind, und ein Werkzeug dazwischen, das
Gleichheit annimmt.

**Passiert ist am Ende nichts.** Hochladen.bat committet nicht von selbst,
sondern zeigt erst, was offen ist, und fragt "Jetzt mit aufnehmen? [j/n]".
Diese Frage war die Bremse: Die Loeschungen wurden nie committet und damit
auch nie hochgeladen. Bei GitHub stand die ganze Zeit alles unveraendert.

Das ist Glueck mit System - genau dafuer ist die Frage da -, aber Glueck
bleibt es. Zwei Dinge sind deshalb neu:

**Zurueckholen.bat** (mit zurueckholen.js) holt zurueck, was bei GitHub
liegt und hier fehlt. Es deckt beide Faelle ab: noch nicht hochgeladen
(die Datei steht in der Merkliste) und schon hochgeladen (sie steht in der
Historie, und dann kommt sie aus dem Commit DAVOR zurueck). Dateien, die
spaeter wieder hinzugefuegt wurden, laesst es in Ruhe - sonst wuerde es
Absichten ausgraben, die laengst erledigt sind. Geschrieben wird
ausschliesslich, was gerade fehlt; ueberschreiben kann es damit gar nichts.

Im Ernstfall lief es sauber durch:

    19 von 19 Datei(en) sind wieder da.

**GitHub-Verbinden.bat trennt `D` und `M`.** Loeschungen stehen jetzt in
einem eigenen Block mit Warnung und dem Hinweis auf Zurueckholen.bat -
nicht mehr unter einem gemeinsamen "das ist zu erwarten".

**Merkposten fuer mich:** Ich habe eine Liste ausgegeben und im selben
Atemzug beruhigt, ohne die Buchstaben davor gelesen zu haben. `D` und `M`
sehen in einer Liste gleich harmlos aus und bedeuten das Gegenteil
voneinander. Wer beruhigt, muss vorher hingesehen haben.

## 28.08.2026 - "Loslegen" beschrieb noch den umstaendlichen Weg

Dietmar: "Das kann auch entfernt oder bearbeitet werden. Wir haben jetzt
USB Stick erstellen.bat."

Im Abschnitt "Loslegen" der README stand noch:

    Voraussetzung ist Node.js (kostenlos)
    git clone ...
    cd Amateurfunk-Trainer
    npm install

Drei Zeilen Kommandozeile und eine Voraussetzung - fuer ein Programm,
dessen ganzer Sinn inzwischen ist, dass man **nichts** installieren muss.
START.bat holt Node.js seit gestern selbst in den Ordner `node\` und ruft
`npm install` von sich aus auf. Die Anleitung beschrieb also Handgriffe,
die das Programm laengst selbst macht - und schreckte genau die Leute ab,
fuer die der Trainer gedacht ist.

Jetzt stehen dort zwei Schritte: ZIP herunterladen, START.bat anklicken.
Der git-Weg bleibt als Nebensatz fuer die, die ihn wollen. Dazu ein
Verweis auf den USB-Abschnitt und eine ehrliche Zeile darueber, dass
getestet ist unter Windows und der Rest nur wahrscheinlich geht.

## 28.08.2026 - Der Umweg ueber ein Release ist aufgegeben

Nach dem Hochladen stand jedes Mal derselbe Vorschlag im Fenster:

    Jetzt noch die Stimmen: Stimmen_packen.bat ausfuehren,
    dann auf der Seite "Releases" -> "Create a new release",
    Tag v1.0, und Piper-Stimmen.zip ins Feld ziehen.

Dietmar: "Stimmen-packen und Piper-Stimmen kann raus. Das verleidet nur
dazu Bloedsinn zu machen."

**Er hat recht, und der Grund ist aelter als der Satz.** Der Gedanke war
gut, als er entstand: Die Stimmen sind rund 470 MB, GitHub nimmt keine
Datei ueber 100 MiB ins Repository, aber an ein Release darf man 2 GiB
haengen. Also einmal packen, einmal anhaengen, fertig.

Inzwischen holen piper.bat und USB-Stick-Erstellen.bat die Stimmen selbst
- direkt bei Piper und in der Fassung, die gerade gilt. Damit ist der
Release-Anhang kein Weg mehr, sondern ein zweiter Ablageort, der von Hand
gepflegt werden muesste und sonst veraltet. Und ein 470-MB-ZIP im
Hauptordner ist eine stehende Einladung, es doch irgendwohin zu schieben -
ausgerechnet in den Ordner, aus dem hochgeladen wird.

Geaendert:

- **hochladen.js** schweigt nach dem Hochladen. Kein Vorschlag mehr, kein
  Release, kein Tag v1.0. Die Abbruchbedingung fuer Dateien ueber 100 MiB
  bleibt selbstverstaendlich - sie nennt nur kein Release mehr als
  Ausweg.
- **aufraeumen.js** stuft `Stimmen_packen.bat`, `stimmen_packen.js` und
  `Piper-Stimmen.zip` als raeumbar ein. Sie standen bisher in der
  NIEMALS-Liste. Aufraeumen.bat loescht nichts, es verschiebt nach
  `_Aufgeraeumt_<Datum>` - falls sie doch noch gebraucht werden, liegen
  sie da.
- **.gitignore** behaelt die Zeile `Piper-Stimmen.zip`. Der Weg ist
  aufgegeben, die Falle nicht: Liegt das ZIP doch noch irgendwo, darf es
  auf keinen Fall mitcommittet werden. GitHub weist eine zu grosse Datei
  erst zurueck, NACHDEM alles uebertragen wurde.

Die frueheren Begruendungen im Code sind stehengeblieben und um das Datum
ergaenzt. Wer in einem halben Jahr liest "haengt am Release v1.0", soll
daneben finden, warum das nicht mehr stimmt.

## 28.08.2026 - Der feste Platz auf dem Rechner fehlte in der README

Dietmar: "Hier fehlt meiner Meinung noch etwas. Das der Trainer in einem
Ordner unter C:\Program Files verschoben werden kann und mit
Verknuepfung-Erstellen.bat ein Start Icon erstellt werden kann."

Er hat recht: Die Werkzeuge dafuer liegen seit gestern im Repository -
Verknuepfung-Erstellen.bat, verknuepfung.ps1, icon.ico -, aber die README
erwaehnte sie mit keinem Wort. Wer sie nicht kennt, findet sie auch nicht.

Neuer Abschnitt **"Fest auf dem eigenen Rechner - mit Symbol auf dem
Desktop"**, samt Bild (bilder/11-verknuepfung.png): oben die Ausgabe des
Werkzeugs, darunter die Verknuepfung, wie sie danach auf dem Desktop liegt,
mit dem echten Funkgeraet-Symbol aus icon.png.

Zwei Punkte darin sind wichtiger als der Rest:

**Der Lernstand zieht mit.** Er liegt in `data\` im Trainer-Ordner, nicht
irgendwo in Windows. Wer den Ordner verschiebt, verschiebt ihn mit. Das
muss dastehen, sonst traut sich niemand, den Ordner anzufassen.

**C:\Program Files ist nicht bedingungslos zu empfehlen.** Bei Dietmar
funktioniert es - der Lernstand wird dort geschrieben, nachgesehen und
bestaetigt. Das liegt daran, dass er den Ordner selbst angelegt hat und
damit Eigentuemer ist. Auf einem Rechner, wo das anders ist, kann der
Trainer dort nicht schreiben, und der Fortschritt ist nach dem Schliessen
weg. In der README steht deshalb beides: ein Ordner im Benutzerkonto als
einfachster Weg, Program Files als moeglich, mit dem Hinweis, woran man ein
Rechteproblem sofort erkennt.

Bei der Gelegenheit die Reihenfolge geradegezogen: "Loslegen" stand bisher
HINTER dem USB-Abschnitt. Jetzt kommt erst das Starten, dann das feste
Einrichten, dann das Weitergeben.

## 28.08.2026 - Der Updater fragt nicht mehr, was man anhaken will

Dietmar: "Der Updater gefaellt mir so nicht. Hier ballert man sich schnell
was kaputt wenn man alles auswaehlt. Der Updater soll melden das es ein
Update gibt. Installieren oder verwerfen."

Und nach dem ersten Umbau, der noch zu viel zeigte: "Nein, das gefaellt mir
nicht. Ich wuensche ein kleines Fenster ohne Code und dergleichen. Update
vorhanden mit Github Icon und ein Button aktualisieren und spaeter."

**Zweimal recht gehabt, und beim zweiten Mal deutlicher als beim ersten.**

Die Kaestchen waren der offensichtliche Fehler. Eine Liste mit Kaestchen
SIEHT nach freier Auswahl aus, aber an den Dateinamen kann niemand ablesen,
welche Kombination heil ist: Server.js ohne github_update.js zum Beispiel
ist keine. Wer waehlen darf, waehlt irgendwann falsch - und merkt es erst,
wenn der Trainer nicht mehr startet. Ich hatte eine Entscheidung angeboten,
fuer die es keine Entscheidungsgrundlage gibt.

Der zweite Fehler war meiner allein: Ich hatte die Kaestchen weggenommen,
aber alles andere stehenlassen - Dateinamen, Byte-Zahlen, Quellenangabe,
Sicherungspfade. Das sah nach Sorgfalt aus und war doch nur Ausstattung.
"video_map_embed.js, 211892 Bytes" hilft bei der Frage, die hier ansteht,
kein Stueck weiter. Es macht nur unsicher.

**Was jetzt beim Start passiert:** nichts Sichtbares. Kein Fenster, kein
Balken. Der Info-Knopf oben rechts wird zum Update-Knopf - anderer Name,
andere Farbe, blinkend - und einmal spielt sounds/update.mp3.

**Was ein Klick darauf oeffnet:**

    +--------------------------------------+
    |  [GitHub]  Update vorhanden      [x] |
    |                                      |
    |  Fuer den Amateurfunk-Trainer liegt  |
    |  eine neuere Fassung bereit.         |
    |                                      |
    |  [ Aktualisieren ]   [ Spaeter ]     |
    +--------------------------------------+

Mehr nicht. Das Fenster schwebt wie alle anderen ueber der Hauptansicht,
der Hintergrund ist weichgezeichnet. Von 660 auf 430 Pixel geschrumpft.

Weitere Aenderungen:

- **Keine Rueckfrage mehr bei Programmdateien.** Frueher kam nach dem Klick
  ein confirm(). Eine zweite Frage auf dieselbe Entscheidung erzieht nur
  zum Wegklicken.
- **Nach dem Aktualisieren wird der ganze Fensterinhalt ersetzt**, nicht
  etwas darunter gehaengt. Sonst stehen die Knoepfe noch da, waehrend
  darunter schon "Fertig" steht - und man fragt sich, ob man noch einmal
  klicken muss. Uebrig bleibt ein Satz: "Fertig. Der Trainer ist auf dem
  neuesten Stand." Und, wenn noetig: "Bitte den Trainer einmal neu
  starten."
- **Der Ton kommt einmal.** Browser lassen Ton erst zu, wenn jemand die
  Seite angefasst hat; beim Start ist das nicht der Fall, und play() wird
  abgelehnt. Statt den Ton dann stumm ausfallen zu lassen, wird er beim
  ersten Klick oder Tastendruck nachgeholt - und nur dieses eine Mal.
  Nachgemessen: ohne Geste 0 Wiedergaben, nach dem ersten Klick 1.
- **Blinken mit Ruecksicht.** Wer im Betriebssystem "Bewegung reduzieren"
  eingestellt hat, bekommt statt des Pulsierens einen ruhigen Rahmen.
  Blinkende Bewegung ist fuer manche Menschen ein echtes Problem, nicht
  nur Geschmackssache.
- **"Spaeter" merkt sich nichts.** Frueher wurde der gezeigte Commit in den
  localStorage geschrieben und derselbe Stand nie wieder angeboten. Jetzt
  meldet es sich bei jedem Start wieder, bis aktualisiert wurde.

Unveraendert geblieben ist die Regel, auf die es ankommt: **Was hier neuer
ist als bei GitHub, wird nie angefasst.** Der Trainer merkt sich, wie jede
Datei aussah, als sie zuletzt mit GitHub gleich war - ein Fingerabdruck
sagt nur, DASS zwei Dateien verschieden sind, nicht welche die neuere ist.
Alte Fassungen wandern weiter nach backup/, der Lernstand in data/ wird nie
angefasst. Das steht jetzt in der README statt in jedem Fenster.

Ersatzlos entfallen: der Balken (githubHinweisZeigen), die Pruefung "passt
der Moment gerade?" (githubMomentPasst, githubAnderesFensterOffen), der
Schalter "nicht mehr von selbst fragen" samt seinen beiden
localStorage-Schluesseln, die Kaestchen-Ansicht und die Dateiliste.
Rund 190 Zeilen weniger.

Geprueft im Browser gegen einen nachgebauten Server: Knopf wird zu
"Update" und blinkt, Ton genau einmal, "Spaeter" gibt den Info-Knopf
zurueck und das Info-Fenster geht danach weiter auf, "Aktualisieren"
schickt alle Dateien mit programmBestaetigt und zeigt die
Neustart-Meldung. Keine Javascript-Fehler.

Neues Bild bilder/08-updater.png: oben der blinkende Knopf in der echten
Kopfzeile, darunter das Fenster, wie es ueber der weichgezeichneten
Hauptansicht schwebt.

## 28.08.2026 - Ein Probelauf fuer die Update-Meldung

Dietmar: "Schreibe mir eine Bat Datei zum testen, das ein Update vorhanden
ist. Das darf nicht mit auf GitHub!"

Der Anlass ist berechtigt: Ein echtes Update gibt es selten. Wenn es dann
eines gibt, will man nicht in dem Moment herausfinden, ob die Meldung
ueberhaupt funktioniert - ob der Knopf wechselt, ob der Ton kommt, ob das
Fenster aufgeht.

**Update-Test.bat** legt `update_test.json` an. Der Trainer sieht die
Datei und tut so, als laege ein Update bereit: Der Knopf wird zum
blinkenden Update-Knopf, der Ton spielt einmal, das Fenster geht auf.

**Geholt wird nichts, geschrieben wird nichts.** Im Probelauf ruft die
Seite den Server ueberhaupt nicht auf - weder zum Nachsehen noch zum
Holen. Klein unter den Knoepfen steht "Probelauf - es wird nichts geholt
und nichts geschrieben", damit beim Vorfuehren niemand den Probelauf fuer
den Ernstfall haelt.

Drei Dinge waren dabei zu loesen:

**Der Trainer laeuft schon.** Die Nachschau lief bisher genau einmal,
sechs Sekunden nach dem Laden. Eine Datei, die danach entsteht, haette
niemand bemerkt. Die Seite sieht jetzt alle fuenf Sekunden noch einmal
nach - aber nur, solange der Knopf noch nicht umgesprungen ist; danach
hoert sie auf. Das ist eine Anfrage an den eigenen Rechner, keine an
GitHub, und sie bringt auch im Ernstfall etwas: Erfaehrt der Server erst
spaeter von einem Update, muss man den Trainer nicht mehr neu starten,
damit es ankommt.

**Der Knopf durfte nicht endlos wieder aufblinken.** Wer im Probelauf auf
"Spaeter" klickt, will Ruhe haben - die Datei liegt aber noch da. Deshalb
schreibt die .bat bei jedem Durchlauf einen frischen Zeitstempel hinein,
und die Seite meldet sich nur bei einem NEUEN Stempel. Ohne das kaeme man
aus dem Fenster nicht mehr heraus.

**Die Sicherheits-Whitelist.** Server.js gibt seit K1 nur nach Positivliste
aus. `update_test.json` stand nicht darin - und weil die Datei ja
tatsaechlich existiert, haette jeder Blick darauf eine Warnung
"[SEC] Zugriff auf nicht freigegebene Datei blockiert" ins Serverfenster
geschrieben, alle fuenf Sekunden. Der Eintrag steht jetzt in PUBLIC_FILES,
mit Begruendung. Die Datei enthaelt einen Zeitstempel, sonst nichts.

Die .bat fragt am Ende, ob der Probelauf wieder weg soll, und loescht die
Datei dann selbst. Bleibt sie liegen, meldet sich der Trainer bei jedem
Start erneut - das steht auch so im Fenster.

**Nicht ins Repository:** Update-Test.bat und update_test.json stehen in
der .gitignore, in der RAUS-Liste von GitHub-Ausmisten.bat und in der
Schutzliste von hochladen.js. Bei jemand anderem waere eine Update-Meldung,
die keine ist, schlicht eine Luege.

Der Programmteil in Index.html geht dagegen mit zu GitHub. Ohne die Datei
ist er untaetig - das ist ehrlicher, als ihn beim Hochladen jedes Mal
herauszuschneiden.

Gemessen: Knopf wechselt 3,0 Sekunden nach dem Anlegen der Datei, Ton genau
einmal, "Aktualisieren" schickt keinen einzigen Aufruf an den Server, und
sieben Sekunden nach dem Schliessen blinkt nichts mehr. Der echte Weg
laeuft unveraendert weiter.

## 28.08.2026 - Das Video vom USB-Stick in der README

Dietmar hat ein Video aufgenommen, das den ganzen Vorgang zeigt:
"Amateurfunk-Trainer-Installation auf USB-Stick".

Es steht jetzt im USB-Abschnitt der README, direkt hinter den drei
Schritten - als anklickbares Vorschaubild und zusaetzlich als Textlink.
GitHub bettet keine Videos ein; ein Vorschaubild, das zu YouTube fuehrt,
ist der Weg, der ueberall funktioniert.

Die Stelle ist mit Bedacht gewaehlt: Wer bis dorthin gelesen hat, weiss,
worum es geht, und entscheidet dann, ob er es lieber sieht als liest. Ganz
oben haette es die Leute vertrieben, die einfach nur die drei Schritte
gebraucht haetten.

## 28.08.2026 - Zwei Fenster waren eines zu viel

Dietmar: "Die 2 Terminal die sich bei start.bat oeffnen sollen im
Hintergrund minimiert laufen. Evtl bekommt man das auch so hin, das nur ein
Terminal sich oeffnet."

Man bekommt es hin. Beides.

**Das zweite Fenster ist ersatzlos weg.** In START.bat stand diese Zeile:

    start "" cmd /c "for /l %%i in (1,1,20) do (curl -s -o nul
    http://localhost:3000 && start http://localhost:3000 && exit /b)
    || timeout /t 1 /nobreak >nul"

Sie machte ein eigenes Fenster auf und fragte darin bis zu zwanzig Sekunden
lang im Sekundentakt per curl, ob der Server schon antwortet - um dann den
Browser zu oeffnen. Ein ganzes Fenster, nur um eine Frage zu stellen, die an
einer anderen Stelle gar nicht erst entsteht: Wenn `server.listen()`
zurueckmeldet, IST der Server bereit. Kein Warten, kein Pollen, kein Fenster.

Das macht jetzt **Server.js** selbst, in `browserOeffnen()`, gleich als
erstes im listen-Rueckruf - und nur, wenn `AFU_BROWSER=1` gesetzt ist.
Dieselbe Regel wie beim Tunnel (Fix K2): "node Server.js" von Hand reisst
niemandem ungefragt einen Browser auf; START.bat setzt die Variable, sonst
niemand.

Beim Bauen zwei Stolperstellen mitgenommen:

- `start` ist ein eingebauter Befehl der Eingabeaufforderung, kein Programm.
  Es geht nur ueber `cmd /c`. Und der leere Parameter davor ist noetig: Ohne
  ihn haelt `start` eine Adresse in Anfuehrungszeichen fuer den Fenstertitel
  und oeffnet gar nichts.
- Ein Kindprozess, der sich nicht starten laesst, meldet das per
  'error'-Ereignis. Hoert dort niemand zu, wirft Node die Ausnahme in die
  Ereignisschleife - und der Server waere wegen eines nicht geoeffneten
  Browsers beendet gewesen. Jeder Versuch bekommt jetzt einen Zuhoerer.
  Nachgestellt mit einem absichtlich falschen Befehlsnamen: ENOENT wird
  gemeldet, der Prozess laeuft weiter.

**Das verbleibende Fenster legt sich selbst in die Taskleiste.** START.bat
startet sich dafuer einmal neu, minimiert, und gibt sich das Wort
"minimiert" mit - beim zweiten Durchlauf wird der Block uebersprungen. Ohne
dieses Merkwort startete sie sich endlos neu.

**Aber nicht beim ersten Mal.** Fehlt Node oder fehlen die Bausteine, laedt
START.bat erst einmal einige Minuten lang nach. Ein minimiertes Fenster
waere da genau falsch: Man sieht nichts, haelt den Trainer fuer kaputt und
klickt noch dreimal. Minimiert wird deshalb nur, wenn `node_modules\\express`
und Node schon da sind - also ab dem zweiten Start, und beim USB-Stick ab
dem ersten, weil dort alles mitkommt.

**Die Desktop-Verknuepfung startet gleich minimiert** (WindowStyle 7).
Sonst blitzte trotzdem kurz ein Fenster auf, weil das erste sich ja erst
starten muss, um sich zu verkleinern.

**START_MIT_TUNNEL.bat** verliert ebenfalls das zweite Fenster, bleibt aber
sichtbar. Wer den Rechner ins oeffentliche Netz stellt, soll sehen, was
dabei passiert - das ist kein Fall fuer die Taskleiste.

**Nebenbei repariert:** Beim ersten Anlauf hatte ich den neuen Block mit
Unix-Zeilenenden in zwei Dateien geschrieben, die sonst durchgehend
Windows-Zeilenenden haben. Eine .bat mit gemischten Zeilenenden ist eine
Falle - besonders bei goto-Marken, die dann ins Leere zeigen koennen. Beide
Dateien sind jetzt geprueft durchgehend CRLF.

## 28.08.2026 - "Ich habe mich erschrocken das ich gehackt werde"

Dietmar, nachdem Teilnehmer seinem Gruppenraum beigetreten waren:

    [SEC] Externer Zugriff blockiert: GET /api/userdata von 47.64.50.123

Mehrfach, bei jedem Beitritt, samt vollstaendiger IP-Adresse.

**Das war meine Meldung, und sie war falsch gebaut.** Was dort geschah,
war der Normalfall: Ein Gast bekommt dieselbe Seite wie der Gastgeber,
also fragt sein Browser auch nach dem Lernstand - und bekommt zu Recht ein
Nein. Der Schutz (Fix K3) tat genau seine Arbeit. Nur klang die Meldung
nach Angriff. "[SEC]", "blockiert", eine fremde IP-Adresse: Wer das liest,
denkt an einen Einbruch und nicht an eine Tuer, die planmaessig zu ist.

Eine Sicherheitsmeldung, die bei jedem regulaeren Vorgang anschlaegt, ist
keine Sicherheitsmeldung. Sie erschreckt beim ersten Mal, wird beim
zehnten ueberlesen - und beim hundertsten uebersieht man daneben die eine,
auf die es angekommen waere.

Drei Aenderungen, alle drei von Dietmar angestossen:

**1. Die Schreckmeldung ist weg.** Anfragen, die der Browser eines Gastes
regulaer stellt (`/api/userdata`, `/api/abgleich/`, `/api/github/`,
`/api/tunnel-status`), werden weiter abgewiesen - aber lautlos. Nur was
wirklich ungewoehnlich ist, kommt noch ins Fenster, und dann in ruhigem
Ton:

    [GRUPPENRAUM] Nur am Trainer-PC moeglich: /api/start-tunnel
                  - angefragt von 47.64.50.XXX

Kein "[SEC]", kein "blockiert". Am Schutz selbst hat sich nichts geaendert;
nur daran, wie er darueber spricht.

**2. IP-Adressen werden gekuerzt.** Aus `47.64.50.123` wird
`47.64.50.XXX`. Bei IPv6 bleiben die ersten vier Bloecke stehen. Eine
vollstaendige IP-Adresse ist ein personenbezogenes Datum, und im
Trainerfenster steht sie ohne jeden Nutzen: Wer sehen will, welcher
Rechner sich meldet, erkennt das an den ersten drei Bloecken genauso gut.
Die Kuerzung gilt ueberall, wo eine Adresse ausgegeben wird - auch beim
Paket-Download.

**3. Entfernen bekommt die Option "sperren".** Dietmar: "Blockieren wird
benoetigt, wenn einer meiner Benutzer das mit jemand mir unbekannten den
Link teilt."

Ohne Sperre war Entfernen wirkungslos: Der Einladungslink ist ja weiter
gueltig, der Betreffende klickt ihn einfach wieder an. Im Fenster
"Teilnehmer entfernen?" steht deshalb jetzt ein Haekchen **"Zusaetzlich
sperren"**.

**Gesperrt wird nur, wer aus dem Internet kommt.** Dietmar, nachdem er
den ersten Entwurf gesehen hatte: "blockieren nur bei einer oeffentlichen
IP Adresse, nicht local im WLAN." Richtig, und aus zwei Gruenden:

  Die Sperre ist fuer den Fall gedacht, dass jemand den Einladungslink
  weitergegeben hat - der Unbekannte kommt dann ueber den Tunnel, also
  mit einer oeffentlichen Adresse. Wer im selben WLAN sitzt, ist dagegen
  im Raum nebenan: der Ortsverband, die VHS-Gruppe. Da klaert man das
  durch Hinsehen.

  Und Adressen im eigenen Netz vergibt der Router immer wieder neu. Die
  192.168.1.42 von heute Nachmittag kann morgen frueh ein anderes Geraet
  sein. Eine Sperre darauf traefe irgendwann den Falschen - und niemand
  kaeme darauf, warum.

Nicht gesperrt wird deshalb auf 10.x, 172.16-31.x, 192.168.x, 169.254.x,
127.x sowie fc00::/7 und fe80::/10. Nachgemessen mit 18 Faellen, auch den
Grenzfaellen 172.15 und 172.32, die beide oeffentlich sind und es auch
bleiben muessen.

Vier weitere Entscheidungen dahinter, die ich nicht anders treffen wuerde:

- **Ein Haekchen, kein zweiter Knopf.** Zwei rote Knoepfe nebeneinander,
  die fast dasselbe tun, sind eine Einladung zum Vergreifen. Das Haekchen
  muss man setzen und sieht dabei, was es bedeutet. Standard ist AUS:
  Entfernen ist der haeufige Fall, Sperren der seltene.
- **Gesperrt wird die Adresse, nicht der Name.** Ein Name ist in zwei
  Sekunden geaendert.
- **Die Adressen bleiben auf dem Server.** `room.users` geht bei jedem
  `roomUpdate` an ALLE im Raum - eine Adresse darin waere fuer jeden
  Teilnehmer sichtbar gewesen. Sie liegen deshalb daneben, in
  `room.ipsVonTeilnehmern`, und verlassen den Server nie: Der Gastgeber
  sieht nach dem Sperren nur die gekuerzte Fassung.
- **Wer gesperrt wird, fliegt mit allen Fenstern.** Sonst waere die Sperre
  eine Sperre gegen das Neuladen und gegen sonst nichts.

Die Sperre gilt fuer DIESEN Raum und lebt, solange er lebt. Das ist
Absicht: Eine Liste gesperrter Adressen, die einen Neustart ueberdauert,
waere eine dauerhaft gespeicherte Personenliste - dafuer gibt es hier
keinen Grund. Wer sich versehentlich selbst ausgesperrt hat, macht den
Raum neu.

Und wenn Sperren nicht geht, sagt es das - mit Begruendung. Aus dem
eigenen WLAN: "entfernt, gesperrt wurde nicht, hier wird bewusst nicht
gesperrt". Keine verwertbare Adresse: "entfernt, er kann wiederkommen".
Kein vorgetaeuschter Erfolg.

**Die groesste Falle steckte woanders**, und sie waere erst bei Dietmar
aufgefallen: cloudflared verbindet sich SELBST nach localhost. Fuer jeden
Gast aus dem Tunnel steht als Adresse zunaechst 127.0.0.1 da, die echte
nur im Kopf cf-connecting-ip. Haette der einmal gefehlt, waere beim
Sperren 127.0.0.1 in die Liste gewandert - und damit jeder Gast draussen
gewesen, der Gastgeber eingeschlossen, denn sein eigener Browser kommt
auch von dort. Ein Klick, und der Raum ist tot, ohne dass jemand
versteht warum. Auf den eigenen Rechner wird jetzt nie gesperrt.

Geprueft mit einem echten Server und mehreren Teilnehmern, 14 Punkte:
entfernen ohne Sperre (kommt wieder herein), mit Sperre (kommt nicht
wieder, auch nicht unter anderem Namen), zweites Fenster desselben
Anschlusses fliegt mit, ein Unbeteiligter von anderer Adresse bleibt
unberuehrt, WLAN-Gast wird nur entfernt und kommt wieder herein, der
Gastgeber sperrt sich nicht selbst aus, und in keinem roomUpdate steht
eine IP-Adresse. Dazu das Fenster im Browser: Haekchen da, Standard aus,
beim Klick richtig gelesen.

**Nebenbei zwei eigene Fehler gefunden und behoben.** Erstens kuerzte
ipKuerzen auch 127.0.0.1 zu 127.0.0.XXX - unnoetig verschleiert, man sah
nicht mehr, dass die Anfrage vom Trainer-PC selbst kam. Zweitens meldete
das Protokoll "entfernt und gesperrt", wenn Sperren nur GEWOLLT, aber
nicht moeglich war. Ein Protokoll, das etwas anderes behauptet als der
Server getan hat, ist schlimmer als gar keins.

## 29.08.2026 - Die Formelsammlung steht jetzt an der Frage

Dietmar: "ist es moeglich das wir von der Formelsammlung.pdf die Formeln
extrahieren und in Fragen die dafuer geeignet sind, einen Hinweis bei
Fragen in Form von einem Blatt geben?" Und, nach dem ersten Entwurf: "Es
gibt da auch einen Frequenzplan mit Sendeleistung. Das hilft auch bei
vielen Fragen. Es soll alles uebernommen werden. Bei einer Frage wo die
Formelsammlung hilft, es bei Fragen einen Button gibt der einen darauf
hinweist. Mit einem klick, oeffnet sich die Stelle in der Formelsammlung.
Ideal waere mit einer Markierung."

Genau so ist es geworden.

**Warum das ueberhaupt richtig ist:** In der Pruefung wird die
Formelsammlung ausgehaendigt. Sie ist amtliches Hilfsmittel - das steht
auf dem Deckblatt: "Amateurfunkpruefungen, Hilfsmittel, BNetzA". Wer beim
Ueben ohne sie rechnet, uebt schwerer als die Pruefung ist. Deshalb ist
der Knopf auch im Pruefungssimulator da.

**Die Huerde war das PDF.** Es benutzt Sonderschriften mit eigener
Zeichenzuordnung. Aus "Nutzungsbedingungen" wird beim Auslesen
I"/0"'9*-)(>'9"'9)' - unbrauchbar. Abtippen waere bei zehn Seiten Formeln
eine ernsthafte Fehlerquelle gewesen: Eine falsch abgeschriebene Formel
merkt niemand, bis jemand danach rechnet und durchfaellt.

Ein Teil liess sich aber knacken. Die UEBERSCHRIFTEN stehen in einer
eigenen Schrift, deren Zuordnung sich aus bekannten Woertern
rekonstruieren laesst: Wenn "8F?@PQS<K?@" gleich "Widerstände" ist, dann
ist 8=W, F=i, ?=d, @=e - und die Probe an "Leistung", "Induktivität" und
"Reihenschaltung" bestaetigt es. Damit stand der Index: **96 Abschnitte
mit Seite, Spalte und Position auf den Punkt genau**, automatisch
ermittelt statt von Hand abgemessen.

**Gezeigt wird das Blatt selbst**, als Bild - 20 Seiten, zusammen 3,6 MB.
Nicht abgetippt: So steht dort, was in der Pruefung auch auf dem Tisch
liegt.

**Die Markierung** macht die Seite sichtbar und dunkelt alles ausserhalb
der Stelle ab. Technisch ein einziger Schatten mit 9999 Pixeln Radius um
den Rahmen - vier Rechtecke drumherum waeren dasselbe mit mehr Aufwand.
Das Fenster springt beim Oeffnen gleich zur markierten Stelle. Bloss den
Ausschnitt zu zeigen waere weniger wert: Man soll sehen, WO im Blatt man
ist, nicht nur was dort steht. In der Pruefung muss man die Stelle
schliesslich auch finden.

**Uebernommen ist alles**, wie gewuenscht: Formelsammlung, IARU-Bandplaene
und die Tabellen mit Frequenzbereichen und zulaessigen Sendeleistungen.

**Die Zuordnung Frage -> Stelle** entsteht aus rund 70 Regeln ueber
Fragentext und Antworten. 480 der 1750 Fragen haben jetzt einen Hinweis.

**Ein Fehler dabei, gefunden beim Nachsehen im Browser:** Die Frage NB201
- "Welches Bauteil wird durch das Schaltzeichen symbolisiert?" - bekam das
Ohmsche Gesetz angeheftet. Grund: Unter den vier Antworten steht
"Widerstand", und meine Regel suchte auch in den Antworten. Eine Hilfe fuer
eine Aufgabe, bei der nichts zu rechnen ist.

Die Regeln arbeiten seither auf zwei Stufen. Eindeutige Begriffe (Carson,
MUF, Stehwellenverhaeltnis) duerfen weiter ueberall suchen. Alltagswoerter
(Widerstand, Leistung, Frequenz) zaehlen nur, wenn sie in der FRAGE stehen
und dort auch wirklich gerechnet wird - erkennbar an einer Zahl mit
Einheit, an "berechnen"/"wie gross", oder daran, dass mindestens drei der
vier Antworten Zahlen mit Einheit sind. Aus 709 Zuordnungen wurden 480,
und NB201 hat keinen Knopf mehr.

Geprueft im Browser gegen den laufenden Server: NB201 ohne Knopf, NB604
(12-V-Bordnetz) mit "Leistung", ND106 mit "Stehwellenverhaeltnis", BC204
mit dem IARU-Bandplan. Keine Javascript-Fehler.

Mitgeliefert wird es ueberall: formelhilfe.json und der Ordner
formelsammlung\\ stehen in der Paketliste von Server.js und in der des
USB-Werkzeugs, und in der Freigabeliste (PUBLIC_FILES/PUBLIC_DIRS) - sonst
zeigte der Knopf auf dem Stick und im Gruppenraum ins Leere.

**Was noch aussteht:** Die Zuordnung ist maschinell entstanden. Wo ein
Hinweis nicht passt oder fehlt, genuegt die Fragennummer - dann wird die
Regel nachgezogen.

## 01.09.2026 - Setup, Piper und CodeRabbit

Drei Auftraege, drei sehr verschiedene Befunde.

### 1. Der Piper-Fehler: expandTTS is not a function

    Piper Fehler: TypeError: expandTTS is not a function
        at C:\Program Files\Amateurfunk-Trainer\Server.js:...

**Ursache gefunden, und sie ist eindeutig.** Server.js holt sich in
Zeile 689:

    const { expandTTS } = require('./tts-expand');

expandTTS ist die Funktion, die aus "145,500 MHz" ein vorlesbares
"145,500 Megahertz" macht - 12 KB Regeln fuer Einheiten, Abkuerzungen und
Rufzeichen. Die Datei tts-expand.js wurde durch ein voellig anderes Modul
ersetzt: einen Piper-Starter mit der einzigen Funktion piperTTS, 2,8 KB,
unter dem Namen Tts-Expand.js. expandTTS gab es danach nicht mehr.

**Warum es niemandem auffiel:** Windows unterscheidet bei Dateinamen
keine Gross- und Kleinschreibung. require('./tts-expand') findet also
auch Tts-Expand.js. Das Modul wurde geladen - es enthielt nur die
falsche Funktion. Waere der Trainer unter Linux gelaufen, haette schon
das Laden mit "Cannot find module" abgebrochen, und die Ursache haette
auf der Hand gelegen.

**Nachgesehen:** piperTTS wird nirgends aufgerufen - weder in Server.js
noch in hoerbuch.js. Die Sprachausgabe laeuft ueber die Route /api/tts,
die Piper selbst startet. Das neue Modul war also von Anfang an tot und
hat dabei ein lebendes ersetzt.

**Behoben:** Der vollstaendige alte Inhalt ist wieder da. piperTTS bleibt
erhalten und wird mit exportiert, damit nichts verlorengeht:

    module.exports = { expandTTS, piperTTS };

Nachgemessen: "2 m, 70 cm, 145,500 MHz, 750 W ERP, 50 Ohm, SWR 1:1" wird
zu "2 Meter, 70 Zentimeter, 145,500 Megahertz, 750 Watt Effektive
Strahlungsleistung, 50 Ohm, Stehwellenverhaeltnis 1:1".

### 2. installer.iss - alle 40 Quellpfade waren absolut

Jede einzelne Zeile zeigte nach `C:\Temp\TrainerMSI\Source\...` - einem
Ordner, den es nicht mehr gibt. Genau daher kam "START.vbs wurde nicht
gefunden": Das Setup nahm die Datei nie mit.

Alle 40 Quellangaben sind jetzt **relativ** zum Ordner der .iss. Damit
ist ausgeschlossen, dass jemals wieder ein fremder Ordner gebaut wird.

Weitere Befunde bei der Durchsicht:

- **`data\*` wurde mit ausgeliefert.** Darin liegt der Lernstand - der
  eigene. Jede Installation haette fremde Antwortverlaeufe mitgebracht.
  Raus. Der Ordner wird jetzt leer angelegt, der Trainer fuellt ihn beim
  ersten Start selbst.
- **video_embed.json ebenso.** Darin stehen Vornamen echter Menschen.
  Raus.
- **github_update.js fehlte.** Server.js braucht es (Zeile 1642) - der
  Updater war in jeder Installation kaputt. Ebenso fehlten
  update_pruefen.js, piper.bat, die beiden PDFs und die LICENSE. Die
  Lizenz muss jeder Kopie beiliegen, so steht es in der PolyForm
  Noncommercial 1.0.0 unter "Notices".
- **Schreibrechte:** Unter C:\Program Files darf ein normaler Benutzer
  nicht schreiben. data\, backup\, tts_cache\ und Hoerbuch\ bekommen
  jetzt users-modify - sonst waere der Lernstand nach jedem Schliessen
  weg.
- **Platzhalter ohne skipifsourcedoesntexist** brechen den Build ab,
  wenn nichts passt. Alle Ordner-Zeilen haben den Zusatz jetzt.
- **SetupIconFile ist wieder an.** Es war auskommentiert mit "removed to
  guarantee compile". Die Ursache lag woanders: icon.ico speicherte
  seine Bilder PNG-komprimiert, und daran scheitern manche
  Inno-Fassungen mit "Setup icon file is invalid". Die Datei ist neu
  gebaut - dasselbe Bild, alle acht Groessen von 16 bis 256, aber als
  klassisches DIB. Nachgesehen: keine PNG-Signatur mehr enthalten.

**Taskleiste**, wie gewuenscht:

    [Tasks]        desktopicon (angehakt) + taskbaricon (nicht angehakt)
    [Icons]        ...\User Pinned\TaskBar\Amateurfunk-Trainer
    [UninstallDelete]  loescht die .lnk wieder
    [Code]         legt den TaskBar-Ordner an, falls er fehlt

Die Desktop-Verknuepfung ist jetzt **vorangehakt** - vorher stand dort
`Flags: unchecked`, man musste sie also aktiv anfordern.

**Eine Ehrlichkeit dazu:** Seit Windows 10 laesst Microsoft das Anheften
an die Taskleiste nicht mehr durch Programme zu. Eine .lnk in den
TaskBar-Ordner zu legen, war frueher der Weg; heute erscheint sie dort
nicht mehr zuverlaessig. Der Haken ist da und legt die Verknuepfung an -
ob Windows sie anzeigt, entscheidet Windows. Deshalb ist er nicht
vorangehakt: Ein Haken, der oft nichts bewirkt, soll nicht der Standard
sein.

### 3. START_MIT_TUNNEL.vbs startete keinen Tunnel

Die Datei war Zeichen fuer Zeichen mit START.vbs identisch. Sie sah nur
so aus, als taete sie etwas anderes. Der Server erkennt den Wunsch an
`AFU_TUNNEL=1` - und genau die Zeile fehlte.

Beide VBS-Dateien sind neu:

- `AFU_TUNNEL=1` in START_MIT_TUNNEL.vbs, dort und nur dort.
- `AFU_BROWSER=1` in beiden. Vorher stand da ein starres
  `WScript.Sleep 1500` und danach ein blindes Oeffnen von
  localhost:3000. Beim ersten Start nach der Installation reicht
  anderthalb Sekunden oft nicht - der Browser kam vor dem Server und
  zeigte eine Fehlerseite. Jetzt macht der Server den Browser selbst
  auf, wenn er bereit ist.
- Fehlt node\node.exe, kommt eine Meldung statt gar nichts. Ein
  Programm, das per wscript startet, ist unsichtbar - ohne diese
  Abfrage passiert bei einem Fehler schlicht nichts, und niemand weiss
  warum.

### 4. CodeRabbit

**Es ist sauber - und es ist nichts, was man einbindet.** CodeRabbit ist
kein Paket und kein Import: Es ist eine GitHub-App, die
Pull-Requests liest. Die einzige Spur im Projekt ist `.coderabbit.yaml`,
und die gehoert genau dorthin - ins Repository, im Hauptverzeichnis.

Geprueft: package.json enthaelt keine CodeRabbit-Abhaengigkeit (nur cors,
express, socket.io - richtig so), Server.js und Index.html rufen nichts
davon auf. Es gibt also keinen Import, der funktionieren oder scheitern
koennte.

Die Datei selbst ist gueltiges YAML und sinnvoll eingestellt: deutsch,
"chill", keine erzwungenen Aenderungen. Ein Hinweis: Sie enthaelt
Anweisungen fuer `data/**` und `backup/**` - beides steht in der
.gitignore, CodeRabbit sieht diese Ordner also nie.

**Was noch fehlt, damit CodeRabbit ueberhaupt etwas tut:** Es meldet sich
nur bei Pull Requests. Wer wie bisher direkt auf main hochlaedt, wird
nie eine Rueckmeldung sehen.

### 5. Was zu GitHub geht

Neu in .gitignore und in der Schutzliste von hochladen.js:

    Amateurfunk-Trainer-*.exe   das fertige Setup, rund 200 MB
    Output/                     Inno-Ausgabeordner
    installer-MINIMAL.iss       Zwischenstand, kann geloescht werden
    check_json.py               kleines Hilfsskript

Ausdruecklich NICHT ausgeschlossen, weil sie hineingehoeren:
installer.iss und Build-DIREKT.bat (ohne die Bauanleitung kann niemand,
auch du selbst nicht, das Setup nachbauen), wizard.bmp und small.bmp
(zusammen 160 KB), icon.ico, icon.png und .coderabbit.yaml.

cloudflared.exe mit seinen 54 MB war schon vorher ausgeschlossen - ueber
`*.exe`. Fuers Bauen liegt sie im Ordner, ins Repository gehoert sie
nicht.

## 01.09.2026 - Zweite Runde: Symbol, Herausgeber, Piper, Pruefungssimulator

### Version 1.1.0

Dietmar: "Version 1.0.1 wird sind wesentlich weiter. Welche Version mit
eingebunden wird, ueberlasse ich dir."

**1.1.0.** Nicht 1.0.5: Seit 1.0.1 sind echte Funktionen dazugekommen -
das Formelblatt an der Frage, die Sperre im Gruppenraum, der neue
Updater, dieser Installer. Die zweite Stelle sagt "es kann mehr als
vorher", die dritte hiesse "es ist dasselbe, nur repariert".

Die Nummer steht genau EINMAL, als `#define AppVer`. Sie landet damit im
Dateinamen (Amateurfunk-Trainer-1.1.0.exe), in den Dateieigenschaften und
in "Apps & Features". package.json steht auf demselben Stand; nebenbei
ist dort das unsichtbare BOM am Dateianfang weggefallen, das bei jedem
Werkzeugwechsel eine Aenderung anzeigte, die keine war.

### Das Symbol in der EXE

`SetupIconFile=icon.ico` ist gesetzt - das Setup traegt das Funkgeraet.
War schon in der Fassung von heute Vormittag drin; zusammen mit dem neu
gebauten icon.ico (klassisches DIB statt PNG-komprimiert) kompiliert es
auch zuverlaessig.

### "Herausgeber: Unbekannt" - das laesst sich nicht einstellen

Hier muss ich klar sein: **Kein Eintrag in der .iss aendert das.**
AppPublisher, VersionInfoCompany und die uebrigen Felder fuellen den
Eigenschaften-Dialog der Datei. Was Windows in der blauen
Sicherheitsabfrage anzeigt, kommt ausschliesslich aus einer
**Code-Signatur**.

Wer dort "Dietmar Reh" lesen will, braucht ein Code-Signing-Zertifikat
einer anerkannten Stelle und signiert das fertige Setup damit
(SignTool.exe, oder in Inno ueber SignTool=). Ein selbst erstelltes
Zertifikat hilft nicht: Windows kennt es nicht und schreibt weiter
"Unbekannt" - es sei denn, es waere auf jedem Zielrechner als
vertrauenswuerdig eingetragen, was bei Fremden nicht geht.

Das ist nichts, was ich reparieren kann - es ist der Preis, den
Microsoft fuer den Namen in dem Fenster verlangt.

### Taskleiste unter "Zusaetzliche Symbole"

Beide Haken stehen jetzt unter derselben Ueberschrift, `{cm:AdditionalIcons}` -
so heisst der Abschnitt im deutschen Assistenten. Vorher stand dort eine
eigene Zeile "Verknuepfungen:".

### Piper wird mitinstalliert

Der Ordner piper\ ist vollstaendig: piper.exe, alle DLLs, espeak-ng-data
und **die Stimme de_DE-thorsten-medium.onnx mit 63 MB**. Der Installer
nimmt ihn mit `recursesubdirs` komplett mit.

Die Meldung "Fuer das Vorlesen fehlt eine Stimme im Ordner piper/" kam
also nicht daher, dass etwas fehlte - sie kam vom alten Installer, der
`C:\Temp\TrainerMSI\Source\piper\*` kopieren wollte. Diesen Ordner gibt
es nicht, also wurde nichts kopiert. Derselbe absolute Pfad, derselbe
Schaden wie bei START.vbs.

Damit erklaert sich auch Punkt 5, die Fehlermeldung beim Vorlesen: Die
Stimme war da (aus einer frueheren Installation), aber expandTTS fehlte
- siehe oben. Beides ist behoben; nach einem Neubau und einer
Neuinstallation muss die Sprachausgabe ohne Zutun laufen.

### Der Pruefungssimulator schweigt jetzt

Dietmar: "In einer realen Pruefung erfolgt auch kein das ist Richtig oder
das ist falsch."

Er hat recht, und es ist mehr als Kosmetik. Wer beim Ueben nach jeder
Frage ein gruenes Haekchen bekommt, uebt etwas anderes als die Pruefung.
Am Pruefungstag fehlt dann die Rueckmeldung, an die man sich gewoehnt
hat - und die Unsicherheit kommt genau dann, wenn sie am teuersten ist.

Eine einzige Funktion entscheidet das jetzt, `pruefungStreng()`. Sie
fragt beides ab: den einfachen Simulator und den mehrteiligen
Pruefungsdurchgang. Daran haengen sechs Dinge:

- **keine gruene/rote Faerbung.** Die angekreuzte Antwort wird nur
  markiert - man sieht, WAS man gewaehlt hat, nicht ob es stimmt.
- **keine Ansage "Richtig" / "Falsch".** Fuer Vorleseprogramme kommt
  stattdessen "Antwort B gespeichert." - die Bestaetigung, DASS etwas
  ankam, ohne die Wertung. Wer die Kacheln nicht sieht, klickt sonst
  zweimal.
- **kein Verlauf, keine laufende Auswertung**, kein Knopf "Verlauf
  ausblenden". In der echten Pruefung steht daneben auch keine
  Punktetafel.
- **kein Google-Knopf.**
- **kein F9/F10.** Frueher zaehlte die Loesungstaste dort "nur" als
  Fehler - aber die Loesung stand dann trotzdem da, und wer sie einmal
  gesehen hat, kann sie nicht mehr nicht wissen.
- **neutrale Fortschrittspunkte** statt gruen/rot.

Das Formelblatt bleibt. Die Formelsammlung ist amtliches Hilfsmittel und
liegt in der Pruefung auf dem Tisch.

**Zwei Fehlschlaege beim Ausblenden des Google-Knopfs, beide lehrreich:**

1. `el.style.display = 'none'` half nicht. Der Wert stand da, berechnet
   wurde trotzdem `flex` - weil `.btn-google` weiter unten
   `display:inline-flex !important` setzt, und !important im Stylesheet
   schlaegt jeden Inline-Wert ohne !important.
2. Als CSS-Klasse half es auch nicht, solange die Regel WEITER OBEN
   stand. Bei gleicher Spezifitaet und beidem !important gewinnt die
   spaetere Regel. Sie steht jetzt am Ende des Stylesheets.

Beides waere ohne Nachmessen im Browser nicht aufgefallen - im Code sah
es zweimal richtig aus.

Nachgemessen, Lernmodus gegen Simulator:

    Lernmodus:  Faerbung "wrong"/"correct", Verlauf da, Google sichtbar
    Simulator:  Faerbung nur "gewaehlt", Verlauf weg, Google weg,
                F9 ohne Wirkung, Formelblatt bleibt

## 01.09.2026 - Zwei Achsen statt einer Liste: Grey Mode und die Form

Dietmar wollte zweierlei: einen sachlichen Grauton, wie ihn die
Vereinsseiten haben, und eine kantige Variante nach dem Vorbild der
technischen Lernseiten - beides frei mit dem kombinierbar, was schon da
ist. Die naheliegende Loesung waere gewesen, die Liste der Modi zu
verlaengern: "Grey rund", "Grey eckig", "Dark eckig" und so fort. Bei
sechs Farben und zwei Formen waeren das zwoelf Eintraege in einem Knopf,
durch die man sich durchklickt, bis zufaellig das Richtige dasteht.

Deshalb sind es jetzt **zwei getrennte Achsen**:

    Farbe:  Light - Dark - Green - Blue - Orange - Grey
    Form:   Rundstrahler - Yagi

Zwei Knoepfe nebeneinander in der Kopfzeile, jeder beschriftet mit dem,
was gerade gilt. Alle zwoelf Kombinationen sind erreichbar, keine muss
einzeln gepflegt werden. Beide Einstellungen ueberleben den Neustart, in
zwei eigenen Schluesseln (`amateurfunk_theme`, `amateurfunk_form`), und
werden gesetzt, BEVOR das erste Mal gezeichnet wird - sonst blitzt beim
Laden kurz die falsche Ansicht auf.

**Die Namen.** Nicht "DARC-Modus" und nicht "50ohm-Stil": Das sind fremde
Namen, der eine ein eingetragener Vereinsname. Die Form heisst deshalb
nach dem, was sie zeigt - **Rundstrahler** ist rund, **Yagi** ist gerade
und gerichtet. Wer Amateurfunk lernt, muss das nicht erklaert bekommen.

**Grey Mode.** Fuenf Graustufen, vom Aussenrand (#e8eaec) ueber die Karte
(#ffffff) und die Bloecke (#f2f4f5) bis zu den Leisten (#e6e9eb) und
Koepfen (#dcdfe2). Als Akzent ein Stahlblau (#40525f) statt der sonst
ueblichen Farbe. Nachgerechnet: 6,0:1 fuer die gedaempfte Schrift, 14,4:1
fuer die normale - beides ueber der Anforderung fuer normalen Text.

**Yagi.** Keine Rundungen, keine Schatten. Was vorher der Schatten tat -
Ebenen voneinander trennen - macht jetzt ein Rahmen. Die Antwortfelder
tragen die Markierung als farbigen Balken links statt als Flaeche,
Tabellenkoepfe stehen in Versalien. Ausgenommen von der Kantigkeit bleiben
Auswahlknoepfe des Betriebssystems: ein eckiger Radiobutton ist als
solcher nicht mehr erkennbar. Und der Tastatur-Fokusrahmen bleibt stehen -
ohne diese eine Zeile haette die Regel ihn mit weggeraeumt, und wer mit
der Tabulatortaste arbeitet, waere blind unterwegs.

**Dark, Green, Blue und Orange sind unveraendert.** Ausdrueckliche
Vorgabe, und nachgeprueft: Die Farbwerte der vier stehen unberuehrt in
denselben Bloecken wie vorher. Die Form legt sich darueber, ohne eine
einzige Farbe anzufassen.

**Fuer neue Regeln gibt es jetzt Variablen**: `--r-klein`, `--r-mittel`,
`--r-gross`, `--r-pille` und `--schatten-karte`. Wer kuenftig etwas
hinzufuegt, benutzt sie und muss sich um die Form nicht mehr kuemmern. Die
vorhandenen Regeln blieben, wie sie waren - sie werden vom Umschalter
miterfasst. Ein Umbau aller 678 KB haette Fehler eingebaut, wo vorher
keine waren.

**Ein Fehler nebenbei behoben.** Die Kopfzeile lief auf schmalen Schirmen
seitlich aus dem Bild - schon vorher, mit dem zweiten Knopf waere es
schlimmer geworden. Sie bricht jetzt um. Auf breiten Schirmen aendert das
nichts.

Geprueft im Browser: alle zwoelf Kombinationen einzeln aufgerufen und
angesehen, dazu die Frageansicht mit beantworteter Frage, ein Fenster ueber
der Hauptansicht, und die Breiten 390, 768 und 1024 Pixel. Keine
Skriptfehler in der Konsole. Bei 390 Pixel bleibt ein Rest Ueberlauf von
209 Pixeln (eine Tabelle und die Lernstand-Zeile) - der war vorher schon
da, ist in allen zwoelf Kombinationen exakt gleich gross und hat mit der
Umstellung nichts zu tun.

## 01.09.2026 - Der Doppelklick tat nichts mehr

Dietmar hatte den Trainer in einen neuen Ordner umgezogen. Danach:
"Jetzt laesst es sich mit start.bat nicht mehr starten." Kein Fenster,
keine Meldung, kein Browser - beim Doppelklick passierte schlicht nichts.

Es lief noch einer. Der alte Server war beim Umzug nie beendet worden und
hielt Port 3000 weiter besetzt. Sein Ordner - `C:\Program Files\
Amateurfunk-Trainer` - war beim Umzug leergeraeumt worden, also fand er
seine eigene Index.html nicht mehr und antwortete auf jede Anfrage mit
"Cannot GET /". Sein Socket.IO meldete sich dagegen weiter: daran war er
zu erkennen.

Der neue Server sah den belegten Port, schrieb `Port 3000 belegt` und
beendete sich (`server.on('error', ...)` in Server.js, Zeile 3259). Nur:
START.vbs startet Node mit Fensterstil 0 - unsichtbar. Diese Zeile las
also niemand. Aus einer klaren Fehlermeldung wurde auf dem Bildschirm ein
Nichts.

**Beide Startdateien sehen jetzt vorher nach.** START.vbs und
START_MIT_TUNNEL.vbs fragen Port 3000, bevor sie Node starten:

  - Nichts da? Alles wie bisher, kein Unterschied.
  - Der Trainer antwortet dort schon? Dann eine Nachfrage im Klartext,
    mit dem Ordner, um den es geht: alten beenden und hier neu starten,
    oder nichts anfassen und nur den Browser oeffnen.
  - Etwas anderes sitzt auf dem Port? Dann wird nichts beendet. `taskkill
    /f /im node.exe` traefe womoeglich ein fremdes Programm, das mit dem
    Trainer nichts zu tun hat.

Erkannt wird der Trainer an seiner Socket.IO-Anmeldung: Sie antwortet mit
einer Kennung, die sonst niemand liefert. Ein blosses "da antwortet
jemand" haette nicht gereicht - auf 3000 sitzt bei Entwicklern oft etwas
ganz anderes.

Wenn die Pruefung selbst nicht laufen kann (MSXML nicht vorhanden), wird
gestartet wie frueher. Eine Vorsichtsmassnahme, die den Start verhindert,
waere schlimmer als das Problem.

## 01.09.2026 - Eckig, und die Antwortfelder wie beim DARC

Drei Saetze von Dietmar, drei Aenderungen.

**"Rund kannst du komplett ausbauen. Eckig ist viel schoener!"**

Die Wahl zwischen rund und eckig ist seit heute frueh keine 24 Stunden
alt und schon wieder weg. Das ist kein Verlust: Eine Einstellung, die
jeder auf denselben Wert stellt, ist keine Einstellung, sondern eine
Frage, die man sich haette sparen koennen. Der zweite Knopf in der
Kopfzeile ist verschwunden, ebenso der gespeicherte Schluessel und die
Funktionen dahinter. Die Klasse heisst jetzt schlicht `eckig`, sitzt fest
am `body` und wird im Startskript vergeben - vor dem ersten Zeichnen,
damit nichts aufblitzt.

**"Uebernehme die Schrift und die Felder und Farben fuer richtig oder
falsch exakt nach dem Vorbild vom DARC, auch mit dem Haken und dem Kreuz
hinten dran."**

"Exakt" ist hier woertlich zu nehmen. Jeder Wert unten ist aus dem
geschickten Bild gemessen und nicht nach Augenmass gewaehlt:

    Rahmen und Zwischenraeume   #dddddd
    Antwortfeld unbeantwortet   #ffffff
    richtig                     #3bb583
    falsch                      #fe756c
    Fragetext                   #212529
    Antworttext                 #000000

Dazu die Masse: Feldhoehe 34 Pixel, 8 Pixel zwischen den Feldern, 7 Pixel
Rand, der Text beginnt 15 Pixel innerhalb des Feldes. Und die Ecken: An
den Eckpixeln nachgesehen, im Vorbild ist jede einzelne ein rechter
Winkel.

Die Schrift ist Arial. Erkennbar am doppelstoeckigen "a" mit Sporn und am
waagerechten Balken im "e" - Segoe UI, die andere naheliegende
Moeglichkeit auf einem Windows-Rechner, zeichnet beide anders.

Uebernommen ist auch die Anordnung: Fragenummer und Frage stehen in
derselben grauen Flaeche wie die Antworten, nicht darueber, und die
Antwortbuchstaben tragen einen Doppelpunkt statt eines Punktes. Die
Nummer ist dafuer aus der Zeile darueber verschwunden - zweimal
dieselbe Nummer waere Unordnung.

Haken und Kreuz kommen aus dem Stylesheet, nicht aus dem JavaScript. So
stehen sie an jeder bewerteten Antwort, auch in der Wiederholung und im
Gruppenraum, ohne dass an vier Stellen im Code daran gedacht werden muss.
Vorleseprogramme lesen sie nicht mit - richtig so, denn "richtig" und
"falsch" stehen bereits in der Ansage.

**Die Signalfarben sind in JEDEM Farbmodus dieselben.** Das musste
erzwungen werden: Der Dark Mode setzt eigene Regeln mit !important auf
genau dieselben Felder. Ohne den Vorspann `body.eckig .question-area`
haetten die neuen Regeln dort verloren, und Rot und Gruen saehen im Dark
Mode anders aus als ueberall sonst. Genau das darf nicht sein - eine
Signalfarbe, die je nach Ansicht wechselt, ist keine.

Zwei Stellen bleiben bewusst anders:

  - Im Pruefungssimulator gibt es kein Rot und kein Gruen, keinen Haken
    und kein Kreuz. Die angekreuzte Antwort bekommt nur einen neutralen
    Balken. In der echten Pruefung sagt auch niemand, ob es stimmte.
  - Bildfragen behalten ihre Kachelform. Die Farben sind dieselben, Haken
    und Kreuz sitzen in der Ecke statt in der Mitte - sonst laegen sie
    ueber dem Bild.

Nachgemessen im Browser: In allen sechs Farbmodi kommen dieselben Werte
heraus - rgb(254,117,108), rgb(59,181,131), rgb(221,221,221), Arial,
border-radius 0. Feldhoehe 35 statt der gemessenen 34 Pixel; der eine
Pixel geht auf die Zeilenhoehe und faellt nicht auf.

**"Nach dem Kompilieren einer exe fehlt das Icon."**

Auf dem Bildschirm stand das weisse Blatt mit dem blauen Pfeil - das
Standardsymbol von Inno Setup. Die Zeile `SetupIconFile=icon.ico` stand
aber laengst in der installer.iss, und die icon.ico daneben ist in
Ordnung: nachgemessen 8 Groessen von 16 bis 256 Pixel, alle als DIB und
nicht als eingebettetes PNG.

Gebaut wurde aus dem falschen Ordner. Unter `C:\Program Files\
Amateurfunk-Trainer` lag eine aeltere installer.iss (7 statt 12 KB) und
eine aeltere icon.ico (61 statt 401 KB). Der Compiler hat nicht gemeckert
- er hat genau das gebaut, was dort stand.

Zwei Dinge dagegen:

**Build-DIREKT.bat sieht jetzt vorher nach.** Erst der Compiler, dann die
29 Dateien, die die installer.iss ohne `skipifsourcedoesntexist`
verlangt, dann die Groesse der icon.ico. Fehlt etwas, steht es
namentlich da und es wird nicht gebaut. Danach meldet die Datei, was
entstanden ist und wo es liegt.

**Die Version steht auf 1.2.0.** Nicht nur, weil die Ansicht eine andere
geworden ist. Windows merkt sich das Symbol einer EXE unter ihrem
Dateinamen: Baut man zweimal `Amateurfunk-Trainer-1.1.0.exe`, zeigt der
Explorer beim zweiten Mal womoeglich weiter das alte Symbol, auch wenn
das neue laengst darin steckt. Unter neuem Namen stellt sich die Frage
gar nicht.

## 01.09.2026 - "Benutzer und der Verlauf fehlt"

Nach einem Durchgang im Pruefungssimulator blieb die rechte Spalte leer:
keine Benutzerauswahl, kein Verlauf. Auch der Google-Knopf und der Knopf
"Verlauf ausblenden" kamen nicht wieder. Erst ein Neuladen der Seite half.

**Das war mein Fehler von heute frueh.** Zum Simulator gehoert, dass
waehrend der Pruefung Verlauf, Benutzerauswahl und Nachschlagen
verschwinden - in einer echten Pruefung steht daneben ja auch keine
Punktetafel. Ob "Pruefung laeuft", entscheidet `pruefungStreng()`, und
die fragt ZWEI Schalter ab: `examSimulatorMode` und
`realisticExam.active`.

Zurueck in die Hauptansicht fuehren drei Wege:

    backToMain()                      setzte nur examSimulatorMode
    Rueckfrage "Fragerunde abbrechen?" setzte nur examSimulatorMode
    backToMainRealistic()             setzte beide - kam aber nicht durch

Der dritte raeumte richtig auf, rief danach aber `backToMain()`, und das
steigt bei laufender Runde sofort in die Rueckfrage aus. Bestaetigt man
sie, uebernimmt der zweite Weg - und der kannte den zweiten Schalter
nicht. Ergebnis: `realisticExam.active` blieb stehen, `pruefungStreng()`
meldete weiter "Pruefung laeuft", und die Spalte blieb weg.

Die Ursache war nicht die vergessene Zeile, sondern dass dasselbe
Aufraeumen an drei Stellen abgeschrieben stand. Dann ist es nur eine
Frage der Zeit, bis eine davon nicht mitgepflegt wird.

**Es steht jetzt genau einmal da**, als `pruefungsmodusBeenden()`: beide
Schalter, der Timer, das Fenster des Durchgangs - und danach werden die
Klassen neu gerechnet. Alle Wege zurueck rufen diese eine Funktion.

Nachgemessen mit einem echten Server, acht Zustaende durchlaufen:
Startseite, Lernmodus, zurueck, Simulator, zurueck, Lernmodus erneut,
zurueck, und zuletzt der Weg ueber backToMainRealistic. Geprueft wurde
jedes Mal, ob Verlaufsspalte, Benutzerauswahl, Google-Knopf und der Knopf
"Verlauf ausblenden" sichtbar sind - und ob `pruefungStreng()` das sagt,
was gerade stimmt. Im Simulator sind alle vier weg, ueberall sonst sind
sie da. Keine Meldung in der Konsole.

## 01.09.2026 - Die Stimme verriet, was die Kacheln verschweigen sollten

Dietmar im Pruefungssimulator: "Beim Pruefungsimulator gibt es eine Piper
Antwort. Das war die Richtige oder das war leider die falsche Antwort.
Das gibt es in der Pruefung nicht und muss im Pruefungssimulator raus."

Er hat recht, und der Fehler war meiner. Beim Umbau des Simulators habe
ich die Kacheln stumm gestellt, den Verlauf, die Wertung, den
Google-Knopf - und die kurze Ansage fuer Vorleseprogramme gleich mit. Die
gesprochene Rueckmeldung habe ich uebersehen. Sie haengt an einer zweiten
Stelle: `vorleseAntwort()` wird 300 Millisekunden nach dem Klick
aufgerufen, unabhaengig von allem anderen. Was das Auge nicht mehr sah,
sagte also das Ohr - und damit war die ganze Umstellung wertlos.

Der Aufruf haengt jetzt an derselben Frage wie alles andere:
`pruefungStreng()`. Am Ende eines Teils spricht der Trainer weiter, denn
dort gehoert es hin: "Pruefung Vorschriften: 21 von 25 richtig.
Bestanden." Genau das hatte Dietmar auch verlangt - erst am Ende die
Auswertung, der Verlauf dazu und ob bestanden.

Nachgemessen mit einem vollstaendigen Durchgang ueber 25 Fragen: kein
einziger Aufruf von `vorleseAntwort()` waehrend der Pruefung, keine
Anfrage an Piper, nichts ueber die Sprachausgabe des Browsers. Am Ende
dagegen die Ansage, das Ergebnisfenster mit 4/25 und "Nicht bestanden",
ein Eintrag im Verlauf ("Realistisch Vorschriften", 4 von 25) - und
zurueck in der Hauptansicht sind Verlaufsspalte und Benutzerauswahl
wieder da, mit drei Zeilen in der Tabelle.

**Die angekreuzte Antwort ist jetzt orange.** Vorher war sie grau mit
einem dunklen Balken links - das sah aus wie "deaktiviert" und nicht wie
"das war meine Wahl". Dietmar: "Fuer die ausgewaehlte Antwort moechte ich
Orange. Die Farbe muss optisch zu dem Rot oder Gruen passen."

Ausgesucht wurde nicht nach Gefuehl, sondern gerechnet:

    falsch     #fe756c   Helligkeit 0,349   Kontrast 8,0:1   Farbton   4 Grad
    GEWAEHLT   #f9a05a   Helligkeit 0,456   Kontrast 10,1:1  Farbton  26 Grad
    richtig    #3bb583   Helligkeit 0,356   Kontrast 8,1:1   Farbton 156 Grad

Die ersten Kandidaten waren kraeftige Oranges (#e58f33, #ee8538). Die
treffen die Helligkeit von Rot und Gruen sogar auf die dritte
Nachkommastelle - und sehen daneben trotzdem falsch aus: schwerer,
satter, wie aus einer anderen Sammlung. Das Rot des Vorbilds ist hell und
weich, und dazu passt ein helles, weiches Orange. Rechnen allein reicht
hier nicht; angesehen werden muss es trotzdem.

22 Grad Abstand im Farbton sind genug, dass Orange und Rot auch direkt
untereinander nicht zu verwechseln sind. Haken und Kreuz bekommt das
Feld nicht: Es ist eine Markierung, kein Urteil.

## 01.09.2026 - Die Markierung beim Vorlesen war da und trotzdem unsichtbar

Dietmar: "Beim Vorlesen einer Antwort soll die Antwort, die vorgelesen
wird, gelb markiert sein."

Die Markierung gab es laengst. `playTTSQueue()` haengt vor jedem Abschnitt
die Klasse `tts-highlight` an die Antwort, die gerade dran ist, und nimmt
sie danach wieder weg. Nur sah man nichts davon - seit dem Umbau auf die
DARC-Felder heute frueh.

Der Grund ist Spezifitaet, und er ist lehrreich genug, um ihn
aufzuschreiben. Die neue Regel lautet

    body.eckig .question-area .option { background: ... !important }

und zaehlt drei Klassen plus ein Element. Die alte Markierung lautete

    .option.tts-highlight { background: ... !important }

und zaehlt zwei Klassen. Beide mit `!important` - dann entscheidet nicht
die Reihenfolge, sondern die Spezifitaet, und die gewinnt meine. Die
Klasse wurde also brav gesetzt und wieder entfernt, und das Feld blieb
weiss. Ein Fehler, den man im Code nicht sieht: Dort steht alles richtig.

Die Markierung steht jetzt am Ende des Stylesheets, mit demselben
Vorspann und einer Klasse mehr - damit sie auch gegen richtig, falsch und
angekreuzt gewinnt. Farbe: **#ffe066**, Leuchtstift-Gelb. Es soll nicht
zur Familie gehoeren, sondern auffallen und gleich wieder verschwinden.
Kontrast zu schwarzer Schrift 16:1, Farbton 48 Grad - weit genug vom
Orange der angekreuzten Antwort (26 Grad).

Haken und Kreuz bleiben stehen. Sie haengen am `::after` und werden von
der Hintergrundfarbe nicht beruehrt: Wer eine schon beantwortete Frage
noch einmal vorlesen laesst, verliert die Wertung nicht aus den Augen,
auch wenn Rot oder Gruen kurz vom Gelb verdeckt sind.

Geprueft mit dem echten Vorlesen-Knopf: Die Markierung wandert A, B, C, D
der Reihe nach durch, jedes Mal mit rgb(255, 224, 102), und danach ist
kein Feld mehr markiert. Dazu von Hand ueber ein richtiges und ein
falsches Feld gelegt - beide werden gelb, Haken und Kreuz bleiben.

## 01.09.2026 - Was beim Umzug liegengeblieben ist

Der Bau brach ab, und zwar genau so, wie er es soll:

    [ABBRUCH] Diese Dateien fehlen in diesem Ordner:
         - github_update.js
         - update_pruefen.js
         - LICENSE
         - Formelsammlung.pdf
         - Pruefungsfragen.pdf

Das ist die Pruefung, die heute frueh in Build-DIREKT.bat dazugekommen
ist, und sie hat gehalten, was sie sollte: Die Meldung nennt die Dateien
beim Namen, statt den Compiler mittendrin scheitern zu lassen. Dietmar
hat daraufhin gefragt, was sonst noch fehlt.

**30 Dateien zurueckgeholt.** Beim Umzug in den neuen Ordner sind alle
Hilfsprogramme, alle Batch-Dateien und die Unterlagen liegengeblieben -
und der alte Ordner ist inzwischen geloescht. Wiederhergestellt wurde aus
den Arbeitskopien, die hier seit Wochen liegen.

**Jede einzelne wurde ueber die Dateigroesse abgeglichen**, Byte fuer
Byte gegen die Liste des alten Ordners. Nicht "sieht aus wie die
richtige", sondern: 2065 Bytes verlangt, 2065 Bytes geliefert. Bei
Dateien mit mehreren Fassungen im Arbeitsordner - github_update.js gab es
dreimal - waere das sonst ein Ratespiel gewesen, und eine falsche Fassung
faellt womoeglich erst Wochen spaeter auf.

Die acht JavaScript-Dateien wurden zusaetzlich einzeln durch die
Syntaxpruefung geschickt.

    Installer-Blocker    github_update.js, update_pruefen.js, LICENSE,
                         Formelsammlung.pdf
    GitHub               Hochladen.bat, GitHub-Pruefen.bat,
                         GitHub-Ausmisten.bat, GitHub-Verbinden.bat
                         samt der vier zugehoerigen .js
    Werkzeuge            USB-Stick-Erstellen.bat, Verknuepfung-Erstellen.bat,
                         Node-Holen.bat, Update-Pruefen.bat,
                         Programm-Aktualisieren.bat, DNS-Auffrischen.bat,
                         Fehler-Zeigen.bat, piper.bat, Zurueckholen.bat,
                         Update-Test.bat, aufraeumen.js
    Unterlagen           README.md, ZUERST-LESEN.txt,
                         GITHUB-Einstellungen.md, BUG_REPORT.md

**Vier Dateien bewusst NICHT zurueckgeholt:**

  - `Pruefungsfragen.pdf` - habe ich nicht. 5,5 MB, amtliches Dokument
    der Bundesnetzagentur. Muss von dort geholt werden.
  - `package-lock.json` - meine Fassung hat 41806 statt 39783 Bytes. Eine
    Sperrdatei mit anderen Versionsnummern ist schlimmer als keine: Sie
    behauptet einen Stand, den es nie gab. `npm install` schreibt sie neu.
  - `README.txt` - meine Fassungen haben 1907 und 1307 statt 1960 Bytes.
    Der Installer braucht sie nicht.
  - `ANLEITUNG-USB.txt` - wird von usb_erstellen.js auf den Stick
    geschrieben (Zeile 656). Die Kopie im Projektordner war eine Leiche.

**Und das Repository ist weg.** Mit dem alten Ordner ist auch `.git`
verschwunden - deshalb fand Dietmar keine Datei zum Hochladen. Die Dateien
sind alle da, nur die Vorgeschichte fehlt. Genau dafuer gibt es
`GitHub-Verbinden.bat`: git init, Adresse eintragen, Stand von GitHub
holen, Zeiger daraufsetzen. Schritt vier fasst keine einzige Datei an -
er sagt git nur, welchen Stand es als "bei GitHub" ansehen soll. Erst
danach hat `Hochladen.bat` wieder etwas, womit es arbeiten kann.

## 01.09.2026 - Was steckt eigentlich in der EXE?

Dietmar wollte wissen, ob im Setup wirklich nur das landet, was der
Trainer braucht. Nachgesehen habe ich in beide Richtungen: was ist drin
und wird nicht gebraucht - und was wird gebraucht und ist nicht drin.

**Die zweite Richtung war die wichtigere.**

`USB-Stick-Erstellen.bat` und `usb_erstellen.js` fehlten im Setup. Das ist
kein Entwicklerwerkzeug, sondern ein Feature fuer Benutzer - Server.js
sagt es in der eigenen Paketliste ausdruecklich: "Wer den Trainer an einer
VHS oder im Ortsverband einsetzt, will Sticks austeilen." Wer den Trainer
installiert hatte, hatte diese Moeglichkeit schlicht nicht. Dazu
`Verknuepfung-Erstellen.bat` und `verknuepfung.ps1`, die usb_erstellen.js
auf den Stick legt, und `Node-Holen.bat` samt `node_holen.ps1` - letztere
nicht, weil das Setup sie braucht (es bringt node\ ja mit), sondern weil
START.vbs sie beim Namen nennt, wenn node\node.exe fehlt. Eine Meldung,
die auf eine nicht vorhandene Datei zeigt, ist schlimmer als 9 KB
Beiwerk.

Zur Kontrolle laeuft die Paketliste aus Server.js jetzt gegen die
Source-Zeilen der installer.iss. Vorher fehlten sechs Eintraege, jetzt
keiner.

**Dabei ist ein aelterer Fehler aufgefallen, der Sticks unbrauchbar
macht.** In der Paketliste stand `START.bat`, aber nicht `START.vbs`.
START.bat hat 49 Bytes und tut nichts weiter, als START.vbs aufzurufen -
seit dem Umbau auf den fensterlosen Start am 28.08.2026. Jeder Stick und
jedes ZIP seither trug also eine Startdatei, die auf eine Datei zeigt,
die nicht mitkam: Doppelklick, und es passiert nichts. Dieselbe Sorte
Fehler wie gestern beim belegten Port, nur an anderer Stelle. `START.vbs`
und `STOP.bat` stehen jetzt in beiden Listen - in Server.js und in
usb_erstellen.js, die sich gegenseitig pruefen.

**Und die erste Richtung: was kann raus.**

    node_modules            9,2 MB, davon 5,9 MB Beiwerk
      *.d.ts                2,9 MB   TypeScript-Deklarationen
      *.map                 2,1 MB   Quelltextkarten fuer den Debugger
      Readmes               0,9 MB
    sounds\fanfare.wav      2,2 MB   Rueckfall fuer Pakete von vor dem
                                     27.08.2026, die keine MP3 haben
    piper\pkgconfig\        klein    Baumetadaten fuer den C-Compiler

Zusammen gut 8 MB, die Node zur Laufzeit nie anfasst.

**Beinahe waere dabei ein Lizenzverstoss entstanden.** Der naheliegende
Ausschluss fuer die Readmes waere `*.md` gewesen. Neun Pakete legen ihre
Lizenz aber genau so ab: `ms/license.md`, `qs/LICENSE.md` und sechs
weitere eingebettete ms-Kopien. Die MIT-Lizenz verlangt, dass der
Hinweis jeder Kopie beiliegt - `*.md` haette also ausgerechnet die
Dateien entfernt, die mitgehen MUESSEN. Ausgeschlossen wird deshalb
namentlich (README.md, CHANGELOG.md, History.md und drei weitere): 0,91
von 0,94 MB gespart, alle 96 Lizenzdateien bleiben drin.

**Was gross ist und trotzdem bleibt:**

    node\node.exe          89 MB   ohne Node laeuft nichts
    piper\ (deutsche Stimme) 60 MB   Vorlesefunktion
    cloudflared.exe        52 MB   Gruppenraum ueber das Internet
    Pruefungsfragen.pdf     5 MB   im Trainer verlinkt
    Fragen-*.json           3,6 MB die Fragen selbst

**26 MB, an die ich mich nicht herantraue - noch nicht.** In piper\
liegen `libtashkeel_model.ort` (9,8 MB, Vokalisierung fuer Arabisch) und
111 fremdsprachige Woerterbuecher (16,4 MB, allein Russisch 8,1 MB).
espeak-ng laedt ein Woerterbuch erst, wenn es in dieser Sprache sprechen
soll; fuer einen deutschen Trainer duerfte beides tote Last sein.

Duerfte. Ich kann es von hier aus nicht auf einem Windows-Rechner
ausprobieren, und eine stumme Vorlesefunktion im fertigen Setup waere
schlimmer als 26 MB zu viel. Deshalb steht es fertig da, aber
ausgeschaltet: `#define SchlankesPiper 0` ganz oben in der installer.iss.
Auf 1 setzen, bauen, installieren, einmal "Vorlesen" druecken - geht es,
bleibt es an; geht es nicht, wieder auf 0.

**Was NICHT im Setup steht und auch nicht hineingehoert**, zur
Sicherheit noch einmal nachgesehen: `data\` (der Lernstand),
`video_embed.json` (echte Vornamen), `Hoerbuch\`, `tts_cache\`,
`github_stand.json`, `update_test.json`, `tunnel.log`, die
GitHub-Werkzeuge und `hochladen.js`. Alles sauber draussen.

## 01.09.2026 - Ein Weg statt drei

Fuenf Punkte von Dietmar an einem Nachmittag. Drei davon haben denselben
Kern: Der Trainer wird ab jetzt als fertiges Setup weitergegeben, und
alles, was daneben denselben Zweck hatte, ist damit ueberfluessig.

**1. Der Zielordner wird wieder abgefragt.**

"Bei der Installation moechte ich gefragt werden, wohin das installiert
wird." Die Seite gab es - sie wurde nur uebersprungen. Ohne eigene
Angabe gilt in Inno Setup `DisableDirPage=auto`, und "auto" heisst: Seite
weglassen, sobald eine fruehere Installation derselben AppId gefunden
wird. Beim ersten Mal wurde also gefragt, ab dem zweiten Mal nicht mehr -
und der Trainer landete stillschweigend wieder unter C:\Program Files.

Jetzt steht `DisableDirPage=no` da. Der zuletzt benutzte Ordner ist
vorausgefuellt, man muss ihn also nur bestaetigen - aber man kann ihn
aendern.

**2. und 5. Der USB-Weg und der Stimmen-Download sind aufgegeben.**

Beides stammt aus der Zeit, als der Trainer als ZIP oder auf einem Stick
weitergereicht wurde: Der Empfaenger musste sich Node.js selbst
installieren, die Sprachstimme selbst nachladen und sich das Startsymbol
selbst anlegen. Genau dafuer gab es USB-Stick-Erstellen.bat,
Verknuepfung-Erstellen.bat, Node-Holen.bat und piper.bat.

Das Setup erledigt alles davon. Damit sind es zwei Wege zum selben Ziel,
und der ungenutzte ist immer der, der irgendwann nicht mehr funktioniert,
ohne dass es jemandem auffaellt - dieselbe Sorte Fehler wie die
Startdatei, die auf ein fehlendes START.vbs zeigte.

Aus dem Setup entfernt: USB-Stick-Erstellen.bat, usb_erstellen.js,
Verknuepfung-Erstellen.bat, verknuepfung.ps1, Node-Holen.bat,
node_holen.ps1, piper.bat. Aus der Kopfzeile des Trainers verschwunden:
der Knopf "Trainer als ZIP".

**Und die Meldungen, die auf diese Dateien zeigten, gleich mit.** Das ist
der Teil, den man beim Aufraeumen vergisst:

  - START.vbs und START_MIT_TUNNEL.vbs sagten bei fehlendem Node "Bitte
    den Trainer neu installieren oder Node-Holen.bat ausfuehren."
  - Der Trainer schrieb bei fehlender Stimme "Doppelklick auf piper.bat
    holt sie", an anderer Stelle sogar "install_piper.bat ausfuehren" -
    eine Datei, die es seit Monaten nicht mehr gibt.
  - Aufraeumen.bat holte Node bei Bedarf mit node_holen.ps1 nach.

Alle drei zeigen jetzt dahin, wo die Sache wirklich herkommt: auf das
Setup.

**Aufraeumen.bat raeumt den Ordner mit auf.** Die Liste darin war vom
26.08. und lief ins Leere. Sie kennt jetzt die zehn Dateien, die heute
keine Aufgabe mehr haben - dazu installer-MINIMAL.iss, ZUERST-LESEN.txt
(ein Merkzettel vom 27.08., was beim Neuaufsetzen verlorenginge; der
Ordner ist seither zweimal neu aufgebaut) und check_json.py.

Geloescht wird weiterhin nichts: Alles wandert nach
`_Aufgeraeumt_<Datum>`, und erst wenn der Trainer danach weiter laeuft,
kann man den Ordner selbst in den Papierkorb ziehen. Zusaetzlich steht
jetzt alles, was zum Bauen der EXE gebraucht wird, in der Schutzliste -
installer.iss, Build-DIREKT.bat, die beiden BMPs, das Symbol. Nachgeprueft:
keine Datei steht in beiden Listen.

**Nicht angefasst:** Server.js kann den Trainer weiterhin als ZIP
ausliefern - die Route dahinter ist rund 400 Zeilen und eine Konstante
daraus (PAKET_PDF_MUSTER) entscheidet mit, welche PDFs der Server
ueberhaupt herausgibt. Der Knopf ist weg, also ist die Funktion aus der
Bedienung verschwunden; den Code herauszuoperieren ist ein eigener
Arbeitsgang mit eigenem Test und keine Beigabe.

**5. Piper spricht jetzt nur noch Deutsch.**

`#define SchlankesPiper` steht auf 1. Damit fallen
libtashkeel_model.ort (9,8 MB, Vokalisierung fuer Arabisch) und 111
fremdsprachige Woerterbucher (16,4 MB, allein Russisch 8,1 MB) aus dem
Setup - zusammen 26 MB.

en_dict bleibt drin (167 KB), obwohl niemand danach gefragt hat:
espeak-ng greift bei Fremdwoertern und Abkuerzungen gelegentlich auf
Englisch zurueck. Das ist billige Versicherung gegen genau den Fall, den
ich nicht ausprobieren kann - hier steht kein Windows-Rechner.

**Nach dem Bau bitte einmal "Vorlesen" druecken.** Kommt die Stimme, ist
alles gut. Bleibt es still, `#define SchlankesPiper 0` setzen und neu
bauen; dann war eine der ausgeschlossenen Dateien doch noch noetig.

## 01.09.2026 - Beide Werkzeuge zeigten aufeinander

"Jetzt Hochladen auf GitHub? Wann wird in GitHub aufgeraeumt?"

Nachgesehen, bevor geantwortet: **Das Repository bei GitHub ist leer.**
Dort steht "This repository is empty" - keine Dateien, keine Historie.
Damit beantwortet sich die zweite Frage von selbst: In GitHub ist nichts
mehr aufzuraeumen. Der erste Push legt fest, was drinsteht.

Aufgeraeumt wird stattdessen von der `.gitignore`, und zwar hier auf dem
Rechner. Durchgerechnet: 48 Eintraege gehen hoch, 22 bleiben liegen -
darunter `data\` (der Lernstand), `video_embed.json` (echte Vornamen),
`cloudflared.exe` (52 MB), `Hoerbuch\`, `node\`, `node_modules\`,
`piper\`, `Update-Test.bat` und die sechs GitHub-Werkzeuge.

**Dabei ist eine Sackgasse aufgefallen.** Dietmars Ordner hat kein `.git`
mehr, und das Repository ist leer. In dieser Lage zeigte jedes der beiden
Werkzeuge auf das andere:

  - `Hochladen.bat` sagte "Hier ist kein Repository. Erst
    GitHub-Neustart.bat ausfuehren" - eine Datei, die es seit dem 28.08.
    nicht mehr gibt.
  - `GitHub-Verbinden.bat`, ihr Nachfolger, holt den Stand von GitHub
    (`git fetch origin main`). Wenn dort nichts liegt, gibt es auch
    nichts zu holen: Es bricht mit "couldn't find remote ref main" ab.

Es fehlte also genau ein Handgriff - `git init` - und keines der beiden
konnte ihn machen. `hochladen.js` macht ihn jetzt selbst: nach
Rueckfrage, mit der Ansage, was dabei geschieht, und mit einer Warnung
fuer den Fall, dass bei GitHub eben doch schon etwas liegt. Dann naemlich
ist GitHub-Verbinden.bat das richtige Werkzeug, weil es den dortigen
Stand erst herunterholt, statt ihn zu ueberschreiben.

Durchgespielt in einem leeren Ordner: anlegen, Zweig main, `git add -A`,
Commit, und `github_pruefen.js` meldet SAUBER - die ignorierten Werkzeuge
sind dabei korrekt draussen geblieben.

## 01.09.2026 - "Der Befehl node ... konnte nicht gefunden werden"

Beim Hochladen:

    Pruefe, was hochgeladen wuerde ...
    Der Befehl "node" ist entweder falsch geschrieben oder
    konnte nicht gefunden werden.
    !! ABBRUCH. Die Pruefung meldet kein "SAUBER".

Die Pruefung hat gar nichts gemeldet - sie ist nie gelaufen.

`Hochladen.bat` sucht sich Node ordentlich zusammen: erst `node\node.exe`
aus dem Ordner, dann ein installiertes. Dietmar hat Node.js deinstalliert,
weil der Trainer es ja mitbringt - also lief das Skript ueber das Node aus
dem Ordner. Nur rief es intern

    execSync('node github_pruefen.js')

auf, also ein blankes "node" aus dem Suchpfad. Das gibt es dort nicht
mehr. Der aeussere Aufruf war sorgfaeltig, der innere nicht - und beim
zweiten war es nie aufgefallen, solange Node installiert war.

Jetzt steht dort `process.execPath`: genau das Node, das gerade laeuft, mit
vollem Pfad. Damit kann die Frage gar nicht mehr aufkommen.

**Und die Meldung war irrefuehrend.** "Die Pruefung meldet kein SAUBER"
klingt, als haette sie etwas gefunden. Kommt gar keine Ausgabe zurueck,
steht jetzt da, dass sie sich nicht ausfuehren liess - das ist ein anderer
Fehler und braucht eine andere Suche.

## 01.09.2026 - Loeschungen stehen jetzt vollzaehlig da

Beim Hochladen wurden die ersten 20 offenen Aenderungen gezeigt und der
Rest als "... und N weitere" zusammengefasst. Das ist genau andersherum
als noetig.

Eine geaenderte Datei ist der Normalfall. Eine geloeschte nicht - und
`git push` laedt eine Loeschung mit hoch wie jede andere Aenderung. So
sind am 28.08.2026 22 Dateien bei GitHub verschwunden, darunter der ganze
Ordner `bilder\`.

Wer aufraeumt, hat viele Loeschungen. Ausgerechnet dann waere die Liste
abgeschnitten worden - an der Stelle, an der man sie am dringendsten
vollstaendig braucht.

Loeschungen stehen deshalb jetzt vorweg, einzeln und vollzaehlig, mit dem
Hinweis, dass Zurueckholen.bat sie noch holen kann - aber nur vor dem
Hochladen. Die uebrigen Aenderungen kommen danach und duerfen weiter
gezaehlt werden.

Durchgespielt in einem Testordner mit zwei geloeschten und einer
geaenderten Datei, und dabei "node" absichtlich aus dem Suchpfad
genommen: Die Pruefung laeuft, die beiden Loeschungen stehen namentlich
da, die Aenderung darunter.

## 01.09.2026 - Die Schlussmeldung zeigte auf ein Werkzeug, das es nicht mehr gibt

Das Hochladen hat geklappt: 823 Dateien, 68 Commits, `172efa1..d63e103`.
Darunter stand aber:

    Jetzt noch die Stimmen: Stimmen_packen.bat ausfuehren,
    dann auf der Seite "Releases" -> "Create a new release",
    Tag v1.0, und Piper-Stimmen.zip ins Feld ziehen.

Der Weg ueber ein Stimmen-ZIP ist am 28.08.2026 aufgegeben worden,
`Stimmen_packen.bat` gibt es seit heute Nachmittag nicht mehr, und Tag
v1.0 ist zwei Fassungen alt. Drei falsche Angaben in vier Zeilen - und
zwar in dem Moment, in dem man einer Anweisung am ehesten folgt: gleich
nach dem geglueckten Hochladen, wenn man ohnehin gerade dabei ist.

Dieselbe Sorte Fehler wie START.vbs mit Node-Holen.bat und wie die
Startdatei ohne START.vbs. Wenn etwas wegfaellt, bleiben die Saetze
stehen, die darauf zeigen - sie stehen ja woanders.

**Jetzt steht dort, was wirklich fehlt.** Das Skript sieht nach, ob eine
`Amateurfunk-Trainer-*.exe` im Ordner liegt, nimmt die neueste und
schreibt Version, Groesse und den fertigen Link hin:

    Jetzt noch das Setup: Amateurfunk-Trainer-1.2.0.exe (200 MiB)
    liegt hier im Ordner. Es gehoert an ein Release:

      https://github.com/.../releases/new

      Tag:   v1.2.0
      Titel: Amateurfunk-Trainer 1.2.0
      Die EXE unten ins Feld ziehen, dann "Publish release".

Liegt keine da, steht stattdessen der Hinweis auf Build-DIREKT.bat.

Warum ueberhaupt ein Release und nicht ins Repository: GitHub laesst je
Datei 100 MiB zu, das Setup ist ein Vielfaches davon. An einem Release
sind 2 GiB erlaubt.

Beide Faelle durchgespielt - mit zwei EXE-Dateien im Ordner (die neuere
wird genommen, Version und Groesse richtig gelesen) und mit einer leeren
Ablage.

## 01.09.2026 - Auch die Stimmvarianten fliegen raus

Beim Bauen rauschten 104 Zeilen durchs Fenster:

    Compressing: ...\piper\espeak-ng-data\voices\!v\robosoft7
    Compressing: ...\piper\espeak-ng-data\voices\!v\whisper

Dietmar: "Kann das nicht auch raus?"

Es sind die Stimmvarianten von espeak-ng - "whisper", "croak",
"robosoft3" und so fort. Zu hoeren bekommt man sie nur, wenn eine Stimme
ausdruecklich als Variante angefordert wird (de+m3). Der Trainer tut das
nicht: Er nimmt die Stimme aus der .onnx-Datei, espeak zerlegt nur die
Woerter in Laute.

**Ehrlich gerechnet sind es 50 KB.** 104 Dateien, zusammen 51.289 Bytes -
nachgezaehlt, nicht geschaetzt. Die lange Liste im Baufenster taeuscht:
viele Namen, fast keine Bytes. Bei 105 MiB Setup sind das 0,05 Prozent.

Ich habe erst abgeraten, weil dem Nichts an Ersparnis ein Risiko
gegenuebersteht, das ich nicht ausraeumen kann - hier steht kein
Windows-Rechner, auf dem sich das ausprobieren liesse. Dietmar wollte es
trotzdem, und das ist seine Entscheidung.

**Der Ordner lang\ bleibt drin.** Er sieht aehnlich aus - viele winzige
Dateien - ist aber etwas anderes: Ueber ihn findet espeak die
Grundsprache. Achtzehn Kilobyte sind kein Grund, daran zu ruehren.

**Und der Ordner voices\ wird trotzdem angelegt**, obwohl er jetzt leer
ist. Er stand vorher nur deshalb da, weil !v\ darin lag; ohne einen
Eintrag in [Dirs] waere er ganz verschwunden. Ein Verzeichnis, das ein
Programm beim Start einliest, sollte vorhanden sein - auch wenn nichts
darin steht.

Beides haengt am selben Schalter wie die Woerterbuecher: Sagt der Trainer
nach dem Bauen nichts mehr, `#define SchlankesPiper 0` und neu bauen -
dann ist alles wieder da.

## 01.09.2026 - Neue Bilder in Grau - und die Symbole kamen aus dem Internet

"In GitHub benötigt es komplett neue Bilder. Zum Teil sind da noch alte
Bilder vorhanden. Ich möchte den Style in Grey nicht Light."

Beim ersten Versuch fiel etwas anderes auf: Auf meinen Aufnahmen waren
statt der Knopfsymbole leere Kaesten. Der Grund stand in Zeile 7 der
Index.html:

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/...">

**Die Symbolschrift kam von einem CDN.** Ausgerechnet der Trainer, von
dem die README sagt, er laufe "vollstaendig ohne Netz", brauchte beim
Start doch eine Internetverbindung - sonst blieben alle Symbole leer. Zu
bedienen war er weiterhin, die Beschriftungen stehen ja daneben; schoen
war es nicht, und angekuendigt war es auch nicht.

Font Awesome liegt jetzt im Ordner: `fontawesome\` mit 432 KB, davon 300
KB Schriftdateien. Die ttf-Ausweichfassungen sind herausgenommen - woff2
versteht jeder Browser seit 2016, das spart 1,3 MB. LICENSE.txt liegt
dabei, Font Awesome verlangt das. Alle 94 im Trainer benutzten Symbole
sind in der mitgelieferten Fassung 6.5.2 vorhanden; nachgeprueft, nicht
angenommen.

Dazu drei Eintraege, ohne die es nicht ginge: `/fontawesome/` in
PUBLIC_DIRS (sonst gibt der Server die Dateien nicht heraus), der Ordner
in der installer.iss und ein Eintrag in [Dirs].

**Und die Bilder.** Neun Aufnahmen, alle im Grey Mode, alle mit der
eckigen Ansicht und den neuen Antwortfeldern:

    01-hauptansicht        Startseite mit Verlauf und Lernfortschritt
    02-pruefungsziel       das Fenster "Ziel waehlen"
    03-frage               beantwortete Frage, rot/gruen mit Haken und Kreuz
    04-simulator           Pruefungssimulator Klasse N
    05-gruppenraum         Raum mit drei Teilnehmern und Gruppenchat
    07-statistik           Auswertung mit Stolpersteinen
    08-updater             das Update-Fenster
    09-simulator-klassen   Simulator Klasse A mit allen fuenf Teilen

Vorher lag der Lernstand-Ordner beiseite: Auf den Bildern soll kein
Fortschritt stehen, der jemandem gehoert. Beim Gruppenraum sind die
Namen erfunden - Anke, Bernd, Clara.

Zwei Bilder sind ersatzlos entfallen: `10-usb-stick.png` und
`11-verknuepfung.png` zeigen Wege, die es nicht mehr gibt.
`06-uebersicht.png` ebenfalls - die Teilnehmer-Uebersicht des Ausbilders
laesst sich ohne echte Antworten nicht sinnvoll nachstellen, und ein
zweites Bild, das dasselbe zeigt wie das erste, hilft niemandem.

**Nebenbei aufgefallen, nicht behoben:** Im Gruppenraum steht unter der
Teilnehmerliste "Warten auf Benutzer... Noch kein Raum erstellt" -
waehrend darueber der Raumcode und drei Teilnehmer stehen. Die Zeile wird
offenbar nicht mitgefuehrt. Kein Beinbruch, aber verwirrend.

## 01.09.2026 - Die Versionsnummer zaehlt sich selbst

Dietmar: "Beim Erstellen einer exe sind wir derzeit bei 1.0.1. Schau mal
im CHANGELOG.md, das ist bei weitem weiter als 1.01. Ich moechte eine
hoehere Zahl, an dem CHANGELOG.md angepasst, die fortlaufend ist."

Er hat recht: In diesem Protokoll stehen inzwischen 96 Abschnitte. Eine
Nummer wie 1.0.1 behauptet dagegen, es habe seit dem ersten Tag eine
einzige kleine Korrektur gegeben.

**Die Regel ist jetzt:  1.<Anzahl der Eintraege im CHANGELOG>.0**

Heute also **1.96.0**. Jeder neue Abschnitt im Aenderungsprotokoll hebt
sie um eins.

Das ist mehr als eine hoehere Zahl - es ist eine, die nicht mehr
vergessen werden kann. Eine von Hand gepflegte Version laeuft irgendwann
aus dem Tritt: Man baut, denkt nicht ans Hochzaehlen, und zwei
verschiedene Programme heissen gleich. Wer dann einem Benutzer helfen
soll, weiss nicht, was der eigentlich installiert hat. Hier kann das
nicht passieren: Wer etwas aendert, schreibt es ins Protokoll - und damit
steigt die Nummer von selbst. Wer nichts hineinschreibt, hat auch nichts
geaendert, das eine neue Nummer verdient.

`version.js` zaehlt die Ueberschriften, `Build-DIREKT.bat` reicht das
Ergebnis an den Compiler weiter (`/DAppVer=`), und dieselbe Nummer landet
in der `package.json`. Vier Stellen, die frueher einzeln gepflegt werden
mussten, haengen jetzt an einer.

## 01.09.2026 - Ein Ordner fuer die fertigen Setups

"Habe einen neuen Ordner hinzugefuegt: release. Hier moechte ich alle
kompilierten exe Dateien die erstellt werden, drin haben."

`OutputDir=release` in der installer.iss, und Build-DIREKT.bat legt den
Ordner an, falls er fehlt. Vorher landeten die Setups zwischen den
Quelldateien - das ist die Sorte Datei, die man beim Aufraeumen
versehentlich mitnimmt oder loescht. `release/` steht in der .gitignore:
Im Repository laesst GitHub 100 MiB je Datei zu, ein Setup ist groesser.

**Und ein Werkzeug zum Veroeffentlichen: `Release-Hochladen.bat`.**

Es sucht das neueste Setup in `release\`, liest die Version aus dem
Dateinamen, baut die Beschreibung aus dem letzten Abschnitt dieses
Protokolls plus einer Installationsanleitung - und legt damit ein
GitHub-Release an. Gibt es das Release schon, wird die Datei dort
ersetzt.

Nicht zu verwechseln mit `Hochladen.bat`: Das schiebt den Quellcode ins
Repository. Zwei verschiedene Orte, zwei verschiedene Werkzeuge - und
deshalb bewusst zwei Dateien und nicht eine mit einer Rueckfrage.

**Zugangsdaten fasst das Skript nicht an.** Angemeldet wird ueber
`gh auth login`, GitHubs eigenes Verfahren; hier wird nur nachgesehen, OB
eine Anmeldung besteht. Fehlt die GitHub-Befehlszeile, gibt es keinen
Fehler, sondern den Weg von Hand: Das Skript oeffnet die Release-Seite im
Browser und den Ordner release\ im Explorer, mit Tag und Titel zum
Abschreiben. Ein Werkzeug, das ohne Zusatzsoftware gar nichts tut, waere
an dieser Stelle nutzlos.

Die fertige Beschreibung liegt vorher als `release\_release-notiz.md`.
Das Aenderungsprotokoll ist an Dietmar geschrieben, ein Release an
Fremde - wenn der Ton nicht passt, laesst sich die Datei aendern, bevor
man bestaetigt.
