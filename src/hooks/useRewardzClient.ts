import { useMemo } from 'react'
import { useWallet } from './useWallet'
import { createWalletAdapter } from '@/services/wallet-service'
import { RewardzApiClient } from '@/services/api-client'

/**
 * Returns a memoized RewardzApiClient instance bound to the current wallet.
 * Returns null if no wallet is connected.
 */
export function useRewardzClient(): RewardzApiClient | null {
  const { publicKey, signMessage } = useWallet()

  return useMemo(() => {
    if (!publicKey || !signMessage) return null
    const adapter = createWalletAdapter(publicKey, (msg: Uint8Array) => signMessage(msg) as Promise<Uint8Array>)
    return new RewardzApiClient({ wallet: adapter })
  }, [publicKey, signMessage])
}
