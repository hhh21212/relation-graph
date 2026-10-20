// 从档案（记录）选命主：工具箱里各命理项目共用的「选人」控件。
// 选中回传 Person；选「手动输入」回传 null（工具退回手填表单）。

import { useMemo, useState } from 'react'
import { Person, RELATION_TAG_LABELS } from '../../types/person'
import { useStore, selectSelf } from '../../core/storage/store'
import { formatBirthDate } from '../../utils/format'
import Sheet from '../ui/Sheet'

interface PersonSelectProps {
  value: Person | null
  onChange: (p: Person | null) => void
  placeholder?: string
}

export default function PersonSelect({ value, onChange, placeholder = '＋ 从档案选择命主' }: PersonSelectProps) {
  const [open, setOpen] = useState(false)
  const persons = useStore((s) => s.persons)
  const self = useStore(selectSelf)

  const list = useMemo(() => {
    const others = persons
      .filter((p) => !p.isSelf)
      .slice()
      .sort((a, b) => Number(b.favorite ?? false) - Number(a.favorite ?? false) || a.name.localeCompare(b.name, 'zh'))
    return self ? [self, ...others] : others
  }, [persons, self])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="tap-target flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm"
        style={{ borderColor: 'var(--color-border)', color: value ? 'var(--color-text)' : 'var(--color-text-dim)' }}
      >
        {value ? (
          <span className="min-w-0 truncate">
            {value.name}
            {value.isSelf && <span className="ml-1 text-xs" style={{ color: 'var(--color-gold)' }}>（我）</span>}
            <span className="ml-2 text-xs" style={{ color: 'var(--color-text-dim)' }}>
              {RELATION_TAG_LABELS[value.relationTag]} · {formatBirthDate(value)}
            </span>
          </span>
        ) : (
          <span>手动输入</span>
        )}
        <span className="ml-2 shrink-0" style={{ color: 'var(--color-gold)' }}>⇄</span>
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="从档案选择命主">
        <div className="space-y-2">
          <button
            onClick={() => {
              onChange(null)
              setOpen(false)
            }}
            className="card tap-target flex w-full items-center justify-between px-4 py-3 text-left transition active:scale-95"
          >
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text-dim)' }}>手动输入（不选人）</div>
              <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>自己填生日/时辰/性别</div>
            </div>
          </button>

          {list.length === 0 && (
            <p className="py-4 text-center text-xs" style={{ color: 'var(--color-text-dim)' }}>
              档案还是空的，先去「记录」页加人，或在这里选「手动输入」。
            </p>
          )}

          {list.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                onChange(p)
                setOpen(false)
              }}
              className={`card tap-target flex w-full items-center justify-between px-4 py-3 text-left transition active:scale-95 ${
                value?.id === p.id ? 'border' : ''
              }`}
              style={value?.id === p.id ? { borderColor: 'var(--color-gold)' } : undefined}
            >
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  {p.favorite && <span className="mr-1" style={{ color: 'var(--color-gold)' }}>★</span>}
                  {p.name}
                  {p.isSelf && <span className="ml-1 text-xs" style={{ color: 'var(--color-gold)' }}>（我）</span>}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                  {RELATION_TAG_LABELS[p.relationTag]} · {formatBirthDate(p)}
                  {p.hour === undefined ? ' · 缺时辰' : ''}
                </div>
              </div>
              <span style={{ color: value?.id === p.id ? 'var(--color-gold)' : 'var(--color-accent)' }}>
                {value?.id === p.id ? '✓' : '›'}
              </span>
            </button>
          ))}
        </div>
      </Sheet>
    </>
  )
}
