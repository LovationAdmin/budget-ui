// src/lib/pages/zh/LeftoverIncomeCalculator.tsx
// ============================================================================
// « 每月结余计算器 » — the simplified Chinese version of /calcul-reste-a-vivre
// and /en/leftover-income-calculator (hreflang, src/i18n/locales.ts). Same
// calculator and same example as in English, with the words, the income items
// and the advice written for Chinese readers in several countries (mainland
// China, Singapore, Malaysia, Hong Kong, Taiwan, overseas). Amounts are in the
// visitor's currency (yuan by default). Targets « 每月结余计算 », « 工资扣除固定
// 开支还剩多少 », « 家庭收支计算器 », « 生活费计算器 » and « 月收入怎么分配 ».
// ============================================================================

import { Link } from 'react-router-dom';
import { Calculator, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CurrencyPicker, useCurrency } from '@/components/tools/CurrencyPicker';
import { ChineseToolLinks } from '@/components/zh/ChineseLayout';
import { ResteAVivreCalculator } from '@/components/tools/ResteAVivreCalculator';
import { FaqList, ToolArticle } from '@/components/tools/ToolKit';
import { RAV_EXAMPLE_ZH, RESTE_A_VIVRE_ZH } from '@/i18n/zh/resteAVivre';
import { scaleAmounts } from '@/lib/tools/scaleAmounts';
import { CHARGE_FIELDS, computeResteAVivre } from '@/lib/tools/resteAVivre';
import { LEFTOVER_INCOME_FAQ_ZH } from '@/seo/zh/faq-leftover-income';

const PATH = '/zh/leftover-income-calculator';
const link = 'font-medium text-primary hover:underline';

