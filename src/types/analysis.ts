// 合盘 / 关系发展 分析结果类型

import { Person } from './person'

export type Level = '合' | '较合' | '一般' | '需注意' | '冲'

/** 分析模式：合盘（只对伴侣） vs 关系发展（其他人） */
export type AnalysisMode = 'hepan' | 'guanxi'

/** 单个体系的分析结果 */
export interface SectionResult {
  system: string // 体系标识，如 'zodiac'
  systemLabel: string // 中文名，如 '生肖'
  score: number // -20 ~ 20
  level: Level
  points: string[] // 大白话要点
  missingNote?: string // 缺时辰等说明
}

/** 关系走势：单一年份的关键信号 */
export interface TrajectoryYear {
  year: number
  label: string // 如「2026 · 丙午」
  note: string // 大白话
  trend: 'up' | 'down' | 'mixed' | 'flat'
}

export interface Trajectory {
  years: TrajectoryYear[]
  summary: string // 总趋势一句话
}

export interface AnalysisResult {
  a: Person
  b: Person
  mode: AnalysisMode
  overallScore: number // 0 ~ 100，娱乐参考
  overallLevel: Level
  headline: string // 一句话总评
  sections: SectionResult[]
  advice: {
    fit: string // 合不合
    caution: string // 注意什么
    how: string // 怎么相处
  }
  missingNotes: string[] // 缺时辰等总体说明
  trajectory?: Trajectory // 关系走势（非伴侣「关系发展」时给出）
}
