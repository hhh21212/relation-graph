// 星座：太阳/月亮/上升星座 + 12 星座性格图鉴 + 星座配对 + 每日/每周运势（娱乐向）。

import { useMemo, useState } from 'react'
import { useStore, selectSelf } from '../../core/storage/store'
import PersonSelect from '../person/PersonSelect'
import { SIGNS, signOf, moonSignByDate, risingSignByPlace, compatibility, pairAnalysis, pairDimensions, PLANETS, planetSignByDate, type Sign, type CompatResult } from '../../core/xingzuo/data'
import { dailyFortune, weeklyFortune, monthlyFortune, yearlyFortune, type FortuneItem } from '../../core/xingzuo/fortune'
import { placementsOf, synastry, synastryAspects, synastrySummary, synastryExtras } from '../../core/xingzuo/synastry'
import { chartLongitudes, computeAspects, BODIES } from '../../core/xingzuo/aspects'
import { housePlacements, HOUSES } from '../../core/xingzuo/houses'
import { elementDistribution, elementReading } from '../../core/xingzuo/elements'
import { trioReading } from '../../core/xingzuo/trio'
import { detectAspectPatterns } from '../../core/xingzuo/patterns'
import { retrogradeInfo } from '../../core/xingzuo/retrograde'
import { chartReport } from '../../core/xingzuo/report'
import { modeDistribution, modeReading } from '../../core/xingzuo/modes'
import { moonPhase } from '../../core/xingzuo/moonphase'
import { MOON_SIGNS } from '../../core/xingzuo/moonsigns'
import { RISING_SIGNS } from '../../core/xingzuo/rising'
import { PLACES, DEFAULT_PLACE, resolvePlace, tzOfPlace, tzLabel } from '../../core/xingzuo/places'

const MOON_PHASE_GLYPH: Record<string, string> = {
  新月: '🌑', 蛾眉月: '🌒', 上弦月: '🌓', 盈凸月: '🌔', 满月: '🌕', 亏凸月: '🌖', 下弦月: '🌗', 残月: '🌘',
}

type Mode = 'chart' | 'pair' | 'matrix' | 'fortune' | 'gallery' | 'synastry'

const MODES: { key: Mode; label: string }[] = [
  { key: 'chart', label: '我的星盘' },
  { key: 'synastry', label: '两人合盘' },
  { key: 'pair', label: '星座配对' },
  { key: 'matrix', label: '配对矩阵' },
  { key: 'fortune', label: '运势' },
  { key: 'gallery', label: '性格图鉴' },
]

const LEVEL_COLOR: Record<string, string> = {
  绝配: 'var(--color-ok)',
  很配: 'var(--color-ok)',
  一般: 'var(--color-text-dim)',
  需磨合: 'var(--color-danger)',
}

const ELEMENT_COLOR: Record<string, string> = {
  火: 'var(--color-danger)',
  土: 'var(--color-gold)',
  风: 'var(--color-jade)',
  水: 'var(--color-accent)',
}

export default function XingZuoTool() {
  const [mode, setMode] = useState<Mode>('chart')

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className="flex-1 rounded-full px-2 py-1.5 text-xs font-semibold transition"
            style={
              mode === m.key
                ? { background: 'var(--color-gold)', color: '#1a1408' }
                : {
                    background: 'transparent',
                    color: 'var(--color-text-dim)',
                    border: '1px solid var(--color-border)',
                  }
            }
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'chart' && <ChartView />}
      {mode === 'synastry' && <SynastryView />}
      {mode === 'pair' && <PairView />}
      {mode === 'matrix' && <MatrixView />}
      {mode === 'fortune' && <FortuneView />}
      {mode === 'gallery' && <GalleryView />}
    </div>
  )
}

