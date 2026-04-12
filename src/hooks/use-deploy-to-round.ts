import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import {
  address,
  appendTransactionMessageInstruction,
  compileTransaction,
  createTransactionMessage,
  getBase58Decoder,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
} from '@solana/kit'
import { findGameRoundPda, findPlayerDeploymentPda, getDeployToRoundInstructionAsync } from '@rewardz/sdk/generated'
import { useWallet } from './useWallet'
import { ENV } from '@/config/env'
import { u64ToLeBytes } from '@/utils/pda'

export interface DeployToRoundParams {
  roundId: string
  points: number
}

export function useDeployToRound(): UseMutationResult<string, Error, DeployToRoundParams> {
  const { publicKey, client, getTransactionSigner, signAndSendTransaction } = useWallet()
  const queryClient = useQueryClient()

  return useMutation<string, Error, DeployToRoundParams>({
    mutationFn: async ({ roundId, points }) => {
      if (!publicKey) throw new Error('Wallet not connected')
      if (!client) throw new Error('Wallet RPC client unavailable')
      if (!getTransactionSigner) throw new Error('Wallet signer unavailable')
      if (!signAndSendTransaction) throw new Error('Wallet sign-and-send unavailable')
      if (!Number.isSafeInteger(points) || points <= 0) throw new Error('Enter a whole point amount')

      const userAddress = address(publicKey.toString())
      const programAddress = address(ENV.REWARDZ_PROGRAM_ID)
      const roundIdBytes = u64ToLeBytes(roundId)
      const { value: latestBlockhash, context } = await client.rpc.getLatestBlockhash().send()
      const minContextSlot = BigInt(context.slot)
      const user = getTransactionSigner(userAddress, minContextSlot)
      const [gameRound] = await findGameRoundPda({ roundIdBytes }, { programAddress })
      const [playerDeployment] = await findPlayerDeploymentPda(
        { roundIdBytes, authority: userAddress },
        { programAddress },
      )
      const instruction = await getDeployToRoundInstructionAsync(
        {
          user,
          gameRound,
          playerDeployment,
          points: BigInt(points),
        },
        { programAddress },
      )
      const transactionMessage = pipe(
        createTransactionMessage({ version: 0 }),
        (message) => setTransactionMessageFeePayer(userAddress, message),
        (message) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, message),
        (message) => appendTransactionMessageInstruction(instruction, message),
      )
      const transaction = compileTransaction(transactionMessage)
      const signatureBytes = await signAndSendTransaction(transaction, minContextSlot)
      return getBase58Decoder().decode(signatureBytes as Uint8Array)
    },
    onSuccess: async (_signature, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['game-round-current'] }),
        queryClient.invalidateQueries({ queryKey: ['game-round-results', variables.roundId] }),
        queryClient.invalidateQueries({ queryKey: ['points-balance'] }),
      ])
    },
  })
}
