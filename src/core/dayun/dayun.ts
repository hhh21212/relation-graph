// 大运流年：由八字月柱推大运（十年一步），并排近年流年。
// 规则：阳男阴女顺排、阴男阳女逆排；起运岁数 = 出生到最近节气的天数 ÷ 3。
// 点评为娱乐参考，按「大运/流年干支 与 命局（日干、年支）的合冲」说人话，不做专业断命。

import { computeBaZi } from '../rules/bazi'
import {
  ganZhiFromIndex,
  ganZhiIndex,
  ganZhiName,
  isLiuChong,
  isLiuHe,
  isSanHe,
  isTianGanHe,
  isXiangHai,
  type GanZhi,
} from '../rules/ganzhi'
import { getJieTimes, solarTermMs } from '../rules/solarTerm'

export type LuckLevel = '吉' | '平' | '凶'

export interface DaYunStep {
  index: number
  startAge: number // 起运岁（含小数）
  endAge: number
  gz: GanZhi
  name: string
  score: number // 20~95
  level: LuckLevel
  text: string
}

export interface LiuNian {
  year: number
  gz: GanZhi
  name: string
  score: number
  level: LuckLevel
  text: string
  isCurrent: boolean
  isBenMing: boolean
}

export interface DaYunReport {
  name: string
  gender: 'male' | 'female'
  direction: '顺' | '逆'
  startAgeText: string
  daYun: DaYunStep[]
  currentIndex: number
  liuNian: LiuNian[]
}

export interface DaYunInput {
  year: number
  month: number
  day: number
  hour?: number
  minute?: number
  gender: 'male' | 'female'
}

const MS_PER_DAY = 86400000
const N_STEPS = 8 // 排 8 步大运（约 80 年）

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

function isYangStem(stem: number): boolean {
  return stem % 2 === 0 // 甲丙戊庚壬
}

/** 某公历年的年干支（娱乐口径，未按立春细分） */
function yearGanZhi(year: number): GanZhi {
  const n = year - 4
  return { stem: ((n % 10) + 10) % 10, branch: ((n % 12) + 12) % 12 }
}

/** 干支 相对 命局（日干、年支）的合冲 → 吉凶分 + 白话 */
function describe(gz: GanZhi, dayStem: number, yearBranch: number): { score: number; level: LuckLevel; text: string } {
  const parts: string[] = []
  let score = 60
  if (isTianGanHe(gz.stem, dayStem)) {
    score += 10
    parts.push('天干相合，易遇缘分与机遇')
  }
  if (isLiuHe(gz.branch, yearBranch)) {
    score += 18
    parts.push('地支六合，顺遂有贵人')
  }
  if (isSanHe(gz.branch, yearBranch)) {
    score += 14
    parts.push('地支三合，气场相投')
  }
  if (isLiuChong(gz.branch, yearBranch)) {
    score -= 16
    parts.push('地支相冲，多有变动奔波')
  }
  if (isXiangHai(gz.branch, yearBranch)) {
    score -= 10
    parts.push('地支相害，易生误会')
  }
  if (gz.branch === yearBranch) {
    score -= 6
    parts.push('本命伏吟，宜稳不宜急')
  }
  score = clamp(score, 20, 95)
  const level: LuckLevel = score >= 70 ? '吉' : score <= 45 ? '凶' : '平'
  const text = parts.length ? parts.join('；') + '。' : '与命局无明显合冲，平稳前行。'
  return { score, level, text }
}

export function computeDaYun(input: DaYunInput): DaYunReport {
  const birthMs = Date.UTC(input.year, input.month - 1, input.day, input.hour ?? 0, input.minute ?? 0)
  const bazi = computeBaZi({
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    minute: input.minute,
  })

  const yearStem = bazi.yearPillar.ganZhi.stem
  const dayStem = bazi.dayPillar.ganZhi.stem
  const yearBranch = bazi.zodiac
  const forward = isYangStem(yearStem) === (input.gender === 'male')

  // 八字年（立春为界，与 computeBaZi 一致）
  const liChun = solarTermMs(input.year, 2)
  const baziYear = birthMs >= liChun ? input.year : input.year - 1
  const jieList = getJieTimes(baziYear)

  // 起运岁数：出生到最近「节」的天数 ÷ 3（三天折一岁）
  let days: number
  if (forward) {
    const next = jieList.find((j) => j.ms > birthMs)
    days = next ? (next.ms - birthMs) / MS_PER_DAY : 0
  } else {
    const prev = [...jieList].reverse().find((j) => j.ms < birthMs)
    days = prev ? (birthMs - prev.ms) / MS_PER_DAY : 0
  }
  const startAge = days / 3
  const startAgeYears = Math.floor(startAge)
  const startAgeMonths = Math.round((startAge - startAgeYears) * 12)

  const monthIdx = ganZhiIndex(bazi.monthPillar.ganZhi.stem, bazi.monthPillar.ganZhi.branch)

  const daYun: DaYunStep[] = []
  for (let i = 0; i < N_STEPS; i++) {
    const gz = ganZhiFromIndex(monthIdx + (forward ? i + 1 : -(i + 1)))
    const a0 = startAge + i * 10
    const a1 = a0 + 10
    const d = describe(gz, dayStem, yearBranch)
    daYun.push({
      index: i,
      startAge: a0,
      endAge: a1,
      gz,
      name: ganZhiName(gz),
      score: d.score,
      level: d.level,
      text: d.text,
    })
  }

  const currentYear = new Date().getFullYear()
  const age = currentYear - input.year
  const currentIndex = clamp(Math.floor((age - startAge) / 10), 0, N_STEPS - 1)

  // 当前大运覆盖的 10 个流年（按公历年近似），并保证「当年」一定落在窗口内
  let stepStartYear = input.year + Math.round(startAge) + currentIndex * 10
  if (currentYear < stepStartYear) stepStartYear = currentYear
  if (currentYear > stepStartYear + 9) stepStartYear = currentYear - 9
  const liuNian: LiuNian[] = []
  for (let k = 0; k < 10; k++) {
    const y = stepStartYear + k
    const gz = yearGanZhi(y)
    const d = describe(gz, dayStem, yearBranch)
    liuNian.push({
      year: y,
      gz,
      name: ganZhiName(gz),
      score: d.score,
      level: d.level,
      text: d.text,
      isCurrent: y === currentYear,
      isBenMing: gz.branch === yearBranch,
    })
  }

  const startAgeText = startAgeMonths > 0 ? `${startAgeYears}岁${startAgeMonths}个月` : `${startAgeYears}岁`

  return {
    name: '',
    gender: input.gender,
    direction: forward ? '顺' : '逆',
    startAgeText,
    daYun,
    currentIndex,
    liuNian,
  }
}
