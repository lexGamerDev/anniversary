import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { age, config } from '../config.js'
import { cannons, confetti, confettiRain } from '../effects.js'
import { useBlow } from '../useBlow.js'

const CANDLES = Math.min(age, 7)
const CANDLE_X = Array.from({ length: CANDLES }, (_, i) => (CANDLES === 1 ? 160 : 118 + (84 / (CANDLES - 1)) * i))
const BLOW_THRESHOLD = 0.3 // ความดังขั้นต่ำที่นับว่า "เป่า"

// ขอบครีมหยัก ๆ ใต้ชั้นเค้ก
function scallop(x, y, width, n) {
  const r = width / (2 * n)
  let d = `M${x} ${y}h${width}v6`
  for (let i = n; i > 0; i--) d += `A${r} ${r} 0 0 1 ${x + (i - 1) * 2 * r} ${y + 6}`
  return d + 'z'
}

function Candle({ x, out, onBlow, delay }) {
  return (
    <g onClick={onBlow} style={{ cursor: out ? 'default' : 'pointer' }}>
      <rect x={x - 4} y={56} width={8} height={36} rx={2} fill="#fff" />
      <rect x={x - 4} y={64} width={8} height={5} fill="#ff6b9d" />
      <rect x={x - 4} y={76} width={8} height={5} fill="#4cc9f0" />
      <line x1={x} y1={56} x2={x} y2={50} stroke="#4a2c3a" strokeWidth={1.4} />
      <rect x={x - 14} y={20} width={28} height={50} fill="transparent" />
      {!out ? (
        <g className="bd-flame" style={{ transformOrigin: `${x}px 50px`, animationDelay: `${delay}s` }}>
          <ellipse cx={x} cy={42} rx={9} ry={14} fill="#ffb347" opacity={0.35} />
          <path d={`M${x} 28 C${x + 8} 38 ${x + 7} 49 ${x} 50 C${x - 7} 49 ${x - 8} 38 ${x} 28z`} fill="#ffd166" />
          <path d={`M${x} 36 C${x + 4} 42 ${x + 3} 48 ${x} 49 C${x - 3} 48 ${x - 4} 42 ${x} 36z`} fill="#fff6d6" />
        </g>
      ) : (
        <path className="bd-smoke" d={`M${x} 48 q-6 -8 0 -14 q6 -6 0 -14`} fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
      )}
    </g>
  )
}

