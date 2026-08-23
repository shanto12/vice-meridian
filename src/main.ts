import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <h1 class="title">VICE//MERIDIAN</h1>
  <canvas id="game"></canvas>
  <div class="hud">
    <p class="hud-count">SIGNALS <span id="signal-count">0</span>/3</p>
    <p class="hud-mission">MISSION // Sweep the grid — recover 3 relay signals</p>
    <p class="hud-boost">
      BOOST
      <span class="boost-bar"><span class="boost-fill" id="boost-fill"></span></span>
      <span class="boost-state" id="boost-state">READY</span>
    </p>
    <p class="hud-wanted" id="hud-wanted">WANTED <span id="wanted-count">0</span>/3</p>
  </div>
  <p class="complete" id="complete" hidden>ALL SIGNALS RECOVERED — GRID SECURE</p>
  <p class="hint">WASD / ARROWS to move — HOLD SPACE to boost — Q to jam drones</p>
`

const canvas = document.querySelector<HTMLCanvasElement>('#game')!
const ctx = canvas.getContext('2d')!

let w = (canvas.width = window.innerWidth)
let h = (canvas.height = window.innerHeight)

window.addEventListener('resize', () => {
  w = canvas.width = window.innerWidth
  h = canvas.height = window.innerHeight
})

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
  if (e.code === 'Space' || e.code === 'KeyQ') {
    e.preventDefault()
  }
  if (e.code === 'KeyQ') jammer.requested = true
})
window.addEventListener('keyup', e => keys.delete(e.code))

const player = { x: w / 2, y: h / 2, size: 28, speed: 320 }
const grid = 48

const jammer = {
  requested: false,
  radius: 190,
  cooldown: 0,
  duration: 1.6,
  active: 0,
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

const signals = Array.from({ length: 3 }, (_, i) => ({
  x: ((i * 419 + 211) % (w - 200)) + 100,
  y: h * 0.62 + 60 + ((i * 173) % Math.max(1, h - h * 0.62 - 140)),
}))

const buildings = Array.from({ length: 14 }, (_, i) => ({
  x: ((i * 137) % (w - 160)) + 40,
  y: ((i * 257) % (h - 220)) + 60,
  width: 90 + ((i * 61) % 120),
  height: 70 + ((i * 113) % 140),
}))

let wanted = 0
const drones = Array.from({ length: 3 }, (_, i) => ({
  x: w * (0.22 + i * 0.28),
  y: h * 0.62 + 70,
  angle: i * 2.1,
  radius: 70 + i * 26,
  speed: 1.4 + i * 0.35,
  disabledUntil: 0,
}))

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

let last = performance.now()

function frame(now: number) {
  const dt = Math.min((now - last) / 1000, 0.05)
  last = now

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
  player.x = Math.max(player.size, Math.min(w - player.size, player.x + (dx / len) * speedNow * dt))
  player.y = Math.max(player.size, Math.min(h - player.size, player.y + (dy / len) * speedNow * dt))
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
      d.x = Math.max(30, Math.min(w - 30, d.x))
      d.y = Math.max(h * 0.62, Math.min(h - 30, d.y))
      distToPlayer = Math.hypot(player.x - d.x, player.y - d.y)
      if (distToPlayer < 30 && !disabled) {
        setWanted(wanted - 1)
        player.x = w / 2
        player.y = h / 2
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

  signals.forEach((s, i) => {
    if (signalsFound > i) return
    if (Math.hypot(player.x - s.x, player.y - s.y) < player.size + 16) {
      signalsFound++
      signalEls.count.textContent = String(signalsFound)
      setWanted(wanted + 1)
      if (signalsFound === 3) signalEls.complete.hidden = false
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

  requestAnimationFrame(frame)
}

requestAnimationFrame(frame)
