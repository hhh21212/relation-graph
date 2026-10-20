// 星座相位格局：大三角 / T三角 / 大十字 / 风筝 / 星群。仅供娱乐参考。
import { aspectBetween } from './aspects'
import { SIGNS } from './data'
import { signIndexFromLon } from './astro'

export interface AspectPattern {
  name: string
  bodies: string[]
  desc: string
}

export function detectAspectPatterns(lons: Record<string, number>): AspectPattern[] {
  const keys = Object.keys(lons)
  const rel = (a: string, b: string) => aspectBetween(lons[a], lons[b])?.key
  const out: AspectPattern[] = []

  // 大三角：三颗星两两三分相
  for (let i = 0; i < keys.length; i++)
    for (let j = i + 1; j < keys.length; j++)
      for (let k = j + 1; k < keys.length; k++) {
        if (rel(keys[i], keys[j]) === 'trine' && rel(keys[j], keys[k]) === 'trine' && rel(keys[i], keys[k]) === 'trine') {
          out.push({ name: '大三角', bodies: [keys[i], keys[j], keys[k]], desc: '三颗星两两三分相，天赋顺遂、事半功倍，是盘里最舒服的和谐格局。' })
        }
      }

  // 星群：三颗以上同座
  const bySign: Record<number, string[]> = {}
  for (const k of keys) {
    const s = signIndexFromLon(lons[k])
    ;(bySign[s] ??= []).push(k)
  }
  for (const s of Object.keys(bySign)) {
    const n = Number(s)
    if (bySign[n].length >= 3) {
      out.push({ name: `星群·${SIGNS[n].name}`, bodies: bySign[n], desc: `三颗以上星体聚于${SIGNS[n].name}，该座能量被极度强化，成为盘里最鲜明的主轴。` })
    }
  }

  // T三角：一对对冲 + 各自与第三星四分相
  for (let i = 0; i < keys.length; i++)
    for (let j = i + 1; j < keys.length; j++) {
      if (rel(keys[i], keys[j]) !== 'opposition') continue
      for (let k = 0; k < keys.length; k++) {
        if (k === i || k === j) continue
        if (rel(keys[i], keys[k]) === 'square' && rel(keys[j], keys[k]) === 'square') {
          out.push({ name: 'T三角', bodies: [keys[i], keys[j], keys[k]], desc: '两星对冲、同被第三星四分，是内在张力最强的压力格局，逼人突破与成长。' })
        }
      }
    }

  // 大十字：两对对冲，四星两两四分
  for (let i = 0; i < keys.length; i++)
    for (let j = i + 1; j < keys.length; j++) {
      if (rel(keys[i], keys[j]) !== 'opposition') continue
      for (let k = i + 1; k < keys.length; k++)
        for (let l = k + 1; l < keys.length; l++) {
          if (k === j || l === j || k === i || l === i) continue
          if (rel(keys[k], keys[l]) === 'opposition') {
            const cross = [rel(keys[i], keys[k]), rel(keys[i], keys[l]), rel(keys[j], keys[k]), rel(keys[j], keys[l])]
            if (cross.every((x) => x === 'square')) {
              out.push({ name: '大十字', bodies: [keys[i], keys[j], keys[k], keys[l]], desc: '两对对冲、四星两两四分，四面受力的格局，能量巨大也最磨人，适合扛大任。' })
            }
          }
        }
    }

  // 风筝：大三角 + 第四星与其中一星对冲
  for (let i = 0; i < keys.length; i++)
    for (let j = i + 1; j < keys.length; j++)
      for (let k = j + 1; k < keys.length; k++) {
        if (rel(keys[i], keys[j]) !== 'trine' || rel(keys[j], keys[k]) !== 'trine' || rel(keys[i], keys[k]) !== 'trine') continue
        for (let m = 0; m < keys.length; m++) {
          if (m === i || m === j || m === k) continue
          const oppCount = [i, j, k].filter((x) => rel(keys[x], keys[m]) === 'opposition').length
          if (oppCount === 1) {
            out.push({ name: '风筝', bodies: [keys[i], keys[j], keys[k], keys[m]], desc: '大三角加一个对冲顶点，天赋之上再添一份冲刺目标，是能展翅高飞的格局。' })
          }
        }
      }

  // 去重（按 名称 + 星体集合）
  const seen = new Set<string>()
  return out.filter((p) => {
    const sig = p.name + '|' + [...p.bodies].sort().join(',')
    if (seen.has(sig)) return false
    seen.add(sig)
    return true
  })
}
