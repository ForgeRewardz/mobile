import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useRewardzClient } from './useRewardzClient'
import type { Completion, CompletionStatus } from '@/types/api'

const TERMINAL_STATES: CompletionStatus[] = ['awarded', 'confirmed_not_eligible', 'rejected', 'expired']

function normaliseStatus(status: string): CompletionStatus {
  const valid: CompletionStatus[] = [
    'awaiting_signature',
    'awaiting_chain_verification',
    'awarded',
    'confirmed_not_eligible',
    'rejected',
    'expired',
  ]
  return (valid.find((s) => s === status) ?? 'awaiting_signature') as CompletionStatus
}

/**
 * Polls completion status from the REWARDZ API.
 *
 * Maps SDK CompletionResponse (snake_case) → mobile Completion type.
 * Starts at 3-second intervals, backs off to 10s after 10 polls,
 * stops on terminal states.
 */
export function useCompletionStatus(completionId: string | null): UseQueryResult<Completion> {
  const client = useRewardzClient()

  return useQuery<Completion>({
    queryKey: ['completion-status', completionId],
    queryFn: async (): Promise<Completion> => {
      if (!client || !completionId) {
        throw new Error('No completion or client')
      }
      const raw = await client.getCompletionStatus(completionId)
      return {
        id: raw.id,
        offerId: raw.reward_policy_id ?? '',
        walletAddress: raw.user_wallet,
        status: normaliseStatus(raw.status),
        signature: raw.signature,
        expectedReference: raw.expected_reference,
        pointsAwarded: raw.points_awarded,
        reason: raw.rejection_reason,
        createdAt: raw.created_at,
        updatedAt: raw.verified_at ?? raw.created_at,
      }
    },
    enabled: !!client && !!completionId,
    refetchInterval: (query) => {
      const data = query.state.data
      if (data && TERMINAL_STATES.includes(data.status)) {
        return false
      }
      const pollCount = query.state.dataUpdateCount ?? 0
      return pollCount > 10 ? 10_000 : 3_000
    },
    staleTime: 0,
  })
}
