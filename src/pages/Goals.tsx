import { useEffect, useState } from 'react';
import { Target, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Goal } from '../types';

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [addFundsId, setAddFundsId] = useState<number | null>(null);
  const [addFundsAmount, setAddFundsAmount] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    if (!window.electronAPI) return;
    const data = await window.electronAPI.getGoals();
    setGoals(data);
  }

  async function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!window.electronAPI || !newGoalName.trim() || !newGoalTarget) return;
    await window.electronAPI.addGoal(newGoalName.trim(), parseFloat(newGoalTarget), '#3b82f6', '');
    toast.success('Goal created!');
    setNewGoalName('');
    setNewGoalTarget('');
    loadGoals();
  }

  async function handleDeleteGoal(id: number) {
    if (!window.electronAPI) return;
    if (confirm('Are you sure you want to delete this goal?')) {
      await window.electronAPI.deleteGoal(id);
      toast.success('Goal deleted!');
      loadGoals();
    }
  }

  async function handleAddFunds(id: number, currentAmount: number) {
    if (!window.electronAPI || !addFundsAmount) return;
    const amount = parseFloat(addFundsAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    await window.electronAPI.updateGoal(id, currentAmount + amount);
    toast.success('Funds added to goal!');
    setAddFundsId(null);
    setAddFundsAmount('');
    loadGoals();
  }

  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalRemaining = Math.max(0, totalTarget - totalSaved);
  
  const chartData = [
    { name: 'Total Saved', value: totalSaved, color: '#10b981' },
    { name: 'Remaining Target', value: totalRemaining, color: '#374151' }
  ];

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
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors">Savings Goals</h1>
          <p className="text-gray-500 dark:text-gray-400 transition-colors">Track your progress towards big purchases and emergency funds.</p>
        </div>
      </div>

      {goals.length > 0 && (
        <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-white/50 dark:border-white/5 p-8 mb-10 transition-colors flex flex-col md:flex-row items-center gap-8">
          <div className="h-48 w-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `Rs ${Number(value).toFixed(2)}`}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase">Saved</span>
              <span className="text-xl font-extrabold text-gray-900 dark:text-white">{totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Overall Progress</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">You have saved a total of <span className="text-emerald-500 dark:text-emerald-400 font-bold">Rs {totalSaved.toFixed(2)}</span> out of your <span className="text-gray-900 dark:text-white font-bold">Rs {totalTarget.toFixed(2)}</span> combined targets.</p>
            <div className="flex gap-6">
              <div className="bg-gray-100 dark:bg-black/30 px-6 py-4 rounded-2xl border border-gray-200 dark:border-white/5">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase mb-1">Total Saved</p>
                <p className="text-2xl font-extrabold text-emerald-500 dark:text-emerald-400">Rs {totalSaved.toFixed(2)}</p>
              </div>
              <div className="bg-gray-100 dark:bg-black/30 px-6 py-4 rounded-2xl border border-gray-200 dark:border-white/5">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase mb-1">Remaining</p>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">Rs {totalRemaining.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-white/50 dark:border-white/5 p-8 mb-10 transition-colors flex flex-col">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-500" />
          Create New Goal
        </h2>
        <form onSubmit={handleCreateGoal} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold tracking-wider text-gray-700 dark:text-gray-400 uppercase mb-2">Goal Name</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Vacation Fund" 
              value={newGoalName} 
              onChange={e => setNewGoalName(e.target.value)} 
              className="w-full rounded-2xl border-gray-200 dark:border-white/10 border p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 dark:bg-black/30 focus:bg-white dark:focus:bg-black/50 text-gray-900 dark:text-white" 
            />
          </div>
          <div className="w-full md:w-64">
            <label className="block text-sm font-bold tracking-wider text-gray-700 dark:text-gray-400 uppercase mb-2">Target Amount (Rs)</label>
            <input 
              type="number" 
              required 
              placeholder="100000" 
              value={newGoalTarget} 
              onChange={e => setNewGoalTarget(e.target.value)} 
              className="w-full rounded-2xl border-gray-200 dark:border-white/10 border p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 dark:bg-black/30 focus:bg-white dark:focus:bg-black/50 text-gray-900 dark:text-white" 
            />
          </div>
          <button type="submit" className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-500 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            Create Goal
          </button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {goals.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white/70 dark:bg-slate-900/40 rounded-[32px] border border-white/50 dark:border-white/5">
            You don't have any active savings goals. Create one above!
          </div>
        ) : goals.map(goal => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const isComplete = goal.currentAmount >= goal.targetAmount;

          return (
            <div key={goal.id} className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-white/50 dark:border-white/5 p-8 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(59,130,246,0.1)] transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{goal.name}</h3>
                <button 
                  onClick={() => handleDeleteGoal(goal.id)} 
                  className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                  title="Delete Goal"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="mb-4 flex justify-between items-end">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 font-bold text-sm tracking-widest uppercase mb-1">Saved</p>
                  <p className="text-3xl font-extrabold text-gray-900 dark:text-white">Rs {goal.currentAmount.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 dark:text-gray-400 font-bold text-xs tracking-widest uppercase mb-1">Target</p>
                  <p className="text-lg font-bold text-gray-500 dark:text-gray-300">Rs {goal.targetAmount.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-4 mb-4 overflow-hidden border border-gray-200 dark:border-slate-700/50">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isComplete ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]'}`} 
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', animation: 'shimmer 2s infinite' }}></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className={`text-sm font-bold ${isComplete ? 'text-emerald-500' : 'text-blue-500'}`}>
                  {progress.toFixed(1)}% Complete {isComplete && '🎉'}
                </div>
                
                {addFundsId === goal.id ? (
                  <div className="flex gap-2 items-center">
                    <input 
                      type="number" 
                      placeholder="Amount" 
                      value={addFundsAmount}
                      onChange={e => setAddFundsAmount(e.target.value)}
                      className="w-24 rounded-lg border-gray-200 dark:border-white/10 border p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-black/50 text-gray-900 dark:text-white"
                      autoFocus
                    />
                    <button onClick={() => handleAddFunds(goal.id, goal.currentAmount)} className="bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-colors">Add</button>
                    <button onClick={() => setAddFundsId(null)} className="bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">X</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setAddFundsId(goal.id)}
                    className="flex items-center gap-1 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-xl"
                  >
                    <Plus size={16} /> Add Funds
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
