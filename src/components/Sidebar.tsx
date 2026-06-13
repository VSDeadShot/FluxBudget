import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Wallet, Moon, Sun, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Sidebar({ isDark, toggleDark, currentMonth, setCurrentMonth }: { isDark: boolean, toggleDark: () => void, currentMonth: string, setCurrentMonth: (m: string) => void }) {
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/transactions', icon: Receipt, label: 'Transactions' },
    { to: '/budgets', icon: Wallet, label: 'Budgets' },
  ];

  return (
    <div className="w-72 bg-transparent dark:bg-[#050505]/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-white/5 h-screen p-6 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none z-10 relative transition-colors duration-300">
      <div className="flex items-center space-x-3 mb-12 pl-2">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
          <Wallet className="w-6 h-6 text-white" />
        </div>
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
        <div className="px-4 mb-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Filter Month</label>
          <input 
            type="month" 
            value={currentMonth} 
            onChange={e => setCurrentMonth(e.target.value)}
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
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