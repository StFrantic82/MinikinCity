# -*- coding: utf-8 -*-
"""Génère les cartes Fête (recto + verso) en HTML imprimable."""
import sys
A = 'file:///home/claude/fetes/a/'
INK = '#3a2622'

# ---------- petites icônes SVG dans le style du jeu (contour brun épais) ----------
def svg(body, w=60, h=60, vb=None):
    vb = vb or f'0 0 {w} {h}'
    return f'<svg class="si" viewBox="{vb}" style="width:{w/10:.1f}mm;height:{h/10:.1f}mm">{body}</svg>'

ARROW = svg(f'<path d="M6 30 H44" stroke="{INK}" stroke-width="7" stroke-linecap="round"/>'
            f'<path d="M34 16 L50 30 L34 44" fill="none" stroke="{INK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>', 56, 60)
ARROW_LEFT = svg(f'<path d="M50 40 C50 14, 14 10, 12 30" fill="none" stroke="{INK}" stroke-width="7" stroke-linecap="round"/>'
                 f'<path d="M2 20 L12 34 L24 22" fill="none" stroke="{INK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>', 58, 50)
SHUFFLE = svg(f'<path d="M6 16 C26 16 30 44 52 44 M6 44 C26 44 30 16 52 16" fill="none" stroke="{INK}" stroke-width="6" stroke-linecap="round"/>'
              f'<path d="M44 8 L54 16 L44 24 M44 36 L54 44 L44 52" fill="none" stroke="{INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>', 60, 60)
DOWN = svg(f'<path d="M20 6 V40" stroke="{INK}" stroke-width="7" stroke-linecap="round"/>'
           f'<path d="M8 30 L20 44 L32 30" fill="none" stroke="{INK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>', 40, 50)
EQ = '<span class="op">=</span>'
X = '<span class="op x">x</span>'
SLASH = '<span class="op">/</span>'

def season_icon(s, size=64):
    o = f'stroke="{INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"'
    if s == 'printemps':   # pousse
        b = (f'<path d="M32 58 V30" {o} fill="none"/>'
             f'<path d="M32 34 C14 34 8 20 10 10 C24 10 32 18 32 34Z" fill="#8dc63f" {o}/>'
             f'<path d="M32 30 C48 30 56 18 54 6 C40 6 32 14 32 30Z" fill="#b5d94a" {o}/>'
             f'<path d="M18 58 H46" {o}/>')
    elif s == 'ete':       # soleil
        rays = ''.join(f'<path d="M32 4 V12" {o} transform="rotate({a} 32 32)"/>' for a in range(0, 360, 45))
        b = rays + f'<circle cx="32" cy="32" r="14" fill="#f9c22e" {o}/>'
    elif s == 'automne':   # feuille de chêne
        b = (f'<path d="M32 4 C40 8 38 14 44 14 C52 14 50 22 46 26 C54 28 54 36 46 38 C50 44 44 50 38 46 C38 52 34 56 32 56 C30 56 26 52 26 46 C20 50 14 44 18 38 C10 36 10 28 18 26 C14 22 12 14 20 14 C26 14 24 8 32 4Z" fill="#e0782c" {o}/>'
             f'<path d="M32 16 V62 M32 30 L40 24 M32 30 L24 24 M32 40 L40 34 M32 40 L24 34" fill="none" {o}/>')
    elif s == 'hiver':     # flocon
        arm = (f'<path d="M32 6 V58" {o}/><path d="M24 12 L32 20 L40 12 M24 52 L32 44 L40 52" fill="none" {o}/>')
        b = ''.join(f'<g transform="rotate({a} 32 32)">{arm}</g>' for a in (0, 60, 120))
        b = f'<circle cx="32" cy="32" r="27" fill="#e8f1ff" stroke="none"/>' + b.replace(INK, '#4a5aa8')
    else:                  # étoile du nouvel an
        b = (f'<path d="M32 4 L39 24 L60 24 L43 37 L49 58 L32 45 L15 58 L21 37 L4 24 L25 24Z" fill="#f4c84a" {o}/>')
    return f'<svg viewBox="0 0 64 64" style="width:{size/10:.1f}mm;height:{size/10:.1f}mm">{b}</svg>'

def img(name, h=7.2, extra=''):
    return f'<img src="{A}{name}.png" style="height:{h}mm" {extra}>'

def num(n, cls='n'):
    return f'<span class="{cls}">{n}</span>'

def card(name, label, h=8.4):
    """icône carte avec une petite étiquette dessus"""
    return (f'<span class="cardlab" style="height:{h}mm">{img(name, h)}'
            f'<span class="lab">{label}</span></span>')

def mk(n=None, h=7.0):
    return (num(n) if n is not None else '') + img('minikin', h)

CHECK_CARD = (f'<span class="cardlab" style="height:8.4mm">{img("cblank", 8.4)}'
              f'<span class="lab">{img("check", 4.2)}</span></span>')
FULL_CARD = (f'<span class="cardlab" style="height:8.4mm">{img("cblank", 8.4)}'
             f'<span class="lab dots">●●<br>●●</span></span>')
