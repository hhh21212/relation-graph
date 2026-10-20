import { describe, it, expect } from 'vitest'
import { computeTrajectory } from './trajectory'
import { Person } from '../../types/person'

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

describe('关系走势', () => {
  it('从指定年起返回 6 年，每年都有干支与断语', () => {
    const t = computeTrajectory(mk({ name: '甲' }), mk({ name: '乙' }), 2026)
    expect(t.years).toHaveLength(6)
    expect(t.years[0].year).toBe(2026)
    expect(t.years[0].label).toContain('2026')
    expect(t.years.every((y) => y.note.length > 0)).toBe(true)
    expect(t.years.every((y) => ['up', 'down', 'mixed', 'flat'].includes(y.trend))).toBe(true)
  })

  it('总趋势非空', () => {
    const t = computeTrajectory(mk({ name: '甲' }), mk({ name: '乙' }), 2026)
    expect(t.summary).toBeTruthy()
  })
})
