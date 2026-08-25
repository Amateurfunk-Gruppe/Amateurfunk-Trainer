# Änderungsprotokoll — Amateurfunk Klasse-N-Trainer

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
  Aufruf. Der Umweg über `yout-ube.com` ist entfallen. Nur die private Nutzergruppe in
  `VIDEO_EMBED_WHITELIST` (Dietmar, Maja, Uwe) bekommt weiterhin das eingebettete Fenster.
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
