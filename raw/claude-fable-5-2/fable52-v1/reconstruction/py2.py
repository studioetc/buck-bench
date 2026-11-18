p='ui.js'; s=open(p).read()
a="    // animate items\n    const it = LENS.it;\n    for (const id in tg) { const T = tg[id]; let o = it[id];"
assert s.count(a)==1
s=s.replace(a,"    // animate items\n    const it = LENS.it;\n    for (const id in tg) { const T = tg[id]; T.x = clamp(T.x, size * .52 + 3, w - size * .52 - 3); let o = it[id];")
open(p,'w').write(s)