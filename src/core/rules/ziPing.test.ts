import { describe, it, expect } from 'vitest'
import { computeZiPing } from './ziPing'

describe('子平用神（扶抑法）', () => {
  it('锚定 2000-06-15 午时：甲木日主', () => {
    const r = computeZiPing({ year: 2000, month: 6, day: 15, hour: 12 })
    expect(r.dayMasterLabel).toBe('甲木')
    expect(r.dayMasterWuXing).toBe('木')
    // 年庚辰/月壬午/日甲辰/时庚午：午月火旺，木被泄，判身弱
    expect(r.shenQiang).toBe('弱')
    expect(r.yongShenWuXing).toEqual(['木', '水'])
    expect(r.jiShenWuXing).toEqual(['金', '火', '土'])
    expect(r.text).toContain('身弱')
  })

  it('身强弱二选一、用神非空、忌神非空', () => {
    const r = computeZiPing({ year: 1990, month: 5, day: 15, hour: 8 })
    expect(['强', '弱']).toContain(r.shenQiang)
    expect(r.yongShenWuXing.length).toBeGreaterThan(0)
    expect(r.jiShenWuXing.length).toBeGreaterThan(0)
  })
})
