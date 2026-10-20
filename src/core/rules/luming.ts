// 禄命法（唐·李虚中）：以年柱为核心、纳音为「身」，与子平法（日干为核心）并参、别混。
//
// 规则移植自桌面《禄命/paipan.py》的计算机械，复用本项目已有的
// 干支/纳音/五行/排盘模块。神煞、纳音、三命、主本走「年柱」；
// 十神、旺衰、长生走「日干」——两套并参、不混。
//
// 说明：paipan.py 的 shishen() 里「印 / 食伤」两行方向写反了（把「我生」判成印、
// 把「生我」判成食伤），这里按主流定义修正：食伤＝我生、印＝生我，阴阳判同异性不变。

import { Stem, Branch, STEMS, BRANCHES, ganZhiIndex, ganZhiName } from './ganzhi'
import { nayinOfGanZhi } from './nayin'
import { computeBaZi, BirthTime, Pillar } from './bazi'
import { WuXing, WU_XING, STEM_WU_XING, BRANCH_WU_XING, generates, overcomes } from './fiveElement'
import { LuMingResult, LuMingPillar, ShiShenName, ShiShenCategory } from '../../types/luming'

// ---------------- 地支藏干（本气在前） ----------------
export const CANGAN: Record<Branch, Stem[]> = {
  0: [9], // 子：癸
  1: [5, 9, 7], // 丑：己 癸 辛
  2: [0, 2, 4], // 寅：甲 丙 戊
  3: [1], // 卯：乙
  4: [4, 1, 9], // 辰：戊 乙 癸
  5: [2, 6, 4], // 巳：丙 庚 戊
  6: [3, 5], // 午：丁 己
  7: [5, 3, 1], // 未：己 丁 乙
  8: [6, 8, 4], // 申：庚 壬 戊
  9: [7], // 酉：辛
  10: [4, 7, 3], // 戌：戊 辛 丁
  11: [8, 0], // 亥：壬 甲
}

// 宫位
const GONG_WEI = ['祖上 / 早年', '父母 / 兄弟', '自身 / 配偶', '子女 / 晚辈']

// ---------------- 十神 ----------------
const SHI_SHEN_NAMES: Record<ShiShenCategory, [ShiShenName, ShiShenName]> = {
  比劫: ['比肩', '劫财'], // [同性, 异性]
  食伤: ['食神', '伤官'],
  财: ['偏财', '正财'],
  官杀: ['七杀', '正官'],
  印: ['偏印', '正印'],
}

/** 十神五大类（me 对 other）：比劫=同我 / 食伤=我生 / 财=我克 / 官杀=克我 / 印=生我 */
function shiShenCategory(me: WuXing, other: WuXing): ShiShenCategory {
  if (me === other) return '比劫'
  if (generates(me, other)) return '食伤'
  if (overcomes(me, other)) return '财'
  if (overcomes(other, me)) return '官杀'
  return '印'
}

/** 以 me 为日主，other 相对 me 的十神（阴阳同异性细分比肩/劫财、正偏等） */
export function shiShen(meStem: Stem, otherStem: Stem): ShiShenName {
  const cat = shiShenCategory(STEM_WU_XING[meStem], STEM_WU_XING[otherStem])
  const samePolarity = meStem % 2 === otherStem % 2 // 阳干=偶数下标
  return SHI_SHEN_NAMES[cat][samePolarity ? 0 : 1]
}

// ---------------- 旺衰（月令旺相休囚死） ----------------
export function wangShuai(monthBranch: Branch, wuXing: WuXing): string {
  const wang = BRANCH_WU_XING[monthBranch] // 当令五行
  if (wuXing === wang) return '旺'
  if (generates(wang, wuXing)) return '相' // 当令所生
  if (generates(wuXing, wang)) return '休' // 生当令者
  if (overcomes(wuXing, wang)) return '囚' // 克当令者
  return '死' // 当令所克
}

// ---------------- 长生十二宫 ----------------
const CHANG_SHENG = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养']
const CHANG_SHENG_START: Record<Stem, Branch> = {
  0: 11, // 甲长生亥
  2: 2, // 丙长生寅
  4: 2, // 戊长生寅
  6: 5, // 庚长生巳
  8: 8, // 壬长生申
  1: 6, // 乙长生午
  3: 9, // 丁长生酉
  5: 9, // 己长生酉
  7: 0, // 辛长生子
  9: 3, // 癸长生卯
}

