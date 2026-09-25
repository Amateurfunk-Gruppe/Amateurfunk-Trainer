# Änderungsprotokoll — Amateurfunk-Trainer

Entwickler und Urheber: Dietmar Reh. Lizenz: [PolyForm Noncommercial 1.0.0](LICENSE).

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), SemVer. Je Version: Hinzugefügt, Geändert, Behoben.
Die oberste Versionsnummer ist die des nächsten Baus: `version.js` liest sie von hier
und legt sie in `package.json` ab, `Build-DIREKT.bat` übernimmt sie in den Namen des Windows-ZIP.

---

## [1.298.0] - 2026-09-25

### Hinzugefügt
- Server-Knopf in der Kopfzeile: Online-Zugang ein/aus (rot/grün), nach Start aus, beim Schließen eine Minute Vorwarnung für Besucher
- Ländersperre: Zugriff nur aus Deutschland, Österreich und der Schweiz, Zutritt anfragen mit Freigabe durch den Gastgeber
- Gruppenraum: Prüfungssimulator mit drei Bögen à 25 Fragen/45 Minuten, Auswertung je Bogen, Fehler in Fehlerliste und Lernbedarf
- Chat und Gruppenraum: Sprachnachrichten, Mikrofon mit automatischer Suche eines funktionierenden Eingangs und Fehlerhinweisen
- Chat auch ohne Gruppenraum für Besucher am geteilten Link, Ankunftsmeldung mit Namen
- Gruppenraum: Fehler mitnehmen – Fehler der Runde als lesbare Textdatei, Lernstand einlesen übernimmt sie (auch `.txt`)
- Geteilter Link: Willkommensfenster mit freiwilligem Rufzeichen/Namen, Abschiedsseite mit Download-Hinweis beim Beenden
- Besucherfenster: Tabelle mit Standort und Name, aktive Besucher, Zähler zurücksetzen, Signalton, Neustart ankündigen mit Countdown
- Vorschaukachel für geteilte Links (Facebook, WhatsApp), mit Raumcode als Einladung in den Gruppenraum
- Hauptansicht: Hilfe & Unterlagen mit DARC-Ausbildungspaten, Kursen vor Ort, Unterlagen und Folien, bei Klasse N Buch-Link
- 50ohm.de-Kacheln Kapitel und Lösungsweg in allen Klassen, Index wöchentlich aktualisiert

### Geändert
- Chat: nur laufende Sitzung sichtbar, neue Besucher ohne alten Verlauf, Systemmeldungen mit Absender Server, Server-Log ohne Chat-Inhalte
- Fußleiste: Besucherzähler und Info-Knopf, 50ohm.de als Empfehlung statt Zusammenarbeit
- Erklärungen: Abgleich mit allen 277 DARC-Lösungswegen, 67 Erklärungen überarbeitet (31 Fehler, 36 Unschärfen)
- Projektseite, Ratgeber und Suchmaschinen-Beschreibung: eigener Lösungsweg zu allen 1750 Fragen vorn, DARC-Lösungswege dazu
- Vorschaubilder für geteilte Links und Projektseite: 1750 Erklärungen, alle vier Prüfungsziele vollständig
- Bilder in README und auf der Projektseite: Fußzeile mit Empfehlung statt Zusammenarbeit, Installationsbild zeigt das Windows-ZIP
- Repository: Arbeitsdateien mit Unterstrich am Anfang bleiben ausnahmslos draußen, auch PDF
- Batch-Dateien einheitlich mit Windows-Zeilenenden; STOP.bat beendet nur noch die Tunnel des Trainers, andere cloudflared-Prozesse bleiben
- Gruppenraum und Prüfungssimulator: keine Kacheln zu Videolehrgang und 50ohm.de
- Besucher über den Link: Blue Mode beim ersten Besuch, kein eigener Gruppenraum, Texte ohne Demo-Begriff
- Besucherzählung: nur Aufrufe mit Lebenszeichen, Scanner als angeklopft, Land/Stadt statt IP-Adresse, Suchmaschinen nicht gelistet
- Online-Zugang: feste Adresse wird bevorzugt, kein zusätzlicher Tunnel, Neustart-Hinweis ohne Adresswechsel
- Programmsymbol: neues Zeichen (Strahler mit Funkwelle), unter macOS hüpft es im Dock, bis der Trainer bereit ist

### Behoben
- Ruckeln beim Laden/F5, auf Support- und Datenschutzseite sowie in der Fortschrittsspalte beim Antworten
- Gruppenraum: nach Neuverbindung wieder Schreiben möglich, Raumchat nicht mehr überschrieben
- Besucher: Meldung beendet erscheint nicht mehr fälschlich
- DARC-Kacheln bei Klasse E und E→A ergänzt
- Info-Symbol wieder sichtbar
- Projektseite und Ratgeber zeigten noch das alte Programmsymbol
- Zahl der Rechenwege auf 391 berichtigt (README, Projektseite, Kopf von erklaerungen.json)
- README: fehlendes Bild der Handy-Ansicht ergänzt, Beschreibung des Namensfelds an die aktuelle Fassung angepasst
- Gruppenraum: Gäste bekommen bei fehlender Sprachausgabe keinen Weg in die Einstellungen des Gastgebers mehr gezeigt, Setup-Hinweis entfernt
- Vorschaukachel: Bild erscheint (Zwischenspeicher erlaubt, von Ländersperre ausgenommen, keine Weiterleitung auf sich selbst)
- Besucherliste: Umlaute in Ortsnamen, keine Doppelzählung durch den Service Worker
- Link zur Projektseite auf GitHub Pages korrigiert
- Dark und Green Mode: Fortschrittsspalte, Server-Knopf, Tunnel-Wache und Besucherfenster wieder kontrastreich
- Formelblatt-Knopf bei NB501–NB505 und NB601–NB606 ergänzt, Anteilsangabe im Hilfetext korrigiert
- Windows-Start: Hinweise bei Quelltext-Download, falsch abgelegtem Node und abgestürztem Server statt stillem Abbruch

## [1.297.0] - 2026-09-15

### Hinzugefügt
- Erklärungen: gesamter Katalog erklärt (1750 Fragen), zuletzt 464 Fragen E → A mit 146 Rechenwegen
- Erklärung: Großansicht in Kartengröße, Knopf Lösung mit Antwortbuchstabe, Vorlesen ohne Aufklappen (Knopf, F8), Wortmarke
- Update-Fenster beim Start: Versionen, Änderungsliste aus `CHANGELOG.md`, Fortschritt; ersetzt stilles Nachholen, Blinkknopf und Ton
- Dark Mode wieder verfügbar: Zeichnungen im Negativ (`invert(1)`), alle Fenster angepasst, Signalfarben wie im hellen Stil
- Lernmodus: offene Fragen als Liste statt Nicht bestanden, Knopf Ausgelassene jetzt üben

### Geändert
- Oberfläche: Antwortfelder so hoch wie ihr Text, Knopfleiste fest am Fensterrand, Prüfungsteil in der Kopfzeile
- Bilder: Lupe erst nach 350 ms Stillstand, bleibt innerhalb der Karte, Höchststufe füllt die Karte
- Build: Sprachprobe `sprachprobe.js` in `Build-DIREKT.bat`, kein Setup-Bau mehr, ZIP-Inhalt namentlich geprüft

### Behoben
- Fragenkatalog: 784 Stellen in 363 Fragen ans amtliche PDF angeglichen; Indizes, Brüche und Wurzeln wie gedruckt
- Sprachausgabe: Formeln, Einheiten und Zahlengruppen vollständig vorgelesen; bei Auslastung Warteschlange statt Fehlerfenster
- Bedienung: Klick aufs Antwortbild wählt die Antwort, kein Überlauf bei fünf Bildern, Zurücknehmen bei nachträglichem Haken
- Start/Pakete: `START.sh` findet `node\node.exe` und fremden Server, Mac-App hüpft nicht im Dock, `erklaerungen.json` wieder drin

## [1.296.0] - 2026-09-14

### Hinzugefügt
- Windows-ZIP als einziger Download: Node, Piper mit Stimmen, Katalog und Erklärungen enthalten, Start per `START.bat`
- `node_holen.ps1` wieder da: lädt Node bei Bedarf als ZIP mit Prüfsummenvergleich
- GitHub-Pages-Seite unter `docs/` ohne externe Server, Schriften und Zählpixel
- Anleitungsvideo in README, `docs/` und Release-Seite verlinkt
- Pakete: `erklaerungen.json` in `installer.iss` und `pakete_bauen.sh` aufgenommen

### Geändert
- Setup (EXE) entfällt wegen Smart App Control (Fehler 4551); `installer.iss` bleibt als Vorlage im Repository
- Tunnelprogramm nicht mehr im Setup, wird beim ersten Tunnelstart nachgeladen
- `release_hochladen.js`: lädt das Windows-ZIP hoch, ignoriert EXE-Dateien

### Behoben
- Vorlesen: keine doppelten Stimmen mehr, Stop hält alle laufenden Stücke an
- Piper-Hinweise: keine Windows-Texte unter Linux, nicht mehr blockierend, Verweis auf Stimmen hinzufügen und Hilfsprogramme
- Installation: `ie4uinit.exe -ClearIconCache` entfernt, keine Warnung durch überwachten Ordnerzugriff mehr
- `Build-DIREKT.bat`: packt unter Zwischennamen mit Größenprobe, altes Archiv bleibt bei Fehlschlag erhalten

## [1.295.0] - 2026-09-13

### Hinzugefügt
- Erklärungen: Aufstieg N → E vollständig (463 von 463), damit auch Klasse E komplett; 1286 Erklärungen gesamt
- Begriffsblätter: 35 neue (u. a. Dezibel, Blindwiderstand, Mischer, SWR, EIRP, Ausbreitung), 9 erweitert, jetzt 76
- Rechenwege: 244 Fragen mit Rechenweg (vorher 149)

### Geändert
- `erklaerungen.json`: Kopffeld `umfang` aktualisiert, drei bereits erklärte Fragen an Begriffsblätter angehängt

### Behoben
- Erklärungen: 30 Stellen nach Gegenprüfung korrigiert (Grenzwerte EIRP/ERP, Drehkondensator, Faltdipol, Blindantworten)
- Sicherheit: HF-Erdleitung zusätzlich an Haupterdungsschiene, Erdverbindung nie entfernen; 8 Quellenangaben ergänzt
- Vorlesen: Ω, λ sowie Flächen- und Raummaße werden gesprochen (`sprechbar()`)
- Texte: 54 Stellen auf deutsche Anführungszeichen umgestellt
- `eintragen.py`: Abgleich toleriert geschützte Leerzeichen (U+00A0, U+202F, U+2009)

## [1.294.0] - 2026-09-13

### Geändert
- Vorlesen: `ttsInStuecke()` teilt Abschnitte an Satzenden in Stücke bis 700 Zeichen, Stücke einzeln im Cache
- Vorlesen: Hervorhebung bleibt über alle Stücke eines Abschnitts, Pause nur am Abschnittsende

### Behoben
- Vorlesen: Prinzip langer Erklärungen nicht mehr übersprungen (HTTP 413 über 1000 Zeichen, 421 Erklärungen betroffen)
- Fehlermeldung bei 413 nennt zu langen Abschnitt statt fehlender Stimme

## [1.293.0] - 2026-09-13

### Hinzugefügt
- Erklärungen: Klasse N vollständig (571 von 571), 147 neue in Betrieb und Technik; 948 Erklärungen gesamt
- Begriffsblätter: 20 neue (5 Betrieb, 15 Technik), jetzt 41; 18 neue Rechenwege

### Geändert
- Begriffsblätter: fünf Fragen an bestehende Blätter gehängt, betroffene Blätter um je eine Zeile ergänzt
- `erklaerungen.json`: Kopffeld `umfang` mit Stand je Prüfungsziel, `blaetter` beschreibt Feld `quelle`

### Behoben
- Erklärungen: Sachfehler nach Gegenprüfung korrigiert (13,8 V, 12-V-Gefahren, 50 Hz, ISM im 70-cm-Band, DMR/TETRA)
- Erklärungen: zu absolute Aussagen entschärft, 8 Quellenangaben für Zusatzwissen ergänzt

## [1.292.0] - 2026-09-13

### Hinzugefügt
- Übungszeit-Fenster: Anzeige je Benutzerplatz, sobald mehr als ein Platz Übungszeit hat

### Geändert
- Übungszeit und Diagnose: Server führt je Tag bzw. Frage zusammen, leerer Stand überschreibt die Sicherung nicht
- Übungszeit: Uhr löst höchstens alle fünf Minuten selbst ein Sichern in die Datei aus

### Behoben
- `Server.js`: `diagnose` und `uebungszeit` wurden beim Speichern verworfen (`FELD_TYP`, `merged`); Neustart nötig
- `loadPersistentFromServer()`: lädt Übungszeit und Diagnose aus der Datei zurück

## [1.291.0] - 2026-09-13

### Hinzugefügt
- Themen-Fenster: Fortschritt je Begriffsblatt, schwächstes oben, Knöpfe Blatt lesen und Üben, schwächste Themen üben
- Blatt-Fenster: Prinzip, Tabelle und Merksatz mit Vorlesen, Fragen üben und Quellenangabe
- Auswertung: Kasten mit den drei schwächsten Themen neben den Stolpersteinen
- Druck: Begriffsblätter ein Thema pro Seite mit Seitenzahl, wahlweise nur offene Themen, ohne Prüfungsfragen

### Geändert
- Themenstand zählt nur Fragen des gewählten Prüfungsziels

### Behoben
- Druck: jedes Blatt auf eigener Seite statt halbleerer Seiten, keine leere Seite am Ende

## [1.290.0] - 2026-09-13

### Hinzugefügt
- Erklärungen: Fach Vorschriften der Klasse N vollständig erklärt (204 von 204 Fragen), 89 neue Erklärungen
- Begriffsblätter: AFuG, Funken im Ausland (CEPT, HAREC), Personenschutz (EMVU, BEMFV), Remote-Betrieb, Störungen
- Begriffsblätter: Klubstation/Relais/Bake, Gerät und Anlage, Ausbildungsfunkbetrieb, Fernmeldegeheimnis, Beiträge und Gebühren
- Begriffsblatt Wer regelt was: FuAG, TTDSG und Frequenzzuteilung ergänzt, VE102, VE103 und VD703 zugeordnet
- Erklärungen: VD408 und VD703 mit eigenem Prinzip vor dem Blatt-Prinzip

### Geändert
- `erklaerungen.json`: 712 → 801 Erklärungen, 11 → 21 Begriffsblätter, Klasse N 424 von 571 Fragen erklärt

### Behoben
- Begriffsblätter: fehlendes Prinzip bei den sechs älteren Blättern nachgetragen (171 Fragen), alle 21 Blätter mit Prinzip

## [1.289.0] - 2026-09-13

### Hinzugefügt
- Stolpersteine: zusätzliche Zeile mit der eigenen falschen Antwort und dem passenden Warum-falsch-Satz
- Stolpersteine: falsche Antwort mit rotem ✗ markiert, Erklärung grau darunter, Kopf zählt Fragen mit Satz

### Geändert
- Lernstand: falsche Antwort zusätzlich als Text gespeichert (`e.fa`), unabhängig von der Antwortmischung
- Fortschrittsdateien: Feld `e.fa` rein zusätzlich, ältere Dateien laden unverändert
- `Index.html`: neue Funktionen `letzteFalscheAntwort`, `warumFalschSatz`, `warumFalschVorhanden`
- Merkblatt und Hörbuch: weiterhin nur die richtige Antwort

## [1.288.0] - 2026-09-13

### Hinzugefügt
- Erklärungen: Paket 4, Pflichten der AFuV im Betrieb (VD102 bis VD119), 17 Fragen an einem neuen Begriffsblatt
- Begriffsblatt AFuV: offene Sprache, Notzeichen, unerwünschte Aussendungen, Logbuch, Rufzeichenliste, Klubstation/Relais/Bake
- Begriffsblatt AFuV: Prinzip Maßstäbe statt Zahlen
- Klasse N: 335 von 571 Fragen erklärt, insgesamt 712 Erklärungen und 11 Begriffsblätter

### Geändert
- `erklaerungen.json`: 695 → 712 Erklärungen, 10 → 11 Begriffsblätter

## [1.287.0] - 2026-09-13

### Hinzugefügt
- Erklärungen: Paket 3, Rufzeichen-Arten und Zusätze, 26 Fragen am Begriffsblatt Deutsche Rufzeichen lesen
- Begriffsblatt Rufzeichen: Präfix/Ziffer/Suffix, DL/DO/DN, Klubstation, Sonderrufzeichen, Zusätze /m /mm /p /R /T, Gastkenner
- Erklärungen: Peilsender-Kennungen (BD109) mit eigenem Prinzip
- Erklärungen: Farbcode am Widerstand, 9 Fragen mit neuem Begriffsblatt und Rechenverfahren
- Klasse N: 318 von 571 Fragen erklärt, insgesamt 695 Erklärungen und 10 Begriffsblätter

### Geändert
- `erklaerungen.json`: 660 → 695 Erklärungen, 8 → 10 Begriffsblätter

## [1.286.0] - 2026-09-13

### Hinzugefügt
- Erklärungen: Paket 2, Bänder und Frequenzbereiche, 29 Fragen am Begriffsblatt Die Bänder in Deutschland
- Begriffsblatt Bänder: 14 Bänder von 160 m bis 13 cm, Bereichsnamen MF/HF/VHF/UHF, Bänder der Klasse N, primär/sekundär
- Erklärungen: VD706 (primär/sekundär) und VD738 (Bandbreite) mit eigenem Prinzip
- Klasse N: 283 von 571 Fragen erklärt, insgesamt 660 Erklärungen und 8 Begriffsblätter

