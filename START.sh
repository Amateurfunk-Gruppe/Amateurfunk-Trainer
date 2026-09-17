#!/bin/sh
# ================================================================
#  START.sh - der Trainer auf Linux, am Mac und in einer Shell
#             unter Windows (Git Bash, MSYS2, WSL)
# ----------------------------------------------------------------
#  Sie tut dasselbe wie START.vbs unter Windows:
#    - nachsehen, ob node da ist,
#    - nachsehen, ob auf Port 3000 schon etwas laeuft, und den
#      alten Server auf Nachfrage beenden,
#    - den Server starten und den Browser aufmachen.
#
#  Aufgerufen wird sie aus dem Trainer-Ordner heraus:
#      chmod +x START.sh      (einmalig, nur Linux und Mac)
#      ./START.sh
#
#  Zum Beenden: STOP.sh - oder in diesem Fenster Strg+C.
#
# ----------------------------------------------------------------
#  WARUM SIE UNTER WINDOWS NUR KURZ AUFBLITZTE   (15.09.2026)
# ----------------------------------------------------------------
#  Dietmar am 15.09.2026: "bei Start.sh kommt kurz das Terminal,
#  danach nichts mehr."
#
#  Der Grund stand in der alten Fassung schon im Kommentar, nur zog
#  niemand die Folgerung: Sie suchte node ausschliesslich im System
#  ("command -v node"). Unter Windows ist node aber nicht im System
#  installiert - es liegt im Trainer-Ordner unter node\node.exe,
#  weil der Trainer es sich dorthin holt, ohne etwas in Windows zu
#  installieren. Die Suche schlug also fehl, die Datei druckte ihre
#  Meldung und beendete sich - und mit ihr schloss sich das Fenster,
#  bevor irgendjemand die Meldung lesen konnte.
#
#  Zwei Dinge sind deshalb neu:
#    1. node wird an drei Stellen gesucht, node\node.exe zuerst.
#       Damit startet START.sh denselben Server mit demselben node
#       wie START.vbs - also mit demselben Stand.
#    2. Kein Fenster schliesst sich mehr wortlos: Wo abgebrochen
#       wird, wartet die Datei auf die Eingabetaste.
#
#  Der DOPPELKLICK auf eine .sh-Datei bleibt trotzdem Glueckssache:
#  Windows entscheidet nach der Dateiendung, und ob .sh bei Git Bash
#  eingetragen ist, haengt an der Git-Installation. Der verlaessliche
#  Weg unter Windows ist und bleibt START.vbs - es ist derselbe
#  Server aus demselben Ordner.
# ================================================================
set -u

cd "$(dirname "$0")" || exit 1
ORDNER="$(pwd)"
PORT="${PORT:-3000}"

# ----------------------------------------------------------------
#  0. Auf welchem System sind wir?
#     Das entscheidet dreimal etwas: welches node genommen wird, wie
#     der Browser aufgeht und wie ein haengender Server beendet wird.
# ----------------------------------------------------------------
SYSTEM="linux"
case "$(uname -s 2>/dev/null)" in
    MINGW*|MSYS*|CYGWIN*) SYSTEM="windows" ;;
    Darwin)               SYSTEM="mac" ;;
esac
if [ "$SYSTEM" = "linux" ] && [ -r /proc/version ]; then
    grep -qi microsoft /proc/version 2>/dev/null && SYSTEM="wsl"
fi

# ----------------------------------------------------------------
#  Abbrechen, ohne dass das Fenster zuklappt.
#  Unter Linux und Mac laeuft die Datei in einem Terminal, das
#  offen bleibt - dort waere das Warten nur laestig. Unter Windows
#  ist es der Unterschied zwischen "kurz blitzt was auf" und einer
#  lesbaren Meldung.
# ----------------------------------------------------------------
schluss() {
    if [ "$SYSTEM" = "windows" ] || [ "$SYSTEM" = "wsl" ]; then
        echo ""
        printf "  Zum Schliessen die Eingabetaste druecken. "
        read WEITER 2>/dev/null || true
    fi
    exit "${1:-1}"
}

# ----------------------------------------------------------------
#  1. Welches node?
#     Reihenfolge mit Absicht:
#       a) node/node.exe im Trainer-Ordner - damit startet auch
#          START.vbs. Unter Windows und in der WSL die erste Wahl,
#          damit beide Wege denselben Stand benutzen.
#       b) node/bin/node - ein entpacktes Node neben dem Trainer,
#          wie es ein Paket fuer Linux mitbringen kann.
#       c) node aus dem System - der Normalfall auf Linux und Mac.
# ----------------------------------------------------------------
NODE=""
if [ "$SYSTEM" = "windows" ] || [ "$SYSTEM" = "wsl" ]; then
    [ -f "$ORDNER/node/node.exe" ] && NODE="$ORDNER/node/node.exe"
