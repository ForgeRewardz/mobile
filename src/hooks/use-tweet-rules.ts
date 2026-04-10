import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useRewardzClient } from './useRewardzClient'
import type { TweetRule } from '@/types/api'

/**
 * Fetch active tweet reward rules for a given protocol (or all protocols).
 *
 * Uses @rewardz/sdk TweetClient.listRules. Maps SDK TweetVerificationRule
 * (snake_case) to mobile TweetRule (camelCase).
 */
export function useTweetRules(protocolId?: string): UseQueryResult<TweetRule[]> {
  const client = useRewardzClient()

  return useQuery<TweetRule[]>({
    queryKey: ['tweet-rules', protocolId ?? 'all'],
    queryFn: async (): Promise<TweetRule[]> => {
      if (!client) throw new Error('Wallet not connected')
      const raw = await client.tweets.listRules(protocolId)
      // SDK returns TweetVerificationRule[] — map to mobile TweetRule
      return (raw as unknown as Record<string, unknown>[]).map((r): TweetRule => {
        return {
          id: String(r.id ?? ''),
          protocolId: String(r.protocol_id ?? r.protocolId ?? ''),
          protocolName: String(r.protocol_name ?? r.protocolName ?? ''),
          requiredHashtags: (r.required_hashtags ?? r.hashtags ?? []) as string[],
          requiredMentions: (r.required_mentions ?? r.mentions ?? []) as string[],
          baseReward: Number(r.base_points ?? r.basePoints ?? 0),
          description: String(r.description ?? ''),
          isActive: Boolean(r.active ?? r.is_active ?? true),
        }
      })
    },
    enabled: !!client,
    staleTime: 5 * 60_000,
  })
}
