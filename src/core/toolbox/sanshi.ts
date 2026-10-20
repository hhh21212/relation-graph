// 三世姻缘：按双方生肖的六合/三合/相冲/相害，给前世今生缘分与可分享文案。仅供娱乐参考。

import { isLiuHe, isSanHe, isLiuChong, isXiangHai } from '../rules/ganzhi'
import { ZODIAC_ANIMALS } from '../rules/zodiac'

export interface SanShiResult {
  aName: string
  bName: string
  relation: string
  level: '上等缘' | '中上缘' | '中等缘' | '需磨合'
  score: number
  text: string
  share: string
}

/** 公历年 → 生肖地支（0=鼠 … 11=猪，娱乐口径） */
export function branchOfYear(year: number): number {
  return ((year - 4) % 12 + 12) % 12
}

export function computeSanShi(a: number, b: number): SanShiResult {
  const aName = ZODIAC_ANIMALS[a]
  const bName = ZODIAC_ANIMALS[b]

  let relation: string
  let level: SanShiResult['level']
  let score: number
  let text: string

  if (isLiuHe(a, b)) {
    relation = '六合'
    level = '上等缘'
    score = 95
    text = `属${aName}与属${bName}互为六合，是天生一对的绝配组合。前世或许已是知己，今生重逢格外默契，相处轻松、彼此成就，感情与事业都容易互相成就。`
  } else if (isSanHe(a, b)) {
    relation = '三合'
    level = '中上缘'
    score = 85
    text = `属${aName}与属${bName}为三合，气场相投、志趣相合。你们像是旧识重逢，相处自然、互有助益，是越处越顺、值得珍惜的好缘分。`
  } else if (isLiuChong(a, b)) {
    relation = '相冲'
    level = '需磨合'
    score = 45
    text = `属${aName}与属${bName}相冲，性格与节奏差异较大，前世或有一段未解的对立。今生需要更多耐心与理解，磨合过后也能互补，但需用心经营。`
  } else if (isXiangHai(a, b)) {
    relation = '相害'
    level = '需磨合'
    score = 50
    text = `属${aName}与属${bName}相害，容易产生误会与摩擦。彼此并无恶意，却常因小事起疙瘩。多沟通、少猜疑，坦诚相待才能化解这份牵绊。`
  } else {
    relation = '平缘'
    level = '中等缘'
    score = 68
    text = `属${aName}与属${bName}既不相合也不相冲，是一段平平淡淡、细水长流的缘分。没有大起大落，反而安稳长久，靠的是彼此的珍惜与经营。`
  }

  const share = `【三世姻缘】属${aName} × 属${bName}：${relation} · ${level}（${score}分）。${text}`

  return { aName, bName, relation, level, score, text, share }
}
