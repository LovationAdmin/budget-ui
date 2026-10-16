// src/seo/zh/budget-503020.ts
// The Chinese 50/30/20 calculator (/zh/50-30-20-budget-calculator): its
// PageSEO entry and its structured-data names (its FAQ is in
// faq-budget-503020.ts, with amounts in 元, a generic unit for any currency).
// Plain text only; the rule matches src/lib/tools/budgetPerso.ts. The
// prerendered sections show the page's example in CNY, the default currency of
// the Chinese pages, computed with scaleAmounts(EXAMPLE_EN,
// formatZh('CNY').example) and computeBudgetPerso.

import type { PageSEO } from '../site';

export const BUDGET_503020_PAGE_ZH: PageSEO = {
  path: '/zh/50-30-20-budget-calculator',
  title: '50/30/20法则计算器：工资怎么分配，每月存多少钱',
  description: '免费50/30/20预算计算器：输入税后到手收入和必要开支，马上看到必要开支、弹性开支和储蓄怎么分配，以及每月该存多少钱。无需注册，数据不上传。',
  h1: '50/30/20预算法则计算器',
  intro: '用50/30/20法则做个人预算：输入税后到手收入和必要开支，看看工资该怎么分配、付完必要开支还剩多少，以及每月可以存多少钱。',
  sections: [
    { h2: '个人预算怎么做？5个步骤', text: '从税后到手收入算起，列出固定开支，把年度开支除以12，估算浮动开支，最后先存钱再花钱：发工资后马上转一笔到储蓄。' },
    { h2: '50/30/20法则是什么？', text: '50%用于必要开支，30%用于弹性开支，20%用于储蓄：这条法则由伊丽莎白·沃伦（Elizabeth Warren）和 Amelia Warren Tyagi 在《All Your Worth》（2005）一书中推广。它是参考而不是硬性规定，可以根据住房成本灵活调整。' },
    { h2: '50/30/20预算示例：工资怎么分配', text: '在我们的例子里，每月到手¥12,000，必要开支¥6,650（55%）：每月弹性开支¥2,950，储蓄¥2,400。' },
    { h2: '每月存多少钱比较合适？', text: '以税后到手收入的20%为参考；从小额开始，先存一笔够用几个月的应急基金，再存具体的储蓄目标。' },
  ],
  priority: 0.8,
  changefreq: 'monthly',
};

/** Structured data: name of the WebApplication and breadcrumb label. */
export const BUDGET_503020_TOOL_ZH = { name: '50/30/20预算法则计算器', crumb: '50/30/20预算计算器' };
