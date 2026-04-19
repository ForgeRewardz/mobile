import Constants from 'expo-constants'

export type Network = 'devnet' | 'staging' | 'mainnet-beta' | 'localnet'

const extra = Constants.expoConfig?.extra ?? {}

export const ENV = {
  SOLANA_NETWORK: (extra.SOLANA_NETWORK ?? 'devnet') as Network,
  SOLANA_RPC_URL: (extra.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com') as string,
  PROGRAM_ID: (extra.PROGRAM_ID ?? 'rwdzuEW5UsQ5RM53LAqTBaJWirR14HdH19GnTgvKo7C') as string,
  TOKEN_X_MINT: (extra.TOKEN_X_MINT ?? '') as string,
  API_BASE_URL: (extra.API_BASE_URL ?? 'http://localhost:3001') as string,
  BLINK_CLIENT_KEY: (extra.BLINK_CLIENT_KEY ?? '') as string,
} as const
