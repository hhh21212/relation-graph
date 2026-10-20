// 一群人分布：统计「记录」里所有人的日主五行 / 生肖 / 星座，看群体构成。
// 日主五行用八字日干五行（子平口径），生肖用八字年支（立春口径），星座用公历月日。

import { Person } from '../../types/person'
import { computeBaZi, BaZiResult } from '../rules/bazi'
import { WuXing, WU_XING, STEM_WU_XING, BRANCH_WU_XING } from '../rules/fiveElement'
import { zodiacOf } from '../rules/zodiac'
import { westZodiac } from '../rules/zodiacWest'

export interface DistributionItem {
  label: string
  count: number
  names: string[]
}

export interface GroupDistribution {
  total: number
  wuXing: DistributionItem[]
  zodiac: DistributionItem[]
  xingZuo: DistributionItem[]
}

function push(map: Map<string, string[]>, key: string, name: string) {
  const arr = map.get(key)
  if (arr) arr.push(name)
  else map.set(key, [name])
}

function toItems(map: Map<string, string[]>): DistributionItem[] {
  return [...map.entries()]
    .map(([label, names]) => ({ label, count: names.length, names }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

export function computeGroupDistribution(persons: Person[]): GroupDistribution {
  const wuXing = new Map<string, string[]>()
  const zodiac = new Map<string, string[]>()
  const xingZuo = new Map<string, string[]>()

  for (const p of persons) {
    const bazi = computeBaZi({
      year: p.birthYear,
      month: p.birthMonth,
      day: p.birthDay,
      hour: p.hour,
      minute: p.minute,
    })
    const w: WuXing = STEM_WU_XING[bazi.dayPillar.ganZhi.stem]
    push(wuXing, w, p.name)
    push(zodiac, zodiacOf(bazi.zodiac), p.name)
    push(xingZuo, westZodiac(p.birthMonth, p.birthDay), p.name)
  }

  return {
    total: persons.length,
    wuXing: toItems(wuXing),
    zodiac: toItems(zodiac),
    xingZuo: toItems(xingZuo),
  }
}

// ---------------- 谁补谁（五行互补） ----------------

/** 八字八字符（天干 + 地支本气）五行计数 */
function wuXing8(bazi: BaZiResult): Record<WuXing, number> {
  const count: Record<WuXing, number> = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 }
  for (const p of [bazi.yearPillar, bazi.monthPillar, bazi.dayPillar, bazi.hourPillar]) {
    if (!p) continue
    count[STEM_WU_XING[p.ganZhi.stem]]++
    count[BRANCH_WU_XING[p.ganZhi.branch]]++
  }
  return count
}

export interface Complement {
  from: Person // 旺、能补的一方
  to: Person // 缺、被补的一方
  wuXings: WuXing[] // from 旺、to 缺的五行
  text: string
}

/** 一群人里「谁补谁」：某人八字偏旺的五行，正好是另一个人完全缺的五行。 */
export function computeComplements(persons: Person[]): Complement[] {
  const infos = persons.map((p) => {
    const bazi = computeBaZi({
      year: p.birthYear,
      month: p.birthMonth,
      day: p.birthDay,
      hour: p.hour,
      minute: p.minute,
    })
    const count = wuXing8(bazi)
    const strong = WU_XING.filter((w) => count[w] >= 2)
    const weak = WU_XING.filter((w) => count[w] === 0)
    return { p, strong, weak }
  })

  const out: Complement[] = []
  for (let i = 0; i < infos.length; i++) {
    for (let j = i + 1; j < infos.length; j++) {
      const a = infos[i]
      const b = infos[j]
      const aGiveB = a.strong.filter((w) => b.weak.includes(w))
      const bGiveA = b.strong.filter((w) => a.weak.includes(w))
      if (aGiveB.length) {
        out.push({
          from: a.p,
          to: b.p,
          wuXings: aGiveB,
          text: `${a.p.name}的${aGiveB.join('、')}偏旺，正好补上${b.p.name}缺的${aGiveB.join('、')}`,
        })
      }
      if (bGiveA.length) {
        out.push({
          from: b.p,
          to: a.p,
          wuXings: bGiveA,
          text: `${b.p.name}的${bGiveA.join('、')}偏旺，正好补上${a.p.name}缺的${bGiveA.join('、')}`,
        })
      }
    }
  }
  return out
}
