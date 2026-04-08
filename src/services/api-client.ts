import { ENV } from '@/config/env'
import { getOrCreateAuthSession, type WalletAdapter } from './wallet-service'
import type {
  ResolveIntentResponse,
  Completion,
  UserBalance,
  PointEvent,
  IntentOffer,
  PaginatedResponse,
} from '@/types/api'

const REQUEST_TIMEOUT_MS = 15_000

/**
 * Thin HTTP client mirroring @rewardz/sdk RewardzClient.
 * When the SDK upgrades to @solana/kit v6, replace with import from @rewardz/sdk/client.
 *
 * Auth: signs once per session (5 min TTL), caches signature to avoid
 * triggering MWA wallet popup on every request.
 */
export class RewardzApiClient {
  private baseUrl: string
  private wallet: WalletAdapter

  constructor({ apiBaseUrl, wallet }: { apiBaseUrl?: string; wallet: WalletAdapter }) {
    this.baseUrl = apiBaseUrl ?? ENV.INTENT_API_BASE_URL
    this.wallet = wallet
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const session = await getOrCreateAuthSession(this.wallet)
    return {
      'x-wallet-address': session.address,
      'x-wallet-signature': session.signature,
      'x-wallet-timestamp': String(session.timestamp),
    }
  }

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const authHeaders = await this.getAuthHeaders()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
          ...options.headers,
        },
      })
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new Error(`API ${res.status}: ${body}`)
      }
      return res.json() as Promise<T>
    } finally {
      clearTimeout(timeout)
    }
  }

  async resolveIntent(query: string): Promise<ResolveIntentResponse> {
    return this.fetch('/v1/intents/resolve', {
      method: 'POST',
      body: JSON.stringify({ query }),
    })
  }

  async browseOffers(params?: {
    actionType?: string
    page?: number
    pageSize?: number
  }): Promise<PaginatedResponse<IntentOffer>> {
    const qs = new URLSearchParams()
    if (params?.actionType) qs.set('actionType', params.actionType)
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    return this.fetch(`/v1/offers?${qs}`)
  }

  async initCompletion(offerId: string): Promise<Completion> {
    return this.fetch('/v1/completions/init', {
      method: 'POST',
      body: JSON.stringify({ offerId }),
    })
  }

  async reportCallback(completionId: string, signature: string): Promise<Completion> {
    return this.fetch('/v1/completions/callback', {
      method: 'POST',
      body: JSON.stringify({ completionId, signature }),
    })
  }

  async getCompletionStatus(completionId: string): Promise<Completion> {
    return this.fetch(`/v1/completions/${completionId}`)
  }

  async getPointsBalance(): Promise<UserBalance> {
    return this.fetch(`/v1/points/balance`)
  }

  async getRewardHistory(params?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<PointEvent>> {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    return this.fetch(`/v1/points/history?${qs}`)
  }
}
