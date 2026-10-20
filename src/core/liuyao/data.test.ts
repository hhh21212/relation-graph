import { describe, it, expect } from 'vitest'
import { TRIGRAMS, HEXAGRAMS, hexagramFromLines, interpret, tossOnce, yinYang, type YaoValue } from './data'

describe('六爻数据', () => {
  it('八卦齐全（8 个）', () => {
    expect(TRIGRAMS).toHaveLength(8)
  })

  it('六十四卦齐全且无重复组合', () => {
    expect(HEXAGRAMS).toHaveLength(64)
    const combos = new Set(HEXAGRAMS.map((h) => h.upper * 8 + h.lower))
    expect(combos.size).toBe(64)
  })

  it('每卦都有卦名与白话卦辞', () => {
    for (const h of HEXAGRAMS) {
      expect(h.name.length).toBeGreaterThan(0)
      expect(h.yi.length).toBeGreaterThan(0)
    }
  })

  it('由纯阳/纯阴取卦：乾为天 / 坤为地', () => {
    expect(hexagramFromLines([1, 1, 1, 1, 1, 1]).name).toBe('乾为天')
    expect(hexagramFromLines([0, 0, 0, 0, 0, 0]).name).toBe('坤为地')
  })

  it('由六爻取卦：水雷屯（坎上震下）', () => {
    // 震=[1,0,0] 在下，坎=[0,1,0] 在上 → [1,0,0,0,1,0]
    expect(hexagramFromLines([1, 0, 0, 0, 1, 0]).name).toBe('水雷屯')
  })

  it('摇一次结果必为 6/7/8/9', () => {
    for (let i = 0; i < 200; i++) {
      expect([6, 7, 8, 9]).toContain(tossOnce())
    }
  })

  it('阴阳映射：7/9 为阳，6/8 为阴', () => {
    expect(yinYang(7)).toBe(1)
    expect(yinYang(9)).toBe(1)
    expect(yinYang(6)).toBe(0)
    expect(yinYang(8)).toBe(0)
  })

  it('全静爻（少阳）无变卦', () => {
    const r = interpret([7, 7, 7, 7, 7, 7] as YaoValue[])
    expect(r.ben.name).toBe('乾为天')
    expect(r.moving).toHaveLength(0)
    expect(r.bian).toBeNull()
  })

  it('全老阳动爻：本卦乾为天 → 变卦坤为地', () => {
    const r = interpret([9, 9, 9, 9, 9, 9] as YaoValue[])
    expect(r.ben.name).toBe('乾为天')
    expect(r.moving).toEqual([0, 1, 2, 3, 4, 5])
    expect(r.bian?.name).toBe('坤为地')
  })

  it('老阴动爻变为阳', () => {
    // 初爻老阴(6) + 其余少阳(7)：本卦初爻为阴
    const r = interpret([6, 7, 7, 7, 7, 7] as YaoValue[])
    expect(r.moving).toEqual([0])
    expect(r.bian).not.toBeNull()
  })
})
