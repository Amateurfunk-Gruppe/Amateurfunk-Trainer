## Installation

1. **Amateurfunk-Trainer-1.108.0.exe** herunterladen und starten.
2. Der Assistent fragt, wohin installiert wird.
3. Windows meldet "Unbekannter Herausgeber": *Weitere Informationen* → *Trotzdem ausführen*.

Enthalten sind Node.js, die Sprachausgabe mit deutscher Stimme, der amtliche Fragenkatalog und die Formelsammlung. Beim Einrichten wird keine Internetverbindung gebraucht.

Beim Update bleibt der Lernstand erhalten – der Ordner `data\` wird nicht angefasst. Beim Deinstallieren wird gefragt, ob er mit weg soll.

## Änderungen

### 1.108.0 – 2026-09-02

**Geändert**
- Der Abgleich mit GitHub geht jetzt den dortigen Dateibaum durch statt einer festen
  Liste von 16 Namen — eine neu hinzugefügte Datei fällt damit überhaupt erst auf
- Unterordner werden mit abgeglichen (`svgs\`, `formelsammlung\`, `fontawesome\`);
  fehlende Ordner werden beim Übernehmen angelegt
- Einteilung daten/browser/programm jetzt nach Endung statt nach Namensliste; im
  Zweifel gilt eine `.js` als Programmdatei und verlangt die ausdrückliche Bestätigung

**Hinzugefügt**
- `LIZENZ-Optionen.md` — was die PolyForm Noncommercial erlaubt, was PolyForm Strict
  ändern würde, und was GitHubs Nutzungsbedingungen unabhängig davon offenlassen

**Sicherheit**
- Erlaubt sind nur ungefährliche Endungen (Umkehr der Beweislast): `.bat`, `.vbs`,
  `.ps1`, `.exe`, `.cmd`, `.py`, `.sh` und `.iss` kommen nie über den Abgleich
- `data\`, `backup\`, `Hoerbuch\`, `release\`, `tts_cache\` und `bilder\` sind tabu
- Pfade mit `..`, führendem `/` oder Laufwerksbuchstaben werden abgewiesen — der
  Dateibaum kommt aus einer fremden Quelle und bestimmt sonst, wohin geschrieben wird
- Die Prüfung läuft zweimal: beim Auflisten und noch einmal kurz vor dem Schreiben

Ausführlich in [CHANGELOG.md](https://github.com/Amateurfunk-Gruppe/Amateurfunk-Trainer/blob/main/CHANGELOG.md).
