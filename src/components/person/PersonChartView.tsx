// 全屏「个人命盘」页：从详情点「看命盘」进入，8 个标签切着看。
// 概览 / 性格 / 适合 / 财运 / 感情 / 健康 / 贵人与小人 / 时间。

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../core/storage/store'
import { useUI } from '../../store/ui'
import { computeDestiny } from '../../core/relation/destiny'
import { computeFortune } from '../../core/relation/fortune'
import { zodiacOf } from '../../core/rules/zodiac'
import { computeBaZi } from '../../core/rules/bazi'
import { ageOf, formatBirthDate } from '../../utils/format'
import { exportCardImage } from '../../utils/exportImage'
import { exportTextFile } from '../../utils/exportText'

type TabKey = 'overview' | 'character' | 'suitable' | 'wealth' | 'love' | 'health' | 'benefactor' | 'time'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: '概览' },
  { key: 'character', label: '性格' },
  { key: 'suitable', label: '适合' },
  { key: 'wealth', label: '财运' },
  { key: 'love', label: '感情' },
  { key: 'health', label: '健康' },
  { key: 'benefactor', label: '贵人与小人' },
  { key: 'time', label: '时间' },
]

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-panel p-4">
      <div className="mb-2 font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>
        ✦ {title}
      </div>
      {children}
    </div>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-accent)' }}>
      ⚠ {children}
    </p>
  )
}

