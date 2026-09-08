#!/bin/sh
# ================================================================
#  STOP.sh - den Trainer auf Linux und am Mac beenden
# ----------------------------------------------------------------
#  Das Gegenstueck zu STOP.bat. Beendet wird ABSICHTLICH NICHT jedes
#  node auf dem Rechner - das tut die Windows-Fassung mit
#  "taskkill /f /im node.exe", und dort ist es vertretbar, weil auf
#  einem Windows-Rechner selten noch etwas anderes mit node laeuft.
#  Auf Linux ist das anders: Wer nebenher entwickelt, haette sonst
#  seine Arbeit mit abgeschossen.
#
#  Getroffen wird deshalb nur, was aus DIESEM Ordner heraus laeuft.
# ================================================================
set -u

cd "$(dirname "$0")" || exit 1
ORDNER="$(pwd)"
ETWAS=0

beenden() {
    NAME="$1"
    MUSTER="$2"
    PIDS=$(pgrep -f "$MUSTER" 2>/dev/null)
    [ -z "$PIDS" ] && return
    for PID in $PIDS; do
        # Nur, wenn der Prozess wirklich in diesem Ordner arbeitet.
        ZIEL=$(readlink -f "/proc/$PID/cwd" 2>/dev/null)
        if [ -z "$ZIEL" ] || [ "$ZIEL" = "$ORDNER" ]; then
            kill "$PID" 2>/dev/null && { echo "  $NAME beendet (PID $PID)"; ETWAS=1; }
        fi
    done
}

echo ""
echo "  Beende Trainer in: $ORDNER"
beenden "Server"      "node .*Server\.js"
beenden "Tunnel"      "cloudflared .*tunnel"

sleep 1
[ "$ETWAS" = "0" ] && echo "  Es lief nichts."
echo "  Fertig."
echo ""
