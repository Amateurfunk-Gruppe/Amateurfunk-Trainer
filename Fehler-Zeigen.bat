@echo off
title Trainer - warum startet er nicht?
cd /d "%~dp0"

REM ---- Womit wird das Javascript ausgefuehrt? ----------------
REM Vorrang hat das mitgelieferte Node aus dem Ordner node\ - so
REM laeuft dieses Werkzeug auch dann, wenn auf dem Rechner kein
REM Node.js mehr installiert ist (Node-Holen.bat legt es an).
set "NODE_EXE=node"
if exist "%~dp0node\node.exe" set "NODE_EXE=%~dp0node\node.exe"

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

echo [1] Node.js
where node >nul 2>nul
if errorlevel 1 (
  echo     NICHT GEFUNDEN. Ohne Node.js laeuft der Trainer nicht.
  echo     Zu holen bei https://nodejs.org
  echo.
  pause
  exit /b 1
)
node -v
echo.

echo [2] Sind die Dateien da, und wie gross sind sie?
echo     ^(Server.js sollte rund 139.000 Bytes haben,
echo      github_update.js rund 15.500^)
echo.
if exist "Server.js"        (for %%f in ("Server.js")        do echo     Server.js         %%~zf Bytes) else echo     Server.js         FEHLT
if exist "github_update.js" (for %%f in ("github_update.js") do echo     github_update.js  %%~zf Bytes) else echo     github_update.js  FEHLT
if exist "Index.html"       (for %%f in ("Index.html")       do echo     Index.html        %%~zf Bytes) else echo     Index.html        FEHLT
if exist "node_modules"     (echo     node_modules      vorhanden) else echo     node_modules      FEHLT - bitte "npm install" ausfuehren
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
