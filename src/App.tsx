// 应用入口：主题应用 + 首次引导 + 底部 Tab + 各弹层。

import { useEffect } from 'react'
import { useStore } from './core/storage/store'
import { useUI } from './store/ui'
import Background from './components/ui/Background'
import Onboarding from './components/Onboarding'
import TabBar from './components/TabBar'
import TreeView from './components/graph/TreeView'
import RecordsView from './components/records/RecordsView'
import ToolsView from './components/tools/ToolsView'
import SettingsView from './components/settings/SettingsView'
import PersonDetailSheet from './components/person/PersonDetailSheet'
import PersonChartView from './components/person/PersonChartView'
import PersonFormSheet from './components/person/PersonFormSheet'
import PersonPickerSheet from './components/person/PersonPickerSheet'
import RelationEditorSheet from './components/person/RelationEditorSheet'
import AnalysisView from './components/analysis/AnalysisView'
import InstallPrompt from './components/InstallPrompt'

export default function App() {
  const theme = useStore((s) => s.theme)
  const hasSelf = useStore((s) => s.persons.some((p) => p.isSelf))
  const notificationsEnabled = useStore((s) => s.notificationsEnabled)
  const activeTab = useUI((s) => s.activeTab)

  // 应用主题到 <html data-theme>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // 生日当天系统通知（用户开启时）
  useEffect(() => {
    if (!notificationsEnabled || typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const now = new Date()
    const others = useStore.getState().persons.filter((p) => !p.isSelf)
    for (const p of others) {
      if (p.birthMonth === now.getMonth() + 1 && p.birthDay === now.getDate()) {
        new Notification('🎂 生日提醒', { body: `今天是 ${p.name} 的生日` })
      }
    }
  }, [notificationsEnabled])

  if (!hasSelf) {
    return (
      <>
        <Background />
        <Onboarding />
      </>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Background />
      <main className="relative min-h-0 flex-1">
        {activeTab === 'tree' && <TreeView />}
        {activeTab === 'records' && <RecordsView />}
        {activeTab === 'tools' && <ToolsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>
      <TabBar />

      <PersonDetailSheet />
      <PersonChartView />
      <PersonFormSheet />
      <PersonPickerSheet />
      <RelationEditorSheet />
      <AnalysisView />
      <InstallPrompt />
    </div>
  )
}
