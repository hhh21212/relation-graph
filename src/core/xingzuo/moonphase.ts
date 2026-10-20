// 星座月相：出生时月亮与太阳的相对黄经 → 八种月相，解读性格底色。仅供娱乐参考。
import { jdFromDate, sunLongitude, moonLongitude } from './astro'

export interface MoonPhase {
  name: string
  angle: number // 月亮 − 太阳 相对黄经（0–360）
  text: string
}

const PHASES = [
  { name: '新月', min: 0, max: 45, text: '出生于新月，像一张白纸、自带「重启」的能量，直觉敏锐、喜欢开创新局面，人生常有阶段性的「清零再出发」。' },
  { name: '蛾眉月', min: 45, max: 90, text: '上弦月前的新生力量，好奇又带着冲劲，习惯边学边做、越挫越勇。' },
  { name: '上弦月', min: 90, max: 135, text: '天生的行动派与建设者，遇事习惯立刻动手、用行动打破僵局。' },
  { name: '盈凸月', min: 135, max: 180, text: '接近圆满、追求完美，有强烈的自我要求与表达欲，凡事想做到最好。' },
  { name: '满月', min: 180, max: 225, text: '情绪饱满、外放而敏感，天生有照亮别人的能量，也容易在关系里照见自己。' },
  { name: '亏凸月', min: 225, max: 270, text: '满月后的沉淀，擅长分享与传递，是天生的老师、传播者，也懂得内省。' },
  { name: '下弦月', min: 270, max: 315, text: '懂得收尾与放手的智慧，爱反思、有批判眼光，擅长在旧的结束里看清方向。' },
  { name: '残月', min: 315, max: 360, text: '接近新月前的蛰伏，安静而深邃，有独特的直觉与疗愈力，适合沉潜酝酿。' },
]

export function moonPhase(year: number, month: number, day: number, hour = 0): MoonPhase {
  const jd = jdFromDate(year, month, day, hour)
  const angle = ((moonLongitude(jd) - sunLongitude(jd)) % 360 + 360) % 360
  const p = PHASES.find((x) => angle >= x.min && angle < x.max) ?? PHASES[0]
  return { name: p.name, angle, text: p.text }
}
