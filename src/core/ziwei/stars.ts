// 紫微斗数 · 十四主星与四化：星曜资料 + 生年四化表。仅供娱乐参考。

export interface Star {
  key: string
  name: string
  wuxing: string // 五行
  kind: '紫微系' | '天府系'
  traits: string[] // 性格关键词
  desc: string // 白话解读
}

export const STARS: Star[] = [
  { key: 'ziwei', name: '紫微', wuxing: '土', kind: '紫微系', traits: ['尊贵', '领导', '爱面子'], desc: '帝座之星，天生带领导气质、有主见也有担当，喜欢被尊重与认可。要注意的是别太爱面子、听不进劝。' },
  { key: 'tianji', name: '天机', wuxing: '木', kind: '紫微系', traits: ['聪明', '善变', '点子多'], desc: '智谋之星，脑筋转得快、心思细腻，最擅长动脑与策划。缺点是容易想太多、三心二意。' },
  { key: 'taiyang', name: '太阳', wuxing: '火', kind: '紫微系', traits: ['热情', '慷慨', '光明'], desc: '光明之星，热情大方、乐于助人，天生有照亮别人的能量。要注意别太操心、把自己累着。' },
  { key: 'wuqu', name: '武曲', wuxing: '金', kind: '紫微系', traits: ['果断', '重财', '执行力'], desc: '将星兼财星，性格刚毅果断、执行力强，对钱与事业特别有感觉。缺点是性子偏硬、少点人情味。' },
  { key: 'tiantong', name: '天同', wuxing: '水', kind: '紫微系', traits: ['随和', '福气', '爱享受'], desc: '福星，性情温和、不爱争抢，自带福气与好人缘。缺点是容易安于现状、少点冲劲。' },
  { key: 'lianzhen', name: '廉贞', wuxing: '火', kind: '紫微系', traits: ['多才', '执着', '爱恨分明'], desc: '囚星亦是次桃花，多才多艺、有魅力也重情，做事有一股狠劲。要注意情绪起伏、别钻牛角尖。' },
  { key: 'tianfu', name: '天府', wuxing: '土', kind: '天府系', traits: ['稳重', '包容', '有库'], desc: '南斗之首、财库之星，稳重包容、善于经营与守成，天生有福气。缺点是偏保守、心机略深。' },
  { key: 'taiyin', name: '太阴', wuxing: '水', kind: '天府系', traits: ['温柔', '细腻', '内敛'], desc: '月之精、内敛之星，温柔细腻、重感情也重家庭，是温和的守护者。要注意别太敏感多虑。' },
  { key: 'tanlang', name: '贪狼', wuxing: '木', kind: '天府系', traits: ['多才', '桃花', '欲望强'], desc: '桃花之星，多才多艺、交际手腕一流，欲望与企图心都很强。要注意别太贪心、沉溺享乐。' },
  { key: 'jumen', name: '巨门', wuxing: '水', kind: '天府系', traits: ['口才', '是非', '洞察'], desc: '口舌之星，能言善道、观察入微，天生适合靠嘴吃饭。缺点是容易招惹是非、讲话太直。' },
  { key: 'tianxiang', name: '天相', wuxing: '水', kind: '天府系', traits: ['得体', '辅佐', '人缘'], desc: '印星、辅佐之星，做事得体、乐于助人，是天生的好副手与和事佬。缺点是主见稍弱、易随波逐流。' },
  { key: 'tianliang', name: '天梁', wuxing: '土', kind: '天府系', traits: ['正直', '长辈缘', '庇护'], desc: '荫星、长辈之星，正直有担当、乐于照顾人，天生有贵人庇佑。缺点是爱管闲事、有点啰嗦。' },
  { key: 'qisha', name: '七杀', wuxing: '金', kind: '天府系', traits: ['勇猛', '冲劲', '果决'], desc: '将星、肃杀之星，行动力爆表、敢闯敢拼，遇事果断不拖泥带水。缺点是性子急、容易冲动。' },
  { key: 'pojun', name: '破军', wuxing: '水', kind: '天府系', traits: ['破旧立新', '变动', '魄力'], desc: '耗星、破旧立新之星，胆大敢变、魄力十足，最擅长在变化里闯出新局。要注意别太冲动、反复无常。' },
]

export const STAR_MAP: Record<string, Star> = Object.fromEntries(STARS.map((s) => [s.key, s]))

// 生年四化（传统派）：key = 年干 0=甲…9=癸
export const SIHUA: { lu: string; quan: string; ke: string; ji: string }[] = [
  { lu: 'lianzhen', quan: 'pojun', ke: 'wuqu', ji: 'taiyang' }, // 甲
  { lu: 'tianji', quan: 'tianliang', ke: 'ziwei', ji: 'taiyin' }, // 乙
  { lu: 'tiantong', quan: 'tianji', ke: 'wenchang', ji: 'lianzhen' }, // 丙
  { lu: 'taiyin', quan: 'tiantong', ke: 'tianji', ji: 'jumen' }, // 丁
  { lu: 'tanlang', quan: 'taiyin', ke: 'youbi', ji: 'tianji' }, // 戊
  { lu: 'wuqu', quan: 'tanlang', ke: 'tianliang', ji: 'wenqu' }, // 己
  { lu: 'taiyang', quan: 'wuqu', ke: 'taiyin', ji: 'tiantong' }, // 庚
  { lu: 'jumen', quan: 'taiyang', ke: 'wenqu', ji: 'wenchang' }, // 辛
  { lu: 'tianliang', quan: 'ziwei', ke: 'zuofu', ji: 'wuqu' }, // 壬
  { lu: 'pojun', quan: 'jumen', ke: 'taiyin', ji: 'tanlang' }, // 癸
]

