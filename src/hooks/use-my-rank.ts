import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useWallet } from './useWallet'
import { useRewardzClient } from './useRewardzClient'
import type { UserRank } from '@rewardz/types'

/**
 * Reads the connected wallet's own rank for a given season via
 * `client.leaderboards.getMyRank(seasonId)`.
 *
 * **Wallet-gated:** the query is only enabled when a `publicKey` is present.
 * When no wallet is connected (or while the wallet is still booting) the hook
 * stays inert — `data === undefined`, `isLoading === false`, `isError === false`
 * — which is the exact shape callers like the rewards summary card expect.
 *
 * @param seasonId - Optional season ID. Omit to query the current season.
 */
export function useMyRank(seasonId?: string): UseQueryResult<UserRank> {
  const { publicKey } = useWallet()
  const client = useRewardzClient()

  return useQuery<UserRank>({
    queryKey: ['my-rank', publicKey?.toString(), seasonId ?? 'active'],
    queryFn: async (): Promise<UserRank> => {
      if (!client || !publicKey) {
        throw new Error('Wallet not connected')
      }
      return client.leaderboards.getMyRank(seasonId)
    },
    enabled: !!client && !!publicKey,
    staleTime: 60_000,
  })
}
