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
'  Zum Beenden: STOP.bat
' ================================================================
Option Explicit
Dim WshShell, fso, ordner, node, antwort, code, i

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
ordner = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = ordner

node = ordner & "\node\node.exe"
If Not fso.FileExists(node) Then
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
