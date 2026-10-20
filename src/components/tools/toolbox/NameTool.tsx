// 姓名五格测试：天格/人格/地格/外格/总格 → 81 数理吉凶 + 五行。

import { useMemo, useState } from 'react'
import { computeWuGe } from '../../../core/toolbox/name'

const JI_COLOR: Record<string, string> = {
  大吉: 'var(--color-ok)',
  吉: 'var(--color-ok)',
  半吉: 'var(--color-text-dim)',
  凶: 'var(--color-danger)',
}

export default function NameTool() {
  const [surname, setSurname] = useState('')
  const [given, setGiven] = useState('')

  const result = useMemo(() => computeWuGe(surname, given), [surname, given])

  return (
    <div className="space-y-3">
      <div className="glass-panel space-y-2.5 p-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>姓氏</span>
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="如：王"
              className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>
          <div>
            <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>名字</span>
            <input
              type="text"
              value={given}
              onChange={(e) => setGiven(e.target.value)}
              placeholder="如：小明"
              className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>
        </div>
      </div>

      {result.ges.length > 0 && (
        <>
          <div className="glass-panel p-4 text-center">
            <div className="font-kai text-xl font-bold text-gold-glow">
              {surname}{given}
            </div>
            <div
              className="mt-2 inline-block rounded-full border px-3 py-0.5 text-sm font-semibold"
              style={{ color: JI_COLOR[result.level === '需留意' ? '凶' : result.level === '中平' ? '半吉' : '大吉'], borderColor: 'var(--color-ok)' }}
            >
              {result.level}
            </div>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
              {result.summary}
            </p>
          </div>

          <div className="space-y-2">
            {result.ges.map((g) => (
              <div key={g.name} className="glass-cell rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="font-kai text-base font-bold" style={{ color: 'var(--color-gold)' }}>{g.name}</span>
                  <span className="text-xs" style={{ color: 'var(--color-dim)' }}>{g.n} · {g.wuxing}</span>
                  <span className="flex-1" />
                  <span
                    className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                    style={{ color: JI_COLOR[g.ji], borderColor: JI_COLOR[g.ji] }}
                  >
                    {g.ji}
                  </span>
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--color-text-dim)' }}>{g.text}</p>
              </div>
            ))}
          </div>

          {result.estimated && (
            <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
              含未收录字，笔画按 10 画估算，结果仅供参考。
            </p>
          )}
        </>
      )}

      <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
        姓名五格为传统数理，仅供娱乐参考。
      </p>
    </div>
  )
}