// 四化含义
export const SIHUA_MEANING = {
  lu: '化禄 · 财禄、机会、顺遂',
  quan: '化权 · 掌权、掌控、上进',
  ke: '化科 · 名声、才艺、贵人',
  ji: '化忌 · 压力、不顺、需注意',
} as const

// 十三辅星（六吉 + 六煞 + 禄存），随命盘排布。
export interface AuxStar {
  key: string
  name: string
  kind: '吉' | '煞' | '禄'
  desc: string
}

export const AUX_STARS: AuxStar[] = [
  { key: 'lucun', name: '禄存', kind: '禄', desc: '财禄之星，主衣禄丰足，但忌被擎羊陀罗夹。' },
  { key: 'zuofu', name: '左辅', kind: '吉', desc: '左膀右臂、贵人相助，为人得力。' },
  { key: 'youbi', name: '右弼', kind: '吉', desc: '助力之星，人缘好、有辅佐之福。' },
  { key: 'wenchang', name: '文昌', kind: '吉', desc: '文星，主聪明才学、利考试读书。' },
  { key: 'wenqu', name: '文曲', kind: '吉', desc: '才艺之星，主口才技艺、利艺术。' },
  { key: 'tiankui', name: '天魁', kind: '吉', desc: '贵人星，逢凶化吉、得长辈提携。' },
  { key: 'tianyue', name: '天钺', kind: '吉', desc: '贵人星，暗中相助、得异性贵人。' },
  { key: 'qingyang', name: '擎羊', kind: '煞', desc: '刑星，性急冲动、易有口舌是非。' },
  { key: 'tuoluo', name: '陀罗', kind: '煞', desc: '忌星，主拖延、反复、暗中受阻。' },
  { key: 'huoxing', name: '火星', kind: '煞', desc: '暴星，性烈如火、来得快去得快。' },
  { key: 'lingxing', name: '铃星', kind: '煞', desc: '阴火，主暗耗、纠纷、拖延。' },
  { key: 'dikong', name: '地空', kind: '煞', desc: '空亡星，主幻想、波折、不切实际。' },
  { key: 'dijie', name: '地劫', kind: '煞', desc: '劫星，主破耗、波折、多变动。' },
]

export const AUX_MAP: Record<string, AuxStar> = Object.fromEntries(AUX_STARS.map((s) => [s.key, s]))

export function starNameOf(key: string): string {
  return STAR_MAP[key]?.name ?? AUX_MAP[key]?.name ?? key
}

// ---------------- 星曜亮度（庙/旺/平/陷） ----------------

export type Brightness = '庙' | '旺' | '平' | '陷'

// 十四主星庙旺陷表（简化四档），据陆斌兆—王亭之体系整理。地支：子0 丑1 寅2 卯3 辰4 巳5 午6 未7 申8 酉9 戌10 亥11。
const BRIGHTNESS_TABLE: Record<string, { miao: number[]; wang: number[]; xian: number[] }> = {
  ziwei: { miao: [1, 6, 7], wang: [3, 5, 8, 11], xian: [4, 10] }, // 庙丑午未，旺卯巳申亥，陷辰戌
  tianji: { miao: [0, 6, 3, 9], wang: [], xian: [1, 7] }, // 庙子午卯酉，陷丑未
  taiyang: { miao: [2, 3, 4, 5, 6], wang: [], xian: [9, 10, 11, 0] }, // 庙寅卯辰巳午，陷酉戌亥子
  wuqu: { miao: [1, 7, 4, 10], wang: [], xian: [5, 11] }, // 庙丑未辰戌，陷巳亥
  tiantong: { miao: [2, 3, 8, 9], wang: [], xian: [1, 7] }, // 庙寅卯申酉，陷丑未
  lianzhen: { miao: [2, 8, 7], wang: [], xian: [5, 11] }, // 庙寅申未，陷巳亥
  tianfu: { miao: [2, 8, 5, 11], wang: [], xian: [3, 9] }, // 庙寅申巳亥，陷卯酉
  taiyin: { miao: [9, 10, 11, 0], wang: [], xian: [5, 6] }, // 庙酉戌亥子，陷巳午
  tanlang: { miao: [0, 6, 3, 9], wang: [], xian: [2, 8] }, // 庙子午卯酉，陷寅申
  jumen: { miao: [0, 6, 3, 9], wang: [], xian: [2, 8] }, // 庙子午卯酉，陷寅申
  tianxiang: { miao: [1, 7, 5, 11], wang: [], xian: [3, 9] }, // 庙丑未巳亥，陷卯酉
  tianliang: { miao: [0, 6, 3, 9], wang: [], xian: [5, 11] }, // 庙子午卯酉，陷巳亥
  qisha: { miao: [2, 8, 5, 11], wang: [], xian: [3, 9] }, // 庙寅申巳亥，陷卯酉
  pojun: { miao: [0, 6, 3, 9], wang: [], xian: [2, 8] }, // 庙子午卯酉，陷寅申
}

export function brightnessOf(starKey: string, branch: number): Brightness {
  const t = BRIGHTNESS_TABLE[starKey]
  if (!t) return '平'
  if (t.miao.includes(branch)) return '庙'
  if (t.wang.includes(branch)) return '旺'
  if (t.xian.includes(branch)) return '陷'
  return '平'
}
