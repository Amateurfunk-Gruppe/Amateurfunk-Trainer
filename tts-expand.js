// ================================================================
// tts-expand.js
// ================================================================
// WAS HIER PASSIERTE (01.09.2026):
// Diese Datei wurde durch ein voellig anderes Modul ersetzt - einen
// Piper-Starter mit der einzigen Funktion piperTTS. Dabei ging
// expandTTS verloren, und Server.js Zeile 689 holt sich genau die:
//
//     const { expandTTS } = require('./tts-expand');
//
// Ergebnis im laufenden Trainer:
//     TypeError: expandTTS is not a function
//
// Unter Windows faellt der Dateiname nicht auf: Das Dateisystem
// unterscheidet keine Gross- und Kleinschreibung, deshalb findet
// require('./tts-expand') auch eine Datei namens Tts-Expand.js. Das
// Modul wurde also geladen - es enthielt nur die falsche Funktion.
//
// Wiederhergestellt ist deshalb der vollstaendige alte Inhalt.
// piperTTS bleibt erhalten und wird mit exportiert, damit nichts
// verlorengeht - benutzt wird es derzeit von keiner Stelle im
// Projekt (nachgesehen in Server.js und hoerbuch.js).
// ================================================================

// ================================================================
// tts-expand.js
//
// FIX Q7: Aus Server.js ausgelagert. Die Funktion war ein 155-Zeilen-
// Monolith mit ueber 30 verketteten Regex-Ersetzungen mitten im Server-
// code - jede Aenderung konnte jede andere Regel kippen, und es gab
// keinen einzigen Test. Als eigenes Modul ist sie jetzt mit
// "npm test" abgesichert (siehe test/tts-expand.test.js).
//
// Aufgabe: Fragetext so umschreiben, dass Piper ihn korrekt vorliest -
// Einheiten ausschreiben, Funk-Abkuerzungen aufloesen, bei "Was bedeutet
// die Abkuerzung X?" die Abkuerzung buchstabieren statt aufzuloesen.
// ================================================================
'use strict';

