// ================================================================
// hochladen.js - der letzte Schritt: das fertige Repository zu GitHub.
//
// WAS DAS SKRIPT NICHT TUT:
// Es fragt dich NICHT nach Passwort oder Zugangsdaten und speichert
// auch keine. Das erledigt git selbst - beim ersten Hochladen oeffnet
// der Windows-Anmeldeinformationsmanager ein Fenster oder schickt dich
// in den Browser. Deine Anmeldedaten bleiben zwischen dir, Windows und
// GitHub. Kein Skript und kein Helfer muss sie je zu sehen bekommen.
//
// WAS ES TUT:
//   1. prueft, ob ueberhaupt etwas Committetes da ist
//   2. zeigt noch nicht committete Aenderungen und fragt, ob sie mit
//      sollen - "git push" nimmt nur Committetes mit, sonst wundert man
//      sich hinterher, warum der neueste Stand nicht oben ist
//   3. laesst github_pruefen.js laufen und BRICHT AB, wenn dort etwas
//      Heikles auftaucht - hochgeladen ist hochgeladen
//   4. traegt die Adresse ein, benennt den Zweig in "main"
//   5. fragt noch einmal nach, dann laedt es hoch
//
// Aufruf:  Doppelklick auf  Hochladen.bat
// ================================================================
'use strict';
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const WURZEL = __dirname;

// Zwei Rueckfragen nacheinander gehen mit dem rohen readline schlecht.
// Deshalb eine kleine Huelle, die sich mit await abwarten laesst.
function fragen(text) {
  return new Promise((fertig) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(text, (a) => { rl.close(); fertig(String(a || '').trim()); });
  });
}
const ja = (a) => /^j/i.test(a);
const KONTO = 'Amateurfunk-Gruppe';
const REPO = 'Amateurfunk-Trainer';
const ADRESSE = 'https://github.com/' + KONTO + '/' + REPO + '.git';

// stdio ausdruecklich gesetzt: sonst schreibt git seine Fehlermeldungen
// direkt ins Fenster. Bei "gibt es noch kein origin" - was voellig normal
// ist - stuende dort ein rotes "error: No such remote", und das sieht nach
// Schaden aus, wo keiner ist. Die Meldungen werden eingefangen und dort
// ausgegeben, wo sie etwas erklaeren.
const git = (b) => execSync('git ' + b, {
  cwd: WURZEL, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
  stdio: ['ignore', 'pipe', 'pipe'],
});
const gitFehler = (e) => String((e && e.stderr) || (e && e.message) || '').trim().split('\n')[0];

