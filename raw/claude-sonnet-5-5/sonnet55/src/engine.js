/* ============================================================================
   BLACK BUCK — mission compiler
   Builds a fully deterministic, scrubbable model of the Black Buck 1 air-to-air
   refuelling chain: tracks, fuel ledgers, transfer windows, events.

   Time unit: minutes after 22:00Z on 30 April 1982.   Distance: nautical miles.
   Fuel: thousands of lb (klb).

   Sources for the geometry & quantities of the chain:
     RAF Historical Society Journal 30 (Falklands Campaign seminar) — the
     "spaghetti diagram" refuelling plan (15 transfers, 11 Victors, 2 Vulcans).
   Incidents overlaid for BB1 'as flown': Wikipedia (Operation Black Buck),
     Collectair "Black Buck 1 – The Longest Night", RAF, Vulcan to the Sky.
   Everything else (speeds, exact join-ups, loiter times) is modelled.
   ========================================================================== */
(function (G) {
'use strict';
const D2R = Math.PI / 180, R2D = 180 / Math.PI, RE = 3440.065;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, f) => a + (b - a) * f;
const lerp2 = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
const smooth = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };

/* ---------- geodesy ---------- */
function hav(a, b) {
  const dla = (b[0] - a[0]) * D2R, dlo = (b[1] - a[1]) * D2R;
  const h = Math.sin(dla / 2) ** 2 + Math.cos(a[0] * D2R) * Math.cos(b[0] * D2R) * Math.sin(dlo / 2) ** 2;
  return 2 * RE * Math.asin(Math.min(1, Math.sqrt(h)));
}
function bearing(a, b) {
  const la1 = a[0] * D2R, la2 = b[0] * D2R, dlo = (b[1] - a[1]) * D2R;
  const y = Math.sin(dlo) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dlo);
  return (Math.atan2(y, x) * R2D + 360) % 360;
}
function vec(p) { const la = p[0] * D2R, lo = p[1] * D2R; return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)]; }
function gcInterp(a, b, f) {
  const A = vec(a), B = vec(b);
  const dot = clamp(A[0] * B[0] + A[1] * B[1] + A[2] * B[2], -1, 1), om = Math.acos(dot);
  if (om < 1e-9) return [a[0], a[1]];
  const s = Math.sin(om), k1 = Math.sin((1 - f) * om) / s, k2 = Math.sin(f * om) / s;
  const x = k1 * A[0] + k2 * B[0], y = k1 * A[1] + k2 * B[1], z = k1 * A[2] + k2 * B[2];
  return [Math.atan2(z, Math.hypot(x, y)) * R2D, Math.atan2(y, x) * R2D];
}
function dest(a, brg, d) {
  const la1 = a[0] * D2R, lo1 = a[1] * D2R, th = brg * D2R, dr = d / RE;
  const la2 = Math.asin(Math.sin(la1) * Math.cos(dr) + Math.cos(la1) * Math.sin(dr) * Math.cos(th));
  const lo2 = lo1 + Math.atan2(Math.sin(th) * Math.sin(dr) * Math.cos(la1), Math.cos(dr) - Math.sin(la1) * Math.sin(la2));
  return [la2 * R2D, ((lo2 * R2D + 540) % 360) - 180];
}
function offsetLL(lat, lon, hdg, fwd, right) {
  const h = hdg * D2R;
  const east = fwd * Math.sin(h) + right * Math.cos(h), north = fwd * Math.cos(h) - right * Math.sin(h);
  return [lat + north / 60, lon + east / (60 * Math.cos(lat * D2R))];
}

class Pline {
  constructor(pts) {
    this.pts = pts; this.cum = [0];
    for (let i = 1; i < pts.length; i++) this.cum.push(this.cum[i - 1] + hav(pts[i - 1], pts[i]));
    this.len = this.cum[this.cum.length - 1];
    this._tab = null;
  }
  seg(s) { let lo = 0, hi = this.cum.length - 2; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (this.cum[m] <= s) lo = m; else hi = m - 1; } return lo; }
  pos(s) {
    s = clamp(s, 0, this.len); const i = this.seg(s), d = this.cum[i + 1] - this.cum[i] || 1e-9;
    const f = clamp((s - this.cum[i]) / d, 0, 1), p = gcInterp(this.pts[i], this.pts[i + 1], f);
    const hdg = f > 0.999 ? bearing(this.pts[i], this.pts[i + 1]) : bearing(p, this.pts[i + 1]);
    return { lat: p[0], lon: p[1], hdg };
  }
  ll(s) { const p = this.pos(s); return [p.lat, p.lon]; }
  project(pt) {
    if (!this._tab) { this._tab = []; for (let s = 0; s <= this.len; s += 1) this._tab.push([s, this.ll(s)]); }
    let best = 1e9, bs = 0;
    for (const [s, q] of this._tab) { const d = hav(q, pt); if (d < best) { best = d; bs = s; } }
    return bs;
  }
}

/* ---------- constants ---------- */
const ASC = [-7.9696, -14.3936];                 // Wideawake, Ascension Island
const RWY_C = [-51.6925, -57.7778];              // Stanley airfield (runway centre)
const TEZ_C = [-51.667, -59.5];                  // centre of 200 nm Total Exclusion Zone
const BR = dest(RWY_C, 46, 2.0);                 // bomb release point (2 nm out over Port William)
const PU = dest(RWY_C, 46, 40);                  // pop-up point ~40 nm out
const TF = dest(RWY_C, 62, 52);                  // Task Force (approx.) – passed 8 min after bombs
const BRK = {                                    // bracket start/finish (RAF plan diagram)
  '1S': [[-14.000, -18.000], [-14.850, -18.583]],
  '1A': [[-20.000, -22.067], [-21.033, -22.750]],
  '1B': [[-20.517, -22.417], [-21.583, -23.133]],
  '1C': [[-21.767, -23.250], [-22.783, -24.000]],
  '2S': [[-29.167, -28.833], [-30.000, -29.517]],
  '2A': [[-30.567, -30.033], [-31.000, -30.417]],
  '2B': [[-31.300, -30.667], [-32.333, -31.550]],
  '2C': [[-32.600, -31.800], [-33.500, -32.617]],
  '2D': [[-33.000, -32.183], [-33.917, -32.983]],
  '3S': [[-38.000, -37.000], [-38.333, -37.333]],
  '3A': [[-41.417, -41.000], [-42.000, -41.667]],
  '3B': [[-42.250, -42.000], [-42.667, -42.500]],
  '4':  [[-48.533, -51.417], [-49.000, -52.250]],
};
const ROUTE_PTS = [ASC, BRK['1S'][0], BRK['1A'][0], BRK['1C'][1], BRK['2S'][0], BRK['2A'][0], BRK['2C'][1],
  BRK['3S'][0], BRK['3A'][0], BRK['3B'][1], BRK['4'][0], BRK['4'][1], PU, BR, RWY_C];

const ORDER = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'];
const K = {}; ORDER.forEach((id, i) => K[id] = i);
const T_R1 = 60;                                  // first take-off 23:00Z (minutes after 22:00Z)
const CAP_V = 123, CAP_VUL = 74;

const hhmm = t => { let m = Math.round(22 * 60 + t); m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };

/* time-profile of a single aircraft after take-off: accelerating climb, then cruise */
const TC = 25;
const Bf = (vc, tau) => tau <= 0 ? 0 : tau <= TC ? 0.5 * vc / TC * tau * tau : 0.5 * vc * TC + vc * (tau - TC);
const Binv = (vc, s) => { const sc = 0.5 * vc * TC; return s <= sc ? Math.sqrt(2 * TC * s / vc) : TC + (s - sc) / vc; };
function bisect(f, lo, hi, n = 60) { for (let i = 0; i < n; i++) { const m = 0.5 * (lo + hi); if (f(m) < 0) lo = m; else hi = m; } return 0.5 * (lo + hi); }
const chaikin = (pts, n) => { for (let k = 0; k < n; k++) { const o = [pts[0]]; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; o.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]); } o.push(pts[pts.length - 1]); pts = o; } return pts; };

