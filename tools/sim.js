require('/home/claude/minikincity/data.js'); require('/home/claude/minikincity/engine.js');
const { Game } = globalThis.MK;
(async () => {
  let errs = 0, stats = { scores: [], hand: [], minis: 0, games: 0 };
  for (let s = 1; s <= 400; s++) {
    const n = 2 + (s % 4), fest = s % 2 === 0, wild = s % 3 !== 0;
    const g = new Game({ seed: s, festivals: fest, wild, players: Array.from({ length: n }, (_, i) => ({ name: 'P' + i, color: 'c' + i })) });
    try {
      await g.run();
      stats.games++;
      for (const f of g.final) stats.scores.push(f.total);
      for (const p of g.players) { stats.hand.push(p.hand.length); stats.minis += p.pending; if (p.hand.some(c => !c)) throw new Error('null card in hand'); }
      for (const p of g.players) for (const sl of p.city) if (sl.m > sl.c.spaces) throw new Error('overfill');
    } catch (e) { errs++; if (errs < 4) console.log('seed', s, e.stack); }
  }
  const avg = a => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
  console.log('games', stats.games, 'errors', errs, 'avg score', avg(stats.scores), 'min', Math.min(...stats.scores), 'max', Math.max(...stats.scores), 'avg hand', avg(stats.hand), 'avg unused minikins', (stats.minis / stats.hand.length).toFixed(2));
  const g = new Game({ seed: 7, festivals: true, wild: true, players: [{ name: 'Ana' }, { name: 'Bob' }, { name: 'Cy' }] });
  await g.run(); console.log(g.log.slice(-25).map(l => l.msg).join('\n'));
  console.log(g.final.map(f => `${f.p.name}: ${f.total} (markers ${f.markers}, tokens ${f.tokens}, cards ${f.cards}, ck ${f.nck}→${f.cockades})`).join('\n'));
})();
