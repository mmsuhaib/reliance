'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardCards } from './components/DashboardCards';
import { DailyAccountSummary } from './components/DailyAccountSummary';
import { TransactionHistory } from './components/TransactionHistory';
import { AddIncomeModal } from './components/AddIncomeModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { TransferModal } from './components/TransferModal';
import { ExpenseCategoriesModal } from './components/ExpenseCategoriesModal';
import { BankAccountsModal } from './components/BankAccountsModal';
import { StatementModal } from './components/StatementModal';
import { 
  BankAccount, 
  ExpenseCategory, 
  IncomeCategory, 
  Transaction, 
  DailyFinanceSummary 
} from './types/finance';
import { 
  fetchAccounts,
  fetchCategories,
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createAccount,
  updateAccount,
  deleteAccount,
  createCategory,
  updateCategory,
  deleteCategory,
  resetDatabase,
  calculateDailySummary,
  getTodayString
} from './lib/financeStore';
import { 
  TrendingUp, 
  Calculator, 
  History, 
  PlusCircle, 
  MinusCircle, 
  ArrowLeftRight, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function DailyAccountsPage() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeModal, setActiveModal] = useState<'income' | 'expense' | 'transfer' | 'categories' | 'accounts' | 'statement' | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'summary' | 'history'>('overview');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load all live data from MySQL via Prisma endpoints
  const loadAllData = useCallback(async () => {
    try {
      setIsSyncing(true);
      setErrorMessage(null);

      const [accs, cats, txs] = await Promise.all([
        fetchAccounts(),
        fetchCategories(),
        fetchTransactions(),
      ]);

      setAccounts(accs);
      setCategories(cats.expenseCategories);
      setIncomeSources(cats.incomeCategories);
      setTransactions(txs);
      setIsLoaded(true);
    } catch (err: any) {
      console.error('Error fetching database records:', err);
      setErrorMessage(err.message || 'Failed to connect to MySQL database.');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Recalculate summary dynamically whenever date, accounts, or transactions change
  const dailySummary: DailyFinanceSummary = React.useMemo(() => {
    if (!isLoaded) {
      return {
        date: selectedDate,
        totalIncome: 0,
        cashIncome: 0,
        bankIncome: 0,
        totalExpenses: 0,
        cashExpenses: 0,
        bankExpenses: 0,
        netOperatingProfit: 0,
        profitMargin: 0,
        totalTransfers: 0,
        cashToBankTransfers: 0,
        bankToCashTransfers: 0,
        bankToBankTransfers: 0,
        totalCashBalance: 0,
        totalBankBalance: 0,
        totalLiquidAssets: 0,
        totalCashOpening: 0,
        totalBankOpening: 0,
        totalOpeningBalance: 0,
        accountSummaries: [],
      };
    }
    return calculateDailySummary(selectedDate, accounts, transactions);
  }, [selectedDate, accounts, transactions, isLoaded]);

  // Handlers for Transactions
  const handleAddTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      setIsSyncing(true);
      await createTransaction(txData);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to save transaction');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEditTransaction = async (updatedTx: Transaction) => {
    try {
      setIsSyncing(true);
      await updateTransaction(updatedTx.id, updatedTx);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to update transaction');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      setIsSyncing(true);
      await deleteTransaction(id);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete transaction');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handlers for Accounts
  const handleAddAccount = async (accountData: Partial<BankAccount>) => {
    await createAccount(accountData);
    await loadAllData();
  };

  const handleUpdateAccount = async (id: string, accountData: Partial<BankAccount>) => {
    await updateAccount(id, accountData);
    await loadAllData();
  };

  const handleDeleteAccount = async (id: string) => {
    await deleteAccount(id);
    await loadAllData();
  };

  // Handlers for Categories
  const handleAddCategory = async (data: { name: string; color: string; description?: string }) => {
    await createCategory({ type: 'expense', ...data });
    await loadAllData();
  };

  const handleUpdateCategory = async (id: string, data: { name: string; color: string }) => {
    await updateCategory(id, { type: 'expense', ...data });
    await loadAllData();
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id, 'expense');
    await loadAllData();
  };

  const handleResetData = async () => {
    try {
      setIsSyncing(true);
      await resetDatabase();
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to reset database');
    } finally {
      setIsSyncing(false);
    }
  };

  const totalCash = dailySummary.totalCashBalance;
  const totalBank = dailySummary.totalBankBalance;

  if (!isLoaded && !errorMessage) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-300">Connecting to MySQL Database & Loading Ledgers...</p>
        </div>
      </div>
    );
  }

  if (errorMessage && !isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full bg-slate-800 p-6 rounded-3xl border border-rose-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold">Database Connection Error</h2>
          <p className="text-xs text-slate-300">{errorMessage}</p>
          <button
            onClick={loadAllData}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans selection:bg-rose-500 selection:text-white pb-16">
      {/* Top Navbar */}
      <Navbar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onOpenModal={(modal) => setActiveModal(modal)}
        onResetData={handleResetData}
        totalCash={totalCash}
        totalBank={totalBank}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-4 sm:space-y-6 flex-1">
        
        {/* Navigation View Tabs & Quick Shortcuts */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          {/* Scrollable Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto scrollbar-none w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'summary'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Summary</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'history'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History ({transactions.length})</span>
            </button>
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2">
            {isSyncing && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-500 shadow-2xs shrink-0">
                <RefreshCw className="w-3 h-3 animate-spin text-rose-500" />
                <span className="hidden xs:inline">Syncing...</span>
              </div>
            )}
            <div className="grid grid-cols-3 sm:flex items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setActiveModal('income')}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Add Income"
              >
                <PlusCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>+ Income</span>
              </button>
              <button
                onClick={() => setActiveModal('expense')}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Add Expense"
              >
                <MinusCircle className="w-3 h-3 text-rose-600 shrink-0" />
                <span>− Expense</span>
              </button>
              <button
                onClick={() => setActiveModal('transfer')}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Transfer Between Accounts"
              >
                <ArrowLeftRight className="w-3 h-3 text-indigo-600 shrink-0" />
                <span>⇄ Transfer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Overview (Dashboard Cards + Quick Summary + Recent History) */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. Dashboard Cards */}
            <DashboardCards
              summary={dailySummary}
              accounts={accounts}
              selectedDate={selectedDate}
              onOpenModal={(modal) => setActiveModal(modal)}
            />

            {/* 2. Daily Account Reconciliation Summary */}
            <DailyAccountSummary
              summary={dailySummary}
              selectedDate={selectedDate}
              onOpenModal={(modal) => setActiveModal(modal)}
            />

            {/* 3. Transaction History */}
            <TransactionHistory
              transactions={transactions}
              accounts={accounts}
              categories={categories}
              incomeSources={incomeSources}
              onDeleteTransaction={handleDeleteTransaction}
              onEditTransaction={handleEditTransaction}
              selectedDate={selectedDate}
              onOpenStatement={() => setActiveModal('statement')}
            />
          </div>
        )}

        {/* Tab 2: Daily Account Summary Dedicated View */}
        {activeTab === 'summary' && (
          <div className="space-y-6 animate-fadeIn">
            <DailyAccountSummary
              summary={dailySummary}
              selectedDate={selectedDate}
              onOpenModal={(modal) => setActiveModal(modal)}
            />
          </div>
        )}

        {/* Tab 3: Transaction History Dedicated View */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fadeIn">
            <TransactionHistory
              transactions={transactions}
              accounts={accounts}
              categories={categories}
              incomeSources={incomeSources}
              onDeleteTransaction={handleDeleteTransaction}
              onEditTransaction={handleEditTransaction}
              selectedDate={selectedDate}
              onOpenStatement={() => setActiveModal('statement')}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <AddIncomeModal
        isOpen={activeModal === 'income'}
        onClose={() => setActiveModal(null)}
        onAddIncome={handleAddTransaction}
        accounts={accounts}
        incomeSources={incomeSources}
        defaultDate={selectedDate}
      />

      <AddExpenseModal
        isOpen={activeModal === 'expense'}
        onClose={() => setActiveModal(null)}
        onAddExpense={handleAddTransaction}
        accounts={accounts}
        categories={categories}
        defaultDate={selectedDate}
        onManageCategories={() => setActiveModal('categories')}
      />

      <TransferModal
        isOpen={activeModal === 'transfer'}
        onClose={() => setActiveModal(null)}
        onAddTransfer={handleAddTransaction}
        accounts={accounts}
        defaultDate={selectedDate}
        onAddAccount={handleAddAccount}
        onManageAccounts={() => setActiveModal('accounts')}
      />

      <ExpenseCategoriesModal
        isOpen={activeModal === 'categories'}
        onClose={() => setActiveModal(null)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <BankAccountsModal
        isOpen={activeModal === 'accounts'}
        onClose={() => setActiveModal(null)}
        accounts={accounts}
        onAddAccount={handleAddAccount}
        onUpdateAccount={handleUpdateAccount}
        onDeleteAccount={handleDeleteAccount}
      />

      {/* Full Statement Modal */}
      {activeModal === 'statement' && (
        <StatementModal
          summary={dailySummary}
          transactions={transactions}
          accounts={accounts}
          categories={categories}
          incomeSources={incomeSources}
          selectedDate={selectedDate}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
