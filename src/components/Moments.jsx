import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { config } from '../config.js'

const { moments, autoplayDelay, photoDelay } = config

const cardVariants = {
  enter: (dir) => ({ opacity: 0, x: dir * 220, rotate: dir * 8, scale: 0.85 }),
  center: { opacity: 1, x: 0, rotate: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 18 } },
  exit: (dir) => ({ opacity: 0, x: dir * -220, rotate: dir * -8, scale: 0.85, transition: { duration: 0.4 } }),
}

// path ที่ขึ้นต้นด้วย / จะถูกเติม base URL ให้ (เช่น /anniversary/ บน GitHub Pages)
const withBase = (src) => (src.startsWith('/') ? import.meta.env.BASE_URL + src.slice(1) : src)
// รองรับทั้ง images: [...] และ image: '...' แบบเดิม
const getImages = (m) => (m.images ?? (m.image ? [m.image] : [])).map(withBase)
const momentDuration = (m) => Math.max(autoplayDelay, getImages(m).length * photoDelay)

function Gallery({ moment, index }) {
  const [failed, setFailed] = useState([])
  const [photo, setPhoto] = useState(0)
  const images = getImages(moment).filter((src) => !failed.includes(src))
  const count = images.length
  const current = count ? photo % count : 0

  useEffect(() => {
    if (count < 2) return
    const t = setTimeout(() => setPhoto((p) => (p + 1) % count), photoDelay)
    return () => clearTimeout(t)
  }, [photo, count])

  if (!count) {
    const hue = (index * 47 + 330) % 360
    return (
      <div className="photo placeholder" style={{ '--hue': hue }}>
        <span className="placeholder-emoji">{moment.emoji || '💗'}</span>
      </div>
    )
  }

  const step = (d) => () => setPhoto((p) => (p + d + count) % count)
  const src = images[current]

  return (
    <div className="gallery">
      <AnimatePresence initial={false}>
        <motion.img
          key={src}
          className="gallery-img"
          src={src}
          alt={`${moment.title} ${current + 1}`}
          onError={() => setFailed((f) => [...f, src])}
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.8 }, scale: { duration: photoDelay / 1000 + 1, ease: 'easeOut' } }}
        />
      </AnimatePresence>
      {count > 1 && (
        <>
          <button className="gallery-nav prev" onClick={step(-1)} aria-label="รูปก่อนหน้า">‹</button>
          <button className="gallery-nav next" onClick={step(1)} aria-label="รูปถัดไป">›</button>
          <span className="gallery-count">{current + 1} / {count}</span>
          <div className="gallery-dots">
            {images.map((_, i) => (
              <span key={i} className={i === current ? 'on' : ''} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function Moments({ onFinish }) {
  const [[index, dir], setState] = useState([0, 1])
  const [auto, setAuto] = useState(false)
  const isLast = index === moments.length - 1
  const moment = moments[index]
  const duration = momentDuration(moment)

  const go = useCallback(
    (step) => {
      setState(([i]) => {
        const next = i + step
        if (next < 0 || next >= moments.length) return [i, step]
        return [next, step]
      })
    },
    []
  )

  useEffect(() => {
    if (!auto) return
    const t = setTimeout(() => (isLast ? onFinish() : go(1)), duration)
    return () => clearTimeout(t)
  }, [auto, index, duration, isLast, go, onFinish])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') isLast ? onFinish() : go(1)
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === ' ') setAuto((a) => !a)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, isLast, onFinish])

  return (
    <motion.section
      className="scene moments"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(8px)', transition: { duration: 0.6 } }}
    >
      <motion.h2 className="section-title" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        Our Moments
      </motion.h2>

      <div className="card-stage">
        <AnimatePresence custom={dir} mode="popLayout" initial={false}>
          <motion.article
            key={index}
            className={`polaroid ${getImages(moment).length > 1 ? 'stacked' : ''}`}
            custom={dir}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) isLast ? onFinish() : go(1)
              else if (info.offset.x > 80) go(-1)
            }}
          >
            <div className="polaroid-inner">
              <div className="tape" />
              <Gallery moment={moment} index={index} />
              <motion.div
                className="polaroid-text"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <span className="moment-date">{moment.date}</span>
                <h3 className="moment-title">{moment.title}</h3>
                <p className="moment-caption">{moment.caption}</p>
              </motion.div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="progress">
        {moments.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === index ? 'active' : ''} ${i < index ? 'done' : ''}`}
            onClick={() => setState([i, i > index ? 1 : -1])}
            aria-label={`ไปที่ความทรงจำที่ ${i + 1}`}
          >
            {i === index && auto && (
              <motion.span
                key={`fill-${index}`}
                className="dot-fill"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="controls">
        <motion.button className="btn btn-ghost" whileTap={{ scale: 0.9 }} onClick={() => go(-1)} disabled={index === 0}>
          ← ก่อนหน้า
        </motion.button>
        <motion.button
          className={`btn btn-toggle ${auto ? 'on' : ''}`}
          whileTap={{ scale: 0.9 }}
          onClick={() => setAuto((a) => !a)}
        >
          {auto ? '⏸ หยุด' : '▶ Auto'}
        </motion.button>
        <motion.button
          className="btn btn-primary"
          whileTap={{ scale: 0.9 }}
          onClick={() => (isLast ? onFinish() : go(1))}
        >
          {isLast ? 'ไปต่อ 💝' : 'ถัดไป →'}
        </motion.button>
      </div>
      <p className="hint">ปัดการ์ดซ้าย/ขวา หรือใช้ปุ่มลูกศรบนคีย์บอร์ดได้</p>
    </motion.section>
  )
}
