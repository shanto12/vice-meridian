import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <h1 class="title">VICE//MERIDIAN</h1>
  <canvas id="game"></canvas>
  <div class="hud">
    <p class="hud-count">SIGNALS <span id="signal-count">0</span>/3</p>
    <p class="hud-mission" id="mission-line">MISSION // Sweep the grid — recover 3 relay signals</p>
    <p class="hud-boost">
      BOOST
      <span class="boost-bar"><span class="boost-fill" id="boost-fill"></span></span>
      <span class="boost-state" id="boost-state">READY</span>
    </p>
    <p class="hud-wanted" id="hud-wanted">WANTED <span id="wanted-count">0</span>/3</p>
    <p class="hud-pulse">PULSE F <span class="pulse-state" id="pulse-state">READY</span></p>
    <p class="hud-courier" id="hud-courier" style="display:none;margin:8px 0 0;font-size:12px;letter-spacing:3px;color:#ff9d3c;text-shadow:0 0 10px rgba(255,157,60,0.6);">COURIER // PRESS E TO DRIVE</p>
    <p class="hud-safehouse" id="hud-safehouse" style="display:none;margin:8px 0 0;font-size:12px;letter-spacing:3px;color:#00f0ff;text-shadow:0 0 10px rgba(0,240,255,0.6);">SAFEHOUSE // HOLD H TO CLEAR HEAT</p>
    <p class="hud-scan" id="hud-scan" style="display:none;margin:8px 0 0;font-size:12px;letter-spacing:3px;color:#ff3c3c;text-shadow:0 0 10px rgba(255,60,60,0.6);">POLICE SCAN // NEAREST UNIT ---M</p>
    <p class="hud-wallet" id="hud-wallet" style="margin:8px 0 0;font-size:12px;letter-spacing:3px;color:#ffe05a;text-shadow:0 0 10px rgba(255,224,90,0.6);">CASH $0 // REP 0</p>
  </div>
  <p class="complete" id="complete" hidden>ALL SIGNALS RECOVERED — GRID SECURE</p>
  <div class="run-complete" id="run-complete" hidden>
    <p class="run-title">RUN COMPLETE // EXTRACTION SECURED</p>
    <p class="run-stats" id="run-stats"></p>
    <p class="run-restart">PRESS R TO RESTART</p>
  </div>
  <p class="hint">WASD / ARROWS to move — HOLD SPACE to boost — Q to jam drones — F to pulse — E to enter/exit courier — G to tune at safehouse — P save — L load — R restart</p>
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
  if (e.code === 'Space' || e.code === 'KeyQ' || e.code === 'KeyF' || e.code === 'KeyE' || e.code === 'KeyG' || e.code === 'KeyP' || e.code === 'KeyL') {
    e.preventDefault()
  }
  if (e.code === 'KeyM') {
    e.preventDefault()
    mapOpen = !mapOpen
  }
  if (e.code === 'Escape' && mapOpen) {
    mapOpen = false
  }
  if (e.code === 'KeyQ') jammer.requested = true
  if (e.code === 'KeyF') pulse.requested = true
  if (e.code === 'KeyE') courierToggleRequested = true
  if (e.code === 'KeyH') safehouseRequested = true
  if (e.code === 'KeyB') blackoutRequested = true
  if (e.code === 'KeyG') garageRequested = true
  if (e.code === 'KeyP') saveRequested = true
  if (e.code === 'KeyL') loadRequested = true
  if (e.code === 'KeyR') restartRequested = true
})
window.addEventListener('keyup', e => keys.delete(e.code))

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

// Off-map heat dump: stand in the zone and press H; banner holds briefly, then mission text restores
const SAFEHOUSE = { x: WORLD_W * 0.18, y: WORLD_H * 0.62 + 180, radius: 110 }
const SAFEHOUSE_HOLD_MS = 2200
const SAFEHOUSE_CLEAR_TEXT = 'SAFEHOUSE // HEAT CLEARED'
let safehouseRequested = false
let safehouseRestoreAtMs = 0

