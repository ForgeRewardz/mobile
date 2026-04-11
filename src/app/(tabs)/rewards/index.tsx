import { ScrollView, View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { TopAppBar } from '@/components/navigation/TopAppBar'
import { PointsBadge, RewardHistoryRow, StatusPill } from '@/components/cards'
import { LoadingSkeleton, EmptyStateBlock } from '@/components/feedback'
import { usePointsBalance } from '@/hooks/use-points-balance'
import { usePointsActivity } from '@/hooks/use-points-activity'
import { usePendingCompletions, type PendingCompletion } from '@/hooks/use-pending-completions'
import { useMyRank } from '@/hooks/use-my-rank'
import { colors, typography, spacing, radii } from '@/theme/tokens'
import { formatPoints } from '@/utils/format'
import type { CompletionStatus, PointEvent } from '@/types/api'
import type { StatusValue } from '@/components/cards'

/**
 * Map PointEvent.type to the StatusValue accepted by RewardHistoryRow.
 * 'reserved' is surfaced as 'pending' since StatusPill does not have a
 * dedicated reserved state yet.
 */
function pointEventStatus(type: PointEvent['type']): StatusValue {
  switch (type) {
    case 'awarded':
      return 'awarded'
    case 'rejected':
      return 'rejected'
    case 'pending':
    case 'reserved':
    default:
      return 'pending'
  }
}

// usePendingCompletions is imported from '@/hooks/use-pending-completions'
// It reads the AsyncStorage-backed list populated by the Blink execution flow.

/**
 * Non-terminal completion statuses eligible for the "Verification in Progress"
 * section. Anything not in this set is considered resolved and should not be
 * surfaced here.
 */
const NON_TERMINAL_COMPLETION_STATUSES: CompletionStatus[] = ['awaiting_signature', 'awaiting_chain_verification']

function isNonTerminalCompletion(status: CompletionStatus): boolean {
  return NON_TERMINAL_COMPLETION_STATUSES.includes(status)
}

/**
 * Format an ISO timestamp as a short relative string ("2m ago", "3h ago").
 * Mirrors the helper used by RewardHistoryRow — kept local to avoid
 * introducing a new shared util for a single caller.
 */
function getRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = Math.max(0, now - then)

  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`

  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

interface PendingCompletionCardProps {
  completion: PendingCompletion
  onPress: (completionId: string) => void
}

function PendingCompletionCard({ completion, onPress }: PendingCompletionCardProps) {
  return (
    <Pressable
      onPress={() => onPress(completion.completionId)}
      accessibilityRole="button"
      accessibilityLabel={`Resume verification for ${completion.offerTitle}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.base,
        gap: spacing.md,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: typography.labelSemiBold,
            fontSize: 13,
            lineHeight: 18,
            color: colors.onSurface,
          }}
        >
          {completion.offerTitle}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <StatusPill status={completion.status} />
          <Text
            style={{
              fontFamily: typography.bodyRegular,
              fontSize: 11,
              lineHeight: 16,
              color: colors.onSurfaceVariant,
            }}
          >
            {getRelativeTime(completion.createdAt)}
          </Text>
        </View>
      </View>
      <Text
        style={{
          fontFamily: typography.buttonFont,
          fontSize: 13,
          color: colors.primaryContainer,
        }}
      >
        →
      </Text>
    </Pressable>
  )
}

interface BalanceCellProps {
  label: string
  value: number
}

function BalanceCell({ label, value }: BalanceCellProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surfaceContainerLow,
        borderRadius: radii.xl,
        paddingVertical: spacing.base,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
        gap: spacing.xs,
      }}
    >
      <Text
        style={{
          fontFamily: typography.labelSmall,
          fontSize: 11,
          color: colors.onSurfaceVariant,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: typography.headlineMedium,
          fontSize: 18,
          color: colors.onSurface,
        }}
      >
        {formatPoints(value)}
      </Text>
    </View>
  )
}

interface TeaserCardProps {
  title: string
  subtitle?: string
  ctaLabel: string
  onPress: () => void
}

