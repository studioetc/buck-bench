// Operation Black Buck 1 Simulation - core engine

// Tactical map coordinates of the South Atlantic
const COORDS = {
    ascension: { lon: -14.40, lat: -7.97, name: "Ascension Island" },
    falklands: { lon: -57.78, lat: -51.68, name: "Port Stanley" },
    route: [
        { lon: -14.40, lat: -7.97 },   // Ascension
        { lon: -28.00, lat: -22.00 },  // Mid-Atlantic Bend (to evade coast)
        { lon: -38.00, lat: -32.00 },  // Offshore Brazil
        { lon: -57.78, lat: -51.68 }   // Falklands
    ],
    // Simplified coastlines for the glowing vector map background
    brazilCoast: [
        { lon: -35.20, lat: -5.79 },
        { lon: -34.88, lat: -8.05 },
        { lon: -38.50, lat: -12.97 },
        { lon: -40.00, lat: -20.00 },
        { lon: -43.20, lat: -22.90 },
        { lon: -48.00, lat: -26.00 },
        { lon: -51.20, lat: -30.03 },
        { lon: -58.38, lat: -34.60 },
        { lon: -62.00, lat: -40.00 },
        { lon: -65.00, lat: -45.00 },
        { lon: -68.00, lat: -50.00 },
        { lon: -68.30, lat: -54.80 }
    ],
    africaCoast: [
        { lon: -17.50, lat: 14.70 },
        { lon: -13.23, lat: 8.48 },
        { lon: -7.50, lat: 4.40 },
        { lon: 3.38, lat: 6.52 },
        { lon: 9.00, lat: 4.00 },
        { lon: 11.50, lat: -3.80 },
        { lon: 13.23, lat: -8.83 },
        { lon: 12.00, lat: -15.00 },
        { lon: 15.00, lat: -25.00 },
        { lon: 18.42, lat: -33.92 }
    ]
};

// Aircraft Definitions
const AIRCRAFT_DEFS = {
    // Vulcans
    xm598: { callsign: "VULCAN 1", model: "Avro Vulcan B.2", type: "vulcan", reg: "XM598", pilot: "Sq Ldr John Reeve", capacity: 74000, burnRate: 4.5, color: "var(--color-vulcan)" },
    xm607: { callsign: "VULCAN 2", model: "Avro Vulcan B.2", type: "vulcan", reg: "XM607", pilot: "Flt Lt Martin Withers", capacity: 74000, burnRate: 4.5, color: "var(--color-vulcan)" },
    
    // Wave 2 Outbound (Teal)
    v1: { callsign: "RED 2", model: "Victor K2", type: "victor", reg: "XL163", pilot: "Flt Lt Tony Banfield", capacity: 130000, burnRate: 5.0, color: "var(--color-victor-teal)" },
    v2: { callsign: "RED 3", model: "Victor K2", type: "victor", reg: "XH672", pilot: "Flt Lt Mike Beer", capacity: 130000, burnRate: 5.0, color: "var(--color-victor-teal)" },
    v3: { callsign: "RED 4", model: "Victor K2", type: "victor", reg: "XH673", pilot: "Flt Lt J.N. Barrett", capacity: 130000, burnRate: 5.0, color: "var(--color-victor-teal)" },
    v4: { callsign: "WHITE 2", model: "Victor K2", type: "victor", reg: "XL189", pilot: "Sq Ldr Bob Tuxford", capacity: 130000, burnRate: 5.0, color: "var(--color-victor-teal)" },
    v5: { callsign: "WHITE 3", model: "Victor K2", type: "victor", reg: "XM715", pilot: "Flt Lt John Keable", capacity: 130000, burnRate: 5.0, color: "var(--color-victor-teal)" },
    v6: { callsign: "WHITE 4", model: "Victor K2", type: "victor", reg: "XH669", pilot: "Flt Lt A. Montgomery", capacity: 130000, burnRate: 5.0, color: "var(--color-victor-teal)" },
    v7: { callsign: "WHITE 1", model: "Victor K2", type: "victor", reg: "XL230", pilot: "Flt Lt Steve Biglands", capacity: 130000, burnRate: 5.0, color: "var(--color-victor-teal)" },
    
    // Wave 1 Outbound (Red)
    v8: { callsign: "RED 1", model: "Victor K2", type: "victor", reg: "XL162", pilot: "Flt Lt D. Hamilton", capacity: 130000, burnRate: 5.0, color: "var(--color-victor-red)" },
    v9: { callsign: "RED 5", model: "Victor K2", type: "victor", reg: "XL160", pilot: "Flt Lt G. Graham", capacity: 130000, burnRate: 5.0, color: "var(--color-victor-red)" },
    
    // Wave 3 Recovery (Green)
    v10: { callsign: "BLUE 1", model: "Victor K2", type: "victor", reg: "XM718", pilot: "Flt Lt Colin Seymour", capacity: 130000, burnRate: 5.0, color: "var(--color-recovery)" },
    v11: { callsign: "BLUE 2", model: "Victor K2", type: "victor", reg: "XL512", pilot: "Flt Lt J. Barrett", capacity: 130000, burnRate: 5.0, color: "var(--color-recovery)" },
    v12: { callsign: "BLUE 3", model: "Victor K2", type: "victor", reg: "XM717", pilot: "Flt Lt Barry Neal", capacity: 130000, burnRate: 5.0, color: "var(--color-recovery)" }
};

// Simulation State variables
let simTime = 0; // Current time in seconds (0 to 57600)
let isPlaying = false;
let speedFactor = 600; // Speed multiplier (10 min/sec default)
let viewMode = 'geographic'; // 'geographic' or 'schematic'
let animFrameId = null;
let lastTime = 0;
let resolvedSvgElements = null;
let currentEventIndex = 0;