### Geändert
- `erklaerungen.json`: 631 → 660 Erklärungen, 7 → 8 Begriffsblätter
- Begriffsblatt Bänder: Angaben außerhalb des Katalogs (40 m, 6 m, 2 m in anderen ITU-Regionen) im Feld `quelle` belegt

### Behoben
- Erklärungen Bänder: unbelegte Aussagen zu 7,1 MHz, 21,35 MHz, 438 MHz und 1850 kHz berichtigt
- Erklärungen VD706, VD738, VD741, VD742: falsche bzw. unbelegte Bandbreiten und Rangfolgen entfernt

## [1.285.0] - 2026-09-13

### Hinzugefügt
- Erklärtafel: neue erste Zeile Das Prinzip (Feld `prinzip`), wird zuerst vorgelesen
- Prinzip: im Eintrag oder aus dem Begriffsblatt, eigenes Prinzip im Eintrag hat Vorrang
- Erklärungen: Paket 1, 59 Fragen mit Bildantworten (6 Klasse N, 27 N → E, 26 E → A)
- Begriffsblatt Einen Stromkreis lesen: 9 Zeilen für sieben Schaltbildfragen

### Geändert
- `Index.html`: `erklaerInhalt()` und `erklaerVorlesen()` lösen `prinzip` auf
- `erklaerungen.json`: 572 → 631 Erklärungen, 6 → 7 Begriffsblätter, neues Kopffeld `prinzip_feld`
- Werkzeuge: `bildantworten.py` auch für Fragen ohne Fragenbild, neu `lupe.py` zur Detailvergrößerung
- Erklärungen AD204 und AJ208: Hinweis auf mehrdeutige bzw. unübliche Katalogantwort

### Behoben
- Vorlesen: Blatt-Titel ohne Schlusspunkt lief in die erste Zeile über

## [1.284.0] - 2026-09-13

### Hinzugefügt
- Begriffsblätter: gemeinsame Listen für Fragengruppen, Abschnitt `gruppen` in `erklaerungen.json`
- Begriffsblätter: Leistung (PEP, ERP, EIRP), Q-Gruppen, Wer regelt was, IARU-Bandplan 2 m/70 cm, Abkürzungen, Betriebsarten
- Erklärungen: 175 neue Fragen der Klasse N, jetzt 248 von 571 erklärt
- Fragen-Eintrag: Verweis per `gruppe`, eigene `liste` hat Vorrang vor dem Blatt

### Geändert
- `erklaerungen.json`: Abschnitt `gruppen`, Kopffeld `blaetter`, 397 → 572 Erklärungen
- `Index.html`: `erklaerInhalt()` und `erklaerVorlesen()` lösen Liste, Merksatz und Titel aus dem Blatt auf
- Erklärtafel: langer Inhalt scrollt innerhalb (`.et-buehne`)
- `eintragen.py`: prüft auch die Begriffsblätter

### Behoben
- Bandplan-Blatt: falscher Merksatz zum 70-cm-Band, Relais liegen dort über dem Satellitenbereich
- Vorlesen: Malpunkt in Blättern wurde als mal gesprochen, durch und bzw. Komma ersetzt

## [1.283.0] - 2026-09-13

### Geändert
- Vorlesen: Landeskenner und Rufzeichen werden buchstabiert (z. B. P-Y, C-E und V-E)
- Vorlesen: Bereiche wie DA-DR als D-A bis D-R gesprochen
- Vorlesen: Buchstabieren nur mit fester Landeskennerliste und nur in Fragen zu Kennern, Präfixen und Rufzeichen (25 Fragen)
- Erklärtafel: Buchstabieren auch in den Sätzen zu falschen Antworten

## [1.282.0] - 2026-09-13

### Hinzugefügt
- Erklärungen: Landeskenner der Klasse N (BD301 bis BD318) mit Eselsbrücken
- Erklärtafel: Tabelle Die Kenner (Kenner, Land, Eselsbrücke) und Zeile Zum Merken, beide vorlesbar

### Geändert
- Erklärtafel: Überschrift Erklärung bei Fragen ohne Zeichnung, Zusatz mit Rechenweg nur bei vorhandenem Rechenweg
- Kachel Mit Erklärung: Klasse N 73 statt 55 Fragen, Untertitel Fragen mit Erklärung
- Landeskenner: Zuordnungen gegen 12db.de und 50ohm.de geprüft

## [1.281.0] - 2026-09-12

### Hinzugefügt
- Erklärtafel: Vorlese-Knopf in der Kopfzeile, liest die Abschnitte in Anzeigereihenfolge
- Vorlesen: aktueller Abschnitt gelb hervorgehoben und automatisch in den Blick gerollt
- Vorlesen: Formeln sprechbar über `sprechbar()` (=, ², ·, √, ∥, Tiefzahlen, Zehnerpotenzen)
- Vorlesen: stoppt beim Schließen der Tafel und bei Weiter

### Geändert
- `playTTSQueue()`: optionaler dritter Parameter für den Knopfzustand
- `stopTTS()`: setzt beide Vorleseknöpfe zurück

### Behoben
- `sprechbar()`: Zehnerpotenzen vor einzelnen Hochzahlen erkannt

## [1.280.0] - 2026-09-12

### Hinzugefügt
- Erklärungen: alle 379 Fragen mit Zeichnung (226 E → A, 98 N → E, 55 Klasse N)
- Erklärungen: Im Bild, Der Kniff, 131 Rechenwege und 1083 Sätze zu falschen Antworten
- Erklärungen: 18 Fragen mit Bildantworten beschreiben die Antwortbilder nach Inhalt
- Erklärungen: Blindantworten ohne Rechenweg ausdrücklich gekennzeichnet
- Erklärungen Klasse N: Fachbegriffe und Abkürzungen jeweils mit erklärt

### Behoben
- Zeichnungen: elf als `.svg` benannte PNG-Dateien dokumentiert, Anzeige im Browser nicht betroffen

## [1.279.0] - 2026-09-12

### Geändert
- Erklärung und Notiz: Tafel an Stelle des Antwortkastens statt schwebendem Fenster, ohne Abdunklung
- Tafel: übernimmt die Höhe des Antwortkastens (`offsetHeight`), längerer Text scrollt innerhalb
- Tafel: Schließen per Kreuz, Escape oder erneutem Knopfdruck, Erklärung und Notiz schließen sich gegenseitig
- Notizfeld: beim Anzeigen der Frage immer geschlossen, vorhandene Notiz über Zettel in der Kopfzeile angezeigt
- Formelblatt und Glühbirne: pulsen abwechselnd, je Schlag 620 ms
- Nach falscher Antwort pulst nur die Glühbirne, nach richtiger nichts

### Behoben
- Pulsen: Takt am Ende von `renderQuestion()`, vorher pulste nur das Formelblatt

## [1.278.0] - 2026-09-12

### Hinzugefügt
- Fragenansicht: Fußzeile ausgeblendet, Knopf ⓘ blendet sie am Fensterrand ein (`position: fixed`), Escape blendet aus

### Geändert
- Zoom-Automatik: geht bei zu langen Fragen stufenweise herunter, Wert gilt dann für die ganze Seite
- Zoom-Automatik: zuerst Schriftstufe der Frage, dann Seitenzoom, höchstens drei Stufen
- Zoom-Automatik: Wert je Fenstergröße gemerkt, Zurücksetzen durch festen Wert und zurück auf Automatisch

### Behoben
- Fragenansicht: passt wieder ins Fenster, Schriftstufe misst die Seitenhöhe (`scrollHeight`) statt der Knopfleiste
- Schriftstufe: Nachprüfung nach dem Laden der Zeichnungen, nur verkleinernd

## [1.277.0] - 2026-09-12

### Hinzugefügt
- Erklärung: eigener Knopf mit Glühbirne neben dem Formelblatt, nur bei vorhandener Erklärung, pulst
- Erklärung: eigenes verschiebbares Fenster unten, schließt per Escape, Kreuz oder Klick daneben
- Erklärung: vor der Antwort Im Bild und Der Kniff, danach Rechenweg und Warum die anderen falsch sind
- Erklärung: in allen Modi (Lernmodus, Blättern, Merkliste, Suche, Gruppenraum), nicht im Prüfungssimulator

### Geändert
- Fenster-Mechanik: gemeinsame Funktion für Formelblatt und Erklärung
- Pulsen: Erklärungsknopf 900 ms nach dem Formelblatt und erneut nach falscher Antwort, ohne Ton
- Fragenansicht: kein Scrollen mehr durch den Erklärungskasten

### Behoben
- Erklärung: nach richtiger Antwort kaum auffindbar und erst nach dem Antworten verfügbar
- CHANGELOG: Datum von 1.276.0 auf 12.09.2026 korrigiert

## [1.276.0] - 2026-09-12

### Hinzugefügt
- Erklärungen zu Fragen mit Zeichnung: Im Bild, Der Kniff, Der Weg, Warum die anderen falsch sind
- Erklärungen: zwölf schwere Fragen E → A (AD212, AD321, AD803, AD806, AF107, AG115, AG217, AG422, AI306, AI601, AI610, AI611)
- Erklärungen: Zuordnung über Antworttext statt Position, gewählte falsche Antwort hervorgehoben
- Erklärkasten als `<details>`, nach falscher Antwort aufgeklappt, `erklaerungen.json` optional
- Blättern: Kachel Mit Erklärung für das gewählte Prüfungsziel

### Geändert
- Anzeige Automatisch: Zoomstufe wird schrittweise gesucht (`scrollHeight`), ohne Scrollbalken, unten mind. 14 px frei
- Anzeige Automatisch: Untergrenze 870 px in der Höhenrechnung entfernt

### Behoben
- Anzeige Automatisch: `anzeigeAnwenden()` lief beim Laden nicht, jetzt nach Seitenaufbau und nach Laden der Schriften
- Server: `erklaerungen.json` lieferte 404, jetzt in `PUBLIC_FILES`, `PAKET_DATEIEN` und `ABGLEICH_DATEN`

## [1.275.0] - 2026-09-11

### Hinzugefügt
- Pakete: `.deb` (Debian, Ubuntu, Mint, Raspberry Pi OS), `.rpm` (Fedora, openSUSE, RHEL), ZIP für macOS ab 11
- Pakete: vollständiger Inhalt ohne `npm install`, Abhängigkeit Node.js ab 18
- Pakete: Starter spiegelt das Programm in den Heimatordner, `data/`, `backup/` und Caches bleiben erhalten
- Mac-App unsigniert, Hinweis in `ZUERST-LESEN.txt`
- Build-Skript `pakete_bauen.sh` mit Positivliste

### Geändert
- `Release-Hochladen.bat`: veröffentlicht alle Pakete einer Fassung in einem Release, fremde Fassungen übersprungen
- `Release-Hochladen.bat`: Beschreibung berücksichtigt bereits vorhandene Anhänge
- `Release-Hochladen.bat`: Beschreibung unter der GitHub-Grenze von 125.000 Zeichen, ältere Fassungen als Verweis

### Behoben
- `Hochladen.bat`: Enter bei Rückfrage zählte als Nein, Änderungen blieben liegen, jetzt Enter = Ja
- `Hochladen.bat`: zeigt vor dem Push Commits und Dateien, danach verbliebene lokale Änderungen

## [1.274.0] - 2026-09-11

### Behoben
- Lupe: vergrößert nur die Zeichnung statt des Bildkastens samt weißem Rand (`naturalWidth`/`naturalHeight`)
- Lupe: korrektes Seitenverhältnis bei Antwortbildern und Fragebild

## [1.273.0] - 2026-09-11

### Behoben
- Lupe: SVG ohne `viewBox` skalierte nicht, `viewBox` wird im Speicher ergänzt und als `data:`-URL angezeigt
- Lupe: Ergebnis je Datei gemerkt, Bilder der aktuellen Frage vorgeladen, bei Lesefehler bisheriger Weg

## [1.272.0] - 2026-09-11

### Hinzugefügt
- Abschlussfenster Noch nie geübt: zweiter Knopf Lernbedarf neben Stolpersteinen, jeweils mit aktueller Anzahl
- Abschlussfenster: Hinweiszeile zum Unterschied Stolpersteine/Lernbedarf, leere Listen ausgeblendet

## [1.271.0] - 2026-09-11

### Hinzugefügt
- Belohnungsklang `sounds/level-up.wav`, wenn eine Frage dreimal in Folge richtig beantwortet wurde
- Abschlussfenster nach der Runde Noch nie geübt mit Klang und Knopf Weiter mit Stolpersteinen
- Einstellungen → Nachteilsausgleich → Belohnung: Ton und Fenster einzeln abschaltbar, Probeton beim Einschalten

## [1.270.0] - 2026-09-11

### Geändert
- Formelblatt-Ton: bei jeder Frage mit Formelblattbezug statt einmal je Sitzung
- Einstellungen → Formelblatt: eigener Haken für den Ton, abhängig vom Hinweis, Probeton beim Einschalten

## [1.269.0] - 2026-09-11

### Behoben
- Blättern: Kacheln Rest abarbeiten und Noch nie geübt fehlten bei frischem Prüfungsziel, stehen jetzt immer
- Blättern: Zusatz Derzeit ist das der ganze Katalog, wenn die Menge dem Katalog entspricht

## [1.268.0] - 2026-09-11

### Behoben
- Prüfungssimulator: beide Ankreuzfelder wieder gleich groß (17 × 17 px, `flex:0 0 17px`)

## [1.267.0] - 2026-09-11

### Geändert
- Blättern: Fenster öffnet immer, auch bei N → E und E → A ohne Lesezeichen
- Blättern: Kacheln Rest abarbeiten und Noch nie geübt nur, wenn sie vom ganzen Katalog abweichen

## [1.266.0] - 2026-09-11

### Geändert
- Schließen-Knöpfe: einheitlicher Hover-Effekt in allen Fenstern, Farben aus dem Mode (`--line`, `--ink`) statt Rot
- Schließen-Knöpfe: Form bleibt, gilt u. a. für Auswertung, Stolpersteine, Formelsammlung, Einstellungen und Simulator

## [1.265.0] - 2026-09-11

### Geändert
- Auswertung: feste Fensterhöhe in allen Prüfungszielen, kein Springen beim Zielwechsel
- Auswertung: Spaltenraster füllt die ganze Höhe des Inhaltsbereichs

## [1.264.0] - 2026-09-11

### Hinzugefügt
- Auswertung: Startkasten für neue Prüfungsziele mit Fortschritt und Knöpfen Blättern und Noch nie geübt, ab zehn Antworten aus

### Geändert
- Auswertung: kein Rollbalken, entbehrliche Zeilen werden nach dem Aufbau stufenweise ausgeblendet
- Auswertung: Knopf Alle ansehen immer über beiden Listen
- Auswertung: Balken mit Bestehensgrenze auch ohne 25 Antworten (N → E, E → A)
- Auswertung: Kästen Stolpersteine und Woran es liegt immer sichtbar, mit Platzhaltertext

## [1.263.0] - 2026-09-11

### Hinzugefügt
- Prüfungssimulator: Option Erschwerte Bedingungen, bevorzugt wacklige Fragen
- Erschwerte Bedingungen: Themenverteilung aus normaler Ziehung, innerhalb der Lernziele gewichtet nach `reifeChance()`
- Erschwerte Bedingungen: Aufschlag bei wiederholt gleicher falscher Antwort, etwa dreimal so viele Stolpersteine je Bogen
- Prüfungssimulator: Kopfzeile mit Zusatz erschwert, Anzahl wackliger Fragen je Teil, Einstellung wird gemerkt

## [1.262.0] - 2026-09-11

### Hinzugefügt
- Blättern: vierte Kachel Noch nie geübt, gezählt wie in der Prüfungsreife (ohne CB-Anrechnung)

### Behoben
- Auswertung: doppelter Abstand zwischen den Kästen links entfernt (`gap` 0,7 rem ohne `margin-top`)

## [1.261.0] - 2026-09-11

### Hinzugefügt
- Woran es liegt: Herz zum Merken und Knopf Üben je Zeile, gemeinsame Merkliste mit den Stolpersteinen

### Geändert
- Auswertung: Auffrischung von rechts nach links unter die Tempo-Probe verschoben

## [1.260.0] - 2026-09-11

### Hinzugefügt
- Auswertung: Geraten oder gewusst, Trefferquote schneller Antworten mit Binomialtest bewertet
- Tempo-Probe: Leseschwelle nach Fragenlänge, Fragen mit Formelblatt, Rechner oder Vorlesen ausgenommen
- Lernstand: Zeit und Ergebnis als Paar gespeichert (`amateurfunk_tempo_<Platz>`, letzte 600 Antworten)
- Geraten oder gewusst: Hinweis bei gehäuft gleicher Antwortposition
- Gruppenraum: Kursleiter-Auswertung mit Tabelle Wie geantwortet wurde je Teilnehmer, Namen nur per Schalter
- Server: überträgt Startzeiten für die Zeitmessung im Gruppenraum

### Geändert
- Woran es liegt: Vorschau eine Zeile je Art, Begründung nur im Fenster
- Fenster Alle Stolpersteine und Woran es liegt: gleiche Größe wie die Auswertung

### Behoben
- Woran es liegt: Knopf Alle ansehen fehlte, wenn nichts ausgelassen wurde

## [1.259.0] - 2026-09-11

### Hinzugefügt
- Übungszeit: Tagesansicht der letzten 14 Tage über der Wochenansicht
- Übungszeit: Wochentagsbuchstaben, Fuge vor jedem Montag, Wochenende abgesetzt
- Übungszeit: Tooltip mit Datum und Übungsdauer je Balken

## [1.258.0] - 2026-09-11

