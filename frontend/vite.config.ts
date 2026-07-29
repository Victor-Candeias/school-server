import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    ...(mode === 'analyze'
      ? [visualizer({
          filename: 'dist/stats.html',
          template: 'treemap',
          gzipSize: true,
          brotliSize: true,
          open: false,
        })]
      : []),
  ],

  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](?:react|react-dom|scheduler)[\\/]/,
              priority: 20,
            },
            {
              name: 'charts-vendor',
              test: /node_modules[\\/]recharts[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },

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
}))