// Simulation aircraft array instanced from definitions
let aircraft = {};

// Reset and instantiate all aircraft states
function resetAircraft() {
    aircraft = {};
    for (const [id, def] of Object.entries(AIRCRAFT_DEFS)) {
        aircraft[id] = {
            ...def,
            id: id,
            fuel: def.capacity,
            status: 'grounded', // 'grounded', 'airborne', 'refuelling', 'returned', 'aborted'
            pos: { lon: COORDS.ascension.lon, lat: COORDS.ascension.lat },
            heading: 0,
            x: 0, y: 0, // Canvas coordinates
            transferringTo: null,
            transferredFuel: 0,
            pathPoints: [], // Outbound track
            isRefuellingReceiver: false
        };
    }
}

// 14 Refuelling brackets / events timeline
const SIM_EVENTS = [
    {
        time: 0,
        title: "Mission Launch",
        phase: "Outbound",
        critical: false,
        desc: "23:00Z: 11 Victor K2 tankers and 2 Vulcan bombers lift off from Ascension. Radio silence is active. Force is divided into Red, White, and Blue cells.",
        action: (s) => {
            for (const ac of Object.values(aircraft)) {
                ac.status = 'airborne';
            }
        }
    },
    {
        time: 1200,
        title: "Vulcan 1 Cabin Seal Failure",
        phase: "Outbound",
        critical: true,
        desc: "23:20Z: Vulcan 1 (XM598) captain John Reeve suffers a perished window seal. Cabin cannot pressurize. He is forced to abort and return to base. Vulcan 2 (XM607) takes lead.",
        action: (s) => {
            aircraft.xm598.status = 'aborted';
        }
    },
    {
        time: 2400,
        title: "Victor RED 1 Hose Failure",
        phase: "Outbound",
        critical: true,
        desc: "23:40Z: RED 1 (XL162) hose system malfunctions, returning to Ascension. Reserve White 4 Montgomery (XH669) takes over its position in the chain.",
        action: (s) => {
            aircraft.v8.status = 'aborted';
        }
    },
    {
        time: 7200,
        title: "Outbound Refuelling Bracket 1",
        phase: "Outbound",
        critical: false,
        desc: "01:00Z: 800 miles south. Red and White tankers mutual top-up. RED 2 (Banfield) refuels RED 3 (Beer). WHITE 3 (Keable) refuels WHITE 4 (Montgomery). BLUE 1 (Seymour) refuels VULCAN 2.",
        action: (s) => {
            // Setup pairings
            aircraft.v1.transferringTo = 'v2';
            aircraft.v5.transferringTo = 'v6';
            aircraft.v10.transferringTo = 'xm607';
        }
    },
    {
        time: 9000,
        title: "Bracket 1 Return",
        phase: "Outbound",
        critical: false,
        desc: "01:30Z: Red and White fuel transfer complete. RED 2 (XL163), WHITE 3 (XM715), and BLUE 1 (XM718) turn back to base.",
        action: (s) => {
            aircraft.v1.transferringTo = null;
            aircraft.v1.status = 'returned';
            aircraft.v5.transferringTo = null;
            aircraft.v5.status = 'returned';
            aircraft.v10.transferringTo = null;
            aircraft.v10.status = 'returned';
        }
    },
    {
        time: 14400,
        title: "Outbound Refuelling Bracket 2",
        phase: "Outbound",
        critical: false,
        desc: "03:00Z: Second refuelling bracket. RED 3 (Beer) refuels RED 4 (Barrett). WHITE 2 (Tuxford) refuels WHITE 4 (Montgomery). BLUE 2 (Graham) refuels VULCAN 2.",
        action: (s) => {
            aircraft.v2.transferringTo = 'v3';
            aircraft.v4.transferringTo = 'v6';
            aircraft.v11.transferringTo = 'xm607';
        }
    },
    {
        time: 16200,
        title: "Bracket 2 Return",
        phase: "Outbound",
        critical: false,
        desc: "03:30Z: Fuel transfers completed. RED 3 (XH672), WHITE 2 (XL189) and BLUE 2 (XL512) turn back. (Note: Tuxford's tanker will stay slightly south to support the final bracket).",
        action: (s) => {
            aircraft.v2.transferringTo = null;
            aircraft.v2.status = 'returned';
            aircraft.v4.transferringTo = null;
            aircraft.v4.status = 'returned';
            aircraft.v11.transferringTo = null;
            aircraft.v11.status = 'returned';
        }
    },
    {
        time: 21600,
        title: "Outbound Refuelling Bracket 3",
        phase: "Outbound",
        critical: false,
        desc: "05:00Z: RED 4 (Barrett) transfers its remaining fuel to WHITE 4 (Montgomery) and turns back. BLUE 3 (Barry Neal) refuels VULCAN 2.",
        action: (s) => {
            aircraft.v3.transferringTo = 'v6';
            aircraft.v12.transferringTo = 'xm607';
        }
    },
    {
        time: 23400,
        title: "Bracket 3 Return",
        phase: "Outbound",
        critical: false,
        desc: "05:30Z: RED 4 (XH673) and BLUE 3 (XM717) complete their transfers and turn back to Ascension.",
        action: (s) => {
            aircraft.v3.transferringTo = null;
            aircraft.v3.status = 'returned';
            aircraft.v12.transferringTo = null;
            aircraft.v12.status = 'returned';
        }
    },
    {
        time: 25200,
        title: "Bracket 4: Storm & Broken Probe Crisis",
        phase: "Outbound",
        critical: true,
        desc: "06:00Z: Formation enters a severe thunderstorm. WHITE 4 (Steve Biglands) has a damaged probe. Bob Tuxford (WHITE 2) takes his place. Tuxford transfers his own fuel reserves to Withers.",
        action: (s) => {
            // Tuxford (v4) takes over the role to refuel Vulcan (xm607)
            aircraft.v4.status = 'airborne'; // reactive Tuxford
            aircraft.v4.transferringTo = 'xm607';
            aircraft.v6.status = 'returned'; // Biglands retreats
        }
    },
    {
        time: 26500,
        title: "Final Outbound Return",
        phase: "Outbound",
        critical: true,
        desc: "06:20Z: Tuxford (XL189) completes the transfer. He turns back, critically low on fuel. Vulcan XM607 flies the last 400 miles to the Falklands alone.",
        action: (s) => {
            aircraft.v4.transferringTo = null;
            aircraft.v4.status = 'returned';
        }
    },
    {
        time: 28800,
        title: "Stanley Airfield Bomb Run",
        phase: "Attack",
        critical: false,
        desc: "07:00Z: Vulcan XM607 reaches Falklands. Pop-up to 10,000 ft, evades Skyguard, drops 21 bombs across the runway. Martin Withers banks hard and transmits 'SUPERFUSE'.",
        action: (s) => {
            // Vulcan turns back north
        }
    },
    {
        time: 36000,
        title: "Tuxford Rescue Refuelling",
        phase: "Inbound",
        critical: true,
        desc: "09:00Z: Tuxford (WHITE 2) breaks radio silence to request emergency fuel. Colin Seymour (BLUE 1) launches from Ascension, meets him 600 NM out, and saves him.",
        action: (s) => {
            // Seymour (v10) refuels Tuxford (v4)
            aircraft.v10.status = 'airborne';
            aircraft.v4.status = 'airborne';
            aircraft.v10.transferringTo = 'v4';
        }
    },
    {
        time: 38000,
        title: "Tuxford Rescue Recovery",
        phase: "Inbound",
        critical: false,
        desc: "09:30Z: Tuxford completes refuelling. He and Seymour proceed to Ascension for safe landing.",
        action: (s) => {
            aircraft.v10.transferringTo = null;
            aircraft.v10.status = 'returned';
            aircraft.v4.status = 'returned';
        }
    },
    {
        time: 43200,
        title: "Vulcan Inbound Refuelling",
        phase: "Inbound",
        critical: false,
        desc: "11:00Z: Vulcan XM607 meets Barry Neal (BLUE 3) and a Nimrod off the Brazilian coast. Refuels successfully with enough fuel to reach Ascension.",
        action: (s) => {
            aircraft.v12.status = 'airborne';
            aircraft.v12.transferringTo = 'xm607';
        }
    },
    {
        time: 45000,
        title: "Vulcan Final Leg",
        phase: "Inbound",
        critical: false,
        desc: "11:30Z: Refuelling completed. Neal turns back. Vulcan XM607 begins final approach to Ascension Island.",
        action: (s) => {
            aircraft.v12.transferringTo = null;
            aircraft.v12.status = 'returned';
        }
    },
    {
        time: 57600,
        title: "Mission Completed",
        phase: "Landed",
        critical: false,
        desc: "15:00Z: Vulcan XM607 lands safely at Wideawake Airfield, Ascension Island. Round trip of 15 hours 45 minutes completed successfully.",
        action: (s) => {
            for (const ac of Object.values(aircraft)) {
                ac.status = 'returned';
            }
        }
    }
];

