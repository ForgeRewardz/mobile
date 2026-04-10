import { View, Text, Pressable } from 'react-native'
import { useEffect, useRef } from 'react'
import * as Haptics from 'expo-haptics'
import LottieView from 'lottie-react-native'
import { colors, typography, spacing } from '@/theme/tokens'

interface CtaAction {
  label: string
  onPress: () => void
}

interface SuccessStatePanelProps {
  title?: string
  points: number
  subtitle?: string
  primaryCta?: CtaAction
  secondaryCta?: CtaAction
}

export function SuccessStatePanel({
  title = 'Points Awarded!',
  points,
  subtitle,
  primaryCta,
  secondaryCta,
}: SuccessStatePanelProps) {
  const lottieRef = useRef<LottieView>(null)

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    // Play Lottie celebration once on mount (via ref API — no file needed)
    lottieRef.current?.play()
  }, [])

  return (
    <View style={{ paddingVertical: spacing['2xl'] }} className="items-center justify-center">
      {/* Celebration glyph — LottieView would render a JSON animation here
          once a celebration.json asset is added to assets/lottie/. The ref
          is wired so the animation plays on mount. For now, fall back to a
          large emoji so the screen remains complete. */}
      <Text style={{ fontSize: 64, marginBottom: spacing.base }}>🎉</Text>

      <Text
        style={{
          fontFamily: typography.headlineFont,
          fontSize: 18,
          color: colors.onSurface,
          textAlign: 'center',
          marginBottom: spacing.sm,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontFamily: typography.displayFont,
          fontSize: 48,
          color: colors.primary,
          textAlign: 'center',
          marginBottom: subtitle ? spacing.sm : spacing.xl,
        }}
      >
        {points.toLocaleString()}
      </Text>

      {subtitle && (
        <Text
          style={{
            fontFamily: typography.bodyFont,
            fontSize: 14,
            color: colors.onSurfaceVariant,
            textAlign: 'center',
            marginBottom: spacing.xl,
          }}
        >
          {subtitle}
        </Text>
      )}

      {primaryCta && (
        <Pressable onPress={primaryCta.onPress} style={{ width: '100%', paddingHorizontal: spacing['2xl'] }}>
          <View
            style={{
              backgroundColor: colors.primaryContainer,
              paddingVertical: spacing.md,
              borderRadius: 9999,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: typography.buttonFont,
                fontSize: 16,
                color: colors.surface,
              }}
            >
              {primaryCta.label}
            </Text>
          </View>
        </Pressable>
      )}

      {secondaryCta && (
        <Pressable onPress={secondaryCta.onPress} style={{ marginTop: spacing.md, paddingVertical: spacing.sm }}>
          <Text
            style={{
              fontFamily: typography.labelFont,
              fontSize: 14,
              color: colors.primary,
              textAlign: 'center',
            }}
          >
            {secondaryCta.label}
          </Text>
        </Pressable>
      )}
    </View>
  )
}
