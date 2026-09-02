# Lizenz — was die jetzige erlaubt und welche Alternativen es gibt

Stand 02.09.2026. **Das ist keine Rechtsberatung.** Ich bin kein Anwalt; das
Folgende ist eine Auswertung der Lizenztexte, der GitHub-Nutzungsbedingungen
und der einschlägigen Paragraphen. Für eine verbindliche Auskunft — besonders
bei den unten ausdrücklich markierten Auslegungsfragen — braucht es einen
Fachanwalt für Urheber- und IT-Recht.

---

## Die unbequeme Kernaussage

**Die jetzige Lizenz erlaubt genau das, was du befürchtest.**

Die PolyForm Noncommercial 1.0.0 erteilt vier Rechte, und drei davon sind hier
entscheidend:

- **Distribution License** — „The licensor grants you an additional copyright
  license to distribute copies of the software."
- **Changes and New Works License** — „…to make changes and new works based on
  the software for any permitted purpose."
- **Noncommercial Organizations** — „Use by any **charitable organization**,
  educational institution, public research organization […] is use for a
  permitted purpose **regardless of the source of funding**."

Der DARC e.V. verfolgt nach seiner eigenen Satzung (§ 17 Abs. 1)
„ausschließlich und unmittelbar gemeinnützige Zwecke im Sinne des Abschnitts
‚Steuerbegünstigte Zwecke' der Abgabenordnung". Damit fällt er sehr
wahrscheinlich unter „charitable organization" — und selbst ohne diese Klausel
greift „any noncommercial purpose".

**Ein Verein dürfte deinen Quelltext also nehmen, verändern, umbenennen und
kostenlos an seine Mitglieder verteilen.** Die einzige Pflicht wäre, den
Lizenztext oder dessen URL mitzuliefern.

### Und noch etwas, das überrascht

**Deine Namensnennung ist keine Pflicht.** Der Abschnitt *Notices* verlangt nur,
dass der Lizenztext weitergegeben wird — plus alle Klartextzeilen, die mit
`Required Notice:` beginnen. Solche Zeilen gibt es in deinem Projekt bisher
nicht.

Das ist mit einer Zeile in der LICENSE zu ändern, und es ist der billigste
wirksame Schritt, den es hier gibt:

```
Required Notice: Copyright Dietmar Reh — https://github.com/Amateurfunk-Gruppe/Amateurfunk-Trainer
```

Ab dann muss jede weitergegebene Fassung diesen Satz mitführen. Das verhindert
die Weitergabe nicht, aber es verhindert die *namenlose* Weitergabe.

**Unsicher / Auslegungssache:** Ob eine Verteilung über einen kostenpflichtigen
Mitgliederbereich oder ein Bundle mit der Mitgliedschaft noch „noncommercial"
wäre, sagt der Lizenztext nicht. Rechtsprechung zu PolyForm ist mir nicht
bekannt. Die Formulierung „regardless of the source of funding" spricht eher
dafür, dass gemeinnützige Vereine auch bei Einnahmen erfasst sind.

---

## Was tatsächlich hilft — und was nicht

| Maßnahme | Wirkung |
|---|---|
| `installer.iss` aus dem Repo nehmen | Hürde steigt von zehn Minuten auf einen Abend. Verhindert nichts. |
| Datei-Verstecken allgemein | Wirkungslos, solange der Quelltext öffentlich ist. |
| **`Required Notice:` in die LICENSE** | **Namensnennung wird Pflicht. Ein Satz Arbeit.** |
| **Lizenzwechsel auf PolyForm Strict** | **Weitergabe und Veränderung werden verboten.** |
| Unterscheidungskräftiger Name | Schützt davor, dass eine Kopie unter derselben Bezeichnung läuft. |
| Repository privat stellen | Einziger Weg, Forks vollständig auszuschließen. |

---

## Die Lizenzoptionen im Vergleich

| Lizenz | Nutzung | Weitergabe | Veränderung | Verein darf | Kommerziell |
|---|---|---|---|---|---|
| **PolyForm Noncommercial 1.0.0** (jetzt) | ja, nichtkommerziell | **ja** | **ja** | **alles außer kommerziell** | nein |
| **PolyForm Strict 1.0.0** | ja, nichtkommerziell | **nein** | **nein** | nur benutzen | nein |
| Keine Lizenz / „Alle Rechte vorbehalten" | nein | nein | nein | nichts | nein |
| Elastic License 2.0 | ja | ja | ja | ja, inkl. Umbenennen | ja, außer als Dienst |
| Business Source License 1.1 | ja, nicht produktiv | ja | ja | ja | nach max. 4 Jahren Open Source |
| Functional Source License | ja | ja | ja | ja | nach 2 Jahren Apache/MIT |
| MIT / Apache-2.0 (Vergleich) | ja | ja | ja | ja | ja |

