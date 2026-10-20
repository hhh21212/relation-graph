// UI 交互状态（不持久化）：当前 Tab、弹层、合盘选择、加关系流程等。

import { create } from 'zustand'

export type Tab = 'tree' | 'records' | 'tools' | 'settings'

export type FormMode = { mode: 'add' } | { mode: 'edit'; id: string } | { mode: 'self' } | null

interface UIState {
  activeTab: Tab
  // 详情 bottom sheet 显示的人
  detailId: string | null
  // 人员表单弹层
  form: FormMode
  // 合盘：已选第一个人，等待在 picker 里选第二个人
  compareFromId: string | null
  // 合盘结果展示的两个人
  analysisPair: [string, string] | null
  // 加关系：relateFromId 已选 A，relateToId 待选 B（null 表示还没选）
  relateFromId: string | null
  relateToId: string | null
  // 全屏「个人命盘」页显示的人
  chartId: string | null

  setTab: (t: Tab) => void
  openDetail: (id: string) => void
  closeDetail: () => void
  openChart: (id: string) => void
  closeChart: () => void
  openAdd: () => void
  openEdit: (id: string) => void
  openSelf: () => void
  closeForm: () => void
  startCompare: (id: string) => void
  cancelCompare: () => void
  pickCompareSecond: (id: string) => void
  closeAnalysis: () => void
  startRelate: (id: string) => void
  pickRelateTarget: (id: string) => void
  cancelRelate: () => void
}

export const useUI = create<UIState>((set) => ({
  activeTab: 'tree',
  detailId: null,
  form: null,
  compareFromId: null,
  analysisPair: null,
  relateFromId: null,
  relateToId: null,
  chartId: null,

  setTab: (activeTab) => set({ activeTab }),
  openDetail: (detailId) => set({ detailId }),
  closeDetail: () => set({ detailId: null }),
  openChart: (chartId) => set({ chartId, detailId: null }),
  closeChart: () => set({ chartId: null }),
  openAdd: () => set({ form: { mode: 'add' } }),
  openEdit: (id) => set({ form: { mode: 'edit', id } }),
  openSelf: () => set({ form: { mode: 'self' } }),
  closeForm: () => set({ form: null }),
  startCompare: (id) => set({ compareFromId: id, detailId: null }),
  cancelCompare: () => set({ compareFromId: null }),
  pickCompareSecond: (id) => set({ analysisPair: [useUI.getState().compareFromId!, id], compareFromId: null }),
  closeAnalysis: () => set({ analysisPair: null }),
  startRelate: (id) => set({ relateFromId: id, relateToId: null, detailId: null }),
  pickRelateTarget: (id) => set({ relateToId: id }),
  cancelRelate: () => set({ relateFromId: null, relateToId: null }),
}))
