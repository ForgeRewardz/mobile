import { useEffect, useMemo, useRef } from 'react'
import { Animated, Modal, Pressable, Share, StyleSheet, Text, View } from 'react-native'
import { colors, radii, spacing, typography } from '@/theme/tokens'
import type { GameRoundResults, PlayerDeploymentStatus } from '@/types/api'

interface RoundResultOverlayProps {
  visible: boolean
  result: GameRoundResults | null | undefined
  onClose: () => void
}

function bigintString(value: string | null | undefined): bigint {
  if (!value) return 0n
  try {
    return BigInt(value)
  } catch {
    return 0n
  }
}

function formatAmount(value: string | bigint | null | undefined): string {
  const bigintValue = typeof value === 'bigint' ? value : bigintString(value)
  return Number(bigintValue).toLocaleString('en-US')
}

function playerTotalReward(player: PlayerDeploymentStatus | null | undefined): bigint {
  if (!player) return 0n
  return bigintString(player.rewardAmount) + bigintString(player.motherlodeShare)
}

function resultTitle(player: PlayerDeploymentStatus | null | undefined): string {
  if (!player) return 'Round settled'
  if (player.result === 'hit') return 'Hit'
  if (player.result === 'miss') return 'Miss'
  if (player.result === 'skipped') return 'Round skipped'
  return 'Waiting for settle'
}

function resultBody(result: GameRoundResults | null | undefined): string {
  const player = result?.player
  if (!result || !player) return 'Join an active round to see your mining result here.'
  if (player.result === 'hit') {
    const total = playerTotalReward(player)
    return `You mined ${formatAmount(total)} tokens in round #${result.round.roundId}.`
  }
  if (player.result === 'miss') return `Round #${result.round.roundId} missed this time.`
  if (player.result === 'skipped') return 'The round skipped because it did not reach the minimum player count.'
  return 'Your deployment is waiting for settlement.'
}

export function RoundResultOverlay({ visible, result, onClose }: RoundResultOverlayProps) {
  const fade = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.96)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: visible ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: visible ? 1 : 0.96,
        useNativeDriver: true,
        damping: 14,
        stiffness: 140,
      }),
    ]).start()
  }, [fade, scale, visible])

  const player = result?.player
  const totalReward = playerTotalReward(player)
  const isHit = player?.result === 'hit'
  const motherlodeAmount = bigintString(player?.motherlodeShare)
  const shareText = useMemo(() => resultBody(result), [result])

  const handleShare = async () => {
    await Share.share({ message: shareText })
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" />
        <Animated.View style={[styles.panel, { opacity: fade, transform: [{ scale }] }]}>
          <View style={[styles.resultBadge, isHit ? styles.hitBadge : styles.missBadge]}>
            <Text style={[styles.resultBadgeText, { color: isHit ? colors.tertiary : colors.onSurfaceVariant }]}>
              {resultTitle(player)}
            </Text>
          </View>

          <Text style={styles.title}>{resultBody(result)}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCell}>
              <Text style={styles.statValue}>{formatAmount(totalReward)}</Text>
              <Text style={styles.statLabel}>Tokens</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statValue}>{result?.hitCount ?? 0}</Text>
              <Text style={styles.statLabel}>Hits</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Players</Text>
            <Text style={styles.summaryValue}>{result?.round.playerCount ?? 0}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Round minted</Text>
            <Text style={styles.summaryValue}>{formatAmount(result?.tokensMinted)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Motherlode</Text>
            <Text style={styles.summaryValue}>
              {result?.motherlodeTriggered ? `+${formatAmount(motherlodeAmount)}` : 'Not triggered'}
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable onPress={handleShare} accessibilityRole="button" style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Share</Text>
            </Pressable>
            <Pressable onPress={onClose} accessibilityRole="button" style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Close</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.base,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
  },
  panel: {
    width: '100%',
    maxWidth: 420,
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  resultBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  hitBadge: {
    backgroundColor: `${colors.tertiary}22`,
    borderColor: `${colors.tertiary}66`,
  },
  missBadge: {
    backgroundColor: `${colors.surfaceContainerHighest}99`,
    borderColor: colors.outlineVariant,
  },
  resultBadgeText: {
    fontFamily: typography.labelSemiBold,
    fontSize: 11,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: typography.headlineMedium,
    fontSize: 22,
    lineHeight: 28,
    color: colors.onSurface,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCell: {
    flex: 1,
    minHeight: 76,
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.base,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLow,
  },
  statValue: {
    fontFamily: typography.headlineMedium,
    fontSize: 22,
    color: colors.primary,
  },
  statLabel: {
    fontFamily: typography.labelSmall,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  summaryLabel: {
    fontFamily: typography.bodyRegular,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  summaryValue: {
    flexShrink: 1,
    fontFamily: typography.labelSemiBold,
    fontSize: 13,
    color: colors.onSurface,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.primaryContainer,
  },
  primaryButtonText: {
    fontFamily: typography.buttonFont,
    fontSize: 14,
    color: colors.surface,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerHighest,
  },
  secondaryButtonText: {
    fontFamily: typography.buttonFont,
    fontSize: 14,
    color: colors.onSurface,
  },
})
