// 时间模块类型：大运 + 流年 + 未来几年 + 重要年份（娱乐参考）。

export interface DaYunPillar {
  ganZhi: string // 如「庚午」
  startAge: number // 该柱开始的周岁
  endAge: number // 该柱结束的周岁
  startYear: number // 该柱开始的公历年
  endYear: number // 该柱结束的公历年
  ageLabel: string // 如「6–15 岁」
  text: string // 这十年的大白话
}

export interface DaYun {
  startAge: number // 起运岁数（整年）
  startAgeMonths: number // 起运余下的月
  startAgeLabel: string // 如「6岁4个月」
  startYear: number // 起运公历年
  pillars: DaYunPillar[]
}

export interface YearFortune {
  year: number
  ganZhi: string // 流年干支，如「丙午」
  shiShenLabel: string // 流年天干对日主的十神 白话
  relations: string[] // 合冲害刑 / 桃花 / 红鸾 / 天喜 / 驿马 / 空亡 白话
  fanTaiSui: { hit: boolean; text: string } // 犯太岁
  text: string // 一句话总结
}

export interface FortuneReport {
  hasGender: boolean
  hasHour: boolean
  missingNote?: string // 缺性别时的说明
  daYun: DaYun | null // 缺性别时 null
  recentYears: YearFortune[] // 今年 + 未来 N 年
  importantYears: { year: number; text: string }[]
}
