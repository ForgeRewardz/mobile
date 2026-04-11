import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useRewardzClient } from './useRewardzClient'
import type { ProtocolRankingsResponse } from '@rewardz/types'

/**
 * Reads the protocol leaderboard for a given season via
 * `client.leaderboards.getProtocolRankings({ seasonId, limit })`.
 *
 * Query key includes `seasonId ?? 'active'` so callers can render concurrent
 * previews of past + current seasons without colliding caches.
 *
 * @param seasonId - Optional season ID. Omit to query the server's default
 *   (current) season.
 * @param limit - Max entries per page. Defaults to 50 — large enough to cover
 *   the podium (top 3) + full list view below it.
 */
export function useProtocolLeaderboard(
  seasonId?: string,
  limit = 50,
): UseQueryResult<ProtocolRankingsResponse> {
  const client = useRewardzClient()

  return useQuery<ProtocolRankingsResponse>({
    queryKey: ['protocol-leaderboard', seasonId ?? 'active', limit],
    queryFn: async (): Promise<ProtocolRankingsResponse> => {
      if (!client) {
        throw new Error('SDK client not ready')
      }
      return client.leaderboards.getProtocolRankings({ seasonId, limit })
    },
    enabled: !!client,
    staleTime: 60_000,
  })
}
