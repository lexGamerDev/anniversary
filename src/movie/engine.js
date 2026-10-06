// วาดภาพยนตร์ลง <canvas> ทีละเฟรม — ทุกอย่างคำนวณจากเวลา t (วินาที)
// จึงเล่นซ้ำ / กรอ / อัดเป็นวิดีโอได้ผลเหมือนกันทุกครั้ง
import { config } from '../config.js'
import { daysTogether, getImages } from '../utils.js'

export const W = 1080
export const H = 1920
export const FPS = 30

const FADE = 0.8
const INTRO = 5.5
const PHOTO = config.movie?.photoDuration ?? 3
const LINE_GAP = 1.1

const PINK = '#ff6b9d'
const DEEP = '#e0457b'
const INK = '#4a2c3a'
const MUTED = '#8b6b78'
const SCRIPT = '"Great Vibes", Sriracha, cursive'
const HAND = 'Sriracha, cursive'
const SANS = 'Mitr, system-ui, sans-serif'

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const ease = (v) => 1 - Math.pow(1 - clamp01(v), 3)
const rand = (i, k) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return x - Math.floor(x)
}

/* ---------- เตรียมข้อมูล ---------- */

export async function loadAssets() {
  const fonts = Promise.all([
    document.fonts.load(`160px ${SCRIPT}`, 'Happy'),
    document.fonts.load(`64px ${HAND}`, 'กขค'),
    document.fonts.load(`300 44px ${SANS}`, 'กขค'),
    document.fonts.load(`500 44px ${SANS}`, 'กขค'),
  ]).catch(() => {})

  const srcs = [...new Set(config.moments.flatMap(getImages))]
  const entries = await Promise.all(
    srcs.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image()
          img.onload = () => img.decode().catch(() => {}).then(() => resolve([src, prepareImage(img)]))
          img.onerror = () => resolve(null)
          img.src = src
        })
    )
  )
  await fonts
  return new Map(entries.filter(Boolean))
}

// ทำภาพพื้นหลังเบลอไว้ล่วงหน้า: ย่อให้เล็กมากแล้วค่อยขยาย = เบลอฟรี ใช้ได้ทุกเบราว์เซอร์
function prepareImage(img) {
  const blur = document.createElement('canvas')
  blur.width = 27
  blur.height = 48
  drawCover(blur.getContext('2d'), img, 27, 48, 1, 0, 0)
  const ratio = img.naturalWidth / img.naturalHeight
  return { img, blur, fullBleed: ratio <= 0.66 }
}

export function buildTimeline(assets) {
  const segs = []
  let t = 0
  const push = (seg) => {
    segs.push({ ...seg, start: t })
    t += seg.dur
  }

  push({ type: 'intro', dur: INTRO })
  config.moments.forEach((moment, mi) => {
    const photos = getImages(moment).map((src) => assets.get(src)).filter(Boolean)
    const momentStart = t
    if (!photos.length) push({ type: 'photo', moment, mi, k: 0, photo: null, first: true, momentStart, dur: PHOTO })
    photos.forEach((photo, k) =>
      push({ type: 'photo', moment, mi, k, photo, first: k === 0, momentStart, dur: PHOTO })
    )
    segs.filter((s) => s.mi === mi).forEach((s) => (s.momentDur = t - momentStart))
  })
  push({ type: 'outro', dur: 2 + config.outro.lines.length * LINE_GAP + 4.5 })

  return { segs, total: t }
}

/* ---------- วาดเฟรม ---------- */

