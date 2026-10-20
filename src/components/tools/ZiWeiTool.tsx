// 紫微斗数：排十二宫命盘 + 十四主星（含庙旺陷亮度）+ 十三辅星 + 四化 + 大限 + 逐宫详解。

import { useMemo, useState } from 'react'
import { useStore, selectSelf } from '../../core/storage/store'
import PersonSelect from '../person/PersonSelect'
import { computeZiWei, computeLiuNian, computeGongSiHua, sanFangSiZheng, detectPatterns, PALACE_NAMES, PALACE_TOPICS, type ZiWeiPan, type LiuNian } from '../../core/ziwei/ziwei'
import { comboOf } from '../../core/ziwei/combos'
import { comprehensiveReading, dayunDetail, lifeTopics, liuNianReading, palaceReading, mingShenZhu, oppositePalaces } from '../../core/ziwei/reading'
import { STARS, STAR_MAP, AUX_STARS, SIHUA_MEANING, starNameOf, brightnessOf } from '../../core/ziwei/stars'
import { BRANCHES, STEMS } from '../../core/rules/ganzhi'
import '../../styles/ziwei.css'

// 命盘固定宫位（4×4，四角留空）：地支位置不变。
const CELLS: ({ b: number } | null)[] = [
  { b: 5 }, { b: 6 }, { b: 7 }, { b: 8 },
  { b: 4 }, null, null, { b: 9 },
  { b: 3 }, null, null, { b: 10 },
  { b: 2 }, { b: 1 }, { b: 0 }, { b: 11 },
]

const SIHUA_COLOR: Record<string, string> = {
  lu: 'var(--color-ok)',
  quan: 'var(--color-gold)',
  ke: 'var(--color-jade)',
  ji: 'var(--color-danger)',
}
const SIHUA_CHAR: Record<string, string> = { lu: '禄', quan: '权', ke: '科', ji: '忌' }
const AUX_COLOR: Record<string, string> = {
  吉: 'var(--color-ok)',
  煞: 'var(--color-danger)',
  禄: 'var(--color-gold)',
}
const BRIGHT_COLOR: Record<string, string> = {
  庙: 'var(--color-gold)',
  旺: 'var(--color-jade)',
  平: 'var(--color-text-dim)',
  陷: 'var(--color-danger)',
}

function sihuaOf(pan: ZiWeiPan, key: string) {
  return (['lu', 'quan', 'ke', 'ji'] as const).filter((k) => pan.sihua[k] === key)
}

function liunianSihuaOf(liunian: LiuNian | null, key: string) {
  if (!liunian) return []
  return (['lu', 'quan', 'ke', 'ji'] as const).filter((k) => liunian.sihua[k] === key)
}

function dayunLabel(pan: ZiWeiPan): string | null {
  const cur = pan.dayun.find((d) => d.isCurrent)
  if (!cur) return null
  const offset = ((pan.mingGong - cur.palace) % 12 + 12) % 12
  return `当前大限 · ${PALACE_NAMES[offset]}（${cur.startAge}-${cur.endAge}岁）`
}

