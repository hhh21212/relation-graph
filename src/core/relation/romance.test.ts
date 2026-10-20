import { describe, it, expect } from 'vitest'
import { computeRomance } from './romance'
import { Person } from '../../types/person'
import { computeBaZi } from '../rules/bazi'
import { shenShaZhiNames } from '../rules/luming'
import { BRANCHES, isLiuHe, isSanHe } from '../rules/ganzhi'
import { zodiacOf } from '../rules/zodiac'

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

function taohuaBranch(base: number): number {
  for (let b = 0; b < 12; b++) if (shenShaZhiNames(base, b).includes('桃花')) return b
  return 9
}

describe('桃花 / 感情 computeRomance', () => {
  it('六块内容都有大白话', () => {
    const r = computeRomance(person(), { nowYear: 2026 })
    expect(r.appearance.text.length).toBeGreaterThan(0)
    expect(r.taohua.type).toBeTruthy()
    expect(r.taohua.direction).toBeTruthy()
    expect(r.taohua.time).toBeTruthy()
    expect(r.meeting.zodiacs.length).toBeGreaterThan(0)
    expect(r.meeting.profession).toBeTruthy()
    expect(r.spouse.face).toBeTruthy()
    expect(r.spouse.temperament).toBeTruthy()
    expect(r.thisYear.label).toBeTruthy()
    expect(r.advice.attract.length).toBeGreaterThan(0)
    expect(r.advice.avoid.length).toBeGreaterThan(0)
  })

  it('缺时辰：hasHour=false、配偶宫标缺时辰、提醒里有缺时辰', () => {
    const r = computeRomance(person({ hour: undefined }), { nowYear: 2026 })
    expect(r.hasHour).toBe(false)
    expect(r.spouse.note).toContain('缺时辰')
    expect(r.cautions.join('')).toContain('缺时辰')
  })

  it('有时辰：hasHour=true、配偶宫没有缺时辰提示', () => {
    const r = computeRomance(person({ hour: 12 }), { nowYear: 2026 })
    expect(r.hasHour).toBe(true)
    expect(r.spouse.note).toBeUndefined()
  })

  it('缺性别：hasGender=false、不崩、提醒里含缺性别', () => {
    const r = computeRomance(person({ gender: undefined } as Partial<Person>), { nowYear: 2026 })
    expect(r.hasGender).toBe(false)
    expect(r.cautions.join('')).toContain('缺性别')
  })

  it('容易遇到的属相 = 日支的六合 / 三合', () => {
    const p = person()
    const bazi = computeBaZi({ year: p.birthYear, month: p.birthMonth, day: p.birthDay, hour: p.hour })
    const dayBranch = bazi.dayPillar.ganZhi.branch
    const expected = BRANCHES.map((_, b) => b)
      .filter((b) => isLiuHe(dayBranch, b) || isSanHe(dayBranch, b))
      .map((b) => zodiacOf(b))
    const r = computeRomance(p, { nowYear: 2026 })
    expect(r.meeting.zodiacs.sort()).toEqual(expected.sort())
  })

  it('桃花方位 = 日支三合局桃花位的方位', () => {
    const p = person()
    const bazi = computeBaZi({ year: p.birthYear, month: p.birthMonth, day: p.birthDay, hour: p.hour })
    const tb = taohuaBranch(bazi.dayPillar.ganZhi.branch)
    const DIR = ['正北', '东北', '东北', '正东', '东南', '东南', '正南', '西南', '西南', '正西', '西北', '西北']
    const r = computeRomance(p, { nowYear: 2026 })
    expect(r.taohua.direction).toBe(DIR[tb])
  })
})
