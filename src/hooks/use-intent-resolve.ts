import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { useRewardzClient } from './useRewardzClient'
import type { ResolveIntentResponse } from '@/types/api'

/**
 * Mutation hook for resolving natural-language intents via @rewardz/sdk.
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
      // Map SDK response to mobile type (shapes may differ slightly)
      const r = raw as {
        intent?: { action_type?: string }
        offers?: unknown[]
        resolver_type?: 'ai' | 'rules'
        resolver_confidence?: number
      }
      return {
        offers: (r.offers ?? []) as ResolveIntentResponse['offers'],
        query,
        resolverType: r.resolver_type ?? 'rules',
        resolverConfidence: r.resolver_confidence,
      }
    },
  })
}
