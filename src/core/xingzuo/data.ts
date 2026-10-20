// 十二星座：太阳星座按公历生日精确划分；配对指数按元素规则；月亮/上升按天文黄经计算。
import { jdFromDate, moonLongitude, ascendant, signIndexFromLon, planetLongitude, type PlanetKey } from './astro'

export interface Planet {
  key: PlanetKey
  name: string
  symbol: string
  meaning: string
}

// 星盘七曜 + 上升：水金火木土 + 日月升（日月升在 ChartView 单列）
export const PLANETS: Planet[] = [
  { key: 'mercury', name: '水星', symbol: '☿', meaning: '思维 · 沟通 · 表达' },
  { key: 'venus', name: '金星', symbol: '♀', meaning: '爱情 · 审美 · 享受' },
  { key: 'mars', name: '火星', symbol: '♂', meaning: '行动 · 欲望 · 竞争' },
  { key: 'jupiter', name: '木星', symbol: '♃', meaning: '幸运 · 成长 · 格局' },
  { key: 'saturn', name: '土星', symbol: '♄', meaning: '责任 · 磨砺 · 成就' },
]

// 行星落座（按行星地心黄经）
export function planetSignByDate(key: PlanetKey, year: number, month: number, day: number, hour = 0): number {
  return signIndexFromLon(planetLongitude(jdFromDate(year, month, day, hour), key))
}

export interface Sign {
  key: string
  name: string
  en: string
  symbol: string
  element: '火' | '土' | '风' | '水'
  ruler: string
  dateRange: string
  traits: string[]
  desc: string
  luckyNumber: string
  luckyColor: string
  luckyStone: string
  strength: string
  weakness: string
  love: string
  career: string
  money: string
}

