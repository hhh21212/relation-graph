// 性格画像：把一个人的命理数据翻译成大白话的性格描述 + 相处建议。
// 依据：八字日主（主）、五行旺衰、生肖、星座、生命灵数（辅）。
// 只使用主流公认的说法，不碰用神/格局/大运等有流派分歧的内容；结果仅供娱乐参考。

import { Person } from '../../types/person'
import { PersonalityProfile } from '../../types/personality'
import { ShiShenCategory } from '../../types/luming'
import { computeBaZi, BaZiResult, Pillar } from '../rules/bazi'
import { computeLuMing } from '../rules/luming'
import { zodiacOf } from '../rules/zodiac'
import { westZodiac } from '../rules/zodiacWest'
import { lifePathNumber } from '../rules/numerology'
import { WuXing, WU_XING, STEM_WU_XING, BRANCH_WU_XING, wuXingRelation } from '../rules/fiveElement'
import { Stem, isTianGanHe } from '../rules/ganzhi'

// ---------------- 日主十天干气质（主流公认） ----------------
const DAY_MASTER: Record<Stem, { label: string; nature: string; traits: string[]; getAlong: string[] }> = {
  0: {
    label: '甲木',
    nature: '像一棵向上生长的大树，正直、有担当',
    traits: ['有主见，不服输，认定的事就往前冲', '正直坦率，愿意扛责任', '目标感强，不甘于原地踏步', '偶尔固执，认准了就不回头'],
    getAlong: ['多给他空间去闯，别急着否定他', '讲道理、讲事实，比打感情牌更管用', '他吃软不吃硬，先肯定再提意见'],
  },
  1: {
    label: '乙木',
    nature: '像花草藤蔓，柔韧、灵活、善于适应',
    traits: ['温和好相处，能屈能伸', '观察细，很会察言观色', '适应力强，什么环境都能扎根', '有时优柔寡断，缺一点主见'],
    getAlong: ['别逼他太紧，给他缓冲的空间', '有事多商量，他愿意配合而不是被命令', '他需要安全感，多给肯定和鼓励'],
  },
  2: {
    label: '丙火',
    nature: '像太阳，热情、光明、藏不住情绪',
    traits: ['热情开朗，走到哪都自带热度', '心直口快，喜怒都写在脸上', '行动力强，说干就干', '有时急躁，容易三分钟热度'],
    getAlong: ['多夸他、捧他，他的能量会翻倍', '别跟他冷战，有事当面说开', '他藏不住话，说重了也别往心里去'],
  },
  3: {
    label: '丁火',
    nature: '像烛火，温和、细腻、有洞察力',
    traits: ['心思细腻，很会照顾人', '观察入微，能看透别人的情绪', '敏感，容易想多', '表面温和，内心有自己的一套坚持'],
    getAlong: ['多在意他的感受，别忽略小细节', '有话温柔点说，他比较容易受伤', '给他真诚的回应，他才安心'],
  },
  4: {
    label: '戊土',
    nature: '像山岳大地，稳重、厚道、靠得住',
    traits: ['稳重可靠，是那种能让人安心的人', '重承诺、讲信用', '包容心强，不轻易翻脸', '有时固执，认死理'],
    getAlong: ['他吃软不吃硬，别正面硬顶', '答应他的事一定要做到，他记性很好', '给他时间慢慢想，逼急了反而更倔'],
  },
  5: {
    label: '己土',
    nature: '像田园沃土，细腻、务实、滋养别人',
    traits: ['踏实细心，做事让人放心', '会照顾人，甘愿当配角', '精打细算，很务实', '有时想太多，过于谨慎'],
    getAlong: ['少让他猜，直来直去更省心', '认可他的付出，他很吃这一套', '别嫌他啰嗦，那是他在乎你'],
  },
  6: {
    label: '庚金',
    nature: '像刀剑金属，果断、刚强、重义气',
    traits: ['果断干脆，不拖泥带水', '原则性强，说一不二', '重情重义，为朋友能两肋插刀', '有时太硬，容易无意中伤人'],
    getAlong: ['跟他讲规则、讲原则，别打太极', '别当面驳他面子，他很看重这个', '他认死理，硬碰硬只会两败俱伤'],
  },
  7: {
    label: '辛金',
    nature: '像珠宝玉石，精致、敏感、追求完美',
    traits: ['追求品质和细节，很讲究', '自尊心强，好面子', '有审美、有品味', '有时挑剔，容易玻璃心'],
    getAlong: ['多夸他、认可他的品味', '别当众让他下不来台', '他吃软不吃硬，给足面子就很好相处'],
  },
  8: {
    label: '壬水',
    nature: '像江河大海，聪明、奔放、不安于现状',
    traits: ['聪明机灵，点子特别多', '心胸开阔，不记仇', '向往自由，最不喜欢被管束', '有时善变，比较随性'],
    getAlong: ['别管太死，给他自由才留得住', '有事好商量，他吃软不吃硬', '他忘性大不记仇，你也不用自己生闷气'],
  },
  9: {
    label: '癸水',
    nature: '像雨露细流，柔和、智慧、内敛',
    traits: ['温柔细腻，很有同理心', '心思深沉，想得多', '内敛低调，不爱出风头', '有时多愁善感，比较被动'],
    getAlong: ['主动一点引导他，他偏被动', '多给他安全感，他才愿意打开心扉', '别嫌他慢热，熟起来很贴心'],
  },
}

