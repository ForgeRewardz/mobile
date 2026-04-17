import { useMemo } from 'react'
import { useWallet } from './useWallet'
import { createWalletAdapter } from '@/services/wallet-service'
import { RewardzClient } from '@rewardz/sdk/client'
import { ENV } from '@/config/env'

/**
 * Returns a memoized RewardzClient instance from @rewardz/sdk bound to the
 * current wallet. Returns null if no wallet is connected.
 *
 * This replaces the inline RewardzApiClient with the real SDK.
 */
export function useRewardzClient(): RewardzClient | null {
  const { publicKey, signMessage } = useWallet()

  return useMemo(() => {
    if (!publicKey || !signMessage) return null
    const adapter = createWalletAdapter(publicKey, (msg: Uint8Array) => signMessage(msg) as Promise<Uint8Array>)
    return new RewardzClient({
      rpcUrl: ENV.SOLANA_RPC_URL,
      apiBaseUrl: ENV.API_BASE_URL,
      wallet: adapter,
    })
  }, [publicKey, signMessage])
}
