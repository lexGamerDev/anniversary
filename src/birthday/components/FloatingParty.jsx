import { useMemo } from 'react'

const SYMBOLS = ['🎈', '🎉', '🎁', '🎂', '⭐', '🎊', '🧁', '🍭']

export default function FloatingParty({ count = 18 }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 16 + Math.random() * 22,
        duration: 12 + Math.random() * 12,
        delay: -Math.random() * 20,
        drift: (Math.random() - 0.5) * 140,
        symbol: SYMBOLS[i % SYMBOLS.length],
      })),
    [count]
  )
  return (
    <div className="bd-float" aria-hidden="true">
      {items.map((h) => (
        <span
          key={h.id}
          style={{
            left: `${h.left}%`,
            fontSize: h.size,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
            '--drift': `${h.drift}px`,
          }}
        >
          {h.symbol}
        </span>
      ))}
    </div>
  )
}
