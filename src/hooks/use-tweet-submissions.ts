import { useInfiniteQuery } from '@tanstack/react-query'
import { useWallet } from './useWallet'
import { useRewardzClient } from './useRewardzClient'
import type { TweetSubmission } from '@/types/api'

interface TweetSubmissionsPage {
  submissions: TweetSubmission[]
  nextPage: number | null
}

/**
 * Paginated tweet submissions for the connected wallet.
 *
 * Uses @rewardz/sdk TweetClient.listSubmissions which returns
 * PaginatedResponse<TweetSubmission> with { data, total, page, pageSize, hasMore }.
 */
export function useTweetSubmissions() {
  const { publicKey } = useWallet()
  const client = useRewardzClient()

  return useInfiniteQuery<TweetSubmissionsPage>({
    queryKey: ['tweet-submissions', publicKey?.toString()],
    queryFn: async ({ pageParam }): Promise<TweetSubmissionsPage> => {
      if (!client || !publicKey) throw new Error('Wallet not connected')
      const page = (pageParam as number) ?? 0
      const raw = await client.tweets.listSubmissions(publicKey.toString(), {
        limit: 20,
        page: page + 1, // SDK uses 1-indexed pages
      })
      const response = raw as unknown as {
        data?: TweetSubmission[]
        hasMore?: boolean
      }
      return {
        submissions: response.data ?? [],
        nextPage: response.hasMore ? page + 1 : null,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!client && !!publicKey,
    staleTime: 60_000,
  })
}
