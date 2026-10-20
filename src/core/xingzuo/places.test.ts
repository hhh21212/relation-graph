import { describe, it, expect } from 'vitest'
import { PLACES, DEFAULT_PLACE, tzOfLng, tzOfPlace, resolvePlace, tzLabel } from './places'

describe('出生地点库与时区算法', () => {
  it('地点库非空，默认地点是北京', () => {
    expect(PLACES.length).toBeGreaterThan(100)
    expect(DEFAULT_PLACE.name).toBe('北京')
  })

  it('时区算法：经度 ÷ 15° 四舍五入', () => {
    expect(tzOfLng(120)).toBe(8)
    expect(tzOfLng(0)).toBe(0)
    expect(tzOfLng(-74)).toBe(-5)
    expect(tzOfLng(139.7)).toBe(9)
  })

  it('中国城市统一北京时间 +8，世界城市用经度算法', () => {
    const beijing = PLACES.find((p) => p.name === '北京')!
    const newYork = PLACES.find((p) => p.name === '纽约')!
    const tokyo = PLACES.find((p) => p.name === '东京')!
    expect(tzOfPlace(beijing)).toBe(8)
    expect(tzOfPlace(newYork)).toBe(-5)
    expect(tzOfPlace(tokyo)).toBe(9)
  })

  it('出生地文本匹配地点（精确 / 包含）', () => {
    expect(resolvePlace('北京')?.name).toBe('北京')
    expect(resolvePlace('上海市')?.name).toBe('上海')
    expect(resolvePlace('上海浦东')?.name).toBe('上海')
  })

  it('空值或匹配不到返回 null', () => {
    expect(resolvePlace(undefined)).toBeNull()
    expect(resolvePlace('')).toBeNull()
    expect(resolvePlace('某个不存在的小镇')).toBeNull()
  })

  it('时区标签格式化', () => {
    expect(tzLabel(8)).toBe('UTC+8')
    expect(tzLabel(-5)).toBe('UTC-5')
    expect(tzLabel(5.5)).toBe('UTC+5:30')
  })
})
