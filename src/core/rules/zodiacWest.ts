// 西方星座（太阳星座），按公历月日区间，娱乐参考。

export interface WestZodiac {
  name: string
  start: [number, number] // [月, 日]
  end: [number, number]
}

export const WEST_ZODIACS: WestZodiac[] = [
  { name: '白羊座', start: [3, 21], end: [4, 19] },
  { name: '金牛座', start: [4, 20], end: [5, 20] },
  { name: '双子座', start: [5, 21], end: [6, 21] },
  { name: '巨蟹座', start: [6, 22], end: [7, 22] },
  { name: '狮子座', start: [7, 23], end: [8, 22] },
  { name: '处女座', start: [8, 23], end: [9, 22] },
  { name: '天秤座', start: [9, 23], end: [10, 23] },
  { name: '天蝎座', start: [10, 24], end: [11, 22] },
  { name: '射手座', start: [11, 23], end: [12, 21] },
  { name: '摩羯座', start: [12, 22], end: [1, 19] },
  { name: '水瓶座', start: [1, 20], end: [2, 18] },
  { name: '双鱼座', start: [2, 19], end: [3, 20] },
]

/** 由公历月日取星座 */
export function westZodiac(month: number, day: number): string {
  for (const z of WEST_ZODIACS) {
    const [sm, sd] = z.start
    const [em, ed] = z.end
    const inRange =
      sm <= em
        ? (month > sm || (month === sm && day >= sd)) && (month < em || (month === em && day <= ed))
        : (month > sm || (month === sm && day >= sd)) || (month < em || (month === em && day <= ed))
    if (inRange) return z.name
  }
  return '未知'
}
