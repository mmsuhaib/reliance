export type AccountType = 'cash' | 'bank';

export interface BankAccount {
  id: string;
  name: string;
  accountNumber?: string;
  bankName?: string;
  branch?: string;
  type: AccountType;
  openingBalance: number;
  currentBalance: number;
  color?: string;
  isDefault?: boolean;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isSystem?: boolean;
  description?: string;
}

export interface IncomeCategory {
  id: string;
  name: string;
  color: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO date string YYYY-MM-DD or YYYY-MM-DDTHH:mm
  type: TransactionType;
  amount: number;
  accountId: string; // Source / Primary Account
  toAccountId?: string; // Destination Account (for transfers)
  categoryId?: string;
  categoryName?: string;
  description: string;
  notes?: string;
  referenceNumber?: string;
  createdAt: string;
}

export interface DailyAccountSummaryItem {
  accountId: string;
  accountName: string;
  accountType: AccountType;
  openingBalance: number;
  moneyReceived: number; // All Inflows on this day (Income + Incoming Transfers)
  moneyPaid: number; // All Outflows on this day (Expenses + Outgoing Transfers)
  closingBalance: number; // openingBalance + moneyReceived - moneyPaid
  netChange: number; // moneyReceived - moneyPaid
}

export interface DailyFinanceSummary {
  date: string;
  // P&L / Operating Performance
  totalIncome: number; // Total revenue earned (Cash + Bank)
  cashIncome: number; // Revenue received in Cash drawer
  bankIncome: number; // Revenue received in Bank accounts
  totalExpenses: number; // Total operating expenses (Cash + Bank)
  cashExpenses: number; // Expenses paid from Cash drawer
  bankExpenses: number; // Expenses paid from Bank accounts
  netOperatingProfit: number; // totalIncome - totalExpenses (Net Day P&L)
  profitMargin: number; // (netOperatingProfit / totalIncome) * 100
  
  // Funds Relocation / Contra Transfers
  totalTransfers: number; // Total volume transferred
  cashToBankTransfers: number; // Cash deposited to bank
  bankToCashTransfers: number; // Cash withdrawn from bank
  bankToBankTransfers: number; // Inter-bank transfers
  
  // Point-in-Time Liquid Assets (Closing Balances as of this date)
  totalCashBalance: number; // Total cash drawer closing balance
  totalBankBalance: number; // Total bank accounts closing balance
  totalLiquidAssets: number; // totalCashBalance + totalBankBalance
  
  // Opening Liquid Assets (at start of this date)
  totalCashOpening: number;
  totalBankOpening: number;
  totalOpeningBalance: number;
  
  // Account Ledger Breakdown
  accountSummaries: DailyAccountSummaryItem[];
}