fi
[ -z "$NODE" ] && [ -x "$ORDNER/node/bin/node" ] && NODE="$ORDNER/node/bin/node"
if [ -z "$NODE" ] && command -v node >/dev/null 2>&1; then
    NODE="node"
fi

if [ -z "$NODE" ]; then
    echo ""
    echo "  node wurde nicht gefunden."
    echo ""
    if [ "$SYSTEM" = "windows" ] || [ "$SYSTEM" = "wsl" ]; then
        echo "  Unter Windows gehoert node in den Trainer-Ordner:"
        echo "     $ORDNER/node/node.exe"
        echo ""
        echo "  Es fehlt noch. Am einfachsten einmal START.vbs starten -"
        echo "  die holt es nach: rund 30 MB von nodejs.org, entpackt in"
        echo "  den Ordner node\\ hier im Trainer. In Windows wird dabei"
        echo "  nichts installiert und es braucht keine Administratorrechte."
        echo ""
        echo "  Von Hand geht es so:"
        echo "     powershell -ExecutionPolicy Bypass -File node_holen.ps1"
    else
        echo "  Der Trainer braucht Node.js. Je nach System:"
        echo "     Debian/Ubuntu : sudo apt install nodejs"
        echo "     Fedora        : sudo dnf install nodejs"
        echo "     Arch          : sudo pacman -S nodejs"
        echo "     openSUSE      : sudo zypper install nodejs"
        echo ""
        echo "  Danach diese Datei noch einmal starten."
    fi
    schluss 1
fi

# ----------------------------------------------------------------
#  2. Laeuft auf dem Port schon etwas?
#     Gefragt wird mit curl, sonst mit wget, sonst mit node selbst.
#     Git Bash bringt curl mit, eine schmale Linux-Installation
#     gelegentlich nicht - und ohne Pruefung soll es nicht bleiben:
#     Ohne sie beendet sich der neue Server sofort wieder mit
#     "Port belegt", und es sieht aus, als passiere nichts.
# ----------------------------------------------------------------
port_belegt() {
    if command -v curl >/dev/null 2>&1; then
        curl -s -o /dev/null --max-time 2 "http://127.0.0.1:$PORT/" && return 0
        return 1
    fi
    if command -v wget >/dev/null 2>&1; then
        wget -q -O /dev/null -T 2 "http://127.0.0.1:$PORT/" && return 0
        return 1
    fi
    "$NODE" -e "const n=require('net'),s=n.connect($PORT,'127.0.0.1');s.setTimeout(2000);s.on('connect',()=>{s.destroy();process.exit(0)});s.on('error',()=>process.exit(1));s.on('timeout',()=>{s.destroy();process.exit(1)});" >/dev/null 2>&1
}

# ----------------------------------------------------------------
#  3. Einen haengenden Server beenden
#     Unter Windows wie STOP.bat: alle node.exe. Dort laeuft selten
#     noch etwas anderes mit node, und der haengende Server sitzt
#     meist in einem ganz anderen Ordner - ihn dort zu suchen waere
#     umstaendlich und unzuverlaessig.
#     Auf Linux und Mac NICHT: wer nebenher entwickelt, haette sonst
#     seine Arbeit mit abgeschossen. Dort uebernimmt STOP.sh, das
#     nur trifft, was aus diesem Ordner laeuft.
#
#     Die doppelten Schraegstriche bei taskkill sind kein Tippfehler:
#     Git Bash haelt ein einzelnes /f fuer einen Pfad und baut es um.
# ----------------------------------------------------------------
alten_beenden() {
    case "$SYSTEM" in
        windows)
            taskkill //f //im node.exe >/dev/null 2>&1
            taskkill //f //im cloudflared.exe >/dev/null 2>&1
            ;;
        wsl)
            taskkill.exe /f /im node.exe >/dev/null 2>&1
            taskkill.exe /f /im cloudflared.exe >/dev/null 2>&1
            ;;
        *)
            if [ -f "$ORDNER/STOP.sh" ]; then
                sh "$ORDNER/STOP.sh" >/dev/null 2>&1
            fi
            ;;
    esac
    # Zwischen "Prozess beendet" und "Port wieder frei" vergehen ein
    # paar Sekunden. Zehn Sekunden Geduld, dann Bescheid sagen.
    I=0
    while [ "$I" -lt 10 ]; do
        sleep 1
        port_belegt || return 0
        I=$((I + 1))
    done
    return 1
}

