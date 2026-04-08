import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export function SafeScreen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="flex-1 px-4">{children}</View>
    </SafeAreaView>
  )
}
