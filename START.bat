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

REM ============================================================
REM  LAEUFT SCHON EIN TRAINER AUF PORT 3000?
REM
REM  Warum es das gibt (26.08.2026): Lief noch ein node.exe auf
REM  Port 3000, brach das neue mit "EADDRINUSE" ab. Der Browser
REM  wurde aber trotzdem geoeffnet - die Zeile weiter unten wartete
REM  nur darauf, DASS Port 3000 antwortet, nicht darauf, WER
REM  antwortet. Der alte Server antwortete bereitwillig. Man sah
REM  einen laufenden Trainer, waehrend das neue Fenster daneben mit
REM  einer Fehlermeldung stand, die niemand liest.
REM
REM  ZWEITER ANLAUF, und zwar aus zwei Gruenden:
REM
REM  1. Der erste suchte in der netstat-Ausgabe nach "LISTENING".
REM     Auf einem deutschen Windows steht dort "ABHOEREN". Der
REM     Filter griff also nie, die Pruefung war stillschweigend
REM     wirkungslos - genau auf den Rechnern, fuer die sie gedacht
REM     war. Jetzt fragt PowerShell (Get-NetTCPConnection), und das
REM     antwortet in jeder Sprache gleich.
REM
REM  2. Der erste konnte den Start VERHINDERN: Kam ein Programmname
REM     heraus, der nicht "node.exe" hiess, brach er ab. Eine
REM     Startdatei darf aus einem Verdacht heraus niemals den Start
REM     verweigern. Jetzt wird in jedem Zweifelsfall gestartet - die
REM     Pruefung darf helfen, aber nie im Weg stehen.
REM
REM  Sprungmarken statt verschachtelter Klammern: In einem if-Block
REM  wird %VAR% schon beim Einlesen ersetzt, nicht beim Ausfuehren.
REM ============================================================
set ALT_PID=
set ALT_NAME=
for /f "usebackq delims=" %%p in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "try{ @(Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction Stop)[0].OwningProcess }catch{''}" 2^>nul`) do set ALT_PID=%%p

REM Nichts gefunden, PowerShell fehlt, Befehl unbekannt: dann eben
REM ohne Pruefung starten. Lieber ein EADDRINUSE als ein Trainer,
REM der wegen der Pruefung nicht hochkommt.
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
echo   hoch - und im Browser saehest du weiter den alten Stand.
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
echo   Der Trainer wird trotzdem gestartet. Kommt er nicht hoch,
echo   steht unten die Meldung "EADDRINUSE" - dann ist dieser Port
echo   belegt und das andere Programm muss weichen.
echo ============================================================
echo.

:port_ist_frei

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

start "" cmd /c "for /l %%i in (1,1,20) do (curl -s -o nul http://localhost:3000 && start http://localhost:3000 && exit /b) || timeout /t 1 /nobreak >nul"

REM Server starten (blockierend)
node Server.js

REM Kommt der Server gar nicht erst hoch, soll das Fenster stehenbleiben
REM und die Meldung zeigen - nicht kommentarlos zuklappen.
echo.
echo ============================================================
echo   Der Server ist beendet.
echo   Steht oben eine Fehlermeldung, bitte diese Zeilen abfotografieren.
echo ============================================================
pause
