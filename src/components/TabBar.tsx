// 底部 Tab 导航：关系树 / 记录 / 设置

import { useUI, Tab } from '../store/ui'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'tree', label: '关系树', icon: '🌳' },
  { key: 'records', label: '记录', icon: '📋' },
  { key: 'tools', label: '工具', icon: '🧰' },
  { key: 'settings', label: '设置', icon: '⚙️' },
]

export default function TabBar() {
  const activeTab = useUI((s) => s.activeTab)
  const setTab = useUI((s) => s.setTab)

  return (
    <nav
      className="z-30 flex border-t backdrop-blur"
      style={{
        background: 'var(--color-bg-elevated)',
        borderColor: 'var(--color-border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        minHeight: '60px',
      }}
    >
      {TABS.map((t) => {
        const active = activeTab === t.key
        return (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`tap-target flex flex-1 flex-col items-center justify-center gap-1 py-2 ${active ? 'tab-glow' : ''}`}
            style={{ color: active ? 'var(--color-gold)' : 'var(--color-text-dim)' }}
          >
            <span className="text-2xl leading-none">{t.icon}</span>
            <span className="text-[13px]" style={{ fontWeight: active ? 600 : 400 }}>
              {t.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
