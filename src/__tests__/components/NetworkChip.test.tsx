import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NetworkChip } from '../../components/NetworkChip'

describe('NetworkChip', () => {
  it('renders network name', () => {
    render(<NetworkChip networkName="Ethereum Hoodi" isSupported={true} />)
    expect(screen.getByTestId('network-badge')).toHaveTextContent('Ethereum Hoodi')
  })

  it('shows green styling for supported network', () => {
    render(<NetworkChip networkName="Ethereum Hoodi" isSupported={true} />)
    const chip = screen.getByTestId('network-badge')
    expect(chip.className).toContain('emerald')
  })

  it('shows amber styling for unsupported network', () => {
    render(<NetworkChip networkName="Ethereum Mainnet" isSupported={false} />)
    const chip = screen.getByTestId('network-badge')
    expect(chip.className).toContain('amber')
  })

  it('renders nothing when networkName is null', () => {
    const { container } = render(<NetworkChip networkName={null} isSupported={false} />)
    expect(container.firstChild).toBeNull()
  })
})
