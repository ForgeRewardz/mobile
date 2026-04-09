import { ScrollView, Pressable, Text } from 'react-native'
import { colors, typography } from '@/theme/tokens'

interface FilterChipsProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function FilterChips({ options, selected, onChange }: FilterChipsProps) {
  const toggleChip = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {options.map((option) => {
        const isSelected = selected.includes(option)
        return (
          <Pressable
            key={option}
            onPress={() => toggleChip(option)}
            className="px-4 py-2 rounded-full"
            style={{
              backgroundColor: isSelected ? `${colors.primary}33` : colors.surfaceContainerHighest,
            }}
          >
            <Text
              style={{
                fontFamily: typography.labelFont,
                color: isSelected ? colors.primary : colors.onSurfaceVariant,
              }}
            >
              {option}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