export function drawFrame(ctx, { segs }, t) {
  let i = segs.findIndex((s) => t < s.start + s.dur)
  if (i === -1) i = segs.length - 1
  const seg = segs[i]
  const local = t - seg.start
  const prev = segs[i - 1]
  const fading = prev && local < FADE
  const p = fading ? ease(local / FADE) : 1

  ctx.clearRect(0, 0, W, H)
  if (fading) drawLayer(ctx, prev, t - prev.start, 1)
  drawLayer(ctx, seg, local, p)

  drawHearts(ctx, t, seg.type === 'photo' ? 8 : 16, seg.type === 'photo' ? 0.45 : 0.7)

  if (fading && prev.type === 'photo' && (seg.type !== 'photo' || seg.first)) {
    drawMomentText(ctx, prev, 1 - p)
  }
  if (seg.type === 'photo') drawMomentText(ctx, seg, ease((t - seg.momentStart - 0.4) / 0.8))

  // แถบ story อยู่นิ่งตลอดช่วงรูป — ค่อยๆ ปรากฏตอนเข้าจาก intro และจางหายตอนเข้า outro
  if (seg.type === 'photo') drawStoryBar(ctx, seg, t, fading && prev.type !== 'photo' ? p : 1)
  else if (fading && prev.type === 'photo') drawStoryBar(ctx, prev, t, 1 - p)
}

function drawLayer(ctx, seg, local, alpha) {
  ctx.save()
  ctx.globalAlpha = alpha
  if (seg.type === 'intro') drawIntro(ctx, local)
  else if (seg.type === 'outro') drawOutro(ctx, local)
  else drawPhoto(ctx, seg, local)
  ctx.restore()
}

function drawCover(ctx, img, w, h, scale, ox, oy) {
  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  const s = Math.max(w / iw, h / ih) * scale
  ctx.drawImage(img, (w - iw * s) / 2 + ox, (h - ih * s) / 2 + oy, iw * s, ih * s)
}

function pinkBackground(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, '#ffe4ec')
  g.addColorStop(0.5, '#fff1e8')
  g.addColorStop(1, '#f3e4ff')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  const glow = (x, y, r, color) => {
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r)
    rg.addColorStop(0, color)
    rg.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = rg
    ctx.fillRect(0, 0, W, H)
  }
  glow(W * 0.2 + Math.sin(t * 0.4) * 80, H * 0.3, 700, 'rgba(255,107,157,0.28)')
  glow(W * 0.85, H * 0.72 + Math.cos(t * 0.3) * 80, 700, 'rgba(186,140,255,0.25)')
}

function drawHearts(ctx, t, count, alpha) {
  const symbols = ['💗', '💕', '💖', '🤍', '✨', '💞']
  ctx.save()
  ctx.textAlign = 'center'
  for (let i = 0; i < count; i++) {
    const speed = 90 + rand(i, 2) * 110
    const period = (H + 200) / speed
    const age = (t + rand(i, 4) * period) % period
    const y = H + 100 - age * speed
    const x = rand(i, 1) * W + Math.sin(t * 0.6 + i) * 40
    const size = 34 + rand(i, 3) * 40
    ctx.globalAlpha = alpha * Math.min(1, age / 1.5, (period - age) / 1.5)
    ctx.font = `${size}px sans-serif`
    ctx.fillText(symbols[i % symbols.length], x, y)
  }
  ctx.restore()
}

/* ---------- ข้อความ ---------- */

const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('th', { granularity: 'word' }) : null
const wrapCache = new Map()

// ตัดบรรทัดภาษาไทยด้วย Intl.Segmenter (ภาษาไทยไม่มีช่องว่างระหว่างคำ)
function wrap(ctx, str, maxWidth) {
  const key = ctx.font + '|' + maxWidth + '|' + str
  if (wrapCache.has(key)) return wrapCache.get(key)
  const words = segmenter ? Array.from(segmenter.segment(str), (s) => s.segment) : str.split(/(?<= )/)
  const lines = []
  let line = ''
  for (const w of words) {
    if (line && ctx.measureText(line + w).width > maxWidth) {
      lines.push(line.trim())
      line = w.trimStart()
    } else line += w
  }
  if (line.trim()) lines.push(line.trim())
  wrapCache.set(key, lines)
  return lines
}

function text(ctx, str, x, y, font, fill, alpha = 1) {
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha *= alpha
  ctx.font = font
  ctx.fillStyle = fill
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(str, x, y)
  ctx.restore()
}

