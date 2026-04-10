import { useState, type RefObject } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { colors, typography, radii } from '@/theme/tokens'

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  onSubmit?: () => void
  placeholder?: string
  /** Optional ref forwarded to the underlying TextInput (e.g. for auto-focus). */
  inputRef?: RefObject<TextInput | null>
}

/**
 * Intent search input field.
 *
 * - Background: surfaceContainerHighest.
 * - Active state: ghost border via primary at 40 % opacity (box-shadow on iOS,
 *   a thin View wrapper on Android — no 1px solid border).
 * - Left: magnifying glass emoji. Right: clear button when text is present.
 */
export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'What do you want to do?',
  inputRef,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false)

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surfaceContainerHighest,
          borderRadius: radii.sm,
          paddingHorizontal: 12,
          paddingVertical: 10,
        },
        focused && {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 4,
          elevation: 4,
        },
      ]}
    >
      <Text style={{ fontSize: 16, marginRight: 8 }}>{'\uD83D\uDD0D'}</Text>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.onSurfaceVariant}
        returnKeyType="search"
        style={{
          flex: 1,
          fontFamily: typography.bodyRegular,
          fontSize: 14,
          color: colors.onSurface,
          padding: 0,
        }}
      />

      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityLabel="Clear search"
          accessibilityRole="button"
          hitSlop={8}
        >
          <Text
            style={{
              fontSize: 16,
              color: colors.onSurfaceVariant,
              marginLeft: 8,
            }}
          >
            {'\u2715'}
          </Text>
        </Pressable>
      )}
    </View>
  )
}