export default function Cake({ onDone }) {
  const [out, setOut] = useState(() => new Set())
  const [phase, setPhase] = useState('wish') // wish → dark → lit
  const power = useRef(0)
  const outRef = useRef(out)
  outRef.current = out

  const blowOut = useCallback((i) => {
    setOut((prev) => {
      if (prev.has(i)) return prev
      const next = new Set(prev)
      next.add(i)
      return next
    })
  }, [])

  // เป่าจริงๆ: ยิ่งเป่านาน เทียนยิ่งดับเพิ่ม
  const mic = useBlow(
    useCallback(
      (level, dt) => {
        power.current = level > BLOW_THRESHOLD ? power.current + dt : Math.max(0, power.current - dt * 0.6)
        for (let i = 0; i < CANDLES; i++) if (power.current > 0.2 + i * 0.12 && !outRef.current.has(i)) blowOut(i)
      },
      [blowOut]
    )
  )

  const stopMic = mic.stop
  useEffect(() => {
    if (out.size === CANDLES) {
      stopMic()
      setPhase((p) => (p === 'wish' ? 'dark' : p))
    }
  }, [out, stopMic])

  // ห้องมืดสักพัก แล้วเปิดไฟฉลอง
  useEffect(() => {
    if (phase !== 'dark') return
    const t = setTimeout(() => {
      setPhase('lit')
      cannons()
      confettiRain(4500)
    }, 1500)
    return () => clearTimeout(t)
  }, [phase])

  const dim = phase === 'dark' ? 0.92 : phase === 'lit' ? 0 : (out.size / CANDLES) * 0.7
  const lit = phase === 'lit'

  return (
    <div className="bd-cake-scene">
      <div className="bd-dim" style={{ opacity: dim }} />

      <AnimatePresence mode="wait">
        {lit ? (
          <motion.div key="title" className="bd-hero" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 12 }}>
            <h1 className="bd-title" aria-label={config.cake.title}>
              {config.cake.title.split('').map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 40, rotate: -12 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ delay: 0.2 + i * 0.05, type: 'spring', stiffness: 200, damping: 12 }}
                >
                  {ch === ' ' ? ' ' : ch}
                </motion.span>
              ))}
            </h1>
            <motion.p className="bd-name" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              {config.name}
            </motion.p>
          </motion.div>
        ) : (
          <motion.p key="hint" className="bd-hint" exit={{ opacity: 0 }}>
            {phase === 'dark' ? '✨ ขอพรสำเร็จ ✨' : config.cake.hint}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.svg
        className="bd-cake"
        viewBox="0 0 320 290"
        initial={{ y: 80, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 90, damping: 12, delay: 0.2 }}
        onClick={(e) => {
          // แตะที่ตัวเค้กก็มีประกายเล็กๆ
          confetti({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight, count: 14, spread: 180, power: 0.35 })
        }}
      >
        <ellipse cx={160} cy={272} rx={150} ry={14} fill="rgba(0,0,0,0.18)" />
        <ellipse cx={160} cy={266} rx={142} ry={16} fill="#f3e9ff" />
        {/* ชั้นล่าง */}
        <rect x={40} y={190} width={240} height={76} rx={14} fill="#ff8fb7" />
        <path d={scallop(40, 190, 240, 12)} fill="#fff" />
        {/* ชั้นกลาง */}
        <rect x={70} y={136} width={180} height={58} rx={12} fill="#c7a2ff" />
        <path d={scallop(70, 136, 180, 9)} fill="#fff" />
        {/* ชั้นบน */}
        <rect x={100} y={92} width={120} height={48} rx={10} fill="#ffe08a" />
        <path d={scallop(100, 92, 120, 6)} fill="#fff" />
        {/* ลวดลาย */}
        {[60, 90, 120, 150, 180, 210, 240, 260].map((x, i) => (
          <circle key={x} cx={x} cy={232 + (i % 2) * 14} r={4} fill={['#fff', '#ffd166', '#4cc9f0', '#fff'][i % 4]} />
        ))}
        {[90, 120, 150, 180, 210, 230].map((x, i) => (
          <circle key={x} cx={x} cy={170 + (i % 2) * 10} r={3.5} fill={['#fff', '#ff6b9d', '#ffd166'][i % 3]} />
        ))}
        <text x={160} y={125} textAnchor="middle" fontSize={26} fontFamily="Sriracha, cursive" fill="#e0457b">{age}</text>
        {[76, 160, 244].map((x) => (
          <g key={x}>
            <circle cx={x} cy={188} r={9} fill="#e0457b" />
            <circle cx={x - 3} cy={185} r={2.5} fill="#fff" opacity={0.6} />
          </g>
        ))}
        {CANDLE_X.map((x, i) => (
          <Candle key={i} x={x} out={out.has(i)} delay={i * 0.17} onBlow={() => blowOut(i)} />
        ))}
      </motion.svg>

      {phase === 'wish' && (
        <motion.div className="bd-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <button
            className={`bd-btn bd-btn-ghost ${mic.status === 'listening' ? 'listening' : ''}`}
            onClick={mic.status === 'listening' ? mic.stop : mic.start}
            disabled={mic.status === 'asking'}
          >
            {mic.status === 'listening' ? '🎤 กำลังฟัง… เป่าเลย!' : mic.status === 'denied' ? '🎤 ใช้ไมค์ไม่ได้ แตะเทียนแทนนะ' : '🎤 เป่าด้วยเสียงจริง'}
          </button>
          <button className="bd-btn bd-btn-ghost" onClick={() => CANDLE_X.forEach((_, i) => setTimeout(() => blowOut(i), i * 160))}>
            💨 เป่าทั้งหมด
          </button>
        </motion.div>
      )}

      {lit && (
        <motion.div className="bd-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }}>
          <p className="bd-sub">{config.cake.subtitle}</p>
          <p className="bd-sub small">{config.cake.after}</p>
          <button className="bd-btn bd-btn-primary" onClick={onDone}>
            ไปต่อเลย 🎈
          </button>
        </motion.div>
      )}
    </div>
  )
}
