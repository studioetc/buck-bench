/* Operation Black Buck 1 — mission data.
 *
 * This file is the single source of historical fact for the simulation. Where a figure
 * is firmly sourced it is cited inline; where open sources do not publish a slot-by-slot
 * number it is reconstructed to be internally consistent and clearly marked.
 *
 * IMPORTANT MODELLING NOTE ON FUEL
 * --------------------------------
 * The full pound-by-pound tanker schedule for Black Buck 1 is not in open sources, and a
 * faithful 5-bracket abstraction of a ~17-aircraft cascade cannot be perfectly
 * mass-conserved. So each aircraft's fuel curve is authored for VISUAL CLARITY and for
 * NARRATIVE ACCURACY at the moments that matter (the Vulcan kept near-full through the
 * cascade; Tuxford left critically short after the crisis; the Vulcan nursed home on
 * fumes to the return RV). It is an illustration of how the plan worked, not a fuel-burn
 * model accurate to the pound. Figures that ARE sourced:
 *   - Vulcan B.2 internal fuel ~9,200 imp gal ≈ 74,000 lb           [RAF / Vulcan to the Sky]
 *   - Victor K2 fuel capacity ~91,000 lb                            [Wikipedia: Handley Page Victor]
 *   - Vulcan cruise burn ~16,250 lb/hr (≈271 lb/min); burned ~9,200
 *     lb in the 34 min between its 1st and 2nd refuellings           [Wikipedia: Operation Black Buck]
 *   - 11 Victor K2 tankers + 2 Vulcan B.2 = 13 aircraft, main wave   [Rowland White, "Vulcan 607"]
 *   - Final three aircraft: XM607 (Withers), XL189 (Tuxford),
 *     XH669 (Biglands)                                               [Wikipedia; victorxm715.co.uk]
 *   - Distances / duration: see route block below.
 */

