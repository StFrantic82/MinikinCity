# -*- coding: utf-8 -*-
"""Livret de règles de l'extension Festivals (HTML -> PDF via Chrome)."""
import random
R = 'file:///home/claude/rules/img/'
FA = 'file:///home/claude/fetes/a/'
M = 'file:///home/claude/img/M/'
INK = '#2c1a20'

SEASONS = [
    ('spring', 'Printemps', ('#e6f3c4', '#b9df7a'), [1, 2, 3, 4]),
    ('summer', 'Été', ('#fbf1a8', '#f4d64e'), [5, 6, 7, 8]),
    ('autumn', 'Automne', ('#fbd9b4', '#f2a159'), [9, 10, 11, 12]),
    ('winter', 'Hiver', ('#d6ebf8', '#86c0e6'), [13, 14, 15, 16]),
]
NAMES = ['Big Folk Clear-Out', 'Swap-a-Petal Fair', 'Under-the-Sofa Expedition', 'Early Worm Market',
         'Lights-Out Party', 'Kazoo Sing-Along', 'Great Gusty Day', 'Even Steven Hopscotch',
         'Tall Tales Night', 'Buzz-Buzz Rally', 'Slowpoke Cup', 'Odd Sock Day',
         'Topsy-Turvy Ball', 'Follow-the-Leader Sledging', 'Little Lights Night', 'Cocoa and Blanket Day',
         'Midnight Rush', 'Less-Is-More Resolution']
CLAR = [
 'L’offre compte <b>nombre de joueurs + 3</b> cartes. Comme d’habitude, les cartes restantes vont sous la pioche.',
 'Se fait à votre tour de prendre une carte, dans l’ordre inverse du classement. La carte que vous rendez peut être prise par les joueurs suivants.',
 'Tous les joueurs piochent en même temps. Votre main compte 1 carte de plus jusqu’à la fin de la partie, ce qui compte pour le classement final.',
 'Décidez-le à votre tour de jouer. Une carte jouée depuis l’offre n’est plus disponible pour les autres. Jouer une carte de sa main reste possible.',
 'Tous les joueurs choisissent et posent leur carte en même temps. <b>Les égalités et les effets instantanés</b> se résolvent toujours dans l’ordre du tour.',
 'Le 1er joueur de la manche ne reçoit jamais le bonus. La carte Ville 21 n’a pas de couleur : elle ne correspond jamais.',
 'Tous les joueurs donnent en même temps. Choisissez votre carte avant de regarder celle que vous recevez.',
 'Ordre : cartes <b>paires</b> de la meilleure couleur, autres cartes paires, cartes <b>impaires</b> de la meilleure couleur, autres cartes impaires.',
 'Se résout juste après avoir joué votre carte. La carte Ville 21 ne compte pas.',
 'Le +5 ne compte que pour le classement, jamais pour les effets des cartes.',
 'Cartes de la meilleure couleur <b>de la plus faible à la plus forte</b>, puis les autres cartes de la plus faible à la plus forte. Les nouvelles cartes se prennent toujours du bas du classement vers le haut.',
 'Le miroir d’Even Steven Hopscotch : les cartes <b>impaires</b> passent avant les paires.',
 'D’abord les autres cartes (de la plus forte à la plus faible), puis les cartes de la meilleure couleur (de la plus forte à la plus faible).',
 'Cette couleur remplace celle de la carte Récompense. Si le 1er joueur joue la carte Ville 21, il n’y a pas de meilleure couleur cette manche.',
 'Le +5 ne compte que pour le classement, jamais pour les effets des cartes.',
 'Sautez l’étape 1 (créer l’offre) et l’étape 3 (prendre une nouvelle carte).',
 'Tous les joueurs jouent en même temps. Résolvez les effets instantanés et placez les Minikins comme d’habitude. Cette carte ne compte plus pour le classement final.',
 'Les joueurs à 0 sont à égalité en dernière position ; départagez-les comme d’habitude, dans l’ordre où les mains sont révélées.',
]


