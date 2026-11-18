
/* ---------- aircraft + hoses ---------- */
const iconSize = q => (q.a.kind === 'vulcan' ? 31 : q.a.kind === 'nimrod' ? 24 : 26) * boostFor();
const acColor = a => a.kind === 'vulcan' ? COL.vul : a.kind === 'nimrod' ? COL.nim : a.grp === 'REC' ? COL.rec : COL.tk;
function quad(p0, p1, p2, u) { const a = 1 - u; return [a * a * p0[0] + 2 * a * u * p1[0] + u * u * p2[0], a * a * p0[1] + 2 * a * u * p1[1] + u * u * p2[1]]; }
function drawAircraft(items, t, act, now) {
  const pos = {}; items.forEach(q => pos[q.id] = q);
  cx.save(); cx.lineCap = 'round';
  for (const x of act) {
    const D = pos[x.d], R = pos[x.r]; if (!D || !R) continue;
    const broken = x.fail && t > x.failAt, flowing = t >= x.t0 && !broken && t <= xEnd(x);
    const dh = D.s.hdg * D2R, rh = R.s.hdg * D2R, sD = iconSize(D), sR = iconSize(R);
    const tail = [D.x - Math.sin(dh) * sD * 0.5, D.y + Math.cos(dh) * sD * 0.5], nose = [R.x + Math.sin(rh) * sR * 0.6, R.y - Math.cos(rh) * sR * 0.6];
    const mx = (tail[0] + nose[0]) / 2, my = (tail[1] + nose[1]) / 2, nx = -(nose[1] - tail[1]), ny = nose[0] - tail[0], L = Math.hypot(nx, ny) || 1;
    const stormy = M.storm && t >= M.storm.t0 && t <= M.storm.t1 && x.br === '3B';
    const sw = Math.sin(now * 3.1 + x.n) * (broken ? 14 : stormy ? 9 : 3.5), qx = mx + nx / L * sw, qy = my + ny / L * sw;
    const path = () => { cx.beginPath(); cx.moveTo(tail[0], tail[1]); cx.quadraticCurveTo(qx, qy, nose[0], nose[1]); };
    if (flowing) {
      cx.strokeStyle = 'rgba(90,240,164,.22)'; cx.lineWidth = 10; path(); cx.stroke();
      cx.strokeStyle = '#5af0a4'; cx.lineWidth = 2.6; cx.setLineDash([7, 6]); cx.lineDashOffset = -now * 46; path(); cx.stroke(); cx.setLineDash([]);
      for (let k = 0; k < 6; k++) { const u = (now * 0.9 + k / 6) % 1, p = quad(tail, [qx, qy], nose, u); cx.fillStyle = 'rgba(220,255,235,.95)'; cx.beginPath(); cx.arc(p[0], p[1], 2.2, 0, 7); cx.fill(); }
      const amt = x.delivered * xProg(x, t), txt = amt.toFixed(1) + 'k lb', cxp = qx + nx / L * 30, cyp = qy + ny / L * 30; cx.font = '700 10.5px ui-monospace,Menlo,monospace'; const tw = cx.measureText(txt).width;
      cx.fillStyle = 'rgba(5,14,26,.88)'; cx.strokeStyle = 'rgba(90,240,164,.55)'; cx.lineWidth = 1; cx.beginPath(); cx.roundRect(cxp - tw / 2 - 6, cyp - 9, tw + 12, 17, 6); cx.fill(); cx.stroke(); cx.fillStyle = '#b8ffd9'; cx.textAlign = 'center'; cx.fillText(txt, cxp, cyp + 3.5);
    } else if (broken) { cx.strokeStyle = COL.bad; cx.lineWidth = 2; cx.setLineDash([4, 5]); path(); cx.stroke(); cx.setLineDash([]); }
    else { cx.strokeStyle = 'rgba(255,180,84,.75)'; cx.lineWidth = 1.6; cx.setLineDash([3, 4]); path(); cx.stroke(); cx.setLineDash([]); }
    cx.fillStyle = flowing ? '#5af0a4' : broken ? COL.bad : '#ffb454'; cx.beginPath(); cx.arc(nose[0], nose[1], 3.2, 0, 7); cx.fill();
    if (flowing || (t >= x.t0 - 1 && !broken)) { cx.strokeStyle = flowing ? 'rgba(90,240,164,.6)' : 'rgba(255,180,84,.5)'; cx.lineWidth = 1.2; cx.beginPath(); cx.arc(D.x, D.y, iconSize(D) * 0.85 + 3, 0, 7); cx.arc(R.x, R.y, iconSize(R) * 0.85 + 3, 0, 7); cx.stroke(); }
  }
  { const byG = {}; items.forEach(q => { if (q.g) (byG[q.g.id] = byG[q.g.id] || []).push(q); });
    for (const k in byG) { const m = byG[k], g = m[0].g, srt = m.slice().sort((p, q) => (q.x * g.fx + q.y * g.fy) - (p.x * g.fx + p.y * g.fy)); cx.strokeStyle = 'rgba(255,255,255,.28)'; cx.lineWidth = 1; cx.setLineDash([2, 4]); cx.beginPath(); srt.forEach((q, i) => i ? cx.lineTo(q.x, q.y) : cx.moveTo(q.x, q.y)); cx.stroke(); cx.setLineDash([]);
      cx.fillStyle = 'rgba(255,255,255,.75)'; cx.strokeStyle = 'rgba(4,10,20,.9)'; cx.lineWidth = 2; cx.beginPath(); cx.arc(g.cx, g.cy, 2.6, 0, 7); cx.stroke(); cx.fill(); } }
  const sorted = items.slice().sort((a, b) => (a.a.kind === 'vulcan') - (b.a.kind === 'vulcan'));
  S.hit = []; const mono = '700 10px ui-monospace,Menlo,monospace';
  for (const q of sorted) {
    const a = q.a, s = q.s, size = iconSize(q), col = acColor(a), fade = t > a.tOff ? clamp(1 - (t - a.tOff) / 1.5, 0, 1) : 1;
    const isAct = act.some(x => x.d === q.id || x.r === q.id), st = M.statusOf(q.id, t);
    cx.globalAlpha = fade;
    if (s.fuel != null && a.cap) {
      const fr = clamp(s.fuel / a.cap, 0, 1), r = size * 0.68, low = fr < 0.1 && t < a.tOff, mid = fr < 0.2;
      cx.lineWidth = 2.4; cx.strokeStyle = 'rgba(255,255,255,.13)'; cx.beginPath(); cx.arc(q.x, q.y, r, 0, 7); cx.stroke();
      cx.strokeStyle = low ? COL.bad : mid ? '#ffd35a' : col; cx.globalAlpha = fade * (low ? 0.55 + 0.45 * Math.sin(now * 8) : 0.95); cx.beginPath(); cx.arc(q.x, q.y, r, -Math.PI / 2, -Math.PI / 2 + fr * Math.PI * 2); cx.stroke(); cx.globalAlpha = fade;
    }
    drawAC(cx, a.kind, q.x, q.y, s.hdg, size, col, { glow: isAct ? (a.kind === 'vulcan' ? '#74e6ff' : '#ffb454') : (a.kind === 'vulcan' ? 'rgba(116,230,255,.7)' : null), glowPx: isAct ? 16 : 10, alpha: st.k === 'ground' ? 0.55 : 1 });
    if (S.sel === q.id) { cx.strokeStyle = '#fff'; cx.lineWidth = 1.4; cx.setLineDash([3, 3]); cx.beginPath(); cx.arc(q.x, q.y, size * 0.95, 0, 7); cx.stroke(); cx.setLineDash([]); }
    if (S.o.labels) {
      cx.font = mono; cx.textAlign = 'center'; cx.lineWidth = 3; cx.strokeStyle = 'rgba(3,9,18,.9)';
      const bad = st.k === 'abort' || (s.fuel != null && a.cap && s.fuel / a.cap < 0.1 && t < a.tOff), txt = (a.kind === 'vulcan' && a.info.serial ? q.id + ' ' + a.info.serial : q.id) + (st.k === 'abort' ? ' ABORT' : '');
      const ly = q.y + size * 0.78 + 10; cx.strokeText(txt, q.x, ly); cx.fillStyle = bad ? COL.bad : a.kind === 'vulcan' ? '#c9f4ff' : '#ffe0b0'; cx.fillText(txt, q.x, ly);
    }
    cx.globalAlpha = 1; S.hit.push({ id: q.id, x: q.x, y: q.y, r: size * 0.8 });
  }
  cx.restore();
}

