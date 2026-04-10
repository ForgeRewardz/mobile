import { ScrollView, View, Text } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { BackButton } from '@/components/navigation/BackButton'
import { TrustBadge } from '@/components/cards'
import { StickyBottomCTA } from '@/components/feedback'
import { colors, typography, spacing, radii } from '@/theme/tokens'
import type { IntentOffer } from '@/types/api'

/**
 * Placeholder hook — returns mock data for the requested offer id.
 *
 * The real data source will be wired once a route exists that can pass
 * the full offer object through navigation state. For now the results
 * screen only forwards the id, so the detail screen renders a
 * deterministic mock.
 */
function usePendingOffer(id: string): IntentOffer {
  return {
    id,
    protocolName: 'Sample Protocol',
    actionType: 'swap',
    title: 'Swap 100 USDC → SOL',
    description: 'Execute this swap and earn points',
    iconUrl: '',
    actionUrl: 'https://example.com/action',
    rewardPoints: 120,
    eligibility: 'eligible',
    trustScore: 8500,
    rank: 1,
  }
}

const ELIGIBILITY_RULES: readonly string[] = [
  'Minimum swap amount of 100 USDC',
  'Wallet must hold a non-zero SOL balance for gas',
  'Action must complete in a single on-chain transaction',
]

export default function OfferDetailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ id: string }>()
  const offerId = params.id ?? ''
  const offer = usePendingOffer(offerId)

  const handleContinue = () => {
    router.push({
      pathname: '/(tabs)/home/blink',
      params: { offerId: offer.id, actionUrl: offer.actionUrl },
    })
  }

  return (
    <SafeScreen>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.md,
          gap: spacing.md,
        }}
      >
        <BackButton />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 160,
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Protocol header section */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.base,
          }}
        >
          {/* Large protocol icon placeholder */}
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: radii.full,
              backgroundColor: colors.surfaceContainerHighest,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: typography.headlineFont,
                fontSize: 24,
                color: colors.onSurfaceVariant,
              }}
            >
              {offer.protocolName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text
              style={{
                fontFamily: typography.headlineFont,
                fontSize: 20,
                color: colors.onSurface,
              }}
              numberOfLines={1}
            >
              {offer.protocolName}
            </Text>
            {typeof offer.trustScore === 'number' && (
              <View style={{ flexDirection: 'row' }}>
                <TrustBadge score={offer.trustScore} />
              </View>
            )}
          </View>
        </View>

        {/* Action title */}
        <View style={{ gap: spacing.sm }}>
          <Text
            style={{
              fontFamily: typography.headlineFont,
              fontSize: 26,
              lineHeight: 32,
              color: colors.onSurface,
            }}
          >
            {offer.title}
          </Text>

          {/* Action description */}
          <Text
            style={{
              fontFamily: typography.bodyFont,
              fontSize: 15,
              lineHeight: 22,
              color: colors.onSurface,
            }}
          >
            {offer.description}
          </Text>
        </View>

        {/* Points reward display */}
        <View
          style={{
            alignItems: 'center',
            gap: spacing.xs,
            paddingVertical: spacing.lg,
          }}
        >
          <Text
            style={{
              fontFamily: typography.displayFont,
              fontSize: 64,
              lineHeight: 72,
              color: colors.primary,
            }}
          >
            {offer.rewardPoints.toLocaleString('en-US')}
          </Text>
          <Text
            style={{
              fontFamily: typography.labelFont,
              fontSize: 14,
              color: colors.onSurfaceVariant,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            points
          </Text>
        </View>

        {/* What will happen section */}
        <View style={{ gap: spacing.sm }}>
          <Text
            style={{
              fontFamily: typography.headlineMdFont,
              fontSize: 16,
              color: colors.onSurface,
            }}
          >
            What will happen
          </Text>
          <Text
            style={{
              fontFamily: typography.bodyFont,
              fontSize: 14,
              lineHeight: 20,
              color: colors.onSurfaceVariant,
            }}
          >
            {`You'll be taken to a Blink view that wraps this action. Sign the transaction with your wallet and the protocol executes on-chain. Your reward is credited once the transaction is confirmed.`}
          </Text>
        </View>

        {/* Eligibility rules list */}
        <View style={{ gap: spacing.sm }}>
          <Text
            style={{
              fontFamily: typography.headlineMdFont,
              fontSize: 16,
              color: colors.onSurface,
            }}
          >
            Eligibility
          </Text>
          <View style={{ gap: spacing.xs }}>
            {ELIGIBILITY_RULES.map((rule) => (
              <View
                key={rule}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: spacing.sm,
                }}
              >
                <Text
                  style={{
                    fontFamily: typography.bodyFont,
                    fontSize: 14,
                    lineHeight: 20,
                    color: colors.primary,
                  }}
                >
                  •
                </Text>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: typography.bodyFont,
                    fontSize: 14,
                    lineHeight: 20,
                    color: colors.onSurfaceVariant,
                  }}
                >
                  {rule}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reward timing note */}
        <View
          style={{
            backgroundColor: colors.surfaceContainerLow,
            borderRadius: radii.lg,
            padding: spacing.base,
          }}
        >
          <Text
            style={{
              fontFamily: typography.bodyFont,
              fontSize: 13,
              lineHeight: 18,
              color: colors.onSurfaceVariant,
            }}
          >
            Points awarded after on-chain verification. Keep the app open until the Blink transaction finalises so we
            can credit your wallet immediately.
          </Text>
        </View>
      </ScrollView>

      <StickyBottomCTA label="Continue with Blink" onPress={handleContinue} />
    </SafeScreen>
  )
}
