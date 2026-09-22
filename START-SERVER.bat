@echo off
REM ================================================================
REM  START-SERVER.bat                                  22.09.2026
REM  ----------------------------------------------------------------
REM  Dietmar: "Ich habe mehrere Lenovo ThinkPad und da moechte ich
REM  einen als Server laufen lassen."
REM
REM  Das ist der Start fuer einen Rechner, der NUR Server ist. Der
REM  Unterschied zu START.bat / START.vbs:
REM    - kein Browser wird geoeffnet (AFU_BROWSER bleibt leer)
REM    - deshalb auch kein Feierabend: der Trainer laeuft, bis ihn
REM      jemand beendet - auch wenn tagelang niemand hinsieht
REM    - die Tuer ist von Anfang an offen (AFU_TUER=1); niemand muss
REM      nach einem Neustart auf "Server ein" klicken
REM    - faellt der Server um oder wird er ueber "Neustart" beendet,
REM      startet ihn diese Schleife nach fuenf Sekunden neu
REM    - er hoert nur auf 127.0.0.1 (AFU_NUR_LOKAL=1), nicht im WLAN
REM    - Anfragen von aussen werden je Adresse gebremst (siehe
REM      "DIE ANFRAGEBREMSE" in Server.js) - das gilt ueberall, nicht
REM      nur hier
REM
REM  Dieses Fenster darf offen bleiben. Es zeigt, was der Trainer
REM  gerade tut. Zum Aufhoeren: Fenster schliessen, oder STOP.bat.
REM
REM  Der Tunnel (die feste Adresse) laeuft NICHT hier, sondern als
REM  Windows-Dienst - siehe Tunnel-Einrichten.bat. Er startet mit
REM  Windows und braucht diese Datei nicht.
REM
REM  Bedient wird der Server am ThinkPad selbst: Browser auf, Adresse
REM  http://localhost:3000, dort der Knopf "Server" oben rechts.
REM ================================================================
setlocal
cd /d "%~dp0"
title Amateurfunk-Trainer - Server

if not exist "node\node.exe" (
    echo.
    echo   node\node.exe fehlt in diesem Ordner:
    echo   %~dp0
    echo.
    echo   Der Trainer-Ordner muss vollstaendig kopiert sein, samt
    echo   dem Unterordner node und node_modules.
    echo.
    pause
    exit /b 1
)

REM ---------------------------------------------------------------
REM  Laeuft schon einer? Dann nicht ein zweites Mal - der zweite
REM  kaeme mit "Port belegt" zurueck, und die Schleife unten wuerde
REM  das alle fuenf Sekunden wiederholen.
REM ---------------------------------------------------------------
netstat -ano | findstr /R /C:":3000 .*LISTENING" >nul 2>nul
if not errorlevel 1 (
    echo.
    echo   Auf Port 3000 antwortet schon etwas - vermutlich laeuft der
    echo   Trainer bereits. Dann ist alles in Ordnung; dieses Fenster
    echo   kann zu.
    echo.
    echo   Falls nicht: STOP.bat ausfuehren und diese Datei noch einmal.
    echo.
    pause
    exit /b 1
)

set "AFU_TUER=1"
set "AFU_BROWSER="
REM  Nur auf 127.0.0.1 hoeren: Alles kommt ueber cloudflared herein, und
REM  das spricht localhost. Wer im WLAN des ThinkPads sitzt, sieht auf
REM  Port 3000 dann nichts - eine Angriffsflaeche weniger. Sollen Tablets
REM  im selben WLAN den Server direkt erreichen, diese Zeile loeschen.
set "AFU_NUR_LOKAL=1"

:wieder
echo.
echo  ================================================================
echo   [%date% %time%]  Amateurfunk-Trainer startet als Server ...
echo  ================================================================
echo.
"node\node.exe" Server.js
set "CODE=%errorlevel%"
echo.
echo  ----------------------------------------------------------------
echo   [%date% %time%]  Der Trainer hat sich beendet (Code %CODE%).
echo   Neustart in 5 Sekunden. Zum Aufhoeren dieses Fenster schliessen.
echo  ----------------------------------------------------------------
timeout /t 5 /nobreak >nul
goto wieder
