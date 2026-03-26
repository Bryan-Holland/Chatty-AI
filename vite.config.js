import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  base: '/Chatty-AI/'  // ← ADD THIS LINE (your GitHub repo name)
})