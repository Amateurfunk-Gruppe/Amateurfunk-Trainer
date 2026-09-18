' ================================================================
'  START.vbs - Trainer starten, ohne dass ein Fenster aufgeht
' ================================================================
'  wscript.exe fuehrt diese Datei aus. Der Server laeuft danach im
'  Hintergrund; sichtbar ist nur der Browser.
'
'  AFU_BROWSER=1 sagt dem Server, dass er den Browser selbst
'  aufmachen soll - und zwar genau dann, wenn er bereit ist.
'  Vorher stand hier ein starres WScript.Sleep 1500. Beim ersten
'  Start nach der Installation reicht das oft nicht: Der Browser
'  kam vor dem Server und zeigte eine Fehlerseite.
'
'  NEU AM 01.09.2026 - die Nachfrage wegen Port 3000:
'  Dietmar hatte den Trainer in einen neuen Ordner umgezogen,
'  waehrend der alte noch lief. Der alte hielt den Port weiter
'  besetzt, der neue beendete sich beim Start sofort wieder mit
'  "Port 3000 belegt" - in einem Fenster, das gar nicht zu sehen
'  ist. Von aussen sah es so aus, als passiere beim Doppelklick
'  ueberhaupt nichts. Deshalb wird jetzt VORHER nachgesehen und
'  im Klartext gefragt, statt wortlos aufzugeben.
'
'  NEU AM 18.09.2026 - zwei Pruefungen mehr, aus einer Rueckmeldung:
'  "Nach dem Start wurde ich aufgefordert node nachzuinstallieren.
'  Das ging nur manuell. [...] Wenn ich jetzt starte, passiert leider
'  nichts und ich erhalte auch keine Fehlermeldung."
'  Erstens wird VOR der Frage nach Node nachgesehen, ob das hier
'  ueberhaupt das fertige Programm ist und nicht der Quelltext
'  ("Source code (zip)" von der Release-Seite). Zweitens wird nach
'  dem Start bis zu 30 Sekunden zugesehen, ob der Server hochkommt -
'  stirbt er, sagt ein Fenster das und bietet den sichtbaren Start an.
'
'  Zum Beenden: STOP.bat
' ================================================================
Option Explicit
Dim WshShell, fso, ordner, node, antwort, code, i, uo

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
ordner = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = ordner

