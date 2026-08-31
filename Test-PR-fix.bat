@echo off
cd /d "C:\Program Files\Amateurfunk-Trainer"
git checkout main
git pull origin main
git branch -D test-coderabbit-2026-08-31 2>nul
git push origin --delete test-coderabbit-2026-08-31 2>nul
echo Test fuer CodeRabbit - %date% %time% > coderabbit-test.txt
git checkout -b test-coderabbit-2026-08-31
git add coderabbit-test.txt
git commit -m "Test: .coderabbit.yaml pruefen"
git push -u origin test-coderabbit-2026-08-31
start https://github.com/Amateurfunk-Gruppe/Amateurfunk-Trainer/pull/new/test-coderabbit-2026-08-31
pause