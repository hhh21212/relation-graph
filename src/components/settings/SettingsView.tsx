// 设置 Tab：皮肤切换 / 生日提醒 / 导入导出 / 我的资料 / 关于。

import { useRef, useState } from 'react'
import { useStore, THEME_LABELS, ThemeId, type FxIntensity } from '../../core/storage/store'
import { useUI } from '../../store/ui'
import { downloadExport, importData } from '../../core/storage/exportImport'

const THEMES: ThemeId[] = ['xianqi', 'shuimo', 'liujin', 'qinglv']

export default function SettingsView() {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const fxEnabled = useStore((s) => s.fxEnabled)
  const setFxEnabled = useStore((s) => s.setFxEnabled)
  const fxIntensity = useStore((s) => s.fxIntensity)
  const setFxIntensity = useStore((s) => s.setFxIntensity)
  const notificationsEnabled = useStore((s) => s.notificationsEnabled)
  const toggleNotifications = useStore((s) => s.toggleNotifications)
  const persons = useStore((s) => s.persons)
  const relations = useStore((s) => s.relations)
  const replaceAll = useStore((s) => s.replaceAll)
  const clearAll = useStore((s) => s.clearAll)
  const openSelf = useUI((s) => s.openSelf)
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const handleEnableNotifications = async () => {
    if (!notificationsEnabled) {
      if (typeof Notification === 'undefined') {
        setMsg('此浏览器不支持通知')
        return
      }
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        setMsg('通知权限被拒绝，可在浏览器设置里开启')
        return
      }
    }
    toggleNotifications()
  }

  const handleExport = () => {
    downloadExport(persons, relations)
    setMsg('已导出 JSON 备份文件')
  }

  const handleImport = async (file: File) => {
    try {
      const text = await file.text()
      const { persons: importedPersons, relations: importedRelations } = importData(text)
      const hasSelf = importedPersons.some((p) => p.isSelf)
      const mergedPersons = hasSelf
        ? importedPersons
        : [
            ...(persons.some((p) => p.isSelf) ? persons.filter((p) => p.isSelf) : []),
            ...importedPersons,
          ]
      replaceAll(mergedPersons, importedRelations)
      setMsg(`已导入 ${importedPersons.length} 条数据`)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : '导入失败')
    }
  }

  const handleClear = () => {
    if (confirm('确定清空所有数据吗？此操作不可恢复。')) {
      clearAll()
    }
  }

  const sectionTitle = 'px-1 text-xs font-semibold'

  return (
    <div className="h-full overflow-y-auto no-scrollbar px-5 pb-8 safe-top">
      <h1 className="font-kai py-3 text-xl font-bold text-gold-glow">
        设置
      </h1>

      {/* 我的资料 */}
      <div className="card mb-4 flex items-center justify-between p-4">
        <div>
          <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            我的资料
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
            改生日 / 补时辰
          </div>
        </div>
        <button onClick={openSelf} className="tap-target rounded-xl px-3 text-sm" style={{ color: 'var(--color-accent)' }}>
          编辑 ›
        </button>
      </div>

      {/* 皮肤 */}
      <h2 className={sectionTitle} style={{ color: 'var(--color-text-dim)' }}>
        皮肤
      </h2>
      <div className="mb-4 mt-2 grid grid-cols-2 gap-2">
        {THEMES.map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className="card tap-target flex items-center gap-3 px-4 py-3 text-left transition active:scale-95"
            style={{ borderColor: theme === t ? 'var(--color-accent)' : 'var(--color-border)' }}
          >
            <span
              className="h-6 w-6 rounded-full border"
              style={{ background: SWATCH[t], borderColor: 'var(--color-border)' }}
            />
            <span className="text-sm" style={{ color: theme === t ? 'var(--color-accent)' : 'var(--color-text)' }}>
              {THEME_LABELS[t]}
            </span>
            {theme === t && <span className="ml-auto text-xs" style={{ color: 'var(--color-accent)' }}>✓</span>}
          </button>
        ))}
      </div>

      {/* 特效 */}
      <h2 className={sectionTitle} style={{ color: 'var(--color-text-dim)' }}>
        特效
      </h2>
      <div className="card mb-4 mt-2 flex items-center justify-between p-4">
        <div>
          <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            背景特效
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
            全站氛围粒子 / 流光，随主题切换
          </div>
        </div>
        <button
          onClick={() => setFxEnabled(!fxEnabled)}
          className="tap-target flex h-7 w-12 items-center rounded-full p-1 transition"
          style={{ background: fxEnabled ? 'var(--color-accent)' : 'var(--color-border)' }}
          aria-label="切换特效"
        >
          <span
            className="h-5 w-5 rounded-full bg-white transition-transform"
            style={{ transform: fxEnabled ? 'translateX(20px)' : 'translateX(0)' }}
          />
        </button>
      </div>
      <div className="mb-4 mt-2 grid grid-cols-3 gap-2">
        {FX_LEVELS.map((l) => (
          <button
            key={l.key}
            onClick={() => setFxIntensity(l.key)}
            disabled={!fxEnabled}
            className="card tap-target px-3 py-3 text-center transition active:scale-95"
            style={{
              borderColor: fxIntensity === l.key ? 'var(--color-accent)' : 'var(--color-border)',
              opacity: fxEnabled ? 1 : 0.4,
            }}
          >
            <span className="text-sm" style={{ color: fxIntensity === l.key ? 'var(--color-accent)' : 'var(--color-text)' }}>
              {l.label}
            </span>
          </button>
        ))}
      </div>

      {/* 提醒 */}
      <h2 className={sectionTitle} style={{ color: 'var(--color-text-dim)' }}>
        提醒
      </h2>
      <div className="card mb-4 mt-2 flex items-center justify-between p-4">
        <div>
          <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            生日提醒（系统通知）
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
            打开后，生日当天会收到提醒
          </div>
        </div>
        <button
          onClick={handleEnableNotifications}
          className="tap-target flex h-7 w-12 items-center rounded-full p-1 transition"
          style={{ background: notificationsEnabled ? 'var(--color-accent)' : 'var(--color-border)' }}
          aria-label="切换通知"
        >
          <span
            className="h-5 w-5 rounded-full bg-white transition-transform"
            style={{ transform: notificationsEnabled ? 'translateX(20px)' : 'translateX(0)' }}
          />
        </button>
      </div>

      {/* 数据 */}
      <h2 className={sectionTitle} style={{ color: 'var(--color-text-dim)' }}>
        数据
      </h2>
      <div className="card mb-4 mt-2 divide-y" style={{ borderColor: 'var(--color-border)' }}>
        <button onClick={handleExport} className="tap-target flex w-full items-center justify-between px-4 py-3">
          <span className="text-sm" style={{ color: 'var(--color-text)' }}>导出备份（JSON）</span>
          <span style={{ color: 'var(--color-accent)' }}>›</span>
        </button>
        <button onClick={() => fileRef.current?.click()} className="tap-target flex w-full items-center justify-between px-4 py-3">
          <span className="text-sm" style={{ color: 'var(--color-text)' }}>导入备份</span>
          <span style={{ color: 'var(--color-accent)' }}>›</span>
        </button>
        <button onClick={handleClear} className="tap-target flex w-full items-center justify-between px-4 py-3">
          <span className="text-sm" style={{ color: 'var(--color-danger)' }}>清空所有数据</span>
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleImport(f)
          e.target.value = ''
        }}
      />

      {msg && (
        <div className="card mb-4 p-3 text-center text-xs" style={{ color: 'var(--color-accent)' }}>
          {msg}
        </div>
      )}

      {/* 添加到主屏幕 */}
      <h2 className={sectionTitle} style={{ color: 'var(--color-text-dim)' }}>
        添加到主屏幕
      </h2>
      <div className="card mb-4 mt-2 p-4">
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
          <b style={{ color: 'var(--color-text)' }}>iPhone / iPad：</b>用 Safari 打开，点底部分享按钮，选「添加到主屏幕」。
        </p>
        <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
          <b style={{ color: 'var(--color-text)' }}>安卓：</b>用 Chrome 打开，点右上角菜单，选「安装应用」或「添加到主屏幕」。
        </p>
        <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
          微信内置浏览器不支持 PWA，请用系统浏览器打开。
        </p>
      </div>

      {/* 关于 */}
      <div className="card p-4">
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
          关系树 · 人际合盘 v1.0
          <br />
          数据只存本机，不上传。综合生肖、纳音、生命灵数、星座、八字多套算法，
          结果仅供娱乐参考，不构成任何建议。规则以主流口径为准，有分歧处以「说人话」为准。
        </p>
      </div>
    </div>
  )
}

const FX_LEVELS: { key: FxIntensity; label: string }[] = [
  { key: 'soft', label: '柔和' },
  { key: 'standard', label: '标准' },
  { key: 'rich', label: '华丽' },
]

const SWATCH: Record<ThemeId, string> = {
  xianqi: '#0d1b2a',
  shuimo: '#f2ecd9',
  liujin: '#0c0b09',
  qinglv: '#0e2824',
}
