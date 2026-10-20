// 天文黄经（Meeus 低精度）：太阳/月亮视黄经 + 上升点黄经。
// 用于比「按日/按时」更准的月亮星座与上升星座。仅供娱乐参考。

const DEG = Math.PI / 180

function norm(n: number, m: number): number {
  return ((n % m) + m) % m
}

function sin(deg: number): number {
  return Math.sin(deg * DEG)
}
function cos(deg: number): number {
  return Math.cos(deg * DEG)
}

// 儒略日（hour 可为小数、可为负或超过 24）
export function jdFromDate(y: number, m: number, d: number, hour = 0): number {
  if (m <= 2) {
    y -= 1
    m += 12
  }
  const A = Math.floor(y / 100)
  const B = 2 - A + Math.floor(A / 4)
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5 + hour / 24
}

// 太阳视黄经（度，含光行差与章动，误差 < 0.01°）
export function sunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * sin(M) +
    (0.019993 - 0.000101 * T) * sin(2 * M) +
    0.000289 * sin(3 * M)
  const omega = 125.04 - 1934.136 * T
  return norm(L0 + C - 0.00569 - 0.00478 * sin(omega), 360)
}

// 月亮黄经（度，低精度，误差约 0.1° 内）
export function moonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525
  const L = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + (T * T * T) / 538841 - (T * T * T * T) / 65194000
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + (T * T * T) / 545868 - (T * T * T * T) / 113065000
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + (T * T * T) / 24490000
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + (T * T * T) / 69699 - (T * T * T * T) / 14712000
  const F = 93.272095 + 483202.0175233 * T - 0.0036539 * T * T - (T * T * T) / 3526000 + (T * T * T * T) / 863310000

  const sum =
    6.28875 * sin(Mp) +
    1.274018 * sin(2 * D - Mp) +
    0.658309 * sin(2 * D) +
    0.213616 * sin(2 * Mp) -
    0.185596 * sin(M) -
    0.114336 * sin(2 * F) +
    0.058793 * sin(2 * D - 2 * Mp) +
    0.057212 * sin(2 * D - M - Mp) +
    0.05332 * sin(2 * D + Mp) +
    0.045874 * sin(2 * D - M) +
    0.041024 * sin(Mp - M) -
    0.034718 * sin(D) -
    0.030465 * sin(M + Mp) +
    0.015326 * sin(2 * D - 2 * F) -
    0.012528 * sin(2 * F + Mp) -
    0.01098 * sin(2 * F - Mp) +
    0.010674 * sin(4 * D - Mp) +
    0.010034 * sin(3 * Mp) +
    0.008548 * sin(4 * D - 2 * Mp)

  return norm(L + sum, 360)
}

// 上升点黄经（度）。lat 北纬为正、lng 东经为正，jd 为儒略日。
export function ascendant(jd: number, lat: number, lng: number): number {
  const T = (jd - 2451545.0) / 36525
  // 格林尼治平恒星时（度）→ 本地恒星时
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000
  const lst = norm(gmst + lng, 360)
  // 黄赤交角（度）
  const eps = 23.4392911 - 0.0130042 * T - 1.64e-7 * T * T + 5.04e-7 * T * T * T
  const RAMC = lst * DEG
  const e = eps * DEG
  const phi = lat * DEG
  const y = Math.cos(RAMC)
  const x = -(Math.sin(RAMC) * Math.cos(e) + Math.tan(phi) * Math.sin(e))
  return norm(Math.atan2(y, x) / DEG, 360)
}

// 黄经 → 星座下标（0=白羊 … 11=双鱼）
export function signIndexFromLon(lon: number): number {
  return Math.floor(norm(lon, 360) / 30)
}

// ---------------- 行星地心黄经（水金火木土） ----------------
// 算法：Paul Schlyter「如何计算行星位置」低精度轨道根数法。
// 先算日心黄道坐标，再减去地球日心坐标得到地心坐标，取 atan2 得黄经。
// 误差：内行星约 1° 内，外行星更小，足够「娱乐星盘」使用。