/* ---------- full map render ---------- */
function renderMap(t, now) {
  cx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (S.shake > 0.01) { cx.translate((Math.random() - 0.5) * 7 * S.shake, (Math.random() - 0.5) * 7 * S.shake); }
  const act = M.xs.filter(x => xActive(x, t) && !(x.give && false));
  drawOcean(); drawGraticule(); drawRings(); drawLand(); drawNight(); drawTEZ(); drawRoutes(); drawBrackets(act); drawStorm(t); drawTrails(t); drawPlacesAndMarkers(); drawBombs(t);
  const items = layoutAircraft(t, act); drawAircraft(items, t, act, now);
  // vignette
  const g = cx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.38, W / 2, H / 2, Math.max(W, H) * 0.78); g.addColorStop(0, 'rgba(2,6,12,0)'); g.addColorStop(1, 'rgba(2,6,12,.5)'); cx.fillStyle = g; cx.fillRect(0, 0, W, H);
  // scale bar + exaggeration note
  const np = nmPerPx(); let nice = 1, e = Math.pow(10, Math.floor(Math.log10(np * 110))); for (const m of [1, 2, 5, 10]) { nice = m * e; if (nice / np >= 70 || m === 10) { if (nice / np >= 70) break; } }
  const wpx = nice / np; $('#sbBar').style.width = wpx.toFixed(0) + 'px'; $('#sbTxt').textContent = (nice >= 1 ? nice.toLocaleString() : nice) + ' nm';
  const factor = 32 * np / 0.0173; $('#exTxt').innerHTML = 'Aircraft icons drawn <b>×' + (factor >= 100 ? Math.round(factor / 10) * 10 : factor.toFixed(0)).toLocaleString() + '</b> true size · formation spacing exaggerated for readability';
}

/* ---------- camera director ---------- */
function centroidOut(t) { let sx = 0, sy = 0, n = 0; for (const id of M.order) { const a = M.AC[id]; if (!airborne(a, t) || (a.tTurn != null && t > a.tTurn)) continue; const s = smp(a, t); sx += s.lat; sy += s.lon; n++; } return n ? [sx / n, sy / n] : null; }
function autoTarget(t) {
  const V = M.AC[M.V], act = M.xs.filter(x => t >= x.t0 - 1.6 && t <= (x.fail ? x.failAt + 4 : x.t1 + 1.0));
  if (t >= M.tPU - 4 && t <= M.tBR + 6) {
    const Vs = smp(V, t), u = smooth((t - (M.tPU - 4)) / (M.tBR - (M.tPU - 4) + 0.001)), rc = BB.RWY_C;
    const span = t <= M.tBR ? lerp(1.7, 0.34, u) : lerp(0.34, 1.3, smooth((t - M.tBR) / 6)), wc = t <= M.tBR ? 0.55 * u : lerp(0.55, 0, smooth((t - M.tBR) / 6));
    return [lerp(Vs.lat, rc[0], wc), lerp(Vs.lon, rc[1], wc), span];
  }
  if (act.length) {
    const x = act.slice().sort((p, q) => xPrio(q, t) - xPrio(p, t) || p.t0 - q.t0)[0], aD = M.AC[x.d], aR = M.AC[x.r], D = smp(aD, clamp(t, aD.tOn, aD.tOff)), R = smp(aR, clamp(t, aR.tOn, aR.tOff));
    return [(D.lat + R.lat) / 2, (D.lon + R.lon) / 2, x.r === M.V ? 2.6 : 4.0];
  }
  if (t < M.tR1 + 24) { const f = smooth((t - (M.tR1 - 2)) / 24), c = centroidOut(t) || BB.ASC; return [lerp(BB.ASC[0] - 0.12, c[0], f), lerp(BB.ASC[1] - 0.1, c[1], f), lerp(1.5, 10, f)]; }
  if (M.storm && t >= M.storm.t0 && t <= M.storm.t1) return [M.storm.c[0], M.storm.c[1], 6.5];
  if (t > M.tLandV - 16) return [BB.ASC[0] - 0.4, BB.ASC[1] - 0.4, 3.4];
  if (t >= M.tRV0 - 26 && t <= M.tRV1 + 8) { const N1 = smp(M.AC.RV1, clamp(t, M.AC.RV1.tOn, M.AC.RV1.tOff)), Vs = smp(V, t); return [(N1.lat + Vs.lat) / 2, (N1.lon + Vs.lon) / 2, 5.5]; }
  if (airborne(V, t)) { const Vs = smp(V, t); return [Vs.lat, Vs.lon, 15]; }
  const c = centroidOut(t); return c ? [c[0], c[1], 15] : [BB.ASC[0], BB.ASC[1], 12];
}
function updateCamera(t, dt) {
  if (S.cam === 'auto') { const [la, lo, sp] = autoTarget(t); setTargetSpan(la, lo, sp); }
  else if (S.cam === 'vulcan') { const Vs = smp(M.AC[M.V], clamp(t, M.AC[M.V].tOn, M.AC[M.V].tOff)); setTargetSpan(Vs.lat, Vs.lon, 8); }
  if (S.cam === 'auto' || S.cam === 'vulcan') tgt.y += H * 0.05 / tgt.k;
  if (S.snap) { cam.x = tgt.x; cam.y = tgt.y; cam.k = tgt.k; S.snap = false; return; }
  const a = 1 - Math.exp(-dt / (S.cam === 'free' ? 0.15 : 0.85));
  cam.x += (tgt.x - cam.x) * a; cam.y += (tgt.y - cam.y) * a; cam.k = Math.exp(lerp(Math.log(cam.k), Math.log(tgt.k), a));
}

/* ============================================================================
   CONTACT VIEW
   ========================================================================== */
