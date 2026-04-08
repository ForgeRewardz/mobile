import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useAppStore } from '@/store'
import { SafeScreen } from '@/components/layout/SafeScreen'

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
        <Text className="text-5xl mb-6">✓</Text>
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-4">You're In!</Text>
        <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-8">
          Your stake is active. You now have full access to discover offers, earn points, and mint Token X.
        </Text>
        <Pressable
          onPress={handleContinue}
          className="bg-indigo-500 px-8 py-4 rounded-2xl active:bg-indigo-600 w-full items-center"
        >
          <Text className="text-white font-bold text-lg">Start Exploring</Text>
        </Pressable>
      </View>
    </SafeScreen>
  )
}
