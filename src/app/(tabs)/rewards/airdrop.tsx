import { useMemo, useState } from 'react'
import { ScrollView, View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { TopAppBar } from '@/components/navigation/TopAppBar'
import { PodiumCard, LeaderboardRow, type PodiumRank } from '@/components/cards'
import { EmptyStateBlock } from '@/components/feedback'
import { useAirdropSeason } from '@/hooks/use-airdrop-season'
import { useProtocolLeaderboard } from '@/hooks/use-protocol-leaderboard'
import { useUserLeaderboard } from '@/hooks/use-user-leaderboard'
import { useMyRank } from '@/hooks/use-my-rank'
import { colors, typography, spacing, radii } from '@/theme/tokens'
import { truncateAddress } from '@/utils/format'
import type { Season, UserRank, ProtocolRank } from '@rewardz/types'

type Tab = 'protocols' | 'users'

/**
 * Format a season date range for the header — "Jan 15 - Feb 28" style.
 * Handles open-ended seasons (`endAt == null`) by rendering "TBD".
 */
function formatDateRange(season: Season): string {
  const start = new Date(season.startAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const end = season.endAt
    ? new Date(season.endAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'TBD'
  return `${start} - ${end}`
}

/**
 * Convert a bigint-wire points string into a display number with thousands
 * separators. Matches the helper in LeaderboardRow — duplicated locally
 * because the sticky "Your Position" card needs its own instance.
 */
function formatPointsDisplay(points: string): string {
  let n: number
  try {
    n = Number(BigInt(points))
  } catch {
    const parsed = Number(points)
    n = Number.isFinite(parsed) ? parsed : 0
  }
  return n.toLocaleString('en-US')
}

/** Small badge showing the season status (active / upcoming / completed). */
function SeasonStatusBadge({ status }: { status: Season['status'] }) {
  const color =
    status === 'active' ? colors.tertiary : status === 'upcoming' ? colors.pending : colors.onSurfaceVariant
  const label = status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <View style={[styles.statusBadge, { backgroundColor: `${color}22`, borderColor: `${color}66` }]}>
      <Text style={[styles.statusBadgeText, { color }]}>{label}</Text>
    </View>
  )
}

/** Segmented tab control — Protocols / Users. Uses useState locally. */
function TabBar({ value, onChange }: { value: Tab; onChange: (next: Tab) => void }) {
  const tabs: { key: Tab; label: string }[] = [
    { key: 'protocols', label: 'Protocols' },
    { key: 'users', label: 'Users' },
  ]
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const active = tab.key === value
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${tab.label} tab`}
            style={[styles.tabItem, active && styles.tabItemActive]}
          >
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export default function AirdropScreen() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('protocols')

  const seasonQuery = useAirdropSeason()
  const season = seasonQuery.data
  const seasonId = season?.seasonId

  const protocolsQuery = useProtocolLeaderboard(seasonId)
  const usersQuery = useUserLeaderboard(seasonId)
  const myRankQuery = useMyRank(seasonId)

  // Unified view model for whichever tab is active. We normalise protocol +
  // user entries to a common `{ label, points, breakdown, subtitle, logoUrl }`
  // shape so the rendering code doesn't branch per-tab.
  type Entry = {
    id: string
    label: string
    points: string
    subtitle?: string
    logoUrl?: string | null
    breakdown: { tweet: string; api: string; webhook: string; blink: string }
  }

  const entries: Entry[] = useMemo(() => {
    if (tab === 'protocols') {
      const rows: ProtocolRank[] = protocolsQuery.data?.entries ?? []
      return rows.map((r) => ({
        id: r.protocolId,
        label: r.protocolName,
        points: r.totalPointsIssued,
        subtitle: `${r.uniqueUsersRewarded} users rewarded`,
        logoUrl: r.protocolLogo,
        breakdown: r.breakdown,
      }))
    }
    const rows: UserRank[] = usersQuery.data?.entries ?? []
    return rows.map((r) => ({
      id: r.wallet,
      label: r.wallet,
      points: r.totalPoints,
      breakdown: r.breakdown,
    }))
  }, [tab, protocolsQuery.data, usersQuery.data])

  const activeQuery = tab === 'protocols' ? protocolsQuery : usersQuery
  const isLoading = activeQuery.isLoading
  const isError = activeQuery.isError

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  const myRank = myRankQuery.data

  return (
    <SafeScreen noPadding>
      <TopAppBar greeting={season?.name ?? 'Airdrop'} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.base,
          paddingBottom: myRank ? 120 : spacing['3xl'],
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Season header — status + date range */}
        {seasonQuery.isLoading ? (
          <View style={styles.seasonHeader}>
            <ActivityIndicator color={colors.primaryContainer} />
          </View>
        ) : season ? (
          <View style={styles.seasonHeader}>
            <View style={styles.seasonHeaderRow}>
              <SeasonStatusBadge status={season.status} />
              <Text style={styles.seasonDate}>{formatDateRange(season)}</Text>
            </View>
            {season.description && (
              <Text style={styles.seasonDescription} numberOfLines={2}>
                {season.description}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.seasonHeader}>
            <Text style={styles.seasonError}>Couldn&apos;t load season info.</Text>
          </View>
        )}

        <TabBar value={tab} onChange={setTab} />

        {/* Podium + list */}
        {isLoading ? (
          <View style={styles.centerBlock}>
            <ActivityIndicator color={colors.primaryContainer} />
            <Text style={styles.helperText}>Loading leaderboard…</Text>
          </View>
        ) : isError ? (
          <View style={styles.centerBlock}>
            <Text style={styles.errorText}>Couldn&apos;t load rankings. Pull to retry.</Text>
            <Pressable onPress={() => activeQuery.refetch()} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : entries.length === 0 ? (
          <EmptyStateBlock
            title="No participants yet"
            message="Be the first to earn points this season."
          />
        ) : (
          <>
            {/* Top 3 podium */}
            <View style={styles.podium}>
              {top3.map((entry, idx) => (
                <PodiumCard
                  key={entry.id}
                  rank={(idx + 1) as PodiumRank}
                  label={entry.label}
                  points={entry.points}
                  subtitle={entry.subtitle}
                  logoUrl={entry.logoUrl}
                />
              ))}
              {/* Pad empty slots when fewer than 3 entries so flex layout stays even */}
              {top3.length < 3 &&
                Array.from({ length: 3 - top3.length }).map((_, i) => (
                  <View key={`pad-${i}`} style={styles.podiumPad} />
                ))}
            </View>

            {/* Ranks 4+ */}
            {rest.length > 0 && (
              <View style={styles.listCard}>
                {rest.map((entry, idx) => (
                  <LeaderboardRow
                    key={entry.id}
                    rank={idx + 4}
                    label={entry.label}
                    points={entry.points}
                    breakdown={entry.breakdown}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Sticky bottom "Your Position" card */}
      {myRank && (
        <View style={styles.stickyCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.stickyLabel}>Your Position</Text>
            <Text style={styles.stickyValue}>
              #{myRank.rank} · {formatPointsDisplay(myRank.totalPoints)} pts
            </Text>
            <Text style={styles.stickyWallet}>{truncateAddress(myRank.wallet)}</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/explore')}
            accessibilityRole="button"
            accessibilityLabel="Earn more points"
            style={styles.earnButton}
          >
            <Text style={styles.earnButtonText}>Earn More →</Text>
          </Pressable>
        </View>
      )}
    </SafeScreen>
  )
}

const styles = StyleSheet.create({
  seasonHeader: {
    gap: spacing.sm,
  },
  seasonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  seasonDate: {
    fontFamily: typography.bodyRegular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  seasonDescription: {
    fontFamily: typography.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.onSurfaceVariant,
  },
  seasonError: {
    fontFamily: typography.bodyRegular,
    fontSize: 13,
    color: colors.error,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontFamily: typography.labelSemiBold,
    fontSize: 11,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.full,
    padding: 4,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radii.full,
  },
  tabItemActive: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  tabText: {
    fontFamily: typography.labelSemiBold,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  tabTextActive: {
    color: colors.onSurface,
  },
  podium: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  podiumPad: {
    flex: 1,
  },
  listCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  centerBlock: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
    gap: spacing.md,
  },
  helperText: {
    fontFamily: typography.bodyRegular,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  errorText: {
    fontFamily: typography.bodyRegular,
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: radii.full,
  },
  retryButtonText: {
    fontFamily: typography.buttonFont,
    fontSize: 13,
    color: colors.onSurface,
  },
  stickyCard: {
    position: 'absolute',
    left: spacing.base,
    right: spacing.base,
    bottom: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: radii.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  stickyLabel: {
    fontFamily: typography.labelSmall,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stickyValue: {
    fontFamily: typography.headlineMedium,
    fontSize: 16,
    lineHeight: 20,
    color: colors.primary,
  },
  stickyWallet: {
    fontFamily: typography.bodyRegular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  earnButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.full,
  },
  earnButtonText: {
    fontFamily: typography.buttonFont,
    fontSize: 12,
    color: colors.surface,
  },
})