const xPrio = (x, t) => { const tE = xEnd(x); if (t >= x.t0 && t <= tE) return 4 + (x.r === M.V ? 1 : 0); if (t < x.t0) return 3; if (x.fail && t <= x.failAt + 4) return 2; return 1; };
const hash = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
function pickFocus(t) {
  if (S.selX && t >= S.selX.t0 - 6 && t <= S.selX.t1 + 4) return S.selX;
  const win = M.xs.filter(x => t >= x.t0 - 2.4 && t <= (x.fail ? x.failAt + 4 : x.t1 + 1.8));
  if (win.length) return win.sort((p, q) => xPrio(q, t) - xPrio(p, t) || p.t0 - q.t0)[0];
  const nxt = M.xs.find(x => x.t0 > t); if (nxt && nxt.t0 - t < 50) return nxt;
  for (let i = M.xs.length - 1; i >= 0; i--) if (M.xs[i].t1 <= t) return M.xs[i];
  return nxt || null;
}
const brLabel = x => x.br === 'RV-A' ? 'Recovery top-up' : x.br === 'RESCUE' ? (M.flown ? 'Rescue contact' : 'Long-slot top-up') : x.br === 'RV' ? 'Rio rendezvous' : 'Bracket ' + x.br;
const fmtLL = (la, lo) => { const f = (v, p) => { const a = Math.abs(v), d = Math.floor(a), m = Math.round((a - d) * 60); return d + '°' + String(m).padStart(2, '0') + '′' + p; }; return f(la, la < 0 ? 'S' : 'N') + ' ' + f(lo, lo < 0 ? 'W' : 'E'); };
function drawContact(t, now) {
  if (t >= M.tH1e - 0.5 && t <= M.tBR + 6) { drawAttack(t, now); return; }
  setText('#cardTitle', 'Contact view');
  const w = cvC.clientWidth, h = cvC.clientHeight, c = cc; c.setTransform(DPR, 0, 0, DPR, 0, 0);
  const x = pickFocus(t); S.focus = x;
  let day = 0; if (x) { const aD = M.AC[x.d], D = smp(aD, clamp(t, aD.tOn, aD.tOff)); day = smooth((sunCos(D.lat, D.lon, t) + 0.05) / 0.22); }
  const mix = (a, b, f) => Math.round(lerp(a, b, f)), g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, `rgb(${mix(3, 52, day)},${mix(8, 104, day)},${mix(20, 184, day)})`); g.addColorStop(1, `rgb(${mix(8, 14, day)},${mix(17, 86, day)},${mix(34, 152, day)})`); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 18; i++) { const sp = 70 + 170 * hash(i + 20), xx = w - ((now * sp + i * 173) % (w + 140)) + 40, yy = hash(i) * h * 0.92 + h * 0.04; c.fillStyle = day > 0.5 ? 'rgba(255,255,255,.12)' : 'rgba(150,190,255,.08)'; c.fillRect(xx, yy, 24 + 70 * hash(i + 40), 1.4); }
  if (!x) { c.fillStyle = '#7d90ab'; c.font = '600 12px ui-sans-serif'; c.textAlign = 'center'; c.fillText('No contact scheduled', w / 2, h / 2); setLamps('a'); return; }
  const hasV = x.r === M.V, L = Math.min(106, w * 0.30), Lr = hasV ? L * 0.9 : L, yc = h * 0.52, tEnd = xEnd(x), broken = x.fail && t > x.failAt;
  const stormy = M.storm && t >= M.storm.t0 && t <= M.storm.t1 && x.br === '3B', turb = stormy ? 1 : 0.2;
  let gap = 0, phase;
  if (t < x.t0 - 2.4) { gap = 1; phase = 'standby'; } else if (t < x.t0) { gap = 1 - smooth((t - (x.t0 - 2.4)) / 2.4); phase = 'approach'; }
  else if (t <= tEnd) phase = 'flow'; else if (x.fail) { gap = 0.34 * smooth((t - x.failAt) / 1.4); phase = 'broken'; }
  else { gap = smooth((t - tEnd) / 1.8); phase = gap >= 1 ? 'done' : 'breakaway'; }
  const xd = w * 0.72, tailX = xd - L / 2, drogueX = tailX - L * 0.60;
  const yD = yc + Math.sin(now * 2.1) * 1.5 * turb + (stormy ? Math.sin(now * 5.3) * 3 : 0), yR = yc + 5 + Math.sin(now * 3.3 + 1) * (1.2 + 3.4 * turb) + gap * 7;
  const xR = drogueX - 8 - (Lr / 2) * 1.22 - gap * w * 0.30, contact = phase === 'flow';
  const sway = (phase === 'broken' ? 16 * Math.exp(-(t - x.failAt) * 0.9) + 2 : 2 + 7 * turb) * Math.sin(now * 2.6);
  const yDrogue = contact ? yR : yD + sway * 0.6 + (phase === 'approach' || phase === 'standby' ? 4 : 0);
  const donorCol = M.AC[x.d].grp === 'REC' ? COL.rec : COL.tk, recvCol = acColor(M.AC[x.r]);
  // hose
  const p0 = [tailX + 3, yD], p2 = [drogueX, yDrogue], p1 = [(p0[0] + p2[0]) / 2, (p0[1] + p2[1]) / 2 + sway];
  const hosePath = () => { c.beginPath(); c.moveTo(p0[0], p0[1]); c.quadraticCurveTo(p1[0], p1[1], p2[0], p2[1]); };
  c.lineCap = 'round';
  if (contact) { c.strokeStyle = 'rgba(90,240,164,.28)'; c.lineWidth = 9; hosePath(); c.stroke(); }
  c.strokeStyle = contact ? '#5af0a4' : phase === 'broken' ? '#ff8a96' : '#aab8cc'; c.lineWidth = 3; hosePath(); c.stroke();
  if (contact) { c.strokeStyle = 'rgba(8,40,30,.9)'; c.lineWidth = 1; c.setLineDash([6, 8]); c.lineDashOffset = -now * 40; hosePath(); c.stroke(); c.setLineDash([]); }
  // aircraft
  drawAC(c, 'victor', xd, yD, 90, L, donorCol, { glow: contact ? 'rgba(90,240,164,.55)' : null, glowPx: 16 });
  const sup = x.d === 'S1' || x.d.startsWith('RV'); void sup;
  drawAC(c, hasV ? 'vulcan' : 'victor', xR, yR, 90, Lr, recvCol, { probe: phase !== 'broken' && !(x.fail && t > x.failAt), glow: hasV ? 'rgba(116,230,255,.6)' : null, glowPx: 14 });
  if (x.fail && t > x.failAt) {
    const age = t - x.failAt, tipX = xR + (Lr / 2) * 1.06; c.strokeStyle = COL.bad; c.lineWidth = 2; c.beginPath(); c.moveTo(xR + Lr / 2, yR); c.lineTo(tipX, yR); c.stroke();
    if (age < 5) { const fx = drogueX - 9 - age * 30, fy = yDrogue + age * 16; c.save(); c.translate(fx, fy); c.rotate(age * 3); c.strokeStyle = '#ffb3bb'; c.lineWidth = 2; c.beginPath(); c.moveTo(-9, 0); c.lineTo(9, 0); c.stroke(); c.restore(); }
  }
  // drogue
  c.save(); c.translate(p2[0], p2[1]); c.fillStyle = '#323b4c'; c.strokeStyle = '#a8bcd8'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 0); c.lineTo(-14, -9.5); c.lineTo(-17, -9.5); c.lineTo(-17, 9.5); c.lineTo(-14, 9.5); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = contact ? '#5af0a4' : phase === 'broken' ? COL.bad : '#ffb454'; c.lineWidth = 1.8; c.beginPath(); c.ellipse(-17, 0, 2.4, 9.5, 0, 0, 7); c.stroke(); c.restore();
  // fuel particles
  if (contact) { for (let k = 0; k < 14; k++) { const u = (now * 1.3 + k / 14) % 1; let pt; if (u < 0.62) pt = quad(p0, p1, p2, u / 0.62); else { const v = (u - 0.62) / 0.38; pt = [lerp(p2[0] - 8, xR + Lr * 0.18, v), lerp(p2[1], yR, v)]; } c.fillStyle = `rgba(200,255,225,${0.95 - Math.max(0, (u - 0.8)) * 3.5})`; c.beginPath(); c.arc(pt[0], pt[1], 2.3, 0, 7); c.fill(); } }
  // HDU lamp on the donor tail
  const lamp = phase === 'flow' ? '#5af0a4' : phase === 'broken' ? COL.bad : '#ffb454'; c.save(); c.shadowColor = lamp; c.shadowBlur = 12; c.fillStyle = lamp; c.beginPath(); c.arc(tailX + 4, yD, 3.6, 0, 7); c.fill(); c.restore();
  setLamps(phase === 'flow' ? 'g' : phase === 'broken' ? 'r' : 'a');
  // overlays
  const aD = M.AC[x.d], aR = M.AC[x.r], fD = smp(aD, clamp(t, aD.tOn, aD.tOff)).fuel, fR = smp(aR, clamp(t, aR.tOn, aR.tOff)).fuel, mono = '600 10.5px ui-monospace,Menlo,monospace';
  const panel = (tx, ty, id, f, cap, col, align) => { c.font = '700 11px ui-monospace,Menlo,monospace'; c.fillStyle = col; c.textAlign = align; c.fillText(id + (serialOf(id) ? ' ' + serialOf(id) : ''), tx, ty); c.font = mono; c.fillStyle = '#e8f1ff'; c.fillText(fmtK(f) + 'k / ' + cap, tx, ty + 13); const bw = 74, bx = align === 'right' ? tx - bw : tx; c.fillStyle = 'rgba(255,255,255,.16)'; c.fillRect(bx, ty + 18, bw, 4); c.fillStyle = f / cap < 0.1 ? COL.bad : col; c.fillRect(bx, ty + 18, bw * clamp(f / cap, 0, 1), 4); };
  panel(w - 10, 18, x.d, fD, aD.cap, donorCol, 'right'); panel(10, h - 30, x.r, fR, aR.cap, recvCol, 'left');
  c.font = '600 9.5px ui-monospace,Menlo,monospace'; c.textAlign = 'left'; c.fillStyle = 'rgba(210,225,245,.7)'; c.textAlign = 'right';
  const phTxt = { standby: 'STANDBY · NEXT CONTACT ' + Math.max(0, Math.round(x.t0 - t)) + ' MIN', approach: 'APPROACH · JOINING THE BASKET', flow: 'CONTACT · FUEL FLOWING', broken: 'PROBE BROKEN · TRANSFER LOST', breakaway: 'BREAKAWAY', done: 'TRANSFER COMPLETE' }[phase];
  c.textAlign = 'left'; c.font = '700 10.5px ui-monospace,Menlo,monospace'; c.fillStyle = phase === 'flow' ? '#5af0a4' : phase === 'broken' ? COL.bad : '#ffd9a0'; c.fillText(phTxt, 10, 18);
  c.font = '600 9.5px ui-monospace,Menlo,monospace'; c.fillStyle = 'rgba(210,225,245,.62)'; c.textAlign = 'right'; c.fillText(x.phase === 'out' || x.phase === 'rescue' ? 'RADIO SILENCE · HDU LIGHTS ONLY' : 'RECEIVER ' + x.r, w - 10, h - 10);
  if (BB.BRK[x.br]) { c.textAlign = 'left'; c.fillStyle = 'rgba(210,225,245,.6)'; c.fillText(fmtLL(BB.BRK[x.br][0][0], BB.BRK[x.br][0][1]) + ' · FL270–310 · ≈300 kt', 10, 33); }

  // info DOM
  const prog = xProg(x, t), amt = x.delivered * prog;
  setText('#cvBr', brLabel(x).toUpperCase()); setText('#cvTtl', x.d + (serialOf(x.d) ? ' ' + serialOf(x.d) : '') + '  →  ' + x.r + (serialOf(x.r) ? ' ' + serialOf(x.r) : ''));
  setText('#cvAmt', amt.toFixed(1) + ' / ' + x.delivered.toFixed(1) + 'k lb'); setText('#cvSub', x.note);
  const bar = $('#cvBar'); bar.className = 'pbar' + (hasV ? ' v' : '') + (x.fail && t > x.failAt ? ' bad' : ''); bar.firstElementChild.style.width = (prog * 100).toFixed(1) + '%';
}

