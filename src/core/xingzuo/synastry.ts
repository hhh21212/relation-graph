// 星座两人合盘（Synastry）：交叉比对双方 日/月/升/金/火 的落座元素与相位，输出契合度与白话解读。仅供娱乐参考。
import { SIGNS, signOf, moonSignByDate, risingSignByPlace, planetSignByDate } from './data'
import { chartLongitudes, crossAspects, BODIES, type ChartAspect, type AspectKey } from './aspects'

export interface Birth {
  year: number
  month: number
  day: number
  hour?: number
  lat?: number
  lng?: number
  tz?: number
}

export interface Placements {
  sun: number
  moon: number
  rising: number
  venus: number
  mars: number
}

// 出生信息 → 五大落座（星座下标）
export function placementsOf(b: Birth): Placements {
  const h = b.hour ?? 0
  const sun = signOf(b.month, b.day)
  const moon = moonSignByDate(b.year, b.month, b.day, h)
  const hasPlace = b.hour !== undefined && b.lat !== undefined && b.lng !== undefined
  const rising = hasPlace ? risingSignByPlace(b.lat!, b.lng!, b.tz ?? 8, b.year, b.month, b.day, b.hour!) : sun
  const venus = planetSignByDate('venus', b.year, b.month, b.day, h)
  const mars = planetSignByDate('mars', b.year, b.month, b.day, h)
  return { sun, moon, rising, venus, mars }
}

// 元素契合（0–100）：同元素最合，火风/土水相生，火水/土风相克。
const ELEMENT_COMPAT: Record<string, Record<string, number>> = {
  火: { 火: 100, 风: 85, 水: 50, 土: 40 },
  土: { 土: 100, 水: 85, 风: 50, 火: 40 },
  风: { 风: 100, 火: 85, 土: 50, 水: 40 },
  水: { 水: 100, 土: 85, 火: 50, 风: 40 },
}

function elementCompat(a: number, b: number): number {
  let s = ELEMENT_COMPAT[SIGNS[a].element][SIGNS[b].element]
  if (a === b) s = Math.min(100, s + 10) // 同座：默契加码
  else if (Math.abs(a - b) === 6) s = Math.min(100, s + 8) // 对宫：互补吸引
  return s
}

export interface SynastryAspect {
  key: string
  title: string
  score: number
  text: string
}

export interface SynastryResult {
  score: number
  level: string
  summary: string
  aspects: SynastryAspect[]
}

function aspectText(score: number, good: string, mid: string, bad: string): string {
  if (score >= 80) return good
  if (score >= 60) return mid
  return bad
}

