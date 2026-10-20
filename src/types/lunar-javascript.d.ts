// lunar-javascript（寿星天文历，MIT）的最小类型声明，仅声明本项目用到的部分。
declare module 'lunar-javascript' {
  export class Solar {
    static fromDate(date: Date): Solar
    static fromYmd(year: number, month: number, day: number): Solar
    getYear(): number
    getMonth(): number // 1-12
    getDay(): number // 日
    getHour(): number // 0-23
    getMinute(): number
    getSecond(): number
    getWeek(): number // 0=周日 … 6=周六
    getLunar(): Lunar
  }

  export class Lunar {
    static fromDate(date: Date): Lunar
    getJieQiTable(): Record<string, Solar>
    getYearInChinese(): string
    getMonthInChinese(): string // 含「闰」前缀
    getDayInChinese(): string
    getYear(): number // 农历年
    getMonth(): number // 闰月为负数
    getDay(): number // 农历日 1-30
    getYearShengXiao(): string // 生肖，如「鼠」
    getTimeZhi(): string // 时辰，如「子」
    getYearInGanZhi(): string
    getMonthInGanZhi(): string
    getDayInGanZhi(): string
    getDayYi(): string[]
    getDayJi(): string[]
    getDayJiShen(): string[]
    getDayXiongSha(): string[]
    getDayChongDesc(): string // 如「(丁未)羊」
    getDayChongShengXiao(): string // 被冲生肖，如「羊」
    getDayNaYin(): string
    getXiu(): string // 星宿
    getDayPositionCaiDesc(): string // 财神方位
    getDayPositionXiDesc(): string // 喜神方位
    getDayPositionFuDesc(): string // 福神方位
    getPengZuGan(): string
    getPengZuZhi(): string
    getJieQi(): string // 当天节气，无则空串
  }
}
