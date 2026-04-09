import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useWallet } from '@/hooks/useWallet'
import { truncateAddress } from '@/utils/format'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { colors, typography, radii } from '@/theme/tokens'

export default function UnlockScreen() {
  const router = useRouter()
  const { publicKey } = useWallet()

  const handleStake = () => {
    // TODO: Implement staking flow in TODO-0009
    router.push('/(auth)/success')
  }

  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-3xl text-on-surface mb-2" style={{ fontFamily: typography.headlineFont }}>
          Unlock Access
        </Text>
        {publicKey && (
          <Text className="text-sm text-on-surface-variant mb-6" style={{ fontFamily: typography.bodyFont }}>
            Wallet: {truncateAddress(publicKey)}
          </Text>
        )}
        <Text
          className="text-base text-on-surface-variant text-center mb-8"
          style={{ fontFamily: typography.bodyFont }}
        >
          Stake Token X to unlock full access to Rewardz. Your stake grants eligibility for rewarded actions and points.
        </Text>
        <Pressable onPress={handleStake} className="w-full active:opacity-80 mb-4">
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
              Stake to Unlock
            </Text>
          </View>
        </Pressable>
        <Pressable onPress={() => router.push('/locked')} className="px-8 py-3">
          <Text className="text-sm text-primary" style={{ fontFamily: typography.labelFont }}>
            Skip for now
          </Text>
        </Pressable>
      </View>
    </SafeScreen>
  )
}
