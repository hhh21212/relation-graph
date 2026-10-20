// 六十甲子纳音：每两个干支共享一个纳音，共 30 个。

import { WuXing, wuXingFromChar } from './fiveElement'

export const NAYIN_NAMES = [
  '海中金', '炉中火', '大林木', '路旁土', '剑锋金', '山头火',
  '涧下水', '城头土', '白蜡金', '杨柳木', '泉中水', '屋上土',
  '霹雳火', '松柏木', '长流水', '沙中金', '山下火', '平地木',
  '壁上土', '金箔金', '覆灯火', '天河水', '大驿土', '钗钏金',
  '桑柘木', '大溪水', '沙中土', '天上火', '石榴木', '大海水',
] as const

export interface NaYin {
  name: string
  wuXing: WuXing
}

/** 由六十甲子序号（0=甲子 … 59=癸亥）取纳音 */
export function nayinOfGanZhi(index: number): NaYin {
  const i = ((index % 60) + 60) % 60
  const name = NAYIN_NAMES[Math.floor(i / 2)]
  return { name, wuXing: wuXingFromChar(name[name.length - 1]) }
}
