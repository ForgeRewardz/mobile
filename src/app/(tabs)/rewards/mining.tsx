import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { BackButton } from '@/components/navigation/BackButton'
import { colors, typography, spacing, radii } from '@/theme/tokens'

export default function MiningTeaserScreen() {
  const router = useRouter()

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
          Mining Coming Soon
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.lg,
          gap: spacing.xl,
        }}
      >
        <Text style={{ fontSize: 72 }}>{'\u26CF\uFE0F'}</Text>

        <View style={{ alignItems: 'center', gap: spacing.md }}>
          <Text
            style={{
              fontFamily: typography.displayMd,
              fontSize: 26,
              color: colors.onSurface,
              textAlign: 'center',
            }}
          >
            Burn-to-Mint Mining
          </Text>

          <Text
            style={{
              fontFamily: typography.bodyFont,
              fontSize: 15,
              lineHeight: 22,
              color: colors.onSurfaceVariant,
              textAlign: 'center',
            }}
          >
            Burn your points for a chance to mint Token X. Hash-threshold mining gives a ~10% success rate.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: `${colors.primaryContainer}22`,
            borderRadius: radii.full,
            paddingHorizontal: spacing.base,
            paddingVertical: spacing.sm,
          }}
        >
          <Text
            style={{
              fontFamily: typography.labelBold,
              fontSize: 12,
              color: colors.primary,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Coming Soon
          </Text>
        </View>
      </View>

      <View style={{ paddingBottom: spacing.xl }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          style={{
            backgroundColor: colors.surfaceContainerLow,
            borderRadius: radii.full,
            paddingVertical: spacing.md,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: typography.buttonFont,
              fontSize: 15,
              color: colors.onSurface,
            }}
          >
            Back
          </Text>
        </Pressable>
      </View>
    </SafeScreen>
  )
}
