import { describe, it, expect } from 'vitest'
import { computeFortune, computeYearFortune } from './fortune'
import { Person } from '../../types/person'

// 锚定：2000-06-15 午时 = 年柱庚辰（阳年）、月柱壬午
function person(over: Partial<Person> = {}): Person {
  return {
    id: 'p1',
    name: '小明',
    birthYear: 2000,
    birthMonth: 6,
    birthDay: 15,
    hour: 12,
    gender: 'male',
    relationTag: 'friend',
    createdAt: 0,
    ...over,
  }
}

describe('大运', () => {
  it('阳男顺排：第一柱是月柱壬午的下一个「癸未」', () => {
    const f = computeFortune(person({ gender: 'male' }), { nowYear: 2026 })
    expect(f.daYun).not.toBeNull()
    expect(f.daYun!.pillars.length).toBe(8)
    expect(f.daYun!.pillars[0].ganZhi).toBe('癸未')
  })

  it('阳女逆排：第一柱是月柱壬午的上一个「辛巳」', () => {
    const f = computeFortune(person({ gender: 'female' }), { nowYear: 2026 })
    expect(f.daYun!.pillars[0].ganZhi).toBe('辛巳')
  })

  it('起运岁数 > 0，起运标签非空', () => {
    const f = computeFortune(person({ gender: 'male' }), { nowYear: 2026 })
    expect(f.daYun!.startAge).toBeGreaterThan(0)
    expect(f.daYun!.startAgeLabel.length).toBeGreaterThan(0)
  })
})

describe('流年', () => {
  it('2026 流年干支 = 丙午', () => {
    const yf = computeYearFortune(person(), 2026)
    expect(yf.ganZhi).toBe('丙午')
  })

  it('冲太岁：2000 龙年生人遇 2018 狗年（辰戌冲）', () => {
    const yf = computeYearFortune(person(), 2018)
    expect(yf.fanTaiSui.hit).toBe(true)
    expect(yf.fanTaiSui.text).toContain('冲太岁')
  })

  it('本命年：2000 龙年生人遇 2012 龙年（值太岁）', () => {
    const yf = computeYearFortune(person(), 2012)
    expect(yf.fanTaiSui.text).toContain('本命年')
  })

  it('不犯太岁的年份 hit=false', () => {
    const yf = computeYearFortune(person(), 2020) // 庚子鼠，与狗不冲不害不破不刑不值
    expect(yf.fanTaiSui.hit).toBe(false)
  })
})

describe('未来几年 / 重要年份', () => {
  it('horizon 5：今年 + 未来 5 年 = 6 条', () => {
    const f = computeFortune(person(), { nowYear: 2026, horizonYears: 5 })
    expect(f.recentYears.length).toBe(6)
    expect(f.recentYears[0].year).toBe(2026)
  })

  it('horizon 3：今年 + 未来 3 年 = 4 条', () => {
    const f = computeFortune(person(), { nowYear: 2026, horizonYears: 3 })
    expect(f.recentYears.length).toBe(4)
  })

  it('重要年份：结构对（year 为数字、text 非空）', () => {
    const f = computeFortune(person(), { nowYear: 2026 })
    expect(Array.isArray(f.importantYears)).toBe(true)
    for (const it of f.importantYears) {
      expect(typeof it.year).toBe('number')
      expect(it.text.length).toBeGreaterThan(0)
    }
  })
})
