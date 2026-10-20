// 六爻摇卦：八卦 + 六十四卦数据 + 起卦/变卦推导。
// 结果仅供娱乐参考，白话卦辞按主流民间口径「说人话」。

export type YaoValue = 6 | 7 | 8 | 9 // 6老阴 7少阳 8少阴 9老阳
export type JiType = '大吉' | '吉' | '中吉' | '平' | '小凶' | '凶'

export interface Trigram {
  name: string // 卦名：乾
  nature: string // 卦象：天
  symbol: string // ☰
  lines: [number, number, number] // 自下而上，1=阳 0=阴
}

export interface Hexagram {
  name: string // 六爻卦名：乾为天
  upper: number // 上卦（八卦索引）
  lower: number // 下卦（八卦索引）
  ji: JiType
  yi: string // 白话卦辞
}

// 八卦（先天序：乾兑离震巽坎艮坤），lines 自下而上
export const TRIGRAMS: Trigram[] = [
  { name: '乾', nature: '天', symbol: '☰', lines: [1, 1, 1] },
  { name: '兑', nature: '泽', symbol: '☱', lines: [1, 1, 0] },
  { name: '离', nature: '火', symbol: '☲', lines: [1, 0, 1] },
  { name: '震', nature: '雷', symbol: '☳', lines: [1, 0, 0] },
  { name: '巽', nature: '风', symbol: '☴', lines: [0, 1, 1] },
  { name: '坎', nature: '水', symbol: '☵', lines: [0, 1, 0] },
  { name: '艮', nature: '山', symbol: '☶', lines: [0, 0, 1] },
  { name: '坤', nature: '地', symbol: '☷', lines: [0, 0, 0] },
]

