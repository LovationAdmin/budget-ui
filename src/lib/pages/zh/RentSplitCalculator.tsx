// src/lib/pages/zh/RentSplitCalculator.tsx
// ============================================================================
// « 合租房租分摊计算器 » — the simplified Chinese version of /budget-colocation
// and /en/rent-split-calculator (hreflang, src/i18n/locales.ts). Same
// calculator and split; the words, the example (Chinese names, bedroom sizes
// in 平方米 or 平方英尺 depending on the currency), the flatshare advice (主卧带
// 独卫, 二房东, 空调) and the FAQ are written for Chinese readers in several
// countries, without any country's tenancy law presented as the rule. Amounts
// are in the visitor's currency (yuan by default).
// Targets « 合租房租分摊计算器 », « 合租房租怎么分 », « 按面积分摊房租 » and
// « 室友水电费怎么分 ».
//
// Chinese text runs stay on one line in the JSX: a line break inside a run
// would add a space between characters.
// ============================================================================

import { Calculator, ShieldCheck } from 'lucide-react';
import { CurrencyPicker, useCurrency } from '@/components/tools/CurrencyPicker';
import { scaleAmounts } from '@/lib/tools/scaleAmounts';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ChineseToolLinks } from '@/components/zh/ChineseLayout';
import { ColocationCalculator } from '@/components/tools/ColocationCalculator';
import { FaqList, ToolArticle } from '@/components/tools/ToolKit';
import { AREA_UNIT_ZH, COLOCATION_ZH, colocExampleZh } from '@/i18n/zh/colocation';
import { COMMON_SHARE, computeColocation } from '@/lib/tools/colocation';
import { RENT_SPLIT_FAQ_ZH } from '@/seo/zh/faq-rent-split';

const PATH = '/zh/rent-split-calculator';

