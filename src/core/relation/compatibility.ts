// 合盘综合：综合生肖 / 纳音 / 生命灵数 / 星座 / 八字，输出大白话结论。
// 评分与建议均为「娱乐参考」，权重偏软，不宣称权威断命。

import { Person } from '../../types/person'
import { AnalysisResult, SectionResult, Level, AnalysisMode } from '../../types/analysis'
import { Relation } from '../../types/relation'
import { computeBaZi, BaZiResult, BirthTime, Pillar } from '../rules/bazi'
import { zodiacOf, zodiacRelations, ZodiacRelation } from '../rules/zodiac'
import { lifePathNumber } from '../rules/numerology'
import { westZodiac } from '../rules/zodiacWest'
import { WuXing, wuXingRelation, WU_XING } from '../rules/fiveElement'
import { isTianGanHe } from '../rules/ganzhi'
import { computeTrajectory } from './trajectory'
import {
  scoreToLevel,
  zodiacRelText,
  nayinRelText,
  westElementText,
  numerologyText,
  headlineFor,
  buildAdvice,
} from './plainLanguage'

function toBirthTime(p: Person): BirthTime {
  return { year: p.birthYear, month: p.birthMonth, day: p.birthDay, hour: p.hour, minute: p.minute }
}

// ---------------- 生肖 ----------------
function zodiacSection(a: BaZiResult, b: BaZiResult): SectionResult {
  const rels = zodiacRelations(a.zodiac, b.zodiac)
  let score = 0
  const points: string[] = []
  for (const rel of rels) {
    if (rel === '六合') score += 18
    else if (rel === '三合') score += 10
    else if (rel === '六冲') score -= 16
    else if (rel === '相害') score -= 8
    const t = zodiacRelText(rel)
    if (t) points.push(t)
  }
  if (rels.length === 0) {
    points.push(`${zodiacOf(a.zodiac)}和${zodiacOf(b.zodiac)}没有明显合冲，属于平平常常`)
  } else if (a.zodiac === b.zodiac) {
    points.push('同属相，很有共鸣，但也容易同脾气相顶')
  }
  return {
    system: 'zodiac',
    systemLabel: '生肖',
    score: clamp(score, -20, 20),
    level: scoreToLevel(clamp(score, -20, 20)),
    points,
  }
}

// ---------------- 纳音 ----------------
function nayinSection(a: BaZiResult, b: BaZiResult): SectionResult {
  let score = 0
  const points: string[] = []
  const pairs: [string, Pillar, Pillar][] = [
    ['年柱', a.yearPillar, b.yearPillar],
    ['日柱', a.dayPillar, b.dayPillar],
  ]
  for (const [label, pa, pb] of pairs) {
    const rel = wuXingRelation(pa.nayinWuXing, pb.nayinWuXing)
    if (rel === '同') score += 4
    else if (rel === '我生' || rel === '生我') score += 8
    else score -= 8
    points.push(`${label}纳音${nayinRelText(pa.nayinWuXing, pb.nayinWuXing, rel)}`)
  }
  return {
    system: 'nayin',
    systemLabel: '纳音五行',
    score: clamp(score, -20, 20),
    level: scoreToLevel(clamp(score, -20, 20)),
    points,
  }
}

// ---------------- 生命灵数 ----------------
function numerologySection(a: Person, b: Person): SectionResult {
  const la = lifePathNumber(a.birthYear, a.birthMonth, a.birthDay)
  const lb = lifePathNumber(b.birthYear, b.birthMonth, b.birthDay)
  const group = (n: number) => {
    if (n === 1 || n === 5 || n === 7) return 1
    if (n === 3 || n === 6 || n === 9) return 3
    return 2 // 2/4/8/11/22 归一组，33 归 3
  }
  const ga = group(la)
  const gb = group(lb)
  const sameGroup = ga === gb
  const hasMaster = [11, 22, 33].includes(la) || [11, 22, 33].includes(lb)
  let score = 0
  if (sameGroup) score += 8
  if (hasMaster) score += 3
  if (!sameGroup && !hasMaster) score -= 2
  return {
    system: 'numerology',
    systemLabel: '生命灵数',
    score: clamp(score, -20, 20),
    level: scoreToLevel(clamp(score, -20, 20)),
    points: [`灵数 ${la} 和 ${lb}：${numerologyText(sameGroup, hasMaster)}`],
  }
}

// ---------------- 星座 ----------------
// 西方星座用火/土/风/水四元素，其中「风」不属于五行，单独扩展类型
const WEST_ELEMENT: Record<string, WuXing | '风'> = {
  白羊座: '火', 狮子座: '火', 射手座: '火',
  金牛座: '土', 处女座: '土', 摩羯座: '土',
  双子座: '风', 天秤座: '风', 水瓶座: '风',
  巨蟹座: '水', 天蝎座: '水', 双鱼座: '水',
}

