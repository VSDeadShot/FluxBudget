import { useEffect, useState } from 'react';
import { Trash2, Edit2, Search, ArrowUpDown, Ghost } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import type { Transaction, Category } from '../types';
import { getCategoryIcon } from '../utils/icons';

export default function Transactions({ currentMonth }: { currentMonth: string }) {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const [editingTxId, setEditingTxId] = useState<number | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCatId, setEditCatId] = useState('');
  const [editAmt, setEditAmt] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    if (!window.electronAPI) return;
    const [txData, catData] = await Promise.all([
      window.electronAPI.getTransactions(),
      window.electronAPI.getCategories(),
    ]);
    setAllTransactions(txData);
    setCategories(catData);
    if (catData.length > 0) setCategoryId(String(catData[0].id));
  }

  let processedTransactions = allTransactions.filter(tx => tx.date.startsWith(currentMonth));
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    processedTransactions = processedTransactions.filter(tx => 
      tx.description.toLowerCase().includes(q) || 
      (tx.categoryName && tx.categoryName.toLowerCase().includes(q)) ||
      tx.amount.toString().includes(q)
    );
  }
  
  processedTransactions.sort((a, b) => {
    if (sortField === 'amount') {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    } else {
      return sortOrder === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime() 
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!window.electronAPI) return;
    
    const selectedCat = categories.find(c => c.id === Number(categoryId));
    if (!selectedCat) {
      toast.error("Please select a valid category!");
      return;
    }

    await window.electronAPI.addTransaction({
      date,
      description,
      amount: parseFloat(amount),
      categoryId: Number(categoryId),
      type: selectedCat.type,
    });
    
    setDescription('');
    setAmount('');
    toast.success('Transaction added!');
    loadData();
  }

  async function handleDelete(id: number) {
    if (!window.electronAPI) return;
    if (confirm('Are you sure you want to delete this transaction?')) {
      await window.electronAPI.deleteTransaction(id);
      toast.success('Transaction deleted!');
      loadData();
    }
  }

  function startEdit(tx: Transaction) {
    setEditingTxId(tx.id);
    setEditDate(tx.date);
    setEditDesc(tx.description);
    setEditCatId(String(tx.categoryId));
    setEditAmt(String(tx.amount));
  }

  async function saveEdit(id: number) {
    if (!window.electronAPI) return;
    const selectedCat = categories.find(c => c.id === Number(editCatId));
    if (!selectedCat) return;
    
    await window.electronAPI.updateTransaction({
      id,
      date: editDate,
      description: editDesc,
      amount: parseFloat(editAmt),
      categoryId: Number(editCatId),
      type: selectedCat.type
    });
    setEditingTxId(null);
    toast.success('Transaction updated!');
    loadData();
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-5xl mx-auto pb-12 transition-colors duration-300"
    >
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors">Transactions</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-10 transition-colors">Log your expenses and income.</p>
      
      <motion.div whileHover={{ scale: 1.002 }} className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-white/50 dark:border-white/5 p-8 mb-10 transition-colors flex flex-col">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Add New Transaction</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-slate-600 border p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <input type="text" required placeholder="e.g. Morning Coffee" value={description} onChange={e => setDescription(e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-slate-600 border p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
            <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-slate-600 border p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white">
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount (Rs)</label>
            <div className="flex gap-2">
              <input type="number" step="0.01" min="0" required placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full rounded-xl border-gray-200 dark:border-slate-600 border p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white" />
              <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none">Add</button>
            </div>
          </div>
        </form>
      </motion.div>

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>
      </div>

      <motion.div whileHover={{ scale: 1.002 }} className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-white/50 dark:border-white/5 overflow-hidden transition-colors">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-black/20 border-b border-gray-200/50 dark:border-white/5 backdrop-blur-sm">
              <th className="p-6 font-medium text-gray-600 dark:text-gray-400">
                <button onClick={() => { setSortField('date'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }} className="flex items-center gap-2 hover:text-gray-600 transition-colors">
                  Date <ArrowUpDown size={14} className={sortField === 'date' ? 'text-gray-500' : 'text-gray-300'} />
                </button>
              </th>
              <th className="p-6 font-medium text-gray-600 dark:text-gray-400">Description</th>
              <th className="p-6 font-medium text-gray-600 dark:text-gray-400">Category</th>
              <th className="p-6 font-medium text-gray-600 dark:text-gray-400 text-right">
                <button onClick={() => { setSortField('amount'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }} className="flex items-center gap-2 justify-end w-full hover:text-gray-600 transition-colors">
                  Amount (Rs) <ArrowUpDown size={14} className={sortField === 'amount' ? 'text-gray-500' : 'text-gray-300'} />
                </button>
              </th>
              <th className="p-6 font-medium text-gray-600 dark:text-gray-400 text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {processedTransactions.map(tx => editingTxId === tx.id ? (
              <tr key={tx.id} className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/30">
                <td className="p-4"><input type="date" value={editDate} onChange={e=>setEditDate(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:text-white text-sm"/></td>
                <td className="p-4"><input type="text" value={editDesc} onChange={e=>setEditDesc(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:text-white text-sm"/></td>
                <td className="p-4">
                  <select value={editCatId} onChange={e=>setEditCatId(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:text-white text-sm">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </td>
                <td className="p-4"><input type="number" step="0.01" min="0" value={editAmt} onChange={e=>setEditAmt(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:text-white text-sm text-right"/></td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => saveEdit(tx.id)} className="text-sm bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 font-medium">Save</button>
                    <button onClick={() => setEditingTxId(null)} className="text-sm bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 font-medium">Cancel</button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={tx.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-6 text-gray-600 dark:text-gray-400">{tx.date}</td>
                <td className="p-6 text-gray-900 dark:text-gray-200 font-medium">{tx.description}</td>
                <td className="p-6">
                  {(() => {
                    const Icon = getCategoryIcon(tx.categoryName || '');
                    return (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-300 tracking-wide">
                        <Icon size={14} className="text-gray-500 dark:text-gray-400" />
                        {tx.categoryName}
                      </span>
                    );
                  })()}
                </td>
                <td className={`p-6 text-right font-bold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {tx.type === 'income' ? '+' : '-'} {tx.amount.toFixed(2)}
                </td>
                <td className="p-6 text-center">
                  <div className="flex justify-center gap-1">
                    <button 
                      onClick={() => startEdit(tx)}
                      className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500/10 rounded-xl transition-colors"
                      title="Edit Transaction"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(tx.id)}
                      className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                      title="Delete Transaction"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {processedTransactions.length === 0 && (
              <tr>
                <td colSpan={5} className="p-16 text-center">
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                      <Ghost size={48} className="text-gray-300 dark:text-slate-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-700 dark:text-gray-300">It's quiet here...</p>
                      <p className="text-gray-400 dark:text-gray-500 mt-1">No transactions found for this period.</p>
                    </div>
                  </motion.div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}
