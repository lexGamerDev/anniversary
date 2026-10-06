import { config } from './config.js'

// path ที่ขึ้นต้นด้วย / จะถูกเติม base URL ให้ (เช่น /anniversary/ บน GitHub Pages)
export const withBase = (src) => (src.startsWith('/') ? import.meta.env.BASE_URL + src.slice(1) : src)

// รองรับทั้ง images: [...] และ image: '...' แบบเดิม
export const getImages = (m) => (m.images ?? (m.image ? [m.image] : [])).map(withBase)

// อ่าน startDate เป็นเวลาท้องถิ่น (new Date('YYYY-MM-DD') จะได้เวลา UTC ซึ่งอาจคลาดไป 1 วัน)
function startDate() {
  const [y, m, d] = config.startDate.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function daysTogether() {
  return Math.max(0, Math.floor((Date.now() - startDate().getTime()) / 86400000))
}

// จำนวนปีที่ครบแล้ว (อย่างน้อย 1 ปี เพราะเป็นเว็บครบรอบ)
export function yearsTogether() {
  const start = startDate()
  const now = new Date()
  let years = now.getFullYear() - start.getFullYear()
  if (now.getMonth() < start.getMonth() || (now.getMonth() === start.getMonth() && now.getDate() < start.getDate())) years--
  return Math.max(1, years)
}

// 1 → 1st, 2 → 2nd, 3 → 3rd, 11 → 11th, 22 → 22nd
export function ordinal(n) {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'
  return n + suffix
}

// เช็คล่วงหน้าว่ารูปไหนโหลดได้จริง (เก็บผลไว้ใช้ซ้ำ) — ตัวนับรูปจะได้ถูกตั้งแต่แรก
const probes = new Map()
const resolved = new Map()

export function probeImage(src) {
  if (!probes.has(src)) {
    probes.set(
      src,
      new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
        img.src = src
      }).then((ok) => {
        resolved.set(src, ok)
        return ok
      })
    )
  }
  return probes.get(src)
}

// คืนรายการรูปที่โหลดได้ หรือ null ถ้ายังเช็คไม่ครบ
export function knownImages(moment) {
  const srcs = getImages(moment)
  return srcs.every((src) => resolved.has(src)) ? srcs.filter((src) => resolved.get(src)) : null
}

export const probeMoment = (moment) => Promise.all(getImages(moment).map(probeImage)).then(() => knownImages(moment))
