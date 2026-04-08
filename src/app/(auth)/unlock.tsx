import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useWallet } from '@/hooks/useWallet'
import { truncateAddress } from '@/utils/format'
import { SafeScreen } from '@/components/layout/SafeScreen'

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
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Unlock Access</Text>
        {publicKey && (
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-6">Wallet: {truncateAddress(publicKey)}</Text>
        )}
        <Text className="text-base text-gray-600 dark:text-gray-300 text-center mb-8">
          Stake Token X to unlock full access to Rewardz. Your stake grants eligibility for rewarded actions and points.
        </Text>
        <Pressable
          onPress={handleStake}
          className="bg-indigo-500 px-8 py-4 rounded-2xl active:bg-indigo-600 w-full items-center mb-4"
        >
          <Text className="text-white font-bold text-lg">Stake to Unlock</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/locked')} className="px-8 py-3">
          <Text className="text-gray-500 dark:text-gray-400 text-sm">Skip for now</Text>
        </Pressable>
      </View>
    </SafeScreen>
  )
}
