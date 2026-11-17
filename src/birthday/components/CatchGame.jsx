import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { config } from '../config.js'
import { confetti } from '../effects.js'
import { sfx } from '../sfx.js'
import { pick, rand } from '../utils.js'

const g = config.game
const GOOD = ['🎁', '💖', '⭐', '🍰', '🎈', '🧁']
const BAD = ['💣']

// มินิเกม: แตะของขวัญที่ร่วงลงมา หลบระเบิด
export default function CatchGame({ onDone }) {
  const [state, setState] = useState('ready') // ready → play → end
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(g.seconds)
  const [items, setItems] = useState([])
  const id = useRef(0)

  useEffect(() => {
    if (state !== 'play') return
    const spawn = setInterval(() => {
      const bad = Math.random() < 0.18
      setItems((it) => [
        ...it,
        { id: id.current++, e: bad ? pick(BAD) : pick(GOOD), bad, x: rand(6, 86), dur: rand(2.4, 3.8), size: rand(2, 2.8) },
      ])
    }, 450)
    const tick = setInterval(() => setTime((t) => t - 1), 1000)
    return () => (clearInterval(spawn), clearInterval(tick))
  }, [state])

  useEffect(() => {
    if (state === 'play' && time <= 0) {
      setState('end')
      setItems([])
      sfx.tada()
      confetti({ x: 0.5, y: 0.5, count: 80, spread: 180, power: 0.8 })
    }
  }, [time, state])

  const remove = (itemId) => setItems((it) => it.filter((x) => x.id !== itemId))

  const hit = (item, e) => {
    remove(item.id)
    const pos = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
    if (item.bad) {
      sfx.miss()
      setScore((s) => Math.max(0, s - 2))
      confetti({ ...pos, count: 10, spread: 180, power: 0.3 })
    } else {
      sfx.coin()
      setScore((s) => s + 1)
      confetti({ ...pos, count: 12, spread: 180, power: 0.35 })
    }
  }

  const start = () => {
    setScore(0)
    setTime(g.seconds)
    setItems([])
    setState('play')
  }

  const win = score >= g.goal

  return (
    <div className="bd-game-scene">
      <h2 className="bd-h2">{g.title}</h2>

      {state === 'ready' && (
        <>
          <p className="bd-hint">{g.hint}</p>
          <button className="bd-btn bd-btn-primary" onClick={start}>
            เริ่มเลย! 🎮
          </button>
        </>
      )}

      {state !== 'ready' && (
        <p className="bd-counter">
          ⭐ {score} / {g.goal} &nbsp;·&nbsp; ⏱ {Math.max(0, time)}
        </p>
      )}

      {state === 'play' && (
        <div className="bd-arena">
          {items.map((it) => (
            <motion.button
              key={it.id}
              className="bd-faller"
              style={{ left: `${it.x}%`, fontSize: `${it.size}rem` }}
              initial={{ top: '-14%' }}
              animate={{ top: '108%' }}
              transition={{ duration: it.dur, ease: 'linear' }}
              onAnimationComplete={() => remove(it.id)}
              onPointerDown={(e) => hit(it, e)}
              aria-label="แตะเลย"
            >
              {it.e}
            </motion.button>
          ))}
        </div>
      )}

      {state === 'end' && (
        <motion.div className="bd-actions" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <p className="bd-sub">{win ? g.win : g.lose}</p>
          <p className="bd-sub small">คะแนน {score}</p>
          <div className="bd-actions row">
            <button className="bd-btn bd-btn-ghost" onClick={start}>
              ↺ เล่นอีกรอบ
            </button>
            <button className="bd-btn bd-btn-primary" onClick={onDone}>
              {g.next}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
