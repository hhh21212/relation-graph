// 数据导入 / 导出（JSON），无后端，本地文件即可备份迁移。

import { Person, RelationshipTag, RELATION_TAG_LABELS } from '../../types/person'
import { Relation, EdgeTag, EDGE_TAG_LABELS } from '../../types/relation'

const SCHEMA_VERSION = 1

export interface ExportPayload {
  app: 'relation-tree'
  version: number
  exportedAt: string
  persons: Person[]
  relations: Relation[]
}

export interface ImportResult {
  persons: Person[]
  relations: Relation[]
}

function isRelationshipTag(v: unknown): v is RelationshipTag {
  return typeof v === 'string' && v in RELATION_TAG_LABELS
}

function isEdgeTag(v: unknown): v is EdgeTag {
  return typeof v === 'string' && v in EDGE_TAG_LABELS
}

/** 校验并归一化一条人员数据，非法项返回 null */
function sanitizePerson(raw: unknown): Person | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  if (
    typeof r.name !== 'string' ||
    typeof r.birthYear !== 'number' ||
    typeof r.birthMonth !== 'number' ||
    typeof r.birthDay !== 'number'
  ) {
    return null
  }
  const hour = typeof r.hour === 'number' && r.hour >= 0 && r.hour <= 23 ? r.hour : undefined
  const minute = typeof r.minute === 'number' && r.minute >= 0 && r.minute <= 59 ? r.minute : undefined
  const gender: 'male' | 'female' = r.gender === 'female' ? 'female' : 'male'
  const relationTag: RelationshipTag = isRelationshipTag(r.relationTag) ? r.relationTag : 'other'
  return {
    id: typeof r.id === 'string' ? r.id : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: r.name,
    birthYear: r.birthYear,
    birthMonth: r.birthMonth,
    birthDay: r.birthDay,
    hour,
    minute,
    birthPlace: typeof r.birthPlace === 'string' ? r.birthPlace : undefined,
    gender,
    isSelf: r.isSelf === true,
    relationTag,
    note: typeof r.note === 'string' ? r.note : undefined,
    favorite: r.favorite === true,
    createdAt: typeof r.createdAt === 'number' ? r.createdAt : Date.now(),
  }
}

/** 校验一条关系边，两端必须都存在才保留 */
function sanitizeRelation(raw: unknown, validIds: Set<string>): Relation | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  if (typeof r.a !== 'string' || typeof r.b !== 'string') return null
  if (!validIds.has(r.a) || !validIds.has(r.b)) return null
  return {
    id: typeof r.id === 'string' ? r.id : `rel-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    a: r.a,
    b: r.b,
    tag: isEdgeTag(r.tag) ? r.tag : 'other',
  }
}

export function exportData(persons: Person[], relations: Relation[]): string {
  const payload: ExportPayload = {
    app: 'relation-tree',
    version: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    persons,
    relations,
  }
  return JSON.stringify(payload, null, 2)
}

/** 从 JSON 文本导入，返回解析出的人员与关系；失败抛错 */
export function importData(json: string): ImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('不是有效的 JSON 文件')
  }
  if (typeof parsed !== 'object' || parsed === null || !Array.isArray((parsed as any).persons)) {
    throw new Error('文件格式不对，缺少 persons 字段')
  }
  const rawPersons: unknown[] = (parsed as any).persons
  const persons: Person[] = rawPersons
    .map((raw) => sanitizePerson(raw))
    .filter((p): p is Person => p !== null)
  if (persons.length === 0) throw new Error('没有解析到任何有效人员数据')

  const validIds = new Set<string>(persons.map((p) => p.id))
  const rawRelations: unknown[] = Array.isArray((parsed as any).relations) ? (parsed as any).relations : []
  const relations: Relation[] = rawRelations
    .map((r) => sanitizeRelation(r, validIds))
    .filter((r): r is Relation => r !== null)

  return { persons, relations }
}

/** 触发浏览器下载导出文件 */
export function downloadExport(persons: Person[], relations: Relation[]): void {
  const blob = new Blob([exportData(persons, relations)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `关系树-备份-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
