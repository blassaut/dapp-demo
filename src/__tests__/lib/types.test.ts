import { describe, it, expect } from 'vitest'
import { AppState } from '../../lib/types'

describe('AppState enum', () => {
  it('has exactly 8 states', () => {
    const states = Object.values(AppState).filter((v) => typeof v === 'string')
    expect(states).toHaveLength(8)
  })

  it('includes all required states', () => {
    expect(AppState.Disconnected).toBeDefined()
    expect(AppState.UnsupportedNetwork).toBeDefined()
    expect(AppState.Idle).toBeDefined()
    expect(AppState.Pending).toBeDefined()
    expect(AppState.Approving).toBeDefined()
    expect(AppState.Depositing).toBeDefined()
    expect(AppState.Confirmed).toBeDefined()
    expect(AppState.Rejected).toBeDefined()
  })
})
