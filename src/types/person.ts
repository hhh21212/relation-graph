// 人员与关系类型定义

export type RelationshipTag =
  | 'self'
  | 'father'
  | 'mother'
  | 'partner'
  | 'child'
  | 'sibling'
  | 'friend'
  | 'colleague'
  | 'client'
  | 'relative'
  | 'other'

export interface Person {
  id: string
  name: string
  birthYear: number
  birthMonth: number // 1-12
  birthDay: number // 1-31
  hour?: number // 0-23，可选（时辰）
  minute?: number // 0-59，可选
  birthPlace?: string // 出生地（可选，如「北京」），用于星座上升/宫位等
  gender: 'male' | 'female' // 男/女（必填），用于排大运
  isSelf?: boolean // 是否「我」
  relationTag: RelationshipTag
  note?: string
  favorite?: boolean // 收藏/星标
  createdAt: number
}

/** 关系标签的中文显示名 */
export const RELATION_TAG_LABELS: Record<RelationshipTag, string> = {
  self: '我',
  father: '父亲',
  mother: '母亲',
  partner: '伴侣',
  child: '子女',
  sibling: '兄弟姐妹',
  friend: '朋友',
  colleague: '同事',
  client: '客户',
  relative: '亲戚',
  other: '其他',
}
