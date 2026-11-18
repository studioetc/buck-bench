p='ui.js'; s=open(p).read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n, (s.count(a), a[:80])
    s=s.replace(a,b)
rep("const LORD = ['R4', 'R2', 'R1', 'R3', 'W2', 'W1', 'W3', 'W4M', 'B3', 'BR', 'V598', 'BL', 'V607',","const LORD = ['R2', 'R1', 'R3', 'R4', 'W2', 'W1', 'W3', 'W4M', 'B3', 'BR', 'V598', 'BL', 'V607',")
rep("const cand = XF.filter(x => inM[x.from] && inM[x.to] && t >= x.t0 - 6 && t < x.t1 + 2.6)","const cand = XF.filter(x => inM[x.from] && inM[x.to] && t >= x.t0 - 6 && t < x.t1 + 8)")
rep("size = clamp(Math.min(cw * .96, (h - 82) / 2.44), 28, 84);\n      const yT = 31 + size * .5, hose = size * .44;","size = clamp(Math.min(cw * .96, (h - 92) / 2.44), 28, 84);\n      const yT = 40 + size * .5, hose = size * .44;")
rep("const up = o.role === 'T', gy = up ? A.y - o.s * .5 - 27 : A.y + o.s * .5 + 8,","const up = o.role === 'T', gy = up ? A.y - o.s * .5 - 37 : A.y + o.s * .5 + 8,")
rep("txt(g, t < 500 ? 'DESCENDING · BELOW RADAR COVER' : 'LOW LEVEL · RADAR SILENT',","txt(g, t < 484 ? 'DESCENDING · BELOW RADAR COVER' : 'LOW LEVEL · RADAR SILENT',")
open(p,'w').write(s)