export function changSheng(stem: Stem, branch: Branch): string {
  const start = CHANG_SHENG_START[stem]
  const yang = stem % 2 === 0
  const idx = yang
    ? (((branch - start) % 12) + 12) % 12
    : (((start - branch) % 12) + 12) % 12
  return CHANG_SHENG[idx]
}

// ---------------- 三合局 ----------------
const SAN_HE_GROUPS: Record<string, Branch[]> = {
  申子辰: [8, 0, 4],
  寅午戌: [2, 6, 10],
  巳酉丑: [5, 9, 1],
  亥卯未: [11, 3, 7],
}

function sanHeGroup(b: Branch): string {
  for (const name of Object.keys(SAN_HE_GROUPS)) {
    if (SAN_HE_GROUPS[name].includes(b)) return name
  }
  return '申子辰'
}

// 三合局 → 七神煞位
interface ShenShaZhiPositions {
  驿马: Branch
  桃花: Branch
  华盖: Branch
  劫煞: Branch
  亡神: Branch
  将星: Branch
  灾煞: Branch
}
const SHEN_SHA_ZHI: Record<string, ShenShaZhiPositions> = {
  申子辰: { 驿马: 2, 桃花: 9, 华盖: 4, 劫煞: 5, 亡神: 11, 将星: 0, 灾煞: 6 },
  寅午戌: { 驿马: 8, 桃花: 3, 华盖: 10, 劫煞: 11, 亡神: 5, 将星: 6, 灾煞: 0 },
  巳酉丑: { 驿马: 11, 桃花: 6, 华盖: 1, 劫煞: 2, 亡神: 8, 将星: 9, 灾煞: 3 },
  亥卯未: { 驿马: 5, 桃花: 0, 华盖: 7, 劫煞: 8, 亡神: 2, 将星: 3, 灾煞: 9 },
}

/** 以 base 支的三合局起，返回该支所落的七神煞（可能多个，如同时是驿马与将星） */
export function shenShaZhiNames(base: Branch, target: Branch): string[] {
  const pos = SHEN_SHA_ZHI[sanHeGroup(base)]
  const hits: string[] = []
  for (const name of Object.keys(pos) as (keyof ShenShaZhiPositions)[]) {
    if (pos[name] === target) hits.push(name)
  }
  return hits
}

// 天干起神煞
interface ShenShaGanPositions {
  天乙贵人: Branch[]
  文昌: Branch
  禄: Branch
  羊刃: Branch
  金舆: Branch
  国印: Branch
}
const SHEN_SHA_GAN: Record<Stem, ShenShaGanPositions> = {
  0: { 天乙贵人: [1, 7], 文昌: 5, 禄: 2, 羊刃: 3, 金舆: 4, 国印: 10 }, // 甲
  1: { 天乙贵人: [0, 8], 文昌: 6, 禄: 3, 羊刃: 2, 金舆: 5, 国印: 11 }, // 乙
  2: { 天乙贵人: [11, 9], 文昌: 8, 禄: 5, 羊刃: 6, 金舆: 7, 国印: 1 }, // 丙
  3: { 天乙贵人: [11, 9], 文昌: 9, 禄: 6, 羊刃: 5, 金舆: 8, 国印: 2 }, // 丁
  4: { 天乙贵人: [1, 7], 文昌: 8, 禄: 5, 羊刃: 6, 金舆: 7, 国印: 1 }, // 戊
  5: { 天乙贵人: [0, 8], 文昌: 9, 禄: 6, 羊刃: 5, 金舆: 8, 国印: 2 }, // 己
  6: { 天乙贵人: [1, 7], 文昌: 11, 禄: 8, 羊刃: 9, 金舆: 10, 国印: 4 }, // 庚
  7: { 天乙贵人: [2, 6], 文昌: 0, 禄: 9, 羊刃: 8, 金舆: 11, 国印: 5 }, // 辛
  8: { 天乙贵人: [3, 5], 文昌: 2, 禄: 11, 羊刃: 0, 金舆: 1, 国印: 7 }, // 壬
  9: { 天乙贵人: [3, 5], 文昌: 3, 禄: 0, 羊刃: 11, 金舆: 2, 国印: 8 }, // 癸
}

