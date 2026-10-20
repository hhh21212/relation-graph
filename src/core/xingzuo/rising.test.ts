import { describe, it, expect } from 'vitest'
import { RISING_SIGNS } from './rising'
import { SIGNS } from './data'

describe('上升星座解读', () => {
  it('与 12 星座一一对应', () => {
    expect(RISING_SIGNS).toHaveLength(SIGNS.length)
  })

  it('每条都有名字、关键词与白话', () => {
    for (const r of RISING_SIGNS) {
      expect(r.name.length).toBeGreaterThan(0)
      expect(r.keywords.length).toBeGreaterThan(0)
      expect(r.text.length).toBeGreaterThan(0)
    }
  })
})
