export const EXPLORER_URL = 'https://hoodi.etherscan.io'

export function truncateHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`
}

export function getTxUrl(txHash: string): string {
  return `${EXPLORER_URL}/tx/${txHash}`
}
