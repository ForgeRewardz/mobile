// PDA seeds — must match mvp-smart-contracts/api/src/consts.rs
export const SEED_CONFIG = 'config'
export const SEED_USER_STAKE = 'user_stake'
export const SEED_PROTOCOL_STAKE = 'protocol_stake'
export const SEED_RENTAL = 'rental'
export const SEED_POINT_ROOT = 'point_root'
export const SEED_MINT_ATTEMPT = 'mint_attempt'

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
