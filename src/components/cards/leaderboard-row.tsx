import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing } from '@/theme/tokens'
import { truncateAddress } from '@/utils/format'
import { BreakdownPills } from './breakdown-pills'
import type { PointsBreakdown } from '@rewardz/types'

interface LeaderboardRowProps {
  rank: number
  label: string
  /** Points value as a bigint-wire string. */
  points: string
  /** Optional breakdown pills. When omitted, only the headline row is rendered. */
  breakdown?: PointsBreakdown
}

/**
 * Format a bigint-wire string as a display number with thousands separators.
 * Uses the same `Number(BigInt(…))` coercion as PodiumCard — precise up to
 * 2^53 which is well beyond any plausible leaderboard point total.
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

/**
 * Row below the podium for ranks 4 and beyond. Compact, single-line layout
 * with optional breakdown pills wrapping underneath when provided.
 */
export function LeaderboardRow({ rank, label, points, breakdown }: LeaderboardRowProps) {
  // Wallet addresses come through as base-58 strings; shorten them so the
  // row stays single-line. Protocol names are left as-is.
  const displayLabel = label.length > 24 && !label.includes(' ') ? truncateAddress(label) : label

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Rank ${rank}, ${displayLabel}, ${formatPointsDisplay(points)} points`}
      style={styles.row}
    >
      <View style={styles.headline}>
        <Text style={styles.rank}>#{rank}</Text>
        <Text numberOfLines={1} style={styles.label}>
          {displayLabel}
        </Text>
        <Text style={styles.points}>{formatPointsDisplay(points)}</Text>
      </View>
      {breakdown && (
        <View style={styles.breakdown}>
          <BreakdownPills breakdown={breakdown} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
    gap: spacing.xs,
  },
  headline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rank: {
    fontFamily: typography.headlineMedium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.onSurfaceVariant,
    minWidth: 36,
  },
  label: {
    flex: 1,
    fontFamily: typography.labelSemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.onSurface,
  },
  points: {
    fontFamily: typography.headlineMedium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.primary,
    minWidth: 56,
    textAlign: 'right',
  },
  breakdown: {
    paddingLeft: 36 + spacing.md,
  },
})