export default function RentSplitCalculatorZh() {
  const { code, setCode, currency, format } = useCurrency('zh');
  const { moneyExact: money, pct } = format;
  const unit = AREA_UNIT_ZH[currency.area];
  // The fictitious example in the visitor's currency (bedroom sizes stay as they are).
  const example = scaleAmounts(colocExampleZh(currency.area), format.example, ['room']);
  const examples = (['egal', 'chambre', 'revenus'] as const).map((m) => computeColocation({ ...example, method: m }));
  const sizes = example.roommates.map((m) => m.room);
  const names = example.roommates.map((m) => m.name);

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
              合租房租分摊计算器：每位室友该付多少？
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              合租房租怎么分才公平？用这个合租房租分摊计算器，选择平均分摊、按房间面积或按收入比例，马上算出每位室友每月要付的房租和水电网费。结果随输入实时更新。
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-4 w-4 align-[-3px] text-success" aria-hidden="true" />你的数据只保存在本设备上，不会上传。
            </p>
          </div>
        </section>

        <ColocationCalculator
          t={COLOCATION_ZH}
          format={format}
          storageKey="bf:zh:rent-split:v1"
          example={example}
          areaUnit={unit}
          beforeHousehold={<CurrencyPicker value={code} onChange={setCode} locale="zh" />}
        />

        <ToolArticle>
          <section>
            <h2>合租房租怎么分？三种常见方法</h2>
            <p className="mt-4 text-lg">
              房租怎么分并没有固定的规则：室友们一起商量决定，最好<strong>在入住之前</strong>就谈好，并且写下来（写进合租协议、群聊消息或共享预算里都可以）。最常见的有三种方法。
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>平均分摊</strong>：房租除以人数。最简单，房间大小差不多时也最公平。</li>
              <li><strong>按房间面积</strong>：客厅、厨房、卫生间大家都在用，所以一部分房租平均分摊，其余部分按各自卧室的面积分摊。本计算器把{pct(COMMON_SHARE)}的房租平均分摊。用平方米还是平方英尺都没关系，只看比例。</li>
              <li><strong>按收入比例</strong>：每人按税后到手收入的比例分摊房租。朋友之间不太常见，但室友收入差距较大时很实用。</li>
            </ul>
            <p className="mt-4">
              公共费用（水电燃气费、网费、保险、日用品）几乎都是平均分摊。主卧带独立卫生间或阳台，或者有人要用车位？可以商量让这位室友每月多付一点。
            </p>
          </section>

          <section>
            <h2>示例：三人合租</h2>
            <p className="mt-4">
              在我们的示例中，{names[0]}、{names[1]}和{names[2]}合租一套三居室，月租{money(example.rent)}，三间卧室分别为{sizes[0]}、{sizes[1]}和{sizes[2]}{unit}。公共费用（水电燃气费、网费、保险和日用品）每月共{money(examples[0].bills)}，每人{money(examples[0].shares[0].bills)}。
            </p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <caption className="sr-only">示例中每位室友每月应付的金额，按分摊方式列出</caption>
                <thead>
                  <tr className="border-b border-border text-foreground">
                    <th scope="col" className="py-2 pr-3 font-semibold">室友</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">平均分摊</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">按房间面积</th>
                    <th scope="col" className="py-2 text-right font-semibold">按收入比例</th>
                  </tr>
                </thead>
                <tbody>
                  {example.roommates.map((m, i) => (
                    <tr key={m.name} className="border-b border-border/60">
                      <th scope="row" className="py-2 pr-3 font-medium text-foreground">{m.name}<span className="font-normal text-muted-foreground">（{m.room}{unit}，到手收入{format.money(m.income)}）</span></th>
                      {examples.map((e, k) => <td key={k} className="py-2 pr-3 text-right tabular-nums">{money(e.shares[i].total)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm">
              以上均为每月金额，已包含房租和公共费用。按房间面积分摊时，最大和最小的卧室每月相差{money(examples[1].shares[2].total - examples[1].shares[0].total)}。
            </p>
          </section>

          <section>
            <h2>室友水电费怎么分？设一个公共基金</h2>
            <p className="mt-4">
              不想每笔都记账、算来算去，最简单的办法是设一个<strong>公共基金</strong>：每月初大家把自己的份额转进去，房租、水电网费和公共日用品都从这里付。各自的个人开销（自己的伙食、外出聚餐）则分开算。
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>一起列清楚哪些算公共开销：清洁用品、卫生纸、油盐酱醋……以及哪些不算。</li>
              <li>把不定期的账单折算成每月：两个月交一次的电费除以2，一年交一次的保险除以12。</li>
              <li>有人用电明显更多，比如整天开空调？可以商量让他多分摊一点水电费。</li>
              <li>每月对一次账；有人搬进或搬出时，及时调整。</li>
            </ul>
          </section>

          <section>
            <h2>入住前：把约定写下来</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li><strong>一起签约还是各自签约</strong>：如果大家签的是同一份租房合同，往往每个人都要对全部房租负责，有人不交，房东可能会找其他人补齐。如果各自单独签约，通常每人只对自己的房租负责。请看清楚你的租约和当地规定。</li>
              <li><strong>向二房东租房</strong>：如果你是从主租客（二房东）手里转租，要知道在一些地方，转租需要房东同意。签约前问清楚房东是否知情，以及原租约什么时候到期。</li>
              <li><strong>分摊方式</strong>：用哪种方法、每人付多少、每月几号交。</li>
              <li><strong>押金</strong>：谁交了多少，有人搬走时押金怎么结算、怎么退还。</li>
              <li><strong>搬走</strong>：要提前多久通知，新室友由谁来找。</li>
              <li><strong>账单和家务</strong>：各项账户登记在谁名下，公共日用品怎么买，打扫卫生怎么轮流。</li>
            </ul>
          </section>

          <FaqList id="faq-rent-split" items={RENT_SPLIT_FAQ_ZH} title="常见问题" />

          <ChineseToolLinks current={PATH} />

          <section className="text-sm">
            <h2 className="!text-xl">须知</h2>
            <p className="mt-3">
              本计算器根据你填写的金额给出参考性的分摊结果，不能替代你的租房合同或专业法律意见。
            </p>
          </section>
        </ToolArticle>
      </main>
      <Footer />
    </div>
  );
}
