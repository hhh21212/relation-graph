// 五行（金木水火土）与相生相克关系。

export type WuXing = '金' | '木' | '水' | '火' | '土'

export const WU_XING: WuXing[] = ['金', '木', '水', '火', '土']

// 相生环：金→水→木→火→土→金
const GENERATES: Record<WuXing, WuXing> = { 金: '水', 水: '木', 木: '火', 火: '土', 土: '金' }
// 相克环：金→木→土→水→火→金
const OVERCOMES: Record<WuXing, WuXing> = { 金: '木', 木: '土', 土: '水', 水: '火', 火: '金' }

export type WuXingRelation = '同' | '我生' | '生我' | '我克' | '克我'

/** 判断 a 是否生 b */
export function generates(a: WuXing, b: WuXing): boolean {
  return GENERATES[a] === b
}

/** 判断 a 是否克 b */
export function overcomes(a: WuXing, b: WuXing): boolean {
  return OVERCOMES[a] === b
}

/** a 相对 b 的五行关系（从 a 的视角） */
export function wuXingRelation(a: WuXing, b: WuXing): WuXingRelation {
  if (a === b) return '同'
  if (GENERATES[a] === b) return '我生'
  if (GENERATES[b] === a) return '生我'
  if (OVERCOMES[a] === b) return '我克'
  return '克我'
}

/** 由单字取五行（金/木/水/火/土） */
export function wuXingFromChar(c: string): WuXing {
  return c as WuXing
}

// 十天干对应的五行（0=甲 … 9=癸）：甲乙木、丙丁火、戊己土、庚辛金、壬癸水
export const STEM_WU_XING: WuXing[] = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水']

// 十二地支本气五行（0=子 … 11=亥）：子水、丑土、寅木、卯木、辰土、巳火、午火、未土、申金、酉金、戌土、亥水
export const BRANCH_WU_XING: WuXing[] = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水']