# ----------------------------------------------------------------
#  4. Den Browser aufmachen
#     Unter Windows und in der WSL nicht mit xdg-open, sondern auf
#     dem Windows-Weg. In der WSL ist das wichtig: dort laeuft oft
#     ein Linux-node, der Browser sitzt aber in Windows.
# ----------------------------------------------------------------
browser_auf() {
    ADRESSE="http://localhost:$PORT/"
    case "$SYSTEM" in
        windows|wsl)
            if command -v powershell.exe >/dev/null 2>&1; then
                powershell.exe -NoProfile -Command "Start-Process '$ADRESSE'" >/dev/null 2>&1 && return 0
            fi
            command -v wslview >/dev/null 2>&1 && wslview "$ADRESSE" >/dev/null 2>&1 && return 0
            ;;
        mac)
            command -v open >/dev/null 2>&1 && open "$ADRESSE" >/dev/null 2>&1 && return 0
            ;;
    esac
    for OEFFNE in xdg-open gio open; do
        if command -v "$OEFFNE" >/dev/null 2>&1; then
            if [ "$OEFFNE" = "gio" ]; then
                gio open "$ADRESSE" >/dev/null 2>&1 && return 0
            else
                "$OEFFNE" "$ADRESSE" >/dev/null 2>&1 && return 0
            fi
        fi
    done
    echo "  Bitte im Browser oeffnen: $ADRESSE"
}

# ----------------------------------------------------------------
#  Ist der laufende Trainer DIESER hier?
#  Dietmar am 15.09.2026, mit zwei Bildschirmfotos: "Es gibt einen
#  gewaltigen Unterschied zwischen start.sh und start.bat." Ueber
#  START.vbs kam der neue Stand, ueber START.sh der alte - obwohl
#  beide denselben Ordner starten. Der Unterschied war der alte
#  Server, der noch aus einem anderen Ordner auf Port 3000 hing:
#  START.vbs fragt "Beenden und neu starten?" mit Ja als Vorgabe,
#  diese Datei fragte mit Nein als Vorgabe. Eingabetaste - und der
#  alte lief weiter, der Browser zeigte den alten Stand.
#
#  Deshalb wird jetzt nicht geraten, sondern nachgesehen: Der Server
#  meldet unter /api/abgleich/stand die Groesse seiner Index.html.
#  Ist sie dieselbe wie die der Datei hier im Ordner, ist es dieser
#  Trainer - dann reicht der Browser. Weicht sie ab, laeuft ein
#  anderer, und die Vorgabe ist jetzt wie bei START.vbs: beenden.
# ----------------------------------------------------------------
#  SEIT DEM 17.09.2026 NICHT MEHR NACH DER GROESSE, SONDERN NACH DEM
#  FINGERABDRUCK - UND MIT DEM ORDNER.
#  Dietmar: "Ueber START.sh, wenn ich den Trainer im Arbeitsordner
#  starte, ist das Update, was in dem Arbeitsordner drin ist, nicht
#  verwendet. Bei START.bat ist es vorhanden. Beide zeigen die gleiche
#  Version." Zwei Trainer, dieselbe Nummer, verschiedene Fingerabdruecke.
#  Die Groesse zweier Index.html kann gleich sein, obwohl der Inhalt es
#  nicht ist - der Fingerabdruck (SHA-256, die ersten 16 Zeichen, so wie
#  ihn der Server unter /api/abgleich/stand meldet) kann das nicht.
#  Und der laufende Server nennt dem eigenen Rechner unter /api/version
#  seinen Ordner: Dann steht hier, WO der andere laeuft, statt nur, dass
#  er es tut.
holen() {
    if command -v curl >/dev/null 2>&1; then
        curl -s --max-time 3 "$1" 2>/dev/null
    elif command -v wget >/dev/null 2>&1; then
        wget -q -O - -T 3 "$1" 2>/dev/null
    fi
}
laufende_groesse() {
    holen "http://127.0.0.1:$PORT/api/abgleich/stand" \
        | sed -n 's/.*"Index\.html":{"groesse":\([0-9]*\).*/\1/p' | head -n 1
}
laufender_hash() {
    holen "http://127.0.0.1:$PORT/api/abgleich/stand" \
        | sed -n 's/.*"Index\.html":{"groesse":[0-9]*,"hash":"\([0-9a-f]*\)".*/\1/p' | head -n 1
}
laufender_ordner() {
    holen "http://127.0.0.1:$PORT/api/version" \
        | sed -n 's/.*"ordner":"\([^"]*\)".*/\1/p' | head -n 1 | sed 's/\\\\/\\/g'
}
hier_hash() {
    if command -v sha256sum >/dev/null 2>&1; then
        sha256sum "$ORDNER/Index.html" 2>/dev/null | cut -c1-16
    elif command -v shasum >/dev/null 2>&1; then
        shasum -a 256 "$ORDNER/Index.html" 2>/dev/null | cut -c1-16
    fi
}

