import { View, Text, Pressable, Modal, ScrollView, useWindowDimensions } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useEffect } from 'react'
import { colors, typography, spacing, radii } from '@/theme/tokens'

interface BottomSheetProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  snapPoints?: number[]
}

const HANDLE_HEIGHT = 24
const DEFAULT_SNAP = 0.5

export function BottomSheet({ visible, onClose, title, children, snapPoints }: BottomSheetProps) {
  const { height: screenHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const translateY = useSharedValue(screenHeight)

  const sheetHeight = screenHeight * (snapPoints?.[0] ?? DEFAULT_SNAP)

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 })
    } else {
      translateY.value = withTiming(screenHeight, { duration: 250 })
    }
  }, [visible, screenHeight, translateY])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1 }}>
        {/* Backdrop */}
        <Pressable
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        />

        {/* Sheet */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: sheetHeight + insets.bottom,
              backgroundColor: colors.surfaceContainer,
              borderTopLeftRadius: radii['2xl'],
              borderTopRightRadius: radii['2xl'],
            },
            animatedStyle,
          ]}
        >
          {/* Handle bar */}
          <View
            style={{
              height: HANDLE_HEIGHT,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.surfaceContainerHighest,
              }}
            />
          </View>

          {/* Title */}
          {title && (
            <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.md }}>
              <Text
                style={{
                  fontFamily: typography.headlineMdFont,
                  fontSize: 18,
                  color: colors.onSurface,
                }}
              >
                {title}
              </Text>
            </View>
          )}

          {/* Content */}
          <ScrollView
            style={{ flex: 1, paddingHorizontal: spacing.base }}
            contentContainerStyle={{ paddingBottom: insets.bottom + spacing.base }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  )
}
