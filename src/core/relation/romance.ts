// 「桃花 / 感情」模块：把一个人的八字翻译成一段大白话感情报告（娱乐参考）。
//
// 各项依据：
// - 桃花长相：日主十天干气质（主流公认）+ 桃花 / 红鸾 / 天喜 + 最旺五行。
// - 桃花类型：红鸾 / 天喜 / 桃花（正）vs 阴阳差错 / 孤辰 / 寡宿 / 魁罡 / 桃花被冲（烂）。
// - 方位：日支三合局的桃花位（子北 / 卯东 / 午南 / 酉西 / 四维）。
// - 容易遇到什么人：性格（同命盘感情）、属相（日支六合 / 三合）、职业（日支五行）。
// - 配偶长相 / 气质：配偶宫 = 日支（本气藏干补一句气质）；有时辰再读时柱神煞。
// - 今年桃花运：流年 + 流月 + 未来几年（复用 fortune 模块）。
// - 招桃花 / 避烂桃花：按方位 / 喜用色 / 烂桃花信号给建议。

import { Person } from '../../types/person'
import { RomanceReport } from '../../types/romance'
import { computeBaZi, BaZiResult } from '../rules/bazi'
import { computeLuMing, shenShaZhiNames, hongLuan, tianXi, CANGAN } from '../rules/luming'
import { BRANCHES, Stem, Branch, isLiuHe, isSanHe, isLiuChong } from '../rules/ganzhi'
import { WuXing, WU_XING, BRANCH_WU_XING } from '../rules/fiveElement'
import { zodiacOf } from '../rules/zodiac'
import { getJieTimes, pseudoToBeijing } from '../rules/solarTerm'
import { computeFortune, computeYearFortune } from './fortune'
import { computeDestiny } from './destiny'

function toBirthTime(p: Person) {
  return { year: p.birthYear, month: p.birthMonth, day: p.birthDay, hour: p.hour, minute: p.minute }
}

// ---------------- 日主十天干 → 长相 / 脸型 / 气质 ----------------
const DAY_STEM_LOOKS: Record<Stem, { build: string; face: string; temperament: string }> = {
  0: { build: '偏高、骨架挺拔', face: '偏长或国字脸，轮廓分明', temperament: '正直、有担当，给人靠得住的感觉' }, // 甲木
  1: { build: '偏纤细柔美、骨感清秀', face: '偏瓜子脸，五官柔和', temperament: '温婉、有韧性，很好相处' }, // 乙木
  2: { build: '中等偏结实，精气神足', face: '天庭饱满，面色红润', temperament: '热情大方，走到哪都自带光' }, // 丙火
  3: { build: '偏小巧精致', face: '脸型小巧，眼睛有神', temperament: '温柔细腻，很会照顾人' }, // 丁火
  4: { build: '中等偏壮实、敦厚', face: '偏方圆脸，看着稳重', temperament: '踏实可靠，让人安心' }, // 戊土
  5: { build: '中等身材、圆润温和', face: '脸型圆润柔和', temperament: '包容、务实，会顾家' }, // 己土
  6: { build: '挺拔、棱角分明', face: '轮廓分明，偏方脸', temperament: '果断刚强，有气场' }, // 庚金
  7: { build: '偏白净、精致清瘦', face: '五官立体、小巧精致', temperament: '清冷精致，有品味' }, // 辛金
  8: { build: '偏高挑、修长', face: '偏长脸，眉目清朗', temperament: '聪明洒脱，灵动不羁' }, // 壬水
  9: { build: '中等偏瘦、柔和', face: '脸型柔和，眼神温柔', temperament: '柔和内敛，细腻有同理心' }, // 癸水
}