// Canvas Setup
const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");

// Responsive resize
function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Projection helpers
function projectGeo(lon, lat) {
    const minLon = -70;
    const maxLon = 25;
    const minLat = -60;
    const maxLat = 10;
    
    const x = ((lon - minLon) / (maxLon - minLon)) * canvas.width;
    const y = ((maxLat - lat) / (maxLat - minLat)) * canvas.height;
    return { x, y };
}

// Convert absolute SVG coordinate to canvas
function projectSchematic(svgX, svgY) {
    // SVG viewBox: width=440, height=530
    const pad = 40;
    const scaleX = (canvas.width - pad * 2) / 440;
    const scaleY = (canvas.height - pad * 2) / 530;
    const scale = Math.min(scaleX, scaleY);
    
    const offsetX = (canvas.width - 440 * scale) / 2;
    const offsetY = (canvas.height - 530 * scale) / 2;
    
    return {
        x: svgX * scale + offsetX,
        y: svgY * scale + offsetY
    };
}

// Fetch resolved SVG elements
async function loadSvgElements() {
    try {
        const response = await fetch('resolved_elements.json');
        if (response.ok) {
            resolvedSvgElements = await response.json();
            console.log("Successfully loaded resolved SVG elements!");
        } else {
            console.warn("Could not fetch resolved_elements.json. Falling back to programmatic drawing.");
        }
    } catch (e) {
        console.warn("Error loading elements.json, using fallback schematic.");
    }
}

// Programmatic fallback for schematic drawing
function drawFallbackSchematic() {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.font = "10px Orbitron";
    ctx.fillStyle = "var(--text-dark)";
    
    // Outbound paths
    const wave1X = [167, 190, 210, 230, 250];
    const wave2X = [30, 50, 70, 90, 110, 130];
    
    // Draw grid lines
    ctx.beginPath();
    for (let x of wave2X) {
        const pt1 = projectSchematic(x, 461);
        const pt2 = projectSchematic(x, 100);
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
    }
    for (let x of wave1X) {
        const pt1 = projectSchematic(x, 461);
        const pt2 = projectSchematic(x, 70);
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
    }
    ctx.stroke();
    
    // Draw labels
    const ascensionPt = projectSchematic(100, 480);
    ctx.fillText("Ascension Island (takeoff)", ascensionPt.x, ascensionPt.y);
    
    const falklandsPt = projectSchematic(100, 50);
    ctx.fillText("Port Stanley (target)", falklandsPt.x, falklandsPt.y);
}

