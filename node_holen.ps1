# ================================================================
#  node_holen.ps1 - Node.js in den Ordner node\ holen
# ----------------------------------------------------------------
#  Dietmar am 15.09.2026: "wenn die den Trainer so aufbauen, das Node
#  nachinstalliert wird?" - und dazu: "beim Start soll ein Fenster
#  kommen, das den Benutzer darueber informiert, das Bestandteile
#  nachinstalliert werden."
#
#  WARUM ES DIESE DATEI WIEDER GIBT. Sie war am 01.09.2026 geloescht
#  worden, mit gutem Grund: Das Setup bringt node\ mit, also brauchte
#  niemand mehr einen Nachlader. Am 15.09.2026 hat sich das gedreht -
#  Smart App Control blockiert auf frischen Windows-11-Rechnern das
#  Setup, bevor es anfaengt ("Fehler 4551: Eine Anwendungssteuerungs-
#  richtlinie hat diese Datei blockiert"). Ein Inno-Setup packt sich
#  zum Start in den Temp-Ordner aus, und genau das laesst die Richtlinie
#  bei einem unsignierten Programm nicht zu.
#
#  Ein ZIP wird ausgepackt und nicht ausgefuehrt. Damit faellt die
#  Blockade weg - aber auch node.exe, denn 90 MB gehoeren nicht in ein
#  Archiv, das jemand nur zum Lernen herunterlaedt. Also holt der
#  Trainer es beim ersten Start selbst.
#
#  WARUM POWERSHELL UND NICHT NODE. Weil Node genau das ist, was fehlt.
#  PowerShell liegt seit Windows 7 auf jedem Rechner.
#
#  WARUM DAS ZIP UND NICHT DAS MSI VON NODEJS.ORG. Das MSI installiert
#  Node in Windows und will dafuer Administratorrechte. Das ZIP wird in
#  den Trainer-Ordner entpackt, fertig - keine Abfrage, kein Eingriff
#  ins System, und beim Loeschen des Ordners ist auch Node wieder weg.
#
#  DIE VORSICHTSMASSNAHMEN, dieselben wie in programme_holen.js und eine
#  mehr:
#    - Nur nodejs.org. Jede Umleitung wird erneut geprueft.
#    - Eine Obergrenze fuer die Dateigroesse.
#    - Erst unter Zwischennamen schreiben, dann umbenennen. Ein Abbruch
#      hinterlaesst so kein halbes node\.
#    - NEU: Die Pruefsumme wird verglichen. Node veroeffentlicht zu
#      jeder Fassung SHASUMS256.txt; damit ist nachpruefbar, dass
#      ankam, was ankommen sollte. programme_holen.js kann das noch
#      nicht - hier geht es, weil die Quelle es anbietet.
#
#  Aufruf:  powershell -NoProfile -ExecutionPolicy Bypass -File node_holen.ps1
#  Rueckgabe: 0 = node\node.exe liegt da. Alles andere = nicht geschafft.
# ================================================================

$ErrorActionPreference = 'Stop'
$MAX_BYTES = 120MB

# Aeltere PowerShell-Fassungen sprechen von sich aus noch TLS 1.0 -
# nodejs.org nimmt das nicht mehr an. Ohne diese Zeile bricht der
# Download mit einer nichtssagenden Meldung ab.
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}

$wurzel = Split-Path -Parent $MyInvocation.MyCommand.Path
$ziel   = Join-Path $wurzel 'node'

function Sag($text) { Write-Host "  $text" }

Write-Host ''
Write-Host '  ================================================'
Write-Host '   Node.js fuer den Amateurfunk-Trainer holen'
Write-Host '  ================================================'
Write-Host ''

if (Test-Path (Join-Path $ziel 'node.exe')) {
    Sag 'node\node.exe liegt schon da - nichts zu tun.'
    exit 0
}

# ---- Welche Fassung, welche Architektur? ------------------------
# Die Liste kommt von nodejs.org selbst, damit das Skript nicht mit
# einer festen Versionsnummer veraltet. Genommen wird die neueste
# LTS-Fassung: die wird am laengsten gepflegt, und der Trainer braucht
# ohnehin nur "18 oder neuer".
$arch = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'arm64' } else { 'x64' }
Sag "Dieser Rechner: Windows $arch"

try {
    $liste = Invoke-RestMethod -Uri 'https://nodejs.org/dist/index.json' -UseBasicParsing -TimeoutSec 60
} catch {
    Sag "Die Liste der Fassungen war nicht erreichbar: $($_.Exception.Message)"
    Sag 'Ohne Internet geht es hier nicht weiter.'
    exit 2
}

$fassung = $liste |
    Where-Object { $_.lts -and $_.files -contains "win-$arch-zip" } |
    Select-Object -First 1
if (-not $fassung) {
    Sag "Fuer Windows $arch ist keine LTS-Fassung als ZIP aufgefuehrt."
    exit 3
}
$v = $fassung.version                      # z. B. v22.20.0
Sag "Genommen wird $v (LTS)"

$datei = "node-$v-win-$arch.zip"
$basis = "https://nodejs.org/dist/$v"
$quelle = "$basis/$datei"

