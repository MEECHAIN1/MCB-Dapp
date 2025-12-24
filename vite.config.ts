import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // เชื่อมโยง @/ ให้ชี้ไปที่ Root ตาม tsconfig
      '@': path.resolve(__dirname, './'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: true
  },
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY || process.env.API_KEY || ''),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // ใช้ esbuild แทน terser เพื่อความเร็วและไม่ต้องติดตั้ง dependency เพิ่ม
    minify: 'esbuild', 
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-web3': ['wagmi', 'viem', '@wagmi/core', '@tanstack/react-query'],
          'vendor-ui': ['framer-motion', 'lucide-react', 'canvas-confetti'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei']
        }
      }
    }
  }
});
