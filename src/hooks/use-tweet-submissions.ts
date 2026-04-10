import { useInfiniteQuery } from '@tanstack/react-query'
import { useWallet } from './useWallet'
import { useRewardzClient } from './useRewardzClient'
import type { TweetSubmission } from '@/types/api'

export function useTweetSubmissions() {
  const { publicKey } = useWallet()
  const client = useRewardzClient()

  return useInfiniteQuery<{ submissions: TweetSubmission[]; nextPage: number | null }>({
    queryKey: ['tweet-submissions', publicKey?.toString()],
    queryFn: async ({ pageParam }) => {
      if (!client || !publicKey) throw new Error('Wallet not connected')
      const sdk = client as unknown as {
        tweets?: {
          listSubmissions: (wallet: string, options?: { limit?: number; offset?: number }) => Promise<unknown>
        }
      }
      if (!sdk.tweets?.listSubmissions) {
        return { submissions: [], nextPage: null }
      }
      const page = (pageParam as number) ?? 0
      const raw = await sdk.tweets.listSubmissions(publicKey.toString(), { limit: 20, offset: page * 20 })
      const data = raw as { submissions?: TweetSubmission[]; hasMore?: boolean }
      return {
        submissions: data.submissions ?? [],
        nextPage: data.hasMore ? page + 1 : null,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!client && !!publicKey,
    staleTime: 60_000,
  })
}
