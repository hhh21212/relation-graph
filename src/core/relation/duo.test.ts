import { describe, it, expect } from 'vitest'
import { computeDuo } from './duo'
import { Person } from '../../types/person'

function person(id: string, name: string, over: Partial<Person> = {}): Person {
  return {
    id,
    name,
    birthYear: 1990,
    birthMonth: 6,
    birthDay: 15,
    hour: 8,
    gender: 'male',
    relationTag: 'friend',
    createdAt: 0,
    ...over,
  }
}

describe('看两个人增强 computeDuo', () => {
  it('谁旺谁 / 一起做什么 / 相处模式 都非空', () => {
    const a = person('a', '甲', { birthYear: 1988, birthMonth: 3, birthDay: 4 })
    const b = person('b', '乙', { birthYear: 1992, birthMonth: 8, birthDay: 20 })
    const d = computeDuo(a, b)
    expect(d.wangKe.length).toBeGreaterThan(0)
    expect(d.together.good.length).toBeGreaterThan(0)
    expect(d.together.avoid.length).toBeGreaterThan(0)
    expect(d.dynamic.length).toBeGreaterThan(0)
  })

  it('伴侣模式与关系模式都可出结果', () => {
    const a = person('a', '甲')
    const b = person('b', '乙')
    expect(computeDuo(a, b, 'hepan').wangKe.length).toBeGreaterThan(0)
    expect(computeDuo(a, b, 'guanxi').dynamic.length).toBeGreaterThan(0)
  })

  it('同一个人自比：日主同气，出「同是」提示', () => {
    const a = person('a', '甲')
    const d = computeDuo(a, a)
    expect(d.wangKe).toContain('同')
  })
})
