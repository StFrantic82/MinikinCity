# -*- coding: utf-8 -*-
"""Livret de règles de l'extension Festivals (HTML -> PDF via Chrome)."""
import random
R = 'file:///home/claude/rules/img/'
FA = 'file:///home/claude/fetes/a/'
M = 'file:///home/claude/img/M/'
INK = '#2c1a20'

SEASONS = [
    ('spring', 'Primavera', ('#e6f3c4', '#b9df7a'), [1, 2, 3, 4]),
    ('summer', 'Estate', ('#fbf1a8', '#f4d64e'), [5, 6, 7, 8]),
    ('autumn', 'Autunno', ('#fbd9b4', '#f2a159'), [9, 10, 11, 12]),
    ('winter', 'Inverno', ('#d6ebf8', '#86c0e6'), [13, 14, 15, 16]),
]
NAMES = ['Big Folk Clear-Out', 'Swap-a-Petal Fair', 'Under-the-Sofa Expedition', 'Early Worm Market',
         'Lights-Out Party', 'Kazoo Sing-Along', 'Great Gusty Day', 'Even Steven Hopscotch',
         'Tall Tales Night', 'Buzz-Buzz Rally', 'Slowpoke Cup', 'Odd Sock Day',
         'Topsy-Turvy Ball', 'Follow-the-Leader Sledging', 'Little Lights Night', 'Cocoa and Blanket Day',
         'Midnight Rush', 'Less-Is-More Resolution']
CLAR = [
 'L’offerta ha <b>numero di giocatori + 3</b> carte. Come al solito, le carte rimaste vanno in fondo al mazzo.',
 'Si fa al tuo turno di prendere una carta, in ordine inverso di classifica. La carta che restituisci può essere presa dai giocatori successivi.',
 'Tutti i giocatori pescano insieme. La tua mano ha 1 carta in più fino alla fine della partita, il che conta per la classifica finale.',
 'Decidilo al tuo turno di gioco. Una carta giocata dall’offerta non è più disponibile per gli altri. Giocare una carta dalla mano resta possibile.',
 'Tutti i giocatori scelgono e giocano la carta insieme. <b>Parità ed effetti istantanei</b> si risolvono sempre nell’ordine di turno.',
 'Il 1° giocatore del round non riceve mai il bonus. La carta Città 21 non ha colore: non corrisponde mai.',
 'Tutti i giocatori passano insieme. Scegli la tua carta prima di guardare quella che ricevi.',
 'Ordine: carte <b>pari</b> del colore migliore, altre carte pari, carte <b>dispari</b> del colore migliore, altre carte dispari.',
 'Si risolve subito dopo aver giocato la tua carta. La carta Città 21 non conta.',
 'Il +5 conta solo per la classifica, mai per gli effetti delle carte.',
 'Carte del colore migliore <b>dalla più bassa alla più alta</b>, poi le altre carte dalla più bassa alla più alta. Le nuove carte si prendono sempre dal fondo della classifica verso l’alto.',
 'Lo specchio di Even Steven Hopscotch: le carte <b>dispari</b> vengono prima delle pari.',
 'Prima le altre carte (dalla più alta alla più bassa), poi le carte del colore migliore (dalla più alta alla più bassa).',
 'Questo colore sostituisce quello della carta Ricompensa. Se il 1° giocatore gioca la carta Città 21, in questo round non c’è colore migliore.',
 'Il +5 conta solo per la classifica, mai per gli effetti delle carte.',
 'Salta la fase 1 (creare l’offerta) e la fase 3 (prendere una nuova carta).',
 'Tutti i giocatori giocano insieme. Risolvi gli effetti istantanei e piazza i Minikin come al solito. Quella carta non conta più per la classifica finale.',
 'I giocatori a 0 sono a pari merito all’ultimo posto; spareggiali come al solito, nell’ordine in cui le mani vengono rivelate.',
]


