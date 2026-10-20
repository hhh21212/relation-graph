// 底部弹层（bottom sheet）：遮罩 + 从底部滑入，移动端常用交互。

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface SheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export default function Sheet({ open, onClose, children, title }: SheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-40 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}
      {open && (
        <motion.div
          key="panel"
          className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-hidden rounded-t-3xl border-t"
          style={{
            background: 'linear-gradient(180deg, var(--glass-top), var(--glass-bottom))',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderColor: 'color-mix(in srgb, var(--color-gold) 35%, transparent)',
            boxShadow: 'inset 0 1px 0 var(--glass-hi), 0 -10px 40px var(--glass-shadow)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        >
          {/* 拖拽把手 */}
          <div className="flex justify-center pt-2.5">
            <div className="h-1 w-10 rounded-full" style={{ background: 'color-mix(in srgb, var(--color-gold) 50%, transparent)' }} />
          </div>
          <div className="flex items-center justify-between px-5 pt-2 pb-1">
            <h2 className="font-kai text-base font-semibold text-gold-glow">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="tap-target flex items-center justify-center rounded-full text-xl"
              style={{ color: 'var(--color-text-dim)' }}
              aria-label="关闭"
            >
              ✕
            </button>
          </div>
          <div className="max-h-[calc(85vh-64px)] overflow-y-auto no-scrollbar px-5 pb-5">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
