// 星座行星相位（Aspects）：日/月/水金火木土 + 上升点两两夹角 → 合/六分/四分/三分/对冲。仅供娱乐参考。
import { jdFromDate, sunLongitude, moonLongitude, ascendant, planetLongitude, type PlanetKey } from './astro'

export type AspectKey = 'conj' | 'sextile' | 'square' | 'trine' | 'opposition'

export interface AspectDef {
  key: AspectKey
  name: string
  symbol: string
  angle: number
  orb: number // 容许度（度）
  nature: '吉' | '凶' | '调和'
  desc: string
}

export const ASPECTS: AspectDef[] = [
  { key: 'conj', name: '合相', symbol: '☌', angle: 0, orb: 8, nature: '调和', desc: '两星能量融合、特质被强化，是盘里最集中、最强的一股力量点。' },
  { key: 'sextile', name: '六分相', symbol: '⚹', angle: 60, orb: 6, nature: '吉', desc: '轻松的机会与助力，才艺与资源的和谐互动，主动一点就能兑现。' },
  { key: 'square', name: '四分相', symbol: '□', angle: 90, orb: 8, nature: '凶', desc: '内在的张力与摩擦，总在逼你突破与成长，是盘里的「压力发动机」。' },
  { key: 'trine', name: '三分相', symbol: '△', angle: 120, orb: 8, nature: '吉', desc: '天赋与顺遂的和谐相位，做事事半功倍，但也容易因太顺而懈怠。' },
  { key: 'opposition', name: '对冲相', symbol: '☍', angle: 180, orb: 8, nature: '凶', desc: '两股力量相互拉扯，常投射到关系与抉择上，需要学会平衡与取舍。' },
]

export const BODIES: Record<string, string> = {
  sun: '太阳',
  moon: '月亮',
  mercury: '水星',
  venus: '金星',
  mars: '火星',
  jupiter: '木星',
  saturn: '土星',
  asc: '上升',
}

export interface ChartAspect {
  a: string
  b: string
  aspect: AspectDef
  orb: number // 与精确角度的偏差（度）
}

// 两黄经之间的相位（命中返回 AspectDef，否则 null）
export function aspectBetween(lonA: number, lonB: number): AspectDef | null {
  let d = ((lonB - lonA) % 360 + 360) % 360
  if (d > 180) d = 360 - d
  for (const a of ASPECTS) {
    if (Math.abs(d - a.angle) <= a.orb) return a
  }
  return null
}

// 一组黄经（key -> 度）两两求相位，按容许度偏差升序（越紧越靠前）。
export function computeAspects(lons: Record<string, number>): ChartAspect[] {
  const keys = Object.keys(lons)
  const out: ChartAspect[] = []
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const a = keys[i]
      const b = keys[j]
      const aspect = aspectBetween(lons[a], lons[b])
      if (!aspect) continue
      let d = ((lons[b] - lons[a]) % 360 + 360) % 360
      if (d > 180) d = 360 - d
      out.push({ a, b, aspect, orb: Math.abs(d - aspect.angle) })
    }
  }
  return out.sort((x, y) => x.orb - y.orb)
}

// 两人星盘交叉相位：A 的每颗星 × B 的每颗星，命中即保留（a = A 的星，b = B 的星）。
export function crossAspects(lonsA: Record<string, number>, lonsB: Record<string, number>): ChartAspect[] {
  const out: ChartAspect[] = []
  for (const a of Object.keys(lonsA)) {
    for (const b of Object.keys(lonsB)) {
      const aspect = aspectBetween(lonsA[a], lonsB[b])
      if (!aspect) continue
      let d = ((lonsB[b] - lonsA[a]) % 360 + 360) % 360
      if (d > 180) d = 360 - d
      out.push({ a, b, aspect, orb: Math.abs(d - aspect.angle) })
    }
  }
  return out.sort((x, y) => x.orb - y.orb)
}

export interface BirthPlace {
  year: number
  month: number
  day: number
  hour?: number
  lat?: number
  lng?: number
  tz?: number
}

// 出生信息 → 各天体黄经（key -> 度）；无时辰/出生地时不排上升点。
export function chartLongitudes(b: BirthPlace): Record<string, number> {
  const h = b.hour ?? 0
  const jd = jdFromDate(b.year, b.month, b.day, h)
  const out: Record<string, number> = {
    sun: sunLongitude(jd),
    moon: moonLongitude(jd),
    mercury: planetLongitude(jd, 'mercury'),
    venus: planetLongitude(jd, 'venus'),
    mars: planetLongitude(jd, 'mars'),
    jupiter: planetLongitude(jd, 'jupiter'),
    saturn: planetLongitude(jd, 'saturn'),
  }
  if (b.hour !== undefined && b.lat !== undefined && b.lng !== undefined) {
    out.asc = ascendant(jdFromDate(b.year, b.month, b.day, b.hour - (b.tz ?? 8)), b.lat, b.lng)
  }
  return out
}