TITLES = {'spring': 'Fêtes du printemps', 'summer': 'Fêtes de l’été', 'autumn': 'Fêtes de l’automne', 'winter': 'Fêtes de l’hiver'}


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
    <p style="text-align:center;font-family:Yum;text-transform:uppercase;font-size:8pt;letter-spacing:.8pt;margin-top:-2mm">Extension</p>
    <div style="position:relative;height:66mm;margin-top:4mm">{fan}</div>
    <div class="poem" style="margin-top:6mm">Le printemps fait le ménage,<br>l’été danse sur la plage,<br>
    l’automne conte ses histoires,<br>l’hiver glisse jusqu’au soir.</div>'''
    return page(body, cls='cover')


def intro_components():
    backs = ''.join(back(n, 17.5) for n in (1, 5, 9, 13, 17))
    body = f'''
    {banner('Une année à Minikin City')}
    <p class="lead">Dans leurs salons en tasses de thé, sur leurs chaises en dés à coudre, les Minikins ne ratent jamais
    une occasion de faire la fête. Un bouton perdu devient un chapeau de fête, un kazoo un orchestre, et un coussin de
    canapé une expédition.</p>
    <p>Avec cette extension, <b>chaque manche de Minikin City apporte une Fête</b> qui modifie une règle du jeu, pour
    cette manche seulement. Une année Minikin dure <b>8 mois</b>, deux par saison : printemps, été, automne et hiver.
    Puis tout le monde se retrouve pour fêter le <b>Nouvel An</b> lors du classement final.</p>
    {banner('Matériel')}
    <p><b>18 cartes Fête</b> : 4 par saison et 2 pour le Nouvel An. La saison est indiquée au dos de la carte
    et par l’icône en haut à gauche de sa face.</p>
    <div class="row" style="justify-content:center;gap:2.4mm;margin:3mm 0 1.6mm">{backs}</div>
    <div class="row cap" style="justify-content:center;gap:2.4mm;text-align:center">
      <span style="width:17.5mm">Printemps</span><span style="width:17.5mm">Été</span><span style="width:17.5mm">Automne</span>
      <span style="width:17.5mm">Hiver</span><span style="width:17.5mm">Nouvel An</span></div>
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
                     for _, name, c, _ in SEASONS) + f'<span style="background:linear-gradient(90deg,#f6b9cf,#f4d64e,#b9df7a,#86c0e6)">Nouvel An</span>'
    body = f'''
    {banner('Mise en place')}
    <p>Installez Minikin City comme d’habitude, puis :</p>
    <ul class="steps">
      <li>{step(1)}<span>Triez les cartes Fête selon leur dos et <b>mélangez chaque saison séparément</b>.</span></li>
      <li>{step(2)}<span>Placez <b>2 cartes Printemps</b> face cachée au-dessus des cartes Récompense des manches 1 et 2.</span></li>
      <li>{step(3)}<span>Placez <b>2 cartes Été</b> face cachée au-dessus des manches 3 et 4.</span></li>
      <li>{step(4)}<span>Placez <b>2 cartes Automne</b> face cachée au-dessus des manches 5 et 6.</span></li>
      <li>{step(5)}<span>Placez <b>2 cartes Hiver</b> face cachée au-dessus des manches 7 et 8.</span></li>
      <li>{step(6)}<span>Placez <b>1 carte Nouvel An</b> face cachée au-dessus de la tuile de fin de partie.</span></li>
      <li>{step(7)}<span>Remettez les cartes Fête inutilisées dans la boîte sans les regarder.</span></li>
    </ul>
    <div class="setupgrid">{cols}</div>
    <div class="slabels">{labels}</div>
    <p class="cap" style="margin-top:2.4mm">La 9<sup>e</sup> carte Récompense reste sous la tuile de fin de partie, comme dans le jeu de base. Chaque partie utilise 9 des 18 cartes Fête : aucune année à Minikin City ne ressemble à une autre.</p>
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
    {banner('Déroulement')}
    <p>Au début de chaque manche, <b>avant de créer l’offre</b>, révélez la carte Fête placée au-dessus de la carte
    Récompense de cette manche et lisez-la à voix haute. Jouez ensuite la manche normalement, en appliquant la Fête.</p>
    <ul class="steps">
      <li>{step('•')}<span>Une Fête <b>ne dure que le temps de sa manche</b>. Laissez-la face visible pour que chacun voie le mois en cours.</span></li>
      <li>{step('•')}<span>Une Fête ne change que ce qu’elle indique. Si elle contredit les règles de base, <b>la Fête l’emporte</b>.</span></li>
      <li>{step('•')}<span><b>Icônes de coin :</b> une Fête avec l’icône <img src="{FA}bolt.png" style="height:3.4mm;vertical-align:-.8mm"> se fait par tous les joueurs en même temps. Une Fête avec l’icône <img src="{FA}moon.png" style="height:3.4mm;vertical-align:-.8mm"> s’applique en fin de manche, quand les joueurs prennent une nouvelle carte.</span></li>
      <li>{step('•')}<span><b>Nouvel An :</b> révélez la carte Nouvel An après la manche 8, avant le classement de la tuile de fin de partie, et appliquez-la à ce classement.</span></li>
    </ul>
    <h3>Anatomie d’une carte Fête</h3>
    <div class="row" style="gap:5mm;align-items:center">
      <div style="position:relative;width:64mm;flex:none">{card(3, 64)}{calls}</div>
      <ol class="cap" style="padding-left:4mm;margin:0;font-style:normal;font-size:7.8pt;line-height:1.35">
        <li><b>Saison</b>, aussi indiquée au dos.</li>
        <li><b>Nom</b> de la Fête.</li>
        <li><b>Phrase d’accroche</b>, juste pour le plaisir.</li>
        <li><b>Icône de coin</b> : tous les joueurs le font en même temps.</li>
        <li><b>Effet</b> en icônes, avec les symboles de Minikin City.</li>
        <li><b>Effet</b> en toutes lettres.</li>
      </ol>
    </div>
    <div class="note"><b>À retenir :</b> une carte tricolore est une carte de votre main, un dos de carte représente la
    pioche ou l’offre, une flèche vers le haut signifie <i>prendre</i> et une flèche vers le bas <i>jouer</i>.</div>'''
    return page(body, 4)


