import { motion } from 'framer-motion'
import { config } from '../config.js'
import { daysTogether } from '../utils.js'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.25, delayChildren: 0.3 } },
  exit: { opacity: 0, scale: 0.95, filter: 'blur(8px)', transition: { duration: 0.6 } },
}
const item = {
  hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: 'easeOut' } },
}

export default function Intro({ onStart, onMovie }) {
  const letters = config.intro.title.split('')

  return (
    <motion.section className="scene intro" variants={container} initial="hidden" animate="show" exit="exit">
      <motion.div className="big-heart" variants={item}>
        <span>💖</span>
      </motion.div>

      <motion.p className="names" variants={item}>
        {config.me} <span className="amp">&</span> {config.partner}
      </motion.p>

      <h1 className="title-script" aria-label={config.intro.title}>
        {letters.map((ch, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 40, rotate: -10 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.8 + i * 0.05, type: 'spring', stiffness: 200, damping: 14 }}
          >
            {ch === ' ' ? ' ' : ch}
          </motion.span>
        ))}
      </h1>

      <motion.p className="subtitle" variants={item}>
        {config.intro.subtitle}
      </motion.p>

      <motion.div className="counter" variants={item}>
        <span className="counter-num">{daysTogether()}</span>
        <span className="counter-label">วันที่เรารักกัน</span>
      </motion.div>

      <motion.p className="message" variants={item}>
        {config.intro.message}
      </motion.p>

      <motion.div className="controls" variants={item}>
        <motion.button className="btn btn-primary" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} onClick={onStart}>
          ย้อนดูความทรงจำ 💌
        </motion.button>
        <motion.button className="btn btn-ghost" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} onClick={onMovie}>
          ดูแบบภาพยนตร์ 🎬
        </motion.button>
      </motion.div>
    </motion.section>
  )
}
