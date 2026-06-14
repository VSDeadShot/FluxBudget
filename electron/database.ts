import path from 'path';
import { app } from 'electron';
import fs from 'fs';

const dbDir = path.join(app.getPath('userData'), 'finance_data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.join(dbDir, 'budget_app.json');

interface Category {
  id: number;
  name: string;
  budget: number;
  type: string;
  allocationBucket?: string;
}

interface Transaction {
  id: number;
  date: string;
  description: string;
  categoryId: number;
  amount: number;
  type: string;
}

interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color?: string;
}

interface DBData {
  categories: Category[];
  transactions: Transaction[];
  goals: Goal[];
}

function readDB(): DBData {
  if (!fs.existsSync(dbPath)) {
    return { categories: [], transactions: [], goals: [] };
  }
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  
  if (!data.goals) data.goals = [];
  
  // Cleanup script: Remove auto-generated categories to declutter the user's DB
  const badCats = ['Growth', 'Rewards', 'Stability', 'Essentials'];
  data.categories = data.categories.filter((c: Category) => !badCats.includes(c.name));
  
  // Migration: Assign allocation buckets to existing categories if missing
  data.categories = data.categories.map((c: Category) => {
    if (!c.allocationBucket) {
      if (c.type === 'income') c.allocationBucket = 'None';
      else if (['Groceries', 'Transport', 'Utilities', 'Rent', 'Food'].includes(c.name)) c.allocationBucket = 'Essentials';
      else c.allocationBucket = 'Rewards'; // default fallback
    }
    return c;
  });
  
  return data;
}

function writeDB(data: DBData) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

export function initDB() {
  const data = readDB();
  if (data.categories.length === 0) {
    data.categories = [
      { id: 1, name: 'Coffee', budget: 500, type: 'expense', allocationBucket: 'Rewards' },
      { id: 2, name: 'Groceries', budget: 3000, type: 'expense', allocationBucket: 'Essentials' },
      { id: 3, name: 'Transport', budget: 1500, type: 'expense', allocationBucket: 'Essentials' },
      { id: 4, name: 'Utilities', budget: 2000, type: 'expense', allocationBucket: 'Essentials' },
      { id: 5, name: 'Entertainment', budget: 1000, type: 'expense', allocationBucket: 'Rewards' },
      { id: 6, name: 'Miscellaneous', budget: 500, type: 'expense', allocationBucket: 'Rewards' },
      { id: 7, name: 'Salary', budget: 0, type: 'income', allocationBucket: 'None' }
    ];
    writeDB(data);
  } else {
    // Force write back the migration
    writeDB(data);
  }
}

export function addCategory(name: string, budget: number, type: string, allocationBucket: string = 'None') {
  const data = readDB();
  const newId = data.categories.length > 0 ? Math.max(...data.categories.map(c => c.id)) + 1 : 1;
  data.categories.push({ id: newId, name, budget, type, allocationBucket });
  writeDB(data);
  return newId;
}

export function getCategories() {
  return readDB().categories;
}