/** 以 base 干起，target 支命中的天干神煞名 */
export function shenShaGanNames(base: Stem, target: Branch): string[] {
  const pos = SHEN_SHA_GAN[base]
  const hits: string[] = []
  if (pos.天乙贵人.includes(target)) hits.push('天乙贵人')
  if (pos.文昌 === target) hits.push('文昌')
  if (pos.禄 === target) hits.push('禄')
  if (pos.羊刃 === target) hits.push('羊刃')
  if (pos.金舆 === target) hits.push('金舆')
  if (pos.国印 === target) hits.push('国印')
  return hits
}

// 红鸾（年支起）
const HONG_LUAN: Branch[] = [3, 2, 1, 0, 11, 10, 9, 8, 7, 6, 5, 4]
export function hongLuan(yearBranch: Branch): Branch {
  return HONG_LUAN[yearBranch]
}
export function tianXi(yearBranch: Branch): Branch {
  return (hongLuan(yearBranch) + 6) % 12 // 天喜 = 红鸾的对冲
}

// 孤辰寡宿（年支三会方起）
const GU_CHEN_GUA_SU: Record<string, { 孤辰: Branch; 寡宿: Branch }> = {
  寅卯辰: { 孤辰: 5, 寡宿: 1 },
  巳午未: { 孤辰: 8, 寡宿: 4 },
  申酉戌: { 孤辰: 11, 寡宿: 7 },
  亥子丑: { 孤辰: 2, 寡宿: 10 },
}
function sanHuiGroup(b: Branch): string {
  const groups: Record<string, Branch[]> = {
    寅卯辰: [2, 3, 4],
    巳午未: [5, 6, 7],
    申酉戌: [8, 9, 10],
    亥子丑: [11, 0, 1],
  }
  for (const name of Object.keys(groups)) {
    if (groups[name].includes(b)) return name
  }
  return '寅卯辰'
}
export function guChenGuaSu(yearBranch: Branch): { 孤辰: Branch; 寡宿: Branch } {
  return GU_CHEN_GUA_SU[sanHuiGroup(yearBranch)]
}

// 魁罡 / 阴阳差错（日柱）
const KUI_GANG = new Set(['庚辰', '庚戌', '壬辰', '戊戌'])
const YIN_YANG_CHA_CUO = new Set([
  '丙子', '丙午', '丁丑', '丁未', '戊寅', '戊申',
  '辛卯', '辛酉', '壬辰', '壬戌', '癸巳', '癸亥',
])

// 空亡（旬空）
export function kongWang(gzIndex: number): Branch[] {
  const i = ((gzIndex % 60) + 60) % 60
  const xun = Math.floor(i / 10)
  return [(((10 - 2 * xun) % 12) + 12) % 12, (((11 - 2 * xun) % 12) + 12) % 12]
}

// ---------------- 主本（年柱先天=本 vs 日柱后天=主） ----------------
export function mainBenRel(yearWuXing: WuXing, dayWuXing: WuXing): LuMingResult['mainBen']['rel'] {
  if (yearWuXing === dayWuXing) return '比和'
  if (generates(yearWuXing, dayWuXing)) return '本生主'
  if (generates(dayWuXing, yearWuXing)) return '主生本'
  if (overcomes(yearWuXing, dayWuXing)) return '本克主'
  return '主克本'
}

// ---------------- 喜用（身 = 年柱纳音五行） ----------------
function shengBy(w: WuXing): WuXing {
  return WU_XING.find((x) => generates(x, w))!
}
function keBy(w: WuXing): WuXing {
  return WU_XING.find((x) => overcomes(x, w))!
}

export function xiYong(shen: WuXing): LuMingResult['xiYong'] {
  const bingGen = keBy(shen) // 病根 = 克身
  return {
    shen,
    bingGen,
    tongGuan: shengBy(shen), // 通关 = 生身（化克为生）
    bangShen: shen, // 帮身 = 比和
    ji: [bingGen, shengBy(bingGen)], // 忌 = 克身 + 生克身者
  }
}

