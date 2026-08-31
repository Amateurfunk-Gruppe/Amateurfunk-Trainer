import json, pathlib
fehler=0
# Nur data und Root-JSONs pruefen, node_modules immer ignorieren
pfade = list(pathlib.Path("data").rglob("*.json")) + list(pathlib.Path(".").glob("*.json"))
for p in pfade:
    if "node_modules" in str(p) or "backup" in str(p):
        continue
    try:
        json.loads(p.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"FEHLER in: {p} -> {e}")
        fehler=1
if fehler==0:
    print("Alles sauber in data/ und Root - 0 Fehler!")