import { describe, it, expect } from 'vitest'
import { nayinOfGanZhi } from './nayin'

describe('纳音', () => {
  it('甲子乙丑 = 海中金（金）', () => {
    expect(nayinOfGanZhi(0).name).toBe('海中金')
    expect(nayinOfGanZhi(0).wuXing).toBe('金')
    expect(nayinOfGanZhi(1).name).toBe('海中金')
  })
  it('丙寅丁卯 = 炉中火（火）', () => {
    expect(nayinOfGanZhi(2).name).toBe('炉中火')
    expect(nayinOfGanZhi(3).wuXing).toBe('火')
  })
  it('壬戌癸亥 = 大海水（水）', () => {
    expect(nayinOfGanZhi(58).name).toBe('大海水')
    expect(nayinOfGanZhi(59).wuXing).toBe('水')
  })
})
