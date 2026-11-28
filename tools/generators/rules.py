# -*- coding: utf-8 -*-
"""Livret de règles de l'extension Festivals (HTML -> PDF via Chrome)."""
import random
R = 'file:///home/claude/rules/img/'
FA = 'file:///home/claude/fetes/a/'
M = 'file:///home/claude/img/M/'
INK = '#2c1a20'

SEASONS = [
    ('spring', 'Spring', ('#e6f3c4', '#b9df7a'), [1, 2, 3, 4]),
    ('summer', 'Summer', ('#fbf1a8', '#f4d64e'), [5, 6, 7, 8]),
    ('autumn', 'Autumn', ('#fbd9b4', '#f2a159'), [9, 10, 11, 12]),
    ('winter', 'Winter', ('#d6ebf8', '#86c0e6'), [13, 14, 15, 16]),
]
NAMES = ['Big Folk Clear-Out', 'Swap-a-Petal Fair', 'Under-the-Sofa Expedition', 'Early Worm Market',
         'Lights-Out Party', 'Kazoo Sing-Along', 'Great Gusty Day', 'Even Steven Hopscotch',
         'Tall Tales Night', 'Buzz-Buzz Rally', 'Slowpoke Cup', 'Odd Sock Day',
         'Topsy-Turvy Ball', 'Follow-the-Leader Sledging', 'Little Lights Night', 'Cocoa and Blanket Day',
         'Midnight Rush', 'Less-Is-More Resolution']
CLAR = [
 'The open display has <b>players + 3</b> cards. As usual, the cards left over go to the bottom of the deck.',
 'Done on your turn to take a card, in reverse ranking order. The card you give back can be taken by the next players.',
 'All players draw at the same time. Your hand grows by 1 card for the rest of the game, which matters for the Endgame ranking.',
 'Choose when it is your turn to play. A card played from the display is no longer available to the others. Playing from your hand stays allowed.',
 'All players choose and play their card at the same time. <b>Ties and Instant effects</b> are still resolved in turn order.',
 'The 1st player of the round never gets the bonus. The City card 21 has no color, so it never matches.',
 'All players pass at the same time. Choose your card before looking at the one you receive.',
 'Order: <b>even</b> cards of the best color, other even cards, <b>odd</b> cards of the best color, other odd cards.',
 'Resolve it right after playing your card. The City card 21 does not count.',
 'The +5 only counts for the ranking, never for card effects.',
 'Cards of the best color from <b>lowest to highest</b>, then the other cards from lowest to highest. New cards are still chosen from the bottom of the ranking up.',
 'The mirror of Even Steven Hopscotch: <b>odd</b> cards rank before even cards.',
 'Other cards first (highest value first), then the cards of the best color (highest value first).',
 'This color replaces the color of the Reward card. If the 1st player plays the City card 21, there is no best color this round.',
 'The +5 only counts for the ranking, never for card effects.',
 'Skip step 1 (create the display) and step 3 (take a new card).',
 'All players play at the same time. Resolve Instant effects and place Minikins as usual. That card no longer counts for the Endgame ranking.',
 'Players with a total of 0 are tied last; break the tie as usual, in the order in which hands are revealed.',
]


def card(n, w):  # n = 1..18
    return f'<img class="cardimg" src="{R}f-{n:02d}.png" style="width:{w}mm">'


def back(n, w):
    return f'<img class="cardimg" src="{R}b-{n:02d}.png" style="width:{w}mm">'


def banner(text, c1='#f7ef98', c2='#cdeadb', size=15):
    return (f'<div class="banner"><div class="pill" style="background:linear-gradient(90deg,{c1},{c2})"></div>'
            f'<span class="bt" style="font-size:{size}pt">{text}</span></div>')


def step(n):
    return f'<span class="step">{n}</span>'


def page(body, num=None, cls=''):
    pn = f'<div class="pnum {"l" if num and num % 2 == 0 else "r"}">{num}</div>' if num else ''
    return f'<section class="page {cls}">{body}{pn}</section>'


