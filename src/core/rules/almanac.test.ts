import { describe, it, expect } from 'vitest'
import { dayAlmanac, monthGrid, yearJieQi, birthInfo, taiSuiOf, daySuitable, suitableDays } from './almanac'

describe('万年历 / 黄历 dayAlmanac', () => {
  it('锚点：2026-10-06 = 农历八月廿六、日干支癸丑、冲羊、纳音桑柘木', () => {
    const d = dayAlmanac(2026, 10, 6)
    expect(d.lunar.month).toBe('八')
    expect(d.lunar.day).toBe('廿六')
    expect(d.ganZhi.day).toBe('癸丑')
    expect(d.chongShengXiao).toBe('羊')
    expect(d.naYin).toBe('桑柘木')
    expect(d.week).toBe('星期二')
  })

  it('宜/忌/吉神/凶煞/方位 都有内容', () => {
    const d = dayAlmanac(2026, 10, 6)
    expect(d.yi.length).toBeGreaterThan(0)
    expect(d.ji.length).toBeGreaterThan(0)
    expect(d.jiShen.length).toBeGreaterThan(0)
    expect(d.xiongSha.length).toBeGreaterThan(0)
    expect(d.positions.cai.length).toBeGreaterThan(0)
  })
})

describe('monthGrid', () => {
  it('2026-10 有 31 天', () => {
    expect(monthGrid(2026, 10).length).toBe(31)
  })

  it('2026-02（平年）有 28 天', () => {
    expect(monthGrid(2026, 2).length).toBe(28)
  })
})

describe('yearJieQi', () => {
  it('2026 有 24 个节气，立春在 2 月', () => {
    const j = yearJieQi(2026)
    expect(j.length).toBe(24)
    const liChun = j.find((x) => x.name === '立春')!
    expect(liChun.month).toBe(2)
  })
})

describe('birthInfo', () => {
  it('2000-06-15 → 龙、双子座、26 岁（截至 2026-10-06）', () => {
    const b = birthInfo(2000, 6, 15)
    expect(b.shengXiao).toBe('龙')
    expect(b.xingZuo).toBe('双子座')
    expect(b.age).toBe(26)
    expect(b.nayin.length).toBeGreaterThan(0)
    expect(b.lunar.length).toBeGreaterThan(0)
  })
})

describe('本命年 / 犯太岁 taiSuiOf', () => {
  it('2006 狗年生人遇 2012 龙年 = 冲太岁', () => {
    const r = taiSuiOf(10, 2012) // 10=戌(狗)
    expect(r.hit).toBe(true)
    expect(r.text).toContain('冲太岁')
  })

  it('2006 狗年生人遇 2018 狗年 = 本命年', () => {
    const r = taiSuiOf(10, 2018)
    expect(r.text).toContain('本命年')
  })

  it('不犯太岁的年份 hit=false', () => {
    const r = taiSuiOf(10, 2020) // 庚子鼠
    expect(r.hit).toBe(false)
  })
})

describe('择日 daySuitable', () => {
  it('2026-10-06 宜嫁娶 → 结婚合适', () => {
    const s = daySuitable(dayAlmanac(2026, 10, 6), 'marry')
    expect(s.ok).toBe(true)
    expect(s.matched).toContain('嫁娶')
  })

  it('suitableDays 返回的都是「宜」的日子', () => {
    const days = suitableDays(2026, 10, 'marry')
    expect(days.length).toBeGreaterThan(0)
    for (const d of days) expect(d.matched.length).toBeGreaterThan(0)
  })
})
