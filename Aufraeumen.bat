@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Trainer-Ordner aufraeumen
echo  -------------------------
echo  Es wird nichts geloescht - alles wandert in einen Ordner,
echo  den du danach selbst in den Papierkorb ziehen kannst.
node aufraeumen.js
echo.
pause
