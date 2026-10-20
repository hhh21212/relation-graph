// 个人深度命盘：一个人「看命盘」的大白话报告（娱乐参考）。
// 全部字段都是说人话、零术语；缺时辰/缺性别在对应处标注。

import { WuXing } from '../core/rules/fiveElement'

export interface DestinyReport {
  hasHour: boolean
  hasGender: boolean

  // 概览
  overview: {
    name: string
    genderLabel: string // 男 / 女 / 未填
    dayMasterLabel: string // 如「癸水」
    shenQiang: '强' | '弱'
    shenQiangText: string // 子平强弱一句话
    baziGrid: { label: string; ganZhi: string; nayin: string }[]
    sanMingText: string
    mainBenText: string
  }

  // 性格（优点/缺点分开）
  character: {
    strengths: string[]
    weaknesses: string[]
    dayMasterNature: string
    summary: string
  }

  // 适合（行业/方位/颜色/数字，按子平用神五行推）
  suitable: {
    industries: string[]
    directions: string[]
    colors: string[]
    numbers: string[]
    basedOn: string
  }

  // 财运类型
  wealth: {
    type: string
    style: string
    text: string
  }

  // 感情模式
  love: {
    timing: string
    meet: string
    caution: string
    text: string
  }

  // 健康薄弱点
  health: {
    weakAreas: string[]
    tips: string[]
    text: string
  }

  // 贵人与小人
  benefactor: {
    zodiacs: string[]
    trait: string
    text: string
  }
  villain: {
    zodiacs: string[]
    trait: string
    text: string
  }

  // 会犯什么（健康/财运/感情/事业/性格）
  cautions: {
    health: string[]
    wealth: string[]
    love: string[]
    career: string[]
    character: string[]
  }
}

export type { WuXing }
