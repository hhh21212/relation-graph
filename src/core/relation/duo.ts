// 看两个人增强：在评分/建议之外，补「谁旺谁/谁克谁」「适合一起做什么」「相处模式（谁主导）」。
// 依据：日主五行生克 + 年柱纳音生克（谁旺谁）、生肖合冲害 + 五行互补（做什么）、
// 一方对另一方日主的十神（谁主导）。结果仅供娱乐参考。

import { Person } from '../../types/person'
import { AnalysisMode } from '../../types/analysis'
import { ShiShenCategory } from '../../types/luming'
import { computeBaZi } from '../rules/bazi'
import { WuXing, STEM_WU_XING, BRANCH_WU_XING, generates, overcomes } from '../rules/fiveElement'
import { isTianGanHe } from '../rules/ganzhi'
import { zodiacRelations, zodiacOf } from '../rules/zodiac'

export interface DuoResult {
  // 谁旺谁 / 谁克谁
  wangKe: string
  // 适合一起做什么 / 不适合
  together: {
    good: string[]
    avoid: string[]
  }
  // 相处模式（谁主导）
  dynamic: string
}

function toBirthTime(p: Person) {
  return { year: p.birthYear, month: p.birthMonth, day: p.birthDay, hour: p.hour, minute: p.minute }
}

function category(me: WuXing, other: WuXing): ShiShenCategory {
  if (me === other) return '比劫'
  if (generates(me, other)) return '食伤'
  if (overcomes(me, other)) return '财'
  if (overcomes(other, me)) return '官杀'
  return '印'
}

/** 八字八字符五行计数（用于互补判断） */
function wuXing8(a: ReturnType<typeof computeBaZi>): Record<WuXing, number> {
  const count: Record<WuXing, number> = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 }
  for (const p of [a.yearPillar, a.monthPillar, a.dayPillar, a.hourPillar]) {
    if (!p) continue
    count[STEM_WU_XING[p.ganZhi.stem]]++
    count[BRANCH_WU_XING[p.ganZhi.branch]]++
  }
  return count
}

export function computeDuo(a: Person, b: Person, mode: AnalysisMode = 'hepan'): DuoResult {
  const ba = computeBaZi(toBirthTime(a))
  const bb = computeBaZi(toBirthTime(b))

  const wa = STEM_WU_XING[ba.dayPillar.ganZhi.stem]
  const wb = STEM_WU_XING[bb.dayPillar.ganZhi.stem]
  const na = ba.yearPillar.nayinWuXing
  const nb = bb.yearPillar.nayinWuXing

  // -------- 谁旺谁 / 谁克谁 --------
  const wangParts: string[] = []
  if (wa === wb) {
    wangParts.push(`${a.name}和${b.name}日主同是「${wa}」，彼此同气，属于一起打拼、谁也不拖谁后腿的那种`)
  } else if (generates(wa, wb)) {
    wangParts.push(`按日主看，${a.name}旺${b.name}（${wa}生${wb}），${a.name}是更能滋养、帮衬${b.name}的那一个`)
  } else if (generates(wb, wa)) {
    wangParts.push(`按日主看，${b.name}旺${a.name}（${wb}生${wa}），${b.name}是更能滋养、帮衬${a.name}的那一个`)
  } else if (overcomes(wa, wb)) {
    wangParts.push(`按日主看，${a.name}克${b.name}（${wa}克${wb}），${a.name}相对更压得住${b.name}`)
  } else {
    wangParts.push(`按日主看，${b.name}克${a.name}（${wb}克${wa}），${b.name}相对更压得住${a.name}`)
  }

  if (na === nb) {
    wangParts.push(`年命纳音同为「${ba.yearPillar.nayin}」，根基相当，谁也不欠谁`)
  } else if (generates(na, nb)) {
    wangParts.push(`年命纳音上${a.name}生${b.name}，${a.name}在根子上愿意托举${b.name}`)
  } else if (generates(nb, na)) {
    wangParts.push(`年命纳音上${b.name}生${a.name}，${b.name}在根子上愿意托举${a.name}`)
  } else if (overcomes(na, nb)) {
    wangParts.push(`年命纳音上${a.name}克${b.name}，先天气场里${a.name}略占上风`)
  } else {
    wangParts.push(`年命纳音上${b.name}克${a.name}，先天气场里${b.name}略占上风`)
  }
  const wangKe = wangParts.join('。')

  // -------- 适合一起做什么 / 不适合 --------
  const rels = zodiacRelations(ba.zodiac, bb.zodiac)
  const ca = wuXing8(ba)
  const cb = wuXing8(bb)
  const aStrong = (Object.keys(ca) as WuXing[]).filter((x) => ca[x] >= 2)
  const bWeak = (Object.keys(cb) as WuXing[]).filter((x) => cb[x] === 0)
  const bStrong = (Object.keys(cb) as WuXing[]).filter((x) => cb[x] >= 2)
  const aWeak = (Object.keys(ca) as WuXing[]).filter((x) => ca[x] === 0)
  const complementary = aStrong.some((x) => bWeak.includes(x)) || bStrong.some((x) => aWeak.includes(x))

  const good: string[] = []
  const avoid: string[] = []
  if (isTianGanHe(ba.dayPillar.ganZhi.stem, bb.dayPillar.ganZhi.stem)) {
    good.push('日主天干相合，天生投缘，适合谈感情或深度合作')
  }
  if (rels.includes('六合')) {
    good.push(mode === 'hepan' ? '生肖六合，适合做长长久久的伴侣' : '生肖六合，适合做亲密搭档、长期合作')
  }
  if (rels.includes('三合')) {
    good.push(mode === 'hepan' ? '生肖三合，一起过日子、一起玩都顺' : '生肖三合，一起玩、一起干事气场相投')
  }
  if (complementary) {
    good.push('五行互补，一起做事正好取长补短，你缺的他有、他缺的你有')
  }
  if (rels.includes('六冲')) {
    avoid.push('生肖相冲，一起做事容易意见顶牛，不适合高风险合伙')
  }
  if (rels.includes('相害')) {
    avoid.push('生肖相害，容易互相误会，合伙要把话说清')
  }
  if (overcomes(wa, wb) || overcomes(wb, wa)) {
    avoid.push('日主相克，性格反差大，共事需要更多耐心磨合')
  }
  if (good.length === 0) good.push('没有特别突出的互补，但平平淡淡也能处出感情')
  if (avoid.length === 0) avoid.push('没有明显雷区，保持真诚、多沟通就好')

  // -------- 相处模式（谁主导） --------
  const cat = category(wa, wb) // B 相对 A 的十神
  let dynamic: string
  if (cat === '比劫') {
    dynamic = `${a.name}和${b.name}像哥们一样平起平坐，谁也别想压谁，有事商量着来`
  } else if (cat === '官杀') {
    dynamic = `${b.name}对${a.name}更有约束力、更像主心骨；${a.name}多少有点被管着、被推着走`
  } else if (cat === '印') {
    dynamic = `${b.name}更照顾、滋养${a.name}；${a.name}在关系里偏被呵护的那一方`
  } else if (cat === '食伤') {
    dynamic = `${a.name}对${b.name}付出、迁就更多；${b.name}是被宠着的那一方`
  } else {
    dynamic = `${a.name}在关系里更主动、更能拿主意；${b.name}偏配合`
  }

  return { wangKe, together: { good, avoid }, dynamic }
}
