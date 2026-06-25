import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Wallet, Moon, Sun, Download, Upload, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

import appIcon from '../assets/icon.png';

export default function Sidebar({ isDark, toggleDark, currentMonth, setCurrentMonth }: { isDark: boolean, toggleDark: () => void, currentMonth: string, setCurrentMonth: (m: string) => void }) {
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/transactions', icon: Receipt, label: 'Transactions' },
    { to: '/budgets', icon: Wallet, label: 'Budgets' },
    { to: '/goals', icon: Target, label: 'Savings Goals' },
  ];

  return (
    <div className="w-72 bg-transparent dark:bg-[#050505]/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-white/5 h-screen p-6 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none z-10 relative transition-colors duration-300">
      <div className="flex items-center space-x-3 mb-12 pl-2">
        <img src={appIcon} alt="FluxBudget Logo" className="w-10 h-10 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)] object-cover" />
        <div className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">FluxBudget</div>
      </div>
      
      <nav className="flex-1 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium ${
                isActive
                  ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md shadow-blue-200 dark:shadow-none scale-105'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800/80 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                <span>{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-200/50 dark:border-slate-800/50">
        <div className="px-4 mb-6">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 text-center">Time Machine</label>
          <div className="flex items-center gap-1.5">
            <button 
               onClick={() => {
                 const [y, m] = currentMonth.split('-');
                 const d = new Date(Number(y), Number(m) - 2);
                 setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
               }}
               className="p-2.5 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 transition-colors shadow-sm dark:shadow-none"
               title="Previous Month"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <input 
              type="month" 
              value={currentMonth} 
              onChange={e => setCurrentMonth(e.target.value)}
              className="flex-1 w-full min-w-0 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-2 py-2 text-sm text-center font-bold text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-inner dark:shadow-none"
            />
            <button 
               onClick={() => {
                 const [y, m] = currentMonth.split('-');
                 const d = new Date(Number(y), Number(m));
                 setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
               }}
               className="p-2.5 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 transition-colors shadow-sm dark:shadow-none"
               title="Next Month"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <div className="flex gap-2 mb-2">
          <button 
            onClick={async () => {
               if (window.electronAPI) {
                 const success = await window.electronAPI.importData();
                 if (success) {
                   toast.success('Data imported successfully!');
                   setTimeout(() => window.location.reload(), 1500);
                 } else {
                   toast.error('Failed to import data or action cancelled.');
                 }
               }
            }}
            className="flex flex-1 justify-center items-center space-x-2 px-3 py-3 rounded-xl transition-colors duration-200 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800/80 font-medium"
            title="Import Data"
          >
            <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm">Import</span>
          </button>
          <button 
            onClick={async () => {
               if (window.electronAPI) {
                 const success = await window.electronAPI.exportData();
                 if (success) toast.success('Data exported successfully!');
               }
            }}
            className="flex flex-1 justify-center items-center space-x-2 px-3 py-3 rounded-xl transition-colors duration-200 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800/80 font-medium"
            title="Export Data"
          >
            <Download className="w-5 h-5 text-emerald-400" />
            <span className="text-sm">Export</span>
          </button>
        </div>
        <button 
          onClick={toggleDark}
          className="flex w-full items-center space-x-3 px-4 py-3 rounded-xl transition-colors duration-200 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800/80 font-medium"
        >
          {isDark ? <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" /> : <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </div>
  );
}