# ---- Nur nodejs.org, auch nach einer Umleitung -----------------
function WirtErlaubt($u) {
    try { return ([Uri]$u).Host -match '(^|\.)nodejs\.org$' } catch { return $false }
}
if (-not (WirtErlaubt $quelle)) { Sag 'Unerwartete Adresse - abgebrochen.'; exit 4 }

# ---- Die Pruefsumme zuerst -------------------------------------
# Erst die Liste der Pruefsummen, dann die Datei. Andersherum haette
# man erst 30 MB geladen und wuesste danach nicht, ob sie stimmen.
try {
    $summen = (Invoke-WebRequest -Uri "$basis/SHASUMS256.txt" -UseBasicParsing -TimeoutSec 60).Content
} catch {
    Sag "SHASUMS256.txt war nicht erreichbar: $($_.Exception.Message)"
    exit 5
}
# SHASUMS256.txt hat je Zeile "<summe>  <dateiname>" (manchmal mit
# einem * vor dem Namen). Bewusst OHNE regulaeren Ausdruck: Der Name
# enthaelt Punkte und Bindestriche, und ein falsch entwerteter Ausdruck
# waere hier die unauffaelligste Art, die Pruefung wirkungslos zu machen.
$soll = $null
foreach ($zeile in ($summen -split "`n")) {
    $teile = ($zeile.Trim() -split '\s+')
    if ($teile.Count -lt 2) { continue }
    if ($teile[1].TrimStart('*') -eq $datei) { $soll = $teile[0].ToLower(); break }
}
if (-not $soll) { Sag "In SHASUMS256.txt steht kein Eintrag fuer $datei."; exit 6 }
Sag "Pruefsumme laut nodejs.org: $($soll.Substring(0,16)) ..."

# ---- Herunterladen unter Zwischennamen -------------------------
$tmpZip = Join-Path $wurzel ('node_holen.' + $PID + '.tmp')
$tmpOrd = Join-Path $wurzel ('node_holen_aus.' + $PID)
function Aufraeumen {
    if (Test-Path $tmpZip) { Remove-Item $tmpZip -Force -ErrorAction SilentlyContinue }
    if (Test-Path $tmpOrd) { Remove-Item $tmpOrd -Recurse -Force -ErrorAction SilentlyContinue }
}

try {
    Sag "Wird geholt: $datei (rund 30 MB)"
    Invoke-WebRequest -Uri $quelle -OutFile $tmpZip -UseBasicParsing -TimeoutSec 900
    $gross = (Get-Item $tmpZip).Length
    if ($gross -gt $MAX_BYTES) { throw "Die Datei ist $([math]::Round($gross/1MB)) MB gross - das kann nicht stimmen." }
    Sag "Geladen: $([math]::Round($gross/1MB,1)) MB"

    Sag 'Pruefsumme wird verglichen ...'
    $ist = (Get-FileHash -Path $tmpZip -Algorithm SHA256).Hash.ToLower()
    if ($ist -ne $soll) { throw "Die Pruefsumme stimmt nicht. Erwartet $soll, bekommen $ist." }
    Sag 'Pruefsumme stimmt.'

    Sag 'Wird entpackt ...'
    Expand-Archive -Path $tmpZip -DestinationPath $tmpOrd -Force

    # Im ZIP liegt ein Ordner node-vXX-win-x64\ mit node.exe darin.
    # Sein INHALT soll nach node\, nicht der Ordner selbst.
    $innen = Get-ChildItem -Path $tmpOrd -Directory | Select-Object -First 1
    if (-not $innen) { throw 'Im Archiv war kein Ordner - unerwarteter Aufbau.' }
    if (-not (Test-Path (Join-Path $innen.FullName 'node.exe'))) { throw 'Im Archiv war keine node.exe.' }

    if (-not (Test-Path $ziel)) { New-Item -ItemType Directory -Path $ziel | Out-Null }
    Get-ChildItem -Path $innen.FullName -Force | ForEach-Object {
        Move-Item -Path $_.FullName -Destination $ziel -Force
    }

    if (-not (Test-Path (Join-Path $ziel 'node.exe'))) { throw 'node.exe ist nicht im Ordner node\ angekommen.' }

    $fassungIst = & (Join-Path $ziel 'node.exe') -v 2>$null
    Sag "Fertig. Im Ordner node\ liegt jetzt $fassungIst"
    Write-Host ''
    Aufraeumen
    exit 0

} catch {
    Sag ''
    Sag "Das hat nicht geklappt: $($_.Exception.Message)"
    Sag ''
    Sag 'Von Hand geht es auch:'
    Sag "  1. $quelle im Browser oeffnen"
    Sag '  2. Das Archiv auspacken'
    Sag "  3. Den INHALT des Ordners node-$v-win-$arch nach node\ legen,"
    Sag '     sodass node\node.exe daliegt'
    Write-Host ''
    Aufraeumen
    # Stehen bleiben. START.vbs schliesst das Fenster sonst sofort, und
    # dann hat der Benutzer eine Fehlermeldung gesehen, die er nicht
    # lesen konnte - das ist schlimmer als keine.
    Write-Host '  Zum Schliessen die Eingabetaste druecken.'
    try { Read-Host | Out-Null } catch {}
    exit 1
}
