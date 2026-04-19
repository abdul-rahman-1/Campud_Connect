import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8338',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        onError(err, req, res) {
          res.writeHead(503, {
            'Content-Type': 'application/json'
          });
          res.end(JSON.stringify({
            success: false,
            error: 'Flask API Server (port 8338) is not running. Start it with: python server.py'
          }));
        }
      },
      '/admin': {
        target: 'http://127.0.0.1:8338',
        changeOrigin: true,
        onError(err, req, res) {
          res.writeHead(503, {
            'Content-Type': 'application/json'
          });
          res.end(JSON.stringify({
            success: false,
            error: 'Flask API Server (port 8338) is not running. Start it with: python server.py'
          }));
        }
      },
    },
  },
})
