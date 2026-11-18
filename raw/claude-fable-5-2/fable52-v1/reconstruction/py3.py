p='ui.js'; s=open(p).read()
a="g.fillStyle = 'rgba(225,235,255,' + LENS.flash * .5 * storm + ')'; g.fillRect(0, 0, w, h);"
assert s.count(a)==1
s=s.replace(a,"g.fillStyle = 'rgba(225,235,255,' + LENS.flash * .3 * storm + ')'; g.fillRect(0, 0, w, h);")
open(p,'w').write(s)