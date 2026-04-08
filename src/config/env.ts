import Constants from 'expo-constants'

export type Cluster = 'devnet' | 'staging' | 'mainnet-beta'

const extra = Constants.expoConfig?.extra ?? {}

export const ENV = {
  SOLANA_CLUSTER: (extra.SOLANA_CLUSTER ?? 'devnet') as Cluster,
  RPC_URL: (extra.RPC_URL ?? 'https://api.devnet.solana.com') as string,
  REWARDZ_PROGRAM_ID: (extra.REWARDZ_PROGRAM_ID ?? '11111111111111111111111111111111') as string,
  TOKEN_X_MINT: (extra.TOKEN_X_MINT ?? '') as string,
  INTENT_API_BASE_URL: (extra.INTENT_API_BASE_URL ?? 'http://localhost:3001') as string,
  BLINK_CLIENT_KEY: (extra.BLINK_CLIENT_KEY ?? '') as string,
} as const
