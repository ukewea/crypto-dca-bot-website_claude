import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base path for GitHub Pages project sites.
  // Priority:
  // 1) VITE_BASE env (explicit override)
  // 2) GITHUB_REPOSITORY repo name (auto for GitHub Actions)
  // 3) '/'
  base:
    process.env.VITE_BASE ||
    (process.env.GITHUB_REPOSITORY
      ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
      : '/'),
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          utils: ['date-fns', 'lucide-react']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
})
