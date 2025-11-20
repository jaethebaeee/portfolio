import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separate Three.js and React Three Fiber into their own chunks
          if (id.includes('three') || id.includes('@react-three')) {
            return 'three-vendor';
          }
          // Separate UI libraries
          if (id.includes('framer-motion') || id.includes('gsap') || id.includes('lucide') ||
              id.includes('@heroicons') || id.includes('@tabler')) {
            return 'ui-vendor';
          }
          // Separate utilities
          if (id.includes('zustand') || id.includes('axios') || id.includes('uuid') ||
              id.includes('date-fns') || id.includes('clsx')) {
            return 'utils-vendor';
          }
          // Separate markdown and syntax highlighting
          if (id.includes('react-markdown') || id.includes('react-syntax-highlighter') ||
              id.includes('remark-gfm')) {
            return 'markdown-vendor';
          }
          // Separate zone components for lazy loading optimization
          if (id.includes('/zones/')) {
            return 'zones-vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000kb
  },
})
