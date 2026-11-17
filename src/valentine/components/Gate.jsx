import { motion } from 'framer-motion'
import { config } from '../config.js'

// ช่อไฮเดรนเยียตูมๆ ยามค่ำคืน กดให้บาน (ปุ่มนี้ช่วยให้เบราว์เซอร์ยอมเล่นเพลงด้วย)
export default function Gate({ onLight }) {
  return (
    <motion.section className="vl-gate" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 1.2 } }} exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.8 } }}>
      <motion.div className="vl-bud" animate={{ scale: [1, 1.08, 1], rotate: [-3, 3, -3] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}>
        🪻
      </motion.div>
      <motion.p className="vl-gate-hint" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.8, repeat: Infinity }}>
        {config.gate.hint}
      </motion.p>
      <motion.button className="vl-btn vl-btn-glow" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={onLight}>
        {config.gate.button}
      </motion.button>
    </motion.section>
  )
}
