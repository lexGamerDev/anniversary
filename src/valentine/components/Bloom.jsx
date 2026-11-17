import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { config } from '../config.js'
import { confetti } from '../effects.js'
import { sfx } from '../../birthday/sfx.js'
import Hydrangea from './Hydrangea.jsx'

const b = config.bloom

export default function Bloom({ onDone }) {
  const [found, setFound] = useState(() => new Set())
  const [current, setCurrent] = useState(null)
  const all = found.size === b.reasons.length

  const pick = (i, e) => {
    sfx.coin()
    confetti({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight, count: 30, spread: 180, power: 0.5 })
    setFound((f) => new Set(f).add(i))
    setCurrent(i)
  }

  // แตะดอกธรรมดา = กลีบฟ้าปลิวเบาๆ
  const petalPuff = (_, e) => {
    sfx.pop()
    confetti({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight, count: 6, spread: 180, power: 0.25 })
  }

  return (
    <div className="vl-bloom-scene">
      <h2 className="vl-h2">{b.title}</h2>
      <p className="vl-counter">{found.size} / {b.reasons.length}</p>

      <div className="vl-wish-slot">
        <AnimatePresence mode="wait">
          {current === null ? (
            <motion.p key="hint" className="vl-hint" exit={{ opacity: 0 }}>{b.hint}</motion.p>
          ) : (
            <motion.div key={current} className="vl-wish" initial={{ opacity: 0, y: -24, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }}>
              {b.reasons[current]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div initial={{ scale: 0.2, opacity: 0, y: 60 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 70, damping: 12, delay: 0.1 }}>
        <Hydrangea onFloret={petalPuff} specials={b.reasons.length} found={found} onPick={pick} size={Math.min(window.innerWidth * 0.8, 320)} />
      </motion.div>

      {all && (
        <motion.div className="vl-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
          <p className="vl-sub">{b.done}</p>
          <button className="vl-btn vl-btn-primary" onClick={onDone}>มีคำถามสำคัญ 💙</button>
        </motion.div>
      )}
    </div>
  )
}
