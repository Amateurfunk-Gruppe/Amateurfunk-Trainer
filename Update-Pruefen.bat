@echo off
title Warum kommt kein Update an?
cd /d "%~dp0"

REM ---- Womit wird das Javascript ausgefuehrt? ----------------
REM Vorrang hat das mitgelieferte Node aus dem Ordner node\ - so
REM laeuft dieses Werkzeug auch dann, wenn auf dem Rechner kein
REM Node.js mehr installiert ist (Node-Holen.bat legt es an).
set "NODE_EXE=node"
if exist "%~dp0node\node.exe" set "NODE_EXE=%~dp0node\node.exe"
"%NODE_EXE%" update_pruefen.js
echo.
pause
