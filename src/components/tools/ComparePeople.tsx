// 多人对比：挑 2~4 个人并排看关键命理信息，一眼比出差异。

import { useMemo, useState } from 'react'
import { useStore } from '../../core/storage/store'
import { computeDestiny } from '../../core/relation/destiny'
import { computeBaZi } from '../../core/rules/bazi'
import { zodiacOf } from '../../core/rules/zodiac'
import { westZodiac } from '../../core/rules/zodiacWest'
import { RELATION_TAG_LABELS } from '../../types/person'
import { ageOf } from '../../utils/format'

const MAX = 4

export default function ComparePeople() {
  const persons = useStore((s) => s.persons)
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (id: string) => {
    setSelected((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < MAX ? [...cur, id] : cur,
    )
  }

  const cols = useMemo(
    () =>
      selected.map((id) => {
        const p = persons.find((x) => x.id === id)!
        const d = computeDestiny(p)
        const bazi = computeBaZi({ year: p.birthYear, month: p.birthMonth, day: p.birthDay, hour: p.hour, minute: p.minute })
        return { p, d, zodiac: zodiacOf(bazi.zodiac), xingZuo: westZodiac(p.birthMonth, p.birthDay) }
      }),
    [selected, persons],
  )

  const rows: { label: string; render: (c: (typeof cols)[number]) => string }[] = [
    { label: '生肖', render: (c) => c.zodiac },
    { label: '星座', render: (c) => c.xingZuo },
    { label: '日主', render: (c) => `${c.d.overview.dayMasterLabel} · 身${c.d.overview.shenQiang}` },
    { label: '财运', render: (c) => `${c.d.wealth.type}（${c.d.wealth.style}）` },
    { label: '适合行业', render: (c) => c.d.suitable.industries.slice(0, 2).join('、') },
    { label: '性格底色', render: (c) => c.d.character.dayMasterNature },
    { label: '贵人属相', render: (c) => c.d.benefactor.zodiacs.join('、') },
    { label: '要多留意', render: (c) => c.d.cautions.character.join('、') },
  ]

  return (
    <div className="space-y-3">
      <div className="glass-panel p-4">
        <div className="mb-3 text-xs" style={{ color: 'var(--color-text-dim)' }}>
          点名字选中（最多 {MAX} 人），下面并排对比：
        </div>
        <div className="flex flex-wrap gap-1.5">
          {persons.map((p) => {
            const on = selected.includes(p.id)
            const full = !on && selected.length >= MAX
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                disabled={full}
                className="tap-target rounded-full border px-3 py-1.5 text-xs transition"
                style={{
                  borderColor: on ? 'var(--color-accent)' : 'var(--color-border)',
                  color: on ? 'var(--color-accent)' : full ? 'var(--color-dim)' : 'var(--color-text)',
                  background: on ? 'var(--color-card)' : 'transparent',
                  opacity: full ? 0.5 : 1,
                }}
              >
                {on ? '✓ ' : ''}
                {p.name}
              </button>
            )
          })}
        </div>
      </div>

      {cols.length < 2 ? (
        <p className="py-8 text-center text-sm" style={{ color: 'var(--color-dim)' }}>
          至少选 2 个人才能对比
        </p>
      ) : (
        <div className="glass-panel overflow-x-auto p-4">
          <table className="w-full text-sm" style={{ minWidth: cols.length * 150 + 84 }}>
            <thead>
              <tr>
                <th
                  className="sticky left-0 z-10 w-[84px] border-b pb-2 pr-2 text-left text-xs font-semibold"
                  style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-dim)' }}
                >
                  {`${cols.length} 人对比`}
                </th>
                {cols.map((c) => (
                  <th key={c.p.id} className="border-b px-3 pb-2 text-center" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="font-kai text-base font-bold text-gold-glow">{c.p.name}</div>
                    <div className="mt-0.5 text-[11px] font-normal" style={{ color: 'var(--color-dim)' }}>
                      {c.p.isSelf ? '我' : RELATION_TAG_LABELS[c.p.relationTag]} · {ageOf(c.p)}岁
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td
                    className="sticky left-0 z-10 border-b py-2.5 pr-2 text-xs"
                    style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text-dim)' }}
                  >
                    {row.label}
                  </td>
                  {cols.map((c) => (
                    <td
                      key={c.p.id}
                      className="border-b px-3 py-2.5 text-center text-xs leading-relaxed"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    >
                      {row.render(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
