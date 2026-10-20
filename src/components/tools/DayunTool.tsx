// 大运流年：由八字月柱推大运（十年一步），标出当前大运与近 10 个流年。
// 趋势图 + 每步白话点评，只说人话、不堆术语，结果仅供娱乐参考。

import { useMemo, useState } from 'react'
import { useStore, selectSelf } from '../../core/storage/store'
import PersonSelect from '../person/PersonSelect'
import { computeDaYun, type DaYunInput, type DaYunReport, type LuckLevel } from '../../core/dayun/dayun'
import { computeBaZi } from '../../core/rules/bazi'
import { ZODIAC_ANIMALS } from '../../core/rules/zodiac'

const LEVEL_COLOR: Record<LuckLevel, string> = {
  吉: 'var(--color-ok)',
  平: 'var(--color-text-dim)',
  凶: 'var(--color-danger)',
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** 人生运势趋势图：8 步大运的吉凶分折线，当前大运高亮 */
function TrendChart({ report }: { report: DaYunReport }) {
  const steps = report.daYun
  const w = 360
  const h = 164
  const padL = 26
  const padR = 12
  const padT = 16
  const padB = 26
  const innerW = w - padL - padR
  const innerH = h - padT - padB
  const min = 20
  const max = 95

  const pts = steps.map((s, i) => {
    const x = padL + (innerW * (i + 0.5)) / steps.length
    const y = padT + innerH - ((s.score - min) / (max - min)) * innerH
    return { x, y, s }
  })
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${(padT + innerH).toFixed(1)} L${pts[0].x.toFixed(1)},${(padT + innerH).toFixed(1)} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="大运运势趋势图">
      <defs>
        <linearGradient id="dayun-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* 中线（60 分基准） */}
      <line
        x1={padL}
        x2={padL + innerW}
        y1={padT + innerH / 2}
        y2={padT + innerH / 2}
        stroke="var(--color-line)"
        strokeWidth="1"
        strokeDasharray="3 4"
      />

      <path d={area} fill="url(#dayun-grad)" />
      <path d={line} fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {pts.map((p, i) => {
        const isCur = i === report.currentIndex
        return (
          <g key={i}>
            {isCur && (
              <circle cx={p.x} cy={p.y} r="7" fill="var(--color-accent)" opacity="0.22" />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={isCur ? 4.5 : 3}
              fill={isCur ? 'var(--color-accent)' : LEVEL_COLOR[p.s.level]}
              stroke={isCur ? '#fff' : 'transparent'}
              strokeWidth="1"
            />
            <text
              x={p.x}
              y={h - 8}
              textAnchor="middle"
              fontSize="9"
              fill={isCur ? 'var(--color-accent)' : 'var(--color-text-dim)'}
            >
              {Math.round(p.s.startAge)}岁
            </text>
          </g>
        )
      })}

      <text x={padL} y={padT - 5} fontSize="9" fill="var(--color-text-dim)">
        运势分
      </text>
      <text x={padL + innerW} y={padT + innerH / 2} fontSize="9" fill="var(--color-text-dim)" textAnchor="end">
        中
      </text>
    </svg>
  )
}

function LevelBadge({ level }: { level: LuckLevel }) {
  return (
    <span
      className="inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-none"
      style={{ color: LEVEL_COLOR[level], borderColor: LEVEL_COLOR[level] }}
    >
      {level}
    </span>
  )
}

export default function DayunTool() {
  const persons = useStore((s) => s.persons)
  const self = useStore(selectSelf)
  const [personId, setPersonId] = useState<string | null>(() => self?.id ?? null)
  const [date, setDate] = useState(() =>
    self ? `${self.birthYear}-${pad(self.birthMonth)}-${pad(self.birthDay)}` : '2000-06-15',
  )
  const [gender, setGender] = useState<'male' | 'female'>(self?.gender ?? 'male')
  const [hour, setHour] = useState<string>(self?.hour != null ? String(self.hour) : '')
  const [minute, setMinute] = useState<string>(self?.minute != null ? String(self.minute) : '')

  const person = personId ? (persons.find((p) => p.id === personId) ?? null) : null

  const input: DaYunInput | null = useMemo(() => {
    if (person) {
      return {
        year: person.birthYear,
        month: person.birthMonth,
        day: person.birthDay,
        hour: person.hour,
        minute: person.minute,
        gender: person.gender,
      }
    }
    const [y, m, d] = date.split('-').map(Number)
    if (!y || !m || !d) return null
    return {
      year: y,
      month: m,
      day: d,
      hour: hour === '' ? undefined : Number(hour),
      minute: minute === '' ? undefined : Number(minute),
      gender,
    }
  }, [person, date, hour, minute, gender])

  const report = useMemo(() => (input ? computeDaYun(input) : null), [input])
  const bazi = useMemo(() => (input ? computeBaZi(input) : null), [input])

  const name = person ? person.name : '手动排盘'

  return (
    <div className="space-y-3">
      <header className="text-center">
        <h1 className="font-kai text-gold-glow">大运流年</h1>
        <div className="mt-1 text-xs" style={{ color: 'var(--color-text-dim)' }}>
          十 年 一 步 · 看 当 前 与 未 来 运 势
        </div>
      </header>

      {/* 命主选择（从档案，含「我」）+ 手动兜底 */}
      <div className="glass-panel space-y-2.5 p-4">
        <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
          命主（从档案选择，含「我」；也可手动输入）
        </span>
        <PersonSelect value={person} onChange={(p) => setPersonId(p?.id ?? null)} />

        {!person && (
          <>
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

            <div className="flex gap-2">
              <div className="flex-1">
                <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
                  性别
                </span>
                <div className="flex gap-2">
                  {(
                    [
                      { k: 'male', label: '男' },
                      { k: 'female', label: '女' },
                    ] as const
                  ).map((g) => (
                    <button
                      key={g.k}
                      onClick={() => setGender(g.k)}
                      className="tap-target flex-1 rounded-xl border py-2 text-sm transition"
                      style={{
                        borderColor: gender === g.k ? 'var(--color-accent)' : 'var(--color-border)',
                        color: gender === g.k ? 'var(--color-accent)' : 'var(--color-text)',
                        background: gender === g.k ? 'var(--color-card)' : 'transparent',
                      }}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
                  时辰（可选）
                </span>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={23}
                    placeholder="时"
                    value={hour}
                    onChange={(e) => setHour(e.target.value)}
                    className="w-full rounded-xl border bg-transparent px-2 py-2 text-center text-sm outline-none"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                  <input
                    type="number"
                    min={0}
                    max={59}
                    placeholder="分"
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                    className="w-full rounded-xl border bg-transparent px-2 py-2 text-center text-sm outline-none"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {report && bazi && (
        <>
          {/* 命局概览 */}
          <div className="glass-panel p-4">
            <div className="flex items-baseline justify-between">
              <span className="font-kai text-lg font-bold text-gold-glow">{name}</span>
              <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                属{ZODIAC_ANIMALS[bazi.zodiac]} · {report.direction}排
              </span>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              {[
                { label: '年柱', v: bazi.yearPillar.name },
                { label: '月柱', v: bazi.monthPillar.name },
                { label: '日柱', v: bazi.dayPillar.name },
                { label: '时柱', v: bazi.hourPillar?.name ?? '—' },
              ].map((p) => (
                <div key={p.label} className="glass-cell rounded-lg py-2">
                  <div className="text-[10px]" style={{ color: 'var(--color-dim)' }}>
                    {p.label}
                  </div>
                  <div className="mt-0.5 font-kai text-base font-bold text-gold-glow">{p.v}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-sm">
              <span style={{ color: 'var(--color-text-dim)' }}>起运</span>
              <span className="font-kai font-bold" style={{ color: 'var(--color-gold)' }}>
                {report.startAgeText}
              </span>
              <span style={{ color: 'var(--color-text-dim)' }}>（出生到最近节气 ÷ 3）</span>
            </div>
          </div>

          {/* 运势总评 */}
          <div className="glass-panel p-4">
            <div className="mb-2 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 运势总评</div>
            <div className="space-y-2 text-sm leading-relaxed">
              <p style={{ color: 'var(--color-text)' }}>
                当前正行「{report.daYun[report.currentIndex].name}」大运
                <LevelBadge level={report.daYun[report.currentIndex].level} />
                ：{report.daYun[report.currentIndex].text}
              </p>
              <p style={{ color: 'var(--color-text)' }}>
                {(() => {
                  const l = report.liuNian.find((x) => x.isCurrent)
                  return l ? `本年流年「${l.name}」：${l.text}` : '本年流年平稳。'
                })()}
              </p>
              <p style={{ color: 'var(--color-text-dim)' }}>
                {(() => {
                  const a = report.daYun[0].score
                  const b = report.daYun[report.daYun.length - 1].score
                  const trend = b - a
                  return trend > 8
                    ? '整体走势后劲上扬，越走越顺，宜早布局、稳中求进。'
                    : trend < -8
                      ? '早年较顺、后期需更稳，注意守成与健康。'
                      : '一生运势起伏较均衡，靠后天努力与选择拉开差距。'
                })()}
              </p>
            </div>
          </div>

          {/* 趋势图 */}
          <div className="glass-panel p-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>
                ✦ 人生运势趋势
              </span>
              <span className="text-[11px]" style={{ color: 'var(--color-text-dim)' }}>
                高亮点 = 当前大运
              </span>
            </div>
            <TrendChart report={report} />
          </div>

          {/* 大运列表 */}
          <div className="space-y-2">
            <div className="font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>
              ✦ 大运（十年一步）
            </div>
            {report.daYun.map((s, i) => {
              const isCur = i === report.currentIndex
              return (
                <div
                  key={i}
                  className="glass-panel p-3"
                  style={isCur ? { borderColor: 'var(--color-accent)', boxShadow: '0 0 0 1px var(--color-accent)' } : undefined}
                >
                  <div className="flex items-center gap-2">
                    {isCur && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: 'var(--color-accent)', color: '#0b1020' }}
                      >
                        当前
                      </span>
                    )}
                    <span className="font-kai text-base font-bold text-gold-glow">{s.name}</span>
                    <span className="text-xs" style={{ color: 'var(--color-dim)' }}>
                      {Math.round(s.startAge)}~{Math.round(s.endAge)}岁
                    </span>
                    <span className="flex-1" />
                    <LevelBadge level={s.level} />
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--color-line)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${s.score}%`, background: LEVEL_COLOR[s.level] }}
                    />
                  </div>
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
                    {s.text}
                  </p>
                </div>
              )
            })}
          </div>

          {/* 流年列表 */}
          <div className="space-y-2">
            <div className="font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>
              ✦ 近 10 个流年
            </div>
            <div className="grid grid-cols-2 gap-2">
              {report.liuNian.map((l) => (
                <div
                  key={l.year}
                  className="glass-cell rounded-lg p-2.5"
                  style={l.isCurrent ? { borderColor: 'var(--color-accent)' } : undefined}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="font-kai text-sm font-bold"
                      style={{ color: l.isCurrent ? 'var(--color-accent)' : 'var(--color-gold)' }}
                    >
                      {l.year}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--color-dim)' }}>
                      {l.name}
                    </span>
                    {l.isBenMing && (
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[9px]"
                        style={{ background: 'var(--color-accent)', color: '#0b1020' }}
                      >
                        本命
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] leading-snug" style={{ color: 'var(--color-text-dim)' }}>
                    {l.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
            排盘依据传统八字规则，点评为娱乐参考，不构成人生建议。
          </p>
        </>
      )}
    </div>
  )
}
