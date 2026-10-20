// 时间模块：大运 + 流年 + 未来几年 + 重要年份（娱乐参考）。
//
// 大运规则（主流）：
// - 顺逆：年干阳（甲丙戊庚壬）+ 男，或年干阴 + 女 → 顺排（月柱往下）；否则逆排。
// - 起运：出生到下一节（顺）/ 上一节（逆）的天数，3 天折 1 年（余 1 天≈4 个月）。
// - 每柱管 10 年，从月柱干支顺 / 逆排 8 柱。
// - 缺性别 → 不算大运，标「缺性别，未算」；流年不受影响。
//
// 流年：流年干支 + 流年干对日干的十神 + 流年支对命盘的合冲害刑 / 桃花红鸾天喜驿马空亡
// + 犯太岁（值 / 冲 / 刑 / 破 / 害，含本命年提示）。

import { Person } from '../../types/person'
import { FortuneReport, YearFortune, DaYun, DaYunPillar } from '../../types/fortune'
import { ShiShenName } from '../../types/luming'
import { computeBaZi } from '../rules/bazi'
import { shiShen, shenShaZhiNames, hongLuan, tianXi, kongWang } from '../rules/luming'
import { GanZhi, Branch, Stem, ganZhiFromIndex, ganZhiIndex, ganZhiName, isLiuHe, isLiuChong, isXiangHai } from '../rules/ganzhi'
import { getJieTimes, solarTermMs } from '../rules/solarTerm'

const MS_PER_DAY = 86400000

// ---------------- 十神 → 大白话 ----------------
const SHI_SHEN_PLAIN: Record<ShiShenName, string> = {
  比肩: '同辈多，帮衬与竞争并存，靠朋友也要防朋友',
  劫财: '争强好胜、开销大，防被人分走利益',
  食神: '心态好、才艺生财、有口福',
  伤官: '点子多、不服管，说话易得罪人',
  偏财: '偏财运旺、机会多，可搏一搏',
  正财: '正财运旺，靠主业踏实进账',
  七杀: '压力大、竞争强，逼自己一把能成事',
  正官: '有管束、讲规矩，易有升迁或责任',
  偏印: '爱琢磨、偏冷门，适合钻研',
  正印: '有学习运、有靠山，宜进修与守成',
}

// ---------------- 地支神煞 → 大白话 ----------------
const SHEN_SHA_PLAIN: Record<string, string> = {
  驿马: '多跑动、多变动，适合外出闯',
  桃花: '人缘旺、异性缘好，感情或应酬多',
  华盖: '爱独处、钻研，适合静心沉淀',
  劫煞: '易有波折与竞争，稳字当头',
  亡神: '心神易耗散，注意是非',
  将星: '有领导运，容易出头',
  灾煞: '防突发麻烦，多留神',
}

// 六破：子酉、卯午、辰丑、未戌、寅亥、巳申
const LIU_PO: [Branch, Branch][] = [
  [0, 9],
  [3, 6],
  [4, 1],
  [7, 10],
  [2, 11],
  [5, 8],
]

// 三刑（相刑）：寅巳申、丑戌未、子卯、辰午酉亥（自刑）
const SAN_XING_GROUPS: Branch[][] = [
  [2, 5, 8],
  [1, 10, 7],
  [0, 3],
  [4, 6, 9, 11],
]

function toBirthTime(p: Person) {
  return { year: p.birthYear, month: p.birthMonth, day: p.birthDay, hour: p.hour, minute: p.minute }
}

function birthMs(p: Person): number {
  return Date.UTC(p.birthYear, p.birthMonth - 1, p.birthDay, p.hour ?? 0, p.minute ?? 0)
}

/** 公历年 → 干支（流年/生肖年，娱乐口径） */
export function yearGanZhi(y: number): GanZhi {
  const n = y - 4
  return { stem: ((n % 10) + 10) % 10, branch: ((n % 12) + 12) % 12 }
}

function isPo(a: Branch, b: Branch): boolean {
  return LIU_PO.some(([x, y]) => (x === a && y === b) || (x === b && y === a))
}

