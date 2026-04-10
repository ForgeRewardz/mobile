import { ScrollView, View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { TopAppBar } from '@/components/navigation/TopAppBar'
import { PointsBadge, RewardHistoryRow } from '@/components/cards'
import { LoadingSkeleton, EmptyStateBlock } from '@/components/feedback'
import { usePointsBalance } from '@/hooks/use-points-balance'
import { usePointsActivity } from '@/hooks/use-points-activity'
import { colors, typography, spacing, radii } from '@/theme/tokens'
import { formatPoints } from '@/utils/format'
import type { PointEvent } from '@/types/api'
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

  const balance = balanceQuery.data
  const balanceLoading = balanceQuery.isLoading
  const balanceError = balanceQuery.isError

  const activityLoading = activityQuery.isLoading
  const activityError = activityQuery.isError
  const allEvents: PointEvent[] = activityQuery.data?.pages.flatMap((p) => p.events) ?? []
  const recentEvents = allEvents.slice(0, 5)

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
        <View style={{ alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.xs }}>
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

        {/* Pending completions — placeholder for Task #29 */}
        <View style={{ gap: spacing.md }}>
          <Text
            style={{
              fontFamily: typography.headlineMedium,
              fontSize: 18,
              color: colors.onSurface,
            }}
          >
            Pending Completions
          </Text>
          <View
            style={{
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: radii['2xl'],
              padding: spacing.xl,
              alignItems: 'center',
              gap: spacing.xs,
            }}
          >
            <Text
              style={{
                fontFamily: typography.bodyMedium,
                fontSize: 13,
                color: colors.onSurfaceVariant,
                textAlign: 'center',
              }}
            >
              Completions awaiting verification will appear here.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  )
}
