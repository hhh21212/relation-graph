import { describe, it, expect } from 'vitest'
import { retrogradeInfo } from './retrograde'

describe('星座行星逆行', () => {
  it('返回五颗行星、顺逆与白话齐备', () => {
    const r = retrogradeInfo(2000, 6, 15, 10)
    expect(r).toHaveLength(5)
    for (const x of r) {
      expect(x.name.length).toBeGreaterThan(0)
      expect(typeof x.retrograde).toBe('boolean')
      expect(x.text.length).toBeGreaterThan(0)
    }
  })

  it('同一输入结果确定', () => {
    const a = retrogradeInfo(2000, 6, 15)
    const b = retrogradeInfo(2000, 6, 15)
    expect(a.map((x) => x.retrograde)).toEqual(b.map((x) => x.retrograde))
  })
})
