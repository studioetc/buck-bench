/* ============================================================================
   BLACK BUCK — simulation front-end
   ========================================================================== */
(function () {
'use strict';
const BB = window.BlackBuck, D2R = Math.PI / 180;
const $ = s => document.querySelector(s), $$ = s => Array.from(document.querySelectorAll(s));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, f) => a + (b - a) * f;
const smooth = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const mercY = la => Math.log(Math.tan(Math.PI / 4 + la * D2R / 2));
const invMercY = y => (2 * Math.atan(Math.exp(y)) - Math.PI / 2) / D2R;
const hhmm = BB.hhmm;
const fmtK = v => (v == null ? '—' : v.toFixed(1));
const COL = { tk: '#ffb454', rec: '#46d9c6', vul: '#74e6ff', nim: '#b995ff', ok: '#5af0a4', bad: '#ff5d6c' };

/* ---------- state ---------- */
const S = { scn: 'flown', t: 0, playing: false, mult: 1, smart: true, cam: 'auto', sel: null, selX: null,
  o: { labels: true, trails: true, night: true, narrate: true }, tab: 'fuel', chart: 'range', evPtr: 0, capTimer: 0, endShown: false, shake: 0 };
let M = null;

/* ---------- canvases ---------- */
const cvMap = $('#map'), cx = cvMap.getContext('2d');
const cvC = $('#contact'), cc = cvC.getContext('2d');
const cvCh = $('#chartCv'), ch = cvCh.getContext('2d');
let W = 800, H = 600, DPR = 1;
const night = document.createElement('canvas'), nctx = night.getContext('2d');
function fitCanvas(cv, ctx) { const r = cv.getBoundingClientRect(); const w = Math.max(10, r.width), h = Math.max(10, r.height); cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); return [w, h]; }
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  [W, H] = fitCanvas(cvMap, cx); fitCanvas(cvC, cc); fitCanvas(cvCh, ch);
  night.width = Math.ceil(W / 10); night.height = Math.ceil(H / 10);
  if (M) { buildChartLayers(); }
  if (S.cam === 'over') setOverview(true);
}

/* ---------- coastline ---------- */
const LAND = COAST.map(poly => {
  const rings = poly.map(r => {
    const n = r.length / 2, xs = new Float64Array(n), ys = new Float64Array(n); let x = 0, y = 0, a = 1e9, b = 1e9, c = -1e9, d = -1e9;
    for (let i = 0; i < n; i++) { x += r[2 * i]; y += r[2 * i + 1]; xs[i] = x / 1000 * D2R; ys[i] = mercY(clamp(y / 1000, -85, 85)); a = Math.min(a, xs[i]); c = Math.max(c, xs[i]); b = Math.min(b, ys[i]); d = Math.max(d, ys[i]); }
    return { xs, ys, bb: [a, b, c, d] };
  });
  return { rings, bb: [Math.min(...rings.map(r => r.bb[0])), Math.min(...rings.map(r => r.bb[1])), Math.max(...rings.map(r => r.bb[2])), Math.max(...rings.map(r => r.bb[3]))] };
});

/* ---------- camera ---------- */
const cam = { x: -0.7, y: mercY(-30), k: 300 }, tgt = { x: -0.7, y: mercY(-30), k: 300 };
const P = (lat, lon) => [(lon * D2R - cam.x) * cam.k + W / 2, H / 2 - (mercY(lat) - cam.y) * cam.k];
const PM = (mx, my) => [(mx - cam.x) * cam.k + W / 2, H / 2 - (my - cam.y) * cam.k];
const unP = (px, py) => [invMercY(cam.y - (py - H / 2) / cam.k), (cam.x + (px - W / 2) / cam.k) / D2R];
const nmPerPx = () => 3440.065 * Math.cos(invMercY(cam.y) * D2R) / cam.k;
function setTargetSpan(lat, lon, spanDeg) { tgt.x = lon * D2R; tgt.y = mercY(lat); tgt.k = W / (spanDeg * D2R); }
function setOverview(snap) {
  const lon0 = -79, lon1 = 14, lat0 = 5, lat1 = -57, kx = W / ((lon1 - lon0) * D2R), ky = H / (mercY(lat0) - mercY(lat1));
  tgt.k = Math.min(kx, ky) * 0.97; tgt.x = (lon0 + lon1) / 2 * D2R; tgt.y = (mercY(lat0) + mercY(lat1)) / 2;
  if (snap) { cam.x = tgt.x; cam.y = tgt.y; cam.k = tgt.k; }
}

