// 个人深度命盘：把一个人的八字（子平日主 + 禄命三命主本 + 神煞 + 五行）翻译成
// 一份零术语的大白话报告。全部按主流民间口径，结果仅供娱乐参考。
//
// 各项依据：
// - 性格优缺点：日主十天干气质（主流公认）拆「优点 / 缺点」。
// - 适合（行业/方位/颜色/数字）：子平用神五行（computeZiPing，扶抑法）。
// - 财运类型：十神里正财 / 偏财多寡（藏干+天干一起数）。
// - 感情模式：神煞里桃花 / 红鸾 / 天喜（早动情）vs 孤辰 / 寡宿 / 阴阳差错 / 魁罡（慢热波折）。
// - 健康薄弱点：八字八字符的五行偏旺 / 偏缺 → 脏腑。
// - 贵人 / 小人：天乙贵人属相（日干+年干起）；六冲 / 相害 / 相刑你的生肖。

import { Person } from '../../types/person'
import { DestinyReport } from '../../types/destiny'
import { ShiShenCategory } from '../../types/luming'
import { computeBaZi, BaZiResult } from '../rules/bazi'
import { computeLuMing } from '../rules/luming'
import { computeZiPing } from '../rules/ziPing'
import { Stem, Branch, BRANCHES } from '../rules/ganzhi'
import { WuXing, WU_XING, STEM_WU_XING, BRANCH_WU_XING } from '../rules/fiveElement'
import { zodiacOf } from '../rules/zodiac'
import { isLiuChong, isXiangHai } from '../rules/ganzhi'
import { shenShaGanNames } from '../rules/luming'

// ---------------- 日主十天干：nature + 优点/缺点 ----------------
const DAY_MASTER_CHARACTER: Record<Stem, { nature: string; good: string[]; bad: string[] }> = {
  0: {
    nature: '像一棵向上生长的大树，正直、有担当',
    good: ['有主见，认定的事就往前冲', '正直坦率，愿意扛责任', '目标感强，不甘于原地踏步'],
    bad: ['偶尔固执，认准了就不回头，听不进劝'],
  },
  1: {
    nature: '像花草藤蔓，柔韧、灵活、善于适应',
    good: ['温和好相处，能屈能伸', '观察细，很会察言观色', '适应力强，什么环境都能扎根'],
    bad: ['有时优柔寡断，缺一点主见'],
  },
  2: {
    nature: '像太阳，热情、光明、藏不住情绪',
    good: ['热情开朗，走到哪都自带热度', '心直口快，喜怒都写在脸上', '行动力强，说干就干'],
    bad: ['有时急躁，容易三分钟热度'],
  },
  3: {
    nature: '像烛火，温和、细腻、有洞察力',
    good: ['心思细腻，很会照顾人', '观察入微，能看透别人的情绪'],
    bad: ['敏感，容易想多', '表面温和，内心有自己的坚持'],
  },
  4: {
    nature: '像山岳大地，稳重、厚道、靠得住',
    good: ['稳重可靠，让人安心', '重承诺、讲信用', '包容心强，不轻易翻脸'],
    bad: ['有时固执，认死理'],
  },
  5: {
    nature: '像田园沃土，细腻、务实、滋养别人',
    good: ['踏实细心，做事让人放心', '会照顾人，甘愿当配角', '精打细算，很务实'],
    bad: ['有时想太多，过于谨慎'],
  },
  6: {
    nature: '像刀剑金属，果断、刚强、重义气',
    good: ['果断干脆，不拖泥带水', '原则性强，说一不二', '重情重义，为朋友两肋插刀'],
    bad: ['有时太硬，容易无意中伤人'],
  },
  7: {
    nature: '像珠宝玉石，精致、敏感、追求完美',
    good: ['追求品质和细节，很讲究', '有审美、有品味'],
    bad: ['有时挑剔，容易玻璃心', '自尊心强，好面子'],
  },
  8: {
    nature: '像江河大海，聪明、奔放、不安于现状',
    good: ['聪明机灵，点子特别多', '心胸开阔，不记仇', '向往自由，最不喜欢被管束'],
    bad: ['有时善变，比较随性'],
  },
  9: {
    nature: '像雨露细流，柔和、智慧、内敛',
    good: ['温柔细腻，很有同理心', '内敛低调，不爱出风头'],
    bad: ['有时多愁善感，比较被动', '心思深沉，想得多'],
  },
}

