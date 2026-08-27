@echo off
title Trainer auf einen USB-Stick kopieren
cd /d "%~dp0"

REM ================================================================
REM  USB-Stick-Erstellen.bat
REM
REM  Ein Doppelklick, ein fertiger Stick. Auch dann, wenn dieser
REM  Ordner gerade frisch von GitHub entpackt wurde und noch weder
REM  node\ noch node_modules\ enthaelt - das holt das Werkzeug selbst
REM  nach, nach Rueckfrage.
REM
REM  Was auf den Stick kommt: alles, was der Trainer zum Laufen
REM  braucht. Was nicht: der eigene Lernstand, die Werkzeuge des
REM  Entwicklers, .git. Einzelheiten stehen in usb_erstellen.js.
REM ================================================================

if not exist "usb_erstellen.js" (
  echo.
  echo   [FEHLER] usb_erstellen.js fehlt in diesem Ordner.
  echo            Beide Dateien gehoeren zusammen.
  echo.
  pause
  exit /b 1
)

REM ---- Womit wird usb_erstellen.js ausgefuehrt? -------------------
REM Sprungmarken statt verschachtelter Klammern: In einem if-Block
REM wird %VAR% schon beim Einlesen ersetzt, nicht beim Ausfuehren -
REM eine gesetzte Variable waere dort noch leer.
set "NODE_EXE=node"
if exist "%~dp0node\node.exe" goto :eigenes_node

where node >nul 2>nul
if errorlevel 1 goto :node_fehlt
goto :los

:node_fehlt
echo.
echo ============================================================
echo   Auf diesem Rechner ist kein Node.js zu finden.
echo.
echo   Node.js wird gebraucht, damit dieses Werkzeug ueberhaupt
echo   laufen kann. Ich hole es jetzt in den Ordner node\ -
echo   ohne Installation, ohne Administratorrechte.
echo ============================================================
echo.
if not exist "node_holen.ps1" (
  echo   [FEHLER] node_holen.ps1 fehlt - kann Node nicht holen.
  echo            Bitte Node.js von https://nodejs.org installieren.
  echo.
  pause
  exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0node_holen.ps1"
if not exist "%~dp0node\node.exe" (
  echo.
  echo   [FEHLER] Node.js liegt immer noch nicht bereit.
  echo            Ohne geht es nicht weiter.
  echo.
  pause
  exit /b 1
)

:eigenes_node
set "NODE_EXE=%~dp0node\node.exe"

:los
"%NODE_EXE%" usb_erstellen.js

echo.
pause