TITLES = {'spring': 'Feste di primavera', 'summer': 'Feste d’estate', 'autumn': 'Feste d’autunno', 'winter': 'Feste d’inverno'}


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
    <p style="text-align:center;font-family:Yum;text-transform:uppercase;font-size:8pt;letter-spacing:.8pt;margin-top:-2mm">Espansione</p>
    <div style="position:relative;height:66mm;margin-top:4mm">{fan}</div>
    <div class="poem" style="margin-top:6mm">In primavera si fa pulizia,<br>d’estate si balla in allegria,<br>
    l’autunno racconta le sue storie,<br>l’inverno scivola tra mille glorie.</div>'''
    return page(body, cls='cover')


def intro_components():
    backs = ''.join(back(n, 17.5) for n in (1, 5, 9, 13, 17))
    body = f'''
    {banner('Un anno a Minikin City')}
    <p class="lead">Nei loro salotti a forma di tazza e sulle sedie di ditali, i Minikin non perdono mai l’occasione
    di fare festa. Un bottone perso diventa un cappellino, un kazoo un’orchestra e il cuscino del divano una spedizione.</p>
    <p>Con questa espansione, <b>ogni round di Minikin City porta una Festa</b> che modifica una regola del gioco, solo per
    quel round. Un anno Minikin dura <b>8 mesi</b>, due per stagione: primavera, estate, autunno e inverno.
    Poi tutti si ritrovano per festeggiare il <b>Capodanno</b> durante la classifica finale.</p>
    {banner('Materiale')}
    <p><b>18 carte Festa</b>: 4 per stagione e 2 per il Capodanno. La stagione è indicata sul retro della carta
    e dall’icona in alto a sinistra sul fronte.</p>
    <div class="row" style="justify-content:center;gap:2.4mm;margin:3mm 0 1.6mm">{backs}</div>
    <div class="row cap" style="justify-content:center;gap:2.4mm;text-align:center">
      <span style="width:17.5mm">Primavera</span><span style="width:17.5mm">Estate</span><span style="width:17.5mm">Autunno</span>
      <span style="width:17.5mm">Inverno</span><span style="width:17.5mm">Capodanno</span></div>
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
                     for _, name, c, _ in SEASONS) + f'<span style="background:linear-gradient(90deg,#f6b9cf,#f4d64e,#b9df7a,#86c0e6)">Capodanno</span>'
    body = f'''
    {banner('Preparazione')}
    <p>Prepara Minikin City come al solito, poi:</p>
    <ul class="steps">
      <li>{step(1)}<span>Dividi le carte Festa in base al retro e <b>mescola ogni stagione separatamente</b>.</span></li>
      <li>{step(2)}<span>Metti <b>2 carte Primavera</b> coperte sopra le carte Ricompensa dei round 1 e 2.</span></li>
      <li>{step(3)}<span>Metti <b>2 carte Estate</b> coperte sopra i round 3 e 4.</span></li>
      <li>{step(4)}<span>Metti <b>2 carte Autunno</b> coperte sopra i round 5 e 6.</span></li>
      <li>{step(5)}<span>Metti <b>2 carte Inverno</b> coperte sopra i round 7 e 8.</span></li>
      <li>{step(6)}<span>Metti <b>1 carta Capodanno</b> coperta sopra la tessera di fine partita.</span></li>
      <li>{step(7)}<span>Rimetti nella scatola le carte Festa inutilizzate senza guardarle.</span></li>
    </ul>
    <div class="setupgrid">{cols}</div>
    <div class="slabels">{labels}</div>
    <p class="cap" style="margin-top:2.4mm">La 9ª carta Ricompensa resta sotto la tessera di fine partita, come nel gioco base. Ogni partita usa 9 delle 18 carte Festa: nessun anno a Minikin City è uguale a un altro.</p>
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
    {banner('Svolgimento')}
    <p>All’inizio di ogni round, <b>prima di creare l’offerta</b>, rivela la carta Festa sopra la carta Ricompensa
    del round e leggila ad alta voce. Poi gioca il round normalmente, applicando la Festa.</p>
    <ul class="steps">
      <li>{step('•')}<span>Una Festa <b>dura solo il suo round</b>. Lasciala scoperta perché tutti vedano il mese in corso.</span></li>
      <li>{step('•')}<span>Una Festa cambia solo ciò che indica. Se contraddice le regole base, <b>vince la Festa</b>.</span></li>
      <li>{step('•')}<span><b>Icone d’angolo:</b> una Festa con l’icona <img src="{FA}bolt.png" style="height:3.4mm;vertical-align:-.8mm"> viene eseguita da tutti i giocatori insieme. Una Festa con l’icona <img src="{FA}moon.png" style="height:3.4mm;vertical-align:-.8mm"> si applica a fine round, quando i giocatori prendono una nuova carta.</span></li>
      <li>{step('•')}<span><b>Capodanno:</b> rivela la carta Capodanno dopo il round 8, prima della classifica della tessera di fine partita, e applicala a quella classifica.</span></li>
    </ul>
    <h3>Anatomia di una carta Festa</h3>
    <div class="row" style="gap:5mm;align-items:center">
      <div style="position:relative;width:64mm;flex:none">{card(3, 64)}{calls}</div>
      <ol class="cap" style="padding-left:4mm;margin:0;font-style:normal;font-size:7.8pt;line-height:1.35">
        <li><b>Stagione</b>, indicata anche sul retro.</li>
        <li><b>Nome</b> della Festa.</li>
        <li><b>Motto</b>, solo per divertimento.</li>
        <li><b>Icona d’angolo</b>: tutti i giocatori lo fanno insieme.</li>
        <li><b>Effetto</b> in icone, con i simboli di Minikin City.</li>
        <li><b>Effetto</b> per esteso.</li>
      </ol>
    </div>
    <div class="note"><b>Da ricordare:</b> una carta tricolore è una carta della tua mano, un dorso di carta è il mazzo
    o l’offerta, una freccia in su significa <i>prendere</i> e una freccia in giù <i>giocare</i>.</div>'''
    return page(body, 4)


