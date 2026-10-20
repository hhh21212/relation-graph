// 加关系弹层：两步——先选「和谁」，再选「什么关系」。

import { EdgeTag, EDGE_TAG_LABELS } from '../../types/relation'
import { RELATION_TAG_LABELS } from '../../types/person'
import { useStore, newId } from '../../core/storage/store'
import { useUI } from '../../store/ui'
import Sheet from '../ui/Sheet'

const TAG_OPTIONS = Object.keys(EDGE_TAG_LABELS) as EdgeTag[]

export default function RelationEditorSheet() {
  const relateFromId = useUI((s) => s.relateFromId)
  const relateToId = useUI((s) => s.relateToId)
  const pickRelateTarget = useUI((s) => s.pickRelateTarget)
  const cancelRelate = useUI((s) => s.cancelRelate)

  const persons = useStore((s) => s.persons)
  const relations = useStore((s) => s.relations)
  const addRelation = useStore((s) => s.addRelation)
  const removeRelation = useStore((s) => s.removeRelation)

  const open = relateFromId !== null
  const from = persons.find((p) => p.id === relateFromId)
  const to = persons.find((p) => p.id === relateToId)
  const step: 1 | 2 = relateToId ? 2 : 1

  const candidates = persons.filter((p) => !p.isSelf && p.id !== relateFromId)

  const existingTagOf = (id: string): EdgeTag | null => {
    const r = relations.find(
      (x) => (x.a === relateFromId && x.b === id) || (x.a === id && x.b === relateFromId),
    )
    return r ? r.tag : null
  }

  const confirm = (tag: EdgeTag) => {
    if (!relateFromId || !relateToId) return
    const existing = relations.find(
      (x) =>
        (x.a === relateFromId && x.b === relateToId) || (x.a === relateToId && x.b === relateFromId),
    )
    if (existing) removeRelation(existing.id)
    addRelation({ id: newId(), a: relateFromId, b: relateToId, tag })
    cancelRelate()
  }

  return (
    <Sheet
      open={open}
      onClose={cancelRelate}
      title={step === 1 ? `给「${from?.name}」加关系` : '选关系词'}
    >
      {step === 1 ? (
        <div className="space-y-2">
          <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
            选一个和「{from?.name}」有关系的人（不包含「我」）
          </p>
          {candidates.length === 0 ? (
            <p className="pt-4 text-center text-sm" style={{ color: 'var(--color-text-dim)' }}>
              还没有其他人，先去「＋ 添加」挂一些人上来
            </p>
          ) : (
            candidates.map((p) => {
              const existing = existingTagOf(p.id)
              return (
                <button
                  key={p.id}
                  onClick={() => pickRelateTarget(p.id)}
                  className="card tap-target flex w-full items-center justify-between px-4 py-3 text-left transition active:scale-95"
                >
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                      {p.name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                      {RELATION_TAG_LABELS[p.relationTag]}
                      {existing && (
                        <span style={{ color: 'var(--color-accent)' }}> · 已标注：{EDGE_TAG_LABELS[existing]}</span>
                      )}
                    </div>
                  </div>
                  <span style={{ color: 'var(--color-accent)' }}>›</span>
                </button>
              )
            })
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
            「{from?.name}」和「{to?.name}」是什么关系？
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TAG_OPTIONS.map((tag) => (
              <button
                key={tag}
                onClick={() => confirm(tag)}
                className="tap-target card px-3 py-3 text-sm transition active:scale-95"
                style={{ color: 'var(--color-text)' }}
              >
                {EDGE_TAG_LABELS[tag]}
              </button>
            ))}
          </div>
        </div>
      )}
    </Sheet>
  )
}
