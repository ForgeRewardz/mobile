import { useEffect, useState } from 'react'
import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import Animated, { FadeIn } from 'react-native-reanimated'
import * as WebBrowser from 'expo-web-browser'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { BackButton } from '@/components/navigation/BackButton'
import { useTransactionStatus } from '@/hooks/use-transaction-status'
import { colors, typography, spacing, radii } from '@/theme/tokens'

const SLOW_WARNING_MS = 15_000

function truncateSignature(sig: string): string {
  if (sig.length <= 10) return sig
  return `${sig.slice(0, 4)}...${sig.slice(-4)}`
}

function buildExplorerUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}`
}

export default function PendingScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ signature: string; completionId?: string }>()
  const signature = params.signature ?? ''
  const completionId = params.completionId

  const { data } = useTransactionStatus(signature || null)
  const [elapsedMs, setElapsedMs] = useState(0)

  // Track elapsed time for slow warning.
  useEffect(() => {
    const startedAt = Date.now()
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startedAt)
    }, 1_000)
    return () => clearInterval(interval)
  }, [])

  // React to terminal tx states.
  useEffect(() => {
    if (!data) return
    const status = data.status
    if (status === 'confirmed' || status === 'finalized') {
      router.replace({
        pathname: '/(tabs)/home/verifying',
        params: {
          ...(completionId ? { completionId } : {}),
          signature,
        },
      })
      return
    }
    if (status === 'failed' || status === 'expired') {
      router.replace({
        pathname: '/(tabs)/home/rejected',
        params: { reason: 'transaction_failed' },
      })
    }
  }, [data, router, signature, completionId])

  const handleOpenExplorer = () => {
    if (!signature) return
    WebBrowser.openBrowserAsync(buildExplorerUrl(signature)).catch(() => {
      // Swallow browser open failures — user can retry from the pill.
    })
  }

  const showSlowWarning = elapsedMs >= SLOW_WARNING_MS

  return (
    <SafeScreen>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.md,
        }}
      >
        <BackButton />
      </View>

      <Animated.View
        entering={FadeIn.duration(400)}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.lg,
        }}
      >
        {/* Status icon */}
        <Text
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ fontSize: 64, marginBottom: spacing.xl }}
        >
          {'\u23F3'}
        </Text>

        {/* Title */}
        <Text
          style={{
            fontFamily: typography.headlineFont,
            fontSize: 22,
            color: colors.onSurface,
            textAlign: 'center',
            marginBottom: spacing.md,
          }}
        >
          Waiting for confirmation
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            fontFamily: typography.bodyFont,
            fontSize: 14,
            color: colors.onSurfaceVariant,
            textAlign: 'center',
            marginBottom: spacing.xl,
          }}
        >
          Your transaction is being confirmed on Solana
        </Text>

        {/* Signature pill → explorer */}
        {signature ? (
          <Pressable
            onPress={handleOpenExplorer}
            accessibilityRole="button"
            accessibilityLabel="Open transaction in Solana explorer"
            style={{
              backgroundColor: colors.surfaceContainerHighest,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.base,
              borderRadius: radii.full,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: spacing.xl,
            }}
          >
            <Text
              style={{
                fontFamily: typography.labelFont,
                fontSize: 13,
                color: colors.primary,
              }}
            >
              {truncateSignature(signature)}
            </Text>
            <Text
              style={{
                fontFamily: typography.labelFont,
                fontSize: 13,
                color: colors.onSurfaceVariant,
                marginLeft: spacing.sm,
              }}
            >
              {'\u2197'}
            </Text>
          </Pressable>
        ) : null}

        <ActivityIndicator size="large" color={colors.primary} />

        {/* Slow warning */}
        {showSlowWarning ? (
          <Text
            style={{
              fontFamily: typography.labelFont,
              fontSize: 13,
              color: colors.warning,
              textAlign: 'center',
              marginTop: spacing.xl,
            }}
          >
            This is taking longer than usual
          </Text>
        ) : null}
      </Animated.View>
    </SafeScreen>
  )
}
