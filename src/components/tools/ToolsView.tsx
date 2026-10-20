// 实用工具 Tab：万年历 / 择日 / 生日查询 / 节气 / 本命年。
// 黄历数据全部来自 lunar-javascript（寿星天文历），只做展示、不自行编造。

import { useMemo, useState } from 'react'
import {
  dayAlmanac,
  monthGrid,
  yearJieQi,
  birthInfo,
  taiSuiOf,
  taiSuiYears,
  ACTIVITIES,
  suitableDays,
  type Activity,
  type DayAlmanac,
} from '../../core/rules/almanac'
import { ZODIAC_ANIMALS } from '../../core/rules/zodiac'
import GroupDistribution from './GroupDistribution'
import ComparePeople from './ComparePeople'
import RomanceTool from './RomanceTool'
import QianTool from './QianTool'
import LiuYaoTool from './LiuYaoTool'
import DayunTool from './DayunTool'
import TarotTool from './TarotTool'
import ToolboxView from './ToolboxView'
import XingZuoTool from './XingZuoTool'
import ZiWeiTool from './ZiWeiTool'
import BaZiTool from './BaZiTool'

type SubTab =
  | 'calendar'
  | 'zheri'
  | 'birth'
  | 'jieqi'
  | 'benming'
  | 'group'
  | 'compare'
  | 'love'
  | 'qian'
  | 'liuyao'
  | 'dayun'
  | 'tarot'
  | 'toolbox'
  | 'bazi'
  | 'xingzuo'
  | 'ziwei'

const SUBTABS: { key: SubTab; label: string; icon: string }[] = [
  { key: 'calendar', label: '万年历', icon: '📅' },
  { key: 'zheri', label: '择日', icon: '🗓️' },
  { key: 'birth', label: '生日查询', icon: '🎂' },
  { key: 'jieqi', label: '节气', icon: '🌱' },
  { key: 'benming', label: '本命年', icon: '🐉' },
  { key: 'group', label: '群体分布', icon: '🧮' },
  { key: 'compare', label: '多人对比', icon: '👥' },
  { key: 'love', label: '桃花/感情', icon: '💞' },
  { key: 'qian', label: '求签', icon: '🎋' },
  { key: 'liuyao', label: '六爻摇卦', icon: '🪙' },
  { key: 'dayun', label: '大运流年', icon: '📈' },
  { key: 'tarot', label: '塔罗', icon: '🎴' },
  { key: 'toolbox', label: '百宝箱', icon: '🎁' },
  { key: 'bazi', label: '八字', icon: '☯️' },
  { key: 'xingzuo', label: '星座', icon: '♈' },
  { key: 'ziwei', label: '紫微斗数', icon: '🪐' },
]

const WEEK_HEAD = ['日', '一', '二', '三', '四', '五', '六']

function todayYMD() {
  const n = new Date()
  return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() }
}

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

function Chip({ text, tone }: { text: string; tone?: 'good' | 'bad' | 'dim' }) {
  const color =
    tone === 'good' ? 'var(--color-ok)' : tone === 'bad' ? 'var(--color-accent)' : 'var(--color-text-dim)'
  return (
    <span className="chip rounded-full px-2.5 py-1 text-[11px]" style={{ color }}>
      {text}
    </span>
  )
}

function MonthNav({
  y,
  m,
  onPrev,
  onNext,
  onToday,
  label,
}: {
  y: number
  m: number
  onPrev: () => void
  onNext: () => void
  onToday?: () => void
  label?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onPrev}
        className="tap-target flex h-9 w-9 items-center justify-center rounded-full border"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-dim)' }}
        aria-label="上一个"
      >
        ‹
      </button>
      <div className="flex items-center gap-2">
        <span className="font-kai text-base font-bold text-gold-glow">
          {label ?? `${y}年${m}月`}
        </span>
        {onToday && (
          <button
            onClick={onToday}
            className="rounded-full border px-2.5 py-1 text-[11px]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-dim)' }}
          >
            今天
          </button>
        )}
      </div>
      <button
        onClick={onNext}
        className="tap-target flex h-9 w-9 items-center justify-center rounded-full border"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-dim)' }}
        aria-label="下个月"
      >
        ›
      </button>
    </div>
  )
}

