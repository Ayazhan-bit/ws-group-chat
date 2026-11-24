import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages serves the project from /<repository-name>/.
// During local development the app is served from the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/ws-group-chat/' : '/',
  plugins: [react()],
  build: {
    target: 'es2022',
    sourcemap: false,
  },
}))
