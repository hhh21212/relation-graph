// 星座个人星盘综合报告：把三件套/元素/相位/格局/逆行打包成连贯长文。仅供娱乐参考。
import { chartLongitudes, computeAspects, BODIES, type BirthPlace } from './aspects'
import { elementDistribution, elementReading } from './elements'
import { detectAspectPatterns } from './patterns'
import { retrogradeInfo } from './retrograde'
import { SIGNS, signOf, moonSignByDate, risingSignByPlace } from './data'
import { trioReading } from './trio'

export interface ChartReport {
  title: string
  paragraphs: string[]
}

export function chartReport(birth: BirthPlace): ChartReport {
  const h = birth.hour ?? 0
  const sun = signOf(birth.month, birth.day)
  const moon = moonSignByDate(birth.year, birth.month, birth.day, h)
  const hasPlace = birth.hour !== undefined && birth.lat !== undefined && birth.lng !== undefined
  const rising = hasPlace
    ? risingSignByPlace(birth.lat!, birth.lng!, birth.tz ?? 8, birth.year, birth.month, birth.day, birth.hour!)
    : sun

  const lons = chartLongitudes(birth)
  const trio = trioReading(sun, moon, rising)
  const elementText = elementReading(elementDistribution(lons))
  const aspects = computeAspects(lons)
  const patterns = detectAspectPatterns(lons)
  const rx = retrogradeInfo(birth.year, birth.month, birth.day, h).filter((r) => r.retrograde)

  const title = `${SIGNS[sun].name} · ${SIGNS[moon].name}月亮 · ${SIGNS[rising].name}上升`

  const paragraphs: string[] = []
  paragraphs.push(`${SIGNS[sun].name}太阳、${SIGNS[moon].name}月亮、${SIGNS[rising].name}上升，${trio.synthesis}`)
  paragraphs.push(`元素能量：${elementText}`)

  const strong = aspects[0]
  paragraphs.push(
    strong
      ? `主要相位共 ${aspects.length} 个，最紧的是${BODIES[strong.a]}×${BODIES[strong.b]}的${strong.aspect.name}（偏差 ${strong.orb.toFixed(1)}°）。`
      : '盘内主要相位较少，能量较为内敛、自我整合偏慢。',
  )

  if (patterns.length > 0) {
    paragraphs.push(
      `格局：${patterns.map((p) => `${p.name}（${p.bodies.map((b) => BODIES[b]).join('、')}）`).join('、')}。${patterns.map((p) => p.desc).join('')}`,
    )
  }

  if (rx.length > 0) {
    paragraphs.push(`逆行提醒：${rx.map((r) => r.text).join('')}`)
  }

  return { title, paragraphs }
}
