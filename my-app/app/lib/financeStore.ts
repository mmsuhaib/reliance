import { 
  BankAccount, 
  ExpenseCategory, 
  IncomeCategory, 
  Transaction, 
  DailyFinanceSummary, 
  DailyAccountSummaryItem,
  AccountType,
  TransactionType 
} from '../types/finance';

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatLKR(amount: number): string {
  const num = isNaN(amount) ? 0 : amount;
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num).replace('LKR', 'Rs.');
}

// ----------------------------------------------------
// API Client Functions (Connected to MySQL Database via Prisma)
// ----------------------------------------------------

export async function fetchAccounts(): Promise<BankAccount[]> {
  const res = await fetch('/api/accounts', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch accounts from database');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to load accounts');
  
  return json.data.map((acc: any) => ({
    ...acc,
    type: (acc.type || '').toLowerCase() as AccountType,
    openingBalance: Number(acc.openingBalance) || 0,
    currentBalance: Number(acc.currentBalance) || 0,
  }));
}

export async function createAccount(accountData: Partial<BankAccount>): Promise<BankAccount> {
  const res = await fetch('/api/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(accountData),
  });
  if (!res.ok) throw new Error('Failed to create account');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to create account');
  
  const acc = json.data;
  return {
    ...acc,
    type: (acc.type || '').toLowerCase() as AccountType,
    openingBalance: Number(acc.openingBalance) || 0,
    currentBalance: Number(acc.currentBalance) || 0,
  };
}

export async function updateAccount(id: string, accountData: Partial<BankAccount>): Promise<BankAccount> {
  const res = await fetch(`/api/accounts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(accountData),
  });
  if (!res.ok) throw new Error('Failed to update account');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to update account');
  
  const acc = json.data;
  return {
    ...acc,
    type: (acc.type || '').toLowerCase() as AccountType,
    openingBalance: Number(acc.openingBalance) || 0,
    currentBalance: Number(acc.currentBalance) || 0,
  };
}

export async function deleteAccount(id: string): Promise<void> {
  const res = await fetch(`/api/accounts/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete account');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to delete account');
}

export async function fetchCategories(): Promise<{ expenseCategories: ExpenseCategory[]; incomeCategories: IncomeCategory[] }> {
  const res = await fetch('/api/categories', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch categories from database');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to load categories');
  return json.data;
}

export async function createCategory(data: {
  type: 'income' | 'expense';
  name: string;
  color?: string;
  icon?: string;
  description?: string;
}): Promise<any> {
  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create category');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to create category');
  return json.data;
}

export async function updateCategory(
  id: string,
  data: { type: 'income' | 'expense'; name: string; color?: string; icon?: string; description?: string }
): Promise<any> {
  const res = await fetch(`/api/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update category');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to update category');
  return json.data;
}

export async function deleteCategory(id: string, type: 'income' | 'expense'): Promise<void> {
  const res = await fetch(`/api/categories/${id}?type=${type}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete category');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to delete category');
}

export async function fetchTransactions(date?: string): Promise<Transaction[]> {
  const url = date ? `/api/transactions?date=${date}` : '/api/transactions';
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch transactions from database');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to load transactions');
  
  return json.data.map((tx: any) => ({
    ...tx,
    type: (tx.type || '').toLowerCase() as TransactionType,
    amount: Number(tx.amount) || 0,
    date: typeof tx.date === 'string' ? tx.date : new Date(tx.date).toISOString(),
    createdAt: typeof tx.createdAt === 'string' ? tx.createdAt : new Date(tx.createdAt).toISOString(),
  }));
}

export async function createTransaction(txData: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
  const res = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(txData),
  });
  if (!res.ok) throw new Error('Failed to create transaction');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to create transaction');
  
  const tx = json.data;
  return {
    ...tx,
    type: (tx.type || '').toLowerCase() as TransactionType,
    amount: Number(tx.amount) || 0,
    date: typeof tx.date === 'string' ? tx.date : new Date(tx.date).toISOString(),
    createdAt: typeof tx.createdAt === 'string' ? tx.createdAt : new Date(tx.createdAt).toISOString(),
  };
}

