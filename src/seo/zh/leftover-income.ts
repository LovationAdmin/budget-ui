// src/seo/zh/leftover-income.ts
// The Chinese leftover income calculator (/zh/leftover-income-calculator): its
// head and prerendered summary, and its structured-data names (its FAQ is in
// faq-leftover-income.ts, with amounts in 元, a generic unit). Plain text; the
// prerendered example is in yuan, as the page shows it by default
// (RAV_EXAMPLE_EN scaled with formatZh('CNY').example, computed with
// computeResteAVivre).

import type { PageSEO } from '../site';

export const LEFTOVER_INCOME_PAGE_ZH: PageSEO = {
  path: '/zh/leftover-income-calculator',
  title: '每月结余计算器：工资扣除固定开支还剩多少？',
  description: '免费每月结余计算器：输入税后到手收入和房租房贷、水电燃气等固定开支，算出家庭每月还剩多少钱，以及人均和每天的金额。支持人民币、新加坡元、马币、港币、新台币，无需注册。',
  h1: '每月结余计算器',
  intro: '工资扣除固定开支后还剩多少？输入家庭每月的税后到手收入和固定开支，算出每月结余，以及人均、每天有多少生活费可用。免费，无需注册，你的数据只保存在本设备上，不会上传。',
  sections: [
    { h2: '每月结余怎么计算？', text: '每月结余 = 每月税后到手收入 − 每月固定开支。收入：税后工资、补贴和津贴、养老金、收到的子女抚养费、租金收入。固定开支：房租或房贷、其他贷款、水电燃气费、保险、宽带、话费、会员订阅、交通、托育费用和学杂费、没有从工资中代扣的税费、支付的抚养费或给父母的生活费。买菜、买衣服和娱乐不算固定开支：它们正是每月结余要负担的部分。每月结余也不同于统计上的可支配收入，后者只扣除了税费和社保等缴费。' },
    { h2: '举个例子', text: '在我们虚构的例子里，林先生和太太有两个孩子，分别6岁和10岁，全家每月税后到手¥18,000。房租¥5,400、车贷¥1,200、水电燃气费¥750、保险¥900、宽带和话费¥450、交通¥600、托育费用和学杂费¥1,800：固定开支共¥11,100。每月结余¥6,900，相当于人均¥1,725、全家每天¥230。' },
    { h2: '按人均算，还是按成人等值算？', text: '为了比较不同规模的家庭，统计机构会除以成人等值人数，常用 OECD 修正等值规模：第一位成人记1，其他14岁及以上的家庭成员每人记0.5，14岁以下的孩子每人记0.3。一对夫妻带两个小孩折合2.1个成人，例子中林家的每月结余折合每个成人¥3,286。' },
    { h2: '每月结余多少才够？', text: '没有放之四海而皆准的最低标准，要看所在城市的生活成本和家庭情况。常见的经验法则是房租或房贷不超过收入的30%左右；50/30/20法则建议把必要开支控制在税后收入的一半左右。' },
    { h2: '怎样提高每月结余？', text: '逐项比较电费、宽带、话费和保险的套餐；查查自己能领哪些补贴；把一年一付的费用摊到每个月；收入差距较大的夫妻按收入比例分摊共同开支；收支难以平衡时，向当地免费的公益债务咨询或法律援助机构求助。' },
  ],
  priority: 0.8,
  changefreq: 'monthly',
};

/** Structured data: the WebApplication's name and the breadcrumb label. */
export const LEFTOVER_INCOME_TOOL_ZH = { name: '每月结余计算器', crumb: '每月结余计算器' };