/* ============================================================================ */
function compile(opts) {
  opts = opts || {};
  const flown = opts.scenario !== 'plan';
  const Mt = 1.0;                                 // outbound tanker burn multiplier
  const MtR = flown ? 1.06 : 1.0;                 // return-leg multiplier — BB1 tankers came home 'almost dry'
  const Mv = flown ? 1.03 : 1.0;                  // Vulcan burn multiplier (BB1: fuel burn above the estimate)
  const ROUTE = new Pline(ROUTE_PTS);
  const lane = (s, L) => { const p = ROUTE.pos(s); return L ? offsetLL(p.lat, p.lon, p.hdg, 0, L) : [p.lat, p.lon]; };
  const sPU = ROUTE.project(PU), sBR = ROUTE.project(BR);
  const sH0 = ROUTE.project(BRK['4'][0]), sH1 = ROUTE.project(BRK['4'][1]);
  const V = flown ? 'R6' : 'R4', LS = flown ? 'R5' : 'R2';   // attack Vulcan, long-slot tanker
  const T_BOMB = 578;                             // 07:38Z (04:38 local, UTC-3)
  const T_LAND_V = 1012;                          // 14:52Z
  const ARC_R = 5;                                // tanker turn radius (nm)
  const retV = 8.0;                               // tanker return speed (nm/min)

  /* ---------- transfer plan (15 outbound) ---------- */
  const T = [
    { id: 'T1', br: '1S', d: 'R3', r: V, mode: 'fill', cap: CAP_VUL, note: flown ? 'First contact — a test of the Vulcan’s fuel system' : 'System-test top-up before the reserve Vulcan and reserve tanker return' },
    { id: 'T2', br: '1A', d: 'R1', r: LS, mode: 'fill', cap: CAP_V, note: 'Victor-to-Victor: topping up the long-slot tanker' },
    { id: 'T3', br: '1B', d: 'B1', r: 'B2', mode: 'fill', cap: CAP_V, note: 'Wave Two bucket brigade, pair 1' },
    { id: 'T4', br: '1B', d: 'B3', r: 'B4', mode: 'fill', cap: CAP_V, note: 'Wave Two bucket brigade, pair 2' },
    { id: 'T5', br: '1B', d: 'B5', r: 'B6', mode: 'fill', cap: CAP_V, note: 'Wave Two bucket brigade, pair 3' },
    { id: 'T6', br: '1C', d: 'R3', r: V, mode: 'fill', cap: CAP_VUL, note: 'Vulcan filled to full again' },
    { id: 'T7', br: '2S', d: 'B2', r: V, mode: 'fill', cap: CAP_VUL, note: 'Waves merge — Vulcan filled by a Wave Two tanker' },
    { id: 'T8', br: '2A', d: 'B2', r: 'B4', mode: 'fixed', amt: 16, cap: CAP_V, note: 'Passing the surplus down the line' },
    { id: 'T9', br: '2B', d: 'B4', r: 'B6', mode: 'fixed', amt: 27, cap: CAP_V, note: 'Fuel moves one more hop south' },
    { id: 'T10', br: '2C', d: 'B2', r: V, mode: 'fill', cap: CAP_VUL, note: 'Small top-up that keeps the Vulcan full' },
    { id: 'T11', br: '2D', d: 'B4', r: LS, mode: 'fill', cap: CAP_V, note: 'Long-slot tanker topped up again' },
    { id: 'T12', br: '3S', d: 'B6', r: V, mode: 'fixed', amt: 10, cap: CAP_VUL, note: 'Small transfer — use every pound that’s available' },
    { id: 'T13', br: '3A', d: 'B6', r: V, mode: 'fill', cap: CAP_VUL, note: 'Vulcan full again at 41°S' },
    { id: 'T14', br: '3B', d: 'B6', r: LS, mode: 'fixed', amt: 8, cap: CAP_V, fail: flown, note: flown ? 'Thunderstorms at 40°S — the probe breaks' : 'Last tanker-to-tanker transfer: excess fuel to the long slot' },
    { id: 'T15', br: '4', d: flown ? 'B6' : LS, r: V, mode: flown ? 'fixed' : 'fill', amt: 12, cap: CAP_VUL, note: flown ? 'Final bracket: 7,000 lb short of the plan' : 'Final top-up — Vulcan full, ~270 nm from Stanley' },
  ];
  const Tb = {}; T.forEach(t => Tb[t.id] = t);
  T.forEach(t => { t.s0 = ROUTE.project(BRK[t.br][0]); t.s1 = ROUTE.project(BRK[t.br][1]); t.phase = 'out'; });

  /* ---------- formation positions (outbound, lane 0) ---------- */
  const solveSchedule = vc => {
    const wf = t => smooth((t - (T_R1 + 30)) / 80);
    const sForm = (id, t) => { const k = K[id], tk = T_R1 + k; if (t <= tk) return 0; return Bf(vc, t - tk) + wf(t) * (vc - 0.12) * k; };
    const tAtS = (id, s) => bisect(t => sForm(id, t) - s, T_R1 + K[id], T_R1 + K[id] + 900);
    const tH1e = tAtS(V, sH1);
    const tPU = tH1e + (sPU - sH1) / 6.5, tBR = tPU + (sBR - sPU) / 5.5;
    return { wf, sForm, tAtS, tH1e, tPU, tBR };
  };
  const VC = bisect(v => -(solveSchedule(v).tBR - T_BOMB), 4.5, 9.5, 60);   // tBR falls as vc rises
  const SC = solveSchedule(VC);
  const { wf, sForm, tAtS, tH1e, tPU, tBR } = SC;
  T.forEach(t => { t.t0 = tAtS(t.d, t.s0); t.t1 = tAtS(t.d, t.s1); });
  const t14 = Tb.T14;

  /* ---------- aircraft containers ---------- */
  const AC = {};
  const events = [];
  const addEv = (t, kind, title, text, o) => events.push(Object.assign({ t, kind, title, text, major: false }, o || {}));
  const mkAC = (id, o) => (AC[id] = Object.assign({ id, fn: null, tOn: 0, tOff: 0, cap: null, tTurn: null, hold: null }, o));

  const roster = {
    R1: { kind: 'victor', grp: 'W1', serial: 'XL192', crew: 'Flt Lt Neil Brooks', slot: '#8', role: 'Tanker · 1A donor', inf: true },
    R2: { kind: 'victor', grp: 'W1', serial: 'XL163', crew: '', slot: '#1', role: flown ? 'Long-slot tanker · hose fault, aborts' : 'Long-slot tanker', inf: true },
    R3: { kind: 'victor', grp: 'W1', serial: '', crew: 'Sqn Ldr Barry Neal', slot: '#9', role: 'Tanker · feeds the Vulcan at 1S & 1C', inf: true },
    R4: { kind: 'vulcan', grp: 'W1', serial: 'XM598', crew: 'Sqn Ldr John Reeve', slot: '—', role: flown ? 'Primary Vulcan · aborts (cabin seal)' : 'Primary Vulcan' },
    R5: { kind: 'victor', grp: 'W1', serial: 'XH669', crew: 'Flt Lt Steve Biglands', slot: flown ? '#1' : 'res', role: flown ? 'Airborne reserve → takes the long slot' : 'Airborne reserve tanker' },
    R6: { kind: 'vulcan', grp: 'W1', serial: 'XM607', crew: 'Flt Lt Martin Withers', slot: '—', role: flown ? 'Reserve Vulcan → ATTACK aircraft' : 'Airborne reserve Vulcan' },
    B1: { kind: 'victor', grp: 'W2', serial: '', crew: '', slot: '#5', role: 'Tanker · 1B donor' },
    B2: { kind: 'victor', grp: 'W2', serial: '', crew: '', slot: '#4', role: 'Tanker · feeds the Vulcan at 2S & 2C' },
    B3: { kind: 'victor', grp: 'W2', serial: '', crew: '', slot: '#6', role: 'Tanker · 1B donor' },
    B4: { kind: 'victor', grp: 'W2', serial: '', crew: '', slot: '#3', role: 'Tanker · relay to the long slot' },
    B5: { kind: 'victor', grp: 'W2', serial: '', crew: '', slot: '#7', role: 'Tanker · 1B donor' },
    B6: { kind: 'victor', grp: 'W2', serial: 'XL189', crew: 'Sqn Ldr Bob Tuxford', slot: '#2', role: flown ? 'Tanker · presses on to the final bracket' : 'Tanker · 3S/3A feeds the Vulcan', inf: true },
    B7: { kind: 'victor', grp: 'W2', serial: '', crew: '', slot: 'res', role: 'Airborne reserve tanker' },
  };

  /* ---------- who turns back, and when ---------- */
  const abortAt = {};
  if (flown) { abortAt.R4 = T_R1 + K.R4 + 15; abortAt.R2 = T_R1 + K.R2 + 20; }
  if (flown) {
    t14.failAt = t14.t0 + 5.5; t14.partial = 2.0;
    t14.gb = { id: 'T14b', br: '3B', d: LS, r: 'B6', mode: 'fixed', amt: 0, cap: CAP_V, t0: t14.failAt + 3, t1: t14.failAt + 9, s0: t14.s0, s1: t14.s1, note: 'Biglands passes back the fuel he can spare', phase: 'out', give: true };
  }
  const lastXfer = id => { let m = -1; T.forEach(t => { if (t.d === id || t.r === id) m = Math.max(m, t.t1); }); if (flown && (id === LS || id === 'B6')) m = Math.max(m, t14.gb.t1); return m; };
  const turn = {};
  Object.keys(abortAt).forEach(id => turn[id] = { t: abortAt[id], why: 'abort' });
  const setTurn = (id, t, why) => { turn[id] = { t, why }; };
  ['R1', 'R3', 'B1', 'B3', 'B5', 'B2', 'B4'].forEach(id => setTurn(id, lastXfer(id) + 1.5, 'done'));
  setTurn('B7', Math.max(Tb.T3.t1, Tb.T4.t1, Tb.T5.t1) + 1.5, 'reserve');
  if (flown) { setTurn('R5', t14.gb.t1 + 1.5, 'broken'); setTurn('B6', Tb.T15.t1 + 1.5, 'rescue'); }
  else { setTurn('R5', Tb.T1.t1 + 1.5, 'reserve'); setTurn('R6', Tb.T1.t1 + 1.5, 'reserve'); setTurn('B6', Tb.T14.t1 + 1.5, 'done'); setTurn('R2', Tb.T15.t1 + 1.5, 'rescue'); }
  const LSR = flown ? 'B6' : 'R2';                 // the tanker that comes home short and needs a top-up
  const sOut = (id, t) => sForm(id, t);

  /** U-turn (right) + return lane (+2R lateral) back to Ascension, starting at outbound route distance s */
  function returnPath(s) {
    const pts = [];
    for (let i = 0; i <= 14; i++) { const th = Math.PI * i / 14; pts.push(lane(s + ARC_R * Math.sin(th), ARC_R * (1 - Math.cos(th)))); }
    for (let ss = s - 12; ss > 0; ss -= 25) pts.push(lane(ss, 2 * ARC_R * smooth(ss / 60)));
    pts.push(lane(0, 0));
    const pl = new Pline(pts); pl.arcLen = Math.PI * ARC_R; return pl;
  }
  const RP = {}, turnS = {};
  Object.keys(turn).forEach(id => { turnS[id] = sOut(id, turn[id].t); RP[id] = returnPath(turnS[id]); });

  /* ---------- Vulcan return path (egress → return lane) ---------- */
  const hdgIn = bearing(BR, RWY_C);
  let ep = BR.slice(), eh = hdgIn; const egress = [BR.slice()];
  { const r = 1.2, v = 5.5, step = 0.05, w = v / r;       // 60°-bank left turn, 150°
    for (let a = 0; a < 150 * D2R; a += w * step) { eh -= (w * step) * R2D; ep = dest(ep, eh, v * step); egress.push(ep); } }
  const A0 = ep.slice(), P1 = dest(A0, eh, 14);
  const sRet0 = sBR - 135, P3 = lane(sRet0, ARC_R * 2);
  const egS = chaikin([A0, P1, TF, dest(TF, 25, 22), P3], 2);
  const vrPts = egress.concat(egS.slice(1));
  for (let ss = sRet0 - 10; ss > 0; ss -= 25) vrPts.push(lane(ss, 2 * ARC_R * smooth(ss / 60)));
  vrPts.push(lane(0, 0));
  const VRET = new Pline(vrPts);

  // recovery rendezvous positions (nm from Ascension)
  const S_RV1 = 1444, S_RV2 = flown ? 1700 : 1444;
  const dOfS = s => VRET.project(lane(s, 2 * ARC_R * smooth(s / 60)));
  const dRV = dOfS(S_RV2), RVX = 50, xferV = 7.2, vSegClimb = 6.0, tClimb = 12, RV_AMT = flown ? 46 : 40;
  const winDur = (2 * RVX) / xferV;
  const vr = (VRET.len - tClimb * vSegClimb - 2 * RVX) / ((T_LAND_V - T_BOMB) - tClimb - winDur);
  const dV = t => {
    const tt = t - T_BOMB; if (tt <= 0) return 0;
    if (tt <= tClimb) return vSegClimb * tt;
    const d1 = vSegClimb * tClimb, tW0 = tClimb + (dRV - RVX - d1) / vr;
    if (tt <= tW0) return d1 + vr * (tt - tClimb);
    if (tt <= tW0 + winDur) return dRV - RVX + xferV * (tt - tW0);
    return dRV + RVX + vr * (tt - tW0 - winDur);
  };
  const tRV0 = T_BOMB + tClimb + (dRV - RVX - vSegClimb * tClimb) / vr, tRV1 = tRV0 + winDur;
  const sV = t => t <= tH1e ? sForm(V, t) : t <= tPU ? sH1 + 6.5 * (t - tH1e) : sPU + 5.5 * (t - tPU);
  const posV = t => t <= tBR ? ROUTE.ll(sV(t)) : VRET.ll(dV(t));
  const TRV = { id: 'R1', br: 'RV', d: 'RV1', r: V, mode: 'fixed', amt: RV_AMT, cap: CAP_VUL, t0: tRV0, t1: tRV1, phase: 'rv', note: 'Rio RV — the critical top-up for the flight home', s0: 0, s1: 0 };

  /* ---------- recovery wave ---------- */
  const T_RECOV = 440, vcR = 6.5;
  const recK = { RV1: 0, RV2: 0, RV3: 0, RV4: 10 };
  const wR = t => smooth((t - (T_RECOV + 25)) / 60);
  const sRec = (id, t) => { const tk = T_RECOV + recK[id]; if (t <= tk) return 0; return Bf(vcR, t - tk) + wR(t) * (vcR - 0.12) * recK[id]; };
  const tAtSR = (id, s) => bisect(t => sRec(id, t) - s, T_RECOV + recK[id], T_RECOV + recK[id] + 1200);
  const S_TOP = [660, 735];
  const TR1 = { id: 'R2a', br: 'RV-A', d: 'RV3', r: 'RV1', mode: 'fill', cap: CAP_V, phase: 'rec', s0: S_TOP[0], s1: S_TOP[1], note: 'Recovery wave tops up the RV tanker' };
  const TR2 = { id: 'R2b', br: 'RV-A', d: 'RV4', r: 'RV2', mode: 'fill', cap: CAP_V, phase: 'rec', s0: S_TOP[0], s1: S_TOP[1], note: 'Recovery wave tops up the back-up RV tanker' };
  TR1.t0 = tAtSR('RV3', S_TOP[0]); TR1.t1 = tAtSR('RV3', S_TOP[1]);
  TR2.t0 = tAtSR('RV4', S_TOP[0]); TR2.t1 = tAtSR('RV4', S_TOP[1]);
  const tRecTurn3 = TR1.t1 + 1.5, tRecTurn4 = TR2.t1 + 1.5;
  const tQabort = flown ? tAtSR('RV2', 1050) : null;

  /* ---------- the long-slot tanker's flight home + Seymour's rescue ---------- */
  const SEY_T0 = flown ? 570 : 505;                // flown: launched 07:30Z (documented)
  const vS = 8.4, vTx = 8.2, vJoin = 7.0, tJoinLen = 8, XF_RESCUE = 12, RESCUE_AMT = flown ? 30 : 12;
  const sCont = flown ? 1050 : S_RV1;
  const tTurnL = turn[LSR].t, sTurnL = turnS[LSR], rpL = RP[LSR];
  const dCont = rpL.arcLen + sTurnL - sCont;
  const tCont = tTurnL + dCont / vTx, tCont1 = tCont + XF_RESCUE;
  const vHome = 8.3, vXf = 7.5;
  const dEndCont = dCont + vXf * XF_RESCUE;
  const dfunL = t => t <= tTurnL ? 0 : t <= tCont ? vTx * (t - tTurnL) : t <= tCont1 ? dCont + vXf * (t - tCont) : dEndCont + vHome * (t - tCont1);
  const TSY = { id: 'R3', br: 'RESCUE', d: 'S1', r: LSR, mode: 'fixed', amt: RESCUE_AMT, cap: CAP_V, t0: tCont, t1: tCont1, phase: 'rescue', s0: 0, s1: 0, note: flown ? 'Seymour finds Tuxford with ~30 minutes of fuel left' : 'Planned top-up of the long-slot tanker on its way home' };

  /* ---------- generic rendezvous ("joiner") path ---------- */
  function buildJoiner(o) {
    const th = o.turnDeg * D2R, dArc = th * ARC_R / vJoin, fwdEnd = ARC_R * Math.sin(th), rgtEnd = ARC_R * (1 - Math.cos(th));
    const tTurnEnd = o.tContact - tJoinLen, tTurnStart = tTurnEnd - dArc;
    const sEnd = o.sContact + 0.05 + vJoin * tJoinLen, sU = sEnd - fwdEnd;
    const lRun = 6, tRun1 = tTurnStart - lRun, sC = sU - vJoin * lRun;
    const ro = 7, vOrb = 6.5;
    const segs = []; const outFn = o.outS;
    const holds = (o.holds || []).concat([{ s: sC, tEx: tRun1, last: true }]);
    let tArr = bisect(t => outFn(t) - holds[0].s, o.tTO, o.tTO + 1500);
    segs.push({ t0: o.tTO - 100, t1: tArr, fn: t => lane(outFn(t), 0) });
    const info = { holds: [] };
    holds.forEach((h, i) => {
      const hdg = ROUTE.pos(h.s).hdg, C = lane(h.s, ro), ph0 = (hdg - 90 + 360) % 360;
      const tA = tArr, dur = Math.max(0, h.tEx - tA), n = Math.max(dur > 2 ? 1 : 0, Math.round(dur * vOrb / (2 * Math.PI * ro)));
      const om = n ? 2 * Math.PI * n / dur : 0, tEx = n ? h.tEx : tA;
      segs.push({ t0: tA, t1: tEx, fn: t => { const ph = (ph0 + om * (t - tA) * R2D) * D2R; return [C[0] + ro * Math.cos(ph) / 60, C[1] + ro * Math.sin(ph) / (60 * Math.cos(C[0] * D2R))]; } });
      info.holds.push({ t0: tA, t1: tEx, s: h.s });
      if (i < holds.length - 1) {
        const nx = holds[i + 1], tNext = tEx + (nx.s - h.s) / 7.0, sFrom = h.s, tFrom = tEx;
        segs.push({ t0: tEx, t1: tNext, fn: t => lane(sFrom + 7.0 * (t - tFrom), 0) });
        tArr = tNext;
      }
    });
    segs.push({ t0: tRun1, t1: tTurnStart, fn: t => lane(sC + vJoin * (t - tRun1), 0) });
    segs.push({ t0: tTurnStart, t1: tTurnEnd, fn: t => { const u = (t - tTurnStart) / (tTurnEnd - tTurnStart), a = u * th; const p = ROUTE.pos(sU); return offsetLL(p.lat, p.lon, p.hdg, ARC_R * Math.sin(a), ARC_R * (1 - Math.cos(a))); } });
    segs.push({ t0: tTurnEnd, t1: o.tContact, fn: t => lane(sEnd - vJoin * (t - tTurnEnd), rgtEnd + (2 * ARC_R - rgtEnd) * smooth((t - tTurnEnd) / tJoinLen)) });
    const fn = t => {
      if (t >= o.tContact) return o.follow(t);
      for (let i = segs.length - 1; i >= 0; i--) if (t >= segs[i].t0) return segs[i].fn(t);
      return segs[0].fn(t);
    };
    info.tTurnStart = tTurnStart; info.tTurnEnd = tTurnEnd; info.tRun1 = tRun1; info.sC = sC; info.sU = sU;
    return { fn, info };
  }

  /* ---------- transfers sequence ---------- */
  const xfers = T.concat(flown ? [t14.gb] : [], [TR1, TR2, TSY, TRV]);
  xfers.slice().sort((a, b) => a.t0 - b.t0).forEach((x, i) => { x.n = i + 1; });

  /* ======================================================================
     Position functions
     ====================================================================== */
  ORDER.forEach(id => {
    const info = roster[id];
    const a = mkAC(id, { kind: info.kind, grp: info.grp, info, tOn: T_R1 + K[id], cap: info.kind === 'vulcan' ? CAP_VUL : CAP_V });
    if (id === V) return;
    const tr = turn[id]; if (!tr) return;
    const rp = RP[id], tt = tr.t;
    a.fn = t => t <= tt ? lane(sOut(id, t), 0) : rp.ll(retV * (t - tt));
    a.tOff = tt + rp.len / retV; a.rp = rp; a.tTurn = tt; a.sTurn = turnS[id]; a.turnWhy = tr.why;
  });
  AC[V].fn = posV; AC[V].tOff = T_LAND_V; AC[V].vret = vr;

  // Reeve (R4) — abort, burn-off orbit near Ascension, land
  if (flown) {
    const a = AC.R4, tt = abortAt.R4, rp = RP.R4;
    const sEnd = 22, dEnd = rp.arcLen + (turnS.R4 - sEnd);
    const tHold0 = tt + dEnd / 7.0, tHold1 = tHold0 + 50, ro = 8;
    const pE = rp.pos(dEnd), C = offsetLL(pE.lat, pE.lon, pE.hdg, 0, ro);
    const ph0 = (pE.hdg - 90 + 360) % 360, om = 2 * Math.PI * Math.round(50 * 7 / (2 * Math.PI * ro)) / 50;
    const orb = t => { const ph = (ph0 + om * (t - tHold0) * R2D) * D2R; return [C[0] + ro * Math.cos(ph) / 60, C[1] + ro * Math.sin(ph) / (60 * Math.cos(C[0] * D2R))]; };
    const pEx = orb(tHold1);
    a.fn = t => t <= tt ? lane(sOut('R4', t), 0) : t <= tHold0 ? rp.ll(7.0 * (t - tt)) : t <= tHold1 ? orb(t) : lerp2(pEx, ASC, smooth((t - tHold1) / 6));
    a.tOff = tHold1 + 6; a.tTurn = tt; a.hold = [tHold0, tHold1]; a.rp = rp; a.sTurn = turnS.R4; a.turnWhy = 'abort';
  }

  // Tuxford / long-slot tanker: return, rescue, home
  { const a = AC[LSR];
    a.fn = t => t <= tTurnL ? lane(sOut(LSR, t), 0) : rpL.ll(dfunL(t));
    a.tOff = tCont1 + (rpL.len - dEndCont) / vHome; a.rp = rpL; a.tTurn = tTurnL; a.sTurn = sTurnL; a.turnWhy = 'rescue'; a.dfun = dfunL; }

  // Seymour (S1)
  { const a = mkAC('S1', { kind: 'victor', grp: 'REC', info: { kind: 'victor', serial: '', crew: 'Wg Cdr Colin Seymour', slot: '—', role: flown ? 'Rescue tanker · launched 07:30Z' : 'Recovery top-up tanker' }, tOn: SEY_T0, cap: CAP_V });
    const j = buildJoiner({ tTO: SEY_T0, outS: t => Bf(vS, t - SEY_T0), holds: [], tContact: tCont, sContact: sCont, turnDeg: 180, follow: t => rpL.ll(dfunL(t) + 0.5) });
    a.fn = t => t < tCont ? j.fn(t) : rpL.ll(dfunL(t) + 0.5);
    a.tOff = AC[LSR].tOff + 0.5; a.tTurn = j.info.tTurnStart; a.hold = j.info.holds.length ? [j.info.holds[0].t0, j.info.holds[0].t1] : null; a.joiner = j.info; a.rp = rpL; a.sTurn = sCont; a.turnWhy = 'rescue'; }

  // Recovery tankers
  const mkRec = (id, crew, role, tTO) => mkAC(id, { kind: 'victor', grp: 'REC', info: { kind: 'victor', serial: '', crew, slot: '—', role }, tOn: tTO, cap: CAP_V });
  const aN = mkRec('RV1', 'Sqn Ldr Barry Neal', 'Rio-RV tanker (primary) · launched 05:20Z', T_RECOV);
  const aQ = mkRec('RV2', '', flown ? 'Back-up RV tanker · goes unserviceable' : 'Back-up RV tanker', T_RECOV);
  const a3 = mkRec('RV3', '', 'Recovery top-up tanker · 05:20Z', T_RECOV);
  const a4 = mkRec('RV4', 'Elliot (reserve)', 'Recovery top-up tanker · launched 05:30Z', T_RECOV + 10);
  [[a3, 'RV3', tRecTurn3], [a4, 'RV4', tRecTurn4]].forEach(([a, id, tt]) => {
    const sT = sRec(id, tt), rp = returnPath(sT);
    a.fn = t => t <= tt ? lane(sRec(id, t), 0) : rp.ll(retV * (t - tt)); a.tOff = tt + rp.len / retV; a.rp = rp; a.tTurn = tt; a.sTurn = sT; a.turnWhy = 'done';
  });
  if (flown) {
    const tt = tQabort, sT = sRec('RV2', tt), rp = returnPath(sT);
    aQ.fn = t => t <= tt ? lane(sRec('RV2', t), 0) : rp.ll(retV * (t - tt)); aQ.tOff = tt + rp.len / retV; aQ.rp = rp; aQ.tTurn = tt; aQ.sTurn = sT; aQ.turnWhy = 'abort';
  }
  // Neal: out to the Rio RV, hold, shift south as the Vulcan runs late, 210° rendezvous turn, formate, home
  { const sCRV = ROUTE.project(VRET.ll(dV(tRV0)));
    const tArr1 = tAtSR('RV1', S_RV1);
    const holds = flown ? [{ s: S_RV1, tEx: tArr1 + 55 }] : [];
    const j = buildJoiner({ tTO: T_RECOV, outS: t => sRec('RV1', t), holds, tContact: tRV0, sContact: sCRV, turnDeg: 210, follow: t => VRET.ll(dV(t) + 0.4) });
    aN.fn = j.fn; aN.tOff = T_LAND_V + 0.5; aN.joiner = j.info; aN.hold = [j.info.holds[0].t0, j.info.tRun1]; aN.tTurn = j.info.tTurnStart; aN.turnWhy = 'rv'; aN.tFollow = tRV0;
    aN.moveT = flown ? j.info.holds[0].t1 : null;
    if (!flown) { const base = aN.fn; aQ.fn = t => { const p = base(t); return [p[0] + 0.015, p[1] + 0.015]; }; aQ.tOff = T_LAND_V + 0.5; aQ.hold = aN.hold; }
  }
  // Nimrod (modelled): out along a left lane, holds mid-way, home
  { const a = mkAC('NIM', { kind: 'nimrod', grp: 'REC', info: { kind: 'nimrod', serial: '', crew: 'Nimrod MR2 (radar relay)', slot: '—', role: 'Finds the Vulcan, relays to Neal' }, tOn: T_RECOV + 15 });
    const sH = 1560, tTO = a.tOn, ro = 8, tAr = tTO + Binv(7.4, sH), t1 = tRV1 + 20;
    const p0 = ROUTE.pos(sH), L0 = lane(sH, -8), Cc = offsetLL(L0[0], L0[1], p0.hdg, 0, ro), ph0 = (p0.hdg - 90 + 360) % 360;
    const dur = t1 - tAr, om = 2 * Math.PI * Math.round(dur * 6.2 / (2 * Math.PI * ro)) / dur;
    const rp = returnPath(sH);
    const orb = t => { const ph = (ph0 + om * (t - tAr) * R2D) * D2R; return [Cc[0] + ro * Math.cos(ph) / 60, Cc[1] + ro * Math.sin(ph) / (60 * Math.cos(Cc[0] * D2R))]; };
    a.fn = t => t < tAr ? lane(Bf(7.4, t - tTO), -8) : t < t1 ? orb(t) : rp.ll(8.0 * (t - t1));
    a.tOff = t1 + rp.len / 8.0; a.rp = rp; a.tTurn = t1; a.hold = [tAr, t1]; a.turnWhy = 'done';
  }

  /* ======================================================================
     Dense sampling of tracks (15 s)
     ====================================================================== */
  const DT = 0.25;
  const T_END = Math.ceil(Math.max(...Object.values(AC).map(a => a.tOff || 0)) + 6);
  const N = Math.ceil(T_END / DT) + 1;
  const ids = Object.keys(AC);
  const my = la => Math.log(Math.tan(Math.PI / 4 + la * D2R / 2));
  ids.forEach(id => {
    const a = AC[id];
    a.lat = new Float32Array(N); a.lon = new Float32Array(N);
    for (let i = 0; i < N; i++) { const p = a.fn(clamp(i * DT, a.tOn, a.tOff)); a.lat[i] = p[0]; a.lon[i] = p[1]; }
    a.hdg = new Float32Array(N); let last = 180;
    for (let i = 0; i < N; i++) {
      const j0 = Math.max(0, i - 2), j1 = Math.min(N - 1, i + 2);
      const dx = (a.lon[j1] - a.lon[j0]) * D2R, dy = my(a.lat[j1]) - my(a.lat[j0]);
      if (Math.hypot(dx, dy) > 2e-6) last = (Math.atan2(dx, dy) * R2D + 360) % 360;
      a.hdg[i] = last;
    }
    a.rng = new Float32Array(N); for (let i = 0; i < N; i++) a.rng[i] = hav(ASC, [a.lat[i], a.lon[i]]);
  });

  /* ======================================================================
     Fuel integration
     ====================================================================== */
  const fuelIds = ids.filter(id => AC[id].kind !== 'nimrod');
  const Fz = {}; fuelIds.forEach(id => { AC[id].fuel = new Float32Array(N); });
  const nmStep = (id, i) => hav([AC[id].lat[i], AC[id].lon[i]], [AC[id].lat[i + 1], AC[id].lon[i + 1]]);
  // Vulcan burn: end-to-end legs using the RAF plan's per-transfer quantities (klb)
  const vulLegs = (() => {
    const seqs = [['T1', 20], ['T6', 21], ['T7', 21], ['T10', 7], ['T13', 22], ['T15', 19]];
    const legs = []; let sPrev = 0;
    seqs.forEach(([id, k]) => { const e = Tb[id].s1; legs.push({ s1: e, rate: k / Math.max(1, e - sPrev) * Mv }); sPrev = e; });
    return legs;
  })();
  const vulRate = s => { for (const l of vulLegs) if (s <= l.s1) return l.rate; return vulLegs[vulLegs.length - 1].rate; };
  const POSTH_TOTAL = flown ? 59.5 : 60.0;
  const wA = 1.6, wB = 2.2, wC = 2.6, wD = 1.0, dClimbEnd = 140;
  const postK = POSTH_TOTAL / (wA * (sPU - sH1) + wB * (sBR - sPU) + wC * dClimbEnd + wD * Math.max(1, dRV - dClimbEnd));
  const vulBurn = (t, i) => {
    const d = nmStep(V, i);
    if (t <= tH1e) return vulRate(sV(t)) * d;
    if (t <= tPU) return wA * postK * d;
    if (t <= tBR) return wB * postK * d;
    if (t <= tRV1) return (dV(t) < dClimbEnd ? wC : wD) * postK * d;
    return 0.026 * d;
  };
  const otherVulcanBurn = (id, t, i) => {
    const a = AC[id], d = nmStep(id, i);
    if (t - a.tOn < TC) return 12 / TC * 1.1 * DT;
    if (a.hold && t >= a.hold[0] && t <= a.hold[1]) return 0.40 * DT;    // burning off fuel it can't dump
    return (a.tTurn != null && t > a.tTurn ? 0.036 : 0.048) * d;
  };
  const tankerBurn = (id, t, i) => {
    const a = AC[id], d = nmStep(id, i);
    if (t - a.tOn < TC) return 12 / TC * DT;                        // climb-out
    if (a.hold && t >= a.hold[0] && t <= a.hold[1]) return 0.07 * DT;   // loiter
    if (a.tTurn != null && t > a.tTurn) {
      const dist2asc = hav([a.lat[i], a.lon[i]], ASC);
      return d * (dist2asc < 120 ? 0.045 : 0.0185) * MtR;
    }
    return d * 0.0405 * Mt * (140 + Fz[id]) / 263;               // burn per nm falls as the tanker lightens
  };
  const active = xfers.slice().sort((a, b) => a.t0 - b.t0);
  function runFuel(giveback, allowNeg) {
    fuelIds.forEach(id => { Fz[id] = AC[id].cap; AC[id].fuel.fill(0); });
    active.forEach(x => { x.run = null; x.delivered = 0; });
    if (flown) t14.gb.amt = giveback;
    for (let i = 0; i < N - 1; i++) {
      const t = i * DT;
      fuelIds.forEach(id => { AC[id].fuel[i] = Fz[id]; });
      active.forEach(x => {
        if (x.run == null && t >= x.t0 - 1e-9) {
          const dF = Fz[x.d], rF = Fz[x.r];
          let amt;
          if (x === t14 && flown) amt = t14.partial;
          else if (x.mode === 'fixed') amt = x.amt;
          else {
            const estBurn = x.r === V && x.phase === 'out' ? vulRate(x.s0) * (x.s1 - x.s0) : 0.0405 * Math.max(0, x.s1 - x.s0);
            amt = Math.max(0, x.cap - rF + estBurn);
          }
          amt = Math.min(amt, Math.max(0, dF - 1.5));
          const end = (x === t14 && flown) ? t14.failAt : x.t1;
          x.run = { amt, dur: Math.max(0.5, end - x.t0), done: 0, end }; x.delivered = amt;
        }
        if (x.run && x.run.done < x.run.amt - 1e-9 && t < x.run.end + 1e-9) {
          const q = Math.min(x.run.amt * DT / x.run.dur, x.run.amt - x.run.done);
          x.run.done += q; Fz[x.d] -= q; Fz[x.r] += q;
        }
      });
      fuelIds.forEach(id => {
        const a = AC[id]; if (t < a.tOn || t >= a.tOff) return;
        const b = id === V ? vulBurn(t, i) : a.kind === 'vulcan' ? otherVulcanBurn(id, t, i) : tankerBurn(id, t, i);
        Fz[id] = allowNeg ? Fz[id] - b : Math.max(0, Fz[id] - b);
      });
    }
    fuelIds.forEach(id => { AC[id].fuel[N - 1] = Fz[id]; });
  }
  // As flown: Biglands hands back just enough that Tuxford reaches Seymour with ~5 klb (≈ 30 minutes)
  let gbv = 0;
  const iC = Math.round(tCont / DT);
  if (flown) { runFuel(0, true); gbv = clamp(5.0 - AC.B6.fuel[iC], 0, 45); }
  runFuel(gbv, false);
  const tuxContactFuel = AC[LSR].fuel[iC];

  /* ======================================================================
     Altitude profile (Vulcan)
     ====================================================================== */
  const tV0 = T_R1 + K[V];
  const altK = [[tV0, 0], [tV0 + 1.5, 1500], [tV0 + 22, 28000]];
  xfers.filter(t => t.r === V && t.phase === 'out').sort((a, b) => a.t0 - b.t0).forEach(x => altK.push([x.t0 - 4, 31000], [x.t0 - 1, 27000], [x.t1 + 1, 27000], [x.t1 + 7, 32000]));
  altK.push([tH1e, 30500], [tH1e + 10, 300], [tPU - 0.2, 300], [tPU + 0.9, 1000], [tBR - 1.0, 10000], [tBR, 10000], [tBR + 12, 30000], [tBR + 25, 40000], [tRV0 - 12, 39000], [tRV0 - 1, 27000], [tRV1 + 1, 27000], [tRV1 + 8, 35000], [T_LAND_V - 18, 35000], [T_LAND_V - 2, 1500], [T_LAND_V, 0]);
  altK.sort((a, b) => a[0] - b[0]);
  const altV = t => { if (t <= altK[0][0]) return 0; for (let i = 1; i < altK.length; i++) if (t <= altK[i][0]) { const f = (t - altK[i - 1][0]) / Math.max(1e-6, altK[i][0] - altK[i - 1][0]); return lerp(altK[i - 1][1], altK[i][1], f); } return 0; };
  const altS = new Float32Array(N); for (let i = 0; i < N; i++) altS[i] = altV(i * DT);

  /* ======================================================================
     Events
     ====================================================================== */
  addEv(T_R1 - 2, 'info', 'Wideawake, Ascension Island', 'Thirteen aircraft stand ready for a radio-silent launch: 2 Vulcans (a primary and an airborne reserve) and 11 Handley Page Victor K2 tankers — two of them airborne reserves. Together they will make 15 fuel transfers to put one Vulcan over Stanley.', { major: true, slow: [T_R1 - 3, T_R1 + 14, 75], cam: 'asc' });
  addEv(T_R1, 'takeoff', 'First aircraft rolls — 23:00Z', 'Take-off at one-minute intervals; the last aircraft lifts off 12 minutes after the first. Wave One (4 Victors + 2 Vulcans) leaves first, followed by Wave Two (7 Victors).', { major: true });
  addEv(T_R1 + 12, 'takeoff', 'All 13 airborne', 'At cruise altitude the 12-minute spread is some 85 nm. Wave Two will fly 4,000 ft higher — more true airspeed at the same economical indicated speed — to catch up.');
  if (flown) {
    addEv(abortAt.R4, 'abort', 'Primary Vulcan aborts', 'XM598’s cabin will not pressurise — a rubber seal on Sqn Ldr Reeve’s side window has perished. He cannot dump fuel, so he must burn it off before landing. Flt Lt Withers’ XM607, the airborne reserve, becomes the attack aircraft.', { major: true, slow: [abortAt.R4 - 2, abortAt.R4 + 4, 55], ids: ['R4', 'R6'], cam: 'asc' });
    addEv(abortAt.R2, 'abort', 'Tanker XL163 returns — hose fault', 'About twenty minutes after take-off a Victor’s hose-drum unit fails. The airborne reserve, Biglands’ XH669, takes the long slot. The reserve Vulcan and a reserve tanker are now both committed, and the margin for any further failure is thin.', { major: true, slow: [abortAt.R2 - 2, abortAt.R2 + 4, 55], ids: ['R2', 'R5'], cam: 'asc' });
  }
  { const tm = bisect(t => wf(t) - 0.98, T_R1 + 30, T_R1 + 110);
    addEv(tm, 'info', 'Waves merge', 'Some two hours south of Ascension the two waves close into one formation and fly on in radio silence. Tankers will now refuel each other and the Vulcan in a diminishing relay.'); }
  T.forEach(x => {
    if (x === t14 && flown) return;
    const toV = x.r === V;
    addEv(x.t0, 'xfer', 'Bracket ' + x.br + ' · ' + x.d + ' → ' + (toV ? (flown ? 'XM607' : 'Vulcan') : x.r), x.note + '. ' + (x.mode === 'fixed' ? 'Planned transfer: ' + x.amt + ',000 lb.' : 'Top-up to full.'), { ids: [x.d, x.r], x: x.id, major: toV && x.id !== 'T15' });
  });
  if (flown) {
    addEv(t14.t0 - 28, 'storm', 'Unforecast thunderstorms at 40°S', 'A line of cells sits right across the third refuelling area. Winds and turbulence batter the formation as it approaches the last tanker-to-tanker bracket.', { major: true, slow: [t14.t0 - 28, t14.t0 - 8, 70], storm: true, cam: 'storm' });
    addEv(t14.t0, 'xfer', 'Bracket 3B · XL189 → XH669', 'Tuxford’s Victor is to pass 8,000 lb to the long-slot tanker. In radio silence, with the basket and hose swinging wildly, the two aircraft make contact in the storm.', { ids: ['B6', 'R5'], x: 'T14' });
    addEv(t14.failAt, 'fail', 'PROBE BREAKS', 'The turbulence snaps Biglands’ refuelling probe. The transfer is not completed — and the whole chain depends on it. With a broken probe, XH669 can no longer be refuelled.', { major: true, slow: [t14.failAt - 4, t14.failAt + 6, 30], ids: ['B6', 'R5'], x: 'T14', cam: 'pair' });
    addEv(t14.gb.t0, 'xfer', 'Biglands passes back what he can spare', 'Keeping just enough to reach Wideawake, Biglands hands fuel back to Tuxford. XH669 turns for home. Tuxford, now short of fuel himself, must decide.', { ids: ['R5', 'B6'], x: 'T14b' });
    addEv(t14.gb.t1 + 2, 'decision', 'Tuxford presses on south', 'He should be turning back. Instead he and his crew decide to continue below safe fuel minima to the last bracket — knowing that without a top-up his Victor will run dry some 500 nm south of Ascension. The Vulcan’s mission depends on it.', { major: true, slow: [t14.gb.t1 + 1, t14.gb.t1 + 7, 40], ids: ['B6'] });
    addEv(Tb.T15.t1 + 0.5, 'fail', 'Final bracket: 7,000 lb short', 'Tuxford passes about 12,000 lb to the Vulcan — roughly 7,000 lb less than the plan called for. Withers will have only half the reserve he was counting on for the long flight home.', { major: true, ids: ['B6', V] });
  } else {
    addEv(Tb.T1.t1 + 1, 'info', 'Reserve Vulcan & reserve tanker return', 'With the Vulcan’s fuel system proven, the reserve Vulcan (R6) and the reserve tanker (R5) turn for Ascension.', { ids: ['R5', 'R6'] });
  }
  addEv(Tb.T15.t0 - 0.5, 'xfer', 'Last outbound contact', 'The final bracket, about 270 nm from Stanley. After this the Vulcan is on its own.', { major: true, ids: [Tb.T15.d, V], x: 'T15', slow: [Tb.T15.t0 - 3, Tb.T15.t1 + 2, 45], cam: 'pair' });
  addEv(tH1e, 'attack', 'Vulcan leaves the last tanker — top of descent', 'About 300 nm north of Port Stanley the Vulcan descends, going “hi-lo-lo-hi” to stay under Argentine radar. Radio silence continues.', { major: true, ids: [V], slow: [tH1e - 1, tH1e + 10, 60], cam: 'vulcan' });
  addEv(tPU, 'attack', 'Pop-up · radar fix on Mount Usborne', 'About 40 nm out the Vulcan climbs from 300 ft to 1,000 ft to let the H2S radar lock Mount Usborne, 33 miles west of Stanley, before the bombing system takes over.', { ids: [V], slow: [tPU - 1, tBR + 1, 30], cam: 'stanley' });
  addEv(tBR, 'bomb', 'BOMBS AWAY — 07:38Z (04:38 local)', '21 × 1,000 lb bombs fall in about five seconds from 10,000 ft at 330 kt, laid across the runway at 35°. One bomb hits the runway near mid-point. The Vulcan banks 60° left (about 2 g) and runs for the north.', { major: true, ids: [V], slow: [tBR - 0.6, tBR + 1, 8], cam: 'stanley', bomb: true });
  addEv(tBR + 8, 'info', '“SUPERFUSE” — 07:46Z', 'Passing the Task Force, the crew sends the code word that tells the fleet the raid has been carried out.', { ids: [V], major: true });
  addEv(T_RECOV, 'recovery', 'Recovery wave launches — 05:20Z', 'Four Victors (one goes unserviceable on the ramp; the reserve, Elliot, follows at 05:30Z) and a Nimrod head out to the Rio rendezvous to wait for the Vulcan and the long-slot tanker.', { major: true, ids: ['RV1', 'RV2', 'RV3', 'RV4'], slow: [T_RECOV - 2, T_RECOV + 14, 90], cam: 'asc' });
  addEv(TR1.t0, 'xfer', 'Recovery top-ups', 'Two of the recovery tankers fill the two that will wait at the RV — the same bucket-brigade logic as the outbound leg.', { ids: ['RV3', 'RV1'], x: 'R2a', slow: [TR1.t0 - 2, TR1.t1 + 2, 80] });
  if (flown) addEv(tQabort, 'abort', 'RV back-up goes unserviceable', 'One of the recovery Victors fails in transit. Only one tanker, Barry Neal’s, will now be at the Rio rendezvous instead of two.', { ids: ['RV2'], major: true, slow: [tQabort - 2, tQabort + 5, 80] });
  addEv(SEY_T0, 'recovery', flown ? 'Seymour launches — 07:30Z' : 'Top-up tanker launches', flown ? 'Reports reach Ascension that the long-sortie Victors are coming home desperately short of fuel. Wg Cdr Colin Seymour is sent to find Tuxford; Barrett is sent to help another Victor with a major fuel leak.' : 'A recovery tanker departs to meet the long-slot tanker on its way home.', { major: flown, ids: ['S1'], slow: [SEY_T0 - 2, SEY_T0 + 8, 90] });
  addEv(AC.RV1.joiner.holds[0].t0, 'recovery', 'Neal on station at the Rio RV', 'The primary RV tanker arrives abeam Rio de Janeiro — a point chosen so a Brazilian airfield is available as a diversion if the refuelling fails — and begins to hold. A Nimrod orbits further out to help the aircraft find each other.', { ids: ['RV1', 'NIM'] });
  addEv(tCont - 9, 'rescue', flown ? 'Seymour finds Tuxford' : 'Long-slot top-up', flown ? 'Over a thousand miles from Ascension, with only about thirty minutes of fuel left, Tuxford sees Seymour’s Victor. Without this transfer he would have run dry hundreds of miles short.' : 'The long-slot tanker is topped up on its way home.', { major: true, ids: ['S1', LSR], x: 'R3', slow: [tCont - 9, tCont1 + 2, 50], cam: 'pair' });
  if (flown) addEv(AC.RV1.moveT, 'recovery', 'RV moved south', 'Because the Vulcan is running late, the rendezvous point is pulled further south. Neal is sent after it.', { ids: ['RV1'] });
  addEv(tRV0 - 22, 'recovery', 'Vulcan nears the Rio RV — an hour late and short of fuel', 'Withers is down to about 7,000 lb. The Nimrod placed between the Vulcan and the tanker helps them find each other.', { ids: [V, 'RV1', 'NIM'], major: true, slow: [tRV0 - 22, tRV0 + 2, 40], cam: 'rv' });
  addEv(AC.RV1.joiner.tTurnStart, 'recovery', 'The 210° turn', 'Navigator Chris Morffew talks Neal through a perfectly timed 210° turn — rolling out three miles dead ahead of the Vulcan with the hose already trailing.', { ids: ['RV1', V], major: true });
  addEv(tRV0, 'xfer', 'Rio RV · RV1 → XM607', 'The final contact. A poor connection leaves fuel streaming across the Vulcan’s windscreen, but the tanks fill.', { ids: ['RV1', V], major: true, x: 'R1', slow: [tRV0 - 2, tRV1 + 2, 50], cam: 'pair' });
  addEv(T_LAND_V, 'land', 'XM607 lands at Ascension — 14:52Z', 'About sixteen hours after take-off. Eleven tankers, fifteen outbound transfers and a handful of near-disasters later, the longest bombing raid in history is over — and every aircraft is home.', { major: true, ids: [V], cam: 'asc' });
  const landEv = (id, txt) => { const a = AC[id]; if (a && a.tOff && id !== V) addEv(a.tOff, 'land', txt, '', { ids: [id], minor: true }); };
  ['R1', 'R3', 'B1', 'B3', 'B5', 'B7', 'B2', 'B4'].forEach(id => landEv(id, id + ' lands at Wideawake'));
  landEv(LSR, (flown ? 'Tuxford (XL189)' : 'Long-slot tanker') + ' lands at Wideawake');
  if (flown) { landEv('R5', 'Biglands (XH669) lands at Wideawake'); landEv('R2', 'XL163 lands at Wideawake'); landEv('R4', 'XM598 lands after burning off fuel'); landEv('S1', 'Seymour lands at Wideawake'); }
  else { landEv('R5', 'R5 lands'); landEv('R6', 'R6 lands'); }
  events.sort((a, b) => a.t - b.t);

  const stormC = lane((t14.s0 + t14.s1) / 2, 0);
  const storm = flown ? { c: stormC, t0: t14.t0 - 28, t1: t14.gb.t1 + 12 } : null;
  const slowWin = []; events.forEach(e => { if (e.slow) slowWin.push(e.slow); });
  xfers.forEach(x => { if (!x.give) slowWin.push([x.t0 - 2, x.t1 + 1, x.r === V ? 90 : 160]); });

  /* per-aircraft status for UI */
  function statusOf(id, t) {
    const a = AC[id];
    if (t < a.tOn - 1) return { s: 'On ramp', k: 'ground' };
    if (t >= a.tOff) return { s: 'Landed', k: 'landed' };
    for (const x of xfers) {
      if (t >= x.t0 && t <= x.t1 && (x.d === id || x.r === id)) {
        if (x.give) return { s: x.d === id ? 'Giving back fuel' : 'Receiving', k: 'xfer' };
        if (x.fail && t >= x.failAt) continue;
        return x.d === id ? { s: 'Giving → ' + x.r, k: 'give' } : { s: 'Receiving ← ' + x.d, k: 'take' };
      }
    }
    if (t < a.tOn + 6) return { s: 'Take-off', k: 'climb' };
    if (t < a.tOn + TC) return { s: 'Climbing', k: 'climb' };
    if (a.hold && t >= a.hold[0] && t <= a.hold[1]) return { s: id === 'R4' ? 'Burning off fuel' : id === 'NIM' ? 'Relay orbit' : 'Holding', k: 'hold' };
    if (a.turnWhy === 'abort' && a.tTurn != null && t > a.tTurn) return { s: 'ABORT · returning', k: 'abort' };
    if (id === V && t >= tH1e && t < tBR) return { s: t < tPU ? 'Low-level run-in' : 'Bomb run', k: 'attack' };
    if (id === V && t >= tBR && t < tRV0 - 25) return { s: 'Egress · homeward', k: 'return' };
    if (a.tTurn != null && t > a.tTurn) return { s: id === 'RV1' ? 'Rendezvous turn' : 'Returning', k: 'return' };
    if (id === V) return { s: t < tH1e ? 'In formation · full tanks' : t > tRV1 ? 'Homeward' : 'Homeward · short of fuel', k: t < tH1e ? 'form' : 'return' };
    return { s: a.grp === 'REC' ? 'Outbound' : 'In formation', k: 'form' };
  }

  return {
    flown, vc: VC, vr, T_END, DT, N, ids, order: ORDER, AC, T: xfers, Tb, events, slowWin, roster, storm, statusOf,
    ROUTE, VRET, BRK, ASC, RWY_C, TEZ_C, BR, PU, TF, V, LS, LSR,
    tStart: T_R1 - 8, tH1e, tPU, tBR, tRV0, tRV1, tCont, tCont1, sCont, tLandV: T_LAND_V, giveback: gbv, tuxContactFuel,
    sH0, sH1, sPU, sBR, S_RV1, S_RV2, S_TOP, altV, alt: altS, lane, egress: egS, tR1: T_R1, Mv, Mt,
    tTurnL, rvPts: { rv1: lane(S_RV1, 5), rv2: lane(S_RV2, 5), cont: lane(sCont, 5) },
  };
}

G.BlackBuck = { compile, hav, bearing, dest, gcInterp, hhmm, D2R, R2D, RE, ASC, RWY_C, TEZ_C, Pline, clamp, lerp, smooth, offsetLL, BRK, BR, PU, TF };
})(typeof window !== 'undefined' ? window : globalThis);
