import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useRewardzClient } from './useRewardzClient'
import type { UserRankingsResponse } from '@rewardz/types'

/**
 * Reads the user leaderboard for a given season via
 * `client.leaderboards.getUserRankings({ seasonId, limit })`.
 *
 * Mirrors {@link useProtocolLeaderboard} — same query key convention
 * (`'user-leaderboard', seasonId ?? 'active', limit`), same default limit.
 *
 * @param seasonId - Optional season ID. Omit to query the server's default
 *   (current) season.
 * @param limit - Max entries per page. Defaults to 50.
 */
export function useUserLeaderboard(
  seasonId?: string,
  limit = 50,
): UseQueryResult<UserRankingsResponse> {
  const client = useRewardzClient()

  return useQuery<UserRankingsResponse>({
    queryKey: ['user-leaderboard', seasonId ?? 'active', limit],
    queryFn: async (): Promise<UserRankingsResponse> => {
      if (!client) {
        throw new Error('SDK client not ready')
      }
      return client.leaderboards.getUserRankings({ seasonId, limit })
    },
    enabled: !!client,
    staleTime: 60_000,
  })
}
