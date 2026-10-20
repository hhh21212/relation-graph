import { describe, it, expect } from 'vitest'
import { ASPECTS, aspectBetween, computeAspects, chartLongitudes } from './aspects'

describe('星座行星相位', () => {
  it('五个相位定义齐全', () => {
    expect(ASPECTS).toHaveLength(5)
    for (const a of ASPECTS) {
      expect(a.name.length).toBeGreaterThan(0)
      expect(a.desc.length).toBeGreaterThan(0)
    }
  })

  it('相位判定：合/三分/对冲', () => {
    expect(aspectBetween(0, 5)?.key).toBe('conj')
    expect(aspectBetween(0, 120)?.key).toBe('trine')
    expect(aspectBetween(0, 180)?.key).toBe('opposition')
    expect(aspectBetween(0, 60)?.key).toBe('sextile')
    expect(aspectBetween(0, 90)?.key).toBe('square')
    expect(aspectBetween(0, 45)).toBeNull() // 45° 不在任何容许度内
  })

  it('整盘相位：黄经有效、结果按紧容许度排序', () => {
    const lons = chartLongitudes({ year: 2000, month: 6, day: 15, hour: 10, lat: 39.9, lng: 116.4, tz: 8 })
    expect(Object.keys(lons).length).toBeGreaterThanOrEqual(7)
    const aspects = computeAspects(lons)
    expect(aspects.length).toBeGreaterThan(0)
    for (let i = 1; i < aspects.length; i++) {
      expect(aspects[i - 1].orb).toBeLessThanOrEqual(aspects[i].orb)
    }
    for (const x of aspects) {
      expect(x.a).not.toBe(x.b)
      expect(x.orb).toBeLessThanOrEqual(x.aspect.orb)
    }
  })

  it('无时辰时不含上升点', () => {
    const lons = chartLongitudes({ year: 2000, month: 6, day: 15 })
    expect(lons['asc']).toBeUndefined()
    expect(lons['sun']).toBeGreaterThanOrEqual(0)
  })
})