// ---------------- 家庭出身（年柱=祖上、月柱=父母） ----------------
function jiaTingRel(shen: WuXing, pillar: WuXing): string {
  if (generates(pillar, shen)) return '生我(得助/家有根基)'
  if (overcomes(pillar, shen)) return '克我(家道操劳/受制)'
  if (generates(shen, pillar)) return '我生(家业被泄/多出力)'
  if (overcomes(shen, pillar)) return '我克(家业可守/须经营)'
  return '比和(平实)'
}

function jiaTingFlags(shenSha: string[]): string[] {
  const text = shenSha.join(' ')
  const out: string[] = []
  if (text.includes('天乙贵人')) out.push('天乙贵人(家有声望/有人提携)')
  if (text.includes('国印')) out.push('国印(家近公门/书香)')
  if (text.includes('金舆')) out.push('金舆(家有资财/富贵)')
  if (text.includes('羊刃')) out.push('羊刃(长辈强势/竞争)')
  if (text.includes('劫煞')) out.push('劫煞(家道中落/多是非)')
  if (text.includes('亡神')) out.push('亡神(家事耗散/不宁)')
  return out
}

// ---------------- 汇总排盘 ----------------
export function computeLuMing(input: BirthTime): LuMingResult {
  const bazi = computeBaZi(input)
  const { yearPillar, monthPillar, dayPillar, hourPillar, hasHour } = bazi

  const yg = yearPillar.ganZhi.stem
  const yz = yearPillar.ganZhi.branch
  const dg = dayPillar.ganZhi.stem
  const dz = dayPillar.ganZhi.branch
  const mg = monthPillar.ganZhi.stem
  const mz = monthPillar.ganZhi.branch

  const shenWuXing = yearPillar.nayinWuXing // 身 = 年柱纳音五行

  // 空亡（禄命以年柱所在旬定）
  const kw = kongWang(ganZhiIndex(yg, yz))

  // 各柱详情
  const pillars: LuMingPillar[] = []
  const gongWeiLabels = ['年柱', '月柱', '日柱', '时柱'] as const
  const pillarsList: { label: '年柱' | '月柱' | '日柱' | '时柱'; pillar: Pillar }[] = [
    { label: '年柱', pillar: yearPillar },
    { label: '月柱', pillar: monthPillar },
    { label: '日柱', pillar: dayPillar },
  ]
  if (hourPillar) pillarsList.push({ label: '时柱', pillar: hourPillar })

  pillarsList.forEach(({ label, pillar }, idx) => {
    const g = pillar.ganZhi.stem
    const z = pillar.ganZhi.branch
    const name = pillar.name

    // 藏干 + 十神（天干在前，藏干随后，都相对日干）
    const cang = CANGAN[z]
    const shiShenArr: { gan: string; name: ShiShenName }[] = [
      { gan: STEMS[g], name: shiShen(dg, g) },
      ...cang.map((c) => ({ gan: STEMS[c], name: shiShen(dg, c) })),
    ]

    // 神煞
    const shenSha: string[] = []
    // 支起（年支/日支）
    for (const [prefix, base] of [['年支', yz], ['日支', dz]] as [string, Branch][]) {
      for (const sn of shenShaZhiNames(base, z)) shenSha.push(`${prefix}${sn}`)
    }
    // 干起（年干/日干）
    for (const [prefix, baseGan] of [['年干', yg], ['日干', dg]] as [string, Stem][]) {
      for (const sn of shenShaGanNames(baseGan, z)) shenSha.push(`${prefix}${sn}`)
    }
    // 红鸾天喜（年支起）
    if (z === hongLuan(yz)) shenSha.push('红鸾')
    if (z === tianXi(yz)) shenSha.push('天喜')
    // 孤辰寡宿
    const gc = guChenGuaSu(yz)
    if (z === gc.孤辰) shenSha.push('孤辰')
    if (z === gc.寡宿) shenSha.push('寡宿')
    // 空亡 / 魁罡 / 阴阳差错
    if (kw.includes(z)) shenSha.push('空亡')
    if (KUI_GANG.has(name)) shenSha.push('魁罡')
    if (YIN_YANG_CHA_CUO.has(name)) shenSha.push('阴阳差错')
    // 天罗地网
    if (z === 4) shenSha.push('天罗')
    if (z === 10) shenSha.push('地网')

    pillars.push({
      label,
      ganZhiName: name,
      nayin: pillar.nayin,
      nayinWuXing: pillar.nayinWuXing,
      cangGan: cang.map((c) => STEMS[c]),
      shiShen: shiShenArr,
      changSheng: changSheng(g, z),
      wangShuai: wangShuai(mz, STEM_WU_XING[g]),
      shenSha,
      gongWei: GONG_WEI[idx],
    })
  })

  // 神煞去重（去掉「年支/日支/年干/日干」前缀，取概念名）
  const shenShaAll: string[] = []
  const seen = new Set<string>()
  for (const p of pillars) {
    for (const s of p.shenSha) {
      const concept = s.replace(/^(年支|日支|年干|日干)/, '')
      if (!seen.has(concept)) {
        seen.add(concept)
        shenShaAll.push(concept)
      }
    }
  }

  // 十神五大类计数（全部天干 + 藏干本气）
  const shiShenCount: Record<ShiShenCategory, number> = { 比劫: 0, 食伤: 0, 财: 0, 官杀: 0, 印: 0 }
  for (const p of pillars) {
    for (const s of p.shiShen) {
      const cat = shiShenCategory(STEM_WU_XING[dg], STEM_WU_XING[STEMS.indexOf(s.gan as (typeof STEMS)[number])])
      shiShenCount[cat]++
    }
  }

  // 主本
  const mb = mainBenRel(yearPillar.nayinWuXing, dayPillar.nayinWuXing)
  const mainBenText: Record<LuMingResult['mainBen']['rel'], string> = {
    本生主: `先天（年柱${yearPillar.nayin}）生后天（日柱${dayPillar.nayin}），根基能滋养自身，底子厚。`,
    主生本: `后天（日柱${dayPillar.nayin}）生先天（年柱${yearPillar.nayin}），多是自己反哺家业、操心出力。`,
    本克主: `先天（年柱${yearPillar.nayin}）克后天（日柱${dayPillar.nayin}），家业与自身相制，须靠后天经营。`,
    主克本: `后天（日柱${dayPillar.nayin}）克先天（年柱${yearPillar.nayin}），自己压得住家业根基，但担子也重。`,
    比和: `先天与后天同为${yearPillar.nayin}，家业与自身同气，平实稳当。`,
  }

  // 家庭出身
  const yearSs = pillars[0]?.shenSha ?? []
  const monthSs = pillars[1]?.shenSha ?? []
  const jiaTing = {
    zuShang: {
      ganZhiName: yearPillar.name,
      nayin: yearPillar.nayin,
      rel: jiaTingRel(shenWuXing, yearPillar.nayinWuXing),
      shenSha: jiaTingFlags(yearSs),
    },
    fuMu: {
      ganZhiName: monthPillar.name,
      nayin: monthPillar.nayin,
      rel: jiaTingRel(shenWuXing, monthPillar.nayinWuXing),
      shenSha: jiaTingFlags(monthSs),
    },
  }

  return {
    hasHour,
    sanMing: {
      lu: STEMS[yg],
      ming: BRANCHES[yz],
      shen: yearPillar.nayin,
    },
    mainBen: {
      year: yearPillar.nayin,
      day: dayPillar.nayin,
      rel: mb,
      text: mainBenText[mb],
    },
    pillars,
    shenShaAll,
    shiShenCount,
    xiYong: xiYong(shenWuXing),
    jiaTing,
    kongWang: kw,
    sanXian: [
      { limit: '初限（1–25 岁）', pillar: `月柱 · ${monthPillar.name}` },
      { limit: '中限（26–50 岁）', pillar: `日柱 · ${dayPillar.name}` },
      { limit: '末限（51 岁起）', pillar: hasHour && hourPillar ? `时柱 · ${hourPillar.name}` : '时柱 · 缺时辰' },
    ],
  }
}
