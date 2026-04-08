import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useAppStore } from '@/store'
import { SafeScreen } from '@/components/layout/SafeScreen'

export default function LockedScreen() {
  const router = useRouter()
  const { setOnboarded } = useAppStore()

  const handleStake = () => {
    // TODO: Navigate to staking flow in TODO-0009
    router.push('/(auth)/unlock')
  }

  const handleBrowse = () => {
    setOnboarded(true)
    router.replace('/(tabs)/home')
  }

  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Limited Access</Text>
        <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-8">
          Stake Token X to unlock full features — rewarded actions, points, and Token X minting.
        </Text>
        <Pressable
          onPress={handleStake}
          className="bg-indigo-500 px-8 py-4 rounded-2xl active:bg-indigo-600 w-full items-center mb-4"
        >
          <Text className="text-white font-bold text-lg">Stake to Unlock</Text>
        </Pressable>
        <Pressable onPress={handleBrowse} className="px-8 py-3">
          <Text className="text-gray-500 dark:text-gray-400">Browse in teaser mode</Text>
        </Pressable>
      </View>
    </SafeScreen>
  )
}