// ---------------- 五行旺衰气质 ----------------
const WU_XING_NATURE: Record<WuXing, { strong: string; weak: string }> = {
  金: {
    strong: '金气足：果断、有原则、重义气，但有时偏硬、不爱转弯',
    weak: '金偏弱：决断和原则感稍弱，心软，容易迁就别人',
  },
  木: {
    strong: '木气足：有主见、向上、有生命力，但容易固执己见',
    weak: '木偏弱：冲劲和主见稍弱，往往需要有人推一把才动',
  },
  水: {
    strong: '水气足：聪明、灵活、点子多，但容易心思多变',
    weak: '水偏弱：变通和圆滑稍弱，偏一根筋，不太会拐弯',
  },
  火: {
    strong: '火气足：热情、行动力强、藏不住情绪，但容易急躁',
    weak: '火偏弱：热情和行动力稍弱，偏安静、慢热',
  },
  土: {
    strong: '土气足：稳重、可靠、能扛事，但有时保守、认死理',
    weak: '土偏弱：安全感和稳定性稍弱，容易想太多、没底气',
  },
}

// ---------------- 生肖性格 ----------------
const ZODIAC_PERSONALITY: { traits: string[] }[] = [
  { traits: ['机灵、反应快', '适应力强', '精打细算，会过日子'] }, // 鼠
  { traits: ['踏实肯干，有耐心', '靠得住、重承诺', '认准了就不太会变通'] }, // 牛
  { traits: ['有魄力、敢闯敢干', '气场强、有领导欲', '有时冲动、不服管'] }, // 虎
  { traits: ['温和、有分寸', '人缘好、不惹事', '敏感，容易顾虑多'] }, // 兔
  { traits: ['自信、有气场', '好面子、要排面', '心气高，不愿服输'] }, // 龙
  { traits: ['冷静、有城府', '洞察力强，看得透', '做事有耐心，深藏不露'] }, // 蛇
  { traits: ['热情、爱自由', '行动快、坐不住', '心直口快，不喜欢被约束'] }, // 马
  { traits: ['温和、善良、心软', '重视家庭和感情', '有时优柔，容易受委屈'] }, // 羊
  { traits: ['聪明、机灵、点子多', '善交际、会来事', '有时太活络，让人不踏实'] }, // 猴
  { traits: ['认真、有条理、守规矩', '勤快、爱较真', '对自己对别人要求都高'] }, // 鸡
  { traits: ['忠诚、讲义气', '可靠、有责任心', '有时保守，不太敢冒险'] }, // 狗
  { traits: ['随和、乐观、心宽', '不记仇、好相处', '有时太随性，容易拖延'] }, // 猪
]

