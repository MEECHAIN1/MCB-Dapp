import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // ต้องมั่นใจว่ามี @types/node

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 🟢 เชื่อมโยง @/ ให้ชี้ไปที่โฟลเดอร์โปรเจกต์ (หรือ src) ตามที่ตั้งไว้ใน tsconfig
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
    // 🟢 แนะนำให้ใช้ VITE_ นำหน้าเพื่อให้ตรงกับมาตรฐานของ Vite
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY || process.env.API_KEY || ''),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // ⚠️ หากคุณยังไม่มี terser ในเครื่อง ให้ใช้ 'esbuild' แทนเพื่อไม่ให้ build พัง
    minify: 'terser', 
    chunkSizeWarningLimit: 1000,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
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
  },
});