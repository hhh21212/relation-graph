// 二十四节气：使用「寿星天文历」权威实现（lunar-javascript，MIT，许剑伟）。
// 精度到秒级，用于精确判定年柱（立春）与月柱（12 节）的边界。
//
// 时间基准说明：所有时刻统一用「北京时间墙钟 编码为 UTC」的毫秒数（pseudoMs）表示，
// 即把北京钟表时间当作 UTC 来存储（Date.UTC(y, m-1, d, h, min)）。
// 出生时间（同样编码）可以直接与节气时刻做大小比较，无需再换算时区。

import { Lunar, Solar } from 'lunar-javascript'

// 24 节气名称（0=小寒 … 23=冬至）
export const SOLAR_TERM_NAMES = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至',
] as const

// 12 个「节」（定年柱/月柱的边界）在 24 节气中的下标
export const JIE_INDEXES = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]

// 缓存每个公历年 6 月对应的节气表（Lunar 节气表从「冬至(上年)」到「大雪(本年)」）
const tableCache = new Map<number, Map<string, Solar>>()

function tableOf(year: number): Map<string, Solar> {
  let t = tableCache.get(year)
  if (!t) {
    const raw = Lunar.fromDate(new Date(year, 5, 1)).getJieQiTable()
    t = new Map()
    for (const [k, v] of Object.entries(raw)) {
      // 过滤库内置的英文/常量键（如 DA_XUE、DONG_ZHI），只留中文节气名
      if (k.length < 2 || /[A-Z_]/.test(k)) continue
      t.set(k, v as Solar)
    }
    tableCache.set(year, t)
  }
  return t
}

/**
 * 求某公历年某节气的时刻（返回 pseudoMs，北京时间墙钟编码）。
 * @param year 公历年
 * @param n 节气序号（0=小寒 … 23=冬至）
 */
export function solarTermMs(year: number, n: number): number {
  const name = SOLAR_TERM_NAMES[n]
  // 冬至在「次年 6 月」的节气表里（该表从冬至(本年)起）
  const table = name === '冬至' ? tableOf(year + 1) : tableOf(year)
  const s = table.get(name)
  if (!s) throw new Error(`未找到节气 ${year} ${name}`)
  return Date.UTC(s.getYear(), s.getMonth() - 1, s.getDay(), s.getHour(), s.getMinute(), s.getSecond())
}

/** 把 pseudoMs 转成北京时间的年月日时分 */
export function pseudoToBeijing(ms: number): {
  year: number
  month: number
  day: number
  hour: number
  minute: number
} {
  const d = new Date(ms)
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
  }
}

/**
 * 取某个「八字年」内 12 个节的时刻，按时间先后排列。
 * 从立春(baziYear) 到 小寒(baziYear+1)，依次对应寅…丑月。
 */
export function getJieTimes(baziYear: number): { branch: number; ms: number }[] {
  const branches = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1]
  const indexes = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 0]
  const years = [
    baziYear, baziYear, baziYear, baziYear, baziYear, baziYear,
    baziYear, baziYear, baziYear, baziYear, baziYear, baziYear + 1,
  ]
  return indexes.map((idx, i) => ({ branch: branches[i], ms: solarTermMs(years[i], idx) }))
}
