import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import FloatingHearts from './components/FloatingHearts.jsx'
import Intro from './components/Intro.jsx'
import Moments from './components/Moments.jsx'
import Outro from './components/Outro.jsx'

export default function App() {
  const [scene, setScene] = useState('intro')

  return (
    <main className="app">
      <div className="bg-glow" />
      <FloatingHearts />
      <AnimatePresence mode="wait">
        {scene === 'intro' && <Intro key="intro" onStart={() => setScene('moments')} />}
        {scene === 'moments' && <Moments key="moments" onFinish={() => setScene('outro')} />}
        {scene === 'outro' && <Outro key="outro" onReplay={() => setScene('intro')} />}
      </AnimatePresence>
    </main>
  )
}
