import { useMemo } from 'react'
import { confetti } from '../effects.js'
import { sfx } from '../../birthday/sfx.js'

// ผีเสื้อบินผ่านจอ แตะแล้วมีประกายฟ้า
export default function Butterflies({ count = 5 }) {
  const list = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      top: 10 + Math.random() * 70, dur: 14 + Math.random() * 10, delay: -Math.random() * 20,
      size: 22 + Math.random() * 16, dir: i % 2 ? 1 : -1, bob: 40 + Math.random() * 60,
    })),
    [count]
  )
  return (
    <div className="vl-butterflies" aria-hidden="true">
      {list.map((b, i) => (
        <span
          key={i}
          className="vl-butterfly"
          style={{ top: `${b.top}%`, fontSize: b.size, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`, '--dir': b.dir, '--bob': `${b.bob}px` }}
          onClick={(e) => {
            e.stopPropagation()
            sfx.coin()
            confetti({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight, count: 18, spread: 180, power: 0.4 })
          }}
        >
          🦋
        </span>
      ))}
    </div>
  )
}
