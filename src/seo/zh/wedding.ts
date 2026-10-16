// src/seo/zh/wedding.ts
// The Chinese wedding budget calculator (/zh/wedding-budget-calculator): its
// PageSEO entry and its structured-data names (its FAQ is in faq-wedding.ts,
// with amounts in 元, a generic unit). No averages or market prices. The
// prerendered sections show the fictitious example in yuan, as the page shows
// it by default (CNY: the dollar-based example × 3, computed with
// src/lib/tools/mariage.ts).

import type { PageSEO } from '../site';

export const WEDDING_PAGE_ZH: PageSEO = {
  path: '/zh/wedding-budget-calculator',
  title: '婚礼预算计算器：结婚要花多少钱、每月存多少',
  description: '免费婚礼预算计算器：填入婚宴、场地、婚纱、摄影等报价，算出结婚总花费、每位宾客的成本、少请20位宾客能省多少，以及婚礼前每月要存多少钱。无需注册。',
  h1: '婚礼预算计算器',
  intro: '婚宴、场地、婚纱礼服、摄影：把各项报价加起来，算出结婚要花多少钱、每位宾客的成本，以及婚礼前每月要存多少。免费，无需注册，数据不会上传。',
  sections: [
    { h2: '婚礼预算怎么算', text: '婚礼预算 = 每位宾客的婚宴和酒水费用 × 宾客人数 + 固定费用 + 预备金。结婚花费没有官方平均数：请从你拿到的报价算起。' },
    { h2: '婚宴一桌多少钱怎么算', text: '中式婚宴一般按桌报价，一桌约坐10人：每人价格 = 每桌价格 ÷ 每桌人数。虚构示例：婚宴每人¥240、酒水每人¥60，即每桌¥3,000；100位宾客约10桌。' },
    { h2: '婚礼预算清单示例：100位宾客、10桌', text: '虚构示例：婚宴每人¥240、酒水每人¥60，场地¥12,000，婚纱礼服与妆发¥6,000……合计¥66,000，每位宾客¥660；少请20位宾客至少省下¥6,000。' },
    { h2: '结婚每月要存多少钱', text: '每月存款 =（婚礼总预算 − 已存金额）÷ 距离婚礼的月数。虚构示例：已存¥12,000，18个月内还要凑齐¥54,000，即每月¥3,000。礼金红包不要提前算进去。' },
    { h2: '怎样省下婚礼开支', text: '精简宾客名单（婚宴按人头计）、避开热门日子、比较场地和套餐、调整婚宴形式、选对婚纱照套系、自己动手，以及租借或买二手。' },
    { h2: '婚礼费用由谁来出？', text: '没有固定规矩：新人自己、双方父母，或一起分担。彩礼和嫁妆是两家人另外商量的事，建议和婚礼预算分开记录。尽早商量；共享预算和带目标金额、日期的储蓄目标会有帮助。' },
  ],
  priority: 0.8,
  changefreq: 'monthly',
};

/** Name of the WebApplication in structured data, and the breadcrumb label. */
export const WEDDING_TOOL_ZH = { name: '婚礼预算计算器', crumb: '婚礼预算计算器' };
