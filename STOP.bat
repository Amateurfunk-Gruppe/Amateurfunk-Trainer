@echo off
echo Beende Trainer...
taskkill /f /im node.exe >nul 2>nul
taskkill /f /im cloudflared.exe >nul 2>nul
timeout /t 1 >nul
echo Fertig.
pause
