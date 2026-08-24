import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <h1 class="title">VICE//MERIDIAN</h1>
  <canvas id="game"></canvas>
  <div class="hud">
    <p class="hud-count">SIGNALS <span id="signal-count">0</span>/3</p>
    <p class="hud-mission" id="mission-line">MISSION // Sweep the grid — recover 3 relay signals</p>
    <p class="hud-route" id="hud-route" style="display:none;margin:4px 0 0;font-size:12px;letter-spacing:3px;color:#bfffff;text-shadow:0 0 10px rgba(191,255,255,0.6);"></p>
    <p class="hud-boost">
      BOOST
      <span class="boost-bar"><span class="boost-fill" id="boost-fill"></span></span>
      <span class="boost-state" id="boost-state">READY</span>
    </p>
    <p class="hud-wanted" id="hud-wanted">WANTED <span id="wanted-stars" style="letter-spacing:1px;"></span> <span id="wanted-count">0</span>/3</p>
    <p class="hud-pulse">PULSE F <span class="pulse-state" id="pulse-state">READY</span></p>
    <p class="hud-courier" id="hud-courier" style="display:none;margin:8px 0 0;font-size:12px;letter-spacing:3px;color:#ff9d3c;text-shadow:0 0 10px rgba(255,157,60,0.6);">COURIER // PRESS E TO DRIVE</p>
    <p class="hud-safehouse" id="hud-safehouse" style="display:none;margin:8px 0 0;font-size:12px;letter-spacing:3px;color:#00f0ff;text-shadow:0 0 10px rgba(0,240,255,0.6);">SAFEHOUSE // HOLD H TO CLEAR HEAT</p>
    <p class="hud-crew" id="hud-crew" style="display:none;margin:8px 0 0;font-size:12px;letter-spacing:3px;color:#00f0ff;text-shadow:0 0 10px rgba(0,240,255,0.6);">CREW COVER 0S</p>
    <p class="hud-scan" id="hud-scan" style="display:none;margin:8px 0 0;font-size:12px;letter-spacing:3px;color:#ff3c3c;text-shadow:0 0 10px rgba(255,60,60,0.6);">POLICE SCAN // NEAREST UNIT ---M</p>
    <p class="hud-pursuit" id="hud-pursuit" style="display:none;margin:8px 0 0;font-size:12px;letter-spacing:3px;color:#ff3c3c;text-shadow:0 0 10px rgba(255,60,60,0.6);">POLICE PURSUIT // HEAT 0/3</p>
    <p class="hud-roadblock" id="hud-roadblock" style="display:none;margin:8px 0 0;font-size:12px;letter-spacing:3px;color:#ffb300;text-shadow:0 0 10px rgba(255,179,0,0.7);">ROADBLOCK // INTERCEPTOR EN ROUTE</p>
    <p class="hud-street-cred" id="hud-street-cred" style="margin:8px 0 0;font-size:12px;letter-spacing:3px;color:#ffe05a;text-shadow:0 0 10px rgba(255,224,90,0.6);">STREET CRED // RUNNER</p>
    <p class="hud-airunit" id="hud-airunit" style="display:none;margin:8px 0 0;font-size:12px;letter-spacing:3px;color:#c8d2eb;text-shadow:0 0 10px rgba(200,210,235,0.7);">AIR UNIT // SPOTLIGHT ACTIVE</p>
    <p class="hud-air-support" id="hud-air-support" style="display:none;margin:8px 0 0;font-size:12px;letter-spacing:3px;color:#ff3c3c;text-shadow:0 0 10px rgba(255,60,60,0.6);">AIR SUPPORT // ACTIVE</p>
    <p class="hud-wallet" id="hud-wallet" style="margin:8px 0 0;font-size:12px;letter-spacing:3px;color:#ffe05a;text-shadow:0 0 10px rgba(255,224,90,0.6);">CASH $0 // REP 0</p>
    <p class="hud-hull" id="hud-hull" style="margin:8px 0 0;font-size:12px;letter-spacing:3px;color:#39ff88;text-shadow:0 0 10px rgba(57,255,136,0.6);">HULL <span id="hull-pct">100</span>% <span class="boost-bar" style="display:inline-block;vertical-align:middle;width:90px;"><span class="boost-fill" id="hull-fill" style="width:100%;"></span></span></p>
    <p class="hud-night" id="hud-night" style="position:fixed;left:50%;bottom:56px;transform:translateX(-50%);z-index:1;margin:0;font-size:13px;letter-spacing:3px;color:#c9a4ff;text-shadow:0 0 12px rgba(178,107,255,0.75);pointer-events:none;display:none;"></p>
    <p class="hud-jobboard" id="hud-jobboard" style="display:none;margin:8px 0 0;font-size:12px;letter-spacing:3px;color:#ff6bd6;text-shadow:0 0 10px rgba(255,107,214,0.6);">JOBS // B BLACKOUT // K BANK // V VIP // C CONVOY // J JUNCTION // X TAKEOVER // O SMUGGLER // I CHOP SHOP // Z STASH // N RACE</p>
  </div>
  <div id="phone-menu" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:30;width:min(320px,86vw);max-height:70vh;overflow-y:auto;padding:18px 20px;background:rgba(8,4,24,0.92);border:1px solid #ff2d96;border-radius:10px;box-shadow:0 0 28px rgba(255,45,150,0.55),inset 0 0 14px rgba(255,45,150,0.2);color:#f4ecff;font-family:ui-monospace,Consolas,monospace;text-align:left;display:none;">
    <p id="phone-title" style="margin:0 0 12px;font-size:13px;letter-spacing:3px;color:#00f0ff;text-shadow:0 0 12px rgba(0,240,255,0.75);">VICE//MERIDIAN // CONTACTS</p>
    <p id="phone-arc" style="margin:0 0 8px;font-size:10px;letter-spacing:2px;line-height:1.5;color:#ffe05a;text-shadow:0 0 8px rgba(255,224,90,0.6);"></p>
    <p id="phone-briefing" style="margin:0 0 10px;font-size:10px;letter-spacing:2px;line-height:1.6;color:#c9a4ff;text-shadow:0 0 8px rgba(178,107,255,0.65);"></p>
    <ul id="phone-jobs" style="list-style:none;margin:0;padding:0;font-size:11px;letter-spacing:2px;line-height:2;color:#ffe05a;text-shadow:0 0 8px rgba(255,224,90,0.5);"></ul>
    <p id="phone-hint" style="margin:8px 0 0;font-size:10px;letter-spacing:2px;color:#ffe05a;text-shadow:0 0 8px rgba(255,224,90,0.5);">PRESS 1-9 TO CALL</p>
    <p id="phone-status" style="margin:12px 0 0;font-size:11px;letter-spacing:2px;color:#39ff88;text-shadow:0 0 8px rgba(57,255,136,0.55);">CASH $0 / REP 0 / WANTED 0</p>
    <p id="phone-feedback" style="display:none;margin:8px 0 0;font-size:10px;letter-spacing:2px;color:#39ff88;text-shadow:0 0 8px rgba(57,255,136,0.55);"></p>
    <p id="phone-close" style="margin:8px 0 0;font-size:10px;letter-spacing:2px;color:#ff2d96;text-shadow:0 0 8px rgba(255,45,150,0.6);">TAB TOGGLE // ESC CLOSE</p>
  </div>
  <p class="complete" id="complete" hidden>ALL SIGNALS RECOVERED — GRID SECURE</p>
  <div class="run-complete" id="run-complete" hidden>
    <p class="run-title">RUN COMPLETE // EXTRACTION SECURED</p>
    <p class="run-stats" id="run-stats"></p>
    <p class="run-restart">PRESS R TO RESTART</p>
  </div>
  <p class="hint">WASD / ARROWS to move — HOLD SPACE to boost — Q to jam drones — F to pulse — E to enter/exit courier — E near traffic to carjack — G to tune at safehouse — T repair at safehouse — U crew network — N race — Y night shift — TAB contacts — M map — P save — L load — R restart</p>
  <div id="touch-controls" aria-label="Touch controls">
    <div class="touch-dpad">
      <button id="touch-up" type="button" aria-label="Move up">▲</button>
      <button id="touch-left" type="button" aria-label="Move left">◀</button>
      <button id="touch-down" type="button" aria-label="Move down">▼</button>
      <button id="touch-right" type="button" aria-label="Move right">▶</button>
    </div>
    <div class="touch-actions">
      <button id="touch-boost" type="button" aria-label="Hold boost">BOOST</button>
      <button id="touch-pulse" type="button" aria-label="Tap pulse">PULSE</button>
    </div>
  </div>
`

const canvas = document.querySelector<HTMLCanvasElement>('#game')!
const ctx = canvas.getContext('2d')!

let w = (canvas.width = window.innerWidth)
let h = (canvas.height = window.innerHeight)

window.addEventListener('resize', () => {
  w = canvas.width = window.innerWidth
  h = canvas.height = window.innerHeight
})

const WORLD_W = 2400
const WORLD_H = 1600
let camera = { x: 0, y: 0 }
// Visual-only overdrive feedback window after the boost pool drains to zero
let overdriveImpactUntilMs = 0

// Purely visual city districts: dashed boundary + label + center coordinate line
const CITY_DISTRICTS = [
  { name: 'MIDTOWN', x: WORLD_W * 0.22, y: WORLD_H * 0.22, color: '#00f0ff' },
  { name: 'INDUSTRIAL', x: WORLD_W * 0.72, y: WORLD_H * 0.22, color: '#ffb300' },
  { name: 'OLD MARKET', x: WORLD_W * 0.24, y: WORLD_H * 0.72, color: '#ff2d96' },
  { name: 'HARBOR', x: WORLD_W * 0.74, y: WORLD_H * 0.72, color: '#39ff88' },
] as const

const keys = new Set<string>()
const MOVE_KEYS: Record<string, [number, number]> = {
  KeyW: [0, -1], ArrowUp: [0, -1],
  KeyS: [0, 1], ArrowDown: [0, 1],
  KeyA: [-1, 0], ArrowLeft: [-1, 0],
  KeyD: [1, 0], ArrowRight: [1, 0],
}

window.addEventListener('keydown', e => {
  if (MOVE_KEYS[e.code]) {
    keys.add(e.code)
    e.preventDefault()
  }
  if (e.code === 'Space' || e.code === 'KeyQ' || e.code === 'KeyF' || e.code === 'KeyE' || e.code === 'KeyG' || e.code === 'KeyN' || e.code === 'KeyP' || e.code === 'KeyL' || e.code === 'KeyT' || e.code === 'KeyK' || e.code === 'KeyV' || e.code === 'KeyC' || e.code === 'KeyJ' || e.code === 'KeyX' || e.code === 'KeyU' || e.code === 'KeyO' || e.code === 'KeyI' || e.code === 'KeyZ' || e.code === 'KeyY') {
    e.preventDefault()
  }
  if (e.code === 'KeyM') {
    e.preventDefault()
    mapOpen = !mapOpen
  }
  if (e.code === 'Escape' && mapOpen) {
    mapOpen = false
  }
  if (/^Digit[1-9]$/.test(e.code) && phoneOpen) {
    e.preventDefault()
    const job = CONTACT_JOBS[Number(e.code.slice('Digit'.length)) - 1]
    if (!contactAcceptable(job)) {
      phoneStatusBusy = true
      return
    }
    phoneStatusBusy = false
    job.request()
    phoneCallFeedback = PHONE_CONNECTED_TEXT
    phoneLastCallIndex = CONTACT_JOBS.indexOf(job)
    phoneOpen = false
    return
  }
  // Kingpin contract accept: Digit0 in the open phone menu once the network is online
  if (e.code === 'Digit0' && phoneOpen) {
    e.preventDefault()
    if (kingpinOnline && networkJobState === 'available') {
      networkJobRequested = true
      phoneOpen = false
      return
    }
    // District Control takes over the 0 entry once the network contract completes
    if (
      districtControlUnlocked() &&
      districtControlState === 'available' &&
      districtControlIndex < DISTRICT_CONTROL_SITES.length
    ) {
      districtAcceptRequested = true
      phoneOpen = false
      return
    }
  }
  if (e.code === 'Tab') {
    e.preventDefault()
    if (!phoneOpen) phoneStatusBusy = false
    phoneOpen = !phoneOpen
  }
  if (e.code === 'Escape' && !mapOpen && phoneOpen) {
    phoneOpen = false
  }
  if (e.code === 'KeyQ') jammer.requested = true
  if (e.code === 'KeyF') pulse.requested = true
  if (e.code === 'KeyE') courierToggleRequested = true
  if (e.code === 'KeyH') safehouseRequested = true
  if (e.code === 'KeyB') blackoutRequested = true
  if (e.code === 'KeyG') garageRequested = true
  if (e.code === 'KeyT') repairRequested = true
  if (e.code === 'KeyK') bankRequested = true
  if (e.code === 'KeyV') vipRequested = true
  if (e.code === 'KeyC') convoyRequested = true
  if (e.code === 'KeyJ') jJobRequested = true
  if (e.code === 'KeyX') turfRequested = true
  if (e.code === 'KeyO') smugglerRequested = true
  if (e.code === 'KeyI') chopShopRequested = true
  if (e.code === 'KeyU') crewNetworkRequested = true
  if (e.code === 'KeyN') raceRequested = true
  if (e.code === 'KeyZ') stashRequested = true
  if (e.code === 'KeyY') {
    // Y toggles Night Shift on foot and drives the postgame beats in strict precedence:
    // node activation, contract secure/deliver, district secure/deliver; everywhere else
    // it stays the cosmetic night-shift toggle
    if (missionComplete && !kingpinOnline && playerNearKingpinNode()) kingpinRequested = true
    else if (networkJobState === 'active' && playerNearNetworkVault()) networkSecureRequested = true
    else if (networkJobState === 'returning' && playerAtSafehouse()) networkDeliverRequested = true
    else if (districtControlState === 'active' && playerNearDistrictTarget()) districtSecureRequested = true
    else if (districtControlState === 'returning' && playerAtSafehouse()) districtDeliverRequested = true
    else nightShiftEnabled = !nightShiftEnabled
  }
  if (e.code === 'KeyP') saveRequested = true
  if (e.code === 'KeyL') loadRequested = true
  if (e.code === 'KeyR') restartRequested = true
})
window.addEventListener('keyup', e => keys.delete(e.code))

// Mobile touch dock (hidden by CSS on desktop): buttons drive the same keys Set and
// request flags as the keyboard so gameplay semantics stay identical. Directional and
// BOOST holds add/remove the matching key code; PULSE taps fire the existing pulse flag
function bindHoldButton(id: string, keyCode: string) {
  const button = document.getElementById(id)!
  button.addEventListener('pointerdown', e => {
    e.preventDefault()
    button.setPointerCapture(e.pointerId)
    keys.add(keyCode)
    button.classList.add('is-held')
  })
  for (const type of ['pointerup', 'pointercancel', 'pointerleave'] as const) {
    button.addEventListener(type, () => {
      keys.delete(keyCode)
      button.classList.remove('is-held')
    })
  }
}
bindHoldButton('touch-up', 'KeyW')
bindHoldButton('touch-left', 'KeyA')
bindHoldButton('touch-down', 'KeyS')
bindHoldButton('touch-right', 'KeyD')
bindHoldButton('touch-boost', 'Space')
{
  const pulseButton = document.getElementById('touch-pulse')!
  pulseButton.addEventListener('pointerdown', e => {
    e.preventDefault()
    pulse.requested = true
    pulseButton.classList.add('is-held')
  })
  for (const type of ['pointerup', 'pointercancel', 'pointerleave'] as const) {
    pulseButton.addEventListener(type, () => pulseButton.classList.remove('is-held'))
  }
}

// Night Shift (Y): cosmetic-only toggle that darkens the city and boosts neon glow
const NIGHT_SHIFT_ON_TEXT = 'NIGHT SHIFT // CITY LIGHTS ON'
const NIGHT_SHIFT_OFF_TEXT = 'NIGHT SHIFT // CITY LIGHTS OFF'
let nightShiftEnabled = false
let nightShiftHideAtMs = 0

const player = { x: WORLD_W / 2, y: WORLD_H / 2, size: 28, speed: 320 }
const grid = 48

// Drivable neon courier coupe parked beside spawn; E enters/exits
const courierCar = {
  x: WORLD_W / 2 + 90,
  y: WORLD_H / 2 + 40,
  angle: -Math.PI / 4,
  speed: 0,
  maxSpeed: 360,
  boostSpeed: 560,
  reverseSpeed: 150,
  accel: 420,
  brake: 560,
  friction: 240,
  turnRate: 2.6,
}
const COURIER_ENTER_RADIUS = 70
let driving = false
let courierToggleRequested = false

// Carjacking: walk up to any civilian traffic car and press E to yank the driver out.
// The stolen car drives on the same physics as the courier; its owner flees on foot and
// despawns once clear. Wrecking a stolen ride (hull to zero) ejects you beside it and
// leaves a smoking husk. Everything here is transient free-roam state — resetRun-cleared,
// never persisted, and it never touches the save schema
type CivilianCar = {
  x: number
  y: number
  laneY: number
  dir: number
  angle: number
  speed: number
  color: string
  length: number
}
const CARJACK_RADIUS = 64
const CARJACK_HEAT = 1
const CARJACK_CASH_REWARD = 40
const STOLEN_MAX_SPEED = 330
const STOLEN_BOOST_SPEED = 520
const STOLEN_REVERSE_SPEED = 140
const STOLEN_ACCEL = 400
const STOLEN_BRAKE = 540
const STOLEN_FRICTION = 230
const STOLEN_TURN_RATE = 2.5
const CIVILIAN_HULL_MAX = 70
const CIV_HIT_DAMAGE = 10
const DRIVER_FLEE_SPEED = 150
const DRIVER_DESPAWN_DIST = 620
const WRECK_DESPAWN_DIST = 260
const CARJACK_HOLD_MS = 2600
const CARJACK_COOLDOWN_MS = 700
const CARJACK_FLASH_MS = 420
const CARJACKED_TEXT = 'CARJACKED // DRIVER FLED // +$40'
const STOLEN_RIDE_TEXT = 'STOLEN RIDE'
const CAR_WRECKED_TEXT = 'CAR WRECKED // BAIL OUT'
let stolenCar: CivilianCar | null = null
let stolenHull = CIVILIAN_HULL_MAX
let fleeingDriver: { x: number; y: number; angle: number; color: string } | null = null
let jackFlashUntilMs = 0
let carjackRestoreAtMs = 0
let wreckRestoreAtMs = 0
function activeCar() {
  return stolenCar ?? courierCar
}
function isStolenRide(): boolean {
  return stolenCar !== null
}
// Nearest lane car within reach that is not already the stolen ride; null when none qualify
function nearestJackableCar(): { car: CivilianCar; dist: number } | null {
  if (stolenCar) return null
  let best: { car: CivilianCar; dist: number } | null = null
  for (const t of traffic) {
    const dist = Math.hypot(player.x - t.x, player.y - t.laneY)
    if (dist > CARJACK_RADIUS) continue
    if (!best || dist < best.dist) best = { car: t, dist }
  }
  return best
}
// A wrecked stolen ride only despawns once you have walked clear of it
function stolenWreckAbandoned(): boolean {
  return !!stolenCar && !driving && stolenHull <= 0 && Math.hypot(player.x - stolenCar.x, player.y - stolenCar.y) > WRECK_DESPAWN_DIST
}
// Hull-zero outcome for a stolen ride: eject beside the wreck, leave it smoking in place.
// Walking far enough away despawns the husk and frees you to jack another car this run
function bailOutOfStolenCar(nowMs: number) {
  driving = false
  const angle = stolenCar?.angle ?? courierCar.angle
  player.x = Math.max(player.size, Math.min(WORLD_W - player.size, (stolenCar?.x ?? courierCar.x) + Math.cos(angle) * 36))
  player.y = Math.max(player.size, Math.min(WORLD_H - player.size, (stolenCar?.y ?? courierCar.y) + Math.sin(angle) * 36))
  if (stolenCar) stolenCar.speed = 0
  missionEl.textContent = CAR_WRECKED_TEXT
  wreckRestoreAtMs = nowMs + CARJACK_HOLD_MS
}

// Midnight Sprint street race: three mandatory courier-car checkpoints against the clock (KeyN)
const RACE_CHECKPOINTS = [
  { x: WORLD_W * 0.5, y: WORLD_H * 0.62 + 120, radius: 80 },
  { x: WORLD_W * 0.82, y: WORLD_H * 0.62 + 260, radius: 80 },
  { x: WORLD_W - 340, y: WORLD_H * 0.26, radius: 90 },
]
const RACE_TIME_LIMIT_MS = 45000
const RACE_HOLD_MS = 2600
const RACE_ACCEPT_RADIUS = 130
const RACE_ACTIVE_BASE_TEXT = 'MIDNIGHT SPRINT'
const RACE_DONE_TEXT = 'MIDNIGHT SPRINT // FINISH +$300 // REP +2'
const RACE_EXPIRED_TEXT = 'MIDNIGHT SPRINT // EXPIRED'
let raceRequested = false
let raceState: 'available' | 'active' | 'complete' = 'available'
let raceCheckpointIndex = 0
let raceDeadlineMs = 0
let raceRestoreAtMs = 0

// Off-map heat dump: stand in the zone and press H; banner holds briefly, then mission text restores
const SAFEHOUSE = { x: WORLD_W * 0.18, y: WORLD_H * 0.62 + 180, radius: 110 }
const SAFEHOUSE_HOLD_MS = 2200
const SAFEHOUSE_CLEAR_TEXT = 'SAFEHOUSE // HEAT CLEARED'
let safehouseRequested = false
let safehouseRestoreAtMs = 0

// Safehouse garage progression: three upgrade tiers bought with G at the safehouse.
// Tier 1 keeps the classic Sprint Kit (speed/accel), tier 2 adds an Armor Plate that
// reduces collision and police damage by 25%, tier 3 adds a Boost Cell with faster
// boost regeneration. Durable level persists in the save; transient banners do not
const GARAGE_TUNE_MAX_SPEED_BONUS = 60
const GARAGE_TUNE_ACCEL_BONUS = 80
const GARAGE_HOLD_MS = 2600
const GARAGE_AFFORD_TEXT = 'GARAGE // SPRINT KIT INSTALLED -$250'
const GARAGE_POOR_TEXT = 'GARAGE // TUNE KIT COSTS $250'
// Ladder definition: one entry per tier beyond the base car (index = tier - 1)
const GARAGE_TIERS = [
  { name: 'SPRINT KIT', cost: 250, banner: GARAGE_AFFORD_TEXT, poor: 'GARAGE // TUNE KIT COSTS $250' },
  { name: 'ARMOR PLATE', cost: 500, banner: 'GARAGE // ARMOR PLATE INSTALLED -$500', poor: 'GARAGE // ARMOR PLATE COSTS $500' },
  { name: 'BOOST CELL', cost: 750, banner: 'GARAGE // BOOST CELL INSTALLED -$750', poor: 'GARAGE // BOOST CELL COSTS $750' },
]
const GARAGE_MAXED_TEXT = 'GARAGE // MAXED'
const ARMOR_DAMAGE_MULTIPLIER = 0.75
const BOOST_CELL_REGEN_MULTIPLIER = 1.5
let garageRequested = false
let garageUpgradeLevel = 0 // durable tier count 0..3; legacy garageTuneInstalled maps to >= 1
let garageTuneInstalled = false // legacy boolean kept for save compatibility; true when level >= 1
let garageRestoreAtMs = 0
let garageBannerAfford = true
let garageBannerTierText = ''

// Vehicle damage: collisions wear the hull down; the safehouse repair shop restores it (KeyT)
const VEHICLE_HIT_DAMAGE = 18
const REPAIR_COST = 150
const REPAIR_HOLD_MS = 2600
const VEHICLE_DISABLED_TEXT = 'VEHICLE DISABLED // REPAIR AT SAFEHOUSE'
const REPAIR_DONE_TEXT = 'REPAIR SHOP // VEHICLE RESTORED -$150'
const REPAIR_POOR_TEXT = 'REPAIR SHOP // NEED $150'
let carHealth = 100
let repairRequested = false
let repairRestoreAtMs = 0
let repairBannerAfford = true
let repairPoorRestoreAtMs = 0
const VEHICLE_DISABLED_HOLD_MS = 2600
let vehicleDisabledRestoreAtMs = 0

// Blackout run side mission: accept with B at the safehouse, cut the grid target, then escape home
const BLACKOUT_TARGET = { x: WORLD_W * 0.78, y: WORLD_H * 0.72, radius: 95 }
const BLACKOUT_ACCEPT_RADIUS = 130
const BLACKOUT_HOLD_MS = 2600
const BLACKOUT_ESCAPE_MS = 30000
const BLACKOUT_ACTIVE_TEXT = 'BLACKOUT RUN // REACH GRID TARGET'
const BLACKOUT_ESCAPE_BASE_TEXT = 'BLACKOUT RUN // GRID CUT // ESCAPE TO SAFEHOUSE'
const BLACKOUT_DONE_TEXT = 'BLACKOUT RUN // GRID CUT +$400 // REP +2'
const BLACKOUT_FAILED_TEXT = 'BLACKOUT RUN // ESCAPE FAILED'
let blackoutRequested = false
type BlackoutState = 'available' | 'active' | 'escaping' | 'complete'
let blackoutState: BlackoutState = 'available'
let blackoutRestoreAtMs = 0
let blackoutEscapeDeadlineMs = 0

// Bank Run heist: K at the safehouse, loot the vault on foot, then escape home before time runs out
const BANK_VAULT = { x: WORLD_W * 0.48, y: WORLD_H * 0.30, radius: 85 }
const BANK_ACCEPT_RADIUS = 130
const BANK_ESCAPE_MS = 40000
const BANK_HOLD_MS = 2600
const BANK_ACTIVE_TEXT = 'BANK RUN // REACH THE VAULT'
const BANK_ESCAPE_BASE_TEXT = 'BANK RUN // LOOT SECURED // ESCAPE TO SAFEHOUSE'
const BANK_DONE_TEXT = 'BANK RUN // VAULT JOB +$600 // REP +3'
const BANK_FAILED_TEXT = 'BANK RUN // ESCAPE FAILED'
let bankRequested = false
type BankState = 'available' | 'active' | 'escaping' | 'complete'
let bankState: BankState = 'available'
let bankEscapeDeadlineMs = 0
let bankRestoreAtMs = 0

// VIP Extraction: V at the safehouse, drive to the client, then bring them home in the courier
const VIP_CLIENT = { x: WORLD_W * 0.74, y: WORLD_H * 0.42, radius: 90 }
const VIP_ACCEPT_RADIUS = 130
const VIP_TIME_LIMIT_MS = 50000
const VIP_HOLD_MS = 2600
const VIP_ACTIVE_TEXT = 'VIP EXTRACTION // REACH THE CLIENT'
const VIP_ESCAPE_TEXT = 'VIP EXTRACTION // CLIENT IN CAR // RETURN TO SAFEHOUSE'
const VIP_DONE_TEXT = 'VIP EXTRACTION // CLIENT SECURED +$500 // REP +2'
const VIP_FAILED_TEXT = 'VIP EXTRACTION // CLIENT LOST'
let vipRequested = false
type VipState = 'available' | 'pickup' | 'escaping' | 'complete'
let vipState: VipState = 'available'
let vipDeadlineMs = 0
let vipRestoreAtMs = 0

// Armored Convoy: C at the safehouse, drive to the ambush site, secure the cargo, then bring it home
const CONVOY_SITE = { x: WORLD_W * 0.56, y: WORLD_H * 0.76, radius: 105 }
const CONVOY_ACCEPT_RADIUS = 130
const CONVOY_TIME_LIMIT_MS = 65000
const CONVOY_HOLD_MS = 2600
const CONVOY_ACTIVE_TEXT = 'ARMORED CONVOY // REACH THE AMBUSH SITE'
const CONVOY_ESCAPE_TEXT = 'ARMORED CONVOY // CARGO SECURED // RETURN TO SAFEHOUSE'
const CONVOY_DONE_TEXT = 'ARMORED CONVOY // CARGO SECURED +$750 // REP +3'
const CONVOY_FAILED_TEXT = 'ARMORED CONVOY // CARGO LOST'
let convoyRequested = false
type ConvoyState = 'available' | 'active' | 'escaping' | 'complete'
let convoyState: ConvoyState = 'available'
let convoyDeadlineMs = 0
let convoyRestoreAtMs = 0

// Junction Job: J at the safehouse, drive to the junction, press J on site to secure the target, then bring it home
const J_JOB_SITE = { x: WORLD_W * 0.78, y: WORLD_H * 0.24, radius: 100 }
const J_JOB_ACCEPT_RADIUS = 130
const J_JOB_TIME_LIMIT_MS = 70000
const J_JOB_HOLD_MS = 2600
const J_JOB_ACTIVE_TEXT = 'JUNCTION JOB // REACH THE JUNCTION TARGET'
const J_JOB_ESCAPE_TEXT = 'JUNCTION JOB // TARGET SECURED // RETURN TO SAFEHOUSE'
const J_JOB_DONE_TEXT = 'JUNCTION JOB // TARGET SECURED +$1000 // REP +4'
const J_JOB_FAILED_TEXT = 'JUNCTION JOB // TARGET LOST'
let jJobRequested = false
type JunctionJobState = 'available' | 'active' | 'escaping' | 'complete'
let jJobState: JunctionJobState = 'available'
let jJobDeadlineMs = 0
let jJobRestoreAtMs = 0

// District Takeover: X at the safehouse, walk into the contested district, press X on site to secure it, then escape home on foot
const TURF_SITE = { x: WORLD_W * 0.30, y: WORLD_H * 0.28, radius: 110 }
const TURF_ACCEPT_RADIUS = 130
const TURF_TIME_LIMIT_MS = 75000
const TURF_HOLD_MS = 2600
const TURF_ACTIVE_TEXT = 'DISTRICT TAKEOVER // REACH THE DISTRICT SITE'
const TURF_SHOWDOWN_TEXT = 'DISTRICT TAKEOVER // CLEAR RIVAL CREW'
const TURF_SECURE_TEXT = 'DISTRICT TAKEOVER // RIVALS CLEARED // PRESS X TO SECURE'
const TURF_ESCAPE_TEXT = 'DISTRICT TAKEOVER // DISTRICT SECURED // RETURN TO SAFEHOUSE'
const TURF_DONE_TEXT = 'DISTRICT TAKEOVER // DISTRICT SECURED +$1200'
const TURF_FAILED_TEXT = 'DISTRICT TAKEOVER // DISTRICT LOST'
let turfRequested = false
type TurfState = 'available' | 'active' | 'escaping' | 'complete'
let turfState: TurfState = 'available'
let turfDeadlineMs = 0
let turfRestoreAtMs = 0

// Rival crew showdown: exactly three deterministic hostiles hold the contested district.
// Cosmetic gameplay entities — they never harm the player, never persist, and only pursue
// while the takeover is active and the player is on foot. Pulse bolts (F) drop them.
const RIVAL_COUNT = 3
const RIVAL_MAX_HP = 3
const RIVAL_PURSUIT_SPEED = 74
const RIVAL_ARENA_RADIUS = 150
const RIVAL_HIT_RADIUS = 20
type RivalCrewMember = {
  x: number
  y: number
  hp: number
  maxHp: number
  phase: number
  hitFlashUntilMs: number
}
function makeRival(index: number): RivalCrewMember {
  const spawns = [
    { x: TURF_SITE.x - 46, y: TURF_SITE.y - 34 },
    { x: TURF_SITE.x + 44, y: TURF_SITE.y - 24 },
    { x: TURF_SITE.x + 6, y: TURF_SITE.y + 42 },
  ]
  const spot = spawns[index % spawns.length]
  return { x: spot.x, y: spot.y, hp: RIVAL_MAX_HP, maxHp: RIVAL_MAX_HP, phase: index * 2.1, hitFlashUntilMs: 0 }
}
const rivalCrew: RivalCrewMember[] = Array.from({ length: RIVAL_COUNT }, (_, i) => makeRival(i))
function resetRivalCrew() {
  for (let i = 0; i < rivalCrew.length; i++) rivalCrew[i] = makeRival(i)
}
function rivalsRemaining(): number {
  let left = 0
  for (const rival of rivalCrew) if (rival.hp > 0) left++
  return left
}

// Smuggler Run: O at the safehouse accepts; drive to the pickup, press O to secure the package,
// drive to the drop site and press O to deliver before the run expires
const SMUGGLER_PICKUP_SITE = { x: WORLD_W * 0.80, y: WORLD_H * 0.36, radius: 100 }
const SMUGGLER_DROP_SITE = { x: WORLD_W * 0.68, y: WORLD_H * 0.84, radius: 100 }
const SMUGGLER_ACCEPT_RADIUS = 130
const SMUGGLER_TIME_LIMIT_MS = 80000
const SMUGGLER_HOLD_MS = 2600
const SMUGGLER_ACTIVE_TEXT = 'SMUGGLER RUN // REACH THE PICKUP SITE'
const SMUGGLER_PICKUP_TEXT = 'SMUGGLER RUN // PACKAGE SECURED // REACH THE DROP SITE'
const SMUGGLER_DONE_TEXT = 'SMUGGLER RUN // PACKAGE DELIVERED +$900 // REP +4'
const SMUGGLER_LOST_TEXT = 'SMUGGLER RUN // RUN LOST'
let smugglerRequested = false
type SmugglerState = 'available' | 'pickup' | 'drop' | 'complete'
let smugglerState: SmugglerState = 'available'
let smugglerDeadlineMs = 0
let smugglerRestoreAtMs = 0

// Chop Shop: I at the safehouse accepts; drive to the target vehicle and press I to strip it,
// bring it back to the safehouse and press I to deliver before the job expires
const CHOP_SHOP_SITE = { x: WORLD_W * 0.42, y: WORLD_H * 0.30, radius: 100 }
const CHOP_SHOP_ACCEPT_RADIUS = 130
const CHOP_SHOP_TIME_LIMIT_MS = 85000
const CHOP_SHOP_HOLD_MS = 2600
const CHOP_SHOP_ACTIVE_TEXT = 'CHOP SHOP // REACH THE TARGET VEHICLE'
const CHOP_SHOP_STOLEN_TEXT = 'CHOP SHOP // VEHICLE STRIPPED // RETURN TO SAFEHOUSE'
const CHOP_SHOP_DONE_TEXT = 'CHOP SHOP // VEHICLE DELIVERED +$1400 // REP +5'
const CHOP_SHOP_LOST_TEXT = 'CHOP SHOP // JOB LOST'
let chopShopRequested = false
type ChopShopState = 'available' | 'steal' | 'return' | 'complete'
let chopShopState: ChopShopState = 'available'
let chopShopDeadlineMs = 0
let chopShopRestoreAtMs = 0

// Black Market Stash: one fixed Harbor-area crate with a one-shot on-foot grab (KeyZ).
// Cosmetic freebie outside the mission economy — +$200/+1 rep, banner, marker clears;
// reset by the standard restart flow and never persisted to the save slot
const STASH_SITE = { x: WORLD_W * 0.86, y: WORLD_H * 0.80, radius: 90 }
const STASH_CASH_REWARD = 200
const STASH_REP_REWARD = 1
const STASH_HOLD_MS = 2600
const STASH_SECURED_TEXT = 'BLACK MARKET // STASH SECURED +$200 // REP +1'
let stashRequested = false
let stashCollected = false
let stashRestoreAtMs = 0

// Courier contract: available -> active (on first entry near spawn) -> complete (delivered)
const SKYWAY_DROP_OFF = { x: WORLD_W - 340, y: WORLD_H * 0.26 }
const DROP_OFF_RADIUS = 95
const CONTRACT_DELIVER_HOLD_MS = 2600
const MISSION_SWEEP_TEXT = 'MISSION // Sweep the grid — recover 3 relay signals'
const HOT_DELIVERY_TEXT = 'COURIER RUN // HOT DELIVERY — REACH SKYWAY DROP-OFF'
let contractState: 'available' | 'active' | 'complete' = 'available'
let contractRestoreAtMs = 0
let contractFailRestoreAtMs = 0
const CONTRACT_TIME_LIMIT_MS = 45000
const CONTRACT_FAIL_HOLD_MS = 2600
const DELIVERY_FAILED_TEXT = 'DELIVERY FAILED // TIME EXPIRED'
let contractDeadlineMs = 0

// Traffic collisions while driving: forgiving contact, one registration per cooldown window
const TRAFFIC_HIT_COOLDOWN_MS = 900
const TRAFFIC_HIT_HOLD_MS = 1600
const TRAFFIC_HIT_TEXT = 'TRAFFIC HIT // HEAT +1'
let trafficHitUntilMs = 0
let trafficHitCooldownUntilMs = 0
let trafficHitRestoreAtMs = 0

// Passive heat cooling: 7s continuously clear of every hunter's scan radius sheds one wanted level
const POLICE_SCAN_RADIUS = 520
const HEAT_COOL_MS = 7000
const HEAT_COOL_HOLD_MS = 2200
const HEAT_COOLING_TEXT = 'POLICE SCAN // HEAT COOLING -1'
let heatCoolStartMs = 0
let heatCoolRestoreAtMs = 0

// Temporary Crew Network safehouse service: U on foot buys 45s of faster heat decay (never persisted)
const CREW_COVER_COST = 600
const CREW_COVER_DURATION_MS = 45000
const CREW_COVER_FAST_HEAT_COOL_MS = 2800
const CREW_AFFORD_TEXT = 'CREW NETWORK // COVER ACTIVE -$600'
const CREW_POOR_TEXT = 'CREW NETWORK // NEED $600'
let crewNetworkRequested = false
let crewCoverUntilMs = 0

// Visible police cruisers: exactly two, parked on the road band below the horizon
const POLICE_HIT_DAMAGE = 12
const POLICE_HIT_COOLDOWN_MS = 1200
const POLICE_HIT_HOLD_MS = 1600
const POLICE_IMPACT_TEXT = 'POLICE IMPACT // VEHICLE DAMAGE'
let policeHitUntilMs = 0
let policeHitCooldownUntilMs = 0
let policeHitRestoreAtMs = 0
interface PoliceUnit {
  x: number
  y: number
  angle: number
  homeX: number
  homeY: number
  speed: number
  sirenPhase: number
}
const policeUnits: PoliceUnit[] = [
  { x: WORLD_W * 0.3, y: WORLD_H * 0.62 + 120, angle: Math.PI / 2, homeX: WORLD_W * 0.3, homeY: WORLD_H * 0.62 + 120, speed: 150, sirenPhase: 0 },
  { x: WORLD_W * 0.7, y: WORLD_H * 0.62 + 240, angle: -Math.PI / 2, homeX: WORLD_W * 0.7, homeY: WORLD_H * 0.62 + 240, speed: 170, sirenPhase: Math.PI },
]

// Roadblock escalation (wanted >= 2 while driving in an active heat-bearing mission):
// one interceptor + barrier spawned on the leading camera edge, lightweight pursuit,
// capped one-hit-per-cooldown impact reusing the shared police-impact semantics
const ROADBLOCK_WANTED_MIN = 2
const ROADBLOCK_PURSUIT_SPEED = 205
const ROADBLOCK_TURN_RATE = 1.9
const ROADBLOCK_BARRIER_OFFSET = 34
type RoadblockUnit = {
  active: boolean
  x: number
  y: number
  angle: number
  sirenPhase: number
}
const roadblock: RoadblockUnit = {
  active: false,
  x: 0,
  y: 0,
  angle: 0,
  sirenPhase: Math.PI / 3,
}
function roadblockMissionRunning(): boolean {
  return (
    contractState === 'active' ||
    blackoutState === 'active' ||
    blackoutState === 'escaping' ||
    bankState === 'active' ||
    bankState === 'escaping' ||
    vipState === 'pickup' ||
    vipState === 'escaping' ||
    convoyState === 'active' ||
    convoyState === 'escaping' ||
    jJobState === 'active' ||
    jJobState === 'escaping' ||
    turfState === 'active' ||
    turfState === 'escaping' ||
    smugglerState === 'pickup' ||
    smugglerState === 'drop' ||
    chopShopState === 'steal' ||
    chopShopState === 'return'
  )
}
function resetRoadblock() {
  roadblock.active = false
}

// Wanted-3 air support: one deterministic helicopter enters from the live camera edge once
// the roadblock tier is maxed, sweeping a spotlight over the courier. Capped speed/turn and
// a stand-off radius keep it from ever cornering the player — no runaway difficulty loop
const AIR_UNIT_WANTED_MIN = 3
const AIR_UNIT_SPEED = 240
const AIR_UNIT_TURN_RATE = 1.5
const AIR_UNIT_STANDOFF = 150
type AirUnit = {
  active: boolean
  x: number
  y: number
  angle: number
  rotorPhase: number
}
const airUnit: AirUnit = {
  active: false,
  x: 0,
  y: 0,
  angle: -Math.PI / 2,
  rotorPhase: 0.7,
}
function resetAirUnit() {
  airUnit.active = false
}
let cash = 0
let rep = 0

// Street Cred: a derived read-only projection of the existing rep value — bands
// RUNNER < 3 <= OPERATOR < 6 <= FIXER < 10 <= KINGPIN. No new save fields; the HUD row,
// phone status line, and one-shot rank-up banner all recompute from live rep each frame
function streetCredRank(repValue: number): 'RUNNER' | 'OPERATOR' | 'FIXER' | 'KINGPIN' {
  if (repValue >= 10) return 'KINGPIN'
  if (repValue >= 6) return 'FIXER'
  if (repValue >= 3) return 'OPERATOR'
  return 'RUNNER'
}
const streetCredEl = document.getElementById('hud-street-cred')!
let lastStreetCredRank: ReturnType<typeof streetCredRank> = 'RUNNER'
const STREET_CRED_RANK_UP_HOLD_MS = 2200
let streetCredRankUpUntilMs = 0

// Campaign journal: a three-act arc derived purely from existing progression state —
// ACT I sweeps signals, ACT II runs the extraction gate, ACT III opens after the run
// completes. The phone menu shows the current act + objective; crossing into a new act
// raises a one-shot ACT COMPLETE banner through the standard timing/priority system
type CampaignAct = 'ACT I // SIGNAL SWEEP' | 'ACT II // EXTRACTION' | 'ACT III // KINGPIN NETWORK'
function campaignAct(): CampaignAct {
  if (missionComplete) return 'ACT III // KINGPIN NETWORK'
  if (signalsFound === 3) return 'ACT II // EXTRACTION'
  return 'ACT I // SIGNAL SWEEP'
}
function campaignActObjective(act: CampaignAct): string {
  if (act === 'ACT I // SIGNAL SWEEP') return 'Recover 3 relay signals across the grid'
  if (act === 'ACT II // EXTRACTION') return 'Reach the extraction gate before the city closes in'
  if (!kingpinOnline) return 'Activate the Kingpin Network node'
  if (networkJobState === 'available') return 'Call the Kingpin contract — press 0'
  if (networkJobState === 'active') return 'Reach the data vault and press Y'
  if (networkJobState === 'returning') return 'Deliver the data to the safehouse'
  return 'Network online — free roam the city'
}
const phoneArcEl = document.getElementById('phone-arc')!
const ACT_COMPLETE_HOLD_MS = 2600
let lastCampaignAct: CampaignAct = 'ACT I // SIGNAL SWEEP'
let actCompleteBannerText = ''
let actCompleteUntilMs = 0

// Kingpin Network epilogue: a transient node that appears only after the run completes
// (missionComplete). One-shot on-foot activation pays +$500/+3 rep and takes the network
// online; everything here is resetRun-cleared transient state and never persisted
const KINGPIN_NODE = { x: WORLD_W * 0.88, y: WORLD_H * 0.16, radius: 95 }
const KINGPIN_CASH_REWARD = 500
const KINGPIN_REP_REWARD = 3
const KINGPIN_HOLD_MS = 2600
const KINGPIN_ONLINE_TEXT = 'KINGPIN NETWORK // ONLINE +$500 // REP +3'
let kingpinRequested = false
let kingpinOnline = false
let kingpinRestoreAtMs = 0
function playerNearKingpinNode(): boolean {
  return (
    !driving &&
    Math.hypot(player.x - KINGPIN_NODE.x, player.y - KINGPIN_NODE.y) < KINGPIN_NODE.radius
  )
}

// District Control: the postgame conquest layer, unlocked only after the Kingpin contract
// completes. Three fixed district holds: accept via Digit0, secure the site on foot
// (wanted rises to at least 2), then deliver home for +$1500/+5 and advance. The captured
// count persists through an optional backward-compatible save field (old saves default to
// 0); in-progress state is transient and resetRun-cleared
const DISTRICT_CONTROL_SITES = [
  { name: 'MIDTOWN', x: WORLD_W * 0.22, y: WORLD_H * 0.22, radius: 95 },
  { name: 'INDUSTRIAL', x: WORLD_W * 0.72, y: WORLD_H * 0.24, radius: 95 },
  { name: 'OLD MARKET', x: WORLD_W * 0.30, y: WORLD_H * 0.72, radius: 95 },
]
type DistrictControlState = 'available' | 'active' | 'returning'
let districtControlState: DistrictControlState = 'available'
let districtControlIndex = 0 // durable conquest progress (0..sites.length)
let districtAcceptRequested = false
let districtSecureRequested = false
let districtDeliverRequested = false
let districtNoticeText = ''
let districtNoticeUntilMs = 0
function districtControlUnlocked(): boolean {
  return missionComplete && kingpinOnline && networkJobState === 'complete'
}
function currentDistrictSite() {
  return DISTRICT_CONTROL_SITES[Math.min(districtControlIndex, DISTRICT_CONTROL_SITES.length - 1)]
}
function playerNearDistrictTarget(): boolean {
  const site = currentDistrictSite()
  return !driving && Math.hypot(player.x - site.x, player.y - site.y) < site.radius
}

// Kingpin network contract: a repeatable-once-per-run postgame data sweep offered through
// the phone after the network is online. Reach the vault, secure the data on foot (heat +2),
// then return home to deliver. Entirely transient — resetRun-cleared, never persisted
const NETWORK_VAULT_SITE = { x: WORLD_W * 0.14, y: WORLD_H * 0.20, radius: 95 }
type NetworkJobState = 'available' | 'active' | 'returning' | 'complete'
let networkJobState: NetworkJobState = 'available'
let networkJobRequested = false
let networkSecureRequested = false
let networkDeliverRequested = false
let networkNoticeText = ''
let networkNoticeUntilMs = 0
function playerNearNetworkVault(): boolean {
  return (
    !driving &&
    Math.hypot(player.x - NETWORK_VAULT_SITE.x, player.y - NETWORK_VAULT_SITE.y) < NETWORK_VAULT_SITE.radius
  )
}

// Local browser save slot: durable campaign progress only; transient state never persists
const SAVE_KEY = 'vice-meridian-save-v1'
const SAVE_HOLD_MS = 2600
const SAVE_STORED_TEXT = 'SAVE // PROGRESS STORED'
const SAVE_LOADED_TEXT = 'SAVE // PROGRESS LOADED'
const SAVE_NO_SLOT_TEXT = 'SAVE // NO SLOT FOUND'
let saveRequested = false
let loadRequested = false
let saveRestoreAtMs = 0
let saveBannerText = SAVE_STORED_TEXT

interface SaveData {
  signalsFound: number
  cash: number
  rep: number
  missionComplete: boolean
  garageTuneInstalled: boolean
  blackoutCompleted: boolean
  kingpinOnline?: boolean
  networkJobComplete?: boolean
  districtsControlled?: number
  garageUpgradeLevel?: number
  carHealth?: number
  carX?: number
  carY?: number
  carAngle?: number
  stashCollected?: boolean
  nightShiftEnabled?: boolean
}

function writeSave(): boolean {
  try {
    const data: SaveData = {
      signalsFound,
      cash,
      rep,
      missionComplete,
      garageTuneInstalled,
      blackoutCompleted: blackoutState === 'complete',
      kingpinOnline,
      networkJobComplete: networkJobState === 'complete',
      districtsControlled: districtControlIndex,
      garageUpgradeLevel,
      carHealth,
      carX: courierCar.x,
      carY: courierCar.y,
      carAngle: courierCar.angle,
      stashCollected,
      nightShiftEnabled,
    }
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

function readSave(): SaveData | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as Partial<SaveData>
    if (
      typeof data.signalsFound !== 'number' ||
      typeof data.cash !== 'number' ||
      typeof data.rep !== 'number' ||
      typeof data.missionComplete !== 'boolean' ||
      typeof data.garageTuneInstalled !== 'boolean' ||
      typeof data.blackoutCompleted !== 'boolean'
    ) {
      return null
    }
    if (
      data.districtsControlled !== undefined &&
      (!Number.isInteger(data.districtsControlled) ||
        data.districtsControlled < 0 ||
        data.districtsControlled > DISTRICT_CONTROL_SITES.length)
    ) {
      return null
    }
    // Optional postgame fields: validated as booleans when present; old saves without
    // them stay valid and default the unlock state off
    if (data.kingpinOnline !== undefined && typeof data.kingpinOnline !== 'boolean') return null
    if (data.networkJobComplete !== undefined && typeof data.networkJobComplete !== 'boolean') return null
    if (data.stashCollected !== undefined && typeof data.stashCollected !== 'boolean') return null
    if (data.nightShiftEnabled !== undefined && typeof data.nightShiftEnabled !== 'boolean') return null
    if (
      data.garageUpgradeLevel !== undefined &&
      (!Number.isInteger(data.garageUpgradeLevel) ||
        data.garageUpgradeLevel < 0 ||
        data.garageUpgradeLevel > GARAGE_TIERS.length)
    ) {
      return null
    }
    return data as SaveData
  } catch {
    return null
  }
}

// Standing mission text used when temporary banners (courier/safehouse) hand the line back
function campaignMissionText(): string {
  // District Control standing objective outranks pregame campaign text while a hold runs
  if (districtControlUnlocked() && districtControlState === 'active') {
    const site = currentDistrictSite()
    return `DISTRICT CONTROL // SECURE ${site.name}`
  }
  if (districtControlUnlocked() && districtControlState === 'returning') {
    return 'DISTRICT CONTROL // RETURN TO SAFEHOUSE'
  }
  if (contractState === 'active') {
    return contractDeadlineMs > 0
      ? `${HOT_DELIVERY_TEXT} — ${Math.max(0, Math.ceil((contractDeadlineMs - performance.now()) / 1000))}S`
      : HOT_DELIVERY_TEXT
  }
  if (contractState === 'complete' && contractRestoreAtMs > 0) return 'COURIER RUN // DELIVERED +$250 // REP +1'
  return signalsFound === 3 ? missionPhase2 : MISSION_SWEEP_TEXT
}