### Geändert
- Anleitung: gleiche Fenstergröße wie Einstellungen mit fester Höhe, Inhalt scrollt innen

## [1.257.0] - 2026-09-11

### Hinzugefügt
- Woran es liegt: Knopf Alle ansehen mit vollständiger Liste

### Geändert
- Auswertung rechts: Stolpersteine, Befunde und Auffrischung in eigenen Kästen mit einheitlicher Kopfzeile
- Befund-Block: zwei Zeilen je Art statt bis zu sechzehn

## [1.256.0] - 2026-09-11

### Geändert
- Fenster: einheitlich 62 % Abdunklung ohne Unschärfe, 25 Fenster angepasst
- Vorlesen-Einstellungen und Gruppenraum: Abdunklung von 85 % auf 62 % reduziert
- Formelsammlung und Taschenrechner: Hintergrundverhalten unverändert

## [1.255.0] - 2026-09-11

### Geändert
- Auswertung: Prüfungsreife und Trefferquoten in einer Zeile je Prüfungsteil zusammengeführt
- Auswertung: Lernstand je Teil mit gelernt, Trefferquote und noch nie geübt unter dem Balken
- Auswertung: gemeinsame Zählung mit getrennter Technik (`technik_n`, `technik_e`, `technik_a`)
- Prüfungsreife: Kasten auch ohne Vorhersage sichtbar, mit Hinweis auf fehlende Antworten
- Auswertung: Sonderregel zum Ausblenden der linken Spalte entfernt

## [1.254.0] - 2026-09-11

### Hinzugefügt
- Übungszeit: eigener Knopf mit Uhr in der Kopfzeile neben den Einstellungen, eigenes Fenster

### Geändert
- Auswertung: Trefferquoten-Tabelle in eigener Kachel links unter der Prüfungsreife
- Auswertung: linke Spalte nie mehr leer, Ausblenden entfällt
- Übungszeit: aus der Auswertung entfernt, ohne doppelte Überschrift, Hinweistext bei fehlenden Daten

## [1.253.0] - 2026-09-10

### Behoben
- Formelblatt: 43 weitere Fragen mit Formelblatt-Knopf, u. a. Bandgrenzen VD709 bis VD723
- Formelblatt: Blatt Seite für Seite zugeordnet (Rufzeichen, Zusätze, Peilsender, EIRP, Wellenlänge)
- Formelblatt: fünf Seitentitel präzisiert
- `formelhilfe.json`: 492 → 535 Zuordnungen, Knopf bei Klasse N 114, N → E 139, E → A 282 Fragen

## [1.252.0] - 2026-09-10

### Behoben
- Formelblatt: zwölf Fragen ohne Knopf zugeordnet (Seite 4 und 5, u. a. VD724, VD738 bis VD742)
- Formelblatt: sieben 70-cm-Fragen (BC206 bis BC222) zeigen auf den 70-cm-Bandplan (Seite 12) statt auf den 2-m-Plan
- Formelblatt: Bandplan-Stellen korrekt benannt (2 m Seite 11, 70 cm Seite 12)
- Formelblatt: acht Seitentitel an das PDF angeglichen
- `formelhilfe.json`: 480 → 492 Zuordnungen

## [1.251.0] - 2026-09-10

### Geändert
- Formelsammlung: Hintergrund nur noch leicht abgedunkelt (14 % statt 72 % mit Unschärfe), Frage bleibt lesbar
- Formelsammlung: Fenster am Kopf verschiebbar, öffnet beim nächsten Mal wieder zentriert
- Formelsammlung: Verschieben per `transform` unter Berücksichtigung des Anzeigefaktors, Kopf bleibt immer greifbar
- Formelsammlung: Klick daneben schließt weiterhin, Klick auf den Kopf nicht

## [1.250.0] - 2026-09-10

### Geändert
- Zeitauswertung: tatsächliche Vorlesedauer wird gemessen und von der Bearbeitungszeit einer Frage abgezogen
- Zeitauswertung: Vorlesen als Hilfsmittel vermerkt wie Formelblatt und Rechner, Marken vorgelesen/nachgeschlagen/mit Hilfsmittel
- Zeitauswertung: auffällige Fragen mit Vorlesen nicht mehr als langsam, sondern als gute Gewohnheit eingestuft
- Vorlesen: Vorgänge unter 1,5 s (z. B. ohne eingerichtete Stimme) gelten nicht als vorgelesen
- Übungszeit: unverändert, Vorlesezeit zählt dort weiter als Übung

## [1.249.0] - 2026-09-10

### Geändert
- Fragebild: steht im grauen Fragenkasten unter dem Fragetext statt darüber, gilt für alle Fragen mit Bild
- Lupe: Vergrößerungsfaktor von 2,2 auf 1,6, Fensteranteil von 76 auf 62 % gesenkt, Frage und Nachbarbilder bleiben sichtbar
- Lupe: kleine Fragebilder weiter über feste Zielgröße etwa dreifach vergrößert
- Große Anzeige (1920×1080, 120 %): Antwortbilder bewusst klein gehalten, um Rollbalken zu vermeiden

## [1.248.0] - 2026-09-10

### Behoben
- Fragebild: fehlte bei 18 Fragen mit zusätzlichen Antwortbildern (u. a. AB404–AB407, AC405, AC406, NE206–NE208, ED304)
- Fragebild: Suche schließt Antwortbilder aus, kein doppeltes Bild bei NB401, NB702, NB703, NC404, NI103, NI104
- Bildgröße: Berechnung wartet auch auf das Fragebild, Knopfleiste bleibt sichtbar
- Bildgröße: Fußzeile zählt bei der Überlaufprüfung mit; ist das Ziel unerreichbar, zählt nur die sichtbare Knopfleiste
- Fragebild: bei zusätzlichen Antwortbildern engere Höhengrenze, große Ansicht über die Lupe

## [1.247.0] - 2026-09-10

### Behoben
- Lupe: vergrößert Antwortbilder wieder ohne Nachteilsausgleich (Zielgröße lag unter der Ausgangsgröße)
- Lupe: Zielgröße wächst mit der Bildgröße mit (mindestens 2,2-fach)
- Lupe: getrennte Fensteranteile für Breite und Höhe, flache Schaltbilder nutzen die verfügbare Breite
- Lupe: Fragebilder unverändert (Faktor 2,55), ungewöhnlich große Fragebilder werden jetzt ebenfalls vergrößert

## [1.246.0] - 2026-09-10

### Behoben
- Fragenansicht: kein Strecken der Seite mehr beim Laden einer Frage in langen Runden (z. B. 716 Fragen)
- Fortschrittsspalte: Höhengrenze im Stilblatt, greift schon beim ersten Bildaufbau ohne JavaScript
- Fortschrittsspalte: Höhenmessung ohne Flex-Streckung, ein Schritt statt bis zu 75 Bildaufbauten
- Fortschrittsspalte: exakt so hoch wie die Frage, Knopfleiste in allen geprüften Fenstergrößen sichtbar

## [1.245.0] - 2026-09-10

### Hinzugefügt
- Bildfragen: Seitenverhältnisse geladener Bilder werden gespeichert (auch über Neustart), Höhe steht beim erneuten Anzeigen sofort
- Bildfragen: Bilder der nächsten Frage werden im Hintergrund vorgeladen

### Behoben
- Seitenaufbau: kein kurzes Strecken mehr durch geschätztes Seitenverhältnis, Größe erst nach dem Laden der Bilder
- Bildantworten: nutzen den freien Platz bis zur Kastenbreite, Rücknahme nur bis die Knopfleiste im Fenster steht
- Bildantworten: größer als zuvor, z. B. 1440×930 von 120 auf 153 px, 1920×1080 von 163 auf 188 px

## [1.244.0] - 2026-09-10

### Geändert
- Vorlesen: Bildantworten ohne das Wort Bild, nur noch Antwort A usw. (auch Beschriftung für Vorleseprogramme)
- Vorlesen: 2,6 s Pause nach jeder Bildantwort, Antwort bleibt dabei hervorgehoben

### Behoben
- Bildantworten: Größe wird nach dem Laden jedes Bildes neu berechnet, Knopfleiste ohne Rollen erreichbar
- Bildantworten: Regelung einheitlich nach der Knopfleiste, Untergrenze ist die Ausgangsgröße
- Auswertung: rechte Seite nutzt die volle Breite, wenn die Prüfungsreife links leer bleibt

## [1.243.1] - 2026-09-10

### Behoben
- Bildantworten: Größenbremse richtet sich nach Sichtbarkeit der Knopfleiste statt nach dem Zustand vorher
- Bildantworten: mehr Reserve (28 statt 14 px Abstand zur Leiste, 90 statt 94 % der errechneten Höhe)
- Bildantworten: bei unerreichbarem Ziel (z. B. Anzeige 120 %) Regelung nach Container-Lücke statt Minimalgröße

## [1.243.0] - 2026-09-10

### Geändert
- Bildantworten: skalieren mit dem freien Platz, z. B. NB703 von 81 auf 159 px Höhe, Kastenbreite 419 statt 156 px genutzt
- Bildantworten: Höhe aus Lücke bis Ende Fragencontainer berechnet, Grenzen 90 bis 300 px, Bremse gegen Überstand
- Bildantworten: klein deklarierte SVG-Dateien ohne viewBox werden auf die errechnete Größe gezogen, bleiben scharf

## [1.242.0] - 2026-09-10

### Hinzugefügt
- Formelblatt-Knopf: pulst dreimal bei Fragen mit Stelle im Formelblatt, einmal je Sitzung zusätzlich kurzer Zweiklang
- Formelblatt-Knopf: bei `prefers-reduced-motion` stehender Schein, kein erneutes Pulsen beim Neuzeichnen derselben Frage
- Einstellungen: Hinweis abschaltbar unter Vorlesen → Formelblatt (Standard an), Ton wird erzeugt statt als Datei geliefert
- `_Formelblatt-Analyse.md`: Auswertung über alle drei Kataloge, 470 von 1750 Fragen im Formelblatt lösbar

### Geändert
- Formelblatt-Analyse: Berechnung von Schaltungen gilt als lösbar, wenn die Formel im Blatt steht

## [1.241.0] - 2026-09-10

### Hinzugefügt
- Zeitauswertung: Öffnen von Formelblatt und Rechner wird je Frage vermerkt (`fb`, `tr`)

### Geändert
- Auswertung: richtig, aber langsam aufgeteilt, mit Nachschlagen grün als gute Gewohnheit, ohne Hilfsmittel neutral blau
- Auswertung: Zusammenfassung zählt alle Fragen mit genutztem Hilfsmittel
- Auswertung: Schlusszeile und Einleitung neu, längere Bearbeitungszeit nicht mehr als Risiko gewertet
- Formelhilfe: 114 der 571 Fragen der Klasse N mit Stelle im Formelblatt (zuvor fälschlich 534 angegeben)

## [1.240.0] - 2026-09-10

### Hinzugefügt
- Auswertung: Abschnitt Woran es liegt mit drei Befunden: festsitzender Irrtum, geraten, richtig aber langsam
- Auswertung: festsitzender Irrtum nennt Buchstaben und vollen Text der wiederholt gewählten Antwort
- Auswertung: langsam ab gut doppeltem eigenem Median; ohne Befund Meldung erst ab 15 gemessenen Fragen
- Fragenansicht: Vorsatz-Hinweis bei falscher Antwort mit gleicher Zahl und anderem Vorsatz (z. B. kV statt mV)

### Behoben
- Vorsatzerkennung: vergleicht den Zahlenwert statt der Ziffernfolge
- Auswertung: Antworttext nicht mehr nach 60 Zeichen abgeschnitten

## [1.239.1] - 2026-09-10

### Behoben
- Zeitkachel: übernimmt den Farbton der Kennzahl-Kästchen im jeweiligen Farbstil (`--zeit-grund`, `--zeit-rand`)
- Zeitkachel: Wochenzahl in `#0a6b7a`, Kontrast mindestens 4,67:1 in allen fünf Farbstilen
- Übungsverlauf: Woche ohne Übung wieder als grauer 2-px-Strich sichtbar

## [1.239.0] - 2026-09-10

### Hinzugefügt
- Auswertung: Gesamtübungszeit mit Zeitraum (Anzahl Tage) unter der Wochenzeit
- Auswertung: Kasten Deine Übungszeit mit Verlauf der letzten acht Wochen, Gesamtzeit, Übungstagen, Tagesschnitt, längstem Tag
- Übungsverlauf: laufende Woche als jetzt und läuft noch gekennzeichnet

### Geändert
- Zeitkachel: in der Seitenleiste untereinander statt zweispaltig
- Zeitkachel: Vorwoche als absolute Zeit statt Differenz
- Zeitkachel: noch nichts statt 0 s, solange in der Woche nicht geübt wurde

### Behoben
- Zeitkachel: Kontrast der Wochenzahl erhöht (`#0a7a8b`, 4,63:1), Verlaufssäulen dunkler (`#a3c8d0`)

## [1.238.0] - 2026-09-10

### Hinzugefügt
- Übungszeit: Erfassung je Tag, Anzeige der Wochenzeit mit heute und Vorwoche in der Auswertung
- Übungszeit: zählt nur bei laufender Runde, Fenster im Vordergrund und Klick oder Tastendruck innerhalb von 90 s
- Übungszeit: Tag nach lokaler Uhrzeit statt Weltzeit, Woche beginnt Montag
- Diagnose: je Frage die letzten zehn Versuche mit gewählter falscher Antwort und Bearbeitungszeit gespeichert
- Diagnose: Zeit einer Frage mit Unterbrechung wird verworfen
- Speicher: `amateurfunk_diagnose_<platz>`, `amateurfunk_uebungszeit_<platz>`, mit Reset, Benutzerwechsel und `/api/userdata`

## [1.237.0] - 2026-09-09

### Geändert
- Fragenansicht: Nummer links und Knöpfe rechts in eigener Kopfzeile, Fragetext darunter über die volle Breite
- Fragennummer: außerhalb des Fragetexts, weißes Feld mit Monoschrift auch außerhalb des DARC-Stils (dunkel: dunkelblau)

## [1.236.0] - 2026-09-09

### Geändert
- Fragenansicht: Fragetext umfließt die Knopfreihe (`float` statt Flex-Spalten), Textbreite z. B. 540 → 888 px
- Fragenansicht: unter 900 px Fensterbreite Knöpfe oben, Text darunter

## [1.235.0] - 2026-09-09

### Hinzugefügt
- Notizen: eigene Notiz je Frage über Notizzettel-Knopf neben Haken und Herz, farbig nur bei vorhandener Notiz
- Notizen: Eingabefeld unter den Antworten, Speichern 2 s nach der letzten Eingabe und beim Verlassen, leere Notizen gelöscht
- Notizen: Liste Alle Notizen mit Fragennummer, Fragetext und Sprung zur Frage
- Notizen: auf dem Blatt Vor der Prüfung unter der richtigen Antwort
- Notizen: je Benutzer in `amateurfunk_notizen_<Platz>`, bleibt beim Cache-Leeren erhalten, im Gruppenraum privat

### Behoben
- Notizen: Zuordnung über `data-qid` am Feld, keine Übertragung auf die nächste Frage beim Blättern

## [1.234.3] - 2026-09-09

### Geändert
- Programmsymbol: vollständige Tafel mit Schriftzug ab 48 statt ab 128 px, unter 48 px nur die Zahl 55

## [1.234.2] - 2026-09-09

### Behoben
- Programmsymbol: `icon.ico` aus `.gitignore` entfernt, Updates liefern das neue Symbol jetzt aus
- Paket: `icon.ico`, `favicon.ico` und `icon.png` in `PAKET_DATEIEN` aufgenommen

## [1.234.1] - 2026-09-09

### Hinzugefügt
- `Zeichen-Auffrischen.bat`: frischt Verknüpfungen per Doppelklick sofort auf, mit Ausgabe der Änderungen

### Behoben
- Update-Balken: Ansehen öffnet Einstellungen → Update statt der Anleitung (Aufruf einer nicht vorhandenen Funktion)
- Update-Balken: irreführender Rückfall im `catch` entfernt, Fehler erscheint in der Konsole
- Code: alle 192 Funktionsaufrufe aus `onclick`/`onchange` gegen vorhandene Definitionen geprüft
- Windows-Verknüpfungen: Symbol ausdrücklich auf `icon.ico` im Ordner der Verknüpfung gesetzt, `SHChangeNotify` zum Neuzeichnen
- Verknüpfungen: Auffrischen meldet alten und neuen Symbolpfad je Verknüpfung

## [1.234.0] - 2026-09-09

### Hinzugefügt
- Programmsymbol: automatisches Auffrischen der Verknüpfungen unter Windows, Linux und macOS (`verknuepfung_auffrischen.js`)
- Windows: `.lnk` neu gespeichert und `ie4uinit.exe -show`, Suche auf Desktop (auch OneDrive) und im Startmenü
- Linux: `.desktop` neu geschrieben, `update-desktop-database`, `gtk-update-icon-cache` und `gio set … trusted`
- `zeichen_bauen.py`: erzeugt `icon.icns` selbst, sieben Größen von 64 bis 1024
- Auffrischen nach Update, beim Start bei neuerem Symbol (`data/zeichen_stand.json`) und bei der Installation
- Auffrischen ändert nur vorhandene Verknüpfungen, legt nichts an und löscht nichts

### Behoben
- macOS: von `installieren.sh` angelegte `.app` erhält `icon.icns` und `CFBundleIconFile`, ältere Bündel werden nachgetragen

## [1.233.0] - 2026-09-09

