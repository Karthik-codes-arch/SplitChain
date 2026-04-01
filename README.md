# 💸 SplitChain — Split Bills on Blockchain

> No more awkward reminders. Transparent, instant, on-chain.

## 🧩 Problem Statement
Group payments are slow and prone to manual errors. People forget to pay, 
deny paying, and there's no transparent record of who paid what.

## ✅ Solution
SplitChain is a decentralized bill splitting app built on Algorand. 
Create a bill, assign shares to friends' wallet addresses, and track 
payments in real-time on the blockchain.

## ✨ Features
- 🔗 Connect Algorand wallet (Lute/Pera)
- 📋 Create shared bills with custom amounts
- 👥 Add members by wallet address
- 💰 Pay your share directly in ALGO
- ✅ Real-time settlement status board
- 🔒 Immutable on-chain payment records

## 🛠️ Tech Stack
- **Frontend:** React + TypeScript + TailwindCSS
- **Blockchain:** Algorand TestNet
- **Wallet:** Lute Wallet / Pera Wallet
- **SDK:** AlgoKit + TxnLab use-wallet
- **Tools:** AlgoKit, Vite, pnpm

## 🚀 Setup Instructions
1. Clone the repo:
```bash
   git clone https://github.com/Karthik-codes-arch/SplitChain.git
   cd SplitChain
```
2. Install AlgoKit from https://algorand.co/algokit

3. Bootstrap the project:
```bash
   algokit project bootstrap all
   algokit project run build
```

4. Run the frontend:
```bash
   cd projects/frontend
   pnpm run dev
```

## 👥 Team
- **Team Name:** Genkai Apex
- **Hackathon:** AlgoHack 1.0

