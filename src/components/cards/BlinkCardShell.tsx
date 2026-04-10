import { View, Text } from 'react-native'
import { colors, fonts, radii } from '@/theme/tokens'

// Re-export Dialect's Blink component so screens can opt into it as an
// enhancement over NativeBlinkCard. NativeBlinkCard is the PRIMARY
// implementation for React 19 / RN 0.83 compat reasons; Dialect is opt-in.
export { Blink as DialectBlink, Miniblink as DialectMiniblink } from '@dialectlabs/blinks-react-native'

interface BlinkCardShellProps {
  children: React.ReactNode
  title?: string
  protocolName?: string
}

export function BlinkCardShell({ children, title, protocolName }: BlinkCardShellProps) {
  return (
    <View
      style={{
        backgroundColor: colors.surfaceContainer,
        borderRadius: radii.xl,
        padding: 16,
      }}
    >
      {(title || protocolName) && (
        <View style={{ marginBottom: 12, gap: 2 }}>
          {protocolName && (
            <Text
              style={{
                color: colors.onSurfaceVariant,
                fontFamily: fonts.label,
                fontSize: 11,
                lineHeight: 16,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {protocolName}
            </Text>
          )}
          {title && (
            <Text
              style={{
                color: colors.onSurface,
                fontFamily: fonts.headline,
                fontSize: 16,
                lineHeight: 22,
              }}
            >
              {title}
            </Text>
          )}
        </View>
      )}
      {children}
    </View>
  )
}
