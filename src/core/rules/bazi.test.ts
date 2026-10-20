import { describe, it, expect } from 'vitest'
import { computeBaZi } from './bazi'

describe('日柱', () => {
  it('2000-01-01 = 戊午（锚点）', () => {
    expect(computeBaZi({ year: 2000, month: 1, day: 1 }).dayPillar.name).toBe('戊午')
  })
  it('1949-10-01 = 甲子', () => {
    expect(computeBaZi({ year: 1949, month: 10, day: 1 }).dayPillar.name).toBe('甲子')
  })
  it('2024-01-01 = 甲子', () => {
    expect(computeBaZi({ year: 2024, month: 1, day: 1 }).dayPillar.name).toBe('甲子')
  })
})

describe('年柱（立春为界）', () => {
  it('2024-02-04 17:00（立春后）= 甲辰年', () => {
    const r = computeBaZi({ year: 2024, month: 2, day: 4, hour: 17 })
    expect(r.yearPillar.name).toBe('甲辰')
    expect(r.zodiac).toBe(4) // 辰 = 龙
  })
  it('2024-02-03（立春前）= 癸卯年', () => {
    expect(computeBaZi({ year: 2024, month: 2, day: 3 }).yearPillar.name).toBe('癸卯')
  })
})

describe('月柱（12 节为界 + 五虎遁）', () => {
  it('2024-02-04 17:00 = 丙寅月', () => {
    const r = computeBaZi({ year: 2024, month: 2, day: 4, hour: 17 })
    expect(r.monthPillar.name).toBe('丙寅')
  })
})

describe('时柱（五鼠遁）与缺时辰', () => {
  it('缺时辰时 hourPillar 为 null', () => {
    const r = computeBaZi({ year: 2000, month: 1, day: 1 })
    expect(r.hasHour).toBe(false)
    expect(r.hourPillar).toBeNull()
  })
  it('2000-01-01 辰时(7-9点) = 丙辰时', () => {
    const r = computeBaZi({ year: 2000, month: 1, day: 1, hour: 7 })
    expect(r.hasHour).toBe(true)
    expect(r.hourPillar!.name).toBe('丙辰')
  })
  it('23:00 起算次日（子时换日）', () => {
    const r = computeBaZi({ year: 2000, month: 1, day: 1, hour: 23 })
    expect(r.dayPillar.name).toBe('己未') // 次日日柱
    expect(r.hourPillar!.ganZhi.branch).toBe(0) // 子时
    expect(r.hourPillar!.name).toBe('甲子')
  })
})
