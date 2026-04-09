import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, typography, spacing } from '@/theme/tokens'

interface StickyBottomCTAProps {
  label: string
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  secondaryLabel?: string
  onSecondaryPress?: () => void
}

export function StickyBottomCTA({
  label,
  onPress,
  disabled = false,
  loading = false,
  secondaryLabel,
  onSecondaryPress,
}: StickyBottomCTAProps) {
  const insets = useSafeAreaInsets()
  const isDisabled = disabled || loading

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        paddingTop: spacing.md,
        paddingHorizontal: spacing.base,
        paddingBottom: Math.max(insets.bottom, spacing.base),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={{
          backgroundColor: isDisabled ? colors.surfaceContainerHighest : colors.primaryContainer,
          paddingVertical: spacing.md,
          borderRadius: 9999,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 48,
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={isDisabled ? colors.onSurfaceVariant : colors.surface} />
        ) : (
          <Text
            style={{
              fontFamily: typography.buttonFont,
              fontSize: 16,
              color: isDisabled ? colors.onSurfaceVariant : colors.surface,
              textAlign: 'center',
            }}
          >
            {label}
          </Text>
        )}
      </Pressable>

      {secondaryLabel && onSecondaryPress && (
        <Pressable
          onPress={onSecondaryPress}
          style={{
            alignItems: 'center',
            paddingVertical: spacing.sm,
            marginTop: spacing.xs,
          }}
        >
          <Text
            style={{
              fontFamily: typography.labelFont,
              fontSize: 13,
              color: colors.primary,
              textAlign: 'center',
            }}
          >
            {secondaryLabel}
          </Text>
        </Pressable>
      )}
    </View>
  )
}
