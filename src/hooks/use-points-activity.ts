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

/**
 * Paginated points activity list (infinite query).
 *
 * Supports optional status filter: all | awarded | pending | rejected | reserved.
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
      // Map SDK response shape to mobile PointEvent[]
      const rawEvents =
        (response as { events?: unknown[]; data?: unknown[] }).events ?? (response as { data?: unknown[] }).data ?? []
      const events: PointEvent[] = (rawEvents as Record<string, unknown>[])
        .map((e) => ({
          id: String(e.id ?? ''),
          walletAddress: String(e.walletAddress ?? publicKey.toString()),
          amount: Number(e.amount ?? 0),
          type: (e.type ?? 'awarded') as PointEventType,
          protocolId: e.protocolId as string | undefined,
          protocolName: e.protocolName as string | undefined,
          reason: e.reason as string | undefined,
          completionId: (e.completionId ?? null) as string | null,
          sourceSignature: e.sourceSignature as string | undefined,
          createdAt: String(e.createdAt ?? new Date().toISOString()),
        }))
        .filter((e) => status === 'all' || e.type === status)

      const hasMore = events.length === pageSize
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
