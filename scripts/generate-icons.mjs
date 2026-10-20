// 从 public/icon.svg 一次性生成全套 PWA / iOS 图标（PNG）
// 用法：npm run icons
import sharp from 'sharp'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '..', 'public')
const svg = fs.readFileSync(path.join(publicDir, 'icon.svg'))

async function main() {
  // 普通图标
  await sharp(svg).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'))
  await sharp(svg).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'))
  // iOS 添加到主屏幕图标（180）
  await sharp(svg).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'))
  // maskable：内容本就居中在 80% 安全区内，直接铺满即可适配安卓自适应图标
  await sharp(svg).resize(512, 512).png().toFile(path.join(publicDir, 'maskable-512.png'))
  // 浏览器 favicon：华为/安卓「添加到主屏幕」读的是 PNG favicon，SVG 认不好会显示成默认图标
  await sharp(svg).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32.png'))
  await sharp(svg).resize(64, 64).png().toFile(path.join(publicDir, 'favicon-64.png'))
  console.log('✔ 图标已生成：icon-192/512、maskable-512、apple-touch-icon、favicon-32/64')
}

main().catch((e) => {
  console.error('图标生成失败：', e)
  process.exit(1)
})
