// src/lib/pages/zh/BudgetCalculator.tsx
// ============================================================================
// « 50/30/20预算法则计算器 » — the simplified Chinese version of /budget-personnel
// and /en/50-30-20-budget-calculator (hreflang, src/i18n/locales.ts). Same
// calculator and rule; the words, the help links and the article are written
// for Chinese readers (Singapore, Malaysia, Hong Kong, Taiwan, mainland China,
// overseas), and amounts are in the visitor's currency (CNY by default, from
// the time zone or the browser's region, changeable, shared by the Chinese
// pages). The example is the English one, scaled to the currency. Targets
// « 50/30/20法则 », « 50/30/20预算法则计算器 », « 每月存多少钱 »,
// « 个人预算怎么做 » and « 工资怎么分配 ».
// ============================================================================

import { Calculator, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';
import { CurrencyPicker, useCurrency } from '@/components/tools/CurrencyPicker';
import { scaleAmounts } from '@/lib/tools/scaleAmounts';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ChineseToolLinks } from '@/components/zh/ChineseLayout';
import { BudgetPersoCalculator } from '@/components/tools/BudgetPersoCalculator';
import { FaqList, ToolArticle } from '@/components/tools/ToolKit';
import { EXAMPLE_EN, EXAMPLE_EN_HIGH_RENT } from '@/i18n/en/budgetPerso';
import { BUDGET_PERSO_ZH } from '@/i18n/zh/budgetPerso';
import { FULL_SAVINGS_MAX_NEEDS_SHARE, NEED_FIELDS, computeBudgetPerso } from '@/lib/tools/budgetPerso';
import { BUDGET_503020_FAQ_ZH } from '@/seo/zh/faq-budget-503020';

const PATH = '/zh/50-30-20-budget-calculator';

