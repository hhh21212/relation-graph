import { describe, it, expect } from 'vitest'
import { jdFromDate, sunLongitude, moonLongitude, ascendant, signIndexFromLon, planetLongitude } from './astro'

describe('天文黄经', () => {
  it('太阳黄经在 J2000 纪元 ≈ 280°', () => {
    expect(Math.abs(sunLongitude(2451545.0) - 280)).toBeLessThan(0.5)
  })

  it('太阳黄经落在正确星座', () => {
    expect(signIndexFromLon(sunLongitude(jdFromDate(2000, 3, 25, 12)))).toBe(0) // 白羊
    expect(signIndexFromLon(sunLongitude(jdFromDate(2000, 7, 10, 12)))).toBe(3) // 巨蟹
    expect(signIndexFromLon(sunLongitude(jdFromDate(2000, 1, 10, 12)))).toBe(9) // 摩羯
  })

  it('月亮黄经落在有效范围', () => {
    const lon = moonLongitude(jdFromDate(2000, 6, 15, 0))
    expect(lon).toBeGreaterThanOrEqual(0)
    expect(lon).toBeLessThan(360)
  })

  it('上升点黄经有效，且随小时变化', () => {
    const jd0 = jdFromDate(2000, 6, 15, 0)
    const a0 = ascendant(jd0, 39.9, 116.4)
    const a2 = ascendant(jd0 + 2 / 24, 39.9, 116.4)
    expect(a0).toBeGreaterThanOrEqual(0)
    expect(a0).toBeLessThan(360)
    expect(a2).not.toBe(a0)
  })

  it('行星黄经落在有效范围', () => {
    for (const key of ['mercury', 'venus', 'mars', 'jupiter', 'saturn'] as const) {
      const lon = planetLongitude(jdFromDate(2000, 6, 15, 0), key)
      expect(lon).toBeGreaterThanOrEqual(0)
      expect(lon).toBeLessThan(360)
    }
  })

  it('水星金星在地心视角不超过与太阳的最大距角', () => {
    const jd = jdFromDate(2026, 10, 7, 12)
    const s = sunLongitude(jd)
    const elong = (lon: number) => {
      const d = Math.abs(((lon - s) % 360 + 360) % 360)
      return Math.min(d, 360 - d)
    }
    expect(elong(planetLongitude(jd, 'mercury'))).toBeLessThan(30)
    expect(elong(planetLongitude(jd, 'venus'))).toBeLessThan(48)
  })
})
