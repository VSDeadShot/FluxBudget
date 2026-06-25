import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import AnimatedNumber from '../components/AnimatedNumber';
import { getCategoryIcon } from '../utils/icons';
import type { Category, Transaction } from '../types';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e', '#ef4444', '#8b5cf6', '#6366f1'];

export default function Dashboard({ currentMonth }: { currentMonth: string }) {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterBucket, setFilterBucket] = useState<string>('All');

  useEffect(() => {
    async function loadData() {
      if (!window.electronAPI) return;
      const [txData, catData] = await Promise.all([
        window.electronAPI.getTransactions(),
        window.electronAPI.getCategories()
      ]);
      setAllTransactions(txData);
      setCategories(catData);
    }
    loadData();
    loadData();
  }, []);

  const transactions = allTransactions.filter(tx => tx.date.startsWith(currentMonth));

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const expenseData = categories
    .filter(c => c.type === 'expense')
    .map(c => ({
      name: c.name,
      value: transactions.filter(t => t.categoryId === c.id).reduce((acc, t) => acc + t.amount, 0)
    }))
    .filter(d => d.value > 0);

  // Dynamic Bucket Calculations
  function getSpentByBucket(bucket: string) {
    const catIds = categories.filter(c => c.allocationBucket === bucket).map(c => c.id);
    return transactions.filter(t => catIds.includes(t.categoryId)).reduce((sum, t) => sum + t.amount, 0);
  }

  const spentEssentials = getSpentByBucket('Essentials');
  const spentRewards = getSpentByBucket('Rewards');
  const spentGrowth = getSpentByBucket('Growth');
  const spentStability = getSpentByBucket('Stability');

  const budgetEssentials = totalIncome * 0.5;
  const budgetRewards = totalIncome * 0.1;
  const budgetGrowth = totalIncome * 0.25;
  const budgetStability = totalIncome * 0.15;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-6xl mx-auto pb-12"
    >
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors">Dashboard</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-10 transition-colors">Welcome back! Here's your financial overview.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(140px,_auto)]">
        
        {/* Row 1: Top Metrics */}
        <motion.div whileHover={{ scale: 1.02 }} className="md:col-span-4 bg-slate-900 dark:bg-[#0a0a0a] p-8 rounded-[32px] shadow-[0_0_30px_rgba(59,130,246,0.15)] border border-blue-500/30 relative overflow-hidden text-white transition-all flex flex-col justify-center">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-500 opacity-20 rounded-full blur-3xl"></div>
          <p className="text-blue-200/80 font-medium mb-2 relative z-10 text-sm tracking-wide uppercase">Total Balance</p>
          <p className="text-5xl font-extrabold relative z-10 text-white tracking-tight">Rs <AnimatedNumber value={balance} /></p>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="md:col-span-4 bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[32px] border border-white/50 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-bold text-xs tracking-widest uppercase">Total Income</p>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Rs <AnimatedNumber value={totalIncome} /></p>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="md:col-span-4 bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[32px] border border-white/50 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-rose-100 dark:bg-rose-500/10 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-bold text-xs tracking-widest uppercase">Total Expenses</p>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Rs <AnimatedNumber value={totalExpense} /></p>
        </motion.div>

        {/* Row 2/3: Complex Layout */}
        <motion.div whileHover={{ scale: 1.005 }} className="md:col-span-7 md:row-span-2 bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[32px] border border-white/50 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6 uppercase tracking-wider text-sm">Income Allocation Model</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            <div className="bg-emerald-50/50 dark:bg-emerald-500/5 p-6 rounded-[24px] border border-emerald-100/50 dark:border-emerald-500/10 flex flex-col justify-center">
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold mb-1 text-sm tracking-wide uppercase">Safe to Spend (60%)</p>
              <p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300 mb-6">Rs {((budgetEssentials + budgetRewards) - (spentEssentials + spentRewards)).toFixed(2)}</p>
              <div className="space-y-3 text-sm text-emerald-800 dark:text-emerald-200/70">
                <div className="flex justify-between items-center bg-white/40 dark:bg-black/20 p-3 rounded-xl">
                  <span className="font-medium">Essentials (50%)</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Rs {(budgetEssentials - spentEssentials).toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center bg-white/40 dark:bg-black/20 p-3 rounded-xl">
                  <span className="font-medium">Rewards (10%)</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Rs {(budgetRewards - spentRewards).toFixed(0)}</span>
                </div>
              </div>
            </div>
            <div className="bg-blue-50/50 dark:bg-blue-500/5 p-6 rounded-[24px] border border-blue-100/50 dark:border-blue-500/10 flex flex-col justify-center">
              <p className="text-blue-600 dark:text-blue-400 font-semibold mb-1 text-sm tracking-wide uppercase">Invest & Save (40%)</p>
              <p className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6">Rs {((budgetGrowth + budgetStability) - (spentGrowth + spentStability)).toFixed(2)}</p>
              <div className="space-y-3 text-sm text-gray-800 dark:text-gray-300">
                <div className="flex justify-between items-center bg-white/40 dark:bg-black/20 p-3 rounded-xl">
                  <span className="font-medium">Growth (25%)</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">Rs {(budgetGrowth - spentGrowth).toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center bg-white/40 dark:bg-black/20 p-3 rounded-xl">
                  <span className="font-medium">Stability (15%)</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">Rs {(budgetStability - spentStability).toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.005 }} className="md:col-span-5 md:row-span-2 bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[32px] border border-white/50 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 uppercase tracking-wider text-sm">Expenses by Category</h2>
          {expenseData.length > 0 ? (
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseData} cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" paddingAngle={5} dataKey="value" stroke="none" cornerRadius={12}>
                    {expenseData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: any) => `Rs ${Number(value).toFixed(2)}`} contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.9)', color: '#fff', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.5)', padding: '12px 20px', fontWeight: 600 }} itemStyle={{ color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col flex-1 items-center justify-center text-gray-400 pb-8">
              <p>No expenses logged.</p>
            </div>
          )}
        </motion.div>

        {/* Row 4: Wide Transaction List */}
        <motion.div whileHover={{ scale: 1.002 }} className="md:col-span-12 bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[32px] border border-white/50 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors flex flex-col mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider text-sm">Recent Transactions</h2>
            <div className="flex flex-wrap gap-2 p-1 bg-gray-100/50 dark:bg-black/30 rounded-2xl">
              {['All', 'Essentials', 'Rewards', 'Growth', 'Stability'].map(bucket => (
                <button key={bucket} onClick={() => setFilterBucket(bucket)} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${filterBucket === bucket ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                  {bucket}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(() => {
              const recentTx = transactions
                .filter(t => filterBucket === 'All' || categories.find(c => c.id === t.categoryId)?.allocationBucket === filterBucket)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 8);

              if (recentTx.length === 0) return <div className="col-span-full py-12 text-center text-gray-400">No transactions found.</div>;

              return recentTx.map(tx => {
                const Icon = getCategoryIcon(tx.categoryName || '');
                return (
                  <motion.div whileHover={{ scale: 1.01, y: -2 }} key={tx.id} className="flex items-center justify-between p-5 bg-white/40 dark:bg-slate-800/30 rounded-2xl border border-gray-100 dark:border-white/5 transition-all hover:bg-white/80 dark:hover:bg-slate-800/60">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300'}`}>
                        <Icon size={22} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{tx.description}</p>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{tx.date} • {tx.categoryName}</p>
                      </div>
                    </div>
                    <p className={`font-bold text-lg ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                      {tx.type === 'income' ? '+' : '-'} Rs {tx.amount.toFixed(2)}
                    </p>
                  </motion.div>
                );
              });
            })()}
          </div>
        </motion.div>

        {/* Row 5: Year in Review Heatmap */}
        <motion.div whileHover={{ scale: 1.002 }} className="md:col-span-12 bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[32px] border border-white/50 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors flex flex-col mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider text-sm">Year in Review Heatmap</h2>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span>Less</span>
              <div className="w-3.5 h-3.5 rounded-[3px] bg-slate-100 dark:bg-slate-800/50"></div>
              <div className="w-3.5 h-3.5 rounded-[3px] bg-blue-300 dark:bg-blue-500/40"></div>
              <div className="w-3.5 h-3.5 rounded-[3px] bg-blue-500 dark:bg-blue-600/70"></div>
              <div className="w-3.5 h-3.5 rounded-[3px] bg-blue-700 dark:bg-blue-500"></div>
              <span>More</span>
            </div>
          </div>
          
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="grid grid-rows-7 grid-flow-col gap-[4px] min-w-max">
              {(() => {
                const spendMap = new Map();
                allTransactions.filter(t => t.type === 'expense').forEach(t => {
                  spendMap.set(t.date, (spendMap.get(t.date) || 0) + t.amount);
                });
                
                const heatmapDays = Array.from({length: 364}, (_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (363 - i));
                  return d.toISOString().split('T')[0];
                });

                return heatmapDays.map(d => {
                  const spend = spendMap.get(d) || 0;
                  let colorClass = 'bg-slate-100 dark:bg-slate-800/50';
                  if (spend > 0) {
                    if (spend < 500) colorClass = 'bg-blue-300 dark:bg-blue-500/40';
                    else if (spend < 2000) colorClass = 'bg-blue-500 dark:bg-blue-600/70';
                    else colorClass = 'bg-blue-700 dark:bg-blue-500';
                  }
                  return (
                    <div 
                      key={d} 
                      title={`${d}: Rs ${spend.toFixed(2)}`} 
                      className={`w-3.5 h-3.5 rounded-[3px] ${colorClass} hover:ring-2 ring-blue-400 dark:ring-blue-300 transition-all cursor-pointer`}
                    ></div>
                  );
                });
              })()}
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}