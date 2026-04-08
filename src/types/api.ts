/**
 * API response types mirroring @rewardz/types.
 * When @rewardz/types is published to npm, replace these with direct imports.
 */

export interface IntentOffer {
  id: string
  protocolName: string
  actionType: string
  title: string
  description: string
  iconUrl: string
  actionUrl: string
  rewardPoints: number
  eligibility: 'eligible' | 'ineligible' | 'unknown'
  rank: number
}

export interface Completion {
  id: string
  offerId: string
  walletAddress: string
  status: 'pending' | 'verifying' | 'verified' | 'rejected' | 'expired'
  signature: string | null
  pointsAwarded: number | null
  createdAt: string
  updatedAt: string
}

export interface PointEvent {
  id: string
  walletAddress: string
  amount: number
  type: 'award' | 'burn' | 'sync'
  source: string
  completionId: string | null
  createdAt: string
}

export interface UserBalance {
  walletAddress: string
  totalPoints: number
  pendingPoints: number
  usablePoints: number
  onChainSynced: number
}

export interface Quest {
  id: string
  title: string
  description: string
  questType: 'hold' | 'engagement' | 'newcomer' | 'composable' | 'streak' | 'subscription'
  rewardPoints: number
  steps: QuestStep[]
  expiresAt: string | null
}

export interface QuestStep {
  id: string
  order: number
  actionType: string
  protocolName: string
  description: string
  completed: boolean
}

export interface ResolveIntentResponse {
  offers: IntentOffer[]
  query: string
  resolverType: 'ai' | 'rules'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
