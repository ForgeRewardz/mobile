import { View, Text, ScrollView } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { BackButton } from '@/components/navigation/BackButton'
import { QuestTypePill } from '@/components/cards/QuestTypePill'
import { StickyBottomCTA } from '@/components/feedback/StickyBottomCTA'
import type { Quest } from '@/types/api'
import { colors, typography, spacing, radii } from '@/theme/tokens'

export default function MissionDetailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ id: string }>()

  // Placeholder mock until single-mission endpoint exists.
  const mission: Quest = {
    id: params.id ?? 'demo-mission-1',
    title: 'Swap Mission',
    description: 'Complete a swap on any DEX to earn points',
    questType: 'engagement',
    rewardPoints: 200,
    protocolName: 'Any DEX',
    steps: [],
    expiresAt: null,
  }

  const requirements: string[] = [
    'Hold a connected wallet with at least 0.01 SOL for fees',
    'Complete a single swap on any supported DEX',
    'Swap confirmed on-chain within the active epoch',
  ]

  const handleStart = () => {
    router.push({
      pathname: '/(tabs)/home/search',
      params: { action: mission.questType },
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
        <Text
          style={{
            fontFamily: typography.headlineFont,
            fontSize: 20,
            color: colors.onSurface,
          }}
        >
          Mission
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 140,
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quest header */}
        <View style={{ gap: spacing.md }}>
          <QuestTypePill questType={mission.questType} />

          <Text
            style={{
              fontFamily: typography.displayMd,
              fontSize: 28,
              lineHeight: 34,
              color: colors.onSurface,
            }}
          >
            {mission.title}
          </Text>

          {mission.protocolName && (
            <Text
              style={{
                fontFamily: typography.bodyMdFont,
                fontSize: 14,
                color: colors.onSurfaceVariant,
              }}
            >
              {mission.protocolName}
            </Text>
          )}

          <Text
            style={{
              fontFamily: typography.bodyFont,
              fontSize: 15,
              lineHeight: 22,
              color: colors.onSurfaceVariant,
            }}
          >
            {mission.description}
          </Text>
        </View>

        {/* Reward amount */}
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
              fontFamily: typography.labelFont,
              fontSize: 12,
              color: colors.onSurfaceVariant,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            }}
          >
            Reward
          </Text>
          <Text
            style={{
              fontFamily: typography.displayLg,
              fontSize: 40,
              lineHeight: 46,
              color: colors.primary,
            }}
          >
            {mission.rewardPoints.toLocaleString('en-US')}
          </Text>
          <Text
            style={{
              fontFamily: typography.bodyFont,
              fontSize: 13,
              color: colors.onSurfaceVariant,
            }}
          >
            points
          </Text>
        </View>

        {/* Requirements section */}
        <View style={{ gap: spacing.md }}>
          <Text
            style={{
              fontFamily: typography.headlineMdFont,
              fontSize: 18,
              color: colors.onSurface,
            }}
          >
            Requirements
          </Text>

          <View style={{ gap: spacing.sm }}>
            {requirements.map((item) => (
              <View
                key={item}
                style={{
                  flexDirection: 'row',
                  gap: spacing.md,
                  alignItems: 'flex-start',
                }}
              >
                <Text
                  style={{
                    fontFamily: typography.bodyFont,
                    fontSize: 15,
                    color: colors.primary,
                    lineHeight: 22,
                  }}
                >
                  {'\u2022'}
                </Text>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: typography.bodyFont,
                    fontSize: 15,
                    lineHeight: 22,
                    color: colors.onSurface,
                  }}
                >
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Eligibility + timing */}
        <View
          style={{
            backgroundColor: colors.surfaceContainerLow,
            borderRadius: radii.xl,
            padding: spacing.base,
            gap: spacing.sm,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text
              style={{
                fontFamily: typography.labelFont,
                fontSize: 13,
                color: colors.onSurfaceVariant,
              }}
            >
              Eligibility
            </Text>
            <Text
              style={{
                fontFamily: typography.labelBold,
                fontSize: 13,
                color: colors.tertiary,
              }}
            >
              Eligible
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text
              style={{
                fontFamily: typography.labelFont,
                fontSize: 13,
                color: colors.onSurfaceVariant,
              }}
            >
              Expires
            </Text>
            <Text
              style={{
                fontFamily: typography.labelBold,
                fontSize: 13,
                color: colors.onSurface,
              }}
            >
              {mission.expiresAt ?? 'No expiry'}
            </Text>
          </View>
        </View>
      </ScrollView>

      <StickyBottomCTA label="Start Mission" onPress={handleStart} />
    </SafeScreen>
  )
}
