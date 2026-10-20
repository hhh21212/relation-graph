// 全站特效层：按主题渲染专属特效，受「特效开关 + 强度」控制。
// 所有元素 pointer-events:none、负 z-index，只动 transform/opacity，不挡交互。

import { useMemo, type CSSProperties } from 'react'
import { useStore, type FxIntensity } from '../../core/storage/store'
import '../../styles/effects.css'

const COUNTS: Record<FxIntensity, number> = { soft: 10, standard:20, rich: 32 }
const DECOR: Record<FxIntensity, { shoots: number; blooms: number; pulses: number; ripples: number }> = {
  soft: { shoots: 1, blooms: 1, pulses: 2, ripples: 2 },
  standard: { shoots: 2, blooms: 2, pulses: 4, ripples: 4 },
  rich: { shoots: 3, blooms: 3, pulses: 6, ripples: 6 },
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}
function v(k: string, val: string): CSSProperties {
  return { [k]: val } as CSSProperties
}

interface Particle {
  x: string
  y: string
  s: string
  d: string
  delay: string
  dx: string
  op: string
  rot: string
}

function particles(n: number): Particle[] {
  return Array.from({ length: n }, () => ({
    x: `${rand(2, 98).toFixed(1)}%`,
    y: `${rand(12, 82).toFixed(1)}%`,
    s: `${rand(2.5, 7).toFixed(1)}px`,
    d: `${rand(7, 16).toFixed(1)}s`,
    delay: `${rand(0, 12).toFixed(1)}s`,
    dx: `${rand(-70, 70).toFixed(0)}px`,
    op: `${rand(0.65, 1).toFixed(2)}`,
    rot: `${rand(240, 720).toFixed(0)}deg`,
  }))
}

function leaves(n: number): Particle[] {
  return Array.from({ length: n }, () => ({
    x: `${rand(2, 98).toFixed(1)}%`,
    y: '0%',
    s: `${rand(11, 18).toFixed(1)}px`,
    d: `${rand(9, 18).toFixed(1)}s`,
    delay: `${rand(0, 14).toFixed(1)}s`,
    dx: `${rand(30, 90).toFixed(0)}px`,
    op: `${rand(0.75, 1).toFixed(2)}`,
    rot: `${rand(240, 720).toFixed(0)}deg`,
  }))
}

function pStyle(p: Particle): CSSProperties {
  return { ...v('--x', p.x), ...v('--y', p.y), ...v('--s', p.s), ...v('--d', p.d), ...v('--delay', p.delay), ...v('--dx', p.dx), ...v('--op', p.op), ...v('--rot', p.rot) }
}

function spread(n: number, size: [number, number], top: [number, number], left: [number, number]) {
  return Array.from({ length: n }, () => ({
    s: `${rand(size[0], size[1]).toFixed(1)}px`,
    top: `${rand(top[0], top[1]).toFixed(1)}%`,
    left: `${rand(left[0], left[1]).toFixed(1)}%`,
    d: `${rand(4, 8).toFixed(1)}s`,
    delay: `${rand(0, 6).toFixed(1)}s`,
  }))
}

export default function Background() {
  const theme = useStore((s) => s.theme)
  const fxEnabled = useStore((s) => s.fxEnabled)
  const fxIntensity = useStore((s) => s.fxIntensity)

  const gen = useMemo(() => {
    const n = COUNTS[fxIntensity]
    const d = DECOR[fxIntensity]
    return {
      motes: particles(n),
      red: particles(3),
      leaves: leaves(n),
      shoots: spread(d.shoots, [150, 150], [6, 30], [4, 32]),
      blooms: spread(d.blooms, [12, 12], [20, 70], [18, 78]),
      pulses: spread(d.pulses, [7, 14], [10, 78], [10, 88]),
      ripples: spread(d.ripples, [42, 70], [80, 88], [4, 92]),
    }
  }, [fxIntensity])

  if (!fxEnabled) return null

  return (
    <div className="fx-layer" data-fx={fxIntensity} aria-hidden="true">
      {theme === 'xianqi' && (
        <>
          {gen.motes.map((p, i) => (
            <span key={i} className="fx-p fx-mote fx-rise" style={pStyle(p)} />
          ))}
          {gen.shoots.map((s, i) => (
            <span
              key={i}
              className="fx-shoot"
              style={{ top: s.top, left: s.left, ...v('--d', `${rand(6, 10).toFixed(1)}s`), ...v('--delay', `${rand(0, 6).toFixed(1)}s`) }}
            />
          ))}
          <span className="fx-band" />
        </>
      )}

      {theme === 'shuimo' && (
        <>
          {gen.motes.map((p, i) => (
            <span key={i} className="fx-p fx-mote fx-rise" style={pStyle(p)} />
          ))}
          {gen.red.map((p, i) => (
            <span key={i} className="fx-p fx-mote fx-red fx-rise" style={pStyle(p)} />
          ))}
          {gen.blooms.map((s, i) => (
            <span
              key={i}
              className="fx-bloom"
              style={{ top: s.top, left: s.left, ...v('--d', `${rand(8, 13).toFixed(1)}s`), ...v('--delay', `${rand(0, 8).toFixed(1)}s`) }}
            />
          ))}
          <svg className="fx-mountain" viewBox="0 0 1200 220" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 220 L0 168 L150 92 L290 150 L430 62 L580 158 L720 104 L880 176 L1030 88 L1200 170 L1200 220 Z" fill="#5a4a30" />
            <path d="M0 220 L0 186 L220 128 L400 188 L590 112 L760 182 L940 132 L1200 192 L1200 220 Z" fill="#3a3226" />
            <path d="M0 220 L0 200 L280 160 L520 210 L740 150 L980 206 L1200 176 L1200 220 Z" fill="#2b2418" />
          </svg>
          <span className="fx-seal" style={{ right: '9%', bottom: '15%', ...v('--d', `${rand(13, 18).toFixed(1)}s`), ...v('--delay', '2s') }}>
            关<br />系<br />树
          </span>
        </>
      )}

      {theme === 'liujin' && (
        <>
          {gen.motes.map((p, i) => (
            <span key={i} className="fx-p fx-ember fx-rise" style={pStyle(p)} />
          ))}
          <span className="fx-sheen" style={{ left: '-20%', ...v('--d', `${rand(7, 11).toFixed(1)}s`), ...v('--delay', `${rand(0, 4).toFixed(1)}s`) }} />
          {gen.pulses.map((s, i) => (
            <span
              key={i}
              className="fx-pulse"
              style={{ top: s.top, left: s.left, ...v('--s', s.s), ...v('--d', `${rand(3.5, 6).toFixed(1)}s`), ...v('--delay', s.delay) }}
            />
          ))}
        </>
      )}

      {theme === 'qinglv' && (
        <>
          {gen.leaves.map((p, i) => (
            <span key={i} className="fx-leaf" style={pStyle(p)} />
          ))}
          {gen.motes.map((p, i) => (
            <span key={i} className="fx-p fx-firefly fx-wander" style={pStyle(p)} />
          ))}
          {gen.ripples.map((s, i) => (
            <span
              key={i}
              className="fx-ripple"
              style={{ left: s.left, ...v('--s', s.s), ...v('--d', `${rand(5, 8).toFixed(1)}s`), ...v('--delay', s.delay) }}
            />
          ))}
        </>
      )}
    </div>
  )
}
