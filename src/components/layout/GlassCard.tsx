import { Platform, View, type ViewStyle, type StyleProp } from 'react-native'
import { BlurView } from 'expo-blur'

interface GlassCardProps {
  children: React.ReactNode
  /** Additional inline styles merged onto the outer wrapper */
  style?: StyleProp<ViewStyle>
  /** Additional Tailwind classes on the outer wrapper */
  className?: string
}

/**
 * Glassmorphism card.
 *
 * - iOS  — expo-blur BlurView with intensity 60 and dark tint.
 * - Android — semi-transparent dark background (blur is too expensive).
 *
 * No 1px borders. Structure communicated via background shift only.
 */
export function GlassCard({ children, style, className }: GlassCardProps) {
  if (Platform.OS === 'ios') {
    return (
      <View className={`overflow-hidden rounded-xl ${className ?? ''}`} style={style}>
        <BlurView intensity={60} tint="dark" style={{ flex: 1, padding: 16 }}>
          {children}
        </BlurView>
      </View>
    )
  }

  // Android fallback — no blur, semi-transparent bg
  return (
    <View
      className={`rounded-xl ${className ?? ''}`}
      style={[{ backgroundColor: 'rgba(24, 28, 34, 0.85)', padding: 16 }, style]}
    >
      {children}
    </View>
  )
}
