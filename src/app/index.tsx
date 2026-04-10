import { View, ActivityIndicator } from 'react-native'
import { Redirect } from 'expo-router'
import { useAppStore } from '@/store'
import { useAppState } from '@/hooks/useAppState'

// TODO: remove once wallet is available — dev-only bypass so we can preview
// the home/explore/rewards/profile tabs without an MWA wallet on the device.
const DEV_BYPASS_AUTH = true

export default function Index() {
  const hasHydrated = useAppStore((s) => s._hasHydrated)
  const { needsOnboarding, needsUnlock } = useAppState()

  // Wait for Zustand to rehydrate from AsyncStorage before routing,
  // otherwise we flash the wrong screen (Bug C from Klaus review)
  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    )
  }

  if (DEV_BYPASS_AUTH) {
    return <Redirect href="/(tabs)/home" />
  }

  if (needsOnboarding) {
    return <Redirect href="/(auth)/welcome" />
  }

  if (needsUnlock) {
    return <Redirect href="/locked" />
  }

  return <Redirect href="/(tabs)/home" />
}
