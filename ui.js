{
const { Game, AI, cardName, COLOR_FR } = window.MK;
const D = window.MK_DATA;
const NET = window.MKNet;
const $ = (id) => document.getElementById(id);
const COLORS = ['#f5c518', '#e2483d', '#8a5cd6', '#2f9e8f', '#f08a34'];
const AI_NAMES = ['Pip', 'Tilly', 'Bram', 'Wren'];
const CARD = Object.fromEntries(D.CITY.concat(D.WILD).map(c => [c.id, c]));
const TOK = Object.fromEntries(D.BONUS.map(t => [t.id, t]));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// mode : 'solo' | 'host' | 'client'
let mode = 'solo', G = null, V = null, P = null, ME = 0, nPlayers = 3, tab = 'solo';
let room = null, unsub = [], remote = {}, remoteSeats = new Set(), promptSeq = 0;

// ---------- écran de lancement ----------
try { const s = JSON.parse(localStorage.getItem('mk-setup') || '{}'); if (s.n) nPlayers = s.n; if (s.name) $('pname').value = s.name; $('xfest').checked = !!s.fest; $('xwild').checked = !!s.wild; } catch (e) {}
function drawSeg() {
  $('nseg').innerHTML = [2, 3, 4, 5].map(n => `<button type="button" aria-pressed="${n === nPlayers}" data-n="${n}">${n}</button>`).join('');
  $('tabs').innerHTML = ['solo', 'online'].map(t => `<button type="button" aria-pressed="${t === tab}" data-tab="${t}">${t === 'solo' ? 'Contre l’ordinateur' : 'En ligne'}</button>`).join('');
  $('soloBox').style.display = tab === 'solo' ? '' : 'none';
  $('onlineBox').style.display = tab === 'online' ? '' : 'none';
  $('nhint').textContent = tab === 'solo' ? 'Vous jouez contre des Minikins pilotés par l’ordinateur.' : 'Les places non prises par des amis seront jouées par l’ordinateur.';
  $('netoff').style.display = NET ? 'none' : '';
  $('create').disabled = !NET; $('join').disabled = !NET;
}
drawSeg();
$('nseg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { nPlayers = +b.dataset.n; drawSeg(); } });
$('tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { tab = b.dataset.tab; drawSeg(); } });
$('start').addEventListener('click', startSolo);
$('create').addEventListener('click', createRoom);
$('join').addEventListener('click', joinRoom);
$('newg').addEventListener('click', backToMenu);
$('lobbyLeave').addEventListener('click', backToMenu);
$('lobbyStart').addEventListener('click', hostStart);
const params = new URLSearchParams(location.search);
if (params.get('room')) { tab = 'online'; $('rcode').value = params.get('room').toUpperCase(); drawSeg(); }

function settings() {
  const name = ($('pname').value || 'Moi').trim().slice(0, 16);
  const fest = $('xfest').checked, wild = $('xwild').checked;
  try { localStorage.setItem('mk-setup', JSON.stringify({ n: nPlayers, name, fest, wild })); } catch (e) {}
  return { name, fest, wild, n: nPlayers };
}
function show(id) { for (const s of ['setup', 'lobby', 'game']) $(s).style.display = s === id ? (s === 'game' ? 'block' : 'grid') : 'none'; }
function backToMenu() { unsub.forEach(f => f()); unsub = []; G = null; V = null; P = null; room = null; remote = {}; remoteSeats = new Set(); mode = 'solo'; $('modal').innerHTML = ''; show('setup'); }

// ---------- solo ----------
const human = { choose(kind, d) { return new Promise(res => { P = { kind, d, res, sel: [] }; if (kind === 'bonus') bonusModal(); refresh(); }); } };
function answer(v) {
  const p = P; P = null; $('modal').innerHTML = '';
  if (mode === 'client') { NET.set(`rooms/${room}/answers/${ME}`, JSON.stringify({ id: p.id, v })); render(); return; }
  refresh(); p.res(v);
}
function startSolo() {
  const s = settings(); mode = 'solo'; ME = 0;
  const players = [{ name: s.name, human: true, color: COLORS[0], agent: human }];
  for (let i = 1; i < s.n; i++) players.push({ name: AI_NAMES[i - 1], color: COLORS[i] });
  runGame(players, s);
}
function runGame(players, s) {
  G = new Game({ players, festivals: s.fest, wild: s.wild, onEvent });
  show('game'); refresh();
  const g = G;
  G.run().then(() => { if (g !== G) return; refresh(); endModal(); }).catch(err => { if (g === G) { console.error(err); $('status').textContent = 'Erreur : ' + err.message; } });
}
async function onEvent(g, ev) {
  if (g !== G) throw new Error('partie abandonnée');
  refresh();
  const mine = ev.who === ME;
  const ms = mine ? 60 : ({ play: 650, take: 420, rank: 900, phase: 700, fest: 1100, gain: 260 })[ev.kind] || 200;
  await sleep(window.MK_FAST ? 0 : ms);
}
// l’hôte (ou le solo) recalcule sa vue et l’envoie aux joueurs distants
function refresh() {
  if (!G) return;
  V = G.view(ME); render();
  if (mode === 'host') publish();
}
let pubTimer = null;
function publish() {
  if (pubTimer) return;
  pubTimer = setTimeout(() => {
    pubTimer = null; if (!G || mode !== 'host') return;
    for (const p of G.players) if (remoteSeats.has(p.id)) NET.set(`rooms/${room}/views/${p.id}`, JSON.stringify(G.view(p.id)));
  }, 40);
}

// ---------- en ligne : salle ----------
const code5 = () => Array.from({ length: 5 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)]).join('');
let meta = null;
async function createRoom() {
  const s = settings();
  try { $('netmsg').textContent = 'Connexion…'; await NET.init(); } catch (e) { $('netmsg').textContent = 'Connexion impossible : ' + e.message; return; }
  mode = 'host'; ME = 0; room = code5();
  meta = { host: NET.uid, status: 'lobby', n: s.n, fest: s.fest, wild: s.wild, created: Date.now(),
    seats: Array.from({ length: s.n }, (_, i) => i === 0 ? { name: s.name, kind: 'host', uid: NET.uid } : { name: AI_NAMES[i - 1], kind: 'ai' }) };
  await NET.set(`rooms/${room}/meta`, JSON.stringify(meta));
  unsub.push(NET.on(`rooms/${room}/joins`, (joins) => {
    if (!joins || !meta || meta.status !== 'lobby') return;
    let changed = false;
    for (const [uid, raw] of Object.entries(joins)) {
      const name = String(raw).slice(0, 16);
      const seat = meta.seats.find(x => x.uid === uid);
      if (seat) { if (seat.name !== name) { seat.name = name; changed = true; } continue; }
      const free = meta.seats.find(x => x.kind === 'ai');
      if (free) { free.kind = 'remote'; free.uid = uid; free.name = name; changed = true; }
    }
    if (changed) NET.set(`rooms/${room}/meta`, JSON.stringify(meta));
    lobby();
  }));
  show('lobby'); lobby();
}
async function joinRoom() {
  const s = settings(); const code = ($('rcode').value || '').trim().toUpperCase();
  if (code.length < 4) { $('netmsg').textContent = 'Entrez le code de la salle.'; return; }
  try { $('netmsg').textContent = 'Connexion…'; await NET.init(); } catch (e) { $('netmsg').textContent = 'Connexion impossible : ' + e.message; return; }
  const m = await NET.get(`rooms/${code}/meta`);
  if (!m) { $('netmsg').textContent = 'Aucune salle avec ce code.'; return; }
  const mm = JSON.parse(m);
  if (mm.status !== 'lobby' && !mm.seats.some(x => x.uid === NET.uid)) { $('netmsg').textContent = 'Cette partie a déjà commencé.'; return; }
  mode = 'client'; room = code; $('netmsg').textContent = '';
  await NET.set(`rooms/${room}/joins/${NET.uid}`, s.name);
  let attached = false;
  unsub.push(NET.on(`rooms/${room}/meta`, (raw) => {
    if (!raw) return; meta = JSON.parse(raw);
    const seat = meta.seats.findIndex(x => x.uid === NET.uid);
    if (seat < 0) { lobby('La salle est complète.'); return; }
    ME = seat;
    if (meta.status === 'lobby') { show('lobby'); lobby(); return; }
    if (!attached) { attached = true; attachClient(); }
  }));
  show('lobby'); lobby('En attente de la réponse de l’hôte…');
}
function lobby(msg) {
  if (!meta) return;
  const isHost = mode === 'host';
  const link = location.href.split('?')[0] + '?room=' + room;
  $('lobbyBody').innerHTML = `
    <p class="ttl" style="font-size:15px;color:var(--soft)">Code de la salle</p>
    <div class="code">${room}</div>
    <p style="color:var(--soft);font-size:14px;overflow-wrap:anywhere">Lien à envoyer : <b>${esc(link)}</b></p>
    <p style="margin:10px 0 6px"><b>${meta.n} joueurs</b> · Festivals ${meta.fest ? 'oui' : 'non'} · Wild Friends ${meta.wild ? 'oui' : 'non'}</p>
    <ul class="seats">${meta.seats.map((x, i) => `<li><span class="dot" style="background:${COLORS[i]}"></span><b>${esc(x.name)}</b><span>${x.kind === 'host' ? 'hôte' : x.kind === 'remote' ? 'en ligne' : 'ordinateur'}${i === ME ? ' · vous' : ''}</span></li>`).join('')}</ul>
    <p style="color:var(--soft)">${msg ? esc(msg) : isHost ? 'Les places marquées « ordinateur » seront jouées par l’IA.' : 'En attente du lancement par l’hôte…'}</p>`;
  $('lobbyStart').style.display = isHost ? '' : 'none';
  $('lobbyCopy').onclick = () => { try { navigator.clipboard.writeText(link); $('lobbyCopy').textContent = 'Lien copié'; } catch (e) {} };
}
function remoteAgent(seat) {
  return { choose(kind, d) {
    const id = ++promptSeq;
    return new Promise(res => {
      remote[seat] = { id, res, kind, d };
      NET.set(`rooms/${room}/prompts/${seat}`, JSON.stringify({ id, kind, d }));
      refresh();
    });
  } };
}
function hostStart() {
  meta.status = 'playing'; NET.set(`rooms/${room}/meta`, JSON.stringify(meta));
  const players = meta.seats.map((x, i) => ({ name: x.name, color: COLORS[i], human: x.kind !== 'ai', agent: x.kind === 'host' ? human : x.kind === 'remote' ? remoteAgent(i) : AI }));
  meta.seats.forEach((x, i) => {
    if (x.kind !== 'remote') return;
    remote[i] = null; remoteSeats.add(i);
    unsub.push(NET.on(`rooms/${room}/answers/${i}`, (raw) => {
      if (!raw) return; const a = JSON.parse(raw); const w = remote[i];
      if (!w || w.id !== a.id) return;
      remote[i] = null; NET.set(`rooms/${room}/prompts/${i}`, null); w.res(a.v);
    }));
  });
  runGame(players, { fest: meta.fest, wild: meta.wild });
}
// l’hôte peut faire jouer l’IA à la place d’un joueur absent
function takeOver(seat) {
  const w = remote[seat]; if (!w || !G) return;
  const p = G.players[seat]; p.agent = AI; remote[seat] = null;
  NET.set(`rooms/${room}/prompts/${seat}`, null);
  G.emit(`${p.name} est remplacé par l’ordinateur.`, 'info');
  w.res(AI.choose(w.kind, w.d, G, p));
}
function attachClient() {
  show('game');
  unsub.push(NET.on(`rooms/${room}/views/${ME}`, (raw) => { if (!raw) return; V = JSON.parse(raw); if (P && P.kind === 'bonus' && !$('modal').innerHTML) bonusModal(); render(); if (V.final && !$('modal').innerHTML) endModal(); }));
  unsub.push(NET.on(`rooms/${room}/prompts/${ME}`, (raw) => {
    if (!raw) { if (P) { P = null; $('modal').innerHTML = ''; render(); } return; }
    const pr = JSON.parse(raw); if (P && P.id === pr.id) return;
    P = { id: pr.id, kind: pr.kind, d: pr.d, sel: [] };
    if (P.kind === 'bonus') bonusModal(); render();
  }));
}

// ---------- rendu (à partir de la vue V) ----------
const img = (id) => `img/${id}.jpg`;
function cardBox(id, o = {}) {
  const c = CARD[id];
  const cls = ['cardbox', o.size || '', o.click ? 'click' : '', o.sel ? 'sel' : '', o.done ? 'done' : ''].join(' ');
  const src = o.back || !c ? 'img/back.jpg' : img(id);
  const attrs = o.click ? ` tabindex="0" role="button" data-act="${o.act}" data-i="${o.i}"` : '';
  const zoom = o.back || !c ? '' : ` data-zoom="${src}"`;
  return `<div class="${cls}"${attrs}${zoom}><img src="${src}" alt="${o.back || !c ? 'carte cachée' : cardName(c)}">${o.extra || ''}</div>`;
}
function minis(sl) { const c = CARD[sl.id]; if (!c.spaces) return ''; let s = ''; for (let i = 0; i < c.spaces; i++) s += `<i class="${i < sl.m ? 'f' : ''}"></i>`; return `<span class="minis">${s}</span>`; }
const ICON = { H: 'heart', S: 'smile', G: 'bag', B: 'book' };
function tokHtml(id) {
  const t = TOK[id];
  const ic = t.sym ? ICON[t.sym] : t.vp ? 'laurel' : t.ck ? 'cockade' : t.wildColor ? 'ctri_wf' : 'minikin';
  return `<span class="tok"><img src="img/icons/${ic}.png" alt="">${t.label}</span>`;
}
const rowStart = (n) => ({ 5: 0.16, 4: 0.176, 3: 0.207, 2: 0.207 })[n];
const full = (sl) => CARD[sl.id].spaces && sl.m >= CARD[sl.id].spaces;

function render() {
  if (!V) return;
  const me = V.players[ME];
  const rd = V.round < 0 ? 'Mise en place' : V.round < 8 ? `Manche ${V.round + 1} / 8` : 'Nouvel An';
  const cur = V.current !== null ? V.players[V.current] : null;
  const who = cur ? (cur.id === ME ? 'À vous' : `${cur.name} réfléchit…`) : '';
  $('status').textContent = [rd, who, mode !== 'solo' ? `salle ${room}` : ''].filter(Boolean).join(' · ');
  // l’année
  let y = '';
  for (let i = 0; i < 9; i++) {
    const rc = V.rewardRow[i];
    let fest = '';
    if (V.festOn) { const fr = V.festRow[i]; const src = fr.shown ? `img/f${fr.n}.jpg` : `img/fb_${fr.season}.jpg`; fest = `<img class="fest" src="${src}" alt="${fr.shown ? esc(fr.name) : 'fête cachée'}"${fr.shown ? ` data-zoom="${src}"` : ''}>`; }
    let mk = '';
    if (i < 8) for (const p of V.players) for (const m of p.markers) if (m.round === i) mk += `<span class="mk" style="top:${(rowStart(V.n) + m.pos * 0.15) * 100}%;background:${p.color}" title="${esc(p.name)}"></span>`;
    const tile = i === 8 ? `<img class="tile" src="img/end_${V.n}.jpg" alt="tuile de fin de partie" data-zoom="img/end_${V.n}.jpg">` : '';
    y += `<div class="ycol ${i === V.round ? 'now' : ''}"><span class="n">${i < 8 ? i + 1 : 'Fin'}</span>${fest}<div class="rcard"><img src="img/${rc.img}.jpg" alt="carte Récompense" data-zoom="img/${rc.img}.jpg">${tile}${mk}</div></div>`;
  }
  $('year').innerHTML = y;
  // cartes jouées
  $('plays').innerHTML = V.plays.length ? V.plays.map(pl => {
    const p = V.players[pl.pid];
    const extra = `<span class="who" style="color:${p.color === '#f5c518' ? 'inherit' : p.color}">${esc(p.name)}</span>` + (pl.rank >= 0 ? `<span class="rk">${pl.rank + 1}</span>` : '') + (pl.rank >= 0 && pl.eff !== pl.value ? `<span class="ev">${pl.eff}</span>` : '');
    return cardBox(pl.card, { back: !pl.card, extra });
  }).join('') : '<p style="color:var(--soft)">Aucune carte jouée pour l’instant.</p>';
  $('bestc').textContent = V.round >= 0 ? `Meilleure couleur : ${V.best ? COLOR_FR[V.best] : 'aucune'}` : '';
  // offre
  const canTake = P && (P.kind === 'take' || (P.kind === 'swap' && P.sel.length === 1) || (P.kind === 'play' && P.d.early));
  $('display').innerHTML = V.display.length ? V.display.map((id, i) => cardBox(id, { click: canTake, act: 'display', i })).join('') : '<p style="color:var(--soft)">Vide</p>';
  $('deckc').textContent = `Pioche : ${V.deckCount} cartes · Jetons Bonus : ${V.bonusSupply.length}`;
  // moi
  $('mehead').innerHTML = `<span class="dot" style="background:${me.color}"></span> Votre ville <small>score actuel ${me.total} PV</small>`;
  $('mestats').innerHTML = statLine(me) + (me.tokens.length ? ' ' + me.tokens.map(tokHtml).join('') : '');
  const placeT = P && P.kind === 'placeMinikin' ? P.d.targets : null;
  const tort = P && P.kind === 'tortoise';
  $('mycity').innerHTML = me.city.length ? me.city.map((s, i) => {
    const sp = CARD[s.id].spaces;
    const click = (placeT && placeT.includes(i)) || (tort && (P.sel.length === 0 ? s.m > 0 : s.m < sp && i !== P.sel[0]));
    return cardBox(s.id, { click, act: 'city', i, extra: minis(s), done: full(s), sel: tort && P.sel[0] === i });
  }).join('') : '<p style="color:var(--soft)">Votre ville est encore vide.</p>';
  const handAct = P && ['keep', 'play', 'discard', 'pass', 'extraPlay', 'swap'].includes(P.kind);
  $('myhand').innerHTML = (me.hand || []).map((id, i) => cardBox(id, { size: 'lg', click: handAct && !(P.kind === 'swap' && P.sel.length), act: 'hand', i, sel: P && P.sel.includes(i) && P.kind !== 'tortoise' })).join('');
  // adversaires
  $('opps').innerHTML = V.players.filter(p => p.id !== ME).map(p => {
    const waiting = mode === 'host' && remote[p.id];
    return `<div class="zone opp"><h3><span class="dot" style="background:${p.color}"></span>${esc(p.name)} <small>${p.total} PV · ${p.handCount} cartes en main</small></h3>
      <div class="stats">${statLine(p)}</div>${p.tokens.length ? `<div class="tokens" style="margin-bottom:8px">${p.tokens.map(tokHtml).join('')}</div>` : ''}
      ${waiting ? `<p style="margin:0 0 8px;font-weight:700">En attente de ${esc(p.name)}… <button class="ghost" data-take="${p.id}" style="min-height:34px;padding:4px 10px">Faire jouer l’ordinateur</button></p>` : ''}
      <div class="row">${p.city.map(sl => cardBox(sl.id, { size: 'sm', extra: minis(sl), done: full(sl) })).join('') || '<span style="color:var(--soft)">Ville vide</span>'}</div></div>`;
  }).join('');
  // fête
  $('festzone').style.display = V.festOn ? '' : 'none';
  $('festnow').innerHTML = V.fest ? `<div class="festnow"><img src="img/f${V.fest.n}.jpg" alt="${esc(V.fest.name)}" data-zoom="img/f${V.fest.n}.jpg"><div><b class="ttl">${esc(V.fest.name)}</b><br>${esc(V.fest.fr)}</div></div>` : '<p style="color:var(--soft)">Révélée au début de chaque manche.</p>';
  $('log').innerHTML = V.log.slice().reverse().map(l => `<div class="${l.kind}">${esc(l.msg)}</div>`).join('');
  $('prompt').innerHTML = P ? promptHtml() : '';
}
function statLine(p) {
  const syms = ['B', 'S', 'G', 'H'].map(k => `<span><img class="ico" src="img/icons/${ICON[k]}.png" alt="${({ B: 'livres', S: 'sourires', G: 'bourses', H: 'cœurs' })[k]}"> ${p.syms[k]}</span>`).join('') + (p.wS ? `<span title="symbole au choix">+${p.wS} au choix</span>` : '');
  return syms + `<span><img class="ico" src="img/icons/laurel.png" alt=""> ${p.markerVp} PV de récompenses</span><span><img class="ico" src="img/icons/cockade.png" alt=""> ${p.nck} cocarde${p.nck > 1 ? 's' : ''}</span><span><img class="ico" src="img/icons/minikin.png" alt=""> ${p.pending} en attente</span>`;
}

function promptHtml() {
  const d = P.d;
  const q = (t, btns = '') => `<span class="q">${t}</span>${btns}`;
  switch (P.kind) {
    case 'keep': return q(`Gardez 4 cartes sur 6 : sélectionnez-en 4 (${P.sel.length}/4).`, `<button data-btn="ok" ${P.sel.length === 4 ? '' : 'disabled'}>Valider</button>`);
    case 'play': return q(d.hidden ? 'Lights-Out Party : choisissez votre carte, elle sera révélée avec les autres.' : d.early ? 'Jouez une carte de votre main, ou de l’offre (Early Worm Market : vous ne prendrez alors pas de nouvelle carte).' : 'À vous : jouez une carte de votre main.');
    case 'chipmunk': return q(`Chipmunk : modifier la valeur de ${cardName(CARD[d.card])} pour le classement ?`, `<button data-btn="2">+2</button><button data-btn="0" class="ghost">Aucun</button><button data-btn="-2" class="ghost">−2</button>`);
    case 'placeMinikin': return q(`Placez un Minikin sur un bâtiment surligné (encore ${d.left}).`, `<button data-btn="auto" class="ghost">Placer automatiquement</button>`);
    case 'bonus': return q('Choisissez un jeton Bonus.');
    case 'discard': return q(`${d.why ? d.why + ' : ' : ''}choisissez ${d.n} carte${d.n > 1 ? 's' : ''} à remettre sous la pioche (${P.sel.length}/${d.n}).`, `<button data-btn="ok" ${P.sel.length === d.n ? '' : 'disabled'}>Valider</button>`);
    case 'take': return q('Prenez une nouvelle carte dans l’offre.', d.deck ? `<button data-btn="deck" class="ghost">Piocher (Hedgehog)</button>` : '');
    case 'swap': return q(P.sel.length ? 'Cliquez maintenant sur la carte de l’offre à prendre en échange.' : 'Swap-a-Petal Fair : cliquez sur une carte de votre main à échanger avec l’offre, ou passez.', `<button data-btn="no" class="ghost">Ne pas échanger</button>`);
    case 'pass': return q('Great Gusty Day : choisissez la carte à passer à votre voisin de gauche.');
    case 'extraPlay': return q(`${d.why} : jouez une carte de votre main dans votre ville.`, d.optional ? `<button data-btn="no" class="ghost">Ne pas jouer</button>` : '');
    case 'tortoise': return q(P.sel.length ? 'Cliquez sur la carte où poser le Minikin.' : 'Tortoise : cliquez sur une carte d’où retirer un Minikin, ou passez.', `<button data-btn="no" class="ghost">Passer</button>`);
  }
  return '';
}

// ---------- clics ----------
document.addEventListener('click', e => {
  const tk = e.target.closest('[data-take]'); if (tk) { takeOver(+tk.dataset.take); return; }
  if (!P) return;
  const btn = e.target.closest('[data-btn]');
  if (btn) {
    const v = btn.dataset.btn;
    if (btn.dataset.tok !== undefined) return answer(+btn.dataset.tok);
    if (P.kind === 'keep' || P.kind === 'discard') { if (v === 'ok') answer(P.sel.slice()); return; }
    if (P.kind === 'chipmunk') return answer(+v);
    if (P.kind === 'placeMinikin' && v === 'auto') return answer('auto');
    if (P.kind === 'take' && v === 'deck') return answer('deck');
    if (v === 'no') return answer(P.kind === 'extraPlay' ? -1 : null);
    return;
  }
  const el = e.target.closest('.cardbox.click'); if (!el) return;
  act(el.dataset.act, +el.dataset.i);
});
document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.cardbox.click')) { e.preventDefault(); act(e.target.dataset.act, +e.target.dataset.i); } });
function act(where, i) {
  const k = P.kind;
  if (where === 'hand') {
    if (k === 'keep' || k === 'discard') { const lim = k === 'keep' ? 4 : P.d.n; const j = P.sel.indexOf(i); if (j >= 0) P.sel.splice(j, 1); else if (P.sel.length < lim) P.sel.push(i); render(); return; }
    if (k === 'play') return answer({ src: 'hand', i });
    if (k === 'pass' || k === 'extraPlay') return answer(i);
    if (k === 'swap') { P.sel = [i]; render(); return; }
  }
  if (where === 'display') {
    if (k === 'take') return answer(i);
    if (k === 'play') return answer({ src: 'display', i });
    if (k === 'swap' && P.sel.length) return answer({ h: P.sel[0], d: i });
  }
  if (where === 'city') {
    if (k === 'placeMinikin') return answer(i);
    if (k === 'tortoise') { if (!P.sel.length) { P.sel = [i]; render(); } else answer({ from: P.sel[0], to: i }); }
  }
}

// ---------- fenêtres ----------
function bonusModal() {
  if (!V) return;
  $('modal').innerHTML = `<div class="modal"><div class="box"><h2>Choisissez un jeton Bonus</h2><div class="tgrid">${V.bonusSupply.map((id, i) => `<button data-btn="tok" data-tok="${i}">${tokHtml(id).replace('class="tok"', 'class="tok" style="background:none;padding:0"')}</button>`).join('')}</div></div></div>`;
}
function endModal() {
  if (!V || !V.final) return;
  const rows = V.final.map((f, i) => `<tr class="${i === 0 ? 'win' : ''}"><td><span class="dot" style="background:${f.color}"></span> ${esc(f.name)}</td><td>${f.markers}</td><td>${f.tokens}</td><td>${f.cards}</td><td>${f.cockades} <small>(${f.nck})</small></td><td>${f.pending}</td><td><b>${f.total}</b></td></tr>`).join('');
  const meWon = V.final[0].id === ME;
  $('modal').innerHTML = `<div class="modal"><div class="box"><h2>${meWon ? 'Bravo, vous gagnez !' : `${esc(V.final[0].name)} gagne la partie`}</h2>
    <table class="sc"><tr><th>Joueur</th><th>Récompenses</th><th>Jetons</th><th>Bâtiments</th><th>Cocardes</th><th>Minikins libres</th><th>Total</th></tr>${rows}</table>
    <p style="color:var(--soft);font-size:14px">Égalité : le joueur avec le plus de Minikins non placés l’emporte.</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">${mode === 'solo' ? '<button id="again">Rejouer</button>' : '<button id="again">Retour au menu</button>'}<button class="ghost" id="close">Voir la table</button></div></div></div>`;
  $('again').onclick = () => { $('modal').innerHTML = ''; if (mode === 'solo') startSolo(); else backToMenu(); };
  $('close').onclick = () => { $('modal').innerHTML = ''; };
}
window.MKUI = { get G() { return G; }, get V() { return V; }, get P() { return P; }, get mode() { return mode; }, answer, startSolo };

// ---------- zoom ----------
const zoom = $('zoom');
document.addEventListener('mousemove', e => {
  const t = e.target.closest && e.target.closest('[data-zoom]');
  if (!t || matchMedia('(hover: none)').matches) { zoom.style.display = 'none'; return; }
  const src = t.dataset.zoom; const im = zoom.firstElementChild; if (!im.src.endsWith(src)) im.src = src;
  zoom.style.display = 'block';
  const w = 220, x = e.clientX + 24 + w > innerWidth ? e.clientX - w - 24 : e.clientX + 24;
  const y = Math.min(innerHeight - 360, Math.max(8, e.clientY - 160));
  zoom.style.left = x + 'px'; zoom.style.top = y + 'px';
});
}
