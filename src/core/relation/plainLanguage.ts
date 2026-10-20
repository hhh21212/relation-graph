// 大白话文案生成：把规则结果翻译成人话，不堆术语。

import { Level, AnalysisMode } from '../../types/analysis'
import { WuXing, WuXingRelation } from '../rules/fiveElement'

/** 分数 → 合盘等级 */
export function scoreToLevel(score: number): Level {
  if (score >= 14) return '合'
  if (score >= 6) return '较合'
  if (score >= -5) return '一般'
  if (score >= -14) return '需注意'
  return '冲'
}

export const LEVEL_TEXT: Record<Level, string> = {
  合: '很合得来',
  较合: '比较合拍',
  一般: '平平淡淡',
  需注意: '需要磨合',
  冲: '容易冲突',
}

export const WU_XING_TEXT: Record<WuXing, string> = {
  金: '金',
  木: '木',
  水: '水',
  火: '火',
  土: '土',
}

/** 生肖关系 → 大白话 */
export function zodiacRelText(rel: string): string {
  switch (rel) {
    case '六合':
      return '属相六合，天生默契，相处轻松'
    case '三合':
      return '属相三合，气场相投，容易走到一起'
    case '六冲':
      return '属相相冲，脾气对顶，容易起摩擦'
    case '相害':
      return '属相相害，容易互相误会，需多解释'
    default:
      return ''
  }
}

/** 纳音五行关系 → 大白话 */
export function nayinRelText(a: WuXing, b: WuXing, rel: WuXingRelation): string {
  switch (rel) {
    case '同':
      return `${WU_XING_TEXT[a]}性相通，性子相像，容易理解对方`
    case '我生':
      return `你的${WU_XING_TEXT[a]}滋养对方的${WU_XING_TEXT[b]}，付出多`
    case '生我':
      return `对方的${WU_XING_TEXT[b]}滋养你的${WU_XING_TEXT[a]}，被照顾`
    case '我克':
      return `你的${WU_XING_TEXT[a]}克制对方的${WU_XING_TEXT[b]}，容易较劲`
    case '克我':
      return `对方的${WU_XING_TEXT[b]}克制你的${WU_XING_TEXT[a]}，有压力`
  }
}

/** 星座元素关系 → 大白话 */
export function westElementText(same: boolean, harmonious: boolean, challenging: boolean): string {
  if (same) return '星座同元素，聊得来，审美口味接近'
  if (harmonious) return '星座元素相生，一唱一和，比较搭'
  if (challenging) return '星座元素相克，看问题角度不同，需多换位'
  return '星座元素中立，靠日常相处慢慢磨合'
}

/** 灵数关系 → 大白话 */
export function numerologyText(sameGroup: boolean, hasMaster: boolean): string {
  const parts: string[] = []
  if (hasMaster) parts.push('有一方是大师数（11/22/33），更包容成熟')
  if (sameGroup) parts.push('生命灵数同频，价值观接近')
  else parts.push('生命灵数节奏不同，需要互相迁就')
  return parts.join('；')
}

/** 由等级生成总评一句话（合盘走感情口吻，关系发展走相处口吻） */
export function headlineFor(level: Level, aName: string, bName: string, mode: AnalysisMode = 'hepan'): string {
  if (mode === 'hepan') {
    switch (level) {
      case '合':
        return `${aName}和${bName}缘分很深，是能互相成就的一对`
      case '较合':
        return `${aName}和${bName}感情基础不错，大体合得来`
      case '一般':
        return `${aName}和${bName}感情平平，好坏都要看怎么经营`
      case '需注意':
        return `${aName}和${bName}感情里有几处要留个心眼，多磨合`
      case '冲':
        return `${aName}和${bName}脾气容易顶牛，相处要格外有耐心`
    }
  }
  switch (level) {
    case '合':
      return `${aName}和${bName}很合得来，是能互相成就的关系`
    case '较合':
      return `${aName}和${bName}相处比较顺，大体合拍`
    case '一般':
      return `${aName}和${bName}平平淡淡，好坏都要看怎么经营`
    case '需注意':
      return `${aName}和${bName}之间有些地方要留个心眼，多磨合`
    case '冲':
      return `${aName}和${bName}容易顶牛，相处要格外有耐心`
  }
}

/** 由等级 + 正负要点生成三段建议（合不合 / 注意什么 / 怎么相处） */
export function buildAdvice(
  level: Level,
  goodPoints: string[],
  badPoints: string[],
  mode: AnalysisMode = 'hepan',
): { fit: string; caution: string; how: string } {
  const subject = mode === 'hepan' ? '这段感情' : '这段关系'
  const fit =
    level === '合' || level === '较合'
      ? `${subject}整体合得来。` + (goodPoints[0] ? `${goodPoints[0]}。` : '')
      : level === '一般'
        ? `${subject}不算特别好也不差，属于需要用心经营的那种。`
        : `${subject}整体偏冲，需要花更多心思。` + (badPoints[0] ? `${badPoints[0]}。` : '')

  const caution = badPoints[0]
    ? `最要注意的是：${badPoints[0]}。遇到这类事别急着下结论。`
    : '没有特别明显的雷区，保持真诚就好。'

  const how = goodPoints[0]
    ? `平时可以多发挥「${goodPoints[0].split('，')[0]}」这一点，扬长避短。`
    : '多给彼此一点空间和时间，慢慢磨合。'

  return { fit, caution, how }
}
