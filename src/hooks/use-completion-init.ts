import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { useRewardzClient } from './useRewardzClient'
import type { CompletionInit } from '@/types/api'

/**
 * Initialises a completion record before executing a Blink.
 *
 * Maps SDK InitCompletionResponse { completion_id, expected_reference, ... }
 * to mobile CompletionInit type.
 */
export function useCompletionInit(): UseMutationResult<CompletionInit, Error, string> {
  const client = useRewardzClient()

  return useMutation<CompletionInit, Error, string>({
    mutationFn: async (offerId: string) => {
      if (!client) throw new Error('Wallet not connected')
      const raw = await client.initCompletion(offerId)
      return {
        completionId: raw.completion_id,
        expectedReference: raw.expected_reference,
        status: 'awaiting_signature',
      }
    },
  })
}
