STIMMEN NACHRUESTEN (Piper)
===========================

Der Trainer liest Fragen und Antworten vor. Dafuer braucht er Piper -
ein Sprachprogramm, das offline auf deinem Rechner arbeitet. Nichts
davon geht ins Netz.

Piper und die Stimmen liegen NICHT in diesem Repository. Sie sind rund
470 MB gross, und GitHub nimmt keine Datei ueber 100 MiB an - allein
"de_DE-thorsten-high.onnx" misst 108,6 MiB. Sie liegen stattdessen als
Anhang an der Veroeffentlichung:

   https://github.com/Amateurfunk-Gruppe/Amateurfunk-Trainer/releases/latest

   -> "Piper-Stimmen.zip" herunterladen
   -> entpacken
   -> den entpackten Ordner "piper" neben START.bat legen

Danach den Server neu starten (START.bat). Fertig.


WELCHE STIMME SPRICHT?
----------------------
Nicht mehr in Server.js einstellen - das war frueher so. Heute steht die
Auswahl im Trainer selbst: das Zahnrad neben "Vorlesen". Dort stehen alle
Stimmen, die im Ordner piper/ liegen, samt Abtastrate. Nach dem ersten
Vorlesen zeigt der Trainer unter der Auswahl an, welche Stimme
tatsaechlich gesprochen hat.

Empfehlung: "de_DE-thorsten-high" (22 kHz). Die Stimmen mit "low" im
Namen arbeiten mit 16 kHz, dort fehlen dem S die Hoehen.


WIEDERHOLTES VORLESEN
---------------------
Die erste Ausgabe einer Frage dauert ein bis zwei Sekunden - sie wird in
dem Moment erzeugt. Danach liegt sie im Ordner tts_cache/ und kommt
sofort. Der Ordner darf jederzeit geleert werden; er fuellt sich von
selbst wieder.


OHNE PIPER
----------
Der Trainer laeuft auch ohne. Dann uebernimmt die Stimme des Browsers -
sie ist schneller da, spricht aber Abkuerzungen wie "MHz" oder "dB"
nicht sauber aus. Genau dafuer ist Piper da.


HERKUNFT UND LIZENZ
-------------------
Piper und die Stimmen stammen aus dem Projekt rhasspy/piper-voices (MIT).
Der deutsche Datensatz "Thorsten" steht unter CC0. Die Weitergabe im
Anhang dieser Veroeffentlichung ist damit erlaubt.
