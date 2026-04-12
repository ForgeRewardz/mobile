import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { BackButton } from '@/components/navigation/BackButton'
import { RoundResultOverlay } from '@/components/overlays'
import { DEFAULT_GAME_FEE_LAMPORTS } from '@/config/constants'
import { useDeployToRound } from '@/hooks/use-deploy-to-round'
import { useGameRound } from '@/hooks/use-game-round'
import { usePointsBalance } from '@/hooks/use-points-balance'
import { useRoundResult } from '@/hooks/use-round-result'
import { colors, radii, spacing, typography } from '@/theme/tokens'
import { formatPoints, formatSol } from '@/utils/format'

function parsePoints(value: string): number {
  if (!value) return 0
  const parsed = Number.parseInt(value, 10)
  return Number.isSafeInteger(parsed) ? parsed : 0
}

function formatTokenAmount(value: string | null | undefined): string {
  if (!value) return '0'
  try {
    return Number(BigInt(value)).toLocaleString('en-US')
  } catch {
    return value
  }
}

function feeLamports(value: string | null | undefined): bigint {
  if (!value) return BigInt(DEFAULT_GAME_FEE_LAMPORTS)
  try {
    return BigInt(value)
  } catch {
    return BigInt(DEFAULT_GAME_FEE_LAMPORTS)
  }
}

