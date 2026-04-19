/**
 * Mobile-side API types.
 *
 * Core SDK types are imported from @rewardz/types where available.
 * Mobile-specific types and display-layer extensions live here.
 */

// ---------------------------------------------------------------------------
//  Core entities (aligned with @rewardz/types and TODO-0013 / TODO-0010)
// ---------------------------------------------------------------------------

export interface IntentOffer {
  id: string
  protocolName: string
  protocolIcon?: string
  actionType: string
  title: string
  description: string
  iconUrl: string
  actionUrl: string
  rewardPoints: number
  eligibility: 'eligible' | 'ineligible' | 'unknown'
  trustScore?: number
  rank: number
  visibility?: 'visible' | 'hidden' | 'at_risk'
  isFeatured?: boolean
}

export type CompletionStatus =
  | 'awaiting_signature'
  | 'awaiting_chain_verification'
  | 'awarded'
  | 'confirmed_not_eligible'
  | 'rejected'
  | 'expired'

export interface Completion {
  id: string
  offerId: string
  walletAddress: string
  status: CompletionStatus
  signature: string | null
  expectedReference: string | null
  pointsAwarded: number | null
  reason: string | null
  createdAt: string
  updatedAt: string
}

export type PointEventType = 'awarded' | 'pending' | 'rejected' | 'reserved'

export interface PointEvent {
  id: string
  walletAddress: string
  amount: number
  type: PointEventType
  protocolId?: string
  protocolName?: string
  reason?: string
  completionId: string | null
  sourceSignature?: string
  createdAt: string
}

export interface UserBalance {
  walletAddress: string
  totalEarned: number
  pending: number
  usable: number
  reserved: number
  rank?: number
}

export type GameRoundStatus = 'waiting' | 'active' | 'settling' | 'settled' | 'skipped'

export type MiningResultKind = 'pending' | 'hit' | 'miss' | 'skipped'

export interface GameRoundSummary {
  roundId: string
  status: GameRoundStatus
  startSlot: string
  endSlot: string
  estimatedEndsAt: string | null
  playerCount: number
  gameFeeLamports: string
  hitRateBps: number
  tokensPerRound: string
  motherlodePool: string
  motherlodeMinThreshold: string
  motherlodeProbabilityBps: number
}

export interface PlayerDeploymentStatus {
  walletAddress: string
  roundId: string
  pointsDeployed: string | null
  feePaid: string | null
  deployedAt: string | null
  result: MiningResultKind
  settled: boolean
  isHit: boolean | null
  rewardAmount: string
  motherlodeShare: string
  claimed: boolean
}

export interface CurrentGameRoundResponse {
  round: GameRoundSummary | null
  player: PlayerDeploymentStatus | null
}

export interface GameRoundResults {
  round: GameRoundSummary
  hitCount: number
  totalHitPoints: string
  tokensMinted: string
  motherlodeTriggered: boolean
  motherlodeAmount: string
  player: PlayerDeploymentStatus | null
}

export interface GameRoundHistoryResponse {
  entries: GameRoundSummary[]
  total: number
}

export interface Quest {
  id: string
  title: string
  description: string
  questType: 'hold' | 'engagement' | 'newcomer' | 'composable' | 'streak' | 'subscription'
  rewardPoints: number
  protocolName?: string
  protocolIcon?: string
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
  resolverConfidence?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ---------------------------------------------------------------------------
//  Staking (TODO-0009)
// ---------------------------------------------------------------------------

export interface StakeStatus {
  stakedAmount: number
  availableForRental: number
  totalRentedOut: number
  rentalEarned: number
  isActive: boolean
}

export interface StakeConfig {
  minProtocolStake: number
  rentalFeeBps: number
}

// ---------------------------------------------------------------------------
//  Protocol manifests & reward policies (TODO-0011)
// ---------------------------------------------------------------------------

export interface ProtocolManifest {
  id: string
  protocolId: string
  name: string
  iconUrl?: string
  blinkBaseUrl: string
  supportedActions: string[]
  trustScore: number
  status: 'active' | 'pending' | 'suspended'
}

export interface RewardPolicy {
  id: string
  protocolId: string
  actionType: string
  baseReward: number
  multiplierRules?: { condition: string; multiplier: number }[]
  budgetTotal?: number
  budgetSpent?: number
  startAt?: string
  endAt?: string
}

// ---------------------------------------------------------------------------
//  Blink metadata (TODO-0012)
// ---------------------------------------------------------------------------

export interface BlinkAction {
  type: 'transaction'
  label: string
  href: string
  parameters?: BlinkParameter[]
}

export interface BlinkParameter {
  name: string
  label: string
  type: 'number' | 'select' | 'text'
  required: boolean
  options?: { label: string; value: string }[]
}

export interface BlinkMetadata {
  type: 'action'
  icon: string
  title: string
  description: string
  label: string
  links?: {
    actions: BlinkAction[]
  }
}

export interface BlinkTransactionResponse {
  transaction: string
  message?: string
  links?: {
    next?: { type: 'post'; href: string } | { type: 'inline'; action: BlinkMetadata }
  }
}

// ---------------------------------------------------------------------------
//  Completion init (TODO-0013)
// ---------------------------------------------------------------------------

export interface CompletionInit {
  completionId: string
  expectedReference: string
  status: 'awaiting_signature'
}

export interface VerificationResult {
  completionId: string
  status: CompletionStatus
  pointsAwarded: number | null
  reason: string | null
}

// ---------------------------------------------------------------------------
//  Tweet submission (TODO-0014)
// ---------------------------------------------------------------------------

export interface TweetSubmission {
  id: string
  tweetUrl: string
  walletAddress: string
  protocolId?: string
  status: 'pending' | 'verified' | 'rejected'
  pointsAwarded: number | null
  matchedTags: string[]
  createdAt: string
}

export interface TweetRule {
  id: string
  protocolId: string
  protocolName: string
  requiredHashtags: string[]
  requiredMentions: string[]
  baseReward: number
  description: string
  isActive: boolean
}

// ---------------------------------------------------------------------------
//  Protocol eligibility (TODO-0009)
// ---------------------------------------------------------------------------

export interface ProtocolEligibility {
  eligible: boolean
  directStake: number
  rentedStake: number
  trustScore: number
  issuancePower: number
}
