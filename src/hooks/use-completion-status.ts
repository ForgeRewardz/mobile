import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useRewardzClient } from './useRewardzClient'
import type { Completion, CompletionStatus } from '@/types/api'

const TERMINAL_STATES: CompletionStatus[] = ['awarded', 'confirmed_not_eligible', 'rejected', 'expired']

/**
 * Polls completion status from the REWARDZ API.
 *
 * Starts at 3-second intervals, backs off to 10s after 10 polls,
 * stops on terminal states (awarded, confirmed_not_eligible, rejected, expired).
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
      const r = raw as unknown as Record<string, unknown>
      return {
        id: String(r.id ?? completionId),
        offerId: String(r.offerId ?? ''),
        walletAddress: String(r.walletAddress ?? r.userWallet ?? ''),
        status: (r.status as CompletionStatus) ?? 'awaiting_signature',
        signature: (r.signature as string) ?? null,
        expectedReference: (r.expectedReference ?? r.expected_reference ?? null) as string | null,
        pointsAwarded: (r.pointsAwarded ?? r.points ?? null) as number | null,
        reason: (r.reason ?? null) as string | null,
        createdAt: String(r.createdAt ?? new Date().toISOString()),
        updatedAt: String(r.updatedAt ?? new Date().toISOString()),
      }
    },
    enabled: !!client && !!completionId,
    refetchInterval: (query) => {
      const data = query.state.data
      if (data && TERMINAL_STATES.includes(data.status)) {
        return false
      }
      // Back off to 10s after 10 polls
      const pollCount = query.state.dataUpdateCount ?? 0
      return pollCount > 10 ? 10_000 : 3_000
    },
    staleTime: 0,
  })
}
