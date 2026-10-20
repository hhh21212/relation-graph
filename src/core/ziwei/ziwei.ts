// 紫微斗数排盘（简化版）：十二宫 + 命宫/身宫 + 十四主星 + 生年四化 + 五行局。
// 命宫主星性格总述为核心输出。仅供娱乐参考。

import { Solar } from 'lunar-javascript'
import { ganZhiIndex, yinMonthStemOf, STEMS, BRANCHES, type Stem, type Branch } from '../rules/ganzhi'
import { nayinOfGanZhi } from '../rules/nayin'
import { SIHUA } from './stars'

export interface ZiWeiInput {
  year: number
  month: number
  day: number
  hour?: number // 0-23
  gender?: 'male' | 'female' // 用于大限顺逆
}

export interface ZiWeiPan {
  lunarText: string
  yearStem: Stem
  yearBranch: Branch
  mingGong: Branch
  shenGong: Branch
  ju: number // 2-6
  juName: string
  palaceStems: Stem[] // index = 地支
  stars: Record<string, Branch> // 主星 starKey -> 地支
  auxStars: Record<string, Branch> // 辅星 starKey -> 地支
  sihua: { lu: string; quan: string; ke: string; ji: string }
  mingStars: string[] // 命宫主星 keys
  mingEmpty: boolean
  qianyiStars: string[] // 迁移宫主星 keys（空宫借对宫）
  dayun: DaYunStep[] // 十二步大限
}

// 十二宫名：从命宫起逆时针。
export const PALACE_NAMES = [
  '命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫',
  '迁移宫', '交友宫', '官禄宫', '田宅宫', '福德宫', '父母宫',
] as const

// 十二宫宫义（白话）
export const PALACE_TOPICS = [
  '命主本人，性格、气质与一生格局的总纲。',
  '兄弟姐妹、平辈关系，也主合伙与助力。',
  '婚姻感情、配偶缘分与相处模式。',
  '子女缘分、晚辈，也主生育与投资。',
  '钱财进出、赚钱能力与理财方式。',
  '身体健康、体质强弱与疾病倾向。',
  '外出、远行、社会活动与人缘际遇。',
  '朋友、同事、合作伙伴与人脉。',
  '事业、工作、成就与社会地位。',
  '房产、家庭、祖业与居住环境。',
  '精神、福气、兴趣与内心状态。',
  '父母长辈、出身背景与上司关系。',
] as const

export interface DaYunStep {
  palace: Branch
  startAge: number
  endAge: number
  isCurrent: boolean
}

const JU_BY_WUXING: Record<string, number> = { 水: 2, 木: 3, 金: 4, 土: 5, 火: 6 }
const JU_NAME: Record<number, string> = { 2: '水二局', 3: '木三局', 4: '金四局', 5: '土五局', 6: '火六局' }

// 紫微星系：相对紫微逆时针偏移（子=0）
const ZIWEI_GROUP: { key: string; offset: number }[] = [
  { key: 'ziwei', offset: 0 },
  { key: 'tianji', offset: -1 },
  { key: 'taiyang', offset: -3 },
  { key: 'wuqu', offset: -4 },
  { key: 'tiantong', offset: -5 },
  { key: 'lianzhen', offset: -8 },
]
// 天府星系：相对天府顺时针偏移
const TIANFU_GROUP: { key: string; offset: number }[] = [
  { key: 'tianfu', offset: 0 },
  { key: 'taiyin', offset: 1 },
  { key: 'tanlang', offset: 2 },
  { key: 'jumen', offset: 3 },
  { key: 'tianxiang', offset: 4 },
  { key: 'tianliang', offset: 5 },
  { key: 'qisha', offset: 6 },
  // 七杀后空三宫（+7/+8/+9），破军在 +10，再隔一宫（+11）回到天府。
  { key: 'pojun', offset: 10 },
]

const STAR_KEYS = [...ZIWEI_GROUP, ...TIANFU_GROUP].map((s) => s.key)

const mod12 = (n: number) => ((n % 12) + 12) % 12

function yearStemOf(lunarYear: number): Stem {
  return (((lunarYear - 4) % 10) + 10) % 10
}

// ---------------- 十三辅星排布 ----------------

