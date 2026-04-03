import type { Contract, EventLog, ContractEventName } from 'ethers'
import { BLOCK_RANGE } from './constants'

const MAX_CONCURRENT = 6

export async function queryAllEvents(
  contract: Contract,
  filter: ContractEventName,
  currentBlock: number,
): Promise<EventLog[]> {
  const chunks: { from: number; to: number }[] = []
  for (let from = 0; from <= currentBlock; from += BLOCK_RANGE + 1) {
    chunks.push({ from, to: Math.min(from + BLOCK_RANGE, currentBlock) })
  }

  const results: EventLog[] = []

  for (let i = 0; i < chunks.length; i += MAX_CONCURRENT) {
    const batch = chunks.slice(i, i + MAX_CONCURRENT)
    const batchResults = await Promise.all(
      batch.map(({ from, to }) => contract.queryFilter(filter, from, to)),
    )
    for (const events of batchResults) {
      for (const event of events) {
        if ('args' in event) results.push(event as EventLog)
      }
    }
  }

  return results
}
