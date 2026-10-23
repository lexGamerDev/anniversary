import { useCallback, useEffect, useRef, useState } from 'react'

// ฟังไมโครโฟนเพื่อจับ "เสียงเป่า" — เรียก onLevel(0–1, dt) ทุกเฟรม
// status: 'idle' | 'asking' | 'listening' | 'denied'
export function useBlow(onLevel) {
  const [status, setStatus] = useState('idle')
  const cb = useRef(onLevel)
  cb.current = onLevel
  const cleanup = useRef(() => {})

  const stop = useCallback(() => {
    cleanup.current()
    cleanup.current = () => {}
    setStatus((s) => (s === 'listening' ? 'idle' : s))
  }, [])

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) return setStatus('denied')
    setStatus('asking')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } })
      const AC = window.AudioContext || window.webkitAudioContext
      const ac = new AC()
      const src = ac.createMediaStreamSource(stream)
      const analyser = ac.createAnalyser()
      analyser.fftSize = 1024
      src.connect(analyser)
      const buf = new Uint8Array(analyser.fftSize)
      let raf = 0
      let last = performance.now()
      const loop = (now) => {
        analyser.getByteTimeDomainData(buf)
        let sum = 0
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128
          sum += v * v
        }
        const rms = Math.sqrt(sum / buf.length)
        cb.current(Math.min(1, rms * 4), (now - last) / 1000)
        last = now
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
      cleanup.current = () => {
        cancelAnimationFrame(raf)
        stream.getTracks().forEach((t) => t.stop())
        ac.close()
      }
      setStatus('listening')
    } catch {
      setStatus('denied')
    }
  }, [])

  useEffect(() => () => cleanup.current(), [])
  return { status, start, stop }
}
