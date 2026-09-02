// ================================================================
//  Start.js - damit sich die Verknuepfung anheften laesst
// ================================================================
//  Dietmar am 01.09.2026: "Es gab keine Verknuepfung in meiner
//  Taskleiste." Und kurz darauf, mit dem Ziel aus den Eigenschaften
//  der Verknuepfung:
//
//      C:\WINDOWS\system32\wscript.exe "C:\...\START.vbs"
//
//  Das ist die Ursache. Windows heftet nur Verknuepfungen an die
//  Taskleiste, deren Ziel ein richtiges Programm ist. Zeigt sie auf
//  wscript.exe - den Skript-Wirt von Windows -, fehlt im Rechtsklick
//  sogar der Menuepunkt. Kein Haken im Setup haette daran etwas
//  geaendert; das Ziel der Verknuepfung war das Problem.
//
//  Diese Datei ist nichts weiter als ein Tuerschild. Die Verknuepfung
//  zeigt jetzt auf node\node.exe - ein richtiges Programm, also
//  anheftbar - und node fuehrt diese paar Zeilen aus: START.vbs
//  starten, abgekoppelt und ohne Fenster, dann selbst Feierabend.
//
//  WARUM NICHT GLEICH DEN SERVER:
//  In START.vbs steckt alles, was beim Start schiefgehen kann - der
//  belegte Port, die Rueckfrage, die fehlende node.exe. Das ein
//  zweites Mal hinzuschreiben hiesse, es ein zweites Mal pflegen zu
//  muessen; und die zweite Fassung ist immer die, die vergessen wird.
// ================================================================
'use strict';
const { spawn } = require('child_process');
const path = require('path');

const ordner = __dirname;
const vbs = path.join(ordner, 'START.vbs');

try {
  const kind = spawn('wscript.exe', ['//nologo', vbs], {
    cwd: ordner,
    detached: true,      // ueberlebt es, wenn dieses Fenster zugeht
    stdio: 'ignore',
    windowsHide: true    // kein eigenes Fenster fuer das Skript
  });
  kind.unref();
} catch (e) {
  // Ohne wscript.exe geht gar nichts - das gehoert seit Jahrzehnten zu
  // Windows. Falls doch: sichtbar machen, nicht stumm scheitern.
  console.error('START.vbs liess sich nicht starten: ' + e.message);
  console.error('Ersatzweise: START.bat im Trainer-Ordner.');
  process.exitCode = 1;
}