export const SIGNS: Sign[] = [
  { key: 'aries', name: '白羊座', en: 'Aries', symbol: '♈', element: '火', ruler: '火星', dateRange: '3.21–4.19', traits: ['热情', '冲动', '直率', '行动力'], desc: '热情直接的行动派，敢想敢做、冲锋在前，就是脾气来得快去得也快。', luckyNumber: '1、9', luckyColor: '红', luckyStone: '红宝石', strength: '热情勇敢、行动力强、直率真诚', weakness: '冲动急躁、没耐心、易自我中心', love: '爱就轰轰烈烈，讨厌拖泥带水，热情来得快去得也快。', career: '适合冲锋陷阵的岗位，创业、销售、体育、军警都能发光。', money: '敢花也敢赚，来钱快但存不住，需要有人管账。' },
  { key: 'taurus', name: '金牛座', en: 'Taurus', symbol: '♉', element: '土', ruler: '金星', dateRange: '4.20–5.20', traits: ['踏实', '稳重', '务实', '长情'], desc: '踏实稳重的现实派，看重安全感与品质，慢热但一旦认定就特别长情。', luckyNumber: '6、8', luckyColor: '绿', luckyStone: '翡翠', strength: '踏实稳重、有耐心、审美在线', weakness: '固执、慢热、爱钻牛角尖', love: '慢热长情，认定就死心塌地，安全感是第一刚需。', career: '适合需要耐心与积累的领域，财务、艺术、餐饮、珠宝都稳。', money: '最会存钱、理财稳健，账户余额就是安全感。' },
  { key: 'gemini', name: '双子座', en: 'Gemini', symbol: '♊', element: '风', ruler: '水星', dateRange: '5.21–6.21', traits: ['机灵', '多变', '好奇', '善谈'], desc: '机灵多变的聪明派，口才好、好奇心爆棚，就是容易三分钟热度。', luckyNumber: '5', luckyColor: '黄', luckyStone: '玛瑙', strength: '聪明机灵、口才好、适应力强', weakness: '善变、三分钟热度、嘴上没把门', love: '爱聊天胜过爱承诺，新鲜感与精神共鸣缺一不可。', career: '靠嘴和脑子吃饭，传媒、销售、写作、自媒体、教育都吃香。', money: '来钱路子多、头脑灵活，但花得也快，难有积蓄。' },
  { key: 'cancer', name: '巨蟹座', en: 'Cancer', symbol: '♋', element: '水', ruler: '月亮', dateRange: '6.22–7.22', traits: ['温柔', '细腻', '顾家', '敏感'], desc: '温柔细腻的顾家派，情感丰富、护短心切，敏感得像个情绪雷达。', luckyNumber: '2、7', luckyColor: '银白', luckyStone: '珍珠', strength: '温柔体贴、顾家、共情力强', weakness: '敏感多疑、情绪化、过度保护', love: '家庭感至上，需要安全感，也需要被需要的感觉。', career: '适合暖心照顾人的行业，餐饮、教育、护理、家居、母婴。', money: '为家花钱不眨眼，会存钱，安全感来自踏实积累。' },
  { key: 'leo', name: '狮子座', en: 'Leo', symbol: '♌', element: '火', ruler: '太阳', dateRange: '7.23–8.22', traits: ['自信', '张扬', '重义气', '爱面子'], desc: '自信张扬的王者派，爱面子、重义气，天生自带聚光灯。', luckyNumber: '1、4', luckyColor: '金', luckyStone: '琥珀', strength: '自信大方、有领导力、讲义气', weakness: '爱面子、自大、听不进批评', love: '要轰轰烈烈也要被崇拜，恋爱里一定要当主角。', career: '天生领导，适合管理、演艺、创业、市场这类台前角色。', money: '出手阔绰、赚得动也花得狠，面子有时比钱重要。' },
  { key: 'virgo', name: '处女座', en: 'Virgo', symbol: '♍', element: '土', ruler: '水星', dateRange: '8.23–9.22', traits: ['细致', '认真', '逻辑强', '完美'], desc: '细致认真的完美派，逻辑强、爱较真，是细节控也是可靠担当。', luckyNumber: '5、7', luckyColor: '灰蓝', luckyStone: '蓝宝石', strength: '细致认真、逻辑强、靠谱', weakness: '挑剔、焦虑、完美主义过度', love: '爱得克制又周到，用行动表达，细节控到极致。', career: '适合需要精准与整理的领域，医疗、财务、编辑、程序员。', money: '精打细算、会规划，很少乱花钱，但也会因小失大。' },
  { key: 'libra', name: '天秤座', en: 'Libra', symbol: '♎', element: '风', ruler: '金星', dateRange: '9.23–10.23', traits: ['优雅', '随和', '公平', '纠结'], desc: '优雅随和的平衡派，追求和谐与公平，最怕做选择、最会看脸色。', luckyNumber: '6、9', luckyColor: '粉', luckyStone: '蛋白石', strength: '优雅得体、公正、社交高手', weakness: '纠结、讨好、逃避冲突', love: '追求势均力敌的浪漫，最怕吵架，也最怕做决定。', career: '适合协调与美感的领域，公关、法律、设计、婚庆、外交。', money: '舍得为美和社交花钱，理财常因纠结错过时机。' },
  { key: 'scorpio', name: '天蝎座', en: 'Scorpio', symbol: '♏', element: '水', ruler: '冥王星', dateRange: '10.24–11.22', traits: ['深沉', '专注', '洞察力', '极致'], desc: '深沉专注的极端派，洞察力强、爱恨分明，要么全部要么没有。', luckyNumber: '3、5', luckyColor: '黑', luckyStone: '黑曜石', strength: '专注执着、洞察力强、重情', weakness: '多疑、占有欲强、记仇', love: '要么全部要么没有，爱得极致，眼里容不得沙子。', career: '适合深度钻研的领域，研究、心理、金融、刑侦、医药。', money: '闷声发大财、会布局，但容易因过度控制而焦虑。' },
  { key: 'sagittarius', name: '射手座', en: 'Sagittarius', symbol: '♐', element: '火', ruler: '木星', dateRange: '11.23–12.21', traits: ['乐观', '自由', '爱冒险', '心大'], desc: '乐观自由的流浪派，心大、爱冒险、爱说教，理想主义的乐天派。', luckyNumber: '3、9', luckyColor: '紫', luckyStone: '绿松石', strength: '乐观开朗、自由、有远见', weakness: '没耐心、口无遮拦、责任感偏弱', love: '爱自由怕束缚，谈恋爱也要给彼此留白。', career: '适合到处跑与开拓的领域，旅游、外贸、教育、出版、体育。', money: '花钱随性、来得快去得也快，但心态始终很好。' },
  { key: 'capricorn', name: '摩羯座', en: 'Capricorn', symbol: '♑', element: '土', ruler: '土星', dateRange: '12.22–1.19', traits: ['沉稳', '隐忍', '目标感', '能熬'], desc: '沉稳隐忍的实干派，目标感强、最能熬，是把野心藏得很深的狠角色。', luckyNumber: '8', luckyColor: '深褐', luckyStone: '石榴石', strength: '沉稳坚忍、目标感强、负责', weakness: '压抑、现实、工作狂', love: '爱得慢但爱得深，承诺永远重于甜言蜜语。', career: '适合长期主义的领域，管理、工程、行政、创业、金融。', money: '最能攒钱与布局，越老越有钱，是低调的实力派。' },
  { key: 'aquarius', name: '水瓶座', en: 'Aquarius', symbol: '♒', element: '风', ruler: '天王星', dateRange: '1.20–2.18', traits: ['独立', '前卫', '脑洞大', '重自由'], desc: '独立前卫的怪才派，脑洞大、重自由，总跟别人不在一个频道。', luckyNumber: '4、8', luckyColor: '蓝', luckyStone: '紫水晶', strength: '独立创新、理性、重朋友', weakness: '疏离、固执己见、忽冷忽热', love: '先做朋友再谈恋爱，需要空间，最讨厌黏人。', career: '适合前沿与创造性的领域，科技、互联网、社会创新、设计。', money: '不重钱但会规划，常有非主流的赚钱思路。' },
  { key: 'pisces', name: '双鱼座', en: 'Pisces', symbol: '♓', element: '水', ruler: '海王星', dateRange: '2.19–3.20', traits: ['浪漫', '多情', '共情', '梦幻'], desc: '浪漫多情的梦幻派，共情力满格、心软好骗，活在自己的小宇宙里。', luckyNumber: '2、7', luckyColor: '海蓝', luckyStone: '月光石', strength: '浪漫共情、想象力强、心软', weakness: '多愁善感、逃避现实、易被骗', love: '为爱而生，容易沉浸其中，也最容易受伤。', career: '适合艺术与疗愈的领域，音乐、文学、设计、心理咨询、公益。', money: '对钱没概念，容易为情为梦花钱，需要有人帮忙规划。' },
]