function drawAttack(t, now) {
  const w = cvC.clientWidth, h = cvC.clientHeight, c = cc, V = M.AC[M.V], rc = BB.RWY_C; c.setTransform(DPR, 0, 0, DPR, 0, 0); setText('#cardTitle', 'Attack profile');
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#02050c'); g.addColorStop(1, '#0b1d38'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  const ground = h - 26, yAlt = alt => ground - Math.sqrt(clamp(alt, 0, 36000) / 36000) * (ground - 30), xT = w * 0.70, x40 = xT - w * 0.2;
  const xOf = d => d >= 0 ? (d <= 40 ? xT - d / 40 * (xT - x40) : x40 - (d - 40) / 250 * (x40 - 14)) : Math.min(w - 6, xT + (-d) / 40 * w * 0.12);
  c.font = '9.5px ui-monospace,Menlo,monospace'; c.textAlign = 'left';
  for (const [alt, lb] of [[300, '300 ft'], [1000, '1,000 ft'], [10000, '10,000 ft'], [30000, 'FL300']]) { const y = yAlt(alt); c.strokeStyle = 'rgba(150,175,210,.12)'; c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); c.fillStyle = 'rgba(160,185,220,.5)'; c.textAlign = 'right'; c.fillText(lb, w - 5, y - 3); c.textAlign = 'left'; }
  // sea + runway + hill
  c.fillStyle = '#0a2646'; c.fillRect(0, ground, w, h - ground); c.fillStyle = 'rgba(120,190,230,.35)'; c.fillRect(0, ground, w, 1.5);
  c.fillStyle = '#1f3a30'; c.beginPath(); c.moveTo(xT - 36, ground); c.quadraticCurveTo(xT + 6, ground - 11, xT + 52, ground - 4); c.lineTo(xT + 80, ground); c.closePath(); c.fill();
  c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(xT - 9, ground - 1); c.lineTo(xT + 9, ground - 1); c.stroke(); c.fillStyle = '#e8f1ff'; c.textAlign = 'center'; c.fillText('STANLEY RUNWAY', xT, h - 8);
  const dist = tt => { const p = smp(V, tt); const d = BB.hav([p.lat, p.lon], rc) - 2; return tt <= M.tBR ? d : -d; };
  const t0 = M.tH1e - 4, t1 = M.tBR + 6, pts = []; for (let tt = t0; tt <= t1 + 1e-6; tt += 0.12) pts.push([tt, xOf(dist(tt)), yAlt(M.altV(tt))]);
  c.lineJoin = 'round'; c.setLineDash([3, 4]); c.strokeStyle = 'rgba(116,230,255,.35)'; c.lineWidth = 1.5; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[1], p[2]) : c.moveTo(p[1], p[2])); c.stroke(); c.setLineDash([]);
  c.strokeStyle = '#74e6ff'; c.lineWidth = 2.6; c.shadowColor = '#74e6ff'; c.shadowBlur = 10; c.beginPath(); let started = false; for (const p of pts) { if (p[0] > t) break; started ? c.lineTo(p[1], p[2]) : (c.moveTo(p[1], p[2]), started = true); } c.stroke(); c.shadowBlur = 0;
  const mk = (tt, d, lab, up) => { const x = xOf(d), y = yAlt(M.altV(tt)); c.strokeStyle = 'rgba(255,255,255,.35)'; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(x, y); c.lineTo(x, ground); c.stroke(); c.setLineDash([]); c.fillStyle = '#ffd9a0'; c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill(); c.textAlign = x > w * 0.55 ? 'right' : 'left'; c.fillStyle = 'rgba(255,225,185,.9)'; c.fillText(lab, x + (x > w * 0.55 ? -7 : 8), y + (up ? -7 : 13)); };
  mk(M.tH1e + 0.2, 268, 'LEAVES TANKER', false); mk(M.tPU - 0.3, 40, 'POP-UP · H2S fix', false); mk(M.tBR, 0, 'RELEASE', true);
  // Vulcan marker (side view)
  const vs = smp(V, t), sd = dist(t), vx = xOf(sd), vy = yAlt(M.altV(t)), ang = Math.atan2(pts.length > 2 ? -(yAlt(M.altV(t + 0.3)) - yAlt(M.altV(t - 0.3))) : 0, 40) * -1;
  c.save(); c.translate(vx, vy); c.rotate(clamp(ang, -0.5, 0.5)); c.shadowColor = '#74e6ff'; c.shadowBlur = 12; c.fillStyle = '#d9f6ff'; c.beginPath(); c.moveTo(14, 0); c.lineTo(4, -2.6); c.lineTo(-9, -3.2); c.lineTo(-13, -2); c.lineTo(-12, -11); c.lineTo(-8, -11); c.lineTo(-4, -3); c.lineTo(-13, 3); c.lineTo(-4, 3.2); c.closePath(); c.fill(); c.restore();
  const alt = M.altV(t), dtg = Math.max(0, sd);
  c.textAlign = 'left'; c.font = '700 10.5px ui-monospace,Menlo,monospace'; c.fillStyle = '#74e6ff'; c.fillText('HI · LO · LO · HI', 10, 18); c.font = '600 9.5px ui-monospace,Menlo,monospace'; c.fillStyle = 'rgba(210,225,245,.7)'; c.fillText((alt < 1500 ? Math.round(alt / 50) * 50 + ' ft' : alt < 18000 ? Math.round(alt / 100) * 100 + ' ft' : 'FL' + Math.round(alt / 100)) + ' · ' + (t < M.tPU ? '390' : t <= M.tBR ? '330' : '350') + ' kt', 10, 32);
  c.textAlign = 'right'; c.fillStyle = 'rgba(210,225,245,.55)'; c.fillText('RADIO SILENCE · RADAR AVOIDANCE', w - 10, 18);
  setLamps('x'); setText('#cvBr', 'HI-LO-LO-HI'); setText('#cvTtl', M.V + ' ' + (M.AC[M.V].info.serial || '') + '  ·  hi-lo-lo-hi'); setText('#cvAmt', t > M.tBR ? 'bombs away' : dtg.toFixed(0) + ' nm to go');
  setText('#cvSub', t < M.tPU ? 'Down from the last tanker to 300 ft, about 300 nm out, to stay under Argentine radar.' : t <= M.tBR ? 'Up to 1,000 ft so the H2S radar can lock Mount Usborne, then up to 10,000 ft for the run.' : '21 × 1,000 lb bombs gone in ~5 s — now a 60° banking turn and climb for home.');
  const bar = $('#cvBar'); bar.className = 'pbar v'; bar.firstElementChild.style.width = (t >= M.tBR ? 100 : clamp(1 - dtg / 268, 0, 1) * 100).toFixed(1) + '%';
}
function setLamps(k) { $('#lr').classList.toggle('on', k === 'r'); $('#la').classList.toggle('on', k === 'a'); $('#lg').classList.toggle('on', k === 'g'); }
const _txt = {}; function setText(sel, v) { if (_txt[sel] !== v) { _txt[sel] = v; $(sel).textContent = v; } }
function setHTML(sel, v) { if (_txt[sel] !== v) { _txt[sel] = v; $(sel).innerHTML = v; } }

/* ============================================================================
   PANES (fuel board / transfers / crews) + log + ticks
   ========================================================================== */