### Hinzugefügt
- Benutzerplätze: Zurücksetzen-Knopf je Platz, löscht den Lernstand (Verlauf, Fehler, Lernbedarf, Merkliste, Diplome u. a.)
- Benutzerplätze: Name, Prüfungsziel und Einstellungen bleiben beim Zurücksetzen erhalten, ✕ entfernt weiterhin nur den Namen
- Benutzerplätze: Rückfrage im Trainer-Dialog mit Liste der betroffenen Daten, Knopf nur bei Plätzen mit Daten
- Benutzerplätze: `examHistory` des Platzes wird geleert, Anzeigen des aktiven Platzes sofort aktualisiert

## [1.232.0] - 2026-09-09

### Geändert
- Fragenansicht: Schriftgröße in drei Stufen bis 24 px, je Frage die größte passende Stufe
- Fragenansicht: Maßstab ist die Unterkante der Knopfleiste im Fenster, neue Entscheidung bei Änderung der Fenstergröße
- Fragenansicht: Stufenwahl in einem Durchgang ohne sichtbares Springen der Schrift

## [1.231.5] - 2026-09-09

### Behoben
- Haken und Herz: Erklärung beim Überfahren wieder da (`title` für die Anzeige, `data-tooltip` fürs Vorlesen)
- Haken und Herz: Text beim Überfahren wechselt mit dem Zustand
- Taschenrechner und Formelblatt: erstmals Erklärung beim Überfahren, damit alle sechs Knöpfe über der Frage beschriftet

## [1.231.4] - 2026-09-09

### Behoben
- Haken und Herz: Knöpfe wieder 36 px groß, nur Symbol ohne Wortbeschriftung
- Haken und Herz: Hinweiskasten benennt die Funktion (Herz = Merkliste, Haken = Gelernt), grau im Aus-Zustand bleibt

## [1.231.3] - 2026-09-09

### Behoben
- Merkliste: Merken meldet immer das Ergebnis, im Fehlerfall mit Grund
- Merkliste: Gegenprobe nach dem Speichern vergleicht die ganze Liste mit der Ablage
- Merkliste: stille `catch`-Blöcke in `saveFavorites()` und `toggleFavoriteCurrent()` ersetzt, Ausgabe in der Konsole (F12)

## [1.231.2] - 2026-09-09

### Geändert
- Hauptansicht: Knopf Merkliste wieder entfernt, Zugriff über das Herz in der Kopfzeile
- Merkliste: Hinweis auf gemerkte Fragen außerhalb des Prüfungsziels bleibt

## [1.231.1] - 2026-09-09

### Behoben
- Haken und Herz: im Aus-Zustand grau, Farbe nur im gesetzten Zustand
- Haken und Herz: Unterscheidung über die Beschriftung Gelernt und Merken/Gemerkt statt über den Farbton

## [1.231.0] - 2026-09-09

### Geändert
- Haken und Herz: Beschriftung Gelernt (grün) und Merken/Gemerkt (rot), unter 1200 px Fensterbreite nur Symbol
- Haken und Herz: Einblendung für zwei Sekunden nach jedem Klick mit Fragennummer und Stand der Merkliste
- Haken und Herz: Zustand über CSS-Klasse statt einzelner `style`-Zuweisungen

## [1.230.1] - 2026-09-09

### Behoben
- Haken und Herz: Farbe auch im Aus-Zustand (Haken grün, Herz rot), gesetzt = gefüllte Fläche
- Haken und Herz: Hinweiskasten des Trainers (`data-tooltip`) statt `title`, Haken verweist auf das Herz als Merkliste

## [1.230.0] - 2026-09-09

### Hinzugefügt
- Hauptansicht: Knopf Merkliste mit Anzahl zwischen Lernbedarf und Auffrischen

### Geändert
- Merkliste: Kopfzeile nennt die Anzahl gemerkter Fragen außerhalb des gewählten Prüfungsziels

## [1.229.3] - 2026-09-09

### Behoben
- Hauptansicht: im Vollbild keine leere Fläche links und kein überlanger Verlauf rechts mehr
- Karte: Mindesthöhe in Fensterhöhe nur noch während einer Runde (Klasse `runde-laeuft` über `updateVisibility()`)

## [1.229.2] - 2026-09-09

### Behoben
- Fragenansicht: kein Zucken der Seite beim Weiterblättern
- Layout: `scrollbar-gutter: stable` verhindert Rückkopplung durch ein- und ausblendende Rollleiste
- Verlaufsspalte: setzt eigenen Rollstand statt `scrollIntoView`, das Fenster rollt nicht mehr mit

## [1.229.1] - 2026-09-09

### Geändert
- Fragetext: 19,8 statt 20,8 px, Knopfleiste auch bei der längsten Frage (VD707) ohne Rollen erreichbar

### Behoben
- Antworttext: wächst mit (`.option-text` erbt die Schriftgröße statt fester 0,9 rem), 19,5 statt 14,4 px
- Bildantworten: `.option-grid .option-text` erbt ebenfalls die Schriftgröße

## [1.229.0] - 2026-09-09

### Geändert
- Fragenansicht: Fragetext 20,8 px, Antworttext 20,5 px (vorher 19,5 und 17,9 px)
- Längste Frage (VD707): Knopfleiste bleibt sichtbar, nur die Fußzeile liegt unter dem Rand

## [1.228.0] - 2026-09-09

### Geändert
- Antwortfelder: nutzen den freien Raum unter der Frage, Knopfleiste bleibt an derselben Stelle (z. B. 44 → 94 px)
- Layout: Flex-Kette `#questionContainer` → `.main-layout` → `.question-area` → `.options`, ohne `align-items: flex-start`
- Antwortfelder: wachsen einzeln, behalten ihre natürliche Grundhöhe, nichts wird abgeschnitten

## [1.227.0] - 2026-09-09

### Geändert
- Fragenansicht: Frage und Antworten rund 20 % größer (Fragetext 19,5 px, Antworten 17,9 px, Feldhöhe 44 px)
- Fragenansicht: Feldabstand 10 px, Fragennummer 14,7 px
- Schmale Fenster bis 1024 px: 17,3 und 16,0 px Schrift, 40 px Feldhöhe
- Stilblatt: Größenregeln hinter die Regeln des DARC-Stils verschoben, damit sie greifen

## [1.226.3] - 2026-09-09

### Geändert
- Wortmarke: kräftigeres Türkis `#0a9cb0` (3,3:1 bei großer Schrift)
- Wortmarke: in schmalen Fenstern dunklerer Ton für ausreichenden Kontrast, dunkle Fassung weiter `#35dff0`

## [1.226.2] - 2026-09-09

### Geändert
- Programmsymbol: 55 in Weiß statt Edelstahl-Verlauf, türkiser Schein bleibt
- Programmsymbol: S-Meter-Skala unter der Zahl
- Programmsymbol: Wellenausschläge begrenzt, obere Gruppe nach unten gerückt; nur Bilddateien und `zeichen_bauen.py`

## [1.226.1] - 2026-09-09

### Behoben
- Programmsymbol: dunkle Stufe im Edelstahl-Verlauf von 47 auf 62 % verschoben, kein scheinbarer Strich durch die 55
- Programmsymbol: nur Bilddateien (`icon-512.png`, `icon.ico`, `favicon.ico` u. a.) und `zeichen_bauen.py` geändert

## [1.226.0] - 2026-09-09

### Hinzugefügt
- `icon-512-maskierbar.png`: Symbol für den Android-Startbildschirm, randlos mit Zahl
- `zeichen_bauen.py`: Skript zum Erzeugen des Programmsymbols wird mitgeliefert

### Geändert
- Programmsymbol: neu gestaltet mit Wellenlinien, Türkis auf dunklem Grund und der 55 in der Mitte
- Programmsymbol: 55 in poliertem Edelstahl-Look
- Programmsymbol: drei Fassungen (ab 128 px vollständig, 48 bis 96 px Wellen und Zahl, bis 32 px nur Zahl)
- Wortmarke: Farbe des Programmsymbols (`--tuerkis`, `#0a7a8b`, dunkle Fassung `#35dff0`)
- Service Worker: Cache heißt `afu-trainer-v2`, alte Symbole werden verworfen
- `Server.js`: liefert neue Bilddatei aus, Neustart erforderlich

## [1.225.0] - 2026-09-09

### Geändert
- Lernkacheln: drei Kacheln in einer Reihe, unter 1150 px untereinander in voller Breite
- Lösungsweg-Kachel: Ω-Symbol statt Wurzelzeichen, Beschriftung 50Ω · Lösungsweg
- 50-Ohm-Kachel: Beschriftung 50Ω statt 50 Ohm
- Herkunftszeile: 50ohm.de (DARC) einmal mittig unter beiden DARC-Kacheln (Spalten 1fr 2fr)
- Lernkacheln: ohne Lösungsweg unverändert (zwei halbe oder eine volle Breite)

## [1.224.0] - 2026-09-09

### Geändert
- Fragenansicht: Knopfleiste bei jeder Frage auf gleicher Höhe, Karte mindestens fensterhoch
- Layout: Restplatz über `.card` → `.app-layout` → `.main-col` → `#questionContainer`, längerer Inhalt scrollt wie bisher

## [1.223.0] - 2026-09-09

### Geändert
- Lösungswege: Server lädt die 50ohm.de-Zuordnung im Hintergrund, wenn sie fehlt oder älter als 30 Tage ist
- Lösungswege: Abruf acht Sekunden nach dem Start, Fehler nur im Log, ohne Netz voll funktionsfähig
- Lösungswege: Browser prüft zwölf Sekunden nach dem Laden erneut, Knopf unter Wartung bleibt
- README: Angaben zum Internetzugriff um den automatischen Abruf ergänzt

### Behoben
- Server: Route `/api/50ohm-index-holen` aus dem Socket-Handler auf die oberste Ebene verschoben, kein Not found mehr

## [1.222.3] - 2026-09-09

### Behoben
- Lösungswege: Serverantwort erst als Text gelesen, keine irreführende JSON-Fehlermeldung mehr
- Lösungswege: bei 404 vom eigenen Server Hinweis auf kompletten Neustart des Trainers

## [1.222.2] - 2026-09-09

### Behoben
- Wartung und README: falsche Angabe entfernt, Lösungswege gebe es nur für Klasse A (z. B. NB505 vorhanden)
- Wartung: Hinweis, dass nicht jede Frage einen Lösungsweg hat, genaue Zahl nach dem Abruf

## [1.222.1] - 2026-09-09

### Geändert
- Wartung: zeigt die Anzahl der Lösungswege für das eingestellte Prüfungsziel, mit Hinweis wenn keine vorhanden

## [1.222.0] - 2026-09-09

### Hinzugefügt
- Lösungswege: Verweis auf den gerechneten Lösungsweg bei 50ohm.de (`50ohm.de/<Nummer>.html`) für Fragen, die einen haben
- Lösungswege: Zuordnung über `question_index.json` von 50ohm.de (Kapitel, Abschnitt, `has_solution`)
- Lehrgang: Verweis führt auf den genauen Abschnitt in der Ausgabe passend zum Prüfungsziel
- Wartung: Abruf der Zuordnung unter Einstellungen → Wartung → Lehrgang des DARC, nur auf Klick (ca. 200 KB)
- Lösungswege: nur gültige Fragennummern übernommen, Datei wird aus dem Gruppenraum mitgegeben
- Lösungswege: ohne Zuordnungsdatei Kapitelverweis wie bisher, keine Lösungswege

## [1.221.1] - 2026-09-09

### Behoben
- Stolpersteine: Fragetext in der Auswertung vollständig statt nach 88 Zeichen abgeschnitten

## [1.221.0] - 2026-09-09

### Hinzugefügt
- Stolpersteine: Markieren per Herz über die Merkliste, markierte Zeilen rosa hinterlegt
- Stolpersteine: Anzahl markierter Einträge und Knopf zum Üben genau dieser Fragen
- Stolpersteine: beim Umschalten wird nur die betroffene Zeile aktualisiert, kein Springen der Liste

### Behoben
- Stolpersteine: Herz immer gefüllt (`fas`), Zustand über Farbe grau oder rot statt umrandeter Variante

## [1.220.1] - 2026-09-09

### Geändert
- Auswertung: Fenster heißt nur noch Auswertung statt Auswertung & Sicherung
- Statistik-Knopf: Tooltip und Vorlesetext nennen den tatsächlichen Inhalt und den Ort der Sicherung

## [1.220.0] - 2026-09-09

### Hinzugefügt
- Statistik: Bestehensprognose als x von 10 Prüfungen, per Simulation (2000 Durchläufe, 25 Fragen je Teil ohne Zurücklegen)
- Prognose: bestanden nur, wenn jeder Prüfungsteil mindestens 19 Punkte erreicht
- Prognose-Balken: Farbe nach Wert von Rot über Gelb nach Grün (HSL), Beschriftung dunkler für bessere Lesbarkeit
- Prognose: bei fehlenden Antworten Hinweis auf den fehlenden Prüfungsteil statt Gesamtaussage
- Stolpersteine: Gesamtansicht mit vollem Fragetext, richtiger Antwort, Prüfungsteil und Zahl der Fehlversuche
- Stolpersteine: Üben je Frage und die 30 hartnäckigsten am Stück; wieder sichere Fragen grün markiert am Listenende

### Geändert
- Statistikfenster: Lernstand sichern entfernt, weiterhin in Hauptansicht und Einstellungen verfügbar
- Lernstand sichern: Bestätigung als Fenster, wenn kein Hinweisfeld vorhanden ist

## [1.219.0] - 2026-09-09

### Geändert
- Einstellungen: Fenster in allen Reitern gleich hoch (83 % der Fensterhöhe), kein Springen beim Reiterwechsel
- Einstellungen: Scrollen nur im rechten Blatt, Reiterspalte bleibt fest; Mindesthöhe von 380 px entfallen

## [1.218.0] - 2026-09-09

### Geändert
- Merkblatt umbenannt in Vor der Prüfung

### Behoben
- Vor der Prüfung: Bildfragen zeigen das Bild der richtigen Antwort (bis 88 × 56 mm, weiß hinterlegt)
- Vor der Prüfung: Fragebild und Antwortbild werden nicht doppelt gedruckt

## [1.217.0] - 2026-09-09

### Hinzugefügt
- Benutzer: bis zu zehn Lernende statt drei, Verwaltung unter Einstellungen → Benutzer
- Benutzerauswahl: Hauptansicht listet nur angelegte Plätze
- Benutzer: eigenes Prüfungsziel je Platz, Fragenkatalog wechselt beim Benutzerwechsel mit
- Benutzer: Löschen des Namens behält den Lernstand, erneuter Eintrag desselben Namens stellt ihn wieder her
- Merkblatt: Kopf Wo du stehst mit Trefferquote je Prüfungsteil, wackligen und nie geübten Fragen sowie schwächstem Teil
- Gruppenraum: Kursauswertung für später sichern (im Browser des Gastgebers), Übersicht unter Einstellungen → Kursauswertung
- Kursauswertung: Beamer-Ansicht mit schrittweisem Aufdecken von Mehrheitsantwort und Lösung, ohne Namen
- Beamer-Ansicht: Steuerung per Leertaste, Pfeiltasten und Esc, Schriftgröße passt sich der Fragelänge an

### Geändert
- Merkblatt: Titel Dein persönliches Merkblatt, verschoben nach Einstellungen → Merkblatt
- Benutzerliste zentral an einer Stelle im Code statt an 17 Stellen; Sichern und Zurücksetzen erfassen alle Plätze

## [1.216.0] - 2026-09-09

### Hinzugefügt
- Gruppenraum: Kursleiter-Auswertung mit falsch beantworteten Fragen und Fehlerquote je Prüfungsteil
- Kursleiter-Auswertung: gemeinsamer Irrtum (meistgewählte falsche Antwort) neben der richtigen Antwort
- Kursleiter-Auswertung: Vorschlag für den nächsten Abend (Fragen mit mindestens zwei Fehlern) und Ausdruck
- Kursleiter-Auswertung: Namen standardmäßig ausgeblendet und zuschaltbar; nur für Gastgeber, serverseitig geprüft
- Statistik: Merkblatt zum Ausdrucken mit Wackelkandidaten und nur der richtigen Antwort, Auswahl von Anzahl und Prüfungsteil
- Merkblatt: sicher gemeisterte Fragen ausgeschlossen, verbleibende Tage bis zum Prüfungstermin im Kopf

### Behoben
- Gruppenraum: automatische Vorbelegungen und F9/F10-Meldungen gekennzeichnet (`art`, Weißliste), nicht in Auswertung gezählt

## [1.215.0] - 2026-09-07

### Hinzugefügt
- Plattformen: Unterstützung für Windows, Linux und macOS
- `programme_holen.js`: lädt Piper und Tunnelprogramm passend zu System und Prozessor (Einstellungen → Wartung → Hilfsprogramme)
- Hilfsprogramme: Download nur von GitHub, Prüfung jeder Umleitung, Größenlimit, Zwischendatei, Entpacken mit System-`tar`
- `installieren.sh`: Ein-Befehl-Installation für Linux und macOS inkl. Node.js, git, Abhängigkeiten und Hilfsprogrammen
- Installation: Verknüpfung auf dem Desktop (Linux `.desktop` inkl. Anwendungsmenü, macOS `.app`)
- `installieren.sh`: erneuter Aufruf aktualisiert per `git pull`, `data/` bleibt unberührt
- `installieren.sh`: Schalter `AFU_ZIEL` für Zielordner und `AFU_OHNE_HILFSPROGRAMME` zum Auslassen der Downloads
- `programme_holen.js`: Aufruf per Konsole (`node programme_holen.js alles`)
- Dokumentation: `INSTALLATION.md` mit beiden Installationswegen und Fehlerhilfe

### Behoben
- Linux/macOS: verwaiste Tunnelprozesse (Quick Tunnel) werden beim Start beendet, eigene benannte Tunnel bleiben unberührt

