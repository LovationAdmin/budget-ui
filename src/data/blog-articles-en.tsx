// src/data/blog-articles-en.tsx
// English articles of the blog (/en/blog/…). Each one adapts a French article
// (`translationOf`, its French slug: the two point to each other through
// hreflang) for readers anywhere: amounts carry no currency, and no country's
// benefits or banking rules are presented as the rule. The French articles
// about Senegal, Côte d'Ivoire and Morocco stay French-only.

import type { ReactNode } from 'react';
import type { BlogArticleContent } from './blog-articles';

function Cta({ title, text, href = '/signup', label }: { title: string; text: string; href?: string; label: string }) {
  return (
    <div className="bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl p-8 text-center my-8">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-lg mb-6 opacity-90">{text}</p>
      <a href={href} className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
        {label}
      </a>
    </div>
  );
}

function Formula({ children }: { children: ReactNode }) {
  return (
    <div className="bg-primary/10 border-l-4 border-primary p-6 my-6">
      <p className="text-lg font-semibold text-primary mb-0">{children}</p>
    </div>
  );
}

const AUTHOR = { author: 'Budget Famille team', authorBio: 'Budgeting experts and the developers of Budget Famille' };

export const blogArticlesEn: BlogArticleContent[] = [
  {
    id: 'en-1',
    translationOf: '5-etapes-gerer-budget-familial-2025',
    title: 'How to Make a Family Budget in 5 Steps',
    slug: 'how-to-make-a-family-budget',
    excerpt: 'Income, fixed bills, yearly costs, savings, then what’s left: the simple method to set up your family budget, with a free template.',
    category: 'Method',
    ...AUTHOR,
    publishedAt: '2026-10-16',
    readTime: '7 min',
    tags: ['Budget', 'Family', 'Method', 'Beginner'],
    featured: true,
    related: ['family-of-four-budget-example', 'joint-account-couples-spending-money', 'how-much-to-save-each-month-for-a-goal'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="lead">
          A family budget means deciding in advance where the household’s money goes each month, instead of finding out at the end
          that it ran short. You don’t need to be an accountant: five steps are enough, and about an hour the first time.
        </p>

        <h2>1. List the household’s take-home income</h2>
        <p>
          Start from what actually lands in your accounts, <strong>after tax and deductions</strong>: salaries, benefits, child support,
          pensions, side income.
        </p>
        <ul>
          <li><strong>Regular income</strong>: the usual monthly amount.</li>
          <li><strong>Variable income</strong> (bonuses, freelancing, shifts): use the lowest month of the past twelve, not the average. The extra from good months goes to savings.</li>
          <li><strong>As a couple</strong>: one line per person, so you can split the shared costs afterwards.</li>
        </ul>

        <h2>2. List your spending: fixed bills first, then day-to-day</h2>
        <p>
          Pull up your <strong>last three bank statements</strong>: it’s the only way to get realistic amounts.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr><th>Type</th><th>Examples</th><th>How to estimate it</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Fixed bills</strong></td><td>Rent or mortgage, energy, insurance, phone and internet, subscriptions, car loan</td><td>The amount of the payment</td></tr>
              <tr><td><strong>Day-to-day spending</strong></td><td>Groceries, fuel, health, clothes, fun</td><td>The average of the last 3 months</td></tr>
              <tr><td><strong>Children</strong></td><td>School meals, childcare, activities, pocket money</td><td>The monthly amount, some months only</td></tr>
            </tbody>
          </table>
        </div>

        <h2>3. Spread the costs that don’t come every month</h2>
        <p>
          This is the step most budgets forget, and the one that creates the “bad months”: back to school, holiday gifts, car insurance
          paid once a year, property tax, vacations.
        </p>
        <Formula>Monthly set-aside = total of yearly costs ÷ 12</Formula>
        <p>
          Example: back to school 300, holiday gifts 400, birthdays 200, vacation 1,500, so 2,400 a year: set aside
          <strong> 200 every month</strong>, and these costs won’t throw any month off balance again.
        </p>

        <h2>4. Decide on savings before you spend</h2>
        <p>
          Savings that are “whatever is left at the end of the month” almost never happen. Schedule them like a bill:
        </p>
        <ul>
          <li><strong>An emergency fund</strong> first: three months of expenses is a common benchmark.</li>
          <li><strong>Then goals with a date</strong>: an amount and a deadline (vacation in July, a down payment in two years). The math is in <a href="/en/blog/how-much-to-save-each-month-for-a-goal">how much to save each month for a goal</a>.</li>
        </ul>
        <p>
          A well-known benchmark is the <strong>50/30/20 rule</strong>: 50% of take-home pay for needs, 30% for wants, 20% for savings.
          On 3,000 that’s 1,500, 900 and 600. It’s a starting point: with high rent, saving 10% is already good. Try it on your own numbers
          with the <a href="/en/50-30-20-budget-calculator">50/30/20 budget calculator</a>.
        </p>

        <h2>5. Check what’s left for the month, and adjust</h2>
        <Formula>Income − spending − set-asides − savings = left for the month</Formula>
        <ul>
          <li><strong>Positive</strong>: keep a margin for the unexpected, and raise your savings with the rest.</li>
          <li><strong>Negative</strong>: start with fixed bills (energy, insurance, subscriptions), which you renegotiate once and for all. Our <a href="/en/ai-tools">free AI tools</a> estimate in 30 seconds what could go down.</li>
        </ul>
        <p>
          Then take <strong>15 minutes at the end of each month</strong> to compare the plan with what really happened. Three months in a row
          is enough to have a budget that holds. To see at a glance what your household keeps after fixed bills, per person and per day, use the
          <a href="/en/leftover-income-calculator"> leftover income calculator</a>.
        </p>

        <h2>As a couple: who pays for what?</h2>
        <p>
          The simplest setup is a <strong>joint pot</strong> (a joint account) for household bills, which each person pays into according
          to a rule (50/50, in proportion to pay, or the same spending money for both), and what’s left in each person’s account is theirs.
          The full method: <a href="/en/blog/joint-account-couples-spending-money">joint account, spending money and personal expenses</a>.
          For a complete worked example, see <a href="/en/blog/family-of-four-budget-example">a monthly budget for a family of four</a>.
        </p>

        <h2>Which tool should you use?</h2>
        <ul>
          <li><strong>A spreadsheet</strong>: our <a href="/en/free-budget-template">free family budget template</a> comes as Excel (automatic calculations, any currency) and as a printable PDF.</li>
          <li><strong>An app</strong>: Budget Famille follows these five steps, fills in every month from your rules (monthly rent, a yearly tax, school meals some months) and is shared in real time, with your partner or the whole household. Despite its name, it also works for a solo budget, a shared flat, or a goal (a wedding, renovations, a trip) in a separate budget. Free, no bank connection required.</li>
        </ul>

        <Cta title="Your family budget in 15 minutes" text="Free, no credit card, shared in real time." label="Make my budget →" />

        <h2>❓ Frequently asked questions</h2>
        <h3>How do I make a simple family budget?</h3>
        <p>List your take-home income, then fixed bills and day-to-day spending from your bank statements, set aside 1/12 of your yearly costs each month, schedule your savings, and check what’s left.</p>
        <h3>What percentage of income should a family save?</h3>
        <p>The 50/30/20 rule suggests 20%. What matters most is to start, even at 5 or 10%, and to raise it month after month.</p>
        <h3>Is there a free app to manage a family budget?</h3>
        <p>Yes: Budget Famille is free for budgets, members, savings and sharing, with no bank connection. Coming soon with Budget Famille Premium: your accounts synced automatically to compare the plan with what you actually spent.</p>
      </div>
    ),
  },
  {
    id: 'en-2',
    translationOf: 'compte-commun-couple-argent-de-poche',
    title: 'Couples’ Joint Account: How Much Each Pays In and Keeps',
    slug: 'joint-account-couples-spending-money',
    excerpt: 'How much to put into the joint account, how much to keep, and how to handle personal expenses (taxes, money sent to family) without revealing everything.',
    category: 'Couples',
    ...AUTHOR,
    publishedAt: '2026-10-16',
    readTime: '7 min',
    tags: ['Couples', 'Joint account', 'Spending money', 'Privacy'],
    featured: true,
    related: ['budgeting-as-a-couple-rules', 'how-to-make-a-family-budget', 'family-of-four-budget-example'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="lead">
          A joint account is the simplest way to pay the rent, groceries and bills together. But it often leaves three questions
          unanswered: how much should each person pay in, how much do they really have left, and what about the expenses that are
          nobody else’s business?
        </p>

        <h2>🏦 A joint account: what to know first</h2>
        <p>Married or not, most banks let two people open a joint account. The usual rules:</p>
        <ul>
          <li><strong>Each account holder can usually use it on their own</strong> (payments, withdrawals, transfers).</li>
          <li><strong>Shared responsibility for an overdraft</strong>: in many countries, each holder can be asked to repay the whole negative balance, even for the other’s spending.</li>
          <li><strong>Leaving the account</strong> usually takes a written request to the bank, and closing it needs both holders to agree.</li>
          <li><strong>If you aren’t married</strong>, keep a record of who pays in what when your contributions are unequal.</li>
        </ul>
        <p>Rules vary by bank and by country: read the account agreement before you sign.</p>

        <h2>💡 The model that works: joint pot + spending money</h2>
        <p>Rather than pooling everything or splitting everything, many calm couples do this:</p>
        <ol>
          <li><strong>List the household bills</strong> for the month: rent, energy, groceries, insurance, childcare…</li>
          <li><strong>Add the shared savings</strong> (vacation, emergency fund, a down payment).</li>
          <li><strong>Each person pays their share into the joint pot</strong> (the joint account) to cover that total.</li>
          <li><strong>What’s left in each person’s own account is their spending money</strong>: theirs to use, no questions asked.</li>
        </ol>

        <h3>Three ways to split</h3>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr><th>Method</th><th>Principle</th><th>Example (needs: 2,400; pay of 2,800 and 1,800)</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>50/50</strong></td><td>Each pays the same amount</td><td>1,200 each → spending money: 1,600 and 600</td></tr>
              <tr><td><strong>In proportion to pay</strong></td><td>Each pays the same % of their pay</td><td>≈ 1,461 and 939 → spending money: ≈ 1,339 and 861</td></tr>
              <tr><td><strong>Same spending money</strong></td><td>Each keeps the same amount for themselves</td><td>1,700 and 700 → spending money: 1,100 each</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          None is “the right one”: 50/50 suits similar incomes, splitting in proportion to pay is the most common when the gap is large,
          and “same spending money” puts equal standards of living first.
        </p>

        <h3>Work it out on the actual month, not an average</h3>
        <p>
          Needs change from one month to the next: property tax one month, car insurance another, back to school in the fall. Splitting a yearly
          average smooths everything out, but leaves the joint account overdrawn in the heavy months. It’s better to
          <strong> split on the current month</strong>, and to look at the heaviest month ahead of time.
        </p>

        <h2>🧾 Personal expenses: out of the owner’s spending money</h2>
        <p>
          Some expenses concern only one partner: a personal <strong>tax</strong>, <strong>money sent to family abroad</strong>, a loan taken out
          before living together, child support. They shouldn’t weigh on the joint pot, but they do reduce what that person has left to live on.
        </p>
        <p>
          The fairest rule: <strong>the split of the joint pot doesn’t change</strong>, and you simply show that the person’s spending money includes
          that expense. Example: with “same spending money” at 1,100 each, if Ama pays 200 of personal tax a month for 5 months, you don’t raise her
          partner’s share: you show “1,100 of spending money, including 200 of personal expenses”.
        </p>

        <h2>🔒 Transparency, not exposure</h2>
        <p>
          Being open about <strong>amounts</strong> avoids bad surprises: each person knows what the other really has. But the <strong>details</strong>
          of a personal expense (who you send money to, which debt you’re paying off) can rightly stay private.
        </p>
        <p>
          That’s why Budget Famille has <strong>private personal expenses</strong>: the amount stays visible to the household, but the expense’s name is
          stored separately on our servers, encrypted, and <strong>only the person who created it can see it</strong>. Other members just see
          “Private expense”. If you leave a budget, this information is deleted.
        </p>

        <h2>📱 How to do it in Budget Famille</h2>
        <ol>
          <li>In the <strong>Household</strong> tab, add each member with their take-home pay.</li>
          <li>In <strong>Bills</strong>, add your bills: at <strong>“Who pays it?”</strong>, choose the joint pot or a member (a personal expense, public or private).</li>
          <li>Open <strong>“Split the joint pot”</strong>: choose 50/50, in proportion to pay or same spending money, and the month to start from.</li>
          <li>Each member sees their <strong>spending money</strong> for the month, personal expenses included, and their history month by month.</li>
        </ol>
        <p>
          The same idea works for roommates or friends: create a separate budget (“Flat share”, “Trip with friends”), invite everyone by email, and the
          joint pot is split the same way. To split rent between roommates, try the <a href="/en/rent-split-calculator">rent split calculator</a>.
        </p>

        <Cta title="Your joint pot, worked out to the month" text="Free. Your private expenses stay private." label="Create our couple budget →" />

        <h2>❓ Frequently asked questions</h2>
        <h3>Do you need to be married to open a joint account?</h3>
        <p>Usually not. Most banks let any two adults open a joint account, with the same shared-responsibility rules.</p>
        <h3>How much should each partner put into the joint account?</h3>
        <p>Enough to cover the month’s household bills and shared savings, split by the method you choose (50/50, in proportion to pay, or same spending money).</p>
        <h3>Should my partner see all my spending?</h3>
        <p>The amounts that affect the shared budget, yes. The details of a personal expense can stay private: only its amount counts for the budget.</p>
      </div>
    ),
  },
  {
    id: 'en-3',
    translationOf: 'combien-epargner-par-mois-objectif-date',
    title: 'How Much to Save Each Month to Reach a Goal by a Date',
    slug: 'how-much-to-save-each-month-for-a-goal',
    excerpt: '15,000 by July? How to work out what to set aside each month, how to check it’s realistic, and what to do if it isn’t.',
    category: 'Savings',
    ...AUTHOR,
    publishedAt: '2026-10-16',
    readTime: '5 min',
    tags: ['Savings', 'Goal', 'Calculation'],
    featured: true,
    related: ['how-to-make-a-family-budget', 'family-of-four-budget-example', 'budgeting-as-a-couple-rules'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="lead">
          A down payment, a wedding, a car, a trip: once you know the amount you need and when you need it, the question becomes simple:
          <strong> how much should you set aside each month?</strong>
        </p>

        <h2>🧮 The basic formula</h2>
        <Formula>Monthly amount = (target − already saved) ÷ number of months left</Formula>
        <p>
          Count the months <strong>including</strong> the first and the last payment. Always round up: better to finish a little ahead than a little short.
        </p>
        <h3>Worked examples</h3>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr><th>Target</th><th>Already saved</th><th>Period</th><th>Months</th><th>Per month</th></tr>
            </thead>
            <tbody>
              <tr><td>15,000 (down payment)</td><td>0</td><td>October 2026 → July 2027</td><td>10</td><td><strong>1,500</strong></td></tr>
              <tr><td>3,000 (vacation)</td><td>600</td><td>November 2026 → June 2027</td><td>8</td><td><strong>300</strong></td></tr>
              <tr><td>1,200 (holiday gifts)</td><td>0</td><td>January → December</td><td>12</td><td><strong>100</strong></td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Over short periods, the interest of a savings account changes the result very little: leave it out of the math and treat it as a safety margin.
        </p>

        <h2>✅ Is it realistic? The tightest-month test</h2>
        <p>An amount can look fine on average and become impossible in some months. Before you commit:</p>
        <ol>
          <li><strong>Find the heaviest month</strong> of the period (a yearly tax, back to school, annual insurance…).</li>
          <li><strong>Work out what’s left that month</strong> after bills and the savings already planned.</li>
          <li><strong>Compare</strong>: if the monthly amount is more than what’s left, the goal doesn’t fit as it stands.</li>
        </ol>

        <h2>🔧 If the amount is too high</h2>
        <ul>
          <li><strong>Push the date back</strong>: going from 10 to 15 months brings 1,500 down to 1,000 a month.</li>
          <li><strong>Revisit the target</strong>: maybe 12,000 instead of 15,000 is enough.</li>
          <li><strong>Cut a bill</strong>: energy, insurance and subscriptions are where you recover money fastest (our <a href="/en/ai-tools">free AI tools</a> estimate it in 30 seconds).</li>
          <li><strong>Adjust contributions</strong> to the joint pot if the goal is shared, while leaving everyone reasonable spending money.</li>
        </ul>

        <h2>📱 The goal planner in Budget Famille</h2>
        <p>In the <strong>Savings</strong> tab, create a savings pot with:</p>
        <ol>
          <li>your <strong>target</strong> (e.g. 15,000);</li>
          <li>the <strong>start month</strong> and the <strong>target date</strong>;</li>
          <li>the monthly amount is <strong>worked out for you</strong>, and the screen tells you whether it <strong>fits in your budget</strong>, checking the tightest month.</li>
        </ol>
        <p>
          If it doesn’t fit, you can adjust everyone’s contributions to the joint pot, or ask the <strong>AI budget</strong> for a plan: it suggests savings
          and a split that keep your deadline. The pot can live in your household budget, or in a separate budget for the goal (“Wedding 2027”,
          “Renovations”), whether you save alone or together.
        </p>

        <Cta title="Work out your monthly savings in 1 minute" text="A target, a date, and that’s it. Free." label="Create my savings pot →" />

        <h2>❓ Frequently asked questions</h2>
        <h3>How much should I save each month based on my pay?</h3>
        <p>The 50/30/20 rule suggests 20% of take-home pay, but it works better to start from your goals and their dates, then check that the total stays realistic.</p>
        <h3>Is one savings account better than several pots?</h3>
        <p>Several pots, one per goal: you see each one’s progress and you avoid dipping into the down payment for the vacation.</p>
      </div>
    ),
  },
  {
    id: 'en-4',
    translationOf: 'budget-famille-4-personnes-exemple',
    title: 'Monthly Budget for a Family of Four: A Worked Example',
    slug: 'family-of-four-budget-example',
    excerpt: 'How much does a family of four need each month? An example budget line by line (housing, groceries, children, savings) and how to adapt it to yours.',
    category: 'Method',
    ...AUTHOR,
    publishedAt: '2026-10-16',
    readTime: '8 min',
    tags: ['Budget', 'Family', 'Children', 'Groceries', 'Example'],
    featured: true,
    related: ['how-to-make-a-family-budget', 'joint-account-couples-spending-money', 'how-much-to-save-each-month-for-a-goal'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="lead">
          “How much does it take to raise a family of four?” There’s no single number: it depends on rent, the city and the children’s ages.
          But a <strong>complete example, line by line</strong>, helps you place your own budget and spot the lines that drift.
        </p>

        <h2>📋 Example monthly budget for a family of four</h2>
        <p>
          <strong>The household in this example</strong>: a couple with two children aged 4 and 9, renting a three-bedroom home in a mid-sized city,
          one car. Take-home pay: 2,300 and 1,900, plus 150 of child benefit. These figures are an illustration, in no particular currency,
          not a national average.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr><th>Line</th><th>Per month</th><th>Share of income</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Household income</strong></td><td><strong>4,350</strong></td><td>100%</td></tr>
              <tr><td>Rent and service charges</td><td>1,100</td><td>25%</td></tr>
              <tr><td>Energy and water</td><td>180</td><td>4%</td></tr>
              <tr><td>Groceries (food, toiletries, cleaning)</td><td>800</td><td>18%</td></tr>
              <tr><td>Transport (fuel, upkeep, transit pass)</td><td>300</td><td>7%</td></tr>
              <tr><td>Insurance (home, car)</td><td>110</td><td>3%</td></tr>
              <tr><td>Health (insurance, out of pocket)</td><td>110</td><td>3%</td></tr>
              <tr><td>Phone and internet</td><td>70</td><td>2%</td></tr>
              <tr><td>Children (school meals, after-school care, activities)</td><td>280</td><td>6%</td></tr>
              <tr><td>Clothes</td><td>100</td><td>2%</td></tr>
              <tr><td>Fun and going out</td><td>200</td><td>5%</td></tr>
              <tr><td>Set aside for yearly costs</td><td>200</td><td>5%</td></tr>
              <tr><td>Savings</td><td>400</td><td>9%</td></tr>
              <tr><td><strong>Left over (margin for the unexpected)</strong></td><td><strong>500</strong></td><td>11%</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Total spending: 3,450, savings: 400. The <strong>500 margin</strong> isn’t “extra” money: it’s what absorbs a repair, a heavier bill or an
          unplanned outing without touching the savings.
        </p>

        <h2>🛒 Groceries for a family of four</h2>
        <p>It’s the biggest variable line, and the hardest to guess. The most reliable method:</p>
        <ol>
          <li><strong>Add up your receipts</strong> (or the supermarket payments on your statements) over 4 weeks.</li>
          <li><strong>Get a weekly figure</strong>, then the real month: <em>weekly amount × 52 ÷ 12</em>. 185 a week is about 800 a month, not 740.</li>
          <li><strong>Separate food from the rest</strong> (toiletries, cleaning, diapers): that’s often where the gap hides.</li>
        </ol>
        <p>To bring this line down without going without:</p>
        <ul>
          <li>plan the week’s meals and shop with a list;</li>
          <li>compare the price per kilo or per pound, and choose store brands for the basics;</li>
          <li>buy fruit and vegetables in season;</li>
          <li>limit the quick weekday trips, where the unplanned purchases happen.</li>
        </ul>

        <h2>📅 The costs that don’t come every month</h2>
        <p>
          In the example, 200 a month is set aside for <strong>back to school</strong> (300), <strong>holiday gifts</strong> (400),
          <strong> birthdays</strong> (200) and <strong>vacation</strong> (1,500): 2,400 a year ÷ 12. Homeowner? Add the property tax.
          Car insurance paid once a year? Add it too.
        </p>
        <p>Without this set-aside, the back-to-school and holiday months end up overdrawn, even with a budget that balances the rest of the year.</p>

        <h2>👨‍👩‍👧‍👦 With two children, three children: what changes</h2>
        <ul>
          <li><strong>Groceries, school meals and activities</strong> grow with each child, and with age: a teenager eats as much as an adult.</li>
          <li><strong>Housing</strong> is the biggest jump: one more bedroom often means a noticeably higher rent, depending on the city.</li>
          <li><strong>Support</strong> changes: many countries pay child benefit or tax credits per child. Check what you’re entitled to on your government’s website.</li>
          <li><strong>Childcare</strong> for the youngest can cost more than the rent: look for childcare tax credits or subsidies where you live.</li>
        </ul>

        <h2>⚖️ Splitting between the two parents</h2>
        <p>
          In the example, household bills and shared savings come to 3,850. After the child benefit, 3,700 is left to pay into the joint pot.
          <strong> In proportion to pay</strong> (2,300 and 1,900), that’s about 2,026 and 1,674: each parent keeps 274 and 226, which is the
          500 margin of the table, shared in the same proportion. The three methods (50/50, in proportion, same spending money) are compared in
          <a href="/en/blog/joint-account-couples-spending-money"> our joint account guide</a>.
        </p>

        <h2>✏️ Make yours in 15 minutes</h2>
        <ol>
          <li>Copy this table with <strong>your</strong> amounts, from your last three bank statements.</li>
          <li>Add the <strong>set-aside</strong> for your yearly costs.</li>
          <li>Set your <strong>savings</strong>, then look at what’s left: the step-by-step method is in <a href="/en/blog/how-to-make-a-family-budget">how to make a family budget in 5 steps</a>.</li>
        </ol>
        <p>
          To go faster: our <a href="/en/free-budget-template">free family budget template</a> (Excel with formulas, or a printable PDF), or the Budget
          Famille app, which fills in every month from your rules and works out everyone’s share of the joint pot. To see in one minute what your
          household keeps after fixed bills, per person and per day: the <a href="/en/leftover-income-calculator">leftover income calculator</a>.
        </p>

        <Cta title="Your family budget, worked out every month" text="Free, no bank connection required, shared in real time." label="Create our family budget →" />

        <h2>❓ Frequently asked questions</h2>
        <h3>What is a good monthly budget for a family of four?</h3>
        <p>It depends above all on housing and the city. In our mid-sized city example, spending reaches 3,450 a month, plus 400 of savings, on an income of 4,350.</p>
        <h3>How much should a family of four spend on groceries?</h3>
        <p>In the example, 800 a month including toiletries and cleaning. Start from your receipts over 4 weeks, and count the real month (× 52 ÷ 12), not 4 weeks.</p>
        <h3>What income does a family of four need?</h3>
        <p>The better benchmark isn’t the pay itself but what’s left after fixed bills and set-asides: if it covers groceries, the children and some savings, the budget holds.</p>
      </div>
    ),
  },
  {
    id: 'en-5',
    translationOf: 'budget-couple-regles-gerer-argent',
    title: 'Budgeting as a Couple: 7 Rules for Managing Money Together',
    slug: 'budgeting-as-a-couple-rules',
    excerpt: 'Money is one of the most common sources of tension in a couple. Seven simple rules to manage it together, openly and fairly.',
    category: 'Couples',
    ...AUTHOR,
    publishedAt: '2026-10-16',
    readTime: '7 min',
    tags: ['Couples', 'Communication', 'Budget'],
    related: ['joint-account-couples-spending-money', 'how-much-to-save-each-month-for-a-goal', 'how-to-make-a-family-budget'],
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="lead">
          Money is one of the subjects couples argue about most. Yet with a few clear rules and the right tools, it can bring you together
          rather than pull you apart.
        </p>

        <h2>Rule 1: be open about the numbers</h2>
        <p>
          Each partner knows the other’s take-home pay, debts and regular commitments. You don’t need to justify every coffee, but you can’t
          build a shared budget on guesses. Put the numbers on the table once, calmly, and update them when something changes.
        </p>

        <h2>Rule 2: three accounts, or the equivalent</h2>
        <p>
          A simple structure that works for many couples: <strong>one joint account</strong> for shared bills and savings, and <strong>one personal
          account each</strong> for spending money. Everyone keeps some independence, and the shared costs are paid without discussion.
        </p>

        <h2>Rule 3: fair isn’t always 50/50</h2>
        <p>
          When incomes are far apart, paying half each can leave one partner with almost nothing. Splitting <strong>in proportion to pay</strong>, or so
          that both keep <strong>the same spending money</strong>, is often fairer. The three methods are compared with figures in
          <a href="/en/blog/joint-account-couples-spending-money"> our joint account guide</a>.
        </p>

        <h2>Rule 4: big purchases are decided together</h2>
        <p>
          Agree on an amount (for example 200 or 500) above which a purchase from the joint account is discussed first. Below it, nobody has to ask.
          It avoids both surprises and constant negotiation.
        </p>

        <h2>Rule 5: a 30-minute monthly check-in</h2>
        <p>
          Once a month, look together at what was planned and what really happened: the bills that changed, the goals that moved forward, the next
          heavy month. Short, regular and blame-free, it prevents most money arguments.
        </p>

        <h2>Rule 6: shared goals with a date</h2>
        <p>
          A trip next summer, a wedding, a down payment: goals with a target and a date turn saving into a project rather than a sacrifice. Work out
          the monthly amount with <a href="/en/blog/how-much-to-save-each-month-for-a-goal">how much to save each month for a goal</a>.
        </p>

        <h2>Rule 7: respect your differences</h2>
        <p>
          One of you likes to save, the other to enjoy the present; one sends money to family, the other doesn’t. Spending money exists precisely so
          that each person can make their own choices without being judged. Personal expenses can even stay private: only their amount counts for the
          household budget.
        </p>

        <h2>🚨 Mistakes to avoid</h2>
        <ul>
          <li>Hiding a debt or a big purchase: trust breaks faster than the budget.</li>
          <li>Splitting on a yearly average: the heavy months then overdraw the joint account.</li>
          <li>Leaving the savings for “whatever is left”: it rarely is.</li>
          <li>Letting one partner manage everything alone: both should be able to read the budget.</li>
          <li>Talking about money only when there’s a problem.</li>
        </ul>

        <h2>📱 How Budget Famille helps</h2>
        <p>
          Each partner sees the same numbers in real time, on their phone. The <strong>“Split the joint pot”</strong> assistant works out each person’s
          contribution (50/50, in proportion to pay or same spending money) on the actual month, everyone sees their spending money, and personal
          expenses can stay private. Savings pots with a target and a date show the progress of your shared goals.
        </p>

        <Cta title="Budget together, without the arguments" text="Free, shared in real time, private expenses stay private." label="Create our couple budget →" />

        <h2>❓ Frequently asked questions</h2>
        <h3>What if one partner earns much more?</h3>
        <p>Split in proportion to pay, or so that both keep the same spending money: both are fairer than 50/50 when incomes are far apart.</p>
        <h3>Should unmarried couples pool everything?</h3>
        <p>Not necessarily. A joint pot for shared costs plus personal accounts keeps things simple, and it’s worth keeping a record of who paid in what for big purchases.</p>
        <h3>My partner won’t talk about money. What can I do?</h3>
        <p>Start small: a shared goal you both want (a trip, a project) is often an easier way in than the bills. A short monthly check-in then becomes a habit.</p>
      </div>
    ),
  },
];
