import { createSolanaDevnet, createSolanaMainnet } from '@wallet-ui/react-native-kit'
import { ENV } from './env'

export function getCluster() {
  switch (ENV.SOLANA_CLUSTER) {
    case 'mainnet-beta':
      return createSolanaMainnet(ENV.RPC_URL)
    case 'devnet':
    case 'staging':
    default:
      return createSolanaDevnet(ENV.RPC_URL)
  }
}

export function getAppIdentity() {
  return {
    name: 'Rewardz',
    uri: 'https://rewardz.xyz',
    icon: 'favicon.png',
  }
}
