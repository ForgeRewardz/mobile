import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { useRewardzClient } from './useRewardzClient'
import type { ResolveIntentResponse, IntentOffer } from '@/types/api'

/**
 * Mutation hook for resolving natural-language intents via @rewardz/sdk.
 *
 * Maps IntentResolutionResponse (SDK) → mobile ResolveIntentResponse.
 * SDK returns `intent: string` + `offers: IntentOfferRow[]` (snake_case).
 *
 * Usage:
 *   const resolve = useIntentResolve()
 *   resolve.mutate('swap 100 USDC to SOL')
 *   // resolve.data → { offers, query, resolverType, resolverConfidence }
 */
export function useIntentResolve(): UseMutationResult<ResolveIntentResponse, Error, string> {
  const client = useRewardzClient()

  return useMutation<ResolveIntentResponse, Error, string>({
    mutationFn: async (query: string) => {
      if (!client) throw new Error('Wallet not connected')
      const raw = await client.resolveIntent(query)
      // SDK shape: IntentResolutionResponse { intent, resolver_type, resolver_confidence, offers }
      const offers: IntentOffer[] = (raw.offers ?? []).map(
        (o, idx): IntentOffer => ({
          id: `${o.protocol_id}-${o.action_type}-${idx}`, // offers don't have stable IDs from intent endpoint
          protocolName: o.protocol_id, // no protocol_name on IntentOfferRow
          actionType: o.action_type,
          title: `${o.action_type} via ${o.protocol_id}`,
          description: '',
          iconUrl: '',
          actionUrl: '', // resolved later via protocol manifest
          rewardPoints: o.points,
          eligibility: 'unknown',
          trustScore: o.trust_score,
          rank: o.rank,
        }),
      )
      return {
        offers,
        query,
        resolverType: (raw.resolver_type as 'ai' | 'rules') ?? 'rules',
        resolverConfidence: raw.resolver_confidence,
      }
    },
  })
}
