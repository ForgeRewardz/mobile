import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { getGameRoundResults } from '@/services/game-api'
import { useWallet } from './useWallet'
import type { GameRoundResults } from '@/types/api'

export function useRoundResult(roundId: string | null | undefined): UseQueryResult<GameRoundResults> {
  const { publicKey } = useWallet()

  return useQuery<GameRoundResults>({
    queryKey: ['game-round-results', roundId ?? 'none', publicKey?.toString() ?? 'anon'],
    queryFn: async (): Promise<GameRoundResults> => {
      if (!roundId) throw new Error('No round selected')
      return getGameRoundResults(roundId, publicKey?.toString())
    },
    enabled: !!roundId,
    staleTime: 0,
    refetchInterval: (query) => {
      const status = query.state.data?.round.status
      if (status === 'settled' || status === 'skipped') return false
      return 3_000
    },
  })
}
