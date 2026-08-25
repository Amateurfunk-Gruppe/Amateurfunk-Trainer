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
  const fehlt = ['backup/', 'Klasse-N-Lernstand_*.json', 'data/', 'Node.js/']
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

  // ---- Vorschau: was kaeme in den ersten Commit? ----
  //
  // Erster Anlauf war "git ls-files --others --cached --exclude-standard"
  // - und der log: --cached listet alles auf, was das ALTE Repository
  // nachverfolgt, ganz gleich was in der .gitignore steht. Genau die vier
  // heiklen Dateien tauchten damit auf, obwohl ein frisches Repository sie
  // gar nicht aufnehmen wuerde.
  //
  // Richtig ist, den Ordner selbst zu durchlaufen und git zu jeder Datei
  // zu fragen, ob die .gitignore sie ausnimmt. Ganze Ordner werden dabei
  // im Ganzen uebersprungen - node_modules und piper einzeln abzuklopfen
  // dauerte sonst Minuten.
  function ignoriertGit(relPfad) {
    try {
      execSync('git check-ignore -q --no-index "' + relPfad + '"', { cwd: WURZEL, stdio: 'ignore' });
      return true;
    } catch (e) { return false; }
  }
  function sammeln(rel, raus) {
    for (const e of fs.readdirSync(path.join(WURZEL, rel || '.'), { withFileTypes: true })) {
      const r = rel ? rel + '/' + e.name : e.name;
      if (e.name === '.git' || e.name.startsWith('.git_alt_')) continue;
      if (ignoriertGit(r)) continue;
      if (e.isDirectory()) sammeln(r, raus);
      else if (e.isFile()) raus.push(r);
      if (raus.length > 5000) return;          // Notbremse
    }
  }
  let liste = [];
  try { sammeln('', liste); }
  catch (e) { console.log('(Vorschau nicht moeglich: ' + e.message + ')'); }

  console.log('');
  if (hatGit) {
    console.log('Alte Historie:   ' + mb(groesse(path.join(WURZEL, '.git'))) + '  ->  wird nach .git_alt_' + heute + ' umbenannt');
    console.log('                 (bleibt vollstaendig auf deinem Rechner, kommt nur nie ins Netz)');
  } else {
    console.log('Es gibt noch kein Repository - es wird eines angelegt.');
  }
  console.log('');
  if (liste.length) {
    const heikel = liste.filter(d => /^(data|backup)\//i.test(d) || /Lernstand_.*\.json$/i.test(d)
                                  || /^Node\.js\//i.test(d) || /^piper\//i.test(d) || /^node_modules\//i.test(d));
    console.log('In den ersten Commit kaemen ' + liste.length + ' Dateien.');
    if (heikel.length) {
      console.log('');
      console.log('!! ABBRUCH: Davon sind ' + heikel.length + ' heikel:');
      heikel.slice(0, 15).forEach(d => console.log('   ' + d));
      console.log('Bitte melden - da stimmt an der .gitignore etwas nicht.');
      return;
    }
    console.log('Nichts Persoenliches dabei, nichts Uebergrosses.');
  }
  console.log('');
  console.log('Was passiert:');
  console.log('  1. .git wird zu .git_alt_' + heute + ' umbenannt (nichts geht verloren)');
  console.log('  2. ein frisches Repository wird angelegt');
  console.log('  3. ein erster Commit mit dem heutigen Stand');
  console.log('  4. zur Kontrolle laeuft die Pruefung noch einmal');
  console.log('');
  console.log('Hochgeladen wird NICHTS - das machst du danach selbst.');
  console.log('');

  const frage = readline.createInterface({ input: process.stdin, output: process.stdout });
  frage.question('Neustart der Historie?  [j/n]  ', (antwort) => {
    frage.close();
    if (!/^j/i.test(antwort.trim())) { console.log('\nAbgebrochen - es wurde nichts angefasst.'); return; }
    try {
      if (hatGit) {
        if (fs.existsSync(altPfad)) { console.log('\n' + altPfad + ' gibt es schon. Bitte erst wegraeumen.'); return; }
        fs.renameSync(path.join(WURZEL, '.git'), altPfad);
        console.log('  alte Historie gesichert nach .git_alt_' + heute);
      }
      git('init -q');
      // Standardzweig "main" - so heisst er bei GitHub seit 2020.
      try { git('symbolic-ref HEAD refs/heads/main'); } catch (e) { /* aeltere Git-Fassung */ }
      git('add -A');
      const dabei = git('diff --cached --name-only').split('\n').filter(Boolean);
      // .git_alt_ steht hier mit drin, weil beim ersten Test genau das
      // passiert ist: "git add -A" nahm die zur Seite gelegte alte Historie
      // als gewoehnliche Dateien mit auf - samt der Objekte, in denen der
      // Lernstand steckt. Der ganze Neustart waere umsonst gewesen.
      const schlimm = dabei.filter(d => /^(data|backup)\//i.test(d) || /Lernstand_.*\.json$/i.test(d)
                                     || /^\.git_alt_/i.test(d));
      if (schlimm.length) {
        // Letzte Sicherung. Greift sie, wird alles zurueckgedreht: das
        // frische Repository weg, die alte Historie wieder an ihren Platz.
        // Ein halb angelegtes Repository ist schlimmer als gar keines.
        console.log('\n!! Es waeren doch persoenliche Dateien dabei:');
        schlimm.slice(0, 10).forEach(d => console.log('   ' + d));
        try {
          fs.rmSync(path.join(WURZEL, '.git'), { recursive: true, force: true });
          if (fs.existsSync(altPfad)) fs.renameSync(altPfad, path.join(WURZEL, '.git'));
          console.log('Alles zurueckgedreht - der Ordner ist wie vorher.');
        } catch (e2) { console.log('Zuruecknehmen fehlgeschlagen: ' + e2.message); }
        return;
      }
      git('commit -q -m "Amateurfunk-Trainer - Klassen N, E und A"');
      console.log('  ' + dabei.length + ' Dateien im ersten Commit.');
      console.log('');
      console.log('Fertig. Zur Kontrolle:');
      console.log('');
      try { console.log(execSync('node github_pruefen.js', { cwd: WURZEL, encoding: 'utf8' })); }
      catch (e) { console.log('  (Pruefung nicht ausfuehrbar: ' + e.message + ')'); }
      console.log('Jetzt kannst du das Repository bei GitHub anlegen und hochladen.');
    } catch (e) {
      console.log('\nFehler: ' + e.message);
      console.log('Falls .git schon umbenannt wurde, liegt die alte Historie in .git_alt_' + heute + '.');
    }
  });
}

main();
