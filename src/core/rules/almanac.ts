// 万年历 / 黄历 / 择日 / 生日查询 / 节气 / 本命年：全部基于「寿星天文历」
// （lunar-javascript，MIT，许剑伟）权威实现，不自行编造黄历内容。
//
// 黄历的宜忌、吉神凶煞、冲煞、纳音、星宿、彭祖百忌、财喜福方位、农历日期
// 均直接取自库；星座用项目已有的 westZodiac；生肖/纳音用项目已有的 computeBaZi。
//
// 口径说明：黄历年干支/生肖按农历年（正月初一）口径；八字里的生肖按立春。
// 两处用途不同、别混。

import { Lunar, Solar } from 'lunar-javascript'
import { computeBaZi } from './bazi'
import { zodiacOf } from './zodiac'
import { westZodiac } from './zodiacWest'
import { fanTaiSui, yearGanZhi } from '../relation/fortune'
import { solarTermMs, pseudoToBeijing, SOLAR_TERM_NAMES } from './solarTerm'

const WEEK_CN = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

export interface DayAlmanac {
  solar: { year: number; month: number; day: number }
  week: string
  lunar: { year: string; month: string; day: string } // 农历，含「闰」
  ganZhi: { year: string; month: string; day: string }
  yi: string[] // 宜
  ji: string[] // 忌
  jiShen: string[] // 吉神
  xiongSha: string[] // 凶煞
  chong: string // 冲，如「(丁未)羊」
  chongShengXiao: string // 被冲的生肖，如「羊」
  naYin: string // 日柱纳音
  xiu: string // 星宿
  positions: { cai: string; xi: string; fu: string } // 财神 / 喜神 / 福神方位
  pengZu: string[] // 彭祖百忌
  jieQi: string // 当天节气（可空）
}

/** 某公历日的完整黄历 */
export function dayAlmanac(y: number, m: number, d: number): DayAlmanac {
  const solar = Solar.fromYmd(y, m, d)
  const l = solar.getLunar()
  return {
    solar: { year: y, month: m, day: d },
    week: WEEK_CN[solar.getWeek()],
    lunar: {
      year: l.getYearInChinese(),
      month: l.getMonthInChinese(),
      day: l.getDayInChinese(),
    },
    ganZhi: {
      year: l.getYearInGanZhi(),
      month: l.getMonthInGanZhi(),
      day: l.getDayInGanZhi(),
    },
    yi: l.getDayYi(),
    ji: l.getDayJi(),
    jiShen: l.getDayJiShen(),
    xiongSha: l.getDayXiongSha(),
    chong: l.getDayChongDesc(),
    chongShengXiao: l.getDayChongShengXiao(),
    naYin: l.getDayNaYin(),
    xiu: l.getXiu(),
    positions: {
      cai: l.getDayPositionCaiDesc(),
      xi: l.getDayPositionXiDesc(),
      fu: l.getDayPositionFuDesc(),
    },
    pengZu: [l.getPengZuGan(), l.getPengZuZhi()].filter(Boolean),
    jieQi: l.getJieQi() || '',
  }
}

/** 某公历月每天（1..最后一天）的黄历，供日历网格用 */
export function monthGrid(y: number, m: number): DayAlmanac[] {
  const daysInMonth = new Date(y, m, 0).getDate()
  const out: DayAlmanac[] = []
  for (let d = 1; d <= daysInMonth; d++) out.push(dayAlmanac(y, m, d))
  return out
}

/** 某公历年的 24 节气日期 */
export function yearJieQi(y: number): { name: string; month: number; day: number }[] {
  return SOLAR_TERM_NAMES.map((name, n) => {
    const bj = pseudoToBeijing(solarTermMs(y, n))
    return { name, month: bj.month, day: bj.day }
  })
}

// ---------------- 生日查询 ----------------
export interface BirthInfo {
  shengXiao: string // 生肖（立春口径）
  age: number // 周岁
  xingZuo: string // 星座
  nayin: string // 日柱纳音
  yearNayin: string // 年柱纳音
  lunar: string // 农历生日，如「八月廿六」
  lunarYear: string // 农历年，如「二〇二六」
  ganZhi: string // 日柱干支
  zodiacBranch: number // 生肖地支（供本命年查询）
}