let mapOpen = false
let phoneOpen = false

// Single ordered source for the nine contacts: phone list rendering and Digit1-9
// dialing both read this table; digits reuse the same one-shot mission request flags
// as the letter keys so acceptance rules stay identical everywhere.
// Canonical projection of each mission's raw state var:
// available | underway (outbound phase) | returning (escape/drop/return phase) | complete
type ContactPhase = 'available' | 'underway' | 'returning' | 'complete'
type ContactJob = {
  digit: number
  key: string
  label: string
  needsFoot: boolean
  request: () => void
  state: () => ContactPhase
}

function contractIdle(): boolean {
  return contractState !== 'active'
}

// Every other contact must be strictly idle: completed jobs still lock the board,
// mirroring the letter-key acceptance predicates
function otherContactsIdle(excludeKey: string): boolean {
  return CONTACT_JOBS.every(job => job.key === excludeKey || job.state() === 'available')
}

function playerAtSafehouse(): boolean {
  return Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < SAFEHOUSE.radius
}

function contactAcceptable(job: ContactJob): boolean {
  return (
    job.state() === 'available' &&
    contractIdle() &&
    !missionComplete &&
    otherContactsIdle(job.key) &&
    (!job.needsFoot || !driving) &&
    playerAtSafehouse()
  )
}

const CONTACT_JOBS: ContactJob[] = [
  { digit: 1, key: 'blackout', label: 'B BLACKOUT', needsFoot: false, request: () => { blackoutRequested = true }, state: () => blackoutState === 'available' ? 'available' : blackoutState === 'complete' ? 'complete' : blackoutState === 'escaping' ? 'returning' : 'underway' },
  { digit: 2, key: 'bank', label: 'K BANK', needsFoot: false, request: () => { bankRequested = true }, state: () => bankState === 'available' ? 'available' : bankState === 'complete' ? 'complete' : bankState === 'escaping' ? 'returning' : 'underway' },
  { digit: 3, key: 'vip', label: 'V VIP', needsFoot: false, request: () => { vipRequested = true }, state: () => vipState === 'available' ? 'available' : vipState === 'complete' ? 'complete' : vipState === 'escaping' ? 'returning' : 'underway' },
  { digit: 4, key: 'convoy', label: 'C CONVOY', needsFoot: true, request: () => { convoyRequested = true }, state: () => convoyState === 'available' ? 'available' : convoyState === 'complete' ? 'complete' : convoyState === 'escaping' ? 'returning' : 'underway' },
  { digit: 5, key: 'jjob', label: 'J JUNCTION', needsFoot: true, request: () => { jJobRequested = true }, state: () => jJobState === 'available' ? 'available' : jJobState === 'complete' ? 'complete' : jJobState === 'escaping' ? 'returning' : 'underway' },
  { digit: 6, key: 'turf', label: 'X TAKEOVER', needsFoot: true, request: () => { turfRequested = true }, state: () => turfState === 'available' ? 'available' : turfState === 'complete' ? 'complete' : turfState === 'escaping' ? 'returning' : 'underway' },
  { digit: 7, key: 'smuggler', label: 'O SMUGGLER', needsFoot: true, request: () => { smugglerRequested = true }, state: () => smugglerState === 'available' ? 'available' : smugglerState === 'complete' ? 'complete' : smugglerState === 'drop' ? 'returning' : 'underway' },
  { digit: 8, key: 'chopshop', label: 'I CHOP SHOP', needsFoot: true, request: () => { chopShopRequested = true }, state: () => chopShopState === 'available' ? 'available' : chopShopState === 'complete' ? 'complete' : chopShopState === 'return' ? 'returning' : 'underway' },
  { digit: 9, key: 'race', label: 'N RACE', needsFoot: false, request: () => { raceRequested = true }, state: () => raceState === 'available' ? 'available' : raceState === 'complete' ? 'complete' : 'underway' },
]

const PHONE_BUSY_TEXT = 'CONTACT BUSY // JOB UNAVAILABLE'
const PHONE_CONNECTED_TEXT = 'CALL CONNECTED'
const PHONE_RETURN_TEXT = 'RETURN TO SAFEHOUSE'
let phoneStatusBusy = false
let phoneLastCallIndex = -1
// Persistent call outcome shown on its own banner line; wallet line stays untouched
let phoneCallFeedback = ''

let restartRequested = false
let missionComplete = false
let runStartMs = performance.now()
let runTimeSec = 0

// Signal sweep feedback: one-shot banners per recovered signal plus a short cyan
// pulse-ring at the collected position. Purely transient presentation — rewards,
// coordinates, and progression state are untouched, and everything clears in resetRun
const SIGNAL_BANNER_HOLD_MS = 2200
const SIGNAL_PULSE_MS = 700
let signalBannerText = ''
let signalBannerUntilMs = 0
type SignalPulse = { x: number; y: number; untilMs: number }
const signalPulses: SignalPulse[] = []

// Wanted-3 air support feedback: one-shot inbound banner the first time heat hits 3 in a
// run plus a compact HUD readout while wanted === 3. Purely transient presentation over
// the existing airUnit behavior — no pursuit, damage, or save-schema changes
const AIR_SUPPORT_BANNER_HOLD_MS = 2600
const AIR_SUPPORT_INBOUND_TEXT = 'AIR SUPPORT // HELO INBOUND // WANTED 3'
let airSupportBannerUntilMs = 0
let airSupportBannerShown = false

const jammer = {
  requested: false,
  radius: 190,
  cooldown: 0,
  duration: 1.6,
  active: 0,
}

const pulse = {
  requested: false,
  cooldown: 0,
  rate: 0.45,
  speed: 560,
  max: 6,
  bolts: [] as { x: number; y: number; dx: number; dy: number }[],
  flashUntil: 0,
}

const boost = {
  active: false,
  energy: 100,
  drain: 70,
  regen: 34,
  multiplier: 1.85,
  cooldown: false,
}
let facing = { dx: 0, dy: -1 }

let signalsFound = 0
const signalEls = {
  count: document.querySelector<HTMLSpanElement>('#signal-count')!,
  complete: document.getElementById('complete')!,
}
const boostEls = {
  fill: document.querySelector<HTMLSpanElement>('#boost-fill')!,
  state: document.querySelector<HTMLSpanElement>('#boost-state')!,
}
const wantedEls = {
  row: document.getElementById('hud-wanted')!,
  count: document.querySelector<HTMLSpanElement>('#wanted-count')!,
  stars: document.getElementById('wanted-stars')!,
}
const pulseEls = {
  state: document.querySelector<HTMLSpanElement>('#pulse-state')!,
}
const courierEl = document.getElementById('hud-courier')!
const safehouseEl = document.getElementById('hud-safehouse')!
const crewEl = document.getElementById('hud-crew')!
const scanEl = document.getElementById('hud-scan')!
const pursuitEl = document.getElementById('hud-pursuit')!
const roadblockEl = document.getElementById('hud-roadblock')!
const airUnitEl = document.getElementById('hud-airunit')!
const airSupportEl = document.getElementById('hud-air-support')!
const walletEl = document.getElementById('hud-wallet')!
const phoneEl = document.getElementById('phone-menu')!
const phoneStatusEl = document.getElementById('phone-status')!
const phoneBriefingEl = document.getElementById('phone-briefing')!
const phoneJobsEl = document.getElementById('phone-jobs')!
const phoneHintEl = document.getElementById('phone-hint')!
const phoneFeedbackEl = document.getElementById('phone-feedback')!
const hullEl = document.getElementById('hud-hull')!
const hullPctEl = document.querySelector<HTMLSpanElement>('#hull-pct')!
const hullFillEl = document.querySelector<HTMLSpanElement>('#hull-fill')!
const missionEl = document.getElementById('mission-line')!
const routeEl = document.getElementById('hud-route')!
const nightEl = document.getElementById('hud-night')!
const jobboardEl = document.getElementById('hud-jobboard')!
const runCompleteEl = document.getElementById('run-complete')!
const runStatsEl = document.getElementById('run-stats')!

function resetRun(nowMs: number) {
  signalsFound = 0
  signalEls.count.textContent = '0'
  signalEls.complete.hidden = true
  setWanted(0)
  missionComplete = false
  runStartMs = nowMs
  runTimeSec = 0
  player.x = WORLD_W / 2
  player.y = WORLD_H / 2
  facing = { dx: 0, dy: -1 }
  boost.energy = 100
  boost.cooldown = false
  boost.active = false
  pulse.bolts.length = 0
  pulse.cooldown = 0
  jammer.cooldown = 0
  jammer.active = 0
  drones.forEach((d, i) => {
    d.x = WORLD_W * (0.22 + i * 0.28)
    d.y = WORLD_H * 0.62 + 70
    d.angle = i * 2.1
    d.disabledUntil = 0
  })
  for (let i = 0; i < pedestrians.length; i++) {
    pedestrians[i] = makePedestrian(i)
  }
  for (let i = 0; i < traffic.length; i++) {
    traffic[i] = makeCivilianCar(i)
  }
  missionEl.textContent = 'MISSION // Sweep the grid — recover 3 relay signals'
  runCompleteEl.hidden = true
  driving = false
  courierToggleRequested = false
  safehouseRequested = false
  garageRequested = false
  garageUpgradeLevel = 0
  garageTuneInstalled = false
  garageBannerTierText = ''
  garageRestoreAtMs = 0
  repairRequested = false
  repairRestoreAtMs = 0
  carHealth = 100
  saveRequested = false
  loadRequested = false
  saveRestoreAtMs = 0
  raceRequested = false
  raceState = 'available'
  raceCheckpointIndex = 0
  raceDeadlineMs = 0
  raceRestoreAtMs = 0
  bankRequested = false
  bankState = 'available'
  bankEscapeDeadlineMs = 0
  bankRestoreAtMs = 0
  vipRequested = false
  vipState = 'available'
  vipDeadlineMs = 0
  vipRestoreAtMs = 0
  convoyRequested = false
  convoyState = 'available'
  convoyDeadlineMs = 0
  convoyRestoreAtMs = 0
  jJobRequested = false
  jJobState = 'available'
  jJobDeadlineMs = 0
  jJobRestoreAtMs = 0
  turfRequested = false
  turfState = 'available'
  turfDeadlineMs = 0
  turfRestoreAtMs = 0
  overdriveImpactUntilMs = 0
  resetRivalCrew()
  smugglerRequested = false
  smugglerState = 'available'
  smugglerDeadlineMs = 0
  smugglerRestoreAtMs = 0
  chopShopRequested = false
  chopShopState = 'available'
  chopShopDeadlineMs = 0
  chopShopRestoreAtMs = 0
  stashRequested = false
  stashCollected = false
  stashRestoreAtMs = 0
  stolenCar = null
  stolenHull = CIVILIAN_HULL_MAX
  fleeingDriver = null
  jackFlashUntilMs = 0
  carjackRestoreAtMs = 0
  wreckRestoreAtMs = 0
  witnessIndices.length = 0
  witnessReportDeadlineMs = 0
  witnessAlertRestoreAtMs = 0
  witnessJammedRestoreAtMs = 0
  lastStreetCredRank = streetCredRank(rep)
  streetCredRankUpUntilMs = 0
  lastCampaignAct = campaignAct()
  actCompleteBannerText = ''
  actCompleteUntilMs = 0
  kingpinRequested = false
  kingpinOnline = false
  kingpinRestoreAtMs = 0
  networkJobRequested = false
  networkSecureRequested = false
  networkDeliverRequested = false
  networkJobState = 'available'
  networkNoticeText = ''
  networkNoticeUntilMs = 0
  districtControlState = 'available'
  districtControlIndex = 0
  districtAcceptRequested = false
  districtSecureRequested = false
  districtDeliverRequested = false
  districtNoticeText = ''
  districtNoticeUntilMs = 0
  signalBannerText = ''
  signalBannerUntilMs = 0
  signalPulses.length = 0
  airSupportBannerUntilMs = 0
  airSupportBannerShown = false
  policeHitUntilMs = 0
  policeHitCooldownUntilMs = 0
  policeHitRestoreAtMs = 0
  resetRoadblock()
  resetAirUnit()
  blackoutRequested = false
  blackoutState = 'available'
  blackoutRestoreAtMs = 0
  blackoutEscapeDeadlineMs = 0
  safehouseRestoreAtMs = 0
  contractState = 'available'
  contractRestoreAtMs = 0
  contractFailRestoreAtMs = 0
  contractDeadlineMs = 0
  trafficHitUntilMs = 0
  trafficHitCooldownUntilMs = 0
  trafficHitRestoreAtMs = 0
  heatCoolStartMs = 0
  heatCoolRestoreAtMs = 0
  cash = 0
  rep = 0
  crewNetworkRequested = false
  crewCoverUntilMs = 0
  phoneStatusBusy = false
  phoneLastCallIndex = -1
  phoneCallFeedback = ''
  courierCar.maxSpeed = 360
  courierCar.accel = 420
  courierCar.x = WORLD_W / 2 + 90
  courierCar.y = WORLD_H / 2 + 40
  courierCar.angle = -Math.PI / 4
  courierCar.speed = 0
}

const signals = Array.from({ length: 3 }, (_, i) => ({
  x: ((i * 419 + 211) % (WORLD_W - 200)) + 100,
  y: WORLD_H * 0.62 + 60 + ((i * 173) % Math.max(1, WORLD_H - WORLD_H * 0.62 - 140)),
}))

const buildings = Array.from({ length: 14 }, (_, i) => ({
  x: ((i * 137) % (WORLD_W - 160)) + 40,
  y: ((i * 257) % (WORLD_H - 220)) + 60,
  width: 90 + ((i * 61) % 120),
  height: 70 + ((i * 113) % 140),
}))

let wanted = 0
const drones = Array.from({ length: 3 }, (_, i) => ({
  x: WORLD_W * (0.22 + i * 0.28),
  y: WORLD_H * 0.62 + 70,
  angle: i * 2.1,
  radius: 70 + i * 26,
  speed: 1.4 + i * 0.35,
  disabledUntil: 0,
}))