CSS = f'''
@font-face {{ font-family: Yum; src: url({FA}yumelo_full.ttf); }}
@font-face {{ font-family: ComicB; src: url(file:///usr/share/fonts/truetype/google-fonts/ofl/comicrelief/ComicRelief-Bold.ttf); }}
@page {{ size: 135mm 195mm; margin: 0; }}
* {{ box-sizing: border-box; }}
body {{ margin: 0; font-family: 'DM Sans', sans-serif; color: {INK}; font-size: 8.6pt; line-height: 1.32; }}
b {{ font-weight: 700; }}
.page {{ width: 135mm; height: 195mm; position: relative; overflow: hidden; page-break-after: always;
        background: radial-gradient(ellipse at 50% 45%, #fbf8f8, #f6f0f0 70%); padding: 12mm 12mm 14mm; }}

.banner {{ position: relative; height: 11mm; display: flex; align-items: center; justify-content: center; margin: 0 0 4mm; }}
.banner .pill {{ position: absolute; left: 6mm; right: 6mm; top: 2mm; bottom: 2mm; border-radius: 6mm; filter: blur(.5mm); opacity: .95; }}
.bt {{ position: relative; font-family: Yum; text-transform: uppercase; letter-spacing: .4pt; color: {INK};
       -webkit-text-stroke: .9mm #fff; paint-order: stroke fill; }}
h3 {{ font-family: Yum; text-transform: uppercase; font-weight: 400; font-size: 9.6pt; margin: 3.2mm 0 1.2mm; letter-spacing: .3pt; }}
p {{ margin: 0 0 2mm; }}
.cap {{ font-style: italic; font-size: 7.6pt; line-height: 1.25; }}
.step {{ display: inline-flex; width: 5mm; height: 5mm; border-radius: 50%; background: #f4d64e; border: .35mm solid {INK};
         align-items: center; justify-content: center; font-family: Yum; font-size: 8pt; margin-right: 1.6mm; flex: none;
         position: relative; top: -.2mm; }}
.steps {{ list-style: none; padding: 0; margin: 0; }}
.steps li {{ display: flex; align-items: flex-start; margin-bottom: 1.8mm; }}
.pnum {{ position: absolute; bottom: 6mm; width: 8mm; height: 8mm; border-radius: 50%; background: #8cc152; border: .45mm solid {INK};
         display: flex; align-items: center; justify-content: center; font-family: Yum; font-size: 11pt; color: #fff;
         -webkit-text-stroke: .6mm {INK}; paint-order: stroke fill; }}
.pnum.l {{ left: 8mm; }} .pnum.r {{ right: 8mm; }}
.cardimg {{ display: block; filter: drop-shadow(0 .6mm .8mm rgba(60,30,30,.25)); }}
.row {{ display: flex; gap: 3mm; align-items: flex-start; }}
.poem {{ font-style: italic; text-align: center; font-size: 8.4pt; line-height: 1.4; }}
.grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 3.5mm 5mm; }}
.entry .cardimg {{ margin: 0 auto 1.6mm; }}
.entry .cap {{ text-align: center; text-wrap: balance; }}
.lead {{ font-size: 9pt; }}
.note {{ background: rgba(255,255,255,.7); border-radius: 3mm; padding: 2.4mm 3mm; margin-top: 2mm; }}
.callout {{ position: absolute; width: 4.6mm; height: 4.6mm; border-radius: 50%; background: #f4d64e; border: .35mm solid {INK};
            display: flex; align-items: center; justify-content: center; font-family: Yum; font-size: 7.5pt;
            box-shadow: 0 .3mm 0 rgba(0,0,0,.15); }}
'''


def cover():
    fan = ''
    picks = [(2, -16, -36), (6, -7, -18), (9, 0, 0), (13, 7, 18), (17, 16, 36)]
    for n, rot, dx in picks:
        fan += (f'<img src="{R}f-{n:02d}.png" style="position:absolute;width:40mm;left:calc(50% - 20mm + {dx}mm);'
                f'top:{abs(rot)*0.45}mm;transform:rotate({rot}deg);filter:drop-shadow(0 .8mm 1.2mm rgba(60,30,30,.3))">')
    body = f'''
    <div style="text-align:center;margin-top:2mm"><img src="{R}logo.png" style="width:78mm"></div>
    <div style="margin-top:1mm">{banner('Festivals', '#f7ef98', '#f6b9cf', 26)}</div>
    <p style="text-align:center;font-family:Yum;text-transform:uppercase;font-size:8pt;letter-spacing:.8pt;margin-top:-2mm">Expansion</p>
    <div style="position:relative;height:66mm;margin-top:4mm">{fan}</div>
    <div class="poem" style="margin-top:6mm">Spring sweeps out the giants’ lair,<br>summer dances in the air,<br>
    autumn spins its tallest tales,<br>winter sleds down snowy trails.</div>'''
    return page(body, cls='cover')


