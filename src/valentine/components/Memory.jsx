import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { config } from '../config.js'
import { confetti } from '../effects.js'
import { sfx } from '../../birthday/sfx.js'
import { withBase } from '../../birthday/utils.js'

const m = config.memory
const items = config.photos.items

const shuffle = (a) => {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

function Face({ item }) {
  const [broken, setBroken] = useState(false)
  return broken ? <span className="vl-mem-emoji">{item.emoji}</span> : <img src={withBase(item.src)} alt="" draggable={false} onError={() => setBroken(true)} />
}

// เกมพลิกการ์ดจับคู่ จากรูปในหน้า photos
export default function Memory({ onDone }) {
  const cards = useMemo(() => shuffle([...items, ...items].map((it, i) => ({ id: i, key: items.indexOf(it), it }))), [])
  const [open, setOpen] = useState([]) // id ที่กำลังเปิดอยู่ (ยังไม่ตัดสิน)
  const [matched, setMatched] = useState(() => new Set())
  const [moves, setMoves] = useState(0)
  const all = matched.size === cards.length

  const flip = (c, e) => {
    if (open.length >= 2 || open.includes(c.id) || matched.has(c.id)) return
    sfx.pop()
    const now = [...open, c.id]
    setOpen(now)
    if (now.length === 2) {
      setMoves((v) => v + 1)
      const [a, b] = now.map((id) => cards.find((x) => x.id === id))
      if (a.key === b.key) {
        setTimeout(() => {
          sfx.coin()
          setMatched((s) => new Set(s).add(a.id).add(b.id))
          setOpen([])
          confetti({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight, count: 30, spread: 180, power: 0.5 })
        }, 450)
      } else {
        setTimeout(() => (sfx.miss(), setOpen([])), 850)
      }
    }
  }

  return (
    <div className="vl-mem-scene">
      <h2 className="vl-h2">{m.title}</h2>
      <p className="vl-counter">{all ? m.done : `${m.hint} · ${moves} ครั้ง`}</p>
      <div className="vl-mem-grid">
        {cards.map((c) => {
          const shown = open.includes(c.id) || matched.has(c.id)
          return (
            <motion.button key={c.id} className="vl-mem-card" onClick={(e) => flip(c, e)} animate={{ rotateY: shown ? 180 : 0 }} transition={{ duration: 0.4 }} aria-label="การ์ด">
              <span className="vl-mem-back">💙</span>
              <span className="vl-mem-front"><Face item={c.it} /></span>
            </motion.button>
          )
        })}
      </div>
      {all && (
        <motion.button className="vl-btn vl-btn-primary" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} onClick={onDone}>
          {m.next}
        </motion.button>
      )}
    </div>
  )
}
