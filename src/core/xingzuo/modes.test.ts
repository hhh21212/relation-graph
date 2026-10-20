import { describe, it, expect } from 'vitest'
import { modeDistribution, modeReading } from './modes'

describe('星座星盘模式', () => {
  it('三态计数与占比', () => {
    const lons = { a: 5, b: 35, c: 65, d: 95 } // 白羊(本位) 金牛(固定) 双子(变动) 巨蟹(本位)
    const stats = modeDistribution(lons)
    expect(stats).toHaveLength(3)
    expect(stats.map((s) => s.count)).toEqual([2, 1, 1])
    const pct = stats.reduce((a, b) => a + b.pct, 0)
    expect(pct).toBeGreaterThanOrEqual(99)
    expect(pct).toBeLessThanOrEqual(101)
  })

  it('白话解读点名主导模式', () => {
    const lons = { a: 5, b: 35, c: 65, d: 95 }
    const stats = modeDistribution(lons)
    const r = modeReading(stats)
    expect(r).toContain('本位')
  })
})