export function getTransactions() {
  const data = readDB();
  const txs = data.transactions.map(tx => {
    const cat = data.categories.find(c => c.id === tx.categoryId);
    return { ...tx, categoryName: cat ? cat.name : 'Unknown' };
  });
  return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function addTransaction(transaction: any) {
  const data = readDB();
  const newId = data.transactions.length > 0 ? Math.max(...data.transactions.map(t => t.id)) + 1 : 1;
  const newTx = { ...transaction, id: newId };
  data.transactions.push(newTx);
  writeDB(data);
  return newId;
}

export function updateBudget(categoryId: number, budget: number) {
  const data = readDB();
  const catIndex = data.categories.findIndex(c => c.id === categoryId);
  if (catIndex !== -1) {
    data.categories[catIndex].budget = budget;
    writeDB(data);
  }
}

export function deleteTransaction(id: number) {
  const data = readDB();
  data.transactions = data.transactions.filter(t => t.id !== id);
  writeDB(data);
}

export function deleteCategory(id: number) {
  const data = readDB();
  data.categories = data.categories.filter(c => c.id !== id);
  data.transactions = data.transactions.filter(t => t.categoryId !== id);
  writeDB(data);
}

export function updateTransaction(tx: any) {
  const data = readDB();
  const index = data.transactions.findIndex(t => t.id === tx.id);
  if (index !== -1) {
    data.transactions[index] = tx;
    writeDB(data);
  }
}

export function updateCategory(cat: any) {
  const data = readDB();
  const index = data.categories.findIndex(c => c.id === cat.id);
  if (index !== -1) {
    data.categories[index] = cat;
    writeDB(data);
  }
}

export function getGoals() {
  return readDB().goals;
}

export function addGoal(name: string, targetAmount: number, color: string, deadline: string) {
  const data = readDB();
  const newId = data.goals.length > 0 ? Math.max(...data.goals.map((g: Goal) => g.id)) + 1 : 1;
  data.goals.push({ id: newId, name, targetAmount, currentAmount: 0, color, deadline });
  writeDB(data);
  return newId;
}

export function updateGoal(id: number, currentAmount: number) {
  const data = readDB();
  const index = data.goals.findIndex((g: Goal) => g.id === id);
  if (index !== -1) {
    data.goals[index].currentAmount = currentAmount;
    writeDB(data);
  }
}

export function deleteGoal(id: number) {
  const data = readDB();
  data.goals = data.goals.filter((g: Goal) => g.id !== id);
  writeDB(data);
}

export function generateCSV(): string {
  const data = readDB();
  const header = "ID,Date,Description,Category,Type,Amount\n";
  const rows = data.transactions.map(tx => {
    const cat = data.categories.find(c => c.id === tx.categoryId);
    const catName = cat ? cat.name : 'Unknown';
    const desc = `"${tx.description.replace(/"/g, '""')}"`;
    return `${tx.id},${tx.date},${desc},${catName},${tx.type},${tx.amount}`;
  });
  return header + rows.join('\n');
}

export function importCSV(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length <= 1) return false;

    const data = readDB();
    const headerRow = lines[0].toLowerCase();
    
    // Quick heuristic: if it has "ID" it's probably our own exported CSV.
    // Let's just find column indexes for resilience
    const cols = headerRow.split(',');
    const idIdx = cols.findIndex(c => c.includes('id'));
    const dateIdx = cols.findIndex(c => c.includes('date'));
    const descIdx = cols.findIndex(c => c.includes('description') || c.includes('desc'));
    const catIdx = cols.findIndex(c => c.includes('category'));
    const typeIdx = cols.findIndex(c => c.includes('type'));
    const amtIdx = cols.findIndex(c => c.includes('amount'));

    if (dateIdx === -1 || descIdx === -1 || amtIdx === -1) return false; // Invalid CSV

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      // Splitting by comma but respecting quotes
      const rowCols = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || row.split(',');
      const cleanCols = rowCols.map(c => c.replace(/(^"|"$)/g, ''));

      const dateStr = cleanCols[dateIdx];
      const descStr = cleanCols[descIdx];
      const amountVal = parseFloat(cleanCols[amtIdx]);
      if (isNaN(amountVal)) continue;

      let catName = catIdx !== -1 && cleanCols[catIdx] ? cleanCols[catIdx] : 'Miscellaneous';
      let typeStr = typeIdx !== -1 && cleanCols[typeIdx] ? cleanCols[typeIdx].toLowerCase() : 'expense';

      // Ensure category exists
      let cat = data.categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
      if (!cat) {
        const newCatId = data.categories.length > 0 ? Math.max(...data.categories.map(c => c.id)) + 1 : 1;
        cat = { id: newCatId, name: catName, budget: 0, type: typeStr, allocationBucket: 'None' };
        data.categories.push(cat);
      }

      // Ensure transaction doesn't perfectly duplicate by ID (if it's our own export)
      let skip = false;
      if (idIdx !== -1 && cleanCols[idIdx]) {
        const existingTx = data.transactions.find(t => t.id === parseInt(cleanCols[idIdx]));
        if (existingTx) skip = true;
      }

      if (!skip) {
        const newTxId = data.transactions.length > 0 ? Math.max(...data.transactions.map(t => t.id)) + 1 : 1;
        data.transactions.push({
          id: newTxId,
          date: dateStr,
          description: descStr,
          categoryId: cat.id,
          amount: amountVal,
          type: cat.type // Inherit from the category
        });
      }
    }

    writeDB(data);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}