export default function PersonChartView() {
  const chartId = useUI((s) => s.chartId)
  const closeChart = useUI((s) => s.closeChart)
  const persons = useStore((s) => s.persons)
  const [tab, setTab] = useState<TabKey>('overview')

  const person = persons.find((p) => p.id === chartId)

  const destiny = useMemo(() => (person ? computeDestiny(person) : null), [person])
  const fortune = useMemo(() => (person ? computeFortune(person) : null), [person])
  const zodiac = useMemo(() => {
    if (!person) return '？'
    return zodiacOf(
      computeBaZi({ year: person.birthYear, month: person.birthMonth, day: person.birthDay, hour: person.hour, minute: person.minute }).zodiac,
    )
  }, [person])

  const handleExport = () => {
    if (!person || !destiny) return
    exportCardImage({
      filename: `命盘-${person.name}.png`,
      title: `${person.name} · 个人命盘`,
      subtitle: `${zodiac} · ${ageOf(person)}岁 · ${destiny.overview.genderLabel}`,
      sections: [
        { heading: '八字四柱', chips: destiny.overview.baziGrid.map((c) => `${c.label} ${c.ganZhi}`) },
        { heading: '日主与强弱', lines: [`${destiny.overview.dayMasterLabel} · 身${destiny.overview.shenQiang}`, destiny.overview.shenQiangText] },
        { heading: '性格底色', lines: [destiny.character.dayMasterNature] },
        { heading: '优点', lines: destiny.character.strengths },
        { heading: '适合的行业', chips: destiny.suitable.industries },
        {
          heading: '适合的方位 · 颜色 · 数字',
          lines: [
            `方位 ${destiny.suitable.directions.join('、')} · 颜色 ${destiny.suitable.colors.join('、')} · 数字 ${destiny.suitable.numbers.join('、')}`,
          ],
        },
        { heading: '财运', lines: [`${destiny.wealth.type} · ${destiny.wealth.style}`, destiny.wealth.text] },
      ],
      footer: '按主流命理算法生成，仅供娱乐参考',
    })
  }

  const handleExportText = () => {
    if (!person || !destiny || !fortune) return
    exportTextFile({
      filename: `命盘-${person.name}.txt`,
      title: `${person.name} · 个人命盘`,
      subtitle: `${zodiac} · ${ageOf(person)}岁 · ${destiny.overview.genderLabel}${destiny.hasHour ? '' : '（缺时辰，时柱未算）'}`,
      sections: [
        { heading: '八字四柱', chips: destiny.overview.baziGrid.map((c) => `${c.label} ${c.ganZhi}`) },
        { heading: '日主与强弱', lines: [`${destiny.overview.dayMasterLabel} · 身${destiny.overview.shenQiang}`, destiny.overview.shenQiangText] },
        { heading: '三命与主本', lines: [destiny.overview.sanMingText, destiny.overview.mainBenText] },
        { heading: '性格底色', lines: [destiny.character.dayMasterNature] },
        { heading: '优点', lines: destiny.character.strengths },
        { heading: '要留意的点', lines: destiny.character.weaknesses },
        { heading: '适合的行业', chips: destiny.suitable.industries },
        {
          heading: '适合的方位 · 颜色 · 数字',
          lines: [
            `方位 ${destiny.suitable.directions.join('、')} · 颜色 ${destiny.suitable.colors.join('、')} · 数字 ${destiny.suitable.numbers.join('、')}`,
          ],
        },
        { heading: '财运', lines: [`${destiny.wealth.type} · ${destiny.wealth.style}`, destiny.wealth.text] },
        { heading: '感情', lines: [destiny.love.text] },
        { heading: '健康', lines: [...destiny.health.weakAreas, ...destiny.health.tips] },
        { heading: '贵人与小人', lines: [`贵人属相：${destiny.benefactor.zodiacs.join('、')}`, `要留神：${destiny.villain.zodiacs.join('、')}`] },
        {
          heading: '大运',
          lines: fortune.daYun
            ? [`${fortune.daYun.startAgeLabel}起运`, ...fortune.daYun.pillars.map((p) => `${p.ganZhi}（${p.ageLabel}）${p.text}`)]
            : [fortune.missingNote ?? '缺性别，未算大运'],
        },
        { heading: '今年与未来几年', lines: fortune.recentYears.map((y) => `${y.year}（${y.ganZhi}）${y.text}`) },
      ],
      footer: '按主流命理算法生成，仅供娱乐参考',
    })
  }

  return (
    <AnimatePresence>
      {person && destiny && fortune && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto no-scrollbar"
          style={{ background: 'transparent' }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
        >
          <div className="mx-auto max-w-lg px-5 pb-10">
            {/* 顶栏 */}
            <header className="safe-top sticky top-0 z-10 flex items-center justify-between py-3 backdrop-blur">
              <h1 className="font-kai text-lg font-bold text-gold-glow">个人命盘</h1>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleExport}
                  className="tap-target rounded-full border px-3 py-1.5 text-xs font-medium"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-gold)' }}
                >
                  ⤓ 导出
                </button>
                <button
                  onClick={handleExportText}
                  className="tap-target rounded-full border px-3 py-1.5 text-xs font-medium"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-dim)' }}
                >
                  导出文本
                </button>
                <button
                  onClick={closeChart}
                  className="tap-target flex items-center justify-center rounded-full text-xl"
                  style={{ color: 'var(--color-text-dim)' }}
                  aria-label="关闭"
                >
                  ✕
                </button>
              </div>
            </header>

            {/* 姓名条 */}
            <div className="flex items-center justify-center gap-3 py-3">
              <div className="font-kai text-2xl font-bold text-gold-glow">{person.name}</div>
              <div className="text-xs" style={{ color: 'var(--color-dim)' }}>
                {zodiac} · {ageOf(person)} 岁
              </div>
            </div>

            {/* 标签栏 */}
            <div className="sticky top-14 z-10 -mx-5 mb-4 flex gap-1.5 overflow-x-auto no-scrollbar px-5 py-2 backdrop-blur">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="shrink-0 rounded-full border px-3 py-1.5 text-sm transition"
                  style={{
                    borderColor: tab === t.key ? 'var(--color-accent)' : 'var(--color-border)',
                    color: tab === t.key ? 'var(--color-accent)' : 'var(--color-text-dim)',
                    background: tab === t.key ? 'var(--color-card)' : 'transparent',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* 概览 */}
            {tab === 'overview' && (
              <div className="space-y-3">
                <Panel title="八字四柱">
                  <div className="grid grid-cols-4 gap-2">
                    {destiny.overview.baziGrid.map((c) => (
                      <div key={c.label} className="glass-cell rounded-xl p-2.5 text-center">
                        <div className="text-[11px]" style={{ color: 'var(--color-dim)' }}>{c.label}</div>
                        <div className="mt-1 font-kai text-lg font-bold leading-tight text-gold-glow">{c.ganZhi}</div>
                        <div className="mt-1 text-[10px]" style={{ color: 'var(--color-dim)' }}>{c.nayin}</div>
                      </div>
                    ))}
                  </div>
                  {!destiny.hasHour && <div className="mt-2"><Note>没填时辰，时柱未算，只排 6 字。</Note></div>}
                </Panel>

                <Panel title="日主与强弱">
                  <div className="flex items-center gap-3">
                    <span className="font-kai text-2xl font-bold text-gold-glow">{destiny.overview.dayMasterLabel}</span>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs"
                      style={{ color: destiny.overview.shenQiang === '强' ? 'var(--color-ok)' : 'var(--color-accent)' }}
                    >
                      身{destiny.overview.shenQiang}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                    {destiny.overview.shenQiangText}
                  </p>
                </Panel>

                <Panel title="三命与主本">
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{destiny.overview.sanMingText}</p>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>{destiny.overview.mainBenText}</p>
                </Panel>

                {(!destiny.hasHour || !destiny.hasGender) && (
                  <div className="space-y-1">
                    {!destiny.hasHour && <Note>缺时辰，时柱相关的内容没算。</Note>}
                    {!destiny.hasGender && <Note>缺性别，大运没算（在「时间」标签里）。</Note>}
                  </div>
                )}
              </div>
            )}

            {/* 性格 */}
            {tab === 'character' && (
              <div className="space-y-3">
                <Panel title="性格底色">
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                    {destiny.character.dayMasterNature}
                  </p>
                </Panel>
                <Panel title="优点">
                  <ul className="space-y-1.5">
                    {destiny.character.strengths.map((s, i) => (
                      <li key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-ok)' }}>✓ {s}</li>
                    ))}
                  </ul>
                </Panel>
                <Panel title="要留意的点">
                  <ul className="space-y-1.5">
                    {destiny.character.weaknesses.map((s, i) => (
                      <li key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>· {s}</li>
                    ))}
                  </ul>
                </Panel>
                <Panel title="一句话">
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{destiny.character.summary}</p>
                </Panel>
              </div>
            )}

            {/* 适合 */}
            {tab === 'suitable' && (
              <div className="space-y-3">
                <Panel title="适合的行业 / 职业">
                  <div className="flex flex-wrap gap-1.5">
                    {destiny.suitable.industries.map((s, i) => (
                      <span key={i} className="chip rounded-full px-2.5 py-1 text-[11px]">{s}</span>
                    ))}
                  </div>
                </Panel>
                <Panel title="适合的方位 / 城市">
                  <div className="flex flex-wrap gap-1.5">
                    {destiny.suitable.directions.map((s, i) => (
                      <span key={i} className="chip rounded-full px-2.5 py-1 text-[11px]">{s}</span>
                    ))}
                  </div>
                </Panel>
                <Panel title="适合的颜色">
                  <div className="flex flex-wrap gap-1.5">
                    {destiny.suitable.colors.map((s, i) => (
                      <span key={i} className="chip rounded-full px-2.5 py-1 text-[11px]">{s}</span>
                    ))}
                  </div>
                </Panel>
                <Panel title="适合的数字">
                  <div className="flex flex-wrap gap-1.5">
                    {destiny.suitable.numbers.map((s, i) => (
                      <span key={i} className="chip rounded-full px-2.5 py-1 text-[11px]">{s}</span>
                    ))}
                  </div>
                </Panel>
                <p className="px-1 text-[11px] leading-relaxed" style={{ color: 'var(--color-dim)' }}>
                  {destiny.suitable.basedOn}
                </p>
              </div>
            )}

            {/* 财运 */}
            {tab === 'wealth' && (
              <div className="space-y-3">
                <Panel title="财运类型">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full px-2.5 py-1 text-xs" style={{ background: 'var(--color-card)', color: 'var(--color-gold)' }}>
                      {destiny.wealth.type}
                    </span>
                    <span className="rounded-full px-2.5 py-1 text-xs" style={{ background: 'var(--color-card)', color: 'var(--color-ok)' }}>
                      {destiny.wealth.style}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{destiny.wealth.text}</p>
                </Panel>
                <Panel title="财运上要留意的">
                  <ul className="space-y-1.5">
                    {destiny.cautions.wealth.map((s, i) => (
                      <li key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>· {s}</li>
                    ))}
                  </ul>
                </Panel>
              </div>
            )}

            {/* 感情 */}
            {tab === 'love' && (
              <div className="space-y-3">
                <Panel title="感情模式">
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{destiny.love.text}</p>
                </Panel>
                <Panel title="感情上要留意的">
                  <ul className="space-y-1.5">
                    {destiny.cautions.love.map((s, i) => (
                      <li key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>· {s}</li>
                    ))}
                  </ul>
                </Panel>
              </div>
            )}

            {/* 健康 */}
            {tab === 'health' && (
              <div className="space-y-3">
                <Panel title="健康薄弱点">
                  <ul className="space-y-1.5">
                    {destiny.health.weakAreas.map((s, i) => (
                      <li key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>· {s}</li>
                    ))}
                  </ul>
                </Panel>
                <Panel title="保养建议">
                  <ul className="space-y-1.5">
                    {destiny.health.tips.map((s, i) => (
                      <li key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-ok)' }}>· {s}</li>
                    ))}
                  </ul>
                </Panel>
              </div>
            )}

            {/* 贵人与小人 */}
            {tab === 'benefactor' && (
              <div className="space-y-3">
                <Panel title="你的贵人">
                  <div className="flex flex-wrap gap-1.5">
                    {destiny.benefactor.zodiacs.map((z, i) => (
                      <span key={i} className="chip rounded-full px-2.5 py-1 text-[11px]" style={{ color: 'var(--color-ok)' }}>
                        {z}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{destiny.benefactor.text}</p>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>{destiny.benefactor.trait}</p>
                </Panel>
                <Panel title="要多留神的属相">
                  <div className="flex flex-wrap gap-1.5">
                    {destiny.villain.zodiacs.map((z, i) => (
                      <span key={i} className="chip rounded-full px-2.5 py-1 text-[11px]" style={{ color: 'var(--color-accent)' }}>
                        {z}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{destiny.villain.text}</p>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>{destiny.villain.trait}</p>
                </Panel>
              </div>
            )}

            {/* 时间 */}
            {tab === 'time' && (
              <div className="space-y-3">
                <Panel title="大运（每柱十年）">
                  {fortune.daYun ? (
                    <div className="space-y-2">
                      <p className="text-xs" style={{ color: 'var(--color-dim)' }}>
                        {fortune.daYun.startAgeLabel} 起运
                      </p>
                      {fortune.daYun.pillars.map((p, i) => (
                        <div key={i} className="glass-cell rounded-lg p-2.5">
                          <div className="flex items-baseline justify-between">
                            <span className="font-kai text-base font-bold text-gold-glow">{p.ganZhi}</span>
                            <span className="text-[11px]" style={{ color: 'var(--color-dim)' }}>{p.ageLabel}</span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>{p.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Note>{fortune.missingNote ?? '缺性别，未算大运'}</Note>
                  )}
                </Panel>

                <Panel title="今年 + 未来几年">
                  <div className="space-y-2">
                    {fortune.recentYears.map((y) => (
                      <div key={y.year} className="glass-cell rounded-lg p-2.5">
                        <div className="flex items-baseline gap-2">
                          <span className="font-kai text-base font-bold" style={{ color: 'var(--color-gold)' }}>{y.year}</span>
                          <span className="text-xs" style={{ color: 'var(--color-dim)' }}>{y.ganZhi}</span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>{y.text}</p>
                      </div>
                    ))}
                  </div>
                </Panel>

                {fortune.importantYears.length > 0 && (
                  <Panel title="往后几年要留意的节点">
                    <div className="space-y-2">
                      {fortune.importantYears.map((y) => (
                        <div key={y.year} className="flex gap-2 text-sm">
                          <span className="shrink-0 font-semibold" style={{ color: 'var(--color-text)' }}>{y.year}</span>
                          <span className="leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>{y.text}</span>
                        </div>
                      ))}
                    </div>
                  </Panel>
                )}
              </div>
            )}

            <p className="mt-6 text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
              结果按主流命理算法生成，仅供娱乐参考，别太当真。
            </p>

            <button
              onClick={closeChart}
              className="tap-target mt-4 w-full rounded-xl py-3 text-sm font-medium"
              style={{ background: 'var(--color-accent)', color: '#0b1020' }}
            >
              知道了
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
