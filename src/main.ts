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
  </div>
  <p class="complete" id="complete" hidden>ALL SIGNALS RECOVERED — GRID SECURE</p>
  <div class="run-complete" id="run-complete" hidden>
    <p class="run-title">RUN COMPLETE // EXTRACTION SECURED</p>
    <p class="run-stats" id="run-stats"></p>
    <p class="run-restart">PRESS R TO RESTART</p>
  </div>
  <p class="hint">WASD / ARROWS to move — HOLD SPACE to boost — Q to jam drones — F to pulse — R to restart</p>
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
  if (e.code === 'Space' || e.code === 'KeyQ' || e.code === 'KeyF') {
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
  if (e.code === 'KeyR') restartRequested = true
})
window.addEventListener('keyup', e => keys.delete(e.code))

const player = { x: WORLD_W / 2, y: WORLD_H / 2, size: 28, speed: 320 }
const grid = 48

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

  const speedNow = player.speed * (boost.active ? boost.multiplier : 1)
  player.x = Math.max(player.size, Math.min(WORLD_W - player.size, player.x + (dx / len) * speedNow * dt))
  player.y = Math.max(player.size, Math.min(WORLD_H - player.size, player.y + (dy / len) * speedNow * dt))
  camera.x = Math.max(0, Math.min(Math.max(0, WORLD_W - w), player.x - w / 2))
  camera.y = Math.max(0, Math.min(Math.max(0, WORLD_H - h), player.y - h / 2))
  if (moving) facing = { dx: dx / len, dy: dy / len }

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

  // Jammer pulse on Q: disables nearest drone in range, cools heat by 1
  if (jammer.requested) {
    jammer.requested = false
    if (jammer.cooldown <= 0) {
      jammer.cooldown = 3.5
      jammer.active = now + 420
      if (wanted > 0 && nearestDrone && nearestDist < jammer.radius) {
        nearestDrone.disabledUntil = now + jammer.duration * 1000
        setWanted(wanted - 1)
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
        pulse.bolts.splice(i, 1)
        break
      }
    }
  }
  const pulseState = pulse.cooldown > 0 ? 'COOLDOWN' : 'READY'
  if (pulseEls.state.textContent !== pulseState) pulseEls.state.textContent = pulseState

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

  signals.forEach((s, i) => {
    if (signalsFound > i) return
    if (Math.hypot(player.x - s.x, player.y - s.y) < player.size + 16) {
      signalsFound++
      signalEls.count.textContent = String(signalsFound)
      if (!missionComplete) setWanted(wanted + 1)
      if (signalsFound === 3 && !missionComplete) {
        signalEls.complete.hidden = false
        missionEl.textContent = missionPhase2
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

requestAnimationFrame(frame)