function scriptGradient(ctx, t) {
  const shift = (t * 300) % (W * 2)
  const g = ctx.createLinearGradient(-shift, 0, W * 2 - shift, 0)
  ;[DEEP, '#b05cff', PINK, DEEP, '#b05cff', PINK].forEach((c, i, a) => g.addColorStop(i / (a.length - 1), c))
  return g
}

/* ---------- ฉากต่างๆ ---------- */

function drawIntro(ctx, L) {
  pinkBackground(ctx, L)
  const { intro, me, partner } = config
  const rise = (delay) => {
    const a = ease((L - delay) / 0.9)
    return [a, (1 - a) * 40]
  }

  // หัวใจเต้น
  const [a0] = rise(0)
  const beat = 1 + 0.12 * Math.pow(Math.max(0, Math.sin(L * Math.PI * 1.7)), 8)
  ctx.save()
  ctx.globalAlpha *= a0
  ctx.translate(W / 2, 560)
  ctx.scale(beat * a0, beat * a0)
  ctx.font = '220px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('💖', 0, 0)
  ctx.restore()

  let [a, dy] = rise(0.4)
  text(ctx, `${me} & ${partner}`, W / 2, 800 + dy, `64px ${HAND}`, DEEP, a)

  ;[a, dy] = rise(0.9)
  ctx.save()
  ctx.font = `150px ${SCRIPT}`
  const titleLines = wrap(ctx, intro.title, W - 120)
  ctx.restore()
  titleLines.forEach((line, i) => text(ctx, line, W / 2, 990 + i * 165 + dy, `150px ${SCRIPT}`, scriptGradient(ctx, L), a))

  let y = 990 + titleLines.length * 165 + 30
  ;[a, dy] = rise(1.7)
  ctx.save()
  ctx.font = `400 46px ${SANS}`
  const subLines = wrap(ctx, intro.subtitle, W - 160)
  ctx.restore()
  subLines.forEach((line, i) => text(ctx, line, W / 2, y + i * 66 + dy, `400 46px ${SANS}`, INK, a))
  y += subLines.length * 66 + 120

  ;[a, dy] = rise(2.4)
  text(ctx, String(daysTogether()), W / 2, y + dy, `500 140px ${SANS}`, DEEP, a)
  text(ctx, 'วันที่เรารักกัน', W / 2, y + 110 + dy, `300 42px ${SANS}`, MUTED, a)
}

