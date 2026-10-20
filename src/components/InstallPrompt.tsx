// PWA：安装到主屏幕（安卓/桌面 beforeinstallprompt）+ 新版本刷新提示。
// 关闭后本次会话不再打扰。

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRegisterSW } from 'virtual:pwa-register/react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setInstallEvt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const doInstall = async () => {
    if (!installEvt) return
    await installEvt.prompt()
    await installEvt.userChoice
    setInstallEvt(null)
  }

  const showInstall = !!installEvt && !dismissed

  return (
    <AnimatePresence>
      {showInstall && (
        <motion.div
          className="fixed inset-x-0 bottom-20 z-50 mx-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
        >
          <div className="glass-panel flex items-center gap-3 p-4">
            <span className="text-2xl">📱</span>
            <div className="flex-1">
              <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                安装到主屏幕
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                像 App 一样打开，还能离线用
              </div>
            </div>
            <button
              onClick={doInstall}
              className="tap-target rounded-lg px-3 text-sm font-medium"
              style={{ background: 'var(--color-accent)', color: '#0b1020' }}
            >
              安装
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="tap-target flex items-center justify-center rounded-lg px-2 text-lg"
              style={{ color: 'var(--color-text-dim)' }}
              aria-label="关闭"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {needRefresh && (
        <motion.div
          className="fixed inset-x-0 bottom-20 z-50 mx-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
        >
          <div className="glass-panel flex items-center gap-3 p-4">
            <span className="text-2xl">🔄</span>
            <div className="flex-1">
              <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                发现新版本
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                点击刷新即可更新
              </div>
            </div>
            <button
              onClick={() => updateServiceWorker(true)}
              className="tap-target rounded-lg px-3 text-sm font-medium"
              style={{ background: 'var(--color-accent)', color: '#0b1020' }}
            >
              刷新
            </button>
            <button
              onClick={() => setNeedRefresh(false)}
              className="tap-target flex items-center justify-center rounded-lg px-2 text-lg"
              style={{ color: 'var(--color-text-dim)' }}
              aria-label="关闭"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
