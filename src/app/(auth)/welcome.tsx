import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { colors, typography, radii } from '@/theme/tokens'

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-4xl text-primary mb-4" style={{ fontFamily: typography.displayFont }}>
          Rewardz
        </Text>
        <Text className="text-lg text-on-surface-variant text-center mb-2" style={{ fontFamily: typography.bodyFont }}>
          Discover rewarded on-chain actions
        </Text>
        <Text
          className="text-base text-on-surface-variant text-center mb-12"
          style={{ fontFamily: typography.bodyFont }}
        >
          Earn points for swaps, stakes, and mints across Solana protocols. Deploy points into mining rounds.
        </Text>
        <Pressable onPress={() => router.push('/(auth)/connect')} className="w-full active:opacity-80">
          <View
            style={{
              backgroundColor: colors.primary,
              borderRadius: radii.full,
              paddingVertical: 16,
              paddingHorizontal: 32,
              alignItems: 'center',
            }}
          >
            <Text
              className="text-lg"
              style={{
                fontFamily: typography.buttonFont,
                color: colors.surface,
              }}
            >
              Get Started
            </Text>
          </View>
        </Pressable>
      </View>
    </SafeScreen>
  )
}
