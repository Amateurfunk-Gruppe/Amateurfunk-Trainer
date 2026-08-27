# ================================================================
#  node_holen.ps1 - holt Node.js in den Trainer-Ordner
# ================================================================
#  WARUM POWERSHELL UND NICHT JAVASCRIPT:
#  Alle anderen Werkzeuge des Trainers sind .bat + .js. Hier geht das
#  nicht: Dieses Werkzeug soll Node.js beschaffen - wer es braucht, hat
#  also noch kein Node, mit dem sich eine .js-Datei ausfuehren liesse.
#  PowerShell ist seit Windows 7 auf jedem Rechner.
#
#  WAS ES TUT:
#    1. sieht bei nodejs.org nach, welches die aktuelle LTS-Fassung ist
#    2. laedt das passende Standalone-Archiv (kein Installer, keine
#       Administratorrechte, keine Aenderung an der Registry)
#    3. rechnet die Pruefsumme nach und vergleicht sie mit SHASUMS256.txt
#    4. entpackt nach  node\  im Trainer-Ordner
#
#  DIE PRUEFSUMME IST KEIN SCHMUCK:
#  Hier wird eine ausfuehrbare Datei auf einen fremden Rechner gelegt.
#  Stimmt der Fingerabdruck nicht mit dem ueberein, den nodejs.org
#  angibt, wird die Datei geloescht und nichts entpackt. Ein abgerissener
#  Download oder etwas Untergeschobenes kommt so nie im Ordner an.
# ================================================================

$ErrorActionPreference = 'Stop'
$ProgressPreference    = 'SilentlyContinue'   # sonst ist der Download quaelend langsam
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}

$Wurzel = Split-Path -Parent $MyInvocation.MyCommand.Path
$Ziel   = Join-Path $Wurzel 'node'

function Zeile($t) { Write-Host "  $t" }
function Trenner  { Write-Host '  ------------------------------------------------------------' }

Write-Host ''
Write-Host '  ============================================================'
Write-Host '   Node.js in den Trainer-Ordner holen'
Write-Host '  ============================================================'
Write-Host ''

# ---- Welche Architektur hat dieser Rechner? --------------------
# Ohne diese Frage bekaeme ein ARM-Notebook eine x64-Datei, die nicht
# startet - und die Fehlermeldung waere nichtssagend.
$arch = switch ($env:PROCESSOR_ARCHITECTURE) {
  'AMD64' { 'x64' }
  'ARM64' { 'arm64' }
  'x86'   { if ($env:PROCESSOR_ARCHITEW6432 -eq 'AMD64') { 'x64' } else { 'x86' } }
  default { 'x64' }
}
Zeile "Rechner: Windows $arch"

# ---- Liegt schon etwas da? -------------------------------------
$vorhanden = $null
if (Test-Path (Join-Path $Ziel 'node.exe')) {
  try { $vorhanden = (& (Join-Path $Ziel 'node.exe') -v) 2>$null } catch {}
  Zeile "Im Ordner node\ liegt bereits Node $vorhanden"
  $a = Read-Host '  Neu holen und ersetzen?  [j/n] '
  if ($a -notmatch '^[jJyY]') { Write-Host ''; Zeile 'Nichts geaendert.'; Write-Host ''; exit 0 }
}

# ---- Ist ohnehin schon ein Node installiert? -------------------
$system = $null
try { $system = (& node -v) 2>$null } catch {}
if ($system) {
  Zeile "Hinweis: Auf diesem Rechner ist bereits Node $system installiert."
  Zeile 'Der Trainer laeuft damit. Diese Datei brauchst du nur, wenn du'
  Zeile 'Node lieber im Trainer-Ordner haben moechtest (z.B. zum Weitergeben).'
  Write-Host ''
}

# ---- Welche Fassung ist aktuell LTS? ---------------------------
Zeile 'Frage bei nodejs.org nach der aktuellen LTS-Fassung ...'
try {
  $alle = Invoke-RestMethod -Uri 'https://nodejs.org/dist/index.json' -UseBasicParsing -TimeoutSec 40
} catch {
  Write-Host ''
  Zeile '!! Die Liste der Fassungen war nicht erreichbar.'
  Zeile "   $($_.Exception.Message)"
  Zeile '   Besteht eine Internetverbindung?'
  Write-Host ''
  exit 1
}
$lts = $alle | Where-Object { $_.lts -and $_.lts -ne $false } | Select-Object -First 1
if (-not $lts) { Zeile '!! Keine LTS-Fassung gefunden. Abbruch.'; exit 1 }
$ver = $lts.version                       # z.B. v24.20.0
Zeile "Aktuelle LTS: $ver  ($($lts.lts))"

if ($vorhanden -and $vorhanden -eq $ver) {
  Write-Host ''
  Zeile "Der Ordner node\ hat bereits genau diese Fassung ($ver)."
  $a = Read-Host '  Trotzdem neu laden?  [j/n] '
  if ($a -notmatch '^[jJyY]') { Write-Host ''; Zeile 'Nichts geaendert.'; Write-Host ''; exit 0 }
}

