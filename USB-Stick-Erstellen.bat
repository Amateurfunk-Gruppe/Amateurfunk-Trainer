@echo off
title Trainer auf einen USB-Stick kopieren
cd /d "%~dp0"

REM ================================================================
REM  USB-Stick-Erstellen.bat
REM
REM  Legt eine saubere Kopie des Trainers auf einen Stick oder in
REM  einen beliebigen Ordner - ohne den eigenen Lernstand, ohne die
REM  Werkzeuge, ohne .git, dafuer MIT node\ und node_modules\.
REM
REM  Der Empfaenger steckt den Stick ein und klickt START.bat.
REM  Installiert werden muss nichts.
REM
REM  Die Arbeit steht in usb_erstellen.js.
REM ================================================================

set "NODE_EXE=node"
if exist "%~dp0node\node.exe" set "NODE_EXE=%~dp0node\node.exe"

if not exist "usb_erstellen.js" (
  echo.
  echo   [FEHLER] usb_erstellen.js fehlt in diesem Ordner.
  echo.
  pause
  exit /b 1
)

"%NODE_EXE%" usb_erstellen.js

echo.
pause
