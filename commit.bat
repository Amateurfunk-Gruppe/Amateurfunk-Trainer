@echo off
REM Kleines Hilfsskript: sichert den aktuellen Stand als Git-Commit.
REM
REM Drei Wege, es zu benutzen:
REM   1) Doppelklick -> Nachricht eintippen -> Enter.
REM   2) Wenn eine Datei "commit_message.txt" im Ordner liegt (die legt Claude
REM      nach einer Bestaetigung "funktioniert" hier ab), wird sie als
REM      Vorschlag angezeigt - einfach Enter druecken, um ihn zu uebernehmen.
REM   3) Aus einem Terminal mit Text als Parameter: commit.bat "Meine Nachricht"
cd /d "%~dp0"

git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
  echo [FEHLER] Hier ist noch kein Git-Repository eingerichtet.
  echo          Einmalig "git init" in diesem Ordner ausfuehren.
  pause
  exit /b 1
)

echo ============================================================
echo   Aktuelle Aenderungen seit dem letzten Commit:
echo ============================================================
git status --short
echo.

set "vorschlag="
if exist "commit_message.txt" (
  set /p vorschlag=<commit_message.txt
)

if not "%~1"=="" (
  set "msg=%~1"
) else if not "%vorschlag%"=="" (
  echo Vorschlag von Claude: %vorschlag%
  set /p msg="Commit-Nachricht (Enter = Vorschlag uebernehmen): "
  if "%msg%"=="" set "msg=%vorschlag%"
) else (
  set /p msg="Commit-Nachricht eingeben: "
)

if "%msg%"=="" (
  echo Keine Nachricht eingegeben - abgebrochen.
  pause
  exit /b 1
)

git add -A
git commit -m "%msg%"

if exist "commit_message.txt" del "commit_message.txt"

echo.
echo ============================================================
echo   Letzte 5 Commits:
echo ============================================================
git log --oneline -5
echo.
pause