export default function ZiWeiTool() {
  const persons = useStore((s) => s.persons)
  const self = useStore(selectSelf)
  const [personId, setPersonId] = useState<string | null>(() => self?.id ?? null)
  const [year, setYear] = useState(2000)
  const [month, setMonth] = useState(6)
  const [day, setDay] = useState(15)
  const [hour, setHour] = useState<number | ''>('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [selGong, setSelGong] = useState<number | null>(null)
  const [liuYear, setLiuYear] = useState(() => new Date().getFullYear())

  const person = personId ? (persons.find((p) => p.id === personId) ?? null) : null

  const input = useMemo(() => {
    if (person) {
      return { year: person.birthYear, month: person.birthMonth, day: person.birthDay, hour: person.hour, minute: person.minute }
    }
    if (!(year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31)) return null
    return { year, month, day, hour: hour === '' ? undefined : hour }
  }, [person, year, month, day, hour])

  const effGender = person ? person.gender : gender

  const pan = useMemo(() => (input ? computeZiWei({ ...input, gender: effGender }) : null), [input, effGender])

  const liunian = useMemo(() => (input ? computeLiuNian(input, liuYear) : null), [input, liuYear])

  const sfszInfo = useMemo(() => {
    if (!pan) return null
    const sfsz = sanFangSiZheng(pan.mingGong)
    const mainCount = STARS.filter((s) => sfsz.includes(pan.stars[s.key])).length
    const jiCount = AUX_STARS.filter((s) => s.kind === '吉' && sfsz.includes(pan.auxStars[s.key])).length
    const shaCount = AUX_STARS.filter((s) => s.kind === '煞' && sfsz.includes(pan.auxStars[s.key])).length
    const patterns = detectPatterns(pan)
    const verdict =
      jiCount > shaCount
        ? '三方四正吉星汇聚，命格偏吉、贵人助力多。'
        : shaCount > jiCount
          ? '三方四正煞星略多，人生起伏较大，需靠后天修炼补强。'
          : '三方四正吉煞相当，格局均衡，走势看大限流年。'
    return { mainCount, jiCount, shaCount, patterns, verdict }
  }, [pan])

  const gongSihua = useMemo(() => (pan ? computeGongSiHua(pan) : []), [pan])

  const reading = useMemo(() => (pan ? comprehensiveReading(pan) : ''), [pan])
  const dayuns = useMemo(() => (pan ? dayunDetail(pan) : []), [pan])
  const topics = useMemo(() => (pan ? lifeTopics(pan) : []), [pan])
  const liuNianText = useMemo(() => (pan && liunian ? liuNianReading(pan, liunian) : ''), [pan, liunian])
  const msz = useMemo(() => (pan ? mingShenZhu(pan) : null), [pan])
  const opposites = useMemo(() => (pan ? oppositePalaces(pan) : []), [pan])

  const inputCls = 'w-full rounded-xl border bg-transparent px-3 py-2.5 text-center text-sm outline-none'
  const inputStyle = { borderColor: 'var(--color-border)', color: 'var(--color-text)' }

  return (
    <div className="space-y-3">
      <div className="glass-panel p-4">
        <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
          命主（从档案选择，含「我」；也可手动输入）
        </span>
        <PersonSelect value={person} onChange={(p) => setPersonId(p?.id ?? null)} />

        {!person && (
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-4 gap-2">
              <input type="number" value={year || ''} onChange={(e) => setYear(Number(e.target.value))} placeholder="年" className={inputCls} style={inputStyle} />
              <input type="number" value={month || ''} onChange={(e) => setMonth(Number(e.target.value))} placeholder="月" className={inputCls} style={inputStyle} />
              <input type="number" value={day || ''} onChange={(e) => setDay(Number(e.target.value))} placeholder="日" className={inputCls} style={inputStyle} />
              <input type="number" value={hour} onChange={(e) => setHour(e.target.value === '' ? '' : Number(e.target.value))} placeholder="时" className={inputCls} style={inputStyle} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>性别（用于大限顺逆）</span>
              <button
                onClick={() => setGender('male')}
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={gender === 'male' ? { background: 'var(--color-gold)', color: '#1a1408' } : { background: 'transparent', color: 'var(--color-text-dim)', border: '1px solid var(--color-border)' }}
              >
                男
              </button>
              <button
                onClick={() => setGender('female')}
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={gender === 'female' ? { background: 'var(--color-gold)', color: '#1a1408' } : { background: 'transparent', color: 'var(--color-text-dim)', border: '1px solid var(--color-border)' }}
              >
                女
              </button>
            </div>
          </div>
        )}
      </div>

      {pan && (
        <>
          <div className="glass-panel p-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: 'var(--color-text-dim)' }}>
              <span>{pan.lunarText}</span>
              <span style={{ color: 'var(--color-gold)' }}>{pan.juName}</span>
              <span>命宫·{BRANCHES[pan.mingGong]}</span>
              <span>身宫·{BRANCHES[pan.shenGong]}</span>
              {dayunLabel(pan) && <span style={{ color: 'var(--color-ok)' }}>{dayunLabel(pan)}</span>}
            </div>
          </div>

          <div className="glass-panel p-2">
            <div className="ziwei-grid">
              {CELLS.map((c, i) =>
                c ? (
                  <PalaceCell
                    key={i}
                    pan={pan}
                    b={c.b}
                    selected={selGong === c.b}
                    onSelect={() => setSelGong(selGong === c.b ? null : c.b)}
                    liunian={liunian}
                  />
                ) : (
                  <div key={i} className="ziwei-corner" />
                ),
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px]">
              <span style={{ color: 'var(--color-gold)' }}>● 主星 / 禄存</span>
              <span style={{ color: 'var(--color-ok)' }}>● 吉星</span>
              <span style={{ color: 'var(--color-danger)' }}>● 煞星</span>
            </div>
            <div className="mt-1 text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>点宫位看详解</div>
          </div>

          {selGong !== null && <GongDetail pan={pan} b={selGong} onClose={() => setSelGong(null)} />}

          {reading && (
            <div className="glass-panel p-4">
              <div className="mb-1 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 命身宫综合论命</div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{reading}</p>
            </div>
          )}

          <div className="glass-panel p-4">
            <div className="mb-2 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>
              ✦ 命宫主星
            </div>
            {pan.mingEmpty ? (
              <>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                  命宫无主星（空宫），性格较随环境而变，一般借对宫「迁移宫」的星来看。
                </p>
                {pan.qianyiStars.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {pan.qianyiStars.map((k) => {
                      const s = STAR_MAP[k]
                      return (
                        <div key={k}>
                          <div className="font-kai text-base font-bold text-gold-glow">{s.name}（借对宫）</div>
                          <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{s.desc}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                {pan.mingStars.map((k) => {
                  const s = STAR_MAP[k]
                  return (
                    <div key={k}>
                      <div className="flex items-center gap-2">
                        <span className="font-kai text-base font-bold text-gold-glow">{s.name}</span>
                        <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{s.wuxing} · {s.kind}</span>
                        <span
                          className="rounded border px-1 text-[10px]"
                          style={{ color: BRIGHT_COLOR[brightnessOf(k, pan.mingGong)], borderColor: BRIGHT_COLOR[brightnessOf(k, pan.mingGong)] }}
                        >
                          {brightnessOf(k, pan.mingGong)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{s.desc}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {s.traits.map((t) => (
                          <span key={t} className="rounded-full border px-2 py-0.5 text-[11px]" style={{ color: 'var(--color-text-dim)', borderColor: 'var(--color-border)' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  )
                })}
                {pan.mingStars.length > 1 && <ComboCard keys={pan.mingStars} />}
              </div>
            )}
          </div>

          {msz && (
            <div className="glass-panel p-4">
              <div className="mb-2 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 命主 · 身主</div>
              <div className="space-y-2">
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>命主 · {msz.mingZhu.name}</div>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>{msz.mingZhu.desc}</p>
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>身主 · {msz.shenZhu.name}</div>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>{msz.shenZhu.desc}</p>
                </div>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--color-text)' }}>{msz.text}</p>
            </div>
          )}

          <div className="glass-panel p-4">
            <div className="mb-2 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>
              ✦ 生年四化
            </div>
            <div className="space-y-2">
              {(['lu', 'quan', 'ke', 'ji'] as const).map((k) => {
                const key = pan.sihua[k]
                return (
                  <div key={k} className="flex items-start gap-2 text-sm">
                    <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold" style={{ color: SIHUA_COLOR[k], borderColor: SIHUA_COLOR[k] }}>
                      {SIHUA_CHAR[k]}
                    </span>
                    <div>
                      <span style={{ color: 'var(--color-text)' }}>{starNameOf(key)}</span>
                      <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{SIHUA_MEANING[k]}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {liunian && (
            <div className="glass-panel p-4">
              <div className="flex items-center justify-between">
                <div className="font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 流年四化</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setLiuYear(liuYear - 1)} className="liuyao-btn liuyao-btn-ghost px-2 py-0.5 text-xs">−</button>
                  <span className="font-kai text-sm font-bold text-gold-glow">{liuYear} · {liunian.ganName}{liunian.zhiName}年</span>
                  <button onClick={() => setLiuYear(liuYear + 1)} className="liuyao-btn liuyao-btn-ghost px-2 py-0.5 text-xs">＋</button>
                </div>
              </div>
              <div className="mt-1 text-xs" style={{ color: 'var(--color-text-dim)' }}>
                流年命宫 · {BRANCHES[liunian.mingGong]}（命盘标「流」）
              </div>
              {liuNianText && (
                <p className="mt-2 rounded-xl border p-2.5 text-[13px] leading-relaxed" style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)' }}>
                  {liuNianText}
                </p>
              )}
              <div className="mt-2 space-y-2">
                {(['lu', 'quan', 'ke', 'ji'] as const).map((k) => {
                  const key = liunian.sihua[k]
                  const branch = pan.stars[key] ?? pan.auxStars[key]
                  const offset = ((pan.mingGong - branch) % 12 + 12) % 12
                  return (
                    <div key={k} className="flex items-start gap-2 text-sm">
                      <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold" style={{ color: SIHUA_COLOR[k], borderColor: SIHUA_COLOR[k] }}>{SIHUA_CHAR[k]}</span>
                      <div>
                        <span style={{ color: 'var(--color-text)' }}>{starNameOf(key)} · {PALACE_NAMES[offset]}</span>
                        <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{SIHUA_MEANING[k]}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {gongSihua.length > 0 && (
            <div className="glass-panel p-4">
              <div className="mb-1 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 宫干四化飞星</div>
              <p className="mb-2 text-xs" style={{ color: 'var(--color-text-dim)' }}>
                十二宫各以宫干化出「禄权科忌」，飞入对应星曜所落之宫——本命四化落在哪一宫，便引动该宫人事。
              </p>
              <div className="space-y-1.5">
                {gongSihua.map((g) => (
                  <div key={g.fromGong} className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border px-2.5 py-2" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="w-14 shrink-0 font-kai text-sm font-bold" style={{ color: g.fromGong === pan.mingGong ? 'var(--color-gold)' : 'var(--color-text)' }}>
                      {PALACE_NAMES[g.fromOffset]}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--color-text-dim)' }}>{STEMS[g.stem]}</span>
                    {g.flies.map((f) => (
                      <span key={f.kind} className="flex items-center gap-0.5 text-[11px]">
                        <span style={{ color: SIHUA_COLOR[f.kind] }}>{SIHUA_CHAR[f.kind]}{starNameOf(f.star)}</span>
                        <span style={{ color: 'var(--color-text-dim)' }}>→{PALACE_NAMES[((pan.mingGong - f.toGong) % 12 + 12) % 12]}</span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {topics.length > 0 && (
            <div className="glass-panel p-4">
              <div className="mb-2 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 爱情 · 事业 · 财运</div>
              <div className="space-y-2.5">
                {topics.map((t) => (
                  <div key={t.key} className="rounded-xl border p-2.5" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center gap-2">
                      <span className="font-kai text-sm font-bold" style={{ color: 'var(--color-gold)' }}>{t.title}</span>
                      <span className="text-[11px]" style={{ color: 'var(--color-text-dim)' }}>看{t.palaceName}</span>
                    </div>
                    <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: 'var(--color-text)' }}>{t.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sfszInfo && (
            <div className="glass-panel p-4">
              <div className="mb-2 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 三方四正与格局</div>
              <div className="mb-1 text-xs" style={{ color: 'var(--color-text-dim)' }}>
                命宫三方四正会照：主星 {sfszInfo.mainCount} · 吉星 {sfszInfo.jiCount} · 煞星 {sfszInfo.shaCount}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{sfszInfo.verdict}</p>
              {sfszInfo.patterns.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {sfszInfo.patterns.map((p) => (
                    <div key={p.name} className="rounded-xl border p-2.5" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="font-kai text-sm font-bold" style={{ color: 'var(--color-gold)' }}>{p.name}</div>
                      <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: 'var(--color-text)' }}>{p.desc}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm" style={{ color: 'var(--color-text-dim)' }}>命宫三方四正无特殊格局，格局平稳。</p>
              )}
            </div>
          )}

          {opposites.length > 0 && (
            <div className="glass-panel p-4">
              <div className="mb-2 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 对宫关系详解</div>
              <p className="mb-3 text-xs" style={{ color: 'var(--color-text-dim)' }}>
                十二宫两两对望、互为表里：一主外显、一主内里，互相牵引。
              </p>
              <div className="space-y-2">
                {opposites.map((o) => (
                  <div key={o.aOffset} className="rounded-xl border p-2.5" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center gap-2">
                      <span className="font-kai text-sm font-bold" style={{ color: 'var(--color-text)' }}>{o.aName}</span>
                      <span className="text-[11px]" style={{ color: 'var(--color-text-dim)' }}>（{o.aStars.length > 0 ? o.aStars.join('、') : '无主星'}）</span>
                      <span className="text-xs" style={{ color: 'var(--color-gold)' }}>⇄</span>
                      <span className="font-kai text-sm font-bold" style={{ color: 'var(--color-text)' }}>{o.bName}</span>
                      <span className="text-[11px]" style={{ color: 'var(--color-text-dim)' }}>（{o.bStars.length > 0 ? o.bStars.join('、') : '无主星'}）</span>
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed" style={{ color: 'var(--color-text)' }}>{o.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dayuns.length > 0 && (
            <div className="glass-panel p-4">
              <div className="mb-2 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 大限逐宫详解</div>
              <div className="space-y-2">
                {dayuns.map((d) => (
                  <div key={d.startAge} className="rounded-xl border p-2.5" style={{ borderColor: d.isCurrent ? 'var(--color-gold)' : 'var(--color-border)' }}>
                    <div className="flex items-center gap-2">
                      <span className="font-kai text-sm font-bold" style={{ color: d.isCurrent ? 'var(--color-gold)' : 'var(--color-text)' }}>{d.palaceName}</span>
                      <span className="text-[11px]" style={{ color: 'var(--color-text-dim)' }}>{d.startAge}-{d.endAge}岁</span>
                      {d.isCurrent && <span className="rounded-sm px-1 text-[10px] font-bold" style={{ background: 'var(--color-gold)', color: '#1a1408' }}>当前</span>}
                    </div>
                    <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: 'var(--color-text)' }}>{d.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <PalaceOverview pan={pan} />
          <StarEncyclopedia />

          <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
            紫微斗数 · 十二宫 + 十四主星（含亮度）+ 十三辅星 + 四化 + 大限 + 流年，娱乐参考。
          </p>
        </>
      )}
    </div>
  )
}

function PalaceCell({ pan, b, selected, onSelect, liunian }: { pan: ZiWeiPan; b: number; selected: boolean; onSelect: () => void; liunian: LiuNian | null }) {
  const offset = ((pan.mingGong - b) % 12 + 12) % 12
  const palaceName = PALACE_NAMES[offset]
  const isMing = b === pan.mingGong
  const isShen = b === pan.shenGong
  const stem = STEMS[pan.palaceStems[b]]
  const branch = BRANCHES[b]
  const starsHere = STARS.filter((s) => pan.stars[s.key] === b)
  const auxHere = AUX_STARS.filter((s) => pan.auxStars[s.key] === b)

  return (
    <div
      onClick={onSelect}
      className={`ziwei-cell${isMing ? ' ziwei-cell-ming' : ''}${selected ? ' ziwei-cell-sel' : ''}`}
    >
      <div className="flex items-center gap-0.5">
        <span className="text-[10px]" style={{ color: isMing ? 'var(--color-gold)' : 'var(--color-text-dim)' }}>{palaceName}</span>
        {isMing && <span className="rounded-sm px-0.5 text-[9px] font-bold" style={{ background: 'var(--color-gold)', color: '#1a1408' }}>命</span>}
        {isShen && <span className="rounded-sm px-0.5 text-[9px] font-bold" style={{ background: 'var(--color-accent)', color: '#1a1408' }}>身</span>}
        {liunian && b === liunian.mingGong && <span className="rounded-sm px-0.5 text-[9px] font-bold" style={{ background: 'var(--color-jade)', color: '#1a1408' }}>流</span>}
      </div>
      <div className="text-[11px]" style={{ color: 'var(--color-text)' }}>{stem}{branch}</div>
      <div className="mt-0.5 flex flex-col gap-0.5">
        {starsHere.map((s) => (
          <div key={s.key} className="font-kai text-[12px] font-bold leading-tight" style={{ color: 'var(--color-gold)' }}>
            {s.name}
            <span className="font-normal" style={{ color: BRIGHT_COLOR[brightnessOf(s.key, b)] }}>{brightnessOf(s.key, b)}</span>
            {sihuaOf(pan, s.key).map((k) => (
              <span key={k} className="ml-0.5 text-[9px] font-normal" style={{ color: SIHUA_COLOR[k] }}>{SIHUA_CHAR[k]}</span>
            ))}
            {liunianSihuaOf(liunian, s.key).map((k) => (
              <span key={'ln' + k} className="ml-0.5 rounded-full border px-0.5 text-[9px] font-normal" style={{ color: SIHUA_COLOR[k], borderColor: SIHUA_COLOR[k] }}>{SIHUA_CHAR[k]}</span>
            ))}
          </div>
        ))}
        {auxHere.map((s) => (
          <div key={s.key} className="text-[10px] leading-tight" style={{ color: AUX_COLOR[s.kind] }}>
            {s.name}
            {sihuaOf(pan, s.key).map((k) => (
              <span key={k} className="ml-0.5 text-[9px]" style={{ color: SIHUA_COLOR[k] }}>{SIHUA_CHAR[k]}</span>
            ))}
            {liunianSihuaOf(liunian, s.key).map((k) => (
              <span key={'ln' + k} className="ml-0.5 rounded-full border px-0.5 text-[9px]" style={{ color: SIHUA_COLOR[k], borderColor: SIHUA_COLOR[k] }}>{SIHUA_CHAR[k]}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function ComboCard({ keys }: { keys: string[] }) {
  const combo = comboOf(keys)
  if (!combo) return null
  return (
    <div className="mt-2 rounded-xl border p-2.5" style={{ borderColor: 'var(--color-border)' }}>
      <div className="flex items-center gap-2">
        <span className="font-kai text-sm font-bold" style={{ color: 'var(--color-gold)' }}>{combo.name}</span>
        <span className="text-[11px]" style={{ color: 'var(--color-text-dim)' }}>双星同宫 · {combo.palaces}</span>
      </div>
      <p className="mt-1 text-[13px] leading-relaxed" style={{ color: 'var(--color-text)' }}>{combo.desc}</p>
    </div>
  )
}

function GongDetail({ pan, b, onClose }: { pan: ZiWeiPan; b: number; onClose: () => void }) {
  const offset = ((pan.mingGong - b) % 12 + 12) % 12
  const palaceName = PALACE_NAMES[offset]
  const topic = PALACE_TOPICS[offset]
  const stem = STEMS[pan.palaceStems[b]]
  const branch = BRANCHES[b]
  const mains = STARS.filter((s) => pan.stars[s.key] === b)
  const aux = AUX_STARS.filter((s) => pan.auxStars[s.key] === b)
  const pr = palaceReading(pan, b)

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between">
        <div className="font-kai text-base font-bold text-gold-glow">{palaceName}</div>
        <button onClick={onClose} className="text-xs" style={{ color: 'var(--color-text-dim)' }}>收起 ×</button>
      </div>
      <div className="mt-0.5 text-xs" style={{ color: 'var(--color-text-dim)' }}>{stem}{branch} · {topic}</div>
      <div className="mt-3 space-y-2.5">
        {mains.length === 0 && (
          <div className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
            {pr.borrowed.length > 0
              ? `此宫无主星，借对宫「${pr.borrowedFrom}」的${pr.borrowed.join('、')}来看。`
              : '此宫无主星。'}
          </div>
        )}
        {mains.map((s) => (
          <div key={s.key}>
            <div className="font-kai text-sm font-bold" style={{ color: 'var(--color-gold)' }}>
              {s.name}
              <span
                className="ml-1 rounded border px-1 text-[10px] font-normal"
                style={{ color: BRIGHT_COLOR[brightnessOf(s.key, b)], borderColor: BRIGHT_COLOR[brightnessOf(s.key, b)] }}
              >
                {brightnessOf(s.key, b)}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{s.desc}</p>
          </div>
        ))}
        {mains.length === 2 && <ComboCard keys={mains.map((s) => s.key)} />}
        {aux.map((s) => (
          <div key={s.key}>
            <div className="text-sm font-bold" style={{ color: AUX_COLOR[s.kind] }}>{s.name}</div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{s.desc}</p>
          </div>
        ))}
        {pr.sihua.length > 0 && (
          <div className="rounded-xl border p-2.5 text-[13px] leading-relaxed" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
            生年四化：{pr.sihua.join('、')}
          </div>
        )}
      </div>
    </div>
  )
}

function PalaceOverview({ pan }: { pan: ZiWeiPan }) {
  return (
    <div className="glass-panel p-4">
      <div className="mb-2 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 十二宫总览</div>
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 12 }, (_, b) => {
          const offset = ((pan.mingGong - b) % 12 + 12) % 12
          const mains = STARS.filter((s) => pan.stars[s.key] === b)
          const aux = AUX_STARS.filter((s) => pan.auxStars[s.key] === b)
          return (
            <div key={b} className="rounded-xl border p-2.5" style={{ borderColor: b === pan.mingGong ? 'var(--color-gold)' : 'var(--color-border)' }}>
              <div className="flex items-center gap-1">
                <span className="font-kai text-sm font-bold" style={{ color: b === pan.mingGong ? 'var(--color-gold)' : 'var(--color-text)' }}>{PALACE_NAMES[offset]}</span>
                {b === pan.mingGong && <span className="rounded-sm px-0.5 text-[9px] font-bold" style={{ background: 'var(--color-gold)', color: '#1a1408' }}>命</span>}
                <span className="ml-auto text-[10px]" style={{ color: 'var(--color-dim)' }}>{BRANCHES[b]}</span>
              </div>
              <div className="mt-0.5 text-[11px]" style={{ color: 'var(--color-text)' }}>
                {mains.length > 0 ? mains.map((s) => s.name).join('、') : '无主星'}
              </div>
              {aux.length > 0 && (
                <div className="text-[10px]" style={{ color: 'var(--color-text-dim)' }}>{aux.map((s) => s.name).join('、')}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StarEncyclopedia() {
  const [kind, setKind] = useState<'main' | 'aux'>('main')
  const stars = kind === 'main' ? STARS : AUX_STARS
  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between">
        <div className="font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ 星曜详解</div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setKind('main')}
            className="rounded-full border px-3 py-1 text-xs font-semibold"
            style={kind === 'main' ? { background: 'var(--color-gold)', color: '#1a1408' } : { background: 'transparent', color: 'var(--color-text-dim)', borderColor: 'var(--color-border)' }}
          >
            十四主星
          </button>
          <button
            onClick={() => setKind('aux')}
            className="rounded-full border px-3 py-1 text-xs font-semibold"
            style={kind === 'aux' ? { background: 'var(--color-gold)', color: '#1a1408' } : { background: 'transparent', color: 'var(--color-text-dim)', borderColor: 'var(--color-border)' }}
          >
            十三辅星
          </button>
        </div>
      </div>
      <div className="mt-3 space-y-2.5">
        {stars.map((s) => {
          const isMain = 'wuxing' in s
          return (
            <div key={s.key} className="rounded-xl border p-2.5" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2">
                <span className="font-kai text-sm font-bold" style={{ color: 'var(--color-gold)' }}>{s.name}</span>
                {isMain ? (
                  <span className="text-[11px]" style={{ color: 'var(--color-text-dim)' }}>{s.wuxing} · {s.kind}</span>
                ) : (
                  <span className="text-[11px]" style={{ color: AUX_COLOR[s.kind] }}>{s.kind === '吉' ? '吉星' : s.kind === '煞' ? '煞星' : '禄星'}</span>
                )}
              </div>
              <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: 'var(--color-text)' }}>{s.desc}</p>
              {isMain && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {s.traits.map((t) => (
                    <span key={t} className="rounded-full border px-2 py-0.5 text-[11px]" style={{ color: 'var(--color-text-dim)', borderColor: 'var(--color-border)' }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
