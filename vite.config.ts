import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'

/**
 * Writes sw.js at build time with a list of every built file, so the installed
 * app works offline (load-shedding, car trips). Only used by `npm run build`.
 */
function offline(): Plugin {
  return {
    name: 'little-learners-offline',
    apply: 'build',
    generateBundle(_options, bundle) {
      const publicFiles = ['manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
      // Songs and background music (src/music) are big: they are kept for offline use once
      // they have played, instead of all being downloaded when the app is installed
      const music = /^assets\/(calm|bg|jingle|song)-[^/]*\.(mp3|m4a|ogg|wav)$/;
      const built = Object.keys(bundle).filter((f) => !music.test(f));
      const files = ['./', './index.html', ...publicFiles.map((f) => `./${f}`), ...built.map((f) => `./${f}`)];
      const source = readFileSync(new URL('./src/sw-template.js', import.meta.url), 'utf8')
        .replace('__FILES__', JSON.stringify(files))
        .replace('__VERSION__', Date.now().toString(36));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Relative paths, so the built app works from any folder or free host
  base: './',
  // When this version was built (shown in Grown-ups, to check a phone has the latest)
  define: { __BUILD_TIME__: JSON.stringify(new Date().toISOString()) },
  plugins: [react(), offline()],
})
