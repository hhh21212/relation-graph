// 称骨算命（袁天罡称骨，简化版）：按农历年（生肖）、月、日、时辰各取骨重，
// 相加得总骨重（几两几钱），再对照白话评语。仅供娱乐参考。

import { Solar } from 'lunar-javascript'
import { ZODIAC_ANIMALS } from '../rules/zodiac'

// 各柱重量（单位：钱，1 两 = 10 钱）
const YEAR_QIAN = [12, 9, 6, 7, 12, 10, 9, 8, 7, 8, 9, 16] // 鼠..猪
const MONTH_QIAN = [6, 7, 18, 9, 5, 16, 9, 15, 18, 8, 9, 5] // 正月..腊月
const DAY_QIAN = [
  0, 5, 10, 8, 15, 16, 15, 8, 16, 8, 16, 9, 17, 8, 17, 10,
  8, 9, 18, 5, 15, 10, 9, 8, 9, 15, 18, 7, 8, 16, 6,
] // 初一..三十
const HOUR_QIAN = [16, 6, 7, 10, 9, 16, 10, 8, 8, 9, 6, 6] // 子..亥

export interface ChengGuResult {
  lunarText: string
  weights: { year: number; month: number; day: number; hour: number | null }
  totalQian: number
  liang: number
  qian: number
  hasHour: boolean
  level: '大吉' | '吉' | '平' | '凶'
  text: string
}

function describe(totalQian: number, hasHour: boolean): { level: ChengGuResult['level']; text: string } {
  const t = hasHour ? totalQian : totalQian + 8 // 缺时辰时按约 8 钱补估，仅用于分段
  if (t <= 24) return { level: '凶', text: '命途较为坎坷，一生劳碌奔波、早年辛苦，宜安分守己、稳中求安。' }
  if (t <= 39) return { level: '平', text: '早年多劳碌，中年渐入佳境，晚年衣食无忧，属普通平顺的命。' }
  if (t <= 49) return { level: '吉', text: '衣食丰足、自立自强，一生较为顺遂，是中等偏上的好命。' }
  if (t <= 59) return { level: '大吉', text: '福禄双全、家道兴隆，一生少灾少难，属难得的好命。' }
  if (t <= 69) return { level: '大吉', text: '大富大贵之命，事业有成、名利双收，一生荣华富贵。' }
  return { level: '大吉', text: '极贵之命，人间少有，非富即贵、福泽深厚。' }
}

export function computeChengGu(
  year: number,
  month: number,
  day: number,
  hour?: number,
): ChengGuResult {
  const lunar = Solar.fromYmd(year, month, day).getLunar()

  const zodiacIdx = Math.max(0, ZODIAC_ANIMALS.indexOf(lunar.getYearShengXiao() as (typeof ZODIAC_ANIMALS)[number]))
  const yearW = YEAR_QIAN[zodiacIdx] ?? 10

  const monthIdx = Math.abs(lunar.getMonth()) // 1-12（闰月取同月）
  const monthW = MONTH_QIAN[(monthIdx - 1 + 12) % 12]

  const dayW = DAY_QIAN[lunar.getDay()] ?? 8

  const hasHour = hour !== undefined && hour !== null
  const hourBranch = hasHour ? Math.floor((hour! + 1) / 2) % 12 : null
  const hourW = hourBranch !== null ? HOUR_QIAN[hourBranch] : null

  const totalQian = yearW + monthW + dayW + (hourW ?? 0)
  const liang = Math.floor(totalQian / 10)
  const qian = totalQian % 10

  const d = describe(totalQian, hasHour)

  return {
    lunarText: `${lunar.getYearInChinese()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    weights: { year: yearW, month: monthW, day: dayW, hour: hourW },
    totalQian,
    liang,
    qian,
    hasHour,
    level: d.level,
    text: d.text,
  }
}
