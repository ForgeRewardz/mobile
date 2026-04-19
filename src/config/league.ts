// ---------------------------------------------------------------------------
// mobile/src/config/league.ts — thin wrapper around @rewardz/types LeagueConfig.
//
// Selects the devnet/mainnet preset at build time from `expo-constants.extra`
// (populated from app.config.* via `SOLANA_NETWORK`). No server round-trip.
// ---------------------------------------------------------------------------

import Constants from 'expo-constants'
import { DEVNET, MAINNET, type LeagueConfig, type Network } from '@rewardz/types'

function resolveNetwork(): Network {
  const raw = Constants.expoConfig?.extra?.SOLANA_NETWORK
  if (raw === 'devnet' || raw === 'mainnet') return raw
  // Devnet is the default while the league is pre-mainnet. Loud log so an
  // accidental mainnet build does not silently pick a devnet preset.
  if (raw !== undefined) {
    console.warn(`[league] unknown SOLANA_NETWORK=${raw}; defaulting to devnet`)
  }
  return 'devnet'
}

const NETWORK: Network = resolveNetwork()

export const LEAGUE: LeagueConfig = NETWORK === 'mainnet' ? MAINNET : DEVNET
export { NETWORK }
