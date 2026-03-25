/**
 * Global teardown - kills the Hardhat node started during setup.
 */
import { readFileSync, unlinkSync, existsSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(__dirname, '..')

async function globalTeardown(): Promise<void> {
  const pidFile = resolve(ROOT, 'e2e/.hardhat-pid')

  if (existsSync(pidFile)) {
    const pid = parseInt(readFileSync(pidFile, 'utf-8').trim(), 10)
    console.log(`[e2e] Stopping Hardhat node (PID ${pid})...`)
    try {
      process.kill(pid, 'SIGTERM')
    } catch {
      // Process may have already exited
    }
    unlinkSync(pidFile)
  }

  // Clean up generated env file
  const envFile = resolve(ROOT, '.env')
  if (existsSync(envFile)) {
    try {
      unlinkSync(envFile)
    } catch {
      // Ignore
    }
  }

  console.log('[e2e] Global teardown complete')
}

export default globalTeardown
