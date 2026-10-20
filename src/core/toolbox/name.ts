// 姓名五格测试：天格/人格/地格/外格/总格 → 81 数理吉凶 + 五行。
// 笔画按简体字、未收录字按 10 画估算，仅供娱乐参考。

import { charStrokes, hasUnknownChar } from './strokes'
import { shuLiOf, wuxingOf, type JiXiong } from './shuli'

export interface GeResult {
  name: string // 格名
  n: number // 数理
  ji: JiXiong
  wuxing: string
  text: string
}

export interface WuGeResult {
  ges: GeResult[]
  totalJi: number // 吉格数量
  level: '大吉' | '吉' | '中平' | '需留意'
  summary: string
  estimated: boolean
}

function ge(name: string, n: number): GeResult {
  const s = shuLiOf(n)
  return { name, n, ji: s.ji, wuxing: wuxingOf(n), text: s.text }
}

export function computeWuGe(surname: string, given: string): WuGeResult {
  const x = surname.trim()
  const m = given.trim()
  if (!x || !m) {
    return {
      ges: [],
      totalJi: 0,
      level: '中平',
      summary: '请输入姓氏与名字。',
      estimated: false,
    }
  }

  const xChars = [...x]
  const mChars = [...m]
  const sx = charStrokes(xChars[xChars.length - 1]) // 姓氏末字
  const mx = charStrokes(mChars[0]) // 名字首字
  const sSum = [...x].reduce((a, c) => a + charStrokes(c), 0)
  const mSum = [...m].reduce((a, c) => a + charStrokes(c), 0)
  const total = sSum + mSum

  const tian = ge('天格', xChars.length === 1 ? sSum + 1 : sSum)
  const ren = ge('人格', sx + mx)
  const di = ge('地格', mChars.length === 1 ? mSum + 1 : mSum)
  const wai = ge('外格', total - (sx + mx) + 1)
  const zong = ge('总格', total)

  const ges = [tian, ren, di, wai, zong]
  const totalJi = ges.filter((g) => g.ji === '大吉' || g.ji === '吉').length

  let level: WuGeResult['level']
  let summary: string
  if (totalJi >= 4) {
    level = '大吉'
    summary = '五格中多数为吉，整体格局顺遂，是个朗朗上口又有好寓意的好名字。'
  } else if (totalJi >= 3) {
    level = '吉'
    summary = '整体格局不错，虽有少量瑕疵，但瑕不掩瑜，是较为理想的名字。'
  } else if (totalJi >= 2) {
    level = '中平'
    summary = '吉凶参半，格局平平。若在意数理，可在个别字上稍作调整。'
  } else {
    level = '需留意'
    summary = '五格偏凶，传统上建议留意。仅供参考，名字更重要的是本人喜欢、寓意美好。'
  }

  return { ges, totalJi, level, summary, estimated: hasUnknownChar(x + m) }
}
