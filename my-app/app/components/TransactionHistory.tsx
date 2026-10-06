'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  Calendar,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Transaction, BankAccount, ExpenseCategory, IncomeCategory } from '../types/finance';
import { formatLKR } from '../lib/financeStore';

interface TransactionHistoryProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  categories: ExpenseCategory[];
  incomeSources: IncomeCategory[];
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  selectedDate: string;
  onOpenStatement?: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  accounts,
  categories,
  incomeSources,
  onDeleteTransaction,
  onEditTransaction,
  selectedDate,
  onOpenStatement,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [dateFilterMode, setDateFilterMode] = useState<'selected' | 'all' | 'custom'>('selected');
  const [customStartDate, setCustomStartDate] = useState<string>(selectedDate);
  const [customEndDate, setCustomEndDate] = useState<string>(selectedDate);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Helper map for accounts
  const accountMap = useMemo(() => {
    const map = new Map<string, BankAccount>();
    accounts.forEach(acc => map.set(acc.id, acc));
    return map;
  }, [accounts]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // 1. Date Filter
      if (dateFilterMode === 'selected') {
        if (!tx.date.startsWith(selectedDate)) return false;
      } else if (dateFilterMode === 'custom') {
        const txDatePart = tx.date.split('T')[0];
        if (customStartDate && txDatePart < customStartDate) return false;
        if (customEndDate && txDatePart > customEndDate) return false;
      }

      // 2. Type Filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) {
        return false;
      }

      // 3. Account Filter
      if (accountFilter !== 'all') {
        if (tx.accountId !== accountFilter && tx.toAccountId !== accountFilter) {
          return false;
        }
      }

      // 4. Search Filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const desc = (tx.description || '').toLowerCase();
        const cat = (tx.categoryName || '').toLowerCase();
        const ref = (tx.referenceNumber || '').toLowerCase();
        const notes = (tx.notes || '').toLowerCase();
        const sourceAcc = accountMap.get(tx.accountId)?.name.toLowerCase() || '';
        const destAcc = tx.toAccountId ? accountMap.get(tx.toAccountId)?.name.toLowerCase() || '' : '';

        const match = desc.includes(query) ||
          cat.includes(query) ||
          ref.includes(query) ||
          notes.includes(query) ||
          sourceAcc.includes(query) ||
          destAcc.includes(query);

        if (!match) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedDate, dateFilterMode, customStartDate, customEndDate, typeFilter, accountFilter, searchTerm, accountMap]);

  // Filtered Totals calculation
  const filteredTotals = useMemo(() => {
    let incomeTotal = 0;
    let incomeCount = 0;
    let expenseTotal = 0;
    let expenseCount = 0;
    let transferTotal = 0;
    let transferCount = 0;

    filteredTransactions.forEach(tx => {
      if (tx.type === 'income') {
        incomeTotal += tx.amount;
        incomeCount++;
      } else if (tx.type === 'expense') {
        expenseTotal += tx.amount;
        expenseCount++;
      } else if (tx.type === 'transfer') {
        transferTotal += tx.amount;
        transferCount++;
      }
    });

    const netTotal = incomeTotal - expenseTotal;
    return {
      incomeTotal,
      incomeCount,
      expenseTotal,
      expenseCount,
      transferTotal,
      transferCount,
      netTotal,
    };
  }, [filteredTransactions]);

  // Export CSV with full totals summary
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to export.');
      return;
    }

    const headers = ['ID', 'Date', 'Type', 'Amount (LKR)', 'Account', 'To Account', 'Category', 'Description', 'Ref #', 'Notes'];
    const rows = filteredTransactions.map(tx => [
      `"${tx.id}"`,
      `"${tx.date}"`,
      `"${tx.type}"`,
      tx.amount,
      `"${accountMap.get(tx.accountId)?.name || tx.accountId}"`,
      `"${tx.toAccountId ? accountMap.get(tx.toAccountId)?.name || tx.toAccountId : ''}"`,
      `"${tx.categoryName || ''}"`,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
      `"${tx.referenceNumber || ''}"`,
      `"${(tx.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvLines = [headers.join(','), ...rows.map(e => e.join(','))];
    csvLines.push('');
    csvLines.push('"SUMMARY FOR FILTERED AUDIT LEDGER"');
    csvLines.push(`"Total Inflow / Income (+)",${filteredTotals.incomeTotal},"${filteredTotals.incomeCount} records"`);
    csvLines.push(`"Total Outflow / Expenses (-)",${filteredTotals.expenseTotal},"${filteredTotals.expenseCount} records"`);
    csvLines.push(`"Total Transfers Volume",${filteredTotals.transferTotal},"${filteredTotals.transferCount} transfers"`);
    csvLines.push(`"Net Cash & Bank Flow",${filteredTotals.netTotal}`);

    const csvContent = 'data:text/csv;charset=utf-8,' + csvLines.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reliance_Furniture_Transactions_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeBadge = (type: Transaction['type']) => {
    switch (type) {
      case 'income':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
            Income
          </span>
        );
      case 'expense':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <ArrowUpRight className="w-3 h-3 text-rose-600" />
            Expense
          </span>
        );
      case 'transfer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <ArrowLeftRight className="w-3 h-3 text-indigo-600" />
            Transfer
          </span>
        );
      default:
        return null;
    }
  };

  const getAmountDisplay = (tx: Transaction) => {
    if (tx.type === 'income') {
      return (
        <span className="font-mono font-bold text-emerald-600 text-sm">
          +{formatLKR(tx.amount)}
        </span>
      );
    }
    if (tx.type === 'expense') {
      return (
        <span className="font-mono font-bold text-rose-600 text-sm">
          −{formatLKR(tx.amount)}
        </span>
      );
    }
    if (tx.type === 'transfer') {
      return (
        <span className="font-mono font-bold text-indigo-600 text-sm">
          ⇄ {formatLKR(tx.amount)}
        </span>
      );
    }
    return <span className="font-mono font-bold text-slate-800 text-sm">{formatLKR(tx.amount)}</span>;
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
      {/* Header with Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            Transaction History & Audit Ledger
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {filteredTransactions.length} Record{filteredTransactions.length === 1 ? '' : 's'}
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Search, filter by date/account/category, edit, delete, or export daily transaction entries
          </p>
        </div>

        {/* Action bar (Statement & Export CSV) */}
        <div className="flex items-center gap-2">
          {onOpenStatement && (
            <button
              onClick={onOpenStatement}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              title="View & Print Full Financial Statement"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
              <span>Full Statement</span>
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-300/80 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search description, notes, ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium cursor-pointer"
          >
            <option value="all">All Transaction Types</option>
            <option value="income">🟢 Income Inflow</option>
            <option value="expense">🔴 Expense Outflow</option>
            <option value="transfer">🟣 Cash-Bank Transfer</option>
          </select>
        </div>

        {/* Account Filter */}
        <div>
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium cursor-pointer"
          >
            <option value="all">All Accounts</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.type.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Date Scope Filter */}
        <div className="flex items-center gap-1.5">
          <select
            value={dateFilterMode}
            onChange={(e) => setDateFilterMode(e.target.value as any)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium cursor-pointer"
          >
            <option value="selected">Selected Date ({selectedDate})</option>
            <option value="all">All Dates History</option>
            <option value="custom">Custom Date Range</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range Bar if selected */}
      {dateFilterMode === 'custom' && (
        <div className="flex items-center gap-3 bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs">
          <span className="font-semibold text-amber-900">Custom Date Range:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>
      )}

      {/* Total Summary Metric Bar for Filtered Records */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-xs">
        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
          <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold uppercase">
            <span>Total Inflow (+)</span>
            <span className="text-[10px] font-normal text-slate-400">({filteredTotals.incomeCount})</span>
          </div>
          <p className="text-base sm:text-lg font-black font-mono text-emerald-400 mt-1">
            +{formatLKR(filteredTotals.incomeTotal)}
          </p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
          <div className="flex items-center justify-between text-[11px] text-rose-400 font-bold uppercase">
            <span>Total Outflow (−)</span>
            <span className="text-[10px] font-normal text-slate-400">({filteredTotals.expenseCount})</span>
          </div>
          <p className="text-base sm:text-lg font-black font-mono text-rose-400 mt-1">
            −{formatLKR(filteredTotals.expenseTotal)}
          </p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
          <div className="flex items-center justify-between text-[11px] text-indigo-300 font-bold uppercase">
            <span>Transfers (⇄)</span>
            <span className="text-[10px] font-normal text-slate-400">({filteredTotals.transferCount})</span>
          </div>
          <p className="text-base sm:text-lg font-black font-mono text-indigo-300 mt-1">
            {formatLKR(filteredTotals.transferTotal)}
          </p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
          <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold uppercase">
            <span>Net Flow</span>
            <span className="text-[10px] font-normal text-slate-400">({filteredTransactions.length} txs)</span>
          </div>
          <p className={`text-base sm:text-lg font-black font-mono mt-1 ${filteredTotals.netTotal >= 0 ? 'text-amber-300' : 'text-rose-400'}`}>
            {filteredTotals.netTotal >= 0 ? `+${formatLKR(filteredTotals.netTotal)}` : formatLKR(filteredTotals.netTotal)}
          </p>
        </div>
      </div>

      {/* Mobile Transaction Card Feed (< md) */}
      <div className="block md:hidden space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-8 text-center text-slate-400 border border-slate-200/60">
            <div className="flex flex-col items-center justify-center gap-2">
              <Calendar className="w-8 h-8 text-slate-300" />
              <p className="font-semibold text-sm text-slate-700">No transactions found</p>
              <p className="text-xs text-slate-400">Try changing your filters or record an entry</p>
            </div>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const sourceAcc = accountMap.get(tx.accountId);
            const destAcc = tx.toAccountId ? accountMap.get(tx.toAccountId) : null;
            const formattedTime = tx.date.includes('T') ? tx.date.split('T')[1].slice(0, 5) : '';
            const formattedDate = tx.date.split('T')[0];

            return (
              <div
                key={tx.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-2.5 active:bg-slate-50/60 transition-colors"
              >
                {/* Top Row: Date, Badge, and Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getTypeBadge(tx.type)}
                    <span className="text-xs text-slate-500 font-mono">
                      {formattedDate} {formattedTime && `• ${formattedTime}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingTx(tx)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                      title="Edit Transaction"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete this transaction "${tx.description}" (${formatLKR(tx.amount)})? Balances will be instantly updated.`)) {
                          onDeleteTransaction(tx.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete Transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Middle Row: Description & Amount */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm break-words">{tx.description}</p>
                    {tx.notes && (
                      <p className="text-[11px] text-slate-400 italic break-words">Note: {tx.notes}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {getAmountDisplay(tx)}
                  </div>
                </div>

                {/* Bottom Row: Category & Account Pill */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                    {tx.categoryName || 'General'}
                  </span>

                  {tx.type === 'transfer' ? (
                    <div className="flex items-center gap-1 text-[11px] font-medium">
                      <span className="text-rose-700 font-semibold">{sourceAcc?.name || tx.accountId}</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-emerald-700 font-semibold">{destAcc?.name || tx.toAccountId}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: sourceAcc?.color || (sourceAcc?.type === 'cash' ? '#10b981' : '#3b82f6') }}
                      />
                      <span>{sourceAcc?.name || tx.accountId}</span>
                    </div>
                  )}

                  {tx.referenceNumber && (
                    <span className="text-[10px] text-indigo-600 font-mono font-medium">
                      Ref: {tx.referenceNumber}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Transactions Table (md+) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/80">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Particulars / Description</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Account / Flow</th>
              <th className="py-3 px-4 text-right">Amount (LKR)</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Calendar className="w-8 h-8 text-slate-300" />
                    <p className="font-medium text-sm text-slate-600">No transactions match your search or filter</p>
                    <p className="text-xs text-slate-400">Try changing the date, clearing search filters, or click "Record Income / Expense"</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const sourceAcc = accountMap.get(tx.accountId);
                const destAcc = tx.toAccountId ? accountMap.get(tx.toAccountId) : null;
                const formattedTime = tx.date.includes('T') ? tx.date.split('T')[1].slice(0, 5) : '';
                const formattedDate = tx.date.split('T')[0];

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Date & Time */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                      <div className="font-bold text-slate-900">{formattedDate}</div>
                      {formattedTime && <div className="text-[11px] text-slate-400 font-mono">{formattedTime}</div>}
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getTypeBadge(tx.type)}
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900">{tx.description}</div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                        {tx.referenceNumber && (
                          <span className="text-indigo-600 font-medium">Ref: {tx.referenceNumber}</span>
                        )}
                        {tx.notes && (
                          <span className="text-[10px] text-slate-400 italic">
                            Note: {tx.notes}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {tx.categoryName || 'General'}
                      </span>
                    </td>

                    {/* Account Flow */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {tx.type === 'transfer' ? (
                        <div className="flex items-center gap-1 text-[11px] font-medium">
                          <span className="text-rose-700 font-semibold">{sourceAcc?.name || tx.accountId}</span>
                          <span className="text-slate-400">→</span>
                          <span className="text-emerald-700 font-semibold">{destAcc?.name || tx.toAccountId}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: sourceAcc?.color || (sourceAcc?.type === 'cash' ? '#10b981' : '#3b82f6') }}
                          />
                          <span>{sourceAcc?.name || tx.accountId}</span>
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {getAmountDisplay(tx)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingTx(tx)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Edit Transaction"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete this transaction "${tx.description}" (${formatLKR(tx.amount)})? Balances will be instantly updated.`)) {
                              onDeleteTransaction(tx.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {filteredTransactions.length > 0 && (
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-900">
                <td className="py-3.5 px-4 uppercase tracking-wider" colSpan={5}>
                  Filtered Ledger Total ({filteredTransactions.length} Records)
                </td>
                <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                  <div className="text-xs text-emerald-400">+{formatLKR(filteredTotals.incomeTotal)}</div>
                  <div className="text-xs text-rose-400">−{formatLKR(filteredTotals.expenseTotal)}</div>
                  <div className={`text-xs font-black pt-1 border-t border-slate-700 mt-1 ${filteredTotals.netTotal >= 0 ? 'text-amber-300' : 'text-rose-400'}`}>
                    Net: {filteredTotals.netTotal >= 0 ? `+${formatLKR(filteredTotals.netTotal)}` : formatLKR(filteredTotals.netTotal)}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="text-[10px] text-slate-400">Reconciled</span>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Edit Transaction Modal */}
      {editingTx && (
        <EditTransactionModal
          tx={editingTx}
          accounts={accounts}
          categories={categories}
          incomeSources={incomeSources}
          onClose={() => setEditingTx(null)}
          onSave={(updated) => {
            onEditTransaction(updated);
            setEditingTx(null);
          }}
        />
      )}
    </div>
  );
};

interface EditTransactionModalProps {
  tx: Transaction;
  accounts: BankAccount[];
  categories: ExpenseCategory[];
  incomeSources: IncomeCategory[];
  onClose: () => void;
  onSave: (tx: Transaction) => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  tx,
  accounts,
  categories,
  incomeSources,
  onClose,
  onSave,
}) => {
  const [amount, setAmount] = useState<string>(tx.amount.toString());
  const [date, setDate] = useState<string>(tx.date);
  const [description, setDescription] = useState<string>(tx.description);
  const [accountId, setAccountId] = useState<string>(tx.accountId);
  const [toAccountId, setToAccountId] = useState<string>(tx.toAccountId || '');
  const [categoryId, setCategoryId] = useState<string>(tx.categoryId || '');
  const [referenceNumber, setReferenceNumber] = useState<string>(tx.referenceNumber || '');
  const [notes, setNotes] = useState<string>(tx.notes || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      alert('Please enter a valid positive amount');
      return;
    }

    if (tx.type === 'transfer') {
      if (!toAccountId) {
        alert('Please select a destination account for the transfer');
        return;
      }
      if (accountId === toAccountId) {
        alert('Source and destination accounts must be different. Please select another account.');
        return;
      }
    }

    let catName = tx.categoryName;
    if (tx.type === 'expense') {
      const c = categories.find(cat => cat.id === categoryId);
      if (c) catName = c.name;
    } else if (tx.type === 'income') {
      const c = incomeSources.find(inc => inc.id === categoryId);
      if (c) catName = c.name;
    }

    onSave({
      ...tx,
      amount: numAmt,
      date,
      description,
      accountId,
      toAccountId: tx.type === 'transfer' ? toAccountId : undefined,
      categoryId: categoryId || undefined,
      categoryName: catName,
      referenceNumber: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <h3 className="font-bold text-base">Edit Transaction</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-800 text-slate-300 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (LKR) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
          </div>

          {tx.type === 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Account</label>
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id} disabled={acc.id === accountId}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reference #</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
