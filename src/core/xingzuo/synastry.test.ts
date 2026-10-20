import { describe, it, expect } from 'vitest'
import { placementsOf, synastry, synastryAspects, synastrySummary, synastryExtras } from './synastry'

describe('星座两人合盘', () => {
  it('出生信息 → 五大落座有效', () => {
    const p = placementsOf({ year: 1995, month: 6, day: 15, hour: 10, lat: 39.9, lng: 116.4, tz: 8 })
    for (const v of [p.sun, p.moon, p.rising, p.venus, p.mars]) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(12)
    }
  })

  it('未填时辰时上升回退为太阳星座', () => {
    const p = placementsOf({ year: 1995, month: 6, day: 15 })
    expect(p.rising).toBe(p.sun)
  })

  it('合盘得分与五项相位有效', () => {
    const a = placementsOf({ year: 1995, month: 6, day: 15 })
    const b = placementsOf({ year: 1996, month: 1, day: 20 })
    const r = synastry(a, b)
    expect(r.score).toBeGreaterThanOrEqual(0)
    expect(r.score).toBeLessThanOrEqual(100)
    expect(r.aspects).toHaveLength(5)
    expect(r.level.length).toBeGreaterThan(0)
    expect(r.summary.length).toBeGreaterThan(0)
    for (const x of r.aspects) {
      expect(x.title.length).toBeGreaterThan(0)
      expect(x.text.length).toBeGreaterThan(0)
    }
  })

  it('五项全同座时满分（天生一对）', () => {
    const p = { sun: 0, moon: 0, rising: 0, venus: 0, mars: 0 }
    const r = synastry(p, p)
    expect(r.score).toBe(100)
    expect(r.level).toBe('天生一对')
  })

  it('合盘相位：跨盘相位带白话解读', () => {
    const a = { year: 1995, month: 6, day: 15, hour: 10, lat: 39.9, lng: 116.4, tz: 8 }
    const b = { year: 1996, month: 1, day: 20, hour: 12, lat: 39.9, lng: 116.4, tz: 8 }
    const xs = synastryAspects(a, b)
    expect(xs.length).toBeGreaterThan(0)
    for (const x of xs) {
      expect(x.a.length).toBeGreaterThan(0)
      expect(x.b.length).toBeGreaterThan(0)
      expect(x.orb).toBeLessThanOrEqual(x.aspect.orb)
      expect(x.text).toContain('与 TA')
    }
  })

  it('相处模式总评返回非空标题与正文', () => {
    const a = placementsOf({ year: 1995, month: 6, day: 15 })
    const b = placementsOf({ year: 1996, month: 1, day: 20 })
    const s = synastrySummary(a, b)
    expect(s.heading.length).toBeGreaterThan(0)
    expect(s.text.length).toBeGreaterThan(0)
  })

  it('三星深度解读三块齐全、分数有效', () => {
    const a = placementsOf({ year: 1995, month: 6, day: 15 })
    const b = placementsOf({ year: 1996, month: 1, day: 20 })
    const e = synastryExtras(a, b)
    for (const x of [e.moonMoon, e.venusMars, e.marsMars]) {
      expect(x.title.length).toBeGreaterThan(0)
      expect(x.score).toBeGreaterThanOrEqual(40)
      expect(x.score).toBeLessThanOrEqual(100)
      expect(x.text.length).toBeGreaterThan(0)
    }
  })
})
