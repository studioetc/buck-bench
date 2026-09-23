# Operation Black Buck 1 — Refuelling Simulation

An interactive, browser-based simulation of the air-to-air refuelling **cascade** that
allowed a single RAF Avro Vulcan to bomb Port Stanley airfield in the Falklands on the
night of **30 April – 1 May 1982** — the longest-range bombing raid in history at the time.

The headline fact the simulation makes tangible: it took a *fleet* of Handley Page Victor
tankers refuelling **each other** and the bomber in a relay, peeling off one by one, to
push enough fuel south to get **one** Vulcan to the target and home again.

## Run it

No build step, no dependencies. Just open the page:

```bash
open index.html          # macOS
# or serve it:
python3 -m http.server 8000   # then visit http://localhost:8000
```

## What you're looking at

- **Route map** — Ascension Island (Wideawake) at the top, Port Stanley at the bottom.
  The outbound rail is on the left, the return rail on the right. Aircraft markers move
  along the rails: an amber delta is the Vulcan, blue chevrons are the Victor tankers.
- **Refuelling brackets** — dashed lines mark the planned rendezvous points (RVs) where
  fuel is transferred. An amber hose link with travelling dots appears during a transfer.
- **Fleet panel (right)** — live fuel state for every aircraft. Bars go amber then red as
  tanks run down; cards dim when an aircraft turns back, and fade out when it lands.
- **Mission log** — timestamped events: launches, transfers, turn-backs, the crisis on the
  final outbound bracket, the attack, and the recovery.
- **Controls** — Launch / pause / reset, a speed selector (60×–3600× real time), and a
  scrub bar to jump anywhere in the ~16-hour mission.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page shell and layout |
| `styles.css` | Mission-ops visual theme |
| `sim.js` | Simulation engine — interpolates each aircraft's position & fuel from keyframes and renders the map, fleet panel, and log. Contains no historical data. |
| `data.js` | The mission data: aircraft, refuelling brackets, fuel figures, and the timed event script. Every figure is sourced (see comments + the Sources section below). |

## Model & accuracy

The engine is a deterministic, scripted forward simulation. Each aircraft carries
piecewise-linear keyframes for distance-from-Ascension and fuel-state over mission time;
refuelling transfers appear as fuel handed from a donor to a receiver at a bracket.

The **structure** is historically faithful — the number of tankers, the cascade of
turn-backs, the count and rough placement of the brackets, the distances, and the crisis on
the final outbound transfer. Where primary sources don't give an exact per-bracket fuel
figure, the amounts are interpolated to be internally consistent (clearly flagged in
`data.js`). It is an illustration of *how the plan worked*, not a fuel-burn model accurate
to the pound.

<!-- SOURCES_SECTION -->