export async function updateTransaction(id: string, txData: Partial<Transaction>): Promise<Transaction> {
  const res = await fetch(`/api/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(txData),
  });
  if (!res.ok) throw new Error('Failed to update transaction');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to update transaction');
  
  const tx = json.data;
  return {
    ...tx,
    type: (tx.type || '').toLowerCase() as TransactionType,
    amount: Number(tx.amount) || 0,
    date: typeof tx.date === 'string' ? tx.date : new Date(tx.date).toISOString(),
    createdAt: typeof tx.createdAt === 'string' ? tx.createdAt : new Date(tx.createdAt).toISOString(),
  };
}

export async function deleteTransaction(id: string): Promise<void> {
  const res = await fetch(`/api/transactions/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete transaction');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to delete transaction');
}

export async function resetDatabase(): Promise<void> {
  const res = await fetch('/api/reset', {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset database');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to reset database');
}

// ----------------------------------------------------
// Pure Balance & Daily Summary Calculations
// ----------------------------------------------------

export function recalculateAccountBalances(accounts: BankAccount[], transactions: Transaction[]): BankAccount[] {
  return accounts.map(acc => {
    let balance = Number(acc.openingBalance) || 0;

    for (const tx of transactions) {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') {
        if (tx.accountId === acc.id) {
          balance += amt;
        }
      } else if (tx.type === 'expense') {
        if (tx.accountId === acc.id) {
          balance -= amt;
        }
      } else if (tx.type === 'transfer') {
        if (tx.accountId === acc.id) {
          balance -= amt;
        }
        if (tx.toAccountId === acc.id) {
          balance += amt;
        }
      }
    }

    return {
      ...acc,
      currentBalance: balance,
    };
  });
}

