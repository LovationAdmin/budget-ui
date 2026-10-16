// src/i18n/zh/colocation.tsx
// Words of the rent and bills split in simplified Chinese
// (/zh/rent-split-calculator). Localized rather than translated: 水电燃气费,
// 油盐酱醋, 公共基金, bedroom sizes in 平方米 or 平方英尺 depending on the
// currency, and no country's tenancy law presented as the rule.

import type { ColocCopy } from '@/components/tools/ColocationCalculator';
import type { ColocInput } from '@/lib/tools/colocation';
import { colocExampleEn } from '@/i18n/en/colocation';

/** The usual unit of a room's size where a currency is used, written in Chinese. */
export const AREA_UNIT_ZH: Record<'sq ft' | 'm²', string> = { 'm²': '平方米', 'sq ft': '平方英尺' };

const NAMES = ['小王', '小李', '小陈'];

/**
 * Fictitious example: the English one (same rent, bills, incomes and bedroom
 * proportions, 10, 13 and 17 m² or 100, 130 and 170 sq ft) with Chinese names.
 */
export function colocExampleZh(areaUnit: 'sq ft' | 'm²'): ColocInput {
  const example = colocExampleEn(areaUnit);
  return { ...example, roommates: example.roommates.map((m, i) => ({ ...m, name: NAMES[i] ?? `室友${i + 1}` })) };
}

export const COLOCATION_ZH: ColocCopy = {
  calculatorLabel: '计算器',
  householdTitle: '你们的合租情况',
  seeExample: '查看示例',
  roommates: '室友人数',
  roommatesLess: '减少一位室友',
  roommatesMore: '增加一位室友',
  mateName: (i) => `室友${i + 1}`,
  nameLabel: '名字或昵称',
  roomLabel: '卧室面积',
  incomeLabel: '税后到手收入',
  billsTitle: '每月房租和公共费用',
  rent: { label: '房租', hint: '整套房子每月的租金总额；如果另付物业费或管理费，也一并算进来' },
  bills: {
    energie: { label: '水电燃气费', hint: '全屋每月的总额' },
    internet: { label: '宽带网费' },
    assurance: { label: '租房保险（家财险）', hint: '如果你们合买了一份' },
    courses: { label: '公共日用品和食材', hint: '清洁用品、卫生纸、油盐酱醋……' },
    autres: { label: '其他公共费用', hint: '视频会员、桶装水、保洁……' },
  },
  billsNote: '两个月或一年才交一次的账单？折算成每月（÷2、÷12）。公共费用按人数平均分摊。',
  methodTitle: '房租怎么分',
  methodLegend: '分摊方式',
  methods: {
    egal: { label: '平均分摊', hint: '房间大小差不多' },
    chambre: { label: '按房间面积', hint: '房间大小不一' },
    revenus: { label: '按收入比例', hint: '收入差距较大' },
  },
  methodHelp: (method, commonShare) => ({
    egal: '每人分摊同样多的房租。房间差不多大时，这是最简单也最公平的方式。',
    chambre: `房租的${commonShare}对应客厅、厨房、卫生间等公共区域，由大家平均分摊；其余部分按各自卧室的面积分摊。`,
    revenus: '每人按税后到手收入的比例分摊房租。室友之间收入差距较大时比较合适。',
  })[method],
  perMonth: '/月',
  resultTitle: '每人每月应付',
  emptyResult: '填入房租和公共费用，每个人要付多少会随着输入实时显示在这里。',
  shareDetail: (rent, bills, ratio) => `房租${rent}，公共费用${bills}，占总额的${ratio}`,
  fallback: {
    rooms: '请填写每间卧室的面积；填好之前，房租先按平均分摊计算。',
    incomes: '请填写每位室友的税后到手收入；填好之前，房租先按平均分摊计算。',
  },
  tiles: { rent: '房租', bills: '公共费用', total: '每月合计' },
  potTip: '最省事的做法：每月初大家把各自的份额转入公共基金（一个共用的账户或钱包），房租和公共费用都从这里支付。',
  signup: {
    title: '用共享预算管好合租开销',
    text: '为你们的合租房建一个预算，通过邮件邀请室友加入：每个人往公共基金里交了多少，大家都能实时看到。免费使用，应用目前提供法语和英语版本。',
    cta: '免费创建我的预算',
  },
  reset: '清空',
  share: {
    button: '分享给室友',
    copied: '链接已复制',
    url: 'https://www.budgetfamille.com/zh/rent-split-calculator',
    title: '合租房租分摊计算器',
    text: '免费的合租房租分摊计算器，帮你和室友算清房租和水电网费。',
  },
  sticky: { total: (amount) => `每月合计：${amount}`, details: '查看明细' },
};