const rowEls = {}; let xrowEls = [];
function buildPanes() {
  const pf = $('#pFuel'); pf.innerHTML = ''; for (const k in rowEls) delete rowEls[k];
  const vul = M.ids.filter(id => M.AC[id].kind === 'vulcan'), out = M.order.filter(id => M.AC[id].kind === 'victor'), rec = ['S1', 'RV1', 'RV2', 'RV3', 'RV4', 'NIM'];
  for (const [title, list] of [['Vulcans', vul], ['Outbound tankers', out], ['Recovery & rescue', rec]]) {
    const gh = document.createElement('div'); gh.className = 'gh'; gh.textContent = title; pf.appendChild(gh);
    for (const id of list) {
      const a = M.AC[id], d = document.createElement('div'); d.className = 'frow ' + (a.kind === 'vulcan' ? 'vul' : a.kind === 'nimrod' ? 'nim' : a.grp === 'REC' ? 'rec' : ''); d.dataset.id = id;
      d.innerHTML = '<div class="id">' + id + '</div><div class="bar"><i></i></div><div class="val">—</div><div class="st"></div>'; if (a.kind === 'nimrod') d.querySelector('.bar').style.visibility = 'hidden';
      d.onclick = () => selectAC(id); pf.appendChild(d); rowEls[id] = { el: d, bar: d.querySelector('.bar i'), val: d.querySelector('.val'), st: d.querySelector('.st'), k: '' };
    }
  }
  const pc = $('#pChain'); pc.innerHTML = ''; xrowEls = [];
  M.xs.forEach(x => {
    const d = document.createElement('div'); d.className = 'xrow todo' + (x.r === M.V ? ' v' : ''); d.innerHTML = '<span class="n">' + x.n + '</span><span class="br">' + x.br + '</span><span class="who">' + x.d + ' → ' + x.r + '<small>' + (x.give ? 'hand-back' : x.note) + '</small></span><span class="q">—</span>';
    d.onclick = () => { S.selX = x; seek(x.t0 - 1.5); }; pc.appendChild(d); xrowEls.push({ x, el: d, q: d.querySelector('.q'), k: '' });
  });
  const fn = document.createElement('div'); fn.className = 'fine'; fn.innerHTML = 'Quantities are thousands of lb. Fill-to-full transfers are computed from the fuel ledger; fixed transfers are the RAF plan’s figures. The final outbound bracket passes ' + (M.flown ? '12k (plan: 19k).' : '19k.'); pc.appendChild(fn);
  const pr = $('#pCrew'); pr.innerHTML = '';
  M.ids.forEach(id => { const a = M.AC[id], i = a.info || {}, d = document.createElement('div'); d.className = 'crew ' + (a.kind === 'vulcan' ? 'vul' : a.grp === 'REC' ? 'rec' : ''); d.innerHTML = '<b>' + id + '</b><span class="r">' + (i.serial ? i.serial + ' · ' : '') + (i.crew || (a.kind === 'nimrod' ? '' : 'Crew not recorded')) + '</span><div class="s">' + (i.role || '') + (i.inf ? ' · slot inferred' : '') + '</div>'; d.onclick = () => selectAC(id); pr.appendChild(d); });
  const f2 = document.createElement('div'); f2.className = 'fine'; f2.textContent = 'Callsigns follow the RAF plan diagram (R = Wave One, B = Wave Two). Black Buck 1’s own RED / WHITE / BLUE section names differ; crew-to-slot assignments marked “inferred” are drawn from published accounts.'; pr.appendChild(f2);
}
function selectAC(id) { S.sel = S.sel === id ? null : id; $$('.frow').forEach(r => r.classList.toggle('sel', r.dataset.id === S.sel)); }
function updatePanes(t) {
  for (const id in rowEls) {
    const R = rowEls[id], a = M.AC[id], st = M.statusOf(id, t), f = a.fuel ? smp(a, clamp(t, a.tOn, a.tOff)).fuel : null, on = st.k !== 'ground' && st.k !== 'landed';
    const low = on && f != null && f / a.cap < 0.1, cls = 'frow ' + (a.kind === 'vulcan' ? 'vul' : a.kind === 'nimrod' ? 'nim' : a.grp === 'REC' ? 'rec' : '') + (on ? '' : ' off') + (low ? ' low' : '') + (st.k === 'give' || st.k === 'take' || st.k === 'xfer' ? ' act' : '') + (S.sel === id ? ' sel' : '');
    const key = cls + '|' + (f == null ? '' : f.toFixed(1)) + '|' + st.s; if (R.k === key) continue; R.k = key;
    R.el.className = cls; if (f != null) { R.bar.style.width = (clamp(f / a.cap, 0, 1) * 100).toFixed(1) + '%'; R.val.textContent = f.toFixed(1); } else R.val.textContent = '';
    R.st.textContent = st.s + (low ? ' · LOW FUEL' : '');
  }
  for (const r of xrowEls) {
    const x = r.x, run = xActive(x, t) && t <= xEnd(x) + 0.001, done = t > xEnd(x) + 0.001, key = (run ? 'r' : done ? 'd' : 't') + (run ? (x.delivered * xProg(x, t)).toFixed(1) : '') + (S.selX === x ? 's' : '');
    if (r.k === key) continue; r.k = key;
    const bad = x.fail && t >= x.failAt; r.el.className = 'xrow ' + (bad ? 'bad' : run ? 'run' : done ? 'done' : 'todo') + (x.r === M.V ? ' v' : '') + (S.selX === x ? ' sel' : '');
    r.q.textContent = bad ? '×' + x.delivered.toFixed(1) + 'k' : run ? (x.delivered * xProg(x, t)).toFixed(1) + 'k' : done ? x.delivered.toFixed(1) + 'k' : (x.mode === 'fixed' ? x.amt + 'k' : 'fill');
  }
}
function buildTicks() {
  const el = $('#ticks'); el.innerHTML = ''; const t0 = M.tStart, t1 = M.T_END;
  M.events.forEach(e => { if (e.minor) return; const i = document.createElement('i'); i.className = e.kind + (e.major ? ' m' : ''); i.style.left = ((e.t - t0) / (t1 - t0) * 100) + '%'; el.appendChild(i); });
}
const KIND = { xfer: 'Refuelling', abort: 'Abort', fail: 'Failure', storm: 'Weather', decision: 'Decision', attack: 'Attack', bomb: 'Strike', recovery: 'Recovery', rescue: 'Rescue', land: 'Landing', takeoff: 'Launch', info: 'Briefing' };
function showCaption(e) { const el = $('#caption'); el.className = 'glass show ' + e.kind; el.querySelector('.k').textContent = (KIND[e.kind] || 'Event') + ' · ' + hhmm(e.t) + 'Z'; el.querySelector('h3').textContent = e.title; el.querySelector('p').textContent = e.text; clearTimeout(S.capTimer); S.capTimer = setTimeout(hideCaption, 3200 + e.text.length * 30); if (e.bomb) S.shake = 1; }
function hideCaption() { $('#caption').classList.remove('show'); }
function renderLog() {
  if (S.logKey === S.evPtr) return; S.logKey = S.evPtr; const body = $('#logBody'), done = M.events.slice(0, S.evPtr).reverse(); let html = '';
  done.slice(0, 90).forEach((e, i) => { html += '<div class="lg ' + e.kind + (i === 0 ? ' top' : '') + (e.minor ? ' minor' : '') + '" data-t="' + e.t + '"><span class="t">' + hhmm(e.t) + '</span><i></i><div><b>' + e.title + '</b>' + (e.text ? '<p>' + e.text + '</p>' : '') + '</div></div>'; });
  body.innerHTML = html || '<div class="fine">The mission log fills as events happen.</div>'; setText('#logN', S.evPtr + ' / ' + M.events.length + ' events');
}

/* ============================================================================
   CHARTS
   ========================================================================== */
