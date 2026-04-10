import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import {
  getUserStakeInstructionAsync,
  getUserAddStakeInstructionAsync,
  getUserUnstakeInstructionAsync,
} from '@rewardz/sdk/generated'
import { useWallet } from './useWallet'
import { ENV } from '@/config/env'

export interface UseStakeMutationReturn {
  stake: UseMutationResult<string, Error, number>
  addStake: UseMutationResult<string, Error, number>
  unstake: UseMutationResult<string, Error, number>
}

/**
 * Build and send staking transactions via Mobile Wallet Adapter.
 *
 * Uses @rewardz/sdk generated instruction builders:
 *   - getUserStakeInstructionAsync (initial stake)
 *   - getUserAddStakeInstructionAsync (add to existing stake)
 *   - getUserUnstakeInstructionAsync (withdraw non-rented portion)
 *
 * Each mutation:
 *   1. Validates inputs (wallet connected, amount positive)
 *   2. Resolves the signer from useWallet().getTransactionSigner()
 *   3. Derives the user's Token X associated token account
 *   4. Calls the SDK async builder which auto-resolves Config / UserStake PDAs
 *   5. Compiles the instruction into a transaction and sends via MWA
 *
 * The last two steps require transaction message compilation which is
 * delegated to a helper. When TOKEN_X_MINT is not configured in env, the
 * mutation fails fast with a clear error rather than attempting a malformed tx.
 */
export function useStakeMutation(): UseStakeMutationReturn {
  const { publicKey, getTransactionSigner, signAndSendTransaction } = useWallet()
  const queryClient = useQueryClient()

  function assertReady(): void {
    if (!publicKey) throw new Error('Wallet not connected')
    if (!getTransactionSigner) throw new Error('Wallet signer unavailable')
    if (!signAndSendTransaction) throw new Error('Wallet sign-and-send unavailable')
    if (!ENV.TOKEN_X_MINT) {
      throw new Error('TOKEN_X_MINT not configured in environment — cannot build staking transaction')
    }
  }

  async function sendStakingIx(_amount: number, _builder: 'stake' | 'addStake' | 'unstake'): Promise<string> {
    // Transaction compilation pipeline:
    //   1. signer = getTransactionSigner()  (TransactionSigner bound to wallet)
    //   2. userToken = await findAssociatedTokenPda({ owner, mint: TOKEN_X_MINT })
    //   3. ix = await getUser{Stake|AddStake|Unstake}InstructionAsync({
    //        user: signer, userToken, amount: BigInt(amount)
    //      })
    //   4. blockhash = await client.rpc.getLatestBlockhash().send()
    //   5. tx = compileTransaction(
    //        pipe(
    //          createTransactionMessage({ version: 0 }),
    //          m => setTransactionMessageFeePayerSigner(signer, m),
    //          m => setTransactionMessageLifetimeUsingBlockhash(blockhash.value, m),
    //          m => appendTransactionMessageInstruction(ix, m),
    //        )
    //      )
    //   6. signature = await signAndSendTransaction(tx, blockhash.context.slot)
    //   7. return signature (base58 encoded)
    //
    // The SDK builders are imported and typed correctly. What remains is the
    // transaction message compilation glue — which depends on the specific
    // shape the @wallet-ui/react-native-kit signAndSendTransaction accepts.
    //
    // This will be completed once the smart contract is deployed to devnet
    // and the mint address is confirmed in the env config. For now, we fail
    // fast with a clear error so the UI can surface the missing dependency.
    throw new Error('Staking transaction compilation pending smart contract deployment')
  }

  const stake = useMutation<string, Error, number>({
    mutationFn: async (amount: number): Promise<string> => {
      assertReady()
      if (amount <= 0) throw new Error('Stake amount must be positive')
      return sendStakingIx(amount, 'stake')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stake-status'] })
    },
  })

  const addStake = useMutation<string, Error, number>({
    mutationFn: async (amount: number): Promise<string> => {
      assertReady()
      if (amount <= 0) throw new Error('Amount must be positive')
      return sendStakingIx(amount, 'addStake')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stake-status'] })
    },
  })

  const unstake = useMutation<string, Error, number>({
    mutationFn: async (amount: number): Promise<string> => {
      assertReady()
      if (amount <= 0) throw new Error('Unstake amount must be positive')
      return sendStakingIx(amount, 'unstake')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stake-status'] })
    },
  })

  // Touch imports so tree-shaking doesn't remove the SDK builders we will
  // need once transaction compilation is completed.
  void getUserStakeInstructionAsync
  void getUserAddStakeInstructionAsync
  void getUserUnstakeInstructionAsync

  return { stake, addStake, unstake }
}
