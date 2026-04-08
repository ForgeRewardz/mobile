import { View, Text, Pressable, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useWallet } from '@/hooks/useWallet'
import { truncateAddress } from '@/utils/format'
import { SafeScreen } from '@/components/layout/SafeScreen'

export default function HomeScreen() {
  const router = useRouter()
  const { publicKey } = useWallet()

  return (
    <SafeScreen>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Welcome back{publicKey ? `, ${truncateAddress(publicKey)}` : ''}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-6">Discover rewarded actions across Solana</Text>

          {/* Intent search */}
          <Pressable
            onPress={() => router.push('/(tabs)/home/search')}
            className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-4 mb-6"
          >
            <Text className="text-gray-400 dark:text-gray-500">What do you want to do?</Text>
          </Pressable>

          {/* Quick action chips */}
          <View className="flex-row flex-wrap gap-2 mb-6">
            {['Swap', 'Stake', 'Mint', 'Vote', 'Pay'].map((action) => (
              <Pressable
                key={action}
                onPress={() => router.push({ pathname: '/(tabs)/home/results', params: { query: action } })}
                className="bg-indigo-100 dark:bg-indigo-900 px-4 py-2 rounded-full"
              >
                <Text className="text-indigo-700 dark:text-indigo-300 font-medium text-sm">{action}</Text>
              </Pressable>
            ))}
          </View>

          {/* Placeholder sections */}
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Featured Offers</Text>
          <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-40 items-center justify-center mb-6">
            <Text className="text-gray-400">Featured offers carousel — TODO-0011</Text>
          </View>

          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Trending Missions</Text>
          <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-32 items-center justify-center mb-6">
            <Text className="text-gray-400">Trending missions — TODO-0011</Text>
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  )
}
