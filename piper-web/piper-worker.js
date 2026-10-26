// Piper-Stimme im Hintergrund-Prozess (AFU 21.10.2026)
// Dietmar: "Maja spricht sehr spaet ... Ton abgehackt ... Buttons nicht anklicken". Ursache: das Rechnen der Stimme
// (onnxruntime + Phonemisierung) lief im Hauptprozess und fror die Seite je Satz mehrere Sekunden ein.
// Hier laeuft es getrennt - Tippen, Animation und Ton bleiben frei.
self.AFU_ORT_URL = '/piper-web/ort/ort.wasm.min.js';
const V = new URL(import.meta.url).search;
const BASIS = self.location.origin;
let T = null;
const sitz = {}, reihe = [], gemerkt = new Map();
let kette = Promise.resolve();
async function lib(){ if(!T) T = await import('./piper-tts-web.js' + V); return T; }
function sitzung(stimme, id){
  if(sitz[stimme]) return sitz[stimme];
  const p = (async () => {
    const t = await lib();
    let gesp = []; try{ gesp = await t.stored(); }catch(e){}
    if(gesp.indexOf(stimme) < 0) self.postMessage({ id, neu: true });
    t.TtsSession._instance = null;
    const s = await t.TtsSession.create({ voiceId: stimme,
      wasmPaths: { onnxWasm: BASIS + '/piper-web/ort/', piperData: BASIS + '/piper-web/piper_phonemize.data', piperWasm: BASIS + '/piper-web/piper_phonemize.wasm' },
      progress: q => { try{ if(q && q.total) self.postMessage({ id, loaded: q.loaded, total: q.total }); }catch(e){} } });
    t.TtsSession._instance = null;
    return s;
  })();
  sitz[stimme] = p;
  const i = reihe.indexOf(stimme); if(i >= 0) reihe.splice(i, 1); reihe.push(stimme);
  while(reihe.length > 2) delete sitz[reihe.shift()];
  p.catch(() => { if(sitz[stimme] === p) delete sitz[stimme]; });
  return p;
}
async function rechnen(m){
  const schluessel = m.stimme + '|' + m.text;
  if(gemerkt.has(schluessel)){ const b = gemerkt.get(schluessel); gemerkt.delete(schluessel); gemerkt.set(schluessel, b); return b.slice(0); }
  let wav;
  try{ wav = await (await sitzung(m.stimme, m.id)).predict(m.text); }
  catch(e1){ delete sitz[m.stimme]; wav = await (await sitzung(m.stimme, m.id)).predict(m.text); }
  const buf = await wav.arrayBuffer();
  gemerkt.set(schluessel, buf.slice(0));
  while(gemerkt.size > 40) gemerkt.delete(gemerkt.keys().next().value);
  return buf;
}
self.onmessage = e => {
  const m = e.data || {};
  const lauf = async () => {
    try{
      if(m.op === 'predict'){ const buf = await rechnen(m); self.postMessage({ id: m.id, ok: true, buf }, [buf]); }
      else self.postMessage({ id: m.id, ok: false, fehler: 'unbekannt' });
    }catch(err){ self.postMessage({ id: m.id, ok: false, fehler: String((err && err.message) || err) }); }
  };
  kette = kette.then(lauf, lauf);
};
self.postMessage({ bereit: true });
