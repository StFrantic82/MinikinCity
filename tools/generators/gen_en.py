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
    o = f'stroke="{INK}" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"'
    def face(cx, cy, sc=1.0, closed=False):
        e = (f'<path d="M{cx-6*sc} {cy} q2.2 -2.6 4.4 0 M{cx+1.6*sc} {cy} q2.2 -2.6 4.4 0" fill="none" stroke="{INK}" stroke-width="2.2" stroke-linecap="round"/>'
             if closed else f'<circle cx="{cx-4.5*sc}" cy="{cy}" r="{1.9*sc}" fill="{INK}"/><circle cx="{cx+4.5*sc}" cy="{cy}" r="{1.9*sc}" fill="{INK}"/>')
        return (e + f'<path d="M{cx-2.6*sc} {cy+3.6*sc} q{2.6*sc} {2.8*sc} {5.2*sc} 0" fill="none" stroke="{INK}" stroke-width="2" stroke-linecap="round"/>'
                f'<ellipse cx="{cx-8.4*sc}" cy="{cy+3.4*sc}" rx="{2.6*sc}" ry="{1.6*sc}" fill="#ff8fa3" opacity=".75"/>'
                f'<ellipse cx="{cx+8.4*sc}" cy="{cy+3.4*sc}" rx="{2.6*sc}" ry="{1.6*sc}" fill="#ff8fa3" opacity=".75"/>')
    defs = ('<defs>'
            '<linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9e35a"/><stop offset="1" stop-color="#6fae2c"/></linearGradient>'
            '<linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e98a52"/><stop offset="1" stop-color="#c25a2a"/></linearGradient>'
            '<radialGradient id="gs" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#ffe680"/><stop offset="1" stop-color="#f7a823"/></radialGradient>'
            '<linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6a84e"/><stop offset="1" stop-color="#b8702a"/></linearGradient>'
            '<linearGradient id="gw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfe3f5"/></linearGradient>'
            '<radialGradient id="gy" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#fff3a6"/><stop offset="1" stop-color="#f5b82e"/></radialGradient>'
            '</defs>')
    HL = 'fill="#ffffff" opacity=".55"'
    if s == 'printemps':   # petite pousse dans un pot souriant
        b = (f'<path d="M32 34 V22" {o} fill="none"/>'
             f'<path d="M31 24 C22 26 12 20 12 10 C22 8 30 14 31 24Z" fill="url(#gl)" {o}/>'
             f'<path d="M33 22 C40 24 52 18 52 8 C42 6 34 12 33 22Z" fill="url(#gl)" {o}/>'
             f'<ellipse cx="18" cy="13" rx="3" ry="1.6" transform="rotate(30 18 13)" {HL}/>'
             f'<path d="M14 33 H50 L46 59 Q46 61 44 61 H20 Q18 61 18 59Z" fill="url(#gp)" {o}/>'
             f'<rect x="11" y="30" width="42" height="8" rx="3" fill="#e2784a" {o}/>'
             f'<rect x="15" y="32" width="10" height="2.4" rx="1.2" {HL}/>' + face(32, 46, .95))
    elif s == 'ete':       # soleil content
        rays = ''.join(f'<path d="M32 2 Q36.5 9 32 13 Q27.5 9 32 2Z" fill="#ffb92e" {o} transform="rotate({a} 32 32)"/>' for a in range(0, 360, 45))
        b = rays + f'<circle cx="32" cy="32" r="17" fill="url(#gs)" {o}/><ellipse cx="25" cy="23" rx="4.5" ry="2.6" transform="rotate(-30 25 23)" {HL}/>' + face(32, 32, 1.0, closed=True)
    elif s == 'automne':   # gland avec son chapeau
        b = (f'<path d="M32 4 Q33 9 36 11" fill="none" {o}/>'
             f'<path d="M15 31 C15 44 22 58 32 60 C42 58 49 44 49 31Z" fill="url(#ga)" {o}/>'
             f'<path d="M10 30 C10 18 20 11 32 11 C44 11 54 18 54 30 C54 33 52 34 49 34 H15 C12 34 10 33 10 30Z" fill="#8a5a33" {o}/>'
             f'<path d="M18 22 l3 3 M26 18 l3 3 M35 18 l3 3 M43 22 l3 3 M22 28 l3 3 M31 25 l3 3 M40 27 l3 3" stroke="#5e3a1f" stroke-width="2" stroke-linecap="round"/>'
             f'<ellipse cx="21" cy="40" rx="2.4" ry="5" {HL}/>' + face(32, 44, .9))
    elif s == 'hiver':     # bonhomme de neige avec bonnet
        b = (f'<circle cx="32" cy="36" r="21" fill="url(#gw)" {o}/>'
             f'<path d="M14 27 C14 12 50 12 50 27 Z" fill="#5c9ad6" {o}/>'
             f'<rect x="11" y="24" width="42" height="7.5" rx="3.5" fill="#ffffff" {o}/>'
             f'<circle cx="32" cy="9" r="5" fill="#ffffff" {o}/>'
             f'<circle cx="26.5" cy="36" r="1.9" fill="{INK}"/><circle cx="37.5" cy="36" r="1.9" fill="{INK}"/>'
             f'<path d="M31.5 39.5 L41 41.5 L31.5 43.5Z" fill="#f08a34" stroke="{INK}" stroke-width="1.8" stroke-linejoin="round"/>'
             f'<path d="M28.5 46.5 q3.5 2.8 7 0" fill="none" stroke="{INK}" stroke-width="2" stroke-linecap="round"/>'
             f'<ellipse cx="22.5" cy="42" rx="2.6" ry="1.6" fill="#ff8fa3" opacity=".75"/><ellipse cx="41.5" cy="44" rx="2.6" ry="1.6" fill="#ff8fa3" opacity=".75"/>'
             f'<ellipse cx="20" cy="46" rx="2.4" ry="4" {HL}/>')
    else:                  # étoile du Nouvel An
        star = 'M32 4 L39.5 21 L58 23 L44 35.5 L48.5 54 L32 44.5 L15.5 54 L20 35.5 L6 23 L24.5 21Z'
        b = (f'<path d="{star}" fill="url(#gy)" {o}/><ellipse cx="25" cy="22" rx="3.6" ry="2" transform="rotate(-30 25 22)" {HL}/>'
             f'<path d="M55 6 v7 M51.5 9.5 h7" stroke="#f5b82e" stroke-width="2.6" stroke-linecap="round"/>'
             f'<path d="M8 50 v6 M5 53 h6" stroke="#ff8fa3" stroke-width="2.4" stroke-linecap="round"/>' + face(32, 32, .85))
    return f'<svg viewBox="0 0 64 64" style="width:{size/10:.1f}mm;height:{size/10:.1f}mm">{defs}{b}</svg>'

