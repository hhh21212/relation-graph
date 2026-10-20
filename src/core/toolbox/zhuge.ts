// 诸葛神算：输入三字（或数字），按笔画得签号（1-384），对应 64 卦 × 6 爻 取签。
// 卦辞复用六爻的 64 卦白话，仅供娱乐参考。

import { HEXAGRAMS } from '../liuyao/data'
import { charStrokes } from './strokes'

const YAO_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'] as const

export interface ZhuGeResult {
  number: number // 签号 1-384
  hexName: string
  yao: string
  ji: string
  text: string
  inputText: string
}

export function computeZhuGe(input: string): ZhuGeResult | null {
  const chars = [...input.trim()].filter((ch) => /\S/.test(ch))
  if (chars.length === 0) return null

  // 取前三个字的笔画，拼接成数，再折算到 1-384
  const nums = chars.slice(0, 3).map((ch) => charStrokes(ch))
  let n = parseInt(nums.join(''), 10)
  if (Number.isNaN(n) || n <= 0) n = nums.reduce((a, b) => a + b, 0)
  n = n % 384
  if (n === 0) n = 384

  const hexIdx = Math.floor((n - 1) / 6)
  const yaoIdx = (n - 1) % 6
  const hex = HEXAGRAMS[hexIdx]

  return {
    number: n,
    hexName: hex.name,
    yao: YAO_NAMES[yaoIdx],
    ji: hex.ji,
    text: hex.yi,
    inputText: chars.slice(0, 3).join(''),
  }
}
