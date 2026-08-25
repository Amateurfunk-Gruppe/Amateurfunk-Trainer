@echo off
title Amateurfunk Trainer - Server
cd /d "%~dp0"

echo ============================================================
echo   Amateurfunk Pruefungstrainer - Server startet
echo   Der Server laeuft zunaechst NUR lokal auf diesem PC.
echo ============================================================
echo.

REM FIX: Pruefen ob Node.js ueberhaupt installiert ist, statt stillem Fehlschlag
where node >nul 2>nul
if errorlevel 1 (
  echo [FEHLER] Node.js wurde nicht gefunden!
  echo          Bitte installiere Node.js von https://nodejs.org und starte danach neu.
  echo.
  pause
  exit /b 1
)

REM FIX: node_modules Check - fehlende Abhaengigkeiten automatisch installieren
if not exist "node_modules" (
  echo [INFO] node_modules nicht gefunden - fuehre "npm install" aus...
  call npm install
  if errorlevel 1 (
    echo [FEHLER] npm install fehlgeschlagen. Bitte Fehlermeldung oben pruefen.
    echo.
    pause
    exit /b 1
  )
)

REM Piper Check
if not exist "piper\de_DE-thorsten-medium.onnx" (
  if not exist "piper\de_DE-thorsten-low.onnx" (
    echo [WARN] Keine Stimmen in piper/ gefunden - TTS evtl. ohne Funktion
  )
)

REM Cloudflared Check
REM GEAENDERT 17.08.2026: Der Server startet den Tunnel NICHT mehr von selbst.
REM Frueher ging der PC bei jedem Start ungefragt ins oeffentliche Internet -
REM auch dann, wenn man nur allein lernen wollte.
if exist "cloudflared.exe" (
  echo [OK] cloudflared.exe gefunden - Gruppenraum ist einsatzbereit.
) else (
  echo [INFO] cloudflared.exe fehlt. Fuer den Gruppenraum bitte einmal
  echo        start-tunnel.bat ausfuehren - die laedt sie herunter.
  echo        Alleine lernen geht auch ohne.
)

echo.
echo Starte Server auf http://localhost:3000 ...
echo.
echo   Alleine lernen:  einfach loslegen, nichts weiter noetig.
echo.
echo   Gruppenraum:     "Gruppenraum" -^> "Raum erstellen" klicken.
echo                    Der Tunnel startet dann automatisch mit und der
echo                    Einladungs-Link erscheint nach 5-15 Sekunden.
echo.
echo   (Wer den Tunnel schon beim Start moechte, nutzt START_MIT_TUNNEL.bat)
echo.

REM FIX: Browser erst oeffnen, wenn der Port tatsaechlich antwortet (statt
REM blind nach 3 Sekunden), damit kein "Seite nicht erreichbar"-Tab entsteht,
REM falls der Port belegt ist oder der Server nicht hochkommt.
start "" cmd /c "for /l %%i in (1,1,20) do (curl -s -o nul http://localhost:3000 && start http://localhost:3000 && exit /b) || timeout /t 1 /nobreak >nul"

REM Server starten (blockierend)
node Server.js

pause
