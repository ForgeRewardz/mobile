/**
 * Blink execution service.
 *
 * Executes a Blink action end-to-end: POSTs the action URL with the wallet
 * account and any user-supplied parameters, extracts the returned
 * base64-encoded transaction, hands it to the BlinkAdapter for signing and
 * submission, and returns the on-chain signature.
 *
 * Action chaining is supported by returning the `links` object from the
 * response so callers can decide whether to follow `links.next`.
 */

import { ENV } from '@/config/env'
import type { BlinkTransactionResponse } from '@/types/api'
import type { BlinkAdapter } from './blink-adapter'

export interface ExecuteBlinkParams {
  actionUrl: string
  walletAddress: string
  parameters?: Record<string, string>
  adapter: BlinkAdapter
}

export interface ExecuteBlinkResult {
  signature: string
  nextAction?: BlinkTransactionResponse['links']
}

/**
 * Executes a Blink action: POST the action URL, deserialize the transaction,
 * sign via the adapter, and return the signature.
 *
 * Handles action chaining by surfacing `links.next` in the result. The
 * caller decides whether to follow the chain — this function only runs a
 * single step.
 */
export async function executeBlink({
  actionUrl,
  walletAddress,
  parameters,
  adapter,
}: ExecuteBlinkParams): Promise<ExecuteBlinkResult> {
  const body: Record<string, unknown> = {
    type: 'transaction',
    account: walletAddress,
    ...parameters,
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (ENV.BLINK_CLIENT_KEY) {
    headers['X-Blink-Client-Key'] = ENV.BLINK_CLIENT_KEY
  }

  const response = await fetch(actionUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(`Blink POST failed: ${response.status} ${errorBody}`)
  }

  const { transaction, links } = (await response.json()) as BlinkTransactionResponse

  if (!transaction) {
    throw new Error('Blink response missing transaction')
  }

  // The transaction is a base64-encoded VersionedTransaction string. The
  // adapter — and ultimately the wallet layer — is responsible for
  // deserialization and blockhash refresh. Passing it through unchanged
  // avoids double-decoding and keeps the transaction shape opaque at this
  // layer.
  const signature = await adapter.signAndSend(transaction)

  return {
    signature,
    nextAction: links,
  }
}
