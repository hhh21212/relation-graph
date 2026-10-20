import { describe, it, expect } from 'vitest'
import { chartReport } from './report'

describe('星座综合报告', () => {
  it('标题与段落齐全', () => {
    const r = chartReport({ year: 2000, month: 6, day: 15, hour: 10, lat: 39.9, lng: 116.4, tz: 8 })
    expect(r.title.length).toBeGreaterThan(0)
    expect(r.paragraphs.length).toBeGreaterThanOrEqual(3)
    for (const p of r.paragraphs) {
      expect(p.length).toBeGreaterThan(0)
    }
  })

  it('无时辰时仍能生成报告', () => {
    const r = chartReport({ year: 2000, month: 6, day: 15 })
    expect(r.paragraphs.length).toBeGreaterThanOrEqual(3)
  })
})
