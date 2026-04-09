import { View, Text, Pressable } from 'react-native'
import { colors, fonts, radii } from '@/theme/tokens'

interface LockedStateBannerProps {
  message: string
  ctaText?: string
  onPress?: () => void
}

export function LockedStateBanner({ message, ctaText, onPress }: LockedStateBannerProps) {
  return (
    <View
      style={{
        backgroundColor: colors.surfaceContainerHighest,
        borderRadius: radii.lg,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        width: '100%',
      }}
    >
      {/* Lock icon */}
      <Text style={{ fontSize: 18 }}>&#x1F512;</Text>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.onSurface,
            fontFamily: fonts.body,
            fontSize: 13,
            lineHeight: 18,
          }}
        >
          {message}
        </Text>
      </View>

      {ctaText && onPress && (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            borderRadius: 9999,
            paddingHorizontal: 14,
            paddingVertical: 6,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text
            style={{
              color: colors.surface,
              fontFamily: fonts.button,
              fontSize: 12,
              lineHeight: 16,
            }}
          >
            {ctaText}
          </Text>
        </Pressable>
      )}
    </View>
  )
}