## [1.214.0] - 2026-09-07

### Hinzugefügt
- `START.sh` und `STOP.sh` für Linux und macOS, im ZIP-Paket enthalten
- `STOP.sh`: beendet nur den Trainer aus dem eigenen Ordner

### Behoben
- Linux/macOS: Piper wird gefunden (Name ohne `.exe`, Unterordner, Systempfad, Python-Modul über `python3`)
- Piper: Fehlermeldung außerhalb von Windows mit passenden Hinweisen statt DLL/Visual C++
- Vorlesen: Hinweis unterscheidet fehlende Stimmen und fehlendes Programm (`/api/tts-voices`)

## [1.213.0] - 2026-09-07

### Hinzugefügt
- Antwort zurücknehmen per Knopf oder Strg+Z (Lernen, Prüfungssimulator, Gruppenraum)
- Zurücknehmen: stellt Fehlerliste, Lernbedarf, Lernfortschritt und Zähler aus Sicherung wieder her, nur für die offene Frage
- Nachteilsausgleich: gesprochene Erklärung (kurz und ausführlich) für alle 17 Bedienelemente

### Behoben
- Zurücknehmen: Knopf lässt sich ausblenden (eigene CSS-Klasse mit `!important`)

## [1.212.0] - 2026-09-07

### Geändert
- Reiter Nachteilsausgleich: Symbol durchgestrichenes Auge (Font Awesome `eye-low-vision`)

## [1.211.0] - 2026-09-07

### Hinzugefügt
- Nachteilsausgleich: automatisch weiterblättern nach 2 bis 12 Sekunden (Lernen, Prüfungssimulator, Gruppenraum)
- Automatisch weiter: wartet auf das Vorlesen, Countdown im Knopf, hält bei letzter Frage und bei jeder Bedienung an
- Nachteilsausgleich: stärkere Bildvergrößerung in vier Stufen, bis 92 % des Fensters

### Behoben
- Einstellungen: Reitersymbol steht neben dem Text statt darüber, Reiterspalte 210 px breit
- Einstellungen: Fenster breiter (1040 px) und flacher (83 % der Fensterhöhe)

## [1.210.0] - 2026-09-07

### Hinzugefügt
- Nachteilsausgleich: verlängerte Prüfungszeit zuschaltbar, Faktor +25 %, ein Drittel (45 → 60 min), +50 % oder doppelt
- Prüfungszeit: zentrale Berechnung (`pruefZeit()`) für Übersicht, Kacheln, Simulatoren und Ausdruck, Kennzeichnung mit +
- Verlängerte Prüfungszeit: Hinweis auf Amtsblatt-Verfügung 29/2024 der BNetzA, Einstellung gilt je Rechner

### Geändert
- Reiter Vorlesen umbenannt in Nachteilsausgleich, Tastaturbedienung aus Allgemein dorthin verschoben

## [1.209.0] - 2026-09-07

### Hinzugefügt
- Nachschlagen: Claude, DeepSeek und Meta KI als Ziele, sieben Ziele in zwei Gruppen im Auswahlfeld
- Nachschlagen: Claude mit direkter Frageübergabe (`claude.ai/new?q=`)
- Nachschlagen: DeepSeek und Meta KI über Zwischenablage mit Hinweis auf Strg+V, Kopieren vor dem Öffnen des Fensters
- Nachschlagen: Knopf zeigt Namen und Logo des gewählten Ziels

## [1.208.0] - 2026-09-07

### Geändert
- Klassenwahl: Prüfungsziel CB → N entfernt, verbleibend Klasse N, Klasse E, N → E und E → A
- Klassenwahl: gespeichertes CB-Ziel wird auf Klasse N umgestellt; Lernstand unverändert, 138 Fragen wieder im Stapel

## [1.207.0] - 2026-09-07

### Geändert
- Knopfleiste: bleibt einzeilig und rückt in drei Stufen zusammen (eng, sehr eng, ohne Symbole) statt umzubrechen
- Knopfleiste: Neuberechnung auch bei geänderter Beschriftung (MutationObserver), keine Messung bei ausgeblendeter Leiste
- Knopfleiste: seitliches Schieben nur noch als Rückfall bei sehr schmalem Fenster

## [1.206.0] - 2026-09-07

### Geändert
- Einstellungen: Anzeigegröße für normale Ansicht und Vollbild nebeneinander in gemeinsamem Raster
- Anzeigegröße: Auswahlfelder schmaler (160 px), am Handy einspaltig in richtiger Reihenfolge

## [1.205.0] - 2026-09-07

### Hinzugefügt
- Anzeigegröße: getrennte Werte für normale Ansicht und Vollbild
- Anzeigegröße: automatische Umschaltung bei Vollbild per Knopf und per F11 (F11-Erkennung nur am Rechner)
- Anzeigegröße: bisheriger fester Wert wird einmalig auch für das Vollbild übernommen

## [1.204.0] - 2026-09-07

### Behoben
- Knopfleiste: Gruppenraum-Knopf nicht mehr angeschnitten, Leiste bricht am Rechner bei Platzmangel um
- Knopfleiste: am Handy weiterhin seitlich wischbar

## [1.203.0] - 2026-09-07

### Hinzugefügt
- Handy: Vollbild beim ersten Antippen, einmal pro Seitenaufruf, nicht in installierter App
- Einstellungen: Vollbild am Handy abschaltbar, Einstellung je Gerät

## [1.202.0] - 2026-09-07

### Geändert
- Handy: Hinweisbalken zur App-Installation entfernt, Anleitung weiterhin im Info-Fenster

### Behoben
- Handy: Rand oben und unten in der Farbe des Karteninhalts (`var(--card-bg)`), Adressleiste zieht mit
- Handy: Karte ohne runde Ecken, Schatten und Rahmen

## [1.201.0] - 2026-09-07

### Geändert
- Handy (bis 640 px): Plakette mit Klasse und Fragenanzahl in der Kopfzeile ausgeblendet
- Handy: Kacheln Videolehrgang und 50 Ohm samt Quellenzeile ausgeblendet; Tablet und Rechner unverändert

## [1.200.0] - 2026-09-07

### Hinzugefügt
- Online-Zugang: Tunnel-Puls alle vier Minuten über die eigene öffentliche Adresse (`/api/tunnel-status`), hält NAT offen
- Online-Zugang: Tunnel-Wache prüft minütlich das Tunnelprogramm, Neuaufbau bei Absturz oder drei Pulsen ohne Antwort
- Tunnel-Wache: Wartezeit bei wiederholtem Neuaufbau (1, 2, 4, 8 bis höchstens 15 Minuten)
- Gruppenraum: neuer Einladungslink nach Neuaufbau an alle gemeldet, Hinweis an den Gastgeber
- Gruppenraum: Statuszeile mit letztem Puls, Teilnehmerzahl und Neuaufbauten
- Gruppenraum: Wake Lock hält den Bildschirm an, solange ein Raum offen ist

### Behoben
- Server: kein automatisches Beenden bei Teilnehmern im Gruppenraum; bei laufendem Tunnel erst nach vier Stunden Leerlauf

## [1.199.0] - 2026-09-07

### Geändert
- Anzeigegröße: Stufen in Fünferschritten von 60 bis 115 %, dazu 125 und 150 %
- Anzeigegröße: Automatik bis minimal 60 %

### Behoben
- Anzeigegröße: Automatik richtet sich nach der Hauptansicht als längster Ansicht
- Anzeigegröße: stabile Werte je Fenstergröße, Nachmessen nur nach unten
- Anzeigegröße: Vorab-Block rechnet wie die Hauptfunktion

## [1.198.0] - 2026-09-07

### Behoben
- Anzeigegröße: Automatik rundet ab statt auf, kein abgeschnittener Inhalt am unteren Rand
- Anzeigegröße: Kartenhöhe wird gemessen statt fest angenommen (870 px)

## [1.197.0] - 2026-09-07

### Geändert
- Grey Mode: Karte heller (`#f7f8f9`), Kontrast zur Seite 2,06:1

## [1.196.0] - 2026-09-07

### Hinzugefügt
- Browserleiste: Farbe folgt dem Farbstil über `theme-color` (Chrome auf Android, installierte App, Safari ab 15)

## [1.195.0] - 2026-09-07

### Geändert
- Grey Mode: Seitenhintergrund dunkler (`#aab0b6`), Karte hebt sich deutlicher ab (1,95:1)

## [1.194.0] - 2026-09-07

### Geändert
- Grey Mode: alle Flächen eine Stufe dunkler, Karte `#f1f2f4`, kräftigere Linien
- Grey Mode: Eingabefelder und Antwortkacheln bleiben weiß

## [1.193.0] - 2026-09-07

### Geändert
- Kopfzeile: Hauptansicht zeigt nur den Namen ohne Zeichen 55

## [1.192.0] - 2026-09-07

### Geändert
- Programmsymbol: 55 statt 73 in allen Symboldateien und in der Kopfzeile

## [1.191.0] - 2026-09-07

### Geändert
- Rückfrage Neue Runde im eigenen Dialogfenster statt Browser-`confirm()`
- Neue Hilfsfunktion `afuRueckfrage()`, auch für die Klassenwechsel-Rückfrage im Diplome-Fenster
- Gruppenraum: Knopf Google KI während eines laufenden Raums ausgeblendet

## [1.190.0] - 2026-09-06

### Geändert
- Gruppenraum: Neue Runde für alle direkt in der Gesamtauswertung, Raum, Code und Link bleiben gültig
- Gruppenraum: Ausgänge benannt als Raum beenden, Raum verlassen und Fenster schließen

### Behoben
- Gruppenraum: Auswertung der vorigen Runde wird beim Start einer neuen Runde geschlossen und zurückgesetzt

## [1.189.0] - 2026-09-06

### Geändert
- Kopfzeile: Name Amateurfunk-Trainer statt Prüfung, auch als Fenstertitel
- Neues Programmsymbol 73 in `icon.ico` (16 bis 256 px), `icon.png`, `favicon.ico`, `icon-192.png` und `icon-512.png`
- Kopfzeile: Symbol als eingebettete SVG

## [1.188.0] - 2026-09-06

### Geändert
- Rufzeichenabfrage: Feld `grund` nennt beide Versuche (https, http) mit Ergebnis

### Behoben
- Rufzeichensuche: Link zur BNetzA mit `http://` statt `https://`, kein Not found mehr
- Rufzeichenabfrage: Server meldet die antwortende Adresse, Rückfall öffnet genau diese

## [1.187.0] - 2026-09-06

### Behoben
- Rufzeichenabfrage: Server meldet sich mit Browser-Kennung
- Rufzeichenabfrage: Sitzungs-Cookie auch unter Node.js vor Version 20 ausgewertet
- Rufzeichenabfrage: Formularziel und Suchknopf (inkl. `__doPostBack`) werden aus der Seite gelesen

## [1.186.0] - 2026-09-06

### Hinzugefügt
- Rufzeichen prüfen: automatische Abfrage bei der BNetzA (`/api/rufzeichen`), Ergebnis vergeben oder noch frei
- Rufzeichenabfrage: keine Namen oder Adressen, eine Anfrage je Klick, Zwischenspeicher 10 Minuten, nur lokal (`localOnly`)
- Rufzeichenabfrage: Feldnamen aus der Seite gelesen; bei unklarer Antwort Rückfall auf Seite öffnen mit Zwischenablage

## [1.185.0] - 2026-09-06

### Hinzugefügt
- Rufzeichen prüfen: Eingabefeld unter dem Prüfungstermin, öffnet die Rufzeichensuche der BNetzA, Rufzeichen in Zwischenablage
- Rufzeichen prüfen: Platzhalter * erlaubt, Vorbelegung mit dem Rufzeichen der Diplome, Ersatzweg beim Kopieren

## [1.184.0] - 2026-09-06

### Geändert
- Diplome: Fächer zeigen auf der Zielgeraden die noch nötigen richtigen Antworten (noch 2× richtig)
- `.gitignore`: Entwurfsdateien mit Unterstrich (`_*.html`, `_*.md`, `_*.json`, `_*.txt`) ausgeschlossen

### Behoben
- Diplome: Klick auf ein Fach startet nur die fehlenden Fragen der Lektion, unabhängig von den Filterschaltern
- Diplome: Klick auf eine inzwischen vollständige Lektion zeigt die Karte statt einer Wiederholungsrunde

## [1.183.0] - 2026-09-06

### Geändert
- Gruppenraum: Rückkehr zur Hauptansicht beendet Raum und Chat (Gastgeber) bzw. verlässt den Raum (Gast), mit Rückfrage

## [1.182.0] - 2026-09-06

### Behoben
- Diplome: alle 14 Lektionen bei jedem Prüfungsziel, Zählung aus der Video-Map (Klasse N)
- Diplome: Klick auf leeres Fach schaltet nach Rückfrage auf Klasse N und lädt die offenen Fragen

## [1.181.0] - 2026-09-06

### Behoben
- Verlauf: Höhenmessung ohne Rückkopplung durch Flex-Streckung, Verlauf nicht mehr zu lang
- Verlauf: Beobachter der linken Spalte passt die Höhe beim Wachsen und Schrumpfen an (z. B. Zielwechsel)

## [1.180.0] - 2026-09-06

### Behoben
- Diplome: verdiente Karten werden unabhängig vom Prüfungsziel angezeigt, keine Anzeige 0 von 0 mehr
- Diplome: Hinweis, wenn das Prüfungsziel keine Lektionen hat

## [1.179.0] - 2026-09-06

### Geändert
- Beamer-Modus: Trennlinie grau statt fast schwarz

## [1.178.0] - 2026-09-06

### Geändert
- Sammelalbum umbenannt in Deine Diplome, Knopf Diplome mit Pokal-Symbol

## [1.177.0] - 2026-09-06

### Behoben
- Beamer-Modus: Trennlinie zwischen Frage und Antworten ergänzt

## [1.176.0] - 2026-09-06

### Behoben
- Vorlesen: Schalter Gelernte ausblenden mit Vorlesetext (`data-tooltip`)
- Vorlesen: LAN wird buchstabiert (Browserstimme und Piper, `tts-expand.js`)

## [1.175.0] - 2026-09-06

### Hinzugefügt
- Diplome: leere Fächer anklickbar, starten eine Runde mit den offenen Fragen der Lektion

### Behoben
- Diplome: Album übernimmt beim Öffnen und beim Start den Lernstand, fertige Lektionen erhalten ihre Karte

## [1.174.0] - 2026-09-06

### Hinzugefügt
- Sammelalbum: virtuelle QSL-Karte je abgeschlossener Lektion, mit Konfetti-Fenster
- QSL-Karten: sechs eigene SVG-Motive, eingebettet in `Index.html`, ohne DARC-Logo
- QSL-Karten: Rufzeichen (änderbar, mit Platzhalter), Lektion, Fragenzahl, Datum, Trefferquote und Klasse
- Sammelalbum im Lernfortschritt: verdiente Karten zuerst, offene nach Restfragen mit Schattenriss und Balken
- QSL-Karten: Export als PNG (1000 × 600)
- Sammelalbum: bereits fertige Lektionen beim ersten Start still nachgetragen

### Geändert
- Sicherung: Feld `qsl` mit Karten und Rufzeichen je Benutzer in `amateurfunk_data.json`

## [1.173.0] - 2026-09-06

### Hinzugefügt
- Taschenrechner nach Prüfungsvorgaben (Amtsblatt-Verfügung 29/2024), ohne Variablen und Formelspeicher
- Taschenrechner: Tasten für Vorsätze p, n, µ, m, k, M, G; Ergebnis in Vorsatz- und Normalschreibweise
- Taschenrechner: eigener Parser (Shunting-Yard) statt `eval()`
- Taschenrechner: Knopf in der Fragen-Kopfzeile, auch im Prüfungssimulator; verschiebbares Fenster mit gemerkter Position
- Taschenrechner: Tastaturbedienung für Ziffern, Rechenzeichen, Klammern und Vorsätze

## [1.172.0] - 2026-09-06

### Hinzugefügt
- Blättern: Feld Rest abarbeiten über volle Breite, nur nicht abgehakte Fragen in Katalogreihenfolge

### Behoben
- Blättern: Einstieg bei offenen Fragen immer sichtbar, solange Fragen offen sind

## [1.171.0] - 2026-09-06

### Hinzugefügt
- Blättern: Einstieg bei der ersten offenen Frage unter den Kacheln

### Geändert
- Blättern: Fenster neu mit zwei Kacheln (ganzer Katalog, nur Abgehaktes) mit Zahl und Balken
- Blättern: Neu beginnen und Stand löschen als Knöpfe in der Fußzeile

### Behoben
- Blättern: doppelter Hinweissatz beim ersten Öffnen entfernt

## [1.170.0] - 2026-09-06

### Geändert
- Statistik: Balken der Prüfungsreife länger, Namensspalte 108 px

## [1.169.0] - 2026-09-06

### Hinzugefügt
- Statistik: Balken der Prüfungsreife wachsen beim Öffnen animiert, zeilenweise versetzt

### Geändert
- Statistik: Balken der Prüfungsreife rund ein Drittel länger, Namens- und Zahlenspalte schmaler

## [1.168.0] - 2026-09-06

### Geändert
- Auswertung & Sicherung: rechte Spalte als hellgrauer Kasten, Unterkanten beider Spalten bündig

## [1.167.0] - 2026-09-06

### Geändert
- Auswertung & Sicherung: Kasten Prüfungsreife füllt die Spaltenhöhe, einspaltig mit natürlicher Höhe

## [1.166.0] - 2026-09-06

### Geändert
- Gruppenraum: drei Sinnbilder fest unter Bereits gelernte Fragen, nur die Knopfreihe am Spaltenfuß

## [1.165.0] - 2026-09-06

