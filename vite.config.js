import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages เสิร์ฟเว็บที่ /anniversary/ (ตามชื่อ repo)
  base: '/anniversary/',
  plugins: [react()],
})
