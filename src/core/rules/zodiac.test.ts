import { describe, it, expect } from 'vitest'
import { zodiacOf, zodiacRelations } from './zodiac'

describe('生肖', () => {
  it('地支转生肖', () => {
    expect(zodiacOf(0)).toBe('鼠')
    expect(zodiacOf(4)).toBe('龙')
    expect(zodiacOf(11)).toBe('猪')
  })
})

describe('生肖关系', () => {
  it('六合：子丑、寅亥', () => {
    expect(zodiacRelations(0, 1)).toContain('六合')
    expect(zodiacRelations(2, 11)).toContain('六合')
  })
  it('三合：申子、寅戌', () => {
    expect(zodiacRelations(8, 0)).toContain('三合')
    expect(zodiacRelations(2, 10)).toContain('三合')
  })
  it('六冲：子午', () => {
    expect(zodiacRelations(0, 6)).toContain('六冲')
  })
  it('相害：子未、卯辰', () => {
    expect(zodiacRelations(0, 7)).toContain('相害')
    expect(zodiacRelations(3, 4)).toContain('相害')
  })
  it('无关系返回空数组', () => {
    expect(zodiacRelations(0, 3)).toEqual([]) // 子卯 无合冲害
  })
})
