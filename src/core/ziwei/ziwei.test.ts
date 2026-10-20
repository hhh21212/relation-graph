import { describe, it, expect } from 'vitest'
import { computeZiWei, anZiWei, computeLiuNian, computeGongSiHua, sanFangSiZheng, detectPatterns } from './ziwei'
import { STARS, STAR_MAP, SIHUA, brightnessOf } from './stars'

describe('紫微斗数', () => {
  it('14 主星齐全，四化表完整', () => {
    expect(STARS).toHaveLength(14)
    expect(SIHUA).toHaveLength(10)
    expect(STAR_MAP['ziwei']).toBeTruthy()
    expect(STAR_MAP['pojun']).toBeTruthy()
  })

  it('安紫微：对照口诀示例', () => {
    expect(anZiWei(20, 5)).toBe(5) // 20日土五局 → 巳
    expect(anZiWei(16, 4)).toBe(5) // 16日金四局 → 巳
    expect(anZiWei(27, 4)).toBe(7) // 27日金四局 → 未
    expect(anZiWei(13, 6)).toBe(11) // 13日火六局 → 亥
    expect(anZiWei(6, 5)).toBe(7) // 6日土五局 → 未
    expect(anZiWei(22, 3)).toBe(11) // 22日木三局 → 亥
  })

  it('排盘：十二宫天干与五行局', () => {
    const p = computeZiWei({ year: 2000, month: 6, day: 15, hour: 10 })
    expect(p.palaceStems).toHaveLength(12)
    expect(p.ju).toBeGreaterThanOrEqual(2)
    expect(p.ju).toBeLessThanOrEqual(6)
    expect(p.juName.length).toBeGreaterThan(0)
    expect(p.lunarText.length).toBeGreaterThan(0)
  })

  it('十二宫天干顺行连续（五虎遁不破）', () => {
    const p = computeZiWei({ year: 1984, month: 2, day: 2, hour: 0 }) // 甲子年
    expect(p.palaceStems[2]).toBe(2) // 甲年五虎遁：寅宫 = 丙
    const order = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1] // 寅起顺行
    for (let i = 0; i < 11; i++) {
      expect(p.palaceStems[order[i + 1]]).toBe((p.palaceStems[order[i]] + 1) % 10)
    }
  })

  it('十四主星全部落宫，紫微/天府以寅申线对称', () => {
    const p = computeZiWei({ year: 1990, month: 5, day: 15, hour: 8 })
    const vals = Object.values(p.stars)
    expect(vals).toHaveLength(14)
    vals.forEach((b) => {
      expect(b).toBeGreaterThanOrEqual(0)
      expect(b).toBeLessThanOrEqual(11)
    })
    expect(p.stars['tianfu']).toBe((4 - p.stars['ziwei'] + 12) % 12)
  })

  it('天同/破军安星偏移正确（24 双星组合基准）', () => {
    // 天同 = 紫微逆 5；破军 = 天府顺 10（七杀后空三宫）。
    const p = computeZiWei({ year: 1990, month: 5, day: 15, hour: 8 })
    expect(p.stars['tiantong']).toBe((p.stars['ziwei'] - 5 + 12) % 12)
    expect(p.stars['pojun']).toBe((2 - p.stars['ziwei'] + 12) % 12)
  })

  it('十三辅星落宫：禄存/擎羊/陀罗/左辅右弼/文昌文曲/天魁天钺', () => {
    const p = computeZiWei({ year: 1984, month: 2, day: 2, hour: 0 }) // 甲子年 正月 子时
    expect(p.auxStars['lucun']).toBe(2) // 甲禄在寅
    expect(p.auxStars['qingyang']).toBe(3) // 擎羊 = 禄存 + 1
    expect(p.auxStars['tuoluo']).toBe(1) // 陀罗 = 禄存 - 1
    expect(p.auxStars['zuofu']).toBe(4) // 左辅：辰起正月
    expect(p.auxStars['youbi']).toBe(10) // 右弼：戌起正月
    expect(p.auxStars['wenchang']).toBe(10) // 文昌：戌起子时
    expect(p.auxStars['wenqu']).toBe(4) // 文曲：辰起子时
    expect(p.auxStars['tiankui']).toBe(1) // 甲戊庚牛羊：天魁丑
    expect(p.auxStars['tianyue']).toBe(7) // 天钺未
    expect(Object.keys(p.auxStars)).toHaveLength(13)
  })

  it('大限：12 步、起于命宫、顺逆随阴阳', () => {
    const p = computeZiWei({ year: 1984, month: 2, day: 2, hour: 0, gender: 'male' }) // 甲子(阳年) 男 → 顺行
    expect(p.dayun).toHaveLength(12)
    expect(p.dayun[0].palace).toBe(p.mingGong)
    expect(p.dayun[0].startAge).toBe(p.ju)
    expect(p.dayun[1].palace).toBe((p.mingGong + 1) % 12)

    const p2 = computeZiWei({ year: 1985, month: 2, day: 20, hour: 0, gender: 'male' }) // 乙丑(阴年) 男 → 逆行
    expect(p2.dayun[1].palace).toBe((p2.mingGong + 11) % 12)
  })

  it('星曜亮度：庙/旺/平/陷覆盖 14 主星', () => {
    for (const s of STARS) {
      for (let b = 0; b < 12; b++) {
        expect(['庙', '旺', '平', '陷']).toContain(brightnessOf(s.key, b))
      }
    }
    expect(brightnessOf('taiyang', 2)).toBe('庙') // 太阳寅 = 庙
    expect(brightnessOf('taiyang', 9)).toBe('陷') // 太阳酉 = 陷
    expect(brightnessOf('ziwei', 1)).toBe('庙') // 紫微丑 = 庙
    expect(brightnessOf('ziwei', 4)).toBe('陷') // 紫微辰 = 陷
  })

  it('流年四化与流年命宫', () => {
    const ln = computeLiuNian({ year: 1984, month: 2, day: 2, hour: 0 }, 2026) // 丙午年
    expect(ln.ganName).toBe('丙')
    expect(ln.zhiName).toBe('午')
    expect(ln.sihua.lu).toBe('tiantong') // 丙：同机昌廉
    expect(ln.mingGong).toBeGreaterThanOrEqual(0)
    expect(ln.mingGong).toBeLessThan(12)
  })

  it('宫干四化飞星：十二宫各化出禄权科忌，飞入星曜所落宫', () => {
    const p = computeZiWei({ year: 1984, month: 2, day: 2, hour: 0 })
    const g = computeGongSiHua(p)
    expect(g).toHaveLength(12)
    const kinds = ['lu', 'quan', 'ke', 'ji'] as const
    for (const x of g) {
      expect(x.fromOffset).toBe(((x.fromGong - p.mingGong) % 12 + 12) % 12)
      expect(x.flies).toHaveLength(4)
      x.flies.forEach((f, i) => {
        expect(f.kind).toBe(kinds[i])
        expect(f.toGong).toBe(p.stars[f.star] ?? p.auxStars[f.star])
      })
    }
    // 甲年宫干：廉贞禄、破军权、武曲科、太阳忌
    const jia = g.find((x) => x.stem === 0)!
    expect(jia.flies.map((f) => f.star)).toEqual(['lianzhen', 'pojun', 'wuqu', 'taiyang'])
  })

  it('三方四正与格局', () => {
    expect(sanFangSiZheng(0)).toEqual([0, 4, 6, 8])
    const p = computeZiWei({ year: 1984, month: 2, day: 2, hour: 0 })
    const pats = detectPatterns(p)
    for (const x of pats) {
      expect(x.name.length).toBeGreaterThan(0)
      expect(x.desc.length).toBeGreaterThan(0)
    }
  })
})
