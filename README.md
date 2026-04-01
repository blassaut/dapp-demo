# LockBox

A demo dApp built to showcase production-grade testing for depositing and withdrawing ETH through an on-chain smart contract. No mocks - every transaction executes on a real blockchain (Hoodi testnet or local Hardhat node).

## Features

- **Deposit & withdraw ETH** with real on-chain transactions
- **Wallet connection** via MetaMask and WalletConnect
- **Live balance tracking** - locked balance updates after each transaction
- **Transaction history** - view past deposits and withdrawals
- **Leaderboard** - ranked view of top depositors with medal badges for connected users
- **Network detection** - supports Hoodi testnet and local Hardhat

## Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
- **Blockchain:** Solidity 0.8.24, Hardhat 3
- **Wallet:** MetaMask (via `ethers.js`)
- **Testing:** Vitest (unit), Playwright + Cucumber BDD (E2E), Dappwright (wallet)

## Getting started

```bash
npm install
```

### Local development

Start a local Hardhat node, deploy the contract, then run the app:

```bash
npm run node          # terminal 1
npm run deploy        # terminal 2
npm run dev           # terminal 3
```

### Run tests

```bash
npm test              # unit tests
npm run test:e2e      # end-to-end tests (requires Playwright browsers)
```

## Networks

| Network | Chain ID | RPC |
|---------|----------|-----|
| Hoodi testnet | 560048 | `https://rpc.hoodi.ethpandaops.io` |
| Hardhat (local) | 31337 | `http://127.0.0.1:8545` |
