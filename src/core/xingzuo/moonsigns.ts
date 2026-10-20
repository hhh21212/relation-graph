// 星座月亮星座图鉴：十二月亮星座的情感需求、安全感、情绪模式。仅供娱乐参考。

export interface MoonSignReading {
  need: string // 情感需求
  security: string // 安全感来源
  mood: string // 情绪模式
  tip: string // 相处提示
  match: string // 适配星座
}

// 下标 0=白羊 … 11=双鱼
export const MOON_SIGNS: MoonSignReading[] = [
  { need: '即时回应与被看见', security: '有目标可冲、被肯定', mood: '来得快去得快、直来直往', tip: '给足即时回应，别让 TA 的情绪悬着。', match: '狮子、射手' },
  { need: '稳定与实在的陪伴', security: '熟悉的人事物、物质安稳', mood: '慢热，一旦情绪起来很执拗', tip: '用稳定的陪伴与实实在在的照顾打动 TA。', match: '处女、摩羯' },
  { need: '交流与新鲜感', security: '聊得来、信息通畅', mood: '情绪轻快、容易转移', tip: '多聊天、多分享新鲜事，别让 TA 无聊。', match: '天秤、水瓶' },
  { need: '被温柔对待与归属感', security: '家与亲近的人', mood: '敏感恋旧、情绪随亲近的人起伏', tip: '多给温柔与家的感觉，照顾 TA 的小情绪。', match: '金牛、双鱼' },
  { need: '被欣赏与认可', security: '被重视、有存在感', mood: '外放热烈、受伤后强撑面子', tip: '大方地赞美与认可，给足 TA 面子。', match: '白羊、射手' },
  { need: '被理解那份操心', security: '井井有条、可控', mood: '内敛、用细节表达、容易焦虑', tip: '把细节做周到，少一点挑剔多一点耐心。', match: '金牛、摩羯' },
  { need: '和谐与陪伴', security: '关系平衡、有人一起', mood: '怕冲突、犹豫、需要被分担', tip: '主动维系平衡，陪 TA 一起做决定。', match: '双子、水瓶' },
  { need: '绝对的信赖与忠诚', security: '深度的掌控与了解', mood: '浓烈深沉、记仇但也深情', tip: '给足忠诚与安全感，别对 TA 有所隐瞒。', match: '巨蟹、双鱼' },
  { need: '自由与成长空间', security: '乐观的伙伴、不被束缚', mood: '情绪来去快、讨厌负面纠缠', tip: '给 TA 自由，一起玩一起成长。', match: '白羊、狮子' },
  { need: '被依靠与肯定', security: '责任感与成就', mood: '内敛、习惯自己扛、少有外露', tip: '尊重 TA 的责任感，给实际的支持与肯定。', match: '金牛、处女' },
  { need: '独立空间与灵魂共鸣', security: '理念被尊重、不被管', mood: '理性疏离、抽离式观察', tip: '尊重 TA 的独立空间，聊得来最重要。', match: '双子、天秤' },
  { need: '被包容与呵护', security: '情感流动、被理解', mood: '柔软易感、共情力强、易入戏', tip: '多包容呵护，接住 TA 的柔软情绪。', match: '巨蟹、天蝎' },
]