// ---------------- 星座性格（娱乐参考） ----------------
const WEST_PERSONALITY: Record<string, string[]> = {
  白羊座: ['直率、有冲劲', '行动快，藏不住话', '容易三分钟热度'],
  金牛座: ['稳重、务实、有耐心', '对钱和安全感敏感', '慢热，认准了就很执着'],
  双子座: ['灵活、话多、脑子转得快', '好奇心强，兴趣广', '有时善变、坐不住'],
  巨蟹座: ['顾家、念旧、重感情', '敏感、共情力强', '情绪起伏，容易多想'],
  狮子座: ['大方、自信、有担当', '好面子、要认可', '气场强，偶尔霸道'],
  处女座: ['细心、靠谱、追求完美', '有条理、爱较真', '有时挑剔、焦虑'],
  天秤座: ['温和、优雅、重视平衡', '人缘好、会协调', '选择困难，容易纠结'],
  天蝎座: ['深情、专注、有洞察力', '爱憎分明', '占有欲强，不易交心'],
  射手座: ['乐观、爱自由、心大', '直率、爱冒险', '粗线条，坐不住'],
  摩羯座: ['靠谱、隐忍、有事业心', '目标感强、能吃苦', '有时太严肃、不爱表达'],
  水瓶座: ['独立、理性、有想法', '重视朋友、有点疏离', '不喜被管，有时冷'],
  双鱼座: ['温柔、浪漫、共情力强', '心软、爱幻想', '多愁善感，容易逃避'],
}

// ---------------- 生命灵数性格 ----------------
const NUMEROLOGY_PERSONALITY: Record<number, string[]> = {
  1: ['独立、有主见', '开创型，敢带头', '有时太自我、不服管'],
  2: ['温和、会合作', '细腻、善解人意', '有时依赖、优柔'],
  3: ['表达力强、乐观', '有创意、爱热闹', '有时散漫、三分钟热度'],
  4: ['踏实、务实、守规矩', '可靠、有耐心', '有时固执、放不开'],
  5: ['爱自由、多变', '喜欢冒险、适应力强', '有时不定性、难管束'],
  6: ['有责任感、顾家', '关爱、有担当', '有时操心过度、爱说教'],
  7: ['爱思考、有深度', '内省、独立', '有时孤僻、想太多'],
  8: ['目标感强、重结果', '有商业头脑、能扛事', '有时太现实、强势'],
  9: ['博爱、理想主义', '有同理心、格局大', '有时不切实际、心软'],
  11: ['直觉强、有灵感', '敏感、有感染力', '大师数：比一般人更通透'],
  22: ['大器、务实有远见', '能落地的大格局', '大师数：能成大事，压力也大'],
  33: ['大爱、有疗愈感', '有使命感、愿意奉献', '大师数：很能共情，易心累'],
}

// ---------------- 十神主导性格（子平，五大类，大白话） ----------------
const SHISHEN_PERSONALITY: Record<ShiShenCategory, string> = {
  比劫: '重情义、讲义气，把朋友当自家人，肯为熟人出头；但也争强好胜、要面子，认准了不服输，容易跟人较劲。',
  食伤: '脑子活、点子多、表达欲强，有才气也藏不住，喜欢被看见；有时锋芒太露、不服管，说话容易冲。',
  财: '务实、看重结果和实际收益，做事有计划、肯下功夫，对钱和资源敏感；有时过于现实，容易被得失牵着走。',
  官杀: '自律、有责任心、扛得住事，讲规矩、有分寸，适合挑大梁；但压力大，容易对自己和别人都要求过高、放不开。',
  印: '爱学习、好琢磨、重视内涵和安全感，心软、念旧、肯照顾人；有时想太多、偏保守，遇事爱往后缩。',
}

