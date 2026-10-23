import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { config } from '../config.js'
import { confetti } from '../effects.js'
import { rand } from '../utils.js'

const COLORS = [
  ['#ff8fb7', '#e0457b'],
  ['#ffe08a', '#f2b01e'],
  ['#8fe3ff', '#2f9fd1'],
  ['#c7a2ff', '#8a4fe0'],
  ['#9af0c8', '#18b07a'],
  ['#ffb98a', '#ef7a2b'],
]

export default function Balloons({ onDone }) {
  const wishes = config.balloons.wishes
  const [popped, setPopped] = useState({}) // index → true
  const [current, setCurrent] = useState(null)

  const balloons = useMemo(
    () =>
      wishes.map((_, i) => ({
        colors: COLORS[i % COLORS.length],
        bob: rand(2.2, 3.6),
        rot: rand(3, 7),
        offsetX: rand(-10, 10),
        offsetY: rand(-14, 14),
      })),
    [wishes]
  )

  const count = Object.keys(popped).length
  const all = count === wishes.length

  const pop = (i, e) => {
    if (popped[i]) return
    const r = e.currentTarget.getBoundingClientRect()
    confetti({ x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight, count: 40, spread: 180, power: 0.6 })
    setPopped((p) => ({ ...p, [i]: true }))
    setCurrent(i)
  }

  return (
    <div className="bd-balloon-scene">
      <h2 className="bd-h2">{config.balloons.title}</h2>
      <p className="bd-counter">
        {count} / {wishes.length}
      </p>

      <div className="bd-wish-slot">
        <AnimatePresence mode="wait">
          {current !== null && (
            <motion.div
              key={current}
              className="bd-wish"
              initial={{ opacity: 0, y: -30, scale: 0.7, rotate: -4 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            >
              {wishes[current]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bd-balloon-grid">
        {wishes.map((_, i) => (
          <div key={i} className="bd-balloon-cell" style={{ transform: `translate(${balloons[i].offsetX}px, ${balloons[i].offsetY}px)` }}>
            <AnimatePresence>
              {!popped[i] && (
                <motion.button
                  className="bd-balloon"
                  style={{ '--c1': balloons[i].colors[0], '--c2': balloons[i].colors[1] }}
                  aria-label={`ลูกโป่งที่ ${i + 1}`}
                  initial={{ y: 400, opacity: 0 }}
                  animate={{ y: [0, -14, 0], opacity: 1, rotate: [-balloons[i].rot, balloons[i].rot, -balloons[i].rot] }}
                  exit={{ scale: 1.7, opacity: 0, transition: { duration: 0.18 } }}
                  transition={{
                    y: { repeat: Infinity, duration: balloons[i].bob, ease: 'easeInOut' },
                    rotate: { repeat: Infinity, duration: balloons[i].bob * 1.3, ease: 'easeInOut' },
                    opacity: { delay: i * 0.12 },
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.88 }}
                  onClick={(e) => pop(i, e)}
                >
                  <span className="bd-balloon-shine" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {all && (
        <motion.button className="bd-btn bd-btn-primary" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, type: 'spring' }} onClick={onDone}>
          ไปดูรูปกัน 📸
        </motion.button>
      )}
    </div>
  )
}
