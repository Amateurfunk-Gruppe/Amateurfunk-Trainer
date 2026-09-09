@echo off
REM ============================================================
REM  Zeichen-Auffrischen.bat
REM  Holt das aktuelle Zeichen auf die Verknuepfung am Schreibtisch
REM ------------------------------------------------------------
REM  Dietmar am 09.09.2026: "Das alte Icon ist noch immer zu sehen,
REM  unter Windows."
REM
REM  Der Trainer macht das seit 1.234.0 von selbst - nach einem
REM  Update und einmal beim Start, wenn die Bilddatei neuer ist.
REM  Diese Datei ist fuer den Fall, dass man nicht warten will
REM  oder nachsehen moechte, was dabei gefunden wird: Sie schreibt
REM  jede Verknuepfung auf, die sie anfasst, und was vorher darin
REM  stand.
REM
REM  Sie aendert nur das Zeichen. Ziel, Name und Arbeitsordner der
REM  Verknuepfung bleiben, wie sie sind; angelegt oder geloescht
REM  wird nichts.
REM ============================================================
cd /d "%~dp0"
echo.
echo   Zeichen auffrischen ...
echo.
where node >nul 2>&1
if errorlevel 1 (
  echo   Node.js wurde nicht gefunden.
  echo   Der Trainer bringt eigenes Node mit - dann bitte so starten:
  echo      node\node.exe verknuepfung_auffrischen.js
  echo.
  if exist "node\node.exe" (
    "node\node.exe" verknuepfung_auffrischen.js
  )
) else (
  node verknuepfung_auffrischen.js
)
echo.
echo   Fertig. Wird das alte Bild weiter angezeigt, hilft:
echo     - Rechtsklick auf den Schreibtisch, "Aktualisieren"
echo     - oder einmal ab- und wieder anmelden
echo.
pause
