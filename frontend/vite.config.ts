import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',

    // Necessário para aceitar o hostname trycloudflare.com
    allowedHosts: true,

    proxy: {
      '/auth-api': {
        target: 'http://127.0.0.1:8010',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/auth-api/, '')
      },

      '/school-api': {
        target: 'http://127.0.0.1:8020',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/school-api/, '')
      },

      '/db-api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/db-api/, '')
      }
    }
  }
})
