/**
 * Route parameter types for Expo Router type-safe navigation.
 * These mirror the file-based routes in src/app/.
 */

export type HomeStackParams = {
  index: undefined
  search: undefined
  results: { query: string }
  'offer/[id]': { id: string }
  blink: { offerId: string; actionUrl: string }
  pending: { signature: string; completionId: string }
  verifying: { completionId: string }
  awarded: { points: number; completionId: string }
  rejected: { reason: string; completionId: string }
}

export type ExploreStackParams = {
  index: undefined
  'mission/[id]': { id: string }
}

export type RewardsStackParams = {
  index: undefined
  history: undefined
  mining: undefined
  sync: undefined
}

export type ProfileStackParams = {
  index: undefined
  stake: undefined
  notifications: undefined
  settings: undefined
  help: undefined
}

export type AuthStackParams = {
  welcome: undefined
  connect: undefined
  unlock: undefined
  success: undefined
}
