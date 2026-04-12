import { useEffect, useMemo, useState } from 'react'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { getCurrentGameRound } from '@/services/game-api'
import { useWallet } from './useWallet'
import type { CurrentGameRoundResponse } from '@/types/api'

export type UseGameRoundReturn = UseQueryResult<CurrentGameRoundResponse> & {
  secondsRemaining: number | null
  countdownLabel: string
}

function getSecondsRemaining(estimatedEndsAt: string | null | undefined, now: number): number | null {
  if (!estimatedEndsAt) return null
  const endsAt = new Date(estimatedEndsAt).getTime()
  if (!Number.isFinite(endsAt)) return null
  return Math.max(0, Math.ceil((endsAt - now) / 1000))
}

function formatCountdown(secondsRemaining: number | null, status?: string): string {
  if (status === 'settling') return 'Settling'
  if (status === 'waiting') return 'Opening soon'
  if (status === 'settled') return 'Settled'
  if (status === 'skipped') return 'Skipped'
  if (secondsRemaining == null) return status === 'active' ? 'Round active' : 'Waiting for next round'
  if (secondsRemaining >= 55) return '~1 minute'
  if (secondsRemaining >= 10) return `${secondsRemaining}s left`
  if (secondsRemaining > 0) return `0:0${secondsRemaining} left`
  return 'Ending now'
}

export function useGameRound(): UseGameRoundReturn {
  const { publicKey } = useWallet()
  const [now, setNow] = useState(() => Date.now())

  const query = useQuery<CurrentGameRoundResponse>({
    queryKey: ['game-round-current', publicKey?.toString() ?? 'anon'],
    queryFn: () => getCurrentGameRound(publicKey?.toString()),
    staleTime: 2_000,
    refetchInterval: (q) => {
      const status = q.state.data?.round?.status
      if (status === 'active' || status === 'settling' || status === 'waiting') return 3_000
      return 8_000
    },
  })

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1_000)
    return () => clearInterval(timer)
  }, [])

  const secondsRemaining = useMemo(
    () => getSecondsRemaining(query.data?.round?.estimatedEndsAt, now),
    [query.data?.round?.estimatedEndsAt, now],
  )
  const countdownLabel = formatCountdown(secondsRemaining, query.data?.round?.status)

  return {
    ...query,
    secondsRemaining,
    countdownLabel,
  }
}