def img(name, h=7.2, extra=''):
    return f'<img src="{A}{name}.png" style="height:{h}mm" {extra}>'

def num(n, cls='n'):
    return f'<span class="{cls}">{n}</span>'

def card(name, label, h=8.4):
    """icône carte avec une petite étiquette dessus"""
    return (f'<span class="cardlab" style="height:{h}mm">{img(name, h)}'
            f'<span class="lab" style="{'font-size:7.5pt' if len(label)>3 else ''}">{label}</span></span>')

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

# ---------- final festival list ----------
UPARROW = (f'<svg viewBox="0 0 24 40" style="position:absolute;left:1.2mm;top:-3mm;width:3.4mm;height:5.6mm">'
           f'<path d="M12 2 L23 15 H16.5 V38 H7.5 V15 H1Z" fill="{INK}" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>')
REDX = (f'<svg viewBox="0 0 24 24" style="position:absolute;right:-1.2mm;bottom:-.6mm;width:3.4mm;height:3.4mm">'
        f'<path d="M5 5 L19 19 M19 5 L5 19" stroke="{INK}" stroke-width="7.5" stroke-linecap="round"/>'
        f'<path d="M5 5 L19 19 M19 5 L5 19" stroke="#d8323c" stroke-width="4.5" stroke-linecap="round"/></svg>')
