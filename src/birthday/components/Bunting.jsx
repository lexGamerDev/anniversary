import { motion } from 'framer-motion'

const FLAG_COLORS = ['#ff6b9d', '#ffd166', '#4cc9f0', '#b05cff', '#06d6a0', '#ff9f43']

// ธงราวห้อยด้านบน แต่ละธง = 1 ตัวอักษร ตกลงมาทีละใบ แล้วแกว่งเบาๆ
export default function Bunting({ text }) {
  const chars = text.toUpperCase().split('')
  const total = chars.length
  let flag = 0
  return (
    <div className="bd-bunting" aria-hidden="true">
      <div className="bd-bunting-row">
        <svg className="bd-bunting-line" viewBox="0 0 100 60" preserveAspectRatio="none">
          <path d="M0 2 Q50 38 100 2" fill="none" stroke="#4a2c3a" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        </svg>
        {chars.map((ch, i) => {
          // เส้นราวห้อยเป็นเส้นโค้ง: กลางต่ำ ปลายสูง
          const t = (i + 0.5) / total
          const sag = 72 * t * (1 - t) + 2 // ตรงกับเส้นโค้งใน SVG
          if (ch === ' ') return <span key={i} className="bd-flag-gap" />
          const n = flag++
          return (
            <motion.span
              key={i}
              className="bd-flag-wrap"
              style={{ marginTop: sag }}
              initial={{ y: -120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 + i * 0.07, type: 'spring', stiffness: 160, damping: 11 }}
            >
              <motion.span
                className="bd-flag"
                style={{ background: FLAG_COLORS[n % FLAG_COLORS.length] }}
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 2.4 + (i % 3) * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}
              >
                <b>{ch}</b>
              </motion.span>
            </motion.span>
          )
        })}
      </div>
    </div>
  )
}
