import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { config } from '../config.js'
import { cannons, confetti, confettiRain, fireworks, floatEmoji } from '../effects.js'
import { sfx } from '../../birthday/sfx.js'
import { BASE } from '../../birthday/utils.js'
import Hydrangea from './Hydrangea.jsx'

const f = config.finale

export default function Finale({ onReplay }) {
  const stops = useRef([])
  useEffect(() => {
    sfx.tada()
    cannons()
    stops.current.push(fireworks(8, 700), confettiRain(7000))
    return () => stops.current.forEach((s) => s())
  }, [])

  const delay = 0.9 + f.promises.length * 0.35

  return (
    <div className="vl-finale">
      <div className="vl-rays" aria-hidden="true" />
      <motion.div initial={{ opacity: 0, scale: 0.3, y: 100 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 90, damping: 12 }}>
        <Hydrangea specials={0} onFloret={(_, e) => (sfx.pop(), confetti({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight, count: 10, spread: 180, power: 0.3 }))} size={Math.min(window.innerWidth * 0.62, 240)} />
      </motion.div>
      <h1 className="vl-title">{f.title}</h1>
      <p className="vl-sub small vl-pre">{f.message}</p>
      <ul className="vl-coupons">
        {f.promises.map((c, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: i % 2 ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.35, type: 'spring', stiffness: 150, damping: 14 }}
            onClick={(e) => confetti({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight, count: 24, spread: 120, power: 0.5 })}
          >
            <span>{c.icon}</span>
            {c.text}
          </motion.li>
        ))}
      </ul>
      <motion.p className="vl-title small" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}>{f.outro}</motion.p>
      <motion.div className="vl-actions row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.5 }}>
        <button className="vl-btn vl-btn-primary" onClick={() => (cannons(), fireworks(5, 400))}>ฉลองอีกรอบ 🎆</button>
        <button className="vl-btn vl-btn-ghost" onClick={() => (sfx.coin(), floatEmoji(window.innerWidth / 2, window.innerHeight * 0.6, 14))}>
          🦋 ปล่อยผีเสื้อ
        </button>
        <button className="vl-btn vl-btn-ghost" onClick={onReplay}>↺ ดูอีกครั้ง</button>
        <a className="vl-btn vl-btn-ghost" href={BASE}>🏠 หน้าหลัก</a>
      </motion.div>
    </div>
  )
}
