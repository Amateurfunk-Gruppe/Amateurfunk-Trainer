# ================================================================
#  verknuepfung.ps1 - Verknuepfung auf den Desktop legen
# ================================================================
#  Legt eine Verknuepfung zu START.bat auf den Desktop, mit dem
#  Funkgeraet-Symbol statt des grauen Zahnrads, das Windows sonst
#  fuer eine .bat-Datei zeigt.
#
#  WARUM POWERSHELL:
#  Eine Verknuepfung (.lnk) ist eine Binaerdatei mit festem Aufbau.
#  Sie von Hand zu schreiben waere unnoetig heikel - Windows bringt
#  mit WScript.Shell seit jeher eine Schnittstelle dafuer mit, und
#  die benutzt genau dieselben Felder, die auch der Explorer setzt.
#
#  WARUM EINE .ICO UND NICHT DIE .PNG:
#  Windows nimmt fuer Verknuepfungen nur .ico an. Eine .png wird
#  stumm ignoriert - man sieht dann wieder das Zahnrad und sucht
#  den Fehler an der falschen Stelle. Die icon.ico enthaelt acht
#  Groessen von 16 bis 256 Pixeln, damit sie in der Detailansicht
#  genauso sauber aussieht wie bei grossen Symbolen.
# ================================================================

$ErrorActionPreference = 'Stop'
$Wurzel = Split-Path -Parent $MyInvocation.MyCommand.Path

function Zeile($t) { Write-Host "  $t" }

Write-Host ''
Write-Host '  ============================================================'
Write-Host '   Verknuepfung auf den Desktop legen'
Write-Host '  ============================================================'
Write-Host ''

$ziel = Join-Path $Wurzel 'START.bat'
$icon = Join-Path $Wurzel 'icon.ico'

if (-not (Test-Path $ziel)) {
  Zeile '!! START.bat ist in diesem Ordner nicht zu finden.'
  Zeile '   Diese Datei gehoert in den Trainer-Ordner.'
  Write-Host ''
  exit 1
}

# Kein Symbol? Dann trotzdem eine Verknuepfung anlegen - eine mit
# Zahnrad ist besser als gar keine.
$mitIcon = Test-Path $icon
if (-not $mitIcon) {
  Zeile 'Hinweis: icon.ico fehlt - die Verknuepfung bekommt das'
  Zeile '         Windows-Standardsymbol. Alles andere geht trotzdem.'
  Write-Host ''
}

$desktop = [Environment]::GetFolderPath('Desktop')
$lnk = Join-Path $desktop 'Amateurfunk-Trainer.lnk'
$gabSchon = Test-Path $lnk

try {
  $ws = New-Object -ComObject WScript.Shell
  $v = $ws.CreateShortcut($lnk)
  $v.TargetPath       = $ziel
  $v.WorkingDirectory = $Wurzel      # sonst sucht START.bat im falschen Ordner
  $v.Description      = 'Amateurfunk-Trainer starten'
  # 7 = minimiert. START.bat legt sich ohnehin selbst in die Taskleiste;
  # ohne diese Zeile blitzt vorher aber noch einmal kurz ein Fenster auf,
  # weil das erste sich erst starten muss, um sich zu verkleinern. So
  # bleibt es von Anfang an unten.
  $v.WindowStyle      = 7
  if ($mitIcon) { $v.IconLocation = "$icon,0" }
  $v.Save()
} catch {
  Write-Host ''
  Zeile '!! Die Verknuepfung liess sich nicht anlegen.'
  Zeile "   $($_.Exception.Message)"
  Write-Host ''
  exit 1
}

# Kein Fragezeichen-Operator: Den gibt es erst ab PowerShell 7, und
# Windows startet mit "powershell" die Fassung 5.1. Dort waere die
# ganze Datei mit einem Syntaxfehler stehengeblieben.
if ($gabSchon) { Zeile 'Verknuepfung erneuert:' } else { Zeile 'Verknuepfung angelegt:' }
Zeile "   $lnk"
Zeile "   zeigt auf  $ziel"
if ($mitIcon) { Zeile '   mit dem Funkgeraet-Symbol' }
Write-Host ''
Zeile 'Falls auf dem Desktop noch das alte Symbol steht: einmal F5'
Zeile 'druecken. Windows merkt sich Symbole und zeigt sie manchmal'
Zeile 'erst nach dem Auffrischen neu.'
Write-Host ''
