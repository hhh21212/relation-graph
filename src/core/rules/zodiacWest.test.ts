import { describe, it, expect } from 'vitest'
import { westZodiac } from './zodiacWest'

describe('西方星座', () => {
  it('3/21 = 白羊座', () => {
    expect(westZodiac(3, 21)).toBe('白羊座')
  })
  it('1/1 = 摩羯座（跨年）', () => {
    expect(westZodiac(1, 1)).toBe('摩羯座')
  })
  it('1/20 = 水瓶座', () => {
    expect(westZodiac(1, 20)).toBe('水瓶座')
  })
  it('12/22 = 摩羯座', () => {
    expect(westZodiac(12, 22)).toBe('摩羯座')
  })
  it('7/23 = 狮子座', () => {
    expect(westZodiac(7, 23)).toBe('狮子座')
  })
})
