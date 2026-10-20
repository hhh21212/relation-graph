// 全局状态：人员列表、主题、设置。使用 zustand + localStorage 持久化。

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Person } from '../../types/person'
import { Relation } from '../../types/relation'

export type ThemeId = 'xianqi' | 'shuimo' | 'liujin' | 'qinglv'

export type FxIntensity = 'soft' | 'standard' | 'rich'

export const THEME_LABELS: Record<ThemeId, string> = {
  xianqi: '仙气飘飘',
  shuimo: '水墨留白',
  liujin: '鎏金夜色',
  qinglv: '青绿山水',
}

interface AppState {
  persons: Person[]
  relations: Relation[]
  theme: ThemeId
  notificationsEnabled: boolean
  onboardingDone: boolean
  fxEnabled: boolean
  fxIntensity: FxIntensity

  setTheme: (t: ThemeId) => void
  setFxEnabled: (v: boolean) => void
  setFxIntensity: (v: FxIntensity) => void
  setSelf: (p: Person) => void
  addPerson: (p: Person) => void
  updatePerson: (id: string, patch: Partial<Person>) => void
  toggleFavorite: (id: string) => void
  removePerson: (id: string) => void
  addRelation: (r: Relation) => void
  removeRelation: (id: string) => void
  toggleNotifications: () => void
  replaceAll: (persons: Person[], relations?: Relation[]) => void
  clearAll: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      persons: [],
      relations: [],
      theme: 'xianqi',
      notificationsEnabled: false,
      onboardingDone: false,
      fxEnabled: true,
      fxIntensity: 'standard',

      setTheme: (theme) => set({ theme }),
      setFxEnabled: (fxEnabled) => set({ fxEnabled }),
      setFxIntensity: (fxIntensity) => set({ fxIntensity }),
      setSelf: (p) =>
        set((s) => ({
          persons: [p, ...s.persons.filter((x) => !x.isSelf)],
          onboardingDone: true,
        })),
      addPerson: (p) => set((s) => ({ persons: [...s.persons, p] })),
      updatePerson: (id, patch) =>
        set((s) => ({ persons: s.persons.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      toggleFavorite: (id) =>
        set((s) => ({
          persons: s.persons.map((x) => (x.id === id ? { ...x, favorite: !x.favorite } : x)),
        })),
      removePerson: (id) =>
        set((s) => ({
          persons: s.persons.filter((x) => x.id !== id),
          relations: s.relations.filter((r) => r.a !== id && r.b !== id),
        })),
      addRelation: (r) => set((s) => ({ relations: [...s.relations, r] })),
      removeRelation: (id) => set((s) => ({ relations: s.relations.filter((r) => r.id !== id) })),
      toggleNotifications: () => set((s) => ({ notificationsEnabled: !s.notificationsEnabled })),
      replaceAll: (persons, relations = []) => set({ persons, relations }),
      clearAll: () => set({ persons: [], relations: [], onboardingDone: false }),
    }),
    {
      name: 'relation-tree-store',
      version: 2,
      // v1 → v2：老数据没有性别字段，统一补成「男」（可之后编辑改回）
      migrate: (persisted) => {
        const s = (persisted ?? {}) as { persons?: unknown } & Record<string, unknown>
        const rawPersons = Array.isArray(s.persons) ? (s.persons as Record<string, unknown>[]) : []
        const persons = rawPersons.map((p) => ({
          ...p,
          gender: p.gender === 'female' ? 'female' : 'male',
        }))
        return { ...s, persons } as unknown as AppState
      },
    },
  ),
)

/** 「我」节点 */
export function selectSelf(state: AppState): Person | undefined {
  return state.persons.find((p) => p.isSelf)
}

/** 除「我」以外的人 */
export function selectOthers(state: AppState): Person[] {
  return state.persons.filter((p) => !p.isSelf)
}

/** 生成 id */
export function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
