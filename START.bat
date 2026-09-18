@echo off
REM "start" statt direktem Aufruf: START.vbs sieht seit dem 18.09.2026
REM bis zu 30 Sekunden zu, ob der Server hochkommt. Ohne "start" bliebe
REM dieses schwarze Fenster so lange stehen.
start "" wscript //nologo "%~dp0START.vbs"
exit
