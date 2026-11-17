// เสียงเอฟเฟกต์สั้นๆ สังเคราะห์ด้วย WebAudio (ไม่ต้องมีไฟล์เสียง)
let ac = null

function ctx() {
  try {
    ac ??= new (window.AudioContext || window.webkitAudioContext)()
    if (ac.state === 'suspended') ac.resume()
  } catch {
    return null
  }
  return ac
}

function tone(freq, { at = 0, dur = 0.18, type = 'sine', vol = 0.15, to } = {}) {
  const c = ctx()
  if (!c) return
  const t = c.currentTime + at
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(c.destination)
  o.start(t)
  o.stop(t + dur + 0.02)
}

export const sfx = {
  pop: () => tone(520, { dur: 0.12, type: 'triangle', to: 120, vol: 0.2 }),
  blow: () => tone(300, { dur: 0.25, type: 'sawtooth', to: 80, vol: 0.05 }),
  coin: () => (tone(988, { dur: 0.08, type: 'square', vol: 0.06 }), tone(1319, { at: 0.07, dur: 0.18, type: 'square', vol: 0.06 })),
  miss: () => tone(220, { dur: 0.2, type: 'sawtooth', to: 110, vol: 0.06 }),
  tada: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, { at: i * 0.1, dur: 0.35, type: 'triangle', vol: 0.12 })),
  // ทำนอง Happy Birthday ท่อนแรก
  song: () => {
    const notes = [[392, 0.3], [392, 0.15], [440, 0.45], [392, 0.45], [523, 0.45], [494, 0.8]]
    let t = 0
    notes.forEach(([f, d]) => {
      tone(f, { at: t, dur: d * 0.9, type: 'triangle', vol: 0.1 })
      t += d
    })
  },
}
