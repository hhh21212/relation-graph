// 人员表单弹层：新增 / 编辑 / 编辑「我」，共用一套表单。

import { useState } from 'react'
import { Person, RelationshipTag, RELATION_TAG_LABELS } from '../../types/person'
import { useStore, newId } from '../../core/storage/store'
import { useUI } from '../../store/ui'
import { PLACES } from '../../core/xingzuo/places'
import Sheet from '../ui/Sheet'
import Button from '../ui/Button'

const TAG_OPTIONS = (Object.keys(RELATION_TAG_LABELS) as RelationshipTag[]).filter((t) => t !== 'self')

const fieldCls = 'w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none'
const fieldStyle = { borderColor: 'var(--color-border)', color: 'var(--color-text)' } as const

function clampInt(n: number, lo: number, hi: number, fallback: number): number {
  if (!Number.isFinite(n)) return fallback
  return Math.max(lo, Math.min(hi, Math.round(n)))
}

interface SaveData {
  name: string
  birthYear: number
  birthMonth: number
  birthDay: number
  hour?: number
  birthPlace?: string
  gender: 'male' | 'female'
  relationTag: RelationshipTag
  note?: string
}

function FormBody({
  initial,
  isSelf,
  onSave,
}: {
  initial?: Person
  isSelf: boolean
  onSave: (d: SaveData) => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [year, setYear] = useState(initial?.birthYear ?? 1990)
  const [month, setMonth] = useState(initial?.birthMonth ?? 6)
  const [day, setDay] = useState(initial?.birthDay ?? 15)
  const [hasHour, setHasHour] = useState(initial?.hour !== undefined)
  const [hour, setHour] = useState(initial?.hour ?? 12)
  const [birthPlace, setBirthPlace] = useState(initial?.birthPlace ?? '')
  const [gender, setGender] = useState<'male' | 'female' | ''>(initial?.gender ?? '')
  const [tag, setTag] = useState<RelationshipTag>(initial?.relationTag ?? 'friend')
  const [note, setNote] = useState(initial?.note ?? '')

  const save = () => {
    if (!name.trim()) {
      alert('请填写名字')
      return
    }
    if (!gender) {
      alert('请选择性别')
      return
    }
    onSave({
      name: name.trim(),
      birthYear: clampInt(year, 1900, 2100, 1990),
      birthMonth: clampInt(month, 1, 12, 6),
      birthDay: clampInt(day, 1, 31, 15),
      hour: hasHour ? clampInt(hour, 0, 23, 12) : undefined,
      birthPlace: birthPlace.trim() || undefined,
      gender,
      relationTag: isSelf ? 'self' : tag,
      note: note.trim() || undefined,
    })
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
          名字{isSelf ? '' : ' / 昵称'}
        </span>
        <input className={fieldCls} style={fieldStyle} value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <div>
        <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
          生日（公历）
        </span>
        <div className="grid grid-cols-3 gap-2">
          <input className={fieldCls} style={fieldStyle} type="number" value={year} min={1900} max={2100} onChange={(e) => setYear(Number(e.target.value))} aria-label="年" />
          <input className={fieldCls} style={fieldStyle} type="number" value={month} min={1} max={12} onChange={(e) => setMonth(Number(e.target.value))} aria-label="月" />
          <input className={fieldCls} style={fieldStyle} type="number" value={day} min={1} max={31} onChange={(e) => setDay(Number(e.target.value))} aria-label="日" />
        </div>
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={hasHour} onChange={(e) => setHasHour(e.target.checked)} />
        <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
          知道出生时辰（更细，可选）
        </span>
      </label>

      {hasHour && (
        <label className="block">
          <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
            几点出生（0–23 点）
          </span>
          <input className={fieldCls} style={fieldStyle} type="number" value={hour} min={0} max={23} onChange={(e) => setHour(Number(e.target.value))} />
        </label>
      )}

      <label className="block">
        <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
          出生地（可选，用于星座上升 / 宫位）
        </span>
        <input
          className={fieldCls}
          style={fieldStyle}
          value={birthPlace}
          onChange={(e) => setBirthPlace(e.target.value)}
          placeholder="如：北京 / 上海"
          list="birth-place-options"
        />
        <datalist id="birth-place-options">
          {PLACES.map((p) => (
            <option key={p.name} value={p.name} />
          ))}
        </datalist>
      </label>

      <div>
        <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
          性别（用于排大运）
        </span>
        <div className="grid grid-cols-2 gap-2">
          {([
            ['male', '男'],
            ['female', '女'],
          ] as const).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setGender(val)}
              className="rounded-xl border px-3 py-2.5 text-sm transition"
              style={{
                borderColor: gender === val ? 'var(--color-accent)' : 'var(--color-border)',
                color: gender === val ? 'var(--color-accent)' : 'var(--color-text-dim)',
                background: gender === val ? 'var(--color-card)' : 'transparent',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {!isSelf && (
        <label className="block">
          <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
            和「我」的关系
          </span>
          <select
            className={fieldCls}
            style={{ ...fieldStyle, background: 'var(--color-bg)' }}
            value={tag}
            onChange={(e) => setTag(e.target.value as RelationshipTag)}
          >
            {TAG_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {RELATION_TAG_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="block">
        <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
          备注（可选）
        </span>
        <textarea
          className={`${fieldCls} min-h-[64px] resize-none`}
          style={fieldStyle}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      <Button onClick={save} className="w-full">
        保存
      </Button>
    </div>
  )
}

export default function PersonFormSheet() {
  const form = useUI((s) => s.form)
  const closeForm = useUI((s) => s.closeForm)
  const persons = useStore((s) => s.persons)
  const addPerson = useStore((s) => s.addPerson)
  const updatePerson = useStore((s) => s.updatePerson)
  const setSelf = useStore((s) => s.setSelf)

  const open = form !== null
  const isSelf = form?.mode === 'self'
  const editing =
    form?.mode === 'edit'
      ? persons.find((p) => p.id === form.id)
      : form?.mode === 'self'
        ? persons.find((p) => p.isSelf)
        : undefined

  const title = isSelf ? '我的资料' : editing ? '编辑' : '添加身边的人'
  const formKey = form ? `${form.mode}-${form.mode === 'edit' ? form.id : ''}` : 'closed'

  const handleSave = (d: SaveData) => {
    if (isSelf) {
      const existing = persons.find((p) => p.isSelf)
      setSelf({
        id: existing?.id ?? newId(),
        createdAt: existing?.createdAt ?? Date.now(),
        ...d,
        isSelf: true,
        relationTag: 'self',
      })
    } else if (form?.mode === 'edit') {
      updatePerson(form.id, d)
    } else {
      addPerson({ id: newId(), createdAt: Date.now(), isSelf: false, ...d })
    }
    closeForm()
  }

  return (
    <Sheet open={open} onClose={closeForm} title={title}>
      {open && <FormBody key={formKey} initial={editing} isSelf={isSelf} onSave={handleSave} />}
    </Sheet>
  )
}
