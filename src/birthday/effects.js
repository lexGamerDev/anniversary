// เอนจินเอฟเฟกต์บน canvas เต็มจอ: คอนเฟตติ / พลุ (วงกลม, วงแหวน, หัวใจ) / ประกายตามนิ้ว
// ใช้ได้จากทุก component: attachEffects(canvas) ครั้งเดียว แล้วเรียก confetti() fireworks() ฯลฯ ได้เลย
import { pick, rand } from './utils.js'

const COLORS = ['#ff6b9d', '#ffd166', '#06d6a0', '#4cc9f0', '#b05cff', '#ff9f43', '#ffffff']
const GRAVITY = 900

let canvas = null
let ctx = null
let w = 0
let h = 0
let raf = 0
let last = 0
let parts = []
let rockets = []

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  w = window.innerWidth
  h = window.innerHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

export function attachEffects(cv) {
  canvas = cv
  ctx = cv.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
  return () => {
    window.removeEventListener('resize', resize)
    cancelAnimationFrame(raf)
    raf = 0
    parts = []
    rockets = []
    canvas = null
  }
}

function start() {
  if (!raf && canvas) {
    last = performance.now()
    raf = requestAnimationFrame(tick)
  }
}

function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  ctx.clearRect(0, 0, w, h)

  rockets = rockets.filter((r) => {
    r.x += r.vx * dt
    r.y += r.vy * dt
    r.vy += 200 * dt
    parts.push(spark(r.x, r.y, r.color, rand(-20, 20), rand(20, 60), 0.5, 2))
    if (r.vy >= -40 || r.y <= r.ty) {
      explode(r)
      return false
    }
    return true
  })

  ctx.globalCompositeOperation = 'lighter'
  parts = parts.filter((p) => {
    p.life -= dt
    if (p.life <= 0 || p.y > h + 40) return false
    p.vx *= p.drag ** (dt * 60)
    p.vy = p.vy * p.drag ** (dt * 60) + p.g * dt
    p.x += p.vx * dt
    p.y += p.vy * dt
    const a = Math.max(0, Math.min(1, p.life / p.fade))
    if (p.kind === 'c') {
      p.rot += p.vr * dt
      p.wob += p.wobSpeed * dt
      ctx.globalCompositeOperation = 'source-over'
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.scale(1, Math.cos(p.wob)) // หมุนพลิกเหมือนกระดาษจริง
      ctx.globalAlpha = a
      ctx.fillStyle = p.color
      p.round ? (ctx.beginPath(), ctx.arc(0, 0, p.w / 2, 0, 7), ctx.fill()) : ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
      ctx.globalCompositeOperation = 'lighter'
    } else {
      ctx.globalAlpha = a
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * (p.kind === 't' ? a : 1), 0, 7)
      ctx.fill()
    }
    return true
  })
  rockets.forEach((r) => {
    ctx.globalAlpha = 1
    ctx.fillStyle = r.color
    ctx.beginPath()
    ctx.arc(r.x, r.y, 2.5, 0, 7)
    ctx.fill()
  })
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'

  raf = parts.length || rockets.length ? requestAnimationFrame(tick) : 0
}

const spark = (x, y, color, vx, vy, life, size, g = 160, drag = 0.985) => ({
  kind: 's', x, y, vx, vy, color, life, fade: life * 0.7, size, g, drag,
})

function explode({ x, y, color, shape }) {
  const color2 = pick(COLORS)
  if (shape === 'heart') {
    const n = 70
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2
      const hx = 16 * Math.sin(t) ** 3
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
      parts.push(spark(x, y, i % 2 ? '#ff6b9d' : '#ffc2d6', hx * 14, hy * 14, rand(1.4, 1.8), 2.6, 60, 0.97))
    }
  } else if (shape === 'ring') {
    const n = 50
    const speed = rand(220, 300)
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      parts.push(spark(x, y, color, Math.cos(a) * speed, Math.sin(a) * speed, rand(1.2, 1.6), 2.4, 120, 0.975))
    }
  } else {
    for (let i = 0; i < 80; i++) {
      const a = rand(0, Math.PI * 2)
      const s = rand(60, 340)
      parts.push(spark(x, y, i % 3 ? color : color2, Math.cos(a) * s, Math.sin(a) * s, rand(1, 1.8), rand(1.5, 3), 160, 0.975))
    }
  }
}

// ---- API ----

// ยิงคอนเฟตติจากจุด (x, y เป็นสัดส่วน 0–1 ของจอ)
export function confetti({ x = 0.5, y = 0.6, count = 90, spread = 70, angle = -90, power = 1 } = {}) {
  if (!canvas) return
  for (let i = 0; i < count; i++) {
    const a = ((angle + rand(-spread, spread)) * Math.PI) / 180
    const s = rand(300, 900) * power
    parts.push({
      kind: 'c', x: x * w, y: y * h, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      g: GRAVITY * 0.55, drag: 0.965, life: rand(2.2, 4), fade: 0.8,
      w: rand(6, 12), h: rand(4, 8), round: Math.random() < 0.25,
      color: pick(COLORS), rot: rand(0, 6.28), vr: rand(-8, 8), wob: rand(0, 6), wobSpeed: rand(6, 14),
    })
  }
  start()
}

// ปืนคอนเฟตติจากมุมล่างซ้าย-ขวา
export function cannons() {
  confetti({ x: 0, y: 1, angle: -60, spread: 25, count: 70, power: 1.25 })
  confetti({ x: 1, y: 1, angle: -120, spread: 25, count: 70, power: 1.25 })
}

// คอนเฟตติโปรยจากด้านบนต่อเนื่อง (คืนฟังก์ชันหยุด)
export function confettiRain(duration = 5000) {
  const id = setInterval(() => confetti({ x: rand(0, 1), y: -0.05, angle: 90, spread: 30, count: 6, power: 0.35 }), 120)
  const stop = () => clearInterval(id)
  setTimeout(stop, duration)
  return stop
}

// ยิงพลุ n ลูก ห่างกัน interval ms (คืนฟังก์ชันหยุด)
export function fireworks(n = 8, interval = 600) {
  const timers = []
  for (let i = 0; i < n; i++) {
    timers.push(
      setTimeout(() => {
        if (!canvas) return
        const shape = i % 4 === 3 ? 'heart' : i % 3 === 1 ? 'ring' : 'burst'
        const x = rand(0.15, 0.85) * w
        const ty = rand(0.12, 0.45) * h
        rockets.push({ x, y: h, vx: rand(-40, 40), vy: -Math.sqrt(2 * 200 * (h - ty)) * 1.0 - 120, ty, color: pick(COLORS), shape })
        start()
      }, i * interval)
    )
  }
  return () => timers.forEach(clearTimeout)
}

// ประกายเล็กๆ ตามนิ้ว/เมาส์ (พิกัดเป็น px)
export function sparkle(px, py) {
  if (!canvas) return
  for (let i = 0; i < 2; i++) {
    const p = spark(px + rand(-6, 6), py + rand(-6, 6), pick(COLORS), rand(-40, 40), rand(-60, 10), rand(0.5, 0.9), rand(1.5, 3.2), 120, 0.96)
    p.kind = 't'
    parts.push(p)
  }
  start()
}
