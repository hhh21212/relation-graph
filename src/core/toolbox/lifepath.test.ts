import { describe, it, expect } from 'vitest'
import { computeLifePath } from './lifepath'

describe('生命灵数', () => {
  it('1990-5-15 归约为 3，天赋数为 3、0', () => {
    const r = computeLifePath(1990, 5, 15)
    expect(r.lifePath).toBe(3)
    expect(r.firstSum).toBe(30)
    expect(r.talent).toEqual([3, 0])
    expect(r.isMaster).toBe(false)
    expect(r.text.length).toBeGreaterThan(0)
  })

  it('保留大师数 11', () => {
    const r = computeLifePath(2000, 1, 8) // 2+1+8=11
    expect(r.lifePath).toBe(11)
    expect(r.isMaster).toBe(true)
  })

  it('单数字生日直接归约', () => {
    expect(computeLifePath(2000, 1, 1).lifePath).toBe(4) // 2+1+1=4
  })
})
