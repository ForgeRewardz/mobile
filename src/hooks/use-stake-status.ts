import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useWallet } from './useWallet'
import type { StakeStatus } from '@/types/api'

const DEFAULT_STAKE_STATUS: StakeStatus = {
  stakedAmount: 0,
  availableForRental: 0,
  totalRentedOut: 0,
  rentalEarned: 0,
  isActive: false,
}

/**
 * Reads the on-chain UserStake PDA for the connected wallet and returns
 * the current {@link StakeStatus}.
 *
 * Currently returns the default (unstaked) status. On-chain decoding will
 * be wired up once the smart contract is deployed to devnet — the SDK has
 * generated account decoders (userStake, globalConfig) ready to use.
 *
 * Uses a 30-second stale time and 60-second refetch interval.
 */
export function useStakeStatus(): UseQueryResult<StakeStatus> {
  const { publicKey } = useWallet()

  return useQuery<StakeStatus>({
    queryKey: ['stake-status', publicKey?.toString()],
    queryFn: async (): Promise<StakeStatus> => {
      if (!publicKey) {
        throw new Error('Wallet not connected')
      }

      // TODO: Connect to deployed smart contract
      // 1. Derive UserStake PDA: const [stakePda] = await getUserStakePda(publicKey)
      // 2. Fetch account via RPC: client.rpc.getAccountInfo(stakePda).send()
      // 3. Decode via @rewardz/sdk generated decoder
      // For now return default — UI handles the not-staked state.
      return DEFAULT_STAKE_STATUS
    },
    enabled: !!publicKey,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}