// ---------------- 神煞 → 大白话性格标签 ----------------
const SHENSHA_PERSONALITY: Record<string, string> = {
  华盖: '孤高爱钻研，有精神追求，喜欢独处或小众爱好',
  桃花: '有魅力、人缘旺，异性缘好，容易招人喜欢',
  驿马: '坐不住、爱跑动，喜欢变动和新鲜，适合往外闯',
  天乙贵人: '关键时候常有人帮、有贵人运，逢凶能化吉',
  羊刃: '强势、有魄力、不服输，但容易冲动、伤和气',
  将星: '有领导气场，爱出头、能服众，适合当主心骨',
  魁罡: '刚强硬气、有原则，做事果决，不轻易低头',
  空亡: '容易有空落感、有劲使不上，想法多、落地难',
  孤辰: '独、慢热，习惯自己待着，不轻易交心',
  寡宿: '独处多、偏清冷，感情上比较被动克制',
  劫煞: '容易遇波折、有竞争，须防突发麻烦',
  亡神: '心思活但容易耗散，有时心神不宁、是非多',
  文昌: '爱学习、有文才，念书考试有灵气',
  国印: '有规矩、重章法，适合走稳定体面的正路',
  金舆: '重排面、有财运底子，讲究生活品质',
  禄: '有福气、自带资源，求名求利有门路',
  红鸾: '桃花旺、易动情，感情上比较顺',
  天喜: '喜气多、人缘好，容易有开心事',
  灾煞: '容易遇突发状况，须多留神、稳字当头',
  天罗: '容易被困住、有局限感，遇事要跳出框框',
  地网: '容易受牵绊、放不开，须给自己松绑',
  阴阳差错: '感情路上容易阴差阳错，沟通要多确认',
}

// ---------------- 五行阴阳（金口诀式，不分男女，大白话） ----------------
const WU_XING_YIN_YANG: Record<Stem, string> = {
  0: '阳木（甲）：像参天大树，正直、向上、有担当；性直，认准了就往前冲，不轻易弯腰',
  1: '阴木（乙）：像花草藤蔓，柔韧、灵活、会变通；善借势，温和不硬顶',
  2: '阳火（丙）：像太阳，热情、光明、藏不住；性烈，来得快去得也快',
  3: '阴火（丁）：像烛火，温和、细腻、有洞察；柔而不散，最会照人',
  4: '阳土（戊）：像高山大地，稳重、厚道、能扛事；憨直，说话不会拐弯',
  5: '阴土（己）：像田园沃土，细腻、务实、会滋养；善藏，精打细算',
  6: '阳金（庚）：像刀剑金属，刚强、果断、重义气；最硬，宁折不弯',
  7: '阴金（辛）：像珠玉首饰，精致、敏感、好体面；爱惜羽毛，讲究分寸',
  8: '阳水（壬）：像江河奔流，聪明、奔放、不安分；善变，点子多收不住',
  9: '阴水（癸）：像雨露细流，柔和、智慧、内敛；善藏，想得多说得少',
}

// ---------------- 计算 ----------------

/** 由八字四柱的干支，统计五行分布（天干 + 地支本气） */
function wuXingCount(bazi: BaZiResult): Record<WuXing, number> {
  const count: Record<WuXing, number> = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 }
  const pillars: Pillar[] = [bazi.yearPillar, bazi.monthPillar, bazi.dayPillar, bazi.hourPillar].filter(
    (p): p is Pillar => p !== null,
  )
  for (const p of pillars) {
    count[STEM_WU_XING[p.ganZhi.stem]]++
    count[BRANCH_WU_XING[p.ganZhi.branch]]++
  }
  return count
}

