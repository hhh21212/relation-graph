// 星座四元素占比：统计全盘星体落座的火土风水分布，输出占比与白话解读。仅供娱乐参考。
import { SIGNS } from './data'
import { signIndexFromLon } from './astro'

export interface ElementStat {
  element: string
  count: number
  pct: number
}

const ELEMENT_ORDER = ['火', '土', '风', '水'] as const

// 一组黄经（key -> 度）→ 四元素计数与占比。
export function elementDistribution(lons: Record<string, number>): ElementStat[] {
  const counts: Record<string, number> = { 火: 0, 土: 0, 风: 0, 水: 0 }
  const keys = Object.keys(lons)
  for (const k of keys) {
    const el = SIGNS[signIndexFromLon(lons[k])].element
    counts[el]++
  }
  const total = keys.length || 1
  return ELEMENT_ORDER.map((e) => ({ element: e, count: counts[e], pct: Math.round((counts[e] / total) * 100) }))
}

const ELEMENT_NATURE: Record<string, string> = {
  火: '行动力与热情旺盛，做事有冲劲、直来直往，但要注意别太急躁。',
  土: '务实稳重、重视安全感，脚踏实地能扛事，但略偏保守。',
  风: '思维活跃、善于沟通与社交，好奇心强，但容易三分钟热度。',
  水: '情感细腻、直觉敏锐、重感受与共情，但容易多愁善感。',
}

const ELEMENT_MISS: Record<string, string> = {
  火: '缺火则行动力与热情稍欠，容易想得多、做得少。',
  土: '缺土则现实感与定力偏弱，建议建立稳定作息与目标。',
  风: '缺风则沟通与变通略逊，多表达、多换位思考有帮助。',
  水: '缺水则情感偏理性，试着多关注内心感受与共情。',
}

export function elementReading(stats: ElementStat[]): string {
  const max = stats.reduce((a, b) => (b.count > a.count ? b : a))
  const missing = stats.filter((s) => s.count === 0).map((s) => s.element)
  let out = `${max.element}象最突出（占 ${max.pct}%）：${ELEMENT_NATURE[max.element]}`
  if (missing.length > 0) {
    out += ` 盘中缺少${missing.join('、')}象：${missing.map((m) => ELEMENT_MISS[m]).join('')}`
  }
  return out
}
