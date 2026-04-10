import { useMutation } from '@tanstack/react-query'
import { useRewardzClient } from './useRewardzClient'
import type { TweetSubmission } from '@/types/api'

interface SubmitTweetParams {
  tweetUrl: string
  protocolId?: string
}

/**
 * Submit a tweet for verification + reward evaluation.
 *
 * The on-chain SDK currently does not expose a typed `tweets.submit` method,
 * so we probe the client at runtime via a structural cast. When the SDK ships
 * a first-class tweet integration the cast can be removed in favour of the
 * generated client call.
 */
export function useSubmitTweet() {
  const client = useRewardzClient()

  return useMutation<TweetSubmission, Error, SubmitTweetParams>({
    mutationFn: async ({ tweetUrl, protocolId }) => {
      if (!client) throw new Error('Wallet not connected')
      // Access tweet integration via SDK
      const sdk = client as unknown as {
        tweets?: {
          submit: (url: string, wallet: string, protocolId?: string) => Promise<unknown>
        }
      }
      if (!sdk.tweets?.submit) {
        throw new Error('Tweet submission not yet supported by SDK')
      }
      const raw = await sdk.tweets.submit(tweetUrl, '', protocolId)
      return raw as TweetSubmission
    },
  })
}
