
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: true
  },
  define: {
    // Injects the API_KEY from the build environment (Vercel/Netlify Secrets)
    // into the bundled code as process.env.API_KEY
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || process.env.VITE_API_KEY || ''),
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: 'esbuild',
    chunkSizeWarningLimit: 1500,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
     rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules')) {
          if (id.includes('three')) return 'vendor-three';
          if (id.includes('react')) return 'vendor-react';
          if (id.includes('wagmi') || id.includes('viem')) return 'vendor-web3';
          return 'vendor-ui';
        }
      }
    }
  }
 }
}