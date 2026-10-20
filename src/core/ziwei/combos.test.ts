import { describe, it, expect } from 'vitest'
import { COMBOS, comboOf } from './combos'

describe('紫微双星组合', () => {
  it('24 组双星组合齐全且字段有效', () => {
    expect(Object.keys(COMBOS)).toHaveLength(24)
    for (const [k, c] of Object.entries(COMBOS)) {
      expect(k.split('|')).toHaveLength(2)
      expect(comboOf(k.split('|'))?.name).toBe(c.name) // 任意顺序都可命中
      expect(c.name.length).toBeGreaterThan(0)
      expect(c.palaces.length).toBeGreaterThan(0)
      expect(c.desc.length).toBeGreaterThan(0)
    }
  })

  it('comboOf 按任意顺序的星名都能命中', () => {
    expect(comboOf(['ziwei', 'tianfu'])?.name).toBe('紫微天府')
    expect(comboOf(['tianfu', 'ziwei'])?.name).toBe('紫微天府')
    expect(comboOf(['taiyin', 'tiantong'])?.name).toBe('天同太阴')
    expect(comboOf(['pojun', 'lianzhen'])?.name).toBe('廉贞破军')
  })

  it('单星或非双星返回 null', () => {
    expect(comboOf(['ziwei'])).toBeNull()
    expect(comboOf([])).toBeNull()
    expect(comboOf(['ziwei', 'ziwei'])).toBeNull()
  })
})
