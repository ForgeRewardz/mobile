import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useWallet } from '@/hooks/useWallet'
import { useWalletStore } from '@/store'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { colors, typography, radii } from '@/theme/tokens'

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
        <Text className="text-3xl text-on-surface mb-4" style={{ fontFamily: typography.headlineFont }}>
          Connect Wallet
        </Text>
        <Text
          className="text-base text-on-surface-variant text-center mb-8"
          style={{ fontFamily: typography.bodyFont }}
        >
          Connect your Solana wallet to access Rewardz. We use Mobile Wallet Adapter for secure signing.
        </Text>
        {error && (
          <Text className="text-sm text-error text-center mb-4" style={{ fontFamily: typography.bodyFont }}>
            {error}
          </Text>
        )}
        <Pressable onPress={handleConnect} disabled={isConnecting} className="w-full active:opacity-80">
          <View
            style={{
              backgroundColor: colors.primary,
              borderRadius: radii.full,
              paddingVertical: 16,
              paddingHorizontal: 32,
              alignItems: 'center',
              opacity: isConnecting ? 0.7 : 1,
            }}
          >
            {isConnecting ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text
                className="text-lg"
                style={{
                  fontFamily: typography.buttonFont,
                  color: colors.surface,
                }}
              >
                Connect Wallet
              </Text>
            )}
          </View>
        </Pressable>
      </View>
    </SafeScreen>
  )
}
