// 展示格式化工具

import { Person } from '../types/person'

const SHICHEN = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时']

/** 时辰名（0=子时(23-1) … 11=亥时(21-23)） */
export function shichenOf(hour: number): string {
  return SHICHEN[Math.floor((hour + 1) / 2) % 12]
}

/** 生日显示，如「1990年5月15日」 */
export function formatBirthDate(p: Person): string {
  return `${p.birthYear}年${p.birthMonth}月${p.birthDay}日`
}

/** 时辰显示：有则「申时（15点）」，无则「缺时辰」 */
export function formatHour(p: Person): string {
  if (p.hour === undefined) return '缺时辰'
  return `${shichenOf(p.hour)}（${String(p.hour).padStart(2, '0')}:00）`
}

/** 周岁 */
export function ageOf(p: Person): number {
  const now = new Date()
  let age = now.getFullYear() - p.birthYear
  const before = now.getMonth() + 1 < p.birthMonth || (now.getMonth() + 1 === p.birthMonth && now.getDate() < p.birthDay)
  if (before) age--
  return Math.max(age, 0)
}

/** 距下一个生日还有多少天（公历，0=今天） */
export function daysUntilBirthday(p: Person): number {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let month = p.birthMonth
  let day = p.birthDay
  // 2 月 29 日出生，平年按 2 月 28 日
  if (month === 2 && day === 29 && !isLeapYear(now.getFullYear())) day = 28
  let target = new Date(now.getFullYear(), month - 1, day)
  if (target < today) target = new Date(now.getFullYear() + 1, month - 1, day)
  const MS = 86400000
  return Math.round((target.getTime() - today.getTime()) / MS)
}

function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
}

/** 生日提醒文案 */
export function birthdayReminderLabel(p: Person): string {
  const d = daysUntilBirthday(p)
  if (d === 0) return '今天生日 🎂'
  if (d === 1) return '明天生日'
  return `${d} 天后生日`
}