// Safehouse garage tune: one-time $250 sprint kit for the courier coupe (KeyG)
const GARAGE_TUNE_COST = 250
const GARAGE_TUNE_MAX_SPEED_BONUS = 60
const GARAGE_TUNE_ACCEL_BONUS = 80
const GARAGE_HOLD_MS = 2600
const GARAGE_AFFORD_TEXT = 'GARAGE // SPRINT KIT INSTALLED -$250'
const GARAGE_POOR_TEXT = 'GARAGE // TUNE KIT COSTS $250'
let garageRequested = false
let garageTuneInstalled = false
let garageRestoreAtMs = 0
let garageBannerAfford = true

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
let cash = 0
let rep = 0

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
  carX?: number
  carY?: number
  carAngle?: number
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
      carX: courierCar.x,
      carY: courierCar.y,
      carAngle: courierCar.angle,
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
    return data as SaveData
  } catch {
    return null
  }
}

// Standing mission text used when temporary banners (courier/safehouse) hand the line back
function campaignMissionText(): string {
  if (contractState === 'active') {
    return contractDeadlineMs > 0
      ? `${HOT_DELIVERY_TEXT} — ${Math.max(0, Math.ceil((contractDeadlineMs - performance.now()) / 1000))}S`
      : HOT_DELIVERY_TEXT
  }
  if (contractState === 'complete' && contractRestoreAtMs > 0) return 'COURIER RUN // DELIVERED +$250 // REP +1'
  return signalsFound === 3 ? missionPhase2 : MISSION_SWEEP_TEXT
}

let mapOpen = false

let restartRequested = false
let missionComplete = false
let runStartMs = performance.now()
let runTimeSec = 0

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
}
const pulseEls = {
  state: document.querySelector<HTMLSpanElement>('#pulse-state')!,
}
const courierEl = document.getElementById('hud-courier')!
const safehouseEl = document.getElementById('hud-safehouse')!
const scanEl = document.getElementById('hud-scan')!
const walletEl = document.getElementById('hud-wallet')!
const missionEl = document.getElementById('mission-line')!
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
  missionEl.textContent = 'MISSION // Sweep the grid — recover 3 relay signals'
  runCompleteEl.hidden = true
  driving = false
  courierToggleRequested = false
  safehouseRequested = false
  garageRequested = false
  garageTuneInstalled = false
  garageRestoreAtMs = 0
  saveRequested = false
  loadRequested = false
  saveRestoreAtMs = 0
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
const traffic = Array.from({ length: 6 }, (_, i) => {
  const laneIndex = i % 3
  const dir = laneIndex === 0 ? 1 : -1
  return {
    x: (WORLD_W / 6) * i + 40,
    laneY: WORLD_H * 0.62 + 55 + laneIndex * ((WORLD_H * 0.38 - 90) / 2),
    dir,
    speed: 70 + ((i * 53) % 90),
    color: TRAFFIC_COLORS[i],
    length: 30 + ((i * 37) % 14),
  }
})

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

function setWanted(next: number) {
  wanted = Math.max(0, Math.min(3, next))
  wantedEls.count.textContent = String(wanted)
  wantedEls.row.classList.toggle('is-hot', wanted > 0)
}

function neonRect(x: number, y: number, width: number, height: number, color: string) {
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.shadowColor = color
  ctx.shadowBlur = 16
  ctx.strokeRect(x, y, width, height)
  ctx.shadowBlur = 0
}

// Amber neon coupe with cyan glass and a two-cell roof light bar — distinct from green runner and traffic
function drawCourierCar(isDriving: boolean) {
  ctx.save()
  ctx.translate(courierCar.x, courierCar.y)
  ctx.rotate(courierCar.angle)

  // speed streaks while driving fast
  if (isDriving && Math.abs(courierCar.speed) > 120) {
    const tail = Math.abs(courierCar.speed) > courierCar.maxSpeed * 0.9 ? 36 : 28
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)'
    ctx.lineWidth = 2
    for (const off of [-7, 7]) {
      ctx.beginPath()
      ctx.moveTo(off, 18)
      ctx.lineTo(off, tail + Math.random() * 12)
      ctx.stroke()
    }
  }

  // headlight beams along the heading
  const beam = ctx.createLinearGradient(0, -18, 0, -58)
  beam.addColorStop(0, 'rgba(255, 157, 60, 0.4)')
  beam.addColorStop(1, 'rgba(255, 157, 60, 0)')
  ctx.fillStyle = beam
  ctx.beginPath()
  ctx.moveTo(-9, -16)
  ctx.lineTo(-20, -56)
  ctx.lineTo(20, -56)
  ctx.lineTo(9, -16)
  ctx.closePath()
  ctx.fill()

  // body
  ctx.shadowColor = '#ff9d3c'
  ctx.shadowBlur = isDriving ? 26 : 18
  ctx.strokeStyle = '#ff9d3c'
  ctx.lineWidth = 2.5
  ctx.strokeRect(-11, -17, 22, 34)

  // windshield + rear window
  ctx.fillStyle = 'rgba(191, 255, 255, 0.5)'
  ctx.fillRect(-7, -12, 14, 8)
  ctx.fillStyle = 'rgba(191, 255, 255, 0.35)'
  ctx.fillRect(-6, 6, 12, 5)

  // roof light bar: amber/cyan cells
  ctx.shadowBlur = 10
  ctx.fillStyle = '#ffe05a'
  ctx.fillRect(-7, -3, 6, 4)
  ctx.fillStyle = '#00f0ff'
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
  ctx.shadowBlur = 0
}