// 禄存（年干）：甲禄在寅、乙禄在卯、丙戊禄在巳、丁己禄在午、庚禄在申、辛禄在酉、壬禄在亥、癸禄在子。
const LU_CUN: Branch[] = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0]
// 天魁（年干）：甲戊庚牛羊(丑)、乙己鼠猴(子)、丙丁猪鸡(亥)、辛逢马虎(午)、壬癸兔蛇(卯)。
const TIAN_KUI: Branch[] = [1, 0, 11, 11, 1, 0, 1, 6, 3, 3]
// 天钺（年干）
const TIAN_YUE: Branch[] = [7, 8, 9, 9, 7, 8, 7, 2, 5, 5]
// 火星/铃星起始宫（按年支三合局）：[火星起, 铃星起]，均自子时起顺数生时。
const HUO_LING_START: [Branch, Branch][] = [
  [2, 10], // 子（申子辰）：火星寅、铃星戌
  [3, 10], // 丑（巳酉丑）：火星卯、铃星戌
  [1, 3], // 寅（寅午戌）：火星丑、铃星卯
  [9, 10], // 卯（亥卯未）：火星酉、铃星戌
  [2, 10], // 辰
  [3, 10], // 巳
  [1, 3], // 午
  [9, 10], // 未
  [2, 10], // 申
  [3, 10], // 酉
  [1, 3], // 戌
  [9, 10], // 亥
]

function auxStars(lMonth: number, hourBranch: Branch, yStem: Stem, yBranch: Branch): Record<string, Branch> {
  const lucun = LU_CUN[yStem]
  const [huoStart, lingStart] = HUO_LING_START[yBranch]
  return {
    lucun,
    qingyang: mod12(lucun + 1), // 擎羊 = 禄存前
    tuoluo: mod12(lucun - 1), // 陀罗 = 禄存后
    zuofu: mod12(4 + (lMonth - 1)), // 左辅：辰起正月顺
    youbi: mod12(10 - (lMonth - 1)), // 右弼：戌起正月逆
    wenchang: mod12(10 - hourBranch), // 文昌：戌起子时逆
    wenqu: mod12(4 + hourBranch), // 文曲：辰起子时顺
    tiankui: TIAN_KUI[yStem],
    tianyue: TIAN_YUE[yStem],
    huoxing: mod12(huoStart + hourBranch),
    lingxing: mod12(lingStart + hourBranch),
    dikong: mod12(11 - hourBranch), // 地空：亥起子时逆
    dijie: mod12(11 + hourBranch), // 地劫：亥起子时顺
  }
}

// 安紫微星：生日数 ÷ 局数 = 商 … 余。口诀「生日除局，商宫前走，余为奇逆、余为偶顺」。
export function anZiWei(day: number, ju: number): Branch {
  const Q = Math.floor(day / ju)
  const R = day % ju
  if (R === 0) return mod12(Q + 1) // 整除：寅起顺数商位
  const k = ju - R // 最小加数
  return k % 2 === 1 ? mod12(2 + Q - k) : mod12(2 + Q + k)
}