// 太阳星座：按公历月/日精确划分（返回 SIGNS 下标）。
export function signOf(month: number, day: number): number {
  const md = month * 100 + day
  if (md >= 1222 || md <= 119) return 9 // 摩羯 12.22–1.19
  if (md <= 218) return 10 // 水瓶
  if (md <= 320) return 11 // 双鱼
  if (md <= 419) return 0 // 白羊
  if (md <= 520) return 1 // 金牛
  if (md <= 621) return 2 // 双子
  if (md <= 722) return 3 // 巨蟹
  if (md <= 822) return 4 // 狮子
  if (md <= 922) return 5 // 处女
  if (md <= 1023) return 6 // 天秤
  if (md <= 1122) return 7 // 天蝎
  return 8 // 射手
}

// 上升星座（简化估算）：清晨 6 点上升≈太阳星座，之后每 2 小时前进一个星座。
export function risingSign(sunIndex: number, hour?: number): number {
  if (hour === undefined || hour === null || hour < 0 || hour > 23) return sunIndex
  const shift = Math.floor((hour - 6) / 2)
  return (((sunIndex + shift) % 12) + 12) % 12
}

// 月亮星座（简化估算）：初一（新月）月亮≈太阳星座，之后每约 2.2 天前进一个星座。
export function moonSign(sunIndex: number, lunarDay: number): number {
  const shift = Math.floor((lunarDay - 1) / 2.2)
  return (((sunIndex + shift) % 12) + 12) % 12
}

// 月亮星座（按月亮黄经，更准）
export function moonSignByDate(year: number, month: number, day: number, hour = 0): number {
  return signIndexFromLon(moonLongitude(jdFromDate(year, month, day, hour)))
}

