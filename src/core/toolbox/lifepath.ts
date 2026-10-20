// 生命灵数（生命数字 / Life Path Number，西方数理）：把出生公历日期的每个数字相加，
// 一路归约到 1–9（或保留 11/22/33 大师数），再对照性格与天赋白话解读。仅供娱乐参考。

export interface LifePathResult {
  lifePath: number // 1–9，或 11/22/33
  isMaster: boolean
  firstSum: number // 第一次相加的结果（两位数，用于取天赋数）
  talent: number[] // 天赋数（firstSum 的各位数字）
  title: string
  text: string
  talents: { n: number; text: string }[]
}

function digitsOf(n: number): number[] {
  return String(n).split('').map((c) => Number(c))
}
function sumDigits(n: number): number {
  return digitsOf(n).reduce((a, b) => a + b, 0)
}

const LIFE_TITLE: Record<number, string> = {
  1: '开创者 · 领袖',
  2: '协调者 · 外交家',
  3: '表达者 · 创意家',
  4: '建造者 · 实干家',
  5: '冒险家 · 自由派',
  6: '守护者 · 责任家',
  7: '思考者 · 探索家',
  8: '掌权者 · 成就家',
  9: '博爱者 · 圆满者',
  11: '直觉者 · 灵感大师',
  22: '建造者 · 大师之手',
  33: '导师 · 大师之爱',
}

const LIFE_TEXT: Record<number, string> = {
  1: '天生的开创者。你独立、有主见，喜欢走在最前面，认定的事就一定要做出个样子来。人生课题是学会合作，别把所有事都一个人扛。',
  2: '天生的协调者。你温和、善解人意，天生懂得体察别人的情绪，是朋友眼里的和事佬。人生课题是学会为自己拿主意，别一味迁就。',
  3: '天生的表达者。你口才好、点子多，走到哪儿都能活跃气氛，是艺术与创意的料。人生课题是专注，把才华落到一件事上做深。',
  4: '天生的建造者。你踏实、靠谱、有条理，最擅长把想法变成扎实的结果。人生课题是灵活变通，别让规矩框死自己。',
  5: '天生的冒险家。你自由、爱新鲜，讨厌一成不变，人生注定精彩多变。人生课题是定性与承诺，别总在跳来跳去。',
  6: '天生的守护者。你重情重义、有责任心，家人朋友的事就是自己的事。人生课题是学会松手，别把自己累成别人的靠山。',
  7: '天生的思考者。你敏锐、爱深究，喜欢独处思考，越研究越有味道。人生课题是打开心扉，别活得太孤高。',
  8: '天生的掌权者。你对钱与权力有天然的嗅觉，目标感强，是能成大事的料。人生课题是平衡金钱与人情，别太功利。',
  9: '天生的博爱者。你格局大、有同理心，看事情总比别人高一层。人生课题是落实现实，别只谈理想。',
  11: '大师数 11——直觉与灵感的天赋异禀，你比常人更敏感、更有洞察力。人生课题是把灵感转化成实际成果，别只停留在「想」。',
  22: '大师数 22——最难得的建造者，能把宏大的愿景一砖一瓦搭成现实。人生课题是别被宏大压垮，先从小事做起。',
  33: '大师数 33——无条件的爱与疗愈，你天生有照亮他人的能量。人生课题是先照顾好自己，再照亮别人。',
}

const TALENT_TEXT: Record<number, string> = {
  0: '灵性潜能——超越常理的直觉与无限可能，关键在于落地。',
  1: '开创与领导——天生爱主导，敢想敢做，适合牵头做事。',
  2: '协调与合作——善解人意，长于沟通与斡旋，是天生的调和者。',
  3: '表达与创意——能说会道、点子多，有艺术与表达的料。',
  4: '务实与秩序——踏实可靠，擅长把想法变成可执行的流程。',
  5: '自由与变通——不安于现状，适应力强，喜欢探索多元人生。',
  6: '责任与关怀——重视家庭与人际，天生会照顾人、值得信赖。',
  7: '思考与钻研——爱分析、爱深究，适合研究型、技术型路线。',
  8: '权力与经营——对钱与资源敏感，有管理与经营的天赋。',
  9: '博爱与同理——格局大、有同理心，适合公益或整合型事业。',
}

export function computeLifePath(year: number, month: number, day: number): LifePathResult {
  const firstSum = sumDigits(year) + sumDigits(month) + sumDigits(day)
  let lifePath = firstSum
  while (lifePath >= 10 && lifePath !== 11 && lifePath !== 22 && lifePath !== 33) {
    lifePath = sumDigits(lifePath)
  }
  const talent = digitsOf(firstSum)
  return {
    lifePath,
    isMaster: lifePath === 11 || lifePath === 22 || lifePath === 33,
    firstSum,
    talent,
    title: LIFE_TITLE[lifePath] ?? '未知',
    text: LIFE_TEXT[lifePath] ?? '',
    talents: talent.map((n) => ({ n, text: TALENT_TEXT[n] ?? '' })),
  }
}