def intro_components():
    backs = ''.join(back(n, 17.5) for n in (1, 5, 9, 13, 17))
    body = f'''
    {banner('A year in Minikin City')}
    <p class="lead">In teacup halls and thimble chairs, the Minikins never miss a chance to celebrate.
    Lost buttons become party hats, a kazoo becomes an orchestra and a sofa cushion becomes an expedition.</p>
    <p>With this expansion, <b>each round of Minikin City brings a Festival</b> that bends one rule of the game for that
    round only. A Minikin year lasts <b>8 months</b>, two per season: spring, summer, autumn and winter.
    Then everyone gathers for a <b>New Year</b> party during the final ranking.</p>
    {banner('Components')}
    <p><b>18 Festival cards</b>: 4 for each season and 2 for the New Year. The season is shown on the back of the card
    and by the icon in its top-left corner.</p>
    <div class="row" style="justify-content:center;gap:2.4mm;margin:3mm 0 1.6mm">{backs}</div>
    <div class="row cap" style="justify-content:center;gap:2.4mm;text-align:center">
      <span style="width:17.5mm">Spring</span><span style="width:17.5mm">Summer</span><span style="width:17.5mm">Autumn</span>
      <span style="width:17.5mm">Winter</span><span style="width:17.5mm">New Year</span></div>
    <div class="row" style="justify-content:center;margin-top:5mm;gap:4mm">{card(1, 33)}{card(7, 33)}{card(14, 33)}</div>
    '''
    return page(body, 2)


def setup():
    P, G, B = 'p01_000', 'p04_040', 'p07_088'
    order = [P, G, B, G, P, B, B, G]      # 3 of each color: the 3rd pink card is under the Endgame tile
    ninth = P
    seasons_of = ['spring'] * 2 + ['summer'] * 2 + ['autumn'] * 2 + ['winter'] * 2
    backs = {'spring': 1, 'summer': 5, 'autumn': 9, 'winter': 13}
    cols = ''
    for i in range(8):
        cols += (f'<div class="sc"><img src="{R}b-{backs[seasons_of[i]]:02d}.png" class="sfc">'
                 f'<img src="{M}{order[i]}_697x1087.png" class="src"><span class="sn">{i+1}</span></div>')
    cols += (f'<div class="sc"><img src="{R}b-17.png" class="sfc">'
             f'<div class="src tile"><img class="under" src="{M}{ninth}_697x1087.png"><img class="over" src="{R}endtile.png"></div>'
             f'<span class="sn">9</span></div>')
    labels = ''.join(f'<span style="grid-column:span 2;background:{c[1]}">{name}</span>'
                     for _, name, c, _ in SEASONS) + f'<span style="background:linear-gradient(90deg,#f6b9cf,#f4d64e,#b9df7a,#86c0e6)">New Year</span>'
    body = f'''
    {banner('Setup')}
    <p>Set up Minikin City as usual, then:</p>
    <ul class="steps">
      <li>{step(1)}<span>Sort the Festival cards by their back and <b>shuffle each season separately</b>.</span></li>
      <li>{step(2)}<span>Place <b>2 Spring cards</b> face down above the Reward cards of rounds 1 and 2.</span></li>
      <li>{step(3)}<span>Place <b>2 Summer cards</b> face down above rounds 3 and 4.</span></li>
      <li>{step(4)}<span>Place <b>2 Autumn cards</b> face down above rounds 5 and 6.</span></li>
      <li>{step(5)}<span>Place <b>2 Winter cards</b> face down above rounds 7 and 8.</span></li>
      <li>{step(6)}<span>Place <b>1 New Year card</b> face down above the Endgame tile.</span></li>
      <li>{step(7)}<span>Return the unused Festival cards to the box without looking at them.</span></li>
    </ul>
    <div class="setupgrid">{cols}</div>
    <div class="slabels">{labels}</div>
    <p class="cap" style="margin-top:2.4mm">The 9th Reward card stays under the Endgame tile, as in the base game. Each game uses 9 of the 18 Festival cards, so no two years in Minikin City are alike.</p>
    <style>
      .setupgrid {{ display: grid; grid-template-columns: repeat(9, 1fr); gap: 1.2mm; margin-top: 4mm; }}
      .sc {{ position: relative; display: flex; flex-direction: column; align-items: center; }}
      .sfc {{ width: 11mm; display: block; filter: drop-shadow(0 .4mm .5mm rgba(60,30,30,.25)); margin-bottom: 1.4mm; }}
      .src {{ width: 11mm; height: 17.2mm; object-fit: contain; display: block;
              filter: drop-shadow(0 .4mm .5mm rgba(60,30,30,.25)); }}
      .src.tile {{ position: relative; }}
      .src.tile .under {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }}
      .src.tile .over {{ position: absolute; left: 50%; top: 50%; width: 15.6mm; transform: translate(-50%,-50%) rotate(90deg); filter: drop-shadow(0 .3mm .4mm rgba(0,0,0,.3)); }}
      .sn {{ font-family: Yum; font-size: 8pt; margin-top: 1mm; }}
      .slabels {{ display: grid; grid-template-columns: repeat(9, 1fr); gap: 1.2mm; margin-top: 1mm; }}
      .slabels span {{ font-family: Yum; text-transform: uppercase; font-size: 6pt; text-align: center; border-radius: 2mm;
                       padding: .6mm 0; letter-spacing: .3pt; }}
    </style>'''
    return page(body, 3)


