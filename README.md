# LockBox

A React dApp demonstrating a complete on-chain deposit and withdrawal flow. No mocks — every transaction executes on a real blockchain (Hoodi testnet or local Hardhat node).

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
