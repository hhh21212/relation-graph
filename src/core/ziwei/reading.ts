// 紫微斗数 · 白话综合论命 + 大限逐宫详解。仅供娱乐参考。
import { detectPatterns, sanFangSiZheng, PALACE_NAMES, PALACE_TOPICS, type ZiWeiPan, type LiuNian } from './ziwei'
import { STAR_MAP, AUX_STARS, starNameOf, brightnessOf } from './stars'

const mod12 = (n: number) => ((n % 12) + 12) % 12
const gongOf = (pan: ZiWeiPan, b: number) => PALACE_NAMES[mod12(pan.mingGong - b)]
const SIHUA_CHAR = { lu: '禄', quan: '权', ke: '科', ji: '忌' } as const

// 命宫 + 身宫 + 三方四正 + 格局 + 生年四化 → 一段连贯白话总论。
export function comprehensiveReading(pan: ZiWeiPan): string {
  // 命宫
  let ming: string
  if (pan.mingEmpty) {
    ming = pan.qianyiStars.length > 0
      ? `命宫无主星（空宫），性情较随环境而变，通常借迁移宫「${pan.qianyiStars.map(starNameOf).join('、')}」来看。`
      : '命宫无主星（空宫），性情较随环境而变，待人随和、有弹性。'
  } else {
    const names = pan.mingStars.map(starNameOf)
    const traits = [...new Set(pan.mingStars.flatMap((k) => STAR_MAP[k].traits.slice(0, 2)))]
    ming = `命宫坐${names.join('、')}${pan.mingStars.length > 1 ? '（双星同宫）' : ''}，性格${traits.join('、')}。`
  }

  // 身宫
  const shen = pan.shenGong === pan.mingGong
    ? '身命同宫，一生以自我为核心、心口如一，先天与后天走向一致。'
    : `身宫在${gongOf(pan, pan.shenGong)}，主中晚年与后天重心落在「${PALACE_TOPICS[mod12(pan.mingGong - pan.shenGong)]}」`

  // 三方四正与格局
  const sfsz = sanFangSiZheng(pan.mingGong)
  const ji = AUX_STARS.filter((s) => s.kind === '吉' && sfsz.includes(pan.auxStars[s.key])).length
  const sha = AUX_STARS.filter((s) => s.kind === '煞' && sfsz.includes(pan.auxStars[s.key])).length
  const patterns = detectPatterns(pan)
  let sfszText: string
  if (patterns.length > 0) {
    sfszText = `三方四正见「${patterns.map((p) => p.name).join('」「')}」：${patterns[0].desc}`
  } else if (ji > sha) {
    sfszText = `三方四正吉星（${ji}）多于煞星（${sha}），贵人助力较多、格局偏吉。`
  } else if (sha > ji) {
    sfszText = `三方四正煞星（${sha}）多于吉星（${ji}），人生起伏较大、需靠后天修炼补强。`
  } else {
    sfszText = '三方四正吉煞相当，格局平稳，走势看大限流年。'
  }

  // 生年四化落宫
  const sihua = (['lu', 'quan', 'ke', 'ji'] as const)
    .map((k) => {
      const star = pan.sihua[k]
      const branch = pan.stars[star] ?? pan.auxStars[star]
      return `${SIHUA_CHAR[k]}${starNameOf(star)}入${gongOf(pan, branch)}`
    })
    .join('、')

  return `${ming}${shen}。${sfszText}。生年四化：${sihua}，是此生最被强调的几条线索。`
}

// 大限逐宫：12 步大限每步落宫 + 白话点评。
export interface DaYunDetail {
  startAge: number
  endAge: number
  palaceName: string
  isCurrent: boolean
  text: string
}

export function dayunDetail(pan: ZiWeiPan): DaYunDetail[] {
  return pan.dayun.map((d) => {
    const offset = mod12(pan.mingGong - d.palace)
    const palaceName = PALACE_NAMES[offset]
    const topic = PALACE_TOPICS[offset]
    const starsHere = Object.keys(pan.stars)
      .filter((k) => pan.stars[k] === d.palace)
      .map(starNameOf)
    const text = starsHere.length > 0
      ? `主${palaceName}之运——${topic}本宫坐${starsHere.join('、')}，此十年围绕「${palaceName}」的课题展开。`
      : `主${palaceName}之运——${topic}本宫无主星，需借对宫与流年四化引动。`
    return { startAge: d.startAge, endAge: d.endAge, palaceName, isCurrent: d.isCurrent, text }
  })
}

