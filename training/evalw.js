// Évalue un jeu de poids candidat contre des adversaires (poids "champion") sur une liste de graines
const { parentPort, workerData } = require('worker_threads');
require(__dirname + '/../data.js'); require(__dirname + '/../engine.js');
const { Game, makeAI } = globalThis.MK;
async function evaluate(cand, opp, seeds) {
  const A = makeAI(cand), B = makeAI(opp);
  let score = 0, games = 0, pts = 0;
  for (const s of seeds) {
    const n = 2 + (s % 3), fest = (s >> 2) % 2 === 1, wild = (s >> 3) % 2 === 1, seat = (s >> 4) % n;
    const g = new Game({ seed: s, festivals: fest, wild, players: Array.from({ length: n }, (_, i) => ({ name: 'P' + i, agent: i === seat ? A : B })) });
    try { await g.run(); } catch (e) { continue; }
    const top = g.final[0].total, winners = g.final.filter(f => f.total === top && f.p.pending === g.final[0].p.pending);
    if (winners.some(f => f.p.id === seat)) score += n / winners.length;
    pts += g.final.find(f => f.p.id === seat).total - g.final.reduce((a, f) => a + f.total, 0) / n;
    games++;
  }
  return { fit: score / games, margin: pts / games, games };
}
parentPort.on('message', async (m) => { parentPort.postMessage(Object.assign({ id: m.id }, await evaluate(m.cand, m.opp, m.seeds))); });
