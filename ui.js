{
const { Game, AI, aiFor, cardName, COLOR_FR } = window.MK;
const D = window.MK_DATA;
const NET = window.MKNet;
const $ = (id) => document.getElementById(id);
const COLORS = ['#f5c518', '#e2483d', '#8a5cd6', '#2f9e8f', '#f08a34'];
const AI_NAMES = ['Pip', 'Tilly', 'Bram', 'Wren'];
const CARD = Object.fromEntries(D.CITY.concat(D.WILD).map(c => [c.id, c]));
const TOK = Object.fromEntries(D.BONUS.map(t => [t.id, t]));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// ---------- langues ----------
const I18N = window.MK_I18N;
let LANG = (() => { try { const l = localStorage.getItem('mk-lang'); if (l && I18N[l]) return l; } catch (e) {} const n = (navigator.language || 'fr').slice(0, 2); return I18N[n] ? n : 'en'; })();
const LD = () => I18N[LANG];
function t(k, a = {}) { let v = LD()[k]; if (v === undefined) v = I18N.fr[k]; if (v === undefined) return k; if (typeof v === 'function') return v(a); return String(v).replace(/\{(\w+)\}/g, (m, x) => a[x] ?? ''); }
function cardN(id) { const c = CARD[id]; if (!c) return '?'; if (c.name) return c.name; if (c.id === 'x21') return '21'; return `${LD().color[c.color]} ${c.value}`; }
function festText(n) { return LANG === 'fr' ? D.FESTIVALS[n - 1].fr : I18N.FEST[LANG][n - 1]; }
function whyT(w) { if (!w) return ''; if (Array.isArray(w)) return logT(w[0], w[1]); return String(w); }
function logT(k, a0) {
  const a = Object.assign({}, a0 || {});
  if (a.card) a.card = cardN(a.card);
  if ('color' in a) { const c = a.color; a.color = c ? LD().color[c] : null; a.colorPl = c ? LD().colorPl[c] : null; }
  if (a.tok) a.tok = LD().tok[a.tok];
  if (a.fest) a.fest = `${D.FESTIVALS[a.fest - 1].name} — ${festText(a.fest)}`;
  if (a.why) a.why = whyT(a.why);
  if (a.list) {
    if (k === 'reveal') a.list = a.list.map(([p, c]) => `${p} ${cardN(c)}`).join(', ');
    else if (k === 'ranking') a.list = a.list.map(([p, c, e], i) => `${i + 1}. ${p} (${cardN(c)}, ${e})`).join(' · ');
    else if (k === 'endRank') a.list = a.list.map(([p, n]) => `${p} ${n}`).join(', ');
  }
  const f = LD().log[k] || I18N.fr.log[k];
  return f ? f(a) : k;
}
function applyStatic() {
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll('.langs').forEach(el => { el.innerHTML = ['fr', 'en', 'it'].map(l => `<button type="button" data-lang="${l}" aria-pressed="${l === LANG}">${l.toUpperCase()}</button>`).join(''); });
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-lang]'); if (!b) return;
  const old = t('defaultName'); LANG = b.dataset.lang; try { localStorage.setItem('mk-lang', LANG); } catch (err) {}
  if ($('pname').value === old || ['Moi', 'Me', 'Io'].includes($('pname').value)) $('pname').value = t('defaultName');
  applyStatic(); drawSeg(); if ($('stats').style.display !== 'none') { drawStatCtl(); drawStats(); } if (meta && $('lobby').style.display !== 'none') lobby(); render(); if (P && P.kind === 'bonus') bonusModal(); if (V && V.final && $('modal').innerHTML) endModal();
});

// mode : 'solo' | 'host' | 'client'
let mode = 'solo', G = null, V = null, P = null, ME = 0, nPlayers = 3, tab = 'solo', LEVEL = 'normal';
let room = null, unsub = [], remote = {}, remoteSeats = new Set(), promptSeq = 0;