const CH = { pad: { l: 50, r: 64, t: 16, b: 24 }, layers: {} };
function layerCv(w, h) { const c = document.createElement('canvas'); c.width = w * DPR; c.height = h * DPR; const g = c.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, 0, 0); return [c, g]; }
const tAxis = (g, w, h, X, t0, t1) => { const { b } = CH.pad; g.font = '10px ui-monospace,Menlo,monospace'; g.fillStyle = 'rgba(150,175,210,.6)'; g.textAlign = 'center'; for (let m = Math.ceil(t0 / 120) * 120; m <= t1; m += 120) { const x = X(m); g.strokeStyle = 'rgba(150,175,210,.08)'; g.beginPath(); g.moveTo(x, CH.pad.t); g.lineTo(x, h - b); g.stroke(); g.fillText(hhmm(m).slice(0, 2) + 'Z', x, h - 8); } };
function buildChartLayers() {
  if (!M) return; const w = cvCh.clientWidth, h = cvCh.clientHeight; if (w < 40 || h < 40) return; CH.w = w; CH.h = h;
  const { l, r, t: pt, b } = CH.pad, t0 = M.tStart, t1 = M.T_END, X = tt => l + (tt - t0) / (t1 - t0) * (w - l - r); CH.X = X;
  { // range–time
    const RMAX = 3600, Y = rr => h - b - rr / RMAX * (h - pt - b); CH.Yr = Y; const [dim, gd] = layerCv(w, h), [bri, gb] = layerCv(w, h);
    gd.font = '10px ui-monospace,Menlo,monospace'; gd.textAlign = 'right';
    for (let rr = 0; rr <= 3500; rr += 500) { gd.strokeStyle = 'rgba(150,175,210,.09)'; gd.beginPath(); gd.moveTo(l, Y(rr)); gd.lineTo(w - r, Y(rr)); gd.stroke(); gd.fillStyle = 'rgba(150,175,210,.6)'; gd.fillText(rr.toLocaleString(), l - 6, Y(rr) + 3); }
    tAxis(gd, w, h, X, t0, t1); gd.save(); gd.translate(12, (pt + h - b) / 2); gd.rotate(-Math.PI / 2); gd.textAlign = 'center'; gd.fillStyle = 'rgba(150,175,210,.5)'; gd.fillText('RANGE FROM ASCENSION · nm', 0, 0); gd.restore();
    const draw = (g, am, wm) => {
      for (const id of M.ids) {
        const a = M.AC[id], col = acColor(a), i0 = Math.floor(a.tOn / M.DT), i1 = Math.min(M.N - 1, Math.floor(a.tOff / M.DT)); g.strokeStyle = col; g.globalAlpha = am * (a.kind === 'vulcan' ? 1 : 0.75); g.lineWidth = (a.kind === 'vulcan' ? 2.4 : 1.1) * wm; g.lineJoin = 'round'; g.beginPath();
        for (let i = i0; i <= i1; i += 4) { const x = X(i * M.DT), y = Y(a.rng[i]); i === i0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
      }
      g.globalAlpha = 1;
      for (const x of M.xs) { const a = M.AC[x.d], tm = (x.t0 + xEnd(x)) / 2, i = Math.round(tm / M.DT), px = X(tm), py = Y(a.rng[i]); g.fillStyle = x.fail ? COL.bad : x.r === M.V ? COL.vul : x.phase === 'out' ? '#ffb454' : COL.rec; g.globalAlpha = am < 1 ? 0.45 : 1; g.beginPath(); g.arc(px, py, x.r === M.V ? 3.4 : 2.6, 0, 7); g.fill(); }
      g.globalAlpha = 1;
    };
    draw(gd, 0.38, 1); draw(gb, 1, 1.15);
    gd.setLineDash([4, 4]); gd.strokeStyle = 'rgba(255,110,110,.4)'; gd.beginPath(); gd.moveTo(l, Y(3379)); gd.lineTo(w - r, Y(3379)); gd.stroke(); gd.setLineDash([]);
    gd.textAlign = 'left'; gd.fillStyle = 'rgba(255,150,150,.8)'; gd.fillText('STANLEY 3,380', w - r + 5, Y(3379) + 3);
    gd.fillStyle = 'rgba(130,240,225,.75)'; const lab = [['1S', 420], ['1A–1C', 900], ['2S–2D', 1680], ['3S–3B', 2380], ['H', 3070]]; lab.forEach(([n, rr]) => gd.fillText(n, w - r + 5, Y(rr) + 3)); gd.fillStyle = 'rgba(255,205,150,.7)'; gd.fillText('ASCENSION', w - r + 5, Y(0) + 3);
    // bomb marker
    gb.fillStyle = '#fff'; gb.font = '700 10px ui-monospace'; gb.textAlign = 'center'; gb.fillText('✸ BOMBS', X(M.tBR), Y(3379) - 8); gd.fillStyle = 'rgba(255,255,255,.35)'; gd.textAlign = 'center'; gd.fillText('✸ BOMBS', X(M.tBR), Y(3379) - 8);
    CH.layers.range = { dim, bri };
  }
  { // Vulcan fuel + altitude
    const mid = Math.round((h - pt - b) * 0.64) + pt, Yf = f => mid - 6 - f / 80 * (mid - 6 - (pt + 17)), Ya = alt => h - b - alt / 42000 * (h - b - mid - 8); CH.Yf = Yf; CH.mid = mid;
    const V = M.AC[M.V], T = M.AC[M.LSR], [dim, gd] = layerCv(w, h), [bri, gb] = layerCv(w, h);
    gd.font = '10px ui-monospace,Menlo,monospace'; gd.textAlign = 'right';
    for (let f = 0; f <= 80; f += 20) { gd.strokeStyle = 'rgba(150,175,210,.09)'; gd.beginPath(); gd.moveTo(l, Yf(f)); gd.lineTo(w - r, Yf(f)); gd.stroke(); gd.fillStyle = 'rgba(116,230,255,.6)'; gd.fillText(f + 'k', l - 6, Yf(f) + 3); }
    for (const a of [0, 20000, 40000]) { gd.strokeStyle = 'rgba(150,175,210,.06)'; gd.beginPath(); gd.moveTo(l, Ya(a)); gd.lineTo(w - r, Ya(a)); gd.stroke(); gd.fillStyle = 'rgba(190,200,220,.5)'; gd.fillText(a ? 'FL' + a / 100 : '0', l - 6, Ya(a) + 3); }
    tAxis(gd, w, h, X, t0, t1); gd.textAlign = 'left'; gd.fillStyle = 'rgba(116,230,255,.85)'; gd.fillText('━ ' + M.V + ' FUEL (klb)', l + 4, pt + 7); gd.fillStyle = 'rgba(255,180,84,.9)'; gd.fillText('━ ' + M.LSR + (M.flown ? ' · TUXFORD' : '') + ' FUEL (scaled ×1.5)', l + 130, pt + 7); gd.fillStyle = 'rgba(200,210,230,.7)'; gd.fillText('VULCAN ALTITUDE', l + 4, mid + 12);
    const i0 = Math.floor(V.tOn / M.DT), i1 = Math.min(M.N - 1, Math.floor(V.tOff / M.DT));
    const fill = (g, am) => {
      const gr = g.createLinearGradient(0, pt, 0, mid); gr.addColorStop(0, 'rgba(116,230,255,' + 0.5 * am + ')'); gr.addColorStop(1, 'rgba(116,230,255,' + 0.04 * am + ')'); g.fillStyle = gr; g.beginPath(); g.moveTo(X(V.tOn), mid - 6);
      for (let i = i0; i <= i1; i += 2) g.lineTo(X(i * M.DT), Yf(V.fuel[i])); g.lineTo(X(V.tOff), mid - 6); g.closePath(); g.fill();
      g.strokeStyle = '#74e6ff'; g.globalAlpha = am < 1 ? 0.5 : 1; g.lineWidth = 2; g.beginPath(); for (let i = i0; i <= i1; i += 2) { const x = X(i * M.DT), y = Yf(V.fuel[i]); i === i0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); g.globalAlpha = 1;
      const j0 = Math.floor(T.tOn / M.DT), j1 = Math.min(M.N - 1, Math.floor(T.tOff / M.DT)); g.strokeStyle = '#ffb454'; g.globalAlpha = am < 1 ? 0.35 : 0.9; g.lineWidth = 1.5; g.beginPath(); for (let i = j0; i <= j1; i += 2) { const x = X(i * M.DT), y = Yf(T.fuel[i] / 1.5); i === j0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); g.globalAlpha = 1;
      g.fillStyle = 'rgba(210,225,245,' + (0.5 * am + 0.1) + ')'; g.beginPath(); g.moveTo(X(V.tOn), h - b); for (let i = i0; i <= i1; i += 2) g.lineTo(X(i * M.DT), Ya(M.alt[i])); g.lineTo(X(V.tOff), h - b); g.closePath(); g.globalAlpha = 0.55; g.fill(); g.globalAlpha = 1;
      for (const x of M.xs) if (x.r === M.V && x.phase !== 'rv_') { const px = X((x.t0 + x.t1) / 2); g.fillStyle = 'rgba(255,180,84,' + (am < 1 ? 0.5 : 0.95) + ')'; g.font = '700 9.5px ui-monospace'; g.textAlign = 'center'; g.fillText('+' + x.delivered.toFixed(0) + 'k', px, Yf(V.fuel[Math.round(x.t1 / M.DT)]) - 7 - (x.phase === 'rv' ? 0 : 0)); g.fillRect(X(x.t0), pt + 12, Math.max(1.5, X(x.t1) - X(x.t0)), 3); }
    };
    fill(gd, 0.4); fill(gb, 1);
    gd.fillStyle = 'rgba(200,215,235,.55)'; gd.font = '9.5px ui-monospace'; gd.textAlign = 'center'; gd.fillText('hi–lo–lo–hi', X(M.tBR - 12), Ya(300) - 4);
    CH.layers.fuel = { dim, bri };
  }
  // relay layout
  const involved = new Set(); M.xs.filter(x => x.phase === 'out').forEach(x => { involved.add(x.d); involved.add(x.r); });
  const last = {}; M.xs.filter(x => x.phase === 'out').forEach(x => { [x.d, x.r].forEach(id => last[id] = Math.max(last[id] || 0, x.t1)); });
  const ordr = [...involved].filter(id => id !== M.V).sort((a, b) => last[a] - last[b] || a.localeCompare(b)); ordr.push(M.V);
  CH.relay = ordr; CH.dirty = true;
}
function drawChart(t, now) {
  const w = CH.w, h = CH.h; if (!w) return; ch.setTransform(DPR, 0, 0, DPR, 0, 0); ch.clearRect(0, 0, w, h); const { l, r, t: pt, b } = CH.pad, X = CH.X;
  if (S.chart === 'relay') { drawRelay(t, now); return; }
  const L = CH.layers[S.chart]; if (!L) return; ch.drawImage(L.dim, 0, 0, w, h); ch.save(); ch.beginPath(); ch.rect(0, 0, X(t), h); ch.clip(); ch.drawImage(L.bri, 0, 0, w, h); ch.restore();
  const xc = X(t); ch.strokeStyle = 'rgba(255,255,255,.85)'; ch.lineWidth = 1; ch.beginPath(); ch.moveTo(xc, pt); ch.lineTo(xc, h - b); ch.stroke();
  ch.fillStyle = '#fff'; ch.font = '600 10px ui-monospace,Menlo,monospace'; ch.textAlign = xc > w - 110 ? 'right' : 'left'; ch.fillText(hhmm(t) + 'Z', xc + (xc > w - 110 ? -5 : 5), pt + 10);
  if (S.chart === 'fuel') { const a = M.AC[M.V], s = smp(a, clamp(t, a.tOn, a.tOff)), alt = M.altV(t); ch.fillStyle = '#74e6ff'; ch.beginPath(); ch.arc(xc, CH.Yf(s.fuel), 4, 0, 7); ch.fill(); ch.textAlign = xc > w - 150 ? 'right' : 'left'; ch.fillStyle = '#e8f9ff'; ch.fillText(s.fuel.toFixed(1) + 'k lb · ' + (alt > 18000 ? 'FL' + Math.round(alt / 100) : Math.round(alt / 100) * 100 + ' ft'), xc + (xc > w - 150 ? -8 : 8), CH.Yf(s.fuel) - 8); }
  if (S.chart === 'range') { for (const id of M.ids) { const a = M.AC[id]; if (!airborne(a, t)) continue; const s = smp(a, t); ch.fillStyle = acColor(a); ch.beginPath(); ch.arc(xc, CH.Yr(s.rng), a.kind === 'vulcan' ? 4 : 2.4, 0, 7); ch.fill(); } }
}
function drawRelay(t, now) {
  const w = CH.w, h = CH.h, nodes = CH.relay, n = nodes.length, x0 = 46, x1 = w - 54, base = h * 0.60, pos = {}; nodes.forEach((id, i) => pos[id] = x0 + (x1 - x0) * i / (n - 1));
  ch.font = '10px ui-monospace,Menlo,monospace'; ch.textAlign = 'left'; ch.fillStyle = 'rgba(150,175,210,.6)'; ch.fillText('FUEL RELAY · arcs above the line carry fuel toward the Vulcan, arcs below hand it back · width = quantity · node fill = fuel on board', 12, 14);
  const xs = M.xs.filter(x => x.phase === 'out');
  for (const x of xs) {
    const a = pos[x.d], b = pos[x.r], p = xProg(x, t); if (t < x.t0 - 0.001) { ch.strokeStyle = 'rgba(150,175,210,.10)'; ch.lineWidth = 1; arc(a, b, false, 1, base); continue; }
    const wdt = 1.4 + x.delivered * 0.13; ch.lineCap = 'round'; ch.lineWidth = wdt; const grad = ch.createLinearGradient(a, 0, b, 0); const toV = x.r === M.V, bad = x.fail; grad.addColorStop(0, bad ? '#ff5d6c' : toV ? 'rgba(255,180,84,.95)' : 'rgba(255,180,84,.9)'); grad.addColorStop(1, bad ? '#ff5d6c' : toV ? 'rgba(116,230,255,.95)' : 'rgba(255,214,150,.9)'); ch.strokeStyle = grad; arc(a, b, true, p, base);
  }
  function arc(a, b, solid, p, base) { const up = b > a, c = (a + b) / 2, rr = Math.abs(b - a) / 2, th0 = up ? Math.PI : 0, dir = up ? 1 : -1; ch.beginPath(); const rad = Math.min(rr * 0.8, (up ? base - 30 : h - base - 52) ); ch.ellipse(c, base, rr, Math.max(6, rad), 0, th0, th0 + dir * Math.PI * p * (up ? 1 : -1) * 1, !up); ch.stroke(); }
  for (const id of nodes) {
    const a = M.AC[id], s = smp(a, clamp(t, a.tOn, a.tOff)), f = s.fuel, fr = clamp(f / a.cap, 0, 1), x = pos[id], on = airborne(a, t) && !(a.tTurn != null && t > a.tTurn + 0.5 && a.kind !== 'vulcan'), isV = a.kind === 'vulcan';
    ch.fillStyle = '#0a1424'; ch.strokeStyle = isV ? COL.vul : COL.tk; ch.lineWidth = 2; ch.beginPath(); ch.arc(x, base, isV ? 13 : 9, 0, 7); ch.fill(); ch.stroke();
    ch.fillStyle = fr < 0.12 ? COL.bad : isV ? COL.vul : COL.tk; ch.globalAlpha = on ? 1 : 0.4; ch.beginPath(); ch.moveTo(x, base); ch.arc(x, base, isV ? 10.5 : 6.5, -Math.PI / 2, -Math.PI / 2 + fr * Math.PI * 2); ch.closePath(); ch.fill(); ch.globalAlpha = 1;
    ch.textAlign = 'center'; ch.font = '700 10.5px ui-monospace,Menlo,monospace'; ch.fillStyle = isV ? '#c9f4ff' : '#ffe0b0'; ch.fillText(id, x, base + 26); ch.font = '10px ui-monospace,Menlo,monospace'; ch.fillStyle = 'rgba(200,215,235,.65)'; ch.fillText(f.toFixed(0) + 'k', x, base + 38);
  }
  const rec = xs.filter(x => x.r === M.V).reduce((s, x) => s + x.delivered * (t >= xEnd(x) ? 1 : xProg(x, t)), 0);
  ch.textAlign = 'right'; ch.font = '700 11px ui-monospace,Menlo,monospace'; ch.fillStyle = COL.vul; ch.fillText('XM607 has received ' + rec.toFixed(1) + 'k lb through ' + xs.filter(x => x.r === M.V && t >= x.t0).length + ' contacts', w - 12, h - 8);
}

/* ============================================================================
   INTERACTION
   ========================================================================== */
function setPlaying(p) { S.playing = p; $('#icPlay').innerHTML = p ? '<path d="M3 2h4v12H3zM9 2h4v12H9z"/>' : '<path d="M4 2l10 6-10 6z"/>'; }
function nextMajor(dir) { const ev = M.events.filter(e => !e.minor && e.major); if (dir > 0) return ev.find(e => e.t > S.t + 0.05); for (let i = ev.length - 1; i >= 0; i--) if (ev[i].t < S.t - 0.4) return ev[i]; return ev[0]; }
function jumpEvent(dir) { const e = nextMajor(dir); if (!e) return; seek(e.t - 0.2, true); showCaption(e); S.evPtr = M.events.indexOf(e) + 1; S.logKey = -1; }
function setCam(m) { S.cam = m; $$('#segCam button').forEach(b => b.classList.toggle('on', b.dataset.v === m)); if (m === 'over') setOverview(false); }
function zoomAt(px, py, f) { const [la, lo] = unP(px, py); cam.k = clamp(cam.k * f, 8, 3.4e6); const [la2, lo2] = unP(px, py); cam.x += (lo - lo2) * D2R; cam.y += mercY(la) - mercY(la2); tgt.x = cam.x; tgt.y = cam.y; tgt.k = cam.k; }
function bindUI() {
  $('#bPlay').onclick = () => { if (S.t >= M.T_END - 1.2) seek(M.tStart); setPlaying(!S.playing); };
  $('#bRestart').onclick = () => { seek(M.tStart); S.shake = 0; };
  $('#bBack').onclick = () => seek(S.t - 5); $('#bFwd').onclick = () => seek(S.t + 5); $('#bNext').onclick = () => jumpEvent(1);
  $$('#spd button').forEach(b => b.onclick = () => { S.mult = parseFloat(b.dataset.m); $$('#spd button').forEach(q => q.classList.toggle('on', q === b)); });
  $('#smart').onclick = () => { S.smart = !S.smart; $('#smart').classList.toggle('on', S.smart); };
  const scrub = $('#scrub'); scrub.addEventListener('input', () => { seek(parseFloat(scrub.value), true); });
  $$('#segScn button').forEach(b => b.onclick = () => { if (b.dataset.v !== S.scn) { const t = S.t; load(b.dataset.v); seek(Math.min(t, M.T_END - 2), true); } });
  $$('#segCam button').forEach(b => b.onclick = () => setCam(b.dataset.v));
  $$('#tgOpts button').forEach(b => b.onclick = () => { const k = b.dataset.o; S.o[k] = !S.o[k]; b.classList.toggle('on', S.o[k]); if (k === 'narrate' && !S.o[k]) hideCaption(); });
  $$('#tabs button').forEach(b => b.onclick = () => { S.tab = b.dataset.p; $$('#tabs button').forEach(q => q.classList.toggle('on', q === b)); $$('.pane').forEach(p => p.classList.remove('on')); $('#p' + S.tab[0].toUpperCase() + S.tab.slice(1)).classList.add('on'); });
  $$('#ctabs button').forEach(b => b.onclick = () => { S.chart = b.dataset.c; $$('#ctabs button').forEach(q => q.classList.toggle('on', q === b)); });
  $('#logBody').addEventListener('click', e => { const el = e.target.closest('.lg'); if (el) seek(parseFloat(el.dataset.t) - 0.1, true); });
  cvCh.addEventListener('click', e => { const r = cvCh.getBoundingClientRect(), x = e.clientX - r.left, { l, r: rr } = CH.pad; if (S.chart === 'relay') return; const f = (x - l) / (CH.w - l - rr); seek(M.tStart + clamp(f, 0, 1) * (M.T_END - M.tStart), true); });
  // map interaction
  let drag = null;
  cvMap.addEventListener('pointerdown', e => { cvMap.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, moved: 0 }; cvMap.classList.add('drag'); });
  cvMap.addEventListener('pointermove', e => {
    const r = cvMap.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.moved += Math.abs(dx) + Math.abs(dy); drag.x = e.clientX; drag.y = e.clientY; if (drag.moved > 4) { if (S.cam !== 'free') setCam('free'); cam.x -= dx / cam.k; cam.y += dy / cam.k; tgt.x = cam.x; tgt.y = cam.y; tgt.k = cam.k; } return; }
    const hit = (S.hit || []).filter(q => Math.hypot(q.x - mx, q.y - my) < q.r + 6).sort((a, b) => Math.hypot(a.x - mx, a.y - my) - Math.hypot(b.x - mx, b.y - my))[0], hv = $('#hover');
    if (hit) { const a = M.AC[hit.id], st = M.statusOf(hit.id, S.t), s = smp(a, clamp(S.t, a.tOn, a.tOff)), i = a.info || {}; hv.innerHTML = '<b>' + hit.id + (i.serial ? ' · ' + i.serial : '') + '</b>' + (i.crew ? '<div>' + i.crew + '</div>' : '') + '<div class="m">' + (i.role || '') + '</div><div class="m">' + st.s + (s.fuel != null ? ' · ' + s.fuel.toFixed(1) + 'k lb' : '') + '</div>'; hv.style.left = Math.min(r.width - 260, mx + 16) + 'px'; hv.style.top = Math.max(4, my - 10) + 'px'; hv.style.opacity = 1; cvMap.style.cursor = 'pointer'; } else { hv.style.opacity = 0; cvMap.style.cursor = ''; }
  });
  cvMap.addEventListener('pointerup', e => { const was = drag && drag.moved <= 4; drag = null; cvMap.classList.remove('drag'); if (was) { const r = cvMap.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top, hit = (S.hit || []).find(q => Math.hypot(q.x - mx, q.y - my) < q.r + 6); if (hit) { selectAC(hit.id); } else if (S.sel) selectAC(S.sel); } });
  cvMap.addEventListener('pointerleave', () => { $('#hover').style.opacity = 0; });
  cvMap.addEventListener('wheel', e => { e.preventDefault(); const r = cvMap.getBoundingClientRect(); if (S.cam !== 'free') setCam('free'); zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.0016)); }, { passive: false });
  cvMap.addEventListener('dblclick', () => setCam('auto'));
  $('#zIn').onclick = () => { setCam('free'); zoomAt(W / 2, H / 2, 1.6); }; $('#zOut').onclick = () => { setCam('free'); zoomAt(W / 2, H / 2, 1 / 1.6); }; $('#zHome').onclick = () => setCam('auto');
  // modals
  const open = id => $(id).classList.add('on'), close = id => $(id).classList.remove('on');
  $('#btnAbout').onclick = () => { open('#about'); setPlaying(false); }; $('#btnGoAbout').onclick = () => open('#about'); $('#btnAboutClose').onclick = () => close('#about');
  $('#btnGo').onclick = () => { close('#intro'); setCam('auto'); setPlaying(true); };
  $('#btnReplay').onclick = () => { close('#endm'); seek(M.tStart); setPlaying(true); }; $('#btnEndClose').onclick = () => close('#endm');
  $$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m && m.id !== 'intro') m.classList.remove('on'); }));
  window.addEventListener('keyup', e => { if (e.key === ' ' && e.target.tagName !== 'INPUT') e.preventDefault(); });
  window.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' && e.key !== ' ') { if (e.key.startsWith('Arrow')) e.target.blur(); else return; }
    if ($('#intro').classList.contains('on')) { if (e.key === 'Enter') $('#btnGo').click(); return; }
    const k = e.key;
    if (k === ' ') { e.preventDefault(); $('#bPlay').click(); } else if (k === 'ArrowRight') seek(S.t + (e.shiftKey ? 30 : 5)); else if (k === 'ArrowLeft') seek(S.t - (e.shiftKey ? 30 : 5));
    else if (k === 'n' || k === 'N') jumpEvent(1); else if (k === 'p' || k === 'P') jumpEvent(-1); else if (k === 'Home') seek(M.tStart);
    else if (k === 'c' || k === 'C') { const o = ['auto', 'over', 'vulcan', 'free']; setCam(o[(o.indexOf(S.cam) + 1) % o.length]); }
    else if (k === 'Escape') { $$('.modal').forEach(m => { if (m.id !== 'intro') m.classList.remove('on'); }); }
    else if (k === '+' || k === '=') $('#zIn').click(); else if (k === '-') $('#zOut').click();
    else if (k === 'l' || k === 'L') $('[data-o=labels]').click(); else if (k === 't' || k === 'T') $('[data-o=trails]').click();
  });
}
function showEnd() {
  if (S.endShown) return; S.endShown = true;
  const xs = M.xs.filter(x => !x.give && x.phase === 'out'), tot = M.xs.reduce((s, x) => s + x.delivered, 0), toV = M.xs.filter(x => x.r === M.V).reduce((s, x) => s + x.delivered, 0), nV = M.xs.filter(x => x.r === M.V && !x.fail).length;
  $('#endTxt').textContent = M.flown ? 'Withers’ crew laid 21 bombs across Port Stanley’s runway and brought XM607 home on an eleven-tanker chain that came close to unravelling: a probe snapped in a storm, a tanker pressed on below fuel minima, and the last transfer fell about 7,000 lb short. It held because the plan could flex — and because individual crews made hard calls.' : 'On the RAF’s plan the chain delivers the Vulcan to the last bracket with full tanks and 14,000 lb in hand at the Rio rendezvous. Nothing in this run goes wrong — which is exactly why the real mission, with its aborts, storm and a snapped probe, was such a close-run thing.';
  $('#endSum').innerHTML = [[Math.round(tot) + 'k lb', 'passed between aircraft in this model'], [toV.toFixed(0) + 'k lb', 'delivered into the Vulcan in ' + nV + ' contacts'], [xs.length + ' + ' + M.xs.filter(x => x.phase !== 'out').length, 'outbound transfers + recovery transfers']].map(([a, b]) => '<div class="tile"><b>' + a + '</b><span>' + b + '</span></div>').join('');
  setTimeout(() => $('#endm').classList.add('on'), 600);
}

