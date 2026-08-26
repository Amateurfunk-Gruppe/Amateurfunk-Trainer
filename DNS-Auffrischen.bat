@echo off
title Tunnel-Adresse auf diesem PC bekanntmachen
cd /d "%~dp0"

REM ============================================================
REM  Fuer den Fall: "Der Link geht bei mir nicht" - obwohl der
REM  Selbsttest sagt, der Name sei oeffentlich bekannt.
REM
REM  Was dahintersteckt: Der Trainer startet den Tunnel und fragt
REM  gleich darauf nach dem neuen Namen. In dem Augenblick kennt
REM  ihn noch niemand. Windows merkt sich diesen Fehlversuch im
REM  sogenannten negativen DNS-Cache - und antwortet danach
REM  minutenlang weiter mit "gibt es nicht", auch wenn Cloudflare
REM  den Namen laengst veroeffentlicht hat.
REM
REM  Fuer ANDERE Teilnehmer funktioniert der Link in dieser Zeit
REM  meist schon. Nur dieser eine PC bleibt bei seiner alten
REM  Auskunft.
REM
REM  ipconfig /flushdns wirft diese Auskunft weg. Danach fragt
REM  Windows neu - und bekommt die richtige Antwort.
REM ============================================================

echo ============================================================
echo   Tunnel-Adresse auf diesem PC bekanntmachen
echo ============================================================
echo.

if not exist "tunnel_url.txt" goto :keine_adresse
set URL=
set /p URL=<tunnel_url.txt
if not defined URL goto :keine_adresse
set HOST=%URL:https://=%
set HOST=%HOST:http://=%
set HOST=%HOST:/=%

echo   Aktuelle Adresse : %HOST%
echo.

echo [1/3] Alte DNS-Auskuenfte wegwerfen ...
ipconfig /flushdns >nul 2>nul
if errorlevel 1 goto :keine_rechte
echo       erledigt.
echo.

echo [2/3] Nachsehen, ob dieser PC den Namen jetzt kennt ...
echo.
nslookup %HOST% 2>nul | findstr /i /c:"Address" /c:"Adresse"
echo.

echo [3/3] Zur Gegenprobe ueber einen oeffentlichen DNS-Server:
echo.
nslookup %HOST% 1.1.1.1 2>nul | findstr /i /c:"Address" /c:"Adresse"
echo.

echo ============================================================
echo   Stehen oben unter [2] und [3] Adressen, kennt dieser PC den
echo   Namen jetzt - der Link im Browser sollte gehen. Einmal mit
echo   Strg+F5 neu laden.
echo.
echo   Steht nur unter [3] etwas, braucht Windows noch einen
echo   Moment. Eine Minute warten, dann diese Datei noch einmal.
echo.
echo   Steht nirgends etwas, blockiert etwas dazwischen -
echo   ein DNS-Filter im Router oder der Webschutz eines
echo   Virenscanners.
echo.
echo   In JEDEM Fall gilt: Fuer die anderen Teilnehmer ist der Link
echo   sehr wahrscheinlich schon erreichbar. Am besten mit dem Handy
echo   ueber Mobilfunk gegenpruefen - WLAN dabei ausschalten.
echo ============================================================
echo.
pause
exit /b 0

:keine_rechte
echo.
echo   [HINWEIS] Windows laesst das nur mit erhoehten Rechten zu.
echo.
echo   Bitte diese Datei schliessen, mit der rechten Maustaste
echo   anklicken und "Als Administrator ausfuehren" waehlen.
echo.
pause
exit /b 1

:keine_adresse
echo   In tunnel_url.txt steht keine Adresse.
echo.
echo   Der Tunnel laeuft also gerade nicht. Erst im Trainer auf
echo   "Gruppenraum" und "Raum erstellen" klicken - dann gibt es
echo   eine Adresse, und diese Datei kann etwas ausrichten.
echo.
pause
exit /b 1
