import { describe, it, expect } from 'vitest'
import { shenShaMeaning, computeGanZhiRel } from './relation'
import type { BaZiResult, Pillar } from '../rules/bazi'
import type { WuXing } from '../rules/fiveElement'

function pillar(stem: number, branch: number, name = ''): Pillar {
  return { ganZhi: { stem, branch }, name, nayin: '', nayinWuXing: '土' as WuXing }
}

function bazi(year: Pillar, month: Pillar, day: Pillar, hour: Pillar | null): BaZiResult {
  return {
    hasHour: hour !== null,
    yearPillar: year,
    monthPillar: month,
    dayPillar: day,
    hourPillar: hour,
    fiveElements: { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 },
    zodiac: year.ganZhi.branch,
  }
}

describe('神煞白话', () => {
  it('空数组返回空', () => {
    expect(shenShaMeaning([])).toEqual([])
  })

  it('已知神煞给出白话', () => {
    const r = shenShaMeaning(['天乙贵人'])
    expect(r[0].name).toBe('天乙贵人')
    expect(r[0].text.length).toBeGreaterThan(0)
  })

  it('去掉年支/日支/年干/日干前缀', () => {
    const r = shenShaMeaning(['年支天乙贵人', '日干文昌'])
    expect(r.map((x) => x.name)).toEqual(['天乙贵人', '文昌'])
  })

  it('未知神煞给兜底白话', () => {
    const r = shenShaMeaning(['某神煞'])
    expect(r[0].name).toBe('某神煞')
    expect(r[0].text.length).toBeGreaterThan(0)
  })
})

describe('四柱合冲刑害', () => {
  it('甲己天干五合 + 子丑地支六合', () => {
    const rel = computeGanZhiRel(
      bazi(pillar(0, 0, '甲子'), pillar(5, 1, '己丑'), pillar(2, 2, '丙寅'), null),
    )
    const kinds = rel.map((r) => r.kind)
    expect(kinds).toContain('天干五合')
    expect(kinds).toContain('地支六合')
  })

  it('子午六冲', () => {
    const rel = computeGanZhiRel(
      bazi(pillar(0, 0, '甲子'), pillar(4, 6, '戊午'), pillar(2, 2, '丙寅'), null),
    )
    expect(rel.map((r) => r.kind)).toContain('地支六冲')
  })

  it('每条都带 kind/a/b/text', () => {
    const rel = computeGanZhiRel(
      bazi(pillar(0, 0, '甲子'), pillar(5, 1, '己丑'), pillar(2, 6, '丙午'), pillar(3, 2, '丁寅')),
    )
    for (const r of rel) {
      expect(['天干五合', '地支六合', '地支三合', '地支六冲', '地支相害']).toContain(r.kind)
      expect(r.a.length).toBeGreaterThan(0)
      expect(r.b.length).toBeGreaterThan(0)
      expect(r.text.length).toBeGreaterThan(0)
    }
  })
})