function TeaserCard({ title, subtitle, ctaLabel, onPress }: TeaserCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => ({
        backgroundColor: colors.surfaceContainerLow,
        borderRadius: radii['2xl'],
        padding: spacing.xl,
        gap: spacing.sm,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text
        style={{
          fontFamily: typography.headlineMedium,
          fontSize: 17,
          color: colors.onSurface,
        }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{
            fontFamily: typography.bodyRegular,
            fontSize: 13,
            lineHeight: 18,
            color: colors.onSurfaceVariant,
          }}
        >
          {subtitle}
        </Text>
      )}
      <Text
        style={{
          marginTop: spacing.sm,
          fontFamily: typography.buttonFont,
          fontSize: 13,
          color: colors.primaryContainer,
        }}
      >
        {ctaLabel} →
      </Text>
    </Pressable>
  )
}

export default function RewardsScreen() {
  const router = useRouter()
  const balanceQuery = usePointsBalance()
  const activityQuery = usePointsActivity({ pageSize: 20 })
  const pendingCompletionsQuery = usePendingCompletions()
  const myRankQuery = useMyRank()

  const balance = balanceQuery.data
  const balanceLoading = balanceQuery.isLoading
  const balanceError = balanceQuery.isError

  const activityLoading = activityQuery.isLoading
  const activityError = activityQuery.isError
  const allEvents: PointEvent[] = activityQuery.data?.pages.flatMap((p) => p.events) ?? []
  const recentEvents = allEvents.slice(0, 5)

  // Only surface non-terminal completions. Terminal ones should have been
  // pruned from the underlying store once the verifying screen resolves them.
  const activePendingCompletions = pendingCompletionsQuery.data.filter((c) => isNonTerminalCompletion(c.status))

  const handlePendingCompletionPress = (completionId: string) => {
    router.push({
      pathname: '/(tabs)/home/verifying',
      params: { completionId },
    })
  }

  return (
    <SafeScreen noPadding>
      <TopAppBar
        greeting="Rewards"
        rightContent={balance ? <PointsBadge points={balance.usable} size="sm" /> : undefined}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.base,
          paddingBottom: spacing['3xl'],
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Total balance card */}
        <View
          accessible
          accessibilityRole="text"
          accessibilityLabel={
            balance
              ? `Total points earned: ${balance.totalEarned.toLocaleString('en-US')}`
              : balanceLoading
                ? 'Loading total points'
                : 'Total points unavailable'
          }
          style={{ alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.xs }}
        >
          {balanceLoading ? (
            <View style={{ gap: spacing.sm, alignItems: 'center', width: '100%' }}>
              <LoadingSkeleton width={180} height={56} borderRadius={radii.lg} />
              <LoadingSkeleton width={100} height={14} borderRadius={radii.sm} />
            </View>
          ) : balanceError || !balance ? (
            <>
              <Text
                style={{
                  fontFamily: typography.displayLg,
                  fontSize: 56,
                  color: colors.primary,
                  textAlign: 'center',
                }}
              >
                —
              </Text>
              <Text
                style={{
                  fontFamily: typography.bodyMedium,
                  fontSize: 13,
                  color: colors.error,
                }}
              >
                Couldn&apos;t load balance. Pull to retry.
              </Text>
            </>
          ) : (
            <>
              <Text
                style={{
                  fontFamily: typography.displayLg,
                  fontSize: 56,
                  lineHeight: 64,
                  color: colors.primary,
                  textAlign: 'center',
                }}
              >
                {formatPoints(balance.totalEarned)}
              </Text>
              <Text
                style={{
                  fontFamily: typography.bodyMedium,
                  fontSize: 14,
                  color: colors.onSurfaceVariant,
                }}
              >
                Total Points
              </Text>
            </>
          )}
        </View>

        {/* 3-column breakdown */}
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          {balanceLoading ? (
            <>
              <LoadingSkeleton variant="card" height={72} />
              <LoadingSkeleton variant="card" height={72} />
              <LoadingSkeleton variant="card" height={72} />
            </>
          ) : (
            <>
              <BalanceCell label="Pending" value={balance?.pending ?? 0} />
              <BalanceCell label="Usable" value={balance?.usable ?? 0} />
              <BalanceCell label="Reserved" value={balance?.reserved ?? 0} />
            </>
          )}
        </View>

        {/*
         * Airdrop summary card — links to the full leaderboard screen.
         * Renders the connected user's rank when `useMyRank()` has data;
         * otherwise shows a muted "Connect to see your rank" prompt.
         */}
        <Pressable
          onPress={() => router.push('/(tabs)/rewards/airdrop')}
          accessibilityRole="button"
          accessibilityLabel="View airdrop leaderboard"
          style={({ pressed }) => ({
            backgroundColor: colors.surfaceContainerLow,
            borderRadius: radii['2xl'],
            padding: spacing.xl,
            gap: spacing.xs,
            borderWidth: 1,
            borderColor: colors.outlineVariant,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text
            style={{
              fontFamily: typography.labelSmall,
              fontSize: 10,
              color: colors.onSurfaceVariant,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Airdrop Season
          </Text>
          {myRankQuery.data ? (
            <Text
              style={{
                fontFamily: typography.headlineMedium,
                fontSize: 18,
                color: colors.primary,
              }}
            >
              #{myRankQuery.data.rank} · {Number(BigInt(myRankQuery.data.totalPoints)).toLocaleString('en-US')} pts
            </Text>
          ) : (
            <Text
              style={{
                fontFamily: typography.bodyRegular,
                fontSize: 14,
                color: colors.onSurfaceVariant,
              }}
            >
              Connect to see your rank
            </Text>
          )}
          <Text
            style={{
              marginTop: spacing.sm,
              fontFamily: typography.buttonFont,
              fontSize: 13,
              color: colors.primaryContainer,
            }}
          >
            View Full Leaderboard →
          </Text>
        </Pressable>

        {/*
         * Verification in Progress
         * Only rendered when there are active (non-terminal) pending completions.
         * Each card resumes the verifying flow for that completion.
         */}
        {activePendingCompletions.length > 0 && (
          <View style={{ gap: spacing.md }}>
            <Text
              style={{
                fontFamily: typography.headlineMedium,
                fontSize: 18,
                color: colors.onSurface,
              }}
            >
              Verification in Progress
            </Text>
            <View
              style={{
                backgroundColor: colors.surfaceContainerLow,
                borderRadius: radii['2xl'],
                overflow: 'hidden',
              }}
            >
              {activePendingCompletions.map((completion) => (
                <PendingCompletionCard
                  key={completion.completionId}
                  completion={completion}
                  onPress={handlePendingCompletionPress}
                />
              ))}
            </View>
          </View>
        )}

        {/* Recent Activity */}
        <View style={{ gap: spacing.md }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                fontFamily: typography.headlineMedium,
                fontSize: 18,
                color: colors.onSurface,
              }}
            >
              Recent Activity
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/rewards/history')}
              accessibilityRole="link"
              accessibilityLabel="View all reward history"
              hitSlop={8}
            >
              <Text
                style={{
                  fontFamily: typography.buttonFont,
                  fontSize: 13,
                  color: colors.primaryContainer,
                }}
              >
                View All History →
              </Text>
            </Pressable>
          </View>

          <View
            style={{
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: radii['2xl'],
              overflow: 'hidden',
            }}
          >
            {activityLoading ? (
              <View style={{ padding: spacing.sm, gap: spacing.sm }}>
                <LoadingSkeleton variant="row" />
                <LoadingSkeleton variant="row" />
                <LoadingSkeleton variant="row" />
              </View>
            ) : activityError ? (
              <View style={{ padding: spacing.xl }}>
                <Text
                  style={{
                    fontFamily: typography.bodyRegular,
                    fontSize: 13,
                    color: colors.error,
                    textAlign: 'center',
                  }}
                >
                  Couldn&apos;t load recent activity.
                </Text>
              </View>
            ) : recentEvents.length === 0 ? (
              <EmptyStateBlock
                title="No activity yet"
                message="Your earned, pending, and reserved points will show up here."
              />
            ) : (
              recentEvents.map((event) => (
                <RewardHistoryRow
                  key={event.id}
                  event={{
                    protocolName: event.protocolName ?? 'Rewardz',
                    actionType: event.reason ?? event.protocolName ?? 'Points update',
                    amount: event.amount,
                    status: pointEventStatus(event.type),
                    createdAt: event.createdAt,
                  }}
                />
              ))
            )}
          </View>
        </View>

        {/* Burn-to-Mint teaser */}
        <TeaserCard
          title="Burn points to mint Token X"
          subtitle="~10% success rate"
          ctaLabel="Try mining"
          onPress={() => router.push('/(tabs)/rewards/mining')}
        />

        {/* Point sync teaser */}
        <TeaserCard
          title="Sync points on-chain"
          subtitle="Publish your latest balance to the Rewardz Merkle root."
          ctaLabel="Open sync"
          onPress={() => router.push('/(tabs)/rewards/sync')}
        />
      </ScrollView>
    </SafeScreen>
  )
}
