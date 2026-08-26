@echo off
title Trainer-Programm von GitHub aktualisieren
cd /d "%~dp0"

REM ============================================================
REM  Holt Server.js und github_update.js direkt von GitHub.
REM
REM  WARUM ES DIESE DATEI GIBT:
REM  Der Weg "Link anklicken, Rechtsklick, Speichern unter" hat bei
REM  einem Mitlernenden dazu gefuehrt, dass der Browser die WEBSEITE
REM  gespeichert hat statt der Datei. In der Server.js stand danach
REM  <!DOCTYPE html>, Node brach mit "Unexpected token '<'" ab, und
REM  das Fenster war schneller wieder zu, als man lesen konnte.
REM
REM  Hier gibt es keinen Speichern-Dialog und keine Gelegenheit, das
REM  Falsche zu erwischen. Und es wird geprueft, BEVOR etwas ersetzt
REM  wird: faengt die geladene Datei mit "<" an oder ist sie
REM  verdaechtig klein, bleibt die alte liegen.
REM
REM  Der Lernstand im Ordner data\ wird nicht angefasst.
REM ============================================================

set ROH=https://raw.githubusercontent.com/Amateurfunk-Gruppe/Amateurfunk-Trainer/main/

echo ============================================================
echo   Trainer-Programm von GitHub aktualisieren
echo ============================================================
echo.
echo   Es werden zwei Dateien geholt:
echo     Server.js
echo     github_update.js
echo.
echo   Die bisherigen wandern vorher nach backup\.
echo   Dein Lernstand in data\ bleibt unangetastet.
echo.

where curl >nul 2>nul
if errorlevel 1 goto :kein_curl

choice /c jn /n /m "   Weiter?  [j/n]  "
if errorlevel 2 goto :abgebrochen
echo.

echo [1/4] Server.js laden ...
curl -L --fail --silent --show-error -o "Server.js.neu" "%ROH%Server.js"
if errorlevel 1 goto :ladefehler

echo [2/4] github_update.js laden ...
curl -L --fail --silent --show-error -o "github_update.js.neu" "%ROH%github_update.js"
if errorlevel 1 goto :ladefehler

echo [3/4] Pruefen, ob das auch Javascript ist ...
REM Eine HTML-Seite faengt mit "<" an. Das ist der Fall, der den
REM ganzen Aerger gemacht hat.
findstr /b /c:"<" "Server.js.neu" >nul && goto :ist_html
findstr /b /c:"<" "github_update.js.neu" >nul && goto :ist_html

REM Groessenprobe: eine abgebrochene Uebertragung ist deutlich kleiner.
for %%f in ("Server.js.neu")        do if %%~zf LSS 50000 goto :zu_klein
for %%f in ("github_update.js.neu") do if %%~zf LSS 5000  goto :zu_klein
echo       sieht gut aus.

echo [4/4] Alte Fassung sichern und ersetzen ...
if not exist "backup" mkdir "backup"
if exist "Server.js"        copy /y "Server.js"        "backup\Server_vor_Update.js"        >nul
if exist "github_update.js" copy /y "github_update.js" "backup\github_update_vor_Update.js" >nul
move /y "Server.js.neu"        "Server.js"        >nul
move /y "github_update.js.neu" "github_update.js" >nul

echo.
echo ============================================================
echo   Fertig.
echo.
echo   Jetzt den Trainer starten: START.bat
echo   Laeuft noch ein altes Fenster, dieses vorher schliessen.
echo ============================================================
echo.
pause
exit /b 0

:ist_html
echo.
echo   [FEHLER] Was da ankam, ist keine Javascript-Datei, sondern
echo            eine Webseite. Das passiert, wenn zwischen dir und
echo            GitHub etwas dazwischenfunkt - ein Firmennetz, ein
echo            WLAN-Portal im Hotel, ein Filter.
echo.
echo   Es wurde NICHTS ersetzt. Der Trainer laeuft weiter wie bisher.
goto :aufraeumen

:zu_klein
echo.
echo   [FEHLER] Die geladenen Dateien sind zu klein - die Uebertragung
echo            war offenbar unvollstaendig.
echo.
echo   Es wurde NICHTS ersetzt. Bitte spaeter noch einmal versuchen.
goto :aufraeumen

:ladefehler
echo.
echo   [FEHLER] Die Dateien liessen sich nicht laden.
echo            Besteht eine Internetverbindung?
echo.
echo   Es wurde NICHTS ersetzt.
goto :aufraeumen

:aufraeumen
if exist "Server.js.neu"        del "Server.js.neu"
if exist "github_update.js.neu" del "github_update.js.neu"
echo.
pause
exit /b 1

:kein_curl
echo   [FEHLER] curl wurde nicht gefunden. Es gehoert seit Windows 10
echo            zum Betriebssystem - bei aelteren Fassungen fehlt es.
echo.
echo   Dann bleibt der Weg ueber den Browser: die beiden Adressen
echo   aufrufen und mit Strg+S speichern, dabei als Dateityp
echo   "Alle Dateien" waehlen und den Namen OHNE .txt eintragen.
echo.
echo     %ROH%Server.js
echo     %ROH%github_update.js
echo.
pause
exit /b 1

:abgebrochen
echo.
echo   Abgebrochen. Es wurde nichts geaendert.
echo.
pause
exit /b 0