async function main() {
  console.log('');

  // ---- git ueberhaupt vorhanden? ----
  try { execSync('git --version', { encoding: 'utf8' }); }
  catch (e) {
    console.log('  Git ist nicht installiert oder nicht im Pfad.');
    console.log('  Zu holen bei: https://git-scm.com/download/win');
    return;
  }

  try { git('rev-parse --is-inside-work-tree'); }
  catch (e) {
    console.log('  Hier ist kein Repository. Erst GitHub-Neustart.bat ausfuehren.');
    return;
  }

  let anzahl = 0;
  try { anzahl = git('rev-list --count HEAD').trim(); }
  catch (e) {
    console.log('  Es gibt noch keinen Commit. Erst GitHub-Neustart.bat ausfuehren.');
    return;
  }

  // ---- Was noch nicht committet ist, faehrt auch nicht mit ----
  //
  // "git push" schiebt Commits, keine Dateien. Wer den Trainer aendert und
  // dann hochlaedt, ohne zu committen, bekommt bei GitHub den Stand von
  // vorgestern und sucht den Fehler an der falschen Stelle.
  let offen = [];
  try { offen = git('status --porcelain').split('\n').filter(Boolean); } catch (e) {}
  if (offen.length) {
    console.log('');
    console.log('  ' + offen.length + ' Aenderung(en) sind noch nicht committet:');
    offen.slice(0, 20).forEach(z => console.log('     ' + z.trim()));
    if (offen.length > 20) console.log('     ... und ' + (offen.length - 20) + ' weitere');
    console.log('');
    console.log('  Ohne Commit bleiben sie hier liegen und gehen nicht mit hoch.');
    const mit = await fragen('  Jetzt mit aufnehmen?  [j/n]  ');
    if (ja(mit)) {
      try {
        git('add -A');
        git('commit -q -m "Stand vom Tag des Hochladens"');
        console.log('  Aufgenommen.');
      } catch (e) {
        console.log('  Commit fehlgeschlagen: ' + gitFehler(e));
        return;
      }
    } else {
      console.log('  Gut - es geht der zuletzt committete Stand hoch.');
    }
    console.log('');
  }

  // ---- Sicherheitsnetz: die Pruefung muss SAUBER sagen ----
  //
  // Diese Abfrage ist der eigentliche Wert des Skripts. Ein Push laesst
  // sich nicht zurueckholen: wer den Stand in der Zwischenzeit gezogen
  // hat, hat ihn. Deshalb wird hier nicht gewarnt, sondern abgebrochen.
  console.log('  Pruefe, was hochgeladen wuerde ...');
  let bericht = '';
  try { bericht = execSync('node github_pruefen.js', { cwd: WURZEL, encoding: 'utf8' }); }
  catch (e) { bericht = String((e.stdout || '') + (e.stderr || '')); }
  if (!/SAUBER/.test(bericht)) {
    console.log('');
    console.log(bericht.trim());
    console.log('');
    console.log('  !! ABBRUCH. Die Pruefung meldet kein "SAUBER".');
    console.log('  Es wurde nichts hochgeladen. Schick mir die Ausgabe oben.');
    return;
  }
  const dateien = (bericht.match(/nachverfolgt: (\d+)/) || [, '?'])[1];
  // Frisch lesen: oben stand die Zahl von VOR dem moeglichen neuen Commit.
  try { anzahl = git('rev-list --count HEAD').trim(); } catch (e) {}
  console.log('  Sauber: ' + dateien + ' Dateien, ' + anzahl + ' Commit(s).');

  // ---- Die Stimmen duerfen hier nicht mitfahren ----
  let verfolgt = [];
  try { verfolgt = git('ls-files').split('\n').filter(Boolean); } catch (e) {}
  const zuGross = verfolgt.filter(d => {
    try { return fs.statSync(path.join(WURZEL, d)).size > 100 * 1024 * 1024; } catch (e) { return false; }
  });
  if (zuGross.length) {
    console.log('');
    console.log('  !! ABBRUCH. Diese Datei ist ueber 100 MiB, GitHub lehnt sie ab:');
    zuGross.forEach(d => console.log('     ' + d));
    console.log('  Sie gehoert als Release-Anhang hin, nicht ins Repository.');
    return;
  }

  // ---- Adresse eintragen ----
  let hatte = '';
  try { hatte = git('remote get-url origin').trim(); } catch (e) {}
  if (hatte && hatte !== ADRESSE) {
    console.log('  Adresse war: ' + hatte);
    console.log('  wird ersetzt durch: ' + ADRESSE);
  }
  try {
    if (hatte) git('remote set-url origin ' + ADRESSE);
    else git('remote add origin ' + ADRESSE);
    git('branch -M main');
  } catch (e) {
    console.log('  Fehler beim Eintragen der Adresse: ' + gitFehler(e));
    return;
  }

  console.log('');
  console.log('  Ziel: ' + ADRESSE);
  console.log('');
  console.log('  Das Repository muss bei GitHub schon angelegt sein -');
  console.log('  leer, ohne Haekchen bei README, .gitignore oder Lizenz.');
  console.log('  Falls noch nicht: github.com/new, Name ' + REPO);
  console.log('');
  console.log('  Beim ersten Mal fragt Windows nach deiner GitHub-Anmeldung.');
  console.log('  Das ist git, nicht dieses Skript.');
  console.log('');

  const antwort = await fragen('  Jetzt hochladen?  [j/n]  ');
  {
    if (!ja(antwort)) { console.log('\n  Abgebrochen. Nichts hochgeladen.\n'); return; }
    console.log('');
    // Durchgereicht statt eingefangen: git muss sein Anmeldefenster
    // oeffnen und seinen Fortschritt zeigen koennen.
    const r = spawnSync('git', ['push', '-u', 'origin', 'main'], { cwd: WURZEL, stdio: 'inherit' });
    console.log('');
    if (r.status === 0) {
      console.log('  Fertig. Zu sehen unter:');
      console.log('  https://github.com/' + KONTO + '/' + REPO);
      console.log('');
      // Nur raten, was noch fehlt. Wer das ZIP laengst gebaut hat, soll
      // nicht bei jedem Hochladen aufgefordert werden, es nochmal zu bauen.
      const zip = path.join(WURZEL, 'Piper-Stimmen.zip');
      if (fs.existsSync(zip)) {
        const gr = (fs.statSync(zip).size / 1024 / 1024).toFixed(1).replace('.', ',');
        console.log('  Piper-Stimmen.zip liegt bereit (' + gr + ' MiB).');
        console.log('  Auf der Seite "Releases" -> "Create a new release",');
        console.log('  Tag vergeben und die Datei ins Feld ziehen.');
      } else {
        console.log('  Jetzt noch die Stimmen: Stimmen_packen.bat ausfuehren,');
        console.log('  dann auf der Seite "Releases" -> "Create a new release",');
        console.log('  Tag v1.0, und Piper-Stimmen.zip ins Feld ziehen.');
      }
    } else {
      console.log('  Hochladen fehlgeschlagen. Haeufigste Gruende:');
      console.log('    - das Repository gibt es bei GitHub noch nicht');
      console.log('    - es wurde MIT README angelegt (dann ist es nicht leer)');
      console.log('    - die Anmeldung wurde abgebrochen');
      console.log('  Es ist nichts kaputtgegangen. Schick mir die Meldung oben.');
    }
    console.log('');
  }
}

main();
