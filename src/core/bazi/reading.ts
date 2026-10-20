// 八字综合白话：日主强弱用神 + 格局 + 神煞 + 合冲，拼成一段连贯论命。仅供娱乐参考。

import { computeBaZi, BirthTime } from '../rules/bazi'
import { computeZiPing } from '../rules/ziPing'
import { computeLuMing } from '../rules/luming'
import { computeGeJu } from './geju'
import { computeGanZhiRel } from './relation'

export function baziComprehensive(input: BirthTime): string {
  const zp = computeZiPing(input)
  const lm = computeLuMing(input)
  const gj = computeGeJu(input)

  // 日主与用神
  const yong = zp.yongShenWuXing.length
    ? `喜用「${zp.yongShenWuXing.join('、')}」`
    : '喜用平衡'
  const head = `${zp.dayMasterLabel}日主，身${zp.shenQiang}，${yong}。`

  // 格局
  const geju = `月令本气${gj.benQi}（${gj.benQiShiShen}）${gj.touGan ? '且透干' : ''}，取「${gj.name}」：${gj.text}`

  // 神煞
  const ss = lm.shenShaAll
  const shenSha = ss.length > 0
    ? `命带${ss.join('、')}，各有其信号。`
    : '命盘神煞不显，格局以五行喜忌为主。'

  // 合冲
  const rel = computeGanZhiRel(computeBaZi(input))
  const relText = rel.length > 0 ? `四柱内部见${rel.map((r) => r.text).join('')}` : '四柱内部无明显合冲，格局平稳。'

  return `${head}${geju}。${shenSha}${relText}`
}