// ---------------- 日支（配偶宫）→ 配偶长相 / 气质 ----------------
const BRANCH_SPOUSE: Record<Branch, { face: string; temperament: string }> = {
  0: { face: '偏圆润，五官端正', temperament: '聪明机灵，心思活络' }, // 子
  1: { face: '偏敦实，脸型方正', temperament: '稳重踏实，顾家可靠' }, // 丑
  2: { face: '偏修长，精神利落', temperament: '有活力，外向进取' }, // 寅
  3: { face: '偏纤细，清秀温婉', temperament: '温和好相处，重感情' }, // 卯
  4: { face: '偏大气，脸型圆润', temperament: '有格局，能扛事' }, // 辰
  5: { face: '偏精瘦，五官锐利', temperament: '精明干练，反应快' }, // 巳
  6: { face: '偏饱满，气色红润', temperament: '热情开朗，阳光外向' }, // 午
  7: { face: '偏丰润，温和厚道', temperament: '宽厚包容，很会疼人' }, // 未
  8: { face: '偏清瘦利落、有神', temperament: '利落有主见，行动力强' }, // 申
  9: { face: '偏白净，精致漂亮', temperament: '精致讲究，有品味魅力' }, // 酉
  10: { face: '偏方正，敦厚可靠', temperament: '重信义，靠谱忠诚' }, // 戌
  11: { face: '偏圆润和善、饱满', temperament: '温和和善，有包容心' }, // 亥
}

// ---------------- 12 支 → 方位（后天八卦） ----------------
const BRANCH_DIRECTION = [
  '正北', '东北', '东北', '正东', '东南', '东南', '正南', '西南', '西南', '正西', '西北', '西北',
] as const

// ---------------- 五行 → 职业倾向 ----------------
const WU_XING_PROFESSION: Record<WuXing, string> = {
  金: '金融、法律、工程、机械、珠宝、军警这类偏「硬核、讲规则」的行业',
  木: '教育、文化、设计、服装、医疗、林业这类偏「文气、有成长性」的行业',
  水: '贸易、物流、传媒、旅游、餐饮、咨询这类偏「流动、打交道」的行业',
  火: '互联网、能源、演艺、美妆、销售、餐饮这类偏「热闹、有表现力」的行业',
  土: '房地产、建筑、农业、行政、保险、中介这类偏「踏实、稳定」的行业',
}

// ---------------- 五行 → 长相修饰 ----------------
const WU_XING_LOOKS: Record<WuXing, string> = {
  金: '皮肤偏白净、轮廓清楚',
  木: '身形偏清瘦、骨相好',
  水: '身姿灵动、眼睛有神',
  火: '面色红润、精气神足',
  土: '身形敦实、稳重耐看',
}

// 以 base 支的三合局起，返回桃花支（申子辰→酉、寅午戌→卯、巳酉丑→午、亥卯未→子）
function taohuaBranch(base: Branch): Branch {
  for (let b = 0; b < 12; b++) {
    if (shenShaZhiNames(base, b as Branch).includes('桃花')) return b as Branch
  }
  return 9 // 兜底：酉
}

function dominantWuXing(bazi: BaZiResult): WuXing {
  return WU_XING.reduce((acc, w) => (bazi.fiveElements[w] >= bazi.fiveElements[acc] ? w : acc), '金' as WuXing)
}

function branchOf(gzName: string): Branch {
  return BRANCHES.indexOf(gzName.slice(-1) as (typeof BRANCHES)[number])
}