' ================================================================
'  IST DAS UEBERHAUPT DAS FERTIGE PROGRAMM?
' ----------------------------------------------------------------
'  Rueckmeldung vom 18.09.2026 (siehe oben). Beides - die Frage nach
'  Node und das stumme Nichts danach - hat dieselbe Ursache: Auf der
'  Release-Seite haengt GitHub an jedes Release "Source code (zip)"
'  und "Source code (tar.gz)" an, ungefragt; und auf der Projektseite
'  gibt es den gruenen Knopf "Code - Download ZIP". Beides ist der
'  Quelltext: ohne node\, ohne node_modules\, ohne piper\ - die
'  stehen mit gutem Grund in der .gitignore. Wer den auspackt,
'  bekommt beim Start erst die Frage nach Node.js. Und wenn Node dann
'  da ist, stirbt der Server nach einer Zehntelsekunde an
'  require('express') - in einem Fenster, das mit Absicht nicht zu
'  sehen ist. Von aussen: nichts.
'
'  Deshalb wird das ZUERST geprueft, noch vor Node. Die Frage nach
'  Node.js in einem Quelltext-Ordner waere eine Sackgasse mit
'  freundlichem Gesicht.
' ================================================================
If Not fso.FileExists(ordner & "\node_modules\express\package.json") _
   Or Not fso.FileExists(ordner & "\node_modules\socket.io\package.json") _
   Or Not fso.FileExists(ordner & "\node_modules\cors\package.json") Then
  antwort = MsgBox( _
    "In diesem Ordner fehlt ein Teil des Trainers:" & vbCrLf & _
    ordner & vbCrLf & vbCrLf & _
    "Der Ordner node_modules\ ist nicht da. So sieht der QUELLTEXT" & vbCrLf & _
    "aus - nicht das fertige Programm. Das passiert, wenn auf GitHub" & vbCrLf & _
    """Source code (zip)"" oder ""Code - Download ZIP"" geladen wurde." & vbCrLf & vbCrLf & _
    "Das fertige Programm heisst" & vbCrLf & _
    "    Amateurfunk-Trainer-<Version>-windows.zip" & vbCrLf & _
    "(rund 340 MB) und liegt auf der Release-Seite ganz oben. Darin" & vbCrLf & _
    "ist alles: Node, die Module, die Stimmen. Auspacken, START.bat." & vbCrLf & vbCrLf & _
    "(Wer den Quelltext absichtlich hat: im Ordner npm install ausfuehren.)" & vbCrLf & vbCrLf & _
    "Die Release-Seite jetzt im Browser oeffnen?", _
    vbYesNo + vbExclamation + vbDefaultButton1, "Amateurfunk-Trainer - das ist der Quelltext")
  If antwort = vbYes Then
    WshShell.Run "https://github.com/Amateurfunk-Gruppe/Amateurfunk-Trainer/releases/latest", 1, False
  End If
  WScript.Quit 1
End If

node = ordner & "\node\node.exe"
If Not fso.FileExists(node) Then
  ' ----------------------------------------------------------------
  '  Liegt node.exe eine Ebene zu tief? Das ist der haeufigste Fehler
  '  beim Nachholen von Hand: Das Archiv von nodejs.org enthaelt einen
  '  Ordner node-v22.x-win-x64\, und der landet als Ganzes in node\.
  '  Dann steht node\node-v22.x-win-x64\node.exe da - und die Frage
  '  nach Node kaeme ein zweites Mal, obwohl Node laengst da ist.
  '  Deshalb nachsehen und sagen, was genau wohin muss.
  ' ----------------------------------------------------------------
  If fso.FolderExists(ordner & "\node") Then
    For Each uo In fso.GetFolder(ordner & "\node").SubFolders
      If fso.FileExists(uo.Path & "\node.exe") Then
        MsgBox "Node.js liegt da - aber eine Ebene zu tief:" & vbCrLf & _
               uo.Path & "\node.exe" & vbCrLf & vbCrLf & _
               "Gebraucht wird:" & vbCrLf & node & vbCrLf & vbCrLf & _
               "Bitte den INHALT des Ordners" & vbCrLf & _
               "    " & uo.Name & vbCrLf & _
               "direkt nach node\ verschieben (node.exe, npm, node_modules und" & vbCrLf & _
               "die uebrigen Dateien), den leeren Ordner danach loeschen -" & vbCrLf & _
               "und START.bat noch einmal doppelklicken.", 48, "Amateurfunk-Trainer - Node.js liegt zu tief"
        WScript.Quit 1
      End If
    Next
  End If
  ' ================================================================
  '  BESTANDTEILE NACHHOLEN
  ' ----------------------------------------------------------------
  '  Dietmar am 15.09.2026: "beim Start soll ein Fenster kommen, das
  '  den Benutzer darueber informiert, das Bestandteile nachinstalliert
  '  werden."
  '
  '  Bis dahin stand hier nur "Bitte den Trainer neu installieren - das
  '  Setup bringt Node mit." Das war richtig, solange es nur den Weg
  '  ueber das Setup gab. Seit es den ZIP-Weg gibt - weil Smart App
  '  Control auf frischen Windows-11-Rechnern das Setup abweist, noch
  '  bevor es anfaengt -, ist es ein Sackgassen-Satz: Der Benutzer hat
  '  gerade absichtlich KEIN Setup benutzt.
  '
  '  Das Fenster sagt deshalb drei Dinge, und zwar vorher:
  '  was geholt wird, woher, und was dabei NICHT passiert.
  ' ================================================================
  If Not fso.FileExists(ordner & "\node_holen.ps1") Then
    MsgBox "node\node.exe fehlt im Trainer-Ordner:" & vbCrLf & ordner & vbCrLf & vbCrLf & _
           "Und node_holen.ps1 fehlt auch - damit kann ich es nicht nachholen." & vbCrLf & _
           "Bitte den Trainer noch einmal herunterladen.", 16, "Amateurfunk-Trainer"
    WScript.Quit 1
  End If

  antwort = MsgBox( _
    "Beim ersten Start fehlt noch ein Bestandteil." & vbCrLf & vbCrLf & _
    "Der Trainer braucht Node.js. In dieser Fassung ohne" & vbCrLf & _
    "Installationsprogramm ist es nicht dabei - es wird jetzt" & vbCrLf & _
    "nachgeholt. Das ist nur beim ersten Mal noetig." & vbCrLf & vbCrLf & _
    "Was geschieht:" & vbCrLf & _
    "  - rund 30 MB werden von nodejs.org geladen" & vbCrLf & _
    "  - die Pruefsumme wird verglichen" & vbCrLf & _
    "  - entpackt wird in den Ordner node\ hier im Trainer" & vbCrLf & vbCrLf & _
    "Was NICHT geschieht:" & vbCrLf & _
    "  - nichts wird in Windows installiert" & vbCrLf & _
    "  - es werden keine Administratorrechte gebraucht" & vbCrLf & _
    "  - beim Loeschen dieses Ordners ist auch Node wieder weg" & vbCrLf & vbCrLf & _
    "Dauert etwa eine Minute. Jetzt holen?", _
    vbYesNo + vbInformation + vbDefaultButton1, "Amateurfunk-Trainer - Bestandteile nachholen")

  If antwort <> vbYes Then
    MsgBox "Gut - dann ein andermal." & vbCrLf & vbCrLf & _
           "Ohne Node.js kann der Trainer nicht starten. Beim naechsten" & vbCrLf & _
           "Doppelklick auf START.bat wird wieder gefragt.", 64, "Amateurfunk-Trainer"
    WScript.Quit 0
  End If

  ' Sichtbar laufen lassen, nicht im Verborgenen: Ein Fenster, in dem
  ' ein Fortschritt zu sehen ist, ist einem stillen Warten von einer
  ' Minute vorzuziehen. True = warten, bis es durch ist.
  code = WshShell.Run("powershell -NoProfile -ExecutionPolicy Bypass -File """ & _
                      ordner & "\node_holen.ps1""", 1, True)

  If Not fso.FileExists(node) Then
    MsgBox "Node.js konnte nicht nachgeholt werden." & vbCrLf & vbCrLf & _
           "Im Fenster, das sich gerade geschlossen hat, stand der Grund -" & vbCrLf & _
           "und darunter, wie es von Hand geht." & vbCrLf & vbCrLf & _
           "Haeufigster Grund: keine Verbindung ins Internet.", 16, "Amateurfunk-Trainer"
    WScript.Quit 1
  End If
