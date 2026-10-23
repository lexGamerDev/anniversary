import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { config } from './config.js'
import { withBase } from './utils.js'
import { attachEffects, cannons, sparkle } from './effects.js'
import Gate from './components/Gate.jsx'
import Bunting from './components/Bunting.jsx'
import FloatingParty from './components/FloatingParty.jsx'
import Cake from './components/Cake.jsx'
import Balloons from './components/Balloons.jsx'
import Photos from './components/Photos.jsx'
import Letter from './components/Letter.jsx'
import Gift from './components/Gift.jsx'

const SCENES = ['cake', 'balloons', 'photos', 'letter', 'gift']

function useMusic() {
  const audio = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!config.music) return
    const a = new Audio(withBase(config.music))
    a.loop = true
    a.volume = 0
    audio.current = a
    return () => a.pause()
  }, [])

  const play = useCallback(() => {
    const a = audio.current
    if (!a) return
    a.play()
      .then(() => {
        setPlaying(true)
        // ค่อยๆ เร่งเสียงขึ้น
        const id = setInterval(() => {
          a.volume = Math.min(0.8, a.volume + 0.05)
          if (a.volume >= 0.8) clearInterval(id)
        }, 150)
      })
      .catch(() => {})
  }, [])

  const toggle = useCallback(() => {
    const a = audio.current
    if (!a) return
    if (a.paused) {
      a.play().then(() => setPlaying(true)).catch(() => {})
    } else {
      a.pause()
      setPlaying(false)
    }
  }, [])

  return { play, toggle, playing, available: !!config.music }
}

const sceneVariants = {
  initial: { opacity: 0, y: 40, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  exit: { opacity: 0, y: -30, scale: 0.96, filter: 'blur(6px)', transition: { duration: 0.4 } },
}

export default function BirthdayApp() {
  const [lit, setLit] = useState(false)
  const [scene, setScene] = useState('cake')
  const [run, setRun] = useState(0) // เพิ่มค่าเพื่อเริ่มใหม่ทั้งหมด
  const canvasRef = useRef(null)
  const music = useMusic()

  useEffect(() => {
    document.title = `Happy Birthday ${config.name} 🎂`
    return attachEffects(canvasRef.current)
  }, [])

  // ประกายตามนิ้ว/เมาส์
  const lastSpark = useRef(0)
  const onMove = (e) => {
    if (!lit) return
    const now = performance.now()
    if (now - lastSpark.current > 35) {
      lastSpark.current = now
      sparkle(e.clientX, e.clientY)
    }
  }

  const turnOn = () => {
    setLit(true)
    music.play()
    setTimeout(cannons, 700)
  }

  const next = () => setScene((s) => SCENES[SCENES.indexOf(s) + 1] ?? s)
  const replay = () => {
    setScene('cake')
    setRun((r) => r + 1)
  }

  const idx = SCENES.indexOf(scene)

  return (
    <main className="bd-app" data-lit={lit} onPointerMove={onMove}>
      <div className="bd-night" aria-hidden="true">
        <Stars />
        <div className="bd-moon" />
      </div>
      <div className="bd-day" aria-hidden="true" />
      {lit && <FloatingParty />}
      {lit && <Bunting text={config.bunting} />}

      {lit && (
        <div className="bd-topbar">
          <div className="bd-progress" aria-label="ความคืบหน้า">
            {SCENES.map((s, i) => (
              <span key={s} className={i < idx ? 'done' : i === idx ? 'now' : ''} />
            ))}
          </div>
          {music.available && (
            <button className="bd-music" onClick={music.toggle} aria-label="เปิด/ปิดเพลง">
              {music.playing ? '🔊' : '🔇'}
            </button>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {!lit ? (
          <Gate key="gate" onLight={turnOn} />
        ) : (
          <motion.div key={`${scene}-${run}`} className="bd-scene" variants={sceneVariants} initial="initial" animate="animate" exit="exit">
            {scene === 'cake' && <Cake onDone={next} />}
            {scene === 'balloons' && <Balloons onDone={next} />}
            {scene === 'photos' && <Photos onDone={next} />}
            {scene === 'letter' && <Letter onDone={next} />}
            {scene === 'gift' && <Gift onReplay={replay} />}
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="bd-fx" aria-hidden="true" />
    </main>
  )
}

function Stars() {
  const stars = useRef(
    Array.from({ length: 70 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      delay: Math.random() * 4,
      dur: 2 + Math.random() * 3,
    }))
  ).current
  return stars.map((s, i) => (
    <span
      key={i}
      className="bd-star"
      style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }}
    />
  ))
}
