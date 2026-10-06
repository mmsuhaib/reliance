'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeftRight, 
  Calendar, 
  Wallet, 
  Building2, 
  Info, 
  ArrowDown, 
  Hash, 
  Plus, 
  Loader2, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { BankAccount, Transaction } from '../types/finance';
import { getTodayString } from '../lib/financeStore';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransfer: (transferData: Omit<Transaction, 'id' | 'createdAt'>) => void;
  accounts: BankAccount[];
  defaultDate?: string;
  onAddAccount?: (account: Partial<BankAccount>) => Promise<void>;
  onManageAccounts?: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  onAddTransfer,
  accounts,
  defaultDate,
  onAddAccount,
  onManageAccounts,
}) => {
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(
    defaultDate ? `${defaultDate}T${new Date().toTimeString().slice(0, 5)}` : `${getTodayString()}T12:00`
  );
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Quick inline creation state for destination bank account
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newAccName, setNewAccName] = useState('');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newOpeningBal, setNewOpeningBal] = useState('');
  const [isCreatingLoading, setIsCreatingLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Automatically configure smart, distinct source & destination accounts whenever accounts change or modal opens
  useEffect(() => {
    if (!isOpen || accounts.length === 0) return;

    const cash = accounts.find(a => a.type === 'cash') || accounts[0];
    const bank = accounts.find(a => a.id !== cash.id && a.type === 'bank') 
      || accounts.find(a => a.id !== cash.id) 
      || null;

    setFromAccountId(cash.id);
    if (bank) {
      setToAccountId(bank.id);
      setIsCreatingAccount(false);
    } else {
      setToAccountId('');
      // If only 1 account exists in the entire system, show the inline creator automatically
      setIsCreatingAccount(true);
    }
  }, [isOpen, accounts]);

  if (!isOpen) return null;

  // Handle fromAccount change with smart distinct destination selection
  const handleFromAccountChange = (newFromId: string) => {
    setFromAccountId(newFromId);
    setValidationError(null);
    if (newFromId === toAccountId) {
      const alternative = accounts.find(a => a.id !== newFromId);
      if (alternative) {
        setToAccountId(alternative.id);
      } else {
        setToAccountId('');
      }
    }
  };

  // Handle toAccount change with smart distinct source selection
  const handleToAccountChange = (newToId: string) => {
    if (newToId === '__create_new__') {
      setIsCreatingAccount(true);
      return;
    }
    setToAccountId(newToId);
    setValidationError(null);
    if (newToId === fromAccountId) {
      const alternative = accounts.find(a => a.id !== newToId);
      if (alternative) {
        setFromAccountId(alternative.id);
      }
    }
  };

  const handleQuickPreset = (type: 'cash_to_bank' | 'bank_to_cash' | 'bank_to_bank') => {
    setValidationError(null);
    const cash = accounts.find(a => a.type === 'cash');
    const banks = accounts.filter(a => a.type === 'bank');

    if (type === 'cash_to_bank') {
      if (cash && banks[0]) {
        setFromAccountId(cash.id);
        setToAccountId(banks[0].id);
      } else if (cash && !banks[0]) {
        setFromAccountId(cash.id);
        setIsCreatingAccount(true);
      }
    } else if (type === 'bank_to_cash') {
      if (cash && banks[0]) {
        setFromAccountId(banks[0].id);
        setToAccountId(cash.id);
      }
    } else if (type === 'bank_to_bank') {
      if (banks.length >= 2) {
        setFromAccountId(banks[0].id);
        setToAccountId(banks[1].id);
      } else if (banks.length === 1) {
        setFromAccountId(banks[0].id);
        setIsCreatingAccount(true);
      }
    }
  };

  // Inline Account Creation Handler
  const handleInlineCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) {
      alert('Please enter an account name');
      return;
    }

    try {
      setIsCreatingLoading(true);
      const parsedBal = parseFloat(newOpeningBal) || 0;

      if (onAddAccount) {
        await onAddAccount({
          name: newAccName.trim(),
          bankName: newBankName.trim() || undefined,
          accountNumber: newAccNumber.trim() || undefined,
          type: 'bank',
          openingBalance: parsedBal,
          color: '#3b82f6',
        });
      }

      setIsCreatingAccount(false);
      setNewBankName('');
      setNewAccName('');
      setNewAccNumber('');
      setNewOpeningBal('');
    } catch (err: any) {
      alert(err.message || 'Failed to create bank account');
    } finally {
      setIsCreatingLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setValidationError('Please enter a valid transfer amount (e.g. 5000.00)');
      return;
    }

    if (!fromAccountId) {
      setValidationError('Please select a source account to transfer from');
      return;
    }

    if (!toAccountId) {
      setValidationError('Please select or create a destination account');
      return;
    }

    if (fromAccountId === toAccountId) {
      setValidationError('Source and destination accounts must be different. Please select or create another account.');
      return;
    }

    const fromAcc = accounts.find(a => a.id === fromAccountId);
    const toAcc = accounts.find(a => a.id === toAccountId);

    let desc = `Transfer: ${fromAcc?.name || 'Account'} → ${toAcc?.name || 'Account'}`;
    if (fromAcc?.type === 'cash' && toAcc?.type === 'bank') {
      desc = `Cash Deposit: Counter Cash to ${toAcc.name}`;
    } else if (fromAcc?.type === 'bank' && toAcc?.type === 'cash') {
      desc = `Bank Withdrawal: ${fromAcc.name} to Cash Drawer`;
    }

    onAddTransfer({
      date: date || `${getTodayString()}T12:00`,
      type: 'transfer',
      amount: numAmount,
      accountId: fromAccountId,
      toAccountId: toAccountId,
      categoryName: 'Account Transfer',
      description: desc,
      referenceNumber: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    // Reset
    setAmount('');
    setReferenceNumber('');
    setNotes('');
    onClose();
  };

  const hasMultipleAccounts = accounts.length >= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 px-4 sm:px-6 py-3.5 sm:py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Cash–Bank Transfer</h3>
              <p className="text-[10px] sm:text-xs text-indigo-100">Deposit, withdraw, or move funds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-indigo-50/90 border-b border-indigo-100 px-4 sm:px-6 py-2 flex items-center gap-2 text-[11px] sm:text-xs text-indigo-900 shrink-0">
          <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>
            <strong>Zero P&L Impact:</strong> Transfers update account balances directly and do not change operating profit.
          </span>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto">
          
          {/* Validation Alert Message */}
          {validationError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2 text-rose-800 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Attention: </span>
                <span>{validationError}</span>
              </div>
            </div>
          )}

          {/* Quick Notice when only 1 account exists */}
          {!hasMultipleAccounts && !isCreatingAccount && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Second Account Required</span>
              </div>
              <p className="text-[11px] text-amber-800">
                You currently have 1 account. To transfer funds, create a destination Bank Account (e.g. Commercial Bank, HNB, Sampath).
              </p>
              <button
                type="button"
                onClick={() => setIsCreatingAccount(true)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Destination Bank Account</span>
              </button>
            </div>
          )}

          {/* Inline Account Creation Form */}
          {isCreatingAccount ? (
            <form onSubmit={handleInlineCreateAccount} className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200/70">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Create Destination Bank Account</span>
                </div>
                {hasMultipleAccounts && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingAccount(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Bank Name (e.g. Commercial Bank of Ceylon) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Commercial Bank"
                    value={newBankName}
                    onChange={e => setNewBankName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Account Label *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CBC Main Current"
                      value={newAccName}
                      onChange={e => setNewAccName(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 8004921004"
                      value={newAccNumber}
                      onChange={e => setNewAccNumber(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Initial Opening Balance (LKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newOpeningBal}
                    onChange={e => setNewOpeningBal(e.target.value)}
                    className="w-full text-xs font-mono font-bold px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-1 flex items-center justify-end gap-2">
                {hasMultipleAccounts && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingAccount(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Back to Selection
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isCreatingLoading}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-900/20 disabled:opacity-50 cursor-pointer"
                >
                  {isCreatingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Save Account & Use for Transfer</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quick Preset Buttons */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quick Transfer Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('cash_to_bank')}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-medium border border-slate-200 transition-colors text-center cursor-pointer"
                  >
                    💵 Cash → 🏦 Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('bank_to_cash')}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-medium border border-slate-200 transition-colors text-center cursor-pointer"
                  >
                    🏦 Bank → 💵 Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('bank_to_bank')}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-medium border border-slate-200 transition-colors text-center cursor-pointer"
                  >
                    🏦 Bank → 🏦 Bank
                  </button>
                </div>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Transfer Amount (LKR) *
                </label>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                    Rs.
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-lg font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* Transfer Flow Visual: From -> To */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                {/* From Account */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-rose-500" />
                    Transfer From (Source Account) *
                  </label>
                  <select
                    value={fromAccountId}
                    onChange={(e) => handleFromAccountChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold cursor-pointer"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.type.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Down arrow divider */}
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                </div>

                {/* To Account */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                      Transfer To (Destination Account) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCreatingAccount(true)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Create New Account</span>
                    </button>
                  </div>
                  <select
                    value={toAccountId}
                    onChange={(e) => handleToAccountChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold cursor-pointer"
                  >
                    {accounts.map((acc) => (
                      <option 
                        key={acc.id} 
                        value={acc.id} 
                        disabled={acc.id === fromAccountId}
                      >
                        {acc.name} ({acc.type.toUpperCase()}) {acc.id === fromAccountId ? '— (Same as Source Account)' : ''}
                      </option>
                    ))}
                    <option value="__create_new__" className="text-indigo-600 font-bold">
                      + Create New Destination Bank Account...
                    </option>
                  </select>
                </div>
              </div>

              {/* Date & Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    CDM / Slip / Ref #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CDM-44910 or Cheque #92"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Transfer Remarks / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Counter cash deposit to commercial bank"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Footer actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!hasMultipleAccounts || fromAccountId === toAccountId}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-indigo-950/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
