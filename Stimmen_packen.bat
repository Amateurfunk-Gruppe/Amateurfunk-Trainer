@echo off
title Piper-Stimmen packen
cd /d "%~dp0"
echo ================================================================
echo   Piper-Stimmen zu einer Datei packen
echo ================================================================
echo.
echo   Aus dem Ordner "piper" wird  Piper-Stimmen.zip  gebaut.
echo   Das dauert bei rund 450 MB etwa eine halbe Minute.
echo.
echo   Diese Datei kommt als Anhang an ein GitHub-Release,
echo   NICHT ins Repository.
echo.
node stimmen_packen.js
echo.
pause
