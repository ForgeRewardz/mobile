import { useQuery } from '@tanstack/react-query'
import { useRewardzClient } from './useRewardzClient'
import type { TweetRule } from '@/types/api'

/**
 * Fetch the active tweet reward rules for a given protocol (or all protocols
 * when no id is supplied).
 *
 * As with `useSubmitTweet`, the SDK does not yet expose a typed surface for
 * tweet rules so we probe the client at runtime. Returns an empty list when
 * the SDK cannot service the query — the UI treats this as a graceful
 * degradation rather than an error state.
 */
export function useTweetRules(protocolId?: string) {
  const client = useRewardzClient()

  return useQuery<TweetRule[]>({
    queryKey: ['tweet-rules', protocolId ?? 'all'],
    queryFn: async () => {
      if (!client) throw new Error('Wallet not connected')
      const sdk = client as unknown as {
        tweets?: {
          listRules: (protocolId?: string) => Promise<unknown>
        }
      }
      if (!sdk.tweets?.listRules) {
        return []
      }
      const raw = await sdk.tweets.listRules(protocolId)
      return (raw as TweetRule[]) ?? []
    },
    enabled: !!client,
    staleTime: 5 * 60_000,
  })
}
