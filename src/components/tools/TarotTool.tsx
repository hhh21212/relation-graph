// 塔罗·专业版：78 张全牌 + 5 牌阵（每日一牌/三牌阵/凯尔特十字/爱情/事业）+ 牌义图鉴。
// 流程：选牌阵 → 洗牌 → 抽牌 → 逐张翻牌（正/逆位）→ 白话解读 + 整体总结。仅供娱乐参考。

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  TAROT_CARDS,
  SPREADS,
  getSpread,
  shuffle,
  draw,
  summarize,
  SUIT_ELEMENT,
  SUIT_SYMBOL,
  SUIT_ZH,
  type SpreadKey,
  type Suit,
  type TarotCard,
  type DrawnCard,
} from '../../core/tarot/data'
import { playShakeSounds, playCoinToss, playRise } from '../../utils/qianSound'
import '../../styles/tarot.css'

type Mode = 'draw' | 'gallery'
type Phase = 'pick' | 'shuffle' | 'reveal'

const SUIT_COLOR: Record<Suit, string> = {
  major: 'var(--color-gold)',
  wands: '#d97743',
  cups: '#4f8fd4',
  swords: '#9aa8bd',
  pentacles: '#5fb07e',
}

function CardBack({ style }: { style?: React.CSSProperties }) {
  return (
    <div className="tarot-card" style={style}>
      <div className="tarot-card-inner">
        <div className="tarot-card-back">
          <span className="tarot-card-back-inner" />
        </div>
      </div>
    </div>
  )
}

