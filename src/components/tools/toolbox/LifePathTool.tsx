// 生命灵数：输入公历出生日期 → 生命数字 + 天赋数 + 白话解读。

import { useMemo, useState } from 'react'
import { computeLifePath } from '../../../core/toolbox/lifepath'

export default function LifePathTool() {
  const [year, setYear] = useState(2000)
  const [month, setMonth] = useState(6)
  const [day, setDay] = useState(15)
  const result = useMemo(
    () => (year > 0 && month > 0 && day > 0 ? computeLifePath(year, month, day) : null),
    [year, month, day],
  )

  const inputCls = 'w-full rounded-xl border bg-transparent px-3 py-2.5 text-center text-sm outline-none'
  const numInput = (v: number, set: (n: number) => void, ph: string) => (
    <input
      type="number"
      value={v || ''}
      onChange={(e) => set(Number(e.target.value))}
      placeholder={ph}
      min={1}
      className={inputCls}
      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
    />
  )

  return (
    <div className="space-y-3">
      <div className="glass-panel p-4">
        <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
          输入公历出生日期
        </span>
        <div className="grid grid-cols-3 gap-2">
          {numInput(year, setYear, '年')}
          {numInput(month, setMonth, '月')}
          {numInput(day, setDay, '日')}
        </div>
      </div>

      {result && (
        <div className="glass-panel p-4 text-center">
          <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
            你的生命数字（{result.firstSum} 归约而来）
          </div>
          <div className="mt-2 font-kai text-6xl font-bold leading-none text-gold-glow">
            {result.lifePath}
          </div>
          <div className="mt-2 font-kai text-base" style={{ color: 'var(--color-gold)' }}>
            {result.title}
          </div>
          {result.isMaster && (
            <div
              className="mx-auto mt-2 inline-block rounded-full border px-3 py-0.5 text-xs font-semibold"
              style={{ color: 'var(--color-gold)', borderColor: 'var(--color-gold)' }}
            >
              大师数
            </div>
          )}
          <p className="mt-3 text-left text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
            {result.text}
          </p>

          <div className="mt-4 border-t pt-3 text-left" style={{ borderColor: 'var(--color-line)' }}>
            <div className="text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>
              天赋数：{result.talent.join(' · ')}
            </div>
            <div className="mt-2 space-y-2">
              {result.talents.map((t, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold"
                    style={{ background: 'var(--color-gold-soft)', color: 'var(--color-gold)' }}
                  >
                    {t.n}
                  </span>
                  <span className="leading-relaxed" style={{ color: 'var(--color-text)' }}>
                    {t.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
        生命灵数为西方数理学说，仅供娱乐参考。
      </p>
    </div>
  )
}
