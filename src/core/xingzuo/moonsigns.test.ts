import { describe, it, expect } from 'vitest'
import { MOON_SIGNS } from './moonsigns'

describe('星座月亮星座图鉴', () => {
  it('十二月亮星座、三项解读齐全', () => {
    expect(MOON_SIGNS).toHaveLength(12)
    for (const m of MOON_SIGNS) {
      expect(m.need.length).toBeGreaterThan(0)
      expect(m.security.length).toBeGreaterThan(0)
      expect(m.mood.length).toBeGreaterThan(0)
    }
  })

  it('相处提示与适配星座齐全', () => {
    for (const m of MOON_SIGNS) {
      expect(m.tip.length).toBeGreaterThan(0)
      expect(m.match.length).toBeGreaterThan(0)
    }
  })
})
