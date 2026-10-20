// 「桃花 / 感情」报告类型：一个人看感情的白话报告（娱乐参考）。
// 配偶宫用八字「日支」代替（本项目无紫微斗数）；缺时辰/缺性别在对应处标注。

export interface RomanceReport {
  hasHour: boolean
  hasGender: boolean
  name: string

  // 桃花长相（高矮胖瘦 / 脸型 / 气质）
  appearance: {
    build: string
    face: string
    temperament: string
    text: string
  }

  // 桃花类型（正桃花 / 烂桃花、方位、时间）
  taohua: {
    type: string
    direction: string
    time: string
    text: string
  }

  // 容易遇到什么样的人（性格 / 属相 / 职业）
  meeting: {
    personality: string
    zodiacs: string[]
    profession: string
    text: string
  }

  // 配偶长相 / 气质（配偶宫 = 日支）
  spouse: {
    face: string
    temperament: string
    text: string
    note?: string
  }

  // 今年桃花运（旺不旺 / 什么时候旺）
  thisYear: {
    year: number
    strong: boolean
    label: string
    signals: string[]
    months: string[]
    upcomingYears: { year: number; text: string }[]
    text: string
  }

  // 招桃花 / 避烂桃花
  advice: {
    attract: string[]
    avoid: string[]
    text: string
  }

  cautions: string[]
}
