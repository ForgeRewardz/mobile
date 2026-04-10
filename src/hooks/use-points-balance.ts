import { useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import { useEffect } from 'react'
import { AppState, type AppStateStatus } from 'react-native'
import { useWallet } from './useWallet'
import { useRewardzClient } from './useRewardzClient'
import type { UserBalance } from '@/types/api'

/**
 * Reads the points balance for the connected wallet via @rewardz/sdk.
 *
 * Uses stale-while-revalidate: 60s stale time + 30s background refetch.
 * Also refetches when the app returns from background via AppState listener.
 */
export function usePointsBalance(): UseQueryResult<UserBalance> {
  const { publicKey } = useWallet()
  const client = useRewardzClient()
  const queryClient = useQueryClient()

  // Refetch on app foreground (React Native AppState)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active' && publicKey) {
        queryClient.invalidateQueries({ queryKey: ['points-balance'] })
      }
    })
    return () => sub.remove()
  }, [publicKey, queryClient])

  return useQuery<UserBalance>({
    queryKey: ['points-balance', publicKey?.toString()],
    queryFn: async (): Promise<UserBalance> => {
      if (!client || !publicKey) {
        throw new Error('Wallet not connected')
      }
      const raw = await client.getPointsBalance(publicKey.toString())
      // Map SDK response to mobile UserBalance type
      return {
        walletAddress: publicKey.toString(),
        totalEarned: (raw as { totalEarned?: number }).totalEarned ?? 0,
        pending: (raw as { pending?: number }).pending ?? 0,
        usable: (raw as { usable?: number }).usable ?? 0,
        reserved: (raw as { reserved?: number }).reserved ?? 0,
        rank: (raw as { rank?: number }).rank,
      }
    },
    enabled: !!client && !!publicKey,
    staleTime: 60_000,
    refetchInterval: 30_000,
  })
}
