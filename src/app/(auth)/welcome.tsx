import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeScreen } from '@/components/layout/SafeScreen'

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Rewardz</Text>
        <Text className="text-lg text-gray-600 dark:text-gray-300 text-center mb-2">
          Discover rewarded on-chain actions
        </Text>
        <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-12">
          Earn points for swaps, stakes, and mints across Solana protocols. Burn points to mint Token X.
        </Text>
        <Pressable
          onPress={() => router.push('/(auth)/connect')}
          className="bg-indigo-500 px-8 py-4 rounded-2xl active:bg-indigo-600 w-full items-center"
        >
          <Text className="text-white font-bold text-lg">Get Started</Text>
        </Pressable>
      </View>
    </SafeScreen>
  )
}
