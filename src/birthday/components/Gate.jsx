import { motion } from 'framer-motion'
import { config } from '../config.js'

// หน้าแรกเป็นห้องมืด กดเปิดไฟ (ปุ่มนี้ยังช่วยให้เบราว์เซอร์ยอมเล่นเพลงได้ด้วย)
export default function Gate({ onLight }) {
  return (
    <motion.section
      className="bd-gate"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 1.2 } }}
      exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.8 } }}
    >
      <motion.div
        className="bd-bulb"
        animate={{ rotate: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="bd-bulb-cord" />
        <span className="bd-bulb-glass">💡</span>
      </motion.div>

      <motion.p
        className="bd-gate-hint"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.8, repeat: Infinity }}
      >
        {config.gate.hint}
      </motion.p>

      <motion.button
        className="bd-btn bd-btn-glow"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={onLight}
      >
        {config.gate.button}
      </motion.button>
    </motion.section>
  )
}