const TRAFFIC_COLORS = ['#ff9d3c', '#b26bff', '#00e5b0', '#ff6b8a', '#4da6ff', '#e8e84a']
function makeCivilianCar(i: number): CivilianCar {
  const laneIndex = i % 3
  const dir = laneIndex === 0 ? 1 : -1
  const laneY = WORLD_H * 0.62 + 55 + laneIndex * ((WORLD_H * 0.38 - 90) / 2)
  return {
    x: (WORLD_W / 6) * i + 40,
    y: laneY,
    laneY,
    dir,
    angle: dir > 0 ? Math.PI / 2 : -Math.PI / 2,
    speed: 70 + ((i * 53) % 90),
    color: TRAFFIC_COLORS[i],
    length: 30 + ((i * 37) % 14),
  }
}
const traffic: CivilianCar[] = Array.from({ length: 6 }, (_, i) => makeCivilianCar(i))

// Ambient pedestrian crowd: eight fixed cosmetic walkers on the lower sidewalk bands.
// The layout derives purely from the index so resetRun reproduces it exactly.
// panicUntilMs is transient witness-panic state (0 = calm) and is never persisted
type Pedestrian = { x: number; y: number; dir: number; speed: number; color: string; phase: number; panicUntilMs?: number }
function makePedestrian(i: number): Pedestrian {
  const northSide = i % 2 === 0
  return {
    x: ((i * 487 + 131) % (WORLD_W - 160)) + 80,
    y: northSide
      ? WORLD_H * 0.62 + 24 + ((i * 53) % 22)
      : WORLD_H - 44 - ((i * 71) % 22),
    dir: northSide ? 1 : -1,
    speed: 24 + ((i * 41) % 18),
    color: TRAFFIC_COLORS[i % TRAFFIC_COLORS.length],
    phase: (i * 137) % 360,
  }
}
const pedestrians: Pedestrian[] = Array.from({ length: 8 }, (_, i) => makePedestrian(i))

// Witness report: the pedestrians nearest a successful carjack (up to three within
// WITNESS_RADIUS) panic together and one shared report goes out on a short fuse —
// exactly one deadline and one heat bump per jack, never stacked per witness. Q jams
// it, H/R clear it. Entirely transient — resetRun-cleared, no save fields
const WITNESS_RADIUS = 320
const WITNESS_MAX_COUNT = 3
const WITNESS_FLEE_MS = 4000
const WITNESS_REPORT_MS = 2600
const WITNESS_ALERT_HOLD_MS = 2200
const JAM_HOLD_MS = 1800
const WITNESS_ALERT_TEXT = 'WITNESS // POLICE ALERT'
const WITNESS_JAMMED_TEXT = 'WITNESS // JAMMED'
let witnessIndices: number[] = []
let witnessReportDeadlineMs = 0
let witnessAlertRestoreAtMs = 0
let witnessJammedRestoreAtMs = 0
function clearWitnessState() {
  for (const i of witnessIndices) delete pedestrians[i].panicUntilMs
  witnessIndices.length = 0
  witnessReportDeadlineMs = 0
  witnessAlertRestoreAtMs = 0
  witnessJammedRestoreAtMs = 0
}

// Second-act objective: extraction gate (revealed once all signals are found)
const gate = {
  get x() {
    return WORLD_W - 150
  },
  get y() {
    return WORLD_H * 0.62 + 90
  },
  radius: 46,
}

// Campaign route compass: derives the single next main-path target from existing state —
// the nearest uncollected signal in ACT I, the extraction gate in ACT II, and the Kingpin
// node until the network is online. Purely a derived HUD readout; no rewards or save fields
type RouteTarget = { label: string; x: number; y: number }
function campaignRouteTarget(): RouteTarget | null {
  if (missionComplete) {
    if (kingpinOnline) {
      // District Control routing: active district while securing, safehouse while
      // returning; null once available again or after 3/3 so free roam stays clean
      if (districtControlState === 'active') {
        const site = currentDistrictSite()
        return { label: `DISTRICT ${districtControlIndex + 1}`, x: site.x, y: site.y }
      }
      if (districtControlState === 'returning') return { label: 'SAFEHOUSE', x: SAFEHOUSE.x, y: SAFEHOUSE.y }
      if (networkJobState === 'active') return { label: 'DATA VAULT', x: NETWORK_VAULT_SITE.x, y: NETWORK_VAULT_SITE.y }
      if (networkJobState === 'returning') return { label: 'SAFEHOUSE', x: SAFEHOUSE.x, y: SAFEHOUSE.y }
      return null
    }
    return { label: 'KINGPIN NODE', x: KINGPIN_NODE.x, y: KINGPIN_NODE.y }
  }
  if (signalsFound === 3) return { label: 'EXTRACTION GATE', x: gate.x, y: gate.y }
  const nextSignal = signals[signalsFound]
  if (!nextSignal) return null
  return { label: `SIGNAL ${signalsFound + 1}`, x: nextSignal.x, y: nextSignal.y }
}
function cardinalDirection(dx: number, dy: number): 'N' | 'E' | 'S' | 'W' {
  return Math.abs(dy) >= Math.abs(dx) ? (dy < 0 ? 'N' : 'S') : dx > 0 ? 'E' : 'W'
}

function setWanted(next: number) {
  const previous = wanted
  wanted = Math.max(0, Math.min(3, next))
  wantedEls.count.textContent = String(wanted)
  wantedEls.stars.textContent = '★'.repeat(wanted) + '☆'.repeat(3 - wanted)
  wantedEls.row.classList.toggle('is-hot', wanted > 0)
  if (wanted === 3 && previous < 3 && !airSupportBannerShown) {
    airSupportBannerShown = true
    airSupportBannerUntilMs = performance.now() + AIR_SUPPORT_BANNER_HOLD_MS
    missionEl.textContent = AIR_SUPPORT_INBOUND_TEXT
  }
}

function neonRect(x: number, y: number, width: number, height: number, color: string) {
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.shadowColor = color
  ctx.shadowBlur = 16
  ctx.strokeRect(x, y, width, height)
  ctx.shadowBlur = 0
}

// Amber neon coupe with cyan glass and a two-cell roof light bar — distinct from green runner and traffic.
// The pose helper keeps one car renderer shared by the courier and any stolen ride without
// structural casts: callers pass every visual property explicitly, nothing else.
// Wrecked husks render dark with smoke; the roof bar cells tint by hull so damage reads live
function drawCarPose(
  x: number,
  y: number,
  angle: number,
  bodyColor: string,
  isDriving: boolean,
  speed: number,
  maxSpeed: number,
  hullPct: number,
  wrecked = false,
  nowMs = 0,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)

  const glowBase = wrecked ? 4 : isDriving ? 26 : 18
  if (!wrecked && isDriving && Math.abs(speed) > 120) {
    // speed streaks while driving fast
    const tail = Math.abs(speed) > maxSpeed * 0.9 ? 36 : 28
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)'
    ctx.lineWidth = 2
    for (const off of [-7, 7]) {
      ctx.beginPath()
      ctx.moveTo(off, 18)
      ctx.lineTo(off, tail + Math.random() * 12)
      ctx.stroke()
    }
  }

  if (wrecked) {
    // dead shell: dark hull, cracked glass, guttering smoke
    ctx.strokeStyle = '#20242f'
    ctx.shadowColor = 'rgba(255, 60, 60, 0.5)'
    ctx.shadowBlur = 6 + Math.sin(nowMs / 160) * 2
    ctx.lineWidth = 2.5
    ctx.strokeRect(-11, -17, 22, 34)
    ctx.fillStyle = 'rgba(40, 44, 56, 0.9)'
    ctx.fillRect(-11, -17, 22, 34)
    ctx.strokeStyle = 'rgba(120, 130, 150, 0.55)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(-6, -10)
    ctx.lineTo(4, -4)
    ctx.moveTo(-4, 8)
    ctx.lineTo(5, 12)
    ctx.stroke()
    const smokeRise = ((nowMs % 900) / 900) * 34
    ctx.fillStyle = `rgba(140, 140, 150, ${0.3 * (1 - smokeRise / 34)})`
    ctx.beginPath()
    ctx.arc(Math.sin(nowMs / 240) * 4, -20 - smokeRise, 5 + smokeRise * 0.16, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    return
  }

  // headlight beams along the heading
  const beam = ctx.createLinearGradient(0, -18, 0, -58)
  beam.addColorStop(0, `${bodyColor}66`)
  beam.addColorStop(1, `${bodyColor}00`)
  ctx.fillStyle = beam
  ctx.beginPath()
  ctx.moveTo(-9, -16)
  ctx.lineTo(-20, -56)
  ctx.lineTo(20, -56)
  ctx.lineTo(9, -16)
  ctx.closePath()
  ctx.fill()

  // body
  ctx.shadowColor = bodyColor
  ctx.shadowBlur = glowBase
  ctx.strokeStyle = bodyColor
  ctx.lineWidth = 2.5
  ctx.strokeRect(-11, -17, 22, 34)

  // windshield + rear window
  ctx.fillStyle = 'rgba(191, 255, 255, 0.5)'
  ctx.fillRect(-7, -12, 14, 8)
  ctx.fillStyle = 'rgba(191, 255, 255, 0.35)'
  ctx.fillRect(-6, 6, 12, 5)

  // roof light bar: amber/cyan cells dim toward red as the hull wears down
  ctx.shadowBlur = 10
  ctx.fillStyle = hullPct > 50 ? '#ffe05a' : '#ff6b4a'
  ctx.fillRect(-7, -3, 6, 4)
  ctx.fillStyle = hullPct > 50 ? '#00f0ff' : '#ff3c3c'
  ctx.fillRect(1, -3, 6, 4)

  // headlights / taillights
  ctx.shadowColor = '#fff8d6'
  ctx.shadowBlur = 10
  ctx.fillStyle = '#fff8d6'
  ctx.fillRect(-9, -19, 5, 3)
  ctx.fillRect(4, -19, 5, 3)
  ctx.fillStyle = '#ff2d96'
  ctx.shadowColor = '#ff2d96'
  ctx.fillRect(-9, 14, 5, 3)
  ctx.fillRect(4, 14, 5, 3)
  ctx.restore()
}

function drawCourierCar(isDriving: boolean) {
  drawCarPose(courierCar.x, courierCar.y, courierCar.angle, '#ff9d3c', isDriving, courierCar.speed, courierCar.maxSpeed, carHealth)
}

// Red/white neon cruiser with alternating roof lights and siren glow — distinct from courier and traffic.
// The pose helper keeps one renderer shared by patrol cruisers and the roadblock interceptor
// without structural casts: callers pass x/y/angle/sirenPhase, nothing else
function drawPolicePose(x: number, y: number, angle: number, sirenPhase: number, active: boolean, nowMs: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)

  // subtle siren glow while hunting
  if (active) {
    const glow = 12 + Math.sin(nowMs / 130 + sirenPhase) * 6
    ctx.shadowColor = '#ff3c3c'
    ctx.shadowBlur = glow
  }

  // dark body outline
  ctx.strokeStyle = '#2a2f45'
  ctx.shadowColor = active ? '#ff3c3c' : 'rgba(0,0,0,0)'
  ctx.lineWidth = 2.5
  ctx.strokeRect(-13, -10, 26, 20)

  // cabin
  ctx.fillStyle = 'rgba(191, 255, 255, 0.4)'
  ctx.fillRect(-5, -7, 10, 14)

  // alternating cyan/red roof lights
  if (active) {
    const flash = Math.floor(nowMs / 140 + sirenPhase) % 2 === 0
    ctx.shadowColor = flash ? '#ff2d55' : '#00f0ff'
    ctx.shadowBlur = 14
    ctx.fillStyle = flash ? '#ff2d55' : '#00f0ff'
    ctx.fillRect(-6, -3, 5, 6)
    ctx.fillStyle = flash ? '#00f0ff' : '#ff2d55'
    ctx.fillRect(1, -3, 5, 6)
  }

  // headlights
  ctx.shadowColor = '#fff8d6'
  ctx.shadowBlur = 8
  ctx.fillStyle = '#fff8d6'
  ctx.fillRect(-9, -11, 5, 3)
  ctx.fillRect(4, -11, 5, 3)
  ctx.restore()
  ctx.shadowBlur = 0
}

function drawPoliceUnit(unit: PoliceUnit, active: boolean, nowMs: number) {
  drawPolicePose(unit.x, unit.y, unit.angle, unit.sirenPhase, active, nowMs)
}

function districtFor(x: number): string {
  if (x < WORLD_W / 3) return 'DOCKSIDE'
  if (x > (WORLD_W * 2) / 3) return 'SKYWAY'
  return 'NEON CORE'
}

// Shared live-objective projection: one ordered list of world-space points that both
// the city map overlay and the neon radar render identically (ring + label + distance).
type ObjectiveMarker = { x: number; y: number; label: string; color: string }

function objectiveMarkers(): ObjectiveMarker[] {
  const markers: ObjectiveMarker[] = [
    { x: SAFEHOUSE.x, y: SAFEHOUSE.y, label: 'SAFEHOUSE', color: '#00f0ff' },
  ]

  // Outbound mission legs only: escape/return legs keep the SAFEHOUSE marker above as the objective
  if (contractState === 'active') {
    markers.push({ x: SKYWAY_DROP_OFF.x, y: SKYWAY_DROP_OFF.y, label: 'DROP-OFF', color: '#ff9d3c' })
  }
  if (blackoutState === 'active') {
    markers.push({ x: BLACKOUT_TARGET.x, y: BLACKOUT_TARGET.y, label: 'GRID TARGET', color: '#ffe05a' })
  }
  if (bankState === 'active') {
    markers.push({ x: BANK_VAULT.x, y: BANK_VAULT.y, label: 'VAULT', color: '#ffe05a' })
  }
  if (vipState === 'pickup') {
    markers.push({ x: VIP_CLIENT.x, y: VIP_CLIENT.y, label: 'VIP CLIENT', color: '#39ff88' })
  }
  if (convoyState === 'active') {
    markers.push({ x: CONVOY_SITE.x, y: CONVOY_SITE.y, label: 'CONVOY', color: '#39ff88' })
  }
  if (jJobState === 'active') {
    markers.push({ x: J_JOB_SITE.x, y: J_JOB_SITE.y, label: 'JUNCTION', color: '#39ff88' })
  }
  if (turfState === 'active') {
    markers.push({ x: TURF_SITE.x, y: TURF_SITE.y, label: 'TAKEOVER', color: '#ff2d96' })
  }
  if (smugglerState === 'pickup') {
    markers.push({ x: SMUGGLER_PICKUP_SITE.x, y: SMUGGLER_PICKUP_SITE.y, label: 'PICKUP', color: '#39ff88' })
  }
  if (smugglerState === 'drop') {
    markers.push({ x: SMUGGLER_DROP_SITE.x, y: SMUGGLER_DROP_SITE.y, label: 'DROP', color: '#ffe05a' })
  }
  if (chopShopState === 'steal') {
    markers.push({ x: CHOP_SHOP_SITE.x, y: CHOP_SHOP_SITE.y, label: 'CHOP SHOP', color: '#b26bff' })
  }
  if (!stashCollected) {
    markers.push({ x: STASH_SITE.x, y: STASH_SITE.y, label: 'STASH', color: '#39ff88' })
  }
  if (missionComplete && !kingpinOnline) {
    markers.push({ x: KINGPIN_NODE.x, y: KINGPIN_NODE.y, label: 'KINGPIN', color: '#b26bff' })
  }
  if (networkJobState === 'active') {
    markers.push({ x: NETWORK_VAULT_SITE.x, y: NETWORK_VAULT_SITE.y, label: 'DATA VAULT', color: '#00f0ff' })
  }
  // District Control: active target while securing; captured sites as compact labels
  for (let i = 0; i < districtControlIndex && i < DISTRICT_CONTROL_SITES.length; i++) {
    const held = DISTRICT_CONTROL_SITES[i]
    markers.push({ x: held.x, y: held.y, label: `${held.name} HELD`, color: '#39ff88' })
  }
  if (districtControlUnlocked() && districtControlState === 'active' && districtControlIndex < DISTRICT_CONTROL_SITES.length) {
    const site = currentDistrictSite()
    markers.push({ x: site.x, y: site.y, label: `DISTRICT ${districtControlIndex + 1}`, color: '#ff9d3c' })
  }
  if (raceState === 'active') {
    const cp = RACE_CHECKPOINTS[Math.min(raceCheckpointIndex, RACE_CHECKPOINTS.length - 1)]
    markers.push({ x: cp.x, y: cp.y, label: 'CHECKPOINT', color: '#39ff88' })
  }

  return markers
}

