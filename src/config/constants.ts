// PDA seeds — must match mvp-smart-contracts/api/src/consts.rs
export const SEED_CONFIG = 'config'
export const SEED_USER_STAKE = 'user_stake'
export const SEED_PROTOCOL_STAKE = 'protocol_stake'
export const SEED_RENTAL = 'rental'
export const SEED_POINT_ROOT = 'point_root'
export const SEED_GAME_CONFIG = 'game_config'
export const SEED_GAME_ROUND = 'game_round'
export const SEED_PLAYER_DEPLOYMENT = 'deployment'
export const SEED_GAME_TREASURY = 'game_treasury'
export const SEED_ROUND_VAULT = 'round_vault'

export const DEFAULT_GAME_FEE_LAMPORTS = 6_000_000
export const DEFAULT_MINING_ROUND_SLOTS = 150

// Tab names
export const TABS = {
  HOME: 'home',
  EXPLORE: 'explore',
  REWARDS: 'rewards',
  PROFILE: 'profile',
} as const

// API pagination defaults
export const DEFAULT_PAGE_SIZE = 20
export const DEFAULT_STALE_TIME = 30_000