function toBirthTime(p: Person) {
  return { year: p.birthYear, month: p.birthMonth, day: p.birthDay, hour: p.hour, minute: p.minute }
}

/** 生成一个人的性格画像 */
export function describePersonality(person: Person): PersonalityProfile {
  const bazi = computeBaZi(toBirthTime(person))
  const dm = DAY_MASTER[bazi.dayPillar.ganZhi.stem]

  const count = wuXingCount(bazi)
  const strong = WU_XING.filter((x) => count[x] >= 2)
  const weak = WU_XING.filter((x) => count[x] === 0)
  const wuLines: string[] = []
  for (const x of strong) wuLines.push(WU_XING_NATURE[x].strong)
  for (const x of weak) wuLines.push(WU_XING_NATURE[x].weak)

  const animal = zodiacOf(bazi.zodiac)
  const zodiacTraits = ZODIAC_PERSONALITY[bazi.zodiac].traits
  const sign = westZodiac(person.birthMonth, person.birthDay)
  const westTraits = WEST_PERSONALITY[sign] ?? ['（未知星座）']
  const num = lifePathNumber(person.birthYear, person.birthMonth, person.birthDay)
  const numTraits = NUMEROLOGY_PERSONALITY[num] ?? [`灵数 ${num}`]

  // 禄命法（年柱核心）：三命 / 主本 / 十神 / 神煞 / 五行阴阳
  const lm = computeLuMing(toBirthTime(person))
  const sanMingText = `禄在${lm.sanMing.lu}（主名声贵贱）、命在${lm.sanMing.ming}（主际遇荣枯）、身为${lm.sanMing.shen}（主才能器识）`
  const order: ShiShenCategory[] = ['比劫', '食伤', '财', '官杀', '印']
  let dominant: ShiShenCategory = order[0]
  for (const cat of order) {
    if (lm.shiShenCount[cat] > lm.shiShenCount[dominant]) dominant = cat
  }
  const shenShaLines = lm.shenShaAll.filter((n) => SHENSHA_PERSONALITY[n]).map((n) => SHENSHA_PERSONALITY[n])

  const summary = `${person.name}日主${dm.label}（${dm.nature}）。${sanMingText}。十神偏${dominant}——${SHISHEN_PERSONALITY[dominant].split('；')[0]}。`

  return {
    dayMaster: { label: dm.label, nature: dm.nature, traits: dm.traits },
    wuXing: { strong, weak, lines: wuLines },
    sanMing: { lu: lm.sanMing.lu, ming: lm.sanMing.ming, shen: lm.sanMing.shen, text: sanMingText },
    mainBen: { rel: lm.mainBen.rel, text: lm.mainBen.text },
    shiShen: { count: lm.shiShenCount, dominant, dominantText: SHISHEN_PERSONALITY[dominant] },
    shenSha: { names: lm.shenShaAll, lines: shenShaLines },
    wuXingYinYang: { line: WU_XING_YIN_YANG[bazi.dayPillar.ganZhi.stem] },
    zodiac: { animal, traits: zodiacTraits },
    west: { sign, traits: westTraits },
    numerology: { number: num, traits: numTraits },
    summary,
    getAlongTips: dm.getAlong,
  }
}

/** 两人日主的关系（用于合盘里的「性格契合」）：五合 / 相生 / 相克 / 比和 */
export function dayMasterRelation(a: Stem, b: Stem): string {
  if (isTianGanHe(a, b)) return '两人日主天干五合，天生投缘，容易互相欣赏'
  const w1 = STEM_WU_XING[a]
  const w2 = STEM_WU_XING[b]
  const rel = wuXingRelation(w1, w2)
  if (rel === '同') return '两人日主同气，很有共鸣，但也容易同类相争、谁都不服谁'
  if (rel === '生我' || rel === '我生') return '两人日主相生，一个滋养另一个，相处自然不累'
  return '两人日主相克，性格有反差，容易互相看不对眼，需要多磨合'
}
