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
        c.style.display=inRoom?'none':''; j.style.display=inRoom?'none':'';
        // Der Kasten um die beiden Knoepfe steht als Fusszeile der linken
        // Spalte. Sind beide Knoepfe weg, soll auch der Kasten weg - sonst
        // bleibt eine leere Zeile mit Innenabstand stehen und macht die
        // Spalte laenger, als ihr Inhalt es verlangt.
        try{
            const kasten = c.closest('.duo-knopfreihe-links');
            if(kasten) kasten.classList.toggle('leer', inRoom);
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

    function ensureSocket(){
        return new Promise((resolve,reject)=>{
            if(socket?.connected) return resolve(socket);
            const load=()=>{
                if(!window.io){ reject(new Error('Socket.IO fehlt')); return; }
                try{
                    // auth.sitzung: siehe CHAT_SITZUNG oben (23.09.2026)
                    socket=io(getBaseUrl(),{transports:['websocket','polling'], timeout:5000, auth:{ sitzung: CHAT_SITZUNG }});
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
            '</div>';
        }).join('');
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
        '#duoChatBox{position:fixed;right:18px;bottom:18px;z-index:99998;width:320px;max-width:calc(100vw - 36px);',
        '  font-family:inherit;border-radius:14px;overflow:hidden;box-shadow:0 10px 34px rgba(0,0,0,0.28);',
        '  background:var(--card-bg);display:none;flex-direction:column;border:1px solid var(--line);',
        '  color:var(--ink);}',
        '#duoChatBox.sichtbar{display:flex;}',
        '#duoChatKopf{background:var(--panel-navy);color:#fff;padding:10px 12px;display:flex;align-items:center;gap:8px;',
        '  cursor:pointer;user-select:none;}',
        '#duoChatKopf .titel{font-weight:700;font-size:0.88rem;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
        '#duoChatBlase{background:var(--bad);color:#fff;border-radius:999px;min-width:19px;height:19px;padding:0 5px;',
        '  font-size:0.7rem;font-weight:700;display:none;align-items:center;justify-content:center;}',
        '#duoChatBlase.sichtbar{display:flex;}',
        '#duoChatKnopf{background:transparent;border:none;color:#fff;font-size:1.05rem;cursor:pointer;line-height:1;padding:2px 4px;}',
        '#duoChatKoerper{display:none;flex-direction:column;height:300px;}',
        '#duoChatBox.offen #duoChatKoerper{display:flex;}',
        '#duoChatVerlauf{flex:1;overflow-y:auto;padding:10px;background:var(--bg);display:flex;flex-direction:column;gap:7px;}',
        '.duo-chat-zeile{max-width:85%;padding:6px 10px;border-radius:12px;font-size:0.82rem;line-height:1.35;word-break:break-word;}',
        /* Jede Blase bringt ihre eigene Textfarbe mit - nichts wird mehr geerbt */
        '.duo-chat-fremd{align-self:flex-start;background:var(--card-bg);border:1px solid var(--line);color:var(--ink);}',
        '.duo-chat-eigen{align-self:flex-end;background:var(--panel-navy);color:#fff;}',
        '.duo-chat-willkommen{align-self:stretch;max-width:100%;background:var(--good-bg);border:1px solid var(--good);color:var(--ink);}',
        '.duo-chat-absender{display:block;font-size:0.67rem;font-weight:700;opacity:0.75;margin-bottom:2px;}',
        '.duo-chat-zeit{font-size:0.62rem;opacity:0.6;margin-left:6px;}',
        '.duo-chat-system{align-self:center;background:var(--warn-bg);border:1px solid var(--warn);color:var(--ink);font-size:0.72rem;}',
        '#duoChatLeer{color:var(--muted);font-size:0.78rem;text-align:center;margin:auto;padding:0 14px;line-height:1.4;}',
        '#duoChatEingabeZeile{display:flex;gap:6px;padding:8px;border-top:1px solid var(--line);background:var(--card-bg);}',
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
        '#duoChatEingabeZeile.nimmt-auf #duoChatEingabe,#duoChatEingabeZeile.nimmt-auf #duoChatMikro,#duoChatEingabeZeile.nimmt-auf #duoChatSenden{display:none !important;}',
        '#duoChatAufnahme{display:none;flex:1;align-items:center;gap:8px;min-width:0;}',
        '#duoChatEingabeZeile.nimmt-auf #duoChatAufnahme{display:flex;}',
        '#duoChatAufnahme .punkt{width:10px;height:10px;border-radius:50%;background:#d9403a;flex-shrink:0;animation:duoAufnahmePuls 1s infinite;}',
        '@keyframes duoAufnahmePuls{0%,100%{opacity:1}50%{opacity:0.25}}',
        '#duoChatAufnahme .zeit{flex:1;font-size:0.85rem;font-variant-numeric:tabular-nums;}',
        '#duoChatAufnahme button{border:none;border-radius:999px;width:36px;height:36px;cursor:pointer;font-size:0.95rem;flex-shrink:0;}',
        '#duoChatAufnahmeWeg{background:transparent;color:var(--ink);border:1px solid var(--line) !important;}',
        '#duoChatAufnahmeSenden{background:#1c7a46;color:#fff;}',
        '.duo-sprache{display:inline-flex;align-items:center;gap:8px;min-width:170px;vertical-align:middle;}',
        '.duo-sprache-knopf{border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;font-size:0.8rem;flex-shrink:0;',
        '  background:var(--panel-navy);color:#fff;}',
        '.duo-chat-eigen .duo-sprache-knopf{background:#fff;color:var(--panel-navy);}',
        '.duo-sprache-balken{flex:1;height:4px;border-radius:2px;background:currentColor;opacity:0.25;position:relative;overflow:hidden;}',
        '.duo-sprache-balken span{position:absolute;left:0;top:0;bottom:0;width:0;background:currentColor;}',
        '.duo-sprache-dauer{font-size:0.72rem;opacity:0.8;font-variant-numeric:tabular-nums;}',
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
        '  <button id="duoChatKnopf" type="button" title="Minimieren/Aufklappen">▾</button>',
        '</div>',
        '<div id="duoChatKoerper">',
        '  <div id="duoChatVerlauf"><div id="duoChatLeer">Noch keine Nachrichten.<br>Schreib etwas an alle im Raum.</div></div>',
        '  <div id="duoChatEingabeZeile">',
        '    <input id="duoChatEingabe" type="text" maxlength="500" placeholder="Nachricht an alle..." autocomplete="off">',
        '    <button id="duoChatMikro" type="button" title="Sprachnachricht aufnehmen">🎤</button>',
        '    <div id="duoChatAufnahme"><span class="punkt"></span><span class="zeit" id="duoChatAufnahmeZeit">Aufnahme 0:00</span>',
        '      <button id="duoChatAufnahmeWeg" type="button" title="Verwerfen">✕</button>',
        '      <button id="duoChatAufnahmeSenden" type="button" title="Senden">➤</button></div>',
        '    <button id="duoChatSenden" type="button" title="Senden">➤</button>',
        '  </div>',
        '</div>'
        ].join('');
        document.body.appendChild(box);

        document.getElementById('duoChatKopf').addEventListener('click', ()=>chatUmschalten());
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
        document.getElementById('duoChatAufnahmeWeg').addEventListener('click', ()=>aufnahmeBeenden(false));
        document.getElementById('duoChatAufnahmeSenden').addEventListener('click', ()=>aufnahmeBeenden(true));
        // Abspielen: ein Klick auf irgendeinen Knopf in einer Sprachblase
        document.getElementById('duoChatVerlauf').addEventListener('click', e=>{
            const k = e.target && e.target.closest ? e.target.closest('.duo-sprache-knopf') : null;
            if(!k) return;
            const b = k.closest('.duo-sprache');
            if(b && b.dataset.spracheId) spracheAbspielen(b.dataset.spracheId);
        });
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
    function chatUmschalten(erzwingeOffen, ohneFokus){
        chatAufbauen();
        const box = document.getElementById('duoChatBox');
        if(!box) return;
        chatOffen = (erzwingeOffen === true) ? true : !chatOffen;
        box.classList.toggle('offen', chatOffen);
        const knopf = document.getElementById('duoChatKnopf');
        if(knopf) knopf.textContent = chatOffen ? '▾' : '▴';
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

    function chatBlaseAktualisieren(){
        const blase = document.getElementById('duoChatBlase');
        if(!blase) return;
        blase.textContent = chatUngelesen > 99 ? '99+' : String(chatUngelesen);
        blase.classList.toggle('sichtbar', chatUngelesen > 0);
    }

    function chatNachUntenRollen(){
        const v = document.getElementById('duoChatVerlauf');
        if(v) v.scrollTop = v.scrollHeight;
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
            if(stand && stand.anzahl > 0){
                el.textContent = '\u2713\u2713';
                el.classList.add('gelesen');
                const namen = (stand.namen || []).join(', ');
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
    //  Das Mikrofon gibt es im Gruppenraum fuer jeden, im Chat ohne Raum
    //  nur am Trainer-PC selbst (siehe Server.js, SPRACHNACHRICHTEN).
    //  Und nur, wo der Browser es erlaubt: ueber https oder am eigenen
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
            if(roomCode) return true;
            if(typeof window.laeuftLokal === 'function') return !!window.laeuftLokal();
            return !vonAussen;
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

    async function aufnahmeStarten(){
        if(aufnahme || !darfSprechen()) return;
        let stream;
        try{
            stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
        }catch(e){
            chatSystemmeldung(e && e.name === 'NotAllowedError'
                ? 'Kein Zugriff aufs Mikrofon. Bitte im Browser erlauben (Schloss-Symbol links neben der Adresse).'
                : 'Kein Mikrofon gefunden.');
            return;
        }
        const arten = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm'];
        let art = '';
        try{ art = arten.find(a => MediaRecorder.isTypeSupported(a)) || ''; }catch(e){}
        let rec;
        try{ rec = new MediaRecorder(stream, art ? { mimeType: art, audioBitsPerSecond: 24000 } : { audioBitsPerSecond: 24000 }); }
        catch(e){ try{ rec = new MediaRecorder(stream); }catch(e2){ stream.getTracks().forEach(t => t.stop()); chatSystemmeldung('Aufnehmen geht in diesem Browser nicht.'); return; } }
        const a = { rec: rec, stream: stream, teile: [], start: Date.now(), uhr: null, weg: false };
        aufnahme = a;
        rec.ondataavailable = e => { if(e.data && e.data.size) a.teile.push(e.data); };
        rec.onstop = () => {
            try{ a.stream.getTracks().forEach(t => t.stop()); }catch(e){}
            if(a.uhr) clearInterval(a.uhr);
            if(aufnahme === a) aufnahme = null;
            aufnahmeLeiste(false);
            if(a.weg) return;
            const dauer = (Date.now() - a.start) / 1000;
            if(dauer < 1 || !a.teile.length){ chatSystemmeldung('Zu kurz - nichts gesendet.'); return; }
            const typ = (a.rec.mimeType || art || 'audio/webm').replace(/\s+/g, '');
            const blob = new Blob(a.teile, { type: typ });
            blob.arrayBuffer().then(buf => {
                if(!socket || !socket.connected){ chatSystemmeldung('Keine Verbindung - Sprachnachricht nicht gesendet.'); return; }
                socket.emit('duoSprache', { code: roomCode || '__haus', mime: typ, dauer: Math.min(SPRACHE_MAX_SEK, dauer),
                                            daten: buf, name: getDuoUserName() });
            }).catch(() => chatSystemmeldung('Die Aufnahme ging verloren.'));
        };
        rec.start(1000);
        aufnahmeLeiste(true);
        const zeit = document.getElementById('duoChatAufnahmeZeit');
        const tick = () => {
            const s = (Date.now() - a.start) / 1000;
            if(zeit) zeit.textContent = 'Aufnahme ' + dauerMinSek(s) + ' / 1:00';
            if(s >= SPRACHE_MAX_SEK) aufnahmeBeenden(true);
        };
        tick();
        a.uhr = setInterval(tick, 250);
    }
    function aufnahmeBeenden(senden){
        const a = aufnahme;
        if(!a) return;
        a.weg = !senden;
        try{ if(a.rec.state !== 'inactive') a.rec.stop(); else a.rec.onstop(); }catch(e){ aufnahme = null; aufnahmeLeiste(false); }
    }

    function spracheKnopf(id, zeichen, titel){
        const b = document.querySelector('.duo-sprache[data-sprache-id="' + String(id).replace(/[^a-f0-9]/gi, '') + '"]');
        const k = b && b.querySelector('.duo-sprache-knopf');
        if(k){ k.textContent = zeichen; if(titel) k.title = titel; }
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
        spracheAudio.set(id, au);
        const b = spracheKnopf(id, '▶', 'Abspielen');
        const balken = b ? b.querySelector('.duo-sprache-balken span') : null;
        const dauerFeld = b ? b.querySelector('.duo-sprache-dauer') : null;
        const gesamt = dauerFeld ? dauerFeld.textContent : '';
        au.addEventListener('play', () => spracheKnopf(id, '⏸', 'Anhalten'));
        au.addEventListener('pause', () => spracheKnopf(id, '▶', 'Abspielen'));
        au.addEventListener('timeupdate', () => {
            const d2 = isFinite(au.duration) && au.duration > 0 ? au.duration : 0;
            if(balken && d2) balken.style.width = Math.min(100, 100 * au.currentTime / d2) + '%';
            if(dauerFeld) dauerFeld.textContent = dauerMinSek(au.currentTime) + ' / ' + gesamt;
        });
        au.addEventListener('ended', () => {
            if(balken) balken.style.width = '0';
            if(dauerFeld) dauerFeld.textContent = gesamt;
            spracheKnopf(id, '▶', 'Abspielen');
        });
        spracheAlleAnhalten(id);
        au.play().catch(() => spracheKnopf(id, '▶', 'Abspielen'));
    }

    function chatNachrichtAnzeigen(n, stumm){
        chatAufbauen();
        // Robust gegen Reihenfolge: die automatische Begruessung kann eintreffen,
        // bevor showRoomUI() das Fenster sichtbar gemacht hat.
        if(roomCode) chatSichtbarkeitPruefen();
        if(!n || !n.text) return;
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

        const eigen = n.userId && n.userId === myUserId;
        const zeile = document.createElement('div');
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
        const absender = (n.system || (eigen && !n.automatisch)) ? '' :
            '<span class="duo-chat-absender">' + escapeHtml(n.name || 'Teilnehmer') +
            (n.istHost ? ' · Server' : '') + woher + '</span>';
        const mitHaken = eigen && !n.system && !n.automatisch && n.id;
        const koerper = (n.sprache && n.id)
            ? '<span class="duo-sprache" data-sprache-id="' + escapeHtml(n.id) + '">'
              + '<button type="button" class="duo-sprache-knopf" title="Abspielen">▶</button>'
              + '<span class="duo-sprache-balken"><span></span></span>'
              + '<span class="duo-sprache-dauer">' + dauerMinSek(n.sprache.dauer) + '</span></span>'
            : chatLinks(smileysErsetzen(escapeHtml(n.text)));
        zeile.innerHTML = absender + koerper +
            '<span class="duo-chat-zeit">' + chatZeit(n.zeit) + '</span>' +
            (mitHaken ? '<span class="duo-chat-haken" data-haken="' + escapeHtml(n.id) + '"></span>' : '');
        verlauf.appendChild(zeile);
        if(mitHaken){
            hakenSetzen(n.id, gelesenStand.get(n.id) || null, n.empfaenger);
        } else if(!eigen && !n.system && !n.automatisch && n.id){
            zuMelden.add(n.id);
            gelesenMelden();
        }

        while(verlauf.children.length > 200) verlauf.removeChild(verlauf.firstChild);
        chatNachUntenRollen();

        if(stumm || eigen) return;

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
        const gruen = darfDownloadSenden() && !feld.value.trim();
        k.classList.toggle('download', gruen);
        k.title = gruen ? 'Link zum Herunterladen an alle senden' : 'Senden';
    }

    function chatSenden(ausKnopf){
        const feld = document.getElementById('duoChatEingabe');
        if(!feld) return;
        let text = feld.value.trim();
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
            text.innerHTML = '\uD83D\uDD12 <b>Der Gastgeber schließt den Trainer in ' + zeit + '.</b> '
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
        + 'des Gastgebers stören.\n\nEinem Raum beitreten geht: dafür den Einladungslink oder '
        + 'den Raum-Code benutzen. Und wer den Trainer behalten will, bekommt ihn kostenlos '
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
                + 'er würde die Verbindung des Gastgebers stören. <b>Beitreten geht:</b> Einladungslink '
                + 'anklicken oder Raum-Code eintragen.';
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
        if(offenSeit) t += ' Der Trainer l\u00e4uft seit <b>' + dauerText(offenSeit, jetzt) + '</b>.';
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

        if(istEntwickler()){
            t += '<div style="margin-top:7px;">'
               + '<button type="button" onclick="besucherFensterOeffnen()" class="btn btn-outline" '
               + 'style="padding:0.3rem 0.8rem; font-size:0.72rem; border-radius:14px; '
               + 'border:1px solid #9fc0e0; background:#ffffff; color:#1f3f66; cursor:pointer; font-weight:600;">'
               + '<i class="fas fa-list"></i> Besucher ansehen'
               + (j.gesamt ? ' (' + j.gesamt + ')' : '') + '</button></div>';
        }
        zeile.innerHTML = t;
    }

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
            //  Dietmar: "Ich uebe mit meiner Freundin Maja zusammen im
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
            //  kopiert), Schreiben nicht. Maja sah also Dietmars Zeilen
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
            if(!ersteVerbindung && roomCode){
                try{
                    console.log('[DUO] Verbindung war weg - melde mich zurueck in Raum ' + roomCode);
                    socket.emit('joinRoom', { code: roomCode, name: getDuoUserName(), password: getPassword() });
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
        socket.on('hostChanged', data=>{ window._duoHostId=data.hostId; isHost=data.hostId===myUserId; updateDuoConfigVisibility(); updateDuoCreateButtonVisibility(); updateDuoStartButton(); updateDuoConfigAccess(); updateRoomUsers(duoUsersCache); updateLinkWithTunnel(); });
        socket.on('neustartAnsage', a=>{ try{ neustartAnsageSetzen(a); }catch(e){} });
        socket.on('tuerAnsage', a=>{ try{ tuerAnsageSetzen(a); }catch(e){} });
        socket.on('hausVolk', data=>{
            hausVolk = { anzahl: (data && data.anzahl) || 0, vonAussen: (data && data.vonAussen) || 0 };
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
        socket.on('roomCreated', data=>{ console.log('[DUO] roomCreated', data); roomCode=data.code; isHost=true; duoActive=true; window._duoHostId=data.hostId||myUserId; showRoomUI(data); chatVerlaufSetzen([]); chatSichtbarkeitPruefen();
            // Ein Raum ohne offene Tuer ist ein Link ins Leere - siehe
            // tuerFuerRaumOeffnen() in Index.html. Der Aufruf prueft selbst,
            // ob er am richtigen Rechner sitzt und ob ueberhaupt etwas zu
            // tun ist.
            try{ if(typeof window.tuerFuerRaumOeffnen === 'function') window.tuerFuerRaumOeffnen(); }catch(e){}
        });
        socket.on('roomJoined', data=>{ console.log('[DUO] roomJoined', data); roomCode=data.code; isHost=data.hostId===myUserId||data.isHost; duoActive=true; window._duoHostId=data.hostId; showRoomUI(data);
            imRaumGewesen = true;
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
                    if(window.showAppAlert) showAppAlert('Der Gastgeber hat den Gruppenraum beendet.');
                    else alert('Der Gastgeber hat den Gruppenraum beendet.');
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
                    try{ socket.emit('joinRoom', { code: roomCode, name: getDuoUserName(), password: getPassword() }); }catch(e){}
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
                            try{ socket.emit('joinRoom', { code: roomCode, name: getDuoUserName(), password: getPassword() }); }catch(e){}
                        }, 5000);
                    }
                    try{ const w = document.getElementById('willkommenWarte'); if(w) w.style.display = ''; }catch(e){}
                    return;
                }
                // Der Gastgeber hat zugemacht, waehrend die Verbindung weg war.
                roomCode = null;
                try{ chatSichtbarkeitPruefen(); }catch(e){}
                if(window.showAppAlert) window.showAppAlert(
                    'Der Gruppenraum ist nicht mehr offen — der Gastgeber hat ihn beendet, '
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
                if(isHost){
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

        // Auswertung fuer den Kursleiter - kommt nur, wenn der Gastgeber
        // sie angefordert hat, und nur bei ihm an.
        socket.on('duoAuswertung', d=>{
            try{ if(typeof window.kursleiterAuswertungZeigen==='function') window.kursleiterAuswertungZeigen(d); }
            catch(e){ console.error('[DUO] Auswertung', e); }
        });

        // ===== Gruppenchat =====
        socket.on('duoChatNachricht', n=>{ try{ chatNachrichtAnzeigen(n); }catch(e){ console.error('[CHAT]', e); } });
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
                if(d && !d.gesperrt) chatSystemmeldung(d.config && d.config.pruefung === true
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
                // Pruefungsraum (20.09.2026): Nach der dritten Runde steht
                // die EIGENE Auswertung mit den falschen Antworten im
                // Fenster. Die Rangliste darf sie nicht ueberdecken - sie
                // kommt erst, wenn jemand auf "Rangliste der Gruppe" klickt
                // (window._duoRanglisteGewuenscht, gesetzt in Index.html).
                if(window._duoPruefung && !window._duoRanglisteGewuenscht) return;
                window._duoRanglisteGewuenscht = false;
                if(typeof window.showDuoFinalResults==='function'){
                    window.showDuoFinalResults(data);
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
                const modal = document.getElementById('duoTeilnehmerModal');
                if(modal && modal.style.display!=='none') teilnehmerListeRendern();
            }catch(e){ console.error('[DUO] duoTeilnehmerUebersicht handler error', e); }
        });
        socket.on('duoTrainerLive', data=>{
            console.log('[DUO] duoTrainerLive', data);
            window.duoTrainerData=data;
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
                    setTimeout(()=>{ try{ const name=getDuoUserName(), pwd=getPassword(); if(socket) socket.emit('joinRoom',{code:urlCode,name:name,password:pwd}); }catch(e){} }, 500);
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
                socket.emit('joinRoom',{code:target,name:name,password:pwd});
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
        neueRunde: function(){
            if(!socket||!roomCode) return;
            if(!isHost){ if(window.showAppAlert) showAppAlert('Nur der Gastgeber kann eine neue Runde starten.'); return; }
            socket.emit('neueRunde',{code:roomCode});
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
            if(!isHost){ console.warn('[DUO] Auswertung nur fuer den Gastgeber'); return false; }
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
