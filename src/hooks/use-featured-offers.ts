import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useRewardzClient } from './useRewardzClient'
import type { IntentOffer } from '@/types/api'

interface UseFeaturedOffersOptions {
  actionType?: string
  limit?: number
}

/**
 * Fetches featured/trending offers from @rewardz/sdk.
 *
 * Uses browseOffers with featured filter. 5-minute stale time since
 * featured offers don't change frequently.
 */
export function useFeaturedOffers(options: UseFeaturedOffersOptions = {}): UseQueryResult<IntentOffer[]> {
  const { actionType, limit = 10 } = options
  const client = useRewardzClient()

  return useQuery<IntentOffer[]>({
    queryKey: ['featured-offers', actionType ?? 'all', limit],
    queryFn: async (): Promise<IntentOffer[]> => {
      if (!client) throw new Error('Wallet not connected')
      const filters: Record<string, string> = { sort: 'score', limit: String(limit) }
      if (actionType) filters.actionType = actionType
      const response = await client.browseOffers(filters)
      const raw =
        (response as { offers?: unknown[]; data?: unknown[] }).offers ?? (response as { data?: unknown[] }).data ?? []
      return (raw as Record<string, unknown>[]).map(
        (o, idx): IntentOffer => ({
          id: String(o.id ?? ''),
          protocolName: String(o.protocolName ?? 'Unknown'),
          protocolIcon: o.protocolIcon as string | undefined,
          actionType: String(o.actionType ?? ''),
          title: String(o.title ?? ''),
          description: String(o.description ?? ''),
          iconUrl: String(o.iconUrl ?? ''),
          actionUrl: String(o.actionUrl ?? ''),
          rewardPoints: Number(o.rewardPoints ?? 0),
          eligibility: (o.eligibility ?? 'unknown') as IntentOffer['eligibility'],
          trustScore: o.trustScore as number | undefined,
          rank: Number(o.rank ?? idx),
        }),
      )
    },
    enabled: !!client,
    staleTime: 5 * 60_000,
  })
}
