// 关系走势（性别无关）：用未来几年的流年干支，相对双方命盘合成「这一年两人关系会怎样」。
// 大运顺逆需要性别，本轮不做；走势只用与性别无关的流年信号（桃花/红鸾/天喜/合冲/驿马/空亡）。
// 结果仅供娱乐参考。

import { Person } from '../../types/person'
import { Trajectory, TrajectoryYear } from '../../types/analysis'
import { computeBaZi, BirthTime } from '../rules/bazi'
import { computeLuMing, hongLuan, tianXi, shenShaZhiNames } from '../rules/luming'
import { Branch, ganZhiFromIndex, ganZhiName, isLiuHe, isSanHe, isLiuChong } from '../rules/ganzhi'

function toBirthTime(p: Person): BirthTime {
  return { year: p.birthYear, month: p.birthMonth, day: p.birthDay, hour: p.hour, minute: p.minute }
}

interface YearSignals {
  warm: string[] // 桃花/红鸾/天喜/合日支 → 升温、走近
  cold: string[] // 冲日支/冲年支/空亡 → 波动、落空
  move: string[] // 驿马 → 聚少离多
}

/** 某一年流年支对一个人的关系信号 */
function personSignals(
  liuZhi: Branch,
  yearBranch: Branch,
  dayBranch: Branch,
  kongWang: Branch[],
  name: string,
): YearSignals {
  const out: YearSignals = { warm: [], cold: [], move: [] }
  for (const base of [yearBranch, dayBranch]) {
    for (const sn of shenShaZhiNames(base, liuZhi)) {
      if (sn === '桃花') out.warm.push(`${name}流年逢桃花`)
      if (sn === '驿马') out.move.push(`${name}流年逢驿马`)
    }
  }
  if (liuZhi === hongLuan(yearBranch)) out.warm.push(`${name}流年逢红鸾`)
  if (liuZhi === tianXi(yearBranch)) out.warm.push(`${name}流年逢天喜`)
  if (isLiuHe(liuZhi, dayBranch) || isSanHe(liuZhi, dayBranch)) out.warm.push(`${name}流年合日支`)
  if (isLiuChong(liuZhi, dayBranch)) out.cold.push(`${name}流年冲日支`)
  if (isLiuChong(liuZhi, yearBranch)) out.cold.push(`${name}流年冲年支`)
  if (kongWang.includes(liuZhi)) out.cold.push(`${name}流年落空亡`)
  return out
}

/** 把双方信号合成一句「这一年两人关系」的大白话 */
function synthesize(sa: YearSignals, sb: YearSignals): { note: string; trend: TrajectoryYear['trend'] } {
  const warm = [...sa.warm, ...sb.warm]
  const cold = [...sa.cold, ...sb.cold]
  const move = [...sa.move, ...sb.move]

  const hasWarm = warm.length > 0
  const hasCold = cold.length > 0
  const hasMove = move.length > 0

  if (hasCold && hasWarm) {
    return {
      trend: 'mixed',
      note: `这一年有${warm[0].replace(/^.*流年逢/, '')}的亲近，也有${cold[0].replace(/^.*流年/, '')}的波折，关系有起有伏，别在情绪上头时做决定。`,
    }
  }
  if (hasCold) {
    return {
      trend: 'down',
      note: `${cold[0]}，关系容易有波动、起摩擦，这一年稳住别急，大事缓一缓。`,
    }
  }
  if (hasWarm) {
    return {
      trend: 'up',
      note: `${warm[0]}，感情升温、走得近，是把关系往前推的好年头。`,
    }
  }
  if (hasMove) {
    return {
      trend: 'flat',
      note: `${move[0]}，容易聚少离多、各忙各的，多主动联系才不掉线。`,
    }
  }
  return {
    trend: 'flat',
    note: '这一年流年平稳，没有明显起伏，适合按部就班地经营关系。',
  }
}

export function computeTrajectory(a: Person, b: Person, startYear?: number): Trajectory {
  const ba = computeBaZi(toBirthTime(a))
  const bb = computeBaZi(toBirthTime(b))
  const la = computeLuMing(toBirthTime(a))
  const lb = computeLuMing(toBirthTime(b))

  const currentYear = startYear ?? new Date().getFullYear()

  const years: TrajectoryYear[] = []
  for (let i = 0; i < 6; i++) {
    const Y = currentYear + i
    const gz = ganZhiFromIndex(((Y - 4) % 60 + 60) % 60)
    const liuZhi = gz.branch
    const sa = personSignals(liuZhi, ba.zodiac, ba.dayPillar.ganZhi.branch, la.kongWang, a.name)
    const sb = personSignals(liuZhi, bb.zodiac, bb.dayPillar.ganZhi.branch, lb.kongWang, b.name)
    const { note, trend } = synthesize(sa, sb)
    years.push({ year: Y, label: `${Y} · ${ganZhiName(gz)}`, note, trend })
  }

  const upYears = years.filter((y) => y.trend === 'up').map((y) => `${y.year}`)
  const downYears = years.filter((y) => y.trend === 'down').map((y) => `${y.year}`)
  const summaryParts: string[] = []
  if (upYears.length) summaryParts.push(`${upYears.join('、')} 是走近、升温的窗口`)
  if (downYears.length) summaryParts.push(`${downYears.join('、')} 有点波动要稳住`)
  const summary =
    summaryParts.length > 0
      ? `往后几年：${summaryParts.join('；')}；其余年份平稳，慢慢经营就好。`
      : '往后几年整体平稳，没有大起大落，顺着相处、用心经营就好。'

  return { years, summary }
}
