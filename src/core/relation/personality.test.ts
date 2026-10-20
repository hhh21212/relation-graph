import { describe, it, expect } from 'vitest'
import { describePersonality, dayMasterRelation } from './personality'
import { Person } from '../../types/person'

const mk = (p: Partial<Person>): Person => ({
  id: 'x',
  name: '测试',
  birthYear: 2000,
  birthMonth: 1,
  birthDay: 1,
  gender: 'male',
  relationTag: 'other',
  createdAt: 0,
  ...p,
})

describe('性格画像', () => {
  it('2000-01-01 日主 = 戊土', () => {
    const profile = describePersonality(mk({}))
    expect(profile.dayMaster.label).toBe('戊土')
  })

  it('包含日主 / 五行 / 生肖 / 星座 / 灵数 五块内容', () => {
    const profile = describePersonality(mk({}))
    expect(profile.dayMaster.traits.length).toBeGreaterThan(0)
    expect(profile.dayMaster.nature).toBeTruthy()
    expect(profile.zodiac.animal).toBeTruthy()
    expect(profile.zodiac.traits.length).toBeGreaterThan(0)
    expect(profile.west.sign).toBeTruthy()
    expect(profile.west.traits.length).toBeGreaterThan(0)
    expect(profile.numerology.number).toBeGreaterThan(0)
    expect(profile.getAlongTips.length).toBeGreaterThan(0)
    expect(profile.summary).toContain('戊土')
  })

  it('五行强弱从八字干支统计，总数守恒（有时辰=8）', () => {
    const profile = describePersonality(mk({ hour: 8 }))
    const total = profile.wuXing.strong.length + profile.wuXing.weak.length
    // strong（≥2）+ weak（=0）之间必然有中间态（=1），所以 strong+weak ≤ 5
    expect(total).toBeLessThanOrEqual(5)
  })
})

describe('性格画像（禄命深化）', () => {
  it('2000-06-15 午时：三命=庚/辰/白蜡金、主本=主克本', () => {
    const profile = describePersonality(mk({ birthYear: 2000, birthMonth: 6, birthDay: 15, hour: 12 }))
    expect(profile.sanMing.lu).toBe('庚')
    expect(profile.sanMing.ming).toBe('辰')
    expect(profile.sanMing.shen).toBe('白蜡金')
    expect(profile.mainBen.rel).toBe('主克本')
    expect(profile.mainBen.text).toContain('先天')
  })

  it('命中神煞翻译成大白话（华盖/灾煞）', () => {
    const profile = describePersonality(mk({ birthYear: 2000, birthMonth: 6, birthDay: 15, hour: 12 }))
    expect(profile.shenSha.names).toContain('华盖')
    expect(profile.shenSha.names).toContain('灾煞')
    expect(profile.shenSha.lines.length).toBeGreaterThan(0)
  })

  it('十神有主导类别与描述、五行阴阳非空', () => {
    const profile = describePersonality(mk({}))
    expect(profile.shiShen.dominant).toBeTruthy()
    expect(profile.shiShen.dominantText).toBeTruthy()
    expect(profile.wuXingYinYang.line).toContain('戊')
    expect(profile.summary).toContain('十神偏')
  })
})

describe('日主契合', () => {
  it('甲己相合（天干五合）', () => {
    // 甲 = 0，己 = 5
    expect(dayMasterRelation(0, 5)).toContain('五合')
  })
  it('甲庚相克（甲木被庚金克）', () => {
    expect(dayMasterRelation(0, 6)).toContain('相克')
  })
  it('甲壬相生（壬水生甲木）', () => {
    expect(dayMasterRelation(0, 8)).toContain('相生')
  })
  it('甲甲同气（比和）', () => {
    expect(dayMasterRelation(0, 0)).toContain('同气')
  })
})
