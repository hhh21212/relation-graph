import { describe, it, expect } from 'vitest'
import { elementDistribution, elementReading } from './elements'
import { chartLongitudes } from './aspects'

describe('星座四元素占比', () => {
  it('计数与星体数一致、占比合计约 100%', () => {
    const lons = chartLongitudes({ year: 2000, month: 6, day: 15, hour: 10, lat: 39.9, lng: 116.4, tz: 8 })
    const stats = elementDistribution(lons)
    expect(stats).toHaveLength(4)
    const total = stats.reduce((a, b) => a + b.count, 0)
    expect(total).toBe(Object.keys(lons).length)
    const pct = stats.reduce((a, b) => a + b.pct, 0)
    expect(pct).toBeGreaterThanOrEqual(99)
    expect(pct).toBeLessThanOrEqual(101)
  })

  it('白话解读点名最突出元素', () => {
    const lons = chartLongitudes({ year: 2000, month: 6, day: 15 })
    const stats = elementDistribution(lons)
    const r = elementReading(stats)
    expect(r.length).toBeGreaterThan(0)
    const max = stats.reduce((a, b) => (b.count > a.count ? b : a))
    expect(r).toContain(max.element)
  })
})
