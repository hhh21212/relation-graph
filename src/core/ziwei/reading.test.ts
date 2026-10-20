import { describe, it, expect } from 'vitest'
import { computeZiWei, computeLiuNian } from './ziwei'
import { comprehensiveReading, dayunDetail, lifeTopics, liuNianReading, palaceReading, mingShenZhu, oppositePalaces } from './reading'

describe('紫微白话论命', () => {
  it('综合论命：输出连贯白话、涵盖命宫与四化', () => {
    const p = computeZiWei({ year: 1984, month: 2, day: 2, hour: 0 })
    const r = comprehensiveReading(p)
    expect(r.length).toBeGreaterThan(20)
    expect(r).toContain('命宫')
    expect(r).toContain('生年四化')
  })

  it('大限逐宫：12 步、起限岁数正确、当前大限唯一', () => {
    const p = computeZiWei({ year: 1984, month: 2, day: 2, hour: 0 })
    const d = dayunDetail(p)
    expect(d).toHaveLength(12)
    expect(d[0].startAge).toBe(p.ju)
    expect(d.filter((x) => x.isCurrent)).toHaveLength(1)
    for (const x of d) {
      expect(x.palaceName.length).toBeGreaterThan(0)
      expect(x.text.length).toBeGreaterThan(0)
    }
  })

  it('爱情事业财运专题：三项齐全、宫名正确', () => {
    const p = computeZiWei({ year: 1984, month: 2, day: 2, hour: 0 })
    const t = lifeTopics(p)
    expect(t).toHaveLength(3)
    expect(t.map((x) => x.key)).toEqual(['love', 'wealth', 'career'])
    for (const x of t) {
      expect(x.title.length).toBeGreaterThan(0)
      expect(x.palaceName.length).toBeGreaterThan(0)
      expect(x.text.length).toBeGreaterThan(0)
    }
  })

  it('流年逐宫：输出流年命宫与流年四化', () => {
    const p = computeZiWei({ year: 1984, month: 2, day: 2, hour: 0 })
    const ln = computeLiuNian({ year: 1984, month: 2, day: 2, hour: 0 }, 2026)
    const r = liuNianReading(p, ln)
    expect(r).toContain('丙午年')
    expect(r).toContain('流年命宫')
    expect(r).toContain('流年四化')
  })

  it('十二宫借星：返回宫名、话题与对宫', () => {
    const p = computeZiWei({ year: 1984, month: 2, day: 2, hour: 0 })
    const pr = palaceReading(p, p.mingGong)
    expect(pr.palaceName).toBe('命宫')
    expect(pr.topic.length).toBeGreaterThan(0)
    expect(pr.borrowedFrom.length).toBeGreaterThan(0)
    expect(Array.isArray(pr.mains)).toBe(true)
    expect(Array.isArray(pr.borrowed)).toBe(true)
  })

  it('命主身主：名称与白话齐全', () => {
    const p = computeZiWei({ year: 1984, month: 2, day: 2, hour: 0 })
    const m = mingShenZhu(p)
    expect(m.mingZhu.name.length).toBeGreaterThan(0)
    expect(m.shenZhu.name.length).toBeGreaterThan(0)
    expect(m.text).toContain('命主')
    expect(m.text).toContain('身主')
  })

  it('对宫关系：六组对宫、宫名与主星齐全', () => {
    const p = computeZiWei({ year: 1984, month: 2, day: 2, hour: 0 })
    const o = oppositePalaces(p)
    expect(o).toHaveLength(6)
    const names = o.map((x) => `${x.aName}↔${x.bName}`)
    expect(names).toEqual(['命宫↔迁移宫', '兄弟宫↔交友宫', '夫妻宫↔官禄宫', '子女宫↔田宅宫', '财帛宫↔福德宫', '疾厄宫↔父母宫'])
    for (const x of o) {
      expect(x.aOffset + 6).toBe(x.bOffset)
      expect(x.text.length).toBeGreaterThan(0)
      expect(Array.isArray(x.aStars)).toBe(true)
      expect(Array.isArray(x.bStars)).toBe(true)
    }
  })
})
