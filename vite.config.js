import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/', // Cambiado para despliegue en Vercel
  plugins: [react()],
})
