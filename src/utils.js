import { config } from './config.js'

// path ที่ขึ้นต้นด้วย / จะถูกเติม base URL ให้ (เช่น /anniversary/ บน GitHub Pages)
export const withBase = (src) => (src.startsWith('/') ? import.meta.env.BASE_URL + src.slice(1) : src)

// รองรับทั้ง images: [...] และ image: '...' แบบเดิม
export const getImages = (m) => (m.images ?? (m.image ? [m.image] : [])).map(withBase)

export function daysTogether() {
  const start = new Date(config.startDate)
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / 86400000))
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