export type PlanetKey = 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn'

interface Elements {
  N0: number
  Nd: number
  i0: number
  id: number
  w0: number
  wd: number
  a: number
  e0: number
  ed: number
  M0: number
  Md: number
}

// 轨道根数（d = 儒略日 − J2000）
const ELEMENTS: Record<PlanetKey | 'earth', Elements> = {
  mercury: { N0: 48.3313, Nd: 3.24587e-5, i0: 7.0047, id: 5.0e-8, w0: 29.1241, wd: 1.01444e-5, a: 0.387098, e0: 0.205635, ed: 5.59e-10, M0: 168.6562, Md: 4.0923344368 },
  venus: { N0: 76.6799, Nd: 2.4659e-5, i0: 3.3946, id: 2.75e-8, w0: 54.891, wd: 1.38374e-5, a: 0.72333, e0: 0.006773, ed: -1.302e-9, M0: 48.0052, Md: 1.6021302244 },
  earth: { N0: 0, Nd: 0, i0: 0, id: 0, w0: 102.94, wd: 4.70935e-5, a: 1.0, e0: 0.016709, ed: -1.151e-9, M0: 356.047, Md: 0.9856002585 },
  mars: { N0: 49.5574, Nd: 2.11081e-5, i0: 1.8497, id: -1.78e-8, w0: 286.5016, wd: 2.92961e-5, a: 1.523688, e0: 0.093405, ed: 2.516e-9, M0: 18.6021, Md: 0.5240207766 },
  jupiter: { N0: 100.4542, Nd: 2.76854e-5, i0: 1.303, id: -1.557e-7, w0: 273.8777, wd: 1.64505e-5, a: 5.20256, e0: 0.048498, ed: 4.469e-9, M0: 19.895, Md: 0.0830853001 },
  saturn: { N0: 113.6634, Nd: 2.3898e-5, i0: 2.4886, id: -1.081e-7, w0: 339.3939, wd: 2.97661e-5, a: 9.55475, e0: 0.055546, ed: -9.499e-9, M0: 316.967, Md: 0.0334442282 },
}

// 开普勒方程：由平近点角 M（度）解偏近点角 E（度）。
function solveKepler(M: number, e: number): number {
  let E = M + (180 / Math.PI) * e * sin(M) * (1 + e * cos(M))
  for (let k = 0; k < 5; k++) {
    E = E - (E - (180 / Math.PI) * e * sin(E) - M) / (1 - e * cos(E))
  }
  return E
}

// 日心黄道直角坐标（AU）
function heliocentricXYZ(el: Elements, d: number): [number, number, number] {
  const N = el.N0 + el.Nd * d
  const i = el.i0 + el.id * d
  const w = el.w0 + el.wd * d
  const e = el.e0 + el.ed * d
  const a = el.a
  const M = norm(el.M0 + el.Md * d, 360)
  const E = solveKepler(M, e)
  const xv = a * (cos(E) - e)
  const yv = a * (Math.sqrt(1 - e * e) * sin(E))
  const v = Math.atan2(yv, xv) / DEG
  const r = Math.sqrt(xv * xv + yv * yv)
  const xh = r * (cos(N) * cos(v + w) - sin(N) * sin(v + w) * cos(i))
  const yh = r * (sin(N) * cos(v + w) + cos(N) * sin(v + w) * cos(i))
  const zh = r * sin(v + w) * sin(i)
  return [xh, yh, zh]
}

// 行星地心黄经（度）
export function planetLongitude(jd: number, key: PlanetKey): number {
  const d = jd - 2451543.5 // Schlyter 纪元：2000 Jan 0.0
  const [xp, yp] = heliocentricXYZ(ELEMENTS[key], d)
  const [xe, ye] = heliocentricXYZ(ELEMENTS.earth, d)
  return norm(Math.atan2(yp - ye, xp - xe) / DEG, 360)
}