def season_page(key, name, colors, nums, pnum):
    entries = ''.join(f'<div class="entry">{card(n, 50)}<p class="cap">{CLAR[n-1]}</p></div>' for n in nums)
    body = f'''{banner(TITLES[key], colors[0], colors[1])}<div class="grid">{entries}</div>'''
    return page(body, pnum)


def newyear_wf():
    entries = ''.join(f'<div class="entry">{card(n, 46)}<p class="cap">{CLAR[n-1]}</p></div>' for n in (17, 18))
    body = f'''
    {banner('Capodanno', '#f6b9cf', '#b9d8f2')}
    <div class="grid">{entries}</div>
    {banner('Con Wild Friends', '#f7ef98', '#cdeadb', 13)}
    <p>Le Feste si combinano con l’espansione Wild Friends. La <b>carta Ricompensa grigia</b> non ha colore migliore:</p>
    <ul class="steps cap" style="font-style:normal">
      <li>{step('•')}<span>Slowpoke Cup, Even Steven Hopscotch, Odd Sock Day, Buzz-Buzz Rally e Little Lights Night si applicano alla classifica per solo valore.</span></li>
      <li>{step('•')}<span>Follow-the-Leader Sledging: il colore del 1° giocatore diventa il colore migliore, anche sulla carta grigia.</span></li>
      <li>{step('•')}<span>Topsy-Turvy Ball non ha effetto sulla carta grigia.</span></li>
      <li>{step('•')}<span>Less-Is-More Resolution con la carta grigia sotto la tessera di fine partita: vince il totale più basso dell’intera mano.</span></li>
      <li>{step('•')}<span>Le carte Wild Friends con effetto istantaneo contano per Buzz-Buzz Rally.</span></li>
    </ul>
    <p class="cap" style="text-align:center;margin-top:3mm">Autori: Matthieu Verdier, Simone Luciani · Illustrazioni: Kerri Aitken · Cranio Creations</p>'''
    return page(body, 9)


pages = [cover(), intro_components(), setup(), gameplay()]
for i, (k, n, c, nums) in enumerate(SEASONS):
    pages.append(season_page(k, n, c, nums, 5 + i))
pages.append(newyear_wf())
html = f'<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{"".join(pages)}</body></html>'
open('/home/claude/rules/rules_it.html', 'w').write(html)
print('ok', len(pages))
