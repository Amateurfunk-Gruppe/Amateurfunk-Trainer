@echo off
title Node.js in den Trainer-Ordner holen
cd /d "%~dp0"

REM ================================================================
REM  Node-Holen.bat
REM
REM  Holt Node.js als Standalone-Fassung in den Unterordner  node\
REM  Kein Installer, keine Administratorrechte, keine Aenderung an
REM  der Registry - es liegt einfach im Trainer-Ordner.
REM
REM  Wozu: Wer den Trainer als ZIP bekommen hat, brauchte bisher erst
REM  eine Installation von nodejs.org. Genau daran ist am 25.08.2026
REM  ein Benutzer haengengeblieben. Mit dieser Datei genuegt ein
REM  Doppelklick.
REM
REM  Die Arbeit steht in node_holen.ps1 - hier wird nur PowerShell
REM  gestartet. Warum PowerShell und nicht wie sonst Javascript: Wer
REM  diese Datei braucht, hat noch kein Node, mit dem sich eine
REM  .js-Datei ausfuehren liesse.
REM ================================================================

if not exist "node_holen.ps1" (
  echo.
  echo   [FEHLER] node_holen.ps1 fehlt in diesem Ordner.
  echo            Beide Dateien gehoeren zusammen.
  echo.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0node_holen.ps1"

echo.
pause
