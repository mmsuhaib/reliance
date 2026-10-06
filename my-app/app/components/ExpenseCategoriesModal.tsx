'use client';

import React, { useState } from 'react';
import { X, Layers, Plus, Trash2, Edit2, Check, Loader2 } from 'lucide-react';
import { ExpenseCategory } from '../types/finance';

interface ExpenseCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ExpenseCategory[];
  onAddCategory: (data: { name: string; color: string; description?: string }) => Promise<void>;
  onUpdateCategory: (id: string, data: { name: string; color: string }) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export const ExpenseCategoriesModal: React.FC<ExpenseCategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#ec4899');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const colorPalette = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
    '#10b981', '#06b6d4', '#3b82f6', '#6366f1', 
    '#8b5cf6', '#ec4899', '#f43f5e', '#64748b'
  ];

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      setLoading(true);
      await onAddCategory({
        name: newCatName.trim(),
        color: newCatColor,
        description: newCatDesc.trim() || undefined,
      });
      setNewCatName('');
      setNewCatDesc('');
    } catch (err: any) {
      alert(err.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const target = categories.find(c => c.id === id);
    if (target?.isSystem) {
      if (!confirm(`"${target.name}" is a system category. Are you sure you want to delete it?`)) {
        return;
      }
    } else {
      if (!confirm(`Delete category "${target?.name}"?`)) return;
    }
    try {
      setLoading(true);
      await onDeleteCategory(id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (cat: ExpenseCategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    try {
      setLoading(true);
      await onUpdateCategory(id, { name: editName.trim(), color: editColor });
      setEditingId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 px-4 sm:px-6 py-3.5 sm:py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Expense Categories</h3>
              <p className="text-[10px] sm:text-xs text-slate-400">Database connected expense classifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
          {/* Add New Category Form */}
          <form onSubmit={handleAddCategory} className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3">
            <span className="text-xs font-bold text-rose-900 block">Create New Expense Category</span>

            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Category Name (e.g. Ironing & Steaming)"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-900/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Add</span>
                </button>
              </div>

              <input
                type="text"
                placeholder="Optional short description / purpose"
                value={newCatDesc}
                onChange={e => setNewCatDesc(e.target.value)}
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
              />

              {/* Color picker */}
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                <span className="text-[10px] text-slate-500 font-medium mr-1">Tag Color:</span>
                {colorPalette.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCatColor(c)}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      newCatColor === c ? 'scale-125 ring-2 ring-slate-900 ring-offset-1' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </form>

          {/* List of categories */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Active Categories ({categories.length})
            </span>

            <div className="space-y-2">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                >
                  {editingId === cat.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1 border border-rose-300 rounded-lg focus:outline-none"
                      />
                      <div className="flex items-center gap-1">
                        {colorPalette.slice(0, 5).map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setEditColor(c)}
                            className={`w-4 h-4 rounded-full ${editColor === c ? 'ring-2 ring-slate-900' : ''}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => saveEdit(cat.id)}
                        disabled={loading}
                        className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-800">{cat.name}</span>
                            {cat.isSystem && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                                System
                              </span>
                            )}
                          </div>
                          {cat.description && (
                            <p className="text-[11px] text-slate-400 leading-tight">{cat.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                          title="Edit Category Name"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          disabled={loading}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
