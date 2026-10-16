// src/seo/zh/home.ts
// The Chinese home (/zh): its search metadata and prerendered summary (its FAQ
// is in faq-home.ts). The app is in French and English; the free calculators
// are the pages written in Chinese.

import type { PageSEO } from '../site';
import { ZH_TOOLS } from '@/i18n/zh/tools';

export const HOME_PAGE_ZH: PageSEO = {
  path: '/zh',
  title: '免费家庭预算计算器：50/30/20、合租分摊、婚礼预算',
  description: '免费在线预算计算器：按50/30/20法则分配工资，计算合租房租分摊、婚礼预算和每月结余。支持人民币、新加坡元、林吉特、港币等货币，无需注册，数据不上传。',
  h1: '免费家庭预算计算器',
  intro: '工资怎么分配、合租房租怎么分、婚礼要存多少钱、扣掉固定开支还剩多少：四个免费计算器，输入数字就能看到结果。无需注册，数据只保存在你的设备上。',
  links: [...ZH_TOOLS.map((tool) => ({ href: tool.path, label: tool.label })), { href: '/signup', label: '免费注册 Budget Famille（英文界面）' }],
  sections: [
    { h2: '家庭预算怎么做：4个步骤', text: '算清每月税后到手收入；列出房租或房贷、水电燃气、交通、保险等固定开支；把一年一次的开支除以12；发工资后先储蓄，再消费，先存够3到6个月必要开支的应急基金。' },
    { h2: '和家人一起管钱', text: 'Budget Famille 是一款免费的预算应用，可以一个人用，也可以和伴侣、家人或室友共享：公共基金、每个人的零花钱、有目标日期的储蓄计划。应用目前提供法语和英语版本。' },
  ],
  priority: 0.8,
  changefreq: 'monthly',
};
