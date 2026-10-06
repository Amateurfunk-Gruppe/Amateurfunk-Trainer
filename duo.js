// duo.js - V15 FINAL - Einladungslink mit Tunnel-URL + WhatsApp Auto-Join
(function(){
    'use strict';
    let socket=null, roomCode=null, isHost=false, myUserId=null, duoActive=false;
    // Kommt dieser Browser von aussen - also ueber den Tunnel? Dann laeuft
    // der Trainer hier auf einem fremden Rechner, und ein eigener
    // Raum wuerde dem Gastgeber die Leitung wegziehen. Der Server sagt es
    // uns gleich beim Verbinden ('zugangsart'), und er laesst es auch gar
    // nicht erst zu; hier wird nur der Knopf entsprechend gesetzt.
    let vonAussen = false;
    // Wie viele sitzen gerade ohne Raum auf dem Server, und wie viele
    // davon sind von aussen gekommen? Der Server meldet es ('hausVolk').
    // Danach entscheidet sich, ob beim Gastgeber das Chatfenster aufgeht.
    let hausVolk = { anzahl: 0, vonAussen: 0 };
    // War dieser Client schon einmal drin? Erst dann heisst "Raum nicht
    // gefunden" wirklich "der Gastgeber hat zugemacht". Vorher heisst es
    // nur: noch nicht eroeffnet - dann wird gewartet, nicht gemeldet.
    let imRaumGewesen = false;
    // ---- Gesamt-Auswertung bleibt aktuell (04.10.2026) ----
    function auswertungOffen(){
        try{
            const m = document.getElementById('realisticExamModal');
            if(!m || !m.classList.contains('open')) return false;
            const b = document.getElementById('realisticModalBody');
            return !!(b && /Gesamt-Auswertung Gruppenraum|Rangliste – Prüfung im Gruppenraum/.test(b.textContent || ''));
        }catch(e){ return false; }
    }
    let auswertungUhr = null;
    function auswertungNachladen(){
        try{
            if(auswertungUhr || !socket || !roomCode || !auswertungOffen()) return;
            auswertungUhr = setTimeout(()=>{
                auswertungUhr = null;
                try{
                    if(!socket || !roomCode || !auswertungOffen()) return;
                    // Im Pruefungsraum steht die Rangliste nur auf Wunsch im Fenster - hier ist sie schon offen
                    if(window._duoPruefung) window._duoRanglisteGewuenscht = true;
                    socket.emit('requestFinalResults', { code: roomCode });
                }catch(e){}
            }, 700);
        }catch(e){}
    }
    let nameOffen = '';   // Name aus dem Willkommensfenster, der noch nicht im Raum angekommen ist
    let beitrittWiederholung = null;
    let beitrittVersuche = 0;
    // Wer ueber den Link kommt und "Los geht's" drueckt, bevor der Raum da
    // ist, soll nicht noch einmal klicken muessen: Sobald der Beitritt
    // gelingt, geht die Runde von selbst los.
    let startSobaldDrin = false;
    // Steht der Server fuer Besucher offen? null = noch nicht gesagt
    // (aeltere Fassung oder die erste Meldung ist noch unterwegs).
    let tuerAuf = null;
    // Wurde ohne Raum schon etwas geschrieben? Dann bleibt der Chat
    // stehen, auch wenn der Besucher wieder gegangen ist.
    let hausChatHatNachrichten = false;
    let duoUsersCache = {};
    // Anrufen im Gruppenraum (27.09.2026) - Zustand steht hier oben, weil
    // spracheSprichtGerade() und die Chatliste ihn schon frueh abfragen.
    // STUN bei Cloudflare, nicht bei Google: Die Datenschutzerklaerung
    // (support.html) nennt Cloudflare ohnehin als Weg zum Trainer und
    // verspricht "kein Google". stun.cloudflare.com ist frei und braucht
    // kein Konto.
    const ANRUF_ICE = [{ urls: ['stun:stun.cloudflare.com:3478'] }];
    const ANRUF_LISTE_MERKEN = 'duo_anrufListe';
    const anruf = { zustand: null, partner: null, name: '', pc: null, stream: null, audio: null,
                    start: 0, frist: null, zeitUhr: null, abrissUhr: null, kette: null, warteKandidaten: [],
                    stumm: false, ton: null };
    // Profilbilder der anderen im Raum (27.09.2026): Socket-Id -> data:-Adresse
    const profilbilder = {};
    let chatAmEnde = true;           // Chatliste steht unten (27.09.2026)
    const PB_MUSTER = /^data:image\/jpeg;base64,[A-Za-z0-9+\/]+={0,2}$/;
    const PB_FARBEN = ['#2563eb', '#9333ea', '#0e7490', '#c2410c', '#15803d', '#be185d', '#4d7c0f', '#1e40af'];

    let tunnelUrlCache = null;
    window._duoHasAnswered=false;

    // ===== BASIS-URL ROBUST =====
    function getBaseUrl(){
        try{ return window.location.origin; }catch(e){ return 'http://localhost:3000'; }
    }

    // ===== TUNNEL-URL: EINZIGE Quelle der Wahrheit ist tunnelUrlCache, und die wird NUR von einer
    // vom Server bestätigten Antwort gesetzt (fetchAndFillTunnelUrl / pollTunnelUrlUntilReady) oder
    // durch explizites manuelles Speichern (saveDuckDns). KEINE Fallbacks auf Eingabefeld/localStorage
    // hier mehr - genau diese Fallbacks haben eine alte, unbestätigte URL immer wieder "festgeschrieben"
    // und damit den Einladungslink dauerhaft kaputt gemacht, obwohl der Tunnel längst eine neue URL hatte.
    // ================================================================
    //  EIGENE FESTE ADRESSE
    // ----------------------------------------------------------------
    //  Dietmar am 06.09.2026: "Ich habe einen DNS bei DuckDNS erstellt.
    //  Ich kann das im Gruppenraum nicht bei dem Link eingeben."
    //
    //  Stimmt - das Feld war auf "readonly" gestellt. Es zeigte die
    //  Adresse, die cloudflared beim Start ausgewuerfelt hat, und sonst
    //  nichts. Fuer den Regelfall war das richtig: Eine von Hand
    //  eingetippte Adresse, die auf nichts zeigt, erzeugt Einladungslinks,
    //  die bei niemandem aufgehen.
    //
    //  Wer aber eine eigene feste Adresse hat - DuckDNS, ein benannter
    //  Cloudflare-Tunnel, eine eigene Domain -, will genau die im Link
    //  stehen haben. Und zwar dauerhaft: Der Wegwerf-Name von
    //  trycloudflare.com ist nach jedem Neustart ein anderer, eine
    //  App-Verknuepfung auf dem Handy zeigt danach ins Leere.
    //
    //  Ist eine eigene Adresse gesetzt, hat sie IMMER Vorrang, und keine
    //  automatische Erkennung ueberschreibt sie mehr.
    // ================================================================
    const EIGENE_ADRESSE = 'duo_eigene_adresse';

    function eigeneAdresse(){
        try{
            const v = (localStorage.getItem(EIGENE_ADRESSE) || '').trim();
            // http ist ausdruecklich erlaubt (06.09.2026). Zuerst liess das
            // Feld nur https zu - mit dem Hinweis, dass die App auf dem
            // Startbildschirm sonst nicht laeuft. Das stimmt zwar, aber es
            // machte genau den Test unmoeglich, um den es gerade geht:
            // "Kommt von aussen ueberhaupt etwas an meinem Anschluss an?"
            // Dafuer braucht es http://adresse:3000 - und der Trainer selbst
            // laeuft darueber tadellos. Nur App und Mikrofon nicht.
            return /^https?:\/\//i.test(v) ? v.replace(/\/+$/, '') : '';
        }catch(e){ return ''; }
    }

    // Das Adressfeld nur dann nachfuehren, wenn keine eigene Adresse gilt.
    function adressFeldSetzen(url){
        if(eigeneAdresse()) return;
        const inp = document.getElementById('duckDnsInput');
        if(inp) inp.value = url;
    }

    function getTunnelUrl(){
        // Die eigene Adresse gilt, auch wenn sie nur http ist - siehe
        // eigeneAdresse(). Der automatisch erkannte Tunnel dagegen muss
        // https sein, denn cloudflared liefert nichts anderes; eine
        // http-Adresse von dort waere ein Fehler.
        const eigen = eigeneAdresse();
        if(eigen) return eigen;
        return (tunnelUrlCache && tunnelUrlCache.startsWith('https://')) ? tunnelUrlCache : null;
    }

    function getPassword(){
        try{
            let pwd = document.getElementById('duoPasswordInput')?.value?.trim() || '';
            if(pwd) return pwd;
            const params=new URLSearchParams(window.location.search);
            pwd=params.get('pwd')||'';
            if(pwd) return pwd;
            const hash=new URLSearchParams(window.location.hash.substring(1));
            return hash.get('pwd')||'';
        }catch(e){ return ''; }
    }

    // ================================================================
    // Kopier-Overlay beim Ueberfahren der Links.
    //
    // Nebenbei behoben: ueber die WLAN-Adresse laeuft die Seite auf http://
    // statt https://. In einem solchen "unsicheren Kontext" stellt der Browser
    // navigator.clipboard GAR NICHT bereit - das Kopieren waere dort bisher
    // stillschweigend fehlgeschlagen. Deshalb unten ein Rueckfallweg ueber ein
    // verstecktes Textfeld, der auch auf http:// funktioniert.
    // ================================================================
    function kopierTooltipEinrichten(){
        if(document.getElementById('duoKopierTooltip')) return;
        const style=document.createElement('style');
        style.textContent =
            '#duoKopierTooltip{position:fixed;z-index:99999;pointer-events:none;display:none;' +
            'align-items:center;gap:7px;background:rgba(44,44,46,0.95);color:#fff;padding:7px 12px;' +
            'border-radius:9px;font-size:0.82rem;font-weight:600;line-height:1;white-space:nowrap;' +
            'box-shadow:0 4px 16px rgba(0,0,0,0.3);font-family:inherit;}' +
            '#duoKopierTooltip.sichtbar{display:flex;}' +
            '#duoKopierTooltip.erfolg{background:rgba(31,157,85,0.96);}' +
            '.duo-kopier-link{cursor:pointer;}';
        document.head.appendChild(style);

        const tip=document.createElement('div');
        tip.id='duoKopierTooltip';
        tip.innerHTML =
            '<svg id="duoKopierIcon" width="14" height="14" viewBox="0 0 24 24" fill="none" ' +
            'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<rect x="9" y="9" width="13" height="13" rx="2"></rect>' +
            '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>' +
            '<span id="duoKopierText">Text kopieren</span>';
        document.body.appendChild(tip);
    }

    function tooltipZeigen(x, y, text, erfolg){
        kopierTooltipEinrichten();
        const tip=document.getElementById('duoKopierTooltip');
        const txt=document.getElementById('duoKopierText');
        const icon=document.getElementById('duoKopierIcon');
        if(!tip||!txt) return;
        txt.textContent = text || 'Text kopieren';
        tip.classList.toggle('erfolg', !!erfolg);
        if(icon) icon.style.display = erfolg ? 'none' : '';
        tip.classList.add('sichtbar');
        // Neben dem Mauszeiger platzieren, aber nie aus dem Fenster laufen lassen
        const breite = tip.offsetWidth || 130, hoehe = tip.offsetHeight || 30;
        let links = x + 16, oben = y + 16;
        if(links + breite > window.innerWidth - 8)  links = window.innerWidth - breite - 8;
        if(oben  + hoehe  > window.innerHeight - 8) oben  = y - hoehe - 10;
        tip.style.left = Math.max(8, links) + 'px';
        tip.style.top  = Math.max(8, oben)  + 'px';
    }

    function tooltipVerbergen(){
        const tip=document.getElementById('duoKopierTooltip');
        if(tip){ tip.classList.remove('sichtbar','erfolg'); }
    }

    // Kopiert zuverlaessig - auch auf http:// (WLAN-Adresse), wo es
    // navigator.clipboard nicht gibt.
    async function inZwischenablage(text){
        try{
            if(navigator.clipboard && window.isSecureContext){
                await navigator.clipboard.writeText(text);
                return true;
            }
        }catch(e){ /* faellt unten durch */ }
        try{
            const feld=document.createElement('textarea');
            feld.value=text;
            feld.setAttribute('readonly','');
            feld.style.position='fixed';
            feld.style.top='-1000px';
            feld.style.opacity='0';
            document.body.appendChild(feld);
            feld.select();
            feld.setSelectionRange(0, text.length);
            const ok=document.execCommand('copy');
            document.body.removeChild(feld);
            return ok;
        }catch(e){ return false; }
    }

    // Macht ein Element kopierbar und haengt das Overlay dran.
    function kopierbarMachen(el, text, beschriftung){
        if(!el) return;
        kopierTooltipEinrichten();
        el.classList.add('duo-kopier-link');
        const label = beschriftung || 'Text kopieren';
        el.onmouseenter = e => tooltipZeigen(e.clientX, e.clientY, label, false);
        el.onmousemove  = e => {
            const tip=document.getElementById('duoKopierTooltip');
            if(tip && tip.classList.contains('erfolg')) return;   // Erfolgsmeldung nicht ueberschreiben
            tooltipZeigen(e.clientX, e.clientY, label, false);
        };
        el.onmouseleave = () => tooltipVerbergen();
        el.onclick = async function(e){
            e.preventDefault();
            const ok = await inZwischenablage(text);
            if(ok){
                tooltipZeigen(e.clientX, e.clientY, '✓ Kopiert', true);
                setTimeout(tooltipVerbergen, 1400);
            } else {
                tooltipVerbergen();
                window.prompt('Link kopieren (Strg+C):', text);
            }
        };
    }

    // ================================================================
    // Tastatur-Smileys in Bildzeichen umwandeln.
    //
    // Wichtig fuer die Sicherheit: Diese Ersetzung laeuft NACH escapeHtml,
    // also auf bereits entschaerftem Text. Sie fuegt nur harmlose
    // Schriftzeichen ein und kann kein HTML erzeugen.
    // Ersetzt wird nur, wenn das Smiley allein steht (davor Zeilenanfang oder
    // Leerzeichen, danach Leerzeichen oder Ende). Sonst wuerde z.B. in einer
    // Adresse wie "http://..." mitten im Wort etwas zerlegt.
    // ================================================================
    const SMILEYS = [
        // Laengere Schreibweisen zuerst, sonst greift die kuerzere vorher.
        // Achtung: escapeHtml macht aus ' die Folge &#39; und aus < die Folge
        // &lt; - beide Schreibweisen muessen deshalb hier stehen.
        [':&#39;(', '😢'], [":'(", '😢'],
        [':-)', '🙂'], [':)', '🙂'], ['=)', '🙂'],
        [':-D', '😃'], [':D', '😃'],
        [';-)', '😉'], [';)', '😉'],
        [':-(', '🙁'], [':(', '🙁'],
        [':-O', '😮'], [':O', '😮'], [':-o', '😮'], [':o', '😮'],
        [':-*', '😘'], [':*', '😘'],
        [':-P', '😛'], [':P', '😛'], [':p', '😛'],
        [':-|', '😐'], [':|', '😐'],
        ['^^', '😊'], ['^_^', '😊'],
        ['xD', '😆'], ['XD', '😆'],
        // Nach dem Escapen steht statt "<3" die Zeichenfolge "&lt;3"
        ['&lt;3', '❤️'],
        [':@', '😠'], ['8-)', '😎'], ['8)', '😎']
    ];
    const SMILEY_KARTE = {};
    SMILEYS.forEach(([z, e]) => { SMILEY_KARTE[z] = e; });
    const SMILEY_RE = new RegExp(
        '(^|\\s)(' + SMILEYS.map(([z]) => z.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?=\\s|$)',
        'g'
    );

    function smileysErsetzen(text){
        try{
            return String(text).replace(SMILEY_RE, (treffer, davor, zeichen) =>
                davor + (SMILEY_KARTE[zeichen] || zeichen));
        }catch(e){ return text; }
    }
    window.duoSmileys = smileysErsetzen;   // fuer die Selbstpruefung im Test

    function escapeHtml(s){ return String(s||'').replace(/[&<>\"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

    function getDuoUserName(){
        try{
            const inp=document.getElementById('duoUserNameInput');
            let name=inp?.value?.trim()||'';
            if(name){ try{localStorage.setItem('duo_userName',name);}catch(e){} return name; }
            name=localStorage.getItem('duo_userName')||'';
            if(name) return name;
            const sel=document.getElementById('userSelect');
            if(sel?.value){
                const opt=sel.options[sel.selectedIndex];
                return opt?opt.textContent.replace('👤','').trim():sel.value;
            }
        }catch(e){}
        return 'Gast';
    }

    window.updateDuoNameHint=function(){
        const inp=document.getElementById('duoUserNameInput');
        const hint=document.getElementById('duoNameHint');
        if(!hint) return;
        hint.textContent = inp?.value?.trim() ? `Gespeichert als "${inp.value.trim()}"` : 'Wird den anderen im Raum angezeigt';
    };

    window.updateDuoConfigVisibility=function(){
        // Konfiguration bleibt immer sichtbar - sie ist ab Raumerstellung fix und über updateDuoConfigAccess gesperrt
        const cfg=document.getElementById('duoAccConfig');
        if(cfg) cfg.style.display = '';
    };
    window.updateDuoCreateButtonVisibility=function(){
        const c=document.getElementById('duoCreateRoomBtn'), j=document.getElementById('duoJoinRoomBtn');
        if(!c||!j) return;
        const inRoom=!!roomCode;
        // "Raum beitreten" gibt es nicht mehr, und "Jetzt starten" erst, wenn
        // ein Raum da ist (29.09.2026). Dietmar: "Jetzt starten, wenn kein
        // Raum erstellt wurde ist Bloedsinn. Raum beitreten, braucht es
        // nicht. Ich verteile die Links dazu." - "Aus Raum erstellen, wird
        // Jetzt Starten."
        c.style.display=inRoom?'none':''; j.style.display='none';
        // Ohne Raum auch keine Namensliste mehr (29.09.2026): Nach dem
        // Schliessen stand auf Dietmars Bild noch "Dietmar Host (Du)" und
        // "Alle Teilnehmer haben denselben Dateistand" unter "Im Raum",
        // obwohl der Link schon "Noch kein Raum" sagte.
        // Der Hinweis "Das ist nicht dein Trainer" gilt nur vor dem Beitreten.
        // Im Raum stand er zwischen "Jetzt starten" und machte "Schliessen"
        // riesig - Dietmar: "Bei einem Teilnehmer, ist der Button Schliessen
        // soooo gross".
        try{ const dh=document.getElementById('duoDemoHinweis'); if(dh) dh.style.display=inRoom?'none':''; }catch(e){}
        if(!inRoom){
            try{ const ul=document.getElementById('duoUsers'); if(ul && ul.children.length) updateRoomUsers({}); }catch(e){}
            try{ const ah=document.getElementById('duoAbgleichHinweis'); if(ah) ah.innerHTML=''; }catch(e){}
        }
        const st=document.getElementById('duoStartBtn'); if(st) st.style.display=inRoom?'':'none';
        // Der Kasten um die beiden Knoepfe steht als Fusszeile der linken
        // Spalte. Sind beide Knoepfe weg, soll auch der Kasten weg - sonst
        // bleibt eine leere Zeile mit Innenabstand stehen und macht die
        // Spalte laenger, als ihr Inhalt es verlangt.
        // Seit 29.09.2026 bleibt der Kasten stehen: Laeuft ein Raum, ziehen
        // "Jetzt starten", "Neue Runde" und "Auswertung" hinein, rechts
        // bleibt nur "Schliessen". Dietmar, mit rotem Rahmen um die leere
        // Stelle links: "Raum erstellen und links kommt jetzt starten, neue
        // Runde und Auswertung. Das muss nach links. Und schliessen rechts
        // davon". Am Handy (eine Spalte) bleibt alles wie bisher unten.
        try{
            const kasten = c.closest('.duo-knopfreihe-links');
            const rechts = document.querySelector('#duoModal .duo-knopfreihe');
            const schliessen = document.getElementById('duoSchliessenBtn');
            const knoepfe = ['duoStartBtn','duoNeueRundeBtn','duoAuswertungBtn'].map(id => document.getElementById(id)).filter(Boolean);
            const zweiSpalten = !document.body.classList.contains('schmal') && window.innerWidth > 760;
            if(kasten && rechts && schliessen){
                // Im Raum stehen alle vier in EINER Reihe ueber beide Spalten -
                // Dietmar, zum Bild mit der Luecke zwischen "Auswertung" und
                // "Schliessen": "Auf Bild 2 ist da so eine grosse Luecke."
                if(inRoom && zweiSpalten){
                    knoepfe.concat([schliessen]).forEach(k => { if(k.parentNode !== kasten) kasten.appendChild(k); });
                    kasten.classList.add('mit-start'); rechts.classList.remove('nur-schliessen'); rechts.classList.add('leer');
                } else {
                    if(schliessen.parentNode !== rechts) rechts.appendChild(schliessen);
                    rechts.classList.remove('leer');
                    knoepfe.forEach(k => { if(k.parentNode !== rechts) rechts.insertBefore(k, schliessen); });
                    kasten.classList.remove('mit-start');
                    // Ohne Raum steht rechts ohnehin nur "Schliessen".
                    rechts.classList.toggle('nur-schliessen', !inRoom && zweiSpalten);
                }
            }
            if(kasten) kasten.classList.toggle('leer', inRoom && !kasten.classList.contains('mit-start'));
        }catch(e){}
    };
    // Jeder Teilnehmer startet für sich selbst - kein Warten auf den Host, kein Warten auf andere
    window.updateDuoStartButton=function(){
        const btn=document.getElementById('duoStartBtn');
        if(!btn) return;
        if(!roomCode){ btn.disabled=true; btn.innerHTML='<i class="fas fa-play"></i> Jetzt starten'; btn.style.opacity='0.6'; return; }
        btn.disabled=false; btn.innerHTML='<i class="fas fa-play"></i> Jetzt starten'; btn.style.opacity='1';
    };
    // Fragen-Konfiguration wird EINMAL beim Erstellen des Raums festgelegt und danach für alle gesperrt,
    // damit garantiert jeder Teilnehmer exakt die gleichen Fragen bekommt.
    // Wie viele andere sind ausser mir im Raum?
    function andereImRaum(){
        try{ return Object.keys(duoUsersCache||{}).filter(id => id !== myUserId).length; }
        catch(e){ return 0; }
    }

    // KORREKTUR: Vorher war die Auswahl gesperrt, sobald ein Raum bestand -
    // ohne Erklaerung und ohne Weg, sie noch zu aendern. Der Grund fuer die
    // Sperre ist richtig (alle sollen dieselben Fragen bekommen), sie greift
    // aber jetzt erst, wenn wirklich jemand anderes im Raum ist.
    window.updateDuoConfigAccess=function(){
        const c=document.getElementById('duoFilterCount'), p=document.getElementById('duoFilterPart');
        const haken=document.getElementById('duoPruefungCheck');
        const hinweis=document.getElementById('duoConfigHinweis');
        const imRaum = !!roomCode;
        const gesperrt = imRaum && (!isHost || andereImRaum() > 0);
        const pruefung = pruefungGewaehlt();
        [c,p].forEach(el=>{
            if(!el) return;
            // Im Pruefungsraum sind Anzahl und Bereich festgelegt (3 x 25,
            // alle drei Teile) - die Felder bleiben stehen, damit man sieht,
            // was sonst gelten wuerde, sind aber nicht zu bedienen.
            const aus = gesperrt || pruefung;
            el.disabled = aus;
            el.style.opacity = aus ? '0.5' : '1';
            el.style.cursor = aus ? 'not-allowed' : 'pointer';
        });
        if(haken){
            haken.disabled = gesperrt;
            const zeile = haken.closest('label');
            if(zeile){ zeile.style.opacity = gesperrt ? '0.6' : '1'; zeile.style.cursor = gesperrt ? 'not-allowed' : 'pointer'; }
        }
        if(hinweis){
            if(!imRaum){
                hinweis.textContent = 'Wird beim Erstellen aus dem Hauptmenü übernommen – hier änderbar.';
                hinweis.style.color = 'var(--muted)';
            } else if(!gesperrt){
                hinweis.textContent = 'Änderungen wirken sofort – möglich, solange du allein im Raum bist.';
                hinweis.style.color = 'var(--muted)';
            } else if(!isHost){
                hinweis.textContent = 'Nur der Host legt die Konfiguration fest.';
                hinweis.style.color = '#8a6d00';
            } else {
                hinweis.textContent = 'Gesperrt, weil bereits jemand im Raum ist – so bekommen alle dieselben Fragen.';
                hinweis.style.color = '#8a6d00';
            }
        }
    };

    // Aenderung an den Auswahlfeldern an den Server melden, wenn ein Raum besteht
    function konfigAenderungMelden(){
        if(!roomCode || !socket || !isHost) return;
        const part = document.getElementById('duoFilterPart')?.value || 'all';
        const count = document.getElementById('duoFilterCount')?.value || '25';
        const parts = part==='all' ? ['vorschriften','betrieb','technik'] : [part];
        socket.emit('duoConfigAendern', {code: roomCode, part: part, count: count, parts: parts, pruefung: pruefungGewaehlt()});
    }
    // Der Schalter "Pruefungssimulator" im Raum-Fenster (20.09.2026).
    // An = drei Boegen zu 25 Fragen, Vorschriften - Betrieb - Technik,
    // je 45 Minuten, Aufloesung erst am Ende. Anzahl und Bereich gelten
    // dann nicht; die Felder werden ausgegraut (pruefungFelderNachziehen).
    function pruefungGewaehlt(){
        try{ return !!document.getElementById('duoPruefungCheck')?.checked; }catch(e){ return false; }
    }
    window.duoPruefungGewaehlt = pruefungGewaehlt;
    function pruefungFelderNachziehen(){
        const an = pruefungGewaehlt();
        ['duoFilterCount','duoFilterPart'].forEach(id=>{
            const el=document.getElementById(id);
            if(!el) return;
            el.dataset.pruefungAus = an ? '1' : '';
        });
        try{ if(typeof window.updateDuoConfigSummary==='function') window.updateDuoConfigSummary(); }catch(e){}
        try{ window.updateDuoConfigAccess(); }catch(e){}
    }
    window.pruefungFelderNachziehen = pruefungFelderNachziehen;
    function konfigFelderVerdrahten(){
        const haken=document.getElementById('duoPruefungCheck');
        if(haken && !haken.dataset.duoVerdrahtet){
            haken.dataset.duoVerdrahtet='1';
            haken.addEventListener('change', ()=>{ pruefungFelderNachziehen(); konfigAenderungMelden(); });
            pruefungFelderNachziehen();
        }
        ['duoFilterCount','duoFilterPart'].forEach(id=>{
            const el=document.getElementById(id);
            if(!el || el.dataset.duoVerdrahtet) return;
            el.dataset.duoVerdrahtet='1';
            el.addEventListener('change', konfigAenderungMelden);
        });
    }

    // ----------------------------------------------------------------
    //  EINE KENNUNG JE SEITENAUFRUF                      (23.09.2026)
    //  Dietmar: "Neue Benutzer sollten nicht sehen, was davor schon
    //  geschrieben wurde."
    //
    //  Der Server zeigt jedem nur den Chat seit seiner Ankunft. Damit er
    //  einen kurzen Leitungsabriss (gleiche Seite, neue Verbindung) von
    //  einem Neuladen (neuer Besucher) unterscheiden kann, wuerfelt die
    //  Seite beim Laden diese Kennung aus. Sie steht NUR hier im
    //  Speicher der Seite - nicht im localStorage, nicht im
    //  sessionStorage -, und ist beim Neuladen deshalb eine andere.
    // ----------------------------------------------------------------
    const CHAT_SITZUNG = (function(){
        try{
            const a = new Uint8Array(16);
            crypto.getRandomValues(a);
            return Array.from(a, function(b){ return b.toString(16).padStart(2, '0'); }).join('');
        }catch(e){ return ''; }
    })();

    // ----------------------------------------------------------------
    //  EINE KENNUNG JE GERAET                            (05.10.2026)
    //  Anders als CHAT_SITZUNG bleibt sie auch nach dem Neuladen gleich -
    //  daran erkennt der Server einen Teilnehmer wieder, dessen Seite
    //  neu geladen wurde, und gibt ihm seine Antworten zurueck (Dietmar:
    //  "sie muss neu anfangen"). Sie sagt nichts ueber die
    //  Person, ist nur eine Zufallszahl und bleibt im Browser.
    // ----------------------------------------------------------------
    const GERAET_KENNUNG = (function(){
        try{
            let k = localStorage.getItem('duo_geraet') || '';
            if(!/^[0-9a-f]{32}$/.test(k)){
                const a = new Uint8Array(16); crypto.getRandomValues(a);
                k = Array.from(a, function(b){ return b.toString(16).padStart(2, '0'); }).join('');
                localStorage.setItem('duo_geraet', k);
            }
            return k;
        }catch(e){ return ''; }
    })();

    function ensureSocket(){
        return new Promise((resolve,reject)=>{
            if(socket?.connected) return resolve(socket);
            const load=()=>{
                if(!window.io){ reject(new Error('Socket.IO fehlt')); return; }
                try{
                    // auth.sitzung: siehe CHAT_SITZUNG oben (23.09.2026)
                    socket=io(getBaseUrl(),{transports:['websocket','polling'], timeout:5000, auth:{ sitzung: CHAT_SITZUNG, geraet: GERAET_KENNUNG }});
                    bindEvents(); resolve(socket);
                }catch(e){ reject(e); }
            };
            if(!window.io){
                const s=document.createElement('script');
                // FIX W17: Client vom eigenen Server statt aus dem Internet-CDN.
                // socket.io liefert den passenden Client automatisch unter
                // /socket.io/socket.io.js aus - lokal, immer versionsgleich zum
                // Server und ohne Internetverbindung nutzbar. Vorher funktionierte
                // der Gruppenraum ohne Internet auch im LAN nicht, und der
                // CDN-Client 4.7.5 passte nicht zum Server 4.8.x.
                s.src='/socket.io/socket.io.js';
                s.onload=load;
                s.onerror=()=>{
                    // Notfalls doch das CDN versuchen (z.B. wenn jemand die
                    // Seite ohne laufenden Server aus der Datei heraus oeffnet)
                    console.warn('[DUO] /socket.io/socket.io.js nicht erreichbar, versuche CDN');
                    const cdn=document.createElement('script');
                    cdn.src='https://cdn.socket.io/4.8.1/socket.io.min.js';
                    cdn.onload=load;
                    cdn.onerror=()=>reject(new Error('Socket.IO nicht ladbar'));
                    document.head.appendChild(cdn);
                };
                document.head.appendChild(s);
            } else load();
        });
    }

    // ===== FIX: Einladungslink mit Tunnel-URL =====
    function updateLinkWithTunnel(){
        try{
            const linkEl=document.getElementById('duoLink');
            const roomCodeEl=document.getElementById('duoRoomCode');
            const localLinkEl=document.getElementById('duoLocalLink');
            if(!linkEl) return;

            if(!roomCode){
                linkEl.textContent='Noch kein Raum';
                linkEl.href='#';
                linkEl.style.color='#666';
                if(roomCodeEl) roomCodeEl.textContent='---';
                if(localLinkEl) localLinkEl.style.display='none';
                return;
            }

            // WICHTIG: Tunnel-URL als Basis nehmen! Solange sie noch nicht vom Server bestätigt ist,
            // wird bewusst KEIN fertig aussehender (aber kaputter) localhost-Link angezeigt - sonst
            // kann genau dieser kaputte Link kopiert und an Teilnehmer verschickt werden, bevor der
            // Tunnel überhaupt fertig gestartet ist (Start.bat öffnet den Browser oft schon, bevor
            // cloudflared eine URL hat).
            let tunnelUrl=null;
            try{ tunnelUrl=getTunnelUrl(); }catch(e){}

            if(!tunnelUrl){
                // FIX: Vorher stand hier dauerhaft "Tunnel startet noch..." - auch dann,
                // wenn gar kein Tunnel gestartet wurde und auch keiner starten wuerde.
                // Jetzt wird unterschieden: laeuft ein Start, oder muss man ihn ausloesen?
                linkEl.href='#';
                linkEl.style.fontWeight='600';
                linkEl.style.cursor='pointer';
                if(tunnelStartLaeuft){
                    linkEl.textContent='⏳ Tunnel startet... (Link erscheint in ein paar Sekunden von selbst)';
                    linkEl.style.color='#e67e22';
                    linkEl.onclick=function(e){ e.preventDefault(); };
                } else {
                    linkEl.textContent='▶ Hier klicken, um den Einladungslink zu erzeugen (startet den Tunnel)';
                    linkEl.style.color='#0f2745';
                    linkEl.onclick=function(e){ e.preventDefault(); tunnelBeiBedarfStarten(); };
                }
                if(roomCodeEl) roomCodeEl.textContent=roomCode;
                // Auch ohne Tunnel ist der Raum im eigenen Netz nutzbar
                zeigeLanLink(localLinkEl, getPassword());
                return;
            }

            // Link erst herausgeben, wenn der Server ihn bestaetigt hat.
            //
            // AUSNAHME: eine eigene feste Adresse. Die kann der Server gar
            // nicht pruefen - er kennt nur seinen eigenen Tunnel. Ohne diese
            // Ausnahme haenge der Link fuer immer auf "wird geprueft", und
            // der Gastgeber bekaeme nie einen zum Verschicken. Wer eine eigene
            // Adresse eintraegt, sagt damit: die stimmt, ich habe sie
            // eingerichtet.
            const z = eigeneAdresse() ? 'ok' : tunnelGeprueft.zustand;
            if(z === 'laeuft' || z === 'unbekannt'){
                linkEl.href='#';
                linkEl.textContent='🔎 Link wird geprueft... (ca. 15-40 Sekunden, bitte noch nicht kopieren)';
                linkEl.style.color='#e67e22';
                linkEl.style.fontWeight='600';
                linkEl.style.cursor='default';
                linkEl.onclick=function(e){ e.preventDefault(); };
                if(roomCodeEl) roomCodeEl.textContent=roomCode;
                zeigeLanLink(localLinkEl, getPassword());
                aufTunnelPruefungWarten();
                return;
            }
            if(z === 'nicht_registriert'){
                linkEl.href='#';
                linkEl.textContent='⚠️ Tunnel nicht zustande gekommen - hier klicken zum erneuten Versuch';
                linkEl.style.color='#c0392b';
                linkEl.style.fontWeight='600';
                linkEl.onclick=function(e){ e.preventDefault(); tunnelGeprueft={zustand:'unbekannt',text:''}; tunnelUrlCache=null; tunnelBeiBedarfStarten(); };
                if(roomCodeEl) roomCodeEl.textContent=roomCode;
                zeigeLanLink(localLinkEl, getPassword());
                return;
            }

            let base=tunnelUrl;
            base=base.replace(/\/$/, '');

            const pwd=getPassword();
            // FIX W20: Passwort in den Fragment-Teil (#) statt in den Query-String.
            // Alles hinter # wird vom Browser NICHT an den Server oder an Proxys
            // uebertragen und landet damit nicht in Server-Logs oder Referrern.
            // getPassword() liest den Hash-Parameter bereits aus (siehe oben).
            // Ein Schraegstrich vor dem Fragezeichen: "https://name.de?duo=X"
            // ist zwar gueltig, sieht aber falsch aus und wird von manchen
            // Messengern nicht als Link erkannt.
            if(!/\/[^\/]*$/.test(base.replace(/^https?:\/\//, ''))) base += '/';
            let link=base+'?duo='+encodeURIComponent(roomCode);
            if(pwd) link+='#pwd='+encodeURIComponent(pwd);

            // Link setzen
            linkEl.href=link;
            linkEl.textContent=link;
            linkEl.style.color='#0f2745';
            linkEl.style.fontWeight='700';
            linkEl.style.wordBreak='break-all';
            linkEl.style.cursor='pointer';
            if(roomCodeEl) roomCodeEl.textContent=roomCode;
            const statusEl = document.getElementById('duckDnsHint');
            if(statusEl){
                if(z === 'ok'){
                    statusEl.innerHTML = '<span style="color:#1f9d55;">✅ Link geprueft - von aussen erreichbar. Jetzt kann er verschickt werden.</span>';
                } else if(z === 'nur_lokal_blind'){
                    statusEl.innerHTML = '<span style="color:#8a6d00;">⚠️ Der Link ist fuer ANDERE erreichbar, aber dieser PC kann ihn wegen DNS gerade nicht oeffnen.<br>Abhilfe hier: Eingabeaufforderung oeffnen, <code>ipconfig /flushdns</code> ausfuehren. Zum Verschicken ist der Link in Ordnung.</span>';
                }
            }

            zeigeLanLink(localLinkEl, pwd);

            console.log('[DUO] Einladungslink generiert:', link, 'Tunnel:', tunnelUrl||'lokal');

            // Klick kopiert, beim Ueberfahren erscheint das Kopier-Overlay
            kopierbarMachen(linkEl, link, 'Einladungslink kopieren');

        }catch(e){
            console.error('[DUO] updateLink Fehler:', e);
            try{
                const linkEl=document.getElementById('duoLink');
                if(linkEl && roomCode){
                    const fb=getBaseUrl()+'?duo='+roomCode;
                    linkEl.href=fb; linkEl.textContent=fb;
                }
            }catch(e2){}
        }
    }

    // Zeigt den Link fuers eigene Netz - der funktioniert ohne Cloudflare,
    // ohne DNS und ohne Internet, solange alle im selben WLAN sind.
    function zeigeLanLink(el, pwd){
        if(!el) return;
        if(!roomCode || !lanAdresse){ el.style.display='none'; return; }
        const link = lanAdresse + '?duo=' + encodeURIComponent(roomCode) + (pwd ? '#pwd=' + encodeURIComponent(pwd) : '');
        el.href = link;
        el.textContent = '📶 Im gleichen WLAN: ' + link;
        el.title = 'Diese Adresse funktioniert ohne Tunnel und ohne Internet - fuer alle, die im selben Netz sind.';
        el.style.display = 'block';
        el.style.wordBreak = 'break-all';
        kopierbarMachen(el, link, 'WLAN-Link kopieren');
    }

    function updateRoomUsers(users){
        if(!users) users=duoUsersCache;
        if(!users) return;
        duoUsersCache=users;
        try{ anrufListeZeichnen(); }catch(e){}
        const el=document.getElementById('duoUsers');
        if(!el) return;
        let html='';
        Object.entries(users).forEach(([id,u])=>{
            const isMe=id===myUserId;
            const name=escapeHtml(u.name||u.userName||'Benutzer');
            const isHostUser=id===window._duoHostId;
            let kick=isHost&&!isMe?`<button onclick="window.duo.kickUser('${id}')" style="background:#d9403a;color:white;border:none;padding:2px 8px;border-radius:6px;cursor:pointer;font-size:0.65rem;margin-left:8px;">🚫 Entfernen</button>`:'';
            html+=`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:${isMe?'#eef5ff':'white'};border-radius:8px;border:1px solid ${isMe?'#0f2745':'#e3e9f3'};margin-bottom:4px;flex-wrap:wrap;gap:4px;"><span style="font-weight:${isMe?'700':'500'};font-size:0.85rem;word-break:break-word;">${isMe?'👤':'👥'} ${name} ${isHostUser?'<span style="background:#0f2745;color:white;padding:1px 6px;border-radius:8px;font-size:0.6rem;margin-left:4px;">Host</span>':''} ${isMe?'<span style="color:#0f2745;">(Du)</span>':''}</span><span style="font-size:0.7rem;color:#1f9d55;">${kick}</span></div>`;
        });
        el.innerHTML=html;
    }

    // ================================================================
    // TEILNEHMER-KNOPF: zeigt jederzeit (auch mitten in der Pruefung, ohne
    // irgendwen zu stoeren) alle Teilnehmer samt Auswertung und Zeit an.
    // Wird neben dem "Raum"-Knopf im Kopfbereich eingehaengt. Die Zahl am
    // Knopf zaehlt live mit, wie viele Teilnehmer schon fertig sind - dafuer
    // muss niemand extra klicken, das kommt per 'duoTeilnehmerUebersicht'
    // vom Server (siehe sendeTeilnehmerUebersicht in Server.js).
    // ================================================================
    let teilnehmerTickHandle = null;

    function teilnehmerKnopfSicherstellen(){
        if(document.getElementById('duoTeilnehmerBtn')) return;
        const raumBtn = document.getElementById('duoRoomBtn');
        if(!raumBtn || !raumBtn.parentNode) return;
        const btn = document.createElement('button');
        btn.id = 'duoTeilnehmerBtn';
        btn.className = 'btn';
        btn.type = 'button';
        btn.style.cssText = 'display:none;background:#0e9aa7;color:white;padding:0.35rem 0.8rem;min-height:32px;font-size:0.78rem;font-weight:700;position:relative;margin-left:6px;';
        btn.setAttribute('data-tooltip','Teilnehmer, Auswertung und benötigte Zeit anzeigen');
        btn.innerHTML = '<i class="fas fa-user-check"></i> Teilnehmer ' +
            '<span id="duoTeilnehmerBadge" style="display:none;background:#e74c3c;color:white;border-radius:10px;padding:1px 7px;font-size:0.65rem;font-weight:800;margin-left:4px;">0</span>';
        btn.addEventListener('click', function(){ window.duo.teilnehmerOeffnen(); });
        raumBtn.insertAdjacentElement('afterend', btn);
    }

    function teilnehmerKnopfEinblenden(sichtbar){
        teilnehmerKnopfSicherstellen();
        const btn = document.getElementById('duoTeilnehmerBtn');
        if(btn) btn.style.display = sichtbar ? 'inline-flex' : 'none';
        if(!sichtbar){ window.duo.teilnehmerSchliessen(); }
    }

    function teilnehmerModalSicherstellen(){
        if(document.getElementById('duoTeilnehmerModal')) return;
        const overlay = document.createElement('div');
        overlay.id = 'duoTeilnehmerModal';
        overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(15,39,69,0.75);z-index:99997;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(4px);';
        overlay.innerHTML =
            '<div style="background:var(--card-bg,#fff);color:var(--ink,#0f2745);border-radius:18px;max-width:540px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 24px 60px rgba(0,0,0,0.4);padding:1.2rem;box-sizing:border-box;">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.9rem;">' +
                '<h3 style="margin:0;font-size:1.05rem;"><i class="fas fa-user-check" style="color:#0e9aa7;"></i> Teilnehmer &amp; Auswertung</h3>' +
                '<button type="button" onclick="window.duo.teilnehmerSchliessen()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:inherit;line-height:1;">&times;</button>' +
              '</div>' +
              '<div id="duoTeilnehmerListe"></div>' +
              '<div style="margin-top:0.8rem;font-size:0.68rem;color:var(--muted,#888);text-align:center;">Aktualisiert sich automatisch, sobald jemand startet oder fertig wird. Stört niemanden - es öffnet sich bei niemand anderem ein Popup.</div>' +
            '</div>';
        overlay.addEventListener('click', function(e){ if(e.target===overlay) window.duo.teilnehmerSchliessen(); });
        document.body.appendChild(overlay);
    }

    function teilnehmerZeitText(ms, laeuftNoch){
        if(ms==null) return laeuftNoch ? 'läuft...' : '–';
        const sek = Math.max(0, Math.floor(ms/1000));
        const m = Math.floor(sek/60), s = sek%60;
        const txt = m + ':' + String(s).padStart(2,'0') + ' Min';
        return laeuftNoch ? ('läuft: ' + txt) : txt;
    }

    function teilnehmerStatusHtml(t){
        if(!t.finished){
            return t.gestartet
                ? '<span style="color:var(--muted,#888);">läuft noch</span>'
                : '<span style="color:var(--muted,#888);">noch nicht gestartet</span>';
        }
        if(t.examStatus==='bestanden') return '<span style="color:#1f9d55;font-weight:700;white-space:nowrap;"><i class="fas fa-check-circle"></i> Bestanden</span>';
        if(t.examStatus==='nachpruefung') return '<span style="color:#b8860b;font-weight:700;white-space:nowrap;"><i class="fas fa-exclamation-triangle"></i> Grauzone</span>';
        return '<span style="color:#c0392b;font-weight:700;white-space:nowrap;"><i class="fas fa-times-circle"></i> Nicht bestanden</span>';
    }

    function teilnehmerListeRendern(){
        const el = document.getElementById('duoTeilnehmerListe');
        if(!el) return;
        const liste = window.duoTeilnehmerUebersichtData || [];
        if(!liste.length){ el.innerHTML = '<div style="text-align:center;color:var(--muted,#888);padding:1rem;">Noch keine Teilnehmer-Daten.</div>'; return; }
        el.innerHTML = liste.map(function(t){
            const isMe = t.userId === myUserId;
            // Richtig UND falsch zeigen. Nur "27/50 richtig" laesst offen, ob die
            // fehlenden 23 danebengingen oder noch gar nicht dran waren - gerade
            // bei einer laufenden Runde ist das ein Unterschied.
            const falsch = (typeof t.wrong === 'number') ? t.wrong : Math.max(0, (t.answered||0) - (t.correct||0));
            const beantwortet = (typeof t.answered === 'number') ? t.answered : ((t.correct||0) + falsch);
            const punkte = t.gestartet ? (
                '<span style="font-size:0.8rem; white-space:nowrap;">'
                + '<b style="color:#14663a;">' + (t.correct||0) + ' richtig</b>'
                + ' <span style="color:#9aa7b4;">/</span> '
                + '<b style="color:#a4262c;">' + falsch + ' falsch</b>'
                + '<span style="color:#64768e; font-size:0.72rem;"> (' + beantwortet + ' von ' + (t.total||0) + ')</span>'
                + '</span>') : '';
            const zeit = (t.gestartet) ? ('<span style="color:var(--muted,#888);font-size:0.72rem;white-space:nowrap;"><i class="fas fa-stopwatch"></i> ' + teilnehmerZeitText(t.dauerMs, t.laeuftNoch) + '</span>') : '';
            return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding:0.6rem 0.7rem;border:1px solid #e3e9f3;border-radius:10px;margin-bottom:6px;' + (isMe?'background:#eef5ff;':'') + '">' +
                '<span style="font-weight:' + (isMe?'700':'500') + ';font-size:0.85rem;word-break:break-word;">' + (isMe?'👤':'👥') + ' ' + escapeHtml(t.name) +
                (t.isHost ? ' <span style="background:#0f2745;color:white;padding:1px 6px;border-radius:8px;font-size:0.6rem;">Host</span>' : '') +
                (isMe ? ' <span style="color:#0f2745;">(Du)</span>' : '') + '</span>' +
                '<span style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' + punkte + teilnehmerStatusHtml(t) + zeit + '</span>' +
                muendlichKnopfFuer(t) +
            '</div>';
        }).join('');
    }

    // Muendliche Nachpruefung (25.09.2026): Nur der Gastgeber bekommt den
    // Knopf, und nur bei jemandem, der genau einen Teil mit 17 oder 18
    // Punkten hat. Die Teile je Teilnehmer stehen in den Daten, die der
    // Server dem Gastgeber ohnehin schickt (duoTrainerData.usersStats).
    // Ob der Knopf erscheint, entscheidet Index.html (Skript
    // "muendlicheNachpruefung") - hier wird er nur eingesetzt.
    function muendlichKnopfFuer(t){
        try{
            if(!isHost || typeof window.muendlichKursleiterKnopfHtml !== 'function') return '';
            const s = window.duoTrainerData && window.duoTrainerData.usersStats && window.duoTrainerData.usersStats[t.userId];
            if(!s) return '';
            const html = window.muendlichKursleiterKnopfHtml({ userId: t.userId, name: t.name, finished: s.finished, teile: s.teile });
            return html ? '<div style="flex-basis:100%;">' + html + '</div>' : '';
        }catch(e){ return ''; }
    }

    function teilnehmerBadgeAktualisieren(){
        const badge = document.getElementById('duoTeilnehmerBadge');
        if(!badge) return;
        const liste = window.duoTeilnehmerUebersichtData || [];
        const anzahlFertig = liste.filter(function(t){ return t.finished; }).length;
        if(anzahlFertig>0){ badge.textContent = String(anzahlFertig); badge.style.display='inline-block'; }
        else { badge.style.display='none'; }
    }

    function showRoomUI(data){
        try{
            console.log('[DUO] showRoomUI', data);
            if(data?.code) roomCode=data.code;
            if(data?.roomCode) roomCode=data.roomCode;
            if(data?.hostId){ window._duoHostId=data.hostId; isHost=data.hostId===myUserId; }
            if(data?.users){ duoUsersCache=data.users; updateRoomUsers(data.users); }
            updateLinkWithTunnel(); // WICHTIG: Nach roomCode setzen!
            chatSichtbarkeitPruefen();
            abgleichKnopfEinbauen();
            if(meinDateiStand && socket && roomCode) socket.emit('duoStandMelden', {code: roomCode, kennung: meinDateiStand});
            updateDuoConfigVisibility(); updateDuoCreateButtonVisibility(); updateDuoStartButton(); updateDuoConfigAccess();
            teilnehmerKnopfEinblenden(true);
            wacheAnzeigeStarten();
            wachHalten();
            const modal=document.getElementById('duoModal');
            if(modal){ modal.style.display='flex'; modal.style.justifyContent='center'; modal.style.alignItems='center'; }
        }catch(e){ console.error('[DUO] showRoomUI Fehler', e); }
    }

    async function fetchAndFillTunnelUrl(){
        try{
            const dot=document.getElementById('tunnelStatusDot'), hint=document.getElementById('duckDnsHint');
            if(dot) dot.style.background='#f39c12';
            if(hint) hint.textContent='🔄 Prüfe Tunnel...';
            let j=null;
            try{
                const res=await fetch('/api/tunnel-url',{cache:'no-store'});
                if(!res.ok) throw new Error('HTTP '+res.status);
                j=await res.json();
                window.__TUNNEL_URL__=j.url||null;
            }catch(err){
                console.warn('[DUO] /api/tunnel-url Fehler, nutze localStorage:', err.message);
                const cached=localStorage.getItem('duo_duckdns')||localStorage.getItem('duo_duckDnsUrl');
                if(cached){ j={url:cached, running:false, source:'localStorage', binaryExists:true}; }
                else throw err;
            }
            console.log('[DUO] Tunnel Status', j);
            // Selbsttest-Ergebnis des Servers dem Nutzer zeigen - ins Terminal
            // schaut waehrend der Nutzung niemand.
            if(j.selbsttest && j.selbsttest.zustand === 'nur_lokal_blind'){
                const h=document.getElementById('duckDnsHint');
                if(h) h.innerHTML = '<span style="color:#8a6d00;">⚠️ ' + j.selbsttest.text + '</span>';
            }
            // FIX W16: NICHT mehr blind uebernehmen. Der Server liefert unter
            // Umstaenden noch eine URL aus einem alten Logfile, obwohl gar kein
            // Tunnel mehr laeuft - genau daraus entstanden die Einladungslinks
            // mit Cloudflare Error 1033. Uebernommen wird nur eine URL, deren
            // Tunnel der Server als laufend bestaetigt.
            if(j.running && j.url) tunnelUrlCache=j.url;
            else if(!j.url) tunnelUrlCache=null;
            if(j.binaryExists===false){
                if(dot) dot.style.background='#e74c3c';
                if(hint) hint.innerHTML='❌ cloudflared.exe fehlt!';
                return;
            }
            if(j.url){
                // FIX: tunnelUrlCache MUSS mit der frischen Server-URL überschrieben werden, sonst
                // gewinnt für immer die alte, aus localStorage vorgeladene URL (Ursache für Error 1033
                // bei alten Einladungs-Links, obwohl der Tunnel längst eine neue Adresse hat).
                // FIX W16: nur eine bestaetigt laufende URL wird uebernommen und gespeichert
                if(j.running){
                    tunnelUrlCache=j.url;
                    window.__TUNNEL_URL__=j.url;
                    try{ localStorage.setItem('duo_duckdns',j.url); localStorage.setItem('duo_duckDnsUrl',j.url); }catch(e){}
                }
                adressFeldSetzen(j.url);
                if(hint){
                    if(j.running){
                        hint.innerHTML='✅ <strong>Automatisch erkannt:</strong> '+j.url+'<br><span style="color:#1f9d55;">Tunnel läuft • Quelle: '+(j.source||'cache')+'</span>';
                        if(dot) dot.style.background='#1f9d55';
                    } else {
                        hint.innerHTML='⚠️ Letzte URL: '+j.url+'<br><button onclick="window.duo.startTunnelManually()" style="margin-top:6px;padding:4px 10px;border-radius:6px;border:none;background:#0f2745;color:white;cursor:pointer;font-size:0.7rem;">🚀 Tunnel neu starten</button>';
                        if(dot) dot.style.background='#f39c12';
                    }
                }
                updateLinkWithTunnel();
            } else {
                if(dot) dot.style.background='#e74c3c';
                if(hint) hint.innerHTML='❌ Kein Tunnel aktiv<br><button onclick="window.duo.startTunnelManually()" style="margin-top:8px;padding:6px 14px;border-radius:20px;border:none;background:#e67e22;color:white;cursor:pointer;">🚀 Tunnel starten</button>';
                updateLinkWithTunnel();
            }
        }catch(e){
            console.error('[DUO] fetchAndFill Fehler', e);
            const dot=document.getElementById('tunnelStatusDot'), hint=document.getElementById('duckDnsHint');
            if(dot) dot.style.background='#e74c3c';
            if(hint) hint.innerHTML='⚠️ Offline - Quiz funktioniert trotzdem';
            updateLinkWithTunnel();
        }
    }

    async function checkTunnelStatus(){ try{ await fetch('/api/tunnel-status'); }catch(e){} fetchAndFillTunnelUrl(); }
    async function startTunnelManually(){
        const hint=document.getElementById('duckDnsHint'), dot=document.getElementById('tunnelStatusDot'), btn=document.getElementById('tunnelStartBtn');
        if(hint) hint.innerHTML='🚀 Starte Tunnel... 5-15s...';
        if(dot) dot.style.background='#f39c12';
        if(btn){ btn.disabled=true; btn.innerHTML='⏳ Startet...'; }
        try{
            const res=await fetch('/api/start-tunnel',{method:'POST', cache:'no-store'});
            const j=await res.json();
            if(j.url){
                if(hint) hint.innerHTML='✅ Tunnel gestartet: '+j.url;
                if(dot) dot.style.background='#1f9d55';
                adressFeldSetzen(j.url);
                try{ localStorage.setItem('duo_duckdns',j.url); }catch(e){}
                tunnelUrlCache=j.url; window.__TUNNEL_URL__=j.url;
                updateLinkWithTunnel();
            } else {
                if(hint) hint.innerHTML='❌ Fehler: '+(j.error||'Keine URL');
                if(dot) dot.style.background='#e74c3c';
            }
        }catch(e){ if(hint) hint.innerHTML='❌ Fehler: '+e.message; } finally {
            if(btn){ btn.disabled=false; btn.innerHTML='<i class="fas fa-rocket"></i> Tunnel starten'; }
            setTimeout(()=>fetchAndFillTunnelUrl(),3000);
        }
    }

    // ================================================================
    // FIX: Tunnel bei Bedarf starten.
    //
    // Seit K2 startet der Server den Tunnel nicht mehr von allein - das war
    // Absicht (wer nur allein lernt, soll seinen PC nicht ungefragt ins
    // Internet stellen). Nur: "Raum erstellen" hat den Tunnel eben AUCH nicht
    // gestartet, sondern ausschliesslich der separate Button "Tunnel starten".
    // Dadurch blieb der Einladungslink dauerhaft auf "Tunnel startet noch..."
    // stehen. Ein Gruppenraum OHNE Tunnel ist sinnlos - deshalb ist das
    // Anlegen eines Raums jetzt selbst die ausdrueckliche Freigabe.
    // ================================================================
    let tunnelStartLaeuft = false;
    // Ergebnis des Server-Selbsttests. Erst wenn der Server bestaetigt hat, dass
    // der Link WIRKLICH traegt, wird er als fertig angezeigt.
    let tunnelGeprueft = { zustand:'unbekannt', text:'' };

    // ================================================================
    // Lokale Netzwerkadresse: der Weg ohne Cloudflare.
    // Sitzen alle im selben WLAN (Clubheim, zu Hause), braucht es keinen
    // Tunnel - dann haengt nichts an DNS, Internet oder einem fremden Dienst.
    // ================================================================
    let lanAdresse = null;
    async function lanAdresseHolen(){
        if(lanAdresse) return lanAdresse;
        try{
            const res = await fetch('/api/lan-info', {cache:'no-store'});
            if(!res.ok) return null;
            const j = await res.json();
            lanAdresse = j.empfehlung || null;
            return lanAdresse;
        }catch(e){ return null; }
    }

    async function tunnelBeiBedarfStarten(){
        // ----------------------------------------------------------------
        //  MIT EIGENER ADRESSE BRAUCHT ES KEINEN TUNNEL   (21.09.2026)
        //  ----------------------------------------------------------------
        //  Dietmar hat amateurfunk-trainer.com gekauft und richtet einen
        //  benannten Tunnel als Windows-Dienst ein. Ohne diese Abfrage
        //  haette der Trainer bei jedem "Raum erstellen" trotzdem einen
        //  Quick Tunnel hochgefahren: ein zweites cloudflared neben dem
        //  Dienst, fuer eine Adresse, die niemand benutzt.
        //
        //  Schlimmer als unnoetig: Cloudflare drosselt Quick Tunnels von
        //  derselben Adresse, wenn sich mehrere stapeln - ausgerechnet
        //  die Notloesung haette also die Hauptleitung stoeren koennen.
        // ----------------------------------------------------------------
        const fest = eigeneAdresse();
        if(fest){
            console.log('[DUO] Eigene Adresse eingetragen (' + fest + ') - kein Quick Tunnel noetig.');
            tunnelUrlCache = null;
            try{ updateLinkWithTunnel(); }catch(e){}
            return fest;
        }
        // KORREKTUR: Hier stand vorher "if(getTunnelUrl()) return getTunnelUrl();".
        // Damit hat der zweite Versuch NIE einen neuen Tunnel gestartet - sobald
        // dieser Browser-Tab einmal eine URL kannte, galt sie als gueltig, auch
        // wenn der Tunnel laengst tot war (Server neu gestartet, Rechner im
        // Standby, Tunnel abgelaufen). Der Zwischenspeicher des Browsers darf
        // nicht darueber entscheiden, ob auf dem PC ein Prozess laeuft.
        // Jetzt entscheidet immer der Server.
        if(tunnelStartLaeuft) return null;                 // jemand ist schon dran
        tunnelStartLaeuft = true;
        try{
            // Laeuft laut SERVER gerade ein Tunnel? Nur dann ist nichts zu tun.
            try{
                const res = await fetch('/api/tunnel-url', {cache:'no-store'});
                if(res.ok){
                    const j = await res.json();
                    if(j.url && j.running){
                        tunnelUrlCache = j.url; window.__TUNNEL_URL__ = j.url;
                        updateLinkWithTunnel();
                        return j.url;
                    }
                    // Kein laufender Tunnel -> eine eventuell noch im Tab
                    // haengende alte URL ist wertlos und muss weg, sonst zeigt
                    // der Einladungslink weiter auf den toten Tunnel.
                    if(tunnelUrlCache){
                        console.warn('[DUO] Alte Tunnel-URL verworfen, es laeuft kein Tunnel mehr:', tunnelUrlCache);
                        tunnelUrlCache = null; window.__TUNNEL_URL__ = null;
                        try{ localStorage.removeItem('duo_duckdns'); localStorage.removeItem('duo_duckDnsUrl'); }catch(e){}
                    }
                    if(j.binaryExists === false){
                        zeigeTunnelHinweis('❌ cloudflared.exe fehlt im Projektordner - ohne sie kann kein Einladungslink erzeugt werden.', '#e74c3c');
                        return null;
                    }
                }
            }catch(e){ /* weiter, wir versuchen zu starten */ }

            zeigeTunnelHinweis('🚀 Tunnel wird gestartet... (dauert 5-15 Sekunden)', '#f39c12');
            const res = await fetch('/api/start-tunnel', {method:'POST', cache:'no-store'});
            const j = await res.json().catch(()=>({}));
            if(res.ok && j.url){
                tunnelUrlCache = j.url; window.__TUNNEL_URL__ = j.url;
                try{ localStorage.setItem('duo_duckdns', j.url); localStorage.setItem('duo_duckDnsUrl', j.url); }catch(e){}
                adressFeldSetzen(j.url);
                zeigeTunnelHinweis('🔎 Tunnel laeuft - Link wird gerade geprueft...', '#f39c12');
                tunnelGeprueft = { zustand:'laeuft', text:'' };
                updateLinkWithTunnel();
                aufTunnelPruefungWarten();
                return j.url;
            }
            if(res.status === 403){
                zeigeTunnelHinweis('Der Tunnel kann nur direkt am Trainer-PC gestartet werden.', '#e67e22');
            } else {
                zeigeTunnelHinweis('❌ Tunnel-Start fehlgeschlagen: ' + (j.error || ('HTTP ' + res.status)), '#e74c3c');
            }
            return null;
        }catch(e){
            zeigeTunnelHinweis('❌ Tunnel-Start fehlgeschlagen: ' + e.message, '#e74c3c');
            return null;
        }finally{
            tunnelStartLaeuft = false;
            updateLinkWithTunnel();
        }
    }

    // ================================================================
    // Wartet auf das Selbsttest-Ergebnis des Servers.
    //
    // Hintergrund: Cloudflare veroeffentlicht den Namen eines neuen Tunnels erst
    // einige Sekunden nach dem Start im DNS. Wer den Link vorher kopiert oder
    // anklickt, bekommt "Server-IP-Adresse wurde nicht gefunden" - und Windows
    // merkt sich dieses "gibt es nicht" danach minutenlang. Deshalb wird der
    // Link jetzt erst herausgegeben, wenn der Server bestaetigt hat, dass er
    // von aussen antwortet.
    // ================================================================
    let pollerLaeuft = false;
    async function aufTunnelPruefungWarten(){
        if(pollerLaeuft) return;
        pollerLaeuft = true;
        try{
            for(let i=0;i<40;i++){
                try{
                    const res = await fetch('/api/tunnel-url', {cache:'no-store'});
                    if(res.ok){
                        const j = await res.json();
                        if(j.selbsttest) tunnelGeprueft = j.selbsttest;
                        if(j.url && j.running) { tunnelUrlCache = j.url; window.__TUNNEL_URL__ = j.url; }
                        updateLinkWithTunnel();
                        const z = tunnelGeprueft.zustand;
                        if(z==='ok' || z==='nur_lokal_blind' || z==='nicht_registriert') return;
                    }
                }catch(e){}
                await new Promise(r=>setTimeout(r, 2000));
            }
        } finally { pollerLaeuft = false; }
    }

    function zeigeTunnelHinweis(text, farbe){
        const hint = document.getElementById('duckDnsHint');
        const dot  = document.getElementById('tunnelStatusDot');
        if(hint) hint.textContent = text;
        if(dot && farbe) dot.style.background = farbe;
    }

    // ================================================================
    // GRUPPENCHAT - minimierbares Fenster unten rechts
    //
    // Bewusst vollstaendig hier statt in Index.html: die Datei hat schon 6.900
    // Zeilen, und der Chat gehoert logisch zum Gruppenraum. So bleibt er an
    // einer Stelle und Index.html unveraendert.
    // ================================================================
    let chatOffen = false;
    let chatUngelesen = 0;
    let chatAufgebaut = false;
    const chatGesehen = new Set();     // gegen doppelte Anzeige

    function pruefungLaeuft(){
        // Waehrend einer laufenden Pruefung soll der Chat NICHT aufspringen -
        // das reisst mitten aus der Frage. Dann nur die Zaehler-Blase.
        try{
            if(window.realisticExam && window.realisticExam.active) return true;
            if(window.examSimulatorMode) return true;
        }catch(e){}
        return false;
    }

    function chatAufbauen(){
        if(chatAufgebaut) return;
        chatAufgebaut = true;

        const style = document.createElement('style');
        // KORREKTUR: Die Farben kommen jetzt aus den Stil-Variablen des Trainers
        // (--card-bg, --ink, --line, --panel-navy) statt aus festen Werten.
        // Vorher waren die Flaechen fest hell, aber ohne eigene Textfarbe - der
        // Text erbte die des Stils. Im Dark Mode ergab das hellen Text auf
        // weisser Blase: gemessene 1,12:1 statt der noetigen 4,5:1.
        // Ueber die Variablen passt sich der Chat allen drei Stilen von selbst an.
        style.textContent = [
        /* 27.09.2026. Dietmar, mit fuenf Bildern (Grey/Orange/Blue/Green/
           Dark Mode): "Der Chat, soll die Farbe vom Mode uebernehmen. Eine
           weisse Flaeche tut in den Augen weh." und "Hier siehst du genau
           wo die Farbe fehlt." Die Karte selbst bleibt in jedem Stil
           absichtlich weiss (die "Buehne", siehe Farbstile weiter oben) -
           nur die Seite ringsum bekommt die Modusfarbe. Der Chat sitzt
           aber in genau diesem Rahmen, nicht auf der Buehne, darum jetzt
           eine eigene Variable --chat-flaeche: in Hell und Dunkel deckt sie
           sich mit --bg (passt schon), in Grau/Gruen/Blau/Orange bekommt sie
           denselben Ton wie der Seitenhintergrund dieses Stils. Eingabefeld
           und Sprechblasen bleiben weiss - "Papier ist weiss", genau wie bei
           den Antwortkacheln. */
        ':root{--chat-flaeche:var(--bg);--chat-muted:var(--muted);}',
        /* Grau ist krauftiger als die anderen drei Pastelltoene (siehe
           Farbstile oben, "deutlich dunkler als alles bisherige... deshalb
           steht auf dieser Flaeche kein Text"). Das gewoehnliche --muted
           (fuer "Noch keine Nachrichten" & Co.) faellt darauf auf 3,3:1 -
           zu wenig. --chat-muted ist nur fuer Grau dunkler nachgezogen,
           gemessen 5,4:1. */
        'body.grey{--chat-flaeche:#aab0b6;--chat-muted:#33393e;}',
        'body.green{--chat-flaeche:#eef8f2;}',
        'body.blue{--chat-flaeche:#eaf3fb;}',
        'body.orange{--chat-flaeche:#fdf3e7;}',
        /* --chat-flaeche:var(--bg) an :root wird an der Stelle ausgewertet,
           wo es steht (an <html>, mit dem HELLEN --bg) - nicht dort, wo es
           spaeter geerbt wird. body.dark aendert --bg erst an <body>, darum
           braucht der Dark Mode hier seinen eigenen Eintrag, sonst bliebe
           der Chat angedockt beim hellen Grundton haengen. */
        'body.dark{--chat-flaeche:#0d2639;--chat-muted:#dce9f2;}',
        '#duoChatBox{position:fixed;right:18px;bottom:18px;z-index:99998;width:320px;max-width:calc(100vw - 36px);',
        '  font-family:inherit;border-radius:14px;overflow:hidden;box-shadow:0 10px 34px rgba(0,0,0,0.28);',
        '  background:var(--chat-flaeche);display:none;flex-direction:column;border:1px solid var(--line);',
        '  color:var(--ink);}',
        '#duoChatBox.sichtbar{display:flex;}',
        '#duoChatKopf{background:var(--panel-navy);color:#fff;padding:10px 12px;display:flex;align-items:center;gap:8px;',
        '  cursor:pointer;user-select:none;}',
        '#duoChatKopf .titel{font-weight:700;font-size:0.88rem;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
        '#duoChatBlase{background:var(--bad);color:#fff;border-radius:999px;min-width:19px;height:19px;padding:0 5px;',
        '  font-size:0.7rem;font-weight:700;display:none;align-items:center;justify-content:center;}',
        '#duoChatBlase.sichtbar{display:flex;}',
        '#duoChatKnopf{background:transparent;border:none;color:#fff;font-size:1.05rem;cursor:pointer;line-height:1;padding:2px 4px;}',
        '#duoChatKnopf.zu{font-size:0.9rem;padding:2px 5px;}',
        '#duoChatKoerper{display:none;flex-direction:column;height:300px;}',
        '#duoChatBox.offen #duoChatKoerper{display:flex;}',
        /* 27.09.2026. Dietmar: "Der Chat, soll die Farbe vom Mode
           uebernehmen. Eine weisse Flaeche tut in den Augen weh." Bei
           vielen Nachrichten wird die Liste scrollbar - und die
           Scrollleiste hatte keine eigene Farbe, also die helle
           Windows-Standardleiste, hell/weiss und im dunklen Chat ein
           Fremdkoerper (wie vorher schon bei .progress-dots-sidebar und
           .filter-bar geloest). Jetzt duenn und in der Linienfarbe des
           jeweiligen Stils, im Dark Mode kraeftiger, damit sie noch zu
           erkennen ist. */
        '#duoChatVerlauf{flex:1;overflow-y:auto;padding:10px;background:var(--chat-flaeche);display:flex;flex-direction:column;gap:7px;',
        '  scrollbar-width:thin;scrollbar-color:var(--line) transparent;}',
        '#duoChatVerlauf::-webkit-scrollbar{width:7px;}',
        '#duoChatVerlauf::-webkit-scrollbar-thumb{background:var(--line);border-radius:10px;}',
        'body.dark #duoChatVerlauf::-webkit-scrollbar-thumb{background:#3a7ba3;}',
        'body.dark #duoChatVerlauf{scrollbar-color:#3a7ba3 transparent;}',
        '.duo-chat-zeile{max-width:85%;padding:6px 10px;border-radius:12px;font-size:0.82rem;line-height:1.35;word-break:break-word;position:relative;}',
        /* Jede Blase bringt ihre eigene Textfarbe mit - nichts wird mehr geerbt */
        '.duo-chat-fremd{align-self:flex-start;background:var(--card-bg);border:1px solid var(--line);color:var(--ink);}',
        '.duo-chat-eigen{align-self:flex-end;background:var(--panel-navy);color:#fff;}',
        '.duo-chat-willkommen{align-self:stretch;max-width:100%;background:var(--good-bg);border:1px solid var(--good);color:var(--ink);}',
        '.duo-chat-absender{display:block;font-size:0.67rem;font-weight:700;opacity:0.75;margin-bottom:2px;}',
        '.duo-chat-zeit{font-size:0.62rem;opacity:0.6;margin-left:6px;}',
        '.duo-chat-system{align-self:center;background:var(--warn-bg);border:1px solid var(--warn);color:var(--ink);font-size:0.72rem;}',
        '#duoChatLeer{color:var(--chat-muted);font-size:0.78rem;text-align:center;margin:auto;padding:0 14px;line-height:1.4;}',
        /* NEUE NACHRICHTEN UNTEN (27.09.2026). Dietmar: "Das geschriebene soll
           unten anfangen und aeltere Nachrichten sollen oben stehen. Wenn ich
           eine Nachricht schreibe, sehe ich auf das Feld ... und muss danach
           ganz nach oben schauen." Wie bei WhatsApp: Ein unsichtbarer
           Platzhalter vor der ersten Nachricht nimmt den freien Raum ein,
           die Nachrichten sitzen also unten am Eingabefeld und wandern nach
           oben weiter. Ist die Liste voll, schrumpft er auf null und es wird
           ganz normal gescrollt. Solange noch "Noch keine Nachrichten" dasteht,
           bleibt der Hinweis in der Mitte. */
        '#duoChatVerlauf::before{content:"";flex:1 0 0;margin-bottom:-7px;}',
        '#duoChatVerlauf:has(> #duoChatLeer)::before{display:none;}',
        '#duoChatEingabeZeile{display:flex;gap:6px;padding:8px;border-top:1px solid var(--line);background:var(--chat-flaeche);}',
        '#duoChatEingabe{flex:1;border:1px solid var(--line);border-radius:999px;padding:8px 12px;font-size:0.85rem;',
        '  font-family:inherit;outline:none;min-width:0;background:var(--card-bg);color:var(--ink);}',
        '#duoChatEingabe:focus{border-color:var(--panel-navy);}',
        '#duoChatSenden{background:var(--panel-navy);color:#fff;border:none;border-radius:999px;width:36px;height:36px;',
        '  cursor:pointer;font-size:0.95rem;flex-shrink:0;}',
        '#duoChatSenden:disabled{opacity:0.4;cursor:default;}',
        /* Gruen = "Link zum Herunterladen senden" (23.09.2026, siehe
           downloadKnopfZeichnen). Dasselbe Gruen wie "Server ein". */
        '#duoChatSenden.download{background:#1c7a46;}',
        '#duoChatSenden.download:hover{background:#16633a;}',
        /* Links im Chat - nur die eigenen Adressen des Trainers werden
           dazu, siehe chatLinks(). Farbe vom Text der Blase, damit sie
           auf der dunklen eigenen Blase genauso lesbar sind. */
        '.duo-chat-zeile a{color:inherit;text-decoration:underline;word-break:break-all;}',
        /* Die Haken wie bei WhatsApp (23.09.2026): einer = gesendet,
           zwei grau = angekommen, zwei blau = gelesen. */
        '.duo-chat-haken{margin-left:5px;font-size:0.72rem;letter-spacing:-3px;padding-right:3px;opacity:0.7;white-space:nowrap;cursor:default;}',
        '.duo-chat-haken.gelesen{color:#53bdeb;opacity:1;font-weight:700;}',
        /* Sprachnachrichten (23.09.2026) */
        '#duoChatMikro{background:transparent;border:1px solid var(--line);color:var(--ink);border-radius:999px;width:36px;height:36px;',
        '  cursor:pointer;font-size:0.95rem;flex-shrink:0;display:none;}',
        '#duoChatMikro:hover{border-color:var(--panel-navy);}',
        /* Das Mikrofon als gruenes Symbol (25.09.2026). Dietmar, mit einem
           Bild: "Fuer Sprachnachricht moechte ich so ein Symbol." - ein
           Standmikrofon, gruen. Vorher stand hier das Emoji. Im dunklen
           Stil ein helleres Gruen, damit es sich vom Grund abhebt. */
        '#duoChatMikro i{color:#16a34a;font-size:1.05rem;}',
        'body.dark #duoChatMikro i{color:#4ade80;}',
        /* BILDER IM CHAT (29.09.2026). Dietmar: "Bilder über dem Messenger,
           geht das auch?" Der Knopf sieht aus wie das Mikrofon daneben. */
        '#duoChatBildKnopf{background:transparent;border:1px solid var(--line);color:var(--ink);border-radius:999px;width:36px;height:36px;',
        '  cursor:pointer;font-size:0.95rem;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;}',
        '#duoChatBildKnopf:hover{border-color:var(--panel-navy);}',
        '#duoChatBildKnopf i{color:var(--panel-navy);font-size:1.02rem;}',
        'body.dark #duoChatBildKnopf i{color:#7dd3fc;}',
        '#duoChatBox.angedockt #duoChatBildKnopf{width:42px;height:42px;}',
        '#duoChatEingabeZeile.nimmt-auf #duoChatBildKnopf{display:none !important;}',
        /* Was gleich mitgeht: ein Streifen ueber dem Eingabefeld */
        '#duoChatAnhang{display:none;align-items:center;gap:8px;padding:7px 10px;border-top:1px solid var(--line);background:var(--chat-flaeche);font-size:0.76rem;color:var(--ink);}',
        '#duoChatAnhang.da{display:flex;}',
        '#duoChatAnhang img{width:46px;height:46px;object-fit:cover;border-radius:8px;border:1px solid var(--line);background:#fff;flex-shrink:0;}',
        '#duoChatAnhang .frage-nr{flex-shrink:0;font-family:var(--font-mono,monospace);font-weight:700;border:1px solid var(--line);border-radius:6px;padding:3px 6px;background:var(--card-bg);}',
        '#duoChatAnhang .was{flex:1;min-width:0;line-height:1.3;}',
        '#duoChatAnhang .was b{display:block;}',
        '#duoChatAnhang .was span{display:block;opacity:0.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
        '#duoChatAnhang button{background:transparent;border:1px solid var(--line);color:var(--ink);border-radius:999px;width:28px;height:28px;cursor:pointer;flex-shrink:0;}',
        /* Das Bild in der Blase */
        '.duo-bild{display:block;padding:0;margin:2px 0 3px;border:none;background:transparent;cursor:zoom-in;border-radius:8px;overflow:hidden;max-width:100%;}',
        '.duo-bild img{display:block;border-radius:8px;object-fit:cover;background:#fff;}',
        /* Eine Frage aus dem Trainer */
        '.duo-frage{margin:2px 0 3px;padding:7px 8px;border-radius:8px;background:rgba(127,127,127,0.12);border-left:3px solid currentColor;}',
        '.duo-frage-kopf{display:flex;align-items:center;gap:6px;font-size:0.68rem;font-weight:700;opacity:0.85;margin-bottom:4px;}',
        '.duo-frage-nr{font-family:var(--font-mono,monospace);font-size:0.72rem;border:1px solid currentColor;border-radius:5px;padding:1px 5px;}',
        '.duo-frage-text{font-weight:600;margin-bottom:5px;}',
        '.duo-frage-bild img{display:block;max-width:100% !important;max-height:150px !important;margin:0 0 6px;border-radius:6px !important;border:none !important;background:#fff !important;padding:4px !important;cursor:zoom-in !important;}',
        '.duo-frage-antw{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:3px;}',
        '.duo-frage-antw li{display:flex;gap:6px;align-items:flex-start;}',
        '.duo-frage-antw li b{flex-shrink:0;width:14px;}',
        '.duo-frage-antw.bilder{display:grid;grid-template-columns:1fr 1fr;gap:5px;}',
        '.duo-frage-antw.bilder li{min-width:0;}',
        '.duo-frage-antw.bilder img{display:block;flex:1 1 0;min-width:0;width:0;max-height:80px;object-fit:contain;background:#fff;border-radius:5px;padding:3px;cursor:zoom-in;}',
        '.duo-chat-zeile.mit-anhang{min-width:0;}',
        '.duo-frage-oeffnen{margin-top:7px;background:transparent;border:1px solid currentColor;color:inherit;border-radius:999px;padding:3px 10px;font-size:0.7rem;font-weight:700;cursor:pointer;font-family:inherit;}',
        /* Gross anzeigen - ueber allem, auch ueber dem Chat */
        '#duoBildGross{position:fixed;inset:0;z-index:100001;background:rgba(0,0,0,0.88);display:none;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:18px;cursor:zoom-out;}',
        '#duoBildGross.offen{display:flex;}',
        '#duoBildGross img{max-width:94vw;max-height:84vh;object-fit:contain;border-radius:8px;background:#fff;box-shadow:0 8px 40px rgba(0,0,0,0.6);}',
        '#duoBildGross .unter{color:#fff;font-size:0.85rem;opacity:0.9;text-align:center;}',
        '#duoBildGross .zu{position:absolute;top:14px;right:18px;background:rgba(255,255,255,0.15);color:#fff;border:none;border-radius:999px;width:40px;height:40px;font-size:1.3rem;cursor:pointer;}',
        '#duoChatBox.ziehen{outline:3px dashed var(--panel-navy);outline-offset:-3px;}',
        /* LERNCOACH (29.09.2026): gruen abgesetzt, damit niemand die KI
           mit einem Menschen verwechselt. Zeilenumbrueche bleiben stehen -
           Rechenschritte stehen je in einer eigenen Zeile. */
        '.duo-chat-coach{align-self:flex-start;background:#ecf8f1;border:1px solid #8fd0a8;color:var(--ink);white-space:pre-line;}',
        '.duo-chat-zeile.duo-chat-coach{background:#ecf8f1;border-color:#8fd0a8;}',
        'body.dark .duo-chat-zeile.duo-chat-coach{background:#123828;border-color:#2f7a52;color:#e6f4ec;}',
        '.duo-chat-coach .duo-chat-absender{color:#15703c;opacity:1;white-space:normal;}',
        'body.dark .duo-chat-coach .duo-chat-absender{color:#6ee7a0;}',
        '.duo-coach-hinweis{display:block;font-size:0.62rem;opacity:0.65;margin-top:4px;white-space:normal;}',
        '.duo-chat-rundgang{align-self:stretch;background:#eaf4ff;border:1px solid #9cc3ea;color:var(--ink);font-size:0.78rem;line-height:1.45;}',
        '.duo-chat-rundgang .knoepfe{display:flex;gap:6px;margin-top:7px;flex-wrap:wrap;}',
        '.duo-chat-rundgang button{border:1px solid #0f2745;background:#0f2745;color:#fff;font-weight:700;font-size:0.74rem;padding:4px 12px;cursor:pointer;font-family:inherit;border-radius:999px;}',
        '.duo-chat-rundgang button.nein{background:transparent;color:#0f2745;}',
        'body.dark .duo-chat-rundgang{background:#16304f;border-color:#2c5a8a;color:#e6eef8;}',
        'body.dark .duo-chat-rundgang button.nein{color:#e6eef8;border-color:#9cc3ea;}',
        'body.eckig #duoChatBox .duo-chat-rundgang button{border-radius:999px !important;}',
        '.duo-coach-vorlesen{display:block;margin-top:8px;padding-top:6px;border-top:1px dashed #8fd0a8;font-size:0.78rem;white-space:normal;color:#15703c;}',
        '.duo-coach-vorlesen button{margin-left:4px;border:1px solid #16a34a;background:#16a34a;color:#fff;border-radius:999px;padding:2px 10px;font-size:0.74rem;font-weight:700;cursor:pointer;font-family:inherit;}',
        '.duo-coach-vorlesen button:hover{background:#15803d;}',
        '.duo-coach-vorlesen.wartet{font-style:italic;opacity:.8;}',
        'body.dark .duo-coach-vorlesen{color:#6ee7a0;border-top-color:#2f7a52;}',
        'body.eckig #duoChatBox .duo-coach-vorlesen button{border-radius:999px !important;}',
        '.duo-chat-coach.denkt{font-style:italic;white-space:normal;}',
        '.duo-chat-coach.denkt .p{display:inline-block;animation:duoLcPunkt 1.2s infinite;}',
        '.duo-chat-coach.denkt .p:nth-child(2){animation-delay:.2s}.duo-chat-coach.denkt .p:nth-child(3){animation-delay:.4s}',
        '@keyframes duoLcPunkt{0%,60%,100%{opacity:.2}30%{opacity:1}}',
        '.duo-frage-coach{display:none;margin:7px 0 0 6px;background:#15703c;border:1px solid #15703c;color:#fff;border-radius:999px;padding:3px 10px;font-size:0.7rem;font-weight:700;cursor:pointer;font-family:inherit;}',
        'body.lerncoach-an .duo-frage-coach{display:inline-block;}',
        'body.eckig #duoChatBox .duo-frage-coach{border-radius:999px !important;}',
        /* DARK MODE: DUNKLERES BLAU, DEUTLICHE HAKEN (26.09.2026). Dietmar,
           mit Bild: "Im Dark Mode sieht man die Hacken schlecht und das
           Blau ist viel zu hell." Im dunklen Stil ist --panel-navy das
           helle Signalblau #00adef - fuer Knoepfe gedacht, als Flaeche der
           eigenen Blasen und des Chatkopfs viel zu grell. Und das Blau der
           gelesenen Haken (#53bdeb) stand darauf praktisch unsichtbar.
           Jetzt: Kopf und eigene Blasen in einem tiefen Blau (weisse
           Schrift 7,6:1), Haken heller und etwas groesser, gelesen in
           hellem Tuerkis. */
        'body.dark #duoChatKopf{background:#0c4a6e;}',
        'body.dark .duo-chat-eigen{background:#075985;color:#fff;}',
        'body.dark .duo-chat-eigen .duo-chat-haken{color:#e0f2fe;opacity:0.95;font-size:0.8rem;}',
        'body.dark .duo-chat-eigen .duo-chat-haken.gelesen{color:#67e8f9;opacity:1;}',
        'body.dark .duo-chat-eigen .duo-sprache-knopf{color:#075985;}',
        '#duoChatEingabeZeile.nimmt-auf #duoChatEingabe,#duoChatEingabeZeile.nimmt-auf #duoChatMikro,#duoChatEingabeZeile.nimmt-auf #duoChatSenden{display:none !important;}',
        '#duoChatAufnahme{display:none;flex:1;align-items:center;gap:6px;min-width:0;}',
        '#duoChatEingabeZeile.nimmt-auf #duoChatAufnahme{display:flex;}',
        '#duoChatAufnahme .punkt{width:10px;height:10px;border-radius:50%;background:#d9403a;flex-shrink:0;animation:duoAufnahmePuls 1s infinite;}',
        '@keyframes duoAufnahmePuls{0%,100%{opacity:1}50%{opacity:0.25}}',
        '#duoChatAufnahme .zeit{flex:0 0 auto;font-size:0.9rem;font-variant-numeric:tabular-nums;white-space:nowrap;}',
        '#duoChatAufnahme .zeit.knapp{color:#d9403a;font-weight:700;}',
        /* Die Aufnahmeleiste wie bei WhatsApp (25.09.2026): Papierkorb,
           roter Punkt, Zeit, Balken-Welle, Pause, gruener Senden-Knopf.
           Die Welle nimmt die gedaempfte Schriftfarbe des Stils an. */
        '#duoChatWelle{flex:1 1 auto;min-width:40px;height:28px;display:block;color:var(--chat-muted);}',
        '#duoChatAufnahme button{border:none;border-radius:999px;width:36px;height:36px;cursor:pointer;font-size:0.95rem;flex-shrink:0;}',
        '#duoChatAufnahmeWeg,#duoChatAufnahmePause{background:transparent;width:30px !important;font-size:1.02rem !important;padding:0;}',
        '#duoChatAufnahmeWeg{color:var(--chat-muted);}',
        '#duoChatAufnahmeWeg:hover{color:#dc2626;}',
        '#duoChatAufnahmePause{color:#e5484d;}',
        '#duoChatAufnahme.pausiert .punkt{animation:none;opacity:0.35;}',
        '#duoChatAufnahmeSenden{background:#1c7a46;color:#fff;}',
        // max-width (29.09.2026): ohne die Grenze nahm die Zeile ihre volle
        // Wunschbreite und die Pille "1x" ragte ueber den Blasenrand.
        '.duo-sprache{display:inline-flex;align-items:center;gap:6px;min-width:170px;max-width:100%;vertical-align:middle;}',
        '.duo-sprache-knopf{border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;font-size:0.8rem;flex-shrink:0;',
        '  background:var(--panel-navy);color:#fff;}',
        '.duo-chat-eigen .duo-sprache-knopf{background:#fff;color:var(--panel-navy);}',
        '.duo-sprache-balken{flex:1;height:4px;border-radius:2px;background:currentColor;opacity:0.25;position:relative;overflow:hidden;}',
        '.duo-sprache-balken span{position:absolute;left:0;top:0;bottom:0;width:0;background:currentColor;}',
        '.duo-sprache-dauer{font-size:0.72rem;opacity:0.8;font-variant-numeric:tabular-nums;flex-shrink:0;white-space:nowrap;}',
        /* Die Welle in der Sprechblase (25.09.2026), wie bei WhatsApp: der
           gespielte Teil wird gruen. Ein Klick springt an die Stelle.
           Seit 26.09.2026 sind die Striche fest 2 px breit, nur die Luecken
           dazwischen passen sich an: Die Pille fuer die Geschwindigkeit
           nimmt beim Abspielen Platz weg, und vorher schob sich die Welle
           dann ueber die Zeitangabe. */
        /* 29.09.2026: Dietmar: "Die Geschwindigkeit 1x ueberlaeuft dem
           Rahmen im Chat." 36 Striche mit je 1 px Luecke brauchten 107 px,
           mehr als die Welle neben Pille und Zeit im schmalen Chat hat.
           Jetzt ohne feste Luecke (space-between verteilt den Rest), die
           Welle darf bis 72 px schrumpfen - dann passt die Pille hinein. */
        '.duo-sprache-welle{flex:1 1 auto;width:130px;display:flex;align-items:center;justify-content:space-between;gap:0;height:26px;min-width:72px;cursor:pointer;}',
        '.duo-sprache-welle i{flex:0 0 2px;width:2px;background:currentColor;opacity:0.35;border-radius:2px;display:block;}',
        '.duo-sprache-welle i.gespielt{opacity:1;background:#16a34a;}',
        '.duo-chat-eigen .duo-sprache-welle i.gespielt{background:#86efac;}',
        /* Abspielgeschwindigkeit (26.09.2026), wie bei WhatsApp: Die Pille
           erscheint, sobald die Nachricht laeuft, und schaltet bei jedem
           Klick 1x -> 1,25x -> 1,5x -> 1x weiter. */
        '.duo-sprache-tempo{display:none;border:none;border-radius:999px;padding:2px 7px;min-width:34px;height:20px;',
        '  align-items:center;justify-content:center;font-weight:700;font-size:0.7rem;line-height:1;font-family:inherit;cursor:pointer;flex-shrink:0;',
        '  background:rgba(127,127,127,0.22);color:inherit;font-variant-numeric:tabular-nums;}',
        '.duo-sprache-tempo:hover{background:rgba(127,127,127,0.36);}',
        '.duo-chat-eigen .duo-sprache-tempo{background:rgba(0,0,0,0.28);color:#fff;}',
        '.duo-chat-eigen .duo-sprache-tempo:hover{background:rgba(0,0,0,0.4);}',
        '.duo-sprache.laeuft .duo-sprache-tempo{display:inline-flex;}',
        /* Loeschen und Reaktionen (25.09.2026). Das Smiley neben der Blase
           (beim Zeigen mit der Maus, am Handy immer blass zu sehen) oder
           ein Klick auf die Blase klappt die Leiste auf: vier Reaktionen,
           und - wo erlaubt - der Papierkorb. Keine roten Herzen: Dietmar
           wollte Daumen hoch und runter in Gruen, dazu lustig und traurig.
           Am Abend dann bunte Emojis wie bei WhatsApp (siehe REAKT_ARTEN). */
        '.duo-chat-mehr{position:absolute;top:50%;transform:translateY(-50%);width:24px;height:24px;border-radius:50%;',
        '  border:1px solid var(--line);background:var(--card-bg);color:var(--muted);font-size:0.8rem;cursor:pointer;',
        '  display:flex;align-items:center;justify-content:center;padding:0;opacity:0;transition:opacity .15s;}',
        '.duo-chat-fremd .duo-chat-mehr{right:-30px;}',
        '.duo-chat-eigen .duo-chat-mehr{left:-30px;}',
        '.duo-chat-zeile:hover .duo-chat-mehr,.duo-chat-zeile.aktiv .duo-chat-mehr,.duo-chat-mehr:focus-visible{opacity:1;}',
        '@media (hover:none){.duo-chat-mehr{opacity:0.6;}}',
        '.duo-chat-leiste{display:none;gap:2px;margin-top:6px;padding-top:5px;border-top:1px solid rgba(127,127,127,0.3);align-items:center;flex-wrap:wrap;}',
        /* Acht Emojis und der Papierkorb passen in eine Reihe, wenn die
           Blase mindestens so breit ist - kurze Blasen wachsen dafuer,
           solange die Leiste offen ist (25.09.2026). */
        '.duo-chat-zeile.aktiv{min-width:min(244px, calc(100% - 32px));max-width:calc(100% - 32px);}',
        '.duo-chat-zeile.aktiv .duo-chat-leiste{display:flex;}',
        '.duo-chat-leiste button{border:none;background:transparent;cursor:pointer;font-size:1rem;padding:4px 1px;border-radius:8px;line-height:1;color:inherit;}',
        '.duo-chat-leiste button:hover{background:rgba(127,127,127,0.2);}',
        '.duo-chat-leiste button.meine{background:rgba(34,197,94,0.22);}',
        '.duo-chat-leiste .weg{margin-left:auto;font-size:0.88rem;opacity:0.75;}',
        '.duo-chat-leiste .weg:hover{color:#dc2626;opacity:1;}',
        '.duo-chat-eigen .duo-chat-leiste .weg:hover{color:#fca5a5;}',
        '.duo-chat-reaktionen{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px;}',
        '.duo-chat-reaktionen:empty{display:none;}',
        '.duo-reakt{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--line);background:var(--bg);color:var(--ink);',
        '  border-radius:999px;padding:1px 8px;font-size:0.72rem;font-weight:700;cursor:pointer;line-height:1.6;font-family:inherit;}',
        /* Auf der eigenen Blase ein dunkler Grund - im dunklen Stil ist die
           eigene Blase hellblau, darauf waere Gruen kaum zu sehen. */
        '.duo-chat-eigen .duo-reakt{background:rgba(0,0,0,0.28);border-color:rgba(255,255,255,0.35);color:#fff;}',
        '.duo-reakt.meine{border-color:#16a34a;box-shadow:inset 0 0 0 1px #16a34a;}',
        '.duo-chat-eigen .duo-reakt.meine{border-color:#4ade80;box-shadow:inset 0 0 0 1px #4ade80;}',
        /* Die Emojis in der Farbschrift des Systems - unter Windows Segoe
           UI Emoji, am Mac Apple, unter Linux und Android Noto. */
        '.duo-emoji{font-family:"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif;',
        '  font-style:normal;font-weight:400;line-height:1;display:inline-block;}',
        '.duo-chat-leiste .duo-emoji{font-size:1.02rem;}',
        '.duo-reakt .duo-emoji{font-size:0.9rem;}',
        '.duo-chat-geloescht{font-style:italic;opacity:0.72;}',
        /* DER CHAT BLEIBT RUND (25.09.2026). Dietmar: "Dieser runde Style
           finde ich sehr schoen" - und auf die Rueckfrage, ob der Chat auch
           im Blue Mode rund bleiben soll: "bitte ueberall in Rund".
           Der Blue Mode macht mit body.eckig alles kantig (Index.html,
           "Alles wird kantig", border-radius:0 !important fuer jedes
           Element). Fuer den Chat gelten hier wieder seine eigenen
           Rundungen - mit hoeherer Spezifitaet, damit sie gewinnen. Der
           uebrige Blue Mode bleibt, wie er ist. */
        'body.eckig #duoChatBox{border-radius:14px !important;}',
        'body.eckig #duoChatBildKnopf,body.eckig #duoChatAnhang button,body.eckig #duoChatBox .duo-frage-oeffnen,body.eckig #duoBildGross .zu{border-radius:999px !important;}',
        'body.eckig #duoChatBox .duo-bild,body.eckig #duoChatBox .duo-bild img,body.eckig #duoChatAnhang img,body.eckig #duoChatBox .duo-frage{border-radius:8px !important;}',
        'body.eckig #duoChatBlase,body.eckig #duoChatEingabe,body.eckig #duoChatSenden,body.eckig #duoChatMikro,',
        '  body.eckig #duoChatAufnahme button,body.eckig #duoChatBox .duo-reakt{border-radius:999px !important;}',
        'body.eckig #duoChatBox .duo-chat-zeile{border-radius:12px !important;}',
        'body.eckig #duoChatBox .duo-sprache-tempo{border-radius:999px !important;}',
        'body.eckig #duoChatAufnahme .punkt,body.eckig #duoChatBox .duo-sprache-knopf,body.eckig #duoChatBox .duo-chat-mehr{border-radius:50% !important;}',
        'body.eckig #duoChatBox .duo-chat-leiste button{border-radius:8px !important;}',
        'body.eckig #duoChatBox .duo-sprache-balken,body.eckig #duoChatBox .duo-sprache-welle i{border-radius:2px !important;}',
        /* RECHTS ANGEDOCKT (26.09.2026). Dietmar, mit Bild: "Die
           Moeglichkeit den Chat rechts andocken. Ein und ausschaltbar."
           Dann steht der Chat als Spalte am rechten Rand, von oben bis
           unten, immer aufgeklappt - und die Seite rueckt nach links,
           damit er nichts verdeckt. Umgeschaltet wird mit dem Knopf im
           Chatkopf oder unter Einstellungen -> Allgemein -> Chat. */
        /* Nachtrag, am selben Abend. Dietmar: "Bei mir ist da leider viel
           Platz dazwischen." und "Der Chat muss die gleiche Hoehe wie das
           Fenster rechts davon haben." Also: Der Chat steht jetzt wie eine
           zweite Karte neben der Trainer-Karte - dieselbe Hoehe (oben und
           unten das Polster des body, 1rem), dieselbe Rundung, ein
           schmaler Spalt dazwischen. Und die Trainer-Karte darf angedockt
           breiter werden als ihre sonstigen 1440 Punkte, damit auf breiten
           Bildschirmen keine Luecke zwischen beiden bleibt. */
        /* Nachtrag, 27.09.2026. Dietmar: "Der Chat soll beim andocken, so
           aussehen als gehoert er zu dem Hauptfenster dazu." Der dunkelblaue
           Kopf mit weisser Schrift liess den Chat wie ein eigenes kleines
           Programm daneben wirken. Angedockt bekommt der Kopf jetzt dieselbe
           Flaeche wie die Karte (--card-bg/--ink) mit einem duennen Strich
           darunter statt der auffaelligen Farbe - schwebend bleibt der Kopf
           wie gewohnt dunkelblau. */
        /* Nachtrag, noch am 27.09.2026. Dietmar: "Der Chat kann noch naeher
           dran sein. Er soll beim andocken ein Bestandteil vom Hauptfenster
           sein." Die Karte selbst ("eckig", fest fuer den Trainer) hat keinen
           eigenen Schatten, nur einen duennen Rand - der Chat hatte trotzdem
           noch einen kraeftigen Schatten und 1rem Luecke, das wirkte wie ein
           zweites, schwebendes Fenster daneben. Jetzt: kein Schatten mehr
           angedockt, der Spalt entfaellt (die Karte und der Chat stossen
           direkt aneinander), und die Naht dazwischen ist nur noch EIN
           Strich statt zwei uebereinander - der linke Rand des Chats entfaellt,
           es bleibt allein der rechte Rand der Karte als Trennlinie. Von
           aussen sieht es dadurch wie eine einzige Flaeche mit zwei Spalten
           aus, nicht wie zwei Karten nebeneinander. */
        /* Nachtrag, 27.09.2026 abends. Dietmar, mit Bild im Grey Mode: "Den
           Chat kann man noch etwas mehr nach links ruecken und ein klein
           wenig schmaeler machen. Was definitiv fehlt ist der Rahmen aussen
           rum. Der Chat muss optisch mit der Hauptansicht verschmelzen."
           Gemessen: Der Chat hatte genau die Farbe des Seitenrands (#aab0b6)
           und stand ausserhalb der Karte - sein Rahmen verschwand darin.
           Jetzt steht er INNERHALB der Karte, als dritte Spalte wie der
           Verlauf: Die Karte reicht bis an den rechten Rand, ihr Rahmen
           laeuft um alles herum, der Chat sitzt mit demselben Abstand
           darin (chatAnKarteAusrichten) und uebernimmt Farbe und Rand der
           Verlauf-Spalte des jeweiligen Stils - also getoent, nicht weiss.
           310 statt 340 Punkte breit. */
        /* Dietmar, 27.09.2026 abends: "Der Chat wird nicht abgedunkelt, wenn
           ich ein Fenster oeffne." Schwebend liegt der Chat mit 99998 ueber
           fast allem. Angedockt gehoert er zur Seite, also auch auf ihre
           Ebene: knapp ueber der festen Knopfleiste (80) und der
           Quellenzeile (90), unter jedem Fenster (ab 9998) und dessen
           Abdunklung. Das Klingelfenster eines Anrufs liegt bei 100000. */
        '#duoChatBox.angedockt{top:1rem;right:1rem;bottom:1rem;width:310px;max-width:none;border-radius:24px !important;',
        '  box-shadow:none;z-index:95;}',
        'body.eckig #duoChatBox.angedockt{border-radius:var(--karte-rund, 24px) !important;}',
        'body.chat-angedockt #app{max-width:none !important;}',
        '#duoChatBox.angedockt #duoChatKoerper{display:flex;flex:1 1 auto;height:auto;min-height:0;}',
        '#duoChatBox.angedockt #duoChatKnopf{display:none;}',
        '#duoChatBox.angedockt #duoChatKopf{cursor:default;background:var(--chat-flaeche);color:var(--ink);',
        '  border-bottom:1px solid var(--line);}',
        '#duoChatBox.angedockt #duoChatKopf .titel{color:var(--ink);}',
        '#duoChatBox.angedockt #duoChatAndocken,#duoChatBox.angedockt #duoChatAbgleich{color:var(--ink) !important;}',
        /* Nachtrag, noch am 27.09.2026: "unten befindet sich eine 2 Linie.
           Der Uebergang passt optisch so gar nicht. Nachricht an alle, das
           Feld kann im angedockten Zustand gerne etwas hoeher sein. Und die
           untere 2 Linie kann raus." Angedockt ist die Eingabezeile jetzt
           grosszuegiger (mehr Luft ueber/unter dem Feld) und ohne den
           eigenen Strich darueber, der zusammen mit dem Kartenrand wie eine
           doppelte Linie wirkte - sie geht jetzt ohne Bruch in die
           Nachrichtenliste darueber ueber. */
        '#duoChatBox.angedockt #duoChatEingabeZeile{border-top:none;padding:14px 12px;}',
        '#duoChatBox.angedockt #duoChatEingabe{padding:12px 14px;}',
        '#duoChatBox.angedockt #duoChatMikro,#duoChatBox.angedockt #duoChatSenden{width:42px;height:42px;}',
        /* Waehrend einer Runde steht die Knopfleiste fest am Fenster und ist
           fensterbreit - angedockt nur so breit wie die Hauptspalte, sonst
           laege sie halb unter dem Chat. Die Masse setzt chatAnKarteAusrichten. */
        'body.chat-angedockt.runde-laeuft:not(.beamer-live) #navArea{left:var(--andock-nav-links) !important;width:var(--andock-nav-breite) !important;',
        '  max-width:none !important;transform:none !important;bottom:var(--andock-nav-unten, 1.4rem) !important;}',
        /* Dietmar, 27.09.2026 abends, mit Bild: "Bei den Fragen, ist die
           Buttonleiste etwas zu tief ... Diese gehoert etwas hoeher, dann
           stimmt das auch mit dem angedockten Chat ueberein." Angedockt
           endet die Leiste unten genau dort, wo der Chat endet. Mit der
           Quellenzeile am Fensterrand bleibt sie mindestens darueber. */
        'body.chat-angedockt.runde-laeuft.quelle-zeigen:not(.beamer-live) #navArea{bottom:max(var(--andock-nav-unten, 1.4rem), calc(1.4rem + 50px)) !important;}',
        '#duoChatAndocken{background:transparent;border:none;color:#fff;font-size:0.9rem;cursor:pointer;line-height:1;padding:2px 5px;opacity:0.9;}',
        '#duoChatAndocken:hover{opacity:1;}',
        /* ANRUFEN (27.09.2026) - Kontaktliste im Chat, Gespraechsstreifen
           und das Klingel-Fenster. Aussehen wie im Vorschaubild, das Dietmar
           mit "Baue das bitte ein." freigegeben hat. Farben aus den
           Stil-Variablen, damit es in allen fuenf Stilen passt. */
        '#duoAnrufLeiste{flex-shrink:0;max-height:45%;overflow-y:auto;border-bottom:1px solid var(--line);background:var(--chat-flaeche);',
        '  font-size:0.8rem;color:var(--ink);scrollbar-width:thin;scrollbar-color:var(--line) transparent;}',
        '#duoAnrufLeiste .kopf{display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:pointer;user-select:none;}',
        '#duoAnrufLeiste .kopf i.leute{color:var(--chat-muted);}',
        '#duoAnrufLeiste .kopf b{font-weight:700;}',
        '#duoAnrufLeiste .pfeil{margin-left:auto;color:var(--chat-muted);font-size:0.75rem;}',
        '#duoAnrufLeiste ul{list-style:none;margin:0;padding:2px 8px 8px;}',
        '#duoAnrufLeiste li{display:flex;align-items:center;gap:8px;padding:6px 8px;min-height:32px;}',
        '#duoAnrufLeiste li:hover{background:var(--card-bg);}',
        '#duoAnrufLeiste .punkt{width:9px;height:9px;background:#22a55a;flex-shrink:0;}',
        '#duoAnrufLeiste .name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
        '#duoAnrufLeiste .rolle{font-size:0.68rem;color:var(--chat-muted);}',
        '#duoAnrufLeiste .rolle.aktiv{color:#1c7a46;font-weight:700;}',
        'body.dark #duoAnrufLeiste .rolle.aktiv{color:#4ade80;}',
        '#duoAnrufLeiste .hoerer{width:32px;height:32px;border:1px solid var(--line);background:var(--card-bg);flex-shrink:0;',
        '  color:#16a34a;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.85rem;padding:0;}',
        '#duoAnrufLeiste .hoerer:hover{border-color:#16a34a;}',
        '#duoAnrufLeiste .hoerer.auflegen{background:#d9403a;border-color:#d9403a;color:#fff;}',
        '#duoAnrufLeiste .hoerer:disabled{color:#b7c0c9;cursor:default;border-color:var(--line);}',
        'body.dark #duoAnrufLeiste .hoerer{color:#4ade80;}',
        'body.dark #duoAnrufLeiste .hoerer.auflegen{color:#fff;}',
        'body.dark #duoAnrufLeiste .hoerer:disabled{color:#5b6b80;}',
        '#duoAnrufStreifen{align-items:center;gap:10px;padding:10px 12px;background:#1c7a46;color:#fff;font-size:0.82rem;flex-shrink:0;}',
        '#duoAnrufStreifen .welle{display:flex;gap:2px;align-items:center;height:16px;flex-shrink:0;}',
        '#duoAnrufStreifen .welle i{display:block;width:3px;height:14px;background:#bbf7d0;animation:duoAnrufWelle 1.1s ease-in-out infinite;}',
        '#duoAnrufStreifen .welle i:nth-child(2){animation-delay:.15s}#duoAnrufStreifen .welle i:nth-child(3){animation-delay:.3s}',
        '#duoAnrufStreifen .welle i:nth-child(4){animation-delay:.45s}#duoAnrufStreifen .welle i:nth-child(5){animation-delay:.6s}',
        '#duoAnrufStreifen .welle i:nth-child(6){animation-delay:.75s}#duoAnrufStreifen .welle i:nth-child(7){animation-delay:.9s}',
        '#duoAnrufStreifen.wartet .welle i{animation-duration:2.2s;opacity:0.7;}',
        '@keyframes duoAnrufWelle{0%,100%{transform:scaleY(0.35)}50%{transform:scaleY(1)}}',
        '#duoAnrufStreifen .text{flex:1;min-width:0;line-height:1.25;}',
        '#duoAnrufStreifen .text b{font-weight:600;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
        '#duoAnrufStreifen .text small{display:block;opacity:0.85;font-size:0.7rem;}',
        '#duoAnrufStreifen button{width:34px;height:34px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:0;font-size:0.9rem;}',
        '#duoAnrufStreifen .stumm{background:rgba(255,255,255,0.18);color:#fff;}',
        '#duoAnrufStreifen .stumm.an{background:#fff;color:#a33227;}',
        '#duoAnrufStreifen .auflegen{background:#d9403a;color:#fff;}',
        'body.eckig #duoAnrufLeiste .punkt,body.eckig #duoAnrufLeiste .hoerer,body.eckig #duoAnrufStreifen button{border-radius:50% !important;}',
        /* Profilbild (27.09.2026): rund, weil es zum Chat gehoert */
        '.duo-pb{width:30px;height:30px;flex-shrink:0;position:relative;display:inline-flex;align-items:center;justify-content:center;',
        '  font-weight:700;font-size:0.8rem;color:#fff;line-height:1;border-radius:50%;}',
        '.duo-pb img{width:100%;height:100%;object-fit:cover;display:block;border-radius:50%;}',
        '.duo-pb .an{position:absolute;right:-1px;bottom:-1px;width:11px;height:11px;box-sizing:border-box;background:#22a55a;',
        '  border:2px solid var(--chat-flaeche);border-radius:50%;}',
        '.duo-pb.mittel{box-shadow:0 0 0 2px #bbf7d0;}',
        '#duoAnrufStreifen.wartet .duo-pb{animation:duoPbWarten 1.4s ease-in-out infinite;}',
        '@keyframes duoPbWarten{0%,100%{opacity:1}50%{opacity:0.55}}',
        '.duo-pb.gross{width:76px;height:76px;font-size:1.8rem;margin:0 auto 12px;box-shadow:0 0 0 4px #dcfce7,0 0 0 8px rgba(34,165,90,0.25);',
        '  animation:duoPbPuls 1.6s ease-in-out infinite;}',
        '@keyframes duoPbPuls{0%,100%{box-shadow:0 0 0 4px #dcfce7,0 0 0 8px rgba(34,165,90,0.25)}50%{box-shadow:0 0 0 4px #dcfce7,0 0 0 14px rgba(34,165,90,0.06)}}',
        'body.dark .duo-pb.gross{box-shadow:0 0 0 4px #14532d,0 0 0 8px rgba(74,222,128,0.25);animation:none;}',
        'body.eckig .duo-pb,body.eckig .duo-pb img,body.eckig .duo-pb .an{border-radius:50% !important;}',
        'body.eckig #duoAnrufLeiste li{border-radius:8px !important;}',
        'body.eckig #duoAnrufStreifen .welle i{border-radius:2px !important;}',
        '#duoAnrufKlingeln{position:fixed;inset:0;background:rgba(15,39,69,0.55);z-index:100000;display:flex;align-items:center;justify-content:center;padding:1rem;}',
        '#duoAnrufKlingeln .kasten{background:var(--card-bg);color:var(--ink);width:340px;max-width:100%;padding:22px 20px;text-align:center;',
        '  border:1px solid var(--line);box-shadow:0 24px 60px rgba(0,0,0,0.35);box-sizing:border-box;}',
        '#duoAnrufKlingeln .ring{width:64px;height:64px;margin:0 auto 12px;background:#dcfce7;color:#16a34a;display:flex;align-items:center;',
        '  justify-content:center;font-size:1.6rem;animation:duoAnrufRing 1.2s ease-in-out infinite;}',
        'body.dark #duoAnrufKlingeln .ring{background:#14532d;color:#4ade80;}',
        '@keyframes duoAnrufRing{0%,100%{transform:rotate(0)}10%{transform:rotate(-12deg)}20%{transform:rotate(12deg)}30%{transform:rotate(-8deg)}40%{transform:rotate(0)}}',
        'body.eckig #duoAnrufKlingeln .ring{border-radius:50% !important;}',
        '#duoAnrufKlingeln h3{margin:0 0 4px;font-size:1.05rem;}',
        '#duoAnrufKlingeln p{margin:0 0 16px;font-size:0.82rem;color:var(--muted);line-height:1.4;}',
        '#duoAnrufKlingeln .knoepfe{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}',
        '#duoAnrufKlingeln button{padding:10px 18px;border:none;color:#fff;font-weight:700;cursor:pointer;font-size:0.85rem;}',
        '#duoAnrufKlingeln .ja{background:#1c7a46;} #duoAnrufKlingeln .nein{background:#a33227;}',
        '@media (max-width:900px){#duoChatAndocken{display:none;}}',
        '@media (max-width:520px){#duoChatBox{right:10px;bottom:10px;width:calc(100vw - 20px);}',
        '  #duoChatKoerper{height:45vh;}}'
        ].join('\n');
        document.head.appendChild(style);

        const box = document.createElement('div');
        box.id = 'duoChatBox';
        box.innerHTML = [
        '<div id="duoChatKopf">',
        '  <span style="font-size:1rem;">💬</span>',
        '  <span class="titel">Gruppenchat</span>',
        '  <span id="duoChatBlase">0</span>',
        '  <button id="duoChatAbgleich" type="button" title="Alle Teilnehmer neu laden lassen (nur am Server)" ',
        '     style="display:none;background:transparent;border:none;color:#fff;font-size:0.95rem;cursor:pointer;padding:2px 4px;">⟳</button>',
        '  <button id="duoChatAndocken" type="button" title="Rechts andocken" aria-label="Rechts andocken"><i class="fa-solid fa-table-columns"></i></button>',
        '  <button id="duoChatKnopf" type="button" title="Chat öffnen" aria-label="Chat öffnen"><i class="fa-solid fa-up-right-from-square"></i></button>',
        '</div>',
        '<div id="duoAnrufStreifen" style="display:none"></div>',
        '<div id="duoChatKoerper">',
        '  <div id="duoAnrufLeiste" style="display:none"></div>',
        '  <div id="duoChatVerlauf"><div id="duoChatLeer">Noch keine Nachrichten.<br>Schreib etwas an alle im Raum.</div></div>',
        '  <div id="duoChatAnhang"></div>',
        '  <div id="duoChatEingabeZeile">',
        '    <input id="duoChatEingabe" type="text" maxlength="500" placeholder="Nachricht an alle..." autocomplete="off">',
        '    <button id="duoChatBildKnopf" type="button" title="Bild senden" aria-label="Bild senden"><i class="fa-solid fa-image"></i></button>',
        '    <input id="duoChatBildDatei" type="file" accept="image/*" style="display:none">',
        '    <button id="duoChatMikro" type="button" title="Sprachnachricht aufnehmen" aria-label="Sprachnachricht aufnehmen"><i class="fa-solid fa-microphone"></i></button>',
        '    <div id="duoChatAufnahme">',
        '      <button id="duoChatAufnahmeWeg" type="button" title="Verwerfen" aria-label="Verwerfen"><i class="fa-solid fa-trash-can"></i></button>',
        '      <span class="punkt" title="Aufnahme läuft"></span>',
        '      <span class="zeit" id="duoChatAufnahmeZeit" title="Höchstens eine Minute">0:00</span>',
        '      <canvas id="duoChatWelle" aria-hidden="true"></canvas>',
        '      <button id="duoChatAufnahmePause" type="button" title="Pause" aria-label="Pause"><i class="fa-solid fa-pause"></i></button>',
        '      <button id="duoChatAufnahmeSenden" type="button" title="Senden" aria-label="Senden">➤</button></div>',
        '    <button id="duoChatSenden" type="button" title="Senden">➤</button>',
        '  </div>',
        '</div>'
        ].join('');
        document.body.appendChild(box);

        document.getElementById('duoChatKopf').addEventListener('click', ()=>{ if(!chatAngedockt()) chatUmschalten(); });
        document.getElementById('duoChatAndocken').addEventListener('click', e=>{ e.stopPropagation(); chatAndocken(!chatAngedockt()); });
        document.getElementById('duoAnrufLeiste').addEventListener('click', anrufListeKlick);
        document.getElementById('duoAnrufLeiste').addEventListener('keydown', e=>{ if((e.key === 'Enter' || e.key === ' ') && e.target.closest('.kopf')){ e.preventDefault(); anrufListeKlick(e); } });
        document.getElementById('duoAnrufStreifen').addEventListener('click', anrufStreifenKlick);
        chatEndeBeobachten();
        // Die Seite rueckt nur zur Seite, solange der Chat auch zu sehen ist.
        try{ new MutationObserver(chatAndockenAnwenden).observe(box, { attributes:true, attributeFilter:['class'] }); }catch(e){}
        try{ new MutationObserver(() => { try{ if(window.frageChatKnopfSetzen) window.frageChatKnopfSetzen(); }catch(e){} }).observe(box, { attributes:true, attributeFilter:['class'] }); }catch(e){}
        chatAndockenAnwenden();
        const abg = document.getElementById('duoChatAbgleich');
        if(abg) abg.addEventListener('click', e=>{ e.stopPropagation(); alleNeuLadenLassen(); });
        document.getElementById('duoChatKnopf').addEventListener('click', e=>{ e.stopPropagation(); chatUmschalten(); });
        // Der Knopf darf bei leerem Feld den Download-Link senden, die
        // Eingabetaste nicht: Ein versehentliches Enter im leeren Feld
        // soll nichts an alle schicken.
        document.getElementById('duoChatSenden').addEventListener('click', ()=>chatSenden(true));
        const feld = document.getElementById('duoChatEingabe');
        feld.addEventListener('keydown', e=>{
            if(e.key === 'Enter'){ e.preventDefault(); chatSenden(false); }
            e.stopPropagation();          // Hotkeys des Trainers nicht ausloesen
        });
        feld.addEventListener('input', downloadKnopfZeichnen);
        downloadKnopfZeichnen();
        document.getElementById('duoChatMikro').addEventListener('click', aufnahmeStarten);
        bildKnopfVerdrahten(feld);
        document.getElementById('duoChatAufnahmeWeg').addEventListener('click', ()=>aufnahmeBeenden(false));
        document.getElementById('duoChatAufnahmeSenden').addEventListener('click', ()=>aufnahmeBeenden(true));
        document.getElementById('duoChatAufnahmePause').addEventListener('click', aufnahmePause);
        // Abspielen: ein Klick auf irgendeinen Knopf in einer Sprachblase.
        // Seit 25.09.2026 auch: Reaktionen, Loeschen und das Aufklappen
        // der Leiste (siehe LOESCHEN UND REAGIEREN).
        document.getElementById('duoChatVerlauf').addEventListener('click', e=>{
            const t = e.target;
            if(!t || !t.closest) return;
            // Bilder und geteilte Fragen (29.09.2026)
            const bk = t.closest('.duo-bild');
            if(bk){ bildGrossZeigen(bk.dataset.bildId, bk); return; }
            const fb = t.closest('.duo-frage img');
            if(fb){ bildGrossZeigen(null, null, fb.currentSrc || fb.src, fb.alt || ''); return; }
            const rg = t.closest('[data-rundgang]');
            if(rg){
                const zeile = document.getElementById('duoRundgangAngebot');
                if(rg.getAttribute('data-rundgang') === 'los'){
                    if(zeile) zeile.remove();
                    try{ window.rundgangStarten(); }catch(err){}
                } else {
                    if(zeile) zeile.remove();
                    chatSystemmeldung('Kein Problem. Den Rundgang findest du jederzeit unter „Info“ – oder schreib hier einfach „Rundgang“.');
                }
                e.stopPropagation(); return;
            }
            const vl = t.closest('.duo-coach-vorlesen button');
            if(vl){
                const sp = vl.closest('.duo-coach-vorlesen');
                if(sp && socket){ socket.emit('lerncoachVorlesen', { id: sp.dataset.lcVorlesen }); sp.classList.add('wartet'); sp.textContent = '🎤 Die Sprachnachricht kommt gleich …'; }
                e.stopPropagation(); return;
            }
            const fc = t.closest('.duo-frage-coach');
            if(fc){ const z = fc.closest('.duo-chat-zeile[data-id]'); if(z) lerncoachFrageKnopf(z.dataset.id); return; }
            const fo = t.closest('.duo-frage-oeffnen');
            if(fo){ frageImTrainerOeffnen(fo.dataset.frage); return; }
            const k = t.closest('.duo-sprache-knopf');
            if(k){
                const b = k.closest('.duo-sprache');
                if(b && b.dataset.spracheId) spracheAbspielen(b.dataset.spracheId);
                return;
            }
            // Die Pille 1x / 1,25x / 1,5x (26.09.2026).
            if(t.closest('.duo-sprache-tempo')){ spracheTempoWeiter(); return; }
            // Ein Klick in die Welle einer Sprachnachricht springt an die
            // Stelle (25.09.2026, wie bei WhatsApp).
            const wl = t.closest('.duo-sprache-welle');
            if(wl){
                const b = wl.closest('.duo-sprache');
                const rr = wl.getBoundingClientRect();
                if(b && b.dataset.spracheId) spracheSpringen(b.dataset.spracheId, (e.clientX - rr.left) / Math.max(1, rr.width));
                return;
            }
            const zeile = t.closest('.duo-chat-zeile[data-id]');
            if(!zeile) return;
            const r = t.closest('[data-reagieren]');
            if(r){ reagieren(zeile.dataset.id, r.dataset.reagieren); zeile.classList.remove('aktiv'); return; }
            if(t.closest('[data-loeschen]')){ zeile.classList.remove('aktiv'); nachrichtLoeschen(zeile.dataset.id); return; }
            if(t.closest('a')) return;                 // Links bleiben Links
            if(!zeile.querySelector('.duo-chat-leiste')) return;
            // Wer gerade Text markiert, will die Leiste nicht.
            try{ const sel = window.getSelection(); if(sel && String(sel).length && !t.closest('.duo-chat-mehr')) return; }catch(err){}
            leisteUmschalten(zeile);
        });
        // Ein Klick irgendwo anders klappt die Leiste wieder zu.
        document.addEventListener('click', e=>{
            const offen = document.querySelectorAll('#duoChatVerlauf .duo-chat-zeile.aktiv');
            if(!offen.length) return;
            const drin = e.target && e.target.closest ? e.target.closest('.duo-chat-zeile.aktiv') : null;
            offen.forEach(z => { if(z !== drin) z.classList.remove('aktiv'); });
        }, true);
        mikroZeichnen();
        feld.addEventListener('keypress', e=>e.stopPropagation());
        feld.addEventListener('keyup', e=>e.stopPropagation());
    }

    function abgleichKnopfEinbauen(){
        chatAufbauen();
        const knopf = document.getElementById('duoChatAbgleich');
        if(knopf) knopf.style.display = (isHost && roomCode) ? '' : 'none';
        // Statuszeile im Gruppenraum-Dialog, direkt unter der Teilnehmerliste
        try{
            const users = document.getElementById('duoUsers');
            if(users && isHost && !document.getElementById('duoAbgleichHinweis')){
                const z = document.createElement('div');
                z.id = 'duoAbgleichHinweis';
                z.style.cssText = 'font-size:0.72rem;margin-top:6px;text-align:center;';
                z.textContent = 'Dateistand wird abgeglichen...';
                users.parentNode.insertBefore(z, users.nextSibling);
            }
            const hinweis = document.getElementById('duoAbgleichHinweis');
            if(hinweis) hinweis.style.display = isHost ? '' : 'none';
        }catch(e){}
    }

    // Merkt sich, fuer welchen Raum der Chat schon einmal von selbst
    // aufgeklappt wurde. Ohne das wuerde jedes showRoomUI() - und das
    // laeuft bei jeder Aenderung im Raum - ein zugeklapptes Fenster
    // wieder aufreissen.
    let chatSchonAufgeklappt = null;

    // Wer den Raum selbst beendet, bekommt die Rueckmeldung des Servers
    // ("roomDeleted") natuerlich auch - der soll aber keine Meldung
    // darueber sehen, was er gerade selbst getan hat.
    let selbstBeendet = false;

    function chatSichtbarkeitPruefen(){
        chatAufbauen();
        try{ anrufRaumPruefen(); }catch(e){}
        const box = document.getElementById('duoChatBox');
        if(!box) return;
        try{ downloadKnopfZeichnen(); }catch(e){}
        try{ mikroZeichnen(); }catch(e){}
        if(roomCode){
            box.classList.add('sichtbar');
            // DER CHAT STEHT VON ANFANG AN OFFEN.
            //
            // Dietmar am 05.09.2026: "Ich kann erst im Chat schreiben,
            // wenn mir davor jemand geschrieben hat."
            //
            // Genau so war es gebaut: Das Fenster kam zugeklappt auf die
            // Welt - nur die Kopfleiste war zu sehen, das Eingabefeld
            // steckte darunter. Aufgeklappt hat es sich erst, wenn eine
            // FREMDE Nachricht eintraf. Wer als Erster schreiben wollte,
            // fand kein Feld und musste erst die Kopfleiste anklicken -
            // die aber wie eine Ueberschrift aussieht, nicht wie ein
            // Knopf.
            //
            // Jetzt klappt es beim Betreten des Raums einmal von selbst
            // auf. Wer es zumacht, dem bleibt es zu.
            if(chatSchonAufgeklappt !== roomCode && !pruefungLaeuft()){
                chatSchonAufgeklappt = roomCode;
                chatUmschalten(true, true);   // ohne den Fokus zu stehlen
            }
        } else if(hausChatZeigen()){
            // ----------------------------------------------------------------
            //  DER CHAT OHNE RAUM                          (21.09.2026)
            //  Dietmar: "Wenn ich einen Link teile, moechte ich dass der
            //  Chat vorhanden ist, auch ohne dem Duo."
            //
            //  Beim BESUCHER steht er von Anfang an da - er soll fragen
            //  koennen, ohne erst einen Raum zu betreten.
            //  Beim GASTGEBER erscheint er, sobald wirklich jemand von
            //  aussen auf der Seite ist. Sitzt er allein am Rechner,
            //  bleibt das Fenster weg; es soll nicht im Weg stehen,
            //  wenn niemand da ist.
            //
            //  Aufgeklappt wird nur beim Besucher von selbst. Beim
            //  Gastgeber genuegt der Reiter mit der Blase: Er sitzt
            //  vielleicht in einer Uebungsrunde, und ein Fenster, das
            //  sich von allein aufmacht, weil jemand die Seite geoeffnet
            //  hat, wuerde ihn herausreissen.
            // ----------------------------------------------------------------
            box.classList.add('sichtbar');
            if(vonAussen && chatSchonAufgeklappt !== '__haus' && !pruefungLaeuft()){
                chatSchonAufgeklappt = '__haus';
                chatUmschalten(true, true);
            }
        } else {
            box.classList.remove('sichtbar','offen');
            chatOffen = false;
            chatKnopfZeigen();
            chatSchonAufgeklappt = null;
            chatUngelesen = 0;
            chatBlaseAktualisieren();
        }
    }

    // Wann gibt es den Chat ohne Raum? Der Besucher hat ihn immer, der
    // Gastgeber, sobald jemand von aussen da ist - oder sobald etwas
    // geschrieben wurde, denn dann steht schon etwas drin.
    function hausChatZeigen(){
        if(roomCode) return false;
        // Der Besucher behaelt seinen Chat in jedem Fall - auch waehrend
        // der Minute Vorwarnung, in der die Tuer schon zugeht. Wer gerade
        // dabei ist, soll sich noch verabschieden koennen.
        if(vonAussen) return true;
        // ----------------------------------------------------------------
        //  AM SERVER-KNOPF                              (22.09.2026)
        //  Dietmar: "Server ein = Chat ein und Server aus = Chat aus.
        //  Achtung: Das ist nur der Chat, den wir ohne Gruppenraum haben."
        //
        //  Vorher hing das Fenster daran, ob gerade wirklich jemand von
        //  aussen da war. Das hiess: Knopf auf Gruen, und trotzdem kein
        //  Chat, bis der erste Besuch kam - und beim Zumachen blieb es
        //  stehen, solange noch etwas darin stand. Jetzt sagt der Knopf,
        //  was gilt: offen heisst da, zu heisst weg.
        //
        //  Meldet der Server die Tuer nicht (tuerAuf === null, also eine
        //  aeltere Fassung), bleibt es beim alten Weg darunter.
        // ----------------------------------------------------------------
        if(tuerAuf === true) return true;
        if(tuerAuf === false) return false;
        if(hausVolk && hausVolk.vonAussen > 0) return true;
        return hausChatHatNachrichten;
    }

    // ohneFokus: beim automatischen Aufklappen soll der Mauszeiger nicht
    // ins Chatfeld gezogen werden - der Gastgeber ist in dem Moment beim
    // Einladungslink, nicht beim Schreiben.
    // ================================================================
    //  DEN CHAT RECHTS ANDOCKEN                            26.09.2026
    //  Gemerkt im Browser (duo_chatAngedockt). Am schmalen Schirm (unter
    //  900 Punkten) nie - dort bliebe fuer die Frage kein Platz.
    // ================================================================
    const CHAT_DOCK_SCHLUESSEL = 'duo_chatAngedockt';
    function chatAngedockt(){
        try{ if(window.innerWidth < 900) return false; return localStorage.getItem(CHAT_DOCK_SCHLUESSEL) === '1'; }catch(e){ return false; }
    }
    let chatDockSetzt = false;
    function chatAndockenAnwenden(){
        if(chatDockSetzt) return;
        chatDockSetzt = true;
        try{
            const box = document.getElementById('duoChatBox');
            if(!box) return;
            const an = chatAngedockt();
            box.classList.toggle('angedockt', an);
            document.body.classList.toggle('chat-angedockt', an && box.classList.contains('sichtbar'));
            if(an && !chatOffen) chatUmschalten(true, true);
            const k = document.getElementById('duoChatAndocken');
            if(k){
                const t = an ? 'Vom Rand lösen' : 'Rechts andocken';
                k.title = t; k.setAttribute('aria-label', t);
                k.innerHTML = an ? '<i class="fa-solid fa-up-right-from-square"></i>' : '<i class="fa-solid fa-table-columns"></i>';
            }
            const h = document.getElementById('einstChatAndocken');
            if(h) h.checked = (localStorage.getItem(CHAT_DOCK_SCHLUESSEL) === '1');
        }catch(e){}
        finally{ chatDockSetzt = false; try{ if(window.kopfEinpassen) window.kopfEinpassen(); }catch(e){} chatAusrichtenPlanen(); }
    }
    // Genau so hoch wie die Trainer-Karte und genauso gerundet (siehe
    // Nachtrag im Stylesheet). Die Karte fuellt das Fenster nicht immer
    // bis unten, und im eckigen Stil hat sie gar keine Rundung - deshalb
    // wird gemessen statt geraten. Die Masse kommen aus dem sichtbaren
    // Bild, die Seite steht aber in einer Vergroesserung (--afu-zoom):
    // darum durch den Faktor teilen.
    // Farbe und Rand der Verlauf-Spalte im aktuellen Stil - der angedockte
    // Chat sieht aus wie ihr Nachbar (27.09.2026).
    function chatVerlaufFarben(){
        const h = document.getElementById('historyCol');
        if(!h) return null;
        const c = getComputedStyle(h);
        const grund = c.backgroundColor;
        if(!grund || grund === 'transparent' || /rgba\(0, 0, 0, 0\)/.test(grund)) return null;
        return { grund: grund, rand: c.borderTopColor, text: c.color };
    }
    const ANDOCK_LUECKE = 22;     // Abstand Hauptspalte - Chat, wie zwischen Inhalt und Verlauf
    function chatAnKarteAusrichten(){
        const box = document.getElementById('duoChatBox');
        const karte = document.getElementById('app');
        if(!box || !karte) return;
        try{ if(!karte._chatBeob && window.ResizeObserver){ karte._chatBeob = new ResizeObserver(chatAusrichtenPlanen); karte._chatBeob.observe(karte); } }catch(e){}
        const aktiv = box.classList.contains('angedockt') && document.body.classList.contains('chat-angedockt');
        if(!aktiv){
            box.style.top = ''; box.style.bottom = ''; box.style.right = ''; box.style.borderRadius = '';
            ['--chat-flaeche', '--chat-muted', 'border-color', 'color'].forEach(k => box.style.removeProperty(k));
            if(karte.dataset.andockPad){ karte.style.removeProperty('padding-right'); delete karte.dataset.andockPad; try{ if(window.kopfEinpassen) window.kopfEinpassen(); }catch(e){} }
            document.body.style.removeProperty('--andock-nav-links'); document.body.style.removeProperty('--andock-nav-breite'); document.body.style.removeProperty('--andock-nav-unten');
            return;
        }
        const z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
        const ck = getComputedStyle(karte);
        const padL = parseFloat(ck.paddingLeft) || 32;
        const padT = parseFloat(ck.paddingTop) || 32;
        const randR = parseFloat(ck.borderRightWidth) || 0, randT = parseFloat(ck.borderTopWidth) || 0, randB = parseFloat(ck.borderBottomWidth) || 0;
        const breite = box.offsetWidth || 310;
        // 1. Die Karte macht rechts Platz: eigener Innenabstand + Chat + Luecke
        const pad = Math.round(padL + breite + ANDOCK_LUECKE);
        if(karte.dataset.andockPad !== String(pad)){
            karte.style.setProperty('padding-right', pad + 'px', 'important');
            karte.dataset.andockPad = String(pad);
            try{ if(window.kopfEinpassen) window.kopfEinpassen(); }catch(e){}
        }
        // 2. Der Chat sitzt in diesem Platz, mit dem Innenabstand der Karte
        //    zu ihrem Rahmen - oben, rechts und unten wie links.
        const r = karte.getBoundingClientRect();                  // sichtbare Punkte (mit Zoom)
        const rand = 16;
        const oben = Math.max(rand, r.top / z + randT + padT);
        const unten = Math.max(rand, (window.innerHeight - r.bottom) / z + randB + padT);
        box.style.top = Math.round(oben) + 'px';
        box.style.bottom = Math.round(unten) + 'px';
        // Waagerecht: Zielkante = Innenkante der Karte. Erst schaetzen, dann
        // nachmessen und berichtigen - Zoom (afu-zoom) und die fest
        // reservierte Scrollleisten-Rinne (scrollbar-gutter) rechnen sonst
        // nicht sauber zusammen.
        const zielR = r.right - (randR + padL) * z;                // sichtbar
        let rechts = parseFloat(box.style.right);
        if(!isFinite(rechts)) rechts = (window.innerWidth - zielR) / z;
        box.style.right = rechts.toFixed(1) + 'px';
        const abw = zielR - box.getBoundingClientRect().right;    // sichtbar
        if(Math.abs(abw) > 0.5){ rechts -= abw / z; box.style.right = rechts.toFixed(1) + 'px'; }
        box.style.setProperty('border-radius', getComputedStyle(karte).borderRadius, 'important');
        // 3. Farbe und Rand wie die Verlauf-Spalte
        const f = chatVerlaufFarben();
        if(f){
            box.style.setProperty('--chat-flaeche', f.grund);
            box.style.setProperty('border-color', f.rand);
            box.style.setProperty('--chat-muted', getComputedStyle(document.body).getPropertyValue('--muted').trim() || f.text);
        }
        // 4. Knopfleiste der Runde nur ueber der Hauptspalte
        const navLinks = r.left / z + (parseFloat(ck.borderLeftWidth) || 0) + padL;
        const chatLinks = box.getBoundingClientRect().left / z;
        document.body.style.setProperty('--andock-nav-links', Math.round(navLinks) + 'px');
        document.body.style.setProperty('--andock-nav-breite', Math.max(200, Math.round(chatLinks - ANDOCK_LUECKE - navLinks)) + 'px');
        document.body.style.setProperty('--andock-nav-unten', Math.round(unten) + 'px');
    }
    // Stilwechsel (Grau, Gruen, Dunkel ...) -> Farben neu uebernehmen
    try{ new MutationObserver(() => chatAusrichtenPlanen()).observe(document.body, { attributes: true, attributeFilter: ['class'] }); }catch(e){}
    let chatAusrichtenGeplant = 0;
    function chatAusrichtenPlanen(){ if(!chatAusrichtenGeplant) chatAusrichtenGeplant = requestAnimationFrame(()=>{ chatAusrichtenGeplant = 0; try{ chatAnKarteAusrichten(); }catch(e){} }); }
    window.addEventListener('scroll', chatAusrichtenPlanen, { passive:true });

    function chatAndocken(an){
        try{ localStorage.setItem(CHAT_DOCK_SCHLUESSEL, an ? '1' : '0'); }catch(e){}
        chatAndockenAnwenden();
        if(an) chatNachUntenRollen();
    }
    window.duoChatAndocken = chatAndocken;
    window.addEventListener('resize', () => { try{ chatAndockenAnwenden(); chatAusrichtenPlanen(); }catch(e){} });

    function chatUmschalten(erzwingeOffen, ohneFokus){
        chatAufbauen();
        const box = document.getElementById('duoChatBox');
        if(!box) return;
        chatOffen = (erzwingeOffen === true) ? true : !chatOffen;
        box.classList.toggle('offen', chatOffen);
        const knopf = document.getElementById('duoChatKnopf');
        chatKnopfZeigen(knopf);
        if(chatOffen){
            chatUngelesen = 0;
            chatBlaseAktualisieren();
            chatNachUntenRollen();
            gelesenMelden();
            if(!ohneFokus){
                const feld = document.getElementById('duoChatEingabe');
                if(feld) setTimeout(()=>feld.focus(), 60);
            }
        }
    }

    // Zeichen am Kopf des Chats (29.09.2026). Dietmar: "Beim Chat minimiert,
    // möchte ich das Zeichen. Das ist verständlicher" (mit Bild des Zeichens
    // "nach draussen oeffnen") - "Pfeil nach oben gross und Pfeil nach unten
    // wird minimiert". Vorher stand im zugeklappten Chat ein kleines Dreieck
    // nach oben, das nicht nach "oeffnen" aussah. Jetzt: zugeklappt das
    // Oeffnen-Zeichen, offen der Pfeil nach unten zum Minimieren.
    function chatKnopfZeigen(knopf){
        knopf = knopf || document.getElementById('duoChatKnopf');
        if(!knopf) return;
        const t = chatOffen ? 'Minimieren' : 'Chat öffnen';
        knopf.innerHTML = chatOffen ? '▾' : '<i class="fa-solid fa-up-right-from-square"></i>';
        knopf.title = t;
        knopf.setAttribute('aria-label', t);
        knopf.classList.toggle('zu', !chatOffen);
    }

    function chatBlaseAktualisieren(){
        const blase = document.getElementById('duoChatBlase');
        if(!blase) return;
        blase.textContent = chatUngelesen > 99 ? '99+' : String(chatUngelesen);
        blase.classList.toggle('sichtbar', chatUngelesen > 0);
    }

    function chatNachUntenRollen(){
        const v = document.getElementById('duoChatVerlauf');
        if(v) v.scrollTop = v.scrollHeight;
        chatAmEnde = true;
    }
    // Wer unten war, bleibt unten - auch wenn die Liste hoeher oder
    // niedriger wird (Andocken, Fenstergroesse, Kontaktliste auf/zu).
    // (chatAmEnde steht oben bei den Zustaenden.)
    function chatEndeBeobachten(){
        const v = document.getElementById('duoChatVerlauf');
        if(!v || v._endeBeob) return;
        v._endeBeob = true;
        v.addEventListener('scroll', () => { chatAmEnde = v.scrollHeight - v.scrollTop - v.clientHeight < 30; }, { passive: true });
        try{ new ResizeObserver(() => { if(chatAmEnde) v.scrollTop = v.scrollHeight; }).observe(v); }catch(e){}
    }

    function chatZeit(ms){
        try{
            const d = new Date(ms);
            return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
        }catch(e){ return ''; }
    }

    // ----------------------------------------------------------------
    //  ANKLICKBARE LINKS - ABER NUR DIE EIGENEN            (23.09.2026)
    //  Damit der Download-Link aus dem gruenen Knopf beim Besucher auch
    //  anklickbar ankommt. Bewusst NICHT jede Adresse: Im Chat ohne Raum
    //  schreibt jeder, der die Seite gefunden hat, und ein anklickbarer
    //  fremder Link waere eine Einladung fuer Werbung und Schlimmeres.
    //  Anklickbar werden nur die Adressen des Trainers selbst; alles
    //  andere bleibt Text, den man abschreiben muss.
    //  Arbeitet auf dem bereits maskierten Text (escapeHtml vorher).
    // ----------------------------------------------------------------
    const CHAT_LINK_RE = /https:\/\/(?:amateurfunk-gruppe\.github\.io\/Amateurfunk-Trainer|github\.com\/Amateurfunk-Gruppe\/Amateurfunk-Trainer|(?:www\.)?amateurfunk-trainer\.com)(?:\/[^\s<"']*)?/g;
    function chatLinks(html){
        try{
            return String(html).replace(CHAT_LINK_RE, function(url){
                // Satzzeichen am Ende gehoeren nicht zur Adresse.
                const rest = (url.match(/[.,;:!?)]+$/) || [''])[0];
                const adr = rest ? url.slice(0, -rest.length) : url;
                return '<a href="' + adr + '" target="_blank" rel="noopener">' + adr + '</a>' + rest;
            });
        }catch(e){ return html; }
    }

    // ----------------------------------------------------------------
    //  GELESEN, WIE BEI WHATSAPP                       (23.09.2026)
    //  Dietmar: "im Chat waere wie bei WhatsApp schoen, wenn ich sehe,
    //  ob meine Nachricht gelesen wurde."
    //
    //  An jeder eigenen Nachricht stehen Haken:
    //    ✓   gesendet - gerade war niemand sonst da, der sie bekommt
    //    ✓✓  grau: angekommen, noch von niemandem gelesen
    //    ✓✓  blau: gelesen; wer, steht in der Sprechblase beim Zeigen
    //    ✓✓✓ blau: von ALLEN gelesen - nur wenn mehrere im Chat sind
    //               (seit 25.09.2026, siehe hakenSetzen)
    //  In der Gruppe genuegt einer, der gelesen hat, damit es blau wird -
    //  die Zahl steht in der Sprechblase.
    //
    //  "Gelesen" meldet ein Browser nur, wenn der Chat offen ist und der
    //  Tab gerade zu sehen ist. Wer das Fenster zugeklappt hat oder in
    //  einem anderen Tab ist, hat es noch nicht gelesen.
    // ----------------------------------------------------------------
    const gelesenStand = new Map();   // eigene Nachrichten-id -> {anzahl, namen}
    const zuMelden = new Set();       // fremde Nachrichten-ids, die ich noch als gelesen melden muss
    let meldeUhr = null;

    function hakenSetzen(id, stand, empfaenger){
        try{
            const el = document.querySelector('.duo-chat-haken[data-haken="' + String(id).replace(/[^a-f0-9]/gi, '') + '"]');
            if(!el) return;
            if(typeof empfaenger === 'number') el.dataset.empfaenger = String(empfaenger);
            const emp = Number(el.dataset.empfaenger || 0);
            const namen = (stand && stand.namen || []).join(', ');
            if(stand && emp > 1 && stand.anzahl >= emp){
                // DER DRITTE HAKEN (25.09.2026). Dietmar: "3 Haekchen, wenn
                // die Nachricht gelesen wurde. Der 3. ist fuer, wenn mehrere
                // im Chat sind. Ist der dritte Haken da, haben alle die
                // Nachricht erhalten." Also: Sind mehrere im Chat, heisst
                // zweimal blau "gelesen - aber noch nicht von allen", dreimal
                // blau "alle haben sie gelesen". Bei nur einem Empfaenger
                // bleibt es bei zwei Haken - da ist einer schon alle.
                el.textContent = '\u2713\u2713\u2713';
                el.classList.add('gelesen');
                el.title = 'Von allen gelesen (' + emp + ')' + (namen ? ': ' + namen : '');
            } else if(stand && stand.anzahl > 0){
                el.textContent = '\u2713\u2713';
                el.classList.add('gelesen');
                el.title = 'Gelesen' + (namen ? ' von ' + namen : '')
                         + (emp > 1 ? ' (' + stand.anzahl + ' von ' + emp + ')' : '');
            } else if(emp > 0){
                el.textContent = '\u2713\u2713';
                el.classList.remove('gelesen');
                el.title = 'Angekommen, noch nicht gelesen';
            } else {
                el.textContent = '\u2713';
                el.classList.remove('gelesen');
                el.title = 'Gesendet \u2013 gerade ist niemand sonst da';
            }
        }catch(e){}
    }

    function gelesenMelden(){
        if(meldeUhr) return;
        meldeUhr = setTimeout(function(){
            meldeUhr = null;
            try{
                if(!zuMelden.size || !socket || !socket.connected) return;
                const box = document.getElementById('duoChatBox');
                const zuSehen = chatOffen && box && box.classList.contains('sichtbar')
                              && document.visibilityState === 'visible';
                if(!zuSehen) return;
                const ids = Array.from(zuMelden).slice(0, 50);
                ids.forEach(function(id){ zuMelden.delete(id); });
                socket.emit('chatGelesen', { ids: ids, name: getDuoUserName() });
                if(zuMelden.size) gelesenMelden();
            }catch(e){}
        }, 700);
    }
    document.addEventListener('visibilitychange', function(){
        if(document.visibilityState === 'visible') gelesenMelden();
    });
    window.addEventListener('focus', function(){ gelesenMelden(); });

    // ----------------------------------------------------------------
    //  SPRACHNACHRICHTEN                                  (23.09.2026)
    //  Dietmar: "Kann man da auch einen Sprachchat einbauen?" - "Im
    //  Gruppenraum sollte jeder sprechen koennen."
    //
    //  Ein Klick aufs Mikrofon startet die Aufnahme; statt des Eingabe-
    //  felds steht dann ein roter Punkt mit der Zeit, daneben Verwerfen
    //  und Senden. Nach einer Minute wird von selbst gesendet. Kein
    //  "gedrueckt halten" wie bei WhatsApp: Am Handy loest langes
    //  Druecken gern ein Kontextmenue aus, und mit der Maus ist Klicken
    //  ohnehin bequemer.
    //
    //  Das Mikrofon gab es im Gruppenraum fuer jeden, im Chat ohne Raum
    //  zuerst nur am Trainer-PC selbst. Seit 25.09.2026 auch dort fuer
    //  jeden - Dietmar: "So das jeder Sprechen kann." (siehe Server.js,
    //  SPRACHNACHRICHTEN). Und nur, wo der Browser es erlaubt: ueber https oder am eigenen
    //  Rechner. Ueber eine WLAN-Adresse (http://192.168...) gibt der
    //  Browser das Mikrofon nicht heraus - dann fehlt der Knopf.
    // ----------------------------------------------------------------
    const SPRACHE_MAX_SEK = 60;
    let aufnahme = null;             // { rec, stream, teile, start, uhr, weg }
    const spracheAudio = new Map();  // id -> Audio
    const spracheWartet = new Set(); // ids, die gerade geholt werden

    function dauerMinSek(sek){
        sek = Math.max(0, Math.round(Number(sek) || 0));
        return Math.floor(sek / 60) + ':' + String(sek % 60).padStart(2, '0');
    }
    function darfSprechen(){
        try{
            if(!window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;
            if(typeof window.MediaRecorder === 'undefined') return false;
            // Bis 24.09.2026 stand hier: ohne Raum nur am eigenen Rechner.
            return true;
        }catch(e){ return false; }
    }
    function mikroZeichnen(){
        const m = document.getElementById('duoChatMikro');
        if(!m) return;
        const ja = darfSprechen();
        m.style.display = ja ? 'inline-block' : 'none';
        if(!ja && aufnahme) aufnahmeBeenden(false);
    }
    function aufnahmeLeiste(an){
        const z = document.getElementById('duoChatEingabeZeile');
        if(z) z.classList.toggle('nimmt-auf', !!an);
    }

    // ----------------------------------------------------------------
    //  DAS MIKROFON SELBST FINDEN                          (24.09.2026)
    //  Dietmar: "Meine Freundin Maya hat es vorhin mal probiert, mir
    //  eine Sprachnachricht zu senden. Sie arbeitet am Laptop. Und hat
    //  auch eine Webcam. Eigentlich muesste da auch ein internes
    //  Mikrofon verbaut sein. Ich musste erst in den Einstellungen was
    //  aendern. Damit die Soundkarte gefunden wird. Kann man das
    //  vielleicht nicht so machen, dass das automatisch erkannt wird?"
    //
    //  Der Browser nimmt von sich aus immer das Standard-Mikrofon von
    //  Windows. Ist das ein Geraet, das gar nicht angeschlossen ist, ein
    //  stummgeschaltetes Webcam-Mikrofon oder "Stereomix", kommt entweder
    //  ein Fehler oder eine Aufnahme ohne Ton - obwohl ein brauchbares
    //  Mikrofon im Laptop steckt.
    //
    //  Deshalb jetzt der Reihe nach:
    //    1. das Mikrofon, das zuletzt funktioniert hat (im Browser gemerkt),
    //    2. das Standard-Mikrofon,
    //    3. jedes andere Mikrofon, das der Browser kennt.
    //  Genommen wird das erste, das sich oeffnen laesst UND etwas hoert.
    //  "Hoert etwas" heisst: nicht exakt null. Ein echtes Mikrofon rauscht
    //  immer ein wenig, auch im stillen Zimmer; ein totes Geraet liefert
    //  lauter Nullen. Geprueft wird dafuer kurz ohne Rauschunterdrueckung
    //  - die koennte leises Rauschen sonst selbst zu Null machen.
    //  Weicht das gefundene vom Standard ab, steht im Chat, welches es ist.
    //
    //  Was der Browser nicht kann: Einstellungen von Windows aendern.
    //  Sperrt Windows das Mikrofon ganz, sagt die Meldung jetzt genau, wo
    //  man es freigibt.
    // ----------------------------------------------------------------
    const MIKRO_MERKEN = 'afu_mikrofon';
    let mikroSucht = false;
    // Einmal geprueft, gilt es fuer diese Sitzung: Die naechste Aufnahme
    // startet ohne Pruefung und damit ohne Verzoegerung.
    let mikroBewaehrt = null;           // deviceId oder 'default'

    // Rauscht das Mikrofon? Im Zweifel ja - lieber eine stille Aufnahme
    // als gar keine.
    async function mikroHoertEtwas(stream, ms){
        let ctx = null;
        try{
            const AC = window.AudioContext || window.webkitAudioContext;
            if(!AC) return true;
            ctx = new AC();
            if(ctx.state === 'suspended'){ try{ await ctx.resume(); }catch(e){} }
            if(ctx.state !== 'running') return true;
            const an = ctx.createAnalyser();
            an.fftSize = 2048;
            ctx.createMediaStreamSource(stream).connect(an);
            const puffer = new Float32Array(an.fftSize);
            const ende = Date.now() + ms;
            let hoechst = 0;
            while(Date.now() < ende){
                await new Promise(r => setTimeout(r, 60));
                an.getFloatTimeDomainData(puffer);
                for(let i = 0; i < puffer.length; i++){ const v = Math.abs(puffer[i]); if(v > hoechst) hoechst = v; }
                if(hoechst > 0) return true;
            }
            return hoechst > 0;
        }catch(e){ return true; }
        finally{ try{ if(ctx) ctx.close(); }catch(e){} }
    }

    // Ein bestimmtes Mikrofon (id) oder das Standard-Mikrofon (null)
    // oeffnen und pruefen. Liefert { stream } oder { fehler, stumm }.
    async function mikroVersuchen(id){
        const genau = id ? { deviceId: { exact: id } } : {};
        let probe = null;
        try{
            probe = await navigator.mediaDevices.getUserMedia({ audio: Object.assign({ echoCancellation: false, noiseSuppression: false, autoGainControl: false }, genau) });
        }catch(e){ return { fehler: e }; }
        const spur = probe.getAudioTracks()[0];
        const echteId = (spur && spur.getSettings && spur.getSettings().deviceId) || id || '';
        const hoert = await mikroHoertEtwas(probe, 700);
        probe.getTracks().forEach(t => t.stop());
        if(!hoert) return { stumm: true, id: echteId, name: spur ? spur.label : '' };
        // Fuer die Aufnahme selbst wieder mit Echo- und Rauschunterdrueckung.
        try{
            const stream = await navigator.mediaDevices.getUserMedia({ audio: Object.assign({ echoCancellation: true, noiseSuppression: true, autoGainControl: true },
                                                                      echteId && echteId !== 'default' ? { deviceId: { exact: echteId } } : genau) });
            return { stream: stream, id: echteId, name: spur ? spur.label : '' };
        }catch(e){ return { fehler: e }; }
    }

    async function mikroOeffnen(){
        if(mikroBewaehrt){
            try{
                return await navigator.mediaDevices.getUserMedia({ audio: Object.assign({ echoCancellation: true, noiseSuppression: true, autoGainControl: true },
                                                                  mikroBewaehrt !== 'default' ? { deviceId: { exact: mikroBewaehrt } } : {}) });
            }catch(e){
                mikroBewaehrt = null;          // abgezogen? Dann neu suchen.
                if(e && e.name === 'NotAllowedError') throw e;
            }
        }
        let gemerkt = '';
        try{ gemerkt = localStorage.getItem(MIKRO_MERKEN) || ''; }catch(e){}
        const versucht = new Set();
        let ersterFehler = null, stummGefunden = null;
        const probieren = async (id) => {
            versucht.add(id || 'default');
            const r = await mikroVersuchen(id);
            if(r.stream) return r;
            if(r.stumm && !stummGefunden) stummGefunden = r;
            if(r.fehler && !ersterFehler) ersterFehler = r.fehler;
            // Keine Erlaubnis: Weiterprobieren bringt nichts und fragt nur
            // noch einmal nach.
            if(r.fehler && r.fehler.name === 'NotAllowedError') throw r.fehler;
            return null;
        };
        let r = null;
        if(gemerkt) r = await probieren(gemerkt);
        if(!r) r = await probieren(null);
        if(!r){
            let geraete = [];
            try{ geraete = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'audioinput'); }catch(e){}
            for(const d of geraete){
                if(!d.deviceId || d.deviceId === 'default' || d.deviceId === 'communications' || versucht.has(d.deviceId)) continue;
                r = await probieren(d.deviceId);
                if(r){ r.gewechselt = true; if(!r.name) r.name = d.label; break; }
            }
        }
        if(r){
            try{ if(r.id && r.id !== 'default') localStorage.setItem(MIKRO_MERKEN, r.id); }catch(e){}
            mikroBewaehrt = r.id || 'default';
            if(r.gewechselt){
                chatSystemmeldung('Mit dem Standard-Mikrofon ging es nicht – ich nehme jetzt '
                    + (r.name ? '„' + r.name + '“' : 'ein anderes Mikrofon') + '.');
            }
            return r.stream;
        }
        // Alle stumm: dann eben das stumme - vielleicht ist es nur sehr
        // leise. Aber sagen, wo man nachsieht.
        if(stummGefunden){
            try{
                const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
                chatSystemmeldung('Das Mikrofon scheint nichts zu hören. Ist es stummgeschaltet? '
                    + 'In Windows: Einstellungen → System → Sound → Eingabe.');
                return s;
            }catch(e){}
        }
        throw ersterFehler || Object.assign(new Error('kein Mikrofon'), { name: 'NotFoundError' });
    }

    function mikroFehlerText(e){
        const name = e && e.name, text = String((e && e.message) || '');
        if(name === 'NotAllowedError'){
            // Chrome und Edge sagen es dazu, wenn Windows selbst sperrt.
            if(/system/i.test(text)){
                return 'Windows lässt den Browser nicht ans Mikrofon. Freigeben unter: Einstellungen → '
                     + 'Datenschutz (und Sicherheit) → Mikrofon – dort den Zugriff einschalten, '
                     + 'auch für Desktop-Apps.';
            }
            return 'Kein Zugriff aufs Mikrofon. Bitte im Browser erlauben (Schloss-Symbol links neben der Adresse).';
        }
        if(name === 'NotReadableError' || name === 'AbortError'){
            return 'Das Mikrofon lässt sich nicht öffnen – vielleicht benutzt es gerade ein anderes Programm '
                 + '(Teams, Zoom, Skype). Das Programm schließen und noch einmal versuchen.';
        }
        return 'Kein Mikrofon gefunden. In Windows nachsehen: Einstellungen → System → Sound → Eingabe.';
    }

    async function aufnahmeStarten(){
        if(aufnahme || mikroSucht || !darfSprechen()) return;
        if(anruf.zustand){ chatSystemmeldung('Während eines Gesprächs geht keine Sprachnachricht – erst auflegen.'); return; }
        let stream;
        mikroSucht = true;
        try{
            stream = await mikroOeffnen();
        }catch(e){
            chatSystemmeldung(mikroFehlerText(e));
            return;
        }finally{
            mikroSucht = false;
        }
        // Waehrend der Suche kann der Raum zugegangen sein.
        if(aufnahme || !darfSprechen()){ try{ stream.getTracks().forEach(t => t.stop()); }catch(e){} return; }
        const arten = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm'];
        let art = '';
        try{ art = arten.find(a => MediaRecorder.isTypeSupported(a)) || ''; }catch(e){}
        let rec;
        try{ rec = new MediaRecorder(stream, art ? { mimeType: art, audioBitsPerSecond: 24000 } : { audioBitsPerSecond: 24000 }); }
        catch(e){ try{ rec = new MediaRecorder(stream); }catch(e2){ stream.getTracks().forEach(t => t.stop()); chatSystemmeldung('Aufnehmen geht in diesem Browser nicht.'); return; } }
        const a = { rec: rec, stream: stream, teile: [], start: Date.now(), uhr: null, weg: false,
                    pausiert: false, pauseSeit: 0, pauseGesamt: 0, pegel: [] };
        aufnahme = a;
        rec.ondataavailable = e => { if(e.data && e.data.size) a.teile.push(e.data); };
        rec.onstop = () => {
            welleStoppen(a);
            try{ a.stream.getTracks().forEach(t => t.stop()); }catch(e){}
            if(a.uhr) clearInterval(a.uhr);
            if(aufnahme === a) aufnahme = null;
            aufnahmeLeiste(false);
            pauseKnopfZeichnen(null);
            if(a.weg) return;
            // Ohne die Pausen (25.09.2026)
            const dauer = aufnahmeSekunden(a);
            const welle = spracheWelleAus(a.pegel || []);
            if(dauer < 1 || !a.teile.length){ chatSystemmeldung('Zu kurz - nichts gesendet.'); return; }
            const typ = (a.rec.mimeType || art || 'audio/webm').replace(/\s+/g, '');
            const blob = new Blob(a.teile, { type: typ });
            blob.arrayBuffer().then(buf => {
                if(!socket || !socket.connected){ chatSystemmeldung('Keine Verbindung - Sprachnachricht nicht gesendet.'); return; }
                const paket = { code: roomCode || '__haus', mime: typ, dauer: Math.min(SPRACHE_MAX_SEK, dauer),
                                daten: buf, name: getDuoUserName() };
                if(welle) paket.welle = welle;
                socket.emit('duoSprache', paket);
            }).catch(() => chatSystemmeldung('Die Aufnahme ging verloren.'));
        };
        rec.start(1000);
        aufnahmeLeiste(true);
        pauseKnopfZeichnen(a);
        welleStarten(a);
        const zeit = document.getElementById('duoChatAufnahmeZeit');
        const tick = () => {
            const s = aufnahmeSekunden(a);
            // Nur die laufende Zeit, wie bei WhatsApp (25.09.2026). Die
            // letzten zehn Sekunden vor der Minute wird sie rot - dann
            // wird von selbst gesendet.
            if(zeit){
                zeit.textContent = dauerMinSek(Math.floor(s));
                zeit.classList.toggle('knapp', s >= SPRACHE_MAX_SEK - 10);
            }
            if(s >= SPRACHE_MAX_SEK) aufnahmeBeenden(true);
        };
        tick();
        a.uhr = setInterval(tick, 250);
    }
    function aufnahmeBeenden(senden){
        const a = aufnahme;
        if(!a) return;
        a.weg = !senden;
        try{ if(a.rec.state !== 'inactive') a.rec.stop(); else a.rec.onstop(); }catch(e){ welleStoppen(a); aufnahme = null; aufnahmeLeiste(false); pauseKnopfZeichnen(null); }
    }
    // Aufgenommene Sekunden - die Pausen zaehlen nicht mit.
    function aufnahmeSekunden(a){
        const j = Date.now();
        return Math.max(0, (j - a.start - (a.pauseGesamt || 0) - (a.pausiert ? j - a.pauseSeit : 0)) / 1000);
    }
    // PAUSE (25.09.2026), wie bei WhatsApp: anhalten und weiter
    // aufnehmen, ohne neu anzufangen. Der Knopf wird dann zum Mikrofon.
    function aufnahmePause(){
        const a = aufnahme;
        if(!a || !a.rec) return;
        try{
            if(!a.pausiert){
                if(a.rec.state !== 'recording' || typeof a.rec.pause !== 'function') return;
                a.rec.pause();
                a.pausiert = true;
                a.pauseSeit = Date.now();
            } else {
                if(a.rec.state === 'paused') a.rec.resume();
                a.pauseGesamt += Date.now() - a.pauseSeit;
                a.pausiert = false;
            }
        }catch(e){ return; }
        pauseKnopfZeichnen(a);
    }
    function pauseKnopfZeichnen(a){
        const box = document.getElementById('duoChatAufnahme');
        const k = document.getElementById('duoChatAufnahmePause');
        const pause = !!(a && a.pausiert);
        if(box) box.classList.toggle('pausiert', pause);
        if(!k) return;
        // Kann der Browser nicht anhalten, gibt es den Knopf nicht.
        k.style.display = (a && a.rec && typeof a.rec.pause !== 'function') ? 'none' : '';
        k.innerHTML = pause ? '<i class="fa-solid fa-microphone"></i>' : '<i class="fa-solid fa-pause"></i>';
        k.title = pause ? 'Weiter aufnehmen' : 'Pause';
        k.setAttribute('aria-label', k.title);
    }

    // ----------------------------------------------------------------
    //  DIE WELLE WAEHREND DER AUFNAHME                    (25.09.2026)
    //  Dietmar am Vormittag: "Bei WhatsApp und Facebook Messenger sehe
    //  ich, wenn ich spreche, so eine Wellenform wie an einem Oszillator.
    //  Das haette ich auch gerne, wenn Sprache vom Mikrofon ankommt."
    //  Die erste Fassung war deshalb eine Oszilloskop-Spur. Am Abend
    //  schickte er ein Video der Aufnahmeleiste von WhatsApp: "So moechte
    //  ich den Sprachchat haben wie in WhatsApp."
    //
    //  Also jetzt wie dort: Zehnmal in der Sekunde ein senkrechter
    //  Balken, so hoch, wie laut gesprochen wurde. Der neueste steht
    //  rechts, die aelteren wandern nach links hinaus; Stille und der
    //  noch leere Teil sind Punkte. Gemessen wird in Dezibel - leise wie
    //  laute Stimmen sind gut zu sehen, Rauschen bleibt ein Punkt. Die
    //  Welle hoert am selben Mikrofon mit wie die Aufnahme und zeigt so
    //  auch gleich, ob ueberhaupt etwas ankommt.
    //
    //  Aus denselben Pegeln entsteht beim Senden die kleine Welle in der
    //  Sprechblase (spracheWelleAus): 32 Werte von 0 bis 100.
    // ----------------------------------------------------------------
    const WELLE_TAKT = 100;       // ms je Balken
    const WELLE_BLASE = 32;       // Balken in der Sprechblase
    function pegelAus(daten){
        let summe = 0;
        for(let i = 0; i < daten.length; i++) summe += daten[i] * daten[i];
        const db = 20 * Math.log10(Math.max(Math.sqrt(summe / daten.length), 1e-6));
        return Math.max(0, Math.min(1, (db + 50) / 38));       // -50 dB = 0, -12 dB = voll
    }
    function spracheWelleAus(pegel){
        const n = pegel.length;
        if(n < 4) return null;
        const aus = [];
        for(let i = 0; i < WELLE_BLASE; i++){
            const von = Math.floor(i * n / WELLE_BLASE);
            const bis = Math.max(von + 1, Math.floor((i + 1) * n / WELLE_BLASE));
            let m = 0;
            for(let k = von; k < bis && k < n; k++) if(pegel[k] > m) m = pegel[k];
            aus.push(Math.round(m * 100));
        }
        return aus;
    }
    function welleStarten(a){
        a.pegel = [];
        try{
            const cv = document.getElementById('duoChatWelle');
            const AC = window.AudioContext || window.webkitAudioContext;
            if(!cv || !AC || !a || !a.stream) return;
            const ctx = new AC();
            if(ctx.state === 'suspended'){ try{ ctx.resume(); }catch(e){} }
            const an = ctx.createAnalyser();
            an.fftSize = 1024;
            an.smoothingTimeConstant = 0;
            ctx.createMediaStreamSource(a.stream).connect(an);
            const daten = new Float32Array(an.fftSize);
            const g = cv.getContext('2d');
            let farbe = '', farbeZuletzt = 0, takt = 0, hoechst = 0;
            a.welle = { ctx: ctx, bild: 0 };
            const malen = () => {
                if(aufnahme !== a || !a.welle) return;
                const dpr = window.devicePixelRatio || 1;
                const w = Math.max(1, Math.round(cv.clientWidth * dpr));
                const h = Math.max(1, Math.round(cv.clientHeight * dpr));
                if(cv.width !== w || cv.height !== h){ cv.width = w; cv.height = h; }
                const jetzt = Date.now();
                if(!farbe || jetzt - farbeZuletzt > 1000){
                    try{ farbe = getComputedStyle(cv).color || '#888'; }catch(e){ farbe = '#888'; }
                    farbeZuletzt = jetzt;
                }
                // Waehrend der Pause steht die Welle still.
                if(!a.pausiert){
                    an.getFloatTimeDomainData(daten);
                    const p = pegelAus(daten);
                    if(p > hoechst) hoechst = p;
                    const t = Math.floor(aufnahmeSekunden(a) * 1000 / WELLE_TAKT);
                    if(takt < t){
                        while(takt < t){ a.pegel.push(hoechst); takt++; }
                        hoechst = 0;
                        if(a.pegel.length > 800) a.pegel.splice(0, a.pegel.length - 800);
                    }
                }
                g.clearRect(0, 0, w, h);
                g.fillStyle = farbe;
                const breit = 2 * dpr, schritt = 4 * dpr, mitte = h / 2;
                const anzahl = Math.floor(w / schritt);
                for(let k = 0; k < anzahl; k++){
                    const idx = a.pegel.length - 1 - k;
                    const x = w - (k + 1) * schritt + (schritt - breit) / 2;
                    const p = idx >= 0 ? a.pegel[idx] : -1;
                    if(p < 0.08){
                        // Stille - oder noch nichts aufgenommen: ein Punkt
                        g.globalAlpha = idx >= 0 ? 0.85 : 0.45;
                        g.beginPath();
                        g.arc(x + breit / 2, mitte, breit / 2, 0, Math.PI * 2);
                        g.fill();
                    } else {
                        g.globalAlpha = 0.9;
                        const hb = Math.max(breit * 1.5, p * (h - 2 * dpr));
                        g.beginPath();
                        if(typeof g.roundRect === 'function') g.roundRect(x, mitte - hb / 2, breit, hb, breit / 2);
                        else g.rect(x, mitte - hb / 2, breit, hb);
                        g.fill();
                    }
                }
                g.globalAlpha = 1;
                a.welle.bild = requestAnimationFrame(malen);
            };
            a.welle.bild = requestAnimationFrame(malen);
        }catch(e){}
    }
    function welleStoppen(a){
        if(!a || !a.welle) return;
        const w = a.welle;
        a.welle = null;
        try{ if(w.bild) cancelAnimationFrame(w.bild); }catch(e){}
        try{ if(w.ctx) w.ctx.close(); }catch(e){}
        try{ const cv = document.getElementById('duoChatWelle'); if(cv) cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); }catch(e){}
    }

    function spracheBlase(id){
        return document.querySelector('.duo-sprache[data-sprache-id="' + String(id).replace(/[^a-f0-9]/gi, '') + '"]');
    }
    // Wie weit ist abgespielt? Faerbt die Balken der Welle (oder den
    // schmalen Balken bei Nachrichten ohne Welle).
    function spracheFortschritt(b, anteil){
        if(!b) return;
        anteil = Math.max(0, Math.min(1, Number(anteil) || 0));
        const balken = b.querySelector('.duo-sprache-balken span');
        if(balken) balken.style.width = (100 * anteil) + '%';
        const striche = b.querySelectorAll('.duo-sprache-welle i');
        if(striche.length){
            const bis = Math.round(anteil * striche.length);
            striche.forEach((st, i) => st.classList.toggle('gespielt', i < bis));
        }
    }
    // Die Laenge: vom Browser, sonst aus der Nachricht. Aufnahmen aus dem
    // Browser (webm) nennen ihre Laenge oft nicht - dann "Infinity".
    function spracheLaenge(au, b){
        if(au && isFinite(au.duration) && au.duration > 0) return au.duration;
        return Number(b && b.dataset.dauer) || 0;
    }
    const spracheSprung = new Map();   // id -> Anteil, falls die Aufnahme erst geholt wird
    function spracheSpringen(id, anteil){
        anteil = Math.max(0, Math.min(1, Number(anteil) || 0));
        const au = spracheAudio.get(id);
        if(!au){ spracheSprung.set(id, anteil); spracheAbspielen(id); return; }
        const b = spracheBlase(id);
        const d2 = spracheLaenge(au, b);
        if(!d2) return;
        try{ au.currentTime = Math.min(Math.max(0, d2 - 0.05), anteil * d2); }catch(e){}
        spracheFortschritt(b, anteil);
        if(au.paused){ spracheAlleAnhalten(id); au.play().catch(()=>{}); }
    }
    // Die Zeichen im runden Knopf als Symbole statt als Schriftzeichen
    // (25.09.2026): Das Pausenzeichen war als Buchstabe winzig - bei
    // WhatsApp sind Abspielen und Anhalten deutlich zu sehen.
    const SPRACHE_ZEICHEN = { '▶': 'fa-play', '⏸': 'fa-pause', '…': 'fa-spinner fa-spin', '✕': 'fa-xmark' };
    function spracheKnopf(id, zeichen, titel){
        const b = spracheBlase(id);
        const k = b && b.querySelector('.duo-sprache-knopf');
        if(k){
            k.innerHTML = SPRACHE_ZEICHEN[zeichen] ? '<i class="fa-solid ' + SPRACHE_ZEICHEN[zeichen] + '"></i>' : zeichen;
            k.dataset.zeichen = zeichen;
            if(titel){ k.title = titel; k.setAttribute('aria-label', titel); }
        }
        return b;
    }
    function spracheAbspielen(id){
        const vorhanden = spracheAudio.get(id);
        if(vorhanden){
            if(vorhanden.paused){ spracheAlleAnhalten(id); vorhanden.play().catch(()=>{}); }
            else vorhanden.pause();
            return;
        }
        if(spracheWartet.has(id) || !socket) return;
        spracheWartet.add(id);
        spracheKnopf(id, '…', 'Wird geladen');
        socket.emit('spracheHolen', { id: id });
    }
    function spracheAlleAnhalten(ausser){
        spracheAudio.forEach((au, k) => { if(k !== ausser && !au.paused) au.pause(); });
    }

    // ================================================================
    //  ABSPIELGESCHWINDIGKEIT                              26.09.2026
    //  Dietmar waehlte aus der Roadmap: "Abspielgeschwindigkeit bei
    //  Sprachnachrichten" - der Vorschlag war ein Knopf 1x / 1,5x / 2x
    //  an der Sprechblase, wie bei WhatsApp.
    //
    //  Wie dort gilt die Wahl fuer ALLE Sprachnachrichten und bleibt
    //  gespeichert, bis man sie wieder aendert - wer schnell hoert, will
    //  das nicht bei jeder Nachricht neu einstellen. Gemerkt wird sie im
    //  Browser (je Geraet), nicht auf dem Server.
    //
    //  Die Stimme bleibt dabei in ihrer Tonlage (preservesPitch) - sonst
    //  klaenge es schneller wie Micky Maus.
    //
    //  DIE STUFEN: Zuerst waren es 1x / 1,5x / 2x wie bei WhatsApp.
    //  Dietmar am 26.09.2026: "Abspielgeschwindigkeit 1 und 1,25 und
    //  1,5. Die 2 braucht es nicht." Wer vorher 2x gewaehlt hatte,
    //  beginnt deshalb wieder bei 1x.
    // ================================================================
    const SPRACHE_TEMPI = [1, 1.25, 1.5];
    const SPRACHE_TEMPO_SCHLUESSEL = 'duo_spracheTempo';
    let spracheTempo = 1;
    try{
        const gemerkt = parseFloat(localStorage.getItem(SPRACHE_TEMPO_SCHLUESSEL));
        if(SPRACHE_TEMPI.indexOf(gemerkt) >= 0) spracheTempo = gemerkt;
    }catch(e){}
    function spracheTempoText(t){ return String(t).replace('.', ',') + '×'; }
    function spracheTempoSetzen(au){
        if(!au) return;
        try{ au.preservesPitch = true; au.mozPreservesPitch = true; au.webkitPreservesPitch = true; }catch(e){}
        try{ au.defaultPlaybackRate = spracheTempo; au.playbackRate = spracheTempo; }catch(e){}
    }
    function spracheTempoWeiter(){
        const i = SPRACHE_TEMPI.indexOf(spracheTempo);
        spracheTempo = SPRACHE_TEMPI[(i + 1) % SPRACHE_TEMPI.length];
        try{ localStorage.setItem(SPRACHE_TEMPO_SCHLUESSEL, String(spracheTempo)); }catch(e){}
        spracheAudio.forEach(au => spracheTempoSetzen(au));
        const text = spracheTempoText(spracheTempo);
        document.querySelectorAll('#duoChatVerlauf .duo-sprache-tempo').forEach(p => {
            p.textContent = text;
            p.setAttribute('aria-label', 'Abspielgeschwindigkeit ' + text + ' - anklicken zum Umschalten');
        });
    }
    // ================================================================
    //  SPRACHNACHRICHTEN AUTOMATISCH ABSPIELEN             26.09.2026
    //  Dietmar: "Sprachnachrichten automatisch abspielen waere noch gut.
    //  Das muss man aber unter Einstellungen aendern koennen."
    //
    //  Der Schalter steht in den Einstellungen (Allgemein, Kasten Chat)
    //  und wird im Browser gemerkt (duo_spracheAuto), wie die
    //  Geschwindigkeit. Standard ist AN - so war der Wunsch; wer es
    //  nicht mag, nimmt den Haken heraus.
    //
    //  Was abgespielt wird: nur neu ankommende Sprachnachrichten von
    //  anderen - nicht die eigenen, nicht der Verlauf beim Oeffnen.
    //  Kommen mehrere kurz hintereinander, laufen sie der Reihe nach.
    //  Gewartet wird, solange schon etwas spricht: eine andere
    //  Sprachnachricht, die man selbst angeklickt hat, oder das
    //  Vorlesen des Trainers. In einer laufenden Pruefung wird nichts
    //  abgespielt - dort bleibt es still, wie beim Benachrichtigungston.
    //  Laesst der Browser das Abspielen nicht zu (noch kein Klick auf
    //  der Seite), bleibt die Nachricht einfach zum Anklicken stehen.
    // ================================================================
    // ================================================================
    //  DER SCHLUESSEL DES ERSTELLERS                       26.09.2026
    //  Siehe DER RAUM GEHOERT DEM, DER IHN ERSTELLT HAT in Server.js.
    //  Je Raum-Code gemerkt, im localStorage - so uebersteht er auch einen
    //  geschlossenen Tab. Aeltere als zwei Tage werden weggeraeumt.
    // ================================================================
    function hostSchluesselMerken(code, schluessel){
        if(!code || !schluessel) return;
        try{
            const alle = JSON.parse(localStorage.getItem('duo_hostSchluessel') || '{}') || {};
            const jetzt = Date.now();
            Object.keys(alle).forEach(k => { if(!alle[k] || jetzt - (alle[k].zeit || 0) > 2 * 86400000) delete alle[k]; });
            alle[String(code).toUpperCase()] = { s: String(schluessel), zeit: jetzt };
            localStorage.setItem('duo_hostSchluessel', JSON.stringify(alle));
        }catch(e){}
    }
    function hostSchluesselFuer(code){
        try{
            const alle = JSON.parse(localStorage.getItem('duo_hostSchluessel') || '{}') || {};
            const e = alle[String(code || '').toUpperCase()];
            return e && e.s ? e.s : undefined;
        }catch(e){ return undefined; }
    }

    const SPRACHE_AUTO_SCHLUESSEL = 'duo_spracheAuto';
    function spracheAutoAn(){
        try{ return localStorage.getItem(SPRACHE_AUTO_SCHLUESSEL) !== '0'; }catch(e){ return true; }
    }
    const spracheAutoReihe = [];
    let spracheAutoUhr = null;
    function spracheAutoVormerken(id){
        if(!id || !spracheAutoAn()) return;
        spracheAutoReihe.push(String(id));
        spracheAutoWeiter();
    }
    function spracheSprichtGerade(){
        let laeuft = false;
        spracheAudio.forEach(au => { if(!au.paused && !au.ended) laeuft = true; });
        if(spracheWartet.size) laeuft = true;
        try{ if(window.ttsQueueActive) laeuft = true; }catch(e){}
        if(anruf.zustand) laeuft = true;     // waehrend eines Anrufs warten (27.09.2026)
        return laeuft;
    }
    function spracheAutoWeiter(){
        clearTimeout(spracheAutoUhr); spracheAutoUhr = null;
        if(!spracheAutoReihe.length) return;
        if(!spracheAutoAn()){ spracheAutoReihe.length = 0; return; }
        if(pruefungLaeuft()){ spracheAutoReihe.length = 0; return; }
        if(spracheSprichtGerade()){ spracheAutoUhr = setTimeout(spracheAutoWeiter, 500); return; }
        const id = spracheAutoReihe.shift();
        if(!spracheBlase(id)){ spracheAutoWeiter(); return; }     // inzwischen geloescht
        const au = spracheAudio.get(id);
        if(au){ try{ au.currentTime = 0; }catch(e){} spracheAlleAnhalten(id); au.play().catch(()=>{}); }
        else spracheAbspielen(id);
        if(spracheAutoReihe.length) spracheAutoUhr = setTimeout(spracheAutoWeiter, 800);
    }
    window.duoSpracheAutoAn = spracheAutoAn;

    function spracheDatenAngekommen(d){
        if(!d || !d.id) return;
        const id = String(d.id);
        spracheWartet.delete(id);
        if(d.fehlt || !d.daten){ spracheKnopf(id, '✕', 'Nicht mehr verfügbar - der Trainer wurde inzwischen neu gestartet'); return; }
        const typ = String(d.mime || 'audio/webm');
        const au = new Audio();
        if(au.canPlayType && au.canPlayType(typ.split(';')[0]) === ''){
            spracheKnopf(id, '✕', 'Dieser Browser kann die Aufnahme nicht abspielen (' + typ.split(';')[0] + ')');
            return;
        }
        au.src = URL.createObjectURL(new Blob([d.daten], { type: typ }));
        spracheTempoSetzen(au);
        spracheAudio.set(id, au);
        spracheKnopf(id, '▶', 'Abspielen');
        // Die Blase wird bei jedem Schritt neu gesucht: Nach einem
        // Neuverbinden wird der Verlauf neu gezeichnet, dann ist es eine
        // andere.
        const gesamtText = () => { const b = spracheBlase(id); return dauerMinSek(Number(b && b.dataset.dauer) || 0); };
        const anzeigen = () => {
            const b = spracheBlase(id);
            if(!b) return;
            const d2 = spracheLaenge(au, b);
            if(d2) spracheFortschritt(b, au.currentTime / d2);
            // Waehrend des Abspielens die laufende Zeit, sonst die Laenge -
            // wie bei WhatsApp (25.09.2026).
            const f = b.querySelector('.duo-sprache-dauer');
            if(f) f.textContent = (au.paused && !au.currentTime) ? gesamtText() : dauerMinSek(Math.floor(au.currentTime));
            // Die Pille fuer die Geschwindigkeit zeigt sich, solange die
            // Nachricht laeuft oder mittendrin angehalten ist (26.09.2026).
            b.classList.toggle('laeuft', !au.paused || au.currentTime > 0);
        };
        let lauf = 0;
        const schleife = () => { anzeigen(); if(!au.paused && !au.ended) lauf = requestAnimationFrame(schleife); };
        au.addEventListener('play', () => { spracheKnopf(id, '⏸', 'Anhalten'); cancelAnimationFrame(lauf); lauf = requestAnimationFrame(schleife); });
        au.addEventListener('pause', () => { spracheKnopf(id, '▶', 'Abspielen'); cancelAnimationFrame(lauf); anzeigen(); });
        au.addEventListener('timeupdate', anzeigen);
        au.addEventListener('ended', () => {
            cancelAnimationFrame(lauf);
            try{ au.currentTime = 0; }catch(e){}
            const b = spracheBlase(id);
            spracheFortschritt(b, 0);
            if(b) b.classList.remove('laeuft');
            const f = b && b.querySelector('.duo-sprache-dauer');
            if(f) f.textContent = gesamtText();
            spracheKnopf(id, '▶', 'Abspielen');
        });
        spracheAlleAnhalten(id);
        const sprung = spracheSprung.get(id);
        spracheSprung.delete(id);
        if(sprung){
            const b = spracheBlase(id);
            const d2 = Number(b && b.dataset.dauer) || 0;
            if(d2) try{ au.currentTime = Math.min(Math.max(0, d2 - 0.05), sprung * d2); }catch(e){}
        }
        au.play().catch(() => spracheKnopf(id, '▶', 'Abspielen'));
    }

    function chatNachrichtAnzeigen(n, stumm){
        chatAufbauen();
        // Robust gegen Reihenfolge: die automatische Begruessung kann eintreffen,
        // bevor showRoomUI() das Fenster sichtbar gemacht hat.
        if(roomCode) chatSichtbarkeitPruefen();
        if(!n || (!n.text && !n.geloescht)) return;
        // Ohne Raum: Sobald etwas geschrieben wurde, bleibt der Chat da -
        // auch wenn der Besucher danach wieder geht. Sonst waere die
        // Frage weg, bevor der Gastgeber sie lesen konnte.
        if(!roomCode){
            hausChatHatNachrichten = true;
            try{ chatSichtbarkeitPruefen(); }catch(e){}
        }
        if(n.id && chatGesehen.has(n.id)) return;      // Doppelte vermeiden
        if(n.id) chatGesehen.add(n.id);

        const verlauf = document.getElementById('duoChatVerlauf');
        if(!verlauf) return;
        const leer = document.getElementById('duoChatLeer');
        if(leer) leer.remove();

        // "meine" setzt der Server im Verlauf (25.09.2026): Nach einem
        // Neuverbinden hat der Browser eine neue Socket-id, die eigenen
        // Nachrichten von vorher bleiben trotzdem die eigenen.
        const eigen = !!((n.userId && n.userId === myUserId) || n.meine);
        const zeile = document.createElement('div');
        if(n.id) zeile.dataset.id = String(n.id);
        // Eine Systemzeile ("... ist dazugekommen") ist keine Nachricht
        // von jemandem: mittig, schmal, ohne Absender. Die Klasse dafuer
        // gab es schon, sie wurde bisher nur lokal benutzt.
        zeile.className = 'duo-chat-zeile ' + (n.system ? 'duo-chat-system' :
            (n.automatisch ? 'duo-chat-willkommen' : (eigen ? 'duo-chat-eigen' : 'duo-chat-fremd')));
        // escapeHtml ist Pflicht - der Text kommt von anderen Teilnehmern
        // "am Link" steht dabei, wenn die Nachricht aus dem Chat ohne Raum
        // kommt. Fuer den Gastgeber ist das der Unterschied zwischen
        // "einer meiner Teilnehmer" und "jemand, der gerade die Seite
        // gefunden hat" - und der bestimmt, wie man antwortet.
        // "am Link" stand hier bis zum 21.09.2026 hinter dem Namen, damit
        // der Gastgeber Raumteilnehmer von Link-Besuchern unterscheiden
        // konnte. Dietmar: "mit Link klingt doof im Chat." Seit es die
        // Ankunftsmeldung gibt, weiss er ohnehin, wer hereingekommen ist.
        const woher = '';
        // " · Host" hinter dem Namen des Gastgebers: Dietmar am 23.09.2026:
        // "Das Wort Host im Chat klingt doof." Auf die Rueckfrage, was
        // stattdessen dastehen soll, seine Antwort: "Server".
        if(n.lerncoach) zeile.className = 'duo-chat-zeile duo-chat-fremd duo-chat-coach';   // fremd: Leiste und Knopf sitzen wie bei allen anderen
        const absender = n.lerncoach
            ? '<span class="duo-chat-absender">' + (n.funki ? '<i class="fa-solid fa-robot"></i> Funki (KI)' : '<i class="fa-solid fa-graduation-cap"></i> Lerncoach (KI)')
              + (n.fuer ? ' · für ' + (n.fuerId && n.fuerId === myUserId ? 'dich' : escapeHtml(n.fuer)) : '') + '</span>'
            : (n.system || (eigen && !n.automatisch)) ? '' :
            '<span class="duo-chat-absender">' + escapeHtml(n.name || 'Teilnehmer') +
            (n.istHost ? ' · Server' : '') + woher + '</span>';
        const mitHaken = eigen && !n.system && !n.automatisch && n.id && !n.geloescht;
        if(n.geloescht){
            zeile.innerHTML = absender + geloeschtHtml(n.geloescht)
                + '<span class="duo-chat-zeit">' + chatZeit(n.zeit) + '</span>';
            verlauf.appendChild(zeile);
            while(verlauf.children.length > 200) verlauf.removeChild(verlauf.firstChild);
            chatNachUntenRollen();
            return;
        }
        // Reagieren kann man auf alles, was jemand geschrieben oder
        // gesprochen hat - nicht auf die Zeilen, die der Server selbst
        // schreibt.
        const mitLeiste = !n.system && !n.automatisch && n.id;
        // Mit Welle, wenn der Absender sie mitgeschickt hat (seit
        // 25.09.2026) - sonst der schmale Balken wie bisher.
        const welleWerte = (n.sprache && Array.isArray(n.sprache.welle) && n.sprache.welle.length >= 4) ? n.sprache.welle.slice(0, 64) : null;
        const koerper = (n.sprache && n.id)
            ? '<span class="duo-sprache" data-sprache-id="' + escapeHtml(n.id) + '" data-dauer="' + (Number(n.sprache.dauer) || 0) + '">'
              + '<button type="button" class="duo-sprache-knopf" title="Abspielen" aria-label="Abspielen" data-zeichen="▶"><i class="fa-solid fa-play"></i></button>'
              + (welleWerte
                  ? '<span class="duo-sprache-welle" title="Anklicken: an diese Stelle springen">'
                    + welleWerte.map(v => '<i style="height:' + Math.max(12, Math.min(100, Math.round(Number(v) || 0))) + '%"></i>').join('')
                    + '</span>'
                  : '<span class="duo-sprache-balken"><span></span></span>')
              + '<span class="duo-sprache-dauer">' + dauerMinSek(n.sprache.dauer) + '</span>'
              + '<button type="button" class="duo-sprache-tempo" title="Abspielgeschwindigkeit" aria-label="Abspielgeschwindigkeit '
              + spracheTempoText(spracheTempo) + ' - anklicken zum Umschalten">' + spracheTempoText(spracheTempo) + '</button></span>'
            : (n.bild || n.frage)
                ? anhangHtml(n) + (n.ohneText ? '' : '<div>' + chatLinks(smileysErsetzen(escapeHtml(n.text))) + '</div>')
                : chatLinks(smileysErsetzen(escapeHtml(n.text)));
        if(n.bild || n.frage) zeile.classList.add('mit-anhang');
        if(n.lerncoach){ const d = document.getElementById('duoLcDenkt'); if(d) d.remove(); }
        if(n.zuAntwort) lcVorleseAngebotWeg(n.zuAntwort);
        zeile.innerHTML = absender + koerper +
            // Sprachnachricht auf Wunsch (29.09.2026), siehe lcVorlesen in Server.js.
            (n.lerncoach && !n.sprache && n.vorlesenAngebot && n.id
                ? '<span class="duo-coach-vorlesen" data-lc-vorlesen="' + escapeHtml(n.id) + '">🎤 Soll ich dir das auch als Sprachnachricht schicken? '
                  + '<button type="button">Ja, bitte</button></span>' : '') +
            (n.lerncoach && !n.sprache && !n.ohneHinweis ? '<span class="duo-coach-hinweis">Erklärung einer KI – sie kann sich irren. Im Zweifel: Formelsammlung und 50ohm.de.</span>' : '') +
            '<span class="duo-chat-zeit">' + chatZeit(n.zeit) + '</span>' +
            (mitHaken ? '<span class="duo-chat-haken" data-haken="' + escapeHtml(n.id) + '"></span>' : '') +
            (mitLeiste ? leisteHtml(darfLoeschen(eigen)) : '');
        verlauf.appendChild(zeile);
        // Die Zeichnungen einer geteilten Frage laden nach - dann soll die
        // Liste trotzdem unten bleiben, wenn sie unten war.
        if(n.frage){
            zeile.querySelectorAll('img').forEach(im => im.addEventListener('load', () => {
                const v = document.getElementById('duoChatVerlauf'); if(v && chatAmEnde) v.scrollTop = v.scrollHeight;
            }, { once:true }));
        }
        if(mitLeiste && (n.reaktionen || reaktStand.has(String(n.id)))){
            reaktionenZeichnen(String(n.id), n.reaktionen || reaktStand.get(String(n.id)));
        }
        if(mitHaken){
            hakenSetzen(n.id, gelesenStand.get(n.id) || n.gelesen || null, n.empfaenger);
        } else if(!eigen && !n.system && !n.automatisch && n.id){
            zuMelden.add(n.id);
            gelesenMelden();
        }

        while(verlauf.children.length > 200) verlauf.removeChild(verlauf.firstChild);
        chatNachUntenRollen();

        if(stumm || eigen) return;

        // Automatisch abspielen (siehe SPRACHNACHRICHTEN AUTOMATISCH ABSPIELEN).
        if(n.sprache && n.id && !n.system && !n.automatisch && !pruefungLaeuft()
           && (!n.lerncoach || n.fuerId === myUserId)){
            try{ spracheAutoVormerken(n.id); }catch(e){}
        }

        // Ton und Aufklappen nur bei echten Nachrichten - nicht bei den
        // Zeilen, die der Server selbst schreibt ("betritt den Server").
        const echteNachricht = !n.system && !n.automatisch;
        if(echteNachricht && !pruefungLaeuft()) chatTonSpielen();

        if(!chatOffen){
            chatUngelesen++;
            chatBlaseAktualisieren();
            // Aufklappen - aber nicht mitten in einer laufenden Pruefung.
            // Ohne den Fokus ins Eingabefeld zu ziehen (23.09.2026): Wer
            // gerade eine Frage per Tastatur beantwortet, soll nicht auf
            // einmal in den Chat tippen.
            if(!pruefungLaeuft()) chatUmschalten(true, true);
        }
    }

    // ----------------------------------------------------------------
    //  LOESCHEN UND REAGIEREN                             (25.09.2026)
    //  Dietmar: "Ich moechte auch Nachrichten loeschen und Liken koennen.
    //  Bitte kein Rotes Herz, sondern in Gruen Daumen Hoch und Daumen
    //  runter. Lustig und traurig."
    //
    //  Loeschen: die eigene Nachricht - und als Gastgeber jede (im
    //  Gruppenraum der Host, im Chat ohne Raum der Trainer-PC). Der
    //  Server prueft das noch einmal; hier geht es nur darum, keinen
    //  Papierkorb zu zeigen, der dann nichts tut. Nach dem Loeschen steht
    //  bei allen "Nachricht geloescht" an der Stelle.
    //
    //  Reaktionen: eine je Person. Noch einmal dieselbe nimmt sie zurueck,
    //  eine andere ersetzt sie. Unter der Blase stehen die Zahlen; wer
    //  reagiert hat, steht im Hinweis beim Zeigen darauf.
    // ----------------------------------------------------------------
    //  25.09.2026, abends: dazu ein gruenes Herz. Dietmar: "Nachrichten
    //  Liken. Daumen hoch und runter. Lustig Traurig und ein Gruenes
    //  Herz." Und statt der Symbole (Daumen gruen, Gesichter orange) auf
    //  die Rueckfrage mit beiden Bildern: "nimm bitte B." - "wie bei
    //  WhatsApp". Also bunte Emojis; die Daumen sind damit gelb, das
    //  Herz bleibt gruen, ein rotes gibt es weiterhin nicht.
    // ----------------------------------------------------------------
    const REAKT_ARTEN = [
        { art: 'hoch',    zeichen: '\u{1F44D}', titel: 'Daumen hoch' },     // 👍
        { art: 'runter',  zeichen: '\u{1F44E}', titel: 'Daumen runter' },   // 👎
        { art: 'lustig',  zeichen: '\u{1F602}', titel: 'Lustig' },          // 😂
        { art: 'traurig', zeichen: '\u{1F622}', titel: 'Traurig' },         // 😢
        { art: 'herz',    zeichen: '\u{1F49A}', titel: 'Grünes Herz' },     // 💚
        // Und noch drei. Dietmar: "4 Blaetteriges Kleeblatt. Erstaunt und :)
        // haette ich gerne noch mit drin."
        { art: 'klee',    zeichen: '\u{1F340}', titel: 'Kleeblatt' },       // 🍀
        { art: 'staunen', zeichen: '\u{1F62E}', titel: 'Erstaunt' },        // 😮
        { art: 'laecheln', zeichen: '\u{1F642}', titel: 'Lächeln' }         // 🙂
    ];
    const reaktStand = new Map();       // Nachrichten-id -> { zaehler, namen, meine }

    function darfLoeschen(eigen){
        if(eigen) return true;
        return roomCode ? !!isHost : !vonAussen;
    }
    function leisteHtml(mitLoeschen){
        return '<button type="button" class="duo-chat-mehr" title="Reagieren' + (mitLoeschen ? ' oder löschen' : '') + '" aria-label="Reagieren">'
             + '<i class="fa-regular fa-face-smile"></i></button>'
             + '<span class="duo-chat-reaktionen"></span>'
             + '<span class="duo-chat-leiste">'
             + REAKT_ARTEN.map(a => '<button type="button" data-reagieren="' + a.art + '" title="' + a.titel + '" aria-label="' + a.titel + '">'
                                  + '<span class="duo-emoji r-' + a.art + '">' + a.zeichen + '</span></button>').join('')
             + (mitLoeschen ? '<button type="button" class="weg" data-loeschen="1" title="Löschen" aria-label="Löschen"><i class="fa-solid fa-trash-can"></i></button>' : '')
             + '</span>';
    }
    function geloeschtHtml(von){
        return '<span class="duo-chat-geloescht"><i class="fa-solid fa-ban"></i> '
             + (von === 'server' ? 'Vom Server gelöscht' : 'Nachricht gelöscht') + '</span>';
    }
    function zeileFuer(id){
        return document.querySelector('#duoChatVerlauf .duo-chat-zeile[data-id="' + String(id).replace(/[^a-f0-9]/gi, '') + '"]');
    }
    function leisteUmschalten(zeile){
        const auf = !zeile.classList.contains('aktiv');
        document.querySelectorAll('#duoChatVerlauf .duo-chat-zeile.aktiv').forEach(z => z.classList.remove('aktiv'));
        if(auf){
            zeile.classList.add('aktiv');
            // Die unterste Blase: Leiste nicht unter den Rand rutschen lassen.
            try{ zeile.scrollIntoView({ block: 'nearest' }); }catch(e){}
        }
    }
    function reagieren(id, art){
        if(!id || !socket || !socket.connected) return;
        socket.emit('chatReagieren', { id: String(id), art: String(art || ''), name: getDuoUserName() });
    }
    function reaktionenZeichnen(id, r){
        id = String(id);
        if(r && r.zaehler) reaktStand.set(id, r); else { reaktStand.delete(id); r = null; }
        const z = zeileFuer(id);
        if(!z) return;
        const feld = z.querySelector('.duo-chat-reaktionen');
        if(!feld) return;
        let html = '';
        REAKT_ARTEN.forEach(a => {
            const anz = r ? Number(r.zaehler[a.art] || 0) : 0;
            if(!anz) return;
            const namen = (r.namen && Array.isArray(r.namen[a.art]) ? r.namen[a.art] : []).map(String).join(', ');
            html += '<button type="button" class="duo-reakt' + (r.meine === a.art ? ' meine' : '') + '" data-reagieren="' + a.art + '"'
                  + ' title="' + escapeHtml(a.titel + (namen ? ': ' + namen : '')) + '">'
                  + '<span class="duo-emoji r-' + a.art + '">' + a.zeichen + '</span>' + anz + '</button>';
        });
        feld.innerHTML = html;
        z.querySelectorAll('.duo-chat-leiste [data-reagieren]').forEach(b => {
            b.classList.toggle('meine', !!(r && r.meine === b.dataset.reagieren));
        });
    }
    function nachrichtLoeschen(id){
        if(!id) return;
        const weiter = () => {
            if(!socket || !socket.connected){ chatSystemmeldung('Keine Verbindung – nicht gelöscht.'); return; }
            socket.emit('chatLoeschen', { id: String(id) });
        };
        if(typeof window.showAppConfirm === 'function'){
            // Der Dialog lag bisher UNTER dem Chatfenster (99997 gegen
            // 99998) - bei kleinem Fenster haette der Chat ihn verdeckt.
            try{ const m = document.getElementById('genericConfirmModal'); if(m) m.style.zIndex = '100000'; }catch(e){}
            window.showAppConfirm('Diese Nachricht für alle löschen?', weiter, {
                title: 'Nachricht löschen?',
                details: 'Sie verschwindet bei allen im Chat. An ihrer Stelle steht dann „Nachricht gelöscht“.',
                confirmLabel: '<i class="fas fa-trash-can"></i> Löschen',
                confirmColor: '#b91c1c',
                icon: 'fa-trash-can'
            });
        } else if(window.confirm('Diese Nachricht für alle löschen?')) weiter();
    }
    function nachrichtGeloescht(d){
        if(!d || !d.id) return;
        const id = String(d.id);
        reaktStand.delete(id);
        const au = spracheAudio.get(id);
        if(au){ try{ au.pause(); URL.revokeObjectURL(au.src); }catch(e){} spracheAudio.delete(id); }
        const z = zeileFuer(id);
        if(!z) return;
        const abs = z.querySelector('.duo-chat-absender');
        const zeit = z.querySelector('.duo-chat-zeit');
        z.classList.remove('aktiv');
        z.innerHTML = (abs ? abs.outerHTML : '') + geloeschtHtml(d.von) + (zeit ? zeit.outerHTML : '');
    }

    // ----------------------------------------------------------------
    //  DER TON FUER EINGEHENDE NACHRICHTEN                (23.09.2026)
    //  Dietmar: "chat-eingang.mp3 ist drin. Der Sound soll abgespielt
    //  werden, wenn ein Benutzer etwas schreibt. Der Chat soll sich
    //  dabei oeffnen."
    //
    //  Die Datei hat er bei Pixabay ausgesucht ("Soft Notification");
    //  die Lizenz dort erlaubt den Einbau ohne Namensnennung.
    //
    //  Hoechstens alle zweieinhalb Sekunden: Schreiben drei Leute
    //  gleichzeitig, klingt es einmal und nicht dreimal. Waehrend einer
    //  Pruefung still, so wie der Chat dann auch nicht aufspringt.
    //
    //  Browser lassen Toene erst nach dem ersten Klick oder Tastendruck
    //  auf der Seite zu. Deshalb wird der Ton bei der ersten Beruehrung
    //  einmal lautlos angespielt - danach darf er (siehe tonFreischalten
    //  in Index.html, dasselbe Verfahren).
    // ----------------------------------------------------------------
    let chatTon = null;
    let chatTonZuletzt = 0;
    function chatTonHolen(){
        if(!chatTon){
            chatTon = new Audio('sounds/chat-eingang.mp3');
            chatTon.preload = 'auto';
            chatTon.volume = 0.7;
        }
        return chatTon;
    }
    function chatTonSpielen(){
        try{
            const jetzt = Date.now();
            if(jetzt - chatTonZuletzt < 2500) return;
            chatTonZuletzt = jetzt;
            const a = chatTonHolen();
            a.volume = 0.7;
            a.currentTime = 0;
            const pr = a.play();
            if(pr && pr.catch) pr.catch(function(e){ console.log('[CHAT] Ton nicht abgespielt: ' + (e && e.name)); });
        }catch(e){}
    }
    function chatTonFreischalten(){
        try{
            const a = chatTonHolen();
            a.volume = 0;
            const zurueck = function(){ try{ a.pause(); a.currentTime = 0; a.volume = 0.7; }catch(e){} };
            const pr = a.play();
            if(pr && pr.then) pr.then(zurueck).catch(zurueck); else zurueck();
        }catch(e){}
    }
    ['pointerdown', 'keydown', 'touchstart'].forEach(function(art){
        document.addEventListener(art, chatTonFreischalten, { once: true, passive: true });
    });

    // ----------------------------------------------------------------
    //  DER GRUENE KNOPF: LINK ZUM HERUNTERLADEN              (23.09.2026)
    //  Dietmar, mit einem Bild aus dem Chat - ein Besucher fragte "wo
    //  kann ich den Trainer downloaden?": "Hier wuensche ich mir einen
    //  gruenen Button zum Senden, wenn noch nichts im Chat geschrieben
    //  wurde. Klicke ich da drauf, geht der Link zum Download raus.
    //  Schreibe ich was, aendert sich die Farbe in Standard."
    //
    //  Nur beim Gastgeber: am Trainer-PC selbst (Chat ohne Raum) oder als
    //  Host eines Gruppenraums. Ein Besucher hat den gewoehnlichen Knopf.
    //  Verschickt wird die GitHub-Seite, nicht die Datei selbst: Dort
    //  steht der Knopf zum Herunterladen fuer Windows, Linux und Mac,
    //  dazu, was man mit der Datei macht.
    // ----------------------------------------------------------------
    // ================================================================
    //  LERNCOACH                                          (29.09.2026)
    //  Dietmar: "Nehmen wir mal an, du als KI bist im Chat mit drin und
    //  kannst Fragen erklaeren." Der Server sagt, ob er an ist
    //  (lerncoachStand) - dann gibt es an jeder geteilten Frage den Knopf
    //  "Lerncoach fragen", und wer eine Nachricht mit @KI beginnt, fragt
    //  ihn direkt. Die Antwort kommt fuer alle sichtbar in den Chat, als
    //  Text und als Sprachnachricht; abgespielt wird die von selbst nur
    //  bei dem, der gefragt hat. Beim ersten Mal steht im Chat, wohin die
    //  Frage geht - einmal je Browser.
    // ================================================================
    var lerncoachAn = false;
    var lerncoachAnbieter = 'anthropic';
    // Wie LC_RE in Server.js: @KI oder "Hey KI" (29.09.2026), dazu Funki
    // (30.09.2026, Dietmar: "Funki soll auch im Chat aktiv sein. Funki,
    // ich habe eine Frage."): "Funki, ...", "Hey Funki", @Funki.
    var LC_KI_RE = /^\s*(?:@(?:ki|lerncoach|funki)\b|(?:hey|hallo|hi|hei|he|moin|servus)[\s,!]+(?:ki|lerncoach|coach|funki)\b|funki(?=\s*[,:!?]|\s*$))/i;
    function lerncoachStand(d){
        lerncoachAn = !!(d && d.an);
        lerncoachAnbieter = (d && d.anbieter === 'openrouter') ? 'openrouter' : 'anthropic';
        document.body.classList.toggle('lerncoach-an', lerncoachAn);
        if(lerncoachAn){
            let schon = false;
            try{ schon = localStorage.getItem('lerncoach_tipp') === '1'; }catch(e){}
            const box = document.getElementById('duoChatBox');
            if(!schon && box && box.classList.contains('sichtbar')){
                chatSystemmeldung('Neu: der Lerncoach (KI). Beginne eine Nachricht mit „Hey KI“, @KI oder „Funki,“ – oder tippe an einer geteilten Frage auf „Lerncoach fragen“.');
                try{ localStorage.setItem('lerncoach_tipp', '1'); }catch(e){}
            }
        }
    }
    // true = darf los
    function lerncoachVorSenden(text){
        if(!lerncoachAn){
            chatSystemmeldung(/funki/i.test(String(text || '')) ? 'Funki kann im Chat antworten, sobald der Kursleiter den Lerncoach (KI) einschaltet.'
                                                                : 'Der Lerncoach ist auf diesem Trainer nicht eingeschaltet.');
            return true;
        }
        if(pruefungLaeuft()){ chatSystemmeldung('Während einer Prüfung hilft der Lerncoach nicht – danach gern.'); return false; }
        let schon = false;
        // _2 seit 29.09.2026: Der Hinweis sagt jetzt "siehst nur du" - wer den alten kennt, soll den neuen einmal sehen.
        try{ schon = localStorage.getItem('lerncoach_datenschutz_2') === '1'; }catch(e){}
        if(!schon){
            chatSystemmeldung(lerncoachAnbieter === 'openrouter'
                ? 'Hinweis: Fragen an den Lerncoach gehen ohne deinen Namen über OpenRouter an ein KI-Modell. Der Trainer-PC des Kursleiters speichert Frage und Antwort mit Vornamen. Frage und Antwort siehst nur du – die anderen sehen nur, dass du gefragt hast.'
                : 'Hinweis: Fragen an den Lerncoach gehen mit deinem Vornamen an die KI Claude (Anthropic) und werden auf dem Trainer-PC des Kursleiters gespeichert. Frage und Antwort siehst nur du – die anderen sehen nur, dass du gefragt hast.');
            try{ localStorage.setItem('lerncoach_datenschutz_2', '1'); }catch(e){}
        }
        return true;
    }
    function lcVorleseAngebotWeg(id){
        try{ document.querySelectorAll('.duo-coach-vorlesen').forEach(el => { if(el.dataset.lcVorlesen === id) el.remove(); }); }catch(e){}
    }
    function lerncoachFrageKnopf(nachrichtId){
        if(!socket || !nachrichtId) return;
        if(!lerncoachVorSenden()) return;
        socket.emit('lerncoachFragen', { code: roomCode || '__haus', id: nachrichtId, name: roomCode ? undefined : getDuoUserName() });
    }
    // Mit Sekundenzaehler und "zweiter Versuch" (29.09.2026). Dietmar: "es
    // dauert fast eine Minute, bis eine Antwort kommt" - wer wartet, soll
    // wenigstens sehen, dass etwas passiert.
    var lcDenktSeit = 0, lcDenktUhr = 0;
    function lerncoachDenkt(d){
        const verlauf = document.getElementById('duoChatVerlauf');
        let el = document.getElementById('duoLcDenkt');
        if(!d || !d.an){ if(el) el.remove(); clearInterval(lcDenktUhr); lcDenktUhr = 0; return; }
        if(!verlauf) return;
        if(!el){
            el = document.createElement('div');
            el.id = 'duoLcDenkt';
            el.className = 'duo-chat-zeile duo-chat-coach denkt';
            verlauf.appendChild(el);
            lcDenktSeit = Date.now();
        }
        // Ohne Namen (29.09.2026). Dietmar: "Lerncoach denkt nach (fuer
        // Dietmar) ... (fuer Dietmar) moechte ich raus haben".
        el.innerHTML = (d.funki ? '<i class="fa-solid fa-robot"></i> Funki überlegt' : '<i class="fa-solid fa-graduation-cap"></i> Lerncoach denkt nach')
            + ' <span class="p">●</span><span class="p">●</span><span class="p">●</span>'
            + ' <span class="sek" style="opacity:.7"></span>'
            + (d.versuch > 1 ? '<br><span style="font-size:.7rem;opacity:.75">Die erste Antwort war unbrauchbar – ' + (d.versuch === 2 ? 'zweiter' : 'dritter') + ' Versuch …</span>' : '');
        const zeigen = () => { const e = document.querySelector('#duoLcDenkt .sek'); if(!e){ clearInterval(lcDenktUhr); lcDenktUhr = 0; return; }
            const sek = Math.round((Date.now() - lcDenktSeit) / 1000); e.textContent = sek >= 3 ? sek + ' s' : ''; };
        zeigen();
        if(!lcDenktUhr) lcDenktUhr = setInterval(zeigen, 1000);
        chatNachUntenRollen();
    }

    // ================================================================
    //  BILDER IM CHAT                                     (29.09.2026)
    //  Dietmar: "Bilder über dem Messenger, geht das auch?" Auf die
    //  Rueckfrage: schicken duerfen alle, und dazu soll man eine Frage
    //  aus dem Trainer teilen koennen - "Bild zur Frage und auch eigene
    //  Bilder".
    //
    //  Eigene Bilder: Knopf neben dem Mikrofon, Einfuegen (Strg+V) ins
    //  Eingabefeld oder ein Bild auf den Chat ziehen. Der Browser
    //  rechnet es selbst klein (lange Seite hoechstens 1600 Punkte, JPEG)
    //  und macht dazu ein kleines Vorschaubild. Nur das Vorschaubild geht
    //  mit der Nachricht an alle; das grosse holt sich, wer darauf tippt.
    //  Beim Neuzeichnen fallen die Zusatzdaten des Fotos weg - auch der
    //  Aufnahmeort, den ein Handy sonst mitschreibt.
    //
    //  Frage teilen: der Knopf an der Frage (Index.html, frageInDenChat)
    //  haengt Nummer, Text, Zeichnung und die vier Antworten an - so, wie
    //  der Absender sie sieht, aber OHNE die richtige. Dann kann man
    //  darueber reden, ohne dass jemand die Loesung vorgesagt bekommt.
    //
    //  Beides geht nicht sofort weg, sondern steht erst ueber dem
    //  Eingabefeld: Man kann noch etwas dazuschreiben ("Wie rechnet man
    //  das?") und schickt dann mit dem Pfeil - oder nimmt es mit x weg.
    // ================================================================
    var chatAnhang = null;              // { art:'bild', ... } oder { art:'frage', frage }
    var bildUrls = new Map();           // Nachrichten-id -> blob:-Adresse des grossen Bildes
    var bildGrossId = null;             // welches gerade gross offen ist und noch laedt

    function bildLaden(datei){
        return new Promise((ok, fehler) => {
            const url = URL.createObjectURL(datei);
            const im = new Image();
            im.onload = () => { ok({ im: im, url: url }); };
            im.onerror = () => { URL.revokeObjectURL(url); fehler(new Error('kein Bild')); };
            im.src = url;
        });
    }
    function bildZeichnen(im, lang, qualitaet){
        const w0 = im.naturalWidth || im.width, h0 = im.naturalHeight || im.height;
        const f = Math.min(1, lang / Math.max(w0, h0));
        const w = Math.max(1, Math.round(w0 * f)), h = Math.max(1, Math.round(h0 * f));
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const g = c.getContext('2d');
        g.fillStyle = '#ffffff';            // durchsichtige PNGs nicht schwarz
        g.fillRect(0, 0, w, h);
        g.drawImage(im, 0, 0, w, h);
        return { c: c, w: w, h: h };
    }
    function alsBlob(c, q){ return new Promise(ok => c.toBlob(b => ok(b), 'image/jpeg', q)); }

    async function bildVorbereiten(datei){
        const { im, url } = await bildLaden(datei);
        try{
            let gross = null, blob = null;
            for(const [lang, q] of [[1600, 0.82], [1600, 0.7], [1280, 0.7], [1024, 0.65]]){
                gross = bildZeichnen(im, lang, q);
                blob = await alsBlob(gross.c, q);
                if(blob && blob.size <= 650 * 1024) break;
            }
            if(!blob || blob.size > 690 * 1024) throw new Error('zu gross');
            let vorschau = '';
            for(const [lang, q] of [[360, 0.72], [300, 0.6], [240, 0.55]]){
                vorschau = bildZeichnen(im, lang, q).c.toDataURL('image/jpeg', q);
                if(vorschau.length <= 38000) break;
            }
            return { art:'bild', blob: blob, vorschau: vorschau, w: gross.w, h: gross.h, kb: Math.round(blob.size / 1024) };
        } finally { URL.revokeObjectURL(url); }
    }

    async function bildAnhaengen(datei){
        if(!datei || !/^image\//i.test(datei.type || '')){
            chatSystemmeldung('Das ist kein Bild.');
            return;
        }
        try{
            const a = await bildVorbereiten(datei);
            chatAnhang = a;
            anhangZeichnen();
        }catch(e){
            console.warn('[CHAT] Bild', e);
            chatSystemmeldung('Dieses Bild kann der Browser nicht öffnen. Bitte als JPG oder PNG versuchen.');
        }
    }

    function anhangZeichnen(){
        const el = document.getElementById('duoChatAnhang');
        const feld = document.getElementById('duoChatEingabe');
        if(!el) return;
        const a = chatAnhang;
        if(!a){
            el.classList.remove('da'); el.innerHTML = '';
            if(feld) feld.placeholder = 'Nachricht an alle...';
            downloadKnopfZeichnen();
            return;
        }
        if(a.art === 'bild'){
            el.innerHTML = '<img src="' + escapeHtml(a.vorschau) + '" alt="">'
                + '<div class="was"><b>Bild</b><span>' + a.w + ' × ' + a.h + ' · ' + a.kb + ' KB</span></div>';
        } else {
            el.innerHTML = '<span class="frage-nr">' + escapeHtml(a.frage.id) + '</span>'
                + '<div class="was"><b>Frage aus dem Trainer</b><span>' + escapeHtml(a.frage.text) + '</span></div>';
        }
        el.insertAdjacentHTML('beforeend', '<button type="button" title="Nicht senden" aria-label="Nicht senden"><i class="fa-solid fa-xmark"></i></button>');
        el.lastElementChild.addEventListener('click', () => { chatAnhang = null; anhangZeichnen(); });
        el.classList.add('da');
        if(feld){ feld.placeholder = 'Text dazu (freiwillig) …'; }
        downloadKnopfZeichnen();
        chatUmschalten(true);
        chatNachUntenRollen();
        try{ if(feld) feld.focus(); }catch(e){}
    }

    async function anhangSenden(text){
        const a = chatAnhang;
        const feld = document.getElementById('duoChatEingabe');
        if(!a) return;
        if(!socket){ chatSystemmeldung('Keine Verbindung - nicht gesendet.'); return; }
        const code = roomCode || '__haus';
        const name = roomCode ? undefined : getDuoUserName();
        if(a.art === 'bild'){
            let daten;
            try{ daten = await a.blob.arrayBuffer(); }catch(e){ chatSystemmeldung('Das Bild ließ sich nicht lesen.'); return; }
            socket.emit('duoBild', { code: code, name: name, text: text, daten: daten, vorschau: a.vorschau, w: a.w, h: a.h });
        } else {
            socket.emit('duoChat', { code: code, name: name, text: text, frage: a.frage });
        }
        chatAnhang = null;
        if(feld){ feld.value = ''; feld.focus(); }
        anhangZeichnen();
    }

    function bildKnopfVerdrahten(feld){
        const knopf = document.getElementById('duoChatBildKnopf');
        const datei = document.getElementById('duoChatBildDatei');
        if(knopf && datei){
            knopf.addEventListener('click', () => { datei.value = ''; datei.click(); });
            datei.addEventListener('change', () => { if(datei.files && datei.files[0]) bildAnhaengen(datei.files[0]); });
        }
        // Strg+V mit einem Bild in der Zwischenablage (Bildschirmfoto)
        feld.addEventListener('paste', e => {
            try{
                const items = Array.from((e.clipboardData && e.clipboardData.items) || []);
                const it = items.find(x => x.kind === 'file' && /^image\//.test(x.type));
                if(it){ e.preventDefault(); bildAnhaengen(it.getAsFile()); }
            }catch(err){}
        });
        // Ein Bild auf den Chat ziehen
        const box = document.getElementById('duoChatBox');
        if(box){
            const hatDatei = e => { try{ return Array.from(e.dataTransfer.types || []).indexOf('Files') !== -1; }catch(err){ return false; } };
            box.addEventListener('dragover', e => { if(hatDatei(e)){ e.preventDefault(); box.classList.add('ziehen'); } });
            box.addEventListener('dragleave', e => { if(!box.contains(e.relatedTarget)) box.classList.remove('ziehen'); });
            box.addEventListener('drop', e => {
                box.classList.remove('ziehen');
                if(!hatDatei(e)) return;
                e.preventDefault();
                const f = Array.from(e.dataTransfer.files || []).find(x => /^image\//.test(x.type));
                if(f) bildAnhaengen(f); else chatSystemmeldung('Das ist kein Bild.');
            });
        }
    }

    // Was in der Blase steht
    function anhangHtml(n){
        if(n.bild){
            const b = n.bild;
            let w = 230, h = Math.round(230 * (b.h || 1) / (b.w || 1));
            if(h > 260){ h = 260; w = Math.max(60, Math.round(260 * (b.w || 1) / (b.h || 1))); }
            return '<button type="button" class="duo-bild" data-bild-id="' + escapeHtml(n.id) + '" title="Groß anzeigen">'
                 + '<img src="' + escapeHtml(b.vorschau) + '" alt="Bild von ' + escapeHtml(n.name || '') + '" style="width:' + w + 'px;height:' + h + 'px"></button>';
        }
        const f = n.frage;
        const antwBilder = f.antworten.map(x => x.b).filter(Boolean);
        let zeichnung = '';
        try{
            if(typeof window.getSvgHtml === 'function') zeichnung = String(window.getSvgHtml(f.id, antwBilder) || '').replace(/\sonclick="[^"]*"/, '');
        }catch(e){}
        const liste = antwBilder.length
            ? '<ol class="duo-frage-antw bilder">' + f.antworten.map((x, i) => '<li><b>' + 'ABCD'.charAt(i) + '</b>'
                + (x.b ? '<img src="svgs/' + escapeHtml(x.b) + '" alt="Antwort ' + 'ABCD'.charAt(i) + '" loading="lazy">' : escapeHtml(x.t)) + '</li>').join('') + '</ol>'
            : '<ol class="duo-frage-antw">' + f.antworten.map((x, i) => '<li><b>' + 'ABCD'.charAt(i) + '</b><span>' + escapeHtml(x.t) + '</span></li>').join('') + '</ol>';
        const coach = '<button type="button" class="duo-frage-coach" title="Der Lerncoach (KI) erklärt die Frage im Chat">'
            + '<i class="fa-solid fa-graduation-cap"></i> Lerncoach fragen</button>';
        const oeffnen = frageOeffnenMoeglich(f.id)
            ? '<button type="button" class="duo-frage-oeffnen" data-frage="' + escapeHtml(f.id) + '"><i class="fa-solid fa-arrow-up-right-from-square"></i> Im Trainer öffnen</button>' : '';
        return '<div class="duo-frage"><div class="duo-frage-kopf"><span class="duo-frage-nr">' + escapeHtml(f.id) + '</span> Frage aus dem Trainer</div>'
             + '<div class="duo-frage-text">' + escapeHtml(f.text) + '</div>'
             + (zeichnung ? '<div class="duo-frage-bild">' + zeichnung + '</div>' : '')
             + liste + oeffnen + coach + '</div>';
    }

    // Im eigenen Trainer hinspringen - nicht mitten in einer Pruefung und
    // nicht im Gruppenraum, dort gibt der Host die Fragen vor.
    function frageOeffnenMoeglich(id){
        try{
            if(roomCode || pruefungLaeuft()) return false;
            return !!(window.questionBank && window.questionBank.some(q => q.id === id)) && typeof window.jumpToQuestionId === 'function';
        }catch(e){ return false; }
    }
    function frageImTrainerOeffnen(id){
        if(!frageOeffnenMoeglich(id)){ chatSystemmeldung('Die Frage ' + id + ' gibt es in dieser Klasse nicht - oder gerade läuft eine Prüfung.'); return; }
        try{ window.jumpToQuestionId(id); }catch(e){ console.warn('[CHAT] Frage öffnen', e); }
    }

    // Gross anzeigen
    function bildGrossFenster(){
        let el = document.getElementById('duoBildGross');
        if(el) return el;
        el = document.createElement('div');
        el.id = 'duoBildGross';
        el.innerHTML = '<button type="button" class="zu" title="Schließen" aria-label="Schließen">×</button><img alt=""><div class="unter"></div>';
        el.addEventListener('click', e => { if(e.target.tagName !== 'IMG') bildGrossZu(); });
        document.addEventListener('keydown', e => { if(e.key === 'Escape' && el.classList.contains('offen')){ e.stopPropagation(); bildGrossZu(); } }, true);
        document.body.appendChild(el);
        return el;
    }
    function bildGrossZu(){
        const el = document.getElementById('duoBildGross');
        if(el) el.classList.remove('offen');
        bildGrossId = null;
    }
    function bildGrossZeigen(id, knopf, src, unter){
        const el = bildGrossFenster();
        const im = el.querySelector('img');
        const u = el.querySelector('.unter');
        if(!id){ im.src = src; u.textContent = unter || ''; el.classList.add('offen'); return; }
        const klein = knopf ? knopf.querySelector('img') : null;
        const text = klein ? klein.alt : '';
        if(bildUrls.has(id)){
            im.src = bildUrls.get(id); u.textContent = text;
        } else {
            // Erst das Vorschaubild, scharf wird es, sobald das grosse da ist.
            if(klein) im.src = klein.src;
            u.textContent = 'Wird geladen …';
            bildGrossId = id;
            if(socket) socket.emit('bildHolen', { id: id });
            else u.textContent = 'Keine Verbindung.';
        }
        el.classList.add('offen');
    }
    function bildDatenAngekommen(d){
        if(!d || !d.id) return;
        const el = document.getElementById('duoBildGross');
        if(d.fehlt){
            if(el && bildGrossId === d.id) el.querySelector('.unter').textContent = 'Das große Bild ist nicht mehr da (der Trainer wurde neu gestartet oder es war das älteste von vielen). Hier nur die Vorschau.';
            return;
        }
        const url = URL.createObjectURL(new Blob([d.daten], { type:'image/jpeg' }));
        bildUrls.set(d.id, url);
        if(el && bildGrossId === d.id){
            el.querySelector('img').src = url;
            const k = document.querySelector('.duo-bild[data-bild-id="' + d.id.replace(/[^a-f0-9]/g, '') + '"] img');
            el.querySelector('.unter').textContent = k ? k.alt : '';
            bildGrossId = null;
        }
    }

    // Fuer Index.html: Kann man gerade etwas in den Chat stellen?
    window.duoChatBereit = function(){
        try{
            const box = document.getElementById('duoChatBox');
            // Am Handy ist der Chat ganz ausgeblendet (body.schmal, Index.html)
            // - dann auch kein Knopf an der Frage.
            return !!(box && box.classList.contains('sichtbar')) && getComputedStyle(box).display !== 'none' && !pruefungLaeuft();
        }catch(e){ return false; }
    };
    window.duoChatFrageAnhaengen = function(frage){
        if(!frage || !frage.id) return;
        if(!window.duoChatBereit()){ return; }
        chatAnhang = { art:'frage', frage: frage };
        anhangZeichnen();
    };

    const DOWNLOAD_SEITE = 'https://amateurfunk-gruppe.github.io/Amateurfunk-Trainer/';
    const DOWNLOAD_TEXT  = 'Den Amateurfunk-Trainer zum Herunterladen gibt es hier: ' + DOWNLOAD_SEITE
                         + ' \u2013 kostenlos, ohne Anmeldung, f\u00fcr Windows, Linux und Mac.';
    let downloadZuletzt = 0;

    function darfDownloadSenden(){
        try{
            if(roomCode) return !!isHost;
            if(typeof window.laeuftLokal === 'function') return !!window.laeuftLokal();
            return !vonAussen;
        }catch(e){ return false; }
    }
    function downloadKnopfZeichnen(){
        const k = document.getElementById('duoChatSenden');
        const feld = document.getElementById('duoChatEingabe');
        if(!k || !feld) return;
        const gruen = darfDownloadSenden() && !feld.value.trim() && !chatAnhang;
        k.classList.toggle('download', gruen);
        k.title = gruen ? 'Link zum Herunterladen an alle senden' : 'Senden';
    }

    function chatSenden(ausKnopf){
        const feld = document.getElementById('duoChatEingabe');
        if(!feld) return;
        let text = feld.value.trim();
        // "Rundgang" (auch "Hey KI, Rundgang") startet den Rundgang hier im
        // Browser und geht nicht an die anderen (29.09.2026).
        if(/^((hey|hallo|hi)[\s,!]+)?((ki|lerncoach|funki)[\s,:!]+)?rundgang[\s.!?]*$/i.test(text) && typeof window.rundgangStarten === 'function'){
            feld.value = ''; try{ downloadKnopfZeichnen(); }catch(e){}
            window.rundgangStarten();
            return;
        }
        if(LC_KI_RE.test(text) && !lerncoachVorSenden(text)) return;
        if(chatAnhang){ anhangSenden(text); return; }
        if(!text && ausKnopf === true && darfDownloadSenden()){
            // Doppelklick soll den Link nicht zweimal schicken.
            if(Date.now() - downloadZuletzt < 3000) return;
            downloadZuletzt = Date.now();
            text = DOWNLOAD_TEXT;
        }
        if(!text) return;
        if(!socket){
            chatSystemmeldung('Keine Verbindung - Nachricht nicht gesendet.');
            return;
        }
        if(roomCode){
            socket.emit('duoChat', { code: roomCode, text: text });
        } else {
            // Ohne Raum geht die Nachricht in den Kanal aller, die gerade
            // ohne Raum auf dem Server sind. Der Name wird mitgeschickt:
            // Der Server kennt ihn nicht, weil es keinen Raum mit
            // Teilnehmerliste gibt.
            socket.emit('duoChat', { code: '__haus', text: text, name: getDuoUserName() });
        }
        feld.value = '';
        feld.focus();
        downloadKnopfZeichnen();
    }

    // ----------------------------------------------------------------
    //  ANKUNFT ANSAGEN                                (21.09.2026)
    //  Dietmar: "Hier waere eine Begruessung mit Namen gut."
    //  Der Server entscheidet, ob daraus wirklich eine Zeile im Chat
    //  wird - er kennt die Wiederholungssperre und weiss, wer von
    //  aussen kommt. Hier wird nur gesagt: Ich bin da, und so heisse ich.
    // ----------------------------------------------------------------
    let halloGesagt = false;
    function hausHalloSenden(){
        try{
            if(halloGesagt) return;          // einmal je Seitenaufruf reicht
            if(!socket || !socket.connected) return;
            let wer = '';
            try{ wer = (localStorage.getItem('duo_userName') || '').trim().slice(0, 20); }catch(e){}
            socket.emit('hausHallo', { name: wer });
            halloGesagt = true;
        }catch(e){}
    }

    // ================================================================
    //  ANRUFEN IM GRUPPENRAUM                             (27.09.2026)
    //  ----------------------------------------------------------------
    //  Dietmar: "Nehmen wir an, ich bin mit fuenf Leuten im Raum und ich
    //  muss einem was erklaeren. Dann langt es doch, wenn ich das nur
    //  dieser einen Person erklaere." - "nur der Kursleiter kann
    //  anrufen" - "Dann muss in dem Chat quasi eine Kontaktliste mit
    //  drin sein ... Dann muss ich keine Sprachnachrichten staendig
    //  versenden, sondern ich habe den anderen im Dialog."
    //
    //  So laeuft es:
    //    1. Unter dem Chatkopf steht "5 im Raum" mit allen Namen. Beim
    //       Kursleiter hat jeder andere einen gruenen Hoerer.
    //    2. Klick darauf: Mikrofon auf, Server meldet es der Person
    //       ('anrufStart' -> 'anrufKlingelt'). Bei ihr klingelt es, ein
    //       Fenster fragt "Annehmen / Ablehnen".
    //    3. Angenommen: Beide Browser verbinden sich DIREKT (WebRTC).
    //       Die Stimmen gehen nicht ueber den Trainer-Server; der reicht
    //       nur die Verbindungsdaten weiter ('anrufSignal').
    //    4. Oben im Chat steht dann gruen "Im Gespraech mit ...", mit
    //       Stummschalten und rotem Auflegen.
    //  Die anderen im Raum hoeren nichts und merken nichts.
    //
    //  Zum Finden der Gegenstelle ueber das Internet fragen beide Browser
    //  den STUN-Dienst von Cloudflare, welche Adresse sie von aussen
    //  haben. Dabei geht nur die Internetadresse dorthin, kein Ton.
    //  Laesst ein Netz (Firma, manche Mobilfunknetze) die direkte
    //  Verbindung nicht zu, kommt nach 20 Sekunden eine klare Meldung.
    // ================================================================
    function anrufAktiv(){ return !!anruf.zustand; }
    window.duoAnrufAktiv = anrufAktiv;
    function darfTelefonieren(){
        try{ return !!(window.isSecureContext && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.RTCPeerConnection); }
        catch(e){ return false; }
    }
    function anrufListeOffen(){ try{ return localStorage.getItem(ANRUF_LISTE_MERKEN) !== '0'; }catch(e){ return true; } }
    function anrufDauer(){ return anruf.start ? dauerMinSek((Date.now() - anruf.start) / 1000) : '0:00'; }

    // ---- Profilbild (27.09.2026) -----------------------------------------
    //  Dietmar: "Kannst du mir die Option Profilbild mit einbauen? Das muss
    //  auch beim anrufen gezeigt werden." Gewaehlt wird es in den
    //  Einstellungen (Index.html, profilbildWaehlen), gespeichert pro
    //  Benutzer im Browser. Hier: an den Raum schicken, die der anderen
    //  empfangen und rund anzeigen - in der Kontaktliste, im
    //  Gespraechsstreifen und im Klingel-Fenster. Ohne Bild steht der
    //  Anfangsbuchstabe in einem farbigen Kreis; die Farbe haengt am Namen,
    //  bleibt also fuer jeden gleich.
    function duoAvatarHtml(bild, name, klasse, punkt){
        const ok = typeof bild === 'string' && PB_MUSTER.test(bild);
        const n = String(name || '?').trim();
        const buchstabe = escapeHtml(((n.match(/[A-Za-zÄÖÜäöü0-9]/) || ['?'])[0]).toUpperCase());
        let h = 0; for(const c of n) h = (h * 31 + c.charCodeAt(0)) >>> 0;
        const farbe = PB_FARBEN[h % PB_FARBEN.length];
        return '<span class="duo-pb ' + (klasse || '') + '"' + (ok ? '' : ' style="background:' + farbe + '"') + ' aria-hidden="true">'
             + (ok ? '<img src="' + bild + '" alt="">' : buchstabe) + (punkt ? '<span class="an"></span>' : '') + '</span>';
    }
    window.duoAvatarHtml = duoAvatarHtml;
    function profilbildEigenes(){
        try{ const b = window.profilbildHolen ? window.profilbildHolen() : ''; return PB_MUSTER.test(b || '') ? b : ''; }catch(e){ return ''; }
    }
    function profilbildVon(id){
        if(id && id === myUserId) return profilbildEigenes();
        return profilbilder[id] || '';
    }
    function profilbildSenden(){
        if(!socket || !roomCode) return;
        try{ socket.emit('profilbild', { bild: profilbildEigenes() || null }); }catch(e){}
    }
    // Aufgerufen aus den Einstellungen (neues Bild, entfernt, anderer Benutzer)
    window.duoProfilbildGeaendert = function(){
        profilbildSenden();
        try{ anrufZeichnen(); }catch(e){}
    };

    // ---- Kontaktliste ------------------------------------------------
    function anrufListeZeichnen(){
        const el = document.getElementById('duoAnrufLeiste');
        if(!el) return;
        const users = duoUsersCache || {};
        const ids = Object.keys(users);
        if(!roomCode){ hausListeZeichnen(el); return; }
        if(!ids.length){ el.style.display = 'none'; el.innerHTML = ''; return; }
        const hostId = window._duoHostId;
        // Kursleiter zuerst, dann man selbst, dann die anderen
        ids.sort((a, b) => (a === hostId ? -2 : a === myUserId ? -1 : 0) - (b === hostId ? -2 : b === myUserId ? -1 : 0));
        const offen = anrufListeOffen();
        let html = '<div class="kopf" role="button" tabindex="0" data-aktion="klappen" aria-expanded="' + offen + '">'
                 + '<i class="fa-solid fa-users leute"></i><b>' + ids.length + ' im Raum</b>'
                 + '<span class="pfeil">' + (offen ? 'zuklappen <i class="fa-solid fa-chevron-up"></i>' : 'aufklappen <i class="fa-solid fa-chevron-down"></i>') + '</span></div>';
        if(offen){
            const telefon = darfTelefonieren();
            html += '<ul>' + ids.map(id => {
                const u = users[id] || {};
                const ich = id === myUserId;
                const name = escapeHtml(u.name || u.userName || 'Teilnehmer');
                let rolle = '';
                if(id === hostId) rolle = 'Kursleiter' + (ich ? ' (du)' : '');
                else if(ich) rolle = 'du';
                let aktiv = '';
                if(anruf.zustand && anruf.partner === id){
                    aktiv = anruf.zustand === 'spricht' ? 'im Gespräch' : anruf.zustand === 'klingelt' ? 'ruft an' : 'wird angerufen';
                }
                let knopf = '';
                if(isHost && !ich){
                    if(anruf.zustand && anruf.partner === id){
                        knopf = '<button type="button" class="hoerer auflegen" data-aktion="auflegen" title="Auflegen" aria-label="Auflegen"><i class="fa-solid fa-phone-slash"></i></button>';
                    } else if(anruf.zustand){
                        knopf = '<button type="button" class="hoerer" disabled title="Du bist gerade in einem Gespräch" aria-label="' + name + ' anrufen (besetzt)"><i class="fa-solid fa-phone"></i></button>';
                    } else if(!telefon){
                        knopf = '<button type="button" class="hoerer" disabled title="Anrufen geht nur über eine sichere Verbindung (https) oder am eigenen Rechner" aria-label="Anrufen nicht möglich"><i class="fa-solid fa-phone-slash"></i></button>';
                    } else {
                        knopf = '<button type="button" class="hoerer" data-aktion="anrufen" data-an="' + escapeHtml(id) + '" title="' + name + ' anrufen" aria-label="' + name + ' anrufen"><i class="fa-solid fa-phone"></i></button>';
                    }
                }
                return '<li>' + duoAvatarHtml(profilbildVon(id), u.name || u.userName || 'Teilnehmer', '', true) + '<span class="name">' + name
                     + (rolle ? ' <span class="rolle">· ' + rolle + '</span>' : '')
                     + (aktiv ? ' <span class="rolle aktiv">· ' + aktiv + '</span>' : '')
                     + '</span>' + knopf + '</li>';
            }).join('') + '</ul>';
        }
        el.innerHTML = html;
        el.style.display = '';
    }
    // Ohne Raum: wer ist auf dem Server? (29.09.2026) Dietmar: "Rechts im
    // angedockten Chat haette ich gerne die Option zu sehen, wer da drauf
    // ist wie auch im Gruppenraum." Dieselbe Leiste wie im Raum, nur ohne
    // Anrufknopf. Die Liste kommt vom Server mit 'hausVolk'.
    function hausListeZeichnen(el){
        const leute = (hausVolk && Array.isArray(hausVolk.leute)) ? hausVolk.leute.slice() : [];
        if(!leute.length){ el.style.display = 'none'; el.innerHTML = ''; return; }
        const meine = socket && socket.id;
        const ich = p => Array.isArray(p.ids) ? p.ids.indexOf(meine) !== -1 : p.id === meine;
        const rang = p => p.rolle === 'kursleiter' ? -2 : (ich(p) ? -1 : 0);
        leute.sort((a, b) => rang(a) - rang(b));
        const offen = anrufListeOffen();
        let html = '<div class="kopf" role="button" tabindex="0" data-aktion="klappen" aria-expanded="' + offen + '">'
                 + '<i class="fa-solid fa-users leute"></i><b>' + leute.length + ' auf dem Server</b>'
                 + '<span class="pfeil">' + (offen ? 'zuklappen <i class="fa-solid fa-chevron-up"></i>' : 'aufklappen <i class="fa-solid fa-chevron-down"></i>') + '</span></div>';
        if(offen){
            html += '<ul>' + leute.map(p => {
                const name = escapeHtml(p.name || 'Besucher');
                const du = ich(p);
                let rolle = p.rolle === 'kursleiter' ? 'Kursleiter' + (du ? ' (du)' : '') : (du ? 'du' : (p.rolle === 'wlan' ? 'im WLAN' : ''));
                return '<li>' + duoAvatarHtml(null, p.name || 'Besucher', '', true) + '<span class="name">' + name
                     + (rolle ? ' <span class="rolle">· ' + rolle + '</span>' : '') + '</span></li>';
            }).join('') + '</ul>';
        }
        el.innerHTML = html;
        el.style.display = '';
    }
    function anrufListeKlick(e){
        const ziel = e.target.closest('[data-aktion]');
        if(!ziel) return;
        const aktion = ziel.getAttribute('data-aktion');
        if(aktion === 'klappen'){
            try{ localStorage.setItem(ANRUF_LISTE_MERKEN, anrufListeOffen() ? '0' : '1'); }catch(err){}
            anrufListeZeichnen();
        } else if(aktion === 'anrufen'){
            anrufStarten(ziel.getAttribute('data-an'));
        } else if(aktion === 'auflegen'){
            anrufAuflegen('aufgelegt');
        }
    }

    // ---- Streifen oben im Chat -----------------------------------------
    function anrufStreifenZeichnen(){
        const el = document.getElementById('duoAnrufStreifen');
        if(!el) return;
        if(!anruf.zustand || anruf.zustand === 'klingelt'){ el.style.display = 'none'; el.innerHTML = ''; return; }
        const name = escapeHtml(anruf.name);
        let titel, klein;
        if(anruf.zustand === 'ruft'){ titel = 'Rufe ' + name + ' an …'; klein = 'es klingelt bei ' + name; }
        else if(anruf.zustand === 'verbindet'){ titel = 'Verbinde mit ' + name + ' …'; klein = 'einen Moment'; }
        else { titel = 'Im Gespräch mit ' + name; klein = '<span class="dauer">' + anrufDauer() + '</span> · nur ihr zwei hört mit'; }
        const welle = duoAvatarHtml(profilbildVon(anruf.partner), anruf.name, 'mittel');
        const stumm = anruf.zustand === 'spricht'
            ? '<button type="button" class="stumm' + (anruf.stumm ? ' an' : '') + '" data-aktion="stumm" title="' + (anruf.stumm ? 'Mikrofon wieder an' : 'Mikrofon aus') + '" aria-label="' + (anruf.stumm ? 'Mikrofon wieder an' : 'Mikrofon aus') + '"><i class="fa-solid ' + (anruf.stumm ? 'fa-microphone-slash' : 'fa-microphone') + '"></i></button>'
            : '';
        el.className = anruf.zustand === 'spricht' ? '' : 'wartet';
        el.innerHTML = welle + '<span class="text"><b>' + titel + '</b><small>' + klein + '</small></span>' + stumm
                     + '<button type="button" class="auflegen" data-aktion="auflegen" title="Auflegen" aria-label="Auflegen"><i class="fa-solid fa-phone-slash"></i></button>';
        el.style.display = 'flex';
    }
    function anrufStreifenKlick(e){
        e.stopPropagation();
        const ziel = e.target.closest('[data-aktion]');
        if(!ziel) return;
        const aktion = ziel.getAttribute('data-aktion');
        if(aktion === 'auflegen') anrufAuflegen('aufgelegt');
        else if(aktion === 'stumm') anrufStummUmschalten();
    }
    function anrufZeichnen(){
        try{ anrufListeZeichnen(); }catch(e){}
        try{ anrufStreifenZeichnen(); }catch(e){}
    }
    function anrufStummUmschalten(){
        anruf.stumm = !anruf.stumm;
        try{ (anruf.stream ? anruf.stream.getAudioTracks() : []).forEach(t => { t.enabled = !anruf.stumm; }); }catch(e){}
        anrufStreifenZeichnen();
    }

    // ---- Ton: klingelton.mp3 beim Anrufer und beim Angerufenen ------------
    //  Dietmar, 27.09.2026: "klingelton.mp3 muss abgespielt werden wenn ich
    //  jemanden anrufe." Die Datei liegt im Ordner sounds/ (dort hat Dietmar
    //  sie hingelegt); zur Sicherheit wird auch direkt neben der Index.html
    //  gesucht. Sie laeuft in Schleife, bis angenommen, abgelehnt oder
    //  aufgelegt wird - beim Anrufer etwas leiser, beim Angerufenen voll.
    //  Nachtrag am Abend: "es sieht so aus, als haettest du noch einen
    //  anderen Sound mit eingebaut. Ich hoere zu meinem auch noch was
    //  anderes." Das war der Ersatzton (Freizeichen/zwei Pieptoene), weil
    //  die Datei neben der Index.html gesucht wurde. Der Ersatzton ist
    //  raus: Es klingelt nur mit Dietmars Datei, sonst gar nicht.
    const KLINGELTON_QUELLEN = ['sounds/klingelton.mp3', 'klingelton.mp3'];
    function anrufTonStarten(art){
        anrufTonStoppen();
        const eintrag = { art: art, mp3: null, quelle: -1, aus: false };
        anruf.ton = eintrag;
        const naechste = () => {
            if(anruf.ton !== eintrag) return;
            eintrag.quelle++;
            if(eintrag.quelle >= KLINGELTON_QUELLEN.length){ eintrag.aus = true; eintrag.mp3 = null; return; }
            try{
                const a = new Audio(KLINGELTON_QUELLEN[eintrag.quelle]);
                a.loop = true;
                a.volume = art === 'ruf' ? 0.6 : 1.0;
                a.addEventListener('error', () => { if(eintrag.mp3 === a) naechste(); });
                eintrag.mp3 = a;
                const v = a.play();
                if(v && v.catch) v.catch(e => {
                    // Datei fehlt -> naechste Stelle; vom Browser gesperrt -> still
                    if(e && e.name === 'NotAllowedError'){ eintrag.aus = true; return; }
                });
            }catch(e){ naechste(); }
        };
        naechste();
    }
    function anrufTonStoppen(){
        const t = anruf.ton;
        if(!t) return;
        anruf.ton = null;
        try{ if(t.mp3){ const a = t.mp3; t.mp3 = null; a.pause(); a.removeAttribute('src'); a.load(); } }catch(e){}
    }
    window.duoAnrufTonArt = () => anruf.ton ? (anruf.ton.mp3 && !anruf.ton.aus ? 'mp3:' + KLINGELTON_QUELLEN[anruf.ton.quelle] : 'still') : null;   // fuer den Test

    // ---- Klingel-Fenster beim Angerufenen --------------------------------
    function anrufKlingelnZeigen(){
        anrufKlingelnWeg();
        const o = document.createElement('div');
        o.id = 'duoAnrufKlingeln';
        o.setAttribute('role', 'alertdialog');
        o.setAttribute('aria-labelledby', 'duoAnrufKlingelnTitel');
        const name = escapeHtml(anruf.name);
        const pruefung = pruefungLaeuft() ? '<br><b>Deine Prüfungszeit läuft dabei weiter.</b>' : '';
        o.innerHTML = '<div class="kasten">' + duoAvatarHtml(profilbildVon(anruf.partner), anruf.name, 'gross')
            + '<h3 id="duoAnrufKlingelnTitel">' + name + ' ruft an</h3>'
            + '<p>Der Kursleiter möchte mit dir sprechen.<br>Nur ihr beide hört euch, der Raum läuft weiter.' + pruefung + '</p>'
            + '<div class="knoepfe"><button type="button" class="ja"><i class="fa-solid fa-phone"></i> Annehmen</button>'
            + '<button type="button" class="nein"><i class="fa-solid fa-phone-slash"></i> Ablehnen</button></div></div>';
        o.querySelector('.ja').addEventListener('click', anrufAnnehmen);
        o.querySelector('.nein').addEventListener('click', () => anrufAblehnen());
        document.body.appendChild(o);
        try{ o.querySelector('.ja').focus(); }catch(e){}
    }
    function anrufKlingelnWeg(){
        const o = document.getElementById('duoAnrufKlingeln');
        if(o) o.remove();
    }

    // ---- Ablauf ----------------------------------------------------------
    async function anrufStarten(id){
        if(!socket || !roomCode || !isHost || anruf.zustand || !id || id === myUserId) return;
        if(!darfTelefonieren()){ chatSystemmeldung('Anrufen geht nur über eine sichere Verbindung (https) oder am eigenen Rechner.'); return; }
        if(aufnahme){ chatSystemmeldung('Erst die Sprachnachricht fertig aufnehmen oder verwerfen, dann anrufen.'); return; }
        const u = duoUsersCache && duoUsersCache[id];
        if(!u) return;
        anruf.zustand = 'ruft'; anruf.partner = id; anruf.name = u.name || u.userName || 'Teilnehmer';
        anrufZeichnen();
        let stream;
        try{ stream = await mikroOeffnen(); }
        catch(e){ chatSystemmeldung(mikroFehlerText(e)); anrufAufraeumen(); return; }
        // Waehrend der Mikrofonsuche aufgelegt?
        if(anruf.zustand !== 'ruft' || anruf.partner !== id){ try{ stream.getTracks().forEach(t => t.stop()); }catch(e){} return; }
        anruf.stream = stream;
        socket.emit('anrufStart', { an: id });
        anrufTonStarten('ruf');
        clearTimeout(anruf.frist);
        anruf.frist = setTimeout(() => {
            if(anruf.zustand === 'ruft'){ chatSystemmeldung(anruf.name + ' hat nicht abgenommen.'); anrufAuflegen('keineAntwort'); }
        }, 30000);
    }

    async function anrufAnnehmen(){
        if(anruf.zustand !== 'klingelt') return;
        anrufKlingelnWeg(); anrufTonStoppen();
        clearTimeout(anruf.frist);
        const von = anruf.partner;
        if(!darfTelefonieren()){
            chatSystemmeldung('Telefonieren geht in diesem Browser oder über diese Verbindung nicht.');
            anrufAblehnen(true); return;
        }
        anruf.zustand = 'verbindet';
        anrufZeichnen();
        let stream;
        try{ stream = await mikroOeffnen(); }
        catch(e){ chatSystemmeldung(mikroFehlerText(e)); anrufAblehnen(true); return; }
        if(anruf.zustand !== 'verbindet' || anruf.partner !== von){ try{ stream.getTracks().forEach(t => t.stop()); }catch(e){} return; }
        anruf.stream = stream;
        anrufVerbindungAnlegen();
        socket.emit('anrufAntwort', { an: von, ja: true });
        anrufVerbindungsFrist();
    }
    function anrufAblehnen(stillschweigend){
        const von = anruf.partner;
        if(socket && von) socket.emit('anrufAntwort', { an: von, ja: false });
        if(!stillschweigend && anruf.zustand === 'klingelt') chatSystemmeldung('Anruf von ' + anruf.name + ' abgelehnt.');
        anrufAufraeumen();
    }

    function anrufVerbindungAnlegen(){
        const pc = new RTCPeerConnection({ iceServers: ANRUF_ICE });
        anruf.pc = pc;
        anruf.warteKandidaten = [];
        anruf.stream.getTracks().forEach(t => pc.addTrack(t, anruf.stream));
        pc.onicecandidate = e => {
            if(!e.candidate || !socket || anruf.pc !== pc) return;
            const k = e.candidate.toJSON ? e.candidate.toJSON() : e.candidate;
            socket.emit('anrufSignal', { an: anruf.partner, kandidat: { candidate: k.candidate, sdpMid: k.sdpMid, sdpMLineIndex: k.sdpMLineIndex } });
        };
        pc.ontrack = e => {
            if(anruf.pc !== pc) return;
            if(!anruf.audio){
                const a = document.createElement('audio');
                a.id = 'duoAnrufTon'; a.autoplay = true; a.style.display = 'none';
                document.body.appendChild(a);
                anruf.audio = a;
            }
            anruf.audio.srcObject = (e.streams && e.streams[0]) || new MediaStream([e.track]);
            anruf.audio.play().catch(() => {});
        };
        const lage = () => {
            if(anruf.pc !== pc) return;
            const s = pc.connectionState || pc.iceConnectionState;
            if(s === 'connected' || s === 'completed'){ clearTimeout(anruf.abrissUhr); anrufLaeuft(); }
            else if(s === 'failed'){
                chatSystemmeldung(anruf.zustand === 'spricht'
                    ? 'Die Verbindung zu ' + anruf.name + ' ist abgerissen.'
                    : 'Keine direkte Verbindung zu ' + anruf.name + ' möglich – vermutlich lässt eines der Netze (Firma, Mobilfunk) das nicht zu. Schreibt euch solange im Chat.');
                anrufAuflegen('fehler');
            } else if(s === 'disconnected'){
                clearTimeout(anruf.abrissUhr);
                anruf.abrissUhr = setTimeout(() => {
                    if(anruf.pc === pc && (pc.connectionState || pc.iceConnectionState) === 'disconnected'){
                        chatSystemmeldung('Die Verbindung zu ' + anruf.name + ' ist abgerissen.');
                        anrufAuflegen('fehler');
                    }
                }, 8000);
            }
        };
        pc.onconnectionstatechange = lage;
        pc.oniceconnectionstatechange = lage;
        return pc;
    }
    function anrufVerbindungsFrist(){
        clearTimeout(anruf.frist);
        anruf.frist = setTimeout(() => {
            if(anruf.zustand === 'verbindet'){
                chatSystemmeldung('Keine direkte Verbindung zu ' + anruf.name + ' möglich – vermutlich lässt eines der Netze (Firma, Mobilfunk) das nicht zu. Schreibt euch solange im Chat.');
                anrufAuflegen('fehler');
            }
        }, 20000);
    }
    function anrufLaeuft(){
        if(anruf.zustand === 'spricht') return;
        clearTimeout(anruf.frist); anrufTonStoppen();
        anruf.zustand = 'spricht';
        anruf.start = Date.now();
        clearInterval(anruf.zeitUhr);
        anruf.zeitUhr = setInterval(() => {
            const d = document.querySelector('#duoAnrufStreifen .dauer');
            if(d) d.textContent = anrufDauer();
        }, 1000);
        anrufZeichnen();
    }

    // Die Signale kommen der Reihe nach und werden der Reihe nach
    // verarbeitet - setRemoteDescription ist asynchron, ein Kandidat darf
    // es nicht ueberholen.
    function anrufSignalVerarbeiten(d){
        anruf.kette = (anruf.kette || Promise.resolve()).then(async () => {
            const pc = anruf.pc;
            if(!pc || !d || d.von !== anruf.partner) return;
            if(d.sdp){
                await pc.setRemoteDescription(d.sdp);
                const warte = anruf.warteKandidaten.splice(0);
                for(const k of warte){ try{ await pc.addIceCandidate(k); }catch(e){} }
                if(d.sdp.type === 'offer'){
                    const antwort = await pc.createAnswer();
                    await pc.setLocalDescription(antwort);
                    if(anruf.pc === pc && socket) socket.emit('anrufSignal', { an: anruf.partner, sdp: { type: pc.localDescription.type, sdp: pc.localDescription.sdp } });
                }
            }
            if(d.kandidat){
                if(!pc.remoteDescription) anruf.warteKandidaten.push(d.kandidat);
                else { try{ await pc.addIceCandidate(d.kandidat); }catch(e){} }
            }
        }).catch(e => { console.warn('[ANRUF] Signal', e); });
    }

    function anrufAuflegen(grund){
        if(!anruf.zustand) return;
        if(socket && anruf.partner) socket.emit('anrufEnde', { grund: grund || 'aufgelegt' });
        if(anruf.zustand === 'spricht' && grund !== 'fehler') chatSystemmeldung('Gespräch mit ' + anruf.name + ' beendet (' + anrufDauer() + ').');
        anrufAufraeumen();
    }
    function anrufAufraeumen(){
        clearTimeout(anruf.frist); clearTimeout(anruf.abrissUhr); clearInterval(anruf.zeitUhr);
        anrufTonStoppen(); anrufKlingelnWeg();
        try{ if(anruf.pc) anruf.pc.close(); }catch(e){}
        try{ if(anruf.stream) anruf.stream.getTracks().forEach(t => t.stop()); }catch(e){}
        try{ if(anruf.audio){ anruf.audio.srcObject = null; anruf.audio.remove(); } }catch(e){}
        Object.assign(anruf, { zustand: null, partner: null, name: '', pc: null, stream: null, audio: null, start: 0,
                               frist: null, zeitUhr: null, abrissUhr: null, kette: null, warteKandidaten: [], stumm: false });
        anrufZeichnen();
        // Waehrend des Gespraechs aufgelaufene Sprachnachrichten jetzt abspielen
        try{ spracheAutoWeiter(); }catch(e){}
    }
    // Raum verlassen, entfernt, Raum beendet: Gespraech mit beenden.
    function anrufRaumPruefen(){
        if(!roomCode && anruf.zustand) anrufAuflegen('weg');
        if(!roomCode) Object.keys(profilbilder).forEach(k => { delete profilbilder[k]; });
        anrufZeichnen();
    }

    function anrufEreignisseAnmelden(s){
        s.on('anrufKlingelt', d => {
            if(!d || !d.von) return;
            if(anruf.zustand){ s.emit('anrufAntwort', { an: d.von, ja: false }); return; }
            anruf.zustand = 'klingelt'; anruf.partner = d.von; anruf.name = String(d.name || 'Kursleiter');
            // Das Bild des Anrufers kommt mit dem Anruf (27.09.2026 abends)
            if(d.bild && PB_MUSTER.test(d.bild)) profilbilder[d.von] = d.bild;
            anrufZeichnen();
            anrufKlingelnZeigen();
            anrufTonStarten('klingel');
            clearTimeout(anruf.frist);
            anruf.frist = setTimeout(() => {
                if(anruf.zustand === 'klingelt'){
                    chatSystemmeldung('Anruf von ' + anruf.name + ' verpasst.');
                    anrufAblehnen(true);
                }
            }, 32000);
        });
        s.on('anrufAbgelehnt', d => {
            if(anruf.zustand !== 'ruft') return;
            const g = d && d.grund;
            chatSystemmeldung(g === 'besetzt' ? anruf.name + ' ist gerade in einem anderen Gespräch.'
                            : g === 'nurKursleiter' ? 'Anrufen kann nur der Kursleiter.'
                            : anruf.name + ' ist nicht mehr im Raum.');
            anrufAufraeumen();
        });
        s.on('anrufAntwort', async d => {
            if(!d || d.von !== anruf.partner || anruf.zustand !== 'ruft') return;
            clearTimeout(anruf.frist);
            anrufTonStoppen();
            if(!d.ja){ chatSystemmeldung(anruf.name + ' hat abgelehnt.'); anrufAufraeumen(); return; }
            anruf.zustand = 'verbindet';
            anrufZeichnen();
            try{
                const pc = anrufVerbindungAnlegen();
                const angebot = await pc.createOffer();
                await pc.setLocalDescription(angebot);
                if(anruf.pc === pc) s.emit('anrufSignal', { an: anruf.partner, sdp: { type: pc.localDescription.type, sdp: pc.localDescription.sdp } });
                anrufVerbindungsFrist();
            }catch(e){
                console.warn('[ANRUF] Angebot', e);
                chatSystemmeldung('Das Gespräch ließ sich nicht aufbauen.');
                anrufAuflegen('fehler');
            }
        });
        s.on('anrufSignal', d => anrufSignalVerarbeiten(d));
        // Profilbilder (27.09.2026)
        s.on('profilbilder', d => {
            Object.keys(profilbilder).forEach(k => { delete profilbilder[k]; });
            const b = (d && d.bilder) || {};
            Object.keys(b).forEach(id => { if(PB_MUSTER.test(b[id] || '')) profilbilder[id] = b[id]; });
            anrufZeichnen();
        });
        s.on('profilbild', d => {
            if(!d || !d.id) return;
            if(d.bild && PB_MUSTER.test(d.bild)) profilbilder[d.id] = d.bild; else delete profilbilder[d.id];
            anrufZeichnen();
            const k = document.querySelector('#duoAnrufKlingeln .duo-pb');
            if(k && d.id === anruf.partner && anruf.zustand === 'klingelt') k.outerHTML = duoAvatarHtml(profilbildVon(anruf.partner), anruf.name, 'gross');
        });
        // Nach dem Betreten oder Eroeffnen eines Raums das eigene Bild schicken
        s.on('roomCreated', () => setTimeout(profilbildSenden, 50));
        s.on('roomJoined', () => setTimeout(profilbildSenden, 50));
        s.on('anrufEnde', d => {
            if(!d || d.von !== anruf.partner || !anruf.zustand) return;
            const g = d.grund;
            let text;
            if(anruf.zustand === 'klingelt') text = 'Anruf von ' + anruf.name + ' verpasst.';
            else if(anruf.zustand === 'spricht') text = (g === 'weg' ? anruf.name + ' ist nicht mehr da' : anruf.name + ' hat aufgelegt') + ' (' + anrufDauer() + ').';
            else if(g === 'weg') text = anruf.name + ' ist nicht mehr im Raum.';
            else if(g === 'fehler') text = 'Keine Verbindung zu ' + anruf.name + ' möglich.';
            else text = anruf.name + ' hat aufgelegt.';
            chatSystemmeldung(text);
            anrufAufraeumen();
        });
        s.on('disconnect', () => {
            if(anruf.zustand){ chatSystemmeldung('Verbindung zum Trainer unterbrochen – das Gespräch ist beendet.'); anrufAufraeumen(); }
        });
    }

    // Eine Karte in den Chat haengen (28.09.2026, Kurs und Hausaufgaben).
    // Die Anfrage "Anna moechte in den Kurs" sieht nur der Kursleiter, die
    // Antwort nur Anna - beides entsteht im eigenen Browser, nicht als
    // Chatnachricht auf dem Server. Deshalb geht es hier am Verteiler vorbei.
    window.duoChatKarte = function(knoten){
        try{
            chatAufbauen();
            const verlauf = document.getElementById('duoChatVerlauf');
            if(!verlauf || !knoten) return false;
            const leer = document.getElementById('duoChatLeer');
            if(leer) leer.remove();
            verlauf.appendChild(knoten);
            chatNachUntenRollen();
            if(!chatOffen){ chatUngelesen++; try{ chatBlaseAktualisieren(); }catch(e){} }
            return true;
        }catch(e){ console.warn('[CHAT] Karte', e); return false; }
    };

    // ================================================================
    //  RUNDGANG ANBIETEN                                  (29.09.2026)
    //  Unter der eigenen Begruessung ("Herzlich willkommen, Baumpaul
    //  betritt den Server." bzw. die Begruessung im Raum) steht einmal je
    //  Geraet: "Neu hier? ... [Rundgang starten] [Nein danke]". Die Zeile
    //  entsteht nur hier im Browser - niemand sonst sieht sie.
    //  Der Rundgang selbst: Index.html, <script id="rundgang">.
    // ================================================================
    const RUNDGANG_ANGEBOTEN = 'rundgang_angeboten';
    function rundgangAngebotPruefen(n){
        try{
            if(!n || typeof window.rundgangStarten !== 'function') return;
            const eigeneBegruessung = (n.system && n.haus && n.userId && n.userId === (socket && socket.id) && /betritt den Server/.test(n.text || ''))
                || (n.automatisch && n.userId === '__system__' && /^Herzlich willkommen bei/.test(n.text || ''));
            if(!eigeneBegruessung) return;
            try{ if(localStorage.getItem(RUNDGANG_ANGEBOTEN) === '1' || (window.rundgangGesehen && window.rundgangGesehen())) return; }catch(e){ return; }
            try{ localStorage.setItem(RUNDGANG_ANGEBOTEN, '1'); }catch(e){}
            setTimeout(rundgangAngebotZeigen, 700);
        }catch(e){}
    }
    function rundgangAngebotZeigen(){
        chatAufbauen();
        const verlauf = document.getElementById('duoChatVerlauf');
        if(!verlauf || document.getElementById('duoRundgangAngebot')) return;
        const zeile = document.createElement('div');
        zeile.id = 'duoRundgangAngebot';
        zeile.className = 'duo-chat-zeile duo-chat-rundgang';
        zeile.innerHTML = '<b><i class="fa-solid fa-route"></i> Neu hier?</b> Ich zeige dir in gut einer Minute die wichtigsten Knöpfe des Trainers.'
            + '<span class="knoepfe"><button type="button" data-rundgang="los">Rundgang starten</button>'
            + '<button type="button" class="nein" data-rundgang="nein">Nein danke</button></span>';
        verlauf.appendChild(zeile);
        chatNachUntenRollen();
    }
    window.duoRundgangAnbieten = rundgangAngebotZeigen;   // zum Testen und fuer spaeter
    window.duoLerncoachAn = () => !!lerncoachAn;

    function chatSystemmeldung(text){
        chatAufbauen();
        const verlauf = document.getElementById('duoChatVerlauf');
        if(!verlauf) return;
        const leer = document.getElementById('duoChatLeer');
        if(leer) leer.remove();
        const zeile = document.createElement('div');
        zeile.className = 'duo-chat-zeile duo-chat-system';
        zeile.textContent = text;
        verlauf.appendChild(zeile);
        chatNachUntenRollen();
    }

    function chatVerlaufSetzen(nachrichten){
        chatAufbauen();
        const verlauf = document.getElementById('duoChatVerlauf');
        if(!verlauf) return;
        verlauf.innerHTML = '';
        chatGesehen.clear();
        if(!nachrichten || !nachrichten.length){
            const leer = document.createElement('div');
            leer.id = 'duoChatLeer';
            leer.innerHTML = 'Noch keine Nachrichten.<br>Schreib etwas an alle im Raum.';
            verlauf.appendChild(leer);
            return;
        }
        nachrichten.forEach(n => chatNachrichtAnzeigen(n, true));   // stumm: kein Aufklappen
        chatNachUntenRollen();
    }

    // ================================================================
    // ABGLEICH DES DATEISTANDS
    //
    // Teilnehmer laden die Dateien bei jedem Seitenaufruf frisch von diesem
    // Server - veraltet sein kann also nur, wer die Seite seit einer Aenderung
    // nicht neu geladen hat. Genau das wird hier erkannt.
    // ================================================================
    let meinDateiStand = null;

    async function dateiStandHolen(){
        try{
            const res = await fetch('/api/version', {cache:'no-store'});
            if(!res.ok) return null;
            const j = await res.json();
            return j.kennung || null;
        }catch(e){ return null; }
    }

    async function abgleichStarten(){
        meinDateiStand = await dateiStandHolen();
        if(!meinDateiStand) return;
        // dem Server melden, damit der Host es sieht
        if(socket && roomCode) socket.emit('duoStandMelden', {code: roomCode, kennung: meinDateiStand});
        // regelmaessig nachsehen, ob sich am Server etwas geaendert hat
        setInterval(async ()=>{
            const jetzt = await dateiStandHolen();
            if(jetzt && meinDateiStand && jetzt !== meinDateiStand){
                veralteteVersionMelden();
            }
        }, 60000);
    }

    function veralteteVersionMelden(){
        if(document.getElementById('duoVeraltetBanner')) return;
        const b = document.createElement('div');
        b.id = 'duoVeraltetBanner';
        b.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:99999;background:#e2932f;color:#3a2c00;' +
            'padding:10px 14px;font-size:0.85rem;font-weight:600;text-align:center;box-shadow:0 2px 10px rgba(0,0,0,0.2);';
        b.innerHTML = 'Es gibt eine neuere Fassung des Trainers. ' +
            '<button type="button" id="duoJetztNeuLaden" style="margin-left:10px;padding:5px 12px;border:none;' +
            'border-radius:8px;background:#0f2745;color:#fff;font-weight:700;cursor:pointer;">Jetzt neu laden</button>' +
            '<button type="button" id="duoSpaeter" style="margin-left:6px;padding:5px 10px;border:none;' +
            'border-radius:8px;background:transparent;color:#3a2c00;cursor:pointer;text-decoration:underline;">später</button>';
        document.body.appendChild(b);
        document.getElementById('duoJetztNeuLaden').onclick = ()=>location.reload();
        document.getElementById('duoSpaeter').onclick = ()=>b.remove();
    }

    // Host-Knopf: alle im Raum neu laden lassen
    function alleNeuLadenLassen(){
        if(!socket || !roomCode){ alert('Kein Raum aktiv'); return; }
        if(!isHost){ alert('Nur der Host kann alle neu laden lassen'); return; }
        const weiter = ()=>{ socket.emit('duoAlleNeuLaden', {code: roomCode}); };
        if(typeof window.showAppConfirm === 'function'){
            window.showAppConfirm('Alle Teilnehmer im Raum neu laden lassen?', weiter, {
                title: 'Abgleich starten',
                icon: 'fa-rotate',
                details: '• Jeder im Raum lädt die Seite neu und hat danach exakt deinen Dateistand<br>' +
                         '• Eine laufende Prüfung wird dadurch unterbrochen<br>' +
                         '• Der Lernfortschritt bleibt erhalten',
                confirmLabel: '<i class="fas fa-rotate"></i> Alle neu laden'
            });
        } else if(confirm('Alle Teilnehmer neu laden lassen? Eine laufende Prüfung wird unterbrochen.')){
            weiter();
        }
    }

    // ================================================================
    //  DIE TUNNEL-WACHE - WAS DER GASTGEBER DAVON SIEHT
    //  ----------------------------------------------------------------
    //  Dietmar am 07.09.2026: "Der Trainer muss auch ueber Stunden
    //  laufen, ohne dass ich am Rechner aktiv bin."
    //
    //  Der Server passt jetzt selbst auf die Leitung auf (siehe
    //  Server.js, "DIE TUNNEL-WACHE"). Hier wird nur gezeigt, was er
    //  meldet - denn wenn ein Quick Tunnel neu aufgebaut werden muss,
    //  bekommt er einen NEUEN Zufallsnamen. Der alte Link ist dann tot,
    //  und das muss der Gastgeber sofort sehen, statt es beim naechsten
    //  Anruf zu erfahren.
    // ================================================================
    let wacheUhr = null;
    let wacheZuletzt = null;

    function wacheZeitText(ms, jetzt){
        if(!ms) return 'noch nicht';
        const s = Math.max(0, Math.round((jetzt - ms)/1000));
        if(s < 90) return 'vor ' + s + ' Sekunden';
        return 'vor ' + Math.round(s/60) + ' Minuten';
    }

    async function wacheNachsehen(){
        const zeile = document.getElementById('duoWacheZeile');
        if(!zeile) return;
        if(!isHost){ zeile.style.display='none'; return; }
        let j = null;
        try{
            const res = await fetch('/api/tunnel-wache', {cache:'no-store'});
            if(!res.ok){ zeile.style.display='none'; return; }   // Gast: 403
            j = await res.json();
        }catch(e){ return; }
        if(!j || !j.an){
            // Kein Quick Tunnel gewuenscht. Mit eigener Adresse ist das
            // der Normalfall und kein Mangel - dann gehoert hier hin,
            // woran der Gastgeber ist, statt einer leeren Stelle.
            const fest = eigeneAdresse();
            if(fest){
                zeile.style.display = 'block';
                zeile.className = 'duo-wache gut';
                zeile.innerHTML = '\uD83D\uDD17 <b>Feste Adresse:</b> ' + escapeHtml(fest.replace(/^https?:\/\//,''))
                    + '. Kein Tunnel noetig \u2014 die Leitung haelt der cloudflared-Dienst, '
                    + 'unabh\u00e4ngig vom Trainer. <b>Ein Neustart \u00e4ndert den Link nicht.</b>';
                return;
            }
            zeile.style.display='none';
            return;
        }
        wacheZuletzt = j;

        // Die Farben stehen im Stilblock (.duo-wache.gut / .warn), nicht mehr
        // hier. Grund, 20.09.2026: Dietmar aus dem Gruppenraum - "kann man
        // das noch schlecht erkennen". Der Kasten wurde von hier aus hell
        // eingefaerbt (#eef8f1), im Dark Mode blieb er hell, und fett
        // Gedrucktes traegt dort per Regel ein helles Weiss - "Tunnel-Wache
        // laeuft", "vor 19 Sekunden" und die Zahl der Teilnehmer standen
        // damit weiss auf Hellgruen. Aus JavaScript gesetzte Farben gewinnen
        // gegen jeden Stil; nur aus dem Stilblock heraus kann die Nachtsicht
        // ueberhaupt mitreden.
        const gut = j.laeuft && j.fehlversuche === 0;
        zeile.style.display = 'block';
        zeile.className = 'duo-wache ' + (gut ? 'gut' : 'warn');

        let t = '';
        t += (gut ? '🟢' : '🟠') + ' <b>Tunnel-Wache läuft.</b> ';
        t += 'Der Trainer meldet sich alle ' + (j.pulsTaktMin || 4) + ' Minuten bei Cloudflare — '
           + 'damit die Leitung nicht wegen Ruhe abgebaut wird.';
        t += '<br>Zuletzt durchgekommen: <b>' + wacheZeitText(j.letzterPuls, j.jetzt) + '</b>.';
        if(j.imRaum > 0) t += ' Im Raum: <b>' + j.imRaum + '</b>.';
        if(j.fehlversuche > 0){
            t += '<br>⚠️ ' + (j.meldung || 'Keine Antwort von außen.')
               + ' Nach drei Fehlversuchen baue ich die Leitung von selbst neu auf.';
        }
        if(j.neustarts > 0){
            t += '<br>🔁 Die Leitung wurde ' + j.neustarts + '× neu aufgebaut'
               + (j.letzterNeustart ? ' (zuletzt ' + wacheZeitText(j.letzterNeustart, j.jetzt) + ')' : '')
               + '. <b>Jeder Neuaufbau bedeutet einen neuen Link</b> — der oben ist der gültige.';
        }
        zeile.innerHTML = t;
    }

    function wacheAnzeigeStarten(){
        if(wacheUhr) return;
        wacheNachsehen();
        besucherNachsehen();
        wacheUhr = setInterval(wacheNachsehen, 60000);
        // 12 Sekunden statt 30: Der Ton soll kommen, waehrend der Besucher
        // noch da ist, nicht eine halbe Minute spaeter. Die Anfrage geht an
        // den eigenen Rechner und kostet nichts.
        besucherUhr = setInterval(besucherNachsehen, 12000);
    }
    function wacheAnzeigeBeenden(){
        if(wacheUhr){ clearInterval(wacheUhr); wacheUhr = null; }
        if(besucherUhr){ clearInterval(besucherUhr); besucherUhr = null; }
        const zeile = document.getElementById('duoWacheZeile');
        if(zeile) zeile.style.display = 'none';
        const bz = document.getElementById('duoBesucherZeile');
        if(bz) bz.style.display = 'none';
    }

    // ----------------------------------------------------------------
    //  WER IST VORBEIGEKOMMEN?                        (21.09.2026)
    //  ----------------------------------------------------------------
    //  Dietmar: "Ich moechte fuer den Trainer Werbung machen und dazu
    //  einen Gruppenraum starten. Ich moechte als Host die Anzahl der
    //  Besucher sehen."
    //
    //  Die ZAHL sieht jeder Gastgeber - sie steht unter dem Link, den er
    //  gerade verteilt hat. Die LISTE, wer gekommen ist, zeigt der
    //  Trainer nur dem Entwickler; erkannt am Benutzernamen "Dietmar".
    //
    //  Der Name ist dabei nur der Schalter fuer die Anzeige, nicht der
    //  Schutz: /api/besucher antwortet ausschliesslich dem Trainer-PC
    //  selbst (localOnly). Ein Gast ueber den Einladungslink bekommt dort
    //  403 - auch wenn er sich im Trainer "Dietmar" nennt.
    //
    //  In der Liste steht nichts, womit man jemanden wiederfindet: die
    //  Adresse ist gekuerzt wie ueberall sonst im Trainer, dazu Uhrzeit,
    //  Geraeteart und - falls vorhanden - von welcher Seite der Klick kam.
    //  Keine Namen, keine Kennungen.
    // ----------------------------------------------------------------
    let besucherUhr = null;
    // Wie viele Aufrufe standen beim letzten Blick da? null heisst "noch
    // nie geschaut" - beim ersten Mal darf es keinen Ton geben, sonst
    // klingelt es beim Oeffnen des Raums fuer alles, was vorher war.
    let besucherStandVorher = null;
    // Wie viele Anfragen auf Zutritt standen beim letzten Blick an? Auch
    // hier heisst null "noch nie geschaut" - sonst klingelt es beim
    // Oeffnen des Raums fuer alles, was vorher schon da war.
    let anfragenVorher = null;

    // ----------------------------------------------------------------
    //  DAS BESUCHERFENSTER
    //  Alles, was hier steht, kommt aus /api/besucher - und das antwortet
    //  nur dem Trainer-PC selbst. Die Funktionen haengen an window, weil
    //  die Knoepfe im Fenster per onclick darauf zugreifen.
    // ----------------------------------------------------------------
    function besucherFuellen(j){
        const kopf = document.getElementById('besucherModalKopf');
        const koerper = document.getElementById('besucherTabelleKoerper');
        const leer = document.getElementById('besucherLeer');
        const tab = document.getElementById('besucherTabelle');
        if(!kopf || !koerper) return;
        const jetzt = Date.now();
        const offenSeit = j.laeuftSeit ? new Date(j.laeuftSeit).getTime() : 0;
        const seit = j.seit ? new Date(j.seit) : null;

        const echt = (typeof j.echte === 'number') ? j.echte : (j.gesamt || 0);
        const klopf = (typeof j.angeklopft === 'number') ? j.angeklopft : 0;
        kopf.innerHTML = '<b>' + echt + '</b> ' + (echt === 1 ? 'Besucher' : 'Besucher')
            + ' über den Link'
            + (j.verschiedene ? ' von <b>' + j.verschiedene + '</b> verschiedenen '
                + (j.verschiedene === 1 ? 'Adresse' : 'Adressen') : '')
            + (j.imRaum ? ', <b>' + j.imRaum + '</b> gerade im Raum' : '')
            + (offenSeit ? '. Der Trainer läuft seit <b>' + dauerText(offenSeit, jetzt) + '</b>' : '')
            + (seit ? '.<br><span style="opacity:.8;">Gezählt seit ' + seit.toLocaleString('de-DE',
                {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'}) + ' Uhr.</span>' : '.')
            // Seit dem 23.09.2026: Besucher, die auf der Seite "gerade nicht
            // online" standen, zaehlen mit (worker.js). Wie viele das waren,
            // steht hier - in der Liste darunter tauchen sie nicht auf, der
            // Trainer hat sie ja nicht gesehen.
            + (j.offlineUebernommen ? '<br><span style="opacity:.8;">Davon <b>' + j.offlineUebernommen + '</b> '
                + (j.offlineUebernommen === 1 ? 'Besucher, der vor verschlossener Tür stand'
                                             : 'Besucher, die vor verschlossener Tür standen')
                + ' (Seite „gerade nicht online“).</span>' : '')
            + (klopf ? '<br><span style="opacity:.8;">Dazu <b>' + klopf + '</b> '
                + (klopf === 1 ? 'Aufruf, der' : 'Aufrufe, die') + ' nur angeklopft '
                + (klopf === 1 ? 'hat' : 'haben') + ' — unten ausgegraut. '
                + 'Das sind Maschinen, die neue Adressen abklopfen; sie zählen nicht als Besucher.</span>' : '')
            + (j.abgewiesen ? '<br><span style="opacity:.8;">Die Ländersperre hat <b>' + j.abgewiesen + '</b> '
                + (j.abgewiesen === 1 ? 'Aufruf' : 'Aufrufe')
                + ' von außerhalb von Deutschland, Österreich und der Schweiz abgewiesen'
                + (j.freigegeben ? ' — <b>' + j.freigegeben + '</b> davon hast du freigegeben' : '')
                + '.</span>' : '')
            // Der Schalter unten sagt es in Farbe, hier steht es noch einmal
            // in Worten - damit niemand raetselt, warum ploetzlich Chicago
            // in der Liste steht. Nur wenn die Sperre AUS ist; an ist der
            // Normalfall und braucht keinen Satz.
            + (j.sperre === false ? '<br><span style="opacity:.8;">⚠️ Die Ländersperre ist '
                + '<b>ausgeschaltet</b> — gerade kommt jeder herein, aus jedem Land, ohne Anfrage.</span>' : '');

        // ----------------------------------------------------------------
        //  WER ANKLOPFT UND WARTET                      (21.09.2026)
        //  Dietmar: "Ggf mit einer Anfrage?" - hier ist sie. Das Einzige
        //  in diesem Fenster, das eine Entscheidung verlangt, also steht
        //  es oben und in Gelb.
        //
        //  Die volle Adresse steht im data-Attribut, weil sie beim
        //  Freigeben zurueck an den Server muss. Angezeigt wird die
        //  gekuerzte - das reicht, um jemanden auseinanderzuhalten.
        // ----------------------------------------------------------------
        const anfragenKasten = document.getElementById('besucherAnfragen');
        if(anfragenKasten){
            const an = (j.anfragen || []);
            if(!an.length){
                anfragenKasten.style.display = 'none';
            } else {
                anfragenKasten.style.display = 'block';
                anfragenKasten.innerHTML = '\u270B <b>' + an.length + '</b> '
                    + (an.length === 1
                        ? 'Anfrage auf Zutritt — jemand von außerhalb des deutschsprachigen '
                          + 'Raums möchte hereingelassen werden.'
                        : 'Anfragen auf Zutritt — sie kommen von außerhalb des deutschsprachigen '
                          + 'Raums und möchten hereingelassen werden.')
                    + '<div style="margin-top:7px; display:flex; flex-direction:column; gap:6px;">'
                    + an.map(function(x){
                        const adr = escapeHtml(String(x.ip || ''));
                        return '<div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">'
                            + '<span style="font-family:var(--font-mono); font-size:0.78rem;">'
                            + (x.geraet || '?') + ' \u00b7 ' + standortText(x.land, x.kurz, x.stadt)
                            + ' \u00b7 vor ' + dauerText(x.wann, Date.now()) + '</span>'
                            + '<button onclick="window.zutrittEntscheiden(\'' + adr + '\', true)" '
                            + 'style="background:#1c7a46; color:#fff; border:0; border-radius:7px; '
                            + 'padding:4px 11px; font-size:0.76rem; cursor:pointer; font-family:inherit;">'
                            + 'Hereinlassen</button>'
                            + '<button onclick="window.zutrittEntscheiden(\'' + adr + '\', false)" '
                            + 'style="background:transparent; color:inherit; border:1px solid currentColor; '
                            + 'border-radius:7px; padding:4px 11px; font-size:0.76rem; cursor:pointer; '
                            + 'opacity:.75; font-family:inherit;">Ablehnen</button>'
                            + '</div>';
                      }).join('')
                    + '</div>';
            }
        }

        // Wer ist JETZT da? Die Kennung ist eine Zufallsnummer des Tabs,
        // nichts Persoenliches - sie steht hier nur, damit man zwei
        // Besucher hinter derselben gekuerzten Adresse auseinanderhalten
        // kann (etwa zwei Handys im selben Mobilfunknetz).
        const aktivKasten = document.getElementById('besucherAktiv');
        // Wie viele sitzen gerade von aussen auf der Seite? Das braucht
        // weiter unten auch der Satz unter der leeren Liste.
        let geradeDa = 0;
        if(aktivKasten){
            // Fehlt das Feld ganz (nicht: ist es leer), dann antwortet ein
            // Server, der diese Auskunft noch nicht kennt. Das gehoert
            // hingeschrieben - sonst fehlt der Kasten und niemand weiss,
            // warum.
            // KEIN return hier: Die Liste darunter soll in jedem Fall
            // gefuellt werden - auch wenn der Server diese eine Auskunft
            // noch nicht kennt. Beim ersten Versuch stand hier eines, und
            // damit waere die Tabelle leer geblieben.
            const alterServer = (typeof j.aktive === 'undefined');
            const a = alterServer ? [] : (j.aktive || []).filter(function(x){ return x.extern; });
            geradeDa = a.length;
            if(alterServer){
                aktivKasten.style.display = 'block';
                aktivKasten.style.background = '#fff8e6';
                aktivKasten.style.borderColor = '#ecd9a4';
                aktivKasten.style.color = '#6f5410';
                aktivKasten.innerHTML = '\u2139\uFE0F Der Server l\u00e4uft noch mit einer \u00e4lteren Fassung. '
                    + 'Nach einem Neustart des Trainers steht hier, wer gerade auf der Seite ist.';
            } else if(!a.length){
                aktivKasten.style.display = 'none';
            } else {
                aktivKasten.style.background = '';
                aktivKasten.style.borderColor = '';
                aktivKasten.style.color = '';
                aktivKasten.style.display = 'block';
                aktivKasten.innerHTML = '\uD83D\uDFE2 <b>' + a.length + '</b> '
                    + (a.length === 1 ? 'Besucher ist' : 'Besucher sind') + ' gerade auf der Seite'
                    + (j.imRaum ? ', <b>' + j.imRaum + '</b> davon im Raum' : '') + '.'
                    + '<div style="margin-top:5px; font-family:var(--font-mono); font-size:0.75rem; line-height:1.7;">'
                    + a.map(function(x){
                        // Der Name zuerst, wenn es einen gibt - danach fragt
                        // der Gastgeber als Erstes. Wer keinen eingetragen
                        // hat, heisst hier "Besucher".
                        const wer = String(x.name || '').trim();
                        return '\u00b7 <b>' + escapeHtml(wer || 'Besucher') + '</b> \u00b7 '
                             + (x.geraet || '?') + ' \u00b7 ' + standortText(x.land, x.ip, x.stadt)
                             + ' \u00b7 seit ' + dauerText(x.seit, Date.now())
                             + ' \u00b7 <span style="opacity:.7;">' + (x.kennung || '') + '</span>';
                      }).join('<br>')
                    + '</div>';
            }
        }

        const liste = (j.liste || []);
        if(tab) tab.style.display = liste.length ? '' : 'none';
        if(leer){
            leer.style.display = liste.length ? 'none' : '';
            // ----------------------------------------------------------------
            //  WAS UNTER DER LEEREN LISTE STEHT               (22.09.2026)
            //  Dietmar, mit einem Bild nach "Verlauf loeschen" - im gruenen
            //  Kasten darueber sass ein Besucher: "ist das so in Ordnung?
            //  Noch niemand da. Sobald jemand den Link anklickt, steht er
            //  hier."
            //
            //  Nein. Der Satz behauptete "noch niemand", waehrend direkt
            //  darueber jemand sass; die Liste war nur geleert. Und wer
            //  schon auf der Seite ist, kommt nicht von selbst wieder in
            //  den Verlauf - dort steht der Seitenaufruf, und der ist
            //  vorbei. Erst der naechste Klick auf den Link legt wieder
            //  eine Zeile an. Also drei Saetze, je nach Lage:
            //    - jemand ist gerade da     -> Verlauf geleert, der oben
            //                                  bleibt oben
            //    - schon Besucher gezaehlt  -> Verlauf geleert
            //    - wirklich noch nie jemand -> der alte Satz
            // ----------------------------------------------------------------
            if(!liste.length){
                let satz;
                if(geradeDa > 0){
                    satz = 'Der Verlauf ist leer. Wer gerade auf der Seite ist, steht oben im grünen Kasten '
                         + '— der nächste Aufruf über den Link kommt wieder hier hinein.';
                } else if(echt > 0){
                    satz = 'Der Verlauf ist leer. Der nächste Aufruf über den Link steht wieder hier.';
                } else {
                    satz = 'Noch niemand da. Sobald jemand den Link anklickt, steht er hier.';
                }
                leer.textContent = satz;
            }
        }
        koerper.innerHTML = liste.map(function(x){
            const d = new Date(x.zeit);
            const nurKlopf = (x.echt === false);
            const zelle = 'padding:6px 8px; border-bottom:1px solid var(--line); vertical-align:top;'
                        + (nurKlopf ? ' opacity:0.5;' : '');
            return '<tr' + (nurKlopf ? ' title="Nur die Seite abgerufen, kein Browser dahinter"' : '') + '>'
                + '<td style="' + zelle + ' white-space:nowrap;">'
                    + d.toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit'}) + ' '
                    + d.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'}) + '</td>'
                + '<td style="' + zelle + '">' + (x.geraet || '—') + '</td>'
                + '<td style="' + zelle + '">' + (x.woher ? String(x.woher).slice(0, 34)
                      : (nurKlopf ? '<span style="opacity:.75;">nur angeklopft</span>'
                                  : '<span style="opacity:.55;">direkt</span>')) + '</td>'
                + '<td style="' + zelle + '">' + (x.raum ? String(x.raum).slice(0, 12) : '<span style="opacity:.55;">—</span>') + '</td>'
                + '<td style="' + zelle + '" title="' + (x.ip || '') + '">'
                    + standortText(x.land, x.ip, x.stadt, x.region) + '</td>'
                + '</tr>';
        }).join('');
    }

    // ----------------------------------------------------------------
    //  GENAU SO GROSS WIE DAS FENSTER DARUNTER        (21.09.2026)
    //  Erst standen hier feste Werte aus dem Stilblatt - 94 %, hoechstens
    //  1020 Punkte, Hoehe 74 bis 92 vh. Auf meinem Bildschirm traf das
    //  die Groesse des Gruppenraum-Fensters, auf Dietmars nicht: Dort ist
    //  es hoeher, weil mehr darin steht. "Das Fenster hat nicht die
    //  gleiche Groesse."
    //
    //  Feste Werte koennen das nicht leisten, denn die Hoehe des anderen
    //  Fensters haengt an seinem Inhalt. Also wird sie gemessen, im
    //  Augenblick des Oeffnens, und uebernommen. Ist der Gruppenraum
    //  nicht offen, gelten wieder die Werte aus dem Stilblatt.
    // ----------------------------------------------------------------
    function besucherGroesseAngleichen(){
        const kasten = document.querySelector('#besucherModal > div');
        if(!kasten) return;
        const vorbild = document.querySelector('#duoModal > div');
        const duoOffen = vorbild && vorbild.offsetParent !== null;
        if(!duoOffen){
            // Zurueck auf die Werte aus dem Stilblatt
            ['width','maxWidth','height','minHeight','maxHeight'].forEach(function(k){ kasten.style[k] = ''; });
            return;
        }
        // offsetWidth/offsetHeight und NICHT getBoundingClientRect: Der
        // Trainer skaliert die ganze Seite ueber zoom (Einstellung
        // "Groesse", --afu-zoom). getBoundingClientRect liefert dann die
        // Punkte auf dem Bildschirm, ein gesetztes style.width aber wird
        // als CSS-Punkt gelesen und anschliessend mitgezoomt. Beim ersten
        // Versuch stand deshalb bei 80 % Zoom ein Fenster von 653 neben
        // einem von 816 - genau die 0,8 zu viel. offsetWidth zaehlt in
        // derselben Einheit, in der auch geschrieben wird.
        const b = Math.round(vorbild.offsetWidth), h = Math.round(vorbild.offsetHeight);
        if(!b || !h) return;
        kasten.style.width = b + 'px';
        kasten.style.maxWidth = b + 'px';
        kasten.style.height = h + 'px';
        kasten.style.minHeight = h + 'px';
        kasten.style.maxHeight = h + 'px';
        console.log('[BESUCHER] Fenster auf ' + b + 'x' + h + ' gesetzt (wie der Gruppenraum).');
    }

    window.besucherFensterOeffnen = async function(){
        const m = document.getElementById('besucherModal');
        if(!m) return;
        m.style.display = 'flex';
        m.classList.add('open');
        besucherGroesseAngleichen();
        await window.besucherFensterAuffrischen();
    };
    window.besucherFensterZu = function(){
        const m = document.getElementById('besucherModal');
        if(m){ m.style.display = 'none'; m.classList.remove('open'); }
    };
    // Steht das Fenster gerade offen? Der Server-Schalter darin frischt
    // die Liste nach dem Umschalten auf - aber nur, wenn jemand hinsieht.
    window.besucherFensterOffen = function(){
        const m = document.getElementById('besucherModal');
        return !!(m && m.classList.contains('open'));
    };
    window.besucherFensterAuffrischen = async function(){
        try{
            const res = await fetch('/api/besucher', {cache:'no-store'});
            if(!res.ok){
                if(window.showAppAlert) window.showAppAlert('Die Besucherliste gibt es nur am Trainer-PC selbst.');
                window.besucherFensterZu();
                return;
            }
            besucherFuellen(await res.json());
        }catch(e){}
    };
    window.besucherZaehlerZuruecksetzen = function(){
        const weiter = async function(){
            try{
                const res = await fetch('/api/besucher/reset', {method:'POST'});
                if(!res.ok){
                    // 404 und 403 bedeuten voellig Verschiedenes, und die
                    // erste Fassung hat beides in einen Satz geworfen:
                    // "Nur am Trainer-PC moeglich". Dietmar stand damit am
                    // Trainer-PC und las, er sei es nicht.
                    //
                    // 404: Die Seite ist neu, der SERVER noch alt - dann
                    //      gibt es die Route gar nicht. Der Trainer muss
                    //      einmal neu gestartet werden, ein F5 reicht
                    //      nicht: Server.js liest sich nur beim Start.
                    // 403: Die Anfrage kam von aussen. Das ist Absicht.
                    if(res.status === 404){
                        throw new Error('Der Server läuft noch mit einer älteren Fassung — '
                            + 'diese Funktion kennt er noch nicht.\n\nEinmal den Trainer beenden und '
                            + 'neu starten (nicht nur die Seite neu laden): Server.js wird nur beim '
                            + 'Start gelesen.');
                    }
                    if(res.status === 403){
                        throw new Error('Das geht nur direkt am Trainer-PC. Über den Einladungslink '
                            + 'ist der Zähler nicht erreichbar.');
                    }
                    throw new Error('Der Server hat mit ' + res.status + ' geantwortet.');
                }
                await window.besucherFensterAuffrischen();
                besucherNachsehen();
                if(window.showAppAlert) window.showAppAlert('Der Besucherzähler steht wieder auf null.');
            }catch(e){
                if(window.showAppAlert) window.showAppAlert('Zurücksetzen nicht möglich: ' + e.message);
            }
        };
        if(window.showAppConfirm){
            window.showAppConfirm('Den Besucherzähler auf null setzen?', weiter, {
                title: 'Zähler zurücksetzen?',
                details: 'Heute, gestern und gesamt stehen danach auf null. Die Liste unten bleibt — '
                       + 'dafür gibt es den Knopf daneben. '
                       + 'Sinnvoll, bevor eine neue Runde Werbung losgeht — dann zählt, was danach kommt.',
                confirmLabel: '<i class="fas fa-rotate-left"></i> Zurücksetzen',
                icon: 'fa-rotate-left'
            });
        } else { weiter(); }
    };

    // Die Liste leeren - wer wann von wo da war. Der Zaehler bleibt.
    // Dietmar am 22.09.2026: "dann benoetigen wir einen Button, den
    // Verlauf loeschen fuer die Benutzer die auf dem Server gewesen sind."
    window.besucherVerlaufLoeschen = function(){
        const weiter = async function(){
            try{
                const res = await fetch('/api/besucher/verlauf-loeschen', {method:'POST'});
                if(!res.ok){
                    if(res.status === 404){
                        throw new Error('Der Server läuft noch mit einer älteren Fassung — '
                            + 'diese Funktion kennt er noch nicht.\n\nEinmal den Trainer beenden und '
                            + 'neu starten (nicht nur die Seite neu laden): Server.js wird nur beim '
                            + 'Start gelesen.');
                    }
                    if(res.status === 403){
                        throw new Error('Das geht nur direkt am Trainer-PC.');
                    }
                    throw new Error('Der Server hat mit ' + res.status + ' geantwortet.');
                }
                const j = await res.json();
                await window.besucherFensterAuffrischen();
                besucherNachsehen();
                if(window.showAppAlert) window.showAppAlert('Der Verlauf ist gelöscht'
                    + (j && j.geloescht ? ' — ' + j.geloescht + ' Einträge.' : '.'));
            }catch(e){
                if(window.showAppAlert) window.showAppAlert('Löschen nicht möglich: ' + e.message);
            }
        };
        if(window.showAppConfirm){
            window.showAppConfirm('Die Besucherliste löschen?', weiter, {
                title: 'Verlauf löschen?',
                details: 'Die Liste unten — wer wann von wo da war — wird geleert. '
                       + 'Der Zähler in der Fußzeile bleibt, wie er ist.',
                confirmLabel: '<i class="fas fa-trash"></i> Löschen',
                icon: 'fa-trash'
            });
        } else { weiter(); }
    };

    // ----------------------------------------------------------------
    //  DER GASTGEBER MACHT GLEICH ZU                  (22.09.2026)
    //  Gegenstueck zum Server-Knopf in der Hauptansicht. Wer gerade
    //  auf der Seite ist, soll seine Frage zu Ende bringen koennen und
    //  nicht mitten im Satz vor einer Auffangseite stehen.
    //
    //  Eigener Balken, nicht der von der Neustart-Ansage: Beide koennen
    //  theoretisch gleichzeitig laufen, und dann soll nicht einer den
    //  anderen ueberschreiben.
    // ----------------------------------------------------------------
    let tuerZuUm = 0;
    let tuerUhrBesucher = null;

    function tuerBalkenZeigen(){
        const balken = document.getElementById('tuerBalken');
        const text = document.getElementById('tuerBalkenText');
        if(!balken || !text) return;
        if(!tuerZuUm){ balken.style.display = 'none'; return; }
        const rest = tuerZuUm - Date.now();
        if(rest <= -5*60*1000){ balken.style.display = 'none'; return; }
        balken.style.display = 'block';
        if(rest > 0){
            const sek = Math.ceil(rest / 1000);
            const zeit = sek >= 60 ? (Math.floor(sek/60) + ' Min ' + String(sek%60).padStart(2,'0') + ' s')
                                   : (sek + ' Sekunden');
            text.innerHTML = '\uD83D\uDD12 <b>Der Kursleiter schließt den Trainer in ' + zeit + '.</b> '
                + 'Du kannst deine Frage noch zu Ende bringen. Dein Lernstand liegt in deinem '
                + 'Browser und bleibt erhalten — und den Trainer gibt es auch zum Mitnehmen.';
        } else {
            text.innerHTML = '\uD83D\uDD12 <b>Der Trainer ist jetzt geschlossen.</b> '
                + 'Später noch einmal vorbeischauen lohnt sich. Dein Lernstand bleibt erhalten.';
        }
    }

    function tuerAnsageSetzen(a){
        // null = Entwarnung, { zu:true } = ab jetzt zu, { schliesstUm } = Countdown
        if(!a){ tuerZuUm = 0; }
        else if(a.zu){ tuerZuUm = Date.now(); }
        else { tuerZuUm = a.schliesstUm || 0; }
        // Waehrend des Countdowns steht die Tuer noch offen - der Chat
        // bleibt bis zum letzten Augenblick.
        tuerAuf = !(a && a.zu);
        try{ chatSichtbarkeitPruefen(); }catch(e){}
        if(tuerUhrBesucher){ clearInterval(tuerUhrBesucher); tuerUhrBesucher = null; }
        tuerBalkenZeigen();
        if(tuerZuUm){
            tuerUhrBesucher = setInterval(tuerBalkenZeigen, 1000);
            try{ if(typeof window.levelUpSpielen === 'function') window.levelUpSpielen(); }catch(e){}
        }
    }

    // ----------------------------------------------------------------
    //  HEREINLASSEN ODER NICHT                        (21.09.2026)
    //  Der Gegenpart zum Knopf auf der Sperrseite. Freigeben darf nur
    //  der Trainer-PC selbst - /api/zutritt-freigeben ist localOnly,
    //  genau wie der Besucherzaehler.
    //
    //  Die Freigabe gilt bis zum Neustart des Trainers. Das war Dietmars
    //  Wahl: keine Datei, nichts zu pflegen, und nach einem Neustart ist
    //  der Zettel wieder leer.
    // ----------------------------------------------------------------
    window.zutrittEntscheiden = async function(ip, herein){
        try{
            const weg = herein ? 'freigeben' : 'ablehnen';
            const res = await fetch('/api/zutritt-' + weg + '?ip=' + encodeURIComponent(ip), { method:'POST' });
            if(!res.ok){
                if(res.status === 404) throw new Error('Der Server läuft noch mit einer älteren Fassung — '
                    + 'einmal den Trainer neu starten, danach gibt es die Ländersperre.');
                if(res.status === 403) throw new Error('Das geht nur direkt am Trainer-PC.');
                throw new Error('Der Server hat mit ' + res.status + ' geantwortet.');
            }
            await window.besucherFensterAuffrischen();
            besucherNachsehen();
            if(window.showAppAlert) window.showAppAlert(herein
                ? 'Freigegeben. Die Seite des Besuchers lädt sich in wenigen Sekunden von selbst neu.\n\n'
                  + 'Die Freigabe gilt, bis du den Trainer neu startest.'
                : 'Abgelehnt. Die Anfrage ist aus der Liste verschwunden.');
        }catch(e){
            if(window.showAppAlert) window.showAppAlert('Nicht möglich: ' + e.message);
        }
    };

    // ----------------------------------------------------------------
    //  DIE ANSAGE VOR DEM NEUSTART                    (21.09.2026)
    //  Der Gastgeber drueckt einen Knopf, alle sehen einen Balken mit
    //  Countdown. Der Text sagt zwei Dinge: dass es gleich abreisst und
    //  dass der neue Link in der Gruppe steht. Ohne den zweiten Teil
    //  waere die Ansage nur eine schlechte Nachricht.
    // ----------------------------------------------------------------
    let neustartUm = 0;
    let neustartUhr = null;
    let neustartWeggeklickt = false;
    let neustartFest = null;   // null = unbekannt, true = Adresse bleibt

    // ----------------------------------------------------------------
    //  BLEIBT DER LINK NACH DEM NEUSTART DERSELBE?     (21.09.2026)
    //  Dietmar: "Die Adresse aendert sich doch jetzt nicht mehr ^^"
    //
    //  Drei Auskuenfte, von der besten zur schlechtesten:
    //
    //  1. Der Gastgeber hat es beim Ansagen mitgeschickt (fest). Das ist
    //     die einzige Stelle, die es wirklich weiss - die eigene Adresse
    //     steht in seinem Browser, nicht im Browser der Besucher.
    //  2. Wir SIND der Gastgeber und haben eine eigene Adresse gesetzt.
    //  3. Kein Server-Hinweis (aeltere Fassung): Dann verraet der
    //     Hostname genug. Nur trycloudflare.com vergibt bei jedem Start
    //     einen neuen Namen; eine eigene Domain tut das nie.
    // ----------------------------------------------------------------
    function adresseBleibt(){
        if(neustartFest === true) return true;
        if(neustartFest === false) return false;
        try{ if(eigeneAdresse()) return true; }catch(e){}
        try{ return !/(^|\.)trycloudflare\.com$/i.test(location.hostname); }catch(e){}
        return false;
    }

    function neustartBalkenZeigen(){
        const balken = document.getElementById('neustartBalken');
        const text = document.getElementById('neustartBalkenText');
        if(!balken || !text) return;
        if(!neustartUm || neustartWeggeklickt){ balken.style.display = 'none'; return; }
        const rest = neustartUm - Date.now();
        if(rest <= -10*60*1000){ balken.style.display = 'none'; return; }   // lange vorbei
        balken.style.display = 'block';
        if(rest > 0){
            const min = Math.floor(rest / 60000), sek = Math.floor((rest % 60000) / 1000);
            const zeit = min > 0 ? (min + ' Min ' + String(sek).padStart(2,'0') + ' s') : (sek + ' Sekunden');
            text.innerHTML = '\u26A0\uFE0F <b>Der Trainer wird in ' + zeit + ' neu gestartet.</b> '
                + (adresseBleibt()
                    ? 'Die Verbindung reißt dabei kurz ab — die Adresse bleibt dieselbe. '
                      + 'Einfach die Seite neu laden, sobald er wieder da ist. '
                    : 'Die Verbindung reißt dabei kurz ab, und die Adresse ändert sich. '
                      + 'Der neue Link wird gleich danach in der Gruppe geteilt. ')
                + 'Dein Lernstand liegt in deinem Browser und bleibt erhalten.';
        } else {
            text.innerHTML = '\u26A0\uFE0F <b>Der Trainer startet gerade neu.</b> '
                + (adresseBleibt()
                    ? 'In einer Minute ist er wieder da — unter derselben Adresse. '
                      + 'Diese Seite dann einmal neu laden. '
                    : 'In einer Minute ist er wieder da — der neue Link steht dann in der Gruppe. ')
                + 'Dein Lernstand bleibt erhalten.';
        }
    }
    function neustartAnsageSetzen(a){
        neustartUm = (a && a.um) ? a.um : 0;
        // Nur uebernehmen, wenn der Server es wirklich sagt. Eine aeltere
        // Fassung schickt das Feld nicht mit - dann bleibt es unbekannt,
        // und adresseBleibt() entscheidet selbst.
        neustartFest = (a && typeof a.fest === 'boolean') ? a.fest : null;
        neustartWeggeklickt = false;
        if(neustartUhr){ clearInterval(neustartUhr); neustartUhr = null; }
        neustartBalkenZeigen();
        if(neustartUm){
            neustartUhr = setInterval(neustartBalkenZeigen, 1000);
            // Ein Ton dazu: Der Balken sitzt oben, und wer unten in einer
            // Frage liest, sieht ihn sonst nicht.
            try{ if(typeof window.levelUpSpielen === 'function') window.levelUpSpielen(); }catch(e){}
        }
    }
    // Global und am Knopf im HTML, nicht hier zugewiesen: duo.js wird
    // dynamisch geladen, und beim ersten Versuch hing der Handler an
    // einem Element, das zu diesem Zeitpunkt zwar da war - der Klick
    // aber trotzdem ins Leere ging. Ein onclick im Markup trifft immer.
    window.neustartBalkenWeg = function(){
        try{ neustartWeggeklickt = true; neustartBalkenZeigen(); }catch(e){
            const el = document.getElementById('neustartBalken');
            if(el) el.style.display = 'none';
        }
    };

    // Der Knopf beim Gastgeber
    window.neustartAnkuendigen = function(){
        const senden = async function(min){
            try{
                // Der Gastgeber weiss als Einziger, ob eine feste Adresse
                // eingetragen ist - also sagt er es mit.
                let fest = '0';
                try{ fest = eigeneAdresse() ? '1' : '0'; }catch(e){}
                const res = await fetch('/api/neustart-ansage?min=' + min + '&fest=' + fest, { method:'POST' });
                if(!res.ok){
                    if(res.status === 404) throw new Error('Der Server läuft noch mit einer älteren Fassung — '
                        + 'einmal den Trainer neu starten, danach gibt es diesen Knopf.');
                    throw new Error('Der Server hat mit ' + res.status + ' geantwortet.');
                }
                const j = await res.json();
                if(window.showAppAlert) window.showAppAlert('Angesagt: Neustart in ' + min + ' Minuten. '
                    + (j.erreicht ? j.erreicht + ' Verbundene haben es bekommen.' : 'Im Moment ist niemand verbunden.')
                    + '\n\nDen Balken sehen auch die, die in den nächsten Minuten noch dazukommen.');
            }catch(e){
                if(window.showAppAlert) window.showAppAlert('Ansage nicht möglich: ' + e.message);
            }
        };
        if(window.showAppConfirm){
            window.showAppConfirm('Allen ansagen, dass der Trainer in 3 Minuten neu startet?', function(){ senden(3); }, {
                title: 'Neustart ankündigen?',
                details: 'Jeder, der gerade auf der Seite ist, bekommt oben einen Balken mit Countdown. '
                       + (function(){
                            try{ return eigeneAdresse()
                                ? 'Dabei steht, dass die Adresse dieselbe bleibt und ein Neuladen reicht. '
                                : 'Dabei steht, dass der neue Link danach in der Gruppe geteilt wird. '; }
                            catch(e){ return ''; }
                         })()
                       + 'Neu gestartet wird dadurch nichts; das machst du danach selbst.',
                confirmLabel: '<i class="fas fa-bullhorn"></i> Ansagen',
                icon: 'fa-bullhorn'
            });
        } else { senden(3); }
    };

    // ----------------------------------------------------------------
    //  DEMO-ZUGANG: BEITRETEN JA, EROEFFNEN NEIN
    // ----------------------------------------------------------------
    const DEMO_TEXT = 'Dieser Trainer läuft auf einem fremden Rechner. '
        + 'Ein eigener Gruppenraum lässt sich hier nicht eröffnen — er würde die Verbindung '
        + 'des Kursleiters stören.\n\nEinem Raum beitreten geht: dafür den Einladungslink des '
        + 'Kursleiters anklicken. Und wer den Trainer behalten will, bekommt ihn kostenlos '
        + 'auf amateurfunk-gruppe.github.io/Amateurfunk-Trainer.';

    function demoKnopfNachziehen(){
        const knopf = document.getElementById('duoCreateRoomBtn');
        if(!knopf) return;
        if(!vonAussen){
            knopf.disabled = false;
            knopf.style.opacity = '';
            knopf.style.cursor = '';
            knopf.removeAttribute('data-demo');
            const alt = document.getElementById('duoDemoHinweis');
            if(alt) alt.remove();
            return;
        }
        knopf.disabled = true;
        knopf.style.opacity = '0.45';
        knopf.style.cursor = 'not-allowed';
        knopf.setAttribute('data-demo', '1');
        knopf.setAttribute('data-tooltip', 'Auf einem fremden Trainer nicht möglich — einem Raum beitreten geht');
        if(!document.getElementById('duoDemoHinweis')){
            const hinweis = document.createElement('div');
            hinweis.id = 'duoDemoHinweis';
            hinweis.className = 'duo-demo-hinweis';
            hinweis.innerHTML = '🔒 <b>Das ist nicht dein Trainer.</b> Ein eigener Raum lässt sich hier nicht eröffnen — '
                + 'er würde die Verbindung des Kursleiters stören. <b>Beitreten geht:</b> den Einladungslink '
                + 'des Kursleiters anklicken.';
            knopf.parentNode.insertBefore(hinweis, knopf.nextSibling);
        }
    }

    function dauerText(vonMs, bisMs){
        let m = Math.max(0, Math.round((bisMs - vonMs) / 60000));
        if(m < 1)  return 'weniger als eine Minute';
        if(m < 60) return m + (m === 1 ? ' Minute' : ' Minuten');
        const st = Math.floor(m / 60); m = m % 60;
        return st + (st === 1 ? ' Stunde' : ' Stunden') + (m ? ' ' + m + ' Min' : '');
    }
    // ----------------------------------------------------------------
    //  AUS "DE" WIRD "Deutschland"                     (21.09.2026)
    //  Dietmar: "Kann man anstatt der IP das in Standort aendern?"
    //
    //  Cloudflare schickt den Laendercode mit (cf-ipcountry). Der Name
    //  dazu kommt aus dem Browser selbst - Intl.DisplayNames kennt alle
    //  Laender in jeder Sprache, es braucht also keine Tabelle im
    //  Programm. Die Flagge wird aus den zwei Buchstaben gerechnet: A
    //  bis Z liegen im Unicode als "Regional Indicator" noch einmal
    //  hinten, und zwei davon nebeneinander zeigt jeder Browser als
    //  Fahne.
    //
    //  Fehlt der Code - etwa bei einem Besucher aus dem eigenen WLAN,
    //  wo kein Cloudflare dazwischen ist -, bleibt die gekuerzte Adresse
    //  stehen. Besser etwas als ein leeres Feld.
    // ----------------------------------------------------------------
    let landNamen = null;
    function standortText(land, ip, stadt, region){
        const code = String(land || '').toUpperCase();
        const ort = String(stadt || '').trim();
        if(!/^[A-Z]{2}$/.test(code)) return ort || (ip ? String(ip) : '—');
        // T1 ist Cloudflares Kuerzel fuer "ueber Tor gekommen"
        if(code === 'T1') return '\uD83E\uDDC5 Tor-Netz';
        let name = code;
        try{
            if(!landNamen) landNamen = new Intl.DisplayNames(['de'], { type: 'region' });
            name = landNamen.of(code) || code;
        }catch(e){}
        // ----------------------------------------------------------------
        //  KEINE FAHNEN AUF WINDOWS                     (21.09.2026)
        //  Hier stand das Fahnen-Emoji, aus den zwei Buchstaben
        //  gerechnet. Auf Handy und Mac sieht man es, auf Windows nicht:
        //  Microsoft liefert in seiner Emoji-Schrift bewusst keine
        //  Laenderflaggen, und der Browser zeigt ersatzweise die zwei
        //  Buchstaben in Kleinschrift. Dietmar: "die Fahnen werden nicht
        //  angezeigt" - und zwar auf genau dem System, auf dem der
        //  Trainer zu Hause ist.
        //
        //  Also kein Emoji, sondern ein gesetztes Kuerzel: sieht
        //  ueberall gleich aus, ist auf einen Blick als Laendercode zu
        //  erkennen und kostet keine Schriftart.
        // ----------------------------------------------------------------
        const fahne = '<span class="land-kuerzel">' + code + '</span> ';
        // Stadt davor, wenn Cloudflare sie mitschickt - bei einem Quick
        // Tunnel tut es das nicht, bei einem eigenen benannten Tunnel mit
        // eingeschalteten "visitor location headers" schon.
        if(ort) return fahne + ort + ', ' + name;
        const teil = String(region || '').trim();
        if(teil && teil !== name) return fahne + teil + ', ' + name;
        return fahne + name;
    }

    function istEntwickler(){
        try{
            const n = (localStorage.getItem('duo_userName') || '').trim();
            return /^dietmar$/i.test(n);
        }catch(e){ return false; }
    }

    async function besucherNachsehen(){
        const zeile = document.getElementById('duoBesucherZeile');
        if(!zeile) return;
        if(!isHost || !duoActive){ zeile.style.display = 'none'; return; }
        let j = null;
        try{
            const res = await fetch('/api/besucher', {cache:'no-store'});
            if(!res.ok){ zeile.style.display = 'none'; return; }   // Gast: 403
            j = await res.json();
        }catch(e){ return; }
        if(!j) return;

        // ----------------------------------------------------------------
        //  ES KLINGELT, WENN JEMAND KOMMT               (21.09.2026)
        //  Dietmar: "Wenn jemand auf dem Server joint moechte ich den
        //  Level Up Sound."
        //
        //  levelUpSpielen() gibt es seit dem 11.09.2026 - derselbe Ton,
        //  der eine gemeisterte Frage quittiert, und er laesst sich in
        //  den Einstellungen abschalten. Genau deshalb wird er hier
        //  benutzt und kein zweiter eingefuehrt: Wer den Ton abgestellt
        //  hat, will ihn auch hier nicht hoeren.
        //
        //  Der Ton haengt an der ZAHL, nicht am Ereignis: Der Server
        //  zaehlt jeden Aufruf von aussen, egal ob jemand nur die Seite
        //  oeffnet oder in den Raum kommt. Kommen zwischen zwei Blicken
        //  drei Leute, klingelt es einmal - das ist gewollt.
        // Der Ton haengt an den ECHTEN Besuchern, nicht an allen Aufrufen.
        // Sonst klingelt es bei jedem Scanner, der die Adresse abklopft -
        // und davon kamen am ersten Tag drei, bevor der Link ueberhaupt
        // geteilt war.
        //
        // Seit dem 22.09.2026 klingelt es nicht mehr hier, sondern in
        // besucherTonPruefen() (Index.html). Grund: Diese Funktion laeuft
        // nur, solange ein Gruppenraum offen ist - Dietmar hatte aber
        // Besuch auf dem blossen Server und hoerte nichts. Den Takt gibt
        // jetzt die Uhr des Server-Knopfes vor; gemerkt wird der Stand
        // nur an einer Stelle, deshalb klingelt es auch dann einmal, wenn
        // beide Wege zugleich laufen.
        const jetztEcht = (typeof j.echte === 'number') ? j.echte : j.gesamt;
        if(typeof window.besucherTonPruefen === 'function'){
            window.besucherTonPruefen(jetztEcht);
        } else if(besucherStandVorher !== null && jetztEcht > besucherStandVorher){
            // Aeltere Index.html: dann eben wie bisher.
            try{ if(typeof window.levelUpSpielen === 'function') window.levelUpSpielen(); }catch(e){}
        }
        besucherStandVorher = jetztEcht;

        // Dasselbe fuer die Anfragen an der Laendersperre: Wer anklopft,
        // wartet vor einer verschlossenen Tuer. Das soll Dietmar hoeren,
        // auch wenn das Besucherfenster gerade zu ist.
        const anfragenJetzt = (j.anfragen || []).length;
        if(anfragenVorher !== null && anfragenJetzt > anfragenVorher){
            console.log('[ZUTRITT] ' + (anfragenJetzt - anfragenVorher) + ' neue Anfrage(n) - Ton.');
            try{ if(typeof window.levelUpSpielen === 'function') window.levelUpSpielen(); }catch(e){}
        }
        anfragenVorher = anfragenJetzt;

        zeile.style.display = 'block';
        zeile.className = 'duo-besucher';
        const jetzt = Date.now();
        const offenSeit = j.laeuftSeit ? new Date(j.laeuftSeit).getTime() : 0;

        const echte = (typeof j.echte === 'number') ? j.echte : j.gesamt;
        let t = '\uD83D\uDC65 ';
        if(!echte){
            t += '<b>Noch kein Besucher</b> \u00fcber den Link.';
        } else {
            t += '<b>' + echte + '</b> ' + (echte === 1 ? 'Besucher' : 'Besucher') + ' \u00fcber den Link';
            t += j.imRaum ? ', <b>' + j.imRaum + '</b> gerade im Raum.' : '.';
        }
        const aktivJetzt = (j.aktivExtern || 0);
        if(aktivJetzt) t += ' <b>' + aktivJetzt + '</b> ' + (aktivJetzt === 1 ? 'ist' : 'sind')
                          + ' gerade auf der Seite.';
        // EINKLAPPBAR (29.09.2026). Dietmar, mit Bild dieses Kastens: "Das
        // auch eingeklappt." Zugeklappt bleibt die erste Zeile mit den
        // Zahlen stehen; der Rest (seit wann, was gezaehlt wird, der Knopf)
        // kommt mit dem Pfeil. Eine wartende Zutrittsanfrage bleibt immer
        // sichtbar - die soll niemand uebersehen.
        t = '<div class="bz-kopf" style="display:flex; align-items:flex-start; gap:6px;"><span style="flex:1;">' + t + '</span>'
          + '<button type="button" class="drz-klapp" onclick="duoBesucherKlappen()" aria-label="Auf- oder zuklappen" title="Auf- oder zuklappen" style="width:24px; height:24px; margin-top:-3px;"><i class="fas fa-chevron-down"></i></button></div>'
          + '<div class="bz-mehr">';
        if(offenSeit) t += 'Der Trainer l\u00e4uft seit <b>' + dauerText(offenSeit, jetzt) + '</b>.';
        t += '<br><span style="opacity:.75;">Gez\u00e4hlt werden Aufrufe von au\u00dfen \u2014 der eigene Rechner und die '
           + 'Vorschau-Abrufe von Facebook und WhatsApp z\u00e4hlen nicht mit.</span>';

        // Die Liste stand bis zum 21.09.2026 hier drin, in einem Feld mit
        // Bildlaufleiste. Dietmar: "Ich finde das irgendwie sehr rein
        // gedrueckt. Ein Button zum oeffnen von einem Fenster waere
        // besser." Seitdem steht hier nur der Knopf; die Liste hat im
        // Fenster Platz fuer eigene Spalten.
        // Eine wartende Anfrage gehoert nicht ins Kleingedruckte. Sie steht
        // deshalb auch hier, nicht nur im Fenster - Dietmar sieht sonst
        // erst beim naechsten Oeffnen, dass jemand vor der Tuer steht.
        const offeneAnfragen = (j.anfragen || []).length;
        if(offeneAnfragen){
            t += '<br><span style="color:#8a6a10; font-weight:600;">\u270B ' + offeneAnfragen + ' '
               + (offeneAnfragen === 1 ? 'Anfrage' : 'Anfragen') + ' auf Zutritt von außerhalb des '
               + 'deutschsprachigen Raums — im Besucherfenster zu entscheiden.</span>';
        }
        let anfrageZeile = '';
        if(offeneAnfragen){
            anfrageZeile = '<div style="color:#8a6a10; font-weight:600; margin-top:3px;">\u270B ' + offeneAnfragen + ' '
               + (offeneAnfragen === 1 ? 'Anfrage' : 'Anfragen') + ' auf Zutritt – im Besucherfenster zu entscheiden.</div>';
        }

        if(istEntwickler()){
            t += '<div style="margin-top:7px;">'
               + '<button type="button" onclick="besucherFensterOeffnen()" class="btn btn-outline" '
               + 'style="padding:0.3rem 0.8rem; font-size:0.72rem; border-radius:14px; '
               + 'border:1px solid #9fc0e0; background:#ffffff; color:#1f3f66; cursor:pointer; font-weight:600;">'
               + '<i class="fas fa-list"></i> Besucher ansehen'
               + (j.gesamt ? ' (' + j.gesamt + ')' : '') + '</button></div>';
        }
        t += '</div>';
        zeile.innerHTML = t + '<div class="bz-anfrage">' + anfrageZeile + '</div>';
        zeile.classList.toggle('zu', besucherZu);
    }
    // Zugeklappt beim Oeffnen des Fensters (Index.html, duoFensterEinklappen).
    var besucherZu = true;
    window.duoBesucherKlappen = function(zu){
        besucherZu = (typeof zu === 'boolean') ? zu : !besucherZu;
        const z = document.getElementById('duoBesucherZeile');
        if(z) z.classList.toggle('zu', besucherZu);
    };

    // ----------------------------------------------------------------
    //  DER BILDSCHIRM DARF NICHT EINSCHLAFEN
    //  Das Lebenszeichen an den Server kommt aus diesem Tab. Legt Chrome
    //  den Tab schlafen ("Energiesparmodus" / "Sleeping Tabs") oder geht
    //  der Rechner in den Ruhezustand, hoert es auf - und der Server
    //  macht Feierabend, waehrend die Gruppe noch uebt. Der Wake Lock
    //  haelt Bildschirm und Tab wach, solange ein Raum offen ist.
    //
    //  Er gilt nur fuer den Bildschirm, nicht gegen den Ruhezustand von
    //  Windows selbst: Wer den Deckel zuklappt, schickt den Rechner
    //  trotzdem schlafen. Das steht so auch im Hinweis unter dem Link.
    // ----------------------------------------------------------------
    let wachSchloss = null;
    async function wachHalten(){
        try{
            if(!('wakeLock' in navigator)) return;
            if(wachSchloss) return;
            wachSchloss = await navigator.wakeLock.request('screen');
            wachSchloss.addEventListener('release', ()=>{ wachSchloss = null; });
            console.log('[DUO] Wake Lock aktiv - der Bildschirm bleibt an, solange der Raum offen ist.');
        }catch(e){ /* Browser mag nicht (kein HTTPS, kein Fokus) - kein Beinbruch */ }
    }
    function wachEnde(){
        try{ if(wachSchloss) wachSchloss.release(); }catch(e){}
        wachSchloss = null;
    }
    // Nach dem Zurueckholen aus dem Hintergrund gibt der Browser den Wake
    // Lock von sich aus frei. Also erneut anfordern, sobald man wieder da ist.
    document.addEventListener('visibilitychange', ()=>{
        if(document.visibilityState === 'visible' && duoActive) wachHalten();
    });

    function bindEvents(){
        if(!socket) return;
        // socket.id kann beim Verbinden noch fehlen - dann warf die Zeile
        // "Cannot read properties of undefined (reading 'slice')" und der
        // ganze Handler brach ab, womit myUserId leer blieb. Aufgefallen
        // am 20.09.2026 beim Pruefungsraum-Test, wenn ein zweiter Rechner
        // waehrend einer laufenden Runde beitritt.
        // ----------------------------------------------------------------
        //  WIEDER HEREIN, WENN DER GASTGEBER WIEDER AUFMACHT (22.09.2026)
        //  Beim Zumachen trennt der Server die Verbindungen von aussen
        //  (Server.js, tuerZumachen). Socket.IO baut nach einer Trennung
        //  DURCH DEN SERVER von sich aus nicht wieder auf - das ist so
        //  vorgesehen, sonst klopfte jeder Hinausgeworfene ewig an. Hier
        //  soll er aber genau das: alle zehn Sekunden leise anklopfen,
        //  hoechstens eine halbe Stunde lang. Macht der Gastgeber wieder
        //  auf, ist der Besucher drin, ohne die Seite neu zu laden.
        // ----------------------------------------------------------------
        let wiederAnklopfen = null;
        socket.on('disconnect', (grund)=>{
            if(grund !== 'io server disconnect') return;
            if(wiederAnklopfen) return;
            let versuche = 0;
            wiederAnklopfen = setInterval(()=>{
                if(socket.connected || ++versuche > 180){ clearInterval(wiederAnklopfen); wiederAnklopfen = null; return; }
                try{ socket.connect(); }catch(e){}
            }, 10000);
        });
        socket.on('connect',()=>{
            if(wiederAnklopfen){ clearInterval(wiederAnklopfen); wiederAnklopfen = null; }
            const ersteVerbindung = !myUserId;
            myUserId=socket.id||''; window.myUserId=myUserId;
            const el=document.getElementById('duoStatus'); if(el) el.textContent = myUserId ? ('Verbunden: '+myUserId.slice(0,5)) : 'Verbunden';

            // ----------------------------------------------------------------
            //  ZURUECK IN DEN RAUM NACH EINEM ABRISS         (21.09.2026)
            //  Dietmar: "Ich uebe mit einer Mitlernerin zusammen im
            //  Gruppenraum. Sie sagt, dass der Chat manchmal nicht geht.
            //  Kommt mir so vor, dass wenn sie fertig ist er nicht mehr geht."
            //
            //  Nachgestellt und gefunden: Reisst die Verbindung laenger ab,
            //  als der Server wartet (pingTimeout 60 s plus pingInterval
            //  30 s), nimmt er den Teilnehmer aus dem Raum. Socket.IO
            //  verbindet danach von selbst wieder - aber mit NEUER Kennung,
            //  und die kennt der Raum nicht.
            //
            //  Die Folge war heimtueckisch: Lesen ging weiter (die
            //  Nachrichten des Gastgebers werden ohnehin nach draussen
            //  kopiert), Schreiben nicht. Sie sah also Dietmars Zeilen
            //  hereinkommen, tippte eine Antwort - und die verschwand. Fuer
            //  sie "geht der Chat nicht", fuer ihn wird sie einfach still.
            //
            //  Und "wenn sie fertig ist" passt genau: Ein Tab, in dem nicht
            //  mehr geklickt wird, ist der, den Windows, das Handy oder das
            //  WLAN als Erstes schlafen legen.
            //
            //  Jetzt meldet sich der Trainer beim Wiederverbinden selbst
            //  zurueck. Nur beim WIEDERverbinden - beim ersten Mal gibt es
            //  noch keinen Raum, in den man zurueckkehren koennte.
            // ----------------------------------------------------------------
            // ----------------------------------------------------------------
            //  NACH EINEM NEUSTART ZURUECK IN DEN EIGENEN RAUM   (06.10.2026)
            //  Der Server holt laufende Raeume nach einem Neustart zurueck.
            //  Die Seite des Kursleiters ist dabei neu geladen worden und
            //  weiss den Raum nicht mehr - wohl aber seinen Schluessel. Mit
            //  dem klopft sie still an (nichts passiert, wenn es den Raum
            //  nicht mehr gibt). Nur ohne Einladungslink in der Adresse.
            // ----------------------------------------------------------------
            if(ersteVerbindung && !roomCode){
                try{
                    const p = new URLSearchParams(window.location.search);
                    if(!p.get('duo')){
                        const alle = JSON.parse(localStorage.getItem('duo_hostSchluessel') || '{}') || {};
                        const jung = Object.keys(alle).filter(k => alle[k] && alle[k].s && Date.now() - (alle[k].zeit || 0) < 3 * 3600000)
                                          .sort((a, b) => (alle[b].zeit || 0) - (alle[a].zeit || 0));
                        if(jung.length){
                            window._duoStillZurueck = jung[0];
                            socket.emit('joinRoom', { code: jung[0], name: getDuoUserName(), password: '', hostSchluessel: alle[jung[0]].s, still: true });
                        }
                    }
                }catch(e){}
            }
            if(!ersteVerbindung && roomCode){
                try{
                    console.log('[DUO] Verbindung war weg - melde mich zurueck in Raum ' + roomCode);
                    socket.emit('joinRoom', { code: roomCode, name: getDuoUserName(), password: getPassword(), hostSchluessel: hostSchluesselFuer(roomCode) });
                }catch(e){}
            }

            // ----------------------------------------------------------------
            //  WANN DIE ANKUNFT GEMELDET WIRD               (21.09.2026)
            //  Erster Versuch haengte das an den Merker des
            //  Willkommensfensters ("demo_hinweis_gesehen"). Das war ein
            //  Denkfehler: Dietmar hatte zwei Besucher auf der Seite und
            //  im Chat stand nichts. Das Fenster erscheint naemlich nur,
            //  wenn jemand ueber eine oeffentliche Adresse kommt - wer es
            //  nie zu sehen bekommt, setzte den Merker nie, und meldete
            //  sich damit auch nie an.
            //
            //  Jetzt entscheidet nicht ein Merker, sondern das Fenster
            //  selbst: Steht es gerade offen, wartet die Meldung auf
            //  willkommenFertig() - dann ist der Name dabei. Steht es
            //  nicht offen, geht sie sofort hinaus.
            //
            //  Wer wirklich gemeldet wird, entscheidet ohnehin der Server:
            //  nur Besucher von aussen, nicht der Gastgeber und nicht sein
            //  WLAN.
            // ----------------------------------------------------------------
            try{
                const m = document.getElementById('willkommenModal');
                const fensterOffen = !!m && m.style.display !== 'none' && m.offsetHeight > 0;
                if(!fensterOffen) hausHalloSenden();
            }catch(e){ hausHalloSenden(); }
        });
        anrufEreignisseAnmelden(socket);   // Anrufen (27.09.2026)
        socket.on('hostChanged', data=>{ window._duoHostId=data.hostId; isHost=data.hostId===myUserId; updateDuoConfigVisibility(); updateDuoCreateButtonVisibility(); updateDuoStartButton(); updateDuoConfigAccess(); updateRoomUsers(duoUsersCache); updateLinkWithTunnel(); });
        socket.on('neustartAnsage', a=>{ try{ neustartAnsageSetzen(a); }catch(e){} });
        socket.on('tuerAnsage', a=>{ try{ tuerAnsageSetzen(a); }catch(e){} });
        socket.on('hausVolk', data=>{
            hausVolk = { anzahl: (data && data.anzahl) || 0, vonAussen: (data && data.vonAussen) || 0,
                         leute: (data && Array.isArray(data.leute)) ? data.leute : [] };
            try{ anrufListeZeichnen(); }catch(e){}
            // Der Anfangszustand der Tuer kommt hier mit - die 'tuerAnsage'
            // wird nur beim Umschalten verschickt, und wer sich erst
            // danach verbindet, haette sie sonst nie gehoert.
            if(data && typeof data.tuer === 'boolean') tuerAuf = data.tuer;
            try{ chatSichtbarkeitPruefen(); }catch(e){}
        });
        socket.on('zugangsart', data=>{
            vonAussen = !!(data && data.vonAussen);
            if(vonAussen) console.log('[DUO] Von aussen: eigener Raum gesperrt, Beitreten geht.');
            demoKnopfNachziehen();
            // Erst mit dieser Auskunft steht fest, ob der Chat ohne Raum
            // gezeigt wird - hintergrundVerbinden() hat vorher geprueft,
            // da war die Antwort noch nicht da.
            try{ chatSichtbarkeitPruefen(); }catch(e){}
        });
        socket.on('raumAbgelehnt', data=>{
            const t = (data && data.text) || 'Ein eigener Raum laesst sich hier nicht eroeffnen.';
            if(window.showAppAlert) window.showAppAlert(t);
            demoKnopfNachziehen();
        });
        socket.on('roomCreated', data=>{ console.log('[DUO] roomCreated', { code: data.code }); hostSchluesselMerken(data.code, data.hostSchluessel); roomCode=data.code; isHost=true; duoActive=true; window._duoHostId=data.hostId||myUserId; showRoomUI(data); chatVerlaufSetzen([]); chatSichtbarkeitPruefen();
            // Ein Raum ohne offene Tuer ist ein Link ins Leere - siehe
            // tuerFuerRaumOeffnen() in Index.html. Der Aufruf prueft selbst,
            // ob er am richtigen Rechner sitzt und ob ueberhaupt etwas zu
            // tun ist.
            try{ if(typeof window.tuerFuerRaumOeffnen === 'function') window.tuerFuerRaumOeffnen(); }catch(e){}
        });
        socket.on('roomJoined', data=>{ console.log('[DUO] roomJoined', data); roomCode=data.code; isHost=data.hostId===myUserId||data.isHost; duoActive=true; window._duoHostId=data.hostId; showRoomUI(data);
            imRaumGewesen = true;
            if(window._duoStillZurueck && window._duoStillZurueck === data.code){
                window._duoStillZurueck = null;
                setTimeout(()=>{ try{ if(window.showAppAlert) window.showAppAlert('Dein Gruppenraum ' + data.code + ' läuft weiter – der Server war nur kurz neu gestartet. Code und Link gelten noch. Wer im Raum war, macht dort weiter, wo er war.'); }catch(e){} }, 800);
            }
            // Zurueck im Raum, waehrend die Runde hier noch laeuft (05.10.2026):
            // Was waehrend des Abrisses beantwortet wurde, hat der Server nie
            // bekommen (Dietmar mit Bild: "0 richtig / 0 falsch - laeuft
            // noch"). Deshalb alle Antworten dieser Runde noch einmal schicken;
            // der Server ueberschreibt doppelte einfach.
            setTimeout(()=>{ try{
                if(!roomCode || !(typeof currentPart === 'string' && currentPart.indexOf('Duo') === 0)) return;
                if(!Array.isArray(currentQuestions) || typeof progress !== 'object') return;
                let n = 0;
                currentQuestions.forEach(q=>{
                    const pr = progress[q.id];
                    if(!pr || !pr.answered || typeof q.userAnswerIndex !== 'number') return;
                    socket.emit('duoAnswer', { code: roomCode, questionId: q.id, optionIndex: q.userAnswerIndex, isCorrect: !!pr.correct, userId: myUserId, art: pr.autoGelernt ? 'gelernt' : '' });
                    n++;
                });
                if(n) console.log('[DUO] Nach dem Wiederverbinden ' + n + ' Antworten erneut gemeldet');
            }catch(e){} }, 400);
            if(nameOffen){ const nn = nameOffen; nameOffen = ''; try{ socket.emit('nameAendern', { code: data.code, name: nn }); }catch(e){} }
            if(beitrittWiederholung){ clearInterval(beitrittWiederholung); beitrittWiederholung = null; }
            try{ const w = document.getElementById('willkommenWarte'); if(w) w.style.display = 'none'; }catch(e){}
            if(startSobaldDrin){
                startSobaldDrin = false;
                try{ if(window.willkommenWartenFertig) window.willkommenWartenFertig(); }catch(e){}
                setTimeout(()=>{ try{ window.duo.startDuoQuiz(); }catch(e){} }, 300);
            }
            // Den Haken so stellen, wie der Raum gebaut ist - sonst sieht der
            // Gast "Fragerunde" und bekommt dann eine Pruefung.
            try{
                const h=document.getElementById('duoPruefungCheck');
                if(h && data.config) h.checked = data.config.pruefung === true;
                const c=document.getElementById('duoFilterCount'), p=document.getElementById('duoFilterPart');
                if(data.config){
                    if(c && data.config.count!=null) c.value=String(data.config.count);
                    if(p && data.config.part) p.value=String(data.config.part);
                }
                pruefungFelderNachziehen();
            }catch(e){}
            updateDuoConfigVisibility(); updateDuoCreateButtonVisibility(); updateDuoStartButton(); updateDuoConfigAccess(); });
        socket.on('roomUpdate', data=>{ if(data.hostId){ window._duoHostId=data.hostId; isHost=data.hostId===myUserId; } if(data.users) duoUsersCache=data.users; updateRoomUsers(data.users); updateDuoConfigVisibility(); updateDuoCreateButtonVisibility(); updateDuoStartButton(); updateDuoConfigAccess(); updateLinkWithTunnel(); });
        socket.on('you-were-kicked', data=>{ alert(data.message||'Du wurdest entfernt'); document.getElementById('duoModal').style.display='none'; if(roomCode&&socket) socket.emit('leaveRoom',{code:roomCode}); roomCode=null; isHost=false; duoActive=false; wacheAnzeigeBeenden(); wachEnde(); chatSichtbarkeitPruefen(); updateDuoConfigVisibility(); updateDuoCreateButtonVisibility(); updateDuoStartButton(); });
        // Der Raum ist weg - entweder weil der Gastgeber ihn beendet hat
        // oder weil der letzte hinausging. Aufraeumen wie beim eigenen
        // Verlassen; das Chatfenster gehoert ausdruecklich dazu, es hing
        // sonst weiter am Bildschirm.
        //
        // Wer selbst geschlossen hat, bekommt keine Meldung: Er weiss es.
        socket.on('roomDeleted', ()=>{
            const warIchSelbst = selbstBeendet;
            selbstBeendet = false;
            roomCode=null; isHost=false; duoActive=false; wacheAnzeigeBeenden(); wachEnde();
            try{ chatSichtbarkeitPruefen(); }catch(e){}
            try{ teilnehmerKnopfEinblenden(false); }catch(e){}
            const m = document.getElementById('duoModal');
            if(m) m.style.display='none';
            try{ updateDuoConfigVisibility(); updateDuoCreateButtonVisibility(); updateDuoStartButton(); }catch(e){}
            if(!warIchSelbst){
                try{
                    if(window.showAppAlert) showAppAlert('Der Kursleiter hat den Gruppenraum beendet.');
                    else alert('Der Kursleiter hat den Gruppenraum beendet.');
                }catch(e){}
            }
        });
        // ----------------------------------------------------------------
        //  WENN DER RAUM EINEN NICHT MEHR KENNT            (21.09.2026)
        //  Zweites Netz hinter der Rueckmeldung beim Wiederverbinden: Wer
        //  in genau der Sekunde nach dem Wiederverbinden tippt, kann den
        //  Server noch vor der Rueckmeldung erwischen.
        //
        //  Statt des nackten "Du bist nicht in diesem Raum" - das niemand
        //  einordnen kann und das keinen Ausweg nennt - wird hier still
        //  noch einmal angeklopft und in verstaendlichen Worten gesagt,
        //  was zu tun ist. Nur einmal je Viertelminute, sonst klopfen wir
        //  gegen eine Tuer, die es nicht mehr gibt.
        // ----------------------------------------------------------------
        let letzteRueckkehr = 0;
        socket.on('errorMsg', msg=>{
            const t = String(msg || '');
            if(/nicht in diesem Raum/i.test(t) && roomCode){
                const jetzt = Date.now();
                if(jetzt - letzteRueckkehr > 15000){
                    letzteRueckkehr = jetzt;
                    try{ socket.emit('joinRoom', { code: roomCode, name: getDuoUserName(), password: getPassword(), hostSchluessel: hostSchluesselFuer(roomCode) }); }catch(e){}
                    if(window.showAppAlert) window.showAppAlert(
                        'Die Verbindung war kurz weg — deine Nachricht ist nicht angekommen.\n\n'
                        + 'Der Trainer meldet dich gerade wieder im Raum an. Schick sie in ein paar '
                        + 'Sekunden einfach noch einmal ab.');
                }
                return;
            }
            if(/Raum nicht gefunden/i.test(t) && roomCode){
                // ----------------------------------------------------------------
                //  ZWEI FAELLE, DIE VORHER EINER WAREN            (22.09.2026)
                //  Dietmar, mit Bild vom Handy: "es kommt ein Hinweis. Der
                //  Gruppenraum war offen, war danach auch drin." Der Hinweis
                //  sagte "der Gastgeber hat ihn beendet, waehrend deine
                //  Verbindung weg war" - und er hatte den Raum gerade erst
                //  betreten wollen. Dazu setzte die alte Fassung roomCode auf
                //  null, und damit war "Jetzt starten" ausgegraut: "Ich musste
                //  eben das Fenster ueber x schliessen."
                //
                //  Wer noch NIE drin war, hat nur einen Link, dessen Raum noch
                //  nicht eroeffnet ist - oder eine Sekunde zu frueh geklopft.
                //  Dann wird still alle fuenf Sekunden noch einmal angeklopft,
                //  hoechstens zehn Minuten lang, und nichts gemeldet. Sobald
                //  der Gastgeber den Raum aufmacht, ist der Gast drin.
                // ----------------------------------------------------------------
                if(!imRaumGewesen){
                    if(!beitrittWiederholung){
                        beitrittVersuche = 0;
                        beitrittWiederholung = setInterval(()=>{
                            if(!roomCode || !socket || !socket.connected || ++beitrittVersuche > 120){
                                clearInterval(beitrittWiederholung); beitrittWiederholung = null; return;
                            }
                            try{ socket.emit('joinRoom', { code: roomCode, name: getDuoUserName(), password: getPassword(), hostSchluessel: hostSchluesselFuer(roomCode) }); }catch(e){}
                        }, 5000);
                    }
                    try{ const w = document.getElementById('willkommenWarte'); if(w) w.style.display = ''; }catch(e){}
                    return;
                }
                // Der Gastgeber hat zugemacht, waehrend die Verbindung weg war.
                roomCode = null;
                try{ chatSichtbarkeitPruefen(); }catch(e){}
                if(window.showAppAlert) window.showAppAlert(
                    'Der Gruppenraum ist nicht mehr offen — der Kursleiter hat ihn beendet, '
                    + 'während deine Verbindung weg war.\n\nDein Lernstand bleibt erhalten.');
                return;
            }
            if(window.showAppAlert) window.showAppAlert(t); else alert(t);
        });

        // Die Wache hat den Tunnel neu aufgebaut. Ein Quick Tunnel bekommt
        // dabei einen neuen Zufallsnamen - der alte Link ist tot. Also
        // sofort die neue Adresse uebernehmen und den Link neu setzen.
        socket.on('tunnelNeu', d=>{
            try{
                if(!d || !d.url) return;
                console.warn('[DUO] Tunnel neu aufgebaut:', d.url, '(vorher', d.alt || '-', ')');
                tunnelUrlCache = d.url;
                window.__TUNNEL_URL__ = d.url;
                tunnelGeprueft = { zustand:'ok', text:'Die Leitung wurde neu aufgebaut.' };
                const feld = document.getElementById('duckDnsInput');
                if(feld && !eigeneAdresse()) feld.value = d.url;
                updateLinkWithTunnel();
                wacheNachsehen();
                // Mit eigener Adresse (29.09.2026): Der Einladungslink laeuft
                // ueber den benannten Tunnel und aendert sich NICHT - der Hinweis
                // "der bisher verschickte Link funktioniert nicht mehr" war dann
                // schlicht falsch. Dietmar bekam ihn trotzdem, mit
                // amateurfunk-trainer.com. Neu aufgebaut wurde nur der Quick
                // Tunnel im Hintergrund, den niemand benutzt.
                if(isHost && eigeneAdresse()){
                    console.log('[DUO] Quick Tunnel neu aufgebaut - die eigene Adresse ' + eigeneAdresse() + ' gilt unverändert, kein Hinweis.');
                } else if(isHost){
                    const txt = 'Die Verbindung zu Cloudflare ist abgerissen und wurde automatisch neu '
                              + 'aufgebaut.\n\nDabei gibt es immer eine NEUE Adresse — der bisher '
                              + 'verschickte Einladungslink funktioniert nicht mehr.\n\nBitte den neuen '
                              + 'Link aus dem Fenster an die Teilnehmer schicken.';
                    if(window.showAppAlert) window.showAppAlert(txt); else alert(txt);
                }
            }catch(e){ console.warn('[DUO] tunnelNeu', e); }
        });
        // Rueckmeldung nach dem Entfernen. Der Gastgeber hat auf einen Knopf
        // gedrueckt und soll wissen, was daraus geworden ist - besonders im
        // Fall "sperren gewollt, aber keine verwertbare Adresse". Der saehe
        // sonst wie ein Erfolg aus und waere keiner.
        socket.on('kickErgebnis', e=>{
            try{
                if(!e) return;
                let t;
                if(e.ohneAdresse && e.grund === 'lokal'){
                    t = `"${e.name}" wurde entfernt. <b>Gesperrt wurde nicht</b> — dieser Teilnehmer `
                      + `sitzt in deinem eigenen Netz (WLAN/LAN), nicht draußen im Internet. `
                      + `Dort wird bewusst nicht gesperrt: Der Router vergibt diese Adressen immer `
                      + `wieder neu, eine Sperre träfe früher oder später den Falschen. `
                      + `Wer im selben Netz sitzt, ist meist im Raum nebenan.`;
                }else if(e.ohneAdresse){
                    t = `"${e.name}" wurde entfernt. Sperren war hier nicht möglich: Für diesen `
                      + `Teilnehmer liegt keine verwertbare Adresse vor. Er kann also wiederkommen.`;
                }else if(e.gesperrt){
                    t = `"${e.name}" wurde entfernt und gesperrt (${e.adresse}).`
                      + (e.weitere ? ` ${e.weitere} weitere Fenster vom selben Anschluss wurden mit entfernt.` : '')
                      + ` Die Sperre gilt für diesen Raum, solange er offen ist.`;
                }else{
                    t = `"${e.name}" wurde entfernt. Er kann dem Raum erneut beitreten.`;
                }
                if(window.showAppAlert) window.showAppAlert(t); else alert(t);
            }catch(err){ console.error('[DUO] kickErgebnis', err); }
        });
        socket.on('duoQuizStarted', data=>{ if(typeof window.startDuoQuizFromServer==='function') window.startDuoQuizFromServer(data); });
        // Unterricht: der Kursleiter blaettert / loest auf (an die Teilnehmer),
        // und der Zaehler fuer seinen Beamer (nur an ihn).
        socket.on('lektionSchritt', d=>{ try{ if(typeof window.unterrichtRaumSchritt==='function') window.unterrichtRaumSchritt(d); }catch(e){ console.error('[UNTERRICHT]', e); } });
        socket.on('lektionStand', d=>{ try{ if(typeof window.unterrichtRaumStand==='function') window.unterrichtRaumStand(d); }catch(e){ console.error('[UNTERRICHT]', e); } });

        // Auswertung fuer den Kursleiter - kommt nur, wenn der Gastgeber
        // sie angefordert hat, und nur bei ihm an.
        socket.on('duoAuswertung', d=>{
            try{ if(typeof window.kursleiterAuswertungZeigen==='function') window.kursleiterAuswertungZeigen(d); }
            catch(e){ console.error('[DUO] Auswertung', e); }
        });

        // ===== Gruppenchat =====
        socket.on('duoChatNachricht', n=>{ try{ chatNachrichtAnzeigen(n); rundgangAngebotPruefen(n); }catch(e){ console.error('[CHAT]', e); } });
        socket.on('lerncoachStand', d=>{ try{ lerncoachStand(d); }catch(e){} });
        socket.on('lerncoachDenkt', d=>{ try{ lerncoachDenkt(d); }catch(e){} });
        socket.on('lerncoachVorlesenFertig', d=>{ try{ lcVorleseAngebotWeg(d && d.id); }catch(e){} });
        socket.on('bildDaten', d=>{ try{ bildDatenAngekommen(d); }catch(e){ console.error('[CHAT] Bild', e); } });
        socket.on('spracheDaten', d=>{ try{ spracheDatenAngekommen(d); }catch(e){ console.error('[CHAT] Sprache', e); } });
        socket.on('chatGelesenStand', d=>{
            try{
                if(!d || !d.id) return;
                const st = { anzahl: Number(d.anzahl) || 0, namen: Array.isArray(d.namen) ? d.namen.map(String) : [] };
                gelesenStand.set(String(d.id), st);
                hakenSetzen(String(d.id), st);
            }catch(e){}
        });
        socket.on('duoChatVerlauf', d=>{ try{
            // Im Raum zaehlt nur der Raumverlauf; einer aus dem Haus, der
            // nach einem Abriss zu spaet eintrifft, wuerde ihn ersetzen.
            if(roomCode && d && d.code === '__haus') return;
            chatVerlaufSetzen(d && d.nachrichten);
        }catch(e){ console.error('[CHAT]', e); } });
        socket.on('duoChatHinweis', t=>{ try{ chatSystemmeldung(t); }catch(e){} });
        socket.on('chatGeloescht', d=>{ try{ nachrichtGeloescht(d); }catch(e){ console.error('[CHAT] Loeschen', e); } });
        socket.on('chatReaktionen', d=>{ try{ if(d && d.id) reaktionenZeichnen(String(d.id), d.reaktionen || null); }catch(e){ console.error('[CHAT] Reaktion', e); } });

        socket.on('duoConfigGeaendert', d=>{
            try{
                if(d && d.config){
                    const c=document.getElementById('duoFilterCount'), p=document.getElementById('duoFilterPart');
                    if(c && d.config.count!=null) c.value=String(d.config.count);
                    if(p && d.config.part) p.value=String(d.config.part);
                    const haken=document.getElementById('duoPruefungCheck');
                    if(haken) haken.checked = d.config.pruefung === true;
                    pruefungFelderNachziehen();
                    const zus=document.getElementById('duoConfigSummary');
                    if(zus && !(d.config.pruefung === true)) zus.textContent = (d.totalQuestions||0) + ' • ' +
                        (d.config.part==='all' ? 'Alle' : (d.config.part||'Alle'));
                }
                updateDuoConfigAccess();
                if(d && !d.gesperrt && !d.leise) chatSystemmeldung(d.config && d.config.pruefung === true
                    ? 'Konfiguration geändert: Prüfungssimulator – 3 Runden zu 25 Fragen.'
                    : 'Konfiguration geändert: ' + (d.totalQuestions||0) + ' Fragen.');
            }catch(e){ console.error('[DUO] duoConfigGeaendert', e); }
        });

        // ===== Abgleich =====
        socket.on('duoNeuLaden', d=>{
            try{
                chatSystemmeldung('Der Server gleicht alle Teilnehmer ab - die Seite wird neu geladen...');
                setTimeout(()=>location.reload(), 1200);
            }catch(e){ location.reload(); }
        });
        socket.on('duoAbgleichStand', d=>{
            try{
                window.duoAbgleichStand = d;
                const el = document.getElementById('duoAbgleichHinweis');
                if(!el || !d) return;
                const abw = (d.abweichend||[]).length;
                el.innerHTML = abw === 0
                    ? '<span style="color:#1f9d55;">✅ Alle Teilnehmer haben denselben Dateistand.</span>'
                    : '<span style="color:#b8860b;">⚠️ ' + abw + ' Teilnehmer mit älterem Stand: ' +
                      (d.abweichend||[]).map(t=>escapeHtml(t.name||'?')).join(', ') + '</span>';
            }catch(e){}
        });

        // ===== GRUPPENRAUM: Jeder in eigenem Tempo - keine Banner/Popups während der laufenden Prüfung.
        // Fortschritt der anderen sieht man bewusst nur im Abschluss-Screen / in der Gesamt-Auswertung,
        // damit während der eigenen Prüfung kein Eindruck von "Warten auf die Gruppe" entsteht.
        // Nach einem Abriss zurueck im Raum: die bisherigen Antworten (05.10.2026).
        // Laeuft die Runde auf dieser Seite noch, ist nichts zu tun - die Seite
        // hat alles. Nach einem Neuladen nimmt startDuoQuizWithQuestions sie
        // und macht bei der ersten offenen Frage weiter.
        socket.on('duoBisher', data=>{
            try{
                window._duoBisher = data && data.antworten ? { code: data.code, antworten: data.antworten } : null;
                console.log('[DUO] Zurueck nach Abriss -', Object.keys((data && data.antworten) || {}).length, 'Antworten sind gespeichert');
            }catch(e){}
        });
        socket.on('duoProgressUpdate', data=>{
            try{
                if(typeof window.updateDuoGroupProgress==='function') window.updateDuoGroupProgress(data);
            }catch(e){}
        });
        socket.on('duoFinalResults', data=>{
            console.log('[DUO] duoFinalResults', data);
            try{
                window.duoFinalResultsData = data;
                // FIX: Das Popup nur zeigen, wenn ICH selbst mit all meinen Fragen
                // fertig bin. Frueher kam das Popup schon dann, wenn nur ein
                // anderer Teilnehmer seine Auswertung abgerufen hatte - auch
                // waehrend man selbst noch mitten in der Pruefung war.
                const ranking = (data && data.ranking) || [];
                const meineZeile = ranking.find(r=>r.userId===window.myUserId);
                const ichBinFertig = !!(meineZeile && meineZeile.finished);
                if(!ichBinFertig) return;
                // Erneuerung bei offenem Fenster (04.10.2026): Dietmar: "Bei
                // mir aktualisiert sich das nicht." Das Fenster war eine
                // Momentaufnahme. Jetzt fragt es bei jeder Aenderung im Raum
                // neu nach - und zeichnet nur, wenn sich wirklich etwas
                // geaendert hat; der Scrollstand bleibt stehen.
                const sig = JSON.stringify(ranking);
                const body0 = document.getElementById('realisticModalBody');
                const offen = auswertungOffen();
                if(offen && window._duoFinalSig === sig) return;
                const rolle = offen && body0 ? (body0.closest('.realistic-modal') || body0) : null;
                const scrollWar = [body0 ? body0.scrollTop : 0, rolle ? rolle.scrollTop : 0];
                window._duoFinalSig = sig;
                // Pruefungsraum (20.09.2026): Nach der dritten Runde steht
                // die EIGENE Auswertung mit den falschen Antworten im
                // Fenster. Die Rangliste darf sie nicht ueberdecken - sie
                // kommt erst, wenn jemand auf "Rangliste der Gruppe" klickt
                // (window._duoRanglisteGewuenscht, gesetzt in Index.html).
                if(window._duoPruefung && !window._duoRanglisteGewuenscht) return;
                window._duoRanglisteGewuenscht = false;
                if(typeof window.showDuoFinalResults==='function'){
                    window.showDuoFinalResults(data);
                    if(offen){ try{ if(body0) body0.scrollTop = scrollWar[0]; if(rolle) rolle.scrollTop = scrollWar[1]; }catch(e){} }
                } else if(typeof window.showDuoFinalModal==='function' && window.duoTrainerData){
                    window.showDuoFinalModal(window.duoTrainerData);
                }
            }catch(e){ console.error('[DUO] duoFinalResults handler error', e); }
        });
        // Teilnehmer-Uebersicht fuer den "Teilnehmer"-Knopf - kommt bei jeder
        // relevanten Aenderung (Start, Antwort, Beitritt), OHNE dass dafuer
        // irgendwo ein Popup aufgeht. Aktualisiert nur die Badge-Zahl und,
        // falls das Panel gerade offen ist, direkt die Liste mit.
        socket.on('duoTeilnehmerUebersicht', data=>{
            try{
                window.duoTeilnehmerUebersichtData = (data && data.teilnehmer) || [];
                teilnehmerBadgeAktualisieren();
                auswertungNachladen();
                const modal = document.getElementById('duoTeilnehmerModal');
                if(modal && modal.style.display!=='none') teilnehmerListeRendern();
            }catch(e){ console.error('[DUO] duoTeilnehmerUebersicht handler error', e); }
        });
        socket.on('duoTrainerLive', data=>{
            console.log('[DUO] duoTrainerLive', data);
            window.duoTrainerData=data;
            // Die Teilnehmerliste zeigt dem Gastgeber seit dem 25.09.2026
            // den Knopf "Muendlich nachpruefen" - der haengt an diesen
            // Daten, also ist sie neu zu zeichnen, wenn sie offen steht.
            try{
                const tm = document.getElementById('duoTeilnehmerModal');
                if(tm && tm.style.display !== 'none') teilnehmerListeRendern();
            }catch(e){}
            try{
                if(typeof window.updateTrainerParticipantSelect==='function'){
                    window.updateTrainerParticipantSelect(data);
                }
                if(window.isHostTrainer && typeof window.renderQuestion==='function' && window.currentQuestions && window.currentQuestions.length>0){
                    // nur trainer view aktualisieren wenn nötig
                }
            }catch(e){}
        });
        socket.on('duoTrainerFinal', data=>{
            console.log('[DUO] duoTrainerFinal', data);
            window.duoTrainerData=data;
            try{
                if(typeof window.showDuoFinalModal==='function'){
                    window.showDuoFinalModal(data);
                }
            }catch(e){}
        });
    }

    window.duo={
        // ----------------------------------------------------------------
        //  IM HINTERGRUND VERBINDEN                     (21.09.2026)
        //  Dietmar: "Ich moechte, dass wenn Nutzer ueber den Link und nur
        //  ueber den Link kommen, auch schreiben koennen."
        //
        //  Daran haette der Chat ohne Raum noch gescheitert: Die
        //  Verbindung zum Server wurde erst aufgebaut, wenn jemand den
        //  Gruppenraum aufschlug - vorher gab es keinen Socket, also auch
        //  keine Nachrichten. Wer nur den Link angeklickt hat, sass ohne
        //  Leitung da.
        //
        //  Diese Fassung baut die Leitung im Hintergrund auf, ohne ein
        //  Fenster zu oeffnen: fuer den Chat und fuer Ansagen des
        //  Gastgebers. Fehler werden geschluckt - laeuft kein Server,
        //  bleibt es beim Lernen ohne Gruppe, genau wie bisher.
        // ----------------------------------------------------------------
        // Name nachtragen (04.10.2026): Der Beitritt ueber den Link kommt vor
        // dem Namen im Willkommensfenster - der Raum kannte sie nur als
        // "Benutzer 1". Wer schon im Raum ist, meldet den Namen nach.
        nameNachziehen: function(name){
            try{
                const v = String(name || '').trim();
                if(!v) return false;
                try{ localStorage.setItem('duo_userName', v); }catch(e){}
                if(socket && roomCode && imRaumGewesen){ socket.emit('nameAendern', { code: roomCode, name: v }); return true; }
                nameOffen = v;      // Beitritt noch unterwegs: wird mit der Antwort des Servers nachgemeldet
                return false;
            }catch(e){ return false; }
        },
        hausHallo: () => hausHalloSenden(),
        // "Los geht's" im Willkommensfenster, wenn ein Raumcode im Link
        // steht: drin -> sofort starten; noch nicht drin -> starten, sobald
        // der Beitritt gelingt (siehe roomJoined).
        losGehts: function(){
            if(roomCode && imRaumGewesen){ try{ window.duo.startDuoQuiz(); }catch(e){} return true; }
            if(roomCode){ startSobaldDrin = true; return false; }
            return false;
        },
        hintergrundVerbinden: async function(){
            try{
                await ensureSocket();
                myUserId = socket.id; window.myUserId = myUserId;
                chatAufbauen();
                chatSichtbarkeitPruefen();
                return true;
            }catch(e){ console.debug('[DUO] Hintergrund-Verbindung nicht moeglich:', e && e.message); return false; }
        },
        chatSenden: function(){ try{ chatSenden(); }catch(e){} },
        // Eine fertige Nachricht in den Chat des Raums schreiben - fuer das
        // Ergebnis der muendlichen Nachpruefung (25.09.2026), das der
        // Kursleiter auf Wunsch weitergibt. Nur im Raum, nie in den Kanal
        // ohne Raum.
        nachrichtSenden: function(text){
            try{
                if(!socket || !roomCode || !text) return false;
                socket.emit('duoChat', { code: roomCode, text: String(text) });
                return true;
            }catch(e){ return false; }
        },
        init: async function(){
            try{ await ensureSocket(); }catch(e){ console.warn('[DUO] Socket offline, Quiz trotzdem lokal'); updateDuoConfigVisibility(); updateDuoCreateButtonVisibility(); updateDuoStartButton(); fetchAndFillTunnelUrl(); return; }
            try{
                myUserId=socket.id; window.myUserId=myUserId;
                const params=new URLSearchParams(window.location.search);
                const hashParams=new URLSearchParams(window.location.hash.substring(1));
                // FIX W20: Passwort kommt jetzt aus dem #-Teil; ?pwd= wird aus
                // Kompatibilitaet zu bereits verschickten Links weiter akzeptiert.
                const urlPwd=hashParams.get('pwd')||params.get('pwd'), urlCode=params.get('duo');
                if(urlPwd){ const inp=document.getElementById('duoPasswordInput'); if(inp) inp.value=urlPwd; try{localStorage.setItem('duo_pwd',urlPwd);}catch(e){} }
                if(urlCode){
                    const codeInp=document.getElementById('duoRoomCodeInput');
                    if(codeInp) codeInp.value=urlCode;
                    roomCode=urlCode;
                    console.log('[DUO] WhatsApp Link erkannt, trete bei:', urlCode);
                    setTimeout(()=>{ try{ const name=getDuoUserName(), pwd=getPassword(); if(socket) socket.emit('joinRoom',{code:urlCode,name:name,password:pwd,hostSchluessel:hostSchluesselFuer(urlCode)}); }catch(e){} }, 500);
                    // Automatisch Modal öffnen bei WhatsApp Link - aber nur
                    // fuer den, der zu Hause sitzt. Wer ueber den geteilten
                    // Link kommt, bekommt das kleine Willkommensfenster: Name,
                    // Los geht's, fertig. Dietmar am 22.09.2026: "Ueber dem
                    // Link mit Duo moechte ich ein Fenster ohne viel Text.
                    // Einfach nur den Benutzernamen eingeben. und danach
                    // Start." Das grosse Fenster bleibt ueber den Knopf
                    // "Raum" erreichbar.
                    const modal=document.getElementById('duoModal');
                    const vonDraussen = (typeof window.ueberGeteiltenLink === 'function') && window.ueberGeteiltenLink();
                    if(modal && !vonDraussen){ modal.style.display='flex'; }
                }
            }catch(e){}
            lanAdresseHolen().then(()=>updateLinkWithTunnel());
            // WICHTIG: Der Tunnel wird schon beim OEFFNEN des Gruppenraums
            // gestartet, nicht erst beim Anlegen des Raums. Das ist immer noch
            // eine ausdrueckliche Handlung des Nutzers (K2 bleibt gewahrt),
            // verschafft dem DNS aber die entscheidenden Sekunden Vorlauf,
            // waehrend der Name eingetippt und der Raum konfiguriert wird.
            tunnelBeiBedarfStarten();
            konfigFelderVerdrahten();
            fetchAndFillTunnelUrl(); updateDuoConfigVisibility(); updateDuoCreateButtonVisibility(); updateDuoStartButton(); updateDuoConfigAccess();
        },
        createRoom: async function(){
            // Erst fragen, dann tun: Ohne diese Zeile liefe unten
            // tunnelBeiBedarfStarten() - und genau das ist der Griff, der
            // dem Gastgeber die Adresse unter dem laufenden Raum wegzieht.
            if(vonAussen){
                if(window.showAppAlert) window.showAppAlert(DEMO_TEXT);
                demoKnopfNachziehen();
                return;
            }
            try{ await ensureSocket(); }catch(e){
                const fakeCode=Math.random().toString(36).substring(2,6).toUpperCase();
                roomCode=fakeCode; isHost=true; duoActive=true; myUserId='local'; window._duoHostId='local';
                duoUsersCache={local:{name:getDuoUserName(),role:'Host'}};
                showRoomUI({code:fakeCode,hostId:'local',users:duoUsersCache});
                if(window.showAppAlert) window.showAppAlert('Offline Raum '+fakeCode+' erstellt');
                return;
            }
            const name=getDuoUserName(), pwd=getPassword();
            const part=document.getElementById('duoFilterPart')?.value||'all';
            const count=document.getElementById('duoFilterCount')?.value||'25';
            const parts=part==='all'?['vorschriften','betrieb','technik']:[part];
            console.log('[DUO] Erstelle Raum', name, part, count);
            // Fragen-Konfiguration wird EINMAL bei Raum-Erstellung festgelegt - alle Teilnehmer
            // bekommen danach exakt dieses Fragen-Set, egal wann sie beitreten oder starten.
            socket.emit('createRoom',{name:name,password:pwd,part:part,count:count,parts:parts,pruefung:pruefungGewaehlt()});
            // FIX: Der Raum ist da - jetzt parallel den Tunnel hochfahren, damit
            // der Einladungslink von selbst erscheint. Bewusst NICHT abwarten,
            // damit die Raum-Oberflaeche sofort aufgeht.
            tunnelBeiBedarfStarten();
        },
        joinRoom: async function(code){
            try{
                await ensureSocket();
                const name=getDuoUserName(), pwd=getPassword();
                const codeInp=document.getElementById('duoRoomCodeInput');
                const target=code||(codeInp?codeInp.value.trim():'');
                if(!target){ alert('Bitte Raumcode eingeben'); return; }
                roomCode=target;
                socket.emit('joinRoom',{code:target,name:name,password:pwd,hostSchluessel:hostSchluesselFuer(target)});
            }catch(e){ alert('Server nicht erreichbar'); }
        },
        // Jeder Teilnehmer (Host oder nicht) startet für sich selbst, unabhängig von allen anderen.
        // Die Fragen sind bereits bei Raum-Erstellung fix vergeben - kein Warten nötig.
        startDuoQuiz: function(){
            if(!socket||!roomCode){ if(window.startQuiz) window.startQuiz(); return; }
            socket.emit('startDuoQuiz',{code:roomCode});
        },
        // Neue Runde fuer ALLE im Raum - frische Fragen, alle fangen von
        // vorn an. Nur der Gastgeber darf das; der Server prueft es noch
        // einmal, hier wird nur der Knopf nicht angeboten.
        // Unterricht im Gruppenraum (27.09.2026). Dietmar: "Die Lektionen,
        // muss es auch im Gruppenraum geben." Im Gleichschritt: Der
        // Kursleiter startet und blaettert, alle folgen. Der Server prueft
        // jedes Mal, ob es wirklich der Kursleiter ist.
        lektionStarten: function(d){
            if(!socket||!roomCode||!isHost||!d) return false;
            socket.emit('lektionStarten',{code:roomCode, nr:d.nr, titel:d.titel, ids:d.ids, abschnitte:d.abschnitte, versatz:d.versatz, gesamt:d.gesamt, frei:!!d.frei});
            return true;
        },
        lektionSchritt: function(index, aufgedeckt){
            if(!socket||!roomCode||!isHost) return;
            socket.emit('lektionSchritt',{code:roomCode, index:index, aufgedeckt:aufgedeckt===true});
        },
        lektionEnde: function(){
            if(!socket||!roomCode||!isHost) return;
            socket.emit('lektionEnde',{code:roomCode});
        },
        neueRunde: function(config){
            if(!socket||!roomCode) return;
            if(!isHost){ if(window.showAppAlert) showAppAlert('Nur der Kursleiter kann eine neue Runde starten.'); return; }
            socket.emit('neueRunde', config ? {code:roomCode, config:config} : {code:roomCode});
        },
        // Eigene feste Adresse setzen oder wieder loeschen.
        eigeneAdresseSetzen: function(roh){
            try{
                let v = String(roh || '').trim();
                if(!v){
                    try{ localStorage.removeItem(EIGENE_ADRESSE); }catch(e){}
                    tunnelUrlCache = null; window.__TUNNEL_URL__ = null;
                    fetchAndFillTunnelUrl();
                    updateLinkWithTunnel();
                    return { ok:true, geloescht:true };
                }
                // Ohne Vorsatz ergaenzen: Wer "meinname.duckdns.org" eintippt,
                // meint https. Und der abschliessende Schraegstrich muss weg,
                // sonst entsteht "…org//?duo=ABC".
                // Ohne Vorsatz meint der Mensch https - das ist der
                // Regelfall. Wer bewusst "http://" davorschreibt, bekommt es
                // auch, samt Warnung.
                if(!/^https?:\/\//i.test(v)) v = 'https://' + v;
                v = v.replace(/\/+$/, '');
                const unsicher = /^http:\/\//i.test(v);
                try{ localStorage.setItem(EIGENE_ADRESSE, v); }catch(e){}
                tunnelUrlCache = v; window.__TUNNEL_URL__ = v;
                const inp = document.getElementById('duckDnsInput');
                if(inp) inp.value = v;
                updateLinkWithTunnel();
                return { ok:true, adresse:v, unsicher:unsicher };
            }catch(e){ return { ok:false, grund:'fehler' }; }
        },
        eigeneAdresse: () => eigeneAdresse(),

        saveDuckDns: function(){
            try{
                const input=document.getElementById('duckDnsInput');
                if(input?.value?.trim()){ try{localStorage.setItem('duo_duckdns',input.value.trim()); localStorage.setItem('duo_duckDnsUrl',input.value.trim());}catch(e){} tunnelUrlCache=input.value.trim(); window.__TUNNEL_URL__=tunnelUrlCache; }
                updateLinkWithTunnel();
                const hint=document.getElementById('duckDnsHint');
                if(hint) hint.textContent='✅ Gespeichert - Link aktualisiert';
                setTimeout(()=>fetchAndFillTunnelUrl(),500);
            }catch(e){}
        },
        startTunnelManually: ()=>startTunnelManually(),
        startTunnelBeiBedarf: ()=>tunnelBeiBedarfStarten(),
        checkTunnelStatus: ()=>checkTunnelStatus(),
        // Entfernen - wahlweise mit Sperre.
        //
        // Die Sperre steht als Haekchen IM Fenster und nicht als zweiter
        // Knopf daneben. Zwei rote Knoepfe nebeneinander, die fast dasselbe
        // tun, sind eine Einladung zum Vergreifen; das Haekchen muss man
        // bewusst setzen und sieht dabei, was es bedeutet.
        //
        // Standard ist AUS: Entfernen ist der haeufige Fall (jemand ist
        // versehentlich im falschen Raum), Sperren der seltene.
        kickUser: function(userId){
            if(!isHost){ alert('Nur Host darf kicken'); return; }
            if(userId===myUserId){ alert('Du kannst dich nicht selbst kicken'); return; }
            const user=duoUsersCache[userId];
            const name=user?.name||'Benutzer';
            const doKick=()=>{
                // Das Haekchen wird beim Klick gelesen, nicht vorher: Das
                // Fenster steht ja noch, solange man ueberlegt.
                let sperren=false;
                try{ const k=document.getElementById('duoSperrenHaken'); sperren=!!(k&&k.checked); }catch(e){}
                if(socket) socket.emit('kickUser',{code:roomCode,userIdToKick:userId,sperren:sperren});
            };
            if(typeof window.showAppConfirm === 'function'){
                window.showAppConfirm(`"${name}" wirklich aus dem Raum entfernen?`, doKick, {
                    title: 'Teilnehmer entfernen?',
                    icon: 'fa-user-slash',
                    iconColor: 'var(--bad)',
                    details:
                        '• Der Teilnehmer wird sofort aus dem Raum entfernt<br>'
                      + '• Ohne Sperre kann er den Einladungslink erneut anklicken und ist wieder da'
                      + '<label style="display:flex; gap:9px; align-items:flex-start; margin-top:0.7rem; '
                      + 'padding:0.55rem 0.7rem; border:1px solid var(--line); border-radius:10px; cursor:pointer;">'
                      + '<input type="checkbox" id="duoSperrenHaken" style="margin-top:3px; width:16px; height:16px; cursor:pointer;">'
                      + '<span style="text-align:left; line-height:1.5;">'
                      + '<b>Zusätzlich sperren</b><br>'
                      + '<span style="font-size:0.8rem; color:var(--muted);">'
                      + 'Für diesen Raum kommt von diesem Anschluss niemand mehr herein — auch nicht '
                      + 'unter anderem Namen. Gedacht für den Fall, dass jemand den Link '
                      + 'weitergegeben hat. Mit dem Raum endet auch die Sperre.'
                      + '<span style="display:block; margin-top:0.45rem;">'
                      + 'Gilt nur für Teilnehmer aus dem Internet. Wer in deinem eigenen '
                      + 'WLAN sitzt, wird nur entfernt — dort wird nicht gesperrt.</span>'
                      + '</span></span></label>',
                    confirmLabel: '<i class="fas fa-user-slash"></i> Entfernen',
                    confirmColor: 'var(--bad)'
                });
            } else if(confirm(`"${name}" entfernen?`)){ doKick(); }
        },
        // Der vierte Parameter "art" sagt, WIE die Antwort zustande kam.
        // Fehlt er, ist es eine echte Antwort - so verhalten sich auch
        // aeltere Trainer, die noch nichts davon wissen.
        //
        //   (nichts)    ein Mensch hat auf eine Antwort geklickt
        //   'loesung'   F9/F10 hat die Loesung gezeigt; der Server
        //               bekommt eine bewusst falsche Antwort gemeldet
        //   'gelernt'   beim Betreten vorbelegt, weil die Frage schon
        //               als gemeistert galt - niemand hat sie gerade
        //               beantwortet
        //
        // Gebraucht wird das fuer die Auswertung des Gastgebers: eine
        // Fehlerquote, in der F9-Meldungen und Vorbelegungen mitzaehlen,
        // beschreibt nicht die Gruppe, sondern die Technik.
        answer: function(qId, optIndex, isCorrect, art){
            if(!socket||!roomCode){
                console.warn('[DUO] answer: kein socket/roomCode');
                return;
            }
            try{
                console.log('[DUO] emit duoAnswer', {code:roomCode, questionId:qId, optionIndex:optIndex, isCorrect:isCorrect, art:art||'echt'});
                socket.emit('duoAnswer',{code:roomCode, questionId:qId, optionIndex:optIndex, isCorrect:isCorrect, userId:myUserId, art:art||''});
                window._duoHasAnswered=true;
            }catch(e){ console.error('[DUO] answer emit Fehler', e); }
            // Fehler mitnehmen (24.09.2026, siehe FEHLER MITNEHMEN in
            // Index.html): Dieselbe Meldung merkt sich der Browser, damit
            // ein Gast seine Fehler fuer den eigenen Trainer speichern kann.
            try{ if(typeof window.raumFehlerMerken === 'function') window.raumFehlerMerken(qId, isCorrect, art||'', optIndex); }catch(e){}
        },
        // Kein serverseitiges Warten mehr - jeder geht in eigenem Tempo weiter (rein lokale Navigation in Index.html)
        next: function(){ /* no-op: Fragenwechsel läuft rein lokal, siehe nextQuestion() in Index.html */ },
        // Jeder Teilnehmer kann den aktuellen Gesamtstand jederzeit abrufen (auch bevor alle fertig sind)
        requestFinalResults: function(){
            if(!socket||!roomCode) return;
            try{ socket.emit('requestFinalResults',{code:roomCode}); }catch(e){ console.error(e); }
        },
        // Auswertung fuer den Kursleiter anfordern. Der Server laesst nur
        // den Gastgeber durch - die Pruefung hier ist nur die Hoeflichkeit,
        // damit gar nicht erst gefragt wird.
        auswertungAnfordern: function(){
            if(!socket||!roomCode) return false;
            if(!isHost){ console.warn('[DUO] Auswertung nur fuer den Kursleiter'); return false; }
            try{ socket.emit('duoAuswertungAnfordern',{code:roomCode}); return true; }
            catch(e){ console.error('[DUO] auswertungAnfordern', e); return false; }
        },
        // Raum verlassen - und als Gastgeber: beenden.
        //
        // Dietmar am 05.09.2026 hat "Schliessen" zu diesem Weg gemacht.
        // Wer den Raum aufgemacht hat, macht ihn auch zu; wer nur zu Gast
        // ist, meldet sich ab und laesst den Raum stehen.
        leave: function(){
            try{
                if(socket && roomCode){
                    selbstBeendet = true;   // die Rueckmeldung vom Server nicht doppelt melden
                    socket.emit(isHost ? 'raumBeenden' : 'leaveRoom', { code: roomCode });
                }
                roomCode=null; chatSichtbarkeitPruefen(); isHost=false; duoActive=false; wacheAnzeigeBeenden(); wachEnde();
                window._duoHostId=null; duoUsersCache={};
                document.getElementById('duoModal').style.display='none';
                updateDuoConfigVisibility(); updateDuoCreateButtonVisibility(); updateDuoStartButton();
                teilnehmerKnopfEinblenden(false); window.duoTeilnehmerUebersichtData=[];
                // Die Merker des Pruefungsraums gehoeren zum Raum, nicht zum
                // Rechner: Wer ihn verlaesst, soll danach den ganz normalen
                // Pruefungssimulator und die ganz normale Gruppenrunde haben.
                window._duoPruefung=false; window._duoRanglisteGewuenscht=false; window._duoPruefungFinalHtml=null;
                try{ if(window.realisticExam){ window.realisticExam.duo=false; window.realisticExam.duoFragen=null; } }catch(e){}
            }catch(e){}
        },
        teilnehmerOeffnen: function(){
            try{
                teilnehmerModalSicherstellen();
                teilnehmerListeRendern();
                const modal = document.getElementById('duoTeilnehmerModal');
                if(modal){ modal.style.display='flex'; }
                if(teilnehmerTickHandle) clearInterval(teilnehmerTickHandle);
                // Tickt die "läuft: mm:ss"-Anzeige auch ohne neues Server-Ereignis weiter.
                teilnehmerTickHandle = setInterval(teilnehmerListeRendern, 1000);
            }catch(e){ console.error('[DUO] teilnehmerOeffnen Fehler', e); }
        },
        teilnehmerSchliessen: function(){
            try{
                const modal = document.getElementById('duoTeilnehmerModal');
                if(modal) modal.style.display='none';
                if(teilnehmerTickHandle){ clearInterval(teilnehmerTickHandle); teilnehmerTickHandle=null; }
            }catch(e){}
        },
        alleNeuLaden: ()=>alleNeuLadenLassen(),
        chatOeffnen: ()=>chatUmschalten(true),
        // Fuer die Android-App (30.09.2026): Chat als ganze Seite oeffnen,
        // ohne gleich die Tastatur hochzuholen.
        chatOeffnenOhneFokus: ()=>chatUmschalten(true, true),
        chatUmschalten: ()=>chatUmschalten(),
        raumCode: ()=>roomCode || '',
        isActive: ()=>!!duoActive,
        isHost: ()=>isHost
    };
    window.kickUser=id=>{ try{ window.duo.kickUser(id); }catch(e){} };

    // ===== Watchdog: fragt nach dem Laden der Seite so lange beim Server nach, bis der Tunnel WIRKLICH
    // läuft, und korrigiert dann automatisch die gespeicherte/angezeigte URL. Läuft unabhängig davon,
    // ob/wann der Gruppenraum-Dialog geöffnet wird - verhindert, dass beim Erstellen eines Raums kurz
    // nach dem Server-Start eine veraltete Tunnel-URL "gewinnt", nur weil der Tunnel noch startet.
    async function pollTunnelUrlUntilReady(){
        for(let i=0;i<20;i++){
            try{
                const res=await fetch('/api/tunnel-url',{cache:'no-store'});
                if(res.ok){
                    const j=await res.json();
                    if(j && j.url && j.running){
                        tunnelUrlCache=j.url;
                        window.__TUNNEL_URL__=j.url;
                        try{ localStorage.setItem('duo_duckdns',j.url); localStorage.setItem('duo_duckDnsUrl',j.url); }catch(e){}
                        const inp=document.getElementById('duckDnsInput');
                        if(inp) inp.value=j.url;
                        updateLinkWithTunnel();
                        return; // Tunnel bestätigt live -> fertig, kein weiteres Polling nötig
                    }
                }
            }catch(e){}
            await new Promise(r=>setTimeout(r,1500));
        }
        // FIX: Nicht mehr stumm aufgeben. Wenn nach 30s kein Tunnel laeuft, liegt das
        // seit K2 im Normalfall schlicht daran, dass keiner gestartet wurde.
        console.info('[DUO] Kein laufender Tunnel gefunden - er wird beim Anlegen eines Gruppenraums automatisch gestartet.');
        updateLinkWithTunnel();
    }

    // Overlay verschwindet auch, wenn man den Dialog mit Escape schliesst
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') tooltipVerbergen(); });
    window.addEventListener('blur', tooltipVerbergen);

    document.addEventListener('DOMContentLoaded',()=>{
        try{
            const savedName=localStorage.getItem('duo_userName');
            if(savedName){ const inp=document.getElementById('duoUserNameInput'); if(inp) inp.value=savedName; }
            const savedDuck=localStorage.getItem('duo_duckdns')||localStorage.getItem('duo_duckDnsUrl');
            // WICHTIG: NUR das Eingabefeld zur Anzeige/Bearbeitung vorbefüllen - NICHT tunnelUrlCache setzen.
            // tunnelUrlCache wird ausschließlich von pollTunnelUrlUntilReady() mit einer vom Server
            // bestätigten, aktuell laufenden URL gesetzt. Damit kann kein alter Wert mehr "gewinnen".
            if(savedDuck){ const inp=document.getElementById('duckDnsInput'); if(inp) inp.value=savedDuck; }
            lanAdresseHolen();
            abgleichStarten();
            pollTunnelUrlUntilReady();

            // WICHTIG: Wenn Link mit ?duo= kommt (WhatsApp), automatisch Modal öffnen!
            const params=new URLSearchParams(window.location.search);
            const urlCode=params.get('duo');
            if(urlCode){
                console.log('[DUO] WhatsApp Link erkannt auf Seite laden:', urlCode);
                // Modal nach kurzer Zeit öffnen, damit duo.js geladen ist
                setTimeout(()=>{
                    const modal=document.getElementById('duoModal');
                    const vonDraussen = (typeof window.ueberGeteiltenLink === 'function') && window.ueberGeteiltenLink();
                    if(modal && !vonDraussen){ modal.style.display='flex'; console.log('[DUO] Modal automatisch geöffnet für WhatsApp Link'); }
                    // Duo initialisieren
                    if(window.duo && window.duo.init) window.duo.init();
                    else {
                        const codeInp=document.getElementById('duoRoomCodeInput');
                        if(codeInp) codeInp.value=urlCode;
                    }
                }, 800);
            }
        }catch(e){ console.warn('[DUO] DOMContentLoaded Fehler', e); }
    });

    window.addEventListener('error', function(e){
        if(e.filename && (e.filename.includes('video_map_embed')||e.filename.includes('socket.io')||e.filename.includes('confetti'))){
            console.warn('[FALLBACK] Externes Skript blockiert:', e.filename);
            e.preventDefault();
            try{ updateDuoConfigVisibility(); updateDuoCreateButtonVisibility(); updateDuoStartButton(); }catch(err){}
        }
    }, true);
})();
