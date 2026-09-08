#!/bin/sh
# ================================================================
#  START.sh - der Trainer auf Linux und am Mac
# ----------------------------------------------------------------
#  START.bat und START.vbs sind Windows. Auf Linux passiert beim
#  Doppelklick darauf nichts - Dietmar am 07.09.2026: "start.bat wird
#  vermutlich auf Linux nicht funktionieren?" Richtig, und deshalb
#  gibt es diese Datei.
#
#  Sie tut genau das, was START.vbs unter Windows tut:
#    - nachsehen, ob node da ist,
#    - nachsehen, ob auf Port 3000 schon etwas laeuft,
#    - den Server starten und den Browser aufmachen.
#
#  Aufgerufen wird sie im Terminal aus dem Trainer-Ordner heraus:
#      chmod +x START.sh      (einmalig)
#      ./START.sh
#
#  Zum Beenden: STOP.sh - oder in diesem Fenster Strg+C.
# ================================================================
set -u

cd "$(dirname "$0")" || exit 1
ORDNER="$(pwd)"
PORT="${PORT:-3000}"

# ----------------------------------------------------------------
#  1. Gibt es node?
#     Anders als unter Windows liegt hier KEIN node im Ordner - das
#     mitgelieferte node\node.exe ist eine Windows-Datei. Auf Linux
#     kommt node aus der Paketverwaltung.
# ----------------------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
    echo ""
    echo "  node wurde nicht gefunden."
    echo ""
    echo "  Der Trainer braucht Node.js. Je nach System:"
    echo "     Debian/Ubuntu : sudo apt install nodejs"
    echo "     Fedora        : sudo dnf install nodejs"
    echo "     Arch          : sudo pacman -S nodejs"
    echo "     openSUSE      : sudo zypper install nodejs"
    echo ""
    echo "  Danach diese Datei noch einmal starten."
    echo ""
    exit 1
fi

# ----------------------------------------------------------------
#  2. Laeuft auf dem Port schon etwas?
#     Ohne diese Pruefung beendet sich der neue Server sofort wieder
#     mit "Port belegt" - und weil das Fenster im Zweifel gar nicht
#     zu sehen ist, sieht es so aus, als passiere nichts.
# ----------------------------------------------------------------
if command -v curl >/dev/null 2>&1 && curl -s -o /dev/null --max-time 2 "http://127.0.0.1:$PORT/"; then
    echo ""
    echo "  Auf Port $PORT laeuft bereits ein Trainer."
    echo "  Es wird nur der Browser geoeffnet. Zum Neustarten vorher ./STOP.sh"
    echo ""
    BROWSER_NUR=1
else
    BROWSER_NUR=0
fi

# ----------------------------------------------------------------
#  3. Starten
#     AFU_BROWSER=1 heisst: der Server macht den Browser selbst auf.
#     AFU_TUNNEL=1 waere der Gruppenraum nach aussen - hier bewusst
#     NICHT gesetzt, genau wie bei START.vbs. Wer den Tunnel will,
#     klickt ihn im Trainer an.
# ----------------------------------------------------------------
if [ "$BROWSER_NUR" = "0" ]; then
    echo ""
    echo "  Amateurfunk-Trainer startet ..."
    echo "  Ordner : $ORDNER"
    echo "  Adresse: http://localhost:$PORT"
    echo ""
    echo "  Dieses Fenster offen lassen. Beenden mit Strg+C oder ./STOP.sh"
    echo ""
    AFU_BROWSER=1 exec node Server.js
fi

# Server lief schon: nur noch den Browser aufmachen.
for OEFFNE in xdg-open open gio; do
    if command -v "$OEFFNE" >/dev/null 2>&1; then
        [ "$OEFFNE" = "gio" ] && gio open "http://localhost:$PORT/" >/dev/null 2>&1 \
                              || "$OEFFNE" "http://localhost:$PORT/" >/dev/null 2>&1
        exit 0
    fi
done
echo "  Bitte im Browser oeffnen: http://localhost:$PORT/"