End If

If PortBelegt() Then
  If TrainerAntwortet() Then
    antwort = MsgBox("Auf Port 3000 laeuft bereits ein Trainer." & vbCrLf & vbCrLf & _
      "Meist ist das ein Server, der noch aus einem frueheren Ordner" & vbCrLf & _
      "im Hintergrund haengt. Solange er den Port haelt, kann der" & vbCrLf & _
      "Trainer aus DIESEM Ordner nicht starten:" & vbCrLf & _
      ordner & vbCrLf & vbCrLf & _
      "Den alten beenden und hier neu starten?" & vbCrLf & vbCrLf & _
      "Ja   = alle laufenden node.exe beenden, dann starten" & vbCrLf & _
      "         (dasselbe, was STOP.bat tut)" & vbCrLf & _
      "Nein = nichts anfassen, nur den Browser oeffnen", _
      vbYesNo + vbQuestion, "Amateurfunk-Trainer")
    If antwort = vbNo Then
      WshShell.Run "http://localhost:3000/", 1, False
      WScript.Quit 0
    End If
    ' taskkill meldet 0, wenn es etwas beendet hat, und 128, wenn gar
    ' nichts zu beenden war. Alles andere heisst: Windows hat sich
    ' geweigert - das kommt vor, wenn der alte Server mit hoeheren
    ' Rechten laeuft, etwa weil er aus C:\Program Files gestartet wurde.
    code = WshShell.Run("taskkill /f /im node.exe", 0, True)
    ' Und dann Geduld: Zwischen "Prozess beendet" und "Port wieder frei"
    ' vergehen unter Windows durchaus ein paar Sekunden. Vorher stand hier
    ' ein starres WScript.Sleep 2000 - zu kurz, und die Meldung "Port 3000
    ' ist immer noch belegt" kam, obwohl gleich darauf alles frei war.
    For i = 1 To 10
      WScript.Sleep 1000
      If Not PortBelegt() Then Exit For
    Next
    If PortBelegt() Then
      If code <> 0 And code <> 128 Then
        MsgBox "Der alte Trainer liess sich nicht beenden." & vbCrLf & vbCrLf & _
               "Windows hat das Beenden abgelehnt (Code " & code & "). Das" & vbCrLf & _
               "passiert, wenn er mit hoeheren Rechten laeuft - zum Beispiel," & vbCrLf & _
               "weil er aus C:\Program Files heraus gestartet wurde." & vbCrLf & vbCrLf & _
               "Bitte STOP.bat mit Rechtsklick als Administrator ausfuehren" & vbCrLf & _
               "und es dann noch einmal versuchen.", 48, "Amateurfunk-Trainer"
      Else
        MsgBox "Port 3000 ist auch nach zehn Sekunden noch belegt." & vbCrLf & vbCrLf & _
               "Dort haengt etwas, das sich nicht beenden liess." & vbCrLf & _
               "Ein Neustart von Windows raeumt das sicher auf.", 48, "Amateurfunk-Trainer"
      End If
      WScript.Quit 1
    End If
  Else
    ' Etwas anderes sitzt auf dem Port. node.exe zu beenden waere hier
    ' geraten - und traefe womoeglich ein fremdes Programm.
    MsgBox "Port 3000 ist belegt, aber nicht vom Trainer." & vbCrLf & vbCrLf & _
           "Dort antwortet ein anderes Programm. Der Trainer kann" & vbCrLf & _
           "deshalb nicht starten. Bitte das andere Programm beenden" & vbCrLf & _
           "und es dann noch einmal versuchen.", 48, "Amateurfunk-Trainer"
    WScript.Quit 1
  End If
