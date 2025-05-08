import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5100,
    strictPort: true,
    allowedHosts: ['repont.danvir.hu'],
    open: false,
  },
  clearScreen: false,
})