/* ---------- sampling ---------- */
function smp(a, t) {
  const f = clamp(t / M.DT, 0, M.N - 1.001), i = f | 0, u = f - i;
  const h0 = a.hdg[i], h1 = a.hdg[i + 1], dh = ((h1 - h0 + 540) % 360) - 180;
  return { mx: lerp(a.mx[i], a.mx[i + 1], u), my: lerp(a.my[i], a.my[i + 1], u), lat: lerp(a.lat[i], a.lat[i + 1], u), lon: lerp(a.lon[i], a.lon[i + 1], u),
    hdg: (h0 + dh * u + 360) % 360, fuel: a.fuel ? lerp(a.fuel[i], a.fuel[i + 1], u) : null, rng: lerp(a.rng[i], a.rng[i + 1], u) };
}
const airborne = (a, t) => t >= a.tOn - 0.6 && t <= a.tOff + 1.5;
const xEnd = x => x.fail ? x.failAt : x.t1;
const xActive = (x, t) => t >= x.t0 && t <= (x.fail ? x.failAt + 3.5 : x.t1);
const xProg = (x, t) => clamp((t - x.t0) / Math.max(0.01, xEnd(x) - x.t0), 0, 1);
const lab = id => id;
const serialOf = id => { const a = M.AC[id]; return a && a.info && a.info.serial ? a.info.serial : ''; };

/* ---------- sun ---------- */
function sunCos(lat, lon, t) {
  const Z = ((22 + t / 60) % 24 + 24) % 24, dec = 14.9 * D2R, lonS = -(Z - 12 + 0.05) * 15, Hh = (lon - lonS) * D2R;
  return Math.sin(lat * D2R) * Math.sin(dec) + Math.cos(lat * D2R) * Math.cos(dec) * Math.cos(Hh);
}

/* ---------- silhouettes (top view, nose up, unit half-length) ---------- */
function mkPath(pts) { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); for (let i = pts.length - 2; i >= 0; i--) p.lineTo(-pts[i][0], pts[i][1]); p.closePath(); return p; }
const SIL = {
  victor: mkPath([[0, -1], [0.055, -0.94], [0.085, -0.78], [0.092, -0.52], [0.1, -0.33], [0.58, -0.04], [0.99, 0.30], [0.99, 0.40], [0.60, 0.31], [0.12, 0.52], [0.085, 0.72], [0.30, 0.90], [0.30, 0.98], [0.055, 0.95], [0, 1]]),
  vulcan: mkPath([[0, -1], [0.03, -0.9], [0.06, -0.72], [0.50, 0.05], [1.0, 0.66], [1.0, 0.80], [0.62, 0.80], [0.26, 0.86], [0.12, 0.93], [0, 0.98]]),
  nimrod: mkPath([[0, -1], [0.05, -0.9], [0.07, -0.5], [0.08, -0.1], [0.78, 0.20], [0.78, 0.31], [0.10, 0.22], [0.07, 0.60], [0.32, 0.88], [0.32, 0.96], [0.04, 0.93], [0, 1]]),
};
function drawAC(c, kind, x, y, hdg, size, col, o) {
  o = o || {};
  c.save(); c.translate(x, y); c.rotate(hdg * D2R); const s = size / 2; c.scale(s, s);
  if (o.glow) { c.shadowColor = o.glow; c.shadowBlur = o.glowPx || 14; }
  c.globalAlpha = o.alpha == null ? 1 : o.alpha;
  c.fillStyle = col; c.fill(SIL[kind]);
  c.shadowBlur = 0; c.lineWidth = 1.2 / s; c.strokeStyle = 'rgba(2,8,16,.85)'; c.stroke(SIL[kind]);
  if (kind === 'victor' && o.pods !== false) { c.fillStyle = 'rgba(40,20,0,.7)'; for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * 0.47, 0.03, 0.045, 0.13, 0, 0, 7); c.fill(); } }
  if (kind === 'vulcan') { c.strokeStyle = 'rgba(2,8,16,.55)'; c.lineWidth = 0.8 / s; c.beginPath(); c.moveTo(0, -0.7); c.lineTo(0, 0.85); c.stroke(); }
  if (o.probe) { c.strokeStyle = col; c.lineWidth = 1.6 / s; c.beginPath(); c.moveTo(0, -1); c.lineTo(0, -1.22); c.stroke(); }
  c.restore();
}

