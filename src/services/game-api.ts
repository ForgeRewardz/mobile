import { ENV } from '@/config/env'
import type { CurrentGameRoundResponse, GameRoundResults } from '@/types/api'

function gameUrl(path: string, walletAddress?: string | null): string {
  const base = ENV.API_BASE_URL.replace(/\/$/, '')
  const url = new URL(`${base}/v1${path}`)
  if (walletAddress) {
    url.searchParams.set('wallet', walletAddress)
  }
  return url.toString()
}

async function fetchGameJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(body || `Game API request failed with ${response.status}`)
  }
  return response.json() as Promise<T>
}

export function getCurrentGameRound(walletAddress?: string | null): Promise<CurrentGameRoundResponse> {
  return fetchGameJson(gameUrl('/game/round/current', walletAddress))
}

export function getGameRoundResults(roundId: string, walletAddress?: string | null): Promise<GameRoundResults> {
  return fetchGameJson(gameUrl(`/game/round/${roundId}/results`, walletAddress))
}
