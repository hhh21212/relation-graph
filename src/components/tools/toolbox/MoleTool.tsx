// 痣相图解：按面部/身体浏览痣位图鉴。

import { useState } from 'react'
import { molesByRegion } from '../../../core/toolbox/moles'

const JI_COLOR: Record<string, string> = {
  吉: 'var(--color-ok)',
  凶: 'var(--color-danger)',
  中: 'var(--color-text-dim)',
}

export default function MoleTool() {
  const [region, setRegion] = useState<'面部' | '身体'>('面部')
  const list = molesByRegion(region)

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(['面部', '身体'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className="tap-target flex-1 rounded-full border px-3 py-1.5 text-xs transition"
            style={{
              borderColor: region === r ? 'var(--color-accent)' : 'var(--color-border)',
              color: region === r ? 'var(--color-accent)' : 'var(--color-text-dim)',
              background: region === r ? 'var(--color-card)' : 'transparent',
            }}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {list.map((m) => (
          <div key={m.name} className="glass-cell rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="font-kai text-base font-bold" style={{ color: 'var(--color-gold)' }}>
                {m.name}
              </span>
              <span
                className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                style={{ color: JI_COLOR[m.ji], borderColor: JI_COLOR[m.ji] }}
              >
                {m.ji}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
              {m.text}
            </p>
          </div>
        ))}
      </div>

      <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
        痣相图鉴为传统相学，仅供娱乐参考。
      </p>
    </div>
  )
}
