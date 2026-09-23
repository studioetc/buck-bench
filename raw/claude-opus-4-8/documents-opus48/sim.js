/* Operation Black Buck 1 — refuelling simulation engine.
 *
 * Consumes the global MISSION object (see data.js) which defines, per aircraft:
 *   - path: [{t, d}]  keyframes of distance-from-Ascension (nmi) over mission time (min)
 *   - fuel: [{t, f}]  keyframes of fuel state (lb) over mission time (min)
 * and a list of timed events for the log / phase banner / refuelling links.
 *
 * The engine interpolates path & fuel by the current sim clock, derives each
 * aircraft's state (cruising / transferring / returning / landed) and renders
 * the route map + fleet fuel panel + scrolling mission log.
 */

(function () {
  "use strict";

  const M = window.MISSION;
  const cv = document.getElementById("map");
  const ctx = cv.getContext("2d");

  // ---- sim state ----
  let simMin = 0;                 // current mission time, minutes from launch
  let playing = false;
  let speed = 600;                // sim-seconds advanced per real second
  let lastFrame = null;
  const DURATION = M.durationMin; // total timeline length

  // ---- helpers: piecewise-linear interpolation over keyframes ----
  function interp(keys, t, field) {
    if (t <= keys[0].t) return keys[0][field];
    const last = keys[keys.length - 1];
    if (t >= last.t) return last[field];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (t >= a.t && t <= b.t) {
        const f = (t - a.t) / (b.t - a.t || 1);
        return a[field] + (b[field] - a[field]) * f;
      }
    }
    return last[field];
  }

  // distance & fuel for an aircraft at time t
  function dOf(ac, t) { return interp(ac.path, t, "d"); }
  function fOf(ac, t) { return Math.max(0, interp(ac.fuel, t, "f")); }

  // is the aircraft airborne yet / still?
  function isAirborne(ac, t) {
    return t >= ac.path[0].t && t <= ac.path[ac.path.length - 1].t + 0.01;
  }
  function hasLanded(ac, t) { return t > ac.path[ac.path.length - 1].t; }

  // direction of travel: +1 south, -1 north (returning)
  function headingOf(ac, t) {
    const eps = 0.5;
    return Math.sign(dOf(ac, t + eps) - dOf(ac, t - eps)) || 1;
  }

  // active transfer events at time t: returns [{from,to,lb}]
  function activeTransfers(t) {
    const out = [];
    for (const e of M.events) {
      if (!e.transfers) continue;
      if (t >= e.t && t <= e.t + (e.dur || 0)) {
        for (const tr of e.transfers) out.push(tr);
      }
    }
    return out;
  }

  // current phase (most recent event carrying a phase label)
  function currentPhase(t) {
    let ph = { label: "STANDBY", text: M.events[0] ? "" : "" };
    for (const e of M.events) {
      if (e.t <= t && e.phaseLabel) ph = { label: e.phaseLabel, text: e.phaseText || "" };
    }
    return ph;
  }

  // ---- geometry: map distance-from-Ascension -> screen y ----
  let W = 0, H = 0, DPR = 1;
  const MARGIN = { top: 70, bottom: 60, left: 90, right: 90 };
  const maxD = M.route.ascensionToStanleyNmi; // 0..maxD spans the route

  function resize() {
    DPR = window.devicePixelRatio || 1;
    const r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function yOfD(d) {
    const top = MARGIN.top, bot = H - MARGIN.bottom;
    return top + (bot - top) * (d / maxD);
  }
  // x position: outbound on the left rail, return on the right rail,
  // bowed slightly for a "track" feel.
  const railOut = () => W * 0.40;
  const railRet = () => W * 0.60;
  function xOf(ac, t) {
    const heading = headingOf(ac, t);
    const returning = heading < 0;
    const base = returning ? railRet() : railOut();
    // small bow so the line isn't dead straight
    const d = dOf(ac, t);
    const bow = Math.sin((d / maxD) * Math.PI) * 18 * (returning ? 1 : -1);
    return base + bow;
  }

  // ---- rendering ----
  function clear() {
    ctx.fillStyle = "#070b10";
    ctx.fillRect(0, 0, W, H);
  }

  function drawRoute() {
    const xo = railOut(), xr = railRet();
    // faint grid of latitude ticks
    ctx.strokeStyle = "#152029";
    ctx.lineWidth = 1;
    for (let d = 0; d <= maxD; d += 500) {
      const y = yOfD(d);
      ctx.beginPath(); ctx.moveTo(MARGIN.left - 30, y); ctx.lineTo(W - MARGIN.right + 30, y); ctx.stroke();
    }
    // the two rails
    ctx.strokeStyle = "#26323d";
    ctx.lineWidth = 2;
    for (const x of [xo, xr]) {
      ctx.beginPath();
      ctx.moveTo(x, yOfD(0)); ctx.lineTo(x, yOfD(maxD));
      ctx.stroke();
    }
    // endpoints
    drawBase(xo, yOfD(0), "ASCENSION I.", "Wideawake — base", "#9fb4c6");
    // Stanley sits at the bottom on the outbound rail
    drawBase(xo, yOfD(maxD), "PORT STANLEY", "target", "#ffb300");

    // bracket markers
    ctx.font = "10px var(--mono, monospace)";
    for (const b of M.brackets) {
      const y = yOfD(b.d);
      ctx.strokeStyle = "#33424f";
      ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(xo - 20, y); ctx.lineTo(xr + 20, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#5f7488";
      ctx.textAlign = "left";
      ctx.fillText(b.label, MARGIN.left - 75, y + 3);
      ctx.fillStyle = "#3c4b59";
      ctx.fillText(Math.round(b.d) + " nmi", MARGIN.left - 75, y + 15);
    }
  }

  function drawBase(x, y, name, sub, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "left";
    ctx.fillText(name, x + 14, y - 2);
    ctx.fillStyle = "#6b7f90";
    ctx.font = "10px monospace";
    ctx.fillText(sub, x + 14, y + 11);
    ctx.restore();
  }

  function colorFor(ac, state) {
    if (state === "returning" || state === "landed") return "#5b6f80";
    return ac.kind === "vulcan" ? "#ffb300" : "#5fa8e6";
  }

  function stateOf(ac, t, transfers) {
    if (!isAirborne(ac, t)) return hasLanded(ac, t) ? "landed" : "preflight";
    const inXfer = transfers.some(tr => tr.from === ac.id || tr.to === ac.id);
    if (inXfer) return "transferring";
    return headingOf(ac, t) < 0 ? "returning" : "cruising";
  }

  function drawAircraft(ac, t, state) {
    const x = xOf(ac, t), y = yOfD(dOf(ac, t));
    const heading = headingOf(ac, t);
    const col = colorFor(ac, state);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(heading < 0 ? Math.PI : 0); // point north when returning

    // glow for the bomber
    if (ac.kind === "vulcan" && state !== "landed") {
      ctx.shadowColor = "#ffb300"; ctx.shadowBlur = 12;
    }
    // marker: delta for Vulcan, chevron for Victor
    ctx.fillStyle = col;
    ctx.beginPath();
    if (ac.kind === "vulcan") {
      ctx.moveTo(0, 9); ctx.lineTo(-8, -7); ctx.lineTo(0, -3); ctx.lineTo(8, -7);
    } else {
      ctx.moveTo(0, 7); ctx.lineTo(-6, -6); ctx.lineTo(0, -2); ctx.lineTo(6, -6);
    }
    ctx.closePath(); ctx.fill();
    ctx.restore();

    // label
    if (state !== "landed") {
      ctx.fillStyle = state === "transferring" ? "#ffd98a"
        : (ac.kind === "vulcan" ? "#ffd98a" : "#9cc6ee");
      ctx.font = (ac.kind === "vulcan" ? "bold " : "") + "10px monospace";
      ctx.textAlign = heading < 0 ? "right" : "left";
      const lx = heading < 0 ? x - 12 : x + 12;
      ctx.fillText(ac.cs, lx, y + 3);
    }
  }

  function drawTransferLinks(t, transfers) {
    const byId = {};
    for (const ac of M.aircraft) byId[ac.id] = ac;
    for (const tr of transfers) {
      const a = byId[tr.from], b = byId[tr.to];
      if (!a || !b) continue;
      const ax = xOf(a, t), ay = yOfD(dOf(a, t));
      const bx = xOf(b, t), by = yOfD(dOf(b, t));
      ctx.strokeStyle = "#ffb300";
      ctx.lineWidth = 1.6;
      ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      ctx.setLineDash([]);
      // animated fuel dots
      const n = 4;
      for (let i = 0; i < n; i++) {
        const ph = ((simMin * 6) % 1 + i / n) % 1;
        const px = ax + (bx - ax) * ph, py = ay + (by - ay) * ph;
        ctx.fillStyle = "#ffe6a8";
        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  function render() {
    if (!W) resize();
    clear();
    drawRoute();
    const transfers = activeTransfers(simMin);
    drawTransferLinks(simMin, transfers);
    // draw airborne aircraft, bomber last (on top)
    const order = M.aircraft.filter(a => isAirborne(a, simMin))
      .sort((a, b) => (a.kind === "vulcan") - (b.kind === "vulcan"));
    for (const ac of order) {
      drawAircraft(ac, simMin, stateOf(ac, simMin, transfers));
    }
  }

  // ---- side panel (fleet fuel) ----
  const fleetEl = document.getElementById("fleet");
  const cards = {};
  function buildFleet() {
    fleetEl.innerHTML = "";
    for (const ac of M.aircraft) {
      const card = document.createElement("div");
      card.className = "ac-card";
      card.innerHTML =
        `<div class="row1"><span class="tag ${ac.kind}"></span>` +
        `<span class="cs">${ac.cs}</span><span class="typ">${ac.kind === "vulcan" ? "VULCAN" : "VICTOR"}</span></div>` +
        `<div class="status"></div>` +
        `<div class="gauge"><span></span></div>` +
        `<div class="fuel-num"><span class="fnow">–</span><span class="fcap">${(ac.fuelCapLb / 1000).toFixed(0)}k lb</span></div>`;
      fleetEl.appendChild(card);
      cards[ac.id] = card;
    }
  }

  const STATUS_TEXT = {
    preflight: "on ground · Wideawake",
    cruising: "cruising south",
    transferring: "◈ refuelling",
    returning: "returning to base",
    landed: "recovered",
  };

  function updateFleet() {
    const transfers = activeTransfers(simMin);
    // sort: airborne first, bomber pinned top
    const sorted = [...M.aircraft].sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "vulcan" ? -1 : 1;
      return a.cs.localeCompare(b.cs);
    });
    for (const ac of sorted) {
      const card = cards[ac.id];
      fleetEl.appendChild(card); // re-order in DOM
      const st = stateOf(ac, simMin, transfers);
      const fuel = fOf(ac, simMin);
      const pct = fuel / ac.fuelCapLb;
      card.className = "ac-card" + (st === "returning" ? " returning"
        : st === "landed" ? " landed" : st === "transferring" ? " transferring" : "");
      const statusEl = card.querySelector(".status");
      statusEl.textContent = STATUS_TEXT[st] || st;
      statusEl.classList.toggle("crit", ac.kind === "vulcan" && pct < 0.18 && st !== "landed" && st !== "preflight");
      const g = card.querySelector(".gauge");
      g.className = "gauge" + (pct < 0.12 ? " crit" : pct < 0.25 ? " low" : "");
      g.querySelector("span").style.width = Math.max(0, Math.min(100, pct * 100)) + "%";
      card.querySelector(".fnow").textContent =
        (st === "preflight" ? "—" : Math.round(fuel / 1000) + "k lb");
    }
  }

  // ---- mission log ----
  const logEl = document.getElementById("log");
  let shownEvents = new Set();
  function fmtClock(min) {
    const h = Math.floor(min / 60), m = Math.floor(min % 60);
    return "+" + String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
  }
  function rebuildLog() {
    logEl.innerHTML = "";
    shownEvents = new Set();
    for (const e of M.events) {
      if (e.t <= simMin && e.text) addLogItem(e);
    }
  }
  function addLogItem(e) {
    if (shownEvents.has(e._id)) return;
    shownEvents.add(e._id);
    const div = document.createElement("div");
    const cls = e.kind === "crisis" ? "drama" : e.kind === "target" ? "target" : "evt";
    div.className = "log-item " + cls;
    div.innerHTML = `<span class="t">${fmtClock(e.t)}</span>${e.text}`;
    logEl.appendChild(div);
    logEl.scrollTop = logEl.scrollHeight;
  }

  // ---- header / phase / clock ----
  const clockEl = document.getElementById("clock");
  const phLabel = document.getElementById("ph-label");
  const phText = document.getElementById("ph-text");
  function updateHud() {
    clockEl.textContent = fmtClock(simMin);
    const ph = currentPhase(simMin);
    phLabel.textContent = ph.label;
    phText.textContent = ph.text;
  }

  // ---- timeline / scrub ----
  const scrub = document.getElementById("scrub");
  scrub.max = 1000;
  function syncScrub() { scrub.value = Math.round((simMin / DURATION) * 1000); }
  scrub.addEventListener("input", () => {
    simMin = (scrub.value / 1000) * DURATION;
    rebuildLog();
    frame(true);
  });

  function buildTicks() {
    const wrap = document.getElementById("tl-ticks");
    wrap.innerHTML = "";
    for (const tk of M.timelineTicks) {
      const el = document.createElement("div");
      el.className = "tl-tick";
      el.style.left = ((tk.t / DURATION) * 100) + "%";
      el.textContent = tk.label;
      wrap.appendChild(el);
    }
  }

  // ---- main loop ----
  function step(now) {
    if (!playing) { lastFrame = null; return; }
    if (lastFrame == null) lastFrame = now;
    const dtReal = (now - lastFrame) / 1000;
    lastFrame = now;
    simMin += dtReal * (speed / 60); // speed = sim-sec/real-sec -> /60 = sim-min/real-sec
    if (simMin >= DURATION) { simMin = DURATION; playing = false; setPlayBtn(); }
    frame(false);
    if (playing) requestAnimationFrame(step);
  }

  function frame(isScrub) {
    render();
    updateFleet();
    updateHud();
    syncScrub();
    if (!isScrub) {
      for (const e of M.events) if (e.t <= simMin && e.text) addLogItem(e);
    }
  }

  // ---- controls ----
  const playBtn = document.getElementById("play");
  function setPlayBtn() {
    playBtn.textContent = playing ? "❚❚ PAUSE" : (simMin >= DURATION ? "▶ REPLAY" : (simMin > 0 ? "▶ RESUME" : "▶ LAUNCH"));
  }
  playBtn.addEventListener("click", () => {
    if (simMin >= DURATION) { simMin = 0; rebuildLog(); }
    playing = !playing;
    setPlayBtn();
    if (playing) requestAnimationFrame(step);
  });
  document.getElementById("reset").addEventListener("click", () => {
    playing = false; simMin = 0; lastFrame = null;
    rebuildLog(); frame(true); setPlayBtn();
  });
  document.querySelectorAll(".speed-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".speed-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      speed = +btn.dataset.speed;
    });
  });
  document.getElementById("start-btn").addEventListener("click", () => {
    document.getElementById("about").classList.add("hidden");
  });

  window.addEventListener("resize", () => { resize(); frame(true); });

  // ---- init ----
  function assignIds() { M.events.forEach((e, i) => e._id = i); }
  function init() {
    assignIds();
    resize();
    buildFleet();
    buildTicks();
    // populate sources in about box
    const src = document.getElementById("about-src");
    if (M.sources) src.innerHTML = "Sources: " + M.sources.join(" · ");
    rebuildLog();
    frame(true);
    setPlayBtn();
  }
  init();
})();
