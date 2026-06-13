import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';

function App() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const location = useLocation();

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <div className="flex h-screen bg-amber-50 dark:bg-slate-950 overflow-hidden font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Sidebar isDark={isDark} toggleDark={() => setIsDark(!isDark)} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
      <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Dashboard currentMonth={currentMonth} />} />
            <Route path="/transactions" element={<Transactions currentMonth={currentMonth} />} />
            <Route path="/budgets" element={<Budgets currentMonth={currentMonth} />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Toaster position="bottom-right" toastOptions={{ style: { background: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#1e293b', borderRadius: '12px' } }} />
    </div>
  );
}

export default App;