export function synastry(a: Placements, b: Placements): SynastryResult {
  const sunSun = elementCompat(a.sun, b.sun)
  const sunMoon = Math.round((elementCompat(a.sun, b.moon) + elementCompat(b.sun, a.moon)) / 2)
  const moonMoon = elementCompat(a.moon, b.moon)
  const venusMars = Math.round((elementCompat(a.venus, b.mars) + elementCompat(b.venus, a.mars)) / 2)
  const risingSun = Math.round((elementCompat(a.rising, b.sun) + elementCompat(b.rising, a.sun)) / 2)

  const aspects: SynastryAspect[] = [
    {
      key: 'sunSun',
      title: '本质契合 · 太阳×太阳',
      score: sunSun,
      text: aspectText(sunSun, '两人核心价值观高度一致，天生聊得来、目标也往一处使。', '本质同频度中上，大方向一致，细节上需要多磨合。', '个性差异明显，一个要闯一个要稳，需要更多理解与让步。'),
    },
    {
      key: 'sunMoon',
      title: '情感连接 · 太阳×月亮',
      score: sunMoon,
      text: aspectText(sunMoon, '你懂他的骄傲、他懂你的柔软，是灵魂层面的相互滋养。', '情感需求大体对得上，偶尔会互相误解，多表达就好。', '情感频道不太一样，一个理性一个感性，容易“对不上暗号”。'),
    },
    {
      key: 'moonMoon',
      title: '情感节奏 · 月亮×月亮',
      score: moonMoon,
      text: aspectText(moonMoon, '情绪节奏高度合拍，安全感足，在一起很踏实。', '情绪基调相近，但表达方式略有差异，磨合后更顺。', '一个要陪伴一个要空间，情绪需求容易错位。'),
    },
    {
      key: 'venusMars',
      title: '吸引力 · 金星×火星',
      score: venusMars,
      text: aspectText(venusMars, '化学反应强烈，互相被对方吸引，恋爱感与新鲜感都很足。', '有来电，但激情需要用心经营才能长久。', '吸引力偏弱，相处更像朋友，需要主动制造火花。'),
    },
    {
      key: 'risingSun',
      title: '第一印象 · 上升×太阳',
      score: risingSun,
      text: aspectText(risingSun, '初见就很对眼，越处越顺眼，是“第一眼就喜欢”的类型。', '初见印象不错，多接触会发现更多亮点。', '初见容易误判，需要给彼此多一点时间重新认识。'),
    },
  ]

  const score = Math.round(sunSun * 0.2 + sunMoon * 0.3 + moonMoon * 0.15 + venusMars * 0.2 + risingSun * 0.15)
  const level = score >= 85 ? '天生一对' : score >= 72 ? '很合拍' : score >= 58 ? '有缘可磨合' : '需用心经营'

  const best = [...aspects].sort((x, y) => y.score - x.score)[0]
  const worst = [...aspects].sort((x, y) => x.score - y.score)[0]
  const summary = `你们最合拍的是「${best.title.split('·')[0].trim()}」，${best.text}而「${worst.title.split('·')[0].trim()}」相对偏弱：${worst.text}整体来看，${level === '天生一对' ? '这段关系自带默契，好好珍惜、稳稳走下去。' : level === '很合拍' ? '契合度很高，只要多沟通就能走得很远。' : level === '有缘可磨合' ? '有缘分但需要磨合，用心经营能越走越顺。' : '需要更多耐心与理解，慢热也能熬出真感情。'}`

  return { score, level, summary, aspects }
}

// ---------------- 相处模式总评 + 三星深度解读 ----------------

export interface SynastrySummary {
  heading: string
  text: string
}

function dominantElement(elements: string[]): string {
  const c: Record<string, number> = {}
  for (const x of elements) c[x] = (c[x] ?? 0) + 1
  return Object.entries(c).sort((a, b) => b[1] - a[1])[0][0]
}

export function synastrySummary(pa: Placements, pb: Placements): SynastrySummary {
  const sunSun = elementCompat(pa.sun, pb.sun)
  const moonMoon = elementCompat(pa.moon, pb.moon)
  const venusMars = Math.round((elementCompat(pa.venus, pb.mars) + elementCompat(pb.venus, pa.mars)) / 2)
  const risingSun = Math.round((elementCompat(pa.rising, pb.sun) + elementCompat(pb.rising, pa.sun)) / 2)
  const avg = Math.round((sunSun + moonMoon + venusMars + risingSun) / 4)

  const heading =
    avg >= 85 ? '同频共振型' : avg >= 72 ? '互补契合型' : avg >= 58 ? '张力磨合型' : '差异碰撞型'

  const ea = dominantElement([SIGNS[pa.sun].element, SIGNS[pa.moon].element, SIGNS[pa.rising].element, SIGNS[pa.venus].element, SIGNS[pa.mars].element])
  const eb = dominantElement([SIGNS[pb.sun].element, SIGNS[pb.moon].element, SIGNS[pb.rising].element, SIGNS[pb.venus].element, SIGNS[pb.mars].element])

  const sunTxt = aspectText(sunSun, '本质价值观高度同频，想到一处、目标也往一处使', '大方向一致，细节上需要多磨合', '个性底色差异明显，需要更多理解')
  const moonTxt = aspectText(moonMoon, '情绪节奏高度合拍，安全感很足', '情绪基调相近，表达方式略有差异', '情感需求容易错位，一个要陪伴一个要空间')
  const venTxt = aspectText(venusMars, '彼此吸引力强、火花不断', '有来电，需用心经营', '吸引力偏淡，相处更像朋友')
  const riseTxt = aspectText(risingSun, '初见就很对眼，越处越顺', '初见印象不错，越了解越多惊喜', '初见易误判，需时间重新认识')

  const text = `你们的关系以「${ea}象」与「${eb}象」的碰撞为底色：${sunTxt}；${moonTxt}；${venTxt}；${riseTxt}。相处时多发挥各自元素的优势，把差异变成互补，就是这段关系最舒服的样子。`

  return { heading, text }
}

