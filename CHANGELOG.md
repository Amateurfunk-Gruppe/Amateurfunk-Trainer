# Änderungsprotokoll — Amateurfunk-Trainer

Entwickler und Urheber: Dietmar Reh. Lizenz: [PolyForm Noncommercial 1.0.0](LICENSE).

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), SemVer.
Die oberste Versionsnummer ist die des nächsten Baus: `version.js` liest sie von hier,
`Build-DIREKT.bat` übernimmt sie in EXE-Name, Dateieigenschaften und `package.json`.

---

## [1.253.0] - 2026-09-10

### Behoben
- **43 weitere Fragen bekommen ihren Formelblatt-Knopf.** Dietmar mit dem Bild
  zu VD721 („Anfangs- und Endfrequenz für das 23 cm Amateurfunkband"): „Hier
  VD721 fehlt die Formelsammlung. Gibt es davon noch mehr die fehlen?"

  Ja — und mein Suchmuster von 1.252.0 war schuld. Es suchte nach „maximal
  zulässige … Frequenzbereich" und fand deshalb genau die zwölf Fragen, die so
  formuliert sind. Die Serie **VD709 bis VD723** fragt aber „Welche Antwort
  enthält die richtige Anfangs- und Endfrequenz für das … Band?" — fünfzehn
  Fragen, eine je Band von 160 m bis 13 cm, und alle fielen durch. VD721 stand
  mittendrin.

  Diesmal ist das Blatt Seite für Seite durchgegangen worden, statt nach
  Wortmustern zu raten:

  | Fundstelle | + | Fragen |
  |---|---|---|
  | Seite 3 — Anlage 1, Absatz (3) | 2 | VD704, VD705 (Definition primärer/sekundärer Funkdienst, im Wortlaut) |
  | Seite 4 — Tabellarische Übersicht | 18 | **VD709–VD723** (Bandgrenzen), VD727, VD736, VD737 |
  | Seite 6 — Aufbau der Rufzeichen | 3 | VD201, VD202, VD203 |
  | Seite 7 — Rufzeichenreihen und Klasse | 3 | BD104, BD105, BD106 (DL1–DL9 = A, DN9 = N, DO1–DO9 = E) |
  | Seite 8 — Nr. 3, besondere Anlässe | 1 | VD204 (warum „DL250 BTHVN" zulässig ist) |
  | Seite 9 — Nr. 6, Peilsender | 1 | BD109 (MO, MOE, MOI, MOS, MOH, MO5) |
  | Seite 10 — Nr. 9–11, Rufzeichenzusätze | 12 | BD201–BD211, VD306 (/m /mm /am /p, /T, /R) |
  | Seite 17 — EIRP | 2 | VD725, VD726 |
  | Seite 19 — Wellenlänge und Frequenz | 1 | EG109 |

  **Fünf Seitentitel** wurden dabei präzisiert, weil die Seiten mehr tragen,
  als bisher dranstand — Seite 9 etwa nicht nur die Notfunk-Klubstationen,
  sondern auch die Kurzzeitzulassungen und die Peilsender-Kennungen.

  Aus 480 Zuordnungen sind über zwei Durchgänge **535** geworden. Damit hat in
  der Klasse N jede fünfte Frage einen Knopf, im Aufstieg E auf A jede zweite
  bis dritte:

  | Katalog | Fragen | mit Knopf |
  |---|---|---|
  | Klasse N | 571 | 114 (20 %) |
  | N auf E | 463 | 139 (30 %) |
  | E auf A | 716 | 282 (39 %) |
  | Klasse A | 1750 | 535 (31 %) |

  Nachgeprüft im Trainer: Bei VD721 erscheint der Knopf und öffnet auf „Blatt 2
  · Seite 4 im PDF".

---

## [1.252.0] - 2026-09-10

### Behoben
- **Zwölf Fragen hatten keinen Formelblatt-Knopf, obwohl die Antwort im Blatt
  steht.** Aufgefallen ist es an Dietmars Frage: „Wo finde ich das im
  Formelblatt?" zu VD742 — der Frage nach dem Frequenzbereich mit 2 MHz
  Bandbreite bzw. 7 MHz für amplitudenmodulierte Fernsehaussendungen. Die
  Antwort steht im Blatt, der Knopf erschien trotzdem nicht.

  Die Antwort braucht zwei Seiten: Auf **Seite 5** (B Zusätzliche
  Nutzungsbestimmungen) sagt **Nummer 7** genau diese beiden Werte; auf
  **Seite 4** trägt dann Zeile 18 — 430–440 MHz — diese 7 in der letzten
  Spalte. Die Falle ist Nummer 8 direkt darunter: fast derselbe Wortlaut, aber
  „amplitudenmoduliert *oder digital* 7 MHz und frequenzmoduliert 18 MHz", und
  die gehört zu 1240–1300 MHz.

  Zugeordnet wurden:

  | Fundstelle | Fragen |
  |---|---|
  | Seite 4 — Tabellarische Übersicht | VD706, VD724, VD728, VD730, VD731, VD732, VD743 |
  | Seite 5 — Zusätzliche Nutzungsbestimmungen | VD738, VD739, VD740, VD741, VD742 |

- **Sieben 70-cm-Fragen zeigten auf den 2-m-Bandplan.** Beim Nachsehen fiel
  auf, dass die beiden Bandplan-Stellen falsch benannt waren: Die Stelle hieß
  „IARU-Bandplan (Kurzwelle)" und zeigte auf Seite 11 — dort steht aber der
  **2-m-Plan**, und auf Seite 12 der **70-cm-Plan**. Einen Kurzwellen-Bandplan
  gibt es im Blatt gar nicht.

  Alle 19 Bandplan-Fragen hingen an dieser einen Stelle. Wer bei BC206 („Welche
  Frequenz empfiehlt der IARU Bandplan für einen allgemeinen Anruf mit analoger
  FM-Telefonie im 70 cm-Band?") nachschlug, landete im 2-m-Plan und fand die
  433,500 MHz dort nicht. Betroffen: BC206, BC208, BC212, BC219, BC220, BC221,
  BC222 — sie zeigen jetzt auf Seite 12.

- **Acht Seitentitel stimmten nicht mit dem PDF überein.** Sie sind Seite für
  Seite am Original abgelesen und richtiggestellt:

  | Stelle | bisher | jetzt |
  |---|---|---|
  | Seite 4 | Frequenzbereiche und Sendeleistung 1 | A Tabellarische Übersicht — Frequenzbereiche und Leistung |
  | Seite 5 | Frequenzbereiche und Sendeleistung 2 | B Zusätzliche Nutzungsbestimmungen (Nr. 1–17) |
  | Seite 6 | Frequenzbereiche und Sendeleistung 3 | Rufzeichenplan (Amtsblatt-Verfügung 61/2024) |
  | Seite 7 | Zusätzliche Nutzungsbestimmungen 1 | Rufzeichen mit 2- oder 3-buchstabigen Suffixen |
  | Seite 8 | Zusätzliche Nutzungsbestimmungen 2 | Rufzeichen mit 1-buchstabigen Suffixen (Klubstationen) |
  | Seite 9 | Zusätzliche Nutzungsbestimmungen 3 | Klubstationsrufzeichen für Not- und Katastrophenschutz |
  | Seite 10 | Zusätzliche Nutzungsbestimmungen 4 | International gebräuchliche Rufzeichenzusätze |
  | Seite 3 | Nutzungsbestimmungen (Anlage 1) | Anlage 1: Nutzungsbedingungen (P/S, PEP, ERP) |

  Aufgefallen war es bisher nicht, weil auf die Seiten 6 bis 10 keine einzige
  Frage zeigte — der falsche Titel stand nur in der Datei, nie auf dem Schirm.

  Geändert wurde ausschließlich `formelhilfe.json`: 480 Zuordnungen sind 492
  geworden, keine ging verloren, und kein Verweis zeigt ins Leere. Nachgeprüft
  im Trainer: Bei VD742 erscheint der Knopf, das Fenster öffnet auf „Blatt 3 ·
  Seite 5 im PDF".

---

## [1.251.0] - 2026-09-10

### Geändert
- **Die Formelsammlung verdeckt die Frage nicht mehr.** Dietmar: „Bei der
  Formelsammlung den Hintergrund in Blure zu halten ist nicht gut. Hier wäre es
  auch schön, wenn man das Formelblatt verschieben kann. Beim nächsten mal
  öffen, ist es wieder Zentriert."

  Drei Sätze, ein Gedanke: Man schlägt im Blatt nach, **weil** man die Frage
  beantworten will — und muss sie dabei lesen können. Bisher lagen 72 Prozent
  Abdunklung und sechs Punkte Unschärfe darüber; von der Frage blieben graue
  Schemen.

  Jetzt liegt nur noch ein Hauch darüber (14 Prozent), gerade genug, damit das
  Fenster als eigene Ebene zu erkennen ist. Die Abgrenzung übernimmt der
  Schatten.

  **Und das Blatt lässt sich am Kopf beiseite ziehen** — genau wie der Rechner.
  Wo es steht, wird bewusst **nicht** gemerkt: Beim nächsten Aufschlagen liegt
  es wieder in der Mitte, so wie Dietmar es beschrieben hat. Das ist der
  Unterschied zum Rechner, den man einmal an seine Ecke stellt und dort stehen
  lässt; das Blatt schiebt man nur kurz zur Seite, um etwas nachzusehen.

  Verschoben wird über `transform` und nicht über `left`/`top`: Der Kasten
  sitzt in einem Flex-Kasten, der ihn mittig hält — wer `left` setzt, kämpft
  gegen diese Zentrierung an. Ein leeres `transform` bringt ihn genau in die
  Mitte zurück, und das ist auch der ganze Trick beim Zurücksetzen. Gerechnet
  wird durch den Anzeigefaktor, sonst liefe das Fenster bei 90 Prozent Anzeige
  langsamer als der Zeiger.

  Die Grenzen sorgen dafür, dass der Kopf immer greifbar bleibt: Man kann das
  Blatt fast ganz aus dem Bild schieben, aber nie so weit, dass man es nicht
  mehr zurückholen kann. Ein Klick daneben schließt es weiterhin, ein Klick auf
  den Kopf nicht.

---

## [1.250.0] - 2026-09-10

### Geändert
- **Vorlesen zählt bei der Zeitauswertung mit.** Dietmar: „Vorlesen lassen,
  gehört auch dazu zum Auswerten der Zeit bei den Fragen."

  Derselbe Gedanke wie beim Formelblatt am selben Tag, und wieder trifft er
  einen Denkfehler. Wer sich eine Frage samt vier Antworten vorlesen lässt,
  sitzt zwanzig bis vierzig Sekunden davor, bevor er überhaupt anfangen kann zu
  entscheiden. Der Trainer hat diese Sekunden bisher wie Nachdenken gezählt —
  und die Frage danach unter „richtig, aber langsam" gemeldet. Das ist doppelt
  falsch: Es stimmt nicht, und es hält ausgerechnet denen etwas vor, die das
  Vorlesen brauchen. Für sie ist es Nachteilsausgleich und in der Prüfung
  ausdrücklich vorgesehen.

  **Die Vorlesezeit wird jetzt gestoppt und abgezogen.** Gemessen wird die
  tatsächliche Dauer, nicht die Länge des Textes: Wer mittendrin auf Stop
  drückt, bekommt auch nur die gehörten Sekunden abgezogen. Nachgerechnet an
  einem Beispiel: 30 Sekunden an der Frage, davon 22 Sekunden Vorlesen → **8
  Sekunden** gehen in die Auswertung. Ohne Vorlesen bleiben 12 Sekunden 12
  Sekunden.

  **Und das Vorlesen wird als Hilfsmittel vermerkt** — wie Formelblatt und
  Rechner seit 1.241.0. Bleibt eine Frage trotz Abzug auffällig, steht sie
  nicht mehr unter „langsam", sondern unter den Zeilen, die eine gute
  Gewohnheit benennen. Die Marke sagt dabei, was zutraf: „vorgelesen",
  „nachgeschlagen" oder „mit Hilfsmittel", und der Text nennt nur die Mittel,
  die auch benutzt wurden.

  Ein fehlgeschlagener Vorlesevorgang zählt nicht mit. Ist keine Stimme
  eingerichtet, ist der ganze Vorgang nach einem Sekundenbruchteil vorbei —
  gemessen 111 Millisekunden. Erst ab anderthalb Sekunden gilt es als
  vorgelesen; die Zeit selbst wird trotzdem abgezogen, sie fällt bei so kurzen
  Vorgängen ohnehin nicht ins Gewicht.

  **Die Übungszeit bleibt unberührt.** In der Auswertung (diese Woche,
  insgesamt) zählt weiter jede Minute am Trainer — Zuhören ist Üben. Abgezogen
  wird nur dort, wo eine Zeit *bewertet* wird.

---

## [1.249.0] - 2026-09-10

### Geändert
- **Das Bild zur Frage steht jetzt im Kasten der Frage.** Dietmar mit einem
  Video: „Das das Fragebild oben so im leeren steht, sieht nicht schön aus.
  Schöner wäre erst die Frage und darunter das Bild in dem grauen Rahmen mit
  drin gefasst."

  Er hat recht, und so war es nie gedacht: Das Bild stand seit jeher **vor**
  dem Kasten mit Fragenummer und Text — ein Kästchen allein im Weißen, weit weg
  von dem Satz, zu dem es gehört. Bei Fragen ohne Antwortbilder fiel das kaum
  auf, weil gleich darunter die Antworten kamen. Seit 1.248.0 die 18 Fragen mit
  **beiden** Bildern ihr Fragebild zurückbekommen haben, stand es dort oben
  ganz allein.

  Jetzt steht es im selben grauen Rahmen wie die Frage und unter ihrem Text —
  in der Reihenfolge, in der man es liest: erst die Frage, dann das Bild dazu.
  Genau so steht es auch auf dem Blatt der Bundesnetzagentur. Das gilt für alle
  Fragen mit Bild, nicht nur die 18: Bei BE204 („…zeigt den dargestellten
  Zeigerausschlag") steht das Instrument jetzt unter dem Satz statt darüber.

- **Die Lupe vergrößert moderater.** Dietmar: „Ich habe den Nachteilsausgleich
  komplett aus und die Vergrößerung ist extrem."

  Das ist die andere Seite des Fehlers von 1.247.0. Dort war das Ziel zu klein
  geworden, weil die Bilder gewachsen waren; der Zielfaktor von 2,2 hat es
  überkorrigiert. Auf seinem Bild deckte das vergrößerte Antwortbild fast das
  ganze Fenster zu — Frage und die Antworten A und B verschwanden darunter, und
  man verliert den Zusammenhang, in dem das Bild steht.

  Der Faktor ist jetzt 1,6, der Anteil am Fenster von 76 auf 62 Prozent
  gesenkt. Ein Antwortbild wächst damit von 419 auf 670 Punkte statt auf 922 —
  deutlich besser zu sehen, aber Frage und Nachbarbilder bleiben stehen. Für
  die kleinen Bilder zur Frage ändert sich nichts: Bei ihnen greift die feste
  Zielzahl, sie werden weiter gut dreifach vergrößert. Wer mehr braucht, hat
  den Nachteilsausgleich.

### Anmerkung
- Auf einem sehr hohen Schirm (1920×1080, Anzeige 120 %) bleiben die
  Antwortbilder bei diesen Fragen klein. Nachgemessen: Die Seite ist dort schon
  bei kleinsten Bildern randvoll (genau 1080 Punkte), jede Vergrößerung bringt
  sofort einen Rollbalken. Die Ursache ist die Mindesthöhe der Karte bei
  vergrößerter Anzeige — sie nimmt das ganze Fenster ein, obwohl darunter noch
  Knopfleiste und Fußzeile kommen. Das ist eine eigene Baustelle und steht auf
  der Liste; hier wurde bewusst der ruhige Zustand ohne Rollbalken gewählt.

---

## [1.248.0] - 2026-09-10

### Behoben
- **Das Bild zur Frage fehlte bei 18 Fragen.** Dietmar mit der Katalogseite zu
  AB406 und AB407: „Bei der Frage AB406 kommt in der Frage ein Bild vor. Das
  fehlt und auch bei vielen anderen Fragen bei E nach A." Seine Fundliste:
  AB405, AB406, AB407, AC405, AC406.

  Im Code stand `if (!hasImages)` — das Bild zur Frage wurde also unterdrückt,
  sobald die Antworten Bilder hatten. Gemeint war damit, dieselbe Zeichnung
  nicht zweimal zu zeigen; getroffen hat es aber auch alle Fälle, in denen
  Frage und Antworten **verschiedene** Bilder haben.

  Und dann fehlt nicht Beiwerk, sondern die Frage selbst: Bei AB406 steht dort
  das Frequenzspektrum, zu dem das passende Signal gesucht wird. Ohne dieses
  Bild sieht man vier Kurven und hat keinen Anhaltspunkt — die Frage ist nicht
  zu beantworten.

  Alle sechs Kataloge durchgezählt:

  | Katalog | betroffene Fragen |
  |---|---|
  | Klasse N | 3 — NE206, NE207, NE208 |
  | N auf E | 1 — ED304 |
  | **E auf A** | **14** — AB404–AB407, AC405, AC406, AD308, AD406, AD408, AD502, AF626–AF629 |
  | Klasse E | 4 |
  | Klasse A | 18 |
  | N auf A | 15 |

  **18 verschiedene Fragen insgesamt**, Dietmars fünf sind darunter.

  Sechs weitere Fragen sehen ähnlich aus, sind aber etwas anderes: Bei NB401,
  NB702, NB703, NC404, NI103 und NI104 gibt es kein eigenes `<ID>_q.svg`, und
  die Datei `<ID>.svg` ist zugleich eines der Antwortbilder. Dort gibt es also
  gar kein Bild zur Frage — was so aussah, war in Wahrheit die Antwort A. Bei
  ihnen muss es beim einen Bild bleiben, und das tut es auch: Die Suche nach
  dem Fragebild bekommt jetzt die Namen der Antwortbilder mit und streicht sie
  aus ihrer Reihenfolge. Eine Prüfung nur des ersten Namens hätte diese Fälle
  nicht erwischt — dort existiert `_q.svg` nicht, und der Rückfall wäre genau
  auf das Antwortbild gelandet.

- **Der Platz reicht jetzt für beide Bilder.** Als das Bild zur Frage wieder
  erschien, war die Knopfleiste bei AB407 weg: Die Bildrechnung war schon
  gelaufen, bevor das neue Bild seinen Platz einnahm. Sie wartet jetzt auch auf
  dieses Bild.

  Dabei kam ein zweiter, älterer Fehler ans Licht. Die Bremse maß nur, ob die
  Knopfleiste noch im Fenster steht — bei AB407 endete sie auf **exakt** der
  Fensterkante, was formal genügte, während die Seite 1023 statt 930 Punkte
  hoch war. Unter der Leiste steht nämlich noch die Fußzeile, und die zählte
  niemand mit.

  Jetzt zählt beides, aber nicht blind. Nachgemessen, Bildhöhe Schritt für
  Schritt durchprobiert:

  | Fenster | bei 90 px | bei 150 px |
  |---|---|---|
  | 1440×930 | Seite 930 (passt) | Seite 930 (passt) |
  | 1920×1080 | Seite 1099 (**+19**) | Seite 1243 |

  Zwei verschiedene Lagen. Auf 1440×930 gibt es eine Bildhöhe, bei der die
  Seite genau passt — dort ist der Überlauf das richtige Maß. Auf 1920×1080
  läuft die Seite schon bei kleinsten Bildern über; das kommt von der
  Mindesthöhe der Karte bei vergrößerter Anzeige und hat mit den Bildern nichts
  zu tun. Wer dort trotzdem auf null Überlauf hinregelt, drückt die Bilder auf
  das Minimum und behebt nichts — gemessen fielen sie von 224 auf 108 Punkte.
  Dort zählt allein, was Dietmar ursprünglich beanstandet hatte: dass die
  Knopfleiste ohne Scrollen erreichbar bleibt.

  Ergebnis bei AB406 mit Bild zur Frage, Knopfleiste überall sichtbar:

  | Fenster | Bildhöhe | Knopfleiste |
  |---|---|---|
  | 1440×930 | 135 px | 837 von 930 |
  | 1920×1080 | 139 px | 1035 von 1080 |
  | 1280×720 | 102 px | 709 von 720 |
  | 1440×660 | 88 px | 651 von 660 |

  Stehen beide Bilder da, bekommt das Bild zur Frage eine engere Höhengrenze
  als allein: Man sieht es einmal an, verglichen werden müssen die vier
  Antworten. Wer es größer braucht, fährt mit der Maus darüber — die Lupe von
  1.247.0 zeigt es groß.

---

## [1.247.0] - 2026-09-10

### Behoben
- **Die Lupe vergrößert wieder von selbst.** Dietmar: „Mit dem Vergrössern der
  Bilder stimmt was nicht bei e auf A AB406. Ich muss den Nachteilsausgleich
  auf Maximum setzen, das sie schön vergrössern."

  Das ist eine Folge der eigenen Verbesserung von 1.243.0 — eine Änderung, die
  eine andere Stelle veralten ließ. Als die Zielgröße der Lupe festgelegt
  wurde, waren die Antwortbilder 156 Punkte breit; 400 Punkte Ziel bedeuteten
  damals Faktor 2,5. Seit die Bilder ihren Kasten ausfüllen, sind sie 419 bis
  559 Punkte breit — das Ziel lag also **unter** der Ausgangsgröße.

  Nachgemessen bei AB406, ohne Nachteilsausgleich:

  | Fenster | Bild im Raster | Faktor | Ergebnis |
  |---|---|---|---|
  | 1440×930 | 419×138 | 0,96 | Lupe bleibt aus |
  | 1920×1080 | 559×224 | 0,72 | Lupe bleibt aus |
  | 1280×720 | 372×109 | 1,08 | Lupe bleibt aus |

  Unter 1,15 unterbleibt die Vergrößerung — das ist richtig so, ein Bild um
  vier Prozent aufzublasen wäre nur Unruhe. Falsch war das Ziel. Wer den
  Nachteilsausgleich hochdreht, multipliziert es und kommt darüber: genau der
  Umweg, den Dietmar beschreibt.

  Zwei Änderungen:

  **Das Ziel wächst mit dem Bild mit.** Es ist jetzt der größere Wert aus der
  festen Zahl und dem 2,2-fachen der heutigen Bildgröße. Damit kann diese
  Stelle nicht wieder veralten, wenn sich die Bilder im Raster ändern.

  **Breite und Höhe bekommen eigene Anteile am Fenster.** Bisher galt eine Zahl
  für beides. Ein Fenster ist aber breiter als hoch, und die Schaltbilder des
  Katalogs sind sehr flach (Seitenverhältnis 0,37) — bei ihnen war die Breite
  die Fessel, obwohl daneben reichlich Platz stand.

  Ergebnis, wieder ohne Nachteilsausgleich: auf allen drei Fenstern **Faktor
  2,2**. Auf 1440×930 wird aus dem Bild 419×138 eines von 938×320, mit 88
  Punkten Rand rechts und 298 unten. Für die Fragebilder ändert sich nichts:
  Sie sind weiter höchstens 260 Punkte hoch, dort greift die feste Zielzahl wie
  bisher, nachgerechnet vorher wie nachher Faktor 2,55. Nur bei einem
  ungewöhnlich großen Fragebild springt die Lupe künftig an, wo sie bisher
  ausblieb.

---

## [1.246.0] - 2026-09-10

### Behoben
- **Das Strecken beim Laden einer Frage ist weg — diesmal wirklich.** Dietmar
  hatte 1.245.0 geprüft und gemeldet: „Das strecken beim laden ist noch immer
  vorhanden." Und mit dem Video, das er dazu geschickt hat, war es in ein paar
  Minuten gefunden.

  Er hat die Ursache dann selbst benannt, bevor ich die Messung fertig hatte:
  „Hier fällt mir auf, das der Fortschritt das nach unten zieht und es über den
  Code erst nach dem laden wieder angepasst wird." Genau so ist es.

  Die Fortschrittsspalte zeigt jede Frage der Runde als Kästchen. Bei einer
  Runde über alle 716 Fragen des Katalogs E auf A sind das 103 Zeilen, rund
  1750 Pixel. Begrenzt hat sie bisher **nur** das Skript — und ein Skript läuft
  erst *nach* dem ersten Bildaufbau.

  Nachgemessen, Fenster 590 Pixel hoch:

  | Zeitpunkt | Seitenhöhe |
  |---|---|
  | 3189 ms | **2207 px** |
  | 3200 ms | 2176 px |
  | 3210 ms | 2134 px |
  | … 75 Bildaufbauten lang, je 32 px … | |
  | 4423 ms | 590 px |

  Über **1,2 Sekunden** kroch die Seite nach oben — man sieht sie
  zusammenschnurren. Und der Grund für das langsame Kriechen war ein zweiter
  Fehler, der schon einmal an anderer Stelle steckte: Spalte und Frage stehen
  nebeneinander in einem Flex-Kasten, in dem die kürzere auf die Höhe der
  längeren gezogen wird. Das Skript maß also an der Frage nicht deren Inhalt,
  sondern die zu große Höhe, die die Spalte selbst erzeugte. Der falsche Wert
  bestätigte sich bei jeder Messung neu; jeder Durchgang nahm der Spalte genau
  eine Kästchenzeile ab, der Beobachter löste den nächsten aus. Bei der rechten
  Verlaufsspalte steht die Warnung davor seit dem 05.09.2026 im Kommentar — an
  dieser Stelle stand sie nicht.

  Zwei Änderungen, beide nötig:

  **Die Obergrenze steht jetzt im Stilblatt.** Sie gilt schon beim allerersten
  Bildaufbau, ohne dass eine Zeile JavaScript gelaufen sein muss. Wie viel von
  der Fensterhöhe abzuziehen ist, wurde gemessen statt geschätzt — der Rest für
  Kopfzeile, Knopfleiste und Fußzeile war auf allen vier geprüften Fenstern
  derselbe (260 bis 261 Punkte), weil sich die Anzeigegröße herausrechnet.
  Abgezogen werden 320 Punkte, also knapp sechzig mehr: Ist die Grenze etwas zu
  klein, ist die Spalte für einen Sechzigstelmoment kürzer als möglich und das
  Skript zieht sie sofort nach — das sieht niemand, weil eine kürzere Spalte
  die Seite nicht länger macht. Wäre sie zu groß, wäre die Seite genau um diese
  Punkte zu lang, und das sieht man sofort.

  **Das Skript misst richtig.** Für den Moment der Messung werden die gesetzten
  Höhen weggenommen; dann streckt die Spalte nichts mehr und die Frage fällt
  auf ihre eigene Höhe zurück. Gezeichnet wird dazwischen nichts — aus 75
  Schritten wird einer.

  Nachgemessen auf vier Fenstergrößen mit einer Runde über alle 716 Fragen:

  | Fenster | vorher | jetzt |
  |---|---|---|
  | 1280×590 | 75 Bildaufbauten, bis +1617 px | **kein einziger** |
  | 1280×686 | dasselbe Bild | **kein einziger** |
  | 1440×930 | dasselbe Bild | **kein einziger** |
  | 1920×1080 | dasselbe Bild | **kein einziger** |

  Die Spalte hat am Ende exakt die Höhe der Frage daneben, rollt ihre Kästchen
  wie bisher intern, und die Knopfleiste steht in jedem Fall im Fenster.

---

## [1.245.0] - 2026-09-10

### Behoben
- **Die Seite streckt sich beim Aufbauen nicht mehr nach unten.** Dietmar:
  „Beim aufbauen einer Seite (das hatten wir auch schon davor) streckt sich
  die Seite erst mal tief nach unten. Dieses Strecken, gefällt mir gar nicht.
  Der Trainer soll eine Seite so laden, das man das strecken nicht mehr sieht."

  Nachgemessen, Bild für Bild, bei AB406 auf 1440×930:

  | Zeit | Karte | Rollbalken | Bildhöhe |
  |------|-------|-----------|----------|
  | 3112 ms | 710 px | nein | (die Frage steht noch nicht) |
  | 3153 ms | **944 px** | **ja** | **230 px** |
  | 3159 ms | 901 px | nein | 120 px |

  Ein einziger Bildaufbau mit falscher Größe — das ist das Strecken. Die
  Ursache stand in derselben Zeile: Zu diesem Zeitpunkt waren die SVG-Dateien
  noch nicht geladen. Der Trainer hat mit einem **geschätzten**
  Seitenverhältnis von 0,55 gerechnet; die vier Signalbilder haben aber 0,366.
  Aus 419 Pixeln Kastenbreite wurden so 230 statt 153 Pixel Höhe, die Karte
  wuchs über den Schirm hinaus, der Rollbalken erschien — und eine
  Sechzigstelsekunde später nahm die Bremse alles wieder zurück.

  Ein geschätztes Seitenverhältnis ist also keine Näherung, sondern eine
  Fehlerquelle mit sichtbarer Folge. Jetzt wird gar nicht gerechnet, solange
  ein Bild fehlt: Die Kästen bleiben bei ihrer Grundhöhe — klein, aber
  richtig —, und sobald die Bilder da sind, steht die Größe. Die Seite wird
  damit einmal größer und nie wieder kleiner.

  Nachgemessen über 25 Fragen je Fenstergröße auf 1280×720, 1440×930 und
  1920×1080: **keine einzige Ansicht wird zwischendurch höher als am Ende.**

- **Bildantworten nutzen den Platz jetzt wirklich.** Dietmar: „Jetzt haben wir
  wieder den Anfangszustand mit den Bilder."

  Er hatte recht, und die Rechnung von 1.243.1 war schuld. Sie addierte den
  Abstand zwischen Knopfleiste und Fensterkante (93 Pixel) und übersah dabei
  einen Posten, den sie gar nicht kannte: Die Karte ist während einer Runde
  auf Schirmhöhe gedehnt, und ihr Inhalt war **218 Pixel niedriger als das**.
  Genau diese 218 Pixel sind Platz, den die Bilder haben dürfen, ohne dass
  sich irgendetwas bewegt. Nachweisbar an einer einzigen Zahl: Die Knopfleiste
  stand vor *und* nach dem Vergrößern bei 837 — sie hatte sich nicht um einen
  Pixel bewegt.

  Ein Posten mehr in der Formel hätte diesen einen Fall behoben und wäre beim
  nächsten Umbau wieder falsch gewesen. Deshalb rechnet der Trainer jetzt
  umgekehrt und ohne Formel: Erst wird die Höhe gesetzt, bei der das Bild
  seine Kastenbreite gerade ausfüllt (größer wäre sinnlos — dann bliebe
  seitlich Luft). Dann wird nachgesehen, ob die Knopfleiste noch im Fenster
  steht. Steht sie, ist es fertig; steht sie nicht, geht es so weit zurück,
  bis sie es tut. Gemessen wird damit nur noch, was man auch sieht.

  | Fenster | vorher | jetzt |
  |---------|--------|-------|
  | 1440×930 | 120 px | **153 px** (Bild füllt die Breite) |
  | 1920×1080 | 163 px | **188 px** |
  | 1440×660 | 90 px | **127 px** |
  | 1280×720 | 90 px | **136 px** |
  | 1024×640 | 90 px | 90 px (dort passt die Knopfleiste schon ohne Bilder nicht) |

### Hinzugefügt
- **Der Trainer merkt sich die Seitenverhältnisse der Bilder.** Auch nachdem
  das Überschießen behoben war, blieb ein Rest: Beim *ersten* Anzeigen einer
  Bildfrage stehen die Kästen kurz auf ihrer Grundhöhe und wachsen dann.
  Verhindern lässt sich das nur, wenn die Höhe schon feststeht, bevor die
  Datei da ist — und dafür braucht es das Seitenverhältnis im Voraus.

  Geraten wird es nicht mehr; genau das Raten war ja die Ursache des Fehlers
  oben. Stattdessen hinterlässt jede Datei, die einmal geladen war, ihr
  Verhältnis unter ihrem Namen. Beim zweiten Mal — und der Trainer zeigt
  dieselben Fragen oft wieder — steht die Höhe sofort. Der Vorrat überlebt
  auch den nächsten Start.

  Nachgemessen, dieselbe Frage zweimal geöffnet: Beim zweiten Mal erscheint
  sie **ohne jeden Zwischenschritt** in ihrer endgültigen Größe.

- **Die Bilder der nächsten Frage werden im Hintergrund geholt.** Während eine
  Frage auf dem Schirm steht, tut sich nichts — genug Zeit, die Dateien der
  nächsten schon zu laden. Beim Weiterklicken steht die Höhe dann im selben
  Augenblick fest, in dem die Frage erscheint. Es kostet nichts: Die Dateien
  liegen im eigenen Ordner und wären ohnehin geladen worden, nur eben eine
  Sekunde später und dann sichtbar.

---

## [1.244.0] - 2026-09-10

### Geändert
- **Beim Vorlesen fällt das Wort „Bild" weg.** Dietmar: „Beim vorlesen sagt es:
  Antwort A Bild. Bild gehört da raus."

  Er hat recht — das Wort beschreibt nichts, es füllt nur die Stelle, an der
  bei einer Textantwort etwas Sinnvolles stünde. Wer nicht sieht, dem hilft es
  nicht; wer sieht, weiß es ohnehin. Jetzt heißt es schlicht „Antwort A."
  Dasselbe gilt für die Beschriftung, die Vorleseprogramme auslesen.

- **Bildantworten bekommen eine Pause.** „…und es soll etwas langsamer
  Vorlesen. Das geht derzeit noch sehr schnell bei Bildern."

  Der eigentliche Punkt daran: Bei Textantworten bestimmt die Länge des Satzes
  die Zeit zum Mitdenken. Bei vier Bildern sagt der Trainer viermal zwei Silben
  und ist nach fünf Sekunden fertig — genau dann, wenn man am meisten Zeit
  braucht, weil man vier Kurven vergleichen muss.

  Deshalb **2,6 Sekunden Pause nach jeder Bildantwort**, in denen die Antwort
  hervorgehoben stehen bleibt. Nicht langsamer sprechen — dabei klänge die
  Stimme betrunken —, sondern schweigen und zeigen.

### Behoben
- **Die Bilder waren zu groß, die Knopfleiste nur noch durch Rollen
  erreichbar.** Dietmar: „Tut mir Leid, es passt noch immer nicht."

  Die Ursache lag nicht in der Rechnung, sondern im Zeitpunkt: Beim ersten
  Durchgang sind die SVG-Dateien oft noch nicht geladen. `naturalWidth` ist
  dann 0, das Seitenverhältnis wird geschätzt — und die Rechnung entsprechend
  daneben. Jetzt wird nach dem Laden jedes Bildes nachgerechnet.

  Gemessen an AB406 (E → A), Knopfleiste in **allen vier** geprüften Größen
  sichtbar: 1440 × 930 → Leiste bei 837, 1440 × 660 → 581, 1920 × 1080 → 1011,
  1280 × 720 → 637. Die Bilder bleiben dabei deutlich größer als vorher
  (83 → 108 bis 194 Pixel).

  Zwei Sonderfälle wurden dabei verworfen und stehen als Warnung im Code:
  „wenn die Leiste ohnehin nicht passt, regle nach der Container-Lücke" ergab
  riesige Bilder **und** Rollbalken; „dann gar nicht vergrößern" scheiterte an
  drei Pixeln Messunterschied. Es bleibt bei einer Regel ohne Ausnahme: Es
  wird nach der Knopfleiste geregelt, Untergrenze ist die Ausgangsgröße.

- **In der Auswertung fehlte die linke Seite.** Dietmar mit einem Bild aus dem
  Katalog E → A: „Unter Statistik, fehlt die linke Seite komplett."

  Sie fehlte nicht, sie war leer — und das ist richtig so: Die Prüfungsreife
  hält sich zurück, solange kein Prüfungsteil genug Antworten hat. Im frisch
  geöffneten A-Katalog stehen 0 von 716, also schweigt sie. Falsch war nur,
  dass die Spalte trotzdem ihren halben Platz behielt: ein weißes Feld neben
  zusammengedrängtem Text. Steht links nichts, nimmt die rechte Seite jetzt
  die volle Breite.

## [1.243.1] - 2026-09-10

### Behoben
- **Die Bilder wurden zu groß — die Knopfleiste war nur noch durch Rollen
  erreichbar.** Dietmar zu 1.243.0: „Jetzt ist es zu gross. Die Leiste mit den
  Buttons sind nur über scrollen erreichbar."

  Er hat den Finger auf das gelegt, was wirklich zählt. Die Bremse verglich
  vorher mit dem Zustand *vor* der Vergrößerung — „nicht schlimmer als
  vorher". Das ist kein Kriterium, das jemand merkt. Gemerkt wird, ob man den
  Weiter-Knopf sieht. Genau danach entscheidet auch `fragenGroesseAnpassen()`
  über die Schriftstufe; dieselbe Regel gilt jetzt für die Bilder.

  Dazu mehr Reserve: 28 statt 14 Pixel Abstand zur Leiste und 90 statt 94
  Prozent der errechneten Höhe.

  Gemessen an AB406 (E → A) auf 1440 × 930: Bild **181 Pixel**, Knopfleiste
  endet bei 837 von 930 — sichtbar, **kein Rollen**. Ebenso auf 1440 × 660
  und 1280 × 720.

- **Die Bremse erkennt jetzt unerreichbare Ziele.** Gemessen auf 1920 × 1080
  bei einer Anzeigevergrößerung von 1,2: Die Knopfleiste endet 41 Pixel unter
  der Fensterkante — auch bei kleinsten Bildern, auch bei gar keinen. Ohne
  diese Prüfung drückte die Bremse die Bilder auf das Minimum, ohne irgendetwas
  zu erreichen: klein *und* rollen. Jetzt wird bei Minimalgröße nachgesehen,
  ob das Ziel überhaupt erreichbar ist; wenn nicht, regelt sie nach der Lücke
  im Container. Gerollt werden muss ohnehin — dann sollen wenigstens die
  Bilder etwas taugen.

### Anmerkung zur Ursache
Die Zeile `body.runde-laeuft .card { min-height: calc(100vh / var(--afu-zoom) - 2rem) }`
liefert bei einer Anzeigevergrößerung von 1,2 eine Karte, die höher ist als
das Fenster. Das trifft die Bildfragen am stärksten, gilt aber unabhängig von
ihnen. Nicht angefasst — das gehört getrennt angesehen.

## [1.243.0] - 2026-09-10

### Geändert
- **Bildantworten nutzen jetzt den Platz.** Dietmar mit einem Bild von AB406,
  auf dem unter den vier Signalbildern die halbe Fläche leer stand: „Kann man
  das so anpassen, das bei Bildern der Raum besser genutzt wird?"

  Gemessen an NB703 auf 1400 × 900 ohne Videokachel: Das Schaltbild wächst von
  **81 auf 159 Pixel** Höhe, die Kastenbreite wird von 156 auf **419 Pixel**
  ausgenutzt. Die Bilder skalieren mit dem freien Platz und schrumpfen wieder,
  wenn das Fenster kleiner wird.

  **Die Ursache war eine andere als vermutet.** Im Stilblatt stand
  `max-height: 100px` neben `width: auto` — das sieht nach einer Begrenzung
  aus, war aber keine. Die SVG-Dateien des Katalogs sind winzig deklariert
  (`NB703.svg` trägt `width="226.771"`) und haben **keine viewBox**. Ein
  `<img>` ohne vorgegebene Breite wird nie größer als seine natürliche Größe.
  Die 100 Pixel haben also nie etwas gedeckelt; das Bild war schlicht so
  klein, wie die Datei es sagt.

  Größere SVG-Dateien braucht es deshalb **nicht** — SVG ist Vektorgrafik,
  dasselbe Bild auf 419 Pixel gezogen ist gestochen scharf.

### Technik
Die Rechnung hat vier Anläufe gebraucht, und jeder Irrweg steht als Kommentar
im Code, damit ihn niemand wiederholt:

1. `window.innerHeight − scrollHeight` als Maß für den freien Platz taugt
   nicht: Die Karte trägt seit 1.224.0 eine `min-height` über den ganzen
   Schirm, damit die Knopfleiste nicht springt. Der „Überschuss" war in jeder
   Messung exakt null.
2. `object-fit: contain` allein bringt nichts — mit zu kleiner Höhe passt es
   den Inhalt ein und lässt seitlich Luft. Das Bild war 419 Pixel breit, die
   Zeichnung darin weiter 164.
3. Alle Nachfahren durchgehen und die tiefste Unterkante nehmen erwischt
   `main-layout` und die anderen gedehnten Kästen. Wieder null.
4. Den Ausgangszustand messen, während die Vergrößerung vom vorigen Aufruf
   noch im Stilblatt steht: Dann vergleicht die Bremse mit ihrem eigenen
   Ergebnis und findet alles in Ordnung.

Was jetzt gerechnet wird: die Lücke zwischen dem letzten Element, das wirklich
etwas anzeigt (über die Geschwisterkette gefunden), und dem Ende des
Fragencontainers — begrenzt durch die ideale Höhe, bei der das Bild die
Kastenbreite gerade ausfüllt. Grenzen 90 bis 300 Pixel, dazu 6 % Marge und
eine Bremse, die zurückregelt, falls die Seite weiter überstehen würde als
vorher.

### Aufgefallen, nicht behoben
- **Die `min-height` der Karte kann größer sein als das Fenster.** Gemessen
  bei NB703 auf 1400 × 900: **968 Pixel bei 900 Pixel Fensterhöhe** — die
  Seite rollt dort um 40 Pixel, ganz ohne Zutun der Bilder. Das ist ein
  eigener Fehler in der Rechnung von `updateVisibility()` und sollte getrennt
  angesehen werden.

## [1.242.0] - 2026-09-10

### Neu
- **Der Formelblatt-Knopf macht auf sich aufmerksam.** Dietmar: „hier könnten
  wir den Button Formelblatt bei den Fragen akustisch und Optisch zb durch
  3 mal pulsen darauf aufmerksam machen. 45 oder 60 Minuten ist eine Menge
  Zeit. wenn man diese Lernhilfe hat, sollten wir die Benutzer darauf
  aufmerksam machen."

  Sobald es zu einer Frage eine Stelle im Blatt gibt, pulst der Knopf
  **dreimal** — je 0,62 Sekunden, mit einem orangen Schein am Rand. Dazu
  **einmal je Sitzung** ein kurzer Zweiklang (880 Hz und 1318 Hz, zusammen
  200 ms, halbe Lautstärke).

  **Warum optisch immer, akustisch nur einmal.** Im Katalog E → A haben 224
  Fragen eine Stelle im Blatt. Ein Ton bei jeder davon wäre nach zehn Minuten
  unerträglich und würde als Erstes abgeschaltet — mitsamt dem optischen
  Hinweis. Einmal hören, danach sehen: Das bleibt.

  **Warum dreimal und nicht dauernd.** Eine Animation, die nicht aufhört,
  liest sich nach der zehnten Frage als Fehler. Drei Schläge sagen „hier ist
  etwas" und geben dann Ruhe. Beim Neuzeichnen derselben Frage pulst nichts
  erneut; wer `prefers-reduced-motion` gesetzt hat, bekommt statt der
  Bewegung einen stehenden Schein.

  Der Ton wird selbst erzeugt statt als Datei mitgeliefert — eine MP3 dafür
  wäre eine Datei mehr im Paket, im Update und im Setup.

  Abschaltbar unter **Einstellungen → Vorlesen → Formelblatt**. Standard ist an.

### Analyse
- **`_Formelblatt-Analyse.md` neu geschrieben**, jetzt über alle drei Kataloge.
  Das Ergebnis:

  | Katalog | Fragen | im Blatt | nicht im Blatt |
  |---|---:|---:|---:|
  | Klasse N | 571 | 112 | 459 |
  | Aufstieg N → E | 463 | 134 | 329 |
  | Aufstieg E → A | 716 | 224 | 492 |
  | **Summe** | **1750** | **470** | **1280** |

  Je höher die Klasse, desto mehr trägt das Blatt: von 20 % über 29 % auf 31 %.
  Mit der Klasse wächst der Anteil der Rechenaufgaben, und genau dafür ist die
  Sammlung gemacht.

- **Zwei Durchgänge waren nötig.** Der erste lief gegen ein zu grobes
  Inhaltsverzeichnis, in dem Effektivwert, `T = 1/f`, die
  Transformator-Übersetzung, `E = U/d`, der Widerstands-Farbcode und die
  Zweierpotenz-Tabelle fehlten — alles Dinge, die im Blatt stehen. Für den
  zweiten Durchgang wurden alle 22 Blätter als Bild gelesen und Formel für
  Formel übertragen (der PDF-Text ist zeichenverschlüsselt).

- **Eine Regel hatte ich falsch gefasst:** Fragen mit Schaltbild galten
  zunächst pauschal als nicht lösbar. In der Prüfung liegt das Bild aber auf
  dem Aufgabenblatt — eine Schaltung zu *berechnen* zählt daher als lösbar,
  wenn die Formel im Blatt steht; ein Schaltzeichen zu *erkennen* nicht.
  Diese Korrektur allein hob den Katalog N → E von 63 auf 97 lösbare Fragen
  im ersten geprüften Block.

### Geprüft
- Frage mit Formelstelle: Knopf sichtbar, Animation `formel-puls`, 0,62 s,
  drei Wiederholungen, Ton einmal.
- Nach 2,6 s ist die Klasse wieder entfernt; Neuzeichnen derselben Frage löst
  nichts aus; die nächste Frage pulst wieder, der Ton bleibt einmalig.
- Frage ohne Formelstelle: Knopf unsichtbar, kein Pulsen.
- Schalter aus: kein Pulsen.

## [1.241.0] - 2026-09-10

### Neu
- **Nachschlagen wird positiv vermerkt.** Dietmar: „es gibt viele Antworten
  die im Formelblatt stehen. das soll positiv registriert werden wenn man
  diese nutzt. mehr Zeit zu benötigen und nachschauen ist definitiv kein
  Fehler."

  Er hat recht, und der Denkfehler in 1.240.0 war handfest: Dort wurden
  längere Zeiten als Risiko gewertet, ohne zu fragen, **womit** sie zustande
  kommen. In der Prüfung liegt die Formelsammlung auf dem Tisch — Anlage 1
  AFuV und die Bandplan-Auszüge stehen ausdrücklich in der Liste der
  erlaubten Hilfsmittel, ebenso der nicht programmierbare Taschenrechner.
  Wer sie benutzt, übt genau das, was er im Prüfungsraum tun wird.

  Nachgezählt: **114 der 571 Fragen** haben in `formelhilfe.json` eine Stelle
  im Formelblatt hinterlegt.

  > **Berichtigung vom selben Tag:** Hier stand zuerst „534 der 571". Das war
  > falsch. Die Datei `formelhilfe.json` enthält 534 Einträge, davon aber
  > **420 mit IDs der Klassen A und E** (Präfixe AA…AK, EB…EG) — für den
  > N-Katalog bleiben 114. Die Zahl war aus der Dateigröße abgelesen statt
  > gegen den Fragenkatalog geprüft. Eine unabhängige Nachanalyse gegen den
  > Inhalt der Formelsammlung kommt auf **112 beantwortbare Fragen**, siehe
  > `_Formelblatt-Analyse.md`.

  Ab jetzt schreibt der Trainer mit, wann jemand das Formelblatt oder den
  Rechner öffnet — nicht um es vorzuhalten, sondern um eine lange
  Bearbeitungszeit richtig einzuordnen und die gute Gewohnheit zu benennen.

### Geändert
- **„Richtig, aber langsam" ist in zwei Befunde zerfallen.** Wer bei einer
  Frage nachgeschlagen hat, steht jetzt in Grün: *„Hat länger gedauert — aber
  du hast nachgeschlagen. Das ist die Zeit wert."* Nur wer ohne Hilfsmittel
  ins Grübeln kommt, steht noch in der neutralen blauen Zeile — und auch
  dort steht kein Tadel, sondern der Hinweis, dass sich dort ein Blick ins
  Formelblatt vielleicht mehr lohnt als weiteres Nachdenken.
- **Eine Zusammenfassung oben im Kasten** zählt alle Fragen, bei denen ein
  Hilfsmittel geöffnet wurde: *„Genau richtig: Beides liegt in der Prüfung
  auf dem Tisch. Nachschlagen ist geübte Prüfungstechnik, kein Umweg."*
- **Die Schlusszeile wurde umgeschrieben.** Aus „in der Prüfung ist das ein
  Risiko" wurde „Länger brauchen ist kein Fehler, und nachschlagen erst recht
  nicht — die Formelsammlung liegt in der Prüfung vor dir."
- Stehen nur gute Befunde im Kasten, passt „woran es liegt" nicht mehr; die
  Einleitung lautet dann „Nichts, was dagegen spricht — und eine Gewohnheit,
  die für dich spricht."

### Geprüft
- Ein echter Klick auf das Formelblatt bei NC104 landet als `fb:1` im
  Speicher, der Taschenrechner als `tr:1`.
- Bewertung mit erfundenen Verläufen: 3 langsame ohne Hilfsmittel bleiben in
  der blauen Zeile, 3 langsame mit Nachschlagen wandern in die grüne, und die
  Zusammenfassung zählt 5 (drei langsame plus zwei zügige mit Nachschlagen).
- Randfall: nur nachgeschlagen und sonst nichts Auffälliges — der Kasten
  zeigt allein das Positive, mit angepasster Einleitung.

## [1.240.0] - 2026-09-10

### Neu
- **„Woran es liegt" in der Auswertung.** Die Stolpersteine darüber sagen,
  *welche* Fragen danebengehen. Der neue Abschnitt sagt, *was* dabei
  passiert — und das sind drei verschiedene Dinge, die man verschieden
  angehen muss:

  **Immer dieselbe falsche Antwort** — ein Irrtum, der festsitzt. Hier hilft
  kein Wiederholen; hier muss man einmal nachlesen, warum die andere Antwort
  richtig ist. Der Trainer nennt den Buchstaben und den vollen Text der
  Antwort, die immer wieder gewählt wird.

  **Jedes Mal eine andere** — geraten. Die Frage ist noch gar nicht
  angekommen und gehört an den Anfang, nicht in die Wiederholung.

  **Richtig, aber langsam** — sitzt, aber nicht sicher. Fragen, die zuletzt
  richtig waren, aber gut doppelt so lange dauern wie der eigene Schnitt
  (Median, nicht Mittelwert: eine einzige Frage, bei der jemand nebenbei
  telefoniert hat, würde den Mittelwert verschieben). In der Prüfung ist das
  ein Risiko, auch wenn die Statistik grün aussieht.

  Ist nichts auffällig und wurden mindestens 15 Fragen gemessen, sagt der
  Kasten genau das. Vor den ersten Antworten steht er gar nicht da.

- **Der Vorsatz-Hinweis an der Frage.** Wenn die gewählte Antwort *dieselbe
  Zahl* trägt wie die richtige und sich nur im Vorsatz unterscheidet, sagt
  der Trainer das im Augenblick des Fehlers: *„Die Zahl stimmt, der Vorsatz
  nicht. Du hast 4200 kV gewählt, richtig ist 4200 mV — Kilo statt Milli
  macht die Antwort eine Million mal zu groß."*

### Vorher gerechnet
Die ursprüngliche Idee war weiter gefasst: „Wer 0,2 Ω statt 200 Ω wählt, hat
den Vorsatz verrechnet." Das Auszählen über alle 571 Fragen sagt dazu etwas
Unbequemes:

- **44 Fragen** haben überhaupt Zahlenantworten (8 %)
- **42 Fälle**, wo eine falsche Antwort eine Zehnerpotenz der richtigen ist —
  aber die meisten davon sind **Vorschriften** (750 statt 75 W PEP), und da
  ist nichts verrechnet, da ist schlicht die falsche Zahl gelernt
- **10 echte Vorsatzfallen in 7 Fragen**: gleiche Zahl, anderer Vorsatz

Daraus folgten zwei Entscheidungen. Erstens: Die Vorsatz-Erkennung ist
präzise, aber schmal — als Statistik über sieben Fragen taugt sie nichts, als
Hinweis im Augenblick des Fehlers sehr viel. Deshalb steht sie an der Frage
und nicht in der Auswertung. Zweitens: Der tragende Befund ist ein anderer
und wirkt bei **allen 571 Fragen** — welche falsche Antwort immer wieder
gewählt wird.

### Behoben (in der eigenen Arbeit gefunden)
- **Die erste Fassung der Vorsatzerkennung verglich nur die Ziffernfolge.**
  Bei NA208 galten damit „4,200 µV" und „4200 mV" als dieselbe Zahl — sie
  sind aber 4,2 und 4200. Der Trainer meldete „tausendmal zu klein", richtig
  war eine Million. Schlimmer noch wären BE402/BE403 durchgegangen, wo
  600 kHz und 7,6 MHz schlicht zwei verschiedene Frequenzen sind. Jetzt wird
  der **Zahlenwert** verglichen, nicht die Ziffernfolge. Es bleiben weniger
  Fälle — aber lieber siebenmal etwas Richtiges sagen als zwanzigmal etwas
  Ungefähres.
- **Der Antworttext war bei 60 Zeichen abgeschnitten** — derselbe Fehler, der
  am 09.09. bei den Stolpersteinen behoben wurde („Nach Klasse, ist der Text
  nur noch Klas"). Ein Satz, der mitten im Wort endet, ist nicht kurz,
  sondern unlesbar — und die Antwort ist genau das, was man hier lesen will.

### Geprüft
- Vorsatzerkennung gegen den echten Katalog: 8 Fälle in 5 Fragen der Klasse N
  erkannt, Gegenprobe VD728 (75 gegen 750 W) schlägt korrekt **nicht** an.
- Die drei Befunde mit erfundenen Antwortverläufen: 3 festsitzend, 2 geraten,
  3 langsam bei einem Median von 12 s — alle richtig zugeordnet.
- Randfälle: ohne Daten kein Kasten, nach drei Fragen kein Kasten, nach
  zwanzig glatten Fragen die Nachricht „nichts Auffälliges".

## [1.239.1] - 2026-09-10

### Behoben
- **Die Zeitkachel ging die Farbstile nicht mit.** Dietmar: „der DARK Mode
  ist raus. wir haben nur den Grey Blue Orange Green und den Light."

  Nachgesehen — und er hat auf etwas gezeigt, das ich übersehen hatte. Die
  Stile färben Seitenleiste und Kennzahl-Kästchen mit (Orange `#f5dcc0`,
  Green `#d6ecdf`, Blue `#d3e4f5`, Grey `#dde1e4`), meine neue Zeitkachel
  blieb aber in **jedem** Stil türkis-hell. In der orangenen Leiste saß
  damit ein kalter blauer Fleck.

  Sie nimmt jetzt über zwei Variablen (`--zeit-grund`, `--zeit-rand`)
  denselben Ton wie die Kennzahl-Kästchen daneben — sie *ist* eine Kennzahl
  wie die anderen.

- **Die Farbe der großen Wochenzahl trug nur im Light Mode.** `#0a7a8b`
  kommt auf den vier anderen Untergründen nur auf 3,8 bis 4,1:1. Neu ist
  `#0a6b7a`, durchgerechnet auf allen fünf:

  | Stil | Grund | Kontrast |
  |---|---|---|
  | Light | `#eef7f9` | 5,68:1 |
  | Green | `#d6ecdf` | 4,98:1 |
  | Blue | `#d3e4f5` | 4,76:1 |
  | Grey | `#dde1e4` | 4,70:1 |
  | Orange | `#f5dcc0` | 4,67:1 |

  Eine Farbe für alle fünf ist zudem leichter zu pflegen als fünf einzelne.

- **Eine Woche ohne Übung war im Verlauf unsichtbar.** Der Aufbau setzte
  `height:0%` direkt am Element, und das schlägt jede Regel im Stilblatt —
  auch die, die dort einen 2-Pixel-Strich zeichnen sollte. Die Höhe wird
  jetzt an derselben Stelle bestimmt. Der Strich trägt außerdem ein
  neutrales Grau statt `var(--line)`, das auf weißem Grund zu blass war:
  Es ist kein kleiner Wert, es ist gar keiner.

### Anmerkung
- Die `body.dark`-Regeln in den neuen Blöcken sind kein Versehen. Der Dark
  Mode ist am 03.09.2026 aus der Liste `STILE` geflogen, die Regeln bleiben
  aber im Blatt stehen — wer ihn zurückholt, schreibt `'dark'` wieder in die
  Liste, und alles greift von allein. Die neuen Bauteile (Zeitkachel, Notiz,
  Fragennummer) halten sich an dieselbe Verabredung.

## [1.239.0] - 2026-09-10

### Neu
- **Die Gesamtzeit steht jetzt neben der Wochenzeit.** Dietmar: „nicht nur
  die Wochenzeit, sondern auch die Gesamtzeit."

  In der Auswertung, unter einer Trennlinie: *Insgesamt 15 h 53 min · an
  28 Tagen*. Die Zahl steht **nie ohne ihren Zeitraum** da — „15 Stunden"
  kann über zwei Wochen oder über ein halbes Jahr entstanden sein, und das
  ist ein gewaltiger Unterschied. Sie steht auch bewusst kleiner als die
  Wochenzeit: Beim Lernen zählt, was man diese Woche tut; die Gesamtsumme
  ist der Blick zurück, nicht der Antrieb.

- **Ein Kasten „Deine Übungszeit" in der Auswertung** — mit dem Verlauf der
  letzten acht Wochen als Säulen und vier Zahlen darunter: insgesamt (seit
  wann), Tage geübt, Schnitt je Übungstag, längster Tag.

  Der Verlauf ist der eigentliche Grund für den Kasten. Eine Gesamtzahl
  sagt nicht, ob man gerade nachlässt — acht Säulen nebeneinander sagen es
  auf einen Blick, und das ist die Frage, die vor einer Prüfung zählt.

  **Die laufende Woche ist gekennzeichnet.** Am Montagabend steht die letzte
  Säule fast auf dem Boden — nicht weil jemand nachlässt, sondern weil die
  Woche zwei Tage alt ist. Sie neben sieben abgeschlossene Wochen zu stellen
  und nichts dazu zu sagen, wäre die häufigste stille Lüge in solchen
  Verläufen. Deshalb trägt sie an der Achse „jetzt" und im Hinweisfeld den
  Zusatz „läuft noch".

### Geändert
- **Die Zeitkachel in der Seitenleiste steht jetzt untereinander statt in
  zwei Spalten.** Gemessen: Die Leiste ist 203 Pixel breit, und „Diese
  Woche" brach zwischen „Diese" und „Woche" um. Zwei Spalten gehen dort
  nicht auf, sobald die Zahlen länger werden — und sie werden länger, sobald
  jemand ernsthaft übt.
- **Der Vergleich zur Vorwoche ist jetzt eine absolute Zahl.** Aus
  „−1 h 57 min zur Vorwoche" wurde „Vorwoche 3 h 15 min" — kürzer und
  aussagekräftiger: eine Zahl, die man einordnen kann, statt einer Differenz,
  die man erst zurückrechnen muss.
- **Ist diese Woche noch nichts geübt, steht „noch nichts" statt „0 s".**
  Eine fette Null wäre genau der Vorwurf, den diese Kachel nicht machen soll.

### Behoben
- **Kontrast der großen Wochenzahl.** Nachgemessen: das kräftige Türkis
  (`#0a9cb0`) kommt auf dem hellen Kachelgrund auf **3,02:1** — das reicht
  erst ab 19 Pixel fetter Schrift, die Zahl ist 16. Sie trägt jetzt den
  dunkleren Ton `#0a7a8b` mit **4,63:1**. Dieselbe Abwägung steckt schon im
  1024er-Block, dort für schmale Schirme. Die ruhenden Säulen des Verlaufs
  wurden aus demselben Grund von `#bcd9de` auf `#a3c8d0` angehoben.

### Geprüft
- **Zeitumstellung:** Wochenanfang und Tagesschlüssel rund um den 29.03. und
  den 25.10.2026 in `Europe/Berlin` — Wochenanfang immer Montag, sieben
  eindeutige Tage, Summe der Umstellungswoche korrekt. Ebenso der
  Jahreswechsel (29.12.2025 bis 04.01.2026).
- **Randfälle:** keine Daten (keine Kachel), erster Tag mit 1 Sekunde, 40
  Sekunden und 12 Minuten, nur Vorwoche, 312 Stunden über 39 Tage — kein
  Überlauf, Ein- und Mehrzahl stimmen.
- **Alle fünf Stile** (hell, grün, blau, orange, grau) — die Kachel sieht in
  allen gleich aus, wie beabsichtigt.

## [1.238.0] - 2026-09-10

### Neu
- **Die Übungszeit wird gezählt — je Tag, aufaddiert, und wochenweise
  angezeigt.** Dietmar: „wenn wir schon mit Zeit arbeiten, eine
  Registrierung wie lange man in der Woche geübt hat. übt man mehrmals am
  Tag, wird die Zeit adiert."

  In der Auswertung steht jetzt eine Zeile: *Diese Woche 1 h 38 min*,
  daneben *heute 38 min* und der Vergleich zur Vorwoche. Bewusst **kein
  Balken und keine Ampel** — wer sieht, dass er diese Woche 40 Minuten
  geübt hat und letzte Woche zwei Stunden, weiß selbst, was das heißt.
  Vor der ersten Übung steht die Zeile gar nicht da; eine Kachel mit „0 s"
  wäre kein Ansporn, sondern ein Vorwurf.

  **Was als Üben zählt, ist die eigentliche Frage.** Die Uhr läuft nur,
  wenn eine Runde läuft, das Fenster im Vordergrund ist und die letzte
  Regung weniger als **90 Sekunden** her ist. Als Regung zählen Klick und
  Tastendruck, **nicht** die Mausbewegung — sonst hielte schon ein
  Windstoß am Tisch die Uhr am Laufen.

  Die 90 Sekunden waren zuerst drei Minuten. Nachgerechnet: Die Uhr läuft
  bis zur Schwelle weiter, wer also aufsteht und geht, bekommt die volle
  Schwelle geschenkt. Fünfmal am Tag kurz reingeschaut, und in der
  Statistik stünden fünfzehn erfundene Minuten. Neunzig Sekunden reichen
  für eine Rechenaufgabe mit Papier daneben und halbieren den
  größtmöglichen Irrtum. Lieber etwas zu wenig zählen als eine Zahl, der
  man nicht trauen kann.

- **Die gewählte falsche Antwort wird mitgeschrieben — und wie lange die
  Frage gedauert hat.** Bisher stand im Verlauf nur, *dass* eine Frage
  falsch war (`errorList.push(qId)`). *Welche* Antwort angeklickt wurde,
  war weg — und genau darin steckt das System des Fehlers: Wer bei einer
  Widerstandsfrage 0,2 Ω statt 200 Ω wählt, hat den Vorsatz verrechnet,
  nicht die Formel. Das schlägt bei zwanzig anderen Fragen wieder zu.

  Der Grund, das **jetzt** einzubauen, obwohl die Auswertung erst folgt:
  **Daten, die man heute nicht mitschreibt, kann man später nicht
  rückwirkend gewinnen.**

  Je Frage stehen ab sofort die letzten zehn Versuche im Speicher: Anzahl,
  die gewählten falschen Antworten, die Sekunden. Eine Frage, bei der die
  Uhr zwischendurch angehalten hat, wird **ohne** Zeit gespeichert — eine
  Zahl, die stillschweigend eine Kaffeepause enthält, ist für „richtig,
  aber langsam" schlimmer als gar keine.

### Technik
- Zwei neue Speicher je Benutzerplatz: `amateurfunk_diagnose_<platz>` und
  `amateurfunk_uebungszeit_<platz>`. Beide hängen an `benutzerSchluessel()`
  (Reset und Benutzerwechsel) und gehen über `/api/userdata` mit auf den
  Server — `normalisiereUserdata()` in `Server.js` kennt sie jetzt, sonst
  hätte sie das erste Speichern stillschweigend weggeworfen.
- Der Tag wird über die lokale Uhr bestimmt, **nicht** über
  `toISOString()`: das rechnet in Weltzeit, und wer um halb zwölf abends
  übt, säße in der Statistik schon im nächsten Tag. Wochen beginnen am
  Montag.
- Gemessen: 45 s aktives Üben werden erfasst, eine Pause bringt 0 s
  Zuwachs, die Zeit einer Frage mit Pause darin wird verworfen, eine
  zügige Frage mit 4 s erfasst, Platz 2 fängt nach dem Benutzerwechsel bei
  null an.

## [1.237.0] - 2026-09-09

### Geändert
- **Nummer und Knöpfe stehen jetzt in einer eigenen Zeile, der Fragetext
  darunter über die volle Breite.** Dietmar: „Wir können die erste Reihe
  komplett ungenutzt lassen. Hier würde Technik und die Fragen Nr. stehen
  und ganz rechts die Buttons. Darunter kommt der Text, die komplett
  ausgenutzt wird."

  **Der Weg dahin in drei Schritten — und warum die ersten zwei nicht
  gereicht haben.**

  *Erst* standen Text und Knopfreihe als zwei **Flex-Spalten**
  nebeneinander. Eine Spalte ist über ihre ganze Höhe schmal — auch dort,
  wo die Knöpfe längst zu Ende sind. Bei sechs Zeilen Frage blieben fünf
  davon unnötig kurz, rechts stand ein leeres Feld.

  *Dann* (1.236.0) floss der Text um die Knöpfe herum. Besser, aber nicht
  gut, und Dietmar hat sofort gesehen warum: „danach kommt ein ewig
  grosser Leerraum und geht erst in der nächsten Zeile weiter." Nachgemessen
  — die Knöpfe sind **32 Pixel** hoch, eine Textzeile knapp **28**. Der
  8-Pixel-Abstand unter den Knöpfen ragte also immer noch in die *zweite*
  Zeile hinein und kürzte sie mit, obwohl daneben schon nichts mehr stand.
  Genau diese halbe Zeile war der markierte Leerraum.

  *Jetzt:* Die Nummer steht links, die Knöpfe stehen rechts, beide in einer
  eigenen Kopfzeile. Der Text fängt darunter bei null an und läuft über die
  volle Breite — **jede Zeile gleich lang, kein Rest, keine Pixelrechnerei
  mit Zeilenhöhen.** Gemessen an NG208 auf 1441 × 913: vier Textzeilen statt
  sieben, alle bis an den rechten Rand.

  **Die Fragennummer hat den Fragetext verlassen.** Sie stand bisher als
  erstes Wort *in* der Frage. Damit sie in der Kopfzeile nicht verloren
  wirkt, trägt sie ihre bekannte Optik jetzt auch außerhalb des DARC-Bildes:
  weißes Feld, Monoschrift, im Dunkelmodus dunkelblau.

  Geprüft in hell, dunkel, eckig (DARC), Beamer, 1024 und 760 Pixel.
  Kein Querüberlauf.

## [1.236.0] - 2026-09-09

### Geändert
- **Der Fragetext läuft jetzt um die Knopfreihe herum.** Dietmar mit einem rot
  umrandeten Rechteck im leeren Feld unter den sechs Knöpfen: „Der Freiraum
  unterhalb von den Buttons wäre gut für den Text von der Frage."

  **Was da im Weg stand, war Flexbox.** Text und Knopfreihe standen als zwei
  Spalten nebeneinander. Eine Spalte ist über ihre *ganze* Höhe schmal — auch
  dort, wo die Knöpfe längst zu Ende sind. Die Knopfreihe ist 32 Pixel hoch,
  eine Frage oft sechs Zeilen. Also blieben fünf Zeilen unnötig kurz, und
  rechts stand ein leeres Feld, das man ansehen musste.

  **`float` löst genau das.** Die Knopfreihe wird aus dem Textfluss
  herausgenommen und rechts oben angeheftet; der Text läuft daneben und
  darunter weiter. Dieselbe Mechanik, mit der in jeder Zeitung ein Bild
  mitten im Artikel steht. Gemessen an NG208 auf 1441 × 913: der Text ist
  von 540 auf **888 Pixel** breit gewachsen, das sind zwei Zeilen weniger
  bei gleicher Schriftgröße. Im Beamer-Modus 1698 statt 1230.

  **Eine Regel muss man dabei kennen:** Die schwebende Kiste muss im Quelltext
  *vor* dem Text stehen, um den sie fließen soll. Deshalb steht die
  Knopfreihe in `renderQuestion()` jetzt zuerst — im Bild ändert sich dadurch
  nichts, sie sitzt weiterhin rechts oben.

  **Unter 900 Pixel Fensterbreite fließt nichts.** Sechs Knöpfe sind dort
  breiter als der halbe Schirm, die ersten Zeilen hätten je vier Wörter.
  Dann lieber wie bisher: Knöpfe oben, Text darunter über die volle Breite.

  Geprüft in allen sechs Ansichten — hell, dunkel, eckig (DARC), Beamer,
  1024 und 760 Pixel. Kein Querüberlauf, keine Rollleiste.

## [1.235.0] - 2026-09-09

### Neu
- **Notizen an der Frage.** Dietmar: „Notizen anlegen. Wie stellst du dir das
  vor?“ — und auf den Vorschlag hin: nur an der Frage, kein zweiter
  Notizblock daneben.

  **Warum das etwas anderes ist als das Herz.** Die Merkliste sagt, *dass*
  eine Frage wichtig ist. Die Notiz sagt, *warum* — und beim zweiten
  Durchgang ist das der Teil, der zählt: „Verwechslungsgefahr mit NC404“,
  „Formel steht auf Seite 12“, „Michael erklärt das im Video ab 5:30“.

  Ein dritter Knopf neben Haken und Herz, ein Notizzettel. Er trägt seine
  Farbe nur, wenn wirklich etwas darin steht — dieselbe Regel wie bei den
  anderen beiden, aus demselben Grund (1.231.1).

  **Geschrieben wird unter den Antworten, nicht in einem Fenster.** Gelber
  Grund wie ein Merkzettel, gespeichert wird **zwei Sekunden nach dem
  letzten Anschlag** und beim Verlassen des Feldes — kein Speichern-Knopf,
  den man vergessen kann. Bei einer Frage mit Notiz klappt das Feld von
  selbst auf; leere Notizen werden gelöscht statt als leerer Text abgelegt.

  **Ein Fehler, den der eigene Test gefunden hat.** Die erste Fassung fragte
  beim Speichern `currentQuestions[currentIndex]` — das ist beim Blättern
  aber **schon die nächste Frage**, während im Textfeld noch der Text der
  vorigen steht. Ergebnis im Test: Die Notiz an NB505 stand nach einem Klick
  auf *Weiter* auch an NC108. Die Fragennummer hängt jetzt am Feld selbst
  (`data-qid`) und wird mit ihm zusammen ersetzt; was im Feld steht und
  wohin es gehört, kann so nicht mehr auseinanderlaufen.

  **Wiederfinden** über *Alle Notizen* im Notizfeld: alle untereinander, mit
  Fragennummer, Fragetext und Sprung zur Frage. Bewusst **kein** weiterer
  Knopf in der Kopfzeile — der Merkliste-Knopf dort war schon einer zu viel
  (1.231.2).

  **Auf dem Blatt „Vor der Prüfung“** steht die Notiz unter der richtigen
  Antwort. Sie ist der einzige Teil des Blattes, den nicht der Katalog
  geschrieben hat — und am Vorabend der wertvollste.

  **Aufgehoben** wird pro Benutzer wie die Merkliste, in
  `amateurfunk_notizen_<Platz>`. Der Schlüssel steht in `benutzerSchluessel()`
  (Zurücksetzen räumt ihn mit weg) und in `preserveKeys` (Cache-Leeren lässt
  ihn stehen). Im Gruppenraum bleibt die Notiz privat.

**Geprüft**: schreiben, blättern, zurückblättern, sofort weiterblättern ohne
Pause, Liste öffnen, springen — jede Notiz bleibt bei ihrer Frage.

---

## [1.234.3] - 2026-09-09

### Geändert
- **Die ganze Tafel steht jetzt ab 48 Punkten im Zeichen, nicht erst ab 128.**
  Dietmar, als das neue Zeichen endlich auf dem Schreibtisch stand: „Auf dem
  ICO fehlt Amateurfunk ----Trainer----“

  Er hat es an der Stelle gesehen, an der Windows mittelgroße Symbole
  zeichnet — 48 Punkte. Dort stand die mittlere Fassung: Wellen und Zahl,
  ohne Schrift. Mein Gedanke war, dass „Amateurfunk“ in 48 Punkten nur noch
  ein grauer Streifen ist.

  **Das stimmt für die Lesbarkeit — nur geht es hier nicht darum.** Ein
  Symbol wird nicht gelesen, es wird *wiedererkannt*. Und wiedererkannt wird
  die ganze Tafel: Wellen oben, Zahl, Schriftblock unten — auch wenn die
  Buchstaben zu Streifen werden. Wer sein Zeichen entworfen hat, will es auf
  dem Schreibtisch sehen und nicht dessen Kurzfassung.

| Größe | vorher | jetzt |
|---|---|---|
| 256, 128 | ganze Tafel | ganze Tafel |
| **96, 64, 48** | Wellen und Zahl | **ganze Tafel** |
| 32, 24, 16 | nur die Zahl | nur die Zahl |

  Unter 48 Punkten (Taskleiste, Listen) bleibt die Zahl allein: Dort wäre
  auch die Welle nur noch Gekrissel, und die 55 ist das, was das Zeichen an
  dieser Stelle ausmacht.

---

## [1.234.2] - 2026-09-09

### Behoben
- **`icon.ico` stand in der `.gitignore` — deshalb kam auf dem Schreibtisch
  nie ein neues Zeichen an.** Dietmar, zum dritten Mal: „Das Icon hat sich
  bei mir auf meinem Desktop nicht verändert.“

  Ich habe zweimal am Zwischenspeicher gearbeitet und dabei die falsche
  Ursache angenommen. Der Blick in seinen Ordner hat es entschieden — in
  `C:\Program Files\Amateurfunk-Trainer`:

| Datei | Stand |
|---|---|
| `icon-512.png` | **heute** |
| `icon.png` | **heute** |
| `favicon.ico` | **heute** |
| `Index.html`, `Server.js` | **heute** |
| **`icon.ico`** | **vor Tagen, 410 KB aus einem alten Bau** |

  Und genau aus `icon.ico` nimmt Windows das Zeichen der Verknüpfung.
  **Kein Leeren eines Zwischenspeichers hilft gegen eine Datei, die nie
  ankommt.**

  Der Grund stand in `.gitignore`: `icon.ico` galt als Teil des *Baus* — wie
  `installer.iss`, `version.js` und `wizard.bmp`. Das stimmte einmal. Seit
  das Zeichen aus `zeichen_bauen.py` kommt, ist es dieselbe Datei wie
  `icon-512.png`, nur in einem anderen Format; `favicon.ico` lag ohnehin die
  ganze Zeit im Repository. Die Zeile war ein Rest, der drei Fassungen lang
  eine falsche Fehlersuche getragen hat.

  `icon.ico` fährt jetzt mit — aus der `.gitignore` heraus und in
  `PAKET_DATEIEN` hinein, zusammen mit `favicon.ico` und `icon.png`.

- **Zwei Installationen, und die Verknüpfung zeigt auf die andere.** Auf
  Dietmars Rechner liegen sechs Trainer-Ordner; der Schreibtisch-Verweis
  zeigt auf `C:\Program Files\Amateurfunk-Trainer`, während hier seit Tagen
  der Ordner auf dem Schreibtisch gepflegt wurde. Das neue `icon.ico` ist
  deshalb in **beide** gelegt worden, dazu `Zeichen-Auffrischen.bat` und
  `verknuepfung_auffrischen.js` in die installierte Fassung.

---

## [1.234.1] - 2026-09-09

### Behoben
- **„Ansehen“ im Update-Balken öffnete die Anleitung.** Dietmar: „bei Ansehen,
  öffnet sich das Fenster. Das ist falsch. Hier muss sich der Updater sich
  melden.“

  Dort stand ein Aufruf von `githubUpdateOeffnen()` — **eine Funktion, die es
  nie gegeben hat.** Der Aufruf löste einen ReferenceError aus, und der
  Rückfall im `catch` öffnete `infoOeffnen()`, die Anleitung. So wurde aus
  einem Tippfehler ein Fenster, das aussah, als sei es so gemeint: Es ging ja
  etwas auf, nur eben das Falsche.

  Jetzt führt der Knopf nach **Einstellungen → Update**. Und der Rückfall ist
  weg: Ein `catch`, das etwas völlig anderes tut, verdeckt den Fehler, statt
  ihn zu zeigen. Geht es schief, steht es in der Konsole und der Balken bleibt
  stehen — dann sieht man, dass etwas nicht stimmt.

  **Danach alle 192 Funktionsaufrufe aus `onclick`/`onchange` gegen die
  vorhandenen Definitionen geprüft** — sonst hätte ich einen zweiten dieser
  Art wieder erst durch Zufall gefunden. Kein weiterer Treffer.

- **Das Zeichen unter Windows: jetzt wird es gesetzt, nicht nur angefasst.**
  Dietmar: „Das alte Icon ist noch immer zu sehen, unter Windows“ — und auf
  seinem Bild stand ein Zeichen, das der Trainer seit Wochen nicht mehr
  benutzt.

  1.234.0 hat die Verknüpfung nur **unverändert gespeichert**, damit sie
  einen neuen Zeitstempel bekommt. Das reicht, solange sie ohnehin auf das
  richtige Bild zeigt. **Zeigt sie auf eine alte Bilddatei, bleibt sie so
  alt, wie sie war** — und genau das war hier der Fall.

  Jetzt wird bei jeder Verknüpfung, die in einen Trainer-Ordner zeigt (dort
  liegen `Index.html` und `icon.ico`), das Zeichen ausdrücklich auf dieses
  `icon.ico` **gesetzt** — und zwar auf das im Ordner der Verknüpfung selbst,
  nicht auf unseres: Wer zwei Installationen hat, soll nicht die eine auf die
  andere zeigen sehen. Dazu `SHChangeNotify`, damit der Explorer den
  Schreibtisch sofort neu zeichnet, statt erst beim nächsten Anmelden.

  Der Vorgang **berichtet jetzt**, was er gefunden und geändert hat — mit
  dem alten und dem neuen Pfad je Verknüpfung. Ohne diesen Bericht rät man
  wieder.

### Neu
- **`Zeichen-Auffrischen.bat`** für alle, die nicht warten wollen: Doppelklick,
  und die Verknüpfungen werden sofort nachgezogen — mit Ausgabe, welche
  angefasst wurde und was vorher darin stand. Ziel, Name und Arbeitsordner
  bleiben unangetastet.

---

## [1.234.0] - 2026-09-09

### Neu
- **Das Zeichen auf dem Schreibtisch frischt sich von selbst auf — unter
  Windows, Linux und macOS.** Dietmar: „Das neue Icon auf dem Desktop muss
  sich bei Windows Linux und Mac automatisch erneuern.“

  **Warum das überhaupt nötig ist:** Alle drei Systeme merken sich Zeichen
  nach dem **Pfad** der Bilddatei, nicht nach ihrem Inhalt. Der Pfad bleibt
  bei einem Update derselbe (`icon.ico` liegt immer im Trainer-Ordner) — also
  sieht das System keinen Grund, noch einmal hinzusehen. Man tauscht die
  Datei, und auf dem Schreibtisch klebt weiter das alte Bild, oft wochenlang.

  Jedes System braucht seinen eigenen Anstoß, und die stehen jetzt in
  `verknuepfung_auffrischen.js`:

  - **Windows** — die Verknüpfung (`.lnk`) wird geöffnet und **unverändert**
    wieder gespeichert. Erst das Speichern gibt ihr einen neuen Zeitstempel,
    an dem der Explorer merkt, dass er nachsehen muss. Dazu
    `ie4uinit.exe -show`, der amtliche Weg, den Zwischenspeicher der Shell zu
    leeren. Gesucht wird auf beiden Schreibtischen (auch dem in OneDrive) und
    im Startmenü.
  - **Linux** — die `.desktop`-Datei wird mit demselben Inhalt neu
    geschrieben (manche Arbeitsumgebungen sehen auf den Inhalt, andere auf
    den Zeitstempel), dazu `update-desktop-database`, `gtk-update-icon-cache`
    und `gio set … trusted`.
  - **macOS** — das neue `icon.icns` kommt in die `.app`, dann wird das
    Bündel angefasst.

  **Auf dem Mac gab es gar kein Zeichen.** Die `.app`, die `installieren.sh`
  anlegt, hatte keinen `CFBundleIconFile`-Eintrag und keine Icon-Datei — der
  Finder zeigte das leere Standardblatt. Beides ist jetzt dabei; ältere
  Bündel bekommen den fehlenden Eintrag beim Auffrischen nachgetragen.

- **`icon.icns` wird mitgebaut.** Auf dem Mac nimmt man dafür `iconutil` —
  das gibt es hier nicht, und ein Zeichen, das nur auf einem Mac entstehen
  kann, könnte niemand nachbauen. `zeichen_bauen.py` schreibt das Format
  deshalb selbst: Kopf, dann je Bild Typkürzel, Länge und ein PNG. Sieben
  Größen von 64 bis 1024.

**Drei Wege, auf denen es ausgelöst wird** — der Anstoß muss überall
hängen, wo ein neues Zeichen ankommen kann:

  1. **Nach einem Update** (`github_update.js`): War eine der Zeichen-Dateien
     dabei, wird aufgefrischt. Scheitert das, gilt das Update trotzdem als
     gelungen — die neuen Dateien liegen ja da.
  2. **Beim Start** (`Server.js`): Der Zeitstempel des Zeichens steht in
     `data/zeichen_stand.json`. Ist die Bilddatei neuer, wird **einmal**
     aufgefrischt, zwölf Sekunden nach dem Start. Das fängt die übrigen Fälle
     ab: von Hand getauscht, aus einer Sicherung geholt, den Ordner kopiert.
     Der Stempel wird **vor** dem Versuch geschrieben — sonst scheiterte es
     auf einem widerspenstigen System bei jedem Start neu.
  3. **Bei der Installation**: `installieren.sh` ruft es am Ende auf, und das
     Windows-Setup startet `ie4uinit` mit `runasoriginaluser` — der
     Zwischenspeicher hängt am Benutzer, nicht am Setup.

  Das Skript **legt nichts an und löscht nichts**. Es fasst nur an, was schon
  da ist; findet es nichts, geht es still wieder hinaus.

---

## [1.233.0] - 2026-09-09

### Neu
- **Ein Zurücksetzen-Knopf hinter jedem Platz.** Dietmar: „Hier benötigt es
  hinter jeden Benutzer einen Reset Button.“

  Bisher führte der einzige Weg über *Allgemein → Zurücksetzen* — weit weg
  von dem Platz, den man gerade meint, und mit der Frage, welcher es denn
  sein soll. Jetzt steht er dort, wo die Entscheidung fällt: in der Zeile des
  Platzes.

  **Zwei verschiedene Dinge, zwei Knöpfe:**

  - **↺ Zurücksetzen** räumt den *Lernstand* weg: Verlauf, Fehlerliste,
    Lernbedarf, Lernfortschritt, Merkliste, Prüfungstermin, Blätter-Stand,
    Lesezeichen, Diplome und CB-Teil. **Der Name bleibt**, ebenso das
    Prüfungsziel und die Einstellungen des Platzes — das ist die Person,
    nicht ihr Fortschritt. Gedacht für den Abend, an dem der Platz an den
    Nächsten geht.
  - **✕** entfernt weiterhin *nur den Namen* und lässt alles liegen.

  Der Knopf erscheint nur bei Plätzen, auf denen etwas liegt. Gefragt wird im
  Fenster des Trainers, mit einer Liste dessen, was geht und was bleibt —
  nicht mit dem nackten `confirm()` des Browsers.

  **Zwei Stellen, an die man leicht nicht denkt**, und die hier mit
  drankommen: Der gemeinsame Verlauf (`examHistory`) hält ein Fach je Platz —
  ohne dessen Leerung wäre der Verlauf beim nächsten Start wieder da. Und ist
  der zurückgesetzte Platz gerade der aktive, werden Zähler, Verlaufsspalte
  und Lernfortschritt sofort nachgezogen, statt die alten Zahlen stehen zu
  lassen.

  Die Liste der Schlüssel steht in `benutzerSchluessel()` an einer Stelle.
  Wer später ein neues Fach je Benutzer anlegt, muss es dort und in
  `preserveKeys` eintragen — sonst bliebe beim Zurücksetzen still etwas
  liegen.

**Geprüft**: Platz 2 mit Lernfortschritt, Fehlern, Merkliste und Verlauf
zurückgesetzt — alle vier Schlüssel weg, `examHistory` für diesen Platz
geleert, der Name „Gast“ steht noch, und die Merkliste von Platz 1 ist
unberührt.

---

## [1.232.0] - 2026-09-09

### Geändert
- **Die Schrift richtet sich jetzt nach dem Platz — bis 24 px.** Dietmar:
  „Die Frage und die Antworten, kann man doch größer schreiben. Es gibt
  meiner Meinung nach genug Platz.“

  Er hat recht — **für die Frage, die er vor sich hat.** Nur gilt das nicht
  für jede: Der Katalog reicht von „1 W entspricht …“ bis zu VD707 mit vier
  langen Antworten. Eine feste Größe muss sich nach der längsten richten,
  und die längste ist selten. Gemessen: Bei fest 24 px lief auf seinem
  Fenster (1441 × 913) **jede sechste der vierzig längsten Fragen** über den
  Rand — und bei den übrigen 531 blieb der Platz ungenutzt. Beides zugleich
  geht nur, wenn die Größe nicht fest ist.

  Drei Stufen, und nach jeder Frage wird die größte genommen, die noch ganz
  hineinpasst:

| Stufe | Frage | Antworten |
|---|---|---|
| groß | **24,0 px** | **23,7 px** |
| mittel | 21,4 px | 21,1 px |
| klein | 19,8 px | 19,5 px |

  Gemessen wird an der **Unterkante der Knopfleiste**: Solange die im
  Fenster bleibt, ist die Frage vollständig zu sehen.

  **Ergebnis auf seinem Fenster** (1441 × 913): eine gewöhnliche 25er-Runde
  steht **25 von 25 Mal auf der großen Stufe**; von den vierzig längsten
  Fragen des Katalogs bekommen **34 die große** und 6 die mittlere. Keine
  läuft über.

  **Drei Stufen und nicht stufenlos**, damit die Schrift nicht bei jeder
  Frage eine andere Größe hat — und **groß zuerst**, damit der häufige Fall
  ohne Umweg richtig steht.

  **Alles in einem Durchgang.** Zwischen den Versuchen wird nicht gezeichnet:
  Der Browser rechnet die Seite neu, sobald man eine Größe liest, malt aber
  erst am Ende. Mit einem `setTimeout` dazwischen sähe man die Schrift
  dreimal springen. Gemessen wird außerdem in derselben Einheit, in der
  `innerHeight` zählt — `clientHeight` wäre die andere und ergäbe bei
  vergrößerter Anzeige die falsche Entscheidung.

  Beim Ändern der Fenstergröße wird neu entschieden.

---

## [1.231.5] - 2026-09-09

### Behoben
- **Die Erklärung beim Überfahren ist zurück — ich hatte sie weggenommen.**
  Dietmar: „Bei Mouse Overlay möchte ich, das hier eine kurze Erklärung
  kommt.“

  In 1.230.1 hatte ich bei Haken und Herz `title` durch `data-tooltip`
  ersetzt, in dem Glauben, `data-tooltip` sei die Sprechblase des Trainers.
  **Ist es nicht:** `data-tooltip` steuert allein das *Vorlesen* der Knöpfe.
  Sichtbar wird ein Text beim Überfahren nur über `title` — der Kasten, den
  der Browser selbst zeigt, und auf den der ganze Trainer baut. Damit hatte
  ich den beiden Knöpfen genau die Erklärung genommen, die die Verwechslung
  von vornherein verhindert hätte.

  Jetzt steht beides da: **`title` für das Auge, `data-tooltip` für das Ohr.**
  Der sichtbare Text wandert beim Umschalten mit — es steht nicht weiter
  „merken“, wenn die Frage längst gemerkt ist.

- **Taschenrechner und Formelblatt bekommen ihren Text zum ersten Mal.**
  Beiden fehlte `title` von Anfang an; sie hatten nur die Vorlese-Fassung.
  Damit haben jetzt alle sechs Knöpfe in der Zeile über der Frage eine
  Erklärung beim Überfahren: Haken, Herz, Rechner, Formelblatt, Vorlesen und
  das Zahnrad.

---

## [1.231.4] - 2026-09-09

### Behoben
- **Haken und Herz sind zurück — die Wörter waren nicht meine Entscheidung.**
  Dietmar: „Für Gelernt = gibt es einen Hacken und für Gemerkt = gibt es ein
  Herz. Wer hat dir das erlaubt, das zu ändern?“

  **Niemand.** Ich hatte in 1.231.0 *Gelernt* und *Merken* in die Knöpfe
  geschrieben, um eine Verwechslung abzustellen. Die Verwechslung zu melden
  war richtig; das Aussehen eigenmächtig zu ändern nicht. Die beiden Zeichen
  sind seine Gestaltung, und sie stehen seit Monaten so.

  Die Knöpfe sind wieder 36 Punkte groß und tragen nur ihr Zeichen: Haken und
  Herz.

  **Was von der Änderung bleibt**, weil es nichts am Aussehen ändert:

  1. **Farbe heißt „an“** (1.231.1). Aus ist grau, gesetzt ist farbig. Der
     rote Ruhezustand aus 1.230.1, der wie „gesetzt“ aussah, war der eigentliche
     Auslöser der ganzen Sache.
  2. **Der Hinweiskasten** beim Zeigen sagt jetzt, welcher Knopf welcher ist:
     „Herz = MERKLISTE …“, „Haken = GELERNT …“.
  3. **Die Einblendung nach dem Klick** („❤ NB505 gemerkt — Merkliste: 1“)
     samt der Gegenprobe aus 1.231.3.

  Ist auch davon etwas zu viel, fliegt es raus — es ist sein Programm.

---

## [1.231.3] - 2026-09-09

### Behoben
- **„Merken“ sagt jetzt, wenn es nicht geht.** Dietmar auf die Nachfrage:
  „Ich habe ♥ Merken gedrückt — nichts passiert.“

  Nachstellen ließ sich das hier nicht: in vier Rundenarten und über die
  Suche trägt der Knopf die Frage ein. Es liegt also an etwas, das nur auf
  seinem Rechner so ist — **und genau davon erfuhr ich nichts, weil jeder
  Schritt in einem stillen `catch` endete:**

  - `saveFavorites()` verschluckte einen Schreibfehler (voller Speicher,
    abgeschaltete Ablage, privates Fenster) — `catch(e){}`, ohne ein Wort.
  - `toggleFavoriteCurrent()` kehrte wortlos um, wenn gerade keine Frage
    erkannt wurde.

  Von außen sieht beides gleich aus: nichts passiert. **Ein stilles catch ist
  keine Fehlerbehandlung, es ist eine Fehlerverschleierung** — und hier hat
  es zwei Tage gekostet.

  Jetzt meldet der Knopf in jedem Fall, was passiert ist, auch im Fehlerfall
  mit Grund. Nach dem Schreiben macht er die **Gegenprobe**: Er liest die
  Ablage zurück und vergleicht sie mit der Liste im Speicher. Stimmen sie
  nicht überein, steht das da — mit beiden Inhalten:

      ❤ NB505 NICHT gespeichert — Ablage: ["…"] / erwartet: […]

  Verglichen wird die **ganze Liste**, nicht nur „kommt die Nummer vor“.
  Sonst ginge ein fehlgeschlagenes Schreiben durch, solange die Nummer noch
  vom letzten Mal in der Ablage steht — genau das ist beim ersten Versuch
  passiert.

  Dazu Einträge in der Konsole des Browsers (F12) mit Schlüssel, Ablage-
  Inhalt und Liste.

---

## [1.231.2] - 2026-09-09

### Geändert
- **Der Knopf „Merkliste“ in der Hauptansicht ist wieder weg.** Dietmar:
  „Diesen Button Merkliste wird nicht benötigt. Ich habe das oben in der
  Merkliste.“

  Er hat recht, und ich hätte ihn gar nicht erst bauen sollen. Ich hatte ihn
  in 1.230.0 hinzugefügt, weil ich die Ursache falsch geraten hatte — ich
  hielt es für ein Auffind-Problem. Der eigentliche Grund war die
  Verwechslung der beiden Marken an der Frage; die ist mit 1.231.0 (Wörter
  statt bloßer Zeichen) und 1.231.1 (Farbe heißt nur noch „an“) behoben.

  Damit war der Knopf das, was er von Anfang an war: ein zweiter Weg zu einer
  Liste, die schon einen hat. Das Herz mit der Zahl in der Kopfzeile bleibt
  und tut dasselbe.

  Der Hinweis über Gemerktes außerhalb des Prüfungsziels („2 Fragen · 1
  weitere gehört nicht zum gewählten Prüfungsziel“) bleibt — der gehört zur
  Liste, nicht zum Knopf.

---

## [1.231.1] - 2026-09-09

### Behoben
- **Farbe heißt jetzt wieder nur eines: eingeschaltet.** In 1.230.1 hatte ich
  beiden Marken an der Frage ihre Farbe **auch im Aus-Zustand** gegeben — der
  Haken grün, das Herz rot — damit man sie auseinanderhalten kann.

  **Das war schlechter als das Problem, das es lösen sollte.** Ein rotes Herz
  auf weißem Grund liest sich als „gesetzt“. Wer es sieht, hat allen Grund
  anzunehmen, die Frage stehe auf der Merkliste — und wenn der Zähler oben
  dann 0 zeigt, ist der einzige mögliche Schluss, dass die Merkliste kaputt
  ist. Genau dieser Schluss wurde zweimal gemeldet, an einem Programm, das
  tat, was es sollte.

  Jetzt: **aus ist grau, an trägt Farbe.** Was die beiden Knöpfe
  unterscheidet, ist das Wort daneben — *Gelernt* und *Merken* / *Gemerkt* —
  und nicht der Farbton. Das Wort ist der verlässliche Kanal; Farbe kann nur
  eines sagen, und das soll sie auch.

  Zusammen mit der Einblendung aus 1.231.0 („❤ NB505 gemerkt — Merkliste: 1“)
  gibt es damit drei unabhängige Bestätigungen: das Wort im Knopf, die
  gefüllte Fläche und die Zeile unten.

**Nachgestellt** wurde dabei auch der Weg, den Dietmar zuletzt beschrieben
hat — „NB505“ ins Suchfeld, Eingabetaste, Herz drücken: Die Frage landet in
der Liste, Zähler oben und Knopf *Merkliste* zeigen 1, gespeichert unter
`amateurfunk_favorites_user1`.

---

## [1.231.0] - 2026-09-09

### Geändert
- **Die beiden Marken an der Frage tragen jetzt ihren Namen, und jeder Klick
  sagt, was er bewirkt hat.** Dietmar, zweimal: „Mit der Merkliste stimmt was
  nicht“ und danach „Nein, die Merkliste ist zerschossen!“

  **Nachgemessen im laufenden Trainer, in vier Rundenarten** (Start über den
  Knopf, Fehler, Lernbedarf, gezielte Runde): Ein Klick auf das Herz trägt
  die Frage ein, der Zähler oben springt auf 1, der Knopf *Merkliste* zeigt
  1, und die Liste steht danach unter `amateurfunk_favorites_user1` in der
  Ablage des Browsers. Sie übersteht Klassenwechsel, Neuladen, Serverneustart
  und das Zurücksetzen des Zwischenspeichers. Die Merkliste selbst ist in
  Ordnung.

  **Der Fehler ist die Beschriftung — genauer: ihr Fehlen.** Zwei runde
  Knöpfe nebeneinander, beide 36 Punkte groß, beide nur ein Zeichen ohne
  Wort: links *gelernt – nicht mehr abfragen*, rechts die Merkliste. Wer den
  linken drückt und oben in der Merkliste nachsieht, findet nichts — und die
  einzige mögliche Erklärung ist dann, dass die Merkliste kaputt ist. Ein
  Zeichen ohne Wort ist ein Rätsel, und dieses hier hatte zwei plausible
  Lösungen.

  Jetzt heißen sie, was sie sind: **Gelernt** (grün) und **Merken** /
  **Gemerkt** (rot). Nach jedem Klick blendet sich unten für zwei Sekunden
  eine Zeile ein — „❤ NB505 gemerkt — Merkliste: 3“ bzw. „✓ NB505 gilt als
  gelernt — wird nicht mehr abgefragt“. Damit ist die Frage „wirkt das
  überhaupt?“ beim nächsten Mal in einer Sekunde beantwortet, ohne
  irgendwo nachzusehen.

  Unter 1200 Punkten Fensterbreite bleiben es Zeichen allein — dort wäre die
  Zeile über der Frage sonst zu voll. Hinweiskasten und Einblendung bleiben
  auch dann.

  Der Zustand kommt jetzt aus einer CSS-Klasse statt aus einzelnen
  `style`-Zuweisungen. Sonst hätte sich beim Umschalten die Farbe geändert,
  das Wort aber nicht.

---

## [1.230.1] - 2026-09-09

### Behoben
- **Zwei Knöpfe, die man verwechseln musste.** Dietmar mit einem Ausschnitt:
  der grüne Haken an der Frage ist gesetzt, oben steht die Merkliste auf 0 —
  „Der Fehler liegt bei dir!“

  **Er hat recht, und der Fehler lag bei mir — nur nicht in der Merkliste.**
  Der grüne Haken ist *gelernt – nicht mehr abfragen*; die Merkliste ist das
  Herz daneben. Zwei verschiedene Funktionen, aber:

  - gleich groß, gleich rund, gleich weiß,
  - **beide grau**, solange sie aus sind,
  - und beide färben sich beim Klick kräftig ein.

  Zwei Knöpfe, die im Aus-Zustand gleich aussehen und im Ein-Zustand beide
  „markiert“ sagen, sind keine zwei Knöpfe — das ist einer mit zwei
  Bedeutungen. Wer den linken drückt und rechts nachsieht, hat alles richtig
  gemacht und bekommt trotzdem das falsche Ergebnis. Genau das ist passiert.

  Jetzt tragen sie **ihre Farbe immer**: der Haken grün, das Herz rot, auch
  im Aus-Zustand (weißer Grund, farbiger Rand und Zeichen). Der Unterschied
  zwischen an und aus ist die **Fläche**, nicht die Farbe — gefüllt heißt
  gesetzt.

  Dazu sagen beide im Vorbeigehen, was sie tun: aus `title` (das der Browser
  erst nach Sekunden und in Systemschrift zeigt) wurde `data-tooltip`, der
  Hinweiskasten des Trainers. Beim Haken steht ausdrücklich dabei: **„Das ist
  NICHT die Merkliste; die ist das Herz daneben.“**

---

## [1.230.0] - 2026-09-09

### Geändert
- **Die Merkliste hat jetzt einen Knopf in der Hauptansicht.** Dietmar: „Mit
  der Merkliste stimmt was nicht. Ich habe welche gespeichert und in der
  Hauptansicht, sind diese nicht zu sehen.“

  **Die gemerkten Fragen waren nie weg.** Nachgeprüft im laufenden Trainer:
  Sie stehen unter `amateurfunk_favorites_<Benutzer>` und überstehen den
  Wechsel des Prüfungsziels (N → E → N), das Neuladen der Seite, den
  Neustart des Servers und das Zurücksetzen des Zwischenspeichers — der
  Schlüssel steht in der Schutzliste. Auch der Zähler stimmte in jedem Test.

  Was fehlte, war der **Weg dorthin**. *Fehler* und *Lernbedarf* haben in
  der Hauptansicht je einen Knopf mit ihrer Zahl daneben; die Merkliste
  hatte nur ein kleines Herz oben in der Kopfzeile, rechts neben dem
  Suchfeld. Wer dort nicht hinsieht, findet sie nicht — und muss annehmen,
  das Gemerkte sei verloren. Das ist kein Bedienfehler, sondern ein Fehler
  der Anordnung: Drei gleichartige Listen, und eine davon steht woanders.

  Der neue Knopf steht zwischen *Lernbedarf* und *Auffrischen*, mit
  derselben Zahl und demselben Verhalten (blass, solange nichts gemerkt
  ist). Das Herz oben bleibt, wo es war.

- **Gemerktes außerhalb des Prüfungsziels wird jetzt erklärt.** Die Zahl
  zählt alle gemerkten Fragen, die Liste kann nur die aus dem geladenen
  Fragenpool zeigen. Wer auf Klasse N lernt und eine A-Frage gemerkt hat,
  sah bisher **3** am Knopf und zwei Zeilen in der Liste, ohne ein Wort
  dazu. Jetzt steht in der Kopfzeile der Liste: „2 Fragen · 1 weitere gehört
  nicht zum gewählten Prüfungsziel“.

---

## [1.229.3] - 2026-09-09

### Behoben
- **Die Hauptansicht im Vollbild: leere Fläche links, endloser Verlauf
  rechts.** Dietmar mit einem Foto: „bei vollbild stimmt jetzt was nicht.“

  Beides kam aus **einer** Zeile. Seit 1.224.0 ist die Karte mindestens
  fensterhoch, damit die Knopfleiste bei jeder Frage auf derselben Höhe
  sitzt. Diese Mindesthöhe galt aber **immer** — auch in der Hauptansicht,
  wo es gar keine Knopfleiste gibt, die etwas festhalten müsste.

  Die Folge war eine Kette: Die linke Spalte wurde auf Fensterhöhe gezogen,
  obwohl ihr Inhalt nach einem Drittel endet. `verlaufHoeheAngleichen()`
  misst genau diese Spalte und gibt dem Verlauf dieselbe Höhe — also stand
  rechts eine Liste über die ganze Seite, links nichts.

  **Im Vollbild fällt es auf, weil dort die Browserleisten wegfallen:**
  100vh sind gut zweihundert Punkte mehr als sonst. Im Fenster war der
  Fehler kleiner und deshalb nie aufgefallen.

  Die Kette hängt jetzt an einer Marke `runde-laeuft`, die
  `updateVisibility()` setzt — der einzige Ort, an dem zwischen Runde und
  Hauptansicht zuverlässig umgeschaltet wird. In der Hauptansicht ist die
  Karte so hoch wie ihr Inhalt.

**Gemessen** bei 1920 × 1080 (Vollbild):

| | vorher | jetzt |
|---|---|---|
| Karte im Hauptmenü | 1042 px | **951 px** |
| Verlauf-Höhe | 684 px | **496 px** (= linke Spalte) |

  In der Runde bleibt alles wie gehabt: Karte fensterhoch, Knopfleiste bei
  jeder Frage auf derselben Höhe. Geprüft bei 1920 × 1080, 1400 × 900 und
  1366 × 660, jeweils Hauptansicht → Runde → zurück.

---

## [1.229.2] - 2026-09-09

### Behoben
- **Das Zucken beim Weiterblättern.** Dietmar: „Bei weiter klicken, zieht es
  den Trainer kurz nach unten und danach wieder nach oben.“

  Zwei Ursachen, beide erst durch die letzten Fassungen scharf geworden.

  **1. Die Rollleiste des Browsers schaukelt sich auf.** Seit die Karte
  mindestens fensterhoch ist (1.224.0) und die Antwortfelder den Rest füllen
  (1.228.0), liegt die Seitenhöhe **genau auf der Fensterhöhe** — auf der
  Kippe. Wird eine Frage einen Punkt zu hoch, blendet der Browser die
  Rollleiste ein; die Seite wird dadurch **15 Punkte schmaler**, der Text
  bricht anders um und die Seite wird wieder niedriger — worauf die
  Rollleiste verschwindet, die Seite breiter wird und alles von vorn
  beginnt. Das ist das Rucken: eine Rückkopplung zwischen Höhe und Breite.

      html { scrollbar-gutter: stable; }

  hält den Platz für die Leiste immer frei. Ihr Kommen und Gehen kostet dann
  keine Breite mehr, und die Rückkopplung ist unterbrochen. Der Preis sind
  15 Punkte Rand, die man nicht bemerkt.

  **2. `scrollIntoView` rollte das ganze Fenster mit.** Nach jeder Frage
  wurde der aktuelle Punkt in der Verlaufsspalte sichtbar gemacht — mit
  `currentDot.scrollIntoView({ block: 'nearest' })`. Der Name klingt
  harmlos, aber die Funktion rollt **jeden rollbaren Vorfahren** mit, bis
  hinauf zum Fenster. Lag der Punkt weiter unten in der Spalte, zog sie die
  ganze Seite nach unten — weich, also gut sichtbar. `block: 'nearest'`
  hilft dagegen nicht: Es bestimmt, **wohin** gerollt wird, nicht **was**.

  Jetzt wird der Rollstand der Spalte selbst gesetzt, und nur, wenn der
  Punkt wirklich außerhalb liegt. Das Fenster bleibt, wo es ist.

  Am Programm ändert sich nichts weiter; die Knopfleiste steht wie bisher
  bei jeder Frage auf derselben Höhe.

---

## [1.229.1] - 2026-09-09

### Behoben
- **Der Antworttext war nie mitgewachsen — eine feste Angabe hat ihn
  festgehalten.** Dietmar mit einem Ausschnitt der vier Antwortfelder:
  „0,200 Ω usw.… die Antworten können gerne grösser sein.“

  Das war kein Wunsch nach noch mehr, sondern ein **Fehler von mir**. In der
  CSS stand seit jeher

      .option-text { font-size: 0.9rem; }

  also 14,4 px, fest. 1.227.0 und 1.229.0 haben `.option` vergrößert — aber
  `.option-text` ist die speziellere Regel und blieb, wo sie war.
  **Gewachsen ist dadurch nur der Buchstabe davor**, der die Größe des
  Feldes erbt. Genau das zeigt sein Ausschnitt: „A:“ groß, „0,200 Ω“ klein
  daneben. Zwei Fassungen lang habe ich an einer Schraube gedreht, die
  nichts bewegte.

      .option-text { font-size: inherit; }

  Dasselbe bei den Bildantworten (`.option-grid .option-text`, 0,8 rem).

| | angezeigt bis jetzt | **jetzt** |
|---|---|---|
| Antworttext | 14,4 px | **19,5 px** (+36 %) |
| Fragetext | 20,8 px | 19,8 px |

  **Der Fragetext geht dabei um einen Punkt zurück, und das mit Absicht.**
  Bei der längsten Frage des Katalogs (VD707) stand die Knopfleiste mit den
  ehrlichen 20,5 px auf einem 1915 × 950-Fenster bei y = 967 — **17 Punkte
  unter dem Rand**, man hätte für *Weiter* scrollen müssen. Mit 19,8 / 19,5
  sitzt sie bei y = 918. Gemessen wurde für jeden Wert einzeln; das ist das
  größte Paar, bei dem auch die längste Frage überall vollständig steht.

  **Geprüft**: 1915 × 950 → Leiste bei 918, 1400 × 900 → 784, 1366 × 660 →
  657 (Fenster 660). Kein Quer-Überlauf.

---

## [1.229.0] - 2026-09-09

### Geändert
- **Größere Felder, größerer Text.** Dietmar in vier Worten: „Grössere Felder
  = grösserer Text.“

  Stimmt — in einem 90 Punkte hohen Feld sah eine Antwort in 17,9 px verloren
  aus. Die Felder waren gewachsen, die Schrift darin nicht; das Verhältnis
  stimmte nicht mehr.

| | 1.227.0 | 1.228.0 | **jetzt** |
|---|---|---|---|
| Fragetext | 19,5 px | 19,5 px | **20,8 px** |
| Antworttext | 17,9 px | 17,9 px | **20,5 px** |

  Die Antworten stehen jetzt **fast so groß wie die Frage** — und das ist
  Absicht: Die Frage hebt sich ohnehin ab, sie steht fett und auf grauem
  Grund. Ein Größenunterschied obendrauf war Gewohnheit, keine Notwendigkeit.
  Auf einer Prüfung liest man die vier Antworten öfter als die Frage.

  **Gemessen** bei 1915 × 950, 1400 × 900, 1366 × 660 und 900 × 700. Nur bei
  der längsten Frage des Katalogs (VD707, vier lange Antworten) reicht die
  Seite etwa 70 Punkte über den Rand — die Knopfleiste bleibt dabei sichtbar,
  unter dem Rand liegt nur die Fußzeile.

---

## [1.228.0] - 2026-09-09

### Geändert
- **Der leere Bereich unter der Frage gehört jetzt den Antwortfeldern.**
  Dietmar nach der größeren Schrift: „Viel hat sich da nichts getan.“

  Er hat recht — und ich hatte die falsche Stelle angefasst. Der Eindruck
  kam nicht von der Schriftgröße, sondern von der **weißen Fläche zwischen
  der letzten Antwort und der Knopfleiste**: auf seinem Fenster gut
  zweihundert Punkte, die nichts tun. Größere Schrift füllt davon fast
  nichts.

  Diese Fläche gibt es seit 1.224.0 mit Absicht — sie hält die Knopfleiste
  bei jeder Frage auf derselben Höhe. **Sie musste also nicht verschwinden,
  sie musste nur woandershin:** an die Antwortfelder statt unter sie. Beides
  geht zugleich, und die Knöpfe stehen weiter an derselben Stelle.

| 1400 × 900 | Feldhöhe vorher | jetzt |
|---|---|---|
| kurze Antworten (NA210) | 44 px | **94 px** |
| mittlere (NI401) | 44 px | **88 px** |
| lange, zweizeilig (VD707) | 66 px | **70 px** |

  Wo der Platz knapp ist, ändert sich nichts: Auf 1366 × 660 bleiben es
  45 px, auf 900 × 700 die natürliche Höhe. Verteilt wird nur, was übrig
  ist.

  **Vier Glieder mussten dafür zusammenspielen**, nicht eines:
  `#questionContainer` → `.main-layout` → `.question-area` → `.options`.
  Fehlt eines, landet der Platz wieder am falschen Ende — genau das war in
  1.224.0 schon einmal passiert. `.main-layout` stand außerdem auf
  `align-items: flex-start`; damit blieb die Zeile so hoch wie ihr Inhalt.

  Die Felder wachsen einzeln (`flex: 1 1 auto`), behalten aber ihre
  natürliche Grundhöhe: Eine Antwort mit zwei Zeilen wird nicht auf die Höhe
  einer einzeiligen gedrückt. Abgeschnitten wird nichts.

---

## [1.227.0] - 2026-09-09

### Geändert
- **Frage und Antworten stehen rund 20 Prozent größer.** Dietmar: „Könnte
  man die Fragen und Antworten nicht etwas größer darstellen? Ziel: Dass der
  Platz besser ausgenutzt wird.“

  Er hat recht, und der Grund liegt in der Herkunft dieser Werte. Sie sind
  im September aus einem Bildschirmfoto des DARC-Fragenkatalogs **abgemessen**
  — 34 px Feldhöhe, 16 px Fragetext — und das war die richtige Entscheidung,
  solange es ums Aussehen ging. Nur: Dort stehen **zwanzig Fragen
  untereinander** auf einer Seite. Hier steht **immer nur eine**, auf einem
  Fenster von 900 Punkten Höhe. Was dort dichte Übersicht war, ist hier
  verschenkter Platz.

| | vorher | jetzt |
|---|---|---|
| Fragetext | 16,0 px | **19,5 px** |
| Antworttext | 15,2 px | **17,9 px** |
| Feldhöhe | 34 px | **44 px** |
| Abstand der Felder | 8 px | **10 px** |
| Fragennummer | 13,1 px | **14,7 px** |

  Warum nicht mehr? Bei der längsten Frage des Katalogs (VD707, vier lange
  Antworten) reicht die Seite auf einem 15-Zoll-Fenster (1366 × 660) schon
  jetzt 41 Punkte über den Rand. Ein weiterer Schritt hieße: rollen bei jeder
  zweiten Frage.

- **Auf schmalen Fenstern bleibt es kleiner** — bis 1024 Punkte Breite gelten
  17,3 px / 16,0 px und 40 px Feldhöhe. Dort ist der Platz eben nicht da.

  **Diese Zeilen mussten hinter die Regeln des DARC-Stils wandern.** Erst
  standen sie im 1024er-Block weiter oben und bewirkten **gar nichts**:
  `body.eckig .question-area .option` hat dieselbe Spezifität, und bei
  Gleichstand gewinnt die spätere Regel. Gemessen: Der Fragetext blieb auch
  auf 420 Punkten Breite bei 19,5 px. Jetzt sind es dort 17,3 px.

**Gemessen** bei 1915 × 950, 1440 × 900, 1366 × 660, 900 × 700 und 420 × 760.
Die Knopfleiste sitzt weiter bei jeder Frage auf derselben Höhe (das ist
1.224.0), kein Quer-Überlauf.

---

## [1.226.3] - 2026-09-09

### Geändert
- **Das Türkis in der Wortmarke wird kräftiger.** Dietmar: „In der
  Hauptansicht, fehlt das kräftige Türkis, was wir auch im Icon verwenden.“

  Er hat recht — der Ton von 1.226.0 war zu brav. Ich hatte mit `#0a7a8b`
  auf Nummer sicher gespielt (5,0:1 auf Weiß), und dabei ging genau das
  verloren, was die Farbe ausmacht.

  Jetzt **`#0a9cb0`**: derselbe Ton, so hell wie es geht, ohne die
  Lesbarkeit aufzugeben. Die Wortmarke ist 1,5 rem fett, gilt also als
  **große Schrift** — dafür verlangt man 3:1, und der Ton hat 3,3:1.

  Das Türkis des Zeichens selbst (`#22e0f2`) geht hier nicht: Es liegt dort
  auf Dunkelblau, hier steht es auf Weiß und käme auf **1,6:1**. Das liest
  fast niemand mehr.

  **Eine Stelle brauchte einen Rückfall:** Im engen Fenster schrumpft die
  Wortmarke auf 1,15 rem und 1,1 rem — dann gilt nicht mehr „große Schrift“,
  sondern die Regel für Fließtext mit 4,5:1. Dort schaltet je eine Zeile auf
  den dunkleren Ton zurück, sonst wäre die Farbe ausgerechnet auf dem
  schmalen Schirm die schlechter lesbare. In der dunklen Fassung bleibt es
  bei `#35dff0`, dem hellen vom Zeichen (9,6:1).

  **Gemessen** in der laufenden Anwendung: 1400 Punkte breit → 24 px,
  `rgb(10,156,176)`; 900 → 18,4 px, dunklerer Ton; 420 → 17,6 px, dunklerer
  Ton; dunkle Fassung → `rgb(53,223,240)`.

---

## [1.226.2] - 2026-09-09

### Geändert
- **Das Zeichen in seiner endgültigen Form: Skala, und die 55 in Weiß.**
  Dietmar nach fünf Vorschlägen: „Entferne den Edelstahl Look und mache die
  55 einfach weiss. Das mit der Skala gefällt mir gut.“

  Beides ist die bessere Wahl, und zwar aus demselben Grund. Der
  Edelstahl-Verlauf war der Anlass des Strichs, den er gesehen hatte — eine
  dunkle Stufe, die zufällig auf der Höhe der Wellenlinie lag. **Wo kein
  Verlauf ist, kann auch keine Stufe irgendwo hinfallen.** Und eine weiße
  Zahl bleibt auf 16 Punkten lesbar, wo ein Verlauf zu Grau verrührt. Der
  türkise Schein bleibt: Er bindet die Zahl an die Farbe der Tafel und hebt
  sie zugleich vom dunklen Grund ab.

  Die **Skala** unter der Zahl ist die eines S-Meters — lange Striche für
  die vollen Werte, kurze dazwischen. Sie erdet die Zahl, statt sie schweben
  zu lassen, und ist das Einzige auf der Tafel, das ohne Worte „Messgerät“
  sagt.

  **Zwei Maße mussten dafür nachgezogen werden**, sonst hätte es nicht
  zusammengepasst: Die Ausschläge der Welle sind von 2,1 auf 1,6 gedeckelt —
  eine Spitze reichte bis in die Teilstriche hinunter und sah aus, als hänge
  die Welle darin. Und die obere Gruppe ist um drei Prozent der Höhe
  gerutscht, damit über der Zahl so viel Luft steht wie zwischen Skala und
  Wortmarke; vorher kippte die Tafel optisch nach oben.

  Wieder nur Bilddateien und der Bauplan `zeichen_bauen.py`. Am Programm
  nichts.

---

## [1.226.1] - 2026-09-09

### Behoben
- **Der Strich, der durch die 55 zu laufen schien.** Dietmar: „Der Stich, auf
  dem die Funkwellen laufen, geht auch durch die 55 und wirft da einen
  Schatten.“

  Er sieht richtig, die Ursache lag aber woanders, als es aussieht: Die
  Grundlinie der Wellen hört links und rechts **vor** der Zahl auf, es lief
  also nichts hindurch. Was er sah, war die dunkle Stufe **im
  Edelstahl-Verlauf** — sie saß bei 47 Prozent der Zahlenhöhe, also genau auf
  der Höhe der Wellenlinie. Zwei völlig verschiedene Dinge auf einer Linie
  liest das Auge als eines, und dann ist es ein Strich mit Schatten.

  Die Stufe sitzt jetzt bei 62 Prozent, deutlich unter der Welle. Das Metall
  behält seine harte Kante — sie ist es, die poliertes Metall von grauer
  Farbe unterscheidet —, sie steht nur nicht mehr in einer Flucht mit etwas
  anderem.

  Nur die Bilddateien ändern sich (`icon-512.png`, `icon-192.png`,
  `icon.png`, `icon.ico`, `favicon.ico`, `icon-512-maskierbar.png`) und der
  Bauplan `zeichen_bauen.py`. Am Programm selbst nichts.

---

## [1.226.0] - 2026-09-09

### Geändert
- **Ein neues Zeichen.** Dietmar hatte das Symbol einer fremden Funk-App
  danebengelegt: „Das mit den Funkwellen rechts und Links gefällt mir gut.
  Ebenso auch die Farbe. Dazwischen ist ein VFO Knopf. Der muss raus und 55
  muss da rein. Da wo RigOne steht, möchte ich Amateurfunk und darunter
  ---Trainer---“

  **Übernommen ist nur, was ihm gefiel und was niemandem gehört:** eine
  Wellenlinie und ein Türkis auf dunklem Grund. Der Drehknopf, die Wortmarke
  und die Beschriftung der Vorlage bleiben draußen — das ist die Arbeit
  anderer Leute, und ein Zeichen, das an ein fremdes erinnert, wäre für ein
  Programm, das unter eigenem Namen läuft, das schlechteste Aushängeschild.
  Gezeichnet ist alles neu, mit einem Skript (`zeichen_bauen.py`), das
  mitgeliefert wird: Wer es später ändern will, soll nicht raten müssen.

  Die **55** steht in der Mitte, wo vorher der Knopf war. Sie bleibt aus dem
  alten Zeichen — unter Funkern heißt sie „viel Erfolg“, und sie ist das
  Einzige, was auf der Taskleiste in 16 Punkten noch zu erkennen ist.

- **Die 55 in poliertem Edelstahl.** Dietmar: „Die 55 auch in so einem
  pollierten Edelstahl look?“

  Poliertes Metall erkennt das Auge nicht an der Farbe, sondern an den
  **harten Kanten zwischen hell und dunkel**: Es spiegelt den hellen Himmel
  und den dunklen Boden, und dazwischen springt es um. Ein weicher
  Grauverlauf sieht nach Plastik aus. Der Verlauf hat deshalb zehn
  Stützpunkte, die dicht beieinander stark springen, dazu einen Lichtsaum an
  der Oberkante und eine dunkle Kante außen herum — ohne die verschwimmt
  helles Metall mit dem türkisen Schein dahinter.

- **Drei Fassungen statt einer.** Je kleiner die Fläche, desto weniger darf
  darauf stehen. Ab 128 Punkten das ganze Zeichen; von 48 bis 96 nur Wellen
  und Zahl; bis 32 Punkte nur die Zahl, dafür größer. In 16 Punkten wäre von
  „Amateurfunk“ ein grauer Streifen und von den Wellen ein Gekrissel, das
  die Zahl unleserlich macht.

  Dazu neu: **`icon-512-maskierbar.png`** für den Startbildschirm am Handy.
  Android schneidet dieses Bild in die Form, die das Gerät benutzt — Kreis,
  Squircle, Tropfen. Bisher zeigte das Verzeichnis dafür auf das normale
  Zeichen, dessen Schrift dabei angeschnitten worden wäre. Die neue Fassung
  hat Farbe bis in jede Ecke und nur die Zahl, klein genug für jede Form.

- **Die Wortmarke trägt die Farbe des Zeichens.** Dietmar: „In der
  Hauptansicht muss sich das auch ändern. Amateurfunk-Trainer und Trainer in
  dieser Farbe von dem Icon.“ Der Teil *-Trainer* stand bisher in einem
  matten Grau (`#7a8ba1`).

  Auf dem Zeichen liegt das Türkis auf Dunkelblau und darf dort hell sein
  (`#22e0f2`). Im Kopf der Hauptansicht steht es auf Weiß — dasselbe Hell
  hätte dort **1,7:1** und wäre für viele nicht mehr zu lesen. Es ist
  deshalb derselbe Ton, so weit abgedunkelt, dass er **5,0:1** erreicht
  (`#0a7a8b`). In der dunklen Fassung wird wieder das helle daraus
  (`#35dff0`, 9,6:1). Die Farbe steht als `--tuerkis` an einer Stelle.

- **Der Zwischenspeicher heißt jetzt `afu-trainer-v2`.** Das ist die einzige
  Stelle, an der man einem Browser sagen kann, dass er die alten Zeichen
  wegwerfen soll — beim Aktivieren löscht der Service Worker jeden Speicher,
  der nicht so heißt.

**Achtung:** In dieser Fassung ändert sich auch `Server.js` (die neue
Bilddatei muss ausgeliefert werden). Dafür ist ein **Neustart** nötig, F5
allein genügt nicht.

---

## [1.225.0] - 2026-09-09

### Geändert
- **Die drei Lernkacheln stehen jetzt nebeneinander, nicht zwei oben und
  eine darunter.** Dietmar: „Das neue Feld wirkt jetzt asynchron. Ich würde
  es besser finden wenn da das Omega Zeichen mit dabei ist und alles in
  einer Reihe ist.“

  Er hat recht, und der Grund ist nicht Geschmack: Eine angebrochene zweite
  Zeile zieht den Blick auf sich, als fehle dort etwas. Ich hatte den Umbruch
  vorsorglich eingebaut, weil drei Kacheln schmaler werden — die Sorge war
  unbegründet. Gemessen bei 1915 × 950 sind es **350 Punkte je Kachel**, bei
  1366 noch 250; beide Beschriftungen bleiben lesbar. Unter 1150 Punkten
  stehen sie untereinander, jede in voller Breite, statt zu dritt auf
  Buchstabenreste gedrückt.

- **Das Omega auch beim Lösungsweg — und die Beschriftung kürzer.** Dietmar:
  „Den Bereich kürzen und 50Ω (Zeichen) den Punkt und Lösungsweg.“

  Vorher stand auf der Lösungsweg-Kachel ein Wurzelzeichen. Es meinte
  „gerechnet“, sagte aber nichts darüber, woher die Seite kommt. Jetzt tragen
  beide DARC-Kacheln dasselbe Ω: Wer es einmal zugeordnet hat, erkennt die
  Herkunft, ohne zu lesen.

  Aus *50 Ohm ·* wurde **50Ω ·**, aus *Lösungsweg · NB505* wurde
  **50Ω · Lösungsweg** — die Fragenummer steht zwei Zeilen darüber schon, und
  die gesparte Breite ist genau die, die die dritte Kachel braucht.

- **Die Herkunftszeile wird zusammengezogen.** Zwei der drei Kacheln kommen
  von 50ohm.de. „50ohm.de (DARC)“ steht deshalb **einmal, mittig unter
  beiden**, statt zweimal direkt nebeneinander. Der Trainer rechnet die
  Spaltenbreiten dafür selbst aus (1fr 2fr) — und zwar aus den Kacheln, die
  wirklich da sind, nicht aus einer Annahme.

- **Ohne Lösungsweg bleibt alles wie gewohnt.** Dietmar: „Wenn kein
  Lösungsweg vorhanden ist, soll das wie gewohnt angezeigt werden.“ Geprüft:
  Bei zwei Kacheln teilen sie sich die Zeile weiterhin je zur Hälfte, jede
  mit ihrer eigenen Herkunftszeile darunter; bei einer nimmt sie die ganze
  Breite. Die dreispaltige Aufteilung greift nur, wenn wirklich drei Kacheln
  da sind.

**Geprüft** bei 1915 × 950, 1440 × 900, 1366 × 660, 1100 × 800 und 390 × 780 —
kein Quer-Überlauf, keine Fehler in der Konsole, alle drei Kacheln auf
derselben Höhe.

---

## [1.224.0] - 2026-09-09

### Geändert
- **Die Knopfleiste steht jetzt immer an derselben Stelle.** Dietmar: „Bei
  den Einstellungen haben wir die Fenstergröße schon angepasst. Ich möchte
  das auch bei den Fragen. Wenn eine Frage kürzer ist, soll dazwischen in
  der Fensterfarbe ein Leerraum hinzugefügt werden. Ziel ist es: Der Bereich
  soll immer auf gleicher Höhe sitzen.“

  Bisher hingen *Zurück*, *Weiter*, *Hauptmenü* und die Fußzeile am unteren
  Ende des Inhalts. Bei einer kurzen Frage rutschten sie hoch, bei einer
  langen runter — **um fast hundert Punkte**. Wer zwanzig Fragen durchgeht,
  trifft *Weiter* deshalb jedes Mal woanders und klickt daneben.

  Die Karte ist jetzt eine Spalte, die mindestens so hoch ist wie das
  Fenster; der Fragenbereich darin nimmt sich den übrigen Platz. Weil er die
  Farbe der Karte hat, sieht man davon nichts als ruhigen Grund. Ist der
  Inhalt länger als das Fenster, wächst die Karte wie zuvor — es ist eine
  Mindesthöhe, keine feste.

  **Drei Stellen mussten dafür zusammenspielen**, nicht eine: Der
  Fragenbereich liegt zwei Ebenen tiefer als die Karte
  (`.card` → `.app-layout` → `.main-col` → `#questionContainer`). Nach der
  ersten Änderung war die Karte zwar bildschirmhoch, die Leiste wanderte
  aber weiter — der zusätzliche Platz landete unter der Spalte statt in ihr.

**Gemessen** (1915 × 950, dieselbe Fläche wie am Arbeitsplatz):

| Frage | Knopfleiste vorher | jetzt |
|---|---|---|
| kürzeste (NA210) | y = 585 | **y = 794** |
| mittlere (ND104) | y = 608 | **y = 794** |
| längste (VE305) | y = 676 | **y = 794** |

Geprüft außerdem: Hauptmenü, 15-Zoll-Fenster (1366 × 660), Handy
(390 × 780), sehr flaches Fenster (1200 × 420). Überall bleibt der Inhalt
vollständig erreichbar; wo er länger ist als das Fenster, wird gescrollt wie
zuvor.

---

## [1.223.0] - 2026-09-09

### Behoben
- **Die Route stand im falschen Block — der eigentliche Grund für drei
  vergebliche Neustarts.** `app.post('/api/50ohm-index-holen', …)` war
  versehentlich **innerhalb von `io.on('connection', …)`** gelandet, also im
  Socket-Handler des Gruppenraums. Damit wurde sie erst angemeldet, wenn
  sich jemand über einen Raum verband — und danach bei jeder weiteren
  Verbindung noch einmal. Wer den Gruppenraum nie öffnete, bekam auf den
  Knopf nur „Not found“.

  Dietmar hat dreimal neu gestartet, `STOP.bat` benutzt und den Task-Manager
  bemüht, bevor `/api/version` die Sache entschied: `serverStart` zeigte
  09:22 Uhr, Version 1.222.3 — sein Server war längst der neue. Der Fehler
  lag bei mir, nicht bei seinem Neustart.

  Routen gehören auf die oberste Ebene, wo sie einmal beim Start angemeldet
  werden. Dort steht sie jetzt, mit einem Kommentar, der erklärt warum.

### Geändert
- **Der Server holt die Zuordnung von selbst.** Dietmar: „Der Server, soll
  das eigentlich im Hintergrund machen, ohne Einstellungen.“

  Er hat recht: Wer den Trainer benutzt, soll die Lösungswege vorfinden und
  nicht erst in den Einstellungen danach suchen. Ein Knopf, den man erst
  kennen muss, ist für die meisten kein Angebot.

  Drei Regeln, damit daraus keine Zumutung wird:

  1. **Nur wenn nötig** — fehlt die Datei oder ist sie älter als 30 Tage.
     Bei jedem Start nachzufragen hieße, einem Verein, der uns nichts
     schuldet, jede Sitzung eine Anfrage zu schicken.
  2. **Nicht beim Hochfahren** — erst acht Sekunden nach dem Start, damit
     der Trainer sofort da ist.
  3. **Still** — Fehler stehen im Log, nicht auf dem Bildschirm. Ohne Netz
     läuft der Trainer vollständig.

  Der Browser fasst zwölf Sekunden nach dem Laden einmal nach, falls die
  Datei beim ersten Blick noch nicht da war — sonst müsste man bis zum
  nächsten Start warten, um die Lösungswege zu sehen.

  Der Knopf unter *Wartung* bleibt zum sofortigen Auffrischen. Die Zusage
  in der README — „ins Internet geht er nur, wenn Sie …“ — ist um diesen
  einen Fall erweitert und dort auch so aufgeschrieben. Eine Zusage, die
  nicht mehr stimmt, wäre schlimmer als die Sache selbst.

---

## [1.222.3] - 2026-09-09

### Behoben
- **Eine Fehlermeldung, die in die falsche Richtung zeigte.** Dietmar beim
  ersten Klick auf „Zuordnung holen“:

  > Nicht geholt: Unexpected token 'N', "Not found" is not valid JSON
  > Kein Netz, oder 50ohm.de ist gerade nicht erreichbar.

  Beide Zeilen waren irreführend. Die erste ist der Wortlaut des Browsers,
  der eine Antwort als JSON lesen wollte, die keines war. Die zweite war
  mein Ratschlag — und schickte zur Fehlersuche ins Internet, während das
  Problem einen Meter näher lag: **Sein eigener Server lief noch mit der
  alten `Server.js`** und kannte den Weg `/api/50ohm-index-holen` schlicht
  noch nicht. Darauf antwortet Express mit „Not found“.

  Der Trainer liest die Antwort jetzt erst als Text und macht dann JSON
  daraus. Kommt ein 404 oder ein „Not found“ vom eigenen Server, steht dort
  der Satz, der wirklich hilft: **Der Trainer muss einmal komplett neu
  gestartet werden** — schließen und wieder öffnen, nicht nur die Seite neu
  laden. `Server.js` wird nur beim Start gelesen.

  Das war schon oft der wahre Grund, wenn nach einem Update „nichts
  passiert“. Diesmal sagt es der Trainer selbst.

---

## [1.222.2] - 2026-09-09

### Behoben
- **Eine falsche Behauptung im Trainer zurückgenommen.** In 1.222.1 stand
  im Wartungs-Kasten und in der README, der DARC veröffentliche die
  Lösungswege „bisher nur für die Fragen der Klasse A“.

  **Das stimmt nicht.** Die Datei `question_index.json` war über ein
  Werkzeug abgerufen worden, das lange Dateien abschneidet — die Antwort
  endete bei `AF116` und enthielt deshalb nur A-Nummern. Erst der Hinweis
  „the file appears incomplete“ in derselben Antwort machte stutzig.

  Die Gegenprobe an einer echten Klasse-N-Rechenaufgabe:
  **`50ohm.de/NB505.html` existiert** — „Zur Berechnung des Widerstands
  verwenden wir das Ohmsche Gesetz aus der Formelsammlung“, R = U/I, mit
  eingesetzten Werten. Es gibt also sehr wohl Lösungswege für Klasse N.

  Der Trainer sagt jetzt nur noch, was er wirklich weiß: dass es nicht zu
  jeder Frage einen gerechneten Lösungsweg gibt — wo nichts zu rechnen ist,
  wäre er auch sinnlos. Die genaue Zahl für das eigene Prüfungsziel steht
  nach dem Holen im Wartungs-Kasten; sie kommt aus der vollständigen Datei,
  die der Server selbst holt und für die kein solches Limit gilt.

  Dass `NA101` und `VA101` keine Seite haben, bleibt richtig — es war nur
  keine Aussage über die ganze Klasse.

---

## [1.222.1] - 2026-09-09

### Geändert
- **Der Wartungs-Kasten sagt jetzt, wie viele Lösungswege das eigene
  Prüfungsziel betreffen.** Dietmar nach dem Einbau: „Bei wie vielen Fragen
  ist das mit drin? Ich bin eben viele Fragen durch und habe nichts
  gefunden.“

  Zwei Gründe, und beide waren aus dem Trainer heraus nicht zu erkennen:

  **Erstens** war die Zuordnung noch gar nicht geholt — ohne den einen
  Klick unter *Wartung* gibt es nichts anzuzeigen.

  **Zweitens, und das ist der eigentliche Punkt:** Die Datei des DARC
  enthält 516 Einträge, davon 358 mit Lösungsweg — **und alle beginnen mit
  A**. Für die Fragen der Klassen N und E gibt es dort bisher nichts. Wer
  auf Klasse N lernt, hätte auch nach dem Holen keinen einzigen Lösungsweg
  gesehen und den Trainer für kaputt gehalten.

  Der Kasten nennt deshalb nicht mehr nur die Gesamtzahl, sondern **wie
  viele davon zum eingestellten Ziel gehören** — und sagt es ausdrücklich,
  wenn es keine sind. Eine Funktion, die stillschweigend nichts tut, ist
  schlimmer als eine, die erklärt, warum.

  (Das erklärt auch die Stichproben von vorhin rückwirkend vollständig:
  AB101 und AB102 sind Fragen der Klasse A, NA101, EB101 und VA101 nicht.)

---

## [1.222.0] - 2026-09-09

### Hinzugefügt
- **Der gerechnete Lösungsweg beim DARC — an jeder Frage, die einen hat.**
  Dietmar nach einem Gespräch mit einem Entwickler von 50ohm.de: „Diesen
  Lösungsweg gibt es für alle Fragen. Hier ändert sich nur die Nr. hinten
  dran. Könnte man das mit Intigieren? **Ziel ist es, das man nicht nur
  auswendig lernt, sondern auch was lernt.**“

  Die Adresse ist denkbar einfach: `https://50ohm.de/<Nummer>.html`. Dort
  steht kein Ergebnis, sondern die Herleitung — Formel, gegebene Werte,
  Rechenschritte.

  **Es gibt sie aber nicht für jede Frage.** Nachgesehen: AB101 und AB102
  ja, NA101, EB101 und VA101 nein — obwohl NA101 ebenfalls eine
  Rechenaufgabe ist. Dietmar sah die Falle sofort: „Man müsste dafür
  vermutlich einen Generator entwickeln, der alle Fragen abfragt … Nicht
  das es am Ende auf 404 läuft.“

  Ich hatte diesen Generator schon geschrieben — 1750 Anfragen an einen
  Server, der uns nichts schuldet, gut zehn Minuten Laufzeit. Dann kam
  Dietmars nächste Nachricht mit der Adresse, die alles überflüssig machte:

  ```
  https://50ohm.de/assets/question_index.json
  ```

  Darin steht je Fragennummer, in welchem **Kapitel und Abschnitt** sie
  behandelt wird und ob es einen Lösungsweg gibt (`has_solution`). Der
  Generator wurde wieder gelöscht, bevor er je gelaufen ist.

- **Der Lehrgangs-Verweis führt endlich auf den genauen Abschnitt.** In
  `50ohm_map.json` steht seit Monaten der Satz: *„Der Link führt auf die
  KAPITELÜBERSICHT, nicht auf die genaue Unterseite — dafür braucht es die
  Liste des DARC. Sobald die da ist, ersetzt sie diese Datei
  vollständig.“* Sie ist jetzt da.

  Aus `section` und der Ausgabe lässt sich die Seite bilden:
  `https://50ohm.de/N_sinusschwingung.html` — nachgesehen, existiert.
  **Welche Ausgabe genommen wird, richtet sich nach dem Prüfungsziel:** Wer
  auf N lernt, bekommt die N-Fassung des Kapitels und nicht die für
  Klasse A — dieselbe Erklärung, aber in der Tiefe, die zu seiner Prüfung
  gehört.

  Fehlt die Datei, bleibt alles beim Alten: Der Verweis führt wie bisher
  aufs Kapitel, und Lösungswege werden nicht angeboten.

- **Geholt wird sie unter Einstellungen → Wartung → Lehrgang des DARC.**
  Einmal, rund 200 Kilobyte, danach nie wieder. **Nur auf Klick** — die
  Zusage „ins Internet geht der Trainer nur, wenn Sie es wollen“ steht in
  der README und gilt auch hier.

  Übernommen wird dabei nur, was gebraucht wird, und nur, was wie eine
  Fragennummer aussieht. Fremde Daten wandern nicht ungeprüft in eine
  Datei, die der Trainer später selbst ausliefert.

  Wer den Trainer aus dem Gruppenraum mitnimmt, bekommt die Datei mit —
  sonst müsste jeder Teilnehmer sie einzeln holen.

**Nachgesehen am 09.09.2026:**

| Adresse | Ergebnis |
|---|---|
| `50ohm.de/AB101.html` | Lösungsweg mit Formel und Rechenschritten ✔ |
| `50ohm.de/AB102.html` | ebenso ✔ |
| `50ohm.de/NA101.html` | 404 — obwohl Rechenaufgabe |
| `50ohm.de/EB101.html`, `VA101.html` | 404 |
| `50ohm.de/N_sinusschwingung.html` | Lehrgangsseite ✔ |
| `AB101` im Katalog Klasse A | identischer Wortlaut, identische Antwort ✔ |

---

## [1.221.1] - 2026-09-09

### Behoben
- **Die Stolpersteine in der Auswertung endeten mitten im Wort.** Dietmar:
  „Hier werden die Fragen abgeschnitten. … Nach Klasse, ist der Text nur
  noch Klas“.

  Genau darin lag der Fehler: Gekürzt wurde nach 88 **Zeichen**, nicht nach
  Wörtern. So endet der Satz nicht nur früh, er wird unlesbar — „…für
  Rufzeicheninhaber der Klas“ sagt niemandem etwas.

  Die Kürzung stammte aus der Zeit, als es von dort keinen Weg zur ganzen
  Frage gab. Seit es **Alle ansehen** gibt, ist sie überflüssig: Bei fünf
  Zeilen ist auch der volle Text kein Platzproblem, und umbrechen darf er.

---

## [1.221.0] - 2026-09-09

### Hinzugefügt
- **Stolpersteine markieren.** Dietmar: „Alle Stolpersteine möchte ich auch
  Markieren können.“

  Jede Zeile hat jetzt ein Herz. Genommen wird dafür die **vorhandene
  Merkliste** und keine zweite Auswahl daneben — nicht nur der
  Einheitlichkeit wegen: Die Merkliste lässt sich als eigene Lernrunde
  durchgehen. Wer sich hier sieben Fragen heraussucht, kann sie damit sofort
  am Stück üben, ohne dass dafür etwas Neues gebaut werden musste.

  Oben steht, wie viele der Stolpersteine markiert sind, und ein Knopf nimmt
  genau diese vor. Bewusst nicht die ganze Merkliste: Dort können auch
  Fragen aus der Suche liegen, die hier nichts zu suchen haben.

  Markierte Zeilen sind zart rosa hinterlegt — in einer Liste mit
  achtundfünfzig Einträgen findet man ein einzelnes Herz sonst nicht wieder.

  **Beim Umschalten wird nur die eine Zeile nachgezogen**, nicht die ganze
  Liste neu gebaut. Sonst zuckte die Liste bei jedem Klick, und die
  Bildlaufleiste spränge nach oben — ausgerechnet beim Markieren, wo man
  mehrere hintereinander anklickt.

### Behoben
- **Das Herz wäre bei manchen ein leeres Kästchen geworden.** Der erste Bau
  zeigte ungemerkte Fragen mit dem umrandeten Herz (`far fa-heart`). Diese
  Variante gibt es in Font Awesome zwar, sie steckt aber nicht in jeder
  Auslieferung — im Trainer kommt `far` an genau zwei Stellen vor, `fas` an
  267. Jetzt ist es immer das gefüllte Herz, und ob markiert oder nicht,
  sagt die Farbe: grau oder rot. Das sieht man aus zwei Metern noch, den
  Unterschied zwischen gefüllt und umrandet nicht.

**Gemessen:**

| Prüfung | Ergebnis |
|---|---|
| Drei markieren, Zahl im Kopf | 3 von 14 markiert ✔ |
| Im Speicher des Benutzers abgelegt | 3 ✔ |
| Merkliste-Anzeige in der Kopfzeile | zeigt 3 ✔ |
| Eines abwählen | 2 von 14 ✔ |
| „markierte üben“ startet die Runde | 2 Fragen ✔ |

---

## [1.220.1] - 2026-09-09

### Geändert
- **Das Fenster heißt jetzt nur noch „Auswertung“.** Dietmar: „Auswertung &
  Sicherung muss in Auswertung geändert werden.“ Richtig — die Sicherung ist
  seit 1.220.0 nicht mehr darin.

  Zwei weitere Stellen versprachen sie ebenfalls noch: der Tooltip am Knopf
  *Statistik* und der gesprochene Text dazu. Beide schickten damit zu einer
  Funktion, die dort nicht mehr zu finden ist. Sie nennen jetzt, was
  wirklich im Fenster steht — und wo der Lernstand stattdessen gesichert
  wird.

---

## [1.220.0] - 2026-09-09

### Hinzugefügt
- **„9 von 10 Prüfungen bestanden“ — mit Farbverlauf.** Dietmar: „Links
  würde ich mir wünschen: 10 von 10 Prüfungen. Wie viele man davon schaffen
  würde. … Bei Kritisch möchte ich Rot und im Mittelfeld möchte ich gelb.
  Ideal wäre es mit einem Farbverlauf.“

  Der Kasten sagte bisher, wie viele **Punkte** zu erwarten sind. Das ist
  ein Mittelwert — und Mittelwerte verschweigen das Zittern. Wer im Schnitt
  19,4 Punkte hat, besteht eben nicht immer: mal sind es 21, mal 17. Genau
  diese Streuung ist das, was vor der Prüfung interessiert.

  Gerechnet wird nicht mit einer Formel, sondern durch **Nachspielen**:
  zweitausend Mal wird eine komplette Prüfung gewürfelt. Je Teil werden 25
  Fragen aus dem Topf gezogen — ohne Zurücklegen, wie im echten Bogen — und
  für jede einzeln gewürfelt, mit *ihrer* Trefferwahrscheinlichkeit.
  Bestanden zählt nur, wenn **jeder** Teil auf 19 Punkte kommt; ein guter
  Teil rettet keinen schlechten.

  Warum nachspielen statt rechnen: Jede Frage hat eine eigene
  Wahrscheinlichkeit, und gezogen wird ohne Zurücklegen aus rund 200
  Fragen. Dafür gibt es keine handliche Formel — das Nachspielen dauert ein
  paar Millisekunden und trifft genau das, was passiert.

  **Der Balken trägt die Farbe seines Wertes**, nicht die einer Skala. Ein
  erster Versuch spannte den Verlauf Rot → Grün über die ganze Balkenbreite
  und ließ die Füllung einen Teil davon aufdecken. Das sah bei *neun von
  zehn* überwiegend rot aus, obwohl neun von zehn gut sind. Jetzt ist der
  Balken bei zwei von zehn rot, bei fünf gelb und bei neun grün — gleitend,
  gerechnet in HSL, weil ein direkter Weg von Rot nach Grün im RGB-Raum
  durch ein schmutziges Braun läuft.

  Die Schrift daneben ist dunkler als der Balken: Ein Gelb, das als Fläche
  kräftig wirkt, ist als Schrift auf Weiß nicht mehr zu lesen — und
  ausgerechnet im Mittelfeld, wo die Zahl am wichtigsten ist.

  Fehlen in einem Prüfungsteil noch Antworten, wird nicht geraten. Dann
  steht dort, **welcher** Teil fehlt und warum es ohne ihn keine
  Gesamtaussage gibt.

- **Alle Stolpersteine ansehen.** Dietmar: „Deine häufigsten Stolpersteine
  ist gut! Hier wünsche ich mir die Funktion das ich mir alle Stolpersteine
  ansehen kann.“

  Die fünf im Statistikfenster sind die Spitze des Eisbergs, und der Text
  ist dort auf 88 Zeichen gekürzt — genug, um die Frage zu erkennen, zu
  wenig, um sie zu beantworten. Der Knopf **Alle … ansehen** zeigt sie
  vollständig: ganzer Fragetext, die richtige Antwort darunter, Prüfungsteil
  und Zahl der Fehlversuche. Jede Zeile hat ein **Üben**, und oben lassen
  sich die **30 hartnäckigsten am Stück** vornehmen.

  Fragen, die inzwischen wieder sitzen, bleiben in der Liste — aber grün
  markiert und ans Ende sortiert. Sie sind ja der Beweis, dass es vorangeht.

### Entfernt
- **„Lernstand sichern“ aus dem Statistikfenster.** Dietmar: „Das ist in der
  Hauptansicht und auch im den Einstellungen schon vorhanden.“ Beides
  stimmt. Dreimal dasselbe an drei Orten heißt nur, dass man an keinem
  sicher ist, den richtigen zu haben.

  **Dabei wäre fast eine Rückmeldung verlorengegangen:** Das Hinweisfeld
  „Datei erstellt“ lebte in genau diesem Block. Von der Hauptansicht und aus
  den Einstellungen heraus hätte man ab jetzt geklickt und nicht gewusst, ob
  etwas passiert ist. Fehlt das Feld, kommt die Meldung nun als Fenster.

**Gemessen** (Lernstand künstlich gesetzt, drei Prüfungsteile):

| Trefferquote je Frage | Vorhersage |
|---|---|
| 97 % | 10 von 10 |
| 88 % | 9 von 10 |
| 78 % | 5 von 10 |
| 65 % | 1 von 10 |

Bei 78 % erwartet man 19,5 Punkte — knapp über der Grenze von 19. Dass
daraus nur etwa jede zweite Prüfung wird, ist genau der Punkt.

---

## [1.219.0] - 2026-09-09

### Geändert
- **Das Einstellungen-Fenster hat jetzt überall dieselbe Größe.** Dietmar:
  „Ich möchte unter Einstellungen eine Einheitliche Grösse von den Fenster.
  Die grösse von Benutzer passt.“

  Bisher wuchs das Fenster mit seinem Inhalt bis zu einer Obergrenze:
  *Benutzer* mit zehn Zeilen stieß an die 83 % der Fensterhöhe, *Update* mit
  zwei Kästen war nur halb so hoch. Jeder Reiterwechsel ließ das Fenster
  darum springen — und weil es mittig sitzt, wanderte dabei **auch die
  Reiterspalte** nach oben und unten. Der nächste Knopf war dann nicht mehr
  dort, wo eben noch geklickt wurde.

  Aus `max-height` wurde `height`. Der Wert bleibt bei 83 %: genau dort
  stand *Benutzer* bisher, und diese Größe hat er als passend bezeichnet.
  Gescrollt wird im Blatt rechts, die Reiterspalte steht still. Die
  Mindesthöhe von 380 Punkten im Blatt ist entfallen — sie war der Notbehelf
  gegen genau dieses Springen.

  Überschüssiger Platz bleibt bei kurzen Reitern unten leer. Das ist der
  Preis für ein Fenster, das stillsteht, und er ist es wert.

**Gemessen** (alle acht Reiter, drei Bildschirmgrößen):

| Prüfung | Ergebnis |
|---|---|
| Fensterhöhe über alle acht Reiter | 788 px, ein einziger Wert ✔ |
| Lage des Fensters beim Wechseln | unverändert ✔ |
| 15 Zoll (1366 × 660) | 548 px, alle Reiter sichtbar, Blatt scrollt ✔ |
| 17 Zoll (1600 × 790) | 656 px ✔ |
| Arbeitsfläche 1915 × 950 | 788 px ✔ |

---

## [1.218.0] - 2026-09-09

### Geändert
- **Aus „Merkblatt“ wird „Vor der Prüfung“.** Dietmar: „Der Name Merkblatt
  gefällt mir nicht. Ich denke, Lernhilfe ist besser.“ — *Lernhilfe* stünde
  im Reiter direkt neben *Lernen*, zwei ähnliche Wörter untereinander; seine
  Wahl fiel deshalb auf **Vor der Prüfung**. Das sagt nicht, was das Blatt
  ist, sondern wann man es braucht.

### Behoben
- **Bei Bildfragen stand kein Bild auf dem Blatt.** Dietmar: „Bildantwort –
  im Trainer ansehen (NI103) Ich möchte das Bild mit auf dem Merkblatt.“

  Er hat recht, und mein ursprünglicher Grund war falsch. Ich hatte
  argumentiert, ein einzelnes Antwortbild sage ohne die drei anderen daneben
  nichts. Bei diesen Fragen **ist das Bild aber die Antwort** — der
  Antworttext ist leer. Der Hinweis machte das Blatt an genau den Stellen
  wertlos, an denen es am meisten hilft: bei den Schaltbildern.

  Jetzt steht das Bild der richtigen Antwort auf dem Papier, groß genug zum
  Erkennen (bis 88 × 56 mm, weiß hinterlegt, weil die SVG durchsichtig sind).

  **Ein Bild wird dabei nicht doppelt gedruckt.** Bei Bildfragen heißt die
  richtige Antwort oft `<Nummer>.svg` — genau der zweite Name, unter dem auch
  ein Fragebild gesucht wird. Ohne die Prüfung stünde dasselbe Bild zweimal
  auf dem Blatt, einmal als Frage und einmal als Antwort.

**Gemessen** (NB401, NB702, NB703 — die drei Bildfragen der Klasse N):

| Prüfung | Ergebnis |
|---|---|
| Antwortbilder geladen und sichtbar | 3 von 3 ✔ |
| Fragebild nicht zusätzlich gedruckt | ✔ |
| Kein „im Trainer ansehen“ mehr auf dem Blatt | ✔ |

---

## [1.217.0] - 2026-09-09

### Hinzugefügt
- **Zehn Lernende statt drei — mit eigenem Prüfungsziel.** Dietmar:
  „Derzeit haben wir 3 Benutzer. Ich möchte die Anzahl auf 10 erweitern."
  Und: „Ein Beginner lernt auf Klasse N und ein E Lizensierter, übt auf die
  Klasse A. Die Klasse muss beim auswählen sich mit umstellen."

  Neuer Reiter **Einstellungen → Benutzer**: dort bekommt ein Platz einen
  Namen und ist damit angelegt. **In der Auswahlliste der Hauptansicht
  stehen nur die angelegten Plätze** — wer allein lernt, sieht weiterhin
  einen Eintrag und nicht zehn.

  **Das Prüfungsziel gehört jetzt zum Platz, nicht zum Rechner.** Bis
  hierher nahm ein Benutzerwechsel die Klasse des Vorgängers mit: Der
  Lernstand war getrennt, das Ziel nicht. In einem Ortsverband, wo
  Anfänger und Aufsteiger sich einen Rechner teilen, ist das genau
  verkehrt herum. Beim Wechsel wird der Fragenkatalog nachgezogen —
  *gemessen: Anna 571 Fragen (Klasse N), Clara 716 (E → A), und zurück.*

  **Ein Name löschen heißt nicht Lernstand löschen.** Fehler, Lernbedarf,
  Verlauf und Merkliste bleiben unter dem Schlüssel des Platzes liegen;
  wer denselben Namen wieder einträgt, findet alles vor. Das steht auch so
  im Fenster.

  Die riskanteste Stelle war eine andere: `['user1','user2','user3']` stand
  an **siebzehn Stellen** im Code, darunter in `preserveKeys` und
  `getAllLocalUserData`. Wäre auch nur eine übersehen worden, hätte der
  vierte Benutzer beim Sichern oder Zurücksetzen still seinen Lernstand
  verloren. Die Liste ist jetzt die **einzige** Stelle, an der die Zahl
  steht, und sie steht vor ihrer ersten Verwendung.

- **Dein persönliches Merkblatt — mit einem Kopf, der sagt, wo es hakt.**
  Dietmar: „Merkblatt für Wackelkanditaten klingt blöd. Dein persönliches
  Merkblatt klingt besser. … Wichtig ist dabei der Trainer selbst erkennt
  wo man noch schwächen hat. Und genau das muss auf dieses Blatt mit drauf."

  Oben auf dem Blatt steht jetzt **Wo du stehst**: Trefferquote je
  Prüfungsteil mit Balken, wie viele Fragen dort wackeln, wie viele noch
  nie dran waren — und ein Satz, der es benennt: *„Am meisten hakt es bei
  Vorschriften – 64 % richtig, 12 wacklige Fragen."*

  Wer im Hotel sitzt, hat den Trainer nicht dabei. Ohne diesen Kopf wäre
  das Blatt eine Fragenliste ohne Einordnung.

  Umgezogen ist es außerdem: aus der Statistik in den eigenen Reiter
  **Einstellungen → Merkblatt**.

- **Kursauswertungen aufheben und am Beamer durchgehen.** Dietmar:
  „Szenario: Wir üben Online über dem Internet und am nächsten OV VHS
  Abend, möchte ich als Trainer die Fragen über dem Beamer mit der Gruppe
  durchgehen."

  In der Auswertung gibt es **Für später sichern**; unter
  **Einstellungen → Kursauswertung** stehen die gesicherten Abende.
  Gespeichert wird im Browser des Gastgebers, nicht auf dem Server: Der
  Raum lebt nur, solange er läuft, und wird spätestens nach zwölf Stunden
  weggeräumt — zwischen Online-Abend und Kursabend liegen aber Tage.

  Die **Beamer-Ansicht** füllt den Bildschirm mit einer Frage. Darunter,
  einzeln aufzudecken: was die Gruppe mehrheitlich gewählt hat, und was
  richtig ist. So überlegt der Kurs erst selbst. Weiter mit Leertaste
  oder →, zurück mit ←, aufdecken mit ↓, Schluss mit Esc. Die Schriftgröße
  richtet sich nach der Länge des Fragetextes, damit auch eine lange Frage
  ins Bild passt.

  **Namen bleiben an der Wand aus.** Wer am Beamer steht, hat die Gruppe
  vor sich sitzen.

**Gemessen:**

| Prüfung | Ergebnis |
|---|---|
| Liste zeigt nur angelegte Plätze (user1, user4, user10) | ✔ |
| Lernstände der Plätze 4 und 10 getrennt | ✔ |
| Sichern erfasst alle zehn Plätze | ✔ |
| Name gelöscht → Platz weg, 6 Fragen Lernstand liegen noch | ✔ |
| Benutzerwechsel zieht den Fragenkatalog nach (571 ↔ 716) | ✔ |
| Merkblatt-Kopf: Quote, Wackler, nie geübt, schwächster Teil | ✔ |
| Kursabend sichern, ansehen, löschen | ✔ |
| Beamer: aufdecken, weiter, zurück, Esc | ✔ |

---

## [1.216.0] - 2026-09-09

### Hinzugefügt
- **Auswertung für den Kursleiter.** Dietmar am 09.09.2026, aus einer
  Ideenliste ausgewählt: „Kursleiter-Auswertung im Gruppenraum — welche
  Fragen hat die Gruppe falsch? Damit weiß ein OV- oder VHS-Leiter, was am
  nächsten Abend dran ist."

  Die Rangliste am Ende einer Runde beantwortet „wer war gut". Der neue
  Knopf **Auswertung** im Gruppenraum beantwortet die andere Frage: **was
  hat die Gruppe nicht verstanden** — und die beantwortet man nicht mit
  Punkten, sondern mit den Fragen selbst.

  Das Wertvollste daran ist nicht die Fehlerquote, sondern der **gemeinsame
  Irrtum**: Wenn sechs von acht dieselbe falsche Antwort wählen, ist das
  kein Streuverlust, sondern ein Denkfehler, den alle teilen — und genau
  der lässt sich am nächsten Abend geraderücken. Die Auswertung nennt ihn
  im Klartext („Meist gewählt: Contest Query, 3×") und stellt die richtige
  Antwort daneben.

  Dazu eine Zeile je Prüfungsteil, ein Vorschlag „Für den nächsten Abend"
  mit den Fragen, die mindestens zwei falsch hatten, und ein Ausdruck fürs
  Kursmappe.

  **Namen sind standardmäßig aus.** In einer VHS oder im Ortsverband sitzt
  niemand gern vor der Gruppe am Pranger, und für die Planung des nächsten
  Abends braucht man sie nicht. Ein Schalter blendet sie ein — wer einzeln
  helfen will, muss wissen, wem.

  **Nur der Gastgeber kommt daran**, serverseitig geprüft. Sonst könnte
  jeder Teilnehmer mitten in der Runde nachsehen, welche Antwort die
  richtige ist.

- **Merkblatt zum Ausdrucken.** Die eigenen **Wackelkandidaten** auf einem
  Blatt: Fragennummer, Frage, und darunter **nur die richtige Antwort**.

  Die drei falschen fehlen mit Absicht — dieselbe Regel wie beim Hörbuch.
  Wer auf der Fahrt zur Prüfung noch einmal quer liest, soll sich nichts
  Falsches einprägen; drei Ablenker auf dem Papier wären genau dafür die
  beste Gelegenheit. Zum Ankreuzen gibt es weiterhin den Prüfungsbogen.

  „Wackelkandidat" heißt: **schon einmal falsch gehabt und noch nicht
  sicher gemeistert.** Eine Frage, die man einmal daneben hatte und
  seitdem dreimal sicher konnte, gehört nicht mehr aufs Blatt — sie würde
  nur den Platz derer wegnehmen, die wirklich wackeln.

  Zu finden unter **Statistik**, mit Auswahl der Anzahl (10 bis alle) und
  des Prüfungsteils. Steht ein Prüfungstermin, rechnet der Kopf die
  verbleibenden Tage mit auf das Blatt.

### Behoben
- **Zwei Sorten Antworten im Gruppenraum, die keine Antworten sind.**
  Beim Betreten meldet der Trainer für alle als gelernt markierten Fragen
  automatisch die richtige Antwort, damit der Raum nicht auf jemanden
  wartet, der sie längst kann. Und **F9/F10** („Lösung zeigen") meldet eine
  bewusst falsche.

  Beides ist richtig so — aber serverseitig waren diese Meldungen von
  echten Antworten **nicht zu unterscheiden**. Für die Rangliste fiel das
  nie auf; eine Fehlerquote der Gruppe hätte damit nicht die Gruppe
  beschrieben, sondern die Technik.

  Solche Meldungen tragen jetzt eine Kennzeichnung (`art`), die der Server
  über eine Weißliste annimmt statt sie durchzureichen. Die
  Kursleiter-Auswertung lässt sie weg und sagt darunter, wie viele es
  waren. Ältere Trainer, die noch nichts davon wissen, senden nichts —
  fehlende Kennzeichnung gilt als echte Antwort, die vorsichtigere
  Annahme.

**Gemessen** (drei Browserfenster in einem echten Raum):

| Prüfung | Ergebnis |
|---|---|
| Alle drei wählen denselben Ablenker | als gemeinsamer Irrtum erkannt, 3× ✔ |
| Zwei falsch, einer richtig | 2 von 3 · 67 % ✔ |
| Alle richtig | 0 von 3 · 0 % ✔ |
| Vorbelegung und F9-Meldung | nicht mitgezählt, Hinweis erscheint ✔ |
| Knopf beim Gastgeber / bei Teilnehmern | sichtbar / verborgen ✔ |
| Teilnehmer fordert Auswertung an | serverseitig abgewiesen ✔ |
| Merkblatt: gemeisterte Frage | bleibt draußen ✔ |
| Merkblatt: nur die richtige Antwort auf dem Blatt | ✔ |

---

## [1.215.0] - 2026-09-07

### Hinzugefügt
- **Windows, Linux und macOS aus einem Guss.** Dietmar: „Baue es mir so auf,
  dass es auf Windows, Linux und Mac läuft."

  Der Trainer selbst lief dort längst — er ist Node.js. Es fehlten die beiden
  **Hilfsprogramme**, und die kamen bisher ausschließlich über Windows-Wege:
  `piper.exe` mit dem Setup, `cloudflared.exe` über `start-tunnel.bat` mit
  PowerShell. Beides gibt es für Linux und macOS genauso, nur unter anderem
  Namen.

  Neu ist **`programme_holen.js`**: Es erkennt System und Prozessor und holt die
  passende Fassung — in Node, also auf allen drei Systemen über denselben Knopf.
  Zu finden unter **Einstellungen → Wartung → Hilfsprogramme**; dort steht auch,
  was schon da ist und was fehlt.

  | System | Piper | cloudflared |
  |---|---|---|
  | Windows x64 | `piper_windows_amd64.zip` | `cloudflared-windows-amd64.exe` |
  | Linux x86-64 | `piper_linux_x86_64.tar.gz` | `cloudflared-linux-amd64` |
  | Linux ARM64 | `piper_linux_aarch64.tar.gz` | `cloudflared-linux-arm64` |
  | Linux ARMv7 | `piper_linux_armv7l.tar.gz` | `cloudflared-linux-arm` |
  | macOS Intel | `piper_macos_x64.tar.gz` | `cloudflared-darwin-amd64.tgz` |
  | macOS Apple Silicon | `piper_macos_aarch64.tar.gz` | `cloudflared-darwin-arm64.tgz` |

  Die Namen sind auf den Release-Seiten der beiden Projekte **nachgesehen und
  nicht geraten**. Ein System ohne fertige Fassung (etwa FreeBSD) bekommt keinen
  Knopf, sondern den Satz, dass es dafür nichts Fertiges gibt.

  **Die Vorsichtsmaßnahmen sind dieselben wie beim Stimmen-Nachladen:** nur zwei
  erlaubte Rechnernamen (`github.com` und der Auslieferungsdienst, an den GitHub
  weiterreicht), **jede** Umleitung wird erneut geprüft — nicht nur die erste —,
  eine Obergrenze für die Dateigröße, und geschrieben wird erst unter einem
  Zwischennamen. Ein Abbruch mitten im Laden hinterlässt damit keine halbe Datei,
  die beim nächsten Start als „ist ja da" gilt. Entpackt wird mit dem `tar` des
  Systems statt mit eigenem Code — weniger Fläche für Fehler.

**Gemessen** (ohne Netz, alle Zweige nachgestellt):

| Prüfung | Ergebnis |
|---|---|
| Dateiwahl für 7 System/Prozessor-Kombinationen | alle richtig ✔ |
| Entpacken, Datei finden, `chmod +x`, ausführen | ✔ |
| `github.com.boese.example` | abgelehnt ✔ |
| `example.com` | abgelehnt ✔ |
| `169.254.169.254` (Metadaten-Adresse) | abgelehnt ✔ |
| Anzeige: beides fehlt / beides da / kein Angebot | alle drei richtig ✔ |

- **Ein Befehl, und Linux und macOS sind eingerichtet.** Dietmar: „Ich gebe
  den Befehl ins Terminal ein und ziehe mir darüber die Version von GitHub
  und baue alle Abhängigkeiten ein. Wenn möglich, mit einer Verknüpfung auf
  dem Desktop."

  ```
  curl -fsSL https://raw.githubusercontent.com/Amateurfunk-Gruppe/Amateurfunk-Trainer/HEAD/installieren.sh | bash
  ```

  Neu ist **`installieren.sh`**. Es prüft Node.js und git und installiert
  sie bei Bedarf mit dem Paketverwalter des Systems nach (apt, dnf, pacman,
  zypper, apk, Homebrew), holt den Trainer nach `~/Amateurfunk-Trainer`,
  richtet die drei Abhängigkeiten ein, lädt Piper und cloudflared passend zu
  System und Prozessor und legt die Verknüpfung an — unter Linux eine
  `.desktop`-Datei, die zusätzlich ins Anwendungsmenü kommt, am Mac ein
  `Amateurfunk-Trainer.app`.

  **`HEAD` statt `main` in der Adresse** — damit hängt der Befehl nicht am
  Namen des Hauptzweigs und bleibt gültig, falls der sich je ändert.

  **Ein zweiter Aufruf frischt auf** statt neu einzurichten (`git pull`).
  **`data/` wird dabei nie angefasst** — der Lernstand liegt außerhalb von
  allem, was das Skript berührt.

  Wer `| bash` nicht mag, lädt das Skript herunter, sieht hinein und ruft es
  dann auf; der Weg steht in `INSTALLATION.md`. Zwei Schalter gibt es:
  `AFU_ZIEL=<Pfad>` für einen anderen Ordner, `AFU_OHNE_HILFSPROGRAMME=1`
  zum Auslassen der beiden Downloads.

  **Unter Windows ändert sich nichts** — dort bleibt das Setup der Weg, und
  die Anleitung sagt das jetzt auch deutlich.

  **`programme_holen.js` kann jetzt auch von der Konsole**
  (`node programme_holen.js alles`), damit das Installationsskript dieselbe
  Mechanik benutzt wie der Knopf im Trainer — eine Stelle, an der geladen
  wird, nicht zwei.

  Neu dazu: **`INSTALLATION.md`** mit beiden Wegen, den Schaltern und einem
  Abschnitt „Wenn etwas klemmt", sowie das Bild
  `bilder/13-installation.png`.

**Gemessen** (Linux, mit einem nachgestellten Repository):

| Prüfung | Ergebnis |
|---|---|
| Ersteinrichtung von null | ✔ |
| zweiter Aufruf frischt auf, `data/` unverändert | ✔ |
| Zielordner belegt (kein git) | bricht ab, ohne etwas anzufassen ✔ |
| Node.js fehlt, kein Paketverwalter | nennt den Weg von Hand ✔ |
| `.desktop` angelegt, ausführbar, im Anwendungsmenü | ✔ |
| macOS-Zweig: `.app`-Struktur, Info.plist, Starter | ✔ |

### Behoben
- **Verwaiste `cloudflared`-Prozesse wurden auf Linux und macOS nie
  aufgeräumt.** Dort stand ein `return` — ein cloudflared, der einen Absturz
  überlebt hatte, blockierte den nächsten Start still.

  Aufgeräumt wird jetzt auch dort, **aber nicht mit der Brechstange**: Die
  Windows-Fassung erschlägt *jedes* cloudflared auf dem Rechner. Das ist dort
  vertretbar; auf Linux betreibt mancher einen eigenen benannten Tunnel für sein
  Heimnetz, und den abzuschießen, weil hier ein Trainer startet, wäre ein
  Übergriff. Beendet wird deshalb nur, was ein `tunnel --url` ohne Konfiguration
  ist — also ein Quick Tunnel wie unserer.

---

## [1.214.0] - 2026-09-07

### Behoben
- **Auf Linux und am Mac gab es nie eine Stimme — der Server hat nur nach
  `piper.exe` gesucht.** Rückmeldung eines Linux-Benutzers: „Bis auf die Stimme
  läuft es ja."

  In `findPiper()` stand genau ein Kandidat: `piper/piper.exe`. Auf Linux und am
  Mac heißt die Datei **`piper`**, ohne Endung — also wurde sie nie gefunden.
  Zurück kam der Notnagel `{type:'python', path:'python'}`, und der ging auf den
  meisten heutigen Linux-Systemen ebenfalls ins Leere: Dort gibt es nur
  **`python3`**, ein blankes `python` existiert nicht mehr. Ergebnis: `ENOENT`,
  Fehler 500, keine Stimme.

  Gesucht wird jetzt der Reihe nach: im Ordner `piper/` unter dem Namen, den das
  jeweilige System benutzt · eine Ebene tiefer (`piper/piper/piper` — so entpackt
  sich das offizielle Archiv) · auf dem **Systempfad** (wer piper über die
  Paketverwaltung installiert hat, ist damit fertig) · zuletzt das Python-Modul,
  mit `python3` statt `python`.

  Nachgestellt und gemessen — alle sechs Fälle richtig:

  | Lage | gefunden als |
  |---|---|
  | Linux, `piper/piper` | Ordner piper/ ✔ |
  | Linux, `piper/piper/piper` | Ordner piper/ ✔ |
  | Linux, nur auf dem Systempfad | Systempfad ✔ |
  | Linux, gar nichts | Python-Modul `python3` ✔ |
  | Windows, `piper/piper.exe` | Ordner piper/ ✔ |
  | Windows, gar nichts | Python-Modul `python` ✔ |

- **Die Fehlermeldung sprach auf Linux von DLLs und Visual C++.** Sie war für
  Windows geschrieben und half dort, wo sie am dringendsten gebraucht wurde,
  überhaupt nicht. Außerhalb von Windows steht jetzt, wonach gesucht wurde und
  was dort zu tun ist — Archiv entpacken und `chmod +x`, oder
  `pip install piper-tts`.

- **Die Anzeige verwechselte „keine Stimme" mit „kein Programm".** Es müssen
  **zwei** Dinge stimmen, damit vorgelesen wird: die Sprachmodelle *und* das
  Programm. Bisher nannte der Hinweis nur die Modelle — im gemeldeten Fall lagen
  die aber da. `/api/tts-voices` liefert jetzt die Lage des Programms mit, und
  der Hinweis benennt den Unterschied.

  (Beim ersten Versuch stand der neue Hinweis **vor** dem Standardtext und wurde
  eine Zeile später wieder überschrieben — im Test sichtbar geworden, jetzt steht
  er dahinter.)

### Hinzugefügt
- **`START.sh` und `STOP.sh` für Linux und den Mac.** Dietmar: „start.bat wird
  vermutlich auf Linux nicht funktionieren?" — richtig, `.bat` und `.vbs` sind
  Windows. Wer das Paket auf einem anderen System auspackte, hatte gar keinen
  Startknopf.

  `START.sh` tut, was `START.vbs` unter Windows tut: nachsehen, ob `node` da ist
  (mit dem passenden Installationsbefehl je Distribution, falls nicht), nachsehen
  ob auf Port 3000 schon ein Trainer läuft, dann starten und den Browser öffnen.

  `STOP.sh` beendet **nur, was aus diesem Ordner heraus läuft** — anders als die
  Windows-Fassung, die pauschal jedes `node.exe` abschießt. Auf einem
  Linux-Rechner läuft nebenher oft anderes mit node; das darf nicht mitgehen.

  Beide sind ins ZIP-Paket aufgenommen (`PAKET_DATEIEN`), das sich Teilnehmer
  über den Gruppenraum-Link herunterladen.

  Getestet: frischer Start → Server auf Port 3000 ✔ · zweiter Aufruf erkennt den
  laufenden Trainer und öffnet nur den Browser ✔ · `STOP.sh` beendet ihn
  (`Server beendet (PID …)`), danach antwortet der Port nicht mehr ✔

---

## [1.213.0] - 2026-09-07

### Hinzugefügt
- **Antwort zurücknehmen.** Dietmar: „Bei Zittern oder Tremor ist ein Fehlklick
  keine falsche Antwort, sondern eine verrutschte Hand. Das ist für mich der
  wichtigste Punkt."

  Nach dem Antworten steht **Zurücknehmen** in der Knopfreihe unter der Frage —
  oder **Strg+Z**. Es gilt beim Lernen, im Prüfungssimulator und im Gruppenraum.

  **Warum eine Sicherung und keine Rückrechnung:** Eine Antwort zieht mehr nach
  sich, als man beim Lesen von `selectOption` denkt — Fehlerliste, Lernbedarf mit
  seinen Zählern, Lernfortschritt mit Streak, der Fortschritt der Runde und die
  beiden Zähler für Anzahl und Treffer. Jeden dieser Schritte rückwärts
  nachzubauen hieße, `handleDifficultOnWrong`, `handleDifficultOnCorrect` und
  `handleMasteryOnAnswer` ein zweites Mal zu schreiben — und beim nächsten Mal,
  wenn sich eine davon ändert, hier den Fehler zu haben. Stattdessen wird **vor**
  der Wertung eine Kopie der betroffenen Stellen gemacht und beim Zurücknehmen
  genau diese Kopie zurückgeschrieben.

  Es gilt nur für die **gerade offene Frage** — wer weiterblättert, lässt die
  Antwort stehen. Im **Gruppenraum** ist die Antwort schon beim Server; der
  speichert sie je Frage und überschreibt sie mit der nächsten, eine korrigierte
  Antwort kommt also richtig an.

  **Nachgemessen** (jeweils vorher / nach der Antwort / nach dem Zurücknehmen):

  | | vorher | nach | zurück |
  |---|---|---|---|
  | Antwort | – | 0 | – ✔ |
  | gezählt / richtig | 0 / 0 | 1 / 0 | 0 / 0 ✔ |
  | Fortschritt | `answered:false` | `answered:true` | `answered:false` ✔ |
  | Fehlerliste | 18 | 19 | 18 ✔ |
  | Lernbedarf | – | `wrongCount:1` | – ✔ |
  | Lernfortschritt | – | `totalWrong:1` | – ✔ |

- **Gesprochener Text für jede Funktion im Nachteilsausgleich.** Dietmar: „Unter
  Nachteilsausgleich möchte ich bei jeder Funktion einen gesprochenen Text. Bei
  Ausführlich soll er das sagen: *Ausführlich — in ganzen Sätzen, so wie man es
  jemandem erklärt, der daneben sitzt.*"

  Alle **17** Bedienelemente des Reiters tragen jetzt `data-vorlesen` und
  `data-vorlesen-kurz` — Stimme, Probe hören, Stimmen hinzufügen, beide
  Vorlese-Schalter, Knöpfe vorlesen, Kurz, Ausführlich, Schrift vergrößern,
  Tastatur, Zurücknehmen, Automatisch weiter samt Auswahlfeld, Bilder vergrößern
  samt Auswahlfeld, Prüfungszeit samt Auswahlfeld. „Ausführlich" sagt genau den
  Satz, den Dietmar vorgegeben hat.

  Die Sätze hängen am umgebenden `<label>` beziehungsweise am Kasten, nicht am
  Kästchen selbst — der Zuhörer am Dokument sucht das nächste Element mit einem
  solchen Text, und beim Anfahren landet der Zeiger auf dem Label.

### Behoben
- **Der Knopf „Zurücknehmen" ließ sich nicht ausblenden.** `style="display:none"`
  am Element half nicht: `.nav-btn` setzt weiter oben `display:inline-flex`
  **mit `!important`**, und das schlägt jeden Inline-Wert ohne `!important`.
  Nachgemessen kam trotz Inline-Wert `none` als berechneter Wert `flex` heraus.
  Gelöst wie schon bei `.pruefung-aus`: eine eigene Klasse mit `!important`, ganz
  am Ende des Stylesheets — bei gleicher Spezifität gewinnt die spätere Regel.

---

## [1.212.0] - 2026-09-07

### Geändert
- **Der Reiter „Nachteilsausgleich" trägt jetzt das durchgestrichene Auge.**
  Dietmar hat das internationale Sehbehinderten-Zeichen geschickt — das
  stilisierte Auge mit Schrägstrich auf blauem Grund — und gesagt: „Das Zeichen
  gefällt mir gut."

  Sein Bild ist ein genormtes Piktogramm und nicht unseres; nachgebaut wird es
  deshalb nicht. Font Awesome bringt aber mit **`eye-low-vision`** dieselbe
  Aussage in derselben Formsprache mit — ein Auge mit Schrägstrich —, und die
  Schriftart liegt ohnehin im Ordner. Damit kommt keine Datei dazu und nichts
  Fremdes ins Projekt.

  Nachgesehen: In `fontawesome/css/all.min.css` steht
  `.fa-eye-low-vision:before,.fa-low-vision:before{content:"\f2a8"}` — das
  Zeichen ist in der **Free**-Ausgabe enthalten und im Stil `fas` erreichbar,
  also genau so, wie die Reiterleiste ihre Zeichen einbindet.

---

## [1.211.0] - 2026-09-07

### Hinzugefügt
- **Automatisch weiterblättern.** Dietmar: „Beim Lernen, Prüfungsraum,
  Gruppenraum soll es automatisch ‚weiter' klicken nach 3 Sekunden. Das gehört
  auch unter Nachteilsausgleich. Ein und abschaltbar."

  Es hängt an `selectOption` — also an dem Augenblick, in dem eine Antwort steht.
  Damit gilt es in allen drei Lagen von selbst: beim Lernen, im
  Prüfungssimulator und im Gruppenraum, denn alle drei beantworten Fragen über
  dieselbe Funktion. Wählbar sind 2, 3, 5, 8 oder 12 Sekunden.

  **Vier Dinge sind eingebaut, damit es nicht überrumpelt:**

  1. **Es wartet auf die Stimme.** Wer das Vorlesen braucht, braucht es ganz.
     Eine Uhr, die während des Vorlesens weiterläuft, schnitte genau die Hilfe
     ab, um die es hier geht. Solange gesprochen wird, steht der Zähler still.
  2. **Die letzte Frage bleibt stehen.** Dort führt „Weiter" nicht zur nächsten
     Frage, sondern ins Ergebnis — mit Konfetti und Auswertung. Da
     hineinzuspringen wäre ein Schreck und kein Nachteilsausgleich.
  3. **Man sieht ihn laufen:** im Knopf steht *Weiter (3)*, *(2)*, *(1)*.
  4. **Jede Bedienung bricht ab.** Wer eine Taste drückt oder irgendwo
     hinklickt, will länger schauen.

- **Bilder stärker vergrößern.** Dietmar: „Für Bilder einen größeren Zoom. Ein
  und abschaltbar." Vier Stufen von *ein Drittel größer* bis *so groß wie
  möglich*. Multipliziert wird **beides** — die feste Obergrenze in Punkten und
  der Anteil am Fenster. Nur die Obergrenze anzuheben brächte auf einem kleinen
  Laptop nichts, weil dort ohnehin der Anteil greift; nur den Anteil anzuheben
  brächte auf einem großen Monitor nichts. Der Anteil wird bei 92 % gekappt — ein
  Bild, das den Rand berührt, sieht aus wie ein Fehler.

  Gemessen an einem 120 × 80 großen Schaltzeichen: aus → **392 px**,
  ein Drittel → 504, halb → 580, doppelt → 767, so groß wie möglich → **917 px**.

### Behoben
- **Im Reiter stand das Zeichen über dem Wort.** Dietmar: „Das Zeichen sitzt
  oberhalb von dem Text." Der Knopf war ein Block mit einem Zeichen davor —
  solange die Beschriftungen kurz waren, fiel das nicht auf.
  „Nachteilsausgleich" passte dann nicht mehr in eine Zeile. Jetzt ist der Knopf
  eine Flex-Zeile mit `white-space: nowrap`, und die Spalte links ist von 180 auf
  **210 Punkte** verbreitert.

  (Das Zeichen ist übrigens kein Rollstuhl, sondern das allgemeine
  Barrierefreiheits-Zeichen — eine Figur mit ausgebreiteten Armen im Kreis.)

- **Das Fenster „Einstellungen" ist breiter und flacher.** Dietmar: „Das Fenster
  Einstellungen etwas mehr in die Breite ziehen und es kann um 10 % kürzer sein."
  860 → **1040 Punkte** breit, 92 % → **83 %** der Fensterhöhe. Die Kästen im
  Nachteilsausgleich haben lange Erklärungen; auf 860 brachen sie auf fünf und
  sechs Zeilen um, und das Fenster wurde dadurch hoch statt breit.

**Gemessen:** Zähler läuft 3 → 2 → 1, dann weiter ✔ · Tastendruck hält ihn an ✔ ·
letzte Frage bleibt stehen ✔ · Bildvergrößerung in allen fünf Stufen ✔ · Zeichen
steht neben dem Wort ✔ · Fenster 988 × 830 statt 860 × 920 ✔ · keine
Fehlermeldung ✔

---

## [1.210.0] - 2026-09-07

### Geändert
- **Aus dem Reiter „Vorlesen" wird „Nachteilsausgleich", und die
  Tastaturbedienung zieht dort ein.** Dietmar: „Vorlesen wird
  Nachteilsausgleich. Bedienung für Tastatur muss da mit rein."

  Er hat recht: Vorlesen, Tastaturbedienung und mehr Zeit in der Prüfung sind
  dasselbe Thema — Wege, die Prüfung für jemanden gangbar zu machen, dem der
  übliche Weg verstellt ist. Über zwei Reiter verstreut findet man sie nur, wenn
  man schon weiß, dass es sie gibt.

  Die interne Kennung bleibt `vorlesen`. Sie steht an einem Dutzend Stellen; sie
  mitzuändern brächte nichts außer der Gelegenheit, eine davon zu übersehen.

### Hinzugefügt
- **Verlängerte Prüfungszeit — ein- und ausschaltbar.** Dietmar: „Für den
  Nachteilsausgleich gibt es mehr Zeit für die Prüfung. Bin mir nicht ganz sicher
  welche Zeit? Ich vermute 60 Minuten für jeden Prüfungsteil."

  **Nachgesehen — und die Vermutung stimmt so nicht.** In der
  Amtsblatt-Verfügung **29/2024** der Bundesnetzagentur stehen die amtlichen
  Zeiten (45 Minuten je Teil, 60 Minuten für Technik Klasse A) und zum
  Nachteilsausgleich nur der Satz, dass „Menschen mit Behinderung ihrer
  Behinderung entsprechende Erleichterungen bei der Prüfungsdurchführung zu
  gewähren" sind. **Wie viel** mehr Zeit, steht dort nicht: Das entscheidet die
  zuständige Stelle im Einzelfall, und es kann statt Zeit auch eine Einzelprüfung
  oder eine mündliche Abnahme sein. Der Nachweis (ärztliches Attest) gehört zur
  Anmeldung.

  Deshalb keine feste Zahl im Code, sondern ein **Faktor zum Auswählen**:
  +25 % · **ein Drittel mehr (45 → 60)** · +50 % · doppelte Zeit. Die Stufe mit
  den 60 Minuten steht mit in der Liste, weil sie Dietmars Zahl trifft — aber als
  Wahl und nicht als Gesetz. Der Kasten sagt das auch dem Benutzer, samt Quelle.

  **Es gibt nur eine Stelle, die Zeiten ausrechnet.** Alles, was eine
  Prüfungszeit anzeigt oder herunterzählt, geht durch `pruefZeit()` —
  Übersichtstabelle, Auswahlkacheln, beide Simulatoren, Ausdruck. Sonst stünde in
  der Tabelle 45 und im Simulator liefen 60. In der Übersichtstabelle steht bei
  verlängerter Zeit ein kleines **+** hinter den Minuten.

  Die Einstellung gehört zum Rechner, nicht zum Lernstand: Wer den
  Nachteilsausgleich braucht, braucht ihn in jedem Benutzer-Slot.

**Gemessen** (Simulator über die Oberfläche gestartet):

| Stufe | Übersicht | Kachel | Uhr im Simulator |
|---|---|---|---|
| aus | 45 min | 45 Min | **45:00** ✔ |
| ein Drittel mehr | 60 min + | 60 Min | **60:00** ✔ |
| +50 % | 68 min + | 68 Min | **68:00** ✔ |

Ausschalten stellt überall 45 wieder her ✔ · beim Wiedereinschalten kommt die
zuletzt gewählte Stufe zurück ✔ · „Bedienung per Tastatur" steht im neuen Reiter
und nicht mehr unter „Allgemein" ✔ · keine Fehlermeldung ✔

---

## [1.209.0] - 2026-09-07

### Hinzugefügt
- **Nachschlagen: Claude, DeepSeek und Meta KI stehen jetzt mit zur Wahl.**
  Dietmar: „Hier könnten wir noch Meta KI, DeepSeek und Claude einbauen."

  Damit sind es sieben Ziele, in zwei Gruppen — und die Gruppen stehen so im
  Auswahlfeld, weil sie sich technisch wirklich unterscheiden:

  **Bekommt die Frage direkt** — Google KI · Google · ChatGPT · **Claude** ·
  Perplexity. Die Frage steht im Link, die Seite antwortet beim Öffnen von
  selbst. Claude nimmt sie über `claude.ai/new?q=` entgegen, genau wie ChatGPT
  über `chatgpt.com/?q=`.

  **Frage wird kopiert** — **DeepSeek** · **Meta KI**. Beide Seiten kennen
  keinen Parameter, mit dem sich eine fertige Frage mitgeben lässt — derselbe
  Grund, aus dem Gemini bis heute nicht in der Liste steht. Statt sie deshalb
  wegzulassen, geht es hier über die Zwischenablage: Die Frage wird kopiert, die
  Seite geht auf, und ein Hinweis unten sagt, dass jetzt **Strg+V** dran ist. Ein
  Handgriff mehr, aber abtippen muss niemand.

  Ein Detail, das leicht schiefgeht: **Kopiert wird vor `window.open`.** Danach
  liegt der Zugriff auf die Zwischenablage in einem Fenster, das nicht mehr im
  Vordergrund ist — manche Browser verweigern ihn dann. Klappt es doch einmal
  nicht, sagt der Hinweis das ehrlich, statt eine leere Zwischenablage
  vorzugeben.

  Sollte eine der beiden Seiten später doch einen Parameter bekommen, ist es im
  Quelltext eine Zeile: `kopieren` raus, `adresse` mit `?q=` wie bei den anderen.

**Gemessen:** alle sieben Adressen richtig aufgebaut ✔ · Knopf neben der Frage
trägt Namen und Zeichen des Ziels (Meta KI mit eigenem Logo) ✔ · bei DeepSeek
landet die Frage in der Zwischenablage und die Seite öffnet ✔ · der Hinweis
erscheint und verschwindet nach vier Sekunden ✔ · keine Fehlermeldung ✔

---

## [1.208.0] - 2026-09-07

### Entfernt
- **Das Prüfungsziel „CB → N" ist aus der Klassenwahl herausgenommen.**
  Dietmar: „Die Klasse von CB auf N kannst du entfernen, da Blättern richtig gut
  funktioniert und jeder selbst das durchgehen kann."

  Das Ziel hat 138 Fragen als „kann ein CB-Funker schon" vom Lernstapel
  abgezogen. Seit es das Blättern mit Lesezeichen und die Kacheln „Wo soll ich
  anfangen" gibt, entscheidet das jeder besser selbst — und ohne die
  Unsicherheit, ob die Vorauswahl auf ihn passt. Geprüft wurde ohnehin immer
  alles: Der Simulator hat schon vorher aus dem vollen Katalog gezogen.

  In der Klassenwahl stehen jetzt vier Ziele: **Klasse N · Klasse E · N → E ·
  E → A**.

  **Es ist genau eine Zeile.** Der ganze CB-Teil (`CB_GRUPPEN`, `cbAktiv`,
  `cbPanelAktualisieren`, das Fenster „Als CB bekannt") hing an `k.cb` — und das
  gibt es ohne den Eintrag nirgends mehr. Alles davon liegt still, ohne dass eine
  Zeile gelöscht werden musste. Im Quelltext steht bei `KLASSEN`, welche zwei
  Zeilen es zurückholen.

  **Wer das Ziel eingestellt hatte**, landet beim nächsten Start auf Klasse N;
  der gespeicherte Wert wird dabei einmal richtiggestellt. Bliebe er stehen,
  zeigte die Klassenwahl weiter auf ein Ziel, das nirgends mehr auftaucht.

  **Am Lernstand ändert sich nichts.** Die CB-Anrechnung war nur eine Blende über
  „gelernt" — sie hat nie in den Lernfortschritt geschrieben. Wer sie benutzt
  hat, findet die 138 Fragen jetzt wieder im Stapel; abgehakt war keine davon.

**Geprüft:** Klassenwahl ohne CB ✔ · gespeichertes `cbn` fällt auf `n` zurück und
wird im Speicher richtiggestellt ✔ · CB-Kasten bleibt unsichtbar, `cbAktiv()`
liefert `false` ✔ · keine Fehlermeldung im Fenster ✔

---

## [1.207.0] - 2026-09-07

### Geändert
- **Die Knopfleiste rückt zusammen, statt umzubrechen.** Der Umbruch aus 1.204.0
  ist wieder draußen — er war das Falsche.

  Drei Rückmeldungen von Dietmar am selben Tag haben den Weg gezeigt:

  1. „Manchmal, nicht immer, ist der Button Gruppenraum nur halb zu sehen."
     → Die Leiste war um ein paar Punkte zu breit.
  2. Daraufhin durfte sie umbrechen. → „Der Button Gruppenraum verschiebt sich in
     2. Reihe." Auch nicht recht — und zu Recht: Eine zweite Reihe für **einen**
     Knopf sieht nach Panne aus, nicht nach Absicht.
  3. „Das war nur bei 90 %." und „Bei 115 % verschiebt sich der Button
     Gruppenraum auch in 2. Reihe." → Es hängt an der Anzeigegröße, also an einer
     Zahl, die sich ändert.

  Er will **eine** Zeile, in der alles steht. Also wird weder umgebrochen noch
  abgeschnitten, sondern gemessen und zusammengerückt — in drei Stufen, jede erst
  dann, wenn die vorige nicht reicht:

  | Stufe | was enger wird | bringt |
  |---|---|---|
  | **eng** | Innenabstände und Lücken der Knöpfe | rund 90 Punkte |
  | **sehr eng** | zusätzlich Schrift und Höhe eine Spur kleiner | rund 100 Punkte |
  | **ohne Zeichen** | die Symbole in den Knöpfen fallen weg | rund 200 Punkte |

  Die letzte Stufe kostet etwas und steht deshalb zuletzt: Das Zeichen findet man
  aus dem Augenwinkel, die Beschriftung muss man lesen. Aber ein Knopf ohne
  Zeichen ist immer noch besser als ein Knopf, den man nicht sieht.

  Warum Stufen und nicht stufenlos gerechnet: Ein stufenlos berechneter
  Innenabstand ändert sich bei jedem Zähler, der auftaucht — die Leiste zappelte.
  Drei feste Stufen sind ruhig und reichen.

  **Drei Dinge, die dabei leicht schiefgehen — und wie sie gelöst sind:**

  - **Vor jeder Messung müssen alle Stufen weg.** Sonst misst man die schon
    zusammengerückte Leiste und käme nie wieder in die weite Darstellung zurück,
    wenn Platz frei wird.
  - **Der ResizeObserver allein genügt nicht.** Er meldet sich nur, wenn sich der
    *Kasten* ändert. Die Knöpfe darin ändern sich aber ständig, ohne dass er
    größer wird: „Blättern" wird zu „Weiterblättern", ein Zähler taucht auf,
    „Auffrischen" kommt dazu. **Genau daran hing das „manchmal, nicht immer".**
    Ein MutationObserver auf den Inhalt fängt das jetzt — bewusst ohne
    `attributes`, sonst löste die Prüfung mit ihrer eigenen Klasse den nächsten
    Durchlauf aus.
  - **Während einer Runde ist die Leiste ausgeblendet.** Dann sind alle Breiten
    null, und die Messung würde „passt" sagen, ohne etwas gesehen zu haben.

  Bleibt es trotzdem zu breit — sehr schmales Fenster bei großer Anzeige —,
  greift wie bisher das seitliche Schieben samt Schattenhinweis. Das ist der
  Notnagel, nicht der Normalfall.

**Gemessen** (voll besetzte Leiste: Weiterblättern + Auffrischen + alle Zähler):

| Fenster | 90 % | 95 % | 115 % |
|---|---|---|---|
| 1915 × 950 | eng, alles drin | eng, alles drin | eng, alles drin |
| 1500 × 900 | eng, alles drin | eng, alles drin | sehr eng, alles drin |
| 1360 × 860 | eng, alles drin | eng, alles drin | sehr eng, alles drin |
| 1200 × 800 | sehr eng, alles drin | sehr eng, alles drin | schiebbar |

In allen Fällen **eine** Zeile. Die Stufen greifen auch dann, wenn sich nur die
Beschriftung ändert und der Kasten gleich groß bleibt — der Fall, der vorher
durchgerutscht ist.

---

## [1.206.0] - 2026-09-07

### Geändert
- **Die beiden Anzeigegrößen stehen jetzt nebeneinander, die Felder sind
  schmaler.** Dietmar: „Richte die Felder bitte nebeneinander an. Die Felder
  können in der Breite etwas reduziert werden."

  Gebaut als **ein** Raster mit zwei Spalten und vier Zeilen — Überschrift,
  Erklärung, Feld, Hinweis — und nicht als zwei Kästen nebeneinander. Der
  Unterschied fällt erst auf, wenn ein Text unterschiedlich lang umbricht: Bei
  zwei Kästen stünden die Auswahlfelder dann auf verschiedener Höhe, im
  gemeinsamen Raster bleiben sie auf einer Linie. Eine senkrechte Linie trennt
  die Spalten, ohne Platz zu kosten.

  Die Felder sind von 260 auf **160 Punkte** zurückgenommen — „Automatisch" ist
  das längste Wort darin und braucht nicht mehr.

  Am Handy fällt das Raster auf **eine** Spalte zurück. Dabei war eine Falle zu
  umgehen: Im Quelltext stehen die acht Teile zeilenweise (Überschrift links,
  Überschrift rechts, Erklärung links, Erklärung rechts …). In einer einzigen
  Spalte stünden sie damit im Reißverschluss und wären unlesbar. `order` sortiert
  sie deshalb wieder zu zwei vollständigen Blöcken untereinander, mit Trennlinie
  dazwischen.

**Gemessen:**

| Fenster | Spalten | Felder auf einer Linie | Feldbreite | Reihenfolge |
|---|---|---|---|---|
| 1400 px | 2 | ja | 152 px | nebeneinander |
| 412 px | 1 | — | volle Breite | Normal komplett, dann Vollbild komplett |

---

## [1.205.0] - 2026-09-07

### Hinzugefügt
- **Die Anzeigegröße gibt es jetzt zweimal: für die normale Ansicht und fürs
  Vollbild.** Dietmar: „Das benötige ich 2 ×! Einmal für Bildschirm für normale
  Ansicht mit Adressleiste und Taskleiste. Und 1 × für vergrößert!"

  Seine eigenen Zahlen vom selben Tag geben es her: „Bei der normalen Ansicht
  passt 100 bis 105 Prozent, beim Vergrößern passt 110 bis 115." Der Grund ist
  einfach — im Vollbild sind Adressleiste, Reiterleiste und Taskleiste weg. Auf
  einem 1080er Schirm sind das gut **130 Punkte Höhe**, also rund 14 Prozent:
  genau der Unterschied zwischen seinen beiden Angaben. **Eine** Zahl kann das
  nicht abdecken. Wer sie fürs Vollbild einstellt, bekommt in der normalen
  Ansicht unten Abgeschnittenes; wer sie für die normale Ansicht einstellt,
  verschenkt im Vollbild eine Handbreit Platz.

  In den Einstellungen stehen beide Felder untereinander im selben Kasten — erst
  nebeneinander sieht man, dass die zweite Zahl größer sein darf. Unter jedem
  Feld steht, ob es gerade gilt oder ab wann.

  **Umgeschaltet wird ohne Zutun**, und zwar auf beiden Wegen ins Vollbild:

  - Der **Knopf im Trainer** benutzt die Fullscreen-Schnittstelle — das meldet
    sich sauber, hier hängt die Umschaltung direkt am Ereignis.
  - **F11 ist Sache des Browsers.** Die Seite erfährt davon gar nichts:
    `document.fullscreenElement` bleibt leer, und ein Ereignis gibt es auch
    nicht. Erkannt wird es am Vergleich mit dem Bildschirm — bleibt über und
    unter der Seite nichts mehr übrig, nimmt auch nichts mehr Platz weg. Diese
    Faustregel gilt **nur am Rechner**: Am Handy fährt die Adressleiste beim
    Scrollen ständig ein und aus, dort wäre sie eine Münze statt eines
    Anhaltspunkts. F11 gibt es dort ohnehin nicht.

  Dazu ist im Fenster-Beobachter die Abkürzung „nur nachrechnen, wenn auf
  automatisch" herausgeflogen. Sie stimmte, solange es **eine** Größe gab; jetzt
  zeigt sich der Wechsel zwischen beiden als Größenänderung des Fensters — bei
  F11 sogar ausschließlich so.

  **Einmalige Übernahme:** Wer bisher einen festen Wert eingestellt hatte,
  bekommt ihn auch fürs Vollbild eingetragen — sonst spränge der Trainer beim
  ersten F11 nach dem Update auf etwas ganz anderes um, ohne dass jemand etwas
  geändert hätte. Ab dann sind die beiden Werte unabhängig.

**Gemessen** (1915 × 950 Fenster auf einem 1080er Schirm, normal 100 %,
Vollbild 115 %):

| Lage | erkannt als Vollbild | angewandt |
|---|---|---|
| normale Ansicht | nein | 100 % |
| Vollbild über den Knopf | ja | 115 % |
| zurück | nein | 100 % |
| F11 (Fenster = Bildschirmhöhe) | ja | 115 % |
| F11 aus | nein | 100 % |
| Handy, `screen.height == innerHeight` | **nein** (richtig) | — |

Mit „Automatisch" in beiden Feldern: normale Ansicht **105 %**, Vollbild
**120 %** — die Automatik findet den Unterschied von selbst.

---

## [1.204.0] - 2026-09-07

### Behoben
- **Der Knopf „Gruppenraum" war manchmal nur halb zu sehen.**
  Dietmar, mit Bild: „Manchmal, nicht immer, ist der Button Gruppenraum nur halb
  zu sehen. F5 hilft, es kommt aber wieder."

  **Nachgemessen bei seiner Fenstergröße** (1915 × 950, Anzeige automatisch
  105 %): Die Knopfleiste braucht **1319 Punkte**, sie hat **1372** — also
  53 Punkte Luft. Genau die ist weg, sobald sich der Blätter-Knopf von
  „Blättern" in **„Weiterblättern"** umbenennt (rund 57 Punkte). Dann ragt der
  letzte Knopf — der Gruppenraum — um ein paar Punkte hinaus und steht halb da.

  Damit ist auch das „manchmal" erklärt: **sobald ein Lesezeichen im Blättern
  liegt.** Kommt „Auffrischen" dazu, fehlt noch mehr. Und F5 half nur so lange,
  bis der Knopf sich wieder umbenannte.

  Scrollen konnte man zwar — die Leiste ist seitlich verschiebbar, mit Schatten
  als Hinweis —, aber auf einem 1915 Punkte breiten Bildschirm will niemand nach
  einem Knopf wischen.

  **Jetzt bricht die Leiste am Rechner um.** Fehlt Platz, rutscht der letzte
  Knopf in eine zweite Zeile und ist ganz da, statt angeschnitten. Passt alles,
  sieht man wie bisher eine einzige Zeile — die Regel kostet nichts, solange sie
  nicht gebraucht wird.

  Zwei Kleinigkeiten, die dabei zählen:

  - `overflow` muss auf **beiden** Achsen `visible` werden. Steht eine Achse auf
    `auto` oder `hidden`, macht der Browser aus der anderen ebenfalls einen
    Scrollbereich — die zweite Zeile wäre dann oben und unten abgeschnitten.
  - **Am Handy bleibt es beim Wischen.** Dort wären aus elf Knöpfen vier Zeilen,
    und die halbe Anzeige wäre voll mit Leiste, bevor die erste Frage kommt. Eine
    Leiste, die man seitlich schiebt, ist dort das kleinere Übel — und aus Apps
    vertraut.

**Gemessen:**

| Fenster | Leiste normal | Leiste voll besetzt | angeschnitten |
|---|---|---|---|
| 1915 × 950 | 1 Zeile, 68 px | 2 Zeilen, 116 px | keiner |
| 1366 × 768 | 1 Zeile, 55 px | 2 Zeilen, 94 px | keiner |
| 412 px (Handy) | 1 Zeile, wischbar | 1 Zeile, wischbar | unverändert |

„Voll besetzt" heißt: Weiterblättern + Auffrischen + alle vier Zähler.

---

## [1.203.0] - 2026-09-07

### Hinzugefügt
- **Am Handy geht der Trainer beim ersten Antippen von selbst ins Vollbild.**
  Dietmar zur Chrome-Meldung „… zum Beenden des Vollbildmodus: von oben nach
  unten wischen": „Beim Öffnen sofort auf Vollbild."

  **Vorweg, damit es nicht untergeht:** Diese Meldung gehört Chrome und lässt
  sich von keiner Seite unterdrücken — es gibt dafür keine Schnittstelle. Was
  sich ändern lässt, ist der **Zeitpunkt**: Sie kommt jetzt gleich am Anfang und
  nicht mitten in der Runde, wenn man den Knopf drückt. Danach ist Ruhe.

  **Warum beim ersten Antippen und nicht beim Laden:** Kein Browser lässt das
  Vollbild aus dem Nichts zu — es geht nur als Antwort auf eine Bedienung. Ein
  Aufruf beim Laden oder aus einem Zeitgeber wird abgewiesen
  („Permissions check failed"), und zwar wortlos. Das erste Antippen ist der
  früheste Zeitpunkt, an dem es überhaupt erlaubt ist — und aus Sicht des
  Benutzers immer noch „beim Öffnen".

  Genau **einmal pro Seitenaufruf**. Sonst käme man nie wieder heraus: Wer das
  Vollbild mit dem Knopf verlässt, tippt danach ja weiter und wäre sofort wieder
  drin. Nicht am Rechner, nicht wenn der Trainer ohnehin schon als App vom
  Startbildschirm läuft, und nicht, wenn der erste Griff dem Vollbild-Knopf
  selbst gilt — sonst schaltete er ein und der Klick gleich wieder aus.

  Abschaltbar unter **Einstellungen → Vollbild am Handy**. Die Wahl gehört zum
  Gerät, nicht zum Lernstand.

**Gemessen:**

| Fenster | Automatik | nach 1. Antippen | nach Verlassen + Antippen |
|---|---|---|---|
| 412 px | an | Vollbild ✔ (Knopfzeichen wechselt) | bleibt aus ✔ |
| 412 px | aus | bleibt aus ✔ | bleibt aus ✔ |
| 768 px (Tablet) | an | Vollbild ✔ | bleibt aus ✔ |
| 1600 px (Rechner) | an | bleibt aus ✔ | bleibt aus ✔ |

Der Schalter überlebt das Neuladen.

---

## [1.202.0] - 2026-09-07

### Entfernt
- **Der dunkle Balken „Der Trainer läuft auch als App auf deinem Startbildschirm"
  kommt nicht mehr.** Dietmar, mit Bild vom Handy: „Unten kommt ein Hinweis mit
  einer Verknüpfung … Diese gehört entfernt."

  Er lag fest unten über der Seite, verdeckte die Fußzeile und stand auch bei
  jedem im Weg, der den Trainer über den Einladungslink öffnet — also bei den
  Teilnehmern einer Runde, die gar nichts einrichten wollen, sondern mitmachen.

  Die Sache selbst bleibt: Der Trainer lässt sich weiterhin auf den
  Startbildschirm legen, `manifest.webmanifest` und der Service Worker sind
  unverändert. Wie es geht, steht im **Info-Fenster** unter „Als App auf den
  Startbildschirm" — dort sucht man es, wenn man es will, statt es aufgedrängt
  zu bekommen.

### Behoben
- **Der dunkelgraue Streifen oben und unten am Handy.** Dietmar: „Das soll
  automatisch mit der gleichen Farbe wie der Inhalt vom Trainer gefüllt werden
  und soll sich automatisch an das Fenster anpassen."

  Woher er kam: `body` hat rundum 1 rem Innenabstand. Für schmale Geräte war der
  Abstand **links und rechts** längst auf die Handy-Ecken (`safe-area`) gesetzt,
  also praktisch null — **oben und unten** blieb er stehen. Dort schaute genau
  die Farbe durch, die den Rahmen macht: im Grey Mode `#aab0b6`, also der dunkle
  Balken auf seinem Bild.

  Der Abstand bleibt absichtlich, wo er ist — unten hängt an ihm der Platz für
  die Gruppenchat-Leiste (56 px); wer ihn wegnimmt, schiebt die letzte Zeile
  unter die Leiste. Geändert wird nur die **Farbe**, und zwar nicht als feste
  Zahl, sondern als die des Karteninhalts (`var(--card-bg)`). Damit stimmt sie in
  jedem Farbstil von selbst, auch in einem, den es heute noch nicht gibt. Ist die
  Seite kürzer als das Fenster, wird der Rest in derselben Farbe weitergemalt.
  Und weil `browserfarbeNachziehen()` genau diese Farbe in
  `<meta name="theme-color">` schreibt, zieht die Adressleiste des Handys
  automatisch mit.

  Runde Ecken, Schatten und Rahmen der Karte fallen am Handy weg: Sie waren dafür
  da, die Karte vom Untergrund abzuheben — und den gibt es dort nicht mehr.

**Gemessen** (Farbe von Untergrund und Karteninhalt):

| Fenster | Stil | Untergrund | Karte | gleich | theme-color |
|---|---|---|---|---|---|
| 412 px | Grey | `#f7f8f9` | `#f7f8f9` | ✔ | `#f7f8f9` |
| 412 px | Light / Green / Blue / Orange | `#ffffff` | `#ffffff` | ✔ | `#ffffff` |
| 768 px (Tablet) | Grey | `#f7f8f9` | `#f7f8f9` | ✔ | `#f7f8f9` |
| 1600 px (Rechner) | Grey | `#aab0b6` | `#f7f8f9` | — unverändert | `#aab0b6` |

Nachgemessen am Bildpunkt: obere und untere Bildkante am Handy jetzt
`rgb(247,248,249)` — dieselbe Farbe wie in der Mitte der Seite.

---

## [1.201.0] - 2026-09-07

### Geändert
- **Am Handy fallen drei Dinge weg, die dort nur Platz kosten.**
  Dietmar: „In der mobilen Version steht oben Klasse N 571 Fragen. Das kann in
  der mobilen Version raus. Ebenso auch die Videolektion und 50 Ohm —
  **nur** in der mobilen Version."

  Weg sind auf schmalen Geräten:

  - die Plakette **„Klasse N · 571 Fragen"** in der Kopfzeile. Welche Klasse
    eingestellt ist, steht ohnehin im Knopf daneben und in der
    Prüfungsübersicht;
  - die beiden Kacheln unter der Frage — **Videolehrgang** (rot, YouTube) und
    **50 Ohm · Kapitel** — samt der Quellenzeile darunter. Beide öffnen ein
    neues Fenster, am Handy also einen Wechsel aus dem Trainer heraus mitten in
    der Runde.

  Die Grenze ist **640 Punkte Breite** (`body.handy`), nicht 1024. Am Tablet
  hochkant ist genug Platz — dort bleibt alles stehen, am Rechner ändert sich
  gar nichts.

  Gemessen: 412 px → beides weg · 640 px → beides weg · 768 px (Tablet) →
  beides da · 1600 px → beides da. Es bleibt kein leerer Kasten zurück.

---

## [1.200.0] - 2026-09-07

### Hinzugefügt
- **Eine Tunnel-Wache: der Trainer sagt Cloudflare alle vier Minuten „ich bin da".**
  Dietmar: „Ich möchte, dass wenn ich im Gruppenraum einen Raum starte, der Server
  läuft. Der Trainer muss auch über Stunden laufen, ohne dass ich am Rechner aktiv
  bin. Der Trainer muss mit Cloudflare Handshake machen und immer wieder sagen
  ‚ich bin da', damit der zufällig generierte Raum nicht geschlossen wird."

  Zwei neue Dinge im Server:

  **Der Puls.** Alle vier Minuten ruft der Trainer seine *eigene* öffentliche
  Adresse auf (`/api/tunnel-status`). Das ist nicht nur Höflichkeit: Diese Anfrage
  läuft über genau die Leitung, die `cloudflared` zu Cloudflare hält, und hält
  damit die NAT-Einträge im Router offen. Genau die laufen bei UDP/QUIC nach ein
  paar Minuten Ruhe ab — das ist die Ursache des bekannten Abbruchs
  „timeout: no recent network activity". Kommt eine Antwort zurück, steht die
  ganze Kette: dieser PC → cloudflared → Cloudflare → zurück.

  **Die Wache.** Jede Minute wird nachgesehen, ob `cloudflared` überhaupt noch
  läuft. Bisher passierte, wenn er wegbrach, **gar nichts**: Prozess weg,
  `tunnel_url.txt` gelöscht, Einladungslink tot — und niemand merkte es, bis der
  erste Teilnehmer anrief. Jetzt wird die Leitung automatisch neu aufgebaut,
  ebenso nach drei Pulsen ohne Antwort.

  **Mit Bremse.** Bringt der Neuaufbau nichts — kein Internet, oder Cloudflare
  bremst die kostenlosen Quick Tunnels dieser Leitung aus —, würde die Wache heiß
  laufen und im Minutentakt neue Links erzeugen. Deshalb: Liegt der letzte
  Neuaufbau keine zehn Minuten zurück, wird gewartet — 1, 2, 4, 8 Minuten,
  höchstens eine Viertelstunde.

  **Der neue Link wird sofort gemeldet.** Ein Quick Tunnel bekommt bei jedem
  Start einen neuen Zufallsnamen — der alte Link ist danach tot. Die neue Adresse
  geht deshalb über die Gruppenraum-Verbindung an alle, der Link im Fenster wird
  ausgetauscht, und der Gastgeber bekommt einen deutlichen Hinweis, dass er den
  neuen Link verschicken muss.

  Im Gruppenraum steht dazu eine neue Zeile unter dem Einladungslink: wann der
  letzte Puls durchgekommen ist, wie viele im Raum sind, und ob die Leitung
  zwischendurch neu aufgebaut werden musste.

- **Wake Lock: der Bildschirm bleibt an, solange ein Raum offen ist.**
  Das Lebenszeichen an den Server kommt aus dem Browser-Tab. Legt Chrome ihn
  schlafen, hört es auf. Solange ein Gruppenraum offen ist, hält der Trainer
  jetzt einen Wake Lock. Gegen den Ruhezustand von Windows selbst hilft das
  nicht — wer den Deckel zuklappt, schickt den Rechner trotzdem schlafen.

### Behoben
- **Der Server machte Feierabend, während die Gruppe noch übte.**
  Er beendet sich fünf Minuten nach dem letzten Lebenszeichen aus dem Browser.
  Schläft der Tab ein oder geht der Rechner kurz weg, war der Raum weg — mitten
  in der Runde.

  Jetzt zählt nicht mehr nur der Browser:

  - Sitzt **jemand im Gruppenraum**, wird überhaupt nicht abgeschaltet.
  - **Läuft ein Tunnel**, gilt statt der fünf Minuten eine Frist von **vier
    Stunden** völliger Leere. So bleibt der Link stehen, wenn kurz niemand da
    ist — und ein vergessener öffentlicher Tunnel läuft trotzdem nicht ewig.

**Gemessen** (mit einem nachgestellten `cloudflared`, der abstürzt bzw. nicht
antwortet):

| Fall | Erwartet | Ergebnis |
|---|---|---|
| cloudflared stirbt | Neuaufbau binnen einer Minute, neue Adresse gemeldet | ✔ |
| Puls antwortet nicht | Neuaufbau nach 3 Fehlversuchen | ✔ |
| Neuaufbau bringt nichts | 2. Mal → 1 Min Pause, dann 2, 4, 8 | ✔ |
| Leitung steht | kein Neuaufbau, `letzterPuls` bleibt frisch | ✔ |
| Raum offen, kein Fenster | `imRaum` > 0 → kein Feierabend | ✔ |

### Hinweis zur Lebensdauer des Links
Ein **Quick Tunnel** (`*.trycloudflare.com`) ist kostenlos und ohne Konto,
Cloudflare sagt dazu ausdrücklich: keine zugesicherte Verfügbarkeit, gedacht zum
Testen, höchstens 200 gleichzeitige Anfragen. Es gibt **keine feste Ablaufzeit** —
die Adresse lebt genau so lange, wie der `cloudflared`-Prozess sie hält. Fällt er,
ist sie für immer weg und die nächste heißt anders. Wer eine Adresse braucht, die
über Wochen dieselbe bleibt, braucht einen **benannten Tunnel** mit eigener
Domain; das bleibt offen, bis eine Domain da ist.

---

## [1.199.0] - 2026-09-07

### Geändert
- **Die Anzeigegröße hat jetzt kleinere Stufen — und welche zum Verkleinern.**
  Dietmar: „Bei der normalen Ansicht passt 100–105 %. Beim Vergrößern passt
  110–115. Ich wünsche mir in den Einstellungen kleinere Werte, auch in Richtung
  verkleinern. Der Trainer muss auf 15- und 17-Zoll-Laptops komplett dargestellt
  werden. Fehlen kleinere Werte, kann das der Benutzer schlecht selbst
  einstellen."

  Vorher gab es nach unten nur 80 und 90 Prozent. Jetzt geht es in
  **Fünferschritten von 60 bis 115 Prozent**, darüber noch 125 und 150:

  `Automatisch · 60 · 65 · 70 · 75 · 80 · 85 · 90 · 95 · 100 · 105 · 110 · 115 · 125 · 150`

  Die feinen Schritte liegen bewusst unten. Beim Vergrößern kommt es auf ein
  Zwanzigstel nicht an; beim Verkleinern entscheidet eine einzige Stufe
  darüber, ob die letzte Knopfreihe noch ins Fenster passt.

  Auch die Automatik darf jetzt bis 60 Prozent hinunter (vorher war bei 80
  Schluss). Auf einem 15-Zoll-Laptop mit 768 Punkten Höhe reichten 80 Prozent
  nicht immer.

### Behoben
- **Die Automatik richtete sich nach der gerade sichtbaren Ansicht statt nach
  der längsten.** Dietmar: „Nicht besser geworden."

  Der Fehler des Vorgängers: Gemessen wurde, was gerade auf dem Schirm stand.
  In der Fragenansicht ist das wenig — also wurde vergrößert. Beim Zurückgehen
  in die Hauptansicht passte es dann nicht mehr, und unten fehlte wieder etwas.

  Die Vergrößerung gilt aber für die ganze Seite, also muss sich die **längste**
  Ansicht durchsetzen — und das ist die Hauptansicht. Ihre Höhe wird jetzt
  gemerkt, solange sie sichtbar ist, und auch dann benutzt, wenn gerade eine
  Runde läuft.

- **Zwei Aufrufe hintereinander lieferten zwei verschiedene Werte** (80 % und
  85 %). Die gemessene Höhe hängt selbst von der Vergrößerung ab: Bei 115
  Prozent ist das Fenster in gewöhnlichen Punkten schmaler, also bricht mehr
  um, also ist die Karte höher. Wer daraus einen neuen Faktor rechnet, misst
  beim nächsten Mal etwas anderes.

  Jetzt wird der Wert zum jeweiligen Fenster gemerkt, und nachgemessen wird
  **nur nach unten**: Passt es nach dem Setzen doch nicht, geht es eine Stufe
  zurück — nie nach oben. So kann sich nichts aufschaukeln, und nach höchstens
  drei Runden steht der Wert.

- **Der Vorab-Block rechnete anders als der Rest.** Der kleine Block ganz oben
  in der Datei setzt die Größe schon *vor* dem ersten Zeichnen, damit die Seite
  nicht einmal falsch aufblitzt. Er rundete noch und ging nur bis 80 Prozent
  hinunter. Jetzt rechnet er genau wie die Hauptfunktion.

**Gemessen** (Hauptansicht mit vollem Verlauf, danach Wechsel in die
Fragenansicht und zurück):

| Fenster | Faktor | Karte braucht | Fenster hat |
|---|---|---|---|
| 1911 × 945 | 105 % | 867 | 945 |
| 1600 × 900 | 100 % | 829 | 900 |
| 1440 × 810 | 90 % | 741 | 810 |
| 1366 × 768 (15 Zoll) | 85 % | 702 | 768 |
| 1280 × 720 | 80 % | 663 | 720 |
| 2560 × 1400 | 150 % | 1238 | 1400 |

In allen Fällen: Der Faktor steigt beim Wechsel in die Fragenansicht **nicht**
mehr, und nach der Rückkehr passt die Hauptansicht vollständig ins Fenster.

---

## [1.198.0] - 2026-09-07

### Behoben
- **Die automatische Anzeigegröße war eine Stufe zu groß — unten fehlte etwas.**
  Dietmar: „Habe es auf automatisch. Das ist etwas zu groß. Bei Vergrößern sieht
  es ähnlich aus. Unten fehlt etwas."

  Zwei Ursachen, beide behoben:

  **Es wurde gerundet statt abgerundet.** Der Faktor geht in
  Zwanzigstelschritten. Passte rechnerisch 1,086, machte `Math.round()` daraus
  **1,10** — also eine Stufe *mehr*, als hineinpasst, und unten fehlte genau
  dieser Rest. Jetzt wird abgerundet: Ein bisschen Luft unten stört niemanden,
  ein abgeschnittener Knopf schon.

  **Die Höhe wurde angenommen statt gemessen.** Die 870 Punkte im Code stammen
  aus der Zeit, als die Hauptansicht kürzer war — seitdem sind Prüfungstermin,
  Rufzeichen prüfen und die Diplome dazugekommen. Wer mit einer festen Zahl
  rechnet, rechnet irgendwann falsch. Jetzt wird die Karte selbst gemessen; ihre
  Höhe steht in gewöhnlichen Punkten und ändert sich durch die Vergrößerung
  nicht.

  Nachgemessen bei sechs Fenstergrößen — 1911×945 (Dietmars), 1920×1080,
  1600×900, 1366×768, 2560×1440 und 1280×720: überall passt die Karte
  vollständig ins Fenster. Bei 1911×945 sind es jetzt 1,05 statt 1,10.

## [1.197.0] - 2026-09-07

### Geändert
- **Grey Mode: die Karte eine Spur heller.** Dietmar mit einer Farbprobe der
  Karte: „Die Farbe kann etwas heller sein. Damit sich der Inhalt mehr vom
  Fenster abhebt."

  Von `#f1f2f4` auf `#f7f8f9`. Genau richtig: Seit der Hintergrund das kräftige
  Grau seiner Werkzeugleiste hat, muss die Karte nicht mehr selbst grau sein, um
  grau zu wirken — das macht der Rahmen ringsum. Die Abhebung von der Seite
  steigt auf 2,06:1 (vorher 1,95:1, in 1.193.0 waren es 1,23:1), der Text darauf
  auf 15,41:1.

  Die Innenflächen bleiben, wie sie sind (Fragenfeld, Verlauf, Auswertung
  `#e7eaec`): Sie sollen sich von der Karte abheben, nicht mit ihr zusammen
  heller werden.

## [1.196.0] - 2026-09-07

### Hinzugefügt
- **Die Leiste des Browsers färbt sich mit — dort, wo das möglich ist.** Dietmar:
  „Kann man das so aufbauen, dass die Leiste vom Browser mit die Farbe wechselt?"

  Beim Umschalten der Ansicht schreibt der Trainer die aktuelle
  Hintergrundfarbe in `<meta name="theme-color">`. Wo das wirkt:

  | | färbt sich mit |
  |---|---|
  | Chrome auf Android (Adressleiste) | ja |
  | Als App auf dem Startbildschirm / über „Verknüpfung erstellen" | ja, der Fensterrahmen |
  | Safari ab 15 | ja |
  | Gewöhnliches Chrome- oder Edge-Fenster am Rechner | **nein** |

  Die Werkzeugleiste im Desktop-Browser gehört dem Browser und richtet sich nach
  dessen eigenem Design. Keine Seite kann das ändern — und das ist Absicht, sonst
  könnte sich jede Seite als Browser verkleiden.

  Die Farbe wird nicht je Ansicht gepflegt, sondern schlicht abgelesen: Was der
  Seitenhintergrund gerade ist, steht auch in der Leiste. Damit stimmt es auch
  dann noch, wenn eine Ansicht später umgefärbt wird. Nachgemessen für alle fünf:
  Hell `#eef2f9`, Grün `#eef8f2`, Blau `#eaf3fb`, Orange `#fdf3e7`, Grau
  `#aab0b6` — und nach einem Neuladen steht die gespeicherte Farbe wieder da.

## [1.195.0] - 2026-09-07

### Geändert
- **Grey Mode: der Seitenhintergrund noch eine Stufe dunkler — und nachgemessen.**
  Dietmar: „Messen das mal durch. Den Hintergrund noch leicht etwas dunkler."

  Erst auf `#c9ced3`, dann — mit einer Farbprobe nachgereicht — auf die Farbe
  seiner Browser-Werkzeugleiste: „In der Farbe ist meine Taskleiste von meinem
  Browser. Das würde gut passen." Aus dem Bild gemessen: **`#aab0b6`**.

  | Seitenhintergrund | Text | Nebentext | Karte hebt sich ab |
  |---|---|---|---|
  | `#d8dcdf` (1.194.0) | 11,88:1 | 5,26:1 | 1,23:1 |
  | `#c9ced3` (Zwischenschritt) | 10,34:1 | 4,58:1 | 1,41:1 |
  | **`#aab0b6` (neu)** | **7,49:1** | 3,31:1 | **1,95:1** |

  Die 3,31:1 beim Nebentext wären zu blass — **wenn dort Text stünde.** Es steht
  aber keiner: Die Karte deckt die Seite ab, und die Fußzeile sitzt auf ihr
  drauf. Nachgesehen wurde das eigens, mit einer Prüfung, die jedes sichtbare
  Textstück durchgeht und fragt, welche Fläche darunter liegt — bei 1400 und bei
  412 Punkten Breite: null Treffer auf dem Seitenhintergrund.

  Die Flächen darauf bleiben, wie sie sind: Karte 14,63:1, Fragenfeld 13,56:1,
  Filterleiste 12,46:1, Antwortkacheln 16,39:1 — alle weit über der Schwelle.
  Die Karte hebt sich vom Hintergrund jetzt fast doppelt so deutlich ab wie
  vorher (1,95 statt 1,23).

## [1.194.0] - 2026-09-07

### Geändert
- **Der Grey Mode ist jetzt wirklich grau.** Dietmar: „Den Grey Mode wünsche ich
  mir etwas grauer." Er hatte recht — die Karten waren reinweiß, nur der
  Hintergrund war leicht angegraut. Das sah aus wie die helle Ansicht mit einem
  Schatten darunter.

  Alle Flächen sind eine gute Stufe dunkler: die Seite von `#e8eaec` auf
  `#d8dcdf`, die Karte von Weiß auf `#f1f2f4`, Fragenfeld, Verlauf und
  Auswertung von `#f2f4f5` auf `#e7eaec`, Filterleiste und Fortschrittspunkte
  entsprechend. Die Linien sind kräftiger (`#c3c9cf` → `#b4bbc3`), damit die
  Kanten nicht im Grau verschwinden.

  **Nicht angetastet: Eingabefelder und Antwortkacheln.** Die bleiben weiß —
  dort wird gelesen und geschrieben, und Papier ist weiß. Genau dieser
  Unterschied macht das Grau ringsum überhaupt erst sichtbar.

## [1.193.0] - 2026-09-07

### Geändert
- **In der Hauptansicht steht nur noch der Name.** Dietmar: „In der Hauptansicht
  langt Amateurfunk-Trainer, 55 kann da raus." Stimmt — der Name trägt sich
  allein. Das Zeichen bleibt dort, wo kein Text danebenpasst: auf der Taskleiste,
  im Browsertab und auf dem Startbildschirm von Handy und Tablet.

## [1.192.0] - 2026-09-07

### Geändert
- **Aus der 73 wird die 55.** Dietmar: „Das 73 kommt raus, und hier wünsche ich
  mir 55. 55 bedeutet ‚viel Erfolg'."

  Das trifft es besser: 73 ist der Gruß zum Abschied, 55 der Wunsch für das, was
  noch kommt — und genau dafür ist der Trainer da. Neu gezeichnet sind alle fünf
  Dateien: `icon.ico` (sieben Größen von 16 bis 256), `icon.png`, `favicon.ico`,
  `icon-192.png` und `icon-512.png`. In der Kopfzeile steckt das Zeichen als SVG
  in der Seite; auch dort steht jetzt 55.

## [1.191.0] - 2026-09-07

### Geändert
- **Die Rückfrage „Neue Runde?" kommt jetzt im Fenster des Trainers.** Dietmar zum
  grauen Kasten von Chrome: „Das Fenster ist noch Old School. Das wünsche ich mir
  angepasst."

  Der Trainer hat sein eigenes Rückfragefenster — dasselbe, das beim Abbrechen
  einer Runde und beim Löschen des Verlaufs erscheint. Es kennt die hellen und
  dunklen Ansichten, wird vorgelesen und lässt sich mit Escape schließen.
  `confirm()` aus dem Browser kann nichts davon, sieht auf jedem System anders
  aus und schreibt obendrein „localhost:3000 enthält" darüber.

  Dafür gibt es jetzt eine Hilfe `afuRueckfrage()`: Titel, Frage, Aufzählung,
  Beschriftung des Knopfes, und was beim Bestätigen geschehen soll. Die zweite
  Stelle, die schon darauf umgestellt ist: die Frage aus dem Diplome-Fenster, ob
  auf Klasse N umgeschaltet werden soll. Fehlt das Fenster einmal, fällt die
  Hilfe auf `confirm()` zurück — lieber die Notlösung des Browsers als gar keine
  Rückfrage.

- **Im Gruppenraum ist der Knopf „Google KI" weg.** Dietmar: „Im Gruppenraum muss
  der Google-KI-Button raus." Alle bearbeiten dieselben Fragen, und wer sich die
  Antwort nebenbei erklären lässt, übt nicht mehr, sondern sucht. Außerhalb des
  Raums bleibt der Knopf, wo er ist. Gilt für Gastgeber und Gäste gleichermaßen,
  erkannt am laufenden Raum, nicht an der Rolle.

## [1.190.0] - 2026-09-06

### Geändert
- **Nach der Runde geht es weiter, ohne neuen Raum.** Dietmar: „Im Gruppenraum,
  wenn die Runde zu Ende ist, muss ich jedes Mal einen neuen Raum einstellen und
  einen Link versenden. Kann man das anders aufbauen?"

  Konnte man schon — der Knopf „Neue Runde" stand nur im Gruppenraum-Fenster,
  und das ist während der Runde zu. In der Gesamt-Auswertung am Ende steht er
  jetzt an erster Stelle: **„Neue Runde für alle"**. Der Raum bleibt bestehen,
  der Code bleibt derselbe, der verschickte Link gilt weiter — es muss nichts
  noch einmal verschickt werden. Darunter steht dieser Satz auch so da.

  **Und der Weg hinaus heißt jetzt, was er tut.** Vorher stand dort „Hauptmenü",
  und dass damit der Raum zugeht, stand nirgends. Jetzt: beim Gastgeber
  **„Raum beenden"**, beim Gast **„Raum verlassen"** — dazwischen
  **„Fenster schließen"**, das nur die Auswertung wegräumt und alles laufen
  lässt. Beim Gast steht daneben: „Lass das Fenster ruhig zu — startet der
  Trainer eine neue Runde, bist du automatisch dabei."

### Behoben
- **Die alte Auswertung lag über der neuen Runde.** Startete der Gastgeber eine
  neue Runde, blieb bei den Teilnehmern das Auswertungsfenster der vorigen offen,
  und die Merkposten dafür standen noch auf „schon gezeigt" — die nächste
  Auswertung wäre gar nicht mehr erschienen. Beides wird jetzt beim Start einer
  Runde zurückgesetzt.

  Nachgestellt mit zwei Browsern: Gastgeber und Gast im selben Raum, Runde
  durchgespielt, „Neue Runde für alle" — beide stehen danach bei Frage 1 von 25,
  derselbe Raumcode, kein Auswertungsfenster im Weg.

## [1.189.0] - 2026-09-06

### Geändert
- **Neuer Name in der Kopfzeile und ein neues Zeichen.** Dietmar nach den
  Entwürfen: Wortmarke „das zweite", Symbol „F — 73".

  Oben links stand bisher **„Prüfung"** mit einer Satellitenschüssel. Das sagte,
  was man tut, aber nicht, worum es geht — und als Programmname wäre es beliebig
  gewesen. Jetzt steht dort der volle Name: **Amateurfunk-Trainer**, das
  „-Trainer" in Grau abgesetzt. Auch der Titel des Browserfensters heißt so.

  Das Zeichen ist die **73** — der Gruß unter Funkern, weiß auf dem Dunkelblau
  der Kopfzeile. Dasselbe Bild steht jetzt überall:

  | Datei | wofür |
  |---|---|
  | `icon.ico` | die EXE, das Startmenü, die Verknüpfung auf dem Schreibtisch — sieben Größen von 16 bis 256 in einer Datei |
  | `icon.png` | das Zeichen im Browsertab |
  | `favicon.ico` | dasselbe für Browser, die noch danach fragen |
  | `icon-192.png`, `icon-512.png` | die App auf dem Startbildschirm von Handy und Tablet |

  In der Kopfzeile selbst steckt es als SVG in der Seite — keine Bilddatei, die
  beim Weitergeben fehlen könnte.

  Die sieben Größen sind einzeln gezeichnet und nicht aus einem großen Bild
  heruntergerechnet: Bei 16 Punkten entscheidet sich, ob ein Symbol in der
  Taskleiste noch lesbar ist, und dort ist Verkleinern der schnellste Weg zu
  Matsch.

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
