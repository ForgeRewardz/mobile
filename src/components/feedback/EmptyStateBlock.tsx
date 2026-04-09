import { View, Text, Pressable } from 'react-native'
import { colors, typography, spacing } from '@/theme/tokens'

interface EmptyStateBlockProps {
  icon?: string
  title: string
  message?: string
  ctaText?: string
  onPress?: () => void
}

export function EmptyStateBlock({ icon, title, message, ctaText, onPress }: EmptyStateBlockProps) {
  return (
    <View style={{ paddingVertical: spacing['2xl'] }} className="items-center justify-center">
      {icon && <Text style={{ fontSize: 48, marginBottom: spacing.base }}>{icon}</Text>}

      <Text
        style={{
          fontFamily: typography.headlineFont,
          fontSize: 20,
          color: colors.onSurface,
          textAlign: 'center',
          marginBottom: message ? spacing.sm : 0,
        }}
      >
        {title}
      </Text>

      {message && (
        <Text
          style={{
            fontFamily: typography.bodyFont,
            fontSize: 14,
            color: colors.onSurfaceVariant,
            textAlign: 'center',
            lineHeight: 20,
            paddingHorizontal: spacing.xl,
          }}
        >
          {message}
        </Text>
      )}

      {ctaText && onPress && (
        <Pressable onPress={onPress} style={{ marginTop: spacing.xl }}>
          <View
            style={{
              backgroundColor: colors.primaryContainer,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.md,
              borderRadius: 9999,
            }}
          >
            <Text
              style={{
                fontFamily: typography.buttonFont,
                fontSize: 14,
                color: colors.surface,
                textAlign: 'center',
              }}
            >
              {ctaText}
            </Text>
          </View>
        </Pressable>
      )}
    </View>
  )
}