/* ---------- compile / scenario ---------- */
function load(scn) {
  S.scn = scn; M = BB.compile({ scenario: scn });
  M.ids.forEach(id => { const a = M.AC[id]; a.mx = new Float64Array(M.N); a.my = new Float64Array(M.N); for (let i = 0; i < M.N; i++) { a.mx[i] = a.lon[i] * D2R; a.my[i] = mercY(a.lat[i]); } });
  M.xs = M.T.slice().sort((a, b) => a.t0 - b.t0);
  M.xsOut = M.xs.filter(x => x.phase === 'out' && !x.give);
  $('#scrub').min = M.tStart; $('#scrub').max = M.T_END; $('#scrub').step = 0.02;
  buildPanes(); buildTicks(); buildChartLayers();
  $$('#segScn button').forEach(b => b.classList.toggle('on', b.dataset.v === scn));
  S.sel = null; S.selX = null;
  const nx = M.xs.filter(x => !x.give).length; $('#stX').innerHTML = '0<em>/' + M.xsOut.length + '</em>';
  seek(S.t || M.tStart, true);
}
function seek(t, quiet) {
  S.t = clamp(t, M.tStart, M.T_END - 0.01);
  let lo = 0, hi = M.events.length; while (lo < hi) { const m = (lo + hi) >> 1; if (M.events[m].t <= S.t) lo = m + 1; else hi = m; }
  S.evPtr = lo; S.logKey = -1; if (!quiet) hideCaption();
  S.endShown = S.t >= M.T_END - 1.5; S.snap = true;
}

/* ---------- pace ---------- */
function pace(t) {
  let v = 900;
  for (const [a, b, sp] of M.slowWin) { const d = t < a ? a - t : t > b ? t - b : 0, f = 1 - clamp(d / 4, 0, 1); if (f > 0) v = Math.min(v, lerp(900, sp, smooth(f))); }
  return v;
}

/* ============================================================================
   MAP RENDERING
   ========================================================================== */
const PLACES = [
  { n: 'ASCENSION', sub: 'Wideawake', lat: -7.9696, lon: -14.3936, thr: 1e9, c: '#ffd9a0' },
  { n: 'PORT STANLEY', lat: -51.693, lon: -57.85, thr: 1e9, c: '#ffd9a0', dx: -8, al: 'right' },
  { n: 'Rio de Janeiro', lat: -22.91, lon: -43.17, thr: 1e9 }, { n: 'Buenos Aires', lat: -34.6, lon: -58.4, thr: 1e9, al: 'right', dx: -6 },
  { n: 'Montevideo', lat: -34.9, lon: -56.2, thr: 4, al: 'left', dx: 6, dy: 10 }, { n: 'Recife', lat: -8.05, lon: -34.88, thr: 1e9 }, { n: 'Salvador', lat: -12.97, lon: -38.5, thr: 12 },
  { n: 'Luanda', lat: -8.84, lon: 13.23, thr: 1e9 }, { n: 'St Helena', lat: -15.95, lon: -5.72, thr: 1e9 }, { n: 'Tristan da Cunha', lat: -37.1, lon: -12.3, thr: 1e9 },
  { n: 'South Georgia', lat: -54.3, lon: -36.6, thr: 1e9 }, { n: 'Río Gallegos', lat: -51.62, lon: -69.3, thr: 9, al: 'right', dx: -6 }, { n: 'Río Grande', lat: -53.78, lon: -67.7, thr: 9, al: 'right', dx: -6 },
  { n: 'Comodoro Rivadavia', lat: -45.87, lon: -67.5, thr: 12, al: 'right', dx: -6 }, { n: 'Mar del Plata', lat: -38.0, lon: -57.55, thr: 8, al: 'right', dx: -6 }, { n: 'Cape Town', lat: -33.92, lon: 18.42, thr: 1e9, al: 'right', dx: -6 },
];
const BIGLAB = [['BRAZIL', -11, -50], ['ARGENTINA', -39, -67], ['ANGOLA', -12.5, 17], ['NAMIBIA', -22, 17.5], ['URUGUAY', -32.5, -56], ['S O U T H   A T L A N T I C   O C E A N', -27, -25], ['CHILE', -45, -73.8]];

