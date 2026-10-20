import { describe, it, expect } from 'vitest'
import { QIAN, FORTUNE_KEYS, findSign, levelKeyOf, LEVEL_KEY } from './data'

describe('求签数据（吕祖灵签 100 签）', () => {
  it('一共 100 签，id 1~100 连续', () => {
    expect(QIAN).toHaveLength(100)
    const ids = QIAN.map((x) => x.id).sort((a, b) => a - b)
    expect(ids).toEqual(Array.from({ length: 100 }, (_, i) => i + 1))
  })

  it('每条 title / poem / level / brief 非空', () => {
    for (const x of QIAN) {
      expect(x.title.trim().length).toBeGreaterThan(0)
      expect(x.poem.trim().length).toBeGreaterThan(0)
      expect(x.level.trim().length).toBeGreaterThan(0)
      expect(x.brief.trim().length).toBeGreaterThan(0)
    }
  })

  it('level 落在五档（上上/上吉/中吉/中平/下下）', () => {
    const allowed = Object.keys(LEVEL_KEY)
    for (const x of QIAN) {
      expect(allowed).toContain(x.level)
    }
  })

  it('十二项运程基本齐全（个别签缺 1 项）', () => {
    for (const x of QIAN) {
      expect(x.fortunes).toBeTruthy()
      const present = FORTUNE_KEYS.filter((k) => x.fortunes[k]).length
      expect(present).toBeGreaterThanOrEqual(11)
    }
  })

  it('findSign / levelKeyOf 正常', () => {
    expect(findSign(1)?.id).toBe(1)
    expect(findSign(100)?.id).toBe(100)
    expect(findSign(101)).toBeUndefined()
    expect(findSign(0)).toBeUndefined()
    expect(levelKeyOf('上上')).toBe('ss')
    expect(levelKeyOf('下下')).toBe('xx')
    expect(levelKeyOf('未知')).toBe('zp')
  })
})
