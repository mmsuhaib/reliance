'use client';

import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Building2, 
  Receipt, 
  Plus, 
  ArrowLeftRight, 
  ExternalLink 
} from 'lucide-react';
import { DailyFinanceSummary, BankAccount } from '../types/finance';
import { formatLKR } from '../lib/financeStore';

interface DashboardCardsProps {
  summary: DailyFinanceSummary;
  accounts: BankAccount[];
  selectedDate: string;
  onOpenModal: (modal: 'income' | 'expense' | 'transfer' | 'categories' | 'accounts') => void;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  summary,
  accounts,
  selectedDate,
  onOpenModal,
}) => {
  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const dateLabel = isToday ? "Today's" : `Date (${selectedDate})`;

  const cashAccounts = accounts.filter(a => a.type === 'cash');
  const bankAccounts = accounts.filter(a => a.type === 'bank');

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Date Header Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
            <span>Finance Overview</span>
            <span className="text-[10px] sm:text-xs font-normal text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
              {isToday ? 'Live Today' : `Ledger for ${selectedDate}`}
            </span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500">Tap or click any card below to perform actions</p>
        </div>
      </div>

      {/* Main Metric Cards Grid (Responsive 1-col on mobile, 2-col on sm, 4-col on lg/xl) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        
        {/* 1. Total Revenue / Income (P&L) */}
        <button
          type="button"
          onClick={() => onOpenModal('income')}
          className="text-left bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-400 active:scale-95 transition-all relative overflow-hidden group cursor-pointer w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          title="Tap to Record Income"
        >
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-emerald-50 rounded-bl-full -z-0 group-hover:scale-125 transition-transform duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-800 uppercase tracking-wider">{dateLabel} Revenue</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-2xs">
                <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-900 font-mono tracking-tight truncate">
              {formatLKR(summary.totalIncome)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500 font-medium truncate">
                Cash: <strong className="text-emerald-700 font-mono">{formatLKR(summary.cashIncome)}</strong>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center gap-0.5 shrink-0">
                <Plus className="w-2.5 h-2.5" /> Income
              </span>
            </div>
          </div>
        </button>

        {/* 2. Total Operating Expenses (P&L) */}
        <button
          type="button"
          onClick={() => onOpenModal('expense')}
          className="text-left bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-rose-400 active:scale-95 transition-all relative overflow-hidden group cursor-pointer w-full focus:outline-none focus:ring-2 focus:ring-rose-500/40"
          title="Tap to Record Operating Expense"
        >
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-rose-50 rounded-bl-full -z-0 group-hover:scale-125 transition-transform duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-rose-800 uppercase tracking-wider">{dateLabel} Expenses</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors shadow-2xs">
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-900 font-mono tracking-tight truncate">
              {formatLKR(summary.totalExpenses)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500 font-medium truncate">
                Cash: <strong className="text-rose-700 font-mono">{formatLKR(summary.cashExpenses)}</strong>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 group-hover:bg-rose-600 group-hover:text-white transition-colors flex items-center gap-0.5 shrink-0">
                <Plus className="w-2.5 h-2.5" /> Expense
              </span>
            </div>
          </div>
        </button>

        {/* 3. Total Cash in Drawer (Point-in-Time Closing) */}
        <button
          type="button"
          onClick={() => onOpenModal('transfer')}
          className="text-left bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-2xl p-3.5 sm:p-4 border border-emerald-700/50 shadow-sm hover:shadow-lg hover:border-emerald-400 active:scale-95 transition-all relative overflow-hidden group cursor-pointer w-full focus:outline-none focus:ring-2 focus:ring-emerald-400"
          title="Tap to Transfer Drawer Cash or Reconcile"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-300 uppercase tracking-wider">Cash Drawer</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-bold text-white font-mono tracking-tight truncate">
              {formatLKR(summary.totalCashBalance)}
            </div>
            <div className="text-[11px] text-emerald-200/80 mt-2 pt-1.5 border-t border-emerald-800/60 flex items-center justify-between">
              <span className="truncate">Open: {formatLKR(summary.totalCashOpening)}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-200 group-hover:bg-emerald-400 group-hover:text-slate-950 transition-colors flex items-center gap-0.5 shrink-0">
                <ArrowLeftRight className="w-2.5 h-2.5" /> Transfer
              </span>
            </div>
          </div>
        </button>

        {/* 4. Total Bank Liquidity (Point-in-Time Closing) */}
        <button
          type="button"
          onClick={() => onOpenModal('accounts')}
          className="text-left bg-gradient-to-br from-blue-950 to-slate-900 text-white rounded-2xl p-3.5 sm:p-4 border border-blue-700/50 shadow-sm hover:shadow-lg hover:border-blue-400 active:scale-95 transition-all relative overflow-hidden group cursor-pointer w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          title="Tap to Manage Bank Accounts & Opening Balances"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-blue-300 uppercase tracking-wider">Bank Balance</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-bold text-white font-mono tracking-tight truncate">
              {formatLKR(summary.totalBankBalance)}
            </div>
            <div className="text-[11px] text-blue-200/80 mt-2 pt-1.5 border-t border-blue-800/60 flex items-center justify-between">
              <span className="truncate">Liquid: {formatLKR(summary.totalLiquidAssets)}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-200 group-hover:bg-blue-400 group-hover:text-slate-950 transition-colors flex items-center gap-0.5 shrink-0">
                <ExternalLink className="w-2.5 h-2.5" /> Manage
              </span>
            </div>
          </div>
        </button>

      </div>

      {/* Interactive Mini Bank Breakdown Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5 text-[11px] sm:text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            Bank Balances:
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          {bankAccounts.map(acc => (
            <button
              key={acc.id}
              type="button"
              onClick={() => onOpenModal('accounts')}
              className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors active:scale-95 shrink-0"
              title={`Click to view/edit ${acc.name}`}
            >
              <div 
                className="w-2 h-2 rounded-full shrink-0" 
                style={{ backgroundColor: acc.color || '#3b82f6' }}
              />
              <span className="text-slate-600 font-medium text-[11px]">{acc.name.split('-')[0].trim()}:</span>
              <span className="font-bold text-slate-900 font-mono text-[11px]">{formatLKR(acc.currentBalance)}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => onOpenModal('accounts')}
            className="text-[10px] sm:text-[11px] font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-3 h-3" /> Add / Manage
          </button>
        </div>
      </div>
    </div>
  );
};
