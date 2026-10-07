# Änderungsprotokoll — Amateurfunk-Trainer

Entwickler und Urheber: Dietmar Reh. Lizenz: [PolyForm Noncommercial 1.0.0](LICENSE).

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), SemVer. Je Version: Hinzugefügt, Geändert, Behoben.
Die oberste Versionsnummer ist die des nächsten Baus: `version.js` liest sie von hier
und legt sie in `package.json` ab, `Build-DIREKT.bat` übernimmt sie in den Namen des Windows-ZIP.
Die Zeile „Stand N · Datum“ unter der obersten Version zählt jede Lieferung, auch ohne neue Versionsnummer;
Index.html trägt dieselbe Nummer (`TRAINER_STAND`), angezeigt als 2.0NN (Stand 37 = 2.037): in der App als „Version 2.037“
unten auf der Startseite und unter Mehr, am PC als „Stand 2.037“ neben der Versionsnummer; das Update-Fenster vergleicht sie.

---

## [1.299.0] - 2026-10-06
Stand 116 · 07.10.2026

### Hinzugefügt
- Merkhilfen öffnen sich nach der Antwort nicht mehr von selbst. War eine offen, klappt sie zu, sobald die Frage beantwortet ist – aufklappen geht jederzeit von Hand.
- Ist Maja die Begleiterin, spricht sie auch von sich als Maja: Aus „Funki meldet sich zum Dienst!“ wird „Maja meldet sich zum Dienst!“ – in allen Sprechblasen, in den Werkzeug-Blättern und in der Stimme.
- Das Fenster „Nur noch 22 offene Fragen in diesem Teil …“ kommt nicht mehr – die Runde startet direkt mit den offenen Fragen, oben steht ja „Frage 1 von 22“.
- Android-App: Der Hinweis „Stimme wird vorbereitet …“ erscheint nicht mehr – die Stimme wird still im Hintergrund vorbereitet.
- **Weitere Merkhilfen aus der Formelsammlung, eingefärbt:** IARU-Bandplan 2 m (BC205, BC207, BC209–BC211, BC213–BC218) und 70 cm (BC206, BC208, BC212, BC219–BC222) mit farbigen Bereichen (CW/MGM, SSB, Baken, All mode, Digital, FM, Relais, Satellit) und hervorgehobenen Anruffrequenzen – ins Deutsche übersetzt; die Frequenztabelle der AFuV Anlage 1 mit Status und Leistung je Klasse (A orange, E blau, N grün, Bänder der Klasse N grün hinterlegt) bei VD706, VD709–VD737, VD743; der Rufzeichenplan mit farbiger Klasse bei BD101, BD102, BD104–BD108.
- **Farbcode als Merkhilfe:** Bei den Farbring-Fragen (NC102–NC110, EC113) steht unter den Antworten aufklappbar die Farbcode-Tabelle – jede Farbe als farbiges Feld, mit Wert, Multiplikator und Toleranz, dazu ein Beispiel-Widerstand (gelb, violett, braun, gold = 470 Ω ±5 %).
- **Merkhilfen auch für die Klassen E und A:** URI-Dreieck bei Vorwiderstand, Innenwiderstand und Strom im Spannungsteiler (EB513, EC515, EC521, EC522, AB205–AB208, AD106, AD107, AF425, AF426), PUI-Dreieck bei Leistung und Wirkungsgrad (AB213, AB214, AB502, AD319, AD320, AD430) und **beide Dreiecke** dort, wo die Leistung an einem Widerstand gesucht ist (EB509–EB512, EC516, AB301, AC523, AD108, AF427).
- **PUI-Dreieck für die Leistung:** Bei den Leistungsfragen NB601 bis NB606 steht dieselbe aufklappbare Merkhilfe als PUI-Dreieck – P = U · I, U = P / I, I = P / U.
- **URI-Dreieck als Merkhilfe:** Bei den Fragen zum Ohmschen Gesetz (NB501 bis NB505, AD106) steht unter den Antworten eine aufklappbare Merkhilfe „URI-Dreieck“ – R = U / I, I = U / R, U = R · I, das Gesuchte farbig markiert. Sie ist zugeklappt (sonst wäre sie schon die Lösung) und klappt nach der Antwort von selbst auf. Zum Abmalen auf den Schmierzettel. Nur beim Üben, nicht in Prüfung und Simulator.
- **Lernbedarf ohne gelernte Fragen:** Wer eine Frage als gelernt abhakt (von Hand oder nach drei richtigen Antworten), hat sie jetzt auch nicht mehr im Lernbedarf – vorher blieb sie dort, bis sie in der Lernbedarf-Runde dreimal am Stück richtig war. Die Zahl auf der Kachel sinkt entsprechend. Wird die Frage später wieder falsch beantwortet, kommt sie wie bisher zurück.
- Die Kachel „Prüfungstag“ heißt jetzt **„Prüfung simulieren“** – darunter „wie am echten Prüfungstag“.
- Prüfungssimulator: Überschrift und die Kacheln (3 Teile, 25 Fragen, 135 Min, 19/25, Grauzone) sind raus – das steht schon in „So läuft’s“. Das Fenster beginnt direkt mit „Womit möchtest du starten?“.
- Cockpit-Stil des Prüfungssimulators: Bei den hellen Designs (Hell, Grün, Blau, Orange, Grau) bleibt das Fenster jetzt **hell** im jeweiligen Farbton – dunkel wird es nur beim Design Dunkel.
- **Prüfungssimulator im Cockpit-Stil:** Das Auswahlfenster sieht jetzt aus wie ein Funkgerät-Display – leuchtende Zahlen, der gewählte Teil leuchtet, der Startknopf glüht. Die Farben richten sich nach dem eingestellten Design (Hell, Dunkel, Grün, Blau, Orange, Grau), die Ecken nach Rund oder Eckig.
- Prüfungssimulator: Unten fällt „Schließen“ weg (oben ist das X), dafür geht „Prüfung starten“ über die ganze Breite.
- Prüfungssimulator: Der Haken „Bereits gelernte Fragen nicht mehr fragen“ ist raus – in der Simulation wird jede Frage gestellt, sie zählt ja für die letzte Stufe. (Im Gruppenraum bleibt er.) Die Kachel „Grauzone“ geht auf dem Handy über die ganze Breite, kein Loch mehr daneben.
- Prüfungssimulator bestanden: jetzt mit **Fanfare und Konfetti** wie bei den anderen Runden, die Ansage kommt nach der Fanfare.
- Prüfungssimulator: Das **Konfetti** ist jetzt auch hier zu sehen – es flog bisher hinter dem Fenster. Die Ergebnis-Kacheln haben kein Loch mehr: Passen nur zwei nebeneinander, geht „Technik“ über die ganze Breite; auf breiten Bildschirmen stehen alle drei in einer Reihe.
- **Prüfungssimulator zählt jetzt mit:** Der Simulator mit Vorschriften, Betrieb und Technik nacheinander wurde beim Zähler „10 Prüfungssimulationen“ nicht mitgezählt. Jetzt gibt es nach jedem Teil den Zettel für diesen Teil und ganz am Ende den Gesamtzettel – mit allen Teilen, bei Bestehen mit Konfetti, angekreuzter Klasse und dem Zähler.
- **Letzte Stufe mit Zähler:** Die höchste Stufe (Amateurfunk-Klasse N, E oder A) gibt es jetzt für **10 bestandene Prüfungssimulationen** (Prüfungstag mit allen Teilen des Prüfungsziels). Ein Zähler „3 von 10 Prüfungssimulationen bestanden“ steht bei „Deine Stufen“, an der Level-Karte, auf dem Prüfungszettel und auf dem Zettel nach jeder bestandenen Simulation. Nicht bestandene Simulationen setzen ihn nicht zurück. (Ersetzt die Regel „Schnitt der letzten 10 Prüfungen“.)
- Der Zettel kommt jetzt auch bei **nicht bestanden** (ohne Konfetti): „Nicht bestanden – gebraucht werden 19 von 25“. Sind in der Simulation nur einzelne Teile geschafft, sind nur diese angekreuzt, dazu der Hinweis: In der echten Prüfung werden bestandene Teile bei der Wiederholung angerechnet – laut Bundesnetzagentur innerhalb von 24 Monaten (mit Datum), danach muss alles neu geprüft werden.
- **Der Zettel kommt mit dem Konfetti:** Wer bestanden hat – Prüfungssimulation, 25er-Prüfungsrunde eines Teils oder eine Übungsrunde ab 25 Fragen –, bekommt nach dem Konfetti den Zettel mit der Auswertung groß nach vorn geschwungen. Antippen daneben oder „Schließen“ macht ihn zu; bei Prüfungen bleibt er zusätzlich unter dem Ergebnis stehen.
- **Zettel nach jeder Prüfung:** Unter dem Ergebnis der Prüfungssimulation und der 25er-Prüfungsrunde eines Teils steht jetzt ein Zettel „Information nach der Prüfungssimulation“ – mit Name, Datum und den Kästchen Vorschriften, Betrieb, Technik. Angekreuzt wird, was bestanden ist (wie im Kurs: wer nur Technik schafft, hat nur Technik angekreuzt). Sind alle Teile bestanden, ist auch die Klasse angekreuzt – Herzlichen Glückwunsch!
- **Dein Prüfungszettel:** Unter „Deine Stufen“ (und nach dem Erreichen der letzten Stufe) gibt es einen Zettel im Stil „Information nach bestandener Prüfung“ – mit Name, Datum, den Kästchen N / E / A (angekreuzt, sobald die Klasse prüfungsreif geübt ist), dem Schnitt der letzten 10 Prüfungen und den nächsten Schritten: Prüfung anmelden, Bescheid und Zeugnis, Rufzeichen beantragen. Klar gekennzeichnet als Übungsstand, keine Prüfungsbescheinigung.
- Die Stufen enden jetzt mit der Prüfung: Die höchste Stufe heißt je nach Prüfungsziel **Amateurfunk-Klasse N**, **E** (Direkteinstieg E und Aufstockung N → E) oder **A** (Aufstockung E → A) und gibt es nicht für XP, sondern für die **Prüfungsreife**: 10 Prüfungen (Prüfungstag oder 25er-Prüfungsrunde eines Teils) mit im Schnitt **höchstens 5 Fehlern** je 25 Fragen. Der Stand („4 von 10 Prüfungen · 3 bestanden · Schnitt 4,2 Fehler“) steht an der Level-Karte und unter „Deine Stufen“; einmal erreicht, bleibt die Stufe. Sie gilt je Platz und Prüfungsziel – wer nach N auf E umstellt, arbeitet sich bis zur Klasse E wieder hoch. Davor zwei neue Stufen: **Hochfrequenz-Meister** (ab 9.200 XP) und **Hochfrequenz-Techniker** (ab 11.000 XP) – insgesamt 17 Stufen statt 15. Die „Funk-Legende“ entfällt.
- „Gelernte ausblenden“ hält sich jetzt auch bei der 25er-Runde eines Prüfungsteils: Sind dort nur noch z. B. 14 Fragen offen, kommen genau diese 14 (als Übungsrunde, ohne 19/25-Wertung) mit kurzem Hinweis – vorher wurde mit gelernten (hellgrünen) Fragen auf 25 aufgefüllt.
- Die Haken bei Vorschriften, Betrieb und Technik („Dein Fortschritt“) gelten jetzt überall: Auch „Lernbedarf“ und „Auffrischen“ nehmen nur noch Fragen aus den gewählten Teilen, die Zahlen auf den Kacheln zählen nur diese, und auf der Startseite steht „nur Technik“ statt „alle Teile“. Neue Runde, Fehler üben und Blättern hielten sich schon daran.
- Maja ist jetzt die Standard-Begleiterin im Stil Verspielt (wer Funki lieber mag: Einstellungen → Anpassen → Begleiter). Android-App: Maja ist das neue App-Symbol und winkt im Startbild beim Öffnen der App (kommt mit der nächsten App-Fassung).
- Maja spricht jetzt auch in den Werkzeug-Blättern (Verlauf, Videos, Hilfe & Kurse, Rufzeichen, Lernstand …): ihre Sprechblase am Rand wird mit ihrer Funkstimme vorgelesen, statt nur zu piepen. Tippt man sie an, sagt sie einen neuen Satz. Braucht die Stimme des Handys beim ersten Mal länger („Stimme wird vorbereitet …“), wartet der Trainer jetzt bis zu 16 Sekunden statt 6 – vorher gab Maja dann auf und blieb still.
- Blättern zeigt nur noch die Fragen, die du noch nicht abgehakt hast (die weißen) – nacheinander, ab dem Lesezeichen, danach die davor. Die gelernten (grünen) muss man nicht mehr überspringen, und sie tauchen im Verlauf nicht mehr auf. Unter „Andere Auswahl“ gibt es weiter den ganzen Katalog und die gelernten Fragen.
- Quiz „Wer ist Maja vom DOK B05?“: Die falsche Antwort „Eine Astronautin auf der ISS“ heißt jetzt „Eine Radiomoderatorin“ – die Astronautin im Trainer heißt ja inzwischen selbst Maja.
- PC, Ansicht „Wie die App“: Das Fenster „Mehr“ hat oben rechts ein X zum Schließen. Die Runde selbst (Fragen, Verlauf, Knöpfe unten) sieht am PC jetzt aus wie in der klassischen Ansicht; nach der Runde geht es zurück zur App-Startseite. Match ist für den PC umgebaut: X rechts oben, Texte für Maus statt Wischen, Pfeiltasten ← Falsch und → Richtig, Enter weiter, Esc schließt. Das Match-Fenster sieht am PC aus wie die übrigen Fenster (Kopfzeile mit Titel und X, weiße Fläche, Themen in drei Spalten). Die Knöpfe „Kopieren“ im Gruppenraum sind am PC kleine, ordentliche Knöpfe in der Zeile; der Info-Knopf unten in der Runde zeigt wieder die Quellenangabe.
- PC, Ansicht „Wie die App“: Das Gruppenraum-Fenster sieht wieder aus wie in der klassischen Ansicht (vorher war die Spalte mit dem Einladungs-Link zerquetscht). Internet-Link über Cloudflare und eigene Adresse lassen sich wieder erzeugen bzw. eintragen. Ebenso sind dort wieder da: die Reiter Update und Wartung in den Einstellungen und die Auswahl der Piper-Stimmen.
- Maja lebt: Beim Sprechen bewegt sich ihr Mund, ein Lichtschimmer gleitet ab und zu über das Visier, die blaue LED an der Brust blinkt, aus dem Kopfhörer steigen Funkwellen. Sie schwebt mit Dampfwölkchen aus dem Rucksack ins Bild, macht bei Erfolg (Tagesziel, neue Stufe, richtige Quizantwort, Rundenende) eine Rolle in der Schwerelosigkeit und schüttelt beim Staunen den Kopf.
- Ecken einheitlich: Form „rund“ macht alle Fenster rundum rund, „eckig“ alle eckig (vorher oben rund, unten eckig). Maja schaut in den Blättern (Verlauf, Videos, Hilfe …) groß seitlich aus dem Fenster heraus statt klein darüber. Match und „Neue Runde“ öffnen am PC als Fenster in der Mitte. Bei „ISS, Astronaut & Satellit“ heißt die erste Stufe jetzt „Viel“ statt „Oft“ – wie bei Funki.
- Gäste über den Link des Gruppenraums werden beim ersten Besuch gefragt, wie sie lernen möchten – Sachlich oder Verspielt, mit Haken an der Wahl und „So lernen“ (am PC zusätzlich Klassisch). Am Handy verhält sich die App-Ansicht dann wie die App (Fenster als ganze Seite, keine Verkleinerung); Server und Hörbuch sehen Gäste nicht.
- PC, Ansicht „Wie die App“, in der Runde: Die Frage steht wie in der klassischen Ansicht mittig in fester Breite statt über den ganzen Bildschirm gezogen. Die zwei breiten Leisten unten („Hilfen anzeigen“, „Verlauf ausblenden“) entfallen; den Verlauf blendet wieder der Reiter links neben der Frage ein und aus – vorher ließ er sich nach dem Ausblenden nicht mehr zurückholen. Die Hilfen stehen weiter oben in der Frage.
- Maja ist animiert: Beim Winken bewegt sich ihre Hand hin und her, und sie blinzelt; mit Kopfhörer blinzelt sie ab und zu. Am PC (Ansicht wie die App) öffnet „Mehr“ jetzt als Fenster in der Mitte (zweispaltig), der Gruppenchat sitzt unten am Rand, der Knopf zum Andocken entfällt dort. Vorlesen: „DOK B05“ wird als „Ortsverband Bravo Null Fünf“, „DOK C12“ als „Ortsverband Tschar-lie Eins Zwo“ gesprochen.
- PC, Ansicht „Wie die App“: Alles Anklickbare reagiert jetzt auf die Maus – Kacheln und Karten heben sich leicht an und bekommen einen farbigen Rand, Listenzeilen (z. B. Hilfe & Kurse, Mehr) rutschen ein Stück zur Seite und leuchten auf, Knöpfe oben und unten hellen sich auf. Am Handy ändert sich nichts. Fenster (Einstellungen, Gruppenraum, Klasse wählen, Unterricht, Statistik, Server) sind in der App-Ansicht am PC wieder mittige Fenster mit abgedunkeltem Hintergrund statt ganzer Seiten; die Blätter (Verlauf, Videos, Hilfe & Kurse, Rufzeichen, Lernstand) erscheinen als Fenster in der Mitte, „Mehr“ klappt oben rechts unter dem Knopf auf, und der Gruppenchat öffnet sich als Fenster unten rechts.
- PC: Beim ersten Start fragt der Trainer einmal, wie er aussehen soll – Klassisch, wie die App Sachlich oder wie die App Verspielt (mit kleinen Vorschaubildern). „Erst mal so lassen“ behält die klassische Ansicht; ändern lässt es sich jederzeit unter Einstellungen → Anpassen → Ansicht am PC.
- Stil-Wahl („Psst – ist dir das zu bunt?“ und Einstellungen → Stil der App): Die gewählte Karte trägt jetzt überall einen Haken, hell wie dunkel. Die Knöpfe in der Sprechblase von Funki und Maja nutzen die ganze Breite. Am PC sind die Handy-Vorschauen bei „Stil der App“ nicht mehr riesig.
- PC, Ansicht „Wie die App“: „Automatisch“ bei der Anzeigegröße passt sich jetzt dem Fenster an (bei Full HD mit Windows-Skalierung etwa 75 %) statt immer 100 %. Der Begleiter ist am PC deutlich größer. Maja winkt jetzt auch seitlich herein (mit Bild statt der alten kleinen Zeichnung, Blase „Maja“), und im Funk-ABC „Funker im All“ ist sie ebenfalls zu sehen; die Probe in den Einstellungen heißt „Maja winken lassen“.
- PC: Neue Ansicht „Wie die App“ – unter Einstellungen → Anpassen → „Ansicht am PC“ umschaltbar (zurück über denselben Schalter oder Mehr → Klassische Ansicht). Die Startseite füllt den ganzen Bildschirm: links die Runde mit dem Begleiter, in der Mitte Tagesziel und Übungskacheln, rechts Level, Fortschritt und Prüfungstermin. Darüber und darunter je eine Knopfreihe „Alles auf einen Klick“ mit Gruppenraum, Unterricht, Statistik, Verlauf, Drucken, Hörbuch, Videos, Diplome, Rufzeichen, Hilfe & Kurse, Sichern und Server. OFF AIR steht rechts bei Klasse und XP, die Version oben neben dem Namen, Beenden oben rechts. Farben wie in der App: Hell, Dunkel, Grün, Blau, Orange, Grau. Videos, Hilfe & Kurse und Rufzeichen stehen als Kacheln bei den Übungen (jede Kachel mit kurzer Beschreibung), der Server-Knopf neben OFF AIR, Diplome und Lernstand unter Mehr. Vorlesen mit Hervorheben läuft wie am PC gewohnt.
- Astronaut: zwei neue Hauptbilder von Dietmar (mit Kopfhörer und winkend). In Ruhe wechselt er nur noch zwischen diesen beiden und schwebt langsam – kein Hüpfen, Tanzen oder Rollen mehr. Die übrigen Posen kommen nur noch bei besonderen Momenten. Die Astronautin heißt jetzt Maja – so steht es in der Sprechblase, beim Vorstellen („Hier spricht Maja, deine Astronautin!“) und unter Einstellungen → Anpassen → Begleiter.
- Android-App: Funki richtet sich nach Tages- und Jahreszeit – morgens hat er die ISS beim Kaffeekochen beobachtet, nachmittags machen die Astronauten ein Nickerchen, abends zieht die ISS als heller Punkt vorbei; dazu Sprüche für Winter, Frühling, Sommer und Herbst. Unter Einstellungen → Anpassen → „Begleiter“ lässt sich Funki gegen einen Astronauten tauschen (Bilder von Dietmar mit Meta AI erstellt, mit deutscher Flagge am Arm): Er winkt zur Begrüßung, zeigt beim Tipp nach oben, hebt beim Tagesziel den Daumen und breitet beim Danke die Arme aus; in der Sprechblase heißt er „Astro“.
- Gruppenraum: Räume überstehen jetzt einen Neustart des Servers (bis drei Stunden) – Code und Link gelten weiter, alle Antworten bleiben, der Kursleiter ist nach dem Öffnen von selbst wieder in seinem Raum, und war der Server vorher ON AIR, ist er es danach wieder. Im Prüfungsraum meldet der Chat jetzt jeden abgegebenen Bogen einzeln („hat Betrieb abgegeben: 21/25 …“). Nach einem Update wartet der automatische Neustart, solange noch jemand im Raum mitten in der Runde ist.
- Android-App: Die Kachel „Auffrischen“ bleibt jetzt immer stehen („alles frisch“, wenn nichts fällig ist) – vorher sprangen die Kacheln.
- Android-App, Gruppenraum: Der Gastgeber hat oben neben dem Chat einen Knopf mit Tafel-Zeichen – er öffnet jederzeit, auch mitten in der Runde, die Übersicht: wer im Raum ist, richtig und falsch, wie weit, wer fertig ist. Die grüne Zahl zeigt, wie viele schon fertig sind.
- Android-App, Funki grüßt passend zur Tageszeit: morgens „Guten Morgen, ich wünsche dir einen guten Tag“, mittags „Mahlzeit! Was gab es Gutes bei dir zu essen?“ – mit dem Namen des Benutzers. Wer ihm die Antenne gerade biegt, bekommt jetzt wie beim Knie ölen ein „Das ist echter Ham Spirit!“.
- Android-App, Funk-ABC: „Die Jüngsten“ – Kirian, DOK C12 (9), gilt als Deutschlands jüngster Funkamateur, Maja, DOK B05 (14) als jüngste Funkamateurin (ihre Lizenz hat sie mit zehn bekommen). Funki schaut einmal mit dem Jungen herein und einmal mit dem Mädchen („Bist du der Nächste?“ / „Bist du die Nächste?“); in der Erklärung nennt er beide und fragt „Bist du der Nächste? Oder die Nächste?“, dazu die Knöpfe „Ich bin der Nächste!“ und „Ich bin die Nächste!“ mit Mutmacher („Weiter so, wir hören uns!“). Ohne Vereins- und Nachnamen. Dazu „Funker in Deutschland“: rund 61 000 Funkamateure mit gültiger Lizenz, über 50 000 Klasse A, gut 9 000 Klasse E, gut 1 000 Klasse N, über 33 000 im DARC (Zahlen gerundet; Quelle: Rufzeichen-Statistik, Stand 2026). Beide mit Bild und gesprochen; drei neue Quizfragen (Kirian, Maja, Anzahl der Funkamateure)
- Android-App, Astronaut: jetzt mit 21 Posen (alle von Dietmar mit Meta AI erstellt) – er salutiert morgens und gähnt nachts beim Gruß, morst beim Morsen, denkt beim Quiz nach und freut oder wundert sich über die Antwort, liest im Funk-ABC im Buch (bei ISS und OSCAR mit Kopfhörer, bei QSL mit Karte, bei der Richtantenne mit Antenne), fliegt beim Stufenaufstieg mit der Rakete, gibt nach der Runde High Five – und auf der Startseite wechselt er alle halbe Minute in eine ruhige Pose (Funkgerät, Kopfhörer, Antenne, Station, Buch, Zwinkern).
- Android-App: Spricht der Astronaut als Begleiter, klingt er immer wie über Funk – Quindar-Ton davor (250 ms, 2525 Hz), Roger-Beep danach (250 ms, 2475 Hz), kurzes Rauschen zum Schluss und ein leichter Doppler-Effekt, als zöge er gerade vorbei.
- Funk-ABC „Die Jüngsten“: statt des Wohnorts stehen jetzt die Ortsverbände – Kirian DOK C12, Maja DOK B05.
- Gruppenraum, Verbindung kurz weg: Bisher löschte der Server einen Teilnehmer samt aller Antworten, sobald die Verbindung abriss (Bildschirm aus, WLAN wackelt) – danach hieß es „läuft noch“ für immer, und nach einem Neuladen ging es von vorn los. Jetzt erkennt der Server ihn wieder (auch nach dem Neuladen, drei Stunden lang) und gibt ihm seine Antworten zurück; die Runde geht bei der ersten offenen Frage weiter.
- Gruppenraum am Handy im Browser: Oben links über der Frage steht jetzt „Frage 3 von 25“ – vorher fehlte der Zähler dort ganz.
- Gruppenraum: Wer später fertig wird als der Gastgeber, sieht sein Ergebnis (bestanden, Grauzone, nicht bestanden) jetzt sofort auf dem eigenen Gerät – auch wenn der Raum inzwischen beendet ist. „Raum beenden“ und „Neue Runde für alle“ fragen nach, solange noch jemand mitten in der Prüfung ist. Die Gesamt-Auswertung lässt sich durch Herunterziehen (oder „hier tippen“) aktualisieren und zeigt, von wann der Stand ist.
- Android-App, Vorlesen gleich nach dem Start: Meldet sich das bevorzugte Sprachmodul (z. B. Acapela) nicht, nimmt die App schon nach 10 Sekunden die Stimme von Google statt erst nach zwei langen Anläufen. Statt sofort des Fehlerfensters steht unten kurz „Stimme wird vorbereitet …“, und vorgelesen wird, sobald sie bereit ist.