**Von den gängigen Lizenzen liefert nur PolyForm Strict 1.0.0 fertig
formuliert, was du willst.** Sie ist die kleine Schwester deiner jetzigen: Die
Nutzungsbedingungen („noncommercial", gemeinnützige Organisationen) sind
wörtlich dieselben — es fehlen schlicht die *Distribution License* und die
*Changes and New Works License*. Der Wechsel ist deshalb klein und in sich
stimmig.

Was er kostet: Auch der freundliche Ortsverband darf dann nichts mehr
weitergeben. Kein Fork, keine Verbesserung, kein Weiterreichen auf dem
USB-Stick. Wer den Trainer haben will, holt ihn bei dir.

---

## Drei Dinge, auf die du dich nicht verlassen darfst

**1. GitHub erlaubt das Forken unabhängig von deiner Lizenz.** Terms of
Service, Abschnitt D.5: „By setting your repositories to be viewed publicly,
you agree to allow others to view and ‚fork' your repositories" — und weiter
eine „nonexclusive, worldwide license to use, display, perform and reproduce
(by forking) Your Content through the Service". Das gilt auch unter PolyForm
Strict und sogar ganz ohne Lizenz. Dem Wortlaut nach ist dieses Recht auf die
Vervielfältigung *innerhalb von GitHub* begrenzt und deckt keine Verteilung
außerhalb der Plattform — aber die genaue Reichweite ist Auslegungssache.

**2. Zurücknehmen geht nicht.** § 29 Abs. 1 UrhG: Das Urheberrecht selbst ist
nicht übertragbar, es bleibt dauerhaft bei dir. Umlizenzieren kannst du
jederzeit — aber nur **für die Zukunft**. Was unter PolyForm Noncommercial
herausgegangen ist, bleibt für diese Kopien so. Der Rückruf nach § 41 UrhG
betrifft ausdrücklich nur ausschließliche Nutzungsrechte und greift hier nicht.

**3. „Amateurfunk-Trainer" ist als Marke voraussichtlich nicht schützbar.**
§ 8 Abs. 2 MarkenG schließt Zeichen ohne Unterscheidungskraft und rein
beschreibende Angaben aus. Der Name beschreibt für eine Lernsoftware genau das,
was sie ist — Gattung plus Zweck. Auch der Werktitelschutz nach § 5 Abs. 3
MarkenG hilft nicht: Der BGH hat für Software und Apps (*wetter.de*,
I ZR 202/14) die abgesenkten Maßstäbe der Zeitschriftentitel gerade **nicht**
angewandt und „wetter.de" die Unterscheidungskraft abgesprochen.

Ein Kunstwort wäre der wirksamste Schritt gegen eine gleichnamige Kopie.
PolyForm erteilt ohnehin keine Namensrechte — das nützt nur nichts, solange der
Name selbst nicht schutzfähig ist.

---

## Was ich an deiner Stelle täte

**Sofort und kostenlos:** die `Required Notice:`-Zeile in die LICENSE. Ein Satz,
und dein Name muss ab dann mitreisen.

**Wenn du die Weitergabe wirklich unterbinden willst:** Wechsel auf PolyForm
Strict 1.0.0. Ehrlich zu Ende gedacht — es trifft nicht nur den DARC, sondern
auch jeden Ortsverband, der den Trainer im Kurs einsetzen und weiterreichen
möchte.

**Was ich lassen würde:** Repository privat stellen. Deine öffentliche,
tagesgenaue Historie ist im Moment dein bester Beleg dafür, wer zuerst da war.
Die gibst du damit auf.

---

## Quellen

- PolyForm Noncommercial 1.0.0 — https://polyformproject.org/licenses/noncommercial/1.0.0/
- PolyForm Strict 1.0.0 — https://polyformproject.org/licenses/strict/1.0.0/
- PolyForm Übersicht — https://polyformproject.org/licenses/
- GitHub Terms of Service, D.5 / D.6 — https://docs.github.com/en/site-policy/github-terms/github-terms-of-service
- GitHub, „Licensing a repository" — https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository
- Elastic License 2.0 — https://www.elastic.co/licensing/elastic-license
- Business Source License 1.1 — https://mariadb.com/bsl11/
- Functional Source License — https://fsl.software/
- Open Source Definition — https://opensource.org/osd
- § 29 UrhG — https://dejure.org/gesetze/UrhG/29.html
- § 41 UrhG — https://dejure.org/gesetze/UrhG/41.html
- § 8 MarkenG — https://dejure.org/gesetze/MarkenG/8.html
- § 5 MarkenG — https://dejure.org/gesetze/MarkenG/5.html
- Werktitelschutz Software, BGH I ZR 202/14 — https://www.ra-plutte.de/werktitel/
- DARC e.V. Satzung — https://www.darc.de/fileadmin/filemounts/gs/technik/SATZU64_Febr_2026.pdf
