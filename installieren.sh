#!/usr/bin/env bash
# ============================================================
#  Amateurfunk-Trainer - Einrichten unter Linux und macOS
#
#  Holt den Trainer von GitHub, richtet die Abhaengigkeiten ein
#  und legt eine Verknuepfung auf dem Schreibtisch an.
#
#  Aufruf:
#      bash installieren.sh
#
#  Ein zweiter Aufruf im selben Ordner aktualisiert nur -
#  der Lernstand in data/ wird dabei nicht angefasst.
# ============================================================
set -u

REPO="${AFU_REPO:-https://github.com/Amateurfunk-Gruppe/Amateurfunk-Trainer.git}"
NAME="Amateurfunk-Trainer"
ZIEL="${AFU_ZIEL:-$HOME/$NAME}"
OHNE_HILFSPROGRAMME="${AFU_OHNE_HILFSPROGRAMME:-0}"

# --- Farben nur, wenn wirklich ein Terminal dranhaengt ---------
if [ -t 1 ]; then
  F_GRUEN=$'\033[1;32m'; F_GELB=$'\033[1;33m'; F_ROT=$'\033[1;31m'
  F_FETT=$'\033[1m';     F_AUS=$'\033[0m'
else
  F_GRUEN=''; F_GELB=''; F_ROT=''; F_FETT=''; F_AUS=''
fi

schritt(){ printf '\n%s==>%s %s%s%s\n' "$F_GRUEN" "$F_AUS" "$F_FETT" "$1" "$F_AUS"; }
hinweis(){ printf '    %s\n' "$1"; }
warnung(){ printf '%s !! %s%s\n' "$F_GELB" "$1" "$F_AUS"; }
abbruch(){ printf '\n%s !! %s%s\n\n' "$F_ROT" "$1" "$F_AUS"; exit 1; }

printf '\n%s================================================%s\n' "$F_FETT" "$F_AUS"
printf '%s  Amateurfunk-Trainer - Einrichten%s\n' "$F_FETT" "$F_AUS"
printf '%s================================================%s\n' "$F_FETT" "$F_AUS"

# ============================================================
#  1. System erkennen
# ============================================================
SYS="$(uname -s)"
case "$SYS" in
  Linux)  SYSTEM=linux ;;
  Darwin) SYSTEM=mac ;;
  *) abbruch "Dieses Skript ist fuer Linux und macOS. Unter Windows nimmt man das Setup unter Releases." ;;
esac
hinweis "System: $SYSTEM"

# ============================================================
#  2. Node.js und git
# ============================================================
paketbefehl(){
  if   command -v apt-get >/dev/null 2>&1; then echo "sudo apt-get install -y"
  elif command -v dnf     >/dev/null 2>&1; then echo "sudo dnf install -y"
  elif command -v pacman  >/dev/null 2>&1; then echo "sudo pacman -S --needed --noconfirm"
  elif command -v zypper  >/dev/null 2>&1; then echo "sudo zypper install -y"
  elif command -v apk     >/dev/null 2>&1; then echo "sudo apk add"
  elif command -v brew    >/dev/null 2>&1; then echo "brew install"
  else echo ""; fi
}

node_version_ok(){
  command -v node >/dev/null 2>&1 || return 1
  local v; v="$(node -v 2>/dev/null | sed 's/^v//; s/\..*//')"
  [ -n "$v" ] && [ "$v" -ge 18 ] 2>/dev/null
}

installiere(){   # installiere <paketname...>
  local bef; bef="$(paketbefehl)"
  [ -z "$bef" ] && return 1
  hinweis "Es wird ausgefuehrt: $bef $*"
  # shellcheck disable=SC2086
  $bef "$@" >/dev/null 2>&1
}

schritt "Node.js pruefen"
if node_version_ok; then
  hinweis "gefunden: $(node -v)"
else
  if command -v node >/dev/null 2>&1; then
    warnung "Node $(node -v) ist zu alt - gebraucht wird 18 oder hoeher."
  else
    hinweis "Node.js fehlt - wird installiert."
  fi
  if [ "$SYSTEM" = mac ]; then
    installiere node || true
  else
    installiere nodejs npm || true
  fi
  if ! node_version_ok; then
    printf '\n'
    warnung "Node.js konnte nicht selbst eingerichtet werden."
    if [ "$SYSTEM" = mac ]; then
      hinweis "Bitte einmal von Hand - entweder"
      hinweis "    brew install node"
      hinweis "oder das Installationspaket von https://nodejs.org"
    else
      hinweis "Bitte einmal von Hand, zum Beispiel"
      hinweis "    sudo apt install nodejs npm"
      hinweis "Ist die Fassung der Distribution aelter als 18:"
      hinweis "    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -"
      hinweis "    sudo apt install -y nodejs"
    fi
    abbruch "Danach dieses Skript noch einmal aufrufen."
  fi
  hinweis "eingerichtet: $(node -v)"
fi

schritt "git pruefen"
if command -v git >/dev/null 2>&1; then
  hinweis "gefunden: $(git --version | head -1)"
else
  hinweis "git fehlt - wird installiert."
  installiere git || true
  command -v git >/dev/null 2>&1 || abbruch "git konnte nicht eingerichtet werden. Bitte von Hand installieren und noch einmal aufrufen."
fi

# ============================================================
#  3. Trainer holen oder auffrischen
# ============================================================
if [ -d "$ZIEL/.git" ]; then
  schritt "Trainer auffrischen"
  hinweis "vorhanden in: $ZIEL"
  # Der Lernstand liegt in data/ und wird von git nicht angefasst.
  ( cd "$ZIEL" && git pull --ff-only ) || warnung "Auffrischen ging nicht - es wird mit dem vorhandenen Stand weitergemacht."
