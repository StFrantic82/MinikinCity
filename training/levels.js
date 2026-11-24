require(__dirname + '/../data.js'); require(__dirname + '/../engine.js');
const { Game, aiFor } = globalThis.MK;
async function duel(lvA, lvB, N, n) {
  let w = 0, m = 0;
  for (let s = 1; s <= N; s++) {
    const seat = s % n;
    const g = new Game({ seed: 77000 + s * 13, festivals: s % 2 === 0, wild: s % 4 < 2, players: Array.from({ length: n }, (_, i) => ({ name: 'P' + i, agent: aiFor(i === seat ? lvA : lvB) })) });
    await g.run(); if (g.final[0].p.id === seat) w++;
    m += g.final.find(f => f.p.id === seat).total - g.final.reduce((a, f) => a + f.total, 0) / n;
  }
  console.log(`${lvA} contre ${n - 1}× ${lvB} (${n} joueurs, ${N} parties) : ${(w / N * 100).toFixed(0)} % de victoires (attendu ${(100 / n).toFixed(0)} %), marge ${(m / N).toFixed(1)} PV`);
}
(async () => { await duel('normal', 'easy', 2000, 3); await duel('normal', 'easy', 2000, 4); await duel(process.argv[2] || 'hard', 'normal', +process.argv[3] || 60, 3); })();
