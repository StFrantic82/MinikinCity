// Minikin City — moteur de jeu (fonctionne dans le navigateur et sous Node pour les tests)
(function (root) {
const D = root.MK_DATA;
const SYMS = ['B', 'H', 'S', 'G'];
const COLS = ['pink', 'green', 'blue'];
const CK_BASE = [0, 1, 3, 6, 10, 15, 21];
const CK_DRAGON = [0, 1, 2, 7, 12, 18, 25, 30];
const COLOR_FR = { pink: 'rose', green: 'vert', blue: 'bleu' };

function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(arr, r) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
// toutes les façons de répartir n jokers entre k cases
function distrib(n, k) { if (k === 1) return [[n]]; const out = []; for (let i = 0; i <= n; i++) for (const rest of distrib(n - i, k - 1)) out.push([i, ...rest]); return out; }
const cardName = (c) => c.name || (c.id === 'x21' ? '21' : `${COLOR_FR[c.color] || ''} ${c.value}`.trim());

class Game {
  constructor(opts) {
    this.opts = opts;
    this.r = rng(opts.seed ?? Math.floor(Math.random() * 1e9));
    this.n = opts.players.length;
    this.festOn = !!opts.festivals; this.wildOn = !!opts.wild;
    this.onEvent = opts.onEvent || (async () => {});
    this.log = []; this.prompt = null; this.phase = 'setup'; this.round = -1;
    this.players = opts.players.map((p, i) => ({
      id: i, name: p.name, human: !!p.human, color: p.color, agent: p.agent || AI,
      hand: [], city: [], pending: 0, tokens: [], markerVp: 0, markerCk: 0, markers: [], skipTake: false,
    }));
    let cards = D.CITY.slice();
    if (this.wildOn) cards = cards.concat(D.WILD);
    this.deck = shuffle(cards.map(c => Object.assign({}, c)), this.r);
    // cartes Récompense
    let rew = D.REWARD_IDS.map((id, i) => ({ id, color: { p: 'pink', g: 'green', b: 'blue' }[id[0]], rows: D.REWARDS[this.n][i], img: `r${id}_${this.n}` }));
    if (this.wildOn) {
      rew.push({ id: 'grey', color: null, rows: D.GREY_REWARDS[this.n], img: this.n <= 3 ? 'rgrey3' : 'rgrey4' });
      shuffle(rew, this.r); rew.pop();
    } else shuffle(rew, this.r);
    this.rewardRow = rew; // 0..7 manches, 8 sous la tuile
    this.endTile = D.ENDGAME[this.n];
    this.bonusSupply = D.BONUS.slice();
    this.festRow = null;
    if (this.festOn) {
      const by = s => shuffle(D.FESTIVALS.filter(f => f.season === s), this.r);
      const sp = by('spring'), su = by('summer'), au = by('autumn'), wi = by('winter'), ny = by('newyear');
      this.festRow = [sp[0], sp[1], su[0], su[1], au[0], au[1], wi[0], wi[1], ny[0]];
    }
    this.revealed = new Set();
    this.display = []; this.plays = []; this.first = 0; this.best = null; this.ranking = [];
  }

  // ---------- utilitaires ----------
  async emit(msg, kind = 'info', who = null) { this.log.push({ k: msg[0], a: msg[1], kind, who, round: this.round }); await this.onEvent(this, { msg, kind, who }); }
  async ask(p, kind, data) { return p.agent.choose(kind, data, this, p); }
  draw() { return this.deck.length ? this.deck.pop() : null; }
  toBottom(c) { this.deck.unshift(c); }
  fest(nOrNull) { if (!this.festOn || this.round < 0) return null; const f = this.festRow[Math.min(this.round, 8)]; return nOrNull ? (f && f.n === nOrNull) : f; }
  has(p, pet) { return p.city.some(s => s.c.pet === pet); }
  turnOrder() { const o = []; for (let i = 0; i < this.n; i++) o.push(this.players[(this.first + i) % this.n]); return o; }
  roundsLeft() { return Math.max(0, 8 - this.round); }

  // ---------- comptages ----------
  base(p) {
    const s = { B: 0, H: 0, S: 0, G: 0 }, col = { pink: 0, green: 0, blue: 0 };
    let wS = 0, wC = 0, inst = 0, onCards = 0;
    for (const slot of p.city) {
      const c = slot.c; onCards += slot.m;
      for (const x of c.sym) { if (x === 'W') wS++; else s[x]++; }
      if (c.color) col[c.color]++;
      if (c.pet === 'bluejay') { col.green++; col.blue++; }
      if (c.type === 'I') inst++;
    }
    for (const t of p.tokens) { if (t.sym) s[t.sym]++; if (t.wildColor) wC++; }
    const vals = p.city.map(x => x.c.value);
    return { s, col, wS, wC, inst, tok: p.tokens.length, vals, minis: onCards + p.pending, unused: p.pending };
  }
  ctxs(p) { // tous les contextes possibles selon les jokers
    const b = this.base(p), out = [];
    for (const ds of distrib(b.wS, 4)) for (const dc of distrib(b.wC, 3)) {
      const s = {}; SYMS.forEach((k, i) => s[k] = b.s[k] + ds[i]);
      const col = {}; COLS.forEach((k, i) => col[k] = b.col[k] + dc[i]);
      out.push({ s, col, inst: b.inst, tok: b.tok, vals: b.vals, minis: b.minis, unused: b.unused, ck: 0, assign: { ds, dc } });
    }
    return out;
  }
  count(key, x) {
    const inR = (a, b) => x.vals.filter(v => v >= a && v <= b).length;
    switch (key) {
      case 'B': case 'H': case 'S': case 'G': return x.s[key];
      case 'pink': case 'green': case 'blue': return x.col[key];
      case 'set': return Math.min(...SYMS.map(k => x.s[k]));
      case 'cset': return Math.min(...COLS.map(k => x.col[k]));
      case 'instant': return x.inst;
      case 'ck': return x.ck;
      case 'bonusTok': return x.tok;
      case 'diff': return SYMS.filter(k => x.s[k] > 0).length;
      case 'v1_5': return inR(1, 5); case 'v6_10': return inR(6, 10); case 'v11_15': return inR(11, 15); case 'v16_20': return inR(16, 20);
      case 'm3': return Math.floor(x.minis / 3);
      case 'unused': return x.unused;
    }
    return 0;
  }
  evalEff(eff, x) {
    if (!eff) return {};
    const mul = (g, n) => { const o = {}; for (const k in g) o[k] = g[k] * n; return o; };
    if (eff.k === 'flat') return Object.assign({}, eff.gain);
    if (eff.k === 'if') { for (const k in eff.need) if (this.count(k, x) < eff.need[k]) return {}; return Object.assign({}, eff.gain); }
    if (eff.k === 'per') return mul(eff.gain, this.count(eff.per, x));
    return {};
  }
  active(slot) { return slot.c.type === 'S' && slot.m >= slot.c.spaces; }

  score(p) {
    let best = null;
    for (const x of this.ctxs(p)) {
      let ck = p.markerCk + p.tokens.filter(t => t.ck).length;
      for (const sl of p.city) if (this.active(sl) && sl.c.eff) { const g = this.evalEff(sl.c.eff, Object.assign({}, x, { ck: 0 })); if (g.ck) ck += g.ck; }
      x.ck = ck;
      const effs = [];
      for (const sl of p.city) if (this.active(sl) && sl.c.eff) { const g = this.evalEff(sl.c.eff, x); if (g.vp) effs.push({ id: sl.c.id, vp: g.vp }); }
      let vpCards = effs.reduce((a, e) => a + e.vp, 0);
      let firefly = 0;
      if (p.city.some(s => s.c.pet === 'firefly') && effs.length) firefly = Math.max(...effs.map(e => e.vp));
      const nck = ck;
      let ckVp = CK_BASE[Math.min(nck, 6)];
      if (p.city.some(s => s.c.pet === 'dragonfly')) ckVp = Math.max(ckVp, CK_DRAGON[Math.min(nck, 7)]);
      const tokVp = p.tokens.reduce((a, t) => a + (t.vp || 0), 0);
      const total = p.markerVp + tokVp + vpCards + firefly + ckVp;
      if (!best || total > best.total) best = { total, markers: p.markerVp, tokens: tokVp, cards: vpCards + firefly, cockades: ckVp, nck, effs, firefly };
    }
    return best;
  }

  // ---------- actions ----------
  async gainMinikins(p, n, why) {
    if (n <= 0) return;
    await this.emit(['gainM', { p: p.name, n, why }], 'gain', p.id);
    for (let i = 0; i < n; i++) {
      const t = p.city.map((s, k) => k).filter(k => p.city[k].c.spaces > p.city[k].m);
      if (!t.length) { p.pending++; continue; }
      let k = t[0];
      if (t.length > 1) { if (p._auto) k = AI.choose('placeMinikin', { targets: t }, this, p); else { k = await this.ask(p, 'placeMinikin', { targets: t, left: n - i }); if (k === 'auto') { p._auto = true; k = AI.choose('placeMinikin', { targets: t }, this, p); } } }
      if (!t.includes(k)) k = t[0];
      p.city[k].m++;
    }
    p._auto = false;
  }
  async takeBonus(p, k = 1) {
    for (let i = 0; i < k; i++) {
      if (!this.bonusSupply.length) { await this.emit(['noBonus', {}], 'info'); return; }
      let idx = await this.ask(p, 'bonus', { options: this.bonusSupply.map((t, i) => i) });
      if (!(idx >= 0 && idx < this.bonusSupply.length)) idx = 0;
      const t = this.bonusSupply.splice(idx, 1)[0];
      p.tokens.push(t);
      await this.emit(['takeTok', { p: p.name, tok: t.id }], 'gain', p.id);
      if (t.mPer) { const b = this.base(p); await this.gainMinikins(p, b.col[t.mPer], ['whyTok', {}]); }
    }
  }
  async drawDiscard(p, n, why) {
    let got = 0; for (let i = 0; i < n; i++) { const c = this.draw(); if (c) { p.hand.push(c); got++; } }
    if (!got) return;
    await this.emit(['drawDisc', { p: p.name, n: got, why }], 'info', p.id);
    const sel = await this.ask(p, 'discard', { n: got, why });
    const idxs = (Array.isArray(sel) && sel.length === got ? sel : AI.choose('discard', { n: got }, this, p)).slice().sort((a, b) => b - a);
    for (const i of idxs) this.toBottom(p.hand.splice(i, 1)[0]);
  }
  async drawN(p, n, why) { let got = 0; for (let i = 0; i < n; i++) { const c = this.draw(); if (c) { p.hand.push(c); got++; } } if (got) await this.emit(['draw', { p: p.name, n: got, why }], 'info', p.id); }
  async applyReward(p, rw, why) {
    if (rw.vp) { p.markerVp += rw.vp; }
    if (rw.ck) { p.markerCk += rw.ck; }
    if (rw.vp || rw.ck) await this.emit(['score', { p: p.name, vp: rw.vp || 0, ck: rw.ck || 0, why }], 'gain', p.id);
    if (rw.m) await this.gainMinikins(p, rw.m, why);
    if (rw.bonus) await this.takeBonus(p, rw.bonus);
    if (rw.dd) await this.drawDiscard(p, rw.dd, why);
  }
  async placeCard(p, card, resolve = true) {
    const slot = { c: card, m: 0 }; p.city.push(slot);
    if (card.spaces > 0 && p.pending > 0) { const f = Math.min(card.spaces, p.pending); slot.m = f; p.pending -= f; }
    if (resolve && card.type === 'I') await this.resolveInstant(p, card);
  }
  async resolveInstant(p, card) {
    if (card.pet === 'mole') {
      if (p.hand.length) { let i = await this.ask(p, 'extraPlay', { why: 'Mole', optional: false }); if (!(i >= 0 && i < p.hand.length)) i = 0; const c = p.hand.splice(i, 1)[0]; await this.emit(['playAlso', { p: p.name, card: c.id, why: 'Mole' }], 'play', p.id); await this.placeCard(p, c, true); }
      await this.drawN(p, 1, 'Mole'); return;
    }
    if (card.pet === 'duck') { await this.drawN(p, 2, 'Duck'); return; }
    let best = {}, bv = -1;
    for (const x of this.ctxs(p)) {
      x.ck = p.markerCk + p.tokens.filter(t => t.ck).length + p.city.filter(s => this.active(s) && s.c.eff && s.c.eff.gain && s.c.eff.gain.ck).reduce((a, s) => a + (this.evalEff(s.c.eff, Object.assign({}, x, { ck: 0 })).ck || 0), 0);
      const g = this.evalEff(card.eff, x); const v = (g.m || 0) + (g.bonus || 0) * 3;
      if (v > bv) { bv = v; best = g; }
    }
    if (!best.m && !best.bonus) { await this.emit(['instNone', { card: card.id }], 'info', p.id); return; }
    if (best.m) await this.gainMinikins(p, best.m, ['whyInst', { card: card.id }]);
    if (best.bonus) await this.takeBonus(p, best.bonus);
  }


  // vue sérialisable de la table, du point de vue d’un siège (mains adverses cachées)
  view(seat) {
    const rk = new Map(this.ranking.map((pl, i) => [pl, i]));
    const f = this.fest();
    return {
      round: this.round, phase: this.phase, n: this.n, festOn: this.festOn, wildOn: this.wildOn, best: this.best,
      deckCount: this.deck.length, bonusSupply: this.bonusSupply.map(t => t.id), endTile: this.n,
      festRow: this.festOn ? this.festRow.map((fr, i) => this.revealed.has(i) ? { n: fr.n, season: fr.season, name: fr.name, shown: true } : { season: fr.season }) : null,
      fest: f && this.revealed.has(Math.min(this.round, 8)) ? { n: f.n, name: f.name } : null,
      rewardRow: this.rewardRow.map(r => ({ img: r.img, color: r.color })),
      plays: this.plays.map(pl => ({ pid: pl.pid, card: pl.hidden && pl.pid !== seat ? null : pl.card.id, eff: pl.eff ?? null, rank: rk.has(pl) ? rk.get(pl) : -1, value: pl.card.value })),
      display: this.display.map(c => c.id),
      current: this.current ? this.current.id : null,
      players: this.players.map(p => { const b = this.base(p), sc = this.score(p); return {
        id: p.id, name: p.name, color: p.color, human: p.human, hand: p.id === seat ? p.hand.map(c => c.id) : null, handCount: p.hand.length,
        city: p.city.map(sl => ({ id: sl.c.id, m: sl.m })), pending: p.pending, tokens: p.tokens.map(t => t.id), markerVp: p.markerVp,
        markers: p.markers, total: sc.total, nck: sc.nck, syms: b.s, wS: b.wS }; }),
      log: this.log.slice(-150).map(l => ({ k: l.k, a: l.a, kind: l.kind })),
      final: this.final ? this.final.map(f => ({ id: f.p.id, name: f.p.name, color: f.p.color, markers: f.markers, tokens: f.tokens, cards: f.cards, cockades: f.cockades, nck: f.nck, pending: f.p.pending, total: f.total })) : null,
    };
  }

  // ---------- partie ----------
  async run() {
    for (const p of this.players) for (let i = 0; i < 6; i++) p.hand.push(this.draw());
    this.phase = 'keep';
    await this.emit(['deal', {}], 'phase');
    for (const p of this.players) {
      let keep = await this.ask(p, 'keep', { n: 4 });
      if (!Array.isArray(keep) || keep.length !== 4) keep = AI.choose('keep', { n: 4 }, this, p);
      const kept = keep.map(i => p.hand[i]); const rest = p.hand.filter((c, i) => !keep.includes(i));
      p.hand = kept; rest.forEach(c => this.toBottom(c));
    }
    this.first = Math.floor(this.r() * this.n);
    await this.emit(['starts', { p: this.players[this.first].name }], 'phase');
    for (this.round = 0; this.round < 8; this.round++) await this.playRound();
    this.round = 8;
    await this.endgame();
    this.phase = 'over';
    this.final = this.players.map(p => Object.assign({ p }, this.score(p))).sort((a, b) => b.total - a.total || b.p.pending - a.p.pending);
    await this.emit(['over', { p: this.final[0].p.name, n: this.final[0].total }], 'phase');
  }

  async playRound() {
    const rc = this.rewardRow[this.round];
    this.best = rc.color; this.plays = []; this.ranking = [];
    this.players.forEach(p => { p.skipTake = false; p.mod = 0; });
    this.phase = 'reveal';
    await this.emit(['round', { n: this.round + 1, color: rc.color }], 'phase');
    const f = this.fest();
    if (f) { this.revealed.add(this.round); await this.emit(['fest', { fest: f.n }], 'fest'); }
    if (this.fest(3)) for (const p of this.turnOrder()) await this.drawN(p, 1, f.name);
    if (this.fest(7)) {
      const passed = [];
      for (const p of this.turnOrder()) { let i = await this.ask(p, 'pass', {}); if (!(i >= 0 && i < p.hand.length)) i = 0; passed.push([p, p.hand.splice(i, 1)[0]]); }
      for (const [p, c] of passed) this.players[(p.id + 1) % this.n].hand.push(c);
      await this.emit(['passed', {}], 'info');
    }
    // offre
    this.display = [];
    if (!this.fest(16)) { const k = this.n + 1 + (this.fest(1) ? 2 : 0); for (let i = 0; i < k; i++) { const c = this.draw(); if (c) this.display.push(c); } }
    // jouer
    this.phase = 'play';
    const order = this.turnOrder();
    const lights = this.fest(5);
    const chosen = [];
    for (const p of order) {
      this.current = p;
      const opts = { early: !!this.fest(4) && this.display.length > 0, hidden: !!lights };
      let ch = await this.ask(p, 'play', opts);
      if (!ch || (ch.src === 'display' && !opts.early)) ch = { src: 'hand', i: 0 };
      let card;
      if (ch.src === 'display' && this.display[ch.i]) { card = this.display.splice(ch.i, 1)[0]; p.skipTake = true; }
      else { const i = ch.i >= 0 && ch.i < p.hand.length ? ch.i : 0; card = p.hand.splice(i, 1)[0]; }
      p.mod = 0;
      if (this.has(p, 'chipmunk')) { const m = await this.ask(p, 'chipmunk', { card: card.id }); p.mod = [2, -2, 0].includes(m) ? m : 0; }
      const play = { pid: p.id, card, from: ch.src, mod: p.mod, hidden: !!lights };
      this.plays.push(play); chosen.push(play);
      if (!lights) {
        await this.emit(['plays', { p: p.name, card: card.id, disp: play.from === 'display', mod: p.mod }], 'play', p.id);
        await this.placeCard(p, card, true);
        if (this.fest(9) && card.value >= 11 && card.value <= 20) await this.drawDiscard(p, 1, 'Tall Tales Night');
      } else await this.emit(['faceDown', { p: p.name }], 'play', p.id);
    }
    this.current = null;
    if (lights) {
      for (const pl of chosen) pl.hidden = false;
      await this.emit(['reveal', { list: chosen.map(pl => [this.players[pl.pid].name, pl.card.id]) }], 'play');
      for (const pl of chosen) await this.placeCard(this.players[pl.pid], pl.card, true);
    }
    if (this.fest(14)) { const c = this.plays[0].card.color; this.best = c || null; await this.emit(['sled', { color: c || null }], 'fest'); }
    // classement
    this.phase = 'rank';
    this.ranking = this.rank();
    const rows = rc.rows;
    await this.emit(['ranking', { list: this.ranking.map(pl => [this.players[pl.pid].name, pl.card.id, pl.eff]) }], 'rank');
    for (let i = 0; i < this.ranking.length; i++) {
      const p = this.players[this.ranking[i].pid]; p.markers.push({ round: this.round, pos: i });
      if (rows[i]) await this.applyReward(p, rows[i], ['whyRound', { n: this.round + 1 }]);
    }
    // prendre une carte
    this.phase = 'take';
    if (!this.fest(16)) {
      for (const pl of this.ranking.slice().reverse()) {
        const p = this.players[pl.pid]; if (p.skipTake) continue;
        this.current = p;
        if (this.fest(2) && this.display.length && p.hand.length) {
          const sw = await this.ask(p, 'swap', {});
          if (sw && this.display[sw.d] && p.hand[sw.h]) { const h = p.hand[sw.h]; p.hand[sw.h] = this.display[sw.d]; this.display[sw.d] = h; await this.emit(['swapped', { p: p.name }], 'info', p.id); }
        }
        const deckOpt = this.has(p, 'hedgehog') && this.deck.length > 0;
        if (!this.display.length && !deckOpt) continue;
        let t = await this.ask(p, 'take', { deck: deckOpt });
        if (t === 'deck' && deckOpt) { p.hand.push(this.draw()); await this.emit(['deckTake', { p: p.name }], 'take', p.id); }
        else { if (!(t >= 0 && t < this.display.length)) t = 0; if (this.display.length) { const c = this.display.splice(t, 1)[0]; p.hand.push(c); await this.emit(['takes', { p: p.name, card: c.id }], 'take', p.id); } }
      }
    }
    this.current = null;
    // escargot puis défausse de l’offre
    if (this.display.length) {
      const owner = this.turnOrder().find(p => this.has(p, 'snail'));
      if (owner) { const i = AI.bestIndex(this.display.map(c => AI.cityValue(this, owner, c) + c.value * 0.05)); const c = this.display.splice(i, 1)[0]; owner.hand.push(c); await this.emit(['snail', { p: owner.name, card: c.id }], 'take', owner.id); }
      this.display.forEach(c => this.toBottom(c)); this.display = [];
    }
    // effets de fin de manche
    for (const p of this.turnOrder()) {
      if (this.has(p, 'squirrel')) await this.gainMinikins(p, 1, 'Flying Squirrel');
      if (this.has(p, 'magpie')) await this.drawDiscard(p, 1, 'Magpie');
      if (this.has(p, 'tortoise')) {
        const mv = await this.ask(p, 'tortoise', {});
        if (mv && p.city[mv.from] && p.city[mv.to] && p.city[mv.from].m > 0 && p.city[mv.to].m < p.city[mv.to].c.spaces && mv.from !== mv.to) { p.city[mv.from].m--; p.city[mv.to].m++; await this.emit(['tortoise', { p: p.name }], 'info', p.id); }
      }
    }
    this.first = this.ranking[0].pid;
  }

  effValue(pl, idxInOrder) {
    const p = this.players[pl.pid], c = pl.card; let v = c.value + (pl.mod || 0);
    if (this.fest(6) && idxInOrder > 0) { const prev = this.plays[idxInOrder - 1]; if (prev && c.color && prev.card.color === c.color) v += 3; }
    if (this.fest(10) && c.type === 'I') v += 5;
    if (this.fest(15) && c.value >= 1 && c.value <= 5) v += 5;
    if (c.type === 'I' && this.has(p, 'snake')) v += 3;
    return v;
  }
  rank() {
    const slow = this.fest(11), topsy = this.fest(13), even = this.fest(8), odd = this.fest(12);
    const arr = this.plays.map((pl, i) => Object.assign(pl, { order: i, eff: this.effValue(pl, i) }));
    const key = (pl) => {
      const c = pl.card;
      const top = c.id === 'x21' ? 0 : 1;
      const par = even ? (c.value % 2 === 0 ? 0 : 1) : odd ? (c.value % 2 === 1 ? 0 : 1) : 0;
      let colG = this.best && c.color === this.best ? 0 : 1; if (topsy && this.best) colG = 1 - colG;
      const v = slow ? pl.eff : -pl.eff;
      return [top, par, colG, v, pl.order];
    };
    return arr.slice().sort((a, b) => { const ka = key(a), kb = key(b); for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i] - kb[i]; return 0; });
  }

  async endgame() {
    const f = this.fest();
    if (f) { this.revealed.add(8); await this.emit(['newyear', { fest: f.n }], 'fest'); }
    if (this.fest(17)) {
      this.phase = 'play';
      for (const p of this.turnOrder()) if (p.hand.length) { let i = await this.ask(p, 'extraPlay', { why: 'Midnight Rush', optional: false }); if (!(i >= 0 && i < p.hand.length)) i = 0; const c = p.hand.splice(i, 1)[0]; await this.emit(['playAlso', { p: p.name, card: c.id, why: 'Midnight Rush' }], 'play', p.id); await this.placeCard(p, c, true); }
    }
    this.phase = 'endrank';
    const col = this.rewardRow[8].color; this.best = col;
    const order = this.turnOrder();
    const tot = order.map((p, i) => { const cs = p.hand.filter(c => col ? c.color === col : true); return { p, i, total: cs.reduce((a, c) => a + c.value, 0), has: cs.length > 0 }; });
    await this.emit(['endRank', { color: col, list: tot.map(t => [t.p.name, t.total]) }], 'rank');
    const less = this.fest(18);
    tot.sort((a, b) => less ? ((b.has - a.has) || (a.total - b.total) || (a.i - b.i)) : ((b.total - a.total) || (a.i - b.i)));
    this.endRanking = tot;
    for (let k = 0; k < tot.length; k++) {
      const p = tot[k].p, rw = this.endTile[k]; p.markers.push({ round: 8, pos: k }); if (!rw) continue;
      await this.applyReward(p, rw, ['whyEnd', {}]);
      if (rw.play && p.hand.length) { const i = await this.ask(p, 'extraPlay', { why: ['whyEnd', {}], optional: true }); if (i >= 0 && i < p.hand.length) { const c = p.hand.splice(i, 1)[0]; await this.emit(['extraCard', { p: p.name, card: c.id }], 'play', p.id); await this.placeCard(p, c, true); } }
    }
  }
}

// ---------- IA ----------
const RV = (rw) => !rw ? 0 : (rw.m || 0) * 1.3 + (rw.vp || 0) + (rw.ck || 0) * 2.6 + (rw.bonus || 0) * 3 + (rw.dd || 0) * 0.8 + (rw.play ? 3 : 0);
const AI = {
  bestIndex(arr) { let b = 0; arr.forEach((v, i) => { if (v > arr[b]) b = i; }); return b; },
  cityValue(g, p, card) {
    let v = card.sym.reduce((a, s) => a + (s === 'W' ? 1.3 : 0.9), 0);
    const left = g.roundsLeft();
    const fake = { c: card, m: card.spaces };
    p.city.push(fake);
    try {
      const xs = g.ctxs(p); const x = xs[0]; x.ck = p.markerCk + 1;
      if (card.type === 'S' && card.eff) {
        let gv = 0; for (const y of xs) { y.ck = x.ck; const e = g.evalEff(card.eff, y); gv = Math.max(gv, (e.vp || 0) + (e.ck || 0) * 2.6); }
        if (!gv && card.eff.k === 'if') { // proximité de la condition
          let ratio = 1; for (const k in card.eff.need) ratio = Math.min(ratio, g.count(k, x) / card.eff.need[k]);
          gv = ((card.eff.gain.vp || 0) + (card.eff.gain.ck || 0) * 2.6) * Math.pow(ratio, 2) * Math.min(1, left / 4);
        } else if (card.eff.k === 'per') gv += Math.min(left, 3) * ((card.eff.gain.vp || 0) * 0.4);
        let free = 0; p.city.forEach(s => { if (s !== fake) free += Math.max(0, s.c.spaces - s.m); });
        const pot = p.pending + left * 1.5 - free;
        const ratio = card.spaces ? Math.max(0, Math.min(1, pot / card.spaces)) : 1;
        v += gv * (0.3 + 0.7 * ratio);
      } else if (card.type === 'I' && card.eff) {
        let gv = 0; for (const y of xs) { y.ck = x.ck; const e = g.evalEff(card.eff, y); gv = Math.max(gv, (e.m || 0) * 1.4 + (e.bonus || 0) * 3); }
        v += gv;
      } else if (card.pet) {
        v += ({ chipmunk: 2.5, bluejay: 3, hedgehog: 1.2, dragonfly: p.markerCk >= 3 ? 4 : 1.5, snake: 2, snail: left * 0.5, tortoise: 0.8,
          mole: 3, squirrel: left * 1.3, duck: 2.2, magpie: left * 0.5, raccoon: p.pending * 0.8 + 1, firefly: 4 })[card.pet] || 0;
      }
    } finally { p.city.pop(); }
    return v;
  },
  holdValue(g, card) { const ec = g.rewardRow[8].color; return (ec === null || card.color === ec) ? card.value * 0.3 : 0; },
  strength(g, p, card, mod = 0) {
    if (card.id === 'x21') return 100;
    let v = card.value + mod;
    if (g.fest(10) && card.type === 'I') v += 5; if (g.fest(15) && card.value <= 5 && card.value >= 1) v += 5;
    if (card.type === 'I' && g.has(p, 'snake')) v += 3;
    if (g.fest(11)) v = 21 - v;
    let colBest = g.best && card.color === g.best; if (g.fest(13) && g.best) colBest = !colBest;
    let s = v + (colBest ? 22 : 0);
    if (g.fest(8)) s += card.value % 2 === 0 ? 45 : 0; if (g.fest(12)) s += card.value % 2 === 1 ? 45 : 0;
    return s;
  },
  rankValue(g, p, card) {
    const rows = g.rewardRow[g.round] ? g.rewardRow[g.round].rows : g.endTile;
    const s = this.strength(g, p, card, g.has(p, 'chipmunk') ? (g.fest(11) ? -2 : 2) : 0);
    const known = g.plays.filter(pl => !pl.hidden).map(pl => this.strength(g, g.players[pl.pid], pl.card, pl.mod));
    const beaten = known.filter(k => k >= s).length;
    const remaining = g.n - 1 - g.plays.length;
    const pBeat = Math.max(0.05, Math.min(0.95, 1 - (s - 4) / 38));
    let exp = 0;
    for (let pos = 0; pos < g.n; pos++) {
      const k = pos - beaten; if (k < 0 || k > remaining) continue;
      const comb = (n, r) => { let c = 1; for (let i = 0; i < r; i++) c = c * (n - i) / (i + 1); return c; };
      const pr = comb(remaining, k) * Math.pow(pBeat, k) * Math.pow(1 - pBeat, remaining - k);
      exp += pr * RV(rows[pos]);
    }
    return exp;
  },
  choose(kind, d, g, p) {
    switch (kind) {
      case 'keep': { const sc = p.hand.map((c, i) => [this.cityValue(g, p, c) + c.value * 0.12 + this.holdValue(g, c), i]).sort((a, b) => b[0] - a[0]); return sc.slice(0, d.n).map(x => x[1]); }
      case 'play': {
        let best = { s: -1e9 };
        p.hand.forEach((c, i) => { const s = this.cityValue(g, p, c) + this.rankValue(g, p, c) - this.holdValue(g, c); if (s > best.s) best = { s, src: 'hand', i }; });
        if (d.early) g.display.forEach((c, i) => { const s = this.cityValue(g, p, c) + this.rankValue(g, p, c) - 2.5; if (s > best.s) best = { s, src: 'display', i }; });
        return { src: best.src, i: best.i };
      }
      case 'chipmunk': return g.fest(11) ? -2 : 2;
      case 'placeMinikin': {
        const sc = d.targets.map(k => { const s = p.city[k]; const need = s.c.spaces - s.m; const val = this.cityValue(g, p, s.c) + 1; return val / need; });
        return d.targets[this.bestIndex(sc)];
      }
      case 'bonus': {
        const sc = g.bonusSupply.map(t => t.vp ? 2 : t.ck ? 2.6 : t.mPer ? g.base(p).col[t.mPer] * 1.3 : t.wildColor ? 1.6 : 1.4 + (g.base(p).s[t.sym] ? 0.3 : 0));
        return this.bestIndex(sc);
      }
      case 'discard': { const sc = p.hand.map((c, i) => [this.cityValue(g, p, c) + this.holdValue(g, c) + c.value * 0.05, i]).sort((a, b) => a[0] - b[0]); return sc.slice(0, d.n).map(x => x[1]); }
      case 'take': {
        const sc = g.display.map(c => this.cityValue(g, p, c) + this.holdValue(g, c) + c.value * 0.06);
        if (d.deck && (!sc.length || Math.max(...sc) < 3.5)) return 'deck';
        return this.bestIndex(sc);
      }
      case 'swap': {
        if (!p.hand.length || !g.display.length) return null;
        const hv = p.hand.map(c => this.cityValue(g, p, c) + this.holdValue(g, c)); const dv = g.display.map(c => this.cityValue(g, p, c) + this.holdValue(g, c));
        const hi = hv.indexOf(Math.min(...hv)), di = this.bestIndex(dv);
        return dv[di] > hv[hi] + 1.5 ? { h: hi, d: di } : null;
      }
      case 'pass': { const sc = p.hand.map(c => this.cityValue(g, p, c) + this.holdValue(g, c) + c.value * 0.05); return sc.indexOf(Math.min(...sc)); }
      case 'extraPlay': { if (!p.hand.length) return -1; const sc = p.hand.map(c => this.cityValue(g, p, c) - (g.phase === 'endrank' ? 0 : this.holdValue(g, c))); return this.bestIndex(sc); }
      case 'tortoise': return null;
    }
    return null;
  },
};

root.MK = { Game, AI, cardName, COLOR_FR, SYMS };
})(typeof window !== 'undefined' ? window : globalThis);
