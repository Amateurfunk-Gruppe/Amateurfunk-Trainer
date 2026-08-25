@echo off
title Amateurfunk Trainer - Server + Tunnel sofort
cd /d "%~dp0"

echo ============================================================
echo   Amateurfunk Pruefungstrainer
echo   Server + Cloudflare-Tunnel werden SOFORT gestartet.
echo.
echo   ACHTUNG: Damit ist dieser PC ueber eine oeffentliche
echo   Internet-Adresse erreichbar, solange das Fenster offen ist.
echo   Nur benutzen, wenn du wirklich einen Gruppenraum anbietest.
echo   Zum Beenden dieses Fenster schliessen oder Strg+C druecken -
echo   der Tunnel wird dann automatisch mit beendet.
echo ============================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [FEHLER] Node.js wurde nicht gefunden!
  echo          Bitte installiere Node.js von https://nodejs.org und starte danach neu.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [INFO] node_modules nicht gefunden - fuehre "npm install" aus...
  call npm install
  if errorlevel 1 (
    echo [FEHLER] npm install fehlgeschlagen.
    pause
    exit /b 1
  )
)

if not exist "cloudflared.exe" (
  echo [FEHLER] cloudflared.exe fehlt - ohne sie gibt es keinen Tunnel.
  echo          Bitte einmal start-tunnel.bat ausfuehren, die laedt sie herunter.
  echo.
  pause
  exit /b 1
)

echo Starte Server mit Tunnel ...
echo.

start "" cmd /c "for /l %%i in (1,1,20) do (curl -s -o nul http://localhost:3000 && start http://localhost:3000 && exit /b) || timeout /t 1 /nobreak >nul"

REM AFU_TUNNEL=1 schaltet den Auto-Start des Tunnels ein (siehe Fix K2 in BUG_REPORT.md)
set AFU_TUNNEL=1
node Server.js

pause
