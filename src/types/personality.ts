// 性格画像类型：一个人（或两人）的性格与相处建议，大白话、娱乐参考。
// 日主/十神/旺衰/长生走「子平（日干）」；三命/主本/神煞/纳音走「禄命（年柱）」，并参不混。

import { WuXing } from '../core/rules/fiveElement'
import { ShiShenCategory } from './luming'

export interface PersonalityProfile {
  /** 日主（日干）气质：八字里最核心的性格信号（子平） */
  dayMaster: {
    label: string // 如「戊土」
    nature: string // 一句话气质，如「像山岳大地，稳重、厚道、靠得住」
    traits: string[] // 性格特点（大白话）
  }
  /** 五行气质：哪个旺、哪个弱 */
  wuXing: {
    strong: WuXing[]
    weak: WuXing[]
    lines: string[]
  }
  /** 三命（禄命身）：禄=年干、命=年支、身=年纳音 */
  sanMing: {
    lu: string // 年干
    ming: string // 年支
    shen: string // 年柱纳音
    text: string // 一句话总结
  }
  /** 主本：年柱（先天）vs 日柱（后天） */
  mainBen: {
    rel: string
    text: string
  }
  /** 十神分布 + 主导十神的大白话性格 */
  shiShen: {
    count: Record<ShiShenCategory, number>
    dominant: ShiShenCategory
    dominantText: string
  }
  /** 命中神煞 → 大白话标签 */
  shenSha: {
    names: string[]
    lines: string[]
  }
  /** 五行阴阳（金口诀式）一句话 */
  wuXingYinYang: {
    line: string
  }
  zodiac: { animal: string; traits: string[] }
  west: { sign: string; traits: string[] }
  numerology: { number: number; traits: string[] }
  /** 一句话总结 */
  summary: string
  /** 怎么和这个人相处 */
  getAlongTips: string[]
}
