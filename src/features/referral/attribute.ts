import { ENV } from '@/config/env'
import { REFERRAL_ATTRIBUTE_PATH } from './constants'

/**
 * POST the referral attribution to the API. Fire-and-forget from the caller;
 * the server is idempotent and first-wins — repeat calls return
 * `200 { already_attributed: true }`.
 *
 * Pure async function (no hooks) so it can be unit-tested in isolation.
 */
export async function attributeReferral(walletAddress: string, referralCode: string): Promise<void> {
  const baseUrl = ENV.API_BASE_URL
  if (!baseUrl) {
    throw new Error('API_BASE_URL is not set; cannot attribute referral')
  }

  const url = `${baseUrl.replace(/\/+$/, '')}${REFERRAL_ATTRIBUTE_PATH}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet: walletAddress, code: referralCode }),
  })

  if (!res.ok) {
    throw new Error(`Referral attribution failed: ${res.status} ${res.statusText}`)
  }
}