// ---------------- 爱情 / 事业 / 财运 三大专题 ----------------

export interface TopicReading {
  key: 'love' | 'career' | 'wealth'
  title: string
  palaceName: string
  text: string
}

const TOPIC_PALACES = [
  { key: 'love', title: '爱情', palaceName: '夫妻宫', offset: 2 },
  { key: 'wealth', title: '财运', palaceName: '财帛宫', offset: 4 },
  { key: 'career', title: '事业', palaceName: '官禄宫', offset: 8 },
] as const

// 从夫妻宫 / 财帛宫 / 官禄宫看爱情、财运、事业（结合本宫主星 + 亮度 + 生年四化落宫）。
export function lifeTopics(pan: ZiWeiPan): TopicReading[] {
  return TOPIC_PALACES.map((t) => {
    const b = mod12(pan.mingGong - t.offset)
    const mains = Object.keys(pan.stars).filter((k) => pan.stars[k] === b)
    const hua = (['lu', 'quan', 'ke', 'ji'] as const).filter(
      (k) => (pan.stars[pan.sihua[k]] ?? pan.auxStars[pan.sihua[k]]) === b,
    )

    let text: string
    if (mains.length === 0) {
      text = `${t.palaceName}无主星，${t.title}走势随缘、多借对宫之星来看，需靠后天主动经营。`
    } else {
      const names = mains.map(starNameOf)
      const bright = brightnessOf(mains[0], b)
      const strength = bright === '庙' || bright === '旺' ? '得力、发挥顺畅' : bright === '陷' ? '偏弱、需后天修炼' : '平稳'
      const traits = [...new Set(mains.flatMap((k) => STAR_MAP[k].traits.slice(0, 2)))].join('、')
      text = `${t.palaceName}坐${names.join('、')}（${bright}），${strength}，${traits}。`
    }
    if (hua.length > 0) {
      text += `本宫见${hua.map((k) => `${SIHUA_CHAR[k]}${starNameOf(pan.sihua[k])}`).join('、')}引动，是${t.title}层面被强调的重点。`
    }
    return { key: t.key, title: t.title, palaceName: t.palaceName, text }
  })
}

// 流年逐宫：流年命宫 + 流年四化落宫的白话。
export function liuNianReading(pan: ZiWeiPan, liuNian: LiuNian): string {
  const off = mod12(pan.mingGong - liuNian.mingGong)
  const lnGong = PALACE_NAMES[off]
  const parts = (['lu', 'quan', 'ke', 'ji'] as const).map((k) => {
    const star = liuNian.sihua[k]
    const branch = pan.stars[star] ?? pan.auxStars[star]
    return `${SIHUA_CHAR[k]}${starNameOf(star)}入${gongOf(pan, branch)}`
  })
  return `${liuNian.ganName}${liuNian.zhiName}年流年命宫在${lnGong}（${PALACE_TOPICS[off]}）；流年四化：${parts.join('、')}。`
}

// ---------------- 十二宫借星详解 ----------------

export interface PalaceReading {
  palaceName: string
  topic: string
  mains: string[]
  borrowed: string[]
  borrowedFrom: string
  aux: string[]
  sihua: string[]
}

// 单宫详解：本宫主星 + 空宫借对宫 + 辅星 + 生年四化落宫。
export function palaceReading(pan: ZiWeiPan, b: number): PalaceReading {
  const offset = mod12(pan.mingGong - b)
  const opposite = mod12(b + 6)
  const mains = Object.keys(pan.stars).filter((k) => pan.stars[k] === b)
  const borrowed = mains.length === 0 ? Object.keys(pan.stars).filter((k) => pan.stars[k] === opposite) : []
  const aux = Object.keys(pan.auxStars).filter((k) => pan.auxStars[k] === b)
  const sihua = (['lu', 'quan', 'ke', 'ji'] as const).filter(
    (k) => (pan.stars[pan.sihua[k]] ?? pan.auxStars[pan.sihua[k]]) === b,
  )
  return {
    palaceName: PALACE_NAMES[offset],
    topic: PALACE_TOPICS[offset],
    mains: mains.map(starNameOf),
    borrowed: borrowed.map(starNameOf),
    borrowedFrom: PALACE_NAMES[mod12(pan.mingGong - opposite)],
    aux: aux.map(starNameOf),
    sihua: sihua.map((k) => `${SIHUA_CHAR[k]}${starNameOf(pan.sihua[k])}`),
  }
}

// ---------------- 命主 / 身主 ----------------

