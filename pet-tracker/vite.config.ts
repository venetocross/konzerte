import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Pfotenprotokoll',
        short_name: 'Pfotenprotokoll',
        description: 'Futter- und Ausscheidungs-Tracking für Haustiere',
        theme_color: '#e21f1f',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,png}'],
        // Never cache Firebase Storage photo URLs or API calls offline-first;
        // they must always hit network so new photos are never stale.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname.includes('firebasestorage'),
            handler: 'NetworkFirst',
            options: { cacheName: 'pet-photos' },
          },
        ],
      },
    }),
  ],
})