export function calculateDailySummary(
  targetDate: string,
  accounts: BankAccount[],
  transactions: Transaction[]
): DailyFinanceSummary {
  const accountMap = new Map<string, BankAccount>();
  accounts.forEach(a => accountMap.set(a.id, a));

  // 1. Partition transactions into Prior (< targetDate) and Current Day (=== targetDate)
  const dayTxs: Transaction[] = [];
  const priorTxs: Transaction[] = [];

  for (const tx of transactions) {
    const txDateStr = typeof tx.date === 'string' ? tx.date.split('T')[0] : '';
    if (txDateStr === targetDate) {
      dayTxs.push(tx);
    } else if (txDateStr < targetDate) {
      priorTxs.push(tx);
    }
  }

  // 2. Compute opening balances at the start of targetDate for each account
  // Opening(A) = initialOpening + sum(prior inflows) - sum(prior outflows)
  const accountOpeningMap = new Map<string, number>();
  accounts.forEach(acc => {
    accountOpeningMap.set(acc.id, Number(acc.openingBalance) || 0);
  });

  for (const tx of priorTxs) {
    const amt = Number(tx.amount) || 0;
    if (tx.type === 'income') {
      const current = accountOpeningMap.get(tx.accountId) || 0;
      accountOpeningMap.set(tx.accountId, current + amt);
    } else if (tx.type === 'expense') {
      const current = accountOpeningMap.get(tx.accountId) || 0;
      accountOpeningMap.set(tx.accountId, current - amt);
    } else if (tx.type === 'transfer') {
      const srcCurrent = accountOpeningMap.get(tx.accountId) || 0;
      accountOpeningMap.set(tx.accountId, srcCurrent - amt);
      if (tx.toAccountId) {
        const destCurrent = accountOpeningMap.get(tx.toAccountId) || 0;
        accountOpeningMap.set(tx.toAccountId, destCurrent + amt);
      }
    }
  }

  // 3. Compute day-level movements (Receipts, Payments, P&L, and Transfers)
  let totalIncome = 0;
  let cashIncome = 0;
  let bankIncome = 0;

  let totalExpenses = 0;
  let cashExpenses = 0;
  let bankExpenses = 0;

  let totalTransfers = 0;
  let cashToBankTransfers = 0;
  let bankToCashTransfers = 0;
  let bankToBankTransfers = 0;

  const accountDayFlowMap = new Map<string, { received: number; paid: number }>();
  accounts.forEach(acc => {
    accountDayFlowMap.set(acc.id, { received: 0, paid: 0 });
  });

  for (const tx of dayTxs) {
    const amt = Number(tx.amount) || 0;
    const sourceAcc = accountMap.get(tx.accountId);
    const destAcc = tx.toAccountId ? accountMap.get(tx.toAccountId) : null;
    const isSourceCash = sourceAcc?.type === 'cash';

    if (tx.type === 'income') {
      totalIncome += amt;
      if (isSourceCash) {
        cashIncome += amt;
      } else {
        bankIncome += amt;
      }
      const entry = accountDayFlowMap.get(tx.accountId);
      if (entry) entry.received += amt;
    } else if (tx.type === 'expense') {
      totalExpenses += amt;
      if (isSourceCash) {
        cashExpenses += amt;
      } else {
        bankExpenses += amt;
      }
      const entry = accountDayFlowMap.get(tx.accountId);
      if (entry) entry.paid += amt;
    } else if (tx.type === 'transfer') {
      totalTransfers += amt;

      if (sourceAcc?.type === 'cash' && destAcc?.type === 'bank') {
        cashToBankTransfers += amt;
      } else if (sourceAcc?.type === 'bank' && destAcc?.type === 'cash') {
        bankToCashTransfers += amt;
      } else if (sourceAcc?.type === 'bank' && destAcc?.type === 'bank') {
        bankToBankTransfers += amt;
      }

      const srcEntry = accountDayFlowMap.get(tx.accountId);
      if (srcEntry) srcEntry.paid += amt;

      if (tx.toAccountId) {
        const destEntry = accountDayFlowMap.get(tx.toAccountId);
        if (destEntry) destEntry.received += amt;
      }
    }
  }

  // 4. Build per-account audited summaries
  const accountSummaries: DailyAccountSummaryItem[] = accounts.map(acc => {
    const openingBal = accountOpeningMap.get(acc.id) || 0;
    const flow = accountDayFlowMap.get(acc.id) || { received: 0, paid: 0 };
    const closingBal = openingBal + flow.received - flow.paid;
    const netChange = flow.received - flow.paid;

    return {
      accountId: acc.id,
      accountName: acc.name,
      accountType: acc.type,
      openingBalance: openingBal,
      moneyReceived: flow.received,
      moneyPaid: flow.paid,
      closingBalance: closingBal,
      netChange,
    };
  });

  // 5. Aggregate Opening and Closing Balances
  let totalCashOpening = 0;
  let totalBankOpening = 0;
  let totalCashClosing = 0;
  let totalBankClosing = 0;

  for (const item of accountSummaries) {
    if (item.accountType === 'cash') {
      totalCashOpening += item.openingBalance;
      totalCashClosing += item.closingBalance;
    } else {
      totalBankOpening += item.openingBalance;
      totalBankClosing += item.closingBalance;
    }
  }

  const netOperatingProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netOperatingProfit / totalIncome) * 100 : 0;
  const totalOpeningBalance = totalCashOpening + totalBankOpening;
  const totalLiquidAssets = totalCashClosing + totalBankClosing;

  return {
    date: targetDate,
    totalIncome,
    cashIncome,
    bankIncome,
    totalExpenses,
    cashExpenses,
    bankExpenses,
    netOperatingProfit,
    profitMargin,
    totalTransfers,
    cashToBankTransfers,
    bankToCashTransfers,
    bankToBankTransfers,
    totalCashBalance: totalCashClosing,
    totalBankBalance: totalBankClosing,
    totalLiquidAssets,
    totalCashOpening,
    totalBankOpening,
    totalOpeningBalance,
    accountSummaries,
  };
}
