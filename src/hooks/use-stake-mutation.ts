import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import { useWallet } from './useWallet'

interface StakeMutationContext {
  previousStatus: unknown
}

export interface UseStakeMutationReturn {
  stake: UseMutationResult<string, Error, number, StakeMutationContext>
  addStake: UseMutationResult<string, Error, number, StakeMutationContext>
  unstake: UseMutationResult<string, Error, number, StakeMutationContext>
}

/**
 * Provides three mutations for staking operations: `stake`, `addStake`, and
 * `unstake`. Each accepts an amount (in lamports) and will build, sign, and
 * send the corresponding on-chain transaction via Mobile Wallet Adapter.
 *
 * On success every mutation invalidates the `stake-status` query so the UI
 * reflects the updated on-chain state.
 *
 * **Current status:** The mutation functions are structurally complete but
 * throw "not yet connected" errors because the program instruction builders
 * require a deployed program on devnet. Once the smart contract is live, the
 * `mutationFn` bodies will be replaced with real instruction building via
 * the `@rewardz/sdk` generated builders.
 */
export function useStakeMutation(): UseStakeMutationReturn {
  const { publicKey, signAndSendTransaction } = useWallet()
  const queryClient = useQueryClient()

  const stake = useMutation<string, Error, number, StakeMutationContext>({
    mutationFn: async (amount: number): Promise<string> => {
      if (!publicKey || !signAndSendTransaction) {
        throw new Error('Wallet not connected')
      }
      if (amount <= 0) {
        throw new Error('Stake amount must be positive')
      }
      // TODO: Build userStake instruction using @rewardz/sdk generated builders
      // 1. Derive UserStake PDA via getUserStakePda(publicKey)
      // 2. Derive Config PDA via getConfigPda()
      // 3. Build instruction with program ID, accounts, and amount arg
      // 4. Build transaction, set recent blockhash
      // 5. Sign and send via signAndSendTransaction
      throw new Error('Staking not yet connected to deployed program')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stake-status'] })
    },
  })

  const addStake = useMutation<string, Error, number, StakeMutationContext>({
    mutationFn: async (amount: number): Promise<string> => {
      if (!publicKey || !signAndSendTransaction) {
        throw new Error('Wallet not connected')
      }
      if (amount <= 0) {
        throw new Error('Amount must be positive')
      }
      // TODO: Build userAddStake instruction using @rewardz/sdk generated builders
      // 1. Derive UserStake PDA via getUserStakePda(publicKey)
      // 2. Build instruction with program ID, accounts, and amount arg
      // 3. Build transaction, set recent blockhash
      // 4. Sign and send via signAndSendTransaction
      throw new Error('Add stake not yet connected to deployed program')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stake-status'] })
    },
  })

  const unstake = useMutation<string, Error, number, StakeMutationContext>({
    mutationFn: async (amount: number): Promise<string> => {
      if (!publicKey || !signAndSendTransaction) {
        throw new Error('Wallet not connected')
      }
      if (amount <= 0) {
        throw new Error('Unstake amount must be positive')
      }
      // TODO: Build userUnstake instruction using @rewardz/sdk generated builders
      // 1. Derive UserStake PDA via getUserStakePda(publicKey)
      // 2. Build instruction with program ID, accounts, and amount arg
      // 3. Build transaction, set recent blockhash
      // 4. Sign and send via signAndSendTransaction
      throw new Error('Unstake not yet connected to deployed program')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stake-status'] })
    },
  })

  return { stake, addStake, unstake }
}
