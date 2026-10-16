// src/i18n/zh/resteAVivre.tsx
// Words of the leftover income calculator in simplified Chinese
// (/zh/leftover-income-calculator). Localized rather than translated: income
// items stay generic (no country's benefits presented as the rule), money
// sent to parents counts with support paid, and the per-unit figure uses the
// OECD-modified equivalence scale. The example is the English one, scaled to
// the visitor's currency on the page, so the three languages publish the
// same household.

import { Link } from 'react-router-dom';
import type { RavCopy, RavExample } from '@/components/tools/ResteAVivreCalculator';
import { RAV_EXAMPLE_EN } from '@/i18n/en/resteAVivre';

/** Fictitious example (the Lin family: a couple with two children aged 6 and 10), in dollars as in English. */
export const RAV_EXAMPLE_ZH: RavExample = RAV_EXAMPLE_EN;

export const RESTE_A_VIVRE_ZH: RavCopy = {
  calculatorLabel: '计算器',
  seeExample: '查看示例',
  householdTitle: '你的家庭',
  adults: '成人',
  kidsUnder14: '14岁以下的孩子',
  teens: { label: '14岁及以上的孩子', hint: '或其他同住、由你供养的家人（如老人）' },
  stepper: { remove: (label) => `减少：${label}`, add: (label) => `增加：${label}` },
  incomesTitle: '每月税后到手收入',
  incomes: {
    salaires: { label: '工资及劳务收入', hint: '实际到账的金额：已扣除个税、社保或公积金等' },
    aides: { label: '补贴和津贴', hint: '育儿补贴、住房补贴、政府补助等' },
    autres: { label: '其他收入', hint: '养老金、收到的子女抚养费、租金收入等' },
  },
  chargesTitle: '每月固定开支',
  charges: {
    loyer: { label: '房租', hint: '含物业费或管理费' },
    creditImmo: { label: '房贷', hint: '每月月供，含房贷相关保险' },
    credits: { label: '其他贷款', hint: '车贷、消费贷、信用卡最低还款' },
    energie: { label: '水电燃气费', hint: '电费、燃气费、暖气费、水费' },
    assurances: { label: '保险', hint: '家财险、车险、医疗险等' },
    telecom: { label: '宽带、话费和会员订阅' },
    transport: { label: '交通', hint: '公交地铁月票、日常通勤的油费' },
    enfants: { label: '托育费用和学杂费', hint: '幼儿园、课后托管、学费，固定的兴趣班或补习费' },
    impots: { label: '税费', hint: '没有从工资中代扣的税费（一年一缴的请除以12）' },
    pension: { label: '支付的抚养费或赡养费', hint: '子女抚养费、每月固定给父母的生活费等' },
    autres: { label: '其他固定开支' },
  },
  moreCharges: '更多开支：交通、托育、税费、赡养费等',
  chargesNote: '一年一付的费用（如年缴保险、房产税）？除以12即可。买菜、买衣服和娱乐不算固定开支：它们正是要从每月结余里支出的部分。',
  perMonth: '/月',
  resultTitle: '你的每月结余',
  emptyResult: '填写收入和固定开支，结果会随着输入实时显示在这里。',
  deficit: (amount) => `你的固定开支每月比收入多出${amount}。`,
  after: (charges, income) => `收入${income}，扣除固定开支${charges}后`,
  deficitHelp: (
    <>
      <p className="font-semibold text-foreground">重新平衡收支的办法</p>
      <ul className="mt-2 space-y-1.5">
        <li><Link to="/en/ai-tools" className="font-medium text-primary hover:underline">估算你的账单能降低多少</Link>（英文页面）</li>
        <li>查查自己可能符合哪些补贴的申请条件，以当地政府官方网站为准</li>
        <li>向当地免费的公益债务咨询或法律援助机构求助</li>
      </ul>
    </>
  ),
  tiles: {
    perPerson: '人均',
    persons: (n) => `${n}人`,
    perDay: '每天',
    perDayNote: '按30天计算',
    perUnit: '按成人等值',
    units: (n) => `折合${n}个成人（OECD）`,
  },
  chargesShare: {
    label: '固定开支',
    ofIncome: (pct) => `占收入的${pct}`,
    aria: (pct) => `固定开支占收入的${pct}`,
  },
  debt: {
    title: (pct) => `贷款月供占到手收入的${pct}`,
    note: () => ({ tone: 'info', text: '银行等贷款机构有自己的审核标准，通常按税前收入计算，这里的比例仅供粗略参考。比例越低，你的回旋余地越大。' }),
  },
  signup: {
    title: '每个月还剩多少，和家人一起掌握',
    text: 'Budget Famille 根据你的固定开支自动生成每个月的预算，还能和伴侣实时同步。免费使用，目前提供法语和英语版本。',
    cta: '免费创建我的预算',
  },
  reset: '清空',
  share: {
    button: '分享计算器',
    copied: '链接已复制',
    url: 'https://www.budgetfamille.com/zh/leftover-income-calculator',
    title: '每月结余计算器',
    text: '免费计算器：扣除固定开支后每月还剩多少，按人、按天算清楚。',
  },
  sticky: { label: '每月结余', details: '查看详情' },
};