function drawOcean() {
  const g = cx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0f3358'); g.addColorStop(0.55, '#0b2b4c'); g.addColorStop(1, '#08213b');
  cx.fillStyle = g; cx.fillRect(0, 0, W, H);
}
function drawGraticule() {
  const pxDeg = cam.k * D2R; let step = 1; for (const s of [1, 2, 5, 10, 15, 20, 30]) { step = s; if (s * pxDeg >= 90) break; }
  const [la1, lo0] = unP(0, 0), [la0, lo1] = unP(W, H);
  cx.lineWidth = 1; cx.strokeStyle = 'rgba(150,190,235,.07)'; cx.fillStyle = 'rgba(150,190,235,.32)'; cx.font = '10px ui-monospace,Menlo,monospace';
  cx.beginPath();
  for (let lat = Math.floor(la0 / step) * step; lat <= la1; lat += step) { const y = P(lat, 0)[1]; cx.moveTo(0, y); cx.lineTo(W, y); }
  for (let lon = Math.floor(lo0 / step) * step; lon <= lo1; lon += step) { const x = P(0, lon)[0]; cx.moveTo(x, 0); cx.lineTo(x, H); }
  cx.stroke();
  cx.textAlign = 'left';
  for (let lat = Math.floor(la0 / step) * step; lat <= la1; lat += step) { const y = P(lat, 0)[1]; if (y > 14 && y < H - 8) cx.fillText(Math.abs(lat) + '°' + (lat < 0 ? 'S' : 'N'), 6, y - 3); }
  cx.textAlign = 'center';
  for (let lon = Math.floor(lo0 / step) * step; lon <= lo1; lon += step) { const x = P(0, lon)[0]; if (x > 20 && x < W - 20) cx.fillText(Math.abs(lon) + '°' + (lon < 0 ? 'W' : 'E'), x, H - 6); }
}
function drawRings() {
  if (nmPerPx() < 1.6) return;
  cx.save(); cx.setLineDash([2, 7]); cx.strokeStyle = 'rgba(255,200,130,.16)'; cx.lineWidth = 1; cx.font = '10px ui-monospace,Menlo,monospace'; cx.fillStyle = 'rgba(255,205,150,.5)'; cx.textAlign = 'center';
  for (const r of [1000, 2000, 3000]) {
    cx.beginPath();
    for (let b = 0; b <= 360; b += 4) { const p = BB.dest(BB.ASC, b, r), [x, y] = P(p[0], p[1]); b ? cx.lineTo(x, y) : cx.moveTo(x, y); }
    cx.stroke();
    const p = BB.dest(BB.ASC, 155, r), [x, y] = P(p[0], p[1]); cx.fillText(r.toLocaleString() + ' nm', x, y);
  }
  cx.restore();
}
function drawLand() {
  const x0 = cam.x - W / 2 / cam.k, x1 = cam.x + W / 2 / cam.k, y0 = cam.y - H / 2 / cam.k, y1 = cam.y + H / 2 / cam.k;
  const smoothPath = nmPerPx() < 0.7; cx.beginPath();
  for (const poly of LAND) {
    if (poly.bb[2] < x0 || poly.bb[0] > x1 || poly.bb[3] < y0 || poly.bb[1] > y1) continue;
    for (const r of poly.rings) {
      if (r.bb[2] < x0 || r.bb[0] > x1 || r.bb[3] < y0 || r.bb[1] > y1) continue;
      const n = r.xs.length;
      if (smoothPath && n > 3) {
        const X = i => (r.xs[i] - cam.x) * cam.k + W / 2, Y = i => H / 2 - (r.ys[i] - cam.y) * cam.k;
        cx.moveTo((X(n - 1) + X(0)) / 2, (Y(n - 1) + Y(0)) / 2);
        for (let i = 0; i < n; i++) { const j = (i + 1) % n; cx.quadraticCurveTo(X(i), Y(i), (X(i) + X(j)) / 2, (Y(i) + Y(j)) / 2); }
      } else {
        cx.moveTo((r.xs[0] - cam.x) * cam.k + W / 2, H / 2 - (r.ys[0] - cam.y) * cam.k);
        for (let i = 1; i < n; i++) cx.lineTo((r.xs[i] - cam.x) * cam.k + W / 2, H / 2 - (r.ys[i] - cam.y) * cam.k);
      }
      cx.closePath();
    }
  }
  const g = cx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a4d3d'); g.addColorStop(1, '#223f33');
  cx.fillStyle = g; cx.fill('evenodd');
  cx.lineJoin = 'round'; cx.strokeStyle = 'rgba(110,190,160,.14)'; cx.lineWidth = 5; cx.stroke();
  cx.strokeStyle = 'rgba(150,225,190,.65)'; cx.lineWidth = 1; cx.stroke();
  // big labels
  cx.textAlign = 'center'; cx.font = '700 ' + clamp(cam.k * 0.0085, 10, 17) + 'px ui-sans-serif,system-ui'; cx.fillStyle = 'rgba(190,230,210,.18)';
  for (const [n, la, lo] of BIGLAB) { const [x, y] = P(la, lo); if (x > -50 && x < W + 50 && y > -20 && y < H + 20) { cx.save(); cx.translate(x, y); if (n[0] === 'S' && n.length > 12) { cx.fillStyle = 'rgba(160,205,245,.16)'; cx.font = '600 ' + clamp(cam.k * 0.0075, 10, 19) + 'px ui-sans-serif'; } cx.fillText(n, 0, 0); cx.restore(); cx.fillStyle = 'rgba(190,230,210,.18)'; cx.font = '700 ' + clamp(cam.k * 0.0085, 10, 17) + 'px ui-sans-serif,system-ui'; } }
}
function drawNight() {
  if (!S.o.night) return;
  const w = night.width, h = night.height, img = nctx.createImageData(w, h), d = img.data, sx = W / w, sy = H / h;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const [lat, lon] = unP((i + 0.5) * sx, (j + 0.5) * sy), c = sunCos(clamp(lat, -85, 85), lon, S.t), k = (j * w + i) * 4;
    const night_a = smooth((0.04 - c) / 0.16) * 0.38, tw = Math.max(0, 1 - Math.abs(c + 0.02) / 0.09);
    if (tw > 0) { d[k] = 255; d[k + 1] = 130; d[k + 2] = 70; d[k + 3] = 46 * tw * tw; }
    if (night_a > 0.001) { const a = night_a; const ta = d[k + 3] / 255; const oa = a + ta * (1 - a); const r = (3 * a + d[k] * ta * (1 - a)) / oa, g = (7 * a + d[k + 1] * ta * (1 - a)) / oa, b = (22 * a + d[k + 2] * ta * (1 - a)) / oa; d[k] = r; d[k + 1] = g; d[k + 2] = b; d[k + 3] = oa * 255; }
  }
  nctx.putImageData(img, 0, 0); cx.imageSmoothingEnabled = true; cx.drawImage(night, 0, 0, W, H);
}
function drawTEZ() {
  cx.save(); cx.setLineDash([9, 7]); cx.strokeStyle = 'rgba(255,110,110,.55)'; cx.lineWidth = 1.4; cx.beginPath();
  for (let b = 0; b <= 360; b += 3) { const p = BB.dest(BB.TEZ_C, b, 200), [x, y] = P(p[0], p[1]); b ? cx.lineTo(x, y) : cx.moveTo(x, y); }
  cx.stroke(); cx.setLineDash([]);
  const [x, y] = P(BB.TEZ_C[0] + 200 / 60 * 0.96, BB.TEZ_C[1]); cx.font = '600 9.5px ui-monospace,Menlo,monospace'; cx.fillStyle = 'rgba(255,140,140,.8)'; cx.textAlign = 'center'; cx.fillText('TOTAL EXCLUSION ZONE · 200 nm', x, y - 4);
  cx.restore();
}
function polyline(pts, step) { let first = true; for (let i = 0; i < pts.length; i += step) { const [x, y] = P(pts[i][0], pts[i][1]); first ? cx.moveTo(x, y) : cx.lineTo(x, y); first = false; } const l = pts[pts.length - 1], [x, y] = P(l[0], l[1]); cx.lineTo(x, y); }
function drawRoutes() {
  cx.save(); cx.lineWidth = 1.3; cx.setLineDash([6, 6]);
  cx.strokeStyle = 'rgba(255,255,255,.22)'; cx.beginPath(); const R = M.ROUTE; const pts = []; for (let s = 0; s <= R.len; s += 20) pts.push(R.ll(s)); pts.push(R.ll(R.len)); polyline(pts, 1); cx.stroke();
  cx.strokeStyle = 'rgba(116,230,255,.20)'; cx.beginPath(); const V = M.VRET, p2 = []; for (let s = 0; s <= V.len; s += 20) p2.push(V.ll(s)); p2.push(V.ll(V.len)); polyline(p2, 1); cx.stroke();
  cx.restore();
}
const BR_GROUPS = [['1S'], ['1A', '1B', '1C'], ['2S', '2A', '2B', '2C', '2D'], ['3S', '3A', '3B'], ['4']];
function drawBrackets(act) {
  const np = nmPerPx(), indiv = np < 1.6;
  const activeBr = new Set(act.map(x => x.br));
  cx.save(); cx.lineCap = 'round'; cx.font = '700 10px ui-monospace,Menlo,monospace'; cx.textAlign = 'center';
  for (const k of Object.keys(M.BRK)) {
    const [a, b] = M.BRK[k], [x0, y0] = P(a[0], a[1]), [x1, y1] = P(b[0], b[1]), on = activeBr.has(k);
    cx.strokeStyle = on ? 'rgba(255,180,84,.28)' : 'rgba(70,217,198,.14)'; cx.lineWidth = on ? 13 : 8; cx.beginPath(); cx.moveTo(x0, y0); cx.lineTo(x1, y1); cx.stroke();
    cx.strokeStyle = on ? '#ffb454' : 'rgba(70,217,198,.85)'; cx.lineWidth = on ? 3.5 : 2.4; cx.beginPath(); cx.moveTo(x0, y0); cx.lineTo(x1, y1); cx.stroke();
    cx.fillStyle = on ? '#ffd9a0' : '#7ceee0'; cx.beginPath(); cx.arc(x0, y0, 2.6, 0, 7); cx.fill();
  }
  cx.lineWidth = 3; cx.strokeStyle = 'rgba(4,10,20,.9)';
  const lbl = (txt, lat, lon, on) => { const [x, y] = P(lat, lon); const ox = 13, oy = -9; cx.strokeText(txt, x + ox, y + oy); cx.fillStyle = on ? '#ffd9a0' : '#8ff0e3'; cx.fillText(txt, x + ox, y + oy); };
  if (indiv) { for (const k of Object.keys(M.BRK)) lbl(k === '4' ? 'H · 4' : k, M.BRK[k][0][0], M.BRK[k][0][1], activeBr.has(k)); }
  else { const nm = { '1S': '1S', '1A': '1A–1C', '2S': '2S–2D', '3S': '3S–3B', '4': 'H' }; for (const g of BR_GROUPS) { const k = g[0], on = g.some(q => activeBr.has(q)); lbl(nm[k], M.BRK[k][0][0], M.BRK[k][0][1], on); } }
  cx.restore();
}
function drawPlacesAndMarkers() {
  const np = nmPerPx(); cx.save(); cx.font = '11px ui-sans-serif,system-ui'; cx.lineWidth = 3; cx.strokeStyle = 'rgba(4,10,20,.88)';
  for (const p of PLACES) {
    if (np > p.thr) continue; const [x, y] = P(p.lat, p.lon); if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
    cx.fillStyle = p.c || '#cfdcec'; cx.beginPath(); cx.arc(x, y, p.thr > 1e8 ? 3 : 2.2, 0, 7); cx.fill();
    cx.textAlign = p.al || 'left'; const tx = x + (p.dx == null ? 7 : p.dx), ty = y + (p.dy == null ? 4 : p.dy);
    cx.font = (p.sub ? '700 ' : '600 ') + '11px ui-sans-serif,system-ui'; cx.strokeText(p.n, tx, ty); cx.fillText(p.n, tx, ty);
    if (p.sub && np < 12) { cx.font = '10px ui-sans-serif'; cx.fillStyle = '#8ea4c0'; cx.strokeText(p.sub, tx, ty + 12); cx.fillText(p.sub, tx, ty + 12); }
  }
  // Stanley runway & task force
  const rc = BB.RWY_C, [rx, ry] = P(rc[0], rc[1]);
  if (np < 1.2) { const a = BB.dest(rc, 81, 0.34), b = BB.dest(rc, 261, 0.34), [ax, ay] = P(a[0], a[1]), [bx, by] = P(b[0], b[1]); cx.strokeStyle = 'rgba(255,255,255,.85)'; cx.lineWidth = Math.max(1.5, 0.045 / np); cx.beginPath(); cx.moveTo(ax, ay); cx.lineTo(bx, by); cx.stroke(); cx.lineWidth = 3; cx.strokeStyle = 'rgba(4,10,20,.88)'; if (np < 0.2) { cx.fillStyle = '#e8f1ff'; cx.textAlign = 'left'; cx.strokeText('Stanley airfield · runway 08/26', rx + 10, ry + 20); cx.fillText('Stanley airfield · runway 08/26', rx + 10, ry + 20); } }
  const [tx, ty] = P(M.TF[0], M.TF[1]); cx.fillStyle = '#9fc2ff'; for (const [dx, dy] of [[0, 0], [5, -3], [-5, 3], [9, 2]]) { cx.save(); cx.translate(tx + dx, ty + dy); cx.rotate(1.2); cx.beginPath(); cx.moveTo(0, -4); cx.lineTo(2, 3); cx.lineTo(-2, 3); cx.closePath(); cx.fill(); cx.restore(); }
  cx.font = '600 10px ui-sans-serif'; cx.textAlign = 'left'; cx.fillStyle = '#b9d0ff'; if (np < 8) { cx.strokeText('Task Force (approx.)', tx + 14, ty + 14); cx.fillText('Task Force (approx.)', tx + 14, ty + 14); }
  // RV markers
  if (S.t > M.tR1 + 300) {
    const mk = (pt, txt, dim) => { const [x, y] = P(pt[0], pt[1]); cx.strokeStyle = dim ? 'rgba(70,217,198,.35)' : 'rgba(70,217,198,.9)'; cx.lineWidth = 1.5; cx.setLineDash([3, 3]); cx.beginPath(); cx.arc(x, y, 11, 0, 7); cx.stroke(); cx.setLineDash([]); cx.textAlign = 'left'; cx.lineWidth = 3; cx.strokeStyle = 'rgba(4,10,20,.88)'; cx.font = '600 10px ui-sans-serif'; cx.fillStyle = dim ? 'rgba(125,238,224,.55)' : '#8ff0e3'; cx.strokeText(txt, x + 15, y + 3); cx.fillText(txt, x + 15, y + 3); };
    mk(M.rvPts.rv1, M.flown ? 'Rio RV · planned' : 'Rio RV (abeam Rio de Janeiro)', M.flown && S.t > M.tR1 + 360);
    if (M.flown) mk(M.rvPts.rv2, 'RV · moved south (Vulcan late)', false);
  }
  cx.restore();
}
function drawStorm(t) {
  const st = M.storm; if (!st) return; const a = smooth((t - st.t0) / 10) * (1 - smooth((t - (st.t1 - 12)) / 12)); if (a <= 0.01) return;
  const [x, y] = P(st.c[0], st.c[1]), R = 62 / nmPerPx(); const now = performance.now() / 1000;
  cx.save(); cx.globalAlpha = a;
  const rnd = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  for (let i = 0; i < 16; i++) {
    const ang = rnd(i) * 6.283 + now * 0.02, rad = (0.25 + rnd(i + 40) * 0.8) * R, r = (0.28 + rnd(i + 90) * 0.4) * R, cxp = x + Math.cos(ang) * rad * 1.5, cyp = y + Math.sin(ang) * rad * 0.7;
    const g = cx.createRadialGradient(cxp, cyp, 0, cxp, cyp, r), hot = rnd(i + 7) > 0.72;
    g.addColorStop(0, hot ? 'rgba(255,120,150,.55)' : 'rgba(170,110,255,.42)'); g.addColorStop(0.55, 'rgba(110,80,230,.22)'); g.addColorStop(1, 'rgba(60,40,160,0)');
    cx.fillStyle = g; cx.fillRect(cxp - r, cyp - r, r * 2, r * 2);
  }
  const tt = Math.floor(now * 7);
  if (rnd(tt) > 0.55) { const lx = x + (rnd(tt + 3) - 0.5) * R * 2.4, ly = y + (rnd(tt + 5) - 0.5) * R * 1.2; cx.strokeStyle = 'rgba(240,235,255,.95)'; cx.lineWidth = 1.6; cx.beginPath(); cx.moveTo(lx, ly); for (let k = 1; k < 5; k++) cx.lineTo(lx + (rnd(tt + k * 9) - 0.5) * 22, ly + k * 7); cx.stroke(); }
  cx.globalAlpha = 1; cx.font = '700 10px ui-monospace,Menlo,monospace'; cx.textAlign = 'center'; cx.fillStyle = 'rgba(210,190,255,.9)'; cx.fillText('THUNDERSTORMS · 40°S', x, y - R * 0.95);
  cx.restore();
}
function drawTrails(t) {
  if (!S.o.trails) return; const np = nmPerPx(), stride = np > 2 ? 8 : np > 0.4 ? 3 : 1; cx.save(); cx.lineJoin = 'round'; cx.lineCap = 'round';
  for (const id of M.ids) {
    const a = M.AC[id]; if (t < a.tOn) continue; const i1 = Math.min(M.N - 1, Math.floor(Math.min(t, a.tOff) / M.DT)), i0 = Math.max(0, Math.floor(a.tOn / M.DT)); const col = a.kind === 'vulcan' ? COL.vul : a.kind === 'nimrod' ? COL.nim : a.grp === 'REC' ? COL.rec : COL.tk;
    const trace = (from) => { cx.beginPath(); let first = true; for (let i = from; i <= i1; i += stride) { const [x, y] = PM(a.mx[i], a.my[i]); first ? cx.moveTo(x, y) : cx.lineTo(x, y); first = false; } const c = smp(a, Math.min(t, a.tOff)), [x, y] = PM(c.mx, c.my); cx.lineTo(x, y); };
    cx.strokeStyle = col; cx.globalAlpha = a.kind === 'vulcan' ? 0.38 : 0.2; cx.lineWidth = a.kind === 'vulcan' ? 2 : 1.2; trace(i0); cx.stroke();
    const recent = Math.max(i0, i1 - Math.round(24 / M.DT)); cx.globalAlpha = a.kind === 'vulcan' ? 0.95 : 0.65; cx.lineWidth = a.kind === 'vulcan' ? 2.6 : 1.8; trace(recent); cx.stroke();
  }
  cx.restore();
}
function drawBombs(t) {
  if (t < M.tBR - 0.2) return; const rc = BB.RWY_C, hdg = 226, np = nmPerPx(), now = (t - M.tBR) * 60; // seconds
  cx.save();
  for (let i = 0; i < 21; i++) {
    const tb = i * 0.26, p = BB.dest(rc, hdg, i * 0.024 - 0.01), [x, y] = P(p[0], p[1]);
    if (now < tb) continue; const age = now - tb;
    if (np < 0.6) { cx.fillStyle = 'rgba(20,12,8,.7)'; cx.beginPath(); cx.arc(x, y, 2.2, 0, 7); cx.fill(); }
    if (age < 14) { const f = age / 14, r = (4 + f * 20) * (np < 0.6 ? 1 : 0.6); const g = cx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,240,200,' + (0.95 * (1 - f)) + ')'); g.addColorStop(0.4, 'rgba(255,150,60,' + (0.65 * (1 - f)) + ')'); g.addColorStop(1, 'rgba(255,80,30,0)'); cx.fillStyle = g; cx.fillRect(x - r, y - r, r * 2, r * 2); }
  }
  if (now > 0 && now < 3.5) { cx.fillStyle = 'rgba(255,245,225,' + (0.22 * (1 - now / 3.5)) + ')'; cx.fillRect(0, 0, W, H); }
  cx.restore();
}