// Find event index by time
function getEventIndexForTime(t) {
    for (let i = 0; i < SIM_EVENTS.length; i++) {
        if (SIM_EVENTS[i].time > t) {
            return i - 1 >= 0 ? i - 1 : 0;
        }
    }
    return SIM_EVENTS.length - 1;
}

// Update simulation state based on current time
function updateSimulationState() {
    // Set status based on elapsed time
    const evIdx = getEventIndexForTime(simTime);
    if (evIdx !== currentEventIndex) {
        currentEventIndex = evIdx;
        // Trigger all events up to the current one in order to apply their actions
        resetAircraft();
        for (let i = 0; i <= currentEventIndex; i++) {
            SIM_EVENTS[i].action(this);
        }
        updateEventLog();
    }
    
    // Update individual aircraft positions and fuel
    const progress = simTime / 57600; // 0 to 1
    
    // Vulcan positions
    if (simTime <= 28800) {
        // Outbound leg (first half of simulation)
        const outboundProg = simTime / 28800;
        const currentCoord = getRoutePosition(outboundProg);
        aircraft.xm607.pos = currentCoord;
        if (aircraft.xm598.status === 'airborne') {
            aircraft.xm598.pos = currentCoord;
        }
    } else {
        // Inbound leg
        const inboundProg = (simTime - 28800) / 28800;
        const currentCoord = getRoutePosition(1 - inboundProg); // goes backwards
        aircraft.xm607.pos = currentCoord;
    }
    
    // Aborted aircraft return immediately to Ascension
    if (aircraft.xm598.status === 'aborted') {
        const tProg = Math.max(0, 1 - (simTime - 1200) / 2400); // returns in 40 mins
        aircraft.xm598.pos = getRoutePosition(tProg * 0.15); // moves back to Ascension
    }
    
    // Tanker positions
    // Wave 2 (Teal) outbound tankers turn back at different times
    updateTankerPosition('v1', 7200, 9000);
    updateTankerPosition('v2', 14400, 16200);
    updateTankerPosition('v3', 21600, 23400);
    updateTankerPosition('v4', 25200, 26500); // Tuxford
    updateTankerPosition('v5', 7200, 9000);
    updateTankerPosition('v6', 25200, 26500);
    updateTankerPosition('v7', 7200, 9000);
    
    // Wave 1 (Red)
    updateTankerPosition('v8', 2400, 3600); // returns early
    updateTankerPosition('v9', 7200, 9000);
    
    // Wave 3 (Recovery) - launch later
    if (simTime >= 34000 && simTime <= 38000) {
        // Seymour rescue
        const prog = (simTime - 34000) / 4000;
        aircraft.v10.pos = getRoutePosition(prog * 0.4); // goes out to 40% and returns
    }
    if (simTime >= 40000 && simTime <= 46000) {
        // Barry Neal meeting Vulcan
        const prog = (simTime - 40000) / 6000;
        aircraft.v12.pos = getRoutePosition(prog * 0.65);
    }
    
    // Fuel Consumption & Transfers
    for (const ac of Object.values(aircraft)) {
        if (ac.status === 'airborne' || ac.status === 'refuelling') {
            // Standard fuel burn
            ac.fuel = Math.max(0, ac.fuel - ac.burnRate * (speedFactor * 0.0166)); // approx. burn per frame update
            
            // Handle fuel transfers
            if (ac.transferringTo) {
                const receiver = aircraft[ac.transferringTo];
                if (receiver && receiver.status === 'airborne') {
                    ac.status = 'refuelling';
                    receiver.status = 'refuelling';
                    
                    const transferRate = 250; // lbs per tick
                    const amount = Math.min(ac.fuel, transferRate);
                    ac.fuel -= amount;
                    receiver.fuel = Math.min(receiver.capacity, receiver.fuel + amount);
                }
            }
        }
    }
    
    updateHUD();
    updateDashboard();
}

function updateTankerPosition(id, refuelTime, returnTime) {
    const ac = aircraft[id];
    if (ac.status === 'aborted') return;
    
    if (simTime <= refuelTime) {
        // Heading out in formation
        ac.pos = getRoutePosition(simTime / 28800);
    } else if (simTime <= returnTime) {
        // Flying in formation during transfer
        ac.pos = getRoutePosition(simTime / 28800);
    } else {
        // Returning to base
        const returnProgress = (simTime - returnTime) / (returnTime - 0); // simplifed back flight duration
        const currentCoord = getRoutePosition(Math.max(0, (returnTime / 28800) * (1 - returnProgress)));
        ac.pos = currentCoord;
        if (currentCoord.lon === COORDS.ascension.lon && currentCoord.lat === COORDS.ascension.lat) {
            ac.status = 'returned';
        }
    }
}

// Get position along route based on progress factor (0 to 1)
function getRoutePosition(progress) {
    if (progress <= 0) return { ...COORDS.route[0] };
    if (progress >= 1) return { ...COORDS.route[COORDS.route.length - 1] };
    
    const segmentCount = COORDS.route.length - 1;
    const segment = Math.floor(progress * segmentCount);
    const segmentProgress = (progress * segmentCount) - segment;
    
    const start = COORDS.route[segment];
    const end = COORDS.route[segment + 1];
    
    return {
        lon: start.lon + (end.lon - start.lon) * segmentProgress,
        lat: start.lat + (end.lat - start.lat) * segmentProgress
    };
}

