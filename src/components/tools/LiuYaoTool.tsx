// 六爻摇卦：三枚铜钱摇六次（初爻→上爻），得本卦 + 变卦。
// 老阴(6)/老阳(9)为动爻，动爻所在爻变 → 变卦。结果仅供娱乐参考。

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  TRIGRAMS,
  interpret,
  tossHexagram,
  yinYang,
  type Hexagram,
  type JiType,
  type LiuYaoResult,
  type YaoValue,
} from '../../core/liuyao/data'
import { playCoinToss, playRise } from '../../utils/qianSound'
import '../../styles/liuyao.css'

type Phase = 'idle' | 'tossing' | 'done'

const JI_COLOR: Record<JiType, string> = {
  大吉: 'var(--color-ok)',
  吉: 'var(--color-ok)',
  中吉: 'var(--color-ok)',
  平: 'var(--color-text-dim)',
  小凶: 'var(--color-accent)',
  凶: 'var(--color-danger)',
}

const YAO_LABEL: Record<YaoValue, string> = {
  6: '老阴 ×',
  7: '少阳',
  8: '少阴',
  9: '老阳 ○',
}

/** 六爻卦象：6 条线（上爻→初爻），moving 标记动爻 */
function Lines({ yangs, moving, revealed = 6 }: { yangs: (0 | 1)[]; moving?: Set<number>; revealed?: number }) {
  return (
    <div className="liuyao-hexagram" aria-hidden="true">
      {[5, 4, 3, 2, 1, 0].map((idx) => {
        const shown = idx < revealed
        const isMoving = moving?.has(idx)
        return (
          <div key={idx} className={`liuyao-line${shown ? '' : ' liuyao-line-hidden'}`}>
            {yangs[idx] === 1 ? (
              <span className="liuyao-bar" />
            ) : (
              <span className="liuyao-bar liuyao-bar-split">
                <i />
                <i />
              </span>
            )}
            {isMoving && <span className="liuyao-moving" />}
          </div>
        )
      })}
    </div>
  )
}

function hexYangs(h: Hexagram): (0 | 1)[] {
  const u = TRIGRAMS[h.upper].lines
  const l = TRIGRAMS[h.lower].lines
  return [...l, ...u] as (0 | 1)[]
}

/** 卦卡：卦名 + 卦象 + 吉凶 + 白话卦辞 */
function HexCard({ hex, title }: { hex: Hexagram; title: string }) {
  const u = TRIGRAMS[hex.upper]
  const l = TRIGRAMS[hex.lower]
  return (
    <div className="glass-panel p-4 text-center">
      <div className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
        {title}
      </div>
      <div className="mt-2 flex items-center justify-center gap-4">
        <Lines yangs={hexYangs(hex)} />
        <div className="text-left">
          <div className="font-kai text-xl font-bold text-gold-glow">{hex.name}</div>
          <div className="mt-1 text-xs" style={{ color: 'var(--color-dim)' }}>
            {u.nature}上 · {l.nature}下
          </div>
          <div
            className="mt-2 inline-block rounded-full border px-3 py-0.5 text-xs font-semibold"
            style={{ color: JI_COLOR[hex.ji], borderColor: JI_COLOR[hex.ji] }}
          >
            {hex.ji}
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
        {hex.yi}
      </p>
    </div>
  )
}

export default function LiuYaoTool() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [values, setValues] = useState<YaoValue[]>([])
  const [revealed, setRevealed] = useState(0)
  const [result, setResult] = useState<LiuYaoResult | null>(null)

  const timers = useRef<number[]>([])

  useEffect(() => {
    return () => timers.current.forEach((t) => window.clearTimeout(t))
  }, [])

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  const start = () => {
    if (phase === 'tossing') return
    clearTimers()
    const vals = tossHexagram()
    setValues(vals)
    setResult(null)
    setRevealed(0)
    setPhase('tossing')
    playCoinToss()
    for (let i = 0; i < 6; i++) {
      timers.current.push(
        window.setTimeout(() => {
          setRevealed(i + 1)
          playCoinToss()
          if (i + 1 === 6) {
            timers.current.push(
              window.setTimeout(() => {
                setResult(interpret(vals))
                setPhase('done')
                playRise()
              }, 380),
            )
          }
        }, 320 + i * 430),
      )
    }
  }

  const again = () => {
    clearTimers()
    setPhase('idle')
    setValues([])
    setRevealed(0)
    setResult(null)
  }

  const yangs = useMemo(() => values.map(yinYang) as (0 | 1)[], [values])
  const moving = useMemo(() => new Set(values.map((v, i) => (v === 6 || v === 9 ? i : -1)).filter((i) => i >= 0)), [values])

  return (
    <div className="space-y-3">
      <header className="liuyao-plaque">
        <h1 className="font-kai text-gold-glow">六爻摇卦</h1>
        <div className="liuyao-plaque-sub">铜 钱 起 卦 · 问 事 断 吉 凶</div>
      </header>

      {/* 起卦台 */}
      <div className="glass-panel p-4 text-center">
        <div className="liuyao-coins">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`liuyao-coin${phase === 'tossing' ? ' spinning' : ''}`}>
              <span className="liuyao-coin-face">
                {phase === 'idle' ? '字' : i === 1 ? '背' : '字'}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center">
          <Lines yangs={yangs} moving={moving} revealed={revealed} />
          <div className="ml-5 w-20 text-left text-xs leading-relaxed" style={{ color: 'var(--color-dim)' }}>
            {phase === 'idle' ? (
              <>
                <div>初爻 ↓</div>
                <div className="mt-1">六爻 ↑</div>
              </>
            ) : (
              <div className="liuyao-yao-note">
                {revealed >= 6
                  ? '卦成'
                  : `第 ${revealed + 1} 爻 · ${YAO_LABEL[values[revealed]]}`}
              </div>
            )}
          </div>
        </div>

        {phase === 'idle' ? (
          <button className="liuyao-btn liuyao-btn-primary mt-4 px-8 py-2.5" onClick={start}>
            🪙 摇一卦
          </button>
        ) : phase === 'tossing' ? (
          <button className="liuyao-btn liuyao-btn-ghost mt-4 px-8 py-2.5" disabled>
            摇卦中…
          </button>
        ) : (
          <button className="liuyao-btn liuyao-btn-primary mt-4 px-8 py-2.5" onClick={again}>
            再摇一卦
          </button>
        )}
      </div>

      {/* 结果 */}
      {phase === 'done' && result && (
        <>
          <HexCard hex={result.ben} title="本卦 · 当下之象" />
          {result.bian ? (
            <HexCard hex={result.bian} title="变卦 · 发展之象" />
          ) : (
            <div className="glass-panel p-3 text-center text-xs" style={{ color: 'var(--color-dim)' }}>
              六爻皆静、无动爻，事情大概率按现状平稳发展。
            </div>
          )}
          {result.moving.length > 0 && (
            <div className="glass-panel p-3 text-center text-xs" style={{ color: 'var(--color-accent)' }}>
              动爻：{result.moving.map((i) => `第 ${i + 1} 爻`).join('、')}（老阴/老阳会变化）
            </div>
          )}
        </>
      )}

      <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
        三枚铜钱、六次摇卦 · 心诚则灵，仅供娱乐参考。
      </p>
    </div>
  )
}
