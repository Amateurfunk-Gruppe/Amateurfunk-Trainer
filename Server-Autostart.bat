@echo off
REM ================================================================
REM  Server-Autostart.bat                              22.09.2026
REM  ----------------------------------------------------------------
REM  Legt START-SERVER.bat in den Autostart-Ordner von Windows - oder
REM  nimmt sie wieder heraus. Danach startet der Trainer als Server
REM  von selbst, sobald sich der Benutzer anmeldet.
REM
REM  "Sobald sich der Benutzer anmeldet" ist der Haken: Nach einem
REM  Neustart (etwa durch ein Windows-Update) steht der ThinkPad sonst
REM  am Anmeldebildschirm, und nichts laeuft. Entweder man meldet sich
REM  dann an - oder man stellt Windows auf automatische Anmeldung
REM  (Windows-Taste + R, "netplwiz", Haken bei "Benutzer muessen
REM  Benutzernamen und Kennwort eingeben" entfernen). Das ist eine
REM  Entscheidung fuer einen Rechner, der zu Hause steht und nichts
REM  Persoenliches enthaelt; sie gehoert in deine Hand, nicht in diese
REM  Datei.
REM
REM  Kein Windows-Dienst, mit Absicht: Ein Dienst laeuft ohne Fenster
REM  und ohne Anmeldung, aber man sieht ihm nichts an. Die Verknuepfung
REM  im Autostart oeffnet das Fenster von START-SERVER.bat - da steht,
REM  was der Trainer gerade tut.
REM ================================================================
setlocal
cd /d "%~dp0"
title Amateurfunk-Trainer - Autostart

set "ZIEL=%~dp0START-SERVER.bat"
set "AUTOSTART=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "LNK=%AUTOSTART%\Amateurfunk-Trainer Server.lnk"

if not exist "%ZIEL%" (
    echo.
    echo   START-SERVER.bat wurde nicht gefunden - sie muss im selben
    echo   Ordner liegen wie diese Datei.
    echo.
    pause
    exit /b 1
)

echo.
echo  ================================================================
echo   Amateurfunk-Trainer als Server - Autostart
echo  ================================================================
echo.
if exist "%LNK%" (
    echo   Der Autostart ist zur Zeit EINGERICHTET.
) else (
    echo   Der Autostart ist zur Zeit NICHT eingerichtet.
)
echo.
echo   [E]  Einrichten  - Trainer startet als Server bei der Anmeldung
echo   [A]  Ausschalten - Eintrag aus dem Autostart entfernen
echo   [N]  Nichts tun
echo.
choice /C EAN /N /M "   Auswahl: "
if errorlevel 3 exit /b 0
if errorlevel 2 goto entfernen

:einrichten
REM  Eine .lnk-Datei kann die Eingabeaufforderung nicht schreiben;
REM  ein kleines VBScript kann es. Es wird angelegt, ausgefuehrt und
REM  wieder geloescht.
set "VBS=%TEMP%\afu_autostart.vbs"
>  "%VBS%" echo Set sh = CreateObject("WScript.Shell")
>> "%VBS%" echo Set lnk = sh.CreateShortcut("%LNK%")
>> "%VBS%" echo lnk.TargetPath = "%ZIEL%"
>> "%VBS%" echo lnk.WorkingDirectory = "%~dp0"
>> "%VBS%" echo lnk.Description = "Amateurfunk-Trainer als Server starten"
>> "%VBS%" echo lnk.WindowStyle = 7
>> "%VBS%" echo lnk.Save
cscript //nologo "%VBS%"
del "%VBS%" >nul 2>nul
if exist "%LNK%" (
    echo.
    echo   Eingerichtet. Ab der naechsten Anmeldung startet der Trainer
    echo   als Server - minimiert, in der Taskleiste.
    echo.
    echo   Jetzt gleich starten? Dann START-SERVER.bat doppelklicken.
) else (
    echo.
    echo   Das hat nicht geklappt - die Verknuepfung wurde nicht angelegt.
    echo   Zur Not von Hand: Windows-Taste + R, "shell:startup", und dort
    echo   eine Verknuepfung zu START-SERVER.bat ablegen.
)
echo.
pause
exit /b 0

:entfernen
if exist "%LNK%" (
    del "%LNK%"
    echo.
    echo   Entfernt. Der Trainer startet nicht mehr von selbst.
) else (
    echo.
    echo   Es war nichts eingerichtet.
)
echo.
pause
exit /b 0
