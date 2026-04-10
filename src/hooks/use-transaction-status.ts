import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useWallet } from './useWallet'

export type TxStatus = 'processing' | 'confirmed' | 'finalized' | 'failed' | 'expired' | 'rpc_unavailable'

interface TransactionStatusResult {
  status: TxStatus
  signature: string
  slot?: number
  error?: string
}

interface RpcClient {
  rpc?: {
    getSignatureStatuses?: (sigs: unknown[]) => { send: () => Promise<unknown> }
  }
}

/**
 * Polls transaction status via RPC every 2 seconds.
 *
 * Stops polling on terminal states (confirmed, finalized, failed, expired).
 * Returns rpc_unavailable when the RPC client cannot be reached so the UI
 * can surface an error instead of spinning forever. Errors from the RPC
 * call propagate via React Query's retry mechanism (3 retries with backoff).
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
      const rpc = (client as unknown as RpcClient).rpc
      if (!rpc?.getSignatureStatuses) {
        // RPC method unavailable — report explicitly so UI can show error
        return { status: 'rpc_unavailable', signature, error: 'RPC client unavailable' }
      }

      const response = (await rpc.getSignatureStatuses([signature as unknown]).send()) as {
        value?: ({
          slot?: number
          err?: unknown
          confirmationStatus?: string
        } | null)[]
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
    },
    enabled: !!signature && !!client,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    refetchInterval: (query) => {
      const data = query.state.data
      // Stop polling on terminal states OR rpc_unavailable
      if (data && ['finalized', 'confirmed', 'failed', 'expired', 'rpc_unavailable'].includes(data.status)) {
        return false
      }
      return 2_000
    },
    staleTime: 0,
  })
}