## [1.298.0] - 2026-09-25

### Hinzugefügt
- Android-App: Dreimal schnell auf eine leere Stelle der Frage tippen zeigt die Lösung – wie die Taste F9 am PC, aber still: kein Hinweis unten, und bei der nächsten Frage ist es wieder aus (nochmal dreimal tippen blendet sie auch so aus). Im Prüfungssimulator und im Gruppenraum gesperrt. Antworten und Knöpfe lösen es nicht aus
- Android-App: Farben wie am PC – unter Einstellungen → Anpassen → „Farbe“ (oben; Hell/Dunkel ist dafür von Allgemein dorthin umgezogen) gibt es jetzt neben Hell und Dunkel auch Grün, Blau und Orange (wie die Stile in der Windows-Fassung), für Sachlich und Verspielt – der Fragenkasten in der Runde ist dann in der Farbe getönt, die Antworten bleiben weiß; auch die Leisten unten (Zurück/Weiter, Hilfen, Navigation) nehmen die Farbe an. Hell bleibt das bisherige Grau. „Wie Handy“ bleibt
- Android-App, Blättern gemischt: Im Blättern-Fenster gibt es den Schalter „Gemischt“ – dann kommen die Fragen quer durch alle Themen statt zehnmal hintereinander dasselbe. Die Mischung bleibt fest, damit das Lesezeichen trägt; gemischt und der Reihe nach haben je ein eigenes Lesezeichen, „Von vorn“ mischt neu. Auch „Nur Gelernte“, „Rest abarbeiten“ und „Noch nie geübt“ kommen dann gemischt. Am PC bleibt Blättern der Reihe nach
- Android-App, Verlauf: Eine Runde lange drücken wählt sie zum Löschen aus (kurzes Rütteln) – unten steht dann „1 löschen“, weitere lassen sich dazutippen; „Abbrechen“ lässt alles stehen. Der Weg über „Einträge löschen …“ bleibt
- Android-App, neue Kachel „Match“ unter „Üben“ (jetzt sechs statt fünf – kein Loch mehr im Raster; ist eine Kachel ausgeblendet, nimmt die letzte die ganze Breite): Wischen wie bei Tinder. Jede Karte zeigt oben die Frage (mit Bild, wenn es eins gibt) und unten EINE Antwort – nach rechts wischen heißt „die Antwort ist richtig“, nach links „falsch“ (oder die Knöpfe darunter). Statt vier Antworten gibt es nur zwei Möglichkeiten. Am Anfang erklärt ein Bild das Wischen, dann wählt man ein Thema: Alles gemischt, Prüfungsfragen (bei Klasse N alle 571), Q-Gruppen & Abkürzungen, Morsezeichen, Landeskenner (51, abgeglichen mit BD302 bis BD318), Stecker (mit den Katalogbildern) und Einheiten & Formeln. Bei N → E, E → A und N → A gibt es nur Technik: die Prüfungsfragen des Katalogs (dort nur Technik) und Einheiten & Formeln. Wer danebenliegt, sieht die richtige Antwort; 20 Karten je Runde, am Ende Ergebnis, Bestleistung je Thema und die verpassten Karten. Danebengegangene Prüfungsfragen kommen unter „Fehler üben“ und lassen sich gleich als normale Runde nachüben; der Lernfortschritt (gelernt) bleibt unberührt.
- Android-App, Stil Verspielt: Funk-Logbuch. Wer die ISS oder den OSCAR-Satelliten im Vorbeiflug über der Startseite antippt, hat ein QSO – mit kurzem „R“ in Morse und Eintrag ins Logbuch (Mehr → Funk-Logbuch): Datum, Uhrzeit in UTC, Rufzeichen (RS0ISS, NA1SS, DP0ISS bzw. AO-7), Frequenz, Betriebsart und Rapport, wie in einem echten Stationstagebuch. Auch der winkende Astronaut lässt sich anfunken (DP0ISS aus dem Columbus-Modul). Dazu zählt das Logbuch, wie oft ISS, Satellit und Astronaut vorbeigekommen sind. Die ersten Male erklärt ein kleiner Hinweis, dass man sie antippen kann. In einer Runde fliegen sie weiter durch, ohne etwas anzufassen.
- Stand-Nummer: Jede Lieferung zählt eine Nummer hoch, auch wenn die Versionsnummer gleich bleibt – angezeigt als 2.0NN. Die App hat damit eine eigene Versionsnummer: „Version 2.037 · 04.10.2026“ ganz unten auf der Startseite (antippen öffnet Info & Hilfe → Daten & Stand) und unter Mehr → Info & Hilfe. Am PC steht sie als „Stand 2.037“ im Info-Fenster, am Info-Knopf und in Einstellungen → Update (dort auch der Stand bei GitHub: gleich / neuerer Stand). Das Update-Fenster sagt „Version 2.038 vom … ist da — du hast gerade Version 2.037“. Im CHANGELOG steht die Nummer als Zeile „Stand N · Datum“ unter der obersten Version; von dort liest der Updater den Stand bei GitHub.
- Android-App: Unter Mehr gibt es „Nach Update suchen“ – sieht bei GitHub nach und sagt, ob eine neuere Fassung bereitliegt (dann das bekannte Update-Fenster), ob alles aktuell ist, oder woran es hängt (kein Netz, GitHub bremst). Bisher kam das Fenster nur beim Start und nur einmal je Sitzung; der Reiter Update ist in der App ausgeblendet.
- Gruppenraum am Handy im Browser: Wer über den Einladungslink mitmacht, hat jetzt dieselben Hilfen wie in der App – unter den Antworten die Leiste „Hilfen anzeigen“ (Rechner, Erklärung mit Vorlesen, Formelblatt, wo es eine Stelle gibt) und neben dem Zahnrad den Dreistrich-Knopf, der die Leiste ein- und ausschaltet; 50 Ohm, Lösungsweg und Video bleiben im Raum gesperrt (wie in der App). Ausserhalb eines Raums und am PC, Tablet und in der App ändert sich nichts
- Blättern: Liegt ein Lesezeichen mitten im Katalog, fragt der Trainer beim Öffnen zuerst „Beim letzten Stand weitermachen?“ – Ja, weitermachen (bei der gemerkten Frage), Nein, von vorn oder Andere Auswahl (ganzer Katalog, nur Gelernte, Rest abarbeiten, noch nie geübt); ohne Lesezeichen geht gleich die Auswahl auf
- Gruppenraum am Handy im Browser (Teilnehmer, die über den Einladungslink kommen): Der Chat hat jetzt einen runden Knopf unten rechts, der den Chat als ganze Seite öffnet – mit Zahl ungelesener Nachrichten am Knopf und der Zurück-Taste des Handys zum Schließen; der Chat liegt nie von selbst über der Frage. Vorher war er auf dem schmalen Bildschirm ganz ausgeblendet. Am Rechner und in der Android-App bleibt alles wie bisher
- Gruppenraum: Wer über den Link im Handy-Browser mitmacht und dessen Gastgeber keine Piper-Stimme hat (zum Beispiel die Android-App als Gastgeber), bekommt „Vorlesen“ jetzt von der Sprachausgabe des eigenen Geräts – Frage und Antworten, mit den ausgeschriebenen Abkürzungen („QRM“ → „Störungen“); der Server wird nur einmal gefragt, danach liest das Gerät direkt
- Android-App, Stil Verspielt: Funki spricht mehr – „Funki spricht“ hat jetzt vier Stufen (Viel, Normal, Wenig, Aus) und „Funki, dein Helfer“ ebenso. Normal ist gesprächiger als bisher: Funki sagt, was in der Blase steht (Hereinlugen, Tipps, Rundgang, Antworten beim Plaudern, Tagesziel im Gruß); Wenig entspricht genau dem bisherigen Verhalten, Aus ist ganz still. Je Stufe ändern sich auch die Pausen, wie oft er auftaucht, Kunststücke, „Hilf mir“-Bitten und das Lob für richtige Antworten am Stück (bei Viel schon ab drei). Alte Einstellungen „An“ und „Aus“ gelten weiter (An = Normal). Mehr freche Sprüche, auch mit Funk-Wortwitz
- Android-App, Funki erklärt das Funk-ABC: CQ, DX, QRM, QRN, QTH, QSL, QRP, Richtantenne, Amateurfunk-TV (ATV), SSTV, Morsen, ISS, deutsche Funker im All, die Funk-Satelliten OSCAR und OSCAR 7, die Jüngsten, Funker in Deutschland und Ham Spirit – je Begriff eine Blase mit kleinem, bewegtem Bild (Funkwellen, Antennenkeule, Fernsehbild, das sich Zeile für Zeile aufbaut, Raumstation, Astronaut …) und gesprochen. Zu erreichen über „Erklär mir was“ (Tipp, Hilfe-Menü, Antippen), als Wort des Tages im Tagesgruß (jeden zweiten Tag statt eines Tipps) und beim Hereinlugen („Weißt du, was QRM ist?“). Gelesene Begriffe bekommen einen Haken; wer alle kennt, ist Ehren-Funker. „Hör mal: CQ“ und „Und 73“ morsen zum Anhören, die Zeichen leuchten dabei der Reihe nach auf
- Android-App, Funk-ABC-Quiz: drei Antworten, eine stimmt – richtig gibt Lob mit Funk-Wortwitz („QSL – verstanden und bestätigt!“), falsch eine freche Ausrede („Das war wohl QRM in deinem Kopf!“) mit der richtigen Antwort und einer kurzen Erklärung; zehn richtige machen zum Funk-ABC-Meister. Auch bei drei Fehlern in einer Runde bekommt Funki (bei Viel und Normal) eine freche Ausrede dazu
- Android-App: Die ISS fliegt mit Ton durch den Bildschirm – schräg über die Startseite, groß in der Mitte und klein am Rand, dazu Rauschen, das beim Vorbeiflug nach unten rutscht, tiefes Brummen, Funk-Piepen und ein Bliep; der Klang wandert von Ohr zu Ohr. Nur im Stil Verspielt, nur auf der Startseite, nie in einer Runde, nie beim Vorlesen, nie bei „Animationen entfernen“. Einstellungen → Allgemein → „ISS & Astronaut“: Oft, Normal, Selten, Aus; der Ton einzeln; Knopf „ISS vorbeifliegen lassen“
- Android-App: Ein Astronaut winkt seitlich herein und macht Mut für die Prüfung („Weiter so – wir hören uns!“) – mit kleiner Blase und süßer Funk-Stimme (hoch wie bei Funki, dazu ein Quindar-Ton davor, der Roger-Beep danach und Funkrauschen mit leisem Knistern darunter; Funkis eigene Stimme bleibt unverändert). Er kommt nach manchen ISS-Überflügen, auf Wunsch über „Astronaut winkt“ beim Funk-ABC „ISS“ und „Funker im All“ und zur Probe in den Einstellungen („Astronaut winken lassen“)
- Android-App: Funki bittet um Hilfe für sein rostiges Knie – er taucht mit rostigem Quietschen auf, darunter der Knopf „Knie ölen“; danach bedankt er sich: „Das ist echter Ham Spirit!“ (gesprochen „Hämm“). Kommt öfter als die anderen Bitten
- Android-App: Der OSCAR-Satellit fliegt mit Ton durch den Bildschirm – in einem flachen Bogen über den oberen Teil der Startseite, dabei ruft er dreimal „CQ“ in Morsezeichen (−·−· −−·−). Die Lampe am Satelliten blinkt im Takt der Zeichen, der Ton rutscht beim Vorbeiflug nach unten (Doppler-Effekt) und wandert von Ohr zu Ohr. Etwa jeder dritte Überflug ist der Satellit statt der ISS; danach lugt Funki herein und sagt etwas dazu (bei „Funki spricht“ auf Wenig nicht). Gleiche Regeln und derselbe Regler wie die ISS: Einstellungen → Allgemein → „ISS, Astronaut & Satellit“ (Oft, Normal, Selten, Aus; Ton An/Aus), dazu der Probierknopf „OSCAR-Satellit fliegen lassen“. Nur im Stil Verspielt, nur auf der Startseite, nie in einer Runde, nie beim Vorlesen, nie bei „Animationen entfernen“
- Android-App, Funk-ABC: Zwei neue Themen mit Bild und Stimme – „OSCAR“ (Orbiting Satellite Carrying Amateur Radio; OSCAR 1 startete am 12.12.1961, 4,5 kg, Morse „HI HI“ im 2-m-Band, nach rund sieben Wochen verglüht; der Doppler-Effekt) und „OSCAR 7“ (1974, Bauteile von AMSAT-DL, 1981 Batterie defekt, 2002 wieder da, noch in Betrieb; OSCAR 10 und 13, 13 von AMSAT-Deutschland gebaut). Beide mit Knopf „Satellit fliegen lassen“. Vier neue Quizfragen (Bedeutung von OSCAR, was OSCAR 1 funkte, Besonderes an OSCAR 7, wie ein Satellit beim Vorbeiflug klingt). Die Erklärung „Die Jüngsten“ ist etwas kürzer, damit sie auch auf kleinen Handys auf den Schirm passt
- Android-App, Funk-ABC: Deutsche Funkamateure im All – Dr. Ulf Merbold (DB1KM, Spacelab 1983, später Mir), Thomas Reiter (DF4TR, Mir und ISS 2006) und Matthias Maurer (KI5KFH, ISS 2021/22); Rufzeichen nachgeprüft (DARC, Wikipedia). Merbold flog nicht zur ISS, steht darum unter „Funker im All“
- PC, Stil „Klar“: Prüfungsübersicht, Lernfortschritt und Verlauf (ebenso Fragenkasten und Knopfleiste in der Runde und die Fußzeile) sind jetzt so breit wie die Kopfleiste darüber – der Innenrand von 26 Punkten links und rechts entfällt. Das Fenster bleibt gleich groß; der Inhalt hat dadurch mehr Platz
- PC: Die Kopfleiste ist ein Stück kleiner – Titel 21 statt 24 Punkte, Knöpfe und Felder der Leiste 12,2 statt 12,8 Punkte Schrift bei 34 statt 40 Punkten Höhe –, damit sie nicht größer wirkt als der Inhalt darunter. Die Karte bleibt 1440 Punkte breit, das Fenster wird nicht größer, die Seite eher niedriger. Der Versuch davor (Inhalt per Zoom um 10 % größer, Karte auf 1720 Punkte verbreitert) ist zurückgenommen: er machte das Fenster zu groß und ließ den Verlauf aus dem Rahmen laufen
- PC: Alle Farbstile sind jetzt gleich hoch – die Startseite samt Fußzeile und die Fragenansicht brauchen in Hell, Grün, Blau, Orange, Grau, Luftig, Klar, Papier und Graphit denselben Platz. Bisher passte die Fußzeile bei „Klar“ schon bei 85 % Anzeigegröße ins Fenster, bei den anderen erst bei 80 %. Dafür sind Innenrand, Abstände zwischen Titelzeile, Knopfleiste, Inhalt und Fußzeile sowie die Seitenränder angeglichen; in den neuen Stilen haben Frage und Antworten dieselbe Schriftgröße und denselben Abstand wie in Hell
- PC, Stile „Luftig“, „Klar“, „Papier“, „Graphit“: Prüfungssimulator, Gruppenraum und Unterricht haben dieselbe Farbe wie Auffrischen, Blättern, Statistik und Drucken (vorher eigene Tönung); Start, Fehler und Lernbedarf bleiben
- PC: Der Stil „Graphit (dunkel)“ heißt jetzt nur „Graphit“
- PC, Stile „Luftig“, „Klar“, „Papier“: Die Zeilen unten auf der Startseite (Prüfungstermin, Rufzeichen prüfen, Lernen aktiv für, Videolehrgang, Hilfe & Unterlagen, Hörbuch) tragen jetzt die Farben des gewählten Stils statt des alten Hellblaus; in „Papier“ auch Beschriftungen, Knöpfe, Felder, Besucherzähler, die graue Fläche um Frage und Antworten, die Seitenleiste mit Zahlenpunkten und der Kopf des Prüfungssimulators
- PC, Stile „Luftig“ und „Klar“: Die Knopfleiste unten (Abbrechen, Zurück, Weiter …) endet jetzt mit Verlauf-Spalte und Fragenkasten und ragt rechts und links nicht mehr über
- PC: Der alte Dunkel-Modus entfällt, „Graphit (dunkel)“ ersetzt ihn; ein gespeicherter Dunkel-Modus wird beim Start zu Graphit. Die Android-App behält Hell und Dunkel
- PC, Graphit: Der Rundgang-Kasten in der Info ist lesbar (die Schrift war hell auf hellem Grund), das Rufzeichenfeld bei den Diplomen ist dunkel, und der Schleier hinter den Fenstern ist neutral statt bläulich
- PC, Stil „Klar“: Die Knopfleiste unten trägt denselben dunkelblauen Rand wie der Kasten und steht nicht mehr über dessen Rand hinaus
- PC: Vier neue Farbstile unter Einstellungen → Allgemein → Farbstil – „Luftig & hell“ (runde Karten, viel Luft, kräftiges Blau), „Klar & kontrastreich“ (dunkelblaue Kopfleiste, eckig, kräftige Linien), „Papier & warm“ (cremefarben, Serifen, Bernstein) und „Graphit (dunkel)“ (der Dunkel-Modus in neutralem Grau). Der bisherige Stil bleibt Vorgabe; der Umschalter in der Kopfzeile kennt die neuen Stile ebenfalls. In der Android-App gelten weiter Sachlich und Verspielt
- Android-App: Bei jeder neuen Frage steht die Seite ganz oben (Weiter, Zurück, Sprung im Verlauf) – vorher blieb der Rollstand der alten Frage liegen; beim Antworten auf derselben Frage bleibt die Stelle
- Android-App: Der Abschluss einer Runde („Runde beendet“, auch mit ausgelassenen Fragen) passt auf den Schirm – Knöpfe untereinander, Text bricht um, die Liste der Ausgelassenen bleibt in der Breite
- Android-App, Dunkel-Modus: Bei Bildantworten stehen die Buchstaben A–D in Blau statt Schwarz; die Zeichnungen sind weißer (Kontrast 2,6 statt 1,8 nach der Umkehr), Grund und Kante der Bilder bleiben wie gehabt
- Android-App: Blättern-Fenster ist rollbar – Kopf und Fuß stehen fest, die Kacheln in der Mitte rollen; die letzte Zeile war unter dem Rand verschwunden. Die Knöpfe im Fuß sind im Dunkel-Modus lesbar
- Android-App: Blättern-Fenster im Dunkel-Modus mit kräftigeren Farben – Titel, Zahl, Balken und Rand jeder Kachel in hellen Tönen statt der Tagesfarben
- Android-App: Mitlesen beim Vorlesen – das gerade gesprochene Wort bekommt in Frage und Antworten eine andere Schriftfarbe (nur die Farbe, kein Rahmen); Einstellungen → Vorlesen → „Mitlesen“ mit An/Aus und sechs Farben (Vorgabe: An, Gelb), gilt auch für die Erklärung
- Android-App: Knopf ☰ rechts neben dem Zahnrad der Frage blendet die beiden Leisten unten („Hilfen anzeigen“, „Verlauf einblenden“) ein und aus; dazu Einstellungen → Allgemein → „Leisten unter der Frage“ (An/Aus). Vorgabe: An. Die Wahl bleibt gespeichert
- Android-App: „Von selbst weiterblättern“ hält nur noch an, wenn ein Knopf oder eine Leiste angetippt wird – Rollen, Tippen auf Text und das Vorlesen stören den Zähler nicht mehr
- Android-App: Haken „Nur die Frage vorlesen“ (Einstellungen → Vorlesen → Fragen und Antworten) – Vorlese-Knopf und automatisches Vorlesen sprechen die Antworten nicht mit; ersetzt dort den Maus-Haken
- Android-App: Das Dock unten weicht auch beim langsamen Rollen (Weg seit dem letzten Richtungswechsel statt Sprung je Ereignis); empfindlich: 5 Punkte abwärts, zurück nach 14 Punkten aufwärts oder ganz oben
- Android-App: Beim Abhaken als gelernt nur noch die grüne Meldung, die blaue entfällt
- Android-App: Die Hilfen zur Frage (Formelblatt, Rechner, Erklärung, 50 Ohm, Lösungsweg, Video) stecken hinter einer Leiste „Hilfen anzeigen“; aufgeklappt stehen sie in zwei gleich breiten Spalten mit einheitlichem Rahmen. Beide Leisten („Hilfen anzeigen“, „Verlauf einblenden“) sitzen schmal in einem festen Dock direkt über Zurück/Weiter, verschwinden beim Herunterrollen und kommen beim Hochrollen oder ganz oben wieder
- Android-App: „Von selbst weiterblättern“ läuft auch, wenn vorgelesen wird – nach der Antwort zählt der Knopf sofort herunter; als Netz blättert die App nach Ablauf plus drei Sekunden selbst weiter. Jede Berührung danach hält es weiterhin an
- Android-App: Im Stil Sachlich kein Maus-Klick-Ton mehr (am PC bleibt er)
- Android-App: Auch die gerade vorgelesene Antwort trägt im Dunkel-Modus die Farbe aus Einstellungen → Anpassen (statt des festen Blaus); „Kein Rand" gilt auch dort
- Android-App: Im Dunkel-Modus trägt die angetippte Antwort (Simulator) die Farbe aus Einstellungen → Anpassen (z. B. Gelb, schwarze Schrift) statt des festen Türkis; „Kein Rand" gilt auch dort
- Android-App: Reiter „Anpassen" ohne „Maus"-Wortlaut („Antwort hervorheben", „Vorschau — Antwort antippen"); Antippen eines Vorschaufeldes zeigt die Farbe
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
- Prüfungssimulator: Übung zur mündlichen Nachprüfung (Klasse N, Betrieb/Vorschriften) mit Vorlesen, Tastatur und Selbsturteil, im Gruppenraum prüft der Kursleiter
- Chat: Reaktionen mit Emojis wie bei WhatsApp (Daumen hoch/runter, lustig, traurig, grünes Herz, Kleeblatt, erstaunt, Lächeln) und Löschen eigener Nachrichten, der Gastgeber kann jede löschen
- Chat: dritter Haken, wenn bei mehreren Empfängern alle die Nachricht gelesen haben
- Unterricht im Gruppenraum: Wahl „Jeder im eigenen Tempo“ (Vorgabe) oder „Im Gleichschritt“ – im eigenen Tempo blättert jeder selbst, sieht sofort, ob es stimmt, der Kursleiter sieht „x von y fertig“ und kann die Lektion jederzeit beenden
- Chat: Bilder senden (Knopf neben dem Mikrofon, Einfügen mit Strg+V oder Hineinziehen), der Browser verkleinert sie vorher; Großansicht per Klick
- Chat: Prüfungsfrage teilen – Sprechblase an der Frage schickt Nummer, Text, Zeichnung und Antworten ohne Lösung in den Chat, mit „Im Trainer öffnen“
- Chat ohne Raum: Leiste „N auf dem Server“ zeigt, wer gerade da ist (Namen, Kursleiter, du)
- Rundgang für neue Teilnehmer: einmal unter der eigenen Begrüßung angeboten, nur im eigenen Browser sichtbar; Schritt für Schritt durch die wichtigsten Knöpfe; Text in rundgang.md anpassbar; jederzeit über Info oder „Rundgang“ im Chat
- Android-App: wird bei GitHub automatisch gebaut und hängt am Release neben Windows, Linux und macOS (`Amateurfunk-Trainer-<Version>-android.apk`, ab Android 8), dazu bei jedem Hochladen eine „Android-App (Vorabversion)“ zum Ausprobieren – zum Lernen am Handy und als Server im WLAN; Vorlesen mit der Stimme des Handys, am Handy nicht nutzbare Knöpfe ausgeblendet, Einstellungen und Info mit Reitern oben; Internet-Link für den Gruppenraum als Versuch (Server-Knopf erscheint, wenn die App ihn mitbringt); berichtigte Dateien von GitHub wie am PC, danach startet die App auf Knopfdruck selbst neu; im Dark Mode der App erscheinen die Zeichnungen kräftiger weiß; neuer Aufbau wie eine Android-App: oben eine schmale Leiste mit Suche, Benutzer und Gruppenchat, unten Lernen · Prüfung · Gruppe · Fortschritt · Mehr, Zurück/Weiter im Daumenbereich, die Prüfungsuhr oben, der Gruppenchat als ganze Seite, Form eckig oder rund (Einstellungen → Allgemein), die Zurück-Taste schließt zuerst offene Fenster; Fenster füllen in der App den ganzen Bildschirm (kleine Rückfragen bleiben Dialoge), die untere Leiste weicht beim Scrollen nach unten aus und kommt beim Hochscrollen zurück, lange Fragen rollen unter den festen Knöpfen Zurück/Weiter durch statt die Anzeige zu verkleinern, im Menü „Mehr“ heißt der Eintrag „Facebook“; ein Update meldet sich in der App wie bei jeder App: „Neues Update verfügbar“ mit „Installieren“ oder „Verwerfen“, danach startet die App von selbst neu
- Android-App: zwei Stile zur Wahl – „Sachlich“ (klar und ruhig, große Schrift) und „Verspielt“ (Punkte, Serie, ON AIR und Funki); beim ersten Start fragt die App „Bist du lieber sachlich – oder doch lieber verspielt?“ und zeigt beide als kleine Handy-Bildschirme mit dem eigenen Namen; umstellbar unter Einstellungen → Allgemein oder Mehr → Darstellung, dazu Hell, Dunkel oder Wie Handy und ein Tagesziel (5, 10, 20, 25 oder 50 Fragen); neuer Startbildschirm mit großer Karte „Runde starten“, Blatt „Neue Runde“ (Prüfungsteile, Anzahl, Gelerntes auslassen) statt Auswahllisten, Ring fürs Tagesziel, Serie der Übungstage und Punkte (10 je richtige, 2 je falsche Antwort) mit Stufe als S-Wert am Benutzerbild; Anzeigegröße und Nachteilsausgleich gelten in beiden Stilen
- Android-App, Stil Verspielt: Funki springt aus der Karte und hüpft über den Bildschirm – er stellt sich mit Salto und hüpfendem Namen vor, zeigt beim ersten Mal auf einem kurzen Rundgang mit Leuchtring die wichtigsten Knöpfe („Psst – hier!“), sagt einmal am Tag Hallo mit einem Tipp, tanzt beim geschafften Tagesziel und kommt jederzeit auf Antippen
- Android-App, Funki als Begleiter: fröhlich und frech taucht er immer wieder am Bildschirmrand auf, ohne zu stören – mit Sprüchen, Mutmachern („Du bist gut, mach weiter so – du schaffst das!“), Plaudern je nach Tageszeit (Mittagessen, wie war dein Tag, „So spät noch wach?! Du bist aber fleißig“, um 4 Uhr ab ins Bett), einem Wort zur letzten Runde („richtig gut – du verbesserst dich“) und Lob für fünf richtige am Stück; in Fenstern und bei einer kniffligen Frage fragt er „Alles in Ordnung? Brauchst du Hilfe?“ und erklärt oder bietet Vorlesen an; nie in der Prüfung, nie im Gruppenraum; abschaltbar unter Einstellungen → Allgemein → „Funki, dein Helfer“ (dann kommt er nur auf Antippen); „Animationen reduzieren“ des Handys wird beachtet
- Android-App, Funki spricht: kurz, mit eigener heller Roboterstimme wie aus dem Funkgerät (Stimme des Handys, höher und eine Spur flotter, leichter Roboterklang mit zweiter Stimme, vorher kurz Rauschen, am Ende ein Piep) und kleinen Roboter-Tönen statt Wörtern (Bliep-Blup, Piep piep, schnelles Rechnen, Rutsch beim „Uppps!“, Kichern, Schluckauf) – „Hallo! Ich bin Funki, dein Trainer. Soll ich dich mal durch die App führen?“, der Gruß am Tag mit dem eigenen Namen, „Brauchst du Hilfe?“, Lob, der Jubel beim Tagesziel und wenn man ihn antippt; sein Mund bewegt sich dabei; von selbst höchstens alle vier Minuten ein Satz; nie in der Prüfung, im Gruppenraum oder beim Vorlesen; eigener Schalter „Funki spricht“ mit „Hör mal“ unter Einstellungen → Allgemein
- Android-App, Stil Verspielt: mehr Leben – die Funkwellen in der großen Karte laufen langsam von Funki weg, der gelbe Zickzack ums Tagesziel zeichnet sich einmal, die Zahl zählt dabei hoch, er schwingt kurz nach und das Abzeichen darunter hopst (beim Öffnen, nach einer Runde, wenn sich die Zahl ändert); Knöpfe und Kacheln geben beim Drücken federnd nach und klingen leise („Töne beim Tippen“ unter Einstellungen → Allgemein, nie in der Prüfung und nie beim Vorlesen), die Karten der Startseite hüpfen kurz herein; „Animationen reduzieren“ des Handys wird beachtet
- Android-App, Funki ganz menschlich: mal lacht er, hat Schluckauf („Piep piep … hicks! Entschuldigung“), niest, erzählt einen Funkerwitz oder sagt „Uppps!“; ab und zu bittet er um Hilfe – Gelenk ölen, Akku laden, Antenne geradebiegen, Staub wegpusten, kitzeln –, mit eigenem Knopf, danach bedankt er sich (höchstens zweimal am Tag)
- Android-App, Funkis Kunststücke: er hüpft quer über den Bildschirm, schlägt Purzelbäume, macht sich unsichtbar und taucht woanders wieder auf, schaut vom Rand herein, winkt oder macht einen Salto – kurz und ohne Blase, auf der Startseite höchstens dreimal je Start. In einer Runde nur dort, wo unter Frage und Antworten Platz frei ist, und immer stumm; beim Vorlesen nur leise (hereinschauen, winken); je mehr Platz, desto öfter; wird es eng, ist er sofort weg; nie in der Prüfung
- Android-App, Stil Verspielt: „Psst – ist dir das zu bunt?“ – einmal zeigt Funki ein kleines Fenster mit beiden Stilen als Bildchen; Antippen stellt gleich um, „Zeig mir, wo man das umstellt“ führt zu Einstellungen → Allgemein, wo der Kasten aufleuchtet
- Android-App, Stil Verspielt: neuer unterer Teil der Startseite statt der Kästen – Karte „Dein Level“ mit 15 Stufen vom Funk-Neuling bis zur Funk-Legende (nach den XP, mit Balken; beim Aufstieg feiert Funki mit, Antippen zeigt alle Stufen), „Dein Fortschritt“ mit den drei Prüfungsteilen zum An- und Abwählen und „Gelernte ausblenden“, ein Countdown bis zur Prüfung mit Fragen pro Tag und sechs Kacheln: Verlauf, Videos, Hilfe & Kurse, Rufzeichen, Lernstand und So läuft’s. Jede Kachel öffnet ein Blatt von unten, auf dessen Rand Funki steht und etwas dazu sagt („Hier helfen dir echte Funker!“); beim ersten Mal erklärt er, wofür es da ist. Der Rundgang zeigt auf Wunsch auch das Level und alle Kacheln, wer ihn schon kennt, bekommt die Werkzeuge einmal angeboten. Im Stil Sachlich und am PC bleibt alles, wie es war
- Android-App, Startbild: im Stil Verspielt winkt Funki statt des Zeichens – er ploppt herein, wippt, blinzelt und winkt, bis der Trainer geladen ist; im Stil Sachlich bleibt das Zeichen (kommt mit der nächsten APK)
- Android-App, Hilfen an der Frage: unter den Antworten zwei Reihen Tasten – Formelblatt (nur bei Fragen mit Stelle im Blatt, pulst wie am PC), Rechner, Erklärung mit „Erklärung vorlesen“ daneben, darunter 50 Ohm, Lösungsweg (wo der DARC einen hat) und Video; in der Prüfung bleiben nur Formelblatt und Rechner; beide Stile
- Android-App, Formelblatt: die App zeichnet die Seite der Formelsammlung selbst als Bild (das Browserfenster der App kann kein PDF) – Blättern mit Pfeilen, „Größer“ vergrößert; andere PDFs öffnet die App im Browser des Handys statt sie still herunterzuladen (kommt mit der nächsten APK)
- Android-App, Stilwahl: „Bist du lieber sachlich – oder doch lieber verspielt?“ kommt bei jedem Start, bis unten „Nicht mehr anzeigen“ angehakt ist
- Android-App, Stil Sachlich: der untere Teil der Startseite wie eine App statt wie der PC – „Fortschritt“ mit Gesamtzahl, Balken je Prüfungsteil (antippen schaltet den Teil an oder aus) und „Gelernte ausblenden“, „Prüfung“ mit den Tagen bis zum Termin, „Werkzeuge“ als ruhige Kacheln (Verlauf, Videolehrgang, Hilfe & Unterlagen, Rufzeichen, Lernstand, So läuft die Prüfung), jede öffnet ein Blatt von unten – ohne Punkte, Level oder Funki; in den Blättern tragen alle Knöpfe dieselbe Farbe (kein bunter „Nachsehen“-Knopf, keine Verläufe bei Verlauf und Videos); der Prüfungstermin steht als Kästchen rechts neben dem Gruß
- Android-App, Bilder: die große Ansicht füllt die Breite und lässt sich mit zwei Fingern oder doppeltem Tippen vergrößern und verschieben; an jeder Bildantwort eine kleine Lupe für die große Ansicht (das Antippen des Bildes wählt weiter die Antwort)
- Android-App, Folien: statt auf die englische GitHub-Seite führt „Folien“ (Hilfe & Unterlagen) zu einer eigenen Ansicht – die drei Foliensätze des DARC, vor dem Laden der Hinweis mit Dateigröße („ca. 150 MB – am besten im WLAN“), Fortschrittsbalken mit Abbrechen, danach liegt die PDF in der App (auch ohne Internet), Ansehen als durchgehender Streifen zum Nach-unten-Scrollen (wie in einer gewöhnlichen PDF-Anzeige: mehrere Folien auf dem Bildschirm, „Folie 12 von 2983“, Pfeile, Antippen der Zahl zum Springen zu einer Folie, Vergrößern, merkt sich die Stelle; die Seiten werden im Hintergrund gezeichnet, nur die um das Sichtfeld herum – braucht die neue App, ohne sie geht es langsamer), Entfernen jederzeit; die Sätze heißen nach den Kursen von 50ohm.de (Klasse N, Klasse E, N → E), der zum eigenen Ziel passende ist markiert; mit Quellenangabe 50ohm.de-Autorenteam / DARC e. V., Lizenz CC BY 4.0 (kommt mit der nächsten APK, ältere Apps öffnen weiter den Link)
- Android-App, Blatt „Hilfe & Kurse“: die Unterzeile sagt jetzt „Hilfe beim DARC und bei 50 Ohm · Links öffnen im Browser“ (bei Klasse N mit „Bücher bei Amazon“) – nennt, wo die Hilfe liegt, ohne eine Zusammenarbeit zu behaupten.
- Android-App, Gruppenraum und „Besucher über den Link“: eigene Handy-Fassung statt des PC-Fensters – im Gruppenraum steht nichts mehr über den Rand (lange Server-Adresse wird mit „…“ gekürzt, Hinweise brechen sauber um, „Raum erstellen“ über die ganze Breite), neben Server-URL und Einladungs-Link ein Knopf „Kopieren“, der immer die ganze Adresse in die Zwischenablage legt; das Besucher-Fenster füllt den Bildschirm: oben Titel und Kreuz, darunter Zähler/Verlauf/Neustart gleich breit in einer Reihe, unten Server, Zeitschaltuhr und Sperre in einer Reihe, Aktualisieren und Schließen darunter. Am PC und im Browser unverändert.
- Android-App, Einstellungen: „Lernstand zurücksetzen“ setzt jetzt wirklich alles auf null – gelernte Fragen, Fehlerliste, Lernbedarf, Verlauf der Runden (nur des gewählten Benutzers), Auswertung der Antworten und Übungszeit, Tagesziel, Serie, Level und Punkte (vorher wurden nur die „gelernten“ Fragen zurückgesetzt, der Rest blieb stehen). Das Fenster sagt vorher, was gelöscht wird und was bleibt (Notizen, Merkliste, Prüfungstermin, Name, Einstellungen), und rät zur Sicherung unter „Lernstand sichern“. Gilt nur für den Lernstand der App auf dem Handy; der Lernstand am PC bleibt unberührt, das kleine Zurücksetzen am PC ist unverändert.
- Android-App, Fenster „Unterricht“: eigene Handy-Fassung statt des PC-Fensters – zuerst alle Lektionen untereinander auf dem ganzen Bildschirm, Antippen öffnet die Lektion mit ihren Abschnitten, darunter fest der Knopf „Lektion N starten“ (Zurück-Pfeil oben links und die Zurück-Taste führen zur Liste); Abschnitte brechen sauber um, die Reiter lassen sich seitwärts schieben. Am PC und im Browser unverändert.
- Android-App, Prüfungsteile je Ziel: bei N → E und E → A gibt es nur Technik – das Blatt „Neue Runde“ bietet dann nur diesen Teil an und die Fortschritt-Karte verzichtet auf die Zeilen Vorschriften und Betrieb (0/0); bei Klasse N und E bleiben alle drei
- Chat: Funki antwortet auch im Chat – „Funki, …“, „Hey Funki“ oder @Funki am Anfang einer Nachricht; dahinter steht der Lerncoach (KI) in Funkis Art: fröhlich, ermutigend, fachlich genau; nur wenn der Kursleiter den Lerncoach eingeschaltet hat
- Gruppenraum: „Neue Runde für alle“ fragt, was drankommt – Fragenrunde (Anzahl, Bereich), Prüfungssimulator oder eine Lektion mit Tempo (nach einer Lektion ist die nächste vorgewählt); die Meldung „ist fertig“ im Chat kommt jetzt auch für den Letzten und in jeder weiteren Runde
- Lerncoach (KI) im Chat: Nachricht mit „Hey KI“ oder @KI (nur „Hey KI, ich habe eine Frage“: er fragt zurück und nimmt die nächste Nachricht) oder „Lerncoach fragen“ an einer geteilten Frage, Erklärung als Text und auf Wunsch („Ja, bitte“) als Sprachnachricht, nur für den Fragenden (die anderen sehen „… hat den Lerncoach gefragt“), gestützt auf richtige Antwort und Erklärung aus dem Trainer; eigener API-Schlüssel je Kursleiter bei Anthropic oder OpenRouter (liegt im Benutzerprofil, nie im Trainer-Ordner; an OpenRouter ohne Vornamen; Auswahl der kostenlosen OpenRouter-Modelle; Antworten mit englischen Vorüberlegungen werden abgefangen und neu angefragt), Modellwahl, Tagesgrenze, Ordner `lerncoach` mit Anweisungen und Verlauf; schweigt in Prüfungen
- Sprachnachrichten wie bei WhatsApp: laufende Balken bei der Aufnahme, Pause, Welle in der Sprechblase mit Springen per Klick
- Sprachnachrichten: Abspielgeschwindigkeit 1×, 1,25× oder 1,5× per Klick auf die Pille in der Sprechblase; die Wahl gilt für alle Nachrichten und bleibt gespeichert
- Besucherfenster: Zeitschaltuhr – zu einer Uhrzeit Server aus, wahlweise danach PC herunterfahren (eine Minute Vorlauf, abbrechbar), Besucher 5 Minuten vorher gewarnt
- Verlauf anklickbar: Ein Klick auf einen Eintrag zeigt die Fehler der Runde mit eigener und richtiger Antwort, „Fehler erneut üben“, „Ausgelassene üben“ und „In Fehler und Lernbedarf übernehmen“ für inzwischen herausgefallene Fragen
- Einstellungen, neuer Reiter „Anpassen“: Antwort unter der Maus in Blau, Grün, Gelb, Orange oder Grau; Rand läuft einmal herum, steht sofort oder bleibt weg; das Feld leuchtet sanft auf (abschaltbar); mit Vorschau (im Dark Mode dunkel), Wahl pro Benutzer, auch im Dark Mode
- Nachteilsausgleich, Kasten Stimme: Geschwindigkeit 1×, 1,1×, 1,25×, 1,3× oder 1,5× (Tonlage bleibt) und Klang ruhig, normal oder lebhaft; nach jeder Änderung spricht der Trainer eine Probe
- Nachteilsausgleich: „Antwort unter der Maus vorlesen“ – der Vorlese-Knopf spricht nur die Frage, jede Antwort wird gesprochen, sobald Maus oder Tabulator auf ihr steht, beim Wechsel bricht die alte sofort ab; die gesprochene Antwort ist dabei in der gewählten Farbe markiert
- Chat: Sprachnachrichten von anderen laufen automatisch los, mehrere nacheinander, nie während Vorlesen oder Prüfung; abschaltbar unter Einstellungen → Allgemein → Chat
- Chat rechts andocken: als Spalte über die ganze Höhe, immer aufgeklappt, die Seite rückt nach links; Knopf im Chatkopf oder Einstellungen → Allgemein → Chat. Angedockt steht der Chat innerhalb der Karte als eigene Spalte wie der Verlauf – derselbe Rahmen außen herum, dieselbe Farbe und derselbe Rand wie die Verlauf-Spalte im jeweiligen Stil, 310 Punkte breit; während einer Runde endet die Knopfleiste vor dem Chat und schließt unten mit ihm ab. Fenster wie Einstellungen oder Besucher legen sich samt Abdunklung auch über den angedockten Chat. Die Eingabezeile ist großzügiger und ohne eigenen Strich darüber. Schwebend übernimmt der Chat den Farbton des gewählten Stils (Grau, Grün, Blau, Orange, Dunkel) statt weiß zu bleiben; bei Grau mit dunklerem Text für die Lesbarkeit
- Gruppenraum: Anrufen im Chat – unter dem Chatkopf stehen alle im Raum; der Kursleiter ruft einen Teilnehmer per Hörer an, nur die beiden hören sich. Beim Angerufenen erscheint „Annehmen / Ablehnen“, oben im Chat der grüne Streifen „Im Gespräch mit …“ mit Stummschalten und Auflegen. Die Stimmen gehen direkt von Browser zu Browser (WebRTC), nicht über den Trainer; beim Anrufen klingelt `sounds/klingelton.mp3` bei beiden (sonst kein Ton, kein Ersatzton). Das Profilbild des Anrufers kommt direkt mit dem Anruf. Datenschutzerklärung um die Anrufe ergänzt
- Profilbild unter Einstellungen → Allgemein, pro Benutzer: wird rund zugeschnitten und auf 128 × 128 Punkte verkleinert; im Gruppenraum in der Kontaktliste, im Gesprächsstreifen und beim Anrufen zu sehen. Ohne Bild steht der Anfangsbuchstabe in einem farbigen Kreis. Datenschutzerklärung ergänzt
- Chat: neue Nachrichten stehen unten direkt über dem Eingabefeld, ältere darüber – wie bei WhatsApp; wer unten ist, bleibt unten
- Unterricht: neuer Knopf in der Leiste mit den Lektionen des gewählten Prüfungsziels in der Reihenfolge der Folien von 50ohm.de (Lizenz CC BY 4.0, Namensnennung im Fenster) – Klasse N 14 Lektionen, Aufstockung N → E 16, Aufstockung E → A 14 (bei 50ohm noch überwiegend Entwurf, im Fenster gekennzeichnet), Direkteinstieg E 23; Katalogfragen ohne Folie hängen als „Weitere Prüfungsfragen“ am passenden Kapitel; Abschnitte mit Videolehrgang von DL2YMR an der passenden Stelle, Folien auf 50ohm.de, Start „ab hier“; merkt sich, wo der Kursleiter aufgehört hat, auf Wunsch gleich im Beamer-Modus mit Lektion und Abschnitt oben
- Kurs und Hausaufgaben: Im Fenster „Unterricht“ legt der Kursleiter einen Kurs an und lädt per WhatsApp (einzeln oder Gruppe), E-Mail oder kopiertem Text ein – ein Link für alle. Teilnehmer melden sich mit dem Vornamen an (Haken im Willkommensfenster oder Reiter „Kurs“), der Kursleiter nimmt sie im Chat oder im Reiter „Teilnehmer“ auf; danach erkennt der Trainer sie auf diesem Gerät, ohne Passwort. Hausaufgaben: Lektion oder einzelne Abschnitte mit Termin; Teilnehmer arbeiten sie unter „Meine Hausaufgaben“ ab, auch in Etappen, es zählt die erste Antwort. Reiter „Auswertung“: wer was mit welchem Ergebnis erledigt hat, Überfälliges rot, dazu die Fragen, an denen die Gruppe hängt – auf Knopfdruck am Beamer, alles auch als Tabelle (CSV für Excel/LibreOffice). Im Chat, jeweils nur für den Betroffenen: „Neue Hausaufgabe“ mit Start-Knopf, Erinnerung am Tag vor dem Termin und am Termin, beim Kursleiter „Maja hat Lektion 3 erledigt“. Datenschutzerklärung ergänzt
- Unterricht im Gruppenraum: Der Kursleiter startet die Lektion für alle, im Gleichschritt – alle sehen seine Frage, die Teilnehmer antworten am Gerät und sehen die Wertung erst beim Auflösen; am Beamer „x von y haben geantwortet“ und nach dem Auflösen an jeder Antwort, wie viele sie gewählt haben (ohne Namen); Leertaste oder Presenter: erst auflösen, dann weiter; am Ende Auswertung für alle. Wählbar über den Knopf „Unterricht“ oder im Gruppenraum-Fenster (Haken „Unterricht“ unter dem Prüfungssimulator, Lektion, Am Beamer, „Jetzt starten“)

