// 求签：吕祖灵签 100 签，一个模块两个入口（摇签 / 签文查询）。
// 摇签：点签筒 → 摇晃 + 竹片声 → 中签抬起露出红签号 → 展开签纸卡。
// 查询：按签号（1~100）或点快捷网格，看完整签文（解签 / 诗曰 / 白话 / 十二项运程）。

import { useEffect, useMemo, useRef, useState } from 'react'
import { QIAN, FORTUNE_KEYS, findSign, levelKeyOf, type QianSign } from '../../core/qian/data'
import { playShakeSounds, playRise } from '../../utils/qianSound'
import '../../styles/qian.css'

type Mode = 'draw' | 'lookup'
type Phase = 'idle' | 'shaking' | 'rising' | 'done'

const SHAKE_MS = 3500
const RISE_MS = 950

function Plaque({ title, sub }: { title: string; sub: string }) {
  return (
    <header className="qian-plaque">
      <h1 className="font-kai text-gold-glow">{title}</h1>
      <div className="qian-plaque-sub">{sub}</div>
    </header>
  )
}

/** 等级徽章：五档主题化「章」 */
function Badge({ level }: { level: string }) {
  return (
    <span className="qian-badge" data-level={levelKeyOf(level)}>
      {level}
    </span>
  )
}

/** 签诗：按 ; / ； 换行 */
function Poem({ text }: { text: string }) {
  const lines = text.split(/[;；]/).filter(Boolean)
  return (
    <div className="qian-poem">
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  )
}

