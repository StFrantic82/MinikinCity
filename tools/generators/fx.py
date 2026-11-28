import subprocess,re,sys
from fontTools.ttLib import TTFont
P=sys.argv[1]
out=subprocess.run(['pdffonts',P],capture_output=True,text=True).stdout.splitlines()[2:]
allc=set();best=None
for l in out:
    if 'CREAMPUFF' not in l: continue
    oid=l.split()[-2]
    d=subprocess.run(['qpdf','--show-object='+oid,P],capture_output=True,text=True).stdout
    fd=re.search(r'FontDescriptor (\d+)',d).group(1)
    d2=subprocess.run(['qpdf','--show-object='+fd,P],capture_output=True,text=True).stdout
    ff=re.search(r'FontFile2 (\d+)',d2).group(1)
    data=subprocess.run(['qpdf','--show-object='+ff,'--filtered-stream-data',P],capture_output=True).stdout
    fn=f'cp_{ff}.ttf';open(fn,'wb').write(data)
    f=TTFont(fn)
    # glyphs with contours
    g=f['glyf'];names=[n for n in f.getGlyphOrder() if g[n].numberOfContours]
    print(oid,ff,len(names),''.join(sorted(set(re.sub(r'[^A-Za-z0-9]','',''.join(n if len(n)==1 else '' for n in names))))))
