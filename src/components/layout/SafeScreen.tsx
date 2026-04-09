import { StatusBar, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface SafeScreenProps {
  children: React.ReactNode
  /** Extra Tailwind classes applied to the outer SafeAreaView */
  className?: string
  /** When true the horizontal padding is removed (e.g. full-bleed screens) */
  noPadding?: boolean
}

export function SafeScreen({ children, className, noPadding = false }: SafeScreenProps) {
  return (
    <SafeAreaView className={`flex-1 bg-surface ${className ?? ''}`}>
      <StatusBar barStyle="light-content" backgroundColor="#10141a" />
      <View className={`flex-1 ${noPadding ? '' : 'px-4'}`}>{children}</View>
    </SafeAreaView>
  )
}
