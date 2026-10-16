// src/i18n/zh/mariage.tsx
// Words of the wedding budget calculator in simplified Chinese
// (/zh/wedding-budget-calculator). Same fictitious example as the French and
// English pages (src/lib/tools/mariage.ts), labelled as such, in the visitor's
// currency. Localized for Chinese weddings: the banquet (婚宴) is usually
// quoted per table of about 10, so the hints say how to turn a table price
// into the per-guest price the calculator uses; 婚庆 (planner, MC, sound)
// takes the « music » line, 喜糖 and favours join the invitations.

import type { MariageCopy } from '@/components/tools/MariageCalculator';

export const MARIAGE_ZH: MariageCopy = {
  posts: {
    lieu: { label: '场地', hint: '宴会厅或场地的租金，单独收费的桌椅设备也算上；已含在婚宴报价里可留空' },
    traiteur: { label: '婚宴', hint: '每位宾客的餐费。按桌报价时，用每桌价格除以每桌人数（通常约10人）' },
    boissons: { label: '酒水饮料', hint: '酒和饮料，按每位宾客计；按桌计价的同样除以每桌人数' },
    tenues: { label: '婚纱礼服与妆发', hint: '婚纱、礼服、西装、配饰、化妆、发型' },
    photo: { label: '婚纱照与摄影摄像', hint: '婚纱照，以及婚礼当天的摄影和摄像' },
    musique: { label: '婚庆策划与主持', hint: '婚庆公司、司仪、音响灯光、乐队或 DJ' },
    deco: { label: '鲜花与现场布置', hint: '手捧花、桌花、舞台和现场布置；婚庆套餐已含的不用重复填' },
    alliances: { label: '婚戒首饰', hint: '对戒，以及婚礼要用的其他首饰' },
    papeterie: { label: '请柬与喜糖伴手礼', hint: '请柬、喜糖、伴手礼、签到台和座位卡' },
    voyage: { label: '蜜月旅行', hint: '可选' },
    autres: { label: '预备金与杂项', hint: '给容易漏掉的开销留点余地：婚车、改衣、交通住宿、临时采购' },
  },
  guests: (n) => `${n}位宾客`,
  monthLabel: (ym) => `${ym.year}年${ym.month}月`,
  calculatorLabel: '计算器',
  weddingTitle: '你的婚礼',
  guestsLabel: '宾客人数',
  guestsHint: '出席婚宴的大人和小孩，每桌约坐10人',
  guestsLess: '减少一位宾客',
  guestsMore: '增加一位宾客',
  minus10: '减少10位宾客（约1桌）',
  plus10: '增加10位宾客（约1桌）',
  dateLabel: '婚礼日期',
  dateHint: '填写年份和月份，用来计算每月要存多少钱',
  datePlaceholder: '例如2027-06',
  savedLabel: '已存金额',
  savedHint: '已经为婚礼存下的钱，包括已付的定金',
  postsTitle: '婚礼开支',
  postsIntro: '填入你拿到的报价：每一项填总价，婚宴和酒水填每位宾客的价格（按桌报价的，除以每桌人数即可）。结婚花费没有官方平均数：总额主要取决于宾客人数和婚宴价格。',
  exampleNote: '虚构示例，请换成你的报价',
  exampleExplain: '这些整数金额只是为了演示计算方法，既不是平均值，也不是市场价格。',
  exampleBadge: '虚构示例',
  confirmReplace: '要用虚构示例替换你填写的金额吗？',
  morePosts: '更多：婚戒首饰、请柬与喜糖、蜜月旅行',
  perGuestUnit: '/人',
  perGuestHint: (rate, guests, total) => `${rate} × ${guests} = ${total}`,
  resultTitle: '婚礼总预算',
  emptyResult: '填入宾客人数和报价，总额会随着输入实时显示在这里。',
  forGuests: (guests, honeymoon) => `按${guests}计算${honeymoon ? '，含蜜月旅行' : ''}`,
  tiles: {
    perGuest: '每位宾客',
    perGuestNote: (honeymoon) => (honeymoon ? '不含蜜月旅行' : '全部费用'),
    guestLinked: '随人数变化',
    guestLinkedNote: (share) => `婚宴和酒水${share !== null ? `，占${share}` : ''}`,
  },
  fixedPart: (amount, share) => (
    <>固定部分：<strong className="text-foreground">{amount}</strong>{share !== null ? `（占${share}）` : ''}，不随宾客人数变化。</>
  ),
  savingTitle: '每月要存',
  perMonth: '/月',
  plan: ({ months: n, from, to, remaining, total, saved }) => `${n === 1
    ? `在${from}一次存入`
    : `从${from}到${to}，共存${n}个月`}，凑齐${remaining}${saved ? `（${total}减去已存的${saved}）` : ''}。`,
  covered: '你已存下的钱足够支付这份预算，不需要每月再存。',
  thisMonth: (remaining) => (remaining
    ? `婚礼就在本月：已经没有时间按月存钱了，还差${remaining}。`
    : '婚礼就在本月，你已存下的钱足够支付这份预算。'),
  past: '这个日期已经过去了，请填写即将举行婚礼的月份。',
  noDateAction: '填写婚礼日期',
  noDateRest: '即可算出每月要存多少钱。',
  joints: { stop: '。', space: '' },
  fillExampleShort: '填入虚构示例',
  breakdownTitle: '各项明细',
  perGuestRate: (rate) => ` · 每人${rate}`,
  fewerTitle: (n) => `少请${n}位宾客${n >= 10 ? `（约少${Math.round(n / 10)}桌）` : ''}，能省多少？`,
  fewerText: ({ saving, total, before, guests }) => (
    <>
      婚宴和酒水至少省下<strong>{saving}</strong>：{guests}的总预算是{total}，原来是{before}。这还只是最低值：场地可以更小，桌数和请柬也会减少，其他项目也可能随之下降。
    </>
  ),
  fewerNoRate: '填入婚宴和酒水的每人价格，就能看到少请几位宾客能省多少。',
  signup: {
    title: '用储蓄目标为婚礼存钱',
    text: (year) => `在 Budget Famille 里，单独建一个“${year}年婚礼”预算，或设一个带目标金额和日期的储蓄目标：每月要存多少会自动算好，还能邀请另一半一起管理。免费使用，无需连接银行账户。应用目前提供法语和英语版本。`,
    cta: '免费创建我的预算',
  },
  reset: '清空',
  share: {
    button: '分享计算器',
    copied: '链接已复制',
    url: 'https://www.budgetfamille.com/zh/wedding-budget-calculator',
    title: '婚礼预算计算器',
    text: '免费的婚礼预算计算器：算算结婚要花多少钱，以及每月要存多少。',
  },
  sticky: { label: (example) => `总预算${example ? '（虚构示例）' : ''}`, details: '查看明细' },
};
