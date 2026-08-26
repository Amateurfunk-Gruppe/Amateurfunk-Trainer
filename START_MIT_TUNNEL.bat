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
REM  LAEUFT SCHON EIN TRAINER AUF PORT 3000?
REM
REM  Dieselbe Falle wie in START.bat, hier aber heikler: Der Tunnel
REM  wuerde den ALTEN Stand ins Internet stellen.
REM
REM  Gefragt wird ueber PowerShell (Get-NetTCPConnection), nicht
REM  ueber netstat: dessen Ausgabe heisst auf einem deutschen
REM  Windows "ABHOEREN" statt "LISTENING", und der erste Anlauf
REM  suchte genau nach dem englischen Wort. Er war damit
REM  stillschweigend wirkungslos.
REM
REM  Und: Im Zweifel wird gestartet. Eine Startdatei darf aus einem
REM  Verdacht heraus niemals den Start verweigern.
REM ============================================================
set ALT_PID=
set ALT_NAME=
for /f "usebackq delims=" %%p in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "try{ @(Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction Stop)[0].OwningProcess }catch{''}" 2^>nul`) do set ALT_PID=%%p

if not defined ALT_PID goto :port_ist_frei
echo %ALT_PID%| findstr /r "^[0-9][0-9]*$" >nul || goto :port_ist_frei

for /f "usebackq delims=" %%n in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "try{(Get-Process -Id %ALT_PID% -ErrorAction Stop).ProcessName}catch{''}" 2^>nul`) do set ALT_NAME=%%n
if not defined ALT_NAME set ALT_NAME=unbekannt

echo ============================================================
echo   Auf Port 3000 laeuft schon etwas.
echo.
echo     Programm : %ALT_NAME%
echo     PID      : %ALT_PID%
echo.
if /i not "%ALT_NAME%"=="node" goto :fremdes_programm

echo   Das ist mit grosser Wahrscheinlichkeit ein Trainer, der noch
echo   von vorhin laeuft. Solange der laeuft, kommt der neue nicht
echo   hoch - und der Tunnel wuerde den ALTEN Stand ins Internet
echo   stellen.
echo ============================================================
echo.
choice /c jn /n /m "   Den alten beenden und neu starten?  [j/n]  "
if errorlevel 2 goto :port_ist_frei
if errorlevel 1 goto :alten_beenden
goto :port_ist_frei

:alten_beenden
echo.
echo   [INFO] Beende PID %ALT_PID% ...
taskkill /pid %ALT_PID% /f >nul 2>nul
REM Windows gibt den Port nicht im selben Augenblick wieder frei.
timeout /t 2 /nobreak >nul
goto :port_ist_frei

:fremdes_programm
echo   Das ist kein Trainer. Hier wird nichts beendet - es koennte
echo   ein ganz anderes Programm sein.
echo.
echo   Es wird trotzdem gestartet. Kommt der Server nicht hoch,
echo   steht unten "EADDRINUSE" - dann ist der Port belegt.
echo ============================================================
echo.

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
