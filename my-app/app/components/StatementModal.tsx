'use client';

import React, { useMemo } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Building2, 
  Wallet, 
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  Receipt,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight
} from 'lucide-react';
import { DailyFinanceSummary, Transaction, BankAccount, ExpenseCategory, IncomeCategory } from '../types/finance';
import { formatLKR } from '../lib/financeStore';

interface StatementModalProps {
  summary: DailyFinanceSummary;
  transactions: Transaction[];
  accounts: BankAccount[];
  categories: ExpenseCategory[];
  incomeSources: IncomeCategory[];
  selectedDate: string;
  onClose: () => void;
}

export const StatementModal: React.FC<StatementModalProps> = ({
  summary,
  transactions,
  accounts,
  categories,
  incomeSources,
  selectedDate,
  onClose,
}) => {
  // Map accounts for quick lookup
  const accountMap = useMemo(() => {
    const map = new Map<string, BankAccount>();
    accounts.forEach(acc => map.set(acc.id, acc));
    return map;
  }, [accounts]);

  // Filter transactions for this statement date
  const dateTransactions = useMemo(() => {
    return transactions
      .filter(tx => tx.date.startsWith(selectedDate))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, selectedDate]);

  // Aggregate totals
  const totalOpening = summary.accountSummaries.reduce((sum, item) => sum + item.openingBalance, 0);
  const totalReceived = summary.accountSummaries.reduce((sum, item) => sum + item.moneyReceived, 0);
  const totalPaid = summary.accountSummaries.reduce((sum, item) => sum + item.moneyPaid, 0);
  const totalClosing = summary.accountSummaries.reduce((sum, item) => sum + item.closingBalance, 0);
  const totalNet = totalReceived - totalPaid;

  const totalIncomeTx = dateTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenseTx = dateTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalTransferTx = dateTransactions
    .filter(tx => tx.type === 'transfer')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Export CSV for Statement
  const handleExportCSV = () => {
    const lines: string[] = [];
    
    // Header
    lines.push(`RELIANCE FURNITURE - DAILY ACCOUNT RECONCILIATION & AUDIT STATEMENT`);
    lines.push(`Statement Date,${selectedDate}`);
    lines.push(`Generated On,${new Date().toLocaleString()}`);
    lines.push(``);

    // Section 1: Daily Account Reconciliation Summary
    lines.push(`1. DAILY ACCOUNT RECONCILIATION SUMMARY`);
    lines.push(`Account Name,Account Type,Opening Balance (LKR),Money Received (+),Money Paid (-),Closing Balance (LKR),Net Change (LKR)`);
    summary.accountSummaries.forEach(acc => {
      lines.push(`"${acc.accountName}","${acc.accountType}",${acc.openingBalance},${acc.moneyReceived},${acc.moneyPaid},${acc.closingBalance},${acc.netChange}`);
    });
    lines.push(`TOTAL AGGREGATE,,${totalOpening},${totalReceived},${totalPaid},${totalClosing},${totalNet}`);
    lines.push(``);

    // Section 2: P&L & Operating Performance
    lines.push(`2. REVENUE & EXPENSE PERFORMANCE`);
    lines.push(`Metric,Cash Inflow/Outflow (LKR),Bank Inflow/Outflow (LKR),Total Aggregate (LKR)`);
    lines.push(`Total Operating Income,${summary.cashIncome},${summary.bankIncome},${summary.totalIncome}`);
    lines.push(`Total Operating Expenses,${summary.cashExpenses},${summary.bankExpenses},${summary.totalExpenses}`);
    lines.push(`Net Operating Flow,${summary.cashIncome - summary.cashExpenses},${summary.bankIncome - summary.bankExpenses},${summary.netOperatingProfit}`);
    lines.push(`Total Transfers Volume,,,${summary.totalTransfers}`);
    lines.push(``);

    // Section 3: Transaction History & Audit Ledger
    lines.push(`3. TRANSACTION HISTORY & AUDIT LEDGER`);
    lines.push(`Tx ID,Time,Type,Category,Description,Account,To Account,Ref #,Inflow / Credit (LKR),Outflow / Debit (LKR)`);
    dateTransactions.forEach(tx => {
      const sourceAcc = accountMap.get(tx.accountId)?.name || tx.accountId;
      const destAcc = tx.toAccountId ? (accountMap.get(tx.toAccountId)?.name || tx.toAccountId) : '';
      const time = tx.date.includes('T') ? tx.date.split('T')[1].slice(0, 5) : '';
      const credit = tx.type === 'income' ? tx.amount : 0;
      const debit = tx.type === 'expense' ? tx.amount : 0;
      const transfer = tx.type === 'transfer' ? tx.amount : 0;

      lines.push(`"${tx.id}","${time}","${tx.type}","${tx.categoryName || ''}","${(tx.description || '').replace(/"/g, '""')}","${sourceAcc}","${destAcc}","${tx.referenceNumber || ''}",${credit || (tx.type === 'transfer' ? `Transfer: ${transfer}` : 0)},${debit || 0}`);
    });
    lines.push(`TOTALS,,,,,,,${totalIncomeTx},${totalExpenseTx}`);
    lines.push(``);

    // Section 4: Grand Total Summary
    lines.push(`4. EXECUTIVE STATEMENT TOTAL SUMMARY`);
    lines.push(`Total Opening Liquid Balance,${totalOpening}`);
    lines.push(`Total Receipts & Inflows (+),${totalReceived}`);
    lines.push(`Total Disbursements & Outflows (-),${totalPaid}`);
    lines.push(`Total Closing Liquid Balance,${totalClosing}`);
    lines.push(`Net Movement for Period,${totalNet}`);

    const csvContent = 'data:text/csv;charset=utf-8,' + lines.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reliance_Furniture_Statement_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible">
      {/* Container */}
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Top Modal Controls (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Daily Reconciliation & Audit Statement</h2>
              <p className="text-[11px] text-slate-400">Reliance Furniture • Complete financial statement for {selectedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-950/30 cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Statement Content Body */}
        <div className="overflow-y-auto p-4 sm:p-8 space-y-8 text-slate-900 print:p-0 print:overflow-visible print:space-y-6">
          
          {/* Statement Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
                  RELIANCE <span className="text-rose-600">FURNITURE</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 uppercase tracking-widest">
                  Official Statement
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">Daily Accounts Reconciliation & Audit Ledger Statement</p>
              <p className="text-[11px] text-slate-400 mt-0.5">High Quality Furnishings & Custom Interior Craftsmanship</p>
            </div>

            <div className="text-left sm:text-right text-xs space-y-1 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-200">
              <div>
                <span className="text-slate-500 font-medium">Statement Date: </span>
                <span className="font-bold text-slate-900 text-sm font-mono">{selectedDate}</span>
              </div>
              <div>
                <span className="text-slate-500">Generated: </span>
                <span className="font-medium text-slate-700">{new Date().toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500">Status: </span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                  <CheckCircle2 className="w-3 h-3" /> Reconciled & Balanced
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Daily Account Reconciliation Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                1. Daily Account Reconciliation Summary
              </h3>
              <span className="text-[11px] font-semibold text-slate-500 font-mono">
                Formula: Opening + Received − Paid = Closing
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-300">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3">Account Name & Drawer</th>
                    <th className="py-2.5 px-3 text-center">Type</th>
                    <th className="py-2.5 px-3 text-right">Opening Balance</th>
                    <th className="py-2.5 px-3 text-right text-emerald-700">Received (+)</th>
                    <th className="py-2.5 px-3 text-right text-rose-700">Paid (−)</th>
                    <th className="py-2.5 px-3 text-right font-black text-slate-950">Closing Balance</th>
                    <th className="py-2.5 px-3 text-right">Net Flow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {summary.accountSummaries.map((acc) => (
                    <tr key={acc.accountId} className="even:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-2">
                        {acc.accountType === 'cash' ? (
                          <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        )}
                        <span>{acc.accountName}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center capitalize text-slate-500 font-medium">
                        {acc.accountType}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-700">
                        {formatLKR(acc.openingBalance)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-600 bg-emerald-50/30">
                        {acc.moneyReceived > 0 ? `+${formatLKR(acc.moneyReceived)}` : 'Rs. 0.00'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-rose-600 bg-rose-50/30">
                        {acc.moneyPaid > 0 ? `−${formatLKR(acc.moneyPaid)}` : 'Rs. 0.00'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950 bg-slate-100/50">
                        {formatLKR(acc.closingBalance)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">
                        <span className={acc.netChange >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                          {acc.netChange >= 0 ? `+${formatLKR(acc.netChange)}` : formatLKR(acc.netChange)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-950">
                    <td className="py-3 px-3 uppercase tracking-wider" colSpan={2}>
                      Total Aggregate (All Accounts)
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-200">
                      {formatLKR(totalOpening)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400">
                      +{formatLKR(totalReceived)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-rose-400">
                      −{formatLKR(totalPaid)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-amber-300 font-black text-sm">
                      {formatLKR(totalClosing)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <span className={totalNet >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                        {totalNet >= 0 ? `+${formatLKR(totalNet)}` : formatLKR(totalNet)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Section 2: Performance Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5">
              <div className="flex items-center justify-between text-emerald-800 text-xs font-bold mb-1">
                <span>Total Revenue Inflow</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-lg font-black font-mono text-emerald-950">
                +{formatLKR(summary.totalIncome)}
              </div>
              <div className="flex justify-between text-[10px] text-emerald-700 mt-1 pt-1 border-t border-emerald-200">
                <span>Cash: {formatLKR(summary.cashIncome)}</span>
                <span>Bank: {formatLKR(summary.bankIncome)}</span>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5">
              <div className="flex items-center justify-between text-rose-800 text-xs font-bold mb-1">
                <span>Total Operating Expenses</span>
                <TrendingDown className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-lg font-black font-mono text-rose-950">
                −{formatLKR(summary.totalExpenses)}
              </div>
              <div className="flex justify-between text-[10px] text-rose-700 mt-1 pt-1 border-t border-rose-200">
                <span>Cash: {formatLKR(summary.cashExpenses)}</span>
                <span>Bank: {formatLKR(summary.bankExpenses)}</span>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3.5">
              <div className="flex items-center justify-between text-indigo-800 text-xs font-bold mb-1">
                <span>Net Day P&L Flow</span>
                <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
              </div>
              <div className={`text-lg font-black font-mono ${summary.netOperatingProfit >= 0 ? 'text-indigo-950' : 'text-rose-900'}`}>
                {summary.netOperatingProfit >= 0 ? `+${formatLKR(summary.netOperatingProfit)}` : formatLKR(summary.netOperatingProfit)}
              </div>
              <div className="flex justify-between text-[10px] text-indigo-700 mt-1 pt-1 border-t border-indigo-200">
                <span>Transfers Vol: {formatLKR(summary.totalTransfers)}</span>
                <span>Margin: {summary.profitMargin.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Section 3: Transaction History & Audit Ledger */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                2. Transaction History & Audit Ledger
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">
                {dateTransactions.length} itemized transaction{dateTransactions.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-300">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Particulars / Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Account Flow</th>
                    <th className="py-2.5 px-3 text-right text-emerald-700">Inflow (+)</th>
                    <th className="py-2.5 px-3 text-right text-rose-700">Outflow (−)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dateTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                        No transactions recorded for this date.
                      </td>
                    </tr>
                  ) : (
                    dateTransactions.map((tx) => {
                      const sourceAcc = accountMap.get(tx.accountId)?.name || tx.accountId;
                      const destAcc = tx.toAccountId ? (accountMap.get(tx.toAccountId)?.name || tx.toAccountId) : null;
                      const time = tx.date.includes('T') ? tx.date.split('T')[1].slice(0, 5) : '-';

                      return (
                        <tr key={tx.id} className="even:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">{time}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              tx.type === 'income' ? 'bg-emerald-100 text-emerald-800' :
                              tx.type === 'expense' ? 'bg-rose-100 text-rose-800' :
                              'bg-indigo-100 text-indigo-800'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            <div>{tx.description}</div>
                            {tx.referenceNumber && (
                              <span className="text-[10px] text-indigo-600 font-mono">Ref: {tx.referenceNumber}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                            {tx.categoryName || 'General'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap font-medium text-[11px]">
                            {tx.type === 'transfer' ? (
                              <span>{sourceAcc} → {destAcc}</span>
                            ) : (
                              <span>{sourceAcc}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700 bg-emerald-50/20 whitespace-nowrap">
                            {tx.type === 'income' ? `+${formatLKR(tx.amount)}` : tx.type === 'transfer' ? `⇄ ${formatLKR(tx.amount)}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-rose-700 bg-rose-50/20 whitespace-nowrap">
                            {tx.type === 'expense' ? `−${formatLKR(tx.amount)}` : '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-800 text-white font-bold border-t-2 border-slate-900">
                    <td className="py-3 px-3 uppercase tracking-wider" colSpan={5}>
                      Ledger Movement Totals
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400">
                      +{formatLKR(totalIncomeTx)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-rose-400">
                      −{formatLKR(totalExpenseTx)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Section 4: Executive Statement Total Summary & Audit Sign-off */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-5 print:bg-slate-100 print:text-slate-900 print:border print:border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 print:text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                3. Total Summary & Liquid Assets Reconciliation
              </h3>
              <span className="text-xs font-mono text-slate-400 print:text-slate-600">Reliance Furniture Internal Audit</span>
            </div>

            {/* Metric Rows */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-800/80 print:bg-white p-3 rounded-xl border border-slate-700/60 print:border-slate-200">
                <span className="text-[11px] text-slate-400 print:text-slate-500 block uppercase font-bold">Total Opening Balance</span>
                <span className="font-mono text-base font-bold text-slate-200 print:text-slate-900">{formatLKR(totalOpening)}</span>
              </div>
              <div className="bg-slate-800/80 print:bg-white p-3 rounded-xl border border-slate-700/60 print:border-slate-200">
                <span className="text-[11px] text-emerald-400 print:text-emerald-700 block uppercase font-bold">Total Inflows (+)</span>
                <span className="font-mono text-base font-bold text-emerald-400 print:text-emerald-700">+{formatLKR(totalReceived)}</span>
              </div>
              <div className="bg-slate-800/80 print:bg-white p-3 rounded-xl border border-slate-700/60 print:border-slate-200">
                <span className="text-[11px] text-rose-400 print:text-rose-700 block uppercase font-bold">Total Outflows (−)</span>
                <span className="font-mono text-base font-bold text-rose-400 print:text-rose-700">−{formatLKR(totalPaid)}</span>
              </div>
              <div className="bg-slate-800/80 print:bg-white p-3 rounded-xl border border-slate-700/60 print:border-slate-200">
                <span className="text-[11px] text-amber-400 print:text-slate-900 block uppercase font-bold">Total Closing Balance</span>
                <span className="font-mono text-lg font-black text-amber-300 print:text-slate-950">{formatLKR(totalClosing)}</span>
              </div>
            </div>

            {/* Audit Signatures */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800 print:border-slate-300 text-center text-xs">
              <div className="space-y-6">
                <div className="border-b border-slate-700 print:border-slate-400 pb-1 h-6"></div>
                <p className="font-semibold text-slate-300 print:text-slate-700 text-[11px]">Prepared by (Cashier / Accountant)</p>
              </div>
              <div className="space-y-6">
                <div className="border-b border-slate-700 print:border-slate-400 pb-1 h-6"></div>
                <p className="font-semibold text-slate-300 print:text-slate-700 text-[11px]">Audited & Verified by</p>
              </div>
              <div className="space-y-6">
                <div className="border-b border-slate-700 print:border-slate-400 pb-1 h-6"></div>
                <p className="font-semibold text-slate-300 print:text-slate-700 text-[11px]">Approved by (Managing Director)</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