### Behoben
- Gruppenraum: Knopf Neue Runde mit gleicher Grundbreite, Beschriftung läuft nicht mehr über
- Gruppenraum: Knöpfe nicht schmaler als ihre Beschriftung, Umbruch statt Überlauf, engere Innenabstände
- Gruppenraum: rechte Spalte ohne Lücke beim Aufklappen von Dein Name
- Gruppenraum: leerer Kasten bei laufendem Raum ausgeblendet

## [1.164.0] - 2026-09-06

### Geändert
- Gruppenraum: Knopfreihen am Fuß ihrer Spalte auf gleicher Höhe, links- bzw. rechtsbündig
- Gruppenraum: feste Höchstbreite von 560 px entfallen, Knöpfe brechen bei schmaler Spalte um

## [1.163.0] - 2026-09-06

### Hinzugefügt
- Gruppenraum: drei Sinnbilder mit Erklärung (Online, Offline über LAN, alle Geräte), als Data-URI in `Index.html`
- Sinnbilder: Beschriftung als Tooltip und für die Vorlesefunktion

### Geändert
- Gruppenraum: Knöpfe Jetzt starten, Neue Runde und Schließen gleich breit und gleich hoch

## [1.162.0] - 2026-09-06

### Geändert
- Gemeinsamer Modus: Fenster 1040 px breit und zweispaltig
- Auswertung & Sicherung: Fenster 1020 px breit und zweispaltig
- Handy, Tablet und schmale Fenster (unter 760 px): einspaltige Darstellung

## [1.161.0] - 2026-09-06

### Behoben
- Gruppenraum: eigene Adresse auch mit `http://` möglich, Warnung statt Ablehnung

## [1.160.0] - 2026-09-06

### Hinzugefügt
- Gruppenraum: Knopf Eigene Adresse für eine feste Server-URL, Vorrang vor der automatischen Erkennung
- Eigene Adresse: `https://` wird ergänzt, abschließender Schrägstrich entfernt, Tunnelprüfung übersprungen
- Eigene Adresse: nur https angenommen (App auf dem Startbildschirm, Mikrofon); leer speichern setzt zurück
- Info ▸ Prüfung & Kurs: Anleitung zum Feld Server-URL

## [1.159.0] - 2026-09-06

### Geändert
- Prüfungsreife: aus der Hauptansicht ganz nach oben in Statistik (Auswertung & Sicherung) verschoben
- Prüfungsreife: Knöpfe Video und Üben schließen das Statistik-Fenster
- Info ▸ Lernen: neuer Ort der Prüfungsreife beschrieben

## [1.158.0] - 2026-09-06

### Hinzugefügt
- Hauptansicht: Kasten Prüfungsreife mit erwartetem Punktestand je Prüfungsteil (z. B. 16 von 25) und Bestehensgrenze im Balken
- Prüfungsreife: Klartext-Ansage nach dem schwächsten Prüfungsteil, Einstufung sitzt, knapp oder zu wenig
- Prüfungsreife: Tagespensum bei eingetragenem Prüfungstermin, gleiche Zählung wie am Terminfeld
- Prüfungsreife: Bereich Wo es klemmt mit den drei fehlerstärksten Lektionen, je ein Knopf zu Video und Übung
- Prüfungsreife: Vorhersage aus geglätteter Trefferwahrscheinlichkeit je Frage (gelernt, Lernbedarf, beantwortet, ungesehen)
- Prüfungsreife: erst ab 25 beantworteten Fragen je Teil, während einer Runde ausgeblendet, mobil untereinander
- Anleitung: Info ▸ Lernen beschreibt den Kasten

## [1.157.0] - 2026-09-06

### Hinzugefügt
- Anleitung: neuer Reiter Handy & Tablet (Trainer am Handy, Installation auf dem Startbildschirm)
- README: Abschnitt zur mobilen Ansicht mit Bildschirmfoto `bilder/10-mobile.png`

## [1.156.0] - 2026-09-06

### Geändert
- Gruppenraum am Handy: Knopf Zurück für Gäste ausgeblendet, es bleiben Weiter, Hauptmenü und Farbstil

## [1.155.0] - 2026-09-06

### Hinzugefügt
- PWA: Trainer als Progressive Web App mit `manifest.webmanifest`, Service Worker `sw.js` und Symbolen 192/512 px
- PWA: Start vom Startbildschirm als eigene App ohne Adressleiste (`display: standalone`)
- PWA: Installationshinweis am Handy je nach Browser (Chrome, iPhone, In-App-Browser von Messengern)
- Service Worker: Netz zuerst, Speicher als Rückfall; `/api/`, Gruppenraum und Sprachausgabe ausgenommen; nur über https/localhost
- Mobile: App-Anmutung ohne Tipp-Blitz, versehentliche Textmarkierung, Gummiband und Neuladen durch Ziehen
- Gruppenraum: Knopf Neue Runde für den Gastgeber, frischer Fragensatz für alle (`neueRunde`), Zähler zurückgesetzt

### Geändert
- Gruppenraum am Handy: kein Hauptmenü für Gäste, nur die gemeinsamen Fragen
- Gruppenraum: Mitmachen startet die Runde sofort, Hinweis bis zur Serverantwort
- Gruppenraum am Handy: Gruppenchat ausgeblendet

### Behoben
- Mobile: Seite nicht mehr seitlich verschiebbar (zu breite Zeile im Lernfortschritt), seitliches Scrollen unterbunden

## [1.154.0] - 2026-09-06

### Geändert
- Gruppenraum am Handy/Tablet: Gäste sehen nur Zurück, Weiter, Hauptmenü, Farbstil sowie Raum- und Fragenknöpfe
- Gruppenraum: Auswertungsspalte, Abbrechen, Google KI, Prüfungsziel, Suche, Info, Einstellungen, Beenden für Gäste ausgeblendet
- Gruppenraum: Gastgeber-Ansicht unverändert; Klasse `gast-im-raum`, Knöpfe nach Verlassen ohne Neuladen zurück
- Gruppenraum am Handy: Einladungsfenster für Gäste auf Namensfeld mit Knopf Mitmachen reduziert, ohne Namen gesperrt
- Gruppenraum: Name per erneutem Beitritt übertragen, Server-Platzhalter Benutzer 1 wird nicht vorgetragen

### Behoben
- Gruppenraum am Handy: Fenster ragte über den Bildschirmrand, Breite jetzt per `vw`

## [1.153.0] - 2026-09-06

### Geändert
- Layout: Breitenerkennung mit Klassen `schmal` (bis 1024 px) und `handy` (bis 640 px), auch beim Drehen
- Handy: Frage oben, Auswertung darunter und eingeklappt
- Touch: Antwortkacheln und Navigationsknöpfe mind. 44 bis 48 px, untere Knopfreihe zweispaltig mit Zurück/Weiter oben
- Touch: kein hängender Hover-Zustand bei `hover: none`
- Handy: Knopf Beenden ausgeblendet (nur lokal nutzbar), Platz unten für die Gruppenchat-Leiste

### Behoben
- Handy: Umschaltknopf des Verlaufs nicht mehr als großer blauer Block über der Frage
- Handy: automatische Anzeigegröße bis 1024 px Breite fest auf 100 % statt 80 %
- Handy: eingeklappte Auswertungsspalte hinterließ kein leeres Feld mehr
- Viewport: Pinch-Zoom wieder möglich (`maximum-scale=1.0` entfernt)

## [1.152.0] - 2026-09-05

### Geändert
- Videolehrgang: öffnet in eigenem Fenster auf YouTube statt im eingebetteten Player; Schalter `VIDEO_IM_FENSTER` für alte Variante
- Videolehrgang: Öffnen per simuliertem Linkklick (`openExternalTab`), kein Popup-Blocker
- Videokachel: Tooltip und Vorlesetext angepasst, Anleitung unter Info aktualisiert

### Behoben
- Sprachausgabe: Rufzeichen des Videolehrgangs wird buchstabiert, in `tts-expand.js` und `Index.html`

## [1.151.0] - 2026-09-05

### Hinzugefügt
- Nachschlagen: Ziel wählbar unter Einstellungen ▸ Allgemein (Google KI, Google, ChatGPT, Perplexity)
- Nachschlagen: Knopf zeigt Namen und Zeichen des gewählten Ziels
- Nachschlagen: KI-Ziele erhalten ausformulierte Erklärbitte statt Stichworten, bei Bildfragen mit Hinweis auf fehlende Bilder

### Geändert
- Nachschlagen: zählt im Gruppenraum und Prüfungssimulator unabhängig vom Ziel weiter als Fehler
- Anleitung: Info beschreibt den Knopf neu

## [1.150.0] - 2026-09-05

### Hinzugefügt
- Fußzeile: Tooltip mit Vorlesetext am Link 50ohm.de (Kurse, Trainings-App, Ausbildungspaten, Buch Klasse N)

## [1.149.0] - 2026-09-05

### Geändert
- Bildvergrößerung: Bild wächst an seiner Stelle statt in der Fenstermitte
- Bildvergrößerung: Antwortbilder wachsen von der randnächsten Ecke nach innen, Fragebild um die eigene Mitte
- Bildvergrößerung: getrennte Grenzen für Fenster (38 %) und Vollbild (52 %)
- Bildvergrößerung: korrekte Position bei Anzeigegröße ungleich 100 %
- Anleitung: Info beschreibt das neue Verhalten

## [1.148.0] - 2026-09-05

### Geändert
- Gruppenraum: Schließen beendet den Raum samt Gruppenchat
- Gruppenraum: nur der Gastgeber beendet für alle, Gäste melden sich nur selbst ab
- Gruppenraum: Gäste erhalten eine Meldung, wenn der Gastgeber den Raum beendet

### Behoben
- Gruppenchat: klappt beim Betreten des Raums auf, Schreiben ohne vorherige fremde Nachricht möglich
- Gruppenchat: bleibt nach manuellem Schließen zu, kein Fokussprung beim automatischen Aufklappen

## [1.147.0] - 2026-09-05

### Geändert
- Knöpfe: alle heben sich beim Überfahren nach 1 s, zeitgleich mit dem Vorlesen
- Vorlesen: Verzögerung beim Überfahren von 450 auf 1000 ms
- Knöpfe: Absenken ohne Verzögerung; Verlaufspunkte, Antwortfelder und deaktivierte Knöpfe ausgenommen

### Behoben
- Verlauf: Spalte bei Anzeigegröße ungleich 100 % zu kurz, jetzt über `offsetHeight` gemessen
- Layout: Schmal-Umschaltung nutzt `clientWidth` statt `innerWidth`, passend zum Media-Query
- Vorlesen: Knopf wird beim erneuten Überfahren wieder vorgelesen

## [1.146.0] - 2026-09-05

### Behoben
- Sprachausgabe: DARC wird buchstabiert (`D-A-R-C`) statt als Wort gelesen
- Sprachausgabe: Regel in `tts-expand.js` (Piper) und `Index.html` (Browser-Notstimme), vor den Großbuchstaben-Regeln

## [1.145.0] - 2026-09-05

### Hinzugefügt
- Sprachausgabe: Aussprache-Tabelle, zusammengesetzte Wörter getrennt übergeben (Merkliste als Merk Liste)
- Sprachausgabe: Einzelwort mit Punkt am Satzanfang erhält Komma

### Geändert
- Suchfeld: Vorlesetext Suchen nach Fragen oder Schlagwörtern
- Sprachausgabe: Aussprache als letzter Schritt vor der Ausgabe, Kommaregel vor der Tabelle

## [1.144.0] - 2026-09-05

### Behoben
- Sprachausgabe: Knöpfe senden kein nacktes Einzelwort mehr, sondern Wort plus Nachsatz aus dem Tooltip
- Sprachausgabe: Kürzung nur an Satzzeichen, nicht mitten im Satzteil
- Vorlesen: eigene Texte für Einstellungen und Suchfeld

## [1.143.0] - 2026-09-05

### Geändert
- Aktualisierungsband: Hinweistext und Knopf später in Weiß wie bei 50ohm.de, Knopf Jetzt neu laden weiß mit dunkler Schrift

## [1.142.0] - 2026-09-05

### Geändert
- Vollbild-Knopf: Vorlesetext Vollbild zum Vergrößern

### Behoben
- Sprachausgabe: Einzelwörter werden für alle Knöpfe ohne Punkt übergeben

## [1.141.0] - 2026-09-05

### Geändert
- Sprachausgabe: Blättern ohne vorangestelltes Zum, mit Komma statt Punkt
- Aktualisierungsband: 50-Ohm-Farbe `#00adef` statt Braun, dunkle Schrift (Kontrast 5,9:1)
- Aktualisierungsband: nur die Farbe übernommen, kein 50-Ohm-Logo

## [1.140.0] - 2026-09-05

### Geändert
- Sprachausgabe: Blättern nicht mehr am Satzanfang, mit vorangestelltem Zum; Knopfbeschriftung unverändert

## [1.139.0] - 2026-09-05

### Geändert
- Einstellungen: Kasten Weitere Stimmen samt Code für die Einzelauswahl entfernt
- Sprachausgabe: Blättern wieder in Originalschreibung, mit kurzem Folgesatz
- Sprechprobe: enthält das Wort Blättern

### Behoben
- Stimmen: klare Meldung, wenn der Trainer nicht mehr läuft, statt Fehler beim Laden der Stimmen

## [1.138.0] - 2026-09-05

### Geändert
- Meldung unten rechts: Grün bei gelernt, Rot bei entfernt, wie an den Antworten (`--darc-richtig`, `--darc-falsch`)
- Meldung unten rechts: gleiche Farben für CB-Wissen angerechnet und Zurück in den Lernstapel
- Meldung unten rechts: Warnfarbe bleibt für Fehlerwertung beim Nachschlagen und Lösung anzeigen

## [1.137.0] - 2026-09-05

### Hinzugefügt
- Einstellungen ▸ Allgemein: Anzeigegröße automatisch oder fest (90, 100, 110, 125, 150 %)
- Anzeigegröße: Automatik nach Fenstergröße (Basis 1520 × 870), gerundet auf 5 %
- Anzeigegröße: im Beamer-Modus fest 100 %
- Anzeigegröße: Skalierung per `zoom`, `vh`/`vw` über `--afu-zoom` korrigiert, gesetzt vor dem ersten Zeichnen

### Geändert
- Sprachausgabe: Blättern als Blettern übergeben, Knopfbeschriftung unverändert

## [1.136.0] - 2026-09-05

