import { describe, it, expect } from 'vitest'
import { moonPhase } from './moonphase'

describe('星座出生月相', () => {
  it('八种月相之一、角度在 0–360、白话非空', () => {
    const phases = ['新月', '蛾眉月', '上弦月', '盈凸月', '满月', '亏凸月', '下弦月', '残月']
    for (const [y, m, d] of [[2000, 6, 15], [1984, 2, 2], [1999, 12, 31]] as const) {
      const p = moonPhase(y, m, d, 12)
      expect(phases).toContain(p.name)
      expect(p.angle).toBeGreaterThanOrEqual(0)
      expect(p.angle).toBeLessThan(360)
      expect(p.text.length).toBeGreaterThan(0)
    }
  })

  it('满月发生在月亮与太阳黄经相差约 180°', () => {
    // 2000-01-21 前后为满月附近，验证相对角接近 180 的相位归属不会报错
    const p = moonPhase(2000, 1, 21, 0)
    expect(['盈凸月', '满月', '亏凸月']).toContain(p.name)
  })
})
