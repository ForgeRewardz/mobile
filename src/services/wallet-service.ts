import type { Address } from '@solana/kit'
import { fromUint8Array } from '@wallet-ui/react-native-kit'

/**
 * WalletAdapter interface compatible with @rewardz/sdk auth system.
 * When the SDK upgrades to @solana/kit v6, replace with import from @rewardz/sdk/core.
 */
export interface WalletAdapter {
  address: Address
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
}

/**
 * Creates a WalletAdapter from useMobileWallet() hook values.
 * Used for authenticated API calls that require a signed message.
 */
export function createWalletAdapter(
  address: Address,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>,
): WalletAdapter {
  return { address, signMessage }
}

/**
 * Builds a timestamped auth message. The timestamp prevents replay attacks —
 * the server should reject signatures older than a reasonable window (e.g. 5 minutes).
 */
export function buildAuthMessage(address: string, timestamp: number): Uint8Array {
  const message = `Sign in to REWARDZ with wallet ${address} at ${timestamp}`
  return new TextEncoder().encode(message)
}

/**
 * Cached auth session. Signed once per connect, reused for all API calls
 * until it expires or the wallet disconnects. Avoids triggering MWA signing
 * popup on every request.
 */
export interface AuthSession {
  address: string
  signature: string
  timestamp: number
}

const SESSION_TTL_MS = 5 * 60 * 1000 // 5 minutes

let cachedSession: AuthSession | null = null

export async function getOrCreateAuthSession(wallet: WalletAdapter): Promise<AuthSession> {
  if (
    cachedSession &&
    cachedSession.address === wallet.address &&
    Date.now() - cachedSession.timestamp < SESSION_TTL_MS
  ) {
    return cachedSession
  }

  const timestamp = Date.now()
  const message = buildAuthMessage(wallet.address, timestamp)
  const signatureBytes = await wallet.signMessage(message)
  const signature = fromUint8Array(signatureBytes)

  cachedSession = { address: wallet.address, signature, timestamp }
  return cachedSession
}

export function clearAuthSession() {
  cachedSession = null
}
