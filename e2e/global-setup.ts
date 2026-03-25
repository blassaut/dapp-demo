/**
 * Global setup for E2E tests.
 *
 * 1. Start a local Hardhat node (localhost:8545)
 * 2. Deploy the LockBox contract
 * 3. Write the contract address to .env.e2e so Vite can read it
 *
 * NOTE: dappwright browser + MetaMask bootstrap happens inside the
 * test fixtures (see e2e/steps/fixtures.ts) because dappwright needs
 * to own the BrowserContext lifecycle.
 */
import { spawn, execSync, type ChildProcess } from 'child_process'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
let hardhatProcess: ChildProcess | null = null

function waitForHardhatNode(timeoutMs = 20_000): Promise<void> {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const check = () => {
      try {
        // Quick JSON-RPC health check
        execSync(
          `curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://127.0.0.1:8545`,
          { timeout: 2_000 },
        )
        resolve()
      } catch {
        if (Date.now() - start > timeoutMs) {
          reject(new Error('Hardhat node did not start within timeout'))
        } else {
          setTimeout(check, 500)
        }
      }
    }
    check()
  })
}

async function globalSetup(): Promise<void> {
  console.log('[e2e] Starting Hardhat node...')

  hardhatProcess = spawn('npx', ['hardhat', 'node'], {
    cwd: ROOT,
    stdio: 'pipe',
    detached: false,
  })

  // Store the PID so global-teardown can kill it
  writeFileSync(resolve(ROOT, 'e2e/.hardhat-pid'), String(hardhatProcess.pid))

  hardhatProcess.stderr?.on('data', (data: Buffer) => {
    const msg = data.toString()
    if (msg.includes('Error') || msg.includes('error')) {
      console.error('[hardhat]', msg)
    }
  })

  await waitForHardhatNode()
  console.log('[e2e] Hardhat node is running on http://127.0.0.1:8545')

  // Deploy the LockBox contract
  console.log('[e2e] Deploying LockBox contract...')
  const deployOutput = execSync('npx hardhat run scripts/deploy.ts --network localhost', {
    cwd: ROOT,
    encoding: 'utf-8',
  })

  const addressMatch = deployOutput.match(/0x[a-fA-F0-9]{40}/)
  if (!addressMatch) {
    throw new Error(`Failed to extract contract address from deploy output:\n${deployOutput}`)
  }

  const contractAddress = addressMatch[0]
  console.log(`[e2e] LockBox deployed at ${contractAddress}`)

  // Write .env.e2e (not .env - never overwrite the user's Hoodi config)
  writeFileSync(resolve(ROOT, '.env.e2e'), `VITE_HARDHAT_CONTRACT_ADDRESS=${contractAddress}\n`)

  console.log('[e2e] Global setup complete')
}

export default globalSetup
