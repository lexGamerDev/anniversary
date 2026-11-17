import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { config } from './config.js'
import { withBase } from '../birthday/utils.js'
import { attachEffects, cannons, sparkle, floatEmoji } from './effects.js'
import { sfx } from '../birthday/sfx.js'
import Gate from './components/Gate.jsx'
import Bloom from './components/Bloom.jsx'
import Ask from './components/Ask.jsx'
import Memory from './components/Memory.jsx'
import Butterflies from './components/Butterflies.jsx'
import Photos from './components/Photos.jsx'
import Letter from './components/Letter.jsx'
import Finale from './components/Finale.jsx'

const SCENES = ['bloom', 'ask', 'memory', 'photos', 'letter', 'finale']
const SYMBOLS = ['💙', '🦋', '✨', '🤍', '💠', '💎']

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
    a.play().then(() => {
      setPlaying(true)
      const id = setInterval(() => {
        a.volume = Math.min(0.8, a.volume + 0.05)
        if (a.volume >= 0.8) clearInterval(id)
      }, 150)
    }).catch(() => {})
  }, [])
  const toggle = useCallback(() => {
    const a = audio.current
    if (!a) return
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {})
    else (a.pause(), setPlaying(false))
  }, [])
  return { play, toggle, playing, available: !!config.music }
}

const sceneVariants = {
  initial: { opacity: 0, y: 40, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  exit: { opacity: 0, y: -30, scale: 0.96, filter: 'blur(6px)', transition: { duration: 0.4 } },
}

function Floating() {
  const items = useMemo(
    () => Array.from({ length: 20 }, (_, i) => ({
      left: Math.random() * 100, size: 16 + Math.random() * 22, dur: 12 + Math.random() * 12,
      delay: -Math.random() * 20, drift: (Math.random() - 0.5) * 140, s: SYMBOLS[i % SYMBOLS.length],
    })), [])
  return (
    <div className="vl-float" aria-hidden="true">
      {items.map((h, i) => (
        <span key={i} style={{ left: `${h.left}%`, fontSize: h.size, animationDuration: `${h.dur}s`, animationDelay: `${h.delay}s`, '--drift': `${h.drift}px` }}>{h.s}</span>
      ))}
    </div>
  )
}

export default function ValentineApp() {
  const [lit, setLit] = useState(false)
  const [scene, setScene] = useState('bloom')
  const [run, setRun] = useState(0)
  const canvasRef = useRef(null)
  const music = useMusic()

  useEffect(() => {
    document.title = `Happy Valentine ${config.name} 💙`
    return attachEffects(canvasRef.current)
  }, [])

  const lastSpark = useRef(0)
  const onMove = (e) => {
    if (!lit) return
    const now = performance.now()
    if (now - lastSpark.current > 35) {
      lastSpark.current = now
      sparkle(e.clientX, e.clientY)
    }
  }
  const onTap = (e) => {
    if (!lit || e.target.closest('button, a, li, svg, .vl-card, .vl-ask-scene')) return
    floatEmoji(e.clientX, e.clientY)
  }

  const turnOn = () => {
    sfx.song()
    setLit(true)
    music.play()
    setTimeout(cannons, 700)
  }
  const next = () => setScene((s) => SCENES[SCENES.indexOf(s) + 1] ?? s)
  const replay = () => (setScene('bloom'), setRun((r) => r + 1))
  const idx = SCENES.indexOf(scene)

  return (
    <main className="vl-app" data-lit={lit} onPointerMove={onMove} onClick={onTap}>
      <div className="vl-night" aria-hidden="true" />
      <div className="vl-day" aria-hidden="true" />
      {lit && <Floating />}
      {lit && <Butterflies />}

      {lit && (
        <div className="vl-topbar">
          <div className="vl-progress" aria-label="ความคืบหน้า">
            {SCENES.map((s, i) => <span key={s} className={i < idx ? 'done' : i === idx ? 'now' : ''} />)}
          </div>
          {music.available && (
            <button className="vl-music" onClick={music.toggle} aria-label="เปิด/ปิดเพลง">{music.playing ? '🔊' : '🔇'}</button>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {!lit ? (
          <Gate key="gate" onLight={turnOn} />
        ) : (
          <motion.div key={`${scene}-${run}`} className="vl-scene" variants={sceneVariants} initial="initial" animate="animate" exit="exit">
            {scene === 'bloom' && <Bloom onDone={next} />}
            {scene === 'ask' && <Ask onDone={next} />}
            {scene === 'memory' && <Memory onDone={next} />}
            {scene === 'photos' && <Photos onDone={next} />}
            {scene === 'letter' && <Letter onDone={next} />}
            {scene === 'finale' && <Finale onReplay={replay} />}
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="vl-fx" aria-hidden="true" />
    </main>
  )
}