### Hinzugefügt
- Einstellungen ▸ Vorlesen: Wegräumen nicht mehr angebotener Stimmen aus dem Ordner
- Stimmen: Verschieben nach `_Aufgeraeumt_<Datum>\piper\` statt Löschen, keine Überschreibung

### Geändert
- Stimmen: `karlsson`, `pavoque`, `ramona`, `eva_k` und `thorsten_emotional` nicht mehr angeboten
- Stimmen: Auswahl nach Sprecher, übrig bleiben `thorsten` (drei Gütestufen) und `kerstin`

## [1.135.0] - 2026-09-05

### Behoben
- Stimmen hinzufügen: verständliche Meldung statt JSON-Fehler, wenn der laufende Server die Funktion noch nicht kennt
- Stimmen: Antworten zuerst als Text gelesen, 404 mit Hinweis auf Neustart, an allen drei Abrufstellen

## [1.134.0] - 2026-09-05

### Hinzugefügt
- Einstellungen ▸ Vorlesen: Knopf Stimmen hinzufügen lädt alle weiteren deutschen Stimmen ohne Rückfrage
- Stimmen hinzufügen: nacheinander, Fehler einzelner Stimmen blockieren nicht, Zusammenfassung am Ende
- Stimmen hinzufügen: Fortschrittsbalken mit Zähler der laufenden Stimme

### Geändert
- Stimmen: Haken heißt Einzeln auswählen
- Stimmen: `de_DE-mls-medium` nicht mehr angeboten
- Sprechprobe: neuer Text

### Behoben
- Stimmen: Fortschritt lief bei Fehlschlag über 100 %

## [1.133.0] - 2026-09-05

### Hinzugefügt
- Anleitung: neue Funktionen seit August beschrieben (Blättern, Formelblatt, Dazu lernen, Vollbild, Einstellungen, Stimmen)
- Anleitung: Versionsnummer statt Fingerabdruck unter Daten & Stand

### Geändert
- Kopfzeile: Vollbild-Knopf neben dem Zahnrad
- Anleitung: neu aufgebaut mit acht links anwählbaren Abschnitten, nüchterner Ton, ohne Emoji

### Behoben
- Standanzeige: beim Umbau entfernte Funktionen (`dateiStandAnzeigen`, `fehlerMelden` u. a.) wiederhergestellt

## [1.132.0] - 2026-09-05

### Hinzugefügt
- Einstellungen ▸ Vorlesen: weitere Piper-Stimmen nachladbar, Auslieferung weiterhin nur mit `thorsten`
- Stimmen: Liste mit Güteangabe vor dem Laden, Einzeldownload mit Fortschrittsbalken, sofort ohne Neustart nutzbar
- Stimmen: neues Modul `piper_stimmen.js`, Quelle `voices.json` des Piper-Projekts bei Hugging Face
- Stimmen: nur `.onnx`/`.onnx.json`, MD5-Prüfung, Zwischendatei `.teil`, nur huggingface.co und hf.co zugelassen
- Stimmen: Fortschritt per Abfrage statt lang offener Anfrage

## [1.131.0] - 2026-09-05

### Hinzugefügt
- Kopfzeile: Vollbild-Knopf (wie F11) mit Pfeilsymbol, auch vorgelesen
- Vollbild: Symbol folgt `fullscreenchange`, auch bei F11/Escape; Browser-Präfixe berücksichtigt
- Vollbild: Hinweis auf F11, wenn der Browser das Umschalten verbietet

## [1.130.0] - 2026-09-05

### Geändert
- Verlauf: gelernte Fragen als hellgrüne Punkte mit grünem Rand markiert
- Verlauf: Ergebnis der laufenden Runde hat Vorrang, Aktualisierung beim Abhaken sofort, nicht im Prüfungssimulator
- Fragennummer: grünes Nummernfeld aus 1.129.0 entfernt, knapper Abstand bleibt
- Punktetafel: gemeinsame Funktion `gelerntPunkt()`, `!important` gegen spezifischere Farbstile

## [1.129.0] - 2026-09-05

### Geändert
- Fragennummer: Abstand zum Fragentext von ca. 13 auf 6 px verkleinert
- Fragennummer: Nummernfeld grün bei gelernter Frage (außer Prüfungssimulator), sofort beim Abhaken

## [1.128.0] - 2026-09-05

### Hinzugefügt
- Einstellungen ▸ Update: drei Versionszeilen Hier, Bei GitHub und Setup dort
- Update: GitHub-Prüfung ohne großes Fenster, lokal neuere Dateien getrennt genannt
- Update-Fenster: Versionsvergleich (z. B. `1.127.0 → 1.129.0`) über den Knöpfen
- API: `GET /api/github/pruefen` liefert `versionHier`, `versionDort`, `versionSetup`; führendes `v` am Release-Tag ignoriert

### Geändert
- Update: Versionsnummer aus der obersten Überschrift von `CHANGELOG.md` statt Fingerabdruck, Fingerabdruck klein darunter
- API: `GET /api/version` liest die Version aus dem CHANGELOG, Rückfall auf `package.json`

## [1.127.0] - 2026-09-05

### Hinzugefügt
- Blättern: Stand je Benutzer und Prüfungsziel in `data\userdata\blaettern.json` (durchgesehen, abgehakt), löschbar
- Blättern: Runde Nur die gelernten ansehen im Blätter-Fenster und in den Einstellungen, Lesezeichen bleibt

### Geändert
- Formelblatt: Fenster im Seitenverhältnis des A4-Blatts, Höhe nach Bildschirm, mindestens 800 px breit
- Formelblatt: Miniaturleiste ausgeblendet (`navpanes=0`), Werkzeugleiste mit Zeichenwerkzeugen bleibt
- Einstellungen: Fenster mit fünf Reitern (Allgemein, Vorlesen, Lernen, Update, Wartung)
- Einstellungen: Vorlesen integriert, Zahnrad an der Frage öffnet diesen Reiter
- Einstellungen: Farbstil als fünf Farbfelder, Änderungen wirken sofort ohne Speichern-Knopf
- Info: Abgleich beim Entwickler entfernt, Aktualisierung nur über GitHub

## [1.126.0] - 2026-09-05

### Geändert
- Formelblatt: öffnet `Formelsammlung.pdf` direkt auf dem passenden Blatt statt Seitenbild mit Markierung
- Formelblatt: Anzeige von Blatt- und PDF-Seitennummer
- Formelblatt: Knopf Größer öffnet das Blatt im eigenen Browserfenster, eigene Blätterknöpfe und Abdunklung entfallen
- Installer: Ordner `formelsammlung\` mit 20 Seitenbildern (ca. 3,6 MB) entfernt

### Behoben
- Formelblatt: Rahmen wird bei jedem Blattwechsel neu aufgebaut, Wechsel per Sprungmarke sonst ohne Wirkung

## [1.125.0] - 2026-09-05

### Behoben
- Formelblatt: Knopf fehlte trotz Zuordnung, `formelhilfe.json` wird mit Zeitstempel ohne Browser-Cache geladen

## [1.124.0] - 2026-09-05

### Geändert
- Formelblatt: Seite ohne Markierung und Abdunklung, Schalter Nur die Stelle entfällt

### Behoben
- Formelblatt: Zuordnung von 60 auf 114 Fragen der Klasse N erweitert, mit eng gefassten Regeln
- `formelhilfe.json`: Seitenbeschriftungen korrigiert (Rufzeichenplan, Bandbreiten, IARU-Bandpläne 2 m und 70 cm)

## [1.123.0] - 2026-09-05

### Behoben
- Blättern: berücksichtigt den Filter Lernen aktiv für wie Start (`getFilteredQuestions()`)
- Blättern: Lesezeichen in abgewähltem Teil springt zur nächsten Frage im Pool statt an den Anfang
- Blättern: Zahl am Knopf aktualisiert sich beim Umschalten der Teile sofort

## [1.122.0] - 2026-09-04

### Geändert
- Fragennummer: eigenes weißes Feld mit Rahmen und Monoschrift
- Dazu lernen: Herkunftsangabe jeweils mittig unter der zugehörigen Kachel

### Behoben
- Antworten: nach dem Klick sofort grün oder rot statt kurz gelb durch die Vorlese-Markierung

## [1.121.0] - 2026-09-04

### Hinzugefügt
- Server-Protokoll `data\userdata\server.log` mit Uhrzeit, Wechsel bei 1 MB nach `server.log.alt`
- Protokoll: Dauer der Stille beim Ausscheiden eines Zuschauers sowie Beendigungscode und Laufzeit

### Behoben
- Server: beendete sich zu Unrecht, da Browser Zeitgeber in Hintergrund-Tabs drosseln; Frist von 45 s auf 5 min
- Lebenszeichen: Seite meldet sich zusätzlich bei `visibilitychange`, `focus` und `pageshow`
- Lebenszeichen: `pagehide` meldet nur bei endgültigem Verlassen ab (`event.persisted`), nicht bei bfcache

## [1.120.0] - 2026-09-04

### Hinzugefügt
- 50ohm.de: Zuordnung aller 571 Fragen der Klasse N zu Kapiteln des DARC-Lehrgangs, abgeleitet aus dem Videolehrgang
- `50ohm_map.json`: in Installer, Aktualisierungspaket und Abgleich aufgenommen
- Fußzeile: Herkunftshinweis mit Links zu 50ohm.de und DARC, Angaben zu Basis und Fragenzahl entfernt
- Fußzeile: Umbruch unter 900 px erlaubt, kein seitlicher Überlauf

### Geändert
- Omega-Zeichen: ohne DARC-Blau, in der Schriftfarbe der jeweiligen Zeile
- 50ohm.de: Links führen vorerst auf die Kapitelübersicht, nicht auf Unterseiten

## [1.119.0] - 2026-09-04

### Hinzugefügt
- Dazu lernen: zweiter Hinweis auf den DARC-Lehrgang 50ohm.de neben dem Videolehrgang
- `50ohm_map.json`: optionale Zuordnung Frage zu Kapitel, Seitenname und Adresse
- 50ohm.de: öffnet im Browser, ohne Verbindung Anzeige des Ziels statt Fehler
- Dazu lernen: beide Knöpfe mit Vorlesetext

### Geändert
- Dazu lernen: zwei gleich breite weiße Felder im Stil der Knopfleiste, unter 700 px untereinander
- Dazu lernen: Ω als Zeichen für 50 Ohm, kein DARC-Logo
- Dazu lernen: im Prüfungssimulator und Beamer-Modus ausgeblendet

## [1.118.0] - 2026-09-03

### Geändert
- Dark Mode abgeschaltet (Schaltbilder mit weißem Grund), Umschalter Light → Green → Blue → Orange → Grey
- Farbstil: gespeichertes Dunkel wird auf Hell umgeschrieben
- Dark-Mode-Regeln bleiben inaktiv im Stylesheet, reaktivierbar über die Liste `STILE`

## [1.117.0] - 2026-09-03

### Geändert
- Dark Mode: Farbfamilie DARC-Blau (`#00adef`) auf dunklem Marineblau statt Geräteschwarz und Türkis
- Dark Mode: vorgelesene Antwort leuchtet in DARC-Blau
- CSS: Variablen `--geraet-*` umbenannt in `--nacht-*`, `--tuerkis` in `--darc-blau`

### Behoben
- Dark Mode: Auswertungsspalte mit hellen Signalfarben lesbar (Kontrast mind. 4,5:1)
- Dark Mode: alle Schriftfarben gegen ihre Flächen auf Kontrast geprüft

## [1.116.0] - 2026-09-03

### Geändert
- Kopfzeile: auf Zahnrad, Info, Beenden und Farbumschalter reduziert, Umbruch erst unter 1000 px
- Zahnrad-Fenster: Cache leeren, Fehler melden und Alles zurücksetzen im neuen Abschnitt Wartung
- Kopfzeile: Knopf Raum nur bei laufendem Gruppenraum

## [1.115.0] - 2026-09-03

### Behoben
- Beamer-Modus: Hauptansicht nicht mehr leer, Umschaltung erst bei laufender Runde, vorher Hinweisbalken
- Beamer-Modus: Ausstiegsknopf deutlich sichtbar und nicht mehr in der normalen Ansicht
- Esc: schließt zuerst das offene Fenster, erst danach den Beamer-Modus
- Kopfzeile: Knopfreihe bleibt beim Umbruch rechtsbündig

## [1.114.0] - 2026-09-03

### Hinzugefügt
- Beamer-Modus: nur Frage und Antworten in großer Schrift, Leertaste, Pfeiltasten, Presenter; Strg+B schaltet, Esc beendet
- Beamer-Modus: Schriftgröße in `vw`, Fragenzähler unten links, Zustand wird nicht gespeichert
- Kopfzeile: Knopf Beenden fährt den Server mit Rückfrage sauber herunter, Route `/api/beenden` nur lokal
- Verbindung: Hinweisbalken nach zwei fehlgeschlagenen Abfragen, wenn der Server nicht erreichbar ist

### Behoben
- Dark Mode: dunkle Schrift auf dunklem Grund in den Fenstern, Variablen jetzt zentral umgestellt

## [1.113.0] - 2026-09-03

### Geändert
- Dark Mode: Gerätestil mit durchgehend dunklen Flächen, dünnen Kanten und Glanzlicht
- Dark Mode: Türkis `#17c3d6` als einziges Signal, Zähler in Monoschrift
- Dark Mode: vorgelesene Antwort türkis statt gelb, Signalfarben für richtig und falsch unverändert
- Dark Mode: Fragenblock über Variablen `--darc-*`, alle Fenster dunkel

### Behoben
- Dark Mode: Antwortbuchstaben A bis D, Fragenblock-Grau und Gruppenraum-Überschriften wieder lesbar

## [1.112.0] - 2026-09-03

### Geändert
- Knopfleiste: Rangfolge statt Farbkennzeichnung (gefüllt Start, weiß Werkzeug, blauer Rand Modus, roter Rand Reset)
- Knopfleiste: Farbe in den Zählern (Rot für Fehler, Violett für Lernbedarf)
- Start-Knopf: Tiefblau `#123a6b` über Variable `--start-farbe`
- Knopfleiste: Eckenradius von 30 auf 8 px, nur Kopf- und Filterleiste betroffen

## [1.111.0] - 2026-09-02

### Hinzugefügt
- Kopfzeile: Zahnrad-Fenster links neben Info für Einstellungen je Benutzer, mit Probe hören
- Vorlesen: Hinweistext eines Knopfs beim Überfahren oder per Tabulator, wahlweise kurz oder ausführlich
- Vorlesen: optionale Schriftvergrößerung der gerade gelesenen Antwort
- Vorlesen: Erklärungen für wichtige Knöpfe, Ziel wählen, Benutzerauswahl und Suchfeld; `data-nicht-vorlesen` stellt stumm

### Geändert
- Tooltip-Kästchen entfernt, `data-tooltip` dient als Vorlesequelle; Symbole werden für die Sprachausgabe umgeschrieben
- Vorlesen: vorgelesene Frage hat Vorrang vor Knopftexten
- Knopf Fehler: immer sichtbar, blass ohne offene Fehler, Hinweis statt blockierendem Fenster
- F9: Lösungstaste auch im Gruppenraum gesperrt, Prüfung starten nennt die Taste
- Blättern und Gruppenraum: Erklärungstexte präzisiert

### Behoben
- Vorlesen: keine verschluckten Silben, kein erneutes Vorlesen beim Klick (`:focus-visible`)
- Vorlesen: kein Verstummen nach fehlgeschlagener Ausgabe, keine überlappenden Stimmen beim Wischen
- Zielkarten mit fehlender Datei per `aria-disabled` erklärbar, vergrößerte Antwort bleibt in der Fragenkarte

## [1.110.0] - 2026-09-02

### Geändert
- Knopf Durchsehen heißt Blättern bzw. Weiterblättern, Tooltip nennt die Stelle
- Weiterblättern-Fenster: Knöpfe Neu beginnen und Weiterblättern
- Knopf Verwechslungsgefahr samt Logik entfernt

### Behoben
- Verlauf: Höhe beim Start und nach Rückkehr zum Hauptmenü gestaffelt nachgemessen (sofort, 250 ms, 900 ms)
- Verlauf: Messung bei ausgeblendeter linker Spalte wird übersprungen

## [1.109.0] - 2026-09-02

### Hinzugefügt
- Update: automatisches Übernehmen von Fragen, Bildern und Seite mit Meldung, abschaltbar per `AFU_AUTO_UPDATE=0`
- Update: Hinweisbalken bei anstehenden Programmdateien, die nie automatisch getauscht werden
- Update: Schreibprobe vor dem ersten Zugriff
- Info-Knopf: Versionsanzeige aus `package.json`

### Geändert
- Update: alles oder nichts je Stand, bei Programmdateien kein automatisches Teil-Update

### Behoben
- Installer: `{app}` in `[Dirs]` ergänzt, Programmordner für das Update beschreibbar
- Update: Startprüfung berücksichtigt Zustand `unbekannt` bei frischer Installation
- Update-Fenster: zeigt den tatsächlichen Fehlergrund mit Ordnerpfad

## [1.108.0] - 2026-09-02

### Hinzugefügt
- `LIZENZ-Optionen.md`: Erläuterung zu PolyForm Noncommercial, PolyForm Strict und GitHub-Nutzungsbedingungen

