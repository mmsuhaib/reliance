'use client';

import React from 'react';
import { 
  Building2, 
  Wallet, 
  ArrowDownRight, 
  ArrowUpRight, 
  Calculator, 
  CheckCircle2, 
  ArrowLeftRight,
  Plus,
  FileSpreadsheet
} from 'lucide-react';
import { DailyFinanceSummary } from '../types/finance';
import { formatLKR } from '../lib/financeStore';

interface DailyAccountSummaryProps {
  summary: DailyFinanceSummary;
  selectedDate: string;
  onOpenModal?: (modal: 'income' | 'expense' | 'transfer' | 'categories' | 'accounts' | 'statement') => void;
}

export const DailyAccountSummary: React.FC<DailyAccountSummaryProps> = ({
  summary,
  selectedDate,
  onOpenModal,
}) => {
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const totalOpening = summary.accountSummaries.reduce((sum, item) => sum + item.openingBalance, 0);
  const totalReceived = summary.accountSummaries.reduce((sum, item) => sum + item.moneyReceived, 0);
  const totalPaid = summary.accountSummaries.reduce((sum, item) => sum + item.moneyPaid, 0);
  const totalClosing = summary.accountSummaries.reduce((sum, item) => sum + item.closingBalance, 0);
  const totalNet = totalReceived - totalPaid;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              Daily Account Reconciliation Summary
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                Formula: Opening + Received − Paid = Closing
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Audit balances separately for counter cash and all active bank accounts ({selectedDate})
            </p>
          </div>
        </div>

        {/* Aggregate Today Movement Badge & Quick Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {onOpenModal && (
            <>
              <button
                type="button"
                onClick={() => onOpenModal('statement')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
                title="View & Print Full Financial Statement"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                <span>Full Statement</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenModal('transfer')}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Transfer Funds</span>
              </button>
            </>
          )}
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 mr-1.5 font-medium">Net Day Flow:</span>
            <span className={`font-mono font-bold ${totalNet >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {totalNet >= 0 ? `+${formatLKR(totalNet)}` : formatLKR(totalNet)}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Card View (< md) */}
      <div className="block md:hidden space-y-3">
        {summary.accountSummaries.map((item) => {
          const isPositive = item.netChange >= 0;
          return (
            <div
              key={item.accountId}
              onClick={() => onOpenModal?.('accounts')}
              className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3 active:scale-[0.99] transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                    {item.accountType === 'cash' ? (
                      <Wallet className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Building2 className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.accountName}</h4>
                    <span className="text-[10px] text-slate-400 capitalize">{item.accountType} Account</span>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md text-[11px] font-mono ${
                    isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isPositive ? <ArrowDownRight className="w-3 h-3 text-emerald-600" /> : <ArrowUpRight className="w-3 h-3 text-rose-600" />}
                  {isPositive ? `+${formatLKR(item.netChange)}` : formatLKR(item.netChange)}
                </span>
              </div>

              {/* Grid of Money Flow */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Opening</span>
                  <span className="font-mono font-bold text-slate-700">{formatLKR(item.openingBalance)}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Closing</span>
                  <span className="font-mono font-bold text-slate-950">{formatLKR(item.closingBalance)}</span>
                </div>
                <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 font-semibold block uppercase">Received (+)</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {item.moneyReceived > 0 ? `+${formatLKR(item.moneyReceived)}` : 'Rs. 0.00'}
                  </span>
                </div>
                <div className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
                  <span className="text-[10px] text-rose-700 font-semibold block uppercase">Paid (−)</span>
                  <span className="font-mono font-bold text-rose-600">
                    {item.moneyPaid > 0 ? `−${formatLKR(item.moneyPaid)}` : 'Rs. 0.00'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Mobile Total Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2.5 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-300">All Accounts Aggregate</span>
            <span className={`text-xs font-mono font-bold ${totalNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalNet >= 0 ? `+${formatLKR(totalNet)}` : formatLKR(totalNet)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Total Opening</span>
              <span className="font-mono text-slate-200 font-medium">{formatLKR(totalOpening)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Total Closing</span>
              <span className="font-mono text-amber-300 font-bold text-sm">{formatLKR(totalClosing)}</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 block">Total Inflow</span>
              <span className="font-mono text-emerald-400 font-medium">+{formatLKR(totalReceived)}</span>
            </div>
            <div>
              <span className="text-[10px] text-rose-400 block">Total Outflow</span>
              <span className="font-mono text-rose-400 font-medium">−{formatLKR(totalPaid)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop/Tablet Account Balance Table (md+) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/80">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4">Account / Drawer</th>
              <th className="py-3 px-4 text-right">Opening Balance</th>
              <th className="py-3 px-4 text-right text-emerald-700">Money Received (+)</th>
              <th className="py-3 px-4 text-right text-rose-700">Money Paid (−)</th>
              <th className="py-3 px-4 text-right font-bold text-slate-900">Closing Balance</th>
              <th className="py-3 px-4 text-right">Day Net Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {summary.accountSummaries.map((item) => {
              const isPositive = item.netChange >= 0;
              return (
                <tr 
                  key={item.accountId} 
                  onClick={() => onOpenModal?.('accounts')}
                  className="hover:bg-indigo-50/40 transition-colors cursor-pointer"
                  title="Click to view/manage account"
                >
                  {/* Account Name */}
                  <td className="py-3.5 px-4 font-medium text-slate-800 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      {item.accountType === 'cash' ? (
                        <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">{item.accountName}</span>
                      <span className="block text-[10px] text-slate-400 capitalize">{item.accountType} Account</span>
                    </div>
                  </td>

                  {/* Opening Balance */}
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700">
                    {formatLKR(item.openingBalance)}
                  </td>

                  {/* Money Received */}
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-600 bg-emerald-50/20">
                    {item.moneyReceived > 0 ? `+${formatLKR(item.moneyReceived)}` : 'Rs. 0.00'}
                  </td>

                  {/* Money Paid */}
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-rose-600 bg-rose-50/20">
                    {item.moneyPaid > 0 ? `−${formatLKR(item.moneyPaid)}` : 'Rs. 0.00'}
                  </td>

                  {/* Closing Balance */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-950 bg-slate-50/50">
                    {formatLKR(item.closingBalance)}
                  </td>

                  {/* Net Change */}
                  <td className="py-3.5 px-4 text-right font-mono">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                        isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {isPositive ? <ArrowDownRight className="w-3 h-3 text-emerald-600" /> : <ArrowUpRight className="w-3 h-3 text-rose-600" />}
                      {isPositive ? `+${formatLKR(item.netChange)}` : formatLKR(item.netChange)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Totals Footer */}
          <tfoot>
            <tr className="bg-slate-900 text-white font-bold border-t border-slate-900">
              <td className="py-3.5 px-4">Total Aggregate (All Accounts)</td>
              <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                {formatLKR(totalOpening)}
              </td>
              <td className="py-3.5 px-4 text-right font-mono text-emerald-400">
                +{formatLKR(totalReceived)}
              </td>
              <td className="py-3.5 px-4 text-right font-mono text-rose-400">
                −{formatLKR(totalPaid)}
              </td>
              <td className="py-3.5 px-4 text-right font-mono text-amber-300 font-extrabold text-sm">
                {formatLKR(totalClosing)}
              </td>
              <td className="py-3.5 px-4 text-right font-mono">
                <span className={`px-2 py-0.5 rounded text-xs ${totalNet >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {totalNet >= 0 ? `+${formatLKR(totalNet)}` : formatLKR(totalNet)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Reconciliation Note Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        <div 
          onClick={() => onOpenModal?.('income')}
          className="bg-emerald-50/60 hover:bg-emerald-100/60 transition-colors cursor-pointer border border-emerald-200/70 rounded-2xl p-3.5 flex items-start gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-emerald-950 flex items-center justify-between">
              <span>Cash Drawer Verified</span>
              <span className="text-[10px] text-emerald-700 font-semibold underline">Record Inflow</span>
            </h4>
            <p className="text-[11px] text-emerald-800">
              Cash opening balance plus counter sales & tailoring advance minus petty cash expenses & deposits.
            </p>
          </div>
        </div>

        <div 
          onClick={() => onOpenModal?.('accounts')}
          className="bg-blue-50/60 hover:bg-blue-100/60 transition-colors cursor-pointer border border-blue-200/70 rounded-2xl p-3.5 flex items-start gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-blue-950 flex items-center justify-between">
              <span>Bank Accounts Synced</span>
              <span className="text-[10px] text-blue-700 font-semibold underline">Manage</span>
            </h4>
            <p className="text-[11px] text-blue-800">
              Card POS settlements, online bank transfers, vendor payments, and cash deposits reconciled.
            </p>
          </div>
        </div>

        <div 
          onClick={() => onOpenModal?.('transfer')}
          className="bg-slate-100/70 hover:bg-slate-200/60 transition-colors cursor-pointer border border-slate-200 rounded-2xl p-3.5 flex items-start gap-2.5"
        >
          <Calculator className="w-4 h-4 text-slate-700 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span>Automatic Recalculation</span>
              <span className="text-[10px] text-slate-700 font-semibold underline">Transfer</span>
            </h4>
            <p className="text-[11px] text-slate-600">
              Modifying, adding, or deleting any transaction instantly recalculates closing balances without errors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
