import { useEffect, useRef, useState } from 'react'
import { animate, motion } from 'framer-motion'
import { age, config } from '../config.js'
import { cannons, confetti, confettiRain, fireworks } from '../effects.js'
import { BASE } from '../utils.js'

const { gift } = config

function CountUp({ to }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = animate(0, to, { duration: 2, ease: 'easeOut', onUpdate: (v) => ref.current && (ref.current.textContent = Math.round(v)) })
    return () => c.stop()
  }, [to])
  return <span ref={ref}>0</span>
}

export default function Gift({ onReplay }) {
  const [taps, setTaps] = useState(0)
  const open = taps >= gift.tapsToOpen
  const stops = useRef([])

  useEffect(() => () => stops.current.forEach((s) => s()), [])

  const tap = (e) => {
    if (open) return
    const n = taps + 1
    setTaps(n)
    confetti({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight, count: 10 + n * 4, spread: 100, power: 0.4 })
    if (n >= gift.tapsToOpen) {
      cannons()
      stops.current.push(fireworks(10, 650), confettiRain(7000))
    }
  }

  const progress = Math.min(1, taps / gift.tapsToOpen)

  return (
    <div className="bd-gift-scene">
      {!open ? (
        <>
          <p className="bd-hint">{gift.hint}</p>
          <motion.button
            key={taps}
            className="bd-giftbox"
            onClick={tap}
            aria-label="กล่องของขวัญ"
            // ยิ่งแตะเยอะ ยิ่งสั่นแรง
            animate={{ rotate: [0, -6 - taps * 2, 6 + taps * 2, -4, 4, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 0.45 }}
            whileTap={{ scale: 0.92 }}
          >
            <span className="bd-gift-lid" />
            <span className="bd-gift-body" />
            <span className="bd-gift-ribbon-v" />
            <span className="bd-gift-bow">🎀</span>
          </motion.button>
          <div className="bd-meter" aria-hidden="true">
            <span style={{ width: `${progress * 100}%` }} />
          </div>
        </>
      ) : (
        <>
          <div className="bd-rays" aria-hidden="true" />
          <motion.div
            className="bd-gift-open"
            initial={{ opacity: 0, scale: 0.3, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 110, damping: 13 }}
          >
            <div className="bd-bigage">
              <CountUp to={age} />
            </div>
            <h2 className="bd-gift-title">{gift.title}</h2>
            <p className="bd-sub small">{gift.message}</p>
            <ul className="bd-coupons">
              {gift.coupons.map((c, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: i % 2 ? 60 : -60, rotate: i % 2 ? 4 : -4 }}
                  animate={{ opacity: 1, x: 0, rotate: i % 2 ? 1.2 : -1.2 }}
                  transition={{ delay: 0.8 + i * 0.35, type: 'spring', stiffness: 150, damping: 14 }}
                  whileHover={{ scale: 1.04, rotate: 0 }}
                  onClick={(e) => confetti({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight, count: 24, spread: 120, power: 0.5 })}
                >
                  <span>{c.icon}</span>
                  {c.text}
                </motion.li>
              ))}
            </ul>
            <motion.p
              className="bd-title small"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 + gift.coupons.length * 0.35 + 0.3 }}
            >
              {gift.outro}
            </motion.p>
            <motion.div
              className="bd-actions row"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 + gift.coupons.length * 0.35 + 0.8 }}
            >
              <button className="bd-btn bd-btn-primary" onClick={() => (cannons(), fireworks(5, 400))}>
                ฉลองอีกรอบ 🎆
              </button>
              <button className="bd-btn bd-btn-ghost" onClick={onReplay}>
                ↺ ดูอีกครั้ง
              </button>
              <a className="bd-btn bd-btn-ghost" href={BASE}>
                🏠 หน้าหลัก
              </a>
            </motion.div>
          </motion.div>
        </>
      )}
    </div>
  )
}