def season_page(key, name, colors, nums, pnum):
    entries = ''.join(f'<div class="entry">{card(n, 50)}<p class="cap">{CLAR[n-1]}</p></div>' for n in nums)
    body = f'''{banner(TITLES[key], colors[0], colors[1])}<div class="grid">{entries}</div>'''
    return page(body, pnum)


def newyear_wf():
    entries = ''.join(f'<div class="entry">{card(n, 46)}<p class="cap">{CLAR[n-1]}</p></div>' for n in (17, 18))
    body = f'''
    {banner('Nouvel An', '#f6b9cf', '#b9d8f2')}
    <div class="grid">{entries}</div>
    {banner('Avec Wild Friends', '#f7ef98', '#cdeadb', 13)}
    <p>Les Fêtes se combinent avec l’extension Wild Friends. La <b>carte Récompense grise</b> n’a pas de meilleure couleur :</p>
    <ul class="steps cap" style="font-style:normal">
      <li>{step('•')}<span>Slowpoke Cup, Even Steven Hopscotch, Odd Sock Day, Buzz-Buzz Rally et Little Lights Night s’appliquent au classement par valeur seule.</span></li>
      <li>{step('•')}<span>Follow-the-Leader Sledging : la couleur du 1er joueur devient la meilleure couleur, même sur la carte grise.</span></li>
      <li>{step('•')}<span>Topsy-Turvy Ball n’a aucun effet sur la carte grise.</span></li>
      <li>{step('•')}<span>Less-Is-More Resolution avec la carte grise sous la tuile de fin de partie : le plus petit total de toute la main gagne.</span></li>
      <li>{step('•')}<span>Les cartes Wild Friends à effet instantané comptent pour Buzz-Buzz Rally.</span></li>
    </ul>
    <p class="cap" style="text-align:center;margin-top:3mm">Auteurs : Matthieu Verdier, Simone Luciani · Illustrations : Kerri Aitken · Cranio Creations</p>'''
    return page(body, 9)


pages = [cover(), intro_components(), setup(), gameplay()]
for i, (k, n, c, nums) in enumerate(SEASONS):
    pages.append(season_page(k, n, c, nums, 5 + i))
pages.append(newyear_wf())
html = f'<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{"".join(pages)}</body></html>'
open('/home/claude/rules/rules_fr.html', 'w').write(html)
print('ok', len(pages))