function ChartView() {
  const persons = useStore((s) => s.persons)
  const self = useStore(selectSelf)
  const [personId, setPersonId] = useState<string | null>(() => self?.id ?? null)
  const [year, setYear] = useState(2000)
  const [month, setMonth] = useState(6)
  const [day, setDay] = useState(15)
  const [hour, setHour] = useState<number | ''>('')
  const [birthPlace, setBirthPlace] = useState('')

  const person = personId ? (persons.find((p) => p.id === personId) ?? null) : null

  // 命主来自档案时用档案生日/时辰/出生地；手动时用手填。
  const y = person ? person.birthYear : year
  const m = person ? person.birthMonth : month
  const d = person ? person.birthDay : day
  const h = person ? (person.hour != null ? person.hour : '') : hour

  // 出生地：档案有则用档案，否则用手填；换算成地点（地名→经纬度），匹配不到退回默认北京。
  const placeName = person ? (person.birthPlace ?? '') : birthPlace
  const place = useMemo(() => resolvePlace(placeName) ?? DEFAULT_PLACE, [placeName])

  const result = useMemo(() => {
    if (!(y > 0 && m >= 1 && m <= 12 && d >= 1 && d <= 31)) return null
    const sun = signOf(m, d)
    const hr = h === '' ? 0 : h
    const tz = tzOfPlace(place)
    const moon = moonSignByDate(y, m, d, hr)
    const rising = h === '' ? sun : risingSignByPlace(place.lat, place.lng, tz, y, m, d, hr)
    const planets = PLANETS.map((p) => ({ ...p, sign: planetSignByDate(p.key, y, m, d, hr) }))
    const lons = chartLongitudes({ year: y, month: m, day: d, hour: h === '' ? undefined : h, lat: place.lat, lng: place.lng, tz })
    const aspects = computeAspects(lons)
    const houses = housePlacements(lons, lons.asc ?? lons.sun)
    const elements = elementDistribution(lons)
    const elementText = elementReading(elements)
    const trio = trioReading(sun, moon, rising)
    const patterns = detectAspectPatterns(lons)
    const retrograde = retrogradeInfo(y, m, d, hr)
    const report = chartReport({ year: y, month: m, day: d, hour: h === '' ? undefined : h, lat: place.lat, lng: place.lng, tz })
    const modes = modeDistribution(lons)
    const modeText = modeReading(modes)
    const phase = moonPhase(y, m, d, hr)
    return { sun, moon, rising, planets, aspects, houses, elements, elementText, trio, patterns, retrograde, report, modes, modeText, phase }
  }, [y, m, d, h, place])

  const inputCls = 'w-full rounded-xl border bg-transparent px-3 py-2.5 text-center text-sm outline-none'
  const inputStyle = { borderColor: 'var(--color-border)', color: 'var(--color-text)' }

  return (
    <>
      <div className="glass-panel p-4">
        <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
          命主（从档案选择，含「我」；也可手动输入）
        </span>
        <PersonSelect value={person} onChange={(p) => setPersonId(p?.id ?? null)} />

        {!person && (
          <div className="mt-2 grid grid-cols-4 gap-2">
            <input type="number" value={year || ''} onChange={(e) => setYear(Number(e.target.value))} placeholder="年" className={inputCls} style={inputStyle} />
            <input type="number" value={month || ''} onChange={(e) => setMonth(Number(e.target.value))} placeholder="月" className={inputCls} style={inputStyle} />
            <input type="number" value={day || ''} onChange={(e) => setDay(Number(e.target.value))} placeholder="日" className={inputCls} style={inputStyle} />
            <input type="number" value={hour} onChange={(e) => setHour(e.target.value === '' ? '' : Number(e.target.value))} placeholder="时" className={inputCls} style={inputStyle} />
          </div>
        )}

        <div className="mt-2">
          <label className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
            {person ? '出生地（来自档案）' : '出生地（用于上升星座）'}
          </label>
          {person ? (
            <div className="rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
              {place.name} · {tzLabel(tzOfPlace(place))}
            </div>
          ) : (
            <>
              <input
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="如：北京 / 上海 / 纽约"
                list="xz-place-options"
                className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
              />
              <datalist id="xz-place-options">
                {PLACES.map((p) => (
                  <option key={p.name} value={p.name} />
                ))}
              </datalist>
              <div className="mt-1 text-[11px]" style={{ color: 'var(--color-text-dim)' }}>
                已换算：{place.name} · {tzLabel(tzOfPlace(place))}
              </div>
            </>
          )}
        </div>
      </div>

      {result && (
        <div className="space-y-2">
          <div className="glass-panel p-4">
            <div className="mb-2 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 个人星盘综合报告</div>
            <div className="font-kai text-base font-bold text-gold-glow">{result.report.title}</div>
            <div className="mt-2 space-y-2">
              {result.report.paragraphs.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{p}</p>
              ))}
            </div>
          </div>

          <StarCard label="太阳星座" sub="本我 · 核心性格" sign={SIGNS[result.sun]} />
          <StarCard label="月亮星座" sub="内心 · 情感需求" sign={SIGNS[result.moon]} />
          <StarCard label="上升星座" sub="给人的第一印象" sign={SIGNS[result.rising]} />

          <div className="glass-panel p-4">
            <div className="mb-2 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 上升星座详解</div>
            <div className="font-kai text-base font-bold text-gold-glow">{RISING_SIGNS[result.rising].name}上升</div>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{RISING_SIGNS[result.rising].text}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {RISING_SIGNS[result.rising].keywords.map((k) => (
                <span key={k} className="rounded-full border px-2 py-0.5 text-[11px]" style={{ color: 'var(--color-text-dim)', borderColor: 'var(--color-border)' }}>{k}</span>
              ))}
            </div>
          </div>

          <div className="glass-panel p-4">
            <div className="mb-2 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 日月升三件套</div>
            <div className="font-kai text-sm font-bold text-gold-glow">{result.trio.heading}</div>
            <div className="mt-2 space-y-2 text-sm leading-relaxed">
              <div>
                <span className="mr-1 rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--color-gold)', color: '#1a1408' }}>太阳·自我</span>
                <span style={{ color: 'var(--color-text)' }}>{result.trio.sun}</span>
              </div>
              <div>
                <span className="mr-1 rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--color-jade)', color: '#1a1408' }}>月亮·内心</span>
                <span style={{ color: 'var(--color-text)' }}>{result.trio.moon}</span>
              </div>
              <div>
                <span className="mr-1 rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--color-accent)', color: '#1a1408' }}>上升·外表</span>
                <span style={{ color: 'var(--color-text)' }}>{result.trio.rising}</span>
              </div>
            </div>
            <p className="mt-2 rounded-xl border p-2.5 text-[13px] leading-relaxed" style={{ color: 'var(--color-text-dim)', borderColor: 'var(--color-border)' }}>
              {result.trio.synthesis}
            </p>
          </div>

          <div className="glass-panel p-4">
            <div className="mb-1 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 出生月相</div>
            <div className="flex items-center gap-3">
              <div className="text-4xl leading-none" style={{ color: 'var(--color-gold)' }}>{MOON_PHASE_GLYPH[result.phase.name]}</div>
              <div>
                <div className="font-kai text-base font-bold text-gold-glow">{result.phase.name}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>月相对太阳黄经角 · {result.phase.angle.toFixed(1)}°</div>
              </div>
            </div>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{result.phase.text}</p>
          </div>

          <div className="glass-panel p-4">
            <div className="mb-3 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 行星落座</div>
            <div className="space-y-2.5">
              {result.planets.map((p) => (
                <div key={p.key} className="flex items-center gap-3">
                  <span className="text-xl leading-none" style={{ color: 'var(--color-gold)' }}>{p.symbol}</span>
                  <div className="w-12 shrink-0 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{p.name}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-kai text-sm font-bold" style={{ color: 'var(--color-text)' }}>{SIGNS[p.sign].name} {SIGNS[p.sign].symbol}</div>
                    <div className="text-[11px]" style={{ color: 'var(--color-text-dim)' }}>{p.meaning}</div>
                  </div>
                  <span className="shrink-0 text-[11px]" style={{ color: 'var(--color-text-dim)' }}>{SIGNS[p.sign].element}象</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-4">
            <div className="mb-3 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 行星相位</div>
            {result.aspects.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>当前容许度下无主要相位。</p>
            ) : (
              <div className="space-y-2">
                {result.aspects.map((x, i) => {
                  const color = x.aspect.nature === '吉' ? 'var(--color-ok)' : x.aspect.nature === '凶' ? 'var(--color-danger)' : 'var(--color-jade)'
                  return (
                    <div key={i} className="flex items-start gap-2">
                      <span className="shrink-0 rounded-full border px-1.5 py-0.5 text-[11px] font-semibold" style={{ color, borderColor: color }}>
                        {x.aspect.symbol} {x.aspect.name}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm" style={{ color: 'var(--color-text)' }}>
                          {BODIES[x.a]} × {BODIES[x.b]} <span className="text-[11px]" style={{ color: 'var(--color-text-dim)' }}>· 偏差 {x.orb.toFixed(1)}°</span>
                        </div>
                        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>{x.aspect.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="glass-panel p-4">
            <div className="mb-3 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 相位格局</div>
            {result.patterns.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>未识别出大三角 / T三角 / 大十字 / 风筝 / 星群等特殊格局。</p>
            ) : (
              <div className="space-y-2">
                {result.patterns.map((p, i) => (
                  <div key={i} className="rounded-xl border p-2.5" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-kai text-sm font-bold" style={{ color: 'var(--color-gold)' }}>{p.name}</span>
                      <span className="text-[11px]" style={{ color: 'var(--color-text-dim)' }}>{p.bodies.map((b) => BODIES[b]).join('、')}</span>
                    </div>
                    <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: 'var(--color-text)' }}>{p.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel p-4">
            <div className="mb-1 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 十二宫位（等宫制）</div>
            <p className="mb-3 text-xs" style={{ color: 'var(--color-text-dim)' }}>
              以上升点为第 1 宫宫头、每宫 30°；未填时辰时以太阳为第 1 宫近似落宫。
            </p>
            <div className="space-y-2">
              {HOUSES.map((h) => {
                const bodies = result.houses.filter((x) => x.house === h.index).map((x) => BODIES[x.key])
                return (
                  <div key={h.index} className="flex items-start gap-2">
                    <span className="shrink-0 rounded border px-1.5 py-0.5 text-[11px] font-semibold" style={{ color: 'var(--color-gold)', borderColor: 'var(--color-border)' }}>
                      {h.index}宫
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                        {h.name}
                        {bodies.length > 0 && (
                          <span className="ml-1 font-normal" style={{ color: 'var(--color-gold)' }}>· {bodies.join('、')}</span>
                        )}
                      </div>
                      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>{h.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="glass-panel p-4">
            <div className="mb-1 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 四元素占比</div>
            <p className="mb-3 text-xs" style={{ color: 'var(--color-text-dim)' }}>
              全盘日月与行星落座的火土风水分布（含上升点）。
            </p>
            <div className="space-y-2">
              {result.elements.map((e) => (
                <div key={e.element}>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--color-text)' }}>{e.element}象</span>
                    <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{e.count} 颗 · {e.pct}%</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full" style={{ background: 'var(--color-border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${e.pct}%`, background: ELEMENT_COLOR[e.element] }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{result.elementText}</p>
          </div>

          <div className="glass-panel p-4">
            <div className="mb-1 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 星盘模式占比</div>
            <p className="mb-3 text-xs" style={{ color: 'var(--color-text-dim)' }}>本位（开创）/ 固定 / 变动 三态分布。</p>
            <div className="space-y-2">
              {result.modes.map((m) => (
                <div key={m.mode}>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--color-text)' }}>{m.mode}</span>
                    <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{m.count} 颗 · {m.pct}%</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full" style={{ background: 'var(--color-border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: 'var(--color-gold)' }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{result.modeText}</p>
          </div>

          <div className="glass-panel p-4">
            <div className="mb-3 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 行星逆行提示</div>
            <div className="space-y-2">
              {result.retrograde.map((r) => (
                <div key={r.key} className="flex items-start gap-2">
                  <span
                    className="shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                    style={{ color: r.retrograde ? 'var(--color-danger)' : 'var(--color-ok)', borderColor: r.retrograde ? 'var(--color-danger)' : 'var(--color-ok)' }}
                  >
                    {r.name}·{r.retrograde ? '逆' : '顺'}
                  </span>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>{r.text}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
            太阳星座按生日；月亮/上升/行星按出生日期·时辰·出生地用天文黄经计算，娱乐参考。
          </p>
        </div>
      )}
    </>
  )
}

function StarCard({ label, sub, sign }: { label: string; sub: string; sign: Sign }) {
  return (
    <div className="glass-panel p-4">
      <div className="flex items-center gap-3">
        <div className="text-4xl leading-none" style={{ color: 'var(--color-gold)' }}>
          {sign.symbol}
        </div>
        <div className="min-w-0">
          <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
            {label} · {sub}
          </div>
          <div className="font-kai text-lg font-bold text-gold-glow">{sign.name}</div>
        </div>
        <div className="ml-auto shrink-0 text-right">
          <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
            {sign.element}象 · {sign.ruler}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
        {sign.desc}
      </p>
    </div>
  )
}

interface PersonFormState {
  year: number
  month: number
  day: number
  hour: number | ''
  birthPlace: string
}

function PersonForm({ value, onChange, tag }: { value: PersonFormState; onChange: (v: PersonFormState) => void; tag: string }) {
  const inputCls = 'w-full rounded-xl border bg-transparent px-3 py-2.5 text-center text-sm outline-none'
  const inputStyle = { borderColor: 'var(--color-border)', color: 'var(--color-text)' }
  const set = (k: keyof PersonFormState, v: string | number) => onChange({ ...value, [k]: v } as PersonFormState)
  return (
    <div className="glass-panel p-3">
      <div className="mb-1.5 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>{tag}</div>
      <div className="grid grid-cols-4 gap-2">
        <input type="number" value={value.year || ''} onChange={(e) => set('year', Number(e.target.value))} placeholder="年" className={inputCls} style={inputStyle} />
        <input type="number" value={value.month || ''} onChange={(e) => set('month', Number(e.target.value))} placeholder="月" className={inputCls} style={inputStyle} />
        <input type="number" value={value.day || ''} onChange={(e) => set('day', Number(e.target.value))} placeholder="日" className={inputCls} style={inputStyle} />
        <input type="number" value={value.hour} onChange={(e) => set('hour', e.target.value === '' ? '' : Number(e.target.value))} placeholder="时" className={inputCls} style={inputStyle} />
      </div>
      <div className="mt-2">
        <label className="mb-1 block text-[11px]" style={{ color: 'var(--color-text-dim)' }}>出生地（时辰与出生地可选）</label>
        <input
          value={value.birthPlace}
          onChange={(e) => set('birthPlace', e.target.value)}
          placeholder="如：北京 / 上海"
          list="xz-place-options"
          className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none"
          style={inputStyle}
        />
        <datalist id="xz-place-options">
          {PLACES.map((p) => (
            <option key={p.name} value={p.name} />
          ))}
        </datalist>
      </div>
    </div>
  )
}

function SynastryView() {
  const persons = useStore((s) => s.persons)
  const [aId, setAId] = useState<string | null>(null)
  const [bId, setBId] = useState<string | null>(null)
  const [a, setA] = useState<PersonFormState>({ year: 1995, month: 6, day: 15, hour: '', birthPlace: '' })
  const [b, setB] = useState<PersonFormState>({ year: 1996, month: 1, day: 20, hour: '', birthPlace: '' })

  const paPerson = aId ? (persons.find((p) => p.id === aId) ?? null) : null
  const pbPerson = bId ? (persons.find((p) => p.id === bId) ?? null) : null

  const toState = (p: NonNullable<typeof paPerson>): PersonFormState => ({
    year: p.birthYear,
    month: p.birthMonth,
    day: p.birthDay,
    hour: p.hour != null ? p.hour : '',
    birthPlace: p.birthPlace ?? '',
  })
  const aState = paPerson ? toState(paPerson) : a
  const bState = pbPerson ? toState(pbPerson) : b

  const calc = useMemo(() => {
    const mkBirth = (x: PersonFormState) => {
      const place = resolvePlace(x.birthPlace) ?? DEFAULT_PLACE
      return {
        year: x.year,
        month: x.month,
        day: x.day,
        hour: x.hour === '' ? undefined : x.hour,
        lat: place.lat,
        lng: place.lng,
        tz: tzOfPlace(place),
      }
    }
    const mk = (x: PersonFormState) => {
      if (!(x.year > 0 && x.month >= 1 && x.month <= 12 && x.day >= 1 && x.day <= 31)) return null
      return placementsOf(mkBirth(x))
    }
    const pa = mk(aState)
    const pb = mk(bState)
    const cross = pa && pb ? synastryAspects(mkBirth(aState), mkBirth(bState)) : []
    return { pa, pb, result: pa && pb ? synastry(pa, pb) : null, cross }
  }, [aState, bState])

  const summary = calc.pa && calc.pb ? synastrySummary(calc.pa, calc.pb) : null
  const extras = calc.pa && calc.pb ? synastryExtras(calc.pa, calc.pb) : null

  const scoreColor = (n: number) =>
    n >= 80 ? 'var(--color-ok)' : n >= 60 ? 'var(--color-jade)' : 'var(--color-danger)'

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <PersonSelect value={paPerson} onChange={(p) => setAId(p?.id ?? null)} placeholder="＋ 从档案选人（甲方）" />
          {!paPerson && <PersonForm tag="甲方 · 手填" value={a} onChange={setA} />}
        </div>
        <div className="space-y-2">
          <PersonSelect value={pbPerson} onChange={(p) => setBId(p?.id ?? null)} placeholder="＋ 从档案选人（乙方）" />
          {!pbPerson && <PersonForm tag="乙方 · 手填" value={b} onChange={setB} />}
        </div>
      </div>

      {calc.result && calc.pa && calc.pb && (
        <div className="space-y-2">
          <div className="glass-panel p-4 text-center">
            <div className="flex items-center justify-center gap-4">
              <div className="text-4xl" style={{ color: 'var(--color-gold)' }}>{SIGNS[calc.pa.sun].symbol}</div>
              <div className="text-2xl" style={{ color: 'var(--color-dim)' }}>×</div>
              <div className="text-4xl" style={{ color: 'var(--color-gold)' }}>{SIGNS[calc.pb.sun].symbol}</div>
            </div>
            <div className="mt-1 text-sm" style={{ color: 'var(--color-text-dim)' }}>
              {SIGNS[calc.pa.sun].name} × {SIGNS[calc.pb.sun].name} · 综合合盘
            </div>
            <div className="mt-2 flex items-baseline justify-center gap-1">
              <span className="font-kai text-5xl font-bold text-gold-glow">{calc.result.score}</span>
              <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>分</span>
            </div>
            <div className="mt-2">
              <span
                className="inline-block rounded-full border px-3 py-0.5 text-sm font-semibold"
                style={{ color: LEVEL_COLOR[calc.result.level], borderColor: LEVEL_COLOR[calc.result.level] }}
              >
                {calc.result.level}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{calc.result.summary}</p>
          </div>

          {summary && (
            <div className="glass-panel p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 相处模式总评</span>
                <span className="rounded-full border px-2.5 py-0.5 text-xs font-semibold" style={{ color: 'var(--color-gold)', borderColor: 'var(--color-gold)' }}>{summary.heading}</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{summary.text}</p>
            </div>
          )}

          {extras && (
            <div className="glass-panel p-4">
              <div className="mb-3 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 三星深度解读</div>
              <div className="space-y-3">
                {[extras.moonMoon, extras.venusMars, extras.marsMars].map((x) => (
                  <div key={x.title}>
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--color-text)' }}>{x.title}</span>
                      <span className="font-semibold" style={{ color: scoreColor(x.score) }}>{x.score}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--color-border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${x.score}%`, background: scoreColor(x.score) }} />
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>{x.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-panel p-4">
            <div className="mb-3 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 五大相位契合</div>
            <div className="space-y-3">
              {calc.result.aspects.map((x) => (
                <div key={x.key}>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--color-text)' }}>{x.title}</span>
                    <span className="font-semibold" style={{ color: scoreColor(x.score) }}>{x.score}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--color-border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${x.score}%`, background: scoreColor(x.score) }} />
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>{x.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-4">
            <div className="mb-3 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 合盘相位（跨盘）</div>
            {calc.cross.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
                双方星体在当前容许度下无主要跨盘相位；填写双方出生时辰可加入上升点比对。
              </p>
            ) : (
              <div className="space-y-2.5">
                {calc.cross.map((x, i) => {
                  const color = x.aspect.nature === '吉' ? 'var(--color-ok)' : x.aspect.nature === '凶' ? 'var(--color-danger)' : 'var(--color-jade)'
                  return (
                    <div key={i} className="flex items-start gap-2">
                      <span className="shrink-0 rounded-full border px-1.5 py-0.5 text-[11px] font-semibold" style={{ color, borderColor: color }}>
                        {x.aspect.symbol} {x.aspect.name}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm" style={{ color: 'var(--color-text)' }}>
                          {BODIES[x.a]} × {BODIES[x.b]}{' '}
                          <span className="text-[11px]" style={{ color: 'var(--color-text-dim)' }}>· 偏差 {x.orb.toFixed(1)}°</span>
                        </div>
                        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>{x.text}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
            两人合盘交叉比对日月升金火五颗星，为娱乐向参考，感情更要靠真心经营。
          </p>
        </div>
      )}
    </>
  )
}

function PairView() {
  const persons = useStore((s) => s.persons)
  const [aId, setAId] = useState<string | null>(null)
  const [bId, setBId] = useState<string | null>(null)
  const [a, setA] = useState(0)
  const [b, setB] = useState(6)

  const paPerson = aId ? (persons.find((p) => p.id === aId) ?? null) : null
  const pbPerson = bId ? (persons.find((p) => p.id === bId) ?? null) : null

  const signA = paPerson ? signOf(paPerson.birthMonth, paPerson.birthDay) : a
  const signB = pbPerson ? signOf(pbPerson.birthMonth, pbPerson.birthDay) : b

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <PersonSelect value={paPerson} onChange={(p) => setAId(p?.id ?? null)} placeholder="＋ 从档案选人（甲方）" />
          {!paPerson && <SelectSign value={a} onChange={setA} />}
        </div>
        <div className="space-y-2">
          <PersonSelect value={pbPerson} onChange={(p) => setBId(p?.id ?? null)} placeholder="＋ 从档案选人（乙方）" />
          {!pbPerson && <SelectSign value={b} onChange={setB} />}
        </div>
      </div>
      <PairResultCard a={signA} b={signB} />
    </>
  )
}

function PairResultCard({ a, b, onBack }: { a: number; b: number; onBack?: () => void }) {
  const r = pairAnalysis(a, b)
  const dims = pairDimensions(a, b)
  return (
    <>
      {onBack && (
        <button onClick={onBack} className="liuyao-btn liuyao-btn-ghost w-full px-4 py-2.5">
          ‹ 返回矩阵
        </button>
      )}
      <div className="glass-panel p-4 text-center">
        <div className="flex items-center justify-center gap-4">
          <div className="text-4xl" style={{ color: 'var(--color-gold)' }}>{SIGNS[a].symbol}</div>
          <div className="text-2xl" style={{ color: 'var(--color-dim)' }}>×</div>
          <div className="text-4xl" style={{ color: 'var(--color-gold)' }}>{SIGNS[b].symbol}</div>
        </div>
        <div className="mt-1 text-sm" style={{ color: 'var(--color-text-dim)' }}>{SIGNS[a].name} × {SIGNS[b].name}</div>
        <div className="mt-2 flex items-baseline justify-center gap-1">
          <span className="font-kai text-5xl font-bold text-gold-glow">{r.score}</span>
          <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>分</span>
        </div>
        <div className="mt-2">
          <span
            className="inline-block rounded-full border px-3 py-0.5 text-sm font-semibold"
            style={{ color: LEVEL_COLOR[r.level], borderColor: LEVEL_COLOR[r.level] }}
          >
            {r.level}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{r.text}</p>

        <div className="mt-4 space-y-2.5 text-left text-sm leading-relaxed">
          <div>
            <div className="font-semibold" style={{ color: 'var(--color-ok)' }}>✦ 彼此吸引</div>
            <p className="mt-0.5 text-[13px]" style={{ color: 'var(--color-text)' }}>{r.attraction}</p>
          </div>
          <div>
            <div className="font-semibold" style={{ color: 'var(--color-danger)' }}>✦ 潜在磨合</div>
            <p className="mt-0.5 text-[13px]" style={{ color: 'var(--color-text)' }}>{r.challenge}</p>
          </div>
          <div>
            <div className="font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 相处建议</div>
            <p className="mt-0.5 text-[13px]" style={{ color: 'var(--color-text)' }}>{r.advice}</p>
          </div>
        </div>

        <div className="mt-4 border-t pt-3 text-left" style={{ borderColor: 'var(--color-border)' }}>
          <div className="mb-2 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 多维配对</div>
          <div className="space-y-2.5">
            <DimBar label="爱情" item={dims.love} color="var(--color-ok)" />
            <DimBar label="友情" item={dims.friendship} color="var(--color-jade)" />
            <DimBar label="同事" item={dims.work} color="var(--color-accent)" />
          </div>
        </div>
      </div>

      <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
        星座配对为娱乐向参考，合不合更要看相处。
      </p>
    </>
  )
}

function DimBar({ label, item, color }: { label: string; item: CompatResult; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span style={{ color: 'var(--color-text)' }}>{label}</span>
        <span className="font-semibold" style={{ color }}>{item.score}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--color-border)' }}>
        <div className="h-full rounded-full" style={{ width: `${item.score}%`, background: color }} />
      </div>
      <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>{item.text}</p>
    </div>
  )
}

function MatrixView() {
  const [sel, setSel] = useState<[number, number] | null>(null)

  const scoreColor = (n: number) =>
    n >= 85 ? 'var(--color-ok)' : n >= 72 ? 'var(--color-jade)' : n >= 58 ? 'var(--color-text-dim)' : 'var(--color-danger)'

  if (sel) {
    const [a, b] = sel
    return <PairResultCard a={a} b={b} onBack={() => setSel(null)} />
  }

  return (
    <div className="glass-panel p-3">
      <div className="mb-2 text-center text-xs" style={{ color: 'var(--color-text-dim)' }}>
        12 × 12 配对矩阵 · 点格子看详解
      </div>
      <div className="overflow-x-auto no-scrollbar">
        <div className="min-w-[440px]">
          <div className="grid gap-0.5" style={{ gridTemplateColumns: '22px repeat(12, minmax(0, 1fr))' }}>
            <div />
            {SIGNS.map((s) => (
              <div key={s.key} className="text-center text-sm" style={{ color: 'var(--color-gold)' }}>{s.symbol}</div>
            ))}
          </div>
          {SIGNS.map((a, i) => (
            <div key={a.key} className="mt-0.5 grid gap-0.5" style={{ gridTemplateColumns: '22px repeat(12, minmax(0, 1fr))' }}>
              <div className="text-center text-sm" style={{ color: 'var(--color-gold)' }}>{a.symbol}</div>
              {SIGNS.map((b, j) => {
                const sc = compatibility(i, j).score
                return (
                  <button
                    key={b.key}
                    onClick={() => setSel([i, j])}
                    className="rounded px-0.5 py-1 text-[10px] font-semibold"
                    style={{ background: `${scoreColor(sc)}22`, color: scoreColor(sc) }}
                  >
                    {sc}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-2 text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
        分数越高越合拍，点任意格子查看专属解读。
      </p>
    </div>
  )
}

function SelectSign({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none"
      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
    >
      {SIGNS.map((s, i) => (
        <option key={s.key} value={i} style={{ color: '#1a1408' }}>
          {s.symbol} {s.name}
        </option>
      ))}
    </select>
  )
}

function FortuneView() {
  const persons = useStore((s) => s.persons)
  const self = useStore(selectSelf)
  const [personId, setPersonId] = useState<string | null>(() => self?.id ?? null)
  const [manualSign, setManualSign] = useState(0)
  const [scope, setScope] = useState<'day' | 'week' | 'month' | 'year'>('day')

  const person = personId ? (persons.find((p) => p.id === personId) ?? null) : null
  const signIdx = person ? signOf(person.birthMonth, person.birthDay) : manualSign

  const { today, weekKey, monthKey, yearKey } = useMemo(() => {
    const d = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const today = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    const day = (d.getDay() + 6) % 7 // 周一=0
    const mon = new Date(d)
    mon.setDate(d.getDate() - day)
    const sun = new Date(mon)
    sun.setDate(mon.getDate() + 6)
    const fmt = (x: Date) => `${x.getMonth() + 1}.${x.getDate()}`
    return {
      today,
      weekKey: `${fmt(mon)}–${fmt(sun)}`,
      monthKey: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`,
      yearKey: `${d.getFullYear()}`,
    }
  }, [])

  const f =
    scope === 'day' ? dailyFortune(signIdx, today)
    : scope === 'week' ? weeklyFortune(signIdx, weekKey)
    : scope === 'month' ? monthlyFortune(signIdx, monthKey)
    : yearlyFortune(signIdx, yearKey)

  const SCOPES: { key: 'day' | 'week' | 'month' | 'year'; label: string }[] = [
    { key: 'day', label: '今日' },
    { key: 'week', label: '本周' },
    { key: 'month', label: '本月' },
    { key: 'year', label: '年度' },
  ]

  return (
    <>
      <div className="glass-panel p-4">
        <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
          命主（从档案选人自动出运势；不选则手选星座）
        </span>
        <PersonSelect value={person} onChange={(p) => setPersonId(p?.id ?? null)} />
        {!person && (
          <div className="mt-2">
            <SelectSign value={manualSign} onChange={setManualSign} />
          </div>
        )}
      </div>

      <div className="flex gap-1.5">
        {SCOPES.map((s) => (
          <button
            key={s.key}
            onClick={() => setScope(s.key)}
            className="flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition"
            style={
              scope === s.key
                ? { background: 'var(--color-gold)', color: '#1a1408' }
                : { background: 'transparent', color: 'var(--color-text-dim)', border: '1px solid var(--color-border)' }
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="glass-panel p-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl leading-none" style={{ color: 'var(--color-gold)' }}>{SIGNS[signIdx].symbol}</div>
          <div>
            <div className="font-kai text-lg font-bold text-gold-glow">{SIGNS[signIdx].name}</div>
            <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{f.title}</div>
          </div>
        </div>

        {scope === 'year' && f.keyword && (
          <div className="mt-3 rounded-xl border p-3" style={{ borderColor: 'var(--color-gold)' }}>
            <div className="flex items-center gap-2">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: 'var(--color-gold)', color: '#1a1408' }}>年度关键词</span>
              <span className="font-kai text-base font-bold text-gold-glow">{f.keyword}</span>
            </div>
            {f.keywordDesc && <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{f.keywordDesc}</p>}
          </div>
        )}

        <div className="mt-4 space-y-3">
          <FortuneRow label="综合" color="var(--color-gold)" item={f.overall} />
          <FortuneRow label="爱情" color="var(--color-ok)" item={f.love} />
          <FortuneRow label="事业" color="var(--color-jade)" item={f.career} />
          <FortuneRow label="财运" color="var(--color-accent)" item={f.money} />
          <FortuneRow label="健康" color="var(--color-danger)" item={f.health} />
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 rounded-xl border p-3 text-xs" style={{ borderColor: 'var(--color-border)' }}>
          <span style={{ color: 'var(--color-text-dim)' }}>幸运色 <b style={{ color: 'var(--color-gold)' }}>{f.luckyColor}</b></span>
          <span style={{ color: 'var(--color-text-dim)' }}>幸运数字 <b style={{ color: 'var(--color-gold)' }}>{f.luckyNumber}</b></span>
          <span style={{ color: 'var(--color-text-dim)' }}>幸运星座 <b style={{ color: 'var(--color-gold)' }}>{SIGNS[f.luckySign].name}</b></span>
        </div>
      </div>

      <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
        运势为娱乐向，按日期与星座确定性生成，仅供参考。
      </p>
    </>
  )
}

function FortuneRow({ label, color, item }: { label: string; color: string; item: FortuneItem }) {
  return (
    <div className="flex items-start gap-2">
      <span className="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: color, color: '#1a1408' }}>{label}</span>
      <div className="min-w-0">
        <div className="flex items-center gap-0.5 text-sm">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} style={{ color: n <= item.stars ? 'var(--color-gold)' : 'var(--color-border)' }}>★</span>
          ))}
        </div>
        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-text)' }}>{item.text}</p>
      </div>
    </div>
  )
}

function GalleryView() {
  const persons = useStore((s) => s.persons)
  const [personId, setPersonId] = useState<string | null>(null)
  const [sel, setSel] = useState<number | null>(null)
  const [kind, setKind] = useState<'sun' | 'moon'>('sun')

  const person = personId ? (persons.find((p) => p.id === personId) ?? null) : null

  // 选档案人后自动定位到 TA 的星座（月亮图鉴取月亮星座，太阳图鉴取太阳星座）。
  const viewIdx = person
    ? kind === 'moon'
      ? moonSignByDate(person.birthYear, person.birthMonth, person.birthDay, person.hour ?? 0)
      : signOf(person.birthMonth, person.birthDay)
    : sel

  const back = () => {
    if (person) setPersonId(null)
    else setSel(null)
  }

  if (viewIdx !== null) {
    const idx = viewIdx

    if (kind === 'moon') {
      const m = MOON_SIGNS[idx]
      const s = SIGNS[idx]
      return (
        <div className="space-y-3">
          <button onClick={back} className="liuyao-btn liuyao-btn-ghost w-full px-4 py-2.5">
            ‹ 返回月亮星座图鉴
          </button>
          <div className="glass-panel p-4">
            {person && <div className="mb-2 text-xs" style={{ color: 'var(--color-gold)' }}>来自档案：{person.name}</div>}
            <div className="flex items-center gap-3">
              <div className="text-5xl leading-none" style={{ color: 'var(--color-jade)' }}>{s.symbol}</div>
              <div>
                <div className="font-kai text-xl font-bold text-gold-glow">月亮在{s.name}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>内心 · 情感需求 · 安全感 · 情绪模式</div>
              </div>
            </div>
            <div className="mt-3 space-y-2 text-sm leading-relaxed">
              <div>
                <span className="mr-1 rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--color-gold)', color: '#1a1408' }}>情感需求</span>
                <span style={{ color: 'var(--color-text)' }}>{m.need}</span>
              </div>
              <div>
                <span className="mr-1 rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--color-ok)', color: '#1a1408' }}>安全感</span>
                <span style={{ color: 'var(--color-text)' }}>{m.security}</span>
              </div>
              <div>
                <span className="mr-1 rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--color-accent)', color: '#1a1408' }}>情绪模式</span>
                <span style={{ color: 'var(--color-text)' }}>{m.mood}</span>
              </div>
              <div>
                <span className="mr-1 rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--color-jade)', color: '#1a1408' }}>相处提示</span>
                <span style={{ color: 'var(--color-text)' }}>{m.tip}</span>
              </div>
              <div>
                <span className="mr-1 rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--color-danger)', color: '#1a1408' }}>适配星座</span>
                <span style={{ color: 'var(--color-text)' }}>{m.match}</span>
              </div>
            </div>
          </div>
        </div>
      )
    }

    const s = SIGNS[idx]
    return (
      <div className="space-y-3">
        <button onClick={back} className="liuyao-btn liuyao-btn-ghost w-full px-4 py-2.5">
          ‹ 返回图鉴
        </button>
        <div className="glass-panel p-4">
          {person && <div className="mb-2 text-xs" style={{ color: 'var(--color-gold)' }}>来自档案：{person.name}</div>}
          <div className="flex items-center gap-3">
            <div className="text-5xl leading-none" style={{ color: 'var(--color-gold)' }}>{s.symbol}</div>
            <div>
              <div className="font-kai text-xl font-bold text-gold-glow">{s.name}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{s.en} · {s.dateRange}</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[`${s.element}象`, `守护星·${s.ruler}`, ...s.traits].map((t) => (
              <span
                key={t}
                className="rounded-full border px-2.5 py-0.5 text-xs"
                style={{ color: 'var(--color-text-dim)', borderColor: 'var(--color-border)' }}
              >
                {t}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{s.desc}</p>

          <div className="mt-3 rounded-xl border p-3" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <span style={{ color: 'var(--color-text-dim)' }}>幸运数字 <b style={{ color: 'var(--color-gold)' }}>{s.luckyNumber}</b></span>
              <span style={{ color: 'var(--color-text-dim)' }}>幸运色 <b style={{ color: 'var(--color-gold)' }}>{s.luckyColor}</b></span>
              <span style={{ color: 'var(--color-text-dim)' }}>幸运石 <b style={{ color: 'var(--color-gold)' }}>{s.luckyStone}</b></span>
            </div>
          </div>

          <div className="mt-3 space-y-2 text-sm leading-relaxed">
            <div>
              <span className="mr-1 rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--color-ok)', color: '#1a1408' }}>优点</span>
              <span style={{ color: 'var(--color-text)' }}>{s.strength}</span>
            </div>
            <div>
              <span className="mr-1 rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--color-danger)', color: '#1a1408' }}>缺点</span>
              <span style={{ color: 'var(--color-text)' }}>{s.weakness}</span>
            </div>
            <div>
              <span className="mr-1 rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--color-gold)', color: '#1a1408' }}>爱情</span>
              <span style={{ color: 'var(--color-text)' }}>{s.love}</span>
            </div>
            <div>
              <span className="mr-1 rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--color-jade)', color: '#1a1408' }}>事业</span>
              <span style={{ color: 'var(--color-text)' }}>{s.career}</span>
            </div>
            <div>
              <span className="mr-1 rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--color-accent)', color: '#1a1408' }}>财运</span>
              <span style={{ color: 'var(--color-text)' }}>{s.money}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="glass-panel p-3">
        <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
          从档案选人，直接看 TA 的图鉴
        </span>
        <PersonSelect value={person} onChange={(p) => setPersonId(p?.id ?? null)} />
      </div>
      <div className="flex gap-2">
        {([['sun', '太阳星座'], ['moon', '月亮星座']] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className="flex-1 rounded-xl border px-3 py-2 text-sm font-semibold"
            style={{
              color: kind === k ? '#1a1408' : 'var(--color-text-dim)',
              borderColor: 'var(--color-border)',
              background: kind === k ? 'var(--color-gold)' : 'transparent',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {SIGNS.map((s, i) => (
          <button key={s.key} onClick={() => setSel(i)} className="glass-panel tap-target p-3 text-center">
            <div className="text-3xl leading-none" style={{ color: kind === 'moon' ? 'var(--color-jade)' : 'var(--color-gold)' }}>{s.symbol}</div>
            <div className="mt-1 font-kai text-sm font-bold" style={{ color: 'var(--color-text)' }}>{s.name}</div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>{kind === 'moon' ? '月亮' : s.dateRange}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
