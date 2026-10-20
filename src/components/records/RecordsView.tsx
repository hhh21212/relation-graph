// 记录 Tab：按生日临近排序的人员列表 + 搜索 + 关系筛选 + 生日提醒。

import { useMemo, useState } from 'react'
import { Person, RelationshipTag, RELATION_TAG_LABELS } from '../../types/person'
import { useStore } from '../../core/storage/store'
import { useUI } from '../../store/ui'
import { ageOf, formatBirthDate, daysUntilBirthday, birthdayReminderLabel } from '../../utils/format'

const FILTERS: (RelationshipTag | 'all')[] = ['all', 'father', 'mother', 'partner', 'child', 'sibling', 'friend', 'colleague', 'client', 'relative', 'other']

export default function RecordsView() {
  const persons = useStore((s) => s.persons)
  const openDetail = useUI((s) => s.openDetail)
  const openAdd = useUI((s) => s.openAdd)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all')
  const [favOnly, setFavOnly] = useState(false)

  // 「我」与其他人同列，不另起分区；只把「我」自然排最前。
  const list = useMemo(
    () =>
      persons
        .filter((p) => filter === 'all' || p.relationTag === filter)
        .filter((p) => !favOnly || p.favorite)
        .filter((p) => !query.trim() || p.name.includes(query.trim()))
        .sort((a, b) => {
          if (a.isSelf !== b.isSelf) return a.isSelf ? -1 : 1
          return (
            Number(b.favorite ?? false) - Number(a.favorite ?? false) ||
            daysUntilBirthday(a) - daysUntilBirthday(b)
          )
        }),
    [persons, filter, query, favOnly],
  )

  return (
    <div className="flex h-full flex-col">
      <header className="safe-top flex items-center justify-between px-5 pt-3 pb-2">
        <div>
          <h1 className="font-kai text-lg font-bold text-gold-glow">
            记录
          </h1>
          <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
            {favOnly ? `收藏 ${list.length} 位` : `共 ${list.length} 位`} · 收藏置顶
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFavOnly((v) => !v)}
            className="tap-target rounded-xl border px-3 py-2 text-sm transition"
            style={{
              borderColor: favOnly ? 'var(--color-gold)' : 'var(--color-border)',
              color: favOnly ? 'var(--color-gold)' : 'var(--color-text-dim)',
              background: favOnly ? 'var(--color-card)' : 'transparent',
            }}
          >
            ★ 收藏
          </button>
          <button
            onClick={openAdd}
            className="tap-target flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium transition active:scale-95"
            style={{ background: 'var(--color-accent)', color: '#0b1020' }}
          >
            ＋ 添加
          </button>
        </div>
      </header>

      {/* 搜索 */}
      <div className="px-5 pb-2">
        <input
          className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          placeholder="搜索名字"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* 关系筛选 */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 pb-2">
        {FILTERS.map((f) => {
          const active = filter === f
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="tap-target shrink-0 rounded-full border px-3 py-1.5 text-xs transition"
              style={{
                borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                color: active ? 'var(--color-accent)' : 'var(--color-text-dim)',
                background: active ? 'var(--color-card)' : 'transparent',
              }}
            >
              {f === 'all' ? '全部' : RELATION_TAG_LABELS[f]}
            </button>
          )
        })}
      </div>

      {/* 列表 */}
      <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-5 pb-5">
        {list.length === 0 ? (
          <div className="mt-16 text-center text-sm" style={{ color: 'var(--color-text-dim)' }}>
            还没有记录，点右上角「＋ 添加」开始
          </div>
        ) : (
          <div className="space-y-2">
            {list.map((p) => (
              <PersonRow key={p.id} p={p} onClick={() => openDetail(p.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PersonRow({ p, onClick }: { p: Person; onClick: () => void }) {
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const days = daysUntilBirthday(p)
  const near = days <= 7
  return (
    <div className="card flex w-full items-center justify-between px-4 py-3">
      <button onClick={onClick} className="tap-target flex min-w-0 flex-1 items-center justify-between text-left">
        <div className="min-w-0">
          <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            {p.favorite && <span className="mr-1" style={{ color: 'var(--color-gold)' }}>★</span>}
            {p.name}
            {p.isSelf && <span className="ml-1 text-xs" style={{ color: 'var(--color-gold)' }}>（我）</span>}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
            {RELATION_TAG_LABELS[p.relationTag]} · {formatBirthDate(p)} · {ageOf(p)} 岁
            {p.note && ' · 📝'}
          </div>
        </div>
        <span
          className="ml-2 shrink-0 text-xs"
          style={{ color: near ? 'var(--color-accent)' : 'var(--color-text-dim)', fontWeight: near ? 600 : 400 }}
        >
          {birthdayReminderLabel(p)}
        </span>
      </button>
      <button
        onClick={() => toggleFavorite(p.id)}
        className="tap-target ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg transition active:scale-90"
        style={{ color: p.favorite ? 'var(--color-gold)' : 'var(--color-dim)' }}
        aria-label={p.favorite ? '取消收藏' : '收藏'}
      >
        {p.favorite ? '★' : '☆'}
      </button>
    </div>
  )
}
