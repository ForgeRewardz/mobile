import { View, TextInput, Text, Pressable } from 'react-native'
import { useState } from 'react'
import { colors, typography, radii, spacing } from '@/theme/tokens'

interface AmountInputProps {
  value: string
  onChangeText: (text: string) => void
  tokenSymbol: string
  tokenIcon?: string
  label?: string
  maxAmount?: number
}

export function AmountInput({ value, onChangeText, tokenSymbol, tokenIcon, label, maxAmount }: AmountInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  const handleMax = () => {
    if (maxAmount !== undefined) {
      onChangeText(String(maxAmount))
    }
  }

  return (
    <View>
      {label && (
        <Text
          className="mb-2"
          style={{
            fontFamily: typography.labelFont,
            color: colors.onSurfaceVariant,
          }}
        >
          {label}
        </Text>
      )}
      <View
        className="flex-row items-center"
        style={{
          backgroundColor: colors.surfaceContainerHighest,
          borderRadius: radii.sm,
          borderWidth: isFocused ? 1 : 0,
          borderColor: isFocused ? `${colors.primary}66` : 'transparent',
          paddingHorizontal: spacing.base,
          paddingVertical: spacing.md,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={colors.onSurfaceVariant}
          className="flex-1 text-center"
          style={{
            fontFamily: typography.displayFont,
            color: colors.primary,
            fontSize: 32,
          }}
        />
        <View className="flex-row items-center ml-3" style={{ gap: spacing.sm }}>
          {maxAmount !== undefined && (
            <Pressable
              onPress={handleMax}
              className="px-2 py-1 rounded"
              style={{
                backgroundColor: `${colors.primary}33`,
              }}
            >
              <Text
                style={{
                  fontFamily: typography.labelFont,
                  color: colors.primary,
                  fontSize: 12,
                }}
              >
                MAX
              </Text>
            </Pressable>
          )}
          <View className="flex-row items-center" style={{ gap: spacing.xs }}>
            {tokenIcon && <Text style={{ fontSize: 16 }}>{tokenIcon}</Text>}
            <Text
              style={{
                fontFamily: typography.labelFont,
                color: colors.onSurface,
                fontSize: 16,
              }}
            >
              {tokenSymbol}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}
