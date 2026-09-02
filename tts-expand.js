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
    'dBm':'De Be Em','dBi':'De Be I','dB':'Dezibel','µs':'Mikrosekunden','μs':'Mikrosekunden','us':'Mikrosekunden','ms':'Millisekunden',
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

  t=t.replace(/(\d+[.,]?\d*)\s*(GHz|MHz|MHZ|kHz|Hz|kV|MV|mV|µV|uV|kA|mA|µA|uA|MW|kW|mW|µW|uW|MOhm|kOhm|µH|uH|mH|µF|uF|nF|pF|dBm|dBi|dB|µs|μs|us|ms|km\/h|km\/s|km|cm|mm|pps)\b/g,(m,num,u)=>`${num} ${map[u]}`);

  t=t.replace(/(\d+[.,]?\d*)\s*W\b/g,(m,n)=>`${n} Watt`);
  t=t.replace(/(\d+[.,]?\d*)\s*V\b/g,(m,n)=>`${n} Volt`);
  t=t.replace(/(\d+[.,]?\d*)\s*A\b/g,(m,n)=>`${n} Ampere`);

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
