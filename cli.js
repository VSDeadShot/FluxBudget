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

} else if (command === 'income') {
  const amount = parseFloat(args[1]);
  const desc = args.slice(2).join(' ') || 'Income Entry';
  
  if (isNaN(amount) || amount <= 0) {
    console.error('Usage: fluxbudget income <amount> <description...>');
    console.error('Example: fluxbudget income 55000 Salary');
    process.exit(1);
  }

  // Find the first income category (e.g. Salary)
  let category = data.categories.find(c => c.type === 'income');
  if (!category) {
    const newCatId = data.categories.length > 0 ? Math.max(...data.categories.map(c => c.id)) + 1 : 1;
    category = { id: newCatId, name: 'Income', budget: 0, type: 'income', allocationBucket: 'None' };
    data.categories.push(category);
  }

  const newTxId = data.transactions.length > 0 ? Math.max(...data.transactions.map(t => t.id)) + 1 : 1;
  const newTx = {
    id: newTxId,
    date: new Date().toISOString().split('T')[0],
    description: desc,
    categoryId: category.id,
    amount: amount,
    type: 'income'
  };

  data.transactions.push(newTx);
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  
  console.log(`\n💰 Successfully Logged Income: +Rs ${amount} for "${desc}"`);
  console.log(`Categorized under [${category.name}]\n`);

} else if (command === 'history') {
  console.log(`\n=== 5 Most Recent Transactions ===`);
  const sortedTxs = [...data.transactions].sort((a, b) => b.id - a.id).slice(0, 5);
  
  if (sortedTxs.length === 0) {
    console.log("No transactions found.");
  } else {
    sortedTxs.forEach(tx => {
      const cat = data.categories.find(c => c.id === tx.categoryId);
      const catName = cat ? cat.name : 'Unknown';
      const typeIcon = tx.type === 'income' ? '🟢' : '🔴';
      const sign = tx.type === 'income' ? '+' : '-';
      
      console.log(`${typeIcon} ${tx.date} | ${tx.description.padEnd(25).substring(0, 25)} | [${catName}]`.padEnd(55) + `${sign}Rs ${tx.amount.toFixed(2)}`);
    });
  }
  console.log();

} else if (command === 'goals') {
  console.log(`\n=== Savings Goals ===`);
  if (!data.goals || data.goals.length === 0) {
    console.log("No savings goals found.");
  } else {
    data.goals.forEach(g => {
      const percentage = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
      
      const barLength = 20;
      const filled = Math.round((percentage / 100) * barLength);
      const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
      
      console.log(`🎯 ${g.name.padEnd(25)} [${bar}] ${percentage}%`);
      console.log(`   Rs ${g.currentAmount.toFixed(2)} / Rs ${g.targetAmount.toFixed(2)}\n`);
    });
  }

} else if (command === 'undo') {
  if (!data.transactions || data.transactions.length === 0) {
    console.log(`\n❌ No transactions to undo.\n`);
  } else {
    // Find the highest ID (most recently created)
    const lastTx = [...data.transactions].sort((a, b) => b.id - a.id)[0];
    data.transactions = data.transactions.filter(t => t.id !== lastTx.id);
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    
    const sign = lastTx.type === 'income' ? '+' : '-';
    console.log(`\n⏪ Undid Transaction: ${sign}Rs ${lastTx.amount.toFixed(2)} for "${lastTx.description}"\n`);
  }

} else if (command === 'export') {
  const header = "ID,Date,Description,Category,Type,Amount\n";
  const rows = data.transactions.map(tx => {
    const cat = data.categories.find(c => c.id === tx.categoryId);
    const catName = cat ? cat.name : 'Unknown';
    const desc = `"${tx.description.replace(/"/g, '""')}"`;
    return `${tx.id},${tx.date},${desc},${catName},${tx.type},${tx.amount}`;
  });
  
  const csvContent = header + rows.join('\n');
  const exportPath = path.join(process.cwd(), 'fluxbudget_export.csv');
  fs.writeFileSync(exportPath, csvContent, 'utf-8');
  
  console.log(`\n📄 Successfully exported ${data.transactions.length} transactions!`);
  console.log(`Saved to: ${exportPath}\n`);

} else if (command === 'buckets') {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const txs = data.transactions.filter(t => t.date.startsWith(currentMonth));
  
  const totalIncome = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  
  const rule = data.settings?.budgetRule || 'flux';
  
  let pE = 0.5, pR = 0.1, pG = 0.25, pS = 0.15;
  let ruleName = 'Flux Default (50/10/25/15)';
  if (rule === '50/30/20') { pE = 0.5; pR = 0.3; pG = 0.1; pS = 0.1; ruleName = 'Classic 50/30/20'; }
  else if (rule === '80/20') { pE = 0.6; pR = 0.2; pG = 0.1; pS = 0.1; ruleName = 'Aggressive Saver (80/20)'; }
  else if (rule === '70/20/10') { pE = 0.6; pR = 0.1; pG = 0.2; pS = 0.1; ruleName = 'Debt Crusher (70/20/10)'; }
  
  const rules = {
    'Essentials': pE,
    'Growth': pG,
    'Stability': pS,
    'Rewards': pR
  };
  
  console.log(`\n=== ${ruleName} Bucket Breakdown ===`);
  console.log(`Total Income: Rs ${totalIncome.toFixed(2)}\n`);
  
  Object.keys(rules).forEach(bucket => {
    const allocated = totalIncome * rules[bucket];
    
    // Find categories in this bucket
    const bucketCatIds = data.categories.filter(c => c.allocationBucket === bucket).map(c => c.id);
    
    // Sum expenses in these categories
    const spent = txs.filter(t => t.type === 'expense' && bucketCatIds.includes(t.categoryId)).reduce((sum, t) => sum + t.amount, 0);
    
    const remaining = allocated - spent;
    const statusIcon = remaining >= 0 ? '🟢' : '🔴';
    
    console.log(`${statusIcon} ${bucket.padEnd(12)} | Allocated: Rs ${allocated.toFixed(2).padEnd(8)} | Spent: Rs ${spent.toFixed(2).padEnd(8)} | Left: Rs ${remaining.toFixed(2)}`);
  });
  console.log();

} else {
  console.log(`
FluxBudget CLI
--------------
Usage:
  fluxbudget status                     - View current month's income, expenses, and balance
  fluxbudget log <amount> <description> - Log an expense instantly (auto-categorized!)
  fluxbudget income <amount> <desc>     - Log an income/salary instantly
  fluxbudget history                    - View your 5 most recent transactions
  fluxbudget goals                      - View progress bars for your Savings Goals
  fluxbudget undo                       - Instantly delete your most recently logged transaction
  fluxbudget export                     - Generate a CSV backup of your transactions in the current folder
  fluxbudget buckets                    - View your 50/30/20 breakdown and remaining budget
  
Example:
  fluxbudget log 250 Spotify Subscription
  fluxbudget income 55000 Monthly Salary
`);
}