def gameplay():
    s = 64 / 60
    pts = [(1, 1.2, 2.6), (2, 47.5, 4.4), (3, 49, 10.6), (4, 0.6, 21.4), (5, 20.5, 34.2), (6, 1.6, 46.5)]
    calls = ''.join(f'<span class="callout" style="left:{x*s}mm;top:{y*s}mm">{n}</span>' for n, x, y in pts)
    body = f'''
    {banner('Gameplay')}
    <p>At the start of each round, <b>before creating the open display</b>, reveal the Festival card above that round’s
    Reward card and read it aloud. Then play the round as usual, applying the Festival.</p>
    <ul class="steps">
      <li>{step('•')}<span>A Festival <b>only lasts for its own round</b>. Leave it face up so everyone can see which month it is.</span></li>
      <li>{step('•')}<span>A Festival changes only what it says. If it contradicts the base rules, the <b>Festival wins</b>.</span></li>
      <li>{step('•')}<span><b>Corner icons:</b> a Festival with the <img src="{FA}bolt.png" style="height:3.4mm;vertical-align:-.8mm"> icon is done by all players at the same time. A Festival with the <img src="{FA}moon.png" style="height:3.4mm;vertical-align:-.8mm"> icon applies at the end of the round, when players take a new card.</span></li>
      <li>{step('•')}<span><b>New Year:</b> reveal the New Year card after round 8, before the Endgame tile ranking, and apply it to that ranking.</span></li>
    </ul>
    <h3>Anatomy of a Festival card</h3>
    <div class="row" style="gap:5mm;align-items:center">
      <div style="position:relative;width:64mm;flex:none">{card(3, 64)}{calls}</div>
      <ol class="cap" style="padding-left:4mm;margin:0;font-style:normal;font-size:7.8pt;line-height:1.35">
        <li><b>Season</b>, also shown on the back.</li>
        <li><b>Name</b> of the Festival.</li>
        <li><b>Tagline</b>, just for fun.</li>
        <li><b>Instant icon</b>: all players do it at the same time, not one after the other.</li>
        <li><b>Effect</b> in icons, using the symbols of Minikin City.</li>
        <li><b>Effect</b> in words.</li>
      </ol>
    </div>
    <div class="note"><b>Remember:</b> a tricolor card is a card from your hand, the back of a card is the deck or the open
    display, an arrow up means <i>take</i> and an arrow down means <i>play</i>.</div>'''
    return page(body, 4)


def season_page(key, name, colors, nums, pnum):
    entries = ''.join(f'<div class="entry">{card(n, 50)}<p class="cap">{CLAR[n-1]}</p></div>' for n in nums)
    body = f'''{banner(name + ' Festivals', colors[0], colors[1])}<div class="grid">{entries}</div>'''
    return page(body, pnum)


def newyear_wf():
    entries = ''.join(f'<div class="entry">{card(n, 46)}<p class="cap">{CLAR[n-1]}</p></div>' for n in (17, 18))
    body = f'''
    {banner('New Year', '#f6b9cf', '#b9d8f2')}
    <div class="grid">{entries}</div>
    {banner('Playing with Wild Friends', '#f7ef98', '#cdeadb', 12)}
    <p>Festivals combine with the Wild Friends expansion. The <b>grey Reward card</b> has no best color:</p>
    <ul class="steps cap" style="font-style:normal">
      <li>{step('•')}<span>Slowpoke Cup, Even Steven Hopscotch, Odd Sock Day, Buzz-Buzz Rally and Little Lights Night apply to the value-only ranking.</span></li>
      <li>{step('•')}<span>Follow-the-Leader Sledging: the 1st player’s color becomes the best color, even on the grey card.</span></li>
      <li>{step('•')}<span>Topsy-Turvy Ball has no effect on the grey card.</span></li>
      <li>{step('•')}<span>Less-Is-More Resolution with the grey card under the Endgame tile: the lowest total of the whole hand wins.</span></li>
      <li>{step('•')}<span>Wild Friends cards with an Instant effect count for Buzz-Buzz Rally.</span></li>
    </ul>
    <p class="cap" style="text-align:center;margin-top:3mm">Game design: Matthieu Verdier, Simone Luciani · Illustrations: Kerri Aitken · Cranio Creations</p>'''
    return page(body, 9)


pages = [cover(), intro_components(), setup(), gameplay()]
for i, (k, n, c, nums) in enumerate(SEASONS):
    pages.append(season_page(k, n, c, nums, 5 + i))
pages.append(newyear_wf())
html = f'<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{"".join(pages)}</body></html>'
open('/home/claude/rules/rules.html', 'w').write(html)
print('ok', len(pages))
