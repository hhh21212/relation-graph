// 人员详情 bottom sheet：基本信息 + 命理速览 + 他的人际关系 + 操作。

import { useMemo } from 'react'
import { RELATION_TAG_LABELS } from '../../types/person'
import { EDGE_TAG_LABELS } from '../../types/relation'
import { useStore } from '../../core/storage/store'
import { useUI } from '../../store/ui'
import { computeBaZi, Pillar } from '../../core/rules/bazi'
import { zodiacOf } from '../../core/rules/zodiac'
import { describePersonality } from '../../core/relation/personality'
import { ageOf, formatBirthDate, formatHour } from '../../utils/format'
import Sheet from '../ui/Sheet'
import Button from '../ui/Button'

function PillarCell({ label, pillar }: { label: string; pillar: Pillar | null }) {
  return (
    <div className="glass-cell rounded-xl p-2.5 text-center">
      <div className="text-[11px]" style={{ color: 'var(--color-dim)' }}>
        {label}
      </div>
      {pillar ? (
        <>
          <div className="mt-1 font-kai text-lg font-bold leading-tight text-gold-glow">
            {pillar.name}
          </div>
          <div className="mt-1 text-[10px]" style={{ color: 'var(--color-dim)' }}>
            {pillar.nayin}
          </div>
        </>
      ) : (
        <div className="mt-1 text-[11px] leading-snug" style={{ color: 'var(--color-dim)' }}>
          缺时辰
          <br />
          未算
        </div>
      )}
    </div>
  )
}