DRAW = f'<span style="position:relative;display:inline-block;height:8.4mm">{img("deck", 8.4)}{UPARROW}</span>'
DRAWDISCARD = (f'<span style="position:relative;display:inline-block;height:9.4mm;width:11.4mm">'
               f'<span style="position:absolute;left:0;top:1mm">{DRAW}</span>'
               f'<span style="position:absolute;left:4.2mm;top:-.4mm">{img("ctri_wf", 9.4)}{REDX}</span></span>')

SWAP = svg(f'<path d="M8 20 H48 M38 10 L50 20 L38 30" fill="none" stroke="{INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'
           f'<path d="M52 42 H12 M22 32 L10 42 L22 52" fill="none" stroke="{INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>', 60, 60)
NODECK = (f'<span class="cardlab" style="height:8.4mm">{img("deck", 8.4)}'
          f'<span class="lab">{img("forbid", 6.4)}</span></span>')
BOLT_INL = '<img class="inl" src="' + A + 'bolt.png">'
DOWNARROW = (f'<svg viewBox="0 0 24 40" style="position:absolute;left:50%;transform:translateX(-50%);bottom:-3mm;width:3.4mm;height:5.6mm">'
             f'<path d="M12 38 L23 25 H16.5 V2 H7.5 V25 H1Z" fill="{INK}" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>')
def _wrap(inner, extra): return f'<span style="position:relative;display:inline-block;height:8.4mm">{inner}{extra}</span>'
HAND = img("ctri_wf", 8.4)
PLAY = _wrap(img("ctri_wf", 8.4), DOWNARROW)                 # jouer une carte de sa main
PLAYDISPLAY = _wrap(img("deck", 8.4), DOWNARROW)             # jouer une carte de la vitrine
NODRAW = _wrap(img("deck", 8.4), UPARROW + f'<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">{img("forbid", 6.4)}</span>')

BOLTCARD = (f'<span class="cardlab" style="height:8.4mm">{img("cblank", 8.4)}'
            f'<span class="lab">{img("boltplain", 4.6)}</span></span>')

def RANGE(a, b):
    return (f'<span class="cardlab" style="height:9.2mm">{img("ctri", 9.2)}'
            f'<span class="lab rng"><span>{a}</span><i></i><span>{b}</span></span></span>')

def WORD(w):
    return (f'<span class="cardlab" style="height:9.6mm">{img("cdash", 9.6)}'
            f'<span class="lab wordlab">{w}</span></span>')

def FADED(n, h=7.4):
    return ''.join(f'<img src="{A}deck.png" style="height:{h}mm;opacity:.35;margin-right:-1.6mm">' for _ in range(n))
PLUS = '<span class="op">+</span>'
ROUND = img('roundcard', 10)
def TRIWORD(w):
    return (f'<span class="cardlab" style="height:9.6mm">{img("ctri_wf", 9.6)}'
            f'<span class="lab wordlab">{w}</span></span>')
def DASH(label):
    return (f'<span class="cardlab" style="height:9mm"><svg viewBox="0 0 64 90" style="height:9mm;width:6.4mm;display:block">'
            f'<rect x="4" y="4" width="56" height="82" rx="10" fill="#e4e1dd" stroke="{INK}" stroke-width="5" stroke-dasharray="9 6"/></svg>'
            f'<span class="lab">{label}</span></span>')