End If

WshShell.Environment("PROCESS")("AFU_BROWSER") = "1"
WshShell.Run """" & node & """ Server.js", 0, False

' ================================================================
'  UND KOMMT ER AUCH HOCH?
' ----------------------------------------------------------------
'  Der Server laeuft mit Absicht in einem Fenster, das niemand sieht.
'  Der Preis dafuer: Stirbt er in der ersten Sekunde - fehlendes
'  Modul, kaputte Datei, was auch immer -, sieht man auch das nicht.
'  Genau das war die Rueckmeldung vom 18.09.2026: "passiert leider
'  nichts und ich erhalte auch keine Fehlermeldung".
'
'  Deshalb wird bis zu 30 Sekunden zugesehen. Antwortet Port 3000,
'  ist alles gut, und dieses Skript geht. Antwortet er nicht UND es
'  gibt keine node.exe mehr, die Server.js ausfuehrt, ist er
'  gestorben - dann sagt das ein Fenster und bietet an, ihn sichtbar
'  zu starten: Fehler-Zeigen.bat laesst das Fenster stehen, und die
'  Meldung steht drin. Laeuft er noch und braucht nur laenger
'  (langsame Platte, Virenscanner, grosser Katalog), passiert nichts -
'  der Browser kommt, sobald er bereit ist.
'
'  START.bat ruft dieses Skript mit "start" auf, damit sein schwarzes
'  Fenster nicht die ganze Wartezeit ueber stehen bleibt.
' ================================================================
For i = 1 To 30
  WScript.Sleep 1000
  If PortBelegt() Then Exit For
  If Not ServerLaeuft() Then
    antwort = MsgBox( _
      "Der Trainer ist gleich nach dem Start wieder ausgegangen." & vbCrLf & vbCrLf & _
      "Warum, stand in einem Fenster, das START.bat mit Absicht nicht" & vbCrLf & _
      "zeigt. Fehler-Zeigen.bat startet ihn noch einmal sichtbar und" & vbCrLf & _
      "laesst das Fenster stehen - dort steht dann der Grund." & vbCrLf & vbCrLf & _
      "Jetzt sichtbar starten?", _
      vbYesNo + vbExclamation + vbDefaultButton1, "Amateurfunk-Trainer - Start fehlgeschlagen")
    If antwort = vbYes Then
      If fso.FileExists(ordner & "\Fehler-Zeigen.bat") Then
        WshShell.Run "cmd /c """ & ordner & "\Fehler-Zeigen.bat""", 1, False
      Else
        ' Ohne Fehler-Zeigen.bat: der nackte Start in einem Fenster,
        ' das offen bleibt (/k).
        WshShell.Run "cmd /k """"" & node & """ Server.js""", 1, False
      End If
    End If
    WScript.Quit 1
  End If
Next

' ----------------------------------------------------------------
'  Laeuft noch eine node.exe, die Server.js ausfuehrt?
'  Im Zweifel (kein WMI, kein Zugriff) heisst die Antwort "ja" -
'  lieber schweigen als falschen Alarm schlagen.
' ----------------------------------------------------------------
Function ServerLaeuft()
  Dim wmi, liste, p
  ServerLaeuft = True
  On Error Resume Next
  Set wmi = GetObject("winmgmts:\\.\root\cimv2")
  If Err.Number <> 0 Then
    Err.Clear
    Exit Function
  End If
  Set liste = wmi.ExecQuery("SELECT CommandLine FROM Win32_Process WHERE Name = 'node.exe'")
  If Err.Number <> 0 Then
    Err.Clear
    Exit Function
  End If
  ServerLaeuft = False
  For Each p In liste
    If InStr(1, p.CommandLine & "", "Server.js", vbTextCompare) > 0 Then ServerLaeuft = True
  Next
  If Err.Number <> 0 Then
    Err.Clear
    ServerLaeuft = True
  End If
End Function

' ----------------------------------------------------------------
'  Antwortet ueberhaupt jemand auf Port 3000?
' ----------------------------------------------------------------
Function PortBelegt()
  Dim h
  PortBelegt = False
  On Error Resume Next
  Set h = CreateObject("MSXML2.ServerXMLHTTP.6.0")
  If Err.Number <> 0 Then
    ' Ohne die Komponente laesst sich nichts pruefen. Dann eben
    ' starten wie frueher - schlimmstenfalls wie bisher.
    Err.Clear
    Exit Function
  End If
  h.setTimeouts 1000, 1000, 1500, 1500
  h.Open "GET", "http://127.0.0.1:3000/", False
  h.send
  If Err.Number = 0 Then PortBelegt = True
  Err.Clear
End Function

' ----------------------------------------------------------------
'  Und ist es der Trainer? Seine Socket.IO-Anmeldung antwortet mit
'  einer Kennung ("sid"), die sonst niemand liefert.
' ----------------------------------------------------------------
Function TrainerAntwortet()
  Dim h
  TrainerAntwortet = False
  On Error Resume Next
  Set h = CreateObject("MSXML2.ServerXMLHTTP.6.0")
  If Err.Number <> 0 Then
    Err.Clear
    Exit Function
  End If
  h.setTimeouts 1000, 1000, 1500, 1500
  h.Open "GET", "http://127.0.0.1:3000/socket.io/?EIO=4&transport=polling", False
  h.send
  If Err.Number = 0 Then
    If h.Status = 200 And InStr(h.responseText, """sid""") > 0 Then TrainerAntwortet = True
  End If
  Err.Clear
End Function
