// src/lib/pages/zh/Home.tsx
// ============================================================================
// « 免费家庭预算计算器 » — the Chinese home (/zh, simplified Chinese). The app
// is in French and English, so this page leads to what is written in Chinese:
// the four free calculators, a short method for a family budget and the FAQ.
// Paired with / and /en (hreflang, src/i18n/locales.ts).
// ============================================================================

import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, Heart, PieChart, ShieldCheck, Users, Wallet, type LucideIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FaqList, ToolArticle } from '@/components/tools/ToolKit';
import { ZH_TOOLS } from '@/i18n/zh/tools';
import { HOME_FAQ_ZH } from '@/seo/zh/faq-home';

const ICONS: Record<string, LucideIcon> = {
  '/zh/50-30-20-budget-calculator': PieChart,
  '/zh/rent-split-calculator': Users,
  '/zh/wedding-budget-calculator': Heart,
  '/zh/leftover-income-calculator': Wallet,
};

const STEPS = [
  { title: '算清到手收入', text: '工资、奖金、补贴等每月实际到账的钱，按税后计算。收入不稳定的话，按收入较少的月份来算，比按平均值更稳妥。' },
  { title: '列出固定开支', text: '房租或房贷、水电燃气、网费话费、交通、保险、贷款还款：每个月都要付、很难临时减少的钱。' },
  { title: '年度开支除以12', text: '物业费、一年一交的保险、年度会员、过年的红包和年货：每月预留十二分之一，到时候就不会手忙脚乱。' },
  { title: '先储蓄，再消费', text: '发工资当天就把要存的钱自动转出去，而不是等到月底再存“剩下的”。先存够3到6个月必要开支的应急基金，再存其他目标。' },
];

export default function HomeZh() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="px-4 pt-12 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-semibold text-success">
              <Calculator className="h-4 w-4" aria-hidden="true" /> 免费 · 无需注册
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl [text-wrap:balance]">
              免费家庭预算计算器
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              工资怎么分配、合租房租怎么分、婚礼要存多少钱、扣掉固定开支还剩多少：选一个计算器，输入你的数字，结果马上出来。
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-4 w-4 align-[-3px] text-success" aria-hidden="true" />你的数据只保存在本设备上，不会上传。
            </p>
          </div>
        </section>

        <section aria-labelledby="tools" className="px-4 pb-16 sm:px-6 lg:px-8">
          <h2 id="tools" className="sr-only">免费计算器</h2>
          <ul className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
            {ZH_TOOLS.map((tool) => {
              const Icon = ICONS[tool.path] ?? Calculator;
              return (
                <li key={tool.path}>
                  <Link
                    to={tool.path}
                    className="group flex h-full items-start gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-lg font-semibold text-foreground">{tool.label}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">{tool.text}</span>
                    </span>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <ToolArticle>
          <section>
            <h2>家庭预算怎么做：4个步骤</h2>
            <p className="mt-4 text-lg">
              做预算不是为了省吃俭用，而是弄清楚钱花到了哪里，再决定什么最重要。准备好最近两三个月的银行流水或账单，一个小时就够了。
            </p>
            <ol className="mt-6 list-decimal space-y-4 pl-5">
              {STEPS.map((step) => (
                <li key={step.title}><strong>{step.title}。</strong>{step.text}</li>
              ))}
            </ol>
            <p className="mt-4">
              想知道收入该怎么分？<Link to="/zh/50-30-20-budget-calculator" className="font-medium text-primary hover:underline">50/30/20预算计算器</Link>会按你的收入和必要开支给出建议。
            </p>
          </section>

          <section>
            <h2>和家人一起管钱</h2>
            <p className="mt-4">
              Budget Famille 是一款免费的预算应用，可以一个人用，也可以和伴侣、家人或室友共享：记录固定开支和公共基金，每个人保留自己的零花钱，储蓄计划可以设定目标金额和日期，每月该存多少会自动算好。无需绑定银行账户，没有广告。
            </p>
            <p className="mt-4">应用目前提供法语和英语版本。</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90">
                免费注册 <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/en/features" hrefLang="en" className="inline-flex min-h-[44px] items-center justify-center rounded-xl px-5 font-semibold text-primary transition hover:bg-primary/10">
                了解全部功能（英文）
              </Link>
            </div>
          </section>

          <FaqList id="faq-home-zh" items={HOME_FAQ_ZH} title="常见问题" />
        </ToolArticle>
      </main>
      <Footer />
    </div>
  );
}
