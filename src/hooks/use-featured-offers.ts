import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useRewardzClient } from './useRewardzClient'
import type { IntentOffer } from '@/types/api'

interface UseFeaturedOffersOptions {
  actionType?: string
  limit?: number
}

function parseVisibility(raw: unknown): IntentOffer['visibility'] {
  if (raw === 'hidden') return 'hidden'
  if (raw === 'at_risk') return 'at_risk'
  return 'visible'
}

/**
 * Fetches featured/trending offers from @rewardz/sdk.
 *
 * Maps OffersBrowseResponse.offers (OfferRow[], snake_case) to mobile IntentOffer.
 * Uses 5-minute stale time since featured offers don't change frequently.
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
      // SDK shape: OffersBrowseResponse { offers: OfferRow[] }
      const rawOffers = response.offers ?? []
      return rawOffers
        .map(
          (o, idx): IntentOffer => ({
            id: o.campaign_id,
            protocolName: o.protocol_name,
            actionType: o.action_type,
            title: o.name,
            description: o.description ?? '',
            iconUrl: '', // OfferRow does not include icon URL — empty for now
            actionUrl: '', // Action URL is looked up from protocol manifest, not offer row
            rewardPoints: o.points_per_completion,
            eligibility: 'unknown',
            trustScore: o.trust_score,
            rank: o.rank ?? idx,
            visibility: parseVisibility((o as unknown as Record<string, unknown>).visibility),
            isFeatured: Boolean((o as unknown as Record<string, unknown>).is_featured),
          }),
        )
        .filter((offer) => offer.visibility !== 'hidden')
    },
    enabled: !!client,
    staleTime: 5 * 60_000,
  })
}