/* ============================================================================
   HUD + MAIN LOOP
   ========================================================================== */
function phaseOf(t, act) {
  if (t < M.tR1) return ['Standing by at Wideawake', 'ok']; if (t < M.tR1 + 13) return ['Launch · 13 aircraft, one-minute intervals', 'ok'];
  if (M.storm && t >= M.storm.t0 && t <= M.storm.t1 + 3) return ['Outbound · thunderstorms at 40°S', 'warn'];
  const fail = act.find(x => x.fail && t > x.failAt); if (fail) return ['Probe broken · chain in trouble', 'bad'];
  if (t < M.tH1e) { const n = M.order.filter(id => { const a = M.AC[id]; return airborne(a, t) && !(a.tTurn != null && t > a.tTurn); }).length; return act.length ? ['Refuelling · bracket ' + act[0].br, 'xfer'] : ['Outbound · ' + n + ' aircraft still in the chain', 'ok']; }
  if (t < M.tPU) return ['Low-level run-in · ~300 nm to Stanley', 'att']; if (t < M.tBR) return ['Bomb run', 'att']; if (t < M.tBR + 12) return ['Bombs away · escaping north', 'att'];
  if (act.length) return [act[0].br === 'RESCUE' ? 'Rescue contact · Seymour → Tuxford' : act[0].br === 'RV' ? 'Rio RV · the last refuelling' : 'Recovery · refuelling', 'xfer'];
  if (t < M.tRV0) return ['Return · Vulcan short of fuel, racing for the Rio RV', 'warn']; if (t < M.tLandV - 2) return ['Homeward · every aircraft accounted for', 'ok']; return ['Mission complete', 'ok'];
}
function updateHUD(t) {
  const act = M.xs.filter(x => xActive(x, t)), z = 22 + t / 60, zh = ((z % 24) + 24) % 24; const hh = hhmm(t);
  setHTML('#clk', hh + '<small>Z</small>'); setText('#clkDay', (22 * 60 + t) >= 1440 ? '1 MAY 1982' : '30 APR 1982');
  const loc = (off) => { let m = Math.round(22 * 60 + t + off * 60); m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
  setText('#clkLoc', 'STANLEY ' + loc(-3) + ' (UTC−3) · ASCENSION ' + loc(0));
  const [ph, k] = phaseOf(t, act); setText('#phase', ph); $('#phDot').style.background = k === 'bad' ? COL.bad : k === 'warn' ? '#b995ff' : k === 'xfer' ? '#ffb454' : k === 'att' ? '#74e6ff' : '#5af0a4'; $('#phDot').style.boxShadow = '0 0 10px ' + $('#phDot').style.background;
  const V = M.AC[M.V], s = smp(V, clamp(t, V.tOn, V.tOff)), alt = M.altV(t), on = airborne(V, t);
  setHTML('#stFuel', (on || t > V.tOff ? s.fuel.toFixed(1) : '74.0') + '<em>klb</em>'); $('#stFuel').parentElement.className = 'stat ' + (s.fuel < 12 && t > M.tBR ? 'warn' : 'good');
  setText('#stAlt', !on ? '—' : alt < 1500 ? Math.round(alt / 50) * 50 + ' ft' : alt < 18000 ? Math.round(alt / 100) * 100 + ' ft' : 'FL' + Math.round(alt / 100));
  setHTML('#stRng', Math.round(on ? s.rng : 0).toLocaleString() + '<em>nm</em>');
  const done = M.xsOut.filter(x => t >= xEnd(x)).length; setHTML('#stX', done + '<em>/' + M.xsOut.length + '</em>');
  setText('#stAir', String(M.ids.filter(id => airborne(M.AC[id], t)).length));
  const sc = $('#scrub'); if (document.activeElement !== sc) sc.value = t; sc.style.setProperty('--p', ((t - M.tStart) / (M.T_END - M.tStart) * 100) + '%');
  setHTML('#tread', hh + 'Z<small>T+' + String(Math.floor((t - M.tR1) / 60 < 0 ? 0 : (t - M.tR1) / 60)).padStart(2, '0') + ':' + String(Math.floor(Math.max(0, t - M.tR1) % 60)).padStart(2, '0') + ' since first take-off</small>');
}
function frame(now) {
  const dt = Math.min(0.1, (now - (S.last || now)) / 1000); S.last = now; const sec = now / 1000;
  if (S.playing) {
    const sp = S.smart ? pace(S.t) : 300; S.t += dt * sp * S.mult / 60;
    while (S.evPtr < M.events.length && M.events[S.evPtr].t <= S.t) { const e = M.events[S.evPtr++]; if (e.major && S.o.narrate && S.t - e.t < 5) showCaption(e); S.logKey = -1; }
    if (S.t >= M.T_END - 1) { S.t = M.T_END - 1; setPlaying(false); showEnd(); }
  }
  S.shake = Math.max(0, S.shake - dt * 1.4);
  updateCamera(S.t, dt); renderMap(S.t, sec); drawContact(S.t, sec); updateHUD(S.t); updatePanes(S.t); renderLog(); drawChart(S.t, sec);
  requestAnimationFrame(frame);
}

/* ---------- boot ---------- */
window.addEventListener('resize', resize);
if (window.ResizeObserver) { const ro = new ResizeObserver(() => resize()); ro.observe($('#mapwrap')); ro.observe($('#chartBox')); }
resize(); bindUI(); setOverview(true); load('flown'); seek(M.tStart, true); setCam('over'); requestAnimationFrame(frame);
window.__BB = { S, get M() { return M; }, seek, setPlaying, setCam, load, cam, showEnd };
})();