export function computeRomance(person: Person, opts: { nowYear?: number } = {}): RomanceReport {
  const nowYear = opts.nowYear ?? new Date().getFullYear()
  const bazi = computeBaZi(toBirthTime(person))
  const lm = computeLuMing(toBirthTime(person))
  const destiny = computeDestiny(person)
  const fortune = computeFortune(person, { nowYear })

  const has = (n: string) => lm.shenShaAll.includes(n)
  const dayStem = bazi.dayPillar.ganZhi.stem
  const dayBranch = bazi.dayPillar.ganZhi.branch
  const yearBranch = bazi.zodiac

  // ================= 1. 桃花长相 =================
  const base = DAY_STEM_LOOKS[dayStem]
  const dom = dominantWuXing(bazi)
  const lookExtras: string[] = []
  if (has('桃花')) lookExtras.push('五官好看、有魅力，属于人群里比较打眼的类型')
  if (has('红鸾') || has('天喜')) lookExtras.push('气质讨喜、有亲和力')
  const temperament =
    base.temperament + (lookExtras.length ? '，' + lookExtras.join('、') : '')
  const appearance = {
    build: base.build,
    face: base.face,
    temperament,
    text: `长相上：${base.build}，${base.face}；气质上：${temperament}。整体${WU_XING_LOOKS[dom]}。`,
  }

  // ================= 2. 桃花类型（正 / 烂 + 方位 + 时间） =================
  const tb = taohuaBranch(dayBranch)
  const hl = hongLuan(yearBranch)
  const tx = tianXi(yearBranch)

  const pos = ['红鸾', '天喜', '桃花'].filter(has)
  const neg = ['阴阳差错', '孤辰', '寡宿', '魁罡'].filter(has)
  const taohuaChong = isLiuChong(dayBranch, tb) || isLiuChong(yearBranch, tb)
  const goodCount = pos.length
  const badCount = neg.length + (taohuaChong ? 1 : 0)

  const type =
    goodCount > badCount
      ? '正桃花偏旺，容易遇到对的人'
      : badCount > goodCount
        ? '烂桃花偏多，要多挑、多确认'
        : '正烂参半，好人烂人都会碰到，关键看会不会挑'
  const direction = BRANCH_DIRECTION[tb]

  // 时间：大运（有性别时）+ 未来几年桃花年
  const timeParts: string[] = []
  if (fortune.daYun) {
    const ages = fortune.daYun.pillars
      .filter((p) => {
        const b = branchOf(p.ganZhi)
        return b === tb || b === hl || b === tx
      })
      .map((p) => p.ageLabel)
    if (ages.length) timeParts.push(`大运上${ages.join('、')}是桃花比较旺的年龄段`)
  }
  const futureTaohua: string[] = []
  for (let y = nowYear + 1; y <= nowYear + 6; y++) {
    const yf = computeYearFortune(person, y)
    const romance = yf.relations.filter((r) => /桃花|红鸾|天喜|感情|家宅/.test(r))
    if (romance.length) futureTaohua.push(`${y} 年（${romance.join('；')}）`)
  }
  if (futureTaohua.length) timeParts.push(`往后几年里，${futureTaohua.join('；')}`)
  const time =
    timeParts.length > 0
      ? timeParts.join('。') + '。'
      : '这几年桃花不算特别明显，感情随缘、慢慢遇。'

  const taohua = {
    type,
    direction,
    time,
    text: `整体是「${type}」。桃花方位在【${direction}】，多往这个方向走动、容易碰到心动的人。${time}`,
  }

  // ================= 3. 容易遇到什么样的人 =================
  const partnerZodiacs = BRANCHES.map((_, b) => b as Branch)
    .filter((b) => isLiuHe(dayBranch, b) || isSanHe(dayBranch, b))
    .map((b) => zodiacOf(b))
  const meeting = {
    personality: destiny.love.meet,
    zodiacs: partnerZodiacs,
    profession: WU_XING_PROFESSION[BRANCH_WU_XING[dayBranch]],
    text: `${destiny.love.meet}；属相上，跟属【${partnerZodiacs.join('、')}】的人更容易来电；职业上，对方多是${WU_XING_PROFESSION[BRANCH_WU_XING[dayBranch]]}。`,
  }

  // ================= 4. 配偶长相 / 气质（配偶宫 = 日支） =================
  const sp = BRANCH_SPOUSE[dayBranch]
  const cangMain = CANGAN[dayBranch][0]
  const spouseExtra: string[] = []
  const hourPillar = lm.pillars.find((p) => p.label === '时柱')
  if (hourPillar) {
    if (hourPillar.shenSha.some((s) => /红鸾|天喜|桃花/.test(s))) {
      spouseExtra.push('时柱带红鸾 / 天喜，感情偏晚成或晚景更旺')
    }
    if (hourPillar.shenSha.some((s) => /孤辰|寡宿|阴阳差错/.test(s))) {
      spouseExtra.push('时柱偏冷，晚婚或独处会多一些')
    }
  }
  const spouse = {
    face: sp.face,
    temperament: sp.temperament + '，' + DAY_STEM_LOOKS[cangMain].temperament,
    text:
      `对方长相${sp.face}，气质上${sp.temperament}、${DAY_STEM_LOOKS[cangMain].temperament}。` +
      (spouseExtra.length ? ' ' + spouseExtra.join('；') + '。' : ''),
    note: bazi.hasHour
      ? undefined
      : '缺时辰，时柱相关未算（配偶宫只按日柱看，补上时辰能看更细）。',
  }

  // ================= 5. 今年桃花运 =================
  const thisYearFortune = fortune.recentYears[0]
  const romanceSignals = thisYearFortune.relations.filter((r) => /桃花|红鸾|天喜|感情|家宅/.test(r))
  const happy = romanceSignals.some((r) => /桃花|红鸾|天喜|合日支/.test(r))
  const wary = romanceSignals.some((r) => /冲日支/.test(r))
  const strong = happy && !wary
  const label = happy ? '旺' : romanceSignals.length ? '需注意' : '一般'

  // 流月：今年哪几个月桃花旺（节气月）
  const months: string[] = []
  for (const j of getJieTimes(nowYear)) {
    if (j.branch === tb || j.branch === hl || j.branch === tx) {
      const m = `${pseudoToBeijing(j.ms).month}月`
      if (!months.includes(m)) months.push(m)
    }
  }

  // 未来几年桃花年
  const upcomingYears: { year: number; text: string }[] = []
  for (let y = nowYear + 1; y <= nowYear + 6; y++) {
    const yf = computeYearFortune(person, y)
    const romance = yf.relations.filter((r) => /桃花|红鸾|天喜|感情|家宅/.test(r))
    if (romance.length) upcomingYears.push({ year: y, text: romance.join('；') })
  }

  const thisYearText =
    `今年（${thisYearFortune.year} 年）桃花${label}` +
    (romanceSignals.length ? `：${romanceSignals.join('；')}` : '，比较平淡') +
    (months.length ? `。今年桃花比较旺的月份：${months.join('、')}` : '') +
    (upcomingYears.length
      ? `。往后看，${upcomingYears.map((u) => `${u.year} 年`).join('、')} 也容易有桃花、值得把握`
      : '') +
    '。'

  const thisYear = {
    year: thisYearFortune.year,
    strong,
    label,
    signals: romanceSignals,
    months,
    upcomingYears,
    text: thisYearText,
  }

  // ================= 6. 招桃花 / 避烂桃花 =================
  const attract: string[] = []
  attract.push(`多去${direction}方走动，${direction}是你的桃花方位，容易遇到心动的人`)
  attract.push(
    has('红鸾') || has('天喜')
      ? '你天生红鸾 / 天喜到位，多出门、多应酬，喜事自然找上门'
      : '主动一点、多露脸，桃花靠的是机会和眼缘',
  )
  if (destiny.suitable.colors.length) {
    attract.push(`平时多用点喜用色（${destiny.suitable.colors.join('、')}），提人气、也旺自己`)
  }

  const avoid: string[] = []
  if (badCount > 0) avoid.push('别太快上头，遇到特别会来事的人，多观察几个月再定')
  if (has('阴阳差错') || has('孤辰') || has('寡宿')) {
    avoid.push('感情里多把话说开、多确认，别让误会和顾虑越攒越多')
  }
  if (destiny.villain.zodiacs.length) {
    avoid.push(`跟属【${destiny.villain.zodiacs.join('、')}】的人谈感情，多留个心眼`)
  }
  avoid.push('别碰有对象、边界不清的人，烂桃花多半是这种')

  const advice = {
    attract,
    avoid,
    text: `招桃花：${attract.join('；')}。避烂桃花：${avoid.join('；')}。`,
  }

  // ================= 汇总 =================
  const cautions: string[] = []
  if (badCount > 0) cautions.push('烂桃花信号偏多，感情上要多挑、多确认')
  if (!bazi.hasHour) cautions.push('缺时辰，时柱相关未算（补上时辰看更细）')
  if (!fortune.hasGender) cautions.push('缺性别，大运未算（流年桃花不受影响）')

  return {
    hasHour: bazi.hasHour,
    hasGender: fortune.hasGender,
    name: person.name,
    appearance,
    taohua,
    meeting,
    spouse,
    thisYear,
    advice,
    cautions,
  }
}
