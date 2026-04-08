/**
 * Truncate a Solana address for display: "7xKQ...3rPm"
 */
export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

/**
 * Format points with thousands separators: 1234567 → "1,234,567"
 */
export function formatPoints(points: number): string {
  return points.toLocaleString('en-US')
}

/**
 * Format lamports to SOL with up to 4 decimal places.
 */
export function formatSol(lamports: number | bigint): string {
  const sol = Number(lamports) / 1e9
  return sol.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}
