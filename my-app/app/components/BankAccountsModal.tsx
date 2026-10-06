'use client';

import React, { useState } from 'react';
import { X, Building2, Plus, Wallet, Edit3, Trash2, Check, Landmark, Loader2 } from 'lucide-react';
import { BankAccount } from '../types/finance';
import { formatLKR } from '../lib/financeStore';

interface BankAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  onAddAccount: (account: Partial<BankAccount>) => Promise<void>;
  onUpdateAccount: (id: string, account: Partial<BankAccount>) => Promise<void>;
  onDeleteAccount: (id: string) => Promise<void>;
}

export const BankAccountsModal: React.FC<BankAccountsModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accName, setAccName] = useState('');
  const [accNumber, setAccNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [editingAccId, setEditingAccId] = useState<string | null>(null);
  const [editOpeningBal, setEditOpeningBal] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBal = parseFloat(openingBalance) || 0;
    if (!accName.trim()) {
      alert('Please enter an account name');
      return;
    }

    try {
      setLoading(true);
      await onAddAccount({
        name: accName.trim(),
        bankName: bankName.trim() || undefined,
        accountNumber: accNumber.trim() || undefined,
        branch: branch.trim() || undefined,
        type: 'bank',
        openingBalance: parsedBal,
        color: '#3b82f6',
      });
      setIsAdding(false);
      setBankName('');
      setAccName('');
      setAccNumber('');
      setBranch('');
      setOpeningBalance('');
    } catch (err: any) {
      alert(err.message || 'Failed to add account');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOpeningBalance = async (id: string) => {
    const val = parseFloat(editOpeningBal);
    if (isNaN(val)) return;

    try {
      setLoading(true);
      await onUpdateAccount(id, { openingBalance: val });
      setEditingAccId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update balance');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const acc = accounts.find(a => a.id === id);
    if (acc?.isDefault || acc?.type === 'cash') {
      alert('Primary cash drawer cannot be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to delete bank account "${acc?.name}"?`)) return;
    try {
      setLoading(true);
      await onDeleteAccount(id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 px-4 sm:px-6 py-3.5 sm:py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Bank Accounts & Cash Drawer</h3>
              <p className="text-[10px] sm:text-xs text-slate-400">Database connected accounts & balances</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
          {/* Account List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Accounts ({accounts.length})
              </span>
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Bank Account</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {accounts.map(acc => (
                <div
                  key={acc.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        acc.type === 'cash'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {acc.type === 'cash' ? <Wallet className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">{acc.name}</span>
                        {acc.isDefault && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {acc.bankName ? `${acc.bankName} • ` : ''}
                        {acc.accountNumber ? `Acc: ${acc.accountNumber}` : 'Physical Register'}
                        {acc.branch ? ` (${acc.branch})` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {editingAccId === acc.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={editOpeningBal}
                          onChange={e => setEditOpeningBal(e.target.value)}
                          placeholder="Opening"
                          className="w-24 px-2 py-1 text-xs font-mono font-bold bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleSaveOpeningBalance(acc.id)}
                          disabled={loading}
                          className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingAccId(null)}
                          className="p-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="text-xs text-slate-400">
                          Opening:{' '}
                          <span className="font-semibold text-slate-600 font-mono">
                            {formatLKR(acc.openingBalance)}
                          </span>
                        </div>
                        <div className="font-bold text-sm text-slate-900 font-mono">
                          {formatLKR(acc.currentBalance)}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingAccId(acc.id);
                          setEditOpeningBal(String(acc.openingBalance));
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                        title="Edit Opening Balance"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {!acc.isDefault && acc.type !== 'cash' && (
                        <button
                          onClick={() => handleDelete(acc.id)}
                          disabled={loading}
                          className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Bank Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Account Form */}
          {isAdding && (
            <form onSubmit={handleAddAccount} className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-blue-200/60">
                <span className="text-xs font-bold text-blue-900">Add New Commercial Bank Account</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Bank Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Commercial Bank of Ceylon"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Account Display Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CBC Current Main"
                    value={accName}
                    onChange={e => setAccName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Account Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 8004921004"
                    value={accNumber}
                    onChange={e => setAccNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Branch</label>
                  <input
                    type="text"
                    placeholder="e.g. Colombo 03"
                    value={branch}
                    onChange={e => setBranch(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Opening Balance (LKR)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={openingBalance}
                    onChange={e => setOpeningBalance(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-900/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Save Account to Database</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
