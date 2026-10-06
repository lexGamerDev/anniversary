// แทนที่ {years} {ordinal} {days} ในข้อความทุกจุดของ config ด้วยตัวเลขจริงที่นับจาก startDate
import { config as raw } from './config.js'
import { daysTogether, ordinal, yearsTogether } from './utils.js'

const values = {
  years: yearsTogether(),
  ordinal: ordinal(yearsTogether()),
  days: daysTogether().toLocaleString(),
}

const fill = (v) =>
  typeof v === 'string'
    ? v.replace(/\{(\w+)\}/g, (m, key) => values[key] ?? m)
    : Array.isArray(v)
      ? v.map(fill)
      : v && typeof v === 'object'
        ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fill(x)]))
        : v

export const config = fill(raw)
