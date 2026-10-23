// อ่านวันที่เป็นเวลาท้องถิ่น (new Date('YYYY-MM-DD') จะได้ UTC ซึ่งอาจคลาดไป 1 วัน)
const parse = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function ageNow(birthDate) {
  const b = parse(birthDate)
  const n = new Date()
  let age = n.getFullYear() - b.getFullYear()
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) age--
  return Math.max(1, age)
}

// path ที่ขึ้นต้นด้วย / จะถูกเติม base URL ให้ (เช่น /anniversary/ บน GitHub Pages)
export const withBase = (src) => (src.startsWith('/') ? import.meta.env.BASE_URL + src.slice(1) : src)

export const rand = (a, b) => a + Math.random() * (b - a)
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

export const BASE = import.meta.env.BASE_URL