export default function MiningScreen() {
  const router = useRouter()
  const [amountText, setAmountText] = useState('100')
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [lastRevealedRound, setLastRevealedRound] = useState<string | null>(null)

  const gameRoundQuery = useGameRound()
  const balanceQuery = usePointsBalance()
  const deployMutation = useDeployToRound()

  const round = gameRoundQuery.data?.round ?? null
  const roundId = round?.roundId ?? null
  const resultQuery = useRoundResult(roundId)
  const player = resultQuery.data?.player ?? gameRoundQuery.data?.player ?? null
  const usablePoints = balanceQuery.data?.usable ?? 0
  const points = parsePoints(amountText)
  const activeRound = round?.status === 'active'
  const alreadyDeployed = !!player
  const roundFeeLamports = feeLamports(round?.gameFeeLamports)
  const hitRate = round ? round.hitRateBps / 100 : 50

  const disableReason = useMemo(() => {
    if (!round) return 'Waiting for the next round'
    if (!activeRound) return round.status === 'settling' ? 'Round is settling' : 'Round is not open'
    if (alreadyDeployed) return 'Already deployed'
    if (balanceQuery.isLoading) return 'Loading balance'
    if (points <= 0) return 'Enter points'
    if (points > usablePoints) return 'Insufficient points'
    if (deployMutation.isPending) return 'Deploying'
    return null
  }, [activeRound, alreadyDeployed, balanceQuery.isLoading, deployMutation.isPending, points, round, usablePoints])

  const canDeploy = !disableReason
  const playerResultReady = !!resultQuery.data?.player && resultQuery.data.player.result !== 'pending'

  useEffect(() => {
    if (!roundId || !playerResultReady || lastRevealedRound === roundId) return
    setOverlayVisible(true)
    setLastRevealedRound(roundId)
  }, [lastRevealedRound, playerResultReady, roundId])

  const handleDeploy = () => {
    if (!roundId || !canDeploy) return
    deployMutation.mutate({ roundId, points })
  }

  const handleAmountChange = (text: string) => {
    setAmountText(text.replace(/[^0-9]/g, ''))
  }

  return (
    <SafeScreen noPadding>
      <View style={styles.header}>
        <BackButton />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Mining</Text>
          <Text style={styles.headerSubtitle}>Deploy points into the active round.</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Current Round</Text>
          <Text style={styles.countdown}>{gameRoundQuery.countdownLabel}</Text>
          <Text style={styles.heroCopy}>
            {round
              ? `Round #${round.roundId} is ${round.status}.`
              : 'A new round opens when the keeper starts the next game.'}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{round?.playerCount ?? 0}</Text>
              <Text style={styles.statLabel}>Players</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{hitRate.toFixed(0)}%</Text>
              <Text style={styles.statLabel}>Hit rate</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{formatTokenAmount(round?.tokensPerRound)}</Text>
              <Text style={styles.statLabel}>Tokens</Text>
            </View>
          </View>

          {gameRoundQuery.isFetching && (
            <View style={styles.inlineStatus}>
              <ActivityIndicator color={colors.primaryContainer} size="small" />
              <Text style={styles.inlineStatusText}>Refreshing round</Text>
            </View>
          )}
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Deploy Points</Text>
            <Text style={styles.panelHint}>Fee {formatSol(roundFeeLamports)} SOL</Text>
          </View>

          <View style={styles.inputWrap}>
            <TextInput
              value={amountText}
              onChangeText={handleAmountChange}
              keyboardType="number-pad"
              placeholder="100"
              placeholderTextColor={colors.onSurfaceVariant}
              editable={!alreadyDeployed && !deployMutation.isPending}
              style={styles.input}
            />
            <Text style={styles.inputSuffix}>pts</Text>
          </View>

          <View style={styles.balanceRow}>
            <Text style={styles.balanceText}>Usable balance</Text>
            <Text style={styles.balanceValue}>
              {balanceQuery.isLoading ? 'Loading' : `${formatPoints(usablePoints)} pts`}
            </Text>
          </View>

          <Pressable
            onPress={handleDeploy}
            disabled={!canDeploy}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canDeploy }}
            style={({ pressed }) => [
              styles.deployButton,
              !canDeploy && styles.deployButtonDisabled,
              pressed && canDeploy && styles.deployButtonPressed,
            ]}
          >
            {deployMutation.isPending ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.deployButtonText}>
                {disableReason && disableReason !== 'Deploying' ? disableReason : 'Deploy to Round'}
              </Text>
            )}
          </Pressable>

          {deployMutation.error && <Text style={styles.errorText}>{deployMutation.error.message}</Text>}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Your Deployment</Text>
          {player ? (
            <View style={styles.deploymentBody}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Points deployed</Text>
                <Text style={styles.summaryValue}>{formatTokenAmount(player.pointsDeployed)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Status</Text>
                <Text style={styles.summaryValue}>
                  {player.result === 'pending' ? 'Waiting for settle' : player.result}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Reward</Text>
                <Text style={styles.summaryValue}>{formatTokenAmount(player.rewardAmount)}</Text>
              </View>
              {player.result !== 'pending' && (
                <Pressable
                  onPress={() => setOverlayVisible(true)}
                  accessibilityRole="button"
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>View Result</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <Text style={styles.emptyCopy}>
              Deploy into the active round to get a hit or miss reveal after settlement.
            </Text>
          )}
        </View>

        <View style={styles.footerPanel}>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text style={styles.footerTitle}>Need more points?</Text>
            <Text style={styles.footerCopy}>
              Complete offers, verify activity, then come back before the next round ends.
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/explore')}
            accessibilityRole="button"
            style={styles.earnButton}
          >
            <Text style={styles.earnButtonText}>Earn More</Text>
          </Pressable>
        </View>
      </ScrollView>

      <RoundResultOverlay visible={overlayVisible} result={resultQuery.data} onClose={() => setOverlayVisible(false)} />
    </SafeScreen>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontFamily: typography.headlineFont,
    fontSize: 20,
    color: colors.onSurface,
  },
  headerSubtitle: {
    fontFamily: typography.bodyRegular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['3xl'],
    gap: spacing.xl,
  },
  hero: {
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
  },
  kicker: {
    fontFamily: typography.labelSmall,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countdown: {
    fontFamily: typography.displayMd,
    fontSize: 36,
    lineHeight: 42,
    color: colors.primary,
  },
  heroCopy: {
    fontFamily: typography.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.onSurfaceVariant,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBlock: {
    flex: 1,
    minHeight: 72,
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainer,
  },
  statValue: {
    fontFamily: typography.headlineMedium,
    fontSize: 18,
    color: colors.onSurface,
  },
  statLabel: {
    fontFamily: typography.labelSmall,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inlineStatusText: {
    fontFamily: typography.bodyRegular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  panel: {
    gap: spacing.base,
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceContainerLow,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  panelTitle: {
    fontFamily: typography.headlineMedium,
    fontSize: 18,
    color: colors.onSurface,
  },
  panelHint: {
    fontFamily: typography.labelSemiBold,
    fontSize: 12,
    color: colors.primaryContainer,
  },
  inputWrap: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainer,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontFamily: typography.headlineMedium,
    fontSize: 24,
    color: colors.onSurface,
  },
  inputSuffix: {
    paddingRight: spacing.base,
    fontFamily: typography.labelSemiBold,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  balanceText: {
    fontFamily: typography.bodyRegular,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  balanceValue: {
    fontFamily: typography.labelSemiBold,
    fontSize: 13,
    color: colors.onSurface,
  },
  deployButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.full,
    backgroundColor: colors.primaryContainer,
  },
  deployButtonPressed: {
    opacity: 0.85,
  },
  deployButtonDisabled: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  deployButtonText: {
    fontFamily: typography.buttonFont,
    fontSize: 15,
    color: colors.surface,
  },
  errorText: {
    fontFamily: typography.bodyRegular,
    fontSize: 13,
    color: colors.error,
  },
  deploymentBody: {
    gap: spacing.md,
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
    textTransform: 'capitalize',
  },
  emptyCopy: {
    fontFamily: typography.bodyRegular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceVariant,
  },
  secondaryButton: {
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
  footerPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceContainerLow,
  },
  footerTitle: {
    fontFamily: typography.headlineMedium,
    fontSize: 16,
    color: colors.onSurface,
  },
  footerCopy: {
    fontFamily: typography.bodyRegular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.onSurfaceVariant,
  },
  earnButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.primaryContainer,
  },
  earnButtonText: {
    fontFamily: typography.buttonFont,
    fontSize: 13,
    color: colors.surface,
  },
})
