@echo off
setlocal EnableDelayedExpansion
title Amateurfunk Pruefungsgenerator - Cloudflare Tunnel
cd /d "%~dp0"

echo ============================================================
echo   Cloudflare Tunnel starten (fuer "Gemeinsamer Modus")
echo ============================================================
echo.

REM --- cloudflared herunterladen, falls nicht vorhanden ---------------------
if not exist cloudflared.exe (
    echo cloudflared.exe nicht gefunden - lade herunter ...
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
      "$ProgressPreference='SilentlyContinue'; [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; try { Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'cloudflared.exe' -UseBasicParsing } catch { Write-Host ('DL-FEHLER: '+$_.Exception.Message) }"
    if not exist cloudflared.exe (
        echo [FEHLER] Download von cloudflared fehlgeschlagen ^(Internet/Firewall pruefen^).
        echo Alternativ manuell laden: https://github.com/cloudflare/cloudflared/releases/latest
        pause
        exit /b 1
    )
    echo [OK] cloudflared.exe heruntergeladen.
    echo.
    echo HINWEIS: Falls Windows Defender die Datei als Bedrohung meldet, handelt
    echo es sich meist um einen bekannten Fehlalarm bei neuen cloudflared-Versionen.
    echo Bei Bedarf in den Windows-Sicherheitseinstellungen wiederherstellen/zulassen.
    echo.
) else (
    echo [OK] cloudflared.exe bereits vorhanden.
)

REM --- Evtl. alte, haengende cloudflared-Prozesse beenden --------------------
taskkill /IM cloudflared.exe /F >nul 2>nul

REM --- Alte Tunnel-Dateien entfernen -----------------------------------------
del /q tunnel_url.txt >nul 2>nul
del /q tunnel.log >nul 2>nul
del /q tunnel_out.log >nul 2>nul

echo.
echo Starte Tunnel zu http://localhost:3000 (laeuft im Hintergrund weiter) ...
echo.

REM --- Tunnel starten + auf URL warten (alles in einem PowerShell-Prozess) --
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ProgressPreference='SilentlyContinue';" ^
  "$exe = Join-Path (Get-Location) 'cloudflared.exe';" ^
  "$log = Join-Path (Get-Location) 'tunnel.log';" ^
  "$out = Join-Path (Get-Location) 'tunnel_out.log';" ^
  "Start-Process -FilePath $exe -ArgumentList 'tunnel','--url','http://localhost:3000' -RedirectStandardError $log -RedirectStandardOutput $out -WindowStyle Hidden | Out-Null;" ^
  "$found = $false;" ^
  "for ($i=0; $i -lt 30; $i++) {" ^
  "  Start-Sleep -Seconds 1;" ^
  "  if (Test-Path $log) {" ^
  "    $m = Select-String -Path $log -Pattern 'https://[a-zA-Z0-9\-]+\.trycloudflare\.com' -ErrorAction SilentlyContinue | Select-Object -First 1;" ^
  "    if ($m) {" ^
  "      $url = $m.Matches[0].Value;" ^
  "      [System.IO.File]::WriteAllText('tunnel_url.txt', $url);" ^
  "      Write-Host ('[OK] Tunnel-URL gefunden: ' + $url);" ^
  "      $found = $true;" ^
  "      break" ^
  "    }" ^
  "  }" ^
  "}" ^
  "if (-not $found) { Write-Host '[FEHLER] Nach 30 Sekunden keine Tunnel-URL gefunden. Inhalt von tunnel.log:'; if (Test-Path $log) { Get-Content $log } }"

echo.
if exist tunnel_url.txt (
    echo ============================================================
    echo   Fertig! Tunnel laeuft im Hintergrund weiter.
    echo   Server ^(falls noch nicht laufend^) jetzt mit start.bat starten.
    echo   Im "Gemeinsamer Modus" sollte die URL jetzt automatisch
    echo   erkannt werden ^(ggf. Modal einmal schliessen/neu oeffnen^).
    echo ============================================================
) else (
    echo ============================================================
    echo   Tunnel konnte nicht bestaetigt werden - siehe Meldungen oben.
    echo   Moegliche Ursachen: Firewall/Antivirus blockiert cloudflared,
    echo   oder keine Internetverbindung.
    echo ============================================================
)
echo.
pause
