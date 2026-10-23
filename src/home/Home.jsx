import { useEffect, useMemo, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { config } from '../config.js'

const BASE = import.meta.env.BASE_URL

const CHOICES = [
  {
    href: `${BASE}love/`,
    emoji: '💖',
    title: 'วันครบรอบ',
    desc: 'ย้อนดูความทรงจำของเราสองคน',
    cls: 'love',
  },
  {
    href: `${BASE}birthday/`,
    emoji: '🎂',
    title: 'วันเกิด',
    desc: 'เป่าเทียน แตกลูกโป่ง เปิดของขวัญ',
    cls: 'bday',
  },
]

const SYMBOLS = ['💗', '🎈', '✨', '💕', '🎉', '🤍', '🎁', '💖']

// การ์ดเอียงตามตำแหน่งเมาส์/นิ้ว
function Card({ c, i }) {
  const ref = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 200, damping: 18 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 18 })

  const move = (e) => {
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const leave = () => (mx.set(0), my.set(0))

  return (
    <motion.a
      ref={ref}
      href={c.href}
      className={`hm-card ${c.cls}`}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 800 }}
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.6 + i * 0.2, type: 'spring', stiffness: 120, damping: 14 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onPointerMove={move}
      onPointerLeave={leave}
    >
      <span className="hm-emoji">{c.emoji}</span>
      <span className="hm-card-title">{c.title}</span>
      <span className="hm-card-desc">{c.desc}</span>
      <span className="hm-go">เข้าไปดู →</span>
    </motion.a>
  )
}

export default function Home() {
  useEffect(() => {
    document.title = `${config.me} & ${config.partner} 💖🎂`
  }, [])

  const floaters = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 14 + Math.random() * 22,
        duration: 10 + Math.random() * 12,
        delay: -Math.random() * 20,
        drift: (Math.random() - 0.5) * 120,
        symbol: SYMBOLS[i % SYMBOLS.length],
      })),
    []
  )

  return (
    <main className="hm">
      <div className="hm-glow" />
      <div className="hm-float" aria-hidden="true">
        {floaters.map((f) => (
          <span
            key={f.id}
            style={{ left: `${f.left}%`, fontSize: f.size, animationDuration: `${f.duration}s`, animationDelay: `${f.delay}s`, '--drift': `${f.drift}px` }}
          >
            {f.symbol}
          </span>
        ))}
      </div>

      <section className="hm-content">
        <motion.p className="hm-names" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          {config.me} <span>&</span> {config.partner}
        </motion.p>
        <motion.h1
          className="hm-title"
          initial={{ opacity: 0, scale: 0.7, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          วันนี้อยากดูอะไรดี?
        </motion.h1>

        <div className="hm-cards">
          {CHOICES.map((c, i) => (
            <Card key={c.cls} c={c} i={i} />
          ))}
        </div>
      </section>
    </main>
  )
}
