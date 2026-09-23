/**
 * Operation Black Buck 1 — Aerial Refuelling Simulation
 * Illustrative reconstruction for education / visualisation.
 * Timeline and geometry simplified for readability.
 */

(() => {
  "use strict";

  // ── Geography ──────────────────────────────────────────────
  const ASCENSION = { lat: -7.97, lon: -14.4, name: "Ascension\nWideawake" };
  const STANLEY = { lat: -51.69, lon: -57.85, name: "Port Stanley" };
  const RIO_OFFSHORE = { lat: -24.5, lon: -38.0, name: "Return RV\n(off Brazil)" };
  const BRAZIL_HINT = { lat: -15, lon: -40, name: "Brazil" };
  const AFRICA_HINT = { lat: -5, lon: 5, name: "W. Africa" };
  const ARGENTINA_HINT = { lat: -40, lon: -65, name: "Argentina" };

  // Great-circle–ish track: Ascension → Stanley (south-west),
  // then return via Brazilian coast RV → Ascension.
  // Distances are approximate nautical miles along the sim path.
  const OUTBOUND_NM = 3400;
  const RETURN_VIA_RV_NM = 3600; // Stanley → Rio RV → Ascension (longer arc)
  const TOTAL_NM = OUTBOUND_NM + RETURN_VIA_RV_NM;
  const MISSION_MIN = 16 * 60; // 960 minutes of mission clock

  // Takeoff epoch: 23:50Z 30 Apr 1982
  const EPOCH_H = 23;
  const EPOCH_M = 50;

  // ── Aircraft roster ────────────────────────────────────────
  // Roles cascade: early tankers give fuel then peel north.
  const AIRCRAFT = [
    { id: "XM607", type: "vulcan", call: "XM607", pilot: "Withers", role: "bomber" },
    { id: "XM598", type: "vulcan", call: "XM598", pilot: "Reeve", role: "reserve-bomber" },
    { id: "V01", type: "victor", call: "Red 1", pilot: "—", role: "tanker", wave: 1 },
    { id: "V02", type: "victor", call: "Red 2", pilot: "—", role: "tanker", wave: 1 },
    { id: "V03", type: "victor", call: "Red 3", pilot: "—", role: "tanker", wave: 1 },
    { id: "V04", type: "victor", call: "Red 4", pilot: "—", role: "tanker", wave: 1 },
    { id: "V05", type: "victor", call: "Blue 1", pilot: "—", role: "tanker", wave: 2 },
    { id: "V06", type: "victor", call: "Blue 2", pilot: "—", role: "tanker", wave: 2 },
    { id: "V07", type: "victor", call: "Blue 3", pilot: "—", role: "tanker", wave: 2 },
    { id: "V08", type: "victor", call: "Green 1", pilot: "—", role: "tanker", wave: 3 },
    { id: "V09", type: "victor", call: "XL189", pilot: "Tuxford", role: "final-tanker", wave: 3 },
    { id: "V10", type: "victor", call: "XH669", pilot: "Biglands", role: "penultimate", wave: 3 },
    { id: "V11", type: "victor", call: "Reserve", pilot: "—", role: "reserve-tanker", wave: 0 },
    // Return package (launched later from Ascension)
    { id: "NEAL", type: "victor", call: "Neal", pilot: "Barry Neal", role: "return-tanker", wave: 9 },
    { id: "SEY", type: "victor", call: "Seymour", pilot: "Colin Seymour", role: "rescue-tanker", wave: 9 },
  ];

  // ── Mission events (minutes from first wheels-up) ──────────
  const EVENTS = [
    {
      t: 0,
      title: "Launch sequence",
      body: "Eleven Victors and two Vulcans begin taking off from Wideawake at one-minute intervals (from 23:50Z). Reeve’s XM598 is planned primary; Withers in XM607 is airborne reserve.",
      phase: "Launch",
    },
    {
      t: 14,
      title: "Package airborne",
      body: "Full package clear of Ascension, climbing south into the night over the open Atlantic.",
      phase: "Outbound",
    },
    {
      t: 22,
      title: "Primary Vulcan aborts",
      body: "Sqn Ldr Reeve’s cabin side-window seal fails — cabin will not pressurise. XM598 returns. Flt Lt Martin Withers in XM607 becomes the strike aircraft.",
      phase: "Outbound",
      flag: "abort-vulcan",
    },
    {
      t: 40,
      title: "Tanker hose failure",
      body: "A Victor returns with a faulty hose-and-drogue unit. The airborne reserve tanker slides into the chain.",
      phase: "Outbound",
      flag: "abort-tanker",
    },
    {
      t: 90,
      title: "Refuel bracket 1",
      body: "First major bracket. Outer Victors top up the Vulcan and inner tankers. Probe-and-drogue contacts at ~300 kt, radio silence, night.",
      phase: "Bracket 1",
      flag: "bracket-1",
    },
    {
      t: 130,
      title: "First peel-off",
      body: "Emptied outer tankers reverse course for Ascension. Fuel is being marched south through the formation — Victors feeding Victors so the bomber can keep going.",
      phase: "Outbound",
      flag: "peel-1",
    },
    {
      t: 175,
      title: "Refuel bracket 2",
      body: "Second cascade. Withers burns ~9,200 lb between brackets (~16,250 lb/hr) while still above theoretical max weight. Two more Victors peel north after transfer.",
      phase: "Bracket 2",
      flag: "bracket-2",
    },
    {
      t: 220,
      title: "Down to three",
      body: "Only three aircraft remain southbound: Vulcan XM607 (Withers), Victor XL189 (Bob Tuxford), and Victor XH669 (Steve Biglands).",
      phase: "Deep outbound",
      flag: "three-ship",
    },
    {
      t: 310,
      title: "Final outbound bracket — storm",
      body: "Final planned top-up. Formation flies into a violent thunderstorm. Biglands’s refuelling probe fails. Tuxford must take his place and stay with the Vulcan.",
      phase: "Final bracket",
      flag: "storm-bracket",
    },
    {
      t: 335,
      title: "Tuxford’s gamble",
      body: "Tuxford offloads fuel to Withers — about 7,000 lb less than planned. He no longer has enough to recover to Ascension alone. The Vulcan presses on; XL189 turns north short.",
      phase: "Alone south",
      flag: "vulcan-solo",
    },
    {
      t: 400,
      title: "Low-level approach",
      body: "Withers drops toward 300 ft for the final run-in toward East Falkland, then climbs for the bomb delivery profile.",
      phase: "Attack",
      flag: "approach",
    },
    {
      t: 476,
      title: "Bomb run — SUPERFUSE",
      body: "0746Z: twenty-one 1,000 lb bombs released across Port Stanley airfield runway. Codeword SUPERFUSE signals success as the Vulcan climbs away north.",
      phase: "Attack",
      flag: "bombs",
    },
    {
      t: 520,
      title: "Egress north",
      body: "XM607 heads nearly due north toward a planned Victor rendezvous off the Brazilian coast. Fuel state is critically thin.",
      phase: "Return",
      flag: "egress",
    },
    {
      t: 600,
      title: "Tuxford calls for help",
      body: "Having held radio silence, Tuxford finally requests assistance. Wg Cdr Colin Seymour launches from Ascension to meet him.",
      phase: "Return",
      flag: "tuxford-mayday",
    },
    {
      t: 660,
      title: "Return refuel (Neal)",
      body: "With help from a Nimrod for the join-up, Sqn Ldr Barry Neal’s Victor finds Withers. ‘The most beautiful sight in the world.’ One top-up for the long haul home.",
      phase: "Return RV",
      flag: "return-refuel",
    },
    {
      t: 720,
      title: "Seymour saves Tuxford",
      body: "Seymour’s Victor meets Tuxford and transfers enough fuel to prevent ditching. Tuxford recovers after 14 h 5 min airborne.",
      phase: "Return",
      flag: "tuxford-saved",
    },
    {
      t: 880,
      title: "Recovery to Ascension",
      body: "XM607, Neal, and remaining tankers recover to Wideawake. Withers touches down 14:52Z — roughly sixteen hours after the package began launching.",
      phase: "Recovery",
      flag: "land",
    },
  ];

  // ── State ──────────────────────────────────────────────────
  const state = {
    tMin: 0, // mission minutes 0..MISSION_MIN
    playing: false,
    speed: 60, // mission-minutes per real second
    view: "overview", // overview | formation | split
    lastEventIdx: -1,
    logged: new Set(),
  };

  // ── DOM ────────────────────────────────────────────────────
  const canvas = document.getElementById("map-canvas");
  const ctx = canvas.getContext("2d");
  const wrap = document.getElementById("canvas-wrap");
  const timeline = document.getElementById("timeline");
  const btnPlay = document.getElementById("btn-play");
  const btnReset = document.getElementById("btn-reset");
  const btnStep = document.getElementById("btn-step");
  const speedSel = document.getElementById("speed");
  const eventLog = document.getElementById("event-log");
  const formationList = document.getElementById("formation-list");
  const formationCallout = document.getElementById("formation-callout");
  const scaleNote = document.getElementById("scale-note");
  const markersEl = document.getElementById("timeline-markers");

  // ── Helpers ────────────────────────────────────────────────
  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smoothstep(t) {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function formatZulu(minFromEpoch) {
    let total = EPOCH_H * 60 + EPOCH_M + minFromEpoch;
    const day = total >= 24 * 60 ? "1 May" : "30 Apr";
    total = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
    const h = Math.floor(total / 60);
    const m = Math.floor(total % 60);
    return `${day} ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}Z`;
  }

  function haversineNm(a, b) {
    const R = 3440.065; // Earth radius nm
    const toR = Math.PI / 180;
    const dLat = (b.lat - a.lat) * toR;
    const dLon = (b.lon - a.lon) * toR;
    const la1 = a.lat * toR;
    const la2 = b.lat * toR;
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  function interpolateGreatCircle(a, b, t) {
    // Simple spherical lerp (good enough for this track)
    const toR = Math.PI / 180;
    const lat1 = a.lat * toR;
    const lon1 = a.lon * toR;
    const lat2 = b.lat * toR;
    const lon2 = b.lon * toR;
    const d =
      2 *
      Math.asin(
        Math.sqrt(
          Math.sin((lat2 - lat1) / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2
        )
      );
    if (d < 1e-9) return { lat: a.lat, lon: a.lon };
    const A = Math.sin((1 - t) * d) / Math.sin(d);
    const B = Math.sin(t * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) / toR;
    const lon = Math.atan2(y, x) / toR;
    return { lat, lon };
  }

  // Path progress 0..1 → lat/lon along full mission track
  // 0..0.48 outbound Ascension→Stanley, 0.48..0.72 Stanley→Rio RV, 0.72..1 Rio→Ascension
  function pathPoint(u) {
    u = clamp(u, 0, 1);
    if (u <= 0.48) {
      return interpolateGreatCircle(ASCENSION, STANLEY, u / 0.48);
    }
    if (u <= 0.72) {
      return interpolateGreatCircle(STANLEY, RIO_OFFSHORE, (u - 0.48) / 0.24);
    }
    return interpolateGreatCircle(RIO_OFFSHORE, ASCENSION, (u - 0.72) / 0.28);
  }

  function pathDistanceNm(u) {
    // Approximate distance flown along path
    if (u <= 0.48) return (u / 0.48) * OUTBOUND_NM;
    if (u <= 0.72) return OUTBOUND_NM + ((u - 0.48) / 0.24) * 1100;
    return OUTBOUND_NM + 1100 + ((u - 0.72) / 0.28) * 2500;
  }

  // Map mission time → path progress for the Vulcan (after it becomes primary)
  function vulcanPathU(tMin) {
    // Solo attack window: path u hits Stanley ~ t=476
    if (tMin < 14) return 0;
    if (tMin <= 476) {
      // outbound: 14 → 476 maps to 0 → 0.48
      return ((tMin - 14) / (476 - 14)) * 0.48;
    }
    if (tMin <= 660) {
      // to return RV
      return 0.48 + ((tMin - 476) / (660 - 476)) * 0.24;
    }
    if (tMin <= 880) {
      return 0.72 + ((tMin - 660) / (880 - 660)) * 0.28;
    }
    return 1;
  }

  // ── Aircraft dynamic state ─────────────────────────────────
  function buildAircraftState(tMin) {
    const list = AIRCRAFT.map((a) => ({
      ...a,
      status: "ground", // ground | airborne | peels | RTB | landed | aborted
      pathU: 0,
      fuel: a.type === "vulcan" ? 1 : 0.9,
      giving: null, // id of receiver
      receiving: false,
      offset: 0, // lateral formation offset for rendering
      opacity: 1,
      label: a.call,
    }));

    const byId = Object.fromEntries(list.map((a) => [a.id, a]));

    // Launch stagger: Victors first, then XM598, XM607 last
    const launchOrder = [
      "V01", "V02", "V03", "V04", "V05", "V06", "V07", "V08", "V09", "V10", "V11",
      "XM598", "XM607",
    ];
    launchOrder.forEach((id, i) => {
      const a = byId[id];
      if (tMin >= i) {
        a.status = "airborne";
        a.pathU = vulcanPathU(Math.max(0, tMin - i * 0.3));
      }
    });

    // Reeve abort
    if (tMin >= 22) {
      const reeve = byId.XM598;
      reeve.status = "aborted";
      // Reverse toward Ascension
      const abortProg = clamp((tMin - 22) / 90, 0, 1);
      reeve.pathU = Math.max(0, vulcanPathU(22) * (1 - abortProg));
      reeve.opacity = abortProg > 0.95 ? 0.25 : 0.7;
      reeve.label = "XM598 RTB";
    }

    // Hose fail tanker
    if (tMin >= 40) {
      const bad = byId.V03;
      if (bad.status === "airborne" || bad.status === "peels") {
        bad.status = "aborted";
        const p = clamp((tMin - 40) / 80, 0, 1);
        bad.pathU = Math.max(0, vulcanPathU(40) * (1 - p));
        bad.opacity = p > 0.9 ? 0.2 : 0.65;
        bad.label = "Hose fail RTB";
      }
      // Reserve fully in chain
      byId.V11.role = "tanker";
    }

    // Vulcan primary path (authoritative for package center)
    const vu = vulcanPathU(tMin);
    if (tMin >= 14 && byId.XM607.status !== "landed") {
      byId.XM607.status = tMin >= 880 ? "landed" : "airborne";
      byId.XM607.pathU = vu;
    }
    if (tMin >= 880) {
      byId.XM607.status = "landed";
      byId.XM607.pathU = 1;
    }

    // Position tankers relative to vulcan progress with peel schedules
    // Wave 1 peels after bracket 1 (~130)
    // Wave 2 peels after bracket 2 (~200)
    // Wave 3: Biglands peels damaged ~335, Tuxford peels short after final give
    const peelWave = (wave, peelT, homeDur = 120) => {
      list
        .filter((a) => a.type === "victor" && a.wave === wave && a.status === "airborne")
        .forEach((a, idx) => {
          if (tMin < peelT) {
            // Stay near package slightly ahead/behind
            a.pathU = clamp(vu - 0.01 + idx * 0.002, 0, 1);
            a.offset = (idx - 1.5) * 14;
          } else {
            a.status = "peels";
            const p = clamp((tMin - peelT) / homeDur, 0, 1);
            // Fly back: pathU decreases toward 0
            const startU = vulcanPathU(peelT);
            a.pathU = startU * (1 - p);
            a.offset = (idx - 1.5) * 10;
            a.opacity = p > 0.98 ? 0.15 : 0.75;
            if (p > 0.98) a.status = "landed";
          }
        });
    };

    peelWave(1, 130, 140);
    peelWave(2, 200, 160);

    // Wave 3 special handling
    ["V08", "V09", "V10"].forEach((id, idx) => {
      const a = byId[id];
      if (a.status === "aborted") return;
      if (id === "V10" && tMin >= 310) {
        // Biglands probe fail — peels early after failed attempt
        a.status = "peels";
        a.label = "Biglands (probe)";
        const p = clamp((tMin - 320) / 150, 0, 1);
        a.pathU = vulcanPathU(310) * (1 - p);
        a.opacity = p > 0.95 ? 0.2 : 0.7;
        if (p > 0.95) a.status = "landed";
        return;
      }
      if (id === "V09") {
        // Tuxford stays until ~335 then turns north short of fuel
        if (tMin < 335) {
          a.status = "airborne";
          a.pathU = clamp(vu - 0.008, 0, 1);
          a.offset = -18;
          a.label = "Tuxford XL189";
        } else if (tMin < 720) {
          a.status = "peels";
          a.label = "Tuxford (critical)";
          // Slowly north, meets Seymour around 720
          const p = clamp((tMin - 335) / 400, 0, 0.55);
          a.pathU = vulcanPathU(335) * (1 - p);
          a.offset = -12;
        } else if (tMin < 820) {
          a.status = "airborne";
          a.label = "Tuxford + Seymour";
          const p = clamp((tMin - 720) / 100, 0, 1);
          a.pathU = Math.max(0, a.pathU ?? 0.15) * (1 - p * 0.3);
          // Actually recover
          a.pathU = lerp(0.12, 0, p);
        } else {
          a.status = "landed";
          a.pathU = 0;
          a.opacity = 0.3;
        }
        return;
      }
      // V08 peels with three-ship reduction
      if (tMin >= 220) {
        a.status = "peels";
        const p = clamp((tMin - 220) / 150, 0, 1);
        a.pathU = vulcanPathU(220) * (1 - p);
        a.opacity = p > 0.95 ? 0.2 : 0.7;
        if (p > 0.95) a.status = "landed";
      } else {
        a.pathU = clamp(vu - 0.012 + idx * 0.003, 0, 1);
        a.offset = (idx - 1) * 16;
      }
    });

    // Reserve tanker V11 follows wave 1 if in chain
    if (byId.V11.status === "airborne" && tMin >= 40 && tMin < 130) {
      byId.V11.pathU = clamp(vu - 0.015, 0, 1);
      byId.V11.offset = 22;
    } else if (tMin >= 130 && byId.V11.status === "airborne") {
      byId.V11.status = "peels";
      const p = clamp((tMin - 130) / 140, 0, 1);
      byId.V11.pathU = vulcanPathU(130) * (1 - p);
      if (p > 0.98) byId.V11.status = "landed";
    }

    // Neal return tanker launches ~580
    {
      const n = byId.NEAL;
      if (tMin < 580) {
        n.status = "ground";
        n.opacity = 0;
      } else if (tMin < 660) {
        n.status = "airborne";
        n.opacity = 1;
        // Fly south to meet Vulcan near Rio RV (u~0.72)
        const p = (tMin - 580) / 80;
        n.pathU = lerp(0, 0.7, smoothstep(p));
        n.offset = 20;
        n.label = "Neal (RV)";
      } else if (tMin < 880) {
        n.status = "airborne";
        n.pathU = byId.XM607.pathU;
        n.offset = 18;
        n.label = "Neal";
      } else {
        n.status = "landed";
        n.pathU = 0;
        n.opacity = 0.35;
      }
    }

    // Seymour rescue
    {
      const s = byId.SEY;
      if (tMin < 610) {
        s.status = "ground";
        s.opacity = 0;
      } else if (tMin < 820) {
        s.status = "airborne";
        s.opacity = 1;
        // Intercept Tuxford around pathU 0.1-0.15
        const p = clamp((tMin - 610) / 110, 0, 1);
        s.pathU = lerp(0, byId.V09.pathU || 0.1, smoothstep(p));
        s.offset = 14;
        s.label = "Seymour";
      } else {
        s.status = "landed";
        s.pathU = 0;
        s.opacity = 0.3;
      }
    }

    // Active hoses / giving relationships
    list.forEach((a) => {
      a.giving = null;
      a.receiving = false;
    });

    const activeRefuels = getActiveRefuels(tMin);
    activeRefuels.forEach(({ from, to }) => {
      if (byId[from] && byId[to]) {
        byId[from].giving = to;
        byId[to].receiving = true;
      }
    });

    // Vulcan fuel curve (illustrative 0..1)
    let fuel = 1;
    if (tMin < 90) fuel = 0.92;
    else if (tMin < 130) fuel = lerp(0.92, 1.0, (tMin - 90) / 40);
    else if (tMin < 175) fuel = lerp(1.0, 0.78, (tMin - 130) / 45);
    else if (tMin < 210) fuel = lerp(0.78, 0.98, (tMin - 175) / 35);
    else if (tMin < 310) fuel = lerp(0.98, 0.55, (tMin - 210) / 100);
    else if (tMin < 340) fuel = lerp(0.55, 0.88, (tMin - 310) / 30);
    else if (tMin < 476) fuel = lerp(0.88, 0.42, (tMin - 340) / 136);
    else if (tMin < 660) fuel = lerp(0.42, 0.12, (tMin - 476) / 184);
    else if (tMin < 700) fuel = lerp(0.12, 0.75, (tMin - 660) / 40);
    else fuel = lerp(0.75, 0.35, clamp((tMin - 700) / 180, 0, 1));
    byId.XM607.fuel = clamp(fuel, 0.05, 1);

    // Formation offsets for package members near vulcan
    if (byId.XM607.status === "airborne") {
      byId.XM607.offset = 0;
      byId.XM607.label = tMin >= 476 && tMin < 520 ? "XM607 SUPERFUSE" : "XM607 Withers";
    }

    return list;
  }

  function getActiveRefuels(tMin) {
    const windows = [
      // bracket 1
      { t0: 90, t1: 120, pairs: [["V01", "XM607"], ["V02", "V05"], ["V04", "V08"]] },
      { t0: 100, t1: 125, pairs: [["V03", "V09"], ["V11", "V10"]] },
      // bracket 2
      { t0: 175, t1: 205, pairs: [["V05", "XM607"], ["V06", "V09"], ["V07", "V10"]] },
      // final storm bracket
      { t0: 310, t1: 328, pairs: [["V10", "XM607"]] }, // Biglands attempt fails
      { t0: 318, t1: 338, pairs: [["V09", "XM607"]] }, // Tuxford takes over
      // return
      { t0: 660, t1: 695, pairs: [["NEAL", "XM607"]] },
      { t0: 720, t1: 750, pairs: [["SEY", "V09"]] },
    ];
    const out = [];
    windows.forEach((w) => {
      if (tMin >= w.t0 && tMin <= w.t1) {
        w.pairs.forEach(([from, to]) => out.push({ from, to }));
      }
    });
    return out;
  }

  function currentEvent(tMin) {
    let cur = EVENTS[0];
    let idx = 0;
    for (let i = 0; i < EVENTS.length; i++) {
      if (tMin >= EVENTS[i].t) {
        cur = EVENTS[i];
        idx = i;
      }
    }
    return { event: cur, idx };
  }

  // ── Projection ─────────────────────────────────────────────
  const proj = {
    w: 800,
    h: 600,
    // Geographic bounds (overview) — South Atlantic, slightly padded
    lon0: -70,
    lon1: 10,
    lat0: -58,
    lat1: 2,
    // Camera for formation / pan
    camLon: -30,
    camLat: -25,
    camScale: 1,
  };

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = wrap.getBoundingClientRect();
    proj.w = Math.max(320, rect.width);
    proj.h = Math.max(240, rect.height);
    canvas.width = proj.w * dpr;
    canvas.height = proj.h * dpr;
    canvas.style.width = `${proj.w}px`;
    canvas.style.height = `${proj.h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function geoToXY(lat, lon, mode, focus) {
    if (mode === "formation" && focus) {
      // Local tangent plane around focus, with exaggerated lateral scale
      const nmPerDegLat = 60;
      const nmPerDegLon = 60 * Math.cos((focus.lat * Math.PI) / 180);
      const dxNm = (lon - focus.lon) * nmPerDegLon;
      const dyNm = (lat - focus.lat) * nmPerDegLat;
      // Stretch along-track less, cross-track more for readability is applied via offset
      const scale = Math.min(proj.w, proj.h) / 180; // ~180 nm visible window (zoomed)
      const x = proj.w / 2 + dxNm * scale;
      const y = proj.h / 2 - dyNm * scale;
      return { x, y };
    }

    // Overview equirectangular
    const x = ((lon - proj.lon0) / (proj.lon1 - proj.lon0)) * proj.w;
    const y = ((proj.lat1 - lat) / (proj.lat1 - proj.lat0)) * proj.h;
    return { x, y };
  }

  // Apply formation lateral offset in screen space (readable spacing)
  function withOffset(xy, offsetPx, headingRad) {
    // offset perpendicular to track
    const px = -Math.sin(headingRad) * offsetPx;
    const py = -Math.cos(headingRad) * offsetPx;
    return { x: xy.x + px, y: xy.y + py };
  }

  function headingAt(u) {
    const a = pathPoint(Math.max(0, u - 0.002));
    const b = pathPoint(Math.min(1, u + 0.002));
    const p0 = geoToXY(a.lat, a.lon, "overview");
    const p1 = geoToXY(b.lat, b.lon, "overview");
    return Math.atan2(p1.y - p0.y, p1.x - p0.x);
  }

  // ── Drawing ────────────────────────────────────────────────
  function drawOceanBackground(mode, focus) {
    const g = ctx.createLinearGradient(0, 0, 0, proj.h);
    g.addColorStop(0, "#0a1830");
    g.addColorStop(0.5, "#071222");
    g.addColorStop(1, "#050b16");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, proj.w, proj.h);

    // Subtle grid
    ctx.save();
    ctx.strokeStyle = "rgba(100, 140, 200, 0.06)";
    ctx.lineWidth = 1;
    for (let lon = -70; lon <= 10; lon += 10) {
      const a = geoToXY(proj.lat0, lon, mode, focus);
      const b = geoToXY(proj.lat1, lon, mode, focus);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    for (let lat = -60; lat <= 0; lat += 10) {
      const a = geoToXY(lat, proj.lon0, mode, focus);
      const b = geoToXY(lat, proj.lon1, mode, focus);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Simplified landmass silhouettes (polygon approximations)
  const LAND = {
    southAmerica: [
      [-34.5, 5], [-51, 4], [-60, -5], [-70, -18], [-72, -35], [-70, -50],
      [-68, -55], [-65, -55], [-63, -50], [-58, -40], [-55, -30], [-48, -25],
      [-40, -22], [-35, -8], [-35, 0], [-34.5, 5],
    ],
    africa: [
      [0, 6], [5, 5], [8, 0], [10, -10], [12, -20], [10, -28], [5, -30],
      [0, -25], [-5, -15], [-8, -5], [-5, 2], [0, 6],
    ],
    falklands: [
      [-61.5, -51.2], [-57.5, -51.2], [-57.5, -52.4], [-61.5, -52.4], [-61.5, -51.2],
    ],
    ascensionTiny: [
      [-14.6, -7.8], [-14.2, -7.8], [-14.2, -8.1], [-14.6, -8.1], [-14.6, -7.8],
    ],
  };

  function drawLand(mode, focus) {
    const drawPoly = (ring, fill) => {
      ctx.beginPath();
      ring.forEach(([lon, lat], i) => {
        const p = geoToXY(lat, lon, mode, focus);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = "rgba(140, 180, 220, 0.15)";
      ctx.stroke();
    };

    if (mode === "overview" || mode === "split") {
      drawPoly(LAND.southAmerica, "#1a2d45");
      drawPoly(LAND.africa, "#1a2d45");
      drawPoly(LAND.falklands, "#2a4060");
    }
  }

  function drawRoute(mode, focus, progressU) {
    // Full planned path
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const u = i / 120;
      const g = pathPoint(u);
      const p = geoToXY(g.lat, g.lon, mode, focus);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = "rgba(240, 180, 41, 0.28)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Flown trail
    ctx.beginPath();
    const steps = Math.max(2, Math.floor(progressU * 120));
    for (let i = 0; i <= steps; i++) {
      const u = (i / 120) * Math.min(progressU, 1);
      const g = pathPoint(u);
      const p = geoToXY(g.lat, g.lon, mode, focus);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = "rgba(78, 205, 196, 0.65)";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  function drawPlace(lat, lon, name, mode, focus) {
    const p = geoToXY(lat, lon, mode, focus);
    if (p.x < -40 || p.x > proj.w + 40 || p.y < -40 || p.y > proj.h + 40) return;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#f0b429";
    ctx.fill();
    ctx.font = "600 11px 'IBM Plex Sans', sans-serif";
    ctx.fillStyle = "rgba(232, 238, 249, 0.85)";
    const lines = name.split("\n");
    lines.forEach((line, i) => {
      ctx.fillText(line, p.x + 8, p.y + 4 + i * 13);
    });
  }

  function drawAircraftIcon(x, y, heading, type, opts) {
    const { color, scale = 1, glow = false, label, fuel } = opts;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(heading);

    if (glow) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
    }

    ctx.beginPath();
    if (type === "vulcan") {
      // Delta silhouette
      const s = 14 * scale;
      ctx.moveTo(s, 0);
      ctx.lineTo(-s * 0.7, s * 0.85);
      ctx.lineTo(-s * 0.35, 0);
      ctx.lineTo(-s * 0.7, -s * 0.85);
      ctx.closePath();
    } else {
      // Victor crescent / crescent-wing approx
      const s = 11 * scale;
      ctx.moveTo(s, 0);
      ctx.lineTo(-s * 0.5, s * 0.7);
      ctx.lineTo(-s * 0.15, 0);
      ctx.lineTo(-s * 0.5, -s * 0.7);
      ctx.closePath();
    }
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Fuel pip for vulcan
    if (type === "vulcan" && fuel != null) {
      ctx.rotate(-heading);
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(-16, 16, 32, 4);
      ctx.fillStyle = fuel > 0.3 ? "#5ad67d" : "#ff5c7a";
      ctx.fillRect(-16, 16, 32 * fuel, 4);
    }

    ctx.restore();

    if (label) {
      ctx.font = "600 10px 'IBM Plex Mono', monospace";
      ctx.fillStyle = "rgba(232, 238, 249, 0.9)";
      ctx.textAlign = "center";
      ctx.fillText(label, x, y + (type === "vulcan" ? 28 : 22));
      ctx.textAlign = "left";
    }
  }

  function drawHose(x1, y1, x2, y2, t) {
    const mx = (x1 + x2) / 2 + Math.sin(t * 0.01) * 4;
    const my = (y1 + y2) / 2 + Math.cos(t * 0.01) * 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(mx, my, x2, y2);
    ctx.strokeStyle = "rgba(255, 209, 102, 0.9)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -t * 0.05;
    ctx.stroke();
    ctx.setLineDash([]);

    // Flow dots
    const steps = 5;
    for (let i = 0; i < steps; i++) {
      const u = ((t * 0.002 + i / steps) % 1);
      const px = (1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * mx + u * u * x2;
      const py = (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * my + u * u * y2;
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = "#ffd166";
      ctx.fill();
    }
  }

  function drawRefuelRing(x, y, t) {
    const r = 18 + (Math.sin(t * 0.008) + 1) * 4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 209, 102, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawBombFlash(x, y, tMin) {
    const age = tMin - 476;
    if (age < 0 || age > 25) return;
    const a = 1 - age / 25;
    ctx.beginPath();
    ctx.arc(x, y, 8 + age * 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 120, 60, ${0.55 * a})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 20 + age * 3, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 180, 80, ${0.4 * a})`;
    ctx.stroke();
  }

  function drawScaleBar(mode) {
    ctx.save();
    const x = 20;
    const y = proj.h - 28;
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(x - 8, y - 18, 150, 32);
    ctx.strokeStyle = "rgba(232,238,249,0.7)";
    ctx.fillStyle = "rgba(232,238,249,0.85)";
    ctx.font = "10px 'IBM Plex Mono', monospace";
    if (mode === "formation") {
      ctx.fillText("Scaled view · spacing ×50", x, y);
      ctx.beginPath();
      ctx.moveTo(x, y + 8);
      ctx.lineTo(x + 80, y + 8);
      ctx.stroke();
      ctx.fillText("~2 nm true", x, y + 20);
    } else {
      // ~ approximate: full width spans ~80 deg lon at mid lat ≈ 80*60*cos(30) ~ 4150 nm
      const barNm = 500;
      const midLat = (proj.lat0 + proj.lat1) / 2;
      const nmPerPx =
        (Math.abs(proj.lon1 - proj.lon0) * 60 * Math.cos((midLat * Math.PI) / 180)) /
        proj.w;
      const barPx = barNm / nmPerPx;
      ctx.beginPath();
      ctx.moveTo(x, y + 6);
      ctx.lineTo(x + barPx, y + 6);
      ctx.moveTo(x, y + 2);
      ctx.lineTo(x, y + 10);
      ctx.moveTo(x + barPx, y + 2);
      ctx.lineTo(x + barPx, y + 10);
      ctx.stroke();
      ctx.fillText(`${barNm} nm`, x, y - 2);
    }
    ctx.restore();
  }

  function drawCompass() {
    const x = proj.w - 40;
    const y = 40;
    ctx.save();
    ctx.strokeStyle = "rgba(232,238,249,0.4)";
    ctx.fillStyle = "rgba(232,238,249,0.7)";
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y - 14);
    ctx.lineTo(x - 4, y - 2);
    ctx.lineTo(x + 4, y - 2);
    ctx.closePath();
    ctx.fillStyle = "#ff6b4a";
    ctx.fill();
    ctx.font = "9px 'IBM Plex Mono'";
    ctx.fillStyle = "rgba(232,238,249,0.7)";
    ctx.textAlign = "center";
    ctx.fillText("N", x, y + 28);
    ctx.textAlign = "left";
    ctx.restore();
  }

  function screenPosForAircraft(ac, mode, focus) {
    const g = pathPoint(ac.pathU);
    let p = geoToXY(g.lat, g.lon, mode, focus);
    const hdg = headingAt(ac.pathU);

    if (mode === "formation") {
      // Exaggerated lateral offset for readable formation
      const scaledOffset = (ac.offset || 0) * 2.8;
      // Also stagger along track slightly by offset
      const along = (ac.offset || 0) * 0.15;
      p = {
        x: p.x + Math.cos(hdg) * along - Math.sin(hdg) * scaledOffset,
        y: p.y + Math.sin(hdg) * along + Math.cos(hdg) * scaledOffset * 0.2,
      };
    } else {
      // Small screen offset so stacked aircraft are visible on overview
      const o = (ac.offset || 0) * 0.35;
      p = withOffset(p, o, hdg);
    }
    return { p, hdg, g };
  }

  function drawScene(mode, rect) {
    ctx.save();
    if (rect) {
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.w, rect.h);
      ctx.clip();
      ctx.translate(rect.x, rect.y);
      // Temporarily override proj size for sub-views
    }

    const aircraft = buildAircraftState(state.tMin);
    const vulcan = aircraft.find((a) => a.id === "XM607");
    const focusGeo = pathPoint(vulcan ? vulcan.pathU : 0);

    // For split, each pane has own width — handled by caller via temp proj
    drawOceanBackground(mode, focusGeo);
    drawLand(mode, focusGeo);
    drawRoute(mode, focusGeo, vulcan ? vulcan.pathU : 0);

    if (mode === "overview") {
      drawPlace(ASCENSION.lat, ASCENSION.lon, ASCENSION.name, mode, focusGeo);
      drawPlace(STANLEY.lat, STANLEY.lon, STANLEY.name, mode, focusGeo);
      drawPlace(RIO_OFFSHORE.lat, RIO_OFFSHORE.lon, RIO_OFFSHORE.name, mode, focusGeo);
    }

    // Bomb flash
    if (state.tMin >= 476) {
      const sp = geoToXY(STANLEY.lat, STANLEY.lon, mode, focusGeo);
      drawBombFlash(sp.x, sp.y, state.tMin);
    }

    // Hoses first
    const posMap = {};
    aircraft.forEach((ac) => {
      if (ac.status === "ground" || ac.opacity < 0.05) return;
      const { p, hdg } = screenPosForAircraft(ac, mode, focusGeo);
      posMap[ac.id] = { p, hdg, ac };
    });

    Object.values(posMap).forEach(({ p, ac }) => {
      if (ac.giving && posMap[ac.giving]) {
        const recv = posMap[ac.giving];
        drawHose(p.x, p.y, recv.p.x, recv.p.y, performance.now());
        drawRefuelRing((p.x + recv.p.x) / 2, (p.y + recv.p.y) / 2, performance.now());
      }
    });

    // Aircraft
    Object.values(posMap).forEach(({ p, hdg, ac }) => {
      ctx.globalAlpha = ac.opacity;
      const isVulcan = ac.type === "vulcan";
      const color =
        ac.status === "aborted" || ac.status === "peels"
          ? "#7b8db0"
          : isVulcan
            ? "#ff6b4a"
            : "#4ecdc4";
      const scale = mode === "formation" ? (isVulcan ? 1.6 : 1.35) : isVulcan ? 1.15 : 0.95;
      drawAircraftIcon(p.x, p.y, hdg, ac.type, {
        color,
        scale,
        glow: ac.receiving || !!ac.giving || (isVulcan && ac.status === "airborne"),
        label: mode === "formation" || isVulcan || ac.pilot === "Tuxford" || ac.role === "return-tanker" || ac.role === "rescue-tanker"
          ? ac.label
          : mode === "overview" && ac.status === "airborne"
            ? ""
            : ac.label,
        fuel: isVulcan ? ac.fuel : null,
      });
      ctx.globalAlpha = 1;
    });

    // Package count badge near vulcan
    if (vulcan && vulcan.status === "airborne") {
      const airborne = aircraft.filter(
        (a) => a.status === "airborne" && a.opacity > 0.4 && a.pathU > 0.02
      ).length;
      const { p } = screenPosForAircraft(vulcan, mode, focusGeo);
      ctx.font = "600 11px 'IBM Plex Mono'";
      ctx.fillStyle = "rgba(240,180,41,0.9)";
      if (mode === "overview") {
        ctx.fillText(`${airborne} ac south`, p.x + 16, p.y - 12);
      }
    }

    drawScaleBar(mode);
    if (mode === "overview") drawCompass();

    // Mode label
    ctx.font = "600 10px 'IBM Plex Mono'";
    ctx.fillStyle = "rgba(143,163,193,0.8)";
    ctx.fillText(
      mode === "formation"
        ? "FORMATION · spacing exaggerated for readability"
        : "OVERVIEW · South Atlantic",
      16,
      22
    );

    ctx.restore();
    return aircraft;
  }

  function render() {
    resize();
    ctx.clearRect(0, 0, proj.w, proj.h);

    let aircraft;
    if (state.view === "split") {
      // Left overview, right formation
      const mid = Math.floor(proj.w / 2);
      // Draw overview in left half by temporarily setting proj.w
      const fullW = proj.w;
      const fullH = proj.h;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, mid - 1, fullH);
      ctx.clip();
      proj.w = mid - 1;
      aircraft = drawScene("overview");
      proj.w = fullW;
      ctx.restore();

      // Divider
      ctx.fillStyle = "rgba(240,180,41,0.35)";
      ctx.fillRect(mid - 1, 0, 2, fullH);

      ctx.save();
      ctx.beginPath();
      ctx.rect(mid + 1, 0, fullW - mid - 1, fullH);
      ctx.clip();
      ctx.translate(mid + 1, 0);
      proj.w = fullW - mid - 1;
      drawScene("formation");
      proj.w = fullW;
      ctx.restore();
    } else {
      aircraft = drawScene(state.view);
    }

    updateUI(aircraft || buildAircraftState(state.tMin));
  }

  // ── UI updates ─────────────────────────────────────────────
  function updateUI(aircraft) {
    const { event, idx } = currentEvent(state.tMin);
    document.getElementById("stat-time").textContent = formatZulu(state.tMin);
    const vu = vulcanPathU(state.tMin);
    document.getElementById("stat-dist").textContent = `${Math.round(pathDistanceNm(vu))} nm`;
    const airborne = aircraft.filter((a) => a.status === "airborne" && a.opacity > 0.3).length;
    document.getElementById("stat-airborne").textContent = String(airborne);
    const vulcan = aircraft.find((a) => a.id === "XM607");
    document.getElementById("stat-fuel").textContent = vulcan
      ? `${Math.round(vulcan.fuel * 74)}k lb`
      : "—";
    document.getElementById("stat-phase").textContent = event.phase;

    document.getElementById("detail-title").textContent = event.title;
    document.getElementById("detail-body").textContent = event.body;

    const fill = document.getElementById("fuel-fill");
    const fl = document.getElementById("fuel-label");
    if (vulcan) {
      fill.style.width = `${vulcan.fuel * 100}%`;
      fl.textContent = `${Math.round(vulcan.fuel * 74000).toLocaleString()} lb`;
    }

    // Formation list
    const active = aircraft
      .filter((a) => a.status !== "ground" && a.opacity > 0.15)
      .sort((a, b) => {
        const rank = (x) =>
          x.type === "vulcan" ? 0 : x.giving ? 1 : x.receiving ? 2 : x.status === "airborne" ? 3 : 4;
        return rank(a) - rank(b);
      });
    formationList.innerHTML = active
      .slice(0, 14)
      .map((a) => {
        const color =
          a.type === "vulcan" ? "var(--vulcan)" : a.status === "airborne" ? "var(--victor)" : "var(--reserve)";
        let st = a.status;
        if (a.giving) st = `→ fuel ${a.giving}`;
        if (a.receiving) st = "taking fuel";
        return `<div class="ac-row ${a.status === "airborne" ? "active" : ""}">
          <span class="dot" style="background:${color};width:8px;height:8px;border-radius:50%;display:inline-block"></span>
          <span class="name">${a.label}</span>
          <span class="state">${st}</span>
        </div>`;
      })
      .join("");

    // Event log
    if (idx !== state.lastEventIdx) {
      state.lastEventIdx = idx;
      // rebuild log up to current
      eventLog.innerHTML = EVENTS.filter((e) => e.t <= state.tMin)
        .slice()
        .reverse()
        .map((e, i) => {
          const current = e.t === event.t;
          return `<div class="event-item ${current ? "current" : ""}">
            <span class="t">${formatZulu(e.t)}</span>
            ${e.title}
          </div>`;
        })
        .join("");
    }

    timeline.value = String(Math.round((state.tMin / MISSION_MIN) * 1000));

    formationCallout.hidden = !(state.view === "formation" || state.view === "split");
    scaleNote.textContent =
      state.view === "formation"
        ? "Formation view · lateral spacing exaggerated ~50× for readability"
        : state.view === "split"
          ? "Split: geographic overview | scaled formation"
          : "Geographic overview · aircraft enlarged for visibility";
  }

  // ── Controls ───────────────────────────────────────────────
  function setPlaying(p) {
    state.playing = p;
    btnPlay.textContent = p ? "⏸" : "▶";
    btnPlay.classList.toggle("playing", p);
  }

  btnPlay.addEventListener("click", () => setPlaying(!state.playing));
  btnReset.addEventListener("click", () => {
    state.tMin = 0;
    state.lastEventIdx = -1;
    setPlaying(false);
    render();
  });
  btnStep.addEventListener("click", () => {
    setPlaying(false);
    const next = EVENTS.find((e) => e.t > state.tMin + 0.5);
    state.tMin = next ? next.t : Math.min(MISSION_MIN, state.tMin + 30);
    state.lastEventIdx = -1;
    render();
  });
  timeline.addEventListener("input", () => {
    state.tMin = (Number(timeline.value) / 1000) * MISSION_MIN;
    state.lastEventIdx = -1;
    render();
  });
  speedSel.addEventListener("change", () => {
    state.speed = Number(speedSel.value);
  });

  document.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.view = btn.dataset.view;
      render();
    });
  });

  // Timeline markers
  function placeMarkers() {
    markersEl.innerHTML = EVENTS.map((e) => {
      const pct = (e.t / MISSION_MIN) * 100;
      return `<div class="marker-tick" style="left:${pct}%" title="${e.title}"></div>`;
    }).join("");
  }

  // ── Loop ───────────────────────────────────────────────────
  let lastTs = performance.now();
  function frame(ts) {
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;
    if (state.playing) {
      state.tMin += dt * state.speed;
      if (state.tMin >= MISSION_MIN) {
        state.tMin = MISSION_MIN;
        setPlaying(false);
      }
    }
    render();
    requestAnimationFrame(frame);
  }

  // Boot
  window.addEventListener("resize", () => render());
  placeMarkers();
  resize();
  render();
  requestAnimationFrame(frame);

  // Auto-start after a beat so users see motion immediately
  setTimeout(() => setPlaying(true), 600);
})();
