@echo off
cd /d "%~dp0"
echo Aktueller Ordner: %CD%
echo.

if not exist ".git" (
  echo FEHLER: Hier ist kein .git Ordner! 
  echo Lege diese Bat direkt in den Amateurfunk-Trainer Ordner.
  pause
  exit /b
)

set branch=test-coderabbit-%date:~-4%-%date:~-7,2%-%date:~-10,2%
echo Erstelle Test-Branch: %branch%
echo.

git checkout main
git pull origin main
git checkout -b %branch%

echo Test fuer .coderabbit.yaml vom %date% %time% > coderabbit-test.txt
git add coderabbit-test.txt
git commit -m "Test: .coderabbit.yaml pruefen"

git push -u origin %branch%

echo.
echo Fertig! Jetzt PR auf GitHub erstellen:
echo https://github.com/Amateurfunk-Gruppe/Amateurfunk-Trainer/pull/new/%branch%
echo.
start https://github.com/Amateurfunk-Gruppe/Amateurfunk-Trainer/pull/new/%branch%
pause