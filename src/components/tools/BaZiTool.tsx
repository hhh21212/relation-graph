// 八字：完整排盘 + 日主强弱用神 + 格局 + 神煞合冲 + 大运流年。
// 命主数据从「档案（记录）」选择（含「我」），也可退回手动输入。

import { useMemo, useState } from 'react'
import { useStore, selectSelf } from '../../core/storage/store'
import PersonSelect from '../person/PersonSelect'
import { computeBaZi, BirthTime } from '../../core/rules/bazi'
import { computeZiPing } from '../../core/rules/ziPing'
import { computeLuMing } from '../../core/rules/luming'
import { computeGeJu } from '../../core/bazi/geju'
import { computeGanZhiRel, shenShaMeaning } from '../../core/bazi/relation'
import { baziComprehensive } from '../../core/bazi/reading'
import { computeDaYun, type LuckLevel } from '../../core/dayun/dayun'
import { zodiacOf } from '../../core/rules/zodiac'
import { WU_XING } from '../../core/rules/fiveElement'

const LEVEL_COLOR: Record<LuckLevel, string> = {
  吉: 'var(--color-ok)',
  平: 'var(--color-text-dim)',
  凶: 'var(--color-danger)',
}

const WU_XING_COLOR: Record<string, string> = {
  金: 'var(--color-gold)',
  木: 'var(--color-ok)',
  水: 'var(--color-accent)',
  火: 'var(--color-danger)',
  土: 'var(--color-jade)',
}

const SHISHEN_MEANING: Record<string, string> = {
  比肩: '同我同性，代表自己、伙伴与手足，主自立、竞争与担当。',
  劫财: '同我异性，主竞争与争夺，也代表开销、兄弟朋友。',
  食神: '我生同性，主才华、口福、温和，是有福气会享福的一类。',
  伤官: '我生异性，聪明外露、点子多，才华强但也易叛逆、招口舌。',
  偏财: '我克同性，主机遇之财、人脉与慷慨，来财灵活不喜拘束。',
  正财: '我克异性，主稳定收入与务实节俭，也主正缘、责任心。',
  七杀: '克我同性，主压力、魄力与竞争，扛得住压力才成大事。',
  正官: '克我异性，主规矩、名誉与约束，走正路、有公信力。',
  偏印: '生我同性，主偏门学问、玄学灵感，思绪独特、略偏孤。',
  正印: '生我异性，主学业、文凭与长辈缘，温厚有庇护。',
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-panel p-4">
      <div className="mb-2 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>✦ {title}</div>
      {children}
    </div>
  )
}

