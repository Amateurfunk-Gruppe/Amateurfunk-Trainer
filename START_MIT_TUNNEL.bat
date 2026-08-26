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

REM ============================================================
REM  FIX 26.08.2026: Dieselbe Falle wie in START.bat.
REM
REM  Laeuft noch ein node.exe auf Port 3000, bricht das neue mit
REM  "EADDRINUSE" ab - der Browser wird aber trotzdem geoeffnet und
REM  zeigt den ALTEN Server. Hier ist es sogar heikler: Der Tunnel
REM  wuerde dann den alten Stand ins Internet stellen.
REM
REM  Sprungmarken statt verschachtelter Klammern - in einem if-Block
REM  wird %VAR% schon beim Einlesen ersetzt, nicht beim Ausfuehren.
REM ============================================================
set ALT_PID=
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /c:":3000 " ^| findstr /c:"LISTENING"') do set ALT_PID=%%p

if not defined ALT_PID goto :port_ist_frei

set ALT_NAME=unbekannt
for /f "tokens=1 delims=," %%n in ('tasklist /nh /fo csv /fi "PID eq %ALT_PID%" 2^>nul') do set ALT_NAME=%%~n

echo ============================================================
echo   Auf Port 3000 laeuft schon etwas.
echo.
echo     Programm : %ALT_NAME%
echo     PID      : %ALT_PID%
echo.
if /i "%ALT_NAME%"=="node.exe" goto :alter_trainer

echo   Das ist KEIN node.exe - hier wird nichts beendet, das koennte
echo   ein ganz anderes Programm sein. Bitte von Hand schliessen oder
echo   den Port freimachen.
echo ============================================================
echo.
pause
exit /b 1

:alter_trainer
echo   Das ist mit grosser Wahrscheinlichkeit ein Trainer, der noch
echo   von vorhin laeuft. Solange der laeuft, kommt der neue nicht
echo   hoch - und der Tunnel wuerde den ALTEN Stand ins Internet
echo   stellen.
echo ============================================================
echo.
choice /c jn /n /m "   Den alten beenden und neu starten?  [j/n]  "
if errorlevel 2 goto :nicht_beenden

echo.
echo   [INFO] Beende PID %ALT_PID% ...
taskkill /pid %ALT_PID% /f >nul 2>nul
REM Windows gibt den Port nicht im selben Augenblick wieder frei.
timeout /t 2 /nobreak >nul
goto :port_ist_frei

:nicht_beenden
echo.
echo   Gut - es wird nichts beendet und kein Tunnel geoeffnet.
echo.
pause
exit /b 0

:port_ist_frei

echo Starte Server mit Tunnel ...
echo.

start "" cmd /c "for /l %%i in (1,1,20) do (curl -s -o nul http://localhost:3000 && start http://localhost:3000 && exit /b) || timeout /t 1 /nobreak >nul"

REM AFU_TUNNEL=1 schaltet den Auto-Start des Tunnels ein (siehe Fix K2 in BUG_REPORT.md)
set AFU_TUNNEL=1
node Server.js

echo.
echo ============================================================
echo   Der Server ist beendet, der Tunnel damit auch.
echo   Steht oben eine Fehlermeldung, bitte diese Zeilen abfotografieren.
echo ============================================================
pause
