import '../global.css'

import { useEffect } from 'react'
import { Slot } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { MobileWalletProvider } from '@wallet-ui/react-native-kit'
import { QueryProvider } from '@/providers/QueryProvider'
import { getCluster, getAppIdentity } from '@/config/solana'
import * as SplashScreen from 'expo-splash-screen'
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope'
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter'

SplashScreen.preventAutoHideAsync()

const cluster = getCluster()
const identity = getAppIdentity()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#10141a' }}>
      <SafeAreaProvider>
        <MobileWalletProvider cluster={cluster} identity={identity}>
          <QueryProvider>
            <Slot />
          </QueryProvider>
        </MobileWalletProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