// 六十四卦（按文王序）：name / 上卦 / 下卦 / 吉凶 / 白话卦辞
export const HEXAGRAMS: Hexagram[] = [
  { name: '乾为天', upper: 0, lower: 0, ji: '大吉', yi: '自强不息，正是发力的时候。目标明确、劲头足，放手去做就有回报，但也要记得收敛锋芒。' },
  { name: '坤为地', upper: 7, lower: 7, ji: '吉', yi: '厚德载物，宜守不宜攻。踏实跟对人、做对事，默默积累，水到自然渠成。' },
  { name: '水雷屯', upper: 5, lower: 3, ji: '小凶', yi: '万事开头难，起步阶段阻力多。别急着求成，先把路走稳，找人搭把手。' },
  { name: '山水蒙', upper: 6, lower:5, ji: '平', yi: '眼前信息不全，容易犯迷糊。多请教、多学习，把情况摸清再下决定。' },
  { name: '水天需', upper: 5, lower: 0, ji: '中吉', yi: '时机未到，宜静候。把准备做足，等条件成熟再出手，硬闯反而坏事。' },
  { name: '天水讼', upper: 0, lower: 5, ji: '凶', yi: '容易起争执、打官司。能退一步就退一步，赢了面子往往输了里子。' },
  { name: '地水师', upper: 7, lower: 5, ji: '平', yi: '要动用团队、众人之力。师出有名、纪律严明才行，单打独斗撑不住。' },
  { name: '水地比', upper: 5, lower: 7, ji: '吉', yi: '亲和团结、抱团取暖的好时机。找到靠谱的伙伴，互帮互助最有利。' },
  { name: '风天小畜', upper: 4, lower: 0, ji: '中吉', yi: '小有积蓄但还没到收成。慢慢攒、慢慢等，别指望一口吃成胖子。' },
  { name: '天泽履', upper: 0, lower: 1, ji: '平', yi: '如履薄冰，行事要谨慎守规矩。跟着规则走，虽慢但不出大错。' },
  { name: '地天泰', upper: 7, lower: 0, ji: '大吉', yi: '通泰顺遂，上下同心。诸事顺畅，趁势而为最有利，是难得的好局面。' },
  { name: '天地否', upper: 0, lower: 7, ji: '凶', yi: '闭塞不通，说话办事都不顺。别硬碰，先守住自己，静待局面转圜。' },
  { name: '天火同人', upper: 0, lower: 2, ji: '吉', yi: '与人和同、志同道合。敞开心扉多合作，众人拾柴火焰高。' },
  { name: '火天大有', upper: 2, lower: 0, ji: '大吉', yi: '大有收获、心想事成。运势正旺，敢于担当，财与名都能更上层楼。' },
  { name: '地山谦', upper: 7, lower: 6, ji: '大吉', yi: '谦受益，满招损。低调做人、踏实做事，越是谦虚越能走得长远。' },
  { name: '雷地豫', upper: 3, lower: 7, ji: '吉', yi: '安乐顺遂、心情舒畅。可以适当放松庆祝，但别乐极生悲、得意忘形。' },
  { name: '泽雷随', upper: 1, lower: 3, ji: '吉', yi: '随顺时势、顺水推舟。跟着大方向和靠谱的人走，自然轻松。' },
  { name: '山风蛊', upper: 6, lower: 4, ji: '小凶', yi: '旧问题积久了要爆发。得下决心整治、除旧布新，拖只会越来越糟。' },
  { name: '地泽临', upper: 7, lower: 1, ji: '吉', yi: '好运临近、正在向上。趁势推进、主动出击，机会就看你敢不敢接。' },
  { name: '风地观', upper: 4, lower: 7, ji: '平', yi: '宜静观其变、以退为进。先看清形势和人心，再决定下一步。' },
  { name: '火雷噬嗑', upper: 2, lower: 3, ji: '平', yi: '中间有阻碍，需要果断咬合、断是非。该决断就别含糊。' },
  { name: '山火贲', upper: 6, lower: 2, ji: '平', yi: '注重外表、装点门面。面子要顾，但里子更要扎实，别光好看。' },
  { name: '山地剥', upper: 6, lower: 7, ji: '凶', yi: '层层剥落、小人得势。宜静守避让，别硬扛，保存实力等风头过去。' },
  { name: '地雷复', upper: 7, lower: 3, ji: '吉', yi: '一阳来复、转机出现。坏日子到头了，重新开始的好时候，要珍惜。' },
  { name: '天雷无妄', upper: 0, lower: 3, ji: '平', yi: '勿妄动、勿投机。本本分分做正事，别心存侥幸，否则易招无妄之灾。' },
  { name: '山天大畜', upper: 6, lower: 0, ji: '吉', yi: '大有积蓄、厚积薄发。养精蓄锐、储备能量，是成大事前的蓄力期。' },
  { name: '山雷颐', upper: 6, lower: 3, ji: '平', yi: '颐养之道、自食其力。管好嘴巴、照顾好身心，靠自己最踏实。' },
  { name: '泽风大过', upper: 1, lower: 4, ji: '小凶', yi: '过度、超载，扛了不该扛的。及时减负、量力而行，别硬撑到断。' },
  { name: '坎为水', upper: 5, lower: 5, ji: '凶', yi: '险阻重重、如陷深水。保持冷静，一步步来，别慌也别冒进。' },
  { name: '离为火', upper: 2, lower: 2, ji: '中吉', yi: '光明正大、依附正确的人。借势发光，但也要留个心眼、懂得独立。' },
  { name: '泽山咸', upper: 1, lower: 6, ji: '吉', yi: '两情相悦、心意相通。感情、合作都有感应，真诚以对自然水到渠成。' },
  { name: '雷风恒', upper: 3, lower: 4, ji: '吉', yi: '恒久坚持、稳定是福。认定的事就长期做下去，别三天打鱼两天晒网。' },
  { name: '天山遁', upper: 0, lower: 6, ji: '平', yi: '宜退避、暂离是非。不是认输，是保存自己，等合适时机再回来。' },
  { name: '雷天大壮', upper: 3, lower: 0, ji: '吉', yi: '力量强盛、气势正旺。可以大胆推进，但要有分寸，别用力过猛。' },
  { name: '火地晋', upper: 2, lower: 7, ji: '吉', yi: '晋升向上、步步高升。表现自己、争取机会，容易被看见被提携。' },
  { name: '地火明夷', upper: 7, lower: 2, ji: '凶', yi: '光明受挫、才华被埋没。收敛锋芒、低调蛰伏，守住内心那团火。' },
  { name: '风火家人', upper: 4, lower: 2, ji: '吉', yi: '家庭和睦、各司其职。先把内部关系理顺，家和万事兴。' },
  { name: '火泽睽', upper: 2, lower: 1, ji: '小凶', yi: '意见分歧、貌合神离。多沟通、求同存异，别让误会越积越深。' },
  { name: '水山蹇', upper: 5, lower: 6, ji: '凶', yi: '前路艰难、举步维艰。别硬闯，绕一绕、找帮手，退一步海阔天空。' },
  { name: '雷水解', upper: 3, lower: 5, ji: '吉', yi: '险境解除、雨过天晴。赶紧行动、把问题清掉，拖不得。' },
  { name: '山泽损', upper: 6, lower: 1, ji: '平', yi: '有减损、有取舍。短期吃点亏、让点利，长远看未必是坏事。' },
  { name: '风雷益', upper: 4, lower: 3, ji: '吉', yi: '增益、得助、双赢。损上益下、互相成就，是积极进取的好时机。' },
  { name: '泽天夬', upper: 1, lower: 0, ji: '中吉', yi: '该决断了，快刀斩乱麻。光明正大地摊牌，但别做太绝、留点余地。' },
  { name: '天风姤', upper: 0, lower: 4, ji: '平', yi: '邂逅、偶遇，也有暗藏的风险。机会来了别急着上，先看对方底细。' },
  { name: '泽地萃', upper: 1, lower: 7, ji: '吉', yi: '众人聚集、力量汇聚。适合开会、组团、招兵买马，人多力量大。' },
  { name: '地风升', upper: 7, lower: 4, ji: '吉', yi: '稳步上升、由小到大。一步一个脚印往上走，根基越稳走得越高。' },
  { name: '泽水困', upper: 1, lower: 5, ji: '凶', yi: '困顿受制、进退两难。守住本心、省吃俭用，慢慢熬过去就是转机。' },
  { name: '水风井', upper: 5, lower: 4, ji: '平', yi: '井水养人、恒常不变。坚守本分、持续供给，日久见人心。' },
  { name: '泽火革', upper: 1, lower: 2, ji: '吉', yi: '变革更新、除旧立新。到了该变的时候，顺势而改，旧的不去新的不来。' },
  { name: '火风鼎', upper: 2, lower: 4, ji: '吉', yi: '鼎新、稳固、有分量。稳扎稳打开创新局面，能成气候。' },
  { name: '震为雷', upper: 3, lower: 3, ji: '平', yi: '震动惊醒、突发之事。别被吓到，稳住阵脚，惊涛之后自会平息。' },
  { name: '艮为山', upper: 6, lower: 6, ji: '平', yi: '止息、停下、安于当下。该收手时就收手，静一静想清楚再动。' },
  { name: '风山渐', upper: 4, lower: 6, ji: '吉', yi: '循序渐进、水到渠成。急不得，按部就班慢慢来，结果反而稳。' },
  { name: '雷泽归妹', upper: 3, lower: 1, ji: '平', yi: '急于求成、名分未定。别为了快而仓促决定，感情、合作都多想想。' },
  { name: '雷火丰', upper: 3, lower: 2, ji: '吉', yi: '丰盛盈满、正是高光时刻。趁热打铁，但也别挥霍，盛极会转衰。' },
  { name: '火山旅', upper: 2, lower: 6, ji: '平', yi: '行旅漂泊、人在他乡。低调谨慎、看紧财物，小有作为即可。' },
  { name: '巽为风', upper: 4, lower: 4, ji: '平', yi: '顺从渗透、无孔不入。柔中带刚、慢慢影响，比硬碰硬更管用。' },
  { name: '兑为泽', upper: 1, lower: 1, ji: '吉', yi: '喜悦沟通、如鱼得水。多交流、多分享，人缘和财运都被带旺。' },
  { name: '风水涣', upper: 4, lower: 5, ji: '平', yi: '涣散离散、人心不齐。需要把大家重新聚起来，化解隔阂。' },
  { name: '水泽节', upper: 5, lower: 1, ji: '中吉', yi: '节制有度、量入为出。管住手、管住嘴，自律的人运气不会差。' },
  { name: '风泽中孚', upper: 4, lower: 1, ji: '吉', yi: '诚信为本、以诚待人。说到做到，别人自然信你、愿意帮你。' },
  { name: '雷山小过', upper: 3, lower: 6, ji: '平', yi: '小有过越、宜下不宜上。小事可做，大事先放一放，别越界。' },
  { name: '水火既济', upper: 5, lower: 2, ji: '吉', yi: '已经成功、大局已定。守成比开拓更重要，别在收尾时掉链子。' },
  { name: '火水未济', upper: 2, lower: 5, ji: '平', yi: '尚未完成、差最后一口气。别气馁，调整节奏再冲一次，能成。' },
]

