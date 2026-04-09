import { View, TextInput, Text, Pressable, ScrollView } from 'react-native'
import { useState } from 'react'
import { colors, typography, radii, spacing } from '@/theme/tokens'

interface SelectOption {
  label: string
  value: string
}

interface ParameterFieldRowProps {
  label: string
  name: string
  type: 'text' | 'number' | 'select'
  required: boolean
  value: string
  onChangeText: (text: string) => void
  options?: SelectOption[]
}

export function ParameterFieldRow({
  label,
  name,
  type,
  required,
  value,
  onChangeText,
  options = [],
}: ParameterFieldRowProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View style={{ gap: spacing.xs }}>
      <Text
        style={{
          fontFamily: typography.labelFont,
          color: colors.onSurfaceVariant,
        }}
      >
        {label}
        {required && <Text style={{ color: colors.error }}> *</Text>}
      </Text>

      {type === 'select' ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {options.map((option) => {
            const isSelected = value === option.value
            return (
              <Pressable
                key={option.value}
                onPress={() => onChangeText(option.value)}
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
                  {option.label}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      ) : (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType={type === 'number' ? 'numeric' : 'default'}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor={colors.onSurfaceVariant}
          accessibilityLabel={name}
          style={{
            backgroundColor: colors.surfaceContainerHighest,
            borderRadius: radii.sm,
            borderWidth: isFocused ? 1 : 0,
            borderColor: isFocused ? `${colors.primary}66` : 'transparent',
            paddingHorizontal: spacing.base,
            paddingVertical: spacing.md,
            fontFamily: typography.bodyFont,
            color: colors.onSurface,
          }}
        />
      )}
    </View>
  )
}
