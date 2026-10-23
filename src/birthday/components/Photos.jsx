import { useState } from 'react'
import { motion } from 'framer-motion'
import { config } from '../config.js'
import { confetti } from '../effects.js'
import { withBase } from '../utils.js'

const items = config.photos.items
const TILTS = [-4, 3, -2, 5, -5, 2]

function Polaroid({ item, index }) {
  const [broken, setBroken] = useState(false)
  return (
    <div className="bd-polaroid">
      <div className="bd-polaroid-img">
        {broken ? (
          <div className="bd-polaroid-ph" style={{ '--hue': (index * 47 + 300) % 360 }}>
            <span>{item.emoji || '🎂'}</span>
          </div>
        ) : (
          <img src={withBase(item.src)} alt={item.caption} draggable={false} onError={() => setBroken(true)} />
        )}
      </div>
      <p>{item.caption}</p>
    </div>
  )
}

// กองโพลารอยด์: ลาก/ปัดการ์ดใบบนออก แล้วใบถัดไปขึ้นมา
export default function Photos({ onDone }) {
  const [order, setOrder] = useState(() => items.map((_, i) => i))
  const [seen, setSeen] = useState(1)

  const cycle = (dir = 1) => {
    setOrder((o) => (dir > 0 ? [...o.slice(1), o[0]] : [o[o.length - 1], ...o.slice(0, -1)]))
    setSeen((s) => Math.min(items.length, s + 1))
    confetti({ x: 0.5, y: 0.45, count: 12, spread: 120, power: 0.3 })
  }

  return (
    <div className="bd-photo-scene">
      <h2 className="bd-h2">{config.photos.title}</h2>

      <div className="bd-stack">
        {order
          .map((photoIdx, pos) => ({ photoIdx, pos }))
          .slice(0, 4)
          .reverse()
          .map(({ photoIdx, pos }) => (
            <motion.div
              key={photoIdx}
              className="bd-card"
              drag={pos === 0 ? 'x' : false}
              dragSnapToOrigin
              dragElastic={0.7}
              whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) cycle(info.offset.x < 0 ? 1 : -1)
              }}
              initial={{ opacity: 0, y: 60, scale: 0.8 }}
              animate={{
                opacity: 1,
                y: pos * 12,
                scale: 1 - pos * 0.05,
                rotate: pos === 0 ? 0 : TILTS[photoIdx % TILTS.length],
              }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              style={{ zIndex: 10 - pos }}
            >
              <Polaroid item={items[photoIdx]} index={photoIdx} />
            </motion.div>
          ))}
      </div>

      <div className="bd-actions row">
        <button className="bd-btn bd-btn-ghost" onClick={() => cycle(-1)} aria-label="ก่อนหน้า">‹</button>
        <span className="bd-counter">{Math.min(seen, items.length)} / {items.length}</span>
        <button className="bd-btn bd-btn-ghost" onClick={() => cycle(1)} aria-label="ถัดไป">›</button>
      </div>

      <motion.button
        className="bd-btn bd-btn-primary"
        initial={{ opacity: 0 }}
        animate={{ opacity: seen >= items.length ? 1 : 0.35 }}
        onClick={onDone}
      >
        {seen >= items.length ? 'มีจดหมายรออยู่ 💌' : 'ข้ามไปจดหมาย'}
      </motion.button>
    </div>
  )
}