export default function ToolsView() {
  const [tab, setTab] = useState<SubTab>('calendar')
  return (
    <div className="flex h-full flex-col">
      <header className="safe-top px-5 pt-3 pb-2">
        <h1 className="font-kai text-lg font-bold text-gold-glow">实用工具</h1>
        <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
          黄历、择日、生日与节气查询 · 仅供参考
        </p>
      </header>

      {/* 子标签 */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 pb-2">
        {SUBTABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="tap-target shrink-0 rounded-full border px-3 py-1.5 text-xs transition"
            style={{
              borderColor: tab === t.key ? 'var(--color-accent)' : 'var(--color-border)',
              color: tab === t.key ? 'var(--color-accent)' : 'var(--color-text-dim)',
              background: tab === t.key ? 'var(--color-card)' : 'transparent',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-5 pb-5">
        {tab === 'calendar' && <CalendarTab />}
        {tab === 'zheri' && <ZeRiTab />}
        {tab === 'birth' && <BirthTab />}
        {tab === 'jieqi' && <JieQiTab />}
        {tab === 'benming' && <BenMingTab />}
        {tab === 'group' && <GroupDistribution />}
        {tab === 'compare' && <ComparePeople />}
        {tab === 'love' && <RomanceTool />}
        {tab === 'qian' && <QianTool />}
        {tab === 'liuyao' && <LiuYaoTool />}
        {tab === 'dayun' && <DayunTool />}
        {tab === 'tarot' && <TarotTool />}
        {tab === 'toolbox' && <ToolboxView />}
        {tab === 'bazi' && <BaZiTool />}
        {tab === 'xingzuo' && <XingZuoTool />}
        {tab === 'ziwei' && <ZiWeiTool />}
      </div>
    </div>
  )
}

// ---------------- 万年历 ----------------
function CalendarTab() {
  const today = todayYMD()
  const [ym, setYm] = useState({ y: today.y, m: today.m })
  const [selected, setSelected] = useState<number | null>(ym.y === today.y && ym.m === today.m ? today.d : null)

  const days = useMemo(() => monthGrid(ym.y, ym.m), [ym])
  const offset = new Date(ym.y, ym.m - 1, 1).getDay() // 0=周日
  const jieQi = useMemo(() => {
    const map = new Map<number, string>()
    for (const j of yearJieQi(ym.y)) if (j.month === ym.m) map.set(j.day, j.name)
    return map
  }, [ym])

  const detail = selected ? days.find((d) => d.solar.day === selected) : null

  const goToday = () => {
    setYm({ y: today.y, m: today.m })
    setSelected(today.d)
  }
  const prev = () => setYm(({ y, m }) => (m === 1 ? { y: y - 1, m: 12 } : { y, m: m - 1 }))
  const next = () => setYm(({ y, m }) => (m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 }))

  return (
    <div className="space-y-3">
      <div className="glass-panel p-4">
        <MonthNav y={ym.y} m={ym.m} onPrev={prev} onNext={next} onToday={goToday} />

        <div className="mt-3 grid grid-cols-7 text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
          {WEEK_HEAD.map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((d) => {
            const isToday = ym.y === today.y && ym.m === today.m && d.solar.day === today.d
            const isSel = selected === d.solar.day
            return (
              <button
                key={d.solar.day}
                onClick={() => setSelected(d.solar.day)}
                className="tap-target relative flex flex-col items-center justify-center rounded-lg py-1.5 transition"
                style={{
                  background: isSel ? 'var(--color-accent)' : isToday ? 'var(--color-card)' : 'transparent',
                  color: isSel ? '#0b1020' : isToday ? 'var(--color-gold)' : 'var(--color-text)',
                  border: isToday ? '1px solid var(--color-gold)' : '1px solid transparent',
                }}
              >
                <span className="text-sm font-medium leading-none">{d.solar.day}</span>
                <span
                  className="mt-1 text-[10px] leading-none"
                  style={{ color: isSel ? 'rgba(11,16,32,0.7)' : 'var(--color-dim)' }}
                >
                  {jieQi.has(d.solar.day) ? jieQi.get(d.solar.day) : d.lunar.day}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {detail && <DayDetail d={detail} />}

      <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
        宜忌按传统黄历，仅供娱乐参考。
      </p>
    </div>
  )
}

function DayDetail({ d }: { d: DayAlmanac }) {
  return (
    <div className="space-y-3">
      <Panel title={`${d.solar.month}月${d.solar.day}日 · ${d.week}`}>
        <div className="space-y-1 text-sm" style={{ color: 'var(--color-text)' }}>
          <div>
            农历：<b className="font-kai text-gold-glow">{d.lunar.year}年 {d.lunar.month}月{d.lunar.day}</b>
          </div>
          <div style={{ color: 'var(--color-text-dim)' }}>
            干支：{d.ganZhi.year}年 {d.ganZhi.month}月 {d.ganZhi.day}日
          </div>
          <div style={{ color: 'var(--color-text-dim)' }}>
            冲 {d.chongShengXiao} · 纳音 {d.naYin} · 星宿 {d.xiu}
          </div>
        </div>
        {d.jieQi && (
          <p className="mt-1 text-xs" style={{ color: 'var(--color-ok)' }}>
            🌱 今日节气：{d.jieQi}
          </p>
        )}
      </Panel>

      <Panel title="宜">
        <div className="flex flex-wrap gap-1.5">
          {d.yi.map((x, i) => (
            <Chip key={i} text={x} tone="good" />
          ))}
        </div>
      </Panel>

      <Panel title="忌">
        <div className="flex flex-wrap gap-1.5">
          {d.ji.map((x, i) => (
            <Chip key={i} text={x} tone="bad" />
          ))}
        </div>
      </Panel>

      {(d.jiShen.length > 0 || d.xiongSha.length > 0) && (
        <Panel title="吉神 · 凶煞">
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-1.5">
              {d.jiShen.map((x, i) => (
                <Chip key={i} text={x} tone="good" />
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {d.xiongSha.map((x, i) => (
                <Chip key={i} text={x} tone="bad" />
              ))}
            </div>
          </div>
        </Panel>
      )}

      <Panel title="方位">
        <div className="grid grid-cols-3 gap-2 text-center text-sm" style={{ color: 'var(--color-text)' }}>
          <div className="glass-cell rounded-lg py-2">
            <div className="text-[11px]" style={{ color: 'var(--color-dim)' }}>财神</div>
            <div>{d.positions.cai}</div>
          </div>
          <div className="glass-cell rounded-lg py-2">
            <div className="text-[11px]" style={{ color: 'var(--color-dim)' }}>喜神</div>
            <div>{d.positions.xi}</div>
          </div>
          <div className="glass-cell rounded-lg py-2">
            <div className="text-[11px]" style={{ color: 'var(--color-dim)' }}>福神</div>
            <div>{d.positions.fu}</div>
          </div>
        </div>
      </Panel>

      {d.pengZu.length > 0 && (
        <Panel title="彭祖百忌">
          <ul className="space-y-1">
            {d.pengZu.map((x, i) => (
              <li key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
                · {x}
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  )
}

// ---------------- 择日 ----------------
function ZeRiTab() {
  const today = todayYMD()
  const [activity, setActivity] = useState<Activity>('marry')
  const [ym, setYm] = useState({ y: today.y, m: today.m })

  const days = useMemo(() => suitableDays(ym.y, ym.m, activity), [ym, activity])
  const act = ACTIVITIES.find((a) => a.key === activity)!

  const prev = () => setYm(({ y, m }) => (m === 1 ? { y: y - 1, m: 12 } : { y, m: m - 1 }))
  const next = () => setYm(({ y, m }) => (m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 }))

  return (
    <div className="space-y-3">
      <div className="glass-panel p-4">
        <div className="mb-3 text-xs" style={{ color: 'var(--color-text-dim)' }}>
          想办什么事，看哪天合适：
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ACTIVITIES.map((a) => (
            <button
              key={a.key}
              onClick={() => setActivity(a.key)}
              className="tap-target rounded-full border px-3 py-1.5 text-xs transition"
              style={{
                borderColor: activity === a.key ? 'var(--color-accent)' : 'var(--color-border)',
                color: activity === a.key ? 'var(--color-accent)' : 'var(--color-text-dim)',
                background: activity === a.key ? 'var(--color-card)' : 'transparent',
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel p-4">
        <MonthNav y={ym.y} m={ym.m} onPrev={prev} onNext={next} />
        <p className="mt-2 text-xs" style={{ color: 'var(--color-dim)' }}>
          {act.label}宜看：{act.keywords.join('、')}
        </p>

        <div className="mt-3 space-y-2">
          {days.length === 0 ? (
            <p className="py-6 text-center text-sm" style={{ color: 'var(--color-dim)' }}>
              这个月没有特别合适的日子，换个活动或月份看看
            </p>
          ) : (
            days.map((d) => (
              <div key={d.day} className="glass-cell rounded-lg p-3">
                <div className="flex items-baseline justify-between">
                  <span className="font-kai text-base font-bold text-gold-glow">
                    {ym.m}月{d.day}日
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--color-dim)' }}>
                    {d.almanac.week} · {d.almanac.ganZhi.day}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {d.matched.map((x, i) => (
                    <Chip key={i} text={`宜 ${x}`} tone="good" />
                  ))}
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {d.avoid.length > 0 ? (
                    d.avoid.map((x, i) => <Chip key={i} text={`忌 ${x}`} tone="bad" />)
                  ) : (
                    <Chip text="无相冲忌讳" tone="dim" />
                  )}
                </div>
                <p className="mt-1.5 text-xs" style={{ color: 'var(--color-dim)' }}>
                  冲 {d.almanac.chongShengXiao}（属{d.almanac.chongShengXiao}的朋友当天宜避开）
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------- 生日查询 ----------------
function BirthTab() {
  const today = todayYMD()
  const [date, setDate] = useState(
    `${today.y}-${String(today.m).padStart(2, '0')}-${String(today.d).padStart(2, '0')}`,
  )

  const [y, m, d] = date.split('-').map(Number)
  const info = useMemo(() => (y && m && d ? birthInfo(y, m, d) : null), [y, m, d])
  const taiSui = useMemo(() => (info ? taiSuiOf(info.zodiacBranch, today.y) : null), [info, today.y])

  return (
    <div className="space-y-3">
      <div className="glass-panel p-4">
        <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-dim)' }}>
          选一个公历生日
        </span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        />
      </div>

      {info && (
        <>
          <Panel title="基本信息">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="glass-cell rounded-lg py-3">
                <div className="text-[11px]" style={{ color: 'var(--color-dim)' }}>生肖</div>
                <div className="mt-1 font-kai text-xl font-bold text-gold-glow">{info.shengXiao}</div>
              </div>
              <div className="glass-cell rounded-lg py-3">
                <div className="text-[11px]" style={{ color: 'var(--color-dim)' }}>星座</div>
                <div className="mt-1 font-kai text-xl font-bold text-gold-glow">{info.xingZuo}</div>
              </div>
              <div className="glass-cell rounded-lg py-3">
                <div className="text-[11px]" style={{ color: 'var(--color-dim)' }}>周岁</div>
                <div className="mt-1 font-kai text-xl font-bold text-gold-glow">{info.age}</div>
              </div>
              <div className="glass-cell rounded-lg py-3">
                <div className="text-[11px]" style={{ color: 'var(--color-dim)' }}>日柱纳音</div>
                <div className="mt-1 font-kai text-lg font-bold leading-tight text-gold-glow">{info.nayin}</div>
              </div>
            </div>
          </Panel>

          <Panel title="农历 · 干支">
            <div className="space-y-1 text-sm" style={{ color: 'var(--color-text)' }}>
              <div>
                农历生日：<b className="font-kai text-gold-glow">{info.lunarYear}年 {info.lunar}</b>
              </div>
              <div style={{ color: 'var(--color-text-dim)' }}>日柱：{info.ganZhi}</div>
              <div style={{ color: 'var(--color-text-dim)' }}>年柱纳音：{info.yearNayin}</div>
            </div>
          </Panel>

          {taiSui && (
            <Panel title={`${today.y} 年 · 本命年提醒`}>
              <p
                className="text-sm leading-relaxed"
                style={{ color: taiSui.hit ? 'var(--color-accent)' : 'var(--color-text)' }}
              >
                {taiSui.text}
              </p>
            </Panel>
          )}
        </>
      )}
    </div>
  )
}

// ---------------- 节气 ----------------
function JieQiTab() {
  const today = todayYMD()
  const [year, setYear] = useState(today.y)
  const jieQi = useMemo(() => yearJieQi(year), [year])

  return (
    <div className="space-y-3">
      <div className="glass-panel p-4">
        <MonthNav
          y={year}
          m={0}
          label={`${year}年`}
          onPrev={() => setYear((y) => y - 1)}
          onNext={() => setYear((y) => y + 1)}
          onToday={() => setYear(today.y)}
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          {jieQi.map((j) => (
            <div key={j.name} className="glass-cell rounded-lg p-2.5">
              <div className="font-kai text-sm font-bold" style={{ color: 'var(--color-gold)' }}>
                {j.name}
              </div>
              <div className="mt-0.5 text-xs" style={{ color: 'var(--color-dim)' }}>
                {j.month}月{j.day}日
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------- 本命年 ----------------
function BenMingTab() {
  const today = todayYMD()
  const [branch, setBranch] = useState<number>(10) // 默认狗
  const years = useMemo(() => {
    const list: number[] = []
    for (let y = today.y - 1; y <= today.y + 6; y++) list.push(y)
    return list
  }, [today.y])
  const result = useMemo(() => taiSuiYears(branch, years), [branch, years])

  return (
    <div className="space-y-3">
      <div className="glass-panel p-4">
        <div className="mb-3 text-xs" style={{ color: 'var(--color-text-dim)' }}>
          选你的生肖，看未来几年犯不犯太岁：
        </div>
        <div className="grid grid-cols-4 gap-2">
          {ZODIAC_ANIMALS.map((z, i) => (
            <button
              key={z}
              onClick={() => setBranch(i)}
              className="tap-target rounded-xl border py-2 text-sm transition"
              style={{
                borderColor: branch === i ? 'var(--color-accent)' : 'var(--color-border)',
                color: branch === i ? 'var(--color-accent)' : 'var(--color-text)',
                background: branch === i ? 'var(--color-card)' : 'transparent',
              }}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      <Panel title={`属${ZODIAC_ANIMALS[branch]} · 未来几年`}>
        <div className="space-y-2">
          {result.map((r) => (
            <div
              key={r.year}
              className="glass-cell rounded-lg p-2.5"
              style={r.hit ? { borderColor: 'var(--color-accent)' } : undefined}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-kai text-base font-bold" style={{ color: r.hit ? 'var(--color-accent)' : 'var(--color-gold)' }}>
                  {r.year}
                </span>
                {r.hit && (
                  <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: 'var(--color-accent)', color: '#0b1020' }}>
                    犯太岁
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
                {r.text}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
