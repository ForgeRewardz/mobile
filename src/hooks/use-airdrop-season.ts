import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useRewardzClient } from './useRewardzClient'
import type { Season } from '@rewardz/types'

/**
 * Reads the current airdrop season via `client.leaderboards.getCurrentSeason()`.
 *
 * Season info is global (not wallet-scoped), but `useRewardzClient()` currently
 * only returns a client once a wallet is connected. With `DEV_BYPASS_AUTH`
 * enabled in `(tabs)/_layout.tsx`, a client is expected to be present in the
 * tab tree — but this hook still guards against `!client` so it behaves
 * correctly when rendered before the wallet boots.
 *
 * Season data changes rarely; we use a generous 5-minute stale window.
 */
export function useAirdropSeason(): UseQueryResult<Season> {
  const client = useRewardzClient()

  return useQuery<Season>({
    queryKey: ['airdrop-season'],
    queryFn: async (): Promise<Season> => {
      if (!client) {
        throw new Error('SDK client not ready')
      }
      return client.leaderboards.getCurrentSeason()
    },
    enabled: !!client,
    staleTime: 5 * 60_000,
  })
}
