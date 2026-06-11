import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    emptyOutDir: false, // Maintain main build files
    lib: {
      entry: path.resolve(__dirname, 'src/sdk/index.tsx'),
      name: 'ElitePlayer',
      formats: ['umd', 'es'],
      fileName: (format) => {
        if (format === 'umd') return 'sdk/elite-player.min.js';
        return `sdk/elite-player.${format}.js`;
      },
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'sdk/elite-player.min.css';
          return 'sdk/[name].[ext]';
        }
      }
    },
    sourcemap: true,
    minify: 'esbuild',
  }
});