// ---------------- 五行 → 适合的行业/方位/颜色/数字 ----------------
const WU_XING_SUITABLE: Record<WuXing, { industries: string[]; direction: string; colors: string[]; numbers: string[] }> = {
  木: {
    industries: ['教育、培训、文职', '林业、园艺、农业', '出版、文案、服装', '文化、养生'],
    direction: '东',
    colors: ['青', '绿'],
    numbers: ['3', '8'],
  },
  火: {
    industries: ['能源、电力、餐饮', '互联网、传媒、广告', '美容、娱乐、演艺', '照明、化工'],
    direction: '南',
    colors: ['红', '紫'],
    numbers: ['2', '7'],
  },
  土: {
    industries: ['地产、建筑、装修', '农业、种植、养殖', '矿产、陶瓷、仓储', '管理、中介、咨询'],
    direction: '本地 / 中部',
    colors: ['黄', '棕', '米'],
    numbers: ['5', '10'],
  },
  金: {
    industries: ['金融、投资、保险', '机械、制造、五金', '法律、军警、纪检', '汽车、珠宝'],
    direction: '西',
    colors: ['白', '金', '银'],
    numbers: ['4', '9'],
  },
  水: {
    industries: ['物流、运输、贸易', '旅游、酒店、餐饮', '销售、市场、流通', '酒水、饮品、水产'],
    direction: '北',
    colors: ['黑', '蓝'],
    numbers: ['1', '6'],
  },
}

// ---------------- 五行 → 脏腑 ----------------
const WU_XING_ORGAN: Record<WuXing, string> = {
  木: '肝胆、筋骨、眼睛',
  火: '心脏、血脉、眼睛',
  土: '脾胃、消化',
  金: '肺、呼吸道、皮肤',
  水: '肾、膀胱、泌尿',
}

// 三刑（相刑）：寅巳申、丑戌未、子卯、辰午酉亥（自刑）
const SAN_XING_GROUPS: Branch[][] = [
  [2, 5, 8], // 寅巳申
  [1, 10, 7], // 丑戌未
  [0, 3], // 子卯
  [4, 6, 9, 11], // 辰午酉亥
]

function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

function toBirthTime(p: Person) {
  return { year: p.birthYear, month: p.birthMonth, day: p.birthDay, hour: p.hour, minute: p.minute }
}

/** 八字八字符（天干 + 地支本气）五行计数 */
function wuXing8(bazi: BaZiResult): Record<WuXing, number> {
  const count: Record<WuXing, number> = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 }
  for (const p of [bazi.yearPillar, bazi.monthPillar, bazi.dayPillar, bazi.hourPillar]) {
    if (!p) continue
    count[STEM_WU_XING[p.ganZhi.stem]]++
    count[BRANCH_WU_XING[p.ganZhi.branch]]++
  }
  return count
}

/** 天乙贵人（某天干起）落在哪些地支 */
function tianYiBranches(stem: Stem): Branch[] {
  return BRANCHES.map((_, b) => b as Branch).filter((b) => shenShaGanNames(stem, b).includes('天乙贵人'))
}

