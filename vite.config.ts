import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Vite 配置：React + PWA
// PWA 采用「手动确认更新」策略（registerType: 'prompt'），
// 配合 src/components/ui 里的 useRegisterSW 提示「发现新版本，点击刷新」。
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      // 使用 public/manifest.webmanifest 静态清单（由 index.html 手动链接）
      manifest: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        // 预缓存构建产物，支持离线
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,woff2}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
})
