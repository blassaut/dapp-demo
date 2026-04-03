import type { Contract, EventLog, ContractEventName } from 'ethers'
import { BLOCK_RANGE } from './constants'

export async function queryAllEvents(
  contract: Contract,
  filter: ContractEventName,
  currentBlock: number,
): Promise<EventLog[]> {
  const results: EventLog[] = []

  for (let from = 0; from <= currentBlock; from += BLOCK_RANGE + 1) {
    const to = Math.min(from + BLOCK_RANGE, currentBlock)
    const events = await contract.queryFilter(filter, from, to)
    for (const event of events) {
      if ('args' in event) results.push(event as EventLog)
    }
  }

  return results
}
