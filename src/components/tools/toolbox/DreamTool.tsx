// 周公解梦：输入梦境关键词搜索，或直接浏览梦境库。

import { useMemo, useState } from 'react'
import { DREAMS, searchDreams, type DreamEntry } from '../../../core/toolbox/dreams'

const JI_COLOR: Record<string, string> = {
  吉: 'var(--color-ok)',
  凶: 'var(--color-danger)',
  中: 'var(--color-text-dim)',
}

function DreamCard({ d }: { d: DreamEntry }) {
  return (
    <div className="glass-cell rounded-lg p-3">
      <div className="flex items-center gap-2">
        <span className="font-kai text-base font-bold text-gold-glow">{d.title}</span>
        <span
          className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
          style={{ color: JI_COLOR[d.ji], borderColor: JI_COLOR[d.ji] }}
        >
          {d.ji}
        </span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
        {d.text}
      </p>
    </div>
  )
}

export default function DreamTool() {
  const [q, setQ] = useState('')
  const results = useMemo(() => (q.trim() ? searchDreams(q) : DREAMS), [q])

  return (
    <div className="space-y-3">
      <div className="glass-panel p-4">
        <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
          输入梦境关键词（如「掉牙」「蛇」「水」）
        </span>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索梦境…"
          className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        />
      </div>

      {q.trim() && results.length === 0 && (
        <p className="py-6 text-center text-sm" style={{ color: 'var(--color-dim)' }}>
          没找到相关梦境，换个关键词试试
        </p>
      )}

      <div className="space-y-2">
        {results.map((d) => (
          <DreamCard key={d.title} d={d} />
        ))}
      </div>

      <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
        解梦说法众说纷纭，仅供娱乐参考，别太当真。
      </p>
    </div>
  )
}
