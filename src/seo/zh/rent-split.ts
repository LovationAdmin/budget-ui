// src/seo/zh/rent-split.ts
// The Chinese rent split calculator (/zh/rent-split-calculator): its PageSEO
// entry and its structured-data name (its FAQ is in faq-rent-split.ts, with
// amounts in 元, the generic unit that reads naturally whatever the visitor's
// currency). The prerendered example is in yuan, as the page shows it by
// default: the English example scaled by formatZh('CNY').example, split by
// computeColocation and written with moneyExact. No country's tenancy law is
// given as the rule.

import type { PageSEO } from '../site';

export const RENT_SPLIT_PAGE_ZH: PageSEO = {
  path: '/zh/rent-split-calculator',
  title: '合租房租分摊计算器：平均、按面积或按收入分房租',
  description: '免费合租房租分摊计算器：房租可平均分摊、按房间面积或按收入比例分摊，水电网费按人数平分，马上算出每位室友每月该付多少。无需注册，数据不会上传。',
  h1: '合租房租分摊计算器：每位室友该付多少？',
  intro: '合租房租怎么分才公平？用这个合租房租分摊计算器，选择平均分摊、按房间面积或按收入比例，马上算出每位室友每月要付的房租和水电网费。免费，无需注册，数据不会上传。',
  sections: [
    { h2: '合租房租怎么分？三种常见方法', text: '三种常见方法：平均分摊；按房间面积（一半房租对应公共区域，大家平均分摊，其余按各自卧室的面积分摊）；按每位室友税后到手收入的比例分摊。公共费用按人数平均分摊。' },
    { h2: '示例：三人合租', text: '在我们的示例中，月租¥8,100，三间卧室分别为10、13和17平方米，公共费用每月¥990：平均分摊时每人¥3,030；按房间面积分摊，分别为¥2,692.50、¥2,996.25和¥3,401.25；按收入比例分摊，分别为¥2,420.32、¥2,942.90和¥3,726.77。' },
    { h2: '室友水电费怎么分？设一个公共基金', text: '每月初大家把各自的份额转入公共基金，房租、水电网费和公共日用品都从这里支付，个人开销分开算；不定期的账单折算成每月，每月对一次账。' },
    { h2: '入住前：把约定写下来', text: '一起签约还是各自签约、向二房东租房时转租是否经房东同意、分摊方式和交租日期、押金、搬走和找新室友、账单和家务。' },
  ],
  priority: 0.8,
  changefreq: 'monthly',
};

/** Name of the WebApplication in structured data, and the breadcrumb label. */
export const RENT_SPLIT_TOOL_ZH = { name: '合租房租分摊计算器', crumb: '合租房租分摊计算器' };