/** 由公历生日出：生肖 / 年龄 / 星座 / 纳音 / 农历生日 */
export function birthInfo(y: number, m: number, d: number, hour?: number): BirthInfo {
  const bazi = computeBaZi({ year: y, month: m, day: d, hour })
  const l = Solar.fromYmd(y, m, d).getLunar()
  const now = new Date()
  let age = now.getFullYear() - y
  const before = now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)
  if (before) age--
  age = Math.max(age, 0)
  return {
    shengXiao: zodiacOf(bazi.zodiac),
    age,
    xingZuo: westZodiac(m, d),
    nayin: bazi.dayPillar.nayin,
    yearNayin: bazi.yearPillar.nayin,
    lunar: `${l.getMonthInChinese()}月${l.getDayInChinese()}`,
    lunarYear: l.getYearInChinese(),
    ganZhi: bazi.dayPillar.name,
    zodiacBranch: bazi.zodiac,
  }
}

// ---------------- 本命年 / 犯太岁 ----------------

/** 某生肖（地支序号 0=子鼠 … 11=亥猪）在 year 年是否犯太岁 + 大白话 */
export function taiSuiOf(branch: number, year: number): { hit: boolean; text: string } {
  const fan = fanTaiSui(branch, yearGanZhi(year).branch)
  return { hit: fan.hit, text: fan.text.replace('今年', `${year}年`) }
}

/** 某生肖（地支序号）在一串年份里的犯太岁结果 */
export function taiSuiYears(branch: number, years: number[]): { year: number; hit: boolean; text: string }[] {
  return years.map((y) => {
    const fan = fanTaiSui(branch, yearGanZhi(y).branch)
    return { year: y, hit: fan.hit, text: fan.text.replace('今年', `${y}年`) }
  })
}

// ---------------- 择日 ----------------
export type Activity = 'marry' | 'move' | 'open' | 'travel' | 'sign' | 'ground'

export const ACTIVITIES: { key: Activity; label: string; keywords: string[] }[] = [
  { key: 'marry', label: '结婚', keywords: ['嫁娶', '纳采', '订盟', '会亲友'] },
  { key: 'move', label: '搬家', keywords: ['入宅', '移徙'] },
  { key: 'open', label: '开业', keywords: ['开市', '交易', '纳财', '开张'] },
  { key: 'travel', label: '出行', keywords: ['出行'] },
  { key: 'sign', label: '签约', keywords: ['立券', '签约', '交易'] },
  { key: 'ground', label: '动土装修', keywords: ['动土', '修造'] },
]

export interface DaySuitability {
  ok: boolean // 是否有「宜」命中
  matched: string[] // 命中的宜项
  avoid: string[] // 命中的忌项
}

/** 某天对某活动是否合适（看宜/忌关键词命中） */
export function daySuitable(day: DayAlmanac, key: Activity): DaySuitability {
  const act = ACTIVITIES.find((a) => a.key === key)!
  const matched = act.keywords.filter((k) => day.yi.some((x) => x.includes(k)))
  const avoid = act.keywords.filter((k) => day.ji.some((x) => x.includes(k)))
  return { ok: matched.length > 0, matched, avoid }
}

/** 某公历月里，对某活动「宜」的日子列表（含命中词与冲煞） */
export function suitableDays(y: number, m: number, key: Activity): { day: number; almanac: DayAlmanac; matched: string[]; avoid: string[] }[] {
  const out: { day: number; almanac: DayAlmanac; matched: string[]; avoid: string[] }[] = []
  for (let d = 1; d <= new Date(y, m, 0).getDate(); d++) {
    const al = dayAlmanac(y, m, d)
    const s = daySuitable(al, key)
    if (s.ok) out.push({ day: d, almanac: al, matched: s.matched, avoid: s.avoid })
  }
  return out
}

/** 给 dayAlmanac 也补一个便捷入口：从公历日期取农历对象（供 UI 细节用） */
export function lunarOf(y: number, m: number, d: number): Lunar {
  return Solar.fromYmd(y, m, d).getLunar()
}
