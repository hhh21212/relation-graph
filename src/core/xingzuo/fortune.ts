// 每日/每周星座运势（娱乐向）：按「日期 + 星座」确定性生成，同一天同一星座结果一致。

import { SIGNS } from './data'

export interface FortuneItem {
  stars: number // 1-5
  text: string
}

export interface Fortune {
  title: string
  overall: FortuneItem
  love: FortuneItem
  career: FortuneItem
  money: FortuneItem
  health: FortuneItem
  luckyColor: string
  luckyNumber: string
  luckySign: number
  keyword?: string // 年度关键词（仅年度运势）
  keywordDesc?: string // 年度关键词说明
}

// FNV-1a 字符串哈希 → 0..1
function hash01(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10000) / 10000
}

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[Math.floor(seed * arr.length) % arr.length]
}

const OVERALL = [
  '整体运势走高，想做就去做，别犹豫。',
  '平平淡淡的一天，按部就班就是最好的节奏。',
  '贵人运在线，遇到难题不妨开口求助。',
  '心情是今天的主题，别让小事坏了兴致。',
  '思路清晰、行动果断，适合推进重要的事。',
  '有点小波折，但都能化解，别给自己太大压力。',
  '适合整理与复盘，把杂乱的事情理一理。',
  '灵感来得突然，抓住它，会有意外收获。',
  '状态在线，适合社交与对外，多露脸有好处。',
  '今天适合慢下来，听听内心的声音。',
  '好运与麻烦参半，稳住心态最重要。',
  '行动力爆棚，把积压的事情一口气清掉。',
] as const

const LOVE = [
  '有伴的多聊聊心事，单身的留意身边的新面孔。',
  '感情需要一点新鲜感，主动制造点小惊喜。',
  '桃花运不错，但要看清对方是不是真的合适。',
  '别把情绪带进感情，多一点温柔。',
  '适合表达爱意，一句真心话胜过千言万语。',
  '单身的桃花藏在朋友聚会里，别宅着。',
  '感情里别太较真，退一步海阔天空。',
  '旧人旧事可能浮现，想清楚再决定。',
  '今天适合约会与陪伴，感情会升温。',
  '别急着下结论，给彼此一点时间。',
  '主动一点，缘分有时就差你那一句话。',
  '稳稳的幸福，就是今天的主题。',
] as const

const CAREER = [
  '工作推进顺利，关键节点能卡住。',
  '适合向上汇报与争取资源，大胆开口。',
  '细节决定成败，今天尤其要仔细。',
  '有新的机会浮现，别急着拒绝，先了解。',
  '团队协作是重点，多听多沟通。',
  '适合专注攻坚，把难啃的骨头啃下来。',
  '有点心浮气躁，先列清单再动手。',
  '贵人可能出现在会议或饭局上，多留意。',
  '效率一般，别硬扛，劳逸结合。',
  '适合学习充电，补一补短板。',
  '创意点子不错，把它落到纸面上。',
  '稳住基本盘，别贪多，一件件来。',
] as const

const MONEY = [
  '正财运稳，偏财勿贪，见好就收。',
  '适合做点理财规划，别冲动消费。',
  '有小财入账，但别大手大脚。',
  '投资需谨慎，别听风就是雨。',
  '开销偏大，量入为出更安心。',
  '适合谈钱，谈妥了就是双赢。',
  '别轻易借钱，也少给自己添负担。',
  '财运平淡，稳稳当当就是赚。',
  '有意外支出，提前留好余量。',
  '适合讨回旧账或争取该得的报酬。',
  '理性消费，货比三家能省不少。',
  '长期布局的收益开始显现，稳住别慌。',
] as const

const HEALTH = [
  '身体状态不错，适合动起来，晨跑或散步都很好。',
  '注意作息，别熬夜，睡个好觉比什么都强。',
  '肠胃有点敏感，饮食清淡些，少吃生冷。',
  '精力在线，适合把运动提上日程。',
  '有点上火，多喝水，少吃辛辣。',
  '肩颈容易僵硬，久坐记得起来活动。',
  '免疫力略降，注意保暖，别贪凉。',
  '情绪影响身体，放松心情，别硬扛压力。',
  '适合泡个热水澡、早点休息，给身体充电。',
  '小心磕碰，运动前做好热身。',
  '状态平稳，保持规律作息即可。',
  '适合体检或调理，关注一下小毛病。',
] as const

// 十二年度关键词（按星座+年份确定性选取，配一句说明）
const YEAR_KEYWORDS = [
  { label: '破局', desc: '敢于打破惯性，推倒重来反而柳暗花明。' },
  { label: '扎根', desc: '稳住基本盘，把根扎深，慢就是快。' },
  { label: '破圈', desc: '多走出舒适圈，结识新圈子带来新机会。' },
  { label: '滋养', desc: '把身心照顾好，被滋养的人运气不会差。' },
  { label: '发光', desc: '站到台前，让更多人看见你的实力。' },
  { label: '精进', desc: '把一门功夫练到极致，机会自会找上门。' },
  { label: '平衡', desc: '在给与得之间找平衡，别太满也别太空。' },
  { label: '重塑', desc: '关系、事业都值得重新梳理，去芜存菁。' },
  { label: '远行', desc: '走出去看世界，眼界打开了，格局也打开了。' },
  { label: '担当', desc: '扛起责任，你的靠谱会变成最硬的底牌。' },
  { label: '联结', desc: '多与人深度联结，贵人藏在你信任的人里。' },
  { label: '顺势', desc: '不硬来，顺着时势走，事半功倍。' },
] as const

export function dailyFortune(signIndex: number, dateStr: string): Fortune {
  const sign = SIGNS[signIndex]
  const key = `${dateStr}|${sign.key}`
  const seed = (k: string) => hash01(key + k)
  const stars = (k: string) => Math.floor(seed(k) * 5) + 1
  return {
    title: `${dateStr} · ${sign.name}运势`,
    overall: { stars: stars('o'), text: pick(OVERALL, seed('ot')) },
    love: { stars: stars('l'), text: pick(LOVE, seed('lt')) },
    career: { stars: stars('c'), text: pick(CAREER, seed('ct')) },
    money: { stars: stars('m'), text: pick(MONEY, seed('mt')) },
    health: { stars: stars('h'), text: pick(HEALTH, seed('ht')) },
    luckyColor: sign.luckyColor,
    luckyNumber: sign.luckyNumber,
    luckySign: Math.floor(seed('ls') * 12),
  }
}

export function weeklyFortune(signIndex: number, weekKey: string): Fortune {
  const f = dailyFortune(signIndex, weekKey)
  return { ...f, title: `${weekKey} · ${SIGNS[signIndex].name}本周运势` }
}

export function monthlyFortune(signIndex: number, monthKey: string): Fortune {
  const f = dailyFortune(signIndex, monthKey)
  return { ...f, title: `${monthKey} · ${SIGNS[signIndex].name}本月运势` }
}

export function yearlyFortune(signIndex: number, yearKey: string): Fortune {
  const sign = SIGNS[signIndex]
  const kw = pick(YEAR_KEYWORDS, hash01(`${yearKey}|${sign.key}|year`))
  const f = dailyFortune(signIndex, yearKey)
  return { ...f, title: `${yearKey} · ${sign.name}年度运势`, keyword: kw.label, keywordDesc: kw.desc }
}