const MING_ZHU: Record<number, string> = {
  0: 'tanlang', 1: 'jumen', 2: 'lucun', 3: 'wenqu', 4: 'lianzhen', 5: 'wuqu',
  6: 'pojun', 7: 'wuqu', 8: 'lianzhen', 9: 'wenqu', 10: 'jumen', 11: 'lucun',
}
const SHEN_ZHU: Record<number, string> = {
  0: 'huoxing', 1: 'tianxiang', 2: 'tianliang', 3: 'tiantong', 4: 'wenchang', 5: 'tianji',
  6: 'huoxing', 7: 'tianxiang', 8: 'tianliang', 9: 'tiantong', 10: 'wenchang', 11: 'tianji',
}

export interface MingShenZhu {
  mingZhu: { key: string; name: string; desc: string }
  shenZhu: { key: string; name: string; desc: string }
  text: string
}

const descOf = (key: string) => STAR_MAP[key]?.desc ?? AUX_STARS.find((s) => s.key === key)?.desc ?? ''

export function mingShenZhu(pan: ZiWeiPan): MingShenZhu {
  const mz = MING_ZHU[pan.mingGong]
  const sz = SHEN_ZHU[pan.yearBranch]
  return {
    mingZhu: { key: mz, name: starNameOf(mz), desc: descOf(mz) },
    shenZhu: { key: sz, name: starNameOf(sz), desc: descOf(sz) },
    text: `命主${starNameOf(mz)}主先天根基与一生主线，身主${starNameOf(sz)}主后天归宿与晚年重心。`,
  }
}

// ---------------- 对宫关系详解 ----------------

export interface OppositePair {
  aOffset: number // 本宫相对命宫的偏移
  bOffset: number // 对宫偏移（aOffset+6）
  aName: string
  bName: string
  aTopic: string
  bTopic: string
  aStars: string[]
  bStars: string[]
  text: string
}

// 六组对宫：两宫互为「表里」，一主外显、一主内里，互相牵引。
const OPPOSITE_PAIRS: { a: number; meaning: string }[] = [
  { a: 0, meaning: '命宫主「自我」，迁移宫主「在外表现」。两者互为表里：在家如何、出门如何，往往互相印证；迁移宫得力，则贵人多、外出顺，也反过来滋养命宫。' },
  { a: 1, meaning: '兄弟宫主「手足同侪」，交友宫主「朋友社交」。早年看兄弟、出社会看朋友，是人际脉络的一体两面，对宫呼应，反映你与平辈的关系模式。' },
  { a: 2, meaning: '夫妻宫主「婚姻伴侣」，官禄宫主「事业舞台」。两者对宫相望，常有一体两面的张力：感情稳定则事业顺，事业忙碌则可能冷落婚姻，需彼此调适。' },
  { a: 3, meaning: '子女宫主「子女与桃花」，田宅宫主「家庭与不动产」。对宫相连，象征「成家立业」的循环：有家有室者更安身立命，田宅稳固也惠及子孙。' },
  { a: 4, meaning: '财帛宫主「进财理财」，福德宫主「精神享受」。互为表里：一个人怎么花钱，常由其内在价值观与快乐来源决定；福德好，钱财也留得住。' },
  { a: 5, meaning: '疾厄宫主「身体安康」，父母宫主「家世与长辈」。对宫呼应，身体底子常来自先天家世与遗传，父母缘厚者，身心也多一层靠山。' },
]

export function oppositePalaces(pan: ZiWeiPan): OppositePair[] {
  return OPPOSITE_PAIRS.map(({ a, meaning }) => {
    const b = a + 6
    const aGong = mod12(pan.mingGong - a)
    const bGong = mod12(pan.mingGong - b)
    const aStars = Object.keys(pan.stars).filter((k) => pan.stars[k] === aGong).map(starNameOf)
    const bStars = Object.keys(pan.stars).filter((k) => pan.stars[k] === bGong).map(starNameOf)
    const aDesc = aStars.length > 0 ? `坐${aStars.join('、')}` : '无主星'
    const bDesc = bStars.length > 0 ? `坐${bStars.join('、')}` : '无主星'
    return {
      aOffset: a,
      bOffset: b,
      aName: PALACE_NAMES[a],
      bName: PALACE_NAMES[b],
      aTopic: PALACE_TOPICS[a],
      bTopic: PALACE_TOPICS[b],
      aStars,
      bStars,
      text: `${meaning}本盘${PALACE_NAMES[a]}${aDesc}、${PALACE_NAMES[b]}${bDesc}。`,
    }
  })
}
