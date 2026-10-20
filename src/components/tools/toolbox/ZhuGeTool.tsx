// 诸葛神算：输入三字（或数字），按笔画取签，对应 64 卦 × 6 爻。

import { useMemo, useState } from 'react'
import { computeZhuGe } from '../../../core/toolbox/zhuge'

const JI_COLOR: Record<string, string> = {
  大吉: 'var(--color-ok)',
  吉: 'var(--color-ok)',
  中吉: 'var(--color-ok)',
  平: 'var(--color-text-dim)',
  小凶: 'var(--color-accent)',
  凶: 'var(--color-danger)',
}

export default function ZhuGeTool() {
  const [input, setInput] = useState('')
  const result = useMemo(() => computeZhuGe(input), [input])

  return (
    <div className="space-y-3">
      <div className="glass-panel p-4">
        <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
          心中默念所问之事，写下三个字（或三个数字）
        </span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, 6))}
          placeholder="如「问前程」"
          className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        />
      </div>

      {result && (
        <div className="glass-panel p-4 text-center">
          <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
            第 {result.number} 签 · {result.hexName} · {result.yao}
          </div>
          <div className="mt-2 font-kai text-2xl font-bold text-gold-glow">{result.hexName}</div>
          <div
            className="mt-2 inline-block rounded-full border px-3 py-0.5 text-sm font-semibold"
            style={{ color: JI_COLOR[result.ji] ?? 'var(--color-text-dim)', borderColor: JI_COLOR[result.ji] ?? 'var(--color-border)' }}
          >
            {result.ji}
          </div>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
            {result.text}
          </p>
        </div>
      )}

      <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
        诸葛神算为传统签法，仅供娱乐参考。
      </p>
    </div>
  )
}