### Geändert
- GitHub-Abgleich: kompletter Dateibaum statt fester Liste, inkl. Unterordner (`svgs\`, `formelsammlung\`, `fontawesome\`)
- GitHub-Abgleich: Einteilung nach Dateiendung, `.js` im Zweifel Programmdatei mit Bestätigung
- GitHub-Abgleich: nur ungefährliche Endungen, nie `.bat`, `.vbs`, `.ps1`, `.exe`, `.cmd`, `.py`, `.sh`, `.iss`
- GitHub-Abgleich: `data\`, `backup\`, `Hoerbuch\`, `release\`, `tts_cache\` und `bilder\` gesperrt
- GitHub-Abgleich: Pfade mit `..`, führendem `/` oder Laufwerksbuchstaben abgewiesen, Prüfung erneut vor dem Schreiben

## [1.107.0] - 2026-09-02

### Hinzugefügt
- `Hochladen.bat`: entfernt ignorierte, aber noch versionierte Dateien auf Nachfrage aus dem Repository (`git rm --cached`)

### Geändert
- Repository: Build-Dateien (`installer.iss`, `Build-DIREKT.bat`, `version.js`, Symbole) nicht mehr öffentlich, `icon.png` bleibt
- README: offizielle Setups nur unter Releases

### Behoben
- Hochladen: per `.gitignore` ausgeschlossene, bereits versionierte Dateien blieben bei GitHub

## [1.106.0] - 2026-09-02

### Hinzugefügt
- Knopf Verwechslungsgefahr: ähnliche Fragen direkt hintereinander (Klasse N: 81 Fragen in 25 Gruppen)
- Verwechslungsgruppen: beim Laden je Prüfungsziel aus dem Katalog berechnet
- README: Abschnitt Einstieg CB → N mit den 138 angerechneten Fragen

### Geändert
- README: fünf aktuelle Prüfungsziele, Screenshot `02-pruefungsziel.png`, Simulator-Tabelle ohne Klasse A und N → A
- README: Durchsehen in der Funktionsliste ergänzt

### Behoben
- README: veralteter Verweis auf `09-simulator-klassen.png` entfernt

## [1.105.0] - 2026-09-02

### Hinzugefügt
- Knopf Durchsehen: alle Fragen in Katalogreihenfolge, auch gelernte, mit Lesezeichen
- Lesezeichen: je Benutzer und Prüfungsziel über die Frage-Kennung, Restzahl am Knopf
- Durchsehen: Auswahl Weiter bei oder Von vorn beim erneuten Start

### Geändert
- Vorlesen: Strich zwischen Zahlen mit Einheit als bis (3-30 MHz wird 3 bis 30 Megahertz), 104 Stellen

### Behoben
- Durchsehen: Rückkehr-Dialog für angefangene Runden überlagert das Fenster nicht mehr

## [1.104.0] - 2026-09-02

### Hinzugefügt
- Prüfungsziel Einstieg CB → N mit Badge CB-BONUS, 138 Fragen als CB-Wissen angerechnet (571 → 433)
- Lernfortschritt: Haken CB-Erfahrung anrechnen, je Benutzer auch in `data\userdata\` gespeichert
- Fenster Als CB bekannt mit allen 138 Fragen, einzeln in den Lernstapel zurückholbar
- `CB-Einstieg.md`: Begründung je angerechneter Frage

### Geändert
- Zielauswahl: fünf Karten (N Basis, E direkt, N → E, E → A, CB → N), Klasse A direkt und N → A entfernt
- CB-Wissen: zentral über `isMastered()`, Prüfungssimulator weiter mit allen 571 Fragen
- Zielauswahl: Zeilen beim Überfahren orange (`#f9a05a`)

### Behoben
- Lernfortschritt: CB-Liste verlängerte die Hauptansicht, Kasten jetzt 79 px hoch
- Zähler: angerechnete Fragen über `isMastered()` statt `masteryData` berücksichtigt
- Prüfungsziel: entfallene Ziele (`a`, `na`) fallen auf Klasse N zurück

## [1.103.0] - 2026-09-02

### Geändert
- Drucken: folgt dem gewählten Prüfungsziel mit 1 bis 5 Bögen statt fest 3
- Drucken: gleiche Quelle wie der Prüfungssimulator (`realisticTeile`, `realisticPool`)
- Deckblatt: nennt die Zielklasse, Technik A mit 60 statt 45 Minuten
- Drucken: fünf Papierfarben, Info-Text mit Klassen N, E, A und aktuellem Ziel

### Behoben
- Technikbogen: nur noch Fragen der Zielklasse statt aller Klassen
- Drucken: Bögen Technik E und A werden gedruckt, Aufstockungen ohne Vorschriften und Betrieb
- Fragenkennung: Technikfragen zeigen TN, TE oder TA statt N

## [1.102.0] - 2026-09-02

### Geändert
- Alles zurücksetzen: löscht auch den Prüfungsverlauf des aktuellen Benutzers, Fenstertext angepasst

### Behoben
- Reset: Verlauf in `examHistory`, `examHistory_<Benutzer>`, `amateurfunk_history_<Benutzer>` und `data\userdata\` geleert

## [1.101.0] - 2026-09-01

### Hinzugefügt
- Neuinstallation: Server meldet frischen Ordner über `/api/neuanfang`, Seite leert localStorage und sessionStorage
- Deinstallation: Rückfrage, ob `data\` mitentfernt wird (Vorgabe: Nein)

### Geändert
- Release-Beschreibung: Installation in vier Zeilen plus Änderungsliste (rund 900 statt 7451 Zeichen)
- `Release-Hochladen.bat`: alle Änderungen seit dem letzten Release, vorhandenes Release per `gh release edit` aufgefrischt

### Behoben
- `gh`-Aufruf: Argumente bei `shell:true` in Anführungszeichen, Titel und Pfade mit Leerzeichen bleiben intakt
- Gruppenraum: Gast erhält auf `/api/neuanfang` keine Antwort, sein Browser wird nicht geleert

## [1.99.0] - 2026-09-01

### Hinzugefügt
- `Start.js` als Ziel der Verknüpfungen

### Geändert
- Verknüpfungen: Ziel `node\node.exe` statt `wscript.exe`, Flag `runminimized`
- Setup-Schlussseite: Anleitung zum manuellen Anheften an die Taskleiste

### Behoben
- Verknüpfungen: Anheften an die Taskleiste möglich (Menüpunkt fehlte bei `wscript.exe` als Ziel)
- Installer: nicht funktionierende Option An Taskleiste anheften entfernt

## [1.98.0] - 2026-09-01

### Hinzugefügt
- Lebenszeichen der Seite alle 10 s (`/api/lebenszeichen`), Abmeldung per `sendBeacon`

### Geändert
- Server: beendet sich 45 s nach Schließen des letzten Fensters (nur `AFU_BROWSER=1`, 2 min Schonzeit, nie während Hörbuch-Berechnung)
- Portprüfung: wartet bis zu 10 s statt starrer 2 s

### Behoben
- Server lief nach Schließen des Browsers weiter, Port 3000 nach mehreren Starts belegt
- Meldung Port 3000 belegt: kein Verweis mehr auf STOP.bat, `taskkill`-Exitcode wird ausgewertet (Rechteproblem erkannt)

## [1.97.0] - 2026-09-01

### Hinzugefügt
- `version.js`: Versionsnummer aus dem CHANGELOG statt von Hand
- Ordner `release\` für fertige Setups, `Release-Hochladen.bat` zum Veröffentlichen

### Geändert
- Versionsnummer in EXE-Name, Dateieigenschaften, Apps & Features und package.json

### Behoben
- `Build-DIREKT.bat`: Abbruch mit Syntaxfehler im Dateinamen behoben (`for /f` jetzt über temporäre Datei)

## [1.94.0] - 2026-09-01

### Hinzugefügt
- Font Awesome 6.5.2 lokal im Ordner `fontawesome\` statt über CDN, kein Internetzwang
- README: acht neue Screenshots im Grey Mode

### Geändert
- Setup: 104 espeak-Stimmvarianten entfernt
- Hochladen: Schlussmeldung verweist nicht mehr auf entfernte Werkzeuge

### Behoben
- `Hochladen.bat`: node nicht gefunden, jetzt `process.execPath` statt bloßem `node`
- Hochladen: Löschungen vollständig und zuerst gelistet statt gekürzt
- `Hochladen.bat` und `GitHub-Verbinden.bat`: kein gegenseitiger Verweis mehr im Fehlerfall

## [1.88.0] - 2026-09-01

### Geändert
- Setup: fragt wieder nach dem Zielordner
- USB-Stick-Erstellung und Piper-Stimmen-Download samt aller Hinweise entfernt
- Setup verkleinert: arabische Vokalisierung und 111 fremdsprachige Wörterbücher (16,4 MB) entfernt

### Behoben
- 30 beim Ordnerwechsel liegengebliebene Dateien wiederhergestellt, per Dateigröße abgeglichen
- Neun MIT-Lizenzdateien aus `node_modules` vor versehentlichem Ausschluss bewahrt

## [1.85.0] - 2026-09-01

### Geändert
- Darstellung: Form Rund entfernt, nur noch Eckig
- Antwortfelder: Schrift, Farbe und Geometrie nach DARC-Vorbild, mit Haken und Kreuz
- Prüfungssimulator: keine Grün/Rot-Färbung, keine Ansage Richtig/Falsch
- Prüfungssimulator: angekreuzte Antwort orange, vorgelesene Antwort gelb

### Behoben
- Prüfungssimulator: Benutzerauswahl und Verlauf nach einem Durchgang wieder sichtbar (alle drei Ausstiegswege vollständig)
- Vorlese-Markierung: gelbe Hervorhebung wieder sichtbar (CSS-Spezifität)
- EXE: fehlendes Icon ergänzt

## [1.81.0] - 2026-09-01

### Hinzugefügt
- Grey Mode; Farbe und Form getrennt umschaltbar

### Geändert
- Setup: Zielordner-Abfrage, Symbol und Herausgeber-Angabe

### Behoben
- Setup: `data\*` (Lernstand) und `video_embed.json` nicht mehr mit ausgeliefert
- Setup: fehlendes `github_update.js` ergänzt (wird von `Server.js` beim Start geladen)
- START.bat: Doppelklick wirkungslos bei verwaistem Server auf Port 3000; beide Startdateien prüfen den Port vorher

## [1.77.0] - 2026-08-29

### Hinzugefügt
- Formelsammlung an der Frage: passende PDF-Seite angezeigt, Stelle markiert

## [1.76.0] - 2026-08-28

### Hinzugefügt
- `Update-Test.bat`: Probelauf der Update-Meldung ohne Download und Schreibzugriff
- README: Video zur Installation auf USB-Stick

### Geändert
- Updater: keine Auswahlabfrage mehr, Programmdateien ohne Rückfrage
- README: fester Platz auf dem Rechner, Lernstand zieht mit
- Desktop-Verknüpfung startet minimiert

### Behoben
- Start: nur noch ein Fenster statt zwei
- Sicherheitsmeldung zu blockiertem externem Zugriff entfernt, IP-Adressen gekürzt, Entfernen mit Option sperren

## [1.70.0] - 2026-08-28

### Hinzugefügt
- `GitHub-Verbinden.bat`: holt den Stand von GitHub in einen Ordner ohne `.git`
- `Zurueckholen.bat`: versehentlich gelöschte Dateien wiederherstellen

### Geändert
- README, Abschnitt Loslegen: kein Weg mehr über git clone und npm install
- Piper: Download direkt von der Quelle statt über ein Stimmen-Release

### Behoben
- `Hochladen.bat` hing nach Deinstallation von Node.js
- 19 Dateien fälschlich zum Löschen vorgemerkt (überschriebene `.gitignore`)

## [1.65.0] - 2026-08-27

### Hinzugefügt
- Betrieb ohne Installation: `Node-Holen.bat` lädt Node portabel, Prüfsumme gegen SHASUMS256.txt
- `USB-Stick-Erstellen.bat`: kompletter Trainer auf USB-Stick

### Geändert
- Repository bereinigt: von 800 Dateien und 22,6 MB auf das Nötige
- `sounds/fanfare.wav` (2,3 MB) und `bilder/youtube-vorlage.html` entfernt

## [1.63.0] - 2026-08-26

### Hinzugefügt
- Prüfungssimulator: alle sechs Prüfungsziele, Prüfungsumfang als zentrale Regel
- Repository: Vorschaubild und Anleitung

### Geändert
- Update-Prüfung beim Start: nur lokal, nur ohne laufende Runde, einmal je Stand, abschaltbar
- Direkteinstieg und Aufstockung konsequent getrennt
- Hauptseite: Prüfungsübersicht nutzt dieselbe Regel wie der Simulator

## [1.58.0] - 2026-08-26

### Hinzugefügt
- README: Screenshots von Hauptansicht, Zielwahl, Gruppenraum und Updater

### Geändert
- Lizenz: PolyForm Noncommercial 1.0.0 statt MIT (bereits Veröffentlichtes bleibt MIT)
- Repository: `Piper-Stimmen.zip` (419 MiB), alte Git-Historie und ausgediente Helfer entfernt

### Behoben
- `github_ausmisten.js`: Fehler behoben
- `BUG_REPORT.md` aus dem Repository entfernt

## [1.53.0] - 2026-08-26

### Hinzugefügt
- `DNS-Auffrischen.bat`: hilft bei negativem DNS-Cache nach Tunnelstart
- Download-Prüfung: HTML statt JSON und zu kleine Dateien werden erkannt

### Geändert
- START.bat: erst prüfen, dann fragen, dann starten; fremde Prozesse auf Port 3000 werden nie beendet
- Bezeichnung Gastgeber in Entwickler umbenannt (eine Stelle bewusst beibehalten)

### Behoben
- Startfenster schloss sich sofort wieder
- Meldung nannte nur den umständlichen Weg über den Tunnel des Entwicklers
- Portprüfung auf deutschen Systemen wirkungslos; im Zweifel wird jetzt gestartet

## [1.45.0] - 2026-08-26

### Hinzugefügt
- Angefangene Runde übersteht eine Pause und wird wiederhergestellt (nicht in Simulator und Gruppenraum)
- `Update-Pruefen.bat`: zeigt, warum ein Gast kein Update erhält
- `GitHub-Ausmisten.bat`: Entwicklerwerkzeuge aus dem Repository entfernen

### Geändert
- GitHub-Update: überschreibt keine lokal neueren Dateien mehr (dritter Zustand neuer hier)
- Update-Prüfung über Kennungen statt Download von 10 MB

### Behoben
- Prüfungsziel wählen: Zeilen reagierten nicht auf die Maus (Inline-Stile)
- Verlauf einblenden war kürzer als die Frage daneben
- Echte Vornamen aus `Index.html`, CHANGELOG und Raum-Dialog entfernt
- Update: eigene `.gitignore` wurde überschrieben

## [1.37.0] - 2026-08-25

### Hinzugefügt
- Formelsammlung und Fragenkatalog als PDF im Paket, auch über den Browser abrufbar
- Tastaturbedienung: 1–4 antworten, Enter weiter, Rücktaste zurück; Ansagen für Vorleseprogramme
- `Hochladen.bat` und `Stimmen_packen.bat` statt Anleitung

### Geändert
- Download heißt `Amateurfunk-Trainer.zip` statt `Klasse-N-Trainer.zip`
- Gruppenraum-Fenster: Download-Knopf entfernt

### Behoben
- Bildsuche: drei Varianten (`_q.svg`, `.svg`, `_q.png`) statt verschachtelter `onerror`
- `github_pruefen.js`: zwei Fehler behoben

## [1.32.0] - 2026-08-25

### Hinzugefügt
- Klassen E und A: alle fünf Prüfungswege, je eine eigene Fragendatei
- Knopf Fehler melden: vorbereitete Mail zur angezeigten Frage

### Geändert
- Sprachausgabe: nur noch Piper, Microsoft-Stimmen und stiller Rückfall darauf entfernt
- LaTeX in 219 Fragen nach Unicode umgesetzt statt KaTeX nachzurüsten
- Verlauf begrenzt, Seite wächst nicht mehr mit jeder Runde

### Behoben
- `fragen.json`: sechs Formel-Fragen repariert (NB302, NB303, NG104, NB501, NB502, NB503)
- 55 Zeilen toter Code entfernt

## [1.26.0] - 2026-08-23

### Hinzugefügt
- Hörbuch fürs Autoradio: Frage, drei Sekunden Stille, Antwort; MP3 je Lektion oder je Frage
- Hörbuch: Erzeugung im Server, happenweise kodiert, 44100 Hz

## [1.25.0] - 2026-08-22

### Hinzugefügt
- Gruppenraum: Fanfare und Konfetti beim Bestehen

### Geändert
- Verlauf: laufende Nummer entfernt (Datum, Teil, R, F, %, Ergebnis bleiben)
- Verlauf: Löschmodus mit zwei statt drei Knöpfen

### Behoben
- Gruppenraum: kein Geister-Eintrag mehr im Verlauf, jede Runde merkt sich ihren Eintrag
- Teilrunde: automatisch gewertete Fragen zählen mit
- Konfetti vor dem Fenster, fehlende Fanfare ohne Internet, Endlosschleife bei fehlender Bibliothek

## [1.20.0] - 2026-08-22

### Hinzugefügt
- Info-Fenster: Anzeige des Dateistands
- Abgleich mit dem Entwickler, getrennt nach Daten und Programmdateien
- Standwache: Banner bei veralteten Seiten
- Automatischer Abgleich beim Start, Sicherung nach `backup\`, abschaltbar mit `AFU_AUTO_ABGLEICH=0`

### Geändert
- Abgleich: `Server.js` wird nie automatisch ersetzt

### Behoben
- Gruppenraum: Ergebnis zeigt richtig, falsch und beantwortet statt nur Anzahl richtig

## [1.15.0] - 2026-08-21

### Hinzugefügt
- Prüfungstermin mit Tagespensum, je Benutzer gespeichert, Link zur BNetzA-Terminliste
- Lernen nach den 14 Lektionen des Videolehrgangs, mit Lektionsübersicht und Inhaltsverzeichnis
- Info-Knopf mit Kurzanleitung
- Verlauf: einzelne Einträge löschbar

### Geändert
- Hauptansicht aufgeräumt, Videolehrgang mit eigenem Feld und eigener Zählung
- Lektionsanzeige: offene und Gesamtzahl (z. B. 25 von 52)

### Behoben
- Kontrast: zwei Fehler an Info-Knopf und Lektionszeile

## [1.8.0] - 2026-08-20

### Hinzugefügt
- Option Gelerntes erneut prüfen: nur abgehakte Fragen, immer als Übung
- Gruppenraum und Prüfungssimulator: Option Bereits gelernte Fragen

### Behoben
- Verlauf: Gruppenraum-Runden und abgebrochene Runden werden erfasst
- Gelernte ausblenden: wirkt in allen fünf Fällen und wird wieder eingelesen
- Antworten aus früheren Runden nicht mehr mitgezählt

## [1.5.0] - 2026-08-19

### Hinzugefügt
- Fragenkatalog: Stichwortsuche

### Geändert
- Videos über YouTube; Benutzername gehört zum Benutzer-Slot

### Behoben
- YouTube-Fenster blieb leer (Fehler 153), Ursache Sicherheitsheader

## [1.4.0] - 2026-08-18

### Geändert
- Pastell Mode heißt Green Mode; Umschalt-Knopf zeigt den aktiven Modus
- Host: Fragenzahl und Bereich nachträglich änderbar, solange niemand geantwortet hat
- Chat: Textsmileys als Emoji dargestellt

### Behoben
- Chat im Dark Mode: Kontrast von 1,1:1 auf über 4,5:1
- Punkte-Leiste: Kontrastfehler in allen drei Themes
- Gruppenraum-Runden landen zuverlässig im persönlichen Verlauf
- Auswertungs-Popup erscheint nicht mehr, wenn ein anderer Teilnehmer fertig ist

## [1.3.0] - 2026-08-17

### Behoben
- Sicherheit K1: Projektordner inklusive Quellcode war über den Server abrufbar
- Sicherheit K2: Tunnel startete ohne Zustimmung
- Sicherheit K3: `/api/userdata` ungeschützt lesbar, überschreibbar und löschbar
- Sicherheit K4: `/api/start-tunnel` erlaubte Fremden, Prozesse auf dem PC zu starten und zu beenden
- Sicherheit K5: `/api/tts` für unbegrenzte Subprozesse missbrauchbar (DoS)
- Sicherheit K6: Punkte und Identität im Gruppenraum fälschbar
- K7: Server-Absturz bei fehlgeschlagenem Piper-Start
- Zufallsauswahl nicht mehr verzerrt, Raumcodes 6 statt 4 Zeichen, kein Passwort im Klartext in der URL
- Speicherwachstum, Dateikorruption bei gleichzeitigem Schreiben und TTS-Cache-Race behoben
- Einladungslink hing bei Tunnel startet noch; verwaiste Tunnel-Prozesse werden aufgeräumt

## Bekannte Einschränkungen

- Zuordnung Frage → Lektion ist thematisch: 279 von 571 Fragen hängen an der ersten Zeitmarke ihrer Lektion
- F9/F10 (Lösungen ein-/ausblenden) kollidieren mit den Aufnahme-Tastenkürzeln von Camtasia Studio, Alternative `Strg+Umschalt+L`
- Windows-ZIP ist groß, da Node, Piper und die Stimmen enthalten sind
