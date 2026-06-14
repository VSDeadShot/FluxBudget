import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getCategories: () => ipcRenderer.invoke('get-categories'),
  getTransactions: () => ipcRenderer.invoke('get-transactions'),
  addTransaction: (tx: any) => ipcRenderer.invoke('add-transaction', tx),
  updateBudget: (id: number, budget: number) => ipcRenderer.invoke('update-budget', id, budget),
  addCategory: (name: string, budget: number, type: string, allocationBucket: string) => ipcRenderer.invoke('add-category', name, budget, type, allocationBucket),
  deleteTransaction: (id: number) => ipcRenderer.invoke('delete-transaction', id),
  deleteCategory: (id: number) => ipcRenderer.invoke('delete-category', id),
  updateTransaction: (tx: any) => ipcRenderer.invoke('update-transaction', tx),
  updateCategory: (cat: any) => ipcRenderer.invoke('update-category', cat),
  getGoals: () => ipcRenderer.invoke('get-goals'),
  addGoal: (name: string, targetAmount: number, color: string, deadline: string) => ipcRenderer.invoke('add-goal', name, targetAmount, color, deadline),
  updateGoal: (id: number, currentAmount: number) => ipcRenderer.invoke('update-goal', id, currentAmount),
  deleteGoal: (id: number) => ipcRenderer.invoke('delete-goal', id),
  exportData: () => ipcRenderer.invoke('export-data'),
  importData: () => ipcRenderer.invoke('import-data'),
});
