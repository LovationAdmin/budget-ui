// src/lib/pages/zh/WeddingBudgetCalculator.tsx
// ============================================================================
// « 婚礼预算计算器 » — the simplified Chinese version of /budget-mariage and
// /en/wedding-budget-calculator (hreflang, src/i18n/locales.ts). Same
// calculator, same fictitious example (labelled wherever it shows) and same
// saving plan, in the visitor's currency (yuan by default). Written for
// Chinese weddings: the banquet priced per table of about 10, 婚庆, 喜糖,
// red envelopes not counted in advance, 彩礼/嫁妆 kept apart as a family
// matter. No averages or market prices. Targets « 婚礼预算计算器 »,
// « 结婚要花多少钱 », « 婚礼预算清单 », « 婚宴一桌多少钱怎么算 » and
// « 结婚每月存多少钱 ».
// ============================================================================

import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, ShieldCheck, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { CurrencyPicker, useCurrency } from '@/components/tools/CurrencyPicker';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ChineseToolLinks } from '@/components/zh/ChineseLayout';
import { Button } from '@/components/ui/button';
import { MariageCalculator, useMariageCalculator } from '@/components/tools/MariageCalculator';
import { FaqList, ToolArticle } from '@/components/tools/ToolKit';
import { MARIAGE_ZH } from '@/i18n/zh/mariage';
import { EXAMPLE as REFERENCE_EXAMPLE, FEWER_GUESTS, POSTE_FIELDS, exampleResult } from '@/lib/tools/mariage';
import { scaleAmounts } from '@/lib/tools/scaleAmounts';
import { WEDDING_FAQ_ZH } from '@/seo/zh/faq-wedding';

const PATH = '/zh/wedding-budget-calculator';
/** Guests at a banquet table, to turn per-guest prices into per-table ones. */
const TABLE_SIZE = 10;

