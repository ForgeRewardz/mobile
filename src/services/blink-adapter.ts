/**
 * MWA Blink Adapter.
 *
 * Defines the BlinkAdapter interface and a factory that wraps the mobile
 * wallet's signing primitives for use by the native Blink card (Task #23)
 * and the Blink execution screen (Task #24).
 *
 * The adapter is intentionally thin: transaction deserialization and
 * blockhash refresh are handled at the wallet layer (signAndSendTransaction
 * from useMobileWallet), so the base64 transaction string is passed through
 * unchanged. Keeping the adapter dumb avoids double-decoding and lets the
 * wallet enforce its own signing safety guarantees.
 */

export interface BlinkAdapter {
  /** Returns connected wallet pubkey. */
  connect(): Promise<string>
  /** Signs a VersionedTransaction and returns the signature after submission. */
  signAndSend(tx: unknown): Promise<string>
  /** Waits for the transaction to confirm. */
  confirm(signature: string): Promise<void>
  /** The wallet address for display. */
  readonly address: string
}

export interface CreateBlinkAdapterParams {
  address: string
  signAndSendTransaction: (tx: unknown) => Promise<string>
}

/**
 * Build a BlinkAdapter from the mobile wallet context.
 *
 * Accepts signing primitives from useWallet() and wraps them in the
 * BlinkAdapter interface. The wallet layer handles blockhash refresh
 * before signing — critical for Solana Actions, where a stale blockhash
 * results in silent failures on submission.
 */
export function createBlinkAdapter(params: CreateBlinkAdapterParams): BlinkAdapter {
  return {
    address: params.address,
    async connect() {
      return params.address
    },
    async signAndSend(tx: unknown) {
      return params.signAndSendTransaction(tx)
    },
    async confirm(_signature: string) {
      // Confirmation polling is handled by use-transaction-status (separate
      // task). This is a no-op at the adapter level so callers can compose
      // confirmation concerns without coupling to this interface.
    },
  }
}
