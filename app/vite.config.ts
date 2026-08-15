import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Relative Basis, damit der Build auch unter einem Unterpfad ausgeliefert
  // werden kann (GitHub Pages, statischer Host, lokale Vorschau).
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
