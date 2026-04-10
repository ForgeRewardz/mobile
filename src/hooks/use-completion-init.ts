import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { useRewardzClient } from './useRewardzClient'
import type { CompletionInit } from '@/types/api'

/**
 * Initialises a completion record before executing a Blink.
 *
 * Returns completionId + expectedReference which are used to track the
 * completion through the verification pipeline.
 */
export function useCompletionInit(): UseMutationResult<CompletionInit, Error, string> {
  const client = useRewardzClient()

  return useMutation<CompletionInit, Error, string>({
    mutationFn: async (offerId: string) => {
      if (!client) throw new Error('Wallet not connected')
      const raw = await client.initCompletion(offerId)
      const r = raw as unknown as Record<string, unknown>
      return {
        completionId: String(r.completionId ?? r.completion_id ?? ''),
        expectedReference: String(r.expectedReference ?? r.expected_reference ?? ''),
        status: 'awaiting_signature',
      }
    },
  })
}