function isXing(a: Branch, b: Branch): boolean {
  const g = SAN_XING_GROUPS.find((x) => x.includes(a))
  return !!g && a !== b && g.includes(b)
}

// ---------------- 犯太岁 ----------------
export function fanTaiSui(selfBranch: Branch, yearBranch: Branch): { hit: boolean; text: string } {
  const hits: string[] = []
  if (selfBranch === yearBranch) hits.push('值太岁（本命年）')
  if (isLiuChong(selfBranch, yearBranch)) hits.push('冲太岁')
  if (isXiangHai(selfBranch, yearBranch)) hits.push('害太岁')
  if (isPo(selfBranch, yearBranch)) hits.push('破太岁')
  if (isXing(selfBranch, yearBranch)) hits.push('刑太岁')
  if (hits.length === 0) return { hit: false, text: '今年不犯太岁' }
  return { hit: true, text: `今年${hits.join('、')}，宜稳不宜冒进，大事多留心` }
}

// ---------------- 流年（单年） ----------------
export function computeYearFortune(person: Person, year: number): YearFortune {
  const bazi = computeBaZi(toBirthTime(person))
  const dayStem = bazi.dayPillar.ganZhi.stem
  const selfBranch = bazi.zodiac // 生肖支
  const dayBranch = bazi.dayPillar.ganZhi.branch

  const yg = yearGanZhi(year)
  const yz = yg.branch

  const shiShenLabel = SHI_SHEN_PLAIN[shiShen(dayStem, yg.stem)]

  const relations: string[] = []
  for (const s of shenShaZhiNames(selfBranch, yz)) {
    if (SHEN_SHA_PLAIN[s]) relations.push(SHEN_SHA_PLAIN[s])
  }
  if (hongLuan(selfBranch) === yz) relations.push('红鸾入命，易有喜事、感情进展')
  if (tianXi(selfBranch) === yz) relations.push('天喜入命，易有开心事、人缘好')
  if (isLiuHe(yz, dayBranch)) relations.push('流年合日支，感情 / 家宅易有喜事')
  if (isLiuChong(yz, dayBranch)) relations.push('流年冲日支，注意感情 / 家宅变动')
  if (kongWang(ganZhiIndex(yg.stem, yz)).includes(yz)) relations.push('流年落空亡，宜守不宜攻、勿空想')

  const fan = fanTaiSui(selfBranch, yz)

  const text = `${year} 年（${ganZhiName(yg)}）：${shiShenLabel}。${relations.length ? relations.join('；') + '。' : ''}${fan.text}。`

  return { year, ganZhi: ganZhiName(yg), shiShenLabel, relations, fanTaiSui: fan, text }
}

// ---------------- 大运 ----------------
function daYunPillarText(gz: GanZhi, dayStem: Stem, selfBranch: Branch): string {
  const parts: string[] = [SHI_SHEN_PLAIN[shiShen(dayStem, gz.stem)]]
  for (const s of shenShaZhiNames(selfBranch, gz.branch)) {
    if (SHEN_SHA_PLAIN[s]) parts.push(SHEN_SHA_PLAIN[s])
  }
  return `${ganZhiName(gz)}：${parts.join('；')}`
}