function westZodiacSection(a: Person, b: Person): SectionResult {
  const za = westZodiac(a.birthMonth, a.birthDay)
  const zb = westZodiac(b.birthMonth, b.birthDay)
  const ea = WEST_ELEMENT[za]
  const eb = WEST_ELEMENT[zb]
  const same = ea === eb
  const harmonious = (ea === '火' && eb === '风') || (ea === '风' && eb === '火') || (ea === '土' && eb === '水') || (ea === '水' && eb === '土')
  const challenging = (ea === '火' && eb === '水') || (ea === '水' && eb === '火') || (ea === '土' && eb === '风') || (ea === '风' && eb === '土')
  let score = 0
  if (same) score += 6
  else if (harmonious) score += 5
  else if (challenging) score -= 5
  return {
    system: 'west',
    systemLabel: '星座（娱乐参考）',
    score: clamp(score, -20, 20),
    level: scoreToLevel(clamp(score, -20, 20)),
    points: [`${za}对${zb}：${westElementText(same, harmonious, challenging)}`],
  }
}

// ---------------- 八字 ----------------
function baziSection(a: BaZiResult, b: BaZiResult): SectionResult {
  let score = 0
  const points: string[] = []
  const missingNote = !a.hasHour || !b.hasHour ? '有一方缺时辰，时柱不参与分析' : undefined

  const compare = (label: string, pa: Pillar | null, pb: Pillar | null, w: number) => {
    if (!pa || !pb) return
    if (isTianGanHe(pa.ganZhi.stem, pb.ganZhi.stem)) {
      score += 10 * w
      points.push(`${label}天干相合，是难得的缘分`)
    }
    const rels = zodiacRelations(pa.ganZhi.branch, pb.ganZhi.branch)
    if (rels.includes('六合')) {
      score += 10 * w
      points.push(`${label}地支六合，相处默契`)
    }
    if (rels.includes('三合')) {
      score += 6 * w
      points.push(`${label}地支三合，气场相投`)
    }
    if (rels.includes('六冲')) {
      score -= 10 * w
      points.push(`${label}地支相冲，容易起冲突`)
    }
    if (rels.includes('相害')) {
      score -= 6 * w
      points.push(`${label}地支相害，容易互相误会`)
    }
  }

  compare('年柱', a.yearPillar, b.yearPillar, 1)
  compare('月柱', a.monthPillar, b.monthPillar, 1)
  compare('日柱', a.dayPillar, b.dayPillar, 2)
  compare('时柱', a.hourPillar, b.hourPillar, 1)

  // 五行互补
  const aWeak = WU_XING.filter((x) => a.fiveElements[x] === 0)
  const bWeak = WU_XING.filter((x) => b.fiveElements[x] === 0)
  const aStrong = WU_XING.filter((x) => a.fiveElements[x] >= 2)
  const bStrong = WU_XING.filter((x) => b.fiveElements[x] >= 2)
  const aGiveB = aStrong.filter((x) => bWeak.includes(x))
  const bGiveA = bStrong.filter((x) => aWeak.includes(x))
  if (aGiveB.length > 0 && bGiveA.length > 0) {
    score += 12
    points.push('五行互补，正好补上对方缺的那一块')
  } else if (aGiveB.length > 0 || bGiveA.length > 0) {
    score += 6
    points.push('一方五行恰好补另一方所缺，有滋养作用')
  }

  if (points.length === 0) points.push('八字之间没有明显合冲，属相安无事')

  return {
    system: 'bazi',
    systemLabel: '八字',
    score: clamp(score, -20, 20),
    level: scoreToLevel(clamp(score, -20, 20)),
    points,
    missingNote,
  }
}

// ---------------- 汇总 ----------------
// 经验权重（软权重，娱乐参考）：生肖 0.25、纳音 0.15、灵数 0.1、星座 0.1、八字 0.4
const WEIGHTS: Record<string, number> = {
  zodiac: 0.25,
  nayin: 0.15,
  numerology: 0.1,
  west: 0.1,
  bazi: 0.4,
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

/** 判定两人关系类型：伴侣（合盘）还是其他人（关系发展） */
export function pairType(a: Person, b: Person, relations: Relation[]): AnalysisMode {
  const edge = relations.find(
    (r) => (r.a === a.id && r.b === b.id) || (r.a === b.id && r.b === a.id),
  )
  if (edge?.tag === 'spouse') return 'hepan'
  if ((a.isSelf && b.relationTag === 'partner') || (b.isSelf && a.relationTag === 'partner')) return 'hepan'
  return 'guanxi'
}

export function computeCompatibility(a: Person, b: Person, mode: AnalysisMode = 'hepan'): AnalysisResult {
  const ba = computeBaZi(toBirthTime(a))
  const bb = computeBaZi(toBirthTime(b))

  const sections = [
    zodiacSection(ba, bb),
    nayinSection(ba, bb),
    numerologySection(a, b),
    westZodiacSection(a, b),
    baziSection(ba, bb),
  ]

  const weighted = sections.reduce((s, sec) => s + sec.score * (WEIGHTS[sec.system] ?? 0.1), 0)
  const overallScore = clamp(Math.round(50 + weighted * 2), 5, 95)
  const overallLevel = scoreToLevel(weighted)

  const goodPoints = sections.flatMap((s) => (s.score > 0 ? s.points : []))
  const badPoints = sections.flatMap((s) => (s.score < 0 ? s.points : []))

  const missingNotes = sections.filter((s) => s.missingNote).map((s) => s.missingNote!)

  return {
    a,
    b,
    mode,
    overallScore,
    overallLevel,
    headline: headlineFor(overallLevel, a.name, b.name, mode),
    sections,
    advice: buildAdvice(overallLevel, goodPoints, badPoints, mode),
    missingNotes,
    trajectory: mode === 'guanxi' ? computeTrajectory(a, b) : undefined,
  }
}
