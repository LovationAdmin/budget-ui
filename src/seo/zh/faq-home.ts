// src/seo/zh/faq-home.ts
// FAQ of the Chinese page /zh: shown on the page and published as FAQPage
// structured data, so both always say the same thing. Kept apart from the
// page's metadata (home.ts), which the main bundle carries for every route.

import type { FaqItem } from '../faq';

export const HOME_FAQ_ZH: FaqItem[] = [
  {
    q: '这些计算器真的免费吗？',
    a: '是的。四个计算器都可以免费使用，无需注册，也没有广告。你输入的数字只保存在本设备的浏览器里，不会发送到我们的服务器。',
  },
  {
    q: '支持哪些货币？',
    a: '人民币、新加坡元、马来西亚林吉特、港币、新台币、美元、加拿大元、澳大利亚元、英镑和欧元。计算器会根据你所在的时区自动选择货币，你也可以随时更改，选择会保存在本设备上。',
  },
  {
    q: '家庭预算怎么做？',
    a: '先算清每月的税后到手收入，再列出固定开支（房租或房贷、水电燃气、网费话费、交通、保险、贷款还款），把一年一次的开支除以12，最后估算买菜、外出就餐等日常花销。发工资后先把要存的钱转出去，而不是等到月底再存“剩下的”。50/30/20预算计算器可以帮你一步步完成。',
  },
  {
    q: '房租很高，50/30/20法则还适用吗？',
    a: '可以作为参考，但不必死守。在房租高的城市，必要开支超过收入的一半很常见。计算器会先压缩弹性开支，尽量保住20%的储蓄；必要开支超过收入的60%时，就把剩下的钱平分给弹性开支和储蓄。',
  },
  {
    q: 'Budget Famille 是什么？有中文版吗？',
    a: 'Budget Famille 是一款免费的预算应用，可以一个人用，也可以和伴侣、家人或室友共享：记录固定开支、公共基金、每个人的零花钱和有目标日期的储蓄计划。应用目前提供法语和英语版本；本站的免费计算器提供中文版。',
  },
];
