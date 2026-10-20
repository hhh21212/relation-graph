import { describe, it, expect } from 'vitest'
import { dailyFortune, weeklyFortune, monthlyFortune, yearlyFortune } from './fortune'

describe('星座运势', () => {
  it('每日运势确定且字段有效', () => {
    const a = dailyFortune(0, '2026-10-07')
    const b = dailyFortune(0, '2026-10-07')
    expect(a).toEqual(b)
    for (const item of [a.overall, a.love, a.career, a.money, a.health]) {
      expect(item.stars).toBeGreaterThanOrEqual(1)
      expect(item.stars).toBeLessThanOrEqual(5)
      expect(item.text.length).toBeGreaterThan(0)
    }
    expect(a.luckySign).toBeGreaterThanOrEqual(0)
    expect(a.luckySign).toBeLessThan(12)
  })

  it('标题随日期与星座变化', () => {
    expect(dailyFortune(0, '2026-10-07').title).toContain('2026-10-07')
    expect(dailyFortune(0, '2026-10-08').title).toContain('2026-10-08')
    expect(dailyFortune(5, '2026-10-07').title).toContain('处女座')
  })

  it('每周运势标题含「本周」', () => {
    expect(weeklyFortune(3, '10.5–10.11').title).toContain('本周')
  })

  it('每月运势确定且标题含「本月」', () => {
    const a = monthlyFortune(4, '2026-10')
    const b = monthlyFortune(4, '2026-10')
    expect(a).toEqual(b)
    expect(a.title).toContain('本月')
    expect(a.health.text.length).toBeGreaterThan(0)
  })

  it('年度运势确定、含关键词与说明', () => {
    const a = yearlyFortune(7, '2026')
    const b = yearlyFortune(7, '2026')
    expect(a).toEqual(b)
    expect(a.title).toContain('年度')
    expect(a.keyword!.length).toBeGreaterThan(0)
    expect(a.keywordDesc!.length).toBeGreaterThan(0)
  })
})
