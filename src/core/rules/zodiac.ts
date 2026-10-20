// 生肖（十二属相）与生肖间的六合/三合/六冲/相害关系。

import { Branch } from './ganzhi'
import {
  DI_ZHI_LIU_HE,
  DI_ZHI_SAN_HE,
  DI_ZHI_LIU_CHONG,
  DI_ZHI_XIANG_HAI,
} from './ganzhi'

// 生肖对应地支（0=子鼠 … 11=亥猪）
export const ZODIAC_ANIMALS = [
  '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪',
] as const

export type ZodiacAnimal = (typeof ZODIAC_ANIMALS)[number]

/** 由地支序号取生肖 */
export function zodiacOf(branch: Branch): ZodiacAnimal {
  return ZODIAC_ANIMALS[((branch % 12) + 12) % 12]
}

export type ZodiacRelation = '六合' | '三合' | '六冲' | '相害'

/** 两个地支（生肖）之间的关系集合（可能多种，也可能为空） */
export function zodiacRelations(a: Branch, b: Branch): ZodiacRelation[] {
  const rels: ZodiacRelation[] = []
  const isPair = (pairs: [Branch, Branch][]) =>
    pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a))

  if (a !== b) {
    if (isPair(DI_ZHI_LIU_HE)) rels.push('六合')
    if (DI_ZHI_SAN_HE.some((g) => g.includes(a) && g.includes(b))) rels.push('三合')
    if (isPair(DI_ZHI_LIU_CHONG)) rels.push('六冲')
    if (isPair(DI_ZHI_XIANG_HAI)) rels.push('相害')
  }
  return rels
}
