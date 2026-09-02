@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Amateurfunk-Trainer - Release veroeffentlichen

REM ===================================================================
REM  Laedt das fertige Setup aus release\ als GitHub-Release hoch.
REM
REM  NICHT zu verwechseln mit Hochladen.bat: Das schiebt den Quellcode
REM  ins Repository. Dort gilt eine Grenze von 100 MiB je Datei - das
REM  Setup ist groesser und gehoert an ein Release, wo 2 GiB erlaubt
REM  sind. Zwei Orte, zwei Werkzeuge.
REM
REM  Node kommt aus dem Ordner node\, sonst aus dem Pfad.
REM ===================================================================

set "NODE_EXE=node"
if exist "%~dp0node\node.exe" goto :node_ordner
where node >nul 2>nul
if errorlevel 1 goto :node_fehlt
goto :node_fertig

:node_ordner
set "NODE_EXE=%~dp0node\node.exe"
goto :node_fertig

:node_fehlt
echo.
echo ============================================================
echo   Node ist auf diesem Rechner nicht zu finden - weder im
echo   Ordner node\ noch installiert.
echo.
echo   Das Setup des Trainers bringt node\ mit. Fehlt der Ordner,
echo   am einfachsten das Setup noch einmal ausfuehren.
echo ============================================================
echo.
pause
exit /b 1

:node_fertig
"%NODE_EXE%" release_hochladen.js
echo.
pause
