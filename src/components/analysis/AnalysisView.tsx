// 合盘结果：全屏页，总评 + 各体系要点 + 大白话建议。

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../core/storage/store'
import { useUI } from '../../store/ui'
import { computeCompatibility, pairType } from '../../core/relation/compatibility'
import { computeDuo } from '../../core/relation/duo'
import { describePersonality, dayMasterRelation } from '../../core/relation/personality'
import { computeBaZi } from '../../core/rules/bazi'
import { Level } from '../../types/analysis'
import { RELATION_TAG_LABELS } from '../../types/person'
import { EDGE_TAG_LABELS } from '../../types/relation'
import { exportCardImage } from '../../utils/exportImage'
import { exportTextFile } from '../../utils/exportText'
import { WU_XING } from '../../core/rules/fiveElement'
import { RadarChart, RingScore } from './RadarChart'

const LEVEL_COLOR: Record<Level, string> = {
  合: 'var(--color-ok)',
  较合: 'var(--color-ok)',
  一般: 'var(--color-text-dim)',
  需注意: 'var(--color-accent)',
  冲: 'var(--color-danger)',
}

export default function AnalysisView() {
  const pair = useUI((s) => s.analysisPair)
  const closeAnalysis = useUI((s) => s.closeAnalysis)
  const persons = useStore((s) => s.persons)

  const a = persons.find((p) => p.id === pair?.[0])
  const b = persons.find((p) => p.id === pair?.[1])
  const relations = useStore((s) => s.relations)
  const result = useMemo(() => {
    if (!a || !b) return null
    return computeCompatibility(a, b, pairType(a, b, relations))
  }, [a, b, relations])

  const duo = useMemo(() => {
    if (!result) return null
    return computeDuo(result.a, result.b, result.mode)
  }, [result])

  const personality = useMemo(() => {
    if (!a || !b) return null
    const pa = describePersonality(a)
    const pb = describePersonality(b)
    const stemA = computeBaZi({ year: a.birthYear, month: a.birthMonth, day: a.birthDay, hour: a.hour, minute: a.minute })
      .dayPillar.ganZhi.stem
    const stemB = computeBaZi({ year: b.birthYear, month: b.birthMonth, day: b.birthDay, hour: b.hour, minute: b.minute })
      .dayPillar.ganZhi.stem
    return { pa, pb, relation: dayMasterRelation(stemA, stemB) }
  }, [a, b])
  // 可视化数据：五维契合雷达 + 五行能量双盘 + 合冲速览标签
  const viz = useMemo(() => {
    if (!a || !b || !result) return null
    const ba = computeBaZi({ year: a.birthYear, month: a.birthMonth, day: a.birthDay, hour: a.hour, minute: a.minute })
    const bb = computeBaZi({ year: b.birthYear, month: b.birthMonth, day: b.birthDay, hour: b.hour, minute: b.minute })
    const radar = result.sections.map((s) => ({
      label: s.systemLabel.replace('（娱乐参考）', ''),
      value: Math.round(((s.score + 20) / 40) * 100),
    }))
    const wuxingA = WU_XING.map((w) => ({ label: w, value: Math.min(100, ba.fiveElements[w] * 25) }))
    const wuxingB = WU_XING.map((w) => ({ label: w, value: Math.min(100, bb.fiveElements[w] * 25) }))
    const he = new Set<string>()
    const chong = new Set<string>()
    for (const s of result.sections) {
      for (const p of s.points) {
        if (p.includes('六合')) he.add('六合')
        if (p.includes('三合')) he.add('三合')
        if (p.includes('天干相合')) he.add('天干相合')
        if (p.includes('五行互补')) he.add('五行互补')
        if (p.includes('同属相')) he.add('同属相')
        if (p.includes('六冲')) chong.add('六冲')
        if (p.includes('相害')) chong.add('相害')
        if (p.includes('相刑')) chong.add('相刑')
      }
    }
    return { radar, wuxingA, wuxingB, he: [...he], chong: [...chong] }
  }, [a, b, result])

  const edge = pair
    ? relations.find((r) => (r.a === pair[0] && r.b === pair[1]) || (r.a === pair[1] && r.b === pair[0]))
    : undefined

  const handleExport = () => {
    if (!result || !duo) return
    exportCardImage({
      filename: `${result.a.name}-${result.b.name}-合盘.png`,
      title: result.mode === 'hepan' ? '两人合盘' : '关系发展',
      subtitle: `${result.a.name} × ${result.b.name} · 综合 ${result.overallScore} 分`,
      sections: [
        { heading: '总评', lines: [result.headline] },
        { heading: '谁旺谁 · 谁克谁', lines: [duo.wangKe] },
        { heading: '适合一起做什么', lines: duo.together.good },
        { heading: '相处模式', lines: [duo.dynamic] },
        { heading: '怎么相处', lines: [result.advice.fit, result.advice.caution, result.advice.how] },
      ],
      footer: '综合多种算法，仅供娱乐参考',
    })
  }

  const handleExportText = () => {
    if (!result || !duo || !personality) return
    exportTextFile({
      filename: `${result.a.name}-${result.b.name}-合盘.txt`,
      title: result.mode === 'hepan' ? '两人合盘' : '关系发展',
      subtitle: `${result.a.name} × ${result.b.name} · 综合 ${result.overallScore} 分`,
      sections: [
        { heading: '总评', lines: [result.headline] },
        { heading: '性格契合', lines: [`${personality.pa.dayMaster.label} ↔ ${personality.pb.dayMaster.label}`, personality.relation] },
        { heading: '谁旺谁 · 谁克谁', lines: [duo.wangKe] },
        { heading: '适合一起做什么', lines: duo.together.good },
        { heading: '不太适合', lines: duo.together.avoid },
        { heading: '相处模式', lines: [duo.dynamic] },
        { heading: '怎么相处', lines: [result.advice.fit, result.advice.caution, result.advice.how] },
        {
          heading: '各体系怎么看',
          lines: result.sections.flatMap((s) => [s.systemLabel, ...s.points.map((p) => `　${p}`)]),
        },
      ],
      footer: '综合多种算法，仅供娱乐参考',
    })
  }

  return (
    <AnimatePresence>
      {result && (
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
              <h1 className="font-kai text-lg font-bold text-gold-glow">
                {result.mode === 'hepan' ? '合盘结果' : '关系发展'}
              </h1>
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
                  onClick={closeAnalysis}
                  className="tap-target flex items-center justify-center rounded-full text-xl"
                  style={{ color: 'var(--color-text-dim)' }}
                  aria-label="关闭"
                >
                  ✕
                </button>
              </div>
            </header>

            {/* 双方 */}
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="text-center">
                <div className="font-kai text-lg font-semibold text-gold-glow">
                  {result.a.name}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-dim)' }}>
                  {result.a.isSelf ? '我' : `你的${RELATION_TAG_LABELS[result.a.relationTag]}`}
                </div>
              </div>
              <div className="text-2xl" style={{ color: 'var(--color-gold)' }}>
                ⚖
              </div>
              <div className="text-center">
                <div className="font-kai text-lg font-semibold text-gold-glow">
                  {result.b.name}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-dim)' }}>
                  {result.b.isSelf ? '我' : `你的${RELATION_TAG_LABELS[result.b.relationTag]}`}
                </div>
              </div>
            </div>

            {/* 两人关系身份 */}
            <div
              className="mb-4 flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              <span style={{ color: 'var(--color-accent)' }}>🔗</span>
              {edge ? (
                <span>
                  他们彼此是 <b style={{ color: 'var(--color-accent-2)' }}>{EDGE_TAG_LABELS[edge.tag]}</b>
                </span>
              ) : (
                <span style={{ color: 'var(--color-text-dim)' }}>未标注彼此关系（可在详情里「＋ 加关系」）</span>
              )}
            </div>

            {/* 总分 */}
            <div className="glass-panel p-5 text-center">
              <div className="ornament mx-auto max-w-[220px] text-xs">✦</div>
              <div className="mt-4">
                <RingScore value={result.overallScore} size={150} stroke={11}>
                  <div className="text-center">
                    <div className="font-kai text-5xl font-bold leading-none text-gold-glow">
                      {result.overallScore}
                    </div>
                    <div className="mt-1 text-[11px]" style={{ color: 'var(--color-dim)' }}>
                      综合分
                    </div>
                  </div>
                </RingScore>
              </div>
              <div className="mt-3 text-sm" style={{ color: LEVEL_COLOR[result.overallLevel] }}>
                {result.headline}
              </div>
              <p className="mt-3 text-[11px]" style={{ color: 'var(--color-dim)' }}>
                综合多种算法，仅供娱乐参考，别太当真
              </p>
            </div>

            {/* 合冲速览 */}
            {viz && (viz.he.length > 0 || viz.chong.length > 0) && (
              <div className="glass-panel mt-4 p-4">
                <div className="mb-2 text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                  合冲速览
                </div>
                <div className="flex flex-wrap gap-2">
                  {viz.he.map((t) => (
                    <span
                      key={`he-${t}`}
                      className="rounded-full border px-3 py-1 text-xs font-medium"
                      style={{ color: 'var(--color-ok)', borderColor: 'var(--color-ok)' }}
                    >
                      合 · {t}
                    </span>
                  ))}
                  {viz.chong.map((t) => (
                    <span
                      key={`chong-${t}`}
                      className="rounded-full border px-3 py-1 text-xs font-medium"
                      style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                    >
                      冲 · {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 五维契合雷达 */}
            {viz && (
              <div className="glass-panel mt-4 p-4">
                <div className="mb-1 text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                  五维契合雷达
                </div>
                <RadarChart data={viz.radar} size={260} />
                <p className="mt-1 text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
                  生肖 / 纳音 / 灵数 / 星座 / 八字，越靠外越契合
                </p>
              </div>
            )}

            {/* 五行能量双盘 */}
            {viz && (
              <div className="glass-panel mt-4 p-4">
                <div className="mb-1 text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                  五行能量对比
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <RadarChart data={viz.wuxingA} size={150} color="var(--color-jade)" fill="rgba(111, 208, 189, 0.14)" />
                    <div className="mt-1 text-xs" style={{ color: 'var(--color-text-dim)' }}>
                      {result.a.name}
                    </div>
                  </div>
                  <div className="text-center">
                    <RadarChart data={viz.wuxingB} size={150} color="var(--color-gold-soft)" fill="rgba(224, 197, 143, 0.14)" />
                    <div className="mt-1 text-xs" style={{ color: 'var(--color-text-dim)' }}>
                      {result.b.name}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 性格契合 */}
            {personality && (
              <div className="glass-panel mt-4 p-4">
                <div className="mb-2 text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                  性格契合（八字日主）
                </div>
                <div className="flex items-center justify-center gap-3 text-sm">
                  <div className="flex-1 text-center">
                    <div className="font-bold" style={{ color: 'var(--color-accent)' }}>
                      {personality.pa.dayMaster.label}
                    </div>
                    <div className="mt-0.5 text-[11px]" style={{ color: 'var(--color-text-dim)' }}>
                      {personality.pa.dayMaster.nature}
                    </div>
                  </div>
                  <div className="text-lg" style={{ color: 'var(--color-text-dim)' }}>↔</div>
                  <div className="flex-1 text-center">
                    <div className="font-bold" style={{ color: 'var(--color-accent)' }}>
                      {personality.pb.dayMaster.label}
                    </div>
                    <div className="mt-0.5 text-[11px]" style={{ color: 'var(--color-text-dim)' }}>
                      {personality.pb.dayMaster.nature}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                  {personality.relation}
                </p>
              </div>
            )}

            {/* 谁旺谁 / 一起做什么 / 相处模式 */}
            {duo && (
              <div className="mt-4 space-y-2">
                <div className="glass-panel p-4">
                  <div className="mb-1 text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>
                    谁旺谁 · 谁克谁
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                    {duo.wangKe}
                  </p>
                </div>
                <div className="glass-panel p-4">
                  <div className="mb-1 text-xs font-semibold" style={{ color: 'var(--color-ok)' }}>
                    适合一起做什么
                  </div>
                  <ul className="space-y-1">
                    {duo.together.good.map((g, i) => (
                      <li key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-ok)' }}>✓ {g}</li>
                    ))}
                  </ul>
                  <div className="mt-2 text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                    不太适合
                  </div>
                  <ul className="mt-1 space-y-1">
                    {duo.together.avoid.map((g, i) => (
                      <li key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>· {g}</li>
                    ))}
                  </ul>
                </div>
                <div className="glass-panel p-4">
                  <div className="mb-1 text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                    相处模式（谁主导）
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                    {duo.dynamic}
                  </p>
                </div>
              </div>
            )}

            {/* 三段建议 */}
            <div className="mt-4 space-y-2">
              <div className="glass-panel p-4">
                <div className="mb-1 text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                  {result.mode === 'hepan' ? '感情合不合' : '合不合得来'}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                  {result.advice.fit}
                </p>
              </div>
              <div className="glass-panel p-4">
                <div className="mb-1 text-xs font-semibold" style={{ color: 'var(--color-danger)' }}>
                  注意什么
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                  {result.advice.caution}
                </p>
              </div>
              <div className="glass-panel p-4">
                <div className="mb-1 text-xs font-semibold" style={{ color: 'var(--color-ok)' }}>
                  {result.mode === 'hepan' ? '怎么经营这段感情' : '怎么相处'}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                  {result.advice.how}
                </p>
              </div>
            </div>

            {/* 关系走势（仅非伴侣的关系发展） */}
            {result.trajectory && (
              <div className="glass-panel mt-4 p-4">
                <div className="mb-2 text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                  往后几年怎么走
                </div>
                <div className="space-y-2">
                  {result.trajectory.years.map((y) => (
                    <div key={y.year} className="flex gap-2 text-sm">
                      <span className="shrink-0 font-semibold" style={{ color: 'var(--color-text)' }}>
                        {y.label}
                      </span>
                      <span className="leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
                        {y.note}
                      </span>
                    </div>
                  ))}
                </div>
                <p
                  className="mt-3 border-t pt-2 text-xs leading-relaxed"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  {result.trajectory.summary}
                </p>
              </div>
            )}

            {/* 各体系要点 */}
            <div className="mt-4">
              <h2 className="mb-2 px-1 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                各体系怎么看
              </h2>
              <div className="space-y-2">
                {result.sections.map((sec) => (
                  <div key={sec.system} className="glass-panel p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {sec.systemLabel}
                      </span>
                      <span className="text-xs" style={{ color: LEVEL_COLOR[sec.level] }}>
                        {sec.level}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {sec.points.map((pt, i) => (
                        <li key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
                          · {pt}
                        </li>
                      ))}
                    </ul>
                    {sec.missingNote && (
                      <p className="mt-2 text-xs" style={{ color: 'var(--color-accent)' }}>
                        ⚠ {sec.missingNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 缺时辰总说明 */}
            {result.missingNotes.length > 0 && (
              <div className="glass-panel mt-4 p-4">
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-accent)' }}>
                  {result.missingNotes.map((n) => `⚠ ${n}`).join('；')}
                  （补上出生时辰可看更全）
                </p>
              </div>
            )}

            <button
              onClick={closeAnalysis}
              className="tap-target mt-6 w-full rounded-xl py-3 text-sm font-medium"
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
