import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeScreen } from '@/components/layout/SafeScreen'

export default function ErrorScreen() {
  const router = useRouter()

  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Something went wrong</Text>
        <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-8">
          Please check your connection and try again.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-indigo-500 px-8 py-4 rounded-2xl active:bg-indigo-600 w-full items-center"
        >
          <Text className="text-white font-bold text-lg">Go Back</Text>
        </Pressable>
      </View>
    </SafeScreen>
  )
}
