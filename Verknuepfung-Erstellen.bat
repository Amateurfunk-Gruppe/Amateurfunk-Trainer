@echo off
title Verknuepfung auf den Desktop legen
cd /d "%~dp0"

REM ================================================================
REM  Verknuepfung-Erstellen.bat
REM
REM  Legt eine Verknuepfung "Amateurfunk-Trainer" auf den Desktop,
REM  die START.bat startet - mit dem Funkgeraet-Symbol statt des
REM  grauen Zahnrads, das Windows fuer .bat-Dateien zeigt.
REM
REM  Kann jederzeit erneut ausgefuehrt werden: Ist der Ordner
REM  umgezogen, zeigt die Verknuepfung danach wieder richtig.
REM
REM  Die Arbeit steht in verknuepfung.ps1. PowerShell deshalb, weil
REM  eine .lnk eine Binaerdatei ist und Windows mit WScript.Shell
REM  genau die Schnittstelle mitbringt, die auch der Explorer nutzt.
REM ================================================================

if not exist "verknuepfung.ps1" (
  echo.
  echo   [FEHLER] verknuepfung.ps1 fehlt in diesem Ordner.
  echo            Beide Dateien gehoeren zusammen.
  echo.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0verknuepfung.ps1"

echo.
pause