export default function PersonDetailSheet() {
  const detailId = useUI((s) => s.detailId)
  const closeDetail = useUI((s) => s.closeDetail)
  const openEdit = useUI((s) => s.openEdit)
  const openSelf = useUI((s) => s.openSelf)
  const startCompare = useUI((s) => s.startCompare)
  const startRelate = useUI((s) => s.startRelate)
  const openChart = useUI((s) => s.openChart)
  const persons = useStore((s) => s.persons)
  const relations = useStore((s) => s.relations)
  const removePerson = useStore((s) => s.removePerson)
  const removeRelation = useStore((s) => s.removeRelation)

  const person = persons.find((p) => p.id === detailId)
  const bazi = useMemo(() => {
    if (!person) return null
    return computeBaZi({ year: person.birthYear, month: person.birthMonth, day: person.birthDay, hour: person.hour, minute: person.minute })
  }, [person])

  const profile = useMemo(() => (person ? describePersonality(person) : null), [person])

  // 这个人涉及的关系边
  const myRelations = person ? relations.filter((r) => r.a === person.id || r.b === person.id) : []

  const otherNameOf = (r: { a: string; b: string }) => {
    const otherId = r.a === person!.id ? r.b : r.a
    return persons.find((p) => p.id === otherId)?.name ?? '？'
  }

  const handleDelete = () => {
    if (!person || person.isSelf) return
    if (confirm(`确定删除「${person.name}」吗？`)) {
      removePerson(person.id)
      closeDetail()
    }
  }

  return (
    <Sheet open={!!person} onClose={closeDetail} title={RELATION_TAG_LABELS[person?.relationTag ?? 'other']}>
      {person && bazi && (
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="font-kai text-2xl font-bold text-gold-glow">
                {person.name}
                {person.isSelf && <span className="ml-1 text-xs" style={{ color: 'var(--color-gold)' }}>（我）</span>}
              </div>
              <div className="mt-1 text-xs" style={{ color: 'var(--color-dim)' }}>
                {formatBirthDate(person)} · {ageOf(person)} 岁 · {formatHour(person)}
                {person.birthPlace ? ` · ${person.birthPlace}` : ''}
              </div>
            </div>
            <div className="text-2xl">{zodiacOf(bazi.zodiac)}</div>
          </div>

          {/* 命理速览 */}
          <div className="glass-panel space-y-3 p-4">
            <div className="font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>
              ✦ 八字速览（{bazi.hasHour ? '八 字' : '六 字'}）
            </div>
            <div className="grid grid-cols-4 gap-2">
              <PillarCell label="年柱" pillar={bazi.yearPillar} />
              <PillarCell label="月柱" pillar={bazi.monthPillar} />
              <PillarCell label="日柱" pillar={bazi.dayPillar} />
              <PillarCell label="时柱" pillar={bazi.hourPillar} />
            </div>
            {!bazi.hasHour && (
              <p className="pt-1 text-xs" style={{ color: 'var(--color-dim)' }}>
                没填时辰，时柱未算，只排 6 字。补上时辰可看更全。
              </p>
            )}
          </div>

          {/* 性格画像 */}
          {profile && (
            <div className="glass-panel space-y-3 p-4">
              <div className="font-kai text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>
                ✦ 性格画像
              </div>

              {/* 日主气质 */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold" style={{ color: 'var(--color-gold)' }}>
                    {profile.dayMaster.label}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-dim)' }}>
                    {profile.dayMaster.nature}
                  </span>
                </div>
                <ul className="mt-2 space-y-1">
                  {profile.dayMaster.traits.map((t, i) => (
                    <li key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-moon)' }}>
                      · {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 五行阴阳（金口诀式） */}
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-dim)' }}>
                {profile.wuXingYinYang.line}
              </p>

              {/* 三命 + 主本（禄命） */}
              <div className="glass-cell rounded-lg p-3">
                <div className="text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>
                  禄命 · 三命与主本
                </div>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--color-moon)' }}>
                  {profile.sanMing.text}
                </p>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--color-dim)' }}>
                  {profile.mainBen.text}
                </p>
              </div>

              {/* 十神 */}
              <div>
                <div className="text-xs font-semibold" style={{ color: 'var(--color-dim)' }}>
                  十神主导 · <span style={{ color: 'var(--color-gold)' }}>{profile.shiShen.dominant}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--color-moon)' }}>
                  {profile.shiShen.dominantText}
                </p>
              </div>

              {/* 神煞 */}
              {profile.shenSha.lines.length > 0 && (
                <div>
                  <div className="text-xs font-semibold" style={{ color: 'var(--color-dim)' }}>
                    命中神煞 · 性格信号
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {profile.shenSha.lines.map((l, i) => (
                      <span key={i} className="chip rounded-full px-2.5 py-1 text-[11px] leading-snug">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 五行 */}
              {profile.wuXing.lines.length > 0 && (
                <div>
                  <div className="text-xs font-semibold" style={{ color: 'var(--color-text-dim)' }}>
                    五行
                  </div>
                  <ul className="mt-1 space-y-1">
                    {profile.wuXing.lines.map((l, i) => (
                      <li key={i} className="text-xs leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 生肖 / 星座 / 灵数 */}
              <div className="space-y-2 border-t pt-2" style={{ borderColor: 'var(--color-border)' }}>
                <div className="text-xs">
                  <b style={{ color: 'var(--color-text)' }}>生肖 · {profile.zodiac.animal}：</b>
                  <span style={{ color: 'var(--color-text-dim)' }}>{profile.zodiac.traits.join('、')}</span>
                </div>
                <div className="text-xs">
                  <b style={{ color: 'var(--color-text)' }}>星座 · {profile.west.sign}：</b>
                  <span style={{ color: 'var(--color-text-dim)' }}>{profile.west.traits.join('、')}</span>
                </div>
                <div className="text-xs">
                  <b style={{ color: 'var(--color-text)' }}>灵数 · {profile.numerology.number}：</b>
                  <span style={{ color: 'var(--color-text-dim)' }}>{profile.numerology.traits.join('、')}</span>
                </div>
              </div>

              {/* 怎么相处 */}
              <div className="glass-cell rounded-lg p-3">
                <div className="text-xs font-semibold" style={{ color: 'var(--color-ok)' }}>
                  怎么和 TA 相处
                </div>
                <ul className="mt-1 space-y-1">
                  {profile.getAlongTips.map((t, i) => (
                    <li key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-moon)' }}>
                      · {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 他的人际关系 */}
          {!person.isSelf && (
            <div className="glass-panel p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: 'var(--color-dim)' }}>
                  关系
                </span>
                <button
                  onClick={() => startRelate(person.id)}
                  className="text-xs font-medium"
                  style={{ color: 'var(--color-gold)' }}
                >
                  ＋ 加关系
                </button>
              </div>
              {myRelations.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--color-dim)' }}>
                  还没和谁标注关系，点右上「＋ 加关系」连起来。
                </p>
              ) : (
                <div className="space-y-1.5">
                  {myRelations.map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--color-moon)' }}>
                        和 <b style={{ color: 'var(--color-accent-2)' }}>{otherNameOf(r)}</b> 是{' '}
                        {EDGE_TAG_LABELS[r.tag]}
                      </span>
                      <button
                        onClick={() => removeRelation(r.id)}
                        className="tap-target flex h-7 w-7 items-center justify-center rounded-full text-sm"
                        style={{ color: 'var(--color-danger)' }}
                        aria-label="删除关系"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {person.note && (
            <div className="glass-panel p-4">
              <div className="mb-1 text-xs font-semibold" style={{ color: 'var(--color-dim)' }}>
                备注
              </div>
              <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-moon)' }}>
                {person.note}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button className="flex-1" onClick={() => openChart(person.id)}>
              📜 看命盘
            </Button>
            <Button variant="ghost" onClick={() => startCompare(person.id)}>
              {person.relationTag === 'partner' ? '⚖️ 合盘' : '🔗 看关系'}
            </Button>
            <Button variant="ghost" onClick={() => (person.isSelf ? openSelf() : openEdit(person.id))}>
              编辑
            </Button>
            {!person.isSelf && (
              <Button variant="danger" onClick={handleDelete}>
                删除
              </Button>
            )}
          </div>
        </div>
      )}
    </Sheet>
  )
}
