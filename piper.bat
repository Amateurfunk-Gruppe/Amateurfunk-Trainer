@echo off
setlocal EnableDelayedExpansion
title Piper Sprachausgabe einrichten - Klasse-N-Trainer

echo ================================================================
echo   Piper Sprachausgabe nachtraeglich einrichten
echo ================================================================
echo.
echo   Dieses Skript richtet die natuerliche Sprachausgabe ein.
echo   Es laedt dazu rund 80 MB aus dem Internet:
echo     - Piper (das Programm, das den Text vorliest)
echo     - Stimme "Thorsten" (deutsche Standardstimme)
echo.
echo   Der Trainer laeuft auch OHNE dieses Skript - dann nutzt er
echo   die eingebaute Windows-Stimme, die weniger natuerlich klingt.
echo.
pause
echo.

cd /d "%~dp0"
echo [Ordner] %cd%
echo.

REM ============================================================
echo [1/5] Ordner "piper" vorbereiten
REM ============================================================
if not exist "piper\" (
    mkdir "piper"
    echo   - Ordner "piper" wurde angelegt.
) else (
    echo   - Ordner "piper" ist bereits vorhanden.
)
if exist "piper\piper.exe" (
    echo   - piper.exe ist schon da. Programm-Download wird uebersprungen.
    set PIPER_DA=1
) else (
    set PIPER_DA=0
)
echo.

REM ============================================================
echo [2/5] Piper-Programm herunterladen und entpacken
REM ============================================================
if "!PIPER_DA!"=="1" goto :stimme

set PIPER_URL=https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_windows_amd64.zip
echo   - Lade piper_windows_amd64.zip ^(ca. 20 MB^)...
curl -L --fail -o "piper_download.zip" "%PIPER_URL%"
if not exist "piper_download.zip" (
    echo   - curl hat nicht funktioniert, versuche es mit PowerShell...
    powershell -Command "try{ Invoke-WebRequest -Uri '%PIPER_URL%' -OutFile 'piper_download.zip' }catch{ exit 1 }"
)
if not exist "piper_download.zip" (
    echo.
    echo   [FEHLER] Download fehlgeschlagen. Bitte pruefe deine Internetverbindung.
    echo            Alternativ von Hand laden und in den Ordner "piper" entpacken:
    echo            %PIPER_URL%
    echo.
    pause
    exit /b 1
)

echo   - Entpacke...
if exist "piper_tmp\" rmdir /s /q "piper_tmp"
mkdir "piper_tmp"
tar -xf "piper_download.zip" -C "piper_tmp" 2>nul
if not exist "piper_tmp\piper.exe" if not exist "piper_tmp\piper\piper.exe" (
    powershell -Command "try{ Expand-Archive -Path 'piper_download.zip' -DestinationPath 'piper_tmp' -Force }catch{ exit 1 }"
)

REM Das Archiv enthaelt je nach Version einen Unterordner "piper" oder die Dateien direkt.
REM Beide Faelle werden hier abgefangen, damit piper.exe sicher in piper\ landet.
if exist "piper_tmp\piper\piper.exe" (
    echo   - Archiv enthaelt einen Unterordner, verschiebe Inhalt...
    xcopy "piper_tmp\piper\*" "piper\" /E /I /Y >nul
) else (
    if exist "piper_tmp\piper.exe" (
        echo   - Verschiebe Dateien...
        xcopy "piper_tmp\*" "piper\" /E /I /Y >nul
    ) else (
        echo   [FEHLER] In dem heruntergeladenen Archiv wurde keine piper.exe gefunden.
        rmdir /s /q "piper_tmp" 2>nul
        del /f /q "piper_download.zip" 2>nul
        pause
        exit /b 1
    )
)
rmdir /s /q "piper_tmp" 2>nul
del /f /q "piper_download.zip" 2>nul
echo   - Piper-Programm ist eingerichtet.
echo.

:stimme
REM ============================================================
echo [3/5] Deutsche Stimme "Thorsten" herunterladen
REM ============================================================
set STIMME_URL=https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/thorsten/medium/de_DE-thorsten-medium.onnx
set STIMME_DATEI=piper\de_DE-thorsten-medium.onnx

