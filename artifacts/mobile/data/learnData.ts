export type LearnCategory = 'budgeting' | 'investing' | 'credit' | 'saving';

export interface LearnTip {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: LearnCategory;
  readMinutes: number;
  icon: string;
}

export const LEARN_TIPS: LearnTip[] = [
  // Budgeting
  {
    id: 'b1',
    title: 'The 50/30/20 Rule',
    summary: 'The simplest budget framework that actually works.',
    body: 'Allocate 50% of your after-tax income to needs (rent, food, utilities), 30% to wants (dining, entertainment, subscriptions), and 20% to savings and debt repayment. This flexible framework adapts to any income level and helps you build wealth without feeling deprived.',
    category: 'budgeting',
    readMinutes: 2,
    icon: 'pie-chart',
  },
  {
    id: 'b2',
    title: 'Zero-Based Budgeting',
    summary: 'Give every dollar a job before the month begins.',
    body: 'In zero-based budgeting, you assign every dollar of income to a specific category until you reach zero. This doesn\'t mean spending it all — savings and investments count as "assigned." It forces intentionality with every dollar and eliminates mindless spending.',
    category: 'budgeting',
    readMinutes: 3,
    icon: 'target',
  },
  {
    id: 'b3',
    title: 'Track Every Purchase',
    summary: 'Awareness is the first step to financial freedom.',
    body: 'Studies show that people who track their spending reduce it by 10–15% simply through awareness. Use a notes app, spreadsheet, or budgeting app to log every expense for 30 days. You\'ll be surprised where your money actually goes versus where you think it goes.',
    category: 'budgeting',
    readMinutes: 2,
    icon: 'edit-3',
  },
  {
    id: 'b4',
    title: 'Pay Yourself First',
    summary: 'Automate savings before you can spend it.',
    body: 'Set up automatic transfers to your savings or investment accounts on payday. When savings happen automatically, you adjust your spending to what\'s left. Most people save whatever is left over — which is usually nothing. Flip the script: save first, spend what\'s left.',
    category: 'budgeting',
    readMinutes: 2,
    icon: 'refresh-cw',
  },
  {
    id: 'b5',
    title: 'The Envelope Method',
    summary: 'A physical system for controlling cash spending.',
    body: 'Assign cash to labeled envelopes for each budget category. When the envelope is empty, stop spending in that category for the month. This tactile method makes overspending feel real and creates a physical connection to your money that digital payments don\'t provide.',
    category: 'budgeting',
    readMinutes: 2,
    icon: 'mail',
  },
  // Investing
  {
    id: 'i1',
    title: 'Start Investing Early',
    summary: 'Time in the market beats timing the market.',
    body: 'Thanks to compound interest, starting early is more powerful than investing larger amounts later. $200/month starting at 22 grows to more than $500/month starting at 32 by retirement — even with the same return rate. The best time to start was yesterday. The second best time is today.',
    category: 'investing',
    readMinutes: 3,
    icon: 'trending-up',
  },
  {
    id: 'i2',
    title: 'Index Funds Explained',
    summary: 'The investment Warren Buffett recommends for most people.',
    body: 'Index funds track a market index like the S&P 500, giving you instant diversification across hundreds of companies. They have low fees and historically outperform most actively managed funds. A simple three-fund portfolio (US stocks, international stocks, bonds) is all most people need.',
    category: 'investing',
    readMinutes: 4,
    icon: 'bar-chart-2',
  },
  {
    id: 'i3',
    title: 'The Power of Compound Interest',
    summary: 'Einstein reportedly called this the eighth wonder of the world.',
    body: 'Compound interest means earning returns on your returns. $1,000 at 8% annual return becomes $1,080 after year 1, then you earn 8% on $1,080 in year 2 — and so on. Over 30 years, that $1,000 becomes $10,062 without adding another dollar. The key: start early and don\'t withdraw.',
    category: 'investing',
    readMinutes: 3,
    icon: 'trending-up',
  },
  {
    id: 'i4',
    title: 'Emergency Fund First',
    summary: 'Don\'t invest until you have this foundation.',
    body: 'Before investing, build 3–6 months of expenses in a high-yield savings account. Without an emergency fund, an unexpected car repair or medical bill could force you to sell investments at a loss. Your emergency fund is your financial immune system — protect it.',
    category: 'investing',
    readMinutes: 2,
    icon: 'shield',
  },
  // Credit
  {
    id: 'c1',
    title: 'How Credit Scores Work',
    summary: 'The five factors that determine your financial reputation.',
    body: 'Your FICO score is made of: Payment History (35%) — never miss a payment. Credit Utilization (30%) — keep usage below 30% of your limit. Length of History (15%) — older accounts help. Credit Mix (10%) — diversity of account types. New Credit (10%) — limit hard inquiries. Focus most on the first two.',
    category: 'credit',
    readMinutes: 3,
    icon: 'award',
  },
  {
    id: 'c2',
    title: 'The Debt Avalanche Method',
    summary: 'Pay off debt in the mathematically optimal order.',
    body: 'List all debts by interest rate, highest first. Pay minimums on everything, then throw extra money at the highest-rate debt. Once it\'s paid off, roll that payment to the next highest. You pay less interest overall — often thousands less — compared to random debt payoff.',
    category: 'credit',
    readMinutes: 3,
    icon: 'trending-down',
  },
  {
    id: 'c3',
    title: 'The Debt Snowball Method',
    summary: 'Pay off your smallest debts first for quick wins.',
    body: 'List debts from smallest to largest balance. Pay minimums on all, then attack the smallest balance with extra money. The quick wins build momentum and motivation. While not mathematically optimal (that\'s the avalanche), many people find the psychological boost keeps them on track.',
    category: 'credit',
    readMinutes: 2,
    icon: 'circle',
  },
  {
    id: 'c4',
    title: 'Credit Utilization Tips',
    summary: 'Keep this number low to boost your score.',
    body: 'Credit utilization is the percentage of your available credit you\'re using. Keep it below 30% — ideally below 10%. Tip: ask for a credit limit increase without spending more (this lowers utilization). Tip: pay your balance before the statement closes, not just the due date.',
    category: 'credit',
    readMinutes: 2,
    icon: 'percent',
  },
  // Saving
  {
    id: 's1',
    title: 'High-Yield Savings Accounts',
    summary: 'Your emergency fund should be earning more than 0.01%.',
    body: 'Traditional bank savings accounts offer ~0.01% APY. High-yield savings accounts (HYSAs) at online banks offer 4–5%+ APY. On a $10,000 emergency fund, that\'s $400–500/year in free money versus $1. Shop for the best HYSA rate and move your savings today.',
    category: 'saving',
    readMinutes: 2,
    icon: 'database',
  },
  {
    id: 's2',
    title: 'The 24-Hour Rule',
    summary: 'Stop impulse purchases before they drain your savings.',
    body: 'Before any non-essential purchase over $50, wait 24 hours. Add it to a list and come back tomorrow. Most of the time, the urge fades. For larger purchases ($200+), wait a week. This simple rule can save thousands per year in impulse spending without requiring willpower in the moment.',
    category: 'saving',
    readMinutes: 2,
    icon: 'clock',
  },
  {
    id: 's3',
    title: 'Automate Your Savings',
    summary: 'What you don\'t see, you don\'t spend.',
    body: 'Set up automatic transfers from checking to savings the day after payday. Start with whatever you can — even $25 biweekly adds up to $650/year. Gradually increase by 1% every few months. Most people adjust to their take-home pay naturally; automation makes savings invisible and effortless.',
    category: 'saving',
    readMinutes: 2,
    icon: 'settings',
  },
  {
    id: 's4',
    title: 'Sinking Funds',
    summary: 'Save for big predictable expenses so they never surprise you.',
    body: 'A sinking fund is money set aside for a known future expense — car insurance, holiday gifts, annual subscriptions. Divide the total cost by months until due, then save that amount monthly. When the bill arrives, you have the money ready. This eliminates the "I can\'t afford it" moment for planned expenses.',
    category: 'saving',
    readMinutes: 3,
    icon: 'package',
  },
];

export const LEARN_CATEGORIES: { id: LearnCategory; label: string; color: string }[] = [
  { id: 'budgeting', label: 'Budgeting', color: '#06B6D4' },
  { id: 'investing', label: 'Investing', color: '#10B981' },
  { id: 'credit', label: 'Credit', color: '#F97316' },
  { id: 'saving', label: 'Saving', color: '#F59E0B' },
];
