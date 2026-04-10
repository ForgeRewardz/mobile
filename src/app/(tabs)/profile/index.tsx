import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useWallet } from '@/hooks/useWallet'
import { truncateAddress } from '@/utils/format'
import { SafeScreen } from '@/components/layout/SafeScreen'

export default function ProfileScreen() {
  const router = useRouter()
  const { publicKey, connected, disconnect } = useWallet()

  return (
    <SafeScreen>
      <View className="flex-1 py-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile</Text>

        {/* Wallet identity */}
        <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 mb-6">
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">Wallet</Text>
          <Text className="text-base font-mono text-gray-900 dark:text-white">
            {connected && publicKey ? truncateAddress(publicKey, 8) : 'Not connected'}
          </Text>
        </View>

        {/* Quick links */}
        {[
          { label: 'Stake Management', route: '/(tabs)/profile/stake' as const },
          { label: 'Notifications', route: '/(tabs)/profile/notifications' as const },
          { label: 'Settings', route: '/(tabs)/profile/settings' as const },
          { label: 'Help & Support', route: '/(tabs)/profile/help' as const },
        ].map((item) => (
          <Pressable
            key={item.label}
            onPress={() => router.push(item.route)}
            accessibilityRole="button"
            accessibilityLabel={`${item.label}, opens ${item.label.toLowerCase()} screen`}
            className="py-4 border-b border-gray-100 dark:border-gray-800"
          >
            <Text className="text-base text-gray-900 dark:text-white">{item.label}</Text>
          </Pressable>
        ))}

        {connected && (
          <Pressable
            onPress={disconnect}
            accessibilityRole="button"
            accessibilityLabel="Disconnect wallet"
            className="mt-8 py-3 items-center"
          >
            <Text className="text-red-500 font-medium">Disconnect Wallet</Text>
          </Pressable>
        )}
      </View>
    </SafeScreen>
  )
}
