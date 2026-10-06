import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { config } from '../content.js'

const { outro } = config
const LINE_GAP = 1.4

function HeartBurst({ trigger }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => {
        const angle = (i / 40) * Math.PI * 2
        const dist = 160 + Math.random() * 260
        return {
          id: `${trigger}-${i}`,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          rotate: Math.random() * 360,
          size: 14 + Math.random() * 18,
          symbol: ['💖', '💕', '✨', '🌸', '💗'][i % 5],
        }
      }),
    [trigger]
  )
  return (
    <div className="burst" aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          style={{ fontSize: p.size }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 1.2, rotate: p.rotate }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
        >
          {p.symbol}
        </motion.span>
      ))}
    </div>
  )
}

export default function Outro({ onReplay }) {
  const [burst, setBurst] = useState(0)
  const doneAt = 1 + outro.lines.length * LINE_GAP

  useEffect(() => {
    const t = setTimeout(() => setBurst(1), doneAt * 1000)
    return () => clearTimeout(t)
  }, [doneAt])

  return (
    <motion.section
      className="scene outro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
    >
      {burst > 0 && <HeartBurst trigger={burst} />}

      <motion.h2
        className="title-script outro-title"
        initial={{ opacity: 0, scale: 0.6, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        {outro.title}
      </motion.h2>

      <div className="letter">
        {outro.lines.map((line, i) => (
          <motion.p
            key={i}
            className="letter-line"
            initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 1 + i * LINE_GAP, duration: 1 }}
          >
            {line}
          </motion.p>
        ))}
      </div>

      <motion.p
        className="signature"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: doneAt, type: 'spring', stiffness: 150 }}
      >
        {outro.signature}
      </motion.p>

      <motion.p
        className="from"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: doneAt + 0.6 }}
      >
        — {config.me} ถึง {config.partner} —
      </motion.p>

      <motion.div
        className="controls"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: doneAt + 1.2 }}
      >
        <motion.button
          className="btn btn-primary pulse"
          whileTap={{ scale: 0.9 }}
          onClick={() => setBurst((b) => b + 1)}
        >
          ส่งหัวใจ 💖
        </motion.button>
        <motion.button className="btn btn-ghost" whileTap={{ scale: 0.9 }} onClick={onReplay}>
          ↺ ดูอีกครั้ง
        </motion.button>
      </motion.div>
    </motion.section>
  )
}