### Geändert
- Android-App, vorbereitet für den Google Play Store: gebaut für Android 16 (läuft weiter ab Android 8), Zurück-Geste und Bildschirmränder nach den neuen Regeln. Die Play-Store-Fassung holt keine Programmdateien von GitHub – „Nach Update suchen“ öffnet dort den Play Store. Die APK von GitHub und der PC bleiben wie sie sind.
- Android-App: Neues App-Symbol – Funki, das kleine freche Funkgerät aus der App, statt der Antenne. Rund, eckig oder abgerundet, je nach Handy.
- Android-App, Tagesziel: zusätzlich 75 Fragen am Tag wählbar (5, 10, 20, 25, 50, 75)
- Android-App, Match: Auflösung nach jeder Karte – auch wenn man richtig lag, zeigt die Karte jetzt, was es bedeutet (z. B. „LSB – Unteres Seitenband (englisch: Lower Side Band)“), weiter mit „Weiter“ oder Antippen. Abschaltbar am Anfang mit dem Schalter „Auflösung nach jeder Karte“ (dann fliegt eine richtige Karte gleich weiter wie bisher). Bei falsch kommt die Auflösung immer
- Android-App, Stil Verspielt: „ON AIR“ oben rechts ist jetzt der Server-Schalter und sieht aus wie ein echtes Studio-Schild. Nach dem Start der App ist der Server aus: „OFF AIR“ in dunklem Blaugrau mit durchgestrichenem Mikrofon. Antippen schaltet den Server ein – dann leuchtet es rot „ON AIR“ (Besucher kommen über den geteilten Link herein). Nochmal antippen schließt ihn, mit Rückfrage und einer Minute Vorwarnung für alle, die gerade da sind. Die Zahl daneben (Tage am Stück) ist weg – die steht weiter beim Tagesziel
- Android-App, Match, Schalter „Erweitert“ (am Anfang über den Themen): Aus – Q-Gruppen und Landeskenner nur so, wie sie in den Prüfungsfragen vorkommen (13 Q-Gruppen, 40 Landeskenner). Ein – dazu die übrigen (31 Q-Gruppen, 52 Landeskenner), auf der Karte als „erweitert“ gekennzeichnet. Das eigene Thema „Landeskenner erweitert“ entfällt dafür
- Android-App, Match, Einheiten & Formeln: Die Antworten sagen jetzt, was gemeint ist – bei Dezibel „etwa doppelte Leistung (× 2)“ statt nur „2“, „zehnfache Leistung (× 10)“ usw.; bei den Vorsätzen mit Wort, z. B. „10⁻⁶ (ein Millionstel)“
- Android-App: Der Knopf „Generalprobe starten“ unter „So läuft’s“ heißt jetzt „Prüfung simulieren“, darunter klein: „Wie am Prüfungstag: echte Fragen, mit Uhr, am Ende bestanden oder nicht“. Die Kachel „Prüfungstag“ trägt ebenfalls „Prüfung simulieren“
- Android-App, Match, Landeskenner: Zu jedem Land steht die Fahne (z. B. Ukraine 🇺🇦), auch in der Lösung groß über dem Ländernamen; England und Schottland mit ihren eigenen Fahnen
- Android-App, Match, Q-Gruppen, Abkürzungen (die in Telegrafie gebräuchlichen wie PSE, K, AWDH, 73) und Landeskenner auch in Telegrafie: Unter dem großen Kürzel stehen die Morsezeichen (z. B. QRZ = −−·− ·−· −−··), sie werden bei jeder Karte vorgespielt und lassen sich mit „Erneut abspielen“ noch einmal hören
- Android-App, Match, Landeskenner: Das Thema „Landeskenner“ enthält nur noch die Kenner, die in den Prüfungsfragen vorkommen (40 – dazu neu N für die USA); die übrigen (G, OM, OH, SV, HA, S5, 9A, YO, TF, LY, YL, 9H) stehen zusammen mit allen anderen unter „Landeskenner erweitert“ (Zusatz, am Ende der Liste, nicht in „Alles gemischt“)
- Android-App, Match, Morsezeichen mit Ton: Jedes Zeichen wird beim Aufdecken der Karte vorgespielt (700 Hz, Tempo 15 WpM), der Knopf „Anhören“ spielt es noch einmal; nach einer falschen Antwort ist das richtige Zeichen zu hören
- Android-App, Match im Dark Mode: Die Zeichnungen (Stecker, Schaltbilder) erscheinen wie in der normalen Runde im Negativ – weiße Linien auf dunklem Grund statt weißer Kästen
- Android-App, Match: Kürzel stehen groß in Türkis auf der Karte – UA, QRZ, OM fast bildschirmbreit, längere wie CUAGN etwas kleiner; alles passt auch auf 360er-Handys
- Android-App, Match: Swipe-Tutorial – vor der ersten Karte einer Runde füllt eine kurze Erklärung den ganzen Bildschirm (mit ✕ oben rechts zum Schließen): zwei Hände mit Pfeilen, „Links wischen = Falsch“ (rot), „Rechts wischen = Richtig“ (grün). Darunter der Schalter „Ich habe es verstanden“ – einmal eingeschaltet, kommt die Erklärung nicht wieder. Ein Tipp daneben schließt sie nur für diesmal. Am Anfang (Themenwahl) lässt sie sich mit „Swipe-Tutorial vor der ersten Karte“ wieder einschalten
- Android-App, Match: Wischen geht jetzt kurz – ein Wisch von gut einem Fingerbreit (40 Punkte) oder ein schneller Schubs reicht, nicht mehr über den halben Bildschirm. Dazu darunter die Knöpfe „✗ Falsch“ und „✓ Richtig“. Das Bild am Anfang zeigt die Karte mit den zwei Knöpfen; die Kachel heißt weiter „Match“, darunter „richtig oder falsch?“. Dabei behoben: Die Knöpfe unter der Karte taten in Stand 38 nichts – ein Name im Skript verdeckte die Auswertung, nur Wischen ging.
- Android-App, Match: Neues Thema „Abkürzungen“ mit allen Betriebsabkürzungen aus Telegrafie und Sprechfunk (PSE, K, KN, BK, AR, SK, AWDH, YL, XYL, OM, 73, 88, TNX …) und allem, was in den Prüfungsfragen abgekürzt vorkommt: Rufzeichenzusätze (/p, /m, /mm, /am, /R), Betriebsarten (SSB, LSB, USB, FM, RTTY, SSTV, DMR …), Technik (PTT, VOX, RIT, VFO, SWR, PEP, ERP, EIRP …) sowie Regeln und Stellen (IARU, ITU, CEPT, AFuG, BEMFV, EMVU …), dazu weitere übliche Kürzel wie AS, KA, CL, BCNU, GL, OT, SKED, WKD, UFB, QST sowie AGC, ALC, BFO, CTCSS, MUF, LUF, TVI, ATV – 166 Kürzel. Mal wird gefragt „Was bedeutet …?“, mal „Welche Abkürzung steht für …?“; Kürzel mit gleichem Sinn (TNX, TKS, TU) kommen nie als „falsche“ Antwort. „Q-Gruppen“ ist jetzt ein eigenes Thema mit 31 Gruppen (neu nach dem Q-Schlüssel: QRB, QRH, QRI, QRU, QSA, QSD, QSK, QSU, QSX, QTC, QTR). Die Morsezeichen bleiben, stehen aber am Ende, gelten als Zusatz (eher ab Klasse E) und kommen bei Klasse N nicht mehr in „Alles gemischt“. Bei N → E, E → A und N → A gibt es jetzt auch Morsezeichen und die Abkürzungen aus Betriebsarten und Technik
- Android-App, Startseite: Ganz unten kommt die untere Leiste (Lernen, Prüfung, Gruppe, Fortschritt, Mehr) wieder, auch wenn sie beim Rollen nach unten verschwunden war – der Platz unter der Fußzeile, der für sie freigehalten ist, war sonst ein Fingerbreit Leere.
- Blättern: Im Verlauf ist jetzt nur grün, was als gelernt abgehakt ist. Eine richtig beantwortete, noch nicht abgehakte Frage zählt weiter 1 von 3 für „gelernt“, ihr Punkt bleibt aber neutral; falsch bleibt rot. In allen anderen Runden bleibt richtig dunkelgrün.
- Blättern: Die Kachel „Mit Erklärung“ ist entfallen – inzwischen hat jede Frage eine Erklärung, die Kachel stammte aus der Zeit, als sie nur zu einem Teil vorlagen
- Android-App: statt der Farbstile Grau, Grün, Blau und Orange heißt es in der App jetzt Hell, Dunkel oder Wie Handy; am PC bleibt alles, wie es ist
- Android-App: Bei Funki klickt es nicht mehr wie eine Maus – seine Knöpfe antworten mit einem kleinen Computer-Piep; beim Weggehen macht er sich manchmal mit ein paar Funken unsichtbar
- Android-App, Stil Verspielt: je Antippen nur noch ein Ton – das leise Plopp ersetzt den Maus-Klick; in der Prüfung und beim Vorlesen bleibt es still (der alte Maus-Klick kam dort noch durch und ist weg), „Töne beim Tippen: Aus“ ist ganz still
- Android-App, Runde: weniger Abstand zwischen Kopfleiste und Frage – die Frage rückt nach oben und lässt den Antworten mehr Platz (beide Stile)
- Android-App, Dunkel: Frage und Antworten in heller Schrift statt gedämpftem Blaugrau; richtig, falsch und gewählt behalten ihre Farben
- Android-App, Stimme: gleich nach dem Start wartet die App bis zu 12 Sekunden auf die Sprachausgabe des Handys, statt sofort den Hinweis zu zeigen; ein laufender Verbindungsaufbau wird nicht mehr nach fünf Sekunden abgebrochen, erst nach zwanzig; nach zwei vergeblichen Anläufen weicht sie auf das Modul von Google aus, falls installiert; der Hinweis sagt jetzt „Start keine Antwort“ statt „Start 0“ (kommt mit der nächsten APK)
- Android-App: raus aus der Testphase – sie trägt jetzt einen eigenen Schlüssel statt des Test-Schlüssels. Wer die Testversion hat, sichert einmal den Lernstand (Startseite: „Sichern“, im Stil Verspielt die Kachel „Lernstand“), deinstalliert sie, installiert die neue App und liest den Lernstand wieder ein; danach gehen Updates wie gewohnt darüber. Projektseite und README nennen Android neben Windows, Linux und macOS
- Zeichen der Webseite (Google, Browser-Tab): rund und ohne Schrift, damit es in der Trefferliste nicht mehr abgeschnitten wird; das Programmsymbol bleibt
- Titel und Beschreibung für Suchmaschinen (Startseite, Projektseite, Trainer): „Amateurfunkprüfung lernen – Klasse N, E und A, kostenlos“ und „Amateurfunkprüfung mit intelligentem Lernsystem: Fehler kommen wieder, bis sie sitzen. 1750 Prüfungsfragen mit Lösungsweg – kostenlos, ohne Anmeldung.“
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
- Besucherfenster: Zähler, Verlauf und Neustart als kleinere Knöpfe oben in der Kopfzeile, Server, Zeitschaltuhr und Sperre unten links
- Texte: „Kursleiter“ statt „Gastgeber“
- Hinweisbalken für Besucher (Schließen, Neustart) und Server-Knopf im Countdown gelb statt braun
- Einstellungen: Knopf „Einstellungen übernehmen“ statt „Fertig“
- Chat ohne Gruppenraum: Sprachnachrichten jetzt auch für Besucher am geteilten Link
- Prüfungen: Fragen, die bei abgelaufener Zeit offen blieben, kommen wie falsche Antworten unter Fehler und Lernbedarf
- Lernstand: Die Sicherung am Trainer-PC darf größer werden (8 MB statt 256 KB), damit auch drei Benutzer samt Verlauf Platz haben
- Facebook-Seite des Trainers verlinkt: Symbol in der Kopfzeile, Fußzeile im Trainer, Projektseite und Ratgeber
- Supportseite: Fehler und Wünsche über die Facebook-Seite statt über GitHub, Hinweis zu Facebook im Datenschutz

