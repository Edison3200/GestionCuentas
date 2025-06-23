import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/GestionCuentas/', // 👈 debe coincidir 100% con el nombre del repo
  plugins: [react()],
})
