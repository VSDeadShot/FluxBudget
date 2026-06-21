# FluxBudget 💸

> A state-of-the-art, offline-first personal finance tracker built with Electron, React, and a powerful native CLI.

## 🌟 Desktop App Features

- **50/30/20 Income Allocation Model:** Your main dashboard automatically sorts incoming salary into actionable budget buckets: Essentials (50%), Rewards (10%), Growth (25%), and Stability (15%). 
- **Smart Category Classifier:** When creating new budget categories, the app intelligently predicts and auto-selects the correct Allocation Bucket based on the category name (e.g. "Netflix" -> Rewards, "Groceries" -> Essentials).
- **Savings Goals Tracker:** Create big-purchase goals like a "New Car" or "Vacation Fund". Watch your progress grow via beautifully animated Recharts donut graphs and dynamic CSS gradient progress bars.
- **Premium Native UI:** A sleek, monochromatic aesthetic featuring fluid Framer Motion animations, dark/light mode sync, a custom "squircle" taskbar icon, and a completely hidden default Electron menu bar for a true native feel.
- **Offline First:** All your financial data is securely stored locally in a lightweight JSON database. No cloud, no subscription fees.
- **CSV Import/Export:** Easily migrate your data from old Excel trackers or export it for your own backups.

---

## ⚡ Global CLI Interface

FluxBudget comes with a built-in terminal executable! You can log your expenses or check your progress from *any directory* on your computer without even opening the desktop app.

### CLI Setup
Run this command once inside the project root to install the global command:
```bash
npm link
```

### CLI Commands
| Command | Description |
|---|---|
| `fluxbudget status` | Prints your total income, total expenses, and remaining balance for the current month. |
| `fluxbudget log <amount> <desc>` | Instantly logs an expense. The *Smart Classifier* will auto-detect the category! (e.g. `fluxbudget log 250 Spotify`) |
| `fluxbudget income <amount> <desc>`| Quickly logs incoming cash/salary. (e.g. `fluxbudget income 55000 Monthly Salary`) |
| `fluxbudget history` | Prints a beautifully formatted table of your 5 most recent transactions. |
| `fluxbudget goals` | Renders cool ASCII progress bars `[██████░░░]` showing how close you are to hitting your Savings Goals! |

---

## 🚀 Tech Stack

- **Frontend:** React 18, Tailwind CSS v4, Framer Motion, Recharts, Lucide Icons
- **Backend/Desktop wrapper:** Electron (IPC Architecture), Node.js (CLI execution)
- **Tooling:** Vite, TypeScript

## 📦 Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/VSDeadShot/FluxBudget.git
   cd FluxBudget
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server (with hot-reload for React and Electron):
   ```bash
   npm run dev
   ```

## 🔨 Build for Production

To compile the standalone Windows executable (`.exe`) installer:

```bash
npm run dist
```
The final installer will be available in the `release/` folder.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📝 License
This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.
