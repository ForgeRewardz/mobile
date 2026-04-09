import { Pressable, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { colors, typography } from '@/theme/tokens'

interface BackButtonProps {
  /** Override the default router.back() behavior. */
  onPress?: () => void
}

/**
 * Tertiary-style back navigation button.
 *
 * No background, primary-colored text, bold.
 * Defaults to `router.back()` when no `onPress` is supplied.
 */
export function BackButton({ onPress }: BackButtonProps) {
  const router = useRouter()

  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={8}
      style={{ padding: 4 }}
    >
      <Text
        style={{
          fontFamily: typography.labelBold,
          fontSize: 16,
          color: colors.primary,
        }}
      >
        {'\u2190 Back'}
      </Text>
    </Pressable>
  )
}
