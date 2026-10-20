// 禄命法结果类型：以年柱为核心、纳音为「身」，与子平法（日主）并参、别混。

import { WuXing } from '../core/rules/fiveElement'
import { Branch } from '../core/rules/ganzhi'

export type ShiShenName =
  | '比肩'
  | '劫财'
  | '食神'
  | '伤官'
  | '偏财'
  | '正财'
  | '七杀'
  | '正官'
  | '偏印'
  | '正印'

/** 十神五大类（用于性格统计） */
export type ShiShenCategory = '比劫' | '食伤' | '财' | '官杀' | '印'

/** 单柱详情 */
export interface LuMingPillar {
  label: '年柱' | '月柱' | '日柱' | '时柱'
  ganZhiName: string // 如「丙戌」
  nayin: string // 纳音名，如「屋上土」
  nayinWuXing: WuXing
  cangGan: string[] // 藏干名称，如 ['戊','辛','丁']
  shiShen: { gan: string; name: ShiShenName }[] // 该柱天干+藏干 相对日干的十神
  changSheng: string // 该柱天干的长生十二宫
  wangShuai: string // 该柱天干五行在月令的旺衰（旺相休囚死）
  shenSha: string[] // 该柱命中的神煞
  gongWei: string // 宫位：祖上/父母/自身配偶/子女
}

export interface LuMingResult {
  hasHour: boolean
  // 三命（禄命身）
  sanMing: {
    lu: string // 年干，如「丙」——主名禄、贵贱
    ming: string // 年支，如「戌」——主际遇、荣枯
    shen: string // 年柱纳音，如「屋上土」——主禀赋、才能
  }
  // 主本：年柱（先天=本）vs 日柱（后天=主）
  mainBen: {
    year: string // 年柱纳音
    day: string // 日柱纳音
    rel: '本生主' | '主生本' | '本克主' | '主克本' | '比和'
    text: string
  }
  // 四柱详情
  pillars: LuMingPillar[]
  // 命盘里出现过的全部神煞（去重）
  shenShaAll: string[]
  // 十神五大类计数（比劫/食伤/财/官杀/印）
  shiShenCount: Record<ShiShenCategory, number>
  // 喜用（身=年纳音五行）
  xiYong: {
    shen: WuXing // 身
    bingGen: WuXing // 病根＝克身
    tongGuan: WuXing // 通关＝化克为生
    bangShen: WuXing // 帮身＝比和
    ji: WuXing[] // 忌＝克身 + 生忌
  }
  // 家庭出身（年柱=祖上、月柱=父母）
  jiaTing: {
    zuShang: { ganZhiName: string; nayin: string; rel: string; shenSha: string[] }
    fuMu: { ganZhiName: string; nayin: string; rel: string; shenSha: string[] }
  }
  // 空亡（旬空，年柱所在旬）
  kongWang: Branch[]
  // 三限定位（初限月/中限日/末限时）
  sanXian: { limit: string; pillar: string }[]
}
