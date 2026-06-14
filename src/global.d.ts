import { Category, Transaction, Goal } from './types';

declare global {
  interface Window {
    electronAPI: {
      getCategories: () => Promise<Category[]>;
      getTransactions: () => Promise<Transaction[]>;
      addTransaction: (tx: Omit<Transaction, 'id' | 'categoryName'>) => Promise<number>;
      updateBudget: (id: number, budget: number) => Promise<void>;
      addCategory: (name: string, budget: number, type: 'income'|'expense', allocationBucket: string) => Promise<number>;
      deleteTransaction: (id: number) => Promise<void>;
      deleteCategory: (id: number) => Promise<void>;
      updateTransaction: (tx: any) => Promise<void>;
      updateCategory: (cat: any) => Promise<void>;
      getGoals: () => Promise<Goal[]>;
      addGoal: (name: string, targetAmount: number, color: string, deadline: string) => Promise<number>;
      updateGoal: (id: number, currentAmount: number) => Promise<void>;
      deleteGoal: (id: number) => Promise<void>;
      exportData: () => Promise<boolean>;
      importData: () => Promise<boolean>;
    };
  }
}
