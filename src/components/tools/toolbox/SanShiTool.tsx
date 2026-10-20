// 三世姻缘：选双方生肖，看前世今生缘分，可复制分享文案。

import { useMemo, useState } from 'react'
import { computeSanShi } from '../../../core/toolbox/sanshi'
import { ZODIAC_ANIMALS } from '../../../core/rules/zodiac'

const LEVEL_COLOR: Record<string, string> = {
  上等缘: 'var(--color-ok)',
  中上缘: 'var(--color-ok)',
  中等缘: 'var(--color-text-dim)',
  需磨合: 'var(--color-accent)',
}

export default function SanShiTool() {
  const [a, setA] = useState<number>(0)
  const [b, setB] = useState<number>(6)
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => computeSanShi(a, b), [a, b])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.share)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-3">
      <div className="glass-panel space-y-3 p-4">
        {(
          [
            { label: '你的生肖', v: a, set: setA },
            { label: 'TA 的生肖', v: b, set: setB },
          ] as const
        ).map((picker) => (
          <div key={picker.label}>
            <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
              {picker.label}
            </span>
            <div className="grid grid-cols-6 gap-1.5">
              {ZODIAC_ANIMALS.map((z, i) => (
                <button
                  key={z}
                  onClick={() => picker.set(i)}
                  className="tap-target rounded-lg border py-1.5 text-sm transition"
                  style={{
                    borderColor: picker.v === i ? 'var(--color-accent)' : 'var(--color-border)',
                    color: picker.v === i ? 'var(--color-accent)' : 'var(--color-text)',
                    background: picker.v === i ? 'var(--color-card)' : 'transparent',
                  }}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-4 text-center">
        <div className="font-kai text-xl font-bold text-gold-glow">
          {result.aName} × {result.bName}
        </div>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span
            className="rounded-full border px-3 py-0.5 text-sm font-semibold"
            style={{ color: LEVEL_COLOR[result.level], borderColor: LEVEL_COLOR[result.level] }}
          >
            {result.relation} · {result.level}
          </span>
          <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
            {result.score} 分
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
          {result.text}
        </p>

        <button
          onClick={copy}
          className="liuyao-btn liuyao-btn-primary mt-4 w-full px-4 py-2.5"
        >
          {copied ? '✓ 已复制' : '复制缘分文案'}
        </button>
      </div>

      <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
        三世姻缘为趣味测算，仅供娱乐参考。
      </p>
    </div>
  )
}
