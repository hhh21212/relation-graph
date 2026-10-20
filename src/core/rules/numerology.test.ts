import { describe, it, expect } from 'vitest'
import { reduceDigits, lifePathNumber, birthDayNumber } from './numerology'

describe('生命灵数', () => {
  it('1990-05-15 → 30 → 3', () => {
    expect(lifePathNumber(1990, 5, 15)).toBe(3)
  })
  it('保留大师数 11', () => {
    expect(reduceDigits(29)).toBe(11) // 2+9=11，保留
  })
  it('保留大师数 22', () => {
    expect(reduceDigits(22)).toBe(22)
  })
  it('保留大师数 33', () => {
    expect(reduceDigits(33)).toBe(33)
  })
})

describe('生日数', () => {
  it('15 → 6', () => {
    expect(birthDayNumber(15)).toBe(6)
  })
  it('11 → 11（保留大师数）', () => {
    expect(birthDayNumber(11)).toBe(11)
  })
})