export default function WeddingBudgetCalculatorZh() {
  const { code, setCode, format } = useCurrency('zh');
  const { money, moneyExact, pct } = format;
  // The fictitious example in the visitor's currency (guests and months stay as they are).
  const EXAMPLE = useMemo(() => scaleAmounts(REFERENCE_EXAMPLE, format.example, ['guests', 'monthsAhead']), [format]);
  const ex = exampleResult(EXAMPLE);
  const calc = useMariageCalculator({ t: MARIAGE_ZH, format, storageKey: 'bf:zh:wedding-calculator:v1', example: EXAMPLE });
  const { fillExample, scrollToResults, projectYear } = calc;
  const tables = Math.ceil(ex.guests / TABLE_SIZE);
  const fewerTables = Math.round(ex.fewerGuests.fewer / TABLE_SIZE);
  const perTable = ex.ratePerGuest * TABLE_SIZE;

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
              婚礼预算计算器
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              婚宴、场地、婚纱礼服、摄影：用这个免费的婚礼预算计算器把各项报价加起来，算出结婚要花多少钱、每位宾客的成本，以及婚礼前每月要存多少。结果随输入实时更新。
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-4 w-4 align-[-3px] text-success" aria-hidden="true" />你的数据只保存在本设备上，不会上传。
            </p>
            <div className="mt-6 flex flex-col items-center gap-1.5">
              <Button type="button" variant="outline" className="min-h-[44px] bg-card" onClick={fillExample}>
                <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" /> 填入示例
              </Button>
              <p className="text-xs text-muted-foreground">{MARIAGE_ZH.exampleNote}。</p>
            </div>
          </div>
        </section>

        <MariageCalculator
          calc={calc}
          t={MARIAGE_ZH}
          format={format}
          beforeWedding={<CurrencyPicker value={code} onChange={setCode} locale="zh" />}
        />

        <ToolArticle>
          <section>
            <h2>婚礼预算怎么算</h2>
            <p className="mt-4 text-lg">
              婚礼预算要从<strong>你拿到的报价</strong>算起，而不是套用某个平均数：同样的宾客人数，场地、婚宴档次、城市和季节不同，花费可能相差很大。
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5">
              <li>
                <strong>列出所有项目</strong>：婚宴、酒水、场地、婚纱礼服与妆发、婚纱照和摄影摄像、婚庆策划与主持、鲜花布置、婚戒首饰、请柬和喜糖伴手礼；打算度蜜月的话，也一并列上。
              </li>
              <li>
                <strong>多问几家报价</strong>：大项至少比较两三家，看清包含哪些内容：服务费、酒水、布置、超时费、税费等。酒店婚宴常有最低桌数或最低消费，也要问清楚。
              </li>
              <li>
                <strong>把按人头计价的和固定费用分开</strong>：婚宴和酒水按人（或按桌）计价，会随宾客名单变化；场地、摄影、婚庆、礼服则是固定的。
              </li>
              <li>
                <strong>留一笔预备金</strong>：改衣、婚车、交通、临时采购……总有意料之外的开销。
              </li>
            </ol>
            <p className="mt-6 rounded-xl bg-muted/60 p-4 font-semibold text-foreground">
              婚礼预算 = 每位宾客的婚宴和酒水费用 × 宾客人数 + 固定费用 + 预备金
            </p>
          </section>

          <section>
            <h2>婚宴一桌多少钱怎么算</h2>
            <p className="mt-4">
              中式婚宴一般按桌报价，一桌通常坐{TABLE_SIZE}人左右，具体看酒店和桌型。计算器按每位宾客计算，换算很简单：
            </p>
            <p className="mt-4 rounded-xl bg-muted/60 p-4 font-semibold text-foreground">
              每人价格 = 每桌价格 ÷ 每桌人数
            </p>
            <p className="mt-4">
              以我们的虚构示例为例：婚宴每人{moneyExact(EXAMPLE.amounts.traiteur ?? 0)}，酒水每人{moneyExact(EXAMPLE.amounts.boissons ?? 0)}，合计每人{money(ex.ratePerGuest)}；一桌{TABLE_SIZE}人，就是<strong>每桌{money(perTable)}</strong>。{ex.guests}位宾客大约需要{tables}桌。
            </p>
            <p className="mt-4">
              算桌数时，用宾客人数除以每桌人数，有余数就向上取整；再问清酒店是否要预留备用桌，备用桌没用上收不收费。酒水有的按桌打包，有的按实际用量结算；自带酒水的话，有些场地会收开瓶费。把这些都换算成每人价格，填进计算器的“{MARIAGE_ZH.posts.traiteur.label}”和“{MARIAGE_ZH.posts.boissons.label}”两栏。
            </p>
          </section>

          <section>
            <h2>婚礼预算清单示例：100位宾客、10桌</h2>
            <p className="mt-4">
              在我们的示例里，一对新人邀请{ex.guests}位宾客，按每桌{TABLE_SIZE}人共{tables}桌。金额都是<strong>虚构的</strong>：为了演示计算而取的整数，并不是平均价格。结婚花费没有官方参考价，总额主要取决于宾客人数和婚宴价格。请把每一行换成你自己的报价。
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-foreground">
                    <th className="py-2 font-semibold">项目（虚构示例）</th>
                    <th className="py-2 text-right font-semibold">金额</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {POSTE_FIELDS.filter((f) => EXAMPLE.amounts[f.key]).map((f) => {
                    const v = EXAMPLE.amounts[f.key] ?? 0;
                    return (
                      <tr key={f.key}>
                        <td className="py-2">
                          {MARIAGE_ZH.posts[f.key].label}
                          {f.perGuest && <span className="text-muted-foreground">（{moneyExact(v)} × {ex.guests}位宾客）</span>}
                        </td>
                        <td className="py-2 text-right tabular-nums">{money(f.perGuest ? v * ex.guests : v)}</td>
                      </tr>
                    );
                  })}
                  <tr className="font-semibold text-foreground">
                    <td className="py-2">合计</td>
                    <td className="py-2 text-right tabular-nums">{money(ex.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              平均下来，<strong>每位宾客{money(ex.costPerGuest)}</strong>。按人计价的婚宴和酒水共{money(ex.perGuestTotal)}，占总额的{pct(ex.perGuestShare ?? 0)}，相当于每桌{money(perTable)}；其余{money(ex.fixedTotal)}不随宾客人数变化。少请{ex.fewerGuests.fewer}位宾客
              {fewerTables > 0 && <>（约少{fewerTables}桌）</>}，这个示例至少能省下{money(ex.fewerGuests.saving)}：宾客名单是最直接的调节手段。示例没有包括蜜月旅行，如果你们有计划，记得加上。
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 min-h-[44px]"
              onClick={() => { if (fillExample()) scrollToResults(); }}
            >
              把这个示例填入计算器 <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </section>

          <section>
            <h2>结婚每月要存多少钱</h2>
            <p className="mt-4 rounded-xl bg-muted/60 p-4 font-semibold text-foreground">
              每月存款 =（婚礼总预算 − 已存金额）÷ 距离婚礼的月数
            </p>
            <p className="mt-4">
              从本月算起，到婚礼前一个月为止：这样钱在婚礼之前就已备齐。金额向上取整，宁可稍微提前完成。
            </p>
            <p className="mt-4">
              在我们的示例里，这对新人已经存了{money(ex.saved)}，{ex.months}个月后结婚：（{money(ex.total)} − {money(ex.saved)}）÷ {ex.months} = <strong>每月{money(ex.monthly)}</strong>。
            </p>
            <p className="mt-4">
              存款目标按全部开支来定，不要先扣掉预计收到的礼金（红包）：礼金要到婚礼当天才收到，金额也难以预估。收到之后，再用来补回存款或其他开销。
            </p>
            <p className="mt-4">
              也要留意报价里的付款时间：很多商家在预订时就要收定金，婚礼前再收尾款。这些钱比婚礼当天更早付出，存款进度要跟得上。想确认这笔月存款放得进你的预算，可以试试我们的
              <Link to="/zh/50-30-20-budget-calculator" className="font-medium text-primary hover:underline">50/30/20预算计算器</Link>。
            </p>
          </section>

          <section>
            <h2>怎样省下婚礼开支</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>
                <strong>精简宾客名单</strong>：最直接的办法，因为婚宴和酒水按人头计算，每少一桌就省下一桌的钱。计算器会显示少请{FEWER_GUESTS}位宾客能省多少。
              </li>
              <li>
                <strong>避开热门日子</strong>：很多酒店和商家在周末、节假日和热门的“好日子”报价更高，平日或淡季往往便宜一些。两种日期都问一下报价，比较一下。
              </li>
              <li>
                <strong>比较场地和套餐</strong>：酒店、餐厅、户外场地各有不同，有的可以自选婚庆，有的套餐已含布置和酒水。看清包含哪些内容；自带酒水的话，问清是否收开瓶费。
              </li>
              <li>
                <strong>调整婚宴形式</strong>：桌数、菜单档次、自助餐或酒会形式都可以考虑。如果要在双方家乡各办一场，分别算清每一场的桌数和费用。
              </li>
              <li>
                <strong>选对婚纱照套系</strong>：看清底片数量、精修张数、服装造型套数和加价项目，避免选片时一再加钱。
              </li>
              <li>
                <strong>能自己动手的就自己来</strong>：请柬、布置、喜糖包装、婚礼歌单，但婚礼前一天要给自己留点时间。
              </li>
              <li>
                <strong>租借或买二手</strong>：礼服、装饰和道具都可以租或买二手；仪式用过的鲜花，也可以挪到宴会上继续用。
              </li>
            </ul>
          </section>

          <section>
            <h2>婚礼费用由谁来出？</h2>
            <p className="mt-4">
              没有固定规矩。视家庭情况和经济条件，有的由新人自己承担，有的和双方父母分担，也有父母只负责某一项，比如婚宴或婚纱。
            </p>
            <p className="mt-4">
              彩礼和嫁妆因地区和家庭而异，是两家人另外商量的事。这个计算器只算婚礼本身的开支，建议把它们分开记录，不要混在婚礼预算里。
            </p>
            <p className="mt-4">
              最简单的做法是尽早沟通，最好在签第一份报价之前就说清楚：谁出钱、出多少、什么时候到位。写下来，大家心里有数，也不会临时措手不及。
            </p>
            <p className="mt-4">
              一起管预算会轻松很多。在 Budget Famille 里，单独建一个“{projectYear}年婚礼”预算，设置自己的成员：通过邮箱邀请另一半，愿意的话也可以邀请父母，大家实时看到同样的数字。设一个带目标金额和日期的储蓄目标，每月要存多少会自动算好。应用免费使用，无需连接银行账户；目前提供法语和英语版本。
            </p>
          </section>

          <FaqList id="faq-wedding" items={WEDDING_FAQ_ZH} title="常见问题" />

          <ChineseToolLinks current={PATH} />

          <section className="text-sm">
            <h2 className="!text-xl">须知</h2>
            <p className="mt-3">
              这个计算器根据你自己填写的金额进行估算。它不知道你所在地区的行情，也不知道商家的价格：只有你拿到的报价才算数。示例金额是虚构的，本页内容不构成个人理财建议。
            </p>
          </section>
        </ToolArticle>
      </main>
      <Footer />
    </div>
  );
}
