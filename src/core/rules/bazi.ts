// 八字排盘：由「公历年月日[+时辰]」排年柱、月柱、日柱、时柱。
//
// 关键规则（用户已确认）：
// - 年柱以「立春」为界；月柱以 12 个「节」为界。
// - 晚子时：23:00 起算次日（子时换日，主流八字）。
// - 时间按北京时间钟表时间处理（不引入真太阳时）。
// - 没填时辰 → 只算 6 字（年月日三柱），时柱标 null（缺时辰，未算）。

import { GanZhi, Branch, ganZhiFromIndex, ganZhiIndex, ganZhiName } from './ganzhi'
import { solarTermMs, getJieTimes } from './solarTerm'
import { nayinOfGanZhi } from './nayin'
import { WuXing } from './fiveElement'

export interface BirthTime {
  year: number
  month: number // 1-12
  day: number // 1-31
  hour?: number // 0-23，可选（时辰）
  minute?: number // 0-59，可选
}

export interface Pillar {
  ganZhi: GanZhi
  name: string // 如「甲子」
  nayin: string // 纳音，如「海中金」
  nayinWuXing: WuXing // 纳音五行
}

export interface BaZiResult {
  hasHour: boolean
  yearPillar: Pillar
  monthPillar: Pillar
  dayPillar: Pillar
  hourPillar: Pillar | null // 缺时辰时为 null
  fiveElements: Record<WuXing, number> // 五行分布统计
  zodiac: Branch // 生肖（年支）
}

const MS_PER_DAY = 86400000
// 日柱锚点：2000-01-01 = 戊午，六十甲子 0 基序号 54（甲子=0 … 癸亥=59）
const DAY_ANCHOR_INDEX = 54

/** 距 2000-01-01 的天数（负数为之前） */
function dayOffsetFrom2000(y: number, m: number, d: number): number {
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(2000, 0, 1)) / MS_PER_DAY)
}

/** 由八字年取年干支（如 2024 → 甲辰） */
function yearGanZhi(baziYear: number): GanZhi {
  const n = baziYear - 4
  return { stem: ((n % 10) + 10) % 10, branch: ((n % 12) + 12) % 12 }
}

/** 时辰分支：0=子(23-1) … 11=亥(21-23) */
function hourBranch(hour: number): Branch {
  return Math.floor((hour + 1) / 2) % 12
}

export function computeBaZi(input: BirthTime): BaZiResult {
  const hasHour = input.hour !== undefined && input.hour !== null
  const hour = input.hour ?? 0
  const minute = input.minute ?? 0

  // 23 点换日：≥23 时，日柱/时柱按次日算
  const dayShift = hour >= 23 ? 1 : 0
  const effMs = Date.UTC(input.year, input.month - 1, input.day) + dayShift * MS_PER_DAY

  // 出生时刻（北京墙钟编码为 UTC 的 pseudoMs）
  const birthMs = Date.UTC(input.year, input.month - 1, input.day, hour, minute)

  // 1. 年柱：立春为界
  const liChun = solarTermMs(input.year, 2) // 立春
  const baziYear = birthMs >= liChun ? input.year : input.year - 1
  const yearGZ = yearGanZhi(baziYear)

  // 2. 月柱：12 节为界 + 五虎遁
  const jies = getJieTimes(baziYear)
  let monthBranch: Branch = 1 // 兜底：丑月（小寒到立春之间）
  for (const jie of jies) {
    if (birthMs >= jie.ms) monthBranch = jie.branch
  }
  const yinStem = ((yearGZ.stem % 5) * 2 + 2) % 10 // 五虎遁：寅月天干
  const monthOffset = (monthBranch - 2 + 12) % 12
  const monthGZ: GanZhi = { stem: (yinStem + monthOffset) % 10, branch: monthBranch }

  // 3. 日柱：2000-01-01 = 戊午（序号 54）锚点 + 天数差
  const effDate = new Date(effMs)
  const offset = dayOffsetFrom2000(
    effDate.getUTCFullYear(),
    effDate.getUTCMonth() + 1,
    effDate.getUTCDate(),
  )
  const dayIndex = ((DAY_ANCHOR_INDEX + offset) % 60 + 60) % 60
  const dayGZ = ganZhiFromIndex(dayIndex)

  // 4. 时柱：时辰 + 五鼠遁（缺时辰则 null）
  let hourGZ: GanZhi | null = null
  if (hasHour) {
    const hb = hourBranch(hour)
    const ziStem = ((dayGZ.stem % 5) * 2) % 10 // 五鼠遁：子时天干
    hourGZ = { stem: (ziStem + hb) % 10, branch: hb }
  }

  // 组装各柱（含纳音）+ 五行统计
  const five: Record<WuXing, number> = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 }
  const makePillar = (gz: GanZhi): Pillar => {
    const idx = ganZhiIndex(gz.stem, gz.branch)
    const n = nayinOfGanZhi(idx)
    five[n.wuXing]++
    return { ganZhi: gz, name: ganZhiName(gz), nayin: n.name, nayinWuXing: n.wuXing }
  }

  return {
    hasHour,
    yearPillar: makePillar(yearGZ),
    monthPillar: makePillar(monthGZ),
    dayPillar: makePillar(dayGZ),
    hourPillar: hourGZ ? makePillar(hourGZ) : null,
    fiveElements: five,
    zodiac: yearGZ.branch,
  }
}