function expandTTS(text){
  if(!text) return text;
  let t=text;

  // FIX: Griechischer Buchstabe Lambda (Wellenlaenge, z.B. "λ/4-Antenne") wird
  // von Piper sonst gar nicht oder falsch ausgesprochen. Deshalb ganz am
  // Anfang zu "Lambda" ausgeschrieben, bevor irgendeine andere Regel laeuft.
  t = t.replace(/λ/g, 'Lambda');

  // HTML RAUS, BEVOR PIPER ES LIEST (16.09.2026). Der Katalog unterstreicht
  // an 29 Stellen ein Wort - "<u>nicht</u> abhaengig" (EC205) -, und die
  // Anfuehrungszeichen bei AF305 stehen als &bdquo;?&ldquo; im Text. Die
  // Anzeige setzt das als HTML; die Sprachausgabe bekam es roh und sprach
  // "u nicht u" und "und bdquo". Gefunden mit der Sprachprobe.
  t = t.replace(/<\/?[a-zA-Z][^<>]{0,40}>/g, ' ');
  t = t.replace(/&nbsp;/g, ' ').replace(/&bdquo;/g, '„').replace(/&ldquo;/g, '“')
       .replace(/&rdquo;/g, '”').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
       .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

  // ================================================================
  // FORMELN HOERBAR MACHEN   (16.09.2026)
  // ----------------------------------------------------------------
  // Bei der Nachpruefung des ganzen Katalogs wurde jeder Text durch
  // diese Funktion und dann durch den Lautbildner von Piper (espeak-ng,
  // deutsch) geschickt. Ergebnis: Piper laesst Wurzel, Malpunkt,
  // Bruchstrich und Hochzahlen einfach WEG. Gehoert hat man dann:
  //
  //     "U = √(P ⋅ R)"     ->  "U gleich P R"
  //     "U = √(P/R)"       ->  "U gleich"            (EB504 - Antwort leer!)
  //     "R = U/I"          ->  "R gleich U I"        (NB503 - wie "R = I/U")
  //     "10⁻⁶ W"           ->  "zehn W"              (Exponent verschwunden)
  //     "16 mm²"           ->  "sechzehn Millimeter zwei"
  //     "28 V/m"           ->  "28 Volt Strich m"    (Regel fuer /m-Rufzeichen)
  //     "0,22 μF"          ->  "null komma zwei zwei mi ef"
  //     "14 081,20 kHz"    ->  "vierzehn null einundachtzig komma zwanzig"
  //
  // Die Ohmschen Gesetze der Klasse N (NB501-NB503) und die Leistungs-
  // formeln der Klasse E (EB504-EB506) waren mit dem Ohr nicht zu
  // unterscheiden - wer das Vorlesen braucht, konnte sie nicht loesen.
  //
  // WARUM GANZ OBEN: Weiter unten werden Klammern mit einem einzelnen
  // Kuerzel darin entfernt ("Volt (V)" -> "Volt"). Das traf auch
  // "√(P/R)" - die Klammer war leer, bevor jemand die Wurzel sprach.
  // Hier oben ist aus "(P/R)" schon "P durch R" geworden, und das
  // bleibt stehen.
  //
  // Zu "μ": Der Katalog schreibt das Mikro als griechisches My (U+03BC),
  // die Einheitenliste unten kennt nur das Mikrozeichen (U+00B5). Deshalb
  // fanden sich "μF", "μH", "μW" nirgends wieder - 220 Stellen.
  // ================================================================

  // Zahlengruppen: Das schmale geschuetzte Leerzeichen in "14 081,20"
  // macht aus einer Zahl zwei. Ohne Trenner liest Piper sie richtig.
  t = t.replace(/(\d)[   ](?=\d)/g, '$1');
  t = t.replace(/[   ]/g, ' ');

  // Mikro vereinheitlichen, damit die Einheitenliste es findet.
  t = t.replace(/μ/g, 'µ');

  // Einheiten mit Bruchstrich - VOR der Regel "/m = Rufzeichenzusatz"
  // und vor den Hochzahlen (wegen m²). "V/m" ist Feldstaerke, kein
  // Rufzeichen.
  const ZAEHLER = { 'V':'Volt','kV':'Kilovolt','mV':'Millivolt','µV':'Mikrovolt',
    'A':'Ampere','mA':'Milliampere','µA':'Mikroampere','W':'Watt','mW':'Milliwatt',
    'kW':'Kilowatt','H':'Henry','S':'Siemens','MS':'Megasiemens','J':'Joule','dB':'Dezibel' };
  const NENNER = { 'm':'Meter','cm':'Zentimeter','mm':'Millimeter','m²':'Quadratmeter',
    'cm²':'Quadratzentimeter','s':'Sekunde','h':'Stunde','A':'Ampere','km':'Kilometer','Hz':'Hertz' };
  // Nicht in einer Klammer, die nur das Kuerzel enthaelt: "Volt pro Meter (V/m)"
  // wird unten ohnehin auf das Wort gekuerzt.
  t = t.replace(/(?<![A-Za-zÄÖÜäöüß(])(kV|mV|µV|mA|µA|mW|kW|MS|dB|V|A|W|H|S|J)\/(m²|cm²|mm²|cm|mm|km|Hz|m|s|h|A)(?![A-Za-zÄÖÜäöüß)])/g,
      (m, z, n) => ' ' + ZAEHLER[z] + ' pro ' + NENNER[n] + ' ');
  t = t.replace(/(?<![A-Za-zÄÖÜäöüß(])(k|M|G)?[Bb]it\/s(?![A-Za-zÄÖÜäöüß)])/g,
      (m, v) => ' ' + ({ k:'Kilobit', M:'Megabit', G:'Gigabit' }[v] || 'Bit') + ' pro Sekunde ');

  // Hochzahlen. "10⁻⁶" als Ganzes zuerst - wer vorher "²" ersetzt, macht
  // aus "10⁻¹⁸" ein "zehn hoch minus eins zum Quadrat".
  const HOCH = { '⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9' };
  const TIEF = { '₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9' };
  const ziffern = (s, tab) => Array.from(s).map(z => tab[z] || '').join('');
  t = t.replace(/10(⁻?)([⁰¹²³⁴-⁹]+)/g,
      (m, minus, z) => '10 hoch ' + (minus ? 'minus ' : '') + ziffern(z, HOCH) + ' ');
  t = t.replace(/\bmm²/g, ' Quadratmillimeter');
  t = t.replace(/\bcm²/g, ' Quadratzentimeter');
  t = t.replace(/\bkm²/g, ' Quadratkilometer');
  t = t.replace(/\bm²/g,  ' Quadratmeter');
  t = t.replace(/\bmm³/g, ' Kubikmillimeter');
  t = t.replace(/\bcm³/g, ' Kubikzentimeter');
  t = t.replace(/\bm³/g,  ' Kubikmeter');
  t = t.replace(/²/g, ' zum Quadrat ');
  t = t.replace(/³/g, ' hoch drei ');
  t = t.replace(/(⁻?)([⁰¹⁴-⁹]+)/g,
      (m, minus, z) => ' hoch ' + (minus ? 'minus ' : '') + ziffern(z, HOCH) + ' ');
  // Tiefzahlen: "R₁" -> "R 1". Piper liest sie zwar, aber nicht jede Stimme.
  t = t.replace(/[₀-₉]+/g, m => ' ' + ziffern(m, TIEF));

  // Griechische Buchstaben mit Namen - Piper schaltet sonst mitten im Satz
  // auf Griechisch um ("η" -> "ita"). Omega und Lambda haben eigene Regeln.
  const GRIECHISCH = { 'α':'Alpha','β':'Beta','γ':'Gamma','δ':'Delta','Δ':'Delta','ε':'Epsilon',
    'η':'Eta','ϑ':'Theta','θ':'Theta','π':'Pi','ρ':'Rho','σ':'Sigma','Σ':'Sigma','τ':'Tau',
    'φ':'Phi','ϕ':'Phi','Φ':'Phi','ω':'Omega' };
  t = t.replace(/[αβγδΔεηϑθπρσΣτφϕΦω]/g, (g, i, str) => ' ' + GRIECHISCH[g] + (str[i + 1] === '_' ? '' : ' '));
  // Ein My ohne Einheit dahinter ("µ_r") ist die Permeabilitaet.
  t = t.replace(/\u00b5(?![A-Za-z])/g, 'Mü');

  // Wurzel. Eine einfache Klammer dahinter wird gleich aufgeloest, damit die
  // Klammer-Regel unten sie nicht fuer ein Kuerzel haelt.
  t = t.replace(/√\s*\(([^()]{1,40})\)/g, ' Wurzel aus $1 ');
  t = t.replace(/√\s*\(/g, ' Wurzel aus (');
  t = t.replace(/√/g, ' Wurzel aus ');

  // Malpunkt (beide Schreibweisen) - Piper laesst ihn weg.
  t = t.replace(/\s*[⋅·∙]\s*/g, ' mal ');

  // Bruchstriche in Formeln. Die Regel ist eng: Rufzeichen ("DL1PZ/T"),
  // Empfehlungen ("T/R 61-01"), Paare ("A/D-Umsetzer", "und/oder") und
  // Aktenzeichen ("13/2005") bleiben, wie sie sind.
  const ZAHLWORT = ['', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
  const TEILWORT = { 2:'halb', 3:'Drittel', 4:'Viertel', 5:'Fünftel', 6:'Sechstel', 7:'Siebtel', 8:'Achtel', 9:'Neuntel' };
  t = t.replace(/\bT\/R (?=\d)/g, 'T R ');
  t = t.replace(/\bRX\/TX\b/g, 'RX und TX').replace(/\bTX\/RX\b/g, 'TX und RX');
  // " / " mit Abstand zwischen zwei Formelzeichen - "L / A_L" (AC207).
  // Nicht zwischen zwei Groessen mit Einheit: "150 Ω / 1 W" ist eine
  // Angabe "150 Ohm, 1 Watt", kein Bruch.
  t = t.replace(/(?<![A-Za-zÄÖÜäöüß0-9])([A-Za-z]|\))\s+\/\s+(?=[A-Za-z(](?![A-Za-zÄÖÜäöüß0-9]))/g, '$1 durch ');
  t = t.replace(/(?<![\d,.])([1-9])\/([2-9])(?![\d,.])/g,
      (m, z, n) => ' ' + ZAHLWORT[+z] + ' ' + TEILWORT[+n] + ' ');
  t = t.replace(/(halb|Drittel|Viertel|Fünftel|Sechstel|Siebtel|Achtel|Neuntel) -(?=[A-Za-z])/g, '$1 ');
  t = t.replace(/Lambda\s*\/\s*2\b/g, 'Lambda halbe');
  t = t.replace(/Lambda\s*\/\s*4\b/g, 'Lambda Viertel');
  t = t.replace(/Lambda\s*\/\s*(\d+)/g, 'Lambda durch $1');
  t = t.replace(/\)\s*\/\s*/g, ') durch ');
  t = t.replace(/\/\s*\(/g, ' durch (');
  t = t.replace(/\/\s*(?=Wurzel)/g, ' durch ');
  t = t.replace(/(?<![A-Za-zÄÖÜäöüß0-9\-(])([A-Za-z]|\d+(?:[.,]\d+)?)\s*\/\s*([A-Za-z])(?![A-Za-zÄÖÜäöüß0-9\-)])/g, '$1 durch $2');

  // Vergleichs- und Sonderzeichen, die Piper verschluckt oder falsch nennt.
  // "<" und ">" laesst Piper stumm weg - "d > λ/(2π)" (AK103) war "d Lambda".
  // Die HTML-Marken sind oben schon entfernt, hier bleiben nur Vergleiche.
  t = t.replace(/(^|[\s(])<=\s*/g, '$1kleiner gleich ');
  t = t.replace(/(^|[\s(])>=\s*/g, '$1größer gleich ');
  t = t.replace(/(^|[\s(])<\s*(?=[\d(A-Za-zλ])/g, '$1kleiner als ');
  t = t.replace(/(^|[\s(])>\s*(?=[\d(A-Za-zλ])/g, '$1größer als ');
  // ("Û" wird "U Zirkumflex" - Funker sagen "U Dach").
  t = t.replace(/∥/g, ' parallel zu ');
  t = t.replace(/Û/g, 'U Dach').replace(/Î/g, 'I Dach');
  t = t.replace(/≪/g, ' viel kleiner als ');
  t = t.replace(/≫/g, ' viel größer als ');

  // Aufzaehlungen "(1) ... (2) ... (3)" (VC124): Die Klammer-Regel unten
  // wuerde die Ziffern streichen, und die drei Punkte liefen ineinander.
  const ORDNUNG = ['', 'erstens', 'zweitens', 'drittens', 'viertens', 'fünftens', 'sechstens', 'siebtens', 'achtens', 'neuntens'];
  t = t.replace(/\((\d)\)(?=\s*[A-ZÄÖÜ])/g, (m, z) => ORDNUNG[+z] + ':');

  // ================================================================
  // TIEFGESTELLTE INDIZES UND ZEHNERPOTENZEN   (15.09.2026)
  // ----------------------------------------------------------------
  // Dietmar am 15.09.2026: "Bitte pruefe ob das so stimmt mit dem _
  // dazwischen" - mit dem Bild von AG214, wo "von P_V zu P_R." steht.
  //
  // Der Unterstrich ist die Textschreibweise fuer den tiefgestellten
  // Index; im amtlichen Katalog steht dort ein kleines V bzw. R unter
  // dem P. Die Anzeige setzt das jetzt als echten Index (formelHtml in
  // Index.html) - fuer Piper musste es noch aufgeloest werden. Das
  // Protokoll zeigte den Mangel schwarz auf weiss:
  //
  //   [PRE V15] Antwort A: von P_V zu P_R.. -> Antwort A: von P_V zu P_R..
  //
  // Links der Text vor der Aufbereitung, rechts danach - unveraendert.
  // Piper bekam also den nackten Unterstrich und verschluckt ihn. Bei
  // 60 Fragen sind das genau die Rechenaufgaben, bei denen jemand mit
  // schwachen Augen das Vorlesen braucht.
  //
  // GANZ OBEN, gleich nach Lambda: spaeter greifen Regeln, die auf
  // Grossbuchstabenfolgen und auf Einheiten schauen. Die sollen ein
  // "P V" schon vorfinden und nicht mehr ein "P_V".
  //
  // Zwei Buchstaben Index werden getrennt gesprochen ("U_AB" -> "U A-B"),
  // ein ausgeschriebener Index bleibt ein Wort ("P_Sender" -> "P Sender").
  // Der Bindestrich ist dieselbe Technik wie bei DARC weiter unten: er
  // trennt, ohne dass ein Wort dazukommt.
  // ================================================================
  t = t.replace(/([A-Za-zäöüÄÖÜ])_\{([A-Za-z0-9]{1,16})\}/g, '$1 $2');
  t = t.replace(/([A-Za-zäöüÄÖÜ])_([A-Za-z0-9]{1,16})/g, (m, zeichen, index) =>
      zeichen + ' ' + (/^[A-Z0-9]{2,3}$/.test(index) ? index.split('').join('-') : index));

  // Zehnerpotenzen und Exponenten in Klammerschreibweise: "10^(0,5)" wird
  // zu "10 hoch 0,5", "I^2" zu "I hoch 2". Ohne diese Regel liest Piper
  // das Dach als Zeichen oder ueberspringt es.
  t = t.replace(/\^\{([^}]{1,16})\}/g, ' hoch $1 ');
  t = t.replace(/\^\(([^)]{1,16})\)/g, ' hoch $1 ');
  t = t.replace(/\^(-?\d+(?:[.,]\d+)?|[A-Za-z])/g, ' hoch $1 ');


  // FIX (05.09.2026): "DARC" liest Piper als englisches "dark". Dietmar:
  // "DARC liest es als Dark. Es muss DARC aussprechen. D A R C mit einer
  // sehr kleinen Pause dazwischen bei allen Sprachen."
  //
  // Der Deutsche Amateur-Radio-Club wird buchstabiert, nicht gelesen. Die
  // Bindestriche sind dieselbe Technik wie bei "Antennen-anlage" ein paar
  // Zeilen tiefer: Sie trennen, ohne dass ein Wort dazukommt - anders als
  // ein Komma, das eine deutlich laengere Pause macht, und anders als ein
  // Schraegstrich, den Piper als "Strich" mitspricht.
  //
  // Hier oben, gleich nach Lambda: Spaeter greifen Regeln, die auf
  // Grossbuchstabenfolgen schauen, und die sollen dieses Wort nicht mehr
  // vorfinden.
  t = t.replace(/\bDARC\b/g, 'D-A-R-C');

  // FIX (05.09.2026): Dasselbe fuer das Rufzeichen von Michael. Dietmar:
  // "DL2YMR muessen als Buchstaben vorgelesen werden." Als Wort gelesen
  // klingt es wie ein Nieser - buchstabiert ist es das, was jeder Funker
  // erwartet. Auch diese Regel steht doppelt, hier und in Index.html.
  t = t.replace(/\bDL2YMR\b/gi, 'D-L-2-Y-M-R');
  // "LAN" als Wort klingt wie "elan". Buchstabiert ist es eindeutig.
  // "WLAN" bleibt, wie es ist - das trifft die Stimme von selbst.
  // Dieselbe Regel steht in Index.html in der Tabelle AUSSPRACHE.
  t = t.replace(/(?<![A-Za-zÄÖÜäöüß])LAN\b/g, 'L-A-N');

  // FIX: "Antennenanlage" liest Piper wie "Andenanlage" - der mittlere Teil
  // des langen Kompositums geht verloren. Ein Bindestrich an der Nahtstelle
  // zwingt Piper, das Wort in zwei Teilen statt als einen Wortklumpen
  // auszusprechen. Wirkt per Regex auch in Zusammensetzungen wie
  // "Aussenantennenanlagen" oder "Amateurfunkantennenanlagen".
  t = t.replace(/(antennenanlage)(n)?/gi, (m, basis, mehrzahl) => {
    return basis.slice(0, 8) + '-' + basis.slice(8) + (mehrzahl || '');
  });

  // FIX: "Transceiver" liest Piper als "Transkeiver" (hartes K statt des im
  // Amateurfunk-Sprachgebrauch ueblichen S-Lauts, und "ei" statt des langen
  // "ie"). Phonetische Ersatzschreibung, gleiche Technik wie bei anderen
  // Aussprache-Fixes in dieser Datei (z.B. "CEPT" -> "Zeppt"). Wirkt auch in
  // Formen wie "Transceivern" oder "Mobilfunktransceiver".
  t = t.replace(/transceiver/gi, m => m[0] === m[0].toUpperCase() ? 'Transsiewer' : 'transsiewer');

  // FIX (02.09.2026): Der Strich zwischen zwei Frequenzen wird gelesen,
  // als waere er gar nicht da - aus "3-30 MHz" wird "drei dreissig
  // Megahertz". Dietmar: "In den Fragen tauchen immer wieder zwischen den
  // Frequenzen ein - auf. Das muss als 'bis' erweitert werden beim lesen."
  //
  // DIE REGEL IST ABSICHTLICH ENG. Sie greift nur, wenn hinter dem zweiten
  // Wert eine EINHEIT steht. Im Katalog stehen naemlich auch Striche, die
  // keine Spanne sind:
  //
  //     "CEPT-Empfehlung T/R 61-01"   ->  bleibt, wie es ist
  //     "ECC-Empfehlung (05)06"       ->  bleibt, wie es ist
  //     "3-30 MHz"                    ->  "3 bis 30 MHz"
  //
  // Ohne diese Bedingung wuerde aus der Empfehlung "einundsechzig bis
  // null eins" - schlimmer als der Fehler, den die Regel behebt.
  //
  // Sie laeuft VOR der Einheitenliste weiter unten: Die braucht sie ja
  // gerade als Erkennungsmerkmal, und danach heisst "MHz" schon
  // "Megahertz".
  t = t.replace(
    /(\d[\d.,]*)\s*[\u2010-\u2015-]\s*(\d[\d.,]*)(?=\s*(?:kHz|MHz|GHz|Hz|kW|mW|nW|pW|W|kV|mV|µV|uV|V|mA|µA|uA|A|dBm|dBi|dB|kOhm|MOhm|Ohm|Ω|km|cm|mm|m|s|min|%)(?![A-Za-zÄÖÜäöüß]))/g,
    '$1 bis $2');

  const paren=[];
  t=t.replace(/\([^)]{1,150}\)/g,m=>{
    const inner = m.slice(1,-1).trim();
    const isPureAbbr = /^[A-Za-zÄÖÜäöü0-9\/\.\-Ωµμ]{1,20}$/.test(inner) && !/\s/.test(inner);
    const isKnownAbbrInParen = /^(RR|IARU|ITU|ETSI|CEPT|BEMFV|AFuG|AFuV|TKG|EMVG|EMV|VDE|VO|ISO|HAREC|ECC|WRC|QSO|QTH|QSL|QRG|QRM|QSB|QRZ|QSY|QRV|CW|SSB|FM|AM|VHF|UHF|SHF|DC|AC|UTC|MEZ|MESZ|BNetzA|WPM|ERP|EIRP|SWR|VSWR|A|V|W|Ah|Ω|Ohm|Hz|kHz|MHz|GHz)$/i.test(inner);
    // Reine Zahlen bleiben hoerbar - "ECC-Empfehlung (05)06" (16.09.2026).
    if(/^\d+$/.test(inner)) return ' ' + inner + ' ';
    if(isPureAbbr || isKnownAbbrInParen){
      return ' ';
    }
    const i=paren.length;
    paren.push(m);
    return `__P${i}__`;
  });

  t=t.replace(/(\d{4,12})\s*(Hz)\b/g,(m,num)=>{
    const n=parseInt(num,10);
    if(n>=1000000){
      const v=n/1000000;
      const s=Number.isInteger(v)?v.toString():v.toFixed(1).replace('.',',');
      return `${s} Millionen Hertz`;
    }
    return `${num} Hertz`;
  });

  const map={
    'GHz':'Gigahertz','MHZ':'Megahertz','MHz':'Megahertz','kHz':'Kilohertz','Hz':'Hertz',
    'kV':'Kilovolt','MV':'Megavolt','mV':'Millivolt','µV':'Mikrovolt','uV':'Mikrovolt',
    'kA':'Kiloampere','mA':'Milliampere','µA':'Mikroampere','uA':'Mikroampere',
    'MW':'Megawatt','kW':'Kilowatt','mW':'Milliwatt','µW':'Mikrowatt','uW':'Mikrowatt',
    'MOhm':'Megaohm','kOhm':'Kiloohm','Ohm':'Ohm','µH':'Mikrohenry','uH':'Mikrohenry','mH':'Millihenry','µF':'Mikrofarad','uF':'Mikrofarad','nF':'Nanofarad','pF':'Pikofarad',
    'dBm':'De Be Em','dBi':'De Be I','dBd':'De Be De','dBµV':'Dezibel Mikrovolt','dB':'Dezibel','Ah':'Amperestunden','mAh':'Milliamperestunden','Wh':'Wattstunden','kWh':'Kilowattstunden','nH':'Nanohenry','kbit':'Kilobit','Mbit':'Megabit','Gbit':'Gigabit','µs':'Mikrosekunden','μs':'Mikrosekunden','us':'Mikrosekunden','ms':'Millisekunden',
    'km/h':'Kilometer pro Stunde','km/s':'Kilometer pro Sekunde','km':'Kilometer','cm':'Zentimeter','mm':'Millimeter','pps':'Perioden pro Sekunde',
    'BEMFV':'Begrenzung von elektromagnetischen Feldern',
    'IARU':'Internationale Amateurfunk Union',
    'ITU':'Internationale Fernmeldeunion',
    'MESZ':'Mitteleuropäische Sommerzeit',
    'BNetzA':'Bundesnetzagentur','EIRP':'Effektive isotrope Strahlungsleistung','VSWR':'Stehwellenverhältnis','FT8':'FT Acht','SWR':'Stehwellenverhältnis','PTT':'Sprechtaste','VOX':'Sprachsteuerung','PEP':'Spitzenleistung','ERP':'Effektive Strahlungsleistung','VHF':'Ultrakurzwelle','UHF':'Dezimeterwelle','SHF':'Zentimeterwelle',
    'QSO':'Funkverbindung','QTH':'Standort','QRG':'Frequenz','QRM':'Störungen','QSB':'Schwund','QSL':'Empfangsbestätigung','SSB':'Einseitenband','LSB':'Unteres Seitenband','USB':'Oberes Seitenband','RTTY':'Funkfernschreiben','PSK':'Phase Shift Keying','CW':'C W','AM':'Amplitudenmodulation','FM':'Frequenzmodulation','AF':'Niederfrequenz','NF':'Niederfrequenz','HF':'Hochfrequenz','RF':'Hochfrequenz','DC':'Gleichstrom','AC':'Wechselstrom',
    'MEZ':'Mitteleuropäische Zeit','UTC':'Universal Time Coordinated','WPM':'Wörter pro Minute','CEPT':'Zeppt','CEPT-Ländern':'Zeppt Ländern',
    // FIX Q6: hier stand '/m':'Strich Trainee'. Der Eintrag ist ersatzlos
    // entfernt und wird weiter unten durch zwei gezielte Regeln ersetzt -
    // siehe Kommentar dort. Als Map-Eintrag war er doppelt gefaehrlich,
    // weil '/m' kein reines Wortzeichen ist und deshalb OHNE Wortgrenze
    // ersetzt wurde: aus "DC4LW/mm" wurde "DC4LW Strich Traineem".
    'z.B':'zum Beispiel','nW':'Nanowatt','pW':'Pikowatt','bzw':'beziehungsweise','bzw.':'beziehungsweise','Bzw':'Beziehungsweise','z.B.':'zum Beispiel','d.h.':'das heißt','u.a.':'unter anderem','evtl.':'eventuell',
    'ETSI':'Europäisches Institut für Telekommunikationsnormen',
    'HAREC':'Harmonisiertes Amateurfunk Prüfungszeugnis',
    'AFuG':'Amateurfunkgesetz','AFuV':'Amateurfunkverordnung',
    'TKG':'Telekommunikationsgesetz',
    'EMVG':'Elektromagnetische Verträglichkeitsgesetz',
    'EMV':'Elektromagnetische Verträglichkeit',
    'EMVU':'Elektromagnetische Umweltverträglichkeit',
    'VDE':'Verband der Elektrotechnik',
    'RR':'Radio Regulations','VO':'Vollzugsordnung','ISO':'Internationale Organisation für Normung','WRC':'Weltfunkkonferenz','ECC':'Europäisches Funk Komitee',
    'CQ':'C Q','QRZ':'Wer ruft mich','QSY':'Frequenzwechsel','QRV':'Empfangsbereit','QRN':'Atmosphärische Störungen','QRO':'Hohe Leistung','QRP':'Geringe Leistung','QRT':'Sendepause','QRX':'Warten','PSE':'Bitte','QRL':'Belegt',
    'DMR':'Digital Mobile Radio','C4FM':'C 4 FM','D-STAR':'De Star',
    'OSCAR':'Oscar Satellit','AMSAT':'Amateurfunksatelliten Organisation',
    'BNC':'BNC Stecker','SMA':'SMA Stecker','PL':'PL Stecker',
    'LED':'Leuchtdiode','VFO':'Variabler Frequenzoszillator','RIT':'Empfänger Feinverstimmung','TRX':'T R X','TX':'T X','RX':'R X',
    'SWL':'Kurzwellenhörer','ARDF':'Amateurfunkpeilen','DX':'D X',
    'JS8':'Jay Es Acht','PSK31':'P S K Einunddreißig','SSTV':'Bildübertragung','RST':'Rapport','MAYDAY':'Mayday',
    'DIN':'Deutsches Institut für Normung','BOS':'Behörden und Organisationen mit Sicherheitsaufgaben',
    'HAMNET':'Hamnet','LPD':'Low Power Device','PMR':'P M R',
    'ITU-R':'I T U R'
  };

  t=t.replace(/(\d+[.,]?\d*)\s*kΩ/g, '$1 Kilo Ohm');
  t=t.replace(/(\d+[.,]?\d*)\s*MΩ/g, '$1 Mega Ohm');
  t=t.replace(/(\d+[.,]?\d*)\s*Ω/g, '$1 Ohm');
  t=t.replace(/kΩ/g, 'Kilo Ohm');
  t=t.replace(/MΩ/g, 'Mega Ohm');
  t=t.replace(/Ω/g, 'Ohm');

  t=t.replace(/(\d+(?:[.,]\d+)?)\s*-\s*m\s*-\s*Band\b/gi, '$1 Meter Band');
  t=t.replace(/(\d+(?:[.,]\d+)?)\s*-\s*cm\s*-\s*Band\b/gi, '$1 Zentimeter Band');
  t=t.replace(/(\d+(?:[.,]\d+)?)\s*-\s*mm\s*-\s*Band\b/gi, '$1 Millimeter Band');
  t=t.replace(/\b(\d+(?:[.,]\d+)?)\s*m\s*Band\b/gi, '$1 Meter Band');
  t=t.replace(/\b(\d+(?:[.,]\d+)?)\s*cm\s*Band\b/gi, '$1 Zentimeter Band');
  t=t.replace(/\b(\d+(?:[.,]\d+)?)\s*mm\s*Band\b/gi, '$1 Millimeter Band');

  t=t.replace(/(\d+(?:[.,]\d+)?)\s*m\b/g, (m,num,offset,full)=>{
    const after = full.slice(offset + m.length, offset + m.length + 1);
    if(/[A-Za-z]/.test(after)) return m;
    return `${num} Meter`;
  });

  // EINE Liste fuer Zahl + Einheit - sie gilt unten auch fuer den Text in
  // Klammern. Bis zum 16.09.2026 gab es dort eine zweite, aeltere Kopie,
  // und "(2 Wh sind 7200 J)" blieb halb buchstabiert (AB503).
  const EINHEIT_RE = /(\d+[.,]?\d*)\s*(GHz|MHz|MHZ|kHz|Hz|kV|MV|mV|µV|uV|kA|mA|µA|uA|MW|kW|mW|µW|uW|MOhm|kOhm|µH|uH|nH|mH|µF|uF|nF|pF|dBµV|dBm|dBi|dBd|dB|µs|μs|us|ms|km\/h|km\/s|km|cm|mm|pps|mAh|Ah|kWh|Wh|kbit|Mbit|Gbit)\b/g;
  const einheiten = (s) => s
    .replace(EINHEIT_RE, (m,num,u)=>`${num} ${map[u]||u}`)
    .replace(/(\d+[.,]?\d*)\s*W\b/g,(m,n)=>`${n} Watt`)
    .replace(/(\d+[.,]?\d*)\s*V\b/g,(m,n)=>`${n} Volt`)
    .replace(/(\d+[.,]?\d*)\s*A\b/g,(m,n)=>`${n} Ampere`)
    .replace(/(\d+[.,]?\d*)\s*J\b/g,(m,n)=>`${n} Joule`);
  t=einheiten(t);
  // Mikro-Einheiten ohne Zahl davor ("von µF nach nF") und die
  // Permeabilitaet "µr" (16.09.2026).
  t=t.replace(/µ(F|H|A|V|W|s)\b/g,(m,u)=>({F:'Mikrofarad',H:'Mikrohenry',A:'Mikroampere',V:'Mikrovolt',W:'Mikrowatt',s:'Mikrosekunden'})[u]);
  t=t.replace(/µr\b/g,'Mü r');

  // FIX Q6: Rufzeichenzusaetze "/m" (mobil) und "/mm" (maritim mobil).
  // Im Fragenkatalog geht es dabei NICHT um die Einheit "pro Meter",
  // sondern um den Zusatz am Rufzeichen - z.B. BD203: "Ein Rufzeichen mit
  // dem Zusatz „/m“ kann bei einer Amateurfunkstelle bedeuten, dass sie ..."
  // Genau deshalb darf hier nicht "pro Meter" eingesetzt werden, das wuerde
  // die Frage unverstaendlich machen. Richtig vorgelesen wird "Strich m".
  // /mm muss zuerst geprueft werden, sonst frisst die /m-Regel das erste m.
  // (Die Einheit "s/m" in NA205/NA206 steht in Klammern und wird schon
  //  weiter oben von der Klammer-Regel entfernt.)
  t=t.replace(/\/mm\b/g, ' Strich m m');
  t=t.replace(/\/m\b/g, ' Strich m');

  const isMeaningQuestion = /was bedeutet|was bedeuten|bedeutet die abkürzung|bedeuten die abkürzungen|bedeutet die q-gruppe|bedeuten die q-gruppen/i.test(text);
  const protectedKeys = new Set();
  if (isMeaningQuestion) {
    const candidates = [];
    const quoteRe = /[\"“„»«]([A-Z0-9]{1,6})[\"”"»«]/g;
    let qm;
    while ((qm = quoteRe.exec(text)) !== null) {
      candidates.push(qm[1]);
    }
    const abkRe = /Abkürzung\s+([A-Z0-9]{1,6})/gi;
    let am;
    while ((am = abkRe.exec(text)) !== null) {
      candidates.push(am[1]);
    }
    const qRe = /\b(Q[A-Z]{1,3}|[A-Z]{2,4})\b/g;
    let qm2;
    while ((qm2 = qRe.exec(text)) !== null) {
      if (map[qm2[1]] || map[qm2[1].toUpperCase()]) {
        candidates.push(qm2[1]);
      }
    }
    candidates.forEach(c => {
      if (c) protectedKeys.add(c.toUpperCase());
      if (c) protectedKeys.add(c);
    });
    ['DX','TX','RX','TRX','CW','CQ','QSO','QTH','QRG','QRM','QSB','QSL','QRZ','QSY','QRV','QRN','QRO','QRP','QRT','QRX','QRL','PSE','BK','K','R'].forEach(k=>protectedKeys.add(k));
  }

  function spellAbbr(abbr) {
    return abbr.split('').join(' ');
  }

  const keys=Object.keys(map).sort((a,b)=>b.length-a.length);
  for(const k of keys){
    if(['W','V','A'].includes(k)) continue;
    if(k.length<=2 && !['dB','AM','FM','CW','bzw','nW','pW','/m','/p','MEZ','UTC','WPM','RR','VO','DX','TX','RX','SW'].includes(k)) continue;
    if(k.includes('.') && k.length<=3) continue;
    if (protectedKeys.has(k) || protectedKeys.has(k.toUpperCase())) {
      const escaped = k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      const needsWordBound = /^[A-Za-z0-9]+$/.test(k);
      const re = needsWordBound ? new RegExp(`\\b${escaped}\\b`,'g') : new RegExp(`${escaped}`,'g');
      t=t.replace(re, spellAbbr(k));
      continue;
    }
    const escaped = k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const needsWordBound = /^[A-Za-z0-9]+$/.test(k);
    const re = needsWordBound ? new RegExp(`\\b${escaped}\\b`,'g') : new RegExp(`${escaped}`,'g');
    t=t.replace(re,map[k]);
  }
  t=t.replace(/\bbzw\.\b/g,'beziehungsweise');
  t=t.replace(/\bz\.B\.\b/g,'zum Beispiel');
  t=t.replace(/\bca\./gi,'circa');
  t=t.replace(/\bca\b/gi,'circa');
  // FIX: Sicherheitsnetz fuer "u.a." zusaetzlich zum map-Eintrag oben - deckt
  // Gross-/Kleinschreibung ("U.a." am Satzanfang) und die mit Leerzeichen
  // geschriebene Variante "u. a." ab, falls neue Fragen so formuliert sind.
  // WICHTIG: kein "\b" nach dem letzten Punkt - ein Punkt ist selbst kein
  // Wortzeichen, direkt gefolgt von einem Leerzeichen (auch kein Wortzeichen)
  // gibt es dort NIE eine Wortgrenze, das "\b" würde also nie greifen.
  // Deshalb "(?!\w)" statt "\b" am Ende.
  t=t.replace(/\bu\.\s?a\.(?!\w)/gi,'unter anderem');

  paren.forEach((p,i)=>{
    let inner=p;
    inner=inner.replace(/(\d+[.,]?\d*)\s*(MHz|kHz|Hz|GHz)\b/g,(m,num,u)=>`${num} ${map[u]||u}`);
    // Auch die uebrigen Einheiten in Klammern - "(100 V)" hiess bis zum
    // 16.09.2026 "hundert fau" (16.09.2026).
    inner=einheiten(inner);
    inner=inner.replace(/kΩ/g, 'Kilo Ohm');
    inner=inner.replace(/MΩ/g, 'Mega Ohm');
    inner=inner.replace(/Ω/g, 'Ohm');
    t=t.replace(`__P${i}__`,inner);
  });

  t=t.replace(/\s{2,}/g,' ').trim();

  console.log(`[PRE V15] ${text.slice(0,70)} -> ${t.slice(0,130)}`);
  return t;
}


// ================================================================
// PIPER STARTEN - uebernommen aus der Fassung vom 01.09.2026
// ================================================================
// Derzeit ruft es niemand auf; die Sprachausgabe laeuft ueber die
// Route /api/tts in Server.js, die Piper selbst startet. Die
// Funktion steht hier bereit, falls sie gebraucht wird.
async function piperTTS(text, voiceModel, outputWav) {
  return new Promise((resolve, reject) => {
    const piperDir = path.join(__dirname, 'piper');
    const piperExe = path.join(piperDir, process.platform === 'win32' ? 'piper.exe' : 'piper');
    
    // Stelle sicher dass Ausgabeordner existiert
    const outDir = path.dirname(outputWav);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive: true});

    const args = [
      '--model', voiceModel,
      '--output_file', outputWav
    ];

    console.log(`[TTS] Starte Piper: ${piperExe} ${args.join(' ')}`);
    
    const proc = spawn(piperExe, args, { cwd: piperDir });
    
    let stderrData = '';
    let stdoutData = '';

    proc.stdin.write(text);
    proc.stdin.end();

    proc.stdout.on('data', (d) => { stdoutData += d.toString(); });
    proc.stderr.on('data', (d) => { stderrData += d.toString(); });

    proc.on('close', (code) => {
      // Piper schreibt IMMER [info] Logs nach stderr, auch bei Erfolg!
      // Das ist kein Fehler!
      const cleanedStderr = stderrData
        .split('\n')
        .filter(line => {
          const l = line.toLowerCase();
          // Ignoriere reine Info-Logs
          if (l.includes('[info]') || l.includes('[piper]')) return false;
          if (l.trim() === '') return false;
          return true;
        })
        .join('\n');

      // Pruefe ob WAV wirklich existiert und groesser als 0 ist
      const wavExists = fs.existsSync(outputWav) && fs.statSync(outputWav).size > 1000;

      if (wavExists) {
        console.log(`[TTS] Erfolg: ${outputWav} (${fs.statSync(outputWav).size} bytes)`);
        // Auch wenn stderr Info hatte, ist es Erfolg wenn Datei da ist
        if (cleanedStderr) {
          console.log(`[TTS] Warnung (ignoriert): ${cleanedStderr.substring(0,200)}`);
        }
        resolve(outputWav);
      } else {
        // Nur echter Fehler wenn Datei fehlt UND Exit-Code !=0 oder echte Error-Meldung
        if (code !== 0 || cleanedStderr.toLowerCase().includes('error')) {
          console.error(`[TTS] Fehler Code ${code}: ${stderrData}`);
          reject(new Error(`TTS Fehler ${code}: ${cleanedStderr || stderrData}`));
        } else {
          // Fallback: trotzdem versuchen
          console.log(`[TTS] Piper Exit ${code}, aber keine kritischen Fehler, WAV fehlt? ${outputWav}`);
          reject(new Error(`TTS: Keine WAV erstellt. Log: ${stderrData.substring(0,500)}`));
        }
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Piper konnte nicht gestartet werden: ${err.message}`));
    });
  });
}

module.exports = { expandTTS, piperTTS };