// Chinese sentences sit on one line each: JSX joins wrapped lines with a space.
export default function BudgetCalculatorZh() {
  const { code, setCode, format } = useCurrency('zh');
  const { money, moneyExact, pct } = format;
  // The fictitious example in the visitor's currency (yuan, ringgit, NT dollars…).
  const ex = useMemo(() => scaleAmounts(EXAMPLE_EN, format.example), [format]);
  const exHigh = useMemo(() => scaleAmounts(EXAMPLE_EN_HIGH_RENT, format.example), [format]);
  const copy = useMemo(() => ({ ...BUDGET_PERSO_ZH, example: ex }), [ex]);
  const example = computeBudgetPerso(ex.incomes, ex.needs);
  const exampleHigh = computeBudgetPerso(exHigh.incomes, exHigh.needs);
  const goal = format.example(1200);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="px-4 pt-12 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-semibold text-success">
              <Calculator className="h-4 w-4" aria-hidden="true" /> 免费计算器 · 50/30/20法则
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl [text-wrap:balance]">
              50/30/20预算法则计算器
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              用50/30/20法则做个人预算：输入你的税后到手收入和必要开支，马上看到工资该怎么分配、付完必要开支还剩多少，以及每月可以存多少钱。结果随输入实时更新，也不对你的消费做评判。
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-4 w-4 align-[-3px] text-success" aria-hidden="true" />免费，无需注册。你的数据只保存在本设备上，不会上传。
            </p>
          </div>
        </section>

        <BudgetPersoCalculator t={copy} format={format} storageKey="bf:zh:503020-calculator:v1" beforeIncomes={<CurrencyPicker value={code} onChange={setCode} locale="zh" />} />

        <ToolArticle>
          <section>
            <h2>个人预算怎么做？5个步骤</h2>
            <p className="mt-4 text-lg">
              做预算不是为了省吃俭用，而是弄清楚钱都花到了哪里，再由你来决定什么最重要。准备好最近两三个月的银行流水，一个小时就够了。
            </p>
            <ol className="mt-6 list-decimal space-y-4 pl-5">
              <li>
                <strong>从税后到手收入算起。</strong>也就是扣除税款、社保或公积金等之后，每月实际到账的钱，再加上补贴和其他固定收入。如果收入不稳定（奖金、自由职业、零工），按收入较低的月份来算，而不是用乐观的平均值。
              </li>
              <li>
                <strong>列出固定开支。</strong>住房、水电燃气费、网络和手机费、交通、保险、贷款还款：每个月都要付、而且很难调整的开支。
              </li>
              <li>
                <strong>年度开支除以12。</strong>房产税、按年缴纳的保费、年费会员、过年过节的红包和礼物：每个月预留十二分之一，它们就不会再变成“意外开支”。
              </li>
              <li>
                <strong>估算浮动开支。</strong>买菜、外出就餐、衣服、兴趣爱好：这些花费变化最大。诚实的估计胜过理想的数字，记一个月账之后再调整。
              </li>
              <li>
                <strong>先存钱，再花钱。</strong>发工资后马上自动转一笔钱到储蓄账户，而不是等到月底再存“剩下的”：月底往往什么都不剩。哪怕金额很小，也能慢慢养成习惯。
              </li>
            </ol>
          </section>

          <section id="rule" className="scroll-mt-24">
            <h2>50/30/20法则是什么？</h2>
            <p className="mt-4 text-lg">
              <strong>50/30/20法则把你的税后收入分成三份</strong>：一半用于必须支付的开支，接近三分之一用于让生活更有滋味的开支，剩下的留给未来。
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border/70 p-4">
                <p className="font-display text-2xl font-bold text-foreground">50%</p>
                <h3 className="font-semibold text-foreground">必要开支</h3>
                <p className="mt-1 text-sm">住房、水电燃气费、买菜、交通、保险、贷款最低还款：无论如何都要付的钱。</p>
              </div>
              <div className="rounded-xl border border-border/70 p-4">
                <p className="font-display text-2xl font-bold text-foreground">30%</p>
                <h3 className="font-semibold text-foreground">弹性开支</h3>
                <p className="mt-1 text-sm">外出就餐、娱乐、兴趣爱好、购物、旅行、视频会员等“有了更好”的开支。</p>
              </div>
              <div className="rounded-xl border border-border/70 p-4">
                <p className="font-display text-2xl font-bold text-foreground">20%</p>
                <h3 className="font-semibold text-foreground">储蓄</h3>
                <p className="mt-1 text-sm">应急基金、储蓄目标、养老，或者在最低还款之外提前还债。</p>
              </div>
            </div>
            <p className="mt-6">
              这条法则由美国参议员伊丽莎白·沃伦（Elizabeth Warren）和女儿 Amelia Warren Tyagi 在2005年出版的《All Your Worth》一书中推广开来。它的好处是三个数字就能说清楚，而且给想要的东西留出了实实在在的空间，比起每一笔都要精打细算的预算，更容易坚持下去。
            </p>
            <p className="mt-4">
              它是一个<strong>参考，而不是硬性规定</strong>。如果你的房租很高，必要开支超过50%并不代表你做错了什么。这时计算器会按一个简单的规则，调整剩余部分的分配：
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>必要开支不超过50%</strong>：30%给弹性开支，20%用于储蓄，多出来的部分就是自由余额。</li>
              <li><strong>必要开支在50%到{pct(FULL_SAVINGS_MAX_NEEDS_SHARE)}之间</strong>：先压缩弹性开支，储蓄仍保持在收入的20%，前提是弹性开支至少不少于储蓄。</li>
              <li><strong>必要开支超过{pct(FULL_SAVINGS_MAX_NEEDS_SHARE)}</strong>：剩下的钱平均分成两半，一半给弹性开支，一半用于你能负担的储蓄。否则坚持存20%会把弹性开支压得太紧，而太紧的预算很难长久。</li>
              <li><strong>必要开支超过收入</strong>：不做分配，而是给出重新平衡预算的办法。</li>
            </ul>
          </section>

          <section>
            <h2>50/30/20预算示例：工资怎么分配</h2>
            <p className="mt-4">
              在我们的例子里，小林一个人生活，每月到手{money(example.revenus)}。下面是小林的必要开支（金额为虚构）：
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-foreground">
                    <th className="py-2 font-semibold">必要开支（示例）</th>
                    <th className="py-2 text-right font-semibold">每月</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {NEED_FIELDS.filter((f) => ex.needs[f.key]).map((f) => (
                    <tr key={f.key}><td className="py-2">{BUDGET_PERSO_ZH.needs[f.key].label}</td><td className="py-2 text-right tabular-nums">{money(ex.needs[f.key] ?? 0)}</td></tr>
                  ))}
                  <tr className="font-semibold text-foreground"><td className="py-2">必要开支合计</td><td className="py-2 text-right tabular-nums">{money(example.besoins)}</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              按50/30/20法则，小林的收入应该这样分配：必要开支{money(example.regle.besoins)}，弹性开支{money(example.regle.envies)}，储蓄{money(example.regle.epargne)}。小林实际的必要开支是{money(example.besoins)}，占收入的{pct(example.besoinsShare ?? 0)}，略高于参考线。扣除后还剩{money(example.reste)}：其中{money(example.epargne)}存起来，弹性开支就是{money(example.envies)}，相当于每天{moneyExact(example.enviesParJour)}。
            </p>
            <p className="mt-4">
              如果小林的房租是{money(exHigh.needs.logement ?? 0)}而不是{money(ex.needs.logement ?? 0)}，必要开支就会升到{money(exampleHigh.besoins)}（{pct(exampleHigh.besoinsShare ?? 0)}）。剩下的{money(exampleHigh.reste)}会平均分成两半：弹性开支{money(exampleHigh.envies)}，储蓄{money(exampleHigh.epargne)}。
            </p>
          </section>

          <section>
            <h2>每月存多少钱比较合适？</h2>
            <p className="mt-4">
              50/30/20法则建议存下<strong>税后到手收入的20%</strong>，以每月{money(example.revenus)}的收入来说就是{money(example.regle.epargne)}。这是一个有用的参考，而不是考试：真正合适的金额，是你每个月都能坚持下来的那个数。
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>从小额开始。</strong>发工资当天自动转出{money(format.example(25))}或{money(format.example(50))}，就已经在养成习惯了。每次加薪或还清一笔贷款时，再把金额调高一点。</li>
              <li><strong>先建应急基金。</strong>为意外准备一笔缓冲：东西坏了、房屋维修、医疗费用、收入减少。常见的参考是三到六个月的必要开支；给自己定一个目标，一步一步来。</li>
              <li><strong>再存具体目标。</strong>旅行、买车、买房首付：用目标金额除以距离目标日期的月数。比如12个月后需要{money(goal)}，每月就存{money(goal / 12)}。</li>
            </ul>
            <p className="mt-4">
              在 Budget Famille 里，储蓄目标可以设置金额和截止日期，每月该存多少会自动帮你算好。
            </p>
          </section>

          <FaqList id="faq-503020" items={BUDGET_503020_FAQ_ZH} title="常见问题" />

          <ChineseToolLinks current={PATH} />

          <section className="text-sm">
            <h2 className="!text-xl">须知</h2>
            <p className="mt-3">
              这个计算器根据你填写的金额给出估算。50/30/20法则只是一个参考，不能代替个性化的理财建议，我们也不推荐任何储蓄或理财产品。
            </p>
          </section>
        </ToolArticle>
      </main>
      <Footer />
    </div>
  );
}