// Set active view mode
function setViewMode(mode) {
    viewMode = mode;
    document.getElementById("viewGeographic").classList.toggle('active', mode === 'geographic');
    document.getElementById("viewSchematic").classList.toggle('active', mode === 'schematic');
}

// Update DOM elements for dashboard
function updateDashboard() {
    const container = document.getElementById("aircraftList");
    container.innerHTML = "";
    
    for (const ac of Object.values(aircraft)) {
        const card = document.createElement("div");
        card.className = `aircraft-card ${ac.type} ${ac.status}`;
        if (ac.status === 'airborne' || ac.status === 'refuelling') {
            card.classList.add('active');
        }
        
        // Add color tags based on Wave
        if (ac.color.includes("teal")) card.classList.add('victor-teal');
        if (ac.color.includes("red")) card.classList.add('victor-red');
        if (ac.color.includes("recovery")) card.classList.add('victor-recovery');
        
        const fuelPct = (ac.fuel / ac.capacity) * 100;
        const lowFuelClass = fuelPct < 20 ? 'fuel-low' : '';
        
        card.innerHTML = `
            <div class="aircraft-header">
                <div class="aircraft-identity">
                    <span class="aircraft-callsign">${ac.callsign} <span style="font-size:0.75rem; font-weight:400; color:var(--text-secondary)">(${ac.reg})</span></span>
                    <span class="aircraft-model">${ac.model} - ${ac.pilot}</span>
                </div>
                <span class="aircraft-status-badge status-${ac.status}">${ac.status}</span>
            </div>
            <div class="fuel-gauge-container ${lowFuelClass}">
                <div class="fuel-label-row">
                    <span>FUEL LOAD</span>
                    <span class="fuel-amount">${Math.round(ac.fuel).toLocaleString()} LBS (${Math.round(fuelPct)}%)</span>
                </div>
                <div class="fuel-bar-outer">
                    <div class="fuel-bar-inner" style="width: ${fuelPct}%"></div>
                </div>
            </div>
        `;
        container.appendChild(card);
    }
}

