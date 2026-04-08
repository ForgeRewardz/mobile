import { ExpoConfig, ConfigContext } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Rewardz',
  slug: 'rewardz',
  scheme: 'rewardz',
  orientation: 'default',
  userInterfaceStyle: 'automatic',
  android: {
    package: 'xyz.rewardz.mobile',
  },
  web: {
    output: 'static',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#000000',
      },
    ],
  ],
  extra: {
    SOLANA_CLUSTER: process.env.SOLANA_CLUSTER || 'devnet',
    RPC_URL: process.env.RPC_URL || 'https://api.devnet.solana.com',
    REWARDZ_PROGRAM_ID: process.env.REWARDZ_PROGRAM_ID || '11111111111111111111111111111111',
    TOKEN_X_MINT: process.env.TOKEN_X_MINT || '',
    INTENT_API_BASE_URL: process.env.INTENT_API_BASE_URL || 'http://localhost:3001',
    BLINK_CLIENT_KEY: process.env.BLINK_CLIENT_KEY || '',
  },
})
