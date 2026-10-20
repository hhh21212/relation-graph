// 号码吉凶：手机号/车牌/QQ 等数字 → 80 数理 + 五行 + 趣味评分。仅供娱乐参考。

import { shuLiOf, wuxingOf, type JiXiong } from './shuli'

export interface NumberResult {
  digits: string
  liShu: number // 1-81 数理
  ji: JiXiong
  wuxing: string
  score: number // 0-100
  level: '吉' | '平' | '凶'
  text: string
}

const JI_SCORE: Record<JiXiong, number> = { 大吉: 92, 吉: 78, 半吉: 58, 凶: 32 }

export function computeNumber(raw: string): NumberResult | null {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null

  // 取末 4 位（不足则用全部），按 80 数理法取数理
  const key = digits.length >= 4 ? digits.slice(-4) : digits
  let liShu = parseInt(key, 10) % 80
  if (liShu === 0) liShu = 80
  const item = shuLiOf(liShu)

  const score = JI_SCORE[item.ji]
  const level: NumberResult['level'] = score >= 70 ? '吉' : score <= 45 ? '凶' : '平'

  const text =
    item.ji === '大吉' || item.ji === '吉'
      ? `${item.text}，号主人缘与运势较为顺遂。`
      : item.ji === '半吉'
        ? `${item.text}，好坏参半，宜结合自身努力。`
        : `${item.text}，传统说法较不理想，理性看待、不必过度在意。`

  return { digits, liShu, ji: item.ji, wuxing: wuxingOf(liShu), score, level, text }
}
