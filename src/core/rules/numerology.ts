// 生命灵数 / 生日数（西方数字学）。
// 规则：把出生年月日的所有数字相加，再逐位相加化简到个位数；
// 11、22、33 为「大师数」，保留不化简（用户已确认）。

/**
 * 把一个数反复「各位相加」，直到个位数或大师数 11/22/33。
 */
export function reduceDigits(n: number): number {
  let x = n
  while (x > 9 && x !== 11 && x !== 22 && x !== 33) {
    x = String(x)
      .split('')
      .reduce((s, c) => s + Number(c), 0)
  }
  return x
}

function digitSum(n: number): number {
  return String(n)
    .split('')
    .reduce((s, c) => s + Number(c), 0)
}

/** 生命灵数：出生年月日所有数字相加再化简，保留大师数 */
export function lifePathNumber(year: number, month: number, day: number): number {
  return reduceDigits(digitSum(year) + digitSum(month) + digitSum(day))
}

/** 生日数：出生「日」化简到个位数（保留大师数 11/22） */
export function birthDayNumber(day: number): number {
  return reduceDigits(day)
}