// Full-screen CITY MAP overlay: static world view, simulation paused while open
function drawCityMap() {
  const now = performance.now()
  ctx.fillStyle = 'rgba(3, 1, 12, 0.88)'
  ctx.fillRect(0, 0, w, h)

  const narrow = w <= 620
  const padX = narrow ? 14 : 70
  // narrow: clear the full HTML HUD stack (~145px) + header row before the map frame
  const padTop = narrow ? 182 : 70
  const padBottom = narrow ? 56 : 70
  const mw = w - padX * 2
  const mh = h - padTop - padBottom
  const mx = padX
  const myTop = padTop
  const kx = mw / WORLD_W
  const ky = mh / WORLD_H

  // abstract streets + blocks
  ctx.strokeStyle = 'rgba(255, 45, 150, 0.22)'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let gx = 0; gx <= w; gx += grid) {
    ctx.moveTo(mx + gx * kx, myTop)
    ctx.lineTo(mx + gx * kx, myTop + mh)
  }
  for (let gy = 0; gy <= h; gy += grid) {
    ctx.moveTo(mx, myTop + gy * ky)
    ctx.lineTo(mx + mw, myTop + gy * ky)
  }
  ctx.stroke()

  buildings.forEach(b => {
    ctx.fillStyle = 'rgba(178, 107, 255, 0.22)'
    ctx.fillRect(mx + b.x * kx, myTop + b.y * ky, b.width * kx, b.height * ky)
    ctx.strokeStyle = 'rgba(178, 107, 255, 0.45)'
    ctx.lineWidth = 1
    ctx.strokeRect(mx + b.x * kx, myTop + b.y * ky, b.width * kx, b.height * ky)
  })

  // horizon marker
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)'
  ctx.setLineDash([6, 6])
  ctx.beginPath()
  ctx.moveTo(mx, myTop + WORLD_H * 0.62 * ky)
  ctx.lineTo(mx + mw, myTop + WORLD_H * 0.62 * ky)
  ctx.stroke()
  ctx.setLineDash([])

  // remaining relay signals
  for (let i = signalsFound; i < signals.length; i++) {
    const s = signals[i]
    ctx.fillStyle = '#ffe05a'
    ctx.shadowColor = '#ffe05a'
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.arc(mx + s.x * kx, myTop + s.y * ky, 4.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // extraction gate after 3/3 signals
  if (signalsFound === 3 && !missionComplete) {
    ctx.strokeStyle = '#b26bff'
    ctx.shadowColor = '#b26bff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(mx + gate.x * kx, myTop + gate.y * ky, 7 + Math.sin(now / 300), 0, Math.PI * 2)
    ctx.stroke()
  }

  // wanted drone contacts
  if (wanted > 0) {
    drones.forEach(d => {
      ctx.fillStyle = now < d.disabledUntil ? 'rgba(120, 130, 150, 0.7)' : '#00f0ff'
      ctx.shadowColor = ctx.fillStyle as string
      ctx.beginPath()
      ctx.arc(mx + d.x * kx, myTop + d.y * ky, 3.5, 0, Math.PI * 2)
      ctx.fill()
    })
  }
  ctx.shadowBlur = 0

  // pursuit cruiser contacts
  if (wanted > 0) {
    policeUnits.forEach(u => {
      ctx.fillStyle = '#ff3c3c'
      ctx.shadowColor = '#ff3c3c'
      ctx.shadowBlur = 6
      ctx.beginPath()
      ctx.arc(mx + u.x * kx, myTop + u.y * ky, 3.5, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.shadowBlur = 0
  }

  // player marker with facing tick
  const px = mx + player.x * kx
  const py = myTop + player.y * ky
  ctx.fillStyle = '#39ff88'
  ctx.shadowColor = '#39ff88'
  ctx.shadowBlur = 9
  ctx.beginPath()
  ctx.arc(px, py, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#39ff88'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(px, py)
  ctx.lineTo(px + facing.dx * 12, py + facing.dy * 12)
  ctx.stroke()
  ctx.shadowBlur = 0

  // shared live objective markers (label + distance), same projection as the radar
  ctx.font = narrow ? '600 8px ui-monospace, Consolas, monospace' : '600 10px ui-monospace, Consolas, monospace'
  for (const marker of objectiveMarkers()) {
    const ox = mx + marker.x * kx
    const oy = myTop + marker.y * ky
    const odist = Math.round(Math.hypot(player.x - marker.x, player.y - marker.y))
    ctx.strokeStyle = marker.color
    ctx.shadowColor = marker.color
    ctx.lineWidth = narrow ? 1.5 : 2
    ctx.setLineDash([4, 3])
    ctx.beginPath()
    ctx.arc(ox, oy, narrow ? 5 : 7, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    if (!narrow) {
      ctx.textAlign = 'center'
      ctx.fillStyle = marker.color
      ctx.fillText(marker.label, ox, oy - 12)
      ctx.fillText(`${odist}M`, ox, oy + 20)
    }
  }
  ctx.shadowBlur = 0

  // district labels
  ctx.font = narrow ? '700 10px ui-monospace, Consolas, monospace' : '700 13px ui-monospace, Consolas, monospace'
  ctx.textAlign = 'center'
  const labels: [string, number][] = [
    ['DOCKSIDE', mx + mw / 6],
    ['NEON CORE', mx + mw / 2],
    ['SKYWAY', mx + (mw * 5) / 6],
  ]
  labels.forEach(([name, lx]) => {
    ctx.fillStyle = 'rgba(255, 45, 150, 0.85)'
    ctx.shadowColor = '#ff2d96'
    ctx.shadowBlur = 10
    ctx.fillText(name, lx, myTop + mh - 12)
  })

  // header + close hint
  ctx.font = narrow ? '600 10px ui-monospace, Consolas, monospace' : '600 12px ui-monospace, Consolas, monospace'
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(0, 240, 255, 0.85)'
  ctx.fillText('CITY MAP', padX, padTop - 16)
  ctx.textAlign = 'right'
  ctx.fillStyle = '#ffe05a'
  ctx.fillText('MAP OPEN // M TO CLOSE // ESC CLOSE', mx + mw, padTop - 16)
}

// Compact top-right NEON RADAR: abstract blocks/streets + live entity blips
function drawRadar(now: number) {
  const narrow = w <= 620
  const rw = narrow ? 148 : 186
  const rh = narrow ? 116 : 142
  // narrow screens: sit below the HTML HUD stack so it never meets the title
  const rx = w - rw - (narrow ? 10 : 16)
  const ry = narrow ? 158 : 14

  ctx.fillStyle = 'rgba(4, 2, 16, 0.74)'
  ctx.fillRect(rx, ry, rw, rh)
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)'
  ctx.shadowColor = '#00f0ff'
  ctx.shadowBlur = 12
  ctx.lineWidth = 1.5
  ctx.strokeRect(rx, ry, rw, rh)
  ctx.shadowBlur = 0

  ctx.font = '600 9px ui-monospace, Consolas, monospace'
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(0, 240, 255, 0.75)'
  ctx.fillText('NEON RADAR', rx + 8, ry + 13)

  const pad = 8
  const ix = rx + pad
  const iy = ry + pad + 6
  const iw = rw - pad * 2
  const ih = rh - pad * 2 - 6
  const kx = iw / WORLD_W
  const ky = ih / WORLD_H
  const mx = (wx: number) => ix + wx * kx
  const my = (wy: number) => iy + wy * ky

  ctx.save()
  ctx.beginPath()
  ctx.rect(ix, iy, iw, ih)
  ctx.clip()

  // abstract street grid
  ctx.strokeStyle = 'rgba(255, 45, 150, 0.18)'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let gx = 0; gx <= w; gx += grid * 2) {
    ctx.moveTo(mx(gx), iy)
    ctx.lineTo(mx(gx), iy + ih)
  }
  for (let gy = 0; gy <= h; gy += 90) {
    ctx.moveTo(ix, my(gy))
    ctx.lineTo(ix + iw, my(gy))
  }
  ctx.stroke()

  // city blocks from the live building layout
  ctx.fillStyle = 'rgba(178, 107, 255, 0.16)'
  buildings.forEach(b => {
    ctx.fillRect(mx(b.x), my(b.y), Math.max(2, b.width * kx), Math.max(1.5, b.height * ky))
  })

  // shoreline/horizon marker
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)'
  ctx.beginPath()
  ctx.moveTo(ix, my(WORLD_H * 0.62))
  ctx.lineTo(ix + iw, my(WORLD_H * 0.62))
  ctx.stroke()

  // remaining relay signals
  ctx.fillStyle = '#ffe05a'
  ctx.shadowColor = '#ffe05a'
  ctx.shadowBlur = 5
  for (let i = signalsFound; i < signals.length; i++) {
    ctx.beginPath()
    ctx.arc(mx(signals[i].x), my(signals[i].y), 2.4, 0, Math.PI * 2)
    ctx.fill()
  }

  // extraction gate once revealed
  if (signalsFound === 3 && !missionComplete) {
    ctx.strokeStyle = '#b26bff'
    ctx.shadowColor = '#b26bff'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(mx(gate.x), my(gate.y), 4.5 + Math.sin(now / 300), 0, Math.PI * 2)
    ctx.stroke()
  }

  // shared live objective markers (compact blips; label only on wide screens), same projection as the map
  for (const marker of objectiveMarkers()) {
    const odist = Math.round(Math.hypot(player.x - marker.x, player.y - marker.y))
    ctx.strokeStyle = marker.color
    ctx.shadowColor = marker.color
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(mx(marker.x), my(marker.y), narrow ? 4 : 5, 0, Math.PI * 2)
    ctx.stroke()
    if (!narrow) {
      ctx.font = '600 8px ui-monospace, Consolas, monospace'
      ctx.textAlign = 'center'
      ctx.fillStyle = marker.color
      ctx.fillText(`${marker.label} ${odist}M`, mx(marker.x), my(marker.y) + 14)
    }
  }
  ctx.shadowBlur = 0

  // drone contacts while wanted
  if (wanted > 0) {
    drones.forEach(d => {
      const stunned = now < d.disabledUntil
      ctx.fillStyle = stunned ? 'rgba(120, 130, 150, 0.7)' : '#00f0ff'
      ctx.shadowColor = stunned ? 'rgba(0,0,0,0)' : '#00f0ff'
      ctx.beginPath()
      ctx.arc(mx(d.x), my(d.y), 2.2, 0, Math.PI * 2)
      ctx.fill()
    })
    const pursuitActive = contractState === 'active'
    policeUnits.forEach(u => {
      if (!pursuitActive) {
        ctx.fillStyle = '#ff3c3c'
        ctx.shadowColor = '#ff3c3c'
        ctx.shadowBlur = 4
        ctx.beginPath()
        ctx.arc(mx(u.x), my(u.y), 2.4, 0, Math.PI * 2)
        ctx.fill()
        return
      }
      // courier-run pursuit: two-tone interceptor mark flashing in sync with the world cruisers
      const flashRed = Math.floor(now / 140 + u.sirenPhase) % 2 === 0
      const cellA = flashRed ? '#ff2d55' : '#00f0ff'
      const cellB = flashRed ? '#00f0ff' : '#ff2d55'
      ctx.save()
      ctx.translate(mx(u.x), my(u.y))
      ctx.rotate(Math.PI / 4)
      ctx.strokeStyle = '#ff3c3c'
      ctx.shadowColor = '#ff3c3c'
      ctx.lineWidth = 1.2
      ctx.strokeRect(-3.6, -3.6, 7.2, 7.2)
      ctx.fillStyle = cellA
      ctx.shadowColor = cellA
      ctx.shadowBlur = 5
      ctx.fillRect(-3.2, -3.2, 2.9, 2.9)
      ctx.fillStyle = cellB
      ctx.shadowColor = cellB
      ctx.fillRect(0.3, -3.2, 2.9, 2.9)
      ctx.restore()
    })
  }
  ctx.shadowBlur = 0

  // rotating sweep
  const sweepAng = (now / 1100) % (Math.PI * 2)
  const cx = ix + iw / 2
  const cy = iy + ih / 2
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx + Math.cos(sweepAng) * iw, cy + Math.sin(sweepAng) * ih)
  ctx.stroke()

  // player blip
  ctx.fillStyle = '#39ff88'
  ctx.shadowColor = '#39ff88'
  ctx.shadowBlur = 7 + Math.sin(now / 220) * 3
  ctx.beginPath()
  ctx.arc(mx(player.x), my(player.y), 2.8, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  ctx.restore()

  // district readout
  ctx.font = '600 9px ui-monospace, Consolas, monospace'
  ctx.textAlign = 'right'
  ctx.fillStyle = '#ff2d96'
  ctx.shadowColor = '#ff2d96'
  ctx.shadowBlur = 6
  ctx.fillText(`DIST // ${districtFor(player.x)}`, rx + rw - 8, ry + 13)
  ctx.shadowBlur = 0

  // active hot courier run: pursuit banner with a red/blue flasher pair
  if (contractState === 'active' && wanted > 0) {
    const flashRed = Math.floor(now / 140) % 2 === 0
    const barA = flashRed ? '#ff2d55' : '#00f0ff'
    const barB = flashRed ? '#00f0ff' : '#ff2d55'
    const label = 'PURSUIT'
    ctx.font = '600 9px ui-monospace, Consolas, monospace'
    ctx.textAlign = 'left'
    const labelW = ctx.measureText(label).width
    const bx = rx + 8
    const by = ry + rh - 15
    ctx.fillStyle = 'rgba(4, 2, 16, 0.78)'
    ctx.fillRect(bx - 3, by - 9, labelW + 21, 13)
    ctx.strokeStyle = barA
    ctx.lineWidth = 1
    ctx.strokeRect(bx - 3, by - 9, labelW + 21, 13)
    ctx.fillStyle = barA
    ctx.shadowColor = barA
    ctx.shadowBlur = 6
    ctx.fillText(label, bx, by)
    ctx.shadowBlur = 0
    ctx.fillRect(bx + labelW + 5, by - 7, 3, 6)
    ctx.fillStyle = barB
    ctx.shadowColor = barB
    ctx.shadowBlur = 5
    ctx.fillRect(bx + labelW + 10, by - 7, 3, 6)
    ctx.shadowBlur = 0
  }
}

let last = performance.now()
const missionPhase2 = 'MISSION // Reach the extraction gate'

function frame(now: number) {
  const dt = Math.min((now - last) / 1000, 0.05)
  last = now

  if (mapOpen) {
    drawCityMap()
    requestAnimationFrame(frame)
    return
  }

  if (phoneOpen) {
    phoneEl.style.display = 'block'
    // Contacts rendered from the one ordered table with compact live state text
    const listHtml = CONTACT_JOBS.map((job, index) => {
      const phase = job.state()
      let stateText: string
      if (phase === 'underway') stateText = 'ACTIVE'
      else if (phase === 'returning') stateText = PHONE_RETURN_TEXT
      else if (phase === 'complete') stateText = 'COMPLETE'
      else if (!contactAcceptable(job)) stateText = playerAtSafehouse() ? 'UNAVAILABLE' : PHONE_RETURN_TEXT
      else stateText = 'READY'
      const dim = phase === 'complete' ? ' style="opacity:0.55;"' : ''
      return `<li>${index + 1} ${job.label} — ${stateText}${dim}</li>`
    }).join('')
    // Postgame entry: Kingpin contract row while it runs, then District Control rows
    // after the contract completes; 0 accepts whichever beat is callable
    let networkEntryHtml = ''
    if (kingpinOnline && networkJobState !== 'complete') {
      const networkStateText =
        networkJobState === 'available'
          ? 'READY — PRESS 0'
          : networkJobState === 'active'
            ? 'REACH THE VAULT'
            : 'RETURN TO SAFEHOUSE'
      networkEntryHtml = `<li>0 KINGPIN CONTRACT — ${networkStateText}</li>`
    }
    let districtEntryHtml = ''
    if (districtControlUnlocked() && (networkJobState === 'complete' || districtControlState !== 'available')) {
      const site = currentDistrictSite()
      const districtStateText =
        districtControlState === 'available'
          ? `READY — PRESS 0 (${site.name})`
          : districtControlState === 'active'
            ? `SECURE ${site.name}`
            : PHONE_RETURN_TEXT
      const dim = districtControlIndex >= DISTRICT_CONTROL_SITES.length ? ' style="opacity:0.55;"' : ''
      const progressLabel =
        districtControlIndex >= DISTRICT_CONTROL_SITES.length ? '3/3 COMPLETE' : `${districtControlIndex}/${DISTRICT_CONTROL_SITES.length}`
      districtEntryHtml = `<li>0 DISTRICT CONTROL ${progressLabel} — ${districtStateText}${dim}</li>`
    }
    const fullListHtml = listHtml + networkEntryHtml + districtEntryHtml
    if (phoneJobsEl.innerHTML !== fullListHtml) phoneJobsEl.innerHTML = fullListHtml
    // Hint reads 0-9 only while a postgame entry is callable
    const zeroCallable =
      (kingpinOnline && networkJobState === 'available') ||
      (districtControlUnlocked() && districtControlState === 'available' && districtControlIndex < DISTRICT_CONTROL_SITES.length)
    const phoneHintText = zeroCallable ? 'PRESS 0-9 TO CALL' : 'PRESS 1-9 TO CALL'
    if (phoneHintEl.textContent !== phoneHintText) phoneHintEl.textContent = phoneHintText
    const briefingText = campaignMissionText()
    if (phoneBriefingEl.textContent !== briefingText) phoneBriefingEl.textContent = briefingText
    // Campaign arc line: current act + its concise objective, recomputed while the menu is open
    const arcAct = campaignAct()
    const arcText = `${arcAct} — ${campaignActObjective(arcAct)}`
    if (phoneArcEl.textContent !== arcText) phoneArcEl.textContent = arcText
    if (phoneStatusBusy) {
      const busyText = `CASH $${cash} / REP ${rep} / WANTED ${wanted} / CRED ${streetCredRank(rep)} // ${PHONE_BUSY_TEXT}`
      if (phoneStatusEl.textContent !== busyText) phoneStatusEl.textContent = busyText
    } else {
      const phoneText = `CASH $${cash} / REP ${rep} / WANTED ${wanted} / CRED ${streetCredRank(rep)}`
      if (phoneStatusEl.textContent !== phoneText) phoneStatusEl.textContent = phoneText
    }
    // Banner reconciles against live mission state so it never claims acceptance
    // the simulation has not confirmed
    if (phoneLastCallIndex >= 0 && phoneCallFeedback) {
      const calledJob = CONTACT_JOBS[phoneLastCallIndex]
      const calledPhase = calledJob.state()
      let feedbackText = phoneCallFeedback
      if (calledPhase !== 'available') feedbackText = `${PHONE_CONNECTED_TEXT} // ${calledJob.label}`
      else if (!contactAcceptable(calledJob)) feedbackText = PHONE_BUSY_TEXT
      if (phoneFeedbackEl.textContent !== feedbackText) phoneFeedbackEl.textContent = feedbackText
      if (phoneFeedbackEl.style.display !== 'block') phoneFeedbackEl.style.display = 'block'
    } else if (phoneFeedbackEl.style.display !== 'none') {
      phoneFeedbackEl.style.display = 'none'
    }
    requestAnimationFrame(frame)
    return
  }
  if (phoneEl.style.display !== 'none') {
    phoneEl.style.display = 'none'
  }

  let dx = 0
  let dy = 0
  for (const code of keys) {
    const [mx, my] = MOVE_KEYS[code]
    dx += mx
    dy += my
  }
  const len = Math.hypot(dx, dy) || 1
  const moving = dx !== 0 || dy !== 0

  if (!driving) {
    const wantBoost = keys.has('Space') && boost.energy > 1 && !boost.cooldown
    boost.active = wantBoost && moving
    if (boost.active) {
      boost.energy = Math.max(0, boost.energy - boost.drain * dt)
      if (boost.energy <= 0) {
        boost.cooldown = true
        boost.active = false
      }
    } else {
      boost.energy = Math.min(100, boost.energy + (boost.cooldown ? 0 : boost.regen * (garageUpgradeLevel >= 3 ? BOOST_CELL_REGEN_MULTIPLIER : 1) * dt))
      if (boost.cooldown && boost.energy >= 40) boost.cooldown = false
    }
  }

  const speedNow = player.speed * (boost.active ? boost.multiplier : 1)
  if (driving) {
    // arcade car physics: steering authority scales with roll speed.
    // The active car is the courier by default or the stolen ride while it lasts
    const car = activeCar()
    const maxSpeed = isStolenRide() ? STOLEN_MAX_SPEED : courierCar.maxSpeed
    const boostSpeed = isStolenRide() ? STOLEN_BOOST_SPEED : courierCar.boostSpeed
    const reverseSpeed = isStolenRide() ? STOLEN_REVERSE_SPEED : courierCar.reverseSpeed
    const accel = isStolenRide() ? STOLEN_ACCEL : courierCar.accel
    const brake = isStolenRide() ? STOLEN_BRAKE : courierCar.brake
    const friction = isStolenRide() ? STOLEN_FRICTION : courierCar.friction
    const turnRate = isStolenRide() ? STOLEN_TURN_RATE : courierCar.turnRate
    let throttle = 0
    for (const code of keys) {
      const [kx, ky] = MOVE_KEYS[code]
      if (ky < 0) throttle = 1
      else if (ky > 0) throttle = -1
      if (kx !== 0) {
        const turnEff = 0.35 + 0.65 * Math.min(1, Math.abs(car.speed) / 160)
        car.angle += kx * turnRate * dt * (car.speed < 0 ? -1 : 1) * turnEff
      }
    }
    if (throttle > 0) {
      car.speed = Math.min(maxSpeed, car.speed + accel * dt)
    } else if (throttle < 0) {
      const rate = car.speed > 0 ? brake : accel
      car.speed = Math.max(-reverseSpeed, car.speed - rate * dt)
    } else {
      const drop = friction * dt
      car.speed = car.speed > 0 ? Math.max(0, car.speed - drop) : Math.min(0, car.speed + drop)
    }

    // Space boosts forward, sharing the runner's energy pool
    const carBoost = keys.has('Space') && boost.energy > 1 && !boost.cooldown && car.speed > 0
    boost.active = carBoost
    if (carBoost) {
      boost.energy = Math.max(0, boost.energy - boost.drain * dt)
      if (boost.energy <= 0) {
        boost.cooldown = true
        boost.active = false
        overdriveImpactUntilMs = now + 260
      }
    } else {
      boost.energy = Math.min(100, boost.energy + (boost.cooldown ? 0 : boost.regen * (garageUpgradeLevel >= 3 ? BOOST_CELL_REGEN_MULTIPLIER : 1) * dt))
      if (boost.cooldown && boost.energy >= 40) boost.cooldown = false
    }
    if (carBoost) car.speed = Math.min(boostSpeed, car.speed)

    car.x += Math.sin(car.angle) * car.speed * dt
    car.y -= Math.cos(car.angle) * car.speed * dt
    car.x = Math.max(24, Math.min(WORLD_W - 24, car.x))
    car.y = Math.max(24, Math.min(WORLD_H - 24, car.y))

    // Forgiving traffic contact: sharp slowdown plus heat and hull damage, one registration per window.
    // Stolen rides take the hit on their own lighter hull; a wrecked one ejects you beside it
    if (now >= trafficHitCooldownUntilMs) {
      for (const t of traffic) {
        if (Math.abs(car.x - t.x) < t.length / 2 + 20 && Math.abs(car.y - t.laneY) < 28) {
          car.speed *= -0.25
          setWanted(wanted + 1)
          trafficHitUntilMs = now + TRAFFIC_HIT_HOLD_MS
          trafficHitCooldownUntilMs = now + TRAFFIC_HIT_COOLDOWN_MS
          trafficHitRestoreAtMs = now + TRAFFIC_HIT_HOLD_MS
          if (isStolenRide()) {
            stolenHull = Math.max(0, stolenHull - CIV_HIT_DAMAGE)
            missionEl.textContent = `STOLEN RIDE // HULL ${stolenHull}%`
            if (stolenHull <= 0) bailOutOfStolenCar(now)
          } else {
            carHealth = Math.max(0, carHealth - VEHICLE_HIT_DAMAGE * (garageUpgradeLevel >= 2 ? ARMOR_DAMAGE_MULTIPLIER : 1))
            missionEl.textContent = `VEHICLE DAMAGE // ${carHealth}%`
            if (carHealth <= 0) {
              driving = false
              player.x = Math.max(player.size, Math.min(WORLD_W - player.size, courierCar.x + Math.cos(courierCar.angle) * 36))
              player.y = Math.max(player.size, Math.min(WORLD_H - player.size, courierCar.y + Math.sin(courierCar.angle) * 36))
              courierCar.speed = 0
              missionEl.textContent = VEHICLE_DISABLED_TEXT
              vehicleDisabledRestoreAtMs = now + VEHICLE_DISABLED_HOLD_MS
            }
          }
          break
        }
      }
    }

    // Rider sits in the active hull; facing tracks the hood so pulses fire forward
    player.x = car.x
    player.y = car.y
    facing.dx = Math.sin(car.angle)
    facing.dy = -Math.cos(car.angle)

    // Midnight Sprint: only the driving courier advances checkpoints, in mandatory order
    if (raceState === 'active') {
      const cp = RACE_CHECKPOINTS[raceCheckpointIndex]
      if (Math.hypot(courierCar.x - cp.x, courierCar.y - cp.y) < cp.radius) {
        raceCheckpointIndex++
        if (raceCheckpointIndex >= RACE_CHECKPOINTS.length) {
          raceState = 'complete'
          raceDeadlineMs = 0
          raceRestoreAtMs = now + RACE_HOLD_MS
          cash += 300
          rep += 2
          setWanted(0)
          heatCoolStartMs = 0
          missionEl.textContent = RACE_DONE_TEXT
        }
      }
    }

    // E steps out beside the door once nearly stopped; stepping out of the stolen ride
    // parks it in place so E nearby re-enters it. Stopped inside the active drop-off delivers the run
    if (courierToggleRequested && Math.abs(car.speed) <= 80) {
      const stoppedAtDrop =
        contractState === 'active' &&
        !isStolenRide() &&
        Math.hypot(courierCar.x - SKYWAY_DROP_OFF.x, courierCar.y - SKYWAY_DROP_OFF.y) < DROP_OFF_RADIUS &&
        Math.abs(courierCar.speed) <= 20
      driving = false
      player.x = Math.max(player.size, Math.min(WORLD_W - player.size, car.x + Math.cos(car.angle) * 36))
      player.y = Math.max(player.size, Math.min(WORLD_H - player.size, car.y + Math.sin(car.angle) * 36))
      car.speed = 0
      if (stoppedAtDrop) {
        contractState = 'complete'
        contractDeadlineMs = 0
        contractRestoreAtMs = now + CONTRACT_DELIVER_HOLD_MS
        cash += 250
        rep += 1
        setWanted(0)
        heatCoolStartMs = 0
        missionEl.textContent = 'COURIER RUN // DELIVERED +$250 // REP +1'
      }
    }
  } else {
    player.x = Math.max(player.size, Math.min(WORLD_W - player.size, player.x + (dx / len) * speedNow * dt))
    player.y = Math.max(player.size, Math.min(WORLD_H - player.size, player.y + (dy / len) * speedNow * dt))

    // E interactions on foot, in priority order:
    //   1. courier in reach — get back in (a stolen ride is abandoned where it sits)
    //   2. parked stolen ride in reach — re-enter it
    //   3. moving civilian in reach — carjack it; a wreck left far behind despawns first
    //      so another jack stays possible this run
    if (courierToggleRequested && !stolenCar && stolenWreckAbandoned()) {
      stolenCar = null
    }
    if (courierToggleRequested && carHealth > 0 && Math.hypot(player.x - courierCar.x, player.y - courierCar.y) < COURIER_ENTER_RADIUS) {
      driving = true
      stolenCar = null
      fleeingDriver = null
      if (contractState === 'available') {
        contractState = 'active'
        contractDeadlineMs = now + CONTRACT_TIME_LIMIT_MS
        setWanted(Math.max(1, wanted))
        missionEl.textContent = HOT_DELIVERY_TEXT
      }
    } else if (courierToggleRequested && stolenCar && stolenHull > 0 && Math.hypot(player.x - stolenCar.x, player.y - stolenCar.y) < CARJACK_RADIUS) {
      driving = true
      missionEl.textContent = STOLEN_RIDE_TEXT
    } else if (courierToggleRequested && !stolenCar) {
      const target = nearestJackableCar()
      if (target && now >= jackFlashUntilMs + CARJACK_COOLDOWN_MS) {
        stolenCar = target.car
        // the jacked car keeps its lane heading; its owner bails out beside the door and flees
        const doorX = stolenCar.x - (stolenCar.dir > 0 ? 22 : -22)
        fleeingDriver = { x: doorX, y: stolenCar.laneY, angle: 0, color: stolenCar.color }
        stolenHull = CIVILIAN_HULL_MAX
        driving = true
        stolenCar.speed = 0
        cash += CARJACK_CASH_REWARD
        setWanted(Math.max(wanted + CARJACK_HEAT, 1))
        jackFlashUntilMs = now + CARJACK_FLASH_MS
        carjackRestoreAtMs = now + CARJACK_HOLD_MS
        missionEl.textContent = CARJACKED_TEXT
        // Witness selection: every pedestrian within the radius panics and shares one
        // pending report; nearest first, capped at three, index as stable tie-break.
        // A fresh jack refreshes any previous group (no stacking)
        clearWitnessState()
        const candidates: { index: number; dist: number }[] = []
        for (let i = 0; i < pedestrians.length; i++) {
          const dist = Math.hypot(player.x - pedestrians[i].x, player.y - pedestrians[i].y)
          if (dist <= WITNESS_RADIUS) candidates.push({ index: i, dist })
        }
        candidates.sort((a, b) => a.dist - b.dist || a.index - b.index)
        witnessIndices = candidates.slice(0, WITNESS_MAX_COUNT).map(c => c.index)
        if (witnessIndices.length > 0) {
          for (const i of witnessIndices) pedestrians[i].panicUntilMs = now + WITNESS_FLEE_MS
          witnessReportDeadlineMs = now + WITNESS_REPORT_MS
        }
      }
    }

    // H inside the safehouse zone clears police heat; banner holds, then the mission line restores
    if (safehouseRequested && Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < SAFEHOUSE.radius) {
      setWanted(0)
      heatCoolStartMs = 0
      clearWitnessState()
      missionEl.textContent = SAFEHOUSE_CLEAR_TEXT
      safehouseRestoreAtMs = now + SAFEHOUSE_HOLD_MS
    }

    // G inside the safehouse buys the next garage tier: sprint kit, armor plate, boost cell
    if (garageRequested && Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < SAFEHOUSE.radius) {
      if (garageUpgradeLevel >= GARAGE_TIERS.length) {
        garageBannerTierText = GARAGE_MAXED_TEXT
        missionEl.textContent = GARAGE_MAXED_TEXT
      } else {
        const tier = GARAGE_TIERS[garageUpgradeLevel]
        garageBannerAfford = cash >= tier.cost
        if (garageBannerAfford) {
          cash -= tier.cost
          // apply the tier's live effect on purchase; tier 1 keeps the classic kit stats
          if (garageUpgradeLevel === 0) {
            courierCar.maxSpeed += GARAGE_TUNE_MAX_SPEED_BONUS
            courierCar.accel += GARAGE_TUNE_ACCEL_BONUS
          }
          garageUpgradeLevel++
          if (garageUpgradeLevel >= 1) garageTuneInstalled = true
          garageBannerTierText = tier.banner
          missionEl.textContent = tier.banner
        } else {
          garageBannerTierText = tier.poor
          missionEl.textContent = tier.poor
        }
      }
      garageRestoreAtMs = now + GARAGE_HOLD_MS
    }
    garageRequested = false

    // T inside the safehouse repairs the courier hull when damaged: $150 flat
    if (repairRequested && carHealth < 100 && Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < SAFEHOUSE.radius) {
      repairBannerAfford = cash >= REPAIR_COST
      if (repairBannerAfford) {
        cash -= REPAIR_COST
        carHealth = 100
        missionEl.textContent = REPAIR_DONE_TEXT
      } else {
        repairPoorRestoreAtMs = now + REPAIR_HOLD_MS
        missionEl.textContent = REPAIR_POOR_TEXT
      }
      repairRestoreAtMs = now + REPAIR_HOLD_MS
    }
    repairRequested = false

    // U on foot at the safehouse buys Crew Cover: $600 flat for 45s of faster heat cooling
    if (crewNetworkRequested && Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < SAFEHOUSE.radius) {
      if (now >= crewCoverUntilMs) {
        if (cash >= CREW_COVER_COST) {
          cash -= CREW_COVER_COST
          crewCoverUntilMs = now + CREW_COVER_DURATION_MS
          missionEl.textContent = CREW_AFFORD_TEXT
          safehouseRestoreAtMs = now + SAFEHOUSE_HOLD_MS
        } else {
          missionEl.textContent = CREW_POOR_TEXT
          safehouseRestoreAtMs = now + SAFEHOUSE_HOLD_MS
        }
      }
    }

    // B near the safehouse accepts the blackout run when no courier contract is active
    const blackoutAcceptable =
      blackoutState === 'available' &&
      contractState !== 'active' &&
      !missionComplete &&
      Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < BLACKOUT_ACCEPT_RADIUS
    if (blackoutRequested && blackoutAcceptable) {
      blackoutState = 'active'
      setWanted(Math.max(1, wanted))
      missionEl.textContent = BLACKOUT_ACTIVE_TEXT
    }

    // N near the safehouse starts the street race when nothing else is running
    const raceAcceptable =
      raceState === 'available' &&
      contractState !== 'active' &&
      blackoutState === 'available' &&
      !missionComplete &&
      Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < RACE_ACCEPT_RADIUS
    if (raceRequested && raceAcceptable) {
      raceState = 'active'
      raceCheckpointIndex = 0
      raceDeadlineMs = now + RACE_TIME_LIMIT_MS
      setWanted(Math.max(1, wanted))
      missionEl.textContent = `${RACE_ACTIVE_BASE_TEXT} // ENTER COURIER — ${Math.ceil(RACE_TIME_LIMIT_MS / 1000)}S`
    }

    // Reaching the grid target starts the getaway: heat stays up, race back on foot
    if (
      blackoutState === 'active' &&
      Math.hypot(player.x - BLACKOUT_TARGET.x, player.y - BLACKOUT_TARGET.y) < BLACKOUT_TARGET.radius
    ) {
      blackoutState = 'escaping'
      blackoutEscapeDeadlineMs = now + BLACKOUT_ESCAPE_MS
      setWanted(Math.max(1, wanted))
      missionEl.textContent = `${BLACKOUT_ESCAPE_BASE_TEXT} — ${Math.ceil(BLACKOUT_ESCAPE_MS / 1000)}S`
    }

    if (blackoutState === 'escaping' && !driving && Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < SAFEHOUSE.radius) {
      blackoutState = 'complete'
      blackoutEscapeDeadlineMs = 0
      blackoutRestoreAtMs = now + BLACKOUT_HOLD_MS
      cash += 400
      rep += 2
      setWanted(0)
      heatCoolStartMs = 0
      missionEl.textContent = BLACKOUT_DONE_TEXT
    }

    // K near the safehouse starts the Bank Run when nothing else is running
    const bankAcceptable =
      bankState === 'available' &&
      contractState !== 'active' &&
      blackoutState === 'available' &&
      raceState === 'available' &&
      !missionComplete &&
      Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < BANK_ACCEPT_RADIUS
    if (bankRequested && bankAcceptable) {
      bankState = 'active'
      setWanted(Math.max(1, wanted))
      missionEl.textContent = BANK_ACTIVE_TEXT
    }

    // On foot inside the vault: loot secured, start the escape deadline
    if (
      bankState === 'active' &&
      !driving &&
      Math.hypot(player.x - BANK_VAULT.x, player.y - BANK_VAULT.y) < BANK_VAULT.radius
    ) {
      bankState = 'escaping'
      bankEscapeDeadlineMs = now + BANK_ESCAPE_MS
      setWanted(Math.max(1, wanted))
      missionEl.textContent = `${BANK_ESCAPE_BASE_TEXT} — ${Math.ceil(BANK_ESCAPE_MS / 1000)}S`
    }

    if (bankState === 'escaping' && !driving && Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < SAFEHOUSE.radius) {
      bankState = 'complete'
      bankEscapeDeadlineMs = 0
      bankRestoreAtMs = now + BANK_HOLD_MS
      cash += 600
      rep += 3
      setWanted(0)
      heatCoolStartMs = 0
      missionEl.textContent = BANK_DONE_TEXT
    }
  }
  courierToggleRequested = false
  safehouseRequested = false
  crewNetworkRequested = false
  blackoutRequested = false
  raceRequested = false
  bankRequested = false

  // VIP Extraction: V at the safehouse accepts; drive to the client, then bring them home
  const vipAcceptable =
    vipState === 'available' &&
    contractState !== 'active' &&
    blackoutState === 'available' &&
    raceState === 'available' &&
    bankState === 'available' &&
    !missionComplete &&
    Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < VIP_ACCEPT_RADIUS
  if (vipRequested && vipAcceptable) {
    vipState = 'pickup'
    vipDeadlineMs = now + VIP_TIME_LIMIT_MS
    setWanted(Math.max(1, wanted))
    missionEl.textContent = VIP_ACTIVE_TEXT
  }

  // Car pickup moment: driving the courier into the client radius starts the getaway
  if (
    vipState === 'pickup' &&
    driving &&
    Math.hypot(courierCar.x - VIP_CLIENT.x, courierCar.y - VIP_CLIENT.y) < VIP_CLIENT.radius
  ) {
    vipState = 'escaping'
    setWanted(Math.max(1, wanted))
    missionEl.textContent = `${VIP_ESCAPE_TEXT} — ${Math.ceil((vipDeadlineMs - now) / 1000)}S`
  }

  // Escaping: deliver the client home by driving the courier into the safehouse radius
  if (
    vipState === 'escaping' &&
    driving &&
    Math.hypot(courierCar.x - SAFEHOUSE.x, courierCar.y - SAFEHOUSE.y) < SAFEHOUSE.radius
  ) {
    vipState = 'complete'
    vipDeadlineMs = 0
    vipRestoreAtMs = now + VIP_HOLD_MS
    cash += 500
    rep += 2
    setWanted(0)
    heatCoolStartMs = 0
    missionEl.textContent = VIP_DONE_TEXT
  }
  vipRequested = false

  // VIP timer: expiring mid-mission safely resets to available with no payout
  if ((vipState === 'pickup' || vipState === 'escaping') && vipDeadlineMs > 0 && now >= vipDeadlineMs) {
    vipState = 'available'
    vipDeadlineMs = 0
    setWanted(0)
    heatCoolStartMs = 0
    missionEl.textContent = VIP_FAILED_TEXT
    vipRestoreAtMs = now + VIP_HOLD_MS
  }

  // C at the safehouse accepts the convoy job when no other mission is running
  const convoyAcceptable =
    convoyState === 'available' &&
    contractState !== 'active' &&
    blackoutState === 'available' &&
    raceState === 'available' &&
    bankState === 'available' &&
    vipState === 'available' &&
    !missionComplete &&
    !driving &&
    Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < CONVOY_ACCEPT_RADIUS
  if (convoyRequested && convoyAcceptable) {
    convoyState = 'active'
    convoyDeadlineMs = now + CONVOY_TIME_LIMIT_MS
    setWanted(Math.max(2, wanted))
    missionEl.textContent = CONVOY_ACTIVE_TEXT
  }
  // Driving the courier into the ambush site and pressing C secures the cargo, starting the getaway with heat kept up
  if (
    convoyState === 'active' &&
    driving &&
    convoyRequested &&
    Math.hypot(courierCar.x - CONVOY_SITE.x, courierCar.y - CONVOY_SITE.y) < CONVOY_SITE.radius
  ) {
    convoyState = 'escaping'
    setWanted(Math.max(2, wanted))
    missionEl.textContent = `${CONVOY_ESCAPE_TEXT} — ${Math.ceil((convoyDeadlineMs - now) / 1000)}S`
  }
  convoyRequested = false

  // Escaping: deliver the cargo home by driving the courier into the safehouse radius
  if (
    convoyState === 'escaping' &&
    driving &&
    Math.hypot(courierCar.x - SAFEHOUSE.x, courierCar.y - SAFEHOUSE.y) < SAFEHOUSE.radius
  ) {
    convoyState = 'complete'
    convoyDeadlineMs = 0
    convoyRestoreAtMs = now + CONVOY_HOLD_MS
    cash += 750
    rep += 3
    setWanted(0)
    heatCoolStartMs = 0
    missionEl.textContent = CONVOY_DONE_TEXT
  }

  // Convoy timer: expiring mid-mission safely resets to available with no payout
  if ((convoyState === 'active' || convoyState === 'escaping') && convoyDeadlineMs > 0 && now >= convoyDeadlineMs) {
    convoyState = 'available'
    convoyDeadlineMs = 0
    setWanted(0)
    heatCoolStartMs = 0
    missionEl.textContent = CONVOY_FAILED_TEXT
    convoyRestoreAtMs = now + CONVOY_HOLD_MS
  }

  // J at the safehouse accepts the Junction Job when no other contract or mission is running
  const jJobAcceptable =
    jJobState === 'available' &&
    contractState !== 'active' &&
    blackoutState === 'available' &&
    raceState === 'available' &&
    bankState === 'available' &&
    vipState === 'available' &&
    convoyState === 'available' &&
    !missionComplete &&
    !driving &&
    Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < J_JOB_ACCEPT_RADIUS
  if (jJobRequested && jJobAcceptable) {
    jJobState = 'active'
    jJobDeadlineMs = now + J_JOB_TIME_LIMIT_MS
    setWanted(Math.max(2, wanted))
    missionEl.textContent = J_JOB_ACTIVE_TEXT
  }
  // Driving the courier into the rival site and pressing J secures the target, starting the getaway with heat kept up
  if (
    jJobState === 'active' &&
    driving &&
    jJobRequested &&
    Math.hypot(courierCar.x - J_JOB_SITE.x, courierCar.y - J_JOB_SITE.y) < J_JOB_SITE.radius
  ) {
    jJobState = 'escaping'
    setWanted(Math.max(2, wanted))
    missionEl.textContent = `${J_JOB_ESCAPE_TEXT} — ${Math.ceil((jJobDeadlineMs - now) / 1000)}S`
  }
  jJobRequested = false

  // Escaping: deliver the secured target home by driving the courier into the safehouse radius
  if (
    jJobState === 'escaping' &&
    driving &&
    Math.hypot(courierCar.x - SAFEHOUSE.x, courierCar.y - SAFEHOUSE.y) < SAFEHOUSE.radius
  ) {
    jJobState = 'complete'
    jJobDeadlineMs = 0
    jJobRestoreAtMs = now + J_JOB_HOLD_MS
    cash += 1000
    rep += 4
    setWanted(0)
    heatCoolStartMs = 0
    missionEl.textContent = J_JOB_DONE_TEXT
  }

  // Junction Job timer: expiring mid-mission safely resets to available with no payout
  if ((jJobState === 'active' || jJobState === 'escaping') && jJobDeadlineMs > 0 && now >= jJobDeadlineMs) {
    jJobState = 'available'
    jJobDeadlineMs = 0
    setWanted(0)
    heatCoolStartMs = 0
    missionEl.textContent = J_JOB_FAILED_TEXT
    jJobRestoreAtMs = now + J_JOB_HOLD_MS
  }

  // X at the safehouse accepts the District Takeover when no other contract or mission is running
  const turfAcceptable =
    turfState === 'available' &&
    contractState !== 'active' &&
    blackoutState === 'available' &&
    raceState === 'available' &&
    bankState === 'available' &&
    vipState === 'available' &&
    convoyState === 'available' &&
    jJobState === 'available' &&
    !missionComplete &&
    !driving &&
    Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < TURF_ACCEPT_RADIUS
  if (turfRequested && turfAcceptable) {
    turfState = 'active'
    turfDeadlineMs = now + TURF_TIME_LIMIT_MS
    resetRivalCrew()
    setWanted(Math.max(2, wanted))
    missionEl.textContent = TURF_ACTIVE_TEXT
  }
  // On foot inside the contested district, pressing X secures the takeover — but only once
  // every rival crew member has been dropped; the pulse bolts (F) are the on-foot weapon
  if (
    turfState === 'active' &&
    !driving &&
    turfRequested &&
    rivalsRemaining() === 0 &&
    Math.hypot(player.x - TURF_SITE.x, player.y - TURF_SITE.y) < TURF_SITE.radius
  ) {
    turfState = 'escaping'
    setWanted(Math.max(2, wanted))
    missionEl.textContent = `${TURF_ESCAPE_TEXT} — ${Math.ceil((turfDeadlineMs - now) / 1000)}S`
  }
  // Showdown acceptance: pressing X at the site while rivals stand resets the one-shot flag
  // so it can be re-pressed after the last crew member falls, without touching other missions
  if (turfState === 'active' && !driving && turfRequested && rivalsRemaining() > 0) {
    const atSite = Math.hypot(player.x - TURF_SITE.x, player.y - TURF_SITE.y) < TURF_SITE.radius
    if (atSite) missionEl.textContent = `${TURF_SHOWDOWN_TEXT} — ${rivalsRemaining()} LEFT`
  }
  turfRequested = false

  // Rival crew pursuit: alive members slowly chase the on-foot player only while the takeover
  // is active; they hold their arena around the district site otherwise (never pursue in a car)
  if (turfState === 'active' && !driving && !missionComplete) {
    for (const rival of rivalCrew) {
      if (rival.hp <= 0) continue
      const ang = Math.atan2(player.y - rival.y, player.x - rival.x)
      rival.x += Math.cos(ang) * RIVAL_PURSUIT_SPEED * dt
      rival.y += Math.sin(ang) * RIVAL_PURSUIT_SPEED * dt
      const dxArena = rival.x - TURF_SITE.x
      const dyArena = rival.y - TURF_SITE.y
      const dist = Math.hypot(dxArena, dyArena)
      if (dist > RIVAL_ARENA_RADIUS) {
        rival.x = TURF_SITE.x + (dxArena / dist) * RIVAL_ARENA_RADIUS
        rival.y = TURF_SITE.y + (dyArena / dist) * RIVAL_ARENA_RADIUS
      }
    }
  }

  // Escaping: return home on foot inside the safehouse radius to lock the district in
  if (turfState === 'escaping' && !driving && Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < SAFEHOUSE.radius) {
    turfState = 'complete'
    turfDeadlineMs = 0
    turfRestoreAtMs = now + TURF_HOLD_MS
    cash += 1200
    rep += 5
    setWanted(0)
    heatCoolStartMs = 0
    missionEl.textContent = TURF_DONE_TEXT
  }

  // District Takeover timer: expiring mid-takeover safely resets to available with no payout
  if ((turfState === 'active' || turfState === 'escaping') && turfDeadlineMs > 0 && now >= turfDeadlineMs) {
    turfState = 'available'
    turfDeadlineMs = 0
    setWanted(0)
    heatCoolStartMs = 0
    missionEl.textContent = TURF_FAILED_TEXT
    turfRestoreAtMs = now + TURF_HOLD_MS
  }

  // O at the safehouse accepts Smuggler Run when no other contract or mission is running
  const smugglerAcceptable =
    smugglerState === 'available' &&
    contractState !== 'active' &&
    blackoutState === 'available' &&
    raceState === 'available' &&
    bankState === 'available' &&
    vipState === 'available' &&
    convoyState === 'available' &&
    jJobState === 'available' &&
    turfState === 'available' &&
    !missionComplete &&
    !driving &&
    Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < SMUGGLER_ACCEPT_RADIUS
  if (smugglerRequested && smugglerAcceptable) {
    smugglerState = 'pickup'
    smugglerDeadlineMs = now + SMUGGLER_TIME_LIMIT_MS
    missionEl.textContent = `${SMUGGLER_ACTIVE_TEXT} — ${Math.ceil(SMUGGLER_TIME_LIMIT_MS / 1000)}S`
  }

  // Drive the courier into the pickup site and press O to secure the package; heat rises to at least 2
  if (
    smugglerState === 'pickup' &&
    driving &&
    smugglerRequested &&
    Math.hypot(courierCar.x - SMUGGLER_PICKUP_SITE.x, courierCar.y - SMUGGLER_PICKUP_SITE.y) < SMUGGLER_PICKUP_SITE.radius
  ) {
    smugglerState = 'drop'
    setWanted(Math.max(2, wanted))
    missionEl.textContent = `${SMUGGLER_PICKUP_TEXT} — ${Math.ceil((smugglerDeadlineMs - now) / 1000)}S`
  }

  // Drive the courier into the drop site and press O to deliver: +$900 / +REP 4
  if (
    smugglerState === 'drop' &&
    driving &&
    smugglerRequested &&
    Math.hypot(courierCar.x - SMUGGLER_DROP_SITE.x, courierCar.y - SMUGGLER_DROP_SITE.y) < SMUGGLER_DROP_SITE.radius
  ) {
    smugglerState = 'complete'
    smugglerDeadlineMs = 0
    smugglerRestoreAtMs = now + SMUGGLER_HOLD_MS
    cash += 900
    rep += 4
    setWanted(0)
    heatCoolStartMs = 0
    missionEl.textContent = SMUGGLER_DONE_TEXT
  }
  smugglerRequested = false

  // Smuggler Run timer: expiring mid-run safely returns to available with no payout
  if ((smugglerState === 'pickup' || smugglerState === 'drop') && smugglerDeadlineMs > 0 && now >= smugglerDeadlineMs) {
    smugglerState = 'available'
    smugglerDeadlineMs = 0
    setWanted(0)
    heatCoolStartMs = 0
    missionEl.textContent = SMUGGLER_LOST_TEXT
    smugglerRestoreAtMs = now + SMUGGLER_HOLD_MS
  }

  // I at the safehouse accepts Chop Shop when no other contract or mission is running
  const chopShopAcceptable =
    chopShopState === 'available' &&
    contractState !== 'active' &&
    blackoutState === 'available' &&
    raceState === 'available' &&
    bankState === 'available' &&
    vipState === 'available' &&
    convoyState === 'available' &&
    jJobState === 'available' &&
    turfState === 'available' &&
    smugglerState === 'available' &&
    !missionComplete &&
    !driving &&
    Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < CHOP_SHOP_ACCEPT_RADIUS
  if (chopShopRequested && chopShopAcceptable) {
    chopShopState = 'steal'
    chopShopDeadlineMs = now + CHOP_SHOP_TIME_LIMIT_MS
    missionEl.textContent = `${CHOP_SHOP_ACTIVE_TEXT} — ${Math.ceil(CHOP_SHOP_TIME_LIMIT_MS / 1000)}S`
  }

  // Drive the courier into the target site and press I to strip the vehicle; heat rises to at least 2
  if (
    chopShopState === 'steal' &&
    driving &&
    chopShopRequested &&
    Math.hypot(courierCar.x - CHOP_SHOP_SITE.x, courierCar.y - CHOP_SHOP_SITE.y) < CHOP_SHOP_SITE.radius
  ) {
    chopShopState = 'return'
    setWanted(Math.max(2, wanted))
    missionEl.textContent = `${CHOP_SHOP_STOLEN_TEXT} — ${Math.ceil((chopShopDeadlineMs - now) / 1000)}S`
  }

  // Drive the courier into the safehouse and press I to deliver: +$1400 / +REP 5
  if (
    chopShopState === 'return' &&
    driving &&
    chopShopRequested &&
    Math.hypot(courierCar.x - SAFEHOUSE.x, courierCar.y - SAFEHOUSE.y) < SAFEHOUSE.radius
  ) {
    chopShopState = 'complete'
    chopShopDeadlineMs = 0
    chopShopRestoreAtMs = now + CHOP_SHOP_HOLD_MS
    cash += 1400
    rep += 5
    setWanted(0)
    heatCoolStartMs = 0
    missionEl.textContent = CHOP_SHOP_DONE_TEXT
  }
  chopShopRequested = false

  // Black Market Stash: one-shot on-foot grab inside the crate radius pays +$200/+1 rep,
  // raises the banner, and permanently clears the marker for the rest of the run
  if (stashRequested && !stashCollected && !driving) {
    if (Math.hypot(player.x - STASH_SITE.x, player.y - STASH_SITE.y) < STASH_SITE.radius) {
      stashCollected = true
      cash += STASH_CASH_REWARD
      rep += STASH_REP_REWARD
      stashRestoreAtMs = now + STASH_HOLD_MS
      missionEl.textContent = STASH_SECURED_TEXT
    }
  }
  stashRequested = false

  // Kingpin Network epilogue activation: one-shot on-foot Y inside the node radius
  // after the run completes pays +$500/+3 rep and takes the network online
  if (kingpinRequested) {
    kingpinRequested = false
    if (missionComplete && !kingpinOnline && playerNearKingpinNode()) {
      kingpinOnline = true
      cash += KINGPIN_CASH_REWARD
      rep += KINGPIN_REP_REWARD
      kingpinRestoreAtMs = now + KINGPIN_HOLD_MS
      missionEl.textContent = KINGPIN_ONLINE_TEXT
    }
  }

  // Kingpin contract beats: accept via Digit0, secure the vault on foot (heat +2),
  // then deliver at the safehouse on foot for +$750/+4 rep
  if (networkJobRequested) {
    networkJobRequested = false
    if (kingpinOnline && networkJobState === 'available' && missionComplete) {
      networkJobState = 'active'
      networkNoticeText = 'NETWORK SWEEP // REACH THE DATA VAULT'
      networkNoticeUntilMs = now + KINGPIN_HOLD_MS
      missionEl.textContent = networkNoticeText
    }
  }
  if (networkSecureRequested) {
    networkSecureRequested = false
    if (kingpinOnline && networkJobState === 'active' && playerNearNetworkVault()) {
      networkJobState = 'returning'
      setWanted(wanted + 2)
      networkNoticeText = 'NETWORK SWEEP // DATA SECURED // RETURN TO SAFEHOUSE'
      networkNoticeUntilMs = now + KINGPIN_HOLD_MS
      missionEl.textContent = networkNoticeText
    }
  }
  if (networkDeliverRequested) {
    networkDeliverRequested = false
    if (kingpinOnline && networkJobState === 'returning' && playerAtSafehouse()) {
      networkJobState = 'complete'
      cash += 750
      rep += 4
      setWanted(0)
      networkNoticeText = 'NETWORK CONTRACT // DELIVERED +$750 // REP +4'
      networkNoticeUntilMs = now + KINGPIN_HOLD_MS
      missionEl.textContent = networkNoticeText
    }
  }

  // District Control beats: accept via Digit0 once unlocked, secure the current district
  // on foot (wanted rises to at least 2), then deliver home for +$1500/+5 and advance.
  // After the third district no further accepts occur and free roam stays stable
  if (districtAcceptRequested) {
    districtAcceptRequested = false
    if (
      districtControlUnlocked() &&
      districtControlState === 'available' &&
      districtControlIndex < DISTRICT_CONTROL_SITES.length
    ) {
      districtControlState = 'active'
      const site = currentDistrictSite()
      districtNoticeText = `DISTRICT CONTROL // MOVE ON ${site.name}`
      districtNoticeUntilMs = now + KINGPIN_HOLD_MS
      missionEl.textContent = districtNoticeText
    }
  }
  if (districtSecureRequested) {
    districtSecureRequested = false
    if (
      districtControlState === 'active' &&
      districtControlIndex < DISTRICT_CONTROL_SITES.length &&
      playerNearDistrictTarget()
    ) {
      districtControlState = 'returning'
      setWanted(Math.max(2, wanted))
      const site = currentDistrictSite()
      districtNoticeText = `DISTRICT CONTROL // ${site.name} SECURED // RETURN TO SAFEHOUSE`
      districtNoticeUntilMs = now + KINGPIN_HOLD_MS
      missionEl.textContent = districtNoticeText
    }
  }
  if (districtDeliverRequested) {
    districtDeliverRequested = false
    if (districtControlState === 'returning' && playerAtSafehouse()) {
      cash += 1500
      rep += 5
      setWanted(0)
      districtControlIndex++
      if (districtControlIndex >= DISTRICT_CONTROL_SITES.length) {
        districtNoticeText = 'DISTRICT CONTROL // ALL DISTRICTS CAPTURED 3/3 // THE CITY IS YOURS'
        districtControlState = 'available'
      } else {
        districtNoticeText = `DISTRICT CONTROL // ${districtControlIndex}/${DISTRICT_CONTROL_SITES.length} CAPTURED // NEXT: ${currentDistrictSite().name}`
        districtControlState = 'available'
      }
      districtNoticeUntilMs = now + KINGPIN_HOLD_MS
      missionEl.textContent = districtNoticeText
    }
  }

  // Chop Shop timer: expiring mid-job safely returns to available with no payout
  if ((chopShopState === 'steal' || chopShopState === 'return') && chopShopDeadlineMs > 0 && now >= chopShopDeadlineMs) {
    chopShopState = 'available'
    chopShopDeadlineMs = 0
    setWanted(0)
    heatCoolStartMs = 0
    missionEl.textContent = CHOP_SHOP_LOST_TEXT
    chopShopRestoreAtMs = now + CHOP_SHOP_HOLD_MS
  }

  // Bank Run timer: expiring mid-escape safely resets to available with no payout
  if (bankState === 'escaping' && bankEscapeDeadlineMs > 0 && now >= bankEscapeDeadlineMs) {
    bankState = 'available'
    bankEscapeDeadlineMs = 0
    setWanted(0)
    heatCoolStartMs = 0
    missionEl.textContent = BANK_FAILED_TEXT
    bankRestoreAtMs = now + BANK_HOLD_MS
  }

  // Race timer: expiring mid-race safely resets to available with no payout
  if (raceState === 'active' && raceDeadlineMs > 0 && now >= raceDeadlineMs) {
    raceState = 'available'
    raceCheckpointIndex = 0
    raceDeadlineMs = 0
    setWanted(0)
    heatCoolStartMs = 0
    missionEl.textContent = RACE_EXPIRED_TEXT
    raceRestoreAtMs = now + RACE_HOLD_MS
  }

  // P stores durable campaign progress; L restores it (transient state always resets)
  if (saveRequested) {
    saveBannerText = writeSave() ? SAVE_STORED_TEXT : SAVE_NO_SLOT_TEXT
    saveRestoreAtMs = now + SAVE_HOLD_MS
    missionEl.textContent = saveBannerText
  }
  if (loadRequested) {
    const data = readSave()
    if (data) {
      resetRun(now)
      signalsFound = Math.max(0, Math.min(signals.length, data.signalsFound))
      signalEls.count.textContent = String(signalsFound)
      signalEls.complete.hidden = signalsFound < signals.length
      cash = Number.isFinite(data.cash) ? data.cash : 0
      rep = Number.isFinite(data.rep) ? data.rep : 0
      missionComplete = data.missionComplete
      runCompleteEl.hidden = !missionComplete
      blackoutState = data.blackoutCompleted ? 'complete' : 'available'
      kingpinOnline = data.kingpinOnline === true && missionComplete
      networkJobState = kingpinOnline && data.networkJobComplete === true ? 'complete' : 'available'
      if (kingpinOnline) {
        districtControlIndex = Math.max(0, Math.min(DISTRICT_CONTROL_SITES.length, data.districtsControlled ?? 0))
      } else {
        districtControlIndex = 0
      }
      const restoredGarageLevel =
        typeof data.garageUpgradeLevel === 'number' ? data.garageUpgradeLevel : (data.garageTuneInstalled ? 1 : 0)
      garageUpgradeLevel = Math.max(0, Math.min(GARAGE_TIERS.length, restoredGarageLevel))
      garageTuneInstalled = garageUpgradeLevel >= 1
      if (garageUpgradeLevel >= 1) {
        courierCar.maxSpeed += GARAGE_TUNE_MAX_SPEED_BONUS
        courierCar.accel += GARAGE_TUNE_ACCEL_BONUS
      }
      if (typeof data.carHealth === 'number' && Number.isFinite(data.carHealth)) {
        carHealth = Math.max(0, Math.min(100, data.carHealth))
      }
      if (
        typeof data.carX === 'number' && Number.isFinite(data.carX) &&
        typeof data.carY === 'number' && Number.isFinite(data.carY)
      ) {
        courierCar.x = Math.max(24, Math.min(WORLD_W - 24, data.carX))
        courierCar.y = Math.max(24, Math.min(WORLD_H - 24, data.carY))
      }
      if (typeof data.carAngle === 'number' && Number.isFinite(data.carAngle)) courierCar.angle = data.carAngle
      stashCollected = data.stashCollected === true
      nightShiftEnabled = data.nightShiftEnabled === true
      saveBannerText = SAVE_LOADED_TEXT
    } else {
      saveBannerText = SAVE_NO_SLOT_TEXT
    }
    saveRestoreAtMs = now + SAVE_HOLD_MS
    missionEl.textContent = saveBannerText
  }
  saveRequested = false
  loadRequested = false

  // Delivery timer: expiring mid-run safely aborts the contract and cools heat
  if (contractState === 'active' && contractDeadlineMs > 0 && now >= contractDeadlineMs) {
    if (driving) {
      driving = false
      player.x = Math.max(player.size, Math.min(WORLD_W - player.size, courierCar.x + Math.cos(courierCar.angle) * 36))
      player.y = Math.max(player.size, Math.min(WORLD_H - player.size, courierCar.y + Math.sin(courierCar.angle) * 36))
      courierCar.speed = 0
    }
    contractState = 'available'
    contractDeadlineMs = 0
    setWanted(0)
    heatCoolStartMs = 0
    missionEl.textContent = DELIVERY_FAILED_TEXT
    contractFailRestoreAtMs = now + CONTRACT_FAIL_HOLD_MS
  }

  // Escape timer: running out the getaway safely fails the Blackout Run with no payout
  if (blackoutState === 'escaping' && blackoutEscapeDeadlineMs > 0 && now >= blackoutEscapeDeadlineMs) {
    blackoutState = 'available'
    blackoutEscapeDeadlineMs = 0
    setWanted(0)
    heatCoolStartMs = 0
    missionEl.textContent = BLACKOUT_FAILED_TEXT
    blackoutRestoreAtMs = now + BLACKOUT_HOLD_MS
  }

  // Shared countdown readout for the mission line and courier HUD
  const deliveryTimeLeftSec =
    contractState === 'active' && contractDeadlineMs > 0
      ? Math.max(0, Math.ceil((contractDeadlineMs - now) / 1000))
      : null

  // Shared escape countdown readout for the mission line during the getaway phase
  const escapeTimeLeftSec =
    blackoutState === 'escaping' && blackoutEscapeDeadlineMs > 0
      ? Math.max(0, Math.ceil((blackoutEscapeDeadlineMs - now) / 1000))
      : null

  // Shared race countdown readout for the mission line during the sprint
  const raceTimeLeftSec =
    raceState === 'active' && raceDeadlineMs > 0
      ? Math.max(0, Math.ceil((raceDeadlineMs - now) / 1000))
      : null

  // Shared Bank Run escape countdown readout for the mission line
  const bankEscapeTimeLeftSec =
    bankState === 'escaping' && bankEscapeDeadlineMs > 0
      ? Math.max(0, Math.ceil((bankEscapeDeadlineMs - now) / 1000))
      : null

  // Shared VIP countdown readout (pickup + escape share one 50s deadline)
  const vipTimeLeftSec =
    (vipState === 'pickup' || vipState === 'escaping') && vipDeadlineMs > 0
      ? Math.max(0, Math.ceil((vipDeadlineMs - now) / 1000))
      : null

  // Shared convoy countdown readout (approach + getaway share one 65s deadline)
  const convoyTimeLeftSec =
    (convoyState === 'active' || convoyState === 'escaping') && convoyDeadlineMs > 0
      ? Math.max(0, Math.ceil((convoyDeadlineMs - now) / 1000))
      : null

  // Shared Junction Job countdown readout (approach + getaway share one 70s deadline)
  const jJobTimeLeftSec =
    (jJobState === 'active' || jJobState === 'escaping') && jJobDeadlineMs > 0
      ? Math.max(0, Math.ceil((jJobDeadlineMs - now) / 1000))
      : null

  // Shared District Takeover countdown readout (approach + getaway share one 75s deadline)
  const turfTimeLeftSec =
    (turfState === 'active' || turfState === 'escaping') && turfDeadlineMs > 0
      ? Math.max(0, Math.ceil((turfDeadlineMs - now) / 1000))
      : null

  // Shared Smuggler Run countdown readout (pickup + delivery share one 80s deadline)
  const smugglerTimeLeftSec =
    (smugglerState === 'pickup' || smugglerState === 'drop') && smugglerDeadlineMs > 0
      ? Math.max(0, Math.ceil((smugglerDeadlineMs - now) / 1000))
      : null

  // Shared Chop Shop countdown readout (strip + return share one 85s deadline)
  const chopShopTimeLeftSec =
    (chopShopState === 'steal' || chopShopState === 'return') && chopShopDeadlineMs > 0
      ? Math.max(0, Math.ceil((chopShopDeadlineMs - now) / 1000))
      : null

  camera.x = Math.max(0, Math.min(Math.max(0, WORLD_W - w), player.x - w / 2))
  camera.y = Math.max(0, Math.min(Math.max(0, WORLD_H - h), player.y - h / 2))
  // Overdrive impact: visual-only shake applied after clamping so world/player coords stay untouched
  if (driving && now < overdriveImpactUntilMs) {
    camera.x += (Math.random() * 2 - 1) * 5
    camera.y += (Math.random() * 2 - 1) * 5
  }
  if (!driving && moving) facing = { dx: dx / len, dy: dy / len }

  const pct = boost.energy.toFixed(0)
  boostEls.fill.style.width = `${pct}%`
  const overdriveImpact = now < overdriveImpactUntilMs
  boostEls.state.textContent = overdriveImpact
    ? 'IMPACT'
    : boost.active
      ? 'ACTIVE'
      : boost.cooldown
        ? 'RECHARGING'
        : 'READY'
  boostEls.fill.classList.toggle('is-active', boost.active)
  boostEls.fill.classList.toggle('is-cooling', boost.cooldown)

  if (jammer.cooldown > 0) jammer.cooldown = Math.max(0, jammer.cooldown - dt)

  // Drone patrol/chase + contact
  let nearestDrone: (typeof drones)[number] | null = null
  let nearestDist = Infinity
  for (const d of drones) {
    const disabled = now < d.disabledUntil
    const chaseSpeed = 150 + wanted * 22
    let distToPlayer = Math.hypot(player.x - d.x, player.y - d.y)
    if (!disabled) {
      if (wanted > 0 && distToPlayer < 520) {
        const ang = Math.atan2(player.y - d.y, player.x - d.x)
        d.x += Math.cos(ang) * chaseSpeed * dt
        d.y += Math.sin(ang) * chaseSpeed * dt
        d.angle = ang
      } else {
        d.angle += d.speed * dt
        d.x += Math.cos(d.angle) * 60 * dt
        d.y += Math.sin(d.angle) * 40 * dt
      }
      d.x = Math.max(30, Math.min(WORLD_W - 30, d.x))
      d.y = Math.max(WORLD_H * 0.62, Math.min(WORLD_H - 30, d.y))
      distToPlayer = Math.hypot(player.x - d.x, player.y - d.y)
      if (distToPlayer < 30 && !disabled && !missionComplete) {
        setWanted(wanted - 1)
        heatCoolStartMs = 0
        player.x = WORLD_W / 2
        player.y = WORLD_H / 2
        d.disabledUntil = now + 1200
        d.x = Math.max(40, d.x - 220)
      }
    }
    if (distToPlayer < nearestDist) {
      nearestDist = distToPlayer
      nearestDrone = d
    }
  }

  // Police scan target: nearest drone that is actively hunting (wanted > 0, not disabled)
  let scanDrone: (typeof drones)[number] | null = null
  let scanDist = Infinity
  if (wanted > 0) {
    for (const d of drones) {
      if (now < d.disabledUntil) continue
      const dist = Math.hypot(player.x - d.x, player.y - d.y)
      if (dist < scanDist) {
        scanDist = dist
        scanDrone = d
      }
    }
  }

  // Police cruisers: hunt while wanted > 0, otherwise drift home and stay hidden
  const pursuitActive = wanted > 0
  for (const u of policeUnits) {
    if (pursuitActive) {
      const ang = Math.atan2(player.y - u.y, player.x - u.x)
      let diff = ang - u.angle
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      u.angle += Math.max(-2.5 * dt, Math.min(2.5 * dt, diff))
      const chaseSpeed = u.speed + wanted * 25
      u.x += Math.cos(ang) * chaseSpeed * dt
      u.y += Math.sin(ang) * chaseSpeed * dt
    } else {
      const homeAng = Math.atan2(u.homeY - u.y, u.homeX - u.x)
      if (Math.hypot(u.homeX - u.x, u.homeY - u.y) > 4) {
        u.x += Math.cos(homeAng) * 90 * dt
        u.y += Math.sin(homeAng) * 90 * dt
        u.angle = homeAng - Math.PI / 2
      }
    }
    u.x = Math.max(24, Math.min(WORLD_W - 24, u.x))
    u.y = Math.max(WORLD_H * 0.62, Math.min(WORLD_H - 30, u.y))
  }

  // Police impact: cruiser rams the driving courier — fixed damage, shared cooldown, capped heat
  if (driving && wanted > 0 && now >= policeHitCooldownUntilMs) {
    for (const u of policeUnits) {
      if (Math.hypot(courierCar.x - u.x, courierCar.y - u.y) < 34) {
        courierCar.speed *= -0.25
        setWanted(Math.min(3, wanted + 1))
        carHealth = Math.max(0, carHealth - POLICE_HIT_DAMAGE * (garageUpgradeLevel >= 2 ? ARMOR_DAMAGE_MULTIPLIER : 1))
        policeHitUntilMs = now + POLICE_HIT_HOLD_MS
        policeHitCooldownUntilMs = now + POLICE_HIT_COOLDOWN_MS
        policeHitRestoreAtMs = now + POLICE_HIT_HOLD_MS
        missionEl.textContent = POLICE_IMPACT_TEXT
        if (carHealth <= 0) {
          driving = false
          player.x = Math.max(player.size, Math.min(WORLD_W - player.size, courierCar.x + Math.cos(courierCar.angle) * 36))
          player.y = Math.max(player.size, Math.min(WORLD_H - player.size, courierCar.y + Math.sin(courierCar.angle) * 36))
          courierCar.speed = 0
          missionEl.textContent = VEHICLE_DISABLED_TEXT
          vehicleDisabledRestoreAtMs = now + VEHICLE_DISABLED_HOLD_MS
        }
        break
      }
    }
  }

  // Roadblock escalation: deterministic single interceptor while driving under heavy heat in a live mission.
  // Spawn sits on the stable leading edge of the current camera view toward the car's travel direction;
  // deactivation is fully hidden/reset whenever heat drops, the mission ends, the player exits, or resetRun runs.
  // The active car — courier or stolen ride — is the pursuit target
  const roadblockShouldEngage = driving && wanted >= ROADBLOCK_WANTED_MIN && roadblockMissionRunning()
  if (roadblockShouldEngage) {
    if (!roadblock.active) {
      // stable spawn: far edge of the live camera view along the car's travel direction,
      // nudged just past the frame so the response slides into view instead of popping in
      const leadX = Math.sin(courierCar.angle)
      const leadY = -Math.cos(courierCar.angle)
      const edgeX = leadX >= 0 ? camera.x + w - 60 : camera.x + 60
      const edgeY = leadY >= 0 ? camera.y + h - 60 : camera.y + 60
      roadblock.x = Math.max(40, Math.min(WORLD_W - 40, edgeX + leadX * 70))
      roadblock.y = Math.max(40, Math.min(WORLD_H - 40, edgeY + leadY * 70))
      roadblock.angle = Math.atan2(courierCar.y - roadblock.y, courierCar.x - roadblock.x) + Math.PI / 2
      roadblock.active = true
    }
    // lightweight pursuit: fixed speed and turn rate steering at the car hull
    const ang = Math.atan2(courierCar.y - roadblock.y, courierCar.x - roadblock.x)
    let diff = ang - (roadblock.angle - Math.PI / 2)
    while (diff > Math.PI) diff -= Math.PI * 2
    while (diff < -Math.PI) diff += Math.PI * 2
    roadblock.angle += Math.max(-ROADBLOCK_TURN_RATE * dt, Math.min(ROADBLOCK_TURN_RATE * dt, diff))
    roadblock.x += Math.cos(roadblock.angle - Math.PI / 2) * ROADBLOCK_PURSUIT_SPEED * dt
    roadblock.y += Math.sin(roadblock.angle - Math.PI / 2) * ROADBLOCK_PURSUIT_SPEED * dt
    roadblock.x = Math.max(24, Math.min(WORLD_W - 24, roadblock.x))
    roadblock.y = Math.max(WORLD_H * 0.62, Math.min(WORLD_H - 30, roadblock.y))

    // impact reuses the police-impact semantics through the shared cooldown: one capped hull/heat hit per window.
    // Stolen rides take it on their own lighter hull; a wrecked one ejects you beside it
    if (now >= policeHitCooldownUntilMs && Math.hypot(courierCar.x - roadblock.x, courierCar.y - roadblock.y) < 34) {
      courierCar.speed *= -0.25
      setWanted(Math.min(3, wanted + 1))
      if (isStolenRide()) {
        stolenHull = Math.max(0, stolenHull - POLICE_HIT_DAMAGE)
        policeHitUntilMs = now + POLICE_HIT_HOLD_MS
        policeHitCooldownUntilMs = now + POLICE_HIT_COOLDOWN_MS
        policeHitRestoreAtMs = now + POLICE_HIT_HOLD_MS
        missionEl.textContent = `STOLEN RIDE // HULL ${stolenHull}%`
        if (stolenHull <= 0) bailOutOfStolenCar(now)
      } else {
        carHealth = Math.max(0, carHealth - POLICE_HIT_DAMAGE * (garageUpgradeLevel >= 2 ? ARMOR_DAMAGE_MULTIPLIER : 1))
        policeHitUntilMs = now + POLICE_HIT_HOLD_MS
        policeHitCooldownUntilMs = now + POLICE_HIT_COOLDOWN_MS
        policeHitRestoreAtMs = now + POLICE_HIT_HOLD_MS
        missionEl.textContent = POLICE_IMPACT_TEXT
        if (carHealth <= 0) {
          driving = false
          player.x = Math.max(player.size, Math.min(WORLD_W - player.size, courierCar.x + Math.cos(courierCar.angle) * 36))
          player.y = Math.max(player.size, Math.min(WORLD_H - player.size, courierCar.y + Math.sin(courierCar.angle) * 36))
          courierCar.speed = 0
          missionEl.textContent = VEHICLE_DISABLED_TEXT
          vehicleDisabledRestoreAtMs = now + VEHICLE_DISABLED_HOLD_MS
        }
      }
    }
  } else {
    resetRoadblock()
  }

  // Air support escalation: enters once per wanted-3 engagement from the live camera edge,
  // then shadows the courier at capped speed/turn with a stand-off radius so it can never
  // force a hit loop; it is a pressure-and-visibility layer, not a damage source
  const airUnitShouldEngage = driving && wanted >= AIR_UNIT_WANTED_MIN && roadblockMissionRunning()
  if (airUnitShouldEngage) {
    if (!airUnit.active) {
      // stable entry: camera edge opposite the car's travel direction so the rotor sound
      // arrives from behind the escape line, mirroring real pursuit aviation doctrine
      const leadX = Math.sin(courierCar.angle)
      const leadY = -Math.cos(courierCar.angle)
      const edgeX = leadX >= 0 ? camera.x + 60 : camera.x + w - 60
      const edgeY = leadY >= 0 ? camera.y + 60 : camera.y + h - 60
      airUnit.x = Math.max(40, Math.min(WORLD_W - 40, edgeX - leadX * 70))
      airUnit.y = Math.max(40, Math.min(WORLD_H - 40, edgeY - leadY * 70))
      airUnit.active = true
    }
    // intercept steering toward a stand-off ring around the courier: inside the ring the unit
    // holds position instead of pushing through, which bounds the encounter deterministically
    const dxAir = courierCar.x - airUnit.x
    const dyAir = courierCar.y - airUnit.y
    const distAir = Math.hypot(dxAir, dyAir) || 1
    const desiredAng =
      distAir > AIR_UNIT_STANDOFF ? Math.atan2(dyAir, dxAir) : Math.atan2(-dyAir, -dxAir)
    let airDiff = desiredAng - airUnit.angle
    while (airDiff > Math.PI) airDiff -= Math.PI * 2
    while (airDiff < -Math.PI) airDiff += Math.PI * 2
    airUnit.angle += Math.max(-AIR_UNIT_TURN_RATE * dt, Math.min(AIR_UNIT_TURN_RATE * dt, airDiff))
    const airStep = distAir > AIR_UNIT_STANDOFF ? AIR_UNIT_SPEED : 60
    airUnit.x += Math.cos(airUnit.angle) * airStep * dt
    airUnit.y += Math.sin(airUnit.angle) * airStep * dt
    airUnit.x = Math.max(30, Math.min(WORLD_W - 30, airUnit.x))
    airUnit.y = Math.max(30, Math.min(WORLD_H - 30, airUnit.y))
  } else {
    resetAirUnit()
  }

  // Heat cooling: after 7s continuously clear of all active hunters' scan range, shed one level
  // Active Crew Cover compresses that window to a faster decay without touching mission timers or payouts
  const heatCoolRequiredMs = now < crewCoverUntilMs ? CREW_COVER_FAST_HEAT_COOL_MS : HEAT_COOL_MS
  const hunterInRange =
    wanted > 0 &&
    drones.some(d => now >= d.disabledUntil && Math.hypot(player.x - d.x, player.y - d.y) < POLICE_SCAN_RADIUS)
  if (wanted <= 0 || hunterInRange) {
    heatCoolStartMs = 0
  } else if (heatCoolStartMs === 0) {
    heatCoolStartMs = now
  } else if (now - heatCoolStartMs >= heatCoolRequiredMs) {
    setWanted(wanted - 1)
    heatCoolStartMs = wanted > 0 ? now : 0
    heatCoolRestoreAtMs = now + HEAT_COOL_HOLD_MS
    missionEl.textContent = HEAT_COOLING_TEXT
  }

  // Jammer pulse on Q: disables nearest drone in range, cools heat by 1.
  // A pending witness report jams instantly and the whole group calms; drone/heat logic untouched
  if (jammer.requested) {
    jammer.requested = false
    if (witnessReportDeadlineMs > 0) {
      clearWitnessState()
      witnessJammedRestoreAtMs = now + JAM_HOLD_MS
      missionEl.textContent = WITNESS_JAMMED_TEXT
    }
    if (jammer.cooldown <= 0) {
      jammer.cooldown = 3.5
      jammer.active = now + 420
      if (wanted > 0 && nearestDrone && nearestDist < jammer.radius) {
        nearestDrone.disabledUntil = now + jammer.duration * 1000
        setWanted(wanted - 1)
        heatCoolStartMs = 0
      }
    }
  }
  const jammerRingVisible = now < jammer.active

  // Pulse weapon on F: bolt in facing direction, max 6 live bolts
  if (pulse.cooldown > 0) pulse.cooldown = Math.max(0, pulse.cooldown - dt)
  if (pulse.requested) {
    pulse.requested = false
    if (pulse.cooldown <= 0 && pulse.bolts.length < pulse.max) {
      pulse.cooldown = pulse.rate
      pulse.flashUntil = now + 90
      pulse.bolts.push({ x: player.x + facing.dx * 20, y: player.y + facing.dy * 20, dx: facing.dx, dy: facing.dy })
    }
  }
  for (let i = pulse.bolts.length - 1; i >= 0; i--) {
    const b = pulse.bolts[i]
    b.x += b.dx * pulse.speed * dt
    b.y += b.dy * pulse.speed * dt
    if (b.x < -20 || b.x > WORLD_W + 20 || b.y < -20 || b.y > WORLD_H + 20) {
      pulse.bolts.splice(i, 1)
      continue
    }
    for (const d of drones) {
      if (now >= d.disabledUntil && Math.hypot(b.x - d.x, b.y - d.y) < 18) {
        d.disabledUntil = now + jammer.duration * 1000
        setWanted(wanted - 1)
        heatCoolStartMs = 0
        pulse.bolts.splice(i, 1)
        break
      }
    }
    // Rival showdown: a bolt hit costs the struck member one hp, flashes, and removes the bolt
    for (const rival of rivalCrew) {
      if (rival.hp <= 0) continue
      if (Math.hypot(b.x - rival.x, b.y - rival.y) < RIVAL_HIT_RADIUS) {
        rival.hp = Math.max(0, rival.hp - 1)
        rival.hitFlashUntilMs = now + 140
        pulse.bolts.splice(i, 1)
        break
      }
    }
  }
  const pulseState = pulse.cooldown > 0 ? 'COOLDOWN' : 'READY'
  if (pulseEls.state.textContent !== pulseState) pulseEls.state.textContent = pulseState

  // Hand the mission line back to the campaign once temporary banners expire
  if (contractState === 'complete' && contractRestoreAtMs > 0 && now >= contractRestoreAtMs) {
    contractRestoreAtMs = 0
  }
  if (contractFailRestoreAtMs > 0 && now >= contractFailRestoreAtMs) {
    contractFailRestoreAtMs = 0
  }
  if (trafficHitRestoreAtMs > 0 && now >= trafficHitRestoreAtMs) {
    trafficHitRestoreAtMs = 0
  }
  if (safehouseRestoreAtMs > 0 && now >= safehouseRestoreAtMs) {
    safehouseRestoreAtMs = 0
  }
  if (garageRestoreAtMs > 0 && now >= garageRestoreAtMs) {
    garageRestoreAtMs = 0
    garageBannerTierText = ''
  }
  if (blackoutRestoreAtMs > 0 && now >= blackoutRestoreAtMs) {
    blackoutRestoreAtMs = 0
  }
  if (heatCoolRestoreAtMs > 0 && now >= heatCoolRestoreAtMs) {
    heatCoolRestoreAtMs = 0
  }
  if (saveRestoreAtMs > 0 && now >= saveRestoreAtMs) {
    saveRestoreAtMs = 0
  }
  if (raceRestoreAtMs > 0 && now >= raceRestoreAtMs) {
    raceRestoreAtMs = 0
  }
  if (bankRestoreAtMs > 0 && now >= bankRestoreAtMs) {
    bankRestoreAtMs = 0
  }
  if (repairRestoreAtMs > 0 && now >= repairRestoreAtMs) {
    repairRestoreAtMs = 0
  }
  if (vehicleDisabledRestoreAtMs > 0 && now >= vehicleDisabledRestoreAtMs) {
    vehicleDisabledRestoreAtMs = 0
  }
  if (repairPoorRestoreAtMs > 0 && now >= repairPoorRestoreAtMs) {
    repairPoorRestoreAtMs = 0
  }
  if (policeHitRestoreAtMs > 0 && now >= policeHitRestoreAtMs) {
    policeHitRestoreAtMs = 0
  }
  if (vipRestoreAtMs > 0 && now >= vipRestoreAtMs) {
    vipRestoreAtMs = 0
  }
  if (jJobRestoreAtMs > 0 && now >= jJobRestoreAtMs) {
    jJobRestoreAtMs = 0
  }
  if (turfRestoreAtMs > 0 && now >= turfRestoreAtMs) {
    turfRestoreAtMs = 0
  }
  if (smugglerRestoreAtMs > 0 && now >= smugglerRestoreAtMs) {
    smugglerRestoreAtMs = 0
  }
  if (chopShopRestoreAtMs > 0 && now >= chopShopRestoreAtMs) {
    chopShopRestoreAtMs = 0
  }
  if (stashRestoreAtMs > 0 && now >= stashRestoreAtMs) {
    stashRestoreAtMs = 0
  }
  if (carjackRestoreAtMs > 0 && now >= carjackRestoreAtMs) {
    carjackRestoreAtMs = 0
  }
  if (witnessAlertRestoreAtMs > 0 && now >= witnessAlertRestoreAtMs) {
    witnessAlertRestoreAtMs = 0
  }
  if (witnessJammedRestoreAtMs > 0 && now >= witnessJammedRestoreAtMs) {
    witnessJammedRestoreAtMs = 0
  }
  if (witnessReportDeadlineMs > 0 && now >= witnessReportDeadlineMs) {
    // The call went through: one heat bump per report, then the pending state clears
    witnessReportDeadlineMs = 0
    setWanted(wanted + 1)
    witnessAlertRestoreAtMs = now + WITNESS_ALERT_HOLD_MS
    missionEl.textContent = WITNESS_ALERT_TEXT
  }
  if (wreckRestoreAtMs > 0 && now >= wreckRestoreAtMs) {
    wreckRestoreAtMs = 0
  }
  if (streetCredRankUpUntilMs > 0 && now >= streetCredRankUpUntilMs) {
    streetCredRankUpUntilMs = 0
  }
  if (actCompleteUntilMs > 0 && now >= actCompleteUntilMs) {
    actCompleteUntilMs = 0
    actCompleteBannerText = ''
  }
  if (kingpinRestoreAtMs > 0 && now >= kingpinRestoreAtMs) {
    kingpinRestoreAtMs = 0
  }
  if (signalBannerUntilMs > 0 && now >= signalBannerUntilMs) {
    signalBannerUntilMs = 0
    signalBannerText = ''
  }
  if (airSupportBannerUntilMs > 0 && now >= airSupportBannerUntilMs) {
    airSupportBannerUntilMs = 0
  }
  if (networkNoticeUntilMs > 0 && now >= networkNoticeUntilMs) {
    networkNoticeUntilMs = 0
    networkNoticeText = ''
  }
  if (districtNoticeUntilMs > 0 && now >= districtNoticeUntilMs) {
    districtNoticeUntilMs = 0
    districtNoticeText = ''
  }
  for (let i = signalPulses.length - 1; i >= 0; i--) {
    if (now >= signalPulses[i].untilMs) signalPulses.splice(i, 1)
  }
  const bannerActive =
    (contractState === 'active') ||
    (blackoutState === 'active') ||
    (blackoutState === 'escaping' && escapeTimeLeftSec !== null) ||
    (raceState === 'active' && raceTimeLeftSec !== null) ||
    (contractState === 'complete' && contractRestoreAtMs > 0) ||
    contractFailRestoreAtMs > 0 ||
    trafficHitRestoreAtMs > 0 ||
    safehouseRestoreAtMs > 0 ||
    blackoutRestoreAtMs > 0 ||
    garageRestoreAtMs > 0 ||
    heatCoolRestoreAtMs > 0 ||
    saveRestoreAtMs > 0 ||
    raceRestoreAtMs > 0 ||
    repairRestoreAtMs > 0 ||
    vehicleDisabledRestoreAtMs > 0 ||
    repairPoorRestoreAtMs > 0 ||
    policeHitRestoreAtMs > 0 ||
    bankRestoreAtMs > 0 ||
    vipRestoreAtMs > 0 ||
    convoyRestoreAtMs > 0 ||
    jJobRestoreAtMs > 0 ||
    turfRestoreAtMs > 0 ||
    smugglerRestoreAtMs > 0 ||
    chopShopRestoreAtMs > 0 ||
    stashRestoreAtMs > 0 ||
    carjackRestoreAtMs > 0 ||
    wreckRestoreAtMs > 0 ||
    witnessReportDeadlineMs > 0 ||
    witnessAlertRestoreAtMs > 0 ||
    witnessJammedRestoreAtMs > 0 ||
    streetCredRankUpUntilMs > 0 ||
    actCompleteUntilMs > 0 ||
    kingpinRestoreAtMs > 0 ||
    signalBannerUntilMs > 0 ||
    airSupportBannerUntilMs > 0 ||
    networkNoticeUntilMs > 0
  if (!bannerActive) {
    missionEl.textContent = campaignMissionText()
  } else if (trafficHitRestoreAtMs > 0) {
    if (missionEl.textContent !== TRAFFIC_HIT_TEXT) missionEl.textContent = TRAFFIC_HIT_TEXT
  } else if (heatCoolRestoreAtMs > 0) {
    if (missionEl.textContent !== HEAT_COOLING_TEXT) missionEl.textContent = HEAT_COOLING_TEXT
  } else if (raceRestoreAtMs > 0) {
    const raceBannerText = raceState === 'complete' ? RACE_DONE_TEXT : RACE_EXPIRED_TEXT
    if (missionEl.textContent !== raceBannerText) missionEl.textContent = raceBannerText
  } else if (saveRestoreAtMs > 0) {
    if (missionEl.textContent !== saveBannerText) missionEl.textContent = saveBannerText
  } else if (garageRestoreAtMs > 0) {
    const garageText = garageBannerTierText || (garageBannerAfford ? GARAGE_AFFORD_TEXT : GARAGE_POOR_TEXT)
    if (missionEl.textContent !== garageText) missionEl.textContent = garageText
  } else if (vehicleDisabledRestoreAtMs > 0) {
    if (missionEl.textContent !== VEHICLE_DISABLED_TEXT) missionEl.textContent = VEHICLE_DISABLED_TEXT
  } else if (repairPoorRestoreAtMs > 0) {
    if (missionEl.textContent !== REPAIR_POOR_TEXT) missionEl.textContent = REPAIR_POOR_TEXT
  } else if (policeHitRestoreAtMs > 0) {
    if (missionEl.textContent !== POLICE_IMPACT_TEXT) missionEl.textContent = POLICE_IMPACT_TEXT
  } else if (bankRestoreAtMs > 0) {
    const bankBannerText = bankState === 'complete' ? BANK_DONE_TEXT : BANK_FAILED_TEXT
    if (missionEl.textContent !== bankBannerText) missionEl.textContent = bankBannerText
  } else if (vipRestoreAtMs > 0) {
    const vipBannerText = vipState === 'complete' ? VIP_DONE_TEXT : VIP_FAILED_TEXT
    if (missionEl.textContent !== vipBannerText) missionEl.textContent = vipBannerText
  } else if (convoyRestoreAtMs > 0) {
    const convoyBannerText = convoyState === 'complete' ? CONVOY_DONE_TEXT : CONVOY_FAILED_TEXT
    if (missionEl.textContent !== convoyBannerText) missionEl.textContent = convoyBannerText
  } else if (jJobRestoreAtMs > 0) {
    const jJobBannerText = jJobState === 'complete' ? J_JOB_DONE_TEXT : J_JOB_FAILED_TEXT
    if (missionEl.textContent !== jJobBannerText) missionEl.textContent = jJobBannerText
  } else if (turfRestoreAtMs > 0) {
    const turfBannerText = turfState === 'complete' ? TURF_DONE_TEXT : TURF_FAILED_TEXT
    if (missionEl.textContent !== turfBannerText) missionEl.textContent = turfBannerText
  } else if (smugglerRestoreAtMs > 0) {
    const smugglerBannerText = smugglerState === 'complete' ? SMUGGLER_DONE_TEXT : SMUGGLER_LOST_TEXT
    if (missionEl.textContent !== smugglerBannerText) missionEl.textContent = smugglerBannerText
  } else if (chopShopRestoreAtMs > 0) {
    const chopShopBannerText = chopShopState === 'complete' ? CHOP_SHOP_DONE_TEXT : CHOP_SHOP_LOST_TEXT
    if (missionEl.textContent !== chopShopBannerText) missionEl.textContent = chopShopBannerText
  } else if (stashRestoreAtMs > 0) {
    if (missionEl.textContent !== STASH_SECURED_TEXT) missionEl.textContent = STASH_SECURED_TEXT
  } else if (carjackRestoreAtMs > 0) {
    if (missionEl.textContent !== CARJACKED_TEXT) missionEl.textContent = CARJACKED_TEXT
  } else if (witnessReportDeadlineMs > 0) {
    const witnessCountdown = Math.ceil((witnessReportDeadlineMs - now) / 1000)
    const witnessText = `WITNESS // CALLING POLICE — ${witnessCountdown}S`
    if (missionEl.textContent !== witnessText) missionEl.textContent = witnessText
  } else if (witnessAlertRestoreAtMs > 0) {
    if (missionEl.textContent !== WITNESS_ALERT_TEXT) missionEl.textContent = WITNESS_ALERT_TEXT
  } else if (witnessJammedRestoreAtMs > 0) {
    if (missionEl.textContent !== WITNESS_JAMMED_TEXT) missionEl.textContent = WITNESS_JAMMED_TEXT
  } else if (wreckRestoreAtMs > 0) {
    if (missionEl.textContent !== CAR_WRECKED_TEXT) missionEl.textContent = CAR_WRECKED_TEXT
  } else if (kingpinRestoreAtMs > 0) {
    if (missionEl.textContent !== KINGPIN_ONLINE_TEXT) missionEl.textContent = KINGPIN_ONLINE_TEXT
  } else if (networkNoticeUntilMs > 0 && networkNoticeText) {
    if (missionEl.textContent !== networkNoticeText) missionEl.textContent = networkNoticeText
  } else if (districtNoticeUntilMs > 0 && districtNoticeText) {
    if (missionEl.textContent !== districtNoticeText) missionEl.textContent = districtNoticeText
  } else if (streetCredRankUpUntilMs > 0) {
    const rankUpText = `STREET CRED // ${streetCredRank(rep)} // RANK UP`
    if (missionEl.textContent !== rankUpText) missionEl.textContent = rankUpText
  } else if (actCompleteUntilMs > 0 && actCompleteBannerText) {
    if (missionEl.textContent !== actCompleteBannerText) missionEl.textContent = actCompleteBannerText
  } else if (signalBannerUntilMs > 0 && signalBannerText) {
    if (missionEl.textContent !== signalBannerText) missionEl.textContent = signalBannerText
  } else if (airSupportBannerUntilMs > 0) {
    if (missionEl.textContent !== AIR_SUPPORT_INBOUND_TEXT) missionEl.textContent = AIR_SUPPORT_INBOUND_TEXT
  } else if (repairRestoreAtMs > 0) {
    if (missionEl.textContent !== REPAIR_DONE_TEXT) missionEl.textContent = REPAIR_DONE_TEXT
  } else if (raceState === 'active' && raceTimeLeftSec !== null) {
    const liveText = `MIDNIGHT SPRINT // CHECKPOINT ${Math.min(raceCheckpointIndex + 1, RACE_CHECKPOINTS.length)}/${RACE_CHECKPOINTS.length} — ${raceTimeLeftSec}S`
    if (missionEl.textContent !== liveText) missionEl.textContent = liveText
  } else if (bankState === 'escaping' && bankEscapeTimeLeftSec !== null) {
    const liveText = `${BANK_ESCAPE_BASE_TEXT} — ${bankEscapeTimeLeftSec}S`
    if (missionEl.textContent !== liveText) missionEl.textContent = liveText
  } else if ((vipState === 'pickup' || vipState === 'escaping') && vipTimeLeftSec !== null) {
    const liveText = `${vipState === 'pickup' ? VIP_ACTIVE_TEXT : VIP_ESCAPE_TEXT} — ${vipTimeLeftSec}S`
    if (missionEl.textContent !== liveText) missionEl.textContent = liveText
  } else if (convoyState === 'active' && convoyTimeLeftSec !== null) {
    const liveText = `${CONVOY_ACTIVE_TEXT} — ${convoyTimeLeftSec}S`
    if (missionEl.textContent !== liveText) missionEl.textContent = liveText
  } else if (convoyState === 'escaping' && convoyTimeLeftSec !== null) {
    const liveText = `${CONVOY_ESCAPE_TEXT} — ${convoyTimeLeftSec}S`
    if (missionEl.textContent !== liveText) missionEl.textContent = liveText
  } else if (jJobState === 'active' && jJobTimeLeftSec !== null) {
    const liveText = `${J_JOB_ACTIVE_TEXT} — ${jJobTimeLeftSec}S`
    if (missionEl.textContent !== liveText) missionEl.textContent = liveText
  } else if (jJobState === 'escaping' && jJobTimeLeftSec !== null) {
    const liveText = `${J_JOB_ESCAPE_TEXT} — ${jJobTimeLeftSec}S`
    if (missionEl.textContent !== liveText) missionEl.textContent = liveText
  } else if (turfState === 'active' && rivalsRemaining() > 0) {
    const liveText = `${TURF_SHOWDOWN_TEXT} — ${rivalsRemaining()} LEFT // PULSE F`
    if (missionEl.textContent !== liveText) missionEl.textContent = liveText
  } else if (turfState === 'active') {
    const secureText = `${TURF_SECURE_TEXT} — ${Math.max(0, Math.ceil((turfDeadlineMs - now) / 1000))}S`
    if (missionEl.textContent !== secureText) missionEl.textContent = secureText
  } else if (turfState === 'escaping' && turfTimeLeftSec !== null) {
    const liveText = `${TURF_ESCAPE_TEXT} — ${turfTimeLeftSec}S`
    if (missionEl.textContent !== liveText) missionEl.textContent = liveText
  } else if ((smugglerState === 'pickup' || smugglerState === 'drop') && smugglerTimeLeftSec !== null) {
    const liveText = `${smugglerState === 'pickup' ? SMUGGLER_ACTIVE_TEXT : SMUGGLER_PICKUP_TEXT} — ${smugglerTimeLeftSec}S`
    if (missionEl.textContent !== liveText) missionEl.textContent = liveText
  } else if ((chopShopState === 'steal' || chopShopState === 'return') && chopShopTimeLeftSec !== null) {
    const liveText = `${chopShopState === 'steal' ? CHOP_SHOP_ACTIVE_TEXT : CHOP_SHOP_STOLEN_TEXT} — ${chopShopTimeLeftSec}S`
    if (missionEl.textContent !== liveText) missionEl.textContent = liveText
  } else if (blackoutState === 'escaping' && escapeTimeLeftSec !== null) {
    const liveText = `${BLACKOUT_ESCAPE_BASE_TEXT} — ${escapeTimeLeftSec}S`
    if (missionEl.textContent !== liveText) missionEl.textContent = liveText
  } else if (contractState === 'active' && deliveryTimeLeftSec !== null) {
    const liveText = `${HOT_DELIVERY_TEXT} — ${deliveryTimeLeftSec}S`
    if (missionEl.textContent !== liveText) missionEl.textContent = liveText
  }

  // Night Shift HUD banner: temporary notice that fades after the toggle, independent of mission banners
  const nightBannerText = nightShiftEnabled ? NIGHT_SHIFT_ON_TEXT : NIGHT_SHIFT_OFF_TEXT
  if (nightEl.dataset.state !== nightShiftEnabled.toString()) {
    nightEl.dataset.state = nightShiftEnabled.toString()
    nightEl.textContent = nightBannerText
    nightEl.style.display = ''
    nightShiftHideAtMs = now + 2200
  }
  if (nightShiftHideAtMs > 0 && now >= nightShiftHideAtMs) {
    nightShiftHideAtMs = 0
    nightEl.style.display = 'none'
  }

  // Restart on R
  if (restartRequested) {
    restartRequested = false
    resetRun(now)
  }

  // Extraction: overlap gate after all signals collected completes the run
  if (!missionComplete && signalsFound === 3 && Math.hypot(player.x - gate.x, player.y - gate.y) < gate.radius + player.size / 2) {
    missionComplete = true
    runTimeSec = (now - runStartMs) / 1000
    runStatsEl.textContent = `TIME ${runTimeSec.toFixed(1)}s // SCORE ${Math.max(500, Math.round(5000 - runTimeSec * 40))}`
    runCompleteEl.hidden = false
    setWanted(0)
    heatCoolStartMs = 0
  }

  const bg = ctx.createLinearGradient(0, 0, 0, h)
  if (nightShiftEnabled) {
    bg.addColorStop(0, '#04010f')
    bg.addColorStop(0.55, '#08021c')
    bg.addColorStop(1, '#020008')
  } else {
    bg.addColorStop(0, '#0a0325')
    bg.addColorStop(0.55, '#12063a')
    bg.addColorStop(1, '#05010f')
  }
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  // Night Shift street-light pools: soft warm ellipses along the road band under the horizon
  if (nightShiftEnabled) {
    ctx.save()
    ctx.translate(-camera.x, -camera.y)
    for (let i = 0; i < 7; i++) {
      const poolX = ((i * 613) % (WORLD_W - 240)) + 120
      const poolY = WORLD_H * 0.62 + 90 + ((i * 331) % (WORLD_H - WORLD_H * 0.62 - 200))
      const flicker = 0.1 + (i % 2 === 0 ? Math.sin(now / 700 + i) : 0) * 0.02
      const pool = ctx.createRadialGradient(poolX, poolY, 4, poolX, poolY, 110)
      pool.addColorStop(0, `rgba(255, 224, 90, ${flicker})`)
      pool.addColorStop(1, 'rgba(255, 224, 90, 0)')
      ctx.fillStyle = pool
      ctx.beginPath()
      ctx.ellipse(poolX, poolY, 110, 62, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  ctx.strokeStyle = 'rgba(255, 45, 150, 0.12)'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = 0; x <= w; x += grid) {
    ctx.moveTo(x, h * 0.62)
    ctx.lineTo(w * 0.5 + (x - w * 0.5) * 2.4, h)
  }
  for (let i = 1; i <= 6; i++) {
    const t = i / 6
    const y = h * 0.62 + Math.pow(t, 2.2) * h * 0.38
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
  }
  ctx.stroke()

  ctx.font = '600 13px ui-monospace, Consolas, monospace'
  ctx.textAlign = 'center'
  ctx.save()
  ctx.translate(-camera.x, -camera.y)
  buildings.forEach((b, i) => {
    neonRect(b.x, b.y, b.width, b.height, i % 3 === 0 ? '#00f0ff' : '#ff2d96')
    ctx.fillStyle = nightShiftEnabled ? 'rgba(255, 248, 160, 0.95)' : 'rgba(255, 240, 90, 0.85)'
    ctx.shadowColor = nightShiftEnabled ? '#fff8d6' : '#ffe05a'
    ctx.shadowBlur = nightShiftEnabled ? 14 : 8
    for (let wx = b.x + 10; wx < b.x + b.width - 8; wx += 18) {
      for (let wy = b.y + 10; wy < b.y + b.height - 8; wy += 22) {
        if ((wx + wy + i) % 3 !== 0) ctx.fillRect(wx, wy, 5, 7)
      }
    }
    ctx.shadowBlur = 0
  })

  neonRect(0, h * 0.62, w, 4, '#00f0ff')

  // District overlays: subtle dashed boundary, label, and center coordinate line
  ctx.font = '600 11px ui-monospace, Consolas, monospace'
  ctx.textAlign = 'left'
  CITY_DISTRICTS.forEach(d => {
    const half = 130
    const left = d.x - half
    const top = d.y - half
    ctx.strokeStyle = d.color
    ctx.globalAlpha = nightShiftEnabled ? 0.55 : 0.28
    ctx.lineWidth = 1
    ctx.setLineDash([10, 8])
    ctx.strokeRect(left, top, half * 2, half * 2)
    ctx.setLineDash([])
    if (nightShiftEnabled) {
      ctx.shadowColor = d.color
      ctx.shadowBlur = 14
      ctx.lineWidth = 1.5
      ctx.strokeRect(left, top, half * 2, half * 2)
      ctx.shadowBlur = 0
      ctx.lineWidth = 1
    }
    ctx.globalAlpha = 0.75
    ctx.fillStyle = d.color
    ctx.fillText(d.name, left + 6, top - 6)
    ctx.globalAlpha = 0.35
    ctx.beginPath()
    ctx.moveTo(left, d.y)
    ctx.lineTo(d.x, d.y)
    ctx.stroke()
    ctx.globalAlpha = 1
  })

  // Violet extraction gate: revealed after all signals are recovered
  if (signalsFound === 3 && !missionComplete) {
    const gx = gate.x
    const gy = gate.y
    const breathe = Math.sin(now / 320) * 6
    ctx.strokeStyle = '#b26bff'
    ctx.shadowColor = '#b26bff'
    ctx.shadowBlur = 26 + breathe
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.ellipse(gx, gy, gate.radius * 0.62, gate.radius, 0, 0, Math.PI * 2)
    ctx.stroke()
    // inner shimmer ring
    ctx.lineWidth = 1.5
    ctx.globalAlpha = 0.55
    ctx.beginPath()
    ctx.ellipse(gx, gy, gate.radius * 0.38 + breathe * 0.5, gate.radius * 0.66 + breathe * 0.5, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1
    // base pylons
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(gx - gate.radius * 0.62 - 8, gy + gate.radius)
    ctx.lineTo(gx - gate.radius * 0.62 - 8, gy + gate.radius + 16)
    ctx.moveTo(gx + gate.radius * 0.62 + 8, gy + gate.radius)
    ctx.lineTo(gx + gate.radius * 0.62 + 8, gy + gate.radius + 16)
    ctx.stroke()
    ctx.shadowBlur = 0
    ctx.font = '600 11px ui-monospace, Consolas, monospace'
    ctx.fillStyle = 'rgba(178, 107, 255, 0.9)'
    ctx.textAlign = 'center'
    ctx.fillText('EXTRACT', gx, gy - gate.radius - 12)
  }

  // Amber dashed drop-off pad while a courier run is underway
  if (contractState === 'active') {
    const dox = SKYWAY_DROP_OFF.x
    const doy = SKYWAY_DROP_OFF.y
    const breathe = Math.sin(now / 300) * 6
    ctx.strokeStyle = '#ff9d3c'
    ctx.shadowColor = '#ff9d3c'
    ctx.shadowBlur = 22 + breathe
    ctx.lineWidth = 3
    ctx.setLineDash([16, 12])
    ctx.beginPath()
    ctx.arc(dox, doy, DROP_OFF_RADIUS, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 0.1
    ctx.fillStyle = '#ff9d3c'
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.font = '600 11px ui-monospace, Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ff9d3c'
    ctx.fillText('DROP-OFF', dox, doy - DROP_OFF_RADIUS - 26)
    ctx.fillText(`DIST ${Math.round(Math.hypot(player.x - dox, player.y - doy))}M`, dox, doy - DROP_OFF_RADIUS - 12)
    ctx.shadowBlur = 0
  }

  // Cyan safehouse pad: always visible so players can find the heat dump
  {
    const sx = SAFEHOUSE.x
    const sy = SAFEHOUSE.y
    const breathe = Math.sin(now / 420) * 5
    const inZone = Math.hypot(player.x - sx, player.y - sy) < SAFEHOUSE.radius
    ctx.strokeStyle = '#00f0ff'
    ctx.shadowColor = '#00f0ff'
    ctx.shadowBlur = 18 + breathe
    ctx.lineWidth = inZone ? 3.5 : 2.5
    ctx.setLineDash([10, 8])
    ctx.beginPath()
    ctx.arc(sx, sy, SAFEHOUSE.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    // inner shelter glyph: roof over a dot
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(sx - 16, sy + 6)
    ctx.lineTo(sx, sy - 14)
    ctx.lineTo(sx + 16, sy + 6)
    ctx.moveTo(sx - 9, sy + 1)
    ctx.lineTo(sx - 9, sy + 13)
    ctx.lineTo(sx + 9, sy + 13)
    ctx.lineTo(sx + 9, sy + 1)
    ctx.stroke()
    // center beacon when standing inside
    if (inZone) {
      ctx.fillStyle = '#bfffff'
      ctx.beginPath()
      ctx.arc(sx, sy, 4 + Math.sin(now / 140) * 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.font = '600 11px ui-monospace, Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#00f0ff'
    ctx.fillText('SAFEHOUSE', sx, sy - SAFEHOUSE.radius - 26)
    ctx.fillText(`DIST ${Math.round(Math.hypot(player.x - sx, player.y - sy))}M`, sx, sy - SAFEHOUSE.radius - 12)
    ctx.shadowBlur = 0
    // Crew beacon: subtle cyan pulse rings around the safehouse only while Cover is active
    if (now < crewCoverUntilMs) {
      const crewPulseT = (now % 1400) / 1400
      for (const offset of [0, 0.5]) {
        const ringT = (crewPulseT + offset) % 1
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.28 * (1 - ringT)})`
        ctx.shadowColor = '#00f0ff'
        ctx.shadowBlur = 10
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(sx, sy, SAFEHOUSE.radius + 8 + ringT * 46, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.fillStyle = '#bfffff'
      ctx.beginPath()
      ctx.arc(sx, sy, 3.5 + Math.sin(now / 150) * 1.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    }
  }

  // Violet grid target: rendered only during the target phase
  if (blackoutState === 'active') {
    const bx = BLACKOUT_TARGET.x
    const by = BLACKOUT_TARGET.y
    const breathe = Math.sin(now / 340) * 5
    const inTarget = Math.hypot(player.x - bx, player.y - by) < BLACKOUT_TARGET.radius
    ctx.strokeStyle = '#b26bff'
    ctx.shadowColor = '#b26bff'
    ctx.shadowBlur = 20 + breathe
    ctx.lineWidth = inTarget ? 3.5 : 2.5
    ctx.setLineDash([14, 10])
    ctx.beginPath()
    ctx.arc(bx, by, BLACKOUT_TARGET.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 0.08
    ctx.fillStyle = '#b26bff'
    ctx.fill()
    ctx.globalAlpha = 1
    // inner bolt glyph: the grid cut
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(bx + 6, by - 16)
    ctx.lineTo(bx - 7, by + 2)
    ctx.lineTo(bx + 2, by + 2)
    ctx.lineTo(bx - 4, by + 16)
    ctx.stroke()
    if (inTarget && blackoutState === 'active') {
      ctx.fillStyle = '#e3d0ff'
      ctx.beginPath()
      ctx.arc(bx, by, 4 + Math.sin(now / 140) * 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.font = '600 11px ui-monospace, Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#b26bff'
    ctx.fillText('BLACKOUT TARGET', bx, by - BLACKOUT_TARGET.radius - 26)
    ctx.fillText(`DIST ${Math.round(Math.hypot(player.x - bx, player.y - by))}M`, bx, by - BLACKOUT_TARGET.radius - 12)
    ctx.shadowBlur = 0
  }

  // Gold vault: distinctive ring/dial glyph while the Bank Run is active or escaping
  if (bankState === 'active' || bankState === 'escaping') {
    const vx = BANK_VAULT.x
    const vy = BANK_VAULT.y
    const breathe = Math.sin(now / 300) * 5
    const inVault = Math.hypot(player.x - vx, player.y - vy) < BANK_VAULT.radius
    ctx.strokeStyle = '#ffd700'
    ctx.shadowColor = '#ffd700'
    ctx.shadowBlur = 22 + breathe
    ctx.lineWidth = inVault ? 3.5 : 3
    ctx.setLineDash([12, 9])
    ctx.beginPath()
    ctx.arc(vx, vy, BANK_VAULT.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    // inner vault dial glyph
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(vx, vy, 16, 0, Math.PI * 2)
    ctx.moveTo(vx, vy - 16)
    ctx.lineTo(vx, vy + 16)
    ctx.moveTo(vx - 16, vy)
    ctx.lineTo(vx + 16, vy)
    ctx.stroke()
    if (bankState === 'escaping') {
      ctx.fillStyle = '#fff3c4'
      ctx.beginPath()
      ctx.arc(vx, vy, 4 + Math.sin(now / 140) * 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.font = '600 11px ui-monospace, Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffd700'
    ctx.fillText('BANK VAULT', vx, vy - BANK_VAULT.radius - 26)
    ctx.fillText(`DIST ${Math.round(Math.hypot(player.x - vx, player.y - vy))}M`, vx, vy - BANK_VAULT.radius - 12)
    ctx.shadowBlur = 0
  }

  // Cyan/white VIP client: ring + person glyph while the extraction is pickup or escaping
  if (vipState === 'pickup' || vipState === 'escaping') {
    const px2 = VIP_CLIENT.x
    const py2 = VIP_CLIENT.y
    const refX = driving ? courierCar.x : player.x
    const refY = driving ? courierCar.y : player.y
    const breathe = Math.sin(now / 280) * 5
    const inClient = Math.hypot(refX - px2, refY - py2) < VIP_CLIENT.radius
    ctx.strokeStyle = '#00f0ff'
    ctx.shadowColor = '#00f0ff'
    ctx.shadowBlur = 20 + breathe
    ctx.lineWidth = inClient ? 3.5 : 3
    ctx.setLineDash([10, 7])
    ctx.beginPath()
    ctx.arc(px2, py2, VIP_CLIENT.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    // inner white person glyph: head + shoulders
    ctx.strokeStyle = '#ffffff'
    ctx.shadowColor = '#ffffff'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(px2, py2 - 10, 6, 0, Math.PI * 2)
    ctx.moveTo(px2 - 10, py2 + 14)
    ctx.quadraticCurveTo(px2, py2 - 4, px2 + 10, py2 + 14)
    ctx.stroke()
    if (inClient && vipState === 'pickup') {
      ctx.fillStyle = '#e0ffff'
      ctx.beginPath()
      ctx.arc(px2, py2, 4 + Math.sin(now / 140) * 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.font = '600 11px ui-monospace, Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#00f0ff'
    ctx.fillText('VIP CLIENT', px2, py2 - VIP_CLIENT.radius - 26)
    ctx.fillText(`DIST ${Math.round(Math.hypot(refX - px2, refY - py2))}M`, px2, py2 - VIP_CLIENT.radius - 12)
    ctx.shadowBlur = 0
  }

  // Armored three-car convoy at the ambush site: dark hulls, amber light bars, cargo glow while escaping
  if (convoyState === 'active' || convoyState === 'escaping') {
    const cx2 = CONVOY_SITE.x
    const cy2 = CONVOY_SITE.y
    const refX = driving ? courierCar.x : player.x
    const refY = driving ? courierCar.y : player.y
    const breathe = Math.sin(now / 300) * 5
    const inSite = Math.hypot(refX - cx2, refY - cy2) < CONVOY_SITE.radius
    ctx.strokeStyle = '#00f0ff'
    ctx.shadowColor = '#00f0ff'
    ctx.shadowBlur = 22 + breathe
    ctx.lineWidth = inSite ? 3.5 : 3
    ctx.setLineDash([14, 10])
    ctx.beginPath()
    ctx.arc(cx2, cy2, CONVOY_SITE.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 0.08
    ctx.fillStyle = '#00f0ff'
    ctx.fill()
    ctx.globalAlpha = 1

    // three armored cars: heavy dark bodies with amber roof light bars
    const convoyCars = [
      { x: cx2 - 46, y: cy2 + 26, angle: Math.PI },
      { x: cx2 + 4, y: cy2 - 30, angle: Math.PI / 2 },
      { x: cx2 + 44, y: cy2 + 30, angle: -Math.PI / 4 },
    ]
    for (const car of convoyCars) {
      ctx.save()
      ctx.translate(car.x, car.y)
      ctx.rotate(car.angle)
      ctx.strokeStyle = '#2a2f45'
      ctx.shadowColor = now % 400 < 200 ? '#ffb347' : '#ffe05a'
      ctx.shadowBlur = 12
      ctx.lineWidth = 3
      ctx.strokeRect(-15, -9, 30, 18)
      // armored cabin slit
      ctx.fillStyle = 'rgba(191, 255, 255, 0.35)'
      ctx.fillRect(-5, -5, 8, 10)
      // amber light bar cells
      ctx.fillStyle = '#ffb347'
      ctx.fillRect(-6, -2.5, 5, 5)
      ctx.fillStyle = '#ffe05a'
      ctx.fillRect(1, -2.5, 5, 5)
      // headlights
      ctx.shadowColor = '#fff8d6'
      ctx.shadowBlur = 7
      ctx.fillStyle = '#fff8d6'
      ctx.fillRect(-11, -10, 4, 3)
      ctx.fillRect(7, -10, 4, 3)
      ctx.restore()
      ctx.shadowBlur = 0
    }

    // cargo secured beacon while running the getaway
    if (inSite && convoyState === 'escaping') {
      ctx.fillStyle = '#eaffff'
      ctx.beginPath()
      ctx.arc(cx2, cy2, 4 + Math.sin(now / 140) * 1.5, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.font = '600 11px ui-monospace, Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#00f0ff'
    ctx.fillText('CONVOY SITE', cx2, cy2 - CONVOY_SITE.radius - 26)
    ctx.fillText(`DIST ${Math.round(Math.hypot(refX - cx2, refY - cy2))}M`, cx2, cy2 - CONVOY_SITE.radius - 12)
    ctx.shadowBlur = 0
  }

  // Rival two-car crew at the Junction Job site: magenta ring, dark hulls, red light bars while active/escaping
  if (jJobState === 'active' || jJobState === 'escaping') {
    const jx = J_JOB_SITE.x
    const jy = J_JOB_SITE.y
    const refX = driving ? courierCar.x : player.x
    const refY = driving ? courierCar.y : player.y
    const breathe = Math.sin(now / 300) * 5
    const atSite = Math.hypot(refX - jx, refY - jy) < J_JOB_SITE.radius
    ctx.strokeStyle = '#ff2d96'
    ctx.shadowColor = '#ff2d96'
    ctx.shadowBlur = 22 + breathe
    ctx.lineWidth = atSite ? 3.5 : 3
    ctx.setLineDash([14, 10])
    ctx.beginPath()
    ctx.arc(jx, jy, J_JOB_SITE.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 0.08
    ctx.fillStyle = '#ff2d96'
    ctx.fill()
    ctx.globalAlpha = 1

    // rival cars: heavy dark bodies with red roof light bars
    const rivalCars = [
      { x: jx - 34, y: jy - 24, angle: Math.PI / 4 },
      { x: jx + 30, y: jy + 26, angle: -Math.PI / 3 },
    ]
    for (const car of rivalCars) {
      ctx.save()
      ctx.translate(car.x, car.y)
      ctx.rotate(car.angle)
      ctx.strokeStyle = '#2a2f45'
      ctx.shadowColor = now % 400 < 200 ? '#ff3c3c' : '#ffe05a'
      ctx.shadowBlur = 12
      ctx.lineWidth = 3
      ctx.strokeRect(-15, -9, 30, 18)
      // rival cabin slit
      ctx.fillStyle = 'rgba(191, 255, 255, 0.35)'
      ctx.fillRect(-5, -5, 8, 10)
      // red light bar cells
      ctx.fillStyle = '#ff3c3c'
      ctx.fillRect(-6, -2.5, 5, 5)
      ctx.fillStyle = '#ffe05a'
      ctx.fillRect(1, -2.5, 5, 5)
      // headlights
      ctx.shadowColor = '#fff8d6'
      ctx.shadowBlur = 7
      ctx.fillStyle = '#fff8d6'
      ctx.fillRect(-11, -10, 4, 3)
      ctx.fillRect(7, -10, 4, 3)
      ctx.restore()
      ctx.shadowBlur = 0
    }

    // secured-target beacon while running the getaway
    if (atSite && jJobState === 'escaping') {
      ctx.fillStyle = '#ffd6ea'
      ctx.beginPath()
      ctx.arc(jx, jy, 4 + Math.sin(now / 140) * 1.5, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.font = '600 11px ui-monospace, Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ff2d96'
    ctx.fillText('JUNCTION JOB', jx, jy - J_JOB_SITE.radius - 26)
    ctx.fillText(`DIST ${Math.round(Math.hypot(refX - jx, refY - jy))}M`, jx, jy - J_JOB_SITE.radius - 12)
    ctx.shadowBlur = 0
  }

  // Contested district: magenta-orange dashed takeover ring with three enemy markers while active/escaping
  if (turfState === 'active' || turfState === 'escaping') {
    const tx = TURF_SITE.x
    const ty = TURF_SITE.y
    const breathe = Math.sin(now / 300) * 5
    const atTurf = !driving && Math.hypot(player.x - tx, player.y - ty) < TURF_SITE.radius
    ctx.strokeStyle = '#ff2d96'
    ctx.shadowColor = '#ff9d3c'
    ctx.shadowBlur = 22 + breathe
    ctx.lineWidth = atTurf ? 3.5 : 3
    ctx.setLineDash([14, 10])
    ctx.beginPath()
    ctx.arc(tx, ty, TURF_SITE.radius, 0, Math.PI * 2)
    ctx.stroke()
    // inner orange shimmer ring for the two-tone district boundary
    ctx.strokeStyle = '#ff9d3c'
    ctx.shadowColor = '#ff9d3c'
    ctx.globalAlpha = 0.55
    ctx.setLineDash([7, 11])
    ctx.beginPath()
    ctx.arc(tx, ty, TURF_SITE.radius - 10, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1

    // Rival crew silhouettes: neon human figures with a weapon line and compact health bars,
    // drawn here before the player/courier/police layers so they read as world actors
    for (const rival of rivalCrew) {
      if (rival.hp <= 0) continue
      const flashing = now < rival.hitFlashUntilMs
      const bodyColor = flashing ? '#ffffff' : '#ff2d55'
      const glowColor = flashing ? '#ffffff' : now % 400 < 200 ? '#b26bff' : '#ff3c3c'
      const bob = Math.sin(now / 240 + rival.phase) * 1.5
      const aimAng = Math.atan2(player.y - rival.y, player.x - rival.x)
      const rx = rival.x
      const ry = rival.y + bob
      ctx.lineCap = 'round'
      ctx.strokeStyle = bodyColor
      ctx.shadowColor = glowColor
      ctx.shadowBlur = flashing ? 22 : 12
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.arc(rx, ry - 11, 4, 0, Math.PI * 2)
      ctx.moveTo(rx - 6, ry + 10)
      ctx.quadraticCurveTo(rx, ry - 5, rx + 6, ry + 10)
      ctx.stroke()
      // small weapon line toward the player's last position
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(rx + Math.cos(aimAng) * 7, ry + Math.sin(aimAng) * 7 - 2)
      ctx.lineTo(rx + Math.cos(aimAng) * 15, ry + Math.sin(aimAng) * 15 - 2)
      ctx.stroke()
      ctx.shadowBlur = 0
      // compact health bar above the head: purple remaining over dim track
      const barW = 24
      const barH = 3
      const barX = rx - barW / 2
      const barY = ry - 20
      ctx.fillStyle = 'rgba(30, 16, 44, 0.85)'
      ctx.fillRect(barX, barY, barW, barH)
      ctx.fillStyle = '#b26bff'
      ctx.fillRect(barX, barY, (barW * rival.hp) / rival.maxHp, barH)
    }

    // secured beacon once the district is locked in and the escape home is running
    if (atTurf && turfState === 'escaping') {
      ctx.fillStyle = '#ffd6ea'
      ctx.beginPath()
      ctx.arc(tx, ty, 4 + Math.sin(now / 140) * 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.font = '600 11px ui-monospace, Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ff2d96'
    ctx.fillText('DISTRICT TAKEOVER', tx, ty - TURF_SITE.radius - 26)
    ctx.fillText(`DIST ${Math.round(Math.hypot(player.x - tx, player.y - ty))}M`, tx, ty - TURF_SITE.radius - 12)
    ctx.shadowBlur = 0
  }

  // Midnight Sprint checkpoint: distinctive green gate for the current mandatory target
  if (raceState === 'active') {
    const cp = RACE_CHECKPOINTS[raceCheckpointIndex]
    const cpx = cp.x
    const cpy = cp.y
    const breathe = Math.sin(now / 220) * 6
    ctx.strokeStyle = '#39ff88'
    ctx.shadowColor = '#39ff88'
    ctx.shadowBlur = 24 + breathe
    ctx.lineWidth = 3.5
    ctx.setLineDash([18, 10])
    ctx.beginPath()
    ctx.arc(cpx, cpy, cp.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    // inner chevron pointing at the gate center
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(cpx - 14, cpy - 8)
    ctx.lineTo(cpx, cpy + 10)
    ctx.lineTo(cpx + 14, cpy - 8)
    ctx.stroke()
    if (driving && Math.hypot(courierCar.x - cpx, courierCar.y - cpy) < cp.radius) {
      ctx.fillStyle = '#bfffff'
      ctx.beginPath()
      ctx.arc(cpx, cpy, 4 + Math.sin(now / 120) * 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.font = '600 11px ui-monospace, Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#39ff88'
    ctx.fillText(`CHECKPOINT ${raceCheckpointIndex + 1}/${RACE_CHECKPOINTS.length}`, cpx, cpy - cp.radius - 26)
    ctx.fillText(`DIST ${Math.round(Math.hypot(player.x - cpx, player.y - cpy))}M`, cpx, cpy - cp.radius - 12)
    ctx.shadowBlur = 0
  }

  // Smuggler Run pickup site: green dashed ring with a crate glyph while awaiting the package
  if (smugglerState === 'pickup') {
    const sx2 = SMUGGLER_PICKUP_SITE.x
    const sy2 = SMUGGLER_PICKUP_SITE.y
    const breathe = Math.sin(now / 300) * 5
    const inPickup = driving && Math.hypot(courierCar.x - sx2, courierCar.y - sy2) < SMUGGLER_PICKUP_SITE.radius
    ctx.strokeStyle = '#39ff88'
    ctx.shadowColor = '#39ff88'
    ctx.shadowBlur = 22 + breathe
    ctx.lineWidth = inPickup ? 3.5 : 3
    ctx.setLineDash([12, 9])
    ctx.beginPath()
    ctx.arc(sx2, sy2, SMUGGLER_PICKUP_SITE.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 0.08
    ctx.fillStyle = '#39ff88'
    ctx.fill()
    ctx.globalAlpha = 1
    // inner crate glyph: slatted box with a center strap
    ctx.lineWidth = 2.5
    ctx.strokeRect(sx2 - 14, sy2 - 11, 28, 22)
    ctx.beginPath()
    ctx.moveTo(sx2 - 14, sy2)
    ctx.lineTo(sx2 + 14, sy2)
    ctx.moveTo(sx2, sy2 - 11)
    ctx.lineTo(sx2, sy2 + 11)
    ctx.stroke()
    if (inPickup) {
      ctx.fillStyle = '#bfffff'
      ctx.beginPath()
      ctx.arc(sx2, sy2, 4 + Math.sin(now / 140) * 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.font = '600 11px ui-monospace, Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#39ff88'
    ctx.fillText('SMUGGLER PICKUP', sx2, sy2 - SMUGGLER_PICKUP_SITE.radius - 26)
    ctx.fillText(`DIST ${Math.round(Math.hypot(player.x - sx2, player.y - sy2))}M`, sx2, sy2 - SMUGGLER_PICKUP_SITE.radius - 12)
    ctx.shadowBlur = 0
  }

  // Smuggler Run drop site: amber dashed drop-off pad once the package is secured
  if (smugglerState === 'drop') {
    const dxs = SMUGGLER_DROP_SITE.x
    const dys = SMUGGLER_DROP_SITE.y
    const breathe = Math.sin(now / 300) * 6
    const inDrop = driving && Math.hypot(courierCar.x - dxs, courierCar.y - dys) < SMUGGLER_DROP_SITE.radius
    ctx.strokeStyle = '#ff9d3c'
    ctx.shadowColor = '#ff9d3c'
    ctx.shadowBlur = 22 + breathe
    ctx.lineWidth = inDrop ? 3.5 : 3
    ctx.setLineDash([16, 12])
    ctx.beginPath()
    ctx.arc(dxs, dys, SMUGGLER_DROP_SITE.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 0.1
    ctx.fillStyle = '#ff9d3c'
    ctx.fill()
    ctx.globalAlpha = 1
    // inner down-chevron glyph pointing at the pad
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(dxs - 13, dys - 9)
    ctx.lineTo(dxs, dys + 9)
    ctx.lineTo(dxs + 13, dys - 9)
    ctx.stroke()
    if (inDrop) {
      ctx.fillStyle = '#fff3c4'
      ctx.beginPath()
      ctx.arc(dxs, dys, 4 + Math.sin(now / 140) * 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.font = '600 11px ui-monospace, Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ff9d3c'
    ctx.fillText('SMUGGLER DROP', dxs, dys - SMUGGLER_DROP_SITE.radius - 26)
    ctx.fillText(`DIST ${Math.round(Math.hypot(player.x - dxs, player.y - dys))}M`, dxs, dys - SMUGGLER_DROP_SITE.radius - 12)
    ctx.shadowBlur = 0
  }

  // Chop Shop target site: purple dashed ring with a car-lift glyph while the job runs
  if (chopShopState === 'steal' || chopShopState === 'return') {
    const cx2 = CHOP_SHOP_SITE.x
    const cy2 = CHOP_SHOP_SITE.y
    const breathe = Math.sin(now / 300) * 5
    const inSite = driving && Math.hypot(courierCar.x - cx2, courierCar.y - cy2) < CHOP_SHOP_SITE.radius
    ctx.strokeStyle = '#b26bff'
    ctx.shadowColor = '#b26bff'
    ctx.shadowBlur = 20 + breathe
    ctx.lineWidth = inSite ? 3.5 : 3
    ctx.setLineDash([14, 10])
    ctx.beginPath()
    ctx.arc(cx2, cy2, CHOP_SHOP_SITE.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    // car-lift glyph: chassis bar on two lift arms
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(cx2 - 15, cy2 - 8)
    ctx.lineTo(cx2 + 15, cy2 - 8)
    ctx.moveTo(cx2 - 9, cy2 + 10)
    ctx.lineTo(cx2 - 9, cy2)
    ctx.lineTo(cx2 + 9, cy2)
    ctx.lineTo(cx2 + 9, cy2 + 10)
    ctx.stroke()
    if (inSite) {
      ctx.fillStyle = '#e6ccff'
      ctx.beginPath()
      ctx.arc(cx2, cy2, 4 + Math.sin(now / 140) * 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.font = '600 11px ui-monospace, Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#b26bff'
    ctx.fillText('CHOP SHOP', cx2, cy2 - CHOP_SHOP_SITE.radius - 26)
    ctx.fillText(`DIST ${Math.round(Math.hypot(player.x - cx2, player.y - cy2))}M`, cx2, cy2 - CHOP_SHOP_SITE.radius - 12)
    ctx.shadowBlur = 0
  }

  // Black Market Stash crate: neon slatted crate with a dollar glyph while uncollected
  if (!stashCollected) {
    const stx = STASH_SITE.x
    const sty = STASH_SITE.y
    const nearStash = !driving && Math.hypot(player.x - stx, player.y - sty) < STASH_SITE.radius
    const breathe = Math.sin(now / 300) * 5
    ctx.strokeStyle = '#39ff88'
    ctx.shadowColor = '#39ff88'
    ctx.shadowBlur = 20 + breathe
    ctx.lineWidth = 3
    ctx.setLineDash([12, 9])
    ctx.beginPath()
    ctx.arc(stx, sty, STASH_SITE.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    // slatted crate body with a center strap
    ctx.lineWidth = 2.5
    ctx.strokeRect(stx - 15, sty - 11, 30, 22)
    ctx.beginPath()
    ctx.moveTo(stx - 15, sty)
    ctx.lineTo(stx + 15, sty)
    ctx.moveTo(stx, sty - 11)
    ctx.lineTo(stx, sty + 11)
    ctx.stroke()
    // dollar glyph over the strap
    ctx.font = '700 10px ui-monospace, Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#bfffff'
    ctx.fillText('$', stx, sty + 3.5)
    if (nearStash) {
      ctx.fillStyle = '#bfffff'
      ctx.beginPath()
      ctx.arc(stx, sty, 4 + Math.sin(now / 140) * 1.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.font = '600 11px ui-monospace, Consolas, monospace'
      ctx.fillStyle = '#39ff88'
      ctx.fillText('PRESS Z TO SECURE', stx, sty + STASH_SITE.radius - 10)
    }
    ctx.font = '600 11px ui-monospace, Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#39ff88'
    ctx.fillText('BLACK MARKET STASH', stx, sty - STASH_SITE.radius - 26)
    ctx.fillText(`DIST ${Math.round(Math.hypot(player.x - stx, player.y - sty))}M`, stx, sty - STASH_SITE.radius - 12)
    ctx.shadowBlur = 0
  }

  // Kingpin Network node: violet pulsing ring + node glyph during the ACT III epilogue,
  // hidden once the network is online
  if (missionComplete && !kingpinOnline) {
    const knx = KINGPIN_NODE.x
    const kny = KINGPIN_NODE.y
    const nearNode = playerNearKingpinNode()
    const breathe = Math.sin(now / 320) * 6
    ctx.strokeStyle = '#b26bff'
    ctx.shadowColor = '#b26bff'
    ctx.shadowBlur = 20 + breathe
    ctx.lineWidth = nearNode ? 3.5 : 3
    ctx.setLineDash([10, 8])
    ctx.beginPath()
    ctx.arc(knx, kny, KINGPIN_NODE.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    // inner node glyph: hub dot with three spokes
    ctx.lineWidth = 2.5
    ctx.beginPath()
    for (const spoke of [0, 2.09, 4.19]) {
      ctx.moveTo(knx, kny)
      ctx.lineTo(knx + Math.cos(spoke) * 14, kny + Math.sin(spoke) * 14)
    }
    ctx.stroke()
    ctx.fillStyle = '#e6ccff'
    ctx.beginPath()
    ctx.arc(knx, kny, 4 + Math.sin(now / 150) * 1.5, 0, Math.PI * 2)
    ctx.fill()
    if (nearNode) {
      ctx.font = '600 11px ui-monospace, Consolas, monospace'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#b26bff'
      ctx.fillText('PRESS Y TO ACTIVATE NETWORK', knx, kny + KINGPIN_NODE.radius - 10)
    }
    ctx.font = '600 11px ui-monospace, Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#b26bff'
    ctx.fillText('KINGPIN NETWORK', knx, kny - KINGPIN_NODE.radius - 26)
    ctx.fillText(`DIST ${Math.round(Math.hypot(player.x - knx, player.y - kny))}M`, knx, kny - KINGPIN_NODE.radius - 12)
    ctx.shadowBlur = 0
  }

  // Network data vault: cyan dashed ring + vault glyph while the contract is active,
  // with the on-foot secure prompt inside the radius
  if (networkJobState === 'active') {
    const nvx = NETWORK_VAULT_SITE.x
    const nvy = NETWORK_VAULT_SITE.y
    const nearVault = playerNearNetworkVault()
    const breathe = Math.sin(now / 300) * 5
    ctx.strokeStyle = '#00f0ff'
    ctx.shadowColor = '#00f0ff'
    ctx.shadowBlur = 20 + breathe
    ctx.lineWidth = nearVault ? 3.5 : 3
    ctx.setLineDash([12, 9])
    ctx.beginPath()
    ctx.arc(nvx, nvy, NETWORK_VAULT_SITE.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    // vault glyph: safe box with dial
    ctx.lineWidth = 2.5
    ctx.strokeRect(nvx - 14, nvy - 11, 28, 22)
    ctx.beginPath()
    ctx.arc(nvx + 4, nvy, 6, 0, Math.PI * 2)
    ctx.moveTo(nvx + 4, nvy - 4)
    ctx.lineTo(nvx + 4, nvy + 4)
    ctx.moveTo(nvx - 10, nvy - 7)
    ctx.lineTo(nvx - 6, nvy - 7)
    ctx.stroke()
    if (nearVault) {
      ctx.font = '600 11px ui-monospace, Consolas, monospace'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#00f0ff'
      ctx.fillText('PRESS Y TO SECURE DATA', nvx, nvy + NETWORK_VAULT_SITE.radius - 10)
    }
    ctx.font = '600 11px ui-monospace, Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#00f0ff'
    ctx.fillText('DATA VAULT', nvx, nvy - NETWORK_VAULT_SITE.radius - 26)
    ctx.fillText(`DIST ${Math.round(Math.hypot(player.x - nvx, player.y - nvy))}M`, nvx, nvy - NETWORK_VAULT_SITE.radius - 12)
    ctx.shadowBlur = 0
  }

  // Police search ring: restrained red pulse + heading tick on the nearest active drone
  if (scanDrone) {
    const sdx = scanDrone.x
    const sdy = scanDrone.y
    const pulseT = Math.sin(now / 260)
    const ringR = 44 + pulseT * 6
    ctx.strokeStyle = `rgba(255, 60, 60, ${0.5 + pulseT * 0.18})`
    ctx.shadowColor = '#ff3c3c'
    ctx.shadowBlur = 14
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(sdx, sdy, ringR, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 0.08
    ctx.fillStyle = '#ff3c3c'
    ctx.fill()
    ctx.globalAlpha = 1
    // short sweep line along the unit's current heading
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(sdx + Math.cos(scanDrone.angle) * (ringR - 4), sdy + Math.sin(scanDrone.angle) * (ringR - 4))
    ctx.lineTo(sdx + Math.cos(scanDrone.angle) * (ringR + 14), sdy + Math.sin(scanDrone.angle) * (ringR + 14))
    ctx.stroke()
    ctx.shadowBlur = 0
  }

  // Jammer pulse ring
  if (jammerRingVisible) {
    const t = 1 - (jammer.active - now) / 420
    ctx.strokeStyle = `rgba(0, 240, 255, ${0.8 * (1 - t)})`
    ctx.lineWidth = 3
    ctx.shadowColor = '#00f0ff'
    ctx.shadowBlur = 20
    ctx.beginPath()
    ctx.arc(player.x, player.y, Math.max(0, jammer.radius * t), 0, Math.PI * 2)
    ctx.stroke()
    ctx.shadowBlur = 0
  }

  // Civilian traffic: continuous lane movement with edge wrap
  traffic.forEach(t => {
    if (t === stolenCar) return
    t.x += t.dir * t.speed * dt
    if (t.dir > 0 && t.x > WORLD_W + t.length) t.x = -t.length
    if (t.dir < 0 && t.x < -t.length) t.x = WORLD_W + t.length
  })

  // Courier coupe under the signal/traffic layer; HUD prompt tracks proximity and drive state
  // Restrained amber impact ring while a traffic hit is registering (rider sits in the active hull)
  if (driving && now < trafficHitUntilMs) {
    const hitT = (trafficHitUntilMs - now) / TRAFFIC_HIT_HOLD_MS
    ctx.strokeStyle = `rgba(255, 157, 60, ${0.35 + hitT * 0.4})`
    ctx.shadowColor = '#ff9d3c'
    ctx.shadowBlur = 12
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(player.x, player.y, 30 + (1 - hitT) * 14, 0, Math.PI * 2)
    ctx.stroke()
    ctx.shadowBlur = 0
  }

  // Restrained red/blue impact ring while a police impact is registering
  if (driving && now < policeHitUntilMs) {
    const hitT = (policeHitUntilMs - now) / POLICE_HIT_HOLD_MS
    const flash = Math.floor(now / 120) % 2 === 0
    ctx.strokeStyle = flash
      ? `rgba(255, 60, 60, ${0.35 + hitT * 0.4})`
      : `rgba(77, 166, 255, ${0.35 + hitT * 0.4})`
    ctx.shadowColor = flash ? '#ff3c3c' : '#4da6ff'
    ctx.shadowBlur = 12
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(player.x, player.y, 30 + (1 - hitT) * 14, 0, Math.PI * 2)
    ctx.stroke()
    ctx.shadowBlur = 0
  }
  // Ambient pedestrians: simple cosmetic walk with bounded horizontal wrap;
  // a panicked witness sprints directly away from the player until its panic window ends
  for (const ped of pedestrians) {
    if (ped.panicUntilMs !== undefined && now < ped.panicUntilMs) {
      const dxPanic = ped.x - player.x
      const dyPanic = ped.y - player.y
      const distPanic = Math.hypot(dxPanic, dyPanic) || 1
      ped.x += (dxPanic / distPanic) * DRIVER_FLEE_SPEED * dt
      ped.y += (dyPanic / distPanic) * DRIVER_FLEE_SPEED * dt
    } else {
      ped.x += ped.dir * ped.speed * dt
    }
    if (ped.dir > 0 && ped.x > WORLD_W + 24) ped.x = -24
    if (ped.dir < 0 && ped.x < -24) ped.x = WORLD_W + 24
    ped.y = Math.max(30, Math.min(WORLD_H - 30, ped.y))
  }
  for (const ped of pedestrians) {
    const walkBob = Math.sin(now / 130 + ped.phase) > 0 ? 1.5 : 0
    ctx.strokeStyle = ped.color
    ctx.shadowColor = ped.color
    ctx.shadowBlur = 8
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    const px = ped.x
    const py = ped.y + walkBob
    ctx.beginPath()
    ctx.arc(px, py - 11, 3.2, 0, Math.PI * 2)
    ctx.moveTo(px, py - 7.5)
    ctx.lineTo(px, py + 2)
    ctx.moveTo(px, py + 2)
    ctx.lineTo(px - 4, py + 8)
    ctx.moveTo(px, py + 2)
    ctx.lineTo(px + 4, py + 8)
    ctx.stroke()
    // Panicked witness marker: pulsing red WITNESS tag while the panic window is live
    if (ped.panicUntilMs !== undefined && now < ped.panicUntilMs) {
      ctx.font = '9px ui-monospace, Consolas, monospace'
      ctx.textAlign = 'center'
      ctx.fillStyle = `rgba(255, 60, 60, ${0.55 + 0.45 * Math.sin(now / 120)})`
      ctx.shadowColor = '#ff3c3c'
      ctx.shadowBlur = 10
      ctx.fillText('WITNESS', px, py - 20)
      ctx.shadowBlur = 0
      ctx.textAlign = 'left'
    }
    ctx.shadowBlur = 0
  }
  drawCourierCar(driving)
  // Stolen ride renders in its own paint; a wrecked one keeps smoking where it died
  if (stolenCar) {
    drawCarPose(stolenCar.x, stolenCar.y, stolenCar.angle, stolenCar.color, driving, stolenCar.speed, STOLEN_MAX_SPEED, stolenHull, !driving && stolenHull <= 0, now)
  }
  // Fleeing jacked driver: sprint away from the player until far enough to despawn
  if (fleeingDriver) {
    const dxFlee = fleeingDriver.x - player.x
    const dyFlee = fleeingDriver.y - player.y
    const distFlee = Math.hypot(dxFlee, dyFlee) || 1
    if (distFlee < DRIVER_DESPAWN_DIST) {
      const ang = Math.atan2(dyFlee, dxFlee)
      fleeingDriver.angle = ang
      fleeingDriver.x += Math.cos(ang) * DRIVER_FLEE_SPEED * dt
      fleeingDriver.y += Math.sin(ang) * DRIVER_FLEE_SPEED * dt
    }
    if (distFlee >= DRIVER_DESPAWN_DIST) {
      fleeingDriver = null
    } else {
      const runBob = Math.sin(now / 110) > 0 ? 1.5 : 0
      const fx = fleeingDriver.x
      const fy = fleeingDriver.y + runBob
      ctx.strokeStyle = '#ff6b8a'
      ctx.shadowColor = '#ff6b8a'
      ctx.shadowBlur = 9
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.arc(fx, fy - 11, 3.2, 0, Math.PI * 2)
      ctx.moveTo(fx, fy - 7.5)
      ctx.lineTo(fx, fy + 2)
      ctx.moveTo(fx, fy + 2)
      ctx.lineTo(fx - 4, fy + 8)
      ctx.moveTo(fx, fy + 2)
      ctx.lineTo(fx + 4, fy + 8)
      ctx.stroke()
      ctx.shadowBlur = 0
    }
  }
  // Carjack flash: sharp white/pink burst at the door the moment the driver is yanked out
  if (now < jackFlashUntilMs) {
    const flashT = (jackFlashUntilMs - now) / CARJACK_FLASH_MS
    ctx.strokeStyle = `rgba(255, 45, 150, ${0.5 + flashT * 0.5})`
    ctx.shadowColor = '#ff2d96'
    ctx.shadowBlur = 18 * flashT + 6
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(player.x, player.y, 26 + (1 - flashT) * 30, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = `rgba(255, 248, 214, ${0.35 * flashT})`
    ctx.beginPath()
    ctx.arc(player.x, player.y, 16, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  }
  const nearCourier = Math.hypot(player.x - courierCar.x, player.y - courierCar.y) < COURIER_ENTER_RADIUS
  const nearParkedStolen =
    !driving && !!stolenCar && stolenHull > 0 && Math.hypot(player.x - stolenCar.x, player.y - stolenCar.y) < CARJACK_RADIUS
  const jackTarget = !driving && !stolenCar ? nearestJackableCar() : null
  const dropDist = Math.round(Math.hypot(player.x - SKYWAY_DROP_OFF.x, player.y - SKYWAY_DROP_OFF.y))
  let courierText: string
  if (driving && isStolenRide()) {
    courierText = `STOLEN RIDE // HULL ${Math.round(stolenHull)}% — ${STOLEN_RIDE_TEXT} — SLOWS UNDER 80 FOR E`
  } else if (driving) {
    courierText = contractState === 'active'
      ? `COURIER RUN // HOT DELIVERY — ${dropDist}M — ${deliveryTimeLeftSec ?? 45}S LEFT — STOP + E TO DELIVER`
      : `COURIER // DRIVING ${Math.round(Math.abs(courierCar.speed) * 0.6)} KMH — SPACE BOOST — SLOWS UNDER 80 FOR E`
  } else if (nearParkedStolen) {
    courierText = 'STOLEN RIDE // PRESS E TO GET BACK IN'
  } else if (stolenCar && stolenHull <= 0) {
    courierText = 'WRECK ABANDONED // FIND ANOTHER CAR OR RETURN TO THE COURIER'
  } else if (jackTarget) {
    courierText = 'PRESS E TO CARJACK'
  } else if (nearCourier) {
    courierText = 'COURIER // PRESS E TO DRIVE'
  } else if (stolenCar) {
    courierText = 'COURIER PARKED — PRESS E NEARBY TO RECOVER'
  } else {
    courierText = ''
  }
  if (courierEl.textContent !== courierText) courierEl.textContent = courierText
  courierEl.style.display = courierText ? '' : 'none'

  // Safehouse prompt: on-foot players inside the zone see the heat-clear hint
  const nearSafehouse = !driving && Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < SAFEHOUSE.radius
  if (safehouseEl.style.display !== (nearSafehouse ? '' : 'none')) {
    safehouseEl.style.display = nearSafehouse ? '' : 'none'
  }

  // Job board legend: visible only on foot inside the safehouse; the stash entry
  // flips to a secured note so the board never advertises an already-claimed pickup
  const jobboardVisible = !driving && nearSafehouse
  if (jobboardEl.style.display !== (jobboardVisible ? '' : 'none')) {
    jobboardEl.style.display = jobboardVisible ? '' : 'none'
  }
  const jobboardText = stashCollected
    ? 'JOBS // B BLACKOUT // K BANK // V VIP // C CONVOY // J JUNCTION // X TAKEOVER // O SMUGGLER // I CHOP SHOP // STASH SECURED // N RACE'
    : 'JOBS // B BLACKOUT // K BANK // V VIP // C CONVOY // J JUNCTION // X TAKEOVER // O SMUGGLER // I CHOP SHOP // Z STASH // N RACE'
  if (jobboardEl.textContent !== jobboardText) jobboardEl.textContent = jobboardText

  // Crew Cover HUD countdown: compact cyan readout only while the temporary effect is live
  const crewCoverSec = Math.max(0, Math.ceil((crewCoverUntilMs - now) / 1000))
  const crewCoverActive = now < crewCoverUntilMs
  const crewText = crewCoverActive ? `CREW COVER ${crewCoverSec}S` : ''
  if (crewEl.textContent !== crewText) crewEl.textContent = crewText
  if (crewEl.style.display !== (crewCoverActive ? '' : 'none')) {
    crewEl.style.display = crewCoverActive ? '' : 'none'
  }

  // Safehouse hint composes every available interaction: H heat, B blackout, G garage, N race
  const blackoutAcceptableNow =
    !driving &&
    blackoutState === 'available' &&
    contractState !== 'active' &&
    !missionComplete &&
    Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < BLACKOUT_ACCEPT_RADIUS
  const blackoutEscapingNow = blackoutState === 'escaping'
  const raceAcceptableNow =
    !driving &&
    raceState === 'available' &&
    contractState !== 'active' &&
    blackoutState === 'available' &&
    !missionComplete &&
    Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < RACE_ACCEPT_RADIUS
  const bankAcceptableNow =
    !driving &&
    bankState === 'available' &&
    contractState !== 'active' &&
    blackoutState === 'available' &&
    raceState === 'available' &&
    !missionComplete &&
    Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < BANK_ACCEPT_RADIUS
  const bankEscapingNow = bankState === 'escaping'
  const vipAcceptableNow =
    !driving &&
    vipState === 'available' &&
    contractState !== 'active' &&
    blackoutState === 'available' &&
    raceState === 'available' &&
    bankState === 'available' &&
    !missionComplete &&
    Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < VIP_ACCEPT_RADIUS
  const vipEscapingNow = vipState === 'escaping'
  const convoyEscapingNow = convoyState === 'escaping'
  const jJobEscapingNow = jJobState === 'escaping'
  const turfEscapingNow = turfState === 'escaping'
  const turfShowdownNow = turfState === 'active'
  const smugglerRunningNow = smugglerState === 'pickup' || smugglerState === 'drop'
  const chopShopRunningNow = chopShopState === 'steal' || chopShopState === 'return'
  // Advertise the takeover offer wherever it is still open without displacing the standing hints
  const turfOfferHint = turfState === 'available' ? 'PRESS X FOR DISTRICT TAKEOVER // ' : ''
  // Advertise the smuggler offer wherever it is still open without displacing the standing hints
  const smugglerOfferHint = smugglerState === 'available' ? 'PRESS O FOR SMUGGLER RUN // ' : ''
  // Advertise the convoy offer wherever it is still open without displacing the standing hints
  const convoyOfferHint = convoyState === 'available' ? 'PRESS C FOR ARMORED CONVOY // ' : ''
  // Advertise the junction offer wherever it is still open without displacing the standing hints
  const jJobOfferHint = jJobState === 'available' ? 'PRESS J FOR JUNCTION JOB // ' : ''
  // Advertise the chop shop offer wherever it is still open without displacing the standing hints
  const chopShopOfferHint = chopShopState === 'available' ? 'I CHOP SHOP // ' : ''
  // Garage status composes onto every safehouse line so H, B, G, T, N, K, and V all stay visible
  const garageStatusHint = garageUpgradeLevel >= GARAGE_TIERS.length
    ? 'GARAGE // MAXED'
    : cash >= GARAGE_TIERS[garageUpgradeLevel].cost
      ? `GARAGE // TIER ${garageUpgradeLevel}/3 // PRESS G ($${GARAGE_TIERS[garageUpgradeLevel].cost})`
      : `GARAGE // TIER ${garageUpgradeLevel}/3 // EARN $${GARAGE_TIERS[garageUpgradeLevel].cost}`
  const repairStatusHint = carHealth < 100
    ? cash >= REPAIR_COST
      ? 'PRESS T TO REPAIR ($150)'
      : `EARN $${REPAIR_COST} FOR REPAIR`
    : 'HULL OK'
  let safehouseHint: string
  if (turfShowdownNow) {
    safehouseHint = `SAFEHOUSE // DISTRICT TAKEOVER // CLEAR RIVAL CREW — ${rivalsRemaining()} LEFT // PULSE F // ${garageStatusHint} // ${repairStatusHint}`
  } else if (chopShopRunningNow) {
    safehouseHint = `SAFEHOUSE // CHOP SHOP // ${chopShopState === 'steal' ? 'REACH THE TARGET VEHICLE' : 'RETURN TO SAFEHOUSE'} // ${garageStatusHint} // ${repairStatusHint}`
  } else if (smugglerRunningNow) {
    safehouseHint = `SAFEHOUSE // SMUGGLER RUN // ${smugglerState === 'pickup' ? 'REACH THE PICKUP SITE' : 'REACH THE DROP SITE'} // ${garageStatusHint} // ${repairStatusHint}`
  } else if (turfEscapingNow) {
    safehouseHint = `SAFEHOUSE // DISTRICT TAKEOVER // RETURN TO SAFEHOUSE // ${smugglerOfferHint}${chopShopOfferHint}${garageStatusHint} // ${repairStatusHint}`
  } else if (jJobEscapingNow) {
    safehouseHint = `SAFEHOUSE // JUNCTION JOB // RETURN TO SAFEHOUSE // ${smugglerOfferHint}${turfOfferHint}${chopShopOfferHint}${garageStatusHint} // ${repairStatusHint}`
  } else if (convoyEscapingNow) {
    safehouseHint = `SAFEHOUSE // ARMORED CONVOY // RETURN TO SAFEHOUSE // ${smugglerOfferHint}${jJobOfferHint}${turfOfferHint}${garageStatusHint} // ${repairStatusHint}`
  } else if (blackoutEscapingNow) {
    safehouseHint = `SAFEHOUSE // RETURN TO BANK BLACKOUT RUN // ${smugglerOfferHint}${convoyOfferHint}${jJobOfferHint}${turfOfferHint}${chopShopOfferHint}${garageStatusHint} // ${repairStatusHint}`
  } else if (vipEscapingNow) {
    safehouseHint = `SAFEHOUSE // VIP EXTRACTION // RETURN TO SAFEHOUSE // ${smugglerOfferHint}${convoyOfferHint}${jJobOfferHint}${turfOfferHint}${chopShopOfferHint}${garageStatusHint} // ${repairStatusHint}`
  } else if (bankEscapingNow) {
    safehouseHint = `SAFEHOUSE // BANK RUN // RETURN WITH THE LOOT // ${smugglerOfferHint}${convoyOfferHint}${jJobOfferHint}${turfOfferHint}${chopShopOfferHint}${garageStatusHint} // ${repairStatusHint}`
  } else if (vipAcceptableNow) {
    safehouseHint = `SAFEHOUSE // PRESS V FOR VIP EXTRACTION // PRESS K FOR BANK RUN // MIDNIGHT SPRINT // PRESS N TO RACE // PRESS C FOR ARMORED CONVOY // H CLEAR HEAT // PRESS B FOR BLACKOUT RUN // ${turfOfferHint}${jJobOfferHint}${chopShopOfferHint}${smugglerOfferHint}${garageStatusHint} // ${repairStatusHint}`
  } else if (bankAcceptableNow) {
    safehouseHint = `SAFEHOUSE // PRESS K FOR BANK RUN // PRESS V FOR VIP EXTRACTION // MIDNIGHT SPRINT // PRESS N TO RACE // PRESS C FOR ARMORED CONVOY // H CLEAR HEAT // PRESS B FOR BLACKOUT RUN // ${turfOfferHint}${jJobOfferHint}${chopShopOfferHint}${smugglerOfferHint}${garageStatusHint} // ${repairStatusHint}`
  } else if (raceAcceptableNow) {
    safehouseHint = `SAFEHOUSE // MIDNIGHT SPRINT // PRESS N TO RACE // PRESS V FOR VIP EXTRACTION // PRESS C FOR ARMORED CONVOY // H CLEAR HEAT // PRESS B FOR BLACKOUT RUN // ${jJobOfferHint}${turfOfferHint}${chopShopOfferHint}${smugglerOfferHint}${garageStatusHint} // ${repairStatusHint}`
  } else if (blackoutAcceptableNow) {
    safehouseHint = `SAFEHOUSE // PRESS B FOR BLACKOUT RUN // PRESS V FOR VIP EXTRACTION // PRESS C FOR ARMORED CONVOY // H CLEAR HEAT // ${jJobOfferHint}${turfOfferHint}${chopShopOfferHint}${smugglerOfferHint}${garageStatusHint} // ${repairStatusHint}`
  } else if (nearSafehouse) {
    safehouseHint = `SAFEHOUSE // H CLEAR HEAT // PRESS V FOR VIP EXTRACTION // ${chopShopOfferHint}${smugglerOfferHint}${convoyOfferHint}${jJobOfferHint}${turfOfferHint}${garageStatusHint} // ${repairStatusHint}`
  } else {
    safehouseHint = SAFEHOUSE_CLEAR_TEXT
  }
  if (safehouseEl.textContent !== safehouseHint) {
    safehouseEl.textContent = safehouseHint
  }

  // Police scan readout: nearest active hunter's distance while heat is up
  if (scanDrone) {
    const scanText = `POLICE SCAN // NEAREST UNIT ${Math.round(scanDist)}M`
    if (scanEl.textContent !== scanText) scanEl.textContent = scanText
    if (scanEl.style.display !== '') scanEl.style.display = ''
  } else if (scanEl.style.display !== 'none') {
    scanEl.style.display = 'none'
  }

  // Police dispatch readout: mirrors the wanted level while any heat is up.
  // While heat passively cools (player continuously clear of hunter scan range) the line
  // shows a live countdown to the next shed so escaping visibly makes progress
  let pursuitText: string
  if (wanted > 0 && heatCoolStartMs !== 0 && heatCoolRequiredMs > 0) {
    const coolLeftSec = Math.ceil((heatCoolRequiredMs - (now - heatCoolStartMs)) / 1000)
    pursuitText = `POLICE PURSUIT // HEAT ${wanted}/3 // COOLING -1 IN ${Math.max(1, coolLeftSec)}S // Q JAM // H SAFEHOUSE`
  } else {
    pursuitText = `POLICE PURSUIT // HEAT ${wanted}/3 // Q JAM // H SAFEHOUSE`
  }
  if (pursuitEl.textContent !== pursuitText) pursuitEl.textContent = pursuitText
  if (pursuitEl.style.display !== (wanted > 0 ? '' : 'none')) {
    pursuitEl.style.display = wanted > 0 ? '' : 'none'
  }

  // Roadblock escalation tag: amber line while the interceptor response is live
  if (roadblockEl.style.display !== (roadblock.active ? '' : 'none')) {
    roadblockEl.style.display = roadblock.active ? '' : 'none'
  }

  // Air support tag: pale steel line while the spotlight helicopter is overhead
  if (airUnitEl.style.display !== (airUnit.active ? '' : 'none')) {
    airUnitEl.style.display = airUnit.active ? '' : 'none'
  }

  // Wanted-3 air support readout: red line only while heat is maxed
  if (airSupportEl.style.display !== (wanted === 3 ? '' : 'none')) {
    airSupportEl.style.display = wanted === 3 ? '' : 'none'
  }

  // Campaign act tracking: detect a genuine forward act transition and raise a one-shot
  // ACT COMPLETE banner naming the next act through the standard banner system
  const currentAct = campaignAct()
  if (currentAct !== lastCampaignAct) {
    if (actCompleteUntilMs <= now) {
      actCompleteBannerText = `ACT COMPLETE // ${currentAct}`
      actCompleteUntilMs = now + ACT_COMPLETE_HOLD_MS
      missionEl.textContent = actCompleteBannerText
    }
    lastCampaignAct = currentAct
  }

  // Wallet readout: mirrors the live cash/rep values every frame
  const walletText = `CASH $${cash} // REP ${rep}`
  if (walletEl.textContent !== walletText) walletEl.textContent = walletText

  // Campaign route compass: live label/distance/cardinal bearing toward the current
  // main-path target; hidden entirely when no campaign target remains
  const routeTarget = campaignRouteTarget()
  if (routeTarget) {
    const dxRoute = routeTarget.x - player.x
    const dyRoute = routeTarget.y - player.y
    const routeText = `ROUTE // ${routeTarget.label} // ${Math.round(Math.hypot(dxRoute, dyRoute))}M // ${cardinalDirection(dxRoute, dyRoute)}`
    if (routeEl.textContent !== routeText) routeEl.textContent = routeText
    if (routeEl.style.display !== '') routeEl.style.display = ''
  } else if (routeEl.style.display !== 'none') {
    routeEl.style.display = 'none'
    routeEl.textContent = ''
  }

  // Street Cred row + one-shot rank-up detection: the HUD always mirrors the derived
  // band; a genuine upward transition after a rep change raises the temporary banner
  const currentRank = streetCredRank(rep)
  const credText = `STREET CRED // ${currentRank}`
  if (streetCredEl.textContent !== credText) streetCredEl.textContent = credText
  const rankOrder = ['RUNNER', 'OPERATOR', 'FIXER', 'KINGPIN']
  if (rankOrder.indexOf(currentRank) > rankOrder.indexOf(lastStreetCredRank)) {
    streetCredRankUpUntilMs = now + STREET_CRED_RANK_UP_HOLD_MS
    missionEl.textContent = `STREET CRED // ${currentRank} // RANK UP`
  }
  lastStreetCredRank = currentRank

  // Hull readout: health percentage plus a compact bar that shifts color as damage accrues
  const hullPct = Math.max(0, Math.min(100, Math.round(carHealth)))
  const hullPctText = String(hullPct)
  if (hullPctEl.textContent !== hullPctText) hullPctEl.textContent = hullPctText
  hullFillEl.style.width = `${hullPct}%`
  hullFillEl.style.background = carHealth > 60 ? '#39ff88' : carHealth > 30 ? '#ffe05a' : '#ff3c3c'
  hullEl.style.color = carHealth > 60 ? '#39ff88' : carHealth > 30 ? '#ffe05a' : '#ff3c3c'

  // Signal recovery pulse: short cyan ring expanding at the collected position
  for (const pulse of signalPulses) {
    const t = 1 - (pulse.untilMs - now) / SIGNAL_PULSE_MS
    if (t < 0 || t > 1) continue
    ctx.strokeStyle = `rgba(0, 240, 255, ${0.8 * (1 - t)})`
    ctx.shadowColor = '#00f0ff'
    ctx.shadowBlur = 16 * (1 - t)
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(pulse.x, pulse.y, 14 + t * 46, 0, Math.PI * 2)
    ctx.stroke()
    ctx.shadowBlur = 0
  }

  signals.forEach((s, i) => {
    if (signalsFound > i) return
    if (Math.hypot(player.x - s.x, player.y - s.y) < player.size + 16) {
      signalsFound++
      signalEls.count.textContent = String(signalsFound)
      signalPulses.push({ x: s.x, y: s.y, untilMs: now + SIGNAL_PULSE_MS })
      if (!missionComplete) setWanted(wanted + 1)
      if (signalsFound === 3 && !missionComplete) {
        signalEls.complete.hidden = false
        signalBannerText = 'SIGNAL SWEEP COMPLETE // EXTRACTION UNLOCKED'
        signalBannerUntilMs = now + SIGNAL_BANNER_HOLD_MS
        missionEl.textContent = signalBannerText
        if (contractState !== 'active') {
          // the sweep banner takes this frame; the phase-2 line follows via campaignMissionText()
        }
      } else if (!missionComplete) {
        signalBannerText = `SIGNAL RECOVERED // ${signalsFound}/3`
        signalBannerUntilMs = now + SIGNAL_BANNER_HOLD_MS
        missionEl.textContent = signalBannerText
      }
      return
    }
    const bob = Math.sin(now / 260 + i * 2.1) * 5
    ctx.strokeStyle = '#ffe05a'
    ctx.lineWidth = 3
    ctx.shadowColor = '#ffe05a'
    ctx.shadowBlur = 22 + Math.sin(now / 180 + i) * 10
    ctx.beginPath()
    ctx.arc(s.x, s.y + bob, 12, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(s.x, s.y + bob, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#fff8d6'
    ctx.fill()
    ctx.shadowBlur = 0
  })

  // Civilian traffic cars (drawn under player + drones)
  traffic.forEach(t => {
    if (t === stolenCar) return
    const half = t.length / 2
    const rear = t.dir > 0 ? -half : half
    const front = -rear

    ctx.shadowColor = t.color
    ctx.shadowBlur = 10
    ctx.strokeStyle = t.color
    ctx.lineWidth = 2
    ctx.strokeRect(t.x - half, t.laneY - 9, t.length, 18)

    // window strip
    ctx.fillStyle = 'rgba(191, 255, 255, 0.5)'
    ctx.fillRect(t.x - half + t.length * 0.28, t.laneY - 6, t.length * 0.44, 5)

    // taillights at rear, headlights at front
    ctx.shadowBlur = 8
    ctx.fillStyle = '#ff2d96'
    ctx.fillRect(t.x + rear - (t.dir > 0 ? 4 : 0), t.laneY - 7, 4, 3)
    ctx.fillRect(t.x + rear - (t.dir > 0 ? 4 : 0), t.laneY + 4, 4, 3)
    ctx.fillStyle = 'rgba(255, 248, 214, 0.85)'
    ctx.fillRect(t.x + front - (t.dir > 0 ? 0 : 4), t.laneY - 7, 4, 3)
    ctx.fillRect(t.x + front - (t.dir > 0 ? 0 : 4), t.laneY + 4, 4, 3)
    ctx.shadowBlur = 0
  })

  // Neon street-runner: small car with body, windshield, headlights, direction
  // hidden while driving the courier so only the coupe renders
  const angle = Math.atan2(facing.dx, -facing.dy)
  const boostingGlow = boost.active ? 30 : 14
  ctx.save()
  ctx.translate(player.x, player.y)
  ctx.rotate(angle)

  if (boost.active) {
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)'
    ctx.lineWidth = 2
    for (const off of [-6, 6]) {
      ctx.beginPath()
      ctx.moveTo(off, 18)
      ctx.lineTo(off, 30 + Math.random() * 14)
      ctx.stroke()
    }
  }

  // headlight beams point along travel direction
  const beam = ctx.createLinearGradient(0, -17, 0, -60)
  beam.addColorStop(0, 'rgba(255, 248, 214, 0.5)')
  beam.addColorStop(1, 'rgba(255, 248, 214, 0)')
  ctx.fillStyle = beam
  ctx.beginPath()
  ctx.moveTo(-9, -15)
  ctx.lineTo(-22, -58)
  ctx.lineTo(22, -58)
  ctx.lineTo(9, -15)
  ctx.closePath()
  ctx.fill()

  // body
  ctx.shadowColor = '#39ff88'
  ctx.shadowBlur = boostingGlow
  ctx.strokeStyle = '#39ff88'
  ctx.lineWidth = 2
  ctx.strokeRect(-10, -16, 20, 32)

  // windshield
  ctx.fillStyle = '#bfffff'
  ctx.fillRect(-7, -11, 14, 8)
  // rear window
  ctx.fillStyle = 'rgba(191, 255, 255, 0.55)'
  ctx.fillRect(-6, 6, 12, 5)

  // headlights
  ctx.shadowColor = '#fff8d6'
  ctx.shadowBlur = 12
  ctx.fillStyle = '#fff8d6'
  ctx.fillRect(-8, -18, 5, 3)
  ctx.fillRect(3, -18, 5, 3)
  // taillights
  ctx.fillStyle = '#ff2d96'
  ctx.shadowColor = '#ff2d96'
  ctx.fillRect(-8, 13, 5, 3)
  ctx.fillRect(3, 13, 5, 3)
  ctx.restore()
  ctx.shadowBlur = 0

  // Pulse bolts + muzzle flash
  if (now < pulse.flashUntil) {
    ctx.fillStyle = '#bfffff'
    ctx.shadowColor = '#00f0ff'
    ctx.shadowBlur = 18
    ctx.beginPath()
    ctx.arc(player.x + facing.dx * 20, player.y + facing.dy * 20, 7, 0, Math.PI * 2)
    ctx.fill()
  }
  pulse.bolts.forEach(b => {
    const tailX = b.x - b.dx * 14
    const tailY = b.y - b.dy * 14
    ctx.strokeStyle = '#00f0ff'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.shadowColor = '#00f0ff'
    ctx.shadowBlur = 16
    ctx.beginPath()
    ctx.moveTo(tailX, tailY)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
    ctx.fillStyle = '#eaffff'
    ctx.beginPath()
    ctx.arc(b.x, b.y, 3.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  })
  ctx.shadowBlur = 0

  // Visible police cruisers hunting while wanted
  if (wanted > 0) {
    for (const u of policeUnits) {
      drawPoliceUnit(u, true, now)
    }
  }

  // Roadblock response: striped barrier across the approach lane + interceptor cruiser
  // with alternating red/blue lights; the HUD tag reads ROADBLOCK while it is live
  if (roadblock.active) {
    const barAng = roadblock.angle
    const barX = roadblock.x - Math.sin(barAng) * ROADBLOCK_BARRIER_OFFSET * 0.4
    const barY = roadblock.y - Math.cos(barAng) * ROADBLOCK_BARRIER_OFFSET * 0.4
    ctx.save()
    ctx.translate(barX, barY)
    ctx.rotate(barAng)
    const stripeW = 9
    for (let i = -2; i <= 2; i++) {
      ctx.fillStyle = (i + 2) % 2 === 0 ? '#ffb300' : '#1c2033'
      ctx.shadowColor = '#ffb300'
      ctx.shadowBlur = i === 0 ? 12 : 5
      ctx.fillRect(i * stripeW + 0.5, 0, stripeW - 1, 8)
    }
    // end posts with blinking beacons
    const beaconOn = Math.floor(now / 260) % 2 === 0
    ctx.fillStyle = '#ff3c3c'
    ctx.shadowColor = '#ff3c3c'
    ctx.shadowBlur = beaconOn ? 10 : 3
    ctx.fillRect(-2.5, -14, 5, 12)
    ctx.fillStyle = '#00f0ff'
    ctx.shadowColor = '#00f0ff'
    ctx.shadowBlur = beaconOn ? 3 : 10
    ctx.fillRect(-2.5, -14, 5, 12)
    ctx.restore()
    ctx.shadowBlur = 0

    // interceptor renders nose-first along its travel bearing (stored angle is offset by PI/2
    // for the shared steering convention); headlights face down the approach lane
    drawPolicePose(roadblock.x, roadblock.y, roadblock.angle - Math.PI / 2, roadblock.sirenPhase, true, now)

    ctx.font = '600 10px ui-monospace, Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ff3c3c'
    ctx.shadowColor = '#ff3c3c'
    ctx.shadowBlur = 8
    ctx.fillText('ROADBLOCK', roadblock.x, roadblock.y - 30)
    ctx.shadowBlur = 0
  }

  // Wanted-3 air support: dark helicopter silhouette with spinning rotors and a sweeping
  // spotlight cone that tracks the courier; drawn above vehicles so it reads as airborne
  if (airUnit.active) {
    const bobAir = Math.sin(now / 210) * 3
    // spotlight cone: wide translucent wedge from the unit toward the courier's position
    const spotAng = Math.atan2(courierCar.y - airUnit.y, courierCar.x - airUnit.x)
    const spotLen = Math.min(420, Math.hypot(courierCar.x - airUnit.x, courierCar.y - airUnit.y) + 60)
    const sweep = Math.sin(now / 320) * 0.16
    ctx.save()
    ctx.translate(airUnit.x, airUnit.y + bobAir)
    ctx.rotate(spotAng + sweep)
    const cone = ctx.createLinearGradient(0, 0, spotLen, 0)
    cone.addColorStop(0, 'rgba(255, 248, 214, 0.34)')
    cone.addColorStop(1, 'rgba(255, 248, 214, 0)')
    ctx.fillStyle = cone
    ctx.beginPath()
    ctx.moveTo(0, -6)
    ctx.lineTo(spotLen, -spotLen * 0.36)
    ctx.lineTo(spotLen, spotLen * 0.36)
    ctx.lineTo(0, 6)
    ctx.closePath()
    ctx.fill()
    // bright pool at the target end so the lit ground reads clearly
    ctx.fillStyle = 'rgba(255, 248, 214, 0.22)'
    ctx.beginPath()
    ctx.ellipse(spotLen * 0.92, 0, 46, 26, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // silhouette: dark fuselage along travel bearing with tail boom and skids
    ctx.save()
    ctx.translate(airUnit.x, airUnit.y + bobAir)
    ctx.rotate(airUnit.angle)
    ctx.strokeStyle = '#141828'
    ctx.shadowColor = '#ff3c3c'
    ctx.shadowBlur = now % 500 < 250 ? 10 : 4
    ctx.lineWidth = 2.5
    ctx.strokeRect(-9, -7, 20, 14)
    ctx.beginPath()
    ctx.moveTo(11, 0)
    ctx.lineTo(24, 0)
    ctx.moveTo(21, -5)
    ctx.lineTo(21, 5)
    ctx.stroke()
    // cockpit glass hint
    ctx.strokeStyle = 'rgba(191, 255, 255, 0.55)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(3, 0, 4.5, -Math.PI / 2, Math.PI / 2)
    ctx.stroke()
    // skids
    ctx.strokeStyle = '#141828'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(-6, 10)
    ctx.lineTo(8, 10)
    ctx.moveTo(-6, -10)
    ctx.lineTo(8, -10)
    ctx.stroke()
    ctx.restore()

    // main rotor disc: spinning blur line pair over the hull
    ctx.save()
    ctx.translate(airUnit.x, airUnit.y + bobAir)
    ctx.rotate(now / 90)
    ctx.strokeStyle = 'rgba(200, 210, 235, 0.65)'
    ctx.shadowColor = '#c8d2eb'
    ctx.shadowBlur = 6
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(-22, 0)
    ctx.lineTo(22, 0)
    ctx.moveTo(0, -22)
    ctx.lineTo(0, 22)
    ctx.stroke()
    ctx.restore()
    // tail rotor flicker
    ctx.strokeStyle = 'rgba(200, 210, 235, 0.8)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    const tailX = airUnit.x + Math.cos(airUnit.angle) * 24
    const tailY = airUnit.y + Math.sin(airUnit.angle) * 24
    ctx.moveTo(tailX - 4, tailY)
    ctx.lineTo(tailX + 4, tailY)
    ctx.stroke()
    ctx.shadowBlur = 0

    // world label
    ctx.font = '600 10px ui-monospace, Consolas, monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#c8d2eb'
    ctx.shadowColor = '#c8d2eb'
    ctx.shadowBlur = 8
    ctx.fillText('AIR UNIT', airUnit.x, airUnit.y - 32)
    ctx.shadowBlur = 0
  }

  // Cyan patrol drones
  drones.forEach(d => {
    const disabled = now < d.disabledUntil
    const hover = Math.sin(now / 240 + d.x) * 3
    ctx.save()
    ctx.translate(d.x, d.y + hover)

    // scanning rotor glow / disabled state
    ctx.strokeStyle = disabled ? 'rgba(120, 130, 150, 0.6)' : '#00f0ff'
    ctx.shadowColor = '#00f0ff'
    ctx.shadowBlur = disabled ? 4 : 18
    ctx.lineWidth = 2

    // rotor arms
    ctx.beginPath()
    ctx.moveTo(-16, -10)
    ctx.lineTo(16, 10)
    ctx.moveTo(-16, 10)
    ctx.lineTo(16, -10)
    ctx.stroke()

    // hull
    ctx.strokeRect(-8, -8, 16, 16)

    // eye light: red-hot when chasing, dim when disabled
    if (!disabled) {
      ctx.fillStyle = wanted > 0 && Math.hypot(player.x - d.x, player.y - d.y) < 520 ? '#ff2d96' : '#bfffff'
      ctx.shadowColor = ctx.fillStyle as string
      ctx.beginPath()
      ctx.arc(0, 0, 4 + Math.sin(now / 90) * 1.5, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillStyle = 'rgba(20, 30, 45, 0.9)'
      ctx.fillRect(-7, -7, 14, 14)
      ctx.strokeStyle = 'rgba(120, 130, 150, 0.5)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(-5, -5)
      ctx.lineTo(5, 5)
      ctx.moveTo(5, -5)
      ctx.lineTo(-5, 5)
      ctx.stroke()
    }
    ctx.restore()
    ctx.shadowBlur = 0
  })

  ctx.restore()
  drawRadar(now)

  requestAnimationFrame(frame)
}

// Best-effort auto-load on boot: a page reload picks the saved slot back up; malformed data is ignored
{
  const bootData = readSave()
  if (bootData) {
    signalsFound = Math.max(0, Math.min(signals.length, bootData.signalsFound))
    signalEls.count.textContent = String(signalsFound)
    signalEls.complete.hidden = signalsFound < signals.length
    cash = Number.isFinite(bootData.cash) ? bootData.cash : 0
    rep = Number.isFinite(bootData.rep) ? bootData.rep : 0
    missionComplete = bootData.missionComplete
    runCompleteEl.hidden = !missionComplete
    blackoutState = bootData.blackoutCompleted ? 'complete' : 'available'
    kingpinOnline = bootData.kingpinOnline === true && missionComplete
    networkJobState = kingpinOnline && bootData.networkJobComplete === true ? 'complete' : 'available'
    if (kingpinOnline) {
      districtControlIndex = Math.max(0, Math.min(DISTRICT_CONTROL_SITES.length, bootData.districtsControlled ?? 0))
    } else {
      districtControlIndex = 0
    }
    const restoredGarageLevel =
      typeof bootData.garageUpgradeLevel === 'number' ? bootData.garageUpgradeLevel : (bootData.garageTuneInstalled ? 1 : 0)
    garageUpgradeLevel = Math.max(0, Math.min(GARAGE_TIERS.length, restoredGarageLevel))
    garageTuneInstalled = garageUpgradeLevel >= 1
    if (garageUpgradeLevel >= 1) {
      courierCar.maxSpeed += GARAGE_TUNE_MAX_SPEED_BONUS
      courierCar.accel += GARAGE_TUNE_ACCEL_BONUS
    }
    if (typeof bootData.carHealth === 'number' && Number.isFinite(bootData.carHealth)) {
      carHealth = Math.max(0, Math.min(100, bootData.carHealth))
    }
    if (
      typeof bootData.carX === 'number' && Number.isFinite(bootData.carX) &&
      typeof bootData.carY === 'number' && Number.isFinite(bootData.carY)
    ) {
      courierCar.x = Math.max(24, Math.min(WORLD_W - 24, bootData.carX))
      courierCar.y = Math.max(24, Math.min(WORLD_H - 24, bootData.carY))
    }
    if (typeof bootData.carAngle === 'number' && Number.isFinite(bootData.carAngle)) courierCar.angle = bootData.carAngle
    stashCollected = bootData.stashCollected === true
    nightShiftEnabled = bootData.nightShiftEnabled === true
  }
}

// Boot-time wanted HUD paint through the single setWanted path, so a fresh run renders
// WANTED 0/3 (empty stars) immediately instead of a blank stars slot until first heat
setWanted(0)

requestAnimationFrame(frame)
