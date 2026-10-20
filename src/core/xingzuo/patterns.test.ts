import { describe, it, expect } from 'vitest'
import { detectAspectPatterns } from './patterns'

describe('星座相位格局', () => {
  it('无相位时不报错、返回数组', () => {
    const lons = { a: 0, b: 45, c: 100 }
    const p = detectAspectPatterns(lons)
    expect(Array.isArray(p)).toBe(true)
  })

  it('识别星群（三颗同座）', () => {
    const lons = { a: 5, b: 12, c: 20 } // 皆白羊座（0-30）
    const p = detectAspectPatterns(lons)
    expect(p.some((x) => x.name.includes('星群'))).toBe(true)
  })

  it('识别大三角', () => {
    const lons = { a: 0, b: 120, c: 240 } // 两两三分
    const p = detectAspectPatterns(lons)
    expect(p.some((x) => x.name === '大三角')).toBe(true)
  })

  it('识别 T三角', () => {
    const lons = { a: 0, b: 180, c: 90 } // a-b 对冲，c 与两者四分
    const p = detectAspectPatterns(lons)
    expect(p.some((x) => x.name === 'T三角')).toBe(true)
  })

  it('识别大十字', () => {
    const lons = { a: 0, b: 180, c: 90, d: 270 }
    const p = detectAspectPatterns(lons)
    expect(p.some((x) => x.name === '大十字')).toBe(true)
  })
})
