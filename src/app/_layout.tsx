import '../global.css'

import { Slot } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { MobileWalletProvider } from '@wallet-ui/react-native-kit'
import { QueryProvider } from '@/providers/QueryProvider'
import { getCluster, getAppIdentity } from '@/config/solana'

const cluster = getCluster()
const identity = getAppIdentity()

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MobileWalletProvider cluster={cluster} identity={identity}>
        <QueryProvider>
          <Slot />
        </QueryProvider>
      </MobileWalletProvider>
    </GestureHandlerRootView>
  )
}
