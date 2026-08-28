@echo off
title Warum kommt kein Update an?
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
"%NODE_EXE%" update_pruefen.js
echo.
pause
