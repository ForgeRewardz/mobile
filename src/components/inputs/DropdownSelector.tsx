import { View, Text, Pressable, Modal, FlatList } from 'react-native'
import { useState } from 'react'
import { colors, typography, radii, spacing } from '@/theme/tokens'

interface DropdownOption {
  label: string
  value: string
}

interface DropdownSelectorProps {
  options: DropdownOption[]
  selected?: string
  onSelect: (value: string) => void
  placeholder?: string
  label?: string
}

export function DropdownSelector({
  options,
  selected,
  onSelect,
  placeholder = 'Select an option',
  label,
}: DropdownSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find((o) => o.value === selected)
  const displayText = selectedOption ? selectedOption.label : placeholder

  const handleSelect = (value: string) => {
    onSelect(value)
    setIsOpen(false)
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

      <Pressable
        onPress={() => setIsOpen(true)}
        className="flex-row items-center justify-between"
        style={{
          backgroundColor: colors.surfaceContainerHighest,
          borderRadius: radii.sm,
          paddingHorizontal: spacing.base,
          paddingVertical: spacing.md,
        }}
      >
        <Text
          style={{
            fontFamily: typography.bodyFont,
            color: selectedOption ? colors.onSurface : colors.onSurfaceVariant,
          }}
        >
          {displayText}
        </Text>
        <Text
          style={{
            color: colors.onSurfaceVariant,
            fontSize: 12,
          }}
        >
          {'\u25BE'}
        </Text>
      </Pressable>

      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setIsOpen(false)}
        >
          <Pressable
            onPress={() => {
              /* prevent close on inner press */
            }}
            style={{
              backgroundColor: colors.surfaceContainer,
              borderTopLeftRadius: radii.xl,
              borderTopRightRadius: radii.xl,
              maxHeight: '50%',
              paddingBottom: spacing['2xl'],
            }}
          >
            <View className="items-center" style={{ paddingVertical: spacing.md }}>
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: radii.full,
                  backgroundColor: colors.surfaceContainerHighest,
                }}
              />
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === selected
                return (
                  <Pressable
                    onPress={() => handleSelect(item.value)}
                    style={{
                      paddingHorizontal: spacing.base,
                      paddingVertical: spacing.md,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: typography.bodyFont,
                        color: isSelected ? colors.primary : colors.onSurface,
                      }}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                )
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}
