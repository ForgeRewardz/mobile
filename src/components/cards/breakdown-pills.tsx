import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing, radii } from '@/theme/tokens'
import type { PointsBreakdown } from '@rewardz/types'

interface BreakdownPillsProps {
  breakdown: PointsBreakdown
}

type Channel = keyof PointsBreakdown

const channelLabels: Record<Channel, string> = {
  tweet: 'Tweet',
  api: 'API',
  webhook: 'Webhook',
  blink: 'Blink',
}

const channelColors: Record<Channel, string> = {
  tweet: colors.questEngagement,
  api: colors.primaryContainer,
  webhook: colors.questHold,
  blink: colors.warning,
}

/**
 * Convert a bigint-wire string into a compact human label.
 *
 * Shares the "k/M" compaction with PodiumCard but kept local to avoid a
 * cross-file util for a 10-line helper.
 */
function compact(value: string): string {
  let n: number
  try {
    n = Number(BigInt(value))
  } catch {
    const parsed = Number(value)
    n = Number.isFinite(parsed) ? parsed : 0
  }
  if (n === 0) return '0'
  if (n < 1_000) return String(n)
  if (n < 1_000_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
}

/**
 * Render the 4-channel {@link PointsBreakdown} as a row of small coloured
 * pills. Each pill shows `Label N` — e.g. `Tweet 1.2k`.
 *
 * Channels with a zero value are hidden entirely to reduce visual noise on
 * rows where the user/protocol only earned from one or two channels.
 */
export function BreakdownPills({ breakdown }: BreakdownPillsProps) {
  const channels: Channel[] = ['tweet', 'api', 'webhook', 'blink']

  return (
    <View style={styles.row}>
      {channels.map((channel) => {
        const raw = breakdown[channel]
        const display = compact(raw)
        if (display === '0') return null
        const color = channelColors[channel]
        return (
          <View
            key={channel}
            style={[styles.pill, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}
          >
            <Text style={[styles.pillText, { color }]}>
              {channelLabels[channel]} {display}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  pillText: {
    fontFamily: typography.labelSmall,
    fontSize: 10,
    lineHeight: 14,
  },
})