$name = "node-$ver-win-$arch.zip"
$url  = "https://nodejs.org/dist/$ver/$name"
$tmp  = Join-Path $env:TEMP $name

# ---- Herunterladen ---------------------------------------------
Write-Host ''
Zeile "Lade $name"
Zeile "von   $url"
Zeile '(rund 30 MB - das dauert je nach Leitung ein bis zwei Minuten)'
try {
  Invoke-WebRequest -Uri $url -OutFile $tmp -UseBasicParsing -TimeoutSec 900
} catch {
  Write-Host ''
  Zeile '!! Der Download ist fehlgeschlagen.'
  Zeile "   $($_.Exception.Message)"
  Write-Host ''
  exit 1
}
$mb = [math]::Round((Get-Item $tmp).Length / 1MB, 1)
Zeile "Geladen: $mb MB"

# ---- Pruefsumme nachrechnen ------------------------------------
Zeile 'Rechne die Pruefsumme nach ...'
$ok = $false
try {
  $sums = (Invoke-WebRequest -Uri "https://nodejs.org/dist/$ver/SHASUMS256.txt" `
             -UseBasicParsing -TimeoutSec 60).Content -split "`n"
  # Klammern ausdruecklich: sonst haengt es an der Rangfolge von + und
  # -match, ob hier der Dateiname oder etwas anderes verglichen wird.
  $muster = '\s' + [regex]::Escape($name) + '\s*$'
  $soll = ($sums | Where-Object { $_ -match $muster } |
             Select-Object -First 1) -split '\s+' | Select-Object -First 1
  $ist  = (Get-FileHash -Path $tmp -Algorithm SHA256).Hash.ToLower()
  if ($soll -and $ist -eq $soll.ToLower()) { $ok = $true }
} catch {
  Zeile "   Die Pruefsummen-Datei war nicht lesbar: $($_.Exception.Message)"
}
if (-not $ok) {
  Write-Host ''
  Zeile '!! ABBRUCH. Die Pruefsumme stimmt nicht mit nodejs.org ueberein.'
  Zeile '   Die heruntergeladene Datei wird geloescht, es wurde nichts entpackt.'
  Zeile '   Bitte noch einmal versuchen.'
  Remove-Item $tmp -Force -ErrorAction SilentlyContinue
  Write-Host ''
  exit 1
}
Zeile 'Pruefsumme stimmt.'

# ---- Entpacken --------------------------------------------------
# Das Archiv enthaelt einen Oberordner (node-vXX-win-x64). Der soll nicht
# mit in den Trainer - dort soll schlicht  node\node.exe  liegen.
Zeile 'Entpacke ...'
$roh = Join-Path $env:TEMP ('node_entpackt_' + [guid]::NewGuid().ToString('N').Substring(0,8))
try {
  # Expand-Archive gibt es erst ab PowerShell 5. Auf einem aelteren
  # Windows faellt es auf die .NET-Klasse zurueck - die kann dasselbe und
  # ist seit .NET 4.5 dabei.
  if (Get-Command Expand-Archive -ErrorAction SilentlyContinue) {
    Expand-Archive -Path $tmp -DestinationPath $roh -Force
  } else {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($tmp, $roh)
  }
  $innen = Get-ChildItem $roh -Directory | Select-Object -First 1
  if (-not $innen) { throw 'Im Archiv war kein Ordner zu finden.' }

  if (Test-Path $Ziel) {
    # Nicht loeschen, sondern beiseiteschieben - Loeschen ist im Trainer
    # nirgends erlaubt, und ein halb entpacktes node\ waere schlimmer als
    # ein altes.
    $bei = Join-Path $Wurzel ('node_alt_' + (Get-Date -Format 'yyyy-MM-dd-HHmm'))
    Move-Item $Ziel $bei
    Zeile "Die alte Fassung liegt jetzt in  $(Split-Path -Leaf $bei)"
  }
  Move-Item $innen.FullName $Ziel
} catch {
  Write-Host ''
  Zeile '!! Das Entpacken ist fehlgeschlagen.'
  Zeile "   $($_.Exception.Message)"
  Write-Host ''
  exit 1
} finally {
  Remove-Item $tmp -Force -ErrorAction SilentlyContinue
  Remove-Item $roh -Recurse -Force -ErrorAction SilentlyContinue
}

# ---- Nachsehen, ob es wirklich laeuft --------------------------
$exe = Join-Path $Ziel 'node.exe'
if (-not (Test-Path $exe)) { Zeile '!! node.exe ist nicht angekommen. Abbruch.'; exit 1 }
$probe = & $exe -v
Write-Host ''
Trenner
Zeile "FERTIG. Im Ordner node\ liegt jetzt Node $probe"
Trenner
Write-Host ''
Zeile 'START.bat nimmt diese Fassung ab sofort von selbst - eine'
Zeile 'Installation von Node.js ist auf diesem Rechner nicht mehr noetig.'
Write-Host ''
Zeile 'Zum Weitergeben: Der Ordner node\ kann einfach mitkopiert werden.'
Write-Host ''