function trigramIndex(lines: [number, number, number]): number {
  return TRIGRAMS.findIndex((t) => t.lines[0] === lines[0] && t.lines[1] === lines[1] && t.lines[2] === lines[2])
}

const BY_COMBO = new Map<number, Hexagram>()
for (const h of HEXAGRAMS) BY_COMBO.set(h.upper * 8 + h.lower, h)

/** 由六爻（自下而上，1=阳 0=阴）取卦 */
export function hexagramFromLines(lines: number[]): Hexagram {
  const lower = trigramIndex([lines[0] ?? 0, lines[1] ?? 0, lines[2] ?? 0])
  const upper = trigramIndex([lines[3] ?? 0, lines[4] ?? 0, lines[5] ?? 0])
  const h = BY_COMBO.get(upper * 8 + lower)
  if (!h) throw new Error(`未知卦象 upper=${upper} lower=${lower}`)
  return h
}

/** 爻值 → 阴阳线（1=阳 0=阴） */
export function yinYang(v: YaoValue): 0 | 1 {
  return v === 7 || v === 9 ? 1 : 0
}

/** 摇一次：三枚铜钱，字=3 背=2，和为 6/7/8/9 */
export function tossOnce(): YaoValue {
  const sum = [2, 2, 2].reduce((s, base) => s + (Math.random() < 0.5 ? 3 : 2), 0)
  return sum as YaoValue
}

/** 起一卦：六爻（自下而上） */
export function tossHexagram(): YaoValue[] {
  return [tossOnce(), tossOnce(), tossOnce(), tossOnce(), tossOnce(), tossOnce()]
}

export interface LiuYaoResult {
  values: YaoValue[]
  ben: Hexagram
  bian: Hexagram | null
  moving: number[] // 动爻位置（0=初爻 … 5=上爻）
}

/** 由六爻值推本卦 + 变卦（老阴/老阳为动爻） */
export function interpret(values: YaoValue[]): LiuYaoResult {
  const ben = hexagramFromLines(values.map(yinYang))
  const moving = values.map((v, i) => (v === 6 || v === 9 ? i : -1)).filter((i) => i >= 0)
  let bian: Hexagram | null = null
  if (moving.length > 0) {
    const changed = values.map((v) => {
      if (v === 6) return 1 // 老阴 → 阳
      if (v === 9) return 0 // 老阳 → 阴
      return yinYang(v)
    })
    bian = hexagramFromLines(changed)
  }
  return { values, ben, bian, moving }
}
