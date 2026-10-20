import { describe, it, expect } from 'vitest'
import {
  computeLuMing,
  shiShen,
  wangShuai,
  changSheng,
  kongWang,
  hongLuan,
  tianXi,
  xiYong,
  mainBenRel,
} from './luming'

// 锚点：paipan.py 示例 2000-06-15 12:00（男）
// 年柱庚辰·白蜡金 / 月柱壬午·杨柳木 / 日柱甲辰·覆灯火 / 时柱庚午·路旁土
const input = { year: 2000, month: 6, day: 15, hour: 12, minute: 0 }

describe('禄命排盘（锚定 paipan.py 示例）', () => {
  const lm = computeLuMing(input)

  it('四柱与纳音', () => {
    const [y, m, d, h] = lm.pillars
    expect(y.ganZhiName).toBe('庚辰')
    expect(y.nayin).toBe('白蜡金')
    expect(m.ganZhiName).toBe('壬午')
    expect(m.nayin).toBe('杨柳木')
    expect(d.ganZhiName).toBe('甲辰')
    expect(d.nayin).toBe('覆灯火')
    expect(h.ganZhiName).toBe('庚午')
    expect(h.nayin).toBe('路旁土')
  })

  it('三命：禄=年干庚、命=年支辰、身=年纳音白蜡金', () => {
    expect(lm.sanMing).toEqual({ lu: '庚', ming: '辰', shen: '白蜡金' })
  })

  it('主本：覆灯火(火)克白蜡金(金) = 主克本', () => {
    expect(lm.mainBen.rel).toBe('主克本')
    expect(lm.mainBen.text).toContain('先天')
  })

  it('喜用：身金 / 病根火 / 通关土 / 帮身金 / 忌[火,木]', () => {
    expect(lm.xiYong).toEqual({ shen: '金', bingGen: '火', tongGuan: '土', bangShen: '金', ji: ['火', '木'] })
  })

  it('神煞：日柱=年支华盖、月/时柱=年支灾煞', () => {
    const day = lm.pillars.find((p) => p.label === '日柱')!
    const month = lm.pillars.find((p) => p.label === '月柱')!
    const hour = lm.pillars.find((p) => p.label === '时柱')!
    expect(day.shenSha).toContain('年支华盖')
    expect(month.shenSha).toContain('年支灾煞')
    expect(hour.shenSha).toContain('年支灾煞')
  })

  it('神煞去重后包含 华盖/国印/灾煞', () => {
    expect(lm.shenShaAll).toContain('华盖')
    expect(lm.shenShaAll).toContain('国印')
    expect(lm.shenShaAll).toContain('灾煞')
  })

  it('空亡 = 申酉（甲戌旬）', () => {
    expect(lm.kongWang).toEqual([8, 9])
  })
})

describe('十神（修正 paipan.py 的印/食伤方向）', () => {
  it('癸(日主) vs 乙(藏干)：水生木 = 我生 = 食神（同阴）', () => {
    expect(shiShen(9, 1)).toBe('食神')
  })
  it('癸 vs 丙：水克火 = 我克 = 正财（异阴阳）', () => {
    expect(shiShen(9, 2)).toBe('正财')
  })
  it('癸 vs 己：土克水 = 克我 = 七杀（同阴）', () => {
    expect(shiShen(9, 5)).toBe('七杀')
  })
  it('甲 vs 壬：水生木 = 生我 = 偏印（同阳）', () => {
    expect(shiShen(0, 8)).toBe('偏印')
  })
})

describe('旺衰 / 长生 / 空亡 / 红鸾天喜', () => {
  it('旺衰：午月火旺，土相、木休、水囚、金死', () => {
    // 午 = branch 6 → 火当令
    expect(wangShuai(6, '火')).toBe('旺')
    expect(wangShuai(6, '土')).toBe('相') // 火生土
    expect(wangShuai(6, '木')).toBe('休') // 木生火
    expect(wangShuai(6, '水')).toBe('囚') // 水克火
    expect(wangShuai(6, '金')).toBe('死') // 火克金
  })

  it('长生：甲禄在寅（长生亥，顺数临官=寅）', () => {
    expect(changSheng(0, 2)).toBe('临官') // 甲长生亥，寅为临官
  })

  it('空亡：甲子旬空戌亥', () => {
    expect(kongWang(0)).toEqual([10, 11])
  })

  it('红鸾天喜：年支戌 → 红鸾巳、天喜亥', () => {
    expect(hongLuan(10)).toBe(5) // 戌→巳
    expect(tianXi(10)).toBe(11) // 巳冲亥
  })

  it('喜用：身金 → 病根火、通关土、忌[火,木]', () => {
    expect(xiYong('金')).toEqual({ shen: '金', bingGen: '火', tongGuan: '土', bangShen: '金', ji: ['火', '木'] })
  })

  it('主本：年纳音木 克 日纳音土 = 本克主', () => {
    expect(mainBenRel('木', '土')).toBe('本克主')
  })
})
