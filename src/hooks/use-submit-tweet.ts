import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { useWallet } from './useWallet'
import { useRewardzClient } from './useRewardzClient'
import type { TweetSubmission } from '@/types/api'

interface SubmitTweetParams {
  tweetUrl: string
  protocolId?: string
}

/**
 * Mutation hook for submitting a tweet URL for reward verification.
 *
 * Uses the real @rewardz/sdk TweetClient (client.tweets.submit).
 */
export function useSubmitTweet(): UseMutationResult<TweetSubmission, Error, SubmitTweetParams> {
  const { publicKey } = useWallet()
  const client = useRewardzClient()

  return useMutation<TweetSubmission, Error, SubmitTweetParams>({
    mutationFn: async ({ tweetUrl, protocolId }) => {
      if (!client) throw new Error('Wallet not connected')
      if (!publicKey) throw new Error('Wallet address unavailable')
      const raw = await client.tweets.submit(tweetUrl, publicKey.toString(), protocolId)
      return raw as unknown as TweetSubmission
    },
  })
}
