// 称骨算命：输入公历生日（时辰可选），按农历四柱骨重合计，对照白话评语。

import { useMemo, useState } from 'react'
import { computeChengGu } from '../../../core/toolbox/chenggu'

const LEVEL_COLOR: Record<string, string> = {
  大吉: 'var(--color-ok)',
  吉: 'var(--color-ok)',
  平: 'var(--color-text-dim)',
  凶: 'var(--color-danger)',
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function ChengGuTool() {
  const today = new Date()
  const [date, setDate] = useState(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`)
  const [hour, setHour] = useState<string>('')

  const [y, m, d] = date.split('-').map(Number)
  const result = useMemo(
    () => (y && m && d ? computeChengGu(y, m, d, hour === '' ? undefined : Number(hour)) : null),
    [y, m, d, hour],
  )

  return (
    <div className="space-y-3">
      <div className="glass-panel space-y-2.5 p-4">
        <div>
          <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
            公历生日
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
        </div>
        <div>
          <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
            出生时辰（可选，0-23 点）
          </span>
          <input
            type="number"
            min={0}
            max={23}
            placeholder="不填则只按年月日"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
        </div>
      </div>

      {result && (
        <>
          <div className="glass-panel p-4 text-center">
            <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
              农历 {result.lunarText}
            </div>
            <div className="mt-2 flex items-baseline justify-center gap-1">
              <span className="font-kai text-4xl font-bold text-gold-glow">{result.liang}</span>
              <span className="text-sm" style={{ color: 'var(--color-gold)' }}>两</span>
              <span className="font-kai text-4xl font-bold text-gold-glow">{result.qian}</span>
              <span className="text-sm" style={{ color: 'var(--color-gold)' }}>钱</span>
            </div>
            <div
              className="mt-2 inline-block rounded-full border px-3 py-0.5 text-sm font-semibold"
              style={{ color: LEVEL_COLOR[result.level], borderColor: LEVEL_COLOR[result.level] }}
            >
              {result.level}
            </div>
            {!result.hasHour && (
              <div className="mt-1 text-[11px]" style={{ color: 'var(--color-dim)' }}>
                未填时辰，结果仅按年月日估算
              </div>
            )}
          </div>

          <div className="glass-panel p-4">
            <div className="mb-2 grid grid-cols-4 gap-2 text-center">
              {[
                { label: '年', v: result.weights.year },
                { label: '月', v: result.weights.month },
                { label: '日', v: result.weights.day },
                { label: '时', v: result.weights.hour ?? '—' },
              ].map((w) => (
                <div key={w.label} className="glass-cell rounded-lg py-2">
                  <div className="text-[10px]" style={{ color: 'var(--color-dim)' }}>{w.label}</div>
                  <div className="mt-0.5 text-sm" style={{ color: 'var(--color-text)' }}>
                    {w.v}<span className="text-[10px]">钱</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
              {result.text}
            </p>
          </div>
        </>
      )}

      <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
        称骨算命为传统命理，结果仅供娱乐参考。
      </p>
    </div>
  )
}
