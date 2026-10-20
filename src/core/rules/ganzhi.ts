// 天干地支与六十甲子：基础常量、六十甲子序号换算、五虎遁、五鼠遁、
// 天干五合、地支六合/三合/六冲/相害。

// 十天干（0=甲 … 9=癸）
export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
// 十二地支（0=子 … 11=亥）
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

export type Stem = number // 0-9
export type Branch = number // 0-11

export interface GanZhi {
  stem: Stem
  branch: Branch
}

/** 由六十甲子序号取干支（0=甲子 … 59=癸亥） */
export function ganZhiFromIndex(index: number): GanZhi {
  const i = ((index % 60) + 60) % 60
  return { stem: i % 10, branch: i % 12 }
}

/**
 * 由天干、地支求六十甲子序号（0=甲子 … 59=癸亥）。
 * 干支必须同奇偶（如甲子、乙丑），否则不是合法组合，返回 -1。
 */
export function ganZhiIndex(stem: Stem, branch: Branch): number {
  for (let i = 0; i < 60; i++) {
    if (i % 10 === stem && i % 12 === branch) return i
  }
  return -1
}

/** 干支名称，如「甲子」 */
export function ganZhiName(g: GanZhi): string {
  return STEMS[g.stem] + BRANCHES[g.branch]
}

// ---------------- 五虎遁（年上起月） ----------------
// 甲己之年丙作首，乙庚之岁戊为头，丙辛必定寻庚起，丁壬壬位顺行流，
// 若问戊癸何方发，甲寅之上好追求。
// 即：寅月天干 = (年干 % 5) * 2 + 2
export function yinMonthStemOf(yearStem: Stem): Stem {
  return ((yearStem % 5) * 2 + 2) % 10
}

// ---------------- 五鼠遁（日上起时） ----------------
// 甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途。
// 即：子时天干 = (日干 % 5) * 2
export function ziHourStemOf(dayStem: Stem): Stem {
  return ((dayStem % 5) * 2) % 10
}

// ---------------- 天干五合 ----------------
// 甲己合土、乙庚合金、丙辛合水、丁壬合木、戊癸合火
export const TIAN_GAN_HE: [Stem, Stem][] = [
  [0, 5],
  [1, 6],
  [2, 7],
  [3, 8],
  [4, 9],
]

export function isTianGanHe(a: Stem, b: Stem): boolean {
  return TIAN_GAN_HE.some(([x, y]) => (x === a && y === b) || (x === b && y === a))
}

// ---------------- 地支关系表 ----------------

// 六合：子丑、寅亥、卯戌、辰酉、巳申、午未
export const DI_ZHI_LIU_HE: [Branch, Branch][] = [
  [0, 1],
  [2, 11],
  [3, 10],
  [4, 9],
  [5, 8],
  [6, 7],
]

// 三合：申子辰(水)、亥卯未(木)、寅午戌(火)、巳酉丑(金)
export const DI_ZHI_SAN_HE: Branch[][] = [
  [8, 0, 4],
  [11, 3, 7],
  [2, 6, 10],
  [5, 9, 1],
]

// 六冲：子午、丑未、寅申、卯酉、辰戌、巳亥
export const DI_ZHI_LIU_CHONG: [Branch, Branch][] = [
  [0, 6],
  [1, 7],
  [2, 8],
  [3, 9],
  [4, 10],
  [5, 11],
]

// 相害（六害）：子未、丑午、寅巳、卯辰、申亥、酉戌
export const DI_ZHI_XIANG_HAI: [Branch, Branch][] = [
  [0, 7],
  [1, 6],
  [2, 5],
  [3, 4],
  [8, 11],
  [9, 10],
]

function isPair(pairs: [Branch, Branch][], a: Branch, b: Branch): boolean {
  return pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a))
}

export function isLiuHe(a: Branch, b: Branch): boolean {
  return isPair(DI_ZHI_LIU_HE, a, b)
}

export function isSanHe(a: Branch, b: Branch): boolean {
  return DI_ZHI_SAN_HE.some((g) => g.includes(a) && g.includes(b) && a !== b)
}

export function isLiuChong(a: Branch, b: Branch): boolean {
  return isPair(DI_ZHI_LIU_CHONG, a, b)
}

export function isXiangHai(a: Branch, b: Branch): boolean {
  return isPair(DI_ZHI_XIANG_HAI, a, b)
}
