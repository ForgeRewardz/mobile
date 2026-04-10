import { ExpoConfig, ConfigContext } from 'expo/config'

/**
 * Deep link map for the Rewardz app.
 *
 * The `rewardz://` URL scheme is registered via the top-level `scheme` field.
 * expo-router derives path handlers from the file-system route tree under
 * `src/app/`, so adding a screen like `src/app/(tabs)/home/submit-tweet.tsx`
 * automatically responds to `rewardz:///(tabs)/home/submit-tweet`.
 *
 * The `DEEP_LINKS` entries below document the canonical short aliases we
 * surface to users and external integrations. They are exposed via
 * `expo-constants` so callers can resolve a short name (e.g. 'submit-tweet')
 * to a full router path without hard-coding.
 */
const DEEP_LINKS = {
  'submit-tweet': '/(tabs)/home/submit-tweet',
} as const

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
    DEEP_LINKS,
  },
})
