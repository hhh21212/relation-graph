import { describe, it, expect } from 'vitest'
import {
  TAROT_CARDS,
  SPREADS,
  getSpread,
  shuffle,
  draw,
  summarize,
  SUIT_ZH,
} from './data'

describe('塔罗数据', () => {
  it('共 78 张牌：22 大阿卡纳 + 4 花色各 14 张', () => {
    expect(TAROT_CARDS).toHaveLength(78)
    expect(TAROT_CARDS.filter((c) => c.suit === 'major')).toHaveLength(22)
    for (const suit of ['wands', 'cups', 'swords', 'pentacles'] as const) {
      expect(TAROT_CARDS.filter((c) => c.suit === suit)).toHaveLength(14)
    }
  })

  it('每张牌都有名称、关键词、正逆位解读（至少 2 句）', () => {
    for (const c of TAROT_CARDS) {
      expect(c.nameZh.length).toBeGreaterThan(0)
      expect(c.nameEn.length).toBeGreaterThan(0)
      expect(c.keywords.length).toBeGreaterThanOrEqual(2)
      expect(c.upright.length).toBeGreaterThanOrEqual(2)
      expect(c.reversed.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('牌名含花色前缀（小阿卡纳）', () => {
    const wands = TAROT_CARDS.find((c) => c.suit === 'wands' && c.num === 1)!
    expect(wands.nameZh).toBe('权杖一')
    expect(wands.nameEn).toBe('Ace of Wands')
    const queen = TAROT_CARDS.find((c) => c.suit === 'cups' && c.num === 13)!
    expect(queen.nameZh).toBe('圣杯王后')
    expect(queen.nameEn).toBe('Queen of Cups')
  })

  it('大阿卡纳 0~21 齐全且名称正确', () => {
    expect(TAROT_CARDS[0].nameZh).toBe('愚人')
    expect(TAROT_CARDS[21].nameZh).toBe('世界')
  })

  it('5 个牌阵，凯尔特十字有 10 个位置', () => {
    expect(SPREADS).toHaveLength(5)
    const celtic = getSpread('celtic')
    expect(celtic.positions).toHaveLength(10)
    expect(getSpread('daily').positions).toHaveLength(1)
    expect(getSpread('three').positions).toHaveLength(3)
    expect(getSpread('love').positions).toHaveLength(5)
    expect(getSpread('career').positions).toHaveLength(5)
  })

  it('洗牌返回 78 个不重复序号', () => {
    const idx = shuffle()
    expect(idx).toHaveLength(78)
    expect(new Set(idx).size).toBe(78)
  })

  it('抽牌返回指定数量，且正逆位为布尔值', () => {
    const idx = shuffle()
    const drawn = draw(idx, 3)
    expect(drawn).toHaveLength(3)
    for (const d of drawn) {
      expect(typeof d.reversed).toBe('boolean')
      expect(SUIT_ZH[d.card.suit]).toBeTruthy()
    }
  })

  it('总结文案非空', () => {
    const idx = shuffle()
    expect(summarize(draw(idx, 10)).length).toBeGreaterThan(0)
  })
})