(function () {
  "use strict";

  // ---- global constants ----
  const S = 8.6;            // representative ground speed, nmi/min (~516 kt)
  const BURN_VULCAN = 258;  // lb/min cruise (~15,500 lb/hr; see note re: 271 lb/min figure)
  const BURN_VICTOR = 258;  // lb/min cruise
  const CAP_VULCAN = 74000; // lb  (sourced)
  const CAP_VICTOR = 91000; // lb  (sourced)
  const STANLEY = 3886;     // nmi from Ascension, routed one-way (see route note)
  const XFER = 5;           // minutes a transfer takes (visual ramp)

  // ---- refuelling bracket distances (nmi from Ascension) ----
  // Bracket 1 is sourced at ~900 nmi / +1h45m; the rest are spaced to give a coherent
  // cascade and to keep the Vulcan within range of the lone run to target + return RV.
  const B = { 1: 903, 2: 1204, 3: 1700, 4: 2400, 5: 3550 };
  const RV_RETURN = 2100;   // return rendezvous distance (forced by the Vulcan's range)

  // bracket times follow from distance / speed
  const T1 = Math.round(B[1] / S);   // 105
  const T2 = Math.round(B[2] / S);   // 140
  const T3 = Math.round(B[3] / S);   // 198
  const T4 = Math.round(B[4] / S);   // 279
  const T5 = Math.round(B[5] / S);   // 413
  const T_TARGET = 452;              // bomb release (~07:00Z 1 May; launch ~23:50Z 30 Apr)
  const T_EGRESS = 465;              // turn for home
  const T_RV = 667;                  // return rendezvous with Neal's Victor
  const T_LAND = 905;                // XM607 recovers at Wideawake (~15h05m; sources say ~15h45m–16h)

  // ====================================================================================
  //  builders
  // ====================================================================================
  // Simple out-and-back path: launch at base, cruise south to a turn-back distance, home.
  function pathOutBack(launchT, turnT, turnD) {
    return [
      { t: launchT, d: 0 },
      { t: turnT, d: turnD },
      { t: turnT + turnD / S, d: 0 },
    ];
  }

  // Fuel curve from a start value, a burn rate and timed events.
  // Each event is {t, refillTo} (set fuel to a value) or {t, delta} (add/subtract).
  function fuelFrom(start, burn, launchT, landT, events) {
    const keys = [{ t: launchT, f: start }];
    let f = start, pt = launchT;
    for (const ev of events) {
      f = Math.max(0, f - burn * (ev.t - pt));
      keys.push({ t: ev.t, f: Math.round(f) });
      f = ev.refillTo != null ? ev.refillTo : f + ev.delta;
      keys.push({ t: ev.t + XFER, f: Math.round(f) });
      pt = ev.t + XFER;
    }
    f = Math.max(0, f - burn * (landT - pt));
    keys.push({ t: landT, f: Math.round(f) });
    return keys;
  }

  // ====================================================================================
  //  aircraft
  // ====================================================================================
  // Each entry is either hand-authored (path + fuel arrays given directly, for the
  // aircraft whose fuel story matters) or builder-driven (launchT/turnT/turnD + fuelEvents).
  const defs = [

    // ---- the bomber ----
    {
      id: "XM607", cs: "XM607", kind: "vulcan",
      type: "Avro Vulcan B.2", crew: "Flt Lt Martin Withers",
      cap: CAP_VULCAN,
      // hand-authored: full sawtooth through the cascade, then the long thirsty run home
      path: [
        { t: 0, d: 0 }, { t: T_TARGET, d: STANLEY },
        { t: T_EGRESS, d: STANLEY }, { t: T_LAND, d: 0 },
      ],
      fuel: [
        { t: 0, f: 74000 },
        { t: T1, f: 46910 }, { t: T1 + XFER, f: 73500 },   // Bracket 1 top-up
        { t: T2, f: 65760 }, { t: T2 + XFER, f: 74000 },   // Bracket 2 (~9k lb in 34 min)
        { t: T3, f: 60300 }, { t: T3 + XFER, f: 74000 },   // Bracket 3
        { t: T4, f: 54000 }, { t: T4 + XFER, f: 74000 },   // Bracket 4
        { t: T5, f: 40700 }, { t: T5 + XFER, f: 67000 },   // Bracket 5 — 7,000 lb SHORT
        { t: T_RV, f: 3270 }, { t: T_RV + XFER, f: 65270 },// return RV — nursed home on fumes
        { t: T_LAND, f: 7000 },
      ],
    },
    // ---- primary Vulcan that aborted ----
    {
      id: "XM598", cs: "XM598", kind: "vulcan",
      type: "Avro Vulcan B.2", crew: "Sqn Ldr John Reeve",
      cap: CAP_VULCAN,
      // turned back ~300 nmi out: cabin could not be pressurised (DV window seal)
      launchT: 0, turnT: 35, turnD: 301, start: 74000, burn: BURN_VULCAN, fuelEvents: [],
      note: "aborted ~300 nmi out — cockpit pressurisation failure",
    },

    // ---- the long-slot pair (the final three) ----
    {
      id: "XL189", cs: "XL189", kind: "victor",
      type: "Handley Page Victor K2", crew: "Sqn Ldr Bob Tuxford",
      cap: CAP_VICTOR,
      // hand-authored: kept topped as a long-slot, becomes the LAST tanker at the crisis,
      // gives the Vulcan its fuel, is left unable to reach Ascension, gets a rescue tanker.
      path: pathOutBack(0, T5, B[5]),
      fuel: [
        { t: 0, f: 82000 },
        { t: T1, f: 54910 }, { t: T1 + XFER, f: 80000 },
        { t: T2, f: 72260 }, { t: T2 + XFER, f: 80000 },
        { t: T3, f: 66300 }, { t: T3 + XFER, f: 80000 },
        { t: T4, f: 60400 }, { t: T4 + XFER, f: 82000 },
        { t: T5, f: 48700 }, { t: T5 + XFER, f: 21200 },   // gives the Vulcan ~27,500 lb
        { t: 628, f: 1500 }, { t: 628 + XFER, f: 75000 },  // rescued — broke radio silence
        { t: T5 + B[5] / S, f: 8000 },                     // limps home to Wideawake
      ],
    },
    {
      id: "XH669", cs: "XH669", kind: "victor",
      type: "Handley Page Victor K2", crew: "Flt Lt Steve Biglands",
      cap: CAP_VICTOR,
      // reserve that stepped into XL163's slot; its receiver probe SHEARED in the storm,
      // forcing the role swap. Gave fuel back to Tuxford via its HDU, limped home.
      path: pathOutBack(0, T5, B[5]),
      fuel: [
        { t: 0, f: 82000 },
        { t: T1, f: 54910 }, { t: T1 + XFER, f: 80000 },
        { t: T2, f: 72260 }, { t: T2 + XFER, f: 80000 },
        { t: T3, f: 66300 }, { t: T3 + XFER, f: 80000 },
        { t: T4, f: 60400 }, { t: T4 + XFER, f: 80000 },
        { t: T5, f: 47000 }, { t: T5 + XFER, f: 38000 },   // probe shears; gives fuel back to Tux
        { t: T5 + B[5] / S, f: 6000 },                     // "just enough to make Wideawake"
      ],
    },
    // ---- the tanker that failed early ----
    {
      id: "XL163", cs: "XL163", kind: "victor",
      type: "Handley Page Victor K2", crew: "Flt Lt Frank Milligan",
      cap: CAP_VICTOR,
      launchT: 0, turnT: 50, turnD: 430, start: 82000, burn: BURN_VICTOR, fuelEvents: [],
      note: "HDU failure ~1 hr in — turned back; reserve XH669 took its slot",
    },

    // ---- Bracket 1 donors (top up the force, then home) ----
    { id: "K2-A", cs: "K2-A", kind: "victor", type: "Handley Page Victor K2", cap: CAP_VICTOR,
      launchT: 0, turnT: T1, turnD: B[1], start: 82000, burn: BURN_VICTOR,
      fuelEvents: [{ t: T1, delta: -22000 }] },
    { id: "K2-B", cs: "K2-B", kind: "victor", type: "Handley Page Victor K2", cap: CAP_VICTOR,
      launchT: 0, turnT: T1, turnD: B[1], start: 82000, burn: BURN_VICTOR,
      fuelEvents: [{ t: T1, delta: -20000 }] },
    { id: "K2-C", cs: "K2-C", kind: "victor", type: "Handley Page Victor K2", cap: CAP_VICTOR,
      launchT: 0, turnT: T1, turnD: B[1], start: 82000, burn: BURN_VICTOR,
      fuelEvents: [{ t: T1, delta: -18000 }] },

    // ---- Bracket 2 donors (topped at B1, donate at B2, home) ----
    { id: "K2-D", cs: "K2-D", kind: "victor", type: "Handley Page Victor K2", cap: CAP_VICTOR,
      launchT: 0, turnT: T2, turnD: B[2], start: 82000, burn: BURN_VICTOR,
      fuelEvents: [{ t: T1, refillTo: 78000 }, { t: T2, delta: -9000 }] },
    { id: "K2-E", cs: "K2-E", kind: "victor", type: "Handley Page Victor K2", cap: CAP_VICTOR,
      launchT: 0, turnT: T2, turnD: B[2], start: 82000, burn: BURN_VICTOR,
      fuelEvents: [{ t: T1, refillTo: 78000 }, { t: T2, delta: -7000 }] },

    // ---- Bracket 3 donors ----
    { id: "K2-F", cs: "K2-F", kind: "victor", type: "Handley Page Victor K2", cap: CAP_VICTOR,
      launchT: 0, turnT: T3, turnD: B[3], start: 82000, burn: BURN_VICTOR,
      fuelEvents: [{ t: T1, refillTo: 80000 }, { t: T2, refillTo: 80000 }, { t: T3, delta: -15000 }] },
    { id: "K2-G", cs: "K2-G", kind: "victor", type: "Handley Page Victor K2", cap: CAP_VICTOR,
      launchT: 0, turnT: T3, turnD: B[3], start: 82000, burn: BURN_VICTOR,
      fuelEvents: [{ t: T1, refillTo: 80000 }, { t: T2, refillTo: 80000 }, { t: T3, delta: -8000 }] },

    // ---- Bracket 4 donor (penultimate to turn back) ----
    { id: "K2-H", cs: "K2-H", kind: "victor", type: "Handley Page Victor K2", cap: CAP_VICTOR,
      launchT: 0, turnT: T4, turnD: B[4], start: 82000, burn: BURN_VICTOR,
      fuelEvents: [
        { t: T1, refillTo: 80000 }, { t: T2, refillTo: 80000 },
        { t: T3, refillTo: 80000 }, { t: T4, delta: -21000 },
      ] },

    // ---- recovery: Neal's Victor brings the Vulcan home (topped near the RV by 2 escorts) ----
    {
      id: "K2-N", cs: "K2-N", kind: "victor",
      type: "Handley Page Victor K2", crew: "Sqn Ldr Barry Neal (recovery)",
      cap: CAP_VICTOR,
      path: [{ t: 330, d: 0 }, { t: 574, d: RV_RETURN }, { t: T_RV, d: RV_RETURN }, { t: 911, d: 0 }],
      fuel: [
        { t: 330, f: 82000 },
        { t: 574, f: 19000 }, { t: 579, f: 91000 },        // escort top-up near the RV
        { t: T_RV, f: 68000 }, { t: T_RV + XFER, f: 6000 },// gives the Vulcan ~62,000 lb
        { t: 911, f: 5000 },
      ],
    },
    // ---- rescue: emergency tanker scrambled for Tuxford ----
    {
      id: "K2-R", cs: "K2-R", kind: "victor",
      type: "Handley Page Victor K2", crew: "emergency tanker (Wg Cdr Seymour)",
      cap: CAP_VICTOR,
      path: pathOutBack(430, 628, 1703),
      fuel: [
        { t: 430, f: 88000 },
        { t: 628, f: 36000 }, { t: 628 + XFER, f: 5000 },  // gives Tuxford his fuel home
        { t: 628 + 1703 / S, f: 4000 },
      ],
    },
  ];

  // ---- assemble final aircraft objects ----
  const aircraft = defs.map((d) => {
    const path = d.path || pathOutBack(d.launchT, d.turnT, d.turnD);
    const landT = path[path.length - 1].t;
    const fuel = d.fuel || fuelFrom(d.start, d.burn, d.launchT, landT, d.fuelEvents);
    return {
      id: d.id, cs: d.cs, kind: d.kind, type: d.type, crew: d.crew || "",
      fuelCapLb: d.cap, note: d.note || "", path, fuel,
    };
  });

  // ====================================================================================
  //  timed events — drive the phase banner, mission log and transfer links
  // ====================================================================================
  const events = [
    {
      t: 0, kind: "info",
      phaseLabel: "OUTBOUND — THE WAVE",
      phaseText: "13 aircraft airborne from Wideawake: 2 Vulcans + 11 Victor K2 tankers.",
      text: "<b>Launch.</b> 2 Vulcans (XM607 Withers, XM598 Reeve) and 11 Victor tankers lift off from Ascension at one-minute intervals, ~23:50Z.",
    },
    { t: 35, kind: "crisis", text: "<b>XM598 aborts.</b> Reeve's primary Vulcan can't pressurise (window seal) — turns back. XM607 becomes the bomber." },
    { t: 50, kind: "crisis", text: "<b>XL163 aborts.</b> Milligan's tanker suffers an HDU failure. Reserve XH669 (Biglands) steps into its slot." },

    {
      t: T1, dur: 6, kind: "bracket",
      phaseLabel: "CASCADE — BRACKET 1",
      phaseText: "~900 nmi out (+1h45m). Short-leg tankers top up the force, then turn for home.",
      transfers: [
        { from: "K2-A", to: "XM607", lb: 14000 },
        { from: "K2-B", to: "XM607", lb: 13000 },
        { from: "K2-C", to: "XL189", lb: 9000 },
      ],
      text: "<b>Bracket 1</b> (~900 nmi): the first wave tops up the Vulcan and the long-leg Victors. 3 tankers transfer and turn back — <b>8 of 11 Victors remain</b>.",
    },
    {
      t: T2, dur: 6, kind: "bracket",
      phaseLabel: "CASCADE — BRACKET 2",
      phaseText: "Fuel passed forward again; more tankers shed.",
      transfers: [{ from: "K2-D", to: "XM607", lb: 9000 }, { from: "K2-E", to: "XL189", lb: 6000 }],
      text: "<b>Bracket 2:</b> the Vulcan takes ~9,000 lb (it burned that in just 34 min). 2 more tankers peel off — <b>6 remain</b>.",
    },
    {
      t: T3, dur: 6, kind: "bracket",
      phaseLabel: "CASCADE — BRACKET 3",
      phaseText: "The chain narrows toward the long-slot pair.",
      transfers: [{ from: "K2-F", to: "XM607", lb: 15000 }, { from: "K2-G", to: "XH669", lb: 8000 }],
      text: "<b>Bracket 3:</b> 2 more tankers transfer and turn back — <b>4 remain</b>.",
    },
    {
      t: T4, dur: 6, kind: "bracket",
      phaseLabel: "CASCADE — BRACKET 4",
      phaseText: "Down to the final three: Vulcan + Tuxford + Biglands.",
      transfers: [{ from: "K2-H", to: "XM607", lb: 21000 }],
      text: "<b>Bracket 4:</b> the penultimate tanker tops the Vulcan and turns back. Only <b>XM607, XL189 (Tuxford) and XH669 (Biglands)</b> press on.",
    },
    {
      t: T5, dur: 12, kind: "crisis",
      phaseLabel: "FINAL BRACKET — CRISIS",
      phaseText: "In a violent storm, Biglands' probe shears. Tuxford becomes the last tanker.",
      transfers: [{ from: "XL189", to: "XM607", lb: 27500 }],
      text: "<b>Final RV — in the storm,</b> XH669's refuelling probe SHEARS as Biglands tries to take on fuel. Roles swap: Biglands gives his fuel back to Tuxford, who flies on as the last tanker.",
    },
    {
      t: T5 + 8, kind: "crisis",
      text: "<b>Tuxford tops the Vulcan</b> — but ~7,000 lb less than planned, and it leaves <b>his own Victor unable to reach Ascension.</b> He presses on so the raid can go in.",
    },

    {
      t: T5 + 14, kind: "info",
      phaseLabel: "LONE RUN TO TARGET",
      phaseText: "XM607 flies the last ~340 nmi to Port Stanley alone.",
      text: "<b>XM607 runs in alone</b> toward Port Stanley, descending for the attack.",
    },
    {
      t: T_TARGET, kind: "target",
      phaseLabel: "ATTACK",
      phaseText: "21 × 1,000 lb bombs across the runway at a shallow angle.",
      text: "<b>BOMBS GONE.</b> XM607 releases 21 × 1,000 lb bombs across Port Stanley airfield — one cratering the runway. Codeword <b>“Superfuse”</b> transmitted.",
    },
    {
      t: 628, dur: 6, kind: "crisis",
      transfers: [{ from: "K2-R", to: "XL189", lb: 71000 }],
      phaseLabel: "THE LONG WAY HOME",
      phaseText: "Tuxford, near-empty, breaks radio silence; a rescue tanker is scrambled.",
      text: "<b>Tuxford rescued.</b> Out of fuel to reach base (sourced: ~600 nmi from Ascension, ~30 min fuel), he broke radio silence after the “Superfuse” call. An emergency Victor refuels XL189.",
    },
    {
      t: T_RV, dur: 6, kind: "target",
      phaseLabel: "RETURN RENDEZVOUS",
      phaseText: "Neal's recovery Victor meets XM607 over the South Atlantic.",
      transfers: [{ from: "K2-N", to: "XM607", lb: 62000 }],
      text: "<b>Return RV.</b> Down to ~3,000 lb, XM607 meets Barry Neal's Victor (itself topped up by 2 escorts) and takes the fuel to make Ascension.",
    },
    {
      t: T_LAND, kind: "info",
      phaseLabel: "RECOVERY",
      phaseText: "XM607 lands at Wideawake — ~16 hours airborne.",
      text: "<b>XM607 recovers at Ascension</b> after ~15h45m — then the longest-range bombing raid in history. One runway crater; the message: nowhere was beyond reach.",
    },
  ];

  // ---- map dashed-line markers ----
  const brackets = [
    { label: "BRACKET 1", d: B[1] },
    { label: "BRACKET 2", d: B[2] },
    { label: "BRACKET 3", d: B[3] },
    { label: "BRACKET 4", d: B[4] },
    { label: "FINAL RV", d: B[5] },
    { label: "RETURN RV", d: RV_RETURN },
  ];

  const timelineTicks = [
    { t: 0, label: "LAUNCH" },
    { t: T1, label: "BRKT 1" },
    { t: T5, label: "CRISIS" },
    { t: T_TARGET, label: "ATTACK" },
    { t: T_RV, label: "RTN RV" },
    { t: T_LAND, label: "LAND" },
  ];

  window.MISSION = {
    title: "Operation Black Buck 1",
    date: "30 Apr – 1 May 1982",
    durationMin: 915,
    route: {
      ascensionToStanleyNmi: STANLEY,
      roundTripNmi: 6600,        // ~7,600 statute miles / ~12,200 km  [Wikipedia]
      durationDesc: "~15h45m – 16h",
      cruiseKts: 516,
    },
    aircraft,
    events,
    brackets,
    timelineTicks,
    sources: [
      '<a href="https://en.wikipedia.org/wiki/Operation_Black_Buck" target="_blank">Wikipedia: Operation Black Buck</a>',
      '<a href="https://en.wikipedia.org/wiki/Handley_Page_Victor" target="_blank">Handley Page Victor</a>',
      '“Vulcan 607”, Rowland White',
      '<a href="https://www.rafmuseum.org.uk/blog/air-to-air-refuelling-in-the-falklands-war/" target="_blank">RAF Museum</a>',
      '<a href="https://www.victorxm715.co.uk/bob-tuxford/" target="_blank">Bob Tuxford (Victor XM715)</a>',
    ],
  };
})();
