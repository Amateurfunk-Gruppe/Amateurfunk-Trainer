@echo off
title Zu GitHub hochladen
cd /d "%~dp0"
echo ================================================================
echo   Amateurfunk-Trainer zu GitHub hochladen
echo ================================================================
echo.
echo   Es wird erst geprueft, dann gefragt, dann hochgeladen.
echo   Nach Passwoertern fragt git selbst - nicht dieses Fenster.
echo.
node hochladen.js
echo.
pause
