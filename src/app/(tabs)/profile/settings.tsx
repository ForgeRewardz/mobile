import { View, Text, Pressable, Linking } from 'react-native'
import Constants from 'expo-constants'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { BackButton } from '@/components/navigation/BackButton'
import { SegmentedControl } from '@/components/inputs'
import { colors, typography, spacing, radii } from '@/theme/tokens'

const NETWORK_SEGMENTS = ['Devnet', 'Mainnet']

export default function SettingsScreen() {
  const cluster = (Constants.expoConfig?.extra?.SOLANA_CLUSTER ?? 'devnet') as string
  const selectedNetworkIndex = cluster === 'mainnet-beta' ? 1 : 0

  const appVersion = Constants.expoConfig?.version ?? '0.0.0'

  const handleClearCache = () => {
    // No-op placeholder — wired up in a later task.
  }

  const handleAbout = () => {
    Linking.openURL('https://docs.rewardz.xyz').catch(() => {})
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
          Settings
        </Text>
      </View>

      <View style={{ flex: 1, paddingTop: spacing.md, gap: spacing.xl }}>
        {/* Network section */}
        <View style={{ gap: spacing.sm }}>
          <Text
            style={{
              fontFamily: typography.labelFont,
              fontSize: 12,
              color: colors.onSurfaceVariant,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            }}
          >
            Network
          </Text>
          <View style={{ opacity: 0.6 }}>
            <SegmentedControl
              segments={NETWORK_SEGMENTS}
              selectedIndex={selectedNetworkIndex}
              onChange={() => {
                // Disabled for now — network is read from env.
              }}
            />
          </View>
          <Text
            style={{
              fontFamily: typography.bodyFont,
              fontSize: 12,
              color: colors.onSurfaceVariant,
            }}
          >
            Configured via environment. Switching in-app is disabled.
          </Text>
        </View>

        {/* Clear cache row */}
        <View style={{ gap: spacing.sm }}>
          <Text
            style={{
              fontFamily: typography.labelFont,
              fontSize: 12,
              color: colors.onSurfaceVariant,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            }}
          >
            Storage
          </Text>
          <Pressable
            onPress={handleClearCache}
            accessibilityRole="button"
            style={{
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: radii.lg,
              paddingVertical: spacing.base,
              paddingHorizontal: spacing.base,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                fontFamily: typography.bodyMdFont,
                fontSize: 15,
                color: colors.onSurface,
              }}
            >
              Clear cache
            </Text>
            <Text
              style={{
                fontFamily: typography.labelFont,
                fontSize: 18,
                color: colors.onSurfaceVariant,
              }}
            >
              {'\u203A'}
            </Text>
          </Pressable>
        </View>

        {/* About section */}
        <View style={{ gap: spacing.sm }}>
          <Text
            style={{
              fontFamily: typography.labelFont,
              fontSize: 12,
              color: colors.onSurfaceVariant,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            }}
          >
            About
          </Text>
          <Pressable
            onPress={handleAbout}
            accessibilityRole="link"
            style={{
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: radii.lg,
              paddingVertical: spacing.base,
              paddingHorizontal: spacing.base,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                fontFamily: typography.bodyMdFont,
                fontSize: 15,
                color: colors.onSurface,
              }}
            >
              Documentation
            </Text>
            <Text
              style={{
                fontFamily: typography.labelFont,
                fontSize: 18,
                color: colors.onSurfaceVariant,
              }}
            >
              {'\u203A'}
            </Text>
          </Pressable>
        </View>

        {/* App version */}
        <View style={{ marginTop: 'auto', paddingBottom: spacing.xl, alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: typography.bodyFont,
              fontSize: 12,
              color: colors.onSurfaceVariant,
            }}
          >
            App version {appVersion}
          </Text>
        </View>
      </View>
    </SafeScreen>
  )
}
