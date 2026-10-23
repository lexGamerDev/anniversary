import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const page = (p) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  // GitHub Pages เสิร์ฟเว็บที่ /anniversary/ (ตามชื่อ repo)
  base: '/anniversary/',
  plugins: [react()],
  build: {
    rollupOptions: {
      // หลายหน้า: / = หน้าหลัก, /love/ = ครบรอบ, /birthday/ = วันเกิด
      input: {
        main: page('./index.html'),
        love: page('./love/index.html'),
        birthday: page('./birthday/index.html'),
      },
    },
  },
})
