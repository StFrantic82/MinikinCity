// Minikin City — données des cartes (jeu de base, Wild Friends, Festivals)
// sym : symboles en haut à droite (B livre, H cœur, S sourire, G bourse, W symbole au choix)
// type : 'S' effet de score (✓), 'I' effet instantané (⚡), 'P' permanent (∞), 'M' fin de manche (☾), '' aucun
// eff : { k:'if'|'per'|'flat', need/per, gain }
(function (root) {
const C = (id, color, value, sym, type, spaces, eff, extra) => Object.assign({ id, color, value, sym, type, spaces, eff }, extra || {});
const IF = (need, gain) => ({ k: 'if', need, gain });
const PER = (per, gain) => ({ k: 'per', per, gain });
const FLAT = (gain) => ({ k: 'flat', gain });
const SET = { set: 1 };

const CITY = [
  // ROSE
  C('p1', 'pink', 1, ['B', 'G'], 'S', 2, IF({ B: 5 }, { vp: 9 })),
  C('p2', 'pink', 2, ['H', 'H'], 'I', 0, PER('H', { m: 1 })),
  C('p3', 'pink', 3, ['S', 'G'], 'S', 2, IF({ S: 6 }, { vp: 9 })),
  C('p4', 'pink', 4, ['G'], 'S', 4, FLAT({ ck: 2 })),
  C('p5', 'pink', 5, ['G', 'G'], 'S', 2, PER('pink', { vp: 1 })),
  C('p6', 'pink', 6, ['S', 'S'], 'S', 3, PER('S', { vp: 1 })),
  C('p7', 'pink', 7, ['B'], 'S', 2, IF({ cset: 2 }, { vp: 5 })),
  C('p8', 'pink', 8, ['S', 'H'], 'S', 2, PER('blue', { vp: 1 })),
  C('p9', 'pink', 9, ['G'], 'S', 3, IF({ G: 5 }, { vp: 5 })),
  C('p10', 'pink', 10, ['S'], 'S', 2, IF({ G: 5, H: 2 }, { vp: 7 })),
  C('p11', 'pink', 11, ['H', 'S', 'B'], 'S', 5, PER('m3', { vp: 1 })),
  C('p12', 'pink', 12, ['B', 'G'], 'I', 0, IF({ S: 3 }, { m: 2 })),
  C('p13', 'pink', 13, [], 'I', 0, IF(SET, { bonus: 2 })),
  C('p14', 'pink', 14, ['S', 'H'], 'S', 3, PER('H', { vp: 1 })),
  C('p15', 'pink', 15, [], 'S', 2, PER('S', { vp: 1 })),
  C('p16', 'pink', 16, ['S'], 'S', 3, PER('ck', { vp: 1 })),
  C('p17', 'pink', 17, ['G'], 'S', 3, FLAT({ ck: 1 })),
  C('p18', 'pink', 18, [], 'S', 1, IF({ B: 3 }, { ck: 1 })),
  C('p19', 'pink', 19, ['H'], 'I', 0, IF(SET, { bonus: 1 })),
  C('p20', 'pink', 20, ['B'], 'S', 2, IF(SET, { vp: 2 })),
  // VERT
  C('g1', 'green', 1, ['B', 'B'], 'S', 4, PER('B', { vp: 2 })),
  C('g2', 'green', 2, ['B'], 'S', 2, IF(SET, { vp: 6 })),
  C('g3', 'green', 3, ['S', 'G'], 'I', 0, FLAT({ m: 2, bonus: 1 })),
  C('g4', 'green', 4, ['S', 'B'], 'S', 2, PER('G', { vp: 1 })),
  C('g5', 'green', 5, ['G'], 'I', 0, PER('diff', { m: 1 })),
  C('g6', 'green', 6, ['S', 'G'], 'S', 5, PER('instant', { vp: 3 })),
  C('g7', 'green', 7, ['G'], 'S', 2, PER('green', { vp: 1 })),
  C('g8', 'green', 8, ['G'], 'S', 3, PER('G', { vp: 1 })),
  C('g9', 'green', 9, ['S', 'S', 'B'], 'S', 4, IF({ B: 4, S: 3 }, { vp: 7 })),
  C('g10', 'green', 10, ['S', 'G'], 'I', 0, IF({ G: 3 }, { m: 2 })),
  C('g11', 'green', 11, [], 'S', 2, IF({ H: 3 }, { vp: 7 })),
  C('g12', 'green', 12, ['S', 'G'], 'I', 0, FLAT({ m: 1 })),
  C('g13', 'green', 13, ['G'], 'S', 1, IF({ G: 5, B: 3 }, { vp: 4 })),
  C('g14', 'green', 14, [], 'S', 1, IF({ S: 4, H: 2 }, { vp: 6 })),
  C('g15', 'green', 15, ['H'], 'I', 0, IF({ H: 2 }, { m: 2 })),
  C('g16', 'green', 16, ['B', 'G'], 'S', 3, IF({ S: 4 }, { vp: 3 })),
  C('g17', 'green', 17, [], 'S', 1, PER('bonusTok', { vp: 1 })),
  C('g18', 'green', 18, ['S'], 'I', 0, PER('cset', { m: 1 })),
  C('g19', 'green', 19, ['G'], 'S', 1, IF({ instant: 3 }, { vp: 2 })),
  C('g20', 'green', 20, ['G', 'G'], '', 0, null),
  // BLEU
  C('b1', 'blue', 1, [], 'S', 3, PER('v1_5', { vp: 3 })),
  C('b2', 'blue', 2, ['S'], 'I', 0, FLAT({ m: 4 })),
  C('b3', 'blue', 3, ['G'], 'S', 2, PER('cset', { vp: 3 })),
  C('b4', 'blue', 4, ['H'], 'S', 3, PER('H', { vp: 2 })),
  C('b5', 'blue', 5, ['W'], '', 0, null),
  C('b6', 'blue', 6, [], 'I', 0, FLAT({ m: 2, bonus: 1 })),
  C('b7', 'blue', 7, ['G', 'G'], 'S', 2, IF({ green: 4 }, { vp: 5 })),
  C('b8', 'blue', 8, ['B'], 'I', 0, IF({ B: 2 }, { m: 3 })),
  C('b9', 'blue', 9, ['H'], 'S', 2, PER('v6_10', { vp: 1 })),
  C('b10', 'blue', 10, [], 'S', 4, PER('set', { vp: 4 })),
  C('b11', 'blue', 11, [], 'S', 1, IF({ blue: 4 }, { vp: 4 })),
  C('b12', 'blue', 12, ['G'], 'S', 5, PER('v11_15', { vp: 2 })),
  C('b13', 'blue', 13, [], 'S', 2, IF({ G: 6 }, { vp: 7 })),
  C('b14', 'blue', 14, [], 'I', 0, PER('instant', { m: 1 })),
  C('b15', 'blue', 15, [], 'S', 1, FLAT({ ck: 1 })),
  C('b16', 'blue', 16, ['B'], 'I', 0, IF({ ck: 1 }, { bonus: 1 })),
  C('b17', 'blue', 17, ['S'], 'S', 3, PER('B', { vp: 1 })),
  C('b18', 'blue', 18, ['B'], 'S', 2, IF({ pink: 4 }, { vp: 3 })),
  C('b19', 'blue', 19, ['S'], 'S', 3, PER('v16_20', { vp: 1 })),
  C('b20', 'blue', 20, [], 'I', 0, FLAT({ m: 1 })),
  C('x21', null, 21, [], '', 0, null),
];

const WILD = [
  C('wp4', 'pink', 4, ['S'], 'P', 0, null, { pet: 'chipmunk', name: 'Chipmunk', note: '∞ : votre carte jouée vaut +2 ou −2 pour le classement (au choix).' }),
  C('wp6', 'pink', 6, [], 'S', 0, PER('unused', { vp: 1 }), { pet: 'raccoon', name: 'Raccoon', note: '✓ : 1 PV par Minikin non placé.' }),
  C('wp11', 'pink', 11, ['H'], 'P', 0, null, { pet: 'bluejay', name: 'Blue Jay', note: '∞ : compte comme une carte de chaque couleur.' }),
  C('wp19', 'pink', 19, ['G'], 'P', 0, null, { pet: 'hedgehog', name: 'Hedgehog', note: '∞ : vous pouvez piocher dans la pioche au lieu de l’offre.' }),
  C('wg5', 'green', 5, [], 'S', 0, null, { pet: 'dragonfly', name: 'Dragonfly', note: '✓ : vos cocardes rapportent 1/2/7/12/18/25/30 PV.' }),
  C('wg9', 'green', 9, ['H'], 'P', 0, null, { pet: 'snake', name: 'Snake', note: '∞ : vos cartes ⚡ valent +3 pour le classement.' }),
  C('wg12', 'green', 12, [], 'M', 0, null, { pet: 'snail', name: 'Snail', note: '☾ : prenez la carte restante de l’offre.' }),
  C('wg20', 'green', 20, [], 'M', 0, null, { pet: 'tortoise', name: 'Tortoise', note: '☾ : déplacez 1 Minikin d’une carte à une autre.' }),
  C('wb1', 'blue', 1, ['S', 'B'], 'I', 0, null, { pet: 'mole', name: 'Mole', note: '⚡ : jouez 1 carte de votre main dans votre ville, puis piochez 1 carte.' }),
  C('wb3', 'blue', 3, ['H'], 'M', 0, null, { pet: 'squirrel', name: 'Flying Squirrel', note: '☾ : gagnez 1 Minikin.' }),
  C('wb13', 'blue', 13, ['G'], 'I', 0, null, { pet: 'duck', name: 'Duck', note: '⚡ : piochez 2 cartes.' }),
  C('wb18', 'blue', 18, ['B'], 'M', 0, null, { pet: 'magpie', name: 'Magpie', note: '☾ : piochez 1 carte puis défaussez-en 1.' }),
  C('wx0', null, 0, [], 'S', 0, null, { pet: 'firefly', name: 'Firefly', note: '✓ : votre meilleur effet de score compte double.' }),
];

// Cartes Récompense : ordre p1 p2 p3 g1 g2 g3 b1 b2 b3, lignes du haut vers le bas
const R = (m, vp, ck, bonus, dd) => { const o = {}; if (m) o.m = m; if (vp) o.vp = vp; if (ck) o.ck = ck; if (bonus) o.bonus = bonus; if (dd) o.dd = dd; return o; };
const REWARDS = {
  2: [[R(2, 4)], [R(4, 0, 1)], [R(0, 4, 0, 1)], [R(1, 0, 2)], [R(3, 3)], [R(2, 2, 1)], [R(0, 6)], [R(2, 0, 1, 1)], [R(4, 0, 0, 1)]],
  3: [[R(2, 4), R(1, 2)], [R(4, 0, 1), R(2, 1)], [R(0, 4, 0, 1), R(0, 3)], [R(1, 0, 2), R(0, 1, 1)], [R(3, 3), R(0, 3)],
      [R(2, 2, 1), R(1, 2)], [R(0, 6), R(0, 3)], [R(2, 0, 1, 1), R(0, 1, 1)], [R(4, 0, 0, 1), R(2, 1)]],
  4: [[R(2, 4), R(1, 3), R(0, 2)], [R(4, 0, 1), R(2, 2), R(2)], [R(0, 4, 0, 1), R(0, 4), R(0, 2)], [R(1, 0, 2), R(0, 2, 1), R(1, 1)],
      [R(3, 3), R(1, 3), R(0, 2)], [R(2, 2, 1), R(2, 0, 1), R(0, 2)], [R(0, 6), R(0, 4), R(0, 2)], [R(2, 0, 1, 1), R(1, 1, 1), R(0, 0, 1)],
      [R(4, 0, 0, 1), R(3, 1), R(1, 1)]],
  5: [[R(2, 4), R(1, 3), R(0, 2), R(1)], [R(4, 0, 1), R(3, 1), R(2), R(1)], [R(0, 4, 0, 1), R(0, 0, 1), R(0, 2), R(0, 1)],
      [R(1, 0, 2), R(0, 2, 1), R(0, 0, 1), R(1)], [R(3, 3), R(1, 3), R(1, 1), R(1)], [R(2, 2, 1), R(2, 0, 1), R(0, 2), R(0, 1)],
      [R(0, 6), R(0, 4), R(0, 2), R(0, 1)], [R(2, 0, 1, 1), R(1, 1, 1), R(0, 0, 1), R(1)], [R(4, 0, 0, 1), R(3, 1), R(2), R(1)]],
};
const REWARD_IDS = ['p1', 'p2', 'p3', 'g1', 'g2', 'g3', 'b1', 'b2', 'b3'];
const GREY_REWARDS = {
  2: [R(0, 3, 0, 1, 2)],
  3: [R(0, 3, 0, 1, 2), R(0, 2, 0, 0, 2)],
  4: [R(0, 3, 0, 1, 2), R(0, 2, 0, 0, 2), R(0, 1, 0, 0, 1)],
  5: [R(0, 3, 0, 1, 2), R(0, 2, 0, 0, 2), R(0, 1, 0, 0, 1), R(0, 0, 0, 0, 1)],
};
// Tuile de fin de partie (play = le gagnant joue 1 carte en plus)
const ENDGAME = {
  2: [{ m: 3, play: 1 }, { m: 2 }],
  3: [{ m: 3, play: 1 }, { m: 2, vp: 2 }, { m: 2 }],
  4: [{ m: 3, play: 1 }, { m: 2, ck: 1 }, { m: 2, vp: 1 }, { m: 1 }],
  5: [{ m: 3, play: 1 }, { m: 2, ck: 1 }, { m: 2, vp: 1 }, { m: 1 }],
};
// Jetons Bonus
const BONUS = [
  { id: 'tH', label: 'Cœur', sym: 'H' }, { id: 'tVP', label: '2 PV', vp: 2 }, { id: 'tCK', label: 'Cocarde', ck: 1 },
  { id: 'tS', label: 'Sourire', sym: 'S' }, { id: 'tG', label: 'Bourse', sym: 'G' }, { id: 'tB', label: 'Livre', sym: 'B' },
  { id: 'tW', label: 'Couleur au choix', wildColor: 1 },
  { id: 'tMb', label: '1 Minikin par carte bleue', mPer: 'blue' }, { id: 'tMg', label: '1 Minikin par carte verte', mPer: 'green' },
  { id: 'tMp', label: '1 Minikin par carte rose', mPer: 'pink' },
];
const FESTIVALS = [
  { n: 1, season: 'spring', name: 'Big Folk Clear-Out', fr: 'Révélez 2 cartes de plus dans l’offre.' },
  { n: 2, season: 'spring', name: 'Swap-a-Petal Fair', fr: 'Avant de prendre votre nouvelle carte, vous pouvez échanger 1 carte de votre main avec 1 carte de l’offre.' },
  { n: 3, season: 'spring', name: 'Under-the-Sofa Expedition', fr: 'Avant que le 1er joueur ne joue, chaque joueur pioche 1 carte.' },
  { n: 4, season: 'spring', name: 'Early Worm Market', fr: 'Vous pouvez jouer une carte de l’offre au lieu de votre main. Dans ce cas, vous ne prenez pas de nouvelle carte.' },
  { n: 5, season: 'summer', name: 'Lights-Out Party', fr: 'Tout le monde joue face cachée, puis on révèle. Égalités et effets ⚡ dans l’ordre du tour.' },
  { n: 6, season: 'summer', name: 'Kazoo Sing-Along', fr: 'Si vous jouez la même couleur que le joueur juste avant vous, votre carte vaut +3.' },
  { n: 7, season: 'summer', name: 'Great Gusty Day', fr: 'Avant que le 1er joueur ne joue, chacun passe 1 carte de sa main à son voisin de gauche.' },
  { n: 8, season: 'summer', name: 'Even Steven Hopscotch', fr: 'Les cartes paires sont classées avant les impaires.' },
  { n: 9, season: 'autumn', name: 'Tall Tales Night', fr: 'Si votre carte jouée vaut 11 à 20 : piochez 1 carte, puis remettez-en 1 sous la pioche.' },
  { n: 10, season: 'autumn', name: 'Buzz-Buzz Rally', fr: 'Les cartes à effet ⚡ valent +5 pour le classement.' },
  { n: 11, season: 'autumn', name: 'Slowpoke Cup', fr: 'La plus petite valeur gagne. La meilleure couleur reste prioritaire.' },
  { n: 12, season: 'autumn', name: 'Odd Sock Day', fr: 'Les cartes impaires sont classées avant les paires.' },
  { n: 13, season: 'winter', name: 'Topsy-Turvy Ball', fr: 'Les cartes de la meilleure couleur sont classées en dernier.' },
  { n: 14, season: 'winter', name: 'Follow-the-Leader Sledging', fr: 'La couleur jouée par le 1er joueur est la meilleure couleur.' },
  { n: 15, season: 'winter', name: 'Little Lights Night', fr: 'Les cartes de valeur 1 à 5 valent +5 pour le classement.' },
  { n: 16, season: 'winter', name: 'Cocoa and Blanket Day', fr: 'Pas d’offre cette manche : personne ne prend de nouvelle carte.' },
  { n: 17, season: 'newyear', name: 'Midnight Rush', fr: 'Avant le classement final, chaque joueur joue 1 carte de sa main dans sa ville.' },
  { n: 18, season: 'newyear', name: 'Less-Is-More Resolution', fr: 'Au classement final, le plus petit total de la meilleure couleur gagne. Sans cette couleur : dernier.' },
];
root.MK_DATA = { CITY, WILD, REWARDS, REWARD_IDS, GREY_REWARDS, ENDGAME, BONUS, FESTIVALS };
})(typeof window !== 'undefined' ? window : globalThis);
