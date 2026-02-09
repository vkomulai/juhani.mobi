import { defineConfig, transformWithEsbuild } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Replaces NODE_PATH=src/ — resolves bare imports from src/
function nodepathPlugin() {
  const srcDir = path.resolve(__dirname, 'src')
  return {
    name: 'vite-plugin-nodepath',
    resolveId(source, importer) {
      if (!importer || source.startsWith('.') || source.startsWith('/') || source.startsWith('\0')) {
        return null
      }
      const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '.json']
      for (const ext of extensions) {
        const candidate = path.join(srcDir, source + ext)
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          return candidate
        }
      }
      const indexExts = ['.js', '.jsx', '.ts', '.tsx']
      for (const ext of indexExts) {
        const candidate = path.join(srcDir, source, 'index' + ext)
        if (fs.existsSync(candidate)) {
          return candidate
        }
      }
      return null
    }
  }
}

export default defineConfig({
  plugins: [
    nodepathPlugin(),
    {
      name: 'treat-js-files-as-jsx',
      enforce: 'pre',
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) return null
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'transform'
        })
      }
    },
    react({
      jsxRuntime: 'classic'
    }),
    VitePWA({
      registerType: 'prompt',
      injectRegister: null,
      workbox: {
        skipWaiting: false,
        clientsClaim: false
      },
      manifest: {
        name: 'Juhani.mobi',
        short_name: 'Juhani.mobi',
        start_url: '/index.html',
        display: 'standalone',
        background_color: '#3E4EB8',
        theme_color: '#2F3BA2',
        share_target: {
          action: '/',
          params: {
            title: 'title',
            text: 'text',
            url: 'url'
          }
        },
        icons: [
          { src: 'icons/android/android-launchericon-512-512.png', sizes: '512x512' },
          { src: 'icons/android/android-launchericon-192-192.png', sizes: '192x192' },
          { src: 'icons/android/android-launchericon-144-144.png', sizes: '144x144' },
          { src: 'icons/android/android-launchericon-96-96.png', sizes: '96x96' },
          { src: 'icons/android/android-launchericon-72-72.png', sizes: '72x72' },
          { src: 'icons/android/android-launchericon-48-48.png', sizes: '48x48' }
        ]
      }
    })
  ],
  define: {
    'process.env.PUBLIC_URL': JSON.stringify(''),
    'process.envs': 'undefined'
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:4000'
    }
  },
  build: {
    outDir: 'build'
  }
})