export function computeDestiny(person: Person): DestinyReport {
  const bazi = computeBaZi(toBirthTime(person))
  const lm = computeLuMing(toBirthTime(person))
  const zp = computeZiPing(toBirthTime(person))

  const dayStem = bazi.dayPillar.ganZhi.stem
  const yearStem = bazi.yearPillar.ganZhi.stem
  const yearBranch = bazi.zodiac

  // -------- 概览 --------
  const genderLabel = person.gender === 'male' ? '男' : person.gender === 'female' ? '女' : '未填'
  const baziGrid = [
    { label: '年柱', ganZhi: bazi.yearPillar.name, nayin: bazi.yearPillar.nayin },
    { label: '月柱', ganZhi: bazi.monthPillar.name, nayin: bazi.monthPillar.nayin },
    { label: '日柱', ganZhi: bazi.dayPillar.name, nayin: bazi.dayPillar.nayin },
    {
      label: '时柱',
      ganZhi: bazi.hourPillar ? bazi.hourPillar.name : '缺时辰',
      nayin: bazi.hourPillar ? bazi.hourPillar.nayin : '未算',
    },
  ]
  const sanMingText = `禄在${lm.sanMing.lu}（主名声贵贱）、命在${lm.sanMing.ming}（主际遇荣枯）、身为${lm.sanMing.shen}（主才能器识）`

  // -------- 性格 --------
  const dc = DAY_MASTER_CHARACTER[dayStem]
  const strengths = dc.good
  const weaknesses = dc.bad
  const summary = `${person.name}日主${zp.dayMasterLabel}，${dc.nature}。${zp.text}`

  // -------- 适合 --------
  const ys = zp.yongShenWuXing
  const suitable = {
    industries: ys.flatMap((w) => WU_XING_SUITABLE[w].industries),
    directions: uniq(ys.map((w) => WU_XING_SUITABLE[w].direction)),
    colors: uniq(ys.flatMap((w) => WU_XING_SUITABLE[w].colors)),
    numbers: uniq(ys.flatMap((w) => WU_XING_SUITABLE[w].numbers)),
    basedOn: `按八字日主强弱（子平扶抑法）推的喜用五行：${ys.map((w) => w).join('、')}。娱乐参考。`,
  }

  // -------- 财运 --------
  let zhengCai = 0
  let pianCai = 0
  for (const p of lm.pillars) {
    for (const s of p.shiShen) {
      if (s.name === '正财') zhengCai++
      else if (s.name === '偏财') pianCai++
    }
  }
  const shiShang = lm.shiShenCount['食伤']
  const guanSha = lm.shiShenCount['官杀']

  let wealthType: string
  let wealthStyle: string
  let wealthText: string
  if (pianCai > zhengCai) {
    wealthType = '偏财为主'
    wealthStyle = '适合搏（但要控风险）'
    wealthText = '你的财路偏机会型，容易有副业、外快、投资这类进账。机会来的时候敢抓，但一定要给自己留后路，别梭哈。'
  } else if (zhengCai > pianCai) {
    wealthType = '正财为主'
    wealthStyle = '适合稳'
    wealthText = '你的财路偏稳，靠主业、薪水、日积月累的正当收入。深耕一行、把手艺练精，钱来得踏实。'
  } else {
    wealthType = '正偏都有'
    wealthStyle = '稳中带搏'
    wealthText = '你正财偏财都有，适合「主业稳住 + 副业试水」两条腿走路，稳字打底再搏机会。'
  }
  if (shiShang >= 2) wealthText += '你有才艺、口才或创意能生财，把本事变现是好路子。'
  if (guanSha >= 2) wealthText += '你更适合走正规、有平台约束的渠道，别碰来路不明的快钱。'

  // -------- 感情 --------
  const has = (n: string) => lm.shenShaAll.includes(n)
  const warm = ['桃花', '红鸾', '天喜'].filter(has)
  const cool = ['孤辰', '寡宿', '阴阳差错', '魁罡'].filter(has)
  const timing = warm.length >= 2 ? '早动情、容易早婚' : cool.length >= 1 ? '慢热，容易晚婚或感情波折' : '看缘分，不早不晚'
  const meet = warm.length >= 1 ? '容易遇到主动、热情、会来事、很会表达的人' : '容易遇到内敛、踏实、慢热、靠得住的人'
  const caution = cool.length >= 1 ? '感情上要多把话说开、多确认，别让误会和顾虑越攒越多' : '别太快上头，多观察人品和相处细节再定'
  const loveText = `${timing}。${meet}。${caution}。`

  // -------- 健康 --------
  const wcount = wuXing8(bazi)
  const strongW = WU_XING.filter((w) => wcount[w] >= 2)
  const weakW = WU_XING.filter((w) => wcount[w] === 0)
  const weakAreas: string[] = []
  for (const w of strongW) weakAreas.push(`${WU_XING_ORGAN[w]}容易过劳，注意别透支`)
  for (const w of weakW) weakAreas.push(`${WU_XING_ORGAN[w]}偏弱，是先天短板，平时多养`)
  if (weakAreas.length === 0) weakAreas.push('五行比较均衡，没有特别明显的短板，保持作息规律即可')
  const tips = weakW.length ? weakW.map((w) => `${WU_XING_ORGAN[w]}多上心，作息规律、别熬夜，跟着季节养身`) : ['作息规律、别熬夜、多运动，跟着季节养身']
  const healthText = weakAreas.join('；') + '。' + (weakW.length ? '偏弱的地方平时多上心。' : '')

  // -------- 贵人 / 小人 --------
  const benefactorBranches = uniq([...tianYiBranches(dayStem), ...tianYiBranches(yearStem)])
  const benefactorZodiacs = benefactorBranches.map((b) => zodiacOf(b))

  const chong = BRANCHES.map((_, b) => b as Branch).filter((b) => b !== yearBranch && isLiuChong(yearBranch, b))
  const hai = BRANCHES.map((_, b) => b as Branch).filter((b) => b !== yearBranch && isXiangHai(yearBranch, b))
  const xingGroup = SAN_XING_GROUPS.find((g) => g.includes(yearBranch)) ?? []
  const xing = xingGroup.filter((b) => b !== yearBranch)
  const villainZodiacs = uniq([...chong, ...hai, ...xing]).map((b) => zodiacOf(b))

  // -------- 会犯什么 --------
  const dominant: ShiShenCategory = (['比劫', '食伤', '财', '官杀', '印'] as ShiShenCategory[]).reduce((acc, c) =>
    lm.shiShenCount[c] > lm.shiShenCount[acc] ? c : acc,
  )
  const careerCautions: string[] = []
  if (has('驿马')) careerCautions.push('你适合多跑动、多换环境，但也别频繁变动把自己折腾散')
  if (has('羊刃') || has('劫煞')) careerCautions.push('职场竞争不少，容易遇抢功或突发状况，重要的事多留证据、留后手')
  if (dominant === '官杀') careerCautions.push('你压力容易偏大，别什么都自己扛，学会分活、学会拒绝')
  if (dominant === '食伤') careerCautions.push('你有才，但说话容易太直得罪人，表达前先想三秒')
  if (careerCautions.length === 0) careerCautions.push('事业上按部就班、稳扎稳打，别急着跳来跳去')

  const wealthCautions: string[] = []
  if (pianCai > zhengCai) wealthCautions.push('你偏财机会多，但快钱风险也大，别梭哈、别赌')
  else wealthCautions.push('你财路偏稳，光靠主业太慢，适当开源、把手艺练成护城河')
  if (zhengCai + pianCai === 0) wealthCautions.push('八字里财星不显，赚钱要更主动规划，别被动等')

  return {
    hasHour: bazi.hasHour,
    hasGender: person.gender !== undefined,
    overview: {
      name: person.name,
      genderLabel,
      dayMasterLabel: zp.dayMasterLabel,
      shenQiang: zp.shenQiang,
      shenQiangText: zp.text,
      baziGrid,
      sanMingText,
      mainBenText: lm.mainBen.text,
    },
    character: {
      strengths,
      weaknesses,
      dayMasterNature: dc.nature,
      summary,
    },
    suitable,
    wealth: { type: wealthType, style: wealthStyle, text: wealthText },
    love: { timing, meet, caution, text: loveText },
    health: { weakAreas, tips, text: healthText },
    benefactor: {
      zodiacs: benefactorZodiacs,
      trait: '关键时候拉你一把、逢凶化吉的人，往往是长辈、领导或比你成熟稳重的人。',
      text: `属${benefactorZodiacs.join('、')}的人，容易当你的贵人，遇到难事可以多找他们商量。`,
    },
    villain: {
      zodiacs: villainZodiacs,
      trait: '跟你气场不合、容易起摩擦或背后使绊的人，合作共事要多留个心眼。',
      text: `属${villainZodiacs.join('、')}的人，跟你容易有摩擦，打交道把话说清、多留个心眼。`,
    },
    cautions: {
      health: weakAreas.slice(0, 2),
      wealth: wealthCautions,
      love: [caution],
      career: careerCautions.slice(0, 2),
      character: weaknesses.slice(0, 2),
    },
  }
}
