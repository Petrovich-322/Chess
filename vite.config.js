import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    server: {
      proxy: {
        '/api': 'http://localhost:3000', 
      },
      host: true, 
      port: 5173,
      strictPort: true,
      allowedHosts: ['nondisputatiously-tetched-kimber.ngrok-free.dev'],
    },
    base: '/',
    plugins: [react()],
    build: {
    outDir: 'prod/public',
  },
})
