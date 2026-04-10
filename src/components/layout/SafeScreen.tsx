import { StatusBar, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '@/theme/tokens'

interface SafeScreenProps {
  children: React.ReactNode
  /** Extra Tailwind classes applied to the inner content View */
  className?: string
  /** When true the horizontal padding is removed (e.g. full-bleed screens) */
  noPadding?: boolean
}

export function SafeScreen({ children, className, noPadding = false }: SafeScreenProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.surface} />
      <View style={{ flex: 1 }} className={`${noPadding ? '' : 'px-4'} ${className ?? ''}`}>
        {children}
      </View>
    </SafeAreaView>
  )
}
