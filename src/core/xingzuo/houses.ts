// 星座十二宫位（等宫制）：以上升点为第 1 宫宫头，每宫 30°。日/月/行星落宫白话含义。仅供娱乐参考。

export interface House {
  index: number // 1-12
  name: string
  desc: string
}

export const HOUSES: House[] = [
  { index: 1, name: '命宫', desc: '自我、外貌气质与给别人的第一印象，是一个人最外显的样子。' },
  { index: 2, name: '财帛宫', desc: '钱财、价值观与自我价值的来源，也代表你如何创造与守住财富。' },
  { index: 3, name: '兄弟宫', desc: '沟通、学习、兄弟姐妹与邻里关系，短途出行也归这里。' },
  { index: 4, name: '田宅宫', desc: '家庭、根源、房产与内心安全感，是情绪的根基。' },
  { index: 5, name: '子女宫', desc: '恋爱、子女、创意与娱乐，也代表你如何表达快乐与浪漫。' },
  { index: 6, name: '奴仆宫', desc: '工作、健康、日常作息与服务，是自律与责任感的领域。' },
  { index: 7, name: '夫妻宫', desc: '婚姻、合伙与一对一关系，也投射出你期待的另一半。' },
  { index: 8, name: '疾厄宫', desc: '深度亲密、他人资源、生死与蜕变，是隐藏而深刻的部分。' },
  { index: 9, name: '迁移宫', desc: '远行、哲学、信仰与高等教育，是向外探索与精神成长。' },
  { index: 10, name: '官禄宫', desc: '事业、成就、社会地位与人生目标，是公开的野心所在。' },
  { index: 11, name: '福德宫', desc: '朋友、社群、理想与人脉，也代表你与群体、未来的关系。' },
  { index: 12, name: '玄秘宫', desc: '潜意识、灵性、独处与隐退，是内在世界与梦境栖身之地。' },
]

// 行星黄经 → 宫位（1-12）。ascLon 为上升点黄经。
export function houseOf(lon: number, ascLon: number): number {
  const offset = ((lon - ascLon) % 360 + 360) % 360
  return Math.floor(offset / 30) + 1
}

export interface BodyHouse {
  key: string
  house: number
}

// 一组黄经 → 各星落宫（不含上升点本身）。
export function housePlacements(lons: Record<string, number>, ascLon: number): BodyHouse[] {
  return Object.keys(lons)
    .filter((k) => k !== 'asc')
    .map((key) => ({ key, house: houseOf(lons[key], ascLon) }))
    .sort((a, b) => a.house - b.house)
}
