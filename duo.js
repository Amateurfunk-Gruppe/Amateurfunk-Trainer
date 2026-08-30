// duo.js - V15 FINAL - Einladungslink mit Tunnel-URL + WhatsApp Auto-Join
(function(){
    'use strict';
    let socket=null, roomCode=null, isHost=false, myUserId=null, duoActive=false;
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
    function getTunnelUrl(){
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
        const hinweis=document.getElementById('duoConfigHinweis');
        const imRaum = !!roomCode;
        const gesperrt = imRaum && (!isHost || andereImRaum() > 0);
        [c,p].forEach(el=>{
            if(!el) return;
            el.disabled = gesperrt;
            el.style.opacity = gesperrt ? '0.5' : '1';
            el.style.cursor = gesperrt ? 'not-allowed' : 'pointer';
        });
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
        socket.emit('duoConfigAendern', {code: roomCode, part: part, count: count, parts: parts});
    }
    function konfigFelderVerdrahten(){
        ['duoFilterCount','duoFilterPart'].forEach(id=>{
            const el=document.getElementById(id);
            if(!el || el.dataset.duoVerdrahtet) return;
            el.dataset.duoVerdrahtet='1';
            el.addEventListener('change', konfigAenderungMelden);
        });
    }

    function ensureSocket(){
        return new Promise((resolve,reject)=>{
            if(socket?.connected) return resolve(socket);
            const load=()=>{
                if(!window.io){ reject(new Error('Socket.IO fehlt')); return; }
                try{
                    socket=io(getBaseUrl(),{transports:['websocket','polling'], timeout:5000});
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
            const z = tunnelGeprueft.zustand;
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
                const inp=document.getElementById('duckDnsInput');
                if(inp) inp.value=j.url;
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
                const inp=document.getElementById('duckDnsInput');
                if(inp) inp.value=j.url;
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
                const inp = document.getElementById('duckDnsInput');
                if(inp) inp.value = j.url;
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
        '  <button id="duoChatAbgleich" type="button" title="Alle Teilnehmer neu laden lassen (nur Host)" ',
        '     style="display:none;background:transparent;border:none;color:#fff;font-size:0.95rem;cursor:pointer;padding:2px 4px;">⟳</button>',
        '  <button id="duoChatKnopf" type="button" title="Minimieren/Aufklappen">▾</button>',
        '</div>',
        '<div id="duoChatKoerper">',
        '  <div id="duoChatVerlauf"><div id="duoChatLeer">Noch keine Nachrichten.<br>Schreib etwas an alle im Raum.</div></div>',
        '  <div id="duoChatEingabeZeile">',
        '    <input id="duoChatEingabe" type="text" maxlength="500" placeholder="Nachricht an alle..." autocomplete="off">',
        '    <button id="duoChatSenden" type="button" title="Senden">➤</button>',
        '  </div>',
        '</div>'
        ].join('');
        document.body.appendChild(box);

        document.getElementById('duoChatKopf').addEventListener('click', ()=>chatUmschalten());
        const abg = document.getElementById('duoChatAbgleich');
        if(abg) abg.addEventListener('click', e=>{ e.stopPropagation(); alleNeuLadenLassen(); });
        document.getElementById('duoChatKnopf').addEventListener('click', e=>{ e.stopPropagation(); chatUmschalten(); });
        document.getElementById('duoChatSenden').addEventListener('click', chatSenden);
        const feld = document.getElementById('duoChatEingabe');
        feld.addEventListener('keydown', e=>{
            if(e.key === 'Enter'){ e.preventDefault(); chatSenden(); }
            e.stopPropagation();          // Hotkeys des Trainers nicht ausloesen
        });
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

    function chatSichtbarkeitPruefen(){
        chatAufbauen();
        const box = document.getElementById('duoChatBox');
        if(!box) return;
        if(roomCode){
            box.classList.add('sichtbar');
        } else {
            box.classList.remove('sichtbar','offen');
            chatOffen = false;
            chatUngelesen = 0;
            chatBlaseAktualisieren();
        }
    }

    function chatUmschalten(erzwingeOffen){
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
            const feld = document.getElementById('duoChatEingabe');
            if(feld) setTimeout(()=>feld.focus(), 60);
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

    function chatNachrichtAnzeigen(n, stumm){
        chatAufbauen();
        // Robust gegen Reihenfolge: die automatische Begruessung kann eintreffen,
        // bevor showRoomUI() das Fenster sichtbar gemacht hat.
        if(roomCode) chatSichtbarkeitPruefen();
        if(!n || !n.text) return;
        if(n.id && chatGesehen.has(n.id)) return;      // Doppelte vermeiden
        if(n.id) chatGesehen.add(n.id);

        const verlauf = document.getElementById('duoChatVerlauf');
        if(!verlauf) return;
        const leer = document.getElementById('duoChatLeer');
        if(leer) leer.remove();

        const eigen = n.userId && n.userId === myUserId;
        const zeile = document.createElement('div');
        zeile.className = 'duo-chat-zeile ' +
            (n.automatisch ? 'duo-chat-willkommen' : (eigen ? 'duo-chat-eigen' : 'duo-chat-fremd'));
        // escapeHtml ist Pflicht - der Text kommt von anderen Teilnehmern
        const absender = (eigen && !n.automatisch) ? '' :
            '<span class="duo-chat-absender">' + escapeHtml(n.name || 'Teilnehmer') +
            (n.istHost ? ' · Host' : '') + '</span>';
        zeile.innerHTML = absender + smileysErsetzen(escapeHtml(n.text)) +
            '<span class="duo-chat-zeit">' + chatZeit(n.zeit) + '</span>';
        verlauf.appendChild(zeile);

        while(verlauf.children.length > 200) verlauf.removeChild(verlauf.firstChild);
        chatNachUntenRollen();

        if(stumm || eigen) return;

        if(!chatOffen){
            chatUngelesen++;
            chatBlaseAktualisieren();
            // Aufklappen - aber nicht mitten in einer laufenden Pruefung
            if(!pruefungLaeuft()) chatUmschalten(true);
        }
    }

    function chatSenden(){
        const feld = document.getElementById('duoChatEingabe');
        if(!feld) return;
        const text = feld.value.trim();
        if(!text) return;
        if(!socket || !roomCode){
            chatSystemmeldung('Keine Verbindung zum Raum - Nachricht nicht gesendet.');
            return;
        }
        socket.emit('duoChat', { code: roomCode, text: text });
        feld.value = '';
        feld.focus();
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

    function bindEvents(){
        if(!socket) return;
        socket.on('connect',()=>{ myUserId=socket.id; window.myUserId=myUserId; const el=document.getElementById('duoStatus'); if(el) el.textContent='Verbunden: '+socket.id.slice(0,5); });
        socket.on('hostChanged', data=>{ window._duoHostId=data.hostId; isHost=data.hostId===myUserId; updateDuoConfigVisibility(); updateDuoCreateButtonVisibility(); updateDuoStartButton(); updateDuoConfigAccess(); updateRoomUsers(duoUsersCache); updateLinkWithTunnel(); });
        socket.on('roomCreated', data=>{ console.log('[DUO] roomCreated', data); roomCode=data.code; isHost=true; duoActive=true; window._duoHostId=data.hostId||myUserId; showRoomUI(data); chatVerlaufSetzen([]); chatSichtbarkeitPruefen(); });
        socket.on('roomJoined', data=>{ console.log('[DUO] roomJoined', data); roomCode=data.code; isHost=data.hostId===myUserId||data.isHost; duoActive=true; window._duoHostId=data.hostId; showRoomUI(data); updateDuoConfigVisibility(); updateDuoCreateButtonVisibility(); updateDuoStartButton(); updateDuoConfigAccess(); });
        socket.on('roomUpdate', data=>{ if(data.hostId){ window._duoHostId=data.hostId; isHost=data.hostId===myUserId; } if(data.users) duoUsersCache=data.users; updateRoomUsers(data.users); updateDuoConfigVisibility(); updateDuoCreateButtonVisibility(); updateDuoStartButton(); updateDuoConfigAccess(); updateLinkWithTunnel(); });
        socket.on('you-were-kicked', data=>{ alert(data.message||'Du wurdest entfernt'); document.getElementById('duoModal').style.display='none'; if(roomCode&&socket) socket.emit('leaveRoom',{code:roomCode}); roomCode=null; isHost=false; duoActive=false; chatSichtbarkeitPruefen(); updateDuoConfigVisibility(); updateDuoCreateButtonVisibility(); updateDuoStartButton(); });
        socket.on('roomDeleted', ()=>{ alert('Raum gelöscht'); roomCode=null; isHost=false; duoActive=false; document.getElementById('duoModal').style.display='none'; });
        socket.on('errorMsg', msg=>{ if(window.showAppAlert) window.showAppAlert(msg); else alert(msg); });
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

        // ===== Gruppenchat =====
        socket.on('duoChatNachricht', n=>{ try{ chatNachrichtAnzeigen(n); }catch(e){ console.error('[CHAT]', e); } });
        socket.on('duoChatVerlauf', d=>{ try{ chatVerlaufSetzen(d && d.nachrichten); }catch(e){ console.error('[CHAT]', e); } });
        socket.on('duoChatHinweis', t=>{ try{ chatSystemmeldung(t); }catch(e){} });

        socket.on('duoConfigGeaendert', d=>{
            try{
                if(d && d.config){
                    const c=document.getElementById('duoFilterCount'), p=document.getElementById('duoFilterPart');
                    if(c && d.config.count!=null) c.value=String(d.config.count);
                    if(p && d.config.part) p.value=String(d.config.part);
                    const zus=document.getElementById('duoConfigSummary');
                    if(zus) zus.textContent = (d.totalQuestions||0) + ' • ' +
                        (d.config.part==='all' ? 'Alle' : (d.config.part||'Alle'));
                }
                updateDuoConfigAccess();
                if(d && !d.gesperrt) chatSystemmeldung('Konfiguration geändert: ' + (d.totalQuestions||0) + ' Fragen.');
            }catch(e){ console.error('[DUO] duoConfigGeaendert', e); }
        });

        // ===== Abgleich =====
        socket.on('duoNeuLaden', d=>{
            try{
                chatSystemmeldung('Der Host gleicht alle Teilnehmer ab - die Seite wird neu geladen...');
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
                    // Automatisch Modal öffnen bei WhatsApp Link!
                    const modal=document.getElementById('duoModal');
                    if(modal){ modal.style.display='flex'; }
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
            socket.emit('createRoom',{name:name,password:pwd,part:part,count:count,parts:parts});
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
        answer: function(qId, optIndex, isCorrect){
            if(!socket||!roomCode){
                console.warn('[DUO] answer: kein socket/roomCode');
                return;
            }
            try{
                console.log('[DUO] emit duoAnswer', {code:roomCode, questionId:qId, optionIndex:optIndex, isCorrect:isCorrect});
                socket.emit('duoAnswer',{code:roomCode, questionId:qId, optionIndex:optIndex, isCorrect:isCorrect, userId:myUserId});
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
        leave: function(){
            try{ if(socket&&roomCode) socket.emit('leaveRoom',{code:roomCode}); roomCode=null; chatSichtbarkeitPruefen(); isHost=false; duoActive=false; window._duoHostId=null; duoUsersCache={}; document.getElementById('duoModal').style.display='none'; updateDuoConfigVisibility(); updateDuoCreateButtonVisibility(); updateDuoStartButton(); teilnehmerKnopfEinblenden(false); window.duoTeilnehmerUebersichtData=[]; }catch(e){}
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
                    if(modal){ modal.style.display='flex'; console.log('[DUO] Modal automatisch geöffnet für WhatsApp Link'); }
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
