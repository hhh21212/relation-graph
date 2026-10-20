// 群体分布：统计「记录」里所有人的日主五行 / 生肖 / 星座，横向条形图展示。

import { useMemo } from 'react'
import { useStore } from '../../core/storage/store'
import { computeGroupDistribution, computeComplements, type DistributionItem } from '../../core/relation/group'

const WU_XING_COLOR: Record<string, string> = {
  木: '#4caf50',
  火: '#ef5350',
  土: '#d4a017',
  金: '#b8c0c8',
  水: '#42a5f5',
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-panel p-4">
      <div className="mb-3 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>
        ✦ {title}
      </div>
      {children}
    </div>
  )
}

export default function GroupDistribution() {
  const persons = useStore((s) => s.persons)
  const g = useMemo(() => computeGroupDistribution(persons), [persons])
  const comps = useMemo(() => computeComplements(persons), [persons])

  if (g.total === 0) {
    return (
      <p className="mt-16 text-center text-sm" style={{ color: 'var(--color-text-dim)' }}>
        还没有记录，先去「记录」里加几个人
      </p>
    )
  }

  const renderBars = (items: DistributionItem[], colorOf: (label: string) => string) => {
    const max = Math.max(...items.map((x) => x.count), 1)
    return (
      <div className="space-y-3">
        {items.map((item) => {
          const pct = Math.round((item.count / g.total) * 100)
          return (
            <div key={item.label}>
              <div className="flex items-baseline justify-between text-sm">
                <span style={{ color: 'var(--color-text)' }}>{item.label}</span>
                <span style={{ color: 'var(--color-text-dim)' }}>
                  {item.count}人 · {pct}%
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--color-card)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.max((item.count / max) * 100, 6)}%`, background: colorOf(item.label) }}
                />
              </div>
              <div className="mt-0.5 truncate text-[11px]" style={{ color: 'var(--color-dim)' }}>
                {item.names.join('、')}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="px-1 text-xs" style={{ color: 'var(--color-text-dim)' }}>
        共 {g.total} 位（含「我」）。看你们这圈人五行、生肖、星座都往哪儿扎堆。
      </p>

      <Panel title="五行分布（按日主）">
        {renderBars(g.wuXing, (l) => WU_XING_COLOR[l] ?? 'var(--color-gold)')}
      </Panel>

      <Panel title="生肖分布">
        {renderBars(g.zodiac, () => 'var(--color-gold)')}
      </Panel>

      <Panel title="星座分布">
        {renderBars(g.xingZuo, () => 'var(--color-gold-soft)')}
      </Panel>

      {comps.length > 0 && (
        <Panel title="谁补谁（五行互补）">
          <ul className="space-y-2">
            {comps.map((c, i) => (
              <li key={i} className="glass-cell rounded-lg p-3">
                <div className="flex flex-wrap items-center gap-1.5 text-sm">
                  <span className="font-kai font-bold" style={{ color: 'var(--color-gold)' }}>
                    {c.from.name}
                  </span>
                  <span style={{ color: 'var(--color-text-dim)' }}>↝ 补</span>
                  <span className="font-kai font-bold" style={{ color: 'var(--color-accent)' }}>
                    {c.to.name}
                  </span>
                  <span className="flex flex-wrap gap-1">
                    {c.wuXings.map((w) => (
                      <span
                        key={w}
                        className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{ background: `${WU_XING_COLOR[w]}22`, color: WU_XING_COLOR[w] }}
                      >
                        {w}
                      </span>
                    ))}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
                  {c.text}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px]" style={{ color: 'var(--color-dim)' }}>
            按八字八字符的五行多寡粗看：谁偏旺、谁完全缺，正好能补上。
          </p>
        </Panel>
      )}
    </div>
  )
}
