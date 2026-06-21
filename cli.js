#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Get database path exactly like Electron's app.getPath('userData')
const appDataPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + '/.local/share');
const dbPath = path.join(appDataPath, 'FluxBudget', 'finance_data', 'budget_app.json');

if (!fs.existsSync(dbPath)) {
  console.error('Database not found! Please open the FluxBudget desktop app at least once to initialize.');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

const args = process.argv.slice(2);
const command = args[0];

if (command === 'status') {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const txs = data.transactions.filter(t => t.date.startsWith(currentMonth));
  const income = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  
  console.log(`\n=== FluxBudget: ${currentMonth} ===`);
  console.log(`Income:   Rs ${income.toFixed(2)}`);
  console.log(`Expenses: Rs ${expense.toFixed(2)}`);
  console.log(`Balance:  Rs ${(income - expense).toFixed(2)}\n`);

} else if (command === 'log') {
  const amount = parseFloat(args[1]);
  const desc = args.slice(2).join(' ') || 'Terminal Entry';
  
  if (isNaN(amount) || amount <= 0) {
    console.error('Usage: fluxbudget log <amount> <description...>');
    console.error('Example: fluxbudget log 500 Coffee');
    process.exit(1);
  }

  // Smart Classifier for Category mapping (CLI version!)
  const name = desc.toLowerCase();
  let mappedBucket = 'Rewards'; // default
  if (['rent', 'grocery', 'groceries', 'food', 'transport', 'gas', 'fuel', 'utility', 'utilities', 'bill', 'water', 'electricity', 'health', 'medical', 'insurance', 'car'].some(k => name.includes(k))) {
    mappedBucket = 'Essentials';
  } else if (['stock', 'crypto', 'invest', 'savings', 'bond', 'mutual fund', 'growth', 'education', 'course', 'book', 'learn'].some(k => name.includes(k))) {
    mappedBucket = 'Growth';
  } else if (['emergency', 'debt', 'loan', 'credit', 'mortgage', 'stability', 'buffer', 'payoff'].some(k => name.includes(k))) {
    mappedBucket = 'Stability';
  }

  // Find a category that matches the bucket
  let category = data.categories.find(c => c.allocationBucket === mappedBucket && c.type === 'expense');
  if (!category) {
    // fallback to first expense category
    category = data.categories.find(c => c.type === 'expense') || data.categories[0];
  }

  const newTxId = data.transactions.length > 0 ? Math.max(...data.transactions.map(t => t.id)) + 1 : 1;
  const newTx = {
    id: newTxId,
    date: new Date().toISOString().split('T')[0],
    description: desc,
    categoryId: category.id,
    amount: amount,
    type: 'expense'
  };

  data.transactions.push(newTx);
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  
  console.log(`\n✅ Logged Rs ${amount} for "${desc}"`);
  console.log(`Categorized automatically as [${category.name}] (${mappedBucket})\n`);

} else {
  console.log(`
FluxBudget CLI
--------------
Usage:
  fluxbudget status                     - View current month's income, expenses, and balance
  fluxbudget log <amount> <description> - Log an expense instantly (auto-categorized!)
  
Example:
  fluxbudget log 250 Spotify Subscription
  fluxbudget log 1500 Groceries
`);
}
