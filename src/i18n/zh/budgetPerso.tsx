// src/i18n/zh/budgetPerso.tsx
// Words of the 50/30/20 calculator in simplified Chinese (/zh/50-30-20-budget-calculator).
// Localized rather than translated, for readers in Singapore, Malaysia, Hong
// Kong, Taiwan, mainland China and overseas: take-home pay after tax and
// CPF/EPF/social insurance, taxes paid by yourself (not withheld everywhere),
// help links verified for Singapore, Malaysia, Hong Kong and Taiwan. The
// example is the English one (same figures in every language), scaled to the
// visitor's currency by the page (src/i18n/format.ts).

import type { BudgetPersoCopy } from '@/components/tools/BudgetPersoCalculator';
import { EXAMPLE_EN } from '@/i18n/en/budgetPerso';

const link = 'font-medium text-primary hover:underline';

export const BUDGET_PERSO_ZH: BudgetPersoCopy = {
  incomes: {
    salaire: { label: '税后到手收入', hint: '扣除税款、社保或公积金等代扣款项后，每月实际到账的金额' },
    autres: { label: '其他收入', hint: '政府补贴、子女抚养费、副业、出租收入……' },
  },
  needs: {
    logement: { label: '住房', hint: '房租或房贷月供，含物业管理费' },
    energie: { label: '水电燃气费', hint: '电费、燃气费、水费等' },
    telecom: { label: '网络和手机费' },
    transport: { label: '交通', hint: '公交地铁月票、日常通勤的油费' },
    assurances: { label: '保险', hint: '家财险、车险、医疗保险等' },
    credits: { label: '贷款还款（房贷除外）', hint: '车贷、消费贷、信用卡最低还款' },
    courses: { label: '日常食品杂货', hint: '买菜和日常生活用品' },
    sante: { label: '自付医疗费用' },
    enfants: { label: '育儿和孩子开支', hint: '托儿、学校餐费、学杂费' },
    impots: { label: '自行缴纳的税费', hint: '没有从工资中预扣的所得税、房产税等，全年金额 ÷ 12' },
    autres: { label: '其他必要开支' },
  },
  example: EXAMPLE_EN,
  calculatorLabel: '计算器',
  incomeTitle: '每月税后收入',
  seeExample: '看看示例',
  needsTitle: '每月必要开支',
  needsIntro: '“必要开支”就是无论如何都得付的钱：有地方住、吃得上饭、能去上班，还有基本的保障。',
  moreNeeds: '更多：医疗、育儿、税费……',
  annualNote: '一年才付一次的开支（房产税、按年缴纳的保费、年费订阅）？除以12再填。外出就餐、兴趣爱好和购物不算必要开支：它们属于弹性开支，50/30/20法则会给它们单独留出一份。',
  savingsTitle: '你现在每月存多少',
  optional: '选填',
  savingsLabel: '每月已经存下的金额',
  savingsHint: '转入储蓄账户、定期存款、储蓄目标……如果你才刚开始，空着也没关系。',
  resultTitle: '扣除必要开支后还剩',
  perMonth: '/月',
  emptyResult: '填入你的到手收入和必要开支，按50/30/20法则算出的预算会随着输入实时显示在这里。',
  deficit: (gap) => `你的必要开支每月比收入多出${gap}。`,
  summary: (income, needs) => `收入${income}，减去必要开支${needs}`,
  needsShare: (share, within) => (
    <>你的必要开支占收入的<strong>{share}</strong>，{within ? '在50%的参考线以内' : '超过了50%的参考线'}。</>
  ),
  labels: { needs: '必要开支', wants: '弹性开支', savings: '储蓄', margin: '自由余额' },
  comparison: {
    rule: '50/30/20参考比例',
    yours: '你的预算',
    caption: '你的每月预算与50/30/20法则的对比',
    item: '类别',
    benchmark: '参考值',
  },
  deficitHelp: {
    title: '这不是死胡同：试试这样重新平衡',
    intro: '先检查一下填写的金额（是不是把年度开支直接填进去，忘了除以12？），然后：',
    items: [
      <>从大额固定开支入手：房租、贷款、保险、手机套餐，比较一下有没有更划算的方案，或者问问能否重新协商。</>,
      <>了解一下你是否符合当地补贴或援助的申请条件，例如新加坡的 <a href="https://supportgowhere.life.gov.sg/" target="_blank" rel="noopener" className={link}>SupportGoWhere</a>、香港的<a href="https://www.swd.gov.hk/sc/" target="_blank" rel="noopener" className={link}>社会福利署</a>。</>,
      <>有债务压力时，可以向免费或非营利的债务咨询机构求助，例如新加坡的非营利机构 <a href="https://ccs.org.sg/" target="_blank" rel="noopener" className={link}>Credit Counselling Singapore</a>、马来西亚国家银行设立的 <a href="https://www.akpk.org.my/" target="_blank" rel="noopener" className={link}>AKPK</a>（服务免费）。</>,
      <>想补一补理财知识：新加坡的 <a href="https://www.moneysense.gov.sg/" target="_blank" rel="noopener" className={link}>MoneySense</a>、香港的<a href="https://www.ifec.org.hk/web/sc/index.page" target="_blank" rel="noopener" className={link}>投资者及理财教育委员会</a>和台湾的<a href="https://moneywise.fsc.gov.tw/" target="_blank" rel="noopener" className={link}>金融智慧网</a>都提供免费的理财入门内容。</>,
    ],
  },
  tiles: { wantsPerDay: '每天弹性开支', ofIncome: (share) => `占收入${share}`, perDayNote: '按30天计' },
  within: (margin) => (
    <>
      你的必要开支没有超过收入的50%：法则可以直接套用，30%给弹性开支，20%用于储蓄。
      {margin && <>多出来的{margin}是<strong>自由余额</strong>：多存一点、投入某个储蓄目标，或者多花一点在想要的东西上，由你决定。</>}
    </>
  ),
  trimmed: (maxNeedsShare) => (
    // One line per sentence: JSX would join wrapped lines with a space.
    <>你的必要开支超过了50%：房租一高就很常见，不是你做错了什么。这时先压缩弹性开支，储蓄仍保持在收入的20%，前提是弹性开支至少不少于储蓄（必要开支最多到{maxNeedsShare}）。</>
  ),
  shared: (needsShare, savings) => (
    <>必要开支占了{needsShare}，如果还坚持存20%，留给弹性开支的钱就会比储蓄还少。所以剩下的钱平均分成两半：你<strong>可以存下的金额</strong>是每月{savings}。如果这还是太多，定期存一笔小钱也很有意义。</>
  ),
  howSplit: '这个分配是怎么算的',
  ruleAnchor: 'rule',
  current: (saved, share) => <>你现在每月已经存下<strong>{saved}</strong>（占收入的{share}）。</>,
  currentOver: '这比扣除必要开支后剩下的钱还多：请检查一下填写的金额。',
  currentGap: (gap) => `离建议金额每月还差${gap}，按自己的节奏来就好。`,
  currentReached: '已经达到或超过建议金额，做得很好！',
  signup: {
    title: '每个月都跟踪这份预算，一个人或和家人一起',
    text: 'Budget Famille 会根据你的固定开支（每月、部分月份或每年一次）自动生成每个月的预算，还能设置带金额和期限的储蓄目标。之后可以邀请伴侣或室友加入。免费使用，无需绑定银行账户。应用目前提供法语和英语版本。',
    cta: '免费创建我的预算',
  },
  reset: '清空',
  share: {
    button: '分享计算器',
    copied: '链接已复制',
    url: 'https://www.budgetfamille.com/zh/50-30-20-budget-calculator',
    title: '50/30/20预算计算器',
    text: '免费的50/30/20法则预算计算器：看看你的工资该怎么分配、每月能存多少钱。',
  },
  sticky: { label: '扣除必要开支后', details: '查看详情' },
};
