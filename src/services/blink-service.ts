/**
 * Blink metadata fetcher.
 *
 * Fetches Dialect Blink (Solana Action) metadata via GET and caches results
 * for 5 minutes to avoid re-fetching on navigation. Attaches the configured
 * X-Blink-Client-Key header for Dialect attribution.
 */

import { ENV } from '@/config/env'
import type { BlinkMetadata } from '@/types/api'

const CACHE_TTL_MS = 5 * 60_000

interface CacheEntry {
  data: BlinkMetadata
  expiresAt: number
}

const metadataCache = new Map<string, CacheEntry>()

/**
 * Fetches Blink metadata via GET.
 *
 * Includes X-Blink-Client-Key header for Dialect attribution when configured.
 * Successful responses are cached for 5 minutes keyed by action URL. Cache
 * hits are returned without network I/O; stale entries are evicted on access.
 */
export async function fetchBlinkMetadata(actionUrl: string): Promise<BlinkMetadata> {
  const cached = metadataCache.get(actionUrl)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data
  }
  // Evict stale entry (if any) so we don't hold onto expired data on failure.
  if (cached) {
    metadataCache.delete(actionUrl)
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  if (ENV.BLINK_CLIENT_KEY) {
    headers['X-Blink-Client-Key'] = ENV.BLINK_CLIENT_KEY
  }

  const response = await fetch(actionUrl, { headers })
  if (!response.ok) {
    throw new Error(`Failed to fetch Blink metadata: ${response.status}`)
  }

  const data = (await response.json()) as BlinkMetadata

  // Basic shape validation. Dialect Actions always report type="action";
  // anything else is either a bad URL or a protocol version we don't support.
  if (data.type !== 'action') {
    throw new Error('Invalid Blink metadata: expected type="action"')
  }

  metadataCache.set(actionUrl, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })

  return data
}

/** Clear all cached Blink metadata. Primarily useful for tests and on logout. */
export function clearBlinkCache(): void {
  metadataCache.clear()
}
