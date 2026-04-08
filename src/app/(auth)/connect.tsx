import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useWallet } from '@/hooks/useWallet'
import { useWalletStore } from '@/store'
import { SafeScreen } from '@/components/layout/SafeScreen'

export default function ConnectScreen() {
  const router = useRouter()
  const { connect } = useWallet()
  const { isConnecting, error } = useWalletStore()

  const handleConnect = async () => {
    try {
      await connect()
      router.push('/(auth)/unlock')
    } catch {
      // error is set in the store by useWallet
    }
  }

  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Connect Wallet</Text>
        <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-8">
          Connect your Solana wallet to access Rewardz. We use Mobile Wallet Adapter for secure signing.
        </Text>
        {error && <Text className="text-red-500 text-sm text-center mb-4">{error}</Text>}
        <Pressable
          onPress={handleConnect}
          disabled={isConnecting}
          className="bg-indigo-500 px-8 py-4 rounded-2xl active:bg-indigo-600 w-full items-center"
        >
          {isConnecting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Connect Wallet</Text>
          )}
        </Pressable>
      </View>
    </SafeScreen>
  )
}