function TarotCardView({ drawn, flipped, onClick }: { drawn: DrawnCard; flipped: boolean; onClick?: () => void }) {
  const c = drawn.card
  const accent = SUIT_COLOR[c.suit]
  return (
    <div
      className={`tarot-card${flipped ? ' flipped' : ''}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <div className="tarot-card-inner">
        <div className="tarot-card-back">
          <span className="tarot-card-back-inner" />
        </div>
        <div className="tarot-card-face" style={{ borderColor: accent }}>
          <div className="tarot-sym" style={{ color: accent }}>
            {SUIT_SYMBOL[c.suit]}
          </div>
          <div className="tarot-num" style={{ color: accent }}>
            {c.suit === 'major' ? c.nameZh : c.nameZh.slice(2)}
          </div>
          <div className="tarot-kw">
            {c.keywords.slice(0, 3).map((k) => (
              <span key={k}>{k}</span>
            ))}
          </div>
          <div className="tarot-dir" style={{ color: accent }}>
            {drawn.reversed ? '逆位' : '正位'}
          </div>
        </div>
      </div>
    </div>
  )
}

/** 一张牌的详细解读面板 */
function CardDetail({ card, reversed, title }: { card: TarotCard; reversed?: boolean; title?: string }) {
  const accent = SUIT_COLOR[card.suit]
  const lines = reversed ? card.reversed : card.upright
  return (
    <div className="glass-panel p-3">
      <div className="flex items-baseline gap-2">
        <span className="font-kai text-base font-bold" style={{ color: accent }}>
          {card.nameZh}
        </span>
        <span className="text-[11px]" style={{ color: 'var(--color-dim)' }}>
          {card.nameEn}
        </span>
        <span className="flex-1" />
        <span
          className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
          style={{ color: accent, borderColor: accent }}
        >
          {reversed ? '逆位' : '正位'}
        </span>
      </div>
      {title && (
        <div className="mt-0.5 text-[11px]" style={{ color: 'var(--color-gold)' }}>
          {title}
        </div>
      )}
      <div className="mt-1.5 flex flex-wrap gap-1">
        {card.keywords.map((k) => (
          <span
            key={k}
            className="chip rounded-full px-2 py-0.5 text-[10px]"
            style={{ color: 'var(--color-text-dim)' }}
          >
            {k}
          </span>
        ))}
      </div>
      <ul className="mt-2 space-y-1">
        {lines.map((l, i) => (
          <li key={i} className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>
            {l}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function TarotTool() {
  const [mode, setMode] = useState<Mode>('draw')

  // 抽牌流程
  const [spreadKey, setSpreadKey] = useState<SpreadKey | null>(null)
  const [phase, setPhase] = useState<Phase>('pick')
  const [drawn, setDrawn] = useState<DrawnCard[]>([])
  const [flipped, setFlipped] = useState<Set<number>>(new Set())
  const deck = useRef<number[]>([])

  // 图鉴
  const [gallerySuit, setGallerySuit] = useState<Suit>('major')
  const [detail, setDetail] = useState<TarotCard | null>(null)

  const spread = spreadKey ? getSpread(spreadKey) : null
  const allFlipped = drawn.length > 0 && flipped.size === drawn.length

  useEffect(() => {
    if (phase === 'reveal' && allFlipped) playRise()
  }, [phase, allFlipped, flipped])

  const pickSpread = (k: SpreadKey) => {
    setSpreadKey(k)
    setPhase('shuffle')
    deck.current = shuffle()
    setDrawn([])
    setFlipped(new Set())
    playShakeSounds()
  }

  const reshuffle = () => {
    deck.current = shuffle()
    playShakeSounds()
  }

  const doDraw = () => {
    if (!spread) return
    setDrawn(draw(deck.current, spread.positions.length))
    setFlipped(new Set())
    setPhase('reveal')
  }

  const flip = (i: number) => {
    if (flipped.has(i)) return
    playCoinToss()
    setFlipped((prev) => new Set(prev).add(i))
  }

  const revealAll = () => {
    if (!spread) return
    playRise()
    setFlipped(new Set(drawn.map((_, i) => i)))
  }

  const reset = () => {
    setSpreadKey(null)
    setPhase('pick')
    setDrawn([])
    setFlipped(new Set())
  }

  const galleryCards = useMemo(
    () => TAROT_CARDS.filter((c) => c.suit === gallerySuit),
    [gallerySuit],
  )

  return (
    <div className="space-y-3">
      <header className="tarot-plaque">
        <h1 className="font-kai text-gold-glow">塔罗 · 专业版</h1>
        <div className="tarot-plaque-sub">七 十 八 张 全 牌 · 五 大 经 典 牌 阵</div>
      </header>

      {/* 抽牌 / 图鉴 切换 */}
      <div className="flex gap-2">
        {(
          [
            { k: 'draw', label: '🎴 抽牌' },
            { k: 'gallery', label: '📖 牌义图鉴' },
          ] as const
        ).map((t) => (
          <button
            key={t.k}
            onClick={() => {
              setMode(t.k)
              setDetail(null)
            }}
            className="tap-target flex-1 rounded-full border px-3 py-1.5 text-xs transition"
            style={{
              borderColor: mode === t.k ? 'var(--color-accent)' : 'var(--color-border)',
              color: mode === t.k ? 'var(--color-accent)' : 'var(--color-text-dim)',
              background: mode === t.k ? 'var(--color-card)' : 'transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {mode === 'draw' ? (
        <>
          {/* 选牌阵 */}
          {phase === 'pick' && (
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                选一个牌阵，想清楚你要问的事：
              </p>
              {SPREADS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => pickSpread(s.key)}
                  className="glass-panel tap-target w-full p-3 text-left transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-kai text-base font-bold text-gold-glow">{s.name}</span>
                    <span className="text-[11px]" style={{ color: 'var(--color-dim)' }}>
                      {s.positions.length} 张
                    </span>
                  </div>
                  <p className="mt-1 text-xs" style={{ color: 'var(--color-text-dim)' }}>
                    {s.desc}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* 洗牌 */}
          {phase === 'shuffle' && spread && (
            <div className="space-y-3">
              <div className="glass-panel p-4">
                <div className="mb-1 text-center font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>
                  ✦ {spread.name}
                </div>
                <div className="tarot-fan shuffling">
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <CardBack
                      key={i}
                      style={{
                        '--fx': `${(i - 3) * 26}px`,
                        '--fy': `${Math.abs(i - 3) * 11}px`,
                        '--fr': `${(i - 3) * 9}deg`,
                      } as React.CSSProperties}
                    />
                  ))}
                </div>
                <p className="text-center text-xs" style={{ color: 'var(--color-text-dim)' }}>
                  心中默念你的问题，然后抽牌
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={reshuffle}
                  className="liuyao-btn liuyao-btn-ghost flex-1 px-4 py-2.5"
                >
                  重新洗牌
                </button>
                <button onClick={doDraw} className="liuyao-btn liuyao-btn-primary flex-1 px-4 py-2.5">
                  抽牌（{spread.positions.length} 张）
                </button>
              </div>
            </div>
          )}

          {/* 翻牌 */}
          {phase === 'reveal' && spread && (
            <div className="space-y-3">
              <div className="glass-panel p-4">
                <div className="mb-3 text-center">
                  <div className="font-kai text-base font-bold text-gold-glow">{spread.name}</div>
                  <div className="mt-0.5 text-xs" style={{ color: 'var(--color-text-dim)' }}>
                    逐张点开翻牌，看正逆位
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-x-4 gap-y-5">
                  {drawn.map((d, i) => {
                    const pos = spread.positions[i]
                    const f = flipped.has(i)
                    return (
                      <div key={i} className="flex flex-col items-center gap-1.5" style={{ width: 84 }}>
                        <div className="text-center leading-tight">
                          <div className="text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>
                            {pos.name}
                          </div>
                          <div className="mt-0.5 text-[9px]" style={{ color: 'var(--color-dim)' }}>
                            {pos.hint}
                          </div>
                        </div>
                        <TarotCardView drawn={d} flipped={f} onClick={() => flip(i)} />
                      </div>
                    )
                  })}
                </div>

                {!allFlipped && (
                  <button
                    onClick={revealAll}
                    className="liuyao-btn liuyao-btn-ghost mt-4 w-full px-4 py-2.5"
                  >
                    全部翻开
                  </button>
                )}
              </div>

              {/* 解读 */}
              {allFlipped && (
                <div className="glass-panel p-3" style={{ borderColor: 'var(--color-accent)' }}>
                  <div className="font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>
                    ✦ 整体总结
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                    {summarize(drawn)}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {drawn.map((d, i) => {
                  if (!flipped.has(i)) return null
                  const pos = spread.positions[i]
                  return (
                    <CardDetail
                      key={i}
                      card={d.card}
                      reversed={d.reversed}
                      title={`${pos.name} · ${pos.hint}`}
                    />
                  )
                })}
              </div>

              <button onClick={reset} className="liuyao-btn liuyao-btn-primary w-full px-4 py-2.5">
                再抽一次
              </button>
            </div>
          )}

          <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
            塔罗是自我探索的工具，牌面解读仅供娱乐参考。
          </p>
        </>
      ) : (
        /* 图鉴 */
        <div className="space-y-3">
          {detail ? (
            <>
              <button
                onClick={() => setDetail(null)}
                className="liuyao-btn liuyao-btn-ghost w-full px-4 py-2.5"
              >
                ‹ 返回图鉴
              </button>
              <CardDetail
                card={detail}
                title={`${SUIT_ZH[detail.suit]} · ${SUIT_ELEMENT[detail.suit]}`}
              />
              <div className="glass-panel p-3">
                <div className="font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>
                  ✦ 正位解读
                </div>
                <ul className="mt-1.5 space-y-1">
                  {detail.upright.map((l, i) => (
                    <li key={i} className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-panel p-3">
                <div className="font-kai text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
                  ✦ 逆位解读
                </div>
                <ul className="mt-1.5 space-y-1">
                  {detail.reversed.map((l, i) => (
                    <li key={i} className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {(['major', 'wands', 'cups', 'swords', 'pentacles'] as Suit[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setGallerySuit(s)}
                    className="tap-target shrink-0 rounded-full border px-3 py-1.5 text-xs transition"
                    style={{
                      borderColor: gallerySuit === s ? 'var(--color-accent)' : 'var(--color-border)',
                      color: gallerySuit === s ? 'var(--color-accent)' : 'var(--color-text-dim)',
                      background: gallerySuit === s ? 'var(--color-card)' : 'transparent',
                    }}
                  >
                    {SUIT_SYMBOL[s]} {SUIT_ZH[s]}
                  </button>
                ))}
              </div>

              <div className="tarot-grid">
                {galleryCards.map((c) => (
                  <button key={c.nameEn} className="tarot-mini" onClick={() => setDetail(c)}>
                    <span className="tm-sym" style={{ color: SUIT_COLOR[c.suit] }}>
                      {SUIT_SYMBOL[c.suit]}
                    </span>
                    <span className="tm-name" style={{ color: SUIT_COLOR[c.suit] }}>
                      {c.nameZh}
                    </span>
                    <span className="tm-en">{c.nameEn}</span>
                  </button>
                ))}
              </div>

              <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
                共 {TAROT_CARDS.length} 张牌 · 点开任意牌看正逆位详解
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