// Update the event logs
function updateEventLog() {
    const container = document.getElementById("logsContainer");
    container.innerHTML = "";
    
    SIM_EVENTS.forEach((ev, idx) => {
        const entry = document.createElement("div");
        entry.className = "log-entry";
        if (idx === currentEventIndex) entry.classList.add('active');
        if (ev.critical) entry.classList.add('critical');
        
        const timeVal = Math.floor(ev.time / 3600);
        const minsVal = Math.floor((ev.time % 3600) / 60);
        const logTimeStr = `+${timeVal.toString().padStart(2, '0')}:${minsVal.toString().padStart(2, '0')}`;
        
        entry.innerHTML = `
            <div class="log-time">
                <span>${ev.title}</span>
                <span>${logTimeStr}</span>
            </div>
            <div class="log-text">${ev.desc}</div>
        `;
        
        // Add click listener to jump to this event
        entry.addEventListener('click', () => {
            simTime = ev.time;
            document.getElementById("timelineSlider").value = (simTime / 57600) * 100;
            updateSimulationState();
        });
        
        container.appendChild(entry);
        
        // Auto scroll to active log
        if (idx === currentEventIndex) {
            entry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
}

// Update overlay stats
function updateHUD() {
    // Current time
    const hrs = Math.floor(simTime / 3600);
    const mins = Math.floor((simTime % 3600) / 60);
    const secs = simTime % 60;
    
    // Set time text
    document.getElementById("valTime").innerText = 
        `${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
        
    // Calculate distance
    const totalDist = 6600; // NM round trip
    const progress = simTime / 57600;
    const currentDist = Math.round(progress * totalDist);
    document.getElementById("valDistance").innerText = `${currentDist.toLocaleString()} NM`;
    
    // Phase
    let phase = "Outbound";
    if (simTime >= 28800 && simTime <= 30000) phase = "STANLEY ATTACK";
    else if (simTime > 30000) phase = "Inbound";
    if (simTime >= 57600) phase = "Mission Completed";
    
    const phaseEl = document.getElementById("valPhase");
    phaseEl.innerText = phase;
    phaseEl.style.color = phase.includes("ATTACK") ? "var(--color-victor-red)" : "var(--text-primary)";
    
    // Count active transfers
    let transfers = 0;
    for (const ac of Object.values(aircraft)) {
        if (ac.transferringTo) transfers++;
    }
    document.getElementById("valTransfers").innerText = transfers;
}

// Draw Loop
let radarRotation = 0;
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (viewMode === 'geographic') {
        drawGeographicView();
    } else {
        drawSchematicView();
    }
    
    // Draw radar sweep line overlay in geographic mode
    if (viewMode === 'geographic') {
        radarRotation += 0.005;
        drawRadarSweep();
    }
}

// Render tactical Geographic map
function drawGeographicView() {
    // Draw background grid lines
    ctx.strokeStyle = "rgba(0, 242, 254, 0.03)";
    ctx.lineWidth = 1;
    
    // Grid lines
    for (let x = 0; x < canvas.width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Draw vector coastlines
    ctx.strokeStyle = "rgba(0, 242, 254, 0.15)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    let first = true;
    for (const pt of COORDS.brazilCoast) {
        const canvasPt = projectGeo(pt.lon, pt.lat);
        if (first) {
            ctx.moveTo(canvasPt.x, canvasPt.y);
            first = false;
        } else {
            ctx.lineTo(canvasPt.x, canvasPt.y);
        }
    }
    ctx.stroke();
    
    ctx.strokeStyle = "rgba(76, 217, 100, 0.1)";
    ctx.beginPath();
    first = true;
    for (const pt of COORDS.africaCoast) {
        const canvasPt = projectGeo(pt.lon, pt.lat);
        if (first) {
            ctx.moveTo(canvasPt.x, canvasPt.y);
            first = false;
        } else {
            ctx.lineTo(canvasPt.x, canvasPt.y);
        }
    }
    ctx.stroke();
    
    // Draw Ascension and Falklands
    const ascPt = projectGeo(COORDS.ascension.lon, COORDS.ascension.lat);
    const falkPt = projectGeo(COORDS.falklands.lon, COORDS.falklands.lat);
    
    // Ascension Marker
    ctx.fillStyle = "var(--color-victor-teal)";
    ctx.beginPath();
    ctx.arc(ascPt.x, ascPt.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "bold 10px Orbitron";
    ctx.fillText("ASCENSION (WIDEWAKE)", ascPt.x + 10, ascPt.y + 4);
    
    // Falklands Marker
    ctx.fillStyle = "var(--color-vulcan)";
    ctx.beginPath();
    ctx.arc(falkPt.x, falkPt.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText("PORT STANLEY AIRPORT", falkPt.x - 140, falkPt.y + 4);
    
    // Draw base flight path track
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    COORDS.route.forEach((pt, idx) => {
        const canvasPt = projectGeo(pt.lon, pt.lat);
        if (idx === 0) ctx.moveTo(canvasPt.x, canvasPt.y);
        else ctx.lineTo(canvasPt.x, canvasPt.y);
    });
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash
    
    // Draw aircraft on geographic map
    for (const ac of Object.values(aircraft)) {
        if (ac.status === 'airborne' || ac.status === 'refuelling') {
            const canvasPt = projectGeo(ac.pos.lon, ac.pos.lat);
            
            // Draw plane symbol
            ctx.fillStyle = ac.color;
            ctx.shadowColor = ac.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            
            if (ac.type === 'vulcan') {
                // Draw a delta wing triangle
                ctx.moveTo(canvasPt.x, canvasPt.y - 8);
                ctx.lineTo(canvasPt.x + 7, canvasPt.y + 6);
                ctx.lineTo(canvasPt.x, canvasPt.y + 3);
                ctx.lineTo(canvasPt.x - 7, canvasPt.y + 6);
            } else {
                // Draw a swept-wing crescent Victor
                ctx.moveTo(canvasPt.x, canvasPt.y - 6);
                ctx.lineTo(canvasPt.x + 8, canvasPt.y + 2);
                ctx.lineTo(canvasPt.x + 2, canvasPt.y + 2);
                ctx.lineTo(canvasPt.x, canvasPt.y + 5);
                ctx.lineTo(canvasPt.x - 2, canvasPt.y + 2);
                ctx.lineTo(canvasPt.x - 8, canvasPt.y + 2);
            }
            
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0; // reset shadow
            
            // Labels
            ctx.fillStyle = "rgba(255,255,255,0.7)";
            ctx.font = "8px Orbitron";
            ctx.fillText(ac.callsign, canvasPt.x + 10, canvasPt.y - 2);
            
            // Draw transfer hose connection
            if (ac.transferringTo) {
                const rcv = aircraft[ac.transferringTo];
                if (rcv) {
                    const rcvPt = projectGeo(rcv.pos.lon, rcv.pos.lat);
                    ctx.strokeStyle = "var(--accent)";
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(canvasPt.x, canvasPt.y);
                    ctx.lineTo(rcvPt.x, rcvPt.y);
                    ctx.stroke();
                }
            }
        }
    }
}

// Render schematic refuelling diagram
function drawSchematicView() {
    if (!resolvedSvgElements) {
        drawFallbackSchematic();
        return;
    }
    
    // Draw background tracks from SVG paths
    resolvedSvgElements.forEach(elem => {
        if (elem.type === 'path') {
            ctx.beginPath();
            let first = true;
            
            // Determine schematic colors
            ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
            ctx.lineWidth = 1;
            
            if (elem.color === '#ff00ff') {
                ctx.strokeStyle = "rgba(255, 0, 255, 0.25)";
                ctx.lineWidth = 2;
            } else if (elem.color === '#000080') {
                ctx.strokeStyle = "rgba(0, 242, 254, 0.15)";
            } else if (elem.color === '#ff0000') {
                ctx.strokeStyle = "rgba(255, 59, 48, 0.15)";
            } else if (elem.color === '#00ff00') {
                ctx.strokeStyle = "rgba(76, 217, 100, 0.15)";
            }
            
            elem.points.forEach(pt => {
                const canvasPt = projectSchematic(pt[0], pt[1]);
                if (first) {
                    ctx.moveTo(canvasPt.x, canvasPt.y);
                    first = false;
                } else {
                    ctx.lineTo(canvasPt.x, canvasPt.y);
                }
            });
            ctx.stroke();
        } else if (elem.type === 'circle') {
            const canvasPt = projectSchematic(elem.center[0], elem.center[1]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(canvasPt.x, canvasPt.y, elem.radius * 0.8, 0, Math.PI * 2);
            ctx.stroke();
        } else if (elem.type === 'text') {
            const canvasPt = projectSchematic(elem.position[0], elem.position[1]);
            ctx.fillStyle = "var(--text-dark)";
            ctx.font = "8px Orbitron";
            if (elem.text !== 'R') {
                ctx.fillStyle = "rgba(255,255,255,0.4)";
                ctx.fillText(elem.text, canvasPt.x, canvasPt.y);
            }
        }
    });
    
    // Draw animated aircraft along schematic paths
    // We map aircraft status and Y coordinate based on simulation time
    const wave2Slots = { v7:30, v1:50, v2:70, v5:90, v3:110, v6:130 }; // X values in SVG viewBox space
    const wave1Slots = { v8:167, v9:190, v4:210, v11:230, v10:250 };
    const wave3Slots = { v12:286, v11:306, v10:346 };
    
    const progress = simTime / 57600; // 0 to 1
    
    // Draw Vulcan XM607
    if (aircraft.xm607.status === 'airborne' || aircraft.xm607.status === 'refuelling') {
        let schY = 461;
        let schX = 266;
        if (simTime <= 28800) {
            // Outbound leg: goes up along x=266 from y=461 to y=31
            const outboundProg = simTime / 28800;
            schY = 461 - (461 - 31) * outboundProg;
        } else {
            // Inbound leg: goes down along x=148 from y=31 to y=461
            const inboundProg = (simTime - 28800) / 28800;
            schX = 148;
            schY = 31 + (461 - 31) * inboundProg;
        }
        
        drawSchematicAircraft("XM607", schX, schY, "var(--color-vulcan)", true);
    }
    
    // Draw Vulcan XM598 (aborted)
    if (aircraft.xm598.status === 'airborne' || aircraft.xm598.status === 'aborted') {
        let schY = 461;
        if (simTime <= 1200) {
            schY = 461 - (461 - 421) * (simTime / 1200);
        } else if (simTime <= 2400) {
            schY = 421 + (461 - 421) * ((simTime - 1200) / 1200);
        } else {
            schY = 461;
        }
        drawSchematicAircraft("XM598", 30, schY, "var(--color-vulcan)", true);
    }
    
    // Draw Outbound Tankers
    // Wave 2
    for (const [id, x] of Object.entries(wave2Slots)) {
        const ac = aircraft[id];
        if (ac.status === 'airborne' || ac.status === 'refuelling' || ac.status === 'returned') {
            const schY = getTankerSchematicY(id);
            drawSchematicAircraft(ac.callsign, x, schY, ac.color, false);
            
            // Draw refuelling lines in schematic
            if (ac.transferringTo) {
                const rcv = aircraft[ac.transferringTo];
                let rcvX = 266;
                let rcvY = schY;
                if (ac.transferringTo.includes('v')) {
                    // Tanker to tanker
                    rcvX = wave2Slots[ac.transferringTo] || wave1Slots[ac.transferringTo] || 266;
                    rcvY = getTankerSchematicY(ac.transferringTo);
                }
                const pt1 = projectSchematic(x, schY);
                const pt2 = projectSchematic(rcvX, rcvY);
                ctx.strokeStyle = "var(--accent)";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(pt1.x, pt1.y);
                ctx.lineTo(pt2.x, pt2.y);
                ctx.stroke();
            }
        }
    }
    
    // Wave 1
    for (const [id, x] of Object.entries(wave1Slots)) {
        const ac = aircraft[id];
        if (ac.status === 'airborne' || ac.status === 'refuelling' || ac.status === 'returned') {
            const schY = getTankerSchematicY(id);
            drawSchematicAircraft(ac.callsign, x, schY, ac.color, false);
            
            if (ac.transferringTo) {
                const rcv = aircraft[ac.transferringTo];
                let rcvX = 266;
                let rcvY = schY;
                if (ac.transferringTo.includes('v')) {
                    rcvX = wave2Slots[ac.transferringTo] || wave1Slots[ac.transferringTo] || 266;
                    rcvY = getTankerSchematicY(ac.transferringTo);
                }
                const pt1 = projectSchematic(x, schY);
                const pt2 = projectSchematic(rcvX, rcvY);
                ctx.strokeStyle = "var(--accent)";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(pt1.x, pt1.y);
                ctx.lineTo(pt2.x, pt2.y);
                ctx.stroke();
            }
        }
    }
    
    // Wave 3 (Inbound Recovery)
    for (const [id, x] of Object.entries(wave3Slots)) {
        const ac = aircraft[id];
        if (ac.status === 'airborne' || ac.status === 'refuelling' || ac.status === 'returned') {
            const schY = getTankerSchematicY(id);
            drawSchematicAircraft(ac.callsign, x, schY, ac.color, false);
            
            if (ac.transferringTo) {
                const rcv = aircraft[ac.transferringTo];
                let rcvX = 148; // Inbound Vulcan is at x=148
                let rcvY = schY;
                if (ac.transferringTo === 'v4') {
                    // Seymour refuelling Tuxford
                    rcvX = wave1Slots.v4 || 210;
                    rcvY = getTankerSchematicY('v4');
                }
                const pt1 = projectSchematic(x, schY);
                const pt2 = projectSchematic(rcvX, rcvY);
                ctx.strokeStyle = "var(--accent)";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(pt1.x, pt1.y);
                ctx.lineTo(pt2.x, pt2.y);
                ctx.stroke();
            }
        }
    }
}

// Calculate Y coordinate on the schematic map based on simulation time
function getTankerSchematicY(id) {
    // Red / White / Blue outbound tankers
    const timing = {
        v1: { start: 0, refuel: 7200, end: 9000, maxY: 241 },
        v2: { start: 0, refuel: 14400, end: 16200, maxY: 191 },
        v3: { start: 0, refuel: 21600, end: 23400, maxY: 101 },
        v4: { start: 0, refuel: 25200, end: 26500, maxY: 71 }, // Tuxford
        v5: { start: 0, refuel: 7200, end: 9000, maxY: 421 },
        v6: { start: 0, refuel: 25200, end: 26500, maxY: 421 },
        v7: { start: 0, refuel: 7200, end: 9000, maxY: 421 },
        v8: { start: 0, refuel: 2400, end: 3600, maxY: 421 }, // early return
        v9: { start: 0, refuel: 7200, end: 9000, maxY: 421 },
        
        // recovery
        v10: { start: 34000, refuel: 36000, end: 38000, maxY: 191 }, // Seymour
        v11: { start: 40000, refuel: 43200, end: 46000, maxY: 327 },
        v12: { start: 40000, refuel: 43200, end: 46000, maxY: 421 } // Barry Neal
    };
    
    const t = timing[id];
    if (!t) return 461;
    
    if (simTime <= t.start) return 461;
    
    if (simTime <= t.refuel) {
        // Going outbound
        const p = (simTime - t.start) / (t.refuel - t.start);
        return 461 - (461 - t.maxY) * p;
    } else if (simTime <= t.end) {
        // Flat refuelling slot
        return t.maxY;
    } else {
        // Returning to base
        const p = (simTime - t.end) / (t.end - t.start); // returns at same speed
        return Math.min(461, t.maxY + (461 - t.maxY) * p);
    }
}

// Draw plane icon in schematic view
function drawSchematicAircraft(callsign, svgX, svgY, color, isVulcan) {
    const pt = projectSchematic(svgX, svgY);
    
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    
    if (isVulcan) {
        ctx.moveTo(pt.x, pt.y - 6);
        ctx.lineTo(pt.x + 5, pt.y + 4);
        ctx.lineTo(pt.x, pt.y + 2);
        ctx.lineTo(pt.x - 5, pt.y + 4);
    } else {
        ctx.moveTo(pt.x, pt.y - 5);
        ctx.lineTo(pt.x + 6, pt.y + 1);
        ctx.lineTo(pt.x + 2, pt.y + 1);
        ctx.lineTo(pt.x, pt.y + 4);
        ctx.lineTo(pt.x - 2, pt.y + 1);
        ctx.lineTo(pt.x - 6, pt.y + 1);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "8px Orbitron";
    ctx.fillText(callsign, pt.x + 8, pt.y + 2);
}

// Draw rotating radar sweep line
function drawRadarSweep() {
    const center = projectGeo(COORDS.ascension.lon + (COORDS.falklands.lon - COORDS.ascension.lon)/2, COORDS.ascension.lat + (COORDS.falklands.lat - COORDS.ascension.lat)/2);
    
    ctx.strokeStyle = "rgba(0, 242, 254, 0.02)";
    ctx.lineWidth = 1;
    
    // Draw concentric radar rings
    for (let r = 100; r < 400; r += 100) {
        ctx.beginPath();
        ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Draw radar sweep line
    ctx.strokeStyle = "rgba(0, 242, 254, 0.05)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    const sweepX = center.x + 400 * Math.cos(radarRotation);
    const sweepY = center.y + 400 * Math.sin(radarRotation);
    ctx.lineTo(sweepX, sweepY);
    ctx.stroke();
}

// Playback Loops
function simulationLoop(timestamp) {
    if (!isPlaying) return;
    
    if (!lastTime) lastTime = timestamp;
    const elapsed = timestamp - lastTime;
    lastTime = timestamp;
    
    // Advance simulation time
    simTime = Math.min(57600, simTime + (elapsed / 1000) * speedFactor);
    document.getElementById("timelineSlider").value = (simTime / 57600) * 100;
    
    updateSimulationState();
    draw();
    
    if (simTime >= 57600) {
        isPlaying = false;
        document.getElementById("playIcon").style.display = "block";
        document.getElementById("pauseIcon").style.display = "none";
    } else {
        animFrameId = requestAnimationFrame(simulationLoop);
    }
}

// Bind UI controls
document.getElementById("playPauseBtn").addEventListener('click', () => {
    isPlaying = !isPlaying;
    const playIcon = document.getElementById("playIcon");
    const pauseIcon = document.getElementById("pauseIcon");
    
    if (isPlaying) {
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
        lastTime = 0; // force recalculate elapsed
        animFrameId = requestAnimationFrame(simulationLoop);
    } else {
        playIcon.style.display = "block";
        pauseIcon.style.display = "none";
        cancelAnimationFrame(animFrameId);
    }
});

document.getElementById("restartBtn").addEventListener('click', () => {
    simTime = 0;
    document.getElementById("timelineSlider").value = 0;
    updateSimulationState();
    draw();
});

document.getElementById("prevBtn").addEventListener('click', () => {
    // Jump to previous event in timeline
    const currentIdx = getEventIndexForTime(simTime);
    const prevIdx = Math.max(0, currentIdx - 1);
    simTime = SIM_EVENTS[prevIdx].time;
    document.getElementById("timelineSlider").value = (simTime / 57600) * 100;
    updateSimulationState();
    draw();
});

document.getElementById("nextBtn").addEventListener('click', () => {
    // Jump to next event
    const currentIdx = getEventIndexForTime(simTime);
    const nextIdx = Math.min(SIM_EVENTS.length - 1, currentIdx + 1);
    simTime = SIM_EVENTS[nextIdx].time;
    document.getElementById("timelineSlider").value = (simTime / 57600) * 100;
    updateSimulationState();
    draw();
});

document.getElementById("timelineSlider").addEventListener('input', (e) => {
    const pct = parseFloat(e.target.value);
    simTime = (pct / 100) * 57600;
    updateSimulationState();
    draw();
});

document.getElementById("speedSelect").addEventListener('change', (e) => {
    speedFactor = parseInt(e.target.value);
});

// Initialize Simulation
async function init() {
    resetAircraft();
    await loadSvgElements();
    updateSimulationState();
    draw();
}

init();
