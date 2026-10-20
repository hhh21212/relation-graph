import { describe, it, expect } from 'vitest'
import { computeGeJu } from './geju'

const KNOWN_GEJU = new Set([
  '建禄格', '羊刃格', '食神格', '伤官格', '偏财格', '正财格',
  '七杀格', '正官格', '偏印格', '正印格', '从强格', '从弱格',
])

describe('八字格局', () => {
  it('返回已知格局名 + 白话', () => {
    const g = computeGeJu({ year: 2000, month: 6, day: 15, hour: 8 })
    expect(KNOWN_GEJU.has(g.name)).toBe(true)
    expect(g.text.length).toBeGreaterThan(0)
  })

  it('月令本气是单个天干，十神合法', () => {
    const g = computeGeJu({ year: 1995, month: 3, day: 3, hour: 12 })
    expect(['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']).toContain(g.benQi)
    expect([
      '比肩', '劫财', '食神', '伤官', '偏财', '正财',
      '七杀', '正官', '偏印', '正印',
    ]).toContain(g.benQiShiShen)
  })

  it('同一输入结果确定', () => {
    const input = { year: 1988, month: 11, day: 20, hour: 3 }
    expect(computeGeJu(input)).toEqual(computeGeJu(input))
  })

  it('非从格时 cong 为 false，从格时 name 为从强/从弱', () => {
    for (const input of [
      { year: 2000, month: 1, day: 1 },
      { year: 1990, month: 7, day: 7 },
      { year: 1978, month: 12, day: 25 },
    ]) {
      const g = computeGeJu(input)
      if (!g.cong) expect(g.name).not.toMatch(/^从/)
      else expect(['从强格', '从弱格']).toContain(g.name)
    }
  })
})
