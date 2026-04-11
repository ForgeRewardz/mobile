import { View, Text, Image, StyleSheet } from 'react-native'
import { colors, typography, spacing, radii } from '@/theme/tokens'
import { truncateAddress } from '@/utils/format'

export type PodiumRank = 1 | 2 | 3

interface PodiumCardProps {
  rank: PodiumRank
  label: string
  /** Points value as a bigint-wire string (e.g. '1234000'). */
  points: string
  /** Optional subtitle — e.g. "42 users rewarded" for protocols. */
  subtitle?: string
  /** Optional protocol logo URL. */
  logoUrl?: string | null
}

const rankStyles: Record<
  PodiumRank,
  { color: string; medal: string; tone: string }
> = {
  1: { color: '#fcd34d', medal: '1', tone: 'Gold' },
  2: { color: '#cbd5e1', medal: '2', tone: 'Silver' },
  3: { color: '#d97706', medal: '3', tone: 'Bronze' },
}

/**
 * Convert a bigint-wire string of points into a compact display label.
 * - < 1k: raw ("942")
 * - < 1M: "1.2k"
 * - ≥ 1M: "3.4M"
 *
 * Uses `Number(BigInt(value))` which loses precision above 2^53 — acceptable
 * for a leaderboard UI where displayed values will always fit in a JS number.
 */
function formatCompactPoints(points: string): string {
  let n: number
  try {
    n = Number(BigInt(points))
  } catch {
    // Fall back to direct Number() parse if the value is not a valid bigint
    // string (e.g. decimal). Shouldn't happen on wire data, but we'd rather
    // show "0" than crash the render tree.
    const parsed = Number(points)
    n = Number.isFinite(parsed) ? parsed : 0
  }
  if (n < 1_000) return String(n)
  if (n < 1_000_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
}

/**
 * Display a single top-3 leaderboard entry with medal colouring.
 * Rank 1 is rendered slightly larger to emphasise the champion.
 */
export function PodiumCard({ rank, label, points, subtitle, logoUrl }: PodiumCardProps) {
  const { color, medal, tone } = rankStyles[rank]
  const isFirst = rank === 1

  // Wallet addresses come through as base-58 strings; shorten them so the
  // podium card stays single-line. Protocol names are already short.
  const displayLabel = label.length > 20 && !label.includes(' ') ? truncateAddress(label) : label

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Rank ${rank}, ${displayLabel}, ${formatCompactPoints(points)} points`}
      style={[styles.card, isFirst && styles.cardFirst, { borderColor: color }]}
    >
      <View style={[styles.medal, { backgroundColor: `${color}33`, borderColor: color }]}>
        <Text style={[styles.medalText, { color }]}>{medal}</Text>
      </View>

      {logoUrl ? (
        <Image source={{ uri: logoUrl }} style={styles.logo} accessibilityIgnoresInvertColors />
      ) : (
        <View style={styles.logoFallback}>
          <Text style={styles.logoFallbackText}>{displayLabel.charAt(0).toUpperCase()}</Text>
        </View>
      )}

      <Text
        numberOfLines={1}
        style={[styles.label, isFirst && styles.labelFirst]}
      >
        {displayLabel}
      </Text>

      <Text style={[styles.points, isFirst && styles.pointsFirst, { color }]}>
        {formatCompactPoints(points)}
      </Text>

      {subtitle && (
        <Text numberOfLines={1} style={styles.subtitle}>
          {subtitle}
        </Text>
      )}

      <Text style={[styles.tone, { color }]}>{tone}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.xl,
    borderWidth: 1,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardFirst: {
    paddingVertical: spacing.lg,
  },
  medal: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalText: {
    fontFamily: typography.displayMd,
    fontSize: 16,
    lineHeight: 20,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    marginTop: spacing.xs,
  },
  logoFallback: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  logoFallbackText: {
    fontFamily: typography.headlineMedium,
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },
  label: {
    fontFamily: typography.labelSemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.onSurface,
    textAlign: 'center',
  },
  labelFirst: {
    fontFamily: typography.headlineMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  points: {
    fontFamily: typography.headlineMedium,
    fontSize: 16,
    lineHeight: 20,
  },
  pointsFirst: {
    fontFamily: typography.displayMd,
    fontSize: 20,
    lineHeight: 24,
  },
  subtitle: {
    fontFamily: typography.bodyRegular,
    fontSize: 10,
    lineHeight: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  tone: {
    fontFamily: typography.labelSmall,
    fontSize: 9,
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
})
