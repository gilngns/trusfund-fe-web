import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.API_TARGET_URL || 'http://localhost:3000';

  return {
    plugins: [react()],
    assetsInclude: ['**/*.lottie'],
    server: {
      proxy: {
        '/api': {
          target: target,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: target,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})
