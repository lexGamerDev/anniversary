import { useState } from 'react'
import { motion } from 'framer-motion'
import { config } from '../config.js'
import { cannons, confetti, fireworks } from '../effects.js'
import { sfx } from '../../birthday/sfx.js'

const a = config.ask

// ปุ่ม "ไม่" หนีทุกครั้งที่จะแตะ ส่วนปุ่ม "ได้เลย" ใหญ่ขึ้นเรื่อยๆ
export default function Ask({ onDone }) {
  const [dodges, setDodges] = useState(0)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [yes, setYes] = useState(false)

  const dodge = (e) => {
    e.preventDefault()
    sfx.miss()
    setDodges((d) => d + 1)
    const maxX = Math.min(120, window.innerWidth / 2 - 70)
    setPos({ x: (Math.random() * 2 - 1) * maxX, y: (Math.random() * 2 - 1) * 110 })
  }

  const accept = () => {
    sfx.tada()
    setYes(true)
    cannons()
    fireworks(6, 450)
    confetti({ x: 0.5, y: 0.5, count: 80, spread: 180, power: 0.8 })
  }

  const hideNo = dodges >= a.noTexts.length

  return (
    <div className="vl-ask-scene">
      <motion.div className="vl-ask-flower" animate={{ rotate: [-6, 6, -6] }} transition={{ repeat: Infinity, duration: 3 }}>💠</motion.div>
      {!yes ? (
        <>
          <h2 className="vl-title small">{a.title}</h2>
          <div className="vl-ask-btns">
            <motion.button className="vl-btn vl-btn-primary" animate={{ scale: Math.min(2.2, 1 + dodges * 0.2) }} onClick={accept}>
              {a.yes}
            </motion.button>
            {!hideNo && (
              <motion.button
                className="vl-btn vl-btn-ghost"
                animate={{ x: pos.x, y: pos.y }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onPointerEnter={dodge}
                onPointerDown={dodge}
                onClick={dodge}
              >
                {a.noTexts[Math.min(dodges, a.noTexts.length - 1)]}
              </motion.button>
            )}
          </div>
        </>
      ) : (
        <motion.div className="vl-actions" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }}>
          <h2 className="vl-title small">{a.answer}</h2>
          <button className="vl-btn vl-btn-primary" onClick={onDone}>{a.next}</button>
        </motion.div>
      )}
    </div>
  )
}
