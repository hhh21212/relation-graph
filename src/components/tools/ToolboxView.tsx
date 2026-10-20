// 百宝箱：9 个轻量玄学小工具的统一入口（宫格卡片 → 单个工具面板）。

import { useState } from 'react'
import ChengGuTool from './toolbox/ChengGuTool'
import DreamTool from './toolbox/DreamTool'
import NameTool from './toolbox/NameTool'
import NumberTool from './toolbox/NumberTool'
import SanShiTool from './toolbox/SanShiTool'
import CeZiTool from './toolbox/CeZiTool'
import ZhuGeTool from './toolbox/ZhuGeTool'
import MoleTool from './toolbox/MoleTool'
import LifePathTool from './toolbox/LifePathTool'
import '../../styles/toolbox.css'

const TOOLS = [
  { key: 'chenggu', label: '称骨算命', icon: '⚖️', desc: '几两几钱 · 看一生' },
  { key: 'dream', label: '周公解梦', icon: '💭', desc: '梦见什么 · 一查便知' },
  { key: 'name', label: '姓名五格', icon: '🈴', desc: '三才五格 · 数理吉凶' },
  { key: 'number', label: '号码吉凶', icon: '🔢', desc: '手机车牌 · 趣味评分' },
  { key: 'sanshi', label: '三世姻缘', icon: '💞', desc: '前世今生 · 缘分深浅' },
  { key: 'cezi', label: '测字断事', icon: '✍️', desc: '一字拆解 · 断吉凶' },
  { key: 'zhuge', label: '诸葛神算', icon: '🎯', desc: '三字取签 · 问前程' },
  { key: 'mole', label: '痣相图解', icon: '🔮', desc: '面身痣位 · 吉凶图鉴' },
  { key: 'lifepath', label: '生命灵数', icon: '✨', desc: '生日数字 · 天赋性格' },
] as const

type ToolKey = (typeof TOOLS)[number]['key']

export default function ToolboxView() {
  const [active, setActive] = useState<ToolKey | null>(null)

  if (active) {
    return (
      <div className="space-y-3">
        <button onClick={() => setActive(null)} className="liuyao-btn liuyao-btn-ghost w-full px-4 py-2.5">
          ‹ 返回百宝箱
        </button>
        {active === 'chenggu' && <ChengGuTool />}
        {active === 'dream' && <DreamTool />}
        {active === 'name' && <NameTool />}
        {active === 'number' && <NumberTool />}
        {active === 'sanshi' && <SanShiTool />}
        {active === 'cezi' && <CeZiTool />}
        {active === 'zhuge' && <ZhuGeTool />}
        {active === 'mole' && <MoleTool />}
        {active === 'lifepath' && <LifePathTool />}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="toolbox-grid">
        {TOOLS.map((t) => (
          <button key={t.key} onClick={() => setActive(t.key)} className="toolbox-card glass-panel tap-target p-3 text-left">
            <div className="text-2xl leading-none">{t.icon}</div>
            <div className="mt-2 font-kai text-base font-bold text-gold-glow">{t.label}</div>
            <div className="mt-0.5 text-[11px]" style={{ color: 'var(--color-text-dim)' }}>
              {t.desc}
            </div>
          </button>
        ))}
      </div>
      <p className="text-center text-[11px]" style={{ color: 'var(--color-dim)' }}>
        玄学百宝箱 · 全部为娱乐参考，开心就好。
      </p>
    </div>
  )
}