HIER_GROESSE=$(wc -c < "$ORDNER/Index.html" 2>/dev/null | tr -d ' ')
HIER_HASH=$(hier_hash)

if port_belegt; then
    DORT_GROESSE=$(laufende_groesse)
    DORT_HASH=$(laufender_hash)
    DORT_ORDNER=$(laufender_ordner)
    echo ""
    echo "  Auf Port $PORT laeuft bereits ein Trainer."
    [ -n "$DORT_ORDNER" ] && echo "  Sein Ordner: $DORT_ORDNER"
    GLEICH=""
    if [ -n "$DORT_HASH" ] && [ -n "$HIER_HASH" ]; then
        [ "$DORT_HASH" = "$HIER_HASH" ] && GLEICH="ja"
    elif [ -n "$DORT_GROESSE" ] && [ "$DORT_GROESSE" = "$HIER_GROESSE" ]; then
        GLEICH="ja"
    fi
    if [ -n "$GLEICH" ]; then
        echo "  Es ist derselbe Stand wie hier (Index.html: Fingerabdruck ${HIER_HASH:-$HIER_GROESSE Bytes})."
        echo "  Es wird nur der Browser geoeffnet."
        echo ""
        browser_auf
        exit 0
    fi
    echo ""
    if [ -n "$DORT_HASH" ] && [ -n "$HIER_HASH" ]; then
        echo "  Aber NICHT dieser Stand: Der laufende hat eine Index.html mit dem"
        echo "  Fingerabdruck $DORT_HASH, in diesem Ordner liegt eine mit $HIER_HASH."
    elif [ -n "$DORT_GROESSE" ]; then
        echo "  Aber NICHT dieser hier: Der laufende hat eine Index.html mit"
        echo "  $DORT_GROESSE Bytes, in diesem Ordner liegt eine mit $HIER_GROESSE Bytes."
    else
        echo "  Ob es dieser hier ist, liess sich nicht feststellen."
    fi
    echo "  Meist ist das ein Server, der noch aus einem frueheren Ordner"
    echo "  im Hintergrund haengt. Solange er den Port haelt, kann der"
    echo "  Trainer aus DIESEM Ordner nicht starten:"
    echo "     $ORDNER"
    echo "  Und dann sieht man weiter den alten Stand, obwohl die neuen"
    echo "  Dateien laengst hier liegen."
    echo ""
    printf "  Den alten beenden und hier neu starten? [J/n] "
    read ANTWORT 2>/dev/null || ANTWORT=""
    case "$ANTWORT" in
        n|N|nein|Nein|NEIN)
            echo "  Gut - es wird nur der Browser geoeffnet."
            browser_auf
            exit 0
            ;;
        *)
            echo "  Beende den alten Trainer ..."
            if ! alten_beenden; then
                echo ""
                echo "  Port $PORT ist auch nach zehn Sekunden noch belegt."
                echo "  Dort haengt etwas, das sich nicht beenden liess."
                if [ "$SYSTEM" = "windows" ] || [ "$SYSTEM" = "wsl" ]; then
                    echo "  Haeufigster Grund: der alte Server laeuft mit hoeheren"
                    echo "  Rechten, etwa weil er aus C:\\Program Files gestartet"
                    echo "  wurde. Dann STOP.bat mit Rechtsklick als Administrator."
                fi
                schluss 1
            fi
            echo "  Erledigt."
            ;;
    esac
fi

# ----------------------------------------------------------------
#  5. Starten
#     AFU_BROWSER=1 heisst: der Server macht den Browser selbst auf,
#     und zwar genau dann, wenn er bereit ist. Das kann er aber nur
#     fuer das System, auf dem er selbst laeuft - in der WSL waere
#     das Linux, der Browser sitzt jedoch in Windows. Dort macht ihn
#     deshalb diese Datei auf, kurz nachdem der Server steht.
#
#     AFU_TUNNEL=1 waere der Gruppenraum nach aussen - hier bewusst
#     NICHT gesetzt, genau wie bei START.vbs. Wer den Tunnel will,
#     klickt ihn im Trainer an.
# ----------------------------------------------------------------
echo ""
echo "  Amateurfunk-Trainer startet ..."
echo "  System : $SYSTEM"
echo "  node   : $NODE"
echo "  Ordner : $ORDNER"
echo "  Stand  : Index.html $HIER_GROESSE Bytes${HIER_HASH:+, Fingerabdruck $HIER_HASH}"
echo "  Adresse: http://localhost:$PORT"
echo ""
echo "  Dieses Fenster offen lassen. Beenden mit Strg+C oder ./STOP.sh"
echo ""

if [ "$SYSTEM" = "wsl" ]; then
    ( sleep 4; browser_auf ) &
    exec "$NODE" Server.js
fi

AFU_BROWSER=1 exec "$NODE" Server.js
