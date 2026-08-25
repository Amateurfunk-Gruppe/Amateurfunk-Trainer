# Amateurfunk-Trainer

Ein Lernprogramm für die deutsche Amateurfunkprüfung — **Klasse N, E und A**.
Läuft auf dem eigenen Rechner, ohne Konto, ohne Internetzwang, ohne Werbung.

Der Lernfortschritt bleibt dort, wo er entsteht: auf dem eigenen Rechner.

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

## Loslegen

Voraussetzung ist [Node.js](https://nodejs.org) (kostenlos).

    git clone https://github.com/Amateurfunk-Gruppe/Amateurfunk-Trainer.git
    cd Amateurfunk-Trainer
    npm install

Danach Doppelklick auf **START.bat** — der Trainer öffnet sich im Browser.

Für die natürliche Sprachausgabe einmal **piper.bat** ausführen; das lädt rund
80 MB und richtet die deutsche Stimme „Thorsten" ein. Der Trainer läuft auch ohne.

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

## Lizenz

MIT — siehe [LICENSE](LICENSE). Für den Fragenkatalog gilt die Datenlizenz
Deutschland, für `lame.js` die LGPL; beides ist oben genannt.