LAST = '<span class="tag">last</span>'
FIRST = '<span class="tag">1<sup>st</sup></span>'
MOST = '<span class="tag">max</span>'
LEAST = '<span class="tag">min</span>'

# ---------- les 16 fêtes + Nouvel An ----------
F = [
 # saison, clé, nom, ligne d'icônes, texte
 ('printemps', 'semis', 'Seedling Festival',
  CHECK_CARD + ARROW + mk(1),
  'If the card you play has Minikin spaces, immediately place 1&nbsp;Minikin from the supply on it.'),
 ('printemps', 'nettoyage', 'Spring Cleaning',
  num('+2') + img('deck', 8.4) + img('deck', 8.4),
  'The Big Folk are tidying up! Reveal 2&nbsp;extra cards in the open display.'),
 ('printemps', 'vent', 'Wind Festival',
  img('deck', 8.4) + ARROW_LEFT + '<span class="tag">left</span>',
  'After taking your new card, pass 1&nbsp;card from your hand to the player on your left.'),
 ('printemps', 'libellules', 'Dragonfly Parade',
  img('bolt', 7) + EQ + card('crain', '+5'),
  'Cards with an Instant effect <img class="inl" src="'+A+'bolt.png"> played this round get +5 for the ranking.'),

 ('ete', 'bain', 'The Big Splash',
  mk(1) + SLASH + LAST + mk(3),
  'Each player gains 1&nbsp;Minikin. The last player in the ranking gains 3 instead.'),
 ('ete', 'note', 'Lost Note Festival',
  img('cpink', 8) + img('cpink', 8) + ARROW + mk(1),
  'If you play the same color as the player just before you, you sing in chorus: gain 1&nbsp;Minikin.'),
 ('ete', 'lucioles', 'Firefly Night',
  img('deck', 8.4) + img('deck', 8.4) + img('deck', 8.4),
  'Play your cards face down, then reveal them all at once. Resolve Instant effects <img class="inl" src="'+A+'bolt.png"> in turn order.'),
 ('ete', 'concours', 'Prettiest House Contest',
  MOST + img('cockade', 7.4) + ARROW + img('bonus', 7.6),
  'The player with the most Cockades in their city takes a Bonus token. If tied, no one does.'),

 ('automne', 'recoltes', 'Harvest Festival',
  mk(1) + X + img('bag', 7),
  'Gain 1&nbsp;Minikin for each Bag symbol on the card you play.'),
 ('automne', 'contes', 'Storytelling Evening',
  num('1') + card('deck', '') + X + img('book', 7),
  'For each Book on the card you play, draw 1&nbsp;card, then place 1 card from your hand at the bottom of the deck.'),
 ('automne', 'chapeaux', 'Leaf Hat Festival',
  num('2') + img('minikin', 7) + ARROW + img('cblank', 8.4),
  'You may move up to 2&nbsp;Minikins from one card to another in your city.'),
 ('automne', 'escargots', 'Snail Race',
  card('cdash', '1') + '<span class="op">&gt;</span>' + card('cdash', '20'),
  'The lowest value wins! The best color still ranks first.'),

 ('hiver', 'lanternes', 'Lantern Night',
  LEAST + img('minikin', 7) + ARROW + mk(3),
  'The player with the fewest Minikins in their city gains 3. If tied, each tied player gains 3.'),
 ('hiver', 'the', 'Teatime',
  mk(1) + X + FULL_CARD + '<span class="tag">max 3</span>',
  'Gain 1&nbsp;Minikin for each fully filled City card in your city (maximum&nbsp;3).'),
 ('hiver', 'cadeaux', 'Gift Swap',
  img('deck', 8.4) + ARROW + SHUFFLE + ARROW + img('deck', 8.4),
  'Each player puts 1&nbsp;card from their hand face down in the center. Shuffle them and deal 1 back to each player.'),
 ('hiver', 'carnaval', 'Masquerade Carnival',
  img('ctri', 8.4) + DOWN + LAST,
  'Everything is topsy-turvy: cards of the best color are ranked last.'),
]
NY = [
 ('nouvelan', 'horloge', 'Midnight Chimes',
  FIRST + ARROW + num('+1') + img('cblank', 8.4),
  'The winner of the Endgame ranking plays 2&nbsp;cards from their hand instead of 1.'),
 ('nouvelan', 'horloge', 'Fireworks',
  card('cblank', '1-5') + ARROW + '<span class="tag">all</span>',
  'After the Endgame ranking, each player may play 1&nbsp;card of value 1 to 5 from their hand.'),
]
SEASON_NAME = {'printemps': 'Spring', 'ete': 'Summer', 'automne': 'Autumn', 'hiver': 'Winter', 'nouvelan': 'New Year'}

