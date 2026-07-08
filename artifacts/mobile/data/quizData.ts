export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'budgeting' | 'investing' | 'credit' | 'saving' | 'basics';
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What does the 50/30/20 rule recommend for savings?',
    options: ['50% of income', '30% of income', '20% of income', '10% of income'],
    correctIndex: 2,
    explanation: 'The 50/30/20 rule allocates 50% to needs, 30% to wants, and 20% to savings and debt repayment.',
    category: 'budgeting',
  },
  {
    id: 'q2',
    question: 'What is compound interest?',
    options: [
      'Interest on the principal only',
      'Interest on both principal and accumulated interest',
      'A fixed monthly fee',
      'Interest charged on late payments',
    ],
    correctIndex: 1,
    explanation: 'Compound interest is calculated on both the initial principal and the interest previously earned, making your money grow faster over time.',
    category: 'investing',
  },
  {
    id: 'q3',
    question: 'What is generally considered a "good" credit score?',
    options: ['300–500', '500–580', '580–670', '700 and above'],
    correctIndex: 3,
    explanation: 'A credit score of 700 or above is generally considered good. Scores above 750 are considered excellent.',
    category: 'credit',
  },
  {
    id: 'q4',
    question: 'How many months of expenses should an emergency fund typically cover?',
    options: ['1 month', '2 months', '3–6 months', '12+ months'],
    correctIndex: 2,
    explanation: 'Financial experts recommend keeping 3–6 months of essential expenses in an easily accessible emergency fund.',
    category: 'saving',
  },
  {
    id: 'q5',
    question: 'What does APR stand for?',
    options: ['Annual Payment Rate', 'Annual Percentage Rate', 'Applied Principal Rate', 'Average Purchase Rate'],
    correctIndex: 1,
    explanation: 'APR (Annual Percentage Rate) is the yearly cost of borrowing money, including fees and interest, expressed as a percentage.',
    category: 'credit',
  },
  {
    id: 'q6',
    question: 'Which type of account typically offers the highest interest rate?',
    options: ['Checking account', 'Basic savings account', 'High-yield savings account', 'Money market account'],
    correctIndex: 2,
    explanation: 'High-yield savings accounts (HYSAs) typically offer significantly higher interest rates than standard savings or checking accounts.',
    category: 'saving',
  },
  {
    id: 'q7',
    question: 'What is a stock?',
    options: [
      'A loan you give to a company',
      'A share of ownership in a company',
      'A government-issued bond',
      'A type of savings account',
    ],
    correctIndex: 1,
    explanation: 'A stock represents a share of ownership in a company. When you buy stock, you become a partial owner of that company.',
    category: 'investing',
  },
  {
    id: 'q8',
    question: 'What is dollar-cost averaging?',
    options: [
      'Converting currency at the best rate',
      'Splitting bills equally with friends',
      'Investing a fixed amount regularly regardless of price',
      'Averaging the cost of groceries',
    ],
    correctIndex: 2,
    explanation: 'Dollar-cost averaging means investing a fixed amount at regular intervals. This strategy reduces the impact of market volatility.',
    category: 'investing',
  },
  {
    id: 'q9',
    question: 'What is inflation?',
    options: [
      'The rise in value of investments',
      'The general increase in prices over time',
      'A type of tax on income',
      'The interest rate set by banks',
    ],
    correctIndex: 1,
    explanation: 'Inflation is the gradual increase in the price of goods and services over time, which reduces the purchasing power of money.',
    category: 'basics',
  },
  {
    id: 'q10',
    question: 'What is the difference between gross and net income?',
    options: [
      'There is no difference',
      'Gross is after taxes; net is before taxes',
      'Gross is before taxes; net is after taxes and deductions',
      'Net is your total savings',
    ],
    correctIndex: 2,
    explanation: 'Gross income is your total earnings before any deductions. Net income (take-home pay) is what you actually receive after taxes and other deductions.',
    category: 'basics',
  },
  {
    id: 'q11',
    question: 'What is a 401(k)?',
    options: [
      'A type of credit card',
      'A government savings bond',
      'An employer-sponsored retirement savings plan',
      'A short-term investment account',
    ],
    correctIndex: 2,
    explanation: 'A 401(k) is a tax-advantaged retirement savings account offered by employers. Many employers match a portion of your contributions — that\'s free money!',
    category: 'basics',
  },
  {
    id: 'q12',
    question: 'What does diversification mean in investing?',
    options: [
      'Putting all money into one great stock',
      'Spreading investments across different assets to reduce risk',
      'Only investing in government bonds',
      'Changing investments every month',
    ],
    correctIndex: 1,
    explanation: 'Diversification spreads your investments across different asset types, industries, and geographies to reduce the impact of any single investment performing poorly.',
    category: 'investing',
  },
  {
    id: 'q13',
    question: 'What is the "Rule of 72"?',
    options: [
      'Save 72% of your income',
      'Pay off debt in 72 months',
      'Divide 72 by the interest rate to estimate years to double money',
      'Keep 72 hours of expenses in cash',
    ],
    correctIndex: 2,
    explanation: 'The Rule of 72 is a quick formula: divide 72 by your annual interest rate to estimate how many years it takes for an investment to double.',
    category: 'investing',
  },
  {
    id: 'q14',
    question: 'Which has the highest-interest debt to pay off first?',
    options: ['Student loans', 'Credit card debt', 'Mortgage', 'Car loan'],
    correctIndex: 1,
    explanation: 'Credit card debt typically carries the highest interest rates (often 15–30%), making it the most expensive debt to carry. Pay it off first.',
    category: 'credit',
  },
  {
    id: 'q15',
    question: 'What is a mutual fund?',
    options: [
      'A bank account shared by family members',
      'A pooled investment managed by professionals',
      'A government financial program',
      'A type of insurance policy',
    ],
    correctIndex: 1,
    explanation: 'A mutual fund pools money from many investors to purchase a diversified portfolio of stocks, bonds, or other securities, managed by professional fund managers.',
    category: 'investing',
  },
];
