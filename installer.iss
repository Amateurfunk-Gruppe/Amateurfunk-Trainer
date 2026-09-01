; ================================================================
;  Amateurfunk-Trainer - Setup fuer Inno Setup 7
; ================================================================
;  Gebaut wird mit Build-DIREKT.bat DIREKT AUS DIESEM ORDNER.
;
;  ALLE Source-Angaben sind RELATIV. Das ist keine Schoenheitsfrage:
;  Vorher standen hier absolute Pfade nach C:\Temp\TrainerMSI\Source.
;  Dieser Ordner existiert nicht mehr - der Compiler nahm also
;  entweder gar keine oder uralte Dateien mit, und die fertige
;  Installation meldete "START.vbs wurde nicht gefunden".
;
;  Relativ heisst: bezogen auf den Ordner, in dem diese .iss liegt.
;  Damit ist ausgeschlossen, dass jemals wieder ein fremder Ordner
;  gebaut wird.
; ================================================================

; ================================================================
;  DIE VERSIONSNUMMER KOMMT AUS DEM CHANGELOG
; ================================================================
;  Dietmar am 01.09.2026: "Beim Erstellen einer exe sind wir derzeit
;  bei 1.0.1. Schau mal im CHANGELOG.md, das ist bei weitem weiter.
;  Ich moechte eine hoehere Zahl, an dem CHANGELOG.md angepasst, die
;  fortlaufend ist."
;
;  Die Regel:  1.<Anzahl der Eintraege im CHANGELOG>.0
;
;  Build-DIREKT.bat zaehlt die Ueberschriften im Aenderungsprotokoll
;  und reicht die Nummer hier herein (/DAppVer=...). Wer etwas
;  aendert, schreibt es ins Protokoll - und damit steigt die Nummer
;  von selbst. Sie kann nur wachsen, nie fallen, und sie ist an jeder
;  Stelle dieselbe: im Dateinamen, in den Dateieigenschaften, in
;  "Apps & Features" und in der package.json.
;
;  Eine von Hand gepflegte Nummer laeuft irgendwann aus dem Tritt:
;  Man baut, vergisst das Hochzaehlen, und zwei verschiedene
;  Programme heissen gleich. Genau das kann hier nicht passieren.
;
;  Der Wert unten greift nur, wenn jemand ISCC direkt aufruft, ohne
;  ueber Build-DIREKT.bat zu gehen.
#ifndef AppVer
  #define AppVer "1.96.0"
#endif

; ----------------------------------------------------------------
;  SCHLANKES PIPER  -  0 = aus (Voreinstellung), 1 = an
; ----------------------------------------------------------------
;  Der Ordner piper\ ist mit Abstand der zweitgroesste Brocken im
;  Setup. Darin steckt einiges, was ein deutschsprachiger Trainer
;  nie anfasst:
;
;    libtashkeel_model.ort            9,8 MB   Arabisch-Vokalisierung
;    espeak-ng-data\ru_dict           8,1 MB   Russisch
;    espeak-ng-data\*_dict          16,4 MB   111 weitere Sprachen
;
;  Zusammen 26 MB. espeak-ng laedt ein Sprachwoerterbuch erst dann,
;  wenn es in dieser Sprache sprechen soll - de_dict bleibt drin,
;  ebenso phondata, phontab, phonindex und die Sprachliste.
;
;  EINGESCHALTET AM 01.09.2026 auf Dietmars Ansage: "Vokalisierung
;  fuer Arabisch und 111 fremdsprachige Woerterbuecher bitte
;  entfernen."
;
;  NACH DEM BAU BITTE EINMAL PRUEFEN: installieren, eine Frage
;  aufrufen, "Vorlesen" druecken. Kommt die Stimme, ist alles gut.
;  Bleibt es still, hier wieder auf 0 setzen und neu bauen - dann war
;  eine der ausgeschlossenen Dateien doch noch noetig. Getestet werden
;  konnte das von meiner Seite aus nicht; es gibt hier keinen
;  Windows-Rechner.
;
;  en_dict bleibt bewusst drin (167 KB): espeak-ng greift bei
;  Fremdwoertern und Abkuerzungen gelegentlich auf Englisch zurueck.
;  Das ist billige Versicherung gegen genau den Fall, den ich nicht
;  ausprobieren kann.
#define SchlankesPiper 1