// 上升星座（按出生地经纬度 + 时辰 + 上升点黄经，更准）
export function risingSignByPlace(lat: number, lng: number, tz: number, year: number, month: number, day: number, hour: number): number {
  const ut = hour - tz
  return signIndexFromLon(ascendant(jdFromDate(year, month, day, ut), lat, lng))
}

export interface CompatResult {
  score: number
  level: '绝配' | '很配' | '一般' | '需磨合'
  text: string
}

export function compatibility(a: number, b: number): CompatResult {
  const ea = SIGNS[a].element
  const eb = SIGNS[b].element
  let score = 75
  const notes: string[] = []
  if (ea === eb) {
    score += 15
    notes.push(`同属${ea}象，性格底色相近`)
  }
  if ((ea === '火' && eb === '风') || (ea === '风' && eb === '火')) {
    score += 12
    notes.push('风助火势，彼此点燃')
  }
  if ((ea === '火' && eb === '土') || (ea === '土' && eb === '火')) {
    score += 8
    notes.push('火生土，互补融洽')
  }
  if ((ea === '风' && eb === '水') || (ea === '水' && eb === '风')) {
    score += 5
    notes.push('风生水起，有默契')
  }
  if ((ea === '火' && eb === '水') || (ea === '水' && eb === '火')) {
    score -= 15
    notes.push('水火相克，需要耐心')
  }
  if ((ea === '土' && eb === '水') || (ea === '水' && eb === '土')) {
    score -= 15
    notes.push('土水相克，节奏不同')
  }
  if ((a + 6) % 12 === b) {
    score += 3
    notes.push('对宫吸引，强烈又拉扯')
  }
  score = Math.max(40, Math.min(98, score))
  const level: CompatResult['level'] =
    score >= 85 ? '绝配' : score >= 72 ? '很配' : score >= 58 ? '一般' : '需磨合'
  return { score, level, text: notes.length ? notes.join('，') + '。' : '缘分中规中矩，多相处才有答案。' }
}

// ---------------- 配对详解（12×12 每对专属白话） ----------------

const ELEMENT_ORDER = ['火', '土', '风', '水']

function elementKey(a: string, b: string): string {
  const [x, y] = [a, b].sort((p, q) => ELEMENT_ORDER.indexOf(p) - ELEMENT_ORDER.indexOf(q))
  return x + y
}

const PAIR_ELEMENT: Record<string, { attraction: string; challenge: string; advice: string }> = {
  火火: { attraction: '同为火象，一拍即合、激情四射，彼此都懂那股冲劲。', challenge: '两个暴脾气，火星撞地球，谁都不肯先低头。', advice: '各自退一步，把争强好胜变成并肩作战。' },
  土土: { attraction: '同为土象，踏实可靠、价值观一致，处得安心。', challenge: '都太闷太固执，容易各守一摊、缺少火花。', advice: '主动制造点小浪漫，别让日子过成公事公办。' },
  风风: { attraction: '同为风象，聊得来、玩得到一起，精神契合。', challenge: '都不爱被管束，关系容易飘忽、承诺不足。', advice: '给彼此自由，但也约定好底线。' },
  水水: { attraction: '同为水象，情感细腻、互相懂得，治愈感强。', challenge: '情绪都重，容易一起内耗、互相猜。', advice: '有话直说，别把情绪都藏在心里发酵。' },
  火土: { attraction: '火生土，一个冲一个稳，天生互补。', challenge: '火嫌土慢，土嫌火躁，节奏常对不上。', advice: '火多等等、土快一点，把互补用到实处。' },
  火风: { attraction: '风助火势，彼此点燃、越处越带劲。', challenge: '都太飘，容易玩心重、缺乏沉淀。', advice: '热闹之余，记得落地聊聊未来。' },
  火水: { attraction: '强烈的化学反应，吸引力爆表。', challenge: '水火相克，一个要自由一个要安全感，容易互相伤害。', advice: '各自收敛情绪，学会在差异里找平衡。' },
  土风: { attraction: '一个务实一个灵活，能补足彼此的短板。', challenge: '土嫌风不着调，风嫌土太刻板。', advice: '欣赏对方与自己不同的地方。' },
  土水: { attraction: '土能包容水的情绪，水能软化土的坚硬。', challenge: '土水相克，一个太现实一个太感性，容易话不投机。', advice: '土多给情绪价值，水多落地一点。' },
  风水: { attraction: '风生水起，有默契、聊得进心坎。', challenge: '风理性、水感性，鸡同鸭讲的时候不少。', advice: '一个说理、一个说情，学着翻译对方。' },
}

