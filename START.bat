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
REM  FIX 26.08.2026: LAEUFT SCHON EIN TRAINER?
REM
REM  Das hat einen Nachmittag gekostet. Dietmar spielte eine neue
REM  Server.js ein, startete neu - und bekam weiter das Verhalten
REM  der alten Fassung. Der Grund stand nicht in der Server.js,
REM  sondern hier:
REM
REM  Lief noch ein node.exe auf Port 3000, brach das neue mit
REM  "EADDRINUSE" ab. Der Browser wurde aber trotzdem geoeffnet -
REM  die Zeile weiter unten wartete nur darauf, DASS Port 3000
REM  antwortet, nicht darauf, WER antwortet. Der alte Server
REM  antwortete bereitwillig. Man sah also einen laufenden Trainer,
REM  waehrend das neue Fenster daneben mit einer Fehlermeldung
REM  stand, die niemand las.
REM
REM  Deshalb jetzt: erst nachsehen, dann fragen, dann starten.
REM
REM  Geschrieben mit Sprungmarken statt verschachtelter Klammern:
REM  In einem if-Block wird %VAR% schon beim Einlesen ersetzt, nicht
REM  beim Ausfuehren - was man dort setzt, kann man dort nicht lesen.
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
echo   hoch - und im Browser saehest du weiter den alten Stand.
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
echo   Gut - es wird nichts beendet. Im Browser bleibt damit der alte
echo   Trainer der, den du siehst.
echo.
pause
exit /b 0

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

REM Browser erst oeffnen, wenn der Port antwortet. Der Port ist oben
REM freigeraeumt worden, es kann also nur noch dieser Server sein.
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
