import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import type { Category, Transaction } from '../types';

export default function Budgets({ currentMonth }: { currentMonth: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [editCatName, setEditCatName] = useState<string>('');

  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');
  const [newCatBucket, setNewCatBucket] = useState<'Essentials' | 'Rewards' | 'Growth' | 'Stability' | 'None'>('Essentials');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    if (!window.electronAPI) return;
    const [catData, txData] = await Promise.all([
      window.electronAPI.getCategories(),
      window.electronAPI.getTransactions()
    ]);
    setCategories(catData.filter(c => c.type === 'expense'));
    setAllTransactions(txData);
  }

  const transactions = allTransactions.filter(tx => tx.date.startsWith(currentMonth));

  async function handleSaveBudget(id: number) {
    if (!window.electronAPI) return;
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    
    await window.electronAPI.updateCategory({
      ...cat,
      name: editCatName.trim() || cat.name,
      budget: parseFloat(editAmount)
    });
    toast.success('Budget updated!');
    setEditingId(null);
    loadData();
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!window.electronAPI || !newCatName.trim()) return;
    await window.electronAPI.addCategory(newCatName.trim(), 0, newCatType, newCatBucket);
    toast.success('Category added!');
    setNewCatName('');
    loadData();
  }

  async function handleDeleteCategory(id: number) {
    if (!window.electronAPI) return;
    if (confirm('Are you sure you want to delete this category? All related transactions will also be deleted.')) {
      await window.electronAPI.deleteCategory(id);
      toast.success('Category deleted!');
      loadData();
    }
  }

  function getSpent(categoryId: number) {
    return transactions
      .filter(tx => tx.categoryId === categoryId && tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-6xl mx-auto pb-12 transition-colors duration-300"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors">Budgets & Categories</h1>
          <p className="text-gray-500 dark:text-gray-400 transition-colors">Manage your spending limits and create custom tracking categories.</p>
        </div>
      </div>

      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-white/50 dark:border-white/5 p-8 mb-10 transition-colors flex flex-col">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Create New Category</h2>
        <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category Name</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Subscriptions, Gaming" 
              value={newCatName} 
              onChange={e => setNewCatName(e.target.value)} 
              className="w-full rounded-xl border-gray-200 dark:border-slate-600 border p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white" 
            />
          </div>
          <div className="w-full md:w-32">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
            <select 
              value={newCatType} 
              onChange={e => setNewCatType(e.target.value as 'expense' | 'income')} 
              className="w-full rounded-xl border-gray-200 dark:border-slate-600 border p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          {newCatType === 'expense' && (
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allocation Bucket</label>
              <select 
                value={newCatBucket} 
                onChange={e => setNewCatBucket(e.target.value as any)} 
                className="w-full rounded-xl border-gray-200 dark:border-slate-600 border p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="Essentials">Essentials</option>
                <option value="Rewards">Rewards</option>
                <option value="Growth">Growth</option>
                <option value="Stability">Stability</option>
                <option value="None">None</option>
              </select>
            </div>
          )}
          <button type="submit" className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none">
            Add Category
          </button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map(cat => {
          const spent = getSpent(cat.id);
          const remaining = cat.budget - spent;
          const percentage = cat.budget > 0 ? Math.min((spent / cat.budget) * 100, 100) : 0;
          const isOver = remaining < 0;

          return (
            <div key={cat.id} className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-white/50 dark:border-white/5 p-8 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(59,130,246,0.1)] transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                {editingId === cat.id ? (
                  <div className="flex gap-2 items-center flex-1 mr-4">
                    <input 
                      type="text" 
                      value={editCatName} 
                      onChange={e => setEditCatName(e.target.value)}
                      className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white"
                      placeholder="Category Name"
                    />
                    <input 
                      type="number" 
                      value={editAmount} 
                      onChange={e => setEditAmount(e.target.value)}
                      className="w-24 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white"
                      placeholder="Budget"
                    />
                    <button onClick={() => handleSaveBudget(cat.id)} className="text-sm bg-emerald-500 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors font-medium">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-sm bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-gray-200 px-4 py-1.5 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors font-medium">Cancel</button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{cat.name}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingId(cat.id); setEditAmount(String(cat.budget)); setEditCatName(cat.name); }} className="text-sm bg-gray-50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900/50 px-4 py-1.5 rounded-lg font-medium transition-colors">Edit</button>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)} 
                        className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              <div className="mb-3 flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Spent: <span className="text-gray-900 dark:text-gray-200">Rs {spent.toFixed(2)}</span></span>
                <span className="text-gray-500 dark:text-gray-400 font-medium">Budget: <span className="text-gray-900 dark:text-gray-200">Rs {cat.budget.toFixed(2)}</span></span>
              </div>
              
              <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-3 mb-4 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ease-out ${isOver ? 'bg-rose-500' : 'bg-gradient-to-r from-gray-500 to-gray-500'}`} style={{ width: `${percentage}%` }}></div>
              </div>
              
              <div className={`text-sm font-bold ${isOver ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {isOver ? `Over Budget by Rs ${Math.abs(remaining).toFixed(2)}` : `Rs ${remaining.toFixed(2)} Remaining`}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
