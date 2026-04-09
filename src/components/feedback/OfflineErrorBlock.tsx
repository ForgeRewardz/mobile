import { View, Text, Pressable } from 'react-native'
import { colors, typography, spacing } from '@/theme/tokens'

interface OfflineErrorBlockProps {
  onRetry: () => void
  message?: string
}

export function OfflineErrorBlock({
  onRetry,
  message = 'Please check your internet connection and try again.',
}: OfflineErrorBlockProps) {
  return (
    <View style={{ paddingVertical: spacing['2xl'] }} className="items-center justify-center">
      <Text style={{ fontSize: 48, marginBottom: spacing.base }}>📡</Text>

      <Text
        style={{
          fontFamily: typography.headlineFont,
          fontSize: 20,
          color: colors.onSurface,
          textAlign: 'center',
          marginBottom: spacing.sm,
        }}
      >
        No connection
      </Text>

      <Text
        style={{
          fontFamily: typography.bodyFont,
          fontSize: 14,
          color: colors.onSurfaceVariant,
          textAlign: 'center',
          lineHeight: 20,
          paddingHorizontal: spacing.xl,
          marginBottom: spacing.xl,
        }}
      >
        {message}
      </Text>

      <Pressable onPress={onRetry}>
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
            Retry
          </Text>
        </View>
      </Pressable>
    </View>
  )
}