def _circle_cards():
    cw, ch = 30, 42
    pos = [(80, 23), (132, 60), (80, 97), (28, 60)]
    imgs = ''.join(f'<image href="{A}deck.png" x="{x-cw/2}" y="{y-ch/2}" width="{cw}" height="{ch}"/>' for x, y in pos)
    arcs = ('M101 14 Q128 18 134 32', 'M136 88 Q130 106 104 108', 'M59 106 Q32 102 26 88', 'M24 32 Q30 14 57 12')
    paths = ''.join(f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="6" stroke-linecap="round" marker-end="url(#ah)"/>' for d in arcs)
    defs = (f'<defs><marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto-start-reverse">'
            f'<path d="M0 0 L10 5 L0 10Z" fill="{INK}"/></marker></defs>')
    return f'<svg viewBox="0 0 160 120" style="height:12.5mm;width:16.7mm;display:block">{defs}{paths}{imgs}</svg>'
CIRCLE = _circle_cards()
MOONS = {'Swap-a-Petal Fair'}
CORNER = {'Under-the-Sofa Expedition', 'Lights-Out Party', 'Midnight Rush', 'Great Gusty Day'}

F = [
 ('printemps', 'nettoyage', 'Big Folk Clear-Out',
  FADED(3) + '<span style="width:1.6mm"></span>' + PLUS + img('deck', 8.4) + img('deck', 8.4),
  'Reveal 2&nbsp;extra cards in the open display.'),
 ('printemps', 'semis', 'Swap-a-Petal Fair',
  DRAW + SWAP + HAND,
  'When you take your new card, you may first swap 1&nbsp;card from your hand with 1&nbsp;card of the open display.'),
 ('printemps', 'treasure', 'Under-the-Sofa Expedition',
  num('1') + DRAW,
  'Before the 1st player plays, each player draws 1&nbsp;card from the deck.'),
 ('printemps', 'recoltes', 'Early Worm Market',
  FADED(2) + '<span style="width:1.6mm"></span>' + PLAYDISPLAY + ARROW + NODRAW,
  'Optional: play a card from the open display instead of your hand. If you do, don’t take a new card this round.'),

 ('ete', 'lucioles', 'Lights-Out Party',
  PLAYDISPLAY,
  'Everyone plays a card face down, then all cards are revealed at once. Ties and Instant effects follow turn order.'),
 ('ete', 'note', 'Kazoo Sing-Along',
  HAND + EQ + HAND + ARROW + card('crain', '+3'),
  'If you play the same color as the player just before you, your card gets +3 for the ranking.'),
 ('ete', 'vent', 'Great Gusty Day',
  CIRCLE,
  'Before the 1st player plays, each player passes 1&nbsp;card from their hand to the player on their left.'),
 ('ete', 'hopscotch', 'Even Steven Hopscotch',
  TRIWORD('even') + '<span class="op">&gt;</span>' + TRIWORD('odd'),
  'Even-value cards rank before odd-value cards. Within each group, rank as usual.'),

 ('automne', 'contes', 'Tall Tales Night',
  img('rng_11_20', 9.4) + ARROW + DRAWDISCARD,
  'If the card you play is valued 11 to 20, draw 1&nbsp;card, then place 1&nbsp;card from your hand at the bottom of the deck.'),
 ('automne', 'libellules', 'Buzz-Buzz Rally',
  BOLTCARD + EQ + card('crain', '+5'),
  'Cards with an Instant effect ' + BOLT_INL + ' get +5 for the ranking.'),
 ('automne', 'escargots', 'Slowpoke Cup',
  DASH('1') + '<span class="op">&gt;</span>' + DASH('20'),
  'The lowest value wins. The best color still ranks first.'),
 ('automne', 'oddsock', 'Odd Sock Day',
  TRIWORD('odd') + '<span class="op">&gt;</span>' + TRIWORD('even'),
  'Odd-value cards rank before even-value cards. Within each group, rank as usual.'),

 ('hiver', 'carnaval', 'Topsy-Turvy Ball',
  ROUND + DOWN + LAST,
  'Cards of the best color are ranked last.'),
 ('hiver', 'sled', 'Follow-the-Leader Sledging',
  FIRST + img('ctri', 8.4) + EQ + '<span class="tag">best</span>',
  'The color of the card played by the 1st player is the best color this round.'),
 ('hiver', 'lanternes', 'Little Lights Night',
  img('rng_1_5', 9.4) + EQ + card('crain', '+5'),
  'Cards valued 1 to 5 get +5 for the ranking.'),
 ('hiver', 'the', 'Cocoa and Blanket Day',
  NODRAW,
  'There is no open display this round: no one takes a new card.'),
]
NY = [
 ('nouvelan', 'horloge', 'Midnight Rush',
  PLAY,
  'Before the Endgame ranking, each player plays 1&nbsp;card from their hand into their city.'),
 ('nouvelan', 'horloge', 'Less-Is-More Resolution',
  '<span class="tag">min</span>' + ROUND + ARROW + FIRST,
  'In the Endgame ranking, the lowest total of the best color wins. Players without that color rank last.'),
]
TAG = {'Big Folk Clear-Out': 'One giant’s junk is a Minikin’s treasure.', 'Swap-a-Petal Fair': 'A tulip for your thimble? Deal!', 'Under-the-Sofa Expedition': 'Lost buttons, crumbs… and adventure!', 'Early Worm Market': 'First come, first served (worms optional).', 'Lights-Out Party': 'Who’s dancing with whom? Nobody knows!', 'Kazoo Sing-Along': 'Hum the same tune, hum it louder!', 'Great Gusty Day': 'Hold on to your leaf hats!', 'Even Steven Hopscotch': 'Two by two, hop on through!', 'Tall Tales Night': 'The bigger the story, the better.', 'Buzz-Buzz Rally': 'Fastest wings win the ribbon!', 'Slowpoke Cup': 'Slow and steady wins the cup.', 'Odd Sock Day': 'Hooray for every sock without a pair!', 'Topsy-Turvy Ball': 'Up is down, and down is up!', 'Follow-the-Leader Sledging': 'Wheee! Just follow the leader!', 'Little Lights Night': 'The smallest lanterns shine the brightest.', 'Cocoa and Blanket Day': 'Far too snowy to go out today.', 'Midnight Rush': 'Quick, one last thing before midnight!', 'Less-Is-More Resolution': 'This year, I’ll travel light!'}
SEASON_NAME = {'printemps': 'Spring', 'ete': 'Summer', 'automne': 'Autumn', 'hiver': 'Winter', 'nouvelan': 'New Year'}

CSS = f'''
@font-face {{ font-family: Creampuff; src: url({A}creampuff.ttf); }}
@page {{ size: 60mm 60mm; margin: 0; }}
@font-face {{ font-family: YumeloMK; src: url({A}yumelo_mk.ttf); }}
@font-face {{ font-family: ComicB; src: url(file:///usr/share/fonts/truetype/google-fonts/ofl/comicrelief/ComicRelief-Bold.ttf); }}
.head {{ position: absolute; left: 12.6mm; right: 12.6mm; top: 5mm; height: 10.6mm; display: flex; flex-direction: column;
         align-items: center; justify-content: flex-start; text-align: center; }}
.head .title {{ position: static; width: auto; font-family: ComicB; font-weight: 700; font-size: 10.6pt;
                line-height: 1.08; color: #3b1f1d; -webkit-text-stroke: .3mm #3b1f1d; paint-order: stroke fill;
                filter: drop-shadow(.4mm .4mm 0 #fff) drop-shadow(-.18mm -.18mm 0 #fff) drop-shadow(.18mm -.18mm 0 #fff) drop-shadow(-.18mm .18mm 0 #fff); }}
.w {{ display: inline-block; white-space: nowrap; }}
.sp {{ display: inline-block; width: .22em; }}
.txt span, .head .title, .tagline {{ text-wrap: balance; }}
.txt {{ overflow: hidden; }}
.tagline {{ font-style: italic; font-size: 6.6pt; line-height: 1.05; margin-top: .7mm; color: #3b1f1d; }}
.yt {{ font-family: ComicB; font-weight: 700 !important; font-size: 12pt !important; -webkit-text-stroke: .3mm #3b1f1d; paint-order: stroke fill; color: #3b1f1d; }}

* {{ box-sizing: border-box; }}
body {{ margin: 0; font-family: 'Crimson Text', serif; color: {INK}; }}
.page {{ width: 60mm; height: 60mm; position: relative; page-break-after: always; overflow: hidden; }}
.crop {{ position: absolute; background: #000; }}
.card {{ position: absolute; left: 0; top: 0; width: 60mm; height: 60mm;
        background-size: 100% 100%; }}
.badge {{ position: absolute; left: 3.6mm; top: 5mm; width: 8.6mm; height: 8.6mm; border-radius: 2.4mm;
          background: #fff; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0.3mm 0 rgba(0,0,0,.12); }}
.badge svg {{ width: 7.4mm !important; height: 7.4mm !important; }}
.title {{ position: absolute; left: 13mm; top: 2.8mm; width: 23.5mm; font-weight: 700; font-size: 11pt;
          line-height: 0.95; letter-spacing: .1pt; }}
.sub {{ font-size: 7pt; font-style: italic; font-weight: 400; margin-top: .6mm; }}
.season {{ position: absolute; left: 13mm; font-size: 6pt; font-style: italic; opacity: .8; }}
.isl {{ position: absolute; left: 50%; transform: translateX(-50%); top: 15.9mm; width: 32mm; height: 14mm; object-fit: contain;
        filter: drop-shadow(0 .4mm .3mm rgba(0,0,0,.18)); }}
.fx {{ position: absolute; left: 3mm; right: 3mm; top: 31.6mm; height: 10.4mm; display: flex;
       align-items: center; justify-content: center; gap: 1.4mm; }}
.fx img, .fx svg {{ display: block; }}
.txt {{ position: absolute; left: 4.2mm; right: 4.2mm; top: 42.4mm; bottom: 3.6mm; font-size: 7.7pt;
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
.cardlab .lab.rng {{ flex-direction: column; font-family: 'Crimson Text'; font-weight: 700; font-size: 8.4pt; line-height: .95; gap: 0; }}
.cardlab .lab.rng i {{ display: block; width: 3.4mm; height: .35mm; background: #3b1f1d; transform: rotate(-14deg); margin: .25mm 0; }}
.cardlab .lab.wordlab {{ font-family: 'Crimson Text'; font-weight: 700; font-size: 6.6pt; letter-spacing: -.1pt; }}
.corner {{ position: absolute; left: 4.6mm; top: 23.6mm; height: 5.4mm; }}
.inl {{ height: 3mm; vertical-align: -0.6mm; }}
.cardlab .lab.dots {{ font-family: 'Crimson Text'; font-size: 5.5pt; color: #6b8f2a; text-align: center; line-height: 1.05; }}
.back .medal {{ position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); width: 30mm; height: 30mm;
                border-radius: 50%; background: #fff; border: .9mm solid {INK}; display: flex; flex-direction: column;
                align-items: center; justify-content: center; box-shadow: 0 .6mm 0 rgba(0,0,0,.18); }}
.back .medal svg {{ width: 15mm !important; height: 15mm !important; }}
.back .medal b {{ font-size: 11pt; margin-top: .6mm; }}
.back .medal i {{ font-size: 6.5pt; }}
'''

def crops():
    return ''
    s = ''
    for x in (7.4, 66.4):
        for (y0, y1) in ((0, 5.4), (61.9, 67.3)):
            s += f'<div class="crop" style="left:{x-0.1}mm;top:{y0}mm;width:.2mm;height:{y1-y0}mm"></div>'
    for y in (7.4, 59.9):
        for (x0, x1) in ((0, 5.4), (68.4, 73.8)):
            s += f'<div class="crop" style="top:{y-0.1}mm;left:{x0}mm;height:.2mm;width:{x1-x0}mm"></div>'
    return s

import random as _r
def bouncy(t, seed):
    r = _r.Random(seed); words = []
    for w in t.split(' '):
        s = ''
        for ch in w:
            s += (f'<span style="display:inline-block;transform:translateY({r.uniform(-.4,.4):.2f}mm) '
                  f'rotate({r.uniform(-6,6):.1f}deg)">{ch}</span>')
        words.append(f'<span class="w">{s}</span>')
    return '<span class="sp"></span>'.join(words)

def front(f):
    s, key, name, fx, txt = f
    return (f'<div class="page"><div class="card" style="background-image:url({A}sq_bg_{s}.png)">'
            f'<div class="badge">{season_icon(s)}</div>'
            f'<div class="head"><div class="title">{bouncy(name, len(name)*7+ord(name[0]))}</div><div class="tagline">{TAG[name]}</div></div>'
            f'<img class="isl" src="{A}isl_{key}.png">' +
            (f'<img class="corner" src="{A}bolt.png">' if name in CORNER else (f'<img class="corner" src="{A}moon.png">' if name in MOONS else '')) + f'<div class="fx">{fx}</div><div class="txt"><span>{txt}</span></div></div></div>')

def back(s):
    return (f'<div class="page">{crops()}<div class="card back" style="background-image:url({A}sq_back_{s}.png)">'
            f'<div class="medal">{season_icon(s)}<b class="yt">{bouncy(SEASON_NAME[s], 3)}</b><i>Minikin Festival</i></div></div></div>')

FIT = "<script>\ndocument.fonts.ready.then(()=>{\n const MM=96/25.4;\n document.querySelectorAll('.card').forEach(c=>{const im=c.querySelector('.isl');const fx=c.querySelector('.fx');if(!im||!fx)return;\n  const fxTop=()=>{let t=1e9;fx.querySelectorAll('img,svg').forEach(e=>{const r=e.getBoundingClientRect();if(r.height>0)t=Math.min(t,r.top);});return t;};\n  const drawnBottom=()=>{const r=im.getBoundingClientRect();const k=Math.min(r.width/im.naturalWidth,r.height/im.naturalHeight);\n    const h=im.naturalHeight*k;return r.top+(r.height+h)/2;};\n  let h=parseFloat(getComputedStyle(im).height)/MM;\n  while(drawnBottom()>fxTop()-1.0*MM && h>8){h-=0.3;im.style.height=h+'mm';}\n });document.querySelectorAll('.txt').forEach(b=>{const s=b.querySelector('span');let f=7.7;\n while((s.offsetHeight>b.clientHeight-1||s.scrollWidth>b.clientWidth)&&f>5.6){f-=0.1;s.style.fontSize=f+'pt';}});\n document.querySelectorAll('.head').forEach(h=>{let f=10.6,tf=6.6;const t=h.querySelector('.title'),tg=h.querySelector('.tagline');\n const lines=()=>Math.round(tg.offsetHeight/parseFloat(getComputedStyle(tg).lineHeight));\n while(tg.offsetHeight>tg.firstChild.parentElement.scrollHeight-0&&false){}\n while(tg.getClientRects().length&&tg.offsetHeight>(tf*1.05*96/72)*1.5&&tf>5.6){tf-=0.1;tg.style.fontSize=tf+'pt';}\n while(h.scrollHeight>h.clientHeight+1&&f>7){f-=0.2;t.style.fontSize=f+'pt';}});});\n</script>"

def doc(pages):
    return f'<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{"".join(pages)}{FIT}</body></html>'

if __name__ == '__main__':
    out = '/home/claude/fetes/'
    open(out + 'sq_front.html', 'w').write(doc([front(f) for f in F] + [front(n) for n in NY]))
    # verso : même ordre de pages ; le Nouvel An est recto-verso (face B au dos de la face A)
    open(out + 'sq_back.html', 'w').write(doc([back(f[0]) for f in F] + [back('nouvelan'), back('nouvelan')]))
    # fichier titre seul pour la face A / B
    print('ok', len(F) + len(NY))
