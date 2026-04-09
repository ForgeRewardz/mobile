import type { DimensionValue } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'
import { useEffect } from 'react'
import { colors, radii } from '@/theme/tokens'

type SkeletonVariant = 'text' | 'card' | 'circle' | 'row'

interface LoadingSkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  variant?: SkeletonVariant
}

const variantPresets: Record<SkeletonVariant, { width: DimensionValue; height: number; borderRadius: number }> = {
  text: { width: '100%', height: 16, borderRadius: radii.sm },
  card: { width: '100%', height: 120, borderRadius: radii['2xl'] },
  circle: { width: 48, height: 48, borderRadius: radii.full },
  row: { width: '100%', height: 72, borderRadius: radii.md },
}

export function LoadingSkeleton({ width, height, borderRadius, variant = 'text' }: LoadingSkeletonProps) {
  const opacity = useSharedValue(0.3)
  const preset = variantPresets[variant]

  const resolvedWidth: DimensionValue = (width as DimensionValue) ?? preset.width
  const resolvedHeight = height ?? preset.height
  const resolvedRadius = borderRadius ?? preset.borderRadius

  // For circle variant, width should equal height when not explicitly provided
  const finalWidth: DimensionValue = variant === 'circle' && width === undefined ? resolvedHeight : resolvedWidth

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 1000 }), -1, true)
  }, [opacity])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[
        {
          width: finalWidth,
          height: resolvedHeight,
          borderRadius: resolvedRadius,
          backgroundColor: colors.surfaceContainer,
        },
        animatedStyle,
      ]}
    />
  )
}