function districtFor(x: number): string {
  if (x < WORLD_W / 3) return 'DOCKSIDE'
  if (x > (WORLD_W * 2) / 3) return 'SKYWAY'
  return 'NEON CORE'
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
  ctx.fillText('MAP OPEN // PRESS M TO CLOSE', mx + mw, padTop - 16)
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
      boost.energy = Math.min(100, boost.energy + (boost.cooldown ? 0 : boost.regen * dt))
      if (boost.cooldown && boost.energy >= 40) boost.cooldown = false
    }
  }

  const speedNow = player.speed * (boost.active ? boost.multiplier : 1)
  if (driving) {
    // arcade car physics: steering authority scales with roll speed
    let throttle = 0
    for (const code of keys) {
      const [kx, ky] = MOVE_KEYS[code]
      if (ky < 0) throttle = 1
      else if (ky > 0) throttle = -1
      if (kx !== 0) {
        const turnEff = 0.35 + 0.65 * Math.min(1, Math.abs(courierCar.speed) / 160)
        courierCar.angle += kx * courierCar.turnRate * dt * (courierCar.speed < 0 ? -1 : 1) * turnEff
      }
    }
    if (throttle > 0) {
      courierCar.speed = Math.min(courierCar.maxSpeed, courierCar.speed + courierCar.accel * dt)
    } else if (throttle < 0) {
      const rate = courierCar.speed > 0 ? courierCar.brake : courierCar.accel
      courierCar.speed = Math.max(-courierCar.reverseSpeed, courierCar.speed - rate * dt)
    } else {
      const drop = courierCar.friction * dt
      courierCar.speed = courierCar.speed > 0 ? Math.max(0, courierCar.speed - drop) : Math.min(0, courierCar.speed + drop)
    }

    // Space boosts forward, sharing the runner's energy pool
    const carBoost = keys.has('Space') && boost.energy > 1 && !boost.cooldown && courierCar.speed > 0
    boost.active = carBoost
    if (carBoost) {
      boost.energy = Math.max(0, boost.energy - boost.drain * dt)
      if (boost.energy <= 0) {
        boost.cooldown = true
        boost.active = false
      }
    } else {
      boost.energy = Math.min(100, boost.energy + (boost.cooldown ? 0 : boost.regen * dt))
      if (boost.cooldown && boost.energy >= 40) boost.cooldown = false
    }
    if (carBoost) courierCar.speed = Math.min(courierCar.boostSpeed, courierCar.speed)

    courierCar.x += Math.sin(courierCar.angle) * courierCar.speed * dt
    courierCar.y -= Math.cos(courierCar.angle) * courierCar.speed * dt
    courierCar.x = Math.max(24, Math.min(WORLD_W - 24, courierCar.x))
    courierCar.y = Math.max(24, Math.min(WORLD_H - 24, courierCar.y))

    // Forgiving traffic contact: sharp slowdown plus heat, one registration per window
    if (now >= trafficHitCooldownUntilMs) {
      for (const t of traffic) {
        if (Math.abs(courierCar.x - t.x) < t.length / 2 + 20 && Math.abs(courierCar.y - t.laneY) < 28) {
          courierCar.speed *= -0.25
          setWanted(wanted + 1)
          trafficHitUntilMs = now + TRAFFIC_HIT_HOLD_MS
          trafficHitCooldownUntilMs = now + TRAFFIC_HIT_COOLDOWN_MS
          trafficHitRestoreAtMs = now + TRAFFIC_HIT_HOLD_MS
          missionEl.textContent = TRAFFIC_HIT_TEXT
          break
        }
      }
    }

    // rider sits in the hull; facing tracks the hood so pulses fire forward
    player.x = courierCar.x
    player.y = courierCar.y
    facing.dx = Math.sin(courierCar.angle)
    facing.dy = -Math.cos(courierCar.angle)

    // E steps out beside the door once nearly stopped; stopped inside the active drop-off delivers the run
    if (courierToggleRequested && Math.abs(courierCar.speed) <= 80) {
      const stoppedAtDrop =
        contractState === 'active' &&
        Math.hypot(courierCar.x - SKYWAY_DROP_OFF.x, courierCar.y - SKYWAY_DROP_OFF.y) < DROP_OFF_RADIUS &&
        Math.abs(courierCar.speed) <= 20
      driving = false
      player.x = Math.max(player.size, Math.min(WORLD_W - player.size, courierCar.x + Math.cos(courierCar.angle) * 36))
      player.y = Math.max(player.size, Math.min(WORLD_H - player.size, courierCar.y + Math.sin(courierCar.angle) * 36))
      courierCar.speed = 0
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

    // E hops in when close to the parked courier; first pickup starts a hot delivery that draws police heat
    if (courierToggleRequested && Math.hypot(player.x - courierCar.x, player.y - courierCar.y) < COURIER_ENTER_RADIUS) {
      driving = true
      if (contractState === 'available') {
        contractState = 'active'
        contractDeadlineMs = now + CONTRACT_TIME_LIMIT_MS
        setWanted(Math.max(1, wanted))
        missionEl.textContent = HOT_DELIVERY_TEXT
      }
    }

    // H inside the safehouse zone clears police heat; banner holds, then the mission line restores
    if (safehouseRequested && Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < SAFEHOUSE.radius) {
      setWanted(0)
      heatCoolStartMs = 0
      missionEl.textContent = SAFEHOUSE_CLEAR_TEXT
      safehouseRestoreAtMs = now + SAFEHOUSE_HOLD_MS
    }

    // G inside the safehouse buys the one-time sprint kit: faster top end and acceleration
    if (garageRequested && !garageTuneInstalled && Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < SAFEHOUSE.radius) {
      garageBannerAfford = cash >= GARAGE_TUNE_COST
      if (garageBannerAfford) {
        cash -= GARAGE_TUNE_COST
        garageTuneInstalled = true
        courierCar.maxSpeed += GARAGE_TUNE_MAX_SPEED_BONUS
        courierCar.accel += GARAGE_TUNE_ACCEL_BONUS
        missionEl.textContent = GARAGE_AFFORD_TEXT
      } else {
        missionEl.textContent = GARAGE_POOR_TEXT
      }
      garageRestoreAtMs = now + GARAGE_HOLD_MS
    }
    garageRequested = false

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
  }
  courierToggleRequested = false
  safehouseRequested = false
  blackoutRequested = false

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
      garageTuneInstalled = data.garageTuneInstalled
      if (garageTuneInstalled) {
        courierCar.maxSpeed += GARAGE_TUNE_MAX_SPEED_BONUS
        courierCar.accel += GARAGE_TUNE_ACCEL_BONUS
      }
      if (
        typeof data.carX === 'number' && Number.isFinite(data.carX) &&
        typeof data.carY === 'number' && Number.isFinite(data.carY)
      ) {
        courierCar.x = Math.max(24, Math.min(WORLD_W - 24, data.carX))
        courierCar.y = Math.max(24, Math.min(WORLD_H - 24, data.carY))
      }
      if (typeof data.carAngle === 'number' && Number.isFinite(data.carAngle)) courierCar.angle = data.carAngle
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

  camera.x = Math.max(0, Math.min(Math.max(0, WORLD_W - w), player.x - w / 2))
  camera.y = Math.max(0, Math.min(Math.max(0, WORLD_H - h), player.y - h / 2))
  if (!driving && moving) facing = { dx: dx / len, dy: dy / len }

  const pct = boost.energy.toFixed(0)
  boostEls.fill.style.width = `${pct}%`
  boostEls.state.textContent = boost.active ? 'ACTIVE' : boost.cooldown ? 'RECHARGING' : 'READY'
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

  // Heat cooling: after 7s continuously clear of all active hunters' scan range, shed one level
  const hunterInRange =
    wanted > 0 &&
    drones.some(d => now >= d.disabledUntil && Math.hypot(player.x - d.x, player.y - d.y) < POLICE_SCAN_RADIUS)
  if (wanted <= 0 || hunterInRange) {
    heatCoolStartMs = 0
  } else if (heatCoolStartMs === 0) {
    heatCoolStartMs = now
  } else if (now - heatCoolStartMs >= HEAT_COOL_MS) {
    setWanted(wanted - 1)
    heatCoolStartMs = wanted > 0 ? now : 0
    heatCoolRestoreAtMs = now + HEAT_COOL_HOLD_MS
    missionEl.textContent = HEAT_COOLING_TEXT
  }

  // Jammer pulse on Q: disables nearest drone in range, cools heat by 1
  if (jammer.requested) {
    jammer.requested = false
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
  const bannerActive =
    (contractState === 'active') ||
    (blackoutState === 'active') ||
    (blackoutState === 'escaping' && escapeTimeLeftSec !== null) ||
    (contractState === 'complete' && contractRestoreAtMs > 0) ||
    contractFailRestoreAtMs > 0 ||
    trafficHitRestoreAtMs > 0 ||
    safehouseRestoreAtMs > 0 ||
    blackoutRestoreAtMs > 0 ||
    garageRestoreAtMs > 0 ||
    heatCoolRestoreAtMs > 0 ||
    saveRestoreAtMs > 0
  if (!bannerActive) {
    missionEl.textContent = campaignMissionText()
  } else if (trafficHitRestoreAtMs > 0) {
    if (missionEl.textContent !== TRAFFIC_HIT_TEXT) missionEl.textContent = TRAFFIC_HIT_TEXT
  } else if (heatCoolRestoreAtMs > 0) {
    if (missionEl.textContent !== HEAT_COOLING_TEXT) missionEl.textContent = HEAT_COOLING_TEXT
  } else if (saveRestoreAtMs > 0) {
    if (missionEl.textContent !== saveBannerText) missionEl.textContent = saveBannerText
  } else if (garageRestoreAtMs > 0) {
    const garageText = garageBannerAfford ? GARAGE_AFFORD_TEXT : GARAGE_POOR_TEXT
    if (missionEl.textContent !== garageText) missionEl.textContent = garageText
  } else if (blackoutState === 'escaping' && escapeTimeLeftSec !== null) {
    const liveText = `${BLACKOUT_ESCAPE_BASE_TEXT} — ${escapeTimeLeftSec}S`
    if (missionEl.textContent !== liveText) missionEl.textContent = liveText
  } else if (contractState === 'active' && deliveryTimeLeftSec !== null) {
    const liveText = `${HOT_DELIVERY_TEXT} — ${deliveryTimeLeftSec}S`
    if (missionEl.textContent !== liveText) missionEl.textContent = liveText
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
  bg.addColorStop(0, '#0a0325')
  bg.addColorStop(0.55, '#12063a')
  bg.addColorStop(1, '#05010f')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

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
    ctx.fillStyle = 'rgba(255, 240, 90, 0.85)'
    ctx.shadowColor = '#ffe05a'
    ctx.shadowBlur = 8
    for (let wx = b.x + 10; wx < b.x + b.width - 8; wx += 18) {
      for (let wy = b.y + 10; wy < b.y + b.height - 8; wy += 22) {
        if ((wx + wy + i) % 3 !== 0) ctx.fillRect(wx, wy, 5, 7)
      }
    }
    ctx.shadowBlur = 0
  })

  neonRect(0, h * 0.62, w, 4, '#00f0ff')

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
    t.x += t.dir * t.speed * dt
    if (t.dir > 0 && t.x > WORLD_W + t.length) t.x = -t.length
    if (t.dir < 0 && t.x < -t.length) t.x = WORLD_W + t.length
  })

  // Courier coupe under the signal/traffic layer; HUD prompt tracks proximity and drive state
  // Restrained amber impact ring while a traffic hit is registering
  if (driving && now < trafficHitUntilMs) {
    const hitT = (trafficHitUntilMs - now) / TRAFFIC_HIT_HOLD_MS
    ctx.strokeStyle = `rgba(255, 157, 60, ${0.35 + hitT * 0.4})`
    ctx.shadowColor = '#ff9d3c'
    ctx.shadowBlur = 12
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(courierCar.x, courierCar.y, 30 + (1 - hitT) * 14, 0, Math.PI * 2)
    ctx.stroke()
    ctx.shadowBlur = 0
  }
  drawCourierCar(driving)
  const nearCourier = Math.hypot(player.x - courierCar.x, player.y - courierCar.y) < COURIER_ENTER_RADIUS
  const dropDist = Math.round(Math.hypot(player.x - SKYWAY_DROP_OFF.x, player.y - SKYWAY_DROP_OFF.y))
  const courierText = driving
    ? contractState === 'active'
      ? `COURIER RUN // HOT DELIVERY — ${dropDist}M — ${deliveryTimeLeftSec ?? 45}S LEFT — STOP + E TO DELIVER`
      : `COURIER // DRIVING ${Math.round(Math.abs(courierCar.speed) * 0.6)} KMH — SPACE BOOST — SLOWS UNDER 80 FOR E`
    : nearCourier
      ? 'COURIER // PRESS E TO DRIVE'
      : ''
  if (courierEl.textContent !== courierText) courierEl.textContent = courierText
  courierEl.style.display = courierText ? '' : 'none'

  // Safehouse prompt: on-foot players inside the zone see the heat-clear hint
  const nearSafehouse = !driving && Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < SAFEHOUSE.radius
  if (safehouseEl.style.display !== (nearSafehouse ? '' : 'none')) {
    safehouseEl.style.display = nearSafehouse ? '' : 'none'
  }

  // Blackout accept hint / escape return hint at the safehouse
  const blackoutAcceptableNow =
    !driving &&
    blackoutState === 'available' &&
    contractState !== 'active' &&
    !missionComplete &&
    Math.hypot(player.x - SAFEHOUSE.x, player.y - SAFEHOUSE.y) < BLACKOUT_ACCEPT_RADIUS
  const blackoutEscapingNow = blackoutState === 'escaping'
  // Garage status composes onto every safehouse line so H, B, and G all stay visible
  const garageStatusHint = garageTuneInstalled
    ? 'SPRINT KIT INSTALLED'
    : cash >= GARAGE_TUNE_COST
      ? 'PRESS G TO TUNE ($250)'
      : `EARN $${GARAGE_TUNE_COST} FOR TUNE`
  let safehouseHint: string
  if (blackoutEscapingNow) {
    safehouseHint = `SAFEHOUSE // RETURN TO BANK BLACKOUT RUN // ${garageStatusHint}`
  } else if (blackoutAcceptableNow) {
    safehouseHint = `SAFEHOUSE // PRESS B FOR BLACKOUT RUN // H CLEAR HEAT // ${garageStatusHint}`
  } else if (nearSafehouse) {
    safehouseHint = `SAFEHOUSE // H CLEAR HEAT // ${garageStatusHint}`
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

  // Wallet readout: mirrors the live cash/rep values every frame
  const walletText = `CASH $${cash} // REP ${rep}`
  if (walletEl.textContent !== walletText) walletEl.textContent = walletText

  signals.forEach((s, i) => {
    if (signalsFound > i) return
    if (Math.hypot(player.x - s.x, player.y - s.y) < player.size + 16) {
      signalsFound++
      signalEls.count.textContent = String(signalsFound)
      if (!missionComplete) setWanted(wanted + 1)
      if (signalsFound === 3 && !missionComplete) {
        signalEls.complete.hidden = false
        if (contractState !== 'active') missionEl.textContent = missionPhase2
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
    garageTuneInstalled = bootData.garageTuneInstalled
    if (garageTuneInstalled) {
      courierCar.maxSpeed += GARAGE_TUNE_MAX_SPEED_BONUS
      courierCar.accel += GARAGE_TUNE_ACCEL_BONUS
    }
    if (
      typeof bootData.carX === 'number' && Number.isFinite(bootData.carX) &&
      typeof bootData.carY === 'number' && Number.isFinite(bootData.carY)
    ) {
      courierCar.x = Math.max(24, Math.min(WORLD_W - 24, bootData.carX))
      courierCar.y = Math.max(24, Math.min(WORLD_H - 24, bootData.carY))
    }
    if (typeof bootData.carAngle === 'number' && Number.isFinite(bootData.carAngle)) courierCar.angle = bootData.carAngle
  }
}

requestAnimationFrame(frame)
