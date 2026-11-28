from PIL import Image, ImageOps, ImageDraw, ImageFilter
import shutil
I='/home/claude/img/'; A='/home/claude/fetes/a/'
icons={'check':'B/p01_004_128x127','bag':'B/p01_006_125x125','book':'B/p01_008_125x125','laurel':'B/p01_012_168x168',
'bolt':'B/p02_018_128x127','heart':'B/p02_020_125x125','minikin':'B/p02_026_167x168','smile':'B/p03_036_125x125',
'cockade':'B/p04_050_270x270','cpink':'B/p05_066_171x172','cgreen':'B/p07_094_141x142','cblue':'B/p07_096_141x142',
'bonus':'B/p13_174_168x168','ctri':'B/p41_545_171x172','inf':'WF/p01_004_128x127','cblank':'WF/p01_008_171x172',
'deck':'WF/p04_054_172x172','moon':'WF/p07_092_128x127','cdash':'WF/p07_096_114x172','crain':'WF/p06_082_172x172'}
for k,v in icons.items():
    im=Image.open(I+v+'.png').convert('RGBA'); a=im.split()[-1].point(lambda p:255 if p>20 else 0); im.crop(a.getbbox()).save(A+k+'.png')
isl={'semis':'B/p38_503_654x839','nettoyage':'WF/p02_012_649x719','vent':'B/p43_559_654x772','libellules':'WF/p05_066_649x719',
'bain':'B/p20_260_645x905','note':'B/p48_623_659x850','lucioles':'WF/p13_164_652x723','concours':'B/p58_739_528x742',
'recoltes':'WF/p11_142_658x729','contes':'B/p21_278_654x685','chapeaux':'WF/p08_106_665x737','escargots':'WF/p07_090_653x723',
'lanternes':'B/p08_100_641x835','the':'B/p03_030_648x854','cadeaux':'WF/p12_152_659x731','carnaval':'B/p42_549_652x740',
'horloge':'B/p61_771_646x909'}
for k,v in isl.items():
    im=Image.open(I+v+'.png'); im=im.crop(im.getbbox()); im.save(A+'isl_'+k+'.png')
# background texture from WF pink frame
fr=Image.open(I+'WF/p01_000_698x1089.png').convert('RGBA')
W,H=697,620
body=fr.crop((0,540,698,1089)).resize((W,H),Image.LANCZOS)
L=ImageOps.grayscale(body)
seasons={'printemps':('#335c12','#86c040'),'ete':('#8a6a00','#f2cc35'),'automne':('#9a3f0c','#f08a34'),
'hiver':('#1f4a78','#62a8dc'),'nouvelan':('#4e3846','#c9a9b2')}
RAINBOW=[('#9c2f55','#ee7aa0'),('#8a6a00','#f2cc35'),('#335c12','#86c040'),('#1f4a78','#62a8dc'),('#4c2f80','#a88ce0')]
def rainbow(L):
    import numpy as np
    w,h=L.size; layers=[np.array(ImageOps.colorize(L,black=d,mid=m,white='#ffffff',blackpoint=40,midpoint=150,whitepoint=252).convert('RGB'),float) for d,m in RAINBOW]
    out=np.zeros((h,w,3)); n=len(layers)
    xs=np.linspace(0,n-1,w)
    for i in range(n):
        wgt=np.clip(1-abs(xs-i),0,1)[None,:,None]; out+=layers[i]*wgt
    return Image.fromarray(out.clip(0,255).astype('uint8')).convert('RGBA')
mask=Image.new('L',(W,H),0); ImageDraw.Draw(mask).rounded_rectangle((0,0,W-1,H-1),radius=46,fill=255)
for s,(d,m) in seasons.items():
    c=rainbow(L) if s=='nouvelan' else ImageOps.colorize(L,black=d,mid=m,white='#ffffff',blackpoint=40,midpoint=150,whitepoint=252).convert('RGBA')
    c.putalpha(mask); c.save(A+f'bg_{s}.png')
# back: collage tinted
bk=Image.open(I+'back/i-001-000.png').convert('RGB')
bkc=bk.crop((0,0,697,620))
for s,(d,m) in seasons.items():
    g=ImageOps.grayscale(bkc)
    t=ImageOps.colorize(g,black=d,white='#ffffff',mid=m).convert('RGBA')
    t=Image.blend(t,Image.new('RGBA',t.size,m),0.30); t.putalpha(mask); t.save(A+f'back_{s}.png')
print('ok')
