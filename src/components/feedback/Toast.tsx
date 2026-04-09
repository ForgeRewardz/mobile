import { Text, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useEffect } from 'react'
import { colors, typography, spacing, radii } from '@/theme/tokens'

type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  visible: boolean
  onDismiss: () => void
  duration?: number
}

const toastStyles: Record<ToastType, { backgroundColor: string; textColor: string }> = {
  success: {
    backgroundColor: `${colors.tertiary}33`, // 20% opacity
    textColor: colors.tertiary,
  },
  error: {
    backgroundColor: `${colors.error}33`, // 20% opacity
    textColor: colors.error,
  },
  info: {
    backgroundColor: colors.surfaceContainerHighest,
    textColor: colors.onSurface,
  },
}

export function Toast({ message, type = 'info', visible, onDismiss, duration = 3000 }: ToastProps) {
  const insets = useSafeAreaInsets()
  const style = toastStyles[type]

  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(onDismiss, duration)
      return () => clearTimeout(timer)
    }
  }, [visible, duration, onDismiss])

  if (!visible) return null

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={{
        position: 'absolute',
        top: insets.top + spacing.sm,
        left: spacing.base,
        right: spacing.base,
        zIndex: 9999,
      }}
    >
      <Pressable
        onPress={onDismiss}
        style={{
          backgroundColor: style.backgroundColor,
          borderRadius: radii.lg,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: typography.labelFont,
            fontSize: 14,
            color: style.textColor,
            textAlign: 'center',
          }}
        >
          {message}
        </Text>
      </Pressable>
    </Animated.View>
  )
}