CSS = f'''
@font-face {{ font-family: Creampuff; src: url({A}creampuff.ttf); }}
@page {{ size: 73.8mm 67.3mm; margin: 0; }}
* {{ box-sizing: border-box; }}
body {{ margin: 0; font-family: 'Crimson Text', serif; color: {INK}; }}
.page {{ width: 73.8mm; height: 67.3mm; position: relative; page-break-after: always; overflow: hidden; }}
.crop {{ position: absolute; background: #000; }}
.card {{ position: absolute; left: 7.4mm; top: 7.4mm; width: 59.0mm; height: 52.5mm;
        background-size: 100% 100%; }}
.badge {{ position: absolute; left: 2.6mm; top: 2.4mm; width: 9mm; height: 9mm; border-radius: 2.4mm;
          background: #fff; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0.3mm 0 rgba(0,0,0,.12); }}
.badge svg {{ width: 6.6mm !important; height: 6.6mm !important; }}
.title {{ position: absolute; left: 13mm; top: 2.6mm; width: 27mm; font-weight: 700; font-size: 11pt;
          line-height: 0.95; letter-spacing: .1pt; }}
.sub {{ font-size: 7pt; font-style: italic; font-weight: 400; margin-top: .6mm; }}
.season {{ position: absolute; left: 13mm; font-size: 6pt; font-style: italic; opacity: .8; }}
.isl {{ position: absolute; right: 1mm; top: 0.6mm; width: 21.5mm; height: 19.5mm; object-fit: contain;
        filter: drop-shadow(0 .4mm .3mm rgba(0,0,0,.18)); }}
.fx {{ position: absolute; left: 3mm; right: 3mm; top: 23mm; height: 11mm; display: flex;
       align-items: center; justify-content: center; gap: 1.4mm; }}
.fx img, .fx svg {{ display: block; }}
.txt {{ position: absolute; left: 4.2mm; right: 4.2mm; top: 34.5mm; bottom: 3.6mm; font-size: 7.8pt;
        line-height: 1.08; text-align: center; display: flex; align-items: center; justify-content: center; }}
.n {{ font-family: Creampuff, 'Crimson Text'; font-size: 17pt; line-height: 1; margin-right: -.3mm; }}
.op {{ font-family: 'Crimson Text'; font-weight: 700; font-size: 17pt; line-height: 1; }}
.op.x {{ font-size: 15pt; }}
.tag {{ font-weight: 700; font-size: 7pt; background: #fff; border: .45mm solid {INK}; border-radius: 1.6mm;
        padding: .2mm 1.1mm; white-space: nowrap; }}
.tag sup {{ font-size: 5pt; }}
.cardlab {{ position: relative; display: inline-block; }}
.cardlab .lab {{ position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
                 font-family: Creampuff, 'Crimson Text'; font-size: 11pt; line-height: 1; }}
.inl {{ height: 3mm; vertical-align: -0.6mm; }}
.cardlab .lab.dots {{ font-family: 'Crimson Text'; font-size: 5.5pt; color: #6b8f2a; text-align: center; line-height: 1.05; }}
.back .medal {{ position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); width: 30mm; height: 30mm;
                border-radius: 50%; background: #fff; border: .9mm solid {INK}; display: flex; flex-direction: column;
                align-items: center; justify-content: center; box-shadow: 0 .6mm 0 rgba(0,0,0,.18); }}
.back .medal svg {{ width: 13mm !important; height: 13mm !important; }}
.back .medal b {{ font-size: 11pt; margin-top: .6mm; }}
.back .medal i {{ font-size: 6.5pt; }}
'''

def crops():
    s = ''
    for x in (7.4, 66.4):
        for (y0, y1) in ((0, 5.4), (61.9, 67.3)):
            s += f'<div class="crop" style="left:{x-0.1}mm;top:{y0}mm;width:.2mm;height:{y1-y0}mm"></div>'
    for y in (7.4, 59.9):
        for (x0, x1) in ((0, 5.4), (68.4, 73.8)):
            s += f'<div class="crop" style="top:{y-0.1}mm;left:{x0}mm;height:.2mm;width:{x1-x0}mm"></div>'
    return s

def front(f):
    s, key, name, fx, txt = f
    return (f'<div class="page">{crops()}<div class="card" style="background-image:url({A}bg_{s}.png)">'
            f'<div class="badge">{season_icon(s)}</div>'
            f'<div class="title">{name}' + ('<div class="sub">New Year</div>' if s=='nouvelan' else '') + '</div>'
            f'<img class="isl" src="{A}isl_{key}.png">'
            f'<div class="fx">{fx}</div><div class="txt"><span>{txt}</span></div></div></div>')

def back(s):
    return (f'<div class="page">{crops()}<div class="card back" style="background-image:url({A}back_{s}.png)">'
            f'<div class="medal">{season_icon(s)}<b>{SEASON_NAME[s]}</b><i>Minikin Festival</i></div></div></div>')

def doc(pages):
    return f'<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{"".join(pages)}</body></html>'

if __name__ == '__main__':
    out = '/home/claude/fetes/'
    open(out + 'recto.html', 'w').write(doc([front(f) for f in F] + [front(NY[0])]))
    # verso : même ordre de pages ; le Nouvel An est recto-verso (face B au dos de la face A)
    open(out + 'verso.html', 'w').write(doc([back(f[0]) for f in F] + [front(NY[1])]))
    # fichier titre seul pour la face A / B
    print('ok', len(F) + len(NY))
