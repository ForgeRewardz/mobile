import { useEffect } from 'react'
import { View, Text } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { BackButton } from '@/components/navigation/BackButton'
import { PendingVerificationBlock, StickyBottomCTA } from '@/components/feedback'
import { useCompletionStatus } from '@/hooks/use-completion-status'
import { colors, typography, spacing } from '@/theme/tokens'

export default function VerifyingScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ completionId: string; signature?: string }>()
  const completionId = params.completionId ?? ''

  const { data } = useCompletionStatus(completionId || null)

  // React to terminal completion states.
  useEffect(() => {
    if (!data) return
    const status = data.status
    if (status === 'awarded') {
      router.replace({
        pathname: '/(tabs)/home/awarded',
        params: {
          points: String(data.pointsAwarded ?? 0),
          completionId,
        },
      })
      return
    }
    if (status === 'confirmed_not_eligible' || status === 'rejected') {
      router.replace({
        pathname: '/(tabs)/home/rejected',
        params: { reason: data.reason ?? status },
      })
    }
  }, [data, router, completionId])

  const handleViewRules = () => {
    // Rules page is not yet wired — noop for now. Tertiary affordance is
    // still useful visually and prevents dead taps breaking screenshots.
  }

  const handleGoToRewards = () => {
    router.replace('/(tabs)/rewards')
  }

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

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing['3xl'],
        }}
      >
        {/* Success check — acknowledges the tx was confirmed on-chain */}
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 9999,
            backgroundColor: `${colors.tertiary}22`,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.base,
          }}
          accessibilityLabel="Transaction confirmed"
        >
          <Text
            style={{
              fontFamily: typography.displayLg,
              fontSize: 36,
              color: colors.tertiary,
            }}
          >
            {'\u2713'}
          </Text>
        </View>

        <PendingVerificationBlock
          message="Verifying reward eligibility"
          expectedWait="Usually takes 30-60 seconds"
          onViewRules={handleViewRules}
        />
      </View>

      <StickyBottomCTA label="Go to Rewards" onPress={handleGoToRewards} />
    </SafeScreen>
  )
}
