import { createSolanaDevnet, createSolanaMainnet } from '@wallet-ui/react-native-kit'
import { ENV } from './env'

export function getCluster() {
  switch (ENV.SOLANA_NETWORK) {
    case 'mainnet-beta':
      return createSolanaMainnet(ENV.SOLANA_RPC_URL)
    case 'devnet':
    case 'staging':
    case 'localnet':
    default:
      return createSolanaDevnet(ENV.SOLANA_RPC_URL)
  }
}

export function getAppIdentity() {
  return {
    name: 'Rewardz',
    uri: 'https://rewardz.xyz',
    icon: 'favicon.png',
  }
}
