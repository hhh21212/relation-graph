import { describe, it, expect } from 'vitest'
import { computeGroupDistribution, computeComplements } from './group'
import { Person } from '../../types/person'
import { computeBaZi } from '../rules/bazi'
import { WU_XING, STEM_WU_XING, BRANCH_WU_XING } from '../rules/fiveElement'

function person(id: string, name: string, over: Partial<Person> = {}): Person {
  return {
    id,
    name,
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

describe('一群人分布 computeGroupDistribution', () => {
  it('锚定：2000-06-15（甲木日主）→ 五行「木」、生肖「龙」、星座「双子座」', () => {
    const g = computeGroupDistribution([person('a', '小明')])
    expect(g.total).toBe(1)
    expect(g.wuXing[0].label).toBe('木')
    expect(g.zodiac[0].label).toBe('龙')
    expect(g.xingZuo[0].label).toBe('双子座')
  })

  it('各项计数之和等于总人数', () => {
    const persons = [
      person('a', '小明'),
      person('b', '小红', { birthYear: 1992, birthMonth: 8, birthDay: 20, gender: 'female' }),
      person('c', '小刚', { birthYear: 1988, birthMonth: 3, birthDay: 4 }),
    ]
    const g = computeGroupDistribution(persons)
    expect(g.total).toBe(3)
    expect(g.wuXing.reduce((s, x) => s + x.count, 0)).toBe(3)
    expect(g.zodiac.reduce((s, x) => s + x.count, 0)).toBe(3)
    expect(g.xingZuo.reduce((s, x) => s + x.count, 0)).toBe(3)
  })

  it('同一类别里能找到对应的人名', () => {
    const g = computeGroupDistribution([person('a', '小明'), person('b', '小红')])
    const mu = g.wuXing.find((x) => x.label === '木')!
    expect(mu.names).toContain('小明')
    const long = g.zodiac.find((x) => x.label === '龙')!
    expect(long.names).toContain('小明')
  })
})

describe('谁补谁 computeComplements', () => {
  function count8(p: Person) {
    const bazi = computeBaZi({
      year: p.birthYear, month: p.birthMonth, day: p.birthDay, hour: p.hour, minute: p.minute,
    })
    const c: Record<string, number> = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 }
    for (const pillar of [bazi.yearPillar, bazi.monthPillar, bazi.dayPillar, bazi.hourPillar]) {
      if (!pillar) continue
      c[STEM_WU_XING[pillar.ganZhi.stem]]++
      c[BRANCH_WU_XING[pillar.ganZhi.branch]]++
    }
    return c
  }

  it('返回的每一对都满足「from 旺（≥2）、to 缺（=0）」，且文本非空', () => {
    const persons = [
      person('a', '小明', { birthYear: 2000, birthMonth: 6, birthDay: 15, hour: 12 }),
      person('b', '小红', { birthYear: 1992, birthMonth: 8, birthDay: 20, hour: 8, gender: 'female' }),
      person('c', '小刚', { birthYear: 1988, birthMonth: 3, birthDay: 4, hour: 14 }),
      person('d', '小美', { birthYear: 2001, birthMonth: 12, birthDay: 3, hour: 6, gender: 'female' }),
    ]
    const comps = computeComplements(persons)
    for (const c of comps) {
      expect(c.text.length).toBeGreaterThan(0)
      expect(c.wuXings.length).toBeGreaterThan(0)
      const from = count8(c.from)
      const to = count8(c.to)
      for (const w of c.wuXings) {
        expect(from[w]).toBeGreaterThanOrEqual(2)
        expect(to[w]).toBe(0)
      }
    }
  })

  it('同一人不会跟自己互补', () => {
    const persons = [person('a', '小明')]
    expect(computeComplements(persons)).toEqual([])
  })
})
