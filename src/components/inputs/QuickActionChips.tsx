import { ScrollView, Pressable, Text } from 'react-native'
import { colors, typography } from '@/theme/tokens'

interface QuickActionChipsProps {
  chips?: string[]
  selected?: string
  onSelect: (chip: string) => void
}

const DEFAULT_CHIPS = ['Swap', 'Stake', 'Mint', 'Vote', 'Pay']

export function QuickActionChips({ chips = DEFAULT_CHIPS, selected, onSelect }: QuickActionChipsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {chips.map((chip) => {
        const isActive = chip === selected
        return (
          <Pressable
            key={chip}
            onPress={() => onSelect(chip)}
            accessibilityRole="button"
            accessibilityLabel={`Quick action: ${chip}`}
            accessibilityState={{ selected: isActive }}
            className="px-4 py-2 rounded-full"
            style={{
              backgroundColor: isActive ? colors.primary : colors.surfaceContainerHighest,
            }}
          >
            <Text
              style={{
                fontFamily: typography.labelFont,
                color: isActive ? colors.surface : colors.onSurfaceVariant,
              }}
            >
              {chip}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