export default function LeftoverIncomeCalculatorZh() {
  const { code, setCode, format } = useCurrency('zh');
  const { money, moneyExact, pct } = format;
  // The fictitious example in the visitor's currency (the household stays as it is).
  const EXAMPLE = scaleAmounts(RAV_EXAMPLE_ZH, format.example, ['household']);
  const example = computeResteAVivre(EXAMPLE.household, EXAMPLE.incomes, EXAMPLE.charges);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="px-4 pt-12 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-semibold text-success">
              <Calculator className="h-4 w-4" aria-hidden="true" /> 免费计算器 · 无需注册
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl [text-wrap:balance]">
              每月结余计算器
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              工资扣除固定开支后还剩多少？用这个每月结余计算器，输入家庭的税后到手收入和固定开支，马上就能看到每个月还剩多少钱，以及人均、每天有多少生活费可用。结果随输入实时更新。
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-4 w-4 align-[-3px] text-success" aria-hidden="true" />你的数据只保存在本设备上，不会上传。
            </p>
          </div>
        </section>

        <ResteAVivreCalculator
          t={RESTE_A_VIVRE_ZH}
          format={format}
          storageKey="bf:zh:leftover-income:v1"
          example={EXAMPLE}
          beforeHousehold={<CurrencyPicker value={code} onChange={setCode} locale="zh" />}
        />

        <ToolArticle>
          <section>
            <h2>每月结余怎么计算？</h2>
            <p className="mt-4 text-lg">
              <strong>每月结余 = 每月税后到手收入 − 每月固定开支。</strong>也就是把每个月固定要付的钱都付完之后剩下的钱：买菜、买衣服、看病自付的部分、娱乐和储蓄，都要从这里出。算清每月结余，是理清家庭收支的第一步。
            </p>
            <p className="mt-4">
              它不是统计上的“可支配收入”：可支配收入只扣除了个税和社保等缴费，每月结余还要再扣掉房租房贷、水电燃气这些固定开支，更接近你每个月真正能自由安排的钱。
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="font-semibold text-foreground">要计入的收入</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>税后工资（已扣除个税、社保或公积金等）</li>
                  <li>每月发放的补贴和津贴</li>
                  <li>养老金、收到的子女抚养费、租金收入</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">要扣除的固定开支</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>房租或房贷月供</li>
                  <li>其他贷款（车贷、消费贷、信用卡最低还款）</li>
                  <li>水电燃气费、保险</li>
                  <li>宽带、话费、会员订阅、交通</li>
                  <li>托育费用、学杂费，以及没有从工资中代扣的税费</li>
                  <li>支付的抚养费、每月固定给父母的生活费</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2>举个例子</h2>
            <p className="mt-4">
              在我们虚构的例子里，林先生和太太有两个孩子，分别6岁和10岁，全家每月税后到手收入{money(example.revenus)}。
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-foreground">
                    <th className="py-2 font-semibold">项目（示例）</th>
                    <th className="py-2 text-right font-semibold">每月</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr><td className="py-2">税后工资</td><td className="py-2 text-right tabular-nums">{money(example.revenus)}</td></tr>
                  {CHARGE_FIELDS.filter((f) => EXAMPLE.charges[f.key]).map((f) => (
                    <tr key={f.key}><td className="py-2">{RESTE_A_VIVRE_ZH.charges[f.key].label}</td><td className="py-2 text-right tabular-nums">−{money(EXAMPLE.charges[f.key] ?? 0)}</td></tr>
                  ))}
                  <tr className="font-semibold text-foreground"><td className="py-2">每月结余</td><td className="py-2 text-right tabular-nums">{money(example.reste)}</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              相当于人均{money(example.parPersonne)}，全家每天{moneyExact(example.parJour)}。固定开支占收入的{pct(example.chargesShare ?? 0)}，车贷月供占{pct(example.debtRatio ?? 0)}。想规划月收入怎么分配、剩下的钱怎么花，可以试试<Link to="/zh/50-30-20-budget-calculator" className={link}>50/30/20预算计算器</Link>。
            </p>
          </section>

          <section>
            <h2>按人均算，还是按成人等值算？</h2>
            <p className="mt-4">
              用结余除以人数最简单，但孩子的花销一般比大人少，两个大人一起生活也用不了一个人的两倍（房租只付一份，宽带也只装一条）。为了比较不同规模的家庭，统计机构会改用<strong>成人等值人数</strong>来除，常用的是 OECD 修正等值规模：第一位成人记1，其他14岁及以上的家庭成员每人记0.5，14岁以下的孩子每人记0.3。一对夫妻带两个小孩，就折合2.1个成人。
            </p>
            <p className="mt-4">
              按这个口径，例子中林家的每月结余折合每个成人{money(example.parUnite)}。
            </p>
          </section>

          <section>
            <h2>每月结余多少才够？</h2>
            <p className="mt-4">
              没有放之四海而皆准的最低标准：要看你所在城市的生活成本，也要看家里有几口人。下面两个经验法则可以参考：
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>住房</strong>：常见的经验法则是，房租或房贷最好不超过收入的30%左右。这个门槛源自美国的统计口径：美国人口普查局把住房支出超过收入30%的家庭视为“住房负担过重”。</li>
              <li><strong>整体必要开支</strong>：50/30/20法则建议把必要开支（住房、各类账单、买菜、贷款最低还款）控制在税后收入的一半左右，30%留给想要的东西，20%用于储蓄。</li>
            </ul>
            <p className="mt-4">
              银行等贷款机构会按自己的标准看你的负债收入比，而且通常按税前收入计算：计算器里的贷款占比是按到手收入算的，只能作为粗略参考。
            </p>
          </section>

          <section>
            <h2>怎样提高每月结余？</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>逐项比较账单</strong>：电费、宽带、话费和保险，看看有没有更划算的套餐。我们的<Link to="/en/ai-tools" className={link}>免费 AI 工具</Link>（英文）30秒就能估算哪些费用可以降低。</li>
              <li><strong>查查自己能领哪些补贴</strong>：育儿、住房等补贴和税收减免，以当地政府官方网站为准。</li>
              <li><strong>把一年一付的费用摊到每个月</strong>：年缴保险、房产税、开学费用等，每月先存下十二分之一。我们的<Link to="/en/free-budget-template" className={link}>免费预算表格</Link>（Excel，英文版）会自动帮你算好。</li>
              <li><strong>夫妻公平分摊</strong>：两人收入差距较大时，按各自收入比例分摊共同开支更公平，表格里的“Joint pot”（共同账户）工作表比较了几种分法。</li>
              <li><strong>及时求助</strong>：如果收支已经难以平衡，可以向当地免费的公益债务咨询或法律援助机构求助。</li>
            </ul>
          </section>

          <FaqList id="faq-leftover-income" items={LEFTOVER_INCOME_FAQ_ZH} title="常见问题" />

          <ChineseToolLinks current={PATH} />

          <section className="text-sm">
            <h2 className="!text-xl">须知</h2>
            <p className="mt-3">
              本计算器根据你输入的金额给出参考数字，不能代替贷款机构或债务顾问的专业意见。
            </p>
            <p className="mt-3">资料来源（英文）：</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><a href="https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Glossary:Equivalised_disposable_income" target="_blank" rel="noopener" className="text-primary hover:underline">Eurostat：等值可支配收入（OECD 修正等值规模）</a></li>
              <li><a href="https://www.census.gov/library/stories/2022/12/housing-costs-burden.html" target="_blank" rel="noopener" className="text-primary hover:underline">美国人口普查局：住房成本负担（超过收入的30%）</a></li>
            </ul>
          </section>
        </ToolArticle>
      </main>
      <Footer />
    </div>
  );
}
