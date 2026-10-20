// 星座星盘模式占比：本位（开创）/ 固定 / 变动 三态分布。仅供娱乐参考。
import { signIndexFromLon } from './astro'

export interface ModeStat {
  mode: string
  count: number
  pct: number
}

const MODE_ORDER = ['本位', '固定', '变动'] as const

// 十二星座三态：白羊0 … 双鱼11
const MODE_OF = [
  '本位', '固定', '变动', '本位', '固定', '变动',
  '本位', '固定', '变动', '本位', '固定', '变动',
]

export function modeDistribution(lons: Record<string, number>): ModeStat[] {
  const counts: Record<string, number> = { 本位: 0, 固定: 0, 变动: 0 }
  const keys = Object.keys(lons)
  for (const k of keys) {
    counts[MODE_OF[signIndexFromLon(lons[k])]]++
  }
  const total = keys.length || 1
  return MODE_ORDER.map((m) => ({ mode: m, count: counts[m], pct: Math.round((counts[m] / total) * 100) }))
}

const MODE_NATURE: Record<string, string> = {
  本位: '开创型：主动出击、喜欢开疆拓土，适合从 0 到 1 的起步阶段。',
  固定: '坚持型：稳定执着、一旦认定就不轻易动摇，擅长深耕与守成。',
  变动: '变通型：灵活适应、善变多才，擅长应对变化与调整方向。',
}

export function modeReading(stats: ModeStat[]): string {
  const max = stats.reduce((a, b) => (b.count > a.count ? b : a))
  return `全盘以${max.mode}模式为主（占 ${max.pct}%）：${MODE_NATURE[max.mode]}`
}
