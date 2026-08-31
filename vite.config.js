import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel 静态托管：构建产物 dist/ 由 vercel.json 的 buildCommand/outputDirectory 指定
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