function computeDaYun(person: Person): DaYun {
  const bazi = computeBaZi(toBirthTime(person))
  const bms = birthMs(person)
  const liChun = solarTermMs(person.birthYear, 2)
  const baziYear = bms >= liChun ? person.birthYear : person.birthYear - 1

  const yearStem = bazi.yearPillar.ganZhi.stem
  const yang = yearStem % 2 === 0 // 阳干=偶数下标（甲丙戊庚壬）
  const gender = person.gender!
  const shun = gender === 'male' ? yang : !yang // 阳男阴女顺排

  // 起运：3 天折 1 年
  const jies = getJieTimes(baziYear)
  let days = 0
  if (shun) {
    const next = [...jies, { branch: 2, ms: solarTermMs(baziYear + 1, 2) }].find((j) => j.ms > bms)
    if (next) days = (next.ms - bms) / MS_PER_DAY
  } else {
    const prev = [...jies].reverse().find((j) => j.ms < bms)
    if (prev) days = (bms - prev.ms) / MS_PER_DAY
  }

  let years = Math.floor(days / 3)
  let months = Math.round((days - years * 3) * 4) // 1 天≈4 个月
  if (months >= 12) {
    years += 1
    months = 0
  }
  const startAgeLabel = months > 0 ? `${years}岁${months}个月` : `${years}岁`

  // 从月柱顺 / 逆排 8 柱
  const monthGZ = bazi.monthPillar.ganZhi
  const monthIdx = ganZhiIndex(monthGZ.stem, monthGZ.branch)
  const dayStem = bazi.dayPillar.ganZhi.stem
  const selfBranch = bazi.zodiac

  const pillars: DaYunPillar[] = []
  for (let k = 1; k <= 8; k++) {
    const idx = shun ? monthIdx + k : monthIdx - k
    const gz = ganZhiFromIndex(idx)
    const startAge = years + (k - 1) * 10
    const endAge = startAge + 9
    pillars.push({
      ganZhi: ganZhiName(gz),
      startAge,
      endAge,
      startYear: person.birthYear + startAge,
      endYear: person.birthYear + endAge,
      ageLabel: `${startAge}–${endAge} 岁`,
      text: daYunPillarText(gz, dayStem, selfBranch),
    })
  }

  return {
    startAge: years,
    startAgeMonths: months,
    startAgeLabel,
    startYear: person.birthYear + years,
    pillars,
  }
}

// ---------------- 汇总 ----------------
export function computeFortune(
  person: Person,
  opts: { horizonYears?: number; nowYear?: number } = {},
): FortuneReport {
  const bazi = computeBaZi(toBirthTime(person))
  const hasHour = bazi.hasHour
  const hasGender = person.gender !== undefined

  const nowYear = opts.nowYear ?? new Date().getFullYear()
  const horizon = opts.horizonYears ?? 5

  const recentYears: YearFortune[] = []
  for (let y = nowYear; y <= nowYear + horizon; y++) {
    recentYears.push(computeYearFortune(person, y))
  }

  // 重要年份：扫未来 10 年
  const dayStem = bazi.dayPillar.ganZhi.stem
  const selfBranch = bazi.zodiac
  const dayBranch = bazi.dayPillar.ganZhi.branch
  const monthBranch = bazi.monthPillar.ganZhi.branch
  const importantYears: { year: number; text: string }[] = []
  for (let y = nowYear + 1; y <= nowYear + 10; y++) {
    const yg = yearGanZhi(y)
    const yz = yg.branch
    const reasons: string[] = []
    const zhiSha = shenShaZhiNames(selfBranch, yz)
    if (zhiSha.includes('桃花') || hongLuan(selfBranch) === yz || tianXi(selfBranch) === yz) {
      reasons.push('桃花 / 红鸾动，适合谈婚论嫁、感情上有喜事')
    }
    if (zhiSha.includes('驿马')) reasons.push('驿马动，适合换工作、搬家、往外闯')
    if (isLiuChong(yz, dayBranch) || isLiuChong(yz, monthBranch)) reasons.push('冲日 / 月，适合换环境、做变动')
    const ss = shiShen(dayStem, yg.stem)
    const fan = fanTaiSui(selfBranch, yz)
    if ((ss === '正财' || ss === '偏财' || ss === '食神' || ss === '伤官') && !fan.hit) {
      reasons.push('财运在线，适合搞钱、投资、拓展')
    }
    if (reasons.length) importantYears.push({ year: y, text: reasons.join('；') })
  }

  if (!hasGender) {
    return {
      hasGender: false,
      hasHour,
      missingNote: '缺性别，未算大运（流年不受影响）',
      daYun: null,
      recentYears,
      importantYears,
    }
  }

  return {
    hasGender: true,
    hasHour,
    daYun: computeDaYun(person),
    recentYears,
    importantYears,
  }
}