/** 签文卡：出签结果（brief）与查询结果（full）共用 */
function SignCard({
  sign,
  full,
  onAgain,
  onFullDetail,
}: {
  sign: QianSign
  full?: boolean
  onAgain?: () => void
  onFullDetail?: () => void
}) {
  const fortunes = FORTUNE_KEYS.map((k) => ({ k, v: sign.fortunes?.[k] })).filter((x) => x.v)
  return (
    <div className="qian-paper glass-panel p-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="font-kai text-2xl font-bold text-gold-glow">第 {sign.id} 签</span>
        <Badge level={sign.level} />
      </div>
      <div className="mt-3 text-center text-sm" style={{ color: 'var(--color-text-dim)' }}>
        典故 · <b style={{ color: 'var(--color-accent)' }}>{sign.title}</b>
      </div>

      <Poem text={sign.poem} />

      {!full ? (
        <>
          <div className="qian-divider" />
          <p
            className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed"
            style={{ color: 'var(--color-text-dim)' }}
          >
            <span style={{ color: 'var(--color-accent)' }}>解：</span>
            {sign.brief}
          </p>
        </>
      ) : (
        <>
          <div className="qian-divider" />
          <p className="mt-4 text-center text-sm leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
            {sign.brief}
          </p>

          <div className="qian-sec">
            <div className="qian-sec-title">解签</div>
            <div className="qian-sec-body">{sign.jie}</div>
          </div>

          <div className="qian-sec">
            <div className="qian-sec-title">诗曰</div>
            <div className="qian-sec-body text-center">{sign.shi}</div>
          </div>

          <div className="qian-sec">
            <div className="qian-sec-title">白话解诗</div>
            <div className="qian-sec-body glass-cell rounded-lg p-3">{sign.jieshi}</div>
          </div>

          {fortunes.length > 0 && (
            <div className="qian-sec">
              <div className="qian-sec-title">十二项运程</div>
              <div className="qian-fortunes">
                {fortunes.map((f) => (
                  <div key={f.k} className="glass-cell rounded-lg p-2">
                    <div className="qian-f-key">{f.k}</div>
                    <div className="qian-f-val">{f.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {onAgain && (
          <button className="qian-btn qian-btn-primary px-8 py-2.5" onClick={onAgain}>
            再求一签
          </button>
        )}
        {onFullDetail && (
          <button className="qian-btn qian-btn-ghost px-5 py-2.5" onClick={onFullDetail}>
            看完整签文 →
          </button>
        )}
      </div>
    </div>
  )
}

export default function QianTool() {
  const [mode, setMode] = useState<Mode>('draw')
  const [phase, setPhase] = useState<Phase>('idle')
  const [drawn, setDrawn] = useState<QianSign | null>(null)

  const [lookupText, setLookupText] = useState('')
  const [lookupId, setLookupId] = useState<number | null>(null)
  const [lookupErr, setLookupErr] = useState<string | null>(null)

  const timers = useRef<number[]>([])

  // 卸载时清理所有定时器
  useEffect(() => {
    return () => timers.current.forEach((t) => window.clearTimeout(t))
  }, [])

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  const shaking = phase === 'shaking' || phase === 'rising'
  const rising = phase === 'rising' || phase === 'done'

  const draw = () => {
    if (shaking) return
    clearTimers()
    const chosen = QIAN[Math.floor(Math.random() * QIAN.length)]
    setDrawn(chosen)
    setPhase('shaking')
    playShakeSounds()
    timers.current.push(
      window.setTimeout(() => {
        setPhase('rising')
        playRise()
        timers.current.push(window.setTimeout(() => setPhase('done'), RISE_MS))
      }, SHAKE_MS),
    )
  }

  const again = () => {
    clearTimers()
    setPhase('idle')
    setDrawn(null)
  }

  const lookupResult = useMemo(() => (lookupId != null ? findSign(lookupId) : null), [lookupId])

  const submitLookup = () => {
    const n = parseInt(lookupText, 10)
    if (!n || n < 1 || n > 100) {
      setLookupErr('请输入 1 ~ 100 的签号')
      setLookupId(null)
      return
    }
    setLookupErr(null)
    setLookupId(n)
  }

  const goFullDetail = (sign: QianSign) => {
    setMode('lookup')
    setLookupText(String(sign.id))
    setLookupId(sign.id)
    setLookupErr(null)
  }

  const pickGrid = (n: number) => {
    setLookupText(String(n))
    setLookupId(n)
    setLookupErr(null)
  }

  return (
    <div className="space-y-3">
      {/* 入口切换 */}
      <div className="glass-panel p-4">
        <div className="flex gap-2">
          {(
            [
              { key: 'draw', label: '🎋 摇签' },
              { key: 'lookup', label: '📖 签文查询' },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setMode(t.key)}
              className="tap-target flex-1 rounded-full border py-2 text-sm transition"
              style={{
                borderColor: mode === t.key ? 'var(--color-accent)' : 'var(--color-border)',
                color: mode === t.key ? 'var(--color-accent)' : 'var(--color-text-dim)',
                background: mode === t.key ? 'var(--color-card)' : 'transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'draw' ? (
        <>
          <Plaque title="三弘道长求签" sub="吕 祖 灵 签 · 摇 签 问 卜" />

          <div className="qian-scene" onClick={draw} role="button" aria-label="点按签筒摇签">
            <div className="qian-fog" />
            <div className={`qian-shaker${phase === 'shaking' ? ' shaking' : ''}`}>
              {(['s-l3', 's-l2', 's-l1', 's-r1', 's-r2', 's-r3'] as const).map((cls) => (
                <div key={cls} className={`qian-stick ${cls}`}>
                  <div className={`qian-stick-inner${phase === 'shaking' ? ' rattling' : ''}`} />
                </div>
              ))}

              <div className={`qian-stick s-m${rising ? ' rising' : ''}`}>
                <div className={`qian-stick-inner${phase === 'shaking' ? ' rattling' : ''}`}>
                  {drawn && rising ? <span className="qian-seal">{drawn.id}</span> : null}
                </div>
              </div>

              <div className="qian-tube">
                <div className="qian-tube-rim" />
                <div className="qian-tube-base" />
                <svg className="qian-tube-svg" viewBox="0 0 300 150" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <pattern id="qianHui" width="18" height="18" patternUnits="userSpaceOnUse">
                      <rect x="3" y="3" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
                      <rect x="6.5" y="6.5" width="5" height="5" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.55" />
                    </pattern>
                  </defs>
                  <rect x="6" y="18" width="288" height="30" fill="url(#qianHui)" />
                  <line x1="6" y1="16" x2="294" y2="16" stroke="currentColor" strokeWidth="2" opacity="0.7" />
                  <line x1="6" y1="50" x2="294" y2="50" stroke="currentColor" strokeWidth="2" opacity="0.7" />
                </svg>
                <span className="qian-tube-label">吕祖灵签</span>
              </div>
            </div>
          </div>

          {phase === 'idle' && (
            <p className="qian-hint">
              诚心默念，心中想着所问之事
              <br />
              然后 <b>点按签筒</b>，摇出一签 <span className="pulse">▼</span>
            </p>
          )}

          {phase === 'done' && drawn && (
            <SignCard sign={drawn} onAgain={again} onFullDetail={() => goFullDetail(drawn)} />
          )}
        </>
      ) : (
        <>
          <Plaque title="签文查询" sub="吕 祖 灵 签 · 道长查签" />

          <div className="glass-panel p-4">
            <div className="mb-3 text-center text-sm" style={{ color: 'var(--color-text-dim)' }}>
              输入签号（1 ~ 100）
            </div>
            <div className="flex gap-2">
              <input
                className="qian-input"
                type="number"
                min={1}
                max={100}
                inputMode="numeric"
                placeholder="签号"
                value={lookupText}
                onChange={(e) => setLookupText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitLookup()
                }}
              />
              <button className="qian-btn qian-btn-primary px-6" onClick={submitLookup}>
                查看
              </button>
            </div>
            {lookupErr && (
              <p className="mt-2 text-center text-xs" style={{ color: 'var(--color-accent)' }}>
                {lookupErr}
              </p>
            )}
            <div className="qian-grid mt-3">
              {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => (
                <button key={n} className="qian-num" onClick={() => pickGrid(n)}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {lookupResult && (
            <SignCard
              key={lookupResult.id}
              sign={lookupResult}
              full
              onAgain={() => {
                setLookupText('')
                setLookupId(null)
                setLookupErr(null)
              }}
            />
          )}
        </>
      )}

      <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
        吕祖灵签一百签 · 心诚则灵，仅供娱乐参考。
      </p>
    </div>
  )
}