function drawPhoto(ctx, seg, L) {
  const p = L / seg.dur
  const dir = (seg.mi + seg.k) % 2 ? 1 : -1

  if (!seg.photo) {
    const hue = (seg.mi * 47 + 330) % 360
    const g = ctx.createLinearGradient(0, 0, W, H)
    g.addColorStop(0, `hsl(${hue} 90% 85%)`)
    g.addColorStop(1, `hsl(${hue + 40} 85% 75%)`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    text(ctx, seg.moment.emoji || '💗', W / 2, 760 + Math.sin(L * 2) * 20, '320px sans-serif', '#000')
  } else if (seg.photo.fullBleed) {
    drawCover(ctx, seg.photo.img, W, H, 1.04 + 0.1 * p, dir * 40 * (p - 0.5), -30 * (p - 0.5))
  } else {
    // รูปแนวนอน / 3:4 → พื้นหลังเบลอ + กรอบโพลารอยด์ จะได้ไม่โดนครอป
    ctx.imageSmoothingQuality = 'high'
    drawCover(ctx, seg.photo.blur, W, H, 1.1, 0, 0)
    ctx.fillStyle = 'rgba(40,15,25,0.25)'
    ctx.fillRect(0, 0, W, H)

    const { img } = seg.photo
    const s = Math.min((W * 0.8) / img.naturalWidth, 1050 / img.naturalHeight)
    const w = img.naturalWidth * s
    const h = img.naturalHeight * s
    const pad = 26
    ctx.save()
    ctx.translate(W / 2, 210 + 1140 / 2) // เว้นที่ด้านบนให้แถบ story + ป้ายตัวเลข
    ctx.rotate(((((seg.mi + seg.k) % 3) - 1) * 2 * Math.PI) / 180)
    ctx.scale(0.97 + 0.05 * p, 0.97 + 0.05 * p)
    ctx.shadowColor = 'rgba(0,0,0,0.35)'
    ctx.shadowBlur = 50
    ctx.shadowOffsetY = 20
    ctx.fillStyle = '#fff'
    ctx.fillRect(-w / 2 - pad, -h / 2 - pad, w + pad * 2, h + pad * 2)
    ctx.shadowColor = 'transparent'
    ctx.drawImage(img, -w / 2, -h / 2, w, h)
    ctx.restore()
  }

  const top = ctx.createLinearGradient(0, 0, 0, 360)
  top.addColorStop(0, 'rgba(30,10,20,0.45)')
  top.addColorStop(1, 'rgba(30,10,20,0)')
  ctx.fillStyle = top
  ctx.fillRect(0, 0, W, 360)

  const g = ctx.createLinearGradient(0, H * 0.55, 0, H)
  g.addColorStop(0, 'rgba(30,10,20,0)')
  g.addColorStop(1, 'rgba(30,10,20,0.8)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
}

const pad2 = (n) => String(n).padStart(2, '0')

// แถบความคืบหน้าแบบ story: 1 ช่องต่อ 1 moment ช่องปัจจุบันค่อยๆ เติมเต็ม
function drawStoryBar(ctx, seg, t, alpha) {
  if (alpha <= 0) return
  const n = config.moments.length
  const x0 = 56
  const gap = 12
  const h = 8
  const w = (W - x0 * 2 - gap * (n - 1)) / n
  const progress = clamp01((t - seg.momentStart) / seg.momentDur)
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.shadowColor = 'rgba(0,0,0,0.25)'
  ctx.shadowBlur = 8
  for (let i = 0; i < n; i++) {
    const x = x0 + i * (w + gap)
    ctx.fillStyle = 'rgba(255,255,255,0.32)'
    ctx.beginPath()
    ctx.roundRect(x, 64, w, h, h / 2)
    ctx.fill()
    const fill = i < seg.mi ? 1 : i === seg.mi ? progress : 0
    if (fill > 0) {
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.roundRect(x, 64, Math.max(h, w * fill), h, h / 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

// ป้ายกระจก "♥ 05 / 08" ใต้แถบ story
function drawCounterPill(ctx, mi, a, dy) {
  const parts = [
    { str: '♥', font: `40px ${SANS}`, color: PINK, gap: 18 },
    { str: pad2(mi + 1), font: `500 40px ${SANS}`, color: '#fff', gap: 14 },
    { str: '/', font: `300 34px ${SANS}`, color: 'rgba(255,255,255,0.6)', gap: 14 },
    { str: pad2(config.moments.length), font: `300 40px ${SANS}`, color: 'rgba(255,255,255,0.8)', gap: 0 },
  ]
  ctx.save()
  ctx.globalAlpha *= a
  if ('letterSpacing' in ctx) ctx.letterSpacing = '3px'
  const widths = parts.map((p) => {
    ctx.font = p.font
    return ctx.measureText(p.str).width
  })
  const inner = widths.reduce((sum, w, i) => sum + w + parts[i].gap, 0)
  const pw = inner + 64
  const ph = 72
  const px = (W - pw) / 2
  const py = 118 - dy / 2

  ctx.fillStyle = 'rgba(255,255,255,0.16)'
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'
  ctx.lineWidth = 2
  ctx.shadowColor = 'rgba(0,0,0,0.2)'
  ctx.shadowBlur = 20
  ctx.beginPath()
  ctx.roundRect(px, py, pw, ph, ph / 2)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.stroke()

  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  let x = px + 32
  parts.forEach((p, i) => {
    ctx.font = p.font
    ctx.fillStyle = p.color
    ctx.fillText(p.str, x, py + ph / 2 + 2)
    x += widths[i] + p.gap
  })
  ctx.restore()
}

function drawMomentText(ctx, seg, a) {
  if (a <= 0) return
  const { moment, mi } = seg
  const dy = (1 - a) * 40
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.45)'
  ctx.shadowBlur = 16

  ctx.font = `300 46px ${SANS}`
  const lines = wrap(ctx, moment.caption, W - 160)
  const bottom = H - 150
  const capTop = bottom - (lines.length - 1) * 66
  lines.forEach((line, i) => text(ctx, line, W / 2, capTop + i * 66 + dy, `300 46px ${SANS}`, 'rgba(255,255,255,0.92)', a))
  ctx.font = `88px ${HAND}`
  const titleSize = Math.min(88, Math.floor((88 * (W - 120)) / ctx.measureText(moment.title).width)) // ชื่อยาวเกินจอ → ย่อให้พอดี
  text(ctx, moment.title, W / 2, capTop - 105 + dy, `${titleSize}px ${HAND}`, '#fff', a)
  text(ctx, moment.date, W / 2, capTop - 205 + dy, `500 38px ${SANS}`, '#ffb3cc', a)
  ctx.restore()
  drawCounterPill(ctx, mi, a, dy)
}

function drawOutro(ctx, L) {
  pinkBackground(ctx, L)
  const { outro, me, partner } = config

  // จัดบรรทัดก่อน เพื่อรู้ความสูงของการ์ดจดหมาย แล้วจัดทั้งก้อนให้อยู่กลางจอ
  ctx.save()
  ctx.font = `300 46px ${SANS}`
  const paras = outro.lines.map((line) => wrap(ctx, line, W - 200))
  ctx.restore()
  const rows = paras.reduce((n, p) => n + p.length, 0)
  const cardH = rows * 68 + (paras.length - 1) * 28 + 120
  const blockH = 270 + cardH + 270 // ชื่อเรื่อง + การ์ด + ลายเซ็น
  const top = Math.max(120, (H - blockH) / 2)
  const titleY = top + 110
  const cardTop = top + 270

  const a0 = ease(L / 1.2)
  ctx.save()
  ctx.translate(W / 2, titleY)
  ctx.scale(0.7 + 0.3 * a0, 0.7 + 0.3 * a0)
  text(ctx, outro.title, 0, 0, `180px ${SCRIPT}`, scriptGradient(ctx, L), a0)
  ctx.restore()

  ctx.save()
  ctx.globalAlpha *= ease((L - 0.6) / 0.8)
  ctx.fillStyle = 'rgba(255,255,255,0.68)'
  ctx.shadowColor = 'rgba(224,69,123,0.18)'
  ctx.shadowBlur = 60
  ctx.beginPath()
  ctx.roundRect(50, cardTop, W - 100, cardH, 48)
  ctx.fill()
  ctx.restore()

  let y = cardTop + 60 + 34
  paras.forEach((lines, i) => {
    const a = ease((L - 1.2 - i * LINE_GAP) / 0.9)
    lines.forEach((line) => {
      text(ctx, line, W / 2, y + (1 - a) * 24, `300 46px ${SANS}`, INK, a)
      y += 68
    })
    y += 28
  })

  const end = 1.2 + paras.length * LINE_GAP + 0.3
  const as = ease((L - end) / 0.8)
  const sy = cardTop + cardH + 130
  ctx.save()
  ctx.translate(W / 2, sy)
  ctx.scale(0.8 + 0.2 * as, 0.8 + 0.2 * as)
  text(ctx, outro.signature, 0, 0, `84px ${HAND}`, DEEP, as)
  ctx.restore()
  text(ctx, `— ${me} ถึง ${partner} —`, W / 2, sy + 110, `300 42px ${SANS}`, MUTED, ease((L - end - 0.6) / 0.8))
}
