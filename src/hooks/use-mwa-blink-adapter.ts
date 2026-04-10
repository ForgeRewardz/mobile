import { useMemo } from 'react'
import { getBase58Decoder, getBase64Encoder, getTransactionDecoder, type Transaction } from '@solana/kit'
import { useWallet } from './useWallet'
import { type BlinkAdapter, createBlinkAdapter } from '@/services/blink-adapter'

/**
 * Returns a memoised BlinkAdapter backed by the currently connected mobile
 * wallet, or `null` if no wallet is connected / signing primitives are
 * unavailable.
 *
 * The adapter's `signAndSend(tx)` accepts the base64-encoded transaction
 * string returned by a Dialect Blink POST response. The hook handles the
 * translation to @wallet-ui/react-native-kit's signing primitive:
 *
 *   1. Base64-decode the transaction string to wire bytes.
 *   2. Decode the bytes to a @solana/kit {@link Transaction} object.
 *   3. Fetch the latest blockhash context slot for `minContextSlot` so the
 *      wallet doesn't reject the transaction for being "too old" relative
 *      to its view of the cluster. The Blink server is responsible for
 *      setting a fresh blockhash inside the transaction itself — we do not
 *      rewrite it, because that would invalidate the server's partial
 *      signatures (if any).
 *   4. Call `signAndSendTransactions` on the wallet and base58-decode the
 *      returned signature bytes into the canonical string form used
 *      throughout the codebase.
 *
 * Consumers should treat `null` as "no adapter yet" and render a connect
 * prompt rather than attempting to call the Blink card / execution screen.
 */
export function useMwaBlinkAdapter(): BlinkAdapter | null {
  const { publicKey, signAndSendTransaction, client } = useWallet()

  return useMemo(() => {
    if (!publicKey || !signAndSendTransaction || !client) return null

    const base64Encoder = getBase64Encoder()
    const transactionDecoder = getTransactionDecoder()
    const base58Decoder = getBase58Decoder()

    return createBlinkAdapter({
      address: publicKey.toString(),
      signAndSendTransaction: async (tx: unknown): Promise<string> => {
        if (typeof tx !== 'string') {
          throw new Error('useMwaBlinkAdapter expected a base64-encoded transaction string from the Blink service')
        }

        // Decode the wire-format transaction that the Blink server sent us.
        const wireBytes = base64Encoder.encode(tx) as Uint8Array
        const decoded: Transaction = transactionDecoder.decode(wireBytes)

        // Fetch the latest blockhash context so the wallet has a sensible
        // `minContextSlot` floor. We do not touch `decoded` — the Blink
        // server owns the transaction's lifetime.
        const { context } = await client.rpc.getLatestBlockhash().send()
        const minContextSlot = BigInt(context.slot)

        // `signAndSendTransaction` is deprecated upstream in favour of
        // `signAndSendTransactions`, but useWallet currently surfaces the
        // singular form. Use it directly so we match the hook's public
        // surface and let the wallet layer handle MWA authorisation.
        const signatureBytes = await signAndSendTransaction(decoded, minContextSlot)

        // `signAndSendTransaction` returns `SignatureBytes` (a Uint8Array)
        // for a single transaction input. Convert to the canonical base58
        // signature string used by the rest of the app.
        return base58Decoder.decode(signatureBytes as Uint8Array)
      },
    })
  }, [publicKey, signAndSendTransaction, client])
}
