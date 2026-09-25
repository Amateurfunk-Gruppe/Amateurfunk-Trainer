@echo off
REM ================================================================
REM  STOP.bat - den Trainer beenden                      25.09.2026
REM  ----------------------------------------------------------------
REM  Beendet wie bisher jedes node.exe auf dem Rechner (so steht es
REM  auch in START.vbs: "dasselbe, was STOP.bat tut"). Beim Tunnel
REM  aber nur noch die Quick Tunnels des Trainers - nicht mehr JEDES
REM  cloudflared.
REM
REM  Warum: Seit dem 21.09.2026 kann cloudflared auch als Windows-
REM  Dienst laufen, fuer die feste Adresse. Server.js raeumt deshalb
REM  seit dem 21.09. nur noch Tunnel auf, deren Befehlszeile "--url"
REM  enthaelt. Hier stand aber weiter "taskkill /f /im cloudflared.exe".
REM  START.vbs empfiehlt in einem Fall ausdruecklich, STOP.bat als
REM  Administrator zu starten - und dann haette diese Zeile den Dienst
REM  mit beendet, und die feste Adresse waere weg gewesen.
REM
REM  Dietmar am 25.09.2026: "ob irgendwo noch Fehler vorhanden sind,
REM  ob alles sauber funktioniert."
REM ================================================================
echo Beende Trainer...
taskkill /f /im node.exe >nul 2>nul
powershell -NoProfile -NonInteractive -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'cloudflared.exe' -and $_.CommandLine -like '*--url*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }" >nul 2>nul
timeout /t 1 >nul
echo Fertig.
pause
