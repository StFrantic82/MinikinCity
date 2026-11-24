const { Worker } = require('worker_threads');
require(__dirname + '/../data.js'); require(__dirname + '/../engine.js');
const { DEFAULT_W } = globalThis.MK;
const fs = require('fs');
const workers = [new Worker(__dirname + '/evalw.js'), new Worker(__dirname + '/evalw.js')];
let nextId = 0; const pending = new Map();
workers.forEach(w => w.on('message', m => { pending.get(m.id)(m); pending.delete(m.id); }));
function run(cand, opp, seeds) { // répartit les graines sur les 2 workers
  const half = Math.ceil(seeds.length / 2);
  const parts = [seeds.slice(0, half), seeds.slice(half)];
  return Promise.all(parts.map((sd, i) => new Promise(res => { const id = nextId++; pending.set(id, res); workers[i].postMessage({ id, cand, opp, seeds: sd }); })))
    .then(rs => { const g = rs[0].games + rs[1].games; return { fit: (rs[0].fit * rs[0].games + rs[1].fit * rs[1].games) / g, margin: (rs[0].margin * rs[0].games + rs[1].margin * rs[1].games) / g }; });
}
const keys = Object.keys(DEFAULT_W);
let rnd = 12345; const R = () => { rnd = (rnd * 1103515245 + 12345) & 0x7fffffff; return rnd / 0x7fffffff; };
const gauss = () => Math.sqrt(-2 * Math.log(R() + 1e-12)) * Math.cos(2 * Math.PI * R());
function mutate(w, sigma) {
  const o = Object.assign({}, w);
  for (const k of keys) if (R() < 0.35) {
    if (k === 'pendFill') o[k] = Math.max(0, o[k] + gauss() * 0.6);
    else o[k] = Math.max(0.01, o[k] * Math.exp(gauss() * sigma));
  }
  return o;
}
const seedSet = (base, n) => Array.from({ length: n }, (_, i) => base + i * 7919);
(async () => {
  const GENS = +process.argv[2] || 30, POP = 10, N = 1000;
  let champ = Object.assign({}, DEFAULT_W), sigma = 0.35;
  const log = [];
  const t0 = Date.now();
  for (let gen = 0; gen < GENS; gen++) {
    const seeds = seedSet(1000 + gen * 100003, N);
    const cands = Array.from({ length: POP }, () => mutate(champ, sigma));
    const res = [];
    for (const c of cands) res.push(await run(c, champ, seeds));
    let bi = 0; res.forEach((r, i) => { if (r.fit > res[bi].fit) bi = i; });
    let msg = `gen ${gen} best fit ${res[bi].fit.toFixed(3)} margin ${res[bi].margin.toFixed(2)}`;
    if (res[bi].fit > 1.05) {
      const v = await run(cands[bi], champ, seedSet(9e6 + gen * 7777, 3000)); // validation sur d'autres parties
      msg += ` | validation ${v.fit.toFixed(3)}`;
      if (v.fit > 1.03) { champ = cands[bi]; msg += ' → nouveau champion'; } else sigma = Math.max(0.12, sigma * 0.9);
    } else sigma = Math.max(0.12, sigma * 0.9);
    console.log(msg, `(${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    fs.writeFileSync('champ.json', JSON.stringify(champ, null, 1));
  }
  const fin = await run(champ, DEFAULT_W, seedSet(5e7, 4000));
  console.log('FINAL vs IA d’origine : fit', fin.fit.toFixed(3), 'marge', fin.margin.toFixed(2));
  process.exit(0);
})();
