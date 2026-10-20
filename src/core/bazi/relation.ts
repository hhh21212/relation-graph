// 神煞白话 + 八字内部合冲刑害（天干五合、地支六合/三合/六冲/相害）。仅供娱乐参考。

import { BaZiResult } from '../rules/bazi'
import {
  isTianGanHe,
  isLiuHe,
  isSanHe,
  isLiuChong,
  isXiangHai,
  STEMS,
  BRANCHES,
} from '../rules/ganzhi'

// 神煞 → 一句白话（去前缀后的概念名）
const SHENSHA_MEANING: Record<string, string> = {
  天乙贵人: '遇难有贵人相助，人缘好、易得提携',
  文昌: '聪明好学、利考试文书',
  禄: '正财禄位，衣食无忧',
  羊刃: '个性刚烈、行动力强，但易冲动',
  金舆: '利出行，有车马之福',
  国印: '稳重守规矩，近公门书香',
  驿马: '好动奔波，利外出发展',
  桃花: '人缘异性缘佳，有魅力',
  华盖: '孤高有才，带宗教艺术缘分',
  劫煞: '易破财，有小人是非',
  亡神: '心思耗散，易操劳不宁',
  将星: '有领导统御之才',
  灾煞: '易有突发变故，需谨慎',
  红鸾: '利姻缘，桃花正缘',
  天喜: '喜事临门，利婚恋',
  孤辰: '独立性强，易感孤单',
  寡宿: '独处自足，晚婚或重精神',
  空亡: '逢空多变，事难落实',
  魁罡: '性格刚强有魄力，不服输',
  阴阳差错: '婚恋易有波折，须多磨合',
  天罗: '辰为天罗，行事宜守不宜冲',
  地网: '戌为地网，遇事易有牵绊',
}

export interface ShenShaReading {
  name: string
  text: string
}

/** 神煞名 → 白话（未知神煞给通用解释） */
export function shenShaMeaning(names: string[]): ShenShaReading[] {
  return names.map((n) => {
    const clean = n.replace(/^(年支|日支|年干|日干)/, '')
    return { name: clean, text: SHENSHA_MEANING[clean] ?? '命带此神煞，主相关层面有其信号' }
  })
}

export interface GanZhiRelItem {
  kind: '天干五合' | '地支六合' | '地支三合' | '地支六冲' | '地支相害'
  a: string // 如「年干甲」
  b: string
  text: string
}

const PILLAR_LABEL = ['年', '月', '日', '时'] as const

const HE_WU_XING: Record<string, string> = {
  '甲己': '土', '乙庚': '金', '丙辛': '水', '丁壬': '木', '戊癸': '火',
}

function ganLabel(gz: { stem: number }, i: number): string {
  return `${PILLAR_LABEL[i]}干${STEMS[gz.stem]}`
}
function zhiLabel(gz: { branch: number }, i: number): string {
  return `${PILLAR_LABEL[i]}支${BRANCHES[gz.branch]}`
}

/** 八字四柱内部的天干五合 / 地支六合三合六冲相害，逐条列出（含白话）。 */
export function computeGanZhiRel(bazi: BaZiResult): GanZhiRelItem[] {
  const gz = [bazi.yearPillar, bazi.monthPillar, bazi.dayPillar, bazi.hourPillar]
  const out: GanZhiRelItem[] = []

  // 天干五合（相邻优先，但这里列出所有命中的合）
  for (let i = 0; i < gz.length; i++) {
    for (let j = i + 1; j < gz.length; j++) {
      const a = gz[i]
      const b = gz[j]
      if (!a || !b) continue
      if (isTianGanHe(a.ganZhi.stem, b.ganZhi.stem)) {
        const key = [STEMS[a.ganZhi.stem], STEMS[b.ganZhi.stem]].sort().join('')
        const hua = HE_WU_XING[key] ?? '合'
        out.push({
          kind: '天干五合',
          a: ganLabel(a.ganZhi, i),
          b: ganLabel(b.ganZhi, j),
          text: `${ganLabel(a.ganZhi, i)} 与 ${ganLabel(b.ganZhi, j)} 相合（化${hua}），主有情、易得合作缘分。`,
        })
      }
    }
  }

  // 地支关系
  for (let i = 0; i < gz.length; i++) {
    for (let j = i + 1; j < gz.length; j++) {
      const a = gz[i]
      const b = gz[j]
      if (!a || !b) continue
      const az = a.ganZhi.branch
      const bz = b.ganZhi.branch
      if (isLiuChong(az, bz)) {
        out.push({ kind: '地支六冲', a: zhiLabel(a.ganZhi, i), b: zhiLabel(b.ganZhi, j), text: `${zhiLabel(a.ganZhi, i)} 与 ${zhiLabel(b.ganZhi, j)} 相冲，主变动、奔波、分离，宜稳不宜急。` })
      } else if (isXiangHai(az, bz)) {
        out.push({ kind: '地支相害', a: zhiLabel(a.ganZhi, i), b: zhiLabel(b.ganZhi, j), text: `${zhiLabel(a.ganZhi, i)} 与 ${zhiLabel(b.ganZhi, j)} 相害，主暗耗、误会，人际须多沟通。` })
      } else if (isLiuHe(az, bz)) {
        out.push({ kind: '地支六合', a: zhiLabel(a.ganZhi, i), b: zhiLabel(b.ganZhi, j), text: `${zhiLabel(a.ganZhi, i)} 与 ${zhiLabel(b.ganZhi, j)} 六合，主顺遂、有贵人、气场相投。` })
      } else if (isSanHe(az, bz)) {
        out.push({ kind: '地支三合', a: zhiLabel(a.ganZhi, i), b: zhiLabel(b.ganZhi, j), text: `${zhiLabel(a.ganZhi, i)} 与 ${zhiLabel(b.ganZhi, j)} 三合，主同盟、助力，同气连枝。` })
      }
    }
  }

  return out
}
