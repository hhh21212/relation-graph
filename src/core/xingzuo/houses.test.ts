import { describe, it, expect } from 'vitest'
import { HOUSES, houseOf, housePlacements } from './houses'

describe('星座十二宫位', () => {
  it('十二宫齐全、序号连续', () => {
    expect(HOUSES).toHaveLength(12)
    HOUSES.forEach((h, i) => {
      expect(h.index).toBe(i + 1)
      expect(h.name.length).toBeGreaterThan(0)
      expect(h.desc.length).toBeGreaterThan(0)
    })
  })

  it('宫位计算：上升点即第 1 宫，每宫 30°', () => {
    expect(houseOf(10, 10)).toBe(1) // 本点 = 1 宫
    expect(houseOf(20, 10)).toBe(1) // 顺行 10° 仍在 1 宫
    expect(houseOf(40, 10)).toBe(2) // 顺行 30° 进入 2 宫
    expect(houseOf(200, 10)).toBe(7) // 顺行 190° → 7 宫
    expect(houseOf(350, 10)).toBe(12) // 逆行 -20° 落在 12 宫
  })

  it('落宫列表：不含上升点、按宫位升序', () => {
    const lons = { sun: 100, moon: 40, venus: 200, asc: 10 }
    const ph = housePlacements(lons, 10)
    expect(ph.map((x) => x.key)).not.toContain('asc')
    expect(ph.map((x) => x.house)).toEqual([2, 4, 7])
    for (let i = 1; i < ph.length; i++) {
      expect(ph[i - 1].house).toBeLessThanOrEqual(ph[i].house)
    }
  })
})
