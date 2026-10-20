import { describe, it, expect } from 'vitest'
import { solarTermMs, pseudoToBeijing } from './solarTerm'

// 用权威公布的交节时刻（北京时间）做锚定，允许 ±2 分钟误差。
describe('节气（寿星公式 / lunar-javascript）', () => {
  it('2024 立春 = 2月4日 16:26', () => {
    const bj = pseudoToBeijing(solarTermMs(2024, 2))
    expect([bj.year, bj.month, bj.day]).toEqual([2024, 2, 4])
    expect(Math.abs(bj.hour * 60 + bj.minute - (16 * 60 + 26))).toBeLessThanOrEqual(2)
  })

  it('2024 惊蛰 = 3月5日 10:22', () => {
    const bj = pseudoToBeijing(solarTermMs(2024, 4))
    expect([bj.year, bj.month, bj.day]).toEqual([2024, 3, 5])
    expect(Math.abs(bj.hour * 60 + bj.minute - (10 * 60 + 22))).toBeLessThanOrEqual(2)
  })

  it('2024 清明 = 4月4日 15:02', () => {
    const bj = pseudoToBeijing(solarTermMs(2024, 6))
    expect([bj.year, bj.month, bj.day]).toEqual([2024, 4, 4])
    expect(Math.abs(bj.hour * 60 + bj.minute - (15 * 60 + 2))).toBeLessThanOrEqual(2)
  })

  it('2000 立春 = 2月4日（日期）', () => {
    const bj = pseudoToBeijing(solarTermMs(2000, 2))
    expect([bj.year, bj.month, bj.day]).toEqual([2000, 2, 4])
  })

  it('2024 冬至 = 12月21日（跨年边界取表正确）', () => {
    const bj = pseudoToBeijing(solarTermMs(2024, 23))
    expect([bj.year, bj.month, bj.day]).toEqual([2024, 12, 21])
  })
})
