import './polyfill';
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { initDB, getCategories, getTransactions, addTransaction, updateBudget, addCategory, deleteTransaction, deleteCategory, updateTransaction, updateCategory, generateCSV, importCSV } from './database';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  initDB();

  ipcMain.handle('get-categories', () => getCategories());
  ipcMain.handle('get-transactions', () => getTransactions());
  ipcMain.handle('add-transaction', (_event, tx) => addTransaction(tx));
  ipcMain.handle('update-budget', (_event, id, budget) => updateBudget(id, budget));
  ipcMain.handle('add-category', (_event, name, budget, type, allocationBucket) => addCategory(name, budget, type, allocationBucket));
  ipcMain.handle('delete-transaction', (_event, id) => deleteTransaction(id));
  ipcMain.handle('delete-category', (_event, id) => deleteCategory(id));
  ipcMain.handle('update-transaction', (_event, tx) => updateTransaction(tx));
  ipcMain.handle('update-category', (_event, cat) => updateCategory(cat));
  
  ipcMain.handle('export-data', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const { canceled, filePath } = await dialog.showSaveDialog(win!, {
      title: 'Export Transactions',
      defaultPath: 'FluxBudget_Export.csv',
      filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    });

    if (!canceled && filePath) {
      const csvContent = generateCSV();
      fs.writeFileSync(filePath, csvContent, 'utf-8');
      return true;
    }
    return false;
  });

  ipcMain.handle('import-data', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const { canceled, filePaths } = await dialog.showOpenDialog(win!, {
      title: 'Import Transactions',
      filters: [{ name: 'CSV Files', extensions: ['csv'] }],
      properties: ['openFile']
    });

    if (!canceled && filePaths.length > 0) {
      return importCSV(filePaths[0]);
    }
    return false;
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