if exist "%STIMME_DATEI%" (
    echo   - Stimme ist bereits vorhanden, Download wird uebersprungen.
) else (
    echo   - Lade Stimme herunter ^(ca. 63 MB, das kann etwas dauern^)...
    curl -L --fail -o "%STIMME_DATEI%" "%STIMME_URL%"
    if not exist "%STIMME_DATEI%" (
        echo   - curl hat nicht funktioniert, versuche es mit PowerShell...
        powershell -Command "try{ Invoke-WebRequest -Uri '%STIMME_URL%' -OutFile '%STIMME_DATEI%' }catch{ exit 1 }"
    )
)

REM Die .json-Datei beschreibt die Stimme. Ohne sie wird das Modell nicht erkannt
REM (siehe findVoices in Server.js: es zaehlen nur .onnx MIT passender .onnx.json).
if exist "%STIMME_DATEI%.json" (
    echo   - Beschreibungsdatei ist bereits vorhanden.
) else (
    echo   - Lade Beschreibungsdatei...
    curl -L --fail -o "%STIMME_DATEI%.json" "%STIMME_URL%.json"
    if not exist "%STIMME_DATEI%.json" (
        powershell -Command "try{ Invoke-WebRequest -Uri '%STIMME_URL%.json' -OutFile '%STIMME_DATEI%.json' }catch{ exit 1 }"
    )
)

if not exist "%STIMME_DATEI%" (
    echo.
    echo   [FEHLER] Die Stimme konnte nicht geladen werden.
    echo            Von Hand laden und in den Ordner "piper" legen:
    echo            %STIMME_URL%
    echo            %STIMME_URL%.json
    echo.
    pause
    exit /b 1
)
echo   - Stimme ist eingerichtet.
echo.

REM ============================================================
echo [4/5] Microsoft Visual C++ Redistributable pruefen
REM ============================================================
REM Fehlt dieses Paket, stuerzt piper.exe beim Start sofort ab (Code 0xC0000409).
REM Das ist mit Abstand die haeufigste Ursache fuer "TTS geht nicht".
reg query "HKLM\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\X64" /v Installed >nul 2>&1
if !errorlevel! == 0 (
    echo   - Ist installiert, alles gut.
) else (
    echo   - FEHLT. Ohne dieses Microsoft-Paket stuerzt Piper beim Start ab.
    echo   - Lade Installer herunter...
    curl -L --fail -o "vc_redist.x64.exe" "https://aka.ms/vs/17/release/vc_redist.x64.exe"
    if not exist "vc_redist.x64.exe" (
        powershell -Command "try{ Invoke-WebRequest -Uri 'https://aka.ms/vs/17/release/vc_redist.x64.exe' -OutFile 'vc_redist.x64.exe' }catch{ exit 1 }"
    )
    if exist "vc_redist.x64.exe" (
        echo   - Starte Installation ^(bitte bestaetigen, falls Windows nachfragt^)...
        start /wait vc_redist.x64.exe /install /passive /norestart
        del /f /q "vc_redist.x64.exe"
        echo   - Installation abgeschlossen.
    ) else (
        echo   - Download fehlgeschlagen. Bitte von Hand installieren:
        echo     https://aka.ms/vs/17/release/vc_redist.x64.exe
    )
)
echo.

REM ============================================================
echo [5/5] Funktionstest
REM ============================================================
set TEST_OK=0
if exist "piper\piper.exe" (
    pushd "piper"
    piper.exe --help >nul 2>&1
    if !errorlevel! == 0 set TEST_OK=1
    popd
)
if "!TEST_OK!"=="1" (
    echo   - Piper startet einwandfrei.
) else (
    echo   - Piper laesst sich nicht starten.
    echo     Haeufige Ursachen: Virenscanner blockiert piper.exe, oder das
    echo     Microsoft-Paket aus Schritt 4 wurde noch nicht installiert.
    echo     Tipp: Windows neu starten und dieses Skript erneut ausfuehren.
)
echo.

echo ================================================================
if "!TEST_OK!"=="1" (
    echo   FERTIG! Sprachausgabe ist eingerichtet.
    echo.
    echo   Naechster Schritt: START.bat starten ^(bzw. neu starten, falls
    echo   der Trainer gerade laeuft^) - dann steht die Stimme zur Verfuegung.
) else (
    echo   Die Dateien sind da, aber der Funktionstest ist fehlgeschlagen.
    echo   Bitte die Hinweise oben pruefen.
)
echo ================================================================
echo.
pause
