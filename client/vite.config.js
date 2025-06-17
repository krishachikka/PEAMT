import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://peamt.onrender.com',
        secure: false,
      },
    },
  },
  plugins: [react()],
  optimizeDeps: {
    exclude: ['face-api.js'],
  },
  build: {
    sourcemap: false,
  },
})
