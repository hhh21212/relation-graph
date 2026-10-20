// 号码吉凶：手机号/车牌/QQ 等数字 → 80 数理 + 五行 + 趣味评分。

import { useMemo, useState } from 'react'
import { computeNumber } from '../../../core/toolbox/number'

const JI_COLOR: Record<string, string> = {
  吉: 'var(--color-ok)',
  平: 'var(--color-text-dim)',
  凶: 'var(--color-danger)',
}

export default function NumberTool() {
  const [raw, setRaw] = useState('')
  const result = useMemo(() => computeNumber(raw), [raw])

  return (
    <div className="space-y-3">
      <div className="glass-panel p-4">
        <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
          输入号码（手机号 / 车牌 / QQ 号等）
        </span>
        <input
          type="text"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="如：13800138000"
          className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        />
      </div>

      {result && (
        <div className="glass-panel p-4 text-center">
          <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
            {result.digits}
          </div>
          <div className="mt-2 flex items-baseline justify-center gap-1">
            <span className="font-kai text-4xl font-bold text-gold-glow">{result.score}</span>
            <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>分</span>
          </div>
          <div className="mt-2 flex items-center justify-center gap-2 text-sm">
            <span
              className="rounded-full border px-3 py-0.5 font-semibold"
              style={{ color: JI_COLOR[result.level], borderColor: JI_COLOR[result.level] }}
            >
              {result.ji}
            </span>
            <span style={{ color: 'var(--color-text-dim)' }}>五行属{result.wuxing} · 数理 {result.liShu}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
            {result.text}
          </p>
        </div>
      )}

      <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
        号码吉凶为趣味测算，仅供娱乐参考。
      </p>
    </div>
  )
}
