// 「求签」模块数据：吕祖灵签 100 签，一份数据同时服务「摇签」和「签文查询」。
// 数据来自用户桌面「三清观求签」原程序的 build/full.json（不改内容，只搬进来）。

import raw from './full.json'

export interface QianSign {
  id: number
  title: string
  level: string
  brief: string
  poem: string
  jie: string
  shi: string
  jieshi: string
  fortunes: Record<string, string>
}

export const QIAN = raw as QianSign[]

/** 五档等级 → 徽章样式键（上上/上吉/中吉/中平/下下） */
export const LEVEL_KEY: Record<string, string> = {
  上上: 'ss',
  上吉: 'sj',
  中吉: 'zj',
  中平: 'zp',
  下下: 'xx',
}

/** 十二项运程的固定顺序（与原 lookup 程序一致） */
export const FORTUNE_KEYS = [
  '谋望',
  '钱财',
  '婚姻',
  '自身',
  '家宅',
  '开业',
  '迁居',
  '出行',
  '疾病',
  '六甲',
  '行人',
  '诉讼',
] as const

/** 按签号（1~100）取签，找不到返回 undefined */
export function findSign(n: number): QianSign | undefined {
  return QIAN.find((x) => x.id === n)
}

/** 等级文案 → 样式键，未知等级兜底为中平 */
export function levelKeyOf(level: string): string {
  return LEVEL_KEY[level] ?? 'zp'
}
