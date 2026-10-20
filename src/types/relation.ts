// 人与人之间的关系（边）：连接任意两个人，标注他们彼此的关系词。

/** 两人之间的关系类型（无向，如夫妻、亲子、兄弟姐妹） */
export type EdgeTag =
  | 'spouse'
  | 'parent_child'
  | 'sibling'
  | 'friend'
  | 'colleague'
  | 'classmate'
  | 'relative'
  | 'other'

export const EDGE_TAG_LABELS: Record<EdgeTag, string> = {
  spouse: '夫妻 / 伴侣',
  parent_child: '亲子',
  sibling: '兄弟姐妹',
  friend: '朋友',
  colleague: '同事',
  classmate: '同学',
  relative: '亲戚',
  other: '其他',
}

/** 一条关系边：a、b 是人员 id，tag 是关系词 */
export interface Relation {
  id: string
  a: string
  b: string
  tag: EdgeTag
}
