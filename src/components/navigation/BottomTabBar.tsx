import { Platform, Pressable, Text, View } from 'react-native'
import { BlurView } from 'expo-blur'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { colors, typography } from '@/theme/tokens'

const TAB_ICONS: Record<string, string> = {
  home: '\u2302',
  explore: '\uD83D\uDD0D',
  rewards: '\u2B50',
  profile: '\uD83D\uDC64',
}

/**
 * Custom bottom tab bar implementing the Kinetic Luminary glass aesthetic.
 *
 * - iOS: expo-blur glass effect.
 * - Android: semi-transparent dark background.
 * - No top border (design system "no-line" rule). Elevated via shadow.
 *
 * Wire into (tabs)/_layout.tsx via the `tabBar` prop:
 *   <Tabs tabBar={(props) => <BottomTabBar {...props} />} ...>
 */
export default function BottomTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const content = (
    <View
      style={{
        flexDirection: 'row',
        paddingBottom: insets.bottom,
        paddingTop: 10,
        paddingHorizontal: 8,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const label = typeof options.tabBarLabel === 'string' ? options.tabBarLabel : (options.title ?? route.name)
        const isFocused = state.index === index

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params)
          }
        }

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key })
        }

        const icon = TAB_ICONS[route.name] ?? '\u2022'

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}
          >
            <Text
              style={{
                fontSize: 20,
                color: isFocused ? colors.primary : colors.onSurfaceVariant,
                marginBottom: 2,
              }}
            >
              {icon}
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontFamily: isFocused ? typography.labelSemiBold : typography.bodyRegular,
                color: isFocused ? colors.primary : colors.onSurfaceVariant,
              }}
            >
              {label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )

  // Shared shadow style (replaces the forbidden top border)
  const shadowStyle = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  }

  if (Platform.OS === 'ios') {
    return (
      <View style={[{ overflow: 'hidden' }, shadowStyle]}>
        <BlurView intensity={60} tint="dark" style={{ overflow: 'hidden' }}>
          {content}
        </BlurView>
      </View>
    )
  }

  // Android fallback
  return <View style={[{ backgroundColor: 'rgba(24, 28, 34, 0.85)' }, shadowStyle]}>{content}</View>
}
