import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { config } from '../config.js'
import { withBase } from '../utils.js'
import { FPS, H, W, buildTimeline, drawFrame, loadAssets } from '../movie/engine.js'

const MIME_TYPES = [
  'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
  'video/mp4',
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
]
const pickMime = () => MIME_TYPES.find((t) => window.MediaRecorder?.isTypeSupported(t))
const canRecord = typeof window !== 'undefined' && !!window.MediaRecorder && !!pickMime()

const now = () => performance.now() / 1000
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

function download(blob, mime) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `our-anniversary.${mime.startsWith('video/mp4') ? 'mp4' : 'webm'}`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 10000)
}

export default function Movie({ onBack, onFinish }) {
  const canvasRef = useRef(null)
  const fillRef = useRef(null)
  const timeRef = useRef(null)
  const clock = useRef({ base: now(), offset: 0, playing: true })
  const recRef = useRef(null)
  const audioRef = useRef(null)

  const [timeline, setTimeline] = useState(null)
  const [playing, setPlaying] = useState(true)
  const [recording, setRecording] = useState(false)
  const [muted, setMuted] = useState(false)

  const getTime = () => {
    const c = clock.current
    return c.offset + (c.playing ? now() - c.base : 0)
  }
  const seek = (t) => {
    clock.current = { ...clock.current, base: now(), offset: t }
    const el = audioRef.current?.el
    if (el && el.duration) el.currentTime = t % el.duration
  }

  // โหลดรูป + ฟอนต์ แล้วสร้าง timeline
  useEffect(() => {
    let cancelled = false
    loadAssets().then((assets) => {
      if (cancelled) return
      clock.current = { base: now(), offset: 0, playing: true }
      setTimeline(buildTimeline(assets))
    })
    return () => {
      cancelled = true
    }
  }, [])

  // เพลงประกอบ (ถ้าตั้งไว้ใน config)
  useEffect(() => {
    if (!config.movie?.music) return
    const el = new Audio(withBase(config.movie.music))
    el.loop = true
    audioRef.current = { el }
    return () => {
      el.pause()
      audioRef.current?.ctx?.close()
    }
  }, [])

  useEffect(() => {
    const el = audioRef.current?.el
    if (!el || !timeline) return
    if (playing) el.play().catch(() => setMuted(true))
    else el.pause()
  }, [playing, timeline])

  useEffect(() => {
    if (audioRef.current) audioRef.current.el.muted = muted && !recording
  }, [muted, recording])

  // วนลูปวาดเฟรม
  useEffect(() => {
    if (!timeline) return
    const ctx = canvasRef.current.getContext('2d')
    let raf
    const tick = () => {
      let t = getTime()
      if (t >= timeline.total) {
        if (recRef.current) {
          recRef.current.stop() // อัดครบ 1 รอบ → onstop จะดาวน์โหลดไฟล์
          recRef.current = null
        }
        seek(0) // เล่นวนใหม่ตั้งแต่ต้น
        t = 0
      }
      drawFrame(ctx, timeline, t)
      if (fillRef.current) fillRef.current.style.width = `${(t / timeline.total) * 100}%`
      if (timeRef.current) timeRef.current.textContent = `${fmt(t)} / ${fmt(timeline.total)}`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      if (recRef.current) {
        recRef.current.onstop = null // ออกจากหน้ากลางคัน: ไม่ต้องดาวน์โหลดไฟล์ที่อัดไม่ครบ
        recRef.current.stop()
      }
    }
  }, [timeline])

  const togglePlay = () => {
    const c = clock.current
    if (c.playing) clock.current = { ...c, offset: getTime(), playing: false }
    else clock.current = { ...c, base: now(), playing: true }
    setPlaying(!c.playing)
  }

  const onSeek = (e) => {
    if (recording || !timeline) return
    const rect = e.currentTarget.getBoundingClientRect()
    seek(((e.clientX - rect.left) / rect.width) * timeline.total)
  }

  const startRecording = async () => {
    const mime = pickMime()
    const stream = canvasRef.current.captureStream(FPS)

    const audio = audioRef.current
    if (audio) {
      // ส่งเสียงเพลงเข้าไปในไฟล์วิดีโอด้วย
      if (!audio.ctx) {
        audio.ctx = new AudioContext()
        const source = audio.ctx.createMediaElementSource(audio.el)
        audio.dest = audio.ctx.createMediaStreamDestination()
        source.connect(audio.ctx.destination)
        source.connect(audio.dest)
      }
      await audio.ctx.resume()
      audio.dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track))
    }

    const chunks = []
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 })
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
    rec.onstop = () => {
      stream.getVideoTracks().forEach((track) => track.stop())
      download(new Blob(chunks, { type: mime }), mime)
      setRecording(false)
    }

    clock.current = { base: now(), offset: 0, playing: true }
    seek(0)
    setPlaying(true)
    rec.start(1000)
    recRef.current = rec
    setRecording(true)
  }

  return (
    <motion.section
      className="scene movie"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(8px)', transition: { duration: 0.6 } }}
    >
      <motion.h2 className="section-title" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        Our Movie
      </motion.h2>

      <motion.div
        className="movie-frame"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      >
        <canvas ref={canvasRef} width={W} height={H} onClick={recording ? undefined : togglePlay} />
        {!timeline && <div className="movie-overlay">กำลังเตรียมภาพยนตร์… 🎞️</div>}
        {recording && <div className="rec-badge">● REC</div>}
      </motion.div>

      <div className={`movie-progress ${recording ? 'locked' : ''}`} onClick={onSeek}>
        <div ref={fillRef} className="movie-progress-fill" />
      </div>
      <span ref={timeRef} className="movie-time">0:00</span>

      <div className="controls">
        <motion.button className="btn btn-ghost" whileTap={{ scale: 0.9 }} onClick={onBack} disabled={recording}>
          ← กลับ
        </motion.button>
        <motion.button className="btn btn-toggle" whileTap={{ scale: 0.9 }} onClick={togglePlay} disabled={recording || !timeline}>
          {playing ? '⏸ หยุด' : '▶ เล่น'}
        </motion.button>
        {config.movie?.music && (
          <motion.button className="btn btn-toggle" whileTap={{ scale: 0.9 }} onClick={() => setMuted((m) => !m)} disabled={recording}>
            {muted ? '🔇' : '🔊'}
          </motion.button>
        )}
        {canRecord && (
          <motion.button className="btn btn-toggle" whileTap={{ scale: 0.9 }} onClick={startRecording} disabled={recording || !timeline}>
            {recording ? 'กำลังอัด…' : '⬇ ดาวน์โหลดวิดีโอ'}
          </motion.button>
        )}
        <motion.button className="btn btn-primary" whileTap={{ scale: 0.9 }} onClick={onFinish} disabled={recording}>
          ไปต่อ 💝
        </motion.button>
      </div>

      <p className="hint">
        {recording
          ? 'กำลังอัดวิดีโอ… ต้องเปิดหน้านี้ค้างไว้จนจบ (ห้ามสลับแท็บ) แล้วไฟล์จะดาวน์โหลดเอง'
          : canRecord
            ? 'แตะที่จอเพื่อหยุด/เล่น • กดที่แถบเพื่อกรอ'
            : 'เบราว์เซอร์นี้ไม่รองรับการอัดวิดีโอ ลองเปิดด้วย Chrome บนคอมพิวเตอร์'}
      </p>
    </motion.section>
  )
}
