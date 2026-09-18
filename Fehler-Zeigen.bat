@echo off
title Trainer - warum startet er nicht?
cd /d "%~dp0"

REM ---- Womit wird das Javascript ausgefuehrt? ----------------
REM
REM  Vorrang hat das mitgelieferte Node aus dem Ordner node\. Ist
REM  weder das noch ein installiertes da, wird es geholt statt
REM  abzubrechen - genau wie START.bat es macht.
REM
REM  Anlass (28.08.2026): Nach dem Deinstallieren von Node.js stand
REM  hier nur noch  Der Befehl "node" ist entweder falsch
REM  geschrieben oder konnte nicht gefunden werden.  Das ist keine
REM  Auskunft, mit der jemand etwas anfangen kann - und ausgerechnet
REM  beim Hochladen der falsche Moment dafuer.
REM
REM  Zum Holen wird kein Node gebraucht: node_holen.ps1 ist
REM  PowerShell, und das liegt seit Windows 7 auf jedem Rechner.
set "NODE_EXE=node"
if exist "%~dp0node\node.exe" goto :node_ordner
where node >nul 2>nul
if errorlevel 1 goto :node_holen
goto :node_fertig

:node_holen
echo.
echo   Node.js ist auf diesem Rechner nicht zu finden.
echo   Ich hole es in den Ordner node\ - ohne Installation,
echo   ohne Administratorrechte. Dauert ein bis zwei Minuten.
echo.
if not exist "%~dp0node_holen.ps1" goto :node_fehlt
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0node_holen.ps1"
if not exist "%~dp0node\node.exe" goto :node_fehlt

:node_ordner
set "NODE_EXE=%~dp0node\node.exe"
goto :node_fertig

:node_fehlt
echo.
echo ============================================================
echo   Ohne Node.js geht es hier nicht weiter.
echo.
echo   Spaeter noch einmal versuchen ^(dafuer wird einmal Internet
echo   gebraucht^), oder von Hand https://nodejs.org installieren.
echo ============================================================
echo.
pause
exit /b 1

:node_fertig

REM ============================================================
REM  Diese Datei ist fuer den Fall "das Fenster geht auf und
REM  sofort wieder zu".
REM
REM  Genau dann sieht man die Fehlermeldung nicht - sie steht
REM  eine Zehntelsekunde da und ist weg. Hier bleibt das Fenster
REM  stehen, egal was passiert.
REM
REM  Sie aendert NICHTS. Sie zeigt nur, was los ist.
REM ============================================================

echo ============================================================
echo   Warum startet der Trainer nicht?
echo ============================================================
echo.

REM  Bis zum 18.09.2026 stand hier "where node" - das fand nur ein in
REM  Windows installiertes Node und meldete NICHT GEFUNDEN, obwohl
REM  node\node.exe laengst da war. Gefragt wird jetzt das, womit oben
REM  auch gestartet wird.
echo [1] Node.js
echo     %NODE_EXE%
"%NODE_EXE%" -v
if errorlevel 1 (
  echo     LAEUFT NICHT. Ohne Node.js laeuft der Trainer nicht.
  echo.
  pause
  exit /b 1
)
echo.

echo [2] Sind die Dateien da?
echo.
if exist "Server.js"        (for %%f in ("Server.js")        do echo     Server.js         %%~zf Bytes) else echo     Server.js         FEHLT
if exist "github_update.js" (for %%f in ("github_update.js") do echo     github_update.js  %%~zf Bytes) else echo     github_update.js  FEHLT
if exist "Index.html"       (for %%f in ("Index.html")       do echo     Index.html        %%~zf Bytes) else echo     Index.html        FEHLT
if exist "erklaerungen.json" (for %%f in ("erklaerungen.json") do echo     erklaerungen.json %%~zf Bytes) else echo     erklaerungen.json FEHLT
if exist "node_modules\express\" (echo     node_modules      vorhanden) else (
  echo     node_modules      FEHLT
  echo.
  echo     Dann ist das hier der QUELLTEXT, nicht das fertige Programm -
  echo     so sieht "Source code (zip)" von der Release-Seite aus, oder
  echo     "Code - Download ZIP". Das fertige Programm heisst
  echo         Amateurfunk-Trainer-^<Version^>-windows.zip
  echo     ^(rund 340 MB^) und liegt auf der Release-Seite ganz oben:
  echo         github.com/Amateurfunk-Gruppe/Amateurfunk-Trainer/releases
  echo     Wer den Quelltext absichtlich hat: npm install ausfuehren.
)
if exist "piper\piper.exe"  (echo     piper             vorhanden) else echo     piper             FEHLT - dann wird nicht vorgelesen, sonst nichts
echo.

echo [3] Womit faengt die Server.js an?
echo     ^(Da muss Javascript stehen. Steht dort ^<!DOCTYPE html^>
echo      oder ^<html^>, wurde beim Speichern die Webseite erwischt
echo      statt der Datei - dann noch einmal laden, diesmal ueber
echo      "Raw" bzw. den Link auf raw.githubusercontent.com.^)
echo.
if exist "Server.js" powershell -NoProfile -Command "Get-Content -TotalCount 3 -LiteralPath 'Server.js'" 2>nul
echo.

echo [4] Jetzt wird gestartet. Bricht er ab, steht die Meldung hier:
echo ------------------------------------------------------------
"%NODE_EXE%" Server.js
echo ------------------------------------------------------------
echo.
echo Der Server ist beendet.
echo.
echo Steht oben eine Fehlermeldung, bitte dieses ganze Fenster
echo abfotografieren und weitergeben. Damit ist die Ursache in
echo zwei Minuten geklaert.
echo.
pause
