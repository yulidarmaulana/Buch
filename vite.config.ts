import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Reading Tracker - Rak Buku',
        short_name: 'RakBuku',
        description: 'Pencatat daftar buku yang sedang dan telah selesai dibaca',
        theme_color: '#4f46e5', // Warna tema baris atas di HP (Indigo-600)
        background_color: '#f9fafb', // Warna latar belakang saat splash screen
        display: 'standalone', // Menghilangkan bilah navigasi URL browser
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Cache resource statis untuk performa loading kencang
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ]
})