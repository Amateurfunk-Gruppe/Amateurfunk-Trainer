@echo off
title Amateurfunk Trainer - Server
cd /d "%~dp0"

echo ============================================================
echo   Amateurfunk Pruefungstrainer - Server startet
echo   Der Server laeuft zunaechst NUR lokal auf diesem PC.
echo ============================================================
echo.

REM ============================================================
REM  WELCHES NODE WIRD BENUTZT?
REM
REM  Zwei Moeglichkeiten, und der eigene Ordner hat Vorrang:
REM
REM    1. node\node.exe  - die mitgelieferte Fassung. Sie entsteht
REM       durch Node-Holen.bat und braucht keine Installation. Wer
REM       den Trainer als ZIP bekommt, kann so ohne Umweg starten.
REM    2. ein auf dem Rechner installiertes Node.
REM
REM  Warum der Ordner Vorrang hat: Wer sich die Muehe gemacht hat,
REM  Node in den Trainer zu legen, will genau diese Fassung - sonst
REM  hinge es vom Zufall ab, welche das System gerade liefert.
REM ============================================================
set "NODE_EXE=node"
set "NPM_CMD=npm"
if exist "%~dp0node\node.exe" (
  set "NODE_EXE=%~dp0node\node.exe"
  set "NPM_CMD=%~dp0node\npm.cmd"
  echo [INFO] Node aus dem Trainer-Ordner wird benutzt ^(node\^).
  goto :node_da
)

where node >nul 2>nul
if errorlevel 1 goto :kein_node
goto :node_da

:kein_node
echo.
echo ============================================================
echo   Node.js wurde nicht gefunden.
echo.
echo   Node.js ist das Programm, das den Trainer ausfuehrt.
echo   Es fehlt auf diesem Rechner - ohne geht es nicht.
echo.
echo   DER EINFACHSTE WEG:
echo     Doppelklick auf   Node-Holen.bat
echo.
echo   Das laedt Node.js in den Ordner node\ - ohne Installation,
echo   ohne Administratorrechte. Danach diese START.bat erneut.
echo.
echo   Alternativ von Hand: https://nodejs.org  ^(Fassung "LTS"^)
echo ============================================================
echo.
pause
exit /b 1

:node_da

REM ============================================================
REM  SIND DIE BAUSTEINE DA?
REM
REM  ACHTUNG, node_modules ist NICHT Node.js. Hier liegen die
REM  Bausteine des Trainers (express, socket.io); node.exe ist das
REM  Programm, das sie ausfuehrt. Die beiden werden gern verwechselt.
REM
REM  Warum hier so viel Sorgfalt steckt (27.08.2026): Auf einem
REM  frisch bespielten USB-Stick fehlte node_modules. Diese Datei
REM  rief daraufhin npm auf - das aber auch nicht vollstaendig da
REM  war. Der Empfaenger bekam zwei Stapelausz-uege aus
REM  node:internal/modules/cjs/loader zu sehen. Niemand kann damit
REM  etwas anfangen, und der Fehler stand nicht einmal darin: Der
REM  Stick war unvollstaendig bespielt worden.
REM ============================================================
if exist "node_modules\express" goto :bausteine_da

echo [INFO] node_modules fehlt oder ist unvollstaendig.

REM Ist ueberhaupt ein npm da, mit dem sich das beheben liesse?
REM "%NPM_CMD%" blind aufzurufen war der Fehler - fehlt es, kommt ein
REM Stapelauszug statt einer Erklaerung.
if /i "%NPM_CMD%"=="npm" goto :npm_pruefen_pfad
if exist "%NPM_CMD%" goto :npm_da
goto :kein_npm

:npm_pruefen_pfad
where npm >nul 2>nul
if errorlevel 1 goto :kein_npm

:npm_da
echo [INFO] Hole die Bausteine mit "npm install" - dafuer wird einmal
echo        eine Internetverbindung gebraucht.
call "%NPM_CMD%" install
if not exist "node_modules\express" goto :npm_ging_schief
goto :bausteine_da

:npm_ging_schief
echo.
echo ============================================================
echo   Die Bausteine liessen sich nicht nachladen.
echo.
echo   Besteht eine Internetverbindung? Sonst siehe unten.
echo ============================================================
echo.
pause
exit /b 1

:kein_npm
echo.
echo ============================================================
echo   Dieser Ordner ist unvollstaendig.
echo.
echo   Es fehlt  node_modules\  - darin liegen die Bausteine des
echo   Trainers. Nachladen geht hier nicht, weil auch npm fehlt.
echo.
echo   WENN DU DIESEN ORDNER VON JEMANDEM BEKOMMEN HAST:
echo     Bitte um eine vollstaendige Fassung. Ein Stick, der mit
echo     USB-Stick-Erstellen.bat bespielt wurde, hat alles dabei.
echo.
echo   WENN DU IHN SELBST ANGELEGT HAST:
echo     Im Quellordner einmal START.bat laufen lassen - die holt
echo     node_modules. Danach USB-Stick-Erstellen.bat erneut.
echo ============================================================
echo.
pause
exit /b 1

:bausteine_da

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
"%NODE_EXE%" Server.js

REM Kommt der Server gar nicht erst hoch, soll das Fenster stehenbleiben
REM und die Meldung zeigen - nicht kommentarlos zuklappen.
echo.
echo ============================================================
echo   Der Server ist beendet.
echo   Steht oben eine Fehlermeldung, bitte diese Zeilen abfotografieren.
echo ============================================================
pause
