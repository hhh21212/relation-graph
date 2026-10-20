// 子平法（日主强弱 → 用神）：主流「扶抑法」。
//
// 判日主强弱：把四柱八字的「同党（比劫 + 印）vs 异党（食伤 + 财 + 官杀）」数一遍，
// 月令（得令）额外加权。同党 ≥ 异党 → 身强；否则身弱。
//   - 得令：月支五行 生 / 同 日主。
//   - 得地 / 得势：已并入「八字八字符的五行分布」里（天干 + 地支本气）。
//
// 取用神：
//   - 身弱 → 宜「生扶」，喜用 = 印（生我）+ 比劫（同我）；忌 = 克泄耗。
//   - 身强 → 宜「克泄耗」，喜用 = 官杀（克我）+ 食伤（我生）+ 财（我克）；忌 = 生扶。
//
// 只按最主流的扶抑法，不引入调候/通关/格局等流派；结果仅供娱乐参考。

import { Stem, STEMS, BRANCHES } from './ganzhi'
import { WuXing, WU_XING, STEM_WU_XING, BRANCH_WU_XING, generates, overcomes } from './fiveElement'
import { computeBaZi, BirthTime, Pillar } from './bazi'

export interface ZiPingResult {
  dayMasterStem: Stem
  dayMasterWuXing: WuXing
  dayMasterLabel: string // 如「癸水」
  shenQiang: '强' | '弱'
  tong: number // 同党数
  yi: number // 异党数
  deLing: boolean // 是否得令
  yongShenWuXing: WuXing[] // 喜用五行
  jiShenWuXing: WuXing[] // 忌神五行
  text: string // 大白话
}

/** 生 w 的五行（印） */
function shengBy(w: WuXing): WuXing {
  return WU_XING.find((x) => generates(x, w))!
}
/** 克 w 的五行（官杀） */
function keBy(w: WuXing): WuXing {
  return WU_XING.find((x) => overcomes(x, w))!
}
/** w 所生的五行（食伤） */
function shengOf(w: WuXing): WuXing {
  return WU_XING.find((x) => generates(w, x))!
}
/** w 所克的五行（财） */
function keOf(w: WuXing): WuXing {
  return WU_XING.find((x) => overcomes(w, x))!
}

function dedup(ws: WuXing[]): WuXing[] {
  return WU_XING.filter((w) => ws.includes(w))
}

const WU_XING_LABEL: Record<WuXing, string> = { 金: '金', 木: '木', 水: '水', 火: '火', 土: '土' }

export function computeZiPing(input: BirthTime): ZiPingResult {
  const bazi = computeBaZi(input)
  const d = bazi.dayPillar.ganZhi.stem
  const dw = STEM_WU_XING[d]
  const monthBranch = bazi.monthPillar.ganZhi.branch
  const monthWuXing = BRANCH_WU_XING[monthBranch]

  // 得令：月令 生/同 日主
  const deLing = monthWuXing === dw || generates(monthWuXing, dw)

  // 八字八字符（天干 + 地支本气）数同党 / 异党
  const pillars = [bazi.yearPillar, bazi.monthPillar, bazi.dayPillar, bazi.hourPillar].filter(
    (p): p is Pillar => p !== null,
  )
  let tong = 0
  let yi = 0
  for (const p of pillars) {
    for (const w of [STEM_WU_XING[p.ganZhi.stem], BRANCH_WU_XING[p.ganZhi.branch]]) {
      if (w === dw || generates(w, dw)) tong++ // 比劫 / 印
      else yi++ // 食伤 / 财 / 官杀
    }
  }
  if (deLing) tong++ // 月令得令，额外加权

  const shenQiang: '强' | '弱' = tong >= yi ? '强' : '弱'

  // 取用神
  const yin = shengBy(dw) // 生我
  const biJie = dw // 同我
  const guanSha = keBy(dw) // 克我
  const shiShang = shengOf(dw) // 我生
  const cai = keOf(dw) // 我克

  const yongShenWuXing = shenQiang === '弱' ? dedup([yin, biJie]) : dedup([guanSha, shiShang, cai])
  const jiShenWuXing = shenQiang === '弱' ? dedup([guanSha, shiShang, cai]) : dedup([yin, biJie])

  const label = `${STEMS[d]}${WU_XING_LABEL[dw]}`
  const monthName = BRANCHES[monthBranch]
  const text =
    shenQiang === '弱'
      ? `${label}在${monthName}月${deLing ? '得令' : '失令'}，八字里帮身的少、耗身的偏多，整体身弱。身弱宜生扶：多借「${yongShenWuXing.map((w) => WU_XING_LABEL[w]).join('、')}」的力，靠学习、靠伙伴、靠安稳积累，别硬撑。`
      : `${label}在${monthName}月${deLing ? '得令' : '失令'}，八字里帮身的偏多，整体身强。身强宜把劲用出去：顺「${yongShenWuXing.map((w) => WU_XING_LABEL[w]).join('、')}」的方向去干、去闯、去经营，反而顺。`

  return {
    dayMasterStem: d,
    dayMasterWuXing: dw,
    dayMasterLabel: label,
    shenQiang,
    tong,
    yi,
    deLing,
    yongShenWuXing,
    jiShenWuXing,
    text,
  }
}
