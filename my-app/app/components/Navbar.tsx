'use client';

import React from 'react';
import { 
  Building2, 
  Calendar, 
  PlusCircle, 
  MinusCircle, 
  ArrowLeftRight, 
  Layers, 
  RotateCcw,
  Wallet
} from 'lucide-react';
import { formatLKR } from '../lib/financeStore';

interface NavbarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onOpenModal: (modal: 'income' | 'expense' | 'transfer' | 'categories' | 'accounts') => void;
  onResetData: () => void;
  totalCash: number;
  totalBank: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedDate,
  onDateChange,
  onOpenModal,
  onResetData,
  totalCash,
  totalBank,
}) => {
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Top bar: Brand & Balances */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2.5 sm:py-3 gap-2.5 sm:gap-3 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center shadow-md shadow-rose-500/20 ring-2 ring-rose-400/30 shrink-0">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1">
                    Reliance <span className="text-rose-400 font-light">Furniture</span>
                  </h1>
                  <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Finance Ledger
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 hidden xs:block">Daily Accounts & Bank Reconciliation</p>
              </div>
            </div>

            {/* Quick action buttons for Settings & Reset on Mobile Header */}
            <div className="flex sm:hidden items-center gap-1">
              <button
                onClick={() => onOpenModal('categories')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 cursor-pointer"
                title="Manage Categories"
              >
                <Layers className="w-3.5 h-3.5 text-rose-400" />
              </button>
              <button
                onClick={() => onOpenModal('accounts')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 cursor-pointer"
                title="Manage Accounts"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
              </button>
              <button
                onClick={() => {
                  if (confirm('Clear transactions and reset database balances?')) {
                    onResetData();
                  }
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 text-xs border border-slate-700 cursor-pointer"
                title="Reset Database"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Balance Preview + Manage Tools (Desktop/Tablet) */}
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 sm:gap-3 bg-slate-800/60 border border-slate-700/60 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs w-full sm:w-auto justify-around sm:justify-start">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-400 text-[11px] sm:text-xs font-medium">Cash:</span>
                <span className="font-bold text-emerald-300 font-mono text-xs sm:text-xs">{formatLKR(totalCash)}</span>
              </div>
              <div className="w-px h-3.5 bg-slate-700"></div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span className="text-slate-400 text-[11px] sm:text-xs font-medium">Bank:</span>
                <span className="font-bold text-blue-300 font-mono text-xs sm:text-xs">{formatLKR(totalBank)}</span>
              </div>
            </div>

            {/* Desktop Setting Buttons */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => onOpenModal('categories')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                title="Manage Expense Categories"
              >
                <Layers className="w-3.5 h-3.5 text-rose-400" />
                <span>Categories</span>
              </button>

              <button
                onClick={() => onOpenModal('accounts')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                title="Manage Bank Accounts & Opening Balances"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Accounts</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Clear transactions and reset database balances?')) {
                    onResetData();
                  }
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 text-xs transition-colors border border-slate-700 cursor-pointer"
                title="Reset Database Transactions"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar: Date Selector + Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between py-2 sm:py-2.5 gap-2 sm:gap-3">
          {/* Date controls */}
          <div className="flex items-center gap-2 justify-between sm:justify-start">
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1 text-xs flex-1 sm:flex-none">
              <Calendar className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-slate-300 font-medium text-[11px] sm:text-xs">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent text-white font-medium text-[11px] sm:text-xs focus:outline-none cursor-pointer flex-1"
              />
            </div>

            {!isToday && (
              <button
                onClick={() => onDateChange(new Date().toISOString().split('T')[0])}
                className="text-[11px] sm:text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg px-2.5 py-1 font-medium transition-colors cursor-pointer shrink-0"
              >
                Today
              </button>
            )}
          </div>

          {/* Primary Quick Actions */}
          <div className="grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => onOpenModal('income')}
              className="px-2.5 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 shadow-md shadow-emerald-950/40 active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-100 shrink-0" />
              <span>+ Income</span>
            </button>

            <button
              onClick={() => onOpenModal('expense')}
              className="px-2.5 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 shadow-md shadow-rose-950/40 active:scale-95 transition-all cursor-pointer"
            >
              <MinusCircle className="w-3.5 h-3.5 text-rose-100 shrink-0" />
              <span>− Expense</span>
            </button>

            <button
              onClick={() => onOpenModal('transfer')}
              className="px-2.5 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 shadow-md shadow-indigo-950/40 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-100 shrink-0" />
              <span>Transfer</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
