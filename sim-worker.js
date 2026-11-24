// Simulations de parties entre IA, en arrière-plan
importScripts('data.js?v=11', 'engine.js?v=11');
const { Game } = self.MK;
const D = self.MK_DATA;

self.onmessage = async (e) => {
  const { n, games, fest, wild } = e.data;
  const card = {}, festS = {}, tok = {};
  const add = (o, k) => (o[k] = o[k] || { games: 0, wins: 0, vp: 0, active: 0, scoringGames: 0, total: 0 });
  let sumWin = 0, sumAll = 0, cnt = 0, sumMarkers = 0, sumTokens = 0, sumCards = 0, sumCk = 0, errors = 0;
  for (let gi = 0; gi < games; gi++) {
    const g = new Game({ seed: (Math.random() * 1e9) | 0, festivals: fest, wild, players: Array.from({ length: n }, (_, i) => ({ name: 'P' + i })) });
    try { await g.run(); } catch (err) { errors++; continue; }
    const fin = g.final; const winner = fin[0].p;
    sumWin += fin[0].total;
    for (const f of fin) { sumAll += f.total; cnt++; sumMarkers += f.markers; sumTokens += f.tokens; sumCards += f.cards; sumCk += f.cockades; }
    for (const f of fin) {
      const p = f.p, isW = p === winner;
      const vpById = {}; for (const ef of f.effs) vpById[ef.id] = (vpById[ef.id] || 0) + ef.vp;
      for (const sl of p.city) {
        const s = add(card, sl.c.id); s.games++; if (isW) s.wins++; s.total += f.total;
        if (sl.c.type === 'S') { s.scoringGames++; if (g.active(sl)) s.active++; }
        s.vp += vpById[sl.c.id] || 0;
      }
      for (const t of p.tokens) { const s = add(tok, t.id); s.games++; if (isW) s.wins++; s.total += f.total; }
    }
    if (fest) for (const fr of g.festRow) { const s = add(festS, fr.n); s.games++; s.total += fin.reduce((a, f) => a + f.total, 0) / fin.length; s.vp += fin[0].total - fin[fin.length - 1].total; }
    if ((gi + 1) % 10 === 0 || gi + 1 === games) self.postMessage({ progress: (gi + 1) / games });
  }
  self.postMessage({ done: true, card, fest: festS, tok, n, games, errors,
    avg: { win: sumWin / Math.max(1, games - errors), all: sumAll / Math.max(1, cnt), markers: sumMarkers / Math.max(1, cnt), tokens: sumTokens / Math.max(1, cnt), cards: sumCards / Math.max(1, cnt), ck: sumCk / Math.max(1, cnt) } });
};
