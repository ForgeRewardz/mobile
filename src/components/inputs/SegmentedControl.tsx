import { View, Pressable, Text } from 'react-native'
import { colors, typography, radii, spacing } from '@/theme/tokens'

interface SegmentedControlProps {
  segments: string[]
  selectedIndex: number
  onChange: (index: number) => void
}

export function SegmentedControl({ segments, selectedIndex, onChange }: SegmentedControlProps) {
  return (
    <View
      className="flex-row"
      style={{
        backgroundColor: colors.surfaceContainerHighest,
        borderRadius: radii.lg,
        padding: spacing.xs,
      }}
    >
      {segments.map((segment, index) => {
        const isActive = index === selectedIndex
        return (
          <Pressable
            key={segment}
            onPress={() => onChange(index)}
            className="flex-1 items-center justify-center"
            style={{
              backgroundColor: isActive ? colors.surfaceContainer : 'transparent',
              borderRadius: radii.md,
              paddingVertical: spacing.sm,
            }}
          >
            <Text
              style={{
                fontFamily: typography.labelFont,
                color: isActive ? colors.onSurface : colors.onSurfaceVariant,
              }}
            >
              {segment}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
