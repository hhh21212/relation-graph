// 紫微斗数 · 十四主星双星同宫组合（24 组）+ 白话解读。仅供娱乐参考。
// 双星同宫必为「紫微系 × 天府系」各一星；key 按星名拼音排序，用「|」连接。

export interface Combo {
  name: string
  palaces: string // 同宫宫位，如「寅申」
  desc: string
}

export const COMBOS: Record<string, Combo> = {
  // —— 紫微系列 ——
  'tianfu|ziwei': { name: '紫微天府', palaces: '寅申', desc: '两大帝王星同宫，尊贵又稳重、天生有领导相，名利之心皆重。优点是格局大、能掌权；缺点是偏保守、放不下身段，容易孤高、姻缘较淡。' },
  'tanlang|ziwei': { name: '紫微贪狼', palaces: '卯酉', desc: '帝星配桃花星，才艺与欲望并存、人缘魅力都旺。紫微能压住贪狼的浮躁，交际手腕与亲和力都强，很适合跑业务、搞人际。' },
  'tianxiang|ziwei': { name: '紫微天相', palaces: '辰戌', desc: '尊贵而圆融，能屈能伸、擅长辅佐与掌权，是标准的「二把手」气质。比起紫府少了霸气、多了谦和，但易情绪起伏、爱挑刺。' },
  'qisha|ziwei': { name: '紫微七杀', palaces: '巳亥', desc: '将星随帝星，魄力十足、敢冲敢守，是开创型的领导。紫微中和了七杀的冲劲，比七杀单星稳重坚毅，能干大事。' },
  'pojun|ziwei': { name: '紫微破军', palaces: '丑未', desc: '帝星配破军，喜欢变化创新、一生充满戏剧性转折，横发横败都随大运。能动能静、敢冲敢守，但煞星多时易大起大落。' },

  // —— 武曲系列 ——
  'tianfu|wuqu': { name: '武曲天府', palaces: '子午', desc: '双财星同宫，武曲组合里格局最大、最好的一组，理财与事业皆强。三方若会禄存或化禄、不见煞星，就是标准进财格。' },
  'tanlang|wuqu': { name: '武曲贪狼', palaces: '丑未', desc: '正财星配偏财星，来钱路子多、敢闯敢拼，特别适合做生意、搞项目。但欲望偏强、易起落，需要见好就收。' },
  'tianxiang|wuqu': { name: '武曲天相', palaces: '寅申', desc: '将星配印星，有原则、会协调，做事既有魄力又讲章法，适合带团队、做管理。' },
  'qisha|wuqu': { name: '武曲七杀', palaces: '卯酉', desc: '双将星同宫，性子刚、行动力爆表，敢打敢拼。事业心极强，但易冲动冒进，需收敛锋芒、借吉星调和。' },
  'pojun|wuqu': { name: '武曲破军', palaces: '巳亥', desc: '武曲组合里较辛苦的一组，财星逢破、钱财易破荡，一生多变动奔波。须二星庙旺、加禄存且无煞冲，方能成格。' },

  // —— 廉贞系列 ——
  'lianzhen|tianfu': { name: '廉贞天府', palaces: '辰戌', desc: '廉贞组合里最好的格局，又叫「桃花带财」，公关能力一流、作风强势主观。但若逢煞星，易霸道自私、沉迷酒色，且官非较多。' },
  'lianzhen|tanlang': { name: '廉贞贪狼', palaces: '巳亥', desc: '两大桃花星同宫，魅力与欲望都到顶，才艺出众、人际吃得开。吉星相助则名利双收；煞星一冲则易风流成性、为情破财。' },
  'lianzhen|tianxiang': { name: '廉贞天相', palaces: '子午', desc: '廉贞的才情配上天相的圆融，做人得体、能文能武，事业上既稳又有手腕，是不错的组合。' },
  'lianzhen|qisha': { name: '廉贞七杀', palaces: '丑未', desc: '次桃花配将星，性子烈、敢爱敢恨、执行力强，适合打硬仗的行业。但脾气偏硬、易树敌，需修口德。' },
  'lianzhen|pojun': { name: '廉贞破军', palaces: '卯酉', desc: '吉凶非常极端的组合，思想极端、作风霸道善变，一生大起大落。感情上多波折，需吉星化解，否则属高危险格局。' },

  // —— 天机系列 ——
  'taiyin|tianji': { name: '天机太阴', palaces: '寅申', desc: '聪明配温柔，心思细腻、点子多又重感情，适合策划、文职、设计。缺点是易多虑、情绪化。' },
  'jumen|tianji': { name: '天机巨门', palaces: '卯酉', desc: '智谋配口才，脑子快、嘴巴也快，最适合靠嘴和点子吃饭。但易招口舌是非，话到嘴边留三分。' },
  'tianji|tianliang': { name: '天机天梁', palaces: '辰戌', desc: '善谋配善断，正直有担当、擅长替人排忧解难，是「军师型」人才。缺点是爱操心、爱管闲事。' },

  // —— 太阳系列 ——
  'taiyang|taiyin': { name: '太阳太阴', palaces: '丑未', desc: '日月同宫，性格圆融、情绪丰富、人缘极佳，男女通吃。但情绪波动较大，容易一会儿晴一会儿雨。' },
  'jumen|taiyang': { name: '太阳巨门', palaces: '寅申', desc: '阳光配口才，热情又能说，天生适合讲台、销售、传媒。光明磊落但话多易招是非，需低调。' },
  'taiyang|tianliang': { name: '太阳天梁', palaces: '卯酉', desc: '光明配荫星，热心公益、乐于助人、有长辈缘，是天生的「大家长」。爱面子、爱管闲事，但口碑好。' },

  // —— 天同系列 ——
  'taiyin|tiantong': { name: '天同太阴', palaces: '子午', desc: '福星配柔情，是最悠闲安逸的组合，随和好相处、自带福气。女性易为情所困；男性温柔有余、冲劲稍欠。' },
  'jumen|tiantong': { name: '天同巨门', palaces: '丑未', desc: '福星配口舌，口才好、批判力强，但个性偏硬、主观多疑，感情上较辛苦，需多沟通、少较真。' },
  'tianliang|tiantong': { name: '天同天梁', palaces: '寅申', desc: '福荫相聚、最能逢凶化吉，天生有贵人庇佑，一生意外灾祸概率低。心态好、晚运尤佳。' },
}

// 由落宫主星 keys（1~2 颗）取双星组合；单星或非双星返回 null。
export function comboOf(keys: string[]): Combo | null {
  if (keys.length !== 2) return null
  return COMBOS[[...keys].sort().join('|')] ?? null
}
