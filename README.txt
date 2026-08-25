PIPER TTS - INSTALLATION (einmalig)
=====================================

1) Piper fuer Windows herunterladen:
   https://github.com/rhasspy/piper/releases
   -> Datei "piper_windows_amd64.zip" laden
   -> Entpacken, "piper.exe" (und die mitgelieferten DLLs) in DIESEN
      Ordner (piper/) kopieren.

2) Deutsches Sprachmodell "Thorsten" (medium, gute Qualitaet) laden:
   https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE/thorsten/medium
   -> "de_DE-thorsten-medium.onnx" UND "de_DE-thorsten-medium.onnx.json"
      herunterladen, beide in DIESEN Ordner (piper/) legen.

Ordnerstruktur danach:
   piper/
     piper.exe
     (weitere .dll Dateien von Piper)
     de_DE-thorsten-medium.onnx
     de_DE-thorsten-medium.onnx.json

3) Fertig. Server neu starten - der "Vorlesen"-Button in der App nutzt
   Piper automatisch. Beim ersten Vorlesen einer Frage dauert es ein bis
   zwei Sekunden (wird erzeugt), danach ist die Antwort/Frage im Cache
   und wird sofort abgespielt (Ordner tts_cache/).

Andere Stimme gewuenscht? Es gibt weitere deutsche Stimmen bei
https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE
(z.B. "kerstin", "eva_k", "karlsson") - einfach die andere .onnx +
.onnx.json Datei stattdessen in piper/ legen und in server.js den
Dateinamen bei PIPER_MODEL anpassen.