// ---------- écran de lancement ----------
try { const s = JSON.parse(localStorage.getItem('mk-setup') || '{}'); if (s.n) nPlayers = s.n; if (s.level) LEVEL = s.level; if (s.name) $('pname').value = s.name; $('xfest').checked = !!s.fest; $('xwild').checked = !!s.wild; } catch (e) {}
function drawSeg() {
  $('nseg').innerHTML = [2, 3, 4, 5].map(n => `<button type="button" aria-pressed="${n === nPlayers}" data-n="${n}">${n}</button>`).join('');
  $('tabs').innerHTML = ['solo', 'online'].map(tb => `<button type="button" aria-pressed="${tb === tab}" data-tab="${tb}">${tb === 'solo' ? t('tabSolo') : tb === 'online' ? t('tabOnline') : t('tabStats')}</button>`).join('');
  $('soloBox').style.display = tab === 'solo' ? '' : 'none';
  $('onlineBox').style.display = tab === 'online' ? '' : 'none';
  $('nhint').textContent = tab === 'solo' ? t('hintSolo') : t('hintOnline');
  const PW = ['green', 'pink', 'acorn'];
  $('lvseg').innerHTML = ['easy', 'normal', 'hard'].map((l, k) => `<button type="button" aria-pressed="${l === LEVEL}" data-lv="${l}"><span class="pw">${PW.slice(0, k + 1).map(c => `<img src="img/pawn_${c}.png" alt="">`).join('')}</span>${t({ easy: 'lvEasy', normal: 'lvNormal', hard: 'lvHard' }[l])}</button>`).join('');
  document.querySelector('.setupcard.home').dataset.mode = tab;
  const lvRow = $('lvseg').closest('.hrow'); lvRow.style.display = tab === 'stats' ? 'none' : ''; $('lvhint').style.display = lvRow.style.display;
  $('exthint').textContent = ($('xwild').checked ? t('wildDesc') + ' ' : '') + ($('xfest').checked ? t('festDesc') : '');
  drawRules();
  $('lvhint').textContent = LD().lvHint[LEVEL];
  $('netoff').style.display = NET ? 'none' : '';
  $('create').disabled = !NET; $('join').disabled = !NET;
}
applyStatic();
if (!$('pname').value) $('pname').value = t('defaultName');
drawSeg();
$('lvseg').addEventListener('click', e => { const b = e.target.closest('[data-lv]'); if (b) { LEVEL = b.dataset.lv; drawSeg(); } });
$('xwild').addEventListener('change', drawSeg); $('xfest').addEventListener('change', drawSeg);
function drawRules() {
  const L = LANG, f = { fr: 'FR', en: 'EN', it: 'IT' }[L];
  const fest = { FR: 'Minikin_City_Festivals_FR.pdf', EN: 'Minikin_City_Festivals_EN.pdf', IT: 'Minikin_City_Festivals_IT.pdf' }[f];
  const tag = (x) => x !== f ? ` <small>(${x})</small>` : '';
  const base = /github\.io$|localhost|127\.0\.0\.1/.test(location.hostname) ? 'rules/' : 'https://stfrantic82.github.io/MinikinCity/rules/';
  $('rulelinks').innerHTML = `<a href="${base}Minikin_City_Rules_EN.pdf" target="_blank" rel="noopener">${t('rulesBase')}${tag('EN')}</a> <a href="${base}Minikin_City_Wild_Friends_EN.pdf" target="_blank" rel="noopener">Wild Friends${tag('EN')}</a> <a href="${base}${fest}" target="_blank" rel="noopener">Festivals</a>`;
}
$('nseg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { nPlayers = +b.dataset.n; drawSeg(); } });
$('tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.tab === 'stats') { openStats(); return; } tab = b.dataset.tab; drawSeg(); });
$('start').addEventListener('click', startSolo);
$('create').addEventListener('click', createRoom);
$('join').addEventListener('click', joinRoom);
$('newg').addEventListener('click', backToMenu);
$('lobbyLeave').addEventListener('click', backToMenu);
$('lobbyStart').addEventListener('click', hostStart);
const params = new URLSearchParams(location.search);
if (params.get('room')) { tab = 'online'; $('rcode').value = params.get('room').toUpperCase(); drawSeg(); }

function settings() {
  const name = ($('pname').value || t('defaultName')).trim().slice(0, 16);
  const fest = $('xfest').checked, wild = $('xwild').checked;
  try { localStorage.setItem('mk-setup', JSON.stringify({ n: nPlayers, name, fest, wild, level: LEVEL })); } catch (e) {}
  return { name, fest, wild, n: nPlayers };
}
function show(id) { for (const s of ['setup', 'lobby', 'game', 'stats']) $(s).style.display = s === id ? (s === 'game' || s === 'stats' ? 'block' : 'grid') : 'none'; }
function backToMenu() { endTuto(); unsub.forEach(f => f()); unsub = []; G = null; V = null; P = null; room = null; remote = {}; remoteSeats = new Set(); mode = 'solo'; $('modal').innerHTML = ''; show('setup'); }

// ---------- solo ----------
const human = { choose(kind, d) { return new Promise(res => { P = { kind, d, res, sel: [] }; if (kind === 'bonus') bonusModal(); refresh(); tutoOn(kind); }); } };
function answer(v) {
  const p = P; P = null; $('modal').innerHTML = '';
  if (mode === 'client') { NET.set(`rooms/${room}/answers/${ME}`, JSON.stringify({ id: p.id, v })); render(); return; }
  refresh(); p.res(v);
}
function startSolo() {
  const s = settings(); mode = 'solo'; ME = 0;
  const players = [{ name: s.name, human: true, color: COLORS[0], agent: human }];
  for (let i = 1; i < s.n; i++) players.push({ name: AI_NAMES[i - 1], color: COLORS[i], agent: aiFor(LEVEL) });
  runGame(players, s);
}
function runGame(players, s) {
  G = new Game({ players, festivals: s.fest, wild: s.wild, onEvent, seed: s.seed });
  show('game'); refresh();
  const g = G;
  G.run().then(() => { if (g !== G) return; refresh(); endModal(); }).catch(err => { if (g === G) { console.error(err); $('status').textContent = 'Erreur : ' + err.message; } });
}
async function onEvent(g, ev) {
  if (g !== G) throw new Error('partie abandonnée');
  if (TUTO && ev.msg) { const k = ev.msg[0]; if (k === 'ranking') tutoOn('rank'); else if (k === 'endRank') tutoOn('endRank'); else if (k === 'over') tutoOn('over'); }
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
  try { $('netmsg').textContent = t('connecting'); await NET.init(); } catch (e) { $('netmsg').textContent = t('connFail', { e: e.message }); return; }
  mode = 'host'; ME = 0; room = code5();
  meta = { host: NET.pid, status: 'lobby', n: s.n, fest: s.fest, wild: s.wild, created: Date.now(),
    seats: Array.from({ length: s.n }, (_, i) => i === 0 ? { name: s.name, kind: 'host', uid: NET.pid } : { name: AI_NAMES[i - 1], kind: 'ai' }) };
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
  if (code.length < 4) { $('netmsg').textContent = t('enterCode'); return; }
  try { $('netmsg').textContent = t('connecting'); await NET.init(); } catch (e) { $('netmsg').textContent = t('connFail', { e: e.message }); return; }
  const m = await NET.get(`rooms/${code}/meta`);
  if (!m) { $('netmsg').textContent = t('noRoom'); return; }
  const mm = JSON.parse(m);
  if (mm.status !== 'lobby' && !mm.seats.some(x => x.uid === NET.pid)) { $('netmsg').textContent = t('started'); return; }
  mode = 'client'; room = code; $('netmsg').textContent = '';
  await NET.set(`rooms/${room}/joins/${NET.pid}`, s.name);
  let attached = false;
  unsub.push(NET.on(`rooms/${room}/meta`, (raw) => {
    if (!raw) return; meta = JSON.parse(raw);
    const seat = meta.seats.findIndex(x => x.uid === NET.pid);
    if (seat < 0) { lobby(t('full')); return; }
    ME = seat;
    if (meta.status === 'lobby') { show('lobby'); lobby(); return; }
    if (!attached) { attached = true; attachClient(); }
  }));
  show('lobby'); lobby(t('waitHost'));
}
function lobby(msg) {
  if (!meta) return;
  const isHost = mode === 'host';
  const link = location.href.split('?')[0] + '?room=' + room;
  $('lobbyBody').innerHTML = `
    <p class="ttl" style="font-size:15px;color:var(--soft)">${t('roomCode')}</p>
    <div class="code">${room}</div>
    <p style="color:var(--soft);font-size:14px;overflow-wrap:anywhere">${t('linkSend')} <b>${esc(link)}</b></p>
    <p style="margin:10px 0 6px"><b>${t('nPlayers', { n: meta.n })}</b> · Wild Friends ${meta.wild ? t('yes') : t('no')} · Festivals ${meta.fest ? t('yes') : t('no')}</p>
    <ul class="seats">${meta.seats.map((x, i) => `<li><span class="dot" style="background:${COLORS[i]}"></span><b>${esc(x.name)}</b><span>${x.kind === 'host' ? t('seatHost') : x.kind === 'remote' ? t('seatRemote') : t('seatAI')}${i === ME ? ' · ' + t('you') : ''}</span></li>`).join('')}</ul>
    <p style="color:var(--soft)">${msg ? esc(msg) : isHost ? t('lobbyHostHint') : t('lobbyWait')}</p>`;
  $('lobbyStart').style.display = isHost ? '' : 'none';
  $('lobbyCopy').onclick = () => { try { navigator.clipboard.writeText(link); $('lobbyCopy').textContent = t('copied'); } catch (e) {} };
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
  const players = meta.seats.map((x, i) => ({ name: x.name, color: COLORS[i], human: x.kind !== 'ai', agent: x.kind === 'host' ? human : x.kind === 'remote' ? remoteAgent(i) : aiFor(LEVEL) }));
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
  G.emit(['replaced', { p: p.name }], 'info');
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
  return `<div class="${cls}"${attrs}${zoom}><img src="${src}" alt="${o.back || !c ? t('hiddenCard') : cardN(id)}">${o.extra || ''}</div>`;
}
const PAWNS = ['pink', 'green', 'white', 'acorn'];
function minis(sl) { const c = CARD[sl.id]; if (!c.spaces) return ''; let s = ''; for (let i = 0; i < c.spaces; i++) s += i < sl.m ? `<img class="pw" src="img/pawn_${PAWNS[(i + c.value) % 4]}.png" alt="Minikin">` : '<span class="free"></span>'; return `<span class="minis">${s}</span>`; }
const ICON = { H: 'heart', S: 'smile', G: 'bag', B: 'book' };
function tokHtml(id) {
  const tk = TOK[id];
  const ic = tk.sym ? ICON[tk.sym] : tk.vp ? 'laurel' : tk.ck ? 'cockade' : tk.wildColor ? 'ctri_wf' : 'minikin';
  return `<span class="tok"><img src="img/icons/${ic}.png" alt="">${LD().tok[id]}</span>`;
}
const rowStart = (n) => ({ 5: 0.198, 4: 0.212, 3: 0.238, 2: 0.239 })[n];
const full = (sl) => CARD[sl.id].spaces && sl.m >= CARD[sl.id].spaces;

function render() {
  if (!V) return;
  const me = V.players[ME];
  const rd = V.round < 0 ? t('setupPhase') : V.round < 8 ? t('roundN', { n: V.round + 1 }) : t('newYear');
  const cur = V.current !== null ? V.players[V.current] : null;
  const who = cur ? (cur.id === ME ? t('yourTurn') : t('thinking', { p: cur.name })) : '';
  $('status').textContent = [rd, who, mode !== 'solo' ? t('room', { c: room }) : ''].filter(Boolean).join(' · ');
  // l’année
  let y = '';
  for (let i = 0; i < 9; i++) {
    const rc = V.rewardRow[i];
    let fest = '';
    if (V.festOn) { const fr = V.festRow[i]; const src = fr.shown ? `img/f${fr.n}.jpg` : `img/fb_${fr.season}.jpg`; fest = `<img class="fest" src="${src}" alt="${fr.shown ? esc(fr.name) : t('hiddenFest')}"${fr.shown ? ` data-zoom="${src}"` : ''}>`; }
    let mk = '';
    if (i < 8) for (const p of V.players) for (const m of p.markers) if (m.round === i) mk += `<span class="mk" style="top:${(rowStart(V.n) + m.pos * 0.1325) * 100}%;background:${p.color}" title="${esc(p.name)}"></span>`;
    const tile = i === 8 ? `<img class="tile" src="img/end_${V.n}.jpg" alt="${t('endTile')}" data-zoom="img/end_${V.n}.jpg">` : '';
    y += `<div class="ycol ${i === V.round ? 'now' : ''}"><span class="n">${i < 8 ? i + 1 : t('endCol')}</span>${fest}<div class="rcard"><img src="img/${rc.img}.jpg" alt="${t('rewardCard')}" data-zoom="img/${rc.img}.jpg">${tile}${mk}</div></div>`;
  }
  $('year').innerHTML = y;
  // cartes jouées
  $('plays').innerHTML = V.plays.length ? V.plays.map(pl => {
    const p = V.players[pl.pid];
    const extra = `<span class="who" style="color:${p.color === '#f5c518' ? 'inherit' : p.color}">${esc(p.name)}</span>` + (pl.rank >= 0 ? `<span class="rk">${pl.rank + 1}</span>` : '') + (pl.rank >= 0 && pl.eff !== pl.value ? `<span class="ev">${pl.eff}</span>` : '');
    return cardBox(pl.card, { back: !pl.card, extra });
  }).join('') : `<p style="color:var(--soft)">${t('noPlays')}</p>`;
  $('bestc').textContent = V.round >= 0 ? t('best', { c: V.best ? LD().color[V.best] : t('none') }) : '';
  // offre
  const canTake = P && (P.kind === 'take' || (P.kind === 'swap' && P.sel.length === 1) || (P.kind === 'play' && P.d.early));
  $('display').innerHTML = V.display.length ? V.display.map((id, i) => cardBox(id, { click: canTake, act: 'display', i })).join('') : `<p style="color:var(--soft)">${t('empty')}</p>`;
  $('deckc').textContent = t('deckInfo', { n: V.deckCount, b: V.bonusSupply.length });
  // moi
  $('mehead').innerHTML = `<span class="dot" style="background:${me.color}"></span> ${t('yourCity')} <small>${t('scoreNow', { n: me.total })}</small>`;
  $('mestats').innerHTML = statLine(me) + (me.tokens.length ? ' ' + me.tokens.map(tokHtml).join('') : '');
  const placeT = P && P.kind === 'placeMinikin' ? P.d.targets : null;
  const tort = P && P.kind === 'tortoise';
  $('mycity').innerHTML = me.city.length ? me.city.map((s, i) => {
    const sp = CARD[s.id].spaces;
    const click = (placeT && placeT.includes(i)) || (tort && (P.sel.length === 0 ? s.m > 0 : s.m < sp && i !== P.sel[0]));
    return cardBox(s.id, { click, act: 'city', i, extra: minis(s), done: full(s), sel: tort && P.sel[0] === i });
  }).join('') : `<p style="color:var(--soft)">${t('emptyCity')}</p>`;
  const handAct = P && ['keep', 'play', 'discard', 'pass', 'extraPlay', 'swap'].includes(P.kind);
  $('myhand').innerHTML = (me.hand || []).map((id, i) => cardBox(id, { size: 'lg', click: handAct && !(P.kind === 'swap' && P.sel.length), act: 'hand', i, sel: P && P.sel.includes(i) && P.kind !== 'tortoise' })).join('');
  // adversaires
  $('opps').innerHTML = V.players.filter(p => p.id !== ME).map(p => {
    const waiting = mode === 'host' && remote[p.id];
    return `<div class="zone opp"><h3><span class="dot" style="background:${p.color}"></span>${esc(p.name)} <small>${t('oppSmall', { n: p.total, h: p.handCount })}</small></h3>
      <div class="stats">${statLine(p)}</div>${p.tokens.length ? `<div class="tokens" style="margin-bottom:8px">${p.tokens.map(tokHtml).join('')}</div>` : ''}
      ${waiting ? `<p style="margin:0 0 8px;font-weight:700">${esc(t('waitingFor', { p: p.name }))} <button class="ghost" data-take="${p.id}" style="min-height:34px;padding:4px 10px">${t('aiPlay')}</button></p>` : ''}
      <div class="row">${p.city.map(sl => cardBox(sl.id, { size: 'sm', extra: minis(sl), done: full(sl) })).join('') || `<span style="color:var(--soft)">${t('emptyCityOpp')}</span>`}</div></div>`;
  }).join('');
  // fête
  $('festzone').style.display = V.festOn ? '' : 'none';
  $('festnow').innerHTML = V.fest ? `<div class="festnow"><img src="img/f${V.fest.n}.jpg" alt="${esc(V.fest.name)}" data-zoom="img/f${V.fest.n}.jpg"><div><b class="ttl">${esc(V.fest.name)}</b><br>${esc(festText(V.fest.n))}</div></div>` : `<p style="color:var(--soft)">${t('festReveal')}</p>`;
  $('log').innerHTML = V.log.slice().reverse().map(l => `<div class="${l.kind}">${esc(logT(l.k, l.a))}</div>`).join('');
  $('prompt').innerHTML = P ? promptHtml() : '';
}
function statLine(p) {
  const syms = ['B', 'S', 'G', 'H'].map(k => `<span><img class="ico" src="img/icons/${ICON[k]}.png" alt="${t('sym' + k)}"> ${p.syms[k]}</span>`).join('') + (p.wS ? `<span>${t('statWild', { n: p.wS })}</span>` : '');
  return syms + `<span><img class="ico" src="img/icons/laurel.png" alt=""> ${t('statVp', { n: p.markerVp })}</span><span><img class="ico" src="img/icons/cockade.png" alt=""> ${t('statCk', { n: p.nck })}</span><span><img class="ico" src="img/pawn_green.png" alt=""> ${t('statPend', { n: p.pending })}</span>`;
}

function promptHtml() {
  const d = P.d;
  const q = (txt, btns = '') => `<span class="q">${esc(txt)}</span>${btns}`;
  const B = (v, k, ghost) => `<button data-btn="${v}"${ghost ? ' class="ghost"' : ''}>${t(k)}</button>`;
  switch (P.kind) {
    case 'keep': return q(t('pKeep', { n: P.sel.length }), `<button data-btn="ok" ${P.sel.length === 4 ? '' : 'disabled'}>${t('validate')}</button>`);
    case 'play': return q(d.hidden ? t('pPlayHidden') : d.early ? t('pPlayEarly') : t('pPlay'));
    case 'chipmunk': return q(t('pChip', { card: cardN(d.card) }), `<button data-btn="2">+2</button><button data-btn="0" class="ghost">${t('noneBtn')}</button><button data-btn="-2" class="ghost">−2</button>`);
    case 'placeMinikin': return q(t('pPlace', { n: d.left }), B('auto', 'autoBtn', 1));
    case 'bonus': return q(t('pBonus'));
    case 'discard': return q(t('pDiscard', { why: whyT(d.why), n: d.n, s: P.sel.length }), `<button data-btn="ok" ${P.sel.length === d.n ? '' : 'disabled'}>${t('validate')}</button>`);
    case 'take': return q(t('pTake'), d.deck ? B('deck', 'deckBtn', 1) : '');
    case 'swap': return q(P.sel.length ? t('pSwap1') : t('pSwap0'), B('no', 'noSwap', 1));
    case 'pass': return q(t('pPass'));
    case 'extraPlay': return q(t('pExtra', { why: whyT(d.why) }), d.optional ? B('no', 'noPlay', 1) : '');
    case 'tortoise': return q(P.sel.length ? t('pTort1') : t('pTort0'), B('no', 'skip', 1));
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
  $('modal').innerHTML = `<div class="modal"><div class="box"><h2>${t('chooseTok')}</h2><div class="tgrid">${V.bonusSupply.map((id, i) => `<button data-btn="tok" data-tok="${i}">${tokHtml(id).replace('class="tok"', 'class="tok" style="background:none;padding:0"')}</button>`).join('')}</div></div></div>`;
}
function endModal() {
  if (!V || !V.final) return;
  const rows = V.final.map((f, i) => `<tr class="${i === 0 ? 'win' : ''}"><td><span class="dot" style="background:${f.color}"></span> ${esc(f.name)}</td><td>${f.markers}</td><td>${f.tokens}</td><td>${f.cards}</td><td>${f.cockades} <small>(${f.nck})</small></td><td>${f.pending}</td><td><b>${f.total}</b></td></tr>`).join('');
  const meWon = V.final[0].id === ME;
  $('modal').innerHTML = `<div class="modal"><div class="box"><h2>${meWon ? t('youWin') : esc(t('wins', { p: V.final[0].name }))}</h2>
    <table class="sc"><tr><th>${t('thPlayer')}</th><th>${t('thRewards')}</th><th>${t('thTokens')}</th><th>${t('thBuild')}</th><th>${t('thCk')}</th><th>${t('thFree')}</th><th>${t('thTotal')}</th></tr>${rows}</table>
    <p style="color:var(--soft);font-size:14px">${t('tieNote')}</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button id="again">${mode === 'solo' ? t('again') : t('backMenu')}</button><button class="ghost" id="close">${t('seeTable')}</button></div></div></div>`;
  $('again').onclick = () => { $('modal').innerHTML = ''; if (mode === 'solo') startSolo(); else backToMenu(); };
  $('close').onclick = () => { $('modal').innerHTML = ''; };
}

// ---------- statistiques (simulations entre IA) ----------
let FSORT = 'avg', SN = 3, SG = 500, SRES = null, SSORT = 'edge', SFILT = 'all', worker = null;
// cumul des simulations par configuration (3 000 parties max, les plus anciennes sont retirées)
const SMAX = 3000;
const cfgKey = () => `${SN}-${$('swild').checked ? 1 : 0}-${$('sfest').checked ? 1 : 0}`;
function loadBatches() { try { return JSON.parse(localStorage.getItem('mk-stats') || '{}'); } catch (e) { return {}; } }
function saveBatches(all) { try { localStorage.setItem('mk-stats', JSON.stringify(all)); } catch (e) {} }
function addBatch(d) {
  const all = loadBatches(), k = cfgKey(); const list = all[k] || [];
  list.push({ card: d.card, fest: d.fest, tok: d.tok, avg: d.avg, games: d.games - d.errors, n: d.n });
  let tot = list.reduce((a, b) => a + b.games, 0);
  while (tot > SMAX && list.length) {
    const b = list[0], excess = tot - SMAX;
    if (b.games <= excess) { tot -= b.games; list.shift(); continue; }
    const f = (b.games - excess) / b.games; // on ne garde qu’une partie du plus ancien lot
    for (const key of ['card', 'fest', 'tok']) for (const s of Object.values(b[key] || {})) for (const k in s) s[k] *= f;
    b.games -= excess; tot = SMAX;
  }
  all[k] = list; saveBatches(all); SRES = merge(list);
}
function merge(list) {
  if (!list || !list.length) return null;
  const sum = (key) => { const o = {}; for (const b of list) for (const [id, s] of Object.entries(b[key] || {})) { const t = o[id] = o[id] || {}; for (const f in s) t[f] = (t[f] || 0) + s[f]; } return o; };
  const games = list.reduce((a, b) => a + b.games, 0), avg = {};
  for (const f of Object.keys(list[0].avg)) avg[f] = list.reduce((a, b) => a + b.avg[f] * b.games, 0) / games;
  return { card: sum('card'), fest: sum('fest'), tok: sum('tok'), avg, games, errors: 0, n: list[0].n };
}
function refreshCum() { SRES = merge(loadBatches()[cfgKey()]); drawStats(); }
function openStats() { $('swild').checked = $('xwild').checked; $('sfest').checked = $('xfest').checked; SN = nPlayers; show('stats'); drawStatCtl(); refreshCum(); }
function drawStatCtl() {
  $('snseg').innerHTML = [2, 3, 4, 5].map(n => `<button type="button" aria-pressed="${n === SN}" data-sn="${n}">${n}</button>`).join('');
  $('sgseg').innerHTML = [100, 500, 1000, 3000].map(n => `<button type="button" aria-pressed="${n === SG}" data-sg="${n}">${n}</button>`).join('');
}
$('snseg').addEventListener('click', e => { const b = e.target.closest('[data-sn]'); if (b) { SN = +b.dataset.sn; drawStatCtl(); refreshCum(); } });
$('sgseg').addEventListener('click', e => { const b = e.target.closest('[data-sg]'); if (b) { SG = +b.dataset.sg; drawStatCtl(); } });
$('swild').addEventListener('change', refreshCum); $('sfest').addEventListener('change', refreshCum);
$('sclear').addEventListener('click', () => { const all = loadBatches(); delete all[cfgKey()]; saveBatches(all); refreshCum(); });
$('statsBack').addEventListener('click', () => { if (worker) { worker.terminate(); worker = null; } show('setup'); });
$('srun').addEventListener('click', () => {
  if (worker) worker.terminate();
  try { worker = new Worker('sim-worker.js?v=9'); } catch (e) { $('sprog').textContent = e.message; return; }
  $('srun').disabled = true; $('sbar').firstElementChild.style.width = '0'; $('sprog').textContent = t('running', { p: 0 });
  worker.onmessage = (e) => {
    const d = e.data;
    if (d.progress !== undefined) { $('sbar').firstElementChild.style.width = (d.progress * 100) + '%'; $('sprog').textContent = t('running', { p: Math.round(d.progress * 100) }); }
    if (d.done) { addBatch(d); worker.terminate(); worker = null; $('srun').disabled = false; $('sprog').textContent = ''; drawStats(); }
  };
  worker.onerror = (e) => { $('sprog').textContent = 'Erreur : ' + e.message; $('srun').disabled = false; };
  worker.postMessage({ n: SN, games: SG, fest: $('sfest').checked, wild: $('swild').checked });
});
document.addEventListener('click', e => {
  const fth = e.target.closest('[data-fsort]'); if (fth) { FSORT = fth.dataset.fsort; drawStats(); return; }
  const th = e.target.closest('[data-sort]'); if (th) { SSORT = th.dataset.sort; drawStats(); return; }
  const f = e.target.closest('[data-filt]'); if (f) { SFILT = f.dataset.filt; drawStats(); }
});
const pct = (x) => (x * 100).toFixed(0) + ' %';
function drawStats() {
  const box = $('sres');
  if (!SRES) { box.innerHTML = `<p style="color:var(--soft);margin-top:16px">${t('none')}</p>`; return; }
  const r = SRES, n = r.n, base = 1 / n, minG = Math.max(8, r.games * n * 0.02);
  const rows = Object.entries(r.card).filter(([id, s]) => s.games >= 0.5).map(([id, s]) => ({ id, c: CARD[id], games: Math.round(s.games), win: s.wins / s.games, edge: (s.wins / s.games) / base - 1, owner: s.total / s.games, vp: s.vp / s.games, act: s.scoringGames ? s.active / s.scoringGames : null }))
    .filter(x => x.c && (SFILT === 'all' || (SFILT === 'pets' ? x.c.pet : !x.c.pet && x.c.color === SFILT)));
  const key = { edge: x => x.edge, games: x => x.games, win: x => x.win, owner: x => x.owner, vp: x => x.vp, act: x => x.act ?? -1, name: x => -(x.c.value) }[SSORT] || (x => x.edge);
  rows.sort((a, b) => key(b) - key(a));
  const edgeCell = (e) => `<span class="edge ${e >= 0 ? 'pos' : 'neg'}">${e >= 0 ? '+' : ''}${Math.round(e * 100)} %</span>`;
  const th = (k, label) => `<th data-sort="${k}">${label}${SSORT === k ? ' ▾' : ''}</th>`;
  const filt = ['all', 'pink', 'green', 'blue'].concat(r.card.wp4 || r.card.wb1 ? ['pets'] : []).map(f => `<button type="button" data-filt="${f}" aria-pressed="${f === SFILT}">${f === 'all' ? t('fAll') : f === 'pets' ? t('fPets') : LD().color[f]}</button>`).join('');
  const festRows = Object.entries(r.fest || {}).map(([k, s]) => ({ f: D.FESTIVALS[k - 1], avg: s.total / s.games, spread: s.vp / s.games, games: Math.round(s.games) })).sort((a, b) => FSORT === 'name' ? a.f.n - b.f.n : b[FSORT] - a[FSORT]);
  const fth = (k, label) => `<th data-fsort="${k}">${label}${FSORT === k ? ' ▾' : ''}</th>`;
  const tokRows = Object.entries(r.tok || {}).map(([id, s]) => ({ id, games: Math.round(s.games), edge: (s.wins / s.games) / base - 1, owner: s.total / s.games })).sort((a, b) => b.edge - a.edge);
  box.innerHTML = `
    <div class="kpis"><div class="kpi"><b>${Math.round(r.games - r.errors)}</b><span>${t('sGames')} · ${t('cum', { m: SMAX.toLocaleString(LANG) })}</span></div><div class="kpi"><b>${r.avg.win.toFixed(1)}</b><span>${t('avgWin')}</span></div><div class="kpi"><b>${r.avg.all.toFixed(1)}</b><span>${t('avgAll')}</span></div></div>
    <p style="margin:0 0 4px">${t('split', { a: r.avg.markers.toFixed(1), b: r.avg.tokens.toFixed(1), c: r.avg.cards.toFixed(1), d: r.avg.ck.toFixed(1) })}</p>
    <p style="margin:0 0 10px;color:var(--soft)">${t('baseline', { n, p: Math.round(base * 100) })} ${t('note')}</p>
    <div class="zone"><div class="filters">${filt}</div><div class="scroll"><table class="stab">
      <tr>${th('name', t('cCard'))}${th('edge', t('cEdge'))}${th('win', t('cWin'))}${th('games', t('cPlayed'))}${th('owner', t('cOwner'))}${th('vp', t('cVp'))}${th('act', t('cAct'))}</tr>
      ${rows.map(x => `<tr class="${x.games < minG ? 'low' : ''}" title="${x.games < minG ? t('low') : ''}"><td><span class="cn"><img src="img/${x.id}.jpg" alt="" data-zoom="img/${x.id}.jpg">${esc(cardN(x.id))}</span></td><td>${edgeCell(x.edge)}</td><td>${pct(x.win)}</td><td>${x.games}</td><td>${x.owner.toFixed(1)}</td><td>${x.vp.toFixed(1)}</td><td>${x.act === null ? '—' : pct(x.act)}</td></tr>`).join('')}
    </table></div></div>
    ${festRows.length ? `<div class="zone" style="margin-top:14px"><h3>${t('festT')}</h3><div class="scroll"><table class="stab"><tr>${fth('name', t('festT'))}${fth('avg', t('festAvg'))}${fth('spread', t('festSpread'))}${fth('games', t('sGames'))}</tr>
      ${festRows.map(x => `<tr><td><span class="cn"><img src="img/f${x.f.n}.jpg" alt="" data-zoom="img/f${x.f.n}.jpg" style="width:40px">${esc(x.f.name)}</span></td><td>${x.avg.toFixed(1)}</td><td>${x.spread.toFixed(1)}</td><td>${x.games}</td></tr>`).join('')}</table></div></div>` : ''}
    <div class="zone" style="margin-top:14px"><h3>${t('tokT')}</h3><div class="scroll"><table class="stab"><tr><th>${t('tokT')}</th><th>${t('cEdge')}</th><th>${t('cPlayed')}</th><th>${t('cOwner')}</th></tr>
      ${tokRows.map(x => `<tr><td>${tokHtml(x.id)}</td><td>${edgeCell(x.edge)}</td><td>${x.games}</td><td>${x.owner.toFixed(1)}</td></tr>`).join('')}</table></div></div>`;
}


// ---------- tutoriel ----------
let TUTO = null;
const TT = () => I18N.TUTO[LANG] || I18N.TUTO.fr;
function startTutorial() {
  const name = ($('pname').value || t('defaultName')).trim().slice(0, 16);
  mode = 'solo'; ME = 0; TUTO = { seen: new Set(), queue: [] };
  runGame([{ name, human: true, color: COLORS[0], agent: human }, { name: AI_NAMES[0], color: COLORS[1], agent: aiFor('easy') }], { fest: false, wild: false, seed: 2026 });
  TUTO.queue.push(...TT().intro.map((x, i) => ({ intro: i }))); coachNext();
}
function tutoOn(kind) {
  if (!TUTO || TUTO.seen.has(kind) || !TT()[kind]) return;
  TUTO.seen.add(kind); TUTO.queue.push({ kind }); if (!TUTO.cur) coachNext();
}
function coachNext() {
  document.querySelectorAll('.hl').forEach(e => e.classList.remove('hl'));
  if (!TUTO) return;
  const step = TUTO.queue.shift(); TUTO.cur = step || null;
  const box = $('coach');
  if (!step) { box.innerHTML = ''; return; }
  const [title, text, sel] = step.intro !== undefined ? TT().intro[step.intro] : TT()[step.kind];
  if (sel) setTimeout(() => { const el = document.querySelector(sel); if (el) { el.classList.add('hl'); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } }, 50);
  const more = TUTO.queue.length > 0;
  box.innerHTML = `<div class="coach" role="dialog"><b>${title}</b>${text}<div class="cbtn"><button class="ghost" id="cstop">${TT().stop}</button><button id="cnext">${more ? TT().next : TT().close}</button></div></div>`;
  $('cnext').onclick = coachNext; $('cstop').onclick = endTuto;
}
function endTuto() { TUTO = null; document.querySelectorAll('.hl').forEach(e => e.classList.remove('hl')); const b = $('coach'); if (b) b.innerHTML = ''; }
$('tuto').addEventListener('click', startTutorial);
$('statsBtn').addEventListener('click', openStats);

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
