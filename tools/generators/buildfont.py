from fontTools.cffLib import CFFFontSet
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
c=CFFFontSet(); c.decompile(open('yumelo.cff','rb'),None); top=c[c.fontNames[0]]; CS=top.CharStrings
W={}
for n in CS.keys():
    cs=CS[n]; cs.decompile(); W[n]=cs.width if hasattr(cs,'width') else None
def bounds(n,tf=(1,0,0,1,0,0)):
    bp=BoundsPen(None); CS[n].draw(TransformPen(bp,tf)); return bp.bounds
for n in ['I','P','D','N','V','three','X','E','O','R']:
    print(n,W[n],bounds(n))

widths=[260]+[0]*8+[331]+[0]*6+[668,439,622,582,689,641,639,569,617,639]+[0]*7+[711,0,583,637,547,558,643,0,301,0,0,532,833,703,700,619,0,670,636,646,678,743,919,798,696]+[0]*7+[711,0,583,637,547,0,643,645,301,0,663,532,833,703,0,619,0,670,636,646,0,0,919,0,696]
cmapW={32+i:w for i,w in enumerate(widths) if w}
import string
name_of={ord(' '):'space',ord(')'):'parenright'}
for d,nm in zip('0123456789',['zero','one','two','three','four','five','six','seven','eight','nine']): name_of[ord(d)]=nm
for ch in string.ascii_letters:
    if ch in CS.keys(): name_of[ord(ch)]=ch
glyphs={}
def tt(drawfns):
    p=TTGlyphPen(None); cp=Cu2QuPen(p,1.0,reverse_direction=True)
    for f in drawfns: f(cp)
    return p.glyph()
def g(n,tf=(1,0,0,1,0,0)): return lambda pen: CS[n].draw(TransformPen(pen,tf))
def rect(x0,y0,x1,y1,r=40):
    def f(pen):
        k=0.55*r
        pen.moveTo((x0+r,y0)); pen.lineTo((x1-r,y0)); pen.curveTo((x1-r+k,y0),(x1,y0+r-k),(x1,y0+r))
        pen.lineTo((x1,y1-r)); pen.curveTo((x1,y1-r+k),(x1-r+k,y1),(x1-r,y1)); pen.lineTo((x0+r,y1))
        pen.curveTo((x0+r-k,y1),(x0,y1-r+k),(x0,y1-r)); pen.lineTo((x0,y0+r)); pen.curveTo((x0,y0+r-k),(x0+r-k,y0),(x0+r,y0)); pen.closePath()
    return f
adv={}
for code,n in name_of.items():
    glyphs[n]=tt([g(n)]) if n!='space' else TTGlyphPen(None).glyph()
    adv[n]=cmapW.get(code) or int(bounds(n)[2]+45) if n!='space' else 260
# synthesized
glyphs['B']=tt([g('I'),g('three',(1,0,0,700/722,120,0))]); adv['B']=int(537+120+45)
glyphs['H']=tt([g('I'),g('I',(1,0,0,1,390,0)),rect(200,280,470,440,20)]); adv['H']=256+390+45
sx,sy=0.62,700/653
glyphs['K']=tt([g('I'),g('V',(0,-sy,sx,0,175,700+45*sy))]); adv['K']=int(175+702*sx+45)
sx,sy=600/693,700/612
glyphs['Z']=tt([g('N',(0,-sy,sx,0,45,700+45*sy))]); adv['Z']=int(45+693*sx+45)
glyphs['hyphen']=tt([rect(60,250,320,400,50)]); adv['hyphen']=380
glyphs['.notdef']=TTGlyphPen(None).glyph(); adv['.notdef']=500
cmap={c:n for c,n in name_of.items()}
for ch,n in (('B','B'),('H','H'),('K','K'),('Z','Z'),('-','hyphen')): cmap[ord(ch)]=n

import math
def poly(pts):
    def f(pen):
        pen.moveTo(pts[0])
        for p in pts[1:]: pen.lineTo(p)
        pen.closePath()
    return f
def bar(cx, cy, length, thick, ang):
    a=math.radians(ang); dx,dy=math.cos(a)*length/2, math.sin(a)*length/2
    nx,ny=-math.sin(a)*thick/2, math.cos(a)*thick/2
    return poly([(cx-dx+nx,cy-dy+ny),(cx-dx-nx,cy-dy-ny),(cx+dx-nx,cy+dy-ny),(cx+dx+nx,cy+dy+ny)][::-1])
def center(n):
    b=bounds(n); return (b[0]+b[2])/2
for base,new,kind in [('E','Eacute','acute'),('E','Egrave','grave'),('E','Ecircumflex','circ'),('A','Agrave','grave'),('A','Aacute','acute'),('A','Acircumflex','circ'),('O','Ocircumflex','circ'),('I','Icircumflex','circ'),('U','Ucircumflex','circ'),('U','Ugrave','grave')]:
    cx=center(base)
    if kind=='acute': acc=bar(cx+20,830,190,95,35)
    elif kind=='grave': acc=bar(cx-20,830,190,95,-35)
    else: acc=g('V',(0.42,0,0,-0.27,cx-0.42*371.5,965))
    glyphs[new]=tt([g(base),acc]); adv[new]=adv[base]
glyphs['quoteright']=tt([bar(150,600,230,105,72)]); adv['quoteright']=260
for ch,n in (('É','Eacute'),('È','Egrave'),('Ê','Ecircumflex'),('À','Agrave'),('Á','Aacute'),('Â','Acircumflex'),('Ô','Ocircumflex'),('Î','Icircumflex'),('Û','Ucircumflex'),('Ù','Ugrave'),("'",'quoteright'),('’','quoteright')):
    cmap[ord(ch)]=n

bL=bounds('L'); wL=bL[2]
glyphs['J']=tt([g('L',(-1,0,0,1,wL+20,0))]); adv['J']=int(wL+20-bL[0]+45)
bO=bounds('O')
glyphs['Q']=tt([g('O'),bar(bO[2]-120,40,260,105,-40)]); adv['Q']=adv['O']
cmap[ord('J')]='J'; cmap[ord('Q')]='Q'
order=['.notdef']+sorted(set(glyphs)-{'.notdef'})
fb=FontBuilder(1000,isTTF=True); fb.setupGlyphOrder(order); fb.setupCharacterMap(cmap)
fb.setupGlyf({n:glyphs[n] for n in order})
mt={n:(adv[n],glyphs[n].xMin if hasattr(glyphs[n],'xMin') and glyphs[n].numberOfContours else 0) for n in order}
fb.setupHorizontalMetrics(mt); fb.setupHorizontalHeader(ascent=1000,descent=-250)
fb.setupNameTable({'familyName':'YumeloMK','styleName':'Regular'}); fb.setupOS2(sTypoAscender=1000,sTypoDescender=-250,usWinAscent=1000,usWinDescent=250); fb.setupPost()
fb.save('/home/claude/fetes/a/yumelo_mk.ttf'); print('font ok',len(order))
