import { View, Text, Pressable } from 'react-native'
import { colors, typography, spacing } from '@/theme/tokens'

interface Condition {
  label: string
  passed: boolean
}

interface RejectionStatePanelProps {
  title?: string
  reason: string
  conditions?: Condition[]
  ctaText?: string
  onPress?: () => void
}

export function RejectionStatePanel({
  title = 'Not Eligible',
  reason,
  conditions,
  ctaText,
  onPress,
}: RejectionStatePanelProps) {
  return (
    <View style={{ paddingVertical: spacing['2xl'] }} className="items-center justify-center">
      <Text style={{ fontSize: 48, marginBottom: spacing.base }}>&#x26A0;&#xFE0F;</Text>

      <Text
        style={{
          fontFamily: typography.headlineFont,
          fontSize: 20,
          color: colors.onSurface,
          textAlign: 'center',
          marginBottom: spacing.sm,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontFamily: typography.bodyFont,
          fontSize: 14,
          color: colors.onSurfaceVariant,
          textAlign: 'center',
          lineHeight: 20,
          paddingHorizontal: spacing.xl,
          marginBottom: conditions ? spacing.lg : 0,
        }}
      >
        {reason}
      </Text>

      {conditions && conditions.length > 0 && (
        <View
          style={{
            width: '100%',
            paddingHorizontal: spacing['2xl'],
            marginBottom: spacing.xl,
          }}
        >
          {conditions.map((condition, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: spacing.xs,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  marginRight: spacing.sm,
                  color: condition.passed ? colors.tertiary : colors.error,
                }}
              >
                {condition.passed ? '\u2713' : '\u2717'}
              </Text>
              <Text
                style={{
                  fontFamily: typography.bodyFont,
                  fontSize: 14,
                  color: condition.passed ? colors.onSurfaceVariant : colors.onSurface,
                  flex: 1,
                }}
              >
                {condition.label}
              </Text>
            </View>
          ))}
        </View>
      )}

      {ctaText && onPress && (
        <Pressable onPress={onPress}>
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
