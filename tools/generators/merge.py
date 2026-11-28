import subprocess,sys,os,re
from PIL import Image
pdf,src,dst=sys.argv[1:4]
os.makedirs(dst,exist_ok=True)
lst=subprocess.run(['pdfimages','-list',pdf],capture_output=True,text=True).stdout.splitlines()[2:]
rows=[l.split() for l in lst]
files=sorted(os.listdir(src))
for i,r in enumerate(rows):
    page,num,typ=int(r[0]),int(r[1]),r[2]
    if typ!='image':continue
    f=os.path.join(src,'i-%03d-%03d.png'%(page,num))
    im=Image.open(f).convert('RGB')
    if i+1<len(rows) and rows[i+1][2]=='smask':
        m=Image.open(os.path.join(src,'i-%03d-%03d.png'%(page,num+1))).convert('L')
        if m.size!=im.size:m=m.resize(im.size)
        im.putalpha(m)
    im.save(os.path.join(dst,'p%02d_%03d_%dx%d.png'%(page,num,im.size[0],im.size[1])))
