import { View, Text, ActivityIndicator, Pressable } from 'react-native'
import { colors, typography, spacing } from '@/theme/tokens'

interface PendingVerificationBlockProps {
  message?: string
  expectedWait?: string
  onViewRules?: () => void
}

export function PendingVerificationBlock({
  message = 'Verifying reward eligibility',
  expectedWait = 'Usually takes 30-60 seconds',
  onViewRules,
}: PendingVerificationBlockProps) {
  return (
    <View style={{ paddingVertical: spacing['2xl'] }} className="items-center justify-center">
      <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: spacing.lg }} />

      <Text
        style={{
          fontFamily: typography.headlineFont,
          fontSize: 16,
          color: colors.onSurface,
          textAlign: 'center',
          marginBottom: spacing.sm,
        }}
      >
        {message}
      </Text>

      <Text
        style={{
          fontFamily: typography.bodyFont,
          fontSize: 13,
          color: colors.onSurfaceVariant,
          textAlign: 'center',
        }}
      >
        {expectedWait}
      </Text>

      {onViewRules && (
        <Pressable onPress={onViewRules} style={{ marginTop: spacing.lg, paddingVertical: spacing.xs }}>
          <Text
            style={{
              fontFamily: typography.labelFont,
              fontSize: 13,
              color: colors.primary,
              textAlign: 'center',
            }}
          >
            View reward rules
          </Text>
        </Pressable>
      )}
    </View>
  )
}
