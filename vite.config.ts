// vite.config.ts
// ============================================================================
// 🎯 Vite config — PWA + service worker
// ============================================================================
// Fixes P2 #19: real offline fallback via Workbox.
//
// Strategies:
//   - NetworkFirst on /api/v1/budgets/*       (data, freshness > offline)
//   - StaleWhileRevalidate on /api/v1/budgets (list — fast cached, refresh BG)
//   - CacheFirst on assets (fonts, images, JS chunks)
//   - NetworkOnly on /api/v1/auth/* and /api/v1/banking/* (sensitive)
// ============================================================================

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 3000,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: false, // disable SW in dev to avoid HMR conflicts
      },
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'apple-touch-icon.png',
        'icon-192.png',
        'icon-512.png',
      ],
      manifest: {
        name: 'Budget Famille',
        short_name: 'Budget Famille',
        description:
          'Application de gestion de budget familial collaborative avec synchronisation en temps réel',
        start_url: '/dashboard',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#F97316',
        orientation: 'portrait-primary',
        lang: 'fr',
        dir: 'ltr',
        categories: ['finance', 'productivity', 'lifestyle'],
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          // 🔒 Sensitive APIs — never cache
          {
            urlPattern: /\/api\/v1\/auth\//,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /\/api\/v1\/banking\//,
            handler: 'NetworkOnly',
          },
          // 📊 Budget DATA — fresh-first, fall back to cache when offline
          {
            urlPattern: /\/api\/v1\/budgets\/[^/]+\/data/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'budget-data',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // 📋 Budget LIST — cache first, revalidate in background
          {
            urlPattern: /\/api\/v1\/budgets\/?$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'budget-list',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // 🖼️ Images
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          // 🔤 Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/ws/],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: mode === 'development',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy deps for better caching
          'recharts': ['recharts'],
          'radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-dropdown-menu',
          ],
        },
      },
    },
  },
}));
