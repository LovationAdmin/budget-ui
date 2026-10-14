// src/components/help/articles.en.tsx
// Help center articles in English (same ids as articles.fr.tsx). Examples are
// written for an international reader: no French providers or banks.

import {
  ShieldCheck, FlaskConical, Sparkles, UserPlus, Calendar, Target, Receipt, Users, PiggyBank, Lock, MessageCircle, Download,
  Upload, Settings, CreditCard, Banknote, Calculator, BarChart3, Link, RefreshCw, Lightbulb, LightbulbOff, Edit, Trash2, Plus,
  Eye, EyeOff, Phone, ExternalLink, Building2, Wallet, ArrowLeftRight, CheckCircle2, AlertTriangle, Info, HelpCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PREMIUM_ENABLED } from '@/lib/premium';
import { FeatureBox, KBD, StepGuide, type HelpArticle } from './parts';

export const HELP_ARTICLES_EN: HelpArticle[] = [
  // ==================== SECURITY ====================
  {
    id: 'privacy',
    category: 'Security',
    icon: ShieldCheck,
    title: 'Privacy & data protection',
    description: 'How we protect your banking and personal information.',
    tags: ['security', 'encryption', 'data', 'gdpr', 'privacy', 'protection'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Keeping your financial data safe is our top priority. Here is how we protect it:
        </p>

        <div className="grid gap-4">
          <FeatureBox icon={Lock} title="AES-256-GCM encryption at rest" color="green">
            <p>All your budget data is encrypted with AES-256 in GCM mode before being stored in the database. If the database alone were breached, the data would stay unreadable without the encryption key (stored separately, in server memory).</p>
          </FeatureBox>

          <FeatureBox icon={EyeOff} title="Restricted access to data" color="blue">
            <p>Your budget data is stored encrypted in the database with AES-256-GCM. It is only decrypted to be served to you. Our technical team only accesses it for support operations, which are logged.</p>
          </FeatureBox>

          <FeatureBox icon={EyeOff} title="Private personal expenses: visible to you only" color="orange">
            <p>
              A personal expense marked <strong>private</strong> (a tax bill, money sent home, a personal loan…) is never written into the
              budget’s shared data: its name, category and note are encrypted separately and tied to your account only. Other members,
              even with full access to the budget, only see “Private expense” and its amount (which lowers your spending money in the Household tab).
            </p>
          </FeatureBox>

          <FeatureBox icon={Building2} title="Hosted in Europe (GDPR)" color="purple">
            <p>All our data is hosted in Europe (Frankfurt, Germany) in line with the GDPR. No data is transferred outside the EU.</p>
          </FeatureBox>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Secure bank connection (PSD2)
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            When you connect your bank through Enable Banking, we use the European PSD2 protocol:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Read-only:</strong> we can ONLY read your transactions. No transfers, no changes possible.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Direct sign-in:</strong> you sign in directly on your bank’s site. We never see your login details.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Revocable consent:</strong> you can remove the connection at any time from your bank or from our app.</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => window.open('/en/privacy', '_blank')}>
            <ExternalLink className="h-3 w-3 mr-2" />
            Privacy policy
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open('/en/terms', '_blank')}>
            <ExternalLink className="h-3 w-3 mr-2" />
            Terms of use
          </Button>
        </div>
      </div>
    ),
  },

  // ==================== MEMBERS & INCOME ====================
  {
    id: 'people-section',
    category: 'Household',
    icon: Users,
    title: 'The household: pay and joint pot',
    description: 'Tell each person’s pay apart from what they put into the joint pot, and split fairly.',
    tags: ['pay', 'income', 'members', 'household', 'people', 'contribution', 'joint pot', 'proportional', 'split'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Everyone keeps their own pay. The <strong>joint pot</strong> only receives each person’s <strong>contribution</strong>:
          all their pay, a fixed amount or a percentage. That pot pays the household’s bills and savings.
        </p>

        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Add a member
          </h4>
          <StepGuide steps={[
            { title: '“Household” tab → “Add a member”', description: 'Or from the “Add” button in the Month view.' },
            { title: 'First name and take-home pay', description: 'The amount that actually lands in their account each month.' },
            { title: 'What each member puts into the joint pot', description: 'All their pay, a fixed amount (e.g. 1,200) or a percentage (e.g. 40%). The screen immediately shows their spending money: what they have left once the household’s bills and savings are paid.' },
            { title: '(Optional) Joining the household', description: 'For a member who joins later (a roommate, someone going back to work…).' },
          ]} />
        </div>

        <Separator />

        <div className="grid gap-4">
          <FeatureBox icon={Calendar} title="“This month only” or “From this month on”" color="orange">
            <p>
              A pay or contribution that changes? Tap the member in the month concerned, edit, then choose:
              <strong> this month only</strong> (a month without pay, a bonus…) or <strong>from this month on</strong> (a raise, a new contract).
              Earlier months never change.
            </p>
          </FeatureBox>

          <FeatureBox icon={Calendar} title="The household, month by month" color="purple">
            <p>
              The ‹ › arrows scroll through the months: each card shows the pay, the payment into the pot and the spending money
              <strong> of the chosen month</strong> (frozen for a closed month), and the “The joint pot in …” panel compares income
              with the month’s bills and savings. A member’s <strong>“History”</strong> link traces their successive pay and contributions,
              their exceptions and a month-by-month table.
            </p>
          </FeatureBox>

          <FeatureBox icon={Calculator} title="Split the joint pot" color="blue">
            <p>
              Nothing to enter: the assistant starts from each person’s take-home pay and the <strong>month’s need</strong> (bills + savings, with a margin if you want).
              Methods: <strong>in proportion</strong> to pay, <strong>equal shares</strong>, <strong>the same spending money</strong> for everyone,
              or <strong>all of their pay</strong>. The need is worked out on the month the split starts (the current month by default),
              spread over 12 months, or on the busiest month.
            </p>
          </FeatureBox>

          <FeatureBox icon={Wallet} title="Personal expenses (taken from spending money)" color="orange">
            <p>
              A tax bill, money sent to family, a personal loan: add them with <strong>“+ Personal expense”</strong> on the member’s card
              (or “Who pays? → A member” in a new bill). They touch neither the joint pot nor the split: the Household tab simply
              shows “spending money 1,100, including 20 of personal expenses”. Visible to the household, or <strong>private</strong>:
              the name is encrypted and visible to you only, the amount is visible to all.
            </p>
          </FeatureBox>

          <FeatureBox icon={Banknote} title="One-off income" color="green">
            <p>
              A bonus, a 13th-month payment, a refund: add it as <strong>one-off income</strong> in the month concerned (Month view).
              It only adds to that month’s income.
            </p>
          </FeatureBox>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-800">
              <strong>Tip:</strong> always enter take-home (NET) pay, after tax and deductions, not gross pay.
              That’s what counts for your real budget.
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // ==================== BILLS ====================
  {
    id: 'charges-section',
    category: 'Bills',
    icon: Receipt,
    title: 'Bills: rules, not boxes',
    description: 'Monthly bills, some months, yearly or one-off; change an amount without touching the past.',
    tags: ['bills', 'expenses', 'fixed', 'rent', 'invoices', 'subscriptions', 'direct debits', 'yearly', 'ended', 'stop', 'exception'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          A bill is a <strong>rule</strong>: “1,180 every month”, “120 except July and August”, “960 every year in October”.
          Every month fills in by itself from these rules.
        </p>

        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Add a bill
          </h4>
          <StepGuide steps={[
            { title: '“New bill” (Bills tab) or “Add” (Month view)', description: 'The form opens in a panel, without leaving the screen.' },
            { title: 'Who pays?', description: 'The joint pot (a household bill) or a member from their spending money (a personal expense, possibly private).' },
            { title: 'Name and frequency', description: 'Every month, some months (e.g. school meals), every year (e.g. property tax, with the option to spread it over 12 months) or just once.' },
            { title: 'Amount and starting month', description: 'Optional: an end (“for 12 months” or “until June 2027”). The “In plain words” box sums up the rule and its effect on the month.' },
            { title: 'The AI detects the category', description: 'When you leave the name field (Energy, Mobile, Insurance…).' },
          ]} />
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-3">Edit without rewriting history</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-1.5 bg-white rounded border"><Edit className="h-4 w-4 text-gray-600" /></div>
              <div>
                <p className="font-medium text-sm">Change the amount</p>
                <p className="text-xs text-gray-600">
                  From a month: <strong>this month only</strong> (an exception) or <strong>from this month on</strong> (earlier months keep the old amount).
                  A typo can be corrected on all open months.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-1.5 bg-white rounded border"><Calendar className="h-4 w-4 text-orange-600" /></div>
              <div>
                <p className="font-medium text-sm">Stop a bill</p>
                <p className="text-xs text-gray-600">
                  It moves to “Ended”: it disappears from the following months but stays in the months where it counted.
                  A loan from January to March no longer clutters the list in August.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-1.5 bg-white rounded border"><Trash2 className="h-4 w-4 text-red-600" /></div>
              <div>
                <p className="font-medium text-sm">Delete</p>
                <p className="text-xs text-gray-600">Closed months keep their snapshot: deleting a bill never changes history.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-1.5 bg-white rounded border"><Lightbulb className="h-4 w-4 text-yellow-500" /></div>
              <div>
                <p className="font-medium text-sm">Savings suggestions</p>
                <p className="text-xs text-gray-600">Turned on or off bill by bill, from its details.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-1.5 bg-white rounded border"><Link className="h-4 w-4 text-indigo-600" /></div>
              <div>
                <p className="font-medium text-sm">Link to transactions</p>
                <p className="text-xs text-gray-600">
                  From a bill’s details: link it to real bank transactions to compare planned and actual.
                </p>
              </div>
            </div>
          </div>
        </div>

        <FeatureBox icon={Info} title="Automatic categories" color="blue">
          <p>
            The AI recognizes categories automatically: <strong>Energy</strong> (electricity, gas), <strong>Mobile</strong>,
            <strong> Internet</strong>, <strong>Insurance</strong>, <strong>Loan</strong>, etc.
            These categories turn on savings suggestions.
          </p>
        </FeatureBox>
      </div>
    ),
  },

  // ==================== AI SUGGESTIONS ====================
  {
    id: 'suggestions',
    category: 'Savings',
    icon: Sparkles,
    title: 'Smart savings suggestions',
    description: 'How the AI analyzes your bills to find savings.',
    tags: ['ai', 'savings', 'bills', 'competitors', 'suggestions', 'artificial intelligence', 'comparison'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Our artificial intelligence analyzes your recurring bills to find cheaper offers on the market in your country.
        </p>

        <div>
          <h4 className="font-semibold text-sm mb-3">How does it work?</h4>
          <StepGuide steps={[
            { title: 'Add your bills', description: 'Enter your fixed expenses (electricity, mobile, internet, insurance…).' },
            { title: 'The AI detects the category', description: 'The system identifies the type of expense automatically.' },
            { title: 'Market analysis', description: 'Our AI compares your amount with competitors’ current offers.' },
            { title: 'The TOP 3', description: 'The 3 best alternatives are shown with the potential saving.' },
          ]} />
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-3">Reading the suggestion cards</h4>
          <div className="space-y-3">
            <div className="p-4 border-2 border-green-300 bg-green-50/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-green-600 text-white">🏆 Best offer</Badge>
                <span className="font-bold text-green-700">−120/year</span>
              </div>
              <p className="text-sm font-medium">Example: Provider A</p>
              <p className="text-xs text-gray-600 mt-1">1 Gb fiber offer at 29.99/month for 12 months</p>
            </div>
            <p className="text-xs text-gray-600">
              The green card with the 🏆 medal is always the best saving found.
              Cards #2 and #3 are alternatives if the first one doesn’t suit you.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <FeatureBox icon={Phone} title="Contact buttons" color="blue">
            <p>
              Each suggestion can include a <strong>phone number</strong> and/or an <strong>email</strong> to contact the provider directly.
              Click “See the offer” to go to the official site.
            </p>
          </FeatureBox>

          <FeatureBox icon={RefreshCw} title="Caching (30 days)" color="gray">
            <p>
              Suggestions are cached for 30 days to avoid costly API calls.
              Click the 🔄 button to force a new analysis.
            </p>
          </FeatureBox>

          <FeatureBox icon={LightbulbOff} title="Turn off for one bill" color="orange">
            <p>
              Don’t want suggestions for a specific bill (e.g. your rent)? Open its details in the Bills tab and choose
              “Turn off savings suggestions”.
            </p>
          </FeatureBox>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-xs text-green-800">
            <strong>🎯 Goal:</strong> lower your fixed bills without changing your way of life.
          </p>
        </div>
      </div>
    ),
  },

  // ==================== SAVINGS ====================
  {
    id: 'projects-section',
    category: 'Savings',
    icon: Target,
    title: 'Savings: pots and general savings',
    description: 'Set money aside every month, track each pot, pay an expense from it.',
    tags: ['goals', 'savings', 'targets', 'holidays', 'renovations', 'envelopes', 'pot', 'general savings'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          A saving is a <strong>pot</strong>: an amount set aside every month (or chosen month by month), with a target if you want.
          Whatever is left in the joint pot at the end of each month goes automatically into <strong>general savings</strong>.
        </p>

        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Create a saving
          </h4>
          <StepGuide steps={[
            { title: '“Savings” tab → “New saving”', description: 'Or from the “Add” button in the Month view.' },
            { title: 'Name and target', description: 'E.g. “Down payment”: 15,000. Or no target, just a monthly amount.' },
            { title: 'Dates', description: '“Starting” and, if you have a deadline, “For…” or “Until…”.' },
            { title: 'Monthly amount worked out', description: 'With a target and a deadline, the app works out what to set aside each month (15,000 in 10 months → 1,500). You can change it.' },
            { title: 'Feasibility', description: 'The app checks whether the joint pot can keep up every month. If not: “Create and adjust contributions” (Household) or “Create and ask the AI budget for a plan”.' },
          ]} />
        </div>

        <Separator />

        <div className="grid gap-4">
          <FeatureBox icon={PiggyBank} title="In the pot" color="purple">
            <p>
              Each card shows what’s in the pot at the end of the current month: everything set aside, minus what was spent from it.
            </p>
          </FeatureBox>

          <FeatureBox icon={Wallet} title="Pay an expense from savings" color="blue">
            <p>
              Holidays paid from the “Holidays” pot? Record them as an <strong>expense paid from savings</strong>:
              the money comes out of the pot, not out of the month’s budget.
            </p>
          </FeatureBox>

          <FeatureBox icon={BarChart3} title="Target" color="green">
            <p>
              With a target (e.g. 3,000), a progress bar shows where you are and how much is left to set aside.
            </p>
          </FeatureBox>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-800">
            <strong>💡 Pro tip:</strong> always create an “Emergency fund” worth 3 to 6 months of fixed bills.
            It’s your safety net when the unexpected happens.
          </p>
        </div>
      </div>
    ),
  },

  // ==================== MONTH VIEW ====================
  {
    id: 'monthly-table',
    category: 'Planning',
    icon: Calendar,
    title: 'The Month view (and the Year)',
    description: 'One month at a time: joint pot income, bills, savings, what’s left and what changes.',
    tags: ['table', 'monthly', 'planning', 'budget', 'month', 'year', 'allocation', 'left', 'closing', 'locking'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          The <strong>Month</strong> view is the heart of Budget Famille: one month at a time, filled in automatically from your rules.
          Move around with the arrows or the 12-month strip.
        </p>

        <div>
          <h4 className="font-semibold text-sm mb-3">What a month shows</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded border-l-4 border-green-500">
              <span className="font-medium">Joint pot income</span>
              <span className="text-xs text-gray-600">- What each person pays in + the month’s one-off income</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded border-l-4 border-orange-500">
              <span className="font-medium">The month’s bills</span>
              <span className="text-xs text-gray-600">- Only those that apply this month</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded border-l-4 border-purple-500">
              <span className="font-medium">Savings</span>
              <span className="text-xs text-gray-600">- What’s set aside, pot by pot</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
              <span className="font-medium">Left for the month</span>
              <span className="text-xs text-gray-600">- Income − bills − savings: it goes into general savings</span>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-sm mb-3">Day to day</h4>
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <ArrowLeftRight className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">What changes</p>
                <p className="text-xs text-gray-600">
                  Each month lists what changed since the previous month: a new bill, an increase, the end of a loan, a changed contribution…
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <MessageCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Month note</p>
                <p className="text-xs text-gray-600">
                  E.g. “Bonus received”, “Energy bill adjustment”, “Lea’s birthday”. Visible to the whole household.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Lock className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Closed months</p>
                <p className="text-xs text-gray-600">
                  A past month closes by itself: its amounts are frozen, even if a bill changes or disappears later.
                  Need to correct it? “Reopen” first shows what will change.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-indigo-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">The year at a glance</p>
                <p className="text-xs text-gray-600">
                  The “Year” tab shows the 12 months side by side (income, bills, savings, what’s left). Tap a month to open it.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-800">
              <strong>Tip:</strong> tap a line to edit it. Every edit offers “this month only” or “from this month on”,
              and can be undone right after.
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // ==================== REALITY CHECK ====================
  {
    id: 'reality-check',
    category: 'Beta',
    icon: FlaskConical,
    title: PREMIUM_ENABLED ? 'Reality check (bank connection)' : 'Reality check (coming soon with Premium)',
    description: PREMIUM_ENABLED ? 'Connect your bank to compare budget and reality.' : 'Coming soon: your budget compared with your real accounts.',
    tags: ['bank', 'connection', 'transactions', 'reality check', 'psd2', 'enable banking', 'beta', 'premium', 'coming soon'],
    content: !PREMIUM_ENABLED ? (
      <div className="space-y-4 text-sm text-gray-600">
        <p>
          Soon, with <strong>Budget Famille Premium</strong>, your bank accounts will sync so you can compare every month what your
          budget plans and what you really spent, bill by bill. The connection will go through a licensed provider (PSD2): you’ll sign
          in on your bank’s site, and Budget Famille will never see your login details.
        </p>
        <p>
          Meanwhile, open your budget’s <strong>Reality check</strong> tab to try the demo with fictitious data. Everything else in the
          app works without a bank connection. The price will be announced at launch.
        </p>
      </div>
    ) : (
      <div className="space-y-6">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-2">
          <p className="text-xs text-indigo-800 font-medium flex items-center gap-2">
            <FlaskConical className="h-3 w-3" /> Experimental feature (Beta 2)
          </p>
        </div>

        <p className="text-sm text-gray-600">
          The reality check compares your budget forecasts with your real bank spending.
        </p>

        <div>
          <h4 className="font-semibold text-sm mb-3">How does it work?</h4>
          <StepGuide steps={[
            { title: 'Connect your bank', description: 'Click “Connect my bank” and choose among 2,500+ European banks.' },
            { title: 'Allow access (read-only)', description: 'You are redirected to your bank’s site to grant secure access.' },
            { title: 'Your transactions arrive', description: 'The last 90 days of transactions are fetched automatically.' },
            { title: 'Map your bills', description: 'Link each recurring transaction to a bill in your budget.' },
            { title: 'Compare!', description: 'See whether your planned budget matches reality.' },
          ]} />
        </div>

        <Separator />

        <div className="grid gap-4">
          <FeatureBox icon={Building2} title="2,500+ supported banks" color="blue">
            <p>
              Thanks to Enable Banking, we support almost every European bank: BNP Paribas, Société Générale, ING, N26, Revolut and many more.
            </p>
          </FeatureBox>

          <FeatureBox icon={Link} title="Map a transaction" color="purple">
            <p>
              In the Bills section, click the 🔗 icon to link a bill (e.g. “Electricity”) to real bank transactions
              (e.g. “ENERGY DIRECT DEBIT”). The system then works out the real amount spent.
            </p>
          </FeatureBox>

          <FeatureBox icon={Eye} title="Demo mode" color="green">
            <p>
              Not ready to connect your real bank? Turn on “Demo mode” to see the feature with fictitious data.
              Ideal for trying before you commit.
            </p>
          </FeatureBox>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-xs text-green-800">
            <strong>🔒 Security reminder:</strong> the connection is read-only (no transfers possible), uses the European PSD2 protocol,
            and can be revoked at any time.
          </p>
        </div>
      </div>
    ),
  },

  // ==================== COLLABORATION ====================
  {
    id: 'collaboration',
    category: 'Team',
    icon: UserPlus,
    title: 'Invite members',
    description: 'Share your budget with your partner, your family or your roommates.',
    tags: ['invitation', 'member', 'sharing', 'family', 'partner', 'roommates', 'shared flat', 'friends', 'collaboration'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Budget Famille works on your own or together. Invite whoever you like by email: a partner, family, roommates or friends.
        </p>

        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            Invite someone
          </h4>
          <StepGuide steps={[
            { title: 'Click “Invite members”', description: 'The button is in the budget’s header bar.' },
            { title: 'Enter the email address', description: 'The email of the person you want to invite.' },
            { title: 'The invitation is sent', description: 'They receive an email with a link to join the budget.' },
            { title: 'They create an account (if needed)', description: 'If they don’t have an account, they can create one for free.' },
          ]} />
        </div>

        <Separator />

        <div className="grid gap-4">
          <FeatureBox icon={Users} title="Roles" color="purple">
            <div className="space-y-2">
              <p><strong>Owner:</strong> can change everything, invite members, delete the budget.</p>
              <p><strong>Member:</strong> can see and edit the data, but can’t invite or delete.</p>
            </div>
          </FeatureBox>

          <FeatureBox icon={RefreshCw} title="Real-time sync" color="blue">
            <p>
              Every change syncs in real time. If your partner adds a bill, you’ll see it appear instantly.
            </p>
          </FeatureBox>

          <FeatureBox icon={MessageCircle} title="Talk through notes" color="green">
            <p>
              Use each month’s note (Month view) to communicate: “I paid the energy adjustment”, “Can we afford a restaurant this month?”, etc.
            </p>
          </FeatureBox>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-xs text-purple-800">
            <strong>👥 Tip:</strong> take a moment each month to review the dashboard together.
            Being open about money builds trust!
          </p>
        </div>
      </div>
    ),
  },

  // ==================== IMPORT/EXPORT ====================
  {
    id: 'import-export',
    category: 'Data',
    icon: Download,
    title: 'Data import & export',
    description: 'Back up and restore your budget data.',
    tags: ['import', 'export', 'backup', 'json', 'data'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Your data belongs to you. You can export it at any time and import it again if needed.
        </p>

        <div className="grid gap-4">
          <FeatureBox icon={Download} title="Export your data" color="blue">
            <p>
              Click the export button to download a JSON file with all your data: members, bills, goals, monthly allocations, notes, etc.
            </p>
          </FeatureBox>

          <FeatureBox icon={Upload} title="Import data" color="green">
            <p>
              You can import a JSON file you exported earlier to restore your data or move it to a new account.
            </p>
          </FeatureBox>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-800">
              <strong>Careful:</strong> importing replaces all the budget’s existing data.
              Make a backup before importing if you have important data.
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // ==================== SHORTCUTS ====================
  {
    id: 'shortcuts',
    category: 'Tips',
    icon: Settings,
    title: 'Shortcuts & tips',
    description: 'Save time with these hidden features.',
    tags: ['shortcuts', 'tips', 'productivity', 'keyboard'],
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Tips to use Budget Famille more efficiently.
        </p>

        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Autosave:</strong> every change is saved in 1 to 2 seconds; the indicator at the bottom of the screen confirms it.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Undo:</strong> after a change, the confirmation message offers “Undo” for a few seconds.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Dark mode:</strong> account menu (top right) › Appearance: Automatic, Light or Dark.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Language:</strong> the globe button in the menu bar switches between English and French.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Link to a month:</strong> the Month view’s address contains the month (?m=2026-10): share it or bookmark it.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Keyboard:</strong> <KBD>Esc</KBD> closes a panel; <KBD>Tab</KBD> moves between fields; in an incomplete form, the cursor goes straight to the field to fix.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span><strong>Closed months:</strong> a past month freezes by itself; to correct it, tap it then “Reopen”: the screen shows what will change.</span>
          </div>
        </div>
      </div>
    ),
  },

  // ==================== FAQ ====================
  {
    id: 'faq',
    category: 'FAQ',
    icon: HelpCircle,
    title: 'Frequently asked questions',
    description: 'Answers to the most common questions.',
    tags: ['faq', 'questions', 'help', 'problem', 'bug'],
    content: (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">🤔 Is my data really secure?</h4>
            <p className="text-xs text-gray-600">
              Yes. Your data is encrypted with AES-256-GCM before being stored, hosted in Europe, and only decrypted for the budget’s
              members. Private personal expenses go further: their name is encrypted separately and readable by you only, not even other
              members of the budget can access it. Details in “Privacy & data protection”.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">🏦 Can I connect several banks?</h4>
            <p className="text-xs text-gray-600">
              Yes, you can connect as many banks as you like to the same budget. Each connection is independent and can be removed at any time.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">💸 Is the app paid?</h4>
            <p className="text-xs text-gray-600">
              Basic access is free. Some advanced features (like unlimited bank connection) may require a Premium subscription in the future.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">📱 Is there a mobile app?</h4>
            <p className="text-xs text-gray-600">
              Budget Famille is a Progressive Web App (PWA). You can install it on your phone from the browser: Menu → “Add to Home Screen”.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">🐛 I found a bug, how do I report it?</h4>
            <p className="text-xs text-gray-600">
              Use the 👎 button under any page to send us detailed feedback. You can also contact us directly at lovation.pro@gmail.com.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">🔄 How do I undo a change?</h4>
            <p className="text-xs text-gray-600">
              After each change, the confirmation message offers “Undo” for a few seconds. After that, just make the opposite change:
              closed months never move without your consent.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">🙈 Can other members see my personal expenses?</h4>
            <p className="text-xs text-gray-600">
              A personal expense “visible to the household” is seen by everyone. A <strong>private</strong> personal expense only appears to
              others as “Private expense” with its amount (it lowers your spending money in the Household tab): its name, category and note
              are readable by you only.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">📊 Why does the month’s bill total differ from the average?</h4>
            <p className="text-xs text-gray-600">
              The Bills tab shows the current month’s total and, next to it, the 12-month average. A bill that ends soon (a loan being paid
              off, a payment in 3 installments) weighs on the month but little on the average: the screen names them. In the Household tab,
              you choose the basis of the need to cover: the starting month, the smoothed average or the busiest month.
            </p>
          </div>
        </div>
      </div>
    ),
  },
];
