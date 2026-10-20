// 合盘第二步：选第二个人的列表弹层。

import { useStore } from '../../core/storage/store'
import { useUI } from '../../store/ui'
import { RELATION_TAG_LABELS } from '../../types/person'
import { formatBirthDate } from '../../utils/format'
import Sheet from '../ui/Sheet'

export default function PersonPickerSheet() {
  const compareFromId = useUI((s) => s.compareFromId)
  const cancelCompare = useUI((s) => s.cancelCompare)
  const pickCompareSecond = useUI((s) => s.pickCompareSecond)
  const persons = useStore((s) => s.persons)

  const candidates = persons.filter((p) => p.id !== compareFromId)

  return (
    <Sheet open={!!compareFromId} onClose={cancelCompare} title="和谁合盘？">
      <div className="space-y-2">
        {candidates.map((p) => (
          <button
            key={p.id}
            onClick={() => pickCompareSecond(p.id)}
            className="card tap-target flex w-full items-center justify-between px-4 py-3 text-left transition active:scale-95"
          >
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                {p.name}
                {p.isSelf && <span className="ml-1 text-xs" style={{ color: 'var(--color-accent)' }}>（我）</span>}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                {RELATION_TAG_LABELS[p.relationTag]} · {formatBirthDate(p)}
              </div>
            </div>
            <span style={{ color: 'var(--color-accent)' }}>›</span>
          </button>
        ))}
      </div>
    </Sheet>
  )
}