elif [ -e "$ZIEL" ]; then
  abbruch "In $ZIEL liegt schon etwas, das kein Trainer aus git ist. Bitte umbenennen oder mit AFU_ZIEL=<Pfad> einen anderen Ort waehlen."
else
  schritt "Trainer von GitHub holen"
  hinweis "Ziel: $ZIEL"
  git clone --depth 1 "$REPO" "$ZIEL" || abbruch "Herunterladen fehlgeschlagen. Netz pruefen und noch einmal aufrufen."
fi

cd "$ZIEL" || abbruch "Ordner $ZIEL nicht erreichbar."

# ============================================================
#  4. Abhaengigkeiten
# ============================================================
schritt "Abhaengigkeiten einrichten"
hinweis "npm install - das dauert einen Augenblick."
npm install --omit=dev --no-audit --no-fund >/dev/null 2>&1 \
  || npm install --no-audit --no-fund >/dev/null 2>&1 \
  || abbruch "npm install ist fehlgeschlagen. Meist fehlt das Netz oder ein Proxy ist dazwischen."
hinweis "erledigt."

chmod +x START.sh STOP.sh installieren.sh 2>/dev/null || true

# ============================================================
#  5. Die beiden Hilfsprogramme
# ============================================================
if [ "$OHNE_HILFSPROGRAMME" = "1" ]; then
  schritt "Hilfsprogramme uebersprungen"
  hinweis "Spaeter im Trainer: Einstellungen -> Wartung -> Hilfsprogramme."
else
  schritt "Hilfsprogramme holen"
  hinweis "Piper fuer die Sprachausgabe, cloudflared fuer den Gruppenraum."
  hinweis "Beide sind freiwillig - ohne sie faellt jeweils nur diese eine Funktion weg."
  node programme_holen.js alles || warnung "Nicht alles geholt - im Trainer nachholbar unter Einstellungen -> Wartung."
fi

# ============================================================
#  6. Verknuepfung auf dem Schreibtisch
# ============================================================
schritt "Verknuepfung anlegen"

# Wo liegt der Schreibtisch? Unter Linux kann er anders heissen.
SCHREIBTISCH="$HOME/Desktop"
if command -v xdg-user-dir >/dev/null 2>&1; then
  d="$(xdg-user-dir DESKTOP 2>/dev/null || true)"
  [ -n "$d" ] && [ -d "$d" ] && SCHREIBTISCH="$d"
fi

if [ ! -d "$SCHREIBTISCH" ]; then
  warnung "Kein Schreibtisch-Ordner gefunden - Verknuepfung ausgelassen."
  hinweis "Starten geht immer mit:  cd \"$ZIEL\" && ./START.sh"

elif [ "$SYSTEM" = linux ]; then
  ICON="$ZIEL/icon-512.png"
  [ -f "$ICON" ] || ICON="$ZIEL/icon.png"
  DATEI="$SCHREIBTISCH/amateurfunk-trainer.desktop"
  cat > "$DATEI" <<EOF
[Desktop Entry]
Type=Application
Version=1.0
Name=Amateurfunk-Trainer
Comment=Pruefungstrainer fuer die Klassen N, E und A
Exec=$ZIEL/START.sh
Path=$ZIEL
Icon=$ICON
Terminal=false
Categories=Education;
EOF
  chmod +x "$DATEI"
  # Neuere Schreibtische wollen die Datei ausdruecklich als vertrauenswuerdig markiert haben.
  gio set "$DATEI" metadata::trusted true >/dev/null 2>&1 || true
  # Und einmal ins Anwendungsmenue, damit er auch dort auftaucht.
  mkdir -p "$HOME/.local/share/applications"
  cp "$DATEI" "$HOME/.local/share/applications/amateurfunk-trainer.desktop" 2>/dev/null || true
  update-desktop-database "$HOME/.local/share/applications" >/dev/null 2>&1 || true
  hinweis "angelegt: $DATEI"
  hinweis "Fragt der Schreibtisch beim ersten Mal nach: 'Starten erlauben' waehlen."

else
  # macOS: eine kleine .app - das ist nur ein Ordner mit fester Struktur.
  APP="$SCHREIBTISCH/$NAME.app"
  rm -rf "$APP" 2>/dev/null || true
  mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
  cat > "$APP/Contents/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>CFBundleName</key><string>$NAME</string>
  <key>CFBundleDisplayName</key><string>Amateurfunk-Trainer</string>
  <key>CFBundleIdentifier</key><string>de.amateurfunk.trainer</string>
  <key>CFBundleVersion</key><string>1.0</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleExecutable</key><string>starten</string>
  <key>LSUIElement</key><true/>
</dict></plist>
EOF
  cat > "$APP/Contents/MacOS/starten" <<EOF
#!/bin/bash
cd "$ZIEL" || exit 1
exec ./START.sh
EOF
  chmod +x "$APP/Contents/MacOS/starten"
  hinweis "angelegt: $APP"
fi

# ============================================================
#  Fertig
# ============================================================
printf '\n%s================================================%s\n' "$F_GRUEN" "$F_AUS"
printf '%s  Fertig.%s\n' "$F_GRUEN$F_FETT" "$F_AUS"
printf '%s================================================%s\n\n' "$F_GRUEN" "$F_AUS"
hinweis "Ordner:   $ZIEL"
hinweis "Starten:  Doppelklick auf die Verknuepfung"
hinweis "          oder   cd \"$ZIEL\" && ./START.sh"
hinweis "Beenden:  ./STOP.sh   oder Strg + C im selben Fenster"
hinweis "Adresse:  http://localhost:3000"
printf '\n'
hinweis "Der Lernstand liegt in $ZIEL/data und bleibt bei jedem Auffrischen erhalten."
printf '\n'
