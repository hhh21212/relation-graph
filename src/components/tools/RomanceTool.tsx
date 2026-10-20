// 桃花 / 感情：选一个人（默认「我」），看完整的感情白话分析。
// 配偶宫按八字「日支」看（无紫微斗数）；缺时辰/缺性别在对应块标注。

import { useMemo, useState } from 'react'
import { useStore } from '../../core/storage/store'
import { computeRomance } from '../../core/relation/romance'
import { RELATION_TAG_LABELS } from '../../types/person'

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-panel p-4">
      <div className="mb-2 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>
        ✦ {title}
      </div>
      {children}
    </div>
  )
}

function Chip({ text, tone }: { text: string; tone?: 'good' | 'bad' | 'dim' }) {
  const color =
    tone === 'good' ? 'var(--color-ok)' : tone === 'bad' ? 'var(--color-accent)' : 'var(--color-text-dim)'
  return (
    <span className="chip rounded-full px-2.5 py-1 text-[11px]" style={{ color }}>
      {text}
    </span>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm leading-relaxed">
      <span className="shrink-0" style={{ color: 'var(--color-text-dim)' }}>
        {label}
      </span>
      <span style={{ color: 'var(--color-text)' }}>{value}</span>
    </div>
  )
}

export default function RomanceTool() {
  const persons = useStore((s) => s.persons)
  const self = useStore((s) => s.persons.find((p) => p.isSelf))
  const [selectedId, setSelectedId] = useState<string | undefined>(self?.id)

  const person = persons.find((p) => p.id === selectedId) ?? self
  const report = useMemo(() => (person ? computeRomance(person) : null), [person])

  if (persons.length === 0) {
    return (
      <div className="py-10 text-center text-sm" style={{ color: 'var(--color-dim)' }}>
        还没有人，先去「关系树」把「我」建起来，再回来看桃花。
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="glass-panel p-4">
        <div className="mb-3 text-xs" style={{ color: 'var(--color-text-dim)' }}>
          选一个人看 TA 的桃花 / 感情（默认「我」）：
        </div>
        <div className="flex flex-wrap gap-1.5">
          {persons.map((p) => {
            const on = person?.id === p.id
            return (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className="tap-target rounded-full border px-3 py-1.5 text-xs transition"
                style={{
                  borderColor: on ? 'var(--color-accent)' : 'var(--color-border)',
                  color: on ? 'var(--color-accent)' : 'var(--color-text)',
                  background: on ? 'var(--color-card)' : 'transparent',
                }}
              >
                {on ? '✓ ' : ''}
                {p.name}
                {p.isSelf ? '' : ` · ${RELATION_TAG_LABELS[p.relationTag]}`}
              </button>
            )
          })}
        </div>
      </div>

      {report && (
        <>
          {report.cautions.length > 0 && (
            <div className="glass-panel p-4">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-accent)' }}>
                ⚠ {report.cautions.join('；')}
              </p>
            </div>
          )}

          <Panel title="桃花长相">
            <div className="space-y-1.5">
              <Row label="体型：" value={report.appearance.build} />
              <Row label="脸型：" value={report.appearance.face} />
              <Row label="气质：" value={report.appearance.temperament} />
              <p className="pt-1 text-sm leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
                {report.appearance.text}
              </p>
            </div>
          </Panel>

          <Panel title="桃花类型">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Chip text={report.taohua.type} tone={report.taohua.type.includes('烂') ? 'bad' : 'good'} />
                <Chip text={`方位 · ${report.taohua.direction}`} tone="dim" />
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
                {report.taohua.text}
              </p>
            </div>
          </Panel>

          <Panel title="容易遇到什么样的人">
            <div className="space-y-1.5">
              <Row label="性格：" value={report.meeting.personality} />
              <Row label="职业：" value={report.meeting.profession} />
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
                  属相：
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {report.meeting.zodiacs.map((z) => (
                    <Chip key={z} text={z} tone="good" />
                  ))}
                </div>
              </div>
              <p className="pt-1 text-sm leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
                {report.meeting.text}
              </p>
            </div>
          </Panel>

          <Panel title="配偶长相 / 气质">
            <div className="space-y-1.5">
              <Row label="长相：" value={report.spouse.face} />
              <Row label="气质：" value={report.spouse.temperament} />
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
                {report.spouse.text}
              </p>
              {report.spouse.note && (
                <p className="pt-1 text-xs" style={{ color: 'var(--color-accent)' }}>
                  ⚠ {report.spouse.note}
                </p>
              )}
            </div>
          </Panel>

          <Panel title={`今年桃花运（${report.thisYear.year} 年）`}>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Chip text={report.thisYear.label} tone={report.thisYear.strong ? 'good' : report.thisYear.label === '需注意' ? 'bad' : 'dim'} />
                {report.thisYear.months.map((m) => (
                  <Chip key={m} text={m} tone="good" />
                ))}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
                {report.thisYear.text}
              </p>
              {report.thisYear.upcomingYears.length > 0 && (
                <div className="space-y-1 pt-1">
                  {report.thisYear.upcomingYears.map((u) => (
                    <div key={u.year} className="flex items-baseline gap-2 text-xs">
                      <span className="font-kai font-bold" style={{ color: 'var(--color-gold)' }}>
                        {u.year} 年
                      </span>
                      <span style={{ color: 'var(--color-text-dim)' }}>{u.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Panel>

          <Panel title="招桃花 / 避烂桃花">
            <div className="space-y-2 text-sm leading-relaxed">
              <div>
                <div className="mb-1 text-xs font-semibold" style={{ color: 'var(--color-ok)' }}>
                  怎么招桃花
                </div>
                <ul className="space-y-1">
                  {report.advice.attract.map((x, i) => (
                    <li key={i} style={{ color: 'var(--color-text-dim)' }}>
                      · {x}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                  怎么避烂桃花
                </div>
                <ul className="space-y-1">
                  {report.advice.avoid.map((x, i) => (
                    <li key={i} style={{ color: 'var(--color-text-dim)' }}>
                      · {x}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Panel>

          <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
            桃花 / 感情按八字日支与神煞推演，仅供娱乐参考。
          </p>
        </>
      )}
    </div>
  )
}
