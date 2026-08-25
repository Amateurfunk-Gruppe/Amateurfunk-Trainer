@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Vor dem Hochladen zu GitHub pruefen
echo  -----------------------------------
echo  Es wird nichts hochgeladen und nichts veraendert - nur gelesen.
node github_pruefen.js
pause