export default function BaZiTool() {
  const persons = useStore((s) => s.persons)
  const self = useStore(selectSelf)
  const [personId, setPersonId] = useState<string | null>(() => self?.id ?? null)
  const [year, setYear] = useState(2000)
  const [month, setMonth] = useState(6)
  const [day, setDay] = useState(15)
  const [hour, setHour] = useState<number | ''>('')
  const [gender, setGender] = useState<'male' | 'female'>('male')

  const person = personId ? (persons.find((p) => p.id === personId) ?? null) : null

  const input = useMemo<BirthTime | null>(() => {
    if (person) {
      return { year: person.birthYear, month: person.birthMonth, day: person.birthDay, hour: person.hour, minute: person.minute }
    }
    if (!(year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31)) return null
    return { year, month, day, hour: hour === '' ? undefined : hour }
  }, [person, year, month, day, hour])

  const effGender = person ? person.gender : gender

  const bazi = useMemo(() => (input ? computeBaZi(input) : null), [input])
  const zp = useMemo(() => (input ? computeZiPing(input) : null), [input])
  const lm = useMemo(() => (input ? computeLuMing(input) : null), [input])
  const gj = useMemo(() => (input ? computeGeJu(input) : null), [input])
  const reading = useMemo(() => (input ? baziComprehensive(input) : ''), [input])
  const rel = useMemo(() => (bazi ? computeGanZhiRel(bazi) : []), [bazi])
  const ss = useMemo(() => (lm ? shenShaMeaning(lm.shenShaAll) : []), [lm])
  const dayun = useMemo(() => (input ? computeDaYun({ ...input, gender: effGender }) : null), [input, effGender])

  const inputCls = 'w-full rounded-xl border bg-transparent px-3 py-2.5 text-center text-sm outline-none'
  const inputStyle = { borderColor: 'var(--color-border)', color: 'var(--color-text)' }

  return (
    <div className="space-y-3">
      <div className="glass-panel p-4">
        <span className="mb-2 block text-xs" style={{ color: 'var(--color-text-dim)' }}>命主（从档案选择，含「我」；也可手动输入）</span>
        <PersonSelect value={person} onChange={(p) => setPersonId(p?.id ?? null)} />

        {!person && (
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-4 gap-2">
              <input type="number" value={year || ''} onChange={(e) => setYear(Number(e.target.value))} placeholder="年" className={inputCls} style={inputStyle} />
              <input type="number" value={month || ''} onChange={(e) => setMonth(Number(e.target.value))} placeholder="月" className={inputCls} style={inputStyle} />
              <input type="number" value={day || ''} onChange={(e) => setDay(Number(e.target.value))} placeholder="日" className={inputCls} style={inputStyle} />
              <input type="number" value={hour} onChange={(e) => setHour(e.target.value === '' ? '' : Number(e.target.value))} placeholder="时" className={inputCls} style={inputStyle} />
            </div>
            <div className="flex gap-2">
              {(['male', 'female'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className="flex-1 rounded-xl border px-3 py-2 text-sm"
                  style={{
                    borderColor: gender === g ? 'var(--color-gold)' : 'var(--color-border)',
                    color: gender === g ? 'var(--color-gold)' : 'var(--color-text-dim)',
                    background: gender === g ? 'var(--color-card)' : 'transparent',
                  }}
                >
                  {g === 'male' ? '男' : '女'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {input && bazi && zp && lm && gj && (
        <div className="space-y-2">
          <Panel title="综合论命">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{reading}</p>
          </Panel>

          <Panel title={`完整排盘（${bazi.hasHour ? '八字' : '六字'}）`}>
            <div className="mb-2 flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-dim)' }}>
              <span>生肖 {zodiacOf(bazi.zodiac)}</span>
              <span>·</span>
              <span>{zp.dayMasterLabel}日主</span>
            </div>
            <div className="space-y-2">
              {lm.pillars.map((p) => (
                <div key={p.label} className="glass-cell rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>{p.label}</span>
                    <span className="font-kai text-lg font-bold text-gold-glow">{p.ganZhiName}</span>
                    <span className="text-[11px]" style={{ color: 'var(--color-text-dim)' }}>{p.nayin}</span>
                    <span className="ml-auto text-[11px]" style={{ color: 'var(--color-text-dim)' }}>{p.gongWei}</span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    <div>
                      <span style={{ color: 'var(--color-text)' }}>天干 <b style={{ color: 'var(--color-gold)' }}>{p.ganZhiName[0]}</b></span>
                      <span className="ml-2 text-xs" style={{ color: 'var(--color-accent)' }}>{p.shiShen[0]?.name}</span>
                      <span className="ml-2 text-xs" style={{ color: 'var(--color-text-dim)' }}>长生·{p.changSheng} · {p.wangShuai}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text)' }}>地支 <b style={{ color: 'var(--color-gold)' }}>{p.ganZhiName[1]}</b></span>
                      <span className="ml-2 text-xs" style={{ color: 'var(--color-text-dim)' }}>藏 {p.cangGan.map((c, i) => `${c}(${p.shiShen[i + 1]?.name ?? ''})`).join('、')}</span>
                    </div>
                    {p.shenSha.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {p.shenSha.map((s) => (
                          <span key={s} className="chip rounded-full px-2 py-0.5 text-[11px]" style={{ color: 'var(--color-text-dim)' }}>{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {!bazi.hasHour && (
              <p className="mt-2 text-xs" style={{ color: 'var(--color-text-dim)' }}>没填时辰，时柱未算，只排 6 字。</p>
            )}
          </Panel>

          <Panel title="五行分布与调候">
            <div className="space-y-2">
              {WU_XING.map((w) => {
                const count = bazi.fiveElements[w]
                const max = Math.max(1, ...WU_XING.map((x) => bazi.fiveElements[x]))
                return (
                  <div key={w}>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: WU_XING_COLOR[w] }}>{w}</span>
                      <span style={{ color: 'var(--color-text-dim)' }}>{count} 个</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full" style={{ background: 'var(--color-border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${(count / max) * 100}%`, background: WU_XING_COLOR[w] }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
              {(() => {
                const lack = WU_XING.filter((w) => bazi.fiveElements[w] === 0)
                return lack.length > 0
                  ? `命局缺「${lack.join('、')}」，可在名字、颜色、方位上适当补益；喜用仍以日主强弱为准。`
                  : '五行俱全，格局较均衡。'
              })()}
            </p>
          </Panel>

          <Panel title="日主强弱与用神">
            <div className="flex items-center gap-3">
              <span className="font-kai text-2xl font-bold text-gold-glow">{zp.dayMasterLabel}</span>
              <span className="rounded-full px-2.5 py-0.5 text-xs" style={{ color: zp.shenQiang === '强' ? 'var(--color-ok)' : 'var(--color-accent)' }}>
                身{zp.shenQiang}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{zp.text}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="glass-cell rounded-lg p-2">
                <span style={{ color: 'var(--color-ok)' }}>喜用</span>
                <span className="ml-1" style={{ color: 'var(--color-text)' }}>{zp.yongShenWuXing.join('、') || '—'}</span>
              </div>
              <div className="glass-cell rounded-lg p-2">
                <span style={{ color: 'var(--color-danger)' }}>忌</span>
                <span className="ml-1" style={{ color: 'var(--color-text)' }}>{zp.jiShenWuXing.join('、') || '—'}</span>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(Object.entries(lm.shiShenCount) as [string, number][]).map(([k, v]) => (
                <span key={k} className="chip rounded-full px-2 py-0.5 text-[11px]" style={{ color: 'var(--color-text-dim)' }}>
                  {k} {v}
                </span>
              ))}
            </div>
          </Panel>

          <Panel title="十神详解">
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(SHISHEN_MEANING).map((k) => (
                <div key={k} className="rounded-xl border p-2.5" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="font-kai text-sm font-bold" style={{ color: 'var(--color-gold)' }}>{k}</div>
                  <p className="mt-0.5 text-[12px] leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>{SHISHEN_MEANING[k]}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="格局">
            <div className="flex items-center gap-2">
              <span className="font-kai text-base font-bold text-gold-glow">{gj.name}</span>
              {gj.touGan && <span className="rounded-full px-2 py-0.5 text-[11px]" style={{ background: 'var(--color-card)', color: 'var(--color-gold)' }}>透干</span>}
              {gj.cong && <span className="rounded-full px-2 py-0.5 text-[11px]" style={{ background: 'var(--color-card)', color: 'var(--color-accent)' }}>从格</span>}
            </div>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{gj.text}</p>
          </Panel>

          <Panel title="神煞">
            {ss.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>命盘无明显神煞。</p>
            ) : (
              <div className="space-y-2">
                {ss.map((s) => (
                  <div key={s.name} className="flex items-start gap-2">
                    <span className="chip shrink-0 rounded-full px-2 py-0.5 text-[11px]" style={{ color: 'var(--color-gold)' }}>{s.name}</span>
                    <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-text)' }}>{s.text}</p>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="合冲刑害">
            {rel.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>四柱内部无明显合冲，格局平稳。</p>
            ) : (
              <div className="space-y-2">
                {rel.map((r, i) => (
                  <div key={i} className="rounded-xl border p-2.5" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="rounded-full border px-2 py-0.5 text-[11px] font-semibold" style={{ color: 'var(--color-accent)', borderColor: 'var(--color-border)' }}>{r.kind}</span>
                    <p className="mt-1 text-[13px] leading-relaxed" style={{ color: 'var(--color-text)' }}>{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="禄命 · 三命与主本">
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="rounded-full border px-2 py-0.5" style={{ color: 'var(--color-gold)', borderColor: 'var(--color-border)' }}>禄 {lm.sanMing.lu}</span>
              <span className="rounded-full border px-2 py-0.5" style={{ color: 'var(--color-ok)', borderColor: 'var(--color-border)' }}>命 {lm.sanMing.ming}</span>
              <span className="rounded-full border px-2 py-0.5" style={{ color: 'var(--color-accent)', borderColor: 'var(--color-border)' }}>身 {lm.sanMing.shen}</span>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--color-text)' }}>{lm.mainBen.text}</p>
          </Panel>

          <Panel title="禄命 · 喜用病根">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="glass-cell rounded-lg p-2">
                <span style={{ color: 'var(--color-text-dim)' }}>身（纳音）</span>
                <span className="ml-1" style={{ color: 'var(--color-gold)' }}>{lm.xiYong.shen}</span>
              </div>
              <div className="glass-cell rounded-lg p-2">
                <span style={{ color: 'var(--color-text-dim)' }}>病根</span>
                <span className="ml-1" style={{ color: 'var(--color-danger)' }}>{lm.xiYong.bingGen}</span>
              </div>
              <div className="glass-cell rounded-lg p-2">
                <span style={{ color: 'var(--color-text-dim)' }}>通关</span>
                <span className="ml-1" style={{ color: 'var(--color-ok)' }}>{lm.xiYong.tongGuan}</span>
              </div>
              <div className="glass-cell rounded-lg p-2">
                <span style={{ color: 'var(--color-text-dim)' }}>帮身</span>
                <span className="ml-1" style={{ color: 'var(--color-ok)' }}>{lm.xiYong.bangShen}</span>
              </div>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
              以年柱纳音「{lm.xiYong.shen}」为身，克身者为病根，宜用「{lm.xiYong.tongGuan}」通关、忌「{lm.xiYong.ji.join('、')}」。
            </p>
          </Panel>

          <Panel title="家庭出身（祖上 · 父母）">
            <div className="space-y-2">
              {[
                { label: '祖上', v: lm.jiaTing.zuShang },
                { label: '父母', v: lm.jiaTing.fuMu },
              ].map((x) => (
                <div key={x.label} className="rounded-xl border p-2.5" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>{x.label}</span>
                    <span className="font-kai text-sm font-bold text-gold-glow">{x.v.ganZhiName}</span>
                    <span className="text-[11px]" style={{ color: 'var(--color-text-dim)' }}>{x.v.nayin}</span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed" style={{ color: 'var(--color-text)' }}>{x.v.rel}</p>
                  {x.v.shenSha.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {x.v.shenSha.map((s) => (
                        <span key={s} className="chip rounded-full px-2 py-0.5 text-[11px]" style={{ color: 'var(--color-text-dim)' }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="三限（初限 · 中限 · 末限）">
            <div className="space-y-1.5">
              {lm.sanXian.map((x) => (
                <div key={x.limit} className="flex items-center justify-between text-[13px]">
                  <span style={{ color: 'var(--color-text-dim)' }}>{x.limit}</span>
                  <span className="font-kai" style={{ color: 'var(--color-gold)' }}>{x.pillar}</span>
                </div>
              ))}
            </div>
          </Panel>

          {dayun && (
            <Panel title={`大运（${dayun.direction}排 · ${dayun.startAgeText}起运）`}>
              <div className="space-y-2">
                {dayun.daYun.map((d) => (
                  <div key={d.index} className="glass-cell rounded-lg p-2.5" style={d.index === dayun.currentIndex ? { border: '1px solid var(--color-gold)' } : undefined}>
                    <div className="flex items-center gap-2">
                      <span className="font-kai text-base font-bold text-gold-glow">{d.name}</span>
                      <span className="text-[11px]" style={{ color: 'var(--color-text-dim)' }}>{Math.floor(d.startAge)}-{Math.floor(d.endAge)}岁</span>
                      {d.index === dayun.currentIndex && <span className="rounded-sm px-1 text-[10px] font-bold" style={{ background: 'var(--color-gold)', color: '#1a1408' }}>当前</span>}
                      <span className="ml-auto text-[11px]" style={{ color: LEVEL_COLOR[d.level] }}>{d.level}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>{d.text}</p>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {dayun && (
            <Panel title="流年运势（近年）">
              <div className="grid grid-cols-2 gap-2">
                {dayun.liuNian.map((l) => (
                  <div key={l.year} className="glass-cell rounded-lg p-2.5" style={l.isCurrent ? { borderColor: 'var(--color-accent)' } : undefined}>
                    <div className="flex items-center gap-1.5">
                      <span className="font-kai text-sm font-bold" style={{ color: l.isCurrent ? 'var(--color-accent)' : 'var(--color-gold)' }}>{l.year}</span>
                      <span className="text-[11px]" style={{ color: 'var(--color-dim)' }}>{l.name}</span>
                      {l.isBenMing && <span className="rounded-full px-1.5 py-0.5 text-[9px]" style={{ background: 'var(--color-accent)', color: '#0b1020' }}>本命</span>}
                      <span className="ml-auto text-[11px]" style={{ color: LEVEL_COLOR[l.level] }}>{l.level}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug" style={{ color: 'var(--color-text-dim)' }}>{l.text}</p>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
            八字 · 四柱 + 十神 + 格局 + 神煞 + 禄命 + 大运流年，娱乐参考。
          </p>
        </div>
      )}
    </div>
  )
}
