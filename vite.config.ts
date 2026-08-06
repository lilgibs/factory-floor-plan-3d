/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        /**
         * Three.js and the React renderer around it are the bulk of this bundle
         * and never change between deploys. Split out, a one-line fix no longer
         * invalidates a megabyte of unchanged dependency in returning visitors'
         * caches.
         */
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
    // The OEE maths is plain functions over plain data, so it needs no DOM.
    include: ['src/**/*.test.ts'],
  },
})