export interface PairAnalysis {
  score: number
  level: CompatResult['level']
  text: string
  attraction: string
  challenge: string
  advice: string
}

export function pairAnalysis(a: number, b: number): PairAnalysis {
  const c = compatibility(a, b)
  const en = PAIR_ELEMENT[elementKey(SIGNS[a].element, SIGNS[b].element)]
  const attraction = `${SIGNS[a].name}：${SIGNS[a].love}；${SIGNS[b].name}：${SIGNS[b].love}。${en.attraction}`
  return {
    score: c.score,
    level: c.level,
    text: c.text,
    attraction,
    challenge: en.challenge,
    advice: en.advice,
  }
}

// ---------------- 多维配对（爱情 / 友情 / 同事） ----------------

export interface PairDimensions {
  love: CompatResult
  friendship: CompatResult
  work: CompatResult
}

/** 按场景各自加权：爱情看火水/对宫，友情看风象/同元素，同事看土象/风象。 */
function sceneResult(a: number, b: number, scene: 'love' | 'friendship' | 'work'): CompatResult {
  const ea = SIGNS[a].element
  const eb = SIGNS[b].element
  const sameElem = ea === eb
  const isOpp = (a + 6) % 12 === b
  let score = 70
  const notes: string[] = []

  if (scene === 'love') {
    if ((ea === '火' && eb === '水') || (ea === '水' && eb === '火')) { score += 14; notes.push('水火相吸，越吵越来电') }
    else if ((ea === '火' && eb === '风') || (ea === '风' && eb === '火')) { score += 10; notes.push('风助火势，激情点燃') }
    else if ((ea === '土' && eb === '水') || (ea === '水' && eb === '土')) { score += 6; notes.push('土水相守，安稳长情') }
    else if (sameElem) { score += 6; notes.push(`同为${ea}象，默契长情`) }
    if (isOpp) { score += 8; notes.push('对宫互补，强烈吸引') }
  } else if (scene === 'friendship') {
    if (ea === '风' && eb === '风') { score += 14; notes.push('双风象，聊天停不下来') }
    else if ((ea === '火' && eb === '风') || (ea === '风' && eb === '火')) { score += 10; notes.push('火风相配，玩得到一起') }
    else if (sameElem) { score += 8; notes.push(`同为${ea}象，兴趣相投`) }
    if (ea === '风' || eb === '风') { score += 4; notes.push('有风象在，社交不冷场') }
  } else {
    if (ea === '土' && eb === '土') { score += 14; notes.push('双土象，务实高效') }
    else if ((ea === '土' && eb === '风') || (ea === '风' && eb === '土')) { score += 12; notes.push('土风互补，能想能执行') }
    else if (ea === '土' || eb === '土') { score += 8; notes.push('有土象压阵，靠谱能落地') }
    else if (ea === '风' || eb === '风') { score += 6; notes.push('风象灵活，协作顺畅') }
    if (sameElem) { score += 4; notes.push('同象共事，节奏一致') }
  }

  score = Math.max(40, Math.min(98, score))
  const level: CompatResult['level'] = score >= 85 ? '绝配' : score >= 72 ? '很配' : score >= 58 ? '一般' : '需磨合'
  return { score, level, text: notes.length ? notes.join('，') + '。' : '中规中矩，多相处才有答案。' }
}

export function pairDimensions(a: number, b: number): PairDimensions {
  return {
    love: sceneResult(a, b, 'love'),
    friendship: sceneResult(a, b, 'friendship'),
    work: sceneResult(a, b, 'work'),
  }
}
