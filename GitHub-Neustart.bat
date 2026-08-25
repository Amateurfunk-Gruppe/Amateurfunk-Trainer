@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Frische Git-Historie fuer GitHub
echo  -------------------------------
echo  Die alte Historie wird NICHT geloescht, nur zur Seite gelegt.
echo  Hochgeladen wird nichts.
node github_neustart.js
pause
