import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// 单元测试配置：只针对纯逻辑的规则模块，运行在 node 环境，无需 DOM。
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
