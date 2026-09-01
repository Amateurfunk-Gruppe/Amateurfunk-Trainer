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
Dim WshShell, fso, ordner, node, antwort

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
ordner = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = ordner

node = ordner & "\node\node.exe"
If Not fso.FileExists(node) Then
  ' Ohne Node laeuft nichts. Lieber eine klare Meldung als ein
  ' Programm, das sich wortlos nicht meldet.
  MsgBox "node\node.exe fehlt im Trainer-Ordner:" & vbCrLf & ordner & vbCrLf & vbCrLf & _
         "Bitte den Trainer neu installieren - das Setup bringt Node mit.", 16, "Amateurfunk-Trainer"
  WScript.Quit 1
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
    WshShell.Run "taskkill /f /im node.exe", 0, True
    WScript.Sleep 2000
    If PortBelegt() Then
      MsgBox "Port 3000 ist immer noch belegt." & vbCrLf & vbCrLf & _
             "Bitte einmal STOP.bat ausfuehren, kurz warten und" & vbCrLf & _
             "es dann noch einmal versuchen.", 48, "Amateurfunk-Trainer"
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
