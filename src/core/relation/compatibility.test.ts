import { describe, it, expect } from 'vitest'
import { computeCompatibility, pairType } from './compatibility'
import { Person } from '../../types/person'
import { Relation } from '../../types/relation'

const mk = (p: Partial<Person>): Person => ({
  id: 'x',
  name: 'X',
  birthYear: 1990,
  birthMonth: 5,
  birthDay: 15,
  gender: 'male',
  relationTag: 'other',
  createdAt: 0,
  ...p,
})

describe('合盘综合', () => {
  it('返回 5 个体系 + 总评 + 建议', () => {
    const r = computeCompatibility(mk({ name: '甲' }), mk({ name: '乙' }))
    expect(r.sections).toHaveLength(5)
    expect(r.overallScore).toBeGreaterThanOrEqual(5)
    expect(r.overallScore).toBeLessThanOrEqual(95)
    expect(r.advice.fit).toBeTruthy()
    expect(r.advice.caution).toBeTruthy()
    expect(r.advice.how).toBeTruthy()
  })

  it('生肖六合比六冲分数高', () => {
    // 子鼠(1960/1972…) 与 丑牛(1961/1973…) 为六合；子鼠与午马(1966/1978)为六冲
    const rat = mk({ name: '鼠', birthYear: 1972, birthMonth: 6, birthDay: 1 })
    const ox = mk({ name: '牛', birthYear: 1973, birthMonth: 6, birthDay: 1 })
    const horse = mk({ name: '马', birthYear: 1978, birthMonth: 6, birthDay: 1 })
    const he = computeCompatibility(rat, ox).sections.find((s) => s.system === 'zodiac')!.score
    const chong = computeCompatibility(rat, horse).sections.find((s) => s.system === 'zodiac')!.score
    expect(he).toBeGreaterThan(chong)
  })

  it('缺时辰时标注缺失说明', () => {
    const a = mk({ name: '甲' })
    const b = mk({ name: '乙', hour: 8 })
    const r = computeCompatibility(a, b)
    expect(r.missingNotes.some((n) => n.includes('缺时辰'))).toBe(true)
  })

  it('关系发展模式（非伴侣）带走势、不带婚恋词', () => {
    const r = computeCompatibility(mk({ name: '甲' }), mk({ name: '乙' }), 'guanxi')
    expect(r.mode).toBe('guanxi')
    expect(r.trajectory).toBeTruthy()
    expect(r.trajectory!.years.length).toBe(6)
    expect(r.headline).not.toContain('一对')
  })
})

describe('关系类型判定', () => {
  it('有夫妻边 → 合盘', () => {
    const a = mk({ id: 'a' })
    const b = mk({ id: 'b' })
    const rel: Relation = { id: 'r', a: 'a', b: 'b', tag: 'spouse' }
    expect(pairType(a, b, [rel])).toBe('hepan')
  })

  it('无夫妻边 → 关系发展', () => {
    expect(pairType(mk({ id: 'a' }), mk({ id: 'b' }), [])).toBe('guanxi')
  })

  it('一方是我、另一方是伴侣 → 合盘', () => {
    const me = mk({ id: 'me', isSelf: true })
    const partner = mk({ id: 'p', relationTag: 'partner' })
    expect(pairType(me, partner, [])).toBe('hepan')
  })
})
