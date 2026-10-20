import { describe, it, expect } from 'vitest'
import { trioReading } from './trio'

describe('星座日月升三件套', () => {
  it('三核文本齐全', () => {
    const t = trioReading(4, 2, 9) // 狮子太阳 / 双子月亮 / 摩羯上升
    expect(t.heading).toContain('狮子座')
    expect(t.sun.length).toBeGreaterThan(0)
    expect(t.moon.length).toBeGreaterThan(0)
    expect(t.rising.length).toBeGreaterThan(0)
    expect(t.synthesis.length).toBeGreaterThan(0)
  })

  it('三核同元素时合成句提示内外一致', () => {
    const t = trioReading(0, 4, 8) // 白羊/狮子/射手，皆火象
    expect(t.synthesis).toContain('同属火象')
  })

  it('三核各居一象时合成句提示层次分明', () => {
    const t = trioReading(0, 1, 2) // 白羊火 / 金牛土 / 双子风
    expect(t.synthesis).toContain('各居一象')
  })
})
