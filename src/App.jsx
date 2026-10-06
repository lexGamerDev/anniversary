import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import FloatingHearts from './components/FloatingHearts.jsx'
import Intro from './components/Intro.jsx'
import Moments from './components/Moments.jsx'
import Outro from './components/Outro.jsx'
import Movie from './components/Movie.jsx'
import { config } from './content.js'
import { probeMoment } from './utils.js'

export default function App() {
  const [scene, setScene] = useState('intro')

  // เริ่มเช็ครูปตั้งแต่หน้าแรก พอถึงหน้า Moments ตัวนับรูปจะพร้อมแล้ว
  useEffect(() => {
    config.moments.forEach(probeMoment)
    document.title = `${config.intro.title} 💖`
  }, [])

  return (
    <main className="app">
      <div className="bg-glow" />
      <FloatingHearts />
      <AnimatePresence mode="wait">
        {scene === 'intro' && <Intro key="intro" onStart={() => setScene('moments')} onMovie={() => setScene('movie')} />}
        {scene === 'moments' && <Moments key="moments" onFinish={() => setScene('outro')} />}
        {scene === 'movie' && (
          <Movie key="movie" onBack={() => setScene('intro')} onFinish={() => setScene('outro')} />
        )}
        {scene === 'outro' && <Outro key="outro" onReplay={() => setScene('intro')} />}
      </AnimatePresence>
    </main>
  )
}
