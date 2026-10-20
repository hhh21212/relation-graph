import { describe, it, expect } from 'vitest'
import { computeDaYun, type DaYunInput } from './dayun'
import { computeBaZi } from '../rules/bazi'
import { ganZhiIndex, STEMS, BRANCHES } from '../rules/ganzhi'

const male: DaYunInput = { year: 2000, month: 6, day: 15, gender: 'male' }
const female: DaYunInput = { year: 2000, month: 6, day: 15, gender: 'female' }

describe('大运流年', () => {
  it('排 8 步大运，每步干支合法、分数在 20~95', () => {
    const r = computeDaYun(male)
    expect(r.daYun).toHaveLength(8)
    for (const s of r.daYun) {
      expect(s.name).toBe(STEMS[s.gz.stem] + BRANCHES[s.gz.branch])
      expect(s.score).toBeGreaterThanOrEqual(20)
      expect(s.score).toBeLessThanOrEqual(95)
      expect(['吉', '平', '凶']).toContain(s.level)
    }
  })

  it('阳年男顺排、女逆排；阴年男逆排、女顺排', () => {
    // 2000 庚辰年（庚=阳干，立春后出生）
    expect(computeDaYun(male).direction).toBe('顺')
    expect(computeDaYun(female).direction).toBe('逆')
    // 2005 乙酉年（乙=阴干）
    expect(computeDaYun({ year: 2005, month: 6, day: 15, gender: 'male' }).direction).toBe('逆')
    expect(computeDaYun({ year: 2005, month: 6, day: 15, gender: 'female' }).direction).toBe('顺')
  })

  it('顺排：第一步大运 = 月柱 +1，第二步 = 月柱 +2', () => {
    const r = computeDaYun(male)
    const bazi = computeBaZi({ year: 2000, month: 6, day: 15 })
    const monthIdx = ganZhiIndex(bazi.monthPillar.ganZhi.stem, bazi.monthPillar.ganZhi.branch)
    expect(ganZhiIndex(r.daYun[0].gz.stem, r.daYun[0].gz.branch)).toBe((monthIdx + 1) % 60)
    expect(ganZhiIndex(r.daYun[1].gz.stem, r.daYun[1].gz.branch)).toBe((monthIdx + 2) % 60)
  })

  it('逆排：第一步大运 = 月柱 -1', () => {
    const r = computeDaYun(female)
    const bazi = computeBaZi({ year: 2000, month: 6, day: 15 })
    const monthIdx = ganZhiIndex(bazi.monthPillar.ganZhi.stem, bazi.monthPillar.ganZhi.branch)
    expect(ganZhiIndex(r.daYun[0].gz.stem, r.daYun[0].gz.branch)).toBe((monthIdx - 1 + 60) % 60)
  })

  it('起运岁数在 0~10 岁之间，文本含「岁」', () => {
    const r = computeDaYun(male)
    expect(r.daYun[0].startAge).toBeGreaterThanOrEqual(0)
    expect(r.daYun[0].startAge).toBeLessThan(10)
    expect(r.startAgeText).toContain('岁')
  })

  it('排近 10 个流年，年份不重复且必含当年', () => {
    const r = computeDaYun(male)
    expect(r.liuNian).toHaveLength(10)
    const years = r.liuNian.map((l) => l.year)
    expect(new Set(years).size).toBe(10)
    expect(r.liuNian.some((l) => l.isCurrent)).toBe(true)
    for (const l of r.liuNian) {
      expect(l.name).toBe(STEMS[l.gz.stem] + BRANCHES[l.gz.branch])
    }
  })

  it('每步大运/流年都有白话点评文案', () => {
    const r = computeDaYun(male)
    for (const s of r.daYun) expect(s.text.length).toBeGreaterThan(0)
    for (const l of r.liuNian) expect(l.text.length).toBeGreaterThan(0)
  })
})
