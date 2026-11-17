import { useMemo } from 'react'

const SHADES = ['#7aa5ff', '#9db8ff', '#5b7ff0', '#b9a8ff', '#cfe0ff', '#4f6fd8', '#8fd3ff']
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

// ดอกย่อย 1 ดอก (กลีบ 4 กลีบแบบไฮเดรนเยีย)
function Floret({ x, y, r, rot, color, center }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {[0, 90, 180, 270].map((a) => (
        <ellipse key={a} cx={0} cy={-r * 0.55} rx={r * 0.58} ry={r * 0.72} fill={color} transform={`rotate(${a})`} stroke="rgba(255,255,255,.5)" strokeWidth={0.6} />
      ))}
      <circle r={r * 0.2} fill={center} />
    </g>
  )
}

// ช่อไฮเดรนเยียสีฟ้า: ดอกย่อยเรียงเป็นโดมแบบก้นหอย
// specials = จำนวนดอกที่เรืองแสงให้แตะ (ส่ง found เพื่อรู้ว่าดอกไหนแตะแล้ว)
export default function Hydrangea({ count = 70, specials = 0, found = new Set(), onPick, onFloret, size = 320, bloom = true }) {
  const florets = useMemo(() => {
    const list = []
    const R = 128
    for (let i = 1; i <= count; i++) {
      const d = R * Math.sqrt(i / count)
      const a = i * GOLDEN
      const edge = d / R
      list.push({
        x: 160 + Math.cos(a) * d,
        y: 150 + Math.sin(a) * d * 0.9,
        r: 15 + edge * 7 + Math.random() * 3,
        rot: Math.random() * 90,
        color: SHADES[Math.floor(Math.random() * SHADES.length)],
        order: i,
      })
    }
    // เลือกดอกพิเศษกระจายรอบช่อ (เว้นแน่นอนไม่ซ้ำ)
    const picks = []
    for (let k = 0; k < specials; k++) picks.push(Math.floor(((k + 0.5) / specials) * (count - 12)) + 10)
    list.forEach((f) => (f.special = picks.indexOf(f.order - 1)))
    return list
  }, [count, specials])

  return (
    <svg viewBox="0 0 320 400" width={size} className="vl-hydrangea" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="vl-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#8fd3ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* ก้านและใบ */}
      <path d="M160 270 C158 320 162 360 160 395" stroke="#3f8f6a" strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M160 340 C110 330 78 300 70 262 C118 262 152 290 160 340z" fill="#4fae83" />
      <path d="M160 355 C210 345 246 322 256 282 C206 280 168 306 160 355z" fill="#3f9a72" />
      <g className={bloom ? 'vl-bloom' : ''} style={{ transformOrigin: '160px 150px' }}>
        {florets.filter((f) => f.special < 0).map((f) => (
          <g key={f.order} className="vl-floret" style={{ transformOrigin: `${f.x}px ${f.y}px`, transformBox: 'view-box', animationDelay: `${(f.order % 20) * 0.04}s`, cursor: onFloret ? 'pointer' : 'default' }} onClick={onFloret ? (e) => onFloret(f, e) : undefined}>
            <Floret {...f} center="#eaf1ff" />
          </g>
        ))}
        {/* ดอกพิเศษวาดทีหลังเพื่อให้อยู่บนสุด ใหญ่และเรืองแสง */}
        {florets.filter((f) => f.special >= 0).map((f) => {
          const done = found.has(f.special)
          return (
            <g key={f.order} style={{ cursor: done ? 'default' : 'pointer' }} onClick={!done && onPick ? (e) => onPick(f.special, e) : undefined}>
              {!done && (
                <>
                  <circle className="vl-halo" cx={f.x} cy={f.y} r={f.r * 2.6} fill="url(#vl-glow)" style={{ transformOrigin: `${f.x}px ${f.y}px`, transformBox: 'view-box' }} />
                  <circle className="vl-ring" cx={f.x} cy={f.y} r={f.r * 1.2} fill="none" stroke="#ffd166" strokeWidth={2.5} style={{ transformOrigin: `${f.x}px ${f.y}px`, transformBox: 'view-box' }} />
                  <circle className="vl-ring r2" cx={f.x} cy={f.y} r={f.r * 1.2} fill="none" stroke="#fff" strokeWidth={2} style={{ transformOrigin: `${f.x}px ${f.y}px`, transformBox: 'view-box' }} />
                </>
              )}
              <g className={done ? '' : 'vl-special'} style={{ transformOrigin: `${f.x}px ${f.y}px`, transformBox: 'view-box' }}>
                <Floret x={f.x} y={f.y} r={f.r * (done ? 1 : 1.4)} rot={f.rot} color={done ? '#dfe9ff' : '#ffffff'} center={done ? '#eaf1ff' : '#ffb800'} />
                {!done && <text x={f.x} y={f.y - f.r * 1.5} textAnchor="middle" fontSize={13} className="vl-star">✦</text>}
              </g>
              <circle cx={f.x} cy={f.y} r={f.r * 2} fill="transparent" />
            </g>
          )
        })}
      </g>
    </svg>
  )
}
