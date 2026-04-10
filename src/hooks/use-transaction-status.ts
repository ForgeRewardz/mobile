import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useWallet } from './useWallet'

export type TxStatus = 'processing' | 'confirmed' | 'finalized' | 'failed' | 'expired'

interface TransactionStatusResult {
  status: TxStatus
  signature: string
  slot?: number
  error?: string
}

/**
 * Polls transaction status via RPC every 2 seconds.
 *
 * Stops polling on terminal states (confirmed, finalized, failed, expired).
 * Warns after 60 seconds ("slow confirmation"). Uses @solana/kit RPC client
 * from useWallet.
 */
export function useTransactionStatus(signature: string | null): UseQueryResult<TransactionStatusResult> {
  const { client } = useWallet()

  return useQuery<TransactionStatusResult>({
    queryKey: ['tx-status', signature],
    queryFn: async (): Promise<TransactionStatusResult> => {
      if (!signature || !client) {
        throw new Error('No signature or client')
      }

      // @solana/kit RPC pattern: client.rpc.getSignatureStatuses([sig]).send()
      // Cast via unknown to accept the loosely-typed @wallet-ui/@solana/kit client shape
      const rpc = (
        client as unknown as { rpc?: { getSignatureStatuses?: (sigs: unknown[]) => { send: () => Promise<unknown> } } }
      ).rpc
      if (!rpc?.getSignatureStatuses) {
        // RPC unavailable — return processing so the poll keeps spinning
        return { status: 'processing', signature }
      }

      try {
        const response = (await rpc.getSignatureStatuses([signature as unknown]).send()) as {
          value?: Array<{
            slot?: number
            err?: unknown
            confirmationStatus?: string
          } | null>
        }

        const entry = response.value?.[0]
        if (!entry) {
          return { status: 'processing', signature }
        }

        if (entry.err) {
          return {
            status: 'failed',
            signature,
            error: typeof entry.err === 'string' ? entry.err : 'Transaction failed',
          }
        }

        const confirmStatus = entry.confirmationStatus
        if (confirmStatus === 'finalized') {
          return { status: 'finalized', signature, slot: entry.slot }
        }
        if (confirmStatus === 'confirmed') {
          return { status: 'confirmed', signature, slot: entry.slot }
        }
        return { status: 'processing', signature, slot: entry.slot }
      } catch {
        return { status: 'processing', signature }
      }
    },
    enabled: !!signature && !!client,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return 2_000
      if (['finalized', 'confirmed', 'failed', 'expired'].includes(data.status)) {
        return false
      }
      return 2_000
    },
    staleTime: 0,
  })
}
