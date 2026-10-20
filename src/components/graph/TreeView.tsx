// 关系树 Tab：顶栏 + 力导向图 + 空态提示。

import { useUI } from '../../store/ui'
import GraphView from './GraphView'

export default function TreeView() {
  const openAdd = useUI((s) => s.openAdd)
  const openDetail = useUI((s) => s.openDetail)

  return (
    <div className="flex h-full flex-col">
      <header className="safe-top flex items-center justify-between px-5 pt-3 pb-2">
        <div>
          <h1 className="font-kai text-xl font-bold text-gold-glow">
            关系树
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--color-text-dim)' }}>
            点节点看详情 · 可拖拽 · 双指缩放
          </p>
        </div>
        <button
          onClick={openAdd}
          className="tap-target flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[15px] font-medium transition active:scale-95"
          style={{ background: 'var(--color-accent)', color: '#0b1020' }}
        >
          ＋ 添加
        </button>
      </header>

      <div className="relative min-h-0 flex-1">
        <GraphView onNodeClick={openDetail} />
      </div>
    </div>
  )
}
