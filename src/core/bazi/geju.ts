// 子平月令格局：以月令本气定十神 → 取格；极强/极弱判「从格」。仅供娱乐参考。
//
// 取格规则（主流简化）：
//   - 月令（月支）本气（藏干第一个）相对日干的十神，决定格局。
//     比肩→建禄格、劫财→羊刃格、食神/伤官/正偏财/七杀正官/正偏印 → 同名格。
//   - 「透干」＝月令本气五行出现在任一天干上，主格局更显。
//   - 从格：八字八字符几乎全为同党（比劫+印）→ 从强格；几乎全为异党 → 从弱格。

import { computeBaZi, BirthTime } from '../rules/bazi'
import { CANGAN, shiShen } from '../rules/luming'
import { STEMS, BRANCHES } from '../rules/ganzhi'
import { STEM_WU_XING, BRANCH_WU_XING, generates, WuXing } from '../rules/fiveElement'
import { ShiShenName } from '../../types/luming'

export interface GeJuResult {
  name: string
  benQi: string // 月令本气（藏干）
  benQiShiShen: ShiShenName // 月令本气十神
  touGan: boolean // 是否透干
  cong: boolean // 是否从格
  text: string
}

const SHISHEN_TO_GEJU: Record<ShiShenName, string> = {
  比肩: '建禄格',
  劫财: '羊刃格',
  食神: '食神格',
  伤官: '伤官格',
  偏财: '偏财格',
  正财: '正财格',
  七杀: '七杀格',
  正官: '正官格',
  偏印: '偏印格',
  正印: '正印格',
}

const GEJU_TEXT: Record<string, string> = {
  建禄格: '月令得比肩为禄，自立自强、靠自己打拼，人勤快、有主见，宜专业深耕与创业。',
  羊刃格: '月令带刃，性刚敢冲、行动力强，成败起伏大，宜把锐气用在事业上，忌赌气冲动。',
  食神格: '食神当令，温和有福、才艺出众、口福人缘佳，利创意、餐饮、文娱、服务。',
  伤官格: '伤官当令，聪明外露、点子多、不服管，才华与个性都强，宜自由职业与创作，忌口舌。',
  偏财格: '偏财当令，善抓机会、出手大方、财来财去，宜经商、投资、贸易，重经营与人脉。',
  正财格: '正财当令，踏实务实、量入为出、责任心强，宜稳定岗位、财务、实业，守成有道。',
  七杀格: '七杀当令，有魄力、敢担当、雷厉风行，压力大但有成就，宜军警、管理、竞争性行业。',
  正官格: '正官当令，自律重规矩、正直可靠、有公信力，宜公门、管理、稳定平台，稳步升迁。',
  偏印格: '偏印当令，思维独特、爱钻研、有宗教玄学天分，宜研究、技术、专业冷门领域。',
  正印格: '正印当令，温厚善良、好学爱读书、得长辈缘，宜文教、学术、医疗、安稳之路。',
  从强格: '八字几乎全为帮身的力量，格局纯粹、认准一条路走到底，宜顺势做大做强，忌反复动摇。',
  从弱格: '八字几乎全为克泄耗，善于借势、灵活应变、借力成事，宜跟对人、顺大势，忌硬扛独斗。',
}

export function computeGeJu(input: BirthTime): GeJuResult {
  const bazi = computeBaZi(input)
  const dayStem = bazi.dayPillar.ganZhi.stem
  const dayW = STEM_WU_XING[dayStem]
  const monthBranch = bazi.monthPillar.ganZhi.branch
  const benQi = CANGAN[monthBranch][0]
  const benQiShiShen = shiShen(dayStem, benQi)

  // 透干：月令本气五行是否出现在任一天干
  const benQiW = STEM_WU_XING[benQi]
  const stems = [bazi.yearPillar, bazi.monthPillar, bazi.dayPillar, bazi.hourPillar]
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .map((p) => p.ganZhi.stem)
  const touGan = stems.some((s) => STEM_WU_XING[s] === benQiW)

  // 从格：统计八字符的同党（比劫+印）vs 异党
  const pillars = [bazi.yearPillar, bazi.monthPillar, bazi.dayPillar, bazi.hourPillar].filter(
    (p): p is NonNullable<typeof p> => p !== null,
  )
  let tong = 0
  let yi = 0
  for (const p of pillars) {
    for (const w of [STEM_WU_XING[p.ganZhi.stem], BRANCH_WU_XING[p.ganZhi.branch]] as WuXing[]) {
      if (w === dayW || generates(w, dayW)) tong++
      else yi++
    }
  }
  const total = tong + yi
  const cong = total >= 6 && (yi <= 1 || tong <= 1)

  const name = cong ? (tong > yi ? '从强格' : '从弱格') : SHISHEN_TO_GEJU[benQiShiShen]
  const text = GEJU_TEXT[name] ?? GEJU_TEXT[SHISHEN_TO_GEJU[benQiShiShen]]

  return {
    name,
    benQi: STEMS[benQi],
    benQiShiShen,
    touGan,
    cong,
    text,
  }
}
