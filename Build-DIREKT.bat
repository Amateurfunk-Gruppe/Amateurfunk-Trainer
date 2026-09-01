@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Amateurfunk-Trainer - Setup bauen
cd /d "%~dp0"

REM ===================================================================
REM  Baut das Setup mit Inno Setup 7 AUS DIESEM ORDNER.
REM
REM  Die Pruefungen davor gibt es aus einem Anlass: Dietmar hatte eine
REM  fertige EXE, der das Symbol fehlte. Gebaut worden war aus einem
REM  anderen Ordner, in dem eine aeltere installer.iss und eine aeltere
REM  icon.ico lagen. Der Compiler hat dabei nicht gemeckert - er hat
REM  genau das gebaut, was dort stand.
REM
REM  Deshalb wird jetzt vorher nachgesehen und im Klartext gesagt, was
REM  fehlt, statt etwas zu bauen, das hinterher nicht stimmt.
REM ===================================================================

echo.
echo   Ordner: %CD%
echo.

REM ---------- 1. Compiler ----------
set "ISCC=C:\Program Files (x86)\Inno Setup 7\ISCC.exe"
if not exist "%ISCC%" set "ISCC=C:\Program Files\Inno Setup 7\ISCC.exe"
if not exist "%ISCC%" (
    echo   [ABBRUCH] Inno Setup 7 nicht gefunden. Gesucht unter:
    echo             C:\Program Files ^(x86^)\Inno Setup 7\ISCC.exe
    echo             C:\Program Files\Inno Setup 7\ISCC.exe
    echo.
    pause
    exit /b 1
)
echo   Compiler: %ISCC%

REM ---------- 2. Was der Installer zwingend braucht ----------
REM  Dateien OHNE skipifsourcedoesntexist in der installer.iss. Fehlt
REM  eine davon, bricht der Compiler ab - nur eben mit einer Meldung,
REM  die man erst suchen muss.
set FEHLT=
for %%D in (
    installer.iss icon.ico icon.png Index.html Server.js duo.js hoerbuch.js
    klick-sound.js lame.js Tts-Expand.js video_map_embed.js github_update.js
    update_pruefen.js fragen.json svg-list.json video_lessons.json
    formelhilfe.json LICENSE Formelsammlung.pdf Pruefungsfragen.pdf
    START.vbs START.bat START_MIT_TUNNEL.vbs START_MIT_TUNNEL.bat
    START_SICHTBAR.bat STOP.bat cloudflared.exe wizard.bmp small.bmp
) do (
    if not exist "%%D" set FEHLT=!FEHLT! %%D
)

if defined FEHLT (
    echo.
    echo   [ABBRUCH] Diese Dateien fehlen in diesem Ordner:
    echo.
    for %%F in (%FEHLT%) do echo        - %%F
    echo.
    echo   Sie stehen in der installer.iss ohne "skipifsourcedoesntexist",
    echo   werden also zwingend gebraucht. Bitte nachlegen - dann laeuft
    echo   der Bau durch.
    echo.
    pause
    exit /b 1
)

REM ---------- 3. Ist die icon.ico die richtige? ----------
REM  Die alte, kleine icon.ico hatte rund 61 KB und nur wenige Groessen.
REM  Die aktuelle hat rund 401 KB mit 8 Groessen bis 256 Pixel. Wer aus
REM  Versehen die alte im Ordner hat, sieht am Ende wieder das
REM  Standardsymbol - deshalb hier ein Wort dazu.
for %%I in (icon.ico) do set ICONGROESSE=%%~zI
if %ICONGROESSE% LSS 100000 (
    echo.
    echo   [HINWEIS] icon.ico ist nur %ICONGROESSE% Bytes gross.
    echo             Die vollstaendige Fassung hat rund 410000 Bytes und
    echo             enthaelt 8 Groessen bis 256 Pixel. Mit der kleinen
    echo             kann das Symbol in manchen Ansichten fehlen.
    echo.
    choice /C JN /M "   Trotzdem bauen"
    if errorlevel 2 exit /b 1
)

REM ---------- 4. Bauen ----------
echo.
echo   Baue ... das dauert wegen lzma2/ultra64 ein paar Minuten.
echo.
"%ISCC%" "%~dp0installer.iss"
set BAUFEHLER=%ERRORLEVEL%

echo.
if not "%BAUFEHLER%"=="0" (
    echo   [FEHLGESCHLAGEN] Der Compiler hat mit Code %BAUFEHLER% abgebrochen.
    echo   Die Meldung dazu steht weiter oben.
    echo.
    pause
    exit /b %BAUFEHLER%
)

REM ---------- 5. Was ist entstanden? ----------
set GEFUNDEN=
for %%E in ("Amateurfunk-Trainer-*.exe") do (
    set GEFUNDEN=1
    echo   Fertig: %%~nxE  ^(%%~zE Bytes^)
    echo   Liegt in: %CD%
)
if not defined GEFUNDEN (
    echo   [MERKWUERDIG] Der Compiler meldet Erfolg, aber hier liegt keine
    echo                 Amateurfunk-Trainer-*.exe. Bitte OutputDir in der
    echo                 installer.iss nachsehen.
)

echo.
echo   Das Symbol steckt in der EXE. Zeigt der Explorer trotzdem noch das
echo   alte, ist es sein Zwischenspeicher: einmal
echo        ie4uinit.exe -show
echo   ausfuehren oder den Explorer neu starten.
echo.
pause
