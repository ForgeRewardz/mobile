import { useInfiniteQuery } from '@tanstack/react-query'
import { useWallet } from './useWallet'
import { useRewardzClient } from './useRewardzClient'
import type { PointEvent, PointEventType } from '@/types/api'

interface PointsActivityPage {
  events: PointEvent[]
  nextPage: number | null
}

interface UsePointsActivityOptions {
  status?: PointEventType | 'all'
  pageSize?: number
}

function parseAmount(value: string | number | null | undefined): number {
  if (value == null) return 0
  if (typeof value === 'number') return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function normaliseEventType(type: string): PointEventType {
  const lower = type.toLowerCase()
  if (lower === 'awarded' || lower === 'award') return 'awarded'
  if (lower === 'pending') return 'pending'
  if (lower === 'rejected') return 'rejected'
  if (lower === 'reserved') return 'reserved'
  return 'awarded'
}

/**
 * Paginated points activity list (infinite query).
 *
 * Maps SDK PointEventRow[] (snake_case, stringified amounts) to the mobile
 * PointEvent type. Supports status filter: all | awarded | pending | rejected | reserved.
 */
export function usePointsActivity(options: UsePointsActivityOptions = {}) {
  const { status = 'all', pageSize = 20 } = options
  const { publicKey } = useWallet()
  const client = useRewardzClient()

  return useInfiniteQuery<PointsActivityPage>({
    queryKey: ['points-activity', publicKey?.toString(), status],
    queryFn: async ({ pageParam }): Promise<PointsActivityPage> => {
      if (!client || !publicKey) {
        throw new Error('Wallet not connected')
      }
      const page = (pageParam as number) ?? 0
      const offset = page * pageSize
      const response = await client.getRewardHistory({ limit: pageSize, offset })
      // SDK shape: PointsHistoryResponse { events: PointEventRow[] }
      const rawEvents = response.events ?? []
      const events: PointEvent[] = rawEvents
        .map(
          (e): PointEvent => ({
            id: e.id,
            walletAddress: e.user_wallet,
            amount: parseAmount(e.amount),
            type: normaliseEventType(e.type),
            protocolId: e.protocol_id ?? undefined,
            protocolName: undefined, // SDK doesn't include protocol_name in point events
            reason: e.reason ?? undefined,
            completionId: e.completion_id,
            sourceSignature: e.source_signature ?? undefined,
            createdAt: e.created_at,
          }),
        )
        .filter((e) => status === 'all' || e.type === status)

      const hasMore = rawEvents.length === pageSize
      return {
        events,
        nextPage: hasMore ? page + 1 : null,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!client && !!publicKey,
    staleTime: 60_000,
  })
}