### Behoben
- Android-App, Hilfen-Leiste: Der Knopf „Erklärung“ war nach dem Antippen in den Farben Grün, Blau und Orange weiß auf weiß (unsichtbar) – jetzt lila mit weißer Schrift wie in Hell und Dunkel
- Android-App: Die große Erklärung (Erklärung zur Zeichnung, vergrößert) füllt jetzt den ganzen Bildschirm und lässt sich bis zum Ende rollen – vorher lag sie nur über dem Fragenkasten und war unten abgeschnitten
- Android-App, Verlauf: Langes Drücken auf eine Runde wählt sie jetzt auch am echten Handy zum Löschen aus – Android brach die Geste bisher ab (Text-Auswahl), jetzt zählt auch Androids eigenes „lange gedrückt“; kein Markieren von Text mehr dabei
- Android-App, Match, Morsezeichen: Das CW-Signal wird jetzt bei jeder Karte sicher abgespielt – am Handy blieb es teils stumm, weil der Ton erst nach einem Tipp freigegeben wird (jetzt schon beim Tipp auf das Thema). Liegt das Swipe-Tutorial darüber, kommt der Ton, sobald es geschlossen ist. Der Knopf darunter heißt „Erneut abspielen“
- Android-App, Stil Verspielt: Während Match oder das Funk-Logbuch offen ist, kommt Funki nicht mehr auf die Startseite darunter – man hörte ihn sprechen, sah ihn aber nicht. Die ISS fliegt weiter durch
- Android-App: Die Zurück-Taste des Handys beendet jetzt den Rundgang („Willkommen im Amateurfunk-Trainer – Schritt 1 von 12“). Bisher ging sie an ihm vorbei.
- Android-App: Auf schmalen Handys (360 Punkte und weniger) stand oben „Amateurfunk-Tr…“ – die Schrift des Titels wird dort etwas kleiner, der Name steht wieder ganz da.
- Android-App, Stil Verspielt: ISS, OSCAR-Satellit und Astronaut kamen bisher nur auf der Startseite – wer stundenlang in Runden übte (allein oder in der Gruppenrunde), sah sie nie. Jetzt kommen sie auch mitten im Üben, aber nur in ruhigen Momenten: gerade nachdem eine Frage beantwortet wurde (nach gut 2 Sekunden), beim Blättern erst wenn eine Frage schon etwa 7 Sekunden steht. Nie in der Prüfung (Simulator), nie beim Vorlesen, nie über einem offenen Fenster, nie am Beamer, nie bei „Animationen entfernen“ und nicht bei ISS-Überflug „Aus“. Der Astronaut steht mitten im Üben weiter unten am Rand, damit die Frage lesbar bleibt, und ist beim Antippen von Weiter oder einer Antwort sofort weg. Die Höchstzahl je Start („Normal“: 3) gilt jetzt je Stunde, damit lange Übungsabende nicht nach dem dritten Mal still bleiben. Handy-Browser und PC unverändert.
- Blättern: „Ja, weitermachen“ startete nur ab dem Lesezeichen – die Runde hieß dann „Frage 1 von 382“, und alles davor, auch die schon abgehakten Fragen, fehlte im Verlauf (viele Punkte waren deshalb nicht grün). Jetzt läuft die Runde immer über den ganzen Katalog und beginnt beim Lesezeichen („Frage 190 von 571“); im Verlauf stehen alle 571 Punkte, die gelernten grün. Gilt auch für „Ganzer Katalog“ im Auswahlfenster. Die Runden „Nur Gelernte“, „Rest abarbeiten“ und „Noch nie geübt“ bleiben absichtlich bei ihrer Teilmenge.
- Android-App, Hell-Modus: Im Blättern-Fenster (Auswahl und „Beim letzten Stand weitermachen?“) waren die Knöpfe unten leer – weiße Schrift auf weißem Grund, weil die allgemeine Knopf-Regel die Hell-Farbe überstimmte. Die Schrift ist jetzt dunkel (Stand löschen rot); im Dunkel-Modus und am PC unverändert.
- Android-App, Lektion: Die Leiste „Lektion beenden / 0 von 1 fertig“ lag unten über Zurück, Weiter und den Hilfen und verdeckte sie – sie steht jetzt als schmale Zeile unter der Kopfzeile („Frage 1 von 44“), die Frage rückt um ihre Höhe nach unten; auf schmalen Handys weicht der Lektionsname, damit Zähler und Knopf nebeneinander passen. Im Handy-Browser bekommt die Seite unten so viel Platz, dass Weiter und Hauptmenü über der Leiste erreichbar bleiben
- Vorlesen: Der Haken „Antwort mit Sprachausgabe bestätigen“ (Einstellungen → Nachteilsausgleich → Fragen und Antworten) wurde zwar gespeichert, aber nie ausgewertet – „Das war die richtige Antwort“ und „Das war leider die falsche Antwort“ kamen immer. Jetzt schweigt der Trainer, wenn der Haken fehlt. Die Vorgabe bleibt An; auch ohne gespeicherten Eintrag steht der Haken nun auf An (vorher stand er auf Aus, obwohl gesprochen wurde). Im Prüfungssimulator wird die Antwort weiterhin nie angesagt
- Gruppenraum: Wer über den Einladungslink kam und seinen Namen im Willkommensfenster eintippte, hieß im Raum trotzdem „Benutzer 1“ – der Beitritt kommt eine halbe Sekunde nach dem Laden, der Name erst danach, und der Raum hat ihn nie erfahren. Neu: ein Name wird nachgemeldet (neues Ereignis „nameAendern“ im Server; Namen werden gekürzt und von Steuerzeichen und Spitzklammern befreit), Rangliste, Teilnehmerliste und Chat zeigen ihn sofort
- Gruppenraum: Die Gesamt-Auswertung war eine Momentaufnahme. Bleibt das Fenster offen, während andere noch spielen, erneuert es sich jetzt bei jeder Änderung im Raum von selbst (nur wenn sich wirklich etwas ändert, die Rollstelle bleibt, der Jubel läuft nicht doppelt) – wer noch „läuft“, wird beim Fertigwerden zu „Bestanden“ oder „Nicht bestanden“, ohne dass man das Fenster schließen und neu öffnen muss
- „Neue Runde?“ im Gruppenraum: Im Block „Unterricht“ ragten die Auswahllisten (Lektion, Tempo) rechts über den Rand des Kastens und des Fensters hinaus. Sie bleiben jetzt im Kasten und stehen auf schmalen Bildschirmen (bis 480 Punkte) untereinander in voller Breite; geprüft bei 320, 360 und 411 Punkten, hell und dunkel, in Sachlich und Verspielt und am Rechner
- Die kurze Meldung unten rechts („Du bist als … im Gruppenraum“ und ähnliche) blieb nach dem Ausblenden unsichtbar liegen und fing Fingertipps ab – zum Beispiel auf „Senden“ im Chat. Sie lässt Tipps jetzt durch
- Android-App, Blatt „Neue Runde“: Wer dort „10 Fragen“ (oder einen Teil) wählte und nicht innerhalb von anderthalb Sekunden startete, bekam die alte Einstellung – die Startseite holte sich im Takt die Werte von der Seite zurück; die Wahl im Blatt bleibt jetzt stehen, bis die Runde startet
- Android-App, N → E und E → A: „Betrieb“ oder „Vorschriften“ im Blatt „Neue Runde“ führte zu „Keine Fragen für diesen Filter gefunden“ – die beiden gibt es bei einer Aufstockung nicht und stehen nicht mehr zur Wahl
- Android-App, Dunkel: In den Einstellungen sah man nicht, was gewählt ist (Hell/Dunkel/Wie Handy, Tagesziel, Funki An/Aus, Stil, Form) – der gewählte Knopf leuchtet jetzt in der Stilfarbe und trägt einen Haken; der Hinweis „Es spricht die Stimme deines Handys“ war hell auf hell; die Modellwahl beim Lerncoach ragte über den Rand
- Android-App: Beim Vorlesen verschwindet Funki sofort, statt eine Frage zu verdecken, und kommt erst danach wieder; sein Lob für fünf richtige am Stück wartet, bis die Ansage fertig ist
- Android-App: Nach dem zweiten Öffnen las das Handy nicht mehr vor (erst ein Neustart des Handys half, zum Beispiel mit Acapela) – die App hält jetzt eine Verbindung zur Stimme, solange sie läuft, verbindet bei Bedarf neu und versucht es dann ein zweites Mal; unter dem Hinweis steht eine kleine Technik-Zeile (braucht die neue App-Version)
- Android-App: Las das Handy nicht vor, riet der Hinweis zu Piper – das gibt es nur am PC. Jetzt steht dort, was am Handy zu prüfen ist (Sprachausgabe-Modul, deutsche Stimme, Trainer neu öffnen)
- Android-App: Die Seite ließ sich mit dem Finger nicht scrollen (auch nicht im langen Bildschirmfoto), und in einer Runde saßen Zurück/Weiter halb unter dem Bildschirmrand
- Chat im Dark Mode: eigene Blasen und Chatkopf in tiefem Blau statt grellem Signalblau, Haken deutlich sichtbar (gelesen in hellem Türkis)
- Kopfzeile bleibt auch mit offenem Gruppenraum einzeilig: reicht der Platz nicht, verlieren Knöpfe schrittweise ihre Beschriftung (Zeichen, Sprechblase und Zahlen bleiben)
- Gruppenraum: Wer den Raum erstellt hat, wird beim Wiederkommen wieder Host – auch nach geschlossenem Tab; bisher blieb die Vertretung Host
- Updater: holt nie mehr einen älteren Stand als den aktuellen bei GitHub (nach einem Hochladen zwischen Prüfung und Klick wurden hier neuere Dateien mit älteren überschrieben); prüft nach dem Aktualisieren und nach Hochladen.bat sofort neu, statt die Lage vom Start weiter zu zeigen; Dateien ohne Merkposten, die hier jünger sind als der GitHub-Stand, bleiben unangetastet
- Hochladen.bat merkt sich auch die Dateien in Unterordnern (docs, fontawesome …), damit der Updater sie nicht zurückdreht
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
- Prüfungssimulator: zwei Teile in der Grauzone gelten als nicht bestanden, Ansage nannte bei Technik N „undefined“
- Wer während des Countdowns zum Schließen dazukommt, sieht jetzt den Hinweisbalken
- Kopfzeile bleibt einzeilig, auch mit dem Facebook-Zeichen und der Besucherzahl am Server-Knopf
- Dark Mode: Die Detaillierte Auswertung nach der Prüfung zeigt die eigene und die richtige Antwort wieder rot und grün
- Beamer-Modus: Die Pfeiltaste nach rechts sprang zwei Fragen weiter (mit einem Presenter wurde jede zweite Frage übersprungen)
- Knopfleiste der Hauptansicht: Wird sie eng, bleiben die Knöpfe so hoch wie die Auswahlfelder links (vorher niedriger)

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
