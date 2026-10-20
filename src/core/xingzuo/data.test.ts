import { describe, it, expect } from 'vitest'
import { SIGNS, signOf, risingSign, moonSign, compatibility, pairAnalysis, pairDimensions } from './data'

describe('星座', () => {
  it('12 星座齐全', () => {
    expect(SIGNS).toHaveLength(12)
  })

  it('12 星座完整档案字段齐全', () => {
    for (const s of SIGNS) {
      expect(s.luckyNumber.length).toBeGreaterThan(0)
      expect(s.luckyColor.length).toBeGreaterThan(0)
      expect(s.luckyStone.length).toBeGreaterThan(0)
      expect(s.strength.length).toBeGreaterThan(0)
      expect(s.weakness.length).toBeGreaterThan(0)
      expect(s.love.length).toBeGreaterThan(0)
      expect(s.career.length).toBeGreaterThan(0)
      expect(s.money.length).toBeGreaterThan(0)
    }
  })

  it('太阳星座按日期划分', () => {
    expect(SIGNS[signOf(3, 21)].name).toBe('白羊座')
    expect(SIGNS[signOf(1, 1)].name).toBe('摩羯座')
    expect(SIGNS[signOf(7, 25)].name).toBe('狮子座')
    expect(SIGNS[signOf(11, 23)].name).toBe('射手座')
    expect(SIGNS[signOf(12, 21)].name).toBe('射手座')
    expect(SIGNS[signOf(12, 22)].name).toBe('摩羯座')
  })

  it('上升星座按小时简化估算', () => {
    expect(risingSign(0, 6)).toBe(0) // 清晨6点=太阳
    expect(risingSign(0, 8)).toBe(1) // 2小时后前进1
    expect(risingSign(0)).toBe(0) // 无时辰=太阳
  })

  it('月亮星座按农历日简化估算', () => {
    expect(moonSign(0, 1)).toBe(0) // 初一=太阳
    expect(moonSign(0, 6)).toBe(2) // 6天约前进2个
  })

  it('配对指数有分数与等级', () => {
    const r = compatibility(0, 0)
    expect(r.score).toBeGreaterThanOrEqual(40)
    expect(r.score).toBeLessThanOrEqual(98)
    expect(r.level).toBeTruthy()
    expect(r.text.length).toBeGreaterThan(0)
  })

  it('12×12 配对详解齐全', () => {
    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 12; j++) {
        const r = pairAnalysis(i, j)
        expect(r.score).toBeGreaterThanOrEqual(40)
        expect(r.score).toBeLessThanOrEqual(98)
        expect(r.attraction.length).toBeGreaterThan(0)
        expect(r.challenge.length).toBeGreaterThan(0)
        expect(r.advice.length).toBeGreaterThan(0)
      }
    }
  })

  it('多维配对：爱情/友情/同事分数有效、文本非空', () => {
    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 12; j++) {
        const d = pairDimensions(i, j)
        for (const item of [d.love, d.friendship, d.work]) {
          expect(item.score).toBeGreaterThanOrEqual(40)
          expect(item.score).toBeLessThanOrEqual(98)
          expect(item.level).toBeTruthy()
          expect(item.text.length).toBeGreaterThan(0)
        }
      }
    }
  })
})
