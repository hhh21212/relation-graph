// 星座行星逆行：比较相邻两天地心黄经，判断水金火木土是否逆行。仅供娱乐参考。
import { jdFromDate, planetLongitude, type PlanetKey } from './astro'
import { BODIES } from './aspects'

export interface RetrogradeInfo {
  key: PlanetKey
  name: string
  retrograde: boolean
  text: string
}

const RX_TEXT: Record<PlanetKey, { yes: string; no: string }> = {
  mercury: { yes: '水星正在逆行：沟通、签约、出行易出岔，宜反复确认、少做重大决定。', no: '水星顺行中：沟通顺畅，适合洽谈签约与出行。' },
  venus: { yes: '金星正在逆行：感情与审美易反复，旧情旧事可能回访，宜冷静处理。', no: '金星顺行中：感情与人缘氛围佳，适合推进关系与美丽相关的事。' },
  mars: { yes: '火星正在逆行：行动力偏弱、易冲动受挫，宜蓄力而非硬闯。', no: '火星顺行中：干劲足、行动力强，适合冲刺与开创新局。' },
  jupiter: { yes: '木星正在逆行：扩张放缓，适合内省与复盘，运势仍稳。', no: '木星顺行中：机遇与成长加速，适合拓展与学习。' },
  saturn: { yes: '土星正在逆行：压力与责任回看，适合梳理结构、补上功课。', no: '土星顺行中：稳步推进、架构渐稳，适合承担责任与长期规划。' },
}

export function retrogradeInfo(year: number, month: number, day: number, hour = 0): RetrogradeInfo[] {
  const jd = jdFromDate(year, month, day, hour)
  const keys: PlanetKey[] = ['mercury', 'venus', 'mars', 'jupiter', 'saturn']
  return keys.map((key) => {
    const lon1 = planetLongitude(jd, key)
    const lon2 = planetLongitude(jd + 1, key)
    let diff = ((lon2 - lon1) % 360 + 360) % 360
    if (diff > 180) diff -= 360
    const retrograde = diff < 0
    return { key, name: BODIES[key], retrograde, text: RX_TEXT[key][retrograde ? 'yes' : 'no'] }
  })
}
