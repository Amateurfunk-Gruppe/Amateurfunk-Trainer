// ================================================================
// github_neustart.js - frische Git-Historie, ohne die alten Lasten.
//
// WARUM UEBERHAUPT:
// Die Pruefung hat drei Dinge gefunden, die nicht ins Netz sollen:
//   backup/amateurfunk_data.json        - Lernstand, persoenliche Daten
//   Klasse-N-Lernstand_2026-08-20.json  - gesicherter Lernstand
//   Node.js/node-v22.14.0-x64.msi       - 29,5 MB Installer (nur Historie)
//
// Die ersten beiden aus der Ablage zu nehmen reicht NICHT. Sie stecken in
// alten Commits, und beim Push geht die ganze Historie mit. Historie
// nachtraeglich umzuschreiben (filter-repo, BFG) geht, ist aber fehler-
// anfaellig und hinterlaesst bei einem Fehlgriff Reste.
//
// Fuer ein drei Wochen altes Projekt eines einzelnen Entwicklers ist der
// einfache Weg auch der sichere: eine frische Historie. Was in den alten
// Commits steckte, ist ohnehin in CHANGELOG.md beschrieben - ausfuehrlicher,
// als es Commit-Zeilen je waeren.
//
// DIE ALTE HISTORIE WIRD NICHT GELOESCHT, sondern nach .git_alt_<Datum>
// umbenannt. Sie bleibt auf deinem Rechner vollstaendig erhalten - nur
// oeffentlich wird sie nie. Willst du sie zurueck: Ordner .git loeschen
// und .git_alt_<Datum> in .git umbenennen.
//
// Aufruf:  Doppelklick auf  GitHub-Neustart.bat
// ================================================================
'use strict';
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const WURZEL = __dirname;
const git = (b) => execSync('git ' + b, { cwd: WURZEL, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const mb = (b) => (b / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';

function groesse(p) {
  try {
    const st = fs.statSync(p);
    if (st.isFile()) return st.size;
    let s = 0;
    for (const e of fs.readdirSync(p, { withFileTypes: true })) s += groesse(path.join(p, e.name));
    return s;
  } catch (e) { return 0; }
}

function main() {
  if (!fs.existsSync(path.join(WURZEL, '.gitignore'))) {
    console.log('Es fehlt die .gitignore. Bitte erst die neue Fassung einspielen.');
    return;
  }
  // Ohne diese Zeile waere die neue Historie so unsauber wie die alte.
  const ignoriert = fs.readFileSync(path.join(WURZEL, '.gitignore'), 'utf8');
  const fehlt = ['backup/', 'Klasse-N-Lernstand_*.json', 'data/', 'Node.js/', '.git_alt_*/']
    .filter(m => !ignoriert.includes(m));
  if (fehlt.length) {
    console.log('Die .gitignore ist noch nicht die neue Fassung. Es fehlt: ' + fehlt.join(', '));
    console.log('Bitte erst die neue .gitignore einspielen, sonst waere das neue');
    console.log('Repository genauso unsauber wie das alte.');
    return;
  }

  const hatGit = fs.existsSync(path.join(WURZEL, '.git'));
  const heute = new Date().toISOString().slice(0, 10);
  const altPfad = path.join(WURZEL, '.git_alt_' + heute);

  // ---- Vorbereiten, dann fragen ----
  //
  // ZWEITER ANLAUF. Der erste baute eine Vorschau, indem er den Ordner
  // durchlief und git zu JEDER Datei fragte, ob die .gitignore sie
  // ausnimmt. Bei 746 Zeichnungen im svgs-Ordner sind das ueber 900
  // einzelne git-Aufrufe - unter Windows startet jeder einen eigenen
  // Prozess. Das Fenster stand danach eine Minute lang leer da und sah
  // aus, als haenge es. (Es hing nicht, es rechnete.)
  //
  // Jetzt macht git die Arbeit selbst: umbenennen, "git init", "git add"
  // - das dauert einen Wimpernschlag und beachtet die .gitignore ohnehin.
  // Erst DANN wird gezeigt, was drin waere, und gefragt. Ein Nein dreht
  // alles zurueck: neues Repository weg, alte Historie zurueck an ihren
  // Platz. Committet wird nichts, ehe du zugestimmt hast.
  console.log('');
  if (hatGit) {
    console.log('Alte Historie: ' + mb(groesse(path.join(WURZEL, '.git')))
      + '  ->  wird nach .git_alt_' + heute + ' gelegt (bleibt auf deinem Rechner)');
  } else {
    console.log('Es gibt noch kein Repository - es wird eines angelegt.');
  }
  console.log('Einen Moment, git sortiert ...');

  if (hatGit && fs.existsSync(altPfad)) {
    console.log('\n' + altPfad + ' gibt es schon. Bitte erst wegraeumen.');
    return;
  }

  let liste = [];
  try {
    if (hatGit) fs.renameSync(path.join(WURZEL, '.git'), altPfad);
    git('init -q');
    try { git('symbolic-ref HEAD refs/heads/main'); } catch (e) { /* aeltere Git-Fassung */ }
    git('add -A');
    liste = git('diff --cached --name-only').split('\n').filter(Boolean);
  } catch (e) {
    console.log('\nFehler beim Vorbereiten: ' + e.message);
    zurueckdrehen();
    return;
  }

  function zurueckdrehen() {
    try {
      fs.rmSync(path.join(WURZEL, '.git'), { recursive: true, force: true });
      if (fs.existsSync(altPfad)) fs.renameSync(altPfad, path.join(WURZEL, '.git'));
      console.log('Zurueckgedreht - der Ordner ist wie vorher.');
    } catch (e) { console.log('Zuruecknehmen fehlgeschlagen: ' + e.message); }
  }

  const heikel = liste.filter(d => /^(data|backup)\//i.test(d) || /Lernstand_.*\.json$/i.test(d)
                                || /^\.git_alt_/i.test(d) || /^Node\.js\//i.test(d)
                                || /^(piper|node_modules|tts_cache|Hoerbuch)\//i.test(d));
  console.log('');
  console.log('Es waeren ' + liste.length + ' Dateien im ersten Commit.');
  if (heikel.length) {
    console.log('');
    console.log('!! ABBRUCH: Davon sind ' + heikel.length + ' heikel:');
    heikel.slice(0, 15).forEach(d => console.log('   ' + d));
    zurueckdrehen();
    return;
  }
  console.log('Nichts Persoenliches dabei, nichts Uebergrosses.');
  console.log('');
  console.log('Sagst du ja, wird ein erster Commit angelegt.');
  console.log('Sagst du nein, wird alles zurueckgedreht - als waere nichts gewesen.');
  console.log('Hochgeladen wird so oder so NICHTS.');
  console.log('');

  const frage = readline.createInterface({ input: process.stdin, output: process.stdout });
  frage.question('Ersten Commit anlegen?  [j/n]  ', (antwort) => {
    frage.close();
    if (!/^j/i.test(antwort.trim())) { console.log(''); zurueckdrehen(); return; }
    try {
      git('commit -q -m "Amateurfunk-Trainer - Klassen N, E und A"');
      console.log('  ' + liste.length + ' Dateien im ersten Commit.');
      console.log('');
      console.log('Zur Kontrolle:');
      try { console.log(execSync('node github_pruefen.js', { cwd: WURZEL, encoding: 'utf8' })); }
      catch (e) { console.log('  (Pruefung nicht ausfuehrbar: ' + e.message + ')'); }
      console.log('Die alte Historie liegt in .git_alt_' + heute + ' - dort und nur dort.');
      console.log('Jetzt kannst du das Repository bei GitHub anlegen und hochladen.');
    } catch (e) {
      console.log('\nFehler beim Commit: ' + e.message);
      zurueckdrehen();
    }
  });
}

main();
