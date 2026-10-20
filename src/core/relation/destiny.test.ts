import { describe, it, expect } from 'vitest'
import { computeDestiny } from './destiny'
import { Person } from '../../types/person'

function person(over: Partial<Person> = {}): Person {
  return {
    id: 'p1',
    name: '小明',
    birthYear: 2006,
    birthMonth: 11,
    birthDay: 10,
    hour: 12,
    gender: 'male',
    relationTag: 'friend',
    createdAt: 0,
    ...over,
  }
}

describe('个人深度命盘 computeDestiny', () => {
  it('优点/缺点都非空且是白话', () => {
    const d = computeDestiny(person())
    expect(d.character.strengths.length).toBeGreaterThan(0)
    expect(d.character.weaknesses.length).toBeGreaterThan(0)
    expect(d.character.dayMasterNature.length).toBeGreaterThan(0)
  })

  it('适合四件套：行业/方位/颜色/数字都非空', () => {
    const d = computeDestiny(person())
    expect(d.suitable.industries.length).toBeGreaterThan(0)
    expect(d.suitable.directions.length).toBeGreaterThan(0)
    expect(d.suitable.colors.length).toBeGreaterThan(0)
    expect(d.suitable.numbers.length).toBeGreaterThan(0)
  })

  it('财运/感情/健康/贵小人/会犯什么 各字段都有内容', () => {
    const d = computeDestiny(person())
    expect(d.wealth.type).toBeTruthy()
    expect(d.wealth.style).toBeTruthy()
    expect(d.wealth.text).toBeTruthy()
    expect(d.love.timing).toBeTruthy()
    expect(d.love.meet).toBeTruthy()
    expect(d.love.caution).toBeTruthy()
    expect(d.health.weakAreas.length).toBeGreaterThan(0)
    expect(d.health.tips.length).toBeGreaterThan(0)
    expect(d.benefactor.zodiacs.length).toBeGreaterThan(0)
    expect(d.villain.zodiacs.length).toBeGreaterThan(0)
    expect(d.cautions.health.length).toBeGreaterThan(0)
    expect(d.cautions.wealth.length).toBeGreaterThan(0)
    expect(d.cautions.love.length).toBeGreaterThan(0)
    expect(d.cautions.career.length).toBeGreaterThan(0)
    expect(d.cautions.character.length).toBeGreaterThan(0)
  })

  it('缺时辰：时柱标「缺时辰」，hasHour=false', () => {
    const d = computeDestiny(person({ hour: undefined }))
    expect(d.hasHour).toBe(false)
    expect(d.overview.baziGrid[3].ganZhi).toBe('缺时辰')
  })
})
