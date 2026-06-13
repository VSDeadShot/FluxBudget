export interface Category {
  id: number;
  name: string;
  budget: number;
  type: 'income' | 'expense';
  allocationBucket?: 'Essentials' | 'Rewards' | 'Growth' | 'Stability' | 'None';
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  categoryId: number;
  categoryName?: string;
  amount: number;
  type: 'income' | 'expense';
}
