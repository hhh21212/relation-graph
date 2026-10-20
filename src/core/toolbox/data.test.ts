import { describe, it, expect } from 'vitest'
import { totalStrokes, charStrokes, hasUnknownChar } from './strokes'
import { SHU_LI, shuLiOf, wuxingOf } from './shuli'
import { computeChengGu } from './chenggu'
import { DREAMS, searchDreams } from './dreams'
import { computeWuGe } from './name'
import { computeNumber } from './number'
import { computeSanShi, branchOfYear } from './sanshi'
import { computeCeZi } from './cezi'
import { computeZhuGe } from './zhuge'
import { MOLES, molesByRegion } from './moles'

describe('百宝箱数据', () => {
  it('笔画表：已知字取对笔画，未知汉字估算为 10', () => {
    expect(charStrokes('王')).toBe(4)
    expect(charStrokes('一')).toBe(1)
    expect(totalStrokes('王小明')).toBe(4 + 3 + 8)
    expect(charStrokes('龘')).toBe(10) // 未收录汉字
    expect(hasUnknownChar('龘')).toBe(true)
    expect(hasUnknownChar('王小明')).toBe(false)
  })

  it('81 数理齐全，五行按尾数取', () => {
    expect(SHU_LI).toHaveLength(81)
    expect(shuLiOf(1).ji).toBe('大吉')
    expect(shuLiOf(2).ji).toBe('凶')
    expect(wuxingOf(1)).toBe('木')
    expect(wuxingOf(8)).toBe('金')
    expect(wuxingOf(9)).toBe('水')
  })

  it('称骨：结果含两钱与评语', () => {
    const r = computeChengGu(2000, 6, 15)
    expect(r.totalQian).toBeGreaterThan(0)
    expect(r.liang).toBeGreaterThanOrEqual(2)
    expect(r.text.length).toBeGreaterThan(0)
  })

  it('周公解梦：有词库且能搜索', () => {
    expect(DREAMS.length).toBeGreaterThan(30)
    expect(searchDreams('掉牙').length).toBeGreaterThan(0)
    expect(searchDreams('蛇').some((d) => d.title.includes('蛇'))).toBe(true)
    expect(searchDreams('')).toHaveLength(0)
  })

  it('姓名五格：输出五格', () => {
    const r = computeWuGe('王', '小明')
    expect(r.ges).toHaveLength(5)
    expect(r.ges.map((g) => g.name)).toEqual(['天格', '人格', '地格', '外格', '总格'])
    expect(r.level).toBeTruthy()
  })

  it('号码吉凶：有结果、空输入返回 null', () => {
    expect(computeNumber('')).toBeNull()
    const r = computeNumber('13800138000')
    expect(r).not.toBeNull()
    expect(r!.liShu).toBeGreaterThanOrEqual(1)
    expect(r!.liShu).toBeLessThanOrEqual(80)
    expect(r!.score).toBeGreaterThanOrEqual(0)
  })

  it('三世姻缘：六合为上等缘、相冲需磨合', () => {
    expect(branchOfYear(2008)).toBe(0) // 2008 鼠
    const he = computeSanShi(0, 1) // 鼠牛六合
    expect(he.relation).toBe('六合')
    expect(he.level).toBe('上等缘')
    const chong = computeSanShi(0, 6) // 鼠马相冲
    expect(chong.relation).toBe('相冲')
    expect(chong.share.length).toBeGreaterThan(0)
  })

  it('测字：字典字有断法，未知字估算', () => {
    const hao = computeCeZi('好')!
    expect(hao.ji).toBe('吉')
    expect(hao.text.length).toBeGreaterThan(0)
    const unk = computeCeZi('龘')!
    expect(unk.estimated).toBe(true)
  })

  it('诸葛神算：取签号在 1-384，结果非空', () => {
    const r = computeZhuGe('问前程')!
    expect(r.number).toBeGreaterThanOrEqual(1)
    expect(r.number).toBeLessThanOrEqual(384)
    expect(r.hexName.length).toBeGreaterThan(0)
    expect(r.text.length).toBeGreaterThan(0)
    expect(computeZhuGe('')).toBeNull()
  })

  it('痣相图鉴：分面部/身体且均有内容', () => {
    expect(MOLES.length).toBeGreaterThan(20)
    expect(molesByRegion('面部').length).toBeGreaterThan(0)
    expect(molesByRegion('身体').length).toBeGreaterThan(0)
  })
})
