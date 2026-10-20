// 通用 SVG 图表：五维雷达图 + 环形评分。纯 SVG + framer-motion，无外部依赖。

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

export interface RadarDatum {
  label: string
  value: number // 0 ~ 100
}

interface RadarChartProps {
  data: RadarDatum[]
  size?: number
  color?: string
  fill?: string
}

/** 多边形雷达图：每个顶点一个维度，值越靠外越强。 */
export function RadarChart({
  data,
  size = 260,
  color = 'var(--color-gold-soft)',
  fill = 'rgba(224, 197, 143, 0.16)',
}: RadarChartProps) {
  const n = data.length
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 38
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n
  const pt = (i: number, radius: number): [number, number] => [
    cx + radius * Math.cos(angle(i)),
    cy + radius * Math.sin(angle(i)),
  ]
  const ring = (k: number) => data.map((_, i) => pt(i, r * k).map((v) => v.toFixed(1)).join(',')).join(' ')
  const poly = data.map((d, i) => pt(i, (r * d.value) / 100).map((v) => v.toFixed(1)).join(',')).join(' ')

  return (
    <svg width="100%" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={data.map((d) => d.label).join(' ')}>
      {[0.25, 0.5, 0.75, 1].map((k) => (
        <polygon
          key={k}
          points={ring(k)}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={k === 1 ? 1 : 0.5}
          opacity={k === 1 ? 0.6 : 0.35}
        />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, r)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--color-line)" strokeWidth={0.5} opacity={0.35} />
      })}
      <motion.polygon
        points={poly}
        fill={fill}
        stroke={color}
        strokeWidth={1.6}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />
      {data.map((d, i) => {
        const [x, y] = pt(i, (r * d.value) / 100)
        return <circle key={i} cx={x} cy={y} r={3} fill={color} />
      })}
      {data.map((d, i) => {
        const [x, y] = pt(i, r + 18)
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fill="var(--color-text-dim)"
          >
            {d.label}
          </text>
        )
      })}
    </svg>
  )
}

interface RingScoreProps {
  value: number // 0 ~ 100
  size?: number
  stroke?: number
  color?: string
  track?: string
  children?: ReactNode
}

/** 环形评分：一圈从 0 动画到分值，中间放自定义内容（分数等）。 */
export function RingScore({
  value,
  size = 150,
  stroke = 11,
  color = 'var(--color-gold-soft)',
  track = 'var(--color-card)',
  children,
}: RingScoreProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value / 100) }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>{children}</div>
    </div>
  )
}
