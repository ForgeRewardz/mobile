import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useWallet } from './useWallet'
import { getUserStakePda } from '@/utils/pda'
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
 * If the account does not exist (user has never staked), returns a default
 * status with `isActive: false` and all amounts zeroed.
 *
 * Uses a 30-second stale time and 60-second refetch interval to keep the
 * UI reasonably fresh without hammering the RPC.
 */
export function useStakeStatus(): UseQueryResult<StakeStatus> {
  const { publicKey, client } = useWallet()

  return useQuery<StakeStatus>({
    queryKey: ['stake-status', publicKey?.toString()],
    queryFn: async (): Promise<StakeStatus> => {
      if (!publicKey || !client) {
        throw new Error('Wallet not connected')
      }

      // Derive the UserStake PDA for this wallet
      const [stakePda] = await getUserStakePda(publicKey)

      // Fetch the account via the RPC client provided by @wallet-ui
      const accountInfo = await client.getAccountInfo(stakePda, { encoding: 'base64' }).send()

      // Account does not exist — user has never staked
      if (!accountInfo.value) {
        return DEFAULT_STAKE_STATUS
      }

      // Account exists — decode the raw data.
      // The on-chain UserStake layout (Steel framework) uses an 8-byte
      // discriminator followed by fields. Until we wire up the full Codama
      // decoder for React Native, we parse the key u64 (staked_amount) at
      // the known offset and mark the account as active.
      try {
        const raw = accountInfo.value.data
        const buffer =
          typeof raw === 'string'
            ? Buffer.from(raw, 'base64')
            : // RPC may return [base64String, "base64"] tuple
              Array.isArray(raw)
              ? Buffer.from(raw[0] as string, 'base64')
              : Buffer.from(raw as unknown as ArrayBuffer)

        // Layout offsets (Steel/Anchor standard):
        //   0..8   — discriminator
        //   8..16  — authority (pubkey, 32 bytes) — skip
        //  40..48  — staked_amount (u64, little-endian)
        const STAKED_AMOUNT_OFFSET = 40

        let stakedAmount = 0
        if (buffer.length > STAKED_AMOUNT_OFFSET + 8) {
          // Read u64 as little-endian. JavaScript numbers are safe up to 2^53.
          const lo = buffer.readUInt32LE(STAKED_AMOUNT_OFFSET)
          const hi = buffer.readUInt32LE(STAKED_AMOUNT_OFFSET + 4)
          stakedAmount = lo + hi * 2 ** 32
        }

        return {
          stakedAmount,
          // Detailed fields will be populated once full decoder is connected
          availableForRental: 0,
          totalRentedOut: 0,
          rentalEarned: 0,
          isActive: stakedAmount > 0,
        }
      } catch {
        // If decoding fails, the account exists so mark as active with
        // unknown amount — better than crashing.
        return {
          ...DEFAULT_STAKE_STATUS,
          isActive: true,
        }
      }
    },
    enabled: !!publicKey && !!client,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}