[Setup]
AppName=Amateurfunk-Trainer
AppVersion={#AppVer}
AppPublisher=Dietmar Reh
AppCopyright=(c) 2026 Dietmar Reh
AppId={{F2A9B1C3-D4E5-4F6A-8B9C-0D1E2F3A4B5C}
AppComments=Amateurfunk Pruefungstrainer fuer Klasse N, E und A
DefaultDirName={commonpf}\Amateurfunk-Trainer
DefaultGroupName=Amateurfunk-Trainer
DisableProgramGroupPage=yes
; ZIELORDNER IMMER ABFRAGEN.
; Ohne diese Zeile gilt DisableDirPage=auto - und "auto" heisst: Die
; Seite wird UEBERSPRUNGEN, sobald Inno eine fruehere Installation
; derselben AppId findet. Genau deshalb wurde Dietmar beim zweiten Mal
; nicht mehr gefragt und landete stillschweigend wieder unter
; C:\Program Files. Mit "no" kommt die Seite jedes Mal; der zuletzt
; benutzte Ordner steht dabei schon drin (UsePreviousAppDir gilt weiter),
; man muss ihn also nur bestaetigen.
DisableDirPage=no
; Alle fertigen Setups sammeln sich in release\. Vorher landeten sie
; im Projektordner zwischen den Quelldateien - beim Aufraeumen ist das
; die Sorte Datei, die man versehentlich mitnimmt oder loescht.
; release\ steht in der .gitignore: 100 MB je Datei laesst GitHub im
; Repository nicht zu, sie gehoeren an ein Release.
OutputDir=release
OutputBaseFilename=Amateurfunk-Trainer-{#AppVer}
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
WizardImageFile=wizard.bmp
WizardSmallImageFile=small.bmp
WizardImageStretch=no
; DAS SYMBOL DER FERTIGEN SETUP-DATEI.
; Dietmar: "Nach dem Kompilieren einer exe fehlt das Icon." Auf seinem
; Bildschirm stand das Standardsymbol von Inno Setup - das weisse Blatt
; mit dem blauen Pfeil. Diese Zeile war nicht die Ursache; sie stand
; schon. Gebaut wurde aber aus dem alten Ordner unter C:\Program Files,
; und dort lagen eine aeltere installer.iss (7 statt 12 KB) und eine
; aeltere icon.ico (61 statt 401 KB). Wer den Bau aus DIESEM Ordner
; startet, bekommt das Symbol.
; Die icon.ico daneben ist nachgemessen: 8 Groessen von 16 bis 256
; Pixel, alle als DIB und nicht als eingebettetes PNG. PNG-Symbole in
; einer ICO zeigt nicht jede Windows-Fassung ueberall an.
SetupIconFile=icon.ico
UninstallDisplayIcon={app}\icon.ico
UninstallDisplayName=Amateurfunk-Trainer {#AppVer}
PrivilegesRequired=admin
VersionInfoCompany=Dietmar Reh
VersionInfoCopyright=(c) 2026 Dietmar Reh
VersionInfoProductName=Amateurfunk-Trainer
VersionInfoProductVersion={#AppVer}
VersionInfoVersion={#AppVer}
VersionInfoDescription=Amateurfunk-Trainer Setup
VersionInfoOriginalFileName=Amateurfunk-Trainer-{#AppVer}.exe
; ACHTUNG, das beantwortet NICHT die Frage nach dem "unbekannten
; Herausgeber" in der Windows-Abfrage. Diese Felder fuellen nur den
; Eigenschaften-Dialog der Datei. Was Windows in der blauen
; Sicherheitsabfrage anzeigt, kommt ausschliesslich aus einer
; Code-Signatur - siehe die Erklaerung im CHANGELOG.
ArchitecturesInstallIn64BitMode=x64compatible
ArchitecturesAllowed=x64compatible

[Languages]
Name: "german"; MessagesFile: "compiler:Languages\German.isl"

[Dirs]
; Diese Ordner beschreibt der Trainer im Betrieb. Unter
; C:\Program Files darf ein normaler Benutzer sonst nicht schreiben -
; ohne users-modify waere der Lernstand nach jedem Schliessen weg.
Name: "{app}\data";           Permissions: users-modify
Name: "{app}\data\userdata";  Permissions: users-modify
Name: "{app}\backup";         Permissions: users-modify
Name: "{app}\tts_cache";      Permissions: users-modify
Name: "{app}\Hoerbuch";       Permissions: users-modify
Name: "{app}\node";           Permissions: users-modify
Name: "{app}\piper";          Permissions: users-modify
Name: "{app}\piper\voices";   Permissions: users-modify
; Bleibt leer, wird aber angelegt: Ohne den Ordner !v\ darin wuerde
; espeak-ng-data\voices\ sonst gar nicht entstehen. Ein Verzeichnis, das
; ein Programm einliest, sollte da sein - auch wenn nichts drinsteht.
Name: "{app}\piper\espeak-ng-data\voices"
Name: "{app}\sounds"
Name: "{app}\svgs"
Name: "{app}\fontawesome"
Name: "{app}\formelsammlung"

[Files]
; ---------------- Programm ----------------
Source: "Server.js";           DestDir: "{app}"; Flags: ignoreversion
Source: "duo.js";              DestDir: "{app}"; Flags: ignoreversion
Source: "hoerbuch.js";         DestDir: "{app}"; Flags: ignoreversion
Source: "klick-sound.js";      DestDir: "{app}"; Flags: ignoreversion
Source: "lame.js";             DestDir: "{app}"; Flags: ignoreversion
; Achtung Gross-/Kleinschreibung: Auf der Platte heisst die Datei
; derzeit Tts-Expand.js, Server.js holt sie als './tts-expand'.
; Unter Windows findet Inno sie unter beiden Schreibweisen; DestName
; sorgt dafuer, dass sie installiert klein geschrieben ankommt.
; (Mit Platzhaltern waere DestName nicht erlaubt - deshalb ausgeschrieben.)
Source: "Tts-Expand.js";       DestDir: "{app}"; DestName: "tts-expand.js"; Flags: ignoreversion
Source: "video_map_embed.js";  DestDir: "{app}"; Flags: ignoreversion
Source: "github_update.js";    DestDir: "{app}"; Flags: ignoreversion
Source: "update_pruefen.js";   DestDir: "{app}"; Flags: ignoreversion
Source: "Index.html";          DestDir: "{app}"; Flags: ignoreversion

; ---------------- Daten ----------------
Source: "fragen.json";         DestDir: "{app}"; Flags: ignoreversion
Source: "Fragen-*.json";       DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "svg-list.json";       DestDir: "{app}"; Flags: ignoreversion
Source: "video_lessons.json";  DestDir: "{app}"; Flags: ignoreversion
Source: "formelhilfe.json";    DestDir: "{app}"; Flags: ignoreversion
Source: "package.json";        DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "package-lock.json";   DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
; video_embed.json fehlt hier mit Absicht: Darin stehen die Vornamen
; echter Menschen, die nie gefragt wurden, ob sie mitverteilt werden.
; Aus demselben Grund fehlt data\ - das ist DEIN Lernstand.

; ---------------- Unterlagen ----------------
Source: "Formelsammlung.pdf";  DestDir: "{app}"; Flags: ignoreversion
Source: "Pruefungsfragen.pdf"; DestDir: "{app}"; Flags: ignoreversion
; Die Lizenz MUSS jeder Kopie beiliegen - so steht es in der
; PolyForm Noncommercial 1.0.0, Abschnitt "Notices".
Source: "LICENSE";             DestDir: "{app}"; Flags: ignoreversion
Source: "README.md";           DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist

; ---------------- Symbole ----------------
Source: "icon.ico";            DestDir: "{app}"; Flags: ignoreversion
Source: "icon.png";            DestDir: "{app}"; Flags: ignoreversion

; ---------------- Starten und Beenden ----------------
Source: "START.vbs";             DestDir: "{app}"; Flags: ignoreversion
Source: "START.bat";             DestDir: "{app}"; Flags: ignoreversion
Source: "START_MIT_TUNNEL.vbs";  DestDir: "{app}"; Flags: ignoreversion
Source: "START_MIT_TUNNEL.bat";  DestDir: "{app}"; Flags: ignoreversion
Source: "START_SICHTBAR.bat";    DestDir: "{app}"; Flags: ignoreversion
Source: "STOP.bat";              DestDir: "{app}"; Flags: ignoreversion
Source: "start-tunnel.bat";      DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "DNS-Auffrischen.bat";   DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "Update-Pruefen.bat";    DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
; HIER STAND BIS ZUM 01.09.2026 DER GANZE USB-STICK-WEG:
; USB-Stick-Erstellen.bat, usb_erstellen.js, Verknuepfung-Erstellen.bat,
; verknuepfung.ps1, Node-Holen.bat, node_holen.ps1 - dazu piper.bat, das
; die Sprachstimme nachgeladen hat.
;
; Alles davon stammt aus der Zeit, als der Trainer als ZIP oder auf einem
; Stick weitergereicht wurde und der Empfaenger sich Node und die Stimme
; selbst besorgen musste. Mit diesem Setup ist beides erledigt: node\ und
; die deutsche Piper-Stimme kommen mit, die Verknuepfungen legt der
; Installer selbst an. Dietmar dazu: "Die muessen raus!"
;
; Zwei Wege, dieselbe Sache zu tun, sind einer zu viel - und der
; ungenutzte ist immer der, der irgendwann nicht mehr funktioniert, ohne
; dass es jemandem auffaellt.
Source: "cloudflared.exe";       DestDir: "{app}"; Flags: ignoreversion

; ---------------- Ordner ----------------
Source: "node\*";           DestDir: "{app}\node";           Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist
; node_modules bringt 9,2 MB mit, davon liest Node zur Laufzeit 3,3 MB.
; Der Rest sind TypeScript-Deklarationen (*.d.ts, 2,9 MB), Quelltext-
; karten fuer den Debugger (*.map, 2,1 MB) und Readmes (0,9 MB).
;
; ACHTUNG, kein pauschales *.md: Neun Pakete legen ihre Lizenz als
; license.md bzw. LICENSE.md ab (ms, qs und die sechs eingebetteten
; ms-Kopien). Die MIT-Lizenz verlangt, dass der Hinweis jeder Kopie
; beiliegt - ein Ausschluss "*.md" haette also genau die Dateien
; entfernt, die mitgehen MUESSEN. Deshalb wird namentlich
; ausgeschlossen; die Lizenzen bleiben alle drin.
Source: "node_modules\*";   DestDir: "{app}\node_modules";   Excludes: "*.d.ts,*.map,README.md,CHANGELOG.md,History.md,SECURITY.md,CONTRIBUTING.md,CODE_OF_CONDUCT.md"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist
Source: "svgs\*";           DestDir: "{app}\svgs";           Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist
; Die Symbolschrift. Sie lag bis zum 01.09.2026 bei einem CDN - damit
; brauchte ausgerechnet der Trainer, der "auch ohne Netz laeuft", beim
; Start doch eine Internetverbindung. Ohne sie blieben saemtliche
; Knopfsymbole leere Kaesten. 432 KB, davon 300 KB Schriftdateien; die
; ttf-Ausweichfassungen sind herausgenommen, woff2 kann jeder Browser
; seit 2016. LICENSE.txt liegt dabei - Font Awesome verlangt das.
Source: "fontawesome\*";    DestDir: "{app}\fontawesome";    Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist
; fanfare.wav (2,2 MB) faellt raus. Index.html spielt fanfare.mp3 und
; greift nur dann auf die WAV zurueck, wenn die MP3 fehlt - das ist der
; Fall bei Paketen von vor dem 27.08.2026. Eine frische Installation
; hat die MP3 immer, der Rueckfall kann hier also nie eintreten.
Source: "sounds\*";         DestDir: "{app}\sounds";         Excludes: "fanfare.wav"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist
Source: "formelsammlung\*"; DestDir: "{app}\formelsammlung"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist
; Piper samt Stimmen. recursesubdirs nimmt auch die .onnx-Dateien mit.
; pkgconfig\ enthaelt Baumetadaten der espeak-Bibliothek (.pc-Dateien
; fuer den C-Compiler). Zur Laufzeit liest die niemand.
#if SchlankesPiper
;  espeak-ng-data\voices\!v\ kommt am 01.09.2026 dazu, auf Dietmars
; Ansage, nachdem die 104 Namen im Baufenster vorbeigerauscht sind.
; Es sind Stimmvarianten - "whisper", "croak", "robosoft3" und so fort.
; Zu hoeren bekommt man sie nur, wenn eine Stimme ausdruecklich als
; Variante angefordert wird (de+m3). Der Trainer tut das nicht: Er nimmt
; die Piper-Stimme aus der .onnx-Datei, espeak zerlegt nur die Woerter
; in Laute.
;
; Es geht dabei um 50 KB - viele Namen, fast keine Bytes. Der Ordner
; lang\ bleibt deshalb ausdruecklich drin: Ueber ihn findet espeak die
; Grundsprache, und 18 KB sind kein Grund, daran zu ruehren.
Source: "piper\*";          DestDir: "{app}\piper";          Excludes: "\pkgconfig\*,libtashkeel_model.ort,\espeak-ng-data\*_dict,\espeak-ng-data\voices\!v\*"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist; Permissions: users-modify
; Das deutsche Woerterbuch wird einzeln wieder hereingeholt - der
; Ausschluss oben nimmt alle *_dict, auch das, welches gebraucht wird.
Source: "piper\espeak-ng-data\de_dict"; DestDir: "{app}\piper\espeak-ng-data"; Flags: ignoreversion skipifsourcedoesntexist
Source: "piper\espeak-ng-data\en_dict"; DestDir: "{app}\piper\espeak-ng-data"; Flags: ignoreversion skipifsourcedoesntexist
#else
Source: "piper\*";          DestDir: "{app}\piper";          Excludes: "\pkgconfig\*"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist; Permissions: users-modify
#endif

[Tasks]
; {cm:AdditionalIcons} ist die Ueberschrift "Zusaetzliche Symbole", unter
; der Windows-Installer solche Haken erwartet. Beide stehen jetzt dort.
Name: "desktopicon";  Description: "{cm:CreateDesktopIcon}";   GroupDescription: "{cm:AdditionalIcons}"
Name: "taskbaricon";  Description: "An Taskleiste anheften";   GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Icons]
Name: "{group}\Amateurfunk-Trainer"; Filename: "wscript.exe"; Parameters: """{app}\START.vbs"""; WorkingDir: "{app}"; IconFilename: "{app}\icon.ico"; IconIndex: 0
Name: "{group}\Amateurfunk-Trainer beenden"; Filename: "{app}\STOP.bat"; WorkingDir: "{app}"; IconFilename: "{app}\icon.ico"; IconIndex: 0
Name: "{commondesktop}\Amateurfunk-Trainer"; Filename: "wscript.exe"; Parameters: """{app}\START.vbs"""; WorkingDir: "{app}"; IconFilename: "{app}\icon.ico"; IconIndex: 0; Tasks: desktopicon
; Taskleiste. Windows legt hier die angehefteten Verknuepfungen ab.
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\User Pinned\TaskBar\Amateurfunk-Trainer"; Filename: "wscript.exe"; Parameters: """{app}\START.vbs"""; WorkingDir: "{app}"; IconFilename: "{app}\icon.ico"; IconIndex: 0; Tasks: taskbaricon

[UninstallDelete]
; Die Taskleisten-Verknuepfung liegt ausserhalb von {app} und wuerde
; sonst als Leiche zuruecckbleiben.
Type: files; Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\User Pinned\TaskBar\Amateurfunk-Trainer.lnk"
; Zur Laufzeit entstandene Ordner - sonst bleibt {app} stehen.
Type: filesandordirs; Name: "{app}\tts_cache"
Type: filesandordirs; Name: "{app}\node_modules"

[Run]
Filename: "wscript.exe"; Parameters: """{app}\START.vbs"""; WorkingDir: "{app}"; Description: "Amateurfunk-Trainer jetzt starten"; Flags: postinstall nowait skipifsilent

[Code]
var
  ResultCode: Integer;

// Laeuft der Trainer noch, sind Server.js und die DLLs gesperrt und
// das Setup scheitert mitten im Kopieren. Deshalb vorher aufraeumen -
// mehrfach, weil node sich beim ersten Versuch neu starten kann.
procedure KillTrainerProcesses();
var i: Integer;
begin
  for i := 0 to 3 do begin
    Exec(ExpandConstant('{sys}\taskkill.exe'), '/f /im node.exe /t', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    Exec(ExpandConstant('{sys}\taskkill.exe'), '/f /im cloudflared.exe /t', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    Exec(ExpandConstant('{sys}\taskkill.exe'), '/f /im piper.exe /t', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    Sleep(300);
  end;
  Sleep(1500);
end;

function InitializeSetup(): Boolean;
begin
  KillTrainerProcesses();
  Result := True;
end;

function InitializeUninstall(): Boolean;
begin
  KillTrainerProcesses();
  Result := True;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if CurUninstallStep = usUninstall then
    KillTrainerProcesses();
end;

procedure InitializeWizard();
var
  Hinweis: TLabel;
begin
  Hinweis := TLabel.Create(WizardForm);
  Hinweis.Parent := WizardForm.WelcomePage;
  Hinweis.Left := WizardForm.WelcomeLabel2.Left;
  Hinweis.Top := WizardForm.WelcomeLabel2.Top + WizardForm.WelcomeLabel2.Height + 20;
  Hinweis.Width := WizardForm.WelcomeLabel2.Width;
  Hinweis.Height := 48;
  Hinweis.Caption := 'Hinweis: cloudflared.exe wird mit installiert - sie wird nur gebraucht,' + #13#10 +
                     'wenn ein Gruppenraum ueber das Internet angeboten wird. Von allein' + #13#10 +
                     'geht der Trainer nie ins Netz.';
  Hinweis.Font.Color := clNavy;
  Hinweis.Font.Style := [fsBold];
  Hinweis.Font.Size := 9;
  Hinweis.WordWrap := True;
end;

// Windows raeumt den Ordner "User Pinned\TaskBar" nicht selbst auf und
// legt ihn auch nicht an, wenn er fehlt. Ohne diesen Schritt geht der
// Haken "An Taskleiste anheften" ins Leere.
procedure CurStepChanged(CurStep: TSetupStep);
var
  Ziel: String;
begin
  if CurStep = ssInstall then
  begin
    Ziel := ExpandConstant('{userappdata}\Microsoft\Internet Explorer\Quick Launch\User Pinned\TaskBar');
    if not DirExists(Ziel) then
      ForceDirectories(Ziel);
  end;
end;
