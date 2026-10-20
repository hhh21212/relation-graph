// 测字断事：输入一个字，拆字断吉凶。

import { useMemo, useState } from 'react'
import { computeCeZi } from '../../../core/toolbox/cezi'

const JI_COLOR: Record<string, string> = {
  吉: 'var(--color-ok)',
  凶: 'var(--color-danger)',
  中: 'var(--color-text-dim)',
}

export default function CeZiTool() {
  const [char, setChar] = useState('')
  const result = useMemo(() => computeCeZi(char), [char])

  return (
    <div className="space-y-3">
      <div className="glass-panel p-4">
        <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
          心中默念所问之事，写下最想说出口的一个字
        </span>
        <input
          type="text"
          value={char}
          onChange={(e) => setChar(e.target.value.slice(0, 1))}
          placeholder="一个字，如「好」"
          maxLength={1}
          className="w-full rounded-xl border bg-transparent px-3 py-3 text-center text-2xl outline-none"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        />
      </div>

      {result && (
        <div className="glass-panel p-4 text-center">
          <div className="font-kai text-4xl font-bold text-gold-glow">{result.char}</div>
          <div
            className="mt-2 inline-block rounded-full border px-3 py-0.5 text-sm font-semibold"
            style={{ color: JI_COLOR[result.ji], borderColor: JI_COLOR[result.ji] }}
          >
            {result.ji}
          </div>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
            {result.text}
          </p>
          {result.estimated && (
            <p className="mt-2 text-[11px]" style={{ color: 'var(--color-dim)' }}>
              该字未收录，按通用断法估算。
            </p>
          )}
        </div>
      )}

      <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
        测字断事为趣味拆字，仅供娱乐参考。
      </p>
    </div>
  )
}
