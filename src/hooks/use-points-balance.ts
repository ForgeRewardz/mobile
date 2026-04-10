import { useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import { useEffect } from 'react'
import { AppState, type AppStateStatus } from 'react-native'
import { useWallet } from './useWallet'
import { useRewardzClient } from './useRewardzClient'
import type { UserBalance } from '@/types/api'

/**
 * Parse a stringified bigint-ish value to a JS number.
 * SDK returns points amounts as strings to preserve precision; the mobile
 * UI only needs JS-number precision.
 */
function parseAmount(value: string | number | null | undefined): number {
  if (value == null) return 0
  if (typeof value === 'number') return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Reads the points balance for the connected wallet via @rewardz/sdk.
 *
 * Maps the SDK's snake_case response shape (PointsBalanceResponse) to the
 * mobile UserBalance type. Amounts are stored as strings in the SDK response
 * (bigint precision) and parsed to numbers here for display.
 *
 * Uses stale-while-revalidate: 60s stale time + 30s background refetch.
 * Also refetches when the app returns from background.
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
      // SDK shape: PointsBalanceResponse { total_earned, total_pending, usable_balance, ... }
      return {
        walletAddress: raw.wallet_address ?? publicKey.toString(),
        totalEarned: parseAmount(raw.total_earned),
        pending: parseAmount(raw.total_pending),
        usable: parseAmount(raw.usable_balance),
        reserved: parseAmount(raw.total_reserved),
      }
    },
    enabled: !!client && !!publicKey,
    staleTime: 60_000,
    refetchInterval: 30_000,
  })
}
