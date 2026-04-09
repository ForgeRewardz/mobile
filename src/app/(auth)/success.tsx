import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useAppStore } from '@/store'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { colors, typography, radii } from '@/theme/tokens'

export default function SuccessScreen() {
  const router = useRouter()
  const { setOnboarded, setUnlocked } = useAppStore()

  const handleContinue = () => {
    setOnboarded(true)
    setUnlocked(true)
    router.replace('/(tabs)/home')
  }

  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-8">
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: radii.full,
            backgroundColor: `${colors.primary}1a`,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 32, color: colors.primary }}>✓</Text>
        </View>
        <Text className="text-3xl text-on-surface mb-4" style={{ fontFamily: typography.headlineFont }}>
          You're all set!
        </Text>
        <Text
          className="text-base text-on-surface-variant text-center mb-8"
          style={{ fontFamily: typography.bodyFont }}
        >
          Your stake is active. You now have full access to discover offers, earn points, and mint Token X.
        </Text>
        <Pressable onPress={handleContinue} className="w-full active:opacity-80">
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
              Continue
            </Text>
          </View>
        </Pressable>
      </View>
    </SafeScreen>
  )
}