export interface SynastryExtra {
  title: string
  score: number
  text: string
}

export function synastryExtras(pa: Placements, pb: Placements): { moonMoon: SynastryExtra; venusMars: SynastryExtra; marsMars: SynastryExtra } {
  const moonMoon = elementCompat(pa.moon, pb.moon)
  const venusMars = Math.round((elementCompat(pa.venus, pb.mars) + elementCompat(pb.venus, pa.mars)) / 2)
  const marsMars = elementCompat(pa.mars, pb.mars)
  return {
    moonMoon: {
      title: '情绪共鸣 · 月亮×月亮',
      score: moonMoon,
      text: aspectText(moonMoon,
        '两个人的情绪需求高度同频，一个眼神就能读懂对方的喜怒，是难得的默契。',
        '情绪基调相近，但表达方式略有差异，多些耐心就能磨合出默契。',
        '一个需要陪伴、一个需要空间，情绪需求容易错位，需要主动沟通边界。'),
    },
    venusMars: {
      title: '吸引力 · 金星×火星',
      score: venusMars,
      text: aspectText(venusMars,
        '爱的表达与行动欲望彼此点燃，恋爱感与新鲜感都拉满。',
        '有来电，但激情需要用心经营才能持久保鲜。',
        '吸引模式不太同频，相处更像朋友，需要主动制造浪漫火花。'),
    },
    marsMars: {
      title: '行动节奏 · 火星×火星',
      score: marsMars,
      text: aspectText(marsMars,
        '做事节奏一拍即合，说干就干，是并肩作战的好搭档。',
        '行动风格大体一致，偶尔一个急一个缓，协调一下更顺。',
        '一个雷厉风行、一个慢条斯理，步调不同容易互相拖累，需要分工配合。'),
    },
  }
}

// ---------------- 两人合盘相位（跨盘相位） ----------------

const PAIR_TOPIC: Record<string, string> = {
  'moon|sun': '情感连接',
  'sun|sun': '本质认同',
  'moon|moon': '情绪共鸣',
  'mars|venus': '吸引力',
  'venus|venus': '爱情观',
  'mars|mars': '行动与欲望',
  'sun|venus': '魅力吸引',
  'moon|venus': '情感滋养',
  'mars|sun': '热情行动',
  'mars|moon': '情绪与欲望',
  'asc|sun': '第一眼感觉',
  'asc|moon': '相处默契',
  'asc|venus': '外形吸引',
}

const REL_DESC: Record<AspectKey, string> = {
  conj: '天然同频、强烈共鸣，是关系里最直接也最难忘的连接点。',
  sextile: '轻松合拍，能互相成全、给对方带来机会与灵感。',
  square: '有张力也有磨合，反而最「来电」，是推动彼此成长的动力。',
  trine: '天生顺遂、无需费力就能互相理解支持，处起来很舒服。',
  opposition: '像镜子照出彼此缺失，相互吸引又拉扯，学会平衡即互补。',
}

export interface SynastryAspectItem extends ChartAspect {
  text: string
}

export function synastryAspects(birthA: Birth, birthB: Birth): SynastryAspectItem[] {
  const la = chartLongitudes(birthA)
  const lb = chartLongitudes(birthB)
  return crossAspects(la, lb).map((x) => {
    const topic = PAIR_TOPIC[[x.a, x.b].sort().join('|')] ?? '互动'
    return {
      ...x,
      text: `你的${BODIES[x.a]} 与 TA的${BODIES[x.b]}（${topic}）成${x.aspect.name}·${x.aspect.nature}：${REL_DESC[x.aspect.key]}`,
    }
  })
}
