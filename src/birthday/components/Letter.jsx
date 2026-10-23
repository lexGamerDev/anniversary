import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { config } from '../config.js'
import { confetti } from '../effects.js'

const { letter } = config
const SPEED = 55 // ms ต่อตัวอักษร
const LINE_PAUSE = 6 // หยุดระหว่างบรรทัด (นับเป็นจำนวน "ตัวอักษร")

// พิมพ์ทีละตัวอักษร คืนข้อความที่พิมพ์แล้วของแต่ละบรรทัด
function useTypewriter(lines, active) {
  const total = useMemo(() => lines.reduce((n, l) => n + l.length + LINE_PAUSE, 0), [lines])
  const [pos, setPos] = useState(0)

  useEffect(() => {
    if (!active || pos >= total) return
    const t = setTimeout(() => setPos((p) => p + 1), SPEED)
    return () => clearTimeout(t)
  }, [active, pos, total])

  let left = pos
  const shown = lines.map((l) => {
    const n = Math.max(0, Math.min(l.length, left))
    left -= l.length + LINE_PAUSE
    return l.slice(0, n)
  })
  return { shown, done: pos >= total, skip: () => setPos(total) }
}

export default function Letter({ onDone }) {
  const [opened, setOpened] = useState(false)
  const { shown, done, skip } = useTypewriter(letter.lines, opened)
  const activeLine = shown.findIndex((s, i) => s.length < letter.lines[i].length)

  useEffect(() => {
    if (done) confetti({ x: 0.5, y: 0.5, count: 60, spread: 180, power: 0.7 })
  }, [done])

  return (
    <div className="bd-letter-scene">
      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.button
            key="env"
            className="bd-envelope"
            onClick={() => setOpened(true)}
            initial={{ opacity: 0, y: 60, rotate: -6 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: 80, scale: 0.8, transition: { duration: 0.4 } }}
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="เปิดจดหมาย"
          >
            <span className="bd-env-back" />
            <span className="bd-env-flap" />
            <span className="bd-env-seal">💖</span>
            <motion.span className="bd-env-hint" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.8 }}>
              {letter.sealHint}
            </motion.span>
          </motion.button>
        ) : (
          <motion.div
            key="paper"
            className="bd-paper"
            initial={{ opacity: 0, y: 120, scale: 0.6, rotate: 6 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: -1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 14 }}
          >
            <h2 className="bd-paper-title">{letter.title}</h2>
            <div className="bd-paper-body">
              {letter.lines.map((full, i) => (
                <p key={i} aria-label={full}>
                  {shown[i]}
                  {i === activeLine && <span className="bd-caret" />}
                </p>
              ))}
            </div>
            {done && (
              <motion.p className="bd-paper-sign" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                {letter.signature}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {opened && (
        <div className="bd-actions row">
          {!done && (
            <button className="bd-btn bd-btn-ghost" onClick={skip}>
              ข้าม ⏭
            </button>
          )}
          {done && (
            <motion.button className="bd-btn bd-btn-primary" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} onClick={onDone}>
              ยังมีอีกอย่าง… 🎁
            </motion.button>
          )}
        </div>
      )}
    </div>
  )
}