/* ---- aircraft layer with screen-space declutter ---- */
function boostFor() { const np = nmPerPx(); return clamp(H / 560, 0.8, 1.15) * (np < 0.25 ? 1.5 : np < 0.8 ? 1.28 : np < 2 ? 1.1 : np < 4 ? 1 : np < 8 ? 0.86 : 0.74); }
function layoutAircraft(t, act) {
  const items = [];
  for (const id of M.ids) { const a = M.AC[id]; if (!airborne(a, t)) continue; const s = smp(a, t), [x, y] = PM(s.mx, s.my); if (x < -80 || x > W + 80 || y < -80 || y > H + 80) continue; items.push({ id, a, s, ax: x, ay: y, x, y, g: null }); }
  // union-find on screen proximity
  const par = items.map((_, i) => i), find = i => par[i] === i ? i : (par[i] = find(par[i]));
  const TH = 28; for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) if (Math.hypot(items[i].ax - items[j].ax, items[i].ay - items[j].ay) < TH) par[find(i)] = find(j);
  const groups = {}; items.forEach((q, i) => { const r = find(i); (groups[r] = groups[r] || []).push(q); });
  const rank = q => { const k = M.order.indexOf(q.id); const ret = q.a.tTurn != null && t > q.a.tTurn; return (ret ? 100 : 0) + (q.a.grp === 'REC' ? 50 : 0) + (k < 0 ? 20 : k); };
  const sT = 26 * boostFor(), g = sT * 1.18, gp = sT * 2.1; S.layG = g;
  for (const key in groups) {
    const grp = groups[key]; if (grp.length < 2) continue;
    let fx = 0, fy = 0, cxm = 0, cym = 0; grp.forEach(q => { const h = q.s.hdg * D2R; if (!(q.a.tTurn != null && t > q.a.tTurn)) { fx += Math.sin(h); fy += -Math.cos(h); } cxm += q.ax; cym += q.ay; });
    if (Math.hypot(fx, fy) < 0.2) { const h = grp[0].s.hdg * D2R; fx = Math.sin(h); fy = -Math.cos(h); } const fl = Math.hypot(fx, fy); fx /= fl; fy /= fl; cxm /= grp.length; cym /= grp.length;
    const order = grp.slice().sort((p, q) => rank(p) - rank(q) || p.id.localeCompare(q.id)), pairs = [];
    for (const x of act) { const d = order.findIndex(q => q.id === x.d), r = order.findIndex(q => q.id === x.r); if (d >= 0 && r >= 0) { const rq = order.splice(r, 1)[0]; const di = order.findIndex(q => q.id === x.d); order.splice(di + 1, 0, rq); pairs.push([x.d, x.r]); } }
    const isPair = (a, b) => pairs.some(p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a));
    const off = [0]; for (let i = 1; i < order.length; i++) off.push(off[i - 1] + (isPair(order[i - 1].id, order[i].id) ? gp : g));
    const mid = off[off.length - 1] / 2;
    order.forEach((q, i) => { q.x = cxm + fx * (mid - off[i]); q.y = cym + fy * (mid - off[i]); q.g = { id: key, cx: cxm, cy: cym, fx, fy, n: order.length }; });
  }
  return items;
}
function fuelCol(f, cap) { const q = f / cap; return q < 0.1 ? COL.bad : q < 0.2 ? '#ffd35a' : null; }
