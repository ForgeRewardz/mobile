import { Pressable, Text, View } from 'react-native'
import { typography } from '@/theme/tokens'

interface TopAppBarProps {
  /** Greeting text shown on the left. Falls back to "Hi there". */
  greeting?: string
  /** Truncated wallet address to display instead of generic greeting. */
  walletAddress?: string
  /** Slot rendered between greeting and bell icon (e.g. PointsBadge). */
  rightContent?: React.ReactNode
  /** Called when the notification bell is pressed. */
  onNotificationPress?: () => void
}

/**
 * Top app bar for main tab screens.
 *
 * Left: greeting or truncated wallet address.
 * Center/Right: rightContent slot (for PointsBadge, etc.).
 * Right: notification bell icon.
 *
 * Background: surface (inherits from parent). No border.
 */
export function TopAppBar({ greeting, walletAddress, rightContent, onNotificationPress }: TopAppBarProps) {
  const displayText = walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : (greeting ?? 'Hi there')

  return (
    <View className="flex-row items-center justify-between bg-surface px-4 py-3">
      <Text style={{ fontFamily: typography.headlineSmall }} className="text-on-surface text-base">
        {displayText}
      </Text>

      <View className="flex-row items-center gap-3">
        {rightContent}

        <Pressable
          onPress={onNotificationPress}
          accessibilityLabel="Notifications"
          accessibilityRole="button"
          className="p-1"
        >
          <Text style={{ fontSize: 20 }}>{'\uD83D\uDD14'}</Text>
        </Pressable>
      </View>
    </View>
  )
}