export function computeZiWei(input: ZiWeiInput): ZiWeiPan {
  const { year, month, day } = input
  const lunar = Solar.fromYmd(year, month, day).getLunar()
  const lMonth = Math.abs(lunar.getMonth()) // 农历月 1-12（闰月按本月）
  const lDay = lunar.getDay() // 农历日 1-30
  const lunarYear = lunar.getYear()
  const yStem = yearStemOf(lunarYear)
  const yBranch = mod12(lunarYear - 4)

  const hourBranch: Branch = input.hour === undefined ? 0 : Math.floor((input.hour + 1) / 2) % 12

  // 命宫：寅上起正月，顺数生月，逆数生时（子=1）。身宫：从命宫顺数生时。
  const mingGong = mod12(lMonth + 1 - hourBranch)
  const shenGong = mod12(mingGong + hourBranch)

  // 五虎遁：寅宫天干，顺行布十二宫天干。
  const yinStem = yinMonthStemOf(yStem)
  const palaceStems: Stem[] = []
  for (let b = 0; b < 12; b++) {
    const pos = mod12(b - 2) // 寅=0
    palaceStems[b] = (yinStem + pos) % 10
  }

  // 五行局：命宫干支纳音五行 → 局数。
  const mingStem = palaceStems[mingGong]
  const nayin = nayinOfGanZhi(ganZhiIndex(mingStem, mingGong))
  const ju = JU_BY_WUXING[nayin.wuXing] ?? 5

  // 安紫微、安天府（天府与紫微以寅申线对称）。
  const ziwei = anZiWei(lDay, ju)
  const tianfu = mod12(4 - ziwei)

  // 布十四主星。
  const stars: Record<string, Branch> = {}
  for (const { key, offset } of ZIWEI_GROUP) stars[key] = mod12(ziwei + offset)
  for (const { key, offset } of TIANFU_GROUP) stars[key] = mod12(tianfu + offset)

  // 四化。
  const sh = SIHUA[yStem]

  // 命宫 / 迁移宫主星。
  const mingStars = STAR_KEYS.filter((k) => stars[k] === mingGong)
  const qianyiGong = mod12(mingGong + 6)
  const qianyiStars = STAR_KEYS.filter((k) => stars[k] === qianyiGong)

  // 大限：阳男阴女顺行、阴男阳女逆行；起限岁数 = 局数，每宫十年。
  const isYang = yStem % 2 === 0
  const isMale = input.gender !== 'female'
  const forward = isYang === isMale
  const nowYear = new Date().getFullYear()
  const age = nowYear - year
  const dayun: DaYunStep[] = []
  for (let i = 0; i < 12; i++) {
    const palace = mod12(mingGong + (forward ? i : -i))
    const startAge = ju + i * 10
    const endAge = startAge + 9
    dayun.push({ palace, startAge, endAge, isCurrent: age >= startAge && age <= endAge })
  }

  return {
    lunarText: `${lunar.getYearInChinese()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    yearStem: yStem,
    yearBranch: yBranch,
    mingGong,
    shenGong,
    ju,
    juName: JU_NAME[ju],
    palaceStems,
    stars,
    auxStars: auxStars(lMonth, hourBranch, yStem, yBranch),
    sihua: { lu: sh.lu, quan: sh.quan, ke: sh.ke, ji: sh.ji },
    mingStars,
    mingEmpty: mingStars.length === 0,
    qianyiStars,
    dayun,
  }
}

// ---------------- 流年四化 ----------------

export interface LiuNian {
  year: number
  gan: Stem
  zhi: Branch
  ganName: string
  zhiName: string
  sihua: { lu: string; quan: string; ke: string; ji: string }
  mingGong: Branch
}

// 流年命盘：流年天干四化 + 流年命宫（流年地支宫起正月、顺数生月、逆数生时）。
export function computeLiuNian(input: ZiWeiInput, liuYear: number): LiuNian {
  const gan = (((liuYear - 4) % 10) + 10) % 10
  const zhi = mod12(liuYear - 4)
  const lunar = Solar.fromYmd(input.year, input.month, input.day).getLunar()
  const lMonth = Math.abs(lunar.getMonth())
  const hourBranch: Branch = input.hour === undefined ? 0 : Math.floor((input.hour + 1) / 2) % 12
  const mingGong = mod12(zhi + lMonth - 1 - hourBranch)
  const sh = SIHUA[gan]
  return {
    year: liuYear,
    gan,
    zhi,
    ganName: STEMS[gan],
    zhiName: BRANCHES[zhi],
    sihua: { lu: sh.lu, quan: sh.quan, ke: sh.ke, ji: sh.ji },
    mingGong,
  }
}

// ---------------- 三方四正与格局 ----------------

// 命宫三方四正：本宫 + 财帛(+4) + 迁移(+6) + 官禄(+8)
export function sanFangSiZheng(mingGong: Branch): Branch[] {
  return [mingGong, mod12(mingGong + 4), mod12(mingGong + 6), mod12(mingGong + 8)]
}

export interface Pattern {
  name: string
  desc: string
}

export function detectPatterns(pan: ZiWeiPan): Pattern[] {
  const branches = sanFangSiZheng(pan.mingGong)
  const has = (k: string) => branches.includes(pan.stars[k])
  const sameHouse = (k1: string, k2: string) => pan.stars[k1] === pan.stars[k2] && branches.includes(pan.stars[k1])

  const out: Pattern[] = []
  if (sameHouse('ziwei', 'tianfu')) out.push({ name: '紫府同宫', desc: '紫微天府同宫（寅申），帝王配库星，稳重尊贵、名利双收。' })
  if (sameHouse('ziwei', 'tanlang')) out.push({ name: '紫微贪狼', desc: '紫微贪狼同宫（卯酉），才艺与欲望并存，桃花人缘皆旺。' })
  if (sameHouse('ziwei', 'tianxiang')) out.push({ name: '紫微天相', desc: '紫微天相同宫（辰戌），尊贵而圆融，适合辅佐与掌权。' })
  if (sameHouse('ziwei', 'qisha')) out.push({ name: '紫微七杀', desc: '紫微七杀同宫（巳亥），将星随帝星，魄力十足、开创型领导。' })
  if (sameHouse('taiyang', 'taiyin')) out.push({ name: '日月同宫', desc: '太阳太阴同宫（丑未），性格圆融、情绪丰富，人缘极佳。' })
  if (sameHouse('wuqu', 'tianfu')) out.push({ name: '武曲天府', desc: '武曲天府同宫（子午），财星会库星，理财与事业皆强。' })

  const tanlangBranch = pan.stars['tanlang']
  if (branches.includes(tanlangBranch)) {
    if (pan.auxStars['huoxing'] === tanlangBranch) out.push({ name: '火贪格', desc: '贪狼会火星，横发格局，偏财爆发、一夜翻盘之象。' })
    if (pan.auxStars['lingxing'] === tanlangBranch) out.push({ name: '铃贪格', desc: '贪狼会铃星，暗发格局，偏财后发、闷声发财。' })
  }

  if (['qisha', 'pojun', 'tanlang'].some(has)) out.push({ name: '杀破狼格', desc: '命带杀破狼，一生多变、勇于开创，适合在变动中闯天地。' })

  const jiYue = ['tianji', 'taiyin', 'tiantong', 'tianliang'].filter(has).length
  if (jiYue >= 3) out.push({ name: '机月同梁格', desc: '天机太阴天同天梁会照，心思细腻、稳重圆融，适合公职与专业。' })

  if (has('tianfu') && has('tianxiang')) out.push({ name: '府相朝垣格', desc: '天府天相会照命宫三方，稳重有福、掌财掌权。' })

  // 阳梁昌禄格：太阳、天梁会文昌或禄存
  if (has('taiyang') && has('tianliang') && (branches.includes(pan.auxStars['wenchang']) || branches.includes(pan.auxStars['lucun']))) {
    out.push({ name: '阳梁昌禄格', desc: '太阳、天梁会文昌或禄存，聪明正直、利考利官，是「清贵」格局。' })
  }
  // 月朗天门格：太阴在亥
  if (pan.stars['taiyin'] === 11 && branches.includes(pan.stars['taiyin'])) {
    out.push({ name: '月朗天门格', desc: '太阴在亥宫，月照天门，聪明内秀、财运人缘俱佳，晚景更佳。' })
  }
  // 日照雷门格：太阳在卯
  if (pan.stars['taiyang'] === 3 && branches.includes(pan.stars['taiyang'])) {
    out.push({ name: '日照雷门格', desc: '太阳在卯宫，旭日东升、气势非凡，主贵气与声名远播。' })
  }
  // 石中隐玉格：巨门在子或午
  if ((pan.stars['jumen'] === 0 || pan.stars['jumen'] === 6) && branches.includes(pan.stars['jumen'])) {
    out.push({ name: '石中隐玉格', desc: '巨门在子午，如美玉藏石中，才华内敛、晚发大器，先苦后甜。' })
  }
  // 明珠出海格：太阳天梁同宫于卯酉
  if (sameHouse('taiyang', 'tianliang') && (pan.stars['taiyang'] === 3 || pan.stars['taiyang'] === 9)) {
    out.push({ name: '明珠出海格', desc: '太阳天梁同宫于卯酉，如明珠出海，聪明磊落、福寿双全。' })
  }
  // 双禄朝垣格：禄存与化禄星同会三方
  const huaLuBranch = pan.stars[pan.sihua.lu] ?? pan.auxStars[pan.sihua.lu]
  if (branches.includes(pan.auxStars['lucun']) && branches.includes(huaLuBranch)) {
    out.push({ name: '双禄朝垣格', desc: '禄存与化禄同会命宫三方，财禄双收、一生不缺钱花。' })
  }
  // 极向离明格：紫微在午
  if (pan.stars['ziwei'] === 6 && branches.includes(pan.stars['ziwei'])) {
    out.push({ name: '极向离明格', desc: '紫微在午宫，帝星入极位、光明磊落，贵气十足、名利双收。' })
  }
  // 马头带箭格：天同擎羊同宫于午
  if (pan.stars['tiantong'] === 6 && pan.auxStars['qingyang'] === 6) {
    out.push({ name: '马头带箭格', desc: '天同会擎羊于午，先破后立、困而后发，是「发迹」之格。' })
  }

  return out
}

// ---------------- 宫干四化飞星 ----------------

export interface SiHuaFly {
  kind: 'lu' | 'quan' | 'ke' | 'ji'
  star: string
  toGong: Branch // 四化飞入的宫（地支）
}

export interface GongSiHua {
  fromGong: Branch
  fromOffset: number // 以命宫为 0 起的宫位序
  stem: Stem
  flies: SiHuaFly[]
}

// 每个宫位天干产生的禄权科忌，飞入对应星曜所在宫位。
export function computeGongSiHua(pan: ZiWeiPan): GongSiHua[] {
  return pan.palaceStems.map((stem, b) => {
    const sh = SIHUA[stem]
    const flies: SiHuaFly[] = (['lu', 'quan', 'ke', 'ji'] as const).map((kind) => ({
      kind,
      star: sh[kind],
      toGong: pan.stars[sh[kind]] ?? pan.auxStars[sh[kind]],
    }))
    return { fromGong: b, fromOffset: mod12(b - pan.mingGong), stem, flies }
  })
}
